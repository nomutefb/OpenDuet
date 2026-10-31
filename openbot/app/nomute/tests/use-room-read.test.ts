import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { Window } from "happy-dom";
import {
  act,
  createElement,
  Fragment,
  StrictMode,
  useState,
  useSyncExternalStore,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { createReadState, type SeenMarker } from "../data/read-local.ts";
import { useRoomRead } from "../data/use-room-read.ts";

let dom: Window;
const roots: Root[] = [];
const globals = new Map<string, PropertyDescriptor | undefined>();

beforeEach(() => {
  dom = new Window({ url: "https://office.test/" });
  for (const [key, value] of Object.entries({
    window: dom,
    document: dom.document,
    navigator: dom.navigator,
    HTMLElement: dom.HTMLElement,
    Node: dom.Node,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  }
});

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  await dom.happyDOM.abort();
  for (const [key, previous] of globals) {
    if (previous) Object.defineProperty(globalThis, key, previous);
    else Reflect.deleteProperty(globalThis, key);
  }
  globals.clear();
});

function fixture() {
  const writes: { room: string; marker: SeenMarker }[] = [];
  let fail = false;
  const state = createReadState({
    now: () => 1_000,
    refresh: () => {},
    write: async (room, marker) => {
      writes.push({ room, marker });
      if (fail) {
        fail = false;
        throw new Error("offline");
      }
      return marker;
    },
  });
  return {
    state,
    writes,
    failNext: () => {
      fail = true;
    },
  };
}

type State = ReturnType<typeof createReadState>;
type Props = {
  state: State;
  room?: string;
  active?: boolean;
  ready?: boolean;
  failed?: boolean;
  ts?: number;
};

function Badge({
  state,
  room,
  ts,
  name,
}: {
  state: State;
  room: string;
  ts: number;
  name: string;
}) {
  useSyncExternalStore(state.subscribe, state.getSnapshot, state.getSnapshot);
  return createElement(
    "output",
    { "data-badge": name },
    state.count(room, ts, 0),
  );
}

function Chat({
  state,
  room = "a",
  active = true,
  ready = true,
  failed = false,
  ts = 100,
}: Props) {
  const [error, setError] = useState("");
  useRoomRead(state, room, active, ready, failed, ts, setError);
  return createElement(
    Fragment,
    null,
    createElement(Badge, { state, room, ts, name: "list" }),
    createElement(Badge, { state, room, ts, name: "faces" }),
    createElement("p", { role: "alert" }, error),
  );
}

async function mount(props: Props, strict = false) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  const render = async (next: Props) => {
    await act(async () => {
      const chat = createElement(Chat, next);
      root.render(strict ? createElement(StrictMode, null, chat) : chat);
      await setImmediate();
    });
  };
  await render(props);
  return { render, container, root };
}

test("retained inactive room can be selected and read without cleanup cancelling its new entry", async () => {
  const { state, writes } = fixture();
  await state.unread("a", 100);
  const view = await mount({ state, active: false });
  await act(async () => {
    state.enter("a", 100);
  });
  assert.equal(
    writes.length,
    1,
    "inactive chat must not POST or cancel the new entry",
  );
  assert.equal(state.count("a", 100, 0), 0);
  await view.render({ state, active: true });
  assert.deepEqual(
    writes.map((w) => w.marker.ts),
    [99, 100],
  );
  assert.deepEqual(
    [...view.container.querySelectorAll("output")].map((el) => el.textContent),
    ["0", "0"],
  );
});

test("StrictMode cold entry waits for the previous seen snapshot and commits exactly once", async () => {
  const { state, writes } = fixture();
  await state.unread("a", 100);
  state.enter("a", 100);
  const view = await mount({ state, ready: false }, true);
  assert.equal(writes.length, 1, "old seen can be read before any new POST");
  assert.equal(
    state.count("a", 100, 0),
    0,
    "StrictMode setup/cleanup keeps staged entry",
  );
  await view.render({ state, ready: true });
  assert.deepEqual(
    writes.map((w) => w.marker.ts),
    [99, 100],
  );
});

test("manual unread updates both mounted subscribers and survives new messages and modal visibility", async () => {
  const { state, writes } = fixture();
  const view = await mount({ state });
  await act(async () => {
    await state.unread("a", 100);
  });
  assert.deepEqual(
    [...view.container.querySelectorAll("output")].map((el) => el.textContent),
    ["-1", "-1"],
  );
  await view.render({ state, ts: 200 });
  await view.render({ state, ts: 200, active: false });
  await view.render({ state, ts: 200, active: true });
  assert.deepEqual(
    writes.map((w) => w.marker.ts),
    [100, 99],
  );
  assert.equal(state.count("a", 200, 0), -1);
});

test("same-room selection wakes the mounted chat without a route or timestamp change", async () => {
  const { state, writes } = fixture();
  const view = await mount({ state });
  await act(async () => {
    await state.unread("a", 100);
  });
  await act(async () => {
    state.enter("a", 100);
    await setImmediate();
  });
  assert.deepEqual(
    writes.map((w) => w.marker.ts),
    [100, 99, 100],
  );
  assert.equal(view.container.querySelector("output")?.textContent, "0");
});

test("failed reentry rolls back and renders an error without an effect retry loop", async () => {
  const { state, writes, failNext } = fixture();
  const view = await mount({ state });
  await act(async () => {
    await state.unread("a", 100);
  });
  failNext();
  await act(async () => {
    state.enter("a", 100);
    await setImmediate();
  });
  await act(async () => {
    await setImmediate();
  });
  assert.equal(writes.length, 3);
  assert.equal(state.count("a", 100, 0), -1);
  assert.match(
    view.container.querySelector('[role="alert"]')?.textContent || "",
    /저장하지/,
  );
});

test("message load failure cancels a staged entry without writing a read marker", async () => {
  const { state, writes } = fixture();
  await state.unread("a", 100);
  state.enter("a", 100);
  const view = await mount({ state, ready: false });
  await view.render({ state, ready: false, failed: true });
  assert.equal(writes.length, 1);
  assert.equal(state.count("a", 100, 0), -1);
});

test("leaving a cold active room cancels only its staged read", async () => {
  const { state, writes } = fixture();
  await state.unread("a", 100);
  state.enter("a", 100);
  const view = await mount({ state, ready: false });
  await view.render({ state, ready: false, active: false });
  assert.equal(state.count("a", 100, 0), -1);
  assert.equal(writes.length, 1);
});

test("entering another room leaves the inactive room's manual unread intact", async () => {
  const { state, writes } = fixture();
  await state.unread("a", 100);
  const view = await mount({ state, room: "a", active: false });
  await act(async () => {
    state.enter("b", 200);
  });
  await view.render({ state, room: "b", ts: 200, active: true });
  assert.equal(state.count("a", 100, 0), -1);
  assert.deepEqual(
    writes.map((w) => [w.room, w.marker.ts]),
    [
      ["a", 99],
      ["b", 200],
    ],
  );
});

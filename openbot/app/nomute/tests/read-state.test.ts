import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { createReadState, type SeenMarker } from "../data/read-local.ts";

function fixture(seenAt = 0) {
  const requests: {
    room: string;
    marker: SeenMarker;
    accept: (marker?: SeenMarker) => void;
    fail: () => void;
  }[] = [];
  let refreshes = 0;
  const state = createReadState({
    now: () => 1_000,
    seenAt: () => seenAt,
    refresh: () => {
      refreshes++;
    },
    write: (room, marker) =>
      new Promise((resolve, reject) => {
        requests.push({
          room,
          marker,
          accept: (ack = marker) => resolve(ack),
          fail: () => reject(new Error("offline")),
        });
      }),
  });
  const accept = async (task: Promise<boolean>) => {
    await setImmediate();
    requests.at(-1)!.accept();
    return task;
  };
  return { state, requests, accept, refreshes: () => refreshes };
}

test("previously opened room becomes unread immediately and explicit reentry reads it", async () => {
  const { state, accept } = fixture();
  await accept(state.read("a", 100));
  assert.equal(state.count("a", 100, 7), 0);
  const unread = state.unread("a", 100);
  assert.equal(state.count("a", 100, 0), -1);
  await accept(unread);
  assert.equal(
    state.count("a", 100, 0),
    -1,
    "stale rooms response cannot clear manual unread",
  );
  const read = state.read("a", 100, true);
  assert.equal(
    state.count("a", 100, 7),
    0,
    "entry clears the badge before the server responds",
  );
  await accept(read);
});

test("local reads stop at known message time even when the device clock is ahead", async () => {
  const { state, accept } = fixture();
  await accept(state.read("a", 100));
  assert.equal(state.count("a", 100, 2), 0);
  assert.equal(state.count("a", 101, 2), 2);
  assert.equal(
    state.count("a", 200, -1),
    -1,
    "cached tail does not consume newer room messages",
  );
});

test("an in-flight automatic read cannot overwrite unread or consume a new message", async () => {
  const { state, requests } = fixture();
  const first = state.read("a", 100);
  await setImmediate();
  const unread = state.unread("a", 100);
  assert.equal(await state.read("a", 200), false);
  assert.equal(state.count("a", 200, 0), -1);
  assert.equal(requests.length, 1);
  requests[0].accept();
  await first;
  await setImmediate();
  assert.equal(state.count("a", 200, 0), -1);
  assert.equal(requests[1].marker.ts, 99);
  requests[1].accept();
  await unread;
});

test("failure of an obsolete request leaves the newest unread intent intact", async () => {
  const { state, requests, accept } = fixture();
  const first = state.read("a", 100);
  await setImmediate();
  const unread = state.unread("a", 100);
  requests[0].fail();
  assert.equal(await first, false);
  assert.equal(state.count("a", 100, 0), -1);
  assert.equal(state.error(), "");
  await accept(unread);
});

test("two failed requests do not restore an earlier failed optimistic read", async () => {
  const { state, requests, refreshes } = fixture();
  const first = state.read("a", 100);
  await setImmediate();
  const second = state.unread("a", 100);
  requests[0].fail();
  await first;
  await setImmediate();
  const rejected = assert.rejects(second, /offline/);
  requests[1].fail();
  await rejected;
  assert.equal(state.count("a", 100, 3), 3);
  assert.equal(refreshes(), 2);
  assert.notEqual(state.error(), "");
});

test("failed unread rolls back to acknowledged read and refreshes the server queries", async () => {
  const { state, requests, accept, refreshes } = fixture();
  await accept(state.read("a", 100));
  const unread = state.unread("a", 100);
  assert.equal(state.count("a", 100, 0), -1);
  await setImmediate();
  const rejected = assert.rejects(unread, /offline/);
  requests.at(-1)!.fail();
  await rejected;
  assert.equal(state.count("a", 100, 4), 0);
  assert.equal(refreshes(), 2);
});

test("failed explicit read restores acknowledged unread, including its auto-read guard", async () => {
  const { state, requests, accept } = fixture();
  await accept(state.unread("a", 100));
  const read = state.read("a", 100, true);
  await setImmediate();
  const rejected = assert.rejects(read, /offline/);
  requests.at(-1)!.fail();
  await rejected;
  assert.equal(state.count("a", 100, 0), -1);
  assert.equal(await state.read("a", 200), false);
  await accept(state.read("a", 200, true));
  assert.equal(state.error(), "");
});

test("late unread acknowledgement cannot replace a newer explicit read", async () => {
  const { state, requests, accept } = fixture();
  const unread = state.unread("a", 100);
  await setImmediate();
  const read = state.read("a", 200, true);
  requests[0].accept();
  await unread;
  assert.equal(state.count("a", 200, 8), 0);
  await accept(read);
  assert.equal(requests[1].marker.ts, 200);
});

test("rapid toggles skip unsent superseded intent and preserve final server order", async () => {
  const { state, requests, accept } = fixture();
  const first = state.unread("a", 100);
  await setImmediate();
  const middle = state.read("a", 100, true);
  const last = state.unread("a", 200);
  requests[0].accept();
  await first;
  assert.equal(await middle, false);
  await accept(last);
  assert.deepEqual(
    requests.map((r) => r.marker.ts),
    [99, 199],
  );
  assert.equal(state.count("a", 200, 0), -1);
});

test("same-millisecond read then unread has increasing at, not a lower-ts tie", async () => {
  const { state, requests, accept } = fixture();
  await accept(state.read("a", 100));
  await accept(state.unread("a", 100));
  assert.deepEqual(
    requests.map((r) => r.marker),
    [
      { ts: 100, at: 1_000 },
      { ts: 99, at: 1_001 },
    ],
  );
});

test("a marker learned from the server also advances the write clock", async () => {
  const { state, requests, accept } = fixture(5_000);
  await accept(state.unread("a", 100));
  assert.equal(requests[0].marker.at, 5_001);
});

test("HTTP success that did not accept the marker removes the local overlay", async () => {
  const { state, requests, accept, refreshes } = fixture();
  await accept(state.read("a", 100));
  const unread = state.unread("a", 100);
  await setImmediate();
  const rejected = assert.rejects(unread, /저장하지/);
  requests.at(-1)!.accept({ ts: 80, at: 9_000 });
  await rejected;
  assert.equal(
    state.count("a", 100, 2),
    2,
    "even an earlier confirmed overlay is stale after rejection",
  );
  await accept(state.unread("a", 100));
  assert.equal(requests.at(-1)!.marker.at, 9_001);
  assert.equal(refreshes(), 3);
});

test("writes for different rooms share a queue and both refresh after acknowledgement", async () => {
  const { state, requests, accept, refreshes } = fixture();
  const a = state.read("a", 100);
  const b = state.read("b", 200);
  await setImmediate();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].room, "a");
  requests[0].accept();
  await a;
  await accept(b);
  assert.deepEqual(
    requests.map((r) => r.room),
    ["a", "b"],
  );
  assert.equal(refreshes(), 2);
});

test("a failed room write does not block later writes for another room", async () => {
  const { state, requests, accept } = fixture();
  const a = state.read("a", 100);
  const rejected = assert.rejects(a, /offline/);
  const b = state.unread("b", 200);
  await setImmediate();
  requests[0].fail();
  await rejected;
  await accept(b);
  assert.equal(state.count("b", 200, 0), -1);
});

test("self/system last message still gets a manual unread dot when server count is zero", async () => {
  const { state, accept } = fixture();
  await accept(state.unread("a", 100));
  assert.equal(state.count("a", 100, 0), -1);
  assert.equal(state.count("a", 100, 5), 5);
});

test("empty rooms can be marked unread then explicitly read, without automatic empty reads", async () => {
  for (const ts of [undefined, null, 0]) {
    const { state, requests, accept } = fixture();
    assert.equal(await state.read("a", ts), false);
    assert.equal(requests.length, 0);
    await accept(state.unread("a", ts));
    await accept(state.read("a", ts, true));
    assert.equal(state.count("a", undefined, 0), 0);
    assert.equal(requests.at(-1)!.marker.ts, 0);
  }
});

test("duplicate or older automatic reads do not move read-through backwards", async () => {
  const { state, requests, accept } = fixture();
  await accept(state.read("a", 200));
  assert.equal(await state.read("a", 100), false);
  assert.equal(await state.read("a", 200), false);
  assert.equal(requests.length, 1);
  assert.equal(state.count("a", 201, 1), 1);
});

test("all list subscribers receive optimistic and rollback revisions without query mutation", async () => {
  const { state, requests } = fixture();
  const list: number[] = [],
    faces: number[] = [];
  const unsubscribe = state.subscribe(() =>
    list.push(state.count("a", 100, 0)),
  );
  state.subscribe(() => faces.push(state.count("a", 100, 0)));
  const before = state.getSnapshot();
  const unread = state.unread("a", 100);
  assert.ok(state.getSnapshot() > before);
  assert.equal(
    state.getSnapshot(),
    state.getSnapshot(),
    "snapshot remains stable between changes",
  );
  await setImmediate();
  const rejected = assert.rejects(unread, /offline/);
  requests[0].fail();
  await rejected;
  assert.deepEqual(list, [-1, 0]);
  assert.deepEqual(faces, [-1, 0]);
  unsubscribe();
  const retry = state.unread("a", 100);
  await setImmediate();
  requests[1].accept();
  await retry;
  assert.deepEqual(list, [-1, 0]);
  assert.deepEqual(faces, [-1, 0, -1]);
});

test("entry clears the badge but does not POST before the chat captures previous seen", async () => {
  const { state, requests, accept } = fixture();
  state.enter("a", 200);
  assert.equal(state.count("a", 200, 3), 0);
  await setImmediate();
  assert.equal(
    requests.length,
    0,
    "cold/delayed seen query must retain the unread-jump anchor",
  );
  const previousSeen = 100; // Chat captures this from GET seen before calling read.
  await accept(state.read("a", 200));
  assert.equal(previousSeen, 100);
  assert.equal(requests[0].marker.ts, 200);
});

test("same-room reselect wakes a staged entry; automatic writes do not change entry revision", async () => {
  const { state, accept } = fixture();
  await accept(state.unread("a", 100));
  const before = state.getEntrySnapshot();
  state.enter("a", 100);
  assert.ok(state.getEntrySnapshot() > before);
  const entered = state.getEntrySnapshot();
  await accept(state.read("a", 100));
  assert.equal(
    state.getEntrySnapshot(),
    entered,
    "ack/rollback cannot create an automatic retry loop",
  );
  assert.equal(state.count("a", 100, 1), 0);
});

test("manual unread after staged entry wins over later message/seen readiness", async () => {
  const { state, requests, accept } = fixture();
  state.enter("a", 100);
  const unread = state.unread("a", 100);
  assert.equal(await state.read("a", 200), false);
  await accept(unread);
  assert.deepEqual(
    requests.map((r) => r.marker.ts),
    [99],
  );
  assert.equal(state.count("a", 200, 0), -1);
});

test("leaving or failing to load a staged room restores acknowledged state", async () => {
  const { state, accept } = fixture();
  await accept(state.unread("a", 100));
  state.enter("a", 100);
  state.cancelEntry("a");
  assert.equal(state.count("a", 100, 0), -1);
  state.enter("b", 200);
  state.cancelEntry("b");
  assert.equal(state.count("b", 200, 4), 4);
});

test("selecting another room does not release the previous room's unread latch", async () => {
  const { state, accept } = fixture();
  await accept(state.unread("a", 100));
  state.enter("b", 200);
  state.cancelEntry("a");
  await accept(state.read("b", 200));
  assert.equal(state.count("a", 100, 0), -1);
  assert.equal(state.count("b", 200, 3), 0);
});

test("a ready empty-room entry can persist zero, but an unresolved empty load cannot", async () => {
  const { state, requests, accept } = fixture();
  await accept(state.unread("a", null));
  state.enter("a", null);
  assert.equal(await state.read("a", undefined), false);
  await accept(state.read("a", 0));
  assert.equal(requests.at(-1)!.marker.ts, 0);
  assert.equal(state.count("a", undefined, 0), 0);
});

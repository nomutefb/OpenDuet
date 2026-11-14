import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { afterEach, beforeEach, test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { Window } from "happy-dom";
import { act, createElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { QueryClient as QueryClientType } from "@tanstack/react-query";

// 실제 시트·저장 단추·서버 응답 처리를 함께 검사한다. 네트워크만 가짜 응답이다.
const require = createRequire(import.meta.url);
const queryModule = pathToFileURL(require.resolve("@tanstack/react-query")).href;
const { QueryClient, QueryClientProvider } = await import(queryModule);
const compiled = await build({
  entryPoints: [fileURLToPath(new URL("../ui/room-routine.tsx", import.meta.url))],
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  loader: { ".css": "empty" },
  plugins: [{
    name: "same-runtime-and-decoration",
    setup(builder) {
      builder.onResolve({ filter: /^(?:react(?:-dom)?(?:\/.*)?|@tanstack\/react-query)$/ }, (args) => ({
        path: pathToFileURL(require.resolve(args.path)).href,
        external: true,
      }));
      builder.onResolve({ filter: /^(?:@\/components\/duet\/icons|\.\/faces)$/ }, (args) => ({
        path: args.path,
        namespace: "decoration",
      }));
      builder.onLoad({ filter: /.*/, namespace: "decoration" }, () => ({
        contents: "export const DuetIcon = () => null; export const FaceImg = () => null;",
      }));
    },
  }],
});
const { RoomRoutineSheet } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString("base64")}`
);

const ROOM = { id: "routine-test", name: "저장 검사", kind: "group", members: [] };
const ORIGINAL = "이 글과 주기는 저장 실패 뒤에도 남아야 해";
const TIMER = { mode: "days", days: 1, times: ["09:00"], text: ORIGINAL, skip: [], on: true };
let dom: Window;
let client: QueryClientType;
let root: Root;
let posts: Record<string, unknown>[];
let reply: () => Promise<Response>;
let closes: string[];
const globals = new Map<string, PropertyDescriptor | undefined>();
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { "content-type": "application/json" },
});

beforeEach(() => {
  dom = new Window({ url: "https://office.test/" });
  posts = [];
  closes = [];
  reply = async () => json({ ok: true });
  const fakeFetch = async (url: string, init?: RequestInit) => {
    assert.equal(url, "/api/office/room-timers", "예상 밖의 네트워크 요청은 보내지 않는다");
    if (init?.method === "POST") {
      posts.push(JSON.parse(String(init.body)));
      return reply();
    }
    return json({ timers: { [ROOM.id]: TIMER } });
  };
  for (const [key, value] of Object.entries({
    window: dom, document: dom.document, navigator: dom.navigator,
    HTMLElement: dom.HTMLElement, Node: dom.Node,
    fetch: fakeFetch, IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  client = new QueryClient({ defaultOptions: {
    queries: { retry: false, gcTime: Infinity }, mutations: { retry: false },
  } });
  client.setQueryData(["nomute", "room-timers"], { [ROOM.id]: TIMER });
  client.setQueryData(["nomute", "people"], []);
});

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  client.clear();
  await dom.happyDOM.abort();
  for (const [key, previous] of globals) {
    if (previous) Object.defineProperty(globalThis, key, previous);
    else Reflect.deleteProperty(globalThis, key);
  }
  globals.clear();
});

const button = () => document.querySelector<HTMLButtonElement>(".nm-rr-save")!;
const dialogs = () => document.querySelectorAll('[role="dialog"]').length;
const stage = () => button()?.dataset.stage;
async function mount() {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  function Host() {
    const [open, setOpen] = useState(true);
    return open ? createElement(RoomRoutineSheet, { room: ROOM, onClose: () => {
      closes.push(stage() || "missing");
      setOpen(false);
    } }) : null;
  }
  await act(async () => {
    root.render(createElement(QueryClientProvider, { client }, createElement(Host)));
  });
  assert.equal(dialogs(), 1);
  assert.equal(stage(), "idle");
}
async function click(node: Element) {
  await act(async () => node.dispatchEvent(new dom.MouseEvent("click", { bubbles: true }) as unknown as Event));
}
async function until(check: () => boolean, message: string) {
  const deadline = Date.now() + 4_000;
  while (!check() && Date.now() < deadline) await act(async () => { await delay(20); });
  assert.equal(check(), true, message);
}

test("루틴 저장은 응답을 기다린 뒤 게이지 → 체크 → 닫힘, 그동안 중복 저장 없음", async () => {
  let resolve!: (value: Response) => void;
  reply = () => new Promise((done) => { resolve = done; });
  await mount();
  await click(button());
  assert.equal(stage(), "fill");
  assert.equal(dialogs(), 1);
  assert.equal(closes.length, 0);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].text, ORIGINAL);
  await click(button());
  assert.equal(posts.length, 1, "저장 응답 전 두 번째 클릭을 보내지 않는다");
  await act(async () => { resolve(json({ ok: true })); });
  await until(() => stage() === "ok", "성공 체크가 보여야 한다");
  assert.equal(dialogs(), 1, "체크를 보여 주는 동안 창이 남는다");
  assert.equal(closes.length, 0);
  await click(button());
  assert.equal(posts.length, 1, "체크 중 두 번째 클릭도 보내지 않는다");
  await until(() => dialogs() === 0, "체크 뒤 창이 닫혀야 한다");
  assert.deepEqual(closes, ["ok"], "체크를 보인 뒤 한 번만 닫는다");
});

test("루틴 저장 실패는 창·글·고른 주기를 유지하고 까닭을 보여 준다", async () => {
  reply = async () => json({ ok: false, why: "검사용 저장 거절" }, 503);
  await mount();
  const quick = [...document.querySelectorAll("button")].find((b) => b.textContent === "3시간마다")!;
  await click(quick);
  await click(button());
  await until(() => stage() === "err", "실패 단계를 보여야 한다");
  assert.equal(dialogs(), 1);
  assert.equal(document.querySelector<HTMLTextAreaElement>("textarea")?.value, ORIGINAL);
  assert.equal(document.querySelector<HTMLInputElement>('[aria-label="몇 시간마다"]')?.value, "3");
  assert.match(document.querySelector('[role="alert"]')?.textContent || "", /검사용 저장 거절/);
  assert.deepEqual(closes, []);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].mode, "hours");
  assert.equal(posts[0].every, 3);
  await until(() => stage() === "idle", "오류 표시 뒤 다시 저장할 수 있어야 한다");
  assert.equal(dialogs(), 1, "오류 표시 시간이 끝나도 창은 닫지 않는다");
  assert.equal(document.querySelector<HTMLTextAreaElement>("textarea")?.value, ORIGINAL);
  assert.match(document.querySelector('[role="alert"]')?.textContent || "", /검사용 저장 거절/);
  assert.deepEqual(closes, []);
});

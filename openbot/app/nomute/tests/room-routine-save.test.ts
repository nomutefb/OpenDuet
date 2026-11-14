import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { mock } from "bun:test";
import { setTimeout as delay } from "node:timers/promises";
import { Window } from "happy-dom";
import { act, createElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { QueryClient as QueryClientType } from "@tanstack/react-query";

// 실제 시트·저장 단추·서버 응답 처리를 함께 검사한다. 네트워크만 가짜 응답이다.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// 꾸밈(아이콘 · 얼굴)만 빈 것으로 바꾸고 시트는 원본 그대로 읽음(빠르 11-14 · 앞 판 = esbuild 로 묶어 읽음 → 기차 자리에 esbuild 가 없어 이 파일이 통째로 안 떴음)
mock.module("@/components/duet/icons", () => ({ DuetIcon: () => null }));
mock.module("../ui/faces", () => ({ FaceImg: () => null }));
const { RoomRoutineSheet } = await import("../ui/room-routine.tsx");

const ROOM = { id: "routine-test", name: "저장 검사", kind: "group", members: ["카리나"] };
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
  client.setQueryData(["nomute", "people"], [{ who: "카리나", kind: "bot", bot: "karina" }]);
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
function fieldsDisabled(expected: boolean) {
  const fields = document.querySelector<HTMLFieldSetElement>(".nm-rr-fields");
  assert.equal(fields?.tagName, "FIELDSET");
  assert.equal(fields?.disabled, expected);
  // happy-dom은 fieldset 비활성의 :disabled 상속을 구현하지 않는다.
  // 합성 click을 보내면 잠금을 우회하므로, 실제 브라우저가 잠그는 DOM 범위를 검사한다.
  assert.equal(fields?.querySelectorAll("legend").length, 0, "첫 legend의 비활성 예외에 입력이 없어야 한다");
  const editors = document.querySelectorAll(
    ".nm-rr-b input, .nm-rr-b textarea, .nm-rr-b select, .nm-rr-b [role=switch], " +
    ".nm-rr-quick button, .nm-rr-seg button, .nm-rr-wd button, .nm-rr-times button, " +
    ".nm-rr-num button, .nm-rr-crew button",
  );
  assert.ok(editors.length > 0);
  assert.equal(document.querySelectorAll(".nm-rr-crew button").length, 1, "멤버 선택도 검사한다");
  for (const control of editors) {
    assert.equal(fields?.contains(control), true, "저장할 값을 바꾸는 입력은 모두 잠금 안에 있어야 한다");
    assert.equal(!!control.closest("fieldset[disabled]"), expected, "fieldset에서 상속하는 입력 잠금");
  }
  assert.equal(document.querySelector<HTMLButtonElement>(".nm-rr-del")?.disabled, expected);
}
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

test("루틴 저장은 게이지 → 체크 → 닫힘, 그동안 모든 입력과 중복 저장을 잠금", async () => {
  let resolve!: (value: Response) => void;
  reply = () => new Promise((done) => { resolve = done; });
  await mount();
  fieldsDisabled(false);
  await click(button());
  assert.equal(stage(), "fill");
  assert.equal(dialogs(), 1);
  assert.equal(closes.length, 0);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].text, ORIGINAL);
  fieldsDisabled(true);
  await click(button());
  assert.equal(posts.length, 1, "저장 응답 전 두 번째 클릭을 보내지 않는다");
  await act(async () => { resolve(json({ ok: true })); });
  await until(() => stage() === "ok", "성공 체크가 보여야 한다");
  assert.equal(dialogs(), 1, "체크를 보여 주는 동안 창이 남는다");
  assert.equal(closes.length, 0);
  fieldsDisabled(true);
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
  fieldsDisabled(false);
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
  fieldsDisabled(false);
  const daily = [...document.querySelectorAll("button")].find((b) => b.textContent === "매일 아침")!;
  await click(daily);
  assert.equal(document.querySelector<HTMLInputElement>('[aria-label="며칠마다"]')?.value, "1", "실패 뒤 다시 수정할 수 있다");
  assert.equal(posts.length, 1, "다시 수정해도 저절로 저장하지 않는다");
});

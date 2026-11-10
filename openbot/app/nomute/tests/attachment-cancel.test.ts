// 게이지 누름 = 전송 취소(형 11-10 12:18 「그리고 파일 전송중에 게이지 클릭하면 전공 취소 가능하게」)
import assert from "node:assert/strict";
import { test } from "node:test";
import { createAttachmentSender, type SendInput, type SendReply } from "../data/attachment-send.ts";
import { input, uploadOK } from "./attachment-fixture.ts";

type Upload = (snapshot: SendInput, onProgress?: (ratio: number) => void, signal?: AbortSignal) => Promise<SendReply>;
function sender(upload: Upload) {
  const calls = { upload: 0, body: 0, released: [] as string[][] };
  const state = createAttachmentSender({
    upload: (snapshot, onProgress, signal) => { calls.upload++; return upload(snapshot, onProgress, signal); },
    body: async () => { calls.body++; throw new Error("body must not be sent"); },
    release: (ids) => { calls.released.push(ids); },
    refresh: () => {},
  });
  return { state, calls };
}
// 진짜 XHR 처럼: 끊으면 AbortError 로 reject · 안 끊으면 손으로 끝냄
function pending() {
  let finish!: (r: SendReply) => void, progress!: (p: number) => void;
  const upload: Upload = (_s, onProgress, signal) => new Promise<SendReply>((resolve, reject) => {
    progress = (p) => onProgress?.(p);
    finish = resolve;
    signal?.addEventListener("abort", () => reject(new DOMException("전송 취소", "AbortError")), { once: true });
  });
  return { upload, finish: (r: SendReply) => finish(r), progress: (p: number) => progress(p) };
}
const tick = () => new Promise((r) => setTimeout(r, 0));

test("gauge click while uploading aborts the request and leaves a 취소됨 card", async () => {
  const p = pending(), { state, calls } = sender(p.upload);
  state.start(input());
  await tick();
  p.progress(0.4);
  const card = state.forRoom("a")[0];
  assert.equal(card.phase, "uploading");
  assert.equal(state.cancel(card.id), true);
  await tick();
  const after = state.forRoom("a")[0];
  assert.equal(after.phase, "cancelled");
  assert.equal(calls.body, 0, "본문을 따로 보내지 않음");
  assert.deepEqual(calls.released, [], "원본은 이 탭에 보관(다시 쓸 수 있게)");
  assert.equal(state.cancel(card.id), false, "두 번 누름 = 무시");
});

test("after the gauge reaches 100% a click does nothing and the send completes", async () => {
  const p = pending(), { state, calls } = sender(p.upload);
  const draft = input();
  draft.text = "";
  state.start(draft);
  await tick();
  p.progress(1);
  const card = state.forRoom("a")[0];
  assert.equal(state.cancel(card.id), false, "다 올라간 뒤엔 안 끊음 = 서버가 받은 걸 반쯤 버리지 않음");
  p.finish(uploadOK());
  await tick();
  assert.deepEqual(state.forRoom("a"), [], "그대로 끝까지 감");
  assert.equal(calls.upload, 1);
});

test("a send still waiting in line is cancelled at once and never uploads", async () => {
  const p = pending(), { state, calls } = sender(p.upload);
  const first = input(), second = input("a", "original-2");
  first.text = ""; second.text = "";
  state.start(first);
  state.start(second);
  await tick();
  const [, waiting] = state.forRoom("a");
  assert.equal(waiting.phase, "uploading");
  assert.equal(state.cancel(waiting.id), true);
  assert.equal(state.forRoom("a")[1].phase, "cancelled", "누른 즉시 취소됨");
  p.finish(uploadOK());
  await tick(); await tick();
  assert.equal(calls.upload, 1, "줄 서 있던 건 안 올라감");
  assert.equal(state.forRoom("a").length, 1);
  assert.equal(state.forRoom("a")[0].phase, "cancelled");
});

test("abort that the transport ignores (already sent) still finishes normally", async () => {
  let finish!: (r: SendReply) => void;
  const { state } = sender(() => new Promise<SendReply>((resolve) => { finish = resolve; }));   // 끊기를 무시하는 손(서버가 받는 중)
  const draft = input();
  draft.text = "";
  state.start(draft);
  await tick();
  const card = state.forRoom("a")[0];
  assert.equal(state.cancel(card.id), true);
  finish(uploadOK());
  await tick();
  assert.deepEqual(state.forRoom("a"), [], "서버가 받은 건 끝까지(취소됨으로 거짓 표시 안 함)");
});

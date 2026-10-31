import assert from "node:assert/strict";
import { test } from "node:test";
import { notifyImage, notifyOn, notifyState } from "../data/notify.ts";

test("기본 = 갠톡 켬 · 단톡 끔(형 11-01 「오프가 기본 갠톡은 온이 기본」)", () => {
  assert.equal(notifyOn(undefined, "dm-fast", true), true);
  assert.equal(notifyOn(undefined, "free", false), false);
  const s = notifyState({ rooms: { free: { on: null } } });
  assert.equal(notifyOn(s, "free", false), false);   // null = 기본으로
});

test("방에 정한 값이 기본보다 앞 · 서버 기본도 따름", () => {
  const s = notifyState({ rooms: { "dm-fast": { on: false }, free: { on: true } }, defaults: { dm: true, group: false } });
  assert.equal(notifyOn(s, "dm-fast", true), false);
  assert.equal(notifyOn(s, "free", false), true);
  assert.equal(notifyOn(notifyState({ defaults: { dm: false, group: true } }), "x", false), true);
});

test("단톡 그림 주소 = 판이면 img/<방>?v= · 주소면 그대로 · 없으면 빈 글", () => {
  assert.equal(notifyImage(notifyState({ rooms: { free: { image: 1793486089410 } } }), "free"), "/api/office/notify/img/free?v=1793486089410");
  assert.equal(notifyImage(notifyState({ rooms: { free: { image: "/api/office/notify/img/free?v=9" } } }), "free"), "/api/office/notify/img/free?v=9");
  assert.equal(notifyImage(notifyState({ rooms: { free: { image: "" } } }), "free"), "");
  assert.equal(notifyImage(undefined, "free"), "");
});

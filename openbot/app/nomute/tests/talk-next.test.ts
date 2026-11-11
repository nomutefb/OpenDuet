// 「대화」 두 번 누르기 = 대화방 목록(형 11-12 07:54) · 폰 · PC 한 함수(형 11-11 22:11 「2개 만들면 수정할때마다 두번수정」)
import assert from "node:assert/strict";
import test from "node:test";
import { talkNext } from "../swap/tab-bar.tsx";

test("대화창에서 다시 누름 = 목록 · 목록에서 = 마지막 대화 · 꺼짐 = 폰 마지막 대화 / PC 목록", () => {
  assert.equal(talkNext("chat", null, "/channels/dm-eyes", "/channels/dm-eyes"), "/rooms");
  assert.equal(talkNext("chat", null, "/channels/dm-eyes", "/rooms"), "/rooms");
  assert.equal(talkNext("rooms", null, "/channels/dm-eyes", "/channels/dm-eyes"), "/channels/dm-eyes");
  assert.equal(talkNext("home", null, "/channels/dm-eyes", "/channels/dm-eyes"), "/channels/dm-eyes");
  assert.equal(talkNext("home", null, "/channels/dm-eyes", "/rooms"), "/rooms");
  assert.equal(talkNext("chat", "settings", "/channels/dm-eyes", "/channels/dm-eyes"), "/channels/dm-eyes", "서랍 · 설정 위 = 꺼짐");
});

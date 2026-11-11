import assert from "node:assert/strict";
import { test } from "node:test";
import { bubbleM, noteM, pickM } from "../ui/pick-msg.ts";

// 러너가 옮긴 틈 픽 · 촉 경보 = 알약 말고 말풍선 + 링크 카드(형 11-11 08:43 · 깃)
test("러너 · 픽/경보 · 주소 있음 = 카드 · 그 밖 러너 줄 = 알약 그대로", () => {
  assert.ok(pickM({ kind: "system", who: "러너", text: "틈 픽 · [1] 한덕수 …… 55.0점 https://n.news.naver.com/x" }));
  assert.ok(pickM({ kind: "system", who: "러너", text: "🔴 곧 터질 것 같아(촉 자리) · 무엇 https://x.com/a" }));
  assert.ok(!pickM({ kind: "system", who: "러너", text: "틈 픽 · 주소 없음" }));
  assert.ok(!pickM({ kind: "system", who: "러너", text: "요약 완료: 제목 https://a.b" }));
  assert.ok(!pickM({ kind: "bot", who: "틈", text: "틈 픽 · https://a.b" }));
  assert.ok(!pickM({ kind: "system", who: "윈터", text: "틈 픽 · https://a.b" }));
});

// 「일 판」 기계의 방 습작 = 알약 말고 말풍선(몸이 폰에서 읽히게 · 번개 11-11)
test("일 판 · 일 습작 = 말풍선 · 다른 기계 글 = 알약 그대로", () => {
  assert.ok(noteM({ kind: "system", who: "일 판", text: "일 습작 · 봄비 🌧 · 계획 chat-1 · 14:08 판\n· U1 번개 — 게이지 — 완료" }));
  assert.ok(bubbleM({ kind: "system", who: "일 판", text: "일 습작 · 봄비 🌧" }));
  assert.ok(!noteM({ kind: "system", who: "러너", text: "일 습작 · 봄비" }));
  assert.ok(!noteM({ kind: "being", who: "일 판", text: "일 습작 · 봄비" }));
  assert.ok(!bubbleM({ kind: "system", who: "사무실", text: "방 멤버가 바뀌었어요" }));
});

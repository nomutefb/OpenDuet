import assert from "node:assert/strict";
import { test } from "node:test";
import { pickM } from "../ui/pick-msg.ts";

// 러너가 옮긴 틈 픽 · 촉 경보 = 알약 말고 말풍선 + 링크 카드(형 11-11 08:43 · 깃)
test("러너 · 픽/경보 · 주소 있음 = 카드 · 그 밖 러너 줄 = 알약 그대로", () => {
  assert.ok(pickM({ kind: "system", who: "러너", text: "틈 픽 · [1] 한덕수 …… 55.0점 https://n.news.naver.com/x" }));
  assert.ok(pickM({ kind: "system", who: "러너", text: "🔴 곧 터질 것 같아(촉 자리) · 무엇 https://x.com/a" }));
  assert.ok(!pickM({ kind: "system", who: "러너", text: "틈 픽 · 주소 없음" }));
  assert.ok(!pickM({ kind: "system", who: "러너", text: "요약 완료: 제목 https://a.b" }));
  assert.ok(!pickM({ kind: "bot", who: "틈", text: "틈 픽 · https://a.b" }));
  assert.ok(!pickM({ kind: "system", who: "윈터", text: "틈 픽 · https://a.b" }));
});

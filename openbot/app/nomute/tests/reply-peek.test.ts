// 답글 원글이 이 방에 없으면 = 답한 이 ↔ 인용된 이 둘의 방에서 받아 펼침(형 11-16 19:33 「이거 답글 누르면 바로 펼쳐지게 해줘!」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
test("둘의 방 id = pair-<id>-<id> 가나다순 · 펼침 카드 · 못 찾으면 알림", () => {
  const t = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  assert.match(t, /const room = `pair-\$\{\[a, b\]\.sort\(\)\.join\("-"\)\}`/);
  assert.match(t, /onJump=\{\(w, l\) => c\.onJump\(w, l, undefined, m\.who\)\}/);
  assert.match(t, /\{qpeek \? <QuotedPeek pk=\{qpeek\}/);
  assert.match(t, /원글이 정원 안\(이 방 · 둘의 방\)에 없어/);
  assert.match(t, /n\.endsWith\(x\.who\)/);
  for (const [a, b, want] of [["sona", "shuwang", "pair-shuwang-sona"], ["sia", "bom", "pair-bom-sia"], ["thunder", "sia", "pair-sia-thunder"]]) assert.equal(`pair-${[a, b].sort().join("-")}`, want);
});

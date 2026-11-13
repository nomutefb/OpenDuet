// 형 결정 × / 고름 = 서랍 숫자 · 왼쪽 얼굴 숫자 그 자리에서(형 11-13 16:19 봄 옮김 「의사결정을 떠잇는걸 x 누르면 그거 더 곧바로 반영되게해줘. (메뉴 서랍하고, 좌측 프로필 1 둘다)」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("고르면 먼저 pick 적고 그 방 pending_hyung −1 · 서랍 숫자 = 결정 목록(pick 없는 것)", () => {
  const dp = rd("../ui/decide-pop.tsx"), dc = rd("../ui/decide-count.ts"), tb = rd("../swap/tab-bar.tsx"), dw = rd("../ui/drawer-page.tsx");
  assert.match(dp, /markDecided\(qc, d, p\);   \/\/ 서랍 · 왼쪽 얼굴 숫자 = 누른 그 자리에서/);
  assert.match(dp, /r\.id === d\.room && n > 0 \? \(\{ \.\.\.r, pending_hyung: n - 1 \}/);
  assert.match(dp, /ids\.has\(x\.id\) \? \{ \.\.\.x, pick: p \} : x/, "목록에서 빼지 않음 = 창 「다 고르면 닫힘」 셈 그대로");
  assert.match(dc, /filter\(\(d\) => !d\.pick && !isVideoReq\(d\)\)\.length/);
  assert.match(tb, /const decide = useDecideWaiting\(\);/);
  assert.match(dw, /needsInputCount\(tasks\.data, inbox\.data\) \+ useDecideWaiting\(\)/);
});

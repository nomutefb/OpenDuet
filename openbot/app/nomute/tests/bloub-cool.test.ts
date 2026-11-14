// 조약돌 = 보이는 것만 · 2분 손 없으면 쉼 · 20fps(형 맥 뜨거움 11-14 08:40 봄 옮김 「글구 맥 계속 뜨거운거는 계쏙 일시켜서그런거지?ㅠㅠ」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
test("박자 · 쉼 판정", async () => {
  const s = readFileSync(new URL("../ui/bloub.tsx", import.meta.url), "utf8");
  assert.match(s, /export const BLOUB_STEP_MS = 50, BLOUB_IDLE_MS = 120_000;/);
  assert.match(s, /if \(b\.vis\) draw\(b, t\)/);
  assert.match(s, /seen\?\.observe\(svg\)/);
  const due = (now: number, l: number, t: number) => now - t < 120000 && now - l >= 50;
  assert.equal(due(1000, 960, 900), false); assert.equal(due(1000, 950, 900), true); assert.equal(due(200000, 0, 0), false);
});

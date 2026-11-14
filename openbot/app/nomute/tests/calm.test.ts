// 형 손 2분 없으면 장식 움직임 쉼 · 상태 불빛 숨쉬기 0(11-14 형 맥 뜨거움)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { calmDue } from "../ui/calm.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("쉼 판정 · CSS · 불빛", () => {
  assert.equal(calmDue(200_000, 0), true); assert.equal(calmDue(100_000, 0), false);
  assert.match(rd("../ui/calm.css"), /html\.nm-calm \.nm-split-root \.nm-face\.on::before,/);
  assert.doesNotMatch(rd("../ui/status-line.css"), /\.nm-sl-led \{[^}]*animation: nmSlLed/);
  assert.match(rd("../main.tsx"), /import "\.\/ui\/calm";/);
});
test("상태 점 = 빛 테 0(형 09:34 「다 지워」)", () => {
  assert.match(rd("../ui/status-line.css"), /background: var\(--led\); box-shadow: 0 0 0 1px rgba\(0,0,0,\.25\); \}/);
});

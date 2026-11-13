// 경계 끌기 자석 · 눈금(형 11-14 05:07 · 05:15 「숫자만 빼고」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SNAPS, snapW } from "../ui/split-snap.ts";
test("자석 = 반반 · 4:6 · 6:4 · 셋에 하나 근처(1.4%)에서 착 · 밖은 그대로 · 30~65 막", () => {
  assert.deepEqual(snapW(50.9), { w: 50, hit: SNAPS.indexOf(50) });
  assert.deepEqual(snapW(39), { w: 40, hit: 1 });
  assert.equal(snapW(45).hit, -1); assert.equal(snapW(45).w, 45);
  assert.equal(snapW(10).w, 30); assert.equal(snapW(90).w, 65);
});
test("숫자 · 차트 0 · 붙으면 snap(형 「숫자만 빼고」 · 「차트도 나오게하자는건아님」)", () => {
  const s = readFileSync(new URL("../ui/shell.tsx", import.meta.url), "utf8");
  const i = s.indexOf("function SplitGrip()"), j = s.indexOf("/** 왼쪽 위 러너 게이지 띠");
  assert.doesNotMatch(s.slice(i, j), /px<|%<|toFixed|Math\.round\(drag/);
  assert.doesNotMatch(s.slice(i, j), /nm-split-ruler|createPortal/);
  assert.match(s.slice(i, j), /nm-split-grip\$\{snap \? " snap" : ""\}/);
});

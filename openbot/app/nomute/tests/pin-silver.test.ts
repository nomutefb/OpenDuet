// 고정 줄 = 채도 낮은 고유색은 은빛 결(형 11-21 06:05 「시아 고정 색이 너무 죽은 회색인데.좀 멋쟁이 은색일 수 없나」)
import assert from "node:assert/strict";
import test from "node:test";
import { pinTint, satOf, silverOf } from "../ui/pin-tint";

test("시아(#685466) = 은빛 · 다른 애들 · 라임 = 그 색 그대로", () => {
  assert.ok(satOf("#685466") < 0.18);
  assert.equal(pinTint("#68546670", 20), silverOf(20));
  assert.match(pinTint("#68546670", 20), /^linear-gradient\(105deg, rgba\(214,220,228,0\.3\) 0%, rgba\(250,252,255,0\.44\) 11%/);
  for (const h of ["#4812BD", "#A53566", "#0044AB", "#9DC4FF", "#250B36", "#FFE606", "#045A0F"]) assert.ok(satOf(h) >= 0.18, h);
  assert.equal(pinTint("#4812BD59", 20), "#4812BD33");
  assert.equal(pinTint("", 20), "#CFFF4033");
  assert.doesNotMatch(silverOf(100), /animation|1\.[1-9]\)/);   // 진하기 100 이어도 1 넘지 않음 · 움직임 0
});

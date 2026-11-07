// 고른 멤버 거르기(ui/picked.ts) — 모루 #2864 검토 「지연 명부·별만 있는 초안 시험을 권해」
import test from "node:test";
import assert from "node:assert/strict";
import { livePicked } from "../ui/picked.ts";

const goneKnown = (n: string) => n === "별";
const goneLate = (_n: string) => false;   // 명부가 아직 안 옴 = gone 을 모름

test("명부가 늦어도 서버 후보(별 없음)가 오면 별이 빠짐", () => {
  assert.deepEqual(livePicked(["빠르", "별"], ["빠르", "번개"], goneLate), ["빠르"]);
});
test("후보가 아직 없어도 명부 gone 이면 빠짐", () => {
  assert.deepEqual(livePicked(["빠르", "별"], [], goneKnown), ["빠르"]);
});
test("별만 든 옛 초안 = 0명(저장 단추 꺼짐 · 서버 「한 명 이상」 오류까지 안 감)", () => {
  assert.deepEqual(livePicked(["별"], ["빠르"], goneLate), []);
});
test("둘 다 아직 없으면 그대로 둠(다음 그림에서 거름)", () => {
  assert.deepEqual(livePicked(["빠르", "별"], [], goneLate), ["빠르", "별"]);
});

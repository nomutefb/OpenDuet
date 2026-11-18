// PC 기본 글꼴 = 앱 전체 Pretendard(형 11-16 10:5x 구름 맥 창 「피시는 기본 다 프리텐다드를 기본체로 디폭트하자」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const s = readFileSync(new URL("../ui/chat-font.tsx", import.meta.url), "utf8");
test("안 고른 PC = 켬 · 끈 PC = 꺼짐 · 폰 기본 = 앞과 같음 · 켠 값은 어디서나 켬", () => {
  assert.match(s, /export const fontAllOn = \(saved: string \| null, pc: boolean\) => saved === "pretendard" \|\| \(saved === null && pc\);/);
  const on = (saved: string | null, pc: boolean) => saved === "pretendard" || (saved === null && pc);   // .tsx 는 node 가 못 읽음 = 같은 셈을 글자로 못 박고 여기서 한 번 더
  assert.equal(on(null, true), true); assert.equal(on(null, false), false); assert.equal(on("", true), false); assert.equal(on("pretendard", false), true);
  assert.match(s, /const PC_Q = "\(min-width: 860px\)";/);   // PC 두 칸 잣대(side.tsx SPLIT)와 같은 값
  assert.match(s, /localStorage\.setItem\("nm_font_all", v === "pretendard" \? "pretendard" : ""\)/);   // 끄기 = 빈 값 저장(없음과 다름 = 기본으로 안 돌아감)
});

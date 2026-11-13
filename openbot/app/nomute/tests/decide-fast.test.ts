// 결정 = 고르면 바로 닫힘 · 「이미 대답함」 늘 · 질문 글 아래 단추(형 11-13 09:08 · 09:12)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dp = readFileSync(new URL("../ui/decide-pop.tsx", import.meta.url), "utf8"), oc = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
test("고르면 그 질문 바로 사라짐 · 보내기는 뒤에서 · 차오름 · ✓ 단계 0 · 실패면 창 다시", () => {
  const ch = dp.slice(dp.indexOf("const choose = async"), dp.indexOf("const isOn ="));
  assert.match(ch, /setGone\(\(g\) => new Set\(g\)\.add\(d\.id\)\);\n    const ok = await pick\(d, p\);/);
  assert.ok(!/later\(/.test(ch), "기다림(차오름 · ✓ · 접힘) 0");
  assert.match(ch, /setOpen\(true\)/);
});
test("「이미 대답함」 = 결정 창 · 글 아래 둘 다 · 글 아래 단추 = 결정 줄기 글에만", () => {
  assert.match(dp, /export const ALREADY = "이미 대답함";/);
  assert.match(dp, /onClick=\{\(\) => void choose\(d, \{ text: ALREADY \}, "had"\)\}/);
  assert.match(dp, /export function DecideInline\(\{ id \}: \{ id: string \}\)/);
  assert.match(oc, /<DecideInline id=\{m\.id\} \/>/);
});

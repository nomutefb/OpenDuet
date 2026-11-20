// 형 글 별(*) 그대로(형 11-20 11:04 dm-bom 봄 옮김 「그리고 내가 여기 채팅에 별을 쓸떼, 여러개쓰면 막 꼬여 정상적으로 그냥 쓸수잇게 조치좀, 여기서 굳이 내가 별을 써서 강조할 필요가없어」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { starLit } from "../ui/star-lit.ts";

test("형 글 별 = 굵게 · 기울임 · 가로줄 안 됨(마크다운 이스케이프) · 코드 안은 그대로", () => {
  assert.equal(starLit("**a** * b *** c"), "\\*\\*a\\*\\* \\* b \\*\\*\\* c");
  assert.equal(starLit("***"), "\\*\\*\\*");
  assert.equal(starLit("이미 \\* 막음"), "이미 \\* 막음", "두 번 막지 않음");
  assert.equal(starLit("`a*b` 그리고 *c*"), "`a*b` 그리고 \\*c\\*");
  assert.equal(starLit("```\n**코드**\n```"), "```\n**코드**\n```");
  assert.equal(starLit("별 없음"), "별 없음");
});

test("형 글에만 · 봇 글 꾸밈은 그대로", () => {
  const ui = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  assert.match(ui, /const lit = mineOf\(m\) \? starLit : \(t: string\) => t;/);
  assert.match(ui, /calledMd\(lit\(text\), callRe\(m\), nre\)/);
  assert.match(ui, /calledMd\(lit\(m\.caption\), callRe\(m\), nre\)/);
});

test("입력칸 = 마크다운 끔(치는 동안 ** · * 꾸밈 · 「* 」→「•」 0) · 입력칸 둘 다", () => {
  const o = readFileSync(new URL("../overrides.ts", import.meta.url), "utf8");
  assert.equal((o.match(/markdown=\{false\}\\n/g) || []).length, 2);   // 소스 글자 = 「markdown={false}\n」(따옴표 안 줄바꿈 표시)
});

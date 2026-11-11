import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// 4번 뉴스 에디터 = 옛 에디터 뉴스 요약 꼴 그대로(형 11-11 09:01 · 09:02 · 13:02 봄 1:1)
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const tsx = rd("../ui/news-editor.tsx"), css = rd("../ui/news-editor.css");

test("맨 위 「지금 뜨는 말」 줄 없음(형 09:02 「상단에 인기검색어 없어도 되고」)", () => {
  assert.ok(!/<Ticker\b/.test(tsx) && !/function Ticker\(/.test(tsx));
  assert.ok(!/nm-ned-tkr/.test(css));
});

test("카드 = 폰도 매체 · 편향 · 민감 줄 · 옛 값(Pretendard · 안쪽 18 · 머리 11 · 제목 15/700 · 막대 7)", () => {
  assert.match(tsx, /<SumCard a=\{a\} sens kind=/);
  assert.ok(!/short=\{!wide\}/.test(tsx));
  assert.match(css, /\.nm-ned \.nm-sumc \{ gap:12px; padding:18px; font-family:'Pretendard Variable'/);
  assert.match(css, /\.nm-ned \.nm-sumc-t \{ font-size:15px; font-weight:700; line-height:1\.45; \}/);
  assert.match(css, /\.nm-ned \.nm-sumc-prog em \{ height:7px;/);
});

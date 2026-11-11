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
  assert.ok(!/\.nm-ned \.nm-sumc-prog em \{[^}]*background/.test(css), "막대 회색은 아직 칸만(끝남 라임을 덮지 않게)");
  assert.match(css, /span:not\(\.done\):not\(\.cur\):not\(\.fail\) em \{ background:rgba\(187,188,188,\.7\); \}/);
});

test("요약 요청 = 옛 꼴(글칸 한 장 안 붙여넣기 · 사진 · 링크 · 전송 · 칩 다섯 옛 이름 · 주요는 칩 없이 기본값)", () => {
  const ask = rd("../ui/ask.tsx"), acss = rd("../ui/ask.css");
  assert.match(ask, /className="nm-ask nm-ask-o/);
  assert.match(ask, /placeholder="내용을 입력해주세요"/);
  for (const o of ["24시간 내", "외신 기반", "원본 한정", "AI 미제작", "지식형"]) assert.ok(ask.includes(`o: "${o}"`), o);
  assert.match(ask, /CHIPS\.filter\(\(c\) => c\.k !== "mj"\)/);
  assert.match(ask, /const DEF: Preset = \{ h24: 1, fp: 0, mj: 1, og: 0, noai: 1, know: 0 \}/);   // 보내는 값 그대로
  assert.match(ask, /fetch\("\/api\/submit"/);
  assert.match(acss, /\.nm-ask-o \.nm-ask-box \{ position:relative; display:flex; flex-direction:column; border:1px solid rgba\(255,255,255,\.08\); border-radius:16px; background:rgba\(255,255,255,\.05\); \}/);
});

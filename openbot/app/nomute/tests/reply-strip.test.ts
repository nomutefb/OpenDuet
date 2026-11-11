// 답글 띠 · 입력칸 답장 꼴 · 홈 팔로워 「N분 전」(번개 11-11) — 형 11-11 20:08 ~ 20:13 봄 1:1(봄이 옮김) 「답글이 대화창 위에 붙게해주고 / 답한 상대 얼굴이 말풍선 가장 앞에」 ·
//   「그 답글 상대의 시그니처 말풍선 색 … 그 크기에 맞게」 · 「이탤릭체로 조금 작게 답글 : 어쩌고 ...」 · 「강조 선 나오는건 없어도 돼」 · 18:48 「이거 갱신 3시간 전은 너무 늦구」
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const chat = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
const strip = readFileSync(new URL("../ui/reply-strip.tsx", import.meta.url), "utf8");
const wait = readFileSync(new URL("../ui/attachment-recovery.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
const fp = readFileSync(new URL("../home/follow-pulse.tsx", import.meta.url), "utf8");

test("답글 띠 = 말풍선 묶음(.ybw) 안 · 말풍선 바로 앞 · 내 글 · 남 글 둘 다 · 옛 칩(Quote) 없음", () => {
  assert.equal((chat.match(/<ReplyStrip text=\{String\(m\.text \|\| ""\)\} list=\{c\.list\} onJump=\{c\.onJump\} \/>/g) || []).length, 2);
  assert.match(chat, /<div className="ybw"><ReplyStrip text=[^>]*\/><div \{\.\.\.press\.bind\} className=\{`yb me/);
  assert.doesNotMatch(chat, /<Quote /);
  assert.match(strip, /<i>답글 : \{q\[2\]\}<\/i>/);
  assert.match(strip, /p\?\.bubble \? \{ background: p\.bubble, color: inkOn\(p\.bubble\) \}/);   // 띠 색 = 답한 상대 말풍선 색
  assert.match(strip, /p\?\.face \? <FaceImg id=\{idOf\(p\.who\)\} size=\{16\} \/>/);               // 맨 앞 = 그 사람 얼굴 조각
  // 형 20:08 사진의 그 자리 = 보냄 대기 말풍선도 띠 + 내 글만
  assert.match(wait, /<div className="ybw"><ReplyStrip text=\{item\.text\} \/><div className="yb me nac-wb">\{item\.text\.replace\(QUOTE, ""\)\}<\/div><\/div>/);
});

test("띠 너비 = 말풍선 너비(글이 길어도 묶음을 안 넓힘) · 맞닿음 · 기울인 작은 글 · 세로 강조 선 없음", () => {
  const rule = css.match(/\.ychat \.ybw > \.yrq \{[^}]*\}/)?.[0] || "";
  assert.match(rule, /width:0; min-width:100%/);
  assert.match(rule, /margin-bottom:-6px/);
  assert.match(rule, /border:0/);
  assert.match(rule, /font-size:calc\(var\(--fs-body\) - 2px\)/);
  assert.match(css, /\.ychat \.ybw > \.yrq > i \{[^}]*font-style:italic/);
  assert.match(css, /\.ychat \.ybw > \.yrq \+ \.yb:not\(\.ph\) \{ border-top-left-radius:0; border-top-right-radius:0; \}/);
});

test("입력칸 위 답장 = 「누구에게 답장」 + 그 글 한 줄 + × · 왼쪽 강조 선 없음", () => {
  assert.match(chat, /\{reply\.who\}에게 답장/);
  assert.doesNotMatch(chat, /border-l-2 border-primary bg-muted px-3/);
});

test("홈 팔로워 줄 = 서버가 바로 물은 값(live_followers) 먼저 · 없으면 수집 값", () => {
  assert.match(fp, /live_followers\?: \{ count\?: number; at\?: string \}/);
  assert.match(fp, /ago\(ig\.live_followers\?\.at \|\| ig\.generated_kst\)/);
  assert.match(fp, /nf\.format\(liveN\(ig\)\)/);
  assert.match(fp, /fb \? nf\.format\(liveN\(fb\)\)/);
});

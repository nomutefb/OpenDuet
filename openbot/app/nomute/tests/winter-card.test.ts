// 윈터 프로필 카드(형 11-15 18:36 봄 옮김 「윈터 카드좀 만들어달라고해」 · 「프로필 누름녀나오는거」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const s = readFileSync(new URL("../ui/being-card.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/being-card.css", import.meta.url), "utf8");
test("LOOKS 윈터 = 틀 카드 · 얼굴 /office/winter.webp · 등불 🏮 · 움직임 = opacity 만", () => {
  assert.match(s, /id: "winter",\s+tmpl: true,\s+accent: "#FFB347",\s+match: \["윈터", "winter", "여울"\],\s+face: "\/office\/winter\.webp"/);
  assert.match(s, /<span className="bc-lamp">🏮<\/span>/);
  assert.match(css, /@keyframes bc-lamp \{ 0%, 100% \{ opacity: 1; \} 50% \{ opacity: 0\.72; \} \}/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{ \.bc-winter \.bc-lamp \{ animation: none; \} \}/);
});
test("러너 띠 봇 일 줄(촉 X · 촉 n회) 숨김 · 형 18:52 「안보여도돼」", () => {
  const rg = readFileSync(new URL("../ui/runner-gauges.css", import.meta.url), "utf8");
  assert.match(rg, /\.nm-rgx \.nm-rgx-botsc \{ display:none !important; \}/);
});
test("결 카드 = 나이테 · 🎸 · 음표(형 19:24 「음유시인, 나이테 위에서, 기타 치며 노래듣는 느낌」) · 윈터 ❄️", () => {
  assert.match(s, /id: "gyeol",\s+tmpl: true,\s+accent: "#D9A066",\s+match: \["결", "gyeol"\],\s+face: "\/office\/gyeol\.webp"/);
  assert.match(s, /<span className="bc-guitar">🎸<\/span>/);
  assert.match(css, /repeating-radial-gradient\(circle at 50% 118%/);
  assert.match(s, /<span className="bc-flake">❄️<\/span>/);
});
test("이슈왕 카드(형 11-16 18:16 「이거는 프로필 카드를 이거를 위주로 써줘 좌하단에서 위로 구도」) = 틀 카드 · 옥상 그림 통째 · 둥근 얼굴 숨김", () => {
  assert.match(s, /id: "issueking",\s+tmpl: true,\s+accent: "#F2B630",\s+match: \["슈왕", "이슈왕", "촉", "chok", "issueking"\],\s+face: "\/office\/issueking\.webp"/);
  assert.match(s, /<span className="bc-hero" \/>/);
  assert.match(css, /\.bc-issueking \.bc-hero \{\s+inset: -4%;\s+background: url\(\/office\/issueking-card\.webp\)/);
  assert.match(css, /\.bc-issueking \.profile-card__photo,\s+\.being-card-wrap \.bc-issueking \.bc-halo \{ display: none; \}/);
});

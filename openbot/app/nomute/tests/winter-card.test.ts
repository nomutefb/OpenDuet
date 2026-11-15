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

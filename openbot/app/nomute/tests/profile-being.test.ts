import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// 카드 있는 애 프로필 = 카드 한 장(형 11-11 06:41~06:43 dm-sia) · 애들 글 밑 「안 닿음」 줄 뺌(06:43)
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const pc = rd("../ui/profile-card.tsx"), bc = rd("../ui/being-card.tsx"), css = rd("../ui/being-card.css"), chat = rd("../ui/office-chat.tsx"), vend = rd("../vendor/react-bits/ProfileCard/ProfileCard.tsx");

test("카드 애 = 카드 한 장만 · 색 원 · 설명 글 카드 안 · 화면 보기 = @handle 줄", () => {
  const m = /if \(look\) return \(([\s\S]*?)\n  \);/.exec(pc);
  assert.ok(m, "look 갈래");
  assert.ok(!/ypc-role|ypc-intro|ypc-acts|닫기/.test(m[1]), "둘레 줄 · 단추 0");
  assert.match(m[1], /className="ypc-orb"/);
  assert.match(m[1], /note=\{p\?\.intro/);
  assert.match(m[1], /onScreen=\{screen \? openScreen : undefined\}/);
  assert.match(bc, /contactText=\{onScreen \? "화면 보기" : ""\}/);
  assert.match(vend, /note && <p className="profile-card__note">/);
  assert.match(css, /\.ypc\.ypc--being \{[^}]*background: none;/);
  assert.match(css, /\.ypc-veil:has\(> \.ypc--being\) \{ place-items: start center;/);
});

test("애들 글 밑 「안 닿음」 줄 0 · 형 글 밑은 그대로", () => {
  assert.match(chat, /function Body\([^)]*\) \{\n  return <Said m=\{m\} nre=\{nre\} \/>;/);
  assert.match(chat, /<Missed m=\{m\} \/><Reactions m=\{m\} c=\{c\} mine \/>/);
});

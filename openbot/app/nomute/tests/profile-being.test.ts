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
  assert.match(m[1], /onDm=\{dm \? go : undefined\} acts \/>/);   // 네 칸 통일(형 11-11 08:56 「직무 소개글 대화하기 화면보기 이거 통일해줘」)
  assert.match(bc, /disabled=\{!onDm\}/); assert.match(bc, /disabled=\{!onScreen\}/);   // 없는 애 = 자리는 두고 흐리게
  assert.match(bc, /note=\{acts \? note \|\| "소개는 아직이야" : note\}/);
  assert.match(bc, /status=\{acts \? role \|\| look\.meta : look\.meta\}/);   // 형 11-11 08:41 「글구 하단에 화면 보기 좌측엔 1:1 대화. 로」
  assert.ok(bc.indexOf("1:1 대화</button>") > 0 && bc.indexOf("1:1 대화</button>") < bc.indexOf('"화면 보기" : "화면 없음"'), "1:1 대화 = 화면 보기 왼쪽 · 화면 없는 애 = 「화면 없음」");
  assert.match(vend, /\{!actions && contactText && \(/);
  assert.match(vend, /note && <p className=\{`profile-card__note\$\{noteEmpty \? " is-empty" : ""\}`\}>/);
  assert.match(css, /\.ypc\.ypc--being \{[^}]*background: none;/);
  assert.match(css, /\.ypc-veil:has\(> \.ypc--being\) \{ place-items: start center;/);
});

test("「안 닿음」 줄 0 · 애들 글 · 형 글 둘 다(형 11-11 14:35 「아 ㅋㅋ 그거는 안떠도 돼.」)", () => {
  assert.match(chat, /function Body\([^)]*\) \{\n  return <Said m=\{m\} nre=\{nre\} \/>;/);
  assert.ok(!/<Missed\b|function Missed\(|ymiss/.test(chat));
});

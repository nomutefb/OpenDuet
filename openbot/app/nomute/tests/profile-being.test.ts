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
  assert.match(m[1], /onScreen=\{screen \? openScreen : crd \? openCrd : undefined\}/);   // 맥 몸(봄 · 챙) = 크롬 원격 데스크톱 새 창(형 11-12 07:32)
  assert.match(m[1], /\{fxPen\}\{fxView\}/);   // 형이 사진 · 소개 고치기(형 11-12 07:52)
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

test("프로필 카드 = 일찍 돌려주기(!who) 뒤에 훅 0(React #310 · 프사 누르면 앱 통째 죽던 것 · 11-11 22:4x PC 실물)", () => {
  const src = readFileSync(new URL("../ui/profile-card.tsx", import.meta.url), "utf8");
  const body = src.slice(src.indexOf("export function ProfileCard"));
  const after = body.slice(body.indexOf("if (!who) return null;"), body.indexOf("\n}\n"));
  assert.ok(!/\buse[A-Z]\w*\(/.test(after.replace(/\/\/.*$/gm, "")), "!who 뒤 훅");
});

test("PC 얼굴 띠 차례 = 폰 목록의 고정 그대로 위 · 나머지 = 마지막 대화 · 형이 마지막으로 읽은 때 중 늦은 것(형 11-11 23:52 → 11-12 10:01 「가장 위에는 내가 가장 최근에 읽은 애가 있어야함」 · 봄 10:30 띠만)", () => {
  const sh = readFileSync(new URL("../ui/shell.tsx", import.meta.url), "utf8");
  assert.match(sh, /const stripOrder = \[\.\.\.ordered\.filter\(\(r\) => pinned\(r\.id\)\)/);   // 바탕 = 폰 목록 차례(ordered) · 고정 먼저
  assert.match(sh, /Math\.max\(r\.last_ts \|\| 0, seen\[r\.id\]\?\.at \|\| 0\)/);   // 읽은 때(서버 seen.at)도 셈
});

// 프로필 카드 아래 줄 = @ 왼쪽 온라인 불 · 그 아래 직무 라벨 그림(형 11-20 16:46~16:47 dm-gik 깃 옮김 「@lumi 좌측에 온라인 불이 있어야하고,」 「그 아래에 저 직무 그게 들어가야함 fixer」 「나머지애들은 안만들었는데」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("@ 왼쪽 불(깨어 있음 · 예비 = 켬) · 라벨 있는 애 = 그림 · 없는 애 = 옛 글 · 글 앞 점 걷음", () => {
  const card = rd("../ui/being-card.tsx"), css = rd("../ui/being-card.css"), pc = rd("../vendor/react-bits/ProfileCard/ProfileCard.tsx");
  assert.match(pc, /\{handle && <span className="profile-card__handle">\{handleLead\}@\{handle\}<\/span>\}/);
  assert.match(pc, /\{statusNode \?\? \(status && <span className="profile-card__status">\{status\}<\/span>\)\}/);
  assert.match(card, /const online = look\?\.seat \? lit === true : state === "awake";/);
  assert.match(card, /queryKey: \["nomute", "bots"\]/, "방 목록 · 대화와 같은 받기(캐시 하나)");
  assert.match(card, /handleLead=\{<i className=\{`bc-on\$\{online \? " on" : ""\}`\}/);
  assert.match(card, /statusNode=\{job \? <span className="profile-card__status bc-job"><JobLabel job=\{job\} \/><\/span> : undefined\}/);
  assert.match(css, /\.being-card \.bc-on\.on \{ background: var\(--success, #3BE37A\);/);
  assert.match(css, /\.being-card \.profile-card__status::before \{ display: none; \}/);
  assert.doesNotMatch(css.slice(css.indexOf(".being-card .bc-on")), /^\.being-card \.bc-on[^{]*\{[^}]*animation/m, "불 = 움직임 0");
});

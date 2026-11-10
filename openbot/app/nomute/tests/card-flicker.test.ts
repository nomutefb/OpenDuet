import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// 폰 번쩍 · 득득(형 11-10 07:10 dm-sia) — 매 프레임 다시 굽던 겹을 손가락 화면에서 묶어 둔 줄이 빠지지 않게
const card = readFileSync(new URL("../ui/being-card.css", import.meta.url), "utf8");
const shell = readFileSync(new URL("../../src/styles.css", import.meta.url), "utf8");

test("카드 = 손가락 화면만 홀로 · 눈부심 · 그늘 겹 값 고정 + transform 으로만 움직임(PC 손 0)", () => {
  const m = /@media \(hover: none\) \{([\s\S]*?)\n\}/.exec(card.slice(card.indexOf("폰 번쩍 · 득득")));
  assert.ok(m, "hover:none 묶음");
  for (const sel of ["profile-card__sheen", "profile-card__holo", "profile-card__glare", "profile-card__shade", "profile-card__body::before"]) assert.ok(m[1].includes(sel), sel);
  for (const v of ["--pc-pointer-x", "--pc-light-x", "--pc-shift-x", "--pc-active"]) assert.ok(m[1].includes(v), v);
  assert.match(m[1], /\.being-card \.profile-card__tile \{ -webkit-mask-image:/);   // 자르는 타일 = 마스크(모서리 튐)
  assert.match(m[1], /\.being-card \.bc-steam \{ animation: none;/);   // 안 만질 때 도는 장식 멈춤
  assert.ok(!/\.being-card \.profile-card__holo,\s*\.being-card \.profile-card__sheen \{\s*transform/.test(m[1]), "겹 통째 밀기 뺌(웹킷 다시 섞기)");
});

test("카드 = 숨쉬기 끔(안 만지면 정지 · 형 11-11 06:14 「가만히 있을때도」)", () => {
  const tsx = readFileSync(new URL("../ui/being-card.tsx", import.meta.url), "utf8");
  assert.ok(!/idle=\{/.test(tsx), "idle 안 넘김");
});

test("대화 머리 단계 알약 = 안 보이면 훑기 멈춤", () => {
  assert.match(shell, /\.duet-glass\[data-shown="false"\] \.tool-line-running \{\s*animation: none;/);
});

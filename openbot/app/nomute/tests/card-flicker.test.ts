import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// 폰 번쩍 · 득득(형 11-10 07:10 dm-sia) — 매 프레임 다시 굽던 겹을 손가락 화면에서 묶어 둔 줄이 빠지지 않게
const card = readFileSync(new URL("../ui/being-card.css", import.meta.url), "utf8");
const shell = readFileSync(new URL("../../src/styles.css", import.meta.url), "utf8");

test("카드 = 손가락 화면만 홀로 · 눈부심 · 그늘 겹 값 고정 + transform 으로만 움직임(PC 손 0)", () => {
  const m = /@media \(hover: none\) \{([\s\S]*?)\n\}/.exec(card.slice(card.indexOf("폰 번쩍 · 득득")));
  assert.ok(m, "hover:none 묶음");
  for (const sel of ["profile-card__tile", "profile-card__footer", "profile-card__sheen", "profile-card__holo", "profile-card__glare", "profile-card__shade", "profile-card__body::before"]) assert.ok(m[1].includes(sel), sel);   // 타일 · @ 줄 = 안쪽 시차 묶음(형 11-11 08:12 「아직 아주 조금 번쩍」)
  assert.ok(!/mix-blend-mode:\s*normal/.test(m[1]), "섞기는 안 끔(무지개 죽음)");
  assert.match(m[1], /\.bc-sia \.profile-card__holo-glow, \.bc-deng \.profile-card__holo-glow \{ background-image: var\(--pc-grain\);/);   // 1px 가로줄 뺌(형 11-11 08:41 「아주 잔잔하게 … 아주빠르게」)
  for (const v of ["--pc-pointer-x", "--pc-light-x", "--pc-shift-x", "--pc-active"]) assert.ok(m[1].includes(v), v);
  assert.match(m[1], /\.being-card\.profile-card \{ perspective: none; \}/);   // 기울기 3D → 2D(형 06:39 「좌우로 왓더갓다 할때 다시 문제발생」)
  assert.match(m[1], /\.being-card \.profile-card__body \{ transform: translate\(/);
  assert.ok(!/rotate[XY]\(/.test(m[1]), "폰 묶음엔 3D 회전 0");
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

test("여섯째 판 = 폰에서 안쪽 시차 층 2D · will-change 풂 · 몸통 뒤흐림 끔(형 11-11 18:46 「레이어가 앞뒤앞뒤하면서 번쩍거리는느낌」)", () => {
  const css = readFileSync(new URL("../ui/being-card.css", import.meta.url), "utf8");
  const ph = css.slice(css.indexOf("@media (hover: none) {"));
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const top = flat.slice(0, flat.indexOf("@media (hover: none) {"));
  const sels = [...top.matchAll(/(^|\})\s*([^{}@]+?)\s*\{([^{}]*)\}/g)].filter((m) => /(?<![-\w])transform:[^;]*translate3d\(/.test(m[3])).map((m) => m[2].replace(/\s+/g, " ").trim());
  assert.ok(sels.length >= 12, `본 규칙 translate3d ${sels.length}`);
  for (const s of sels) assert.ok(ph.includes(`  ${s} { transform: translate(`), `폰 2D 덮어쓰기 없음: ${s}`);
  assert.ok(!/translate3d\(/.test(ph.slice(ph.indexOf("여섯째 판"))), "여섯째 판 안 3D 0");
  assert.match(ph, /\.being-card \.bc-art > \* \{ will-change: auto; \}/);
  assert.match(ph, /\.being-card \.profile-card__body \{ -webkit-backdrop-filter: none; backdrop-filter: none; \}/);
});

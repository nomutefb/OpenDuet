// 봇 현황 손 판 = 일하는 중 먼저 · 특수 직군 따로(형 11-16 17:5x 구름 맥 창 「일하는 중이 더 우선적으로 보여야 함」 · 「아예 특수 직업군은 따로 분류되고」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { type BotRow, isSpecial } from "../ui/bot-desk-logic.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const row = (o: Partial<BotRow>): BotRow => ({ who: "x", lane: "rest", state: "", ...o });

test("특수 직군 = 1특기가 특수 갈래(X · Xa ~ Xd)인 손만 · 2 · 3특기가 특수여도 아님", () => {
  for (const c of ["X", "Xa", "Xb", "Xc", "Xd"]) assert.ok(isSpecial(row({ skills: [c, "R"] })), c);
  for (const s of [["D", "S", "R"], ["U"], ["M", "Xa"], [], undefined]) assert.ok(!isSpecial(row({ skills: s as string[] | undefined })), String(s));
});

test("손 판 = 칸 차례 멈춤 → 일하는 중 → 노는 손 → 특수 → 차례 밖 · 일하는 중은 펴 둠 · 특수 칸은 손마다 상태 그림", () => {
  const h = rd("../ui/bot-desk-hands.tsx"), css = rd("../ui/bot-desk.css"), desk = rd("../ui/bot-desk.tsx");
  assert.match(h, /const H_LANES: HLane\[\] = \["lost", "work", "idle", "special", "out"\];/);
  assert.match(h, /export const handLane = \(r: BotRow\): HLane => \{ const g = groupOf\(r\); return g === "lost" \? "lost" : isSpecial\(r\) \? "special" : hLane\(g\); \};/);   // 멈춤이 먼저(놓치면 안 됨) · 그다음 특수
  assert.match(h, /const \[openWork, setOpenWork\] = useState\(true\);/);   // 폰에서도 펴 둠
  assert.match(h, /data-st=\{st \|\| undefined\}/);
  assert.match(h, /const ST_ORDER: St\[\] = \["work", "ready", "idle", "rest"\]/);   // 특수 칸 안 차례 = 일하는 손 먼저
  for (const st of ["work", "ready", "idle", "rest"]) assert.match(css, new RegExp(`\\.nm-bd-ab li\\[data-st="${st}"\\]`));
  assert.match(desk, /일하는 중 <b>\{working\.length\}<\/b><span className="also">노는 손 <b>\{idle\.length\}<\/b><\/span>/);   // 머리 = 일하는 중이 큰 숫자
  assert.match(desk, /flowOf\(crew\.filter\(\(r\) => !isSpecial\(r\)\)\)/);   // 머리 숫자 = 아래 칸과 같은 셈(특수 뺌)
});

test("손 판 색 = 머리 · 막대와 같은 말: 일하는 중 = 라임 · 노는 손 = 흰색(형 11-16 18:3x 「이거 색이 정 반대로 노는 듯.」)", () => {
  const css = rd("../ui/bot-desk.css");
  assert.match(css, /\.nm-bd-ab \.nsb-ab-lane\[data-k="work"\] \.orb > i, \.nm-bd-ab li\[data-st="work"\] \.orb > i \{ background:conic-gradient\(transparent 0 70%, var\(--nsb-ok\) 70% 100%\); \}/);   // 일하는 손의 도는 구슬 = 라임
  assert.match(css, /\.nm-bd-ab \.nsb-ab-lane\[data-k="work"\] h4 \.lane-fold > b \{ color:var\(--nsb-ok\); \}/);
  assert.match(css, /\.nm-bd-ab \.nsb-ab-lane\[data-k="ready"\] \.ring u, \.nm-bd-ab li\[data-st="ready"\] \.ring u \{ border-color:var\(--nsb-ink\); \}/);   // 노는 손 고리 = 흰색
  assert.match(css, /\.nm-bd-ab \.nsb-ab-lane\[data-k="ready"\] h4 b \{ color:var\(--nsb-ink\); \}/);
  assert.match(css, /\.nm-bd-head \.mix \.g-work \{ background:var\(--nsb-ok\);/); assert.match(css, /\.nm-bd-head \.mix \.g-idle \{ background:#E7ECE7; \}/);   // 막대 = 같은 말(라임 = 일 · 흰색 = 노는 손)
});

test("직무 표기 = 영문 직함: Developer · UX Design · PM · Dev. · PM · UXD. (형 11-16 18:4x) · 나머지도 같은 결", async () => {
  const { roleLabel, roleOf } = await import("../ui/bot-desk-logic.ts");
  for (const who of [["D", "S", "R"], ["D", "R", "S"]]) assert.equal(roleLabel(who), "Developer");   // 천둥 · 번개 · 빠르 · 소나
  assert.equal(roleLabel(["U"]), "UX Design"); assert.equal(roleLabel(["U", "D", "M"]), "UX Design");   // 구름 · 시아
  assert.equal(roleLabel(["M", "D", "S"]), "PM · Dev.");   // 깃
  assert.equal(roleLabel(["M", "U", "S"]), "PM · UXD.");   // 봄
  assert.equal(roleLabel(["R", "D", "S"]), "Research"); assert.equal(roleLabel(["S", "R"]), "Fixer");
  assert.deepEqual(["Xa", "Xb", "Xc", "Xd"].map((c) => roleLabel([c])), ["Creator", "Musician", "Storyteller", "Scoop Hunt."]);   // 결 = Musician(형 11-16 18:5x 「결 musician」)   // 뜸 = Creator(형 11-16 18:5x 「뜸은 creator」)
  assert.equal(roleLabel(["M"]), "PM"); assert.equal(roleLabel([]), ""); assert.equal(roleLabel(undefined), ""); assert.equal(roleLabel(["Zz"]), "");   // 모르는 코드 = 빈 글(화면이 서버 한글 이름으로 떨어짐)
  assert.equal(roleOf("D", true), "Dev."); assert.equal(roleOf("U", true), "UXD."); assert.equal(roleOf("R", true), "R&D");
  const h = rd("../ui/bot-desk-hands.tsx");
  assert.equal(roleLabel(["S", "R"], "온"), "Secretary"); assert.equal(roleLabel(["Xd", "S"], "온"), "Secretary");   // 온 = 형 비서(특기 코드보다 먼저)
  assert.equal(roleLabel(["Xd", "R"], "슈왕"), "Scoop Hunt."); assert.equal(roleLabel(["D", "R", "S"], "소나"), "Fixer · Dev.");   // 형 11-16 19:0x 「소나 Fixer · Dev / 슈왕 Scoop Hunt.」
  for (const [sk, who] of [[["Xc", "R", "D"], "뎅"], [["Xb", "M", "S"], "결"], [["Xc", "R", "S"], "윈터"]] as const) assert.equal(roleLabel([...sk], who), "Storyteller", who);   // 형 11-16 18:5x 「뎅 결 윈터는 Storyteller」   // 슈왕(옛 촉) = Scoop Hunter(형 11-16 18:5x) assert.equal(roleLabel(["D"], "번개"), "Developer");
  assert.match(h, /skName = roleLabel\(r\.skills, r\.who\) \|\| skKo;/);   // 손 판 얼굴 밑 = 직함
  assert.match(h, /\(k === "idle" \|\| k === "special" \|\| k === "work"\) && skName \? "sk" : undefined/);   // 어느 칸에서나 알약
});

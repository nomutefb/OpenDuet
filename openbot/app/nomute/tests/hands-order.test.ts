// 봇 현황 손 판 = 일하는 중 먼저 · 특수 직군 따로(형 11-16 17:5x 구름 맥 창 「일하는 중이 더 우선적으로 보여야 함」 · 「아예 특수 직업군은 따로 분류되고」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { type BotRow, GROUP_KO, isSpecial } from "../ui/bot-desk-logic.ts";
import { handLane, handOff } from "../ui/bot-desk-hands.tsx";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const row = (o: Partial<BotRow>): BotRow => ({ who: "x", lane: "rest", state: "", ...o });

test("특수 직군 = 1특기가 특수 갈래(X · Xa ~ Xd)인 손만 · 2 · 3특기가 특수여도 아님", () => {
  for (const c of ["X", "Xa", "Xb", "Xc", "Xd"]) assert.ok(isSpecial(row({ skills: [c, "R"] })), c);
  for (const s of [["D", "S", "R"], ["U"], ["M", "Xa"], [], undefined]) assert.ok(!isSpecial(row({ skills: s as string[] | undefined })), String(s));
});

test("손 판 = 칸 차례 연결 끊김 → 작업 중(개발 중 · 창작 중) → 쉬는 중 → 차례 밖 · 특수 칸 없음(형 11-16 19:5x 「특수도 일하는 중으로」 · 「쉬면 특수도 쉬는데 … 구분 안함」)", () => {
  const h = rd("../ui/bot-desk-hands.tsx"), css = rd("../ui/bot-desk.css"), desk = rd("../ui/bot-desk.tsx");
  assert.match(h, /const H_LANES: HLane\[\] = \["work", "idle"\];/);   // 칸 둘뿐(형 11-16 20:0x 「줄 하나 더 생기는게 아니라」)
  assert.match(h, /const WORK_SUB: \[string, string, \(r: BotRow\) => boolean\]\[\] = \[\["dev", "개발 중", \(r\) => !isSpecial\(r\)\], \["make", "창작 중", isSpecial\]\];/);   // 작업 중 = 두 갈래
  assert.doesNotMatch(h, /"special"|특수 칸 안/);
  assert.match(h, /export const handLane = \(r: BotRow\): HLane => \(groupOf\(r\) === "work" \? "work" : "idle"\);/);   // 일 안 하는 손은 다 쉬는 중(업무 배제 · 연결 끊김도)
  const row = (x: Partial<BotRow>) => ({ who: "x", lane: "rest", ...x }) as BotRow;
  assert.deepEqual([row({ lane: "lost" }), row({ rest: true }), row({ lane: "none" }), row({ lane: "off" }), row({ lane: "ready" }), row({ lane: "work" })].map((r) => [handLane(r), handOff(r)]),
    [["idle", "lost"], ["idle", "hold"], ["idle", "quiet"], ["idle", "quiet"], ["idle", ""], ["work", ""]]);   // 연결 끊김 = 빨간 고리 · 배제 · 신호 없음 = 고리 없음(형 「쉼에 고리만 빠지면 됨」 · 「연결 끊김은 쉼에 가서 고리에 빨간불로」)
  assert.match(css, /\.nm-bd-ab \.nsb-ab-lane li\[data-off="lost"\] \.ring u \{ border-color:var\(--nsb-red, #ff5a5f\); \}/);
  assert.match(css, /\.nm-bd-ab \.nsb-ab-lane li\[data-off="quiet"\] \.halo \{ opacity:0; \}/);
  assert.match(css, /\.nm-bd-ab\.org \.cell \{ grid-template-columns:minmax\(0, 1fr\); \}/);   // 얼굴 간격 = 알약 길이와 무관(형 「애들간 간격 맞출거고」)
  assert.match(h, /<small className="sk">\{sub\}<\/small>/);   // 직함은 누구나(형 「역할군이 안나오는건 아냐.」)
  assert.match(h, /const \[openWork, setOpenWork\] = useState\(true\);/);   // 폰에서도 펴 둠
  assert.doesNotMatch(h, /data-st=/);   // 손마다 상태 그림(특수 칸용)은 걷음 — 칸 꼴이 그림을 정함
  assert.match(h, /<div className="subs">/); assert.match(css, /\.nm-bd-ab\.org \.sub h5 \{/);
  assert.match(desk, /작업 중 <b>\{working\.length\}<\/b><span className="also">쉬는 중 <b>\{crew\.length - working\.length\}<\/b><\/span>/);   // 머리 = 일하는 중이 큰 숫자
  assert.match(desk, /const gen = flowOf\(crew\);/);   // 머리 숫자 = 아래 칸과 같은 셈(특수 직군도 셈)
  assert.match(desk, /<span className="badge">연결 끊김 \{n\.lost\}<\/span>/);
  assert.deepEqual([GROUP_KO.lost, GROUP_KO.work, GROUP_KO.idle], ["연결 끊김", "작업 중", "쉬는 중"]);
});

test("손 판 색 = 머리 · 막대와 같은 말: 일하는 중 = 라임 · 노는 손 = 흰색(형 11-16 18:3x 「이거 색이 정 반대로 노는 듯.」)", () => {
  const css = rd("../ui/bot-desk.css");
  assert.match(css, /\.nm-bd-ab \.nsb-ab-lane\[data-k="work"\] \.orb > i, \.nm-bd-ab li\[data-st="work"\] \.orb > i \{ background:conic-gradient\(transparent 0 70%, var\(--nsb-ok\) 70% 100%\); \}/);   // 일하는 손의 도는 구슬 = 라임
  assert.match(css, /\.nm-bd-ab \.nsb-ab-lane\[data-k="work"\] h4 \.lane-fold > b \{ color:var\(--nsb-ok\); \}/);
  assert.match(css, /\.nm-bd-ab \.nsb-ab-lane\[data-k="ready"\] \.ring u, \.nm-bd-ab li\[data-st="ready"\] \.ring u \{ border-color:var\(--nsb-ink\); \}/);   // 노는 손 고리 = 흰색
  assert.match(css, /\.nm-bd-ab \.nsb-ab-lane\[data-k="ready"\] h4 b \{ color:var\(--nsb-ink\); \}/);
  assert.match(css, /\.nm-bd-head \.mix \.g-work \{ background:var\(--nsb-ok\);/); assert.match(css, /\.nm-bd-head \.mix \.g-idle \{ background:#E7ECE7; \}/);   // 막대 = 같은 말(라임 = 일 · 흰색 = 노는 손)
});

test("직무 표기 = 영문 직함 줄임: Dev. · UXD. · R&D · PM · Dev. · PM · UXD. · 줄임 없으면 그대로(형 11-16 18:4x → 21:06 「Dev. 로 줄이고 / UXD. 로 줄일게」) · 알약 없이 글자만", async () => {
  const { roleLabel, roleOf, skillName, workSkills } = await import("../ui/bot-desk-logic.ts");
  // 11-20 형 「1특 2특 3특 용어 통일」 = 한 곳(skillName) · PM 은 칩에서 빠짐(특기 칩 셋까지) · 결 = 칸도 칩도 Storyteller · 온 = Secretary(한글 「비서」 0)
  assert.deepEqual(workSkills(["M", "U", "R", "O"]), ["U", "R", "O"]); assert.deepEqual(workSkills(["D", "O", "R", "S"]), ["D", "O", "R"]);
  assert.equal(skillName("Xb", { who: "결", skills: ["Xb"] }), "Storyteller"); assert.equal(roleLabel(["Xb"], "결"), "Storyteller");
  assert.equal(skillName("Xe", { who: "온", skills: ["Xe"] }), "Secretary"); assert.equal(skillName("Xe"), "Secretary"); assert.equal(skillName("O", undefined, true), "Ops.");
  for (const who of [["D", "S", "R"], ["D", "R", "S"]]) assert.equal(roleLabel(who), "Dev.");   // 천둥 · 번개 · 빠르 · 소나
  assert.equal(roleLabel(["U"]), "UXD."); assert.equal(roleLabel(["U", "D", "M"]), "UXD.");   // 구름 · 시아
  assert.equal(roleLabel(["M", "D", "S"]), "PM · Dev.");   // 깃
  assert.equal(roleLabel(["O", "D", "R"]), "Ops."); assert.equal(roleLabel(["M", "D", "O"]), "PM · Dev."); assert.equal(roleOf("O"), "Operations");   // 11-19 O = Ops(빠르 · 번개 O > D > R · 깃 M > D > O)
  assert.equal(roleLabel(["M", "U", "S"]), "PM · UXD.");   // 봄
  assert.equal(roleLabel(["R", "D", "S"]), "R&D"); assert.equal(roleLabel(["S", "R"]), "Fixer");   // 리서치 = 줄임 있음(R&D) · Fixer = 줄임 없음
  assert.deepEqual(["Xa", "Xb", "Xc", "Xd"].map((c) => roleLabel([c])), ["Creator", "Musician", "Storyteller", "Scoop Hunt"]);   // 결 = Musician(형 11-16 18:5x 「결 musician」)   // 뜸 = Creator(형 11-16 18:5x 「뜸은 creator」)
  assert.equal(roleLabel(["M"]), "PM"); assert.equal(roleLabel([]), ""); assert.equal(roleLabel(undefined), ""); assert.equal(roleLabel(["Zz"]), "");   // 모르는 코드 = 빈 글(화면이 서버 한글 이름으로 떨어짐)
  assert.equal(roleOf("D", true), "Dev."); assert.equal(roleOf("U", true), "UXD."); assert.equal(roleOf("R", true), "R&D");
  const h = rd("../ui/bot-desk-hands.tsx");
  assert.equal(roleLabel(["S", "R"], "온"), "Secretary"); assert.equal(roleLabel(["Xd", "S"], "온"), "Secretary");   // 온 = 형 비서(특기 코드보다 먼저)
  assert.equal(roleLabel(["Xd", "R"], "슈왕"), "Scoop Hunt"); assert.equal(roleLabel(["D", "R", "S"], "소나"), "Fixer");   // 형 21:06 「소나는 Fixer 로만」   // 형 11-16 19:0x 「소나 Fixer · Dev / 슈왕 Scoop Hunt.」
  for (const [sk, who] of [[["Xc", "R", "D"], "뎅"], [["Xb", "M", "S"], "결"], [["Xc", "R", "S"], "윈터"]] as const) assert.equal(roleLabel([...sk], who), "Storyteller", who);   // 형 11-16 18:5x 「뎅 결 윈터는 Storyteller」   // 슈왕(옛 촉) = Scoop Hunter(형 11-16 18:5x) assert.equal(roleLabel(["D"], "번개"), "Developer");
  assert.match(h, /skName = roleLabel\(r\.skills, r\.who\) \|\| skKo;/);
  assert.match(rd("../ui/bot-desk.css"), /\.nm-bd-ab \.nsb-ab-lane \.cell > small\.sk, [^{]*\{ padding:0; border:0; border-radius:0;/);   // 알약 걷음(형 21:06 「이거 알약 빼고 직무 나오게 할게」)   // 손 판 얼굴 밑 = 직함
});

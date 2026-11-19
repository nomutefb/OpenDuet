// 같은 특기일 때 누구 먼저(구름 11-19 · 형 10:06~10:08 dm-bom 봄 옮김) — 순수 셈 + 화면 자리
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dropAt, flatOf, moveIn, reorderable, sameSet, tiersOf, withOrder } from "../ui/turn-prio-logic";

const ROWS = [
  { who: "시아", skills: ["U", "D", "M"] }, { who: "구름", skills: ["U"] }, { who: "봄", skills: ["M", "U", "S"] },
  { who: "이슬", skills: ["S", "U", "R"] }, { who: "루미", skills: ["Xa", "U", "D"] }, { who: "천둥", skills: ["D", "S", "R"] },
];

test("티어 = 손 표 skills 순번 · 빈 티어 뺌 · 같은 티어 안 = 손 표 줄 차례", () => {
  assert.deepEqual(tiersOf(ROWS, "U"), [{ rank: 1, who: ["시아", "구름"] }, { rank: 2, who: ["봄", "이슬", "루미"] }]);
  assert.deepEqual(tiersOf(ROWS, "R"), [{ rank: 3, who: ["이슬", "천둥"] }]);
  assert.equal(reorderable(tiersOf(ROWS, "Xa")), false);   // 한 명뿐 = 바꿀 거리 없음
});

test("저장 차례를 티어마다 입힘 · 차례에 없는 손은 뒤에 원래 순서 · 형 「uxd 구름 > 시아 > 이슬 > 루미」", () => {
  const t = withOrder(tiersOf(ROWS, "U"), ["구름", "시아", "이슬", "루미"]);
  assert.deepEqual(t.map((x) => x.who), [["구름", "시아"], ["이슬", "루미", "봄"]]);
  assert.deepEqual(flatOf(t), ["구름", "시아", "이슬", "루미", "봄"]);
});

test("티어를 넘어 옮기지 않음 — moveIn 은 그 티어 안만 · 넘치면 끝", () => {
  const t = tiersOf(ROWS, "U");
  assert.deepEqual(moveIn(t, 1, 1, 0).map((x) => x.who), [["구름", "시아"], ["봄", "이슬", "루미"]]);
  assert.deepEqual(moveIn(t, 2, 0, 9).map((x) => x.who), [["시아", "구름"], ["이슬", "루미", "봄"]]);
  assert.deepEqual(moveIn(t, 1, 5, 0), t);   // 없는 자리 = 그대로
});

test("놓은 자리 셈 = 가운데 선 기준 · 끌던 줄 뺀 차례", () => {
  assert.equal(dropAt([10, 30, 50], 5, 2), 0);
  assert.equal(dropAt([10, 30, 50], 60, 0), 2);
  assert.equal(dropAt([10, 30, 50], 35, 0), 1);
});

test("바뀜 = 상관없음이면 차례 안 봄", () => {
  assert.ok(sameSet({ mode: "any", order: ["a"] }, { mode: "any", order: [] }));
  assert.ok(!sameSet({ mode: "order", order: ["a", "b"] }, { mode: "order", order: ["b", "a"] }));
});

test("화면 = 차례 탭 특기 펼침 · 순서도 둘(지금 | 일 없을 때) · 상관없음 | 누구 먼저 · 티어 안 끌기 · 저장 = GoButton · 문 = prefer", () => {
  const ui = readFileSync(new URL("../ui/turn-prio.tsx", import.meta.url), "utf8"), bd = readFileSync(new URL("../ui/bot-desk.tsx", import.meta.url), "utf8");
  assert.match(bd, /<TurnBody code=\{c\} rows=\{t\.rows\} \/>/);
  assert.ok(ui.includes(">지금</button>") && ui.includes(">일 없을 때</button>"));
  assert.ok(ui.includes(">상관없음</button>") && ui.includes(">누구 먼저</button>"));
  assert.match(ui, /office<PreferAns>\("prefer"\)/);
  assert.match(ui, /\{ code: row\.code, mode: "order", order: cur\.order \} : \{ code: row\.code, mode: "any" \}/);
  assert.match(ui, /lo: b\.top - a\.top, hi: b\.bottom - a\.bottom/);   // 티어 칸 밖으로 안 끌림
  assert.match(ui, /<GoButton className="nm-nb-btn" busy="저장 중"/);
});

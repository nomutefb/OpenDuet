import assert from "node:assert/strict";
import test from "node:test";
import { tableRows } from "../runner/runner-table-rows.ts";

// 러너 여섯 표(깃 11-14 · 형 10:41 「지금 러너에 각자 어떤일 하는지」) — 자리 = 줄 · 꺼짐 > 일함 > 쉼 · 숫자 차례(win-10 이 win-2 뒤)
test("자리마다 한 줄 · 일 = 그 자리 도는 잡 · 꺼짐 · 깨운 것 우리말", () => {
  const rows = tableRows({
    pc: "A", at: 1,
    seats: [{ n: "nomute-win-10" }, { n: "nomute-win-2", b: 1 }, { n: "nomute-win-6", L: 1, d: 1 }, { n: "nomute-win-1" }],
    jobs: [
      { id: "a", seat: "nomute-win-2", start: 200, running: true, title: "사이트 올리기", ev: "push" },
      { id: "b", seat: "nomute-win-2", start: 100, running: true, title: "먼저 시작", ev: "schedule" },
      { id: "c", seat: "nomute-win-1", start: 50, running: false, title: "끝난 잡" },
    ],
  });
  assert.deepEqual(rows.map((r) => r.n), ["nomute-win-1", "nomute-win-2", "nomute-win-6", "nomute-win-10"]);
  assert.deepEqual(rows.map((r) => r.st), ["idle", "work", "down", "idle"]);
  assert.equal(rows[1].title, "먼저 시작");
  assert.equal(rows[1].since, 100);
  assert.equal(rows[1].ev, "시계");
  assert.equal(rows[2].heavy, true);
  assert.equal(rows[0].title, "");
});

test("seats 칸 없음(옛 tray-lite) = 표 0 줄", () => {
  assert.deepEqual(tableRows({ pc: "A", at: 1 }), []);
  assert.deepEqual(tableRows(null), []);
});

test("세션 백업 줄 = 빠짐 · 클라우드 늦음 먼저 · 까닭 · 시각", async () => {
  const { bkLines } = await import("../runner/runner-table-rows.ts");
  const ls = bkLines({ pc: "A", at: 1, bk: { rows: [
    { n: "봄", ok: 900, mb: 2336, f: 1017, miss: 0, cloud: "ok" },
    { n: "깃", ok: 100, mb: 120, f: 38, miss: 1, cloud: "ok", why: "열쇠 없음" },
    { n: "뜸", ok: 950, mb: 617, f: 58, miss: 0, cloud: "늦음" },
  ] } }, 1000);
  assert.deepEqual(ls.map((l) => l.n), ["깃", "뜸", "봄"]);
  assert.equal(ls[0].why, "열쇠 없음"); assert.equal(ls[1].cloud, "클라우드 늦음"); assert.equal(ls[2].bad, false); assert.equal(ls[2].ago, 100);
  assert.deepEqual(bkLines({ pc: "A", at: 1 }, 1000), []);
});

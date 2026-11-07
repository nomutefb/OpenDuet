import assert from "node:assert/strict";
import test from "node:test";
import { leftKo, payEndAt, weekCell, weekPace } from "../data/acct-time.ts";

const H = 3_600_000, D = 24 * H;
const now = Date.parse("2026-11-07T17:20:00+09:00");

test("leftKo = 「2일 03시간」 꼴", () => {
  assert.equal(leftKo(now + 2 * D + 3 * H + 10 * 60_000, now), "2일 03시간");
  assert.equal(leftKo(now + 5 * H + 20 * 60_000, now), "5시간 20분");
  assert.equal(leftKo(now + 12 * 60_000, now), "12분");
  assert.equal(leftKo(now - 1, now), "");
  assert.equal(leftKo(undefined, now), "");
});

test("payEndAt = 그날 00:00 한국 시각", () => {
  assert.equal(payEndAt("2026-11-10"), Date.parse("2026-11-10T00:00:00+09:00"));
  assert.equal(payEndAt("11-10"), undefined);
});

test("weekPace = 이번 주 쓴 % ÷ 지난 날 · 바닥나는 때", () => {
  // naver 실물(11-07 17:2x): 7일 95% 남음 · 다시 참 11-12 19:00 → 주 시작 11-05 19:00 · 이틀 쯤 지남
  const reset = Date.parse("2026-11-12T19:00:00+09:00");
  const p = weekPace(95, reset, now)!;
  assert.ok(p.perDay >= 2.4 && p.perDay <= 2.7, String(p.perDay));   // 5% ÷ 1.93일 ≈ 2.6
  assert.equal(p.outAt, undefined);
  assert.ok(p.atReset > 80);
  // m 실물: 7일 5% 남음 · 다시 참 11-09 22:59 → 주 시작 11-02 22:59 · 바닥이 다시 참보다 먼저
  const r2 = Date.parse("2026-11-09T22:59:00+09:00");
  const q = weekPace(5, r2, now)!;
  assert.ok(q.perDay > 15, String(q.perDay));   // 95% ÷ 4.77일 ≈ 19.9
  assert.ok(q.outAt !== undefined && q.outAt < r2);
  assert.equal(q.atReset, 0);
  assert.equal(weekPace(undefined, reset, now), null);
  assert.equal(weekPace(50, now - 1, now), null);
});

test("weekCell = 7일·주간 칸", () => {
  assert.deepEqual(weekCell({ "5시간": { left_pct: 100 }, "7일": { left_pct: 95, reset_at: 1 } }), { left_pct: 95, reset_at: 1 });
  assert.equal(weekCell({ "5시간": { left_pct: 1 } }), undefined);
});

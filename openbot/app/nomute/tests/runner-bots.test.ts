import { test } from "node:test";
import assert from "node:assert/strict";
import { botUse } from "../runner/runner-table-rows.ts";

test("봇 일 = 오늘 지난 깸 · 다음 깸 · 주인 일 · 토큰 어림(형 11-15 11:42 「촉봇이나 그런애들은 사용량이 따로 러너칸에 찍히게」 · 깃 #-063)", () => {
  const now = Date.parse("2026-11-15T12:00:00+09:00");
  const t = (h: number, m = 0) => Date.parse(`2026-11-15T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+09:00`);
  const bots = [{ bot: "chok", who: "촉", wakes: [Date.parse("2026-11-14T23:30:00+09:00"), t(9), t(9, 30), t(11, 30), t(12, 30)], on: true }, { bot: "gyeol", who: "결", wakes: [], on: true }, { bot: "bit", who: "빚🧪", wakes: [], on: false }];
  const jobs = [{ id: "wf.chok-auto", owner: "번개", health: { last_at: t(11, 50) } }, { id: "wf.chok-alert", owner: "번개", health: { last_at: t(11, 40) } }, { id: "wf.other", owner: "깃" }];
  const u = botUse(bots, jobs, now);
  assert.deepEqual(u.map((x) => x.bot), ["chok"]);   // 결 = 깸 · 일 0 → 안 보임 · 빚 = 꺼짐
  assert.equal(u[0].done, 3);   // 어제 23:30 뺌 · 12:30 은 아직
  assert.equal(u[0].next, t(12, 30));
  assert.equal(u[0].jobs, 2);
  assert.equal(u[0].last, t(11, 50));
  assert.equal(u[0].tok, 150_000);
});

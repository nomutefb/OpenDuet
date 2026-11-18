// 시간표 = 마지막 끝난 회차가 실패면 「실패 N번 연속」(빠르 11-18 13:16 · 서버 editor #4194 health {st:'miss', failed, last_fail_at, missed} · 형 12:25 「근본 해결」 — 앞 = 성공만 세서 18연속 실패가 흰 칸 · 그 뒤 빨강 「놓침 N」이라 글자가 실패와 다름)
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { failKo, lastKo } from "../ui/sched-bits";

test("실패 칸이 있으면 놓침 대신 「실패 N번 연속 · 언제」 · 없으면 앞 글 그대로", () => {
  const now = Date.now();
  assert.equal(failKo({ st: "miss", failed: 18 }), "실패 18번 연속");
  assert.equal(failKo({ st: "miss", failed: 1 }), "실패");
  assert.equal(failKo({ st: "miss", missed: 3 }), "");
  assert.equal(lastKo({ st: "miss", failed: 18, missed: 18, last_fail_at: now - 5 * 60e3 }), "실패 18번 연속 · 5분 전");
  assert.equal(lastKo({ st: "miss", failed: 2 }), "실패 2번 연속");
  assert.equal(lastKo({ st: "miss", missed: 3 }), "놓침 3");   // 실패 칸 없음 = 앞 그대로(옛 서버)
  assert.equal(lastKo({ st: "late", drift_min: 7 }), "7분 늦음");
});
test("판(runner-sheet) = 실패면 「실패 N번 연속 · 마지막 실패 <시각>」 · 놓침 글 겹치지 않음", () => {
  const ui = readFileSync(new URL("../ui/runner-sheet.tsx", import.meta.url), "utf8");
  assert.match(ui, /job\.health\.failed \? `\$\{failKo\(job\.health\)\}\$\{job\.health\.last_fail_at \? ` · 마지막 실패 \$\{nextShort\(job\.health\.last_fail_at\)\}` : ""\}` : HEALTH_KO\[job\.health\.st\]/);
  assert.match(ui, /job\.health\.missed && !job\.health\.failed \?/);
});
test("스케줄 나무 일 카드 = 실패면 「실패 N번 연속」(놓침 대신)", () => {
  const tr = readFileSync(new URL("../ui/sched-tree.tsx", import.meta.url), "utf8");
  assert.match(tr, /<StatusDot st=\{st\} \/><span>\{failKo\(j\.health\) \|\| HEALTH_KO\[st\]\} · /);
});

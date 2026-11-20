// 이번 턴 80분 넘음 = 종 옆 경고등(형 11-21 07:49 「응 지속 80분 넘으면 대화창 종 옆에 경고등 나오게 해줄래? 픽토그램만」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { TURN_WARN_MIN, turnAtOf, turnMin, turnWarn } from "../ui/turn-warn";

test("판정 하나 · activity 줄 먼저 · 이름으로 · 쉬면 0", () => {
  const now = 1_800_000_000_000, st = { cats: [{ id: "bots", rows: [{ name: "시아", turn_at: now - 5 * 60e3 }] }, { id: "activity", rows: [{ name: "시아", turn_at: now - 81 * 60e3 }, { name: "뜸", turn_at: null }] }] };
  assert.equal(TURN_WARN_MIN, 80);
  assert.equal(turnAtOf(st, "시아"), now - 81 * 60e3);
  assert.equal(turnAtOf(st, "뜸"), null); assert.equal(turnAtOf(undefined, "시아"), null);
  assert.equal(turnMin(now - 81 * 60e3, now), 81); assert.equal(turnMin(null, now), undefined);
  assert.equal(turnWarn(now - 81 * 60e3, now), true); assert.equal(turnWarn(now - 80 * 60e3, now), false); assert.equal(turnWarn(null, now), false);
});

test("목록 = 1:1 줄 종 왼쪽 그림 하나 · 글자 0 · 같은 status 캐시", () => {
  const rl = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
  assert.match(rl, /\{r\.with && turnWarn\(turnAtOf\(stat, r\.with\), Date\.now\(\)\) \? <svg aria-label="이번 턴 오래 돎" className="nm-rwarn"/);
  assert.match(rl, /queryKey: \["nomute", "status"\], queryFn: \(\) => office<[^>]*>\("status"\), refetchInterval: 60_000, staleTime: 30_000/);
  assert.match(css, /\.nm-rwarn \{ width:12px; height:12px; flex:none; color:var\(--nsb-red, #FF5A5F\);/);
  assert.doesNotMatch(css, /\.nm-rwarn[^}]*animation/);
});

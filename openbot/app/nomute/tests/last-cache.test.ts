// 지난 값 한 장(data/last-cache.ts) — 열자마자 지난 답을 먼저 그림(형 11-17 「첨에 이렇게 뜨는데 이 부분 해결해보자」)
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { lastRead, lastWrite } from "../data/last-cache";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("담아 둔 글 → 값 · 받은 때", () => {
  const now = 1_800_000_000_000, raw = lastWrite({ a: 1 }, now - 5000);
  assert.deepEqual(lastRead(raw, now), { v: { a: 1 }, at: now - 5000 });
});
test("깨진 글 · 받은 때 없음 · 일주일 넘음 · 앞날 시각 = 없음(서버 답을 기다림)", () => {
  const now = 1_800_000_000_000;
  for (const raw of [null, "", "{", "null", JSON.stringify({ v: 1 }), JSON.stringify({ at: now }), lastWrite(1, now - 8 * 864e5), lastWrite(1, now + 3600e3)]) assert.equal(lastRead(raw, now), undefined, String(raw));
  assert.deepEqual(lastRead(lastWrite(1, now - 6 * 864e5), now), { v: 1, at: now - 6 * 864e5 });
});
test("끼운 자리 = 애들 화면 손 판(status/bots) · 스케줄 표(schedule)", () => {
  const desk = rd("../ui/bot-desk.tsx"), set = rd("../ui/settings-extra.tsx");
  assert.match(desk, /office<Sheet>\("status\/bots"\)\.then\(\(j\) => lastPut\("bots-sheet", j\)\)/); assert.match(desk, /\.\.\.lastSeed<Sheet>\("bots-sheet"\)/);
  assert.match(set, /office<Sched>\("schedule"\)\.then\(\(j\) => lastPut\("schedule", j\)\)/); assert.match(set, /\.\.\.lastSeed<Sched>\("schedule"\)/);
});

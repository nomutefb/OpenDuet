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
test("끼운 자리 = 화면과 미리 받기가 같은 꼴 한 벌(data/crew-warm.ts) · 앱이 켜질 때 한 번 · 값 없는 첫 순간은 제 자리 꼴", () => {
  const warm = rd("../data/crew-warm.ts"), desk = rd("../ui/bot-desk.tsx"), set = rd("../ui/settings-extra.tsx"), shell = rd("../ui/shell.tsx"), sd = rd("../ui/sched-desk.tsx");
  assert.match(warm, /office<T>\("status\/bots"\)\.then\(\(j\) => lastPut\("bots-sheet", j\)\), \.\.\.lastSeed<T>\("bots-sheet"\)/);
  assert.match(warm, /office<T>\("schedule"\)\.then\(\(j\) => lastPut\("schedule", j\)\), \.\.\.lastSeed<T>\("schedule"\)/);
  assert.match(warm, /qc\.prefetchQuery\(botsSheetOpts<unknown>\(\)\); void qc\.prefetchQuery\(schedOpts<unknown>\(\)\)/);
  assert.match(warm, /void qc\.prefetchQuery\(vmMemOpts<unknown>\(\)\)/); assert.equal(rd("../ui/vm-desk.tsx").split("...vmMemOpts<VmMemRes>()").length - 1, 2);   // 램 기록 = 「몸」 탭 · 애 펼침 카드 둘 다 같은 꼴
  assert.match(desk, /\.\.\.botsSheetOpts<Sheet>\(\)/); assert.match(set, /useQuery\(\{ \.\.\.schedOpts<Sched>\(\)/);
  assert.match(shell, /useEffect\(\(\) => warmCrew\(warmQc\), \[warmQc\]\)/);
  assert.match(desk, /q\.isPending \? <HandGhost people=\{people\} \/> : null/); assert.doesNotMatch(desk, /읽는 중…<\/span> : q\.isError/);
  assert.match(sd, /nm-sched-ghost/); assert.doesNotMatch(sd, /: reading\("표"\)\}<\/p>/);
});

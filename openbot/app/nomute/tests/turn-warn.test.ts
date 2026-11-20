// 누적 250 · 지속 80 넘음 = 대화방 목록 시각 글자 빨강(형 11-21 08:19 「…긴급 표시 말고 옆에 최근 대화 시간 표시에 빨간색 으로 나오게하면 대체 가능할듯 그거루할게」 · 앞 판 07:49 종 옆 경고등 = 걷음)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { timeRows } from "../ui/bot-inbox-logic";
import { TURN_WARN_MIN, turnMin, turnWarn } from "../ui/turn-warn";

test("판정 한 곳 = 애들 시간 줄 timeRows(누적 250 · 지속 80)", () => {
  const now = 1_800_000_000_000;
  assert.equal(TURN_WARN_MIN, 80); assert.equal(turnMin(now - 81 * 60e3, now), 81); assert.equal(turnWarn(now - 80 * 60e3, now), false);
  const t = { codes: [], rows: [{ who: "시아", lane: "work", state: "", turn_at: now - 81 * 60e3, work_24h_min: 30 }, { who: "뜸", lane: "none", state: "", work_24h_min: 251 }, { who: "봄", lane: "work", state: "", turn_at: now - 10 * 60e3, work_24h_min: 100 }] } as never;
  const hot = timeRows(t, now).filter((x) => x.warnSum || x.warnCur).map((x) => x.who).sort();
  assert.deepEqual(hot, ["뜸", "시아"]);
});

test("목록 = 시각 글자만 빨강 · 경고등 그림 0 · 애들 표 같은 캐시", () => {
  const rl = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
  assert.match(rl, /const hot = useMemo\(\(\) => new Set\(timeRows\(sheet\?\.table, Date\.now\(\)\)\.filter\(\(x\) => x\.warnSum \|\| x\.warnCur\)/);
  assert.match(rl, /useQuery\(\{ \.\.\.botsSheetOpts<\{ table\?: BotTable \}>\(\), refetchInterval: 60_000 \}\)/);
  assert.doesNotMatch(rl, /nm-rwarn|turnAtOf/);
  assert.match(css, /\.nm-rtime\.hot \{ color:var\(--nsb-red, #FF5A5F\); \}/);
  assert.doesNotMatch(css, /\.nm-rwarn/);
});

// 누적 250 · 지속 80 넘음 = 대화방 목록 시각 글자 빨강(형 11-21 08:19 「…긴급 표시 말고 옆에 최근 대화 시간 표시에 빨간색 으로 나오게하면 대체 가능할듯 그거루할게」 · 앞 판 07:49 종 옆 경고등 = 걷음)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { timeRows } from "../ui/bot-inbox-logic.ts";
import { TURN_WARN_MIN, timeWarnOff, turnMin, turnWarn } from "../ui/turn-warn.ts";

test("판정 한 곳 = 애들 시간 줄 timeRows(누적 250 · 지속 80)", () => {
  const now = 1_800_000_000_000;
  assert.equal(TURN_WARN_MIN, 80); assert.equal(turnMin(now - 81 * 60e3, now), 81); assert.equal(turnWarn(now - 80 * 60e3, now), false);
  const t = { codes: [], rows: [{ who: "시아", lane: "work", state: "", turn_at: now - 81 * 60e3, work_24h_min: 30 }, { who: "뜸", lane: "none", state: "", work_24h_min: 251 }, { who: "봄", lane: "work", state: "", turn_at: now - 10 * 60e3, work_24h_min: 100 }] } as never;
  const hot = timeRows(t, now).filter((x) => x.warnSum || x.warnCur).map((x) => x.who).sort();
  assert.deepEqual(hot, ["뜸", "시아"]);
  // 목록 = 지속만(형 11-21 08:38 「…누적이 아니라 쉼 없이 를 뜻하는거야」) · PM 셋 = 0(08:30 「PM은 시간 겅고 안뜨게」 · 손 표 M · 지금 PM 자리)
  assert.deepEqual(timeRows(t, now).filter((x) => x.warnCur).map((x) => x.who), ["시아"]);
  const pm = { codes: [], rows: [{ who: "깃", lane: "work", state: "", skills: ["M", "D"], turn_at: now - 90 * 60e3, work_24h_min: 300 }, { who: "봄", lane: "work", state: "", pm: true, turn_at: now - 90 * 60e3 }] } as never;
  assert.deepEqual(timeRows(pm, now).map((x) => [x.who, x.warnSum, x.warnCur, x.cur]), [["깃", false, false, 90], ["봄", false, false, 90]]);   // 숫자는 그대로 · 경고만 0
  assert.equal(timeWarnOff({ skills: ["U"] }), false);
});

test("목록 = 시각 글자만 빨강 · 경고등 그림 0 · 애들 표 같은 캐시", () => {
  const rl = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
  assert.match(rl, /const hot = useMemo\(\(\) => new Set\(timeRows\(sheet\?\.table, Date\.now\(\)\)\.filter\(\(x\) => x\.warnCur\)/);   // 지속만(R0091)
  assert.match(rl, /useQuery\(\{ \.\.\.botsSheetOpts<\{ table\?: BotTable \}>\(\), refetchInterval: 60_000 \}\)/);
  assert.doesNotMatch(rl, /nm-rwarn|turnAtOf/);
  assert.match(css, /\.nm-rtime\.hot \{ color:var\(--accent\); \}/);   // 라임 시그니처(형 08:38 「글구 빨강 말고 라임으로 할게」 「시그니처색」)
  assert.doesNotMatch(css, /\.nm-rwarn/);
});

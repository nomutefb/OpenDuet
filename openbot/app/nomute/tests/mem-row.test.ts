// 정원 「우리 기억」 줄(형 11-15 08:5x 「백업이 돈 기록이 항상, 정원 한 구석에 우리 애들 관련된 내용쪽에 남게해줘 예쁘게~」 · 「갱신 시간이 남아야하고, 백업 시각이 각각 남아야해~ 습작 시각도~ 최근 교대시각도~」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const s = readFileSync(new URL("../ui/runner-gauges.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/runner-gauges.css", import.meta.url), "utf8");
test("네 줄 = 일기 · 습작 · 교대 · 백업 · 갱신 시각 · 재료 = 일기 줄 metrics + 러너 bk", () => {
  assert.match(s, /\["diary_ms", "일기"\], \["sketch_ms", "습작"\], \["handoff_ms", "교대"\], \["bk", "백업"\]/);
  assert.match(s, /갱신 \{memNew/);
  assert.match(s, /find\(\(c\) => c\.id === "diary"\)/);
  assert.match(s, /\.find\(\(r\) => r\?\.bk\)\?\.bk/);
});
test("조약돌 줄 앞(빈 틈) · 띠 키 안 늘림 · 움직임 0", () => {
  assert.ok(s.indexOf('className="nm-rgx-mem nm-rgx-row12"') < s.indexOf('className="nm-rgx-pebs nm-rgx-row12"'));
  assert.doesNotMatch(css.slice(css.indexOf(".nm-rgx-mem")), /animation|transition/);
});

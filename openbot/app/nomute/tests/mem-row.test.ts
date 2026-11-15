// 정원 「우리 기억」(형 11-15 08:5x 「백업이 돈 기록이 항상, 정원 한 구석에 우리 애들 관련된 내용쪽에 남게해줘 예쁘게~」 · 09:31 「일자는 안보여져도 되고 24시간 표기법으로 보이면됨.(습작은 - 시안, 교대는 라임) 그리고 그러면 2행만 표현하면되고, 여백이 지금 크니까 그만큼 줄이고」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const s = readFileSync(new URL("../ui/runner-gauges.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/runner-gauges.css", import.meta.url), "utf8");
test("두 줄 = 습작 · 교대 · 시각만(날짜 0) · 백업 · 갱신 = 이름표", () => {
  assert.match(s, /const MEM = \[\["sketch_ms", "습작"\], \["handoff_ms", "교대"\]\] as const/);
  assert.match(s, /t: full\.slice\(6\)/);
  assert.match(s, /백업 \{bk\?\.at/); assert.match(s, /갱신 \{memNew/);
});
test("조약돌 위에 띄움(띠 키 0) · 시안 · 라임 · 움직임 0", () => {
  assert.doesNotMatch(s, /className="nm-rgx-mem nm-rgx-row12"/);
  assert.match(css, /\.nm-rgx-memt \{ position:absolute;/);
  assert.match(css, /\.nm-rgx-memt i\.sk, \.nm-rgx-memk \.sk \{ color:#5FD4E8; \}/);
  assert.doesNotMatch(css.slice(css.indexOf("/* 우리 기억")), /animation|transition/);
});

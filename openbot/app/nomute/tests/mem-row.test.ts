// 정원 「우리 기억」(형 11-15 08:5x 「백업이 돈 기록이 항상, 정원 한 구석에 우리 애들 관련된 내용쪽에 남게해줘 예쁘게~」 · 09:31 「일자는 안보여져도 되고 24시간 표기법으로 보이면됨.(습작은 - 시안, 교대는 라임) 그리고 그러면 2행만 표현하면되고, 여백이 지금 크니까 그만큼 줄이고」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const s = readFileSync(new URL("../ui/runner-gauges.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/runner-gauges.css", import.meta.url), "utf8");
test("두 줄 = 습작 · 교대 · 시각만(날짜 0) · 이름표 없음 · 조약돌 + A1~A6 한 줄", () => {
  assert.match(s, /<div className="nm-rgx-line">/);   // 형 11-15 「a1~a6를 우측으로 옮기자 … 조약돌하고 같은 라인으로」
  assert.match(s, /const low = ig \?\? fb, me = run \?\? peb;/);   // 그 한 줄 = 오른쪽 아래 줄에 맞춤(「그만큼 확보된만큼 내려오면」)
  assert.match(s, /const MEM = \[\["sketch_ms", "습작"\], \["handoff_ms", "교대"\]\] as const/);
  assert.match(s, /t: full\.slice\(6\)/);
  assert.doesNotMatch(s, /nm-rgx-memk/);   // 오른쪽 이름표(습작 · 교대 · 백업 · 갱신) = 뺌(형 11-15 「습작, 교대 이 글자 자체는 안보여됨」 · 「백업하고 그거는 어짜피 도는거니까 걍 안보이게」) · 시각마다 풍선 글은 그대로
  assert.match(s, /· 백업 \$\{bka\.full\}/);
});
test("조약돌 위에 띄움(띠 키 0) · 시안 · 라임 · 움직임 0", () => {
  assert.doesNotMatch(s, /className="nm-rgx-mem nm-rgx-row12"/);
  assert.match(css, /\.nm-rgx-memt \{ position:absolute;/);
  assert.match(css, /\.nm-rgx-memt i\.sk, \.nm-rgx-memk \.sk \{ color:#5FD4E8; \}/);
  assert.doesNotMatch(css.slice(css.indexOf("/* 우리 기억")), /animation|transition/);
});

// 정원 「우리 기억」(형 11-15 08:5x 「백업이 돈 기록이 항상, 정원 한 구석에 우리 애들 관련된 내용쪽에 남게해줘 예쁘게~」 · 09:31 「일자는 안보여져도 되고 24시간 표기법으로 보이면됨.(습작은 - 시안, 교대는 라임) 그리고 그러면 2행만 표현하면되고, 여백이 지금 크니까 그만큼 줄이고」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const s = readFileSync(new URL("../ui/runner-gauges.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/runner-gauges.css", import.meta.url), "utf8");
test("두 줄 = 습작 · 교대 · 시각만(날짜 0) · 이름표 없음 · 조약돌 한 줄(11-16 A1~A6 뺌)", () => {
  assert.match(s, /<div className="nm-rgx-line" style=/);
  assert.doesNotMatch(s, /className="nm-rgx-runs"/);   // 형 11-16 08:34 「러너는 안보여도 돼. / 그리구 조약돌만 보이면 될듯.」
  assert.match(s, /천둥: \{ key: "thunder" \}, 구름: \{ key: "cloud", bot: "moru" \}/);   // 형 11-16 08:15 「클로드 + 구름까진 나와야 해. 구름은 너네 사이에 블릿하나 넣어줘.」
  assert.match(s, /\{x\.sepb \? <i className="nm-rgx-dot" aria-hidden>•<\/i> : null\}/);   // 형 11-16 10:00 「구름도 바로 옆에 붙여줘! 그리고 수평 맞춰줘. 빈공간에 대시같은건 없어도 될듯」 = 점은 칸을 안 먹음
  assert.doesNotMatch(s, /className="nm-rgx-cell sep"/);
  assert.match(s, />\{a\.tone === "none" \? null : a\.t\}<\/i>/);   // 시각 없는 칸 = 빈칸(「—」 안 그림)
  assert.match(css, /\.nm-rgx-peb \.nm-rgx-dot \{[^}]*translateX\(calc\(-50cqw \/ var\(--nm-rgx-pn, 9\)\)\)/);
  assert.match(css, /\.nm-rgx-line > \.nm-rgx-pebs \{[^}]*flex:1 1 100%;/);   // 형 11-15 「a1~a6를 우측으로 옮기자 … 조약돌하고 같은 라인으로」
  assert.match(s, /const low = ig \?\? fb, me = run \?\? peb;/);   // 그 한 줄 = 오른쪽 아래 줄에 맞춤(「그만큼 확보된만큼 내려오면」)
  assert.match(s, /<div className="nm-rgx-botsc" aria-label="봇 일 · 오늘">/);   // 뜸 #-063 봇 일 = 한 줄 틀 오른쪽 위로 자리만 옮김(옛 A 줄이 없어져서)
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

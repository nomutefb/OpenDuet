// 폰 홈 맨 위 = 인스타(늘 먼저) ↔ 러너 옆 넘김(형 11-16 03:08 클라우드 세션 창 「이거 원래 상단에 인스타만 보이게 되어있는데 그걸 고정으로 하고 좌우 스냅 스위칭하면 러너 나오게 변경」 · 「좌우에 꺽쇠만 반투명 살짝 미관상 보기 좋게 잇음 될가같아」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const ts = rd("../home/top-swap.tsx"), css = rd("../home/top-swap.css"), home = rd("../home/home-screen.tsx"), scene = rd("../home/home-scene.css"), fp = rd("../home/follow-pulse.tsx"), fcss = rd("../home/follow-pulse.css");

test("폰 첫 줄 = 한 칸 · 팔로워 띠 먼저 · 러너 띠는 넘겨야 · PC 반갈은 그대로", () => {
  assert.match(home, /\{split \? <FollowPulse \/> : <div className="nm-home-top" style=\{\{ gridRow: 1 \}\}><TopSwap pages=\{\[\{ node: <FollowPulse grow \/>, label: "팔로워" \}, \{ node: <RunnerGauges \/>, label: "러너" \}, \{ node: <SnsApps \/>, label: "SNS" \}\]\} \/><\/div>\}/);   // 셋째 장 = SNS 큰 아이콘 셋(봄 11-20 11:41)
  assert.doesNotMatch(home, /<RunnerGauges \/><FollowPulse \/>/);   // 앞 판(11-15) = 위아래 두 단
  assert.match(ts, /const \[view, setView\] = useState\(0\);/);   // 늘 인스타로 시작 · 기억 안 함
  assert.doesNotMatch(ts, /localStorage|sessionStorage/);
});

test("「고정」 = 홈을 다시 볼 땐 인스타(판이 덮거나 걷힐 때 · 앱을 1분 넘게 떠났다 올 때)", () => {
  assert.match(ts, /window\.addEventListener\("hashchange", home\); document\.addEventListener\("visibilitychange", vis\);/);
  assert.match(ts, /const home = \(\) => \{ if \(!busy\.current && !grab\.current\?\.lock\) setView\(0\); \};/);   // 넘기는 중이면 그대로 둠
  assert.match(ts, /AWAY_MS = 60_000/); assert.match(ts, /Date\.now\(\) - hid >= AWAY_MS\) home\(\)/);
});

test("넘김 = 왼쪽 · 오른쪽 어느 쪽이든 다른 판 · 손가락 따라옴 · 22% 넘김 또는 빠른 튕김 · 위아래 손길은 안 먹음 · 넘긴 손길은 누름 아님", () => {
  assert.match(ts, /nxt\.style\.transform = at\(dx \+ \(dx <= 0 \? w : -w\)\);/);   // 다음 판 = 미는 반대쪽에서
  assert.match(ts, /START = 8, PASS = 0\.22, FLING = 0\.45/);
  assert.match(ts, /if \(Math\.abs\(dy\) > Math\.abs\(dx\)\) \{ grab\.current = null; return; \}/);
  assert.match(ts, /settle\(g\.dx, e\.type !== "pointercancel" && \(Math\.abs\(g\.dx\) > width\(\) \* PASS \|\| fling\), way\);/);
  assert.match(ts, /onClickCapture=\{\(e\) => \{ if \(ate\.current\) \{ ate\.current = false; e\.preventDefault\(\); e\.stopPropagation\(\); \} \}\}/);
  assert.match(ts, /const done = \(\) => \{ if \(go\) setView\(to1\); else rest\(\); \};/);
  assert.match(ts, /const toward = \(way: -1 \| 1\) => \(\(\(view - way\) % n\) \+ n\) % n;/);   // 한 바퀴(끝에서 밀면 처음)
  assert.match(ts, /calm\(\) \? 0 : Math\.round\(MS \*/);   // 움직임 줄이기 = 바로
  assert.match(css, /\.nm-topswap \{ position:relative; min-width:0; margin-inline:-16px; padding-inline:16px; overflow-x:clip; touch-action:pan-y; \}/);
});

test("쉬는 판 = 안 보임 · 안 눌림 · 안 읽힘 / 두 판 한 칸 = 넘겨도 아래 카드 안 밀림(팔로워 그림이 러너 띠 키까지)", () => {
  assert.match(ts, /data-on=\{view === i \? 1 : 0\} aria-hidden=\{view === i \? undefined : true\} inert=\{view === i \? undefined : true\}>\{g\.node\}/);
  assert.match(css, /\.nm-topswap-pane \{ grid-area:1 \/ 1; min-width:0; display:flex; flex-direction:column; justify-content:flex-end; \}/);
  assert.match(css, /\.nm-topswap-pane\[data-on="0"\] \{ visibility:hidden; pointer-events:none; \}/);
  assert.match(css, /\.nm-topswap\[data-move\] \.nm-topswap-pane:is\(\[data-on="1"\], \[data-nx\]\) \{ visibility:visible;/);   // 넘기는 동안 = 지금 판 + 들어오는 판만
  assert.match(fp, /className=\{`nm-pulse\$\{fill \? " nm-pulse-fill" : grow \? " nm-pulse-grow" : ""\}`\}/);
  assert.match(fp, /if \(\(fill \|\| grow\) && h > 0\) setTall\(Math\.max\(64, h\)\);/);
  assert.match(fcss, /\.nm-pulse\.nm-pulse-grow \.nm-pulse-chart \{ flex:1 1 0; height:0; min-height:108px; \}/);
  assert.match(scene, /\.nm-home-top \.nm-rgx \{ padding-left:0; padding-right:0; \}/);   // 넘김 판 안으로 한 겹 깊어짐(> 뺌)
});

test("양옆 꺽쇠 = 한 벌(ui/chev) · 옅게 28% · 누르면 그 방향으로 넘어감 · 앱 처음 열 때는 띠와 같이", () => {
  assert.match(ts, /import \{ Chev \} from "\.\.\/ui\/chev";/);
  assert.match(ts, /className="nm-topswap-chev l" aria-label=\{`\$\{pages\[toward\(1\)\]\?\.label\} 보기`\} onClick=\{\(\) => flip\(1\)\}><Chev dir="left" size=\{16\} \/>/);
  assert.match(ts, /className="nm-topswap-chev r" aria-label=\{`\$\{pages\[toward\(-1\)\]\?\.label\} 보기`\} onClick=\{\(\) => flip\(-1\)\}><Chev dir="right" size=\{16\} \/>/);
  assert.match(css, /\.nm-topswap-chev \{ position:absolute; top:50%;[^}]*opacity:\.28;/);
  assert.match(css, /html\[data-home-wait\] \.nm-topswap-chev \{ opacity:0; pointer-events:none; \}/);
});

test("SNS 장 = 큰 아이콘 셋 · 누르면 https(폰 = 앱) · 글 0(형 11-20 09:20 · 미토스 ② · 봄 11:41)", () => {
  const sa = rd("../home/sns-apps.tsx");
  assert.match(sa, /SNS_SITES\.map\(\(s\) => \(/);
  assert.match(sa, /href=\{s\.url\} target="_blank" rel="noopener noreferrer" aria-label=\{s\.name\}/);
  assert.doesNotMatch(sa, /<p|<span>[^<]/);   // 설명 글 0
});

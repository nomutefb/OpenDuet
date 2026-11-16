// 서랍 「러너」 + 「봇 현황」 = 하나로 · 봇 상태가 메인(형 11-16 17:4x 구름 맥 창 「이거 두개 봣을때 겹치는게좀 잇어 하나로 통일하고 봇 상태를 메인으로 하고싶어.」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DRAWER_HOME, DRAWER_TABS } from "../ui/drawer-tabs.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("5번 = 애들 한 화면 · 러너 · 스케줄 · 몸 상태 탭 없음 · 옛 길 셋은 그 화면으로", () => {
  for (const x of ["runner", "sched", "vmstat"]) assert.ok(!(DRAWER_TABS as readonly string[]).includes(x), x);
  assert.equal(DRAWER_TABS[0], "botdesk"); assert.equal(DRAWER_HOME, "botdesk");
  const shell = rd("../ui/shell.tsx");
  assert.match(shell, /if \(p === "\/runner" \|\| p === "\/sched" \|\| p === "\/vm"\) return \{ modal: "botdesk" \};/);
  assert.ok(shell.indexOf('if (p === "/runner"') < shell.indexOf("const m = MODALS.find((x) => x.to === p);"));   // 목록에서 찾기 전에 먼저 돌림
  assert.match(shell, /\{ id: "sched", label: "스케줄 배선", icon: "calendar", to: "\/sched", desc: "예약 깸 · 나무" \},\n  \{ id: "runner", label: "러너", icon: "activity", to: "\/runner"/);   // 메뉴 판 = 층 차례 그대로
  assert.match(rd("../swap/tab-bar.tsx"), /<span>애들<\/span>/);   // 폰 아래 네비도 같은 이름
});

test("애들 한 화면 = 위에서 아래로 애들(손 판 → 알약 탭) → 스케줄 배선 → 러너 · 아래 두 층은 가까워질 때 그림 · 겹치는 활동 판만 뺌", () => {
  const desk = rd("../ui/bot-desk.tsx"), sb = rd("../ui/status-board.tsx"), css = rd("../ui/bot-desk.css");
  assert.match(desk, /const SECS = \[\["crew", "애들"\], \["sched", "스케줄 배선"\], \["run", "러너"\]\] as const;/);
  const at = (x: string) => { const i = desk.indexOf(x); assert.ok(i > 0, x); return i; };
  assert.ok(at("<HandBoard rows={crew}") < at('<div className="nm-bd-tabs"') && at('<div className="nm-bd-tabs"') < at("<Near min={420} wait={900}><SchedDesk /></Near>") && at("<Near min={420} wait={900}><SchedDesk /></Near>") < at("<Near min={420} wait={1700}><StatusBoard bare /></Near>"));
  assert.match(desk, /\["board", "일감"\], \["turn", "차례"\], \["body", "몸"\], \["meter", "계기판"\]\]/);
  // 조직 그림(형 11-16 19:2x 「손표를 몸 상태에 합치고 중첩되는건 없애자.」 · 「흐름의 조직 구성 느낌을 가장 메인에」) — 흐름 · 손 표 탭 없음 · PM → 손 판(얼굴 누름) → 고른 애 펼침 차례 · 층 머리 설명 글 없음
  assert.doesNotMatch(desk, /function Flow\(|function Hands\(|"손 표"\]|"흐름"\]/);
  assert.ok(at('className="nm-bd-org-pm"') < at("<HandBoard rows={crew}") && at("<HandBoard rows={crew}") < at('className="nm-bd-org-one"') && at('className="nm-bd-org-one"') < at('<div className="nm-bd-tabs"'));
  assert.match(desk, /<HandBoard rows=\{crew\} skills=\{skills\} people=\{people\} sel=\{sel\} onPick=/);
  assert.doesNotMatch(desk, /nm-crew-h[^\n]*<small>/);
  { const hands = readFileSync(new URL("../ui/bot-desk-hands.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/bot-desk.css", import.meta.url), "utf8");
    assert.match(hands, /export function HandFace\(/);   // 얼굴 + 상태 고리 한 벌 = 손 판 칸과 PM 이 같이 씀
    assert.match(desk, /className="nm-bd-org-pm" data-st=\{pmSt\}/);   // PM 얼굴도 제 상태 고리(형 11-16 「이거 PM도 사이클 돌게해줘」)
    assert.match(css, /\.nm-bd-org-pm\[data-st="work"\] \.orb \{[^}]*animation-play-state:running/);
    assert.match(css, /\.nm-bd-ab\.org \.nsb-ab-lane h4 \{[^}]*align-items:center/);   // 폰: 숫자 · 칸 이름 가운데 높이 맞춤
    assert.match(hands, /export const jobChip = /);   // 얼굴 밑 작은 표 = 지금 맡은 일
    assert.match(hands, /className="nsb-ab nm-bd-ab org first"/);
    assert.match(css, /\.nm-bd-ab\.org \.nsb-ab-lane::before \{[^}]*width:1px/);   // 줄기
    assert.doesNotMatch(css.slice(css.indexOf("조직 그림")), /transition:[^;]*(height|width|top|left|margin)/);   // 줄 · 펼침 = 배치를 다시 세는 움직임 0
  }   // 몸 = 옛 「몸 상태」 화면 · 옛 「작동」 탭은 맨 아래 러너 층으로
  assert.match(desk, /const t = window\.setTimeout\(\(\) => \(idle \? idle\(\(\) => setOn\(true\), \{ timeout: 1500 \}\) : setOn\(true\)\), wait\);/);   // 아래 층 = 첫 화면 뒤 한가할 때 받아 그림
  assert.match(desk, /ts = \[350, 1300, 2800, 4800\]\.map\(\(ms\) => window\.setTimeout\(\(\) => \{ if \(!touched\) goSec\(k, false\); \}, ms\)\);/);   // 옛 길로 들어오면 손 닿기 전까지 그 층에 다시 맞춤
  assert.match(desk, /\/\^#\\\/sched\(\?:\[\/\?\]\|\$\)\/\.test\(h\) \? "sched" : \/\^#\\\/runner\(\?:\[\/\?\]\|\$\)\/\.test\(h\) \? "run"/);   // 옛 길 = 그 층으로 내려감
  assert.match(css, /\.nm-crew-sec \+ \.nm-crew-sec::before \{ content:""; position:absolute; top:0; left:50%; width:1px; height:36px;/);   // 층 사이 줄기(가만한 그림)
  assert.doesNotMatch(css, /\.nm-crew[^{]*\{[^}]*animation/);   // 줄기 · 마디 = 움직임 0
  assert.match(sb, /export function StatusBoard\(\{ bare = false \}: \{ bare\?: boolean \} = \{\}\)/);
  assert.match(sb, /c\.grp === BOTS_GRP && !\(bare && c\.id === "activity"\)/);   // 활동 판만 빠짐
  assert.match(rd("../ui/shell.tsx"), /M\.id === "status" \? <div className="nm-scroll"><StatusBoard \/><\/div>/);   // 옛 「작동」 화면(#/status)은 앞 꼴 그대로
});

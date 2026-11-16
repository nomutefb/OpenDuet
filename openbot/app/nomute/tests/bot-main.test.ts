// 서랍 「러너」 + 「봇 현황」 = 하나로 · 봇 상태가 메인(형 11-16 17:4x 구름 맥 창 「이거 두개 봣을때 겹치는게좀 잇어 하나로 통일하고 봇 상태를 메인으로 하고싶어.」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DRAWER_HOME, DRAWER_TABS } from "../ui/drawer-tabs.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("서랍 = 러너 탭 없음 · 첫 화면 봇 현황 · 옛 러너 길은 봇 현황으로", () => {
  assert.ok(!(DRAWER_TABS as readonly string[]).includes("runner")); assert.equal(DRAWER_TABS[0], "botdesk"); assert.equal(DRAWER_HOME, "botdesk");
  const shell = rd("../ui/shell.tsx");
  assert.match(shell, /if \(p === "\/runner"\) return \{ modal: "botdesk" \};/);
  assert.ok(shell.indexOf('if (p === "/runner")') < shell.indexOf("const m = MODALS.find((x) => x.to === p);"));   // 목록에서 찾기 전에 먼저 돌림
});

test("봇 현황 = 손 판이 맨 위(메인) · 알약 탭 다섯째 「작동」 = 작동 표 통째 · 겹치는 활동 판만 뺌", () => {
  const desk = rd("../ui/bot-desk.tsx"), sb = rd("../ui/status-board.tsx");
  assert.match(desk, /\["hands", "손 표"\], \["run", "작동"\]\]/);
  assert.match(desk, /\{tab === "run" \? <StatusBoard bare \/> : null\}/);
  assert.ok(desk.indexOf("<HandBoard rows={crew}") < desk.indexOf('<div className="nm-bd-tabs"'));   // 손 판 → 탭 차례
  assert.match(desk, /\/\^#\\\/runner\(\?:\[\/\?\]\|\$\)\/\.test\(location\.hash\)\) return "run";/);   // 옛 러너 길로 오면 작동 탭부터
  assert.match(desk, /<button type="button" className="nm-sched-chip" onClick=\{\(\) => pick\("run"\)\}>작동 표<\/button>/);
  assert.match(sb, /export function StatusBoard\(\{ bare = false \}: \{ bare\?: boolean \} = \{\}\)/);
  assert.match(sb, /c\.grp === BOTS_GRP && !\(bare && c\.id === "activity"\)/);   // 활동 판만 빠짐 · 계정 상태 · 도표 · 칸 목록(몸 · 러너 · 백업 …)은 그대로
  assert.match(rd("../ui/shell.tsx"), /M\.id === "status" \? <div className="nm-scroll"><StatusBoard \/><\/div>/);   // 옛 「작동」 화면(#/status)은 앞 꼴 그대로
});

// 서랍 = 위 탭(형 11-15 11:0x 「우측으로 메뉴 를 한줄로 묶고, 기본적으로 러너 현황이 나오는거를 한번 배치시켜보자, 기본 1,2메뉴들하고 같은 느낌으로 … 설정을 제외한 모든영역을 탭처럼 구성하는게 목표임」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DRAWER_HOME, DRAWER_TABS, isDrawerTab } from "../ui/drawer-tabs.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("탭 여섯 · 먼저 뜨는 탭 = 봇 현황 · 설정 · 뉴스 에디터는 탭이 아님", () => {
  assert.deepEqual([...DRAWER_TABS], ["botdesk", "vmstat", "sched", "meetlog", "story", "play"]);   // 「러너」 = 봇 현황 안 「작동」 탭으로 합침(형 11-16 17:4x 「하나로 통일하고 봇 상태를 메인으로 하고싶어.」)   // 일곱째 = VM 상태(형 11-16 16:4x 「vm 상태 그리게 할거야 공간 하나 만들어줘」)
  assert.equal(DRAWER_HOME, "botdesk");   // 서랍 첫 화면 = 봇 현황
  for (const t of DRAWER_TABS) assert.ok(isDrawerTab(t));
  for (const x of ["settings", "nedit", "drawer", "ask", "", null, undefined]) assert.ok(!isDrawerTab(x), String(x));
});

test("껍데기 = 네비 서랍은 봇 현황부터 · 여섯 화면 위에 탭 줄 · PC 는 여섯 다 같은 폭", () => {
  const s = rd("../ui/shell.tsx"), c = rd("../ui/shell.css");
  assert.match(s, /if \(p === "\/drawer"\) return \{ modal: DRAWER_HOME \};/);
  assert.match(s, /\{isDrawerTab\(M\.id\) && !split \? <DrawerTabs cur=\{M\.id\} \/> : null\}/);   // 폰만 화면 안 탭 · PC = 메인 탭 줄
  assert.match(s, /<div className="nm-tswitch fold nm-dtabs" role="tablist"/);   // 대화방 · 뉴스 에디터 위 탭과 같은 옷
  assert.match(s, /void nav\(\{ to: m\.to, replace: true \}\)/);   // 탭 바꿈 = 기록 안 쌓음
  const spread = s.split("\n").find((l) => l.startsWith("const SPREAD"))!.split("//")[0];
  for (const t of DRAWER_TABS) assert.ok(spread.includes(`"${t}"`), t);
  for (const t of DRAWER_TABS) assert.match(s, new RegExp(`\\{ id: "${t}", label: `));   // 이름 · 그림 = MODALS 그대로
  assert.match(c, /\.nm-modal-b\.flush > \.nm-dtabs \+ \.nm-scroll \{ padding-top:10px; \}/);
});

// 형 결정 × / 고름 = 서랍 숫자 · 왼쪽 얼굴 숫자 그 자리에서(형 11-13 16:19 봄 옮김 「의사결정을 떠잇는걸 x 누르면 그거 더 곧바로 반영되게해줘. (메뉴 서랍하고, 좌측 프로필 1 둘다)」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("고르면 먼저 pick 적고 그 방 pending_hyung −1 · 서랍 숫자 = 결정 목록(pick 없는 것)", () => {
  const dp = rd("../ui/decide-pop.tsx"), dc = rd("../ui/decide-count.ts"), tb = rd("../swap/tab-bar.tsx"), dw = rd("../ui/drawer-page.tsx");
  assert.match(dp, /markDecided\(qc, d, p\);   \/\/ 서랍 · 왼쪽 얼굴 숫자 = 누른 그 자리에서/);
  assert.match(dp, /r\.id === d\.room && n > 0 \? \(\{ \.\.\.r, pending_hyung: n - 1 \}/);
  assert.match(dp, /ids\.has\(x\.id\) \? \{ \.\.\.x, pick: p \} : x/, "목록에서 빼지 않음 = 창 「다 고르면 닫힘」 셈 그대로");
  assert.match(dc, /filter\(\(d\) => !d\.pick && !isVideoReq\(d\)\)\.length/);
  // 서랍 · 아래 막대 숫자 = 한 곳(./repair-count.ts = 결정 대기 + 접수 방 안 읽은 글 · 형 11-14 「할일 안에 수리접수를 할일로 빼내고 … 연관된 배선들도 다 여기로」)
  const rc = rd("../ui/repair-count.ts");
  assert.match(rc, /return useDecideWaiting\(\) \+ useRepairUnread\(\);/);
  // 서랍 「수리 접수」 메뉴 · 아래 막대 숫자 = 뺌(형 11-14 「수리접수는 이제 그냥 삭제 아예 메뉴 없애」) · 길 #/tasks 와 숫자 셈(rc)은 남음
  assert.doesNotMatch(tb, /useRepairWaiting/);
  assert.doesNotMatch(dw, /useRepairWaiting|"tasks"/);
  assert.match(dw, /\{ name: "일", ids: \["botdesk", "sched", "runner", "meetlog"\] \}/);   // 봇 현황 = 일 묶음 맨 앞(형 11-14 「서랍에 한 공간이 보여야함」) · 수리 접수는 그대로 빠짐
  assert.doesNotMatch(dw.replace(/\/\/.*$/gm, ""), /"sns"|"chan"|name: "뉴스"/, "SNS · 채널 = 서랍에서 빠지고 뉴스 에디터 위 탭으로(형 11-15 「서랍은 그 내용이 사라지면 댐」) · 구독 채널 = 설정 · 센서 = 뺌(형 11-14)");
  // 채널 · SNS = 옛 에디터 화면 한 줄씩(형 11-14 「전에 버전 … 살려서 하나의 서랍 버전으로 … 지금거는 그러면 삿제」) · 옛 「전체」 주소는 그 화면으로 · 이름 = 화상 회의록
  const sh = rd("../ui/shell.tsx");
  assert.match(sh, /const FRAME: Partial<Record<Modal, string>> = \{ play: "\/play\/" \};/);   // 11-15 부터 채널 · SNS = 품지 않고 앱 안에서(형 「아예 여기에 줕이려고. 로딩해서 가져오는게 아니라」 · ./ui/old-tabs · tests/old-tabs.test.ts)
  assert.doesNotMatch(sh, /M\.id === "(chan|sns)"/);   // 채널 · SNS 판 = 뉴스 에디터 안 탭(./ui/news-editor.tsx · tests/ned-tabs.test.ts)
  // 빠르게 + 화면 맞춤(형 11-14 「전에 버전을 좀 더 빠르게 그리고 이 화면에 최적화 그리고 이피시 인앶에도 최적화」) = only=1 · 그려지기 전 라임 · 폰 머리 0 · PC 좌우 다 씀
  assert.match(sh, /const SPREAD = new Set<Modal>\(\[[^\]]*"nedit"[^\]]*\]\);/);   // PC 좌우 다 씀 = 뉴스 에디터가 물려받음(채널 · SNS 가 그 안 탭)
  assert.doesNotMatch(sh + rd("../ui/inapp.ts"), /fitFrame|fitCss|only=1"\)/, "옛 화면을 품던 길의 덧줄 0(형 11-15 「이정도몬 전에건 없애도대」)");
  assert.match(sh, /if \(nedTabOf\(p\) !== "news"\) return \{ modal: "nedit" \};/);   // #/sns · #/chan · 옛 #/trend · #/chanfull = 뉴스 에디터 그 탭
  assert.doesNotMatch(sh, /ChanModal|SnsModal|TrendModal/);
  assert.match(sh, /\{ id: "meetlog", label: "화상 회의록",/);
  assert.match(rd("../ui/yeta-settings.tsx"), /sub\("snsacc", "users", "구독 채널", <Suspense fallback=\{null\}><SnsAccModal \/><\/Suspense>\)/);
});

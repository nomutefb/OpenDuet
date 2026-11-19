// 서랍 = 위 탭(순수 · 시험 tests/drawer-tabs.test.ts) — 형 11-15 11:0x 「그럼 이거 한줄로 맞출수있는데, 우측으로 메뉴 를 한줄로 묶고, 기본적으로 러너 현황이 나오는거를 한번 배치시켜보자, 기본 1,2메뉴들하고 같은 느낌으로 나오는걸 목표로해보자, 설정을 제외한 모든영역을 탭처럼 구성하는게 목표임」
//   = 서랍 목록 화면(묶음 「일」 · 「우리」) 대신 그 여섯 화면 맨 위에 폴더 탭 한 줄(대화방 · 뉴스 에디터 위 탭과 같은 옷) · 네비 「서랍」 = 러너부터 · 탭 차례 = 러너 먼저, 그 뒤는 서랍 차례 그대로
//   화면 여섯은 제 길 · 제 판 그대로(#/runner · #/botdesk · #/sched · #/meetlog · #/story · #/play) — 탭은 그 사이를 오가는 줄일 뿐(기록 안 쌓음)
// 「화상 회의록」은 탭에서 뺌 — 화상회의 칸 한쪽의 회의록 픽토그램으로 봄(형 11-17 02:1x 구름 맥 창 「화상 회의록 화상회의 탭에서 항상 한쪽에 회의록 픽토그램이 잇어서 거기서 조회할수잇게해주고 탭에서는 뺄게」 · ./meet.tsx MeetLogPeek · 길 #/meetlog 는 살려 둠)
export const DRAWER_TABS = ["botdesk", "ops", "story"] as const;   // 「봄의 정원」(play) = 메뉴에서 뺌(형 11-20 07:19~07:20 dm-gik 깃 옮김 「그리고 메뉴 안에 봄의 정원잇는거 삭제」 · 「아니 그건 아니구 봄의정원 그부분은 삭제고」 · 길 #/play 는 남김)   // ops = 「살림」(운영 지표 하루 장부 · 형 11-19 · ./ops-desk.tsx)     // botdesk = 5번 메뉴 「애들」 한 화면(애들 → 스케줄 배선 → 러너 · 옛 탭 「몸 상태」 · 「스케줄」 · 「러너」가 이 안으로 · 형 11-16 18:1x 구름 맥 창 「그 애들 관련 정보를 다 하나로 통합시키고 싶어 … 그 아래에 뜰게, 스케줄 배선이야. 그리고 그 다음에 러너.」 · ./bot-desk.tsx) · 나머지 셋 = 그 밖 화면
export type DrawerTab = (typeof DRAWER_TABS)[number];
export const DRAWER_HOME: DrawerTab = "botdesk";   // 네비 「서랍」(#/drawer)을 누르면 먼저 뜨는 탭 = 러너 현황
export const isDrawerTab = (m: string | null | undefined): m is DrawerTab => !!m && (DRAWER_TABS as readonly string[]).includes(m);

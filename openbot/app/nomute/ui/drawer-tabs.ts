// 서랍 = 위 탭(순수 · 시험 tests/drawer-tabs.test.ts) — 형 11-15 11:0x 「그럼 이거 한줄로 맞출수있는데, 우측으로 메뉴 를 한줄로 묶고, 기본적으로 러너 현황이 나오는거를 한번 배치시켜보자, 기본 1,2메뉴들하고 같은 느낌으로 나오는걸 목표로해보자, 설정을 제외한 모든영역을 탭처럼 구성하는게 목표임」
//   = 서랍 목록 화면(묶음 「일」 · 「우리」) 대신 그 여섯 화면 맨 위에 폴더 탭 한 줄(대화방 · 뉴스 에디터 위 탭과 같은 옷) · 네비 「서랍」 = 러너부터 · 탭 차례 = 러너 먼저, 그 뒤는 서랍 차례 그대로
//   화면 여섯은 제 길 · 제 판 그대로(#/runner · #/botdesk · #/sched · #/meetlog · #/story · #/play) — 탭은 그 사이를 오가는 줄일 뿐(기록 안 쌓음)
export const DRAWER_TABS = ["runner", "vmstat", "botdesk", "sched", "meetlog", "story", "play"] as const;   // vmstat = 「VM 상태」(몸마다 램 24시간 · 러너 바로 옆 · 구름 11-16 · 형 16:4x 「vm 상태 그리게 할거야 공간 하나 만들어줘」 · ./vm-desk.tsx)
export type DrawerTab = (typeof DRAWER_TABS)[number];
export const DRAWER_HOME: DrawerTab = "runner";   // 네비 「서랍」(#/drawer)을 누르면 먼저 뜨는 탭 = 러너 현황
export const isDrawerTab = (m: string | null | undefined): m is DrawerTab => !!m && (DRAWER_TABS as readonly string[]).includes(m);

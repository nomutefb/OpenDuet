// 바꿔 끼우기 표 — 원본(openbot/app·shared) 파일은 그대로 두고, 빌드 때 아래 원본 모듈을 부르는 자리만 우리 파일(이 nomute/ 폴더)로 바꿔 끼운다.
// 원본 새 판을 받을 때(GitHub 「Sync fork」) = 빌드해 보고 멈춘 PATCH·SWAP 줄만 다시 맞춘다.
import path from "node:path";
import type { Plugin } from "vite";

const norm = (p: string) => p.replaceAll("\\", "/");

/** 빼는 화면(우리 데이터가 없는 것) — 라우트 파일·폴더 이름 정규식(@tanstack/router-generator routeFileIgnorePattern · 이름에만 맞춤). */
export const DROP_ROUTES = [
  "^admin$", "^agents$", "^sign-in$", "^components-gallery$", "^connected-accounts$",
  "^make", "^pages\\.", "^capabilities", "^connections\\.", "^bots\\.", "^bot\\.tsx$", "^team-bots\\.tsx$",
  "^memory\\.tsx$", "^skills\\.tsx$", "^routines\\.tsx$", "^reachability\\.tsx$", "^responsibilities\\.tsx$",
  "^onboarding\\.tsx$", "^start\\.tsx$", "^approvals\\.tsx$", "^notifications\\.tsx$", "^passwords\\.tsx$", "^setup\\.tsx$",
].join("|");

/** 원본 파일(openbot/ 뒤 경로) → 우리 파일(nomute/ 뒤 경로). 우리 파일 안에서 원본을 부르면 그대로 원본(바꿔 끼우기 0). */
export const SWAP: Record<string, string> = {
  "app/src/router.tsx": "router.tsx",   // 해시 주소 · 우리 라우트 나무(빼는 화면 뺀 것)
  "app/src/components/duet/mic-orb.tsx": "swap/mic-orb.tsx",   // 구슬 → 윈터 얼굴
  "app/src/components/agents/abstract-avatar.tsx": "swap/abstract-avatar.tsx",   // 봇 얼굴 → 우리 얼굴 그림
  "app/src/components/channels/avatar.tsx": "swap/avatar.tsx",
  "app/src/components/channels/channel-chat.tsx": "swap/chats.tsx",   // 대화창 = 우리 OfficeChat(형 대화창 규칙)
  "app/src/components/channels/group-chat.tsx": "swap/chats.tsx",
  "app/src/components/shell/chat-screen.tsx": "swap/chats.tsx",
  "app/src/components/shell/tab-bar.tsx": "swap/tab-bar.tsx",   // 「Make」 탭 뺌 · 한국어 · 할 일 수 = 결정 필요 더함
  "app/src/components/shell/menu-sheet.tsx": "ui/menu.tsx",   // 서랍 = 원본 틀 + 우리 방 목록(공지 핀·고정·안 읽음·숨기기)
};

/** 원본 파일 글자 고치기(정확히 그 글자 · 못 찾으면 빌드 멈춤 = 원본 새 판에서 바뀐 곳이 바로 드러남) — 한국어 · 우리에게 없는 메뉴 숨김 */
export const PATCH: Record<string, [string, string][]> = {
  // Tailwind 가 쓰인 글자 꼴을 찾는 자리 = openbot/app 전체(원본 src + 이 폴더) · 빌드 뿌리가 이 폴더라 정해 주지 않으면 원본 src 를 못 봄
  "app/src/styles.css": [['@import "tailwindcss";', '@import "tailwindcss" source("..");']],
  // ── 화면 글 = 한국어(공통 지침 제2조제10호 · PM 07:08 「영어 글자 0」) — 보이는 글·화면 읽기 이름(aria)·안내 글
  "app/src/components/shell/header.tsx": [
    ['aria-label="Menu"', 'aria-label="메뉴"'],
    ["aria-label={`${appConfig.brand.productName} chat`", "aria-label={`${appConfig.brand.productName} 회의실`"],
    ['aria-label="Your settings"', 'aria-label="내 설정"'],
    ['aria-label="Back"', 'aria-label="뒤로"'],
    ['aria-label="More"', 'aria-label="더 보기"'],
    // 맨 위 = 가운데 동그라미만(형 10-28 10:22 「좌상단, 우상단을 네비로 일단 보내보자」) — 왼쪽 ≡ · 오른쪽 「형」 = 안 보임(자리는 남겨 가운데 그대로) · 목록·설정 = 아래 네비(swap/tab-bar.tsx)
    ['className={floating ? "mt-2" : undefined}', 'className={cn("invisible", floating && "mt-2")}'],
    ['cn(DISC, "pointer-events-auto", floating && "mt-2")', 'cn(DISC, "invisible", floating && "mt-2")'],
    // 동그라미 = 지금 대화 상대(형 10:18 · ui/top.tsx) · 윈터 방·방 밖 = 원래 구슬
    ['import { usePageChromeState } from "./page-chrome";', 'import { usePageChromeState } from "./page-chrome";\nimport { NomuteTop } from "@nomute/ui/top";'],
    ["<ChatOrb size={centre - 2} />", "<NomuteTop orb={<ChatOrb size={centre - 2} />} size={centre - 2} />"],
  ],
  "app/src/components/shell/app-shell.tsx": [
    ["nav[aria-label=\"Main\"]", "nav[aria-label=\"큰 탭\"]"],   // 탭 높이 재기 = 우리 탭 이름과 같게(swap/tab-bar.tsx)
    // PC = 왼쪽에 늘 열린 대화 목록 칸(형 10-28 09:48 「그록.컴 처럼」 · ui/side.tsx · 폰 = 칸 없음) — 바깥 틀을 가로로 · 원본 세로 틀은 그 안 오른쪽에 그대로
    ['import { TabBar, tabForPath } from "./tab-bar";', 'import { TabBar, tabForPath } from "./tab-bar";\nimport { NomuteSide } from "@nomute/ui/side";'],
    ['<div className="duet-touch flex h-svh flex-col overflow-hidden bg-duet-surface">', '<div className="duet-touch flex h-svh overflow-hidden bg-duet-surface"><NomuteSide /><div className="flex min-w-0 flex-1 flex-col overflow-hidden">'],
    ["        ) : null}\n      </div>\n    </ChatPresenceProvider>", "        ) : null}\n      </div></div>\n    </ChatPresenceProvider>"],
  ],
  "app/src/components/channels/composer/composer.tsx": [
    ['aria-label="Stop the Bot"', 'aria-label="봇 멈추기"'],
    ['aria-label="Speak a message"', 'aria-label="말로 보내기"'],
    ['aria-label="Attach a file"', 'aria-label="파일 붙이기"'],
    ['aria-label="Attach a file"', 'aria-label="파일 붙이기"'],
    ['const sendLabel = parking ? "Queue message" : "Send message";', 'const sendLabel = parking ? "줄 세워 보내기" : "보내기";'],
    ['aria-label="More message options unavailable"', 'aria-label="글 꾸미기 없음"'],
    ['aria-label="Message"', 'aria-label="글"'],
    ['aria-label="Message"', 'aria-label="글"'],
  ],
  "app/src/components/channels/composer/attachment-strip.tsx": [
    ['aria-label="Attachments"', 'aria-label="붙인 파일"'],
  ],
  "app/src/components/shell/channel-screen.tsx": [
    [">Couldn't find this channel.<", ">그 방을 못 찾았어.<"],
    ['aria-label="Edit channel"', 'aria-label="방 고치기"'],
    [">This channel is archived.<", ">보관한 방이야.<"],
    ["label={`${botName} is writing`", "label={`${botName} 쓰는 중`"],
    ["Couldn't load this channel. Reload the page.", "방을 못 받았어. 새로 고쳐 줘."],
  ],
  "app/src/routes/_authed/_app/group/$channelId.tsx": [
    ['"Group"', '"단체방"'],
    ['<div className="sticky top-0 flex min-h-12 flex-row', '<div className="sticky top-0 hidden min-h-12 flex-row'],   // 단체방 머리 줄 = 안 보임(맨 위 = 가운데 동그라미만 · 형 10:22 · 단체방도 대화 칸 = swap/tab-bar.tsx)
    ["        <GroupPeopleButton channelId={channelId} />\n", "        <span className=\"ml-auto shrink-0 text-xs text-muted-foreground\">{(channel.data?.agentIds ?? []).length}명</span>\n"],   // 사람 넣기·빼기(이메일) = 우리 길 없음 → 멤버 수만(지정방 멤버 고르기 = 설정)
  ],
  "app/src/components/shell/tasks-screen.tsx": [
    ['aria-label="Add a task"', 'aria-label="일 더하기"'],
    ['aria-label="Tasks"', 'aria-label="할 일"'],
    ['order === "newest" ? "Sort: newest first" : "Sort: oldest first";', 'order === "newest" ? "차례: 새것 먼저" : "차례: 옛것 먼저";'],
    ['label="Search tasks"', 'label="할 일 찾기"'],
    ['aria-label="Search tasks"', 'aria-label="할 일 찾기"'],
    ['placeholder="Search tasks"', 'placeholder="할 일 찾기"'],
    ['aria-label="Close search"', 'aria-label="찾기 닫기"'],
    // 할 일 = 맨 위 오늘 카드(결정 카드·밤 요약·수리 접수) · + 새 일(서버 길 없음) 숨김
    ['import { NewTaskSheet } from "./new-task-sheet";', 'import { NewTaskSheet } from "./new-task-sheet";\nimport { NomuteToday } from "@nomute/ui/today";'],
    ["      overlay={\n        bot ? (", "      overlay={\n        false ? ("],
    ["      <TasksSwitch\n        onClose={() => {", "      <NomuteToday />\n      <TasksSwitch\n        onClose={() => {"],
    ["            Active\n          </SwitchTab>", "            진행\n          </SwitchTab>"],
    ["            Up next\n          </SwitchTab>", "            다음\n          </SwitchTab>"],
    ["Couldn't load your Bots. Reload the page.", "봇 명부를 못 받았어. 새로 고쳐 줘."],
  ],
  "app/src/components/shell/tasks-active.tsx": [
    ["Nothing active right now.", "지금 진행 중인 일 없음."],
    ["Add a task with +, or start one from Up next.", "봇이 형에게 묻는 것·형 결정 필요는 여기 모여."],
  ],
  "app/src/routes/_authed/settings/index.tsx": [   // 설정 = 밝음·어두움 + 점검표(원본 칸 = 봇·연결·기능·루틴·승인 규칙·알림·비밀번호·관리자 = 우리 자료 없음)
    ['import { StandingInstructions } from "@/components/settings/standing-instructions";', 'import { NomuteHealth } from "@nomute/ui/health";\nimport { NomuteBots, NomuteBuild, NomuteLink, NomuteNotice, NomuteOld, NomuteRoomset, NomuteSchedule } from "@nomute/ui/settings-extra";'],
    ['{ value: "system", label: "Match phone" },', '{ value: "system", label: "폰 따라" },'],
    ['{ value: "light", label: "Light" },', '{ value: "light", label: "밝게" },'],
    ['{ value: "dark", label: "Dark" },', '{ value: "dark", label: "어둡게" },'],
    ["description={`How ${product} looks and works for you.`}", 'description={`${product} 화면과 상태`}'],
    ['title="Settings"', 'title="설정"'],
    ['<PageSection title="Appearance">', '<PageSection title="화면">'],
    ['label="Appearance"', 'label="화면"'],
    ['aria-label="Settings"', 'aria-label="설정 목록"'],
    ['title="Keyboard shortcuts"', 'title="단축키"'],
    ["{PLACES.filter(", "{PLACES.slice(0, 0).filter("],
    ["<StandingInstructions />", "<NomuteHealth />\n      <NomuteBots />\n      <NomuteLink />\n      <NomuteSchedule />\n      <NomuteRoomset />\n      <NomuteNotice />\n      <NomuteOld />\n      <NomuteBuild />"],
  ],
};

/** openbot = 원본 openbot 폴더(app·shared) · nomute = 이 폴더 */
export function nomuteOverrides(openbot: string, nomute: string): Plugin {
  const up = `${norm(openbot)}/`;
  const ours = (f: string) => path.join(nomute, f);
  return {
    name: "nomute-overrides",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (source.endsWith("lib/generated/application-config")) return ours("app-config.ts");   // 원본은 빌드 전에 만드는 파일(scripts/generate-app-config.ts)
      if (!importer || norm(importer).includes("/nomute/")) return null;
      const r = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!r) return null;
      const id = norm(r.id).split("?")[0];
      const to = id.startsWith(up) ? SWAP[id.slice(up.length)] : undefined;
      return to ? ours(to) : null;
    },
    transform(code, id) {
      const f = norm(id).split("?")[0];
      const fix = f.startsWith(up) ? PATCH[f.slice(up.length)] : undefined;
      if (!fix) return null;
      let out = code.replaceAll("\r\n", "\n");
      for (const [from, to] of fix) {
        if (!out.includes(from)) this.error(`nomute 글자 고치기: ${f.slice(up.length)} 에 「${from.trim().slice(0, 60)}」 없음(원본이 바뀜)`);
        out = out.replace(from, to);
      }
      return out;
    },
  };
}

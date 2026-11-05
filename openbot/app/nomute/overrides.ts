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

/** node_modules 글자 고치기 = 깔린 자리가 달라도 끝 경로로 맞춤 · 글자가 없으면 경고만(빌드가 멈추면 그 회차 앱이 빠짐) */
const PATCH_LIB: Record<string, [string, string][]> = {
  // 「!」 뒤 한글 = 조합 중에도 트리거 감지(형 10-31 「느낌표 쓰고 봄 쓰고 띄어쓰기 했다가 백스페이스 해야 타겟팅이됨」 · prompt-area 입력 처리가 조합 중 감지를 건너뜀 · 글 재그리기는 그대로 건너뜀 · 빠르 판 · 0.6.8 = 파일 이름·글자가 바뀌어 옮김 · se() = 감지 · F() 는 이제 재그리기)
  "prompt-area/dist/chunk-QKZPGBZK.js": [["if(R.isComposing.current){ue.current=true;let N=L();G.current=N,t(N);return}", "if(R.isComposing.current){ue.current=true;let N=L();G.current=N,t(N),se();return}"]],
};

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
  "app/src/components/shell/app-shell.tsx": "swap/app-shell.tsx",   // 겉틀 = 우리 껍데기(ui/shell.tsx)가 로그인 뒤 공통 자리에 한 번만 · 여기 AppShell 은 지나감(형 11:22 「옮겨도 뒤 그대로」)
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
    ['import { usePageChromeState } from "./page-chrome";', 'import { usePageChromeState } from "./page-chrome";\nimport { NomuteName, NomuteTop } from "@nomute/ui/top";'],
    ["<ChatOrb size={centre - 2} />", "<NomuteTop orb={<ChatOrb size={centre - 2} />} size={centre - 2} />"],
    // 사진 밑 = 그 방 이름 · 가림막 = 사진+이름까지 · 사진 조금 위로(형 10-28 22:04 · 꼴 = ui/shell.css .nm-head)
    ["{floating ? <ChatStep /> : null}", "{floating ? <NomuteName /> : null}{floating ? <ChatStep /> : null}"],
    ['"duet-face z-20 flex items-start justify-between px-4"', '"duet-face nm-head z-20 flex items-start justify-between px-4"'],
  ],
  "app/src/components/shell/app-shell.tsx": [
    ["nav[aria-label=\"Main\"]", "nav[aria-label=\"큰 탭\"]"],   // 탭 높이 재기 = 우리 탭 이름과 같게(swap/tab-bar.tsx)
  ],
  // 껍데기 자리 = 로그인 뒤 공통 자리(대화·설정 두 갈래 위) 한 번 — ui/shell.tsx
  "app/src/routes/_authed.tsx": [
    ['import { AppHotkeys } from "../lib/hotkeys/app-hotkeys";', 'import { AppHotkeys } from "../lib/hotkeys/app-hotkeys";\nimport { NomuteShell } from "@nomute/ui/shell";'],
    ["      <Outlet />", "      <NomuteShell>\n        <Outlet />\n      </NomuteShell>"],
  ],
  "app/src/components/channels/composer/composer.tsx": [
    // 한 글에 「@」·「!」 여럿(형 11-02 11:34 「한번에 두명 태그가 안되거든. @ 는 하나로 밖에 안돼」 · 11:37 「긴급도 골뱅이와 마찬가지로 한번에 선택」) — 원본은 봇 하나만 남김(enforceSingleAgent) · 서버는 여럿 다 부름(_store.js calls)
    ["  enforceSingleAgent,\n", ""],
    ["        enforceSingleAgent(next),", "        next,"],
    ['aria-label="Stop the Bot"', 'aria-label="봇 멈추기"'],
    ['aria-label="Speak a message"', 'aria-label="말로 보내기"'],
    ['aria-label="Attach a file"', 'aria-label="파일 붙이기"'],
    ['aria-label="Attach a file"', 'aria-label="파일 붙이기"'],
    // 「+」 = 폰은 사진·파일 판 · PC 는 파일 창 바로(./ui/attach-sheet.tsx)
    ['import { AttachmentStrip } from "./attachment-strip";', 'import { AttachmentStrip } from "./attachment-strip";\nimport { openAttach } from "@nomute/ui/attach-sheet";'],
    ["onClick={() => fileInputRef.current?.click()}", "onClick={() => openAttach(fileInputRef.current)}"],
    ["onClick={() => fileInputRef.current?.click()}", "onClick={() => openAttach(fileInputRef.current)}"],
    ['          alt: attachment.filename,\n', '          alt: attachment.filename,\n          size: attachment.size,\n'],
    ['const sendLabel = parking ? "Queue message" : "Send message";', 'const sendLabel = parking ? "줄 세워 보내기" : "보내기";'],
    ['aria-label="More message options unavailable"', 'aria-label="글 꾸미기 없음"'],
    ['aria-label="Message"', 'aria-label="글"'],
    ['aria-label="Message"', 'aria-label="글"'],
    // 엔터 = 줄바꿈이 기본 · 설정에서 보내기로(형 10-31 · ./ui/enter-key.tsx) · 입력칸 둘 · 앞에 줄바꿈까지 넣어 서로 안 겹침
    ['import { PromptArea, type PromptAreaHandle } from "prompt-area";', 'import { PromptArea, type PromptAreaHandle } from "prompt-area";\nimport { shiftSend, useEnterSends } from "@nomute/ui/enter-key";\nimport { registerComposer } from "@nomute/ui/call-sheet";'],
    ['  const promptAreaRef = useRef<PromptAreaHandle>(null);', '  const promptAreaRef = useRef<PromptAreaHandle>(null);\n  const enterSends = useEnterSends();\n  useEffect(() => registerComposer(promptAreaRef), []);'],   // 「@」·「!」 시트가 칩을 넣을 손잡이(./ui/call-sheet.tsx)
    ['\n                  onSubmit={submitDraft}', '\n                  onKeyDown={(e) => shiftSend(e, enterSends, () => void submitDraft(value))}\n                  submitOnEnter={enterSends}\n                  onSubmit={submitDraft}'],
    ['\n              onSubmit={submitDraft}', '\n              onKeyDown={(e) => shiftSend(e, enterSends, () => void submitDraft(value))}\n              submitOnEnter={enterSends}\n              onSubmit={submitDraft}'],
  ],
  // 입력칸 부름 목록 = 「@」(예약) + 「!」(바로 깨움 · 사무실 말 · 형 10-30 「호출시 대화에 쓰면 리스트 안뜨는 것」) — 같은 이 목록 · 고르면 「!이름」 글
  "app/src/components/channels/composer/triggers.ts": [
    ["  return [agentTrigger(agents), slashCommandTrigger(commands)];", "  setCallAgents(agents);\n  return [{ char: \"@\", position: \"any\", mode: \"launch\", accessibilityLabel: \"부르기\", onActivate: () => openCallSheet(\"@\", agents) }, slashCommandTrigger(commands)];"],   // 「@」 = 고르기(./ui/call-sheet.tsx · 형 11-02 11:34) · 「!」 고르기 뺌(형 11-04 17:36 「나는 이제 느낌표가 필요없음 바로 깨우는 거니까」) · 1:1 방 = 「@」 그냥 글자(call-sheet openCallSheet)
    ['emptyMessage: "No Bots in this conversation"', 'emptyMessage: "이 방엔 부를 이가 없어"'],
    ['import { commandTrigger, mentionTrigger } from "prompt-area/helpers";', 'import { commandTrigger, mentionTrigger } from "prompt-area/helpers";\nimport { faceIcon, markLabel } from "@nomute/ui/call-face";\nimport { openCallSheet, setCallAgents } from "@nomute/ui/call-sheet";'],
    ["          description: agent.description,", "          description: agent.description,\n          icon: faceIcon(agent.id),"],   // 부름 목록 얼굴(./ui/call-face.tsx)
    ["          label: agent.name,", "          label: markLabel(agent.id, agent.name),"],   // 부름 목록 이름 옆 표지(./ui/call-face.tsx)
    ["    onSelect: (suggestion) => suggestion.label,", "    onSelect: (suggestion) => agents.find((agent) => agent.id === suggestion.value)?.name ?? suggestion.value,"],   // 칩·글 = 이름만(「!이름」 문법 그대로)
  ],
  // 「+」 = 카메라 말고 파일·갤러리(형 10-31) · 그림 꼴만 적힌 accept 는 폰 브라우저가 카메라·갤러리 고르기로 받음 · 거름은 screenPickedFiles 가 이미 함(빠르 판)
  // 영상 = 사무실 첨부로 받음(시아 11-02 형 02:32 「여가에 영상도 올릴 수 있게 해줘」) · 원본 거름은 영상을 「못 붙이는 꼴」로 막음 → 영상만 통과 · 영상 상한 4GB(봄 #2101 조각 받는 문 · 영상은 R2) 넘으면 여기서 먼저 막음
  "app/src/components/channels/composer/picked-files.ts": [
    ['    if (kind === "unsupported" && !unnamed) {', '    const video = mediaType.startsWith("video/");\n    if (video && file.size > 4 * 1024 * 1024 * 1024) {\n      rejected.push(reject(file, "4GB까지 업로드 가능합니다."));\n      continue;\n    }\n    if (kind === "unsupported" && !unnamed && !video) {'],
    ['    if (kind === "image" && file.size > MAX_IMAGE_BYTES) {', '    if (kind === "image" && file.size > 20 * 1024 * 1024) {'],   // 사진 고르는 문턱 = 서버 첨부 20MB(사진은 원본 + 작은 판 · data/attachment-state.ts smallImage)
    ["          `'${file.name}' is too large for an image. The limit is ${formatBytes(MAX_IMAGE_BYTES)}.`,", '          "20MB까지 업로드 가능합니다.",'],
    ["          `'${file.name}' is too large for a text file. The limit is ${formatBytes(MAX_FILE_BYTES)}.`,", "          `${formatBytes(MAX_FILE_BYTES)}까지 업로드 가능합니다.`,"],
    ["          `'${file.name}' is too large. The limit is ${formatBytes(MAX_IMAGE_BYTES)}.`,", "          `${formatBytes(MAX_IMAGE_BYTES)}까지 업로드 가능합니다.`,"],
  ],
  // 첨부 막힘 안내 = 라임(형 11-02 06:53 「이거 안내 시그니처 색 앞으로 라임이라 할게. 라임으로 8MB까지 업로드 가능합니다. 라고 해줘」) · 빨간 점선 → 라임 점선 · 글 = 「N MB까지 업로드 가능합니다.」(./ui/attachment-up.css .nm-rej)
  "app/src/components/channels/composer/rejected-files.tsx": [
    ['className="flex items-start gap-2 rounded-lg border border-destructive border-dashed p-2"', 'className="nm-rej flex items-start gap-2 rounded-lg border border-dashed p-2"'],
    ['<p className="text-destructive text-sm" key={file.id}>', '<p className="nm-rej-t text-sm" key={file.id}>'],
    ['className="-m-1 shrink-0 rounded p-1 text-destructive/70 transition-colors hover:text-destructive"', 'className="nm-rej-x -m-1 shrink-0 rounded p-1 transition-colors"'],
    ['? "Dismiss this refusal"', '? "안내 닫기"'],
    [': `Dismiss these ${rejected.length} refusals`', ': `안내 ${rejected.length}개 닫기`'],
  ],
  "app/src/components/channels/composer/attachments.ts": [
    ['export const FILE_PICKER_ACCEPT = [\n', 'export const FILE_PICKER_ACCEPT = [\n  "*/*",\n'],
    ['    maxSize: MAX_IMAGE_BYTES,', '    maxSize: 4 * 1024 * 1024 * 1024,'],   // SDK 거름 한 숫자 = 그림 8MB 라 영상이 8MB 에서 막힘(형 11-02 06:51 「아 영상은 8메가 까지가 최대군 ㅋㅋ」) → 영상 한도 50MB · 그림·글 한도는 screenPickedFiles 가 따로 막음
  ],
  "app/src/components/channels/composer/attachment-strip.tsx": [
    ['aria-label="Attachments"', 'aria-label="붙인 파일"'],
    // 입력칸 안에서 칸을 키우지 않고 입력칸 위에 둥근 네모로 · 여러 장 = 좌측부터 한 줄(형 10-31) · 누르면 확대
    ['<Collapse open={occupied}>', '<>'],
    ['</Collapse>', '</>'],
    ['className="flex flex-wrap items-start gap-2 pb-3"', 'className="nm-att-strip"'],
    // 사진 칸 크기 글자(형 11-01 · nm-att-size 아래 띠) = 뺌 · 크기는 원본 파일 왼쪽 위 머리표가 보낼 판으로 보여 줌(압축 ON = 압축판 크기 · 형 11-05 「그때 용량하고 아까 말한 확장자 같이 알수있어야」) · size 칸도 원본 파일에 이미 있음
    ['className="size-20 rounded-xl border border-border object-cover"', 'className="size-20 cursor-zoom-in rounded-xl border border-border object-cover" onClick={() => (window as unknown as { nmZoom?: (s: string) => void }).nmZoom?.(image.url)}'],
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
    ['      <p className="type-sub mt-0.5 text-duet-ink-2">\n        Add a task with +, or start one from Up next.\n      </p>\n', ""],   // 둘째 줄(안내) 통째 뺌(형 11-02 08:1x 「옆에 설명글은 빼줘」)
  ],
  // 설정 = YETA 설정 꼴(nomute/ui/yeta-settings.tsx · 형 10-28 10:22 「그 예타에도 설정이 있거든? 그쪽을 가져와서」) — 원본 화면(봇·연결·기능·루틴·승인 규칙·알림·비밀번호·관리자 = 우리 자료 없음) 대신 우리 판
  "app/src/routes/_authed/settings/index.tsx": [
    ['import { StandingInstructions } from "@/components/settings/standing-instructions";', 'import { StandingInstructions } from "@/components/settings/standing-instructions";\nimport { YetaSettings } from "@nomute/ui/yeta-settings";'],
    ["function RouteComponent() {", "function RouteComponent() {\n  return <YetaSettings />;\n}\n\nfunction UpstreamSettings() {"],
  ],
};

/** openbot = 원본 openbot 폴더(app·shared) · nomute = 이 폴더 */
export function nomuteOverrides(openbot: string, nomute: string): Plugin {
  const up = `${norm(openbot)}/`;
  const ours = (f: string) => path.join(nomute, f);
  const libSeen = new Set<string>();   // 고칠 파일이 빌드에 들어왔나(판이 바뀌면 파일 이름이 달라져 아무 말 없이 지나감)
  return {
    name: "nomute-overrides",
    enforce: "pre",
    buildEnd() {
      for (const lib of Object.keys(PATCH_LIB)) if (!libSeen.has(lib)) this.warn(`nomute 라이브러리 고치기: ${lib} 파일이 빌드에 없음(판이 바뀜)`);
    },
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
      const lib = Object.keys(PATCH_LIB).find((k) => f.endsWith(`/${k}`));
      if (lib) {
        libSeen.add(lib);
        let out = code;
        for (const [from, to] of PATCH_LIB[lib]) {
          if (!out.includes(from)) this.warn(`nomute 라이브러리 고치기: ${lib} 에 글자 없음(판이 바뀜)`);
          out = out.replace(from, to);
        }
        return out;
      }
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

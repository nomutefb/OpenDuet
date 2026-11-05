// 새 사무실 껍데기 = YETA 껍데기 꼴(형 10-28 11:22 「네비는 늘 위 · 옮겨도 뒤 그대로」 · 11:26 「뼈대 그대로로 yeta로」 · 장부 office-yeta-chat.md 「껍데기 이음 꼴」)
//   로그인 뒤 공통 자리(원본 _authed 라우트 Outlet 둘레 · overrides.ts PATCH)에 한 번만 섬 → 어디로 가도 껍데기는 그대로
//   판(네비 칸 · 형 12:24 · 10-31 15:1x 「에디터랑 겹칠 필요는없는거같아」 · 「에디터는 그냥 서랍 누르면 뜨면 될듯.」 = 에디터 판 뺌) = 홈 · 대화방(목록) · 대화 — 처음 갈 때 한 번 그리고 계속 살려 둠(숨김만 = 스크롤·쓰던 글 그대로) · 들어오는 판 = YETA ypickIn(./shell.css)
//   모달(≡ 서랍 · 형 12:24~12:26 「덜 중요한걸 좀 더 세부로 모으려는 의도」) = 할 일 · 러너 · LEGACY · 뉴스 요약 · 채널 요약 · SNS · 요약 요청 · 에디터 · 결의 방 · 토큰 · 피드백 · 설정 — 판 위에 덮고 닫으면 아래 판 그대로
//     에디터 판(editor-menu 패널)에만 있던 LEGACY·에디터(카드 제작·영상·유튜브)는 서랍 칸으로 옮겨 잃지 않음(형 10-31 15:1x · 빠르 판) · 나머지 네 칸은 이미 서랍 것(겹침 = 에디터 판 쪽을 뺌)
//     결의 방·토큰·피드백 = 앱 안(./gyeol-room.tsx · tokens.tsx · feedback.tsx · 전엔 에디터 원본 화면 viewer/gyeol-room.html · tokens.html · feedback.html 을 품음) · 설정 = 원본 settings 화면(보조 03 YETA 설정)
//   그 밖 길(할 일 하나 보기 등) = 판 위에 덮는 쪽(원본 머리 = 뒤로) · PC(768px~) = 왼쪽 끝 얼굴 띠(형 11:21~11:26)
//   누르면 앱 밖으로 나가던 링크 = #/web 판(앞 판·앞 모달 위에 한 겹 · 「<」 = 그대로 돌아감 · ./inapp.ts · 형 15:32 「모두 누르면 앱 내에서 작동되게」) · 네비 = 모달 위(형 「네비게이션은 유지」)
import { TodoBar } from "./todo-bar";   // 밥상 할 일 띠(형 11-04 11:51)
import { RunnerGauges } from "./runner-gauges";   // PC 반갈 러너 칸(봄 11-05)
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode, Suspense, lazy, useEffect, useRef, useState } from "react";
import { AttentionNotifier } from "@/components/bot-profile/attention";
import { DuetIcon } from "@/components/duet/icons";
import { useTabSpace } from "@/components/shell/app-shell";
import { ChatPresenceProvider, useChatServerBusy, useServerWork } from "@/components/shell/chat-presence";
import { FinishedForYou } from "@/components/shell/finished-for-you";
import { PageHeader, ShellHeader } from "@/components/shell/header";
import { PageChromeProvider } from "@/components/shell/page-chrome";
import { TasksScreen } from "@/components/shell/tasks-screen";
import { useChannelEvents } from "@/lib/channels/use-channel-events";
import { Route as SettingsIndex } from "@/routes/_authed/settings/index";
import { HomeScreen } from "../home/home-screen";
import { RunnerScreen } from "../runner/runner-screen";
import { NewsList } from "../home/news-list";   // PC 반갈 아래 칸 = 실시간 뉴스 제목 목록(형 11-05 14:39)
import { SchedDesk } from "./sched-desk";
import { StatusBoard } from "./status-board";
import { DrawerPage } from "./drawer-page";
import { WaveBg } from "./wave-bg";   // 설정·서랍 뒤 물결(형 11-01)
import { TabBar } from "../swap/tab-bar";
import { SceneBg } from "./thumb-maker/scene-bg";
import "../home/home-scene.css";
import { HYUNG_ID, idOf, roomAgentIds } from "../data/office";
import { enterRoom } from "../data/read-state";
import { FaceImg, FaceStack } from "./faces";
import { frameUrl, hookFrame, listenAppLinks, toneFrame } from "./inapp";
import { IssueView } from "./issue";
import { PinBar } from "./pins";
import { OfficeChat } from "./office-chat";
import { NewsModal, newsFileOf } from "./news";
import { ThumbHist } from "./thumb-hist";   // 서랍 「썸네일 이력」(형 11-01 「그 내 뉴스 에디터에서 쓰는 썸네일 … 완전히 내재화 부탁해.」)
import { FeedModal } from "./feed";   // 서랍 「뉴스 전체」 = 에디터 피드 탭 네이티브(형 11-01 「그치 이거지. 이 느낌으로 살리면돼.」 · 「이런식으로 다 가져와주라」)
import { ChanModal } from "./chan";
import { TrendModal } from "./trend";   // 서랍 「SNS 전체」 = 에디터 트렌드 탭 네이티브(전엔 FRAME 으로 품음)
import { ScrapModal } from "./scrap";   // 서랍 「LEGACY」 = 에디터 수집함 탭 네이티브(전엔 FRAME 으로 품음)
import { TokensModal } from "./tokens";   // 서랍 「토큰」·「결의 방」·「피드백」 = 에디터 페이지 네이티브(전엔 FRAME 으로 품음)
import { GyeolModal } from "./gyeol-room";
import { StoriesModal } from "./stories";   // 밥상 이야기(형 11-04 15:4x · 서랍 칸 · 밥상 방 오른쪽 위 그림은 ./room-search.tsx)
import { FeedbackModal } from "./feedback";
import { QueueModal } from "./queue";
import { MsgsModal } from "./msgs";
import { AcctModal } from "./acct";   // 서랍 「계정 전환」 = 에디터 설정 ▸ 계정 전환을 앱 안으로(봄 11-01)
import { GenOptModal } from "./genopt";   // 서랍 「생성 옵션」 = 에디터 설정 ▸ 기본값 그림 줄을 앱 안으로(봄 11-01)
import { LockModal } from "./lock";   // 서랍 「잠금」 = 에디터 설정 ▸ 자동 잠금을 앱 안으로(봄 11-01)
import { KwModal } from "./kw";   // 서랍 「키워드 알림」 = 에디터 설정 ▸ 키워드 알림을 앱 안으로(봄 11-01)
import { SnsAccModal } from "./snsacc";   // 서랍 「구독 채널」 = 에디터 설정 ▸ 구독 채널을 앱 안으로(봄 11-01)
import { DownloadModal } from "./dl";   // 서랍 「다운로드」 = 에디터 설정 ▸ 다운로드를 앱 안으로(봄 11-01)
import { PushDevsModal } from "./push-devs";   // 서랍 「구독 기기」 = 에디터 설정 ▸ 구독 기기를 앱 안으로(봄 11-01)
import { SensorModal } from "./sensor";   // 서랍 「센서」 = 에디터 설정 ▸ 센서를 앱 안으로(봄 11-01)
import { MemoModal } from "./memo";   // 서랍 「메모」 = 에디터 설정 ▸ 메모를 앱 안으로(봄 11-01)   // 서랍 「알림메세지」 = 에디터 알림함을 앱 안으로(봄 11-01)   // 서랍 「대기열」 = 에디터 대기열 창을 앱 안으로(봄 11-01)
import { SnsModal } from "./sns";
const ThumbMaker = lazy(() => import("./thumb-maker"));   // 서랍 「에디터」 = 썸네일 생성기 앱 안(형 11-02 09:28 「이거 아예 이 디자인하고 배경 살려서 인앱 안으로 넣어줘」 · 원본 엔진·CSS 가 커서 열 때만 받음)
import { AskModal } from "./ask";   // 서랍 「요약 요청」(에디터 넷째 탭 기능 → 서랍 네이티브 · 형 10-31 「기능들이 다 서랍으로」)
import { RoomList, useRoomOrder } from "./room-list";
import { RoomFab } from "./room-fab";   // 대화방 우하단 단추(형 11-01)
import { DecideFab } from "./decide-pop";   // 대화방 우하단 + 위 = 형 결정 노트 단추(형 11-01 08:36)
import { useSplit, useWide } from "./side";
import "./shell.css";

export type Pane = "home" | "rooms" | "chat";
export type Modal = "tasks" | "runner" | "legacy" | "ask" | "news" | "thumbhist" | "chan" | "sns" | "edtool" | "feed" | "trend" | "chanfull" | "askfull" | "edq" | "edsearch" | "eddl" | "edmsgs" | "edmemo" | "edsensor" | "edkw" | "edsnsacc" | "edpush" | "edgenopt" | "edlock" | "edacct" | "gyeol" | "story" | "play" | "tokens" | "feedback" | "settings" | "sched" | "drawer" | "status";
/** 서랍 차례(형 12:25·12:26) — 이름 · 그림 · 길 */
export const MODALS: { id: Modal; label: string; icon: "tasks" | "activity" | "sparkle" | "bolt" | "reply" | "settings" | "chat" | "dashboard" | "globe" | "page" | "inbox" | "plus" | "menu" | "calendar" | "search" | "box" | "bell" | "file" | "phone" | "sort" | "lock" | "key" | "layout"; to: string; desc?: string }[] = [
  { id: "tasks", label: "할 일", icon: "tasks", to: "/tasks" },
  { id: "status", label: "작동", icon: "activity", to: "/status" },   // 네비 4번 = 작동 표(형 11-05 · ./status-board.tsx · 서랍 목록엔 안 넣음)
  { id: "sched", label: "스케줄", icon: "calendar", to: "/sched" },   // 서랍 「일」 칸(형 11-05 「스케줄러는 메뉴5번 서랍 안으로 넣을게」 · 옛 네비 4번)
  { id: "runner", label: "러너", icon: "activity", to: "/runner" },
  { id: "legacy", label: "LEGACY", icon: "inbox", to: "/legacy", desc: "수집함 · 고르기·묶기·PICK" },   // 에디터 「LEGACY(레거시)」 = 수집함(옛 에디터 판 칸 → 서랍 · 형 10-31 15:1x) · 앱 안(./scrap.tsx · 전엔 /?tab=scrap 품음)
  { id: "ask", label: "요약 요청", icon: "chat", to: "/ask", desc: "글·링크·사진 · 링크 판별·초안 보존" },   // 에디터 ＋ 「요약 요청」 = 같은 api/submit · 서랍에서 바로
  { id: "thumbhist", label: "썸네일 이력", icon: "layout", to: "/thumbhist", desc: "만든 썸네일 보기·저장" },   // 에디터 썸네일 「이전 제작」(thumb-hist.json · ./thumb-hist.tsx)
  { id: "chan", label: "채널 요약", icon: "dashboard", to: "/chan", desc: "한눈" },   // 에디터 「채널 요약」 한눈(전체 보기 = #/web)
  { id: "sns", label: "SNS", icon: "globe", to: "/sns", desc: "한눈" },   // 에디터 「SNS」 한눈(전체 보기 = #/web)
  { id: "edtool", label: "에디터", icon: "plus", to: "/edtool", desc: "카드 제작·영상 편집·유튜브" },
  // 에디터 첫 화면 탭·도구를 서랍 칸마다 바로(형 11-01 「edit.nomute.kr에 있는 기능들 모두 매우 자연스럽게 메뉴 5번으로 완전히 녹여줘 / 지금 저 기능이 완전히 유지되어야해」 · 공통/문서/2026-11-01-서랍-에디터-이식/안.md)
  { id: "news", label: "뉴스 기사", icon: "page", to: "/news", desc: "최신 목록·기사 요약" },   // 에디터 「뉴스 요약」 목록(누르면 앱 안 기사 한 장 = #/news?a=<file> · 썸네일·본문·카드 · 고치기만 에디터)
  { id: "feed", label: "뉴스 요약", icon: "page", to: "/feed", desc: "요약한 기사 · 기사 한 장" },   // 용어 = 뉴스 요약(형 11-01 18:0x 「뉴스 요약 < 뉴스 전체는 용어 변경」) · 옛 「뉴스 요약」 짧은 목록 칸은 이 칸과 겹쳐 뺌(#/news 주소는 기사 한 장으로 그대로)   // 에디터 피드 탭(/?tab=feed)을 앱 네이티브로(./feed.tsx · 전엔 FRAME 으로 품음 · 쓰기만 에디터 한 겹)
  { id: "trend", label: "SNS 전체", icon: "globe", to: "/trend", desc: "섹션 전부·구독 채널" },   // 앱 안(./trend.tsx) · 새로 수집·커뮤니티 전송만 「에디터에서」
  { id: "chanfull", label: "채널 전체", icon: "dashboard", to: "/chanfull", desc: "차트·게시물·결의 보드" },
  // 에디터 설정 메뉴 안 칸들(전엔 러너 톱니로만 열림) = 에디터 /?pop=<이름> 딥링크(빠르 11-01 04:23 · 이름 = 봄 안 표)
  { id: "edq", label: "대기열", icon: "tasks", to: "/edq", desc: "재시도·취소" },
  { id: "edsearch", label: "검색", icon: "search", to: "/edsearch", desc: "뉴스 제목·요약에서 찾기" },
  { id: "eddl", label: "다운로드", icon: "box", to: "/eddl", desc: "주소 → 사진·영상·파일" },
  { id: "edmsgs", label: "알림메세지", icon: "bell", to: "/edmsgs", desc: "24시간 알림·조치" },
  { id: "edmemo", label: "에디터 메모", icon: "file", to: "/edmemo", desc: "작업 기록" },
  { id: "edsensor", label: "센서", icon: "activity", to: "/edsensor", desc: "키워드 센서" },
  { id: "edkw", label: "키워드 알림", icon: "bell", to: "/edkw", desc: "키워드 켜기·목록" },
  { id: "edsnsacc", label: "구독 채널", icon: "globe", to: "/edsnsacc", desc: "X·틱톡·인스타·유튜브 계정" },
  { id: "edpush", label: "구독 기기", icon: "phone", to: "/edpush", desc: "알림 받는 기기" },
  { id: "edgenopt", label: "AI 썸네일·이미지", icon: "sparkle", to: "/edgenopt", desc: "엔진·모델·크기·화풍" },
  { id: "edlock", label: "화면 잠금", icon: "lock", to: "/edlock", desc: "잠금·PIN·자동 잠금" },
  { id: "edacct", label: "계정 전환", icon: "key", to: "/edacct", desc: "관리자 · 러너 Claude 계정" },   // 에디터 ＋ 「에디터(카드 제작·영상 편집·유튜브)」 = 도구 창(에디터 /?tool=thumb 그대로 품음 · 옛 에디터 판 칸 → 서랍)
  { id: "gyeol", label: "결의 방", icon: "sparkle", to: "/gyeol" },
  { id: "story", label: "밥상 이야기", icon: "file", to: "/story" },   // 종 틈에 지은 글 모음(형 11-04 15:4x · ./stories.tsx)
  { id: "play", label: "놀이터", icon: "sparkle", to: "/play" },   // 형 10-31 「놀이터를 … 서랍메뉴로 아예 빼줘」 · 주소 = viewer/play
  { id: "tokens", label: "토큰", icon: "bolt", to: "/tokens" },
  { id: "feedback", label: "피드백", icon: "reply", to: "/feedback" },
  { id: "settings", label: "설정", icon: "settings", to: "/settings" },
  { id: "drawer", label: "서랍", icon: "menu", to: "/drawer" },   // 네비 5번 = 한 화면(./drawer-page.tsx) · 설정 = 네비 6번
];
const FRAME: Partial<Record<Modal, string>> = { play: "/play/" };   // 에디터 「에디터」(edtool) 는 이제 앱 안(./thumb-maker · 전엔 /?tool=thumb&inapp=1 품음)   // 에디터 원본 화면 그대로(같은 사이트 · 탭·도구 = editor-menu/read.ts linkOf 와 같은 딥링크 문법)

type Where = { pane: Pane } | { modal: Modal } | { web: true } | { issue: string } | { page: true } | { bare: true };
/** 길 → 판·모달 · page = 판 위에 덮는 원본 화면 · bare = 껍데기 없이(가입 안내 등) */
export function whereFor(pathname: string): Where {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/" || p === "/home") return { pane: "home" };   // 앱 열면 = 홈(형 12:21 「홈이 뜨는 지금이 맞고」 · PM 12:55)
  if (/^\/(channels|group)\/[^/]+$/.test(p)) return { pane: "chat" };   // 회의실 = #/group/all
  if (p === "/rooms") return { pane: "rooms" };
  if (p === "/editor") return { pane: "home" };
  if (p === "/askfull") return { modal: "ask" };   // 옛 「요약 요청 · 에디터 판」 주소 = 앱 요약 요청(빠르 11-01 · 합침)   // 옛 에디터 판 주소(즐겨찾기·옛 링크) = 홈으로(판 없음 · 칸은 서랍에)
  const m = MODALS.find((x) => x.to === p);
  if (m) return { modal: m.id };
  if (p === "/web") return { web: true };   // 앱 밖 주소 = 앱 안 한 겹(#/web?u=…)
  const iss = p.match(/^\/issue\/(\d+)$/);
  if (iss) return { issue: iss[1] };   // 우리 저장소 이슈 = 앱 안 「< 이슈 N」 한 겹(./issue.tsx)
  if (/^\/(onboarding|sign)/.test(p)) return { bare: true };
  return { page: true };
}
const roomOf = (pathname: string) => { const m = pathname.match(/^\/(?:channels|group)\/([^/]+)/); return m ? decodeURIComponent(m[1]) : "all"; };
export const chatHref = (room: string) => (room === "all" ? "/group/all" : `/channels/${encodeURIComponent(room)}`);
const paneHref = (pane: Pane, room: string) => (pane === "chat" ? chatHref(room) : `/${pane}`);

const SettingsPage = SettingsIndex.options.component as () => ReactNode;

export function NomuteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const nav = useNavigate();
  const where = whereFor(pathname);
  const wide = useWide();
  const split = useSplit();   // PC 반갈(오른쪽 반 = 위 러너 · 아래 뉴스 · ./side.tsx)
  const [room, setRoom] = useState(() => roomOf(pathname));
  const [base, setBase] = useState<Pane>(() => ("pane" in where ? where.pane : "chat"));   // 모달·덮는 쪽 아래에 깔린 판
  const [open, setOpen] = useState<Set<Pane>>(() => new Set(["pane" in where ? where.pane : "chat"]));
  const pane = "pane" in where ? where.pane : base;
  const web = "web" in where ? new URLSearchParams(searchStr).get("u") || "" : null;
  const [under, setUnder] = useState<Modal | null>(null);   // #/web 아래에 깔린 앞 모달(돌아오면 그대로)
  const issue = "issue" in where ? where.issue : null;
  const layer = web != null || issue != null;   // #/web · #/issue = 앞 모달 위 한 겹
  const modal = "modal" in where ? where.modal : layer ? under : null;
  useEffect(() => listenAppLinks(), []);
  useEffect(() => {
    if ("modal" in where) setUnder(where.modal);
    else if ("pane" in where) setUnder(null);
    if (!("pane" in where)) return;
    if (where.pane === "chat") {
      const nextRoom = roomOf(pathname);
      if (base !== "chat" || room !== nextRoom) enterRoom(nextRoom);
      setRoom(nextRoom);
    }
    setBase(where.pane);
    if (!open.has(where.pane)) setOpen((s) => new Set(s).add(where.pane));
  }, [pathname]);   // eslint-disable-line react-hooks/exhaustive-deps
  useChannelEvents();
  // 대화 판에서 뒤로가기 = 늘 대화방 목록으로(형 10-31 09:4x 「3번째 대화창에서 뒤로가기하면 바로 2번으로 가게해주고」 · 셋째 칸 대화 → 둘째 칸 대화방)
  //   해시 기록은 「바로 앞 주소」(앞 방·홈)로 돌아가므로, 대화 판이 맨 위에 있을 때 popstate 가 오면 그 자리를 /rooms 로 바꿔 끼움(replace · 기록 한 칸만 씀) · 모달·#/web·이슈 한 겹이 위에 있으면 그쪽 「<」 가 맡음
  useEffect(() => {
    if (pane !== "chat" || modal || layer || "page" in where) return;
    const onPop = (e: PopStateEvent) => {
      if (!e.state) return;   // location.hash = 로 옮길 때도 popstate 가 옴(state 없음 · 프로필 「대화」·앱 안 링크) = 뒤로가기 아님
      if (document.querySelector(".nm-zoom")) return;   // 사진 크게 보기를 닫는 뒤로 = 대화 판 그대로(ui/office-chat.tsx zoomImage)
      const at = location.hash.replace(/^#/, "") || "/";
      if (at !== "/rooms") void nav({ to: "/rooms", replace: true });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [pane, modal, layer, where, nav]);
  const chat = useChatServerBusy(pane === "chat" && !modal);
  const serverWork = useServerWork(chat.busy, chat.threadId);
  const stage = useRef<HTMLDivElement>(null);
  useTabSpace(stage);
  if ("bare" in where) return <>{children}</>;

  const SEE = new Set(["settings", "drawer"]);   // 바탕 비치는 판(5번 서랍 · 6번 설정)
  const show = (id: Pane, node: ReactNode) =>
    open.has(id) ? <section key={id} className={`nm-pane ${pane === id ? "on" : ""}`} aria-hidden={pane !== id} inert={pane !== id || undefined}>{node}</section> : null;
  const closeModal = () => {   // 서랍에서 연 칸의 「<」 = 서랍으로(봄 11-01 · 전엔 아래 판(홈·대화방)으로 갔음) · 표지 = drawer-page 가 누를 때 남김
    if (modal === "news" && newsFileOf(searchStr)) {   // 뉴스 기사 한 장의 「<」 = 목록으로(앞 길이 앱 안이면 뒤로 = 보던 자리 · 처음부터 한 장이면 목록 길로)
      if (((history.state as { __TSR_index?: number } | null)?.__TSR_index ?? 0) > 0) history.back();
      else void nav({ to: "/news", replace: true });
      return;
    }
    let back = false;
    try { back = !!modal && modal !== "drawer" && sessionStorage.getItem("nm-from-drawer") === modal; sessionStorage.removeItem("nm-from-drawer"); } catch { /* 저장 못 쓰면 옛 길 */ }
    void nav({ to: back ? "/drawer" : paneHref(base, room) });
  };
  const closeWeb = () => {   // 앞 길이 앱 안이면 뒤로(앞 판·모달 그대로) · 처음부터 #/web 이면 깔린 판으로
    if (((history.state as { __TSR_index?: number } | null)?.__TSR_index ?? 0) > 0) history.back();
    else void nav({ to: under ? MODALS.find((x) => x.id === under)!.to : paneHref(base, room) });
  };
  const M = modal ? MODALS.find((x) => x.id === modal) : undefined;
  return (
    <ChatPresenceProvider serverWork={serverWork}>
      <div className={`duet-touch nm-yeta flex h-svh overflow-hidden bg-duet-surface${split ? " nm-split-root" : ""}`}>
        <AttentionNotifier />
        <FinishedForYou />
        {wide ? <FaceStrip current={pane === "chat" ? room : ""} /> : null}
        <div ref={stage} className={`duet-face relative isolate min-w-0 flex-1 text-duet-ink [--duet-tab-space:86px]${M && SEE.has(M.id) ? " nm-see" : ""}${split ? " nm-split-l" : ""}`}>   {/* nm-see = 비운 판이 열린 동안 밑 화면(홈·대화방)은 숨김(판 너머로 안 비치게) */}
          <SceneBg className="nm-app-ambient" />   {/* 모든 화면 뒤 = 에디터 웹 메인 3D 장면 · 라임 · 옅은 막(형 11-03 14:5x 「여기에도 다 배경 깔아줘 단 너무 강조되면안돼. 글자가 잘보여야되니까」 · home/home-scene.css) */}
          {show("home", <HomeScreen />)}
          {show("rooms", <div className="nm-col"><RoomsPane /></div>)}
          {show("chat", (
            <div className="nm-col">
              <ShellHeader floating menuOpen={false} onMenu={() => {}} />
              {wide ? null : <button type="button" className="nm-room-back" aria-label="대화방 목록으로" onClick={() => void nav({ to: "/rooms" })}><DuetIcon name="chevronLeft" size={20} /></button>}   {/* 형 10-31 「좌상단에 좌측 꺽쇠가 있어줘야 함」 · 뒤로 버튼 없는 폰 */}
              <PinBar room={room} key={"pin:" + room}>{room === "guide" ? <TodoBar room={room} /> : null}</PinBar>   {/* 방마다 고정 띠(카톡 꼴 · 형 16:46 · ./pins.tsx) + 그 밑 방 카드(평의회 2 ⑨ · ./meet-card.tsx) */}
              <main className="flex min-h-0 flex-1 flex-col"><OfficeChat room={room} key={room} active={pane === "chat" && roomOf(pathname) === room && !modal && !layer && !("page" in where)} /></main>
            </div>
          ))}
          {"page" in where ? (
            <section className="nm-pane nm-over on">
              <PageChromeProvider>
                <div className="nm-col [--duet-tab-space:max(env(safe-area-inset-bottom),12px)]">
                  <PageHeader />
                  <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
                </div>
              </PageChromeProvider>
            </section>
          ) : null}
          <TabBar pane={"pane" in where ? where.pane : null} modal={modal} chatTo={chatHref(room)} />
          {M ? (
            <div className={SEE.has(M.id) ? "nm-modal see" : "nm-modal"} role="dialog" aria-modal="true" aria-label={M.label} inert={layer || undefined}>   {/* see = 5번 서랍·6번 설정 = 판을 비워 껍데기 라임 3D 바탕이 그대로 보임(형 11-03 15:07 「요거 5번 6번 메뉴에도 그대로 적용하자」 · 물결 받침 뺌) */}
              {M.id === "feed" || M.id === "trend" || M.id === "legacy" || M.id === "tokens" || M.id === "gyeol" || M.id === "feedback" ? <WaveBg /> : null}   {/* 뉴스 요약 뒤 물결 = 시범(형 11-01 18:0x 「시범적으로 기본에 웹에 있던 그런 배경하나 깔아봐도좋아」) */}
              <div className="nm-modal-h">
                <button type="button" className="nm-modal-back" aria-label="닫기" onClick={closeModal}><DuetIcon name="chevronLeft" size={20} /></button>
                <b>{M.label}</b>
              </div>
              <div className={FRAME[M.id] ? "nm-modal-b frame" : M.id === "edtool" ? "nm-modal-b tm-host" : "nm-modal-b flush"}>   {/* flush = 판이 머리 알약 밑으로 지나감(윗여백 두 겹 0) */}
                {FRAME[M.id] ? <FramePage title={M.label} src={FRAME[M.id]!} />
                  : M.id === "edtool" ? <Suspense fallback={null}><ThumbMaker /></Suspense>   // 썸네일 생성기 = 원본 판·엔진·배경 그대로(./thumb-maker · 머리 「✧ 에디터 · 카드 제작」 = 옛 index 도구 창 꼴)
                  : M.id === "tasks" ? <div className="nm-col"><TasksScreen /></div>
                  : M.id === "runner" ? <div className="nm-scroll"><RunnerScreen /></div>
                  : M.id === "sched" ? <div className="nm-scroll"><SchedDesk /></div>
                  : M.id === "status" ? <div className="nm-scroll"><StatusBoard /></div>
                  : M.id === "drawer" ? <div className="nm-scroll"><DrawerPage /></div>
                  : M.id === "ask" ? <div className="nm-scroll"><AskModal onClose={closeModal} /></div>
                  : M.id === "news" ? <div className="nm-scroll"><NewsModal /></div>
                  : M.id === "thumbhist" ? <div className="nm-scroll"><ThumbHist /></div>
                  : M.id === "feed" ? <div className="nm-scroll"><FeedModal /></div>
                  : M.id === "edsearch" ? <div className="nm-scroll"><FeedModal search /></div>   // 검색 = 뉴스 전체 검색 칸(에디터 검색 창은 피드 목록을 거르는 칸 · 봄 11-01)
                  : M.id === "edq" ? <div className="nm-scroll"><QueueModal /></div>
                  : M.id === "edmsgs" ? <div className="nm-scroll"><MsgsModal /></div>
                  : M.id === "edacct" ? <div className="nm-scroll"><AcctModal /></div>   // 계정 전환 = 앱 안(봄 11-01 · api/account · 20초 뒤 실제 값)
                  : M.id === "edgenopt" ? <div className="nm-scroll"><GenOptModal /></div>   // 생성 옵션 = 앱 안(봄 11-01 · imgProvider·imgOpt 바뀐 칸만 · AI 썸네일 켜기는 PIN 없을 때만)
                  : M.id === "edlock" ? <div className="nm-scroll"><LockModal /></div>   // 잠금 = 앱 안(봄 11-01 · 자동 잠금 분 · 켜기·PIN 은 에디터 설정 줄)
                  : M.id === "edkw" ? <div className="nm-scroll"><KwModal /></div>   // 키워드 알림 = 앱 안(봄 11-01 · 설정 한 장 kwItems·kwAlertOn · 발견 판정은 에디터·서버 그대로)
                  : M.id === "edsnsacc" ? <div className="nm-scroll"><SnsAccModal /></div>   // 구독 채널 = 앱 안(봄 11-01 · 같은 길 api/snsacc · 고친 플랫폼만 저장)
                  : M.id === "eddl" ? <div className="nm-scroll"><DownloadModal /></div>   // 다운로드 = 앱 안(봄 11-01 · 같은 길 vidpeek·vidl·vidlout·linkgrab · 같은 열쇠 = 이전 받기 공유)
                  : M.id === "edpush" ? <div className="nm-scroll"><PushDevsModal /></div>   // 구독 기기 = 앱 안(봄 11-01 · 같은 길 api/push list·toggle·remove)
                  : M.id === "edsensor" ? <div className="nm-scroll"><SensorModal /></div>   // 센서 = 앱 안(봄 11-01 · 같은 길 api/sensors · 형이 바꾸면 그 봇에게 알림)
                  : M.id === "edmemo" ? <div className="nm-scroll"><MemoModal /></div>   // 메모 = 앱 안(봄 11-01 · 서버 설정 한 장 = 에디터와 같은 메모)   // 알림메세지 = 앱 안(봄 11-01)   // 대기열 = 앱 안(봄 11-01 · 재시도만 에디터 한 겹)
                  : M.id === "chan" ? <div className="nm-scroll"><ChanModal /></div>
                  : M.id === "chanfull" ? <div className="nm-scroll"><ChanModal full /></div>   // 채널 전체 = 앱 안 조각(빠르 11-01 · 나머지 칸은 맨 아래 단추로 에디터)
                  : M.id === "sns" ? <div className="nm-scroll"><SnsModal /></div>
                  : M.id === "trend" ? <div className="nm-scroll"><TrendModal /></div>
                  : M.id === "legacy" ? <div className="nm-scroll"><ScrapModal /></div>
                  : M.id === "tokens" ? <div className="nm-scroll"><TokensModal /></div>
                  : M.id === "gyeol" ? <div className="nm-scroll"><GyeolModal /></div>
                  : M.id === "story" ? <div className="nm-scroll"><StoriesModal /></div>
                  : M.id === "feedback" ? <div className="nm-scroll"><FeedbackModal /></div>
                  : <div className="nm-scroll"><Suspense fallback={null}><SettingsPage /></Suspense></div>}
              </div>
            </div>
          ) : null}
          {web != null ? <WebLayer u={web} onClose={closeWeb} /> : null}
          {issue != null ? (
            <div className="nm-modal nm-web" role="dialog" aria-modal="true" aria-label={`이슈 ${issue}`}>
              <div className="nm-modal-h">
                <button type="button" className="nm-modal-back" aria-label="닫기" onClick={closeWeb}><DuetIcon name="chevronLeft" size={20} /></button>
                <b>이슈 {issue}</b>
              </div>
              <div className="nm-modal-b flush"><div className="nm-scroll"><IssueView key={issue} no={issue} /></div></div>
            </div>
          ) : null}
        </div>
        {split ? <SplitSide /> : null}
      </div>
    </ChatPresenceProvider>
  );
}

/** PC 반갈 오른쪽 반(형 11-05 13:26 그림 · 13:36 「가로 16 이야. 그러면 8 8 구성」 · 「4*4로 나눈다고 가정」 · 「2*4는 (좌측) 은 다 대화고」 · 「1*4 1행 ~ 1.5 는 러너 기본정보(… 게이지로 축약해서)」 · 「근데 갬성이 떨어지면안되.」 · 「나머지 3~2.5 를 실시간 뉴스 카드로.」)
 *  위 1.5/4 = 2 러너(맨 위 몸 줄 + 러너 판 게이지) · 아래 2.5/4 = 3 실시간 뉴스 카드(홈 카드 덱 그대로 · 「전송」 = 그 기사 요약 요청 · 형 13:38 「전송하면 그 아래에 요약 대기열 … 근데 거기까지 안바래」)
 *  러너 위젯(PC 바탕화면)은 내림(형 13:23 「그럼냅다치우고」 · 윈A CPU 1등) — 여기 한 창에 대화 · 러너 · 뉴스가 같이 있어 창이 따로 놀지 않음(형 13:20 「근데 창이 다 따로놀아;;ㅠㅠ」) */
function SplitSide() {
  return (
    <aside className="nm-split" aria-label="러너 · 뉴스">
      <section className="nm-split-run" aria-label="러너"><RunnerGauges /></section>   {/* 러너 기본정보 게이지(봄 · 형 11-05 13:37 「게이지로 축약」 · 「갬성이 떨어지면안되.」) · 다 보기 = 메뉴 러너 */}
      <section className="nm-split-news" aria-label="뉴스"><NewsList /></section>   {/* PC = 그림 없는 제목 목록(형 11-05 14:39 「pc판은 아예 뉴스에 아예 그림안뜨게 컴팩트하게 타이틀만」) · 폰 홈은 카드 덱 그대로 */}
    </aside>
  );
}

/** 품은 원본 화면(같은 사이트 에디터 화면 · 남의 사이트) — 안 링크·새 창 = 앱 안(hookFrame) · 겉 = YETA 톤(toneFrame · --modern-* 쓰는 화면만) · 남의 사이트는 손 못 댐 = 그대로 */
function FramePage({ src, title, onTitle }: { src: string; title: string; onTitle?: (t: string) => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const el = ref.current;
    const offs = [hookFrame(el), toneFrame(el)];
    const name = () => { try { const t = el?.contentDocument?.title; if (t && onTitle) onTitle(t); } catch { /* 남의 사이트 = 못 읽음 */ } };
    el?.addEventListener("load", name);
    return () => { offs.forEach((f) => f()); el?.removeEventListener("load", name); };
  }, [src]);   // eslint-disable-line react-hooks/exhaustive-deps
  return <iframe ref={ref} title={title} src={src} className="nm-modal-frame" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" />;
}

/** #/web 한 겹 — 머리 = 「< 이름」(같은 사이트 = 그 화면 제목 · 남의 사이트 = 사이트 이름) · 남의 사이트가 품기를 막아 빈 화면이면 오른쪽 지구 단추 = 밖에서 열기(그때만 쓰는 비상구) */
function WebLayer({ u, onClose }: { u: string; onClose: () => void }) {
  const [title, setTitle] = useState<[string, string]>(["", ""]);
  const ext = /^https?:\/\//i.test(u);
  let host = "";
  try { host = ext ? new URL(u).hostname.replace(/^(www|m)\./, "") : ""; } catch { /* 이름 없음 */ }
  const name = ext ? host : title[0] === u && title[1] ? title[1] : "에디터";
  return (
    <div className="nm-modal nm-web" role="dialog" aria-modal="true" aria-label={name}>
      <div className="nm-modal-h">
        <button type="button" className="nm-modal-back" aria-label="닫기" onClick={onClose}><DuetIcon name="chevronLeft" size={20} /></button>
        <b className="min-w-0 flex-1 truncate">{name}</b>
        {ext ? <a data-nm-out href={u} target="_blank" rel="noopener" className="nm-modal-back" aria-label="밖에서 열기(이 사이트가 앱 안 보기를 막을 때)"><DuetIcon name="globe" size={19} /></a> : null}
      </div>
      <div className="nm-modal-b frame"><FramePage key={u} src={frameUrl(u)} title={name} onTitle={(t) => setTitle([u, t])} /></div>
    </div>
  );
}

/** 목록 화면(카톡식 · 형 11:26 「대화랑 그냥 분리하자」) — 방 누르면 그 대화 판으로 */
function RoomsPane() {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-4 pb-[calc(var(--duet-tab-space,86px)+56px)]">   {/* 끝 줄이 우하단 단추에 안 가리게 */}
        <h1 className="sr-only">대화방</h1>   {/* 판 위 큰 제목 0(PM 13:04 · 형 「공간」 · 지금 판 = 네비 「대화방」 칸) */}
        <RoomList big />
      </div>
      <RoomFab />
      <DecideFab />
      {/* 영상 해석 허가 동그라미 뺌(형 11-05 11:10 「그럼 이제 그 채팅창 우하단에 영상 신청 이거는 없어도되는거지? 판단해보고, 별 의미없는 코드니까. 기능을 없애고 디자인도 없애줘.」 · 올리는 순간 받아쓰기 상주가 대신함) */}
    </>
  );
}

/** PC 왼쪽 끝 얼굴 띠 — 얼굴만(글자 0) · 차례 = 안 읽은 방 → 고정 → 나머지(목록 화면과 같은 차례) · 위아래 스크롤 · 맨 위 ≡ · 맨 아래 「+」·형 얼굴 붙박이 */
function FaceStrip({ current }: { current: string }) {
  const nav = useNavigate();
  const { list, ordered, count } = useRoomOrder();
  const go = (id: string) => { enterRoom(id); void nav({ to: chatHref(id) }); };
  return (
    <aside aria-label="방 얼굴 띠" className="nm-strip">
      <button type="button" className="nm-strip-btn" aria-label="대화 목록" onClick={() => void nav({ to: "/rooms" })}><DuetIcon name="menu" size={21} /></button>
      <div className="nm-strip-faces">
        {ordered.map((r) => {
          const n = count(r), p = r.with ? list.find((x) => x.who === r.with) : undefined, ids = roomAgentIds(r, list);
          return (
            <button key={r.id} type="button" className={`nm-face ${current === r.id ? "on" : ""}`} title={p?.name || r.name} aria-label={`${p?.name || r.name}${n > 0 ? ` · 안 읽은 글 ${n}개` : ""}`} onClick={() => go(r.id)}>
              {r.with ? <FaceImg id={idOf(r.with, list)} size={40} /> : ids.length ? <span className="nm-face-group"><FaceStack ids={ids.slice(0, 2)} size={22} /></span> : <DuetIcon name="chat" size={20} />}
              {n > 0 ? <b className="nm-badge">{n > 99 ? "99+" : n}</b> : n < 0 ? <i className="nm-dot" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
      <div className="nm-strip-foot">
        <button type="button" className="nm-strip-btn" aria-label="목록에서 방 고르기" onClick={() => void nav({ to: "/rooms" })}><DuetIcon name="plus" size={20} /></button>
        <button type="button" className="nm-face" aria-label="형 · 설정" onClick={() => void nav({ to: "/settings" })}><FaceImg id={HYUNG_ID} size={36} /></button>
      </div>
    </aside>
  );
}

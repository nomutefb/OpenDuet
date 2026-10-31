// 새 사무실 껍데기 = YETA 껍데기 꼴(형 10-28 11:22 「네비는 늘 위 · 옮겨도 뒤 그대로」 · 11:26 「뼈대 그대로로 yeta로」 · 장부 office-yeta-chat.md 「껍데기 이음 꼴」)
//   로그인 뒤 공통 자리(원본 _authed 라우트 Outlet 둘레 · overrides.ts PATCH)에 한 번만 섬 → 어디로 가도 껍데기는 그대로
//   판(네비 칸 · 형 12:24) = 홈 · 대화방(목록) · 대화 · 에디터 — 처음 갈 때 한 번 그리고 계속 살려 둠(숨김만 = 스크롤·쓰던 글 그대로) · 들어오는 판 = YETA ypickIn(./shell.css)
//   모달(≡ 서랍 · 형 12:24~12:26 「덜 중요한걸 좀 더 세부로 모으려는 의도」) = 할 일 · 러너 · 결의 방 · 토큰 · 피드백 · 설정 — 판 위에 덮고 닫으면 아래 판 그대로
//     결의 방·토큰·피드백 = 에디터 원본 화면(viewer/gyeol-room.html · tokens.html · feedback.html) 그대로 띄움(위젯 탭과 같은 원본 · 새로 짜기 0) · 설정 = 원본 settings 화면(보조 03 YETA 설정)
//   에디터 판 = 보조 03 `nomute/editor-menu/screen.tsx` 의 EditorMenuScreen(그 자리·이름이면 저절로 끼움 · 없으면 「준비 중」 · office-editor-menu.md)
//   그 밖 길(할 일 하나 보기 등) = 판 위에 덮는 쪽(원본 머리 = 뒤로) · PC(768px~) = 왼쪽 끝 얼굴 띠(형 11:21~11:26)
//   누르면 앱 밖으로 나가던 링크 = #/web 판(앞 판·앞 모달 위에 한 겹 · 「<」 = 그대로 돌아감 · ./inapp.ts · 형 15:32 「모두 누르면 앱 내에서 작동되게」) · 네비 = 모달 위(형 「네비게이션은 유지」)
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { type ComponentType, type ReactNode, Suspense, lazy, useEffect, useRef, useState } from "react";
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
import { TabBar } from "../swap/tab-bar";
import { HYUNG_ID, idOf, roomAgentIds } from "../data/office";
import { enterRoom } from "../data/read-state";
import { FaceImg, FaceStack } from "./faces";
import { frameUrl, hookFrame, listenAppLinks, toneFrame } from "./inapp";
import { IssueView } from "./issue";
import { PinBar } from "./pins";
import { MeetCard } from "./meet-card";
import { OfficeChat } from "./office-chat";
import { NewsModal } from "./news";
import { ChanModal } from "./chan";
import { SnsModal } from "./sns";
import { AskModal } from "./ask";   // 서랍 「요약 요청」(에디터 넷째 탭 기능 → 서랍 네이티브 · 형 10-31 「기능들이 다 서랍으로」)
import { RoomList, useRoomOrder } from "./room-list";
import { useWide } from "./side";
import "./shell.css";

export type Pane = "home" | "rooms" | "chat" | "editor";
export type Modal = "tasks" | "runner" | "ask" | "news" | "chan" | "sns" | "gyeol" | "tokens" | "feedback" | "settings";
/** 서랍 차례(형 12:25·12:26) — 이름 · 그림 · 길 */
export const MODALS: { id: Modal; label: string; icon: "tasks" | "activity" | "sparkle" | "bolt" | "reply" | "settings" | "chat" | "dashboard" | "globe" | "page"; to: string }[] = [
  { id: "tasks", label: "할 일", icon: "tasks", to: "/tasks" },
  { id: "runner", label: "러너", icon: "activity", to: "/runner" },
  { id: "ask", label: "요약 요청", icon: "chat", to: "/ask" },   // 에디터 ＋ 「요약 요청」 = 같은 api/submit · 서랍에서 바로
  { id: "news", label: "뉴스 요약", icon: "page", to: "/news" },   // 에디터 「뉴스 요약」 목록(누르면 그 기사 요약 = #/web)
  { id: "chan", label: "채널 요약", icon: "dashboard", to: "/chan" },   // 에디터 「채널 요약」 한눈(전체 보기 = #/web)
  { id: "sns", label: "SNS", icon: "globe", to: "/sns" },   // 에디터 「SNS」 한눈(전체 보기 = #/web)
  { id: "gyeol", label: "결의 방", icon: "sparkle", to: "/gyeol" },
  { id: "tokens", label: "토큰", icon: "bolt", to: "/tokens" },
  { id: "feedback", label: "피드백", icon: "reply", to: "/feedback" },
  { id: "settings", label: "설정", icon: "settings", to: "/settings" },
];
const FRAME: Partial<Record<Modal, string>> = { gyeol: "/gyeol-room.html", tokens: "/tokens.html", feedback: "/feedback.html" };   // 에디터 원본 화면 그대로(같은 사이트)

type Where = { pane: Pane } | { modal: Modal } | { web: true } | { issue: string } | { page: true } | { bare: true };
/** 길 → 판·모달 · page = 판 위에 덮는 원본 화면 · bare = 껍데기 없이(가입 안내 등) */
export function whereFor(pathname: string): Where {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/" || p === "/home") return { pane: "home" };   // 앱 열면 = 홈(형 12:21 「홈이 뜨는 지금이 맞고」 · PM 12:55)
  if (/^\/(channels|group)\/[^/]+$/.test(p)) return { pane: "chat" };   // 회의실 = #/group/all
  if (p === "/rooms") return { pane: "rooms" };
  if (p === "/editor") return { pane: "editor" };
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
const editorMods = import.meta.glob("../editor-menu/screen.tsx");
const EditorMenu = editorMods["../editor-menu/screen.tsx"]
  ? lazy(() => (editorMods["../editor-menu/screen.tsx"]() as Promise<{ EditorMenuScreen: ComponentType }>).then((m) => ({ default: m.EditorMenuScreen })))
  : null;

export function NomuteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const nav = useNavigate();
  const where = whereFor(pathname);
  const wide = useWide();
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

  const show = (id: Pane, node: ReactNode) =>
    open.has(id) ? <section key={id} className={`nm-pane ${pane === id ? "on" : ""}`} aria-hidden={pane !== id} inert={pane !== id || undefined}>{node}</section> : null;
  const closeModal = () => void nav({ to: paneHref(base, room) });
  const closeWeb = () => {   // 앞 길이 앱 안이면 뒤로(앞 판·모달 그대로) · 처음부터 #/web 이면 깔린 판으로
    if (((history.state as { __TSR_index?: number } | null)?.__TSR_index ?? 0) > 0) history.back();
    else void nav({ to: under ? MODALS.find((x) => x.id === under)!.to : paneHref(base, room) });
  };
  const M = modal ? MODALS.find((x) => x.id === modal) : undefined;
  return (
    <ChatPresenceProvider serverWork={serverWork}>
      <div className="duet-touch nm-yeta flex h-svh overflow-hidden bg-duet-surface">
        <AttentionNotifier />
        <FinishedForYou />
        {wide ? <FaceStrip current={pane === "chat" ? room : ""} /> : null}
        <div ref={stage} className="duet-face relative min-w-0 flex-1 text-duet-ink [--duet-tab-space:86px]">
          {show("home", <HomeScreen />)}
          {show("rooms", <div className="nm-col"><RoomsPane /></div>)}
          {show("chat", (
            <div className="nm-col">
              <ShellHeader floating menuOpen={false} onMenu={() => {}} />
              <PinBar room={room} key={"pin:" + room}><MeetCard room={room} /></PinBar>   {/* 방마다 고정 띠(카톡 꼴 · 형 16:46 · ./pins.tsx) + 그 밑 방 카드(평의회 2 ⑨ · ./meet-card.tsx) */}
              <main className="flex min-h-0 flex-1 flex-col"><OfficeChat room={room} key={room} active={pane === "chat" && roomOf(pathname) === room && !modal && !layer && !("page" in where)} /></main>
            </div>
          ))}
          {show("editor", EditorMenu ? <div className="nm-scroll"><Suspense fallback={null}><EditorMenu /></Suspense></div> : <p className="m-auto text-sm" style={{ color: "var(--mut)" }}>에디터 메뉴 판 준비 중</p>)}
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
            <div className="nm-modal" role="dialog" aria-modal="true" aria-label={M.label} inert={layer || undefined}>
              <div className="nm-modal-h">
                <button type="button" className="nm-modal-back" aria-label="닫기" onClick={closeModal}><DuetIcon name="chevronLeft" size={20} /></button>
                <b>{M.label}</b>
              </div>
              <div className={FRAME[M.id] ? "nm-modal-b frame" : "nm-modal-b flush"}>   {/* flush = 판이 머리 알약 밑으로 지나감(윗여백 두 겹 0) */}
                {FRAME[M.id] ? <FramePage title={M.label} src={FRAME[M.id]!} />
                  : M.id === "tasks" ? <div className="nm-col"><TasksScreen /></div>
                  : M.id === "runner" ? <div className="nm-scroll"><RunnerScreen /></div>
                  : M.id === "ask" ? <div className="nm-scroll"><AskModal /></div>
                  : M.id === "news" ? <div className="nm-scroll"><NewsModal /></div>
                  : M.id === "chan" ? <div className="nm-scroll"><ChanModal /></div>
                  : M.id === "sns" ? <div className="nm-scroll"><SnsModal /></div>
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
      </div>
    </ChatPresenceProvider>
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
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-4 pb-[var(--duet-tab-space,86px)]">
      <h1 className="sr-only">대화방</h1>   {/* 판 위 큰 제목 0(PM 13:04 · 형 「공간」 · 지금 판 = 네비 「대화방」 칸) */}
      <RoomList big />
    </div>
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

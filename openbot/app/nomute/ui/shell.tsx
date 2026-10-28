// 새 사무실 껍데기 = YETA 껍데기 꼴(형 10-28 11:22 「네비는 늘 위 · 옮겨도 뒤 그대로」 · 11:26 「뼈대 그대로로 yeta로」 · 장부 office-yeta-chat.md 「껍데기 이음 꼴」)
//   로그인 뒤 공통 자리(원본 _authed 라우트 Outlet 둘레 · overrides.ts PATCH)에 한 번만 섬 → 어디로 가도 껍데기는 그대로
//   판(네비 칸 · 형 12:24) = 홈 · 대화방(목록) · 대화 · 에디터 — 처음 갈 때 한 번 그리고 계속 살려 둠(숨김만 = 스크롤·쓰던 글 그대로) · 들어오는 판 = YETA ypickIn(./shell.css)
//   모달(≡ 서랍 · 형 12:24~12:26 「덜 중요한걸 좀 더 세부로 모으려는 의도」) = 할 일 · 러너 · 결의 방 · 토큰 · 피드백 · 설정 — 판 위에 덮고 닫으면 아래 판 그대로
//     결의 방·토큰·피드백 = 에디터 원본 화면(viewer/gyeol-room.html · tokens.html · feedback.html) 그대로 띄움(위젯 탭과 같은 원본 · 새로 짜기 0) · 설정 = 원본 settings 화면(보조 03 YETA 설정)
//   에디터 판 = 보조 03 `nomute/editor-menu/screen.tsx` 의 EditorMenuScreen(그 자리·이름이면 저절로 끼움 · 없으면 「준비 중」 · office-editor-menu.md)
//   그 밖 길(할 일 하나 보기 등) = 판 위에 덮는 쪽(원본 머리 = 뒤로) · PC(768px~) = 왼쪽 끝 얼굴 띠(형 11:21~11:26)
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
import { FaceImg, FaceStack } from "./faces";
import { OfficeChat } from "./office-chat";
import { RoomList, useRoomOrder } from "./room-list";
import { useWide } from "./side";
import "./shell.css";

export type Pane = "home" | "rooms" | "chat" | "editor";
export type Modal = "tasks" | "runner" | "gyeol" | "tokens" | "feedback" | "settings";
/** 서랍 차례(형 12:25·12:26) — 이름 · 그림 · 길 */
export const MODALS: { id: Modal; label: string; icon: "tasks" | "activity" | "sparkle" | "bolt" | "reply" | "settings"; to: string }[] = [
  { id: "tasks", label: "할 일", icon: "tasks", to: "/tasks" },
  { id: "runner", label: "러너", icon: "activity", to: "/runner" },
  { id: "gyeol", label: "결의 방", icon: "sparkle", to: "/gyeol" },
  { id: "tokens", label: "토큰", icon: "bolt", to: "/tokens" },
  { id: "feedback", label: "피드백", icon: "reply", to: "/feedback" },
  { id: "settings", label: "설정", icon: "settings", to: "/settings" },
];
const FRAME: Partial<Record<Modal, string>> = { gyeol: "/gyeol-room.html", tokens: "/tokens.html", feedback: "/feedback.html" };   // 에디터 원본 화면 그대로(같은 사이트)

type Where = { pane: Pane } | { modal: Modal } | { page: true } | { bare: true };
/** 길 → 판·모달 · page = 판 위에 덮는 원본 화면 · bare = 껍데기 없이(가입 안내 등) */
export function whereFor(pathname: string): Where {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/" || /^\/(channels|group)\/[^/]+$/.test(p)) return { pane: "chat" };
  if (p === "/home") return { pane: "home" };
  if (p === "/rooms") return { pane: "rooms" };
  if (p === "/editor") return { pane: "editor" };
  const m = MODALS.find((x) => x.to === p);
  if (m) return { modal: m.id };
  if (/^\/(onboarding|sign)/.test(p)) return { bare: true };
  return { page: true };
}
const roomOf = (pathname: string) => { const m = pathname.match(/^\/(?:channels|group)\/([^/]+)/); return m ? decodeURIComponent(m[1]) : "all"; };
const paneHref = (pane: Pane, room: string) => (pane === "chat" ? (room === "all" ? "/" : `/channels/${encodeURIComponent(room)}`) : `/${pane}`);

const SettingsPage = SettingsIndex.options.component as () => ReactNode;
const editorMods = import.meta.glob("../editor-menu/screen.tsx");
const EditorMenu = editorMods["../editor-menu/screen.tsx"]
  ? lazy(() => (editorMods["../editor-menu/screen.tsx"]() as Promise<{ EditorMenuScreen: ComponentType }>).then((m) => ({ default: m.EditorMenuScreen })))
  : null;

export function NomuteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const where = whereFor(pathname);
  const wide = useWide();
  const [room, setRoom] = useState(() => roomOf(pathname));
  const [base, setBase] = useState<Pane>(() => ("pane" in where ? where.pane : "chat"));   // 모달·덮는 쪽 아래에 깔린 판
  const [open, setOpen] = useState<Set<Pane>>(() => new Set(["pane" in where ? where.pane : "chat"]));
  const pane = "pane" in where ? where.pane : base;
  const modal = "modal" in where ? where.modal : null;
  useEffect(() => {
    if (!("pane" in where)) return;
    if (where.pane === "chat") setRoom(roomOf(pathname));
    setBase(where.pane);
    if (!open.has(where.pane)) setOpen((s) => new Set(s).add(where.pane));
  }, [pathname]);   // eslint-disable-line react-hooks/exhaustive-deps
  useChannelEvents();
  const chat = useChatServerBusy(pane === "chat" && !modal);
  const serverWork = useServerWork(chat.busy, chat.threadId);
  const stage = useRef<HTMLDivElement>(null);
  useTabSpace(stage);
  if ("bare" in where) return <>{children}</>;

  const show = (id: Pane, node: ReactNode) =>
    open.has(id) ? <section key={id} className={`nm-pane ${pane === id ? "on" : ""}`} aria-hidden={pane !== id} inert={pane !== id || undefined}>{node}</section> : null;
  const closeModal = () => void nav({ to: paneHref(base, room) });
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
              <main className="flex min-h-0 flex-1 flex-col"><OfficeChat room={room} key={room} active={pane === "chat" && !modal && !("page" in where)} /></main>
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
          <TabBar pane={"pane" in where ? where.pane : null} modal={modal} />
          {M ? (
            <div className="nm-modal" role="dialog" aria-modal="true" aria-label={M.label}>
              <div className="nm-modal-h">
                <button type="button" className="nm-modal-back" aria-label="닫기" onClick={closeModal}><DuetIcon name="chevronLeft" size={20} /></button>
                <b>{M.label}</b>
              </div>
              <div className="nm-modal-b">
                {FRAME[M.id] ? <iframe title={M.label} src={FRAME[M.id]} className="nm-modal-frame" />
                  : M.id === "tasks" ? <div className="nm-col"><TasksScreen /></div>
                  : M.id === "runner" ? <div className="nm-scroll"><RunnerScreen /></div>
                  : <div className="nm-scroll"><Suspense fallback={null}><SettingsPage /></Suspense></div>}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ChatPresenceProvider>
  );
}

/** 목록 화면(카톡식 · 형 11:26 「대화랑 그냥 분리하자」) — 방 누르면 그 대화 판으로 */
function RoomsPane() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-6 pb-[var(--duet-tab-space,86px)]">
      <h1 className="px-3 pb-3 text-[22px] font-bold">대화</h1>
      <RoomList big />
    </div>
  );
}

/** PC 왼쪽 끝 얼굴 띠 — 얼굴만(글자 0) · 차례 = 안 읽은 방 → 고정 → 나머지(목록 화면과 같은 차례) · 위아래 스크롤 · 맨 위 ≡ · 맨 아래 「+」·형 얼굴 붙박이 */
function FaceStrip({ current }: { current: string }) {
  const nav = useNavigate();
  const { list, ordered, count } = useRoomOrder();
  const go = (id: string) => void (id === "all" ? nav({ to: "/" }) : nav({ to: "/channels/$channelId", params: { channelId: id } }));
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

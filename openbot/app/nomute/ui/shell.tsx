// 새 사무실 껍데기 = YETA 껍데기 꼴(형 10-28 11:22 「네비는 늘 위 · 옮겨도 뒤 그대로」 · 11:26 「뼈대 그대로로 yeta로」 · 장부 office-yeta-chat.md 「껍데기 이음 꼴」)
//   로그인 뒤 공통 자리(원본 _authed 라우트 Outlet 둘레 · overrides.ts PATCH)에 한 번만 섬 → 대화·목록·할 일·러너·설정 어디로 가도 껍데기는 그대로
//   판 = 처음 갈 때 한 번 그리고 계속 살려 둠(숨김만 = 스크롤·쓰던 글 그대로) · 들어오는 판 = YETA ypickIn(./shell.css) · 네비 = 맨 위층(swap/tab-bar.tsx)
//   설정 판 = 원본 settings 화면(보조 03 PATCH 그대로) · 러너 판 = 보조 02 nomute/runner · 홈 판 = 보조 02 nomute/home(형 11:27 「메인 대시보드」 · #/home) · 그 밖 길(할 일 하나 보기 등) = 판 위에 덮는 쪽(원본 머리 = 뒤로)
//   PC(768px~) = 왼쪽 끝 얼굴 띠(형 11:21~11:26 · 얼굴만 · 안 읽은 방 먼저 · 숫자 배지 · 지금 방 = 테두리 · 맨 위 ≡ = 목록 화면 · 맨 아래 붙박이 「+」·형 얼굴)
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode, Suspense, useEffect, useRef, useState } from "react";
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

export type Pane = "home" | "chat" | "rooms" | "tasks" | "runner" | "settings";

/** 길 → 판 · null = 판 위에 덮는 쪽(원본 화면 그대로) · "bare" = 껍데기 없이(가입 안내 등) */
export function paneFor(pathname: string): Pane | null | "bare" {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/" || /^\/(channels|group)\/[^/]+$/.test(p)) return "chat";
  if (p === "/home") return "home";
  if (p === "/rooms") return "rooms";
  if (p === "/tasks") return "tasks";
  if (p === "/runner") return "runner";
  if (p === "/settings") return "settings";
  if (/^\/(onboarding|sign)/.test(p)) return "bare";
  return null;
}
const roomOf = (pathname: string) => { const m = pathname.match(/^\/(?:channels|group)\/([^/]+)/); return m ? decodeURIComponent(m[1]) : "all"; };

const SettingsPage = SettingsIndex.options.component as () => ReactNode;

export function NomuteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pane = paneFor(pathname);
  const wide = useWide();
  const [room, setRoom] = useState(() => roomOf(pathname));
  const [open, setOpen] = useState<Set<Pane>>(() => new Set(pane && pane !== "bare" ? [pane] : ["chat"]));
  useEffect(() => {
    if (pane === "chat") setRoom(roomOf(pathname));
    if (pane && pane !== "bare" && !open.has(pane)) setOpen((s) => new Set(s).add(pane));
  }, [pane, pathname, open]);
  useChannelEvents();
  const chat = useChatServerBusy(pane === "chat");
  const serverWork = useServerWork(chat.busy, chat.threadId);
  const stage = useRef<HTMLDivElement>(null);
  useTabSpace(stage);
  if (pane === "bare") return <>{children}</>;

  const show = (id: Pane, node: ReactNode, cls = "") =>
    open.has(id) ? <section key={id} className={`nm-pane ${cls} ${pane === id ? "on" : ""}`} aria-hidden={pane !== id} inert={pane !== id || undefined}>{node}</section> : null;
  return (
    <ChatPresenceProvider serverWork={serverWork}>
      <div className="duet-touch nm-yeta flex h-svh overflow-hidden bg-duet-surface">
        <AttentionNotifier />
        <FinishedForYou />
        {wide ? <FaceStrip current={pane === "chat" ? room : ""} /> : null}
        <div ref={stage} className="duet-face relative min-w-0 flex-1 text-duet-ink [--duet-tab-space:86px]">
          {show("chat", (
            <div className="nm-col">
              <ShellHeader floating menuOpen={false} onMenu={() => {}} />
              <main className="flex min-h-0 flex-1 flex-col"><OfficeChat room={room} key={room} active={pane === "chat"} /></main>
            </div>
          ))}
          {show("home", <HomeScreen />)}
          {show("rooms", <div className="nm-col"><RoomsPane /></div>)}
          {show("tasks", <div className="nm-col"><TasksScreen /></div>)}
          {show("runner", <div className="nm-scroll"><RunnerScreen /></div>)}
          {show("settings", <div className="nm-scroll"><Suspense fallback={null}><SettingsPage /></Suspense></div>)}
          {pane === null ? (
            <section className="nm-pane nm-over on">
              <PageChromeProvider>
                <div className="nm-col [--duet-tab-space:max(env(safe-area-inset-bottom),12px)]">
                  <PageHeader />
                  <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
                </div>
              </PageChromeProvider>
            </section>
          ) : null}
          <TabBar pane={pane} />
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

// 원본 components/shell/tab-bar.tsx 자리 — 아래 네비 = YETA .ynav 원본 그대로(./ynav.css · 형 10-28 11:20 「예타스타일로」 · 10:21 「네비 액티브 하게 펼쳐지는건 좋아!」)
// 칸 넷(형 12:22·12:24 → 10-31 15:1x 「에디터는 그냥 서랍 누르면 뜨면 될듯.」) = 홈 · 대화방(목록) · 대화 · ≡(서랍 · 접힌 토글) — 서랍 = 덜 중요한 것 모음(형 12:25) + 에디터 칸 전부(LEGACY·뉴스 요약·채널 요약·SNS·요약 요청·에디터) · 누르면 네비 위로 펼쳐지고 항목 = 모달(ui/shell.tsx MODALS)
//   짐작(빠르): 형 말을 「에디터 네비 칸을 없애고 에디터는 서랍에서」로 읽음 · 「에디터 칸을 누르면 서랍이 열림」으로 읽으면 TABS 에 editor 줄을 되살리고 onClick 을 setDrawer 로(아래 EDITOR_OPENS_DRAWER 주석 줄) — 한 줄 차이
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DuetIcon, type DuetIconName } from "@/components/duet/icons";
import { approvalInboxOptions } from "@/lib/approvals";
import { needsInputCount } from "@/lib/tasks/groups";
import { taskListQueryOptions } from "@/lib/tasks/queries";
import { MODALS, type Modal, type Pane } from "../ui/shell";
import { useBrief } from "../ui/today";
import "../ui/yeta-chat.css";
import "./ynav.css";

export type ShellTab = "chat" | "tasks" | "make";

const TABS: { id: Pane; to: string; icon: DuetIconName; label: string }[] = [
  { id: "home", to: "/home", icon: "dashboard", label: "홈" },
  { id: "rooms", to: "/rooms", icon: "inbox", label: "대화방" },   // 형 12:22 「대화방이 일반적으로 더 우선 메뉴라 더 좌측으로」
  { id: "chat", to: "", icon: "chat", label: "대화" },   // 대화 = 마지막에 보던 방(chatTo · 처음 = 회의실 #/group/all)
  // EDITOR_OPENS_DRAWER: { id: "editor" as Pane, to: "", icon: "page", label: "에디터" } — 형이 「에디터」 글자가 네비에 남길 바라면 이 줄 살리고, 아래 onClick 에서 tab.id === "editor" ? setDrawer((v) => !v) : navigate(…)
];

/** 원본 app-shell 이 부르는 이름(겉틀은 이제 ui/shell.tsx) — 그대로 둠 */
export function tabForPath(pathname: string): ShellTab | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/" || /^\/(channels|group)\/[^/]+$/.test(path)) return "chat";
  if (path === "/tasks" || /^\/tasks\/[^/]+$/.test(path)) return "tasks";
  return null;
}

export function TabBar({ pane, modal = null, chatTo = "/group/all" }: { pane: Pane | null; modal?: Modal | null; chatTo?: string; current?: ShellTab }) {
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [right, setRight] = useState(16);   // 서랍 = ≡ 칸 바로 위(네비 오른쪽 끝에 맞춤 · PC 는 네비가 가운데라 화면 끝이 아님)
  useLayoutEffect(() => { const n = navRef.current, p = n?.offsetParent as HTMLElement | null; if (drawer && n && p) setRight(Math.max(8, p.clientWidth - (n.offsetLeft + n.offsetWidth))); }, [drawer]);
  const inbox = useQuery(approvalInboxOptions());
  const tasks = useQuery(taskListQueryOptions());
  const decide = useBrief().data?.cols.decide.filter((x) => !x.answer).length || 0;   // 형 결정 필요(답 안 한 것) = 할 일 숫자(서랍 안 · ≡ 칸에도)
  const waiting = needsInputCount(tasks.data, inbox.data) + decide;
  useEffect(() => { setDrawer(false); }, [pane, modal]);
  useEffect(() => {
    if (!drawer) return;
    const off = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawer(false); };
    window.addEventListener("keydown", off);
    return () => window.removeEventListener("keydown", off);
  }, [drawer]);
  const badge = (n: number) => (n > 0 ? <b aria-hidden className="nm-nav-badge">{n > 99 ? "99+" : n}</b> : null);
  return (
    <>
      {drawer ? <button type="button" aria-label="서랍 닫기" className="nm-drawer-veil" onClick={() => setDrawer(false)} /> : null}
      {drawer ? (
        <div className="nm-drawer" role="menu" aria-label="서랍" style={{ right }}>
          {MODALS.map((m) => (
            <button key={m.id} type="button" role="menuitem" className={modal === m.id ? "on" : undefined} onClick={() => { setDrawer(false); void navigate({ to: m.to }); }}>
              <DuetIcon name={m.icon} size={19} />
              <span>{m.label}</span>
              {m.id === "tasks" ? badge(waiting) : null}
            </button>
          ))}
        </div>
      ) : null}
      <nav aria-label="큰 탭" className="ynav" ref={navRef}>
        {TABS.map((tab) => {
          const on = tab.id === pane && !modal && !drawer;
          return (
            <button aria-current={on ? "page" : undefined} aria-label={tab.label} className={on ? "on" : undefined} key={tab.id} onClick={() => void navigate({ to: tab.id === "chat" ? chatTo : tab.to })} type="button">
              <DuetIcon name={tab.icon} size={20} stroke={on ? 2.1 : 1.9} />
              <span>{tab.label}</span>
            </button>
          );
        })}
        <button aria-expanded={drawer} aria-label={waiting ? `서랍, 할 일 ${waiting}개 기다림` : "서랍"} className={drawer || modal ? "on" : undefined} onClick={() => setDrawer((v) => !v)} type="button">
          <DuetIcon name="menu" size={20} stroke={drawer || modal ? 2.1 : 1.9} />
          <span>{modal ? MODALS.find((m) => m.id === modal)?.label : "서랍"}</span>
          {badge(waiting)}
        </button>
      </nav>
    </>
  );
}

// 원본 components/shell/tab-bar.tsx 자리 — 아래 네비 = YETA .ynav 원본 그대로(./ynav.css · 형 10-28 11:20 「예타스타일로」 · 10:21 「네비 액티브 하게 펼쳐지는건 좋아!」)
// 칸 = 홈(맨 앞 · 형 11:27 「메인 대시보드」 · 보조 02 nomute/home) · 대화 · 목록(폰만 · 따로 화면 · PC 는 왼쪽 얼굴 띠) · 할 일 · 러너 · 설정(오른쪽 끝) — 맨 위 ≡·「형」을 여기로(형 10:22) · 자리 = 껍데기(ui/shell.tsx) 맨 위층
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { DuetIcon, type DuetIconName } from "@/components/duet/icons";
import { approvalInboxOptions } from "@/lib/approvals";
import { needsInputCount } from "@/lib/tasks/groups";
import { taskListQueryOptions } from "@/lib/tasks/queries";
import type { Pane } from "../ui/shell";
import { useWide } from "../ui/side";
import { useBrief } from "../ui/today";
import "../ui/yeta-chat.css";
import "./ynav.css";

export type ShellTab = "chat" | "tasks" | "make";

const TABS: { id: Pane; to: "/home" | "/" | "/rooms" | "/tasks" | "/runner" | "/settings"; icon: DuetIconName; label: string }[] = [
  { id: "home", to: "/home", icon: "dashboard", label: "홈" },
  { id: "chat", to: "/", icon: "chat", label: "대화" },
  { id: "rooms", to: "/rooms", icon: "menu", label: "목록" },
  { id: "tasks", to: "/tasks", icon: "tasks", label: "할 일" },
  { id: "runner", to: "/runner", icon: "activity", label: "러너" },
  { id: "settings", to: "/settings", icon: "settings", label: "설정" },
];

/** 원본 app-shell 이 부르는 이름(겉틀은 이제 ui/shell.tsx) — 그대로 둠 */
export function tabForPath(pathname: string): ShellTab | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/" || /^\/(channels|group)\/[^/]+$/.test(path)) return "chat";
  if (path === "/tasks" || /^\/tasks\/[^/]+$/.test(path)) return "tasks";
  return null;
}

export function TabBar({ pane }: { pane: Pane | null; current?: ShellTab }) {
  const navigate = useNavigate();
  const wide = useWide();
  const inbox = useQuery(approvalInboxOptions());
  const tasks = useQuery(taskListQueryOptions());
  const decide = useBrief().data?.cols.decide.filter((x) => !x.answer).length || 0;   // 형 결정 필요(답 안 한 것) = 할 일 숫자에 더함
  const waiting = needsInputCount(tasks.data, inbox.data) + decide;
  return (
    <nav aria-label="큰 탭" className="ynav">
      {TABS.filter((t) => !(wide && t.id === "rooms")).map((tab) => {
        const on = tab.id === pane;
        const badge = tab.id === "tasks" && waiting > 0 ? waiting : 0;
        return (
          <button
            aria-current={on ? "page" : undefined}
            aria-label={badge ? `${tab.label}, ${badge}개 기다림` : tab.label}
            className={on ? "on" : undefined}
            key={tab.id}
            onClick={() => void navigate({ to: tab.to })}
            type="button"
          >
            <DuetIcon name={tab.icon} size={20} stroke={on ? 2.1 : 1.9} />
            <span>{tab.label}</span>
            {badge ? (
              <b aria-hidden className="type-caption absolute -top-1 right-1 grid h-5 min-w-5 place-items-center rounded-full px-1 font-semibold tabular-nums" style={{ background: "var(--accent)", color: "var(--bg)" }}>
                {badge}
              </b>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

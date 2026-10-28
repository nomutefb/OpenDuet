// 원본 components/shell/tab-bar.tsx 자리 — 「Make」 탭 뺌(우리 자료 없음) · 글자 = 한국어
// 전환 = YETA UI 메뉴킷 .ynav(형 10-28 09:36 · 규칙 원본 그대로 = ./ynav.css): 안 고른 탭 = 그림만 · 고르면 알약이 늘어나며 이름 · 알약 바탕·색 = 우리 것
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { DuetIcon, type DuetIconName } from "@/components/duet/icons";
import { approvalInboxOptions } from "@/lib/approvals";
import { needsInputCount } from "@/lib/tasks/groups";
import { taskListQueryOptions } from "@/lib/tasks/queries";
import { useBrief } from "../ui/today";
import "./ynav.css";

export type ShellTab = "chat" | "tasks" | "make";

const TABS: { id: ShellTab; to: "/" | "/tasks"; icon: DuetIconName; label: string }[] = [
  { id: "chat", to: "/", icon: "chat", label: "회의실" },
  { id: "tasks", to: "/tasks", icon: "tasks", label: "할 일" },
];

export function tabForPath(pathname: string): ShellTab | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return "chat";
  if (/^\/channels\/[^/]+$/.test(path)) return "chat";
  if (path === "/tasks" || /^\/tasks\/[^/]+$/.test(path)) return "tasks";
  return null;
}

export function TabBar({ current }: { current: ShellTab }) {
  const navigate = useNavigate();
  const inbox = useQuery(approvalInboxOptions());
  const tasks = useQuery(taskListQueryOptions());
  const decide = useBrief().data?.cols.decide.filter((x) => !x.answer).length || 0;   // 형 결정 필요(답 안 한 것) = 할 일 숫자에 더함
  const waiting = needsInputCount(tasks.data, inbox.data) + decide;
  return (
    <nav
      aria-label="큰 탭"
      className="ynav duet-face duet-glass absolute inset-x-0 bottom-[22px] z-20 mx-auto flex w-fit max-w-[calc(100%-32px)] items-center rounded-[32px] shadow-duet-glass"
    >
      {TABS.map((tab) => {
        const on = tab.id === current;
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
              <b
                aria-hidden
                className="type-caption absolute -top-1 right-1 grid h-5 min-w-5 place-items-center rounded-full bg-duet-accent px-1 font-semibold text-duet-on-accent tabular-nums shadow-[0_0_0_2px_var(--duet-card)]"
              >
                {badge}
              </b>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

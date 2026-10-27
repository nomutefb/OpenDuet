// 원본 components/shell/tab-bar.tsx 그대로 + 「Make」 탭 뺌(우리 자료 없음) · 글자 = 한국어 · 둘이라 알약 폭만 줄임
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { DuetIcon, type DuetIconName } from "@/components/duet/icons";
import { approvalInboxOptions } from "@/lib/approvals";
import { needsInputCount } from "@/lib/tasks/groups";
import { taskListQueryOptions } from "@/lib/tasks/queries";
import { cn } from "@/lib/utils";
import { useBrief } from "../ui/today";

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
  const inbox = useQuery(approvalInboxOptions());
  const tasks = useQuery(taskListQueryOptions());
  const decide = useBrief().data?.cols.decide.filter((x) => !x.answer).length || 0;   // 형 결정 필요(답 안 한 것) = 할 일 숫자에 더함
  const waiting = needsInputCount(tasks.data, inbox.data) + decide;
  return (
    <nav
      aria-label="큰 탭"
      className="duet-face duet-glass absolute inset-x-0 bottom-[22px] z-20 mx-auto flex h-16 w-[240px] max-w-[calc(100%-32px)] gap-0.5 rounded-[32px] p-[5px] shadow-duet-glass"
    >
      {TABS.map((tab) => {
        const on = tab.id === current;
        const badge = tab.id === "tasks" && waiting > 0 ? waiting : 0;
        return (
          <Link
            activeOptions={{ exact: tab.id === "chat" }}
            aria-current={on ? "page" : undefined}
            aria-label={badge ? `${tab.label}, ${badge}개 기다림` : tab.label}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-px rounded-[27px] transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-duet-accent/40",
              on ? "bg-duet-tile text-duet-ink" : "text-duet-ink-2 hover:text-duet-ink",
            )}
            key={tab.id}
            to={tab.to}
          >
            <DuetIcon name={tab.icon} size={20} stroke={on ? 2.1 : 1.9} />
            <span className={cn("type-caption", on ? "font-semibold" : "font-medium")}>{tab.label}</span>
            {badge ? (
              <span
                aria-hidden
                className={cn(
                  "type-caption absolute top-1 left-1/2 ml-[7px] grid h-5 min-w-5 place-items-center rounded-full bg-duet-accent px-1 font-semibold text-duet-on-accent tabular-nums",
                  on ? "shadow-[0_0_0_2px_var(--duet-tile)]" : "shadow-[0_0_0_2px_var(--duet-card)]",
                )}
              >
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

// 서랍 = 한 화면(형 10-31 「5번 메뉴는 누르면 리스트로 버튼 위에 뜨는게 아니라 설정 을 누르면 스크롤 형태로 이어지는거처럼 쭉 화면에 구성될거야 한 화면 전체로」)
//   네비 4칸 · 설정은 네비에 있고 결의 방은 놀이터 안(형 「결의방은 놀이방에 넣으면 됨」) · 할 일 숫자 = 네비 서랍 칸과 같은 값
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { DuetIcon } from "@/components/duet/icons";
import { approvalInboxOptions } from "@/lib/approvals";
import { taskListQueryOptions } from "@/lib/tasks/queries";
import { needsInputCount } from "@/lib/tasks/groups";
import { MODALS, type Modal } from "./shell";
import { useBrief } from "./today";

const PARTS: { name: string; ids: Modal[] }[] = [
  { name: "일", ids: ["tasks", "runner", "edtool"] },
  { name: "뉴스·채널", ids: ["legacy", "ask", "news", "chan", "sns"] },
  { name: "놀기·살피기", ids: ["play", "tokens", "feedback"] },
];

export function DrawerPage() {
  const nav = useNavigate(), inbox = useQuery(approvalInboxOptions()), tasks = useQuery(taskListQueryOptions());
  const waiting = needsInputCount(tasks.data, inbox.data) + (useBrief().data?.cols.decide.filter((x) => !x.answer).length || 0);
  return (
    <div className="nm-yeta nm-dr mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 pb-28 pt-1">
      {PARTS.map((p) => (
        <section key={p.name} aria-label={p.name}>
          <h2>{p.name}</h2>
          <ul className="nm-rgroup flex flex-col">
            {p.ids.map((id) => { const m = MODALS.find((x) => x.id === id)!; return (
              <li key={id} className="nm-rrow">
                <button type="button" className="nm-dr-i" onClick={() => void nav({ to: m.to })}>
                  <DuetIcon name={m.icon} size={19} /><span>{m.label}</span>
                  {id === "tasks" && waiting > 0 ? <b className="nm-rcount">{waiting > 99 ? "99+" : waiting}</b> : null}
                  <DuetIcon name="chevronRight" size={16} />
                </button>
              </li>
            ); })}
          </ul>
        </section>
      ))}
    </div>
  );
}

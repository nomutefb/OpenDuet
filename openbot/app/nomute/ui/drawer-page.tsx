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
import { YICO } from "./yeta-icons";
import "./yeta-settings.css";   // 설정과 같은 판(형 11-01 「톤이 맞아야되거든」 · .yset-part · .yset-grp · .yset-item)

const PARTS: { name: string; ids: Modal[] }[] = [
  { name: "일", ids: ["tasks", "runner", "edtool"] },
  { name: "뉴스·채널", ids: ["legacy", "ask", "news", "chan", "sns"] },
  { name: "놀기·살피기", ids: ["play", "tokens", "feedback"] },
];

export function DrawerPage() {
  const nav = useNavigate(), inbox = useQuery(approvalInboxOptions()), tasks = useQuery(taskListQueryOptions());
  const waiting = needsInputCount(tasks.data, inbox.data) + (useBrief().data?.cols.decide.filter((x) => !x.answer).length || 0);
  return (
    <div className="yeta-set nm-yeta mx-auto flex w-full max-w-3xl flex-col px-4 pb-28 pt-4">
      {PARTS.map((p) => (
        <section key={p.name} className="yset-part" aria-label={p.name}>
          <div className="yset-sec">{p.name}</div>
          <div className="yset-grp">
            {p.ids.map((id) => { const m = MODALS.find((x) => x.id === id)!; return (
              <button key={id} type="button" className="yset-item" onClick={() => void nav({ to: m.to })}>
                <span className="si-ic" aria-hidden><DuetIcon name={m.icon} size={21} /></span>
                <span className="si-lbl"><span className="si-t">{m.label}</span></span>
                <span className="si-v">
                  {id === "tasks" && waiting > 0 ? <b className="nm-rcount">{waiting > 99 ? "99+" : waiting}</b> : null}
                  <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} />
                </span>
              </button>
            ); })}
          </div>
        </section>
      ))}
    </div>
  );
}

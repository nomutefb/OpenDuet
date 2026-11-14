// 작업 알림 글 = 한 줄 접힌 카드(형 11-14 23:34 dm-gik 「작업 알림은 대화방으로 취급 안하고 … PM 방에서 접힌 상태로 내가 완료만 볼 수 있게」 · 23:39 「그게 만약 대화가 편하면 보낸 메세지로 접히게 해」 · 깃 #-019 · 뎅)
//   알아보기 = 서버가 박는 relay.event(job_done · job_recv · 번개 #-018 · 몸이 못 바꿈) · 옛 글(dm-chaeng) = 화자 기차봇 + 첫 줄 「✅ 완료」 · 「📥 접수」
//   한 줄 = 표지 · #-0NN · 제목 · (누가 · 걸린 시간) · 누르면 원래 글 그대로 펼침 · 움직임 0
import { type ReactNode, useState } from "react";
import "./job-fold.css";
import { type JobMsg, jobOf } from "./job-fold-logic";
export { jobBoard, jobOf } from "./job-fold-logic";

export function JobFold({ m, children }: { m: JobMsg; children: ReactNode }) {
  const j = jobOf(m)!;
  const [open, setOpen] = useState(false);
  return (
    <div className={`nm-jobf ${j.kind}${open ? " open" : ""}`}>
      <button type="button" className="nm-jobf-h" onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} aria-expanded={open}>
        <span className="mk" aria-hidden>{j.kind === "done" ? "✓" : "↘"}</span>
        <span className="lab">{j.kind === "done" ? "완료" : "접수"}</span>
        {j.no ? <b>{j.no}</b> : null}
        <span className="tt">{j.title}</span>
        {j.by ? <small>{j.by}</small> : null}
      </button>
      {open ? <div className="nm-jobf-b">{children}</div> : null}
    </div>
  );
}


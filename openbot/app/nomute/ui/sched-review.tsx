// 스케줄 폐기 → 검토 요청 화면(형 11-02 02:1x 「그리고 스케줄러 자체에 삭제 확인 요청을 보낼 수 있게 변경해줘 그니까 저걸 그냥 확 삭제하는거는 솔직히 시스팀에 엮여서 좀 말이안되는거 같고.」 ·
//   「삭제 요청을 폐기 버튼으로 누르고 다시 체크 한반 더 하면 검토 요청으로 진행 상황이 바뀌는 거로.」 · 「그래서 나한테 확인이 끝나면. 없어지거나 다시 원복(또는 변경 후 원복)」)
//   서버 = 봄 #2092(functions/api/office/_schedreview.js) · GET schedule.review = { 줄 id: { step, name, owner, by, at, why?, note?, … } } · POST schedule/review { id, act: ask | note | decide | done }
//   차례 = [폐기] → 「정말?」 칸(까닭 한 줄) → [검토 요청] → 배지 「검토 중」 → 책임자가 「같이 멈추는 것」 한 줄 → 형 [없애기] · [원복] · [바꾼 뒤 원복] → 없애기·바꿈이면 책임자가 내리고 [끝냄]
//   표 원본은 이 길로 안 바뀜(지우는 손 = 책임자) · 단추 = GoButton(게이지 → ✓) · 바꾸기는 형 자리에서만(can)
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { office } from "../data/office";
import { GoButton } from "./go-button";
import "./sched-review.css";

export type Review = { step: "review" | "remove" | "change"; name: string; owner: string; by: string; at: number; why?: string; note?: string; note_by?: string; note_at?: number; decided_by?: string; decided_at?: number };
const STEP_KO: Record<string, string> = { review: "검토 중", remove: "없애기 확정", change: "바꾼 뒤 원복" };
const NEXT_KO: Record<string, string> = { review: "형 확인 기다림", remove: "책임자 내림 기다림", change: "책임자 바꿈 기다림" };
const agoKo = (ts: number) => { const m = Math.round((Date.now() - ts) / 60e3); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 1440 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`; };

export function ReviewBadge({ r }: { r?: Review }) {
  return r ? <em className="nm-rv-badge" data-step={r.step}>{STEP_KO[r.step] || r.step}</em> : null;
}

export function ReviewBox({ id, r, can, who }: { id: string; r?: Review; can: boolean; who: (w: string) => string }) {
  const qc = useQueryClient(), [sure, setSure] = useState(false), [why, setWhy] = useState(""), [note, setNote] = useState<string | null>(null);
  const post = (body: Record<string, unknown>) => office<{ ok: boolean }>("schedule/review", { method: "POST", body: JSON.stringify({ id, ...body }) });
  const fresh = () => { setSure(false); setWhy(""); setNote(null); void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] }); };
  if (!r) {
    if (!can) return null;
    return sure ? (
      <div className="nm-rv" role="alertdialog" aria-label="폐기 확인">
        <b>정말 폐기할까?</b>
        <input value={why} maxLength={300} placeholder="까닭 한 줄(안 써도 돼)" onChange={(e) => setWhy(e.target.value)} />
        <div className="nm-rv-row">
          <GoButton className="nm-sched-go" go={() => post({ act: "ask", ...(why.trim() ? { why: why.trim() } : {}) })} done={fresh}>검토 요청</GoButton>
          <button type="button" className="nm-sched-chip" onClick={() => { setSure(false); setWhy(""); }}>취소</button>
        </div>
      </div>
    ) : <div className="nm-rv-row"><button type="button" className="nm-rv-del" onClick={() => setSure(true)}>폐기</button></div>;
  }
  return (
    <div className="nm-rv" data-step={r.step}>
      <b><ReviewBadge r={r} />{NEXT_KO[r.step] || ""}</b>
      <small>요청 {who(r.by)} · {agoKo(r.at)}{r.why ? ` · 까닭 「${r.why}」` : ""}{r.owner ? ` · 책임자 ${who(r.owner)}` : ""}</small>
      <small>같이 멈추는 것: {r.note ? `${r.note} · ${who(r.note_by || "")}` : "아직 안 적음"}</small>
      {r.decided_by ? <small>정함 {who(r.decided_by)} · {agoKo(r.decided_at || 0)}</small> : null}
      {note !== null ? (
        <div className="nm-rv-row">
          <input value={note} maxLength={300} placeholder="지우면 같이 멈추는 것 한 줄" onChange={(e) => setNote(e.target.value)} />
          <GoButton className="nm-sched-go" disabled={!note.trim()} go={() => post({ act: "note", note: note.trim() })} done={fresh}>남기기</GoButton>
        </div>
      ) : null}
      {can ? (
        <div className="nm-rv-row">
          {r.step === "review" ? <>
            <GoButton className="nm-rv-del" go={() => post({ act: "decide", decision: "remove" })} done={fresh}>없애기</GoButton>
            <GoButton className="nm-sched-go" go={() => post({ act: "decide", decision: "restore" })} done={fresh}>원복</GoButton>
            <GoButton className="nm-sched-chip" go={() => post({ act: "decide", decision: "change" })} done={fresh}>바꾼 뒤 원복</GoButton>
          </> : <GoButton className="nm-sched-chip" go={() => post({ act: "done" })} done={fresh}>끝냄</GoButton>}
          {note === null ? <button type="button" className="nm-sched-chip" onClick={() => setNote(r.note || "")}>{r.note ? "같이 멈추는 것 고치기" : "같이 멈추는 것 적기"}</button> : null}
        </div>
      ) : null}
    </div>
  );
}

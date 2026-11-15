// 설정 › 봄의 정원 › 「그록봇 지침」 메모(#-060 · 형 11-15 11:25 dm-gik 깃 옮김 「그리고 설정에 그록봇지침 하나 만들어줘. 그리고 그거는 반영하는게 아니라, 메모용이야.」)
//   보기 · 고치기 · 저장 = 서버 한 칸(GET/POST grok-note · 쓰기 = 형만) · 첫 글 = 11-15 새 판 · 그록으로 보내는 길 0
//   쓰던 중 취소 = 되묻는 창 하네스(./ask-yn · 「아니오」 라임 · 형 11-15 09:00 잣대)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { office } from "../data/office";
import { AskYN } from "./ask-yn";
import { GoButton } from "./go-button";
import { readFail, reading } from "./wait-text";

type Note = { text: string; at: number; by: string; seed: boolean; can_edit: boolean };
const KEY = ["nomute", "grok-note"] as const;
const btn = "rounded-full border border-border px-3 py-1 text-xs hover:bg-foreground/5 disabled:opacity-50";
const when = (ms: number) => { const d = new Date(ms), t = (n: number) => String(n).padStart(2, "0"); return `${t(d.getMonth() + 1)}-${t(d.getDate())} ${t(d.getHours())}:${t(d.getMinutes())}`; };

export function GrokNote() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, queryFn: () => office<Note>("grok-note"), staleTime: 30_000 });
  const [text, setText] = useState<string | null>(null), [ask, setAsk] = useState(false);
  const save = useMutation({
    mutationFn: (t: string) => office<Note>("grok-note", { method: "POST", body: JSON.stringify({ text: t }) }),
    onSuccess: (j) => qc.setQueryData(KEY, j),
  });
  const n = q.data;
  if (!n) return <p className="text-sm text-muted-foreground">{q.isError ? readFail(q.error) : reading()}</p>;
  const dirty = text !== null && text !== n.text;
  return (
    <div className="flex flex-col gap-2">
      <small className="text-xs text-muted-foreground">메모용 · 그록봇에 반영 안 됨 · {n.seed ? "첫 글 = 11-15 새 판" : `${when(n.at)} · ${n.by || "형"}`}</small>
      {text === null ? (
        <>
          <p data-content className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-xl border border-border p-3 text-sm">{n.text}</p>
          {n.can_edit ? <div><button type="button" className={btn} onClick={() => setText(n.text)}>고치기</button></div> : null}
        </>
      ) : (
        <>
          <textarea className="min-h-64 w-full rounded-xl border border-border bg-background p-3 text-sm" value={text} maxLength={20000} onChange={(e) => setText(e.target.value)} aria-label="그록봇 지침 메모" />
          <div className="flex gap-2">
            <GoButton className={btn} disabled={save.isPending || !dirty} go={() => save.mutateAsync(text)} done={() => setText(null)} busy="저장 중">저장</GoButton>
            <button type="button" className={btn} onClick={() => (dirty ? setAsk(true) : setText(null))}>취소</button>
          </div>
        </>
      )}
      {save.isError ? <p className="text-sm text-destructive" role="alert">{save.error.message}</p> : null}
      {ask ? <AskYN q="작성 중인 내용이 사라집니다. 창을 닫으시겠습니까?" onNo={() => setAsk(false)} yes={async () => { setText(null); setAsk(false); }} /> : null}
    </div>
  );
}

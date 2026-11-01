// 목록 위 공지 고치기(형 10-31 「공지 누르면 공지 변경할수도 있게해줭」) · 서버 = _noticeset.js · 읽은 판(base)과 지금 판이 다르면 서버가 막음
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { office } from "../data/office";
import { GoButton } from "./go-button";

const appliedAt = (ts?: number) => (ts ? new Date(ts).toLocaleString("sv-SE", { timeZone: "Asia/Seoul" }).slice(0, 16) : "-");

export function NoticeDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const now = useQuery({ queryKey: ["nomute", "notice-edit"], queryFn: () => office<{ notice: { ver: number; text: string; ts?: number } }>("noticeset").then((j) => j.notice), staleTime: 0, gcTime: 0 });
  const [text, setText] = useState<string | null>(null);
  useEffect(() => { if (now.data && text === null) setText(now.data.text); }, [now.data, text]);
  const save = useMutation({
    mutationFn: () => office("noticeset", { method: "POST", body: JSON.stringify({ text, base: now.data?.ver }) }),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["nomute", "notice"] }); },   // 닫기 = ✓ 뒤(GoButton done)
  });
  const same = text === null || text === now.data?.text || !text.trim();
  return (
    <div role="dialog" aria-modal="true" aria-label="공지 고치기" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex max-h-full w-full max-w-lg flex-col gap-3 rounded-2xl border border-border bg-popover p-4 text-sm shadow-lg">
        <b className="text-base">공지{now.data ? ` · 판 ${now.data.ver}` : ""}</b>
        <textarea aria-label="공지 글" value={text ?? ""} rows={14} onChange={(e) => setText(e.target.value)} className="min-h-0 flex-1 resize-none rounded-xl border border-border bg-transparent px-3 py-2" />
        <ul className="list-disc pl-4 text-xs text-muted-foreground"><li>적용 시점: {appliedAt(now.data?.ts)}</li></ul>   {/* 형 11-01 「아래에 설명 대신에 블릿 하고 적용 시점 : yyyy 해가지고 분단위까지」 */}
        {save.error ? <p role="alert" className="text-destructive">{save.error.message}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded-full px-4 py-2 hover:bg-foreground/5" onClick={onClose}>닫기</button>
          <GoButton disabled={same || save.isPending} className="rounded-full bg-foreground px-4 py-2 font-semibold text-background disabled:opacity-40" go={() => save.mutateAsync()} done={onClose} busy="고치는 중">고치기</GoButton>
        </div>
      </div>
    </div>
  );
}

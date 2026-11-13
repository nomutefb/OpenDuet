// 목록 위 공지 고치기(형 10-31 「공지 누르면 공지 변경할수도 있게해줭」) · 서버 = _noticeset.js · 읽은 판(base)과 지금 판이 다르면 서버가 막음
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { backdrop } from "./backdrop";   // 바탕 닫힘 = 누름·뗌 둘 다 바탕(형 11-07 10:52)
import { useEffect, useRef, useState } from "react";
import { office } from "../data/office";
import { GoButton } from "./go-button";
import { draftDrop, draftGet, draftSet } from "./draft";   // 쓰던 글 보관(형 11-07 10:56 「저장하기 전에 글이 남아있어야돼 휘발안되고」)
import { SaveAsk, useCloseGuard } from "./save-ask";   // 「저장할까?」(형 10:56)

const appliedAt = (ts?: number) => (ts ? new Date(ts).toLocaleString("sv-SE", { timeZone: "Asia/Seoul" }).slice(0, 16) : "-");

export function NoticeDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const now = useQuery({ queryKey: ["nomute", "notice-edit"], queryFn: () => office<{ notice: { ver: number; text: string; ts?: number } }>("noticeset").then((j) => j.notice), staleTime: 0, gcTime: 0 });
  const [text, setText] = useState<string | null>(null);
  useEffect(() => { if (now.data && text === null) { const d = draftGet<string>("notice"); setText(d != null && d !== now.data.text ? d : now.data.text); } }, [now.data, text]);   // 쓰던 글 있으면 되살림
  useEffect(() => { if (text === null || !now.data) return; if (text !== now.data.text) draftSet("notice", text); else draftDrop("notice"); }, [text, now.data]);
  const save = useMutation({
    mutationFn: () => office("noticeset", { method: "POST", body: JSON.stringify({ text, base: now.data?.ver }) }),
    onSuccess: async () => { draftDrop("notice"); await qc.invalidateQueries({ queryKey: ["nomute", "notice"] }); },   // 닫기 = ✓ 뒤(GoButton done)
  });
  const same = text === null || text === now.data?.text || !text.trim();
  const dirty = text !== null && !!now.data && text !== now.data.text;
  const g = useCloseGuard(dirty, onClose);
  // 뒤로가기 = 닫기(형 11-13 16:28 봄 옮김 「공지 눌럿다가 뒤로가기가 안돼. 한번 직접 화면 보고 확인해 봐야할듯」 · 실물 = 폰 뒤로 누르면 창은 남고 밑 화면만 앞 판으로 · 뎅)
  //   열 때 뒤로가기 한 칸을 깔고(결정 창 · 사진 크게 보기와 같은 꼴) · 뒤로 = 닫기(고친 글이 있으면 「저장할까?」 + 한 칸 다시) · 단추로 닫으면 깐 칸을 걷음
  const live = useRef({ dirty, request: g.request, onClose }); live.current = { dirty, request: g.request, onClose };
  useEffect(() => {
    let byBack = false;
    history.pushState({ ...history.state, nmNotice: 1 }, "");
    const pop = () => {
      if (live.current.dirty) { history.pushState({ ...history.state, nmNotice: 1 }, ""); live.current.request(); return; }
      byBack = true; live.current.onClose();
    };
    window.addEventListener("popstate", pop);
    return () => { window.removeEventListener("popstate", pop); if (!byBack && history.state?.nmNotice) history.back(); };
  }, []);
  return (
    <div role="dialog" aria-modal="true" aria-label="공지 고치기" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" {...backdrop(g.request)}>
      <div className="flex max-h-full w-full max-w-lg flex-col gap-3 rounded-2xl border border-border bg-popover p-4 text-sm shadow-lg">
        <b className="text-base">공지{now.data ? ` · 판 ${now.data.ver}` : ""}</b>
        <textarea aria-label="공지 글" value={text ?? ""} rows={14} onChange={(e) => setText(e.target.value)} className="min-h-0 flex-1 resize-none rounded-xl border border-border bg-transparent px-3 py-2" />
        <ul className="list-disc pl-4 text-xs text-muted-foreground"><li>적용 시점: {appliedAt(now.data?.ts)}</li></ul>   {/* 형 11-01 「아래에 설명 대신에 블릿 하고 적용 시점 : yyyy 해가지고 분단위까지」 */}
        {save.error ? <p role="alert" className="text-destructive">{save.error.message}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded-full px-4 py-2 hover:bg-foreground/5" onClick={g.request}>닫기</button>
          <GoButton disabled={same || save.isPending} className="rounded-full bg-foreground px-4 py-2 font-semibold text-background disabled:opacity-40" go={() => save.mutateAsync()} done={onClose} busy="고치는 중">고치기</GoButton>
        </div>
      </div>
      {g.ask ? <SaveAsk saving={save.isPending} onKeep={() => g.setAsk(false)} onDiscard={onClose} onSave={() => { void save.mutateAsync().then(onClose).catch(() => g.setAsk(false)); }} /> : null}
    </div>
  );
}

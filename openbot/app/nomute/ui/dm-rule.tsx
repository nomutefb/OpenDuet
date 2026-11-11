// 1:1 방 지침(형 11-11 22:28 봄 1:1 「각 애들 1대1 방에도 주기 루틴 만들수잇게해줘 단톡처럼 깨움이랑 지시(지침) 가능하게. 밥상 처럼. 모든 봇 가능해야함 땡큐」 · 봄 22:29 · 깃)
//   서버 = GET/POST /api/office/room-rules(editor _roomrule.js) · 봇 1:1 방만 · 빈 글로 저장 = 지움 · 형 · 봄 자리만 고침
//   그 애가 이 방을 읽을 때 머리에 붙는 글 = 임시방 「방 지침」과 같은 머리(같은 칸 이름 · 같은 500자 · 같은 작은 글)
//   주기 깨움 = 방 「루틴 만들기」(./room-routine.tsx · 같은 표)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { type OfficeRoom, office } from "../data/office";
import { backdrop } from "./backdrop";

type Rule = { purpose?: string; by?: string; at?: number };
const KEY = ["nomute", "room-rules"] as const;

/** 지침을 걸 수 있는 방 = 봇 1:1(형 방 · 단체방 · 둘의 방 뺌 · 서버 botDm 과 같은 판정). */
export const dmRuleRoom = (r?: OfficeRoom) => !!r && r.kind === "dm" && !!r.with && r.with !== "형";

export function useDmRules(enabled = true) {
  return useQuery({ queryKey: KEY, queryFn: () => office<{ rules?: Record<string, Rule> }>("room-rules").then((j) => j.rules || {}), staleTime: 15_000, enabled });
}

export function DmRuleDialog({ room, onClose }: { room: OfficeRoom; onClose: () => void }) {
  const qc = useQueryClient();
  const rules = useDmRules();
  const base = rules.data?.[room.id]?.purpose || "";
  const [text, setText] = useState<string | null>(null), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const val = text ?? base;
  useEffect(() => {
    const off = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", off);
    return () => window.removeEventListener("keydown", off);
  }, [onClose]);
  const save = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const j = await office<{ rules?: Record<string, Rule> }>("room-rules", { method: "POST", body: JSON.stringify({ room: room.id, purpose: val.trim() }) });
      qc.setQueryData(KEY, j.rules || {});
      onClose();
    } catch (e) { setErr(`저장 못 했어 · ${(e as Error).message}`); setBusy(false); }
  };
  return createPortal(
    <div className="nrc-veil nm-yeta" role="presentation" {...backdrop(onClose)}>
      <div className="nrc" role="dialog" aria-label={`${room.name} 방 지침`} onClick={(e) => e.stopPropagation()}>
        <div className="nrc-head"><b>방 지침</b><small>{room.name}</small></div>
        <label className="flex flex-col gap-1">
          <textarea value={val} maxLength={500} rows={4} disabled={rules.isLoading} onChange={(e) => setText(e.target.value)} className="resize-none rounded-xl border border-border bg-transparent px-3 py-2" />
          <small className="text-xs text-muted-foreground">이 방에서 깨는 봇이 늘 읽어요 · 비우면 지워져요</small>
        </label>
        {err || rules.isError ? <p role="alert" className="nm-meet-err">{err || "지침을 못 읽었어"}</p> : null}
        <div className="nrc-acts"><button type="button" className="nrc-x" onClick={onClose}>닫기</button><button type="button" className="nrc-ok" disabled={busy || rules.isLoading || val.trim() === base.trim()} onClick={() => void save()}>저장</button></div>
      </div>
    </div>,
    document.body,
  );
}

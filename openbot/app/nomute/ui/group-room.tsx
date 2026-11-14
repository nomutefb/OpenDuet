// 단체방 「방 설정」(회의실 · 고정 단톡방 = 임시방 아닌 단체방) — 형 11-14 17:20 dm-gik 「깃 회의실에 방 설정이 없는데 다ㄴ톡방 모두 통일해주라」 · 번개
//   임시방 방 설정(./temp-room.tsx TempRoomDialog = 이름 · 방 지침 · 기한)과 같은 자리 · 같은 꼴 · 칸은 이 방에 맞는 것만 = 이름 · 방 지침(기한 = 임시방만)
//   이름 = 서버 roomname(./room-color.tsx RoomNamePick 과 같은 문) · 방 지침 = 서버 room-rules(./dm-rule.tsx 1:1 지침과 같은 표 · editor _roomrule.js groupRule)
//   고치기 = 형 · 봄 자리(서버가 막음 · 막히면 까닭 한 줄)
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { type OfficeRoom, office } from "../data/office";
import { backdrop } from "./backdrop";
import { useDmRules } from "./dm-rule";

/** 이 창을 쓰는 방 = 임시방 아닌 단체방(공지실 뺌 · 서버 groupRule 과 같은 판정). */
export const groupRuleRoom = (r?: OfficeRoom) => !!r && r.kind === "group" && !r.with && !r.temp && r.id !== "notice";

export function GroupRoomDialog({ room, onClose }: { room: OfficeRoom; onClose: () => void }) {
  const qc = useQueryClient();
  const rules = useDmRules();
  const baseRule = rules.data?.[room.id]?.purpose || "";
  const [name, setName] = useState(room.name), [rule, setRule] = useState<string | null>(null), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const val = rule ?? baseRule;
  const dirty = name.trim() !== room.name || val.trim() !== baseRule.trim();
  useEffect(() => {
    const off = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", off);
    return () => window.removeEventListener("keydown", off);
  }, [onClose]);
  const save = async () => {
    if (busy || !dirty) return;
    if (!name.trim()) { setErr("이름을 비울 수 없어"); return; }
    setBusy(true); setErr("");
    try {
      if (name.trim() !== room.name) {
        await office("roomname", { method: "POST", body: JSON.stringify({ room: room.id, name: name.trim() }) });
        void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
      }
      if (val.trim() !== baseRule.trim()) {
        const j = await office<{ rules?: Record<string, { purpose?: string }> }>("room-rules", { method: "POST", body: JSON.stringify({ room: room.id, purpose: val.trim() }) });
        qc.setQueryData(["nomute", "room-rules"], j.rules || {});
      }
      onClose();
    } catch (e) { setErr(`저장 못 했어 · ${(e as Error).message}`); setBusy(false); }
  };
  return createPortal(
    <div className="nrc-veil nm-yeta" role="presentation" {...backdrop(onClose)}>
      <div className="nrc" role="dialog" aria-label={`${room.name} 방 설정`} onClick={(e) => e.stopPropagation()}>
        <div className="nrc-head"><b>방 설정</b><small>{room.name}</small></div>
        <label className="flex flex-col gap-1">
          <small className="text-xs text-muted-foreground">이름</small>
          <input className="nrc-in" value={name} maxLength={20} aria-label="방 이름" onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <small className="text-xs text-muted-foreground">방 지침</small>
          <textarea value={val} maxLength={500} rows={4} disabled={rules.isLoading} aria-label="방 지침" onChange={(e) => setRule(e.target.value)} className="resize-none rounded-xl border border-border bg-transparent px-3 py-2" />
          <small className="text-xs text-muted-foreground">이 방에서 깨는 봇이 늘 읽어요 · 비우면 지워져요</small>
        </label>
        {err || rules.isError ? <p role="alert" className="nm-meet-err">{err || "지침을 못 읽었어"}</p> : null}
        <div className="nrc-acts"><button type="button" className="nrc-x" onClick={onClose}>닫기</button><button type="button" className="nrc-ok" disabled={busy || rules.isLoading || !dirty} onClick={() => void save()}>저장</button></div>
      </div>
    </div>,
    document.body,
  );
}

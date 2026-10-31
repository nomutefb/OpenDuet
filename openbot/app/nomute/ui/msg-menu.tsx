// 글 길게 누르기(형 10-31 「톡방 내에서 특정 메세지 길게 누르면 카톡은 이렇게 뜨는데 우리는 톤 일단 맞추고」 · 「고정 복사 확인 요청 공유」)
//   톤 = 카톡 글 메뉴(어두운 둥근 판 · 글자 줄) · PC = 오른쪽 클릭 · 말풍선을 그냥 누르면 나오는 반응·답장 줄은 그대로
//   확인 요청 = 1:1 은 모든 봇 · 단톡은 그 방 멤버 · 한 명씩 다 뜨고 마지막에 모두(형 10-31)
//     단톡 = 그 방에서 인용 + 「!이름」 · 1:1 = 다른 봇은 이 방에 못 불러서 그 봇 1:1 방에 원문을 넣어 바로 깨움
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { type OfficePerson, type OfficeRoom, idOf, office } from "../data/office";
import { MicOrb, ringOf } from "../swap/mic-orb";
import { usePinActions } from "./pins";

const HOLD_MS = 450, SLIP = 10, ORIGIN_MAX = 2000;

/** 길게 누르기 · 손이 움직이면 취소(스크롤) · fired() = 이 눌림이 길게였나(뒤따르는 눌림 말풍선 동작을 막음). */
export function useLongPress(open: () => void) {
  const timer = useRef(0), long = useRef(false), at = useRef({ x: 0, y: 0 });
  const stop = () => { window.clearTimeout(timer.current); timer.current = 0; };
  return {
    fired: () => { const f = long.current; long.current = false; return f; },
    bind: {
      onPointerDown: (e: PointerEvent) => {
        if (e.button) return;
        long.current = false; at.current = { x: e.clientX, y: e.clientY }; stop();
        timer.current = window.setTimeout(() => { long.current = true; timer.current = 0; open(); }, HOLD_MS);
      },
      onPointerMove: (e: PointerEvent) => { if (timer.current && Math.hypot(e.clientX - at.current.x, e.clientY - at.current.y) > SLIP) stop(); },
      onPointerUp: stop, onPointerCancel: stop, onPointerLeave: stop,
      onContextMenu: (e: MouseEvent) => { e.preventDefault(); stop(); if (!long.current) open(); },
    },
  };
}

const short = (n: string) => n.replace(" PM", "");

export function MsgMenu({ m, who, text: raw, line, room, r, list, onClose }: { m: { id: string; ts: number }; who: string; text: string; line: string; room: string; r?: OfficeRoom; list: OfficePerson[]; onClose: () => void }) {
  const text = raw || line;   // 사진만 든 글 = 파일 이름 줄
  const qc = useQueryClient(), pins = usePinActions(room), opened = useRef(Date.now());
  const [asking, setAsking] = useState(false), [busy, setBusy] = useState(false), [note, setNote] = useState(""), [why, setWhy] = useState("");
  const others = list.filter((p) => p.who !== "형" && p.kind !== "human");
  const targets = r?.with || !r?.members?.length ? others : r.members.map((n) => list.find((p) => p.who === n)).filter((p): p is OfficePerson => !!p);
  const done = (t: string) => { setNote(t); window.setTimeout(onClose, 900); };
  const send = (id: string, body: string) => office(`rooms/${encodeURIComponent(id)}/messages`, { method: "POST", body: JSON.stringify({ text: body }) });
  const ask = async (t: OfficePerson | null) => {
    setBusy(true); setWhy("");
    const label = t ? short(t.name || t.who) : "모두";
    try {
      if (!r?.with) await send(room, `↩ ${who}: ${line}\n!${label} 확인 요청`);
      else {
        const rooms = qc.getQueryData<OfficeRoom[]>(["nomute", "rooms"]) || [];
        const asked = await Promise.allSettled((t ? [t] : targets).map(async (p) => {
          const d = rooms.find((x) => x.with === p.who);
          if (!d) throw new Error(`${p.who} 1:1 방 없음`);
          return d.id === room ? send(room, `↩ ${who}: ${line}\n확인 요청`) : send(d.id, `[확인 요청] 「${r.name}」 방 ${who} 글\n${text.slice(0, ORIGIN_MAX)}`);
        }));
        const bad = asked.filter((x) => x.status === "rejected").length;
        if (bad === asked.length) throw new Error("못 보냈어");
        if (bad) { setBusy(false); setWhy(`${asked.length - bad}명에게 보냈고 ${bad}명은 못 보냈어`); return; }
      }
      await qc.invalidateQueries({ queryKey: ["nomute", "msgs", room] });
      done(`${label}에게 확인 요청을 보냈어`);
    } catch (e) { setBusy(false); setWhy(e instanceof Error ? e.message : "못 보냈어"); }
  };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard?.writeText(text); done("복사했어"); return; }
      onClose();
    } catch { onClose(); }   // 공유 창을 그냥 닫음
  };
  const item = (label: string, on: () => void) => <button key={label} type="button" role="menuitem" className="nm-msgm-i" disabled={busy} onClick={on}>{label}</button>;
  return createPortal(
    <div className="nm-msgm" role="presentation" onClick={(e) => { if (e.target === e.currentTarget && Date.now() - opened.current > 350) onClose(); }} onContextMenu={(e) => e.preventDefault()}>
      <div className="nm-msgm-p" role="menu" aria-label={asking ? "확인 요청할 봇" : "글 메뉴"}>
        {note ? <p className="nm-msgm-n" role="status">{note}</p> : asking ? (
          <>
            <p className="nm-msgm-h">확인 요청할 봇</p>
            {targets.map((p) => (
              <button key={p.who} type="button" role="menuitem" className="nm-msgm-i" disabled={busy} onClick={() => void ask(p)}>
                <MicOrb size={32} id={idOf(p.who, list)} tint={ringOf(p)} />
                <span>{short(p.name || p.who)}</span>{p.mark ? <span aria-hidden>{p.mark}</span> : null}
              </button>
            ))}
            {item("모두", () => void ask(null))}
          </>
        ) : (
          <>
            {pins.can ? item("고정", () => { pins.pin({ id: m.id, ts: m.ts }); onClose(); }) : null}
            {item("복사", () => { void navigator.clipboard?.writeText(text); done("복사했어"); })}
            {item("확인 요청", () => setAsking(true))}
            {item("공유", () => void share())}
          </>
        )}
        {why ? <p className="nm-msgm-n err" role="alert">{why}</p> : null}
      </div>
    </div>,
    document.body,
  );
}

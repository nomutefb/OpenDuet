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
import { fileUrl } from "../data/file-cache";
import { flash } from "./flash";
import { attachmentSender } from "../data/attachment-state";   // 보냄 줄 = 입력칸과 같은 것(받는 방에 「전송 대기」 말풍선이 먼저 뜸 · 실패 = 그 자리 「다시 보내기」)
import { captureMsg } from "./capture";   // 「캡처」 = 그 글 한 줄을 그림으로(뎅 11-11 · 형 08:50 「책갈피 빼고는 가져오면 됨」)

const HOLD_MS = 500, SLIP = 10, ORIGIN_MAX = 2000;   // 0.5초(형 10-31 「적어도 0.5초 터치는 해야함」)

/** 방금 길게 누름이 터졌나 = 그 손을 뗄 때 오는 누름(PC 마우스 · 사진 크게 보기)은 안 셈 */
let heldAt = 0;
export const justHeld = () => Date.now() - heldAt < 800;
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
        timer.current = window.setTimeout(() => { long.current = true; timer.current = 0; heldAt = Date.now(); open(); }, HOLD_MS);
      },
      onPointerMove: (e: PointerEvent) => { if (timer.current && Math.hypot(e.clientX - at.current.x, e.clientY - at.current.y) > SLIP) stop(); },
      onPointerUp: stop, onPointerCancel: stop, onPointerLeave: stop,
      onContextMenu: (e: MouseEvent) => { e.preventDefault(); stop(); if (!long.current) open(); },
    },
  };
}

const short = (n: string) => n.replace(" PM", "");

export function MsgMenu({ m, who, text: raw, line, room, r, list, quick, onReact, onReply, pics = 0, onSave, onUnsent, onClose }: { onUnsent?: (id: string) => void; quick: string[]; onReact: (e: string) => void; onReply: () => void; pics?: number; onSave?: () => void; m: { id: string; ts: number; files?: unknown[] }; who: string; text: string; line: string; room: string; r?: OfficeRoom; list: OfficePerson[]; onClose: () => void }) {
  const text = raw || line;   // 사진만 든 글 = 파일 이름 줄
  const qc = useQueryClient(), pins = usePinActions(room), veil = useRef(false);   // 판 밖을 새로 눌렀을 때만 닫음(길게 누른 손을 뗄 때 닫히지 않게)
  const [gone, setGone] = useState(false);   // 「삭제」 → 「지울까?」 한 번(봄 08:57 · 되돌리기 어려운 손)
  const [asking, setAsking] = useState(false), [moving, setMoving] = useState(false), [busy, setBusy] = useState(false), [note, setNote] = useState(""), [why, setWhy] = useState("");
  const others = list.filter((p) => p.who !== "형" && p.kind !== "human");
  const targets = r?.with || !r?.members?.length ? others : r.members.map((n) => list.find((p) => p.who === n)).filter((p): p is OfficePerson => !!p);
  const done = (t: string) => { setNote(t); window.setTimeout(onClose, 900); };
  const [leaving, setLeaving] = useState(false);
  const closeSoft = () => { setLeaving(true); window.setTimeout(onClose, 170); };   // 바로 · 부드럽게 닫힘(투명도 · 크기만 · ./yeta-chat.css .nm-msgm.out)
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
  // 그 글의 첨부(서버 경로) → 이 기기로 받아 File 로(내부 공유 · 그림째 공유가 같이 씀)
  const paths = (Array.isArray(m.files) ? m.files : []).filter((p): p is string => typeof p === "string");
  const bareName = (p: string) => (p.split("/").pop() || "file").replace(/^\d{8}_\d{4}_/, "");
  const fetchFile = async (p: string) => {
    const res = await fetch(fileUrl(p), { credentials: "same-origin" });
    if (!res.ok) throw new Error(`파일을 못 받았어 (${res.status})`);
    const b = await res.blob();
    return new File([b], bareName(p), { type: b.type });
  };
  // 내부 공유(형 11-05 12:31 개발자 회의방 「다른 채팅창에서 그걸 채팅이나 이미지를 눌러서 내부 공유를 누르면, 우리 사무실 내부 다른 곳으로 전달되게」)
  //   = 고른 방에 그 글을 다시 올림 · 첨부는 받아서 지금 첨부 길(/files)로 그대로(original = 다시 안 줄임 · 받는 사람 폴더에도 들어감) · 머리 줄 = 어느 방 누구 글인지
  const rooms = (qc.getQueryData<OfficeRoom[]>(["nomute", "rooms"]) || []).filter((x) => x.id !== room && !x.id.startsWith("pair-") && x.id !== "notice" && x.id !== "summary");
  //   형 11-15 20:07 dm-bom(봄 옮김) 「내가 방 내용을 다른 방에 공유하면 화면이 멎었다가 풀려 렉때문인데 바로 창 부드럽게 꺼지고. 백단에서 공유 작업이 이루어질 수 있는지. 그 창에서는 바로 올라가야하고. 로딩으로 떠야해」
  //   → 방을 고르는 순간 창이 닫히고, 첨부 받기 · 올리기는 보냄 줄(attachmentSender.later)에서 뒤로 · 받는 방엔 그 글이 「전송 대기」 말풍선으로 먼저 뜨고 다 되면 진짜 글
  const forward = (to: OfficeRoom) => {
    const head = `↪ 「${r?.name || room}」 ${who}`, quiet = (raw || "").slice(0, 6000).replace(/(^|\s)([@!])(?=\S)/g, (_x, a: string, b: string) => a + (b === "@" ? "＠" : "！")), body = quiet ? `${head}\n${quiet}` : head;   // 넘긴 사본의 @·! = 전각(다른 방에서 또 깨우지 않게 · 원 글은 그대로)
    let ck = ""; try { ck = crypto.randomUUID().replace(/-/g, "").slice(0, 24); } catch { ck = `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`; }   // 다시 보내기 = 같은 열쇠(서버가 하나로)
    const toName = to.with ? short(list.find((p) => p.who === to.with)?.name || to.with) : to.name;
    attachmentSender.later(to.id, body, async () => {
      try {
      if (!paths.length) await office(`rooms/${encodeURIComponent(to.id)}/messages`, { method: "POST", body: JSON.stringify({ text: body, client_id: ck }) });
      else {
        const form = new FormData();
        (await Promise.all(paths.map(fetchFile))).forEach((f, i) => { form.append("file", f); form.append(`original_${i}`, "1"); });
        form.set("room", to.id); form.set("text", body); form.set("together", "1");
        const res = await fetch("/api/office/files", { method: "POST", credentials: "same-origin", body: form });
        if (!res.ok) { const j = (await res.json().catch(() => ({}))) as { why?: string; error?: string }; throw new Error(j.why || j.error || `못 보냈어 (${res.status})`); }
      }
      } catch (e) { flash(`「${toName}」 공유를 못 했어 — 그 방에서 「다시 보내기」`); throw e; }   // 다른 방이라 못 볼 수 있음 → 한 줄 알림 · 글은 그 방 보냄 줄에 남음
      flash(`「${toName}」에 보냈어`, "ok");
      void qc.invalidateQueries({ queryKey: ["nomute", "msgs", to.id] });
      void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
    });
    closeSoft();
  };
  const share = async () => {
    try {
      const pics = paths.filter((p) => /\.(png|jpe?g|webp|gif)$/i.test(p)).slice(0, 4);   // 그림 든 글 = 그림째 공유(되는 기기만 · 안 되면 글만)
      if (pics.length && navigator.canShare) {
        const fs = await Promise.all(pics.map(fetchFile));
        if (navigator.canShare({ files: fs })) { await navigator.share({ files: fs, ...(raw ? { text: raw } : {}) }); onClose(); return; }
      }
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard?.writeText(text); done("복사했어"); return; }
      onClose();
    } catch { onClose(); }   // 공유 창을 그냥 닫음
  };
  const item = (label: string, on: () => void) => <button key={label} type="button" role="menuitem" className="nm-msgm-i" disabled={busy} onClick={on}>{label}</button>;
  return createPortal(
    <div className={leaving ? "nm-msgm out" : "nm-msgm"} role="presentation" onPointerDown={(e) => { veil.current = e.target === e.currentTarget; }} onClick={(e) => { if (e.target === e.currentTarget && veil.current) onClose(); }} onContextMenu={(e) => e.preventDefault()}>
      <div className="nm-msgm-p" role="menu" aria-label={asking ? "확인 요청할 봇" : moving ? "보낼 방" : "글 메뉴"}>
        {note ? <p className={note === "✓" ? "nm-msgm-n nm-msgm-ok" : "nm-msgm-n"} role="status" aria-label={note === "✓" ? "저장됨" : undefined}>{note === "✓" ? <svg className="nm-tick" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg> : note}</p> : gone ? (
          <>
            {/* 형 11-12 06:13 「삭제 하시겠습니까? 아니오 예 이렇게만 나오면됨. 아니오에 라임색 이면 됨.」 — 설명 글 0 · 아니오(안 지움) = 라임 */}
            <p className="nm-msgm-ask">삭제 하시겠습니까?</p>
            <div className="nm-yn nm-msgm-yn">   {/* 재확인 단추 한 벌(./go-button.css .nm-yn · 형 11-16) */}
              <button type="button" className="no" disabled={busy} onClick={() => setGone(false)}>아니오</button>
              <button type="button" disabled={busy} onClick={() => { onUnsent?.(m.id); onClose(); }}>예</button>   {/* 바로 닫힘 · 서버는 office-chat 이 뒤에서(형 11-12 07:28) */}
            </div>
          </>
        ) : moving ? (
          <>
            <p className="nm-msgm-h">보낼 방{paths.length ? ` · 첨부 ${paths.length}` : ""}</p>
            {rooms.map((x) => <button key={x.id} type="button" role="menuitem" className="nm-msgm-i" disabled={busy} onClick={() => void forward(x)}><span>{x.with ? short(list.find((p) => p.who === x.with)?.name || x.with) : x.name}</span></button>)}
            {item("그만두기", () => setMoving(false))}
          </>
        ) : asking ? (
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
            <div className="nm-msgm-q" role="group" aria-label="반응">{quick.map((q) => <button key={q} type="button" aria-label={`반응 ${q}`} onClick={() => { onReact(q); onClose(); }}>{q}</button>)}</div>
            {pics && onSave ? item(pics > 1 ? `사진 저장 ${pics}장` : "사진 저장", () => { onSave(); done("✓"); }) : null}   {/* 형 11-04 08:22 「길게 누르면 사진을 다운로드」 = 사진 든 글은 맨 위 */}
            {item("답장", () => { onReply(); onClose(); })}
            {pins.can ? item("공지", () => { pins.pin({ id: m.id, ts: m.ts }); onClose(); }) : null}
            {item("복사", () => { void navigator.clipboard?.writeText(text); onClose(); })}   {/* 알림 없이 창만 닫힘(형 11-07 09:40 봄 1:1 「그리고 우클릭해서 복사 누르면, 복사햇어 라고 뜰 필요는 없고 그냥 ㅌ창 닫히면 됨.」) */}
            {item("확인 요청", () => setAsking(true))}
            {item("공유", () => void share())}
            {pins.can && onUnsent ? item("삭제", () => setGone(true)) : null}   {/* 형 · 봄만(형 11-11 08:57 「1하고 봄」) · 앱 = 형 화면만(봄은 열쇠로 서버 문) · pins.can = 사람 문 · 쓰기 됨 */}
            {item("캡처", () => { setBusy(true); void captureMsg(m.id, m.ts).then((r) => (r === "saved" ? done("✓") : r === "none" ? done("못 구웠어") : onClose())).catch(() => setWhy("캡처 못 했어 — 다시")).finally(() => setBusy(false)); })}
            {rooms.length ? item("다른 방으로", () => setMoving(true)) : null}
          </>
        )}
        {why ? <p className="nm-msgm-n err" role="alert">{why}</p> : null}
      </div>
    </div>,
    document.body,
  );
}

// 글 메뉴 = 누른 말풍선 바로 옆에 글 줄로(가운데 판 · 되묻는 창 없음) — 형 11-17 08:3x 구름 맥 창(영상) 「요것두~~~ 모달 안뜨고 간단하게 하는 식으루 / 답장은 스와이프로 가능하고 / 피시에서는 안되구나 / 삭제는 필요없고 복사 / 수정은 필요없고 다른 방으로 있어야 하고 / 공지 / 확인 요청 / 이모지는 이미 말풍선 잇어서 다른 애들거엔 이제 없어도 될수도잇음 / 공유」
//   꼴 = 나머지 화면은 흐려지고(막 한 장 · 누른 말풍선 자리만 구멍) 줄이 말풍선 쪽에서부터 차례로 뜸 · 셈(줄 차례 · 자리 · 구멍) = ./msg-menu-logic.ts · 모양 = ./msg-menu.css
//   앞 꼴 = 가운데 검은 판(카톡 글 메뉴 톤 · 아래 10-31 말) · 삭제 줄 + 「삭제 하시겠습니까?」는 걷음
// 글 길게 누르기(형 10-31 「톡방 내에서 특정 메세지 길게 누르면 카톡은 이렇게 뜨는데 우리는 톤 일단 맞추고」 · 「고정 복사 확인 요청 공유」)
//   톤 = 카톡 글 메뉴(어두운 둥근 판 · 글자 줄) · PC = 오른쪽 클릭 · 말풍선을 그냥 누르면 나오는 반응·답장 줄은 그대로
//   확인 요청 = 1:1 은 모든 봇 · 단톡은 그 방 멤버 · 한 명씩 다 뜨고 마지막에 모두(형 10-31)
//     단톡 = 그 방에서 인용 + 「!이름」 · 1:1 = 다른 봇은 이 방에 못 불러서 그 봇 1:1 방에 원문을 넣어 바로 깨움
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { IconCamera, IconChecks, IconChevronLeft, IconCopy, IconCornerUpLeft, IconCornerUpRight, IconDownload, IconShare2, IconSpeakerphone, IconTrash } from "@tabler/icons-react";
import { type MenuKey, MENU_KO, clipBox, holeMask, menuItems, placeMenu, saveKo } from "./msg-menu-logic";
import "./msg-menu.css";
import { createPortal } from "react-dom";
import { type OfficePerson, type OfficeRoom, idOf, office } from "../data/office";
import { MicOrb, ringOf } from "../swap/mic-orb";
import { usePinActions } from "./pins";
import { RoomIcon } from "./room-list";   // 「다른 방으로」 줄 방 얼굴(대화 목록과 같은 부품)
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

export function MsgMenu({ m, who, text: raw, line, room, r, list, quick, onReact, onReply, pics = 0, onSave, onClose, onUnsent }: { onUnsent?: (id: string) => void; quick: string[]; onReact: (e: string) => void; onReply: () => void; pics?: number; onSave?: () => void; m: { id: string; ts: number; files?: unknown[] }; who: string; text: string; line: string; room: string; r?: OfficeRoom; list: OfficePerson[]; onClose: () => void }) {
  const text = raw || line;   // 사진만 든 글 = 파일 이름 줄
  const qc = useQueryClient(), pins = usePinActions(room), veil = useRef(false);   // 판 밖을 새로 눌렀을 때만 닫음(길게 누른 손을 뗄 때 닫히지 않게)
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
  // ── 자리: 누른 말풍선을 찾아 그 옆에(처음 한 번 잼 · 메뉴가 떠 있는 동안 화면은 안 움직임) ──
  const [geo] = useState(() => {
    const row = document.querySelector<HTMLElement>(`[data-id="${CSS.escape(m.id)}"]`), el = row?.querySelector<HTMLElement>(".yb") || row?.querySelector<HTMLElement>(".ybw") || row;
    const q = el?.getBoundingClientRect(), mid = { top: innerHeight / 2 - 22, bottom: innerHeight / 2 + 22, left: innerWidth / 2 - 80, right: innerWidth / 2 + 80 };
    let sc: HTMLElement | null = el?.parentElement || null; while (sc && !/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement;   // 굴리는 칸 = 말풍선이 보이는 틀
    const f = sc?.getBoundingClientRect(), vis = q && q.width ? clipBox({ top: q.top, bottom: q.bottom, left: q.left, right: q.right }, f ? { top: f.top, bottom: f.bottom, left: f.left, right: f.right } : null) : null;
    return { b: vis || mid, seen: !!vis, mine: !!row && !row.classList.contains("ymsg"), rad: el ? parseFloat(getComputedStyle(el).borderTopLeftRadius) || 18 : 18 };
  });
  const mine = geo.mine, fine = typeof matchMedia === "function" && matchMedia("(pointer: fine)").matches;   // 마우스 화면 = 밀어서 답장이 안 됨 → 「답장」 줄을 둠
  const keys = menuItems({ pics: pics && onSave ? pics : 0, fine, canPin: pins.can, rooms: rooms.length, canDel: pins.can && !!onUnsent });   // 지우기 = 형 화면(공지 문과 같은 「형 · 쓰기 됨」 판정)
  const rows = note ? 1 : asking ? targets.length + 2 : moving ? rooms.length + 1 : keys.length + (mine ? 1 : 0);
  const place0 = placeMenu(geo.b, innerWidth, innerHeight, rows + (why ? 1 : 0), mine), place = geo.seen ? place0 : { ...place0, over: true }, hole = holeMask(geo.b, geo.rad);   // 말풍선을 못 찾았거나 안 보이면 구멍 없이
  useEffect(() => { const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } }; window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, [onClose]);
  const ICON: Record<MenuKey, ReactNode> = { save: <IconDownload />, reply: <IconCornerUpLeft />, copy: <IconCopy />, move: <IconCornerUpRight />, pin: <IconSpeakerphone />, ask: <IconChecks />, share: <IconShare2 />, shot: <IconCamera />, del: <IconTrash /> };
  const act: Record<MenuKey, () => void> = {
    save: () => { onSave?.(); done("✓"); },   // 형 11-04 08:22 「길게 누르면 사진을 다운로드」
    reply: () => { onReply(); onClose(); },
    copy: () => { void navigator.clipboard?.writeText(text); onClose(); },   // 알림 없이 닫힘(형 11-07 09:40 「복사햇어 라고 뜰 필요는 없고 그냥 ㅌ창 닫히면 됨.」)
    move: () => setMoving(true),
    pin: () => { pins.pin({ id: m.id, ts: m.ts }); onClose(); },
    ask: () => setAsking(true),
    share: () => void share(),
    del: () => { onUnsent?.(m.id); onClose(); },   // 묻기 없이 · 창 바로 닫힘 · 말풍선 바로 빠짐 · 서버는 뒤에서(./office-chat.tsx onUnsent · 실패 = 되살리고 한 줄)
    shot: () => { setBusy(true); void captureMsg(m.id, m.ts).then((x) => (x === "saved" ? done("✓") : x === "none" ? done("못 구웠어") : onClose())).catch(() => setWhy("캡처 못 했어 — 다시")).finally(() => setBusy(false)); },
  };
  const n = rows, at = (i: number) => ({ "--i": place.side === "above" ? n - 1 - i : i } as CSSProperties);   // 말풍선에 가까운 줄부터 차례로 뜸
  const back = (label: string, off: () => void) => <button key="back" type="button" role="menuitem" className="nm-mm-i back" style={at(0)} disabled={busy} onClick={off}><span>{label}</span><IconChevronLeft /></button>;
  const veilStyle = (place.over ? {} : { WebkitMaskImage: `linear-gradient(#000 0 0), ${hole.image}`, maskImage: `linear-gradient(#000 0 0), ${hole.image}`, WebkitMaskPosition: `0 0, ${hole.position}`, maskPosition: `0 0, ${hole.position}`, WebkitMaskSize: `100% 100%, ${hole.size}`, maskSize: `100% 100%, ${hole.size}` }) as CSSProperties;   // 줄이 말풍선 위에 겹칠 땐(화면만큼 긴 글) 구멍 없이 다 흐림
  return createPortal(
    <div className={leaving ? "nm-mm out" : "nm-mm"} data-side={place.side} data-align={place.align} data-over={place.over || undefined} role="presentation" onPointerDown={(e) => { veil.current = e.target === e.currentTarget; }} onClick={(e) => { if (e.target === e.currentTarget && veil.current) onClose(); }} onContextMenu={(e) => e.preventDefault()}>
      <i className="nm-mm-veil" aria-hidden style={veilStyle} />
      <div className="nm-mm-l" role="menu" aria-label={asking ? "확인 요청할 봇" : moving ? "보낼 방" : "글 메뉴"} style={{ [place.align]: place.x, ...(place.side === "above" ? { bottom: place.y } : { top: place.y }), maxHeight: place.maxH }}>
        {note ? <p className={note === "✓" ? "nm-mm-n ok" : "nm-mm-n"} role="status" aria-label={note === "✓" ? "저장됨" : undefined}>{note === "✓" ? <svg className="nm-tick" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg> : note}</p>
        : moving ? (
          <>
            {back(`보낼 방${paths.length ? ` · 첨부 ${paths.length}` : ""}`, () => setMoving(false))}
            {/* 줄마다 그 방 얼굴(형 11-17 01:27 dm-bom 「다른 방으로 누르면 애들 얼굴 뜨게래줘 땡큐」) = 1:1 = 그 애 명부 얼굴(MicOrb) · 단톡 = 방 아이콘(RoomIcon) */}
            {rooms.map((x, i) => { const p = x.with ? list.find((q) => q.who === x.with) : undefined; return (
              <button key={x.id} type="button" role="menuitem" className="nm-mm-i face" style={at(i + 1)} disabled={busy} onClick={() => void forward(x)}>
                <span>{x.with ? short(p?.name || x.with) : x.name}</span>
                {x.with ? <MicOrb size={28} id={idOf(x.with, list)} tint={ringOf(p)} /> : <RoomIcon r={x} size={28} />}
              </button>
            ); })}
          </>
        ) : asking ? (
          <>
            {back("확인 요청할 봇", () => setAsking(false))}
            {targets.map((p, i) => (
              <button key={p.who} type="button" role="menuitem" className="nm-mm-i face" style={at(i + 1)} disabled={busy} onClick={() => void ask(p)}>
                <span>{short(p.name || p.who)}{p.mark ? <span aria-hidden> {p.mark}</span> : null}</span>
                <MicOrb size={28} id={idOf(p.who, list)} tint={ringOf(p)} />
              </button>
            ))}
            <button type="button" role="menuitem" className="nm-mm-i" style={at(targets.length + 1)} disabled={busy} onClick={() => void ask(null)}><span>모두</span><IconChecks /></button>
          </>
        ) : (
          <>
            {/* 반응 줄 = 내 글에만(남의 글엔 말풍선 모서리에 바로 다는 반응이 이미 있음 · 형 「이모지는 이미 말풍선 잇어서 다른 애들거엔 이제 없어도 될수도잇음」) */}
            {mine ? <div className="nm-mm-q" role="group" aria-label="반응" style={at(0)}>{quick.map((q) => <button key={q} type="button" aria-label={`반응 ${q}`} onClick={() => { onReact(q); onClose(); }}>{q}</button>)}</div> : null}
            {keys.map((k, i) => <button key={k} type="button" role="menuitem" className="nm-mm-i" style={at(i + (mine ? 1 : 0))} disabled={busy} onClick={act[k]}><span>{k === "save" ? saveKo(pics) : MENU_KO[k]}</span>{ICON[k]}</button>)}
          </>
        )}
        {why ? <p className="nm-mm-n err" role="alert">{why}</p> : null}
      </div>
    </div>,
    document.body,
  );
}

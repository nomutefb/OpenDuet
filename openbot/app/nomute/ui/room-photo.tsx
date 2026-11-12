// 방 표지 사진 고르기 · 자르기(뎅 11-13 · 형 06:54 봄 1:1 「이거 방 목록이서프로필 사진쪽 클릭하면 바로 방 프로필 사진 변경으로 이동ㄷ어야하고 / 사진 설정 시 설명글은 필요없움 / 사진 설정 초기에 엑박이 떠있어. 해결히야하고 / 사진 고르면 이거를 첨부3 처럼 고르면서 동시에 틀 안에 격자로 설정  가능하게 해야함 / 그리구 방 목록에 즉시 반영이 안됨」)
//   첨부3 = 폰 사진 고르기 화면(원형 틀 + 3×3 격자 안에서 사진을 끌어 자리 · 크기 잡고 오른쪽 위 「완료」) · 앱·옛 에디터에 같은 틀이 없어 새로(찾아봄: profile-card squareWebp · room-art squareWebp = 가운데 자르기만)
//   차례 = 사진 고름(기기 고르기 창) → 이 판(원형 틀 · 격자 · 끌기 · 두 손가락/휠/막대 = 크기) → 「완료」 = 틀 안 정사각 256 webp → 서버(형 문만) → 아이콘보다 사진 먼저(roomlook icon 비움 · 색은 그대로) → 목록 바로(rooms 다시 받음 + 이 기기 판 번호)
import "./room-photo.css";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type OfficeRoom, office } from "../data/office";
import { uploadRoomArtBlob } from "./room-art";

const OUT = 256;
type View = { s: number; x: number; y: number };   // s = 배율(1 = 짧은 변이 틀에 꼭 맞음) · x,y = 틀 가운데에서 그림 가운데까지(화면 = 틀 한 변 비율)

/** 틀 안 정사각 → webp(가운데 · 배율 · 자리 그대로) */
async function cropWebp(img: HTMLImageElement, v: View): Promise<Blob> {
  const w = img.naturalWidth, h = img.naturalHeight, base = Math.min(w, h), side = base / v.s;   // 원본 픽셀로 틀 한 변
  const cx = w / 2 - v.x * side, cy = h / 2 - v.y * side;
  const c = document.createElement("canvas");
  c.width = c.height = OUT;
  c.getContext("2d")!.drawImage(img, cx - side / 2, cy - side / 2, side, side, 0, 0, OUT, OUT);
  return await new Promise<Blob>((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error("줄이지 못했어"))), "image/webp", 0.9));
}

/** 그림이 틀 밖으로 비지 않게 자리 · 배율 묶음(ar = 가로 ÷ 세로 · 긴 쪽은 그만큼 더 움직임) */
export function clamp(v: View, ar = 1): View {
  const s = Math.min(5, Math.max(1, v.s)), lx = (s * Math.max(ar, 1) - 1) / 2, ly = (s * Math.max(1 / ar, 1) - 1) / 2;
  return { s, x: Math.min(lx, Math.max(-lx, v.x)), y: Math.min(ly, Math.max(-ly, v.y)) };
}

export function RoomPhotoCrop({ file, onDone, onClose }: { file: File; onDone: (b: Blob) => Promise<void>; onClose: () => void }) {
  const [url] = useState(() => URL.createObjectURL(file));
  const [img, setImg] = useState<HTMLImageElement | null>(null), [bad, setBad] = useState(false);
  const [v, setV] = useState<View>({ s: 1, x: 0, y: 0 }), [busy, setBusy] = useState(false), [why, setWhy] = useState("");
  const box = useRef<HTMLDivElement>(null), pts = useRef(new Map<number, { x: number; y: number }>()), start = useRef<{ v: View; d: number; mx: number; my: number } | null>(null);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  useEffect(() => { const i = new Image(); i.onload = () => setImg(i); i.onerror = () => setBad(true); i.src = url; }, [url]);
  const ar = img ? img.naturalWidth / img.naturalHeight : 1;
  const side = () => box.current?.getBoundingClientRect().width || 300;
  const mid = () => { const ps = [...pts.current.values()]; return { x: ps.reduce((a, p) => a + p.x, 0) / ps.length, y: ps.reduce((a, p) => a + p.y, 0) / ps.length, d: ps.length > 1 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0 }; };
  const begin = () => { const m = mid(); start.current = { v, d: m.d, mx: m.x, my: m.y }; };
  const down = (e: React.PointerEvent) => { (e.target as Element).setPointerCapture?.(e.pointerId); pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); begin(); };
  const move = (e: React.PointerEvent) => {
    if (!pts.current.has(e.pointerId) || !start.current) return;
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const m = mid(), st = start.current, S = side();
    const s = st.d && m.d ? st.v.s * (m.d / st.d) : st.v.s;
    setV(clamp({ s, x: st.v.x + (m.x - st.mx) / S, y: st.v.y + (m.y - st.my) / S }, ar));
  };
  const up = (e: React.PointerEvent) => { pts.current.delete(e.pointerId); if (pts.current.size) begin(); else start.current = null; };
  const wheel = (e: React.WheelEvent) => setV((o) => clamp({ ...o, s: o.s * (e.deltaY < 0 ? 1.08 : 1 / 1.08) }, ar));
  const done = async () => {
    if (!img || busy) return;
    setBusy(true); setWhy("");
    try { await onDone(await cropWebp(img, v)); onClose(); }
    catch (e) { setWhy(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };
  // 그림 크기 = 짧은 변이 틀에 꼭 맞을 때 × s · 자리 = 틀 가운데 + x,y
  const w = (ar >= 1 ? ar : 1) * 100 * v.s, h = (ar >= 1 ? 1 : 1 / ar) * 100 * v.s;
  return createPortal(
    <div className="nrp-veil" role="presentation" onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (e.target === e.currentTarget && !busy) onClose(); }}
      onPointerDown={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} onContextMenu={(e) => e.stopPropagation()}>   {/* 포털이라도 리액트 누름은 부른 곳(목록 줄 · 방 링크)으로 번짐 → 여기서 끊음 */}
      <div className="nrp" role="dialog" aria-label="방 사진 자리 잡기">
        <div className="nrp-h"><button type="button" onClick={onClose} disabled={busy}>취소</button><b>방 사진</b><button type="button" className="ok" onClick={() => void done()} disabled={!img || busy}>{busy ? "올리는 중" : "완료"}</button></div>
        <div ref={box} className="nrp-frame" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel}>
          {img ? <img src={url} alt="" draggable={false} style={{ width: `${w}%`, height: `${h}%`, left: `${50 + v.x * 100 - w / 2}%`, top: `${50 + v.y * 100 - h / 2}%` }} /> : bad ? <p className="nrp-bad">그림을 못 읽었어 — 다른 사진으로</p> : null}
          <i className="nrp-mask" aria-hidden />
          <i className="nrp-grid" aria-hidden><span /><span /><span /><span /></i>
        </div>
        <input className="nrp-zoom" type="range" min={1} max={5} step={0.01} value={v.s} aria-label="크기" onChange={(e) => setV((o) => clamp({ ...o, s: Number(e.target.value) }, ar))} />
        {why ? <p className="nrp-why" role="alert">{why}</p> : null}
      </div>
    </div>,
    document.body,
  );
}

/** 방 사진 바꾸기 손 — pick() = 기기 사진 고르기 창 → 자르기 판 → 올림 · 아이콘 비움 · 목록 바로 */
export function useRoomPhoto(r: Pick<OfficeRoom, "id" | "look">) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const pick = () => {
    if (!input.current) { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.hidden = true; i.onchange = () => { const f = i.files?.[0]; i.value = ""; if (f) setFile(f); }; document.body.appendChild(i); input.current = i; }   // 몸에 붙여 둠 = 폰 사파리도 고르기 창이 뜸
    input.current.click();
  };
  const save = async (b: Blob) => {
    await uploadRoomArtBlob(r.id, b);
    if (r.look?.icon) await office("roomlook", { method: "POST", body: JSON.stringify({ room: r.id, icon: "", fg: r.look?.fg || "" }) }).catch(() => undefined);   // 아이콘 고른 방 = 사진이 안 보이던 까닭(목록이 아이콘 먼저) → 사진 고르면 아이콘 비움 · 색 그대로
    await qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
  };
  useEffect(() => () => { input.current?.remove(); }, []);
  const sheet = file ? <RoomPhotoCrop file={file} onDone={save} onClose={() => setFile(null)} /> : null;
  return { pick, sheet };
}

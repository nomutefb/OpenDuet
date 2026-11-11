// 방 사진(형 11-11 12:49 봄 1:1 「봄씨 뜸이 준 사진으로 방 사진 변경해주고 내가 따로 첨부로도 방 사진 변경할 수 있게해줘」 · 봄 「형만」 · 뜸)
//   보기 = /api/office/roomart/<방 id>(형이 올린 사진 · 없으면 서버가 정적 그림 /office/room-<id>.webp 로 넘김) · ?v = 이 기기에서 바꾼 때(바로 새 그림)
//   올리기 = 방 설정에서 사진 고름 → 가운데 정사각 256 webp 로 줄여 POST(서버 = 형 문만 받음 · _roomart.js)
import { useEffect, useState } from "react";

const KEY = "nm_roomart_v", EV = "nm-roomart";
function vers(): Record<string, string> { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { return {}; } }
export const roomArtSrc = (id: string, v = vers()[id] || "") => `/api/office/roomart/${encodeURIComponent(id)}${v ? `?v=${v}` : ""}`;
export function useRoomArtSrc(id: string) {
  const [v, setV] = useState(() => vers()[id] || "");
  useEffect(() => { const on = (e: Event) => { if ((e as CustomEvent).detail === id) setV(vers()[id] || ""); }; window.addEventListener(EV, on); return () => window.removeEventListener(EV, on); }, [id]);
  return roomArtSrc(id, v);
}
function bump(id: string) {
  const m = vers(); m[id] = String(Date.now());
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* 저장 막힘 = 이 화면만 */ }
  window.dispatchEvent(new CustomEvent(EV, { detail: id }));
}

/** 고른 사진 → 가운데 정사각 256 webp(캔버스) */
export async function squareWebp(file: File, side = 256): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error("그림을 못 읽었어")); i.src = url; });
    const s = Math.min(img.naturalWidth, img.naturalHeight), c = document.createElement("canvas");
    c.width = c.height = side;
    c.getContext("2d")!.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, side, side);
    return await new Promise<Blob>((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error("줄이지 못했어"))), "image/webp", 0.9));
  } finally { URL.revokeObjectURL(url); }
}

async function send(id: string, method: "POST" | "DELETE", body?: Blob) {
  const r = await fetch(`/api/office/roomart/${encodeURIComponent(id)}`, { method, credentials: "same-origin", ...(body ? { body, headers: { "content-type": body.type || "image/webp" } } : {}) });
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; why?: string; error?: string };
  if (!r.ok || !d.ok) throw new Error(d.why || d.error || `서버 ${r.status}`);
  bump(id);
}
export const uploadRoomArt = async (id: string, file: File) => send(id, "POST", await squareWebp(file));
export const resetRoomArt = (id: string) => send(id, "DELETE");

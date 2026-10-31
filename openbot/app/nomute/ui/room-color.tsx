// 단체방 표지 색(형 10-31 「단체방마다 표지색 고를 수 있게해」 · 「길게 누르면 변경 하는 거기서 수정」 · 「색은 지정색이 아니라 무지개 3d」 · 「판넬에서 드래그하다가 멈춰서」 ·
//   「근데 톤이 맞아야되니까 톤의 범위내에서 고를수잇게해줘」) = 줄 메뉴 「표지 색」 → 무지개 판 · 끌다가 손을 떼면 저장(서버 office/room-colors.json · 형만)
//   톤 범위 = 우리 사람 색 띠(봄 · 뎅 · 그록 · 클로드 · 닷)를 OKLCH 로 잰 값 · 판 가로 = 색상 전부 · 세로 = 위 선명 ↔ 아래 차분 · 밝기·채도는 이 안에서만 움직임
import "./room-color.css";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type OfficeRoom, office } from "../data/office";

const TONE = { top: { l: 0.76, c: 0.19 }, low: { l: 0.86, c: 0.1 } };   // 위 = 뎅·봄 쪽 · 아래 = 그록·닷보다 조금 차분
const HUE0 = 25;   // 판 왼쪽 끝 = 빨강
const W = 360, H = 150;

const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
const linear = (x: number) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
const inGamut = (c: number[]) => c.every((x) => x >= -0.0005 && x <= 1.0005);
function rawRgb(l: number, c: number, h: number) {
  const a = c * Math.cos((h * Math.PI) / 180), b = c * Math.sin((h * Math.PI) / 180);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3, M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3, S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S, -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S, -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S];
}
/** OKLCH → 화면 색 · 화면 밖 색은 채도만 줄여 맞춤 = 밝기는 톤 그대로 */
function rgbOf(l: number, c: number, h: number) {
  let lo = 0, hi = c;
  if (!inGamut(rawRgb(l, c, h))) { for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; if (inGamut(rawRgb(l, m, h))) lo = m; else hi = m; } } else lo = c;
  return rawRgb(l, lo, h).map((x) => Math.round(gamma(Math.max(0, Math.min(1, x))) * 255));
}
const at = (x: number, y: number) => rgbOf(TONE.top.l + (TONE.low.l - TONE.top.l) * y, TONE.top.c + (TONE.low.c - TONE.top.c) * y, (HUE0 + 360 * x) % 360);
const hexOf = (c: number[]) => "#" + c.map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();

/** 저장된 색 → 판 위 자리(다시 열었을 때 손잡이가 그 색에 있게) */
function spotOf(hex?: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex || "")) return { x: 0.5, y: 0.25 };
  const [r, g, b] = [1, 3, 5].map((i) => linear(parseInt(hex!.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return { x: ((h - HUE0 + 720) % 360) / 360, y: Math.max(0, Math.min(1, (L - TONE.top.l) / (TONE.low.l - TONE.top.l))) };
}

/** 줄 메뉴 안 무지개 구슬 */
export function RainbowOrb() { return <span aria-hidden className="nrc-orb" />; }

export function RoomColorPick({ room, onPeek, onClose }: { room: OfficeRoom; onPeek: (hex: string) => void; onClose: () => void }) {
  const qc = useQueryClient();
  const box = useRef<HTMLCanvasElement | null>(null);
  const [spot, setSpot] = useState(() => spotOf(room.color));
  const [hex, setHex] = useState(room.color || "");
  const [note, setNote] = useState("");
  useEffect(() => {
    const ctx = box.current?.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = at(x / (W - 1), y / (H - 1)), i = (y * W + x) * 4;
      img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, []);
  useEffect(() => {
    const off = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", off);
    return () => window.removeEventListener("keydown", off);
  }, [onClose]);
  const save = async (color: string) => {
    setNote("저장 중");
    try {
      await office("roomcolor", { method: "POST", body: JSON.stringify({ room: room.id, color }) });
      qc.setQueryData<OfficeRoom[]>(["nomute", "rooms"], (old) => old?.map((r) => (r.id === room.id ? { ...r, color: color || undefined } : r)));
      setNote(color ? "저장했어" : "기본으로 돌렸어");
    } catch (e) { setNote(e instanceof Error ? e.message : "저장을 못 했어"); }
  };
  const move = (e: { clientX: number; clientY: number }) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return "";
    const s = { x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) };
    const h = hexOf(at(s.x, s.y));
    setSpot(s); setHex(h); onPeek(h);
    return h;
  };
  return createPortal(
    <div className="nrc-veil nm-yeta" role="presentation" onClick={onClose}>
      <div className="nrc" role="dialog" aria-label={`${room.name} 표지 색`} onClick={(e) => e.stopPropagation()}>
        <div className="nrc-head"><span className="nrc-dot" style={{ background: hex || "var(--accent)" }} /><b>{room.name}</b><small>{note || "끌다가 손을 떼면 저장돼"}</small></div>
        <div className="nrc-pad">
          <canvas ref={box} width={W} height={H} aria-label="표지 색 판" style={{ touchAction: "none" }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); move(e); }}
            onPointerMove={(e) => { if (e.buttons) move(e); }}
            onPointerUp={(e) => { const h = move(e); if (h) void save(h); }} />
          <i style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%`, background: hex || undefined }} />
        </div>
        <div className="nrc-acts">
          <button type="button" className="nrc-x" onClick={() => { setHex(""); onPeek(""); void save(""); }}>기본으로</button>
          <button type="button" className="nrc-x" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** 방 이름(형 10-31 「방 길게누르면 이름도 변경 가능 해야하고」) = 줄 메뉴 「이름 바꾸기」 · 보이는 글자만(서버 _roomname.js · 방 id·글·읽음 그대로) · 형만 · 빈 값 = 원래 이름 */
export function RoomNamePick({ room, onClose }: { room: OfficeRoom; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(room.name), [note, setNote] = useState("");
  useEffect(() => {
    const off = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", off);
    return () => window.removeEventListener("keydown", off);
  }, [onClose]);
  const save = async (raw: string) => {
    setNote("저장 중");
    try {
      await office("roomname", { method: "POST", body: JSON.stringify({ room: room.id, name: raw }) });
      await qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
      onClose();
    } catch (e) { setNote(e instanceof Error ? e.message : "저장을 못 했어"); }
  };
  return createPortal(
    <div className="nrc-veil nm-yeta" role="presentation" onClick={onClose}>
      <form className="nrc" role="dialog" aria-label={`${room.name} 이름 바꾸기`} onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); void save(name); }}>
        <div className="nrc-head"><b>이름 바꾸기</b><small>{note || (room.base ? `원래 이름 ${room.base}` : "방 안 글은 그대로야")}</small></div>
        <input className="nrc-in" value={name} maxLength={20} autoFocus enterKeyHint="done" aria-label="방 이름" onChange={(e) => setName(e.target.value)} />
        <div className="nrc-acts">
          {room.base ? <button type="button" className="nrc-x" onClick={() => void save("")}>원래대로</button> : null}
          <button type="button" className="nrc-x" onClick={onClose}>닫기</button>
          <button type="submit" className="nrc-x">저장</button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

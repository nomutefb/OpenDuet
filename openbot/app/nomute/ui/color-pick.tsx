// 말풍선 색 고르기(형 10-31 「프로필 눌러서 rgb 고르는 거로 정할 수 있으면 함」 · 「2 누르면 3창이 뜨는 느낌」) = HEX · 판(밝기·진하기) · 색띠 · R G B
import { useRef, useState } from "react";

type Hsv = { h: number; s: number; v: number };

function fromHsv({ h, s, v }: Hsv): [number, number, number] {
  const f = (n: number) => { const k = (n + h / 60) % 6; return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255); };
  return [f(5), f(3), f(1)];
}
function toHsv(r: number, g: number, b: number): Hsv {
  const x = r / 255, y = g / 255, z = b / 255, max = Math.max(x, y, z), d = max - Math.min(x, y, z);
  const h = d === 0 ? 0 : max === x ? ((y - z) / d + 6) % 6 : max === y ? (z - x) / d + 2 : (x - y) / d + 4;
  return { h: h * 60, s: max ? d / max : 0, v: max };
}
const toHex = (c: number[]) => "#" + c.map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
const fromHex = (t: string) => (/^#?[0-9a-f]{6}$/i.test(t) ? [0, 2, 4].map((i) => parseInt(t.replace("#", "").slice(i, i + 2), 16)) : null);
/** 말풍선 글자색 = 배경 밝기로 저절로 */
export const inkOn = (hex: string) => { const c = fromHex(hex); return c && 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] > 150 ? "#161716" : "#FFFFFF"; };

export function ColorPick({ value, onSave, onClose }: { value?: string; onSave: (hex: string) => void; onClose: () => void }) {
  const first = fromHex(value || "") || [30, 32, 35];
  const [hsv, setHsv] = useState<Hsv>(() => toHsv(first[0], first[1], first[2]));
  const rgb = fromHsv(hsv), hex = toHex(rgb);
  const [typed, setTyped] = useState("");
  const box = useRef<HTMLDivElement | null>(null);
  const pick = (e: { clientX: number; clientY: number }) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setHsv((o) => ({ ...o, s: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), v: 1 - Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) }));
  };
  const setRgb = (i: number, n: number) => { const c = [...rgb]; c[i] = Math.max(0, Math.min(255, n || 0)); setHsv(toHsv(c[0], c[1], c[2])); };
  return (
    <div className="ncp" role="dialog" aria-label="말풍선 색 고르기" onClick={(e) => e.stopPropagation()}>
      <label className="ncp-f"><span>HEX</span>
        <input value={typed || hex} onChange={(e) => { setTyped(e.target.value); const c = fromHex(e.target.value); if (c) setHsv(toHsv(c[0], c[1], c[2])); }} onBlur={() => setTyped("")} />
      </label>
      <div ref={box} className="ncp-box" style={{ background: `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(${hsv.h} 100% 50%))` }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); pick(e); }} onPointerMove={(e) => { if (e.buttons) pick(e); }}>
        <i style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hex }} />
      </div>
      <input className="ncp-hue" type="range" min={0} max={360} aria-label="색" value={hsv.h} onChange={(e) => setHsv((o) => ({ ...o, h: +e.target.value }))} />
      <div className="ncp-rgb">
        {["R", "G", "B"].map((l, i) => (
          <label key={l} className="ncp-f"><span>{l}</span><input inputMode="numeric" value={rgb[i]} onChange={(e) => setRgb(i, +e.target.value)} /></label>
        ))}
      </div>
      <div className="ncp-acts">
        <button type="button" className="ypc-x" onClick={() => onSave("")}>기본으로</button>
        <button type="button" className="ypc-x" onClick={onClose}>닫기</button>
        <button type="button" className="ypc-go" onClick={() => onSave(hex)}>저장</button>
      </div>
    </div>
  );
}

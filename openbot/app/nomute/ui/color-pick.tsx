// 말풍선 색 고르기(형 10-31 「프로필 눌러서 rgb 고르는 거로 정할 수 있으면 함」 · 「2 누르면 3창이 뜨는 느낌」) = HEX · 판(밝기·진하기) · 색띠 · R G B
import { useRef, useState } from "react";
import { GoButton } from "./go-button";
import { useModal } from "./use-modal";   // Esc = 이 판만 닫힘(프로필 카드는 그대로) · Tab 가두기(빠르 11-08)

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

export function ColorPick({ value, onSave, onClose }: { value?: string; onSave: (hex: string) => Promise<unknown> | void; onClose: () => void }) {
  const first = fromHex(value || "") || [30, 32, 35];
  const [hsv, setHsv] = useState<Hsv>(() => toHsv(first[0], first[1], first[2]));
  const rgb = fromHsv(hsv), hex = toHex(rgb);
  const [typed, setTyped] = useState("");
  const box = useRef<HTMLDivElement | null>(null);
  const root = useModal<HTMLDivElement>(onClose);
  const pick = (e: { clientX: number; clientY: number }) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setHsv((o) => ({ ...o, s: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), v: 1 - Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) }));
  };
  const setRgb = (i: number, n: number) => { const c = [...rgb]; c[i] = Math.max(0, Math.min(255, n || 0)); setHsv(toHsv(c[0], c[1], c[2])); };
  return (
    <div ref={root} className="ncp" role="dialog" aria-label="말풍선 색 고르기" onClick={(e) => e.stopPropagation()}>
      <PickTop label="말풍선 색" onUndo={() => void Promise.resolve(onSave("")).then(onClose, () => {})} onSave={() => onSave(hex)} onDone={onClose} onClose={onClose} />
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
    </div>
  );
}

const UNDO = <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>;
const SAVE = <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;
const CLOSE = <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>;

/** 색 고르기 창 머리 = 왼쪽 이름 · 우상단 그림 단추 나란히(형 11-01 10:5x 「되돌리기 픽토그램, 저장 닫기 이 3개 버튼을 이 모달창의 우상단으로 보내버려」 · 「픽토그램은 동그라미로 또 덮을 필요는 없어 수평으로 나란히 작게 3개면됨」) · 저장 없는 판(표지 색 = 떼면 저장)은 둘 */
//   저장 그림 = GoButton(./go-button.tsx · 형 11-01 14:12 「전송에 게이지 차오르고 체크되는 버튼」) — 누르면 그림 동그라미에 게이지 → ✓ → onDone(창 닫기 = ✓ 를 본 뒤)
export function PickTop({ label, onUndo, onSave, onDone, onClose }: { label: string; onUndo: () => void; onSave?: () => Promise<unknown> | void; onDone?: () => void; onClose: () => void }) {
  return (
    <div className="ncp-top">
      <span>{label}</span>
      <div className="ncp-ico">
        <button type="button" aria-label="기본으로 되돌리기" title="기본으로" onClick={onUndo}>{UNDO}</button>
        {onSave ? <GoButton className="ncp-go" label="저장" busy="" go={async () => onSave()} done={() => onDone?.()}>{SAVE}</GoButton> : null}
        <button type="button" aria-label="닫기" title="닫기" onClick={onClose}>{CLOSE}</button>
      </div>
    </div>
  );
}

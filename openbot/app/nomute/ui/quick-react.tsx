// 말풍선 · 미디어마다 바로 다는 반응(형 11-14 05:56 dm-bom · 봄 옮김 「너네 말풍선 이나 미디어 개별 마다 이모지 고를수잇는 버튼 하나가 붙어서 누르면 모달 안뜨고 바로 이렇게 리액션 가능하게 가능해? 리액션 이모지 자주 쓰는데 모달 켜서 누르는게 생각보다 투박하고 딜레이되거든」 · 「달리는 곳에 미리 달라붙어잇고 점등 꺼져잇다가 내가 누르는 느낌」)
//   꼴(형 본보기 영상 · 봄 05:57 풀이) = 말풍선 오른쪽 위 모서리 작은 둥근 단추(흐림) → 누르면 그 단추를 가운데 두고 이모지가 둥글게 빙 둘러 펼쳐짐(유리 구슬) · 손이 간 구슬 = 가운데 글자가 그 뜻으로 · 고르면 접히고 모서리에 고른 이모지 하나가 불 켜진 채 남음 · 다시 같은 것 = 빠짐
//   폰 = 올려놓기 없음 → 누르면 펼침 · 누르면 달림 · 바깥 누름 · Esc = 접힘 · 길게 누르는 옛 길(글 메뉴 · 빠른 반응 줄)은 그대로
import { type CSSProperties, useEffect, useRef, useState } from "react";
import "./quick-react.css";

const NAME: Record<string, string> = { "✅": "확인", "👍": "좋아", "❤️": "사랑", "😂": "웃김", "🎉": "축하", "🤔": "글쎄", "👀": "봤어", "🙏": "고마워", "🔥": "멋져", "😢": "슬퍼" };
const SMILE = <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M8.5 14.2c.9 1.3 2.1 2 3.5 2s2.6-.7 3.5-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="9.2" cy="10" r="1.1" fill="currentColor" /><circle cx="14.8" cy="10" r="1.1" fill="currentColor" /></svg>;

export function QuickReact({ id, quick, mine, onReact }: { id: string; quick: string[]; mine: string[]; onReact: (id: string, e: string) => void }) {
  const [open, setOpen] = useState(false), [hover, setHover] = useState("");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return undefined;
    const off = (ev: PointerEvent) => { if (!box.current?.contains(ev.target as Node)) setOpen(false); };
    const esc = (ev: KeyboardEvent) => { if (ev.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", off); window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", off); window.removeEventListener("keydown", esc); };
  }, [open]);
  const lit = mine[0] || "";
  const R = 46, n = quick.length;
  return (
    <div ref={box} className={`nm-qr${open ? " open" : ""}${lit ? " lit" : ""}`} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <button type="button" className="nm-qr-btn" aria-label={lit ? `내 반응 ${lit} · 바꾸기` : "반응 달기"} aria-expanded={open} onClick={() => { setOpen((v) => !v); setHover(""); }}>
        {lit ? <span className="nm-qr-lit">{lit}</span> : SMILE}
      </button>
      {open ? <span className="nm-qr-hub" aria-hidden><span className="nm-qr-name">{hover ? NAME[hover] || hover : "반응"}</span></span> : null}   {/* 가운데 = 손 간 구슬 뜻(형 본보기 「React → Love it」) · 크기 바뀜은 transform 만(형 05:57 「웅 고프레임이면 조음」) */}
      {open ? quick.map((q, i) => {
        const a = (-90 + (360 / n) * i) * (Math.PI / 180), on = mine.includes(q);
        return (
          <button key={q} type="button" className={`nm-qr-orb${on ? " on" : ""}`} style={{ "--x": `${Math.round(Math.cos(a) * R)}px`, "--y": `${Math.round(Math.sin(a) * R)}px`, "--d": `${i * 22}ms` } as CSSProperties}
            aria-label={`${NAME[q] || q}${on ? " 빼기" : ""}`} onPointerEnter={() => setHover(q)} onPointerLeave={() => setHover("")} onFocus={() => setHover(q)}
            onClick={() => { onReact(id, q); setOpen(false); setHover(""); }}>{q}</button>
        );
      }) : null}
    </div>
  );
}

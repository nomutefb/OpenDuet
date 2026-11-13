// 말풍선 · 미디어마다 바로 다는 반응(형 11-14 05:56 dm-bom · 봄 옮김 「너네 말풍선 이나 미디어 개별 마다 이모지 고를수잇는 버튼 하나가 붙어서 누르면 모달 안뜨고 바로 이렇게 리액션 가능하게 가능해? 리액션 이모지 자주 쓰는데 모달 켜서 누르는게 생각보다 투박하고 딜레이되거든」 · 「달리는 곳에 미리 달라붙어잇고 점등 꺼져잇다가 내가 누르는 느낌」)
//   꼴(형 본보기 영상 · 봄 05:57 풀이) = 말풍선 오른쪽 위 모서리 작은 둥근 단추(흐림) → 누르면 그 단추를 가운데 두고 이모지가 둥글게 빙 둘러 펼쳐짐(유리 구슬) · 손 간 구슬 = 가운데 아래 뜻 글자
//   형 06:16 「너무좋다. 대신 말풍선은 고르면 고르는 라인에서는 사라지고 이미 달은거를 다시 누르면 바꿀 수 있게 해줘 가운데 빼기가 나오면 되겠네 이미 달아진거는」
//     = 단 뒤엔 모서리 단추 사라짐(달린 건 아래 반응 줄 하나만) · 내가 단 이모지(반응 줄)를 다시 누르면 그 자리에서 구슬 펼침 = 바꾸기 · 가운데 = 빼기(−)
//   형 06:17 「반응 대신 해당 말풍선 주인 프로필 사진이 나오게 해줘. 리액션 단톡에서도 안헷갈리게」 · 「남이 달은거를 클릭 시 누가 달았는지 보는거는 기존과 동일해」
//     = 가운데 = 그 말풍선 쓴 이 얼굴(빼기는 얼굴 위 작은 − 단추) · 남이 단 이모지 누름 = 누가 달았나(옛 길 그대로 · ./office-chat Reactions)
//   폰 = 올려놓기 없음 → 누르면 펼침 · 누르면 달림 · 바깥 누름 · Esc = 접힘 · 움직임 = transform · opacity 만(형 05:57 「웅 고프레임이면 조음」)
import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaceImg } from "./faces";
import "./quick-react.css";

const NAME: Record<string, string> = { "✅": "확인", "👍": "좋아", "❤️": "사랑", "😂": "웃김", "🎉": "축하", "🤔": "글쎄", "👀": "봤어", "🙏": "고마워", "🔥": "멋져", "😢": "슬퍼" };
const SMILE = <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M8.5 14.2c.9 1.3 2.1 2 3.5 2s2.6-.7 3.5-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="9.2" cy="10" r="1.1" fill="currentColor" /><circle cx="14.8" cy="10" r="1.1" fill="currentColor" /></svg>;

/** 구슬 둘레(부모 = position:relative 한 점 · 그 가운데를 축으로 펼침) */
export function QrRadial({ quick, mine, faceId, onPick, onRemove, onClose }: { quick: string[]; mine: string[]; faceId?: string; onPick: (e: string) => void; onRemove?: () => void; onClose: () => void }) {
  const [hover, setHover] = useState("");
  const box = useRef<HTMLSpanElement>(null);
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const off = (ev: PointerEvent) => { if (!box.current?.contains(ev.target as Node)) close.current(); };
    const esc = (ev: KeyboardEvent) => { if (ev.key === "Escape") close.current(); };
    const t = window.setTimeout(() => document.addEventListener("pointerdown", off), 0);   // 연 누름이 바로 닫지 않게 한 박자 뒤
    window.addEventListener("keydown", esc);
    return () => { window.clearTimeout(t); document.removeEventListener("pointerdown", off); window.removeEventListener("keydown", esc); };
  }, []);
  const R = 48, n = quick.length;
  // 가장자리에 닿으면 고리를 안쪽으로 밂(봄 06:23 「아래쪽 구슬 둘이 화면 밑(입력 칸 쪽)에 가려 안 보여 … 위 · 아래 · 왼 · 오른 다」) = 둘레 반지름(구슬 끝까지) + 6 여백이 대화 목록 칸(스크롤 칸) 안에 들어오게
  const [shift, setShift] = useState<[number, number]>([0, 0]);
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    let sc: HTMLElement | null = el.parentElement;
    while (sc && !/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement;
    const r = el.getBoundingClientRect(), b = sc ? sc.getBoundingClientRect() : { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
    const E = R + 17 + 6, L = Math.max(b.left, 0), T = Math.max(b.top, 0), Rr = Math.min(b.right, innerWidth), B = Math.min(b.bottom, innerHeight);
    const dx = r.left - E < L ? L - (r.left - E) : r.left + E > Rr ? Rr - (r.left + E) : 0;
    const dy = r.top - E < T ? T - (r.top - E) : r.top + E > B ? B - (r.top + E) : 0;
    if (dx || dy) setShift([Math.round(dx), Math.round(dy)]);
  }, []);
  return (
    <span ref={box} className="nm-qr-rad" style={shift[0] || shift[1] ? { transform: `translate(${shift[0]}px, ${shift[1]}px)` } : undefined} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <span className="nm-qr-hub">
        {faceId ? <FaceImg id={faceId} size={40} className="nm-qr-face" /> : <span className="nm-qr-name">반응</span>}
        {hover ? <span className="nm-qr-tip">{NAME[hover] || hover}</span> : null}
      </span>
      {onRemove ? <button type="button" className="nm-qr-minus" aria-label="내 반응 빼기" onClick={() => { onRemove(); onClose(); }}>−</button> : null}
      {quick.map((q, i) => {
        const a = (-90 + (360 / n) * i) * (Math.PI / 180), on = mine.includes(q);
        return (
          <button key={q} type="button" className={`nm-qr-orb${on ? " on" : ""}`} style={{ "--x": `${Math.round(Math.cos(a) * R)}px`, "--y": `${Math.round(Math.sin(a) * R)}px`, "--d": `${i * 22}ms` } as CSSProperties}
            aria-label={NAME[q] || q} onPointerEnter={() => setHover(q)} onPointerLeave={() => setHover("")} onFocus={() => setHover(q)}
            onClick={() => { onPick(q); onClose(); }}>{q}</button>
        );
      })}
    </span>
  );
}

/** 모서리 꺼진 단추 = 아직 안 단 말풍선에만(형 06:16 「고르면 고르는 라인에서는 사라지고」) */
export function QuickReact({ id, quick, mine, faceId, onReact }: { id: string; quick: string[]; mine: string[]; faceId?: string; onReact: (id: string, e: string) => void }) {
  const [open, setOpen] = useState(false);
  if (mine.length) return null;
  return (
    <div className={`nm-qr${open ? " open" : ""}`} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <button type="button" className="nm-qr-btn" aria-label="반응 달기" aria-expanded={open} onClick={() => setOpen((v) => !v)}>{SMILE}</button>
      {open ? <QrRadial quick={quick} mine={mine} faceId={faceId} onPick={(e) => onReact(id, e)} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

// 「어떤 봇」 고르기 = 입력칸 「@」 부름 목록과 같은 꼴(형 11-02 02:24 「그리고 봇 저거 선택 누르면 1처럼 뜨는데 하네스 유지해서 우리가.채팅창에 태그하면 나오는거 처럼 유지시켜야 하고」)
//   폰 기본 고르기(이름 + 동그라미 · 사진 97092) 대신 = 단추(얼굴 · 이름 · 꺽쇠) → 누르면 바로 아래 목록
//   목록 줄 = 원본 prompt-area 부름 목록 줄 그대로(얼굴 24 · 이름 굵게 · 표지 · 아래 작은 글 · 고른 줄 = 라임 띠 · yeta-chat.css 「부름 목록 선택 줄」과 같은 값) · 밖 누름·Esc = 닫힘 · 위아래 키·Enter
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Chev } from "./chev";
import "./bot-pick.css";

export type BotOpt = { id: string; name: string; mark?: string; face: ReactNode; note?: string };

export function BotPick({ value, opts, label, disabled, onPick }: { value: string; opts: BotOpt[]; label: string; disabled?: boolean; onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false), [up, setUp] = useState(false), [hi, setHi] = useState(0), box = useRef<HTMLDivElement>(null);
  const cur = opts.find((o) => o.id === value);
  useEffect(() => {
    if (!open) return undefined;
    setHi(Math.max(0, opts.findIndex((o) => o.id === value)));
    const b = box.current?.getBoundingClientRect(), need = Math.min(360, opts.length * 52 + 16);
    setUp(!!b && window.innerHeight - b.bottom < need + 96 && b.top > window.innerHeight - b.bottom);   // 96 = 아래 메뉴줄
    const out = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", out);
    return () => document.removeEventListener("pointerdown", out);
  }, [open]);   // eslint-disable-line react-hooks/exhaustive-deps -- 열 때 한 번만 고른 줄로
  const pick = (id: string) => { setOpen(false); if (id !== value) onPick(id); };
  const key = (e: KeyboardEvent) => {
    if (!open) { if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } return; }
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setHi((i) => (i + 1) % opts.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((i) => (i - 1 + opts.length) % opts.length); }
    else if (e.key === "Enter") { e.preventDefault(); const o = opts[hi]; if (o) pick(o.id); }
  };
  const nm = (o?: BotOpt) => (o ? <>{o.name}{o.mark ? <span className="ymark" aria-hidden>{o.mark}</span> : null}</> : value);
  return (
    <div className="nm-bpick" ref={box}>
      <button type="button" className="nm-bpick-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={`${label} ${cur?.name || value}`} disabled={disabled} onClick={() => setOpen(!open)} onKeyDown={key}>
        {cur?.face}<span className="min-w-0 truncate">{nm(cur)}</span><Chev dir={open ? "up" : "down"} size={12} />
      </button>
      {open ? (
        <div className="nm-bpick-list" role="listbox" aria-label={label} data-up={up || undefined}>
          {opts.map((o, i) => (
            <button key={o.id} type="button" role="option" aria-selected={o.id === value} data-hi={i === hi || undefined} className="nm-bpick-opt" onPointerEnter={() => setHi(i)} onClick={() => pick(o.id)}>
              <span className="nm-bpick-face">{o.face}</span>
              <span className="min-w-0 flex-1"><b>{nm(o)}</b>{o.note ? <small>{o.note}</small> : null}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// 머리 원이 대화 속 얼굴 자리로 내려감(형 10-31 「프로필 원을 대화 쪽에 보내버릴수잇나? 자연스럽게 변경되서 대화중인 상대 프로필 원이 뜨면 되는건데 지금의 퀄리티가 유지되어야해」)
//   방에 들어올 때 한 번 · 같은 얼굴 부품(MicOrb)이 맨 위 가운데에서 마지막 상대 얼굴 자리로 · 움직임 결 = 아래 네비(.34초 · 같은 곡선) · 도착하면 진짜 얼굴이 이어받음
import { type RefObject, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MicOrb } from "../swap/mic-orb";

const FROM = 62, TO = 40, MS = 340, EASE = "cubic-bezier(.2,.7,.3,1)";

export function OrbFlight({ box, id, tint }: { box: RefObject<HTMLElement | null>; id: string; tint?: string }) {
  const el = useRef<HTMLSpanElement>(null), [on, setOn] = useState(true);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) { setOn(false); return; }
    let anim: Animation | undefined;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => {   // 맨 아래로 내려간 뒤 자리를 잰다
      const root = box.current, me = el.current, face = root ? [...root.querySelectorAll<HTMLElement>(".ymsg:not(.cont) .yava")].at(-1) : undefined;
      const a = face?.getBoundingClientRect(), p = root?.getBoundingClientRect();
      if (!face || !me || !a || !p || a.top < p.top || a.bottom > p.bottom) { setOn(false); return; }
      const x0 = p.left + p.width / 2 - FROM / 2, y0 = Math.max(4, p.top + 4), x1 = a.left + a.width / 2 - TO / 2, y1 = a.top + a.height / 2 - TO / 2;
      face.style.visibility = "hidden";
      anim = me.animate([{ transform: `translate(${x0}px,${y0}px) scale(1)` }, { transform: `translate(${x1}px,${y1}px) scale(${TO / FROM})` }], { duration: MS, easing: EASE, fill: "both" });
      const end = () => { face.style.visibility = ""; setOn(false); };
      anim.onfinish = end; anim.oncancel = end;
    }));
    return () => { cancelAnimationFrame(raf); anim?.cancel(); };
  }, [box]);
  return on ? createPortal(<span ref={el} className="nm-fly"><MicOrb size={FROM} id={id} tint={tint} /></span>, document.body) : null;
}

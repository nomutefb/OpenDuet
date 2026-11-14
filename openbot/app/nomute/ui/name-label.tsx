import type { CSSProperties } from "react";
import { LiveShine } from "./live-shine";
import { nameLabelColor, nameLabelBorder } from "./name-label-color";

/** 일반 답 · 생각 중 · 쓰는 중이 같은 흰 글자와 바탕을 쓴다. */
export function NameLabel({ text, tint, mark, thinking = false, pm = false }: { text: string; tint?: string; mark?: string; thinking?: boolean; pm?: boolean }) {   // pm = 지금 PM(서버 명부 pm:true) = 이름 알약에 빛줄기(형 11-14 21:51 깃 옮김 「어 그리고 PM은 이름표에 빛지나가는 효과나게하셈」)
  const background = nameLabelColor(tint);
  return <div className={`yname tab${pm ? " pm" : ""}`} style={{ "--yn-bg": background, "--yn-line": nameLabelBorder(background) } as CSSProperties}>
    {thinking ? <LiveShine text={text} /> : text}
    {mark ? <span className="ymark" aria-hidden>{mark}</span> : null}
  </div>;
}

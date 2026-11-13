import type { CSSProperties } from "react";
import { LiveShine } from "./live-shine";
import { nameLabelColor, nameLabelBorder } from "./name-label-color";

/** 일반 답 · 생각 중 · 쓰는 중이 같은 흰 글자와 바탕을 쓴다. */
export function NameLabel({ text, tint, mark, thinking = false }: { text: string; tint?: string; mark?: string; thinking?: boolean }) {
  const background = nameLabelColor(tint);
  return <div className="yname tab" style={{ "--yn-bg": background, "--yn-line": nameLabelBorder(background) } as CSSProperties}>
    {thinking ? <LiveShine text={text} /> : text}
    {mark ? <span className="ymark" aria-hidden>{mark}</span> : null}
  </div>;
}

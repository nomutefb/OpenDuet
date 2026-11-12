// 받기 단추 움직임 한 벌(형 11-13 02:28 「이거 다운로드 버튼 우상단 누르면 1 2 3 숫자만큼 카운트되도 체크 된 다음 돌아오게해줘」 · 02:30 「다운로드 버튼에 이미 구현된 내용이야.」 · 02:32 「여기서 저장 누르는것도색만 바뀌면 … 바꼇다가 다시 돌아와야해」 · 봄 옮김)
//   = 에디터 「⬇ 전체」(thumb-maker engine/p04-media.ts dlAllSeq · thumb-maker.css tm-dlChkPop) 그대로 옮김 — 값 안 바꿈:
//     누름 → 라임 · 한 장씩 받으며 「k/N」(여러 장일 때만) → 다 받으면 아래 화살표 → 체크 팝(.42s · .3 → 1.3 → 1) · 「완료」 → 1.05초 뒤 원래 아이콘 · 글자
import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { grabSeq } from "./dl-logic";
import "./dl-seq.css";

const SV = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
const GAP = 280;   // 에디터 dlAllSeq 한 장 사이(ms) 그대로
const BACK = 1050; // 체크 뒤 원래로(ms) 그대로

export function DlSeqButton({ hrefs, className = "", label, ariaLabel, size = 22, style }: { hrefs: string[]; className?: string; label?: string; ariaLabel: string; size?: number; style?: CSSProperties }) {
  const [st, setSt] = useState<{ ph: "idle" | "busy" | "done"; k: number }>({ ph: "idle", k: 0 }), busy = useRef(false);
  const n = hrefs.filter(Boolean).length;
  const go = (e: MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (busy.current || !n) return;
    busy.current = true; setSt({ ph: "busy", k: 0 });
    void grabSeq(hrefs.filter(Boolean), (k: number) => setSt({ ph: "busy", k: k + 1 }), GAP).then(() => {
      setSt({ ph: "done", k: n });
      window.setTimeout(() => { setSt({ ph: "idle", k: 0 }); busy.current = false; }, BACK);
    });
  };
  const txt = st.ph === "busy" && n > 1 ? `${st.k}/${n}` : st.ph === "done" && n > 1 ? "완료" : label;
  return (
    <button type="button" className={`${className} nm-dlseq${st.ph === "idle" ? "" : ` is-${st.ph}`}`} aria-label={ariaLabel} title={ariaLabel} onClick={go} style={style}>
      <span className="nm-dlseq-ic" style={{ width: size, height: size }}>
        <svg {...SV} className="dn"><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></svg>
        <svg {...SV} className="chk"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
      </span>
      {txt ? <span className="nm-dlseq-lbl">{txt}</span> : null}
    </button>
  );
}

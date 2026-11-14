// 이미지 편집 · 영상 편집 자리 — 접어도 안 사라지는 창(형 11-15 「예전 에디터 처럼 최소화 가능한 창으로 … 버튼도 예전처럼 모바일에서 닫기버튼 최소화 버튼 그대로 가져옴」)
//   창 = 껍데기 창 밖 제 겹에서 늘 같은 자리에 그림 · 접힘(min) = 숨기기만(visibility · 크기 그대로 = 엔진이 재는 폭 · 높이 안 바뀜) → 주소를 벗어나도 올린 사진 · 쓴 글 · 진행 중 생성이 삶
//   단추 · 복원 ▲ · 「닫기」 칩 · 고르는 판 = 옛 에디터 것 그대로(../vendor/editor/tool-win.css · 마크업 = viewer-src/11-document.part #toolMin · #toolRf · #toolX · #toolRestore)
//   손 = 옛 41-toolRfVis.part 와 같은 셈: ▲ 누름 = 하나면 바로 펼침 · 둘이면 고르는 판 · 길게(550ms) = 「닫기」 칩(4초 뒤 저절로 취소 · 칩 누르면 190ms 뒤 접어 둔 것 다 닫음)
//   움직임 = 접힘 · 펼침 한 번씩 · ▲ 빛 = 세 번 숨 쉬고 멈춤(옛 = 6초 뒤 끔) · 옷 = ./ed-keep.css
import "../vendor/editor/tool-win.css";
import "./ed-keep.css";
import { type ReactNode, Suspense, lazy, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ED_LABEL, type EdTool } from "./ed-keep-logic";
import { useModal } from "./use-modal";

export const ThumbMaker = lazy(() => import("./thumb-maker"));   // 원본 엔진 · CSS 가 커서 열 때만 받음

const I = { viewBox: "0 0 24 24", width: 15, height: 15, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const };
/** 창 머리 오른쪽 단추 묶음 = 옛 .tool-hbtns(최소화 − · 입력 초기화 ⟳ · 닫기 ×) */
export function ToolButtons({ onMin, onReset, onClose }: { onMin?: () => void; onReset?: () => void; onClose?: () => void }) {
  return (
    <span className="tool-hbtns">
      {onMin ? <button className="tool-x tool-min" type="button" aria-label="최소화" title="최소화" onClick={onMin}><svg {...I}><path d="M6 12h12" /></svg></button> : null}
      {onReset ? <button className="tool-x tool-rf" type="button" aria-label="입력 초기화" title="입력 초기화 — 이 세부 메뉴의 글자·사진 비우기" onClick={onReset}><svg {...I} strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg></button> : null}
      {onClose ? <button className="tool-x" type="button" aria-label="닫기" onClick={onClose}><svg {...I}><path d="M6 6 18 18M18 6 6 18" /></svg></button> : null}
    </span>
  );
}

export function ToolKeep({ tool, open, covered, onClose, children }: { tool: EdTool; open: boolean; covered?: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useModal<HTMLDivElement>(onClose, open);   // 열렸을 때만 Esc · Tab 가두기
  return (
    <div ref={ref} className={open ? "nm-modal see nm-edkeep" : "nm-modal see nm-edkeep min"} data-tool={tool} role="dialog" aria-modal={open} aria-label={ED_LABEL[tool]} aria-hidden={!open} inert={!open || covered || undefined}>
      <div className="nm-modal-b tm-host"><Suspense fallback={null}>{children}</Suspense></div>
    </div>
  );
}

/** 복원 ▲ — 접어 둔 창이 있을 때만 */
export function ToolRestore({ items, onRestore, onCloseAll }: { items: EdTool[]; onRestore: (t: EdTool) => void; onCloseAll: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  const [pick, setPick] = useState(false), [arm, setArm] = useState<{ x: number; y: number } | null>(null), [closing, setClosing] = useState(false);
  const s = useRef({ lp: 0, auto: 0, guard: 0, moved: false, sx: 0, sy: 0, guarded: false });
  const n = items.length;
  useEffect(() => { if (n < 2) setPick(false); }, [n]);
  useEffect(() => () => { clearTimeout(s.current.lp); clearTimeout(s.current.auto); clearTimeout(s.current.guard); }, []);
  useEffect(() => {   // 고르는 판 = 바깥 누르면 닫힘(판 안 · ▲ 자신은 빼고)
    if (!pick) return;
    const out = (e: PointerEvent) => { const t = e.target as HTMLElement | null; if (!t?.closest?.(".min-pick, .tool-restore")) setPick(false); };
    document.addEventListener("pointerdown", out, true);
    return () => document.removeEventListener("pointerdown", out, true);
  }, [pick]);
  if (!n) return null;
  const disarm = () => { clearTimeout(s.current.auto); setArm(null); setClosing(false); };
  const doArm = () => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    setPick(false); setArm({ x: r.left + r.width / 2, y: r.top - 7 });
    s.current.guarded = true; clearTimeout(s.current.guard); s.current.guard = window.setTimeout(() => { s.current.guarded = false; }, 350);   // 칩을 띄운 그 누름의 떼는 손 무시
    clearTimeout(s.current.auto); s.current.auto = window.setTimeout(disarm, 4000);
  };
  const tap = () => {
    if (arm || s.current.guarded) return;
    if (s.current.moved) { s.current.moved = false; return; }
    if (n > 1) setPick((v) => !v); else onRestore(items[0]);
  };
  const label = arm ? "위 「닫기」를 누르면 종료 · 다른 곳을 누르면 취소" : `${n > 1 ? "접어 둔 창" : ED_LABEL[items[0]]} 펼치기 (길게 누르면 닫기)`;
  return (
    <>
      <button ref={btn} type="button" className={`tool-restore show${arm ? " arming" : " pulsing"}`} aria-label={label} title="누르면 펼치기 · 길게 누르면 닫기" aria-haspopup={n > 1 ? "menu" : undefined} aria-expanded={n > 1 ? pick : undefined}
        onPointerDown={(e) => { if (e.button) return; const c = s.current; c.moved = false; c.sx = e.clientX; c.sy = e.clientY; clearTimeout(c.lp); c.lp = window.setTimeout(doArm, 550); }}
        onPointerMove={(e) => { const c = s.current; if (Math.abs(e.clientX - c.sx) > 10 || Math.abs(e.clientY - c.sy) > 10) { c.moved = true; clearTimeout(c.lp); } }}
        onPointerUp={() => clearTimeout(s.current.lp)} onPointerCancel={() => clearTimeout(s.current.lp)} onPointerLeave={() => clearTimeout(s.current.lp)}
        onContextMenu={(e) => { e.preventDefault(); doArm(); }} onClick={tap}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 8 20 18 4 18Z" fill="currentColor" /></svg>
        {n > 1 ? <span className="tr-count">{n}</span> : null}
      </button>
      {pick ? (
        <div className="min-pick" role="menu" aria-label="펼칠 창 고르기">
          {items.map((t) => <button key={t} type="button" role="menuitem" className="min-pick-it" onClick={() => { setPick(false); onRestore(t); }}>{ED_LABEL[t]}</button>)}
        </div>
      ) : null}
      {arm ? createPortal(
        <>
          <div className="tr-shield" onClick={(e) => { e.stopPropagation(); if (!s.current.guarded) disarm(); }} />
          <button type="button" className={closing ? "tr-closebtn closing" : "tr-closebtn"} style={{ left: arm.x, top: arm.y }}
            onClick={(e) => { e.stopPropagation(); clearTimeout(s.current.auto); setClosing(true); window.setTimeout(() => { disarm(); onCloseAll(); }, 190); }}>닫기</button>
        </>, document.body) : null}
    </>
  );
}

// 이미지 편집 자리 — 접어도 안 사라지는 한 겹(형 11-15 「만들다가 최소화 … 뉴스 요약 보다가 다시 왓거든 그럼 역삼각형으로 잠시 들어갓엇는데」)
//   전 = 껍데기 창 안에서 그림 → 주소(#/edtool)를 벗어나면 통째로 사라짐(올린 사진 · 쓴 글 · 진행 중 생성 날아감)
//   지금 = 이 겹이 늘 같은 자리에서 그림 · 접힘(min) = 숨기기만(visibility · 크기는 그대로 = 엔진이 재는 폭 · 높이 안 바뀜 · ./video-editor.tsx 결) + ▽ 단추
//   움직임 = 접힘 · 펼침 한 번씩(transition) · 도는 것 0 · 옷 = ./ed-keep.css
import "./ed-keep.css";
import { Suspense, lazy } from "react";
import { useModal } from "./use-modal";

const ThumbMaker = lazy(() => import("./thumb-maker"));   // 원본 엔진 · CSS 가 커서 열 때만 받음

export function EdKeep({ open, covered, onClose, onMin, onRestore }: { open: boolean; covered?: boolean; onClose: () => void; onMin: () => void; onRestore: () => void }) {
  const ref = useModal<HTMLDivElement>(onClose, open);   // 열렸을 때만 Esc · Tab 가두기
  return (
    <>
      <div ref={ref} className={open ? "nm-modal see nm-edkeep" : "nm-modal see nm-edkeep min"} role="dialog" aria-modal={open} aria-label="에디터" aria-hidden={!open} inert={!open || covered || undefined}>
        <div className="nm-modal-b tm-host">
          <Suspense fallback={null}><ThumbMaker onBack={onClose} onMin={onMin} /></Suspense>
        </div>
      </div>
      {open ? null : (
        <button type="button" className="nm-edchip" aria-label="이미지 편집 다시 펼치기" title="이미지 편집 펼치기" onClick={onRestore}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5.5 8h13L12 17.5z" /></svg>
        </button>
      )}
    </>
  );
}

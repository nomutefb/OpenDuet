// 꺽쇠 하나(형 11-01 「그리고 이 앱 내의 화살표 같은건 모두 꺽쇠 느낌으로 통일할게 지금 혼재되어있어. 얇기는 좌상단 뒤로가기 느낌 기준으로 크기에 따라 얇기도 달라」 ·
//   「깃허브에 그런것만 모아놓은 곳 있으니 살펴봐」) — 원본 = Lucide chevron(형 morphicons 가 쓰는 아이콘 꼴 · DuetIcon chevronLeft·Right 와 같은 길)
//   굵기 = DuetIcon 규칙 그대로(좌상단 「<」 = 20px · 1.8 · 22px 넘으면 1.6) · 24칸 그림이라 크기를 줄이면 선도 같이 얇아짐
import type { CSSProperties } from "react";

// 방향이 바뀌면 그림을 갈아 끼우지 않고 돌린다(형 11-14 클라우드 세션 창 「<> 이런것도 최대한 부드럽게」 — 메뉴 영상에서 화살표가 뒤집히는 결) · 그림은 「아래」 하나 · 260ms
const TURN = { down: "0deg", up: "180deg", left: "90deg", right: "-90deg" } as const;

export function Chev({ dir, size = 16, className, style }: { dir: keyof typeof TURN; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden className={className} fill="none" height={size} width={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
      strokeWidth={size >= 22 ? 1.6 : 1.8} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "-0.125em", flex: "none", rotate: TURN[dir], transition: "rotate .26s cubic-bezier(.2,.8,.2,1)", ...style }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

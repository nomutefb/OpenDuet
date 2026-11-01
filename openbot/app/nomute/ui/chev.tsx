// 꺽쇠 하나(형 11-01 「그리고 이 앱 내의 화살표 같은건 모두 꺽쇠 느낌으로 통일할게 지금 혼재되어있어. 얇기는 좌상단 뒤로가기 느낌 기준으로 크기에 따라 얇기도 달라」 ·
//   「깃허브에 그런것만 모아놓은 곳 있으니 살펴봐」) — 원본 = Lucide chevron(형 morphicons 가 쓰는 아이콘 꼴 · DuetIcon chevronLeft·Right 와 같은 길)
//   굵기 = DuetIcon 규칙 그대로(좌상단 「<」 = 20px · 1.8 · 22px 넘으면 1.6) · 24칸 그림이라 크기를 줄이면 선도 같이 얇아짐
import type { CSSProperties } from "react";

const D = { left: "m15 18-6-6 6-6", right: "m9 18 6-6-6-6", up: "m18 15-6-6-6 6", down: "m6 9 6 6 6-6" } as const;

export function Chev({ dir, size = 16, className, style }: { dir: keyof typeof D; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden className={className} fill="none" height={size} width={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
      strokeWidth={size >= 22 ? 1.6 : 1.8} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "-0.125em", flex: "none", ...style }}>
      <path d={D[dir]} />
    </svg>
  );
}

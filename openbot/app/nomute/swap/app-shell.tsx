// 원본 components/shell/app-shell.tsx 자리 — 겉틀은 우리 껍데기(ui/shell.tsx)가 로그인 뒤 공통 자리에 한 번만 세움 → 여기 AppShell 은 겉틀 없이 지나감
//   (원본은 _app·settings 두 갈래가 따로 AppShell 을 세워, 대화 ↔ 설정을 오가면 겉틀이 새로 섰음 = 뒤 화면 날아감 · 형 10-28 11:22 「옮겨도 뒤 그대로」)
//   원본 도구(useTabSpace · useEdgeSwipeBack)는 원본 그대로 내보냄
import type { ReactNode } from "react";

export { useEdgeSwipeBack, useTabSpace } from "@/components/shell/app-shell";

export function AppShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// 판 틀 — 판 위 큰 제목 0(형 10-28 오늘 내내 「공간」 · 지금 어느 판인지는 네비가 보여 줌 · PM 13:04) · 폭·좌우 여백 = 원본 PageShell prose 그대로(max-w-3xl · px-4) · 제목은 화면 읽기용만
import type { ReactNode } from "react";

export function Pane({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pt-4 pb-12">
      <h1 className="sr-only">{title}</h1>
      {children}
    </div>
  );
}

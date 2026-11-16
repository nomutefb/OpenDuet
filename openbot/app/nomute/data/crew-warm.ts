// 애들 화면이 읽는 두 답(손 판 status/bots · 스케줄 표 schedule)의 읽는 꼴 한 벌 + 앱이 켜질 때 미리 받아 두기
//   형 11-17 07:0x 구름 맥 창 「첨에 이렇게 뜨는데 이 부분 해결해보자」 → 07:1x 「처음브터 제대로 나오게」
//   · 화면(./ui/bot-desk.tsx · ./ui/settings-extra.tsx useSched)과 미리 받기(warmCrew)가 같은 열쇠 · 같은 함수 → 미리 받은 답을 화면이 그대로 씀
//   · 지난 답(./last-cache.ts)이 있으면 그걸로 먼저 그리고 묵었으면 곧바로 다시 받음
//   · 스케줄 표는 서버가 답을 만드는 데 8 ~ 10초(11-17 실측)라 애들 화면을 연 뒤에 받기 시작하면 그동안 빈 칸 → 앱이 켜지고 한가해지면 먼저 받아 둠
import type { QueryClient } from "@tanstack/react-query";
import { office } from "./office";
import { lastPut, lastSeed } from "./last-cache";

export const botsSheetOpts = <T,>() => ({ queryKey: ["nomute", "bots-sheet"] as const, queryFn: () => office<T>("status/bots").then((j) => lastPut("bots-sheet", j)), ...lastSeed<T>("bots-sheet"), staleTime: 5_000 });
export const schedOpts = <T,>() => ({ queryKey: ["nomute", "schedule"] as const, queryFn: () => office<T>("schedule").then((j) => lastPut("schedule", j)), ...lastSeed<T>("schedule"), staleTime: 30_000 });

let warmed = false;
/** 앱이 켜진 뒤 한 번 — 첫 화면이 그려지고 한가할 때 두 답을 받아 둠(이미 싱싱한 답이 있으면 안 받음 · 실패해도 조용히 = 화면이 열릴 때 다시 받음). */
export function warmCrew(qc: QueryClient, wait = 1800): () => void {
  if (warmed || typeof window === "undefined") return () => {};
  warmed = true;
  const go = () => { void qc.prefetchQuery(botsSheetOpts<unknown>()); void qc.prefetchQuery(schedOpts<unknown>()); };
  const idle = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  const t = window.setTimeout(() => (idle ? idle(go, { timeout: 2000 }) : go()), wait);
  return () => window.clearTimeout(t);
}

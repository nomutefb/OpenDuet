// 알림을 눌러 앱이 열림 = 요약 대기열 · 기사 목록을 기억(15 · 45 · 60초) 말고 바로 한 번 다시 받음
//   (번개 11-20 03:54 「알림 눌러 앱이 열릴 땐 /api/pending · /articles.json 을 기억(45 · 60초) 말고 바로 한 번 다시 받게 해 줄 수 있어? 그러면 「알림 = 읽힘」이 딱 맞아」 · 형 03:44 「요약 완료되었다고 해서 갔는데 아직 요약중」)
//   까닭 = PC 는 앱 창이 떠 있는 채로 알림을 눌러 「숨김 → 보임」이 안 생김(./poll-visible.ts 다시 받기 0) · 서비스 워커(../sw.js notificationclick)가 그 창에 nm-push-open 을 보냄
//   새 창으로 열리면 처음부터 받으니 할 일 0 · invalidate = 떠 있는 조회는 바로 · 안 떠 있는 조회는 다음에 뜰 때 새로
import type { QueryClient } from "@tanstack/react-query";

export const PUSH_OPEN = "nm-push-open";
export const PUSH_OPEN_KEYS = [["nomute", "split-pending"], ["nomute", "feed-pending"], ["nomute", "news-list"]] as const;
export function pushOpened(qc: Pick<QueryClient, "invalidateQueries">) {
  for (const k of PUSH_OPEN_KEYS) void qc.invalidateQueries({ queryKey: [...k] });
}

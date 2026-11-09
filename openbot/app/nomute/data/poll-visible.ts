// 47) 숨은 탭 = 조회 멈춤 · 다시 보이면 한 번 새로(형 11-09 10:56 dm-bit 「대시보드 30초 조회」 · 빚 10:56 · 봄 10:59 · 깃)
//   깃허브 한도 범인 = 열린 사무실 앱 탭마다 서버 조회(빚 10:55 계기 1분 147 → 탭 닫으니 27)
//   ① react-query 주기 조회(refetchInterval) = 숨은 탭에선 안 돎(refetchIntervalInBackground false · 기본값을 여기서 못 박음 · 원본 @/query-client 손 0)
//   ② 30초 넘게 숨었다 보이면 주기 조회 걸린 활성 조회만 한 번 새로(짧게 왔다 갔다 = 그대로 · 주기 없는 조회 = 그대로)
//   VM 브레이브의 앞 탭은 「보임」으로 셈(깃 10:5x CDP 실물 · 앞 탭 visible · 뒤 탭 hidden) → 그건 탭 닫기(뜸 시작 페이지)로
import type { QueryClient } from "@tanstack/react-query";

export const BACK_MS = 30_000;

type Q = { observers?: { options?: { refetchInterval?: unknown } }[] };
/** 주기 조회가 걸린 조회인가(관찰자 중 하나라도 refetchInterval) */
export const polls = (q: Q) => (q.observers || []).some((o) => !!o?.options?.refetchInterval);

type Doc = Pick<Document, "hidden" | "addEventListener" | "removeEventListener">;
export function pollVisible(qc: QueryClient, doc: Doc = document, now = () => Date.now()): () => void {
  const d = qc.getDefaultOptions();
  qc.setDefaultOptions({ ...d, queries: { ...(d.queries || {}), refetchIntervalInBackground: false } });
  let hiddenAt = doc.hidden ? now() : 0;
  const on = () => {
    if (doc.hidden) { hiddenAt = now(); return; }
    const away = hiddenAt ? now() - hiddenAt : 0;
    hiddenAt = 0;
    if (away >= BACK_MS) void qc.refetchQueries({ type: "active", predicate: (q) => polls(q as unknown as Q) });
  };
  doc.addEventListener("visibilitychange", on);
  return () => doc.removeEventListener("visibilitychange", on);
}

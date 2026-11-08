// 요약 대기열 판 상태 가르기(봄 11-09 06:20 2) · 모루 #3000 · 깃) — 요약은 끝났는데(status succ) 피드에 아직 없는 기사는 「완료」가 아님
//   원본 qEff 그대로: 피드에 있으면 succ(판에서 빠짐) · 피드에 없으면 반영 중 · 20분 넘으면 반영 대기(lag) · ./feed.tsx pickQ · TaskCard · TaskPanel 이 같이 씀
export const Q_LAG_MIN = 20;

/** 판에 남길 상태 — status · 피드에 올라왔나 · 접수 때(ms) */
export function qEff(status: string | undefined, inFeed: boolean, t: number | undefined, now = Date.now()): string {
  if (status !== "succ" || inFeed) return status || "";
  return t && now - t >= Q_LAG_MIN * 60e3 ? "lag" : "processing";
}

/** 카드 한 장 = 고리 · 머리 글(요약 끝난 건 「반영 중/대기」 · 「완료」 안 씀) */
export function taskOf(status: string | undefined, e: string) {
  const fail = e === "fail", fed = status === "succ", wait = !fail && !fed && (e === "queued" || e === "pending"), run = !fail && !fed && !wait;   // 기다림 = 아직 안 돎(모루 #3009 ②)
  const ring = fail ? "fail" : fed ? (e === "lag" ? "lag" : "run") : wait ? "wait" : "run";
  const label = fail ? "요약 실패" : fed ? (e === "lag" ? "분석 완료 · 반영 대기" : "피드 반영 중") : wait ? "기다림" : e === "retry" ? "재시도 중" : "요약 중";
  return { fail, fed, wait, run, ring, label };
}

/** 판 머리 꼬리 = 요약 끝 a/b 건 · 다 요약 끝났으면 「분석 완료 · 반영 대기」(하나라도 lag) 또는 「피드 반영 중」 */
export function panelOf(rows: { status?: string; e: string }[]) {
  const total = rows.length, done = rows.filter((r) => r.status === "succ").length, allFed = total > 0 && done === total;
  const tail = allFed ? (rows.some((r) => r.e === "lag") ? "분석 완료 · 반영 대기" : "피드 반영 중") : `${done}/${total} 건`;
  return { total, done, allFed, tail };
}

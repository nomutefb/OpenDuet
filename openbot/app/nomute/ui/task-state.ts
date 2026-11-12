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

// 단계마다 걸린 시간(형 11-13 02:26 봄 1:1 「각 단계에서 몇분인지 알면 좋을듯. 혹시 이거 라인 이어가는건 유지하되 가로로 표시가능해? 결은 살리되 > > 방향으로 시간은 뜨고」)
//   서버는 단계 시각을 안 남김(번개 11-12) → 이 기기가 그 단계를 처음 본 때를 적어 둠(localStorage nm-tk-st:<id> · 요청마다 한 장 · 하루 지나면 지움) · 접수 = 서버 t
//   앞 단계를 이 기기가 못 봤으면(이미 다음 단계로 처음 봄) 그 앞 단계 시간은 안 띄움(지어낸 분 0)
type StageT = { wait?: number; run?: number; fed?: number };
const ST_KEY = (id: string) => `nm-tk-st:${id}`;
export function stageTimes(id: string, now: number, cur: "wait" | "run" | "fed" | "fail"): StageT {
  let o: StageT = {};
  try { o = JSON.parse(localStorage.getItem(ST_KEY(id)) || "{}") || {}; } catch { o = {}; }
  if ((cur === "wait" || cur === "run" || cur === "fed") && !o[cur]) { o = { ...o, [cur]: now }; try { localStorage.setItem(ST_KEY(id), JSON.stringify(o)); } catch { /* 이번만 */ } }
  return o;
}
/** 순수 — 접수 t · 본 때들 · 지금 단계 → 단계마다 걸린 ms(모르면 null) · 차례 = 접수 → 요약 시작 · 요약 = 요약 시작 → 피드 · 피드 = 피드 → 지금 */
export function stageDur(t: number | undefined, st: StageT, cur: "wait" | "run" | "fed" | "fail", now: number): { wait: number | null; run: number | null; fed: number | null } {
  const runAt = st.run && (st.wait || (t && st.run - t < 15e3)) ? st.run : null;   // 요약 시작 = 차례 기다림을 이 기기가 봤거나 접수 바로 뒤에 봤을 때만 믿음
  const fedAt = st.fed && st.run ? st.fed : null;
  return {
    wait: t && runAt ? runAt - t : cur === "wait" && t ? now - t : null,
    run: runAt && fedAt ? fedAt - runAt : cur === "run" && runAt ? now - runAt : null,
    fed: fedAt ? now - fedAt : null,
  };
}
try { const day = Date.now() - 864e5; for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i) || ""; if (!k.startsWith("nm-tk-st:")) continue; const o = JSON.parse(localStorage.getItem(k) || "{}"); if (Math.max(o.wait || 0, o.run || 0, o.fed || 0) < day) localStorage.removeItem(k); } } catch { /* 못 지움 = 다음에 */ }

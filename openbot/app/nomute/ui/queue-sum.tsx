// 슈왕 방 「대기열」 판 = 요약 대기열(./queue-pill.tsx 가 누를 때만 받음 · 요약실 · 뉴스 요약과 같은 자료 · 같은 손 · 시아 11-20 12:44)
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { byFile, feedLiveQuery, type FArt, pendQuery, pickQ } from "./feed";
import { newsListQuery, useGo } from "./news-data";
import { qRetry, qfSeenOne } from "./q-acts";
import { type QItem, TaskPanel } from "./task-panel";

export default function SumQueue() {
  const go = useGo();
  const list = useQuery(newsListQuery), live = useQuery(feedLiveQuery), pend = useQuery(pendQuery);
  const byId = useMemo(() => {
    const st = (list.data?.arts || []) as FArt[], have = new Set(st.map((a) => a.file)), add = (live.data || []).filter((x) => !have.has(x.file));
    return new Map((add.length ? [...add, ...st].sort(byFile) : st).map((a) => [a.file, a]));
  }, [list.data, live.data]);
  const [seenN, setSeenN] = useState(0);
  const qs = useMemo(() => (pend.data ? pickQ(pend.data.items, byId, pend.data.qf) : []), [pend.data, byId, seenN]);   // eslint-disable-line react-hooks/exhaustive-deps
  const redo = (it: QItem) => qRetry(it, go).then((why) => { if (!why) { setSeenN((n) => n + 1); void pend.refetch(); } return why; });
  const drop = (it: QItem) => { qfSeenOne(it.id); setSeenN((n) => n + 1); };
  if (pend.isError) return <p className="nm-pmrun-empty">못 읽음</p>;
  if (!pend.data) return <p className="nm-pmrun-empty">읽는 중…</p>;
  return qs.length ? <TaskPanel qs={qs} eta={pend.data.eta || null} onRetry={redo} onDismiss={drop} /> : <p className="nm-pmrun-empty">비어 있음</p>;
}


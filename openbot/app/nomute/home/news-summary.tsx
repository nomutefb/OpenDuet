// PC 반갈 우하단 = 뉴스 요약(형 11-05 16:27 「어짜피 우하단에는 뉴스 요약 부분이 나올거라서」 · 13:38 「전송하면 그 아래에 요약 대기열 올라오고, 다되면, 모달로 뉴스 요약본 떠서. 그거 누르면 에디팅까지 가능한거.」)
//   위 = 요약 대기열(/api/pending · 진행 중 · 다시 시도 · 실패) · 아래 = 다 된 요약(/articles.json 새것부터 · 제목 다듬기 같은 로직)
//   다 된 요약 누름 = 앱 안 기사 한 장(#/news?a=<file> · 모달 · 고치기 = 거기서 에디터) · 판 없이 투명(형 14:42 「카드칸도 투명」) · 라임 = 새 요약 점만
import "./news-summary.css";
import { useQuery } from "@tanstack/react-query";
import { getJson, newsListQuery, useGo, whenOf } from "../ui/news-data";
import { cleanTitle } from "./title-clean";

type QItem = { id?: string; t?: number; title?: string; status?: string; tries?: number };
const ST: Record<string, string> = { processing: "요약 중", retry: "다시 시도", queued: "기다림", pending: "기다림", failed: "실패", error: "실패" };
const N_DONE = 12, FRESH_MS = 30 * 60_000;

export function NewsSummary() {
  const go = useGo();
  const pend = useQuery({
    queryKey: ["nomute", "split-pending"], staleTime: 15_000,
    refetchInterval: (q) => ((q.state.data || []).some((it) => it.status === "processing" || it.status === "retry") ? 15_000 : 45_000),
    queryFn: () => getJson<{ items?: QItem[] }>(`/api/pending?_=${Date.now()}`).then((d) => (d.items || []).filter((it) => it && it.status && it.status !== "done" && it.status !== "deleted").slice(0, 4), () => [] as QItem[]),
  });
  const list = useQuery(newsListQuery);
  const done = (list.data || []).slice(0, N_DONE);
  const q = pend.data || [];
  return (
    <section className="nm-nsum" aria-label="뉴스 요약">
      <div className="nm-nsum-h"><b>뉴스 요약</b><span>{q.length ? `대기열 ${q.length}` : ""}</span></div>
      {q.length ? (
        <ul className="nm-nsum-q">
          {q.map((it, i) => (
            <li key={it.id || i} className={it.status === "processing" ? "run" : it.status === "failed" || it.status === "error" ? "bad" : ""}>
              <i aria-hidden /><span className="tt">{cleanTitle(it.title) || "제목 없음"}</span><span className="st">{ST[it.status || ""] || it.status}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <ol className="nm-nsum-ol">
        {done.map((a) => {
          const fresh = (() => { const m = /^(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})/.exec(a.file || ""); if (!m) return false; const t = new Date(2000 + +m[1], +m[2] - 1, +m[3], +m[4], +m[5]).getTime(); return Date.now() - t < FRESH_MS; })();
          return (
            <li key={a.file}>
              <button type="button" className="tt" title={a.title} onClick={() => go(`/news?a=${encodeURIComponent(a.file)}`)}>{fresh ? <i className="new" aria-label="새 요약" /> : null}{cleanTitle(a.title) || a.file}</button>
              <span className="mt">{whenOf(a)}</span>
            </li>
          );
        })}
        {!done.length ? <li className="empty">{list.isError ? "요약 목록을 못 받았어." : "받는 중…"}</li> : null}
      </ol>
    </section>
  );
}

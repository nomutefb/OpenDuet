// PC 반갈 우하단 = 뉴스 요약(형 11-05 16:27 「어짜피 우하단에는 뉴스 요약 부분이 나올거라서」 · 13:38 「전송하면 그 아래에 요약 대기열 올라오고, 다되면, 모달로 뉴스 요약본 떠서. 그거 누르면 에디팅까지 가능한거.」)
//   위 = 요약 대기열(/api/pending · 진행 중 · 다시 시도 · 실패) · 아래 = 다 된 요약(/articles.json 새것부터 · 제목 다듬기 같은 로직)
//   다 된 요약 누름 = 앱 안 기사 한 장(#/news?a=<file> · 모달 · 고치기 = 거기서 에디터) · 판 없이 투명(형 14:42 「카드칸도 투명」) · 라임 = 새 요약 점만
import "./news-summary.css";
import { useQuery } from "@tanstack/react-query";
import { getJson, newsListQuery } from "../ui/news-data";
import { SumCard } from "../ui/summary-desk";   // 에디터 「뉴스 요약」 카드 꼴(형 11-08 09:13 「digest 아까부터 말하는데 뉴스 요약처럼 바꾼고했어.」 · 「뉴스 요약 넣으면 어떻게 뜨는지까지 확인해서 반영하셈」)
import { cleanTitle } from "./title-clean";
import { SyncAgo } from "../ui/status-line";   // Digest 머리줄 오른쪽 「동기화 N분 전」(형 11-08 09:00)
import { TaskPanel } from "../ui/task-panel";

type QItem = { id?: string; t?: number; title?: string; key?: string; alt1?: string; status?: string; tries?: number };
const LIVE = new Set(["processing", "retry", "queued", "pending", "failed", "error"]);   // 대기열에 보일 것 = 아직 안 끝난 것 · 실패(「succ」·done 같은 끝난 것 = 뺌 · 실물 17:3x)
const N_DONE = 12;

export function NewsSummary() {
  const pend = useQuery({
    queryKey: ["nomute", "split-pending"], staleTime: 15_000,
    refetchInterval: (q) => ((q.state.data || []).some((it) => it.status === "processing" || it.status === "retry") ? 15_000 : 45_000),
    queryFn: () => getJson<{ items?: QItem[] }>(`/api/pending?_=${Date.now()}`).then((d) => (d.items || []).filter((it) => it && LIVE.has(String(it.status))).slice(0, 4), () => [] as QItem[]),
  });
  const list = useQuery(newsListQuery);
  const done = (Array.isArray(list.data?.arts) ? list.data!.arts : []).slice(0, N_DONE);   // newsListQuery = { arts, count, generated }(배열 아님 · 17:2x 판에서 앱 통째로 깨짐)
  const q = pend.data || [];
  return (
    <section className="nm-nsum" aria-label="뉴스 요약">
      <div className="nm-nsum-h"><b>Digest</b><span>{q.length ? `대기열 ${q.length} · ` : ""}<SyncAgo /></span></div>
      <ol className="nm-nsum-ol">
        {q.length ? <li className="c nm-nsum-tasks"><TaskPanel qs={q.map((it) => ({ it, e: it.status === "failed" || it.status === "error" ? "fail" : it.status || "", title: cleanTitle(it.title || it.alt1 || it.key) || "제목 없음" }))} eta={null} /></li> : null}   {/* 요약 대기열 = 「뉴스 요약」과 같은 판(시아 06:44 ① · 깃) */}
        {done.map((a) => <li key={a.file} className="c"><SumCard a={a} /></li>)}
        {!done.length ? (list.isError ? <li className="empty nm-emptybox"><b>요약 목록을 못 받았어</b><span>조금 뒤 다시 받아</span></li>
          : list.isLoading ? <li className="empty"><i className="nm-skel" style={{ width: "88%" }} /><i className="nm-skel" style={{ width: "72%" }} /><i className="nm-skel" style={{ width: "80%" }} /></li>
          : <li className="empty nm-emptybox"><b>다 된 요약이 아직 없어</b><span>뉴스 줄 「전송」을 누르면 여기 쌓여</span></li>) : null}   {/* 빈 칸 · 불러오는 중 꼴 통일(시아 UI ⑤) */}
      </ol>
    </section>
  );
}

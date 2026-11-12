// PC 반갈 우하단 = 뉴스 요약(형 11-05 16:27 「어짜피 우하단에는 뉴스 요약 부분이 나올거라서」 · 13:38 「전송하면 그 아래에 요약 대기열 올라오고, 다되면, 모달로 뉴스 요약본 떠서. 그거 누르면 에디팅까지 가능한거.」)
//   위 = 요약 대기열(/api/pending · 진행 중 · 다시 시도 · 실패) · 아래 = 다 된 요약(/articles.json 새것부터 · 제목 다듬기 같은 로직)
//   다 된 요약 누름 = 앱 안 기사 한 장(#/news?a=<file> · 모달 · 고치기 = 거기서 에디터) · 판 없이 투명(형 14:42 「카드칸도 투명」) · 라임 = 새 요약 점만
import "./news-summary.css";
import { useQuery } from "@tanstack/react-query";
import { getJson, newsListQuery } from "../ui/news-data";
import { SumCard } from "../ui/summary-desk";   // 에디터 「뉴스 요약」 카드 꼴(형 11-08 09:13 「digest 아까부터 말하는데 뉴스 요약처럼 바꾼고했어.」) · dg = 제목 1줄 · 매체 가로(형 11-09 09:21)
import { useGo } from "../ui/news-data";
import { cleanTitle } from "./title-clean";
import { SyncAgo } from "../ui/status-line";   // Digest 머리줄 오른쪽 「동기화 N분 전」(형 11-08 09:00)
import { TaskPanel } from "../ui/task-panel";
import { qfSeenOne, qfSeenSet } from "../ui/q-acts";
import { useState } from "react";
import { type FArt, kindOf } from "../ui/feed";
import { PlusFan } from "../ui/plus-fan";   // 오른쪽 아래 「+」 펼침 = 폰 뉴스 에디터 「+」 한 벌(형 11-13 02:24 봄 1:1 「1) 에디터 요약 + 있잖아 모바일에 잇는거. 그거 인앱 메인 digest 우하단에 + 나오게 해줘」)   // 긴급 · 이슈 테 = 뉴스 에디터와 같은 셈

type QItem = { id?: string; t?: number; title?: string; key?: string; alt1?: string; status?: string; tries?: number };
const LIVE = new Set(["processing", "retry", "queued", "pending", "failed", "error"]);   // 대기열에 보일 것 = 아직 안 끝난 것 · 실패(「succ」·done 같은 끝난 것 = 뺌 · 실물 17:3x)
const N_DONE = 12;

export function NewsSummary() {
  const go = useGo();   // 머리 「Digest」 누름 = 네비 4번 뉴스 에디터(시아 08:54 안 「머리 「Digest」 누르면 4번으로」)
  const pend = useQuery({
    queryKey: ["nomute", "split-pending"], staleTime: 15_000,
    refetchInterval: (q) => ((q.state.data || []).some((it) => it.status === "processing" || it.status === "retry") ? 15_000 : 45_000),
    queryFn: () => getJson<{ items?: QItem[] }>(`/api/pending?_=${Date.now()}`).then((d) => (d.items || []).filter((it) => it && LIVE.has(String(it.status))).slice(0, 4), () => [] as QItem[]),
  });
  const list = useQuery(newsListQuery);
  // 최근 요약 다(형 11-09 12:3x 「digest에 최근거가 안올라와, 최근거 다 올라오게하고」) = 다 된 요약 새것부터(요약 만든 차례 · 파일 이름) 12장 · 시간 거름 0(앞 판 24시간 거름 = 12:3x 두 장만 남음 · 마지막 요약 요청 11-09 08:11)
  const done = (Array.isArray(list.data?.arts) ? list.data!.arts : []).slice(0, N_DONE);   // newsListQuery = { arts, count, generated }(배열 아님 · 17:2x 판에서 앱 통째로 깨짐)
  const [, setSeenN] = useState(0), seen = qfSeenSet();   // 실패 줄 「취소」 = 이 기기 확인 목록(뉴스 에디터와 같은 칸)
  const q = (pend.data || []).filter((it) => !seen.has(String(it.id || "")));
  return (
    <section className="nm-nsum" aria-label="뉴스 요약">
      <div className="nm-nsum-h"><button type="button" className="nm-nsum-go" title="뉴스 에디터로" onClick={() => go("/newsed")}><b>Digest</b></button><span>{q.length ? `대기열 ${q.length} · ` : ""}<SyncAgo /></span></div>
      <ol className="nm-nsum-ol">
        {q.length ? <li className="c nm-nsum-tasks"><TaskPanel qs={q.map((it) => ({ it, e: it.status === "failed" || it.status === "error" ? "fail" : it.status || "", title: cleanTitle(it.title || it.alt1 || it.key) || "제목 없음" }))} eta={null} onDismiss={(it) => { qfSeenOne(it.id); setSeenN((n) => n + 1); }} /></li> : null}   {/* 요약 대기열 = 「뉴스 요약」과 같은 판(시아 06:44 ① · 깃) */}
        {done.map((a) => <li key={a.file} className="c"><SumCard a={a} lean kind={kindOf(a as FArt) || (a.issue ? "iss" : "")} />   {/* 폰 뉴스 에디터 카드 한 벌 그대로(형 11-11 22:09 「1) digest > 아까 수정한 모바일에 통일」 · 앞 판 = dg) */}</li>)}
        {!done.length ? (list.isError ? <li className="empty nm-emptybox"><b>요약 목록을 못 받았어</b><span>조금 뒤 다시 받아</span></li>
          : list.isLoading ? <li className="empty"><i className="nm-skel" style={{ width: "88%" }} /><i className="nm-skel" style={{ width: "72%" }} /><i className="nm-skel" style={{ width: "80%" }} /></li>
          : <li className="empty nm-emptybox"><b>다 된 요약이 아직 없어</b><span>뉴스 줄 「전송」을 누르면 여기 쌓여</span></li>) : null}   {/* 빈 칸 · 불러오는 중 꼴 통일(시아 UI ⑤) */}
      </ol>
      <PlusFan go={go} />
    </section>
  );
}

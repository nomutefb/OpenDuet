// 이슈 한 장(앱 안 「< 이슈 N」 · 형 10-28 15:32 「모두 누르면 앱 내에서 작동되게해줘. 그니까 가져오는거야 거기있는거를」 · PM 16:09) —
//   GitHub 은 품기를 막고 저장소가 비공개라 → 서버가 대신 읽은 그대로(GET /api/office/issue/<번호> · editor functions/api/office/_issue.js) ·
//   겉 = YETA 카드(./yeta-settings.css · 설정·에디터 판과 같은 꼴) · 본문·댓글 = 대화창과 같은 마크다운(streamdown) · 안 링크 = 앱 안(껍데기 공용 받기 ./inapp.ts)
import "./yeta-settings.css";
import { useQuery } from "@tanstack/react-query";
import { Streamdown } from "streamdown";
import { markdownComponents } from "@/lib/markdown";
import { office } from "../data/office";
import { t12 } from "./when";

type Issue = { no: number; title: string; state: string; state_reason: string | null; pr: boolean; by: string; at: string; updated: string; labels: string[]; body: string; comments: { by: string; at: string; body: string }[]; comments_error?: string };

const when = (iso: string) => { const t = Date.parse(iso); return Number.isFinite(t) ? `${new Date(t + 9 * 3600e3).toISOString().slice(5, 10)} ${t12(t)}` : ""; };
const stateName = (x: Issue) => (x.state === "open" ? "열림" : x.state_reason === "not_planned" ? "닫힘 · 안 함" : x.pr ? "닫힘" : "닫힘 · 끝");

export function IssueView({ no }: { no: string }) {
  const q = useQuery({ queryKey: ["nomute", "issue", no], queryFn: () => office<{ issue: Issue }>(`issue/${encodeURIComponent(no)}`).then((j) => j.issue), staleTime: 30_000 });
  if (q.isPending) return <p className="m-auto p-6 text-sm" style={{ color: "var(--mut)" }}>이슈 #{no} 읽는 중…</p>;
  if (q.isError) return <p className="m-auto p-6 text-sm" role="alert" style={{ color: "var(--mut)" }}>이슈 #{no} 를 못 읽었어 — {q.error.message}</p>;
  const x = q.data;
  return (
    <div className="yeta-set nm-issue mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 pt-4 pb-12">
      <div className="ycd-card card-left">
        <span className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--mut)" }}>
          <b className={`nm-issue-st ${x.state === "open" ? "on" : ""}`}>{stateName(x)}</b>
          <span className="tabular-nums">#{x.no}{x.pr ? " · 반영 요청" : ""}</span>
          {x.labels.map((l) => <span key={l} className="nm-issue-tag">{l}</span>)}
        </span>
        <h1 className="ycd-nm text-[17px] leading-snug">{x.title}</h1>
        <span className="text-xs" style={{ color: "var(--mut)" }}>{x.by} · {when(x.at)}{x.updated && x.updated !== x.at ? ` · 고침 ${when(x.updated)}` : ""}</span>
        {x.body.trim() ? <div className="nm-issue-md"><Streamdown components={markdownComponents}>{x.body}</Streamdown></div> : <p className="text-sm" style={{ color: "var(--mut)" }}>본문 없음</p>}
      </div>
      <h2 className="yset-sec">댓글 {x.comments.length}{x.comments_error ? ` · 못 읽음(${x.comments_error})` : ""}</h2>
      {x.comments.map((c, i) => (
        <div key={`${c.at}-${i}`} className="ycd-card card-left">
          <span className="text-xs" style={{ color: "var(--mut)" }}>{c.by} · {when(c.at)}</span>
          <div className="nm-issue-md"><Streamdown components={markdownComponents}>{c.body}</Streamdown></div>
        </div>
      ))}
    </div>
  );
}

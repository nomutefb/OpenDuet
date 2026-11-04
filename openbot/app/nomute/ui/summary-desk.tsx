// 요약실 = 대화방 말고 요약 목록(형 11-04 09:28 봄 1:1 「그 요약실 같은 경우는, 회의실 스타일일 필요는 없구, 그냥 딱, 기사 건건별로 누구 담당자가 있는게 아니라 요약만 볼 수 있으면 되거든? 오히려 그 지금 기사 요약으로 바로 이동하는 버튼이 저기로 들어가면 될 수도이썽.」)
//   맨 위 = 「기사 요약 전체 보기」(서랍 「뉴스 기사」와 같은 곳 = 앱 안 #/news) · 아래 = 요약 한 건 = 카드 한 장(새것 위) — 제목 · 요약 · 시각 · 썸네일 초안(있으면) · 말풍선·얼굴·이름 0
//   글 = 서버 방 summary(뜸 · 촉 둘·틈 하나·형이 요청한 요약 = send room=summary) · 첫 줄 = 제목(「[요약 완료]」 머리·굵게 표시 뺌) · 나머지 = 요약(마크다운)
//   카드 누름 = 그 기사(글에 article.file · 에디터/앱 기사 주소가 있으면 앱 안 기사 한 장 · 없으면 첫 주소)
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useMemo } from "react";
import { Streamdown } from "streamdown";
import { markdownComponents } from "@/lib/markdown";
import { type OfficeMsg, office } from "../data/office";
import { roomReadState } from "../data/read-state";
import { useRoomRead } from "../data/use-room-read";
import { Chev } from "./chev";
import { Folded } from "./fold";
import { inAppHref } from "./inapp";
import { useGo } from "./news-data";
import { ThumbCard, thumbOf, type ThumbRef } from "./thumb-card";
import "./summary-desk.css";

export const SUMMARY_ROOM = "summary";
type Msg = OfficeMsg & { card?: ThumbRef; article?: { file?: string; title?: string; url?: string } };

const HEAD = /^\s*[-*]?\s*\[(?:요약 완료|요약|정리)\]\s*/;
const URL_RE = /https?:\/\/[^\s<>"'「」()]+/g;
/** 글 → 제목 · 요약 · 기사 자리 */
function partsOf(m: Msg) {
  const raw = String(m.text || "").replace(/\r/g, "");
  const lines = raw.split("\n");
  const at = lines.findIndex((l) => l.trim());
  const title = (m.article?.title || (at >= 0 ? lines[at] : "")).replace(HEAD, "").replace(/\*\*/g, "").replace(/^#+\s*/, "").trim();
  const body = (m.article?.title ? raw.replace(HEAD, "") : lines.slice(at + 1).join("\n"))
    .split("\n").filter((l) => !/^\s*[-*]?\s*(\*\*)?\s*(링크|출처|원문)\s*(\*\*)?\s*[:：]/.test(l)).join("\n")   // 링크 줄 = 카드 누름이 그 일(긴 주소가 카드를 넘어 폭을 밀었음)
    .replace(URL_RE, "").replace(/\n{3,}/g, "\n\n").trim();
  const file = m.article?.file || (/[?&#]a=([^&\s)」]+)/.exec(raw) || [])[1] || "";
  const url = m.article?.url || (raw.match(URL_RE) || [])[0] || "";
  return { title, body, file: file ? decodeURIComponent(file) : "", url };
}
const quietRead = (m: string) => { if (m) console.warn("읽음 저장:", m); };   // 읽음 저장 실패 = 화면 0 · 기록만(대화창과 같음 · 형 11-03 12:11)
const when = (ts: number) => { const d = new Date(ts); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

function Card({ m }: { m: Msg }) {
  const go = useGo();
  const { title, body, file, url } = partsOf(m);
  const open = () => { if (file) go(`/news?a=${encodeURIComponent(file)}`); else if (url) { const h = inAppHref(url); if (h) go(h); else window.open(url, "_blank", "noopener"); } };
  const card = thumbOf(m as Msg & { who: string });
  return (
    <article className="nm-sum">
      {card ? <ThumbCard card={card} /> : null}
      <button type="button" className="nm-sum-h" onClick={open} disabled={!file && !url} aria-label={`${title || "요약"} — 기사 보기`}>
        <b>{title || "요약"}</b>{file || url ? <Chev dir="right" /> : null}
      </button>
      {body ? <Folded md text={body} who="요약실" when={when(m.ts)}><div className="nm-sum-b ymd"><Streamdown components={markdownComponents}>{body}</Streamdown></div></Folded> : null}
      <time className="nm-sum-t" dateTime={new Date(m.ts).toISOString()}>{when(m.ts)}</time>
    </article>
  );
}

export function SummaryDesk({ lead, active = true }: { lead?: ReactNode; active?: boolean }) {
  const go = useGo();
  const msgs = useQuery({ queryKey: ["nomute", "summary-desk"], queryFn: () => office<{ messages: Msg[] }>(`rooms/${SUMMARY_ROOM}/messages?n=100`).then((j) => j.messages || []), staleTime: 15_000, refetchInterval: 30_000 });
  const list = useMemo(() => (msgs.data || []).filter((m) => m.kind !== "system" && (!!String(m.text || "").trim() || !!m.card)).sort((a, b) => b.ts - a.ts), [msgs.data]);
  const last = (msgs.data || []).at(-1)?.ts;
  useRoomRead(roomReadState, SUMMARY_ROOM, active, !!msgs.data, msgs.isError, last || 0, quietRead);
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="ychat mx-auto flex w-full max-w-2xl flex-col gap-3 px-3 pb-8 pt-[48px]">   {/* 위 여백 = 떠 있는 머리(ui/shell.css .nm-head) */}
        {lead}
        <button type="button" className="nm-sum-all" onClick={() => go("/news")}><span>기사 요약 전체 보기</span><Chev dir="right" /></button>
        {msgs.isError ? <p className="text-sm text-destructive" role="alert">요약을 못 받았어 — {msgs.error.message}</p> : null}
        {msgs.data && !list.length ? <p className="nm-sum-empty">아직 온 요약이 없어. 홈 카드 「요약 요청」이나 촉·틈 요약이 여기로 와.</p> : null}
        {list.map((m) => <Card key={m.id} m={m} />)}
      </div>
    </div>
  );
}

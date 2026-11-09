// 요약실 = 에디터 「뉴스 요약」 카드 목록 그대로(형 11-04 10:29 「그 이 부분이 그 웹페이지랑 동일하게 보이면 될거같아 아예. 이 부분은 폰트 안따라가도 돼. edit.nomute.kr 뉴스요약이랑 동일하게 들어가면될듯. 시그니처색만 따라와서.」)
//   앞 판(09:28 「요약만 볼 수 있으면」) = 방 글을 카드로 → 이 판 = 같은 기사 자료(/articles.json · 서랍 「뉴스 기사」와 같은 것)를 에디터 카드 꼴로 · 말풍선·얼굴·담당자·입력칸 0
//   카드 = 에디터 viewer 뉴스 요약 .card 꼴: 위 줄 [분류] 보도 N시간 전 … 스크랩 N시간 전 · 제목 · 매체 / 편향 · 진행 막대 셋(요약·프롬프트·카드) — 막대 색만 라임(시그니처 · 에디터는 하늘색)
//   누름 = 앱 안 기사 한 장(#/news?a=<file> · ./news-detail.tsx) · 20장씩(더 보기)
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { roomReadState } from "../data/read-state";
import { useRoomRead } from "../data/use-room-read";
import { type Art, biasOf, catOf, mediaOf, newsListQuery, progOf, sensOf, useGo } from "./news-data";
import "./summary-desk.css";

export const SUMMARY_ROOM = "summary";
const PAGE = 20;

/** 「N분 전 · N시간 전 · N일 전」(에디터 카드 꼴) */
export const ago = (t: number) => {
  if (!Number.isFinite(t) || t <= 0) return "";
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 60 * 24 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`;
};
/** 보도 = 기사 날짜·시각(KST) · 스크랩 = 파일 이름 앞 yymmdd-hhmm(KST) */
const kst = (y: number, mo: number, d: number, h = 0, mi = 0) => Date.UTC(y, mo - 1, d, h - 9, mi);
export const reportTs = (a: Art) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(a.date || "")), t = /^(\d{1,2}):(\d{2})$/.exec(String(a.time || "")); return m ? kst(+m[1], +m[2], +m[3], t ? +t[1] : 0, t ? +t[2] : 0) : NaN; };
export const scrapTs = (a: Art) => { const m = /^(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})/.exec(a.file || ""); return m ? kst(2000 + +m[1], +m[2], +m[3], +m[4], +m[5]) : NaN; };
const quietRead = (m: string) => { if (m) console.warn("읽음 저장:", m); };   // 읽음 저장 실패 = 화면 0 · 기록만(대화창과 같음 · 형 11-03 12:11)

/** 카드 한 장 — PC Digest 칸(home/news-summary.tsx)도 같은 카드를 판 없이 씀(형 11-08 09:14 「비율 그대로 유지하면서 가져와서 ui 스타일만 색상 팔레트 적용해서 녹여. 단 여기에 또 블록을 만들지마」) */
/**   뉴스 에디터(4번 · ./news-editor.tsx) = on(고른 카드 · 라임 테) · kind(긴급·이슈 = 금빛 테 + 표) · onOpen(PC = 오른쪽 칸에 열기) · sens(민감 칸 · 옛 에디터 카드 셋째 칸) · short(폰 = 매체·편향 줄 뺌) */
/**   dg = 홈 Digest(형 11-09 09:21 「메인 화면에서 digest로 나온것도, 타이틀은 1줄로, / 매체 연합뉴스 이것도 가로로 해서 더 얇게 / 보도 3시간전 > 3시간 전 / 이것만 나오면 됨.」 · 12:3x 「여기 에디터 홈페이지 형태로 올라오게 하기로했는데, 한줄로 하라니까 아예 원상복귀가 되어버렸네」)
 *   = 이 카드 꼴 그대로 · 제목 1줄 · 매체·편향 한 줄 가로(얇게) · 「보도」 말 뺌 */
export function SumCard({ a, on, kind, onOpen, sens: withSens, short, dg }: { a: Art; on?: boolean; kind?: string; onOpen?: () => void; sens?: boolean; short?: boolean; dg?: boolean }) {
  const go = useGo();
  const cat = catOf(a), bias = biasOf(a), pr = progOf(a), media = mediaOf(a.media), sens = withSens ? sensOf(a).slice(0, 2) : [];
  const rep = ago(reportTs(a)), scr = ago(scrapTs(a)), open = onOpen || (() => go(`/news?a=${encodeURIComponent(a.file)}`));
  return (
    <div className={`nm-sumc${on ? " on" : ""}${kind ? " k-" + kind : ""}${dg ? " dg" : ""}`} role="article" tabIndex={0} aria-label={a.title || "기사"} aria-current={on || undefined} onClick={open} onKeyDown={(e) => { if (e.key === "Enter") open(); }}>
      <div className="nm-sumc-top">
        {cat ? <b className={`cat ${cat[1]}`}>{cat[0]}</b> : null}
        {rep ? <span>{dg ? null : "보도 "}<b>{rep}</b></span> : null}
        {kind ? <b className={`urg ${kind}`}>{kind === "brk" ? "긴급" : "이슈"}</b> : null}
        {scr ? <span className="r">스크랩 <b>{scr}</b></span> : null}
      </div>
      <p className="nm-sumc-t">{a.title || a.title_orig || "(제목 없음)"}</p>
      {short ? null : <div className={`nm-sumc-kv${sens.length ? " three" : ""}`}>
        {media ? <div><span>매체</span><b>{media}</b></div> : null}
        {bias ? <div><span>편향</span><b className={`bias ${bias.cls}`}>{bias.text}</b></div> : null}
        {sens.length ? <div><span>민감</span><b className="sens">{sens.map((s) => <em key={s.t} className={s.warn ? "warn" : undefined}>{s.t}</em>)}</b></div> : null}
      </div>}
      <div className="nm-sumc-prog" aria-label={`진행 ${["요약", "프롬프트", "카드"].slice(0, pr.done).join("·")} 끝${pr.busy ? " · 만드는 중" : pr.fail ? " · 멈춤" : ""}`}>
        {["요약", "프롬프트", "카드"].map((s, i) => <span key={s} className={i < pr.done ? "done" : i === pr.done && pr.busy ? "cur" : i === pr.done && pr.fail ? "fail" : ""}><i>{s}</i><em /></span>)}
      </div>
    </div>
  );
}

export function SummaryDesk({ lead, active = true }: { lead?: ReactNode; active?: boolean }) {
  const q = useQuery(newsListQuery), [n, setN] = useState(PAGE);
  const arts = q.data?.arts || [];
  const [opened] = useState(() => Date.now());
  useRoomRead(roomReadState, SUMMARY_ROOM, active, !!q.data, q.isError, opened, quietRead);   // 이 방을 열면 읽음(방 글 = 서버 summary 방 · 화면은 기사 목록)
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-3 pb-8 pt-[48px]">   {/* 위 여백 = 떠 있는 머리(ui/shell.css .nm-head) */}
        {lead}
        {q.isError ? <p className="text-sm text-destructive" role="alert">요약을 못 받았어 — {q.error.message}</p> : null}
        {q.data && !arts.length ? <p className="nm-sumc-empty">아직 요약된 기사가 없어.</p> : null}
        {arts.slice(0, n).map((a) => <SumCard key={a.file} a={a} />)}
        {arts.length > n ? <button type="button" className="nm-sumc-more" onClick={() => setN((v) => v + PAGE)}>더 보기 · {arts.length - n}</button> : null}
      </div>
    </div>
  );
}

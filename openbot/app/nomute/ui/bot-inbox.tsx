// 봇 현황 「보드」 — 일감마다 카드 한 장 · 세 칸(형 차례 · 도는 중 · 끝남) · 펼치면 단계 줄 · 보드 ↔ 목록
//   형 11-16 03:0x(영상 「Agent inbox」) 「혹시 작업 상황 스케줄러가 자동으로 이런식으로.진행.상황이 구체화 될 수 있는지 그리고 표현이 이렇게 영상처럼 고퀄리티면.좋겠음 최대한 살려줘」
//   자료 · 셈 = ./bot-inbox-logic.ts(서버 도표 status/bots + 형 결정 목록 · 새로 받아오는 것 0 = 봇 현황이 이미 받는 표 그대로)
//   움직임(60프레임 · transform · opacity · filter): 카드가 칸을 옮기거나 보드 ↔ 목록을 바꾸면 앞 자리에서 새 자리로 미끄러짐(./flip.ts) · 새 카드 = 번지며 나타남 ·
//     펼침 = 줄 높이가 부드럽게 열리고(grid 0fr ↔ 1fr = 앱 아코디언과 같은 길) 단계가 차례로 나타남 · 도는 일 = 고리가 돌고 초가 차오름
//   얼마를 먹나 = 초 시계 하나(도는 카드가 있을 때만 · 숨은 탭 = 멈춤) · 서버 요청 0 더
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { type OfficeRoom, idOf } from "../data/office";
import { FaceImg, usePeople } from "./faces";
import { type BotTable, agoKo } from "./bot-desk-logic";
import { type Card, type Col, type Dec, colCount, inboxOf, spanKo, timeRows } from "./bot-inbox-logic";
import { DecideFab, openDecide, useDecisions } from "./decide-pop";
import { useFlip } from "./flip";
import { whoName } from "./who-name";
import "./bot-inbox.css";

type View = "board" | "list";
const COLS: [Col, string][] = [["need", "형 차례"], ["run", "도는 중"], ["done", "끝남"]];
const VIEW_KEY = "nm-botinbox-view";

const Spark = () => <svg className="spark" viewBox="0 0 16 16" aria-hidden><path d="M8 1.5l1.5 4.2 4.2 1.5-4.2 1.5L8 12.9 6.5 8.7 2.3 7.2l4.2-1.5z" fill="currentColor" /></svg>;
const ChipIcon = ({ k }: { k: "code" | "ctx" | "min" }) => (
  <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {k === "code" ? <path d="M2.5 8.5V3h5.5l5.5 5.5-5.5 5.5zM5.3 5.8h.01" /> : k === "ctx" ? <><circle cx="8" cy="8" r="5.5" /><path d="M8 8l2.6-2" /></> : <><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3l2 1.3" /></>}
  </svg>
);

function InboxCard({ c, now, open, onToggle, onAct, hasRoom, face, dim }: { c: Card; now: number; open: boolean; onToggle: () => void; onAct: (c: Card) => void; hasRoom: boolean; face?: string; dim?: boolean }) {
  const span = c.took != null ? spanKo(c.took) : c.since ? spanKo(now - c.since) : "";
  const status = [c.label, c.label && c.tone === "done" ? "" : span].filter(Boolean).join(" · ") || span;
  const act = c.act === "decide" ? "고르기" : c.act === "room" && hasRoom ? "대화방" : "";
  return (
    <li className="nm-ibx-card" data-flip={c.key} data-tone={c.tone} data-open={open ? "" : undefined} data-dim={dim ? "" : undefined}>
      <button type="button" className="hit" aria-expanded={open} onClick={onToggle}>
        <span className="ttl"><Spark /><b>{c.title}</b>{c.who ? <span className="by" title={`담당 ${c.who}`}><FaceImg id={face || c.who} size={18} />{c.who}</span> : null}</span>   {/* 담당자 얼굴 = 일감과 맡은 애가 한 줄에(형 11-16 19:2x 「PM한테 보인 일이 담당자랑 섞여서 아래에 보여아하고」) */}
        <span className="desc">{c.desc}</span>
        <span className="foot">
          <span className="st"><i className="dot" aria-hidden />{status}</span>
          <span className="chips">{c.chips.map((x) => <span key={x.k} title={x.title}><ChipIcon k={x.k} />{x.text}</span>)}</span>
        </span>
      </button>
      <div className="more" aria-hidden={!open}>
        <div className="more-in">
          {c.head ? <p className="head">{c.head}</p> : null}
          <ol className="steps">
            {c.steps.map((s, i) => (
              <li key={i} data-live={s.live ? "" : undefined} data-bad={s.bad ? "" : undefined} style={{ ["--i" as string]: i }}>
                <span>{s.text}</span>{s.at ? <time>{agoKo(now - s.at)}</time> : s.live ? <time>지금</time> : null}
              </li>
            ))}
          </ol>
          {act ? <p className="acts"><button type="button" className={c.act === "decide" ? "go" : "ghost"} tabIndex={open ? 0 : -1} onClick={() => onAct(c)}>{act}</button></p> : null}
        </div>
      </div>
    </li>
  );
}

export function BotInbox({ t, skills, now: at, focus = "" }: { t: BotTable; skills: Record<string, string>; now: number; focus?: string }) {   // focus = 위 조직 그림에서 고른 애 — 그 애 일감만 밝게
  const qc = useQueryClient(), nav = useNavigate(), people = usePeople();
  const dec = useDecisions();
  const decs = useMemo(() => ((dec.data || []) as Dec[]).filter((d) => !d.pick).map((d) => ({ ...d, who: whoName(d.who) })), [dec.data]);
  const [view, setView] = useState<View>(() => { try { const v = localStorage.getItem(VIEW_KEY); if (v === "board" || v === "list") return v; } catch { /* 이번만 */ } return typeof matchMedia === "function" && matchMedia("(min-width: 900px)").matches ? "board" : "list"; });
  const [open, setOpen] = useState(""), [now, setNow] = useState(at);
  const cards = useMemo(() => inboxOf(t, decs, now, skills), [t, decs, now, skills]);
  const n = colCount(cards), ticking = cards.some((c) => c.col !== "done" && c.since);
  const times = useMemo(() => timeRows(t, now), [t, now]), minTick = times.some((x) => x.cur != null);   // 애들 시간 줄(걷은 오더 밖 일 카드 자리)
  useEffect(() => { setNow(Date.now()); }, [at]);
  useEffect(() => {   // 초 시계 = 도는 · 기다리는 카드가 있을 때만 · 「지금 N분째」만 있으면 30초 · 숨은 탭에선 멈춤
    if (!ticking && !minTick) return undefined;
    const id = window.setInterval(() => { if (!document.hidden) setNow(Date.now()); }, ticking ? 1000 : 30_000);
    return () => window.clearInterval(id);
  }, [ticking, minTick]);
  const box = useFlip(`${view}|${cards.map((c) => `${c.col}:${c.key}`).join(",")}`);
  const pick = (v: View) => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* 이번만 */ } };
  const roomOf = (who: string) => (qc.getQueryData<OfficeRoom[]>(["nomute", "rooms"]) || []).find((r) => r.with === who)?.id;
  const onAct = (c: Card) => { if (c.act === "decide") openDecide("botdesk"); else { const id = roomOf(c.who); if (id) void nav({ to: "/channels/$channelId", params: { channelId: id } }); } };
  return (
    <section className="nm-ibx" data-view={view} aria-label="일감 보드">
      <DecideFab fab={false} where="botdesk" kind="all" />
      <header className="bar">
        <p className="sum"><b>일감</b>{COLS.map(([k, name]) => <span key={k} data-col={k}>{name} <i>{n[k]}</i></span>)}</p>
        <div className="seg" role="tablist" aria-label="보기" data-v={view}>
          <i className="ink" aria-hidden />
          <button type="button" role="tab" aria-selected={view === "board"} onClick={() => pick("board")}>보드</button>
          <button type="button" role="tab" aria-selected={view === "list"} onClick={() => pick("list")}>목록</button>
        </div>
      </header>
      <div className="cols" ref={box}>
        {COLS.map(([k, name]) => {
          const mine = cards.filter((c) => c.col === k);
          return (
            <section key={k} className="col" data-col={k} aria-label={name}>
              <h3><Spark /><span>{name}</span><i>{mine.length}</i></h3>
              {mine.length ? <ul>{mine.map((c) => <InboxCard key={c.key} c={c} now={now} open={open === c.key} onToggle={() => setOpen(open === c.key ? "" : c.key)} onAct={onAct} hasRoom={!!roomOf(c.who)} face={idOf(c.who, people)} dim={!!focus && c.who !== focus} />)}</ul> : k === "run" && times.length ? null : <p className="none">{k === "need" ? "형이 볼 것 없음" : k === "run" ? "도는 일 없음" : "오늘 끝난 일 없음"}</p>}
              {k === "run" && times.length ? (   /* 애들 시간 줄 = 가로 한 줄 「이름 · 누적 N분 · 지금 N분째」(형 11-21 07:45) · 경고색 = 누적 > 250 · 지금 > 80(형 07:46) */
                <ul className="nm-ibx-time" aria-label="애들 시간">
                  {times.map((x) => (
                    <li key={x.who} data-dim={focus && x.who !== focus ? "" : undefined}>
                      <FaceImg id={idOf(x.who, people)} size={18} /><b>{x.who}</b>
                      <span data-warn={x.warnSum || undefined}>누적 {x.sum ?? "–"}분</span>
                      {x.cur != null ? <span data-warn={x.warnCur || undefined}>지금 {x.cur}분째</span> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </section>
  );
}

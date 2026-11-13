// 위쪽 탭 줄(빠르 11-09 · 형 05:16 「그리고 웹앱 대시보드에 이런식으로 위쪽에 탭 열리게 가능래서 안에서 인터넷 가능하게」 · 05:19 「1과 2 둥다」 · 「vm창도」
//   · 뜸 05:16 꼴 · 시아 05:23 자리·차례 · 봄 배분 21-1 · 21-2①) — PC 두 칸(split)만 · 폰 = 없음
//   차례 = 「대시보드」(고정 · 누르면 두 칸 그대로) → 방 탭(지금 연 방이 붙음 · 누르면 그 방) → 화면 탭(「+」 → 몸 브레이브·VM 화면 · 명부 screen · 탭 안 iframe) → 「+」
//   아이콘 = 우리 얼굴 · × · 끌어서 순서(같은 갈래 안) · 기기마다 기억(./tab-list.ts) · 고른 탭 바탕 = 아래 판 바탕색 + 어깨 곡선 · 새 판 알약 = 탭 줄 끝(--nm-tabs-end)
import { useQuery } from "@tanstack/react-query";
import { type PointerEvent as RPE, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type OfficePerson, type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { FaceImg } from "./faces";
import { DASH, type Tab, type TabState, TABS_KEY, tabColors, tabKey, tabsAdd, tabsClose, tabsLoad, tabsMove, tabsSave, tabsSetUrl, webTabName, webTabNew } from "./tab-list";
import { WebPane } from "./web-pane";
import { CobrowsePane } from "./cobrowse-pane";   // 같이 보기(봄 11-12 13:54 · 맥 72 다리)
import { COBROWSE_EVENT } from "./cobrowse";
import { TEAMS_PREFIX, TeamsList, isTeams, useTeamsUnread } from "./teams";   // 팀즈 탭(형 11-12 16:49 봄 1:1 「그리고 팀즈 내용이 탭을 통해 전환하게 해줘. 누누르면 대화창만 바뀌면됨.」 「목록은 우측에 대화창은 좌측에 하면되겟다. 탭에 항상 팀즈가 잇고 고정으로.」 「팀즈 픽토그램으로 살려서」 · 깃)   // 웹 탭 안 = 대시보드 「웹」 칸과 같은 한 벌(형 11-11 22:11 「하네스가 참조처럼 되어야지 2개 만들면 수정할때마다 두번수정해야되니까」)
import "./tab-bar.css";

// 첫 탭 = 「봄의 정원」(형 11-12 06:23 봄 1:1 「기본적으로 탭형태를 갖춰서. 봄의 정원. 이라고 나오게해줘. 그리고 거기서 +가 나오게 크롬형태를 참고하면 될거같애」
//   · 「일단 누르면 기본값으로 우측 sns, hotiussue, digest로 빈창이 열리게 하자 좌측은 유지되고(대화족은)」) — 지금 판 그 자체가 첫 탭 · 늘 보임
export const GARDEN = "봄의 정원", TEAMS = "teams", BROWSER = "co", MEET = "meet";   // MEET = 고정 「화상회의」 탭(형 11-13 09:21 봄 옮김 「그냥 웹 브라우저랑, 화상 채팅방이랑 구분해주라. 아이콘은 팀즈처럼 하나 만들면될거같아.」 · 「그냥 웹 브라우저는 내가 대신 로그인하는 그런 용도면 될듯.」)
   // BROWSER = 고정 「브라우저」 탭 키(= 옛 같이 보기 탭 · 맥 72 다리 판 · 못 닿으면 끼워 넣기 · 형 11-12 16:49 「봄의정원, 브라우저, 팀즈」 · 봄 17:01 ⓐ · 17:03 「구글 · 인스타 · 클라우드플레어 걸린 곳도 열림」)   // TEAMS = 고정 팀즈 탭 키(탭 목록 밖 · 닫기 · 끌기 없음)
const TEAMS_LAST = "nm-teams-last";   // 마지막에 본 팀즈 대화(이 기기) = 팀즈 탭 누르면 왼쪽이 그리로
const teamsLast = () => { try { return localStorage.getItem(TEAMS_LAST) || ""; } catch { return ""; } };
const OFFICE_LAST = "nm-office-last";   // 마지막에 본 사무실 대화(이 기기) = 팀즈에서 정원 탭 누르면 왼쪽이 그리로(형 11-13 12:43 봄 옮김 「그리고 팀즈에서 다시 정원을 누르면 그 채팅이 뜨게 가능해?」 · 「✓ ③ 둘 다」 · 뎅)
const officeLast = () => { try { return localStorage.getItem(OFFICE_LAST) || ""; } catch { return ""; } };
/** 화상회의 픽토그램(카메라 + 사람 하나 · 라임) — 팀즈 「회의」처럼 한눈에 갈리는 제 아이콘(형 11-13 09:21) */
const MeetIcon = () => (
  <svg className="nm-tab-ic meet" viewBox="0 0 24 24" aria-hidden>
    <rect x="1.5" y="5.5" width="14.5" height="13" rx="3" fill="#CFFF40" /><path d="M17.4 10.4l4.2-2.6c.4-.2.9.1.9.5v7.4c0 .4-.5.7-.9.5l-4.2-2.6z" fill="#CFFF40" />
    <circle cx="8.75" cy="10.4" r="2.3" fill="#121314" /><path d="M4.6 16.4c.5-2 2.2-3.1 4.15-3.1s3.65 1.1 4.15 3.1z" fill="#121314" />
  </svg>
);
/** 팀즈 픽토그램(사람 둘 + T 판 · 보라) */
const TeamsIcon = () => (
  <svg className="nm-tab-ic teams" viewBox="0 0 24 24" aria-hidden>
    <circle cx="18.2" cy="6.6" r="2.4" fill="#7B83EB" /><path d="M15.4 10.2h5.4c.7 0 1.2.5 1.2 1.2v4.3a3.2 3.2 0 0 1-6.4 0v-5.5z" fill="#7B83EB" />
    <circle cx="12.6" cy="5.4" r="3" fill="#5059C9" /><path d="M7.4 9.6h9.6c.6 0 1 .4 1 1v5.6a5.4 5.4 0 0 1-10.8 0v-5.4c0-.7.5-1.2 1.2-1.2z" fill="#5059C9" />
    <rect x="2" y="7" width="10.6" height="10.6" rx="1.6" fill="#4B53BC" /><path d="M4.6 9.6h5.4v1.5H8.1v4.6H6.5v-4.6H4.6z" fill="#fff" />
  </svg>
);
// 웹 · 화면 탭이 덮는 자리 = 오른쪽 칸(aside.nm-split · SNS · HOT ISSUE · DIGEST)만 · 왼쪽 대화는 그대로 · 칸이 없으면(좁은 판) 옛 자리(몸 전체)
const paneHost = (): HTMLElement | null => document.querySelector<HTMLElement>(".nm-split-root aside.nm-split");

const load = (): TabState => {   // 방 탭은 안 올림(형 11-09 09:29 회의실 「대화 상대가 저기 나올 필요는 없어. 웹과 관련된 내용만 저기 뜨면 될듯.」) = 옛 판에 남은 방 탭도 뺌
  let s: TabState; try { s = tabsLoad(localStorage.getItem(TABS_KEY)); } catch { s = tabsLoad(null); }
  const tabs = s.tabs.filter((t) => t.k !== "room" && t.k !== "co");   // co = 이제 고정 「브라우저」 탭(목록 밖)
  return { tabs, active: s.active === TEAMS || s.active === BROWSER || s.active === MEET || tabs.some((t) => tabKey(t) === s.active) ? s.active : "dash" };
};
const go = (hash: string) => { if (location.hash !== hash) location.hash = hash; };

export function TabBar({ room, pane }: { room: string; pane: string }) {
  const [s, setS] = useState<TabState>(load);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => { const h = paneHost(); if (h !== host) setHost(h); });   // 오른쪽 칸이 그려진 뒤 · 다시 그려지면 따라감
  const bar = useRef<HTMLDivElement>(null), drag = useRef<{ key: string; x: number; moved: boolean } | null>(null);
  const rooms = useQuery({ queryKey: ["nomute", "rooms"], queryFn: () => office<{ rooms: OfficeRoom[] }>("rooms").then((j) => j.rooms || []), staleTime: 30_000 });
  const ppl = useQuery({ queryKey: ["nomute", "people-tabs"], queryFn: () => people(), staleTime: 60_000 });
  const list: OfficePerson[] = ppl.data || [];
  useEffect(() => { try { localStorage.setItem(TABS_KEY, tabsSave(s)); } catch { /* 저장 못 쓰면 이번 판만 */ } }, [s]);
  const first = useRef(true);
  useEffect(() => {   // 방·판을 옮기면(얼굴 띠 · 목록 누름) 화면 탭은 덮개를 내리고 대시보드로 · 방 탭은 안 만듦(형 09:29)
    if (first.current) { first.current = false; return; }
    if (paneHost()) return;   // 웹 · 화면 탭이 오른쪽 칸만 덮는 판(PC 두 칸) = 왼쪽 대화를 옮겨도 오른쪽 탭은 그대로(형 11-12 16:41 봄 1:1 「봄으 ㅣ정원으로 다시 탭 갔다가 오면, 방금 탭으로 와야됨. (항상 메인으로 다시 오더라)」 · 깃) · 몸 전체를 덮는 옛 판만 내림
    setS((x) => (x.active === "dash" ? x : { ...x, active: "dash" }));
  }, [room, pane]);
  useEffect(() => { const on = () => setS((x) => ({ ...x, active: BROWSER })); addEventListener(COBROWSE_EVENT, on); return () => removeEventListener(COBROWSE_EVENT, on); }, []);   // 들머리 = openCobrowse()
  useEffect(() => { try { if (isTeams(room)) localStorage.setItem(TEAMS_LAST, room.slice(TEAMS_PREFIX.length)); else if (room) localStorage.setItem(OFFICE_LAST, room); } catch { /* 이번만 */ } }, [room]);   // 왼쪽에 연 팀즈 대화 = 다음 팀즈 탭의 왼쪽
  useEffect(() => { if (s.active.startsWith("s:") || s.active.startsWith("w:")) setSeen((v) => (v.has(s.active) ? v : new Set(v).add(s.active))); }, [s.active]);
  const place = () => {   // 고른 탭 바탕 = 아래 판 바탕(테마 따라) · 새 판 알약 자리 = 탭 줄 끝
    const root = document.querySelector(".nm-split-root") as HTMLElement | null, el = bar.current;
    if (root && el) {   // 고른 탭 = 아래 판 바탕색 · 글자 = 그 바탕 밝기로 고름(뎅 06:43 ㉢ 「라이트에서 고른 탭이 검은 알약에 글자 안 보임」 · 봄 배분 26)
      const { bg, fg } = tabColors(getComputedStyle(root).backgroundColor, matchMedia("(prefers-color-scheme: dark)").matches);
      el.style.setProperty("--nm-tab-on", bg); el.style.setProperty("--nm-tab-on-fg", fg);
    }
    if (el) {   // 새 판 알약 = 「+」 오른쪽 · 시계 앞에 자리(알약 ≈160px)가 없으면 시계 오른쪽으로(06:3x 실물 · 탭 줄 상자 끝으로 잡으면 알약이 시계를 덮음)
      const plus = el.querySelector(".nm-tab-plus")?.getBoundingClientRect(), clock = document.querySelector(".nm-topclock")?.getBoundingClientRect();
      let x = Math.round((plus ? plus.right : el.getBoundingClientRect().left) + 8);
      if (clock && x + 160 > clock.left - 8) x = Math.round(clock.right + 16);
      document.documentElement.style.setProperty("--nm-tabs-end", x + "px");
    }
  };
  useLayoutEffect(place);   // 그릴 때마다
  useEffect(() => {   // 창 크기·탭 줄 폭이 바뀔 때도(모루 #3005 08:13 「resize 를 구독하지 않아 1600→900 이면 알약이 화면 밖」)
    const on = () => place();
    window.addEventListener("resize", on);
    const ro = typeof ResizeObserver === "function" && bar.current ? new ResizeObserver(on) : null;
    if (ro && bar.current) ro.observe(bar.current);
    return () => { window.removeEventListener("resize", on); ro?.disconnect(); };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { document.documentElement.style.removeProperty("--nm-tabs-end"); }, []);
  const roomOf = (id: string) => (rooms.data || []).find((r) => r.id === id);
  const faceOf = (t: Tab) => {
    if (t.k === "screen") return idOf(t.who, list);
    if (t.k !== "room") return "";
    const r = roomOf(t.id);
    return !r ? "" : r.with ? idOf(r.with, list) : roomAgentIds(r, list)[0] || "";
  };
  const nameOf = (t: Tab) => (t.k === "dash" ? GARDEN : t.k === "co" ? "같이 보기" : t.k === "web" ? webTabName(t.url) : t.k === "screen" ? `${list.find((p) => p.who === t.who)?.name || t.who} 화면` : roomOf(t.id)?.name || t.id);
  const teamsNew = useTeamsUnread();
  const pickTeams = () => {   // 오른쪽 칸 = 팀즈 목록 · 왼쪽 대화 = 마지막 팀즈 대화(없으면 그대로 · 목록에서 고르면 왼쪽만 바뀜)
    setS((x) => ({ ...x, active: TEAMS }));
    const c = teamsLast();
    if (c && room !== TEAMS_PREFIX + c) go(`#/channels/${encodeURIComponent(TEAMS_PREFIX + c)}`);
  };
  const pick = (t: Tab) => {
    const key = tabKey(t);
    setS((x) => ({ ...x, active: key }));
    if (t.k === "room") go(`#/channels/${encodeURIComponent(t.id)}`);
    else if (t.k === "dash" && isTeams(room)) { const o = officeLast(); go(o ? `#/channels/${encodeURIComponent(o)}` : "#/"); }   // 팀즈 대화를 보다가 정원 = 아까 보던 사무실 대화 그대로(없으면 처음 판)
    else if (t.k === "dash" && pane === "chat" && !paneHost()) go("#/");   // 오른쪽 칸만 덮는 판 = 왼쪽 대화는 그대로(정원 탭 = 오른쪽만 원래 판 · 형 11-12 16:41 「항상 메인으로 다시 오더라」 · 깃)
  };
  const close = (key: string) => {
    const next = tabsClose(s, key), t = next.tabs.find((x) => tabKey(x) === next.active) || DASH;
    setS(next);
    if (next.active !== s.active) { if (t.k === "room") go(`#/channels/${encodeURIComponent(t.id)}`); else if (t.k === "dash" && pane === "chat" && !paneHost()) go("#/"); }
  };
  const down = (key: string) => (e: RPE<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest(".nm-tab-x")) return;
    drag.current = { key, x: e.clientX, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: RPE<HTMLDivElement>) => {
    const d = drag.current, el = bar.current;
    if (!d || !el) return;
    if (!d.moved && Math.abs(e.clientX - d.x) < 6) return;
    d.moved = true;
    const tabs = [...el.querySelectorAll<HTMLElement>(".nm-tab")];
    let to = tabs.length - 1;
    for (let i = 0; i < tabs.length; i++) { const r = tabs[i].getBoundingClientRect(); if (e.clientX < r.left + r.width / 2) { to = i; break; } }
    setS((x) => tabsMove(x, d.key, to));
  };
  const up = (t: Tab) => (e: RPE<HTMLDivElement>) => {
    const d = drag.current; drag.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* 이미 놓음 */ }
    if (d && !d.moved) pick(t);
  };
  const paneTabs = s.tabs.filter((t): t is Extract<Tab, { k: "screen" | "web" | "co" }> => t.k === "screen" || t.k === "web" || t.k === "co");
  const paneOn = s.active.startsWith("s:") || s.active.startsWith("w:") || s.active === "co" || s.active === MEET || s.active === TEAMS;
  return (
    <>
      <div ref={bar} className="nm-tabs" role="tablist" aria-label="탭 줄">
        <div role="tab" aria-selected={s.active === "dash"} tabIndex={0} title={GARDEN} className={`nm-tab dash garden${s.active === "dash" ? " on" : ""}`}
          onClick={() => pick(DASH)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(DASH); } }}>
          <span className="nm-tab-nm">{GARDEN}</span>
        </div>   {/* 첫 탭 = 지금 판(늘 보임 · 닫기 · 끌기 없음) · 누르면 오른쪽이 원래 판(SNS · HOT ISSUE · DIGEST)으로 */}
        <div role="tab" aria-selected={s.active === BROWSER} tabIndex={0} title="브라우저(맥 72 · 형 대신 로그인)" className={`nm-tab browser${s.active === BROWSER ? " on" : ""}`}
          onClick={() => setS((x) => ({ ...x, active: BROWSER }))} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setS((x) => ({ ...x, active: BROWSER })); } }}>
          <svg className="nm-tab-ic browser" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
          <span className="nm-tab-nm">브라우저</span>
        </div>   {/* 브라우저 = 늘 있는 고정 탭 · 화면 = 같이 보기 다리 판(맥 72) · 못 닿으면 끼워 넣기 웹 칸(CobrowsePane 안) · 이제 형이 대신 로그인하는 칸(화상회의 단추 뺌) */}
        <div role="tab" aria-selected={s.active === MEET} tabIndex={0} title="화상회의(맥 72 화면 + 우리 대화)" className={`nm-tab meet${s.active === MEET ? " on" : ""}`}
          onClick={() => setS((x) => ({ ...x, active: MEET }))} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setS((x) => ({ ...x, active: MEET })); } }}>
          <MeetIcon /><span className="nm-tab-nm">화상회의</span>
        </div>   {/* 화상회의 = 따로 선 들머리(형 11-13 09:21) · 열린 회의 없으면 바로 참여자 고르기 */}
        <div role="tab" aria-selected={s.active === TEAMS} tabIndex={0} title="팀즈" className={`nm-tab teams${s.active === TEAMS ? " on" : ""}`}
          onClick={pickTeams} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickTeams(); } }}>
          <TeamsIcon /><span className="nm-tab-nm">팀즈</span>{teamsNew ? <span className="nm-tbadge" aria-label={`새 글 있는 대화 ${teamsNew}`}>{teamsNew > 99 ? "99+" : teamsNew}</span> : null}   {/* 새 글 = 숫자(형 11-13 10:23 「새로 들어온 글도 여기서 알수있으면 베스트임」) */}
        </div>   {/* 팀즈 = 늘 있는 고정 탭(닫기 · 끌기 없음) */}
        {s.tabs.filter((t) => t.k !== "dash").map((t) => {
          const key = tabKey(t), on = s.active === key, face = faceOf(t);
          return (
            <div key={key} role="tab" aria-selected={on} tabIndex={0} title={nameOf(t)} className={`nm-tab${on ? " on" : ""}${t.k === "dash" ? " dash" : ""}`}
              onPointerDown={down(key)} onPointerMove={move} onPointerUp={up(t)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(t); } }}>
              {t.k === "dash" ? <span className="nm-tab-ic dash" aria-hidden>▦</span> : face ? <FaceImg id={face} size={18} className="nm-tab-ic" /> : <span className="nm-tab-ic dot" aria-hidden />}
              <span className="nm-tab-nm">{nameOf(t)}</span>
              {t.k === "dash" ? null : <button type="button" className="nm-tab-x" aria-label={`${nameOf(t)} 탭 닫기`} onClick={(e) => { e.stopPropagation(); close(key); }}>×</button>}
            </div>
          );
        })}
        <button type="button" className="nm-tab-plus" aria-label="새 탭" title="새 탭" onClick={() => setS((x) => tabsAdd(x, webTabNew()))}>+</button>
        {room === "all" && pane === "chat" ? <button type="button" className="nm-tab-cobtn" title="맥 72 화면을 같이 보며 얘기하기" onClick={() => setS((x) => ({ ...x, active: MEET }))}>화상회의</button> : null}   {/* 들머리 = 회의실(봄 13:21 「먼저 회의실」) */}
      </div>
      {paneTabs.length || s.active === TEAMS || s.active === BROWSER || s.active === MEET ? createPortal(
        <div className={`nm-tab-screen${host ? " in-split" : ""}`} hidden={!paneOn}>
          {s.active === BROWSER ? <div className="nm-tab-co"><CobrowsePane mode="browser" onClose={() => setS((x) => ({ ...x, active: "dash" }))} /></div> : null}
          {s.active === MEET ? <div className="nm-tab-co"><CobrowsePane mode="meet" onClose={() => setS((x) => ({ ...x, active: "dash" }))} /></div> : null}   {/* 화상회의 = 같은 맥 72 다리 판 + 아래 회의 대화 */}   {/* 보는 동안만 붙음 = 안 보면 다리 쉼 · 다시 고르면 새 표(맥 72 탭은 그대로 = 마지막 웹 화면) */}
          {s.active === TEAMS ? <div className="nm-tab-teams"><TeamsList current={room} /></div> : null}   {/* 팀즈 목록 = 오른쪽 칸 · 누르면 왼쪽 대화만 바뀜 */}
          {paneTabs.filter((t) => seen.has(tabKey(t)) || s.active === tabKey(t)).map((t) => t.k === "co" ? (
            s.active === "co" ? <div key="co" className="nm-tab-co"><CobrowsePane onClose={() => close("co")} /></div> : null   /* 보는 동안만 붙음 = 안 보면 다리 쉼(봄 12:53 「보는 중」 신호) · 다시 고르면 새 표 */
          ) : t.k === "web" ? (
            <div key={tabKey(t)} className="nm-tab-web" hidden={s.active !== tabKey(t)}>
              <WebPane initial={t.url} focus={s.active === tabKey(t)} onClose={() => close(tabKey(t))} onGo={(u) => setS((x) => tabsSetUrl(x, tabKey(t), u))} />   {/* 닫기 = 주소 줄 오른쪽 끝 ×(형 11-12 10:00 「우측에 웹페이지가 열렸을때 이를 닫는게 없어」) · 빈 탭 = 「주소나 검색어를 넣어주세요」 한 줄만(형 10:00 「애들 화면 - 이거는 없어도 돼」 · 몸 화면 바로가기 걷음 · 즐겨찾기는 나중) */}
            </div>
          ) : (
            <iframe key={tabKey(t)} title={nameOf(t)} src={t.url} hidden={s.active !== tabKey(t)} allow="clipboard-read; clipboard-write; fullscreen" />
          ))}
        </div>, host || document.body) : null}
    </>
  );
}

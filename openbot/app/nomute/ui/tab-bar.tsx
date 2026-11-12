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
import { WebPane } from "./web-pane";   // 웹 탭 안 = 대시보드 「웹」 칸과 같은 한 벌(형 11-11 22:11 「하네스가 참조처럼 되어야지 2개 만들면 수정할때마다 두번수정해야되니까」)
import "./tab-bar.css";

// 첫 탭 = 「봄의 정원」(형 11-12 06:23 봄 1:1 「기본적으로 탭형태를 갖춰서. 봄의 정원. 이라고 나오게해줘. 그리고 거기서 +가 나오게 크롬형태를 참고하면 될거같애」
//   · 「일단 누르면 기본값으로 우측 sns, hotiussue, digest로 빈창이 열리게 하자 좌측은 유지되고(대화족은)」) — 지금 판 그 자체가 첫 탭 · 늘 보임
export const GARDEN = "봄의 정원";
// 웹 · 화면 탭이 덮는 자리 = 오른쪽 칸(aside.nm-split · SNS · HOT ISSUE · DIGEST)만 · 왼쪽 대화는 그대로 · 칸이 없으면(좁은 판) 옛 자리(몸 전체)
const paneHost = (): HTMLElement | null => document.querySelector<HTMLElement>(".nm-split-root aside.nm-split");

const load = (): TabState => {   // 방 탭은 안 올림(형 11-09 09:29 회의실 「대화 상대가 저기 나올 필요는 없어. 웹과 관련된 내용만 저기 뜨면 될듯.」) = 옛 판에 남은 방 탭도 뺌
  let s: TabState; try { s = tabsLoad(localStorage.getItem(TABS_KEY)); } catch { s = tabsLoad(null); }
  const tabs = s.tabs.filter((t) => t.k !== "room");
  return { tabs, active: tabs.some((t) => tabKey(t) === s.active) ? s.active : "dash" };
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
    setS((x) => (x.active === "dash" ? x : { ...x, active: "dash" }));
  }, [room, pane]);
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
  const nameOf = (t: Tab) => (t.k === "dash" ? GARDEN : t.k === "web" ? webTabName(t.url) : t.k === "screen" ? `${list.find((p) => p.who === t.who)?.name || t.who} 화면` : roomOf(t.id)?.name || t.id);
  const pick = (t: Tab) => {
    const key = tabKey(t);
    setS((x) => ({ ...x, active: key }));
    if (t.k === "room") go(`#/channels/${encodeURIComponent(t.id)}`);
    else if (t.k === "dash" && pane === "chat") go("#/");
  };
  const close = (key: string) => {
    const next = tabsClose(s, key), t = next.tabs.find((x) => tabKey(x) === next.active) || DASH;
    setS(next);
    if (next.active !== s.active) { if (t.k === "room") go(`#/channels/${encodeURIComponent(t.id)}`); else if (t.k === "dash" && pane === "chat") go("#/"); }
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
  return (
    <>
      <div ref={bar} className="nm-tabs" role="tablist" aria-label="탭 줄">
        <div role="tab" aria-selected={s.active === "dash"} tabIndex={0} title={GARDEN} className={`nm-tab dash garden${s.active === "dash" ? " on" : ""}`}
          onClick={() => pick(DASH)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(DASH); } }}>
          <span className="nm-tab-nm">{GARDEN}</span>
        </div>   {/* 첫 탭 = 지금 판(늘 보임 · 닫기 · 끌기 없음) · 누르면 오른쪽이 원래 판(SNS · HOT ISSUE · DIGEST)으로 */}
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
      </div>
      {paneTabs.length ? createPortal(
        <div className={`nm-tab-screen${host ? " in-split" : ""}`} hidden={!(s.active.startsWith("s:") || s.active.startsWith("w:"))}>
          {paneTabs.filter((t) => seen.has(tabKey(t)) || s.active === tabKey(t)).map((t) => t.k === "web" ? (
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

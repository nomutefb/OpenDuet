// 위쪽 탭 줄(빠르 11-09 · 형 05:16 「그리고 웹앱 대시보드에 이런식으로 위쪽에 탭 열리게 가능래서 안에서 인터넷 가능하게」 · 05:19 「1과 2 둥다」 · 「vm창도」
//   · 뜸 05:16 꼴 · 시아 05:23 자리·차례 · 봄 배분 21-1 · 21-2①) — PC 두 칸(split)만 · 폰 = 없음
//   차례 = 「대시보드」(고정 · 누르면 두 칸 그대로) → 방 탭(지금 연 방이 붙음 · 누르면 그 방) → 화면 탭(「+」 → 몸 브레이브·VM 화면 · 명부 screen · 탭 안 iframe) → 「+」
//   아이콘 = 우리 얼굴 · × · 끌어서 순서(같은 갈래 안) · 기기마다 기억(./tab-list.ts) · 고른 탭 바탕 = 아래 판 바탕색 + 어깨 곡선 · 새 판 알약 = 탭 줄 끝(--nm-tabs-end)
import { useQuery } from "@tanstack/react-query";
import { type PointerEvent as RPE, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type OfficePerson, type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { FaceImg } from "./faces";
import { DASH, type Tab, type TabState, TABS_KEY, tabKey, tabsAdd, tabsClose, tabsLoad, tabsMove, tabsSave } from "./tab-list";
import "./tab-bar.css";

const load = (): TabState => { try { return tabsLoad(localStorage.getItem(TABS_KEY)); } catch { return tabsLoad(null); } };
const go = (hash: string) => { if (location.hash !== hash) location.hash = hash; };

export function TabBar({ room, pane }: { room: string; pane: string }) {
  const [s, setS] = useState<TabState>(load);
  const [plus, setPlus] = useState(false), [seen, setSeen] = useState<Set<string>>(() => new Set());
  const bar = useRef<HTMLDivElement>(null), drag = useRef<{ key: string; x: number; moved: boolean } | null>(null);
  const rooms = useQuery({ queryKey: ["nomute", "rooms"], queryFn: () => office<{ rooms: OfficeRoom[] }>("rooms").then((j) => j.rooms || []), staleTime: 30_000 });
  const ppl = useQuery({ queryKey: ["nomute", "people-tabs"], queryFn: () => people(), staleTime: 60_000 });
  const list: OfficePerson[] = ppl.data || [];
  useEffect(() => { try { localStorage.setItem(TABS_KEY, tabsSave(s)); } catch { /* 저장 못 쓰면 이번 판만 */ } }, [s]);
  useEffect(() => {   // 길 따라 고른 탭: 방 = 그 방 탭(없으면 붙임) · 방 밖 = 화면 탭이 아니면 대시보드
    if (pane === "chat" && room) setS((x) => tabsAdd(x, { k: "room", id: room }));
    else setS((x) => (x.active.startsWith("s:") ? x : { ...x, active: "dash" }));
  }, [room, pane]);
  useEffect(() => { if (s.active.startsWith("s:")) setSeen((v) => (v.has(s.active) ? v : new Set(v).add(s.active))); }, [s.active]);
  useLayoutEffect(() => {   // 고른 탭 바탕 = 아래 판 바탕(테마 따라) · 새 판 알약 자리 = 탭 줄 끝
    const root = document.querySelector(".nm-split-root") as HTMLElement | null, el = bar.current;
    if (root && el) el.style.setProperty("--nm-tab-on", getComputedStyle(root).backgroundColor || "#f6f6f8");
    if (el) {   // 새 판 알약 = 「+」 오른쪽 · 시계 앞에 자리(알약 ≈160px)가 없으면 시계 오른쪽으로(06:3x 실물 · 탭 줄 상자 끝으로 잡으면 알약이 시계를 덮음)
      const plus = el.querySelector(".nm-tab-plus")?.getBoundingClientRect(), clock = document.querySelector(".nm-topclock")?.getBoundingClientRect();
      let x = Math.round((plus ? plus.right : el.getBoundingClientRect().left) + 8);
      if (clock && x + 160 > clock.left - 8) x = Math.round(clock.right + 16);
      document.documentElement.style.setProperty("--nm-tabs-end", x + "px");
    }
  });
  useEffect(() => () => { document.documentElement.style.removeProperty("--nm-tabs-end"); }, []);
  const roomOf = (id: string) => (rooms.data || []).find((r) => r.id === id);
  const faceOf = (t: Tab) => {
    if (t.k === "screen") return idOf(t.who, list);
    if (t.k !== "room") return "";
    const r = roomOf(t.id);
    return !r ? "" : r.with ? idOf(r.with, list) : roomAgentIds(r, list)[0] || "";
  };
  const nameOf = (t: Tab) => (t.k === "dash" ? "대시보드" : t.k === "screen" ? `${list.find((p) => p.who === t.who)?.name || t.who} 화면` : roomOf(t.id)?.name || t.id);
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
  const shots = list.filter((p) => typeof (p as OfficePerson & { screen?: string }).screen === "string" && (p as OfficePerson & { screen?: string }).screen);
  const screenTabs = s.tabs.filter((t): t is Extract<Tab, { k: "screen" }> => t.k === "screen");
  return (
    <>
      <div ref={bar} className="nm-tabs" role="tablist" aria-label="탭 줄">
        {s.tabs.map((t) => {
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
        <button type="button" className="nm-tab-plus" aria-label="화면 탭 열기" aria-expanded={plus} onClick={() => setPlus((v) => !v)}>+</button>
        {plus ? (
          <div className="nm-tab-menu" role="menu" aria-label="몸 화면 고르기">
            {shots.length ? shots.map((p) => (
              <button key={p.who} type="button" role="menuitem" onClick={() => { setPlus(false); setS((x) => tabsAdd(x, { k: "screen", who: p.who, url: (p as OfficePerson & { screen: string }).screen })); }}>
                <FaceImg id={idOf(p.who, list)} size={18} />{(p.name || p.who) + " 화면"}
              </button>
            )) : <span className="nm-tab-none">열 수 있는 몸 화면이 없어</span>}
          </div>
        ) : null}
      </div>
      {screenTabs.length ? createPortal(
        <div className="nm-tab-screen" hidden={!s.active.startsWith("s:")}>
          {screenTabs.filter((t) => seen.has(tabKey(t)) || s.active === tabKey(t)).map((t) => (
            <iframe key={tabKey(t)} title={nameOf(t)} src={t.url} hidden={s.active !== tabKey(t)} allow="clipboard-read; clipboard-write; fullscreen" />
          ))}
        </div>, document.body) : null}
    </>
  );
}

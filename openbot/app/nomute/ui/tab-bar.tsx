// 위쪽 탭 줄(빠르 11-09 · 형 05:16 「그리고 웹앱 대시보드에 이런식으로 위쪽에 탭 열리게 가능래서 안에서 인터넷 가능하게」 · 05:19 「1과 2 둥다」 · 「vm창도」
//   · 뜸 05:16 꼴 · 시아 05:23 자리·차례 · 봄 배분 21-1 · 21-2①) — PC 두 칸(split)만 · 폰 = 없음
//   차례 = 「대시보드」(고정 · 누르면 두 칸 그대로) → 방 탭(지금 연 방이 붙음 · 누르면 그 방) → 화면 탭(「+」 → 몸 브레이브·VM 화면 · 명부 screen · 탭 안 iframe) → 「+」
//   아이콘 = 우리 얼굴 · × · 끌어서 순서(같은 갈래 안) · 기기마다 기억(./tab-list.ts) · 고른 탭 바탕 = 아래 판 바탕색 + 어깨 곡선 · 새 판 알약 = 탭 줄 끝(--nm-tabs-end)
import { useQuery } from "@tanstack/react-query";
import { type PointerEvent as RPE, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type OfficePerson, type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { FaceImg } from "./faces";
import { DASH, ORDER_KEY, STRIP_FIXED, type Tab, type TabState, TABS_KEY, dropIndex, stripMove, stripOrder, tabColors, tabKey, tabsAdd, tabsClose, tabsLoad, tabsSave, tabsSetUrl, WEB_TAB_EVENT, webTabName, webTabNew, webTabOpen } from "./tab-list";
import { WebPane } from "./web-pane";
import { CobrowsePane } from "./cobrowse-pane";   // 같이 보기(봄 11-12 13:54 · 맥 72 다리)
import { COBROWSE_EVENT } from "./cobrowse";
import { SCREEN_TAB_EVENT, type ScreenTabAsk, ScreenTabPane } from "./screen-tab";   // 몸 화면 탭(구름 11-16 · 형 16:2x 「ㅇㅇ 해줘」 ← 「애들 vm키면, pc에서는 새 탭으로 열리게 가능해?」)
import { screenTabAdd } from "./screen-tab-logic";
import { TEAMS_PREFIX, TeamsBell, TeamsList, isTeams, useTeamsUnread } from "./teams";   // 팀즈 탭(형 11-12 16:49 봄 1:1 「그리고 팀즈 내용이 탭을 통해 전환하게 해줘. 누누르면 대화창만 바뀌면됨.」 「목록은 우측에 대화창은 좌측에 하면되겟다. 탭에 항상 팀즈가 잇고 고정으로.」 「팀즈 픽토그램으로 살려서」 · 깃)   // 웹 탭 안 = 대시보드 「웹」 칸과 같은 한 벌(형 11-11 22:11 「하네스가 참조처럼 되어야지 2개 만들면 수정할때마다 두번수정해야되니까」)
import "./tab-bar.css";
import { MeetIcon, TeamsIcon } from "./tab-icons";   // 폰 「사무실 | 팀즈 | 회의」 탭도 같이 씀(./teams.tsx TeamsSwitch · 형 11-13 22:14)

// 첫 탭 = 「봄의 정원」(형 11-12 06:23 봄 1:1 「기본적으로 탭형태를 갖춰서. 봄의 정원. 이라고 나오게해줘. 그리고 거기서 +가 나오게 크롬형태를 참고하면 될거같애」
//   · 「일단 누르면 기본값으로 우측 sns, hotiussue, digest로 빈창이 열리게 하자 좌측은 유지되고(대화족은)」) — 지금 판 그 자체가 첫 탭 · 늘 보임
export const GARDEN = "봄의 정원", TEAMS = "teams", BROWSER = "co", MEET = "meet";   // MEET = 고정 「화상회의」 탭(형 11-13 09:21 봄 옮김 「그냥 웹 브라우저랑, 화상 채팅방이랑 구분해주라. 아이콘은 팀즈처럼 하나 만들면될거같아.」 · 「그냥 웹 브라우저는 내가 대신 로그인하는 그런 용도면 될듯.」)
   // BROWSER = 고정 「브라우저」 탭 키(= 옛 같이 보기 탭 · 맥 72 다리 판 · 못 닿으면 끼워 넣기 · 형 11-12 16:49 「봄의정원, 브라우저, 팀즈」 · 봄 17:01 ⓐ · 17:03 「구글 · 인스타 · 클라우드플레어 걸린 곳도 열림」)   // TEAMS = 고정 팀즈 탭 키(탭 목록 밖 · 닫기 없음 · 끌어 옮기기는 됨 = 줄 차례 ./tab-list stripOrder)
const TEAMS_LAST = "nm-teams-last";   // 마지막에 본 팀즈 대화(이 기기) = 팀즈 탭 누르면 왼쪽이 그리로
const teamsLast = () => { try { return localStorage.getItem(TEAMS_LAST) || ""; } catch { return ""; } };
const OFFICE_LAST = "nm-office-last";   // 마지막에 본 사무실 대화(이 기기) = 팀즈에서 정원 탭 누르면 왼쪽이 그리로(형 11-13 12:43 봄 옮김 「그리고 팀즈에서 다시 정원을 누르면 그 채팅이 뜨게 가능해?」 · 「✓ ③ 둘 다」 · 뎅)
const officeLast = () => { try { return localStorage.getItem(OFFICE_LAST) || ""; } catch { return ""; } };
// 웹 · 화면 탭이 덮는 자리 = 오른쪽 칸(aside.nm-split · SNS · HOT ISSUE · DIGEST)만 · 왼쪽 대화는 그대로 · 칸이 없으면(좁은 판) 옛 자리(몸 전체)
const sideEl = (): HTMLElement | null => document.querySelector<HTMLElement>(".nm-split-root aside.nm-split");   // 오른쪽 칸(접혀 있어도 있음)
const paneHost = (): HTMLElement | null => { const a = sideEl(); return a && a.offsetWidth > 0 ? a : null; };   // 오른쪽 칸이 접힌 화면(서랍 · 뉴스 에디터 · 설정 = 좌우 통합)에선 없음으로 침 = 웹 · 화면 탭이 몸 전체를 덮는 판으로 뜸(구름 11-16 · 형 11:5x 「위에 탭 기존에 만든거는 살아잇어야햐ㅐ」 · 「그 안에서 웹페이지가 구를수잇어야되거든」 — 앞 = 접힌 칸 안에 그려져 Browser 탭을 눌러도 아무것도 안 보였음)

const load = (): TabState => {   // 방 탭은 안 올림(형 11-09 09:29 회의실 「대화 상대가 저기 나올 필요는 없어. 웹과 관련된 내용만 저기 뜨면 될듯.」) = 옛 판에 남은 방 탭도 뺌
  let s: TabState; try { s = tabsLoad(localStorage.getItem(TABS_KEY)); } catch { s = tabsLoad(null); }
  const tabs = s.tabs.filter((t) => t.k !== "room" && t.k !== "co");   // co = 이제 고정 「브라우저」 탭(목록 밖)
  return { tabs, active: s.active === TEAMS || s.active === BROWSER || s.active === MEET || tabs.some((t) => tabKey(t) === s.active) ? s.active : "dash" };
};
const go = (hash: string) => { if (location.hash !== hash) location.hash = hash; };
const loadOrder = (): unknown => { try { return JSON.parse(localStorage.getItem(ORDER_KEY) || "null"); } catch { return null; } };   // 줄 차례(이 기기) · 깨지면 기본 차례
type Drag = { key: string; pid: number; x: number; moved: boolean; left0: number; dx: number; pos: number; el: HTMLElement; raf: number };   // pos = 끄는 탭의 지금 왼쪽(줄 안 · 양 끝에서 멈춤)

export function TabBar({ room, pane }: { room: string; pane: string }) {
  const [s, setS] = useState<TabState>(load);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [coNav, setCoNav] = useState("");   // 웹 탭 「Browser 탭에서 열기」가 넘긴 주소 = 다리 판이 붙으면 그 주소로(./cobrowse-pane.tsx nav)
  useEffect(() => { const h = paneHost(); if (h !== host) setHost(h); });   // 오른쪽 칸이 그려진 뒤 · 다시 그려지면 따라감
  const bar = useRef<HTMLDivElement>(null), drag = useRef<Drag | null>(null);
  const ink = useRef<HTMLElement>(null), inkAt = useRef<{ l: number; r: number } | null>(null), flip = useRef<Map<string, number> | null>(null);   // 고른 자리(잉크) · 끌 때 옆 탭이 미끄러질 앞자리(눈에 보이던 왼쪽 · 화면 좌표)
  const [ord, setOrd] = useState<unknown>(loadOrder);
  const order = stripOrder(ord, STRIP_FIXED, s.tabs.filter((t) => t.k !== "dash").map(tabKey)), orderRef = useRef(order), orderSig = order.join("|");   // 줄 차례 = 고정 넷 + 연 탭(끌어 옮긴 대로 · 형 11-17 09:2x 구름 맥 창 「그 상단에 탭, 끌어서 쓰면 순서를 전환할 수 있게 해줘」)
  orderRef.current = order;
  // 요소는 옮겨 꽂지 않음 = 그려진 차례(dom)는 켤 때 차례 그대로 · 새 탭만 끝에 붙고 · 보이는 차례는 CSS order 값으로만
  //   까닭(11-17 실물 · PC 1440 · 요소 11,883개): 앱 CSS 에 뿌리에 건 :has() 규칙이 있어 요소를 하나 옮겨 꽂기만 해도 꼴 계산이 통째로 다시 돎 = 45 ~ 70ms(끌다 자리 바꾸는 순간마다 멎음) · order 값 바꾸기 = 0.1ms
  //   키보드 Tab 차례 = 켤 때 차례(다시 켜면 옮긴 차례로 맞춰짐) · 화면 판(웹 탭 iframe)도 안 옮김(옮겨 꽂으면 다시 읽힘)
  const dom = useRef<string[]>(order);
  dom.current = [...dom.current.filter((k) => order.includes(k)), ...order.filter((k) => !dom.current.includes(k))];
  useEffect(() => { try { localStorage.setItem(ORDER_KEY, JSON.stringify(orderRef.current)); } catch { /* 저장 못 쓰면 이번 판만 */ } }, [orderSig]);
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
  // 몸 전체를 덮은 웹 · 화면 탭(오른쪽 칸이 접힌 화면)에서 길이 바뀌면(메뉴 줄 누름 등) 덮개를 내리고 정원으로 = 누른 화면이 보이게(구름 11-16 · 앞 = 오른쪽 칸이 있던 화면에서 서랍으로 가면 웹 판이 서랍을 통째로 덮었음) · 오른쪽 칸만 덮는 판은 그대로
  useEffect(() => { const on = () => requestAnimationFrame(() => { if (!paneHost()) setS((x) => (x.active.startsWith("s:") || x.active.startsWith("w:") || x.active === BROWSER || x.active === MEET || x.active === TEAMS ? { ...x, active: "dash" } : x)); }); addEventListener("hashchange", on); return () => removeEventListener("hashchange", on); }, []);
  useEffect(() => { const on = () => setS((x) => ({ ...x, active: BROWSER })); addEventListener(COBROWSE_EVENT, on); return () => removeEventListener(COBROWSE_EVENT, on); }, []);   // 들머리 = openCobrowse()
  useEffect(() => { const on = (e: Event) => { const a = (e as CustomEvent<ScreenTabAsk>).detail; if (a) setS((x) => screenTabAdd(x, a.who, a.url)); }; addEventListener(SCREEN_TAB_EVENT, on); return () => removeEventListener(SCREEN_TAB_EVENT, on); }, []);   // 들머리 = openScreenTab()(프로필 카드 「몸 화면 열기」 · PC) → 「○○ 화면」 탭을 붙이고 고름
  useEffect(() => { const on = (e: Event) => { const u = (e as CustomEvent<{ url?: string }>).detail?.url; if (u) setS((x) => webTabOpen(x, u)); }; addEventListener(WEB_TAB_EVENT, on); return () => removeEventListener(WEB_TAB_EVENT, on); }, []);   // 들머리 = openInApp()(바깥 링크 누름 · window.open) → 그 주소의 웹 탭을 붙이고 고름(형 11-17 「내부에서 무조건 열려야해. 창 내부 탭(브라우저)」)
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
  // 고른 자리 = 탭 줄에 하나뿐인 「잉크」(형 11-14 클라우드 세션 창 「탭구조를 이렇게 부드럽게 적용시킬거고. 모양도 이렇게」 — 탭 영상 f84dc5fc · 달 탭 영상 3162184d 를 프레임마다 봄)
  //   옮겨 갈 때 = 가는 쪽 끝이 먼저(약 140ms) · 뒤쪽 끝이 늦게 따라옴(약 360ms) → 늘어났다 줄어드는 물 같은 움직임(./tab-bar.css data-dir)
  //   끄는 동안 = 탭과 잉크가 손을 바로 따라옴 · 옆 탭은 자리를 바꿀 때 미끄러짐(FLIP 220ms) · 놓으면 제자리로 220ms
  //   프레임(형 11-17 09:3x 같은 영상을 다시 주며 「이걸 최대한 프레임을 살리면돼」): 끄는 동안 = 탭 · 잉크 둘 다 transform 만(자리 계산 0 · 화면 한 장에 한 번) · 옆 탭 · 잉크가 비켜날 때도 transform(눈에 보이던 자리에서 새 자리로)
  useLayoutEffect(() => {
    const el = bar.current, k = ink.current; if (!el || !k) return;
    const on = el.querySelector<HTMLElement>(".nm-tab.on"), d = drag.current?.moved && drag.current.el.isConnected ? drag.current : null;
    if (d) d.el.style.transform = `translate3d(${d.pos - d.el.offsetLeft}px,0,0)`;   // 차례가 바뀌어 자리가 옮겨져도 손 밑 그대로
    const f = flip.current, x0 = f ? el.getBoundingClientRect().left : 0; flip.current = null;
    if (f) for (const t of el.querySelectorAll<HTMLElement>(".nm-tab[data-key]")) {   // 옆 탭 = 보이던 자리에서 새 자리로 미끄러짐
      const was = f.get(t.dataset.key || ""); if (was === undefined || t === d?.el) continue;
      const by = Math.round(was - x0 - t.offsetLeft); if (!by) continue;
      t.style.transition = "none"; t.style.transform = `translate3d(${by}px,0,0)`;
      requestAnimationFrame(() => { t.style.transition = ""; t.style.transform = ""; });
    }
    if (!on) { k.style.opacity = "0"; k.style.transform = ""; inkAt.current = null; return; }
    const l = on.offsetLeft, r = el.clientWidth - l - on.offsetWidth, was = inkAt.current, held = !!d && on === d.el, seen0 = f?.get("__ink");
    k.style.opacity = "1"; inkAt.current = { l, r };
    if (held) { k.dataset.dir = "drag"; k.style.left = `${l}px`; k.style.right = `${r}px`; k.style.transform = `translate3d(${d.pos - l}px,0,0)`; return; }   // 고른 탭을 끄는 중 = 잉크도 손 밑
    if (d && was && was.l !== l && seen0 !== undefined) {   // 다른 탭을 끌어 고른 탭이 비켜남 = 잉크도 그 탭과 같이 미끄러짐
      k.dataset.dir = "flip"; k.style.transition = "none"; k.style.left = `${l}px`; k.style.right = `${r}px`; k.style.transform = `translate3d(${Math.round(seen0 - x0 - l)}px,0,0)`;
      requestAnimationFrame(() => { k.style.transition = ""; k.style.transform = ""; });
      return;
    }
    if (was && was.l === l && was.r === r) return;   // 자리 그대로 = 손 안 댐(놓은 뒤 미끄러지는 중일 수 있음)
    k.dataset.dir = !was ? "none" : l > was.l ? "r" : l < was.l ? "l" : "none";
    k.style.transform = ""; k.style.left = `${l}px`; k.style.right = `${r}px`;
  });
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
  const teamsNew = useTeamsUnread();   // 팀즈 알림 켬/끔 = 탭 위 종(PC) · 설정 「알림 · 구독」(폰 · PC 따로 · 깃 #-032)
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
    else if (t.k === "dash" && pane === "chat" && !sideEl()) go("#/");   // 오른쪽 칸만 덮는 판 = 왼쪽 대화는 그대로(정원 탭 = 오른쪽만 원래 판 · 형 11-12 16:41 「항상 메인으로 다시 오더라」 · 깃)
  };
  const close = (key: string) => {
    const i = order.indexOf(key), closed = tabsClose(s, key), next = s.active === key ? { ...closed, active: order[i + 1] ?? order[i - 1] ?? "dash" } : closed;   // 고른 탭을 닫으면 = 눈에 보이는 오른쪽 → 왼쪽 이웃(줄 차례)
    const t = next.tabs.find((x) => tabKey(x) === next.active);
    setS(next);
    if (next.active !== s.active) { if (t?.k === "room") go(`#/channels/${encodeURIComponent(t.id)}`); else if (next.active === "dash" && pane === "chat" && !sideEl()) go("#/"); }
  };
  const down = (key: string) => (e: RPE<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("button")) return;   // × · 팀즈 종 = 제 단추 일
    const el = e.currentTarget;
    drag.current = { key, pid: e.pointerId, x: e.clientX, moved: false, left0: el.offsetLeft, dx: 0, pos: el.offsetLeft, el, raf: 0 };
    el.setPointerCapture(e.pointerId);
  };
  const step = () => {   // 화면 한 장에 한 번 — 탭 · 잉크를 손 밑으로(transform) · 가운데가 옆 탭 가운데를 넘으면 차례 바꿈
    const d = drag.current, el = bar.current;
    if (!d || !el) return;
    d.raf = 0;
    const tabs = [...el.querySelectorAll<HTMLElement>(".nm-tab[data-key]")].sort((a, b) => +a.style.order - +b.style.order), me = tabs.indexOf(d.el);   // 보이는 차례(order 값)대로
    if (me < 0) return;
    const end = tabs[tabs.length - 1], w = d.el.offsetWidth;
    d.pos = Math.max(tabs[0].offsetLeft, Math.min(end.offsetLeft + end.offsetWidth - w, d.left0 + d.dx));   // 줄 양 끝에서 멈춤(영상)
    d.el.style.transform = `translate3d(${d.pos - d.el.offsetLeft}px,0,0)`;
    const k = ink.current, held = d.el.classList.contains("on");
    if (k && held && inkAt.current) k.style.transform = `translate3d(${d.pos - inkAt.current.l}px,0,0)`;
    const to = dropIndex(tabs.map((t) => [t.offsetLeft, t.offsetWidth] as const), me, d.left0 + d.dx + w / 2);   // 갈 자리 = 손 따라간 가운데(끝에서 멈춘 자리 말고 — 넓은 탭이 끝의 좁은 탭을 못 넘던 것 · 11-17 실물)
    if (to === me) return;
    const seen0 = new Map(tabs.map((t) => [t.dataset.key || "", t.getBoundingClientRect().left]));   // 미끄러지던 중이면 그 보이던 자리부터
    if (k && !held) seen0.set("__ink", k.getBoundingClientRect().left);
    flip.current = seen0;
    const next = stripMove(orderRef.current, d.key, to);
    setOrd(next);
  };
  const move = (e: RPE<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.abs(e.clientX - d.x) < 6) return;
    if (!d.moved) { d.moved = true; d.el.dataset.drag = "1"; if (ink.current && d.el.classList.contains("on")) ink.current.dataset.dir = "drag"; }
    d.dx = e.clientX - d.x;
    if (!d.raf) d.raf = requestAnimationFrame(step);   // 손 신호가 화면보다 잦아도 한 장에 한 번만 그림
  };
  const up = (pickIt: (() => void) | null) => (e: RPE<HTMLDivElement>) => {
    const d = drag.current; drag.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* 이미 놓음 */ }
    if (!d) return;
    if (d.raf) cancelAnimationFrame(d.raf);
    if (!d.moved) { pickIt?.(); return; }
    const el = d.el, k = ink.current;   // 놓음 = 탭 · 잉크가 제자리로 미끄러져 듦(둘 다 transform 220ms)
    delete el.dataset.drag; el.style.transform = "";
    if (k && el.classList.contains("on")) { k.dataset.dir = "drop"; k.style.transform = ""; }
  };
  const pickOn = (key: string) => () => setS((x) => ({ ...x, active: key }));
  const fixedTab: Record<string, { cls: string; title: string; pick: () => void; body: ReactNode }> = {   // 고정 넷(닫기 없음 · 끌어 옮기기는 됨)
    dash: { cls: "dash garden", title: GARDEN, pick: () => pick(DASH), body: <span className="nm-tab-nm">{GARDEN}</span> },   // 지금 판(늘 보임) · 누르면 오른쪽이 원래 판(SNS · HOT ISSUE · DIGEST)으로
    [BROWSER]: { cls: "browser", title: "브라우저(맥 72 · 형 대신 로그인)", pick: pickOn(BROWSER), body: (   // 화면 = 같이 보기 다리 판(맥 72) · 못 닿으면 끼워 넣기 웹 칸(CobrowsePane 안) · 형이 대신 로그인하는 칸
      <><svg className="nm-tab-ic browser" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg><span className="nm-tab-nm">Browser</span></>) },
    [MEET]: { cls: "meet", title: "화상회의(맥 72 화면 + 우리 대화)", pick: pickOn(MEET), body: <><MeetIcon /><span className="nm-tab-nm">화상 회의</span></> },   // 따로 선 들머리(형 11-13 09:21) · 열린 회의 없으면 바로 참여자 고르기
    [TEAMS]: { cls: "teams", title: "팀즈", pick: pickTeams, body: <><TeamsIcon /><span className="nm-tab-nm">Teams</span><TeamsBell />{teamsNew ? <span className="nm-tbadge" aria-label={`새 글 있는 대화 ${teamsNew}`}>{teamsNew > 99 ? "99+" : teamsNew}</span> : null}</> },   // 새 글 = 숫자(형 11-13 10:23 「새로 들어온 글도 여기서 알수있으면 베스트임」)
  };
  const paneTabs = s.tabs.filter((t): t is Extract<Tab, { k: "screen" | "web" | "co" }> => t.k === "screen" || t.k === "web" || t.k === "co");
  const full = s.active === BROWSER || s.active.startsWith("w:");   // 창 전체를 쓰는 탭 = 「Browser」 + 「＋」 웹 탭(형 11-18 09:3x 구름 창 「일반 새탭 열어서 보이는거랑 기본으로 떠잇는 브라우저랑 별건으로 보일 필요는 없어.」 = 둘 다 같은 꼴 · 앞 = 웹 탭만 오른쪽 칸)
  const paneOn = s.active.startsWith("s:") || s.active.startsWith("w:") || s.active === "co" || s.active === MEET || s.active === TEAMS;
  return (
    <>
      <div ref={bar} className="nm-tabs" role="tablist" aria-label="탭 줄">
        <i ref={ink} className="nm-tabs-ink" data-dir="none" aria-hidden />   {/* 고른 자리 = 아래 판과 한 몸인 면 하나(탭마다 바탕을 갖지 않음 → 옮겨 갈 때 미끄러짐) */}
        {dom.current.map((key) => {   // 고정 넷 + 연 탭이 한 줄에서 섞여 옮겨짐 · 보이는 자리 = order 값(줄 차례) · 사이 세로선 = 보이는 앞 탭 기준(data-sep)
          const fx = fixedTab[key], t = fx ? null : s.tabs.find((x) => tabKey(x) === key);
          if (!fx && !t) return null;
          const at = order.indexOf(key), on = s.active === key, sep = at > 0 && !on && order[at - 1] !== s.active, name = fx ? fx.title : nameOf(t!), face = t ? faceOf(t) : "", pickIt = fx ? fx.pick : () => pick(t!);
          return (
            <div key={key} data-key={key} data-sep={sep ? "" : undefined} style={{ order: at }} role="tab" aria-selected={on} tabIndex={0} title={name} className={`nm-tab${fx ? ` ${fx.cls}` : ""}${on ? " on" : ""}`}
              onPointerDown={down(key)} onPointerMove={move} onPointerUp={up(pickIt)} onPointerCancel={up(null)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickIt(); } }}>
              {fx ? fx.body : (
                <>
                  {face ? <FaceImg id={face} size={18} className="nm-tab-ic" /> : <span className="nm-tab-ic dot" aria-hidden />}
                  <span className="nm-tab-nm">{name}</span>
                  <button type="button" className="nm-tab-x" aria-label={`${name} 탭 닫기`} onClick={(e) => { e.stopPropagation(); close(key); }}>×</button>
                </>
              )}
            </div>
          );
        })}
        <button type="button" className="nm-tab-plus" aria-label="새 탭" title="새 탭" onClick={() => setS((x) => tabsAdd(x, webTabNew()))}>+</button>
        {room === "all" && pane === "chat" ? <button type="button" className="nm-tab-cobtn" title="맥 72 화면을 같이 보며 얘기하기" onClick={() => setS((x) => ({ ...x, active: MEET }))}>화상회의</button> : null}   {/* 들머리 = 회의실(봄 13:21 「먼저 회의실」) */}
      </div>
      {paneTabs.length || s.active === TEAMS || s.active === BROWSER || s.active === MEET ? createPortal(
        <div className={`nm-tab-screen${host && !full ? " in-split" : ""}${full ? " full" : ""}`} hidden={!paneOn}>   {/* 「브라우저」 = 오른쪽 칸이 아니라 메뉴 줄 바로 아래 창 전체(형 11-17 09:1x 구름 맥 창 「pc 웹앱에서 브라우저를 열면 한쪽에서만 열리는게 아니라, 창 전체를 써야해. 그러니까 메뉴 바로 아래로 다 창이 펼쳐져야 하거든?」) · 웹 탭 · 몸 화면 · 팀즈 · 화상회의는 오른쪽 칸 그대로(형 11-12 「웹 탭은 오른쪽 칸 안」) */}
          {s.active === BROWSER ? <BrowserPane nav={coNav} onNav={() => setCoNav("")} onClose={() => setS((x) => ({ ...x, active: "dash" }))} /> : null}   {/* 「Browser」 = 「＋」 새 탭과 같은 주소창 웹 칸(형 11-18 09:3x 「그 브라우저 여기 전면에 다른 페이지처럼 보이게해줄래?」 · 「일반 새탭 … 별건으로 보일 필요는 없어.」) · 막는 사이트만 그 자리에서 「맥 72로 열기」 = 다리 판(앞 = 늘 다리 판 · 다리 주소가 없으면 「같이 보기 주소 없음」 한 줄뿐) */}
          {s.active === MEET ? <div className="nm-tab-co"><CobrowsePane mode="meet" onClose={() => setS((x) => ({ ...x, active: "dash" }))} /></div> : null}   {/* 화상회의 = 같은 맥 72 다리 판 + 아래 회의 대화 */}   {/* 보는 동안만 붙음 = 안 보면 다리 쉼 · 다시 고르면 새 표(맥 72 탭은 그대로 = 마지막 웹 화면) */}
          {s.active === TEAMS ? <div className="nm-tab-teams"><TeamsList current={room} /></div> : null}   {/* 팀즈 목록 = 오른쪽 칸 · 누르면 왼쪽 대화만 바뀜 */}
          {paneTabs.filter((t) => seen.has(tabKey(t)) || s.active === tabKey(t)).map((t) => t.k === "co" ? (
            s.active === "co" ? <div key="co" className="nm-tab-co"><CobrowsePane onClose={() => close("co")} /></div> : null   /* 보는 동안만 붙음 = 안 보면 다리 쉼(봄 12:53 「보는 중」 신호) · 다시 고르면 새 표 */
          ) : t.k === "web" ? (
            <div key={tabKey(t)} className="nm-tab-web" hidden={s.active !== tabKey(t)}>
              <WebPane initial={t.url} focus={s.active === tabKey(t)} onClose={() => close(tabKey(t))} onGo={(u) => setS((x) => tabsSetUrl(x, tabKey(t), u))} onBridge={(u) => { try { void navigator.clipboard?.writeText(u); } catch { /* 복사 못 해도 탭은 넘어감 */ } setCoNav(u); setS((x) => ({ ...x, active: BROWSER })); }} />   {/* 막는 사이트 = 창 안 「Browser」 탭(맥 72 진짜 브라우저)으로 넘어가고 그 탭이 그 주소로 감(깃 다리 nm-co-cmd nav · 11-17 13:20) · 주소 복사는 다리가 남 손에 있을 때 붙여 넣으라고 남김 */}   {/* 닫기 = 주소 줄 오른쪽 끝 ×(형 11-12 10:00 「우측에 웹페이지가 열렸을때 이를 닫는게 없어」) · 빈 탭 = 「주소나 검색어를 넣어주세요」 한 줄만(형 10:00 「애들 화면 - 이거는 없어도 돼」 · 몸 화면 바로가기 걷음 · 즐겨찾기는 나중) */}
            </div>
          ) : (
            <ScreenTabPane key={`${tabKey(t)}|${t.url}`} url={t.url} name={nameOf(t)} on={s.active === tabKey(t)} />   /* 몸 화면 탭 = 켤 때 표를 새로 받아 끼움(앞 = 저장된 주소를 그대로 틀에 넣어 표 없는 주소가 들어갔음 · ./screen-tab.tsx · 구름 11-16) */
          ))}
        </div>, (full ? null : host) || document.body) : null}
    </>
  );
}

const BROWSER_LAST = "nm-browser-last";   // 「Browser」 탭이 마지막으로 연 주소(이 기기) = 다시 누르면 그 자리
const browserLast = (): string => { try { return localStorage.getItem(BROWSER_LAST) || ""; } catch { return ""; } };
/** 「Browser」 탭 판 = 웹 칸(「＋」 새 탭과 같은 한 벌) · 막는 사이트 = 그 자리에서 다리 판(맥 72)으로 · 다리에서 닫기 = 웹 칸으로 돌아옴
 *  nav = 다른 웹 탭이 「맥 72로 열기」로 넘긴 주소(오면 바로 다리 판 · 그 주소로) */
function BrowserPane({ nav, onNav, onClose }: { nav: string; onNav: () => void; onClose: () => void }) {
  const [co, setCo] = useState(!!nav), [go, setGo] = useState(nav), last = useRef(browserLast());   // co = 다리 판을 보는 중 · go = 다리에 아직 안 보낸 주소(한 번 보내면 비움 · 앞 판 = 신호마다 다시 보냄) · last = 웹 칸이 마지막으로 연 주소(다리에서 돌아오면 그 자리)
  useEffect(() => { if (nav) { setCo(true); setGo(nav); } }, [nav]);
  if (co) return <div className="nm-tab-co"><CobrowsePane mode="browser" nav={go} onNav={() => { setGo(""); onNav(); }} onClose={() => { setCo(false); setGo(""); onNav(); }} /></div>;
  return (
    <div className="nm-tab-web">
      <WebPane initial={last.current} focus onClose={onClose} onGo={(u) => { last.current = u; try { localStorage.setItem(BROWSER_LAST, u); } catch { /* 이번만 */ } }} onBridge={(u) => { try { void navigator.clipboard?.writeText(u); } catch { /* 복사 못 해도 넘어감 */ } setCo(true); setGo(u); }} />
    </div>
  );
}

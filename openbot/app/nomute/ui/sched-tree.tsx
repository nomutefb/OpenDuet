// 러너 스케줄러 = 노드 트리(형 11-14 클라우드 세션 창 「스케줄러를 중간에 있는 이 형태로 짜서 트리구조로 만들거임」 — 노드 영상 178b5184 을 프레임마다 봄)
//   나무 = 러너 → 갈래 → 포크 → 잡(뒤따름 · 부름은 잡 밑 잡) · 셈은 ./sched-tree-core.ts(순수 · 시험 있음)
//   PC = 판 위에서 끌어 옮김 · 휠 = 옮김 · Ctrl(⌘)+휠 · 단추 = 배율 / 폰 = 위→아래 한 줄 쌓기(판 끌기 없이 그냥 쓸어 내림)
//   노드 = 영상 꼴: 둥근 카드 + 테 · 손 올리면(폰 = 누르면) 테가 진해지고 위에 탭이 올라옴(탭 먼저 180ms → 그림 단추 뒤따라) · 선 = 직각 + 둥근 꺾임
//   실제 반영 = 탭의 「지금 돌리기」 · 「켬끔」 → 바꾸기 판(./runner-sheet.tsx · 서버 POST schedule/runner · 미리 보기 → 적용 · 형만) — 새 서버 길은 안 만듦
import { type CSSProperties, Fragment, type JSX, type PointerEvent as RPE, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CLOCK_KO, HEALTH_KO, type HealthSt, StatusDot, cronKo, stOf, sumOf, whenOf, worstOf } from "./sched-bits";
import { type RunnerJob, type SchedRunners, nextShort } from "./settings-extra";
import { type Review, ReviewBadge } from "./sched-review";
import { ghJob, modelKo } from "./sched-flow-core";
import { type BotSide, PLACE_DOWN, ROOMISH_RE, type TNode, type TRoutine, edgeMid, edgePath, openOf, edgeWidth, fitOf, perDay, railPath, treeOf, zoomAt } from "./sched-tree-core";
import { callerName, hookPlace, wakeRows, wakeState } from "./sched-wake";   // 깨우는 길 = 용건 · 누가 · 언제(형 11-17 01:1x)
import { FaceImg } from "./faces";   // 봇 가지 = 그 봇 얼굴(영상의 사람 카드 꼴)
import { RunnerSheet } from "./runner-sheet";
import "./sched-tree.css";

const RUN_MS = 120_000;
type View = { k: number; x: number; y: number };
const I = {   // 탭 그림 단추(선 그림 · 14)
  run: <path d="M7 5.5v13l11-6.5z" />, power: <><path d="M12 4v7" /><path d="M7.5 7.2a7 7 0 1 0 9 0" /></>, copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2.5" /><path d="M5 15.5V7a2.5 2.5 0 0 1 2.5-2.5H15" /></>,
  plus: <path d="M12 5.5v13M5.5 12h13" />, more: <><circle cx="6" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="18" cy="12" r="1.3" /></>, check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};
/** 가지 카드 왼쪽 그림 칸(형 11-15 접근 지도 영상 = 카드마다 왼쪽에 둥근 네모 그림) — 갈래마다 한 가지 그림 · 봇 가지는 그 봇 얼굴 */
const TILE: Record<string, JSX.Element> = {
  bot: <><rect x="5" y="8" width="14" height="10" rx="3" /><path d="M12 8V5M9.5 12.5v1.5M14.5 12.5v1.5" /></>,
  run: <><path d="M5.5 11a6.5 6.5 0 0 1 11.4-3.6L18.5 9" /><path d="M18.5 5v4h-4" /><path d="M18.5 13a6.5 6.5 0 0 1-11.4 3.6L5.5 15" /><path d="M5.5 19v-4h4" /></>,
  bell: <><path d="M7 16.5V11a5 5 0 0 1 10 0v5.5" /><path d="M5.5 16.5h13M10.5 19.5h3" /></>,
  collect: <><path d="M12 4.5v9.5M8 10.5l4 4 4-4" /><path d="M5 16.5v2h14v-2" /></>,
  make: <><path d="M5.5 18.5 15 9" /><path d="M16 4.5v3M14.5 6h3M19 10v2.4M17.8 11.2h2.4M11 4.8v1.6" /></>,
  guard: <path d="M12 4.5 18 7v4.6c0 3.6-2.4 6.3-6 7.9-3.6-1.6-6-4.3-6-7.9V7z" />,
  code: <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />,
  machine: <><rect x="7.5" y="7.5" width="9" height="9" rx="2" /><path d="M10 4.5v3M14 4.5v3M10 16.5v3M14 16.5v3M4.5 10h3M4.5 14h3M16.5 10h3M16.5 14h3" /></>,
  fork: <><circle cx="7" cy="6.5" r="2" /><circle cx="17" cy="6.5" r="2" /><circle cx="12" cy="17.5" r="2" /><path d="M7 8.5c0 3.5 5 3 5 7M17 8.5c0 3.5-5 3-5 7" /></>,
};
const tileOf = (n: TNode): string => (n.id === "g:bot" ? "bot" : n.id === "g:run" ? "run" : n.id === "bb:~room" ? "bell" : n.id.startsWith("bb:") ? "face" : n.id.startsWith("g:") && TILE[n.id.slice(2)] ? n.id.slice(2) : "fork");
const Ic = ({ d }: { d: keyof typeof I }) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{I[d]}</svg>;

const HOST_KO: Record<string, string> = { mac: "맥", "win-a": "윈A", eyes: "아이즈", sia: "시아 몸", deng: "뎅 몸", fast: "빠르 몸", neo: "네오 몸" };   // 깃허브 밖 잡이 도는 몸(지도 host)
/** 봇 가지 재료 + 화면이 아는 것(루틴 상태 점 · 켜짐 · 상태 말 · 누름) — 스케줄 화면(./sched-desk.tsx)이 넘김 */
export type BotProp = BotSide & { kindKo?: Record<string, string>; st: (r: TRoutine) => HealthSt; on: (r: TRoutine) => boolean; stKo: Record<string, string>; open: (id: string) => void; openBots: () => void; add?: (bot: string) => void };   // add(bot) = 일 추가 판(그 봇을 골라 둔 채 · "" = 고르기)
type Leaf = { id: string; st: HealthSt; on: boolean; runs: number; next: number };   // 선 · 가지 머리 셈에 쓰는 잎 하나(잡 또는 루틴)
export function SchedTree({ map, review = {}, phone = false, can = false, who, bots }: { map: SchedRunners; review?: Record<string, Review>; phone?: boolean; can?: boolean; who?: (w: string) => string; bots?: BotProp }) {
  const box = useRef<HTMLDivElement>(null), world = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View | null>(null);   // null = 아직 안 맞춤(판 크기를 잰 뒤 처음 한 번 맞춤)
  const [hot, setHot] = useState("");   // 폰 = 누른 노드(탭이 올라온 노드)
  const [sel, setSel] = useState<{ job: RunnerJob; start?: "run" | "toggle" } | null>(null);
  const [ran, setRan] = useState<Record<string, number>>({}), [copied, setCopied] = useState("");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(t); }, []);
  useLayoutEffect(() => {
    const el = box.current; if (!el) return undefined;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el); setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);
  const tree = useMemo(() => treeOf(map, open, phone ? size.w : 0, bots), [map, open, phone, size.w, bots]);
  const by = useMemo(() => new Map(tree.nodes.map((n) => [n.id, n])), [tree]);
  useEffect(() => { if (!phone && !view && size.w > 0) setView(fitOf(tree, size)); }, [phone, view, size, tree]);
  const v = phone ? { k: 1, x: 0, y: 0 } : view || { k: 1, x: 0, y: 0 };
  const forkOn = useCallback((j: RunnerJob) => map.forks.find((f) => f.id === j.fork)?.on !== false, [map]);
  const stJob = (j: RunnerJob) => stOf(j.health, !forkOn(j) || j.on === false);
  // 잎(잡 · 루틴) 한 벌 = 상태 · 켜짐 · 하루 횟수 · 다음 시각 — 가지 머리 점 · 선의 뜻 · 「다음 차례」가 다 여기서
  const leafJ = (j: RunnerJob): Leaf => ({ id: j.id, st: stJob(j), on: j.on !== false && forkOn(j), runs: perDay(j), next: j.health?.next_at || 0 });
  const leafR = (r: TRoutine): Leaf => ({ id: `r:${r.id}`, st: bots!.st(r), on: bots!.on(r), runs: perDay({ cron_kst: r.cron }), next: r.health?.next_at || 0 });
  const leaves = useMemo(() => [...map.jobs.map(leafJ), ...(bots ? bots.routines.map(leafR) : [])], [map, bots, forkOn]);   // eslint-disable-line react-hooks/exhaustive-deps
  const place = bots ? hookPlace(bots.routines) : "";   // 호출 열쇠 자리 = 다 같은 글이면 화면에 한 번만(카드마다 되풀이하던 줄 걷음 · 형 11-17 01:1x 「개선점 너가 말한거 반영해줘」)
  const soon = useMemo(() => leaves.filter((l) => l.on && l.next > now).sort((a, b) => a.next - b.next)[0]?.id || "", [leaves, now]);
  const under = (n: TNode): Leaf[] => {   // 그 노드 밑에 달린 잎 전부(접혀 있어도 셈)
    if (n.kind === "root") return leaves;
    if (n.kind === "routine") return [leafR(n.routine!)];
    if (n.kind === "group") return n.id === "g:bot" ? (bots ? bots.routines.map(leafR) : []) : map.jobs.map(leafJ);   // 줄기 둘 = 봇에게 시킨 일 · 자동으로 도는 일
    if (n.kind === "fork") {   // 둘째 층 = 봇 하나(bb:봇) · 대화방 알림(bb:~room) · 러너 갈래(g:갈래)
      if (n.id.startsWith("bb:")) { const b = n.id.slice(3); return (bots ? bots.routines : []).filter((r) => (b === "~room" ? ROOMISH_RE.test(r.id) : r.bot === b && !ROOMISH_RE.test(r.id))).map(leafR); }
      const fs = new Set(map.forks.filter((f) => f.group === n.id.slice(2)).map((f) => f.id));
      return map.jobs.filter((j) => fs.has(j.fork)).map(leafJ);
    }
    const out: Leaf[] = [leafJ(n.job!)], walk = (id: string) => { for (const c of tree.nodes) if (c.parent === id && c.job) { out.push(leafJ(c.job)); walk(c.id); } };
    walk(n.id); return out;
  };
  // 선의 뜻 = 색(그 가지 상태) · 굵기(그 가지가 하루에 도는 횟수) · 라임(다음 차례로 가는 길)
  const edgeOf = (to: TNode) => {
    const ls = under(to), on = ls.filter((l) => l.on);
    const runs = on.reduce((a, l) => a + l.runs, 0);
    return { st: worstOf(sumOf(ls.map((l) => l.st))), w: edgeWidth(runs), runs, next: !!soon && ls.some((l) => l.id === soon), off: !on.length };
  };
  const stsUnder = (n: TNode) => under(n).map((l) => l.st);

  // 판 끌기(PC) — 끄는 동안은 style 만 바꾸고 놓을 때 상태에 적음(다시 그리기 0)
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const paint = (nv: View) => { if (world.current) world.current.style.transform = `translate(${nv.x}px, ${nv.y}px) scale(${nv.k})`; if (box.current) { box.current.style.setProperty("--gx", `${nv.x}px`); box.current.style.setProperty("--gy", `${nv.y}px`); } };   // 바탕 점 격자도 같이 밀림
  const down = (e: RPE<HTMLDivElement>) => {
    if (phone || e.button !== 0 || (e.target as HTMLElement).closest(".nm-tree-node, .nm-tree-zoom, .nm-tree-more")) return;
    drag.current = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId); setHot(""); e.currentTarget.dataset.drag = "1";
  };
  const move = (e: RPE<HTMLDivElement>) => {
    const d = drag.current; if (!d) return;
    d.moved = true; paint({ k: v.k, x: d.vx + e.clientX - d.x, y: d.vy + e.clientY - d.y });
  };
  const up = (e: RPE<HTMLDivElement>) => {
    const d = drag.current; drag.current = null; delete e.currentTarget.dataset.drag; if (!d) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* 이미 놓음 */ }
    if (d.moved) setView({ k: v.k, x: d.vx + e.clientX - d.x, y: d.vy + e.clientY - d.y });
  };
  useEffect(() => {   // 휠 = 옮김 · Ctrl(⌘)+휠 = 손 밑 점 기준 배율(passive 아님 = 페이지가 같이 안 밀림)
    const el = box.current; if (!el || phone) return undefined;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((cur) => {
        const c = cur || { k: 1, x: 0, y: 0 };
        if (e.ctrlKey || e.metaKey) { const r = el.getBoundingClientRect(); return zoomAt(c, c.k * (e.deltaY < 0 ? 1.1 : 1 / 1.1), e.clientX - r.left, e.clientY - r.top); }
        return { k: c.k, x: c.x - e.deltaX, y: c.y - e.deltaY };
      });
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [phone]);
  const zoom = (f: number) => setView((c) => zoomAt(c || { k: 1, x: 0, y: 0 }, (c?.k || 1) * f, size.w / 2, size.h / 2));
  const toggle = (id: string, kind: TNode["kind"]) => {   // 펼침 · 접힘 = 누른 노드는 화면 제자리(나무가 다시 놓여도 손 밑에서 안 달아남) · 펼친 자식 줄이 판 밖이면 그만큼만 당김
    const next = { ...open, [id]: !openOf(open, id, kind) };   // 처음 펼침 규칙은 셈(core)과 한 벌
    if (!phone) {
      const a = by.get(id), t2 = treeOf(map, next, 0, bots), b = t2.nodes.find((n) => n.id === id);
      if (a && b) {
        let x = v.x + (a.x - b.x) * v.k, y = v.y + (a.y - b.y) * v.k;
        const kids = t2.nodes.filter((n) => n.parent === id);
        if (kids.length) {
          const right = Math.max(...kids.map((n) => n.x + n.w)) * v.k + x, top = Math.min(...kids.map((n) => n.y)) * v.k + y, bot = Math.max(...kids.map((n) => n.y + n.h)) * v.k + y;
          if (right > size.w - 24) x -= right - (size.w - 24);
          if (bot - top <= size.h - 48) { if (top < 24) y += 24 - top; else if (bot > size.h - 24) y -= bot - (size.h - 24); }
        }
        setView({ k: v.k, x, y });
      }
    }
    setOpen(next);
  };
  const copy = (j: RunnerJob) => { void navigator.clipboard?.writeText(j.file || j.id).then(() => { setCopied(j.id); setTimeout(() => setCopied((c) => (c === j.id ? "" : c)), 1400); }).catch(() => {}); };
  const closeSel = useCallback(() => setSel(null), []);

  // 선 한 벌(그릴 것 · 뜻)을 한 번만 셈 → 선 · 빛 · 선 위 알약이 같이 씀
  const wires = tree.edges.map((e) => { const a = by.get(e.from), b = by.get(e.to); return a && b ? { e, a, b, m: edgeOf(b), i: Math.min(tree.nodes.indexOf(b), 14) } : null; }).filter((x): x is NonNullable<typeof x> => !!x);
  const all = sumOf(leaves.map((l) => l.st)), worst = worstOf(all);
  const soonName = soon ? (soon.startsWith("r:") ? bots?.routines.find((r) => `r:${r.id}` === soon)?.name : map.jobs.find((j) => j.id === soon)?.name) || "" : "", soonAt = leaves.find((l) => l.id === soon)?.next || 0;
  const grid = { "--gx": `${v.x}px`, "--gy": `${v.y}px`, "--gk": v.k } as CSSProperties;

  return (
    <div ref={box} style={grid} className={`nm-tree${phone ? " down" : ""}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} inert={sel ? true : undefined}>
      <div ref={world} className="nm-tree-world" style={{ width: tree.w, height: tree.h, transform: `translate(${v.x}px, ${v.y}px) scale(${v.k})` }}>
        <svg className="nm-tree-edges" width={tree.w} height={tree.h} aria-hidden>
          {wires.map(({ e, a, b, m, i }) => {
            const d = phone ? railPath(a, b) : edgePath(a, b), solid = e.kind !== "calls" && !m.off, lit = solid && !phone && (m.next || m.st === "miss");   // 빛 = 다음 차례로 가는 길 · 놓친 길만(다 흐르면 어지럽고 무거움)
            return (
              <Fragment key={e.k}>
                <path className="w" pathLength={solid ? 1 : undefined} data-solid={solid || undefined} data-kind={e.kind} data-st={m.st} data-next={m.next || undefined} data-off={m.off || undefined} style={{ strokeWidth: m.w, "--i": i } as CSSProperties} d={d} />
                {lit ? <path className="glint" pathLength={1} data-st={m.st} data-next={m.next || undefined} d={d} /> : null}
              </Fragment>
            );
          })}
        </svg>
        {phone ? null : wires.map(({ e, a, b, m }) => (b.kind === "fork" || b.kind === "group") && m.runs >= 1 ? (   // 선 위 알약 = 그 가지가 하루에 도는 횟수(영상 「255 signups」 자리)
          <span key={`l:${e.k}`} className="nm-tree-wlab" data-st={m.st} data-next={m.next || undefined} style={{ transform: `translate(${edgeMid(a, b).x}px, ${edgeMid(a, b).y}px)` }}>하루 {Math.round(m.runs).toLocaleString("ko-KR")}번</span>
        ) : null)}
        {tree.nodes.map((n, i) => {
          const pos = { translate: `${n.x}px ${n.y}px`, width: n.w, height: n.h, "--i": Math.min(i, 14) } as CSSProperties;   // 자리 = translate 속성(transform 아님) — 눌림(scale)이 자리까지 줄여 가지가 위 · 왼쪽으로 튀던 것 고침(앞 = 아래쪽 가지는 마우스로 누르면 손 밑에서 빠져나가 안 열림 · 실물 11-16 = 누름은 가지 · 뗌은 바탕)
          if (n.kind !== "job" && n.kind !== "routine") {
            const sts = stsUnder(n), sum = sumOf(sts), w = worstOf(sum), off = n.fork ? n.fork.on === false : false;
            const more = bots && n.id === "g:bot" ? bots.openBots : null;   // 봇에게 시킨 일 = 봇마다 차단기
            const plus = !bots?.add ? null : n.id === "g:bot" ? () => bots.add!("") : n.id.startsWith("bb:") && n.id !== "bb:~room" ? () => bots.add!(n.id.slice(3)) : null;   // 「+」 = 일 추가(봇 노드에선 그 봇을 골라 둔 채)
            return (
              <Fragment key={n.id}>
              <button type="button" className={`nm-tree-node ${n.kind}`} style={pos} data-st={w} data-off={off || undefined} data-trunk={n.id === "g:bot" ? "bot" : n.id === "g:run" ? "run" : undefined} data-more={more && plus ? "2" : more || plus ? "1" : undefined} data-place={(phone && n.id === "g:bot" && !!place) || undefined} aria-expanded={n.open} title={n.fork?.note || n.name} onClick={() => toggle(n.id, n.kind)}>
                {n.kind === "root" ? null : <span className="nm-tree-ic" data-face={tileOf(n) === "face" || undefined} aria-hidden>{tileOf(n) === "face" ? <FaceImg id={n.name} size={30} /> : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{TILE[tileOf(n)]}</svg>}</span>}
                <span className="nm-tree-tx">
                  <span className="nm-tree-t"><StatusDot st={w} /><b>{n.name}</b></span>
                  {n.kind === "root" ? null : <small>일 {n.kids}개{sum.miss ? <em> · 놓침 {sum.miss}</em> : null}{sum.late ? <i> · 지연 {sum.late}</i> : null}</small>}
                </span>
                <svg className="nm-tree-chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m9 6 6 6-6 6" /></svg>
                {phone && n.id === "g:bot" && place ? <span className="nm-tree-place under">호출 열쇠 자리 = {place}</span> : null}   {/* 폰 = 가지 밑 한 줄(가지 키를 그만큼 키움 · ./sched-tree-core.ts PLACE_DOWN) */}
              </button>
              {more ? <button type="button" className="nm-tree-more" style={{ translate: `${n.x + n.w - 58}px ${n.y + (n.h - (phone && place ? PLACE_DOWN : 0)) / 2 - 14}px` }} aria-label="봇 차단기" title="봇 차단기" onClick={more}><Ic d="more" /></button> : null}
              {plus ? <button type="button" className="nm-tree-more plus" style={{ translate: `${n.x + n.w - (more ? 88 : 58)}px ${n.y + (n.h - (phone && place && n.id === "g:bot" ? PLACE_DOWN : 0)) / 2 - 14}px` }} aria-label={`${n.name}에 일 추가`} title="일 추가" onClick={plus}><Ic d="plus" /></button> : null}   {/* 봇 갈래 = 봇마다 차단기 · 봇 포크 = 포크 차단기 + 공통 내용(봇 목록 탭에 있던 것) */}
              </Fragment>
            );
          }
          if (n.kind === "routine" && bots) {   // 봇 루틴 = 잡과 같은 카드 꼴 · 누르면 바꾸기 판(시간 · 상태 · 할 일 — 스케줄 화면의 진짜 길 그대로)
            const r = n.routine!, st = bots.st(r), live = r.state === "live", whenTxt = r.cron?.length ? cronKo(r.cron) : r.when?.length ? r.when.join(" · ") : "부를 때만";
            if (!ROOMISH_RE.test(r.id)) {   // 봇을 깨우는 일 = 깨우는 길 표(용건 · 누가 부르나 · 언제 따로) · 열쇠 이름 한 줄 · 자리는 화면에 한 번만(.nm-tree-place)
              const ids = bots.ids || [], rows = wakeRows(r, bots.routines, ids, { whenKo: (x) => (x.cron?.length ? cronKo(x.cron) : (x.when || []).join(" · ")), ko: bots.kindKo, jobs: map.jobs }), sched = rows.some((x) => x.sched), title = callerName(r, bots.routines, ids);
              const stTxt = wakeState(st, live && bots.on(r), sched, r.health?.last_at, now, HEALTH_KO);
              return (
                <div key={n.id} className="nm-tree-node job routine wk" style={pos} data-st={st} data-next={soon === n.id || undefined} data-off={!bots.on(r) || undefined}>
                  <button type="button" className="nm-tree-card" aria-label={`${r.who} ${r.name} · ${stTxt} · 바꾸기`} onClick={() => bots.open(r.id)}>
                    <span className="nm-tree-l1"><b title={r.name}><ReviewBadge r={review[r.id]} />{title}</b>{live ? null : <i>{bots.stKo[r.state] || r.state}</i>}</span>
                    {r.hook ? <span className="nm-tree-l2 hook" data-miss={r.hook_ok === false || undefined}><small>열쇠</small><span title={r.hook_ok === false ? `${r.hook} · 서버 환경에 없음` : r.hook}>{r.hook}{r.hook_ok === false ? " · 없음" : ""}</span></span> : null}   {/* 열쇠 = 이 문을 여는 호출 시크릿의 이름(값 0) · hook_ok 거짓 = 서버 환경에 없음 → 붉게 */}
                    <span className="nm-tree-wk" role="table" aria-label="깨우는 길">
                      <span className="h" role="row"><small>용건</small><small>누가</small><small>언제</small></span>
                      {rows.length ? rows.map((x) => (
                        <span key={x.k} className="r" role="row" data-sched={x.sched || undefined}><b title={x.what}>{x.what}</b><span title={x.by || "표에 없음"} data-none={!x.by || undefined}>{x.by || "모름"}</span>{x.sched ? <><i>{perDay({ cron_kst: r.cron, when: (r.when || []).join(" ") }) >= 1 ? `하루 ${Math.round(perDay({ cron_kst: r.cron, when: (r.when || []).join(" ") }))}번` : "정해진 때"}</i><em title={x.when}>{r.health?.next_at ? `다음 ${nextShort(r.health.next_at)} · ` : ""}{x.when}</em></> : <i title={x.when}>{x.when}</i>}</span>
                      )) : <span className="r" role="row"><b data-none>정해진 용건 없음</b><span /><i>부를 때만</i></span>}
                    </span>
                    <span className="nm-tree-l3">{sched || st !== "unknown" ? <StatusDot st={st} /> : null}<span>{stTxt}</span><i className="nm-tree-sw" data-on={live || undefined} aria-hidden /></span>   {/* 부를 때만 도는 일 = 「확인 안 됨」 대신 켜짐 · 꺼짐(고장처럼 읽히던 것) */}
                    {soon === n.id ? <em className="nm-tree-next">다음</em> : null}
                  </button>
                  <i className="nm-tree-port l" aria-hidden />
                </div>
              );
            }
            return (
              <div key={n.id} className="nm-tree-node job routine" style={pos} data-st={st} data-next={soon === n.id || undefined} data-off={!bots.on(r) || undefined}>
                <button type="button" className="nm-tree-card" aria-label={`${r.who} ${r.name} · ${HEALTH_KO[st]} · 바꾸기`} onClick={() => bots.open(r.id)}>
                  <span className="nm-tree-l1"><b title={r.name}><ReviewBadge r={review[r.id]} />{r.name}</b>{live ? null : <i>{bots.stKo[r.state] || r.state}</i>}</span>
                  <span className="nm-tree-l2"><small>언제</small><span title={whenTxt}>{whenTxt}{r.health?.next_at ? ` · 다음 ${nextShort(r.health.next_at)}` : ""}</span></span>
                  <span className="nm-tree-l3"><StatusDot st={st} /><span>{HEALTH_KO[st]}{n.parent === "bb:~room" && r.who ? ` · ${who ? who(r.who) : r.who}` : ""}</span><i className="nm-tree-sw" data-on={live || undefined} aria-hidden /></span>
                  {soon === n.id ? <em className="nm-tree-next">다음</em> : null}
                </button>
                <i className="nm-tree-port l" aria-hidden />
              </div>
            );
          }
          const j = n.job!, st = stJob(j), gh = ghJob(j), [c0] = j.clock || [], run = (ran[j.id] || 0) > now;
          const tag = j.kind === "llm" ? "AI" : c0 ? CLOCK_KO[c0] || c0 : "";
          return (
            <div key={n.id} className="nm-tree-node job" style={pos} data-st={st} data-hot={hot === n.id || undefined} data-out={!gh || undefined} data-next={soon === j.id || undefined} data-off={j.on === false || !forkOn(j) || undefined} data-run={run || undefined} data-via={n.via}>
              <div className="nm-tree-tab" role="toolbar" aria-label={`${j.name} 바꾸기`}>
                <svg className="nm-tree-tabbg" viewBox="0 0 132 22" preserveAspectRatio="none" aria-hidden><path d="M0 22C9 22 10 0 22 0H110C122 0 123 22 132 22Z" /></svg>
                {gh ? <button type="button" title={can ? "지금 돌리기" : "지금 돌리기(형만)"} onClick={() => setSel({ job: j, start: "run" })}><Ic d="run" /></button> : null}   {/* 깃허브 밖 잡 = 눌러도 안 되는 단추는 안 그림(평의회 11-14 「꺼진 단추는 고장처럼 보인다」) · 까닭은 카드에 글로 */}
                {gh ? <button type="button" title={can ? "켬 · 끔" : "켬 · 끔(형만)"} onClick={() => setSel({ job: j, start: "toggle" })}><Ic d="power" /></button> : null}
                <button type="button" title="파일 이름 복사" onClick={() => copy(j)}><Ic d={copied === j.id ? "check" : "copy"} /></button>
                <button type="button" title="자세히" onClick={() => setSel({ job: j })}><Ic d="more" /></button>
              </div>
              <button type="button" className="nm-tree-card" aria-label={`${j.name} · ${HEALTH_KO[st]}`} onClick={() => setSel({ job: j })}>   {/* 폰 = 한 번 누르면 바로 판(큰 단추) · 작은 탭 단추를 두 번째로 누르게 하지 않음 */}
                <span className="nm-tree-l1"><b title={j.name}><ReviewBadge r={review[j.id]} />{j.name}</b>{tag ? <i>{tag}</i> : null}</span>
                <span className="nm-tree-l2"><small>언제</small><span title={whenOf(j)}>{whenOf(j)}{j.health?.next_at ? ` · 다음 ${nextShort(j.health.next_at)}` : ""}</span></span>
                <span className="nm-tree-l3"><StatusDot st={st} /><span>{HEALTH_KO[st]} · {gh ? modelKo(j).replace("LLM 없음", "AI 안 씀") : `${HOST_KO[j.host || ""] || j.host || "그 몸"}에서 돎 · 여기서 못 바꿈`}</span><i className="nm-tree-sw" data-on={j.on !== false || undefined} aria-hidden /></span>
                {soon === j.id ? <em className="nm-tree-next">다음</em> : null}
              </button>
              <i className="nm-tree-port l" aria-hidden /><i className="nm-tree-port r" aria-hidden />
              {n.kids ? <button type="button" className="nm-tree-fold" aria-expanded={n.open} aria-label={`${j.name} 밑 ${n.kids}개 ${n.open ? "접기" : "펼치기"}`} onClick={() => toggle(n.id, n.kind)}>{n.open ? "−" : n.kids}</button> : null}
            </div>
          );
        })}
      </div>
      {phone ? null : (
        <div className="nm-tree-head">
          <p><b>스케줄러</b><small>일 {leaves.length}개{soonName ? ` · 다음 차례 ${soonName}${soonAt ? ` ${nextShort(soonAt)}` : ""}` : ""}{place ? <span className="nm-tree-place"> · 호출 열쇠 자리 = {place}</span> : null}</small></p>
          <span className="nm-tree-badge" data-st={worst}>{all.miss ? `놓침 ${all.miss}` : all.late ? `지연 ${all.late}` : <><Ic d="check" />다 제때 돎</>}</span>
        </div>
      )}
      <p className="nm-tree-key" aria-label="선 읽는 법"><span><i data-k="w" />굵기 = 자주 돎</span><span><i data-k="miss" />놓침</span><span><i data-k="late" />지연</span><span><i data-k="next" />다음 차례</span><span><i data-k="calls" />다른 일이 부름</span></p>
      {phone ? null : (
        <div className="nm-tree-zoom" role="group" aria-label="배율">
          <button type="button" aria-label="작게" onClick={() => zoom(1 / 1.2)}>−</button>
          <button type="button" className="pct" title="다 보이게 맞춤" onClick={() => setView(fitOf(tree, size))}>{Math.round(v.k * 100)}%</button>
          <button type="button" aria-label="크게" onClick={() => zoom(1.2)}>+</button>
        </div>
      )}
      {sel ? <RunnerSheet job={sel.job} start={sel.start} review={review[sel.job.id]} who={who} can={can} phone={phone} onClose={closeSel} onRan={(id) => setRan((r) => ({ ...r, [id]: Date.now() + RUN_MS }))} /> : null}
    </div>
  );
}

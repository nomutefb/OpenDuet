// 러너 스케줄러 = 노드 트리(형 11-14 클라우드 세션 창 「스케줄러를 중간에 있는 이 형태로 짜서 트리구조로 만들거임」 — 노드 영상 178b5184 을 프레임마다 봄)
//   나무 = 러너 → 갈래 → 포크 → 잡(뒤따름 · 부름은 잡 밑 잡) · 셈은 ./sched-tree-core.ts(순수 · 시험 있음)
//   PC = 판 위에서 끌어 옮김 · 휠 = 옮김 · Ctrl(⌘)+휠 · 단추 = 배율 / 폰 = 위→아래 한 줄 쌓기(판 끌기 없이 그냥 쓸어 내림)
//   노드 = 영상 꼴: 둥근 카드 + 테 · 손 올리면(폰 = 누르면) 테가 진해지고 위에 탭이 올라옴(탭 먼저 180ms → 그림 단추 뒤따라) · 선 = 직각 + 둥근 꺾임
//   실제 반영 = 탭의 「지금 돌리기」 · 「켬끔」 → 바꾸기 판(./runner-sheet.tsx · 서버 POST schedule/runner · 미리 보기 → 적용 · 형만) — 새 서버 길은 안 만듦
import { type CSSProperties, type PointerEvent as RPE, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { HEALTH_KO, StatusDot, stOf, sumOf, worstOf } from "./sched-bits";
import { type RunnerJob, type SchedRunners, nextShort } from "./settings-extra";
import { CLOCK_KO, whenOf } from "./sched-runners";
import { type Review, ReviewBadge } from "./sched-review";
import { ghJob, modelKo } from "./sched-flow-core";
import { type TNode, edgePath, edgeWidth, fitOf, perDay, railPath, treeOf, zoomAt } from "./sched-tree-core";
import { RunnerSheet } from "./runner-sheet";
import "./sched-tree.css";

const RUN_MS = 120_000;
type View = { k: number; x: number; y: number };
const I = {   // 탭 그림 단추(선 그림 · 14)
  run: <path d="M7 5.5v13l11-6.5z" />, power: <><path d="M12 4v7" /><path d="M7.5 7.2a7 7 0 1 0 9 0" /></>, copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2.5" /><path d="M5 15.5V7a2.5 2.5 0 0 1 2.5-2.5H15" /></>,
  more: <><circle cx="6" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="18" cy="12" r="1.3" /></>, check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};
const Ic = ({ d }: { d: keyof typeof I }) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{I[d]}</svg>;

const HOST_KO: Record<string, string> = { mac: "맥", "win-a": "윈A", eyes: "아이즈", sia: "시아 몸", deng: "뎅 몸", fast: "빠르 몸", neo: "네오 몸" };   // 깃허브 밖 잡이 도는 몸(지도 host)
export function SchedTree({ map, review = {}, phone = false, can = false, who }: { map: SchedRunners; review?: Record<string, Review>; phone?: boolean; can?: boolean; who?: (w: string) => string }) {
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
  const tree = useMemo(() => treeOf(map, open, phone ? size.w : 0), [map, open, phone, size.w]);
  const by = useMemo(() => new Map(tree.nodes.map((n) => [n.id, n])), [tree]);
  useEffect(() => { if (!phone && !view && size.w > 0) setView(fitOf(tree, size)); }, [phone, view, size, tree]);
  const v = phone ? { k: 1, x: 0, y: 0 } : view || { k: 1, x: 0, y: 0 };
  const forkOn = useCallback((j: RunnerJob) => map.forks.find((f) => f.id === j.fork)?.on !== false, [map]);
  const soon = useMemo(() => map.jobs.filter((j) => j.on !== false && forkOn(j) && (j.health?.next_at || 0) > now).sort((a, b) => (a.health?.next_at || 0) - (b.health?.next_at || 0))[0]?.id || "", [map, forkOn, now]);
  const stJob = (j: RunnerJob) => stOf(j.health, !forkOn(j) || j.on === false);
  const jobsUnder = (n: TNode): RunnerJob[] => {   // 그 노드 밑에 달린 잡 전부(잡이면 자기 + 밑 잡)
    if (n.kind !== "job") return map.jobs.filter((j) => (n.kind === "root" ? true : n.kind === "group" ? map.forks.find((f) => f.id === j.fork)?.group === n.id.slice(2) : j.fork === n.id));
    const out: RunnerJob[] = [n.job!], walk = (id: string) => { for (const c of tree.nodes) if (c.parent === id && c.job) { out.push(c.job); walk(c.id); } };
    walk(n.id); return out;
  };
  // 선의 뜻 = 색(그 가지 상태) · 굵기(그 가지가 하루에 도는 횟수) · 라임(다음 차례로 가는 길)
  const edgeOf = (to: TNode) => {
    const js = jobsUnder(to), on = js.filter((j) => j.on !== false && forkOn(j));
    return { st: worstOf(sumOf(js.map(stJob))), w: edgeWidth(on.reduce((a, j) => a + perDay(j), 0)), next: !!soon && js.some((j) => j.id === soon), off: !on.length };
  };
  const stsUnder = (n: TNode) => map.jobs.filter((j) => (n.kind === "root" ? true : n.kind === "group" ? map.forks.find((f) => f.id === j.fork)?.group === n.id.slice(2) : j.fork === n.id)).map(stJob);

  // 판 끌기(PC) — 끄는 동안은 style 만 바꾸고 놓을 때 상태에 적음(다시 그리기 0)
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const paint = (nv: View) => { if (world.current) world.current.style.transform = `translate(${nv.x}px, ${nv.y}px) scale(${nv.k})`; };
  const down = (e: RPE<HTMLDivElement>) => {
    if (phone || e.button !== 0 || (e.target as HTMLElement).closest(".nm-tree-node, .nm-tree-zoom")) return;
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
    const next = { ...open, [id]: !(open[id] ?? kind !== "fork") };
    if (!phone) {
      const a = by.get(id), t2 = treeOf(map, next, 0), b = t2.nodes.find((n) => n.id === id);
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

  return (
    <div ref={box} className={`nm-tree${phone ? " down" : ""}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} inert={sel ? true : undefined}>
      <div ref={world} className="nm-tree-world" style={{ width: tree.w, height: tree.h, transform: `translate(${v.x}px, ${v.y}px) scale(${v.k})` }}>
        <svg className="nm-tree-edges" width={tree.w} height={tree.h} aria-hidden>
          {tree.edges.map((e) => { const a = by.get(e.from), b = by.get(e.to); if (!a || !b) return null; const m = edgeOf(b); return <path key={e.k} data-kind={e.kind} data-st={m.st} data-next={m.next || undefined} data-off={m.off || undefined} style={{ strokeWidth: m.w }} d={phone ? railPath(a, b) : edgePath(a, b)} />; })}
        </svg>
        {tree.nodes.map((n, i) => {
          const pos = { transform: `translate(${n.x}px, ${n.y}px)`, width: n.w, height: n.h, "--i": Math.min(i, 14) } as CSSProperties;
          if (n.kind !== "job") {
            const sts = stsUnder(n), sum = sumOf(sts), w = worstOf(sum), off = n.fork ? n.fork.on === false : false;
            return (
              <button key={n.id} type="button" className={`nm-tree-node ${n.kind}`} style={pos} data-st={w} data-off={off || undefined} aria-expanded={n.open} title={n.fork?.note || n.name} onClick={() => toggle(n.id, n.kind)}>
                <span className="nm-tree-t"><StatusDot st={w} /><b>{n.name}</b></span>
                {n.kind === "root" ? null : <small>꼬챙이 {n.kids}{sum.miss ? <em> · 놓침 {sum.miss}</em> : null}{sum.late ? <i> · 지연 {sum.late}</i> : null}</small>}
                <svg className="nm-tree-chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m9 6 6 6-6 6" /></svg>
              </button>
            );
          }
          const j = n.job!, st = stJob(j), gh = ghJob(j), [c0] = j.clock || [], run = (ran[j.id] || 0) > now;
          const tag = j.kind === "llm" ? "LLM" : c0 ? CLOCK_KO[c0] || c0 : "";
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
                <span className="nm-tree-l3"><StatusDot st={st} /><span>{HEALTH_KO[st]} · {gh ? modelKo(j) : `${HOST_KO[j.host || ""] || j.host || "그 몸"}에서 돎 · 여기서 못 바꿈`}</span><i className="nm-tree-sw" data-on={j.on !== false || undefined} aria-hidden /></span>
                {soon === j.id ? <em className="nm-tree-next">다음</em> : null}
              </button>
              <i className="nm-tree-port l" aria-hidden /><i className="nm-tree-port r" aria-hidden />
              {n.kids ? <button type="button" className="nm-tree-fold" aria-expanded={n.open} aria-label={`${j.name} 밑 ${n.kids}개 ${n.open ? "접기" : "펼치기"}`} onClick={() => toggle(n.id, n.kind)}>{n.open ? "−" : n.kids}</button> : null}
            </div>
          );
        })}
      </div>
      <p className="nm-tree-key" aria-label="선 읽는 법"><span><i data-k="w" />굵기 = 자주 돎</span><span><i data-k="miss" />놓침</span><span><i data-k="late" />지연</span><span><i data-k="next" />다음 차례</span><span><i data-k="calls" />부름</span></p>
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

// 러너 스케줄 흐름 그림(1단 · PC 만 · 손 SVG · 보기만) — 형 11-09 05:14 임시방 「러너 스케줄러이런식으로 변경」(96984.mp4) · 시아 05:17 기준 ①~⑦ · 봄 배분 19)
//   갈래 탭(지금 트리 group) → 포크 = 묶음 상자(이름 + 켬끔 · 보기만) → 잡 = 블록 세 줄(이름 + 꼬리표 / 언제 · 다음 / 상태 · 모델 · 켬끔) · 선 = 뒤따름(in.after) · 부름(out.calls) 있는 것만(직각선 · 화살표)
//   색 = 앱 테마 토큰(./sched-flow.css · 다크 판 #121314 · 블록 #1e2023 · 글 #e8eae8 · 선 .28) · 라임은 「다음 차례」 블록 테 한 곳만(상태 점 = 차분한 초록 · 켬끔 = 회색 · 시아 06:41 ③) · 블록 위 탭(▷ ⏻ 🔒 ⧉ 🗑) = 2단(시아 ④) · Add block = 3단
//   셈(차례 · 선 · 다른 갈래 칩)은 ./sched-flow-core.ts(순수 · 시험 있음) · 선은 블록이 그려진 뒤 자리를 재서 그림(ResizeObserver · 창 크기) → 줄바꿈돼도 따라감
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Breaker, HEALTH_KO, StatusDot, stOf, sumOf, worstOf } from "./sched-bits";
import { type SchedRunners, nextShort } from "./settings-extra";
import { CLOCK_KO, whenOf } from "./sched-runners";
import { type Review, ReviewBadge } from "./sched-review";
import { type Rect, flowOf, modelKo, routeEdge } from "./sched-flow-core";
import "./sched-flow.css";

type Line = { k: string; d: string; title: string };

export function SchedFlow({ map, group, go, review = {} }: { map: SchedRunners; group: string; go: (group: string) => void; review?: Record<string, Review> }) {
  const [now, setNow] = useState(() => Date.now());   // 「다음」 배지 = 시각이 지나면 표가 새로 안 와도 넘어감(모루 11-09 07:57 · 30초마다 다시 셈)
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(t); }, []);
  const { rows, edges, far, soon } = useMemo(() => flowOf(map, group, now), [map, group, now]);
  const gname = (id: string) => map.groups.find((g) => g.id === id)?.name || id;
  const box = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const draw = useCallback(() => {   // 블록 자리 → 선(길은 routeEdge · 블록 밖 통로만 · 모루 06:36 ①)
    const root = box.current;
    if (!root) return;
    const R = root.getBoundingClientRect();
    const rects = new Map<string, Rect>();
    for (const el of root.querySelectorAll<HTMLElement>("[data-job]")) { const r = el.getBoundingClientRect(); rects.set(el.dataset.job || "", { left: r.left - R.left, right: r.right - R.left, top: r.top - R.top, bottom: r.bottom - R.top }); }
    const out: Line[] = [];
    for (const e of edges) {
      const a = rects.get(e.from.id), b = rects.get(e.to.id);
      if (!a || !b) continue;
      const others = [...rects.entries()].filter(([k]) => k !== e.from.id && k !== e.to.id).map(([, r]) => r);
      out.push({ k: e.k, d: routeEdge(a, b, others), title: `${e.from.name} → ${e.to.name} · ${e.kind === "after" ? "뒤따름" : "부름"}` });
    }
    setLines((old) => (old.length === out.length && old.every((o, i) => o.d === out[i].d && o.k === out[i].k) ? old : out));
  }, [edges]);
  useLayoutEffect(() => {
    draw();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => draw()) : null;
    if (ro && box.current) ro.observe(box.current);
    window.addEventListener("resize", draw);
    return () => { ro?.disconnect(); window.removeEventListener("resize", draw); };
  }, [draw]);
  return (
    <div className="nm-flow" ref={box}>
      <small className="nm-flow-note">1단 = 보기만(블록 위 탭 돌리기 · 켬끔 · 형만 · 복사 · 검토로는 2단) · 선 = 뒤따름·부름 있는 것만 · 라임 테 = 다음 차례</small>   {/* 시아 06:41 ④: 따로 뜬 단추 줄은 어느 블록 것인지 몰라 1단에선 뺌 */}
      {rows.map(({ f, jobs }) => {
        const fOn = f.on !== false, fs = sumOf(jobs.map((j) => stOf(j.health, !fOn || j.on === false)));
        return (
          <section key={f.id} className="nm-flow-fork" data-off={!fOn || undefined} aria-label={f.name}>
            <header className="nm-flow-forkhead">
              <StatusDot st={worstOf(fs)} />
              <b>{f.name}</b>
              <small>{f.note ? `${f.note} · ` : ""}꼬챙이 {jobs.length}{fs.miss ? ` · 놓침 ${fs.miss}` : ""}{fs.late ? ` · 지연 ${fs.late}` : ""}</small>
              <Breaker on={fOn} dim disabled label={`${f.name} 차단기(보기만)`} onFlip={() => {}} />
            </header>
            <div className="nm-flow-row">
              {jobs.map((j) => {
                const st = stOf(j.health, !fOn || j.on === false), fr = far.get(j.id) || [], [c0, ...cRest] = j.clock || [];   // 첫 줄 꼬리표 = 시계 종류 하나만 · 나머지는 셋째 줄 상태 앞(시아 06:41 ① · 뎅 ㉡ 이름 잘림)
                const more = [...cRest.map((c) => <i key={c}>{CLOCK_KO[c] || c}</i>), ...(j.gpu?.length ? [<i key="gpu">GPU</i>] : []), ...(j.kind === "llm" ? [<i key="llm" data-k="llm">LLM</i>] : [])];
                return (
                  <article key={j.id} className="nm-flow-job" data-job={j.id} data-st={st} data-next={soon === j.id || undefined} data-off={j.on === false || undefined}>
                    <div className="nm-flow-l1">
                      <b title={j.name}><ReviewBadge r={review[j.id]} />{j.name}</b>
                      {c0 ? <span className="nm-flow-tags"><i>{CLOCK_KO[c0] || c0}</i></span> : null}
                    </div>
                    <small className="nm-flow-l2">{whenOf(j)}{j.health?.next_at ? ` · 다음 ${nextShort(j.health.next_at)}` : ""}</small>
                    <div className="nm-flow-l3">
                      <small>{more.length ? <span className="nm-flow-tags">{more}</span> : null}<StatusDot st={st} />{HEALTH_KO[st]} · {modelKo(j)}</small>
                      <Breaker on={j.on !== false} dim disabled label={`${j.name} 차단기(보기만)`} onFlip={() => {}} />
                    </div>
                    {soon === j.id ? <em className="nm-flow-next">다음</em> : null}
                    {fr.length ? <div className="nm-flow-far">{fr.map((x) => <button key={`${x.dir}${x.job.id}`} type="button" title={`${gname(x.group)} 갈래로`} onClick={() => go(x.group)}>{x.dir === "out" ? "→ " : "← "}{x.job.name}<i>{gname(x.group)}</i></button>)}</div> : null}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
      {lines.length ? (
        <svg className="nm-flow-lines" aria-hidden>
          <defs><marker id="nm-flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" /></marker></defs>
          {lines.map((l) => <path key={l.k} d={l.d} markerEnd="url(#nm-flow-arrow)"><title>{l.title}</title></path>)}
        </svg>
      ) : null}
    </div>
  );
}

// 활동 칸 = 신호 판(형 11-14 「좋아, 저기에 지금 프사 들어가면 되겠네 … 설명글은 최소화 해주고, 깔끔하게」)
//   얼굴 둘레 고리 = 신호 나이(올 때마다 차오르고 그 사이엔 줄어듦) · 일하는 중 = 고리가 돎 · 멈춤 = 점선 고리 + 색 빠짐
//   그록봇 = 부름 → 받음 → 들어옴 점 셋(간 데까지만 선 · 멈춘 자리는 빈 점) · 상태가 바뀌면 얼굴이 칸에서 칸으로 옮겨 감
//   판정은 서버 것만 읽는다(./activity-view) · 계속 도는 움직임은 회전 · 위치 · 투명도만(./activity-board.css)
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaceImg } from "./faces";
import { agoKo } from "./sched-bits";
import { type ActRow, type Lane, LANES, LANE_KO, causeOf, chainOf, laneOf, logOf, ringDeg, ringFrac } from "./activity-view";
import "./activity-board.css";

const still = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
/** 고리 각도만 다시 셈(5초마다 · 안 보이는 탭은 쉼) */
function useNow(ms: number) {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => { if (!document.hidden) setT(Date.now()); }, ms); return () => clearInterval(id); }, [ms]);
  return t;
}

/** 접힌 머리의 점 격자 = 봇 하나가 점 하나(멈춤이 맨 앞) */
export function ActivityDots({ rows }: { rows: ActRow[] }) {
  const ks = rows.map(laneOf).sort((a, b) => LANES.indexOf(a) - LANES.indexOf(b));
  return <span className="nsb-ab-dots" aria-hidden>{ks.map((k, i) => <i key={i} data-k={k} />)}</span>;
}

export function ActivityBoard({ rows, pick, setPick }: { rows: ActRow[]; pick: string; setPick: (k: string) => void }) {
  const now = useNow(5000), root = useRef<HTMLDivElement>(null);
  const at = useRef(new Map<string, { x: number; y: number; lane: Lane; deg: number; inn: boolean }>()), first = useRef(true);
  const [fresh, setFresh] = useState(true);
  useEffect(() => { const t = setTimeout(() => setFresh(false), 900); return () => clearTimeout(t); }, []);
  const lanes = LANES.map((k) => ({ k, rs: rows.filter((r) => laneOf(r) === k) })).filter((g) => g.rs.length);
  const sig = lanes.map((g) => g.k + ":" + g.rs.map((r) => r.key).join(",")).join("|");

  // 칸이 바뀐 얼굴만 옛 자리에서 새 자리로 옮겨 감 · 바뀐 순간 작은 입자 한 번 · 들어온 순간 체크 한 번
  useLayoutEffect(() => {
    const el = root.current; if (!el) return;
    const box = el.getBoundingClientRect(), quiet = still() || first.current, seen = new Map<string, { x: number; y: number; lane: Lane; deg: number; inn: boolean }>();
    el.querySelectorAll<HTMLElement>("[data-face]").forEach((n) => {
      const key = n.dataset.face || "", r = n.getBoundingClientRect(), p = at.current.get(key);
      const cur = { x: r.left - box.left, y: r.top - box.top, lane: (n.dataset.lane || "rest") as Lane, deg: Number(n.dataset.deg || 0), inn: n.dataset.in === "1" };
      seen.set(key, cur);
      if (!p || quiet) return;
      const dx = p.x - cur.x, dy = p.y - cur.y, av = n.querySelector<HTMLElement>(".nsb-ab-av");
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) n.animate([{ transform: `translate(${dx}px,${dy}px) scale(1.06)` }, { transform: "none" }], { duration: 560, easing: "cubic-bezier(.22,1,.36,1)" });
      if (!av) return;
      const flash = (c: string, ms: number) => { av.classList.remove(c); void av.offsetWidth; av.classList.add(c); setTimeout(() => av.classList.remove(c), ms); };
      if (p.lane !== cur.lane) flash("burst", 520);
      if (cur.inn && !p.inn) flash("tick", 1850);
    });
    at.current = seen; first.current = false;
  });

  const on = rows.find((r) => r.key === pick), onLane = on ? laneOf(on) : "rest", log = on ? logOf(on, onLane) : [];
  if (!rows.length) return <p className="nsb-empty">보고 아직 안 옴</p>;
  return (
    <div className={fresh ? "nsb-ab first" : "nsb-ab"} ref={root} data-sig={sig}>
      {lanes.map(({ k, rs }) => { const anyChain = rs.some((r) => r.step); return (
        <section key={k} className="nsb-ab-lane" data-k={k} aria-label={`${LANE_KO[k]} ${rs.length}`}>
          <h4><b key={rs.length} className="nsb-ab-roll">{rs.length}</b>{LANE_KO[k]}</h4>
          <ul>
            {rs.map((r, i) => {
              const lost = k === "lost", ch = r.step ? chainOf(r.step, lost) : null, deg = k === "ready" ? ringDeg(ringFrac(r, now)) : 180;
              const was = at.current.get(r.key), up = !!was && deg < was.deg - 1;   // 신호가 새로 옴 = 빨리 차오름(지난 그림보다 고리가 늘었을 때만)
              const sub = lost ? causeOf(r) : ch && ch.dots[2] === "live" ? "들어오는 중" : "";
              return (
                <li key={r.key} data-face={r.key} data-lane={k} data-deg={deg} data-in={r.step && r.step.got && r.step.in ? "1" : "0"} data-up={up ? "1" : undefined} style={{ animationDelay: `${i * 40}ms` }}>
                  <button type="button" aria-pressed={pick === r.key} aria-label={[r.name, r.value].filter(Boolean).join(" · ")} title={[r.value, r.note].filter(Boolean).join(" · ")} onClick={() => setPick(pick === r.key ? "" : r.key)}>
                    <span className="nsb-ab-av">
                      <span className="halo" /><span className="trk" /><span className="dash" />
                      <span className="ring"><i className="r"><u style={{ transform: `rotate(${deg}deg)` }} /></i><i className="l"><u style={{ transform: `rotate(${-deg}deg)` }} /></i></span>
                      <span className="orb"><i /><u /></span>
                      <span className="pic"><FaceImg id={r.name} size={k === "rest" ? 34 : 42} /></span>
                    </span>
                    {ch ? <span className="nsb-ab-chain" aria-hidden><i className={`n ${ch.dots[0]}`} /><i className={`l ${ch.segs[0]}`} /><i className={`n ${ch.dots[1]}`} /><i className={`l ${ch.segs[1]}`} /><i className={`n ${ch.dots[2]}`} /></span> : anyChain ? <span className="nsb-ab-chain" aria-hidden /> : null}{/* 같은 칸에 점 셋이 하나라도 있으면 자리를 비워 이름 줄을 맞춤 */}
                    <b>{r.name}</b>
                    {sub ? <small>{sub}</small> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ); })}
      {on ? (
        <div key={on.key + onLane + (on.step ? `${on.step.got}${on.step.in}` : "")} className="nsb-ab-detail">
          <p><b>{on.name}</b> <span>{on.value}</span></p>
          {log.length ? <ol>{log.map((x, i) => <li key={i} data-s={x.s}>{x.text}<time>{x.at ? agoKo(x.at) : ""}</time></li>)}</ol> : on.note ? <p className="note">{on.note}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

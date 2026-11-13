// 화상회의 스케치(형 11-13 06:49 봄 창 「혹시 화면의 특정공간을 스케치할 수 있는 기능이 잇으면 베스트임. 그니까 화면은 그대로인데, 그 위에 스케치할 수 있는 기능. 쓰고지우는 화이트보드 개념으로, 근데 그거ㄴ를 우리애들끼리만 볼수잇는거지.」 · 명세 10 · 뜸)
//   우리 판 위 덧그림(맥 72 페이지엔 아무것도 안 감) · 한 장 = 서버 GET/POST together/sketch(‰ · editor _sketch.js) · 봇 = send 「[스케치 rect] …」 같은 한 장
//   자리 = 틀 안 화면 그림 칸(다리가 postMessage 「nm-co-rect」로 알려 줌 · 없으면 틀 전체) · 그 탭 주소가 바뀌면 흐리게(명세 「화면이 넘어가면 흐려지고」)
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { office } from "../data/office";
import { pathOf, skColor, type SkItem } from "./sketch-logic";

type Rect = { x: number; y: number; w: number; h: number; url?: string };

export function SketchLayer({ frame }: { frame: React.RefObject<HTMLIFrameElement | null> }) {
  const qc = useQueryClient();
  const items = useQuery({ queryKey: ["nomute", "sketch"], queryFn: () => office<{ items?: SkItem[] }>("together/sketch").then((j) => j.items || []), refetchInterval: 1500 }).data || [];
  const [rect, setRect] = useState<Rect | null>(null), [on, setOn] = useState(false), [live, setLive] = useState<[number, number][]>([]), [why, setWhy] = useState("");
  const box = useRef<HTMLDivElement>(null), drawing = useRef(false);
  useEffect(() => {   // 다리 판이 알려 주는 화면 그림 칸(틀 안 CSS px · 깃 다리)
    const f = (e: MessageEvent) => {
      const d = e.data as { type?: string } & Partial<Rect>;
      if (!d || d.type !== "nm-co-rect" || e.source !== frame.current?.contentWindow) return;
      if ([d.x, d.y, d.w, d.h].every((v) => Number.isFinite(v)) && (d.w || 0) > 10 && (d.h || 0) > 10) setRect({ x: d.x!, y: d.y!, w: d.w!, h: d.h!, url: typeof d.url === "string" ? d.url : undefined });
    };
    window.addEventListener("message", f);
    return () => window.removeEventListener("message", f);
  }, [frame]);
  const area = rect ? { left: rect.x, top: rect.y, width: rect.w, height: rect.h } : { left: 0, top: 0, width: "100%", height: "100%" };
  const at = (e: React.PointerEvent): [number, number] => { const b = box.current!.getBoundingClientRect(); return [Math.round(((e.clientX - b.left) / b.width) * 1000), Math.round(((e.clientY - b.top) / b.height) * 1000)]; };
  const post = (body: object) => office("together/sketch", { method: "POST", body: JSON.stringify(body) }).then(() => qc.invalidateQueries({ queryKey: ["nomute", "sketch"] })).catch((e) => setWhy(e instanceof Error ? e.message : "못 그렸어"));
  const down = (e: React.PointerEvent) => { if (!on) return; e.preventDefault(); try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch { /* 잡기 못 해도 그림 */ } drawing.current = true; setLive([at(e)]); };
  const move = (e: React.PointerEvent) => { if (!drawing.current) return; const p = at(e); setLive((l) => (l.length && Math.abs(l[l.length - 1][0] - p[0]) + Math.abs(l[l.length - 1][1] - p[1]) < 4 ? l : [...l, p].slice(0, 400))); };
  const up = () => { if (!drawing.current) return; drawing.current = false; const p = live; setLive([]); if (p.length >= 2) void post({ op: "add", item: { k: "free", p, url: rect?.url } }); };
  const shown = useMemo(() => items.map((it) => ({ it, dim: !!(rect?.url && it.url && it.url !== rect.url) })), [items, rect?.url]);
  return (
    <>
      <div ref={box} className={`nm-sk${on ? " on" : ""}`} style={area} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-hidden={!on}>
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="nm-sk-svg">
          <defs><marker id="nm-sk-arw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke" /></marker></defs>
          {shown.map(({ it, dim }) => <SkShape key={it.id} it={it} dim={dim} />)}
          {live.length > 1 ? <polyline points={live.map((q) => q.join(",")).join(" ")} fill="none" stroke={skColor("형")} strokeWidth={4} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" /> : null}
        </svg>
        {shown.filter(({ it }) => it.text).map(({ it, dim }) => { const [x, y] = labelAt(it); return <span key={it.id} className="nm-sk-lbl" style={{ left: `${x / 10}%`, top: `${y / 10}%`, borderColor: skColor(it.who), opacity: dim ? 0.35 : 1 }}><b style={{ color: skColor(it.who) }}>{it.who}</b> {it.text}</span>; })}
      </div>
      <div className="nm-sk-bar" role="toolbar" aria-label="스케치">
        <button type="button" className={on ? "on" : ""} aria-pressed={on} onClick={() => setOn((v) => !v)} title={on ? "그리기 끄기(화면 손으로 돌아감)" : "화면 위에 그리기(우리끼리만 보임)"}>✎ 스케치</button>
        {on ? <button type="button" onClick={() => void post({ op: "undo" })} title="내 마지막 하나 지우기">↶</button> : null}
        {items.length ? <button type="button" onClick={() => void post({ op: "clear" })} title="다 지우기">지우기</button> : null}
        {why ? <small role="alert" onClick={() => setWhy("")}>{why}</small> : null}
      </div>
    </>
  );
}

function labelAt(it: SkItem): [number, number] {
  if (it.k === "free" && it.p?.length) return it.p[it.p.length - 1];
  if (it.k === "arrow") return [it.x2 ?? 0, it.y2 ?? 0];
  if (it.k === "circle") return [(it.x ?? 0) + (it.r ?? 0), (it.y ?? 0) - (it.r ?? 0)];
  return [it.x ?? 0, (it.k === "rect" ? (it.y ?? 0) + (it.h ?? 0) : it.y ?? 0)];
}

function SkShape({ it, dim }: { it: SkItem; dim: boolean }) {
  const c = skColor(it.who), common = { fill: "none", stroke: c, strokeWidth: 3, vectorEffect: "non-scaling-stroke" as const, opacity: dim ? 0.35 : 1, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (it.k === "text") return null;   // 글 = 아래 이름표로
  if (it.k === "circle") return <ellipse cx={it.x} cy={it.y} rx={it.r} ry={it.r} {...common} />;   // ‰ 칸이 납작해도 같은 % 둘레(봇 좌표와 같은 셈)
  if (it.k === "rect") return <rect x={it.x} y={it.y} width={it.w} height={it.h} rx={4} {...common} />;
  return <path d={pathOf(it)} markerEnd={it.k === "arrow" ? "url(#nm-sk-arw)" : undefined} {...common} />;
}

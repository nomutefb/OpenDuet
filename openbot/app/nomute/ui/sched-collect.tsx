// 스케줄 배선의 「수집」 카드 — 옛 러너 층 「④ 시간축 · 수집」과 「자세히」의 수집 상태 · 수집 색인을 일이 도는 자리로
//   형 11-19 「시간축 수집도 > 스케줄러에 귀속시키면됨」 · 「자세히 칸 목록안에잇는거 모든거를 그냥 다 위에 다 반복안되게 귀속시켜」
//   구역 칩(경향+커뮤니티 · X 수집 · RSS) → 누르면 그 구역 수집처(점 + 이름 · 안 된 곳 먼저) + 지금 수집된 목록
//   시간축 = 40분 판의 단계(한 줄 = 시각 · 불 · 단계 → 누르면 그 단계의 기준 · 양 · 보냄 → 받음 · 못 깨면) · 옆으로 긴 표 대신 접는 줄
//   썸네일 기준 = 바로 아래 「그림」 카드(AI 썸네일 옵션)가 같은 값 → 여기선 안 그림(되풀이 0)
//   자료 = GET status(./status-q.ts · 러너 층과 같은 답 · 한 번만 받음) · 수집 목록 = GET /api/trends?f=board(구역을 눌렀을 때만)
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { HEALTH_KO, StatusDot, agoKo, cronKo } from "./sched-bits";
import { Fold } from "./sched-extra";
import { type StatusRow, catRows, count, statusOpts, worst } from "./status-q";
import "./trend.css";   // 수집 목록 = 옛 피드 꼴(SNS 전체와 같은 줄)

const ZONES = ["경향+커뮤니티", "X 수집", "RSS"];
type Board = { at?: number; zones: { id: string; name: string; group: string; at?: number; ok?: boolean; n?: number; items: { rank?: number; title: string; url?: string; src?: string; metric?: number | string; at?: number }[] }[] };
type IndexRow = StatusRow & { t?: number; step?: string; algo?: string; stale_min?: number; amount?: string; sender?: string; receiver?: string; runner?: string; file?: string; evidence?: string; backup?: string; on_fail?: string };
const mmss = (t?: number) => (t === undefined || t === null ? "" : `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
const RANK: Record<string, number> = { miss: 0, late: 1, unknown: 2, ok: 3, off: 4 };

function ZoneItems({ zone }: { zone: string }) {   // 그 구역에 지금 수집된 목록(빠르 GET /api/trends?f=board · 형 「수집되는 구역별로 다 나와야함」)
  const q = useQuery({ queryKey: ["nomute", "trend-board"], queryFn: async () => { const r = await fetch("/api/trends?f=board", { cache: "no-store" }); if (!r.ok) throw new Error(String(r.status)); return (await r.json()) as Board; }, staleTime: 60_000, retry: false });
  if (q.isError) return <p className="nm-sc-msg">수집 목록을 못 읽었어 — {(q.error as Error)?.message || "서버 답 없음"}</p>;
  if (!q.data) return <p className="nm-sc-msg">읽는 중…</p>;
  const zs = q.data.zones.filter((z) => z.group === zone || (zone === "X 수집" && z.group === "X"));
  return (
    <div className="yeta-set nm-trend nm-sc-items">
      {zs.map((z) => (
        <details key={z.id} className="ts" data-st={z.ok === false ? "miss" : undefined}>
          <summary className="ts-h"><span className="ts-l"><StatusDot st={z.ok === false ? "miss" : z.ok ? "ok" : "unknown"} />{z.name}</span><span className="ts-u">{z.at ? agoKo(z.at) : ""}</span><span className="ts-n">{z.n ?? z.items.length}</span></summary>
          {z.items.length ? z.items.map((it, i) => (
            <a key={i} className="tr-row" href={it.url || undefined} target="_blank" rel="noopener"><span className="rk">{it.rank ?? i + 1}</span><span className="q">{it.title}</span>{it.metric !== undefined ? <span className="tf">{it.metric}</span> : null}<span className="tm">{it.at ? agoKo(it.at) : ""}</span></a>
          )) : <p className="nm-sc-msg">{z.ok === false ? "멈춤 — 새로 들어온 게 없어" : "비어 있음"}</p>}
        </details>
      ))}
    </div>
  );
}

/** 수집 — 머리 = 된 곳 / 전체 · 안 된 곳이 있으면 열려서 뜸 */
export function CollectLog() {
  const d = useQuery(statusOpts()).data;
  const col = catRows(d, "collect"), idx = catRows(d, "collect_index") as IndexRow[];
  const [zone, setZone] = useState(""), [time, setTime] = useState(false), [step, setStep] = useState("");
  if (!col.length && !idx.length) return null;
  const zs = [...ZONES.filter((z) => col.some((r) => r.zone === z)), ...(col.some((r) => !ZONES.includes(r.zone || "")) ? ["기타"] : [])];
  const of = (z: string) => col.filter((r) => (z === "기타" ? !ZONES.includes(r.zone || "") : r.zone === z));
  const bad = count(col, "miss"), ok = count(col, "ok");
  const steps = [...idx].sort((a, b) => (a.t ?? 1e9) - (b.t ?? 1e9));
  return (
    <Fold title="수집" sub={bad ? `안 됨 ${bad}` : `${ok}/${col.length}`} tone={bad ? "bad" : undefined} auto={!!bad}>
      <div className="nm-sc">
        <div className="zones">
          {zs.map((z) => { const rs = of(z), w = worst(rs); return <button key={z} type="button" className="nm-sched-chip" data-st={w} aria-pressed={zone === z} onClick={() => setZone(zone === z ? "" : z)}><StatusDot st={w} />{z}<em>{count(rs, "ok")}/{rs.length}</em></button>; })}
          {steps.length ? <button type="button" className="nm-sched-chip" aria-pressed={time} onClick={() => setTime(!time)}>시간축<em>{steps.length}</em></button> : null}
        </div>
        {zone ? (
          <>
            <p className="srcs">{[...of(zone)].sort((a, b) => RANK[a.st] - RANK[b.st]).map((r) => <span key={r.key} data-st={r.st} title={[r.name, r.value, r.when || cronKo(r.cron), r.last_at ? agoKo(r.last_at) : "", r.note].filter(Boolean).join(" · ")}><StatusDot st={r.st} />{r.name.replace(/^경향 · /, "")}</span>)}</p>
            <ZoneItems zone={zone} />
          </>
        ) : null}
        {time ? (
          <ol className="time">
            {steps.map((r, i) => { const k = r.key || String(i), open = step === k; return (
              <li key={k} data-st={r.st}>
                <button type="button" aria-expanded={open} onClick={() => setStep(open ? "" : k)}><span className="t">{mmss(r.t)}</span><StatusDot st={r.st} /><b>{r.step || r.name}</b></button>
                {open ? <dl>{([["기준", r.algo], ["양", r.amount], ["보냄 → 받음", [r.sender, r.receiver].filter(Boolean).join(" → ")], ["러너 · 몸", r.runner], ["파일", r.file], ["근거", r.evidence], ["백업", r.backup], ["못 깨면", r.on_fail], ["낡음", r.stale_min !== undefined ? `${r.stale_min}분` : ""], ["상태", r.st === "ok" ? "" : [HEALTH_KO[r.st], r.note].filter(Boolean).join(" · ")]] as [string, string | undefined][]).filter(([, v]) => v).map(([n, v]) => <div key={n}><dt>{n}</dt><dd>{v}</dd></div>)}</dl> : null}
              </li>
            ); })}
          </ol>
        ) : null}
      </div>
    </Fold>
  );
}

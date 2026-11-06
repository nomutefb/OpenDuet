// 맨 아래 상태 한 줄(형 11-06 17:20 대시보드 방 「엔터프라이즈급」 · 봄 나눔 ④ · 빠르) — 자료 = GET status 의 line(서버 lineOf · 봄)
//   왼쪽 신호등 수 · 가운데 서버 불 · 몸 살아 있음/전체(끊긴 몸 이름 = 툴팁) · 봇 연결/전체 · 오른쪽 「n분 전 동기화」 · 서버 판(editor sha)
//   결 = 위 시계(idle-blind.css .nm-topclock · 흐린 흰 · 숫자 라임) · split 일 때만 맨 아래 26px(shell.tsx · 위 칸은 status-line.css 가 루트 padding-bottom 26)
//   같은 queryKey ["nomute","status"] = 작동 표·몸 줄과 한 번만 부름(60초 · 서버 20초 기억)
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { office } from "../data/office";
import "./status-line.css";

type Line = {
  at?: number;
  ok?: number; warn?: number; bad?: number; off?: number;
  server?: string;
  hosts?: { live?: number; total?: number; stale?: string[] };
  bots?: { ok?: number; total?: number };
  synced_at?: number;
  deploy?: string;
};

function ago(t: number | undefined, now: number): string {
  if (!t) return "—";
  const m = Math.max(0, Math.round((now - t) / 60000));
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}시간 전` : `${Math.round(h / 24)}일 전`;
}

const N = ({ v }: { v?: number }) => <b>{v ?? 0}</b>;
const Sep = () => <i aria-hidden className="nm-sl-sep">·</i>;

export function StatusLine() {
  const q = useQuery({ queryKey: ["nomute", "status"], queryFn: () => office<{ line?: Line; at?: number }>("status"), refetchInterval: 60_000, staleTime: 30_000 });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(t); }, []);
  const l = q.data?.line;
  const stale = l?.hosts?.stale || [];
  return (
    <div role="status" aria-label="작동 상태 한 줄" className="nm-statusline">
      {!l ? (
        <span>{q.isError ? "상태를 못 읽었어요" : q.isSuccess ? "상태 줄 자료가 아직 없어요" : "상태 읽는 중…"}</span>
      ) : (
        <>
          <span title="작동 표 신호등 수">🟢 <N v={l.ok} /> 🟡 <N v={l.warn} /> 🔴 <N v={l.bad} /> ⚪ <N v={l.off} /></span>
          <Sep />
          <span title="서버 연결 칸의 가장 나쁜 불">서버 {l.server || "⚪"}</span>
          <Sep />
          <span title={stale.length ? `끊긴 몸: ${stale.join(", ")}` : "몸 보고 모두 살아 있음"}>몸 <N v={l.hosts?.live} />/{l.hosts?.total ?? 0}</span>
          <Sep />
          <span title="봇 연결">봇 <N v={l.bots?.ok} />/{l.bots?.total ?? 0}</span>
          <span className="nm-sl-fill" />
          <span title={l.synced_at ? new Date(l.synced_at).toLocaleString() : "몸 보고 아직 없음"}>동기화 {ago(l.synced_at, now)}</span>
          {l.deploy ? (<><Sep /><span title="서버 판(editor 커밋)">판 {l.deploy}</span></>) : null}
        </>
      )}
    </div>
  );
}

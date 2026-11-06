// 상태 한 줄 부품(형 11-06 대시보드 방 「엔터프라이즈급」 · 봄 나눔 ④ · 빠르) — 자료 = GET status 의 line(서버 lineOf · 봄)
//   형 22:33 「하단에 정상 인거, 아닌거 보이는건 좋네, 근데 시선이 분산되, 이거 상단으로 보내는게 맞는듯.」 ·
//   22:40 「그리고, 웹앱 버전은 우하단에 위치시켜 . 동기화도 마찬가지. 동기화 00분전 블릿 버전 0000000」
//   → 부품 둘(번개 22:42 「바깥 자리(position)는 부품에 박지 말고 클래스만 줘 — 내가 끼울게」):
//     ⓐ StatusLights = 윗줄용 · 🟢🟡🔴⚪ 수 · 서버 불 · 몸 live/total(끊긴 몸 이름 = 툴팁) · 봇 ok/total · 클래스 nm-sl-lights
//     ⓑ SyncVersion = 우하단용 · 「동기화 00분 전 • 버전 0000000」 · 버전 = 이 화면 판(__NM_SHA__ · ./ver-badge) · 올라간 판(version.json)과 다르면 라임 깜빡임 ·
//        누르면 새 판(뎅 ver-badge 길 그대로) · 서버 판(editor sha)은 툴팁만(뎅 21:44 ② 판 번호 둘 헷갈림) · 클래스 nm-sl-syncver
//        SyncVersion 이 떠 있으면 옛 우상단 판 번호(.nm-ver)는 숨김(html.nm-has-syncver · 뎅 22:40 「지워도 돼 — 우하단 줄이 그 몫」)
//   StatusLine = 둘을 맨 아래 26px 한 줄로 묶은 옛 판(번개가 자리 옮길 때까지 그대로 · 옮기면 shell.tsx 에서 빼면 됨)
//   결 = 위 시계(흐린 흰 · 숫자 라임) · 같은 queryKey ["nomute","status"] = 작동 표·몸 줄과 한 번만 부름(60초 · 서버 20초 기억)
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { office } from "../data/office";
import { onVer, openStale, verState } from "./ver-badge";
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

function useLine() {
  const q = useQuery({ queryKey: ["nomute", "status"], queryFn: () => office<{ line?: Line; at?: number }>("status"), refetchInterval: 60_000, staleTime: 30_000 });
  return { q, l: q.data?.line };
}

function useNow(ms = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}

function useVer() {
  const [v, setV] = useState(verState);
  useEffect(() => onVer(() => setV(verState())), []);
  return v;
}

/** ⓐ 윗줄용 신호등 줄 — 자리(position)는 끼우는 쪽이 클래스로 */
export function StatusLights({ className = "" }: { className?: string }) {
  const { q, l } = useLine();
  const stale = l?.hosts?.stale || [];
  return (
    <div role="status" aria-label="작동 상태" className={`nm-sl-lights ${className}`.trim()}>
      {!l ? (
        <span>{q.isError ? "상태를 못 읽었어요" : q.isSuccess ? "상태 자료가 아직 없어요" : "상태 읽는 중…"}</span>
      ) : (
        <>
          <span title="작동 표 신호등 수">🟢 <N v={l.ok} /> 🟡 <N v={l.warn} /> 🔴 <N v={l.bad} /> ⚪ <N v={l.off} /></span>
          <Sep />
          <span title="서버 연결 칸의 가장 나쁜 불">서버 {l.server || "⚪"}</span>
          <Sep />
          <span title={stale.length ? `끊긴 몸: ${stale.join(", ")}` : "몸 보고 모두 살아 있음"}>몸 <N v={l.hosts?.live} />/{l.hosts?.total ?? 0}</span>
          <Sep />
          <span title="봇 연결">봇 <N v={l.bots?.ok} />/{l.bots?.total ?? 0}</span>
        </>
      )}
    </div>
  );
}

/** ⓑ 우하단용 「동기화 00분 전 • 버전 0000000」 — 자리(position)는 끼우는 쪽이 클래스로 */
export function SyncVersion({ className = "" }: { className?: string }) {
  const { l } = useLine();
  const now = useNow();
  const v = useVer();
  useEffect(() => { const h = document.documentElement; h.classList.add("nm-has-syncver"); return () => { h.classList.remove("nm-has-syncver"); }; }, []);
  const mine = v.mine.sha || "—";
  return (
    <div className={`nm-sl-syncver ${className}`.trim()}>
      <span title={l?.synced_at ? `몸 보고 가장 늦은 때 ${new Date(l.synced_at).toLocaleString()}` : "몸 보고 아직 없음"}>동기화 {ago(l?.synced_at, now)}</span>
      <i aria-hidden className="nm-sl-dot">•</i>
      <button type="button" className={`nm-sl-ver${v.stale ? " stale" : ""}`} onClick={() => { if (v.stale) openStale(); }}
        title={v.stale ? `이 화면 = ${mine} · 올라간 판 = ${v.live.sha || "?"} · 누르면 새 판으로` : `앱 판 ${mine}${l?.deploy ? ` · 서버 판 ${l.deploy}` : ""}`}>
        버전 {v.stale ? `${mine} → ${v.live.sha || "새 판"}` : mine}
      </button>
    </div>
  );
}

/** 옛 판 = 맨 아래 26px 한 줄(ⓐ + ⓑ) · split 일 때만(shell.tsx) — 번개가 자리 옮기면 빠짐 */
export function StatusLine() {
  return (
    <div className="nm-statusline">
      <StatusLights />
      <span className="nm-sl-fill" />
      <SyncVersion />
    </div>
  );
}

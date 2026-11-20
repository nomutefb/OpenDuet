// 1특기 방 「대기열」 알약(형 11-20 11:33 dm-bom 봄 옮김 「그리고, 내가 뉴스 요약 부르면 지금 너 대기열 보이는것처럼, 1특기가 영상 제작이랑 뉴스수집으로 애들한테는 대기열이 목록이 보이게 해줘. (1특기가 영상제작)」 · 시아 12:44 「요약 대기열(/api/pending) → 슈왕 방 · 제작 대기열(/api/jobs) → 뜸 방 · 같은 「대기열」 알약」)
//   꼴 = PM 방 러너맵 알약(./pm-runner-mini.tsx · 같은 css · 같은 자리 = 대화 검색 단추 바로 아래) · 늘 닫힌 채 시작 · 판 밖 누르면 닫힘
//   슈왕(뉴스 수집 · Scoop Hunt) = 요약 대기열 판 그대로(./task-panel.tsx · 요약실 · 뉴스 요약과 같은 자료 · 다시 · 취소 손도 같음)
//   뜸(영상 제작 · Creator) = 제작 대기열(GET /api/jobs · 에디터 카드 · 영상 편집 · 콘티 … 도는 일 · 이름 · 시작 · 지난 분)
//   얼마를 먹나 = 닫힘 = 받아오기 0(방 목록 10분 캐시만) · 열림 = 요약 = 요약실과 같은 캐시 · 제작 = 20초(숨은 탭 멈춤)
import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { office } from "../data/office";
const SumQueue = lazy(() => import("./queue-sum"));   // 요약 판 = 누를 때만 받음(뉴스 요약 조각 · 대화 화면 첫 조각에 안 실음)
import "./pm-runner-mini.css";

type Kind = "sum" | "make";
export const QUEUE_WHO: Record<string, Kind> = { 슈왕: "sum", 뜸: "make" };   // 1특기 = Xd 정보 수집(슈왕) · Xa 사진 · 영상 제작(뜸)(서버 손 표 _roles.js SKILLS · bot-desk-logic ROLE_LONG)
type Room = { id: string; kind?: string; name?: string; with?: string };
/** 방 → 대기열 갈래(그 애 1:1 방만) · 순수(시험 tests/queue-pill.test.ts) */
export function queueKindOf(room: string, rooms: Room[] | undefined): Kind | null {
  const r = (rooms || []).find((x) => x?.id === room);
  if (!r || !(r.kind === "dm" || r.id.startsWith("dm-"))) return null;
  return QUEUE_WHO[r.with || ""] || QUEUE_WHO[r.name || ""] || null;
}

type MakeJob = { id?: string; kind?: string; t0?: number; lbl?: string; out?: string };
const MAKE_LBL: Record<string, string> = {   // 에디터 nm-jobs 이름(./thumb-maker/engine/jobs-sync.ts LBL_OF 그대로)
  thumb: "카드 제작", imgedit: "사진 편집", resize: "비율 맞추기", upscale: "화질 올리기", genimg: "AI 생성", compose: "합성", comp: "합성", thumbredo: "수정", framethumb: "베스트컷 큐레이션",
  edit: "영상 편집", conv: "변환", nb: "미디어 요약", track: "트래킹", k: "프롬프트", song: "음원", voice: "보이스", sb: "콘티", vd: "큐영상", ys: "유튜브",
};
const DAY = 24 * 3600e3;
/** 제작 대기열 줄(하루 안 · 새것 위 · 이름 = 서버 lbl 또는 갈래 이름) · 순수 */
export function makeRows(items: MakeJob[] | undefined, now = Date.now()): { id: string; name: string; t0: number }[] {
  return (items || []).filter((r) => r && r.id && (+(r.t0 || 0) > now - DAY)).map((r) => ({ id: String(r.id), name: (typeof r.lbl === "string" && r.lbl.trim()) ? r.lbl.trim().slice(0, 80) : MAKE_LBL[r.kind || ""] || "제작", t0: +(r.t0 || 0) }))
    .sort((a, b) => b.t0 - a.t0).slice(0, 20);
}
const ago = (t: number, now: number) => { const m = Math.max(0, Math.round((now - t) / 60e3)); return m < 1 ? "방금" : m < 60 ? `${m}분` : `${Math.floor(m / 60)}시간 ${m % 60}분`; };
const hhmm = (t: number) => { const d = new Date(t); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; };
function MakeQueue() {
  const q = useQuery({ queryKey: ["nomute", "make-jobs"], queryFn: () => fetch(`/api/jobs?t=${Date.now()}`, { credentials: "same-origin", cache: "no-store" }).then((r) => (r.ok ? r.json() : { items: [] })).then((d: { items?: MakeJob[] }) => d.items || []), refetchInterval: 20_000, staleTime: 10_000 });
  if (q.isError) return <p className="nm-pmrun-empty">못 읽음</p>;
  if (!q.data) return <p className="nm-pmrun-empty">읽는 중…</p>;
  const now = Date.now(), rows = makeRows(q.data, now);
  if (!rows.length) return <p className="nm-pmrun-empty">비어 있음</p>;
  return (
    <ul className="nm-pmrun-jobs" aria-label="제작 대기열">
      <li className="hd" aria-hidden><span /><span>시작</span><span>일</span><span>지난</span></li>
      {rows.map((j) => <li key={j.id}><span className="mk" aria-hidden>↻</span><b>{hhmm(j.t0)}</b><span className="tt" title={j.name}>{j.name}</span><small>{ago(j.t0, now)}</small></li>)}
    </ul>
  );
}

const LIST = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 6h11M4 12h8M4 18h11" /><circle cx="18.5" cy="14.5" r="3.5" /><path d="M18.5 13v1.6l1 .9" /></svg>;

export function QueuePill({ room }: { room: string }) {
  const rooms = useQuery({ queryKey: ["nomute", "rooms-lite"], queryFn: () => office<{ rooms?: Room[] }>("rooms"), staleTime: 600_000 }).data?.rooms;   // PM 알약과 같은 캐시(10분)
  const kind = queueKindOf(room, rooms);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { setOpen(false); }, [room]);
  useEffect(() => {
    if (!open) return undefined;
    const off = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", off, true);
    return () => document.removeEventListener("pointerdown", off, true);
  }, [open]);
  const [at, setAt] = useState<{ top: number; right: number } | null>(null);   // 자리 = 대화 검색 단추 바로 아래(러너맵 알약과 같은 셈 · 같은 박자)
  useEffect(() => {
    if (!kind) return undefined;
    const fit = () => { const f = document.querySelector<HTMLElement>(".nm-find"); const r = f?.getBoundingClientRect(); setAt(r && r.width ? { top: Math.round(r.bottom + 6), right: Math.round(window.innerWidth - r.right) } : null); };
    fit();
    const t = window.setInterval(fit, 1000);
    window.addEventListener("resize", fit); window.addEventListener("nm-pin-h", fit); window.addEventListener("nm-find-at", fit);   // nm-find-at = 돋보기가 옮긴 그때 같이(./room-search.tsx)
    return () => { window.clearInterval(t); window.removeEventListener("resize", fit); window.removeEventListener("nm-pin-h", fit); window.removeEventListener("nm-find-at", fit); };
  }, [kind]);
  if (!kind) return null;
  const node = (
    <div ref={box} className={`nm-pmrun nm-qpill${open ? " open" : ""}${at ? " docked" : ""}`} style={at ? { top: at.top, right: at.right } : undefined}>
      <div className="nm-pmrun-row"><button type="button" className={`nm-pmrun-h${open ? " on" : ""}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="대기열" title="대기열">{LIST}</button></div>
      {open ? <div className={`nm-pmrun-b${kind === "sum" ? " sum" : ""}`}>{kind === "sum" ? <Suspense fallback={<p className="nm-pmrun-empty">읽는 중…</p>}><SumQueue /></Suspense> : <MakeQueue />}</div> : null}
    </div>
  );
  return at ? createPortal(node, document.body) : node;
}

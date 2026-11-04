// 작동 표 = 메뉴 4번(형 11-05 07:5x 「내가 이거 스케줄표가 문제가 아니라, 지금 이 기능들이 작동하는지가 눈에 안들어오니까 환장하겠더라고.」 ·
//   「기능들이 정상 작동하는지 내가 카테고라이징을 해줄테니까 그걸 한눈에 볼 수 있는 표를 만들어줄수있어? 메뉴4번에? 스케줄러는 메뉴5번 서랍 안으로 넣을게」 · 「대환장하겟음 이게 제일중요할듯」)
//   분류 = 형이 준 차례 그대로(공통/문서/2026-11-05-작동-표/안.md) · 불 = ● 정상 · ▲ 늦음 · ✕ 안 됨(불 들어옴 · 누르면 까닭) · ○ 아직 모름
//   자료 = GET status(뜸 · 몸 보고 + 서버 합침) 가 있으면 그것 · 없으면 지금 있는 GET bots · GET schedule 로 1·2·3 만 채우고 나머지는 「보고 아직 안 옴」 칸
//   일기 = 일곱 × 8단계 격자(형 「일기 정상 작동여부도 프로세스별로 예를들어 7단계면 표를 7단계로 음영칠해. 8x8 이런식. 안되는 부분에 불들어오게」) · SSH = 몸 × 몸 격자
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { office } from "../data/office";
import { type HealthSt, HEALTH_KO, StatusDot, agoKo, cronKo } from "./sched-bits";
import "./sched-status.css";
import "./yeta-settings.css";
import "./trend.css";   // 수집 목록 = 옛 피드 꼴(SNS 전체와 같은 줄)
import "./status-board.css";

type Cell = { st: HealthSt; note?: string };
export type StatusRow = { key: string; name: string; st: HealthSt; last_at?: number; next_at?: number; left_days?: number; value?: string; note?: string; cron?: string[]; zone?: string; cells?: Record<string, Cell> };
export type StatusCat = { id: string; name: string; rows: StatusRow[]; cols?: { id: string; name: string }[]; at?: number };

const HOSTS = ["윈A", "윈B", "맥"], VMS = ["시아", "빠르", "뎅", "누리", "뜸"], BEINGS = ["윈터", "봄", "뜸", "시아", "빠르", "뎅", "누리"];
const DIARY_COLS = [["raw", "원문 뜨기"], ["check", "원문 대조"], ["d40", "40% 일기"], ["d75", "75% 일기"], ["sketch", "습작"], ["end", "넘김 일기"], ["inj2", "2차 주입"], ["wake", "깰 때 넣기"]].map(([id, name]) => ({ id, name }));
const wait = (name: string, key = name): StatusRow => ({ key, name, st: "unknown", note: "보고 아직 안 옴" });
/** 형이 준 분류 · 차례 · 기본 줄(보고가 오면 같은 key 줄을 덮음) */
const SKELETON: StatusCat[] = [
  { id: "bots", name: "봇 연결", rows: [] },
  { id: "server", name: "서버 연결 상태", rows: [] },
  { id: "collect", name: "수집 상태", rows: [] },
  { id: "tok_claude", name: "클로드 토큰 (CLI)", rows: [...HOSTS, ...VMS].map((h) => wait(h)) },
  { id: "tok_grok", name: "그록봇 토큰", rows: [] },
  { id: "tok_gpt", name: "지피티 토큰 (CLI)", rows: [...HOSTS, ...VMS].map((h) => wait(h)) },
  { id: "backup", name: "백업 · G드라이브", rows: HOSTS.map((h) => wait(h)) },
  { id: "hw", name: "하드웨어 연결 · 온도", rows: [...HOSTS, ...VMS.map((v) => `VM ${v}`)].map((h) => wait(h)) },
  { id: "diary", name: "일기 작동", cols: DIARY_COLS, rows: BEINGS.map((b) => ({ ...wait(b), cells: {} })) },
  { id: "ssh", name: "SSH 서로 연결 · 권한", cols: HOSTS.map((h) => ({ id: h, name: `→ ${h}` })), rows: HOSTS.map((h) => ({ ...wait(h), cells: {} })) },
  { id: "docker", name: "도커 · VM 구성", rows: HOSTS.map((h) => wait(h)) },
  // 뉴스 요약 썸네일 기준(형 11-05 08:3x 「극화 on / off + 수량  / 썸넹일 플랫폼」 · 수채화 · 포토 실사 · 만평 같은 칸) = 화풍 넷(thumb_gen.py STYLES · sid webtoon·watercolor·photo·cartoon) × 켜짐·장수·엔진(에디터 설정 「AI 썸네일·이미지」)
  { id: "thumb", name: "뉴스 요약 썸네일 기준", rows: [["webtoon", "극화"], ["watercolor", "수채화"], ["photo", "포토 실사"], ["cartoon", "만평"]].map(([key, name]) => wait(name, key)) },
  // 사무실 통신(형 11-05 08:2x 「사무실 커뮤니케이션 상태 / 열인덱싱: 클로드, 지피티, 그록봇 / 행인덱싱: …」) = 종류 × 봇 무리 격자 · 칸 = 그 무리가 그 종류를 사무실로 보내고 받는지(시험 = 빠르 · 서버 file·photo 길)
  { id: "comm", name: "사무실 커뮤니케이션", cols: [["claude", "클로드"], ["gpt", "지피티"], ["grok", "그록봇"]].map(([id, name]) => ({ id, name })),
    rows: ["텍스트", "사진 원본", "사진 압축본", "영상 원본", "영상 압축본", "영상 해석본", "음성", "음성 전사본", "링크", "파일(웹 관련)", "파일(앱 관련)", "bat 파일 등"].map((t) => ({ ...wait(t), cells: {} })) },
];

// 수집 구역(형 「경향+커뮤니티 / x수집 / rss」 · 빠르 GET trends?f=board 의 group 과 같은 이름) · 러너 줄 → 구역 = 빠르 판 오기 전 임시 맞춤(짐작 · 판 오면 그쪽이 이김)
const ZONE_OF: Record<string, string> = { "wf.x24-collect": "X 수집", "wf.x-count": "X 수집", "wf.chok-x-top10": "X 수집", "wf.sns-trends": "경향+커뮤니티", "wf.social-scan": "경향+커뮤니티", "wf.teum-community": "경향+커뮤니티", "wf.sensor-watch": "경향+커뮤니티", "wf.watchdog": "경향+커뮤니티", "wf.scrape": "RSS" };
const ZONES = ["경향+커뮤니티", "X 수집", "RSS"];
type Job = { id: string; name: string; on?: boolean; cron_kst?: string[]; health?: { st: HealthSt; last_at?: number; next_at?: number } };
type Sched = { runners?: { jobs?: Job[] }; clock_got?: { got?: boolean; beat_at?: number } };
type Bot = { who: string; state: string; why?: string };
type Board = { at?: number; zones: { id: string; name: string; group: string; at?: number; ok?: boolean; n?: number; items: { rank?: number; title: string; url?: string; src?: string; metric?: number | string; at?: number }[] }[] };

const botSt = (s: string): HealthSt => (s === "awake" || s === "asleep" ? "ok" : s === "dead" || s === "down" || s === "error" ? "miss" : "unknown");
const BOT_KO: Record<string, string> = { awake: "깨어 있음", asleep: "자는 중(부르면 깸)", unknown: "모름" };

function fromLocal(s: Sched | undefined, bots: Bot[] | undefined): Record<string, StatusRow[]> {
  const out: Record<string, StatusRow[]> = {};
  if (bots) out.bots = bots.map((b) => ({ key: b.who, name: b.who, st: botSt(b.state), value: BOT_KO[b.state] || b.state, note: b.why }));
  const jobs = s?.runners?.jobs || [];
  const mach = jobs.filter((j) => /nomute-wake|neo-agent|sched-clock/.test(j.id));
  out.server = [
    { key: "api", name: "사무실 서버", st: s ? "ok" : "miss", value: s ? "응답함" : "응답 없음" },
    { key: "clock", name: "봇 시계(윈A)", st: s?.clock_got?.got ? "ok" : "unknown", last_at: s?.clock_got?.beat_at, value: s?.clock_got?.got ? "판 받음" : "" },
    ...mach.map((j) => ({ key: j.id, name: j.name, st: j.on === false ? ("off" as HealthSt) : j.health?.st || "unknown", last_at: j.health?.last_at })),
  ];
  out.collect = jobs.filter((j) => ZONE_OF[j.id]).map((j) => ({ key: j.id, name: j.name, zone: ZONE_OF[j.id], st: j.on === false ? ("off" as HealthSt) : j.health?.st || "unknown", last_at: j.health?.last_at, next_at: j.health?.next_at, cron: j.cron_kst }));
  return out;
}
/** 서버 불(뜸 _status.js = 🟢🟡🔴⚪) → 화면 낱말 · 줄·칸 둘 다 */
const LIGHT: Record<string, HealthSt> = { "🟢": "ok", "🟡": "late", "🔴": "miss", "⚪": "unknown" };
const stIn = (v: unknown): HealthSt => (typeof v === "string" && (LIGHT[v] || (["ok", "late", "miss", "unknown", "off"].includes(v) ? (v as HealthSt) : "unknown"))) || "unknown";
const rowIn = (r: StatusRow & { host?: string }): StatusRow & { host?: string } => ({ ...r, st: stIn(r.st), ...(r.cells ? { cells: Object.fromEntries(Object.entries(r.cells).map(([k, c]) => [k, { ...c, st: stIn(c.st) }])) } : {}) });
const HIDE_BOTS = new Set(["별"]);   // 형 11-05 08:31 「별은 빼면 되고」
/** 뼈대 ← 지금 자료(1·2·3) ← 서버 GET status(있으면) · 격자 = 같은 key 덮음 · 줄 표 = 서버 줄이 이김 + 아직 보고 안 한 몸 자리 줄만 남김 */
function merge(local: Record<string, StatusRow[]>, srv?: StatusCat[]): StatusCat[] {
  return SKELETON.map((c) => {
    const s = srv?.find((x) => x.id === c.id), sr = (s?.rows || []).map(rowIn).filter((r) => !(c.id === "bots" && HIDE_BOTS.has(r.name || r.key)));
    let rows = (local[c.id]?.length ? local[c.id] : c.rows).filter((r) => !(c.id === "bots" && HIDE_BOTS.has(r.key)));
    if (sr.length && c.cols) { const by = new Map(sr.map((r) => [r.key, r])); rows = [...rows.map((r) => by.get(r.key) || r), ...sr.filter((r) => !rows.some((x) => x.key === r.key))]; }
    else if (sr.length) {
      const hosts = new Set(sr.map((r) => String(r.host || r.key.split(":")[0])));
      const left = c.rows.filter((r) => r.note === "보고 아직 안 옴" && !hosts.has(r.key) && !hosts.has(r.key.replace(/^VM /, "")));   // 보고 안 한 몸만 자리 줄로
      rows = [...sr, ...left];
    }
    return { ...c, rows, cols: c.cols, at: s?.at };
  });
}
const worst = (rows: StatusRow[]): HealthSt => { const all = rows.flatMap((r) => [r.st, ...Object.values(r.cells || {}).map((x) => x.st)]); return all.includes("miss") ? "miss" : all.includes("late") ? "late" : all.length && all.every((x) => x === "ok" || x === "off") ? "ok" : "unknown"; };
const count = (rows: StatusRow[], st: HealthSt) => rows.reduce((n, r) => n + (r.st === st ? 1 : 0) + Object.values(r.cells || {}).filter((x) => x.st === st).length, 0);
const daysKo = (d?: number) => (d === undefined ? "" : d < 1 ? `${Math.max(0, Math.round(d * 24))}시간 남음` : `${Math.floor(d)}일 남음`);
const nextKo = (ts?: number) => (ts ? `다음 ${new Date(ts).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })}` : "");

function Grid({ c, pick, setPick }: { c: StatusCat; pick: string; setPick: (k: string) => void }) {
  const cols = c.cols || [];
  return (
    <div className="nsb-grid" style={{ gridTemplateColumns: `minmax(56px, auto) repeat(${cols.length}, minmax(28px, 1fr))` }} role="table" aria-label={c.name}>
      <span role="columnheader" />
      {cols.map((x) => <span key={x.id} role="columnheader" className="nsb-gh">{x.name}</span>)}
      {c.rows.map((r) => (
        <Fragment key={r.key}>
          <span role="rowheader" className="nsb-gr">{r.name}</span>
          {cols.map((x) => {
            const cell = r.cells?.[x.id] || (r.name === x.id.replace(/^→ /, "") ? null : { st: "unknown" as HealthSt, note: r.note });
            const k = `${c.id}:${r.key}:${x.id}`;
            return cell ? <button key={x.id} type="button" role="cell" className={`nsb-cell${pick === k ? " on" : ""}`} data-st={cell.st} aria-label={`${r.name} ${x.name} ${HEALTH_KO[cell.st]}`} onClick={() => setPick(pick === k ? "" : k)} /> : <span key={x.id} role="cell" className="nsb-cell self" aria-hidden />;
          })}
        </Fragment>
      ))}
      {pick.startsWith(`${c.id}:`) ? (() => { const [, rk, ck] = pick.split(":"); const r = c.rows.find((x) => x.key === rk), cell = r?.cells?.[ck]; return <p className="nsb-why">{r?.name} · {cols.find((x) => x.id === ck)?.name} — {HEALTH_KO[cell?.st || "unknown"]}{cell?.note || r?.note ? ` · ${cell?.note || r?.note}` : ""}</p>; })() : null}
    </div>
  );
}

function ZoneItems({ zone }: { zone: string }) {   // 수집 줄 누르면 그 구역 수집 목록(빠르 GET /api/trends?f=board · 형 「수집되는 구역별로 다 나와야함」)
  const q = useQuery({ queryKey: ["nomute", "trend-board"], queryFn: async () => { const r = await fetch("/api/trends?f=board", { cache: "no-store" }); if (!r.ok) throw new Error(String(r.status)); return (await r.json()) as Board; }, staleTime: 60_000, retry: false });
  if (q.isError) return <p className="nsb-why">수집 목록은 빠르가 붙이는 중이야</p>;
  const zs = (q.data?.zones || []).filter((z) => z.group === zone || (zone === "X 수집" && z.group === "X"));
  if (!q.data) return <p className="nsb-why">읽는 중…</p>;
  // 꼴 = 옛 뉴스 1번 피드(형 11-05 08:2x 「옛 뉴스 1번 피드를 기준으로하면됨」 · 에디터 트렌드 탭 = 앱 「SNS 전체」 ./trend.tsx 와 같은 Sec·Row 꼴 · trend.css 그대로)
  return (
    <div className="yeta-set nm-trend nsb-zones">
      {zs.map((z) => (
        <details key={z.id} className="ts" data-st={z.ok === false ? "miss" : undefined}>
          <summary className="ts-h"><span className="ts-l"><StatusDot st={z.ok === false ? "miss" : z.ok ? "ok" : "unknown"} />{z.name}</span><span className="ts-u">{z.at ? agoKo(z.at) : ""}</span><span className="ts-n">{z.n ?? z.items.length}</span></summary>
          {z.items.length ? z.items.map((it, i) => (
            <a key={i} className="tr-row" href={it.url || undefined} target="_blank" rel="noopener"><span className="rk">{it.rank ?? i + 1}</span><span className="q">{it.title}</span>{it.metric !== undefined ? <span className="tf">{it.metric}</span> : null}<span className="tm">{it.at ? agoKo(it.at) : ""}</span></a>
          )) : <p className="nsb-why">{z.ok === false ? "멈춤 — 새로 들어온 게 없어" : "비어 있음"}</p>}
        </details>
      ))}
    </div>
  );
}

export function StatusBoard() {
  const sched = useQuery({ queryKey: ["nomute", "schedule"], queryFn: () => office<Sched>("schedule"), refetchInterval: 60_000 });
  const bots = useQuery({ queryKey: ["nomute", "bots"], queryFn: () => office<{ bots: Bot[] }>("bots").then((j) => j.bots || []), refetchInterval: 60_000 });
  const srv = useQuery({ queryKey: ["nomute", "status"], queryFn: () => office<{ cats: StatusCat[]; at?: number }>("status"), refetchInterval: 60_000, retry: false });   // 뜸 #2487 GET /api/office/status
  const cats = merge(fromLocal(sched.data, bots.data), srv.data?.cats);
  const [open, setOpen] = useState<Record<string, boolean>>({}), [pick, setPick] = useState(""), [zone, setZone] = useState("");
  const all = cats.flatMap((c) => c.rows), red = count(all, "miss"), yellow = count(all, "late"), gray = count(all, "unknown");
  return (
    <div className="nsb mx-auto w-full max-w-3xl px-4 pb-12 pt-3">
      <div className="nsb-top" role="status">
        <b data-st={red ? "miss" : yellow ? "late" : "ok"}>{red ? `안 됨 ${red}` : yellow ? `늦음 ${yellow}` : "다 정상"}</b>
        <span>● {count(all, "ok")} · ▲ {yellow} · ✕ {red} · ○ {gray}</span>
        <small>{srv.isError ? "몸 보고 길 = 뜸이 붙이는 중" : srv.data?.at ? agoKo(srv.data.at) : ""}</small>
      </div>
      {cats.map((c) => {
        const w = worst(c.rows), isOpen = open[c.id] ?? (w === "miss" || w === "late");
        return (
          <section key={c.id} className="nsb-cat" data-st={w}>
            <button type="button" className="nsb-ch" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [c.id]: !isOpen }))}>
              <StatusDot st={w} /><b>{c.name}</b>
              <span className="nsb-cnt">{count(c.rows, "miss") ? <em>✕ {count(c.rows, "miss")}</em> : null}{count(c.rows, "late") ? <i>▲ {count(c.rows, "late")}</i> : null}<small>{c.rows.length}</small></span>
            </button>
            {isOpen ? (c.cols ? <Grid c={c} pick={pick} setPick={setPick} /> : (
              <ul className="nsb-rows">
                {(c.id === "collect" ? ZONES.flatMap((z) => [{ key: `zone:${z}`, name: z, st: worst(c.rows.filter((r) => r.zone === z)), head: true } as StatusRow & { head?: boolean }, ...c.rows.filter((r) => r.zone === z)]) : c.rows).map((r) => {
                  const head = (r as { head?: boolean }).head, z = r.key.replace(/^zone:/, "");
                  return (
                    <li key={r.key} className={head ? "nsb-zh" : undefined} data-st={r.st}>
                      <button type="button" className="nsb-r" onClick={() => (head ? setZone(zone === z ? "" : z) : setPick(pick === r.key ? "" : r.key))}>
                        <StatusDot st={r.st} />
                        <span className="nsb-n">{r.name}{r.cron?.length ? <small>{cronKo(r.cron)}</small> : null}</span>
                        <span className="nsb-v">{[r.value, daysKo(r.left_days), r.last_at ? agoKo(r.last_at) : "", nextKo(r.next_at)].filter(Boolean).join(" · ") || HEALTH_KO[r.st]}</span>
                      </button>
                      {head && zone === z ? <ZoneItems zone={z} /> : null}
                      {!head && pick === r.key && (r.note || r.st !== "ok") ? <p className="nsb-why">{HEALTH_KO[r.st]}{r.note ? ` · ${r.note}` : ""}</p> : null}
                    </li>
                  );
                })}
                {!c.rows.length ? <li className="nsb-empty">보고 아직 안 옴</li> : null}
              </ul>
            )) : null}
          </section>
        );
      })}
    </div>
  );
}

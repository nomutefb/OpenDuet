// 작동 표 = 메뉴 4번(형 11-05 07:5x 「내가 이거 스케줄표가 문제가 아니라, 지금 이 기능들이 작동하는지가 눈에 안들어오니까 환장하겠더라고.」 ·
//   「기능들이 정상 작동하는지 내가 카테고라이징을 해줄테니까 그걸 한눈에 볼 수 있는 표를 만들어줄수있어? 메뉴4번에? 스케줄러는 메뉴5번 서랍 안으로 넣을게」 · 「대환장하겟음 이게 제일중요할듯」)
//   분류 = 형이 준 차례 그대로(공통/문서/2026-11-05-작동-표/안.md) · 불 = ● 정상 · ▲ 늦음 · ✕ 안 됨(불 들어옴 · 누르면 까닭) · ○ 아직 모름
//   자료 = GET status(뜸 · 몸 보고 + 서버 합침) 가 있으면 그것 · 없으면 지금 있는 GET bots · GET schedule 로 1·2·3 만 채우고 나머지는 「보고 아직 안 옴」 칸
//   일기 = 일곱 × 8단계 격자(형 「일기 정상 작동여부도 프로세스별로 예를들어 7단계면 표를 7단계로 음영칠해. 8x8 이런식. 안되는 부분에 불들어오게」) · SSH = 몸 × 몸 격자
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { office } from "../data/office";
import { leftKo, payEndAt, staleObs, weekCell, weekPace } from "../data/acct-time";
import { type HealthSt, HEALTH_KO, StatusDot, agoKo, cronKo } from "./sched-bits";
import { type HeatCell, MatrixHeat } from "./lieflat-charts";
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
  { id: "acct", name: "계정 상태", rows: [] },   // 맨 위(형 11-07 14:43 「응 작동 위에 계정 상태 가 먼저 나오게 해줘. gpt 포함.」 · 서버 acctRows = 정본 계정 표 + 남은 % + 창 계정 · 뜸)
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
  // 수집 색인(형 11-05 12:45~13:10 「인덱싱 10개정도로 표를 만들어야될거같다」 · 「초단위로」 · 「한 표에 모든걸 다 담아」 · 「봄이랑 상의해서 메뉴 4번에」 · 정본 = 공통/문서/2026-11-05-작동-표/수집-루틴.md · 서버 cat collect_index)
  { id: "collect_index", name: "수집 색인 · 40분 판", rows: [] },
  // 뉴스 요약 썸네일 기준(형 11-05 08:3x 「극화 on / off + 수량  / 썸넹일 플랫폼」 · 수채화 · 포토 실사 같은 칸 · 만평 = 형 11-06 「만평 없어서 없애두댜고」) = 화풍 셋(thumb_gen.py STYLES · sid webtoon·watercolor·photo·cartoon) × 켜짐·장수·엔진(에디터 설정 「AI 썸네일·이미지」)
  { id: "thumb", name: "뉴스 요약 썸네일 기준", rows: [["webtoon", "극화"], ["watercolor", "수채화"], ["photo", "포토 실사"]].map(([key, name]) => wait(name, key)) },
  // 사무실 통신(형 11-05 08:2x 「사무실 커뮤니케이션 상태 / 열인덱싱: 클로드, 지피티, 그록봇 / 행인덱싱: …」) = 종류 × 봇 무리 격자 · 칸 = 그 무리가 그 종류를 사무실로 보내고 받는지(시험 = 빠르 · 서버 file·photo 길)
  { id: "comm", name: "사무실 커뮤니케이션", cols: ["클로드", "지피티", "그록봇"].map((x) => ({ id: x, name: x })),   // 칸 id = 서버(빠르 comm cells) 이름 그대로
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

function fromLocal(s: Sched | undefined, bots: Bot[] | undefined, loading = false): Record<string, StatusRow[]> {
  const out: Record<string, StatusRow[]> = {};
  if (bots) out.bots = bots.map((b) => ({ key: b.who, name: b.who, st: botSt(b.state), value: BOT_KO[b.state] || b.state, note: b.why }));
  const jobs = s?.runners?.jobs || [];
  const mach = jobs.filter((j) => /nomute-wake|neo-agent|sched-clock/.test(j.id));
  out.server = [
    { key: "api", name: "사무실 서버", st: s ? "ok" : loading ? "unknown" : "miss", value: s ? "응답함" : loading ? "불러오는 중" : "응답 없음" },   // 처음 불러오는 사이 = 회색(형 11-06 00:30 「메뉴 4 첨 들가몀 이게 쩟다가」)
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
const HIDE_BOTS = new Set(["별"]);
const HOST_KO: Record<string, string> = { fast: "빠르", sia: "시아", deng: "뎅", neo: "누리", eyes: "뜸", mac: "맥", "win-a": "윈A", wina: "윈A", "win-b": "윈B", winb: "윈B" };   // 몸 보고 host(영어 자리) → 자리 줄 이름   // 형 11-05 08:31 「별은 빼면 되고」
/** 뼈대 ← 지금 자료(1·2·3) ← 서버 GET status(있으면) · 격자 = 같은 key 덮음 · 줄 표 = 서버 줄이 이김 + 아직 보고 안 한 몸 자리 줄만 남김 */
function merge(local: Record<string, StatusRow[]>, srv?: StatusCat[]): StatusCat[] {
  return SKELETON.map((c) => {
    const s = srv?.find((x) => x.id === c.id), sr = (s?.rows || []).map(rowIn).filter((r) => !(c.id === "bots" && HIDE_BOTS.has(r.name || r.key)));
    let rows = (local[c.id]?.length ? local[c.id] : c.rows).filter((r) => !(c.id === "bots" && HIDE_BOTS.has(r.key)));
    if (sr.length && c.cols) { const by = new Map(sr.map((r) => [r.key, r])); rows = [...rows.map((r) => by.get(r.key) || r), ...sr.filter((r) => !rows.some((x) => x.key === r.key))]; }
    else if (sr.length) {
      const hosts = new Set(sr.flatMap((r) => { const h = String(r.host || r.key.split(":")[0]); return [h, HOST_KO[h] || h]; }));
      const left = c.rows.filter((r) => r.note === "보고 아직 안 옴" && !hosts.has(r.key) && !hosts.has(r.key.replace(/^VM /, "")));   // 보고 안 한 몸만 자리 줄로
      rows = [...sr, ...left];
    }
    return { ...c, rows, cols: c.cols, at: s?.at };
  });
}
const worst = (rows: StatusRow[]): HealthSt => { const all = rows.flatMap((r) => [r.st, ...Object.values(r.cells || {}).map((x) => x.st)]); return all.includes("miss") ? "miss" : all.includes("late") ? "late" : all.length && all.every((x) => x === "ok" || x === "off") ? "ok" : "unknown"; };
const count = (rows: StatusRow[], st: HealthSt) => rows.reduce((n, r) => { const cs = Object.values(r.cells || {}); return n + (cs.length ? cs.filter((x) => x.st === st).length : r.st === st ? 1 : 0); }, 0);   // 칸 있는 줄 = 칸만 셈(줄 불은 칸에서 나온 것 · 두 번 세지 않음)
const daysKo = (d?: number) => (d === undefined ? "" : d < 1 ? `${Math.max(0, Math.round(d * 24))}시간 남음` : `${Math.floor(d)}일 남음`);
const nextKo = (ts?: number) => (ts ? `다음 ${new Date(ts).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })}` : "");

/** 격자 = lieflat Matrix Heat(형 11-05 「거기이 잇는 모든 css 다 써서」 · 「카피하지말고 가져다가 써」 · ./lieflat-charts.tsx G20·L16) · 안 된 칸 = 주황 불 · 자기 칸(SSH 같은 몸) = 짧은 줄 */
function Grid({ c, pick, setPick }: { c: StatusCat; pick: string; setPick: (k: string) => void }) {
  const cols = c.cols || [];
  const at = pick.startsWith(`${c.id}:`) ? pick.split(":") : null, ri = at ? c.rows.findIndex((r) => r.key === at[1]) : -1, ci = at ? cols.findIndex((x) => x.id === at[2]) : -1;
  const cellOf = (r: number, k: number): HeatCell => {
    const row = c.rows[r], col = cols[k];
    if (c.id === "ssh" && row.name === col.id) return { st: "off" };
    const x = row.cells?.[col.id];
    return { st: x?.st || (row.note === "보고 아직 안 옴" ? "unknown" : row.st === "miss" ? "unknown" : row.st), label: x?.note };
  };
  const r = ri >= 0 ? c.rows[ri] : undefined, x = r && ci >= 0 ? r.cells?.[cols[ci].id] : undefined;
  return (
    <div className="nsb-mh">
      <MatrixHeat rows={c.rows.map((x) => x.name)} cols={cols.map((x) => x.name)} cells={cellOf} mark={ri >= 0 && ci >= 0 ? { r: ri, c: ci } : null} aria-label={c.name}
        onCell={(a, b) => { const k = `${c.id}:${c.rows[a].key}:${cols[b].id}`; setPick(pick === k ? "" : k); }} />
      {r && ci >= 0 ? <p className="nsb-why">{r.name} · {cols[ci].name} — {HEALTH_KO[x?.st || "unknown"]}{x?.note || r.note ? ` · ${x?.note || r.note}` : ""}</p> : null}
    </div>
  );
}

/** 계정 상태 표(불 = 읽힘 여부만 · 한도 많고 적음 = 숫자 색만 · 형 11-07 15:40 「안뜨게 혀라.............」) · (형 11-07 14:35 「no, 계정, %, 이름, 주기(매주 0요일 00시), 요금제」 · 「이름에 여러칸으로 나뉘어서 들어가면될듯 (투명 획선)세로」 · 14:44 「비고에 각각 종량제 서비스 주는거 사용률」)
 *  줄 = 서버 acct(클로드 계정 넷 + 지피티 한 줄) · % = 덜 남은 쪽(5시간·7일 중) · 칸 = 창마다 남은 % · 이름 = 창 계정 먼저(봄 14:50) · 누르면 까닭 한 줄 */
type AcctCell = { st: HealthSt; left_pct?: number; reset_at?: number; note?: string };
type AcctRow = Omit<StatusRow, "cells"> & { kind?: string; names?: string[]; plan?: string; pay_end?: string; price_krw?: number; memo?: string; left_pct?: number; was_pct?: number; week_reset?: string; reported_at?: number; cells?: Record<string, AcctCell> };
const p2 = (n: number) => String(n).padStart(2, "0");
const mdHm = (ts?: number) => { if (!ts) return ""; const d = new Date(ts); return `${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`; };
function AcctTable({ rows }: { rows: AcctRow[] }) {
  const [pick, setPick] = useState("");
  if (!rows.length) return <p className="nsb-empty">계정 표 보고 아직 안 옴(맥 몸 보고)</p>;
  const now = Date.now();   // 디데이·하루 평균 = 그릴 때 셈(표는 몸 보고 받을 때마다 다시 그려짐)
  return (
    <div className="nsb-acct" role="region" aria-label="계정 상태 표" tabIndex={0}>
      <table>
        <thead><tr><th>계정</th><th>남은 %</th><th>이름</th><th>주기</th><th>요금제</th><th>비고</th></tr></thead>
        <tbody>{rows.flatMap((r) => {
          const cells = Object.entries(r.cells || {}).filter(([, c]) => c.left_pct !== undefined);
          // 디데이 = 주간 창이 다시 차기까지(없으면 덜 남은 창) · 하루 평균 = 이번 주 쓴 % ÷ 지난 날(주간 창 있을 때만 · 형 11-07 17:18 「디데이 몇일남았는지 … 2일 00시간 이런식으로. 긜고 하루 평균 소모량」)
          const wk = weekCell(r.cells), reset = wk?.reset_at ?? r.next_at, dday = leftKo(reset, now);
          // 하루 평균·예측 = 그 값을 잰 때 기준(last_at → 없으면 몸 보고 받은 때) · 잰 지 1시간 넘으면 숨김(모루 17:36)
          const obsAt = r.last_at ?? r.reported_at, old = staleObs(obsAt, now);
          const pace = wk && !old ? weekPace(wk.left_pct, wk.reset_at, obsAt) : null, payLeft = leftKo(payEndAt(r.pay_end), now);
          const tr = (
            <tr key={r.key} data-st={r.st} onClick={() => setPick(pick === r.key ? "" : r.key)} title={r.value}>
              <th scope="row"><StatusDot st={r.st} />{r.name}{r.kind === "gpt" ? <small>지피티</small> : null}</th>
              <td className="pct"><b data-tone={r.left_pct === undefined ? "none" : r.left_pct >= 30 ? "ok" : r.left_pct >= 10 ? "low" : "out"}>{r.left_pct === undefined ? "—" : `${r.left_pct}%`}</b>{cells.length > 1 ? <small>{cells.map(([k, c]) => `${k} ${c.left_pct}`).join(" · ")}</small> : null}
                {r.was_pct !== undefined ? <small>앞 값 {r.was_pct}% · 다시 참 지남</small> : null}{r.kind === "gpt" && r.last_at ? <small>{agoKo(r.last_at)} 잼</small> : null}
                {wk && old && obsAt ? <small>잰 지 {agoKo(obsAt)} · 평균 숨김</small> : null}{pace ? <small>하루 평균 {pace.perDay}% 씀</small> : null}{pace ? (pace.outAt ? <small className="out">이대로면 {leftKo(pace.outAt, now)} 뒤 바닥</small> : <small>다시 찰 때 {pace.atReset}% 남음</small>) : null}</td>
              <td className="names">{(r.names || []).map((n) => <span key={n}>{n}</span>)}</td>
              <td>{r.week_reset ? `매주 ${r.week_reset}` : ""}{r.next_at ? <small>다시 참 {mdHm(r.next_at)}</small> : null}{dday ? <small className="dday">D- {dday}</small> : null}</td>
              <td>{r.plan || ""}{r.pay_end ? <small>{r.pay_end.slice(5).replace("-", "/")} 결제 끝</small> : null}{payLeft ? <small className="dday">결제 끝 D- {payLeft}</small> : null}{r.price_krw ? <small>{r.price_krw.toLocaleString("ko-KR")}원</small> : null}</td>
              <td className="memo">{r.memo || ""}</td>
            </tr>
          );
          return pick === r.key && r.note ? [tr, <tr key={`${r.key}:why`} className="why"><td colSpan={6}>{HEALTH_KO[r.st]} · {r.note}</td></tr>] : [tr];
        })}</tbody>
      </table>
    </div>
  );
}

/** 수집 색인 = 가로로 긴 표(첫 칸 고정 · 옆으로 밀기 · 🔴 줄 위로 · 칸 머리 누르면 그 칸 정렬) · 칸 = 정본 열둘(봄 13:15 · 시아 첫 판 51줄) */
type IndexRow = StatusRow & { t?: number; step?: string; algo?: string; stale_min?: number; amount?: string; sender?: string; receiver?: string; runner?: string; file?: string; evidence?: string; backup?: string; on_fail?: string };
const IDX_COLS: [keyof IndexRow, string][] = [["t", "시각"], ["algo", "알고리즘·기준"], ["stale_min", "낡음(분)"], ["amount", "수집 양"], ["sender", "돌리는 이"], ["receiver", "받는 이"], ["runner", "러너·몸"], ["file", "파일 위치"], ["evidence", "근거"], ["backup", "백업"], ["on_fail", "못 깨면"]];
const mmss = (t?: number) => (t === undefined || t === null ? "" : `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.round(t % 60)).padStart(2, "0")}`);
function IndexTable({ rows }: { rows: IndexRow[] }) {
  const [sortBy, setSortBy] = useState<keyof IndexRow | "">("");
  const rank = (r: IndexRow) => (r.st === "miss" ? 0 : r.st === "late" ? 1 : 2);
  const list = [...rows].sort((a, b) => rank(a) - rank(b) || (sortBy ? String(a[sortBy] ?? "").localeCompare(String(b[sortBy] ?? ""), "ko", { numeric: true }) : (a.t ?? 0) - (b.t ?? 0)));
  if (!rows.length) return <p className="nsb-empty">정본 줄을 서버가 아직 안 붙였어(봄)</p>;
  return (
    <div className="nsb-idx" role="region" aria-label="수집 색인 표" tabIndex={0}>
      <table>
        <thead><tr><th className="fix">단계</th>{IDX_COLS.map(([k, n]) => <th key={String(k)}><button type="button" onClick={() => setSortBy(sortBy === k ? "" : k)} aria-pressed={sortBy === k}>{n}</button></th>)}</tr></thead>
        <tbody>{list.map((r, i) => (
          <tr key={r.key || i} data-st={r.st}>
            <th className="fix" scope="row"><StatusDot st={r.st} />{r.step || r.name}</th>
            {IDX_COLS.map(([k]) => <td key={String(k)}>{k === "t" ? mmss(r.t) : String(r[k] ?? "")}</td>)}
          </tr>
        ))}</tbody>
      </table>
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
  const loading = srv.isPending;   // 맨 위 셈 = 몸 보고(status · 6초 안팎)만 기다림 · 스케줄(12초 안팎)은 「사무실 서버」 줄만 회색 「불러오는 중」
  const cats = merge(fromLocal(sched.data, bots.data, sched.isPending), srv.data?.cats);
  const [open, setOpen] = useState<Record<string, boolean>>({}), [pick, setPick] = useState(""), [zone, setZone] = useState("");
  const all = cats.flatMap((c) => c.rows), red = count(all, "miss"), yellow = count(all, "late"), gray = count(all, "unknown");
  return (
    <div className="nsb mx-auto w-full max-w-3xl px-4 pb-12 pt-3">
      <div className="nsb-top" role="status">
        <b data-st={loading ? "unknown" : red ? "miss" : yellow ? "late" : "ok"}>{loading ? "불러오는 중" : red ? `안 됨 ${red}` : yellow ? `늦음 ${yellow}` : "다 정상"}</b>
        <span>● {count(all, "ok")} · ▲ {yellow} · ✕ {red} · ○ {gray}</span>
        <small>{srv.isError ? "몸 보고 길 = 뜸이 붙이는 중" : srv.data?.at ? agoKo(srv.data.at) : ""}</small>
      </div>
      {cats.map((c) => {
        const w = worst(c.rows), isOpen = open[c.id] ?? (c.id === "acct" || w === "miss" || w === "late");   // 계정 상태 = 늘 펼침(형 「먼저 나오게」)
        return (
          <section key={c.id} className="nsb-cat" data-st={w}>
            <button type="button" className="nsb-ch" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [c.id]: !isOpen }))}>
              <StatusDot st={w} /><b>{c.name}</b>
              <span className="nsb-cnt">{count(c.rows, "miss") ? <em>✕ {count(c.rows, "miss")}</em> : null}{count(c.rows, "late") ? <i>▲ {count(c.rows, "late")}</i> : null}<small>{c.rows.length}</small></span>
            </button>
            {isOpen ? (c.id === "acct" ? <AcctTable rows={c.rows as unknown as AcctRow[]} /> : c.id === "collect_index" ? <IndexTable rows={c.rows as IndexRow[]} /> : c.cols ? <Grid c={c} pick={pick} setPick={setPick} /> : (
              <ul className="nsb-rows">
                {(c.id === "collect" ? [...ZONES, ...(c.rows.some((r) => !ZONES.includes(r.zone || "")) ? ["기타"] : [])].flatMap((z) => [{ key: `zone:${z}`, name: z, st: worst(c.rows.filter((r) => (z === "기타" ? !ZONES.includes(r.zone || "") : r.zone === z))), head: true } as StatusRow & { head?: boolean }, ...c.rows.filter((r) => (z === "기타" ? !ZONES.includes(r.zone || "") : r.zone === z))]) : c.rows).map((r) => {   // 구역 없는 줄 = 「기타」(뎅 시험 보고 · 안 묶여 숨던 것)
                  const head = (r as { head?: boolean }).head, z = r.key.replace(/^zone:/, "");
                  return (
                    <li key={r.key} className={head ? "nsb-zh" : undefined} data-st={r.st}>
                      <button type="button" className="nsb-r" onClick={() => (head ? setZone(zone === z ? "" : z) : setPick(pick === r.key ? "" : r.key))}>
                        <StatusDot st={r.st} />
                        <span className="nsb-n">{r.name}{r.cron?.length ? <small>{cronKo(r.cron)}</small> : null}
                          {r.cells && !head ? <small className="nsb-cc">{Object.entries(r.cells).map(([k, x]) => <span key={k} data-st={x.st}><StatusDot st={x.st} />{k}{x.note ? ` ${x.note}` : ""}</span>)}</small> : null}</span>
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

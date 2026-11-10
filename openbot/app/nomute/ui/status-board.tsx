// 작동 표 = 메뉴 4번(형 11-05 07:5x 「내가 이거 스케줄표가 문제가 아니라, 지금 이 기능들이 작동하는지가 눈에 안들어오니까 환장하겠더라고.」 ·
//   「기능들이 정상 작동하는지 내가 카테고라이징을 해줄테니까 그걸 한눈에 볼 수 있는 표를 만들어줄수있어? 메뉴4번에? 스케줄러는 메뉴5번 서랍 안으로 넣을게」 · 「대환장하겟음 이게 제일중요할듯」)
//   분류 = 형이 준 차례 그대로(공통/문서/2026-11-05-작동-표/안.md) · 불 = ● 정상 · ▲ 늦음 · ✕ 안 됨(불 들어옴 · 누르면 까닭) · ○ 아직 모름
//   자료 = GET status(뜸 · 몸 보고 + 서버 합침) 가 있으면 그것 · 없으면 지금 있는 GET bots · GET schedule 로 1·2·3 만 채우고 나머지는 「보고 아직 안 옴」 칸
//   일기 = 일곱 × 8단계 격자(형 「일기 정상 작동여부도 프로세스별로 예를들어 7단계면 표를 7단계로 음영칠해. 8x8 이런식. 안되는 부분에 불들어오게」) · SSH = 몸 × 몸 격자
import { useQuery } from "@tanstack/react-query";
import { Fragment, type ReactNode, useState } from "react";
import { office } from "../data/office";
import { leftKo, payEndAt, staleObs, weekCell, weekPace } from "../data/acct-time";
import { type Body, bodiesOf, homeOf, machinesOf } from "../data/bodies";
/** 몸 줄 고르기 = 그 몸 host 이름 전부 중 신선한 보고 먼저 · 없으면 마지막 보고(낡음) — 시아 PC 보고 이름 hwang → sia(11-08) 처럼 바뀌어도 칸이 안 빔(형 09:03 「오프라고 뜨는데 그래도 온도는 나와야해」) */
const pickRow = <R extends { key: string; stale?: boolean; reported_at?: number }>(rows: R[], hosts: string[], suffix = ""): R | undefined => { const rs = hosts.map((h) => rows.find((r) => r.key === h + suffix)).filter((r): r is R => !!r); return rs.find((r) => !r.stale) ?? rs.sort((x, y) => (y.reported_at || 0) - (x.reported_at || 0))[0]; };
import { type HealthSt, HEALTH_KO, StatusDot, agoKo, cronKo } from "./sched-bits";
import { type HeatCell, MatrixHeat } from "./lieflat-charts";
import "./sched-status.css";
import "./yeta-settings.css";
import "./trend.css";   // 수집 목록 = 옛 피드 꼴(SNS 전체와 같은 줄)
import "./status-board.css";

type Cell = { st: HealthSt; note?: string; label?: string };
export type StatusRow = { key: string; name: string; st: HealthSt; last_at?: number; next_at?: number; left_days?: number; value?: string; note?: string; cron?: string[]; zone?: string; cells?: Record<string, Cell> };
export type StatusCat = { id: string; name: string; rows: StatusRow[]; cols?: { id: string; name: string }[]; at?: number; grp?: string };

// 몸 = 정본 한 장(../data/bodies · 서버 GET status bodies · claude-state 공통/정본/몸.json) — 이 파일엔 몸 이름을 따로 안 적음
//   형 11-08 01:48 윈터 1:1 「부품 1개가 있어. 근데 이걸 참조하면 되는데 10개를 복사해서 쓰는 꼴임.」 · 01:49 「참조햇으면 한군디만 바꾸면 되는건데」
const isBox = (b: Body) => b.kind === "pc" || b.kind === "mac";   // 몸(본체) · 그 밖 = VM(kind vm@<몸>)
const DIARY_COLS = [["raw", "원문 뜨기"], ["check", "원문 대조"], ["d40", "40% 일기"], ["d75", "75% 일기"], ["sketch", "습작"], ["end", "넘김 일기"], ["inj2", "2차 주입"], ["wake", "깰 때 넣기"]].map(([id, name]) => ({ id, name }));
const WAIT = "보고 아직 안 옴";
const wait = (name: string, key = name, note = WAIT): StatusRow => ({ key, name, st: "unknown", note });
const waitOf = (b: Body, name: string, key = name): StatusRow => wait(name, key, b.on === false ? movingOf(b) : WAIT);   // 이사 중 몸 = 자리 줄 글로 알림
const movingOf = (b: Body) => (/^이사/.test(b.moving || "") ? b.moving! : `이사 중${b.moving ? ` · ${b.moving}` : ""}`);
const isWait = (r: StatusRow) => r.note === WAIT || /^이사/.test(r.note || "");
// CLI 연결 표(형 11-08 01:25 「cli 연결은 표로 나타내자. 행에 애들, 열에 cli」 · 「이런식으로 클로드는 4개, gpt는 1개.」 · 01:26 「R2, GITHUB, Rclone 까지」)
//   클로드1~4 = 그 몸 계정 폴더 차례(.claude → spare1 → spare2 …) · R2 · GitHub · rclone = 몸 보고 tok_cli 줄(key <몸>:r2 · :gh · :rclone · 뎅·봄 붙이는 중)
const CLI_COLS = [["c1", "클로드1"], ["c2", "클로드2"], ["c3", "클로드3"], ["c4", "클로드4"], ["gpt", "GPT"], ["r2", "R2"], ["gh", "GitHub"], ["rclone", "rclone"]].map(([id, name]) => ({ id, name }));
// 묶음(형 11-08 01:29 「가능한 묶을 수있는 걸 더 카테고라이징 해서 표현」)
const GROUPS = ["계정 · 연결", "수집", "몸", "우리"];
/** 형이 준 분류 · 차례 · 기본 줄(보고가 오면 같은 key 줄을 덮음) */
/** 러너 화면에 줄을 세우는 아이 = 클로드 일곱(형 11-10 07:5x · 13:15 봄 1:1 「러너에 온도 대시보드 뜨는거 갱신해주고 러너 다 갱신」 · 조약돌 ./runner-gauges.tsx PEB 와 같은 일곱) */
const RUN_WHO = new Set(["봄", "시아", "뎅", "빠르", "번개", "뜸", "깃"]);
const skeleton = (bs: Body[]): StatusCat[] => [
  { grp: "계정 · 연결", id: "acct", name: "계정 상태", rows: [] },   // 맨 위(형 11-07 14:43 「응 작동 위에 계정 상태 가 먼저 나오게 해줘. gpt 포함.」 · 서버 acctRows = 정본 계정 표 + 남은 % + 창 계정 · 뜸)
  { grp: "계정 · 연결", id: "cli", name: "CLI 연결", cols: CLI_COLS, rows: bs.filter((b) => b.being).map((b) => ({ ...waitOf(b, b.being), cells: {} })) },   // 서버 tok_claude · tok_gpt · tok_cli 줄을 한 표로(cliRows)
  { grp: "계정 · 연결", id: "tok_grok", name: "그록봇 토큰", rows: [] },
  { grp: "계정 · 연결", id: "bots", name: "봇 연결", rows: [] },
  { grp: "계정 · 연결", id: "server", name: "서버 연결 상태", rows: [] },
  { grp: "수집", id: "collect", name: "수집 상태", rows: [] },
  // 수집 색인(형 11-05 12:45~13:10 「인덱싱 10개정도로 표를 만들어야될거같다」 · 「초단위로」 · 「한 표에 모든걸 다 담아」 · 「봄이랑 상의해서 메뉴 4번에」 · 정본 = 공통/문서/2026-11-05-작동-표/수집-루틴.md · 서버 cat collect_index)
  { grp: "수집", id: "collect_index", name: "수집 색인 · 40분 판", rows: [] },
  // 뉴스 요약 썸네일 기준(형 11-05 08:3x 「극화 on / off + 수량  / 썸넹일 플랫폼」 · 수채화 · 포토 실사 같은 칸 · 만평 = 형 11-06 「만평 없어서 없애두댜고」) = 화풍 셋(thumb_gen.py STYLES · sid webtoon·watercolor·photo·cartoon) × 켜짐·장수·엔진(에디터 설정 「AI 썸네일·이미지」)
  { grp: "수집", id: "thumb", name: "뉴스 요약 썸네일 기준", rows: [["webtoon", "극화"], ["watercolor", "수채화"], ["photo", "포토 실사"]].map(([key, name]) => wait(name, key)) },
  { grp: "몸", id: "hw", name: "하드웨어 연결 · 온도", rows: [...bs.filter(isBox).map((b) => waitOf(b, b.body)), ...bs.filter((b) => !isBox(b)).map((b) => waitOf(b, `VM ${b.being}`))] },   // VM 줄 key = 「VM <아이>」(몸-보고 hw_key)
  { grp: "몸", id: "ssh", name: "SSH 서로 연결 · 권한", cols: bs.map((b) => ({ id: b.body, name: b.body.replace(/^(맥 )?VM /, "") })),   // 행 = SSH 를 재는 몸(윈A · 맥 · 시아 PC · 누리 PC) · 열 = 몸 여덟
    rows: bs.filter(isBox).map((b) => ({ ...waitOf(b, b.body, b.hosts[0]), cells: {} })) },   // key = 그 몸 host 이름(서버 ssh 줄 key)
  { grp: "몸", id: "docker", name: "도커 · VM 구성", rows: bs.filter(isBox).map((b) => waitOf(b, b.body)) },
  { grp: "몸", id: "backup", name: "백업 · G드라이브", rows: [wait("윈A")] },   // 맥 = 윈A 가 끌어감(「윈A ← 맥」 줄) · 윈B 없음(형 01:21 사진 X)
  { grp: "우리", id: "diary", name: "일기 작동", cols: DIARY_COLS, rows: bs.filter((b) => b.being).map((b) => ({ ...wait(b.being), cells: {} })) },
  // 사무실 통신(형 11-05 08:2x 「사무실 커뮤니케이션 상태 / 열인덱싱: 클로드, 지피티, 그록봇 / 행인덱싱: …」) = 종류 × 봇 무리 격자 · 칸 = 그 무리가 그 종류를 사무실로 보내고 받는지(시험 = 빠르 · 서버 file·photo 길)
  { grp: "우리", id: "comm", name: "사무실 커뮤니케이션", cols: ["클로드", "지피티", "그록봇"].map((x) => ({ id: x, name: x })),   // 칸 id = 서버(빠르 comm cells) 이름 그대로
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
const nameKo = (bs: Body[], n?: string) => { const s = n || "", t = s.split(/\s/)[0], b = bs.find((x) => x.hosts.includes(t)); return b && t !== b.body && !b.body.includes(t) ? b.body + s.slice(t.length) : s; };   // 줄 이름 맨 앞 host(hwang) → 몸 이름(시아 PC) · 정본에서
const rowIn = (bs: Body[]) => (r: StatusRow & { host?: string }): StatusRow & { host?: string } => ({ ...r, name: nameKo(bs, r.name), st: stIn(r.st), ...(r.cells ? { cells: Object.fromEntries(Object.entries(r.cells).map(([k, c]) => [k, { ...c, st: stIn(c.st) }])) } : {}) });
// 없어진 봇(별) = 서버가 뺌(_status.js · _bots.js 둘 다 PEOPLE gone 거름) · 화면 사본 HIDE_BOTS 걷음(빠르 11-08 · 원천 하나)
/** host 이름 → 그 몸 이름들(몸 · 아이) — 자리 줄 key(「시아 PC」 · 「VM 뎅」→「뎅」)와 맞춤 · 정본에서 */
const namesOf = (bs: Body[], h: string) => { const b = bs.find((x) => x.hosts.includes(h)); return b ? [h, b.body, b.being] : [h]; };   // 형 11-05 08:31 「별은 빼면 되고」
const hostOf = (r: StatusRow & { host?: string }) => String(r.host || r.key.split(":")[0]);
/** 계정 짧은 이름(형 01:25 「2열 2행(ems1130g)」 · 「3영ㄹ 2행(muteno)」) · 네이버 = ems1130n(형 11-07 14:34 「윈터는 ems1130n이야」) */
const acctShort = (x?: unknown) => { const v = x === undefined || x === null ? "" : String(x); return !v ? "" : /@naver\.com$/i.test(v) ? `${v.split("@")[0]}n` : v.includes("@") ? v.split("@")[0] : v; };   // 서버는 숫자 value 도 받음(모루 #2852) → 글자로
const claudeDir = (r: StatusRow) => (r.name.match(/\.claude[\w-]*/) || r.key.match(/\.claude[\w-]*/) || [""])[0];
const dirRank = (d: string) => (d === ".claude" ? 0 : Number((d.match(/spare(\d+)/) || [0, 99])[1]));
/** CLI 연결 표 = 서버 tok_claude · tok_gpt · tok_cli 줄을 애들 × 칸으로(행 = 몸 정본 · 칸 = CLI_COLS) */
function cliRows(bs: Body[], srv?: StatusCat[]): StatusRow[] {
  const of = (id: string) => (srv?.find((x) => x.id === id)?.rows || []).map(rowIn(bs));
  const claude = of("tok_claude"), gpt = of("tok_gpt"), more = of("tok_cli");
  return bs.filter((b) => b.being).map((b) => {   // 아이 없는 몸(윈A = VM 만 · 형 11-09 「윈a는 하드웨어 담당 안두고 vm만 둘거야」) = 줄 0
    const mine = (rs: (StatusRow & { host?: string })[]) => rs.filter((r) => b.hosts.includes(hostOf(r)));
    const cells: Record<string, Cell> = {};
    mine(claude).sort((x, y) => dirRank(claudeDir(x)) - dirRank(claudeDir(y))).slice(0, 4).forEach((r, i) => {
      cells[`c${i + 1}`] = { st: r.st, label: acctShort(r.value) || "—", note: [claudeDir(r), r.value, daysKo(r.left_days), r.st === "ok" ? "" : r.note].filter(Boolean).join(" · ") };
    });
    const g = mine(gpt)[0];
    if (g) cells.gpt = { st: g.st, label: acctShort(g.value) || "붙음", note: [g.value, g.note].filter(Boolean).join(" · ") };
    for (const id of ["r2", "gh", "rclone"]) {
      const r = mine(more).find((x) => x.key.endsWith(`:${id}`));
      cells[id] = r ? { st: r.st, label: acctShort(r.value) || HEALTH_KO[r.st], note: [r.value, r.note].filter(Boolean).join(" · ") } : { st: "unknown", label: "—", note: "재는 중(몸 보고 tok_cli · 뎅·봄)" };
    }
    for (const id of ["c1", "c2", "c3", "c4", "gpt"]) if (!cells[id]) cells[id] = { st: "unknown", label: "—", note: b.on === false && id === "c1" ? movingOf(b) : "그 칸 없음" };
    const sts = Object.values(cells).map((x) => x.st);
    const st: HealthSt = sts.includes("miss") ? "miss" : sts.includes("late") ? "late" : sts.some((x) => x === "ok") ? "ok" : "unknown";
    return { key: b.being, name: b.being, value: b.body, st, cells };
  });
}
/** SSH 줄 = 칸이 없으면 value 글(「맥 됨(hwang) · 뎅 됨(deng) …」 · 몸 보고 win_ssh)을 칸으로 · 칸 이름 = 몸 정본 body */
/** SSH 칸 이름 → 몸 이름(「뎅」 · 「뜸 VM」 · 「VM 뎅」 다 같은 몸) */
const sshName = (bs: Body[], k: string) => bs.find((b) => [b.body, b.being, `${b.being} VM`, `VM ${b.being}`].includes(k))?.body || k;
function sshIn(r: StatusRow, bs: Body[]): StatusRow {
  const cells: Record<string, Cell> = {};
  for (const [k, c] of Object.entries(r.cells || {})) cells[sshName(bs, k)] = { st: c.st, note: c.note };   // 칸 안 글자 뺌(형 01:22 사진 「관리자」 X) · 누르면 보임
  // 보고 끊김(서버가 ⚪ · stale)이면 남은 글로 칸을 살리지 않음 = 칸도 ⚪(모루 #2852 「맥 됨을 초록 칸으로 되살려」)
  const gone = (r as StatusRow & { stale?: boolean }).stale || r.note === "보고 끊김";
  if (!r.cells) for (const m of String(r.value ?? "").matchAll(/([^·]+?)\s(됨|안 됨|꺼짐)(?:\(([^)]*)\))?\s*(?:·|$)/g)) {
    const k = sshName(bs, m[1].trim());
    cells[k] = gone ? { st: "unknown", note: `보고 끊김 · 마지막 ${m[2]}` } : { st: m[2] === "됨" ? "ok" : m[2] === "꺼짐" ? "off" : "miss", note: m[3] ? `${m[2]} · ${m[3]}` : m[2] };
  }
  const me = bs.find((b) => b.hosts.includes(r.key) || b.body === r.name.replace(/\s*(→.*|SSH)$/, "").trim());
  return { ...r, name: me?.body || r.name, cells };
}
/** 뼈대 ← 지금 자료(1·2·3) ← 서버 GET status(있으면) · 격자 = 같은 key 덮음 · 줄 표 = 서버 줄이 이김 + 아직 보고 안 한 몸 자리 줄만 남김 */
function merge(local: Record<string, StatusRow[]>, bs: Body[], srv?: StatusCat[]): StatusCat[] {
  return skeleton(bs).map((c) => {
    if (c.id === "cli") return { ...c, rows: srv ? cliRows(bs, srv) : c.rows, at: srv?.find((x) => x.id === "tok_claude")?.at };
    const s = srv?.find((x) => x.id === c.id), sr = (s?.rows || []).map(rowIn(bs)).map((r) => (c.id === "ssh" ? sshIn(r, bs) : r));
    let rows = (local[c.id]?.length ? local[c.id] : c.rows);
    if (sr.length && c.cols) { const by = new Map(sr.map((r) => [r.key, r])); rows = [...rows.map((r) => by.get(r.key) || r), ...sr.filter((r) => !rows.some((x) => x.key === r.key))]; }
    else if (sr.length) {
      const hosts = new Set(sr.flatMap((r) => namesOf(bs, hostOf(r))));
      const left = c.rows.filter((r) => isWait(r) && !hosts.has(r.key) && !hosts.has(r.key.replace(/^VM /, "")));   // 보고 안 한 몸만 자리 줄로
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
    return { st: x?.st || (isWait(row) ? "unknown" : row.st === "miss" ? "unknown" : row.st), label: c.id === "ssh" ? undefined : x?.note };   // SSH 칸 = 불만(형 01:22 사진 「관리자」 X · 누르면 까닭)
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

/** CLI 연결 표(형 11-08 01:25 「cli 연결은 표로 나타내자. 행에 애들, 열에 cli」) · 칸 = 불 + 계정 짧은 이름 · 줄 누르면 칸마다 까닭 */
function CliTable({ c }: { c: StatusCat }) {
  const [pick, setPick] = useState("");
  const cols = c.cols || [];
  return (
    <div className="nsb-acct nsb-cli" role="region" aria-label="CLI 연결 표" tabIndex={0}>
      <table>
        <thead><tr><th>애들</th>{cols.map((x) => <th key={x.id}>{x.name}</th>)}</tr></thead>
        <tbody>{c.rows.flatMap((r) => {
          const tr = (
            <tr key={r.key} data-st={r.st} onClick={() => setPick(pick === r.key ? "" : r.key)}>
              <th scope="row"><StatusDot st={r.st} />{r.name}<small>{r.value}</small></th>
              {cols.map((x) => { const v = r.cells?.[x.id]; return <td key={x.id} data-st={v?.st || "unknown"}>{v && v.st !== "unknown" ? <StatusDot st={v.st} /> : null}<span>{v?.label || "—"}</span></td>; })}
            </tr>
          );
          if (pick !== r.key) return [tr];
          const why = cols.map((x) => { const v = r.cells?.[x.id]; return v?.note ? `${x.name} ${v.note}` : ""; }).filter(Boolean);
          return [tr, <tr key={`${r.key}:why`} className="why"><td colSpan={cols.length + 1}>{why.length ? why.map((w) => <span key={w}>{w}</span>) : HEALTH_KO[r.st]}</td></tr>];
        })}</tbody>
      </table>
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
              <td className="names">{(r.names || []).filter((n) => RUN_WHO.has(n)).map((n) => <span key={n}>{n}</span>)}</td>
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

// ── 도식 넷(형 11-08 06:11 윈터 1:1 「웅 바로 반영해버리자 빚이 준거는」 · 빚 02:00 시안 「작동 표 시안 · 도식 넷」) ──
//   ① 애들 × 연결 ② 러너 길(점 · 화살표) ③ 몸 지도 ④ 시간축 · 수집 — 칸 목록은 아래 「자세히」로 접음(손실 0)
//   되풀이 이름 = 줄 · 열 머리에 한 번만(형 01:46 「반복되는 글자는 인덱스로 보내면 된다는 뜻이야」 · 01:47 「한번 쓴 단어는 보고서에 재사용 안해야해」) · 칸 안 = 불 · 숫자 · 짧은 값 · 긴 글 = 마우스 올림
//   몸 · 아이 = 정본 한 장(bs · 서버 bodies) · 봇 · 러너 · 서버 줄 = 서버 그대로(여기 따로 안 적음)
type DCell = { st: HealthSt; note?: string; label?: string };
const rowsOf = (cats: StatusCat[], id: string) => cats.find((c) => c.id === id)?.rows || [];
const first = (s?: string) => String(s || "").split(" · ")[0];
const Dot = ({ c, t }: { c?: DCell; t?: string }) => <span className="nsb-d" data-st={c?.st || "unknown"} title={t ?? c?.note ?? HEALTH_KO[c?.st || "unknown"]}><StatusDot st={c?.st || "unknown"} />{c?.label ? <em>{c.label}</em> : null}</span>;

/** ① 애들 × 연결 — 줄 = 봇 줄(우리 먼저 · 정본 차례) · 열 = 깸 | 클로드 1~4 | GPT | R2 · GitHub · rclone | 일기 여덟 | 교대 넷 */
function DiaWho({ cats, bs, pick, setPick }: { cats: StatusCat[]; bs: Body[]; pick: string; setPick: (k: string) => void }) {
  const bots = rowsOf(cats, "bots"), cli = rowsOf(cats, "cli"), diary = rowsOf(cats, "diary");
  const beings = bs.map((b) => b.being).filter(Boolean);
  const ours = beings.map((n) => bots.find((r) => r.name === n) || { key: n, name: n, st: "unknown" as HealthSt, value: "봇 줄 없음" });
  const rest = bots.filter((r) => !beings.includes(r.name) && RUN_WHO.has(r.name));   // 정본 밖 봇 줄(옛 윈터 · 지피티 · 그록) = 안 그림(형 07:5x 「지피티 봇은 넣을 필요는 없음」)
  const hand = diary.filter((r) => r.key.startsWith("교대"));
  const handCols = Object.keys(hand[0]?.cells || {});
  const cliCols = (cats.find((c) => c.id === "cli")?.cols || []).map((x) => x.id);
  const grok = rowsOf(cats, "tok_grok")[0];
  const comm = cats.find((c) => c.id === "comm");
  return (
    <div className="nsb-dia nsb-who">
      <div className="nsb-scroll" role="region" aria-label="애들 × 연결" tabIndex={0}>
        <table>
          <thead>
            <tr className="grp"><th /><th>깸</th><th colSpan={4}><span>클로드</span></th><th>GPT</th><th colSpan={3}><span>연결</span></th><th colSpan={DIARY_COLS.length}><span>일기</span></th><th colSpan={handCols.length || 1}><span>교대</span></th></tr>{/* 묶음 머리 = 묶음 왼쪽에 붙고 가로로 밀어도 「누구」 칸 옆에 따라옴(빚 11-09 10:05 폰 「작동 표 오른쪽 머리 「일기」가 잘림」 · status-board.css .nsb-who tr.grp) */}
            <tr><th>누구</th><th /><th>1</th><th>2</th><th>3</th><th>4</th><th /><th>R2</th><th>GH</th><th>RC</th>{DIARY_COLS.map((d) => <th key={d.id} title={d.name}><i>{d.name.replace(/ 일기$/, "").replace(/^원문 /, "")}</i></th>)}{handCols.map((h) => <th key={h} title={h}><i>{h.replace(/ 일기$/, "")}</i></th>)}</tr>
          </thead>
          <tbody>
            {[...ours, ...rest].map((r) => {
              const b = bs.find((x) => x.being === r.name), c = cli.find((x) => x.key === r.name)?.cells || {}, d = diary.find((x) => x.key === r.name)?.cells || {}, h = hand.find((x) => x.key === `교대·${r.name}`)?.cells || {};
              const wake = r.cells?.["깸 상태"], last = r.cells?.["마지막 깸"];
              return (
                <tr key={r.key} data-st={r.st} className={b ? "ours" : "bot"} onClick={() => setPick(pick === `who:${r.key}` ? "" : `who:${r.key}`)}>
                  <th scope="row"><StatusDot st={r.st} />{r.name}{b ? <small>{b.body}</small> : null}</th>
                  <td className="wake" title={[wake?.note, last?.note, r.cells?.["깨우는 문"]?.note].filter(Boolean).join(" · ")}><span data-w={first(wake?.note || r.value)}>{first(wake?.note || r.value) || "—"}</span></td>
                  {b ? cliCols.map((k) => <td key={k} className={k.startsWith("c") || k === "gpt" ? "acct" : "link"}>{c[k] ? <Dot c={{ ...c[k], label: k === "r2" || k === "gh" || k === "rclone" ? undefined : c[k].label }} /> : null}</td>) : <td colSpan={cliCols.length} className="none" />}
                  {DIARY_COLS.map((x) => <td key={x.id}>{d[x.id] ? <Dot c={d[x.id]} t={`${x.name} · ${HEALTH_KO[d[x.id].st]}${d[x.id].note ? ` · ${d[x.id].note}` : ""}`} /> : null}</td>)}
                  {handCols.map((x) => <td key={x}>{h[x] ? <Dot c={h[x]} t={`${x} · ${HEALTH_KO[h[x].st]}${h[x].note ? ` · ${h[x].note}` : ""}`} /> : null}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pick.startsWith("who:") ? (() => { const r = bots.find((x) => `who:${x.key}` === pick) || ours.find((x) => `who:${x.key}` === pick); const c = cli.find((x) => x.key === r?.name)?.cells || {}; return r ? <p className="nsb-why">{r.name} — {Object.entries(r.cells || {}).map(([k, v]) => `${k} ${v.note || HEALTH_KO[v.st]}`).join(" · ")}{Object.keys(c).length ? ` · ${Object.entries(c).map(([k, v]) => `${k} ${v.note || HEALTH_KO[v.st]}`).join(" · ")}` : ""}</p> : null; })() : null}
      <div className="nsb-foot">
        {grok ? <span><Dot c={grok} t={`${grok.name} · ${grok.value || ""}`} />그록봇 자동화 · 로그인</span> : null}
        <small>클로드 칸 = 그 몸 계정 폴더 차례(.claude → spare) · 칸 글자 = 계정 · 줄 누르면 까닭</small>
      </div>
      {comm ? <div className="nsb-sub"><b>사무실 말 주고받기</b><Grid c={comm} pick={pick} setPick={setPick} /></div> : null}
    </div>
  );
}

/** ② 러너 길 — 점 = 서버 줄 · 화살표 = 깨우는 길(봇 시계 → 깨움 러너 · 그록 웹훅 → 그록봇 · 부르기 → 모루) · 바탕 = 나머지 서버 줄 */
function DiaFlow({ cats, bs }: { cats: StatusCat[]; bs: Body[] }) {
  const srv = rowsOf(cats, "server"), bots = rowsOf(cats, "bots");
  const clock = srv.find((r) => r.key === "clock"), grok = srv.find((r) => r.key === "grok"), ping = srv.find((r) => /부르기/.test(r.name));
  const runners = srv.filter((r) => r.key.startsWith("runner-") || /깨움 러너|neo-agent|nomute-wake/.test(r.key));
  const pingTo = ping ? ping.name.split(" 부르기")[0] : "";
  const runnerWho = runners.map((r) => r.name.split(" · ").pop() || r.name);
  const stay = bots.filter((r) => bs.some((b) => b.being === r.name) && !runnerWho.includes(r.name));   // 길 = 정본 아이인데 깨움 러너 줄 없음(상주) — 불은 그 봇 줄 그대로(끊겨도 길은 안 바뀜 · 모루 #2875)
  const ours = new Set([...runnerWho, ...stay.map((r) => r.name), pingTo]);
  const grokTo = bots.filter((r) => !ours.has(r.name));   // 깨움 러너 · 상주 · 부르기 길이 없는 봇 = 그록 웹훅으로 깸
  const used = new Set([clock, grok, ping, ...runners].filter(Boolean).map((r) => r!.key));
  const base = srv.filter((r) => !used.has(r.key));
  const lane = (src: StatusRow | undefined, to: { key: string; name: string; st: HealthSt; title?: string; dash?: boolean }[], label: string) => src ? (
    <div className="lane" key={src.key}>
      <div className="node src" data-st={src.st} title={[src.value, src.note].filter(Boolean).join(" · ")}><StatusDot st={src.st} />{label}</div>
      <div className="arrow" data-st={src.st} aria-hidden />
      <div className="to">{to.length ? to.map((t) => <span key={t.key} className={`node chip${t.dash ? " dash" : ""}`} data-st={t.st} title={t.title}><StatusDot st={t.st} />{t.name}</span>) : <small>받는 이 없음</small>}</div>
    </div>
  ) : null;
  return (
    <div className="nsb-dia nsb-flow">
      <div className="base">{base.map((r) => <span key={r.key} className="node" data-st={r.st} title={[r.value, r.note].filter(Boolean).join(" · ")}><StatusDot st={r.st} />{r.name.replace(/\(.*\)$/, "")}{r.key === "deploy" && r.value ? <em>{r.value}</em> : null}</span>)}</div>
      {lane(clock, [...runners.map((r) => ({ key: r.key, name: r.name.split(" · ").pop() || r.name, st: r.st, title: [r.name, r.note].filter(Boolean).join(" · ") })), ...stay.map((r) => ({ key: `stay:${r.key}`, name: r.name, st: r.st, title: r.value, dash: true }))], "봇 시계 → 깨움 러너")}
      {lane(grok, grokTo.map((r) => ({ key: r.key, name: r.name, st: r.st, title: r.value })), "그록 웹훅")}
      {lane(ping, bots.filter((r) => r.name === pingTo).map((r) => ({ key: r.key, name: r.name, st: r.st, title: r.value })), `${pingTo} 부르기`)}
      <small className="nsb-foot">점 = 서버 줄 불 · 화살표 = 깨우는 길 · 점선 = 상주(러너 없이 늘 돎)</small>
    </div>
  );
}

/** ③ 몸 지도 — 열 = 본체(정본 · 이사 중 빼고) · 줄 = 하드웨어 · 온도 · 도커·VM · SSH · 백업 · VM · GitHub 러너 */
const RUN_ON: [string, string][] = [["nomute-win-", "윈A"], ["mac-", "맥"]];   // GitHub 러너 이름 앞말 → 그 러너가 도는 몸 host(러너 등록 이름 = 러너 쪽 자리 · 몸 목록 아님)
function DiaBody({ cats, bs }: { cats: StatusCat[]; bs: Body[] }) {
  const hw = rowsOf(cats, "hw"), dock = rowsOf(cats, "docker"), ssh = rowsOf(cats, "ssh"), backup = rowsOf(cats, "backup") as (StatusRow & { host?: string })[];
  const ms = machinesOf(bs), moving = bs.filter((b) => b.on === false);
  const runner = hw.find((r) => r.key === "러너");
  const gone = (r?: StatusRow) => !!r && (!!(r as StatusRow & { stale?: boolean }).stale || r.note === "보고 끊김");
  const m = (r?: StatusRow) => (gone(r) ? {} : (r as (StatusRow & { metrics?: Record<string, number> }) | undefined)?.metrics || {});
  const pct = (r?: StatusRow) => { const x = m(r); return [x.cpu !== undefined ? `CPU ${Math.round(x.cpu)}%` : "", x.ram !== undefined ? `램 ${Math.round(x.ram)}%` : "", x.disk_free !== undefined ? `빔 ${Math.round(x.disk_free)}%` : ""].filter(Boolean).join(" · "); };
  const temp = (r?: StatusRow) => { const x = m(r); return [x.cpu_temp !== undefined ? `CPU ${Math.round(x.cpu_temp)}°` : "", x.gpu_temp !== undefined ? `GPU ${Math.round(x.gpu_temp)}°` : ""].filter(Boolean).join(" · "); };
  const cell = (r: StatusRow | undefined, text: string) => r ? <td data-st={r.st} title={[r.name, r.value, r.note].filter(Boolean).join(" · ")}><StatusDot st={r.st} />{gone(r) ? "보고 끊김" : text || first(r.value) || HEALTH_KO[r.st]}</td> : <td className="none">—</td>;
  return (
    <div className="nsb-dia nsb-map">
      <div className="nsb-scroll" role="region" aria-label="몸 지도" tabIndex={0}>
        <table>
          <thead><tr><th />{ms.map((b) => <th key={b.body}>{b.body}<small>{bs.filter((x) => homeOf(x) === b.body && x.being).map((x) => x.being).join(" · ")}</small></th>)}</tr></thead>
          <tbody>
            <tr><th scope="row">하드웨어</th>{ms.map((b) => { const r = pickRow(hw, b.hosts); return <Fragment key={b.body}>{cell(r, pct(r))}</Fragment>; })}</tr>
            <tr><th scope="row">온도</th>{ms.map((b) => { const r = pickRow(hw, b.hosts, "-temp"); return <Fragment key={b.body}>{cell(r, temp(r))}</Fragment>; })}</tr>
            <tr><th scope="row">도커 · VM</th>{ms.map((b) => <Fragment key={b.body}>{cell(dock.find((x) => x.key === b.hosts[0]), "")}</Fragment>)}</tr>
            <tr><th scope="row">SSH → 다른 몸</th>{ms.map((b) => {
              const r = ssh.find((x) => x.key === b.hosts[0]), cs = Object.entries(r?.cells || {}), ok = cs.filter(([, c]) => c.st === "ok").length;
              return r ? <td key={b.body} data-st={r.st} title={cs.map(([k, c]) => `${k} ${c.note || HEALTH_KO[c.st]}`).join(" · ")}><StatusDot st={r.st} />{cs.length ? `${ok}/${cs.length}` : first(r.value)}</td> : <td key={b.body} className="none">—</td>;
            })}</tr>
            <tr><th scope="row">백업</th>{ms.map((b) => { const rs = backup.filter((x) => (x.host || x.key.split("-")[0]) === b.hosts[0]); return <td key={b.body}>{rs.length ? rs.map((r) => <Dot key={r.key} c={{ st: r.st, label: r.name.replace(new RegExp(`^${b.hosts[0]}\\s*`), "").replace(/\(.*\)$/, "").replace(/ 백업$/, "") }} t={[r.name, r.note].filter(Boolean).join(" · ")} />) : <span className="none">—</span>}</td>; })}</tr>
            <tr><th scope="row">VM</th>{ms.map((b) => { const vs = bs.filter((x) => x !== b && homeOf(x) === b.body); return <td key={b.body}>{vs.length ? vs.map((x) => { const r = hw.find((y) => y.key === `VM ${x.being}`); return <Dot key={x.being} c={{ st: r?.st || "unknown", label: x.being }} t={r ? [r.name, pct(r), r.note].filter(Boolean).join(" · ") : "보고 아직 안 옴"} />; }) : <span className="none">—</span>}</td>; })}</tr>
            <tr><th scope="row">GitHub 러너</th>{ms.map((b) => { const cs = Object.entries(runner?.cells || {}).filter(([n]) => RUN_ON.some(([p, h]) => n.startsWith(p) && h === b.hosts[0])); const ok = cs.filter(([, c]) => c.st === "ok").length, sts = cs.map(([, c]) => c.st), w: HealthSt = sts.includes("miss") ? "miss" : sts.includes("late") ? "late" : ok === cs.length ? "ok" : "unknown"; return <td key={b.body} data-st={cs.length ? w : undefined} title={cs.map(([n, c]) => `${n} ${c.note || HEALTH_KO[c.st]}`).join(" · ")}>{cs.length ? <><StatusDot st={w} />{ok}/{cs.length}</> : <span className="none">—</span>}</td>; })}</tr>
          </tbody>
        </table>
      </div>
      {moving.length ? <small className="nsb-foot">{moving.map((b) => `${b.body} · ${b.moving || "이사 중"}`).join(" · ")}</small> : null}
    </div>
  );
}

/** ④ 시간축 · 수집 — 위 = 구역 칩(누르면 그 구역 목록) · 아래 = 40분 판 색인 표 · 썸네일 기준 = 한 줄 */
function DiaTime({ cats }: { cats: StatusCat[] }) {
  const col = rowsOf(cats, "collect"), idx = rowsOf(cats, "collect_index") as IndexRow[], thumb = rowsOf(cats, "thumb");
  const [zone, setZone] = useState("");
  const zs = [...ZONES, ...(col.some((r) => !ZONES.includes(r.zone || "")) ? ["기타"] : [])];
  return (
    <div className="nsb-dia nsb-time">
      <div className="zones">{zs.map((z) => { const rs = col.filter((r) => (z === "기타" ? !ZONES.includes(r.zone || "") : r.zone === z)), w = worst(rs); return (
        <button key={z} type="button" className="node chip" data-st={w} aria-pressed={zone === z} onClick={() => setZone(zone === z ? "" : z)} title={rs.filter((r) => r.st !== "ok").map((r) => `${r.name} ${HEALTH_KO[r.st]}`).join(" · ")}><StatusDot st={w} />{z}<em>{count(rs, "ok")}/{rs.length}</em></button>
      ); })}</div>
      {zone ? <ZoneItems zone={zone} /> : null}
      <IndexTable rows={idx} />
      {thumb.length ? <small className="nsb-foot">썸네일 기준 · {thumb.map((r) => <Dot key={r.key} c={{ st: r.st, label: r.name }} t={r.value} />)}</small> : null}
    </div>
  );
}

function Diagrams({ cats, bs, pick, setPick }: { cats: StatusCat[]; bs: Body[]; pick: string; setPick: (k: string) => void }) {
  const box = (n: string, title: string, sub: string, ids: string[], body: ReactNode) => { const rs = ids.flatMap((id) => rowsOf(cats, id)), w = worst(rs); return (
    <section className="nsb-cat nsb-diac" data-st={w} aria-label={title}>
      <h3 className="nsb-ch"><StatusDot st={w} /><b>{n} {title}</b><span className="nsb-cnt">{count(rs, "miss") ? <em>✕ {count(rs, "miss")}</em> : null}{count(rs, "late") ? <i>▲ {count(rs, "late")}</i> : null}<small>{sub}</small></span></h3>
      {body}
    </section>
  ); };
  return (
    <div className="nsb-dias">
      {box("①", "애들 × 연결", "깸 · 계정 · 일기 · 교대", ["bots", "cli", "diary", "tok_grok", "comm"], <DiaWho cats={cats} bs={bs} pick={pick} setPick={setPick} />)}
      {box("②", "러너 길", "점 · 화살표", ["server"], <DiaFlow cats={cats} bs={bs} />)}
      {box("③", "몸 지도", "본체 × 줄", ["hw", "docker", "ssh", "backup"], <DiaBody cats={cats} bs={bs} />)}
      {box("④", "시간축 · 수집", "구역 · 40분 판", ["collect", "collect_index", "thumb"], <DiaTime cats={cats} />)}
    </div>
  );
}

export function StatusBoard() {
  const sched = useQuery({ queryKey: ["nomute", "schedule"], queryFn: () => office<Sched>("schedule"), refetchInterval: 60_000 });
  const bots = useQuery({ queryKey: ["nomute", "bots"], queryFn: () => office<{ bots: Bot[] }>("bots").then((j) => j.bots || []), refetchInterval: 60_000 });
  const srv = useQuery({ queryKey: ["nomute", "status"], queryFn: () => office<{ cats: StatusCat[]; at?: number; bodies?: Body[] }>("status"), refetchInterval: 60_000, retry: false });   // 뜸 #2487 GET /api/office/status
  const loading = srv.isPending;   // 맨 위 셈 = 몸 보고(status · 6초 안팎)만 기다림 · 스케줄(12초 안팎)은 「사무실 서버」 줄만 회색 「불러오는 중」
  const bs = bodiesOf(srv.data?.bodies).map((b) => (RUN_WHO.has(b.being) ? b : { ...b, being: "" }));   // 몸 = 서버 bodies(정본) · 없으면 사본 · 아이 = 클로드 일곱만(형 11-10 07:5x 시아 창 「시아 러너 이거 갱신. 애들 포함 해서 천둥은 그록봇이니 넣을필요는 없음.」 · 「지피티 봇은 넣을 필요는 없음.」 · 정본 윈A being 「윈터」 = 옛 클로드 윈터 → 비움)
  const cats = merge(fromLocal(sched.data, bots.data, sched.isPending), bs, srv.data?.cats);
  const [open, setOpen] = useState<Record<string, boolean>>({}), [pick, setPick] = useState(""), [zone, setZone] = useState(""), [more, setMore] = useState(false);
  const acct = cats.filter((c) => c.id === "acct"), rest = cats.filter((c) => c.id !== "acct");   // 맨 위 = 계정 상태(형 11-07 14:43 「먼저 나오게」) → 도식 넷 → 「자세히」 = 칸 목록(손실 0)
  const all = cats.flatMap((c) => c.rows), red = count(all, "miss"), yellow = count(all, "late"), gray = count(all, "unknown");
  return (
    <div className="nsb mx-auto w-full max-w-6xl px-4 pb-12 pt-3">
      <div className="nsb-top" role="status">
        <b data-st={loading ? "unknown" : red ? "miss" : yellow ? "late" : "ok"}>{loading ? "불러오는 중" : red ? `안 됨 ${red}` : yellow ? `늦음 ${yellow}` : "다 정상"}</b>
        <span>● {count(all, "ok")} · ▲ {yellow} · ✕ {red} · ○ {gray}</span>
        <small>{srv.isError ? "몸 보고 길 = 뜸이 붙이는 중" : srv.data?.at ? agoKo(srv.data.at) : ""}</small>
      </div>
      {acct.map((c, i) => sec(c, i, acct))}
      <Diagrams cats={cats} bs={bs} pick={pick} setPick={setPick} />
      <button type="button" className="nsb-more" aria-expanded={more} onClick={() => setMore(!more)}>{more ? "칸 목록 접기" : `자세히 · 칸 목록 ${rest.length}`}<small>● {count(rest.flatMap((c) => c.rows), "ok")} · ▲ {count(rest.flatMap((c) => c.rows), "late")} · ✕ {count(rest.flatMap((c) => c.rows), "miss")} · ○ {count(rest.flatMap((c) => c.rows), "unknown")}</small></button>
      {more ? rest.map((c, i) => sec(c, i, rest)) : null}
    </div>
  );
  function sec(c: StatusCat, i: number, cats: StatusCat[]) {
        const w = worst(c.rows), isOpen = open[c.id] ?? (c.id === "acct" || w === "miss" || w === "late");   // 계정 상태 = 늘 펼침(형 「먼저 나오게」)
        const g = c.grp && c.grp !== cats[i - 1]?.grp ? c.grp : "", gr = g ? cats.filter((x) => x.grp === g).flatMap((x) => x.rows) : [];   // 묶음 머리(형 01:29 「카테고라이징」) · 머리 불 = 그 묶음 제일 나쁜 것
        return (
          <Fragment key={c.id}>
            {g && GROUPS.includes(g) ? <h3 className="nsb-grp" data-st={worst(gr)}><StatusDot st={worst(gr)} />{g}<small>● {count(gr, "ok")}{count(gr, "late") ? ` · ▲ ${count(gr, "late")}` : ""}{count(gr, "miss") ? ` · ✕ ${count(gr, "miss")}` : ""}{count(gr, "unknown") ? ` · ○ ${count(gr, "unknown")}` : ""}</small></h3> : null}
          <section className="nsb-cat" data-st={w}>
            <button type="button" className="nsb-ch" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [c.id]: !isOpen }))}>
              <StatusDot st={w} /><b>{c.name}</b>
              <span className="nsb-cnt">{count(c.rows, "miss") ? <em>✕ {count(c.rows, "miss")}</em> : null}{count(c.rows, "late") ? <i>▲ {count(c.rows, "late")}</i> : null}<small>{c.rows.length}</small></span>
            </button>
            {isOpen ? (c.id === "acct" ? <AcctTable rows={c.rows as unknown as AcctRow[]} /> : c.id === "cli" ? <CliTable c={c} /> : c.id === "collect_index" ? <IndexTable rows={c.rows as IndexRow[]} /> : c.cols ? <Grid c={c} pick={pick} setPick={setPick} /> : (
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
          </Fragment>
        );
  }
}

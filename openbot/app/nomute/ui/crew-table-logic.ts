// 애들 × 연결 한 표의 셈(순수 · 화면 = ./crew-table.tsx · 시험 tests/crew-table.test.ts)
//   형 11-19 「cli연결하고 애들 x연결하고 통합시켜줘. 하나로. 보기 좋게 제일 깔끔하게.」 · 「애들 x 연결이 행이 길어지면 어떻게 표를 분리해서 표기할지 생각해봐 행 인덱싱이 반복되도되니까」
//     「그리고 저기에 그록봇까지 포함시켜 그록봇도 일기를쓰는거니까」 · 「파일 주고받기, 자막 파동 이런거 다 세분화해서, 봇 애들마다 그게 가능한지를 알 수 있는 지표가 … 애들 x 연결에 나와야 함」
//   꼴 = 띠(계정 · 연결 / 일기 · 교대 / 손) — 띠마다 이름 줄을 되풀이(옆으로 미는 긴 표 하나 대신) · 줄 = 사무실 애들 전부(클로드 → 조수 → 지피티 → 그록)
//   칸 뜻: 값 있음 = 점(+ 글) · undefined = 그 애한테 없는 칸(빈 칸) · null = 있어야 하는데 기록이 안 온 칸(빨간 –)
//   되풀이 글 = 칸 머리로(형 11-08 「반복되는 글자는 인덱스로 보내면 된다는 뜻이야」) — 한 칸의 글이 거의 다 같으면 그 글은 머리에 한 번 · 다른 줄만 제 글
import { acctTag } from "../data/acct-time.ts";

export type St = "ok" | "late" | "miss" | "unknown" | "off";
export type CliItem = { n?: number; name?: string; account?: string; active?: boolean; type?: string; provider?: string; user?: string; domain?: string };
export type CCell = { st: St; note?: string; label?: string; items?: CliItem[]; at?: number; kind?: "dash" | "tag" };
export type SRow = { key: string; name: string; st: St; value?: string; note?: string; cells?: Record<string, CCell>; brain?: string; metrics?: Record<string, number>; kind?: string; names?: string[] };
export type Fam = "claude" | "aide" | "gpt" | "grok" | "etc";
export type Kid = { who: string; fam: Fam; st: St };
export type Col = { id: string; name: string; grp: string; title: string; common?: string };
export type BRow = Kid & { sep?: boolean; cells: Record<string, CCell | null | undefined>; wide?: { from: string; n: number; text: string } };
export type Band = { id: string; name: string; cols: Col[]; rows: BRow[] };

const FAM_OF: Record<string, Fam> = { 클로드: "claude", 조수: "aide", 지피티: "gpt", 그록: "grok" };
const FAM_RANK: Fam[] = ["claude", "aide", "gpt", "grok", "etc"];
const ago = (ts: number, now = Date.now()) => { const m = Math.round((now - ts) / 60e3); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 1440 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`; };

/** 순수 — 몸 보고 비고 「r2(s3 · 도메인) · gdrive(drive · 메일)」 → 줄들(이름 · 종류 · 계정 또는 도메인) */
export function cliNoteItems(note?: string): CliItem[] {
  return [...String(note || "").matchAll(/([\w.-]+)\(([^)]*)\)/g)].map((m) => { const [type, ...rest] = m[2].split(" · ").map((x) => x.trim()).filter(Boolean), who = rest.join(" · "); return { name: m[1], type, ...(who.includes("@") ? { user: who } : who ? { domain: who } : {}) }; });
}

/** 순수 — 러너 단계가 없는 창(구름 = 「해당 없음」 칸)은 올라온 시각으로 칸을 채움: 40% 일기 ← 마지막 일기 · 습작 ← 마지막 습작 · 넘김 일기 ← 마지막 넘김 · 시각이 없으면 빈 칸(= 빨간 –)
 *  (형 11-18 22:0x 구름 맥 창 「너도 이제 쓰니까 안뜨는게 아니라 못썼으면 빨간색으로 -라도 떠야해」 · 23:1x 「응 없는거는 다 채워야해」) · 다른 칸 · 다른 줄은 서버 칸 그대로 */
const DIARY_AT: Record<string, string> = { d40: "diary_ms", sketch: "sketch_ms", end: "handoff_ms" };
export function diaryCell(c: CCell | undefined, id: string, met?: Record<string, number>): CCell | undefined {
  if (c && !(c.st === "unknown" && /해당 없음/.test(c.note || ""))) return c;
  const k = DIARY_AT[id];
  if (!k) return c;
  const t = met?.[k];
  return t ? { st: "ok", note: `${ago(t)}` } : undefined;
}

/** 줄 차례 = 머리(클로드 → 조수 → 지피티 → 그록 → 그 밖) · 같은 머리 안 = 몸 정본 차례(beings) 먼저 → 서버가 준 차례 · 머리가 바뀌는 첫 줄 = sep */
export function crewOrder(bots: SRow[], act: SRow[], beings: string[]): (Kid & { sep?: boolean })[] {
  const brain = new Map(act.map((r) => [r.name, r.brain || ""]));
  const seen = new Set<string>(), kids: (Kid & { i: number })[] = [];
  bots.forEach((r, i) => { if (!r.name || seen.has(r.name)) return; seen.add(r.name); kids.push({ who: r.name, fam: FAM_OF[brain.get(r.name) || ""] || "etc", st: r.st, i }); });
  const at = (w: string) => { const k = beings.indexOf(w); return k < 0 ? 99 : k; };
  kids.sort((a, b) => FAM_RANK.indexOf(a.fam) - FAM_RANK.indexOf(b.fam) || at(a.who) - at(b.who) || a.i - b.i);
  return kids.map(({ i: _i, ...k }, n) => ({ ...k, ...(n && kids[n - 1].fam !== k.fam ? { sep: true } : {}) }));
}

const CLAUDE = ["c1", "c2", "c3", "c4"], LINKS = ["r2", "gh1", "gh2", "rclone"];
const has = (c?: CCell) => !!c && !(c.st === "unknown" && (!c.label || c.label === "—"));   // 「그 칸 없음」 · 빈 둘째 계정 = 없는 칸
/** 한 칸의 글이 거의 다 같으면(둘 넘게 · 반 넘게) 그 글 = 칸 머리로 · 줄에는 다른 글만 남김 */
export function liftCommon(rows: BRow[], id: string): string {
  const n = new Map<string, number>(); let all = 0;
  for (const r of rows) { const l = r.cells[id]?.label; if (l) { n.set(l, (n.get(l) || 0) + 1); all++; } }
  const top = [...n.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] < 2 || top[1] * 2 <= all) return "";
  for (const r of rows) { const c = r.cells[id]; if (c && c.label === top[0]) r.cells[id] = { ...c, label: undefined }; }
  return top[0];
}

/** 띠 ① 계정 · 연결 — 클로드 1~4(그 몸 계정 폴더 차례 · 글 = 계정 꼬리표) · GPT · R2 · GitHub 둘 · rclone · 문(깨우는 문 = 러너 박동 · 그록 웹훅)
 *  제 몸 줄이 없는 창(윈터 · 구름 · 카리나) = 지금 창이 묶인 계정 한 칸 · 그록 = 문만 */
export function bandLink(kids: (Kid & { sep?: boolean })[], cli: SRow[], bots: SRow[], accts: SRow[]): Band {
  const cols: Col[] = [
    ...CLAUDE.map((id, i) => ({ id, name: String(i + 1), grp: "클로드", title: `클로드 ${i + 1}` })),
    { id: "gpt", name: "", grp: "GPT", title: "GPT(코덱스)" },
    { id: "r2", name: "R2", grp: "연결", title: "R2" }, { id: "gh1", name: "GH1", grp: "연결", title: "GitHub 1" }, { id: "gh2", name: "GH2", grp: "연결", title: "GitHub 2" }, { id: "rclone", name: "RC", grp: "연결", title: "rclone" },
    { id: "door", name: "", grp: "문", title: "깨우는 문" },
  ];
  const rows: BRow[] = kids.map((k) => {
    const c = cli.find((x) => x.key === k.who)?.cells || {}, door = bots.find((x) => x.name === k.who)?.cells?.["깨우는 문"];
    const cells: BRow["cells"] = {};
    if (k.fam !== "grok") {
      if (CLAUDE.some((id) => has(c[id]) || c[id]?.st === "miss")) { for (const id of CLAUDE) if (has(c[id]) || (c[id] && c[id].st !== "unknown")) cells[id] = c[id]; }
      else { const on = accts.find((a) => a.kind !== "gpt" && (a.names || []).includes(k.who)); if (on) cells.c1 = { st: on.st, label: acctTag(on.name), note: `지금 창 계정 · ${on.value || on.name}` }; }
      if (has(c.gpt) || (c.gpt && c.gpt.st !== "unknown")) cells.gpt = { ...c.gpt, label: undefined };
      for (const id of LINKS) if (has(c[id]) || (c[id] && c[id].st !== "unknown")) cells[id] = c[id].st === "unknown" || c[id].st === "off" ? { ...c[id], note: [c[id].label, c[id].note].filter(Boolean).join(" · "), label: undefined } : c[id];   // 안 잰 칸 = 점만(글은 마우스 올림)
    }
    if (door) cells.door = { st: door.st, note: door.note };
    return { ...k, cells };
  });
  for (const col of cols) if (col.id === "r2" || col.id === "gh1" || col.id === "gh2") { const top = liftCommon(rows, col.id); if (top) col.common = top; }
  return { id: "link", name: "계정 · 연결", cols, rows };
}

export const DIARY_COLS: [string, string, string][] = [["raw", "뜨기", "원문 뜨기"], ["check", "대조", "원문 대조"], ["d40", "40", "40% 일기"], ["d75", "75", "75% 일기"], ["sketch", "습작", "습작"], ["end", "넘김", "넘김 일기"], ["inj2", "주입", "2차 주입"], ["wake", "깸", "깰 때 넣기"]];
const HAND_KO: Record<string, string> = { "넘김 일기": "일기", 이어받음: "이음", "앱 권한": "권한", "옛 창 닫힘": "닫힘" };
/** 띠 ② 일기 · 교대 — 일기 여덟 단계 + 교대(셀프 · 챙김 · 서버가 준 교대 칸) · 일기 줄이 없는 애 = 빈 줄(서버가 재기 시작하면 채워짐) · 시각만 온 줄 = 「일기 N 전 · …」 한 칸 */
export function bandDiary(kids: (Kid & { sep?: boolean })[], diary: SRow[], opt: { noSelf: Record<string, string>; care: Record<string, string>; selfOk: string[] }, now = Date.now()): Band {
  const hand = diary.filter((r) => r.key.startsWith("교대")), handCols = Object.keys(hand[0]?.cells || {});
  const cols: Col[] = [
    ...DIARY_COLS.map(([id, name, title]) => ({ id, name, grp: "일기", title })),
    { id: "self", name: "셀프", grp: "교대", title: "셀프 넘김 · 혼자 넘어가나" }, { id: "care", name: "챙김", grp: "교대", title: "챙김 · 혼자 못 넘어가는 창을 넘겨 주는 이" },
    ...handCols.map((h) => ({ id: `h:${h}`, name: HAND_KO[h] || h, grp: "교대", title: h })),
  ];
  const rows: BRow[] = kids.map((k) => {
    const mine = diary.filter((x) => x.key === k.who), d = mine.find((x) => Object.keys(x.cells || {}).length), met = mine.find((x) => x.metrics)?.metrics;
    const h = hand.find((x) => x.key === `교대·${k.who}`)?.cells || {};
    const cells: BRow["cells"] = {}; let wide: BRow["wide"];
    if (d) for (const [id] of DIARY_COLS) cells[id] = diaryCell(d.cells?.[id], id, met) ?? null;
    else if (met) { const t = ([["일기", met.diary_ms], ["습작", met.sketch_ms], ["넘김", met.handoff_ms]] as [string, number][]).filter(([, v]) => v).map(([n, v]) => `${n} ${ago(v, now)}`).join(" · "); if (t) wide = { from: "raw", n: DIARY_COLS.length, text: t }; }
    if (opt.noSelf[k.who]) cells.self = { st: "late", kind: "dash", note: opt.noSelf[k.who] };
    else if (Object.keys(h).length || opt.selfOk.includes(k.who)) cells.self = { st: "ok", note: "혼자 넘어감" };
    if (opt.care[k.who]) cells.care = { st: "unknown", kind: "tag", label: opt.care[k.who].replace(/ /g, ""), note: `${k.who} 창이 꺼지거나 한도로 멈추면 ${opt.care[k.who]} 이(가) 넘겨 줌` };
    for (const x of handCols) if (h[x]) cells[`h:${x}`] = h[x];
    return { ...k, cells, ...(wide ? { wide } : {}) };
  });
  return { id: "diary", name: "일기 · 교대", cols, rows };
}

/** 띠 ③ 손 — 서버가 봇마다 잰 「할 수 있는 일」(cat hands · 줄 = 봇 · 칸 = 서버가 준 cols 그대로) · 서버 칸이 아직 없으면 띠를 안 그림(지어내지 않음) */
export function bandHands(kids: (Kid & { sep?: boolean })[], rows: SRow[], cols?: { id: string; name: string; grp?: string; title?: string }[]): Band | null {
  if (!rows.length || !cols?.length) return null;
  return { id: "hands", name: "손", cols: cols.map((c) => ({ id: c.id, name: c.name, grp: c.grp || "", title: c.title || c.name })), rows: kids.map((k) => ({ ...k, cells: { ...(rows.find((r) => r.name === k.who || r.key === k.who)?.cells || {}) } })) };
}

/** 띠들의 셈 — 안 됨(빨간 –  포함) · 늦음 수(머리 줄 숫자) */
export function bandCount(bands: Band[]): { miss: number; late: number } {
  let miss = 0, late = 0;
  for (const b of bands) for (const r of b.rows) for (const c of b.cols) { const x = r.cells[c.id]; if (x === null || x?.st === "miss") miss++; else if (x?.st === "late" && x.kind !== "dash") late++; }
  return { miss, late };
}

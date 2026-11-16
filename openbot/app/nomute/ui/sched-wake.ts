// 스케줄 배선 — 「누가 깨워지나 · 누가 부르나 · 용건 · 언제」 넷을 따로 세는 셈(순수 · 시험 tests/sched-wake.test.ts · 화면 = ./sched-tree.tsx)
//   형 11-17 01:1x 구름 맥 창 「이 호출 누구를 향하고 있고 / 호출은 누구를 깨우는 건지 / 그게 일목 요연하게 있어야해 x 등」
//   · 「러너 같이 따로 잇다라도 호출 깨우는 사람이 봇이라면 봇안으로 가야겟지」 · 「일단 주체에 따라 귀속되어야하는디 / 호출이 누가 호출하냐 가 별개고 / 용건이 뭐냐 도 따로인거지 / 발생 시점도 따로인거고」
//   자료 = 스케줄 표(GET schedule) routines[] — 루틴 events[] = 그 루틴을 깨우는 용건(kind · mode) · 다른 루틴의 events[].via = 그 용건을 이 루틴으로 넘김(= 부르는 쪽)
//   주체(가지) = 깨워지는 봇 · 봇 목록에 없는 이름(x)으로 적힌 일은 그 일이 넘기는 호출의 주인 봇 밑으로(X 수집 → 슈왕)
export type WEvent = { kind: string; mode?: string; via?: string; from?: string; ko?: string; from_kind?: string; from_files?: string[]; from_jobs?: string[]; from_note?: string; from_known?: boolean };   // from = 그 용건을 내는 쪽 글(서버 표 · 빠르 #4084 · 예 「러너 breaking-judge(속보 판정)」 · 「사무실 「!이름」(형 · 봇)」 · 「모름」) · ko = 용건 한글
export type WRoutine = { id: string; bot: string; who: string; name: string; fork?: string; when?: string[]; cron?: string[]; events?: WEvent[] };
export type WJob = { id: string; name: string; file?: string; when?: string; notify?: string[] };
/** 깨우는 길 한 줄 — what 용건 · by 누가 부르나(빈 글 = 표에 없음) · when 언제 · sched = 정해진 시각에 도는 줄(글이 길어 두 줄 자리) */
export type WRow = { k: string; what: string; by: string; when: string; sched?: boolean; src?: WSrc; fresh?: boolean; note?: string };   // note = 서버 from 글의 괄호 안 덧말(풍선)
/** 부르는 쪽의 갈래 — clock 시계(정해진 시각) · routine 봇 루틴 · runner 러너 일 · human 형 · "" 표에 없음. fresh = 표엔 적혔는데 러너 목록 · 루틴 목록에 없는 이름(새로 지을 러너).
 *  형 11-17 01:2x 구름 맥 창 「러너를 추가배선 할수도 잇어야해 / 그러려면 러너인지도 구분되어야하고 세분화되어야겟지」 · 「어떤 러너 기존인지 신규인지」 */
export type WSrc = "clock" | "routine" | "runner" | "human" | "";
/** 「누가」 옆 작은 표 — 러너 · 러너 · 신규 · 루틴(시계 · 형 · 모름은 이름이 곧 갈래라 표 없음). */
export const srcTag = (x: { src?: WSrc; fresh?: boolean }): string => (x.src === "runner" ? (x.fresh ? "러너 · 신규" : "러너") : x.src === "routine" ? "루틴" : "");

/** 용건 이름(표의 kind → 읽는 말) — 서버 표에 한글 이름 칸이 생기면 그쪽이 먼저(ko) · 여기 없는 kind 는 글자 그대로 */
export const KIND_KO: Record<string, string> = {
  breaking_alert: "속보", surge_alert: "급상승", fire_alert: "화재", trend_hit: "트렌드 적중", urgent_flag: "긴급 표시", data_changed: "자료 바뀜",
  video_done: "영상 완성", mv_plan: "뮤비 기획", world_bundle: "세계관 묶음", song_seeds: "노래 씨앗", teams_day: "팀즈 하루",
};
export const kindKo = (kind: string, ko?: Record<string, string>): string => ko?.[kind] || KIND_KO[kind] || kind;
/** 발생 시점 말 — 표의 mode(바로 · 묶음 · 따로 · 묶음+따로) → 한 마디. */
export const modeKo = (mode?: string): string => (mode === "묶음+따로" ? "묶음 · 따로" : mode || "생기면");

/** 이 일로 깨워지는 봇(가지 주인) — 표의 봇이면 그 봇 · 아니면 이 일이 넘기는 호출(events[].via)의 주인 봇 · 그것도 없으면 적힌 그대로. */
export function ownerOf(r: WRoutine, all: WRoutine[], bots: string[]): string {
  if (!r.bot || bots.includes(r.bot)) return r.bot;
  for (const e of r.events || []) { const t = e.via ? all.find((x) => x.id === e.via) : undefined; if (t?.bot && t.bot !== r.bot) return t.bot; }
  return r.bot;
}
/** 일 이름에서 봇 이름 · [웹훅-…] 표를 뗀 알맹이(「슈왕 [웹훅-x-01] 수집」 → 「수집」) — 다 떼면 원래 이름. */
export function jobCore(r: WRoutine, all: WRoutine[], bots: string[]): string {
  const own = ownerOf(r, all, bots), ownWho = all.find((x) => x.bot === own && x.id !== r.id)?.who || "";
  return r.name.replace(/\[[^\]]*\]/g, " ").split(/\s+/).filter((w) => w && w !== r.who && w !== ownWho).join(" ") || r.name;
}
/** 부르는 쪽 이름 — 알맹이 앞에, 표의 봇이 아닌 이름(x)으로 적힌 일이면 그 이름을 대문자로(「X 수집」). */
export const callerName = (r: WRoutine, all: WRoutine[], bots: string[]): string => (!r.bot || bots.includes(r.bot) ? jobCore(r, all, bots) : `${r.bot.toUpperCase()} ${jobCore(r, all, bots)}`);
/** 러너 일이 봇을 깨우는 알림(notify 「결 알림」 꼴) → 그 봇 이름(없으면 빈 글) — whos = 표의 봇 이름들(그림 글자 뗀 것과 견줌). */
const bare = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, "");
export const jobWakes = (j: WJob, who: string): boolean => (j.notify || []).some((n) => { const m = /^(.+?)\s*알림$/.exec(n.trim()); return !!m && bare(m[1]) === bare(who) && bare(who).length > 0; });

/** 서버 from 글 → 누가 · 갈래 — 「모름」 = 표에 없음 · 「러너 <파일 이름>[ · <파일 이름>](<덧말>)」 = 러너(이름이 러너 목록의 파일과 맞으면 그 일 이름 · 기존 / 하나도 안 맞으면 신규)
 *  · 「사무실 …」 · 「형」 = 사람 · 루틴 id = 그 루틴 · 그 밖 = 글자 그대로. note = 괄호 안 덧말(풍선용). */
export function fromOf(text: string, jobs: WJob[], routineName: (id: string) => string = () => ""): Pick<WRow, "by" | "src" | "fresh"> & { note?: string } {
  const t = (text || "").trim();
  if (!t || t === "모름") return { by: "", src: "" };
  const m = /^러너\s+([^()]+?)\s*(?:\((.*)\))?$/.exec(t);
  if (m) {
    const toks = m[1].split(/\s*·\s*/).filter(Boolean), stemOf = (j: WJob) => (j.file || "").replace(/\.ya?ml$/, "");
    const hit = (tok: string) => (tok.includes("*") ? jobs.filter((j) => new RegExp(`^${tok.split("*").map((x) => x.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`).test(stemOf(j))) : jobs.filter((j) => stemOf(j) === tok));
    const names = toks.map((tok) => (tok.includes("*") ? tok : hit(tok)[0]?.name || tok));
    return { by: names.join(" · "), src: "runner", ...(toks.some((tok) => hit(tok).length) ? {} : { fresh: true }), ...(m[2] ? { note: m[2] } : {}) };
  }
  if (/^(사무실|형)(\s|$|「|\()/.test(t)) return { by: t.replace(/\s*\(.*\)$/, ""), src: "human" };
  const rn = routineName(t);
  return rn ? { by: rn, src: "routine" } : { by: t, src: "" };
}

/** 서버가 from 을 칸으로 쪼개 주면(빠르 #4088 · from_kind runner · office · unknown / from_files 워크플로 줄기 / from_jobs wf.줄기 / from_note 덧말 / from_known 러너 지도에 있음 = 기존 · 없음 = 신규) 그 칸을 먼저 읽음 — 없으면 글(from)을 풀어 읽음. */
export function fromEvent(e: WEvent, jobs: WJob[], routineName: (id: string) => string = () => ""): (Pick<WRow, "by" | "src" | "fresh"> & { note?: string }) | null {
  const note = e.from_note ? { note: e.from_note } : {};
  if (e.from_kind === "unknown") return { by: "", src: "" };
  if (e.from_kind === "office") return { by: (e.from || "사무실").replace(/\s*\(.*\)$/, ""), src: "human", ...note };
  if (e.from_kind === "runner") {
    const files = e.from_files?.length ? e.from_files : (e.from_jobs || []).map((id) => id.replace(/^wf\./, "")), stemOf = (j: WJob) => (j.file || "").replace(/\.ya?ml$/, "");
    const jobOf = (f: string) => jobs.find((j) => stemOf(j) === f || j.id === `wf.${f}`);
    const known = typeof e.from_known === "boolean" ? e.from_known : files.some((f) => !!jobOf(f) || f.includes("*"));
    return { by: files.map((f) => (f.includes("*") ? f : jobOf(f)?.name || f)).join(" · ") || "러너", src: "runner", ...(known ? {} : { fresh: true }), ...note };
  }
  return e.from ? fromOf(e.from, jobs, routineName) : null;
}

/** 한 루틴(문)을 깨우는 길 — ① 정해진 시각에 도는 일이면 한 줄(누가 = 시계) ② 용건(events)마다 한 줄(누가 = 그 용건을 이 루틴으로 넘기는 일 · from 칸 · 없으면 빈 글)
 *  ③ 호출 루틴이면 이 봇을 깨우는 러너 알림도 한 줄씩. 다른 루틴으로 넘기는 용건(via 가 남의 루틴)은 여기 안 셈(받는 쪽 카드에 나옴). */
export function wakeRows(r: WRoutine, all: WRoutine[], bots: string[], o: { whenKo?: (r: WRoutine) => string; ko?: Record<string, string>; jobs?: WJob[]; nameOf?: (id: string) => string } = {}): WRow[] {
  const rows: WRow[] = [];
  const when = o.whenKo ? o.whenKo(r) : (r.when || []).join(" · ");
  if (when) rows.push({ k: "sched", what: jobCore(r, all, bots), by: "시계", when, sched: true, src: "clock" });
  const from = (e: WEvent) => fromEvent(e, o.jobs || [], (id) => { const rt = all.find((x) => x.id === id); return rt ? callerName(rt, all, bots) : ""; });
  for (const e of r.events || []) {
    if (e.via && e.via !== r.id) continue;
    const src = all.find((x) => x.id !== r.id && (x.events || []).some((y) => y.via === r.id && y.kind === e.kind));
    rows.push({ k: `e:${e.kind}`, what: e.ko || kindKo(e.kind, o.ko), when: modeKo(e.mode), ...(from(e) || (src ? { by: callerName(src, all, bots), src: "routine" as const } : { by: "", src: "" as const })) });
  }
  if (r.fork === "call") for (const j of o.jobs || []) if (jobWakes(j, r.who)) rows.push({ k: `j:${j.id}`, what: `${j.name} 알림`, by: j.name, when: j.when || "끝나면", src: "runner" });
  return rows;
}
/** 카드 키에 드는 줄 수 — 정해진 시각 줄은 둘(글이 길어 두 줄) · 줄이 없으면 한 줄(「부를 때만」). */
export const rowUnits = (rows: WRow[]): number => Math.max(1, rows.reduce((a, x) => a + (x.sched ? 2 : 1), 0));

/** 호출 열쇠가 있는 자리 — 다 같은 글이면 그 글 하나(화면에 한 번만) · 섞였거나 없으면 빈 글. */
export function hookPlace(rs: { hook?: string; hook_at?: string }[]): string {
  const at = [...new Set(rs.filter((r) => r.hook).map((r) => r.hook_at || ""))];
  return at.length === 1 ? at[0] : "";
}
/** 상태 줄 글 — 부를 때만 도는 일(시각 없음)은 「확인 안 됨」 대신 켜짐 · 꺼짐(마지막으로 돈 때가 있으면 그때) · 그 밖은 표의 상태 말 그대로. */
export function wakeState(st: string, live: boolean, scheduled: boolean, lastAt: number | undefined, now: number, ko: Record<string, string>): string {
  if (scheduled || (st !== "unknown" && st !== "off")) return ko[st] || st;
  if (!live) return "꺼짐";
  if (!lastAt) return "켜짐";
  const m = Math.max(0, Math.round((now - lastAt) / 60e3));
  return `켜짐 · 마지막 ${m < 60 ? `${m}분` : m < 1440 ? `${Math.round(m / 60)}시간` : `${Math.round(m / 1440)}일`} 전`;
}

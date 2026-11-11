// 미디어 게이지 셈(순수 · 시험 tests/enc-logic.test.ts) — 형 11-11 08:14 번개 1:1
//   「셋다 가는 중일 땐 미디어 좌측에 간단하게 게이지로 표시되게 해줘 / 아주 작게 / 영상이면 / 영상 00% / 파동 00% / 자막 00% / 다 공유되먼 완료」 · 「사진이면 사진」
//   값 = 서버 GET /api/office/encstate?p=<경로>… (editor functions/api/office/_enc.js · 뜸 · 자막 칸 parts.stt = 번개 #3234)
//   영상 = 러너가 줄여 봇이 읽게 된 정도 · 파동 = 올릴 때 구운 파형 그림(「<이름>.파형.png」 · ../shim/wave.ts)이 닿은 정도 · 자막 = 받아쓰기 러너 진행
//   라임 테두리 = 그 미디어를 봇이 읽을 수 있음(형 11-11 06:35 봄 1:1 「사진도 보내서 볼수잇게되면 테두리에 라임띄어줘」 · 봄이 옮김)

export type EncCell = { ready?: boolean; stage?: string; pct?: number | null; at?: number; why?: string; parts?: { stt?: EncCell; frames?: EncCell } };   // frames = 「움직임 자세히」 쪼개기(형 11-12 07:20 dm-eyes 「세번째로 프레임이 0% 뜨게 가능해? … 그래서 총 4개가 가야해 내가 옵션을 카면」)
export type EncItems = Record<string, EncCell | undefined>;
export type GaugeKind = "video" | "wave" | "frames" | "stt" | "photo";
export type GaugeLine = { k: GaugeKind; label: string; pct: number; done: boolean; fail: boolean; why?: string };
export type Gauge = { lines: GaugeLine[]; done: boolean; at: number };

const VID = /\.(mp4|m4v|mov|webm)$/i, PIC = /\.(png|jpe?g|webp|gif|avif)$/i;
export const WAVE_RE = /\.파형\.png$/;
/** 서버가 진행을 적는 경로만(봇 자리 사본 · _enc.js ENC_PATH_RE) */
const SEAT = /^(grokbot|claude|chatgpt)\/[^/]+\/office_files\/[^/]+$/;
/** 서버에 진행 기록이 생긴 날(11-11 06:00 KST) — 그 앞 글은 묻지 않음(기록 없음 = 조용히) */
export const ENC_T0 = Date.UTC(2026, 10, 10, 21, 0, 0);
export const LABEL: Record<GaugeKind, string> = { video: "영상", wave: "파동", frames: "프레임", stt: "자막", photo: "사진" };
/** 자막 기록이 아직 없을 때 「자막 0%」로 먼저 그리는 동안 = 영상이 읽힌 뒤 이만큼(받아쓰기 러너가 줄 서는 사이) · 넘으면 줄을 뺌(대상 아님으로 봄) */
export const STT_HOLD = 10 * 60e3;
/** 「완료」 글을 보이는 동안(끝난 지 이만큼) · 그 뒤엔 라임 테두리만 남음 */
export const DONE_SHOW = 10 * 60e3;

/** 형 1:1 방(dm-<봇> · 형 방 dm-hyung 뺌)에서 봇이 형한테 보낸 첨부 = 게이지 · 라임 테두리 0(형 11-12 07:41~07:44 봄 1:1 「봇이 보냇을땐 사용자한테 그 % 가 안나오게해줄래?」 · 「사진 테두리 둘러싸는것도 없어두 댐」 · 「무조건 나랑 1대1대화일대만 이야」 · 깃)
 *  보이는 것만 가림(줄이기 · 인식 · encstate 그대로) · 형 → 봇 · 봇끼리 둘의 방 · 단톡 = 그대로 · mirrorBy = 형이 앱에서 친 거울 글(형 글) */
export const encQuiet = (room: string, kind: string, mirrorBy?: string) => /^dm-/.test(room) && room !== "dm-hyung" && kind !== "human" && !mirrorBy;
export const kindOf = (p: string): GaugeKind | "" => (VID.test(p) ? "video" : WAVE_RE.test(p) ? "wave" : PIC.test(p) ? "photo" : "");
/** 이 글에서 물을 경로(영상 · 사진 · 파형 그림 · 자리 사본만 · 옛 글 = 0) */
export function encWanted(files: string[] | undefined, ts: number): string[] {
  if (!(ts >= ENC_T0)) return [];
  return [...new Set((files || []).map(String))].filter((p) => SEAT.test(p) && !!kindOf(p));
}
const live = (c?: EncCell): c is EncCell => !!c && !!c.stage && c.stage !== "none";
const pctOf = (c: EncCell) => (c.ready ? 100 : Math.max(0, Math.min(99, Math.round(Number(c.pct) || 0))));
/** 봇이 읽을 수 있나(라임 테두리) */
export const encOk = (c?: EncCell) => !!c?.ready;

function line(k: GaugeKind, cells: EncCell[]): GaugeLine | null {
  const cs = cells.filter(live);
  if (!cs.length) return null;
  const done = cs.every((c) => c.ready), bad = cs.find((c) => c.stage === "fail");
  const pct = done ? 100 : Math.floor(cs.reduce((a, c) => a + pctOf(c), 0) / cs.length);
  return { k, label: LABEL[k], pct, done, fail: !done && !!bad, ...(bad?.why && !done ? { why: bad.why } : {}) };
}

/** 글 하나의 게이지 — 기록이 하나도 없으면 null(안 그림) · 차례 = 영상 · 파동 · 프레임(켠 영상만) · 자막 · 사진 */
export function gaugeOf(files: string[] | undefined, items: EncItems, now: number): Gauge | null {
  const ps = [...new Set((files || []).map(String))];
  const by = (k: GaugeKind) => ps.filter((p) => kindOf(p) === k).map((p) => items[p]).filter(Boolean) as EncCell[];
  const vids = by("video"), waves = by("wave");
  const lines: GaugeLine[] = [];
  const v = line("video", vids); if (v) lines.push(v);
  const w = line("wave", waves); if (w) lines.push(w);
  const frs = vids.map((c) => c.parts?.frames).filter(live);
  const f = line("frames", frs); if (f) lines.push(f);   // 서버가 보낼 때 0% 로 세움 = 켠 영상만 칸
  const stts = vids.map((c) => c.parts?.stt).filter(live);
  const s = line("stt", stts);
  if (s) lines.push(s);
  else if (v && w) {   // 파형 그림이 있다 = 소리 있는 영상 → 받아쓰기 기록이 서기 전에도 「자막 0%」로 먼저(영상이 읽힌 뒤 STT_HOLD 까지만)
    const vAt = Math.max(0, ...vids.filter(live).map((c) => Number(c.at) || 0));
    if (!v.done || (vAt > 0 && now - vAt < STT_HOLD)) lines.push({ k: "stt", label: LABEL.stt, pct: 0, done: false, fail: false });
  }
  const p = line("photo", by("photo")); if (p) lines.push(p);
  if (!lines.length) return null;
  const all = [...vids, ...waves, ...frs, ...stts, ...by("photo")].filter(live);
  return { lines, done: lines.every((l) => l.done), at: Math.max(0, ...all.map((c) => Number(c.at) || 0)) };
}

/** 「완료」 글을 보일까 — 이 화면에서 가는 걸 본 글이거나 · 끝난 지 얼마 안 된 글만(옛 글은 테두리만) */
export const doneShown = (g: Gauge, seen: boolean, now: number) => g.done && (seen || (g.at > 0 && now - g.at < DONE_SHOW));

/** 다음에 다시 물을 때까지(ms) · 0 = 더 안 물음
 *   가는 중 = 3초 · 멈춤 = 30초(러너가 늦게 돌 수도) · 기록 없음 = 갓 보낸 글만 5초(2분까지 · 기록이 글보다 늦게 설 수 있음) · 다 됨 = 자막이 아직이면 계속 */
export function nextAsk(c: EncCell | undefined, kind: GaugeKind | "", msgTs: number, now: number): number {
  if (!c) return 1;   // 아직 안 물음
  if (!live(c)) return now - msgTs < 120e3 ? 5000 : 0;
  if (c.stage === "fail") return now - msgTs < 6 * 3600e3 ? 30_000 : 0;
  if (!c.ready) return 3000;
  if (kind !== "video") return 0;
  const fr = c.parts?.frames;
  if (live(fr) && !fr.ready && fr.stage !== "fail") return 3000;   // 프레임 쪼개는 중 = 계속 물음
  const s = c.parts?.stt;
  if (live(s)) return s.ready ? 0 : s.stage === "fail" ? (now - msgTs < 6 * 3600e3 ? 30_000 : 0) : 3000;
  return now - (Number(c.at) || 0) < STT_HOLD ? 5000 : 0;   // 영상은 읽혔고 자막 기록은 아직 = 줄 서는 사이만 더 물음
}

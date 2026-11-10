// 서랍 「미디어 요약」 계산 줄(./nb.tsx · 시험 = tests/nb-logic.test.ts) — 원본 viewer/nb.html · functions/api/nb.js 와 같은 값(team-4 · 깃 11-10)
//   판 1 = 주소(유튜브 · 채널 목록) · 파일(영상 · 소리) · 붙여넣은 글 → 자료 노트 → 「뉴스 요약으로 보내기」(/api/submit) · .md 받기 / 판 2(아직) = 사진 글자 인식 · 기사 참조
export const NB_KEY = "nm_nb_jobs", NB_POLL_MS = 5000, NB_BUDGET_S = 2400;   // nb.html 216 · 하드 = 두 배
export const NB_EXT = /\.(mp4|mov|m4v|webm|mkv|avi|mp3|m4a|wav|ogg|aac|flac)$/i;   // nb.js r2key 정규식
export const SRC_LB: Record<string, string> = { subs: "업로더 자막", "subs-auto": "자동 생성 자막", stt: "Whisper 음성 인식", "stt-file": "Whisper 음성 인식(업로드 파일)", ocr: "사진 글자 인식(OCR)", text: "붙여넣은 텍스트", article: "기존 요약본 기사" };
const TXT = ["ocr", "text", "article"];
export const isTxt = (d: Note) => TXT.includes(String(d.tr_src || ""));
export const shaky = (d: Note) => ["subs-auto", "stt", "stt-file", "ocr"].includes(String(d.tr_src || ""));
export const mmss = (s?: number) => { const x = Math.max(0, Math.round(s || 0)); return Math.floor(x / 60) + ":" + String(x % 60).padStart(2, "0"); };

export type Note = {
  id?: string; ts?: string; kind?: string; tr_src?: string; topics?: string[]; one?: string; summary?: string; coverage?: string;
  src?: { title?: string; channel?: string; uploaded?: string; dur?: number; url?: string; yt_id?: string };
  points?: { c: string; t?: number; g?: string; x?: string }[]; chapters?: { t?: number; h: string }[]; quotes?: { q: string; w?: string; t?: number; v?: boolean }[];
  facts?: { f: string; t?: number }[]; terms?: { n: string; d: string }[]; use?: string[]; transcript?: { s?: number; t: string }[];
};
export type VList = { ts?: string; n?: number; src?: { title?: string; channel?: string; url?: string }; items: { t?: string; url: string; d?: number }[] };

/** 보낼 몸통(nb.js 31-60 · 112) — 주소 · 파일(r2key) · 글(40자 넘게) 중 하나 · ask = 바라는 점 */
export function nbBody(src: { url?: string; r2key?: string; name?: string; text?: string }, ask: string): { body?: Record<string, unknown>; error?: string } {
  const a = ask.replace(/[\r\n\t]+/g, " ").trim().slice(0, 500);
  if (src.url) { const u = src.url.trim(); if (!/^https?:\/\/\S+$/i.test(u)) return { error: "주소는 http(s) 로 시작해야 해" }; return { body: { url: u, ask: a } }; }
  if (src.r2key) return { body: { r2key: src.r2key, name: String(src.name || "").slice(0, 200), ask: a } };
  const t = String(src.text || "").trim();
  if (!t) return { error: "주소 · 파일 · 글 중 하나를 넣어 줘" };
  if (t.length < 40) return { error: "글이 너무 짧아(40자 넘게)" };
  const title = t.split("\n")[0].trim().slice(0, 200);
  return { body: { text: t.slice(0, 8000), title, kind: "text", ask: a } };
}
/** 끝났나(nb.html 488-506) = 이번에 보낸 뒤 판(ts ≥ 보낸 때 −90초) · 노트 = summary 있음 · 목록 = items 있음 */
export function fresh<T extends { ts?: string }>(d: T | null, need: string, minTs: number): T | null {
  if (!d || !(d as Record<string, unknown>)[need]) return null;
  const ts = Date.parse(String(d.ts || ""));
  return !isNaN(ts) && ts >= minTs ? d : null;
}

/** 뉴스 요약으로 보내기 = /api/submit {text}(nb.html 623-635 그대로) */
export function newsText(d: Note): string {
  const s = d.src || {}, L: string[] = [], tx = isTxt(d);
  L.push("[" + (tx ? SRC_LB[d.tr_src || ""] || "자료" : "유튜브 영상") + " 자료화 노트 — 아래 내용을 기사 다이제스트로 정리해줘. 노트의 사실·인용만 근거로(" + (tx ? "판독" : "전사") + " 기준 오인식 가능 표기는 유지).]");
  L.push("제목: " + (s.title || "")); L.push("매체: " + (s.channel || "") + (tx ? "" : " (유튜브)"));
  if (s.url) L.push("URL: " + s.url);
  if (s.uploaded) L.push("업로드: " + s.uploaded);
  L.push(""); L.push("한 줄: " + (d.one || "")); L.push(""); L.push("요약:"); L.push(d.summary || "");
  if ((d.points || []).length) { L.push(""); L.push("핵심 논점:"); for (const p of d.points!) L.push("- " + p.c + (p.g ? " (근거: " + p.g + ")" : "") + (p.x ? " (반론·뉘앙스: " + p.x + ")" : "")); }
  if ((d.quotes || []).length) { L.push(""); L.push("주요 발언(전사 자구):"); for (const q of d.quotes!) L.push('- "' + q.q + '" — ' + (q.w || "화자 미상") + " [" + mmss(q.t) + "]"); }
  if ((d.facts || []).length) { L.push(""); L.push("팩트·수치(전사 기준):"); for (const x of d.facts!) L.push("- " + x.f); }
  return L.join("\n").slice(0, 11000);
}

/** 노트 전체 .md(nb.html 669-697 그대로) */
export function noteMd(d: Note): string {
  const s = d.src || {}, L: string[] = [], lb = isTxt(d) ? "본문" : "전사";
  L.push("# " + (s.title || "(제목 없음)")); L.push("");
  L.push("- 채널: " + (s.channel || "") + (s.uploaded ? " · 업로드 " + s.uploaded : "") + (s.dur ? " · " + mmss(s.dur) : ""));
  if (s.url) L.push("- 원본: " + s.url);
  L.push("- 유형: " + (d.kind || "일반") + " · " + lb + " 출처: " + (SRC_LB[d.tr_src || ""] || "전사") + (shaky(d) ? " (고유명사·수치 오인식 가능)" : "") + " · 생성: " + String(d.ts || "").slice(0, 16).replace("T", " "));
  if ((d.topics || []).length) L.push("- 주제: " + d.topics!.join(" · "));
  if (d.one) { L.push(""); L.push("> " + d.one); }
  L.push(""); L.push("## 요약"); L.push(""); L.push(d.summary || "");
  if ((d.points || []).length) { L.push(""); L.push("## 핵심 논점"); L.push(""); for (const p of d.points!) { L.push("- " + p.c + " [" + mmss(p.t) + "]"); if (p.g) L.push("  - 근거: " + p.g); if (p.x) L.push("  - 반론·뉘앙스: " + p.x); } }
  if ((d.chapters || []).length) { L.push(""); L.push("## 타임라인"); L.push(""); for (const c of d.chapters!) L.push("- [" + mmss(c.t) + "] " + c.h); }
  if ((d.quotes || []).length) { L.push(""); L.push("## 주목 발언"); L.push(""); for (const q of d.quotes!) L.push('- "' + q.q + '" — ' + (q.w || "화자 미상") + " [" + mmss(q.t) + "]" + (q.v === false ? " (⚠ 전사 대조 실패)" : "")); }
  if ((d.facts || []).length) { L.push(""); L.push("## 팩트·수치"); L.push(""); for (const x of d.facts!) L.push("- " + x.f + " [" + mmss(x.t) + "]"); }
  if ((d.terms || []).length) { L.push(""); L.push("## 인물·용어"); L.push(""); for (const t of d.terms!) L.push("- **" + t.n + "** — " + t.d); }
  if ((d.use || []).length) { L.push(""); L.push("## 활용 포인트"); L.push(""); for (const u of d.use!) L.push("- " + u); }
  if (d.coverage) { L.push(""); L.push("_반영 범위: " + d.coverage + "_"); }
  L.push(""); L.push("## 전체 " + lb); L.push("");
  for (const r of d.transcript || []) L.push("[" + mmss(r.s) + "] " + r.t);
  return L.join("\n");
}
export const trText = (d: Note) => (d.transcript || []).map((r) => "[" + mmss(r.s) + "] " + r.t).join("\n");

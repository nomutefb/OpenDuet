// 뉴스 요약·썸네일 데이터(형 11-01 「그 내 뉴스 에디터에서 쓰는 썸네일, 그리고 뉴스 요약 보는 것들. 그런것들 완전히 내재화 부탁해.」)
//   원천 = 에디터 정적 파일 그대로(같은 출처 · build-viewer.mjs 산출 · 서버 고침 0): /articles.json · /detail/<file>.json · /thumb-hist.json · cards/<stem>/thumbs/prompts.json
//   쓰기 = 화풍 투표(/api/rate action=thumb · 비용 0)·저장(/api/dl) 둘만 — 고치기·만들기는 에디터 한 겹(#/web)
import { queryOptions } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { inAppHref } from "./inapp";

/** 앱 안 길로 한 칸 — 라우터 기록(순번 붙음)이라 「<」·#/web 닫기 = 뒤로(location.hash 로 옮기면 순번이 없어 닫을 때 앞 화면을 잃음) */
export const useGo = () => { const r = useRouter(); return (path: string) => r.history.push(path); };
/** 원문·출처 링크 누름 = 앱 안 한 겹(./inapp.ts 규칙 · 품기 막는 사이트는 원래대로 새 창) */
export const inAppClick = (go: (p: string) => void) => (e: { preventDefault: () => void; currentTarget: HTMLAnchorElement }) => { const h = inAppHref(e.currentTarget.href); if (h) { e.preventDefault(); go(h); } };
/** 에디터 그 기사 창(딥링크 /?a=<file> · 고치기·다시 만들기·AI 생성은 거기서) */
export const editorPath = (file: string) => "/web?u=" + encodeURIComponent(`/?a=${encodeURIComponent(file)}`);

export type Thumb = { img?: string; url?: string; link?: string; label?: string; sid?: string };
export type Cards = { state?: string; thumb_search?: Thumb[]; thumb_gen?: Thumb[]; thumb_prompts_url?: string; images?: string[]; updated?: string; rev?: number; has_md?: boolean };
export type Art = {
  file: string; title?: string; title_orig?: string; summary?: string; media?: string; reporter?: string; url?: string; date?: string; time?: string; time_est?: string;
  category?: string; cat?: string; bias?: string; bias_src?: string; tags?: string; tags_why?: string; breaking?: boolean | number | string; issue?: boolean | number; rev?: number; has_body?: boolean; cards?: Cards;
};
type Feed = { articles?: Art[]; count?: number; generated?: string };

/** 파일 없음 — 404 또는 HTML(200 · Pages 가 없는 길을 index.html 로 돌림 = 아직 배포 전) */
export class Miss extends Error {}
/** 같은 출처 JSON(쿠키 그대로) · 끊김 = Access 만료(302 → 다른 출처)거나 회선 */
export async function getJson<T>(url: string): Promise<T> {
  let r: Response;
  try { r = await fetch(url, { credentials: "same-origin" }); } catch { throw new Error("연결이 끊겼거나 로그인이 끝났어 — 새로 고쳐 다시"); }
  if (r.status === 404) throw new Miss("404");
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const t = await r.text();
  if (/^\s*</.test(t)) throw new Miss("html");
  try { return JSON.parse(t) as T; } catch { throw new Error("받은 글이 JSON 이 아니야"); }
}

/** 목록 = /articles.json 전부(최신 파일명 순) · 60초 다시 읽기(원본 폴) — 상세도 같은 캐시에서 그 기사 줄을 찾음 */
export const newsListQuery = queryOptions({
  queryKey: ["nomute", "news-list"], staleTime: 60_000, refetchInterval: 60_000,
  queryFn: async () => {
    const j = await getJson<Feed>(`/articles.json?_=${Date.now()}`).catch((e) => { throw e instanceof Miss ? new Error("로그인이 끝났어 — 새로 고쳐 다시 로그인") : e; });
    const arts = (j.articles || []).filter((a) => a && a.file).sort((a, b) => (a.file < b.file ? 1 : a.file > b.file ? -1 : 0));
    return { arts, count: j.count || arts.length, generated: j.generated || "" };
  },
});
/** 상세 본문 = /detail/<file>.json?v=<판>(file 이 .md 로 끝나 「….md.json」) · 판 = 에디터 ensureDetail 과 같은 셈(요약 rev · 카드 rev · 카드 updated) */
export const detailQuery = (a: Art) => {
  const v = `${a.rev || 0}.${a.cards?.rev || 0}.${a.cards?.updated || ""}`;
  return queryOptions({
    queryKey: ["nomute", "news-detail", a.file, v], staleTime: 5 * 60_000,
    queryFn: () => getJson<{ body?: string; cards_md?: string }>(`/detail/${encodeURIComponent(a.file)}.json?v=${encodeURIComponent(v)}`),
    retry: (n, e) => !(e instanceof Miss) && n < 2,
  });
};

/** 상대 경로(cards/… · thumb_out/…) = 앞에 / (앱은 /office-app/ 아래라 그대로 두면 엉뚱한 길) */
export const abs = (u?: string) => { const s = String(u || "").trim(); return !s ? "" : /^(https?:|data:|blob:|\/)/i.test(s) ? s : "/" + s; };
export const imgOf = (t?: Thumb) => abs(t?.img || t?.url);
/** 목록 썸네일 = AI 첫 장 · 없으면 검색 첫 장 */
export const thumbOf = (a: Art) => { const c = a.cards || {}; return imgOf((c.thumb_gen || []).find((x) => imgOf(x))) || imgOf((c.thumb_search || []).find((x) => imgOf(x))); };

/** 매체 = 첫 매체 + 「외 N」 */
export const mediaOf = (m?: string) => { const xs = String(m || "").split(/[,·|/]/).map((s) => s.trim()).filter(Boolean); return xs.length ? xs[0].replace(/\s*\(.*?\)\s*/g, "").replace(/\s*등\s*$/, "") + (xs.length > 1 ? ` 외 ${xs.length - 1}` : "") : ""; };
/** 시각 = a.date(YYYY-MM-DD) + a.time(HH:MM) · 없으면 file(YYMMDD-HHMM)에서 */
export const whenOf = (a: Art) => {
  const d = String(a.date || "").trim(), t = String(a.time || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${+d.slice(5, 7)}/${+d.slice(8, 10)}${/^\d{1,2}:\d{2}$/.test(t) ? " " + t + (a.time_est === "true" ? "(추정)" : "") : ""}`;
  const m = /^(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})/.exec(a.file || ""); return m ? `${+m[2]}/${+m[3]} ${m[4]}:${m[5]}` : "";
};
/** 분류 = 에디터 CAT_MAP 6칸(정치·사회·경제·국제·문화·테크) · 밖이면 원래 글자 */
const CAT: Record<string, [string, string]> = { 정치: ["정치", "pol"], 사회: ["사회", "soc"], 시사: ["사회", "soc"], 경제: ["경제", "eco"], 국제: ["국제", "intl"], 외교: ["국제", "intl"], 문화: ["문화", "cul"], 스포츠: ["문화", "cul"], 연예: ["문화", "cul"], 테크: ["테크", "tech"], 과학: ["테크", "tech"], IT: ["테크", "tech"], AI: ["테크", "tech"] };
export const catOf = (a: Art): [string, string] | null => { const c = String(a.cat || a.category || "").trim(); return c ? CAT[c] || [c, ""] : null; };   // cat = 빌드가 뷰어 articleCat 으로 구운 대분류(정본 = viewer/index.html CAT_RULES · 에디터 화면과 같은 셈 · 빠르 11-04) · 없으면 옛 category

/** 편향 = 에디터 biasLabel 카드 꼴(「중립 5」 · 보정 있으면 「좌 보정(4+1)」) · 색 칸 = 원문 방향 */
const biasNum = (s?: string) => { const m = /(\d+)\s*[/／]\s*10/.exec(s || ""); return m ? +m[1] : null; };
const zone = (v: number): [string, string] => { v = Math.min(10, Math.max(1, v)); return v <= 2 ? ["강좌", "l2"] : v <= 4 ? ["좌", "l1"] : v <= 6 ? ["중립", "mid"] : v <= 8 ? ["우", "r1"] : ["강우", "r2"]; };
export const biasOf = (a: Art): { text: string; cls: string } | null => {
  if (!a.bias) return null;
  const M = biasNum(a.bias);
  if (M == null || /무관|N\s*\/?\s*A/i.test(a.bias)) return { text: "무관", cls: "na" };
  const N = biasNum(a.bias_src), [zn, zc] = zone(N ?? M);
  if (N == null || N === M) return { text: `${zn} ${N ?? M}`, cls: zc };
  return { text: `${zn} 보정(${N}${M > N ? "+" : "−"}${Math.abs(M - N)})`, cls: zc };
};
/** 민감 = tags 「#성범죄 #마약」 · 「해당 없음」 = 없음 · 보호 일곱 = 경고색(에디터 SENS_PROTECT) */
const SENS_PROTECT = ["#성범죄", "#자살자해", "#아동피해", "#재난참사", "#추모", "#북·중외교", "#마약"];
export const sensOf = (a: Art) => (!a.tags || a.tags === "해당 없음" ? [] : a.tags.split(/\s+/).filter(Boolean).slice(0, 4).map((t) => ({ t, warn: SENS_PROTECT.includes(t) })));

/** 진행 = 요약·프롬프트·카드 세 칸(에디터 progGauge · cards.state) · 멈춤 = 렌더 10분 · 프롬프팅 26분 넘김 */
export const progOf = (a: Art) => {
  const c = a.cards || {}, st = c.state || "", age = c.updated ? (Date.now() - Date.parse(c.updated)) / 60000 : 0;
  let done = 1, busy = false, fail = false;
  if (st === "done") done = 3;
  else if (st === "fired_partial") { done = 2; if (age > 10) fail = true; else busy = true; }
  else if (st === "text_done") done = 2;
  else if (st === "generating") { if (age > 26) fail = true; else busy = true; }
  else if (st === "failed") { fail = true; if (c.has_md) done = 2; }
  return { done, busy, fail };
};

/** 저장 = 다른 출처(R2·매체 CDN) http(s)면 같은 출처 프록시 /api/dl(attachment) · 같은 출처는 그대로(에디터 dlSrc) */
export const dlHref = (u: string, name: string) => {
  try { const x = new URL(u, location.href); if (/^https?:$/.test(x.protocol) && x.origin !== location.origin) return `/api/dl?u=${encodeURIComponent(u)}&n=${encodeURIComponent(name)}`; } catch { /* 이상한 주소 = 그대로 */ }
  return u;
};
/** 파일 이름 = 기사 시각(yymmdd_hhmm) _ 이름 _ 번호 . 확장자(에디터 thumbDlName) */
const stamp = (file?: string) => { const m = /^(\d{6})-(\d{4})/.exec(file || ""); if (m) return `${m[1]}_${m[2]}`; const n = new Date(), p = (x: number) => String(x).padStart(2, "0"); return `${String(n.getFullYear()).slice(2)}${p(n.getMonth() + 1)}${p(n.getDate())}_${p(n.getHours())}${p(n.getMinutes())}`; };
const slug = (s?: string) => String(s ?? "").replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_").replace(/^[._]+|[._]+$/g, "").slice(0, 40) || "thumb";
export const dlName = (file: string | undefined, label: string, u: string, i: number) => `${stamp(file)}_${slug(label)}_${i + 1}.${((/\.(png|jpe?g|webp)(?:\?|$)/i.exec(u) || [])[1] || "png").toLowerCase().replace("jpeg", "jpg")}`;

/** 화풍 투표 = 에디터와 같은 열쇠 nm_thvote(같은 출처 = 같은 기기 기록 · 카드 투표 nomute_fb 와 다른 키) · 값 = { "<file>#<sid>": "up"|"down" } */
export type Vote = "up" | "down";
const THV = "nm_thvote";
const votes = (): Record<string, Vote> => { try { return JSON.parse(localStorage.getItem(THV) || "{}") || {}; } catch { return {}; } };
export const voteGet = (file: string, sid: string) => votes()[`${file}#${sid}`] || null;
export const voteSet = (file: string, sid: string, v: Vote | null) => { const m = votes(); if (v) m[`${file}#${sid}`] = v; else delete m[`${file}#${sid}`]; try { localStorage.setItem(THV, JSON.stringify(m)); } catch { /* 못 쓰면 이번만 */ } };
/** 보냄 = 에디터 thVoteSend 와 같은 몸(rate.yml 입력 칸 그대로 · reason = up|down|clear:<sid> → 러너가 thumb_votes.jsonl 로 가름) */
export const voteSend = (a: Art, sid: string, v: Vote | "") =>
  fetch("/api/rate", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: a.file, url: a.url || "", title: (a.title || "").slice(0, 300), action: "thumb", reason: `${v || "clear"}:${sid}` }) }).then((r) => r.ok, () => false);

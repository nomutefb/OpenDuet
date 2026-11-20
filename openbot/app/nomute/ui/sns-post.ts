// SNS 글 → 대화 카드(형 11-20 10:16 「미토스 보고 설계까지 진행하라고 시켜주셈 그냥 머지까지 끝내라고.」 · 봄 → 소나 → 구름 · 미토스 5.2 설계 ①②)
//   글 주소 꼴(클래스 이름 말고 주소 꼴에만 기댐) = 인스타 /p · /reel · /reels · /tv(앞에 /<이름>/ 붙어도) · 스토리 /stories/<이름>/<번호> · 스레드 /@<이름>/post/<번호> · X /<이름>/status/<번호>
//   주소 = 추적 꼬리(igsh · s · t · xmt …) 뗌 = 물음표 뒤 · # 뒤 통째로 버림(글 주소는 경로만으로 그 글)
//   글에 싣는 꼴(봇도 읽음 · 「」 = 부름 안 셈) = 주소 줄 + 「Instagram @이름 — 캡션 앞 500자」 줄 · 화면은 이 두 줄을 카드로 바꿔 그림(./sns-card.tsx)
//   순수 부분만 여기(시험 tests/sns-post.test.ts)
import type { SnsSite } from "./sns-side";

export type SnsPost = { site: SnsSite; url: string; author?: string; text?: string; story?: boolean; shot?: string };   // shot = 서버 파일 경로(스냅샷 · 없으면 서비스 아이콘)
export const SNS_NAME: Record<SnsSite, string> = { instagram: "Instagram", threads: "Threads", x: "X" };
const HOST: [SnsSite, RegExp][] = [
  ["instagram", /^(?:www\.|m\.)?instagram\.com$/i],
  ["threads", /^(?:www\.)?threads\.(?:net|com)$/i],
  ["x", /^(?:www\.|mobile\.)?(?:x|twitter)\.com$/i],
];
const IG_POST = /^\/(?:([\w.]+)\/)?(p|reels?|tv)\/([\w-]+)\/?$/;
const IG_STORY = /^\/stories\/([\w.]+)\/(\d+)\/?$/;
const TH_POST = /^\/@([\w.]+)\/post\/([\w-]+)\/?$/;
const X_POST = /^\/(\w+)\/status(?:es)?\/(\d+)(?:\/(?:photo|video)\/\d+)?\/?$/;
const IG_NOT_USER = new Set(["explore", "accounts", "direct", "stories", "reels", "reel", "p", "tv"]);

/** 글 주소면 { site, url(꼬리 뗀 것), author? } · 아니면 null */
export function snsPostOf(raw: string): SnsPost | null {
  let u: URL;
  try { u = new URL(String(raw || "").trim()); } catch { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const site = HOST.find(([, re]) => re.test(u.hostname))?.[0];
  if (!site) return null;
  const path = u.pathname;
  if (site === "instagram") {
    const s = IG_STORY.exec(path);
    if (s) return { site, url: `https://www.instagram.com/stories/${s[1]}/${s[2]}/`, author: s[1], story: true };
    const m = IG_POST.exec(path);
    if (!m || (m[1] && IG_NOT_USER.has(m[1]))) return null;
    const kind = m[2] === "reels" ? "reel" : m[2];
    return { site, url: `https://www.instagram.com/${kind}/${m[3]}/`, ...(m[1] ? { author: m[1] } : {}) };
  }
  if (site === "threads") {
    const m = TH_POST.exec(path);
    return m ? { site, url: `https://www.threads.com/@${m[1]}/post/${m[2]}`, author: m[1] } : null;
  }
  const m = X_POST.exec(path);
  if (!m) return null;
  const user = m[1].toLowerCase() === "i" ? "" : m[1];
  return { site, url: `https://x.com/${user || "i/web"}/status/${m[2]}`, ...(user ? { author: user } : {}) };
}

/** 캡션 = 한 줄로(줄바꿈 · 겹 칸 → 칸 하나) · 「」 → “” (인용 괄호가 안 깨지게) · 앞 500자 */
export function snsCaption(t: unknown, max = 500): string {
  const one = String(t ?? "").replace(/\s+/g, " ").replace(/「/g, "“").replace(/」/g, "”").trim();
  const cs = Array.from(one);
  return cs.length > max ? `${cs.slice(0, max).join("").trimEnd()}…` : one;
}
const AUTHOR_OK = /^[\w.]{1,40}$/;

/** 글에 실을 두 줄(주소 · 「서비스 @이름 — 캡션」) */
export function snsBlock(p: { site: SnsSite; url: string; author?: string; text?: string }): string {
  const a = p.author && AUTHOR_OK.test(p.author) ? ` @${p.author}` : "";
  const t = snsCaption(p.text);
  return `${p.url}\n「${SNS_NAME[p.site]}${a}${t ? ` — ${t}` : ""}」`;
}

const URL_RE = /https?:\/\/[^\s<>"'「」()]+[^\s<>"'「」().,;:!?]/g;
const META_RE = /^「(Instagram|Threads|X)(?: @([\w.]{1,40}))?(?: — ([\s\S]*))?」$/;

/** 글 → { rest(카드로 바꾼 줄을 뺀 글), post } · 글 주소가 없으면 null
 *  - 「주소 줄 + 「서비스 …」 줄」 = 대화로 보내기 꼴 → 두 줄 다 뺌 · 캡션 · 이름은 그 줄에서
 *  - 주소만 붙여 넣은 글(폰 · 링크 복사) → 주소가 줄 하나를 통째로 차지하면 그 줄을 뺌 · 글 사이에 섞였으면 글은 그대로 두고 카드만 */
export function snsSplit(text: string): { rest: string; post: SnsPost } | null {
  const raw = String(text || "");
  for (const u of raw.match(URL_RE) || []) {
    const post = snsPostOf(u);
    if (!post) continue;
    const lines = raw.split("\n");
    const i = lines.findIndex((l) => l.trim() === u);
    if (i < 0) return { rest: raw, post };
    const meta = META_RE.exec((lines[i + 1] || "").trim());
    if (meta && SNS_NAME[post.site] === meta[1]) {
      if (meta[2]) post.author = meta[2];
      if (meta[3]?.trim()) post.text = meta[3].trim();
      lines.splice(i, 2);
    } else lines.splice(i, 1);
    return { rest: lines.join("\n").replace(/\n+$/, "").replace(/^\n+/, ""), post };
  }
  return null;
}

/** 스냅샷 파일 이름(입력칸 첨부 · 서버가 앞에 시각을 붙여도 「nm-sns-」 가 남음) */
export const SHOT_RE = /(?:^|[/_-])nm-sns-(instagram|threads|x)-[\w]+\.(?:jpe?g|png|webp)$/i;
export const shotName = (site: SnsSite, now = Date.now()) => `nm-sns-${site}-${now.toString(36)}.jpg`;

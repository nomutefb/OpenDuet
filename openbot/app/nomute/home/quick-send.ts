// 뉴스 줄 「전송 · 픽」 = 창 없이 바로 요약 요청(형 11-09 08:14 「전송 버튼 누르면 픽 버튼 누르면 자동으로 외신기사면 외신 포함해서 찾게하고 외신 아니면 외신 안포함해서 찾게 하면될듯 뉴스요약 따로 넣은게 아니면 창 또 안 떠도될거같아그냥 픽으로 / 예전 에디터 에서 전송한거랑 같은 결로」 · 봄 29) · 깃)
//   보내는 꼴 = 요약 요청 창(../ui/ask.tsx send)과 같은 POST /api/submit · preset = 창 기본(DEF) 그대로에 fp(외신)만 기사 출처로 저절로 · 「주요 기사부터」 = mj 1(기본 그대로)
//   외신 판별 = 링크 주소: .kr · 국내 매체 .com/.net · 포털(네이버·다음) = 국내 · 그 밖 = 외신

// 외신 = 아는 외신 이름(../ui/news-data.ts 「// 외신」 묶음 키와 같은 줄기) 또는 외국 나라 끝(.jp .uk …) · 모르는 주소 = 국내(창 기본 fp 0 과 같음 · 모루 09:43 ① 쿠키뉴스가 외신으로 잡히던 것)
const FOREIGN = new Set(["nytimes", "washingtonpost", "wsj", "bloomberg", "reuters", "apnews", "cnn", "theguardian", "ft", "nhk", "asahi", "yomiuri", "nikkei", "cnbc", "foxnews", "nbcnews", "scmp", "axios", "politico", "bbc", "aljazeera", "afp", "france24", "dw", "lemonde", "spiegel", "economist", "time", "forbes", "businessinsider", "huffpost", "npr", "abcnews", "cbsnews", "usatoday", "latimes", "theatlantic", "newsweek", "independent", "telegraph", "dailymail", "mirror", "hollywoodreporter", "variety", "deadline", "billboard", "people", "imdb", "tmz", "espn", "nba", "nbcsports", "cbssports", "yahoo", "xinhuanet", "chinadaily", "globaltimes", "kyodonews", "japantimes", "mainichi", "sankei", "tass", "rt", "straitstimes", "smh", "theverge", "techcrunch", "wired", "engadget"]);
const FOREIGN_TLD = new Set(["jp", "cn", "uk", "fr", "de", "tw", "hk", "ru", "in", "au", "ca", "it", "es", "br", "sg", "nz", "vn", "th", "ph", "id", "my", "mx", "ar", "nl", "se", "ch", "be", "at", "pl", "tr", "il", "ae", "sa", "eg", "za", "ng", "ke"]);

/** 링크가 외신이면 true — 주소 못 읽음 · 모르는 주소 = 국내 */
export function isForeignUrl(url: string | undefined): boolean {
  let host = "";
  try { host = new URL(String(url || "")).hostname.toLowerCase().replace(/^www\d*\./, ""); } catch { return false; }
  if (!host || host.endsWith(".kr")) return false;
  const parts = host.split(".");
  if (FOREIGN_TLD.has(parts[parts.length - 1])) return true;
  return parts.some((x) => FOREIGN.has(x));
}

export type QuickPreset = { h24: 0 | 1; fp: 0 | 1; mj: 0 | 1; og: 0 | 1; noai: 0 | 1; know: 0 | 1 };
/** 창 기본(../ui/ask.tsx DEF)에 fp 만 기사 출처로 */
export const presetFor = (url: string | undefined): QuickPreset => ({ h24: 1, fp: isForeignUrl(url) ? 1 : 0, mj: 1, og: 0, noai: 1, know: 0 });

/** 바로 보냄 — 성공 = 접수 id(없으면 "") · 실패 = 던짐(까닭 글) */
export async function quickSend(title: string, url: string): Promise<string> {
  const text = [title, url].filter(Boolean).join("\n").trim();
  if (!text) throw new Error("보낼 제목·링크가 없어");
  const preset = presetFor(url);
  const r = await fetch("/api/submit", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, link: /^https?:\/\//i.test(url) ? url : undefined, images: [], nothumb: preset.noai, preset }) });
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("json")) throw new Error(r.status === 200 ? "로그인이 끝났어 — 새로 고쳐 다시 로그인" : `서버 ${r.status}`);
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string };
  if (!(r.ok && d.ok)) throw new Error(d.error || `서버 ${r.status}`);
  return d.id || "";
}

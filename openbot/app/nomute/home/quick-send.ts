// 뉴스 줄 「전송 · 픽」 = 창 없이 바로 요약 요청(형 11-09 08:14 「전송 버튼 누르면 픽 버튼 누르면 자동으로 외신기사면 외신 포함해서 찾게하고 외신 아니면 외신 안포함해서 찾게 하면될듯 뉴스요약 따로 넣은게 아니면 창 또 안 떠도될거같아그냥 픽으로 / 예전 에디터 에서 전송한거랑 같은 결로」 · 봄 29) · 깃)
//   보내는 꼴 = 요약 요청 창(../ui/ask.tsx send)과 같은 POST /api/submit · preset = 창 기본(DEF) 그대로에 fp(외신)만 기사 출처로 저절로 · 「주요 기사부터」 = mj 1(기본 그대로)
//   외신 판별 = 링크 주소: .kr · 국내 매체 .com/.net · 포털(네이버·다음) = 국내 · 그 밖 = 외신

const KR_HOSTS = ["naver.com", "daum.net", "kakao.com", "chosun.com", "donga.com", "hankyung.com", "joongang.com", "hani.com", "khan.com", "mk.com", "sedaily.com", "newsis.com", "news1.com", "heraldcorp.com", "hankookilbo.com", "segye.com", "munhwa.com", "ohmynews.com", "pressian.com", "nocutnews.com", "mt.com", "edaily.com", "fnnews.com", "etnews.com", "bloter.net", "inews24.com", "starnewskorea.com", "xportsnews.com", "dispatch.com", "tvreport.com", "sportsseoul.com", "osen.com", "imbc.com", "jtbc.com", "ytn.com", "sbs.com", "kbs.com", "yna.com", "koreaherald.com", "koreatimes.com", "koreajoongangdaily.com", "nate.com", "zum.com", "mbn.com", "tvchosun.com", "ichannela.com", "wikitree.com", "insight.com", "theqoo.net", "dcinside.com", "fmkorea.com", "ruliweb.com", "clien.net", "instiz.net", "ppomppu.com", "mlbpark.com", "bobaedream.com"];

/** 링크가 외신이면 true — 주소 못 읽음 = 국내(외신 칸 끔 = 창 기본과 같음) */
export function isForeignUrl(url: string | undefined): boolean {
  let host = "";
  try { host = new URL(String(url || "")).hostname.toLowerCase().replace(/^www\./, ""); } catch { return false; }
  if (!host) return false;
  if (host.endsWith(".kr")) return false;
  const base = host.split(".").slice(-2).join(".");
  if (KR_HOSTS.some((h) => host === h || host.endsWith(`.${h}`) || base === h)) return false;
  return true;
}

export type QuickPreset = { h24: 0 | 1; fp: 0 | 1; mj: 0 | 1; og: 0 | 1; noai: 0 | 1; know: 0 | 1 };
/** 창 기본(../ui/ask.tsx DEF)에 fp 만 기사 출처로 */
export const presetFor = (url: string | undefined): QuickPreset => ({ h24: 1, fp: isForeignUrl(url) ? 1 : 0, mj: 1, og: 0, noai: 1, know: 0 });

/** 바로 보냄 — 성공 = 접수 id(없으면 "") · 실패 = 던짐(까닭 글) */
export async function quickSend(title: string, url: string): Promise<string> {
  const text = [title, url].filter(Boolean).join("\n").trim();
  if (!text) throw new Error("보낼 제목·링크가 없어");
  return submitText(text, url, presetFor(url));
}

/** 글 그대로 보냄(뉴스 에디터 넣는 줄 · ../ui/news-editor.tsx) — 같은 POST /api/submit · preset 은 부르는 쪽이 고름 */
export async function submitText(text: string, url: string, preset: QuickPreset | Readonly<QuickPreset>): Promise<string> {
  if (!text.trim()) throw new Error("보낼 글·링크가 없어");
  const r = await fetch("/api/submit", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, link: /^https?:\/\//i.test(url) ? url : undefined, images: [], nothumb: preset.noai, preset }) });
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("json")) throw new Error(r.status === 200 ? "로그인이 끝났어 — 새로 고쳐 다시 로그인" : `서버 ${r.status}`);
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string };
  if (!(r.ok && d.ok)) throw new Error(d.error || `서버 ${r.status}`);
  return d.id || "";
}

// 홈 2~4/6 = 뉴스 피드 간소(형 10-28 11:29 「뉴스피드 간소화 (지금 이미 웹에 만든 형태 나쁘지않아) - 지금과 동일하게 넘어가는 느낌으로 톤만 예타톤으로」) —
//   원본 = 지금 에디터 첫 화면(edit.nomute.kr/) 카드 덱 그대로: 화면·넘김 = 에디터 viewer/modern-home.html 을 품음(같은 주소 · 사본 0) ·
//   카드 재료 = 에디터 viewer/modern-data.js project()(같은 주소에서 불러 씀 · 사본 0) 에 에디터 홈과 같은 원천(순위 api/trends?f=overlap → overlap_latest.json ·
//   수집함 api/candidates · 요약 articles.json · 사진 api/trends?f=images → rss_images.json · 피드 알파 = 같은 기기 설정 nm_home_alpha + feed_alpha.json) ·
//   부모 몫(에디터 modern-workspace.js 홈 부분과 같은 글 꼴 · 채널 nomute-modern-home: connect → ready → snapshot · refresh/reload = 다시 받기 · suspend = 숨으면 쉼).
//   간소 = 팔로워 띠(IG·FB)·PICK 단추 뺌(PICK 은 에디터에서) · 톤 = YETA 토큰을 품은 화면에 덧씌움(어둡게·밝게 = 앱 따라) ·
//   실검 키워드 띠 = 뺌(형 12:21 「키워드 빼도 될거같아 카드에 그만큼 사진이 더 보이면 됨」) · 카드 높이 = 품은 칸 전부(원본은 에디터 아래 독 몫을 빼서 칸 아래가 비었음 → 독 몫 0) ·
//   사진 자르기·비율 = 원본 그대로(황금비 상한 · cover) = 카드가 길어진 만큼 사진이 덜 잘리고 아래 출처 줄이 더 보임.
//   보이는 후보 = 에디터 scHomeCandidates 와 같은 거름(home-pool.ts · 서버 트리아지·병합 + 이 기기 기록 · 같은 기사 접기·자동 묶음) · PICK 상태 = 안 보임.
import { useEffect, useLayoutEffect, useRef } from "react";
import { pollOff } from "../data/poll-linux";
import { hookFrame, toneFrame } from "../ui/inapp";
import { homePool } from "./home-pool";
import { SendButton } from "./send-button";   // 「뉴스 요약」 모달 단추 → 「전송」(그 기사 요약 요청 폼 열기 · 형 10-31 12:2x) · summary-button.tsx 는 안 부름(파일 그대로)
import { rssFirst } from "./rss-first";
import { byEvent, eventIndex, eventOf, type EventHit, type NewsEvent, scaleOf, shownScore } from "./event-score";   // 카드 점수 · 차례 = 뉴스 알고리즘 하나(형 11-11 08:53 봄 1:1 「글구 메인화면에서 그 점수 별로 카드 보이는거 잇지? 그거 점수마다 보여야 함 한 알고리즘 대로」 · 아래 Hot Issue 와 같은 맞추기)

const CHANNEL = "nomute-modern-home";
export const ALPHA_EVERY = [0, 6, 4, 2], ALPHA_KEY = "nm_home_alpha";   // 에디터 modern-workspace.js 와 같은 값·같은 열쇠(같은 주소 = 같은 기기 설정)
/** 픽 차례(형 11-06 00:28 「촉픽이 제일 전면 틈픽이 그 다음」) = 촉 → 틈 → 나머지 봇 · 같은 봇 안에선 받은 차례(서버 = 점수순) 그대로 · 둘 다 고른 기사는 앞에 온 촉 쪽 칩이 대표(modern-data project = 먼저 온 픽이 그 카드 주인) */
const PICK_RANK: Record<string, number> = { 촉: 0, chok: 0, 틈: 1, teum: 1 };
export const pickOrder = (list: unknown[]) => list.map((p, i) => ({ p, i, r: PICK_RANK[String((p as { by?: unknown })?.by ?? "").trim()] ?? 2 })).sort((a, b) => a.r - b.r || a.i - b.i).map((x) => x.p);
const OVERLAP_EVERY = 60_000, IMAGES_EVERY = 5 * 60_000, PICKS_EVERY = 2 * 60_000;   // 틈·촉 픽 = 판이 40분마다라 2분에 한 번만(에디터 modern-workspace.js loadPicks 와 같음)

export type Cand = { id?: string; url?: string; title?: string; title_clean?: string; title_ko?: string; title_ko_of?: string; media?: string; published?: string; hp?: string; breaking_pick?: { url?: string }; _disp?: Cand };
type Modern = { project: (o: unknown, c: Cand[], a: unknown[], s: () => null, opt: Record<string, unknown>) => { rows: unknown[]; lookup?: Map<string, unknown> }; validOverlap: (o: unknown) => boolean;
  imageAsks?: (rows: unknown[], tried: Set<string>, limit?: number) => string[]; mergeImages?: (base: unknown, extra: Record<string, string>) => unknown; url?: (u: unknown) => string };
declare global { interface Window { ModernData?: Modern } }

export async function firstJson<T>(urls: string[], ok: (v: T) => boolean = () => true): Promise<T | null> {   // 에디터와 같은 차례(api 먼저 → 정적) · HTML 폴백(200) 거름
  for (const u of urls) {
    try {
      const r = await fetch(u, { cache: "no-store", credentials: "same-origin" });
      if (!r.ok) continue;
      const t = await r.text();
      if (/^\s*</.test(t)) continue;
      const v = JSON.parse(t) as T;
      if (ok(v)) return v;
    } catch { /* 다음 원천 */ }
  }
  return null;
}
let modernP: Promise<Modern | null> | null = null;
export const modernData = () => (modernP ||= new Promise((res) => {   // 에디터 원본 /modern-data.js 를 그대로 불러 씀(한 번)
  if (window.ModernData) return res(window.ModernData);
  const s = document.createElement("script");
  s.src = "/modern-data.js"; s.async = true;
  s.onload = () => res(window.ModernData || null); s.onerror = () => res(null);
  document.head.appendChild(s);
}));
// 에디터 scPickUrl · scHomeMetadata 와 같은 셈(viewer-src 34-checkFreshLane · 35-applyAutoGroups) — 묶음 기사(hp)는 그 픽 기사 주소·시각
const hpOk = (c: Cand) => !!c.hp && Date.parse(c.hp) <= Date.now() + 60000;
export const pickUrl = (c: Cand): string => (c._disp ? pickUrl(c._disp) : hpOk(c) && c.breaking_pick && /^https?:\/\//i.test(c.breaking_pick.url || "") ? c.breaking_pick.url! : c.url || "");
const pubIso = (c: Cand): string | undefined => (c._disp ? pubIso(c._disp) : hpOk(c) ? c.hp : c.published);
export const homeMeta = (c: Cand) => { let d = c; while (d._disp) d = d._disp; return { title: d.title_clean || (d.title_ko && d.title_ko_of === d.title ? d.title_ko : "") || d.title || "",   /* title_clean = 서버가 다듬은 제목(뜸 · 형 11-05 16:14 「항상 뉴스에는 다듬어져서」) */ published: { at: pubIso(c), sourceUrl: pickUrl(c), sourceName: d.media } }; };   // 묶음 = 따라간 형제의 제목·시각(scHomeMetadata)

/** 품은 화면 톤 = YETA(ui/inapp.ts yetaTone · 결의 방·토큰·피드백과 같은 값)에 덱만의 덧줄 · 간소 = 팔로워 띠·PICK 뺌 */
// 고른 카드(틈·촉 픽) = 얼굴 배지 · 라임 겉 테 · 번짐 빛 없음(형 11-09 08:13 임시방 「글구 이제 틈 촉 플필 모양이랑 겉면에 라인 이랑 번짐? 이거 없어도 될듯」 · 97789.jpg · 뜸) — 옛 줄 = .article-card:has(.article-pick) 라임 테·번짐
const DECK = (dark: boolean) => `:root{--modern-space-bg:transparent}.deck{--card-solid:${dark ? "#1b1c1b" : "#f4f5f3"}}
.practical-main{--reader-top-gap:0px;--reader-dock-clear:0px;--menu-dock-gap:0px;--modern-menu-height:0px;--home-pulse-h:0px!important}
#home-pulse{display:none!important}.reader-actions .pick-control{display:none!important}
.article-signals{display:none!important}
.publish-elapsed,.publish-elapsed[data-age-band]{color:var(--accent)!important}
.article-publisher .pub-more{transform:translateY(.08em)!important;font-variant-numeric:tabular-nums}
.article-lead>.article-media{flex:1 1 auto!important;aspect-ratio:auto!important}
.article-media{--article-image-h:clamp(156px,34svh,330px)!important}
.practical-main .score-lead strong{color:var(--accent)!important;text-shadow:0 0 14px color-mix(in srgb,var(--accent) 22%,transparent)!important}
.article-pick{display:none!important}
@media (max-width:480px){
.practical-main .deck>.deck-fan{height:auto;bottom:var(--reader-peek)}
.article-schedule:has(>.article-publisher):has(>.article-pick){flex-wrap:wrap;row-gap:0}
.article-schedule:has(>.article-publisher):has(>.article-pick)>.meta-published{flex:0 0 100%}
.article-schedule:has(>.article-publisher):has(>.article-pick)>.meta-published+.meta-chip::before{content:none}
}`;
// 11-11 사진 높이 26svh(상한 234) → 34svh(상한 330) = 길어진 카드 아래 빈 데를 사진이 씀 → ✓ 단추가 사진 · 출처 줄 위 귀퉁이에 겹침(폰 390 실물 · 앞 판은 사진 밑에 빈 줄이 남아 단추가 제 자리를 먹은 꼴)
// 11-11 형 18:48 봄 1:1 「카드가 좀 더 내려와도 될거같아 길어지고」 · 18:49 「이정도인데 체크표시가 아래를 좀 먹을 필요가 없음」 「우측으로 가서 겹쳐도 되거든」 → 아래 ①(글만큼 높이) · ②(단추 자리 SEND_ROOM)를 걷음 = 사진 없는 카드도 칸 높이 다 씀 · ✓ 단추는 카드 오른쪽 아래 귀퉁이에서 글·사진 위에 겹쳐 뜸(send-button.tsx 자리 셈 그대로) · 앞 판 = git
// (앞 판) 폰 폭(품은 화면 480 이하 · 형 11-05 사진 「모바일 버전 해결점」) = ① 사진 없는 카드 = 높이를 글만큼(옛 = 품은 칸 전부라 아래가 텅 빔 · 카드 높이 셈 --reader-card-height 는 상한으로만 · 사진 카드는 사진이 남는 높이를 채우던 그대로)
//   뒤 장 둘(.deck-fan) = 높이 못 박지 않고 앞 카드 높이(덱 아래 입술 몫만 뺌) = 짧은 카드 뒤로 긴 장이 안 삐져나옴 · 넘김 복사본(card-exit)은 덱이 넘길 때 잰 높이를 그대로 씀
//   ② 카드 아래 안쪽에 전송 단추 자리(SEND_ROOM · send-button.tsx 가 그 자리 = 카드 오른쪽 아래 안으로 옮김 · 옛 = 카드 오른쪽 끝에 반쯤 걸쳐 화면 밖으로 나갔음)
//   ③ 픽 얼굴 있는 줄 = 시각·몇 시간 전 한 줄 + 매체·얼굴 다음 줄(옛 = 한 줄에 다 넣느라 매체 이름이 「n.news.naver…」로 잘렸음 · 그래도 넘치면 끝만 「…」 · 줄 머리 점은 뺌)
// 픽 카드(촉·틈 · 칩 .article-pick 있는 카드) = 라임 테두리 + 옅은 번짐(형 11-06 00:28 「3에 라임색 테두리 걸쳐서 나타나면 좋겠어」) · 테두리 두께는 카드 원래 1px 그대로(높이 셈 안 흔듦) · 번짐은 바깥 그림자로
// 점수 = 단계 색(modern-score.css) 대신 시그니처 색 한 가지(형 10-31 「점수, 시그니처 색으로 점수 나오게해주라」) · 홈 안에서만
// 사진 높이 = 덱 셈(clamp(120px,20svh,180px) · 라이브 121px)을 통째로 1.3배(형 11-03 17:26 「지금 거의 가로가 긴데, 세로로 1.3배만 더 길게 노출되게해줘 메인 화면 사진.」 · 「그만큼 아래에 댓글? 그런거 안보이면 됨.」 = 아래 출처 줄은 밀려 내려가도 됨) · 홈 안에서만(웹 에디터 홈 그대로)
// 위 덧줄 넷(형 10-31 12:2x 홈 사진) = ① 「이슈 근거 : …」 줄 안 보임(.article-signals · 화제 유발 원인·내용 줄은 그대로) ② 시각 줄 둘 다 형광(time 은 원래 --accent · 「n시간 전」 .publish-elapsed 는 나이 띠 색이던 것 → --accent · 윈터 12:31 「둘 다 형광」)
//   ③ 사진 = 카드 남는 높이를 다 차지(.article-media flex 1 · 황금비 상한 풀기 · 원본은 clamp(120px,20svh,180px) 최소 + 1.618 비율) ④ 「외 +3」 광학 보정(형 「+3 이거 수평을 광학 잉크 단위로 맞춰주고」 · 원본 .05em 아래 → .08em · 화면 못 봐서 ±.03em 은 윈터가 보고)

/** 카드 판이 뼈대인 동안 = 도착한 메시지·전송 단추 숨김(html[data-deck-wait] · home-scene.css · 형 11-04 13:24) · 판이 가면 한 박자 뒤 스르륵 · 못 받아도 8초 뒤엔 보임 */
let deckT = 0;
const deckWait = () => { const h = document.documentElement; h.setAttribute("data-deck-wait", ""); clearTimeout(deckT); deckT = window.setTimeout(deckIn, 8000); };
const deckIn = () => { const h = document.documentElement; if (!h.hasAttribute("data-deck-wait")) return; clearTimeout(deckT); deckT = window.setTimeout(() => { h.removeAttribute("data-deck-wait"); h.setAttribute("data-deck-in", ""); window.setTimeout(() => h.removeAttribute("data-deck-in"), 1200); }, 300); };
export function NewsFeed({ onShown }: { onShown?: () => void } = {}) {   // onShown = 카드 첫 판이 품은 화면에 간 때 한 번(홈 「다 깸」 띠가 그 뒤에 뜸 · 형 11-02 23:17)
  const frame = useRef<HTMLIFrameElement>(null);
  const shownCb = useRef(onShown);
  shownCb.current = onShown;
  useEffect(() => {
    let live = true, ready = false, shown = false, version = 0, snap: { rows: unknown[]; status: Record<string, unknown> } | null = null;
    let events: NewsEvent[] | null = null, scale: number | null = null;   // 사건 묶음 점수(score100 · /api/trends?f=event · 1분마다 · 못 받으면 앞 판)
    let cands: Cand[] = [], articles: unknown[] = [], overlap: unknown = null, images: unknown = null, alpha: unknown = null, imagesAt = 0, triage: unknown = null, merges: unknown = null, picks: unknown[] = [], picksAt = 0;
    // 사진 없는 카드 채우기(형 11-03 12:46 「그리고 메인에 사진 없는 이슈는 없게 하고픈데 …」 · 뜸 에디터 홈 #2253 과 같은 꼴) = 다 그린 뒤 사진 없는 행의 기사 주소를 사무실 링크 카드(/api/office/linkcard · og:image · R2 7일)로 읽어 사진 지도에 더하고 다시 그림 · 동시 4 · 한 바퀴 24 · 물은 주소는 다시 안 물음
    const linkImages: Record<string, string> = {}, linkTried = new Set<string>();
    const linkNotes: Record<string, string> = {};   // 짐작 그림 표시(서버 image_note 「검색 그림」) · 에디터 modern-workspace.js 와 같은 꼴(빠르 #2260 · 칩 = 덱 modern-card-content articleMedia)
    let linkCount = 0, linkTask: Promise<void> | null = null, lastRows: unknown[] = [];
    const post = (type: string, detail: Record<string, unknown> = {}) => frame.current?.contentWindow?.postMessage({ channel: CHANNEL, type, ...detail }, location.origin);
    const send = () => {
      if (!ready || !snap) return;
      post("snapshot", { version, ...snap });
      if (!shown) { shown = true; shownCb.current?.(); }
      deckIn();
    };
    const rebuild = async () => {
      const md = await modernData();
      if (!live || !md) return;
      let a = 0; try { a = Math.max(0, Math.min(ALPHA_EVERY.length - 1, Math.floor(+(localStorage.getItem(ALPHA_KEY) || 0)))); } catch { /* 기본 0 */ }
      const { rows: rows0 } = md.project(overlap, cands, articles, () => null, { mixNews: a ? ALPHA_EVERY[a] : 1, alphaProfile: alpha, visibleCandidates: homePool(cands, triage, merges), urls: (c: Cand) => [pickUrl(c)], metadata: homeMeta, images: linkCount && md.mergeImages ? md.mergeImages((images as { images?: unknown } | null)?.images, linkImages) : (images as { images?: unknown } | null)?.images, picks });
      let rows = a ? rows0 : (rssFirst(rows0 as { type?: string }[]) as typeof rows0);   // 기본 = RSS 바탕(형 09:34 · ./rss-first.ts)
      for (const row of rows as { meta?: { images?: { url?: string; sourceUrl?: string; note?: string }[] } }[]) for (const im of row?.meta?.images || []) if (im.sourceUrl && linkNotes[im.sourceUrl] && (md.url ? md.url(im.url) === md.url(linkImages[im.sourceUrl]) : im.url === linkImages[im.sourceUrl])) im.note = linkNotes[im.sourceUrl];   // 그 사진 위 「검색 그림」 칩 · 같은 주소에 RSS 사진이 이기면 표시 안 함
      // 카드마다 통합 점수(맞춘 사건 score100 · 정수로 찍음 = 덱 score_int) · 못 맞춘 카드 = 「—」(옛 점수 안 섞음) · 차례 = 점수 큰 것부터 · 같은 사건 한 장 · 못 맞춘 카드는 뒤에 앞 차례(byEvent = Hot Issue 와 같음)
      //   앞 판 = 점수 없음(카드마다 「—」) · 차례 = RSS 바탕 + 커뮤 묶음 + 픽 촉 → 틈(형 11-06)
      const ei = eventIndex(events), hits = new Map<unknown, EventHit>();
      for (const r of rows as Record<string, unknown>[]) {
        const h = eventOf(r as Parameters<typeof eventOf>[0], ei);
        if (h) { hits.set(r, h); r.score = shownScore(h.s, scale); r.score_int = true; }   // 보이는 숫자만 폄 · 차례 = h.s else { delete r.score; delete r.score_int; }
      }
      if (ei.size) rows = byEvent(rows, (r) => hits.get(r) || null);
      lastRows = rows;
      const generated = (overlap as { generated?: string } | null)?.generated || null;
      snap = { rows, status: { state: rows.length ? "ready" : overlap ? "empty" : "error", message: rows.length ? "" : overlap ? "지금 보여 줄 기사가 없어." : "기사 순위를 못 받았어.", generated, source: "live" } };
      version++; send();
      void fillImages(md);
    };
    const fillImages = (md: Modern): Promise<void> | null => {
      if (linkTask || !md.imageAsks) return linkTask;
      const queue = md.imageAsks(lastRows, linkTried, 24);
      if (!queue.length) return null;
      const titleOf = new Map<string, string>();   // 사진 사다리 ⑥(형 11-03 「정확한 사진이 아니더라도, 그 이슈와 유사한 사진을 가져오는게 포인트야」) = 카드 제목을 q 로 → 그 글에서 못 받으면 서버가 같은 이슈 검색 그림
      for (const row of lastRows as { urls?: string[]; title?: string }[]) for (const u of Array.isArray(row?.urls) ? row.urls : []) if (!titleOf.has(u) && row.title) titleOf.set(u, String(row.title).slice(0, 120));
      queue.forEach((u) => linkTried.add(u));
      linkTask = (async () => {
        let got = 0;
        const worker = async () => {
          for (let u = queue.shift(); u; u = queue.shift()) {
            const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
            try {
              const q = titleOf.get(u) ? "&q=" + encodeURIComponent(titleOf.get(u)!) : "";
              const r = await fetch("/api/office/linkcard?url=" + encodeURIComponent(u) + q, { credentials: "same-origin", signal: ctl.signal });
              if (!r.ok) continue;
              const v = (await r.json()) as { ok?: boolean; card?: { kind?: string; image?: string; image_src?: string; image_note?: string } };
              const c = v?.ok ? v.card : undefined;   // 막힌 글(봇벽)도 검색 그림(image_src search)이면 씀 · 그 표시 = image_note
              const img = c && (c.kind === "page" || c.image_src === "search") ? (md.url ? md.url(c.image) : String(c.image || "")) : "";
              if (img) { linkImages[u] = img; if (c?.image_note) linkNotes[u] = c.image_note; got++; }
            } catch { /* 이 주소는 사진 없이 */ } finally { clearTimeout(t); }
          }
        };
        await Promise.all(Array.from({ length: 4 }, worker));
        if (live && got) { linkCount += got; await rebuild(); }
      })().finally(() => { linkTask = null; if (live) setTimeout(() => void fillImages(md), 0); });
      return linkTask;
    };
    const load = async (force = false) => {
      const md = await modernData();
      const [o, c, ar, tr, mg] = await Promise.all([
        firstJson<unknown>(["/api/trends?f=overlap", "/overlap_latest.json"], (v) => !!md && md.validOverlap(v)),
        firstJson<Cand[]>(["/api/candidates", "/candidates.json"], Array.isArray),
        articles.length && !force ? Promise.resolve(articles) : firstJson<unknown[]>(["/articles.json"], Array.isArray),
        firstJson<unknown[]>(["/triage-state.json"], Array.isArray),   // 서버 트리아지 장부(전 기기 PASS·👎·확인 · 에디터 loadTriage 와 같은 파일)
        firstJson<unknown>(["/merges.json"], (v) => !!v && typeof v === "object" && !Array.isArray(v)),   // 서버 손 병합(에디터 loadMergesSrv 와 같은 파일)
      ]);
      if (o) overlap = o; if (c) cands = c; if (ar) articles = ar; if (tr) triage = tr; if (mg) merges = mg;
      if (!imagesAt || Date.now() - imagesAt > IMAGES_EVERY) { imagesAt = Date.now(); images = (await firstJson(["/api/trends?f=images", "/rss_images.json"])) || images; }
      if (alpha == null) alpha = (await firstJson(["/feed_alpha.json"])) || {};
      const ev = await firstJson<{ events?: NewsEvent[] }>(["/api/trends?f=event"], (v) => !!v && Array.isArray(v.events) && v.events.length > 0);
      if (ev) { events = ev.events || null; scale = scaleOf(ev); }
      if (!picksAt || Date.now() - picksAt > PICKS_EVERY) {   // 틈·촉 픽(형 11-03 09:57 「그 메인카드에 틈이나, 점수 반영된 이슈가 카드로 안뜨는거 같은데」 · 뜸 api/trends?f=picks) = 기사 주소 있는 픽만 · 못 받으면 받아 둔 그대로(없으면 픽 없이 = 홈 그대로)
        const pk = await firstJson<{ picks?: unknown[] }>(["/api/trends?f=picks"], (v) => !!v && Array.isArray(v.picks));
        if (pk) { picks = pickOrder(pk.picks || []); picksAt = Date.now(); }
      }
      await rebuild();
    };
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return;
      const m = e.data as { channel?: string; type?: string };
      if (!m || m.channel !== CHANNEL) return;
      if (m.type === "ready") { ready = true; send(); post("suspend", { hidden: document.hidden }); }   // 덱이 다시 불려 와도(뼈대부터) ready 가 다시 옴 → 다음 판까지 deckWait(아래 onLoad)
      else if (m.type === "refresh" || m.type === "reload") void load(true);
    };
    const onVis = () => post("suspend", { hidden: document.hidden });
    window.addEventListener("message", onMsg);
    document.addEventListener("visibilitychange", onVis);
    void load();
    const t1 = setInterval(() => { if (!pollOff()) void load(); }, OVERLAP_EVERY);   // 숨은 탭 · 리눅스 데스크톱 = 쉼
    return () => { live = false; clearInterval(t1); window.removeEventListener("message", onMsg); document.removeEventListener("visibilitychange", onVis); };
  }, []);
  useEffect(() => {   // 품은 화면 톤 = 앱의 어둡게·밝게를 따라 덧씌움 · 카드 출처 링크(원본 target=_blank) = 앱 안 #/web(ui/inapp.ts · 형 15:32)
    const el = frame.current;
    const offTone = toneFrame(el, DECK);
    const offLinks = hookFrame(el);
    return () => { offTone(); offLinks(); };
  }, []);
  const onLoad = () => { deckWait(); frame.current?.contentWindow?.postMessage({ channel: CHANNEL, type: "connect" }, location.origin); };
  useLayoutEffect(() => { deckWait(); return () => { document.documentElement.removeAttribute("data-deck-wait"); }; }, []);
  return (
    <section aria-label="뉴스 피드" className="relative flex min-h-0 flex-col" style={{ gridRow: 2 }}>   {/* 줄 자리 못 박음 = 띠(1줄)가 늦게 생겨도 이 칸이 1줄(높이 자동)로 끌려가지 않음(형 11-03 12:45) */}
      <iframe ref={frame} src="/modern-home.html" title="뉴스 피드" onLoad={onLoad} className="min-h-0 w-full flex-1 border-0 bg-transparent" />
      <SendButton frame={frame} />
    </section>
  );
}

// 홈 2~4/6 = 뉴스 피드 간소(형 10-28 11:29 「뉴스피드 간소화 (지금 이미 웹에 만든 형태 나쁘지않아) - 지금과 동일하게 넘어가는 느낌으로 톤만 예타톤으로」) —
//   원본 = 지금 에디터 첫 화면(edit.nomute.kr/) 카드 덱 그대로: 화면·넘김 = 에디터 viewer/modern-home.html 을 품음(같은 주소 · 사본 0) ·
//   카드 재료 = 에디터 viewer/modern-data.js project()(같은 주소에서 불러 씀 · 사본 0) 에 에디터 홈과 같은 원천(순위 api/trends?f=overlap → overlap_latest.json ·
//   수집함 api/candidates · 요약 articles.json · 사진 api/trends?f=images → rss_images.json · 피드 알파 = 같은 기기 설정 nm_home_alpha + feed_alpha.json) ·
//   부모 몫(에디터 modern-workspace.js 홈 부분과 같은 글 꼴 · 채널 nomute-modern-home: connect → ready → snapshot · refresh/reload = 다시 받기 · suspend = 숨으면 쉼).
//   간소 = 팔로워 띠(IG·FB)·PICK 단추 뺌(PICK 은 에디터에서) · 톤 = YETA 토큰을 품은 화면에 덧씌움(어둡게·밝게 = 앱 따라) ·
//   실검 키워드 띠 = 뺌(형 12:21 「키워드 빼도 될거같아 카드에 그만큼 사진이 더 보이면 됨」) · 카드 높이 = 품은 칸 전부(원본은 에디터 아래 독 몫을 빼서 칸 아래가 비었음 → 독 몫 0) ·
//   사진 자르기·비율 = 원본 그대로(황금비 상한 · cover) = 카드가 길어진 만큼 사진이 덜 잘리고 아래 출처 줄이 더 보임.
//   보이는 후보 = 에디터 scHomeCandidates 와 같은 거름(home-pool.ts · 서버 트리아지·병합 + 이 기기 기록 · 같은 기사 접기·자동 묶음) · PICK 상태 = 안 보임.
import { useEffect, useRef } from "react";
import { homePool } from "./home-pool";
import { SummaryButton } from "./summary-button";

const CHANNEL = "nomute-modern-home";
const ALPHA_EVERY = [0, 6, 4, 2], ALPHA_KEY = "nm_home_alpha";   // 에디터 modern-workspace.js 와 같은 값·같은 열쇠(같은 주소 = 같은 기기 설정)
const OVERLAP_EVERY = 60_000, IMAGES_EVERY = 5 * 60_000;

type Cand = { id?: string; url?: string; title?: string; title_ko?: string; title_ko_of?: string; media?: string; published?: string; hp?: string; breaking_pick?: { url?: string }; _disp?: Cand };
type Modern = { project: (o: unknown, c: Cand[], a: unknown[], s: () => null, opt: Record<string, unknown>) => { rows: unknown[] }; validOverlap: (o: unknown) => boolean };
declare global { interface Window { ModernData?: Modern } }

async function firstJson<T>(urls: string[], ok: (v: T) => boolean = () => true): Promise<T | null> {   // 에디터와 같은 차례(api 먼저 → 정적) · HTML 폴백(200) 거름
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
const modernData = () => (modernP ||= new Promise((res) => {   // 에디터 원본 /modern-data.js 를 그대로 불러 씀(한 번)
  if (window.ModernData) return res(window.ModernData);
  const s = document.createElement("script");
  s.src = "/modern-data.js"; s.async = true;
  s.onload = () => res(window.ModernData || null); s.onerror = () => res(null);
  document.head.appendChild(s);
}));
// 에디터 scPickUrl · scHomeMetadata 와 같은 셈(viewer-src 34-checkFreshLane · 35-applyAutoGroups) — 묶음 기사(hp)는 그 픽 기사 주소·시각
const hpOk = (c: Cand) => !!c.hp && Date.parse(c.hp) <= Date.now() + 60000;
const pickUrl = (c: Cand): string => (c._disp ? pickUrl(c._disp) : hpOk(c) && c.breaking_pick && /^https?:\/\//i.test(c.breaking_pick.url || "") ? c.breaking_pick.url! : c.url || "");
const pubIso = (c: Cand): string | undefined => (c._disp ? pubIso(c._disp) : hpOk(c) ? c.hp : c.published);
const homeMeta = (c: Cand) => { let d = c; while (d._disp) d = d._disp; return { title: (d.title_ko && d.title_ko_of === d.title ? d.title_ko : "") || d.title || "", published: { at: pubIso(c), sourceUrl: pickUrl(c), sourceName: d.media } }; };   // 묶음 = 따라간 형제의 제목·시각(scHomeMetadata)

/** 품은 화면 톤 = YETA(ui/yeta-settings.css 값과 같음) · 간소 = 팔로워 띠·PICK 뺌 · 바탕 = 비움(앱 바탕이 비침). */
const TONE = (dark: boolean) => `:root{color-scheme:${dark ? "dark" : "light"};--modern-space-bg:transparent;--modern-page:transparent;--modern-stage:transparent;
--modern-fg:${dark ? "#FFFFFF" : "#161716"};--modern-ink:${dark ? "#FFFFFF" : "#161716"};--modern-mut:${dark ? "#8B8F8A" : "#6f736e"};--modern-muted:${dark ? "#8B8F8A" : "#6f736e"};
--modern-accent:${dark ? "#CFFF40" : "#4f7a00"};--modern-accent-rgb:${dark ? "207,255,64" : "79,122,0"};--modern-on-accent:${dark ? "#161716" : "#ffffff"};
--modern-line:${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.09)"};--modern-line2:${dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"};
--modern-glass-edge:${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.09)"};--modern-glass-highlight:${dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.6)"};
--modern-card:${dark ? "rgba(255,255,255,.005)" : "rgba(0,0,0,.02)"};--modern-glass2:${dark ? "rgba(255,255,255,.005)" : "rgba(0,0,0,.02)"};
--modern-well:${dark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};--modern-control-glass:${dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)"};
--modern-modal-head-bg:${dark ? "rgba(22,23,22,.85)" : "rgba(255,255,255,.85)"};--modern-action-symbol:${dark ? "#fff" : "#161716"};
--modern-silk-glass:${dark ? "rgba(255,255,255,.005)" : "rgba(0,0,0,.02)"};--modern-panel-shadow:inset 0 1px 0 ${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.09)"},0 24px 60px rgba(0,0,0,${dark ? ".42" : ".08"})}
.deck{--card-solid:${dark ? "#1b1c1b" : "#f4f5f3"}}
.practical-main{--reader-top-gap:0px;--reader-dock-clear:0px;--menu-dock-gap:0px;--modern-menu-height:0px;--home-pulse-h:0px!important}
html,body{background:transparent!important}#home-pulse{display:none!important}.reader-actions .pick-control{display:none!important}`;

export function NewsFeed() {
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    let live = true, ready = false, version = 0, snap: { rows: unknown[]; status: Record<string, unknown> } | null = null;
    let cands: Cand[] = [], articles: unknown[] = [], overlap: unknown = null, images: unknown = null, alpha: unknown = null, imagesAt = 0, triage: unknown = null, merges: unknown = null;
    const post = (type: string, detail: Record<string, unknown> = {}) => frame.current?.contentWindow?.postMessage({ channel: CHANNEL, type, ...detail }, location.origin);
    const send = () => { if (ready && snap) post("snapshot", { version, ...snap }); };
    const rebuild = async () => {
      const md = await modernData();
      if (!live || !md) return;
      let a = 0; try { a = Math.max(0, Math.min(ALPHA_EVERY.length - 1, Math.floor(+(localStorage.getItem(ALPHA_KEY) || 0)))); } catch { /* 기본 0 */ }
      const { rows } = md.project(overlap, cands, articles, () => null, { mixNews: ALPHA_EVERY[a], alphaProfile: alpha, visibleCandidates: homePool(cands, triage, merges), urls: (c: Cand) => [pickUrl(c)], metadata: homeMeta, images: (images as { images?: unknown } | null)?.images });
      const generated = (overlap as { generated?: string } | null)?.generated || null;
      snap = { rows, status: { state: rows.length ? "ready" : overlap ? "empty" : "error", message: rows.length ? "" : overlap ? "지금 보여 줄 기사가 없어." : "기사 순위를 못 받았어.", generated, source: "live" } };
      version++; send();
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
      await rebuild();
    };
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return;
      const m = e.data as { channel?: string; type?: string };
      if (!m || m.channel !== CHANNEL) return;
      if (m.type === "ready") { ready = true; send(); post("suspend", { hidden: document.hidden }); }
      else if (m.type === "refresh" || m.type === "reload") void load(true);
    };
    const onVis = () => post("suspend", { hidden: document.hidden });
    window.addEventListener("message", onMsg);
    document.addEventListener("visibilitychange", onVis);
    void load();
    const t1 = setInterval(() => { if (!document.hidden) void load(); }, OVERLAP_EVERY);
    return () => { live = false; clearInterval(t1); window.removeEventListener("message", onMsg); document.removeEventListener("visibilitychange", onVis); };
  }, []);
  useEffect(() => {   // 품은 화면 톤 = 앱의 어둡게·밝게를 따라 덧씌움(바뀌면 다시)
    const el = frame.current;
    if (!el) return;
    const paint = () => {
      const doc = el.contentDocument;
      if (!doc || !doc.head) return;
      let s = doc.getElementById("nm-yeta-tone") as HTMLStyleElement | null;
      if (!s) { s = doc.createElement("style"); s.id = "nm-yeta-tone"; doc.head.appendChild(s); }
      s.textContent = TONE(document.documentElement.classList.contains("dark"));
    };
    el.addEventListener("load", paint);
    paint();
    const mo = new MutationObserver(paint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { el.removeEventListener("load", paint); mo.disconnect(); };
  }, []);
  const onLoad = () => frame.current?.contentWindow?.postMessage({ channel: CHANNEL, type: "connect" }, location.origin);
  return (
    <section aria-label="뉴스 피드" className="relative flex min-h-0 flex-col">
      <iframe ref={frame} src="/modern-home.html" title="뉴스 피드" onLoad={onLoad} className="min-h-0 w-full flex-1 border-0 bg-transparent" />
      <SummaryButton />
    </section>
  );
}

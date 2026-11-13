// PC 반갈 오른쪽 아래 = 실시간 뉴스 「제목만」 목록(형 11-05 14:39 「웅 pc판은 아예 뉴스에 아예 그림안뜨게 컴팩트하게 타이틀만 보이게 가보자.」 · 「사무실에서 쓰니까.」 · 「모던한 느낌으로다가.」 · 「쟂빛블랙 반투명에 살짝 글래스모피즘」)
//   재료·거름 = 홈 카드 덱과 같음(./news-feed.tsx 의 firstJson · modernData · pickUrl · homeMeta · ./home-pool.ts homePool = 에디터 홈과 같은 후보 · 사본 0) · 사진 받기(linkcard) 0
//   줄 = 순위 · 제목 · 출처 · 몇 분 전 · 점수 · 끝에 작은 「전송」(= 그 기사로 요약 요청 폼 · send-button.tsx 와 같은 열쇠 nm_ask_prefill → #/ask)
//   제목 누름 = 원문 새 창(형 11-05 12:27 「링크같은거는 항상 클릭하면 새 창에서」) · 1분마다 다시 받음(보일 때만)
import "./news-list.css";
import { pollOff } from "../data/poll-linux";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { quickSend } from "./quick-send";
import { ALPHA_EVERY, ALPHA_KEY, type Cand, firstJson, homeMeta, modernData, pickOrder, pickUrl } from "./news-feed";
import { FaceImg } from "../ui/faces";
import { homePool } from "./home-pool";
import { cleanTitle } from "./title-clean";
import { outletName } from "../ui/news-data";   // 공식 매체명(형 11-06 「yna 는 연합일거고, asiae 이건 아시아경제 같고 …」)   // 제목 다듬기 로직(형 11-05 16:14)
import { notOutlet, outletOf } from "./outlet-name";   // 언론사 칸 = 진짜 언론사만(빠르 11-09)
import { rssFirst } from "./rss-first";
import { byEvent, eventIndex, eventOf, type EventHit, type NewsEvent, shownScore } from "./event-score";   // 줄 점수·차례 = 뉴스 알고리즘 점수(형 11-09 12:3x 「점수대로 제대로 구현좀 되게 해주셈」)

type Row = { urg?: string; score_why?: string; score_news?: boolean; picks?: { by?: string }[]; key?: string; title?: string; title_clean?: string; items?: { src?: string; url?: string }[]; src?: string; at?: string; score?: number | null; rank?: number | null; urls?: string[]; meta?: { published?: { at?: string; sourceUrl?: string; sourceName?: string } } };
const EVERY = 60_000, MAX = 40, FRESH_MS = 8 * 3600_000;   // 8시간 넘은 기사 = 뺌(형 11-05 15:49 「35시간전 뭐여. 8시간 전은 다 쳐내셈..」)

// 픽 얼굴(형 11-06 07:4x 「촉 틈 얼굴이 123 이런거 좌측에 떳으면 좋겠음」 · 「틈도 저런식으로」) = 그 기사를 고른 봇 얼굴 · 번호 왼쪽 · 둘 다면 단톡방 겹친 얼굴 꼴(형 「그 단톡방 예전 표기처럼 중첩되게」)
const PICK_WHO: Record<string, string> = { chok: "촉", teum: "틈" };
const PICK_FRONT: Record<string, number> = { 촉: 0, 틈: 1 };   // 겹칠 때 촉이 앞(형 11-06 「중첩일경우, 촉이 더 앞으로 (우측 앞)」) = 첫째가 오른쪽 · 위
const ROW_HIDE = new Set(["틈"]);   // 줄 앞 얼굴에서 틈 뺌(형 11-09 09:21 「메인엥서 틈픽 없어도 됨」 · 10:07 「틈 프로필 사진 다시 들어와버렷다 확인좀」 · 「핫이슈 안에」) · 촉 얼굴은 그대로
const pickers = (x: Row) => [...new Set((x.picks || []).map((p) => { const b = String(p?.by || "").trim(); return PICK_WHO[b] || b; }).filter((w) => !!w && !ROW_HIDE.has(w)))].sort((a, b) => (PICK_FRONT[a] ?? 9) - (PICK_FRONT[b] ?? 9));

const agoOf = (t: number, now: number) => { const m = Math.max(0, Math.floor((now - t) / 6e4)); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 1440 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`; };   // Runner · SNS 와 같은 말(방금 · N분 전 · N시간 전)
// 맨 위 고정 칸 = 촉 픽 → 틈 픽(형 11-06 00:28 「촉픽이 제일 전면 틈픽이 그 다음」 · 06:44 「촉픽은 교대하고 같이 바꾸자」 · 봄 안 11-05 17:59 「오른쪽 실시간 뉴스 맨 위에 「촉픽」 칸 고정 (뉴스 순위표랑 안 섞음 · 최근 3건)」)
//   재료 = /api/trends?f=picks(봄 · editor#2643 · 틈 장부 줄 = sent:true) · 순위표에 없는 기사여도 뜸(어젯밤 틈 픽이 안 켜진 까닭 = 순위표에 있을 때만 얼굴을 붙였음 · 봄 10:58)
//   차례 = 촉(최근 판 순위 차례) 둘 → 틈(최근 것) 하나 · 같은 기사 = 한 번 · PICK_WINDOW 넘은 픽 = 뺌
type Pick = { by?: string; title?: string; title_clean?: string; urls?: string[]; outlets?: string[]; url?: string; at?: string; score?: number | null; rank?: number | null; why?: string; keyword?: string; summary?: string };
const PICK_WINDOW = 8 * 3600_000, PIN_CHOK = 2, PIN_TEUM = 0;   // 틈 픽 고정 칸 = 뺌(형 11-09 09:21 「메인엥서 틈픽 없어도 됨. 그냥 점수로 쭉 나열하게 해줘」) · 틈이 고른 기사는 아래 순위표에 점수 차례로 들어감
const pickWho = (p: Pick) => { const b = String(p?.by || "").trim(); return PICK_WHO[b] || b; };
const pickKey = (p: Pick) => String((p.urls || [])[0] || p.url || p.title || "").trim();
const pinsOf = (list: unknown[], now = Date.now()) => {
  const fresh = (p: Pick) => { const t = Date.parse(p.at || ""); return !Number.isFinite(t) || now - t <= PICK_WINDOW; };
  // 같은 봇 · 같은 제목 = 한 줄로 합침(틈 장부 줄 = 네이버 링크 하나 · 판 줄 = 주요 매체 앞에 꽂힌 링크 여럿 · 봄 #2675) → 링크 많은 줄이 대표 · 시각은 있는 쪽 · 점수는 큰 쪽(형 11-06 16:41 「관련된 뉴스를 메인으로」)
  const merged = new Map<string, Pick>();
  for (const p of (list as Pick[]).filter((p) => p && (p.title || p.title_clean))) {
    const k = pickWho(p) + "|" + normTitle(p.title_clean || p.title), o = merged.get(k);
    if (!o) { merged.set(k, p); continue; }
    const base = (p.urls?.length || 0) > (o.urls?.length || 0) ? p : o, other = base === p ? o : p;
    merged.set(k, { ...base, at: base.at || other.at, score: Math.max(base.score ?? -1, other.score ?? -1) >= 0 ? Math.max(base.score ?? -1, other.score ?? -1) : base.score, rank: base.rank ?? other.rank });
  }
  const ps = [...merged.values()].filter(fresh);
  const seen = new Set<string>(), take = (who: string, n: number, sort: (a: Pick, b: Pick) => number) => ps.filter((p) => pickWho(p) === who).sort(sort).filter((p) => { const k = pickKey(p); if (!k || seen.has(k)) return false; seen.add(k); return true; }).slice(0, n);
  const byRank = (a: Pick, b: Pick) => (a.rank ?? 99) - (b.rank ?? 99) || (b.score ?? 0) - (a.score ?? 0);
  const byNew = (a: Pick, b: Pick) => (Date.parse(b.at || "") || 0) - (Date.parse(a.at || "") || 0);
  return [...take("촉", PIN_CHOK, byRank), ...take("틈", PIN_TEUM, byNew)];
};
// 위 고정 칸에 뜬 기사 = 아래 순위표에서 뺌(형 11-06 11:35 「뉴스가 겹치면안되고, 위에 픽으로 나온거 좋아. 나오면, 아래에는 위에거는 논외로 순위를 빼줘.」) · 같은 기사 = 주소(쿼리·끝 / 뗌) 하나라도 같거나 다듬은 제목이 같음
const normUrl = (u?: string) => String(u || "").trim().replace(/^https?:\/\/(?:www\.|m\.)?/i, "").replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
const normTitle = (t?: string) => String(t || "").replace(/\s+/g, "").replace(/[\[\]「」『』"'‘’“”…·.,!?]/g, "").toLowerCase();
// 픽 매체 이름(형 11-06 16:41 「네이버뉴스도 > 네이버 뉴스 ,. 근데 어느 매체건지?」) = 서버 outlets 칸(봄 · urls 와 같은 차례) → 네이버 기사 주소 언론사 번호 → 주소 이름(outletName)
//   대표 링크 = urls[0] 그대로(주요 매체 앞에 꽂기 = 서버 · 봄 16:43 「앱은 「첫 링크 = 대표」로만」)
// NAVER_OID · naverOutlet · 포털/길 이름 거름 = ./outlet-name.ts(빠르 11-09 · node --test 로 시험)
const EXTRA_HOST: Record<string, string> = { "einfomax.co.kr": "연합인포맥스" };   // 공식 이름 표(ui/news-data.ts · 봄 자리)에 아직 없는 픽 매체 · 서버 outlets 가 오면 그게 먼저
const pickOutlet = (p: Pick) => {   // 받은 이름 → 네이버 번호 → 주소 이름 → 다른 주소 → 빈 칸(포털 · 길 이름은 안 냄 · 형 11-09 「네이버 < 이거는 언론사가 아닌데 … 대체되게」 · 화면 3위 틈 픽 n.news 654)
  const urls = [...(p.urls || []), p.url];
  const named = String((p.outlets || [])[0] || "").trim();
  const h = hostOf(urls[0] || ""); const ex = Object.keys(EXTRA_HOST).find((k) => h === k || h.endsWith("." + k));
  return outletOf(named || (ex ? EXTRA_HOST[ex] : ""), urls, outletName);
};
const hostOf = (u?: string) => { try { return u ? new URL(u).hostname.replace(/^(?:www|m|n|core)\./, "") : ""; } catch { return ""; } };

// 시간 흐림(형 11-06 20:14 「그리고 4시간 전은 명도를 75%로 설정. 6시간 전부터는 명도를 50%로 설정. 8시간부터는 노출안되는거 알지?」) — 픽 칸 · 순위표 같은 잣대 · 8시간 = 뺌(FRESH_MS · PICK_WINDOW)
const ageCls = (at?: string) => { const t = Date.parse(at || ""); if (!Number.isFinite(t)) return ""; const h = (Date.now() - t) / 3600_000; return h >= 6 ? " age6" : h >= 4 ? " age4" : ""; };

// 순위표 차례 = 점수 큰 것부터(형 11-09 09:21 「그냥 점수로 쭉 나열하게 해줘」) · 점수 없는 줄 = 끝 · 같은 점수 = 받은 차례 그대로
const byScore = (a: Row, b: Row) => { const sa = Number.isFinite(a?.score as number) ? (a.score as number) : -Infinity, sb = Number.isFinite(b?.score as number) ? (b.score as number) : -Infinity; return sb === sa ? 0 : sb > sa ? 1 : -1; };

const ago = (at?: string) => {
  const t = at ? Date.parse(at) : NaN;
  if (!Number.isFinite(t)) return "";
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 48 * 60 ? `${Math.round(m / 60)}시간 전` : `${Math.round(m / 1440)}일 전`;
};

export function NewsList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [pins, setPins] = useState<Pick[]>([]);
  const [st, setSt] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [gotAt, setGotAt] = useState(0), [now, setNow] = useState(() => Date.now());   // 머리줄 「N분 전」 + 1분마다 다시 셈
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(t); }, []);
  useEffect(() => {
    let events: NewsEvent[] | null = null, eventsAt = 0;
    let live = true, overlap: unknown = null, cands: Cand[] = [], articles: unknown[] = [], triage: unknown = null, merges: unknown = null, alpha: unknown = null, picks: unknown[] = [], picksAt = 0;
    const load = async () => {
      const md = await modernData();
      if (!md) { if (live) setSt("error"); return; }
      const [o, c, ar, tr, mg] = await Promise.all([
        firstJson<unknown>(["/api/trends?f=overlap", "/overlap_latest.json"], (v) => md.validOverlap(v)),
        firstJson<Cand[]>(["/api/candidates", "/candidates.json"], Array.isArray),
        articles.length ? Promise.resolve(articles) : firstJson<unknown[]>(["/articles.json"], Array.isArray),
        firstJson<unknown[]>(["/triage-state.json"], Array.isArray),
        firstJson<unknown>(["/merges.json"], (v) => !!v && typeof v === "object" && !Array.isArray(v)),
      ]);
      if (o) overlap = o; if (c) cands = c; if (ar) articles = ar; if (tr) triage = tr; if (mg) merges = mg;
      if (alpha == null) alpha = (await firstJson(["/feed_alpha.json"])) || {};
      if (!picksAt || Date.now() - picksAt > 2 * 60_000) {
        const pk = await firstJson<{ picks?: unknown[] }>(["/api/trends?f=picks"], (v) => !!v && Array.isArray(v.picks));
        if (pk) { picks = pickOrder(pk.picks || []); picksAt = Date.now(); }   // 촉 → 틈 차례(홈 카드 덱과 같음 · 형 11-06 00:28 「촉픽이 제일 전면 틈픽이 그 다음」)
      }
      let a = 0; try { a = Math.max(0, Math.min(ALPHA_EVERY.length - 1, Math.floor(+(localStorage.getItem(ALPHA_KEY) || 0)))); } catch { /* 기본 0 */ }
      const { rows: r0, lookup } = md.project(overlap, cands, articles, () => null, { mixNews: a ? ALPHA_EVERY[a] : 1, alphaProfile: alpha, visibleCandidates: homePool(cands, triage, merges), urls: (x: Cand) => [pickUrl(x)], metadata: homeMeta, images: null, picks });
      const r = a ? r0 : (rssFirst(r0 as { type?: string }[]) as typeof r0);   // 기본 = RSS 바탕 · 커뮤 섞기(형 09:34 · ./rss-first.ts · 고른 기기 = 옛 꼴)
      if (!live) return;
      const now = Date.now();
      const pinned = pinsOf(picks, now);
      setPins(pinned);
      const pinUrls = new Set(pinned.flatMap((p) => [...(p.urls || []), p.url || ""]).map(normUrl).filter(Boolean));
      const pinTitles = new Set(pinned.flatMap((p) => [p.title_clean || "", cleanTitle(p.title) || "", p.title || ""]).map(normTitle).filter(Boolean));
      const inPins = (x: Row) => [...(x.urls || []), x.meta?.published?.sourceUrl || "", ...(x.items || []).map((it) => it.url || "")].some((u) => { const k = normUrl(u); return !!k && pinUrls.has(k); }) || (!!x.title && pinTitles.has(normTitle(x.title)));
      const lk = lookup as Map<string, { published?: string; first_seen?: string; media?: string }> | undefined;
      // 묶음(overlap) 줄 = 기사 메타가 없음 → 그 묶음의 가장 새 신호 시각(signals.newest)으로(형 11-05 16:30 「4위도 싹다. 몇분전인지 몇시간전인지」)
      const gen = (overlap as { generated?: string } | null)?.generated || undefined;
      const newest = new Map<string, string>();
      const clean = new Map<string, string>();   // 묶음 다듬은 제목(뜸 서버 cluster.title_clean · editor#2583 뒤) — 줄 주소로 찾음
      for (const cl of ((overlap as { clusters?: { urls?: string[]; title_clean?: string; signals?: { newest?: string } }[] } | null)?.clusters || [])) for (const u of cl.urls || []) { if (cl.signals?.newest && !newest.has(u)) newest.set(u, cl.signals.newest); if (cl.title_clean && !clean.has(u)) clean.set(u, cl.title_clean); }
      const strip = (n?: string) => String(n || "").replace(/^(?:tbs_pop|tbs|editor|rss|sns)[:.]/i, "").trim();   // 「tbs:보배드림」 → 「보배드림」(실물 16:4x)
      const srcName = (x: Row) => { for (const it of x.items || []) { const n = String(it.src || "").replace(/^(?:tbs_pop|tbs|editor|rss|sns)[:.]/i, ""); if (n && !/^(?:candidates|social_candidates|x_top10|gtrends)/i.test(n) && !/\(/.test(n)) return n; } return ""; };
      const inner = (n: string) => (/^(?:candidates|social_candidates)$/i.test(n) ? "" : n);   // 수집 칸 이름(SOCIAL_CANDIDATES 등) = 매체 아님 → 다음 후보로(시아 짚음)
      const host = (u?: string) => { try { return u ? new URL(u).hostname.replace(/^www\./, "") : ""; } catch { return ""; } };
      // 출처 · 시각 = 모든 줄(형 11-05 16:30 「뉴스는 점수 좌측에 출처에 대한 내용이 있어야되고, 몇시간전인지 나와야됨. 4위도 싹다.」) — 메타 없으면 묶음 첫 기사 출처 · 후보 장부(lookup) 발행/처음 본 때
      // 점수 차례(뜸 34) = 토글 고른 기기만 · 기본(RSS 바탕)은 rssFirst 가 섞은 차례 그대로(다시 점수로 뭉치면 커뮤가 또 위로 · 뜸 09:41 · 깃 42))
      const list = (r as Row[]).map((x) => { if (!x) return x; const c = x.key && lk?.get ? lk.get(x.key) : undefined; return { ...x, title: x.title_clean || (x.urls || []).map((u) => clean.get(u)).find(Boolean) || cleanTitle(x.title), src: outletName(inner(strip(x.meta?.published?.sourceName)) || inner(strip(c?.media)) || srcName(x) || host(x.meta?.published?.sourceUrl || x.urls?.[0])), at: x.meta?.published?.at || c?.published || c?.first_seen || (x.urls || []).map((u) => newest.get(u)).find(Boolean) || gen }; })   /* 시각 끝 받침 = 순위 만든 때(overlap.generated) */.filter((x) => { if (!x || !x.title || inPins(x)) return false; const t = Date.parse(x.at || ""); return !Number.isFinite(t) || now - t <= FRESH_MS; }).sort(a ? byScore : () => 0);   /* 점수 차례로 쭉(형 11-09 09:21) */
      for (const x of list) if (x && (!x.src || notOutlet(x.src))) x.src = outletOf("", [x.meta?.published?.sourceUrl, ...(x.urls || []), ...(x.items || []).map((it) => it.url || "")], outletName);   // 「네이버」·「RSS 후보」 = 언론사 아님 → 기사 주소 언론사(네이버 번호 먼저) · 없으면 빈 칸(형 11-06 16:41 · 11-09 14:0x · 15:0x 화면 3위 · 11위)
      // 뉴스 알고리즘 점수(./event-score.ts · 서버 회차 = 30분 · 2분에 한 번만 받음) — 맞춘 줄 = 그 점수 · 점수 큰 것부터 · 못 맞춘 줄 = 점수 칸 비움 · 끝에 앞 차례 그대로 · 못 받으면 앞 꼴 그대로
      if (!eventsAt || Date.now() - eventsAt > 2 * 60_000) {
        const ev = await firstJson<{ events?: NewsEvent[] }>(["/api/trends?f=event"], (v) => !!v && Array.isArray(v.events) && v.events.length > 0);
        if (ev) { events = ev.events || []; eventsAt = Date.now(); }
        if (!live) return;
      }
      const ei = eventIndex(events);
      if (ei.size) {
        const hit = new Map<Row, EventHit>();
        const tagged = list.map((x) => { if (!x) return x; const h = eventOf(x, ei); const y: Row = h ? { ...x, score: shownScore(h.s), score_why: h.why, score_news: true, urg: h.urg } : { ...x, score: null, score_why: "", score_news: false }; if (h) hit.set(y, h); return y; });
        list.splice(0, list.length, ...byEvent(tagged, (y) => hit.get(y) || null));
      }
      list.splice(MAX);   // 40줄 = 점수 차례로 세운 뒤 자름(앞 = 섞은 차례로 먼저 잘라 높은 점수 기사가 41번째 밖이면 빠졌음)
      setRows(list);
      setGotAt(Date.parse(gen || "") || Date.now());   // 머리줄 「N분 전」 = 서버가 묶음을 만든 때(없으면 받은 때)
      setSt(list.length ? "ready" : overlap ? "empty" : "error");
    };
    void load();
    const t = setInterval(() => { if (!pollOff()) void load(); }, EVERY);   // 숨은 탭 · 리눅스 데스크톱 = 쉼(../data/poll-linux.ts)
    return () => { live = false; clearInterval(t); };
  }, []);
  // 전송 · 픽 = 창 없이 바로 요약 요청(형 11-09 08:14 · 외신이면 fp 저절로 · ./quick-send.ts · 깃 29)) — 접수 한 줄 · 대기열 판 저절로 갱신
  // 「전송」 = 그 단추 안에서 차오름 → ✓ · 위 알약(「보내는 중…」 · 「요약 요청 접수」) 걷음(형 11-12 06:15 봄 1:1 「그리고 이거 전송 누르면 위에 전송 중~ 뭐 이런식으로 떠, 어색하거든? 그냥 전송 버튼에서 게이지차서 체크누르고 백단에서 이루어지면됨. 저렇게 표기될필요없음」)
  //   실패 = 그 단추가 「다시」(빨강 · 까닭은 title) 로 남음 = 조용히 삼키지 않음 · 같은 기사 두 번 막기(보내는 중 · 모루 09:43) 그대로
  const [sdSt, setSdSt] = useState<Record<string, { k: "run" | "ok" | "bad"; why?: string }>>({});
  const qc = useQueryClient();
  const mark = (k: string, v: { k: "run" | "ok" | "bad"; why?: string } | null) => setSdSt((o) => { const n = { ...o }; if (v) n[k] = v; else delete n[k]; return n; });
  const go = (title: string, url: string) => {
    const k = url || title;
    if (!k || sdSt[k]?.k === "run") return;
    mark(k, { k: "run" });
    quickSend(title, url).then(() => { mark(k, { k: "ok" }); window.setTimeout(() => setSdSt((o) => (o[k]?.k === "ok" ? (({ [k]: _, ...r }) => r)(o) : o)), 6000); void qc.invalidateQueries({ queryKey: ["nomute", "split-pending"] }); void qc.invalidateQueries({ queryKey: ["nomute", "feed-pending"] }); })
      .catch((err: Error) => mark(k, { k: "bad", why: err.message || "못 보냈어" }));
  };
  const sdBtn = (cls: string, k: string, onClick: () => void) => {
    const x = sdSt[k];
    return <button type="button" className={`${cls}${x ? ` ${x.k}` : ""}`} disabled={x?.k === "run"} aria-label={x?.k === "ok" ? "요약 요청 접수됨" : x?.k === "bad" ? `못 보냄 · 다시 보내기 — ${x.why}` : "이 기사로 요약 요청"} title={x?.k === "bad" ? x.why : "이 기사로 요약 요청"} onClick={onClick}><span>{x?.k === "ok" ? "✓" : x?.k === "bad" ? "다시" : "전송"}</span></button>;
  };
  const send = (row: Row) => go(row.title || "", row.meta?.published?.sourceUrl || row.urls?.[0] || "");
  const sendPick = (p: Pick) => go(p.title_clean || cleanTitle(p.title), (p.urls || [])[0] || p.url || "");
  const openPick = (p: Pick) => { const url = (p.urls || [])[0] || p.url; if (url) window.open(url, "_blank", "noopener"); };
  const open = (row: Row) => {
    const url = row.meta?.published?.sourceUrl || row.urls?.[0];
    if (url) window.open(url, "_blank", "noopener");
  };
  return (
    <section className="nm-nlist" aria-label="실시간 뉴스">
      <div className="nm-nlist-h"><i className="live" aria-hidden /><b>Hot Issue</b><span>{st === "ready" && gotAt ? agoOf(gotAt, now) : ""}</span></div>   {/* 「N건」 → 「N분 전」(형 11-08 09:12 「hotissue 40건,< ㅣ건 의미없고 이것도 몇분전에 받아왓는지가 중요」 · Runner · SNS · Digest 와 같은 말) */}
      {pins.length ? (
        <ul className="nm-nlist-pin" aria-label="촉 · 틈 픽">
          {pins.map((p) => {
            const who = pickWho(p), url = (p.urls || [])[0] || p.url || "", title = p.title_clean || cleanTitle(p.title) || "";
            const why = String(p.why || p.keyword || "").trim();
            return (
              <li key={`${who}:${pickKey(p)}`} className={(who === "촉" ? "chok" : "teum") + ageCls(p.at)}>
                <span className="pk-face"><FaceImg id={who} size={20} /></span>
                <span className="pk-tag">{who} 픽</span>
                <button type="button" className="pk-tt" title={title} onClick={() => openPick(p)}>{title}</button>
                <span className="pk-mt">{[why, pickOutlet(p), ago(p.at)].filter(Boolean).join(" · ")}</span>
                <span className="pk-sc">{Number.isFinite(p.score as number) ? Math.round(p.score as number) : ""}</span>
                {sdBtn("pk-sd", url || title, () => sendPick(p))}
              </li>
            );
          })}
        </ul>
      ) : null}
      {st !== "ready" ? (
        st === "loading" ? <div className="nm-skel-list" aria-label="받는 중">{[92, 78, 86, 70, 82, 64].map((w, i) => <i key={i} className="nm-skel" style={{ width: `${w}%` }} />)}</div>   /* 불러오는 중 = 뼈대 줄(시아 UI ⑤) */
        : <p className="nm-nlist-empty nm-emptybox"><b>{st === "empty" ? "지금 보여 줄 기사가 없어" : "기사 순위를 못 받았어"}</b><span>{st === "empty" ? "1분마다 다시 받아" : "1분 뒤 다시 해 볼게"}</span></p>
      ) : (
        <ol className={rows.some((r) => pickers(r).length) ? "nm-nlist-ol" : "nm-nlist-ol nopf"}>   {/* 얼굴 있는 줄 0 = 왼쪽 얼굴 칸째 뺌(형 11-09 12:01 「핫이슈 아직 좌측에 여백남음」 · 틈 얼굴 뺀 뒤 빈 16px) */}
          {rows.map((row, i) => (
            <li key={row.key || row.urls?.[0] || i} className={((i < 3 ? "top" : "") + ageCls(row.at)).trim() || undefined}>   {/* 1~3위 = 번호·제목 라임(형 15:49) */}
              <span className="pf" aria-hidden={!pickers(row).length || undefined} title={pickers(row).length ? `${pickers(row).join("·")} 픽` : undefined}>{pickers(row).map((w, j) => <span key={w} className="pf-i" style={{ zIndex: 9 - j }}><FaceImg id={w} size={16} /></span>)}</span>
              <span className="rk">{i + 1}</span>   {/* 차례 번호(순위 그대로면 1 · 6 · 7 띄엄 · 뎅 11-05 15:0x 실물) */}
              <button type="button" className="tt" title={row.title} onClick={() => open(row)}>{row.title}</button>
              <span className="mt" title={row.src || undefined}>{row.src || ""}</span>
              <span className="ag">{row.at ? ago(row.at) : ""}</span>   {/* 「N분 전」 = 점수 바로 왼쪽 칸 · 오른쪽 맞춤(형 11-06 10:15 「00분전 0시간전 00분전이 좀 더 우측으로 가야될거같아 점수쪽」) */}
              <span className="sc" title={row.score_why || undefined}>{Number.isFinite(row.score as number) ? Math.round(row.score as number) : ""}</span>   {/* 점수(긴급 줄도 같음 · 빨간 「긴급 HH:MM」 알약 뺌 = 형 11-13 11:00 「긴급 -> 없어도 되구」 · 차례 = 긴급 맨 위 그대로 byEvent) */}   {/* 점수 없는 줄도 칸은 둠(줄 맞춤) */}
              {sdBtn("sd", row.meta?.published?.sourceUrl || row.urls?.[0] || row.title || "", () => send(row))}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

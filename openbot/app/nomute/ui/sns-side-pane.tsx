// SNS 탭 오른쪽 칸(./sns-side.ts) — 위 = 고르기(Instagram · Threads · X) · 아래 = 9:16 자리(껍데기 앱이 이 자리에 진짜 웹뷰를 겹침)
//   그냥 브라우저 · 폰(다리 없음) = 「새 창으로 열기」 단추 하나만(설명 문장 0 · 형 11-20 10:05 「응 설명글이 있을필요는 없어 항상 만들때 참고해줘 ux애들은.」)
//   형 본계 화면 = 우리 손 0(형이 누른 것만 · 봄 09:20) · 자리 바뀜 = ResizeObserver · 창 크기 · 탭 떠나면 「끝」
//   대화로 보내기(형 11-20 10:16 · 미토스 5.2 설계 ①) = 고르기 줄 대화 쪽(왼쪽) 끝 단추 하나 · ⌘⏎ / Ctrl+⏎(웹뷰 안에서 누르면 껍데기가 「pick-key」로 알려 줌)
//     누름 = /garden-app/sns-pick.js 를 껍데기에 넘겨 그 웹뷰에서 돌림 → 집은 글 + 스냅샷 → 입력칸 첨부 칩(바로 안 보냄 · ./sns-share.ts) · 집힌 글 테두리 0.3초(껍데기가 「flash」)
//     가만히 둔 화면 = 0(누를 때만 받고 돌림)
//   대화 카드 누름(./sns-card.tsx) = 「nm-sns-go」 → 그 곳으로 바꾸고 껍데기 웹뷰를 그 글로
import { useEffect, useRef, useState } from "react";
import { SIDE_EVENT, type SidePick, SNS_GO_EVENT, SNS_SITE_KEY, SNS_SITES, type SnsSite, sideBridge, sideMsg, siteOf, takeGo } from "./sns-side";
import { pickPost, stageSns } from "./sns-share";
import { type MirrorSt, mirror } from "./mac-mirror";   // 다리 없는 브라우저 = 맥 비춤(⑤ B · 카리나 붙이개)
import { SnsMirror } from "./sns-mirror";

const loadSite = (): SnsSite => { try { return siteOf(localStorage.getItem(SNS_SITE_KEY)); } catch { return "instagram"; } };
const PICK_JS = `${import.meta.env.BASE_URL || "/garden-app/"}sns-pick.js`;
let pickJs: { at: number; js: string } | null = null;
async function loadPick(): Promise<string> {   // 5분 안에 받은 것 = 그대로(누를 때만 받음)
  if (pickJs && Date.now() - pickJs.at < 300_000) return pickJs.js;
  const r = await fetch(PICK_JS, { cache: "no-store" });
  if (!r.ok) throw new Error(`pick ${r.status}`);
  const js = (await r.text()).trim().replace(/;+\s*$/, "");
  if (!/^\(function\s*\(mode\)/.test(js)) throw new Error("pick 꼴");
  pickJs = { at: Date.now(), js };
  return js;
}

export function SnsSidePane() {
  const [first] = useState(takeGo);   // 대화 카드를 눌러 이 칸이 막 뜸 = 그 곳 · 그 글로
  const [site, setSite] = useState<SnsSite>(() => (first ? first.site : loadSite())), box = useRef<HTMLDivElement>(null);
  const [send] = useState(() => sideBridge());
  const [busy, setBusy] = useState(false);
  const [mst, setMst] = useState<MirrorSt>(() => mirror.state.st);   // 맥 비춤 상태(다리 없을 때만 씀)
  useEffect(() => (send ? undefined : mirror.on((x) => setMst(x.st))), [send]);
  const mlive = !send && mst === "live";
  useEffect(() => {   // 맥 비춤 = 곳 바꿈 · 카드에서 온 글 → 맥 탭을 그 주소로(https 만 · 중계기가 거름)
    if (!mlive) return;
    mirror.go(goTo.current || SNS_SITES.find((x) => x.id === site)!.url);
    goTo.current = "";
  }, [mlive, site]);
  const goTo = useRef<string>(first?.url || "");   // 카드에서 온 글 주소(곳을 바꾼 뒤 자리가 잡히면 보냄)
  const siteRef = useRef(site); siteRef.current = site;
  useEffect(() => {
    try { localStorage.setItem(SNS_SITE_KEY, site); } catch { /* 이번만 */ }
    const el = box.current;
    if (!send || !el) return undefined;
    let raf = 0, last = "";
    const post = () => {
      raf = 0;
      const m = sideMsg(site, el.getBoundingClientRect(), window.innerWidth, window.innerHeight), k = JSON.stringify(m);
      if (k !== last) { last = k; send(m); }   // 같은 자리 = 다시 안 보냄
      if (goTo.current) { send({ t: "nm-side-go", site, url: goTo.current }); goTo.current = ""; }
    };
    const soon = () => { if (!raf) raf = requestAnimationFrame(post); };
    post();
    const ro = new ResizeObserver(soon); ro.observe(el);
    window.addEventListener("resize", soon);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("resize", soon); };
  }, [site, send]);
  useEffect(() => () => { send?.({ t: "nm-side", on: false }); }, [send]);   // 탭 떠남 = 껍데기 웹뷰 숨김
  const pick = useRef<() => void>(() => {});
  pick.current = () => {
    if ((!send && !mlive) || busy) return;
    setBusy(true);
    const id = `p${Date.now().toString(36)}`, s = siteRef.current;
    if (!send) {   // 맥 비춤 = 붙이개가 같은 pick.js 를 맥 탭에서 돌림 → 같은 답(SidePick)
      void mirror.pick(id).then((d) => { const p = pickPost(d, s); if (p) stageSns(p, d.img); }).finally(() => setBusy(false));
      return;
    }
    let t = 0;
    const done = () => { clearTimeout(t); window.removeEventListener(SIDE_EVENT, on); setBusy(false); };
    const on = (e: Event) => {
      const d = (e as CustomEvent<SidePick>).detail;
      if (!d || d.state !== "pick" || d.id !== id) return;
      done();
      const p = pickPost(d, s);
      if (p) stageSns(p, d.img);
    };
    window.addEventListener(SIDE_EVENT, on);
    t = window.setTimeout(done, 6000);   // 껍데기 답 없음(옛 판 앱) = 단추만 다시 살림
    loadPick().then((js) => send({ t: "nm-side-pick", id, js }), done);
  };
  useEffect(() => {
    const onGo = () => {
      const d = takeGo();
      if (!d?.url) return;
      const s = siteOf(d.site);
      goTo.current = d.url;
      if (s !== siteRef.current) setSite(s);
      else if (send) { send({ t: "nm-side-go", site: s, url: d.url }); goTo.current = ""; }
    };
    const onSide = (e: Event) => { if ((e as CustomEvent<{ state?: string }>).detail?.state === "pick-key") pick.current(); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !(e.metaKey || e.ctrlKey) || e.isComposing) return;
      const a = document.activeElement as HTMLElement | null;
      if (a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) return;   // 입력칸 안 = 입력칸 몫
      e.preventDefault(); pick.current();
    };
    window.addEventListener(SNS_GO_EVENT, onGo);
    window.addEventListener(SIDE_EVENT, onSide);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener(SNS_GO_EVENT, onGo); window.removeEventListener(SIDE_EVENT, onSide); window.removeEventListener("keydown", onKey); };
  }, [send]);
  const cur = SNS_SITES.find((s) => s.id === site)!;
  return (
    <div className="nm-sns-side">
      <div className="nm-sns-pick" role="tablist" aria-label="SNS 고르기">
        {send || mlive ? (
          <button type="button" className={`nm-sns-send${busy ? " busy" : ""}`} aria-label="대화로 보내기" title="대화로 보내기 (⌘⏎)" onClick={() => pick.current()} disabled={busy}>
            <svg viewBox="0 0 24 24" aria-hidden><path d="M19 12H6M11 6.5 5.5 12l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        ) : null}
        {SNS_SITES.map((s) => <button key={s.id} type="button" role="tab" aria-selected={s.id === site} className={s.id === site ? "on" : ""} onClick={() => setSite(s.id)}>{s.name}</button>)}
      </div>
      <div className="nm-sns-stage">
        <div ref={box} className="nm-sns-box" data-site={site}>
          {send ? <div className="nm-lazy" role="status" aria-label="여는 중"><i /><i /><i /></div> : <SnsMirror fallback={cur.url} />}
        </div>
      </div>
    </div>
  );
}

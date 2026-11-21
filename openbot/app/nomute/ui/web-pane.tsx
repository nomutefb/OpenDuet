// 「웹」 칸 = 대시보드 안 브라우저 1단계(형 11-06 20:21 「그리고 여기 대시보드 창 내부에서도 브라우저를 띄울수 있게 해주면 땡큐」 · 봄 22:41 나눔 ① · 빠르)
//   주소창 · 뒤로 · 앞으로 · 새로고침 · 밖에서 열기 + iframe(./inapp.ts frameUrl = 유튜브·Suno 퍼가기 주소로 · hookFrame = 같은 출처면 안 링크도 앱 안)
//   품기 미리 재기 = 서버 GET frame?u=(editor functions/api/office/_frame.js · X-Frame-Options · frame-ancestors · http) → 막는 곳은 빈 화면 대신 「밖에서 열기」
//     판정을 못 받으면(서버 길 들어가기 전 · 못 닿음) 그냥 품어 보고 「비어 보이면 밖에서 열기」 한 줄
//   낱말을 치면 = 구글 검색(igu=1 = 품기 허용 · 실측 11-06 22:4x) · 뒤로/앞으로 = 이 주소창으로 연 것만(남의 사이트 안 링크 이동은 못 봄)
//   남의 사이트 = sandbox(맨 위 창을 못 끌고 감 · 새 창은 됨) · 자리(position)는 끼우는 쪽(번개 4분할 묶음) · 클래스 nm-web-pane
//   2단계(막는 곳까지 진짜 브라우저 화면 비추기)는 형 결정
import { type ReactNode, useEffect, useRef, useState } from "react";
import { DuetIcon } from "@/components/duet/icons";
import { office } from "../data/office";
import { frameUrl, hookFrame } from "./inapp";
import { type WebEvt, WEB_EVENT, isAdopted, nativeWeb, trackSpot } from "./native-web";
import { toAddress } from "./web-pane-addr";
import "./web-pane.css";

type Check = { state: "idle" | "checking" | "ok" | "blocked" | "unknown"; why?: string };

export { toAddress };   // 순수 = ./web-pane-addr.ts(시험이 바로 부름)

// 빈 판 글 = 「주소나 검색어를 넣어주세요」 한 줄(형 11-12 10:00 「그냥 주소나 검색어를 넣어주세요. 정도 나오면 될듯」)
const sameSite = (u: string) => u.startsWith("/") || u.startsWith(location.origin + "/");

export function WebPane({ initial = "", className = "", onClose, onGo, blank, focus = false, backOut, onBridge, sid }: { initial?: string; className?: string; onClose?: () => void; onGo?: (url: string) => void; blank?: ReactNode; focus?: boolean; backOut?: () => void; onBridge?: (url: string) => void; sid?: string }) {   // sid = 껍데기 앱의 웹 칸 이름(./native-web.ts · 있고 다리가 있으면 남의 사이트 = 끼움 대신 진짜 웹뷰 · 막는 사이트도 열리고 로그인이 남음 · 형 11-21)   // onBridge = 품기를 막는 사이트일 때 「Browser 탭에서 열기」(위 탭 줄 안 진짜 브라우저 = 맥 72 다리 · 창 밖으로 안 나감 · 형 11-17 「내부에서 무조건 열려야해」)   // backOut = 뒤로 갈 데 없을 때 ← 가 닫기(폰 #/web 겹 = 머리 알약을 뺐으니 닫는 길 · 카리나 11-17)   // onGo = 주소 바뀜 알림(탭 이름 · 기억) · blank = 빈 화면 아래 덧(탭 「+」 = 몸 화면 바로가기) · focus = 빈 채로 열리면 주소칸에 손(빠르 11-11)
  const send = sid ? nativeWeb() : null;
  const first = toAddress(initial, !!send);
  const [input, setInput] = useState(first);
  const [hist, setHist] = useState<string[]>(first ? [first] : []);
  const [idx, setIdx] = useState(first ? 0 : -1);
  const [check, setCheck] = useState<Check>({ state: "idle" });
  const [nonce, setNonce] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null), addr = useRef<HTMLInputElement>(null);
  const cur = idx >= 0 ? hist[idx] : "";
  // 진짜 웹뷰 칸 — 같은 사이트(우리 화면 = 톤 입히는 판)는 끼움 그대로 · 남의 사이트만 · 주소가 비어도 껍데기가 먼저 만든 칸(칸 안 새 창)은 띄움
  const real = !!send && !!sid && (cur ? !sameSite(cur) : isAdopted(sid));
  const [nst, setNst] = useState<WebEvt>({});   // 껍데기가 알려 준 상태(주소 · 읽는 중 · 뒤/앞 가능 · 실패)
  const spot = useRef<HTMLDivElement>(null), live = useRef({ idx, cur, focus, onClose }), bad = useRef(false);
  live.current = { idx, cur, focus, onClose };
  const failed = nst.state === "error";
  useEffect(() => {
    if (!send || !sid) return undefined;
    const on = (e: Event) => {
      const d = (e as CustomEvent<WebEvt>).detail;
      if (!d) return;
      if (d.state === "key") { if (d.key === "l" && live.current.focus) { addr.current?.focus({ preventScroll: true }); addr.current?.select(); } return; }   // ⌘L = 보이는 탭의 주소칸
      if (d.id !== sid || d.state === "open") return;
      if (d.state === "closed") { live.current.onClose?.(); return; }
      if (d.state === "error") { bad.current = true; setNst((p) => ({ ...p, state: "error", why: d.why, loading: false })); return; }
      if (bad.current && !d.loading) return;   // 못 연 뒤 따라오는 「읽기 끝」 알림 = 안내 그대로(그 알림의 주소는 앞 화면 것 · 따라가면 「다시」가 엉뚱한 주소를 엶) · 새로 읽기 시작하면 풀림
      bad.current = false;
      setNst({ url: d.url, title: d.title, loading: d.loading, back: d.back, fwd: d.fwd });
      const u = d.url || "";
      if (/^https?:\/\//.test(u) && u !== live.current.cur) {   // 칸 안에서 옮겨 감(링크 누름 · 넘겨짐) = 주소창 · 탭 이름 · 기억이 따라감
        const i = live.current.idx;
        if (i >= 0) setHist((h) => { const c = [...h]; c[i] = u; return c; }); else { setHist([u]); setIdx(0); }
        if (document.activeElement !== addr.current) setInput(u);
      }
    };
    window.addEventListener(WEB_EVENT, on);
    return () => window.removeEventListener(WEB_EVENT, on);
  }, [send, sid]);
  useEffect(() => {   // 자리 · 구멍이 바뀔 때만 껍데기에 알림 · 안 보이면(다른 탭 · 실패 안내 · 떠남) 숨김 — 웹뷰는 살아 있음(스크롤 · 로그인 그대로)
    const el = spot.current;
    if (!real || !send || !sid || !el || failed) return undefined;
    const off = trackSpot(el, (sp) => send(sp ? { t: "nm-web", id: sid, on: true, url: live.current.cur, ...sp } : { t: "nm-web", id: sid, on: false }));
    return () => { off(); send({ t: "nm-web", id: sid, on: false }); };
  }, [real, send, sid, failed]);
  useEffect(() => { if (focus && !first) addr.current?.focus({ preventScroll: true }); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const said = useRef(first);
  useEffect(() => { if (cur && cur !== said.current) { said.current = cur; onGo?.(cur); } }, [cur]);   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {   // 주소가 바뀔 때마다 품기 미리 재기(같은 사이트 = 안 물음) · 재는 주소 = 실제로 iframe 에 넣을 주소(frameUrl · 유튜브·Suno = 퍼가기 주소 · 원본 watch 주소는 막혀도 퍼가기는 됨 · 모루 검토 editor#2807)
    if (!cur) { setCheck({ state: "idle" }); return; }
    if (real) { setCheck({ state: "ok" }); return; }   // 진짜 웹뷰 = 품기 판정 필요 없음(서버 안 물음)
    const target = frameUrl(cur);
    if (sameSite(target)) { setCheck({ state: "ok" }); return; }
    let live = true;
    setCheck({ state: "checking" });
    office<{ frame: boolean | null; why?: string }>(`frame?u=${encodeURIComponent(target)}`)
      .then((j) => { if (live) setCheck(j.frame === false ? { state: "blocked", why: j.why } : j.frame ? { state: "ok" } : { state: "unknown", why: j.why }); })
      .catch((e: unknown) => { if (live) setCheck({ state: "unknown", why: e instanceof Error ? e.message : "판정 못 받음" }); });
    return () => { live = false; };
  }, [cur, real]);

  useEffect(() => hookFrame(frame.current), [cur, nonce, check.state]);   // 같은 출처 판 = 안 링크·새 창도 앱 안(남의 사이트는 손 못 댐)

  // 막는 사이트 = 단추 없이 바로 진짜 브라우저 판(맥 72)으로(형 11-18 22:3x 「응 만약에 막히면 그렇게 하고」) — 형이 방금 주소창으로 간 주소만(wantBridge)
  //   탭을 다시 열며 되살아난 주소 · 다리에서 돌아온 자리는 안 넘김(넘기면 돌아오자마자 또 넘어가 못 빠져나옴) → 그땐 앞처럼 안내 + 「맥 72로 열기」 단추
  const wantBridge = useRef("");
  useEffect(() => {
    if (check.state !== "blocked" || !onBridge || !cur || wantBridge.current !== cur) return;
    wantBridge.current = "";
    onBridge(cur);
  }, [check.state, cur]);   // eslint-disable-line react-hooks/exhaustive-deps
  const go = (raw: string) => {
    const a = toAddress(raw, !!send);
    if (!a) return;
    wantBridge.current = a;
    setInput(a);
    if (send && sid && !sameSite(a)) {   // 진짜 웹뷰 칸 = 그 주소로(칸이 아직 없으면 껍데기가 만듦 · 같은 주소 = 다시 읽음) · 글 치던 손은 화면으로
      bad.current = false;
      setNst((p) => ({ ...p, state: undefined, loading: true }));
      send({ t: "nm-web-go", id: sid, url: a });
      send({ t: "nm-web-cmd", id: sid, cmd: "focus" });
      addr.current?.blur();
    }
    if (a === cur) { setNonce((n) => n + 1); return; }   // 같은 주소 다시 = 새로고침
    setHist((h) => [...h.slice(0, idx + 1), a]);
    setIdx((i) => i + 1);
  };
  const step = (d: number) => { const n = idx + d; if (n < 0 || n >= hist.length) return; setIdx(n); setInput(hist[n]); };
  const cmd = (c: "back" | "fwd" | "reload") => { if (send && sid) send({ t: "nm-web-cmd", id: sid, cmd: c }); };
  const show = !real && !!cur && (check.state === "ok" || check.state === "unknown");
  const noBack = real ? !nst.back && !backOut : idx <= 0 && !backOut;

  return (
    <section className={`nm-web-pane ${className}`.trim()} aria-label="웹">
      <form className="nm-web-bar" onSubmit={(e) => { e.preventDefault(); go(input); }}>
        <button type="button" className="nm-web-btn" aria-label={(real ? !nst.back : idx <= 0) && backOut ? "닫기" : "뒤로"} title={(real ? !nst.back : idx <= 0) && backOut ? "닫기" : "뒤로"} disabled={noBack} onClick={() => (real ? (nst.back ? cmd("back") : backOut?.()) : idx <= 0 ? backOut?.() : step(-1))}><DuetIcon name="chevronLeft" size={16} /></button>
        <button type="button" className="nm-web-btn" aria-label="앞으로" title="앞으로" disabled={real ? !nst.fwd : idx >= hist.length - 1} onClick={() => (real ? cmd("fwd") : step(1))}><DuetIcon name="chevronRight" size={16} /></button>
        <button type="button" className={`nm-web-btn${real && nst.loading ? " busy" : ""}`} aria-label="새로고침" title="새로고침" disabled={!cur && !real} onClick={() => (real ? (failed ? go(cur) : cmd("reload")) : setNonce((n) => n + 1))}>↻</button>
        <input ref={addr} className="nm-web-addr" value={input} onChange={(e) => setInput(e.target.value)} onFocus={(e) => e.currentTarget.select()}
          placeholder="주소나 검색어" spellCheck={false} autoCapitalize="off" autoCorrect="off" enterKeyHint="go" aria-label="주소" />
        {real && send && sid ? (cur ? <button type="button" className="nm-web-btn" aria-label="밖에서 열기" title="밖에서 열기" onClick={() => send({ t: "nm-web-cmd", id: sid, cmd: "out", url: nst.url || cur })}><DuetIcon name="globe" size={16} /></button> : null)
          : cur ? <a data-nm-out href={cur} target="_blank" rel="noopener" className="nm-web-btn" aria-label="밖에서 열기" title="밖에서 열기"><DuetIcon name="globe" size={16} /></a> : null}
        {onClose ? <button type="button" className="nm-web-btn" aria-label="닫기" title="닫기" onClick={onClose}><DuetIcon name="x" size={16} /></button> : null}
      </form>
      <div className="nm-web-body">
        {real ? (
          failed ? <div className="nm-web-note"><span role="status">{nst.why || "못 열었어요"}</span><button type="button" className="nm-web-out" onClick={() => go(cur)}>다시</button></div>
            : <div ref={spot} className="nm-web-real" />   /* 이 자리에 껍데기 앱이 진짜 웹뷰를 겹침 */
        ) : !cur ? (
          <div className="nm-web-note">{blank}</div>
        ) : check.state === "blocked" ? (
          <div className="nm-web-note">
            {onBridge ? <button type="button" className="nm-web-out" onClick={() => onBridge(cur)}>맥 72로 열기</button> : null}
            <a data-nm-out href={cur} target="_blank" rel="noopener" className={onBridge ? "nm-web-out sub" : "nm-web-out"}>밖에서 열기</a>
          </div>
        ) : check.state === "checking" ? (
          <p className="nm-web-note">여는 중…</p>
        ) : null}
        {show ? (
          <iframe key={`${cur}#${nonce}`} ref={frame} title="웹" src={frameUrl(cur)} className="nm-web-frame"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write" referrerPolicy="strict-origin-when-cross-origin"
            {...(sameSite(cur) ? {} : { sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals" })} />
        ) : null}
      </div>
    </section>
  );
}

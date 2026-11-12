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
import "./web-pane.css";

type Check = { state: "idle" | "checking" | "ok" | "blocked" | "unknown"; why?: string };

/** 친 글 → 주소(http(s) 그대로 · 점이 있고 빈칸이 없으면 https 붙임 · 그 밖 = 구글 검색) */
export function toAddress(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (!/\s/.test(s) && /^[^/\s?#]+\.[a-z]{2,}([/:?#]|$)/i.test(s)) return `https://${s}`;
  return `https://www.google.com/search?igu=1&q=${encodeURIComponent(s)}`;
}

// 빈 판 글 = 「주소나 검색어를 넣어주세요」 한 줄(형 11-12 10:00 「그냥 주소나 검색어를 넣어주세요. 정도 나오면 될듯」)
const sameSite = (u: string) => u.startsWith("/") || u.startsWith(location.origin + "/");

export function WebPane({ initial = "", className = "", onClose, onGo, blank, focus = false }: { initial?: string; className?: string; onClose?: () => void; onGo?: (url: string) => void; blank?: ReactNode; focus?: boolean }) {   // onGo = 주소 바뀜 알림(탭 이름 · 기억) · blank = 빈 화면 아래 덧(탭 「+」 = 몸 화면 바로가기) · focus = 빈 채로 열리면 주소칸에 손(빠르 11-11)
  const first = toAddress(initial);
  const [input, setInput] = useState(first);
  const [hist, setHist] = useState<string[]>(first ? [first] : []);
  const [idx, setIdx] = useState(first ? 0 : -1);
  const [check, setCheck] = useState<Check>({ state: "idle" });
  const [nonce, setNonce] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null), addr = useRef<HTMLInputElement>(null);
  const cur = idx >= 0 ? hist[idx] : "";
  useEffect(() => { if (focus && !first) addr.current?.focus({ preventScroll: true }); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const said = useRef(first);
  useEffect(() => { if (cur && cur !== said.current) { said.current = cur; onGo?.(cur); } }, [cur]);   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {   // 주소가 바뀔 때마다 품기 미리 재기(같은 사이트 = 안 물음) · 재는 주소 = 실제로 iframe 에 넣을 주소(frameUrl · 유튜브·Suno = 퍼가기 주소 · 원본 watch 주소는 막혀도 퍼가기는 됨 · 모루 검토 editor#2807)
    if (!cur) { setCheck({ state: "idle" }); return; }
    const target = frameUrl(cur);
    if (sameSite(target)) { setCheck({ state: "ok" }); return; }
    let live = true;
    setCheck({ state: "checking" });
    office<{ frame: boolean | null; why?: string }>(`frame?u=${encodeURIComponent(target)}`)
      .then((j) => { if (live) setCheck(j.frame === false ? { state: "blocked", why: j.why } : j.frame ? { state: "ok" } : { state: "unknown", why: j.why }); })
      .catch((e: unknown) => { if (live) setCheck({ state: "unknown", why: e instanceof Error ? e.message : "판정 못 받음" }); });
    return () => { live = false; };
  }, [cur]);

  useEffect(() => hookFrame(frame.current), [cur, nonce, check.state]);   // 같은 출처 판 = 안 링크·새 창도 앱 안(남의 사이트는 손 못 댐)

  const go = (raw: string) => {
    const a = toAddress(raw);
    if (!a) return;
    setInput(a);
    if (a === cur) { setNonce((n) => n + 1); return; }   // 같은 주소 다시 = 새로고침
    setHist((h) => [...h.slice(0, idx + 1), a]);
    setIdx((i) => i + 1);
  };
  const step = (d: number) => { const n = idx + d; if (n < 0 || n >= hist.length) return; setIdx(n); setInput(hist[n]); };
  const show = !!cur && (check.state === "ok" || check.state === "unknown");

  return (
    <section className={`nm-web-pane ${className}`.trim()} aria-label="웹">
      <form className="nm-web-bar" onSubmit={(e) => { e.preventDefault(); go(input); }}>
        <button type="button" className="nm-web-btn" aria-label="뒤로" title="뒤로" disabled={idx <= 0} onClick={() => step(-1)}><DuetIcon name="chevronLeft" size={16} /></button>
        <button type="button" className="nm-web-btn" aria-label="앞으로" title="앞으로" disabled={idx >= hist.length - 1} onClick={() => step(1)}><DuetIcon name="chevronRight" size={16} /></button>
        <button type="button" className="nm-web-btn" aria-label="새로고침" title="새로고침" disabled={!cur} onClick={() => setNonce((n) => n + 1)}>↻</button>
        <input ref={addr} className="nm-web-addr" value={input} onChange={(e) => setInput(e.target.value)} onFocus={(e) => e.currentTarget.select()}
          placeholder="주소나 검색어" spellCheck={false} autoCapitalize="off" autoCorrect="off" enterKeyHint="go" aria-label="주소" />
        {cur ? <a data-nm-out href={cur} target="_blank" rel="noopener" className="nm-web-btn" aria-label="밖에서 열기" title="밖에서 열기"><DuetIcon name="globe" size={16} /></a> : null}
        {onClose ? <button type="button" className="nm-web-btn" aria-label="닫기" title="닫기" onClick={onClose}><DuetIcon name="x" size={16} /></button> : null}
      </form>
      <div className="nm-web-body">
        {!cur ? (
          <div className="nm-web-note"><p>주소나 검색어를 넣어주세요</p>{blank}</div>
        ) : check.state === "blocked" ? (
          <div className="nm-web-note">
            <b>이 사이트는 앱 안 보기를 막아요</b>
            {check.why ? <span>{check.why}</span> : null}
            <a data-nm-out href={cur} target="_blank" rel="noopener" className="nm-web-out">밖에서 열기</a>
          </div>
        ) : check.state === "checking" ? (
          <p className="nm-web-note">여는 중…</p>
        ) : null}
        {show ? (
          <iframe key={`${cur}#${nonce}`} ref={frame} title="웹" src={frameUrl(cur)} className="nm-web-frame"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write" referrerPolicy="strict-origin-when-cross-origin"
            {...(sameSite(cur) ? {} : { sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals" })} />
        ) : null}
        {show && check.state === "unknown" ? <p className="nm-web-hint">품기 판정을 못 받아서 그냥 띄워 봤어요 · 비어 보이면 「밖에서 열기」</p> : null}
      </div>
    </section>
  );
}

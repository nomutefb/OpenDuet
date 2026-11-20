// SNS 탭 오른쪽 칸(./sns-side.ts) — 위 = 고르기(Instagram · Threads · X) · 아래 = 9:16 자리(껍데기 앱이 이 자리에 진짜 웹뷰를 겹침)
//   그냥 브라우저 · 폰(다리 없음) = 「앱 안 끼움 막음 → 맥 앱 · 윈도우 앱에서 이 칸에 떠요」 + 새 창으로 열기
//   형 본계 화면 = 우리 손 0(형이 누른 것만 · 봄 09:20) · 자리 바뀜 = ResizeObserver · 창 크기 · 탭 떠나면 「끝」
import { useEffect, useRef, useState } from "react";
import { SNS_SITE_KEY, SNS_SITES, type SnsSite, sideBridge, sideMsg, siteOf } from "./sns-side";

const loadSite = (): SnsSite => { try { return siteOf(localStorage.getItem(SNS_SITE_KEY)); } catch { return "instagram"; } };

export function SnsSidePane() {
  const [site, setSite] = useState<SnsSite>(loadSite), box = useRef<HTMLDivElement>(null);
  const [send] = useState(() => sideBridge());
  useEffect(() => {
    try { localStorage.setItem(SNS_SITE_KEY, site); } catch { /* 이번만 */ }
    const el = box.current;
    if (!send || !el) return undefined;
    let raf = 0, last = "";
    const post = () => { raf = 0; const m = sideMsg(site, el.getBoundingClientRect(), window.innerWidth, window.innerHeight), k = JSON.stringify(m); if (k !== last) { last = k; send(m); } };   // 같은 자리 = 다시 안 보냄
    const soon = () => { if (!raf) raf = requestAnimationFrame(post); };
    post();
    const ro = new ResizeObserver(soon); ro.observe(el);
    window.addEventListener("resize", soon);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("resize", soon); };
  }, [site, send]);
  useEffect(() => () => { send?.({ t: "nm-side", on: false }); }, [send]);   // 탭 떠남 = 껍데기 웹뷰 숨김
  const cur = SNS_SITES.find((s) => s.id === site)!;
  return (
    <div className="nm-sns-side">
      <div className="nm-sns-pick" role="tablist" aria-label="SNS 고르기">
        {SNS_SITES.map((s) => <button key={s.id} type="button" role="tab" aria-selected={s.id === site} className={s.id === site ? "on" : ""} onClick={() => setSite(s.id)}>{s.name}</button>)}
      </div>
      <div className="nm-sns-stage">
        <div ref={box} className="nm-sns-box" data-site={site}>
          {send ? <div className="nm-lazy" role="status" aria-label="여는 중"><i /><i /><i /></div> : (
            <div className="nm-sns-noapp">
              <b>{cur.name}</b>
              <p>이 칸은 맥 앱 · 윈도우 앱에서 떠요(인스타 · 스레드 · X 가 웹 칸 끼움을 막음).</p>
              <a href={cur.url} target="_blank" rel="noopener noreferrer">새 창으로 열기</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

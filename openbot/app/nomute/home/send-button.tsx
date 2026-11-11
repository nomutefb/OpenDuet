// 홈 뉴스 카드 한켠 「전송」 단추(형 10-31 12:2x 「뉴스 요약은 우측에 전송 버튼을 만들면 될듯 그게 아니면 넘기는 거니까 전송 픽토그램 애니메이트는 깃허브 리포지토리 내부에 있어」 · 윈터 12:31 「전송 단추는 그 기사 요약 요청 · 넘기는 단추는 새로 안 만들어 · ask 와 같은 길 · 실제 접수는 쏘지 마」)
//   = 옛 「뉴스 요약」 단추(summary-button.tsx · 에디터 셸을 모달로 품어 ask 도구를 누르던 것) 대신 — 누르면 서랍 「요약 요청」(ui/ask.tsx · #/ask) 을 열고 지금 보이는 카드(제목·원문 주소)를 채워 둠(접수는 형이 「보내기」 눌러야 · 여기서 안 쏨)
//   지금 카드 = 품은 덱(/modern-home.html · 채널 nomute-modern-home)에 「current」 를 물어 1초 안에 {title,url} 이 오면 채움 · 안 오면(덱이 그 메시지를 모름) 빈 폼 — ⚠ 덱 쪽 「current」 응답은 에디터 modern-workspace.js 에 아직 없음(짐작) → 있으면 그대로, 없으면 윈터가 덱에 한 줄(아래 PROTO 주석)
//   픽토 애니메이트 = 에디터 자기 것(viewer/index.html #askSend 게이지 .glive/.grun/.gdone + 체크 .ack goTick · 우리 저장소라 라이선스·출처 = nomutefb/editor) 을 작게 옮김: 누르면 바 0→90% 차오르고 폼이 열리면 100% + ✓ 그어짐
import "./send-button.css";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const CHANNEL = "nomute-modern-home", PREFILL_KEY = "nm_ask_prefill";
const FINE = typeof matchMedia === "function" && matchMedia("(hover: hover) and (pointer: fine)").matches;   // 마우스 = PC·확장(꺽쇠 같이) · 손가락 = 폰(밀어서 넘김)
// PROTO(덱 쪽 · 에디터 modern-workspace.js): 부모가 {channel, type:"current"} 를 보내면 {channel, type:"current", card:{title, url, media?}} 로 답(지금 보이는 카드) — 없으면 부모는 1초 뒤 빈 폼
export function askCurrent(frame: HTMLIFrameElement | null): Promise<{ title?: string; url?: string; media?: string } | null> {
  return new Promise((res) => {
    const w = frame?.contentWindow; if (!w) return res(null);
    const t = setTimeout(() => { window.removeEventListener("message", on); res(null); }, 1000);
    const on = (e: MessageEvent) => { const m = e.data as { channel?: string; type?: string; card?: { title?: string; url?: string; media?: string } }; if (e.source !== w || !m || m.channel !== CHANNEL || m.type !== "current") return; clearTimeout(t); window.removeEventListener("message", on); res(m.card || null); };
    window.addEventListener("message", on);
    w.postMessage({ channel: CHANNEL, type: "current" }, location.origin);
  });
}

// 폰 폭(품은 화면 480 이하 · 형 11-05 사진 「모바일 버전 해결점」 = 단추가 카드 오른쪽 끝에 반쯤 걸쳐 화면 밖으로) = 카드 오른쪽 아래 안쪽(INSET)으로 · 카드 높이가 글만큼이라(news-feed DECK) 카드마다 아래 끝이 달라 품은 덱의 앞 카드(#article)를 재어 따라감
//   SEND_ROOM = 카드 아래 안쪽에 비워 둔 단추 자리(news-feed DECK padding-bottom 에 더함 = 단추가 글을 안 덮음) · 넓은 화면 = 옛 자리(세로 가운데 · 반쯤 걸침) 그대로
export const SEND_ROOM = 44;
const INSET = 12;
function useCardCorner(frame: React.RefObject<HTMLIFrameElement | null>, dock: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let off = () => {};
    const attach = () => {
      off();
      const win = el.contentWindow as (Window & typeof globalThis) | null;
      let doc: Document | null = null;
      try { doc = el.contentDocument; } catch { return; }
      const card = doc?.getElementById("article");
      if (!win || !doc || !card || typeof win.ResizeObserver !== "function") return;
      const narrow = win.matchMedia("(max-width:480px)");
      const place = () => {
        const d = dock.current;
        if (!d) return;
        if (!narrow.matches || card.hidden || !card.offsetHeight) { d.removeAttribute("data-fit"); return; }
        let x = 0, y = 0;
        for (let n: HTMLElement | null = card; n; n = n.offsetParent as HTMLElement | null) { x += n.offsetLeft; y += n.offsetTop; }   /* offset = 넘김 중 transform 안 탐(쉰 자리) */
        d.style.setProperty("--nm-card-b", `${y + card.offsetHeight}px`);
        d.style.setProperty("--nm-card-y", `${y}px`); d.style.setProperty("--nm-card-h", `${card.offsetHeight}px`);   // 세로 가운데(형 11-12 07:47)
        d.style.setProperty("--nm-card-r", `${Math.max(0, doc.documentElement.clientWidth - x - card.offsetWidth)}px`);
        d.setAttribute("data-fit", "");
      };
      const ro = new win.ResizeObserver(place);
      ro.observe(card);
      ro.observe(doc.documentElement);
      const mo = new win.MutationObserver(place);
      mo.observe(card, { attributes: true, attributeFilter: ["hidden"] });
      narrow.addEventListener("change", place);
      place();
      off = () => { ro.disconnect(); mo.disconnect(); narrow.removeEventListener("change", place); };
    };
    el.addEventListener("load", attach);
    attach();
    return () => { el.removeEventListener("load", attach); off(); };
  }, [frame, dock]);
}

export function SendButton({ frame }: { frame: React.RefObject<HTMLIFrameElement | null> }) {
  const nav = useNavigate();
  const dock = useRef<HTMLDivElement>(null);
  useCardCorner(frame, dock);
  const [st, setSt] = useState<"" | "run" | "done">("");
  const busy = useRef(false);
  const go = async () => {
    if (busy.current) return; busy.current = true; setSt("run");
    const card = await askCurrent(frame.current);
    try { if (card && (card.title || card.url)) sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ text: [card.title, card.url].filter(Boolean).join("\n"), link: card.url || "", media: card.media || "" })); else sessionStorage.removeItem(PREFILL_KEY); } catch { /* 못 적어도 빈 폼 */ }
    setSt("done");
    setTimeout(() => { void nav({ to: "/ask" }); setTimeout(() => { setSt(""); busy.current = false; }, 400); }, 320);   // ✓ 그어진 뒤 폼으로(에디터 리듬 .3s)
  };
  // 꼴(형 11-03 12:56 「그리고 이 전송버튼, 그냥 전송만 있어도 돼. 화살표가 위일 필요는 없음 … 카드 정 중앙 기준 우측으로 동그라미 반쯤 걸쳐서 …」 · 12:57 「음 비행기 말고 그냥 체크가, 원으로 테두리를 감싼다음에 가운데가 체크 표식으로 모션하는게 더 나을수도있겠다 살짝 이미지 업로드 모션과 비슷」)
  //   = 카드 세로 가운데 · 오른쪽 끝에 반쯤 걸친 반투명 동그라미 · 누르면 원 테가 차오름 → 가운데 ✓ · PC·확장(마우스) = 그 위에 반투명 꺽쇠(다음 카드 · 덱 key next)
  return (
    <div ref={dock} className="nm-send-dock" style={{ "--nm-inset": `${INSET}px` } as React.CSSProperties}>
      {FINE ? <button type="button" className="nm-send-nx" aria-label="다음 카드" title="다음 카드" onClick={() => frame.current?.contentWindow?.postMessage({ channel: CHANNEL, type: "key", action: "next" }, location.origin)}><svg viewBox="0 0 24 24" aria-hidden><path d="M9 6l6 6-6 6" /></svg></button> : null}
      <button type="button" className={`nm-send${st ? " " + st : ""}`} aria-label="이 기사 요약 요청" title="이 기사로 요약 요청(폼이 열려 · 보내기는 거기서)" onClick={() => void go()} disabled={st !== ""}>
        <svg className="nm-send-ring" viewBox="0 0 44 44" aria-hidden><circle className="bg" cx="22" cy="22" r="19" /><circle className="fg" cx="22" cy="22" r="19" /></svg>
        <svg className="nm-send-ck" viewBox="0 0 24 24" aria-hidden><path d="M6 12.5l4 4L18 8" /></svg>
      </button>
    </div>
  );
}

// 홈 뉴스 카드 한켠 「전송」 단추(형 10-31 12:2x 「뉴스 요약은 우측에 전송 버튼을 만들면 될듯 그게 아니면 넘기는 거니까 전송 픽토그램 애니메이트는 깃허브 리포지토리 내부에 있어」 · 윈터 12:31 「전송 단추는 그 기사 요약 요청 · 넘기는 단추는 새로 안 만들어 · ask 와 같은 길 · 실제 접수는 쏘지 마」)
//   = 옛 「뉴스 요약」 단추(summary-button.tsx · 에디터 셸을 모달로 품어 ask 도구를 누르던 것) 대신 — 누르면 서랍 「요약 요청」(ui/ask.tsx · #/ask) 을 열고 지금 보이는 카드(제목·원문 주소)를 채워 둠(접수는 형이 「보내기」 눌러야 · 여기서 안 쏨)
//   지금 카드 = 품은 덱(/modern-home.html · 채널 nomute-modern-home)에 「current」 를 물어 1초 안에 {title,url} 이 오면 채움 · 안 오면(덱이 그 메시지를 모름) 빈 폼 — ⚠ 덱 쪽 「current」 응답은 에디터 modern-workspace.js 에 아직 없음(짐작) → 있으면 그대로, 없으면 윈터가 덱에 한 줄(아래 PROTO 주석)
//   픽토 애니메이트 = 에디터 자기 것(viewer/index.html #askSend 게이지 .glive/.grun/.gdone + 체크 .ack goTick · 우리 저장소라 라이선스·출처 = nomutefb/editor) 을 작게 옮김: 누르면 바 0→90% 차오르고 폼이 열리면 100% + ✓ 그어짐
import "./send-button.css";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

const CHANNEL = "nomute-modern-home", PREFILL_KEY = "nm_ask_prefill";
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

export function SendButton({ frame }: { frame: React.RefObject<HTMLIFrameElement | null> }) {
  const nav = useNavigate();
  const [st, setSt] = useState<"" | "run" | "done">("");
  const busy = useRef(false);
  const go = async () => {
    if (busy.current) return; busy.current = true; setSt("run");
    const card = await askCurrent(frame.current);
    try { if (card && (card.title || card.url)) sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ text: [card.title, card.url].filter(Boolean).join("\n"), link: card.url || "", media: card.media || "" })); else sessionStorage.removeItem(PREFILL_KEY); } catch { /* 못 적어도 빈 폼 */ }
    setSt("done");
    setTimeout(() => { void nav({ to: "/ask" }); setTimeout(() => { setSt(""); busy.current = false; }, 400); }, 320);   // ✓ 그어진 뒤 폼으로(에디터 리듬 .3s)
  };
  return (
    <button type="button" className={`nm-send${st ? " " + st : ""}`} aria-label="이 기사 요약 요청" title="이 기사로 요약 요청(폼이 열려 · 보내기는 거기서)" onClick={() => void go()} disabled={!!st}>
      <span className="nm-send-ic" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V6M6 12l6-6 6 6" /></svg></span>
      <span className="nm-send-tx">전송</span>
      <span className="nm-send-ck" aria-hidden><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg></span>
    </button>
  );
}

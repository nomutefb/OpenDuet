// 같이 보기 칸(봄 11-12 13:54 · 깃 다리) — 보이는 동안만 iframe(안 보면 내려서 다리 「보는 중」이 끊김 · 다시 보면 새 표) · 못 닿으면 지금 웹 칸
import { useEffect, useState } from "react";
import { office } from "../data/office";
import { CO_ALLOW, cobrowseSrc, lnaState } from "./cobrowse";
import { WebPane } from "./web-pane";
import { MeetDock, MeetPick, useMeet, useSyncAgo } from "./meet";   // 화상회의 · 동기화 N초 전 · 「○○가 제어하고 있습니다」(형 11-13 06:4x · 봄 옮김)

export function CobrowsePane({ onClose }: { onClose: () => void }) {
  const [src, setSrc] = useState(""), [state, setState] = useState<"wait" | "ok" | "off">("wait"), [nonce, setNonce] = useState(0);
  const [meet, setMeet] = useMeet(), [picking, setPicking] = useState(false), sync = useSyncAgo();
  useEffect(() => {
    let live = true;
    setState("wait"); setSrc("");
    void office<{ url?: string }>("cobrowse/ticket", { method: "POST", body: "{}" })
      .then(async (d) => {
        const u = cobrowseSrc(d), lna = await lnaState();
        if (!u || lna === "denied") throw new Error("off");
        if (live) { setSrc(u); setState("ok"); }   // 닿나 재기(fetch) 안 함 — 크롬이 공개 사이트 → 테일넷 no-cors 요청을 권한이 있어도 막음(뜸 14:4x 실물 · 35ms 실패) · 틀 자체는 권한으로 뜸 · 권한 물음 = 틀이 붙을 때 브라우저가 띄움
      })
      .catch(() => { if (live) setState("off"); });
    return () => { live = false; };
  }, [nonce]);
  if (state === "off") return <WebPane className="nm-co-off" onClose={onClose} blank={<span className="nm-co-note">같이 보기(맥)에 닿지 못해서 웹 칸으로 열었어요</span>} />;
  return (
    <section className="nm-co" aria-label="같이 보기">
      <div className="nm-co-bar">
        <span className="nm-co-dot" aria-hidden />
        <b>같이 보기</b><span className="nm-co-sub">맥 72 · 화면이 안 뜨면 브라우저 「로컬 네트워크」 허용 · ↻</span>
        <span className="nm-co-sync" aria-live="polite">{sync.ago === null ? "동기화 아직" : `동기화 ${sync.ago}초 전`}</span>
        {!meet ? <button type="button" className="nm-meet-btn" onClick={() => setPicking((x) => !x)}>화상회의</button> : null}
        <button type="button" className="nm-web-btn" aria-label="다시 잇기" title="다시 잇기" onClick={() => setNonce((n) => n + 1)}>↻</button>
        <button type="button" className="nm-web-btn" aria-label="닫기" title="닫기" onClick={onClose}>×</button>
      </div>
      <div className="nm-co-stage">
        {state === "ok" ? <iframe key={src} title="같이 보기" src={src} className="nm-co-frame" allow={CO_ALLOW} referrerPolicy="no-referrer" /> : <p className="nm-web-note">잇는 중…</p>}
        {sync.control?.who ? <span className="nm-co-ctrl" role="status">{sync.control.who}{/[가-힣]$/.test(sync.control.who) && (sync.control.who.charCodeAt(sync.control.who.length - 1) - 0xac00) % 28 === 0 ? "가" : "이"} 제어하고 있습니다</span> : null}
        {picking && !meet ? <MeetPick onStart={(m) => { setMeet(m); setPicking(false); }} onClose={() => setPicking(false)} /> : null}
      </div>
      {meet ? <MeetDock meet={meet} onEnd={() => setMeet(null)} /> : null}
    </section>
  );
}

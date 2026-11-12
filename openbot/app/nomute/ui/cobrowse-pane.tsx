// 같이 보기 칸(봄 11-12 13:54 · 깃 다리) — 보이는 동안만 iframe(안 보면 내려서 다리 「보는 중」이 끊김 · 다시 보면 새 표) · 못 닿으면 지금 웹 칸
import { useEffect, useState } from "react";
import { office } from "../data/office";
import { CO_ALLOW, cobrowseSrc, lnaState, reachWait, reachable } from "./cobrowse";
import { WebPane } from "./web-pane";

export function CobrowsePane({ onClose }: { onClose: () => void }) {
  const [src, setSrc] = useState(""), [state, setState] = useState<"wait" | "ask" | "ok" | "off">("wait"), [nonce, setNonce] = useState(0);
  useEffect(() => {
    let live = true;
    setState("wait"); setSrc("");
    void office<{ url?: string }>("cobrowse/ticket", { method: "POST", body: "{}" })
      .then(async (d) => {
        const u = cobrowseSrc(d), lna = await lnaState();
        if (!u || lna === "denied") throw new Error("off");
        if (live && lna === "prompt") setState("ask");
        if (!(await reachable(u, fetch, reachWait(lna)))) throw new Error("off");   // 닿나 재기 = 권한 물음도 이 한 번에 뜸(형이 허용 누름)
        if (live) { setSrc(u); setState("ok"); }
      })
      .catch(() => { if (live) setState("off"); });
    return () => { live = false; };
  }, [nonce]);
  if (state === "off") return <WebPane className="nm-co-off" onClose={onClose} blank={<span className="nm-co-note">같이 보기(맥)에 닿지 못해서 웹 칸으로 열었어요</span>} />;
  return (
    <section className="nm-co" aria-label="같이 보기">
      <div className="nm-co-bar">
        <span className="nm-co-dot" aria-hidden />
        <b>같이 보기</b><span className="nm-co-sub">맥 72</span>
        <button type="button" className="nm-web-btn" aria-label="다시 잇기" title="다시 잇기" onClick={() => setNonce((n) => n + 1)}>↻</button>
        <button type="button" className="nm-web-btn" aria-label="닫기" title="닫기" onClick={onClose}>×</button>
      </div>
      {state === "ok" ? <iframe key={src} title="같이 보기" src={src} className="nm-co-frame" allow={CO_ALLOW} referrerPolicy="no-referrer" /> : <p className="nm-web-note">{state === "ask" ? "맥에 잇는 중… 브라우저가 「로컬 네트워크」 접근을 물으면 허용을 눌러 줘" : "잇는 중…"}</p>}
    </section>
  );
}

// 같이 보기 칸(봄 11-12 13:54 · 깃 다리) — 보이는 동안만 iframe(안 보면 내려서 다리 「보는 중」이 끊김 · 다시 보면 새 표) · 못 닿으면 지금 웹 칸
import { useEffect, useRef, useState } from "react";
import { office } from "../data/office";
import { CO_ALLOW, cobrowseSrc, lnaState } from "./cobrowse";
import { WebPane } from "./web-pane";
import { MeetDock, MeetPick, useMeet } from "./meet";
import { SketchLayer } from "./sketch";   // 스케치 = 화상회의 틀 위 덧그림(형 11-13 06:49 · 명세 10)   // 화상회의(형 11-13 06:4x · 봄 옮김) · 탭 줄 · 「○○가 제어하고 있습니다」 · 포인터 · 치는 중 · 「동기화 N초 전」 = 다리 판(틀 안 · 깃 다리.mjs)이 그림 = 여기서 겹쳐 안 그림

export function CobrowsePane({ onClose, mode = "browser" }: { onClose: () => void; mode?: "browser" | "meet" }) {
  const [src, setSrc] = useState(""), [state, setState] = useState<"wait" | "ok" | "off">("wait"), [nonce, setNonce] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const [meet0, setMeet] = useMeet(), [picking, setPicking] = useState(mode === "meet"), isMeet = mode === "meet", meet = isMeet ? meet0 : null;   // 브라우저 칸 = 회의 0(형 11-13 09:21 「그냥 웹 브라우저는 내가 대신 로그인하는 그런 용도면 될듯」) · 화상회의 칸 = 열린 회의 없으면 바로 고르기
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
  if (state === "off" && !isMeet) return <WebPane className="nm-co-off" onClose={onClose} blank={<span className="nm-co-note">같이 보기(맥)에 닿지 못해서 웹 칸으로 열었어요</span>} />;
  return (
    <section className={`nm-co${isMeet ? " meet" : ""}`} aria-label={isMeet ? "화상회의" : "브라우저"}>
      <div className="nm-co-bar">
        <span className="nm-co-dot" aria-hidden />
        <b>{isMeet ? "화상회의" : "브라우저"}</b><span className="nm-co-sub" title={`${isMeet ? "맥 72 화면 + 우리 대화" : "맥 72 · 대신 로그인"} · 화면이 안 뜨면 브라우저 「로컬 네트워크」 허용 · ↻`}>{isMeet ? "맥 72 화면 + 우리 대화" : "맥 72 · 대신 로그인"} · 화면이 안 뜨면 브라우저 「로컬 네트워크」 허용 · ↻</span>
        {isMeet && !meet && !picking ? <button type="button" className="nm-meet-btn" onClick={() => setPicking(true)}>회의 시작</button> : null}
        <button type="button" className="nm-web-btn" aria-label="다시 잇기" title="다시 잇기" onClick={() => setNonce((n) => n + 1)}>↻</button>
        <button type="button" className="nm-web-btn" aria-label="닫기" title="닫기" onClick={onClose}>×</button>
      </div>
      <div className="nm-co-stage">
        {state === "ok" ? <iframe ref={frame} key={src} title="같이 보기" src={src} className="nm-co-frame" allow={CO_ALLOW} referrerPolicy="no-referrer" /> : state === "off" ? <p className="nm-web-note">맥 72 에 안 닿음 · <button type="button" className="nm-meet-btn" onClick={() => setNonce((n) => n + 1)}>다시 잇기</button></p> : <p className="nm-web-note">잇는 중…</p>}   {/* 화상회의 칸이 못 닿으면 = 화면 자리만 안내 · 아래 대화는 그대로(명세 「끊김」) */}
        {meet && state === "ok" ? <SketchLayer frame={frame} /> : null}
        {picking && !meet ? <MeetPick onStart={(m) => { setMeet(m); setPicking(false); }} onClose={() => setPicking(false)} /> : null}
      </div>
      {meet ? <MeetDock meet={meet} onEnd={() => setMeet(null)} /> : null}
    </section>
  );
}

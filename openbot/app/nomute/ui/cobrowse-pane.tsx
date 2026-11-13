// 같이 보기 칸(봄 11-12 13:54 · 깃 다리) — 보이는 동안만 iframe(안 보면 내려서 다리 「보는 중」이 끊김 · 다시 보면 새 표) · 못 닿으면 지금 웹 칸
import { useEffect, useRef, useState } from "react";
import { office } from "../data/office";
import { CO_ALLOW, cobrowseSrc, isVia, lnaState } from "./cobrowse";
import { WebPane } from "./web-pane";
import { Dots, EndAsk, MeetDock, MeetPeople, OnAir, startMeet, useMeet, useMeetEnd } from "./meet";
import { SketchLayer, useCoRect } from "./sketch";   // 스케치 = 화상회의 틀 위 덧그림(형 11-13 06:49 · 명세 10)   // 화상회의(형 11-13 06:4x · 봄 옮김) · 탭 줄 · 「○○가 제어하고 있습니다」 · 포인터 · 치는 중 · 「동기화 N초 전」 = 다리 판(틀 안 · 깃 다리.mjs)이 그림 = 여기서 겹쳐 안 그림

export function CobrowsePane({ onClose, mode = "browser" }: { onClose: () => void; mode?: "browser" | "meet" }) {
  const [src, setSrc] = useState(""), [state, setState] = useState<"wait" | "ok" | "off">("wait"), [nonce, setNonce] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null), rect = useCoRect(frame);
  const [meet0, setMeet] = useMeet(), isMeet = mode === "meet", meet = isMeet ? meet0 : null;
  const [opening, setOpening] = useState(""), tried = useRef(false);   // 화상회의 = 카메라 누르면 형 + 챙으로 방이 바로 열림(형 11-13 11:01 「창뜨고 그 아래에 @로 호출하면 한명씩 참가」) · 한 번만 저절로 · 끝낸 뒤엔 「새 회의」
  const open = () => { setOpening("busy"); startMeet().then((m) => { setMeet(m); setOpening(""); }).catch((e) => setOpening(e instanceof Error ? e.message : "못 열었어")); };
  useEffect(() => { if (isMeet && !meet0 && !tried.current) { tried.current = true; open(); } }, [isMeet]);   // eslint-disable-line react-hooks/exhaustive-deps
  const end = useMeetEnd(meet, () => { setMeet(null); onClose(); });
  const [sync, setSync] = useState<{ ago: number; bad?: boolean; paused?: boolean; at: number } | null>(null);   // 다리 신호(깃 · 1~2초마다 {type:'nm-co-sync', ago, bad, paused})
  useEffect(() => {
    const f = (e: MessageEvent) => { const d = e.data as { type?: string; ago?: number; bad?: boolean; paused?: boolean }; if (d && d.type === "nm-co-sync" && e.source === frame.current?.contentWindow && Number.isFinite(d.ago)) setSync({ ago: d.ago!, bad: !!d.bad, paused: !!d.paused, at: Date.now() }); };
    window.addEventListener("message", f); return () => window.removeEventListener("message", f);
  }, []);
  useEffect(() => {
    let live = true;
    setState("wait"); setSrc("");
    void office<{ url?: string }>("cobrowse/ticket", { method: "POST", body: "{}" })
      .then(async (d) => {
        const u = cobrowseSrc(d), lna = u && isVia(u) ? "granted" : await lnaState();   // 같은 집 길 = 권한 안 물음(윈B 브레이브 「로컬 네트워크」 막음이어도 뜸 · 깃 11-13)
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
        {isMeet ? <OnAir ago={state === "ok" && sync ? sync.ago : null} at={sync ? sync.at : 0} /> : <><b>브라우저</b><span className="nm-co-sub" title="맥 72 · 대신 로그인 · 화면이 안 뜨면 브라우저 「로컬 네트워크」 허용 · ↻">맥 72 · 대신 로그인 · 화면이 안 뜨면 브라우저 「로컬 네트워크」 허용 · ↻</span></>}   {/* 화상회의 머리 = 「같이 보는 중」만(형 11-13 15:15 「같이보는중 이라는 말만 뜨면되지 그 외에 다른 값은 안뜨면 돼」) */}
        {isMeet ? <span className="nm-co-sub" /> : null}
        {isMeet && !meet ? (opening === "busy" ? <span className="nm-co-sync">회의 여는 중<Dots /></span> : <button type="button" className="nm-meet-btn" title={opening || undefined} onClick={open}>{opening ? "다시 열기" : "새 회의"}</button>) : null}
        <button type="button" className="nm-web-btn" aria-label="다시 잇기" title="다시 잇기" onClick={() => setNonce((n) => n + 1)}>↻</button>
        <button type="button" className="nm-web-btn" aria-label={meet ? "회의 종료" : "닫기"} title={meet ? "회의 종료" : "닫기"} onClick={meet ? () => end.setAsk(true) : onClose}>×</button>   {/* 화상회의 × = 회의 종료(형 16:18 「x 대신 종료」) */}
      </div>
      <div className="nm-co-stage">
        {state === "ok" ? <iframe ref={frame} key={src} title="같이 보기" src={src} className="nm-co-frame" allow={CO_ALLOW} referrerPolicy="no-referrer" /> : state === "off" ? <p className="nm-web-note"><button type="button" className="nm-meet-btn" onClick={() => setNonce((n) => n + 1)}>브라우저 연결하기</button></p> : <p className="nm-web-note">잇는 중<Dots /></p>}   {/* 화상회의 칸이 못 닿으면 = 화면 자리만 안내 · 아래 대화는 그대로(명세 「끊김」) */}
        {meet && state === "ok" ? <SketchLayer rect={rect} /> : null}
        {meet ? <MeetPeople meet={meet} at={rect} /> : null}
        <EndAsk end={end} />
      </div>
      {meet ? <MeetDock meet={meet} onEnd={() => setMeet(null)} /> : null}
    </section>
  );
}

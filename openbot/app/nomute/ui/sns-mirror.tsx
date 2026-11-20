// SNS 칸 맥 비춤(⑤ B · 소나 설계 ③ · 붙이개 = ./mac-mirror.ts 카리나 · 화면 = 구름 11-20) — 껍데기 다리가 없는 브라우저(남의 PC)에서 맥 크롬의 SNS 화면을 이 칸 9:16 에 영상으로 · 누름 · 끌기 · 굴림을 돌려보냄
//   (형 11-20 09:20 「SNS 탭을 누르면 대화는 유지되고, (좌측에) 우측에 인스타랑 그런거 뜨게해주라」 · 형 10:40 「응 미톳ㅡ 하라는대로 다 해줘.」 · 봄 11:13 「그러니 지어」)
//   단추 = 「맥 화면」(누름 안에서 이어야 소리도 남) · 다른 기기가 보는 중 = 「넘겨받기」 · 「새 창으로 열기」 그대로 · 글 0(설명글 0 · 형 10:05) · 끊김 까닭 = 짧은 상태 한 마디만
//   가만히 둔 화면 = 0(이어진 뒤엔 서버 안 부름 · 영상은 WebRTC 바로 · 칸 떠나면 끊음)
import { type PointerEvent, type WheelEvent, useEffect, useRef, useState } from "react";
import { type MirrorState, mirror, pointOf } from "./mac-mirror";

const WHY: Record<string, string> = { mac_silent: "맥 응답 없음", mac_off: "맥 꺼짐", idle: "10분 쉬어 끊김", taken: "다른 기기로 넘어감", net: "끊김" };   // 형이 끊은 것(hyung) · 칸 떠남 = 말 0

export function SnsMirror({ fallback }: { fallback: string }) {
  const v = useRef<HTMLVideoElement>(null), drag = useRef(false);
  const [s, setS] = useState<MirrorState>(mirror.state);
  useEffect(() => mirror.on(setS), []);
  useEffect(() => () => { mirror.close("leave"); }, []);   // 칸 떠남 = 맥 놓아줌
  const open = (take = false) => { if (v.current) void mirror.connect(v.current, take ? { take: true } : {}); };
  const at = (e: { clientX: number; clientY: number }, clamp: boolean) => { const el = v.current; return el ? pointOf(el.getBoundingClientRect(), el.videoWidth, el.videoHeight, e.clientX, e.clientY, clamp) : null; };
  const live = s.st === "live";
  const down = (e: PointerEvent<HTMLVideoElement>) => {
    if (!live) return;
    const p = at(e, false); if (!p) return;
    drag.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 잡기 못 해도 */ }
    mirror.touch("start", p.x, p.y);
  };
  const move = (e: PointerEvent<HTMLVideoElement>) => { if (!drag.current) return; const p = at(e, true); if (p) mirror.touch("move", p.x, p.y); };
  const up = (e: PointerEvent<HTMLVideoElement>) => { if (!drag.current) return; drag.current = false; const p = at(e, true); if (p) mirror.touch(e.type === "pointercancel" ? "cancel" : "end", p.x, p.y); };
  const wheel = (e: WheelEvent<HTMLVideoElement>) => { if (!live) return; const p = at(e, true); mirror.wheel(e.deltaY, p?.x, p?.y); };
  const why = s.st === "off" && s.why ? WHY[s.why] || "" : "";
  return (
    <>
      <video ref={v} className={`nm-mirror-v${live ? " on" : ""}`} playsInline autoPlay onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel} />
      {s.st === "opening" || s.st === "waiting" ? <div className="nm-lazy" role="status" aria-label="맥 여는 중"><i /><i /><i /></div> : null}
      {s.st === "idle" || s.st === "off" || s.st === "busy" ? (
        <div className="nm-sns-noapp nm-mirror-acts">
          {s.st === "busy" ? <button type="button" onClick={() => open(true)}>넘겨받기</button> : <button type="button" onClick={() => open()}>맥 화면</button>}
          <a href={fallback} target="_blank" rel="noopener noreferrer">새 창으로 열기</a>
          {why ? <small role="status">{why}</small> : null}
        </div>
      ) : null}
      {live && s.muted ? <button type="button" className="nm-mirror-snd" aria-label="소리 켜기" title="소리 켜기" onClick={() => mirror.unmute()}><svg viewBox="0 0 24 24" aria-hidden><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" /><path d="M17 9l4 6M21 9l-4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button> : null}
    </>
  );
}

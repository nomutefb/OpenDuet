// 저장·전송 단추 하나(형 11-01 14:12 「이거 대화방 저장 저장 눌러도 반응이 없다보니까 … 기존 edit 노뮤트 페이지 보면 전송에 게이지 차오르고 체크되는 버튼 잇어
//   그거 깃허브에서 그대로 가져다가 색만 시그니처 색으로 바꿔서 이런 저장 이나 전송 관련된 버튼에 그대로 저장해. 곧바로 저장안되고 전송해서 시간텀이 필요한 저장」)
//   원본 = editor viewer/edit.html goFireStart → goFireOk → goFireDone · 실패 = errStatus · 모양 = viewer/nm-shared.css .go.firing·.checking·.gck(9표면 공용)
//   차례 = 누름 → 게이지 차오름(보내는 중 · 응답이 빨라도 0.9초 = 옛 리듬) → ✓ 그려짐(0.56초 여운) → 원래 글자 · 실패 = 빨강 + 흔들림 1.7초 뒤 원래 글자
//   wait = 보낸 뒤 실제로 먹었는지 더 볼 때(시계가 받음 등) — 그동안 빙글 · false 면 실패와 같은 길 · done = ✓ 를 보여 준 뒤(창 닫기·글자 접기는 여기서 = ✓ 가 안 잘림) · 줄임 모션 = ./go-button.css
import { type ReactNode, useEffect, useRef, useState } from "react";
import "./go-button.css";

type Stage = "idle" | "fill" | "ok" | "wait" | "err";
const HOLD = 900, OK = 560, ERR = 1700;
const later = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function GoButton<T>({ go, children, className = "", disabled, busy = "보내는 중", waiting = "반영 기다리는 중", wait, done, label, type = "button" }: {
  go: () => Promise<T>; children: ReactNode; className?: string; disabled?: boolean; busy?: string; waiting?: string; wait?: (res: T) => Promise<boolean>; done?: (res: T) => void; label?: string; type?: "button" | "submit";
}) {
  const [st, setSt] = useState<Stage>("idle"), [why, setWhy] = useState(""), live = useRef(true);
  useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);
  const run = async () => {
    if (st !== "idle" && st !== "err") return;
    setSt("fill"); setWhy("");
    const t0 = Date.now();
    try {
      const res = await go();
      await later(Math.max(0, HOLD - (Date.now() - t0)));
      if (!live.current) return;
      if (wait) {
        setSt("wait");
        if (!(await wait(res))) throw new Error("아직 반영 안 됨");
        if (!live.current) return;
      }
      setSt("ok");
      await later(OK);
      if (!live.current) return;
      setSt("idle"); done?.(res);
    } catch (e) {
      if (!live.current) return;
      setWhy(e instanceof Error ? e.message : ""); setSt("err");
      await later(ERR);
      if (live.current) setSt((s) => (s === "err" ? "idle" : s));
    }
  };
  return (
    <button type={type} className={`nm-go ${className}`} data-stage={st} disabled={disabled && st === "idle"} aria-label={label} aria-busy={st === "fill" || st === "wait" || undefined}
      title={st === "err" && why ? why : undefined} onClick={run}>
      {st === "fill" ? <><span className="nm-go-sr">{busy}</span>{children}</>   /* 형 11-07 13:23 「전송누르면 전송중 안뜨고 그냥게이지 채워지는거로 변경」 = 글자는 그대로 · 게이지만 참(busy = 읽어 주기만) */
        : st === "ok" ? <svg className="nm-go-ck" viewBox="0 0 24 24" role="img" aria-label="됐어"><path d="M5 13l4 4L19 7" /></svg>
        : st === "wait" ? <><i className="nm-go-spin" aria-hidden />{waiting}</>
        : st === "err" ? "못 보냄"
        : children}
    </button>
  );
}

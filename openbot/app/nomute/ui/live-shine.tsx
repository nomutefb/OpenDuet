// 활동 빛 = libraries.dev/orbs 데모 그대로(형 11-01 12:28 「빛 지나가는거 잘 모르는거 같아서 https://libraries.dev/orbs 여기에 나온 걸 프레임을 그대로 살리면돼 빛깔하고 최대한」)
//   LiveShine = 빛 지나가는 글자(데모 .t-shimmer) · 쓰는 곳 = 방 목록 활발한 방 이름(room-list.tsx) · 대화 칸 「생각중…」(office-chat.tsx)
//   ThinkMark = 생각중 말풍선 안 표시 = 점 셋(기본) 또는 구슬(npm thinking-orbs · 데모 「Agent thinking…」 칩 = breathing · 20) · 설정 「생각중 표시」로 고름
//     (형 11-01 12:5x 「저거는 전이 나아. 그 구슬」 · 「혹시 아까우면 저거 선택할수있게해버려 설정에서」 · 「내 취향따라 심심할때 바꾸게」)
//     값은 이 기기에만(엔터 키 칸과 같은 꼴 · ./enter-key.tsx)
import { useSyncExternalStore } from "react";
import { ThinkingOrb } from "thinking-orbs";
import { useTheme } from "@/components/theme-provider";
import { YICO } from "./yeta-icons";
import "./live-shine.css";

export function LiveShine({ text, trunc, sig }: { text: string; trunc?: boolean; sig?: boolean }) {   // sig = 바탕에 시그니처 색 살짝(방 목록 활발한 방 · 형 11-01 14:07)
  return <span className={`t-shimmer${trunc ? " trunc" : ""}${sig ? " sig" : ""}`} data-text={text}>{text}</span>;
}

const KEY = "yeta_think_orb";
const seen = new Set<() => void>();
const get = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };
const set = (on: boolean) => { try { localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* 이번만 */ } seen.forEach((f) => f()); };
const watch = (f: () => void) => { seen.add(f); return () => { seen.delete(f); }; };
const useOrb = () => useSyncExternalStore(watch, get);

export function ThinkMark() {
  const orb = useOrb();
  const { resolved } = useTheme();   // 앱이 고른 판 그대로(원본 auto 는 기기 설정을 따라가서 앱 판과 어긋날 수 있음)
  return orb ? <ThinkingOrb state="breathing" size={20} theme={resolved} /> : <span className="ytdots"><i /><i /><i /></span>;
}

/** 설정 판 행 하나(엔터 키 행과 같은 꼴 · 누름 = 바로 바뀜·저장) */
export function ThinkMarkRow() {
  const orb = useOrb();
  return (
    <button type="button" className="yset-item" onClick={() => set(!orb)}>
      <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.think }} />
      <span className="si-lbl"><span className="si-t">생각중 표시</span></span>
      <span className="si-v"><span className={`si-vt${orb ? " mod" : ""}`}>{orb ? "구슬" : "점 셋"}</span><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></span>
    </button>
  );
}

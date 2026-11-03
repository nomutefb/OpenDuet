// 방마다 「긴 글 다 펼쳐 보기」(형 11-04 08:08 「채팅창마다 전체보기로 접히게 보이는 방 안보이는 방을 고르게 할 수 있으면 좋겠어. 틈 같은 경우는 긴거를 한눈에 봐야하거든. … 기본값은 접히게」)
//   켠 방 = 17줄 접기(./fold.css .yfold) 풂 · 이 기기에만 남음(localStorage) · 방 메뉴(./room-menu.tsx)에서 켜고 끔
import { useSyncExternalStore } from "react";

const KEY = "nm_unfold_rooms";
const seen = new Set<() => void>();
const read = (): string[] => { try { const v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v.filter((x) => typeof x === "string") : []; } catch { return []; } };
let now = read();

export function setUnfold(room: string, on: boolean) {
  now = on ? [...new Set([...now, room])] : now.filter((x) => x !== room);
  try { localStorage.setItem(KEY, JSON.stringify(now)); } catch { /* 이번만 */ }
  seen.forEach((f) => f());
}
export const useUnfold = (room: string) => useSyncExternalStore((f) => { seen.add(f); return () => { seen.delete(f); }; }, () => now.includes(room), () => false);

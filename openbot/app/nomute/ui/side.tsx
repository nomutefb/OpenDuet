// PC(넓은 화면 768px~) = 왼쪽에 늘 열린 대화 목록 + 오른쪽 대화(형 10-28 09:48 「그록.컴 처럼」 · 10:17 「좌측이 좀 더 좁아져도 좋아 … 대화창이 항상 떠있어야」 · 폭 = 256px)
//   폰 = 첫 화면이 대화(회의실) · 목록 = 아래 네비 「목록」 칸(서랍) · 원본 app-shell 바깥 틀에 PATCH 로 끼움(overrides.ts)
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { DuetIcon } from "@/components/duet/icons";
import { appConfig } from "@/lib/generated/application-config";
import { office } from "../data/office";
import { RoomList } from "./room-list";

const WIDE = "(min-width: 768px)";
const wideNow = () => typeof window !== "undefined" && window.matchMedia(WIDE).matches;
const onWide = (cb: () => void) => { const m = window.matchMedia(WIDE); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };
/** 넓은 화면(PC)인가 — 창 너비가 바뀌면 바로 따라감 */
export const useWide = () => useSyncExternalStore(onWide, wideNow, () => false);

/** 지금 열린 방 = 목록에서 칠할 줄 · 첫 화면("/") = PC 에선 회의실 */
function useCurrentRoom() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const m = path.match(/^\/(?:channels|group)\/([^/]+)/);
  return m ? decodeURIComponent(m[1]) : path.replace(/\/+$/, "") === "" ? "all" : undefined;
}

export function NomuteSide() {
  const wide = useWide(), current = useCurrentRoom();
  const me = useQuery({ queryKey: ["nomute", "me"], queryFn: () => office<{ me: { name?: string; who: string } }>("me").then((j) => j.me), staleTime: Infinity, enabled: wide }).data;
  if (!wide) return null;
  return (
    <aside aria-label="대화 목록 칸" className="duet-face flex w-64 shrink-0 flex-col border-duet-hair border-r bg-duet-surface text-duet-ink">
      <div className="px-5 pt-5 pb-3">
        <p className="type-display font-semibold text-duet-ink">{appConfig.brand.productName}</p>
        <p className="type-sub truncate text-duet-ink-2">{me?.name || me?.who || "형"}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
        <RoomList current={current} slim />
      </div>
      <div className="flex shrink-0 flex-col border-duet-hair border-t px-3 py-2">
        <Link to="/settings" activeProps={{ className: "bg-duet-tile" }} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] hover:bg-duet-tile">
          <DuetIcon name="settings" size={22} />설정
        </Link>
      </div>
    </aside>
  );
}

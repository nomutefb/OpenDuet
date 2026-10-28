// 원본 components/shell/menu-sheet.tsx 자리 — 서랍 = 원본 틀(Sheet · 왼쪽 · 340px) 그대로, 안은 우리 대화 목록(ui/room-list.tsx · PC 왼쪽 칸과 같은 것) + 아래 설정
//   여는 곳 = 아래 네비 「목록」 칸(폰 · 형 10-28 10:22 · 맨 위 ≡ 은 뺌) → ROOMS_EVENT
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { DuetIcon } from "@/components/duet/icons";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { appConfig } from "@/lib/generated/application-config";
import { office } from "../data/office";
import { RoomList } from "./room-list";

export const MANAGE_STORAGE_KEY = "openbot.menu-manage";
export const ARCHIVED_STORAGE_KEY = "openduet.menu-archived";
export { EVERYTHING_LINE } from "./room-list";
export const ROOMS_EVENT = "nm-rooms";   // 네비 「목록」 칸 → 이 서랍 열기

export function MenuSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; onNewChannel?: () => void }) {
  const me = useQuery({ queryKey: ["nomute", "me"], queryFn: () => office<{ me: { name?: string; who: string } }>("me").then((j) => j.me), staleTime: Infinity }).data;
  const close = () => onOpenChange(false);
  useEffect(() => { const on = () => onOpenChange(true); window.addEventListener(ROOMS_EVENT, on); return () => window.removeEventListener(ROOMS_EVENT, on); }, [onOpenChange]);
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="duet-face w-[340px] gap-0 bg-duet-surface p-0 sm:max-w-[340px]" showCloseButton={false} side="left">
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="type-display font-semibold text-duet-ink">{appConfig.brand.productName}</SheetTitle>
          <SheetDescription className="type-sub truncate text-duet-ink-2">{me?.name || me?.who || "형"}</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-4">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <RoomList onOpen={close} />
          </div>
          <div className="mt-2 flex shrink-0 flex-col border-duet-hair border-t pt-2">
            <Link to="/settings" onClick={close} activeProps={{ className: "bg-duet-tile" }} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] hover:bg-duet-tile">
              <DuetIcon name="settings" size={22} />설정
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

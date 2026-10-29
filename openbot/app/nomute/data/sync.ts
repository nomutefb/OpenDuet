// 동기화(짝 표 정본 = claude-state assign/2026-10-28/office-app-contract.md · 서버 = 보조 02 PR 1484)
//   열린 방 새 글 = 대화창의 wait 고리(옛 화면과 같은 길 · 서버 2초 박자)
//   그 밖 전부 = GET /api/office/pulse?v=<지난 판>&max_s=25 → 바뀐 칸만 다시 읽음(옛 화면 = 1분마다 다시 읽기)
//   끊기면 3·10·30초 뒤 다시 · 탭이 숨으면 쉼(돌아오면 바로 한 번)
import { queryClient } from "@/query-client";
import { office } from "./office";

type PulseMap = { room?: Record<string, string>; brief?: string; answers?: string; repair?: string; notice?: string; roomset?: string; seen?: string };
type Pulse = { v: string; map: PulseMap; timed_out?: boolean };

export const bus = new EventTarget();   // 「rooms」(방 목록이 바뀜 · detail = 바뀐 방 id 목록) · 그 밖 칸 이름 그대로
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const BACKOFF = [3000, 10000, 30000];

const inv = (key: readonly unknown[]) => void queryClient.invalidateQueries({ queryKey: key });

function apply(prev: PulseMap | null, next: PulseMap) {
  if (!prev) return;
  const rooms = Object.keys({ ...(prev.room || {}), ...(next.room || {}) }).filter((k) => prev.room?.[k] !== next.room?.[k]);
  if (rooms.length) {
    inv(["nomute", "rooms"]); inv(["channels"]); inv(["duet-channels"]);
    for (const r of rooms) { inv(["nomute", "reads", r]); inv(["nomute", "reacts", r]); inv(["nomute", "looks", r]); }
    bus.dispatchEvent(new CustomEvent("rooms", { detail: rooms }));
  }
  if (prev.brief !== next.brief || prev.answers !== next.answers) { inv(["nomute", "brief"]); inv(["approvals"]); bus.dispatchEvent(new Event("brief")); }
  if (prev.repair !== next.repair) { inv(["nomute", "repair"]); bus.dispatchEvent(new Event("repair")); }
  if (prev.seen !== next.seen) { inv(["nomute", "seen"]); inv(["nomute", "rooms"]); inv(["duet-channels"]); }   // 안 읽은 수(rooms[].unread)도 본 데까지로 셈(형 10-30 「읽고나면 1 안없어지는거」)
  if (prev.notice !== next.notice) inv(["nomute", "notice"]);
  if (prev.roomset !== next.roomset) { inv(["nomute", "roomset"]); inv(["nomute", "rooms"]); inv(["duet-channels"]); }
}

let started = false;
export function startSync() {
  if (started) return;
  started = true;
  void (async () => {
    let v = "", map: PulseMap | null = null, fail = 0;
    for (;;) {
      if (document.hidden) { await new Promise<void>((r) => document.addEventListener("visibilitychange", () => r(), { once: true })); v = ""; }
      try {
        const j = await office<Pulse>(`pulse?${v ? `v=${encodeURIComponent(v)}&` : ""}max_s=25`);
        fail = 0;
        if (j.v !== v) { apply(map, j.map || {}); map = j.map || {}; v = j.v; }
      } catch {
        await sleep(BACKOFF[Math.min(fail++, BACKOFF.length - 1)]);
      }
    }
  })();
}

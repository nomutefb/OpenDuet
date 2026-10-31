// 홈 5/6 = 도착한 메시지(형 10-28 11:29 「도착한 메세지가 있다 … 누르면 바로 그 대화로 최신순으로」 · 아래쪽은 네비 뒤로 가려져도 됨) —
//   안 읽은 방만 · 최신순 · 줄 = 얼굴 · 이름 · 마지막 글 한 줄 · 시각(「3:50 PM」) · 안 읽은 수 · 누르면 그 대화.
//   10-31 12:2x 형 「도착한 메세지 좀 더 내리고 한 메세지만 보이게」 → 가장 새 방 하나만(머리 「방 N」 으로 나머지 수) · 칸 높이 = 제 높이(home-screen 셋째 줄 auto)
//   안 읽은 셈·마지막 글·자료 = 방 목록(ui/room-list.tsx)과 같은 규칙·같은 질의 열쇠(서버 rooms[].unread · 없으면 seen < last_ts 점 · 러너 깸 줄 뺀 last_talk).
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { FaceImg, FaceStack } from "../ui/faces";
import { listWhen } from "../ui/when";

type Room = OfficeRoom & { unread?: number };

export function useArrived() {
  const rooms = useQuery({ queryKey: ["nomute", "rooms"], queryFn: () => office<{ rooms: Room[] }>("rooms").then((j) => j.rooms || []), staleTime: 15_000 });
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const seen = useQuery({ queryKey: ["nomute", "seen"], queryFn: () => office<{ seen: Record<string, { ts: number }> }>("seen").then((j) => j.seen || {}), staleTime: 15_000 }).data || {};
  const lastOf = (r: Room) => (r.last_talk !== undefined ? r.last_talk : r.last);
  const count = (r: Room) => {   // 안 읽은 수(서버) · 칸이 없으면 점 = -1 (room-list.tsx 와 같은 셈)
    if (typeof r.unread === "number") return r.unread;
    const l = lastOf(r);
    return l && l.kind !== "human" && (seen[r.id]?.ts || 0) < (r.last_ts || 0) ? -1 : 0;
  };
  const arrived = ((rooms.data || []) as Room[]).filter((r) => r.id !== "notice" && r.with !== "형" && count(r) !== 0).sort((a, b) => (b.last_ts || 0) - (a.last_ts || 0));
  return { arrived, count, lastOf, list, pending: rooms.isPending, error: rooms.isError };
}

export function Arrived() {
  const { arrived, count, lastOf, list, pending, error } = useArrived();
  return (
    <section aria-label="도착한 메시지" className="flex min-h-0 flex-col">
      <h2 className="yset-sec">도착한 메시지</h2>   {/* 「방 N」 뺌(형 10-31 12:3x 「방1 이런거 없고 신규 메세지 n 만 뜨면 됨」) — 수는 아래 타일 말머리 배지로 */}
      {!arrived.length ? <p className="px-1 text-[13px] text-[var(--mut)]">{error ? "못 받았어" : pending ? "받는 중…" : "새로 온 글 없음"}</p> : (
        <ul className="flex min-h-0 flex-col gap-2 pb-[calc(86px+env(safe-area-inset-bottom))]">   {/* 한 방만(형 10-31 12:2x 「한 메세지만 보이게」) · 스크롤 0 · 아래 여백 = 네비 자리 · 나머지 방 수는 머리 「방 N」 이 말함 */}
          {arrived.slice(0, 1).map((r) => {
            const l = lastOf(r), ids = roomAgentIds(r, list), p = r.with ? list.find((x) => x.who === r.with) : undefined, n = count(r);
            const total = arrived.reduce((a, x) => a + Math.max(0, count(x)), 0);   // 신규 메시지 수 = 안 읽은 방 전부 합(점만 있는 방 = 0 으로 셈)
            const preview = l ? `${r.with || l.kind === "human" ? "" : `${list.find((x) => x.who === l.who)?.name || l.who}: `}${(l.text || "").split("\n")[0]}` : "";
            return (
              <li key={r.id} className="relative pt-2">
                {/* 「신규 메시지 N」 = 메시지 타일 말머리(위 왼쪽 모서리)에 걸친 형광 알약(형 「메세지 도형 말머리에 걸쳐서」) · N = 안 읽은 방 전부 합 · 0 이면 「새 메시지」만 */}
                <b className="absolute -top-0.5 left-3 z-10 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[11px] font-bold leading-4 tabular-nums text-black shadow-sm">신규 메시지{total > 0 ? ` ${total > 99 ? "99+" : total}` : ""}</b>
                <Link to={r.id === "all" ? "/group/$channelId" : "/channels/$channelId"} params={{ channelId: r.id }} className="yset-item">
                  {r.with ? <FaceImg id={idOf(r.with, list)} size={36} /> : <span className="grid size-9 shrink-0 place-items-center"><FaceStack ids={ids.slice(0, 3)} size={20} /></span>}
                  <span className="min-w-0 flex-1 text-left">
                    <span className="flex items-center gap-1.5">
                      <b className="truncate text-[15px] font-bold">{p?.name || r.name}</b>
                      <span className="ml-auto shrink-0 text-[11px] tabular-nums text-[var(--mut)]">{listWhen(r.last_ts)}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span data-content className="block min-w-0 flex-1 truncate text-[12px]">{preview}</span>
                      {n > 0 ? <b aria-label={`안 읽은 글 ${n}개`} className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[var(--accent)] px-1.5 text-[11px] font-bold tabular-nums text-black">{n > 99 ? "99+" : n}</b>
                        : <span aria-label="안 읽음" className="size-2 shrink-0 rounded-full bg-[var(--accent)]" />}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

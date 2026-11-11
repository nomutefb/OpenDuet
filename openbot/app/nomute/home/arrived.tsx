// 홈 5/6 = 도착한 메시지(형 10-28 11:29 「도착한 메세지가 있다 … 누르면 바로 그 대화로 최신순으로」 · 아래쪽은 네비 뒤로 가려져도 됨) —
//   안 읽은 방만 · 최신순 · 줄 = 얼굴 · 이름 · 마지막 글 한 줄 · 시각(「3:50 PM」) · 안 읽은 수 · 누르면 그 대화.
//   10-31 12:2x 형 「도착한 메세지 좀 더 내리고 한 메세지만 보이게」 → 가장 새 방 하나만(머리 「방 N」 으로 나머지 수) · 칸 높이 = 제 높이(home-screen 셋째 줄 auto)
//   안 읽은 셈·마지막 글·자료 = 방 목록(ui/room-list.tsx)과 같은 규칙·같은 질의 열쇠(서버 rooms[].unread · 없으면 seen < last_ts 점 · 러너 깸 줄 뺀 last_talk).
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { FaceImg, FaceStack } from "../ui/faces";
import { listWhen } from "../ui/when";
import { whoName } from "../ui/who-name";

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
  const arrived = ((rooms.data || []) as Room[]).filter((r) => r.id !== "notice" && r.id !== "summary" && r.with !== "형" && count(r) !== 0).sort((a, b) => (b.last_ts || 0) - (a.last_ts || 0));
  return { arrived, count, lastOf, list, pending: rooms.isPending, error: rooms.isError };
}

// 11-11 형 18:49~18:50 봄 1:1 「그러면 그만큼 확보되니까」 「그리고 도착한 메세지 라는 말 없이 그냥 대화가 떠도 될듯」 「그리고 대화 보낸 사람 옆에 몇개 와잇는지 발신자별로 나오면 되고.」 「중첩된 느낌으로 뒤에 잇으면 될거같아.」
//   → 머리 「도착한 메시지」 · 숫자 알약 걷음 · 대화 줄이 바로 · 보낸 이(방)마다 한 장 = 이름 옆에 그 방 안 읽은 수(점만이면 작은 점) · 여러 장이면 맨 앞 한 장 온전히 + 뒤 장은 아래 가장자리만 겹쳐(최대 둘) · 없으면 칸 0(「새로 온 글 없음」 뺌 = 카드가 그만큼 내려옴) · 누르면 그 대화 · 앞 판 = git
export function Arrived() {
  const { arrived, count, lastOf, list, pending } = useArrived();
  if (!arrived.length) return <section aria-label="새로 온 대화" className={`nm-arrived nm-arr-none${pending ? " wait" : ""}`} style={{ gridRow: 3 }} />;   /* 받는 동안만 한 장 자리(follow-pulse.css) · 없으면 0 */
  return (
    <section aria-label={`새로 온 대화 ${arrived.length}곳`} className="nm-arrived flex min-h-0 flex-col" style={{ gridRow: 3 }}>
      <ul className="flex min-h-0 flex-col">
        {arrived.slice(0, 1).map((r) => {
          const l = lastOf(r), ids = roomAgentIds(r, list), p = r.with ? list.find((x) => x.who === r.with) : undefined, n = count(r);
          const preview = l ? `${r.with || l.kind === "human" ? "" : `${list.find((x) => x.who === l.who)?.name || whoName(l.who)}: `}${(l.text || "").split("\n")[0]}` : "";
          return (
            <li key={r.id} className="nm-arr-one" data-stack={Math.min(arrived.length - 1, 2) || undefined}>
              <Link to={r.id === "all" ? "/group/$channelId" : "/channels/$channelId"} params={{ channelId: r.id }} className="yset-item">
                {r.with ? <FaceImg id={idOf(r.with, list)} size={36} /> : <span className="grid size-9 shrink-0 place-items-center"><FaceStack ids={ids.slice(0, 3)} size={20} /></span>}
                <span className="min-w-0 flex-1 text-left">
                  <span className="flex items-center gap-1.5">
                    <b className="truncate text-[15px] font-bold">{p?.name || r.name}</b>
                    {n > 0 ? <i className="nm-arr-n" aria-label={`안 읽은 글 ${n}개`}>{n > 99 ? "99+" : n}</i> : n < 0 ? <i className="nm-arr-dot" aria-label="안 읽은 글 있음" /> : null}
                    <span className="ml-auto shrink-0 text-[11px] tabular-nums text-[var(--mut)]">{listWhen(r.last_ts)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span data-content className="block min-w-0 flex-1 truncate text-[12px]">{preview}</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

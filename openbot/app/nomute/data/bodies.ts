// 몸 목록 = 정본 한 장(claude-state 공통/정본/몸.json → 몸 보고 body 줄 → 서버 GET status bodies · 뜸 editor#2857)
//   형 11-08 01:48 윈터 1:1 「부품 1개가 있어. 근데 이걸 참조하면 되는데 10개를 복사해서 쓰는 꼴임.」 · 01:49 「참조햇으면 한군디만 바꾸면 되는건데」
//   앱에서 몸 이름 · host 이름 · 누가 어디 사는지가 필요하면 여기만 읽는다(파일마다 따로 적지 않음) · 몸이 바뀌면 정본 한 장만 고친다
import { useQuery } from "@tanstack/react-query";
import { office } from "./office";

/** being = 아이 · body = 몸 이름 · kind = pc | mac | vm@<몸> · on = 그 몸에 삶(false = 이사 중) · hosts = 몸 보고 host 이름(첫째 = 지금 이름) */
export type Body = { being: string; body: string; kind: string; on?: boolean; hosts: string[]; moving?: string };

/** 서버가 아직 bodies 를 안 줄 때만 쓰는 사본(정본 11-08 02:0x 판 그대로 · 서버 답이 오면 그쪽이 이김) */
export const BODIES_FALLBACK: Body[] = [
  { being: "윈터", body: "윈A", kind: "pc", on: true, hosts: ["윈A", "win-a", "wina"] },
  { being: "봄", body: "맥", kind: "mac", on: true, hosts: ["맥", "mac"] },
  { being: "시아", body: "시아 PC", kind: "pc", on: true, hosts: ["hwang", "sia"] },
  { being: "누리", body: "누리 PC", kind: "pc", on: false, hosts: ["nuri", "neo"], moving: "이사 전" },
  { being: "뎅", body: "VM 뎅", kind: "vm@윈A", on: true, hosts: ["deng"] },
  { being: "빠르", body: "VM 빠르", kind: "vm@윈A", on: true, hosts: ["fast"] },
  { being: "번개", body: "VM 번개", kind: "vm@윈A", on: true, hosts: ["light"] },
  { being: "뜸", body: "맥 VM 뜸", kind: "vm@맥", on: true, hosts: ["eyes"] },
];

/** 순수 — 서버 bodies(없거나 비면 사본) */
export const bodiesOf = (x?: unknown): Body[] =>
  Array.isArray(x) && x.length ? (x as Body[]).filter((b) => b && b.being && b.body && Array.isArray(b.hosts)) : BODIES_FALLBACK;

/** 순수 — host 이름 → 그 몸(몸 보고 host · 작동 표 key 앞말) */
export const bodyByHost = (bs: Body[], host: string) => bs.find((b) => b.hosts.includes(host));

/** 작동 표와 같은 조회(같은 queryKey = 한 번만 부름) 에서 bodies 만 */
export function useBodies(): Body[] {
  const q = useQuery({ queryKey: ["nomute", "status"], queryFn: () => office<{ bodies?: Body[] }>("status"), refetchInterval: 60_000, staleTime: 30_000 });
  return bodiesOf(q.data?.bodies);
}

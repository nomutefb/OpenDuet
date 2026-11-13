// 형 결정 대기 숫자 한 곳(서랍 칸 · 서랍 안 「할 일」) — 결정 서버 목록이 정본(./today.tsx 와 같은 잣대 · 없을 때만 밤 요약 결정)
//   형 11-13 16:19 봄 옮김 「의사결정을 떠잇는걸 x 누르면 그거 더 곧바로 반영되게해줘. (메뉴 서랍하고, 좌측 프로필 1 둘다)」 — 앞 판 = 밤 요약(brief) 결정만 세서 고른 뒤에도 그 판이 다시 올 때까지 안 줄었음
//   고른 그 자리 = ./decide-pop.tsx markDecided 가 그 줄에 pick 을 먼저 적음 → 여기 숫자가 바로 줆
import { isVideoReq, useDecisions } from "./decide-pop";
import { useBrief } from "./today";

export function useDecideWaiting(): number {
  const dec = useDecisions(), brief = useBrief();
  if (dec.isSuccess) return (dec.data || []).filter((d) => !d.pick && !isVideoReq(d)).length;
  return brief.data?.cols.decide.filter((x) => !x.answer).length || 0;
}

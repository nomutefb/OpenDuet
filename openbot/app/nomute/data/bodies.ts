// 몸 목록 = 정본 한 장(claude-state 공통/정본/몸.json → 몸 보고 body 줄 → 서버 GET status bodies · 뜸 editor#2857)
//   형 11-08 01:48 윈터 1:1 「부품 1개가 있어. 근데 이걸 참조하면 되는데 10개를 복사해서 쓰는 꼴임.」 · 01:49 「참조햇으면 한군디만 바꾸면 되는건데」
//   앱에서 몸 이름 · host 이름 · 누가 어디 사는지가 필요하면 여기만 읽는다(파일마다 따로 적지 않음) · 몸이 바뀌면 정본 한 장만 고친다
import { useQuery } from "@tanstack/react-query";
import { office } from "./office";

export * from "./bodies-core";
import { bodiesOf, type Body } from "./bodies-core";   // type Body = 이 파일 useBodies 도 씀(모루 #2966 짚음 · 봄)

/** 작동 표와 같은 조회(같은 queryKey = 한 번만 부름) 에서 bodies 만 */
export function useBodies(): Body[] {
  const q = useQuery({ queryKey: ["nomute", "status"], queryFn: () => office<{ bodies?: Body[] }>("status"), refetchInterval: 60_000, staleTime: 30_000 });
  return bodiesOf(q.data?.bodies);
}

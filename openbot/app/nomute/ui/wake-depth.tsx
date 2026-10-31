// 호출 맥락 = 봇이 깰 때 같이 받는 최근 글 수(형 11-01 「맥락 reads를 최대 최근 몇 말풍선까지 보이게 할것인가」 · 「자동 reads되야 돼」)
//   서버 = GET/POST wakeset(office/wake-set.json · 형만 바꿈) · 지금 닿는 곳 = 그록봇 깸 본문 · 지피티·클로드는 깸 길이 달라 안 닿음
//   설정 판 행 하나(엔터 키 행과 같은 꼴 · 누름 = 다음 값으로 바로 바뀜·저장)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { office } from "../data/office";
import { YICO } from "./yeta-icons";

const STEPS = [5, 10, 20, 30, 50];
const KEY = ["nomute", "wakeset"] as const;
type WakeSet = { recent: number };

export function WakeDepthRow() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, queryFn: () => office<{ set: WakeSet }>("wakeset").then((j) => j.set), staleTime: 60_000 });
  const go = useMutation({
    mutationFn: (recent: number) => office<{ set: WakeSet }>("wakeset", { method: "POST", body: JSON.stringify({ recent }) }).then((j) => j.set),
    onSuccess: (set) => qc.setQueryData(KEY, set),
  });
  const now = q.data?.recent;
  const next = () => { if (now !== undefined) go.mutate(STEPS.find((n) => n > now) ?? STEPS[0]); };
  return (
    <button type="button" className="yset-item" disabled={now === undefined || go.isPending} onClick={next}>
      <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chat }} />
      <span className="si-lbl"><span className="si-t">호출 맥락</span><span className="si-d">{go.isError ? "저장을 못 했어 · 다시 눌러 줘" : "그록봇이 깰 때 같이 받는 최근 글 수"}</span></span>
      <span className="si-v"><span className="si-vt">{now === undefined ? "…" : `${now}개`}</span><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></span>
    </button>
  );
}

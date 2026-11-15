// 설정 › 봄의 정원 › 「맞춤법 교정(분류용)」 켬/끔(#-061 · 형 11-15 11:36 dm-gik 깃 옮김 「모바일에서는 오타가 많이나서」 · 01:13 「부하가 안되면 설정에서 온오프 하는거로」)
//   켬 = 형 글을 뒤에서 맞춤법 교정본 한 벌 더 만들어 일감 가르기에 먼저 씀 · 형 글(원문)은 그대로 · 서버 = GET/POST spellset(형만 바꿈) · 기본 켬
//   행 하나(호출 맥락 행과 같은 꼴 · 누름 = 바로 바뀜·저장)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DiffValue } from "./state-diff";
import { office } from "../data/office";
import { YICO } from "./yeta-icons";

const KEY = ["nomute", "spellset"] as const;
type SpellSet = { on: boolean; can_edit?: boolean };

export function SpellSetRow() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, queryFn: () => office<SpellSet>("spellset"), staleTime: 60_000 });
  const go = useMutation({
    mutationFn: (on: boolean) => office<SpellSet>("spellset", { method: "POST", body: JSON.stringify({ on }) }),
    onSuccess: (j) => qc.setQueryData(KEY, j),
  });
  const on = q.data?.on;
  return (
    <button type="button" role="switch" aria-checked={!!on} className="yset-item" disabled={on === undefined || go.isPending || q.data?.can_edit === false} onClick={() => go.mutate(!on)}>
      <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.type }} />
      <span className="si-lbl"><span className="si-t">맞춤법 교정(분류용)</span>{go.isError ? <span className="si-d">저장을 못 했어 · 다시 눌러 줘</span> : null}</span>
      <span className="si-v"><span className="si-vt"><DiffValue value={on === undefined ? "…" : on ? "켬" : "끔"} /></span></span>
    </button>
  );
}

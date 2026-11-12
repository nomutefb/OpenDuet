// 다음 창 모델 · 노력도(형 11-12 16:17 봄 1:1 「짓자 거기서 변경하면 연동되게」 · 봄 16:18 pair-bom-eyes 1794467920644 일 ②)
//   러너 서랍 작동 표 「애들 × 연결」 몸 줄 끝 칸 둘 = 그 몸 다음 새 창이 열릴 모델 · 노력도 · 형만 고침(다른 이 = 글자만)
//   저장 = 서버 GET · POST profile/nextwin(사람 문 · 봇 = m/ · 번개 16:29 editor 8e10bd7f01 · GET {nextwin: {이름: {model, effort, at, by} | {…, default: true}}} · POST {who, model, effort} = 형만 · 답 {ok, who, model, effort, at, by}) · 몸 = 교대 도구가 새 창 열기 직전 읽어 ~/.josu/창-모델 · 창-노력도 덮음
//   서버 줄이 아직 없거나 그 이름이 없으면 = 기본(애들 오퍼스 5.5 high · 봄 페이블 5.2 medium) 흐리게
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { office } from "../data/office";
import { useMe } from "./pins";

export const NW_MODELS = [["claude-opus-5-5", "오퍼스 5.5"], ["claude-fable-5-2", "페이블 5.2"], ["claude-sonnet-5-5", "소네트 5.5"]] as const;
export const NW_EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;
export type NextWin = { model: string; effort: string; at?: number; by?: string; default?: boolean };   // default = 형이 아직 안 고름(서버가 기본값을 채워 줌 · 몸 손 0)
const KEY = ["nomute", "nextwin"];
export const nwDefault = (who: string): NextWin => (who === "봄" ? { model: "claude-fable-5-2", effort: "medium" } : { model: "claude-opus-5-5", effort: "high" });
export const nwModelKo = (m: string) => NW_MODELS.find(([id]) => id === m)?.[1] || m;

export function useNextWin() {
  return useQuery({ queryKey: KEY, queryFn: () => office<{ nextwin?: Record<string, NextWin> }>("profile/nextwin").then((j) => j.nextwin || {}), refetchInterval: 60_000, retry: false });
}

/** 몸 줄 끝 칸 둘(모델 · 노력도) — 형 = 고르는 칸 · 그 밖 = 글자. 고르면 바로 저장(되돌리기 = 다시 고름). */
export function NextWinCells({ who }: { who: string }) {
  const q = useNextWin(), me = useMe(), qc = useQueryClient();
  const got = q.data?.[who], set = got && !got.default ? got : undefined, cur = got || nwDefault(who), can = me?.kind === "human" && me.can_write !== false;
  const save = useMutation({
    mutationFn: (v: NextWin) => office<{ nextwin?: Record<string, NextWin> }>("profile/nextwin", { method: "POST", body: JSON.stringify({ who, model: v.model, effort: v.effort }) }),
    onSuccess: (j) => { if (j.nextwin) qc.setQueryData(KEY, j.nextwin); else qc.invalidateQueries({ queryKey: KEY }); },
  });
  const tip = save.error ? `저장 안 됨 · ${(save.error as Error).message}` : set ? `다음 창 = ${nwModelKo(cur.model)} · ${cur.effort}${set.by ? ` · ${set.by}` : ""}` : "기본값(아직 안 고름)";
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();   // 줄 누르면 까닭 펼침 — 칸 손은 줄로 안 올라감
  if (!can) return <><td className="nw" data-def={set ? undefined : ""} title={tip}>{nwModelKo(cur.model)}</td><td className="nw" data-def={set ? undefined : ""} title={tip}>{cur.effort}</td></>;
  return (
    <>
      <td className="nw" data-def={set ? undefined : ""} data-err={save.error ? "" : undefined} title={tip} onClick={stop}>
        <select aria-label={`${who} 다음 창 모델`} value={cur.model} disabled={save.isPending} onChange={(e) => save.mutate({ ...cur, model: e.target.value })}>
          {NW_MODELS.map(([id, ko]) => <option key={id} value={id}>{ko}</option>)}
        </select>
      </td>
      <td className="nw" data-def={set ? undefined : ""} data-err={save.error ? "" : undefined} title={tip} onClick={stop}>
        <select aria-label={`${who} 다음 창 노력도`} value={cur.effort} disabled={save.isPending} onChange={(e) => save.mutate({ ...cur, effort: e.target.value })}>
          {NW_EFFORTS.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </td>
    </>
  );
}

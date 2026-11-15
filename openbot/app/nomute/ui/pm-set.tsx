// 설정 › 봄의 정원 › 「PM」(형 11-15 「PM을 설정에서 지정할 수 있게」)
//   한 번 누르면 서버 POST /pm {who} (같은 사무실 로그인 · GET 은 읽기만) · 명부 pm:true · 대화 목록 맨 위 · 봇 현황 흐름 맨 위가 따라감
//   칩 = 설정에 이미 있는 유리 알약(.yset-chip) · 고를 수 있는 이 = 명부 봇(./pm-set-logic)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { office, people, type OfficePerson } from "../data/office";
import { useMe } from "./pins";
import { pmCandidates } from "./pm-set-logic";

type PmBody = { ok?: boolean; who?: string; can_edit?: boolean };
const PM_KEY = ["nomute", "pm"] as const;

export function usePmLabel() {
  const q = useQuery({ queryKey: PM_KEY, queryFn: () => office<PmBody>("pm"), staleTime: 60_000, refetchInterval: 60_000 });
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const who = q.data?.who || "";
  const p = list.find((x) => x.who === who);
  return who ? (p?.name || who) : "";
}

export function PmSet() {
  const qc = useQueryClient();
  const me = useMe();
  const q = useQuery({ queryKey: PM_KEY, queryFn: () => office<PmBody>("pm"), staleTime: 60_000, refetchInterval: 60_000 });
  const peopleQ = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 });
  const list = peopleQ.data || [];
  const bots = pmCandidates(list);
  const who = q.data?.who || "";
  const can = q.data ? q.data.can_edit !== false : me?.kind === "human";
  const go = useMutation({
    mutationFn: (next: string) => office<PmBody>("pm", { method: "POST", body: JSON.stringify({ who: next }) }),
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: PM_KEY });
      const prevPm = qc.getQueryData<PmBody>(PM_KEY);
      const prevPeople = qc.getQueryData<OfficePerson[]>(["nomute", "people"]);
      qc.setQueryData<PmBody>(PM_KEY, (old) => ({ ...(old || {}), ok: true, who: next }));
      if (prevPeople) qc.setQueryData(["nomute", "people"], prevPeople.map((p) => ({ ...p, pm: p.who === next })));
      return { prevPm, prevPeople };
    },
    onError: (_e, _next, ctx) => {
      if (ctx?.prevPm) qc.setQueryData(PM_KEY, ctx.prevPm);
      if (ctx?.prevPeople) qc.setQueryData(["nomute", "people"], ctx.prevPeople);
    },
    onSuccess: async (j) => {
      qc.setQueryData<PmBody>(PM_KEY, { ok: true, who: j.who, can_edit: j.can_edit !== false });
      const fresh = await people(true).catch(() => null);
      if (fresh) {
        qc.setQueryData(["nomute", "people"], fresh);
        qc.setQueryData(["nomute", "people-tabs"], fresh);
      }
      void qc.invalidateQueries({ queryKey: ["nomute", "bots-sheet"] });
    },
  });
  const busy = go.isPending;
  return (
    <div className="yset-pm">
      <div className="yset-chips" role="radiogroup" aria-label="PM">
        {bots.map((p) => {
          const on = p.who === who;
          const label = p.name || p.who;
          return (
            <button key={p.who} type="button" role="radio" aria-checked={on} className={`yset-chip${on ? " on" : ""}`} disabled={!can || busy || !q.data} onClick={() => { if (!on) go.mutate(p.who); }}>
              {p.face ? <img src={p.face} alt="" width={22} height={22} /> : null}{label}
            </button>
          );
        })}
      </div>
      {!q.isPending && !peopleQ.isPending && !bots.length ? <p className="si-d">명부를 못 읽었어 — 다시 열어 줘</p> : null}
      {go.isError ? <p className="si-d">저장을 못 했어 — 다시 눌러 줘</p> : null}
    </div>
  );
}

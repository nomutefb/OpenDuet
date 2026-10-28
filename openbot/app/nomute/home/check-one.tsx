// 홈 1/6 = 형이 확인할 일(형 10-28 11:29 「내가 체크할 일 … 하나씩 체크할때마다 다음거 나오게」 · 12:22 「점검표 조금만 더 가로로 … 높이 줄어도 … 보기 3개 까지 줘서 판단할 수 있게」) —
//   납작한 한 장 = 종류·제목 한 줄 + 보기 단추 한 줄(최대 3) · 보기를 누르면 그 답이 제자리 서버로 가고 다음 것이 그 자리로 · 남은 수 작게.
//   차례 = 형 결정 필요(밤 요약 brief 「결정 필요」 중 답 안 한 것 = 아래 네비 「할 일」 숫자와 같은 셈) → 수리 「볼 것」(해결 = 신청자 종료 차례 · ui/today.tsx RP_G) →
//   점검표 「손봐야 함」(ui/health.tsx 와 같은 GET health) · 자료·질의 열쇠 = 그 화면들과 같음(같은 캐시 = 같은 숫자).
//   보기(PM 12:22 짐작 · 장부 office-home.md): 결정 = 이번만 허락 · 거절(brief/answer · 늘 허락 = 형 범위 정하기 전 0) / 수리 볼 것 = 종료 · 다시 요청(repair/<No>) · 나중에 /
//   점검표 = 고쳐 달라(윈터에게 · 수리 접수 방에 [수리] 글) · 다시 확인(health/recheck) · 나중에. 답한 것 = 이 화면에서 바로 뺌(서버가 아직 그대로여도) · 나중에 = 이번만 뒤로.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { office } from "../data/office";
import { useBrief } from "../ui/today";

type RepairItem = { no: number; id?: string; room?: string; from?: string; at?: string; kind?: string; title?: string; state: string };
type HealthRow = { id: string; name: string; state: "ready" | "unchecked" | "fix"; label: string; why: string; fix?: string };
type Health = { at: number; rows: HealthRow[] };
type Act = { label: string; path?: string; body?: unknown; key?: string[]; later?: boolean };
type One = { id: string; kind: "decide" | "repair" | "health"; title: string; acts: Act[] };
const KIND: Record<One["kind"], string> = { decide: "결정", repair: "수리 볼 것", health: "점검표" };
const LATER: Act = { label: "나중에", later: true };

export function useCheckQueue(): { list: One[]; pending: boolean } {
  const brief = useBrief();
  const repair = useQuery({ queryKey: ["nomute", "repair"], queryFn: () => office<{ items: RepairItem[] }>("repair").then((j) => j.items || []), refetchInterval: 60_000 });
  const health = useQuery({ queryKey: ["nomute", "health"], queryFn: () => office<Health>("health"), refetchInterval: 60_000 });
  const list: One[] = [
    ...(brief.data?.cols.decide || []).filter((x) => !x.answer).map((x) => ({ id: "d:" + x.key, kind: "decide" as const, title: x.what, acts: [
      { label: "이번만 허락", path: "brief/answer", body: { key: x.key, v: "yes" }, key: ["nomute", "brief"] },
      { label: "거절", path: "brief/answer", body: { key: x.key, v: "no" }, key: ["nomute", "brief"] },
    ] })),
    ...(repair.data || []).filter((x) => x.state === "해결").map((x) => ({ id: "r:" + x.no, kind: "repair" as const, title: `No.${x.no} ${x.title || ""}`.trim(), acts: [
      { label: "종료", path: `repair/${x.no}`, body: { state: "완료" }, key: ["nomute", "repair"] },
      { label: "다시 요청", path: `repair/${x.no}`, body: { state: "재요청" }, key: ["nomute", "repair"] },
      LATER,
    ] })),
    ...(health.data?.rows || []).filter((r) => r.state === "fix").map((r) => ({ id: "h:" + r.id, kind: "health" as const, title: `${r.name} · ${r.why}`, acts: [
      { label: "고쳐 달라", path: "rooms/repair/messages", body: { text: `[수리] [점검표] ${r.name} 손봐야 함 — ${r.why}${r.fix ? ` · 고치는 법: ${r.fix}` : ""}` }, key: ["nomute", "repair"] },
      { label: "다시 확인", path: "health/recheck", body: {}, key: ["nomute", "health"] },
      LATER,
    ] })),
  ];
  return { list, pending: brief.isPending || repair.isPending || health.isPending };
}

export function CheckOne() {
  const qc = useQueryClient();
  const { list, pending } = useCheckQueue();
  const [later, setLater] = useState<string[]>([]), [done, setDone] = useState<string[]>([]);
  const open = list.filter((x) => !done.includes(x.id));
  const queue = [...open.filter((x) => !later.includes(x.id)), ...open.filter((x) => later.includes(x.id))];   // 미룬 것 = 뒤로(사라지지 않음)
  const x = queue[0];
  const act = useMutation({
    mutationFn: async ({ a }: { a: Act; id: string }) => { await office(a.path!, { method: "POST", body: JSON.stringify(a.body) }); return a.key!; },
    onSuccess: (key, { id }) => { setDone((d) => [...d, id]); void qc.invalidateQueries({ queryKey: key }); },
  });
  const pick = (a: Act) => { if (!x) return; if (a.later) setLater((l) => [...l.filter((id) => id !== x.id), x.id]); else act.mutate({ a, id: x.id }); };
  return (
    <section aria-label="형이 확인할 일" className="ycd-card card-left min-h-0 gap-2 overflow-hidden !px-3.5 !py-3">
      <p className="flex min-w-0 items-baseline gap-2">
        <span className="shrink-0 text-[11px] font-semibold text-[var(--accent)]">{x ? KIND[x.kind] : "확인할 일"}</span>
        <span data-content className="min-w-0 flex-1 truncate text-[14px] font-bold">{x ? x.title : pending ? "받는 중…" : "지금 확인할 일 없음"}</span>
        {x ? <span className="shrink-0 text-[11px] tabular-nums text-[var(--mut)]">{`1 / ${queue.length}`}</span> : null}
      </p>
      {x ? (
        <div className="flex min-w-0 gap-2">
          {x.acts.slice(0, 3).map((a) => (
            <button key={a.label} type="button" disabled={act.isPending} onClick={() => pick(a)}
              className="min-w-0 flex-1 truncate rounded-full border border-[var(--glass-line)] px-2.5 py-1.5 text-[13px] font-semibold active:scale-95 disabled:opacity-50">{a.label}</button>
          ))}
        </div>
      ) : null}
      {act.isError ? <p className="text-[12px] text-red-500" role="alert">못 했어 — {act.error.message}</p> : null}
    </section>
  );
}

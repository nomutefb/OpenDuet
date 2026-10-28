// 홈 1/6 = 형이 확인할 일(형 10-28 11:29 「내가 체크할 일 … 하나씩 체크할때마다 다음거 나오게」) — 한 번에 하나만 · 처리하면 다음 것이 그 자리로 · 남은 수 작게.
//   차례 = 형 결정 필요(밤 요약 brief 「결정 필요」 중 답 안 한 것 = 아래 네비 「할 일」 숫자와 같은 셈 · swap/tab-bar.tsx) → 수리 「볼 것」(해결 = 신청자 「종료」 차례 · ui/today.tsx RP_G) →
//   점검표 「손봐야 함」(ui/health.tsx 와 같은 GET health) · 자료·질의 열쇠 = 그 화면들과 같음(같은 캐시 = 같은 숫자) · 처리 = 그 화면과 같은 서버 길.
//   「다음」 = 이번만 뒤로 미룸(이 화면에서만 · 서버엔 안 씀).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { office } from "../data/office";
import { useBrief } from "../ui/today";

type RepairItem = { no: number; id?: string; room?: string; from?: string; at?: string; kind?: string; title?: string; state: string };
type HealthRow = { id: string; name: string; state: "ready" | "unchecked" | "fix"; label: string; why: string; fix?: string };
type Health = { at: number; rows: HealthRow[] };
type One =
  | { id: string; kind: "decide"; title: string; sub: string; key: string }
  | { id: string; kind: "repair"; title: string; sub: string; no: number; room?: string }
  | { id: string; kind: "health"; title: string; sub: string };
const KIND: Record<One["kind"], string> = { decide: "형 결정 필요", repair: "수리 · 볼 것", health: "점검표 · 손봐야 함" };

export function useCheckQueue(): { list: One[]; pending: boolean } {
  const brief = useBrief();
  const repair = useQuery({ queryKey: ["nomute", "repair"], queryFn: () => office<{ items: RepairItem[] }>("repair").then((j) => j.items || []), refetchInterval: 60_000 });
  const health = useQuery({ queryKey: ["nomute", "health"], queryFn: () => office<Health>("health"), refetchInterval: 60_000 });
  const list: One[] = [
    ...(brief.data?.cols.decide || []).filter((x) => !x.answer).map((x) => ({ id: "d:" + x.key, kind: "decide" as const, key: x.key, title: x.what, sub: [x.impact && x.impact !== "-" ? x.impact : "", x.room ? `어디: ${x.room}` : ""].filter(Boolean).join(" · ") })),
    ...(repair.data || []).filter((x) => x.state === "해결").map((x) => ({ id: "r:" + x.no, kind: "repair" as const, no: x.no, room: x.room, title: `No.${x.no} ${x.title || ""}`.trim(), sub: [x.kind, x.from ? `신청 ${x.from}` : ""].filter(Boolean).join(" · ") })),
    ...(health.data?.rows || []).filter((r) => r.state === "fix").map((r) => ({ id: "h:" + r.id, kind: "health" as const, title: r.name, sub: r.why + (r.fix ? ` · 고치는 법: ${r.fix}` : "") })),
  ];
  return { list, pending: brief.isPending || repair.isPending || health.isPending };
}

export function CheckOne() {
  const qc = useQueryClient(), nav = useNavigate();
  const { list, pending } = useCheckQueue();
  const [later, setLater] = useState<string[]>([]);
  const queue = [...list.filter((x) => !later.includes(x.id)), ...list.filter((x) => later.includes(x.id))];   // 미룬 것 = 뒤로(사라지지 않음)
  const x = queue[0];
  const act = useMutation({
    mutationFn: async (a: { path: string; body: unknown; key: string[] }) => { await office(a.path, { method: "POST", body: JSON.stringify(a.body) }); return a.key; },
    onSuccess: (key) => void qc.invalidateQueries({ queryKey: key }),
  });
  const btn = "rounded-full border border-[var(--glass-line)] px-3.5 py-1.5 text-[13px] font-semibold active:scale-95 disabled:opacity-50";
  return (
    <section aria-label="형이 확인할 일" className="ycd-card card-left min-h-0 justify-between gap-1.5 overflow-hidden !p-3.5">
      <div className="flex items-center gap-2 text-[11px] text-[var(--mut)]">
        <span className="font-semibold text-[var(--accent)]">{x ? KIND[x.kind] : "확인할 일"}</span>
        <span className="ml-auto tabular-nums">{x ? `1 / ${queue.length}` : ""}</span>
      </div>
      {!x ? (
        <p className="text-[15px] font-semibold">{pending ? "받는 중…" : "지금 확인할 일 없음"}</p>
      ) : (
        <>
          <div className="min-h-0">
            <p data-content className="line-clamp-1 text-[15px] font-bold leading-snug">{x.title}</p>
            {x.sub ? <p data-content className="mt-0.5 line-clamp-1 text-[12px] text-[var(--mut)]">{x.sub}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {x.kind === "decide" ? (
              <>
                <button type="button" className={btn} disabled={act.isPending} onClick={() => act.mutate({ path: "brief/answer", body: { key: x.key, v: "yes" }, key: ["nomute", "brief"] })}>이번만 허락</button>
                <button type="button" className={btn} disabled={act.isPending} onClick={() => act.mutate({ path: "brief/answer", body: { key: x.key, v: "no" }, key: ["nomute", "brief"] })}>거절</button>
              </>
            ) : x.kind === "repair" ? (
              <>
                <button type="button" className={btn} disabled={act.isPending} onClick={() => act.mutate({ path: `repair/${x.no}`, body: { state: "완료" }, key: ["nomute", "repair"] })}>종료</button>
                <button type="button" className={btn} onClick={() => void nav({ to: "/channels/$channelId", params: { channelId: x.room || "repair" } })}>그 글로</button>
              </>
            ) : (
              <button type="button" className={btn} disabled={act.isPending} onClick={() => act.mutate({ path: "health/recheck", body: {}, key: ["nomute", "health"] })}>다시 확인</button>
            )}
            {queue.length > 1 ? <button type="button" className="ml-auto text-[12px] text-[var(--mut)] underline-offset-2 hover:underline" onClick={() => setLater((l) => [...l.filter((id) => id !== x.id), x.id])}>다음</button> : null}
          </div>
          {act.isError ? <p className="text-[12px] text-red-500" role="alert">못 했어 — {act.error.message}</p> : null}
        </>
      )}
    </section>
  );
}

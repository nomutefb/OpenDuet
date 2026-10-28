// 설정 → 점검표(옛 화면 설정 판과 같은 서버 GET /api/office/health · 다시 확인 = POST health/recheck · 서버 = 보조 02 PR 1472)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageSection } from "@/components/layout/page-shell";
import { office } from "../data/office";
import { t12 } from "./when";

type Row = { id: string; name: string; state: "ready" | "unchecked" | "fix"; label: string; why: string; fix?: string; seen_at?: string };
type Health = { at: number; rows: Row[]; counts: { ready: number; unchecked: number; fix: number }; recheck?: { at: string; by: string } | null };

const DOT: Record<Row["state"], string> = { ready: "bg-emerald-500", unchecked: "bg-amber-400", fix: "bg-red-500" };
const hm = (s?: string | number) => (s ? t12(new Date(s).getTime()) : "");   // 「3:50 PM」(형 10-28 10:22 · ./when.ts)

export function NomuteHealth() {
  const qc = useQueryClient();
  const h = useQuery({ queryKey: ["nomute", "health"], queryFn: () => office<Health>("health"), refetchInterval: 60_000 });
  const re = useMutation({ mutationFn: () => office<Health>("health/recheck", { method: "POST" }), onSuccess: (j) => qc.setQueryData(["nomute", "health"], j) });
  const c = h.data?.counts;
  return (
    <PageSection title="점검표">
      <p className="mt-1 text-sm text-muted-foreground">
        {h.isPending ? "받는 중…" : h.isError ? `못 받았어 — ${h.error.message}` : `준비됨 ${c?.ready ?? 0} · 확인 안 됨 ${c?.unchecked ?? 0} · 고칠 것 ${c?.fix ?? 0} · ${hm(h.data?.at)} 기준`}
      </p>
      <ul className="mt-3 flex flex-col divide-y divide-border rounded-2xl border border-border">
        {(h.data?.rows || []).map((r) => (
          <li key={r.id} className="flex items-start gap-3 px-4 py-3">
            <span aria-hidden className={`mt-1.5 size-2.5 shrink-0 rounded-full ${DOT[r.state]}`} />
            <div data-content className="min-w-0 flex-1">
              <p className="text-sm font-medium">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.why}{r.fix ? ` · 고치는 법: ${r.fix}` : ""}</p>
            </div>
            <span className="shrink-0 text-xs font-medium text-muted-foreground">{r.label}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-3 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-foreground/5 disabled:opacity-50"
        disabled={re.isPending}
        onClick={() => re.mutate()}
      >
        {re.isPending ? "다시 보는 중…" : "다시 확인"}
      </button>
      {re.isError ? <p className="mt-2 text-sm text-destructive" role="alert">다시 확인 못 했어 — {re.error.message}</p> : null}
    </PageSection>
  );
}

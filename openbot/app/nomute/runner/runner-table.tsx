// 러너 여섯 표(깃 11-14 · 형 10:41 깃 창 「지금 러너에 각자 어떤일 하는지 최소 비용으로 확인이 가능하도록 정원 안에 설계해」 ·
//   10:48 「세션 교대 후 설계해서 표로 항상 나오고 최소 비용으로 동기화되게해. 그리고 봄이 항상 볼 수 있게 해」) —
//   자료 = 이미 받는 /api/runner 줄 A 의 seats · jobs(윈A tray-lite 가 잡 훅 파일을 읽어 바뀔 때만 올림 · 명세 claude-state 공통/문서/2026-11-14/러너-표-명세.md)
//   새로 받아 오는 것 0 · 접기 0(늘 보임) · 몇 분째 = 판의 1초 시계(useNowS)로 셈 · seats 칸이 아직 없으면(옛 tray-lite) 표 0 = 옛 꼴 그대로.
import type { RunnerRow } from "./runner-data";
import { mins, short, tableRows } from "./runner-table-rows";

const DOT = { work: "bg-[#71C5E8]", idle: "bg-muted-foreground/40", down: "bg-[#FF5A5F]" } as const;
const KO = { work: "일함", idle: "쉼", down: "꺼짐" } as const;

export function RunnerTable({ d, now, stale }: { d: RunnerRow | null; now: number; stale: boolean }) {
  const rows = tableRows(d);
  if (!rows.length) return null;
  return (
    <table className="mt-3 w-full table-fixed text-xs" aria-label="러너마다 지금 일">
      <colgroup><col className="w-[4.5rem]" /><col className="w-12" /><col /><col className="w-16" /><col className="w-16" /></colgroup>
      <thead className="text-muted-foreground"><tr className="text-left"><th className="py-1 font-normal">러너</th><th className="font-normal">상태</th><th className="font-normal">일</th><th className="text-right font-normal">몇 분째</th><th className="text-right font-normal">깨운 것</th></tr></thead>
      <tbody className="divide-y divide-border">
        {rows.map((r) => (
          <tr key={r.n} className={stale ? "opacity-60" : undefined}>
            <td className="py-1.5 tabular-nums">{short(r.n)}{r.heavy ? <span className="ml-1 text-[10px] text-muted-foreground" title="무거운 자리(heavy · GPU)">무</span> : null}</td>
            <td><span className="inline-flex items-center gap-1"><span aria-hidden className={`size-1.5 rounded-full ${DOT[r.st]}`} />{KO[r.st]}</span></td>
            <td className="truncate" title={r.title}>{r.title || <span className="text-muted-foreground">-</span>}</td>
            <td className="text-right tabular-nums">{r.since != null ? mins(now - r.since) : "-"}</td>
            <td className="truncate text-right text-muted-foreground">{r.ev || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

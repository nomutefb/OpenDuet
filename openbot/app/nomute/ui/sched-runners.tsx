// 스케줄 러너 갈래(형 10-31 「이미 있는 지금 러너를 누락없이」 · 「봇이 없는 러너 스케줄도」 · 「어떤 모델이 들어갔는지」 · 「누구 에서 > 누구로」)
//   지도 = GET schedule runners(뎅 runner_map · 91잡) · 끝 = 봇 ! 대신 그 러너 · 차단기는 끄기 길이 열릴 때까지 보기만 · 모델은 코드에 닿는 것(빠르 대조 · 매번 부른다는 뜻 아님)
import { useEffect, useMemo, useState } from "react";
import { Breaker, cronKo } from "./sched-bits";
import type { RunnerJob, SchedRunners } from "./settings-extra";

const CLOCK_KO: Record<string, string> = { yml: "시간표", beat: "윈A 박자", phone: "폰 커밋", "runner-watch": "메우기", "cron-job": "바깥 타이머", after: "앞 일 뒤따름" };
const KIND_KO: Record<string, string> = { llm: "LLM 닿음", script: "스크립트", unknown: "못 정함" };
const whenOf = (j: RunnerJob) => j.when || cronKo(j.cron_kst) || "부를 때만";

export function RunnerTree({ map, group, go }: { map: SchedRunners; group: string; go: (group: string) => void }) {
  const [openF, setOpenF] = useState(""), [openJ, setOpenJ] = useState("");
  const byFile = useMemo(() => Object.fromEntries(map.jobs.map((j) => [j.file, j])), [map.jobs]);
  const groupOf = (j: RunnerJob) => map.forks.find((f) => f.id === j.fork)?.group || "";
  const jump = (file: string) => {
    const j = byFile[file];
    if (!j) return;
    go(groupOf(j)); setOpenF(j.fork); setOpenJ(j.id);
  };
  useEffect(() => { if (openJ) document.getElementById(`nm-job-${openJ}`)?.scrollIntoView({ block: "center", behavior: "smooth" }); }, [openJ]);
  const Link = ({ file }: { file: string }) => <button type="button" className="nm-sched-chip" disabled={!byFile[file]} onClick={() => jump(file)}>{byFile[file]?.name || file}</button>;
  return (
    <>
    <p className="text-xs text-muted-foreground">러너 차단기는 끄기 길이 열리면 눌려. 지금은 보기만 돼.</p>
    <ul className="nm-sched-tree">
      {map.forks.filter((f) => f.group === group).map((f) => {
        const js = map.jobs.filter((j) => j.fork === f.id), on = openF === f.id;
        return (
          <li key={f.id} className="nm-sched-fork">
            <div className="nm-sched-forkhead">
              <Breaker big on={f.on !== false} label={`${f.name} 차단기`} disabled onFlip={() => {}} />
              <button type="button" aria-expanded={on} onClick={() => setOpenF(on ? "" : f.id)}>
                <b>{f.name}</b><small>꼬챙이 {js.length}{f.note ? ` · ${f.note}` : ""}</small>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d={on ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} /></svg>
              </button>
            </div>
            {on ? (
              <ul className="nm-sched-tines">
                {js.map((j) => {
                  const wide = openJ === j.id, from = map.jobs.filter((x) => x.out?.calls?.includes(j.file));
                  return (
                    <li key={j.id} id={`nm-job-${j.id}`} className="nm-sched-tine">
                      <div className="nm-sched-tinehead">
                        <Breaker on={j.on !== false} label={`${j.name} 차단기`} disabled onFlip={() => {}} />
                        <button type="button" aria-expanded={wide} onClick={() => setOpenJ(wide ? "" : j.id)}>
                          <b>{j.name}</b><small>{whenOf(j)}</small>
                        </button>
                        <span className="nm-sched-tags">{j.gpu?.length ? <i>GPU</i> : null}<i data-k={j.kind}>{KIND_KO[j.kind] || j.kind}</i></span>
                      </div>
                      {wide ? (
                        <div className="nm-sched-rt">
                          <ol className="nm-sched-flow" aria-label={`${j.name} 흐름`}>
                            <li><small>앞에서 받음</small>
                              <span>{(j.clock || []).map((c) => <em key={c}>{CLOCK_KO[c] || c}</em>)}{(j.in?.paths || []).map((p) => <em key={p}>파일 {p}</em>)}{(j.in?.after || []).map((a) => <Link key={a} file={a} />)}{from.map((x) => <Link key={x.file} file={x.file} />)}{!j.clock?.length && !j.in?.paths?.length && !j.in?.after?.length && !from.length ? <em>손·앱으로 시작</em> : null}</span>
                            </li>
                            <li><small>이 일</small><span><b>{j.name}</b><em>{j.file}</em></span></li>
                            <li><small>뒤로 넘김</small><span>{(j.out?.calls || []).filter((c) => c !== j.file).map((c) => <Link key={c} file={c} />)}{(j.out?.calls || []).filter((c) => c !== j.file).length ? null : <em>없음</em>}</span></li>
                            <li><small>알림</small><span>{(j.notify || []).map((n) => <em key={n}>{n}</em>)}{j.notify?.length ? null : <em>없음</em>}</span></li>
                          </ol>
                          <dl className="nm-sched-facts">
                            <div><dt>모델</dt><dd>{j.model?.length ? j.model.join(" · ") : j.providers?.length ? j.providers.join(" · ") : "없음"}</dd></div>
                            <div><dt>돌 자리</dt><dd>{(j.res || []).map((r, i) => `${i + 1}. ${r.at}${r.gpu ? " (GPU)" : ""}`).join(" → ") || "모름"}</dd></div>
                            <div><dt>책임자</dt><dd>{j.owner || "모름"}{j.checked ? "" : " · 확인 전"}</dd></div>
                          </dl>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
    </>
  );
}

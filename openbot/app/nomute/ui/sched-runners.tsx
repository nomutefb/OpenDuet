// 스케줄 러너 갈래(형 10-31 「이미 있는 지금 러너를 누락없이」 · 「봇이 없는 러너 스케줄도」 · 「어떤 모델이 들어갔는지」 · 「누구 에서 > 누구로」)
//   지도 = GET schedule runners(뎅 runner_map · 91잡) · 끝 = 봇 ! 대신 그 러너 · 차단기는 끄기 길이 열릴 때까지 보기만 · 모델은 코드에 닿는 것(빠르 대조 · 매번 부른다는 뜻 아님)
import { useEffect, useMemo, useState } from "react";
import { HEALTH_KO, StatusDot, cronKo, lastKo, stOf, sumOf, worstOf } from "./sched-bits";
import { type RunnerJob, type SchedRunners, nextShort } from "./settings-extra";
import { Chev } from "./chev";   // 꺽쇠 하나(형 11-01)
import { type Review, ReviewBadge, ReviewBox } from "./sched-review";   // 폐기 → 검토(형 11-02 02:1x · 러너 줄도 같은 길)

const CLOCK_KO: Record<string, string> = { yml: "시간표", beat: "윈A 박자", phone: "폰 커밋", "runner-watch": "메우기", "cron-job": "바깥 타이머", after: "앞 일 뒤따름", launchd: "맥 예약" };
const whenOf = (j: RunnerJob) => j.when || cronKo(j.cron_kst) || "부를 때만";

export function RunnerTree({ map, group, go, review = {}, can = false, who = (w) => w }: { map: SchedRunners; group: string; go: (group: string) => void; review?: Record<string, Review>; can?: boolean; who?: (w: string) => string }) {
  const [openF, setOpenF] = useState(""), [openJ, setOpenJ] = useState("");
  const byFile = useMemo(() => Object.fromEntries(map.jobs.filter((j) => j.file).map((j) => [j.file, j])), [map.jobs]);   // 맥 줄은 file "" 이라 열쇠가 겹쳤음(뜸 11-02) → 파일 있는 줄만
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
    <p className="text-xs text-muted-foreground">러너는 보기만 돼. 끄기 길이 열리면 줄마다 스위치가 생겨.</p>
    <ul className="nm-sched-tree">
      {map.forks.filter((f) => f.group === group).map((f) => {
        const js = map.jobs.filter((j) => j.fork === f.id), on = openF === f.id, fs = sumOf(js.map((j) => stOf(j.health, f.on === false || j.on === false)));
        return (
          <li key={f.id} className="nm-sched-fork">
            <div className="nm-sched-forkhead">
              <StatusDot st={worstOf(fs)} />   {/* 꺼진 차단기(눌리지 않음) 대신 이 포크에서 제일 나쁜 상태 하나(뜸 11-02 「차단기가 화면에서 제일 밝은데 러너 102개는 전부 disabled」) */}
              <button type="button" aria-expanded={on} onClick={() => setOpenF(on ? "" : f.id)}>
                <b>{f.name}</b><small>꼬챙이 {js.length}{fs.miss ? ` · 놓침 ${fs.miss}` : ""}{fs.late ? ` · 지연 ${fs.late}` : ""}{f.note ? ` · ${f.note}` : ""}</small>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d={on ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} /></svg>
              </button>
            </div>
            {on ? (
              <ul className="nm-sched-tines">
                {js.map((j) => {
                  const wide = openJ === j.id, from = j.file ? map.jobs.filter((x) => x.out?.calls?.includes(j.file)) : [], st = stOf(j.health, f.on === false || j.on === false);
                  const before = [...(j.clock || []).map((c) => <em key={`c${c}`}>{CLOCK_KO[c] || c}</em>), ...(j.in?.paths || []).map((p) => <em key={`p${p}`}>파일 {p}</em>), ...(j.in?.after || []).map((a) => <Link key={`a${a}`} file={a} />), ...from.map((x) => <Link key={`f${x.id}`} file={x.file} />)];
                  const after = [...(j.out?.calls || []).filter((c) => c !== j.file).map((c) => <Link key={`o${c}`} file={c} />), ...(j.out?.to ? [<em key="to">{j.out.to}</em>] : [])];
                  return (
                    <li key={j.id} id={`nm-job-${j.id}`} className="nm-sched-tine">
                      <div className="nm-sched-tinehead nm-row1">
                        <StatusDot st={st} />
                        <button type="button" aria-expanded={wide} onClick={() => setOpenJ(wide ? "" : j.id)}>
                          <b><ReviewBadge r={review[j.id]} />{j.name}</b><small>{whenOf(j)}</small>
                        </button>
                        <small className="nm-row1-last">{lastKo(j.health)}</small>
                        <span className="nm-sched-tags">{j.gpu?.length ? <i>GPU</i> : null}{j.kind === "llm" ? <i data-k="llm">LLM</i> : null}</span>   {/* 「스크립트」 칩 63번 = 소음(뜸 11-02) → LLM·GPU 만 */}
                      </div>
                      {wide ? (
                        <div className="nm-sched-rt">
                          <div className="nm-chain" aria-label={`${j.name} 흐름`}>   {/* 앞 › 이 일 › 뒤 한 줄 · 빈 칸은 안 그림(뜸 11-02 「102줄 중 52줄은 앞 · 뒤 · 알림 다 없음」) */}
                            {before.length ? <><span>{before}</span><Chev dir="right" size={12} /></> : null}
                            <b>{j.name}</b>
                            {after.length ? <><Chev dir="right" size={12} /><span>{after}</span></> : null}
                          </div>
                          {j.notify?.length ? <small>알림 {j.notify.join(" · ")}</small> : null}
                          <small>{[(j.res || []).map((r) => `${r.at}${r.gpu ? "(GPU)" : ""}`).join(" › ") || "돌 자리 모름", j.model?.length ? j.model.join(" · ") : j.providers?.length ? j.providers.join(" · ") : "LLM 없음", `${j.owner || "책임 모름"}${j.checked ? "" : " · 확인 전"}`].join(" · ")}</small>
                          <small className="nm-row1-h" data-st={st}>{HEALTH_KO[st]}{j.health?.last_at ? ` · 마지막 실제 ${nextShort(j.health.last_at)}` : st === "unknown" ? " · 실제로 돌았는지 아직 볼 길이 없어" : ""}{j.health?.drift_min ? ` · 예정보다 ${j.health.drift_min}분 늦음` : ""}</small>
                          <ReviewBox id={j.id} r={review[j.id]} can={can} who={who} />
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

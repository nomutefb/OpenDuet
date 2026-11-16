// 러너 일 판의 「머리」 한 칸 — 그 일이 쓰는 서브 LLM(모델 · 노력도)을 그 자리에서 보고 바꿈 · 셈 = ./llm-head-logic.ts
//   형 11-17 02:0x 구름 맥 창 「이런식으로 서브 llm들이 잇어 얘들도 아까 스케줄러 사이사이에 어떨게 녹일지 봄하고 협의해서 진행해줘」 · 「글구 지금 러너 배선에서 설정한거는 그대로 내용에 반영되개해주고」
//   값 주인 = 설정 「일 모델 · 노력도」 하나 — 여기서도 같은 열쇠 · 같은 길(./model-set.tsx useModelSet · usePipeLlm · useJobSave · usePipeSave)로 읽고 씀(봄 02:04 (ㄱ))
//   꼴 = 낱말 줄(지금 값 = 라임 · 형 11-17 「현재 상태인거에 라임」) · 바꾸기 = 그 자리 재확인 토글 안에 「같이 바뀌는 일 N」(봄 (ㄴ) · 갈래를 바꾸면 그 갈래 일이 다 바뀜) · 바꾸기 = 형만
import { Fragment } from "react";
import { MorphAsk } from "./morph-ask";
import { useMe } from "./pins";
import { useJobSave, useModelSet, usePipeLlm, usePipeSave } from "./model-set";
import { type Choice, type Pick, pipePatch } from "./model-set-logic";
import { type HeadJob, type HeadKey, headKeyOf, headMates, headNote, headOf } from "./llm-head-logic";
import "./llm-head.css";

/** 낱말 줄 — 지금 값은 라임 글자 · 다른 낱말을 누르면 그 낱말이 [아니오] [바꾸기] 로(형만). */
function Line({ label, list, value, can, busy, note, onPick }: { label: string; list: Choice[]; value: string; can: boolean; busy: boolean; note: string; onPick: (v: string) => void }) {
  return (
    <div className="ln" role="group" aria-label={label}>
      <span>{label}</span>
      <span className="ws">
        {list.map((c, i) => (
          <Fragment key={c.id}>
            {i ? <i aria-hidden>|</i> : null}
            {c.id === value || !can ? <span className={c.id === value ? "w on" : "w"} aria-current={c.id === value || undefined}>{c.ko}</span>
              : <MorphAsk className="w" disabled={busy} yesText="바꾸기" note={note || undefined} label={`${label} ${c.ko}`} onYes={() => onPick(c.id)}>{c.ko}</MorphAsk>}
          </Fragment>
        ))}
      </span>
    </div>
  );
}
function HeadIn({ job, jobs, k }: { job: HeadJob; jobs: HeadJob[]; k: HeadKey }) {
  const me = useMe(), can = me?.kind === "human" && me.can_write !== false;
  const ms = useModelSet(), pipe = usePipeLlm(), jobSave = useJobSave(), pipeSave = usePipeSave();
  const head = headOf(k, ms.data, pipe.data?.llm, !!pipe.data), mates = headMates(jobs, job);
  const busy = jobSave.isPending || pipeSave.isPending, err = (jobSave.error || pipeSave.error) as Error | null;
  const save = (p: Partial<Pick>) => {
    if (k.kind === "ms") void k.ids.reduce((q, id) => q.then(() => jobSave.mutateAsync({ job: id, ...p })), Promise.resolve() as Promise<unknown>).catch(() => {});   // 묶인 서버 일 = 차례로 같은 값(못 하면 아래 한마디)
    else pipeSave.mutate(pipePatch([k.id], p));
  };
  if (!head) return <div className="nm-lh"><div className="h"><b>머리</b><small>{ms.isError || pipe.isError ? "값을 못 읽었어" : "읽는 중"}</small></div></div>;
  const note = headNote(mates, head, k);
  return (
    <div className="nm-lh" role="group" aria-label={`${job.name} 머리(모델 · 노력도)`} data-busy={busy || undefined}>
      <div className="h"><b>머리</b><small>{head.title}</small>{mates.length > 1 ? <em title={mates.join(" · ")}>같이 바뀌는 일 {mates.length}</em> : null}</div>
      <Line label="모델" list={head.models} value={head.model} can={can} busy={busy} note={note} onPick={(v) => save({ model: v })} />
      <Line label="노력도" list={head.efforts} value={head.effort} can={can} busy={busy} note={note} onPick={(v) => save({ effort: v })} />
      {err ? <p className="err" role="alert">못 바꿨어 — {err.message || "서버 답 없음"}</p> : null}
    </div>
  );
}
/** 갈래를 아는 러너 일에만 뜸(모르면 아무것도 안 그림 · 값도 안 읽음). */
export function LlmHead({ job, jobs }: { job: HeadJob; jobs: HeadJob[] }) {
  const k = headKeyOf(job);
  return k ? <HeadIn job={job} jobs={jobs} k={k} /> : null;
}

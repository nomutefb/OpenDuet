// 설정 「모델 · 노력도」 — 모델을 쓰는 자리마다 어느 모델 · 얼마나 깊이를 한 곳에서 바꿈 · 「모두」 한 줄로 일괄도
//   형 11-15 클라우드 세션 창 「그걸 설정에서 변경 가능하게해줄래?」 · 「그런식으로 봇박스 들어가는거 전수조사해서 설정에서 일괄 모델 하고 노력도 변경 반영이 가능하게 해주라」
//   ① 봇 상자(클로드 일곱) = 다음 새 창이 열릴 때의 모델 · 노력도 — 서버 profile/nextwin(작동 표 「애들 × 연결」 끝 칸 둘과 같은 값 · ./next-win.tsx) · 일괄 = {all: true}
//   ② 서버가 직접 부르는 일 = 일감 가르기 등 — 서버 modelset(office/model-set.json) · 바꾸면 다음 호출부터
//   ③ 파이프라인(러너가 도는 뉴스 등) = 중분류 일곱 갈래 — 앱 설정 한 장(/api/settings 의 llm 칸 · ./genopt.tsx 와 같은 길) · 안 고른 칸 = 스크립트가 원래 쓰는 값 · 다음 실행부터
//   글자(형 11-15 「모델명을 정확히 표기되게 … 노력도도 실제로 구분되는 그 표시되는걸로 cli에」) = 모델 = 정식 이름(Opus 5.5 · Sonnet 5.5 …) · 노력도 = CLI 낱말(low · medium · high · xhigh · max)
//   칸(형 「선택된거가 기본적으로 저기에 나오고 누르면 바꾸게」) = 지금 쓰이는 값이 늘 그 자리에 보임(안 고른 칸도 실제 값 · 흐리게) · 누르면 고르는 판
//   바꾸기 = 형만(그 밖 = 글자만) · 표에 있는 값만 · 못 읽음 · 못 바꿈 = 그 자리에 한마디(조용히 삼키지 않음)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { office } from "../data/office";
import { useMe } from "./pins";
import { type NextWin, NW_EFFORTS, NW_MODELS, nwDefault, useNextWin } from "./next-win";
import { type Choice, type Llm, type Pick, type Sheet, PIPE_DEF, PIPE_GROUPS, effortChoices, koOf, modelChoices, modelName, pipeAllChoices, pipeChoices, pipePatch, pipeRows, sameOf, sumKo } from "./model-set-logic";
import { getJson } from "./news-data";
import "./model-set.css";

const KEY = ["nomute", "modelset"] as const, NW_KEY = ["nomute", "nextwin"], PIPE_KEY = ["nomute", "settings-llm"] as const;
type AppSet = { llm?: Llm; settings?: AppSet; error?: string };
const BOT_MODELS: Choice[] = NW_MODELS.map(([id]) => ({ id, ko: modelName(id) })), BOT_EFFORTS: Choice[] = NW_EFFORTS.map((id) => ({ id, ko: id }));
const BOTS = ["봄", "깃", "빠르", "번개", "시아", "뎅", "뜸", "천둥", "구름"];   // 서버 _nextwin.js 일곱 몸(서버 답에 있는 이름만 그림) + 천둥 · 구름(형 11-16 09:09 dm-bom 「봄 그리고 구름까지는 프로필 누르면 사진 나오게해줘. 설정도 동일하게.」 = 클로드 여덟 + 구름 · 서버가 그 둘을 주기 시작하면 바로 뜸 · 깃한테 부탁 09:24)
export const useModelSet = () => useQuery({ queryKey: KEY, queryFn: () => office<Sheet>("modelset"), staleTime: 60_000, retry: false });
/** 설정 묶음 줄 오른쪽 한마디. */
export function useModelSum(): string {
  const nw = useNextWin().data;
  return sumKo(nw ? BOTS.filter((n) => nw[n]).map((n) => nw[n]) : undefined, BOT_MODELS, BOT_EFFORTS);
}

/** 고르는 칸 하나 — 지금 값이 늘 보이고 누르면 고르는 판(형만) · mixed = 값이 빈 글(「모두」 줄에서 섞였을 때) · dim = 안 고른 값(흐리게). */
function Cell({ what, value, list, can, busy, dim, mixed = "섞임", onPick }: { what: string; value: string; list: Choice[]; can: boolean; busy: boolean; dim?: boolean; mixed?: string; onPick: (v: string) => void }) {
  const text = value ? koOf(list, value) : mixed;
  dim = dim || !value;   // 섞임 = 고른 값이 아니라 상태 → 흐리게
  if (!can) return <span className={`cell${dim ? " dim" : ""}`}>{text}</span>;
  return (
    <label className={`cell pick${dim ? " dim" : ""}${busy ? " busy" : ""}`}>
      <span className="v">{text}</span>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <select aria-label={what} value={value} disabled={busy} onChange={(e) => { if (e.target.value) onPick(e.target.value); }}>
        {value ? null : <option value="">{mixed}</option>}
        {list.map((c) => <option key={c.id} value={c.id}>{c.ko}</option>)}
      </select>
    </label>
  );
}
/** 한 줄 = 이름 + 칸 둘(모델 · 노력도). */
function PickRow({ label, sub, pick, models, efforts, can, busy, dimModel, dimEffort, onPick }: { label: string; sub?: string; pick: Pick; models: Choice[]; efforts: Choice[]; can: boolean; busy: boolean; dimModel?: boolean; dimEffort?: boolean; onPick: (p: Partial<Pick>) => void }) {
  return (
    <div className="nm-ms-row">
      <span className="who"><b>{label}</b>{sub ? <small>{sub}</small> : null}</span>
      <Cell what={`${label} 모델`} value={pick.model} list={models} can={can} busy={busy} dim={dimModel} onPick={(v) => onPick({ model: v })} />
      <Cell what={`${label} 노력도`} value={pick.effort} list={efforts} can={can} busy={busy} dim={dimEffort} onPick={(v) => onPick({ effort: v })} />
    </div>
  );
}

export function ModelSetRows() {
  const qc = useQueryClient(), me = useMe(), can = me?.kind === "human" && me.can_write !== false;
  const nw = useNextWin(), ms = useModelSet();
  const botSave = useMutation({
    mutationFn: (b: { who?: string; all?: true; model?: string; effort?: string }) => office<{ nextwin?: Record<string, NextWin> }>("profile/nextwin", { method: "POST", body: JSON.stringify(b) }),
    onSuccess: (j) => { if (j.nextwin) qc.setQueryData(NW_KEY, j.nextwin); else void qc.invalidateQueries({ queryKey: NW_KEY }); },
  });
  const jobSave = useMutation({
    mutationFn: (b: { job?: string; all?: true; model?: string; effort?: string }) => office<Sheet>("modelset", { method: "POST", body: JSON.stringify(b) }),
    onSuccess: (next) => qc.setQueryData(KEY, next),
  });
  const pipe = useQuery({ queryKey: PIPE_KEY, staleTime: 15_000, retry: false, queryFn: () => getJson<AppSet>(`/api/settings?_=${Date.now()}`) });
  const pipeSave = useMutation({
    mutationFn: async (llm: Llm) => {
      const r = await fetch("/api/settings", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ patch: { llm }, base: {} }) });
      const j = (await r.json().catch(() => ({}))) as AppSet;
      if (!r.ok || !j.settings) throw new Error(j.error || `서버 거절(HTTP ${r.status})`);
      if (!j.settings.llm) throw new Error("서버가 아직 이 칸을 몰라(새 판이 올라가기 전) — 저장 안 됨");   // 옛 서버 = 모르는 칸을 버림 → 저장된 척하지 않음
      return j.settings;
    },
    onSuccess: (next) => qc.setQueryData(PIPE_KEY, next),
  });
  const names = nw.data ? BOTS.filter((n) => nw.data[n]) : [], rows = names.map((n) => nw.data![n] || nwDefault(n));
  const s = ms.data, jobs = s?.jobs || [], jobModels = modelChoices(s?.models || []), jobEfforts = effortChoices();
  const pRows = pipeRows(pipe.data?.llm), pAllIds = PIPE_GROUPS.map((g) => g.id), pAll = pipeAllChoices(jobModels);
  return (
    <div className="nm-ms">
      <section>
        <h3>봇 상자 <small>다음 새 창부터</small></h3>
        {nw.isPending ? <p className="note">불러오는 중</p> : nw.isError ? <p className="note err">봇 상자 값을 못 읽었어 — {(nw.error as Error)?.message || "서버 답 없음"} <button type="button" onClick={() => void nw.refetch()}>다시</button></p> : !names.length ? <p className="note">고를 봇 상자가 없어</p> : (
          <>
            {botSave.isError ? <p className="note err">못 바꿨어 — {(botSave.error as Error)?.message || "서버 답 없음"} · 다시 골라 줘</p> : null}
            <div className="rows">
              <PickRow label="모두" pick={{ model: sameOf(rows, "model"), effort: sameOf(rows, "effort") }} models={BOT_MODELS} efforts={BOT_EFFORTS} can={can} busy={botSave.isPending} onPick={(p) => botSave.mutate({ all: true, ...p })} />
              {names.map((n, i) => <PickRow key={n} label={n} sub={rows[i].default ? "안 고름" : undefined} dimModel={!!rows[i].default} dimEffort={!!rows[i].default} pick={rows[i]} models={BOT_MODELS} efforts={BOT_EFFORTS} can={can} busy={botSave.isPending} onPick={(p) => botSave.mutate({ who: n, ...p })} />)}
            </div>
            <p className="note">지금 열려 있는 창은 그대로야 — 창이 바뀔 때(교대 · 계정 바꿈 · 다시 켬) 이 값으로 열려. 「안 고름」인 봇은 그 상자에 적힌 값으로 열려서 여기 보이는 값과 다를 수 있어.</p>
          </>
        )}
      </section>
      <section>
        <h3>서버가 직접 부르는 일 <small>다음 호출부터</small></h3>
        {ms.isPending ? <p className="note">불러오는 중</p> : ms.isError || !s ? <p className="note err">서버 쪽 값을 못 읽었어 — {(ms.error as Error)?.message || "서버 답 없음"} <button type="button" onClick={() => void ms.refetch()}>다시</button></p> : (
          <>
            {jobSave.isError ? <p className="note err">못 바꿨어 — {(jobSave.error as Error)?.message || "서버 답 없음"} · 다시 골라 줘</p> : null}
            <div className="rows">
              {jobs.length > 1 ? <PickRow label="모두" pick={{ model: sameOf(jobs.map((j) => j.now), "model"), effort: sameOf(jobs.map((j) => j.now), "effort") }} models={jobModels} efforts={jobEfforts} can={can} busy={jobSave.isPending} onPick={(p) => jobSave.mutate({ all: true, ...p })} /> : null}
              {jobs.map((j) => <PickRow key={j.id} label={j.ko} dimModel={j.now.model === j.def.model} dimEffort={j.now.effort === j.def.effort} pick={j.now} models={jobModels} efforts={jobEfforts} can={can} busy={jobSave.isPending} onPick={(p) => jobSave.mutate({ job: j.id, ...p })} />)}
            </div>
          </>
        )}
      </section>
      <section>
        <h3>파이프라인 <small>다음 실행부터</small></h3>
        {pipe.isPending ? <p className="note">불러오는 중</p> : pipe.isError || !pipe.data ? <p className="note err">파이프라인 값을 못 읽었어 — {(pipe.error as Error)?.message || "서버 답 없음"} <button type="button" onClick={() => void pipe.refetch()}>다시</button></p> : (
          <>
            {pipeSave.isError ? <p className="note err">못 바꿨어 — {(pipeSave.error as Error)?.message || "서버 답 없음"}</p> : null}
            <div className="rows">
              <PickRow label="모두" pick={{ model: sameOf(pRows, "model"), effort: sameOf(pRows, "effort") }} dimModel={sameOf(pRows, "model") === PIPE_DEF} dimEffort={sameOf(pRows, "effort") === PIPE_DEF} models={pAll.tiers} efforts={pAll.efforts} can={can} busy={pipeSave.isPending} onPick={(p) => pipeSave.mutate(pipePatch(pAllIds, p))} />
              {PIPE_GROUPS.map((g, i) => { const c = pipeChoices(g.id, jobModels); return <PickRow key={g.id} label={g.ko} dimModel={pRows[i].model === PIPE_DEF} dimEffort={pRows[i].effort === PIPE_DEF} pick={pRows[i]} models={c.tiers} efforts={c.efforts} can={can} busy={pipeSave.isPending} onPick={(p) => pipeSave.mutate(pipePatch([g.id], p))} />; })}
            </div>
            <p className="note">흐린 값 = 안 고름(스크립트가 원래 쓰는 값). 노력도는 스크립트가 high 로 부르던 호출에만 먹어 — 시간이 넘쳐 스스로 한 단계 내린 호출은 그대로 둬.</p>
          </>
        )}
      </section>
    </div>
  );
}

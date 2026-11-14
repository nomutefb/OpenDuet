// 설정 「모델 · 노력도」 — 모델을 쓰는 자리마다 어느 모델 · 얼마나 깊이를 한 곳에서 바꿈 · 「모두」 한 줄로 일괄도
//   형 11-15 클라우드 세션 창 「그걸 설정에서 변경 가능하게해줄래?」 · 「그런식으로 봇박스 들어가는거 전수조사해서 설정에서 일괄 모델 하고 노력도 변경 반영이 가능하게 해주라」
//   ① 봇 상자(클로드 일곱) = 다음 새 창이 열릴 때의 모델 · 노력도 — 서버 profile/nextwin(작동 표 「애들 × 연결」 끝 칸 둘과 같은 값 · ./next-win.tsx) · 일괄 = {all: true}
//   ② 서버가 직접 부르는 일 = 일감 가르기 등 — 서버 modelset(office/model-set.json) · 바꾸면 다음 호출부터
//   바꾸기 = 형만(그 밖 = 글자만) · 표에 있는 값만 · 못 읽음 · 못 바꿈 = 그 자리에 한마디(조용히 삼키지 않음)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { office } from "../data/office";
import { useMe } from "./pins";
import { type NextWin, NW_EFFORTS, NW_MODELS, nwDefault, useNextWin } from "./next-win";
import { type Choice, type Pick, type Sheet, EFFORT_KO, koOf, sameOf, sumKo } from "./model-set-logic";
import "./model-set.css";

const KEY = ["nomute", "modelset"] as const, NW_KEY = ["nomute", "nextwin"];
const KO: Record<string, string> = { "claude-sonnet-5-5": "소넷 5.5" };   // 서버 쪽 표(shared/models.json 표기)와 같은 글자로
const BOT_MODELS: Choice[] = NW_MODELS.map(([id, ko]) => ({ id, ko: KO[id] || ko })), BOT_EFFORTS: Choice[] = NW_EFFORTS.map((id) => ({ id, ko: EFFORT_KO[id] || id }));
const BOTS = ["봄", "깃", "빠르", "번개", "시아", "뎅", "뜸"];   // 서버 _nextwin.js 일곱 몸(서버 답에 있는 이름만 그림)
export const useModelSet = () => useQuery({ queryKey: KEY, queryFn: () => office<Sheet>("modelset"), staleTime: 60_000, retry: false });
/** 설정 묶음 줄 오른쪽 한마디. */
export function useModelSum(): string {
  const nw = useNextWin().data;
  return sumKo(nw ? BOTS.filter((n) => nw[n]).map((n) => nw[n]) : undefined, BOT_MODELS, BOT_EFFORTS);
}

/** 한 줄 = 이름 + 고르는 칸 둘(모델 · 노력도) · can 이 아니면 글자만 · 값이 빈 글이면 「섞임」. */
function PickRow({ label, sub, pick, models, efforts, can, busy, dim, onPick }: { label: string; sub?: string; pick: Pick; models: Choice[]; efforts: Choice[]; can: boolean; busy: boolean; dim?: boolean; onPick: (p: Partial<Pick>) => void }) {
  const cell = (key: keyof Pick, list: Choice[], what: string) => can ? (
    <select aria-label={`${label} ${what}`} value={pick[key]} disabled={busy} onChange={(e) => { if (e.target.value) onPick({ [key]: e.target.value }); }}>
      {pick[key] ? null : <option value="">섞임</option>}
      {list.map((c) => <option key={c.id} value={c.id}>{c.ko}</option>)}
    </select>
  ) : <span>{pick[key] ? koOf(list, pick[key]) : "섞임"}</span>;
  return (
    <div className={`nm-ms-row${dim ? " dim" : ""}`}>
      <span className="who"><b>{label}</b>{sub ? <small>{sub}</small> : null}</span>
      {cell("model", models, "모델")}{cell("effort", efforts, "노력도")}
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
  const names = nw.data ? BOTS.filter((n) => nw.data[n]) : [], rows = names.map((n) => nw.data![n] || nwDefault(n));
  const s = ms.data, jobs = s?.jobs || [];
  return (
    <div className="nm-ms">
      <h3>봇 상자 <small>다음 새 창부터</small></h3>
      {nw.isPending ? <p className="note">불러오는 중</p> : nw.isError ? <p className="note err">봇 상자 값을 못 읽었어 — {(nw.error as Error)?.message || "서버 답 없음"} <button type="button" onClick={() => void nw.refetch()}>다시</button></p> : !names.length ? <p className="note">고를 봇 상자가 없어</p> : (
        <>
          {botSave.isError ? <p className="note err">못 바꿨어 — {(botSave.error as Error)?.message || "서버 답 없음"} · 다시 골라 줘</p> : null}
          <PickRow label="모두" pick={{ model: sameOf(rows, "model"), effort: sameOf(rows, "effort") }} models={BOT_MODELS} efforts={BOT_EFFORTS} can={can} busy={botSave.isPending} onPick={(p) => botSave.mutate({ all: true, ...p })} />
          {names.map((n, i) => <PickRow key={n} label={n} sub={rows[i].default ? "안 고름" : undefined} dim={!!rows[i].default} pick={rows[i]} models={BOT_MODELS} efforts={BOT_EFFORTS} can={can} busy={botSave.isPending} onPick={(p) => botSave.mutate({ who: n, ...p })} />)}
          <p className="note">지금 열려 있는 창은 그대로야 — 창이 바뀔 때(교대 · 계정 바꿈 · 다시 켬) 이 값으로 열려. 「안 고름」인 봇은 그 상자에 적힌 값으로 열려서 여기 보이는 값과 다를 수 있어.</p>
        </>
      )}
      <h3>서버가 직접 부르는 일 <small>다음 호출부터</small></h3>
      {ms.isPending ? <p className="note">불러오는 중</p> : ms.isError || !s ? <p className="note err">서버 쪽 값을 못 읽었어 — {(ms.error as Error)?.message || "서버 답 없음"} <button type="button" onClick={() => void ms.refetch()}>다시</button></p> : (
        <>
          {jobSave.isError ? <p className="note err">못 바꿨어 — {(jobSave.error as Error)?.message || "서버 답 없음"} · 다시 골라 줘</p> : null}
          {jobs.length > 1 ? <PickRow label="모두" pick={{ model: sameOf(jobs.map((j) => j.now), "model"), effort: sameOf(jobs.map((j) => j.now), "effort") }} models={s.models} efforts={s.efforts} can={can} busy={jobSave.isPending} onPick={(p) => jobSave.mutate({ all: true, ...p })} /> : null}
          {jobs.map((j) => <PickRow key={j.id} label={j.ko} sub={j.now.model === j.def.model && j.now.effort === j.def.effort ? "기본값" : undefined} dim={j.now.model === j.def.model && j.now.effort === j.def.effort} pick={j.now} models={s.models} efforts={s.efforts} can={can} busy={jobSave.isPending} onPick={(p) => jobSave.mutate({ job: j.id, ...p })} />)}
        </>
      )}
    </div>
  );
}

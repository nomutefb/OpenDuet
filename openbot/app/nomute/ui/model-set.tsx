// 설정 「모델 · 노력도」 — 모델을 쓰는 자리마다 어느 모델 · 얼마나 깊이를 한 곳에서 바꿈
//   형 11-15 클라우드 세션 창 「그걸 설정에서 변경 가능하게해줄래?」 · 「그런식으로 봇박스 들어가는거 전수조사해서 설정에서 일괄 모델 하고 노력도 변경 반영이 가능하게 해주라」
//   ① 봇 상자(클로드 일곱) = 다음 새 창이 열릴 때의 모델 · 노력도 — 서버 profile/nextwin(작동 표 「애들 × 연결」 끝 칸 둘과 같은 값 · ./next-win.tsx) · 일괄 = {all: true}
//   ② 서버가 직접 부르는 일 = 일감 가르기 등 — 서버 modelset(office/model-set.json) · 바꾸면 다음 호출부터
//   ③ 파이프라인(러너가 도는 뉴스 등) = 중분류 일곱 갈래 — 앱 설정 한 장(/api/settings 의 llm 칸 · ./genopt.tsx 와 같은 길) · 안 고른 칸 = 스크립트가 원래 쓰는 값 · 다음 실행부터
//   「모두」 줄 = 뺌(형 11-19 「그리고 모두 < 항목필요없음」 · 서버의 일괄 길 {all: true} 은 그대로 둠)
//   글자(형 11-15 「모델명을 정확히 표기되게 … 노력도도 실제로 구분되는 그 표시되는걸로 cli에」) = 모델 = 정식 이름(Opus 5.5 · Sonnet 5.5 …) · 노력도 = CLI 낱말(low · medium · high · xhigh · max)
//   칸(형 「선택된거가 기본적으로 저기에 나오고 누르면 바꾸게」) = 지금 쓰이는 값이 늘 그 자리에 보임(안 고른 칸도 실제 값 · 흐리게) · 누르면 고르는 판
//   바꾸기 = 형만(그 밖 = 글자만) · 표에 있는 값만 · 못 읽음 · 못 바꿈 = 그 자리에 한마디(조용히 삼키지 않음)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type CSSProperties, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { office } from "../data/office";
import { useMe } from "./pins";
import { type NextWin, NW_EFFORTS, NW_MODELS, nwDefault, useNextWin } from "./next-win";
import { type Choice, type Llm, type LlmUse, type Pick, type Sheet, PIPE_DEF, PIPE_GROUPS, byRank, effortChoices, groupChoices, koOf, mixedOf, modelChoices, modelName, pipePatch, pipePatchSrc, pipeRows, srcChoices, srcRows, sumKo } from "./model-set-logic";
import { Chev } from "./chev";
import { agoKo } from "./sched-bits";
import { getJson } from "./news-data";
import "./bot-pick.css";   // 고르기 목록 = 「어떤 봇」 고르기 · 입력칸 부름 목록과 같은 판(./bot-pick.tsx · 형 11-02 「하네스 유지」)
import "./drop-motion.css";   // 목록 · 들여쓴 줄이 펼쳐지는 움직임 한 벌(에디터 「드롭다운 등장 모션」 정본)
import "./model-set.css";

const KEY = ["nomute", "modelset"] as const, NW_KEY = ["nomute", "nextwin"], PIPE_KEY = ["nomute", "settings-llm"] as const;
type AppSet = { llm?: Llm; settings?: AppSet; error?: string };
export const BOT_MODELS: Choice[] = byRank(NW_MODELS.map(([id]) => ({ id, ko: modelName(id) }))), BOT_EFFORTS: Choice[] = NW_EFFORTS.map((id) => ({ id, ko: id }));
const BOTS = ["봄", "깃", "빠르", "번개", "시아", "뎅", "뜸", "천둥", "구름"];   // 서버 _nextwin.js 일곱 몸(서버 답에 있는 이름만 그림) + 천둥 · 구름(형 11-16 09:09 dm-bom 「봄 그리고 구름까지는 프로필 누르면 사진 나오게해줘. 설정도 동일하게.」 = 클로드 여덟 + 구름 · 서버가 그 둘을 주기 시작하면 바로 뜸 · 깃한테 부탁 09:24)
export const useModelSet = () => useQuery({ queryKey: KEY, queryFn: () => office<Sheet>("modelset"), staleTime: 60_000, retry: false });
// 값을 읽고 쓰는 길 한 벌 — 설정 화면(아래 ModelSetRows)과 스케줄러 러너 일 판의 「머리」 줄(./llm-head.tsx)이 같은 열쇠 · 같은 길을 씀(값 주인 하나 · 형 11-11 「2개 만들면 수정할때마다 두번수정」 · 봄 11-17 02:04)
export const usePipeLlm = () => useQuery({ queryKey: PIPE_KEY, staleTime: 15_000, retry: false, queryFn: () => getJson<AppSet>(`/api/settings?_=${Date.now()}`) });
/** 호출마다 마지막 실제 모델 · 노력도 + 갈래 표(/token-usage.json 의 llm 칸 · 에디터 shared/token_report.py) — 「지금 값」을 잰 값으로 보여 주고 갈래를 호출별로 풂 · 5분 */
export const useLlmUse = () => useQuery({ queryKey: ["nomute", "llm-use"], staleTime: 5 * 60_000, retry: false, queryFn: () => getJson<{ llm?: LlmUse }>(`/token-usage.json?_=${Date.now()}`).then((j) => j.llm || {}) });
export function useJobSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: { job?: string; all?: true; model?: string; effort?: string }) => office<Sheet>("modelset", { method: "POST", body: JSON.stringify(b) }),
    onSuccess: (next) => qc.setQueryData(KEY, next),
  });
}
export function usePipeSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (llm: Llm) => {
      const r = await fetch("/api/settings", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ patch: { llm }, base: {} }) });
      const j = (await r.json().catch(() => ({}))) as AppSet;
      if (!r.ok || !j.settings) throw new Error(j.error || `서버 거절(HTTP ${r.status})`);
      if (!j.settings.llm) throw new Error("서버가 아직 이 칸을 몰라(새 판이 올라가기 전) — 저장 안 됨");   // 옛 서버 = 모르는 칸을 버림 → 저장된 척하지 않음
      return j.settings;
    },
    onSuccess: (next) => qc.setQueryData(PIPE_KEY, next),
  });
}
/** 설정 묶음 줄 오른쪽 한마디. */
export function useModelSum(): string {
  const nw = useNextWin().data;
  return sumKo(nw ? BOTS.filter((n) => nw[n]).map((n) => nw[n]) : undefined, BOT_MODELS, BOT_EFFORTS);
}

/** 고르는 칸 하나 — 지금 값이 늘 보이고 누르면 고르는 판(형만) · mixed = 값이 빈 글(「모두」 줄에서 섞였을 때) · dim = 안 고른 값(흐리게). */
function Cell({ what, value, list, can, busy, dim, mixed = "섞임", onPick }: { what: string; value: string; list: Choice[]; can: boolean; busy: boolean; dim?: boolean; mixed?: string; onPick: (v: string) => void }) {
  // 누르면 = 기본 고르기(select) 대신 앱 고르기 목록(형 11-18 19:01 「눌럿을때 투박하게 고르지 않게해주고」 · ./bot-pick.tsx 와 같은 판 · 칸 바로 아래 · 아래가 모자라면 위로 · 밖 누름 · Esc = 닫힘 · 위아래 키 · Enter)
  const [open, setOpen] = useState(false), [pos, setPos] = useState<CSSProperties>({}), [hi, setHi] = useState(0), box = useRef<HTMLDivElement>(null), lst = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return undefined;
    setHi(Math.max(0, list.findIndex((c) => c.id === value)));
    // 목록 = body 에 띄움(칸을 품은 카드가 넘침을 숨겨도 안 잘림 · 애들 카드) · 자리 = 칸 오른쪽 끝에 맞춤 · 아래가 모자라면 위로 · 스크롤 · 크기 바뀜 = 닫힘
    const b = box.current?.getBoundingClientRect(), need = Math.min(360, list.length * 40 + 16);
    if (b) { const up = window.innerHeight - b.bottom < need + 96 && b.top > window.innerHeight - b.bottom;   // 96 = 아래 메뉴줄
      setPos({ position: "fixed", right: Math.max(8, window.innerWidth - b.right), minWidth: Math.max(b.width, 150), ...(up ? { bottom: window.innerHeight - b.top + 6, top: "auto" } : { top: b.bottom + 6 }) }); }
    const out = (e: PointerEvent) => { const t = e.target as Node; if (!box.current?.contains(t) && !lst.current?.contains(t)) setOpen(false); };
    const shut = (e: Event) => { if (!lst.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", out); window.addEventListener("scroll", shut, true); window.addEventListener("resize", shut);
    return () => { document.removeEventListener("pointerdown", out); window.removeEventListener("scroll", shut, true); window.removeEventListener("resize", shut); };
  }, [open]);   // eslint-disable-line react-hooks/exhaustive-deps -- 열 때 한 번만 고른 줄로
  const text = value ? koOf(list, value) : mixed;
  dim = dim || !value;   // 섞임 = 고른 값이 아니라 상태 → 흐리게
  if (!can) return <span className={`cell${dim ? " dim" : ""}`}>{text}</span>;
  const pick = (id: string) => { setOpen(false); if (id !== value) onPick(id); };
  const key = (e: KeyboardEvent) => {
    if (!open) { if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } return; }
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setHi((i) => (i + 1) % list.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((i) => (i - 1 + list.length) % list.length); }
    else if (e.key === "Enter") { e.preventDefault(); const c = list[hi]; if (c) pick(c.id); }
  };
  return (
    <div className="cellw" ref={box}>
      <button type="button" className={`cell pick${dim ? " dim" : ""}${busy ? " busy" : ""}`} aria-haspopup="listbox" aria-expanded={open} aria-label={`${what} ${text}`} disabled={busy} onClick={() => setOpen(!open)} onKeyDown={key}>
        <span className="v">{text}</span>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden style={{ rotate: open ? "180deg" : undefined }}><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open ? createPortal(
        <div ref={lst} className="nm-bpick-list nm-mspick" role="listbox" aria-label={what} style={pos}>
          {list.map((c, i) => (
            <button key={c.id} type="button" role="option" aria-selected={c.id === value} data-hi={i === hi || undefined} className="nm-bpick-opt" onPointerEnter={() => setHi(i)} onClick={() => pick(c.id)}>
              <span className="min-w-0 flex-1"><b>{c.menu ? `${c.menu} · ${c.ko}` : c.ko}</b></span>
            </button>
          ))}
        </div>, document.body
      ) : null}
    </div>
  );
}
/** 한 줄 = 이름 + 칸 둘(모델 · 노력도) · 애들 카드 「다음 창」도 이 줄(./bot-manage.tsx · 형 11-18 19:01 「이 형탸로 아래 너희들 모델 선택 도 하네스가 맞아야함」). */
export function PickRow({ label, sub, pick, models, efforts, can, busy, dimModel, dimEffort, onPick, fold, indent }: { label: string; sub?: string; pick: Pick; models: Choice[]; efforts: Choice[]; can: boolean; busy: boolean; dimModel?: boolean; dimEffort?: boolean; onPick: (p: Partial<Pick>) => void; fold?: { open: boolean; onToggle: () => void }; indent?: boolean }) {
  // fold = 이 줄 밑에 들여쓴 줄이 있음(이름을 누르면 펼침 · 접힘) · indent = 그 들여쓴 줄(형 11-19 「조금 들여쓰기를 더 하든지해서, 분류해줘」)
  return (
    <div className={`nm-ms-row${indent ? " sub" : ""}`}>
      {fold ? <button type="button" className="who fold" aria-expanded={fold.open} onClick={fold.onToggle}><b>{label}<Chev dir={fold.open ? "up" : "down"} size={13} /></b>{sub ? <small>{sub}</small> : null}</button>
        : <span className="who"><b>{label}</b>{sub ? <small>{sub}</small> : null}</span>}
      <Cell what={`${label} 모델`} value={pick.model} list={models} can={can} busy={busy} dim={dimModel} onPick={(v) => onPick({ model: v })} />
      <Cell what={`${label} 노력도`} value={pick.effort} list={efforts} can={can} busy={busy} dim={dimEffort} onPick={(v) => onPick({ effort: v })} />
    </div>
  );
}

export function ModelSetRows({ bots = true }: { bots?: boolean } = {}) {   // bots=false = 봇 상자 줄은 애들 화면(./bot-manage.tsx)으로 옮겨서 설정엔 일 쪽 둘만(형 11-16 19:36)
  const qc = useQueryClient(), me = useMe(), can = me?.kind === "human" && me.can_write !== false;
  const nw = useNextWin(), ms = useModelSet();
  const botSave = useMutation({
    mutationFn: (b: { who?: string; all?: true; model?: string; effort?: string }) => office<{ nextwin?: Record<string, NextWin> }>("profile/nextwin", { method: "POST", body: JSON.stringify(b) }),
    onSuccess: (j) => { if (j.nextwin) qc.setQueryData(NW_KEY, j.nextwin); else void qc.invalidateQueries({ queryKey: NW_KEY }); },
  });
  const jobSave = useJobSave(), pipe = usePipeLlm(), pipeSave = usePipeSave();
  const names = nw.data ? BOTS.filter((n) => nw.data[n]) : [], rows = names.map((n) => nw.data![n] || nwDefault(n));
  const s = ms.data, jobs = s?.jobs || [], jobModels = modelChoices(s?.models || []), jobEfforts = effortChoices();
  const llm = pipe.data?.llm as Llm | undefined, pRows = pipeRows(llm), use = useLlmUse().data;
  const [openG, setOpenG] = useState<Record<string, boolean>>({});
  const audit = jobs.find((j) => j.id === "audit"), shownJobs = jobs.filter((j) => !(j.id === "audit" && jobs.some((x) => x.id === "sort")));   // 일감 가르기 · 오더 판독 = 서버가 한 값으로 묶음(한 번에 판독) → 한 줄
  return (
    <div className="nm-ms">
      {bots ? (
      <section>
        <h3>봇 상자 <small>다음 새 창부터</small></h3>
        {nw.isPending ? <p className="note">불러오는 중</p> : nw.isError ? <p className="note err">봇 상자 값을 못 읽었어 — {(nw.error as Error)?.message || "서버 답 없음"} <button type="button" onClick={() => void nw.refetch()}>다시</button></p> : !names.length ? <p className="note">고를 봇 상자가 없어</p> : (
          <>
            {botSave.isError ? <p className="note err">못 바꿨어 — {(botSave.error as Error)?.message || "서버 답 없음"} · 다시 골라 줘</p> : null}
            <div className="rows">
              {names.map((n, i) => <PickRow key={n} label={n} sub={rows[i].default ? "안 고름" : undefined} dimModel={!!rows[i].default} dimEffort={!!rows[i].default} pick={rows[i]} models={BOT_MODELS} efforts={BOT_EFFORTS} can={can} busy={botSave.isPending} onPick={(p) => botSave.mutate({ who: n, ...p })} />)}
            </div>
            <p className="note">지금 열려 있는 창은 그대로야 — 창이 바뀔 때(교대 · 계정 바꿈 · 다시 켬) 이 값으로 열려. 「안 고름」인 봇은 그 상자에 적힌 값으로 열려서 여기 보이는 값과 다를 수 있어.</p>
          </>
        )}
      </section>
      ) : null}
      <section>
        <h3>서버가 직접 부르는 일 <small>다음 호출부터</small></h3>
        {ms.isPending ? <p className="note">불러오는 중</p> : ms.isError || !s ? <p className="note err">서버 쪽 값을 못 읽었어 — {(ms.error as Error)?.message || "서버 답 없음"} <button type="button" onClick={() => void ms.refetch()}>다시</button></p> : (
          <>
            {jobSave.isError ? <p className="note err">못 바꿨어 — {(jobSave.error as Error)?.message || "서버 답 없음"} · 다시 골라 줘</p> : null}
            <div className="rows">
              {shownJobs.map((j) => <PickRow key={j.id} label={j.id === "sort" && audit ? `${j.ko} · ${audit.ko}` : j.ko} dimModel={j.now.model === j.def.model} dimEffort={j.now.effort === j.def.effort} pick={j.now} models={jobModels} efforts={jobEfforts} can={can} busy={jobSave.isPending} onPick={(p) => jobSave.mutate({ job: j.id, ...p })} />)}
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
              {PIPE_GROUPS.map((g, i) => {
                // 갈래 줄 + 그 밑 들여쓴 호출 줄(실제 값이 여럿인 갈래 = 처음부터 펼쳐 둠 · 형 11-19 「여러값인거는 … 그 안에서 분류되어야할듯」)
                const subs = srcRows(g.id, use, llm), c = groupChoices(g.id, subs, jobModels), mixed = mixedOf(subs, "model") || mixedOf(subs, "effort"), one = subs.some((r) => r.pick.model !== PIPE_DEF || r.pick.effort !== PIPE_DEF);
                const open = openG[g.id] ?? (mixed || one);
                return (
                  <div key={g.id} className="grp">
                    <PickRow label={g.ko} dimModel={pRows[i].model === PIPE_DEF} dimEffort={pRows[i].effort === PIPE_DEF} pick={pRows[i]} models={c.tiers} efforts={c.efforts} can={can} busy={pipeSave.isPending} onPick={(p) => pipeSave.mutate(pipePatch([g.id], p))}
                      fold={subs.length ? { open, onToggle: () => setOpenG((o) => ({ ...o, [g.id]: !open })) } : undefined} />
                    {open && subs.length ? (
                      <div className="subs nm-dropin">
                        {subs.map((r) => { const sc = srcChoices(r, pRows[i], jobModels); return <PickRow key={r.id} indent label={r.ko} sub={r.ts ? agoKo(r.ts) : undefined} dimModel={r.pick.model === PIPE_DEF} dimEffort={r.pick.effort === PIPE_DEF} pick={r.pick} models={sc.tiers} efforts={sc.efforts} can={can} busy={pipeSave.isPending} onPick={(p) => pipeSave.mutate(pipePatchSrc(g.id, r.id, p))} />; })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

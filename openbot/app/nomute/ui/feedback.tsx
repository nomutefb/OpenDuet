// 서랍 「피드백」(형 11-01 「이런식으로 다 가져와주라」) — 에디터 피드백 화면(viewer/feedback.html · #939 형 감 라벨 명세 v1)을 앱 네이티브로 · 전엔 에디터 화면을 통째로 품었음(shell FRAME.feedback)
//   카드 = GET /api/labels(viewer/feedback_cards.json 저장소 직독 · 열 때 한 번) · 저장 = POST /api/labels(원본과 같은 몸 · 형이 직접 누름) · shim 통과 목록에 labels(../shim/install.ts)
//   규칙 = 원본 그대로: 기준 글(scale) 맨 위 한 번 → 게이지 눈금 글 · 카드 = 의도 한 줄(ask) → 제목 → 칸(커뮤 최초·첫 보도·퍼짐·X·틈 보냄·확인 시한) → 목적 → 물음·보기 넷 → 게이지 1~5 + 패스
//     저장 = 게이지를 놓거나(score5 · via gauge) 보기를 누르거나(option · via option) 패스(pass · via tap) 하는 순간 · 끄는 중 겹치면 마지막 것만 이어서 · 다시 고르면 덮어씀
//     가림 = 시스템 점수·고른 봇·통·까닭 → 처음 저장한 뒤에만(응답 reveal · 형 − 시스템) · 그때 덧붙이기(태그·이유·처음 안 시각 · addon) 열림
//     고르면 사라짐 = 저장된 카드는 아래 「답한 카드」 무리 맨 위로 · 맨 위 띠 = 마지막 한 장 되돌리기 · 불러올 때 이미 답한 카드는 처음부터 그 무리
//   원본과 다른 점: 덧붙이기 단추 = 공용 게이지 단추(./go-button.tsx · 형 11-01 14:12) · 카드 옮김 = 한 부모 안 key 순서(게이지·쓰던 글 그대로) · 제목 링크 = 앱 안 한 겹(./inapp.ts)
import "./yeta-settings.css";
import "./chan.css";
import "./ed-pages.css";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { GoButton } from "./go-button";
import { Pane } from "./pane";

type Mine = { pass?: boolean; score5?: number | null; option?: number | null; at?: string };
type Card = {
  cid: string; title?: string; link?: string; ask?: string; aim?: string; q?: string; options?: string[]; answered?: boolean; mine?: Mine;
  first_comm_at?: string | null; first_comm_src?: string | null; first_seen_at?: string | null; first_seen_src?: string | null; spread?: number | string | null;
  x_first_seen?: string | null; posts_1h?: number | string | null; sent_gap_min?: number | string | null; check_by?: string | null;
};
type Doc = { at?: string; deadline?: string; skipped?: number; scale?: string; open?: number; cards?: Card[] };
type Reveal = { system_score?: number | string | null; picked_by?: string | null; bucket_ko?: string | null; why_pick?: string | null };
type Saved = { ok?: boolean; error?: string; at?: string; diff?: number | null; reveal?: Reveal };
type Msg = { t: string; err?: boolean };

const TAGS = ["늦음", "재탕", "다 아는 얘기", "갈등구도", "레이어 다름"];
const ABCD = "ABCD";
const LABS0 = ["안 올림", "약함", "보통", "올릴 만", "바로 올려야"];   // 게이지 눈금 글 = 카드 파일 scale(「1 안 올림 · 2 약함 …」)에서
const EMPTY_DONE = "오늘 카드 다 답했어 — 고칠 건 아래 「답한 카드」에서";
const SRC: Record<string, string> = { dc: "디시", instiz: "인스티즈", fmk: "에펨", theqoo: "더쿠", nate: "네이트", naver: "네이버", community: "커뮤" };
const hm = (iso?: string | null) => { if (!iso) return "—"; const m = String(iso).match(/(\d{2})-(\d{2})T(\d{2}):(\d{2})/); return m ? `${+m[1]}/${+m[2]} ${m[3]}:${m[4]}` : String(iso); };
// 시각을 말로(#1020 「분으로 나오면 헷갈리기도」) — 1시간 안 = N분 전 · 6시간 안 = N시간 전 · 오늘·어제 = 오전/오후 h시 · 그 전 = M/D 오전/오후 h시
const ampm = (d: Date) => (d.getUTCHours() < 12 ? "오전 " : "오후 ") + ((d.getUTCHours() % 12) || 12) + "시";
const rel = (iso?: string | null) => {
  const t = Date.parse(iso || ""); if (!Number.isFinite(t)) return "—";
  const min = Math.round((Date.now() - t) / 60000);
  if (min >= 0 && min < 60) return Math.max(1, min) + "분 전";
  if (min >= 60 && min < 360) return Math.round(min / 60) + "시간 전";
  const k = new Date(t + 9 * 3600e3), today = new Date(Date.now() + 9 * 3600e3);
  const day = (d: Date) => d.toISOString().slice(0, 10), yest = new Date(today.getTime() - 86400e3);
  if (day(k) === day(today)) return "오늘 " + ampm(k);
  if (day(k) === day(yest)) return "어제 " + ampm(k);
  return (k.getUTCMonth() + 1) + "/" + k.getUTCDate() + " " + ampm(k);
};
const gap = (m: number) => (m < 60 ? m + "분" : (m < 600 ? Math.round(m / 30) / 2 : Math.round(m / 60)) + "시간");   // 틈 보냄 = 최초 몇 시간 뒤(30분 단위)

const fbQuery = queryOptions({
  queryKey: ["nomute", "feedback-cards"], staleTime: 0, gcTime: 0,   // 열 때마다 새로(원본 = 화면 열 때 한 번 load)
  queryFn: async () => {
    const r = await fetch("/api/labels", { cache: "no-store", credentials: "same-origin" });
    if (r.status === 404) throw new Error("아직 카드 파일이 없어 — 봇이 후보를 쓰고 러너가 밤에 모으면 생겨");
    if (!r.ok) throw new Error(`카드를 못 불러옴(${r.status}) — 잠시 뒤 다시`);
    return (await r.json()) as Doc;
  },
});

async function post(body: Record<string, unknown>): Promise<Saved> {   // 원본 post 그대로(몸 = JSON · 실패 = 서버 error 글)
  const r = await fetch("/api/labels", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = (await r.json().catch(() => ({}))) as Saved;
  if (!r.ok || !j.ok) throw new Error(j.error || `저장 못 함(${r.status})`);
  return j;
}

export function FeedbackModal() {
  const q = useQuery(fbQuery);
  const d = q.data;
  return (
    <Pane title="피드백">
      <div className="yeta-set mt-2 nm-ep nm-fb">
        {d ? <p className="ep-at num" aria-live="polite">기준 {hm(d.at)}</p> : null}
        {q.isPending ? <p className="fb-empty">불러오는 중</p> : q.isError ? <p className="fb-err">{String((q.error as Error)?.message || q.error)}</p> : <Board key={q.dataUpdatedAt} d={d!} />}
      </div>
    </Pane>
  );
}

function Board({ d }: { d: Doc }) {
  const cards = Array.isArray(d.cards) ? d.cards : [];
  const byId = new Map(cards.map((c) => [c.cid, c]));
  const labs = LABS0.slice();
  if (d.scale) String(d.scale).split("·").forEach((p) => { const m = p.trim().match(/^([1-5])\s+(.+)$/); if (m) labs[Number(m[1]) - 1] = m[2]; });   // 기준 글 = 게이지 눈금 글
  const [open, setOpen] = useState(() => d.open ?? cards.filter((c) => !c.answered).length);
  const [seq, setSeq] = useState(() => ({ list: cards.filter((c) => !c.answered).map((c) => c.cid), done: cards.filter((c) => c.answered).map((c) => c.cid) }));
  const seqRef = useRef(seq); seqRef.current = seq;
  const [undo, setUndo] = useState<{ cid: string; next: string | null; text: string } | null>(null);
  const [doneOn, setDoneOn] = useState(false);
  // 고르면 사라짐(형 10-26 17:29 「이거 고르면 자동으로 사라지게 해줘 다음거 올라오던지」) — 위 무리에서 저장된 카드만 「답한 카드」 맨 위로 · 답한 무리 안에서 다시 고름 = 그 자리 그대로(덮어씀)
  const leave = (c: Card, label: string) => {
    const s = seqRef.current, i = s.list.indexOf(c.cid);
    if (i < 0) return;
    const next = { list: s.list.filter((x) => x !== c.cid), done: [c.cid, ...s.done] };
    seqRef.current = next; setSeq(next);
    setUndo({ cid: c.cid, next: s.list[i + 1] ?? null, text: "저장됨 — " + label + " · " + (c.title || "") });
  };
  const back = () => {   // 되돌리기 = 마지막 한 장만 원래 자리로(그 다음 카드가 아직 위에 있으면 그 앞 · 아니면 끝)
    if (!undo) return;
    const s = seqRef.current, list = s.list.slice(), j = undo.next ? list.indexOf(undo.next) : -1;
    if (j >= 0) list.splice(j, 0, undo.cid); else list.push(undo.cid);
    const next = { list, done: s.done.filter((x) => x !== undo.cid) };
    seqRef.current = next; setSeq(next); setUndo(null);
  };
  const card = (cid: string, hide: boolean) => { const c = byId.get(cid); return c ? <FbCard key={cid} c={c} labs={labs} hidden={hide} onFirst={() => setOpen((v) => Math.max(0, v - 1))} onLeave={(l) => leave(c, l)} /> : null; };
  return (
    <>
      <div className="fb-sum"><span className="fb-big num">{open}</span><small className="num">장 남음 · 오늘 {cards.length}장{d.skipped ? `(넘친 ${d.skipped}장 건너뜀)` : ""} · 마감 {rel(d.deadline).replace(/^오늘 /, "")}(그때 감에게 감)</small></div>
      {d.scale ? <p className="fb-scale num">{d.scale}</p> : null}
      {undo ? <div className="fb-undo"><span>{undo.text}</span><button type="button" className="fb-chip" onClick={back}>되돌리기</button></div> : null}
      {!cards.length ? <p className="fb-empty">답할 카드 없음 — 감·촉이 후보를 쓰거나 틈이 보내면 여기 올라와</p> : (
        <div className="fb-stack" aria-live="polite">   {/* 한 배열 한 부모 = 무리를 옮겨도 카드가 새로 안 그려짐(게이지·가렸던 칸·쓰던 이유 그대로 · 원본은 DOM 을 옮김) — 배열 둘로 나누면 옮길 때 새로 그려짐 */}
          {[
            ...seq.list.map((cid) => card(cid, false)),
            !seq.list.length && seq.done.length ? <p key="empty" className="fb-empty">{EMPTY_DONE}</p> : null,
            seq.done.length ? <button key="doneB" type="button" className="fb-chip fb-done num" aria-expanded={doneOn} onClick={() => setDoneOn((v) => !v)}>{(doneOn ? "답한 카드 접기 · " : "답한 카드 보기 · ") + seq.done.length}장</button> : null,
            ...seq.done.map((cid) => card(cid, !doneOn)),
          ]}
        </div>
      )}
    </>
  );
}

/** 카드 한 장 — 의도 한 줄 → 제목·칸 → 목적 → 물음·보기 넷(봇이 실었을 때) → 게이지 1~5 + 패스 → 알림 줄 · 처음 저장 뒤 = 가렸던 칸 + 덧붙이기 */
function FbCard({ c, labs, hidden, onFirst, onLeave }: { c: Card; labs: string[]; hidden: boolean; onFirst: () => void; onLeave: (label: string) => void }) {
  const mine = c.mine || {};
  const said = (s: string) => [mine.pass ? "패스" : mine.score5 ? mine.score5 + "점" : "", mine.option != null ? "보기 " + ABCD[mine.option] : ""].filter(Boolean).join(" · ") || s;
  const [msg, setMsg] = useState<Msg>(() => ({ t: c.answered ? "답함 — " + said("") + (mine.at ? " · " + hm(mine.at) : "") + " · 다시 끌면 덮어씀" : "끌어서 고르고 손을 떼면 바로 저장" }));
  const [done, setDone] = useState(!!c.answered), [ask, setAsk] = useState(!!c.ask && !c.answered);
  const [rev, setRev] = useState<{ r: Reveal; diff: number | null | undefined } | null>(null), [addon, setAddon] = useState(false);
  const [opt, setOpt] = useState<number | null>(mine.option ?? null);
  const [val, setVal] = useState(mine.score5 || 3), [unset, setUnset] = useState(!mine.score5);
  const first = useRef(!c.answered), busy = useRef(false), queued = useRef<[Record<string, unknown>, string] | null>(null);
  const last = useRef<number | null>(mine.score5 || null), unsetRef = useRef(!mine.score5), rng = useRef<HTMLInputElement>(null);
  const save = async (body: Record<string, unknown>, label: string) => {
    if (busy.current) { queued.current = [body, label]; return; }   // 끄는 중 저장이 겹치면 마지막 것만 이어서
    busy.current = true;
    setMsg({ t: "저장 중… " + label });
    try {
      const j = await post({ cid: c.cid, ...body });
      setMsg({ t: (first.current ? "저장됨 — " : "덮어씀 — ") + label + (j.at ? " · " + hm(j.at) : "") });
      if (first.current) {   // 처음 저장 = 의도 줄 지움 · 가렸던 칸 · 덧붙이기 · 남은 장 -1
        first.current = false; setDone(true); setAsk(false);
        setRev({ r: j.reveal || {}, diff: j.diff }); setAddon(true); onFirst();
      }
      onLeave(label);   // 저장이 된 뒤에만 비킨다(실패 = 그 자리에 까닭)
    } catch (e) {
      setMsg({ t: String((e as Error)?.message || e) + " — 다시 놓아줘", err: true });
    } finally {
      busy.current = false;
      if (queued.current) { const qd = queued.current; queued.current = null; void save(qd[0], qd[1]); }
    }
  };
  const arm = () => { unsetRef.current = false; setUnset(false); };
  const commit = () => {   // 손을 뗌(pointerup) · 값 바뀜(change) · 화살표 키 놓음 — 같은 값이면 한 번만
    if (unsetRef.current || !rng.current) return;
    const v = Number(rng.current.value);
    if (v === last.current) return;
    last.current = v;
    void save({ score5: v, pass: false, via: "gauge" }, v + "점");
  };
  const commitRef = useRef(commit); commitRef.current = commit;
  useEffect(() => {   // 네이티브 change(놓을 때 한 번) — React onChange 는 input 이라 따로 붙임
    const el = rng.current; if (!el) return;
    const on = () => commitRef.current();
    el.addEventListener("change", on);
    return () => el.removeEventListener("change", on);
  }, []);
  const pass = () => { unsetRef.current = true; setUnset(true); last.current = null; void save({ pass: true, score5: null, via: "tap" }, "패스"); };
  const quiz = !!c.q && Array.isArray(c.options) && c.options.length === 4;
  const metas: [string, string][] = [["커뮤 최초", rel(c.first_comm_at) + (c.first_comm_src ? " · " + (SRC[c.first_comm_src] || c.first_comm_src) : "")], ["첫 보도", rel(c.first_seen_at) + (c.first_seen_src ? " · " + (SRC[c.first_seen_src] || c.first_seen_src) : "")]];
  if (c.spread != null) metas.push(["커뮤 퍼짐", c.spread + "곳"]);
  if (c.x_first_seen) metas.push(["X 최초", rel(c.x_first_seen)]);
  if (c.posts_1h != null) metas.push(["X 1시간", c.posts_1h + "글"]);
  if (c.sent_gap_min != null) metas.push(["틈 보냄", "최초 " + gap(Number(c.sent_gap_min)) + " 뒤"]);
  if (c.check_by) metas.push(["확인 시한", rel(c.check_by)]);   // 촉(#1020 21:2x)
  return (
    <article className={"fb-card" + (done ? " done" : "")} hidden={hidden || undefined}>
      {ask ? <p className="fb-ask">{c.ask}</p> : null}
      {c.link ? <a className="fb-ttl" href={c.link} target="_blank" rel="noopener">{c.title}</a> : <span className="fb-ttl">{c.title}</span>}
      <div className="fb-meta num">{metas.map(([k, v]) => <span key={k}><b>{k}</b>{v}</span>)}</div>
      {c.aim ? <p className="fb-aim">목적 · {c.aim}</p> : null}
      {quiz ? (
        <div>
          <p className="fb-q">{c.q}</p>
          <div className="fb-opts" role="group" aria-label="보기 넷 — 누르면 저장">
            {c.options!.map((o, i) => (
              <button key={i} type="button" className={"fb-opt" + (opt === i ? " on" : "")} aria-pressed={opt === i} onClick={() => { setOpt(i); void save({ option: i, via: "option" }, "보기 " + ABCD[i]); }}><b className="num">{ABCD[i]}</b><span>{o}</span></button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="fb-gw">
        <div className="fb-gauge">
          <input ref={rng} className={"fb-rng" + (unset ? " unset" : "")} type="range" min={1} max={5} step={1} value={val} aria-label="점수 1~5 — 끌고 손을 떼면 저장" aria-valuetext={val + "점 " + (labs[val - 1] || "")}
            style={{ "--fb-p": ((val - 1) / 4) * 100 + "%" } as CSSProperties}
            onPointerDown={arm} onChange={(e) => { arm(); setVal(Number(e.target.value)); }} onPointerUp={commit}
            onKeyUp={(e) => { if (/^(Arrow|Home|End|Page)/.test(e.key)) { arm(); commit(); } }} />
          <div className="fb-ticks num" aria-hidden>{[1, 2, 3, 4, 5].map((n) => <span key={n} className={!unset && n === val ? "on" : undefined} style={{ "--i": n - 1 } as CSSProperties}>{n}<small>{labs[n - 1] || ""}</small></span>)}</div>
        </div>
        <button type="button" className="fb-g p" onClick={pass}>패스</button>
      </div>
      <p className={"fb-msg fb-note" + (msg.err ? " err" : "")} aria-live="polite">{msg.t}</p>
      {rev ? (
        <div className="fb-rev num">
          <span><b>시스템 점수</b>{String(rev.r.system_score ?? "—")}</span><span><b>고른 봇</b>{rev.r.picked_by || "—"}</span><span><b>통</b>{rev.r.bucket_ko || "—"}</span>
          {rev.r.why_pick ? <span><b>까닭</b>{rev.r.why_pick}</span> : null}
          {rev.diff != null ? <span><b>형 − 시스템</b><span className="d">{rev.diff > 0 ? "+" : ""}{rev.diff}</span></span> : null}
        </div>
      ) : null}
      {addon ? <Addon cid={c.cid} /> : null}
    </article>
  );
}

/** 덧붙이기(감 기획 「점수를 누른 뒤에만 태그·한 줄 이유가 열림(선택)」) = 같은 카드에 한 줄 더(addon true) · 처음 안 시각(#1431 · 비우면 저장 시각 자동 · 접어 둠) */
function Addon({ cid }: { cid: string }) {
  const [tags, setTags] = useState<string[]>([]), [why, setWhy] = useState(""), [known, setKnown] = useState(""), [m, setM] = useState<Msg>({ t: "" }), [ok, setOk] = useState(false);
  if (ok) return <div className="fb-form"><p className="fb-msg">덧붙임 저장함</p></div>;
  const go = async () => {
    const w = why.trim(), k = known.slice(0, 5);
    if (!tags.length && !w && !k) { const t = "태그·이유·처음 안 시각 중 하나는 넣어줘"; setM({ t, err: true }); throw new Error(t); }
    setM({ t: "" });
    try { await post({ cid, addon: true, tags, why: w, known_at: k }); }
    catch (e) { setM({ t: String((e as Error)?.message || e), err: true }); throw e; }
  };
  return (
    <div className="fb-form">
      <div className="fb-row"><label>태그</label>{TAGS.map((t) => <button key={t} type="button" className={"fb-chip" + (tags.includes(t) ? " on" : "")} aria-pressed={tags.includes(t)} onClick={() => setTags((a) => (a.includes(t) ? a.filter((x) => x !== t) : [...a, t]))}>{t}</button>)}</div>
      <div className="fb-row"><label>이유</label><input className="fb-in w" type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} maxLength={200} name="why" placeholder="한 줄(선택)" value={why} onChange={(e) => setWhy(e.target.value)} /></div>
      <details className="fb-more"><summary>처음 안 시각 · 비우면 저장한 시각</summary><div className="fb-row"><label>시각</label><input className="fb-in n num" type="time" name="known" aria-label="처음 안 시각(선택)" value={known} onChange={(e) => setKnown(e.target.value)} /></div></details>
      <div className="fb-act"><span className={"fb-msg" + (m.err ? " err" : "")} aria-live="polite">{m.t}</span><GoButton className="fb-save" go={go} done={() => setOk(true)} busy="저장 중">덧붙이기</GoButton></div>
    </div>
  );
}

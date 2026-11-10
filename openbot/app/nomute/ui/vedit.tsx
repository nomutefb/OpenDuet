// 서랍 「영상 편집」 = 옛 에디터 ＋ 에디터 › 영상 편집 탭(viewer/edit.html)을 앱 안으로 · 판 1(team-4 · 깃 11-10 · 형 14:23 「응 밖에잇는거 다 옮길거야」 · 12:17 「기존 앱 화면으로 가서 받는게 아니라 자체로」)
//   길 = 원본과 같음: 파일 = GET api/upload(쓸 수 있나) → POST {action:create} → PUT ?key&uploadId&n(32MB 조각 · 하나씩 · 조각마다 한 번 더) → POST {action:complete} · 실패 = {action:abort}
//          만들기 = POST /api/edit {r2key, name | url, opts, lbl} → {id, out} · 5초마다 ly_out/<id>/error.log → GET /api/edit?stat=<id>(video.json) · 끝 = ./vedit-logic landed
//          완성작 = GET /api/edit?recent=24 · 받기 = /api/dl?u=&n= · 판 2 = 자를 곳 먼저 보기 · 베스트컷 · 자막 고쳐 다시 입히기(reburn) · 트래킹(아직 → 옛 화면)
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./dl.css";
import "./ys.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pane } from "./pane";
import { r2Upload } from "./r2-upload";
import { SELS, OKEY, PEND, POLL_MS, BUDGET_S, optsPick, buildOpts, hasAction, fileWhy, landed, absUrl, dlHref, FT_POLL_MS, FT_LIMIT_MS, FT_KEY, FT_N, ftOpts, ftDone, scanOpts, withCut, cutsDone, tc, CUT_KIND, subRows, reburnBody, canReburn, type SubRow, type VOpts, type VRes, type Frames, type Cuts } from "./vedit-logic";

type Job = { id: string; lbl: string; t0: number; st: "run" | "done" | "fail"; msg?: string; res?: VRes; kind?: "scan"; src?: Record<string, string>; cuts?: Cuts; off?: number[]; made?: Record<string, unknown>; prev?: string };
type FtJob = { id: string; out: string; lbl: string; t0: number; st: "run" | "done" | "fail"; msg?: string; frames?: { url?: string; t?: number; quote?: string }[] };
const load = <T,>(k: string, d: T): T => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 이 판만 */ } };
const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s.trim());
const durTxt = (s?: number) => (s && s > 0 ? Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0") : "");
async function text(u: string): Promise<string> {
  try { const r = await fetch(u + (u.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store", credentials: "same-origin" }); if (!r.ok || (r.headers.get("content-type") || "").includes("text/html")) return ""; return await r.text(); } catch { return ""; }
}
const post = async (u: string, body: unknown) => { const r = await fetch(u, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const d = await r.json().catch(() => ({})); return { r, d }; };
export function VeditModal() {
  const [file, setFile] = useState<File | null>(null), [url, setUrl] = useState(""), [pct, setPct] = useState(-1);
  const [opts, setOpts] = useState<VOpts>(() => optsPick(load(OKEY, {})));
  const [jobs, setJobs] = useState<Job[]>(() => load<Job[]>(PEND, []).filter((j) => j && j.id).slice(0, 20));
  const [recent, setRecent] = useState<string[]>([]), [open, setOpen] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const [peek, setPeek] = useState<Record<string, VRes | null>>({});
  const [ft, setFt] = useState<FtJob[]>(() => load<FtJob[]>(FT_KEY, []).filter((j) => j && j.id).slice(0, 10)), [ftN, setFtN] = useState(2);
  const alive = useRef(true), polling = useRef<Set<string>>(new Set());
  const upd = useCallback((id: string, fn: (j: Job) => Job) => setJobs((a) => { const b = a.map((j) => (j.id === id ? fn(j) : j)); save(PEND, b); return b; }), []);
  const loadRecent = useCallback(async () => {
    const t = await text("/api/edit?recent=24"); let ids: string[] = [];
    try { ids = (JSON.parse(t)?.items || []).filter((x: { k?: string }) => x?.k === "video").map((x: { id: string }) => String(x.id)); } catch { /* 없음 */ }
    if (alive.current) setRecent(ids);
  }, []);
  const stat = async (id: string): Promise<VRes | null> => { const t = await text("/api/edit?stat=" + encodeURIComponent(id)); try { return t ? (JSON.parse(t) as VRes) : null; } catch { return null; } };
  const poll = useCallback(async (j0: Job) => {   // 원본 pollEdit 박자(5초 · 하드 = BUDGET 두 배)
    if (polling.current.has(j0.id)) return;
    polling.current.add(j0.id);
    try {
      while (alive.current) {
        const el = await text("/ly_out/" + encodeURIComponent(j0.id) + "/error.log");
        if (el.trim()) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: el.trim().slice(-300) })); return; }
        const d = await stat(j0.id);
        if (landed(d, j0.t0) && !(j0.prev && d!.url === j0.prev)) {   // 다시 입히기 = 옛 판 url 은 끝으로 안 셈(edit.html lyPollVideo prevUrl)
          upd(j0.id, (j) => (d!.url ? { ...j, st: "done", res: d!, msg: "" } : { ...j, st: "fail", msg: String(d!.error || d!.skip || "실패").slice(0, 300) })); if (d!.url) { setOpen(j0.id); void loadRecent(); } return; }
        if (Date.now() - j0.t0 > BUDGET_S * 2000) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: "90분 넘게 결과가 없어 추적을 멈췄어 — 오면 완성작에 올라와" })); return; }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    } finally { polling.current.delete(j0.id); }
  }, [upd, loadRecent]);
  const pollScan = useCallback(async (j0: Job) => {   // 자를 곳 먼저 보기 = cuts.json(?stat=&k=cuts → 없으면 정적) · 5초
    if (polling.current.has("cut:" + j0.id)) return;
    polling.current.add("cut:" + j0.id);
    try {
      while (alive.current) {
        const el = await text("/ly_out/" + encodeURIComponent(j0.id) + "/error.log");
        if (el.trim()) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: el.trim().slice(-300) })); return; }
        let d: Cuts = null;
        for (const u of ["/api/edit?stat=" + encodeURIComponent(j0.id) + "&k=cuts", "/ly_out/" + encodeURIComponent(j0.id) + "/cuts.json"]) { try { d = JSON.parse((await text(u)) || "null"); } catch { d = null; } if (cutsDone(d)) break; }
        if (cutsDone(d)) { upd(j0.id, (j) => ({ ...j, st: "done", cuts: d, off: [] })); setOpen(j0.id); return; }
        if (Date.now() - j0.t0 > BUDGET_S * 2000) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: "90분 넘게 스캔 결과가 없어 추적을 멈췄어" })); return; }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    } finally { polling.current.delete("cut:" + j0.id); }
  }, [upd]);
  useEffect(() => { alive.current = true; void loadRecent(); for (const j of load<Job[]>(PEND, [])) if (j?.st === "run" && Date.now() - j.t0 < 120 * 60e3) void (j.kind === "scan" ? pollScan(j) : poll(j)); return () => { alive.current = false; }; }, [loadRecent, poll, pollScan]);

  const ftUpd = useCallback((id: string, fn: (j: FtJob) => FtJob) => setFt((a) => { const b = a.map((j) => (j.id === id ? fn(j) : j)); save(FT_KEY, b); return b; }), []);
  const ftPoll = useCallback(async (j0: FtJob) => {   // 원본 7초 · 최대 65분
    if (polling.current.has("ft:" + j0.id)) return;
    polling.current.add("ft:" + j0.id);
    try {
      while (alive.current) {
        let d: Frames = null; try { d = JSON.parse((await text(absUrl(j0.out))) || "null"); } catch { d = null; }
        if (ftDone(d)) { ftUpd(j0.id, (j) => (d!.state === "done" ? { ...j, st: "done", frames: (d!.frames || []).filter((f) => f?.url) } : { ...j, st: "fail", msg: String(d!.error || "실패").slice(0, 300) })); return; }
        if (Date.now() - j0.t0 > FT_LIMIT_MS) { ftUpd(j0.id, (j) => ({ ...j, st: "fail", msg: "65분 넘게 결과가 없어 추적을 멈췄어" })); return; }
        await new Promise((r) => setTimeout(r, FT_POLL_MS));
      }
    } finally { polling.current.delete("ft:" + j0.id); }
  }, [ftUpd]);
  useEffect(() => { for (const j of load<FtJob[]>(FT_KEY, [])) if (j?.st === "run" && Date.now() - j.t0 < FT_LIMIT_MS) void ftPoll(j); }, [ftPoll]);
  const startScan = async () => {   // 자를 곳 먼저 보기(스캔만 · 고른 뒤 만들기)
    if (busy) return;
    if (!file && !isUrl(url)) { setErr("영상 파일을 고르거나 영상 주소를 넣어 줘"); return; }
    setBusy(true); setErr("");
    try {
      const src: Record<string, string> = file ? { r2key: await r2Upload(file, setPct), name: file.name } : { url: url.trim() };
      const lbl = "자를 곳 · " + (file ? file.name : url.trim().replace(/^https?:\/\/(www\.)?/, "")).slice(0, 70);
      const { r, d } = await post("/api/edit", { ...src, opts: scanOpts(opts), lbl });
      if (!r.ok || !d?.ok || !d.id) { setErr(String(d?.error || "스캔 요청 실패 · HTTP " + r.status)); return; }
      const j: Job = { id: String(d.id), lbl, t0: Date.now(), st: "run", kind: "scan", src };
      setJobs((a) => { const b = [j, ...a.filter((x) => x.id !== j.id)].slice(0, 20); save(PEND, b); return b; });
      setFile(null); setUrl(""); setOpen(j.id);
      void pollScan(j);
    } catch (e) { setErr(String((e as Error)?.message || e).slice(0, 200)); }
    finally { setBusy(false); setPct(-1); }
  };
  const makeFromScan = async (sj: Job) => {   // 고른 자를 곳으로 만들기 = 같은 원본(r2key 24시간 · 주소) + cutref · cutoff
    if (busy || !sj.src) return;
    setBusy(true); setErr("");
    try {
      const lbl = sj.lbl.replace(/^자를 곳 · /, "");
      const o = withCut(buildOpts(opts), sj.id, sj.off || []);
      const { r, d } = await post("/api/edit", { ...sj.src, opts: o, lbl });
      if (!r.ok || !d?.ok || !d.id) { setErr(String(d?.error || "만들기 요청 실패 · HTTP " + r.status)); return; }
      const j: Job = { id: String(d.id), lbl, t0: Date.now(), st: "run", made: o };
      setJobs((a) => { const b = [j, ...a.filter((x) => x.id !== j.id)].slice(0, 20); save(PEND, b); return b; });
      setOpen(j.id); void poll(j);
    } catch (e) { setErr(String((e as Error)?.message || e).slice(0, 200)); }
    finally { setBusy(false); }
  };
  const makeFt = async () => {   // 베스트컷 = 같은 영상(파일 · 주소)에서 장면 그림 뽑기(api/framethumb)
    if (busy) return;
    if (!file && !isUrl(url)) { setErr("영상 파일을 고르거나 영상 주소를 넣어 줘"); return; }
    setBusy(true); setErr("");
    try {
      const src = file ? { r2key: await r2Upload(file, setPct), name: file.name } : { url: url.trim() };
      const lbl = (file ? file.name : url.trim().replace(/^https?:\/\/(www\.)?/, "")).slice(0, 80);
      const { r, d } = await post("/api/framethumb", { ...src, opts: ftOpts(ftN, "4:5") });
      if (!r.ok || !d?.ok || !d.id) { setErr(String(d?.error || "베스트컷 요청 실패 · HTTP " + r.status)); return; }
      const j: FtJob = { id: String(d.id), out: String(d.out || "ft_out/" + d.id + "/frames.json"), lbl, t0: Date.now(), st: "run" };
      setFt((a) => { const b = [j, ...a.filter((x) => x.id !== j.id)].slice(0, 10); save(FT_KEY, b); return b; });
      setFile(null); setUrl("");
      void ftPoll(j);
    } catch (e) { setErr(String((e as Error)?.message || e).slice(0, 200)); }
    finally { setBusy(false); setPct(-1); }
  };
  const setOpt = (k: string, v: string) => setOpts((o) => { const n = optsPick({ ...o, [k]: v }); save(OKEY, n); return n; });
  const pick = (f: File | null) => { setErr(""); if (!f) { setFile(null); return; } const why = fileWhy(f.name, f.size); if (why) { setErr(why); setFile(null); return; } setFile(f); setUrl(""); };
  const make = async () => {
    if (busy) return;
    const o = buildOpts(opts);
    if (!hasAction(o)) { setErr("할 일을 하나는 골라 줘(자막 · 자르기 · 비율 · 해상도 · 배경음 · 소리 고르기)"); return; }
    if (!file && !isUrl(url)) { setErr("영상 파일을 고르거나 영상 주소를 넣어 줘"); return; }
    setBusy(true); setErr("");
    try {
      const src = file ? { r2key: await r2Upload(file, setPct), name: file.name } : { url: url.trim() };
      const lbl = (file ? file.name : url.trim().replace(/^https?:\/\/(www\.)?/, "")).slice(0, 80);
      const { r, d } = await post("/api/edit", { ...src, opts: o, lbl });
      if (!r.ok || !d?.ok || !d.id) { setErr(String(d?.error || "만들기 요청 실패 · HTTP " + r.status)); return; }
      const j: Job = { id: String(d.id), lbl, t0: Date.now(), st: "run", made: o };
      setJobs((a) => { const b = [j, ...a.filter((x) => x.id !== j.id)].slice(0, 20); save(PEND, b); return b; });
      setFile(null); setUrl(""); setOpen(j.id);
      void poll(j);
    } catch (e) { setErr(String((e as Error)?.message || e).slice(0, 200)); }
    finally { setBusy(false); setPct(-1); }
  };
  const openRecent = async (id: string) => { if (open === id) { setOpen(""); return; } setOpen(id); if (!(id in peek)) { const d = await stat(id); setPeek((m) => ({ ...m, [id]: d })); } };
  const reburned = (id: string, lbl: string, prev: string, made?: Record<string, unknown>) => {   // 다시 입히기 보냄 = 같은 id 를 「만드는 중」으로 · 옛 url 이 바뀌면 끝
    const j: Job = { id, lbl: lbl.startsWith("다시 입히기 · ") ? lbl : "다시 입히기 · " + lbl, t0: Date.now(), st: "run", made, prev };
    setJobs((a) => { const b = [j, ...a.filter((x) => x.id !== id)].slice(0, 20); save(PEND, b); return b; });
    setOpen(id); void poll(j);
  };
  const mine = new Set(jobs.map((j) => j.id)), others = recent.filter((id) => !mine.has(id));

  return (
    <Pane title="영상 편집">
      <div className="yeta-set mt-2 nm-dl nm-ys">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">영상</span>
          <label className="go nm-ved-file">{file ? file.name : "영상 파일 고르기"}<input type="file" accept="video/*,.mkv,.avi" hidden onChange={(e) => pick(e.target.files?.[0] || null)} /></label>
          <div className="nm-dl-url">
            <input type="url" value={url} placeholder="또는 영상 주소" aria-label="영상 주소" autoComplete="off" spellCheck={false} disabled={!!file} onChange={(e) => { setUrl(e.target.value); setErr(""); }} />
            <button type="button" className={`nm-dl-send${(file || isUrl(url)) && !busy ? " on" : ""}`} disabled={busy || (!file && !isUrl(url))} onClick={() => void make()} aria-label="만들기">{busy ? (pct >= 0 ? pct + "%" : "…") : "만들기"}</button>
          </div>
          <div className="nm-ys-opts">
            {SELS.filter((s) => !s.when || s.when(opts)).map((s) => (
              <label key={s.k} className="nm-ys-opt"><span>{s.lab}</span>
                <select className="nm-dl-q" value={opts[s.k]} aria-label={s.lab} onChange={(e) => setOpt(s.k, e.target.value)}>{s.vals.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </label>
            ))}
          </div>
          <div className="nm-ys-links nm-ved-ft">
            <select className="nm-dl-q" value={ftN} aria-label="베스트컷 장 수" onChange={(e) => setFtN(+e.target.value)}>{FT_N.map((n) => <option key={n} value={n}>{n}장</option>)}</select>
            <button type="button" className="go gray" disabled={busy || (!file && !isUrl(url))} onClick={() => void startScan()}>자를 곳 먼저 보기</button>
            <button type="button" className="go gray" disabled={busy || (!file && !isUrl(url))} onClick={() => void makeFt()}>베스트컷 뽑기(4:5)</button>
          </div>
          {err ? <p className="nm-chan-msg" role="alert">{err}</p> : null}
        </div>

        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">이 기기에서 만든 것</span>
          <p className="nm-dl-sec">이 기기에서 만든 것 <i>({jobs.length})</i></p>
          {!jobs.length ? <p className="nm-chan-msg">아직 만든 게 없습니다</p> : null}
          {jobs.map((j) => (
            <div key={j.id} className={`nm-dl-job${j.st === "done" ? " done" : ""}${j.st === "fail" ? " err" : ""}`}>
              <div className="hd">
                <button type="button" className="lab nm-ys-lab" onClick={() => setOpen(open === j.id ? "" : j.id)} aria-expanded={open === j.id}>{j.lbl || j.id}</button>
                <span className="st">{j.st === "fail" ? "⚠ 실패" : j.kind === "scan" && j.st === "done" ? "✓ 자를 곳 " + (j.cuts?.rm || []).length + "곳 · 골라서 만들기" : j.st === "done" ? "✓ 완료" + (j.res?.dur ? " · " + durTxt(j.res.dur) : "") : (j.kind === "scan" ? "자를 곳 찾는 중… · " : "만드는 중… · ") + Math.max(1, Math.round((Date.now() - j.t0) / 60e3)) + "분"}</span>
              </div>
              {j.st === "fail" ? <p className="nm-dl-why">{j.msg || "실패"}</p> : null}
              {j.kind === "scan" && j.st === "done" && j.cuts && open === j.id ? (
                <div className="nm-ved-cuts">
                  <p className="nm-dl-why">{"자를 곳 " + (j.cuts.rm || []).length + "곳 · 지금 고른 대로 자르면 " + durTxt(Math.max(0, (j.cuts.dur || 0) - (j.cuts.rm || []).reduce((a, c, i) => a + ((j.off || []).includes(i) ? 0 : Math.max(0, c.e - c.s)), 0))) + " / 원본 " + durTxt(j.cuts.dur) + (j.cuts.note ? " · " + j.cuts.note : "")}</p>
                  <ol className="nm-ys-steps">{(j.cuts.rm || []).map((c, i) => { const keep = (j.off || []).includes(i); return (
                    <li key={i} className={keep ? "s-skip" : "s-run"}><label><input type="checkbox" checked={!keep} onChange={() => upd(j.id, (x) => ({ ...x, off: keep ? (x.off || []).filter((k) => k !== i) : [...(x.off || []), i] }))} /> {tc(c.s) + "~" + tc(c.e) + " · " + (CUT_KIND[c.k || ""] || c.k || "") + (c.t ? " · " + String(c.t).slice(0, 40) : "")}</label></li>
                  ); })}</ol>
                  <button type="button" className="go" disabled={busy} onClick={() => void makeFromScan(j)}>{"이대로 만들기(" + ((j.cuts.rm || []).length - (j.off || []).length) + "곳 자름)"}</button>
                </div>
              ) : null}
              {j.st === "done" && j.res?.url && open === j.id ? <><Player r={j.res} name={j.lbl} />{canReburn(j.res.src) ? <SubsEdit id={j.id} onSent={(b) => reburned(j.id, j.lbl, j.res!.url!, b)} made={j.made} /> : null}</> : null}
              {j.st !== "run" ? <button type="button" className="go gray" onClick={() => setJobs((a) => { const b = a.filter((x) => x.id !== j.id); save(PEND, b); return b; })}>목록에서 지움</button> : null}
            </div>
          ))}
        </div>

        {ft.length ? (
          <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
            <span className="ycd-nm yset-ttl">베스트컷</span>
            <p className="nm-dl-sec">베스트컷 <i>({ft.length})</i></p>
            {ft.map((j) => (
              <div key={j.id} className={`nm-dl-job${j.st === "done" ? " done" : ""}${j.st === "fail" ? " err" : ""}`}>
                <div className="hd"><span className="lab">{j.lbl || j.id}</span><span className="st">{j.st === "fail" ? "⚠ 실패" : j.st === "done" ? "✓ " + (j.frames?.length || 0) + "장" : "뽑는 중… · " + Math.max(1, Math.round((Date.now() - j.t0) / 60e3)) + "분"}</span></div>
                {j.st === "fail" ? <p className="nm-dl-why">{j.msg || "실패"}</p> : null}
                {j.st === "done" && j.frames?.length ? (
                  <div className="nm-dl-grid g3">{j.frames.map((f, k) => (
                    <div key={k} className="nm-dl-card"><img src={absUrl(f.url!)} alt={f.quote || ""} loading="lazy" /><span className="pl">{f.t != null ? Math.round(f.t) + "초" : ""}{f.quote ? " · " + String(f.quote).slice(0, 30) : ""}</span>
                      <a className="nm-dl-btn sm" href={dlHref(f.url!, (j.lbl || "cut").replace(/\.[a-z0-9]+$/i, "") + "-" + (k + 1) + ".jpg")} aria-label={(k + 1) + "번 받기"}>↓</a></div>
                  ))}</div>
                ) : null}
                {j.st !== "run" ? <button type="button" className="go gray" onClick={() => setFt((a) => { const b = a.filter((x) => x.id !== j.id); save(FT_KEY, b); return b; })}>목록에서 지움</button> : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">완성작</span>
          <p className="nm-dl-sec">완성작 <i>({others.length})</i></p>
          {!others.length ? <p className="nm-chan-msg">다른 데서 만든 완성작이 아직 없습니다</p> : null}
          <div className="nm-q-list" role="list">
            {others.map((id) => (
              <div key={id} role="listitem" className="nm-q-row nm-memo-row nm-ys-hist">
                <button type="button" className="qm" onClick={() => void openRecent(id)} aria-expanded={open === id}><i>{id}</i><small>{peek[id]?.dur ? durTxt(peek[id]!.dur) : ""}</small></button>
                {open === id ? (peek[id]?.url ? <><Player r={peek[id]!} name={id} />{canReburn(peek[id]!.src) ? <SubsEdit id={id} onSent={() => reburned(id, id, peek[id]!.url!)} /> : null}</> : <p className="nm-chan-msg">{id in peek ? "결과를 못 읽었어" : "읽는 중…"}</p>) : null}
              </div>
            ))}
          </div>
          <p className="nm-dl-why">트래킹 = 다음 판(그때까지는 옛 에디터)</p>
        </div>
      </div>
    </Pane>
  );
}

function Player({ r, name }: { r: VRes; name: string }) {
  if (!r.url) return null;
  const v = absUrl(r.url);
  return (
    <div className="nm-ys-play wide">
      <video src={v} poster={r.poster ? absUrl(r.poster) : undefined} controls playsInline preload="metadata" />
      {r.note ? <p className="nm-dl-why">{String(r.note).slice(0, 200)}</p> : null}
      <div className="nm-ys-links"><a className="go" href={dlHref(r.url, (name || "edit").replace(/\.[a-z0-9]+$/i, "") + "-편집.mp4")}>영상 받기</a></div>
    </div>
  );
}

// 자막 고쳐 다시 입히기(edit.html 3335-3367) = subs.json 줄마다 고침 → POST /api/edit {reburn, opts, segs?} · 고친 게 없으면 지금 자막 그대로 다시 굽기
function SubsEdit({ id, made, onSent }: { id: string; made?: Record<string, unknown>; onSent: (made?: Record<string, unknown>) => void }) {
  const [orig, setOrig] = useState<SubRow[] | null>(null), [rows, setRows] = useState<SubRow[]>([]), [on, setOn] = useState(false), [busy, setBusy] = useState(false), [msg, setMsg] = useState("");
  const getSubs = async (): Promise<SubRow[] | null> => {   // null = 못 읽음(일시 장애) · [] = 없음
    const t = await text("/ly_out/" + encodeURIComponent(id) + "/subs.json");
    if (!t) return [];
    try { return subRows(JSON.parse(t)); } catch { return null; }
  };
  const toggle = async () => {
    if (on) { setOn(false); return; }
    setOn(true); setMsg("");
    if (orig && orig.length) return;
    const r = await getSubs();
    if (r) { setOrig(r); setRows(r); }
    setMsg(!r ? "자막을 못 읽었어 — 잠시 뒤 다시 열어 줘" : !r.length ? "이 작업엔 고칠 자막(subs.json)이 없어" : "");
  };
  const send = async () => {
    if (busy || !orig) return;
    setBusy(true); setMsg("");
    try {
      const rb = reburnBody(id, rows, orig, made);
      if (rb.error) { setMsg(rb.error); return; }
      if (rb.edited) {   // 보내기 직전 서버 판 대조(edit.html lyRebase) — 그 사이 다른 데서 다시 구웠으면 내 낡은 판으로 덮지 않음
        const fresh = await getSubs();
        if (!fresh) { setMsg("지금 서버 자막을 못 읽었어 — 덮을 수 있어서 멈췄어, 잠시 뒤 다시 눌러 줘"); return; }
        if (JSON.stringify(fresh) !== JSON.stringify(orig)) { setOrig(fresh); setRows(fresh); setMsg("그 사이 다른 데서 자막이 바뀌었어 — 최신 판으로 다시 띄웠어, 한 번 더 고쳐 줘"); return; }
      }
      const { r, d } = await post("/api/edit", rb.body);
      if (!r.ok || !d?.ok) { setMsg(String(d?.error || "다시 입히기 실패 · HTTP " + r.status)); return; }
      setOn(false); onSent(made);
    } catch (e) { setMsg(String((e as Error)?.message || e).slice(0, 200)); }
    finally { setBusy(false); }
  };
  const dirty = !!orig && JSON.stringify(rows) !== JSON.stringify(orig);
  return (
    <div className="nm-ved-subs">
      <div className="nm-ys-links"><button type="button" className="go gray" onClick={() => void toggle()} aria-expanded={on}>{on ? "자막 고치기 닫기" : "자막 고쳐 다시 입히기"}</button></div>
      {on && rows.length ? (
        <>
          <p className="nm-dl-why">{"자막 " + rows.length + "줄 · 줄을 비우면 그 줄은 빠져 · 고친 게 없으면 지금 자막 그대로 다시 구워"}</p>
          <ol className="nm-ys-steps">{rows.map((r, i) => (
            <li key={i}><span className="nm-ved-tc">{tc(r.s) + "~" + tc(r.e)}</span>
              <input type="text" className="nm-dl-q" value={r.t} aria-label={(i + 1) + "번 자막"} maxLength={200} onChange={(e) => { const v = e.target.value; setRows((a) => a.map((x, k) => (k === i ? { ...x, t: v } : x))); }} /></li>
          ))}</ol>
          <div className="nm-ys-links">
            <button type="button" className="go" disabled={busy} onClick={() => void send()}>{busy ? "보내는 중…" : dirty ? "고친 자막으로 다시 입히기" : "지금 자막 그대로 다시 입히기"}</button>
            {dirty ? <button type="button" className="go gray" disabled={busy} onClick={() => setRows(orig || [])}>처음대로</button> : null}
          </div>
        </>
      ) : null}
      {msg ? <p className="nm-chan-msg" role="alert">{msg}</p> : null}
    </div>
  );
}

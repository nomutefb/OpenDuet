// 서랍 「영상 편집」 = 옛 에디터 ＋ 에디터 › 영상 편집 탭(viewer/edit.html)을 앱 안으로 · 판 1(team-4 · 깃 11-10 · 형 14:23 「응 밖에잇는거 다 옮길거야」 · 12:17 「기존 앱 화면으로 가서 받는게 아니라 자체로」)
//   길 = 원본과 같음: 파일 = GET api/upload(쓸 수 있나) → POST {action:create} → PUT ?key&uploadId&n(32MB 조각 · 하나씩 · 조각마다 한 번 더) → POST {action:complete} · 실패 = {action:abort}
//          만들기 = POST /api/edit {r2key, name | url, opts, lbl} → {id, out} · 5초마다 ly_out/<id>/error.log → GET /api/edit?stat=<id>(video.json) · 끝 = ./vedit-logic landed
//          완성작 = GET /api/edit?recent=24 · 받기 = /api/dl?u=&n= · 판 2(아직) = 자를 곳 먼저 보기 · 자막 고쳐 다시 입히기 · 트래킹 · 베스트컷 → 그때까지는 옛 화면
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./dl.css";
import "./ys.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pane } from "./pane";
import { SELS, OKEY, PEND, POLL_MS, BUDGET_S, PART, optsPick, buildOpts, hasAction, fileWhy, partsOf, landed, absUrl, dlHref, type VOpts, type VRes } from "./vedit-logic";

type Job = { id: string; lbl: string; t0: number; st: "run" | "done" | "fail"; msg?: string; res?: VRes };
const load = <T,>(k: string, d: T): T => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 이 판만 */ } };
const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s.trim());
const durTxt = (s?: number) => (s && s > 0 ? Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0") : "");
async function text(u: string): Promise<string> {
  try { const r = await fetch(u + (u.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store", credentials: "same-origin" }); if (!r.ok || (r.headers.get("content-type") || "").includes("text/html")) return ""; return await r.text(); } catch { return ""; }
}
function putPart(url: string, blob: Blob, onProg: (n: number) => void): Promise<{ etag?: string }> {   // 원본 upload.js 43-57(XHR = 조각 진행이 보임 · 180초)
  return new Promise((ok, bad) => {
    const x = new XMLHttpRequest();
    x.open("PUT", url); x.timeout = 180e3; x.withCredentials = true;
    x.upload.onprogress = (e) => { if (e.lengthComputable) onProg(e.loaded); };
    x.onload = () => { try { if (x.status >= 200 && x.status < 300) ok(JSON.parse(x.responseText)); else bad(new Error("조각 HTTP " + x.status)); } catch (e) { bad(e); } };
    x.onerror = () => bad(new Error("조각 올리기 끊김")); x.ontimeout = () => bad(new Error("조각 올리기 시간 넘김"));
    x.send(blob);
  });
}
const post = async (u: string, body: unknown) => { const r = await fetch(u, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const d = await r.json().catch(() => ({})); return { r, d }; };

async function upload(f: File, onPct: (p: number) => void): Promise<string> {
  const chk = await fetch("/api/upload", { credentials: "same-origin", cache: "no-store" }).then((r) => r.json()).catch(() => null);
  if (!chk?.ok) throw new Error("올리기 길이 지금 닫혀 있어 — 영상 주소로 넣어 줘");
  const c = await post("/api/upload", { action: "create", name: f.name, size: f.size });
  if (!c.r.ok || !c.d?.key || !c.d?.uploadId) throw new Error(String(c.d?.error || "올리기 시작 실패 · HTTP " + c.r.status));
  const { key, uploadId } = c.d as { key: string; uploadId: string }, part = +c.d.part || PART, n = partsOf(f.size), parts: { n: number; etag: string }[] = [];
  try {
    for (let i = 1; i <= n; i++) {
      const blob = f.slice((i - 1) * part, Math.min(f.size, i * part)), u = "/api/upload?key=" + encodeURIComponent(key) + "&uploadId=" + encodeURIComponent(uploadId) + "&n=" + i;
      let res: { etag?: string } | null = null;
      for (let k = 0; k < 2 && !res; k++) { try { res = await putPart(u, blob, (b) => onPct(Math.round(((i - 1) * part + b) / f.size * 100))); } catch (e) { if (k) throw e; } }   // 조각마다 한 번 더
      if (!res?.etag) throw new Error(i + "번 조각 답에 etag 없음");
      parts.push({ n: i, etag: res.etag });
    }
    const d = await post("/api/upload", { action: "complete", key, uploadId, parts });
    if (!d.r.ok || !d.d?.ok) throw new Error(String(d.d?.error || "올리기 마무리 실패"));
    onPct(100);
    return key;
  } catch (e) { void post("/api/upload", { action: "abort", key, uploadId }).catch(() => {}); throw e; }
}

export function VeditModal() {
  const [file, setFile] = useState<File | null>(null), [url, setUrl] = useState(""), [pct, setPct] = useState(-1);
  const [opts, setOpts] = useState<VOpts>(() => optsPick(load(OKEY, {})));
  const [jobs, setJobs] = useState<Job[]>(() => load<Job[]>(PEND, []).filter((j) => j && j.id).slice(0, 20));
  const [recent, setRecent] = useState<string[]>([]), [open, setOpen] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const [peek, setPeek] = useState<Record<string, VRes | null>>({});
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
        if (landed(d, j0.t0)) { upd(j0.id, (j) => (d!.url ? { ...j, st: "done", res: d!, msg: "" } : { ...j, st: "fail", msg: String(d!.error || d!.skip || "실패").slice(0, 300) })); if (d!.url) { setOpen(j0.id); void loadRecent(); } return; }
        if (Date.now() - j0.t0 > BUDGET_S * 2000) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: "90분 넘게 결과가 없어 추적을 멈췄어 — 오면 완성작에 올라와" })); return; }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    } finally { polling.current.delete(j0.id); }
  }, [upd, loadRecent]);
  useEffect(() => { alive.current = true; void loadRecent(); for (const j of load<Job[]>(PEND, [])) if (j?.st === "run" && Date.now() - j.t0 < 120 * 60e3) void poll(j); return () => { alive.current = false; }; }, [loadRecent, poll]);

  const setOpt = (k: string, v: string) => setOpts((o) => { const n = optsPick({ ...o, [k]: v }); save(OKEY, n); return n; });
  const pick = (f: File | null) => { setErr(""); if (!f) { setFile(null); return; } const why = fileWhy(f.name, f.size); if (why) { setErr(why); setFile(null); return; } setFile(f); setUrl(""); };
  const make = async () => {
    if (busy) return;
    const o = buildOpts(opts);
    if (!hasAction(o)) { setErr("할 일을 하나는 골라 줘(자막 · 자르기 · 비율 · 해상도 · 배경음 · 소리 고르기)"); return; }
    if (!file && !isUrl(url)) { setErr("영상 파일을 고르거나 영상 주소를 넣어 줘"); return; }
    setBusy(true); setErr("");
    try {
      const src = file ? { r2key: await upload(file, setPct), name: file.name } : { url: url.trim() };
      const lbl = (file ? file.name : url.trim().replace(/^https?:\/\/(www\.)?/, "")).slice(0, 80);
      const { r, d } = await post("/api/edit", { ...src, opts: o, lbl });
      if (!r.ok || !d?.ok || !d.id) { setErr(String(d?.error || "만들기 요청 실패 · HTTP " + r.status)); return; }
      const j: Job = { id: String(d.id), lbl, t0: Date.now(), st: "run" };
      setJobs((a) => { const b = [j, ...a.filter((x) => x.id !== j.id)].slice(0, 20); save(PEND, b); return b; });
      setFile(null); setUrl(""); setOpen(j.id);
      void poll(j);
    } catch (e) { setErr(String((e as Error)?.message || e).slice(0, 200)); }
    finally { setBusy(false); setPct(-1); }
  };
  const openRecent = async (id: string) => { if (open === id) { setOpen(""); return; } setOpen(id); if (!(id in peek)) { const d = await stat(id); setPeek((m) => ({ ...m, [id]: d })); } };
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
                <span className="st">{j.st === "fail" ? "⚠ 실패" : j.st === "done" ? "✓ 완료" + (j.res?.dur ? " · " + durTxt(j.res.dur) : "") : "만드는 중… · " + Math.max(1, Math.round((Date.now() - j.t0) / 60e3)) + "분"}</span>
              </div>
              {j.st === "fail" ? <p className="nm-dl-why">{j.msg || "실패"}</p> : null}
              {j.st === "done" && j.res?.url && open === j.id ? <Player r={j.res} name={j.lbl} /> : null}
              {j.st !== "run" ? <button type="button" className="go gray" onClick={() => setJobs((a) => { const b = a.filter((x) => x.id !== j.id); save(PEND, b); return b; })}>목록에서 지움</button> : null}
            </div>
          ))}
        </div>

        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">완성작</span>
          <p className="nm-dl-sec">완성작 <i>({others.length})</i></p>
          {!others.length ? <p className="nm-chan-msg">다른 데서 만든 완성작이 아직 없습니다</p> : null}
          <div className="nm-q-list" role="list">
            {others.map((id) => (
              <div key={id} role="listitem" className="nm-q-row nm-memo-row nm-ys-hist">
                <button type="button" className="qm" onClick={() => void openRecent(id)} aria-expanded={open === id}><i>{id}</i><small>{peek[id]?.dur ? durTxt(peek[id]!.dur) : ""}</small></button>
                {open === id ? (peek[id]?.url ? <Player r={peek[id]!} name={id} /> : <p className="nm-chan-msg">{id in peek ? "결과를 못 읽었어" : "읽는 중…"}</p>) : null}
              </div>
            ))}
          </div>
          <p className="nm-dl-why">자를 곳 먼저 보기 · 자막 고쳐 다시 입히기 · 트래킹 · 베스트컷 = 다음 판(그때까지는 옛 에디터)</p>
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

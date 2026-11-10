// 서랍 「유튜브」 = 옛 에디터 ＋ 에디터 › 유튜브 탭(viewer/ys.html)을 앱 안으로(team-4 · 깃 11-10 · 형 14:23 「응 밖에잇는거 다 옮길거야」 · 12:17 「기존 앱 화면으로 가서 받는게 아니라 자체로」)
//   길 = 원본과 같음: 만들기 POST /api/ys {url, ask, opts} → {id, out} · 진행 = /ys_out/<id>/progress.json(5초) · 결과 = result.json(10초 · 진행이 끝나면 바로)
//          러너가 1분 넘게 안 서면 GET /api/ys?rescue=1(발사 실패 착지분 재발사 · 원본 poll 과 같은 박자) · 완성작 = /ys_out/_hist.json(최신 앞 · 최대 60)
//   옵션 칸 = functions/api/ys.js OPTS 그대로(서버가 한 번 더 거름 · 기본값 = 각 칸 첫 값) · 목소리 고르기 · 자막 위치 · 불투명도 = 서버 기본(AI 자동 · 65% · 100%)
//   이 기기 작업 목록 = nm_ys_jobs(원본 ys_jobs 와 따로 · 옛 화면 목록을 덮지 않음 · 완성작은 서버 _hist 라 어디서 만들었든 다 보임)
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./dl.css";
import "./ys.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pane } from "./pane";

import { YT_RE, OPTS, STEPS, OKEY, POLL_MS, STALL_MS, LIMIT_MS, https, tsMs, vidOf, durTxt, agoTxt, optsLoad, jobsLoad, jobsSave, getJSON, type Prog, type Res, type Job, type Hist } from "./ys-logic";

const failWhy = (p: Prog) => { const s = (p?.steps || []).find((x) => x?.st === "fail"); return String(p?.error || s?.note || "진행 중 실패(사유 미기재)"); };

export function YsModal() {
  const [url, setUrl] = useState(""), [ask, setAsk] = useState("");
  const [opts, setOpts] = useState<Record<string, string>>(optsLoad);
  const [jobs, setJobs] = useState<Job[]>(jobsLoad), [prog, setProg] = useState<Record<string, Prog>>({});
  const [hist, setHist] = useState<Hist[]>([]), [open, setOpen] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const alive = useRef(true), polling = useRef<Set<string>>(new Set());
  const u = url.replace(/[\u0000-\u001F\u007F\s]/g, "").slice(0, 300), ok = YT_RE.test(u);

  const update = useCallback((id: string, fn: (j: Job) => Job) => setJobs((a) => { const b = a.map((j) => (j.id === id ? fn(j) : j)); jobsSave(b); return b; }), []);
  const loadHist = useCallback(async () => {
    const d = await getJSON<{ items?: Record<string, unknown>[] }>("/ys_out/_hist.json");
    const a = Array.isArray(d?.items) ? d!.items : [];
    if (alive.current) setHist(a.filter((it) => it && it.id && https(it.video)).slice(0, 60).map((it) => ({ id: String(it.id), ts: tsMs(it.ts), title: String(it.short_title || it.title || ""), channel: String(it.channel || ""),
      poster: https(it.poster) ? String(it.poster) : "", video: String(it.video), report: https(it.report) ? String(it.report) : "", infographic: https(it.infographic) ? String(it.infographic) : "", dur: +(it.dur as number) || 0, ratio: it.ratio === "16:9" ? "16:9" : "9:16" })));
  }, []);

  const poll = useCallback(async (j0: Job) => {   // 원본 poll() 박자 그대로
    if (polling.current.has(j0.id)) return;
    polling.current.add(j0.id);
    const base = "/ys_out/" + encodeURIComponent(j0.id) + "/";
    let last: Prog = null;
    try {
      for (let n = 0; alive.current; n++) {
        const p = await getJSON<Prog>(base + "progress.json");
        if (p && Array.isArray(p.steps)) { last = p; setProg((m) => ({ ...m, [j0.id]: p })); }
        const pu = last && +(last.updated || 0) ? (+(last.updated || 0) > 1e12 ? +(last.updated || 0) : +(last.updated || 0) * 1000) : 0;
        const late = Date.now() - j0.t0 > LIMIT_MS || Date.now() - Math.max(j0.t0, pu) > STALL_MS;
        if (!last && n > 0 && n % 12 === 0 && Date.now() - j0.t0 > 60e3) void fetch("/api/ys?rescue=1", { cache: "no-store", credentials: "same-origin" }).catch(() => {});
        const ended = !!(p && (p.state === "done" || p.state === "fail"));
        if (n % 2 === 0 || ended || late) {
          const d = await getJSON<Res>(j0.out.startsWith("/") ? j0.out : "/" + j0.out);
          if (d && (d.error || d.video)) {
            update(j0.id, (j) => (d.video ? { ...j, st: "done", res: d, msg: "" } : { ...j, st: "fail", msg: String(d.error).slice(0, 300) }));
            if (d.video) { setOpen(j0.id); void loadHist(); }
            return;
          }
        }
        if (p?.state === "fail") { update(j0.id, (j) => ({ ...j, st: "fail", msg: failWhy(p).slice(0, 300) })); return; }
        if (late) { update(j0.id, (j) => ({ ...j, st: "fail", msg: "오래 진행 소식이 없어 추적을 멈췄어 — 결과가 오면 아래 완성작에 올라와" })); return; }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    } finally { polling.current.delete(j0.id); }
  }, [update, loadHist]);

  useEffect(() => {
    alive.current = true;
    void loadHist();
    for (const j of jobsLoad()) if (j.st === "run") void poll(j);
    return () => { alive.current = false; };
  }, [loadHist, poll]);

  const setOpt = (k: string, v: string) => setOpts((o) => { const n = { ...o, [k]: v }; try { localStorage.setItem(OKEY, JSON.stringify(n)); } catch { /* 이 판만 */ } return n; });
  const make = async () => {
    if (!ok || busy) { if (!ok) setErr("유튜브 영상 주소를 넣어줘 — youtube.com/watch?v=… · youtu.be/… · youtube.com/shorts/…"); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/ys", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: u, ask: ask.trim().slice(0, 300), opts }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d?.ok || !d.id) { setErr(String(d?.error || "만들기 요청 실패 · HTTP " + r.status)); return; }
      const j: Job = { id: String(d.id), out: String(d.out || "ys_out/" + d.id + "/result.json"), url: u, t0: Date.now(), st: "run", ratio: opts.ratio };
      setJobs((a) => { const b = [j, ...a.filter((x) => x.id !== j.id)]; jobsSave(b); return b; });
      setUrl(""); setAsk(""); setOpen(j.id);
      void poll(j);
    } catch (e) { setErr("만들기 요청 실패 · " + String((e as Error)?.message || e).slice(0, 120)); }
    finally { setBusy(false); }
  };
  const drop = (id: string) => setJobs((a) => { const b = a.filter((j) => j.id !== id); jobsSave(b); return b; });

  const mine = new Set(jobs.map((j) => j.id));
  const others = hist.filter((h) => !mine.has(h.id));
  return (
    <Pane title="유튜브">
      <div className="yeta-set mt-2 nm-dl nm-ys">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">영상 주소</span>
          <div className="nm-dl-url">
            <input type="url" value={url} placeholder="youtube.com/watch?v=… · youtu.be/… · shorts" aria-label="유튜브 영상 주소" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
              onChange={(e) => { setUrl(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") void make(); }} />
            <button type="button" className={`nm-dl-send${ok && !busy ? " on" : ""}`} disabled={!ok || busy} onClick={() => void make()} aria-label={ok ? "이 영상으로 만들기" : "유튜브 영상 주소를 넣으면 만들 수 있어"}>{busy ? "…" : "만들기"}</button>
          </div>
          <textarea className="nm-ys-ask" value={ask} rows={2} maxLength={300} placeholder="바라는 점(선택) — 예: 핵심 셋만 · 숫자 위주로" aria-label="바라는 점" onChange={(e) => setAsk(e.target.value)} />
          <div className="nm-ys-opts">
            {OPTS.map((o) => (
              <label key={o.k} className="nm-ys-opt"><span>{o.lab}</span>
                <select className="nm-dl-q" value={opts[o.k]} onChange={(e) => setOpt(o.k, e.target.value)} aria-label={o.lab}>
                  {o.vals.map(([v, lab]) => <option key={v} value={v}>{lab}</option>)}
                </select>
              </label>
            ))}
          </div>
          {err ? <p className="nm-chan-msg" role="alert">{err}</p> : null}
        </div>

        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">이 기기에서 만든 것</span>
          <p className="nm-dl-sec">이 기기에서 만든 것 <i>({jobs.length})</i></p>
          {!jobs.length ? <p className="nm-chan-msg">아직 만든 게 없습니다</p> : null}
          {jobs.map((j) => {
            const p = prog[j.id], steps = p?.steps || [], now = steps.find((s) => s.st === "run");
            const lab = j.res?.title || p?.title || "유튜브 · " + vidOf(j.url);
            return (
              <div key={j.id} className={`nm-dl-job${j.st === "done" ? " done" : ""}${j.st === "fail" ? " err" : ""}`}>
                <div className="hd">
                  <button type="button" className="lab nm-ys-lab" onClick={() => setOpen(open === j.id ? "" : j.id)} aria-expanded={open === j.id}>{lab}</button>
                  <span className="st">{j.st === "fail" ? "⚠ 실패" : j.st === "done" ? "✓ 완료" + (j.res?.dur ? " · " + durTxt(j.res.dur) : "") : (STEPS.find(([k]) => k === now?.k)?.[1] || "준비") + " 중… · " + agoTxt(j.t0)}</span>
                </div>
                {j.st === "run" && steps.length ? (
                  <ol className="nm-ys-steps">{STEPS.map(([k, l]) => { const s = steps.find((x) => x.k === k); return s ? <li key={k} className={"s-" + (s.st || "wait")}>{l}{s.note ? " · " + s.note : ""}</li> : null; })}</ol>
                ) : null}
                {j.st === "fail" ? <p className="nm-dl-why">{j.msg || "실패"}</p> : null}
                {j.st === "done" && j.res?.video && open === j.id ? <Player r={{ ...j.res, ratio: j.res.ratio || j.ratio }} /> : null}
                {j.st !== "run" ? <button type="button" className="go gray" onClick={() => drop(j.id)} aria-label="이 기기 목록에서 지우기(완성작은 서버에 그대로)">목록에서 지움</button> : null}
              </div>
            );
          })}
        </div>

        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">완성작</span>
          <p className="nm-dl-sec">완성작 <i>({others.length})</i></p>
          {!others.length ? <p className="nm-chan-msg">다른 데서 만든 완성작이 아직 없습니다</p> : null}
          <div className="nm-q-list" role="list">
            {others.map((h) => (
              <div key={h.id} role="listitem" className="nm-q-row nm-memo-row nm-ys-hist">
                <button type="button" className="qm" onClick={() => setOpen(open === h.id ? "" : h.id)} aria-expanded={open === h.id}>
                  <i>{h.title || "제목 없음"}</i><small>{[h.channel, durTxt(h.dur), h.ratio, agoTxt(h.ts)].filter(Boolean).join(" · ")}</small>
                </button>
                {open === h.id ? <Player r={h} /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Pane>
  );
}

function Player({ r }: { r: { video?: string; poster?: string; report?: string; infographic?: string; ratio?: string; src_url?: string } }) {
  if (!https(r.video)) return null;
  const web = (u: string) => { window.location.hash = "#/web?u=" + encodeURIComponent(u); };   // 리포트 · 그림 = 앱 안 한 겹(#/web)
  return (
    <div className={`nm-ys-play${r.ratio === "16:9" ? " wide" : ""}`}>
      <video src={r.video} poster={https(r.poster) ? r.poster : undefined} controls playsInline preload="metadata" />
      <div className="nm-ys-links">
        <a className="go" href={r.video} download target="_blank" rel="noreferrer">영상 받기</a>
        {https(r.report) ? <button type="button" className="go gray" onClick={() => web(r.report!)}>리포트</button> : null}
        {https(r.infographic) ? <button type="button" className="go gray" onClick={() => web(r.infographic!)}>인포그래픽</button> : null}
        {https(r.src_url) ? <button type="button" className="go gray" onClick={() => web(r.src_url!)}>원본 영상</button> : null}
      </div>
    </div>
  );
}

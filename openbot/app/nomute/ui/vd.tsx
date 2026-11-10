// 서랍 「큐영상」 = 옛 에디터 큐 영상 창(viewer/vd.html)을 앱 안으로
//   (형 11-10 15:48 봄 1:1 「응 에디터에 잇는거 다 정원으로 가져왕」 · team-4 뎅 · 봄 18:40 「큐영상(vd)」)
//   같은 것 = 기사 목록(/articles.json · 60건) 에서 12건까지 고름 · 축 다섯(형식 · 해상도 · 프레임 · 화질 · 숏폼 팩 · 4K = MP4 에서만) · POST /api/vd {files, opts} → out(vd_out/<id>/video.json) 10초마다 · 작업 내역 vd_jobs(30 · 옛 창과 같은 칸)
//   다른 것 = 메뉴바 · 목업 모니터는 안 옮김(고르기 · 만들기 · 받기만) · 다 된 영상은 맨 위에서 바로 재생
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./dl.css";
import "./ys.css";
import "./song.css";
import { useEffect, useRef, useState } from "react";
import { Pane } from "./pane";
import { VD_AXES, VD_DEF, VD_MAX, artKey, vdBlocked, vdDone, vdPacks, vdSet, vdVids, type VdJob, type VdOpts } from "./vd-logic";

type Art = { file: string; title: string; media?: string; hook?: string; date?: string };
const JKEY = "vd_jobs";
const jload = (): VdJob[] => { try { const a = JSON.parse(localStorage.getItem(JKEY) || "[]"); return Array.isArray(a) ? a.slice(0, 30) : []; } catch { return []; } };
const jsave = (a: VdJob[]) => { try { localStorage.setItem(JKEY, JSON.stringify(a.slice(0, 30))); } catch { /* 이번만 */ } };
const fname = (u: string) => decodeURIComponent(String(u).split("?")[0].split("/").pop() || "video.mp4");
const dl = (u: string) => (/^https:\/\//i.test(u) ? `/api/dl?u=${encodeURIComponent(u)}&n=${encodeURIComponent(fname(u))}` : u);

export function VdModal() {
  const [arts, setArts] = useState<Art[] | null>(null), [listErr, setListErr] = useState(""), [picked, setPicked] = useState<string[]>([]), [o, setO] = useState<VdOpts>(VD_DEF);
  const [jobs, setJobs] = useState<VdJob[]>(jload), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const alive = useRef(true), polling = useRef(new Set<string>());
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const upd = (id: string, f: (j: VdJob) => VdJob) => { const a = jload().map((j) => (j.id === id ? f(j) : j)); jsave(a); if (alive.current) setJobs(a); };
  const poll = async (j: VdJob) => {   // 원본 poll — 10초 × 240(40분) · SPA HTML 거름
    if (polling.current.has(j.id)) return;
    polling.current.add(j.id);
    try {
      for (let i = 0; i < 240 && alive.current; i++) {
        await new Promise((ok) => setTimeout(ok, 10_000));
        if (!alive.current) return;
        try {
          const r = await fetch(`/${j.out.replace(/^\//, "")}?t=${Date.now()}`, { credentials: "same-origin", cache: "no-store" });
          if (!r.ok || (r.headers.get("content-type") || "").includes("text/html")) continue;
          const d = (await r.json()) as { error?: string; files?: string[] };
          if (!d) continue;
          upd(j.id, (x) => vdDone(x, d)); return;
        } catch { /* 다음 회차 */ }
      }
    } finally { polling.current.delete(j.id); }
  };
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/articles.json?t=${Date.now()}`, { credentials: "same-origin", cache: "no-store" });
        if (!r.ok || (r.headers.get("content-type") || "").includes("text/html")) throw new Error("없음");
        const a = (((await r.json()) as { articles?: Art[] }).articles || []).filter((x) => x.file && x.title).slice(0, 60);
        if (alive.current) setArts(a);
      } catch { if (alive.current) { setArts([]); setListErr("기사 목록을 못 불러왔어 — 다시 열어 줘"); } }
    })();
    jload().filter((j) => j.status === "run" && j.out && j.id).forEach((j) => void poll(j));   // 진행 중 렌더 전부 이어받기(원본 260810)
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (f: string) => setPicked((p) => (p.includes(f) ? p.filter((x) => x !== f) : p.length >= VD_MAX ? p : [...p, f]));
  const byKey = new Map((arts || []).map((a) => [artKey(a.file), a]));
  const fire = async () => {
    if (!picked.length) { setErr("기사를 하나 이상 골라줘"); return; }
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/vd", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ files: picked, opts: o }) });
      const j = (await r.json().catch(() => ({}))) as { id?: string; out?: string; error?: string };
      if (!r.ok || j.error || !j.id || !j.out) throw new Error(j.error || `HTTP ${r.status}`);
      const job: VdJob = { id: j.id, out: j.out, n: picked.length, status: "run", t0: Date.now() };
      const a = [job, ...jload()]; jsave(a); setJobs(a); setPicked([]); void poll(job);
    } catch (e) { setErr(`만들기 실패 — ${e instanceof Error ? e.message : String(e)}`); }
    finally { setBusy(false); }
  };
  const done = jobs.find((j) => j.status === "done" && vdVids(j.files).length);
  return (
    <Pane title="큐영상">
      <div className="yeta-set mt-2 nm-dl nm-ys">
        {done ? (
          <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
            <span className="ycd-nm yset-ttl">완성본 · {done.id}</span>
            <video src={vdVids(done.files)[0]} controls playsInline preload="metadata" style={{ width: "100%", maxHeight: "60dvh", background: "#000", borderRadius: 12 }} />
          </div>
        ) : null}
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">기사 고르기 · {picked.length} / {VD_MAX}건</span>
          {arts === null ? <p className="nm-chan-msg">기사 목록 읽는 중…</p> : null}
          {listErr ? <p className="nm-chan-msg" role="alert">{listErr}</p> : null}
          {arts && !arts.length && !listErr ? <p className="nm-chan-msg">큐가 비었어.</p> : null}
          <div className="nm-vd-list">
            {(arts || []).map((a) => { const k = artKey(a.file), i = picked.indexOf(k); return (
              <button key={k} type="button" className={`nm-song-opt${i >= 0 ? " on" : ""}`} aria-pressed={i >= 0} onClick={() => toggle(k)}>
                <b>{i >= 0 ? `${i + 1}. ` : ""}{a.hook || a.title}</b>{a.media ? <span>{a.media}{a.date ? ` · ${a.date}` : ""}</span> : null}
              </button>
            ); })}
          </div>
          {picked.length ? (
            <div className="nm-ys-opts">
              <span className="nm-song-k">고른 것</span>
              {picked.map((f, i) => <button key={f} type="button" className="yset-chip on" title="빼기" onClick={() => toggle(f)}>{i + 1}. {(byKey.get(f)?.title || f).slice(0, 18)} ✕</button>)}
              <button type="button" className="yset-chip" onClick={() => setPicked([])}>다 빼기</button>
            </div>
          ) : null}
        </div>
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">만들기</span>
          {VD_AXES.map((ax) => (
            <div key={ax.k} className="nm-ys-opts" role="group" aria-label={ax.nm}>
              <span className="nm-song-k">{ax.nm}</span>
              {ax.vals.map(([v, lab]) => { const bl = vdBlocked(o, ax.k, v); return <button key={v} type="button" className={`yset-chip${o[ax.k] === v ? " on" : ""}`} aria-pressed={o[ax.k] === v} disabled={bl} title={bl ? "MP4에서만" : undefined} onClick={() => setO((x) => vdSet(x, ax.k, v))}>{lab}</button>; })}
            </div>
          ))}
          <div className="nm-ys-opts"><button type="button" className="yset-chip on" disabled={busy || !picked.length} onClick={() => void fire()}>{busy ? "보내는 중…" : `${picked.length || ""}${picked.length ? "건 " : ""}영상 만들기`}</button></div>
          {err ? <p className="nm-chan-msg" role="alert">{err}</p> : null}
        </div>
        {jobs.length ? (
          <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
            <span className="ycd-nm yset-ttl">렌더 큐 · {jobs.length}</span>
            {jobs.map((j) => (
              <div key={j.id} className="nm-ys-opts">
                <span className="nm-song-k">{j.n}건</span>
                <span className="nm-chan-msg">{j.status === "done" ? `완료 ${j.n}편` : j.status === "err" ? "실패" : "만드는 중…"} · {j.id}</span>
                {vdVids(j.files).map((u, i) => <button key={u} type="button" className="yset-chip on" onClick={() => window.open(dl(u), "_blank")}>받기{vdVids(j.files).length > 1 ? ` ${i + 1}` : ""}</button>)}
                {vdPacks(j.files).map((u) => <button key={u} type="button" className="yset-chip" onClick={() => window.open(dl(u), "_blank")}>숏폼 팩</button>)}
              </div>
            ))}
            <div className="nm-ys-opts"><button type="button" className="yset-chip" onClick={() => { jsave([]); setJobs([]); }}>내역 비우기</button></div>
          </div>
        ) : null}
      </div>
    </Pane>
  );
}

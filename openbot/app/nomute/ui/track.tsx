// 서랍 「트래킹」 = 옛 에디터 트래킹(viewer/track.html)을 앱 안으로 · 판 1(team-4 · 깃 11-10 · 형 15:48 「응 에디터에 잇는거 다 정원으로 가져왕」)
//   길 = 원본과 같음: 분석 = POST /api/track {url | r2key, name}(파일 = ./r2-upload) → {id} · 5초마다 error → tracks(people 배열 = 끝 · 라이브 /api/track?f= → 정적 track_out/)
//          렌더 = POST /api/track {render:{id, mode, …}} → video.json(이번 판 · 옛 url 아님 · 모드 같음) · 받기 = /api/dl
//   판 1 = 모자이크 · 이름표(핀셋) · 크로마키 / 판 2(아직) = 키잉 · 실루엣 → 그때까지는 옛 화면
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
import { fileWhy, absUrl, dlHref } from "./vedit-logic";
import { TK_KEY, TK_POLL_MS, AN_BUDGET_S, RD_BUDGET_S, MODES, colorOf, tkApi, cropUrl, tracksDone, renderBody, rendered, playOf, alphaOf, pickDflt, mmss, type Person, type Pick, type TRes, type Mode } from "./track-logic";

type TJob = { id: string; lbl: string; t0: number; st: "an" | "pick" | "rd" | "done" | "fail"; msg?: string; people?: Person[]; made?: string; pick: Pick; rt0?: number; prev?: string; res?: TRes };
const load = <T,>(k: string, d: T): T => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 이 판만 */ } };
const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s.trim());
async function text(u: string): Promise<string> {
  try { const r = await fetch(u + (u.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store", credentials: "same-origin" }); if (!r.ok || (r.headers.get("content-type") || "").includes("text/html")) return ""; const t = await r.text(); return /^\s*</.test(t) ? "" : t; } catch { return ""; }
}
const live2 = async (id: string, f: string, rel: string) => (await text(tkApi(id, f))) || (await text("/track_out/" + encodeURIComponent(id) + "/" + rel));   // 라이브 → 정적(track.html tkFetch)
const json = (t: string) => { try { return JSON.parse(t); } catch { return null; } };
const post = async (body: unknown) => { const r = await fetch("/api/track", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const d = await r.json().catch(() => ({})); return { r, d }; };

export function TrackModal() {
  const [file, setFile] = useState<File | null>(null), [url, setUrl] = useState(""), [pct, setPct] = useState(-1), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const [jobs, setJobs] = useState<TJob[]>(() => load<TJob[]>(TK_KEY, []).filter((j) => j && j.id && j.pick).slice(0, 10)), [open, setOpen] = useState("");
  const alive = useRef(true), polling = useRef<Set<string>>(new Set());
  const upd = useCallback((id: string, fn: (j: TJob) => TJob) => setJobs((a) => { const b = a.map((j) => (j.id === id ? fn(j) : j)); save(TK_KEY, b); return b; }), []);
  const sleep = () => new Promise((r) => setTimeout(r, TK_POLL_MS));

  const pollAn = useCallback(async (j0: TJob) => {   // 분석 = error 먼저 → tracks(people) · 소프트 600초 · 하드 두 배
    if (polling.current.has("an:" + j0.id)) return;
    polling.current.add("an:" + j0.id);
    try {
      while (alive.current) {
        const el = (await live2(j0.id, "error", "error.log")).trim();
        if (el && !el.startsWith("{")) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: el.slice(-300) })); return; }
        const d = json(await live2(j0.id, "tracks", "tracks.json"));
        if (tracksDone(d)) { upd(j0.id, (j) => ({ ...j, st: "pick", people: d.people.filter((p) => p && Number.isInteger(p.pid)), made: String((d as { meta?: { made?: string } }).meta?.made || "") })); setOpen(j0.id); return; }
        if (Date.now() - j0.t0 > AN_BUDGET_S * 2000) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: "20분 넘게 분석 결과가 없어 추적을 멈췄어" })); return; }
        await sleep();
      }
    } finally { polling.current.delete("an:" + j0.id); }
  }, [upd]);

  const pollRd = useCallback(async (j0: TJob) => {   // 렌더 = error.log 는 처음 본 글과 달라질 때만 실패(옛 실패 잔존 무시 · track.html 866-877) · video.json 은 이번 판만
    if (polling.current.has("rd:" + j0.id)) return;
    polling.current.add("rd:" + j0.id);
    const t0 = j0.rt0 || Date.now(), mode = j0.pick.mode;
    let base: string | null = null;
    try {
      while (alive.current) {
        const el = (await live2(j0.id, "error", "error.log")).trim();
        if (base === null) base = el; else if (el && el !== base) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: el.slice(-300) })); return; }
        const d = json(await live2(j0.id, "video", "video.json")) as TRes | null;
        const s = rendered(d, t0 - 90e3, j0.prev || "", mode);
        if (s === "error") { upd(j0.id, (j) => ({ ...j, st: "fail", msg: String(d!.error).slice(0, 300) })); return; }
        if (s === "done") { upd(j0.id, (j) => ({ ...j, st: "done", res: d!, prev: d!.url || d!.preview || "" })); setOpen(j0.id); return; }
        if (Date.now() - t0 > RD_BUDGET_S * 2000) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: "30분 넘게 결과가 없어 추적을 멈췄어 — 오면 다시 열 때 이어받아" })); return; }
        await sleep();
      }
    } finally { polling.current.delete("rd:" + j0.id); }
  }, [upd]);

  useEffect(() => {
    alive.current = true;
    for (const j of load<TJob[]>(TK_KEY, [])) {
      if (j?.st === "an" && Date.now() - j.t0 < AN_BUDGET_S * 2000) void pollAn(j);
      if (j?.st === "rd" && Date.now() - (j.rt0 || 0) < RD_BUDGET_S * 2000) void pollRd(j);
    }
    return () => { alive.current = false; };
  }, [pollAn, pollRd]);

  const pick = (f: File | null) => { setErr(""); if (!f) { setFile(null); return; } const why = fileWhy(f.name, f.size); if (why) { setErr(why); setFile(null); return; } setFile(f); setUrl(""); };
  const analyze = async () => {
    if (busy) return;
    if (!file && !isUrl(url)) { setErr("영상 파일을 고르거나 영상 주소를 넣어 줘"); return; }
    setBusy(true); setErr("");
    try {
      const src = file ? { r2key: await r2Upload(file, setPct), name: file.name } : { url: url.trim() };
      const lbl = (file ? file.name : url.trim().replace(/^https?:\/\/(www\.)?/, "")).slice(0, 80);
      const { r, d } = await post(src);
      if (!r.ok || !d?.ok || !d.id) { setErr(String(d?.error || "분석 요청 실패 · HTTP " + r.status)); return; }
      const j: TJob = { id: String(d.id), lbl, t0: Date.now(), st: "an", pick: pickDflt() };
      setJobs((a) => { const b = [j, ...a.filter((x) => x.id !== j.id)].slice(0, 10); save(TK_KEY, b); return b; });
      setFile(null); setUrl(""); setOpen(j.id);
      void pollAn(j);
    } catch (e) { setErr(String((e as Error)?.message || e).slice(0, 200)); }
    finally { setBusy(false); setPct(-1); }
  };
  const render = async (j: TJob) => {
    if (busy) return;
    const rb = renderBody(j.id, j.people || [], j.pick);
    if (rb.error) { upd(j.id, (x) => ({ ...x, msg: rb.error })); return; }
    setBusy(true);
    try {
      const { r, d } = await post(rb.body);
      if (!r.ok || !d?.ok) { upd(j.id, (x) => ({ ...x, msg: String(d?.error || "렌더 요청 실패 · HTTP " + r.status) })); return; }
      const nj: TJob = { ...j, st: "rd", rt0: Date.now(), msg: "" };
      upd(j.id, () => nj); void pollRd(nj);
    } catch (e) { upd(j.id, (x) => ({ ...x, msg: String((e as Error)?.message || e).slice(0, 200) })); }
    finally { setBusy(false); }
  };
  const setPick = (id: string, fn: (p: Pick) => Pick) => upd(id, (j) => ({ ...j, pick: fn(j.pick), msg: "" }));

  return (
    <Pane title="트래킹">
      <div className="yeta-set mt-2 nm-dl nm-ys">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">영상</span>
          <label className="go nm-ved-file">{file ? file.name : "영상 파일 고르기"}<input type="file" accept="video/*,.mkv,.avi" hidden onChange={(e) => pick(e.target.files?.[0] || null)} /></label>
          <div className="nm-dl-url">
            <input type="url" value={url} placeholder="또는 영상 주소" aria-label="영상 주소" autoComplete="off" spellCheck={false} disabled={!!file} onChange={(e) => { setUrl(e.target.value); setErr(""); }} />
            <button type="button" className={`nm-dl-send${(file || isUrl(url)) && !busy ? " on" : ""}`} disabled={busy || (!file && !isUrl(url))} onClick={() => void analyze()} aria-label="분석">{busy ? (pct >= 0 ? pct + "%" : "…") : "분석"}</button>
          </div>
          <p className="nm-dl-why">얼굴을 찾아 따라가(보통 2~6분) → 사람마다 모자이크 · 이름표 · 크로마키</p>
          {err ? <p className="nm-chan-msg" role="alert">{err}</p> : null}
        </div>

        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">이 기기에서 한 것</span>
          <p className="nm-dl-sec">이 기기에서 한 것 <i>({jobs.length})</i></p>
          {!jobs.length ? <p className="nm-chan-msg">아직 없습니다</p> : null}
          {jobs.map((j) => {
            const run = j.st === "an" || j.st === "rd";
            const mins = Math.max(1, Math.round((Date.now() - (j.st === "rd" ? j.rt0 || j.t0 : j.t0)) / 60e3));
            const p = j.pick, people = j.people || [];
            return (
              <div key={j.id} className={`nm-dl-job${j.st === "done" ? " done" : ""}${j.st === "fail" ? " err" : ""}`}>
                <div className="hd">
                  <button type="button" className="lab nm-ys-lab" onClick={() => setOpen(open === j.id ? "" : j.id)} aria-expanded={open === j.id}>{j.lbl || j.id}</button>
                  <span className="st">{j.st === "fail" ? "⚠ 실패" : j.st === "an" ? "얼굴 찾는 중… · " + mins + "분" : j.st === "rd" ? "만드는 중… · " + mins + "분" : j.st === "pick" ? "✓ " + people.length + "명 · 골라서 만들기" : "✓ 완료"}</span>
                </div>
                {j.st === "fail" ? <p className="nm-dl-why">{j.msg || "실패"}</p> : null}
                {open === j.id && (j.st === "pick" || j.st === "done" || (j.st === "fail" && people.length)) ? (
                  <div className="nm-trk">
                    <div className="nm-ys-links" role="group" aria-label="할 일">
                      {MODES.map(([m, l]) => <button key={m} type="button" className={`go${p.mode === m ? "" : " gray"}`} aria-pressed={p.mode === m} onClick={() => setPick(j.id, (x) => ({ ...x, mode: m as Mode }))}>{l}</button>)}
                    </div>
                    {p.mode !== "chroma" ? (
                      <>
                        {!people.length ? <p className="nm-chan-msg">찾은 얼굴이 없어 — 크로마키만 돼</p> : null}
                        <div className="nm-dl-grid g3">{people.map((pp) => {
                          const pid = pp.pid, on = p.sel.includes(pid), body = p.scope[pid] === "body";
                          return (
                            <div key={pid} className={`nm-dl-card nm-trk-card${on && p.mode === "mosaic" ? " on" : ""}`} style={{ ["--pc" as string]: colorOf(pid) }}>
                              <button type="button" className="nm-trk-face" aria-pressed={p.mode === "mosaic" ? on : undefined} onClick={() => p.mode === "mosaic" && setPick(j.id, (x) => ({ ...x, sel: on ? x.sel.filter((k) => k !== pid) : [...x.sel, pid] }))}>
                                {pp.crop ? <img src={absUrl(cropUrl(j.id, pp.crop, j.made))} alt={"인물 " + pid} loading="lazy" /> : null}
                              </button>
                              <span className="pl">{"#" + pid + (pp.first != null ? " · " + mmss(pp.first) + "–" + mmss(pp.last) : "")}{pp.cap ? " · " + String(pp.cap).slice(0, 30) : ""}</span>
                              {p.mode === "mosaic" && on && Array.isArray(pp.body) && pp.body.length ? (
                                <button type="button" className="go gray sm" onClick={() => setPick(j.id, (x) => { const s = { ...x.scope }; if (body) delete s[pid]; else s[pid] = "body"; return { ...x, scope: s }; })}>{body ? "전신 가림" : "얼굴만 가림"}</button>
                              ) : null}
                              {p.mode === "pinset" ? <input type="text" className="nm-dl-q" value={p.names[pid] || ""} placeholder="이름" maxLength={24} aria-label={pid + "번 이름"} onChange={(e) => { const v = e.target.value; setPick(j.id, (x) => ({ ...x, names: { ...x.names, [pid]: v } })); }} /> : null}
                            </div>
                          );
                        })}</div>
                        {p.mode === "mosaic" ? (
                          <div className="nm-ys-opts">
                            <label className="nm-ys-opt"><span>고른 사람</span><select className="nm-dl-q" value={p.invert ? "keep" : "hide"} onChange={(e) => setPick(j.id, (x) => ({ ...x, invert: e.target.value === "keep" }))}><option value="hide">가리기</option><option value="keep">빼고 다 가리기</option></select></label>
                            <label className="nm-ys-opt"><span>모양</span><select className="nm-dl-q" value={p.mo.shape} onChange={(e) => setPick(j.id, (x) => ({ ...x, mo: { ...x.mo, shape: e.target.value === "rect" ? "rect" : "ellipse" } }))}><option value="ellipse">타원</option><option value="rect">네모</option></select></label>
                            <label className="nm-ys-opt"><span>크기</span><select className="nm-dl-q" value={p.mo.size} onChange={(e) => setPick(j.id, (x) => ({ ...x, mo: { ...x.mo, size: +e.target.value } }))}>{[90, 100, 115, 130, 160, 200].map((v) => <option key={v} value={v}>{v}%</option>)}</select></label>
                            <label className="nm-ys-opt"><span>칸 수</span><select className="nm-dl-q" value={p.mo.px} onChange={(e) => setPick(j.id, (x) => ({ ...x, mo: { ...x.mo, px: +e.target.value } }))}>{[5, 7, 9, 12, 16, 20].map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
                            <label className="nm-ys-opt"><span>가장자리</span><select className="nm-dl-q" value={p.mo.feather} onChange={(e) => setPick(j.id, (x) => ({ ...x, mo: { ...x.mo, feather: +e.target.value } }))}>{[0, 5, 10, 20, 40].map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="nm-ys-opts">
                        <label className="nm-ys-opt"><span>배경색</span><select className="nm-dl-q" value={p.ck.color} onChange={(e) => setPick(j.id, (x) => ({ ...x, ck: { ...x.ck, color: e.target.value === "blue" ? "blue" : "green" } }))}><option value="green">초록</option><option value="blue">파랑</option></select></label>
                        <label className="nm-ys-opt"><span>강도</span><select className="nm-dl-q" value={p.ck.similarity} onChange={(e) => setPick(j.id, (x) => ({ ...x, ck: { ...x.ck, similarity: +e.target.value } }))}>{[8, 12, 18, 25, 35, 50].map((v) => <option key={v} value={v}>{v}%</option>)}</select></label>
                        <label className="nm-ys-opt"><span>테두리</span><select className="nm-dl-q" value={p.ck.choke} onChange={(e) => setPick(j.id, (x) => ({ ...x, ck: { ...x.ck, choke: +e.target.value } }))}>{[-4, -2, 0, 2, 4].map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
                        <label className="nm-ys-opt"><span>부드럽게</span><select className="nm-dl-q" value={p.ck.feather} onChange={(e) => setPick(j.id, (x) => ({ ...x, ck: { ...x.ck, feather: +e.target.value } }))}>{[0, 1, 3, 6, 10].map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
                      </div>
                    )}
                    {j.msg && j.st !== "fail" ? <p className="nm-chan-msg" role="alert">{j.msg}</p> : null}
                    <button type="button" className="go" disabled={busy} onClick={() => void render(j)}>{(MODES.find(([m]) => m === p.mode) || ["", ""])[1] + " 만들기" + (p.mode === "mosaic" && !p.invert ? "(" + p.sel.length + "명)" : "")}</button>
                  </div>
                ) : null}
                {j.st === "done" && j.res && open === j.id ? <Result r={j.res} name={j.lbl} /> : null}
                {!run ? <button type="button" className="go gray" onClick={() => setJobs((a) => { const b = a.filter((x) => x.id !== j.id); save(TK_KEY, b); return b; })}>목록에서 지움</button> : null}
              </div>
            );
          })}
          <p className="nm-dl-why">키잉 · 실루엣 = 다음 판(그때까지는 옛 에디터)</p>
        </div>
      </div>
    </Pane>
  );
}

function Result({ r, name }: { r: TRes; name: string }) {
  const play = playOf(r);
  if (!play) return null;
  const alpha = alphaOf(r);
  return (
    <div className={`nm-ys-play wide${alpha ? " nm-trk-alpha" : ""}`}>
      <video src={absUrl(play)} controls playsInline preload="metadata" />
      {alpha && r.note === "master-lost" ? <p className="nm-dl-why">MOV 원본 올리기가 실패해 미리보기만 있어</p> : null}
      {r.url ? <div className="nm-ys-links"><a className="go" href={dlHref(r.url, (name || "track").replace(/\.[a-z0-9]+$/i, "") + (alpha ? "-투명.mov" : "-트래킹.mp4"))}>영상 받기</a></div> : null}
    </div>
  );
}

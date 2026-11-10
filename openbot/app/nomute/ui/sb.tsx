// 서랍 「스토리보드」 = 옛 에디터 콘티(viewer/sb.html)를 앱 안으로 · 판 1(team-4 · 깃 11-11 · 형 11-10 15:48 「응 에디터에 잇는거 다 정원으로 가져왕」)
//   길 = 원본과 같음: 보냄 = POST /api/sb {story, director, shoot, set, ad, sound, ref, lbl} → {id, out = sb_out/<id>/board.md} · 5초마다 error.log → board.md(글 = 끝)
//          같은 폴더 sheet.json(콘티 시트 한 장) · ref.json(레퍼런스 그림) · motion.mp4(모션) · 받기 = 화면에서 .md
//   판 1 = 글 콘티까지 / 판 2(아직) = 2차 촬영(그록 · 시댄스 영상 · 크레딧) · 참고 사진 · 다른 기기 목록 → 그때까지는 옛 화면
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./dl.css";
import "./ys.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pane } from "./pane";
import { SB_KEY, SB_OKEY, SB_POLL_MS, SB_BUDGET_S, DIRECTORS, SHOOTS, CAPS, RATIOS, LENS, STYLES, SUBS, Q_RANK, sbPick, qFit, cutsOf, sbBody, refUrls, type SbOpts } from "./sb-logic";

type SJob = { id: string; out: string; lbl: string; t0: number; st: "run" | "done" | "fail"; msg?: string };
type Res = { md: string; sheet?: string; refs: string[]; motion?: string };
const load = <T,>(k: string, d: T): T => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 이 판만 */ } };
async function text(u: string): Promise<string> {
  try { const r = await fetch(u + (u.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store", credentials: "same-origin" }); if (!r.ok || (r.headers.get("content-type") || "").includes("text/html")) return ""; const t = await r.text(); return /^\s*<(?:!doctype|html)/i.test(t) ? "" : t; } catch { return ""; }
}
const json = (t: string) => { try { return t ? JSON.parse(t) : null; } catch { return null; } };
const abs = (p: string) => "/" + p.replace(/^\/+/, "");
async function readRes(out: string): Promise<Res | null> {
  const md = await text(abs(out));
  if (!md.trim()) return null;
  const base = abs(out.replace(/board\.md$/, ""));
  const [sj, rj] = [json(await text(base + "sheet.json")), json(await text(base + "ref.json"))];
  let motion = "";
  try { const r = await fetch(base + "motion.mp4", { method: "HEAD", credentials: "same-origin" }); if (r.ok && !(r.headers.get("content-type") || "").includes("text/html")) motion = base + "motion.mp4"; } catch { /* 없음 */ }
  return { md, sheet: sj && typeof sj.url === "string" ? sj.url : "", refs: refUrls(rj), motion };
}
function saveFile(txt: string, name: string) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/markdown;charset=utf-8" })); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

export function SbModal() {
  const [story, setStory] = useState(""), [o, setO] = useState<SbOpts>(() => sbPick(load(SB_OKEY, {}))), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const [jobs, setJobs] = useState<SJob[]>(() => load<SJob[]>(SB_KEY, []).filter((j) => j && j.id && /^sb_out\/[A-Za-z0-9_-]+\/board\.md$/.test(j.out)).slice(0, 20)), [open, setOpen] = useState("");
  const [res, setRes] = useState<Record<string, Res | null>>({});
  const alive = useRef(true), polling = useRef<Set<string>>(new Set());
  const upd = useCallback((id: string, fn: (j: SJob) => SJob) => setJobs((a) => { const b = a.map((j) => (j.id === id ? fn(j) : j)); save(SB_KEY, b); return b; }), []);
  const poll = useCallback(async (j0: SJob) => {   // 원본 박자(5초 · 1800초 · 하드 두 배) · error.log 먼저
    if (polling.current.has(j0.id)) return;
    polling.current.add(j0.id);
    try {
      while (alive.current) {
        const el = (await text(abs(j0.out.replace(/[^/]+$/, "error.log")))).trim();
        if (el && !el.startsWith("{")) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: el.slice(-300) })); return; }
        const r = await readRes(j0.out);
        if (r) { setRes((m) => ({ ...m, [j0.id]: r })); upd(j0.id, (j) => ({ ...j, st: "done" })); setOpen(j0.id); return; }
        if (Date.now() - j0.t0 > SB_BUDGET_S * 2000) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: "60분 넘게 콘티가 없어 추적을 멈췄어 — 오면 다시 열 때 보여" })); return; }
        await new Promise((x) => setTimeout(x, SB_POLL_MS));
      }
    } finally { polling.current.delete(j0.id); }
  }, [upd]);
  useEffect(() => { alive.current = true; for (const j of load<SJob[]>(SB_KEY, [])) if (j?.st === "run" && Date.now() - j.t0 < SB_BUDGET_S * 2000) void poll(j); return () => { alive.current = false; }; }, [poll]);

  const setOpt = (p: Partial<SbOpts>) => setO((x) => { const n = sbPick({ ...x, ...p }); save(SB_OKEY, n); return n; });
  const go = async () => {
    if (busy) return;
    const lbl = story.trim().split("\n")[0].slice(0, 40) || "콘티";
    const sb = sbBody(story, o, lbl);
    if (sb.error) { setErr(sb.error); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/sb", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(sb.body) });
      const t = await r.text(); let d: { ok?: boolean; id?: string; out?: string; error?: string } = {};
      try { d = JSON.parse(t); } catch { setErr(/^\s*<(?:!doctype|html)/i.test(t) ? "로그인이 풀렸어 — 다시 들어간 뒤 한 번 더 눌러 줘" : "서버가 이상한 걸 돌려줬어(" + r.status + ")"); return; }   // sb.html sbReadJson
      if (!r.ok || !d.ok || !d.id || !d.out) { setErr(String(d.error || "요청 실패 · HTTP " + r.status)); return; }
      const j: SJob = { id: String(d.id), out: String(d.out), lbl, t0: Date.now(), st: "run" };
      setJobs((a) => { const b = [j, ...a.filter((x) => x.id !== j.id)].slice(0, 20); save(SB_KEY, b); return b; });
      setStory(""); setOpen(j.id); void poll(j);
    } catch (e) { setErr(String((e as Error)?.message || e).slice(0, 200)); }
    finally { setBusy(false); }
  };
  const openJob = async (j: SJob) => { if (open === j.id) { setOpen(""); return; } setOpen(j.id); if (j.st === "done" && !(j.id in res)) { const r = await readRes(j.out); setRes((m) => ({ ...m, [j.id]: r })); } };
  const cap = CAPS[o.shoot] || CAPS.grok, q = qFit(o.shoot, o.q), sh = SHOOTS.find((s) => s[0] === o.shoot);
  const sel = (lab: string, v: string, vals: [string, string][], on: (v: string) => void) => (
    <label className="nm-ys-opt"><span>{lab}</span><select className="nm-dl-q" value={v} aria-label={lab} onChange={(e) => on(e.target.value)}>{vals.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
  );

  return (
    <Pane title="스토리보드">
      <div className="yeta-set mt-2 nm-dl nm-ys">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">이야기</span>
          <textarea className="nm-dl-q nm-nb-tx" value={story} rows={7} maxLength={16000} placeholder="이야기 · 기사 · 지시(첫 줄 = 이름)" aria-label="이야기" onChange={(e) => { setStory(e.target.value); setErr(""); }} />
          <div className="nm-ys-opts">
            {sel("감독", o.director === "opus" ? "fable" : o.director, DIRECTORS.map(([k, l]) => [k, l]), (v) => setOpt({ director: v }))}
            {sel("촬영", o.shoot, SHOOTS.map(([k, l]) => [k, l]), (v) => setOpt({ shoot: v }))}
            {sel("비율", o.ratio, RATIOS.map((r) => [r, r]), (v) => setOpt({ ratio: v }))}
            {sel("화질", q, Q_RANK.filter((x) => cap.q.includes(x)).map((x) => [x, x]), (v) => setOpt({ q: v }))}
            {sel("길이", o.len, LENS.map((l) => [l, l + " · " + cutsOf(l) + "편"]), (v) => setOpt({ len: v }))}
            {sel("화풍", o.style, STYLES, (v) => setOpt({ style: v, sub: "auto" }))}
            {(SUBS[o.style] || []).length ? sel("세부 화풍", o.sub, SUBS[o.style], (v) => setOpt({ sub: v })) : null}
            {sel("광고", o.ad ? "on" : "off", [["off", "끔"], ["on", "켬(마지막 컷 키비주얼)"]], (v) => setOpt({ ad: v === "on" }))}
            {o.shoot === "grok" ? sel("영상 소리", o.snd ? "on" : "off", [["on", "켬"], ["off", "끔"]], (v) => setOpt({ snd: v === "on" })) : null}
          </div>
          <p className="nm-dl-why">{(sh ? sh[1] + " · " + sh[2] : "") + (o.shoot !== "motion" ? " · 콘티와 함께 콘티 시트 · 레퍼런스 그림이 나와(그림 엔진 과금 · 옛 화면과 같음)" : "") + " · 영상 촬영(2차)은 옛 화면에서"}</p>
          <div className="nm-ys-links"><button type="button" className="go" disabled={busy || !story.trim()} onClick={() => void go()}>{busy ? "보내는 중…" : "콘티 만들기"}</button></div>
          {err ? <p className="nm-chan-msg" role="alert">{err}</p> : null}
        </div>

        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">이 기기에서 만든 것</span>
          <p className="nm-dl-sec">이 기기에서 만든 것 <i>({jobs.length})</i></p>
          {!jobs.length ? <p className="nm-chan-msg">아직 없습니다</p> : null}
          {jobs.map((j) => {
            const r = res[j.id];
            return (
              <div key={j.id} className={`nm-dl-job${j.st === "done" ? " done" : ""}${j.st === "fail" ? " err" : ""}`}>
                <div className="hd">
                  <button type="button" className="lab nm-ys-lab" onClick={() => void openJob(j)} aria-expanded={open === j.id}>{j.lbl || j.id}</button>
                  <span className="st">{j.st === "fail" ? "⚠ 실패" : j.st === "done" ? "✓ 완료" : "콘티 짜는 중… · " + Math.max(1, Math.round((Date.now() - j.t0) / 60e3)) + "분"}</span>
                </div>
                {j.st === "fail" ? <p className="nm-dl-why">{j.msg || "실패"}</p> : null}
                {open === j.id && j.st === "done" ? (r ? (
                  <div className="nm-nb">
                    {r.motion ? <div className="nm-ys-play wide"><video src={r.motion} controls playsInline preload="metadata" /></div> : null}
                    {r.sheet || r.refs.length ? <div className="nm-dl-grid g3">{[...(r.sheet ? [r.sheet] : []), ...r.refs].map((u, i) => <a key={i} className="nm-dl-card" href={u} target="_blank" rel="noopener"><img src={u} alt={i === 0 && r.sheet ? "콘티 시트" : "레퍼런스 " + (i + 1)} loading="lazy" /></a>)}</div> : null}
                    <p className="nm-nb-box">{r.md}</p>
                    <div className="nm-ys-links">
                      <button type="button" className="go gray" onClick={() => saveFile(r.md, "storyboard_" + j.id + ".md")}>.md 받기</button>
                      <button type="button" className="go gray" onClick={() => void navigator.clipboard.writeText(r.md).catch(() => {})}>글 복사</button>
                    </div>
                  </div>
                ) : <p className="nm-chan-msg">{j.id in res ? "콘티를 못 읽었어" : "읽는 중…"}</p>) : null}
                {j.st !== "run" ? <button type="button" className="go gray" onClick={() => setJobs((a) => { const b = a.filter((x) => x.id !== j.id); save(SB_KEY, b); return b; })}>목록에서 지움</button> : null}
              </div>
            );
          })}
          <p className="nm-dl-why">영상 촬영(2차) · 참고 사진 · 다른 기기에서 만든 콘티 = 다음 판(그때까지는 옛 에디터)</p>
        </div>
      </div>
    </Pane>
  );
}

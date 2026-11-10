// 서랍 「미디어 요약」 = 옛 에디터 미디어 요약(viewer/nb.html)을 앱 안으로 · 판 1(team-4 · 깃 11-10 · 형 15:48 「응 에디터에 잇는거 다 정원으로 가져왕」)
//   길 = 원본과 같음: 보냄 = POST /api/nb {url | r2key, name | text, title, kind} + ask → {id} · 5초마다 nb_out/<id>/error.log → note.json(summary) · list.json(채널 · 재생목록 = items)
//          최근 = nb_out/index.json · 뉴스 요약으로 = POST /api/submit {text} · .md = 화면에서 만들어 받기
//   판 1 = 주소 · 파일 · 붙여넣은 글 / 판 2(아직) = 사진 글자 인식 · 기사 참조 → 그때까지는 옛 화면
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
import { UP_MAX } from "./vedit-logic";
import { NB_KEY, NB_POLL_MS, NB_BUDGET_S, NB_EXT, SRC_LB, isTxt, shaky, mmss, nbBody, fresh, newsText, noteMd, trText, type Note, type VList } from "./nb-logic";

type NJob = { id: string; lbl: string; t0: number; st: "run" | "done" | "list" | "fail"; msg?: string; fed?: boolean };
type Recent = { id: string; t?: string; ts?: string; ch?: string; d?: number };
const load = <T,>(k: string, d: T): T => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 이 판만 */ } };
async function text(u: string): Promise<string> {
  try { const r = await fetch(u + (u.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store", credentials: "same-origin" }); if (!r.ok || (r.headers.get("content-type") || "").includes("text/html")) return ""; const t = await r.text(); return /^\s*</.test(t) ? "" : t; } catch { return ""; }
}
const json = <T,>(t: string): T | null => { try { return t ? (JSON.parse(t) as T) : null; } catch { return null; } };
const post = async (u: string, body: unknown) => { const r = await fetch(u, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const d = await r.json().catch(() => ({})); return { r, d }; };
const out = (id: string, f: string) => "/nb_out/" + encodeURIComponent(id) + "/" + f;
function saveFile(txt: string, name: string) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/markdown;charset=utf-8" })); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

export function NbModal() {
  const [tab, setTab] = useState<"url" | "file" | "text">("url"), [url, setUrl] = useState(""), [file, setFile] = useState<File | null>(null), [txt, setTxt] = useState(""), [ask, setAsk] = useState("");
  const [busy, setBusy] = useState(false), [pct, setPct] = useState(-1), [err, setErr] = useState("");
  const [jobs, setJobs] = useState<NJob[]>(() => load<NJob[]>(NB_KEY, []).filter((j) => j && j.id).slice(0, 20)), [open, setOpen] = useState("");
  const [notes, setNotes] = useState<Record<string, Note | VList | null>>({}), [recent, setRecent] = useState<Recent[]>([]);
  const alive = useRef(true), polling = useRef<Set<string>>(new Set());
  const upd = useCallback((id: string, fn: (j: NJob) => NJob) => setJobs((a) => { const b = a.map((j) => (j.id === id ? fn(j) : j)); save(NB_KEY, b); return b; }), []);
  const loadRecent = useCallback(async () => { const a = json<Recent[]>(await text("/nb_out/index.json")); if (alive.current && Array.isArray(a)) setRecent(a.slice(0, 12)); }, []);
  const poll = useCallback(async (j0: NJob) => {   // 원본 박자(5초 · 하드 = 2400초 두 배)
    if (polling.current.has(j0.id)) return;
    polling.current.add(j0.id);
    try {
      while (alive.current) {
        const el = (await text(out(j0.id, "error.log"))).trim();
        if (el && !el.startsWith("{")) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: el.slice(-300) })); return; }
        const n = fresh(json<Note>(await text(out(j0.id, "note.json"))), "summary", j0.t0 - 90e3);
        if (n) { setNotes((m) => ({ ...m, [j0.id]: n })); upd(j0.id, (j) => ({ ...j, st: "done", lbl: n.src?.title || j.lbl })); setOpen(j0.id); void loadRecent(); return; }
        const l = fresh(json<VList>(await text(out(j0.id, "list.json"))), "items", j0.t0 - 90e3);
        if (l) { setNotes((m) => ({ ...m, [j0.id]: l })); upd(j0.id, (j) => ({ ...j, st: "list", lbl: l.src?.title || l.src?.channel || j.lbl })); setOpen(j0.id); return; }
        if (Date.now() - j0.t0 > NB_BUDGET_S * 2000) { upd(j0.id, (j) => ({ ...j, st: "fail", msg: "80분 넘게 결과가 없어 추적을 멈췄어 — 오면 최근 자료에 올라와" })); return; }
        await new Promise((r) => setTimeout(r, NB_POLL_MS));
      }
    } finally { polling.current.delete(j0.id); }
  }, [upd, loadRecent]);
  useEffect(() => { alive.current = true; void loadRecent(); for (const j of load<NJob[]>(NB_KEY, [])) if (j?.st === "run" && Date.now() - j.t0 < NB_BUDGET_S * 2000) void poll(j); return () => { alive.current = false; }; }, [loadRecent, poll]);

  const fire = async (src: { url?: string; r2key?: string; name?: string; text?: string }, lbl: string) => {
    const nb = nbBody(src, ask);
    if (nb.error) { setErr(nb.error); return false; }
    const { r, d } = await post("/api/nb", nb.body);
    if (!r.ok || !d?.ok || !d.id) { setErr(String(d?.error || "요청 실패 · HTTP " + r.status)); return false; }
    const j: NJob = { id: String(d.id), lbl: lbl.slice(0, 80), t0: Date.now(), st: "run" };
    setJobs((a) => { const b = [j, ...a.filter((x) => x.id !== j.id)].slice(0, 20); save(NB_KEY, b); return b; });
    setOpen(j.id); void poll(j); return true;
  };
  const go = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      if (tab === "url") { if (await fire({ url }, url.trim().replace(/^https?:\/\/(www\.)?/, ""))) setUrl(""); }
      else if (tab === "file") {
        if (!file) { setErr("영상 · 소리 파일을 골라 줘"); return; }
        if (await fire({ r2key: await r2Upload(file, setPct), name: file.name }, file.name)) setFile(null);
      } else if (await fire({ text: txt }, txt.trim().split("\n")[0])) setTxt("");
    } catch (e) { setErr(String((e as Error)?.message || e).slice(0, 200)); }
    finally { setBusy(false); setPct(-1); }
  };
  const pickFile = (f: File | null) => { setErr(""); if (!f) { setFile(null); return; } if (!NB_EXT.test(f.name)) { setErr("영상 · 소리 파일만(mp4 · mov · mp3 · m4a · wav …)"); return; } if (f.size > UP_MAX) { setErr("2GB 넘는 파일은 못 올려"); return; } setFile(f); };
  const openNote = async (id: string) => {
    if (open === id) { setOpen(""); return; }
    setOpen(id);
    if (!(id in notes)) { const n = json<Note>(await text(out(id, "note.json"))); setNotes((m) => ({ ...m, [id]: n && n.summary ? n : null })); }
  };
  const feed = async (id: string, n: Note): Promise<boolean> => {   // 뉴스 요약으로 보내기(/api/submit · 요약 요청과 같은 길)
    try {
      const { r, d } = await post("/api/submit", { text: newsText(n) });
      if (!r.ok || d?.error) { setErr(String(d?.error || "뉴스 요약 접수 실패 · HTTP " + r.status)); return false; }
    } catch (e) { setErr(String((e as Error)?.message || e).slice(0, 200)); return false; }
    upd(id, (j) => ({ ...j, fed: true })); setErr(""); return true;
  };
  const ready = tab === "url" ? /^https?:\/\/\S+$/i.test(url.trim()) : tab === "file" ? !!file : txt.trim().length >= 40;
  const mine = new Set(jobs.map((j) => j.id)), others = recent.filter((r) => r && r.id && !mine.has(r.id));

  return (
    <Pane title="미디어 요약">
      <div className="yeta-set mt-2 nm-dl nm-ys">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">자료</span>
          <div className="nm-ys-links" role="group" aria-label="자료 꼴">
            {([["url", "주소"], ["file", "파일"], ["text", "글"]] as const).map(([k, l]) => <button key={k} type="button" className={`go${tab === k ? "" : " gray"}`} aria-pressed={tab === k} onClick={() => { setTab(k); setErr(""); }}>{l}</button>)}
          </div>
          {tab === "url" ? <div className="nm-dl-url"><input type="url" value={url} placeholder="유튜브 영상 · 채널 · 재생목록 주소" aria-label="주소" autoComplete="off" spellCheck={false} onChange={(e) => { setUrl(e.target.value); setErr(""); }} /></div> : null}
          {tab === "file" ? <label className="go nm-ved-file">{file ? file.name : "영상 · 소리 파일 고르기"}<input type="file" accept="video/*,audio/*,.mkv,.avi,.flac" hidden onChange={(e) => pickFile(e.target.files?.[0] || null)} /></label> : null}
          {tab === "text" ? <textarea className="nm-dl-q nm-nb-tx" value={txt} rows={6} maxLength={8000} placeholder="붙여넣을 글(첫 줄 = 제목 · 40자 넘게)" aria-label="글" onChange={(e) => { setTxt(e.target.value); setErr(""); }} /> : null}
          <div className="nm-dl-url">
            <input type="text" value={ask} maxLength={500} placeholder="바라는 점(없어도 돼)" aria-label="바라는 점" onChange={(e) => setAsk(e.target.value)} />
            <button type="button" className={`nm-dl-send${ready && !busy ? " on" : ""}`} disabled={busy || !ready} onClick={() => void go()} aria-label="요약">{busy ? (pct >= 0 ? pct + "%" : "…") : "요약"}</button>
          </div>
          {err ? <p className="nm-chan-msg" role="alert">{err}</p> : null}
        </div>

        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">이 기기에서 한 것</span>
          <p className="nm-dl-sec">이 기기에서 한 것 <i>({jobs.length})</i></p>
          {!jobs.length ? <p className="nm-chan-msg">아직 없습니다</p> : null}
          {jobs.map((j) => {
            const n = notes[j.id];
            return (
              <div key={j.id} className={`nm-dl-job${j.st === "done" || j.st === "list" ? " done" : ""}${j.st === "fail" ? " err" : ""}`}>
                <div className="hd">
                  <button type="button" className="lab nm-ys-lab" onClick={() => void openNote(j.id)} aria-expanded={open === j.id}>{j.lbl || j.id}</button>
                  <span className="st">{j.st === "fail" ? "⚠ 실패" : j.st === "run" ? "정리하는 중… · " + Math.max(1, Math.round((Date.now() - j.t0) / 60e3)) + "분" : j.st === "list" ? "✓ 영상 목록" : "✓ 완료"}</span>
                </div>
                {j.st === "fail" ? <p className="nm-dl-why">{j.msg || "실패"}</p> : null}
                {open === j.id && n && "items" in n ? <ListView l={n as VList} onPick={(u) => { setTab("url"); setUrl(u); }} /> : null}
                {open === j.id && n && "summary" in n ? <NoteView n={n as Note} fed={!!j.fed} onFeed={() => feed(j.id, n as Note)} /> : null}
                {open === j.id && j.st === "done" && !n ? <p className="nm-chan-msg">노트를 읽는 중…</p> : null}
                {j.st !== "run" ? <button type="button" className="go gray" onClick={() => setJobs((a) => { const b = a.filter((x) => x.id !== j.id); save(NB_KEY, b); return b; })}>목록에서 지움</button> : null}
              </div>
            );
          })}
        </div>

        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">최근 자료</span>
          <p className="nm-dl-sec">최근 자료 <i>({others.length})</i></p>
          {!others.length ? <p className="nm-chan-msg">다른 데서 만든 자료가 아직 없습니다</p> : null}
          <div className="nm-q-list" role="list">
            {others.map((r) => (
              <div key={r.id} role="listitem" className="nm-q-row nm-memo-row nm-ys-hist">
                <button type="button" className="qm" onClick={() => void openNote(r.id)} aria-expanded={open === r.id}><i>{r.t || "(무제)"}</i><small>{String(r.ts || "").slice(5, 16).replace("T", " ") + (r.ch ? " · " + r.ch : "") + (r.d ? " · " + mmss(r.d) : "")}</small></button>
                {open === r.id ? (notes[r.id] && "summary" in (notes[r.id] as Note) ? <NoteView n={notes[r.id] as Note} fed={false} onFeed={() => feed(r.id, notes[r.id] as Note)} /> : <p className="nm-chan-msg">{r.id in notes ? "노트를 못 읽었어" : "읽는 중…"}</p>) : null}
              </div>
            ))}
          </div>
          <p className="nm-dl-why">사진 글자 인식 · 기사 참조 = 다음 판(그때까지는 옛 에디터)</p>
        </div>
      </div>
    </Pane>
  );
}

function ListView({ l, onPick }: { l: VList; onPick: (u: string) => void }) {
  return (
    <div className="nm-nb">
      <p className="nm-dl-why">{(l.src?.title || l.src?.channel || "채널") + " · 영상 " + (l.n || l.items.length) + "개 · 최신순 · 골라서 요약"}</p>
      <ol className="nm-ys-steps">{l.items.slice(0, 50).map((v, i) => (
        <li key={i}><button type="button" className="go gray sm" onClick={() => onPick(v.url)}>요약</button> <a href={v.url} target="_blank" rel="noopener">{v.t || "(제목 없음)"}</a>{v.d ? " · " + mmss(v.d) : ""}</li>
      ))}</ol>
    </div>
  );
}

function NoteView({ n, fed, onFeed }: { n: Note; fed: boolean; onFeed: () => Promise<boolean> }) {
  const s = n.src || {}, tx = isTxt(n), lb = tx ? "본문" : "전사", tr = trText(n);
  const [sent, setSent] = useState(fed), [cp, setCp] = useState(false);
  const tl = (t?: number) => (tx || t == null ? "" : " [" + mmss(t) + "]");
  const copy = async () => { try { await navigator.clipboard.writeText(tr); setCp(true); setTimeout(() => setCp(false), 1500); } catch { /* 못 함 */ } };
  return (
    <div className="nm-nb">
      <p className="nm-nb-ttl">{s.title || "(제목 없음)"}</p>
      <p className="nm-dl-why">{[s.channel, s.uploaded, s.dur ? mmss(s.dur) : ""].filter(Boolean).join(" · ")}{s.url ? <> · <a href={s.url} target="_blank" rel="noopener">원본 보기</a></> : null}</p>
      <p className="nm-dl-why">{(n.kind || "일반") + " · " + lb + " 출처: " + (SRC_LB[n.tr_src || ""] || "전사") + (shaky(n) ? " — 고유명사 · 수치 오인식 가능(원문 대조 전 인용 주의)" : "") + ((n.topics || []).length ? " · " + n.topics!.join(" · ") : "")}</p>
      {n.one ? <p className="nm-nb-one">{n.one}</p> : null}
      <p className="nm-nb-h">요약</p><p className="nm-nb-box">{n.summary}</p>
      {(n.points || []).length ? <><p className="nm-nb-h">핵심 논점 <i>{n.points!.length}</i></p><ul>{n.points!.map((p, i) => <li key={i}>{p.c + tl(p.t)}{p.g ? <small><br />근거: {p.g}</small> : null}{p.x ? <small><br />{p.x}</small> : null}</li>)}</ul></> : null}
      {(n.chapters || []).length ? <><p className="nm-nb-h">타임라인</p><ul>{n.chapters!.map((c, i) => <li key={i}>{"[" + mmss(c.t) + "] " + c.h}</li>)}</ul></> : null}
      {(n.quotes || []).length ? <><p className="nm-nb-h">주목 발언</p><ul>{n.quotes!.map((q, i) => <li key={i}>“{q.q}” <small>— {(q.w || "화자 미상") + tl(q.t)}{q.v === false ? " · ⚠ 전사 대조 실패 — 원본 확인" : ""}</small></li>)}</ul></> : null}
      {(n.facts || []).length ? <details><summary>팩트 · 수치 {n.facts!.length}건</summary><ul>{n.facts!.map((f, i) => <li key={i}>{f.f + tl(f.t)}</li>)}</ul></details> : null}
      {(n.terms || []).length ? <details><summary>인물 · 용어 {n.terms!.length}건</summary><ul>{n.terms!.map((t, i) => <li key={i}><b>{t.n}</b> — {t.d}</li>)}</ul></details> : null}
      {(n.use || []).length ? <><p className="nm-nb-h">활용 포인트</p><p className="nm-nb-box">{n.use!.join("\n")}</p></> : null}
      {tr ? <details><summary>전체 {lb} {tr.length.toLocaleString()}자</summary><p className="nm-nb-box">{tr}</p></details> : null}
      <div className="nm-ys-links">
        <button type="button" className="go" disabled={sent} onClick={() => { setSent(true); void onFeed().then((ok) => { if (!ok) setSent(false); }); }}>{sent ? "뉴스 요약 접수됨" : "뉴스 요약으로 보내기"}</button>
        <button type="button" className="go gray" onClick={() => saveFile(noteMd(n), "note_" + (s.yt_id || n.id || "nb") + ".md")}>.md 받기</button>
        {tr ? <button type="button" className="go gray" onClick={() => void copy()}>{cp ? "복사됨" : lb + " 복사"}</button> : null}
      </div>
    </div>
  );
}

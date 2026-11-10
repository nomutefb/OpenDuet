// 서랍 「음원」 판 2(./song.tsx 가 씀) = 옛 에디터 음원 창(viewer/song.html)의 나머지 셋을 앱 안으로
//   (형 11-10 15:48 「응 에디터에 잇는거 다 정원으로 가져왕」 · team-4 뎅 · 봄 18:40 「음원 · 보이스(song)」)
//   ① 길이 + 고급 게이지(보컬 성별 · 실험성 · 장르 충실) = 원본 GAUGE · 중립이면 안 실음(./song-logic.ts gaugeOpts)
//   ② 음성 클로닝 = 원본 vcsec · 학습 POST /api/voice {mode:train} → /voice_out/<id>/voice.json(10초) · 입히기 {mode:apply} → song_out(./song.tsx 가 기다림) · 동의 없인 못 보냄
//   ③ 마스터링 = 원본 masec · 엔진은 사이트 뿌리 /master.js 그대로 불러 씀(사본 0 · 브라우저 로컬 · 돈 0) · 곡은 /api/dl 프록시로 읽음
import { useEffect, useRef, useState } from "react";
import { r2Upload } from "./r2-upload";
import { EQ_PRESETS, FINE, LEN, MACROS, TOGGLES, VOICE_B64_MAX, VOICE_FILE_MAX, deadKey, dlSrc, gaugeLive, hardMs, maDb, notHtml, trainPayload, vocLabel, vocSnap, voiceDone, type Gauge } from "./song-logic";

function Row({ lab, min, max, step, v, txt, on, set, aria }: { lab: string; min: number; max: number; step: number; v: number; txt: string; on: boolean; set: (v: number) => void; aria?: string }) {
  return (
    <label className="nm-song-row">
      <span className="nm-song-k">{lab}</span>
      <input type="range" min={min} max={max} step={step} value={v} aria-label={aria || lab} aria-valuetext={txt} onChange={(e) => set(+e.target.value)} />
      <span className={`nm-song-v${on ? " on" : ""}`} aria-hidden="true">{txt}</span>
    </label>
  );
}

// ── ① 길이 + 고급 ──
export function GaugeBox({ G, set }: { G: Gauge; set: (f: (g: Gauge) => Gauge) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="nm-song-adv">
      <Row lab="길이" min={LEN.min} max={LEN.max} step={LEN.step} v={G.t} txt={`${G.t}초`} on={G.t !== LEN.def} set={(t) => set((g) => ({ ...g, t }))} aria="길이 — 10초부터 60초까지 5초 눈금" />
      <div className="nm-ys-opts"><button type="button" className={`yset-chip${open ? " on" : ""}`} aria-expanded={open} onClick={() => setOpen((v) => !v)}>고급{gaugeLive({ ...G, t: LEN.def }) ? " · 바꿈" : ""}</button></div>
      {open ? (
        <>
          <Row lab="보컬" min={-100} max={100} step={10} v={G.g} txt={vocLabel(G.g)} on={G.g !== 0} set={(v) => set((g) => ({ ...g, g: vocSnap(v) }))} aria="보컬 성별 — 왼쪽 남성 · 가운데 중성(지정 없음) · 오른쪽 여성" />
          <Row lab="실험성" min={0} max={100} step={5} v={G.w} txt={`${G.w}%`} on={G.w !== 50} set={(w) => set((g) => ({ ...g, w }))} aria="실험성 — 0 안전하게 · 50 기본 · 100 파격적으로" />
          <Row lab="장르 충실" min={0} max={100} step={5} v={G.s} txt={`${G.s}%`} on={G.s !== 50} set={(s) => set((g) => ({ ...g, s }))} aria="장르 충실 — 0 느슨하게 · 50 기본 · 100 장르 관습 엄수" />
        </>
      ) : null}
    </div>
  );
}

// ── ② 음성 클로닝 ──
type Voice = { id: string; name?: string };
type VPend = { id: string; t0: number; lbl: string };
const VT = "nm_song_vtrain";
const vtGet = (): VPend | null => { try { return JSON.parse(localStorage.getItem(VT) || "null"); } catch { return null; } };
const vtSet = (p: VPend | null) => { try { if (p) localStorage.setItem(VT, JSON.stringify(p)); else localStorage.removeItem(VT); } catch { /* 이번만 */ } };
async function getText(u: string): Promise<string | null> {
  try { const r = await fetch(`${u}?t=${Date.now()}`, { credentials: "same-origin", cache: "no-store" }); if (!r.ok) return null; const t = await r.text(); return notHtml(t, r.headers.get("content-type") || "") ? t : null; } catch { return null; }
}
const readB64 = (f: File) => new Promise<string>((ok, bad) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => bad(r.error || new Error("읽기 실패")); r.readAsDataURL(f); });

export function VoicePanel({ songUrl, busy, onApply }: { songUrl?: string; busy: boolean; onApply: (vid: string) => void }) {
  const [voices, setVoices] = useState<Voice[]>([]), [vsel, setVsel] = useState(""), [listErr, setListErr] = useState(false);
  const [name, setName] = useState(""), [file, setFile] = useState<File | null>(null), [pct, setPct] = useState(-1), [r2key, setR2key] = useState(""), [consent, setConsent] = useState(false);
  const [tbusy, setTbusy] = useState(false), [training, setTraining] = useState(false), [msg, setMsg] = useState(""), [err, setErr] = useState("");
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const load = async () => {
    const t = await getText("/voice_out/index.json");
    let j: unknown = null; try { j = t ? JSON.parse(t) : null; } catch { /* 아래 */ }
    if (Array.isArray(j)) { setVoices(j as Voice[]); setListErr(false); return j as Voice[]; }
    setListErr(true); return null;
  };
  const poll = async (p: VPend) => {   // 원본 pollVoice — error.log 먼저 · model_url + 발사 뒤 시각 · 10초
    setTraining(true); setMsg("보이스 학습 중… 길면 한 시간 넘게 걸려 · 이 창을 닫아도 다시 열면 이어서 기다려"); setErr("");
    while (alive.current && Date.now() - p.t0 < hardMs("voice-train")) {
      const e = await getText(`/voice_out/${p.id}/error.log`);
      if (!alive.current) return;
      if (e) { vtSet(null); setTraining(false); setMsg(""); setErr(e.trim().slice(0, 300)); return; }
      const t = await getText(`/voice_out/${p.id}/voice.json`);
      if (!alive.current) return;
      let d: { model_url?: string; ts?: string; name?: string } | null = null; try { d = t ? JSON.parse(t) : null; } catch { /* 다음 회차 */ }
      if (voiceDone(d, p.t0 - 90_000)) { vtSet(null); setTraining(false); setMsg(`보이스 학습 완료 — ${d?.name || "보이스"}`); await load(); if (alive.current) setVsel(p.id); return; }
      await new Promise((ok) => setTimeout(ok, 10_000));
    }
    if (alive.current) { vtSet(null); setTraining(false); setMsg(""); setErr("시간 초과 — 완성되면 다음에 열 때 목록에 떠"); }
  };
  useEffect(() => { void load(); const p = vtGet(); if (p?.id && Date.now() - p.t0 < 24 * 3600e3) void poll(p); else if (p) vtSet(null); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const train = async () => {   // 원본 trainGo — R2 먼저 · 안 되면 20MB 까지 b64
    if (!file) { setErr("보이스 소스(1~5분)를 올려줘"); return; }
    if (!consent) { setErr("동의 먼저 — 본인·권리 보유 음성만"); return; }
    if (tbusy || training) return;
    setTbusy(true); setErr("");
    let key = r2key, b64 = "";
    if (!key) {
      try { key = await r2Upload(file, (p) => alive.current && setPct(p)); setR2key(key); }
      catch {
        if (file.size > VOICE_B64_MAX) { setTbusy(false); setPct(-1); setErr("올리기 실패 — 다시(20MB 넘는 파일은 R2 길만)"); return; }
        try { b64 = await readB64(file); } catch { setTbusy(false); setPct(-1); setErr("파일 읽기 실패 — 다시"); return; }
      }
    }
    const pay = trainPayload(name, file.name, key ? { r2key: key } : { fileB64: b64 });
    try {
      const r = await fetch("/api/voice", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(pay) });
      const j = (await r.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!r.ok || j.error || !j.id) { const m = String(j.error || `서버 오류 ${r.status} — 다시`); if (key && deadKey(m)) setR2key(""); throw new Error(m); }
      const p = { id: j.id, t0: Date.now(), lbl: pay.lbl }; vtSet(p); void poll(p);
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { if (alive.current) { setTbusy(false); setPct(-1); } }
  };
  return (
    <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
      <span className="ycd-nm yset-ttl">음성 클로닝</span>
      <div className="nm-ys-opts" role="group" aria-label="보이스">
        <span className="nm-song-k">보이스</span>
        <button type="button" className={`yset-chip${vsel ? "" : " on"}`} aria-pressed={!vsel} onClick={() => setVsel("")}>없음</button>
        {voices.map((v) => <button key={v.id} type="button" className={`yset-chip${vsel === v.id ? " on" : ""}`} aria-pressed={vsel === v.id} onClick={() => setVsel(v.id)}>{v.name || "보이스"}</button>)}
        {listErr ? <button type="button" className="yset-chip" onClick={() => void load()}>목록을 못 불러왔어 · 다시</button> : null}
      </div>
      {vsel && songUrl ? <div className="nm-ys-opts"><button type="button" className="yset-chip on" disabled={busy} onClick={() => onApply(vsel)}>{busy ? "기다리는 중…" : "이 곡에 보이스 입히기"}</button></div> : vsel ? <p className="nm-chan-msg">완성곡을 만들면 이 보이스를 입힐 수 있어</p> : null}
      <div className="nm-ys-opts">
        <span className="nm-song-k">새로</span>
        <input className="nm-dl-q" value={name} maxLength={24} placeholder="보이스 이름" aria-label="보이스 이름" onChange={(e) => setName(e.target.value)} />
        <label className="yset-chip nm-song-file">
          {file ? `${file.name}${pct >= 0 ? ` · ${pct}%` : ""}` : "소스(1~5분 오디오)"}
          <input type="file" accept="audio/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; if (f.size > VOICE_FILE_MAX) { setErr("파일은 2GB까지"); return; } setFile(f); setR2key(""); setPct(-1); setErr(""); }} />
        </label>
      </div>
      <div className="nm-ys-opts">
        <button type="button" className={`yset-chip${consent ? " on" : ""}`} aria-pressed={consent} onClick={() => setConsent((v) => !v)}>동의 — 본인·권리 보유 음성만 (실존 타인 금지)</button>
        <button type="button" className="yset-chip on" disabled={tbusy || training} onClick={() => void train()}>{tbusy ? (pct >= 0 ? `올리는 중 ${pct}%` : "보내는 중…") : training ? "학습 중…" : "보이스 학습"}</button>
      </div>
      {msg ? <p className="nm-chan-msg" role="status">{msg}</p> : null}
      {err ? <p className="nm-chan-msg" role="alert">{err}</p> : null}
    </div>
  );
}

// ── ③ 마스터링(엔진 = /master.js 전역 함수) ──
type MA = { eqBands: number[]; sampleRate: number; bitDepth: number; [k: string]: unknown };
type MaRes = { buffer: AudioBuffer; before: { integratedLUFS: number }; after: { integratedLUFS: number }; truePeakDB: number };
type MaWin = Window & {
  nmMaster?: (b: AudioBuffer, o: MA, step?: (m: string) => void) => Promise<MaRes>;
  nmEncodeWAV?: (b: AudioBuffer, bd: number) => Blob;
  nmMaDefaults?: () => MA;
  nmMaBands?: () => { f: number; label: string }[];
  nmMaResolve?: (o: MA) => number[];
  nmEqCurve?: (bands: number[], w: number, h: number, db: number) => string;
  webkitAudioContext?: typeof AudioContext;
};
const W = () => window as MaWin;
let maLoading: Promise<boolean> | null = null;
function loadMaster(): Promise<boolean> {
  if (W().nmMaster) return Promise.resolve(true);
  if (!maLoading) maLoading = new Promise((ok) => {
    const s = document.createElement("script"); s.src = "/master.js"; s.async = true;
    s.onload = () => ok(!!W().nmMaster); s.onerror = () => { maLoading = null; ok(false); };
    document.head.appendChild(s);
  });
  return maLoading;
}

export function MasterPanel({ url, songId }: { url: string; songId: string }) {
  const [open, setOpen] = useState(false), [ready, setReady] = useState(false), [loadErr, setLoadErr] = useState(""), [ma, setMa] = useState<MA | null>(null), [pre, setPre] = useState("flat");
  const [fine, setFine] = useState(false), [eq, setEq] = useState(false), [busy, setBusy] = useState(false), [step, setStep] = useState(""), [out, setOut] = useState(""), [met, setMet] = useState(""), [err, setErr] = useState("");
  const buf = useRef<{ u: string; b: AudioBuffer } | null>(null), outRef = useRef("");
  useEffect(() => () => { if (outRef.current) URL.revokeObjectURL(outRef.current); }, []);
  useEffect(() => { if (outRef.current) URL.revokeObjectURL(outRef.current); outRef.current = ""; setOut(""); setMet(""); }, [url]);
  const openUp = async () => {
    const o = !open; setOpen(o);
    if (!o || ready) return;
    const ok = await loadMaster();
    if (!ok) { setLoadErr("마스터링 엔진(/master.js)을 못 불러왔어 — 다시 열어 줘"); setOpen(false); return; }
    setMa(W().nmMaDefaults!()); setReady(true); setLoadErr("");
  };
  const put = (k: string, v: unknown, custom = false) => { setMa((m) => (m ? { ...m, [k]: v } : m)); if (custom) setPre(""); };
  const band = (i: number, v: number) => setMa((m) => { if (!m) return m; const b = m.eqBands.slice(); b[i] = v; return { ...m, eqBands: b }; });
  const run = async () => {   // 원본 maGo — 곡 읽기 → nmMaster(2패스 정규화 + 리미터) → WAV
    if (!ma || busy) return;
    setBusy(true); setErr(""); setMet("");
    try {
      setStep("곡 읽는 중");
      let b = buf.current?.u === url ? buf.current.b : null;
      if (!b) {
        const r = await fetch(dlSrc(url), { credentials: "same-origin" });
        if (!r.ok) throw new Error(`곡을 못 불러왔어 (${r.status})`);
        const ab = await r.arrayBuffer(), AC = window.AudioContext || W().webkitAudioContext!, ctx = new AC();
        try { b = await ctx.decodeAudioData(ab); } finally { void ctx.close().catch(() => {}); }
        buf.current = { u: url, b };
      }
      const res = await W().nmMaster!(b, ma, (m) => setStep(String(m)));
      if (outRef.current) URL.revokeObjectURL(outRef.current);
      outRef.current = URL.createObjectURL(W().nmEncodeWAV!(res.buffer, ma.bitDepth)); setOut(outRef.current);
      setMet(`다듬기 전 ${maDb(res.before.integratedLUFS)} LUFS · 후 ${maDb(res.after.integratedLUFS)} LUFS · 트루피크 ${maDb(res.truePeakDB)} dBTP · ${ma.sampleRate / 1000}kHz ${ma.bitDepth}bit`);
    } catch (e) { setErr(e instanceof Error ? e.message : "다듬기 실패"); }
    finally { setBusy(false); setStep(""); }
  };
  const save = () => { if (!out) return; const a = document.createElement("a"); a.href = out; a.download = `song_${songId || Date.now()}_master.wav`; document.body.appendChild(a); a.click(); a.remove(); };
  let curve = "M0 44H320";
  if (ma && eq) { try { curve = W().nmEqCurve!(W().nmMaResolve?.(ma) || ma.eqBands, 320, 88, 15); } catch { /* 평평하게 */ } }
  return (
    <div className="nm-song-ma">
      <div className="nm-ys-opts"><button type="button" className={`yset-chip${open ? " on" : ""}`} aria-expanded={open} onClick={() => void openUp()}>마스터링 {open ? "닫기" : "열기"}</button></div>
      {loadErr ? <p className="nm-chan-msg" role="alert">{loadErr}</p> : null}
      {open && ma ? (
        <>
          <div className="nm-ys-opts" role="group" aria-label="프리셋">
            {EQ_PRESETS.map(([k, lab, v]) => <button key={k} type="button" className={`yset-chip${pre === k ? " on" : ""}`} aria-pressed={pre === k} onClick={() => { setPre(k); setMa((m) => (m ? { ...m, eqBands: v.slice() } : m)); }}>{lab}</button>)}
          </div>
          {MACROS.map(([k, lab]) => <Row key={k} lab={lab} min={0} max={5} step={1} v={Number(ma[k]) || 0} txt={String(Number(ma[k]) || 0)} on={!!ma[k]} set={(v) => put(k, v, true)} aria={`${lab} — 0 안 함 · 5 가장 세게`} />)}
          <div className="nm-ys-opts">
            <button type="button" className={`yset-chip${fine ? " on" : ""}`} aria-expanded={fine} onClick={() => setFine((v) => !v)}>세부 조정</button>
            <button type="button" className={`yset-chip${eq ? " on" : ""}`} aria-expanded={eq} onClick={() => setEq((v) => !v)}>이퀄라이저</button>
          </div>
          {fine ? (
            <>
              {FINE.map((f) => <Row key={f.k} lab={f.lab} min={f.min} max={f.max} step={f.step} v={Number(ma[f.k])} txt={f.fmt(Number(ma[f.k]))} on={ma[f.k] !== W().nmMaDefaults!()[f.k]} set={(v) => put(f.k, v)} />)}
              <div className="nm-ys-opts" role="group" aria-label="처리">
                {TOGGLES.map(([k, lab]) => <button key={k} type="button" className={`yset-chip${ma[k] ? " on" : ""}`} aria-pressed={!!ma[k]} onClick={() => put(k, !ma[k])}>{lab}</button>)}
              </div>
              <div className="nm-ys-opts" role="group" aria-label="저장 꼴">
                {[44100, 48000].map((sr) => <button key={sr} type="button" className={`yset-chip${ma.sampleRate === sr ? " on" : ""}`} aria-pressed={ma.sampleRate === sr} onClick={() => put("sampleRate", sr)}>{sr / 1000}kHz</button>)}
                {[16, 24].map((bd) => <button key={bd} type="button" className={`yset-chip${ma.bitDepth === bd ? " on" : ""}`} aria-pressed={ma.bitDepth === bd} onClick={() => put("bitDepth", bd)}>{bd}bit</button>)}
              </div>
            </>
          ) : null}
          {eq ? (
            <>
              <svg className="nm-song-eqg" viewBox="0 0 320 88" preserveAspectRatio="none" role="img" aria-label="이퀄라이저 응답 곡선"><path className="z" d="M0 44H320" /><path d={curve} /></svg>
              {(W().nmMaBands?.() || []).map((b, i) => <Row key={b.f} lab={b.label} min={-12} max={12} step={0.5} v={ma.eqBands[i] || 0} txt={`${(ma.eqBands[i] || 0) > 0 ? "+" : ""}${(ma.eqBands[i] || 0).toFixed(1)}`} on={!!ma.eqBands[i]} set={(v) => { band(i, v); setPre(""); }} aria={`${b.label}헤르츠 대역 — 데시벨`} />)}
            </>
          ) : null}
          <div className="nm-ys-opts">
            <button type="button" className="yset-chip on" disabled={busy} aria-busy={busy} onClick={() => void run()}>{busy ? step || "다듬는 중…" : "다듬어 듣기"}</button>
            <button type="button" className="yset-chip" disabled={!out || busy} onClick={save}>WAV 저장</button>
          </div>
          {out ? <audio src={out} controls autoPlay style={{ width: "100%" }} /> : null}
          {met ? <p className="nm-chan-msg">{met}</p> : null}
          {err ? <p className="nm-chan-msg" role="alert">{err}</p> : null}
        </>
      ) : null}
    </div>
  );
}

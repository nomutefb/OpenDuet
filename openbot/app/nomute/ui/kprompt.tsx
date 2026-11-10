// 서랍 「프롬프팅」 = 옛 에디터 영상 프롬프트 창(viewer/k.html · api/k → 즉답 md 또는 러너 → k_out/<id>/prompt.md)을 앱 안으로
//   (봄 11-10 23:09 봄바람 「번개 = 번역카드 · 프롬프팅」 · 형 14:23 봄 1:1 「응 밖에잇는거 다 옮길거야」 · 번개)
//   같은 것 = 장면(≤8000) · 모델(Kling 4.0 기본 · 3.0 Omni) · 길이(모델별 프리셋) · 오디오(대사 삽입 = 대사 ≤300) · 네거티브 일곱 · 참조 이미지 생성(Gemini · 다장)
//            · 서버 칸 이름 그대로({scene, refimage, refmulti, reroll, lbl, model, set, dial, seg}) · 기다리는 길(error.log 먼저 → prompt.md · SPA HTML 은 끝으로 안 봄)
//            · 결과 = 코드 칸마다 복사(원본 renderMd 꼴) · 다시 뽑기 축 넷(카메라 · 조명 · 액션 · 오디오 = 참조 생성 끔) · 작업 내역(/k-hist.json)
//   다른 것(다음 판) = 장면 분막(seg) · 길이 「직접」 게이지 · 붙여넣기 단추 · 진행 중 여러 줄(병렬)
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./dl.css";
import "./ys.css";
import "./song.css";
import "./kprompt.css";
import { useEffect, useRef, useState } from "react";
import { Pane } from "./pane";

type Model = "kling4" | "kling";
const MODELS: { id: Model; nm: string; len: number[] }[] = [   // 원본 K_MODELS · K_LEN(kling 3~15s · kling4 3~30s) · 기본 = 4.0(운영자 261021)
  { id: "kling4", nm: "Kling 4.0", len: [10, 15, 20, 30] },
  { id: "kling", nm: "Kling 3.0 Omni", len: [8, 10, 15] },
];
const AUDIO = ["의성어만", "대사 삽입", "음악 무드"];   // 원본 K_VALS 오디오
const NEG = ["AI 티 제거", "손 왜곡 방지", "얼굴 유지", "글자 왜곡 방지", "과장 미소 방지", "배경 고정", "워터마크 방지"];   // 원본 K_VALS 네거티브
const REROLL = ["카메라", "조명", "액션", "오디오"];   // api/k.js REROLL_AXES
const PEND = "nm_k_pend", LAST = "nm_k_last", DRAFT = "nm_k_draft", POLL_MS = 5_000, BUDGET_MS = 1800_000;   // 원본 budget 1800초 = 잡 상한 30분
type Pend = { out: string; ref: string; t0: number; lbl: string };
type Hist = { id?: string; out?: string; t?: string; ts?: number };
const ls = { get<T>(k: string): T | null { try { return JSON.parse(localStorage.getItem(k) || "null") as T; } catch { return null; } }, set(k: string, v: unknown) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch { /* 이번만 */ } } };
const abs = (p: string) => (p.startsWith("/") ? p : "/" + p);
const isHtml = (t: string) => /^\s*<!doctype/i.test(t) || /<html[\s>]/i.test(t.slice(0, 300)) || /^\s*</.test(t);
async function getText(p: string): Promise<string> {   // 아직 없으면 SPA 가 index.html(200)을 줌 → 빈 값
  try { const r = await fetch(`${abs(p)}?t=${Date.now()}`, { credentials: "same-origin" }); if (!r.ok) return ""; const t = await r.text(); return t && t.trim() && !isHtml(t) ? t : ""; } catch { return ""; }
}
async function copyText(t: string) { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } }

type Blk = { k: "h1" | "h2" | "h3" | "p" | "code"; t: string };
function parseMd(md: string): Blk[] {   // 원본 renderMd = ``` 칸은 코드(인포 줄 뺌) · # ## ### · 표 줄은 「 · 」로 · **굵게** 걷음
  const parts = md.split("```"), unbal = parts.length % 2 === 0, out: Blk[] = [];
  parts.forEach((part, i) => {
    if (i % 2 === 1 && !(unbal && i === parts.length - 1)) {
      let code = part; const nl = code.indexOf("\n"), first = nl >= 0 ? code.slice(0, nl).trim() : "";
      if (nl >= 0 && (first === "" || (first.length <= 24 && /^[a-zA-Z][a-zA-Z0-9 .:+_-]*$/.test(first)))) code = code.slice(nl + 1);
      out.push({ k: "code", t: code.replace(/\s+$/, "") });
      return;
    }
    part.split("\n").forEach((line) => {
      const t = line.trim(); if (!t) return;
      if (t.startsWith("### ")) out.push({ k: "h3", t: t.slice(4) });
      else if (t.startsWith("## ")) out.push({ k: "h2", t: t.slice(3) });
      else if (t.startsWith("# ")) out.push({ k: "h1", t: t.slice(2) });
      else out.push({ k: "p", t: (/^\|.*\|$/.test(t) ? t.replace(/^\||\|$/g, "").split("|").map((s) => s.trim()).filter(Boolean).join(" · ") : t).replace(/\*\*([^*]+)\*\*/g, "$1") });
    });
  });
  return out;
}

export function KPromptModal() {
  const d0 = ls.get<{ scene?: string; model?: Model; len?: number; audio?: string; dial?: string; neg?: string[]; ref?: boolean }>(DRAFT) || {};
  const [scene, setScene] = useState(d0.scene || ""), [model, setModel] = useState<Model>(d0.model === "kling" ? "kling" : "kling4"), [len, setLen] = useState<number>(d0.len || 0);
  const [audio, setAudio] = useState(AUDIO.includes(d0.audio || "") ? d0.audio! : ""), [dial, setDial] = useState(d0.dial || ""), [neg, setNeg] = useState<string[]>((d0.neg || []).filter((x) => NEG.includes(x)));
  const [refimg, setRefimg] = useState(d0.ref !== false), [multi, setMulti] = useState(false);   // 원본 = 참조 생성 기본 켬(운영자 260711 refimgDef=on)
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(""), [err, setErr] = useState(""), [md, setMd] = useState(""), [refs, setRefs] = useState<string[]>([]), [hist, setHist] = useState<Hist[]>([]);
  const alive = useRef(true), lastRef = useRef("");
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { ls.set(DRAFT, { scene, model, len, audio, dial, neg, ref: refimg }); }, [scene, model, len, audio, dial, neg, refimg]);
  const lens = MODELS.find((m) => m.id === model)!.len;
  useEffect(() => { if (len && !lens.includes(len)) setLen(0); }, [model]);   // eslint-disable-line react-hooks/exhaustive-deps
  const loadRefs = async (ref: string) => {   // 원본 renderOut = ref.json(urls 다장 · url 단수) 먼저 · 없으면 ref.jpg
    if (!ref) { setRefs([]); return; }
    const j = await getText(ref.replace(/ref\.jpg$/, "ref.json"));
    let u: string[] = [];
    try { const o = j ? (JSON.parse(j) as { urls?: string[]; url?: string }) : null; u = o?.urls?.length ? o.urls.filter(Boolean) : o?.url ? [o.url] : []; } catch { /* 없음 */ }
    if (alive.current) setRefs(u.length ? u : [abs(ref)]);
  };
  const show = async (text: string, ref: string, note: string) => { setMd(text); setMsg(note); lastRef.current = ref || lastRef.current; await loadRefs(ref); };
  const poll = async (p: Pend) => {
    setBusy(true); setErr(""); setMsg("만드는 중…");
    const errPath = p.out.replace(/[^/]+$/, "error.log");
    while (alive.current && Date.now() - p.t0 < BUDGET_MS) {
      const e = await getText(errPath);
      if (!alive.current) return;
      if (e) { ls.set(PEND, null); setBusy(false); setMsg(""); setErr(e.trim().slice(0, 200)); return; }
      const t = await getText(p.out);
      if (!alive.current) return;
      if (t) { ls.set(PEND, null); ls.set(LAST, { out: p.out, ref: p.ref, ts: Date.now() }); setBusy(false); await show(t, p.ref, `완료 (${Math.round((Date.now() - p.t0) / 1000)}초)`); void loadHist(); return; }
      setMsg(`만드는 중… ${Math.round((Date.now() - p.t0) / 1000)}초 · 이 창을 닫아도 다시 열면 이어서 기다려`);
      await new Promise((ok) => setTimeout(ok, POLL_MS));
    }
    if (alive.current) { ls.set(PEND, null); setBusy(false); setMsg(""); setErr("표시 시간 초과 — 생성은 계속 돌고 있을 수 있어. 잠시 뒤 작업 내역에서 열어 봐"); }
  };
  const loadHist = async () => {
    const t = await getText("/k-hist.json");
    try { const a = t ? (JSON.parse(t) as Hist[]) : []; if (alive.current && Array.isArray(a)) setHist(a.filter((s) => s && s.id && /^[A-Za-z0-9_-]+$/.test(s.id) && /^k_out\/[A-Za-z0-9_-]+\/prompt\.md$/.test(s.out || "")).slice(0, 30)); } catch { /* 없음 */ }
  };
  useEffect(() => {
    void loadHist();
    const p = ls.get<Pend>(PEND);
    if (p?.out) { void poll(p); return; }
    const l = ls.get<{ out?: string; md?: string; ref?: string; ts?: number }>(LAST);   // 재열람(원본 LKEY · 24시간)
    if (l && Date.now() - (l.ts || 0) < 86_400_000) { if (l.md) void show(l.md, l.ref || "", "지난 결과"); else if (l.out) void getText(l.out).then((t) => { if (t) void show(t, l.ref || "", "지난 결과"); }); }
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const fire = async (reroll = "") => {   // 원본 #go.onclick
    const s = scene.trim();
    if (!s) { setErr("장면을 적어 줘"); return; }
    if (busy) return;
    const ln = (s.split("\n").find((x) => x.trim()) || "").replace(/\s+/g, " ").trim(), lbl = ln ? ln.slice(0, 16) + (ln.length > 16 ? "…" : "") : "프롬프트";
    const ri = !reroll && refimg, set: Record<string, unknown> = { 네거티브: neg };
    if (len) set["길이"] = `${len}s`;
    if (audio) set["오디오"] = audio;
    const body = { scene: s.slice(0, 8000), refimage: ri, refmulti: ri && multi, reroll, lbl, model, set, dial: audio === "대사 삽입" ? dial.trim().slice(0, 300) : "", seg: [] };
    setBusy(true); setErr(""); setMd(""); setRefs([]); setMsg("보내는 중…");
    try {
      const r = await fetch("/api/k", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = (await r.json().catch(() => ({}))) as { md?: string; out?: string; ref?: string; refimage?: boolean; error?: string };
      if (!r.ok || j.error) throw new Error(String(j.error || `서버 오류 ${r.status}`));
      const ref = reroll ? lastRef.current : j.refimage && j.ref ? j.ref : "";
      if (j.md) { setBusy(false); ls.set(LAST, { md: j.md, ref, ts: Date.now() }); await show(j.md, ref, "완료 (즉답)"); return; }
      if (!j.out) throw new Error("서버 답에 결과 자리가 없어 — 다시");
      const p: Pend = { out: abs(j.out), ref: ref ? abs(ref) : "", t0: Date.now(), lbl }; ls.set(PEND, p); void poll(p);
    } catch (e) { setBusy(false); setMsg(""); setErr(e instanceof Error ? e.message : String(e)); }
  };
  const blocks = md ? parseMd(md) : [];
  const chip = (on: boolean) => `yset-chip${on ? " on" : ""}`;
  return (
    <Pane title="프롬프팅">
      <div className="yeta-set mt-2 nm-dl nm-ys nm-kp">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">장면</span>
          <textarea className="nm-ys-ask" rows={5} maxLength={8000} value={scene} placeholder="스토리 · 상황 — 이걸로 영상 프롬프트를 만들어" aria-label="장면" onChange={(e) => { setScene(e.target.value); setErr(""); }} />
          <div className="nm-ys-opts" role="group" aria-label="비디오 모델"><span className="nm-song-k">모델</span>
            {MODELS.map((m) => <button key={m.id} type="button" className={chip(model === m.id)} aria-pressed={model === m.id} onClick={() => setModel(m.id)}>{m.nm}</button>)}
          </div>
          <div className="nm-ys-opts" role="group" aria-label="길이"><span className="nm-song-k">길이</span>
            {[0, ...lens].map((n) => <button key={n} type="button" className={chip(len === n)} aria-pressed={len === n} onClick={() => setLen(n)}>{n ? `${n}초` : "자동"}</button>)}
          </div>
          <div className="nm-ys-opts" role="group" aria-label="오디오"><span className="nm-song-k">오디오</span>
            {["", ...AUDIO].map((v) => <button key={v || "auto"} type="button" className={chip(audio === v)} aria-pressed={audio === v} onClick={() => setAudio(v)}>{v || "자동"}</button>)}
            {audio === "대사 삽입" ? <input className="nm-dl-q" maxLength={300} value={dial} placeholder="대사(300자)" aria-label="대사" onChange={(e) => setDial(e.target.value)} /> : null}
          </div>
          <div className="nm-ys-opts" role="group" aria-label="네거티브"><span className="nm-song-k">네거티브</span>
            {NEG.map((v) => { const on = neg.includes(v); return <button key={v} type="button" className={chip(on)} aria-pressed={on} onClick={() => setNeg((a) => (on ? a.filter((x) => x !== v) : [...a, v]))}>{v}</button>; })}
          </div>
          <div className="nm-ys-opts" role="group" aria-label="참조 이미지"><span className="nm-song-k">참조</span>
            <button type="button" className={chip(refimg)} aria-pressed={refimg} onClick={() => setRefimg((v) => !v)}>참조 이미지 생성 · Gemini</button>
            {refimg ? <button type="button" className={chip(multi)} aria-pressed={multi} onClick={() => setMulti((v) => !v)}>다장(인물 · 배경별 · 장수만큼 과금)</button> : null}
          </div>
          <div className="nm-ys-opts">
            <button type="button" className="yset-chip on" disabled={busy} onClick={() => void fire()}>{busy ? "만드는 중…" : "프롬프트 만들기"}</button>
          </div>
          {msg ? <p className="nm-chan-msg" role="status">{msg}</p> : null}
          {err ? <p className="nm-chan-msg" role="alert">{err}</p> : null}
        </div>
        {blocks.length ? (
          <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo nm-kp-out">
            <div className="nm-ys-opts">
              <button type="button" className="yset-chip" onClick={async () => setMsg((await copyText(md)) ? "전체 복사했어" : "복사 못 했어")}>전체 복사</button>
              <span className="nm-song-k">다시 뽑기</span>
              {REROLL.map((a) => <button key={a} type="button" className="yset-chip" disabled={busy} title={`${a}만 다른 안으로`} onClick={() => void fire(a)}>{a}</button>)}
            </div>
            {blocks.map((b, i) => b.k === "code"
              ? <div key={i} className="nm-kp-code"><pre>{b.t}</pre><button type="button" className="yset-chip" onClick={async () => setMsg((await copyText(b.t)) ? "복사했어" : "복사 못 했어")}>복사</button></div>
              : b.k === "p" ? <p key={i}>{b.t}</p> : b.k === "h1" ? <h3 key={i} className="nm-kp-h1">{b.t}</h3> : b.k === "h2" ? <h4 key={i} className="nm-kp-h2">{b.t}</h4> : <h5 key={i} className="nm-kp-h3">{b.t}</h5>)}
            {refs.length ? <div className="nm-kp-refs">{refs.map((u, i) => <a key={i} href={u} target="_blank" rel="noreferrer"><img src={u} alt={`레퍼런스 ${i + 1}`} loading="lazy" /></a>)}</div> : null}
          </div>
        ) : null}
        {hist.length ? (
          <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
            <span className="ycd-nm yset-ttl">작업 내역 · 누르면 그 결과를 열어</span>
            {hist.map((h) => { const d = new Date(h.ts || 0), p2 = (n: number) => String(n).padStart(2, "0"); return (
              <button key={h.id} type="button" className="nm-song-opt" disabled={busy} onClick={async () => { const t = await getText(h.out!); if (t) { setErr(""); await show(t, "", `지난 결과 · ${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`); } }}>
                <b>{(h.t || "프롬프트").slice(0, 24)}</b><span>{`${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`}</span>
              </button>); })}
          </div>
        ) : null}
      </div>
    </Pane>
  );
}

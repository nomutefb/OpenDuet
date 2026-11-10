// 서랍 「변환」 = 옛 에디터 변환 창(viewer/conv.html · api/conv → 러너 → conv_out/<id>/video.json)을 앱 안으로
//   (형 11-10 14:23 봄 1:1 「응 밖에잇는거 다 옮길거야」 · team-4 U3 뎅 · SNS 영상 받기도 같은 길)
//   같은 것 = 넣는 것(영상 주소 또는 파일) · 고르는 칸(비율 · 채움 · 위치 · 해상도 · fps · 화질 · 소리 · 구간) · 서버 칸 이름 · 기다리는 길(video.json · error.log) · 진행 기억 열쇠(nm_conv_pend = 에디터와 같이)
//   다른 것 = 파일은 30MB 까지(원본 R2 직업로드 길은 다음 판 · 넘으면 「주소로」) · 위치 미리보기 · 장면 고르기 그림판은 없음(위치 = 슬라이더 숫자)
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./dl.css";
import "./ys.css";
import { useEffect, useRef, useState } from "react";
import { Pane } from "./pane";

type Opts = { fps: string; ar: string; fit: string; pos: number; res: string; q: string; audio: string };
const OPT0: Opts = { fps: "keep", ar: "orig", fit: "crop", pos: 50, res: "orig", q: "18", audio: "keep" };   // 원본 OPT 기본값
const PICK: { k: keyof Opts; lab: string; vals: [string, string][] }[] = [   // 서버 화이트리스트(functions/api/conv.js) 그대로
  { k: "ar", lab: "비율", vals: [["orig", "원본"], ["9:16", "9:16"], ["1:1", "1:1"], ["4:5", "4:5"], ["16:9", "16:9"]] },
  { k: "fit", lab: "채움", vals: [["crop", "자르기"], ["pad", "검정 여백"]] },
  { k: "res", lab: "해상도", vals: [["orig", "원본"], ["1440", "1440"], ["1080", "1080"], ["720", "720"]] },
  { k: "fps", lab: "fps", vals: [["keep", "그대로"], ["60i", "60"], ["30", "30"], ["24", "24"]] },
  { k: "q", lab: "화질", vals: [["18", "높음"], ["21", "보통(−25%)"], ["24", "작게(−45%)"]] },
  { k: "audio", lab: "소리", vals: [["keep", "그대로"], ["norm", "음량 통일"]] },
];
const PEND = "nm_conv_pend", POLL_MS = 10_000, BUDGET_MS = 1900_000, FILE_MAX = 30 * 1024 * 1024;   // 원본 PEND_KEY · BUDGET 1900초
type Pend = { id: string; at: number; label: string };
type St = { k: "idle" | "send" | "wait" | "done" | "err"; msg?: string; url?: string; id?: string };
const pendGet = (): Pend | null => { try { return JSON.parse(localStorage.getItem(PEND) || "null"); } catch { return null; } };
const pendSet = (p: Pend | null) => { try { if (p) localStorage.setItem(PEND, JSON.stringify(p)); else localStorage.removeItem(PEND); } catch { /* 이번만 */ } };
const b64Of = (f: File) => new Promise<string>((res, rej) => { const rd = new FileReader(); rd.onload = () => res(String(rd.result || "").replace(/^data:[^,]*,/, "")); rd.onerror = () => rej(new Error("파일을 못 읽었어")); rd.readAsDataURL(f); });
async function readOut(id: string): Promise<{ url?: string; err?: string } | null> {   // 원본 = conv_out/<id>/video.json(url 있으면 끝) · error.log(있으면 실패)
  try {
    const r = await fetch(`/conv_out/${id}/video.json?t=${Date.now()}`, { credentials: "same-origin" });
    if (r.ok) { const t = await r.text(); if (t && !/^\s*</.test(t)) { const d = JSON.parse(t) as { url?: string }; if (d?.url) return { url: d.url }; } }
    const e = await fetch(`/conv_out/${id}/error.log?t=${Date.now()}`, { credentials: "same-origin" });
    if (e.ok) { const t = await e.text(); if (t.trim() && !/^\s*</.test(t)) return { err: t.trim().slice(0, 160) }; }
  } catch { /* 다음 회차 */ }
  return null;
}

export function ConvModal() {
  // SNS 카드 「받기」 = #/edconv?u=<영상 주소>(./trend.tsx) → 주소 칸 미리 채움
  const [url, setUrl] = useState(() => { try { return new URLSearchParams(window.location.hash.split("?")[1] || "").get("u") || ""; } catch { return ""; } }), [file, setFile] = useState<File | null>(null), [o, setO] = useState<Opts>(OPT0), [t0, setT0] = useState(""), [t1, setT1] = useState("");
  const [st, setSt] = useState<St>({ k: "idle" }), alive = useRef(true), fileIn = useRef<HTMLInputElement>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const poll = async (p: Pend) => {   // 진행 중 변환 이어받기(원본 pend 재개 · 다시 열어도 이어짐)
    setSt({ k: "wait", id: p.id, msg: `${p.label} 변환 중…` });
    while (alive.current && Date.now() - p.at < BUDGET_MS) {
      const r = await readOut(p.id);
      if (!alive.current) return;
      if (r?.url) { pendSet(null); setSt({ k: "done", url: r.url, id: p.id }); return; }
      if (r?.err) { pendSet(null); setSt({ k: "err", msg: r.err }); return; }
      await new Promise((res) => setTimeout(res, POLL_MS));
    }
    if (alive.current) { pendSet(null); setSt({ k: "err", msg: "30분 넘게 결과가 안 왔어 — 다시 해 줘" }); }
  };
  useEffect(() => { const p = pendGet(); if (p?.id) void poll(p); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const okUrl = /^https?:\/\//i.test(url.trim()), ready = (okUrl || !!file) && st.k !== "send" && st.k !== "wait";
  const go = async () => {
    if (!ready) return;
    const a = parseFloat(t0), b = parseFloat(t1);
    if (Number.isFinite(a) && Number.isFinite(b) && b <= a) { setSt({ k: "err", msg: "구간이 이상해 — 끝이 시작보다 커야 해" }); return; }
    if (file && file.size > FILE_MAX) { setSt({ k: "err", msg: "30MB 넘는 파일은 아직 여기서 못 올려 — 영상 주소로 넣어 줘" }); return; }
    setSt({ k: "send" });
    try {
      const opts: Record<string, unknown> = { ...o, pos: o.pos / 100, ...(Number.isFinite(a) && a > 0 ? { t0: a } : {}), ...(Number.isFinite(b) && b > 0 ? { t1: b } : {}) };
      const body = file ? { fileB64: await b64Of(file), name: file.name, opts } : { url: url.trim(), opts };
      const r = await fetch("/api/conv", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const d = (await r.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string };
      if (!r.ok || !d.ok || !d.id) throw new Error(d.error || `서버 ${r.status}`);
      const p = { id: d.id, at: Date.now(), label: file ? file.name : "영상" }; pendSet(p); void poll(p);
    } catch (e) { setSt({ k: "err", msg: e instanceof Error ? e.message : String(e) }); }
  };
  const save = () => { if (!st.url) return; const n = `conv_${st.id || Date.now()}.mp4`; window.open(`/api/dl?u=${encodeURIComponent(st.url)}&n=${encodeURIComponent(n)}`, "_blank"); };
  return (
    <Pane title="변환">
      <div className="yeta-set mt-2 nm-dl nm-ys">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">영상</span>
          <div className="nm-dl-url">
            <input type="url" value={url} placeholder="https://… (영상 주소)" aria-label="영상 주소" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} disabled={!!file}
              onChange={(e) => { setUrl(e.target.value); if (st.k === "err") setSt({ k: "idle" }); }} onKeyDown={(e) => { if (e.key === "Enter") void go(); }} />
            <button type="button" className={`nm-dl-send${ready ? " on" : ""}`} disabled={!ready} onClick={() => void go()} aria-label="변환">{st.k === "send" ? "…" : "변환"}</button>
          </div>
          <div className="nm-ys-opts">
            <input ref={fileIn} type="file" accept="video/*" hidden onChange={(e) => { setFile(e.target.files?.[0] || null); e.target.value = ""; }} />
            <button type="button" className="yset-chip" onClick={() => fileIn.current?.click()}>{file ? `파일 · ${file.name}` : "파일 고르기(30MB 까지)"}</button>
            {file ? <button type="button" className="yset-chip" onClick={() => setFile(null)}>파일 빼기</button> : null}
          </div>
          <div className="nm-ys-opts">
            {PICK.map((p) => (
              <label key={p.k} className="nm-ys-opt"><span>{p.lab}</span>
                <select className="nm-dl-q" value={String(o[p.k])} aria-label={p.lab} onChange={(e) => setO((v) => ({ ...v, [p.k]: e.target.value }))}>
                  {p.vals.map(([v, lab]) => <option key={v} value={v}>{lab}</option>)}
                </select>
              </label>
            ))}
            {o.ar !== "orig" && o.fit === "crop" ? <label className="nm-ys-opt"><span>위치 {o.pos}</span><input type="range" min={0} max={100} step={1} value={o.pos} aria-label="자르는 위치 — 0 왼쪽·위 · 50 가운데 · 100 오른쪽·아래" onChange={(e) => setO((v) => ({ ...v, pos: +e.target.value }))} /></label> : null}
            <label className="nm-ys-opt"><span>시작 초</span><input className="nm-dl-q" type="number" min={0} step={0.1} inputMode="decimal" placeholder="0" value={t0} onChange={(e) => setT0(e.target.value)} /></label>
            <label className="nm-ys-opt"><span>끝 초</span><input className="nm-dl-q" type="number" min={0} step={0.1} inputMode="decimal" placeholder="끝" value={t1} onChange={(e) => setT1(e.target.value)} /></label>
          </div>
          {st.k === "wait" ? <p className="nm-chan-msg" role="status">{st.msg} · 길면 몇 분 걸려 · 이 창을 닫아도 다시 열면 이어서 기다려</p> : null}
          {st.k === "err" ? <p className="nm-chan-msg" role="alert">{st.msg}</p> : null}
        </div>
        {st.k === "done" && st.url ? (
          <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
            <span className="ycd-nm yset-ttl">결과</span>
            <video src={st.url} controls playsInline preload="metadata" style={{ width: "100%", maxHeight: "60dvh", background: "#000", borderRadius: 10 }} />
            <div className="nm-ys-opts"><button type="button" className="yset-chip on" onClick={save}>받기</button><button type="button" className="yset-chip" onClick={() => setSt({ k: "idle" })}>새로 하기</button></div>
          </div>
        ) : null}
      </div>
    </Pane>
  );
}

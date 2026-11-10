// 서랍 「번역카드」 = 옛 에디터 번역 창(viewer/tr.html · api/tr → 즉답 plan 또는 러너 → tr_out/<id>/plan.json)을 앱 안으로
//   (봄 11-10 23:09 봄바람 「번개 = 번역카드 · 프롬프팅」 · 형 14:23 봄 1:1 「응 밖에잇는거 다 옮길거야」 · 번개)
//   같은 것 = 사진(고르기 · 붙여넣기 · 끌어 놓기) → 브라우저 OCR(같은 사진은 다시 안 읽음) → 원본 사진 R2(긴 변 1600 · q90 · 모델이 직접 봄 · 실패면 글자만)
//            → POST /api/tr {lines, imgKey, ctx{redo, note}} → plan 즉답 또는 id → /api/trplan 먼저 · tr_out 정적은 hl·chips 통과분만 · TRAUTO_FAILED 사유 그대로(6초 × 60)
//            → 합성 = ./tr-engine(원본 함수 그대로) · 번역 배경 검정/흰색 · 글자 크기 26~58(기본 40) · 비율 4:5 기본 · JPG q90 저장(KST 이름)
//   다른 것(다음 판) = 참고 기사 불러오기(스탠스) · 결과 레일 · 공유 「이전 제작」(api/trhist) · 직접 비율
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
import { r2Upload } from "./r2-upload";
import { compose, ensureCardFonts, runOcr, trFailReason, TR_JPGQ, type OcrLine, type Plan, type TrOpt } from "./tr-engine";

const ARS: TrOpt["ar"][] = ["4:5", "9:16", "16:9"];
const SRC_MAX = 1600;
const okPlan = (p: Plan | null | undefined): p is Plan => !!p && Array.isArray(p.hl) && Array.isArray(p.chips);
const failErr = (m: string) => Object.assign(new Error(m || "번역 플랜을 못 만들었어 — 재시도"), { trfail: 1 });
async function pollPlan(id: string, alive: () => boolean, tick: (s: number) => void): Promise<Plan> {   // 원본 pollPlan(6초 × 60 = 6분)
  const t0 = Date.now();
  for (let k = 0; k < 60 && alive(); k++) {
    await new Promise((r) => setTimeout(r, 6000));
    tick(Math.round((Date.now() - t0) / 1000));
    try {
      const r = await fetch(`/api/trplan?id=${id}&t=${Date.now()}`, { cache: "no-store", credentials: "same-origin" });
      if (r.ok) { const p = (await r.json()) as Plan; if (p?.fail) throw failErr(String(p.msg || "")); if (okPlan(p)) return p; }
    } catch (e) { if ((e as { trfail?: number }).trfail) throw e; }
    try { const r = await fetch(`/tr_out/${id}/plan.json?t=${Date.now()}`, { cache: "no-store" }); if (r.ok) { const p = (await r.json()) as Plan; if (okPlan(p)) return p; } } catch { /* 셸 HTML */ }
    try { const e = await fetch(`/tr_out/${id}/error.log?t=${Date.now()}`, { cache: "no-store" }); if (e.ok) { const rs = trFailReason(await e.text()); if (rs) throw failErr(rs); } } catch (e) { if ((e as { trfail?: number }).trfail) throw e; }
  }
  throw new Error("시간이 오래 걸려(6분 초과) — 재시도");
}
async function upSrc(img: HTMLImageElement): Promise<string> {   // 원본 trUpSrc · 실패 = 빈 키(글자만 보냄)
  try {
    const sc = Math.min(1, SRC_MAX / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.max(1, Math.round(img.naturalWidth * sc)), h = Math.max(1, Math.round(img.naturalHeight * sc));
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h; cv.getContext("2d")!.drawImage(img, 0, 0, w, h);
    const bl = await new Promise<Blob | null>((res) => cv.toBlob(res, "image/jpeg", TR_JPGQ));
    return bl ? await r2Upload(new File([bl], "trsrc.jpg", { type: "image/jpeg" }), () => {}) : "";
  } catch { return ""; }
}

export function TrCardModal() {
  const [img, setImg] = useState<HTMLImageElement | null>(null), [plan, setPlan] = useState<Plan | null>(null);
  const [opt, setOpt] = useState<TrOpt>({ style: "dark", fs: 40, ar: "4:5" }), [note, setNote] = useState("");
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(""), [err, setErr] = useState("");
  const cv = useRef<HTMLCanvasElement>(null), fileIn = useRef<HTMLInputElement>(null), ocr = useRef<{ img: HTMLImageElement | null; lines: OcrLine[] }>({ img: null, lines: [] }), alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { if (cv.current && img) compose(cv.current, img, plan ? ocr.current.lines : null, plan, opt); }, [img, plan, opt]);
  const setFile = (f?: File | null) => {
    if (!f || !f.type.startsWith("image/")) return;
    const im = new Image(); im.onload = () => { setImg(im); setPlan(null); setErr(""); setMsg(""); }; im.src = URL.createObjectURL(f);
  };
  useEffect(() => {   // 붙여넣기(원본 · 편집 탭 문법)
    const on = (e: ClipboardEvent) => { const it = Array.from(e.clipboardData?.items || []).find((x) => x.type.startsWith("image/")); if (it) setFile(it.getAsFile()); };
    window.addEventListener("paste", on); return () => window.removeEventListener("paste", on);
  }, []);
  const fire = async () => {
    if (busy) return;
    if (!img) { fileIn.current?.click(); return; }
    setBusy(true); setErr("");
    try {
      if (ocr.current.img !== img) { setMsg("글자 읽는 중…(처음 한 번은 몇 MB 받음)"); ocr.current = { img, lines: await runOcr(img) }; }
      const lines = ocr.current.lines;
      if (lines.length < 3) throw new Error("글자를 못 읽었어 — 더 선명한 문서 이미지로 시도해줘");
      setMsg("사진 올리는 중…");
      const imgKey = await upSrc(img);
      const ctx: Record<string, unknown> = {};
      if (plan) { ctx.redo = 1; if (note.trim()) ctx.note = note.trim().slice(0, 500); }
      setMsg("번역 보내는 중…");
      const r = await fetch("/api/tr", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ lines: lines.map((l) => ({ i: l.i, t: l.t })), imgKey, ctx }), signal: AbortSignal.timeout(150000) });
      const j = (await r.json().catch(() => ({}))) as { plan?: Plan; id?: string; error?: string };
      if (!r.ok || j.error) throw new Error(j.error || `서버 오류 ${r.status}`);
      const p = j.plan && okPlan(j.plan) ? j.plan : j.id ? await pollPlan(j.id, () => alive.current, (s) => alive.current && setMsg(`번역 만드는 중… ${s}초`)) : null;
      if (!p) throw new Error("번역 플랜을 못 받았어 — 재시도");
      await ensureCardFonts();
      if (!alive.current) return;
      setPlan(p); setMsg("완성 — 아래 「JPG 저장」");
    } catch (e) { if (alive.current) { setMsg(""); setErr(e instanceof Error ? (e.name === "TimeoutError" ? "서버 응답 지연 — 재시도" : e.message) : String(e)); } }
    finally { if (alive.current) setBusy(false); }
  };
  const save = () => {
    if (!cv.current || !plan) return;
    const k = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Seoul" }), name = k.slice(0, 10).replace(/-/g, "") + "_" + k.slice(11, 19).replace(/:/g, "") + "_번역카드_v1.jpg";
    cv.current.toBlob((bl) => { if (!bl) return; const a = document.createElement("a"); a.href = URL.createObjectURL(bl); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, "image/jpeg", TR_JPGQ);
  };
  const chip = (on: boolean) => `yset-chip${on ? " on" : ""}`;
  return (
    <Pane title="번역카드">
      <div className="yeta-set mt-2 nm-dl nm-ys nm-kp">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">외국어 문서 사진 → 강조 · 한글 번역 칩 · 밴드</span>
          <input ref={fileIn} type="file" accept="image/*" hidden onChange={(e) => { setFile(e.target.files?.[0]); e.target.value = ""; }} />
          <div className="nm-tr-stage" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files?.[0]); }}>
            {img ? <canvas ref={cv} className="nm-tr-cv" aria-label="미리보기" /> : <button type="button" className="nm-tr-empty" onClick={() => fileIn.current?.click()}>사진 고르기 · 붙여넣기 · 끌어 놓기</button>}
          </div>
          {img ? <div className="nm-ys-opts"><button type="button" className="yset-chip" disabled={busy} onClick={() => fileIn.current?.click()}>사진 바꾸기</button><button type="button" className="yset-chip" disabled={busy} onClick={() => { setImg(null); setPlan(null); setMsg(""); }}>지우기</button></div> : null}
          <div className="nm-ys-opts" role="group" aria-label="비율"><span className="nm-song-k">비율</span>
            {ARS.map((a) => <button key={a} type="button" className={chip(opt.ar === a)} aria-pressed={opt.ar === a} onClick={() => setOpt((o) => ({ ...o, ar: a }))}>{a}</button>)}
          </div>
          <div className="nm-ys-opts" role="group" aria-label="번역 배경"><span className="nm-song-k">번역 배경</span>
            {([["dark", "검정"], ["light", "흰색"]] as const).map(([v, l]) => <button key={v} type="button" className={chip(opt.style === v)} aria-pressed={opt.style === v} onClick={() => setOpt((o) => ({ ...o, style: v }))}>{l}</button>)}
          </div>
          <div className="nm-ys-opts"><span className="nm-song-k">글자 크기</span>
            <input type="range" min={26} max={58} step={1} value={opt.fs} aria-label="글자 크기" onChange={(e) => setOpt((o) => ({ ...o, fs: +e.target.value }))} /><span className="nm-song-k">{opt.fs}</span>
          </div>
          {plan ? <input className="nm-dl-q" maxLength={500} value={note} placeholder="다시 만들 때 바랄 것(예: 둘째 줄도 강조)" aria-label="재생성 메시지" onChange={(e) => setNote(e.target.value)} /> : null}
          <div className="nm-ys-opts">
            <button type="button" className="yset-chip on" disabled={busy} onClick={() => void fire()}>{busy ? "만드는 중…" : !img ? "사진 고르기" : plan ? "다시 만들기" : "번역카드 만들기"}</button>
            {plan ? <button type="button" className="yset-chip" disabled={busy} onClick={save}>JPG 저장</button> : null}
          </div>
          {msg ? <p className="nm-chan-msg" role="status">{msg}</p> : null}
          {err ? <p className="nm-chan-msg" role="alert">{err}</p> : null}
        </div>
      </div>
    </Pane>
  );
}

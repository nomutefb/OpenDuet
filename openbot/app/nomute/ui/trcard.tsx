// 서랍 「번역카드」 = 옛 에디터 번역 창(viewer/tr.html · api/tr → 즉답 plan 또는 러너 → tr_out/<id>/plan.json)을 앱 안으로
//   (봄 11-10 23:09 봄바람 「번개 = 번역카드 · 프롬프팅」 · 형 14:23 봄 1:1 「응 밖에잇는거 다 옮길거야」 · 번개)
//   같은 것 = 사진(고르기 · 붙여넣기 · 끌어 놓기) → 브라우저 OCR(같은 사진은 다시 안 읽음) → 원본 사진 R2(긴 변 1600 · q90 · 모델이 직접 봄 · 실패면 글자만)
//            → POST /api/tr {lines, imgKey, ctx{redo, note}} → plan 즉답 또는 id → /api/trplan 먼저 · tr_out 정적은 hl·chips 통과분만 · TRAUTO_FAILED 사유 그대로(6초 × 60)
//            → 합성 = ./tr-engine(원본 함수 그대로) · 번역 배경 검정/흰색 · 글자 크기 26~58(기본 40) · 비율 4:5 기본 · JPG q90 저장(KST 이름)
//   판 2(11-11) = 직접 비율(가로:세로 각 1~99 · 1:4 ~ 4:1) · 참고 기사(요약 6 + 수집 6 → ctx.art = 번역 스탠스 근거) · 결과(이번에 만든 것) · 공유 「이전 제작」(GET /api/trhist?recent=24)
//            · 만든 카드는 한 번씩 POST /api/trhist {b64}(R2 + 이력 커밋 · 원본 trPersist · 못 올려도 조용히 — 미리보기 · 저장은 그대로) — 산수 = ./tr-logic(시험 tests/tr-logic)
//   다른 것(다음 판) = 미리보기 옆 옵션 레일 꼴 · 이전 제작 지우기
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
import { AR_PRESETS as ARS, arCustom, artCtx, artLabel, artRows, histItems, kstStamp, type ArtCtx, type ArtRow, type HistIt } from "./tr-logic";

type Res = { url: string; name: string; ts: number; local?: boolean };
const notHtml = (t: string) => !!t.trim() && !/^\s*</.test(t);   // 아직 없는 파일 = SPA 가 index.html 을 줌
async function getJson(p: string): Promise<unknown> { try { const r = await fetch(`${p}${p.includes("?") ? "&" : "?"}_=${Date.now()}`, { credentials: "same-origin" }); if (!r.ok) return null; const t = await r.text(); return notHtml(t) ? JSON.parse(t) : null; } catch { return null; } }
const kstName = () => { const k = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Seoul" }); return k.slice(0, 10).replace(/-/g, "") + "_" + k.slice(11, 19).replace(/:/g, "") + "_번역카드_v1.jpg"; };
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
  const [arCus, setArCus] = useState(false), [arW, setArW] = useState("1"), [arH, setArH] = useState("1");   // 직접 비율(원본 기본 1:1)
  const [art, setArt] = useState<(ArtCtx & { k: string }) | null>(null), [arts, setArts] = useState<ArtRow[] | null>(null), [artBusy, setArtBusy] = useState(false);
  const [res, setRes] = useState<Res[]>([]), [hist, setHist] = useState<HistIt[]>([]);
  const cv = useRef<HTMLCanvasElement>(null), fileIn = useRef<HTMLInputElement>(null), ocr = useRef<{ img: HTMLImageElement | null; lines: OcrLine[] }>({ img: null, lines: [] }), alive = useRef(true), kept = useRef<Plan | null>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { if (cv.current && img) compose(cv.current, img, plan ? ocr.current.lines : null, plan, opt); }, [img, plan, opt]);
  const loadHist = async () => { const j = await getJson("/api/trhist?recent=24"); if (alive.current) setHist(histItems(j)); };
  useEffect(() => { void loadHist(); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {   // 원본 trPersist = 결과 한 건에 한 번(만든 직후 판 · 옵션만 바꾼 다시 그리기는 안 올림) · 위 합성 effect 다음에 돎
    if (!plan || kept.current === plan || !cv.current) return;
    kept.current = plan;
    cv.current.toBlob(async (bl) => {
      if (!bl || !alive.current) return;
      const mine: Res = { url: URL.createObjectURL(bl), name: kstName(), ts: Date.now(), local: true };
      setRes((a) => [mine, ...a].slice(0, 12));
      try {
        const b64 = await new Promise<string>((ok, no) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(",")[1] || ""); fr.onerror = no; fr.readAsDataURL(bl); });
        const r = await fetch("/api/trhist", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ b64 }), signal: AbortSignal.timeout(30000) });
        const j = (await r.json().catch(() => ({}))) as { url?: string; id?: string };
        if (j.url && alive.current) { setRes((a) => a.map((x) => (x === mine ? { ...x, url: j.url!, name: `번역_${j.id || "tr"}.jpg`, local: false } : x))); void loadHist(); }
      } catch { /* 못 올림 = 조용히(미리보기 · 저장은 그대로) */ }
    }, "image/jpeg", TR_JPGQ);
  }, [plan]);   // eslint-disable-line react-hooks/exhaustive-deps
  const pickAr = (a: string) => { setArCus(false); setOpt((o) => ({ ...o, ar: a })); };
  const setCus = (w: string, h: string) => { const W = w.replace(/[^0-9]/g, "").slice(0, 2), H = h.replace(/[^0-9]/g, "").slice(0, 2); setArW(W); setArH(H); setArCus(true); const v = arCustom(W, H); setErr(v || !W || !H ? "" : "비율은 1:4 ~ 4:1 사이로"); if (v) setOpt((o) => ({ ...o, ar: v })); };
  const openArts = async () => {   // 원본 openArts = 열려 있으면 접기
    if (arts) { setArts(null); return; }
    setArtBusy(true);
    const [a, c] = await Promise.all([getJson("/articles.json"), getJson("/candidates.json")]);
    if (alive.current) { setArts(artRows(a, c)); setArtBusy(false); }
  };
  const pickArt = async (r: ArtRow) => {   // 원본 pickRef = 요약은 본문(detail) 900자 동봉 · 수집은 주소만(서버가 원문을 읽음)
    let body = "";
    if (r.file) { const d = (await getJson(`/detail/${encodeURIComponent(r.file)}.json`)) as { body?: string } | null; body = d?.body || ""; }
    if (alive.current) { setArt({ ...artCtx(r, body), k: r.k }); setArts(null); }
  };
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
      if (art) { const { k: _k, ...a } = art; void _k; ctx.art = a; }
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
    const name = kstName();
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
            {ARS.map((a) => <button key={a} type="button" className={chip(!arCus && opt.ar === a)} aria-pressed={!arCus && opt.ar === a} onClick={() => pickAr(a)}>{a}</button>)}
            {arCus
              ? <span className="nm-tr-ar"><input className="nm-dl-q" inputMode="numeric" maxLength={2} value={arW} aria-label="직접 비율 가로" onChange={(e) => setCus(e.target.value, arH)} />:<input className="nm-dl-q" inputMode="numeric" maxLength={2} value={arH} aria-label="직접 비율 세로" onChange={(e) => setCus(arW, e.target.value)} /></span>
              : <button type="button" className="yset-chip" aria-pressed={false} onClick={() => setCus(arW, arH)}>직접</button>}
          </div>
          <div className="nm-ys-opts" role="group" aria-label="참고 기사"><span className="nm-song-k">참고</span>
            {art ? <span className="nm-kp-hint nm-tr-art">{`[${art.k}] ${artLabel(art)}`}</span> : null}
            <button type="button" className="yset-chip" disabled={artBusy || busy} aria-expanded={!!arts} onClick={() => void openArts()}>{artBusy ? "불러오는 중…" : arts ? "접기" : art ? "바꾸기" : "참고 기사 고르기"}</button>
            {art ? <button type="button" className="yset-chip" disabled={busy} onClick={() => setArt(null)}>해제</button> : null}
          </div>
          {arts ? (arts.length
            ? <div className="nm-tr-arts">{arts.map((r, i) => <button key={i} type="button" className="nm-song-opt" onClick={() => void pickArt(r)}><b>{r.k}</b><span>{artLabel(r)}</span></button>)}</div>
            : <p className="nm-chan-msg">불러올 자료가 아직 없어</p>) : null}
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
        {res.length ? (
          <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
            <p className="nm-kp-cap">{`결과 (${res.length}) · 이번에 만든 것`}</p>
            <div className="nm-tr-grid">{res.map((x) => <a key={x.url} href={x.url} {...(x.local ? { download: x.name } : { target: "_blank", rel: "noreferrer" })} title={x.name}><img src={x.url} alt={x.name} loading="lazy" /><span>{kstStamp(x.ts)}</span></a>)}</div>
          </div>
        ) : null}
        {hist.length ? (
          <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
            <p className="nm-kp-cap">{`이전 제작 (${hist.length}) · 하루 안 · 누르면 크게`}</p>
            <div className="nm-tr-grid">{hist.map((h) => <a key={h.id} href={h.url} target="_blank" rel="noreferrer" title={`번역_${h.id}.jpg`}><img src={h.url} alt={`번역 ${kstStamp(h.ts)}`} loading="lazy" /><span>{kstStamp(h.ts)}</span></a>)}</div>
          </div>
        ) : null}
      </div>
    </Pane>
  );
}

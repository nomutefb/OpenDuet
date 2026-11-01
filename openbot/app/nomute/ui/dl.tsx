// 서랍 「다운로드」 = 에디터 설정 ▸ 다운로드 창(/?pop=dlgrab · viewer-src 28-flagShellUpdate.part openDlGrab·_dgRenderBody·_dgJobHtml · 29-_dgQCap.part _dgFire·_dgVidPoll·_dgPeekHtml)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   길 = 원본과 같음: 미리보기 GET /api/vidpeek?u= · 영상 받기 POST /api/vidl {url, mode, q} → 8초마다 GET /api/vidlout?id= (없으면 /vidl_out/<id>/result.json · error.log) · 받기 = /api/dl?u=&n=(같은 오리진 attachment)
//          그 밖 주소 = GET /api/linkgrab?url= (사진·영상·문서·음성·압축·기타) · 용량 = /api/linkgrab/head · 저장 = /api/linkgrab/file · 사진만인 게시물 = 러너로 안 보내고 미리보기 액자를 바로 저장
//   계산 줄 = ./dl-logic.ts(원본 줄 그대로) · 열쇠 = 원본과 같은 이름(이 기기에서 에디터와 같은 「이전 받기」·받음 표시·화질)
//   화면 = 앱 부품(카드 · 줄 · 알약 단추) · 원본 차례 = 링크 → 받을 내용 → 결과(받는 중·받은 것·페이지 자료) → 이전 받기
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./live-shine.css";
import "./dl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pane } from "./pane";
import * as L from "./dl-logic";

type Peek = { title?: string; author?: string; thumb?: string; items?: { kind?: string; u?: string; w?: number; h?: number }[]; fmts?: [number, number][] } | null;
type File = { name: string; url: string; kind?: string; size?: number; w?: number; h?: number; fps?: number };
type Res = { files?: File[]; mode?: string; plat?: string; drive?: { on?: boolean; n?: number; why?: string }; up_err?: number; stt?: { on?: boolean; why?: string }; h264?: { why?: string } };
type Job = { url: string; plat: string; mode: string; q?: string; n: number; st: "idle" | "run" | "done" | "fail"; id?: string; t0?: number; sec?: number; msg?: string; res?: Res | null; tm?: number };
type Item = { kind?: string; title?: string; url?: string; dl?: string; thumb?: string; note?: string; via?: string; stream?: boolean };
type Scan = { title?: string; items?: Item[] } | null;

const DL_SVG = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></svg>;
const SEND_SVG = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></svg>;   // 원본 = 보내기(종이비행기 · 운영자 260805 「메세지 전송 느낌」)
const MODE_LBL: Record<string, string> = { subs: "자막", video: "영상", both: "영상+자막" };

export function DownloadModal() {
  const [url, setUrl] = useState("");
  const [peek, setPeek] = useState<Peek>(null), [peekFor, setPeekFor] = useState("");
  const [q, setQ] = useState<string>(() => L.qLoad());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scan, setScan] = useState<Scan>(null), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const [meta, setMeta] = useState<Record<number, { w?: number; h?: number; size?: number }>>({});
  const [got, setGot] = useState<Record<string, number>>(() => L.gotLoad());
  const [vdOpen, setVdOpen] = useState(false), [, setTick] = useState(0), [allBusy, setAllBusy] = useState("");
  const jobsRef = useRef<Job[]>([]), alive = useRef(true), seq = useRef(0), peekSeq = useRef(0), scanRef = useRef<Scan>(null);
  const u = L.urlNorm(url), plat = L.vidPlat(u);
  const commit = useCallback((fn: (a: Job[]) => Job[]) => { jobsRef.current = fn(jobsRef.current); setJobs(jobsRef.current); }, []);
  const redraw = () => setJobs([...jobsRef.current]);

  // 원본 _dgVidPoll — 8초마다 · 40분 상한 · 라이브 길(api/vidlout) 먼저 · 없으면 정적 길 · 창 닫히면 멈춤(잡은 열쇠에 남아 다시 열면 이어 봄)
  const poll = useCallback((v: Job) => {
    if (!alive.current || !jobsRef.current.includes(v) || v.st !== "run") return;
    if (Date.now() - (v.t0 || 0) > 40 * 60e3) { v.st = "fail"; v.msg = "시간이 너무 오래 걸려요 — 재시도"; L.vidSaveJobs(jobsRef.current); redraw(); return; }
    if (v.tm) clearTimeout(v.tm);
    v.tm = window.setTimeout(async () => {
      if (!alive.current || !jobsRef.current.includes(v) || v.st !== "run") return;
      let done = false, fail = "", live = false;
      try {
        const lr = await fetch("/api/vidlout?id=" + encodeURIComponent(v.id || "") + "&t=" + Date.now(), { credentials: "same-origin" });
        if (lr.ok) { const ld = await lr.json(); if (ld && ld.state) { live = true; if (ld.state === "fail" && ld.msg) fail = String(ld.msg).trim().slice(0, 140); else if (ld.state === "done" && ld.res && ld.res.files) { v.res = ld.res; done = true; } } }
      } catch { /* 다음 회차 */ }
      if (!live) {
        try { const er = await fetch("/vidl_out/" + v.id + "/error.log?t=" + Date.now()); if (er.ok) { const em = await er.text(); if (em && em.trim() && !/^\s*</.test(em)) fail = em.trim().slice(0, 140); } } catch { /* 없음 */ }
        if (!fail) try { const r2 = await fetch("/vidl_out/" + v.id + "/result.json?t=" + Date.now()); if (r2.ok) { const tx = await r2.text(); if (!/^\s*</.test(tx)) { const d2 = JSON.parse(tx); if (d2 && d2.files) { v.res = d2; done = true; } } } } catch { /* 없음 */ }
      }
      if (!jobsRef.current.includes(v)) return;
      if (fail) { v.st = "fail"; v.msg = "실패 — " + fail; L.vidSaveJobs(jobsRef.current); redraw(); return; }
      if (done) { v.st = "done"; v.sec = Math.max(1, Math.round((Date.now() - (v.t0 || Date.now())) / 1000)); L.vidSaveJobs(jobsRef.current); L.doneSave(v); redraw(); return; }
      poll(v);
    }, 8000);
  }, []);
  // 원본 _dgVidFire — 실패에서도 다시 시도 · 받는 중엔 안 막음(다른 주소는 얼마든지 · 큐잉)
  const fire = useCallback(async (v: Job, mode?: string) => {
    if (!v || (v.st !== "idle" && v.st !== "fail")) return;
    v.mode = ["both", "video", "subs"].includes(mode || v.mode) ? (mode || v.mode) : "both";
    v.st = "run"; v.msg = "요청 중"; v.t0 = Date.now(); v.sec = 0; v.res = null; redraw();
    try {
      const r = await fetch("/api/vidl", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: v.url, mode: v.mode, q: v.q || "best" }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error || !d.id) throw new Error(d.error || "HTTP " + r.status);
      if (!jobsRef.current.includes(v)) return;
      v.id = d.id; L.vidSaveJobs(jobsRef.current); redraw(); poll(v);
    } catch (e) { if (jobsRef.current.includes(v)) { v.st = "fail"; v.msg = "저장 요청 실패 — " + ((e as Error)?.message || "네트워크"); redraw(); } }
  }, [poll]);
  // 원본 _dgVidJob — 같은 주소 이중 발사만 막음 · 화질 = 칩에 뜬 값을 그때 박제 · 스레드 = 늘 최고
  const newJob = (to: string, mode: string, qq?: string): Job | null => {
    const p = L.vidPlat(to); if (!p) return null;
    if (jobsRef.current.some((v) => v.st === "run" && v.url === to)) { setErr("이미 받는 중인 주소야"); return null; }
    setErr("");
    const v: Job = { url: to, plat: p, mode: mode || "both", q: p === "TH" ? "best" : (qq || L.qEff(peek, q)[0]), n: ++seq.current, st: "idle" };
    commit((a) => [v, ...a]);
    return v;
  };
  const peekItems = L.peekItems(peek);
  const peekGetAll = async () => {   // 원본 _dgPeekGetAll — 사진·영상 묶음 전량 순차 저장
    if (!peekItems.length || allBusy) return;
    setAllBusy("peek"); await L.grabSeq(peekItems.map((_: unknown, k: number) => L.peekGetUrl(peek, k))); setAllBusy("");
  };
  const scanGo = async () => {   // 원본 _dgGo — 영상 게시물이 아닌 주소 = 그 페이지 자료 수집
    if (busy) return;
    if (!u) { setErr("주소를 먼저 붙여넣어 주세요"); return; }
    setBusy(true); setErr(""); setMeta({});
    try {
      const r = await fetch("/api/linkgrab?url=" + encodeURIComponent(u), { credentials: "same-origin" });
      const d = await r.json().catch(() => ({ error: "응답 해석 실패" }));
      if (!r.ok || d.error) throw new Error(d.error || "HTTP " + r.status);
      scanRef.current = d; setScan(d);
    } catch (e) { scanRef.current = null; setScan(null); setErr("가져오기 실패 — " + ((e as Error)?.message || "네트워크 오류")); }
    setBusy(false);
  };
  const go = () => {   // 원본 _dgFire — 갈래 판단 한 곳(사진만 게시물 = 액자 바로 저장 · 영상 게시물 = 받기 잡 · 그 밖 = 페이지 스캔)
    if (busy) return;
    if (!u) { setErr("주소를 먼저 붙여넣어 주세요"); return; }
    if (plat && peekFor === u && L.noVid(peek)) { void peekGetAll(); return; }
    if (plat) { const v = newJob(u, "video"); if (!v) return; setUrl(""); void fire(v, v.mode); }   // 발사 = 칸 비움(다음 주소 바로)
    else void scanGo();
  };

  // 열 때 = 진행 중 받기 되살림 + 폴 다시(원본 openDlGrab) · 닫힐 때 = 폴 멈춤
  useEffect(() => {
    alive.current = true;
    const back = L.vidLoadJobs().map((j: Job) => ({ url: j.url, plat: j.plat, id: j.id, mode: j.mode, q: j.q, t0: j.t0, n: ++seq.current, st: "run" as const, msg: "받는 중" }));
    if (back.length) { commit(() => back); back.forEach((v: Job) => poll(v)); }
    const t = window.setInterval(() => { if (jobsRef.current.some((v) => v.st === "run")) setTick((n) => n + 1); }, 1000);   // 경과 초 = 1초마다(원본 = 폴 회차마다 숫자만)
    return () => { alive.current = false; window.clearInterval(t); jobsRef.current.forEach((v) => v.tm && clearTimeout(v.tm)); };
  }, [commit, poll]);
  // 원본 _dgPeek — 주소를 넣으면 600ms 뒤 「무엇인지」(og 메타 · 항목 · 화질 사다리) · 늦게 온 옛 응답 버림
  useEffect(() => {
    const s = ++peekSeq.current;
    if (!u || !plat) { setPeek(null); setPeekFor(""); return; }
    const tm = window.setTimeout(async () => {
      try {
        const r = await fetch("/api/vidpeek?u=" + encodeURIComponent(u), { credentials: "same-origin" });
        const d = await r.json().catch(() => ({}));
        if (s !== peekSeq.current) return;
        const ok = d && (d.title || (Array.isArray(d.items) && d.items.length));
        setPeek(ok ? d : null); setPeekFor(ok ? u : "");
      } catch { if (s === peekSeq.current) { setPeek(null); setPeekFor(""); } }
    }, 600);
    return () => window.clearTimeout(tm);
  }, [u, plat]);
  // 원본 _dgMetaScan — 용량 = head 지연 조회(동시 4 · 80개까지)
  useEffect(() => {
    const r = scan; if (!r) return;
    const list = (r.items || []).map((it, i) => (it.dl && it.via !== "direct" ? i : -1)).filter((i) => i >= 0).slice(0, 80);
    let k = 0, stop = false;
    const next = () => {
      if (stop || k >= list.length) return;
      const i = list[k++], it = (r.items || [])[i];
      fetch("/api/linkgrab/head?url=" + encodeURIComponent(it.dl || ""), { credentials: "same-origin" }).then((x) => x.json()).catch(() => ({})).then((d) => {
        if (stop || scanRef.current !== r) return;
        setMeta((m) => ({ ...m, [i]: { ...(m[i] || {}), size: (d && d.size) || 0 } })); next();
      });
    };
    for (let w = 0; w < 4 && w < list.length; w++) next();
    return () => { stop = true; };
  }, [scan]);

  const markGot = (key: string) => { L.gotMark(key); setGot((g) => ({ ...g, [key]: Date.now() })); };
  const scanDl = (i: number) => { const it = (scan?.items || [])[i]; if (!it || !it.dl) return; L.grab(L.dlUrl(it), it.via === "direct"); markGot(L.dgKey(it)); };   // 원본 _dgDl
  const vidGet = (v: Job, f: File) => { if (!f?.url || v.st !== "done") return; L.grab(L.vidFileUrl(f)); markGot(f.url); };   // 원본 _dgVidGet
  const seqAll = async (tag: string, hrefs: string[], after?: (k: number) => void) => { if (allBusy) return; setAllBusy(tag); await L.grabSeq(hrefs, after); setAllBusy(""); };
  const ytReq = (i: number) => { const it = (scan?.items || [])[i]; if (!it || !it.stream || !it.url) return; const v = newJob(it.url, "video", "1080-60"); if (v) void fire(v, v.mode); };   // 원본 _dgYtReq(화질 = K 상한)
  const doneOpen = (i: number) => {   // 원본 _dgDoneOpen — 보관함 → 그때 그 완료 잡 카드로 되살림
    const e = L.doneLoad()[i]; if (!e) return;
    commit((a) => [{ url: e.url, plat: e.plat, id: e.id, mode: e.mode || "both", t0: e.t, sec: e.sec || 0, n: ++seq.current, st: "done", res: e.res }, ...a.filter((v) => v.id !== e.id)]);
    setVdOpen(false); setErr("");
  };
  const setQual = (v: string) => { setQ(v); try { localStorage.setItem(L.DG_Q_KEY, v); } catch { /* 덤 */ } };

  const noV = L.noVid(peek), opts = L.qOpts(peek), eff = L.qEff(peek, q);
  const ttl = peek?.title ? peek.title : u.replace(/^https?:\/\/(www\.)?/, "").slice(0, 80);
  const itemsLine = plat ? L.peekItemsLine(peek, plat) : "";
  const items = scan?.items || [];
  const done = L.doneLoad();
  const n = jobs.length + (scan ? 1 : 0);
  return (
    <Pane title="다운로드">
      <div className="yeta-set mt-2 nm-dl">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">링크</span>
          <div className="nm-dl-url">
            <input type="url" value={url} placeholder="영상 게시물 · 페이지 주소" aria-label="주소" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
              onChange={(e) => { setUrl(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") go(); }} />
            <button type="button" className={`nm-dl-send${u && !busy ? " on" : ""}`} disabled={!u || busy} onClick={go}
              aria-label={!u ? "주소를 붙여넣으면 받을 수 있어" : plat && peekFor === u && noV ? platLbl(plat) + " 사진 전부 받기" : plat ? platLbl(plat) + " 영상 받기" : "이 페이지의 사진·파일 받기"}>{busy ? <span className="nm-dl-spin" /> : SEND_SVG}</button>
          </div>
          {err ? <p className="nm-chan-msg" role="alert">{err}</p> : null}
        </div>

        {plat ? (
          <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
            <span className="ycd-nm yset-ttl">받을 내용</span>
            <p className="nm-dl-sec">받을 내용</p>
            <div className="nm-dl-peek">
              {peek?.thumb ? <span className="th"><img src={peek.thumb} alt="" loading="lazy" referrerPolicy="no-referrer" /></span> : null}
              <div className="mn">
                <div className="t">{ttl}</div>
                <div className="m">{L.platName(plat)}{peek?.author ? " · " + peek.author : ""}{noV ? " · 사진만" : " · 영상만 · " + (plat === "TH" ? "최고 화질" : eff[0] === "best" ? "최고 화질" : "최대 " + eff[1])}</div>
                {itemsLine ? <div className="m">{itemsLine}</div> : null}
              </div>
              {plat === "TH" || noV ? null : (
                <select className="nm-dl-q" value={eff[0]} aria-label={"화질 " + eff[1] + " — 이 영상에 있는 것만"} title="화질 — 4K=2160p · 2K=1440p · K=1080p · 이 영상에 있는 것만 나와" onChange={(e) => setQual(e.target.value)}>
                  {opts.map(([v, lab]: [string, string]) => <option key={v} value={v}>{lab}</option>)}
                </select>
              )}
              {peekItems.length
                ? <button type="button" className="nm-dl-all" disabled={!!allBusy} onClick={() => void peekGetAll()} aria-label="이 게시물 전체 다운로드">{DL_SVG}<span>{allBusy === "peek" ? "받는 중" : "전체"}</span></button>
                : <button type="button" className="nm-dl-btn" onClick={go} aria-label="다운로드">{DL_SVG}</button>}
            </div>
            {peekItems.length ? (
              <div className="nm-dl-grid">
                {peekItems.map((it: { kind?: string; u: string; w?: number; h?: number }, k: number) => (
                  <div key={k} className="nm-dl-card">
                    {it.kind === "video" ? <video src={it.u} playsInline loop preload="metadata" onClick={(e) => { const vv = e.currentTarget; if (vv.paused) void vv.play(); else vv.pause(); }} /> : <img src={L.imgSrc(it.u)} alt="" loading="lazy" referrerPolicy="no-referrer" />}
                    <span className="idx">{k + 1}/{peekItems.length}</span>
                    <span className="pl">{it.kind === "video" ? "영상" : "사진"}{it.w && it.h ? " | " + it.w.toLocaleString("ko-KR") + "×" + it.h.toLocaleString("ko-KR") : ""}</span>
                    <button type="button" className="nm-dl-btn sm" onClick={() => L.grab(L.peekGetUrl(peek, k))} aria-label={(k + 1) + "번 다운로드"}>{DL_SVG}</button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">결과</span>
          <p className="nm-dl-sec">결과 <i>({n})</i></p>
          {!n ? <p className="nm-chan-msg">아직 받은 게 없습니다</p> : null}
          {jobs.map((v) => <JobCard key={v.n} v={v} got={got} onRetry={() => void fire(v, v.mode || "both")} onGet={(f) => vidGet(v, f)}
            onAll={() => void seqAll("job" + v.n, (v.res?.files || []).map((f) => L.vidFileUrl(f)), (k) => { const f = (v.res?.files || [])[k]; if (f) markGot(f.url); })} allBusy={allBusy === "job" + v.n} />)}
          {scan ? (
            <div className="nm-dl-scan">
              <p className="nm-dl-sec">{scan.title || "결과"} <i>— 자료 {items.length}건</i></p>
              {!items.length ? <p className="nm-chan-msg">이 페이지에서 내려받을 자료를 찾지 못했어요</p> : null}
              {L.DG_SECTIONS.map(([kind, label]: [string, string]) => {
                const idx = items.map((it, i) => ((it.kind || "link") === kind ? i : -1)).filter((i) => i >= 0);
                if (!idx.length) return null;
                const dl = idx.filter((i) => items[i].dl);
                return (
                  <div key={kind} className="nm-dl-kind">
                    <div className="hd"><span>{label} <i>{idx.length}</i></span>{dl.length > 1 ? <button type="button" className="nm-dl-all" disabled={!!allBusy} onClick={() => void seqAll("sec" + kind, dl.map((i) => L.dlUrl(items[i])), (k) => { const it = items[dl[k]]; if (it) markGot(L.dgKey(it)); })} aria-label={label + " 전체 다운로드"}>{DL_SVG}<span>{allBusy === "sec" + kind ? "받는 중" : "전체"}</span></button> : null}</div>
                    {kind === "img" ? (
                      <div className="nm-dl-grid g3">
                        {idx.map((i) => { const it = items[i], m = meta[i] || {}, g = !!got[L.dgKey(it)]; return (
                          <div key={i} className="nm-dl-card">
                            <img src={it.thumb || it.url} alt="" loading="lazy" referrerPolicy="no-referrer" onLoad={(e) => { const im = e.currentTarget; setMeta((mm) => ({ ...mm, [i]: { ...(mm[i] || {}), w: im.naturalWidth, h: im.naturalHeight } })); }} onError={(e) => { e.currentTarget.hidden = true; }} />
                            <span className="pl two"><span>{m.w ? m.w + "×" + m.h : "해상도 확인 중"}</span><span>{L.dgFmt(m.size) || "용량 확인 중"}</span></span>
                            {g ? <span className="gotb">받음</span> : null}
                            {it.dl ? <button type="button" className={`nm-dl-btn sm${g ? " done" : ""}`} onClick={() => scanDl(i)} aria-label="다운로드">{DL_SVG}</button> : null}
                          </div>
                        ); })}
                      </div>
                    ) : idx.map((i) => { const it = items[i], m = meta[i] || {}, g = !!got[L.dgKey(it)], run = jobs.some((v) => v.st === "run" && v.url === it.url), vp = it.stream && !it.dl ? L.vidPlat(it.url || "") : ""; return (
                      <div key={i} className="nm-dl-peek row">
                        {it.thumb ? <span className="th"><img src={it.thumb} alt="" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.hidden = true; }} /></span> : null}
                        <div className="mn">
                          <div className="t">{it.title || "자료"}{g ? <span className="gotb in">받음</span> : null}</div>
                          <div className="m">{L.dgFmt(m.size) || (it.dl ? "용량 확인 중" : "")}{it.note ? " · " + it.note : ""}{it.stream && !it.dl ? (vp ? (run ? " 위 결과 카드에서 받는 중" : "") : " 받기 미지원 주소(영상 게시물만)") : ""}</div>
                        </div>
                        {it.stream && !it.dl && vp ? <button type="button" className="go" disabled={run} onClick={() => ytReq(i)}>{run ? "받는 중" : "저장 요청"}</button> : null}
                        {it.dl ? <button type="button" className={`nm-dl-btn${g ? " done" : ""}`} onClick={() => scanDl(i)} aria-label="다운로드">{DL_SVG}</button> : null}
                      </div>
                    ); })}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">이전 받기</span>
          <button type="button" className="nm-dl-fold" aria-expanded={vdOpen} onClick={() => setVdOpen(!vdOpen)}><span>이전 받기 <i>({done.length})</i></span><small>이 기기 · 7일 뒤 지워짐</small></button>
          {vdOpen ? (!done.length ? <p className="nm-chan-msg">아직 받은 게 없습니다</p> : (
            <div className="nm-q-list" role="list">
              {done.map((e: { id: string; url: string; plat: string; mode: string; t: number; sec?: number; res: Res }, i: number) => {
                const fs = e.res.files || [], vn = fs.filter((f) => f.kind === "video" || f.kind === "img").length, aq = L.resActual(e.res);
                return (
                  <div key={e.id} role="listitem" className="nm-q-row nm-memo-row nm-dl-hist" onClick={() => doneOpen(i)}>
                    <span className="qm"><i>{L.platName(e.plat) + " · " + (MODE_LBL[e.mode] || "영상+자막") + " · 파일 " + fs.length + "건" + (vn ? "" : " (자막만)") + (aq ? " · " + aq : "")}</i><small>{L.agoTxt(e.t) + (e.sec ? " · " + L.secTxt(e.sec) : "") + (e.url ? " · " + e.url.replace(/^https?:\/\/(www\.)?/, "") : "")}</small></span>
                    <span className="qa"><button type="button" className="go gray" aria-label="이전 받기에서 지우기" onClick={(ev) => { ev.stopPropagation(); L.doneDel(i); setTick((t) => t + 1); }}>지움</button></span>
                  </div>
                );
              })}
            </div>
          )) : null}
        </div>
      </div>
    </Pane>
  );
}

const platLbl = (p: string) => L.platName(p);

function JobCard({ v, got, onRetry, onGet, onAll, allBusy }: { v: Job; got: Record<string, number>; onRetry: () => void; onGet: (f: File) => void; onAll: () => void; allBusy: boolean }) {   // 원본 _dgJobHtml
  const fs = v.res?.files || [];
  const sec = Math.max(0, Math.round((Date.now() - (v.t0 || Date.now())) / 1000));
  const qLbl = v.st === "done" ? L.resActual(v.res) : v.q === "best" ? "최고 화질" : v.q ? "최대 " + L.qName(v.q) : "";   // 완료 = 실측만(없으면 빈칸 · 거짓 표기 0)
  const dr = v.res?.drive || {}, st = v.res?.stt || {}, h2 = v.res?.h264 || {};
  let imgN = 0;
  return (
    <div className={`nm-dl-job${v.st === "done" ? " done" : ""}${v.st === "fail" ? " err" : ""}`}>
      <div className="hd">
        <span className="lab">{(L.platName(v.plat) || "링크") + " · " + (MODE_LBL[v.mode] || "영상+자막") + (qLbl ? " · " + qLbl : "") + " #" + v.n}</span>
        <span className="st">{v.st === "fail" ? <>⚠ 실패{v.msg ? " · " + String(v.msg).slice(0, 60) : ""}</> : v.st === "done" ? <>✓ 완료 · {fs.length}건{v.sec ? " (" + L.secTxt(v.sec) + ")" : ""}</> : <span className="t-shimmer" data-text={"받는 중 " + L.secTxt(sec)}>받는 중 {L.secTxt(sec)}</span>}</span>
      </div>
      {v.st === "fail" ? <button type="button" className="go" onClick={onRetry}>다시 시도</button> : null}
      {v.st === "done" && fs.length ? (
        <>
          <div className="files">
            {fs.map((f, k) => { if (f.kind === "img") imgN++; const lab = L.fileLabel(f, imgN), tip = f.name + (f.size ? " · " + L.dgFmt(f.size) : ""), g = !!got[f.url]; return (
              <span key={k} className="f"><button type="button" className="tx" title={tip} onClick={() => onGet(f)}>[{k + 1}] {lab}</button><button type="button" className={`nm-dl-btn sm${g ? " done" : ""}`} title={tip} onClick={() => onGet(f)} aria-label={lab + " 다운로드"}>{DL_SVG}</button></span>
            ); })}
            {fs.length > 1 ? <button type="button" className="nm-dl-all" disabled={allBusy} onClick={onAll} aria-label={"받은 파일 " + fs.length + "건 전체 다운로드"}>{DL_SVG}<span>{allBusy ? "받는 중" : "전체"}</span></button> : null}
          </div>
          {!(dr.on && dr.n) || v.res?.up_err ? <p className="nm-dl-why">{L.driveWhy(dr.why) + (v.res?.up_err ? " · 업로드 실패 " + v.res.up_err + "건" : "")}</p> : null}
          {st.why && !st.on ? <p className="nm-dl-why">{"받아쓰기: " + st.why}</p> : null}
          {h2.why ? <p className="nm-dl-why">{"코덱: " + h2.why}</p> : null}
        </>
      ) : null}
    </div>
  );
}

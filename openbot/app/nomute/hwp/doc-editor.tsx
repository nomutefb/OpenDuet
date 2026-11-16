// 4번 메뉴 「에디터」 셋째 칸 「문서 에디터」 = 한글 없이 한글 문서 만들기 · 열기 · 고치기 · 저장(형 11-17 「이거를 에디터 한쪽에 문서 편집기로해서. 누르면 탭이 나오도록해서. 한글 파일을 구성을 할 수 있게 만들 수 있나? 한글을 안키고도」)
//   두 재료를 섞음(형 「그 부분으로해줘. 근데 아까 너가 찾은 부분 강점을 섞어도 좋지」):
//     · 열기 · 손으로 고치기 · .hwpx / 옛 .hwp 저장 = rhwp 편집기(edwardkim/rhwp · MIT · Rust + wasm · @rhwp/editor 가 화면을 품어 줌)
//     · 글로 만들기(Markdown → 개조식 보고서) · 공문 틀 · 가독성 · 쪽 점검 · 개인정보 가리기 · 글만 꺼내기 = hwpx-docs(./hd-engine.ts · 브라우저 안 파이썬)
//   겉틀 = 이미지 · 비디오 에디터와 같은 창(./thumb-maker/frame.css tm-* · 머리 「✦ 문서 편집」 · 최소화 − · 닫기 × = ../ui/ed-keep) → 접어 두면 쓰던 문서가 그대로 삶
//   서버로 가는 것 0 = 문서는 이 브라우저 안에서만 돎(편집기 화면 코드 · 파이썬은 밖에서 받아 옴 · 문서 내용은 안 나감)
//   안 본 것(11-17 클라우드 상자 · 한글 없음) = 저장한 파일을 진짜 한글에서 열기 · 한글 자판 조합 입력 · 폰 실물
import "../ui/thumb-maker/frame.css";
import "../ui/video-editor.css";
import "./doc-editor.css";
import { createEditor, type RhwpEditor } from "@rhwp/editor";
import { useEffect, useRef, useState } from "react";
import { ToolButtons } from "../ui/ed-keep";
import { CANT_READ, OPEN_ACCEPT, SAMPLE_MD, STUDIO_URL, checkLines, hdCrashed, maskedCount, saveName } from "./doc-logic";
import { hd, stopHd, warmHd } from "./hd-engine";

const SPARK = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>;
type Side = "make" | "check" | null;
type Check = { lines: string[]; bad: number };

function download(bytes: Uint8Array | ArrayBuffer | string, name: string, type = "application/octet-stream") {
  const a = document.createElement("a"), url = URL.createObjectURL(new Blob([bytes as BlobPart], { type }));
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function DocEditor({ onBack, onMin }: { onBack?: () => void; onMin?: () => void }) {
  const host = useRef<HTMLDivElement>(null), ed = useRef<RhwpEditor | null>(null), file = useRef<HTMLInputElement>(null);
  const unsaved = useRef(false), undoMask = useRef<{ bytes: Uint8Array; name: string } | null>(null);
  const [ready, setReady] = useState(false), [err, setErr] = useState(""), [busy, setBusy] = useState(""), [note, setNote] = useState("");
  const [name, setName] = useState(""), [side, setSide] = useState<Side>(null), [md, setMd] = useState(""), [check, setCheck] = useState<Check | null>(null), [save, setSave] = useState(false), [canUndo, setCanUndo] = useState(false);
  useEffect(() => { if (!note) return undefined; const t = window.setTimeout(() => setNote(""), 6000); return () => clearTimeout(t); }, [note]);   // 잘 된 한 줄 = 6초 뒤 걷음(실패 줄은 안 걷음)
  const [boot, setBoot] = useState(0);   // 다시 띄우기(편집기 화면을 못 받았을 때)

  useEffect(() => {   // 편집기 = 창을 처음 열 때 한 번 · 접어 둔 동안에도 그대로(ToolKeep 이 숨기기만 함)
    let live = true;
    setReady(false); setErr("");
    createEditor(host.current!, { studioUrl: STUDIO_URL }).then((e) => {
      if (!live) { e.destroy(); return; }
      ed.current = e; setReady(true);
    }).catch((e: unknown) => { if (live) setErr(`편집기 화면을 못 받았어 — ${e instanceof Error ? e.message : String(e)}`); });
    return () => { live = false; ed.current?.destroy(); ed.current = null; stopHd(); };   // 창을 닫음 = 편집기 칸 + 파이썬 일꾼 둘 다 내림(메모리 돌려줌)
  }, [boot]);

  /** 한 가지 일 — 하는 동안 이름을 띄우고 · 끝나면 한 줄 · 실패는 빨강 한 줄(조용히 넘어가지 않음) */
  const run = async (label: string, job: () => Promise<string | void>) => {
    if (busy) return;
    setBusy(label); setNote(""); setErr(""); setSave(false);
    try { const done = await job(); if (done) setNote(done); } catch (e) { setErr(`${label} 실패 — ${e instanceof Error ? e.message : String(e)}`); } finally { setBusy(""); }
  };
  const editor = () => { if (!ed.current) throw new Error("편집기가 아직 안 떴어"); return ed.current; };
  /** 저장 안 한 고침이 있나 — 편집기에게 물음(getDocumentState().dirty) · 못 물으면(옛 편집기 화면) 문서가 열려 있을 때 「있다」로 침 = 묻고 지나감 */
  const isDirty = async () => { if (unsaved.current) return true; const e = ed.current; if (!e) return false; try { return (await e.getDocumentState()).dirty; } catch { return !!name; } };
  const okToDrop = async (ask: string) => !(await isDirty()) || window.confirm(`고치던 문서가 있어. 저장 안 한 내용은 사라져 — ${ask}`);
  const show = async (bytes: Uint8Array, as: string) => {
    const r = await editor().loadFile(bytes.slice().buffer, as);
    unsaved.current = false; setName(as);
    return `${as} · ${r.pageCount}쪽`;
  };
  const now = async () => new Uint8Array(await editor().exportHwpx());   // 지금 화면의 문서(고친 것 포함)를 hwpx 로

  const openFile = (f: File | undefined) => { if (f) void run("여는 중", async () => { if (!(await okToDrop("이 파일로 바꿀까?"))) return; undoMask.current = null; setCanUndo(false); return `열었어 — ${await show(new Uint8Array(await f.arrayBuffer()), f.name)}`; }); };
  const makeReport = () => { if (md.trim()) void run("만드는 중", async () => {
    if (!(await okToDrop("새 문서로 바꿀까?"))) return;
    const r = await hd(["md", "/work/in.md", "/work/out.hwpx"], { "in.md": md }, ["out.hwpx"]);
    if (r.code || !r.files["out.hwpx"]) throw new Error(r.log.split("\n").pop() || "문서가 안 나왔어");
    setSide(null); undoMask.current = null; setCanUndo(false);
    return `만들었어 — ${await show(r.files["out.hwpx"], saveName(md.match(/^#\s+(.+)$/m)?.[1] ?? "", "hwpx"))}`;
  }); };
  const makeGongmun = () => void run("공문 틀 만드는 중", async () => {
    if (!(await okToDrop("공문 틀로 바꿀까?"))) return;
    const r = await hd(["build", "/hd/templates/gongmun.json", "/work/out.hwpx"], {}, ["out.hwpx"]);
    if (r.code || !r.files["out.hwpx"]) throw new Error(r.log.split("\n").pop() || "문서가 안 나왔어");
    setSide(null); undoMask.current = null; setCanUndo(false);
    return `공문 틀 — ${await show(r.files["out.hwpx"], "공문.hwpx")} · ○○ 자리를 채우면 돼`;
  });
  const doCheck = () => void run("점검 중", async () => {
    const b = await now();
    const a = await hd(["readability", "/work/d.hwpx"], { "d.hwpx": b }), f = await hd(["pagefit", "check", "/work/d.hwpx"], { "d.hwpx": b });
    if (hdCrashed(a.log) || hdCrashed(f.log)) throw new Error(CANT_READ);   // 못 읽은 것을 「문제 없음」으로 보이지 않음
    if (!/^READABILITY /m.test(a.log) || !/점검 결과:/.test(f.log)) throw new Error((a.log + "\n" + f.log).trim().split("\n").pop() || "점검 결과가 안 나왔어");
    const c = checkLines(a.log, f.log);
    setCheck(c); setSide("check");
    return c.bad ? `점검 — 볼 곳 ${c.bad}건` : "점검 — 문제 없음";
  });
  const doMask = () => void run("개인정보 가리는 중", async () => {
    const b = await now();
    const r = await hd(["secure", "/work/d.hwpx", "/work/m.hwpx", "--mask-private"], { "d.hwpx": b }, ["m.hwpx"]);
    const n = maskedCount(r.log);
    if (r.code || !r.files["m.hwpx"] || n === null) throw new Error(r.log.split("\n").pop() || "결과가 안 나왔어");
    if (!n) return "가릴 개인정보를 못 찾았어(주민번호 · 전화 · 이메일 · 카드 번호)";
    const keep = { bytes: b, name: name || "문서.hwpx" };
    await show(r.files["m.hwpx"], saveName(name, "hwpx")); unsaved.current = true;
    undoMask.current = keep; setCanUndo(true);
    return `개인정보 ${n}곳 가렸어 — 되돌리려면 「가리기 취소」`;
  });
  const undo = () => void run("되돌리는 중", async () => { const k = undoMask.current; if (!k) return; await show(k.bytes, k.name); unsaved.current = true; undoMask.current = null; setCanUndo(false); return "가리기 전으로 되돌렸어"; });
  const takeText = () => void run("글 꺼내는 중", async () => {
    const r = await hd(["text", "/work/d.hwpx", "--md", "-o", "/work/out.md"], { "d.hwpx": await now() }, ["out.md"]);
    if (hdCrashed(r.log)) throw new Error(CANT_READ);
    if (r.code || !r.files["out.md"]) throw new Error(r.log.split("\n").pop() || "글이 안 나왔어");
    download(r.files["out.md"], saveName(name, "md"), "text/markdown");
    return "글만 Markdown 으로 받았어";
  });
  const saveAs = (kind: "hwpx" | "hwp") => void run("저장 중", async () => {
    const e = editor(), bytes = kind === "hwp" ? await e.exportHwp() : await e.exportHwpx(), as = saveName(name, kind);
    download(bytes as ArrayBuffer, as);
    unsaved.current = false; void e.notifySaved(as).catch(() => {});   // 편집기에도 「저장됨」을 알림(못 알리는 옛 화면이면 넘어감)
    return `${as} 받았어`;
  });

  const off = !ready || !!busy;
  return (
    <div className="tm-stage hw-stage">
      <div className="tm-head">
        <b className="tm-title">{SPARK}<span>문서 편집</span></b>
        {name ? <span className="hw-name" title={name}>{name}</span> : null}
        <ToolButtons onMin={onMin} onClose={() => void okToDrop("닫을까?").then((ok) => { if (ok) onBack?.(); })} />
      </div>
      <div className="hw-bar" role="toolbar" aria-label="문서 할 일">
        <button type="button" className="hw-b pri" disabled={off} aria-pressed={side === "make"} onClick={() => { setSide(side === "make" ? null : "make"); warmHd(); }}>새로 만들기</button>
        <button type="button" className="hw-b" disabled={off} onClick={() => file.current?.click()}>파일 열기</button>
        <span className="hw-sep" aria-hidden />
        <button type="button" className="hw-b" disabled={off} onClick={doCheck}>점검</button>
        <button type="button" className="hw-b" disabled={off} onClick={canUndo ? undo : doMask}>{canUndo ? "가리기 취소" : "개인정보 가리기"}</button>
        <button type="button" className="hw-b" disabled={off} onClick={takeText}>글만 꺼내기</button>
        <span className="hw-grow" />
        <button type="button" className="hw-b pri hw-keep" disabled={off} aria-haspopup="menu" aria-expanded={save} onClick={() => setSave((v) => !v)}>받기</button>
        <input ref={file} type="file" accept={OPEN_ACCEPT} hidden onChange={(e) => { openFile(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      <div className="tm-frame hw-frame">
        <div ref={host} className="hw-ed" />
        {!ready ? <p className="hw-wait" role={err ? "alert" : undefined}>{err ? <>{err}<br /><button type="button" className="hw-b" onClick={() => setBoot((n) => n + 1)}>다시 띄우기</button></> : "편집기 여는 중…"}</p> : null}
        {busy || err || note ? <p className={`hw-note${err ? " bad" : ""}`} role={err ? "alert" : "status"}>{busy ? `${busy}…` : err || note}</p> : null}   {/* 결과 한 줄 = 몸통 아래 가운데(할 일 줄은 폰에서 옆으로 밀려 글이 화면 밖으로 나감) · 실패는 다음 일을 할 때까지 남음 */}
        {ready && !name && side !== "make" && !busy && !err && !note ? <p className="hw-hint">위 「새로 만들기」로 글에서 문서를 뽑거나 「파일 열기」로 .hwp · .hwpx 를 열어. 빈 문서에 바로 써도 돼.</p> : null}
        {save ? (   /* 받을 꼴 고르기 = 몸통 위(할 일 줄은 옆으로 밀리는 칸이라 그 안에 두면 잘림) · 품은 편집기는 바깥 누름을 못 알려 줌 → 가림막이 받음(비디오 에디터와 같은 길) */
          <>
            <button type="button" className="ved-veil" aria-label="닫기" tabIndex={-1} onClick={() => setSave(false)} />
            <div className="hw-pop" role="menu" aria-label="받을 꼴">
              <button type="button" role="menuitem" className="hw-pi" onClick={() => saveAs("hwpx")}><b>.hwpx</b><i>요즘 한글 · 권장</i></button>
              <button type="button" role="menuitem" className="hw-pi" onClick={() => saveAs("hwp")}><b>.hwp</b><i>옛 꼴 · 한글에서 한 번 열어 확인</i></button>
            </div>
          </>
        ) : null}
        {side === "make" ? (
          <div className="hw-side" role="dialog" aria-label="새로 만들기">
            <div className="hw-side-h"><b>글로 만들기</b><button type="button" className="hw-x" aria-label="닫기" onClick={() => setSide(null)}>×</button></div>
            <p className="hw-side-d">Markdown 으로 쓰면 개조식 보고서(제목 상자 · □ ○ - · 항목 · 격자 표)로 바뀌어. 만든 뒤 오른쪽에서 손으로 고치면 돼.</p>
            <textarea className="hw-md" value={md} onChange={(e) => setMd(e.target.value)} placeholder={"# 제목\n\n## 장 제목\n- 항목\n  - 아래 항목"} spellCheck={false} />
            <div className="hw-side-f">
              <button type="button" className="hw-b" onClick={() => setMd(SAMPLE_MD)}>보기 글 넣기</button>
              <span className="hw-grow" />
              <button type="button" className="hw-b pri" disabled={!!busy || !md.trim()} onClick={makeReport}>보고서 만들기</button>
            </div>
            <div className="hw-side-h sub"><b>틀에서 시작</b></div>
            <button type="button" className="hw-row" disabled={!!busy} onClick={makeGongmun}><b>공문(기안문) 틀</b><i>기관명 · 수신 · 제목 · 본문 · 발신명의 자리가 잡힌 한 장</i></button>
          </div>
        ) : null}
        {side === "check" && check ? (
          <div className="hw-side" role="dialog" aria-label="점검 결과">
            <div className="hw-side-h"><b>점검 결과 — {check.bad ? `볼 곳 ${check.bad}건` : "문제 없음"}</b><button type="button" className="hw-x" aria-label="닫기" onClick={() => setSide(null)}>×</button></div>
            <p className="hw-side-d">가독성(단어 중간 줄바꿈 · 벌어진 빈칸 · 선에 붙은 글자 …)과 쪽 모양(제목만 쪽 끝에 남음 · 덜 찬 쪽)을 봤어. 쪽 계산은 한글과 몇 mm 다를 수 있어.</p>
            <ul className="hw-list">{check.lines.map((l, i) => <li key={i} className={/^RD\d\d\b/.test(l) ? "bad" : undefined}>{l}</li>)}</ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
export default DocEditor;

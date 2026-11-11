// 서랍 「요약 요청」(윈터 10:12 「① 요약 요청부터 판 하나씩 · 새 파일 + shell MODALS 줄 · 쓰기 있는 건 부르는 api 그대로」 · 형 「4번째 … 기능들이 다 서랍으로 나와서 바로바로」)
//   원본 = 에디터 제작 도구 ＋ 「요약 요청」(viewer/index.html #askSend 20060~20110줄 · askPreset 17680줄) — 에디터 통째(iframe · 느림) 대신 같은 API 를 바로 부르는 작은 폼
//   보냄 = POST /api/submit {text, link?, linkForce?, images:[dataUrl], nothumb, preset:{h24,fp,mj,og,noai,know}} → {ok, id, error}(원본 본문 그대로 · retryOf 는 안 씀)
//   꼴 = YETA 설정 카드(.yeta-set .ycd-card.card-left · 행 .yset-item · 칩 .yset-chip) · 접수 뒤 = 「접수됨 · 대기열 N」(GET /api/pending items 중 processing·retry 수 · 원본 loadPending 셈)
//   같은 출처(edit.nomute.kr) 라 쿠키 그대로 · 로그인 벽이면 HTML 이 와서 「다시 로그인」 안내
//   에디터 판(서랍 「요약 요청 · 에디터 판」 = /?tool=ask 통째) 몫을 여기로(형 11-01 17:4x 「시아 도와가지구, 좀 더 많은게 들어올수잇게」 · 시아 2차 안):
//     링크 판별 = 원본 probeAskLink(41-toolRfVis 790줄) · GET /api/linkprobe?u= → {kind, subs, dur} · 영상만 한 줄(자막 그대로 / large-v3 받아쓰기 / 미리 못 봄) · 기사 = 줄 없음
//     전사 강행 = 원본 alkForce(자막 없고 30분 넘을 때만 · 켜면 55분까지 · 55분 넘으면 못 함) · 옛 「링크 우선」 칩은 뜻이 틀려서 뺌(linkForce = 전사 상한 올리기)
//     초안 보존 = 글·링크를 이 기기에(nm_ask_draft) · 창을 닫았다 열어도 남고 보내면 비움(형 260727 「다른 페이지 갔다오면 휘발」) · 사진은 크기 때문에 안 남김
//     보내기 = 공용 게이지 단추(./go-button.tsx · 형 11-01 14:12) · 접수되면 ✓ 뒤 창이 저절로 닫힘(형 11-02 09:22 「이거 보내고 나면 창 자동으로 닫히면 됨 전손 후에」 · 닫는 길 = 껍데기 「<」 와 같은 closeModal)
import "./yeta-settings.css";
import "./ask.css";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { isForeignUrl } from "../home/quick-send";
import { GoButton } from "./go-button";
import { Pane } from "./pane";

type Preset = { h24: 0 | 1; fp: 0 | 1; mj: 0 | 1; og: 0 | 1; noai: 0 | 1; know: 0 | 1 };
const DEF: Preset = { h24: 1, fp: 0, mj: 1, og: 0, noai: 1, know: 0 };   // 원본 askPreset 기본(17680줄 · 창 열 때마다 이 값으로 돌아감)
const CHIPS: { k: keyof Preset; t: string; o?: string; d: string }[] = [   // o = 옛 판 「요약 요청」 탭에 보이는 글(/?old 실측 · 11-11)   // 라벨 = 원본 PP_LBL 12056줄(24h·외신·주요·원본) · noai·know 뜻 = 원본 4463줄 title 그대로
  { k: "h24", t: "24h", o: "24시간 내", d: "최근 24시간 안 기사" }, { k: "fp", t: "외신", o: "외신 기반", d: "외신 기반(끄면 국내 기반)" }, { k: "mj", t: "주요", d: "주요 매체 위주" },
  { k: "og", t: "원본", o: "원본 한정", d: "원본 한정" }, { k: "noai", t: "AI 썸네일 끔", o: "AI 미제작", d: "켜짐 = AI 썸네일을 만들지 않음(끄면 그 건만 평소대로 생성)" }, { k: "know", t: "지식형", o: "지식형", d: "뉴스 사건이 아니라 지식·설명 콘텐츠로 다룸(질문→핵심 답→이유→적용→주의)" },
];
const IMG_MAX = 4, IMG_BYTES = 6 * 1024 * 1024;
const DRAFT = "nm_ask_draft", STT_CAP = 1800, STT_FORCE_CAP = 3300;   // 전사 상한(초) = 원본 ALK_STT_CAP · ALK_STT_FORCE_CAP(news-ask.yml 사본 · 실제 문은 파이프)
type Probe = { st: "hide" | "wait" | "subs" | "stt" | "unknown"; dur: number };
const readDraft = (): { text?: string; link?: string } | null => { try { return JSON.parse(localStorage.getItem(DRAFT) || "null"); } catch { return null; } };
class Shown extends Error {}   // 이미 아래 줄에 까닭을 띄운 실패(게이지 단추엔 그대로 던짐)
const mins = (sec: number) => (sec >= 60 ? `${Math.round(sec / 60)}분` : `${Math.round(sec)}초`);

const SV = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const IC_IMG = <svg {...SV}><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="m21 16-5-5-9 9" /></svg>;
const IC_LINK = <svg {...SV}><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" /><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" /></svg>;
const IC_CLIP = <svg {...SV} width={14} height={14} strokeWidth={2}><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4h6v3H9z" /></svg>;
const readAsDataUrl = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f); });

export function AskModal({ onClose }: { onClose?: () => void } = {}) {
  // 홈 카드 「전송」 단추가 채워 둔 것(sessionStorage nm_ask_prefill · home/send-button.tsx) = 글·링크 미리 채움 · 한 번 읽고 지움 · 접수는 형이 「보내기」 눌러야
  const [pre] = useState(() => { try { const j = JSON.parse(sessionStorage.getItem("nm_ask_prefill") || "null") as { text?: string; link?: string; retryOf?: string } | null; sessionStorage.removeItem("nm_ask_prefill"); return j; } catch { return null; } });
  const [draft] = useState(() => (pre ? null : readDraft()));   // 미리 채움이 있으면 그게 먼저
  const [text, setText] = useState(pre?.text || draft?.text || ""), [link, setLink] = useState(pre?.link || draft?.link || ""), [force, setForce] = useState(false);
  const [probe, setProbe] = useState<Probe>({ st: "hide", dur: 0 }), seq = useRef(0);
  useEffect(() => { try { if (text.trim() || link.trim()) localStorage.setItem(DRAFT, JSON.stringify({ text, link })); else localStorage.removeItem(DRAFT); } catch { /* 이 기기에만 · 못 쓰면 이번만 */ } }, [text, link]);
  useEffect(() => {   // 링크 판별(쓰는 동안 0.6초 쉬면 · 늦게 온 옛 답은 버림)
    const l = link.trim(), my = ++seq.current;
    if (!/^https?:\/\//i.test(l)) { setProbe({ st: "hide", dur: 0 }); return undefined; }
    const t = setTimeout(async () => {
      setProbe((p) => ({ ...p, st: p.st === "hide" ? "hide" : "wait" }));
      try {
        const r = await fetch(`/api/linkprobe?u=${encodeURIComponent(l)}`, { credentials: "same-origin" }), d = (await r.json().catch(() => ({}))) as { kind?: string; subs?: boolean | null; dur?: number };
        if (my !== seq.current) return;
        setProbe(!r.ok || d.kind !== "media" ? { st: "hide", dur: 0 } : { st: d.subs === true ? "subs" : d.subs === false ? "stt" : "unknown", dur: Number(d.dur) || 0 });
      } catch { if (my === seq.current) setProbe({ st: "unknown", dur: 0 }); }
    }, 600);
    return () => clearTimeout(t);
  }, [link]);
  const over = (probe.st === "stt" || probe.st === "unknown") && probe.dur > STT_CAP, tooLong = over && probe.dur > STT_FORCE_CAP;
  useEffect(() => { if (!over && force) setForce(false); }, [over, force]);   // 짧은 영상·자막 길로 바뀌면 강행도 끔(원본 같은 꼴)
  const [imgs, setImgs] = useState<{ name: string; dataUrl: string }[]>([]);
  const [preset, setPreset] = useState<Preset>({ ...DEF });
  // 옛 뉴스 에디터 맨 위 「픽」 일을 여기로(형 11-11 14:36 봄 1:1 「글 붙여넣기는 없어두대! 우하단에 버튼으로 요약만 잇으면 댐」 · 봄 「픽 단추가 하던 일이 요약 요청 화면에 없으면 거기로 옮겨」)
  //   = 링크(링크 칸 · 없으면 글 안 첫 주소)가 외신이면 「외신 기반」 칩이 저절로 ✓ · 국내면 저절로 끔(../home/quick-send.ts isForeignUrl · 깃 29) · 칩을 손으로 누른 뒤엔 안 건드림
  const [fpHand, setFpHand] = useState(false);
  const autoUrl = link.trim() || (/https?:\/\/\S+/i.exec(text) || [""])[0];
  useEffect(() => { if (fpHand) return; const fp = isForeignUrl(autoUrl) ? 1 : 0; setPreset((p) => (p.fp === fp ? p : { ...p, fp })); }, [autoUrl, fpHand]);
  const [busy, setBusy] = useState(false), [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [showLink, setShowLink] = useState(false);   // 링크 칸 = 링크 아이콘을 누르면(옛 판 「링크 넣기」) · 링크가 이미 있으면 늘 보임
  const file = useRef<HTMLInputElement>(null);
  const loadPending = async () => {
    try {
      const r = await fetch("/api/pending?_=" + Date.now(), { credentials: "same-origin" });
      if (!r.ok) return;
      const d = (await r.json()) as { items?: { status?: string }[] };
      setPending((d.items || []).filter((it) => it && (it.status === "processing" || it.status === "retry")).length);   // 원본 PEND_PROC 셈
    } catch { /* 배지만 못 셈 */ }
  };
  useEffect(() => { void loadPending(); }, []);
  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const fs = [...(e.target.files || [])].slice(0, IMG_MAX - imgs.length);
    const out: { name: string; dataUrl: string }[] = [];
    for (const f of fs) { if (f.size > IMG_BYTES) { setNote({ kind: "err", text: `${f.name} — 6MB 까지` }); continue; } out.push({ name: f.name, dataUrl: await readAsDataUrl(f) }); }
    setImgs((s) => [...s, ...out]); e.target.value = "";
  };
  const fail = (msg: string): never => { setNote({ kind: "err", text: msg }); throw new Shown(msg); };   // 게이지 단추가 「못 보냄」 + 아래 줄에 까닭
  const send = async () => {
    const t = text.trim(), l = link.trim() || (/https?:\/\/\S+/i.exec(t) || [""])[0];   // 링크 칸이 비면 글 안 첫 주소를 링크로(옛 넣는 줄 「전송 · 픽」과 같은 꼴 · ../home/quick-send.ts submitText)
    if (l && !/^https?:\/\//i.test(l)) fail("링크는 http(s)로 시작해야 해 — 주소를 고쳐 줘");   // 원본 형식 게이트
    if (!t && !imgs.length && !l) fail("보낼 글·사진·링크 중 하나는 있어야 해");
    setBusy(true); setNote(null);
    try {
      const r = await fetch("/api/submit", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: t, link: l || undefined, retryOf: pre?.retryOf || undefined, linkForce: l && force ? 1 : undefined, images: imgs.map((x) => x.dataUrl), nothumb: preset.noai ? 1 : 0, preset }) });   // 원본 20087줄 본문 그대로(nothumb = noai 와 같이 · 원본은 「AI 그림」 토글 실효값이지만 이 폼은 noai 칩 하나로)
      const ct = r.headers.get("content-type") || "";
      if (!ct.includes("json")) fail(r.status === 200 ? "로그인이 끝났어 — 새로 고쳐 다시 로그인" : `서버 ${r.status}`);
      const d = (await r.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string };
      if (r.ok && d.ok) {
        setNote({ kind: "ok", text: `접수됨${d.id ? ` · ${d.id}` : ""} — 대기열에서 처리 중` });
        setText(""); setLink(""); setForce(false); setImgs([]); setPreset({ ...DEF }); setFpHand(false);
        setTimeout(() => void loadPending(), 1200); setTimeout(() => void loadPending(), 4000);   // 원본과 같은 두 번 갱신
      } else fail(d.error || `서버 ${r.status}`);
    } catch (e) {
      if (!(e instanceof Shown)) setNote({ kind: "err", text: navigator.onLine === false ? "기기가 오프라인이야 — 연결되면 다시 시도" : "앱 오류 — " + String((e as Error)?.message || e) });
      throw e;
    } finally { setBusy(false); }
  };
  // 꼴 = 옛 에디터 「요약 요청」 탭 그대로(형 11-11 09:01 봄 1:1 「… 폰트도 에디터 들은 거기에 맞춰 뉴스 요약 받는 것도 포함」 · 13:02 「이미지 썸네일 만들기랑 뉴스요약 뉴스요약 보기가 가장 많이 쓰는 기능이니까 그것만 따라오면 돼」 · 옛 = /?old .asktawrap 웹킷 폰 390 실측)
  //   글칸 한 장 안에 = 오른쪽 위 붙여넣기 · 아래 사진 · 링크(누르면 링크 칸) · 오른쪽 「전송」 · 그 아래 칩 다섯(✓ = 켜짐) · 「주요」(mj)는 옛 판처럼 칩 없이 기본값 그대로 보냄 · 「대기 n」 표 = 옛 판에 없어 뺌 · 색 = 정원 라임
  //   앞 판 = YETA 설정 카드(대기 배지 · 글칸 · 링크 칸 · 칩 여섯 · 사진 칩 · 「보내기」)
  const paste = async () => {
    try { const t = await navigator.clipboard.readText(); if (t) setText((v) => (v ? v.replace(/\s*$/, "\n") : "") + t); }
    catch { setNote({ kind: "err", text: "붙여넣기를 못 했어 — 글칸을 길게 눌러 붙여 줘" }); }
  };
  return (
    <Pane title="요약 요청">
      <div className="nm-ask nm-ask-o mt-2">
        <div className={`nm-ask-box${text ? " filled" : ""}`}>
          <textarea className="nm-ask-ta" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="내용을 입력해주세요" aria-label="요약할 글" disabled={busy} />
          <button type="button" className="nm-ask-clip" aria-label="붙여넣기" title="붙여넣기" onClick={() => void paste()} disabled={busy}>{IC_CLIP}</button>
          {showLink || link ? (
            <div className="nm-ask-linkrow">
              <input className="nm-ask-in" type="url" inputMode="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="링크 — 기사면 원문 · 영상이면 받아쓰기" aria-label="링크" disabled={busy} autoFocus={showLink && !link} />
              {over && !tooLong ? <button type="button" className={`nm-ask-chip${force ? " on" : ""}`} aria-pressed={force} onClick={() => setForce((v) => !v)} title="자막 없는 긴 영상 = 받아쓰기 상한을 30분 → 55분으로">{force ? "✓ " : ""}전사 강행</button> : null}
            </div>
          ) : null}
          {probe.st !== "hide" ? (
            <p className={`nm-ask-probe ${probe.st}`} role="status">
              {probe.st === "wait" ? "링크 확인 중…"
                : `영상 링크${probe.dur ? ` · ${mins(probe.dur)}` : ""} · ${probe.st === "subs" ? "자막이 있어서 자막을 그대로 써" : probe.st === "stt" ? "자막이 없어서 large-v3 로 받아써" : "자막이 있는지 미리 못 봤어 — 보내면 알아서 골라"}`}
              {over ? <b>{tooLong ? " · 55분 넘는 영상은 받아쓰기 못 해 — 자막 있는 영상으로" : force ? " · 전사 강행 = 55분까지" : " · 30분 넘어서 기본으론 못 받아써 — 「전사 강행」"}</b> : null}
            </p>
          ) : null}
          {imgs.length ? (
            <div className="nm-ask-imgs">
              {imgs.map((im, i) => <span key={im.name + i} className="nm-ask-img"><img src={im.dataUrl} alt="" /><button type="button" aria-label={`${im.name} 빼기`} onClick={() => setImgs((s) => s.filter((_, j) => j !== i))}>×</button></span>)}
            </div>
          ) : null}
          <div className="nm-ask-bar">
            <button type="button" className="nm-ask-ic" aria-label={`이미지 첨부 ${imgs.length}/${IMG_MAX}`} title={`사진 ${imgs.length}/${IMG_MAX}`} onClick={() => file.current?.click()} disabled={busy || imgs.length >= IMG_MAX}>{IC_IMG}</button>
            <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => void pick(e)} />
            <button type="button" className={`nm-ask-ic${showLink || link ? " on" : ""}`} aria-label="링크 넣기" aria-pressed={showLink || !!link} onClick={() => setShowLink((v) => !v)}>{IC_LINK}</button>
            <span className="nm-ask-sp" />
            {draft && (text || link) ? <button type="button" className="nm-ask-chip" onClick={() => { setText(""); setLink(""); setNote(null); }} disabled={busy}>초안 비우기</button> : null}
            <GoButton className="nm-ask-go" go={send} busy="보내는 중" done={() => onClose?.()}>전송</GoButton>
          </div>
        </div>
        <div className="nm-ask-chips-o" role="group" aria-label="수집 프리셋">
          {CHIPS.filter((c) => c.k !== "mj").map((c) => <button key={c.k} type="button" className={`nm-ask-chip${preset[c.k] ? " on" : ""}`} aria-pressed={!!preset[c.k]} title={c.d} onClick={() => { if (c.k === "fp") setFpHand(true); setPreset((p) => ({ ...p, [c.k]: p[c.k] ? 0 : 1 })); }} disabled={busy}>{preset[c.k] ? "✓ " : ""}{c.o}</button>)}
        </div>
        {note ? <p className={`nm-ask-note ${note.kind}`} role={note.kind === "err" ? "alert" : "status"}>{note.text}</p> : null}
      </div>
    </Pane>
  );
}

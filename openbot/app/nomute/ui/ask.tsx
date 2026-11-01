// 서랍 「요약 요청」(윈터 10:12 「① 요약 요청부터 판 하나씩 · 새 파일 + shell MODALS 줄 · 쓰기 있는 건 부르는 api 그대로」 · 형 「4번째 … 기능들이 다 서랍으로 나와서 바로바로」)
//   원본 = 에디터 제작 도구 ＋ 「요약 요청」(viewer/index.html #askSend 20060~20110줄 · askPreset 17680줄) — 에디터 통째(iframe · 느림) 대신 같은 API 를 바로 부르는 작은 폼
//   보냄 = POST /api/submit {text, link?, linkForce?, images:[dataUrl], nothumb, preset:{h24,fp,mj,og,noai,know}} → {ok, id, error}(원본 본문 그대로 · retryOf 는 안 씀)
//   꼴 = YETA 설정 카드(.yeta-set .ycd-card.card-left · 행 .yset-item · 칩 .yset-chip) · 접수 뒤 = 「접수됨 · 대기열 N」(GET /api/pending items 중 processing·retry 수 · 원본 loadPending 셈)
//   같은 출처(edit.nomute.kr) 라 쿠키 그대로 · 로그인 벽이면 HTML 이 와서 「다시 로그인」 안내
//   에디터 판(서랍 「요약 요청 · 에디터 판」 = /?tool=ask 통째) 몫을 여기로(형 11-01 17:4x 「시아 도와가지구, 좀 더 많은게 들어올수잇게」 · 시아 2차 안):
//     링크 판별 = 원본 probeAskLink(41-toolRfVis 790줄) · GET /api/linkprobe?u= → {kind, subs, dur} · 영상만 한 줄(자막 그대로 / large-v3 받아쓰기 / 미리 못 봄) · 기사 = 줄 없음
//     전사 강행 = 원본 alkForce(자막 없고 30분 넘을 때만 · 켜면 55분까지 · 55분 넘으면 못 함) · 옛 「링크 우선」 칩은 뜻이 틀려서 뺌(linkForce = 전사 상한 올리기)
//     초안 보존 = 글·링크를 이 기기에(nm_ask_draft) · 창을 닫았다 열어도 남고 보내면 비움(형 260727 「다른 페이지 갔다오면 휘발」) · 사진은 크기 때문에 안 남김
//     보내기 = 공용 게이지 단추(./go-button.tsx · 형 11-01 14:12)
import "./yeta-settings.css";
import "./ask.css";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { GoButton } from "./go-button";
import { Pane } from "./pane";
import { YICO } from "./yeta-icons";

type Preset = { h24: 0 | 1; fp: 0 | 1; mj: 0 | 1; og: 0 | 1; noai: 0 | 1; know: 0 | 1 };
const DEF: Preset = { h24: 1, fp: 0, mj: 1, og: 0, noai: 1, know: 0 };   // 원본 askPreset 기본(17680줄 · 창 열 때마다 이 값으로 돌아감)
const CHIPS: { k: keyof Preset; t: string; d: string }[] = [   // 라벨 = 원본 PP_LBL 12056줄(24h·외신·주요·원본) · noai·know 뜻 = 원본 4463줄 title 그대로
  { k: "h24", t: "24h", d: "최근 24시간 안 기사" }, { k: "fp", t: "외신", d: "외신 기반(끄면 국내 기반)" }, { k: "mj", t: "주요", d: "주요 매체 위주" },
  { k: "og", t: "원본", d: "원본 한정" }, { k: "noai", t: "AI 썸네일 끔", d: "켜짐 = AI 썸네일을 만들지 않음(끄면 그 건만 평소대로 생성)" }, { k: "know", t: "지식형", d: "뉴스 사건이 아니라 지식·설명 콘텐츠로 다룸(질문→핵심 답→이유→적용→주의)" },
];
const IMG_MAX = 4, IMG_BYTES = 6 * 1024 * 1024;
const DRAFT = "nm_ask_draft", STT_CAP = 1800, STT_FORCE_CAP = 3300;   // 전사 상한(초) = 원본 ALK_STT_CAP · ALK_STT_FORCE_CAP(news-ask.yml 사본 · 실제 문은 파이프)
type Probe = { st: "hide" | "wait" | "subs" | "stt" | "unknown"; dur: number };
const readDraft = (): { text?: string; link?: string } | null => { try { return JSON.parse(localStorage.getItem(DRAFT) || "null"); } catch { return null; } };
class Shown extends Error {}   // 이미 아래 줄에 까닭을 띄운 실패(게이지 단추엔 그대로 던짐)
const mins = (sec: number) => (sec >= 60 ? `${Math.round(sec / 60)}분` : `${Math.round(sec)}초`);

const readAsDataUrl = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f); });

export function AskModal() {
  // 홈 카드 「전송」 단추가 채워 둔 것(sessionStorage nm_ask_prefill · home/send-button.tsx) = 글·링크 미리 채움 · 한 번 읽고 지움 · 접수는 형이 「보내기」 눌러야
  const [pre] = useState(() => { try { const j = JSON.parse(sessionStorage.getItem("nm_ask_prefill") || "null") as { text?: string; link?: string } | null; sessionStorage.removeItem("nm_ask_prefill"); return j; } catch { return null; } });
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
  const [busy, setBusy] = useState(false), [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, setPending] = useState<number | null>(null);
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
    const t = text.trim(), l = link.trim();
    if (l && !/^https?:\/\//i.test(l)) fail("링크는 http(s)로 시작해야 해 — 주소를 고쳐 줘");   // 원본 형식 게이트
    if (!t && !imgs.length && !l) fail("보낼 글·사진·링크 중 하나는 있어야 해");
    setBusy(true); setNote(null);
    try {
      const r = await fetch("/api/submit", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: t, link: l || undefined, linkForce: l && force ? 1 : undefined, images: imgs.map((x) => x.dataUrl), nothumb: preset.noai ? 1 : 0, preset }) });   // 원본 20087줄 본문 그대로(nothumb = noai 와 같이 · 원본은 「AI 그림」 토글 실효값이지만 이 폼은 noai 칩 하나로)
      const ct = r.headers.get("content-type") || "";
      if (!ct.includes("json")) fail(r.status === 200 ? "로그인이 끝났어 — 새로 고쳐 다시 로그인" : `서버 ${r.status}`);
      const d = (await r.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string };
      if (r.ok && d.ok) {
        setNote({ kind: "ok", text: `접수됨${d.id ? ` · ${d.id}` : ""} — 대기열에서 처리 중` });
        setText(""); setLink(""); setForce(false); setImgs([]); setPreset({ ...DEF });
        setTimeout(() => void loadPending(), 1200); setTimeout(() => void loadPending(), 4000);   // 원본과 같은 두 번 갱신
      } else fail(d.error || `서버 ${r.status}`);
    } catch (e) {
      if (!(e instanceof Shown)) setNote({ kind: "err", text: navigator.onLine === false ? "기기가 오프라인이야 — 연결되면 다시 시도" : "앱 오류 — " + String((e as Error)?.message || e) });
      throw e;
    } finally { setBusy(false); }
  };
  const Svg = ({ k }: { k: keyof typeof YICO }) => <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO[k] }} />;
  return (
    <Pane title="요약 요청">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-ask">
          <span className="ycd-nm yset-ttl"><Svg k="chat" />요약 요청{pending != null ? <i className="nm-ask-badge" title="대기열 처리 중">{pending}</i> : null}</span>
          {pending != null ? <i className="nm-ask-badge nm-in-modal" title="대기열 처리 중">대기 {pending}</i> : null}
          <textarea className="nm-ask-ta" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="요약할 글을 붙이거나 할 말을 써 줘 (사진·링크만 보내도 돼)" aria-label="요약할 글" disabled={busy} />
          <div className="nm-ask-row">
            <input className="nm-ask-in" type="url" inputMode="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="링크(선택) — 기사면 원문 · 영상이면 받아쓰기" aria-label="링크" disabled={busy} />
            {over && !tooLong ? <button type="button" className={`yset-chip${force ? " on" : ""}`} aria-pressed={force} onClick={() => setForce((v) => !v)} title="자막 없는 긴 영상 = 받아쓰기 상한을 30분 → 55분으로">전사 강행</button> : null}
          </div>
          {probe.st !== "hide" ? (
            <p className={`nm-ask-probe ${probe.st}`} role="status">
              {probe.st === "wait" ? "링크 확인 중…"
                : `영상 링크${probe.dur ? ` · ${mins(probe.dur)}` : ""} · ${probe.st === "subs" ? "자막이 있어서 자막을 그대로 써" : probe.st === "stt" ? "자막이 없어서 large-v3 로 받아써" : "자막이 있는지 미리 못 봤어 — 처리 때 자막부터 찾아"}`}
              {over ? <b>{tooLong ? " · 55분 넘는 영상은 받아쓰기 못 해 — 자막 있는 영상으로" : force ? " · 전사 강행 = 55분까지" : " · 30분 넘어서 기본으론 못 받아써 — 「전사 강행」"}</b> : null}
            </p>
          ) : null}
          <div className="yset-chips nm-ask-chips" role="group" aria-label="수집 프리셋">
            {CHIPS.map((c) => <button key={c.k} type="button" className={`yset-chip${preset[c.k] ? " on" : ""}`} aria-pressed={!!preset[c.k]} title={c.d} onClick={() => setPreset((p) => ({ ...p, [c.k]: p[c.k] ? 0 : 1 }))} disabled={busy}>{c.t}</button>)}
          </div>
          <div className="nm-ask-row">
            <button type="button" className="yset-chip" onClick={() => file.current?.click()} disabled={busy || imgs.length >= IMG_MAX}>사진 {imgs.length}/{IMG_MAX}</button>
            <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => void pick(e)} />
            {imgs.map((im, i) => <span key={im.name + i} className="nm-ask-img"><img src={im.dataUrl} alt="" /><button type="button" aria-label={`${im.name} 빼기`} onClick={() => setImgs((s) => s.filter((_, j) => j !== i))}>×</button></span>)}
          </div>
          {note ? <p className={`nm-ask-note ${note.kind}`} role={note.kind === "err" ? "alert" : "status"}>{note.text}</p> : null}
          <div className="ypc-acts nm-ask-acts">
            {draft && (text || link) ? <button type="button" className="yset-chip" onClick={() => { setText(""); setLink(""); setNote(null); }} disabled={busy}>초안 비우기</button> : null}
            <GoButton className="ypc-go" go={send} busy="보내는 중">보내기</GoButton>
          </div>
        </div>
      </div>
    </Pane>
  );
}

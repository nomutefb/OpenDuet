// 기사 한 장 「썸네일 후보」 칸의 쓰는 손 셋 — 옛 에디터 기사 창을 앱 안으로(형 11-10 14:23 봄 1:1 「응 밖에잇는거 다 옮길거야」 · 봄 23:09 「뜸 = 이미지 생성 창 · 화풍 수정」)
//   ① 이미지 생성 창 = 옛 썸네일 칸 「+」 → #genidlg(옵션 = ./thumb-gen-opts.ts) → POST /api/genimg { file, opts } → imggen 워크플로(Opus 프롬프트 + Gemini/GPT 렌더 = 돈) → 그 기사 thumb_gen 앞에 붙음
//   ② 이 화풍 수정 = AI 칸 그림마다 연필 → #tredodlg(한 줄 · 비우면 그대로 다시 뽑기) → POST /api/thumbredo { article, sid, wish } → 원본은 두고 수정본이 +1장(sid_rN)
//   ③ 프롬프트만 뽑기 = 프롬프트가 아직 없는 기사 → POST /api/thumbredo { article, dry: "1" } → 네 화풍 프롬프트만(Gemini 0 · 돈 0)
//   서버 손 0 · 보내는 글 = 옛 창과 한 글자도 같음 · 돈 드는 ①② = 두 번 눌러야 나감(옛 재확인 꼴 · 피드 칸 ./feed-acts.tsx 와 같은 꼴)
//   끝 보기 = 목록(/articles.json) 다시 읽기 10초마다 → thumb_gen 이 늘면 끝 · 생성 실패 = /gen_out/genfail.json(옛 genFailOf) · 12분 = 시간 초과(옛 그대로)
//   만드는 중 표시는 이 기기에 15분 남김(새로 고쳐도 「만드는 중」 칸이 그대로)
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { GoButton } from "./go-button";
import { type Art, newsListQuery } from "./news-data";
import { CAM_KEYS, COLOR_AX, DICT, DEFAULT_SEL, MOOD_AX, type Pair, type Ref, type Sel, STYLES, arVal, baseSid, buildOpts, cloneAspect, colorPreset, pickStyle, restoreSel, subsOf, summary } from "./thumb-gen-opts";

const ARM_MS = 3500, POLL_MS = 10_000, GIVE_UP_MS = 12 * 60_000, KEEP_MS = 15 * 60_000;
const SEL_KEY = "nm_geni_sel", PEND_KEY = "nm_thumbgen_pend";

/** 같은 출처 POST(쿠키 그대로) — 받은 글이 JSON 이 아니면 로그인 끝(Access 가 로그인 화면을 돌려줌) */
async function post(url: string, body: object): Promise<{ ok?: boolean; via?: string; id?: string }> {
  let r: Response;
  try { r = await fetch(url, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
  catch { throw new Error(navigator.onLine === false ? "기기가 오프라인이야 — 연결되면 다시" : "연결이 끊겼거나 로그인이 끝났어 — 새로 고쳐 다시"); }
  if (!(r.headers.get("content-type") || "").includes("json")) throw new Error(r.status === 200 ? "로그인이 끝났어 — 새로 고쳐 다시 로그인" : `서버 ${r.status}`);
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; via?: string; id?: string };
  if (!r.ok || !d.ok) throw new Error(r.status === 429 ? d.error || "잠깐 많이 눌렀어 — 1분 뒤 다시" : d.error || `서버 ${r.status}`);
  return d;
}
const stemOf = (file: string) => file.replace(/\.md$/, "");
const queued = (d: { via?: string }) => (d.via === "r2-queue" ? " · 깃허브가 막혀서 큐에 받아 뒀어(풀리면 저절로 나가)" : "");

// ── 만드는 중(기기 안 · 기사마다) ──
export type Pend = { id: string; kind: "gen" | "redo"; base?: string; label?: string; before: number; n: number; t0: number; fail?: string };
type PendMap = Record<string, Pend[]>;
const listeners = new Set<() => void>();
let pendCache: PendMap | null = null;
function readPend(): PendMap {
  if (pendCache) return pendCache;
  let m: PendMap = {};
  try { m = JSON.parse(localStorage.getItem(PEND_KEY) || "{}") || {}; } catch { m = {}; }
  const now = Date.now();
  for (const f of Object.keys(m)) { m[f] = (Array.isArray(m[f]) ? m[f] : []).filter((p) => p && now - p.t0 < KEEP_MS); if (!m[f].length) delete m[f]; }
  return (pendCache = m);
}
function writePend(m: PendMap) {
  pendCache = m;
  try { localStorage.setItem(PEND_KEY, JSON.stringify(m)); } catch { /* 저장 막힌 기기 = 이 화면에서만 */ }
  listeners.forEach((l) => l());
}
const EMPTY: Pend[] = [];
export function usePend(file: string): Pend[] {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => readPend()[file] || EMPTY, () => EMPTY);
}
function addPend(file: string, p: Omit<Pend, "id" | "t0">) {
  const m = { ...readPend() };
  m[file] = [...(m[file] || []), { ...p, id: Math.random().toString(36).slice(2, 9), t0: Date.now() }];
  writePend(m);
}
function setPend(file: string, id: string, patch: Partial<Pend> | null) {
  const m = { ...readPend() };
  m[file] = (m[file] || []).map((p) => (p.id === id ? (patch ? { ...p, ...patch } : null) : p)).filter(Boolean) as Pend[];
  if (!m[file].length) delete m[file];
  writePend(m);
}
const lastFire = new Map<string, () => Promise<unknown>>();   // 실패 칸 「다시」 = 같은 설정 그대로(이 화면에 있는 동안만 · 참고 사진은 기기에 안 남김)

const genCount = (a: Art) => (a.cards?.thumb_gen || []).length;
const famCount = (a: Art, base: string) => (a.cards?.thumb_gen || []).filter((g) => g?.sid && baseSid(g.sid) === base).length;

/** 이 기사의 만드는 중을 지켜봄 — 늘면 지우고 · 실패 · 시간 초과면 칸에 까닭 · 지켜보는 동안 목록 10초마다 다시 읽기 */
export function usePendWatch(a: Art) {
  const qc = useQueryClient();
  const pend = usePend(a.file);
  const live = pend.filter((p) => !p.fail);
  useEffect(() => {
    for (const p of live) {
      const now = p.kind === "gen" ? genCount(a) : famCount(a, p.base || "");
      if (now > p.before) setPend(a.file, p.id, null);
      else if (Date.now() - p.t0 > GIVE_UP_MS) setPend(a.file, p.id, { fail: "시간 초과(12분) — 러너 혼잡이나 렌더 실패일 수 있어" });
    }
  });   // 그릴 때마다 = 목록이 새로 오면 바로 맞대 봄
  const busy = live.length > 0;
  useEffect(() => {
    if (!busy) return;
    const tick = async () => {
      void qc.invalidateQueries({ queryKey: newsListQuery.queryKey });
      const gens = (readPend()[a.file] || []).filter((p) => p.kind === "gen" && !p.fail);
      if (!gens.length) return;
      try {   // 생성 실패 = 러너가 적은 줄(옛 genFailOf · 이 기사 · 보낸 뒤 것만)
        const r = await fetch(`/gen_out/genfail.json?t=${Date.now()}`, { credentials: "same-origin" });
        const tx = r.ok ? await r.text() : "";
        if (!tx || /^\s*</.test(tx)) return;
        const arr = JSON.parse(tx) as { stem?: string; ts?: string; fail?: unknown; reason?: string }[];
        for (const p of gens) {
          const f = (Array.isArray(arr) ? arr : []).find((x) => x?.fail && x.stem === stemOf(a.file) && Date.parse(x.ts || "") >= p.t0 - 5000);
          if (f) setPend(a.file, p.id, { fail: String(f.reason || "까닭 모름").slice(0, 120) });
        }
      } catch { /* 못 읽음 = 다음 틱 */ }
    };
    const t = setInterval(() => void tick(), POLL_MS);
    return () => clearInterval(t);
  }, [busy, a.file, qc]);
  return pend;
}

/** 「만드는 중」 · 실패 칸(AI 줄 안 · 4:5) */
export function PendSlot({ a, p }: { a: Art; p: Pend }) {
  const again = lastFire.get(p.id);
  return (
    <div role="listitem" className={`nm-th-slot nm-tg-ld${p.fail ? " fail" : ""}`}>
      {p.fail ? (
        <span className="nm-tg-ldx">
          <b>⚠ 실패</b><small>{p.fail}</small>
          <span className="nm-tg-ldacts">
            {again ? <button type="button" className="nm-th-act txt" onClick={() => { setPend(a.file, p.id, null); lastFire.delete(p.id); void again().catch(() => {}); }}>다시</button> : null}
            <button type="button" className="nm-th-act txt" onClick={() => setPend(a.file, p.id, null)}>지우기</button>
          </span>
        </span>
      ) : (
        <span className="nm-tg-ldx" role="status"><i className="nm-tg-dots" aria-hidden><i /><i /><i /></i><b>{p.kind === "gen" ? `${p.n}개 만드는 중` : `${p.label || "수정본"} 고치는 중`}</b><small>보통 1~3분</small></span>
      )}
    </div>
  );
}

// ── ① 이미지 생성 창 ──
function loadSel(): Sel { try { return restoreSel(JSON.parse(localStorage.getItem(SEL_KEY) || "null")); } catch { return restoreSel(null); } }
function saveSel(s: Sel) { try { localStorage.setItem(SEL_KEY, JSON.stringify({ ...s, wish: "" })); } catch { /* 저장 막힘 = 다음엔 기본값 */ } }

/** 참고 사진 = 긴 변 512 · JPEG · 48KB 안(옛 geniRefDownscale · q 0.72 → 0.3 까지 낮춤) */
function shrinkRef(file: File): Promise<Ref | null> {
  return new Promise((res) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const nw = img.naturalWidth, nh = img.naturalHeight, s = Math.min(1, 512 / Math.max(nw, nh));
      const w = Math.max(1, Math.round(nw * s)), h = Math.max(1, Math.round(nh * s));
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      try { c.getContext("2d")!.drawImage(img, 0, 0, w, h); } catch { URL.revokeObjectURL(url); res(null); return; }
      URL.revokeObjectURL(url);
      let q = 0.72, out = c.toDataURL("image/jpeg", q);
      while (out.length - 23 > 48000 && q > 0.3) { q = Math.round((q - 0.1) * 100) / 100; out = c.toDataURL("image/jpeg", q); }
      res(out.length - 23 <= 48000 ? { b64: out.split(",")[1] || "", w: nw, h: nh, url: out } : null);
    };
    img.onerror = () => { URL.revokeObjectURL(url); res(null); };
    img.src = url;
  });
}

function Chips({ label, list, v, on, wrap }: { label: string; list: readonly Pair[]; v: string; on: (v: string) => void; wrap?: boolean }) {
  return (
    <div className="nm-tg-row">
      <span className="nm-tg-l">{label}</span>
      <div className={`yset-chips nm-tg-chips${wrap ? " wrap" : ""}`} role="radiogroup" aria-label={label}>
        {list.map(([k, ko]) => <button key={k} type="button" role="radio" aria-checked={v === k} className={`yset-chip${v === k ? " on" : ""}`} onClick={() => on(k)}>{ko}</button>)}
      </div>
    </div>
  );
}
function Gauge({ name, lo, hi, v, min, max, on }: { name: string; lo: string; hi: string; v: number; min: number; max: number; on: (v: number) => void }) {
  return (
    <label className="nm-tg-gg">
      <span className="nm-tg-ggh"><b>{name}</b><i>{v > 0 ? `+${v}` : v}</i></span>
      <input type="range" min={min} max={max} step={1} value={v} onChange={(e) => on(parseInt(e.target.value, 10) || 0)} aria-label={`${name} (${lo} ~ ${hi})`} />
      <span className="nm-tg-ggend"><small>{lo}</small><small>{hi}</small></span>
    </label>
  );
}
function Fold({ title, n, open, on, children }: { title: string; n?: number; open: boolean; on: () => void; children: ReactNode }) {
  return (
    <div className="nm-tg-fold">
      <button type="button" className="nm-tg-foldh" aria-expanded={open} onClick={on}><b>{title}</b>{n ? <i>{n}</i> : null}<span className="nm-tg-chev" aria-hidden>▾</span></button>
      {open ? <div className="nm-tg-foldb">{children}</div> : null}
    </div>
  );
}

export function GenPane({ a, onDone }: { a: Art; onDone: () => void }) {
  const [s, setS0] = useState<Sel>(loadSel);
  const [ref, setRef] = useState<Ref | null>(null);
  const [armed, setArmed] = useState(false);
  const [err, setErr] = useState("");
  const [fold, setFold] = useState<{ cam: boolean; ov: boolean; ex: boolean }>({ cam: false, ov: true, ex: true });
  const fileIn = useRef<HTMLInputElement>(null);
  const set = (p: Partial<Sel>) => { setS0((o) => { const n = { ...o, ...p }; if (!n.colorTouched) n.colorAx = colorPreset(n, !!ref); saveSel(n); return n; }); setArmed(false); };
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), ARM_MS); return () => clearTimeout(t); }, [armed]);
  const pickRef = async (f: File | undefined) => {
    setErr("");
    if (!f) return;
    if (!/^image\//.test(f.type || "")) { setErr("그림 파일만 붙일 수 있어"); return; }
    const r = await shrinkRef(f);
    if (!r) { setErr("이 사진은 줄이지 못했어 — 다른 사진으로"); return; }
    setRef(r);
    setS0((o) => { let n = o; if (o.refMode === "clone") { const ca = cloneAspect(r.w, r.h); if (ca) n = { ...n, ...ca }; } if (!n.colorTouched) n = { ...n, colorAx: colorPreset(n, true) }; saveSel(n); return n; });
  };
  const camN = CAM_KEYS.filter(([k]) => s[k] !== "auto").length;
  const ar = s.aspect === "custom" ? arVal(s.arW, s.arH) : s.aspect;
  const fire = async () => {
    setErr("");
    const opts = buildOpts(s, ref);
    if (!opts) { setErr("직접 비율은 1~99 : 1~99 · 1:4 ~ 4:1 안으로"); throw new Error("비율"); }
    const body = { file: stemOf(a.file), opts }, n = Number(opts.count) || 1, before = genCount(a);
    const go = async () => {
      const d = await post("/api/genimg", body);
      addPend(a.file, { kind: "gen", before, n });
      const mine = (readPend()[a.file] || []).slice(-1)[0];
      if (mine) lastFire.set(mine.id, go);
      return d;
    };
    try { return await go(); } catch (e) { setErr((e as Error).message); throw e; }
  };
  const lbl = (list: readonly Pair[], v: string) => (list.find(([k]) => k === v) || [, v])[1];
  return (
    <div className="nm-tg-pane" role="group" aria-label="이미지 생성">
      <div className="nm-tg-head">
        <b>이미지 생성</b>
        <span className="nm-tg-sum">{summary(s)}</span>
      </div>
      <p className="nm-tg-why pay">기사 요약 · 시사점 + 고른 옵션으로 프롬프트를 짜서 그려 · 그림은 {s.engine === "gpt" ? "GPT Image" : "Gemini"}라 돈 들어 · 두 번 눌러야 나가</p>

      <div className="nm-tg-row col">
        <span className="nm-tg-l">내용</span>
        <textarea className="nm-feed-ta nm-tg-ta" rows={2} maxLength={300} value={s.wish} onChange={(e) => set({ wish: e.target.value })} placeholder="선택 · 자유 요청 한 줄 — 비우면 기사대로" aria-label="주문" />
      </div>
      <div className="nm-tg-row">
        <span className="nm-tg-l">참고 사진</span>
        <div className="nm-tg-ref">
          {ref ? <img src={ref.url} alt="참고 사진" /> : null}
          <button type="button" className="yset-chip" onClick={() => fileIn.current?.click()}>{ref ? "바꾸기" : "붙이기"}</button>
          {ref ? <button type="button" className="yset-chip" onClick={() => { setRef(null); setS0((o) => { const n = o.colorTouched ? o : { ...o, colorAx: colorPreset(o, false) }; saveSel(n); return n; }); }}>빼기</button> : <small>선택 · 긴 변 512 로 줄여 보냄</small>}
          <input ref={fileIn} type="file" accept="image/*" hidden onChange={(e) => { void pickRef(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
      </div>
      {ref ? <Chips label="사진을" list={DICT.refMode} v={s.refMode} on={(v) => { const rm = v as Sel["refMode"]; const ca = rm === "clone" ? cloneAspect(ref.w, ref.h) : null; set({ refMode: rm, ...(ca || {}) }); }} /> : null}

      <Fold title="카메라 · 구도" n={camN} open={fold.cam} on={() => setFold((f) => ({ ...f, cam: !f.cam }))}>
        {CAM_KEYS.map(([k, ko]) => <Chips key={k} label={ko} list={DICT[k]} v={s[k]} on={(v) => set({ [k]: v } as Partial<Sel>)} />)}
      </Fold>
      <Fold title="개요" open={fold.ov} on={() => setFold((f) => ({ ...f, ov: !f.ov }))}>
        <Chips label="모델" list={DICT.engine} v={s.engine} on={(v) => set({ engine: v as Sel["engine"], engineTouched: true })} />
        {s.style === "lego" && s.engine === "gpt" ? <p className="nm-tg-why">[화풍: 레고]는 GPT 추천</p> : null}
        <Chips label="해상도" list={DICT.size} v={s.size} on={(v) => set({ size: v })} />
        <div className="nm-tg-row">
          <span className="nm-tg-l">비율</span>
          <div className="yset-chips nm-tg-chips" role="radiogroup" aria-label="비율">
            {DICT.aspect.map(([k, ko]) => <button key={k} type="button" role="radio" aria-checked={s.aspect === k} className={`yset-chip${s.aspect === k ? " on" : ""}`} onClick={() => set({ aspect: k, ...(k === "custom" && !s.arW && !s.arH ? { arW: "1", arH: "1" } : {}) })}>{ko}</button>)}
            {s.aspect === "custom" ? (
              <span className={`nm-tg-ar${ar ? "" : " bad"}`}>
                <input inputMode="numeric" maxLength={2} value={s.arW} onChange={(e) => set({ arW: e.target.value.replace(/\D/g, "").slice(0, 2) })} aria-label="비율 가로" />
                <b>:</b>
                <input inputMode="numeric" maxLength={2} value={s.arH} onChange={(e) => set({ arH: e.target.value.replace(/\D/g, "").slice(0, 2) })} aria-label="비율 세로" />
              </span>
            ) : null}
          </div>
        </div>
        <Chips label="개수" list={DICT.count} v={s.count} on={(v) => set({ count: v })} />
      </Fold>
      <Fold title="표현" open={fold.ex} on={() => setFold((f) => ({ ...f, ex: !f.ex }))}>
        <Chips label="화풍" list={STYLES} v={s.style} on={(v) => { setS0((o) => { const n0 = pickStyle(o, v); const n = n0.colorTouched ? n0 : { ...n0, colorAx: colorPreset(n0, !!ref) }; saveSel(n); return n; }); setArmed(false); }} />
        {subsOf(s.style).length > 1 ? <Chips label="세부 화풍" list={subsOf(s.style)} v={s.sub} on={(v) => set({ sub: v })} /> : null}
        <div className="nm-tg-row">
          <span className="nm-tg-l">한국웹툰화</span>
          <button type="button" className={`yset-chip${s.kweb ? " on" : ""}`} aria-pressed={s.kweb} onClick={() => set({ kweb: !s.kweb })}>{s.kweb ? "켜짐" : "꺼짐"}</button>
        </div>
        <div className="nm-tg-row">
          <span className="nm-tg-l">무드</span>
          <div className="yset-chips nm-tg-chips" role="radiogroup" aria-label="무드">
            {([["auto", "자동"], ["axes", "직접"]] as const).map(([k, ko]) => <button key={k} type="button" role="radio" aria-checked={s.mood === k} className={`yset-chip${s.mood === k ? " on" : ""}`} onClick={() => set({ mood: k })}>{ko}</button>)}
          </div>
        </div>
        {s.mood === "axes" ? <div className="nm-tg-ggs">{MOOD_AX.map(([k, name, lo, hi]) => <Gauge key={k} name={name} lo={lo} hi={hi} v={s.moodAx[k]} min={-2} max={2} on={(v) => set({ moodAx: { ...s.moodAx, [k]: v } })} />)}</div> : null}
        <div className="nm-tg-row">
          <span className="nm-tg-l">색 보정</span>
          <button type="button" className="yset-chip" onClick={() => set({ colorTouched: false, colorAx: colorPreset(s, !!ref) })}>기본값</button>
        </div>
        <div className="nm-tg-ggs">{COLOR_AX.map(([k, name, lo, hi]) => <Gauge key={k} name={name} lo={lo} hi={hi} v={s.colorAx[k]} min={-50} max={50} on={(v) => set({ colorAx: { ...s.colorAx, [k]: v }, colorTouched: true })} />)}</div>
        <div className="nm-tg-row">
          <span className="nm-tg-l">문구</span>
          <button type="button" className={`yset-chip${s.textOn ? " on" : ""}`} aria-pressed={s.textOn} title="켜면 주문에서 문구를 정해 그림 안에 살림" onClick={() => set({ textOn: !s.textOn })}>{s.textOn ? "켜짐" : "꺼짐"}</button>
        </div>
      </Fold>

      {err ? <p className="nm-feed-note err" role="alert">{err}</p> : null}
      <div className="ypc-acts nm-feed-acts nm-tg-acts">
        <button type="button" className="yset-chip" onClick={() => { const n = { ...DEFAULT_SEL, moodAx: { ...DEFAULT_SEL.moodAx }, colorAx: colorPreset(DEFAULT_SEL, !!ref), wish: s.wish }; setS0(n); saveSel(n); setArmed(false); }}>기본으로</button>
        {!armed
          ? <button type="button" className="ypc-go nm-go" disabled={!ar} onClick={() => setArmed(true)}>{`생성 · ${s.count}개`}</button>
          : <GoButton className="ypc-go nm-feed-arm" go={fire} busy="보내는 중" done={onDone}>{`한 번 더 = ${lbl(STYLES, s.style)} ${s.count}개 그리기(돈)`}</GoButton>}
      </div>
    </div>
  );
}

// ── ② 이 화풍 수정 ──
export function RedoPane({ a, sid, label, onDone }: { a: Art; sid: string; label: string; onDone: () => void }) {
  const [wish, setWish] = useState("");
  const [armed, setArmed] = useState(false);
  const [err, setErr] = useState("");
  const base = baseSid(sid);
  const busy = usePend(a.file).some((p) => p.kind === "redo" && p.base === base && !p.fail);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), ARM_MS); return () => clearTimeout(t); }, [armed]);
  useEffect(() => { setWish(""); setArmed(false); setErr(""); }, [sid]);   // 다른 화풍으로 = 앞 글 안 남김(옛 TREDO_LAST)
  const fire = async () => {
    setErr("");
    const body = { article: stemOf(a.file), sid, wish: wish.trim() };
    const go = async () => {
      const d = await post("/api/thumbredo", body);
      addPend(a.file, { kind: "redo", base, label, before: famCount(a, base), n: 1 });
      const mine = (readPend()[a.file] || []).slice(-1)[0];
      if (mine) lastFire.set(mine.id, go);
      return d;
    };
    try { const d = await go(); if (d.via === "r2-queue") setErr(queued(d).replace(/^ · /, "")); return d; } catch (e) { setErr((e as Error).message); throw e; }
  };
  return (
    <div className="nm-tg-pane redo" role="group" aria-label={`${label} 수정`}>
      <div className="nm-tg-head"><b>이미지 수정 요청</b><span className="nm-tg-sum">{label}</span></div>
      <p className="nm-tg-why pay">이 화풍만 다시 그려 · 원본은 두고 수정본이 한 장 더 붙어 · 비우면 같은 프롬프트로 다시 뽑기 · 제미나이라 돈 들어 · 두 번 눌러야 나가</p>
      <textarea className="nm-feed-ta" rows={2} maxLength={500} value={wish} onChange={(e) => { setWish(e.target.value); setArmed(false); }} placeholder="어떻게 고칠지 한 줄 — 예: 인물 빼고 건물만 · 더 어둡게" aria-label="어떻게 고칠까" autoFocus />
      {busy ? <p className="nm-tg-why" role="status">이 화풍은 지금 고치는 중이야 — 끝나면 다시 고칠 수 있어</p> : null}
      {err ? <p className="nm-feed-note err" role="alert">{err}</p> : null}
      <div className="ypc-acts nm-feed-acts nm-tg-acts">
        <button type="button" className="yset-chip" onClick={onDone}>닫기</button>
        {!armed
          ? <button type="button" className="ypc-go nm-go" disabled={busy} onClick={() => setArmed(true)}>수정</button>
          : <GoButton className="ypc-go nm-feed-arm" go={fire} busy="보내는 중" disabled={busy} done={onDone}>한 번 더 = 다시 그리기(돈)</GoButton>}
      </div>
    </div>
  );
}

// ── ③ 프롬프트만 뽑기 ──
export function PromptDry({ a }: { a: Art }) {
  const qc = useQueryClient();
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const go = async () => {
    setNote(null);
    try {
      const d = await post("/api/thumbredo", { article: stemOf(a.file), dry: "1" });
      setNote({ kind: "ok", text: "보냈어 — 네 화풍 프롬프트만 뽑는 중(그림 0 · 돈 0) · 2~4분 뒤 여기 「프롬프트 4종」이 떠" });
      for (const ms of [90_000, 180_000, 300_000]) setTimeout(() => void qc.invalidateQueries({ queryKey: newsListQuery.queryKey }), ms);
      return d;
    } catch (e) { setNote({ kind: "err", text: (e as Error).message }); throw e; }
  };
  return (
    <div className="nm-tg-dry">
      <GoButton className="yset-chip" go={go} busy="보내는 중" label="프롬프트만 뽑기 — 그림 없이 네 화풍 프롬프트(돈 0)">프롬프트만 뽑기</GoButton>
      {note ? <p className={`nm-feed-note ${note.kind}`} role={note.kind === "err" ? "alert" : "status"}>{note.text}</p> : null}
    </div>
  );
}

/** 연필(AI 칸 그림마다 · 옛 thumbRedoSbtn) */
export const IcPen = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;

// 서랍 「구독 채널」 = 에디터 설정 ▸ 구독 채널 창(/?pop=snsacc · viewer-src/38-openTref.part openSnsAcc · renderAccChips · addAccIn · accSave)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   같은 길 = GET /api/snsacc · POST /api/snsacc {patch: {고친 플랫폼만}} → 서버 정규화 결과(accounts)로 맞춤 · 수집 반영 = sns-trends 런(30분)
//   원본 규칙 그대로: 계정 형식(영문·숫자·._- 30자) · 같은 계정 두 번 안 됨 · 플랫폼마다 kr 30 + gl 30 = 60(kr 부터 채움 · 지역 무관 한 목록) · 구독 끄기 = 목록은 두고 수집·화면만 끔
//   읽기 실패면 저장 잠금(빈·낡은 목록으로 서버 목록 통째 교체 = 구독 계정 전멸 막기 · 원본 260923) · 저장 = 고친 플랫폼만(다른 기기 저장분 보존) · 입력칸에 남은 계정은 저장이 대신 추가
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./snsacc.css";
import { useEffect, useRef, useState } from "react";
import { Pane } from "./pane";

type Plat = { kr: string[]; gl: string[]; off?: boolean; shorts?: string[]; aivid?: string[]; news_cat?: number; news_cats?: number[] };
type Acc = Record<string, Plat>;
const TABS: [string, string][] = [["x", "X"], ["tiktok", "틱톡"], ["insta", "인스타"], ["youtube", "유튜브"], ["threads", "스레드"]];
const ACC_RX = /^@?[A-Za-z0-9][A-Za-z0-9._-]{0,29}$/;   // snsacc.js 서버 검증과 같은 규격
const CAP: Record<string, number> = { x: 30, tiktok: 30, insta: 30, youtube: 30, threads: 30 };   // 지역별 상한(snsacc.js CAP · scraper _REG_CAP 와 같은 값)
function accPlat(p: unknown): Plat {   // 원본 accPlat — 옛 평면 배열 = gl · 유튜브 토픽 축·off 는 같이 실어야 저장 때 안 사라짐(서버 patch = 키 통째 교체)
  const o: Plat = Array.isArray(p) ? { kr: [], gl: (p as string[]).slice() } : { kr: ((p as Plat)?.kr) || [], gl: ((p as Plat)?.gl) || [] };
  if (p && !Array.isArray(p)) {
    const q = p as Plat;
    if (q.off === true) o.off = true;
    if (Array.isArray(q.shorts)) o.shorts = q.shorts.slice();
    if (Array.isArray(q.aivid)) o.aivid = q.aivid.slice();
    if (Number.isInteger(q.news_cat)) o.news_cat = q.news_cat;
    if (Array.isArray(q.news_cats)) o.news_cats = q.news_cats.slice();
  }
  return o;
}
const blank = (): Acc => Object.fromEntries(TABS.map(([k]) => [k, accPlat(null)]));

export function SnsAccModal() {
  const [acc, setAcc] = useState<Acc>(blank), [tab, setTab] = useState("x"), [dirty, setDirty] = useState<Set<string>>(new Set());
  const [readOk, setReadOk] = useState(false), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [inp, setInp] = useState(""), [err, setErr] = useState(""), [note, setNote] = useState("");
  const inRef = useRef<HTMLInputElement>(null);
  useEffect(() => {   // 원본 openSnsAcc — 열 때마다 다시 읽음(다른 기기 편집 맞춤 · 안 저장한 편집은 버림)
    let live = true;
    (async () => {
      try {
        const r = await fetch("/api/snsacc", { credentials: "same-origin" }); const j = await r.json();
        if (!live) return;
        if (r.ok && !j.error) { setAcc(Object.fromEntries(TABS.map(([k]) => [k, accPlat(j[k])]))); setReadOk(true); }
        else setErr("목록 불러오기 실패 — 저장 잠금(덮어쓰기 방지) · 다시 열어 재시도");
      } catch { if (live) setErr("목록 불러오기 실패 — 저장 잠금(덮어쓰기 방지) · 다시 열어 재시도"); }
      if (live) setLoading(false);
    })();
    return () => { live = false; };
  }, []);
  const P = acc[tab] || accPlat(null);
  const list = [...(P.kr || []).map((a, i) => ["kr", i, a] as const), ...(P.gl || []).map((a, i) => ["gl", i, a] as const)];   // 지역 무관 한 목록(원본 260821) · 지울 땐 원 지역 칸으로
  const edit = (fn: (p: Plat) => void) => { setAcc((a) => { const n = { ...a, [tab]: accPlat(a[tab]) }; fn(n[tab]); return n; }); setDirty((d) => new Set(d).add(tab)); setNote(""); };
  const add = (): boolean => {   // 원본 addAccIn — 실패면 사유를 그 자리에 · 성공/빈칸 = true
    setErr("");
    const v = inp.trim().replace(/^@/, ""); if (!v) return true;
    if (!ACC_RX.test(v)) { setErr("형식이 안 맞아 (영문·숫자·._- 30자 이내)"); return false; }
    if ([...P.kr, ...P.gl].some((x) => x.toLowerCase() === v.toLowerCase())) { setErr("이미 있는 계정"); return false; }
    if (P.kr.length >= CAP[tab] && P.gl.length >= CAP[tab]) { setErr(`구독 최대 ${CAP[tab] * 2}개`); return false; }
    edit((p) => { (p.kr.length < CAP[tab] ? p.kr : p.gl).push(v); });   // kr 부터 채우고 넘치면 gl(서버 지역별 상한 그대로)
    setInp(""); return true;
  };
  const save = async () => {   // 원본 accSave — 입력칸에 남은 계정은 저장이 대신 추가 · 고친 플랫폼만 보냄 · 읽기 실패면 잠금
    let d = dirty, a = acc;
    if (inp.trim()) {   // 상태가 다음 그림에서야 바뀌니 여기서 한 번 더 셈
      const v = inp.trim().replace(/^@/, "");
      if (!ACC_RX.test(v)) { setErr("형식이 안 맞아 (영문·숫자·._- 30자 이내)"); return; }
      if ([...P.kr, ...P.gl].some((x) => x.toLowerCase() === v.toLowerCase())) { setErr("이미 있는 계정"); return; }
      if (P.kr.length >= CAP[tab] && P.gl.length >= CAP[tab]) { setErr(`구독 최대 ${CAP[tab] * 2}개`); return; }
      const np = accPlat(a[tab]); (np.kr.length < CAP[tab] ? np.kr : np.gl).push(v);
      a = { ...a, [tab]: np }; d = new Set(d).add(tab); setAcc(a); setDirty(d); setInp("");
    }
    if (!d.size) return;
    if (!readOk) { setErr("목록 불러오기 실패 — 저장 잠금(덮어쓰기 방지) · 다시 열어 재시도"); return; }
    setBusy(true); setErr(""); setNote("");
    try {
      const patch: Record<string, Plat> = {}; d.forEach((k) => { patch[k] = a[k] || accPlat(null); });
      const r = await fetch("/api/snsacc", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ patch }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.error) throw new Error(j.error || "HTTP " + r.status);
      if (j.accounts) setAcc(Object.fromEntries(TABS.map(([k]) => [k, accPlat(j.accounts[k])])));   // 서버 정규화 결과로 맞춤
      setDirty(new Set()); setNote("저장했어 · 수집은 다음 회차(30분 안)부터");
    } catch (e) { setErr("저장 실패 — " + ((e as Error)?.message || "네트워크")); }
    setBusy(false);
  };
  const canSave = !busy && readOk && (dirty.size > 0 || !!inp.trim());
  return (
    <Pane title="구독 채널">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo nm-acc">
          <span className="ycd-nm yset-ttl">구독 채널</span>
          <div className="nm-acc-tabs" role="tablist">
            {TABS.map(([k, lab]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); setErr(""); }}>{lab}{dirty.has(k) ? <i aria-label="안 저장한 편집">•</i> : null}</button>)}
          </div>
          {loading ? <p className="nm-chan-msg">불러오는 중…</p> : (
            <div className="nm-acc-chips">
              {list.length ? list.map(([r, i, a]) => (
                <button key={r + i + a} type="button" className="nm-acc-chip" aria-label={"@" + a + " 삭제"} onClick={() => edit((p) => { p[r].splice(i, 1); })}>@<span>{a}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M6 6 18 18M18 6 6 18" /></svg></button>
              )) : <p className="nm-chan-msg">구독한 계정 없음 — 아래에 추가</p>}
            </div>
          )}
          <div className="nm-acc-add">
            <input ref={inRef} type="text" value={inp} placeholder="계정명 (예: OpenAI)" aria-label="계정명" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="done"
              onChange={(e) => { setInp(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); add(); } }} />
            <button type="button" className="go" disabled={!inp.trim() || loading} onClick={add}>추가</button>
          </div>
          {err ? <p className="nm-acc-err" role="alert">{err}</p> : note ? <p className="nm-chan-msg" role="status">{note}</p> : null}
          <div className="nm-acc-foot">
            <label className="nm-acc-off"><input type="checkbox" checked={P.off === true} disabled={loading} onChange={(e) => edit((p) => { if (e.target.checked) p.off = true; else delete p.off; })} />구독 끄기(화면 숨김)</label>
            <button type="button" className="nm-acc-save" disabled={!canSave} onClick={save}>{busy ? "저장 중…" : "저장"}</button>
          </div>
        </div>
      </div>
    </Pane>
  );
}

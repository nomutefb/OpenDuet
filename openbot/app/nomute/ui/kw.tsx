// 서랍 「키워드 알림」 = 에디터 설정 ▸ 키워드 알림 창(/?pop=kw · viewer-src/41-toolRfVis.part renderKwList·kwAdd·kwEdit·kwSetDone·kwRearm · 42-kwDocs.part kwOpenSrc·ON/OFF)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   저장 = 원본과 같은 서버 설정 한 장(GET /api/settings 의 kwAlertOn · kwItems · POST {patch, base} = 메모와 같은 길 · 다른 기기에서 그새 바뀌면 다시 읽고 알림)
//   발견 판정(국내·해외 커뮤니티 글에 키워드가 뜨면 첫 1회 + 24시간 동안 3시간마다)은 에디터·서버 쪽 그대로 · 이 창은 목록 관리만
//   줄 = 번호 · 등록일 · 키워드 · 발견(일시)/미발견 · 왼쪽(미발견 = 고치기 · 발견 = 이동) · 오른쪽(미발견 = 지움 · 발견 = 확인 체크 = 알림 멈춤 · 하루 뒤 저절로 지움)
//   이동 = 발견한 글을 열고 그 줄에 밑줄(알림 멈춤) · 밑줄 줄을 누르면 다시 감시(발견 기록 비움 · 원본 kwRearm)
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./kw.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getJson } from "./news-data";
import { Pane } from "./pane";

type Kw = { id?: string; kw: string; ts: number; hit: number; done: boolean; doneAt: number; url: string; moved: number; rearm: number };
type Settings = { kwAlertOn?: boolean; kwItems?: Kw[]; error?: string; code?: string; settings?: Settings };
const KEY = ["nomute", "settings"] as const;   // 메모와 같은 설정 한 장
const KW_CAP = 40, KW_DONE_TTL = 24 * 3600000;
const norm = (s: string) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();   // 원본 kwNorm
const clean = (a: Kw[]): Kw[] => {   // 원본 _kwClean(서버 settings.js cleanKwItems 미러)
  const out: Kw[] = [];
  for (const it of a || []) {
    if (!it || typeof it !== "object") continue;
    const kw = typeof it.kw === "string" ? it.kw.slice(0, 120).trim() : ""; if (!kw) continue;
    const url = typeof it.url === "string" && /^https?:\/\//i.test(it.url) ? it.url.slice(0, 400) : "";
    out.push({ ...(typeof it.id === "string" ? { id: it.id.slice(0, 100) } : {}), kw, ts: Number.isFinite(it.ts) ? it.ts : 0, hit: Number.isFinite(it.hit) ? it.hit : 0, done: it.done === true, doneAt: Number.isFinite(it.doneAt) ? it.doneAt : 0, url, moved: Number.isFinite(it.moved) ? it.moved : 0, rearm: Number.isFinite(it.rearm) ? it.rearm : 0 });
    if (out.length >= KW_CAP) break;
  }
  return out;
};
const day = (ts: number) => { const d = ts ? new Date(ts) : null; return d && !Number.isNaN(+d) ? `${d.getMonth() + 1}. ${d.getDate()}.` : "-"; };   // 원본 kwDate
const hitAt = (ts: number) => { const d = ts ? new Date(ts) : null; if (!d || Number.isNaN(+d)) return ""; const p = (n: number) => String(n).padStart(2, "0"); return `(${d.getMonth() + 1}.${d.getDate()}. ${p(d.getHours())}:${p(d.getMinutes())})`; };   // 원본 kwHitAt

export function KwModal() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, staleTime: 15_000, queryFn: () => getJson<Settings>(`/api/settings?_=${Date.now()}`) });
  const items = Array.isArray(q.data?.kwItems) ? q.data!.kwItems! : [];
  const on = q.data?.kwAlertOn === true;
  const [box, setBox] = useState(false), [text, setText] = useState(""), [edit, setEdit] = useState(-1), [busy, setBusy] = useState(false), [note, setNote] = useState(""), [arm, setArm] = useState(-1);
  const inp = useRef<HTMLInputElement>(null);
  const save = async (patch: Partial<Settings>, base: Partial<Settings>) => {   // 원본 saveSettings — base = 배열 칸(kwItems)만 내가 읽은 값 · 하나짜리 값(kwAlertOn)은 빈 base
    setBusy(true); setNote("");
    try {
      const r = await fetch("/api/settings", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ patch, base }) });
      const j = (await r.json().catch(() => ({}))) as Settings;
      if (r.ok && j.settings) { qc.setQueryData(KEY, j.settings); return true; }
      if (j.code === "settings-conflict" || j.code === "refresh-required") { await qc.invalidateQueries({ queryKey: KEY }); setNote("다른 기기에서 그새 바뀌어서 다시 불러왔어 — 한 번 더 해 줘"); return false; }
      setNote(j.error || "아직 저장 못 했어 — 잠시 뒤 다시"); return false;
    } catch { setNote("네트워크 오류 — 다시"); return false; }
    finally { setBusy(false); }
  };
  const saveItems = (next: Kw[]) => save({ kwItems: clean(next) }, { kwItems: items });
  useEffect(() => {   // 원본 kwPurgeDone — 그릴 때 = 확인(빗금)한 지 하루 넘은 줄은 스스로 지움(구 데이터 = hit 시각 기준)
    if (!q.data || busy) return;
    const now = Date.now(), keep = items.filter((it) => !(it && it.done && now - (it.doneAt || it.hit || 0) > KW_DONE_TTL));
    if (keep.length !== items.length) void saveItems(keep);
  }, [q.data]);   // eslint-disable-line react-hooks/exhaustive-deps
  const openBox = (v: boolean, t = "") => { setBox(v); setText(t); if (!v) setEdit(-1); else window.setTimeout(() => { inp.current?.focus(); if (t) inp.current?.select(); }, 40); };
  const add = async () => {   // 원본 kwAdd — 고치기 = 그 자리(등록일 유지 · 문구가 바뀌니 발견 기록 비움) · 같은 키워드 두 번 안 됨 · 40개까지
    const kw = text.trim().slice(0, 120); if (!kw || busy) return;
    const next = items.slice();
    if (edit >= 0 && next[edit]) {
      if (next.some((it, j) => j !== edit && norm(it.kw) === norm(kw))) { setNote("이미 있는 키워드"); return; }
      next[edit] = { ...next[edit], kw, hit: 0, done: false, url: "" };
    } else {
      if (next.some((it) => norm(it.kw) === norm(kw))) { setNote("이미 있는 키워드"); return; }
      if (next.length >= KW_CAP) { setNote(`키워드는 ${KW_CAP}개까지야`); return; }
      next.push({ id: crypto.randomUUID(), kw, ts: Date.now(), hit: 0, done: false, doneAt: 0, url: "", moved: 0, rearm: 0 });
    }
    if (await saveItems(next)) openBox(false);
  };
  const setDone = (i: number, done: boolean) => { const n = items.slice(); if (!n[i]) return; n[i] = { ...n[i], done, doneAt: done ? Date.now() : 0 }; void saveItems(n); };   // 원본 kwSetDone
  const remove = (i: number) => {   // 지움 = 두 번 누름(메모·센서와 같음 · 원본은 한 번)
    if (arm !== i) { setArm(i); window.setTimeout(() => setArm((a) => (a === i ? -1 : a)), 3000); return; }
    setArm(-1); const n = items.slice(); n.splice(i, 1); void saveItems(n);
  };
  const go = (i: number) => {   // 원본 kwOpenSrc — 발견한 글 열기 + 그 줄 밑줄(알림 멈춤 · kwMarkMoved)
    const it = items[i], u = it && /^https?:\/\//i.test(it.url || "") ? it.url : ""; if (!u) return;
    const a = document.createElement("a"); a.href = u; a.target = "_blank"; a.rel = "noopener noreferrer"; document.body.appendChild(a); a.click(); window.setTimeout(() => a.remove(), 1500);
    if (!it.moved) { const n = items.slice(); n[i] = { ...it, moved: Date.now() }; void saveItems(n); }
  };
  const rearm = (i: number) => { const it = items[i]; if (!it || !it.moved) return; const n = items.slice(); n[i] = { ...it, hit: 0, url: "", moved: 0, done: false, doneAt: 0, rearm: Date.now() }; void saveItems(n); };   // 원본 kwRearm — 발송 세대 도장
  const toggle = async () => { const next = !on; if (await save({ kwAlertOn: next }, {}) && next && !items.length) openBox(true); };   // 원본 ON = 비었으면 입력칸 펼침
  return (
    <Pane title="키워드 알림">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo nm-kw">
          <span className="ycd-nm yset-ttl">키워드 알림</span>
          <div className="nm-bar">
            <button type="button" className={`nm-kw-on${on ? " on" : ""}`} aria-pressed={on} disabled={busy || q.isLoading} onClick={() => void toggle()}>{on ? "ON" : "OFF"}</button>
            {on ? null : <p className="nm-kw-help">꺼져 있음</p>}   {/* 설명 뺌 · 꺼짐 상태만(형 11-02 08:1x 「옆에 설명글은 빼줘」) */}
            <button type="button" className="nm-memo-plus" aria-expanded={box} onClick={() => openBox(!box)}>{box ? "닫기" : "＋ 추가"}</button>
          </div>
          {box ? (
            <div className="nm-kw-add">
              <input ref={inp} type="text" value={text} maxLength={120} placeholder="키워드 · 띄어쓰거나 + 로 이으면 한 글 안에 다 있어야 함" aria-label="키워드" autoComplete="off" spellCheck={false}
                onChange={(e) => { setText(e.target.value); setNote(""); }} onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); void add(); } }} />
              <button type="button" className="go" disabled={busy || !text.trim()} onClick={() => void add()}>{busy ? "저장 중…" : edit >= 0 ? "고치기" : "추가"}</button>
            </div>
          ) : null}
          {note ? <p className="nm-chan-msg" role="status">{note}</p> : null}
          {q.isLoading ? <p className="nm-chan-msg">읽는 중…</p> : q.isError ? <p className="nm-chan-msg" role="alert">설정을 못 읽었어 — 다시 열어 줘</p> : !items.length ? <p className="nm-chan-msg">등록된 키워드 없음</p> : (
            <div className="nm-q-list" role="list">
              {items.map((it, i) => (
                <div key={(it.id || it.kw) + i} role="listitem" className={`nm-q-row nm-kw-row${it.done ? " done" : ""}${it.moved ? " moved" : ""}`} title={it.moved ? "눌러서 다시 감시 — 이 키워드를 다시 본다" : undefined} onClick={() => { if (it.moved) rearm(i); }}>
                  <span className="no">{i + 1}</span>
                  <span className="qt">{day(it.ts)}</span>
                  <span className="qm" title={it.kw}><i>{it.kw}</i></span>
                  <span className={`st ${it.hit ? (it.done ? "ok" : "hit") : "wait"}`}>{it.hit ? "발견" : "미발견"}{it.hit ? <small>{hitAt(it.hit)}</small> : null}</span>
                  <span className="qa">{it.hit
                    ? <button type="button" className="go" disabled={!it.url} aria-label="발견한 글로 이동" onClick={(e) => { e.stopPropagation(); go(i); }}>이동</button>
                    : <button type="button" className="go gray" aria-label="키워드 고치기" onClick={(e) => { e.stopPropagation(); setEdit(i); openBox(true, it.kw); }}>고치기</button>}</span>
                  <span className="qa">{it.hit
                    ? <label className="nm-kw-chk" title={it.done ? "확인 풀기 — 알림 다시" : "확인 — 알림 멈춤(하루 뒤 저절로 지움)"} onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={it.done} disabled={busy} onChange={(e) => setDone(i, e.target.checked)} />확인</label>
                    : <button type="button" className={`go ${arm === i ? "arm" : "gray"}`} aria-label={arm === i ? "한 번 더 누르면 지움" : "키워드 지우기"} disabled={busy} onClick={(e) => { e.stopPropagation(); remove(i); }}>{arm === i ? "지울까?" : "지움"}</button>}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Pane>
  );
}

// 서랍 「메모」 = 에디터 설정 ▸ 메모 창(/?pop=memo · viewer-src/43-memo.part openMemo · renderMemoList · mmAdd)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   저장 = 원본과 같은 서버 설정 한 장(GET /api/settings 의 memos · 폰에서 적고 PC 에서 봄) · 바꿀 땐 POST /api/settings {patch:{memos}, base:{memos: 내가 읽은 목록}}(원본 saveSettings · 그 사이 다른 기기가 바꿨으면 서버가 충돌로 돌려줌 → 다시 읽고 알림)
//   줄 = 날짜("10. 28.") | 한 줄 60자 | 고치기 | 지우기 · 누르면 전문(날짜 시:분) · 새 메모 = 맨 위 · 고치기 = 같은 입력칸 재사용(작성 시각 그대로) · 상한 200건 · 1건 4000자(원본 MEMO_CAP · MEMO_LEN)
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { getJson } from "./news-data";
import { Pane } from "./pane";
import { YICO } from "./yeta-icons";

type Memo = { id?: string; ts: number; text: string };
type Settings = { memos?: Memo[]; error?: string; code?: string; settings?: Settings };
const CAP = 200, LEN = 4000;
const KEY = ["nomute", "settings"] as const;
const p2 = (n: number) => String(n).padStart(2, "0");
const day = (ts: number) => { const d = ts ? new Date(ts) : null; return d && !Number.isNaN(+d) ? `${d.getMonth() + 1}. ${d.getDate()}.` : "-"; };   // 원본 kwDate
const when = (ts: number) => { const d = ts ? new Date(ts) : null; return d && !Number.isNaN(+d) ? `${day(ts)} ${p2(d.getHours())}:${p2(d.getMinutes())}` : ""; };   // 원본 mmWhen
const clean = (a: Memo[]) => a.map((it) => ({ ...(it.id ? { id: it.id } : {}), ts: Number.isFinite(it.ts) ? it.ts : 0, text: String(it.text || "").slice(0, LEN).trim() })).filter((x) => x.text).slice(0, CAP);   // 원본 _mmClean

export function MemoModal() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, staleTime: 15_000, queryFn: () => getJson<Settings>(`/api/settings?_=${Date.now()}`) });
  const items = Array.isArray(q.data?.memos) ? q.data!.memos! : [];
  const [box, setBox] = useState(false), [text, setText] = useState(""), [edit, setEdit] = useState(-1), [open, setOpen] = useState(-1), [busy, setBusy] = useState(false), [note, setNote] = useState(""), [arm, setArm] = useState(-1);
  const inp = useRef<HTMLTextAreaElement>(null);
  const save = async (next: Memo[]) => {   // 원본 saveSettings({memos}) — base = 내가 읽은 목록
    setBusy(true); setNote("");
    try {
      const r = await fetch("/api/settings", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ patch: { memos: clean(next) }, base: { memos: items } }) });
      const j = (await r.json().catch(() => ({}))) as Settings;
      if (r.ok && j.settings) { qc.setQueryData(KEY, j.settings); return true; }
      if (j.code === "settings-conflict" || j.code === "refresh-required") { await qc.invalidateQueries({ queryKey: KEY }); setNote("다른 기기에서 그새 바뀌어서 다시 불러왔어 — 한 번 더 해 줘"); return false; }
      setNote(j.error || "아직 저장 못 했어 — 잠시 뒤 다시"); return false;
    } catch { setNote("네트워크 오류 — 다시"); return false; }
    finally { setBusy(false); }
  };
  const openBox = (v: boolean) => { setBox(v); if (!v) { setText(""); setEdit(-1); } else window.setTimeout(() => inp.current?.focus(), 40); };
  const submit = async () => {   // 원본 mmAdd — 새 메모 = 맨 위 · 고치기 = 그 자리(작성 시각 그대로)
    const t = text.slice(0, LEN).trim(); if (!t || busy) return;
    const next = items.slice();
    if (edit >= 0 && next[edit]) next[edit] = { ...next[edit], text: t };
    else { if (next.length >= CAP) { setNote(`메모는 ${CAP}건까지야`); return; } next.unshift({ id: crypto.randomUUID(), ts: Date.now(), text: t }); }
    if (await save(next)) openBox(false);
  };
  const del = async (i: number) => {   // 지우기 = 두 번 누름(잘못 눌러도 안 사라지게 · 원본은 한 번 = 앱은 폰 손가락이라 한 번 더 묻기)
    if (arm !== i) { setArm(i); window.setTimeout(() => setArm((a) => (a === i ? -1 : a)), 3000); return; }
    setArm(-1); const next = items.slice(); next.splice(i, 1); await save(next);
  };
  const Chev = () => <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} />;
  const cur = open >= 0 ? items[open] : undefined;
  return (
    <Pane title="메모">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">메모</span>
          <div className="nm-bar">   {/* 단추 = 카드 머리 밖(모달 안은 카드 머리 숨김 · yeta-settings.css) */}
            {cur ? <button type="button" className="nm-msg-back" onClick={() => setOpen(-1)} aria-label="목록으로"><Chev />목록</button> : null}
            {!cur ? <button type="button" className="nm-memo-plus" aria-expanded={box} aria-label={box ? "입력칸 접기" : "메모 쓰기"} onClick={() => openBox(!box)}>{box ? "닫기" : "＋ 쓰기"}</button> : null}
          </div>
          {box && !cur ? (
            <div className="nm-memo-add">
              <textarea ref={inp} value={text} maxLength={LEN} rows={3} placeholder="할 일 · 적어 둘 것" onChange={(e) => setText(e.target.value)} />
              <button type="button" className="ypc-go" disabled={busy || !text.trim()} onClick={submit}>{busy ? "저장 중…" : edit >= 0 ? "고치기" : "저장"}</button>
            </div>
          ) : null}
          {note ? <p className="nm-chan-msg" role="status">{note}</p> : null}
          {cur ? (
            <div className="nm-msg-detail"><div className="hd"><span className="qt">{when(cur.ts)}</span></div><p className="bd">{cur.text}</p></div>
          ) : q.isLoading ? <p className="nm-chan-msg">메모 읽는 중…</p> : q.isError ? <p className="nm-chan-msg" role="alert">메모를 못 읽었어 — 다시 열어 줘</p> : !items.length ? <p className="nm-chan-msg">기록된 메모 없음</p> : (
            <div className="nm-q-list" role="list">
              {items.map((it, i) => { const one = String(it.text || "").replace(/\s+/g, " ").trim(), cp = [...one], s = cp.length > 60 ? cp.slice(0, 60).join("") + "…" : one; return (
                <div key={(it.id || "") + it.ts + i} role="listitem" className="nm-q-row nm-memo-row" onClick={() => setOpen(i)}>
                  <span className="qt">{day(it.ts)}</span>
                  <span className="qm" title={one}><i>{s}</i></span>
                  <span className="qa"><button type="button" className="go gray" aria-label="메모 고치기" onClick={(e) => { e.stopPropagation(); setEdit(i); setText(it.text); openBox(true); }}>고치기</button></span>
                  <span className="qa"><button type="button" className={`go ${arm === i ? "arm" : "gray"}`} aria-label={arm === i ? "한 번 더 누르면 지움" : "메모 지우기"} disabled={busy} onClick={(e) => { e.stopPropagation(); void del(i); }}>{arm === i ? "지울까?" : "지움"}</button></span>
                </div>
              ); })}
            </div>
          )}
        </div>
      </div>
    </Pane>
  );
}

// 기사 한 장 맨 아래 「요약 고치기」 — 옛 에디터 요약 창 ✏️요약 수정(#revdlg · api/revise)을 앱 안으로(형 11-10 12:17 「기존 앱 화면으로 가서 받는게 아니라 자체로」 · team-3)
//   전엔 「에디터에서 고치기」 = 옛 에디터 그 기사 창(#/web 한 겹)으로 넘어감 · 보내는 글 = 옛 창과 같은 꼴 { file, instruction } · 서버 손 0
//   고치는 것 = 인스타 · 스레드 초안만(기사 다시 요약 X · 구독 클로드 = 돈 0) · 보낸 뒤 목록 다시 읽기 두 번(요약 rev 가 오르면 본문이 새 판으로)
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GoButton } from "./go-button";
import { type Art, newsListQuery } from "./news-data";

/** 같은 출처 POST(쿠키 그대로) — 받은 글이 JSON 이 아니면 로그인 끝(Access 가 로그인 화면을 돌려줌) */
async function post(url: string, body: object): Promise<{ ok?: boolean; via?: string }> {
  let r: Response;
  try { r = await fetch(url, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
  catch { throw new Error(navigator.onLine === false ? "기기가 오프라인이야 — 연결되면 다시" : "연결이 끊겼거나 로그인이 끝났어 — 새로 고쳐 다시"); }
  if (!(r.headers.get("content-type") || "").includes("json")) throw new Error(r.status === 200 ? "로그인이 끝났어 — 새로 고쳐 다시 로그인" : `서버 ${r.status}`);
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; via?: string };
  if (!r.ok || !d.ok) throw new Error(d.error || `서버 ${r.status}`);
  return d;
}

export function SummaryFix({ a }: { a: Art }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [say, setSay] = useState("");
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const send = async () => {
    setNote(null);
    try {
      const d = await post("/api/revise", { file: a.file.replace(/\.md$/, ""), instruction: say.trim() });
      setNote({ kind: "ok", text: `보냈어 — 인스타 · 스레드 초안 고치는 중 · 1~3분 뒤 위 본문이 새 판으로${d.via === "r2-queue" ? " · 깃허브가 막혀서 큐에 받아 뒀어(풀리면 저절로 나가)" : ""}` });
      setSay("");
      for (const ms of [60_000, 150_000]) setTimeout(() => void qc.invalidateQueries({ queryKey: newsListQuery.queryKey }), ms);
      return d;
    } catch (e) { setNote({ kind: "err", text: (e as Error).message }); throw e; }
  };
  return (
    <div className="nm-sfix">
      <div className="ypc-acts nm-nd-acts">
        <button type="button" className={`ypc-go nm-sfix-tog${open ? " on" : ""}`} aria-expanded={open} onClick={() => { setOpen((o) => !o); setNote(null); }}>요약 고치기</button>
      </div>
      {open ? (
        <div className="ycd-card card-left nm-sfix-pane">
          <p className="nm-sfix-why">인스타 · 스레드 초안만 지시대로 다시 써 · 기사 다시 요약은 안 함 · 돈 0</p>
          <textarea className="nm-sfix-ta" rows={3} maxLength={2000} value={say} onChange={(e) => setSay(e.target.value)} placeholder="어떻게 고칠지 한 줄 — 예: 첫 줄을 질문으로 · 스레드 더 짧게" aria-label="어떻게 고칠까" />
          <div className="ypc-acts nm-sfix-acts"><GoButton className="ypc-go" go={send} busy="보내는 중" disabled={!say.trim()}>고치기 보내기</GoButton></div>
        </div>
      ) : null}
      {note ? <p className={`nm-sfix-note ${note.kind}`} role={note.kind === "err" ? "alert" : "status"}>{note.text}</p> : null}
    </div>
  );
}

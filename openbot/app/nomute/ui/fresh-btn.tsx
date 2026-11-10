// 「새로 수집 ↻」 한 단추 = 옛 에디터 mkFresh(SNSF · CHANF · viewer/index.html)를 앱 안으로(형 11-10 12:40 「봄 노는 작업실 있으면 에디터도 정원에 완벽하게 녹여」 · team-4 U3 뎅)
//   누름 = 서버 길 한 번(POST · /api/snsretry · /api/chanretry?src=) → 러너가 수집 → 끝 = 읽은 판의 시각 칸(updated · generated_kst)이 바뀌면 ✓
//   도는 동안 30초마다 다시 읽음 · 15분 안에 새 판이 안 오면 「다시」 · 도는 중 · 보내는 중엔 다시 안 눌림(겹쳐 쏘기 0)
import { useEffect, useRef, useState } from "react";
import { YICO } from "./yeta-icons";

type St = { k: "idle" | "send" | "run" | "done" | "err"; base?: string; at?: number; msg?: string };
const POLL_MS = 30_000, GIVE_UP_MS = 15 * 60_000;

/** 서버 답 = { ok: true } · 실패 = { error } (functions/api/snsretry.js · chanretry.js) */
export async function firePost(url: string): Promise<void> {
  const r = await fetch(url, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: "{}" });
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!r.ok || d.ok !== true) throw new Error(d.error || `서버 ${r.status}`);
}

export function FreshBtn({ url, upd, refetch, noun }: { url: string; upd: string; refetch: () => void; noun: string }) {
  const [st, setSt] = useState<St>({ k: "idle" });
  const again = useRef(refetch); again.current = refetch;
  useEffect(() => { if (st.k === "run" && upd && upd !== st.base) setSt({ k: "done" }); }, [upd, st]);
  useEffect(() => {
    if (st.k !== "run") return;
    const t = window.setInterval(() => {
      if (Date.now() - (st.at || 0) > GIVE_UP_MS) { setSt({ k: "err", msg: "15분 안에 새 판이 안 왔어" }); return; }
      again.current();
    }, POLL_MS);
    return () => window.clearInterval(t);
  }, [st]);
  const click = async () => {
    if (st.k === "send" || st.k === "run") return;
    setSt({ k: "send" });
    try { await firePost(url); setSt({ k: "run", base: upd, at: Date.now() }); }
    catch (e) { setSt({ k: "err", msg: e instanceof Error ? e.message : String(e) }); }
  };
  const label = st.k === "send" ? "보내는 중…" : st.k === "run" ? `${noun} 수집 중…` : st.k === "done" ? "새로 받음 ✓" : st.k === "err" ? "못 했어 · 다시" : "새로 수집";
  return (
    <>
      <button type="button" className="ypc-go" onClick={click} disabled={st.k === "send" || st.k === "run"} aria-busy={st.k === "send" || st.k === "run"}>
        {label} {st.k === "idle" || st.k === "err" ? <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /> : null}
      </button>
      {st.k === "err" && st.msg ? <p className="nm-chan-msg" role="alert">{st.msg}</p> : null}
    </>
  );
}

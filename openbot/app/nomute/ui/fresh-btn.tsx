// 「새로 수집 ↻」 한 단추 = 옛 에디터 mkFresh(SNSF · CHANF · viewer/index.html)를 앱 안으로(형 11-10 12:40 「봄 노는 작업실 있으면 에디터도 정원에 완벽하게 녹여」 · team-4 U3 뎅)
//   누름 = 서버 길 한 번(POST · /api/snsretry · /api/chanretry?src=) → 러너가 수집 → 끝 = 읽은 판의 시각 칸(updated · generated_kst)이 바뀌면 ✓
//   도는 동안 30초마다 다시 읽음 · 15분 안에 새 판이 안 오면 「다시」 · 도는 중 · 보내는 중엔 다시 안 눌림(겹쳐 쏘기 0)
import { useEffect, useRef, useState } from "react";
import { GoButton } from "./go-button";
import { YICO } from "./yeta-icons";

const POLL_MS = 30_000, GIVE_UP_MS = 15 * 60_000;

/** 서버 답 = { ok: true } · 실패 = { error } (functions/api/snsretry.js · chanretry.js) */
export async function firePost(url: string): Promise<void> {
  const r = await fetch(url, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: "{}" });
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!r.ok || d.ok !== true) throw new Error(d.error || `서버 ${r.status}`);
}

export function FreshBtn({ url, upd, refetch, noun }: { url: string; upd: string; refetch: () => void; noun: string }) {
  // 단추 = 게이지 알약 하나(./go-button · 형 11-15 「전송이나 저장 버튼들 … 하네스 전반 통일」) — 보냄 = 게이지 · 러너 수집 기다림 = wait(빙글) · 새 판 = ✓ · 15분 넘음 = 실패 길
  const [msg, setMsg] = useState("");
  const again = useRef(refetch); again.current = refetch;
  const now = useRef(upd); now.current = upd;
  const timer = useRef(0);
  useEffect(() => () => window.clearInterval(timer.current), []);
  const fire = async () => {
    setMsg("");
    try { await firePost(url); return now.current; }
    catch (e) { setMsg(e instanceof Error ? e.message : String(e)); throw e; }
  };
  const wait = (base: string) => new Promise<boolean>((ok) => {   // 읽은 판의 시각 칸이 바뀌면 끝 · 30초마다 다시 읽음
    const t0 = Date.now(); let last = t0;
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      if (now.current && now.current !== base) { window.clearInterval(timer.current); ok(true); return; }
      if (Date.now() - t0 > GIVE_UP_MS) { window.clearInterval(timer.current); setMsg("15분 안에 새 판이 안 왔어"); ok(false); return; }
      if (Date.now() - last >= POLL_MS) { last = Date.now(); again.current(); }
    }, 1000);
  });
  return (
    <>
      <GoButton className="ypc-go" go={fire} wait={wait} waiting={`${noun} 수집 중`}>
        {msg ? "못 했어 · 다시" : "새로 수집"} <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} />
      </GoButton>
      {msg ? <p className="nm-chan-msg" role="alert">{msg}</p> : null}
    </>
  );
}

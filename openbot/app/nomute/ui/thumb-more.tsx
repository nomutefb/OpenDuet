// 썸네일 칸 「사진 5장 더」 · 「썸네일 다시」 — 앱 안에서 바로(봄바람 잡 · 형 11-10 14:23 봄 1:1 「응 밖에잇는거 다 옮길거야」 · 12:17 「기존 앱 화면으로 가서 받는게 아니라 자체로」)
//   옛 길 = 에디터 viewer/index.html thumbStatic 검색 소머리 「+5장 더」(moreImgGo → api/moreimg {file} · 클로드 웹 검색 + og:image = 구독 · 돈 0)
//          · api/thumbredo {article}(sid 없이 = 4화풍 통째 다시 그림 · 검색 사진은 그대로 · 제미나이 = 돈 → 두 번 눌러야 나감 · 옛 shoot 재확인 3.5초 꼴)
//   보낸 뒤 = 목록(articles.json)을 15초마다 다시 읽고, 그 칸 사진 줄이 바뀌면 끝(옛 imgFetchGo 「장수가 늘면 끝」 · 다시 그림은 장수가 같을 수 있어 사진 주소 줄로 셈)
//   기다림 창 = 옛 꼴 그대로(사진 더 ≈ 5분 · 다시 그림 12분) · 넘으면 「아직 안 왔어」 안내 · 서버 손 0 · 서버 통과 목록 = shim/install.ts(moreimg · thumbredo)
//   AI 생성 창(genimg) · 그림마다 「이 화풍 수정」 · 프롬프트만 뽑기 = 뜸 몫(./thumb-gen.tsx)
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { type Art, type Thumb, imgOf, newsListQuery } from "./news-data";
import "./thumb-more.css";

type Kind = "more" | "redo";
type Job = { kind: Kind; sig: string; at: number };
type Note = { kind: "ok" | "err"; text: string } | null;
const ARM_MS = 3500, POLL_MS = 15_000;
const LIMIT: Record<Kind, number> = { more: 6 * 60_000, redo: 12 * 60_000 };
const sigOf = (xs?: Thumb[]) => (xs || []).map((t) => imgOf(t)).filter(Boolean).join("|");

/** 같은 출처 POST(쿠키 그대로) — 받은 글이 JSON 이 아니면 로그인 끝(Access 가 로그인 화면을 돌려줌) · 꼴 = ./feed-acts.tsx 와 같음 */
async function post(url: string, body: object): Promise<{ ok?: boolean; via?: string }> {
  let r: Response;
  try { r = await fetch(url, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
  catch { throw new Error(navigator.onLine === false ? "기기가 오프라인이야 — 연결되면 다시" : "연결이 끊겼거나 로그인이 끝났어 — 새로 고쳐 다시"); }
  if (!(r.headers.get("content-type") || "").includes("json")) throw new Error(r.status === 200 ? "로그인이 끝났어 — 새로 고쳐 다시 로그인" : `서버 ${r.status}`);
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; via?: string };
  if (!r.ok || !d.ok) throw new Error(d.error || `서버 ${r.status}`);
  return d;
}

/** 칩 둘(머리 「＋ AI 생성」 앞 · ./thumb-strip.tsx nm-th-tools) + 알림 칸(머리 아래) — 상태를 둘이 같이 써서 훅 하나로 */
export function useThumbMore(a: Art): { chips: ReactNode; pane: ReactNode } {
  const qc = useQueryClient();
  const c = a.cards || {};
  const stem = a.file.replace(/\.md$/, "");
  const sig: Record<Kind, string> = { more: sigOf(c.thumb_search), redo: sigOf(c.thumb_gen) };
  const [job, setJob] = useState<Job | null>(null), [armed, setArmed] = useState(false), [sending, setSending] = useState<Kind | null>(null), [note, setNote] = useState<Note>(null);
  const live = !!a._live;   // 목록 굽기 전 새 요약 = 목록에 그 줄이 아직 없어 끝을 못 셈 → 굽힌 뒤에
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), ARM_MS); return () => clearTimeout(t); }, [armed]);
  // 보낸 뒤 = 15초마다 목록 다시 읽기 · 사진 줄이 바뀌면 끝 · 창을 넘기면 안내하고 멈춤
  useEffect(() => {
    if (!job) return;
    if (sig[job.kind] !== job.sig) {
      setNote({ kind: "ok", text: job.kind === "more" ? "새 사진이 왔어 — 「검색」 줄 끝까지 넘겨 봐" : "새 썸네일이 왔어 — 「AI 생성」 줄" });
      setJob(null); return;
    }
    const left = job.at + LIMIT[job.kind] - Date.now();
    if (left <= 0) { setNote({ kind: "err", text: `${job.kind === "more" ? "사진" : "썸네일"}이 아직 안 왔어 — 러너가 붐비거나 못 찾았을 수 있어 · 조금 뒤 새로 고쳐 봐` }); setJob(null); return; }
    const t = setInterval(() => void qc.invalidateQueries({ queryKey: newsListQuery.queryKey }), POLL_MS);
    const end = setTimeout(() => setJob((j) => (j ? { ...j } : j)), left + 50);   // 창 끝 = 한 번 더 그려 위 셈으로
    return () => { clearInterval(t); clearTimeout(end); };
  }, [job, sig.more, sig.redo, qc]);   // eslint-disable-line react-hooks/exhaustive-deps

  const send = async (kind: Kind) => {
    setArmed(false); setNote(null); setSending(kind);
    try {
      const d = kind === "more" ? await post("/api/moreimg", { file: stem }) : await post("/api/thumbredo", { article: stem });
      setJob({ kind, sig: sig[kind], at: Date.now() });
      if (d.via === "r2-queue") setNote({ kind: "ok", text: "깃허브가 막혀서 큐에 받아 뒀어 — 풀리면 저절로 나가" });
    } catch (e) { setNote({ kind: "err", text: (e as Error).message }); }
    finally { setSending(null); }
  };
  const busy = !!job || !!sending || live;
  const why = live ? "목록 굽기 전이야 — 몇 분 뒤 여기서 할 수 있어" : "";
  const chips = (
    <>
      <button type="button" className="yset-chip nm-thm-chip" disabled={busy} title={why || "기사 관련 실사진 5장 더 찾기 · 돈 0"} onClick={() => void send("more")}>사진 5장 더</button>
      <button type="button" className={`yset-chip nm-thm-chip${armed ? " nm-thm-arm" : ""}`} disabled={busy} aria-label={armed ? "한 번 더 누르면 4화풍 다시 그림(돈)" : "썸네일 다시"}
        title={why || "AI 썸네일 4화풍 통째 다시 그리기 · 제미나이라 돈 들어 · 두 번 눌러야 나가"} onClick={() => (armed ? void send("redo") : setArmed(true))}>{armed ? "한 번 더(돈)" : "썸네일 다시"}</button>
    </>
  );
  const pane = armed || live || job || sending || note ? (
    <div className="nm-thm">
      {sending || job ? <p className="nm-thm-busy" role="status">{sending ? "보내는 중" : job!.kind === "more" ? "사진 5장 받아오는 중… 보통 2~5분" : "4화풍 다시 그리는 중… 보통 3~10분"}</p> : null}
      {armed ? <p className="nm-thm-why pay">한 번 더 누르면 4화풍(포토 · 웹툰 · 수채화 · 시사만평) 다 다시 그려 · 검색 사진은 그대로 · 제미나이라 돈 들어</p> : null}
      {live ? <p className="nm-thm-why">{why}</p> : null}
      {note ? <p className={`nm-thm-note ${note.kind}`} role={note.kind === "err" ? "alert" : "status"}>{note.text}</p> : null}
    </div>
  ) : null;
  return { chips, pane };
}

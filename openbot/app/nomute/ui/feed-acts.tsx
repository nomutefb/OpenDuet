// 기사 한 장 「피드」 칸 — 고치기 · 다시 만들기(team-3 U1 · 형 11-10 「사실 제일 많이 쓰는거 > 피드 제작, 뉴스 요약. 요약된 뉴스 보기.」 · 「이런걸 다 하나로 하고싶은거지」)
//   옛 길 = 에디터 기사 창(/?a=) 요약 수정 #revdlg(api/revise) · 카드 수정 #crevdlg(api/revise-cards) · makeCards(api/make-cards · text/shoot/full) — 서버 손 0 · 보내는 글 = 옛 창과 같은 꼴
//   고치기 = 지시 한 줄 → 카드(revise-cards · 카드 프롬프트만 다시 짬 · 그림 그대로) / 글(revise · 인스타·스레드 초안만 다시 씀 · 다시 요약 X) = 둘 다 돈 0(구독 클로드)
//   다시 만들기 = make-cards · 글·구성만(text · 돈 0) / 그림만(shoot · 프롬프트만 있고 그림이 없을 때) / 그림까지(full) — 그림 = 제미나이 = 돈 → 두 번 눌러야 나감(옛 shoot 재확인 3.5초 꼴)
//   만드는 중(progOf busy)이거나 방금 보냄(2분) = 다시 만들기 막음(옛 startCardFire 연타 막기) · 보낸 뒤 목록 다시 읽기 두 번(진행 막대가 따라옴)
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { GoButton } from "./go-button";
import { type Art, newsListQuery, progOf } from "./news-data";

type Fix = "card";   // 글(인스타 · 스레드 초안 = api/revise)은 「요약 고치기」(./summary-fix.tsx)가 맡음 = 여기서 뺌(시아 12:47 「둘이 안 겹침」 · 빠르 team-4 U2)
type Make = "text" | "shoot" | "full";
type Note = { kind: "ok" | "err"; text: string } | null;
const ARM_MS = 3500, HOLD_MS = 120_000;

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

const FIX: Record<Fix, { label: string; why: string; ph: string }> = {
  card: { label: "카드", why: "카드 문구 · 구성(프롬프트)만 다시 짜 · 그림은 그대로 · 돈 0", ph: "어떻게 고칠지 한 줄 — 예: 3번 카드 문구 더 짧게 · 마지막 장에 출처 넣기" },
};
const MAKE: Record<Make, { label: string; why: string; pay: boolean }> = {
  text: { label: "글 · 구성만", why: "카드 문구 · 구성(프롬프트)을 처음부터 다시 · 그림 0 · 돈 0", pay: false },
  shoot: { label: "그림만", why: "지금 프롬프트로 그림만 그려 · 제미나이라 돈 들어", pay: true },
  full: { label: "그림까지", why: "프롬프트부터 그림까지 다 다시 · 제미나이라 돈 들어", pay: true },
};

export function FeedActs({ a }: { a: Art }) {
  const qc = useQueryClient();
  const c = a.cards || {}, pr = progOf(a);
  const hasMd = !!c.has_md || pr.done >= 2, hasImg = !!c.images?.length;
  const makes: Make[] = hasMd && !hasImg ? ["text", "shoot", "full"] : ["text", "full"];
  const [open, setOpen] = useState<"fix" | "make" | "one" | null>(null);
  const fix: Fix = "card";
  const [make, setMake] = useState<Make>("text");
  const [say, setSay] = useState("");
  const [armed, setArmed] = useState(false);
  const [sentAt, setSentAt] = useState(0);
  const [note, setNote] = useState<Note>(null);
  const nImg = c.images?.length || 0;
  const [one, setOne] = useState(1);
  const [oneText, setOneText] = useState("");
  const [oneWish, setOneWish] = useState("");
  const [oneSync, setOneSync] = useState(false);
  const [onePic, setOnePic] = useState<{ name: string; b64: string } | null>(null);
  const [oneArmed, setOneArmed] = useState(false);
  useEffect(() => { if (!oneArmed) return; const t = setTimeout(() => setOneArmed(false), ARM_MS); return () => clearTimeout(t); }, [oneArmed]);
  const held = sentAt > 0 && Date.now() - sentAt < HOLD_MS, busy = pr.busy || held;
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), ARM_MS); return () => clearTimeout(t); }, [armed]);
  useEffect(() => { if (!sentAt) return; const t = setTimeout(() => setSentAt(0), HOLD_MS); return () => clearTimeout(t); }, [sentAt]);
  useEffect(() => { setArmed(false); }, [make, open]);
  const cur: Make = makes.includes(make) ? make : "text", m = MAKE[cur];
  const reread = () => { for (const ms of [4000, 20_000]) setTimeout(() => void qc.invalidateQueries({ queryKey: newsListQuery.queryKey }), ms); };
  const queued = (d: { via?: string }) => (d.via === "r2-queue" ? " · 깃허브가 막혀서 큐에 받아 뒀어(풀리면 저절로 나가)" : "");
  const toggle = (k: "fix" | "make" | "one") => { setOpen((o) => (o === k ? null : k)); setNote(null); setOneArmed(false); };

  const sendFix = async () => {
    const instruction = say.trim();
    if (!instruction) { setNote({ kind: "err", text: "어떻게 고칠지 한 줄 적어 줘" }); throw new Error("빈 지시"); }
    setNote(null);
    try {
      const d = await post("/api/revise-cards", { file: a.file.replace(/\.md$/, ""), instruction });
      setNote({ kind: "ok", text: `보냈어 — 카드 프롬프트 고치는 중 · 1~3분 뒤 여기 반영${queued(d)}` });
      setSay(""); reread();
      return d;
    } catch (e) { setNote({ kind: "err", text: (e as Error).message }); throw e; }
  };
  const sendMake = async () => {
    setNote(null); setArmed(false);
    try {
      const d = await post("/api/make-cards", { article: a.file, mode: cur });
      setSentAt(Date.now());
      setNote({ kind: "ok", text: `보냈어 — ${cur === "text" ? "카드 프롬프트" : cur === "shoot" ? "카드 그림" : "카드 프롬프트 · 그림"} 만드는 중 · 위 막대(요약 · 프롬프트 · 카드)가 따라와${queued(d)}` });
      reread();
      return d;
    } catch (e) { setNote({ kind: "err", text: (e as Error).message }); throw e; }
  };

  // 카드 한 장 고치기 = 옛 에디터 기사 창 카드 한 장 수정(make-cards mode edit · card · text · wish · sync · 첨부 4:5 사진 sceneB64) — 그림 다시 = 제미나이 = 돈 → 두 번
  const pickPic = (f: File | undefined) => {
    if (!f) { setOnePic(null); return; }
    if (f.size > 9 * 1024 * 1024) { setNote({ kind: "err", text: "사진이 너무 커(9MB 까지)" }); return; }
    const r = new FileReader();
    r.onload = () => setOnePic({ name: f.name, b64: String(r.result || "") });
    r.onerror = () => setNote({ kind: "err", text: "사진을 못 읽었어 — 다시 골라 줘" });
    r.readAsDataURL(f);
  };
  const sendOne = async () => {
    setNote(null); setOneArmed(false);
    try {
      const d = await post("/api/make-cards", { article: a.file, mode: "edit", card: one, text: oneText.trim(), wish: oneWish.trim(), sync: oneSync, ...(onePic ? { sceneB64: onePic.b64 } : {}) });
      setSentAt(Date.now());
      setNote({ kind: "ok", text: `보냈어 — ${one}번 카드 고치는 중 · 위 막대가 따라와${queued(d)}` });
      setOneText(""); setOneWish(""); setOneSync(false); setOnePic(null); reread();
      return d;
    } catch (e) { setNote({ kind: "err", text: (e as Error).message }); throw e; }
  };
  const oneEmpty = !oneText.trim() && !oneWish.trim() && !oneSync && !onePic;

  return (
    <div className="nm-feed">
      <div className="nm-feed-bar" role="group" aria-label="피드">
        <button type="button" className={`yset-chip${open === "fix" ? " on" : ""}`} aria-expanded={open === "fix"} onClick={() => toggle("fix")}>고치기</button>
        <button type="button" className={`yset-chip${open === "make" ? " on" : ""}`} aria-expanded={open === "make"} onClick={() => toggle("make")}>다시 만들기</button>
        <button type="button" className={`yset-chip${open === "one" ? " on" : ""}`} aria-expanded={open === "one"} disabled={!nImg} title={nImg ? undefined : "카드 그림이 아직 없어 — 「다시 만들기」 먼저"} onClick={() => toggle("one")}>한 장 고치기</button>
        {pr.busy ? <span className="nm-feed-busy" role="status">만드는 중</span> : null}
      </div>
      {open === "fix" ? (
        <div className="nm-feed-pane">
          <p className="nm-feed-why">{hasMd ? FIX[fix].why : "카드 프롬프트가 아직 없어 — 「다시 만들기」 → 「글 · 구성만」 먼저"}</p>
          <textarea className="nm-feed-ta" rows={3} maxLength={2000} value={say} onChange={(e) => setSay(e.target.value)} placeholder={FIX[fix].ph} aria-label="어떻게 고칠까" />
          <div className="ypc-acts nm-feed-acts"><GoButton className="ypc-go" go={sendFix} busy="보내는 중" disabled={!hasMd || !say.trim()}>카드 고치기 보내기</GoButton></div>
        </div>
      ) : null}
      {open === "make" ? (
        <div className="nm-feed-pane">
          <div className="yset-chips nm-feed-pick" role="radiogroup" aria-label="어디까지 다시 만들까">
            {makes.map((k) => <button key={k} type="button" role="radio" aria-checked={cur === k} className={`yset-chip${cur === k ? " on" : ""}`} onClick={() => setMake(k)}>{MAKE[k].label}</button>)}
          </div>
          <p className={`nm-feed-why${m.pay ? " pay" : ""}`}>{m.why}{m.pay ? " · 두 번 눌러야 나가" : ""}</p>
          {busy ? <p className="nm-feed-why" role="status">{pr.busy ? "지금 만드는 중이야 — 끝나면 다시 만들 수 있어" : "방금 보냈어 — 2분 뒤 다시 누를 수 있어"}</p> : null}
          <div className="ypc-acts nm-feed-acts">
            {m.pay && !armed
              ? <button type="button" className="ypc-go nm-go" disabled={busy} onClick={() => setArmed(true)}>다시 만들기</button>
              : <GoButton className={`ypc-go${m.pay ? " nm-feed-arm" : ""}`} go={sendMake} busy="보내는 중" disabled={busy}>{m.pay ? "한 번 더 = 그림 그리기(돈)" : "다시 만들기"}</GoButton>}
          </div>
        </div>
      ) : null}
      {open === "one" && nImg ? (
        <div className="nm-feed-pane">
          <div className="yset-chips nm-feed-pick" role="radiogroup" aria-label="몇 번 카드">
            {Array.from({ length: nImg }, (_, i) => i + 1).map((k) => <button key={k} type="button" role="radio" aria-checked={one === k} className={`yset-chip${one === k ? " on" : ""}`} onClick={() => setOne(k)}>{k}번</button>)}
          </div>
          <p className="nm-feed-why pay">{one}번 카드만 다시 · 그림을 다시 그리면 제미나이라 돈 들어 · 두 번 눌러야 나가</p>
          <textarea className="nm-feed-ta" rows={2} maxLength={2000} value={oneText} onChange={(e) => setOneText(e.target.value)} placeholder="이 장 문구를 이렇게 — 비우면 그대로" aria-label="이 장 문구" />
          <textarea className="nm-feed-ta" rows={2} maxLength={1000} value={oneWish} onChange={(e) => setOneWish(e.target.value)} placeholder="그림은 이렇게 — 예: 인물 빼고 건물만 · 비우면 그대로" aria-label="그림 바람" />
          <label className="nm-feed-why nm-feed-chk"><input type="checkbox" checked={oneSync} onChange={(e) => setOneSync(e.target.checked)} /> 바꾼 문구에 맞게 그림도 다시</label>
          <label className="nm-feed-why nm-feed-chk">첨부 사진(4:5 · 9MB 까지 · 선택) <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => pickPic(e.target.files?.[0])} /></label>
          {onePic ? <p className="nm-feed-why">고른 사진 = {onePic.name}</p> : null}
          {busy ? <p className="nm-feed-why" role="status">{pr.busy ? "지금 만드는 중이야 — 끝나면 고칠 수 있어" : "방금 보냈어 — 2분 뒤 다시 누를 수 있어"}</p> : null}
          <div className="ypc-acts nm-feed-acts">
            {!oneArmed
              ? <button type="button" className="ypc-go nm-go" disabled={busy || oneEmpty} onClick={() => setOneArmed(true)}>{one}번 카드 고치기</button>
              : <GoButton className="ypc-go nm-feed-arm" go={sendOne} busy="보내는 중" disabled={busy}>한 번 더 = 보내기(돈 들 수 있어)</GoButton>}
          </div>
        </div>
      ) : null}
      {note ? <p className={`nm-feed-note ${note.kind}`} role={note.kind === "err" ? "alert" : "status"}>{note.text}</p> : null}
    </div>
  );
}

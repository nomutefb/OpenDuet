// 화상회의(형 11-13 06:4x 봄 1:1 · 봄 옮김) — 「그니까 내가 거기서 화상회의 를 누르면 / 회의 참여자를 고르고, 참여자가 다 오면 그 순간에 임시방이 열리고 거기서 창 아래에서 같이 대화」 ·
//   「같이 화면 볼수잇어야하고 72브라우저를」 · 「요청보내면, 각 애들이 수락 또는 거절할수잇고」 · 「그게 표기가 되어야돼. 수락 또는 거절이」 · 「온라인, (수락/ 거절) 오프라인」 ·
//   「그 화면을 보면서 할수잇어야하고 동기화 0초전 이게 떠야함」 · 「챙은 항상 자동참여 기록관으로」 · 「봄은 무슨 일을 하고잇을지 모르니까 상황에 따라서」
//   = 같이 보기 칸(./cobrowse-pane.tsx) 위 「화상회의」 → 고르기 → 임시방 하나(서버가 첫 글 = 목적으로 다 바로 깨움) → 봇은 그 방에 「[수락]」 또는 「[거절] 까닭」 한 줄
//   → 칸 아래 얼굴 줄 = 온라인(깸 표 · 띠와 같은 값) · 수락 · 거절 · 답 기다림 · 오프라인 → 다 답하면(챙 빼고) 수락한 이들로 대화가 칸 아래 열림 · 2분 지나면 온 이들로
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type OfficeMsg, office, faceOf, nameOf } from "../data/office";
import { OfficeChat } from "./office-chat";
type RingBot = { who: string; state: string; mark?: string; why?: string };
const ringOn = (b: RingBot) => b.state === "awake" && b.mark !== "woke" && b.why !== "woke";   // 온라인 = 띠 얼굴 라임 테와 같은 셈(./shell.tsx ringOn · 돌 import 피해 같은 한 줄)
import "./meet.css";

export const SCRIBE = "챙";   // 늘 자동 참여 · 기록관 · 「다 왔다」 셈 밖(봄 06:46)
export const MEET_WAIT = 60_000;   // 답 없는 이를 기다리는 시간(명세 「여는 때」 = 60초 · 봄 06:5x)
const KEY = "nm_meet_v1";
export type Meet = { id: string; members: string[]; t0: number };
export type Answer = "yes" | "no" | "wait" | "off";

/** 순수 — 방 글에서 애마다 답(첫 「[수락]」 · 「[거절] 까닭」) */
export function answersOf(msgs: Pick<OfficeMsg, "who" | "text" | "ts">[], members: string[], t0: number): Record<string, { a: "yes" | "no"; why?: string }> {
  const out: Record<string, { a: "yes" | "no"; why?: string }> = {};
  for (const m of msgs) {
    if (m.ts < t0 || !members.includes(m.who) || out[m.who]) continue;
    const t = String(m.text || "").trim();
    if (/^\[수락\]/.test(t)) out[m.who] = { a: "yes" };
    else if (/^\[거절\]/.test(t)) out[m.who] = { a: "no", why: t.replace(/^\[거절\]\s*/, "").slice(0, 60) };
  }
  return out;
}
/** 순수 — 열림(명세 「여는 때」) = 온라인인 이들(챙 빼고)이 다 답함 · 또는 60초 · 오프라인은 안 기다림 · 수락 0 이어도 형 + 챙으로 엶 */
export function meetOpen(ans: Record<string, { a: "yes" | "no" }>, members: string[], t0: number, now: number, online: (n: string) => boolean = () => true) {
  const ask = members.filter((n) => n !== SCRIBE), yes = ask.filter((n) => ans[n]?.a === "yes");
  const all = ask.every((n) => ans[n] || !online(n));
  return { open: all || now - t0 > MEET_WAIT, allNo: all && !yes.length, yes };
}
export const meetPurpose = (members: string[]) =>
  `화상회의 요청 — 형이 맥 72 브라우저(같이 보기)를 열어 두고 같이 보며 이야기하자고 불렀어(형 11-13 「그 화면을 보면서 할수잇어야하고」). ` +
  `답 = 이 방에 한 줄: 들어오면 「[수락]」 · 지금 못 오면 「[거절] 까닭 한 줄」(하던 일 따라 · 형 「상황에 따라서」). ` +
  `지금 그 창 = 사무실 읽기 머리 「지금 같이 보는 창」 · 손 = POST /api/office/m/together/act(한 번에 한 사람 · 쥔 이 「○○가 제어하고 있습니다」). ` +
  `${SCRIBE} = 자동 참여 · 기록관(답 안 해도 됨). 부른 이 = ${members.filter((n) => n !== SCRIBE).join(" · ")}`;

function load(): Meet | null { try { const m = JSON.parse(localStorage.getItem(KEY) || "null"); return m && m.id ? m : null; } catch { return null; } }
function save(m: Meet | null) { try { if (m) localStorage.setItem(KEY, JSON.stringify(m)); else localStorage.removeItem(KEY); } catch { /* 이 기기에만 */ } }
export function useMeet(): [Meet | null, (m: Meet | null) => void] {
  const [m, setM] = useState<Meet | null>(load);
  return [m, (x) => { save(x); setM(x); }];
}

/** 참여자 고르기(임시방 후보 그대로 · 챙 = 늘 · 고를 수 없음) */
export function MeetPick({ onStart, onClose }: { onStart: (m: Meet) => void; onClose: () => void }) {
  const qc = useQueryClient();
  const cand = useQuery({ queryKey: ["nomute", "temprooms"], queryFn: () => office<{ candidates: string[] }>("temprooms").then((j) => j.candidates || []), staleTime: 60_000 }).data || [];
  const [pick, setPick] = useState<string[]>([]), [busy, setBusy] = useState(false), [why, setWhy] = useState("");
  const list = cand.filter((n) => n !== SCRIBE && n !== "형");
  const go = async () => {
    if (!pick.length) { setWhy("한 명은 골라 줘"); return; }
    setBusy(true); setWhy("");
    try {
      const members = [...pick, ...(cand.includes(SCRIBE) ? [SCRIBE] : [])];
      const t = new Date(), name = `화상회의 ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
      const j = await office<{ room: { id: string } }>("temprooms", { method: "POST", body: JSON.stringify({ name, purpose: meetPurpose(members), members, hours: 2 }) });
      void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
      onStart({ id: j.room.id, members, t0: Date.now() - 2000 });
    } catch (e) { setWhy(e instanceof Error ? e.message : "못 만들었어"); setBusy(false); }
  };
  return (
    <div className="nm-meet-pick" role="dialog" aria-label="화상회의 참여자 고르기">
      <b>화상회의 · 누구 부를까</b>
      <div className="nm-meet-cands">
        {list.map((n) => <button key={n} type="button" className="nm-pick" aria-pressed={pick.includes(n)} onClick={() => setPick((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]))}>{nameOf(n)}</button>)}
        {cand.includes(SCRIBE) ? <span className="nm-pick nm-meet-scribe" title="늘 자동 참여 · 기록관">{nameOf(SCRIBE)} · 기록관</span> : null}
      </div>
      {why ? <small role="alert">{why}</small> : null}
      <div className="nm-meet-ft"><button type="button" onClick={onClose}>닫기</button><button type="button" className="ok" disabled={busy || !pick.length} onClick={() => void go()}>{busy ? "부르는 중…" : `요청 보내기 · ${pick.length}명`}</button></div>
    </div>
  );
}

/** 칸 아래 = 얼굴 줄(온라인 · 수락 · 거절 · 답 기다림 · 오프라인) → 열리면 그 방 대화 */
export function MeetDock({ meet, onEnd }: { meet: Meet; onEnd: () => void }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const msgs = useQuery({ queryKey: ["nomute", "meet", meet.id], queryFn: () => office<{ messages?: OfficeMsg[] }>(`rooms/${encodeURIComponent(meet.id)}/messages?n=100`).then((j) => j.messages || []), refetchInterval: 3000 }).data || [];
  const bots = useQuery({ queryKey: ["nomute", "bots"], queryFn: () => office<{ bots: RingBot[] }>("bots").then((j) => j.bots || []), staleTime: 15_000, refetchInterval: 15_000 }).data || [];
  const ans = useMemo(() => answersOf(msgs, meet.members, meet.t0), [msgs, meet]);
  const online = (n: string) => bots.some((b) => b.who === n && ringOn(b));
  const st = meetOpen(ans, meet.members, meet.t0, now, online);
  const stateOf = (n: string): Answer => (ans[n]?.a === "yes" ? "yes" : ans[n]?.a === "no" ? "no" : online(n) ? "wait" : "off");
  const LBL: Record<Answer, string> = { yes: "수락", no: "거절", wait: "답 기다림", off: "오프라인" };
  const left = Math.max(0, Math.ceil((MEET_WAIT - (now - meet.t0)) / 1000));
  return (
    <div className={`nm-meet${st.open ? " open" : ""}`}>
      <div className="nm-meet-row" aria-label="화상회의 참여자">
        {meet.members.map((n) => {
          const s: Answer | "scribe" = n === SCRIBE ? "scribe" : stateOf(n);
          return (
            <span key={n} className={`nm-meet-who s-${s}`} title={s === "no" && ans[n]?.why ? `거절 · ${ans[n]?.why}` : undefined}>
              <img src={faceOf(n)} alt="" /><b>{nameOf(n)}</b>
              <small>{s === "scribe" ? "기록관 · 자동" : `${online(n) || s === "yes" ? "온라인" : "오프라인"} · ${LBL[s]}`}{s === "no" && ans[n]?.why ? ` · ${ans[n]?.why}` : ""}</small>
            </span>
          );
        })}
        <span className="nm-meet-sp" />
        {!st.open ? <small className="nm-meet-left">{`${left}초 뒤엔 온 이들로 열림`}</small> : null}
        <button type="button" className="nm-web-btn" onClick={onEnd} title="화상회의 내리기(방은 기한 뒤 저절로)">끝내기</button>
      </div>
      {st.open ? <div className="nm-meet-chat"><OfficeChat room={meet.id} /></div> : null}
    </div>
  );
}

/** 동기화 N초 전(같이 보기 한 장 · 서버 GET together · 형 06:47 「동기화 0초전 이게 떠야함」) */
export function useSyncAgo() {
  const q = useQuery({ queryKey: ["nomute", "together"], queryFn: () => office<{ now?: { at?: number; control?: { who?: string; at?: number } } | null }>("together").then((j) => j.now || null), refetchInterval: 2000 });
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const at = q.data?.at || 0;
  return { ago: at ? Math.max(0, Math.round((now - at) / 1000)) : null, control: q.data?.control || null };
}

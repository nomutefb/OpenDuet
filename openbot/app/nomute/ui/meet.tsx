// 화상회의(형 11-13 06:4x 봄 1:1 · 봄 옮김) — 「그니까 내가 거기서 화상회의 를 누르면 / 회의 참여자를 고르고, 참여자가 다 오면 그 순간에 임시방이 열리고 거기서 창 아래에서 같이 대화」 ·
//   「같이 화면 볼수잇어야하고 72브라우저를」 · 「요청보내면, 각 애들이 수락 또는 거절할수잇고」 · 「그게 표기가 되어야돼. 수락 또는 거절이」 · 「온라인, (수락/ 거절) 오프라인」 ·
//   「그 화면을 보면서 할수잇어야하고 동기화 0초전 이게 떠야함」 · 「챙은 항상 자동참여 기록관으로」 · 「봄은 무슨 일을 하고잇을지 모르니까 상황에 따라서」
//   = 같이 보기 칸(./cobrowse-pane.tsx) 위 「화상회의」 → 고르기 → 임시방 하나(서버가 첫 글 = 목적으로 다 바로 깨움) → 봇은 그 방에 「[수락]」 또는 「[거절] 까닭」 한 줄
//   → 칸 아래 얼굴 줄 = 온라인(깸 표 · 띠와 같은 값) · 수락 · 거절 · 답 기다림 · 오프라인 → 다 답하면(챙 빼고) 수락한 이들로 대화가 칸 아래 열림 · 2분 지나면 온 이들로
//   ★★ 바뀜(형 11-13 15:01 ~ 15:15 봄 옮김) = 사람 칸은 화면 왼쪽 위 세로 줄(동그라미 + 이름 이모지 + 초록/회색 불 · 이름 오른쪽 내보내기 · 맨 아래 초대하기) · 대화 = 화면 아래 넓게(우리 대화 부품 그대로 · 목적 말풍선 숨김) · 머리 = 「같이 보는 중」만 · 회의 종료 = 머리 오른쪽
//   ★ 바뀜(형 11-13 11:01 봄 1:1 「화상회의 누가 부를까 이거. 창뜨고 그 아래에 @로 호출하면 한명씩 참가하는 느낌으로 하면돼.」) = 고르기 판 없음 · 카메라 누르면 형 + 챙으로 방이 바로 열리고 대화도 바로 · 아래 대화 「@이름」 = 서버가 그 애를 방에 더함(editor _meetat.js) · 얼굴 줄 = 서버 방 멤버
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type OfficeMsg, type OfficePerson, office, faceOf, nameOf, people } from "../data/office";
import { OfficeChat, officeKeys } from "./office-chat";
import { ringOf } from "../swap/mic-orb";
import "./meet.css";
import "./update-bar.css";   // .nm-dots = 라임 점 셋(업데이트 띠 · 끊김 띠와 같은 것 · 형 19:3x 「들어오는중... 이거 표시 떠야될듯」 · 「종료하는중 ... < 이거 점세개로」)
export const Dots = ({ bob = false }: { bob?: boolean }) => <span className={`nm-dots${bob ? " bob" : ""}`} aria-hidden><i>.</i><i>.</i><i>.</i></span>;   // bob = 점 셋 오르락내리락(형 11-14 01:42 시아 옮김 「잇는중 - 은 변경 연결 중 하고 점세개 오르락」)

export const SCRIBE = "자리3";   // 옛 기록관 자리(LLM · 지금 멤버로 안 넣음) — 기록관 = 서버(회의 끝에 대화 · 같이 본 주소 · 행위 + 주제 한 줄 · LLM 0 · 빠르 11-14 · 형 「러너로 배선을 바꿀수있어? … llm이 들어갈 필요는 없을거같아」)
export const SCRIBE_LABEL = "기록관 · 자동(서버)";   // 자리3 = 앞 챙(형 11-14 빈 자리 · 서버 _meetlog.js SCRIBE 와 같은 이름) ·   // 늘 자동 참여 · 기록관 · 「다 왔다」 셈 밖(봄 06:46)
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
export const meetPurpose = (_members: string[] = []) =>
  `화상회의 — 형이 맥 72 브라우저(같이 보기)를 열어 두고 같이 보며 이야기해(형 11-13 「그 화면을 보면서 할수잇어야하고」). ` +
  `부르는 법 = 형이 이 방 대화에서 「@이름」 → 그 애가 방에 들어오며 깸(형 11-13 11:01 「아래에 @로 호출하면 한명씩 참가하는 느낌」). ` +
  `불리면 이 방에 한 줄: 들어오면 「[수락]」 · 지금 못 오면 「[거절] 까닭 한 줄」(하던 일 따라 · 형 「상황에 따라서」). ` +
  `지금 그 창 = 이 방 읽기 머리 「지금 같이 보는 창」 · 손 = send 「[화면 click] …」(한 번에 한 사람 · 쥔 이 「○○가 제어하고 있습니다」) · 짚기 = 「[스케치 rect] x,y,w,h 글」. ` +
  `기록관 = 서버가 자동(회의 끝에 대화 · 같이 본 주소 · 행위를 서랍에 담고 주제 한 줄 · 사람 · 봇 깸 0).`;

/** 회의 열기 = 형 혼자 임시방 하나(기록관 = 서버 · 멤버 0) · 나머지는 아래 대화 「@이름」으로 한 명씩(형 11-13 11:01) */
export async function startMeet(): Promise<Meet> {
  const t = new Date(), name = `화상회의 ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  const j = await office<{ room: { id: string } }>("temprooms", { method: "POST", body: JSON.stringify({ name, purpose: meetPurpose(), members: [], meet: true, hours: 2 }) });
  return { id: j.room.id, members: [], t0: Date.now() - 2000 };
}

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
      const members = [...pick];   // 기록관 = 서버(멤버 0)
      const t = new Date(), name = `화상회의 ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
      const j = await office<{ room: { id: string } }>("temprooms", { method: "POST", body: JSON.stringify({ name, purpose: meetPurpose(members), members, meet: true, hours: 2 }) });
      void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
      onStart({ id: j.room.id, members, t0: Date.now() - 2000 });
    } catch (e) { setWhy(e instanceof Error ? e.message : "못 만들었어"); setBusy(false); }
  };
  return (
    <div className="nm-meet-pick" role="dialog" aria-label="화상회의 참여자 고르기">
      <b>화상회의 · 누구 부를까</b>
      <div className="nm-meet-cands">
        {list.map((n) => <button key={n} type="button" className="nm-pick" aria-pressed={pick.includes(n)} onClick={() => setPick((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]))}>{nameOf(n)}</button>)}
        <span className="nm-pick nm-meet-scribe" title="회의 끝에 서버가 대화 · 같이 본 주소를 서랍에 담음(LLM 0)">{SCRIBE_LABEL}</span>
      </div>
      {why ? <small role="alert">{why}</small> : null}
      <div className="nm-meet-ft"><button type="button" onClick={onClose}>닫기</button><button type="button" className="ok" disabled={busy || !pick.length} onClick={() => void go()}>{busy ? "부르는 중…" : `요청 보내기 · ${pick.length}명`}</button></div>
    </div>
  );
}

/** 회의 종료 = 형만 · 머리 × → 「회의를 종료하시겠습니까?」 아니오(라임) / 예 → 서버 meetlog(기록 서랍 · 방 닫힘 · 들어와 있던 이 1:1 방에 「[안내- 자동]」 · editor _meetlog.js) (형 11-13 16:17 「정지는 누르면 회의가 종료하시겠습니까? / 아니오 예 / 아니오에 라임색」 · 「종료 시 > 각 방에 … 안내 보냄」 · 16:18 「x 대신 종료」) */
export function useMeetEnd(meet: Meet | null, onEnd: () => void) {
  const id = meet?.id || "";
  const [ask, setAsk] = useState(false), [ending, setEnding] = useState(false), [why, setWhy] = useState("");
  const endNow = async () => {
    if (!id) { onEnd(); return; }
    setEnding(true); setWhy("");
    try { await office(`meetlog/${encodeURIComponent(id)}`, { method: "POST", body: "{}" }); setAsk(false); onEnd(); }
    catch (e) { setWhy(e instanceof Error ? e.message : "못 끝냈어"); }
    setEnding(false);
  };
  return { ask, setAsk, ending, why, endNow };
}
export function EndAsk({ end }: { end: ReturnType<typeof useMeetEnd> }) {
  if (!end.ask) return null;
  return (
    <div className="nm-meet-ask" role="dialog" aria-label="회의 종료">
      <b>회의를 종료하시겠습니까?</b>
      {end.why ? <small role="alert">{end.why}</small> : null}
      <div className="nm-meet-ask-ft"><button type="button" className="no" autoFocus onClick={() => end.setAsk(false)}>아니오</button><button type="button" disabled={end.ending} onClick={() => void end.endNow()}>{end.ending ? <>종료하는 중<Dots /></> : "예"}</button></div>
    </div>
  );
}

/** 회의 끝내기 = 판(모달) 없이 그 자리에서 쪼개짐(형 11-14 05:09 시아 옮김 「회의 중단 버튼 이거로 대체하면 팝업 모달 없어도 될듯」 · 본보기 = 「✓ Mark as Done」 → 「✓ Done」 + 「↶ Undo」 흐림 섞인 모핑)
 *  × → [종료(라임) | ↶] · 종료 = 끝냄(종료하는 중…) · ↶ = 그대로 · 5초 안 누르면 저절로 × 로(안 끝냄 · 한 번 잘못 눌러 끝나지 않게 · 짐작) · 앞 판 = 「회의를 종료하시겠습니까? 아니오 예」(EndAsk · 남김) */
export function EndMorph({ end }: { end: ReturnType<typeof useMeetEnd> }) {
  useEffect(() => {
    if (!end.ask || end.ending) return undefined;
    const t = window.setTimeout(() => end.setAsk(false), 5000);
    return () => window.clearTimeout(t);
  }, [end.ask, end.ending]);   // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <span className={`nm-endm${end.ask ? " open" : ""}`} title={end.why || undefined}>
      <button type="button" className="nm-web-btn nm-endm-x" aria-label="회의 종료" tabIndex={end.ask ? -1 : 0} onClick={() => end.setAsk(true)}>×</button>
      <span className="nm-endm-pair" aria-hidden={!end.ask}>
        <button type="button" className="nm-endm-go" tabIndex={end.ask ? 0 : -1} disabled={end.ending} onClick={() => void end.endNow()}>{end.ending ? <>종료하는 중<Dots /></> : <><svg viewBox="0 0 24 24" width="13" height="13" aria-hidden><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>종료</>}</button>
        <button type="button" className="nm-endm-undo" tabIndex={end.ask ? 0 : -1} disabled={end.ending} aria-label="되돌리기" onClick={() => end.setAsk(false)}>↶</button>
      </span>
    </span>
  );
}

/** 서버 「지금 같이 보는 창」 한 장(다리가 올림) — 제어권 쥔 이 · 마지막 올린 때(머리 「동기화 n초 전」) */
export function useTogetherNow() {
  const q = useQuery({ queryKey: ["nomute", "together", "now"], queryFn: () => office<{ now?: { at?: number; ctrl?: { who?: string } } }>("together").then((j) => ({ at: j.now?.at || 0, ctrl: j.now?.ctrl?.who || "" })), refetchInterval: 2000 });
  return q.data || { at: 0, ctrl: "" };
}
/** 머리 「ON AIR」 — 불 = 진행 중일 때만(형 11-14 01:36 시아 옮김 「온 에어에 진행중일때만 불 들어오면 됨 빨강 디밍」 · 「0분전 이거는 좀 의미가없는거 같아. 그냥 빼자」) · 진행 중 = 다리 신호(nm-co-sync ago) 받은 지 10초 안 · 아니면 회색 꺼짐 · 앞 판 = 「( n초 전 )」(형 11-13 16:18) */
export function OnAir({ ago, at: recvAt = 0 }: { ago: number | null; at?: number }) {   // at = 그 신호 받은 때(그 뒤 흐른 만큼 더해 1초마다 다시 셈)
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const live = ago != null && ago + Math.max(0, now - (recvAt || now)) <= 10_000;
  return <span className={`nm-onair${live ? " live" : ""}`} title={live ? "진행 중" : "신호 없음"}><i aria-hidden /> <b>ON AIR</b></span>;
}

type ListRoom = { id: string; name?: string; purpose?: string; members?: string[] };
const useMeetRoom = (id: string) => {
  const q = useQuery({ queryKey: ["nomute", "temprooms", "list"], queryFn: () => office<{ rooms?: ListRoom[]; candidates?: string[] }>("temprooms").then((j) => ({ rooms: j.rooms || [], cands: j.candidates || [] })), refetchInterval: 5000 });
  const live = q.data?.rooms.find((r) => r.id === id);
  return { live, gone: !!q.data && !live, cands: q.data?.cands || [], refetch: q.refetch };
};
const useMeetMsgs = (id: string) => useQuery({ queryKey: ["nomute", "meet", id], queryFn: () => office<{ messages?: OfficeMsg[] }>(`rooms/${encodeURIComponent(id)}/messages?n=100`).then((j) => j.messages || []), refetchInterval: 3000 }).data || [];
const purposeM = (m: OfficeMsg) => /^\s*(![^\s]+\s*)*\[임시방 목적/.test(String(m.text || ""));   // 목적 말풍선(설명글) = 회의 대화엔 안 보임(형 15:15 「이거는 설명글은 필요없고」)

/** 칸 아래 = 그 방 대화(우리 대화 부품 그대로 · 말하는 이 왼쪽 · 형 오른쪽 · 형 15:02 「우리 대화하는것 처럼 올라갔으면 좋겠어. 동일한 디자인 계승해서 각자의 프로필 색에 똑같이」) · 끝난 방 = 「새 회의」 */
export function MeetDock({ meet, onEnd }: { meet: Meet; onEnd: () => void }) {
  const { gone } = useMeetRoom(meet.id);
  if (gone) return <div className="nm-meet"><div className="nm-meet-row"><button type="button" className="nm-web-btn nm-meet-end" onClick={onEnd}>새 회의</button></div></div>;
  return <div className="nm-meet open"><div className="nm-meet-chat"><OfficeChat room={meet.id} hide={purposeM} /></div></div>;
}

/** 화면 왼쪽 위 사람 칸(형 15:01 「이런 좌측 에 누가 들어와잇는지 프로필 그 동그라미랑 이름이랑 같이 (이모지 포함)」 · 「들어와있으면 초록불, 안들어와잇으면 회색불」 · 「맨 아래는 초대하기 / 그리고 내보내기는 방 내보내기랑 같은 개념으로 이름 우측에」) */
export function MeetPeople({ meet, at }: { meet: Meet; at?: { x: number; y: number } | null }) {   // at = 화면 그림 칸 왼쪽 위(다리 nm-co-rect) · 다리 탭 줄 안 가림
  const { live, cands, refetch } = useMeetRoom(meet.id);
  const msgs = useMeetMsgs(meet.id);
  const list = useQuery({ queryKey: officeKeys.people, queryFn: () => people(), staleTime: 60_000 }).data || [];
  const members = live?.members?.length ? live.members : meet.members;
  const ans = useMemo(() => answersOf(msgs, members, meet.t0), [msgs, members, meet.t0]);
  const ctrl = useTogetherNow().ctrl;
  const [inv, setInv] = useState(false), [busy, setBusy] = useState(""), [why, setWhy] = useState(""), [inviting, setInviting] = useState<string[]>([]), [kicking, setKicking] = useState<string[]>([]);
  const [open, setOpen] = useState(() => { try { return localStorage.getItem(`${KEY}_ppl`) !== "0"; } catch { return true; } });   // 명단 접기(형 11-13 16:15 「명단 접을수도 잇나?」) · 이 기기에 기억
  const flip = () => setOpen((v) => { try { localStorage.setItem(`${KEY}_ppl`, v ? "0" : "1"); } catch { /* 이 기기 */ } return !v; });
  const setMembers = async (next: string[], tag: string) => {
    if (!live) return;
    const who = tag.slice(1), add = tag[0] === "+";
    setBusy(tag); setWhy("");
    if (add) setInviting((l) => [...l, who]); else setKicking((l) => [...l, who]);   // 누른 순간부터 그 줄 = 「들어오는 중…」 · 「내보내는 중…」(서버 답 전)
    try { await office(`temprooms/${encodeURIComponent(meet.id)}`, { method: "POST", body: JSON.stringify({ name: live.name, purpose: live.purpose, members: next }) }); await refetch(); }
    catch (e) { setWhy(e instanceof Error ? e.message : "못 했어"); }
    setInviting((l) => l.filter((x) => x !== who)); setKicking((l) => l.filter((x) => x !== who));
    setBusy("");
  };
  const pOf = (who: string): OfficePerson | undefined => list.find((x) => x.who === who);
  const rows = ["형", ...members.filter((n) => n !== "형"), ...inviting.filter((n) => !members.includes(n))];
  type St = "on" | "coming" | "no" | "kick";
  const stOf = (n: string): St => (kicking.includes(n) ? "kick" : n === "형" || n === SCRIBE || ans[n]?.a === "yes" ? "on" : ans[n]?.a === "no" ? "no" : "coming");   // 초대했는데 아직 [수락] 전 = 들어오는 중(회색과 다른 꼴 · 형 19:3x)
  const inRoom = (n: string) => stOf(n) === "on";   // 들어옴 = 형 · 기록관 · 「[수락]」 한 이
  return (
    <div className={`nm-meet-ppl${open ? "" : " shut"}`} aria-label="화상회의에 들어와 있는 이" style={at ? { top: at.y + 10 } : undefined}>
      <div className="nm-mp-hrow">   {/* 머리 줄 = 「명단 2/2」 · 바로 옆 작은 「+」(초대 · 형 11-14 01:45 시아 옮김 「초대하기는 + 아이콘으로만 변경해서 2/2 옆에 컴팩트하게 들어가면 될것같아 그럼 더 깔끔」 · 「+ 는 연회색 이여도 돼 강조안되어도됨」) · 꺾쇠 = 접기(옛 에디터 .tbrief-led 아코디언 그대로) */}
        <button type="button" className="nm-mp-h" aria-expanded={open} onClick={flip} title={open ? "명단 접기" : "명단 펴기"}><span>명단</span><b>{rows.filter(inRoom).length}/{rows.length}</b></button>
        <button type="button" className="nm-mp-add" aria-label={inv ? "초대 닫기" : "초대하기"} title={inv ? "초대 닫기" : "초대하기"} aria-expanded={inv} onClick={() => { if (!open) flip(); setInv((v) => !v); }}>{inv ? "×" : "+"}</button>
        <button type="button" className="nm-mp-chev" aria-expanded={open} onClick={flip} aria-label={open ? "명단 접기" : "명단 펴기"}><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
      </div>
      <div className="nm-mp-w" {...(open ? {} : { inert: "" as unknown as boolean })}><div className="nm-mp-l">
      {rows.map((n) => {
        const p = pOf(n), st = stOf(n), on = st === "on", ring = ringOf(p);
        return (
          <div key={n} className={`nm-mp ${st}${on ? " on" : ""}`} title={on ? "들어와 있음" : st === "no" ? `거절${ans[n]?.why ? " · " + ans[n]?.why : ""}` : st === "kick" ? "내보내는 중" : "들어오는 중(초대 · [수락] 기다림)"}>
            <span className="nm-mp-ava">{faceOf(n) ? <img src={faceOf(n)} alt="" /> : null}<i className="nm-mp-dot" /></span>
            <span className="nm-mp-nm" style={ring ? ({ "--yn": ring } as React.CSSProperties) : undefined}><span className="nm-mp-n1">{p?.name || nameOf(n)}{p?.mark ? <span className="ymark" aria-hidden>{p.mark}</span> : null}{n === SCRIBE ? <span className="nm-mp-role">(기록관)</span> : null}</span>
              {st === "coming" ? <small className="nm-mp-st">들어오는 중<Dots /></small> : st === "kick" ? <small className="nm-mp-st">내보내는 중<Dots /></small> : st === "no" ? <small className="nm-mp-st">거절{ans[n]?.why ? ` · ${ans[n]?.why}` : ""}</small> : null}</span>
            {ctrl && ctrl === n ? <span className="nm-mp-ctl" title="제어권 쥠">✋</span> : null}
            {n !== "형" ? <button type="button" className="nm-mp-x" aria-label={`${nameOf(n)} 내보내기`} title="내보내기" disabled={!!busy || members.length <= 1} onClick={() => void setMembers(members.filter((x) => x !== n), "x" + n)}>×</button> : null}
          </div>
        );
      })}
      {inv ? (
        <div className="nm-mp-pick">
          {cands.filter((n) => !members.includes(n)).map((n) => <button key={n} type="button" disabled={!!busy} onClick={() => { setInv(false); void setMembers([...members, n], "+" + n); }}>{nameOf(n)}{pOf(n)?.mark ? " " + pOf(n)!.mark : ""}</button>)}
        </div>
      ) : null}
      {why ? <small role="alert" className="nm-mp-why">{why}</small> : null}
      </div></div>
    </div>
  );
}

// 회의록 한 장 = 대화 + 같이 본 주소(보기 시작한 시각) + 행위 줄 · 시각 차례(형 11-13 17:09 「화면 공유로 같이 본 주소만 남게」 · 17:10 「시작 시간 대 별로」 · 「어떤 행위가 잇엇는지가 남기는게 쉬우면 남을수록 좋고」 · 서버 editor _meettrail.js · 깃 다리 events)
export const EV_LABEL: Record<string, string> = { tab_open: "새 탭", tab_switch: "탭 바꿈", tab_close: "탭 닫음", take: "제어권 쥠", release: "제어권 놓음", auto_release: "제어권 풀림", curtain_on: "커튼 침", curtain_off: "커튼 걷음", bot_click: "누름", bot_text: "글 침", bot_nav: "주소 이동", bot_back: "뒤로", enter: "입력", sketch: "스케치" };
type TrailRow = { t: "msg" | "url" | "ev"; at: number; who?: string; text?: string; url?: string; title?: string; kind?: string };
/** 순수 — 기록 한 장 → 시각 차례 줄(같은 시각 = 주소 · 행위 먼저) */
export function trailRows(log: { messages?: { who: string; ts: number; text: string }[]; urls?: { at: number; url: string; title?: string }[]; events?: { at: number; who: string; kind: string; text?: string }[] } | null | undefined): TrailRow[] {
  if (!log) return [];
  const rows: TrailRow[] = [
    ...(log.urls || []).map((u) => ({ t: "url" as const, at: u.at, url: u.url, title: u.title })),
    ...(log.events || []).map((e) => ({ t: "ev" as const, at: e.at, who: e.who, kind: e.kind, text: e.text })),
    ...(log.messages || []).filter((m) => !/^\s*(![^\s]+\s*)*\[임시방 목적/.test(m.text || "")).map((m) => ({ t: "msg" as const, at: m.ts, who: m.who, text: m.text })),
  ];
  const rank = { url: 0, ev: 1, msg: 2 };
  return rows.sort((a, b) => a.at - b.at || rank[a.t] - rank[b.t]);
}
const hm = (t: number) => { const d = new Date(t); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

/** 서랍 「화상회의」 = 끝난 회의 기록 목록(서버 GET meetlog · 줄 = yyyy-mm-dd hh-mm 제목 · 참여자 · 주제 · 형 11-13 06:5x) · 누르면 그 회의 대화 한 장 */
export function MeetLogList() {
  const list = useQuery({ queryKey: ["nomute", "meetlog"], queryFn: () => office<{ logs?: { key: string; title: string; members: string[]; topic?: string; n: number }[] }>("meetlog").then((j) => j.logs || []), staleTime: 30_000 });
  const [open, setOpen] = useState("");
  const one = useQuery({ queryKey: ["nomute", "meetlog", open], enabled: !!open, queryFn: () => office<{ log?: { messages: { who: string; ts: number; text: string }[]; urls?: { at: number; url: string; title?: string }[]; events?: { at: number; who: string; kind: string; text?: string }[]; purpose?: string } }>(`meetlog/${encodeURIComponent(open)}`).then((j) => j.log || null) });
  const rows = list.data || [];
  return (
    <div className="nm-meetlog">
      {list.isLoading ? <p className="nm-meetlog-empty">불러오는 중…</p> : !rows.length ? <p className="nm-meetlog-empty">아직 끝난 화상회의가 없어 — 위 「화상회의」 탭으로 열고 끝내면 대화 · 같이 본 주소 · 행위가 시각 차례로 여기 담겨</p> : null}
      {rows.map((r) => (
        <div key={r.key} className="nm-meetlog-row">
          <button type="button" onClick={() => setOpen(open === r.key ? "" : r.key)} aria-expanded={open === r.key}>
            <b>{r.key.slice(0, 16)} · {r.title}</b>
            <small>{(r.members || []).map((n) => nameOf(n)).join(" · ")}{r.topic ? ` — ${r.topic}` : ""} · 글 {r.n}</small>
          </button>
          {open === r.key ? (
            <div className="nm-meetlog-body">
              {trailRows(one.data).map((r, k) => r.t === "msg" ? <p key={k}><span className="nm-ml-t">{hm(r.at)}</span><b>{nameOf(r.who)}</b> {r.text}</p>
                : <p key={k} className={`nm-ml-line ${r.t}`}><span className="nm-ml-t">{hm(r.at)}</span>{r.t === "url" ? <>🌐 <a href={r.url} target="_blank" rel="noreferrer">{r.title || r.url}</a></> : <>{nameOf(r.who)} · {EV_LABEL[r.kind] || r.kind}{r.text ? ` · ${r.text}` : ""}</>}</p>)}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

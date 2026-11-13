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
export const meetPurpose = (_members: string[] = []) =>
  `화상회의 — 형이 맥 72 브라우저(같이 보기)를 열어 두고 같이 보며 이야기해(형 11-13 「그 화면을 보면서 할수잇어야하고」). ` +
  `부르는 법 = 형이 이 방 대화에서 「@이름」 → 그 애가 방에 들어오며 깸(형 11-13 11:01 「아래에 @로 호출하면 한명씩 참가하는 느낌」). ` +
  `불리면 이 방에 한 줄: 들어오면 「[수락]」 · 지금 못 오면 「[거절] 까닭 한 줄」(하던 일 따라 · 형 「상황에 따라서」). ` +
  `지금 그 창 = 이 방 읽기 머리 「지금 같이 보는 창」 · 손 = send 「[화면 click] …」(한 번에 한 사람 · 쥔 이 「○○가 제어하고 있습니다」) · 짚기 = 「[스케치 rect] x,y,w,h 글」. ` +
  `${SCRIBE} = 자동 참여 · 기록관(답 안 해도 됨).`;

/** 회의 열기 = 형 + 챙(기록관)으로 임시방 하나 · 나머지는 아래 대화 「@이름」으로 한 명씩(형 11-13 11:01) */
export async function startMeet(): Promise<Meet> {
  const t = new Date(), name = `화상회의 ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  const j = await office<{ room: { id: string } }>("temprooms", { method: "POST", body: JSON.stringify({ name, purpose: meetPurpose(), members: [SCRIBE], hours: 2 }) });
  return { id: j.room.id, members: [SCRIBE], t0: Date.now() - 2000 };
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

/** 회의 종료 = 형만 · 누르면 1분 카운트(방에 알림) · 다시 누르면 취소 · 0 = 서버 meetlog 로 기록 서랍에 담고 방 닫힘(형 11-13 06:5x 「종료하면 1분 동안 회의 종료 카운트 알리고 종료되면서 방 나가짐 알림 뜸」) · 단추 자리 = 머리 오른쪽 */
export function useMeetEnd(meet: Meet | null, onEnd: () => void) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const id = meet?.id || "";
  const [endAt, setEndAt] = useState<number>(0);
  useEffect(() => { try { setEndAt(+(localStorage.getItem(`${KEY}_end_${id}`) || 0)); } catch { setEndAt(0); } }, [id]);
  const [ending, setEnding] = useState(false);
  const say = (text: string) => office(`rooms/${encodeURIComponent(id)}/messages`, { method: "POST", body: JSON.stringify({ text }) }).catch(() => {});
  const keepEnd = (t: number) => { setEndAt(t); try { if (t) localStorage.setItem(`${KEY}_end_${id}`, String(t)); else localStorage.removeItem(`${KEY}_end_${id}`); } catch { /* 이 기기 */ } };
  const toggle = async () => {
    if (!id) return;
    if (endAt) { keepEnd(0); await say("회의 종료 취소 — 계속해"); return; }
    keepEnd(Date.now() + 60_000); await say("회의 종료 1분 전 — 1분 뒤 이 방이 닫혀(대화는 기록 서랍 「화상회의」에 남아) · 할 말 있으면 지금");
  };
  const left = endAt ? Math.max(0, Math.ceil((endAt - now) / 1000)) : 0;
  useEffect(() => {
    if (!id || !endAt || now < endAt || ending) return;
    setEnding(true);
    void (async () => {
      await say("회의가 끝났어 · 모두 나감 — 기록 서랍 「화상회의」에 담았어");
      await office(`meetlog/${encodeURIComponent(id)}`, { method: "POST", body: "{}" }).catch(() => {});
      keepEnd(0); setEnding(false); onEnd();
    })();
  }, [now, endAt, ending, id]);   // eslint-disable-line react-hooks/exhaustive-deps
  return { on: !!endAt, left, ending, toggle };
}

type ListRoom = { id: string; name?: string; purpose?: string; members?: string[] };
const useMeetRoom = (id: string) => {
  const q = useQuery({ queryKey: ["nomute", "temprooms", "list"], queryFn: () => office<{ rooms?: ListRoom[]; candidates?: string[] }>("temprooms").then((j) => ({ rooms: j.rooms || [], cands: j.candidates || [] })), refetchInterval: 5000 });
  const live = q.data?.rooms.find((r) => r.id === id);
  return { live, gone: !!q.data && !live, cands: q.data?.cands || [], refetch: q.refetch };
};
const useMeetMsgs = (id: string) => useQuery({ queryKey: ["nomute", "meet", id], queryFn: () => office<{ messages?: OfficeMsg[] }>(`rooms/${encodeURIComponent(id)}/messages?n=100`).then((j) => j.messages || []), refetchInterval: 3000 }).data || [];
const purposeM = (m: OfficeMsg) => /^\s*(!모두\s*)?\[임시방 목적/.test(String(m.text || ""));   // 목적 말풍선(설명글) = 회의 대화엔 안 보임(형 15:15 「이거는 설명글은 필요없고」)

/** 칸 아래 = 그 방 대화(우리 대화 부품 그대로 · 말하는 이 왼쪽 · 형 오른쪽 · 형 15:02 「우리 대화하는것 처럼 올라갔으면 좋겠어. 동일한 디자인 계승해서 각자의 프로필 색에 똑같이」) · 끝난 방 = 「새 회의」 */
export function MeetDock({ meet, onEnd }: { meet: Meet; onEnd: () => void }) {
  const { gone } = useMeetRoom(meet.id);
  if (gone) return <div className="nm-meet"><div className="nm-meet-row"><small className="nm-meet-left">이 회의는 끝났어(종료 · 기한)</small><button type="button" className="nm-web-btn nm-meet-end" onClick={onEnd}>새 회의</button></div></div>;
  return <div className="nm-meet open"><div className="nm-meet-chat"><OfficeChat room={meet.id} hide={purposeM} /></div></div>;
}

/** 화면 왼쪽 위 사람 칸(형 15:01 「이런 좌측 에 누가 들어와잇는지 프로필 그 동그라미랑 이름이랑 같이 (이모지 포함)」 · 「들어와있으면 초록불, 안들어와잇으면 회색불」 · 「맨 아래는 초대하기 / 그리고 내보내기는 방 내보내기랑 같은 개념으로 이름 우측에」) */
export function MeetPeople({ meet, at }: { meet: Meet; at?: { x: number; y: number } | null }) {   // at = 화면 그림 칸 왼쪽 위(다리 nm-co-rect) · 다리 탭 줄 안 가림
  const { live, cands, refetch } = useMeetRoom(meet.id);
  const msgs = useMeetMsgs(meet.id);
  const list = useQuery({ queryKey: officeKeys.people, queryFn: () => people(), staleTime: 60_000 }).data || [];
  const members = live?.members?.length ? live.members : meet.members;
  const ans = useMemo(() => answersOf(msgs, members, meet.t0), [msgs, members, meet.t0]);
  const ctrl = useQuery({ queryKey: ["nomute", "together", "now"], queryFn: () => office<{ now?: { ctrl?: { who?: string } } }>("together").then((j) => j.now?.ctrl?.who || ""), refetchInterval: 3000 }).data || "";
  const [inv, setInv] = useState(false), [busy, setBusy] = useState(""), [why, setWhy] = useState("");
  const setMembers = async (next: string[], tag: string) => {
    if (!live) return;
    setBusy(tag); setWhy("");
    try { await office(`temprooms/${encodeURIComponent(meet.id)}`, { method: "POST", body: JSON.stringify({ name: live.name, purpose: live.purpose, members: next }) }); await refetch(); }
    catch (e) { setWhy(e instanceof Error ? e.message : "못 했어"); }
    setBusy("");
  };
  const pOf = (who: string): OfficePerson | undefined => list.find((x) => x.who === who);
  const rows = ["형", ...members.filter((n) => n !== "형")];
  const inRoom = (n: string) => n === "형" || n === SCRIBE || ans[n]?.a === "yes";   // 들어옴 = 형 · 기록관 · 「[수락]」 한 이
  return (
    <div className="nm-meet-ppl" aria-label="화상회의에 들어와 있는 이" style={at ? { top: at.y + 10 } : undefined}>
      {rows.map((n) => {
        const p = pOf(n), on = inRoom(n), ring = ringOf(p);
        return (
          <div key={n} className={`nm-mp${on ? " on" : ""}`} title={on ? "들어와 있음" : ans[n]?.a === "no" ? `거절${ans[n]?.why ? " · " + ans[n]?.why : ""}` : "아직 안 들어옴"}>
            <span className="nm-mp-ava">{faceOf(n) ? <img src={faceOf(n)} alt="" /> : null}<i className="nm-mp-dot" /></span>
            <span className="nm-mp-nm" style={ring ? ({ "--yn": ring } as React.CSSProperties) : undefined}>{p?.name || nameOf(n)}{p?.mark ? <span className="ymark" aria-hidden>{p.mark}</span> : null}</span>
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
      <button type="button" className="nm-mp-inv" onClick={() => setInv((v) => !v)} aria-expanded={inv}>{inv ? "닫기" : "+ 초대하기"}</button>
      {why ? <small role="alert" className="nm-mp-why">{why}</small> : null}
    </div>
  );
}

/** 서랍 「화상회의」 = 끝난 회의 기록 목록(서버 GET meetlog · 줄 = yyyy-mm-dd hh-mm 제목 · 참여자 · 주제 · 형 11-13 06:5x) · 누르면 그 회의 대화 한 장 */
export function MeetLogList() {
  const list = useQuery({ queryKey: ["nomute", "meetlog"], queryFn: () => office<{ logs?: { key: string; title: string; members: string[]; topic?: string; n: number }[] }>("meetlog").then((j) => j.logs || []), staleTime: 30_000 });
  const [open, setOpen] = useState("");
  const one = useQuery({ queryKey: ["nomute", "meetlog", open], enabled: !!open, queryFn: () => office<{ log?: { messages: { who: string; ts: number; text: string }[]; purpose?: string } }>(`meetlog/${encodeURIComponent(open)}`).then((j) => j.log || null) });
  const rows = list.data || [];
  return (
    <div className="nm-meetlog">
      {list.isLoading ? <p className="nm-meetlog-empty">불러오는 중…</p> : !rows.length ? <p className="nm-meetlog-empty">아직 끝난 화상회의가 없어 — 같이 보기(브라우저) 칸 「화상회의」로 열면 끝날 때 여기 담겨</p> : null}
      {rows.map((r) => (
        <div key={r.key} className="nm-meetlog-row">
          <button type="button" onClick={() => setOpen(open === r.key ? "" : r.key)} aria-expanded={open === r.key}>
            <b>{r.key.slice(0, 16)} · {r.title}</b>
            <small>{(r.members || []).map((n) => nameOf(n)).join(" · ")}{r.topic ? ` — ${r.topic}` : ""} · 글 {r.n}</small>
          </button>
          {open === r.key ? (
            <div className="nm-meetlog-body">
              {(one.data?.messages || []).map((m, k) => <p key={k}><b>{nameOf(m.who)}</b> {m.text}</p>)}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

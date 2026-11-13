// 팀즈 모드(형 11-06 봄 창 「팀즈도 버튼눌러서 여기에서 가능해? 전환해서 내가 연결붙이면」 · 「팀즈 를 누르면 팀즈모드로 전환되는 느낌이랄까」 ·
//   「팀즈 창 수집이라기보다는 팀즈를 이 사무실 안에서 할수잇는거야」 · 「전송이랑 다 가능해야해 채팅」 · 「파일확인 등」)
//   = 대화 목록 맨 위 「사무실 | 팀즈」 바꿈 · 팀즈 = 목록(teams/chats) · 방(teams/messages · 새 글 먼저 30 · 더 앞 = next) · 보내기(teams/send) · 파일(teams/file) · 글 안 그림(teams/hosted)
//   서버 = 윈터 _teams.js(wa/teams-graph) · 로그인 = 기기 코드(POST teams/login → 코드 크게 + microsoft.com/devicelogin · 기다리는 동안 GET teams 5초마다 = 서버가 마저 받음)
//   방 주소 = /channels/teams:<chat id>(대화 판은 OfficeChat 이 이 앞머리를 보고 TeamsChat 으로)
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { DuetIcon } from "@/components/duet/icons";
import { office } from "../data/office";
import { t12 } from "./when";
import "./teams.css";

export const TEAMS_PREFIX = "teams:";
export const isTeams = (room: string) => room.startsWith(TEAMS_PREFIX);
const href = (chat: string) => `/channels/${encodeURIComponent(TEAMS_PREFIX + chat)}`;

// 바꿈 = 이 기기에 기억(다시 열어도 그 판) · 같은 창 안 여러 곳이 같이 바뀌게 작은 알림
const MODE_KEY = "nm-teams-mode";
const subs = new Set<() => void>();
const readMode = () => { try { return localStorage.getItem(MODE_KEY) === "teams"; } catch { return false; } };
export function setTeamsMode(on: boolean) { try { localStorage.setItem(MODE_KEY, on ? "teams" : "office"); } catch { /* 이번만 */ } subs.forEach((f) => f()); }
export const useTeamsMode = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, readMode, () => false);

/* 이 기기 기억 셋(형 11-13 10:23 봄 옮김 「팀즈 미미리 얼굴 보이게 로딩떠도돼. 이게 렉이걸리면 사진을 아주 축소해서 애초에 저장을하자」 · 「새로 들어온 글도 여기서 알수있으면 베스트임」 · 뎅)
   · 대화 목록 = 마지막에 받은 판을 먼저 그림(이름 바로) · 그사이 새로 받음
   · 얼굴 칸 = 뺌(형 11-13 11:36 봄 옮김 「기다리지 않게해줘. 근데 그러면 실제로 얼굴 칸이 의미가없잖아? 팀즈는 얼굴칸 없어도 될거같아」 · 그래프 얼굴 길이 통째 막혀 한 장 12초)
   · 읽은 때 = 대화마다 「여기까지 봄」 · 그보다 새 글(남이 쓴 것) = 목록 굵게 + 라임 점 · 팀즈 탭 · 바꿈 단추에 숫자 */
const CHATS_KEY = "nm-teams-chats", SEEN_KEY = "nm-teams-seen";
const readJ = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const writeJ = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 가득 참 · 막힘 = 이번만 */ } };
const seenSubs = new Set<() => void>();
let seenMem: Record<string, string> | null = null;
const seenNow = () => (seenMem ??= readJ<Record<string, string> | null>(SEEN_KEY, null) || ({} as Record<string, string>));
const seenEver = () => { try { return localStorage.getItem(SEEN_KEY) != null; } catch { return true; } };
function markSeen(chat: string, at?: string) {
  if (!chat || !at || (seenNow()[chat] || "") >= at) return;
  seenMem = { ...seenNow(), [chat]: at }; writeJ(SEEN_KEY, seenMem); seenSubs.forEach((f) => f());
}
const useSeen = () => useSyncExternalStore((f) => { seenSubs.add(f); return () => seenSubs.delete(f); }, seenNow, seenNow);

type Me = { configured?: boolean; signed_in?: boolean; user?: { id?: string; name?: string; upn?: string }; pending?: { user_code?: string; verification_uri?: string; expires_at?: number | string } | null };
type Person = { id: string; name?: string };
type Chat = { id: string; type?: string; topic?: string; members?: string[]; people?: Person[]; last?: { from?: string; from_id?: string; text?: string; at?: string } };
type TMsg = { id: string; from?: string; from_id?: string; at?: string; text?: string; html?: string; files?: { name?: string; url?: string }[]; hosted?: string[] };
type Page = { messages: TMsg[]; next?: string };

const meKey = ["nomute", "teams", "me"] as const;

/* 얼굴 · 접속 불 칸 = 뺌(형 11-13 11:36 봄 옮김 「팀즈는 얼굴칸 없어도 될거같아」 · 앞 판 = 서버 teams/photo · teams/presence · git 이력) */
/* 사람 표(형 11-06 번개 창 「박민주 단장님 이거 넣어드려라 ㅠㅠ」 · 「그리고 뒤에 직급 다 붙일수잇어? 내가 직급알려줄게」) — 서버 teams/people {이름: {title, face}}
   · title = 이름 뒤에 붙는 직급(「박민주 단장」) · face = 우리가 넣어 준 얼굴(이 화면에선 안 씀 · 11-13) · 이 화면에서만 보임(팀즈 원본은 안 바뀜) */
type PeopleTable = Record<string, { title?: string; face?: boolean; v?: number }>;
function usePeopleTable(on: boolean): PeopleTable {
  return useQuery({ queryKey: ["nomute", "teams", "people"], queryFn: () => office<{ people?: PeopleTable }>("teams/people").then((j) => j.people || {}), enabled: on, staleTime: 5 * 60_000, retry: false }).data || {};
}
const titled = (name: string | undefined, t: PeopleTable) => (name && t[name]?.title ? `${name} ${t[name].title}` : name || "");
/** 1:1 대화의 상대(나 말고 한 사람) — 여럿이면 없음(모임 대화 = 첫 글자 동그라미) */
const other = (c: Chat, me?: Me["user"]) => { const l = (c.people || []).filter((x) => x.id && x.id !== me?.id && x.name !== me?.name); return c.type === "oneOnOne" && l.length === 1 ? l[0] : undefined; };
function useTeamsMe(fast: boolean) {
  return useQuery({ queryKey: meKey, queryFn: () => office<Me>("teams"), refetchInterval: fast ? 5_000 : 60_000, staleTime: 4_000, retry: false });
}
/** 대화 목록 한 벌(목록 · 대화 판 · 탭 숫자 같이) — 처음엔 이 기기에 둔 마지막 판을 그리고 바로 새로 받음 */
function useTeamsChats(on: boolean) {
  const q = useQuery({ queryKey: ["nomute", "teams", "chats"], queryFn: () => office<{ chats?: Chat[] }>("teams/chats").then((j) => j.chats || []), enabled: on,
    initialData: () => { const l = readJ<Chat[]>(CHATS_KEY, []); return l.length ? l : undefined; }, initialDataUpdatedAt: 0,
    refetchInterval: () => (document.hidden ? false : 30_000), staleTime: 10_000, retry: false });
  useEffect(() => {
    if (!q.data || !q.dataUpdatedAt) return;
    writeJ(CHATS_KEY, q.data.slice(0, 50));
    if (!seenEver()) for (const c of q.data) markSeen(c.id, c.last?.at);   // 이 기기 첫 판 = 다 읽은 걸로(옛 글이 한꺼번에 「새 글」로 뜨지 않게)
  }, [q.data, q.dataUpdatedAt]);
  return q;
}
const isNew = (c: Chat, seen: Record<string, string>, me?: Me["user"]) => !!c.last?.at && (seen[c.id] || "") < c.last.at && !(me?.id && c.last.from_id === me.id) && !(me?.name && c.last.from === me.name);
/** 새 글 있는 팀즈 대화 수(팀즈 탭 · 바꿈 단추) — 로그인 안 했으면 0 */
export function useTeamsUnread() {
  const me = useTeamsMe(false).data, seen = useSeen();
  const chats = useTeamsChats(!!me?.signed_in);
  return me?.signed_in ? (chats.data || []).filter((c) => isNew(c, seen, me.user)).length : 0;
}
/** 받는 동안 = 라임 점 셋(앱 다른 칸 LazyDots 와 같은 꼴 · 형 11-13 「팀즈 때도 점 세개 로딩중 시그니처 색으로」) · slim = 그려 둔 목록 위 한 줄 */
const Dots = ({ slim }: { slim?: boolean }) => <div className={`nm-lazy nm-tdots${slim ? " slim" : ""}`} role="status" aria-label="불러오는 중"><i /><i /><i /></div>;
/* 글 안 표(형 11-13 13:03 봄 옮김 「팀즈가 이렇게 원래 표구조로 나오는데, 이게 잘살릴수잇느는지도 한번 확인해줘」 · 뎅) — 그래프 본문 HTML 에 <table> 이 그대로 옴(실물 11-13 · tbody/tr/td)
   → 본문을 「글 조각 · 표 조각」 차례로 나눔 · 칸 = 글자만(링크 · 꾸밈 · 스크립트 0 = innerHTML 안 씀) · 표 없는 글 = 지금처럼 text 그대로 */
type Part = { t: "text"; s: string } | { t: "table"; rows: { th: boolean; cells: string[] }[] };
const cellText = (el: Element) => { const c = el.cloneNode(true) as Element; c.querySelectorAll("br").forEach((b) => b.replaceWith("\n")); c.querySelectorAll("p,div,li").forEach((b) => b.append("\n")); return (c.textContent || "").replace(/\u00a0/g, " ").replace(/\n{2,}/g, "\n").trim(); };
function partsOf(html?: string): Part[] | null {
  if (!html || !/<table/i.test(html) || typeof DOMParser === "undefined") return null;
  const body = new DOMParser().parseFromString(html, "text/html").body, out: Part[] = [];
  let buf = "";
  const flush = () => { const t = buf.replace(/\n{3,}/g, "\n\n").trim(); if (t) out.push({ t: "text", s: t }); buf = ""; };
  const walk = (n: Node) => {
    if (n.nodeType === 3) { buf += (n.textContent || "").replace(/\u00a0/g, " "); return; }
    if (n.nodeType !== 1) return;
    const el = n as Element, tag = el.tagName;
    if (tag === "TABLE") { flush(); out.push({ t: "table", rows: [...el.querySelectorAll("tr")].map((tr) => ({ th: [...tr.children].every((c) => c.tagName === "TH"), cells: [...tr.children].map(cellText) })) }); return; }
    if (tag === "BR") { buf += "\n"; return; }
    if (tag === "SCRIPT" || tag === "STYLE") return;
    el.childNodes.forEach(walk);
    if (/^(P|DIV|LI|H[1-6]|TR)$/.test(tag)) buf += "\n";
  };
  body.childNodes.forEach(walk); flush();
  return out.some((x) => x.t === "table") ? out : null;
}
function TTable({ rows }: { rows: { th: boolean; cells: string[] }[] }) {
  return <div className="nm-ttable"><table><tbody>{rows.map((r, i) => <tr key={i}>{r.cells.map((c, k) => r.th ? <th key={k}>{c}</th> : <td key={k}>{c}</td>)}</tr>)}</tbody></table></div>;
}
/* 날짜 가름 · 시각 묶음 = 우리 대화(office-chat.tsx dayKey · dateLabel · TIME_GAP)와 같은 셈 */
const kst = (ts: number) => new Date(ts + 9 * 3600e3);
const dayKey = (ts: number) => kst(ts).toISOString().slice(0, 10);
const dateLabel = (ts: number) => `${dayKey(ts).slice(5).replace("-", "/")}(${"일월화수목금토"[kst(ts).getUTCDay()]})`;
const TIME_GAP = 60_000;
/* 대화마다 스크롤 자리(이 탭 동안 · 앱이 새 판으로 다시 읽혀도) — 정원 갔다 다시 팀즈 = 보던 자리 그대로(형 11-13 12:43 봄 옮김 「팀즈에서 다시 정원을 누르면 그 채팅이 뜨게」 · 「✓ ③ 둘 다」 · 뎅) · 맨 아래면 안 둠(새 글 따라감) */
const SCROLL_KEY = (chat: string) => `nm-teams-scroll:${chat}`;
function keepScroll(chat: string, b: HTMLElement) { try { const atEnd = b.scrollHeight - b.scrollTop - b.clientHeight < 40; if (atEnd) sessionStorage.removeItem(SCROLL_KEY(chat)); else sessionStorage.setItem(SCROLL_KEY(chat), String(Math.round(b.scrollTop))); } catch { /* 이번만 */ } }
const savedScroll = (chat: string) => { try { const v = sessionStorage.getItem(SCROLL_KEY(chat)); return v == null ? null : +v; } catch { return null; } };
const chatName = (c: Chat, me?: string) => c.topic || (c.members || []).filter((m) => m && m !== me).join(", ") || "(이름 없는 대화)";
const ago = (at?: string) => { const t = at ? Date.parse(at) : NaN; if (!Number.isFinite(t)) return ""; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? "방금" : m < 60 ? `${m}분` : m < 1440 ? t12(t) : new Date(t).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }); };

/** 「사무실 | 팀즈」 바꿈(대화 목록 맨 위) */
export function TeamsSwitch() {
  const on = useTeamsMode(), n = useTeamsUnread();
  return (
    <div className="nm-tswitch" role="tablist" aria-label="대화 판 바꾸기">
      <button type="button" role="tab" aria-selected={!on} onClick={() => setTeamsMode(false)}>사무실</button>
      <button type="button" role="tab" aria-selected={on} onClick={() => setTeamsMode(true)}>팀즈{n ? <span className="nm-tbadge">{n > 99 ? "99+" : n}</span> : null}</button>
    </div>
  );
}

/** 로그인 판 — 준비 전(형 앱 등록 전) · 로그인 단추 · 기기 코드 크게 */
function TeamsLogin({ me, err }: { me?: Me; err?: string }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false), [why, setWhy] = useState("");
  const code = me?.pending?.user_code, uri = me?.pending?.verification_uri || "https://microsoft.com/devicelogin";
  const login = async () => {
    setBusy(true); setWhy("");
    try { const j = await office<{ user_code?: string; verification_uri?: string }>("teams/login", { method: "POST", body: "{}" }); qc.setQueryData<Me>(meKey, (o) => ({ ...(o || {}), pending: { user_code: j.user_code, verification_uri: j.verification_uri } })); void qc.invalidateQueries({ queryKey: meKey }); }
    catch (e) { setWhy(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };
  if (err) return <div className="nm-tlogin"><p>팀즈 서버에 못 닿았어 · {err}</p></div>;
  if (!me) return <Dots />;
  if (me.configured === false) return <div className="nm-tlogin"><b>팀즈 준비 중</b><p>형 회사 앱 등록이 끝나면 여기서 바로 로그인돼.</p></div>;
  return (
    <div className="nm-tlogin">
      {code ? (
        <>
          <p>아래 코드를 마이크로소프트 로그인 창에 넣어 줘</p>
          <button type="button" className="nm-tcode" title="누르면 복사" onClick={() => { void navigator.clipboard?.writeText(code); }}>{code}</button>
          <a className="nm-tgo" href={uri} target="_blank" rel="noopener">로그인 창 열기</a>
          <small>로그인하면 여기가 저절로 바뀌어</small>
        </>
      ) : (
        <>
          <b>팀즈 로그인</b>
          <p>회사 계정으로 한 번 로그인하면 사무실 안에서 팀즈 대화를 보고 보낼 수 있어.</p>
          <button type="button" className="nm-tgo" disabled={busy} onClick={() => void login()}>{busy ? "코드 받는 중…" : "로그인"}</button>
        </>
      )}
      {why ? <p role="alert" className="nm-terr">{why}</p> : null}
    </div>
  );
}

/** 팀즈 대화 목록(대화 목록 자리) */
export function TeamsList({ current }: { current?: string }) {
  const nav = useNavigate(), qc = useQueryClient();
  const meQ = useTeamsMe(false);
  const me = meQ.data, signed = !!me?.signed_in;
  const meFast = useTeamsMe(!!me?.pending && !signed);   // 코드 기다리는 동안 5초(같은 열쇠 · 하나만 돎)
  void meFast;
  const chats = useTeamsChats(signed), seen = useSeen();
  const table = usePeopleTable(signed);
  const rowName = (c: Chat) => { const o = other(c, me?.user); return c.topic ? c.topic : o ? titled(o.name, table) : (c.members || []).filter((m) => m && m !== me?.user?.name).map((m) => titled(m, table)).join(", ") || "(이름 없는 대화)"; };
  const err = meQ.error ? (meQ.error as Error).message : "";
  void qc;
  const cached = !!chats.data && !chats.dataUpdatedAt;   // 이 기기에 둔 판을 그리는 중(새로 받는 중)
  return (
    <div className="nm-tlist">
      {!signed ? <TeamsLogin me={me} err={err} /> : (
        <>
          {/* 머리 줄(이름 · 로그아웃) 뺌 = 로그아웃은 설정 「팀즈」 줄(형 11-13 10:23 봄 옮김 「이거 잇을 필요없구」) */}
          {cached && chats.isFetching ? <Dots slim /> : null}
          {!chats.data ? (chats.error ? <p className="nm-tnote">대화를 못 받았어 · {(chats.error as Error).message}</p> : <Dots />) : !chats.data.length ? <p className="nm-tnote">대화가 없어</p> : (
            <ul>
              {chats.data.map((c) => (
                <li key={c.id}>
                  <button type="button" className={[current === TEAMS_PREFIX + c.id ? "on" : "", isNew(c, seen, me?.user) ? "new" : ""].filter(Boolean).join(" ") || undefined} onClick={() => void nav({ to: href(c.id) })}>
                    <span className="min-w-0 flex-1"><b className="block truncate">{rowName(c)}</b><small className="block truncate">{c.last?.from ? `${c.last.from} · ` : ""}{c.last?.text || ""}</small></span>
                    <em>{ago(c.last?.at)}{isNew(c, seen, me?.user) ? <i className="nm-tnew" aria-label="새 글" /> : null}</em>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

/** 팀즈 대화 판 — 새 글 먼저 받은 것을 뒤집어 아래가 최신 · 위로 「앞 글 더 보기」 · 아래 입력칸(엔터 = 보내기 · 쉬프트+엔터 = 줄바꿈) */
export function TeamsChat({ chat }: { chat: string }) {
  const qc = useQueryClient();
  const meQ = useTeamsMe(false), me = meQ.data;
  const key = ["nomute", "teams", "msgs", chat];
  const page = useQuery({ queryKey: key, queryFn: () => office<Page>(`teams/messages?chat=${encodeURIComponent(chat)}`), enabled: !!me?.signed_in, refetchInterval: () => (document.hidden ? false : 10_000), staleTime: 5_000, retry: false });
  const [older, setOlder] = useState<TMsg[]>([]), [next, setNext] = useState<string | undefined>(undefined), [moreBusy, setMoreBusy] = useState(false);
  useEffect(() => { setOlder([]); setNext(undefined); }, [chat]);
  const nextOf = next ?? page.data?.next;
  const all = useMemo(() => { const seen = new Set<string>(); const out: TMsg[] = []; for (const m of [...(page.data?.messages || []), ...older]) if (!seen.has(m.id)) { seen.add(m.id); out.push(m); } return out.reverse(); }, [page.data, older]);
  const box = useRef<HTMLDivElement>(null), stick = useRef(true), restored = useRef("");
  useLayoutEffect(() => {   // 처음 그릴 때 = 이 대화 보던 자리가 있으면 거기 · 없으면 맨 아래 · 그 뒤 = 맨 아래 붙어 있을 때만 따라감
    const b = box.current; if (!b || !all.length) return;
    if (restored.current !== chat) { restored.current = chat; const y = savedScroll(chat); if (y != null) { stick.current = false; b.scrollTop = y; return; } stick.current = true; }
    if (stick.current) b.scrollTop = b.scrollHeight;
  }, [all.length, chat]);
  const more = async () => {
    if (!nextOf || moreBusy) return;
    setMoreBusy(true); stick.current = false;
    try { const j = await office<Page>(`teams/messages?chat=${encodeURIComponent(chat)}&next=${encodeURIComponent(nextOf)}`); setOlder((o) => [...o, ...(j.messages || [])]); setNext(j.next || ""); }
    finally { setMoreBusy(false); }
  };
  const [text, setText] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  // 파일 보내기(형 11-06 19:27 「파일보내기? 아냐~ 채팅만되면돼 ㅋㅋ음... 아니다 있으면 좋을거같애」) = 「+」로 고름 → 입력칸 위 칩 → 「↑」를 눌러야 나감(글은 같이 · 고르기만 해선 안 나감) · 서버 teams/upload(형 OneDrive 올림 → 대화 사람 보기 권한 → 첨부 글)
  const [file, setFile] = useState<File | null>(null), pick = useRef<HTMLInputElement>(null);
  useEffect(() => { setFile(null); }, [chat]);
  const upload = async (t: string, f: File) => {
    const fd = new FormData(); fd.append("chat", chat); if (t) fd.append("text", t); fd.append("file", f);
    const res = await fetch("/api/office/teams/upload", { method: "POST", credentials: "same-origin", cache: "no-store", body: fd });   // office() 는 몸이 있으면 JSON 머리를 붙여서 폼은 직접 보냄
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean; why?: string; error?: string; message?: TMsg };
    if (!res.ok || j.ok === false) throw new Error(j.why || j.error || `사무실 서버 ${res.status}`);
    return j;
  };
  const send = async () => {
    const t = text.trim(); if ((!t && !file) || busy) return;
    if (t.length > 4000) { setErr("4,000자 넘음 — 나눠서 보내 줘"); return; }
    setBusy(true); setErr("");
    try {
      const j = file ? await upload(t, file) : await office<{ message?: TMsg }>("teams/send", { method: "POST", body: JSON.stringify({ chat, text: t }) });
      setText(""); setFile(null); stick.current = true;
      if (j.message) qc.setQueryData<Page>(key, (o) => ({ ...(o || { messages: [] }), messages: [j.message as TMsg, ...(o?.messages || [])] }));
      void qc.invalidateQueries({ queryKey: key }); void qc.invalidateQueries({ queryKey: ["nomute", "teams", "chats"] });
    } catch (e) { setErr(`못 보냈어 — ${e instanceof Error ? e.message : String(e)} · 글${file ? "·파일" : ""}은 입력칸에 그대로`); }
    finally { setBusy(false); }
  };
  const mine = (m: TMsg) => !!me?.user?.name && m.from === me.user.name;
  const table = usePeopleTable(!!me?.signed_in);
  const chats = useTeamsChats(!!me?.signed_in);
  const chatTitle = (chats.data || []).find((c) => c.id === chat);
  const newest = page.data?.messages?.[0]?.at;   // 새 글 먼저 받음 = 첫 칸이 제일 새 것
  useEffect(() => {   // 이 대화를 보고 있는 동안 = 읽음(목록 마지막 글 때와 받은 첫 글 때 중 늦은 것)
    const at = [newest, chatTitle?.last?.at].filter(Boolean).sort().pop();
    if (!at) return;
    const go = () => { if (!document.hidden) markSeen(chat, at); };
    go(); document.addEventListener("visibilitychange", go);
    return () => document.removeEventListener("visibilitychange", go);
  }, [chat, newest, chatTitle?.last?.at]);
  if (!me?.signed_in) return <div className="nm-tchat"><div className="nm-tchat-empty"><TeamsLogin me={me} err={meQ.error ? (meQ.error as Error).message : ""} /></div></div>;
  return (
    <div className="nm-tchat">
      <div className="nm-tchat-h"><b className="min-w-0 truncate">{chatTitle ? (chatTitle.topic || (chatTitle.members || []).filter((m) => m && m !== me.user?.name).map((m) => titled(m, table)).join(", ") || "(이름 없는 대화)") : "대화"}</b></div>   {/* 「팀즈」 꼬리표 뺌(형 11-06 「(팀즈) 이렇게 뜰 필요는없어 팀즈인건 당연히 아니까」) · 이름 뒤 직급 */}
      {/* 말풍선 = 우리 대화와 같은 부품(.ychat · .ymsg/.ymrow · .yb ai/me · .ytout · .ydate · 입력칸 .ychat-in = yeta-chat.css) · 겉꼴만 — 반응 · 답장 · 움짤 · 결정 · 표지 0 · 얼굴 칸 없이 이름 위(형 11-13 12:43 봄 옮김 「팀즈도, 이 우리 채팅하고 동일하게 구성을 적용할수있나? 채팅창 안에. 그니까 말풍선 이런것만.」 · 뎅) */}
      <div ref={box} className="nm-tchat-b" onScroll={(e) => { const b = e.currentTarget; stick.current = b.scrollHeight - b.scrollTop - b.clientHeight < 40; keepScroll(chat, b); }}>
        <div className="ychat nm-tychat mx-auto mt-auto flex w-full max-w-2xl flex-col gap-[10px] px-3 pb-6 pt-3">
          {nextOf ? <button type="button" className="nm-tmore" disabled={moreBusy} onClick={() => void more()}>{moreBusy ? "받는 중…" : "앞 글 더 보기"}</button> : null}
          {page.isLoading ? <Dots /> : page.error ? <p className="nm-tnote">글을 못 받았어 · {(page.error as Error).message}</p> : null}
          {all.map((m, i) => {
            const ts = m.at ? Date.parse(m.at) : 0, prev = all[i - 1], nx = all[i + 1];
            const pts = prev?.at ? Date.parse(prev.at) : 0, nts = nx?.at ? Date.parse(nx.at) : 0;
            const newDay = !!ts && (!pts || dayKey(pts) !== dayKey(ts)), cont = !newDay && !!prev && prev.from === m.from;
            const noTime = !!nx && !!nts && dayKey(nts) === dayKey(ts) && ((nx.from === m.from && nts - ts < TIME_GAP) || t12(nts) === t12(ts));   // 시각 = 이어 쓴 묶음 마지막 글에만(우리 대화와 같은 셈)
            const time = noTime || !ts ? null : <time className="ytout" dateTime={m.at}>{t12(ts)}</time>;
            const body = (
              <>
                {partsOf(m.html)?.map((x, k) => x.t === "table" ? <TTable key={k} rows={x.rows} /> : <span key={k} className="nm-tpart">{x.s}</span>) ?? (m.text ? <span>{m.text}</span> : null)}
                {(m.hosted || []).map((h) => <img key={h} className="nm-thost" alt="" loading="lazy" src={`/api/office/teams/hosted?chat=${encodeURIComponent(chat)}&msg=${encodeURIComponent(m.id)}&h=${encodeURIComponent(h)}`} />)}
                {(m.files || []).map((f, k) => f.url ? <a key={k} className="nm-tfile" href={`/api/office/teams/file?u=${encodeURIComponent(f.url)}`} target="_blank" rel="noopener">📎 {f.name || "파일"}</a> : null)}
              </>
            );
            return (
              <Fragment key={m.id}>
                {newDay ? <p className="ydate">{dateLabel(ts)}</p> : null}
                {mine(m) ? (
                  <div className="flex flex-col items-end"><div className={`ymrow me${cont ? " cont" : ""}`}><div className="ybw"><div className="yb me">{body}</div>{time}</div></div></div>
                ) : (
                  <div className={`ymsg nm-tnoface${cont ? " cont" : ""}`}><div className="ycol"><div className="yname">{titled(m.from, table) || "?"}</div><div className="ybrow"><div className="ybw"><div className="yb ai">{body}</div>{time}</div></div></div></div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
      <div className="ychat ychat-in mx-auto w-full max-w-2xl shrink-0 px-3 pb-[var(--duet-tab-space,16px)]">
        {err ? <p role="alert" className="nm-terr pb-2" onClick={() => setErr("")}>{err}</p> : null}
        {file ? <p className="nm-tpick"><span className="min-w-0 truncate">📎 {file.name}</span><small>{file.size >= 1048576 ? `${(file.size / 1048576).toFixed(1)}MB` : `${Math.max(1, Math.round(file.size / 1024))}KB`}</small><button type="button" aria-label="붙인 파일 빼기" disabled={busy} onClick={() => setFile(null)}>×</button></p> : null}
        <form className="nm-tform flex items-end gap-1" onSubmit={(e) => { e.preventDefault(); void send(); }}>
          <input ref={pick} type="file" hidden onChange={(e) => { const f = e.target.files?.[0] || null; e.target.value = ""; if (f && f.size > 25 * 1024 * 1024) { setErr("25MB 넘는 파일은 여기서 못 보내"); return; } if (f) { setFile(f); setErr(""); } }} />
          <button type="button" className="nm-tplus2" aria-label="파일 붙이기" title="파일 붙이기" disabled={busy} onClick={() => pick.current?.click()}><DuetIcon name="plus" size={20} stroke={2} /></button>
          <textarea value={text} rows={1} placeholder={file ? "같이 보낼 말(없어도 됨)" : "팀즈로 보내기"} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} />
          <button type="submit" aria-label={file ? "파일 보내기" : "보내기"} disabled={busy || (!text.trim() && !file)}>{busy && file ? "…" : <DuetIcon name="arrowUp" size={20} stroke={2.4} />}</button>
        </form>
      </div>
    </div>
  );
}

/** 설정 「팀즈」 줄 몸 — 로그인한 이름 + 로그아웃(목록 머리 줄에서 옮김 · 형 11-13 10:23) */
export function TeamsAccount() {
  const qc = useQueryClient(), meQ = useTeamsMe(false), me = meQ.data;
  const [busy, setBusy] = useState(false);
  const logout = async () => { setBusy(true); try { await office("teams/logout", { method: "POST", body: "{}" }); } catch { /* 그대로 */ } finally { setBusy(false); } void qc.invalidateQueries({ queryKey: meKey }); };
  if (!me) return <Dots />;
  if (!me.signed_in) return <p className="nm-tnote">로그인 안 됨 · 팀즈 탭에서 로그인</p>;
  return (
    <div className="nm-tacct"><span className="min-w-0 truncate">{me.user?.name || me.user?.upn || "팀즈"}</span><button type="button" disabled={busy} onClick={() => void logout()}>{busy ? "…" : "로그아웃"}</button></div>
  );
}
/** 설정 줄 오른쪽 값 = 로그인한 이름(없으면 「로그인 안 됨」) */
export function useTeamsName() { const me = useTeamsMe(false).data; return !me ? undefined : me.signed_in ? me.user?.name || me.user?.upn || "로그인됨" : "로그인 안 됨"; }

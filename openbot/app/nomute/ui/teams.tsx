// 팀즈 모드(형 11-06 봄 창 「팀즈도 버튼눌러서 여기에서 가능해? 전환해서 내가 연결붙이면」 · 「팀즈 를 누르면 팀즈모드로 전환되는 느낌이랄까」 ·
//   「팀즈 창 수집이라기보다는 팀즈를 이 사무실 안에서 할수잇는거야」 · 「전송이랑 다 가능해야해 채팅」 · 「파일확인 등」)
//   = 대화 목록 맨 위 「사무실 | 팀즈」 바꿈 · 팀즈 = 목록(teams/chats) · 방(teams/messages · 새 글 먼저 30 · 더 앞 = next) · 보내기(teams/send) · 파일(teams/file) · 글 안 그림(teams/hosted)
//   서버 = 윈터 _teams.js(wa/teams-graph) · 로그인 = 기기 코드(POST teams/login → 코드 크게 + microsoft.com/devicelogin · 기다리는 동안 GET teams 5초마다 = 서버가 마저 받음)
//   방 주소 = /channels/teams:<chat id>(대화 판은 OfficeChat 이 이 앞머리를 보고 TeamsChat 으로)
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
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

type Me = { configured?: boolean; signed_in?: boolean; user?: { id?: string; name?: string; upn?: string }; pending?: { user_code?: string; verification_uri?: string; expires_at?: number | string } | null };
type Person = { id: string; name?: string };
type Chat = { id: string; type?: string; topic?: string; members?: string[]; people?: Person[]; last?: { from?: string; from_id?: string; text?: string; at?: string } };
type TMsg = { id: string; from?: string; from_id?: string; at?: string; text?: string; html?: string; files?: { name?: string; url?: string }[]; hosted?: string[] };
type Page = { messages: TMsg[]; next?: string };

const meKey = ["nomute", "teams", "me"] as const;

/* 사람 얼굴·접속 불(형 11-06 번개 창 「팀즈 프로필 받아오기가능한가」 · 「더 받아와야해 팀즈처럼 써야하니까」)
   · 얼굴 = 서버 teams/photo?u=<사람 id>(사진 없음 404 = 이름 첫 글자 동그라미 그대로) · 불 = teams/presence?ids=…(1분마다 · 보일 때만)
   · 사람 id 가 없는 글(봇·앱·옛 서버 판) = 첫 글자 동그라미 */
/* 사람 표(형 11-06 번개 창 「박민주 단장님 이거 넣어드려라 ㅠㅠ」 · 「그리고 뒤에 직급 다 붙일수잇어? 내가 직급알려줄게」) — 서버 teams/people {이름: {title, face}}
   · title = 이름 뒤에 붙는 직급(「박민주 단장」) · face = 우리가 넣어 준 얼굴(teams/face?n=이름 · 팀즈 사진보다 먼저) · 이 화면에서만 보임(팀즈 원본은 안 바뀜) */
type PeopleTable = Record<string, { title?: string; face?: boolean; v?: number }>;
function usePeopleTable(on: boolean): PeopleTable {
  return useQuery({ queryKey: ["nomute", "teams", "people"], queryFn: () => office<{ people?: PeopleTable }>("teams/people").then((j) => j.people || {}), enabled: on, staleTime: 5 * 60_000, retry: false }).data || {};
}
const titled = (name: string | undefined, t: PeopleTable) => (name && t[name]?.title ? `${name} ${t[name].title}` : name || "");
const faceOf = (name: string | undefined, t: PeopleTable) => (name && t[name]?.face ? `/api/office/teams/face?n=${encodeURIComponent(name)}&v=${t[name].v || 0}` : "");
const DOT: Record<string, string> = { Available: "on", AvailableIdle: "on", Busy: "busy", BusyIdle: "busy", DoNotDisturb: "busy", Away: "away", BeRightBack: "away" };
function usePresence(ids: string[]) {
  const key = [...new Set(ids.filter(Boolean))].sort().slice(0, 100);
  return useQuery({ queryKey: ["nomute", "teams", "presence", key.join(",")], queryFn: () => office<{ presence?: Record<string, string> }>(`teams/presence?ids=${key.join(",")}`).then((j) => j.presence || {}),
    enabled: key.length > 0, refetchInterval: () => (document.hidden ? false : 60_000), staleTime: 30_000, retry: false }).data || {};
}
/* 얼굴 없는 사람 = 기본 프로필(사람 꼴) · 모임 대화 = 여럿 꼴(형 11-06 번개 창 「얼굴 없는사람들 은 그냥 기본 프로필로 넣어줄수있어? 단체는 단체 픽토그램 느낌이랄까.」) — 이름 첫 글자 동그라미를 갈음 */
const ICO_ONE = <svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="9" r="4" /><path d="M4 20.5c0-4.4 3.6-7 8-7s8 2.6 8 7z" /></svg>;
const ICO_MANY = <svg viewBox="0 0 24 24" aria-hidden><circle cx="9" cy="9.2" r="3.3" /><path d="M2.4 20c0-3.8 2.9-6 6.6-6s6.6 2.2 6.6 6z" /><circle cx="17" cy="8.4" r="2.6" /><path d="M16.9 13c3 0 5.2 1.7 5.2 4.6v1.2h-4.7c-.2-2.2-1.3-3.9-3-4.9.8-.6 1.6-.9 2.5-.9z" /></svg>;
function TFace({ id, name, state, small, group, own }: { id?: string; name?: string; state?: string; small?: boolean; group?: boolean; own?: string }) {
  const [bad, setBad] = useState(false), [bad2, setBad2] = useState(false);
  const dot = state ? DOT[state] : undefined;
  return (
    <i className={`nm-tava${small ? " sm" : ""}${(id && !bad) || (own && !bad2) ? "" : " ico"}`} title={name || undefined} aria-hidden>   {/* ico = 사진 없음 = 바탕 투명 · 선만(형 11-06 20:15) */}
      {/* 차례 = 팀즈 사진 → 없으면 우리가 넣어 준 얼굴(형 그림 · 그룹웨어 사진) → 없으면 기본 꼴(형 11-06 「그룹웨어 … 프로필사진 연결해줘, 프사없는사람들」) */}
      {id && !bad ? <img alt="" loading="lazy" src={`/api/office/teams/photo?u=${encodeURIComponent(id)}&s=${small ? 48 : 96}`} onError={() => setBad(true)} /> : own && !bad2 ? <img alt="" loading="lazy" src={own} onError={() => setBad2(true)} /> : group ? ICO_MANY : ICO_ONE}
      {dot ? <span className={`nm-tdot ${dot}`} /> : null}
    </i>
  );
}
/** 1:1 대화의 상대(나 말고 한 사람) — 여럿이면 없음(모임 대화 = 첫 글자 동그라미) */
const other = (c: Chat, me?: Me["user"]) => { const l = (c.people || []).filter((x) => x.id && x.id !== me?.id && x.name !== me?.name); return c.type === "oneOnOne" && l.length === 1 ? l[0] : undefined; };
function useTeamsMe(fast: boolean) {
  return useQuery({ queryKey: meKey, queryFn: () => office<Me>("teams"), refetchInterval: fast ? 5_000 : 60_000, staleTime: 4_000, retry: false });
}
const chatName = (c: Chat, me?: string) => c.topic || (c.members || []).filter((m) => m && m !== me).join(", ") || "(이름 없는 대화)";
const ago = (at?: string) => { const t = at ? Date.parse(at) : NaN; if (!Number.isFinite(t)) return ""; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? "방금" : m < 60 ? `${m}분` : m < 1440 ? t12(t) : new Date(t).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }); };

/** 「사무실 | 팀즈」 바꿈(대화 목록 맨 위) */
export function TeamsSwitch() {
  const on = useTeamsMode();
  return (
    <div className="nm-tswitch" role="tablist" aria-label="대화 판 바꾸기">
      <button type="button" role="tab" aria-selected={!on} onClick={() => setTeamsMode(false)}>사무실</button>
      <button type="button" role="tab" aria-selected={on} onClick={() => setTeamsMode(true)}>팀즈</button>
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
  if (!me) return <div className="nm-tlogin"><p>팀즈 불러오는 중…</p></div>;
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
  const chats = useQuery({ queryKey: ["nomute", "teams", "chats"], queryFn: () => office<{ chats?: Chat[] }>("teams/chats").then((j) => j.chats || []), enabled: signed, refetchInterval: 30_000, staleTime: 10_000, retry: false });
  const pres = usePresence((chats.data || []).map((c) => other(c, me?.user)?.id || ""));
  const table = usePeopleTable(signed);
  const rowName = (c: Chat) => { const o = other(c, me?.user); return c.topic ? c.topic : o ? titled(o.name, table) : (c.members || []).filter((m) => m && m !== me?.user?.name).map((m) => titled(m, table)).join(", ") || "(이름 없는 대화)"; };
  const err = meQ.error ? (meQ.error as Error).message : "";
  const logout = async () => { try { await office("teams/logout", { method: "POST", body: "{}" }); } catch { /* 그대로 */ } void qc.invalidateQueries({ queryKey: meKey }); };
  return (
    <div className="nm-tlist">
      {!signed ? <TeamsLogin me={me} err={err} /> : (
        <>
          <div className="nm-tme"><span className="min-w-0 truncate">{me?.user?.name || me?.user?.upn || "팀즈"}</span><button type="button" onClick={() => void logout()}>로그아웃</button></div>
          {chats.isLoading ? <p className="nm-tnote">대화 받는 중…</p> : chats.error ? <p className="nm-tnote">대화를 못 받았어 · {(chats.error as Error).message}</p> : !chats.data?.length ? <p className="nm-tnote">대화가 없어</p> : (
            <ul>
              {chats.data.map((c) => (
                <li key={c.id}>
                  <button type="button" className={current === TEAMS_PREFIX + c.id ? "on" : undefined} onClick={() => void nav({ to: href(c.id) })}>
                    <TFace group={c.type !== "oneOnOne"} id={other(c, me?.user)?.id} own={faceOf(other(c, me?.user)?.name, table)} name={chatName(c, me?.user?.name)} state={pres[other(c, me?.user)?.id || ""]} />
                    <span className="min-w-0 flex-1"><b className="block truncate">{rowName(c)}</b><small className="block truncate">{c.last?.from ? `${c.last.from} · ` : ""}{c.last?.text || ""}</small></span>
                    <em>{ago(c.last?.at)}</em>
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
  const box = useRef<HTMLDivElement>(null), stick = useRef(true);
  useEffect(() => { const b = box.current; if (b && stick.current) b.scrollTop = b.scrollHeight; }, [all.length]);
  const more = async () => {
    if (!nextOf || moreBusy) return;
    setMoreBusy(true); stick.current = false;
    try { const j = await office<Page>(`teams/messages?chat=${encodeURIComponent(chat)}&next=${encodeURIComponent(nextOf)}`); setOlder((o) => [...o, ...(j.messages || [])]); setNext(j.next || ""); }
    finally { setMoreBusy(false); }
  };
  const [text, setText] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const send = async () => {
    const t = text.trim(); if (!t || busy) return;
    if (t.length > 4000) { setErr("4,000자 넘음 — 나눠서 보내 줘"); return; }
    setBusy(true); setErr("");
    try {
      const j = await office<{ message?: TMsg }>("teams/send", { method: "POST", body: JSON.stringify({ chat, text: t }) });
      setText(""); stick.current = true;
      if (j.message) qc.setQueryData<Page>(key, (o) => ({ ...(o || { messages: [] }), messages: [j.message as TMsg, ...(o?.messages || [])] }));
      void qc.invalidateQueries({ queryKey: key }); void qc.invalidateQueries({ queryKey: ["nomute", "teams", "chats"] });
    } catch (e) { setErr(`못 보냈어 — ${e instanceof Error ? e.message : String(e)} · 글은 입력칸에 그대로`); }
    finally { setBusy(false); }
  };
  const mine = (m: TMsg) => !!me?.user?.name && m.from === me.user.name;
  const table = usePeopleTable(!!me?.signed_in);
  const chats = useQuery({ queryKey: ["nomute", "teams", "chats"], queryFn: () => office<{ chats?: Chat[] }>("teams/chats").then((j) => j.chats || []), enabled: !!me?.signed_in, staleTime: 30_000, retry: false });
  const chatTitle = (chats.data || []).find((c) => c.id === chat);
  if (!me?.signed_in) return <div className="nm-tchat"><div className="nm-tchat-empty"><TeamsLogin me={me} err={meQ.error ? (meQ.error as Error).message : ""} /></div></div>;
  return (
    <div className="nm-tchat">
      <div className="nm-tchat-h"><b className="min-w-0 truncate">{chatTitle ? (chatTitle.topic || (chatTitle.members || []).filter((m) => m && m !== me.user?.name).map((m) => titled(m, table)).join(", ") || "(이름 없는 대화)") : "대화"}</b></div>   {/* 「팀즈」 꼬리표 뺌(형 11-06 「(팀즈) 이렇게 뜰 필요는없어 팀즈인건 당연히 아니까」) · 이름 뒤 직급 */}
      <div ref={box} className="nm-tchat-b" onScroll={(e) => { const b = e.currentTarget; stick.current = b.scrollHeight - b.scrollTop - b.clientHeight < 40; }}>
        {nextOf ? <button type="button" className="nm-tmore" disabled={moreBusy} onClick={() => void more()}>{moreBusy ? "받는 중…" : "앞 글 더 보기"}</button> : null}
        {page.isLoading ? <p className="nm-tnote">글 받는 중…</p> : page.error ? <p className="nm-tnote">글을 못 받았어 · {(page.error as Error).message}</p> : null}
        {all.map((m) => (
          <div key={m.id} className={`nm-tm${mine(m) ? " me" : ""}`}>
            {mine(m) ? null : <b className="nm-tm-who"><TFace small id={m.from_id} own={faceOf(m.from, table)} name={m.from} />{titled(m.from, table) || "?"}</b>}
            <div className="nm-tm-b">
              {m.text ? <p>{m.text}</p> : null}
              {(m.hosted || []).map((h) => <img key={h} alt="" loading="lazy" src={`/api/office/teams/hosted?chat=${encodeURIComponent(chat)}&msg=${encodeURIComponent(m.id)}&h=${encodeURIComponent(h)}`} />)}
              {(m.files || []).map((f, i) => f.url ? <a key={i} className="nm-tfile" href={`/api/office/teams/file?u=${encodeURIComponent(f.url)}`} target="_blank" rel="noopener">📎 {f.name || "파일"}</a> : null)}
            </div>
            <time className="nm-tm-t">{m.at ? t12(Date.parse(m.at)) : ""}</time>
          </div>
        ))}
      </div>
      <div className="nm-tin">
        {err ? <p role="alert" className="nm-terr" onClick={() => setErr("")}>{err}</p> : null}
        <div className="nm-tin-row">
          <textarea value={text} rows={1} placeholder="팀즈로 보내기" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} />
          <button type="button" aria-label="보내기" disabled={busy || !text.trim()} onClick={() => void send()}>↑</button>
        </div>
      </div>
    </div>
  );
}

// 우리 대화창 — 원본 부품(말풍선·글 줄·입력칸·마크다운) 그대로 쓰고, 형 대화창 규칙·옛 화면 기능은 우리 것(옛 = viewer/office.html)
//   형 보기(형 10-27 16:33·21:16) = 형 글 + 형에게 온 글만 펼침 · 봇끼리·클로드 글 = 그 자리 한 줄 「(얼굴 셋) 외 N · 메시지 M개」(형 10-28 05:12)
//   말풍선 = YETA 꼴(./yeta-chat.css · 형 10-28 10:19) · 말풍선 위 읽음 얼굴 0 · 러너 깸 줄 안 보임 · 시스템 일 = 가운데 흐린 알약
//   시간 = 말풍선 밖 오른쪽 아래 모서리 바로 아래 작게(형 10-28 15:36 「시간을 대화상자의 우하단으로 … 최대한 대화를 길게」 · 16:5x 「위치는 좋고, 바깥에 위치」 = 말풍선은 말만 감쌈 · 말풍선 폭 늘림)
//   가져감 = 카톡 「1」 자리에 「가져감」 글자 하나(1:1 방 형 글만 · 형 10:20) · 그 밖 이름 줄 0
//   이름 = 같은 사람 글이 이어지면 첫 글만(YETA .cont) · 날짜가 바뀌는 곳 = 가는 줄 + 「10-28 수」(형 10:23)
//   줄기 = ⏳·✅ 상태 답(reply_to)은 원 글 바로 아래 · 답장 = 글 첫 줄 「↩ 이름: 그 글 첫 줄」(서버 0 · 옛 화면과 같은 꼴) · 반응 · 파일 · 긴 글 = 접기 0(형 15:33 「더보기 말고 줄글 풀로 다 나오게」)
//   열기(형 15:33 「대화창 열면 … 글쓰기로 되어서. 그러지 않게」 · 「가장 최근거부터 … 위에 토글 하나하면 올라갈 수 있게」 · 장부 office-chat-read.md) =
//     글칸 저절로 커서 0(자판 안 올라옴 · 누를 때만) · 맨 아래(가장 최근 글)에서 시작 · 화면 위로 시작이 넘어간 글이 있으면 위에 「↑ 글 처음」 단추 하나(누르면 그 글 시작)
//   빠르게 열기(형 15:34 「프사먼저 나오고 넘 늦게 대화가 나와」 · 15:38 「캐시화 하고 뒤늦게 받아오는거로 동기화를」) = 이 기기 저장(data/room-cache.ts)을 먼저 그림 →
//     since 로 새 글만 · 저장이 없으면 최근 한 화면치(FIRST_N) · 위로 올리면 하루치씩(서버 day=1 · 한 화면 이상)
//   동기화 = 열린 방은 기다리기(wait 25초 · 옛 화면과 같은 길) · 그 밖은 pulse(data/sync.ts)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ComponentProps, Fragment, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { markReadLocal } from "../data/read-local";   // 연 방 = 이 기기 안 바로 「봤음」(형 10-30 15:4x 목록 「1」 늦게 지워짐)
import { Streamdown } from "streamdown";
import { Composer, toAgentOptions } from "@/components/channels/composer";
import { useReportChatPresence } from "@/components/shell/chat-presence";
import { markdownComponents } from "@/lib/markdown";
import { type OfficeMsg, type OfficePerson, type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { listGet, listPut, loadRoom, saveRoom } from "../data/room-cache";
import { dropAttachments, peekAttachments } from "../shim/attachments";
import "./chat-font";   // 대화 글꼴(--app-font · YETA 설정 그대로 · 앱 열 때 한 번 적용)
import { FaceImg, FaceStack } from "./faces";
import { ProfileCard } from "./profile-card";   // 프사 누름 = 프로필 카드(형 10-30 19:4x)
import { usePinActions } from "./pins";
import { REPAIR_ROOM, RepairDesk } from "./repair-desk";   // 수리 접수 방 = 접수 창구(대화 말풍선 0 · 형 10-28 22:28)   // 글 동작 줄 「고정」(보조 01 · 장부 office-pin.md 「바뀜」 17:1x)
import { t12 } from "./when";
import "./yeta-chat.css";

const enc = encodeURIComponent;
/** 쓰던 글 = 방마다 이 탭 안에 바로 적어 둠(sessionStorage) → 새 판으로 다시 읽혀도 글칸에 되살림(뒤에 숨어 얼어 있던 탭은 서비스 워커에 「글 있음」을 못 알려 · 10-28 11:21 실측) */
const DRAFT = (room: string) => `nm-draft:${room}`;
const loadDraft = (room: string) => { try { return sessionStorage.getItem(DRAFT(room)) || ""; } catch { return ""; } };
const saveDraft = (room: string, t: string) => { try { if (t.trim()) sessionStorage.setItem(DRAFT(room), t); else sessionStorage.removeItem(DRAFT(room)); } catch { /* 이 탭만 · 못 쓰면 이번만 */ } };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const CALL_FRESH = 45 * 60e3;   // 회의실 「작업 중」 = 부른 글이 45분 안일 때만(옛 화면 PR 1478 실측 · 답의 90% = 41분)
const QUOTE = /^↩ ([^:\n]{1,24}): ([^\n]*)(?:\n|$)/;
const EMO = /^\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier}|‍\p{Extended_Pictographic})*$/u;
const IMG_RE = /\.(png|jpe?g|gif|webp|avif)$/i;
const WINTER_WHO = "윈터 PM";
const WORK = ["고민하는 중", "정리하는 중", "처리하는 중"];
const URL_RE = /(https?:\/\/[^\s<>"'「」()]+[^\s<>"'「」().,;:!?])/g;   // 글 속 주소(형 글 = 꾸밈 없는 글 · 봇 글은 Streamdown 이 링크로)
const RECENT_N = 40;   // 다시 받기 = 최근 40 글을 통째로(거울이 반응·글을 같은 글에 고쳐 씀 = since 로는 못 받음 · 맞물림 21:3x)
const FIRST_N = 100, DAY_MIN = 15, AUTO_MAX = 8;   // 저장 없이 처음 = 최근 100(봇끼리 글은 한 줄로 접혀 40 이면 형 글이 안 들어와 위로 하루치를 한 번 더 기다렸음 · PM 17:20 · 서버 = 같은 한 장 한 번) · 위로 올림 = 하루치(그날 글이 적으면 이만큼 될 때까지 앞날도) · 화면 채우기 저절로 받기 상한
const HEAD = 92;   // 위에 떠 있는 머리(대화 상대 동그라미 + 이름 · ui/shell.css .nm-head) 높이 — 그 아래부터 「보이는 위」

const hyungApp = (m: { mirror_by?: string; who?: string }) => m.mirror_by === "형" || String(m.who || "").startsWith("형(앱");   // 형이 그록봇 앱에서 친 글(서버 mirror_by · 형 10-30 「검정 말풍선 흰 글씨」)
type Msg = OfficeMsg & { mirror_by?: string; alias?: Record<string, string[]>; evidence?: { target?: string; result?: string; checked_at?: string }; proof?: boolean; file_meta?: { path: string; name?: string; bytes?: number }[]; _thr?: boolean;
  //   거울 칸(보조 03 · mirror-all.md 맞물림 21:3x · 없으면 지금처럼): 그록 방 agentId · 앱 「컴퓨터 · 조치 필요」 카드 · 앱 반응(바뀌면 같은 글이 고쳐짐)
  app_agent?: string; box?: { request_id?: string; instruction?: string; spend_request_id?: string }; app_reactions?: { emoji: string; who: string }[] };
type Page = { messages: Msg[]; more: boolean };
type Draft = { who: string; ts: number; text: string };   // 쓰는 중 초안(그 방에서 지금 자라는 답 · 서버 _watch.js · 거울 = 그록봇 앱 방 streaming 줄)
type Reads = { got?: Record<string, string[]>; got_at?: Record<string, Record<string, number>> };
type Bot = { who: string; state: string; why?: string };

export const officeKeys = {
  people: ["nomute", "people"] as const,
  rooms: ["nomute", "rooms"] as const,
  msgs: (room: string) => ["nomute", "msgs", room] as const,
  reads: (room: string) => ["nomute", "reads", room] as const,
  reacts: (room: string) => ["nomute", "reacts", room] as const,
  bots: ["nomute", "bots"] as const,
};

const merge = (old: Page | undefined, add: Msg[]): Page => {
  const m = new Map((old?.messages || []).map((x) => [x.id, x]));
  for (const x of add) m.set(x.id, x);
  return { messages: [...m.values()].sort((a, b) => a.ts - b.ts), more: old?.more ?? false };
};

const kst = (ts: number) => new Date(ts + 9 * 3600e3);
const dayKey = (ts: number) => kst(ts).toISOString().slice(0, 10);
const dateLabel = (ts: number) => `${dayKey(ts).slice(5)} ${"일월화수목금토"[kst(ts).getUTCDay()]}`;   // 「10-28 수」(요일 = 실제)
const fileName = (p: string) => String(p).split("/").pop()?.replace(/^\d{8}_\d{4}_/, "") || p;
const fileUrl = (p: string, dl = false) => `/api/office/file?${new URLSearchParams({ path: p, ...(dl ? { dl: "1" } : {}) })}`;
const size = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)}MB` : `${Math.max(1, Math.round(b / 1e3))}KB`);
const firstLine = (m: Msg) => {   // 답장 인용·복사 한 줄(인용 줄 빼고 · @·! 빼서 다시 부르지 않게 · 40자)
  const t = m.files?.length ? `파일 ${[...new Set(m.files.map(fileName))].join(", ")}` : String(m.text || "").replace(QUOTE, "");
  const l = (t.split("\n").find((x) => x.trim()) || "").replace(/[@!](?=\S)/g, "").replace(/\s+/g, " ").trim();
  return l.length > 40 ? `${l.slice(0, 40)}…` : l;
};
export function useOfficeRoom(room: string) {
  const qc = useQueryClient();
  // 방 목록·사람표 = 이 기기에 둔 것으로 먼저 채움(누구와의 방인지 바로 앎 · 다른 화면이 같은 것을 먼저 받기 시작했어도 · 낡음 = 바로 새로 받음) → 받을 때마다 둠
  useLayoutEffect(() => {
    for (const [k, key] of [["rooms", officeKeys.rooms], ["people", officeKeys.people]] as const) {
      if (qc.getQueryData(key) === undefined) { const v = listGet<unknown[]>(k); if (v?.length) qc.setQueryData(key, v, { updatedAt: 0 }); }
    }
  }, [qc]);
  const roomsQ = useQuery({ queryKey: officeKeys.rooms, queryFn: () => office<{ rooms: OfficeRoom[] }>("rooms").then((j) => j.rooms || []), staleTime: 15_000 });
  const peopleQ = useQuery({ queryKey: officeKeys.people, queryFn: () => people(), staleTime: 60_000 });
  useEffect(() => { if (roomsQ.data?.length) listPut("rooms", roomsQ.data); }, [roomsQ.data]);
  useEffect(() => { if (peopleQ.data?.length) listPut("people", peopleQ.data); }, [peopleQ.data]);
  const msgsQ = useQuery({
    queryKey: officeKeys.msgs(room),
    queryFn: async () => {   // 받아 둔 글(이 탭 → 이 기기 저장 · 먼저 그림) 뒤 새 글만(since) · 받아 둔 게 없거나 사이가 비면(since 가 100 넘음) 최근 한 화면치
      const key = officeKeys.msgs(room);
      let old = qc.getQueryData<Page>(key);
      if (!old?.messages.length) {
        const c = await loadRoom<Msg>(room);
        if (c?.messages.length && !qc.getQueryData<Page>(key)?.messages.length) { old = { messages: c.messages, more: c.more }; qc.setQueryData<Page>(key, old); }
      }
      const last = old?.messages.at(-1)?.ts;
      if (old && last) {
        const r = await office<Page>(`rooms/${enc(room)}/messages?n=${RECENT_N}`);   // 최근 40 통째 = 새 글 + 거울이 고친 글(반응·카드)을 같이
        if ((r.messages?.[0]?.ts ?? Infinity) <= last || !r.more) return merge(qc.getQueryData<Page>(key) || old, r.messages || []);   // 사이 빔 없음
        const j = await office<Page>(`rooms/${enc(room)}/messages?since=${last}&n=100`);
        if (!j.more) return merge(qc.getQueryData<Page>(key) || old, j.messages || []);   // 기다리기 고리가 그새 붙인 글도 지킴
      }
      const j = await office<Page>(`rooms/${enc(room)}/messages?n=${FIRST_N}`);
      return { messages: merge(undefined, j.messages || []).messages, more: !!j.more };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  useEffect(() => {   // 받은 글 = 이 기기에 둠(다음에 열면 바로 그림 · 잦은 붙임은 묶어서)
    const d = msgsQ.data;
    if (!d?.messages.length) return;
    const t = setTimeout(() => void saveRoom(room, d), 400);
    return () => clearTimeout(t);
  }, [room, msgsQ.data]);
  const readsQ = useQuery({ queryKey: officeKeys.reads(room), queryFn: () => office<Reads>(`rooms/${enc(room)}/reads`), staleTime: 15_000, refetchInterval: 60_000 });
  const reactsQ = useQuery({ queryKey: officeKeys.reacts(room), queryFn: () => office<{ reactions: Record<string, Record<string, string[]>>; quick?: string[] }>(`rooms/${enc(room)}/reactions`), staleTime: 15_000, refetchInterval: 60_000 });
  const botsQ = useQuery({ queryKey: officeKeys.bots, queryFn: () => office<{ bots: Bot[] }>("bots").then((j) => j.bots || []), staleTime: 15_000, refetchInterval: 60_000 });

  const [draft, setDraftS] = useState<Draft | null>(null), draftRef = useRef<Draft | null>(null);
  const setDraft = (d: Draft | null) => { draftRef.current = d; setDraftS(d); };
  useEffect(() => { setDraft(null); }, [room]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {   // 기다리기 고리 = YETA watch 꼴(형 10-28 17:34 「거기걸 가지고 와서 여기에」 · 서버 _watch.js = 1초마다 방 머리·초안 표식만 봄 → 새 글·쓰는 중 초안이 오면 바로) · 탭이 숨으면 쉼 · watch 가 없는 서버 = 옛 wait
    let stop = false, de = "", old = false;
    let ctl: AbortController | null = null;
    (async () => {
      while (!stop) {
        const cur = qc.getQueryData<Page>(officeKeys.msgs(room));
        if (document.hidden || !cur) { await sleep(1500); continue; }
        ctl = new AbortController();
        try {
          const after = cur.messages.at(-1)?.ts ?? 0;
          const j = await office<Page & { detag?: string; draft?: Draft | null }>(old ? `rooms/${enc(room)}/wait?after=${after}&max_s=25` : `rooms/${enc(room)}/watch?after=${after}&de=${encodeURIComponent(de)}&max_s=15`, { signal: ctl.signal });
          if (stop) break;
          if (typeof j.detag === "string") de = j.detag;
          if (j.draft !== undefined) setDraft(j.draft);
          if (j.messages?.length) {
            const d = draftRef.current;
            if (d && j.messages.some((m) => m.who === d.who && m.ts >= d.ts - 2000)) setDraft(null);   // 끝난 답이 올라옴 = 그 쓴 이의 초안 지움
            qc.setQueryData<Page>(officeKeys.msgs(room), (old) => merge(old, j.messages));
            for (const k of [officeKeys.reads(room), officeKeys.rooms, officeKeys.bots, ["channels"], ["duet-channels"]]) void qc.invalidateQueries({ queryKey: k });
          }
        } catch (e) {
          if (!stop && !old && e instanceof Error && e.message.includes("없는 길")) { old = true; continue; }   // 서버에 watch 가 아직 없음 = 옛 wait
          if (!stop) await sleep(3000);
        }
      }
    })();
    return () => { stop = true; ctl?.abort(); };
  }, [room, qc]);   // eslint-disable-line react-hooks/exhaustive-deps

  const older = async () => {   // 앞 글 = 하루치(서버 day=1 · 그날이 비면 글 나올 때까지 앞날 · DAY_MIN 넘을 때까지)
    const cur = qc.getQueryData<Page>(officeKeys.msgs(room));
    const first = cur?.messages[0]?.ts;
    if (!first) return 0;
    const j = await office<Page>(`rooms/${enc(room)}/messages?before=${first}&day=1&n=${DAY_MIN}`);
    qc.setQueryData<Page>(officeKeys.msgs(room), (old) => ({ ...merge(old, j.messages || []), more: !!j.more }));
    return (j.messages || []).length;   // 받은 앞 글 수(0 = 저절로 받기 그만)
  };
  const r = roomsQ.data?.find((x) => x.id === room);
  return { r, list: peopleQ.data || [], msgs: msgsQ, reads: readsQ.data, reacts: reactsQ.data, bots: botsQ.data || [], older, draft };
}

type Item = { t: "msg"; m: Msg } | { t: "sys"; msgs: Msg[] } | { t: "band"; msgs: Msg[] };
const MEET = "all";   // 회의실(서버 ROOMS id · 형 10-28 22:02 「회의실은 대화가 안접혀도 될거같아 그냥 최신순으로 … 내가 안본거부터 위로 보기 그 버튼만」)
const wakeM = (m: Msg) => m.kind === "system" && /러너/.test(m.who) && /^깸:/.test(m.text || "");

/** 회의실 보기 = 접기 0 · 묶음 0 · 줄기 0 — 받은 순서 그대로 한 줄씩(러너 깸 줄만 뺌 · 시스템 일 = 그 자리 흐린 알약 하나) */
function flatView(list: Msg[]): Item[] {
  return list.filter((m) => !wakeM(m)).map((m): Item => (m.kind === "system" && !hyungApp(m) ? { t: "sys", msgs: [m] } : { t: "msg", m }));
}

/** 줄기(상태 답을 원 글 아래) + 형 보기 묶음(옛 office.html 23차 규칙 그대로) */
function hyungView(list: Msg[], r: OfficeRoom | undefined): Item[] {
  const ids = new Set(list.map((m) => m.id)), kids = new Map<string, Msg[]>();
  const hung = (m: Msg) => !!(m.reply_to && m.state && ids.has(m.reply_to));
  for (const m of list) if (hung(m)) kids.set(m.reply_to as string, [...(kids.get(m.reply_to as string) || []), m]);
  const all: Msg[] = [];
  for (const m of list) { if (hung(m)) continue; all.push(m); for (const k of kids.get(m.id) || []) all.push({ ...k, _thr: true }); }
  const meIds = new Set(all.filter((m) => m.kind === "human").map((m) => m.id));
  const toMe = (m: Msg) => meIds.has(m.reply_to || "") || meIds.has(m.origin || "") || (m.mention || []).includes("형");
  // 1:1 방 주인 글이라도 남만 부른 글(「@빚 …」)은 형 없는 대화 = 묶음으로(형 10-30 18:4x 「이렇게 내가 없는 대화 안보이면 댐」)
  const toOthers = (m: Msg) => { const n = [...(m.mention || []), ...(m.urgent || [])]; return n.length > 0 && !n.includes("형"); };
  // 1:1 방 주인이 형 아닌 이에게 한 답(답표 없음 · 바로 앞 다른 이 글이 형 아니고 30분 안) = 형이 안 낀 대화 → 양쪽 다 묶음
  //   (형 10-30 19:2x 「이렇게 내가 하는대화 아니면 가려지고 클릭 시 보이먄 돼」 · 솔 방: 봄 「!솔」 → 솔 답이 그대로 보였음)
  const answersOther = new Set<string>();
  if (r?.with) {
    let prev: Msg | null = null;
    for (const m of all) {
      if (wakeM(m) || (m.kind === "system" && !hyungApp(m))) continue;
      if (m.who !== r.with) { prev = m; continue; }
      if (prev && prev.kind !== "human" && !hyungApp(prev) && m.ts - prev.ts < 30 * 60e3) answersOther.add(m.id);
    }
  }
  const showM = (m: Msg) => r?.id === "notice" || m.kind === "human" || hyungApp(m) || toMe(m) || m.state === "decide" || (!!r?.with && m.who === r.with && !m.reply_to && !m.origin && !toOthers(m) && !answersOther.has(m.id));
  const sysM = (m: Msg) => m.kind === "system" && !hyungApp(m);
  const out: Item[] = [];
  for (let i = 0; i < all.length; i++) {
    const m = all[i];
    if (wakeM(m)) continue;
    if (showM(m)) { out.push({ t: "msg", m }); continue; }
    if (sysM(m)) { const l = [m]; while (i + 1 < all.length && !showM(all[i + 1]) && sysM(all[i + 1]) && !wakeM(all[i + 1])) l.push(all[++i]); out.push({ t: "sys", msgs: l }); continue; }
    const b = [m];
    while (i + 1 < all.length && !showM(all[i + 1]) && !sysM(all[i + 1])) b.push(all[++i]);
    out.push({ t: "band", msgs: b });
  }
  return out;
}

type Ctx = {
  room: string; r?: OfficeRoom; list: OfficePerson[]; reads?: Reads; rx: Record<string, Record<string, string[]>>; quick: string[];
  sel: string; setSel: (id: string) => void; onReact: (id: string, e: string) => void; onReply: (m: Msg) => void; onJump: (who: string, line: string, id?: string) => void;
  nre: RegExp | null;   // 봇 이름(시안 · nameRe)
  onProfile: (who: string) => void;   // 프사 누름 = 프로필 카드
  want: string;   // 그 글로 가는 중인 글 id — 묶음(「메시지 N개」) 안이면 그 묶음을 펼침
};
const nmOf = (list: OfficePerson[], w: string) => list.find((x) => x.who === w)?.name || w;

const ST: Record<string, [string, string]> = {
  suggest: ["💡 제안", "bg-sky-500/15 text-sky-700 dark:text-sky-300"],
  decide: ["⏳ 형 결정 필요", "bg-amber-500/15 text-amber-700 dark:text-amber-300"],
  verified: ["✅ 검증 통과", "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"],
  talk: ["✓ 말로만", "bg-muted text-muted-foreground"],
};
function StatePill({ m }: { m: Msg }) {
  if (!m.state || !ST[m.state]) return null;
  const k = m.state === "verified" && !m.proof ? "talk" : m.state;   // ✅ 증거 셋이 없으면 「말로만」(서버 proof)
  const e = m.state === "verified" && m.evidence;
  return (
    <span className="mb-1 flex flex-wrap items-center gap-1.5">
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ST[k][1]}`}>{ST[k][0]}</span>
      {e ? <span className="text-xs text-muted-foreground">{[e.target, e.result, e.checked_at ? t12(Date.parse(e.checked_at)) : ""].filter(Boolean).join(" · ")}</span> : null}
    </span>
  );
}

/** 가져감 = 1:1 방에서 형 글을 그 봇이 가져갔나(누가·몇 시 0 · 형 10-28 10:20 「가져감만 … 카톡처럼」) · 단체방 = 0(형 09:44 「회의실도 … 읽은 사람 표시되는거 없애줘」) */
function gotBy(m: Msg, c: Ctx) {
  if (!c.r?.with || m.kind !== "human") return false;
  const got = c.reads?.got || {};
  return Object.keys(got).some((n) => n !== m.who && (got[n] || []).includes(m.id));
}

function Reactions({ m, c, mine }: { m: Msg; c: Ctx; mine: boolean }) {
  const e = Object.entries(c.rx[m.id] || {}).filter(([, w]) => w && w.length);
  const app = new Map<string, string[]>();   // 그록 앱 반응(D14 · 거울 칸 app_reactions) = 같은 그림끼리 묶음
  for (const x of m.app_reactions || []) if (x?.emoji) app.set(x.emoji, [...(app.get(x.emoji) || []), x.who]);
  if (!e.length && !app.size) return null;
  return (
    <div className={`mt-1 flex flex-wrap gap-1 ${mine ? "justify-end" : ""}`}>
      {[...app].map(([k, w]) => (
        <span key={`app-${k}`} title={`그록 앱 반응 · ${w.map((x) => nmOf(c.list, x)).join(" · ")}`}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-1.5 py-0 text-[11px] text-muted-foreground">
          {k}{w.length > 1 ? <span className="tabular-nums">{w.length}</span> : null}
        </span>
      ))}
      {e.map(([k, w]) => (
        <button key={k} type="button" title={w.map((x) => nmOf(c.list, x)).join(" · ")} onClick={() => c.onReact(m.id, k)}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${w.includes("형") ? "border-primary/50 bg-primary/10" : "border-border"}`}>
          {k}<span className="tabular-nums">{w.length}</span>
        </button>
      ))}
    </div>
  );
}

function Actions({ m, c, mine }: { m: Msg; c: Ctx; mine: boolean }) {   // 글 위 동작(마우스 올림 · 폰 = 글 누름) = 빠른 반응 · 답장 · 복사 · 고정(형 화면만 · ./pins.tsx)
  const [copied, setCopied] = useState(false);
  const pins = usePinActions(c.room);
  return (
    <div className={`mt-1 flex flex-wrap items-center gap-0.5 rounded-full border border-border bg-background/95 p-0.5 shadow-sm ${mine ? "self-end" : "self-start"}`} role="group" aria-label="글 동작">
      {c.quick.map((q) => (
        <button key={q} type="button" className="grid size-8 place-items-center rounded-full hover:bg-foreground/5" aria-label={`반응 ${q}`} onClick={() => c.onReact(m.id, q)}>{q}</button>
      ))}
      <button type="button" className="rounded-full px-2.5 py-1 text-xs hover:bg-foreground/5" onClick={() => c.onReply(m)}>답장</button>
      <button type="button" className="rounded-full px-2.5 py-1 text-xs hover:bg-foreground/5" onClick={() => { void navigator.clipboard?.writeText(String(m.text || "").replace(QUOTE, "")).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }); }}>{copied ? "복사함" : "복사"}</button>
      {pins.can ? <button type="button" className="rounded-full px-2.5 py-1 text-xs hover:bg-foreground/5" disabled={pins.busy} onClick={() => { pins.pin({ id: m.id, ts: m.ts }); c.setSel(""); }}>고정</button> : null}
    </div>
  );
}

/** 사진 크게 보기(형 10-31 「누르면 확대할 수 있고」) · 입력칸 미리보기도 씀 · 아무 데나 누르면 닫힘 */
function zoomImage(src: string, alt = "") {
  const v = document.createElement("div"), i = new Image();
  v.className = "nm-zoom"; i.src = src; i.alt = alt; v.append(i); v.onclick = () => v.remove();
  document.body.append(v);
}
(window as unknown as { nmZoom?: typeof zoomImage }).nmZoom = zoomImage;
const onlyPhotos = (m: Msg) => !!m.files?.length && m.files.every((p) => IMG_RE.test(String(p)));   // 사진만 든 글 = 말풍선 없이(형 10-31 「사진 주변 테두리 없애줘」)
function Files({ m }: { m: Msg }) {
  const meta = new Map((m.file_meta || []).filter((x) => x?.path).map((x) => [x.path, x]));
  const ps = [...new Set((m.files || []).map(String))];
  const one = (p: string) => ({ p, n: meta.get(p)?.name || fileName(p), b: meta.get(p)?.bytes || 0 });
  const imgs = ps.filter((p) => IMG_RE.test(p)).map(one), rest = ps.filter((p) => !IMG_RE.test(p)).map(one);
  return (
    <div className="flex flex-col gap-2">
      {imgs.length ? (
        <div className="flex flex-wrap gap-2">
          {imgs.map((f) => (
            <a key={f.p} href={fileUrl(f.p)} target="_blank" rel="noopener" title={`${f.n} — 누르면 크게`} className="block overflow-hidden rounded-2xl" onClick={(e) => { e.preventDefault(); e.stopPropagation(); zoomImage(fileUrl(f.p), f.n); }}>
              <img src={fileUrl(f.p)} alt={f.n} loading="lazy" className="block max-h-60 max-w-[240px] object-cover" />
            </a>
          ))}
        </div>
      ) : null}
      {rest.map((f) => (
        <a key={f.p} href={fileUrl(f.p)} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2 hover:bg-foreground/5">
          <span aria-hidden className="text-lg">📄</span>
          <span className="min-w-0"><span className="block truncate text-sm font-medium">{f.n}</span><small className="text-xs text-muted-foreground">{f.b ? `${size(f.b)} · ` : ""}누르면 열기·받기</small></span>
        </a>
      ))}
    </div>
  );
}

function Quote({ m, c }: { m: Msg; c: Ctx }) {
  const q = String(m.text || "").match(QUOTE);
  if (q) return <button type="button" className="mb-1 block max-w-full truncate rounded-md border-l-2 border-primary bg-muted px-2 py-1 text-left text-xs" title="그 글로" onClick={() => c.onJump(q[1], q[2])}><b>{q[1]}</b> · {q[2]}</button>;
  //   「↩ 원 글로」 칩(reply_to 만 있는 글) = 뺌(형 10-28 22:03 「원글로 라고 나오는거 안나와도 될듯」) · 「↩ 이름: 첫 줄」 인용은 그대로
  return null;
}

/** 글 속 부름(「@이름」·「!이름」) — 서버가 알아들은 이름만(mention · urgent · alias 칸 = 부름이 실제로 걸린 것만 칩) · 긴 이름 먼저(「@윈터」보다 「@윈터 PM」) */
const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function callRe(m: Msg): RegExp | null {
  const names = [...new Set([...(m.mention || []), ...(m.urgent || []), ...Object.keys(m.alias || {}).map((k) => k.replace(/^[@!]/, ""))])].filter(Boolean);
  return names.length ? new RegExp(`([@!](?:${names.sort((a, b) => b.length - a.length).map(reEsc).join("|")}))`, "g") : null;
}
/** 글 속 봇 이름(부름 아닌 그냥 이름 · 형 10-30 18:4x 「호출은 그대로 두고 그냥 명칭일라도 색을 다르게 … 시안색으로」) = 시안 글자 —
 *  앞 = 글 처음·한글/영문/숫자/@/! 아닌 자리 · 뒤 = 토씨 하나까지만 붙고 낱말 끝(「결과」·「온도」·「감사」 안의 한 글자는 안 칠함 · 한 글자 이름은 「과·와·도」 토씨 뺌) */
const NAME_TAIL = "(?:야|아|님|씨|에게|한테|께|이|가|은|는|을|를|랑|이랑|의|이야|이가)";
const NAME_TONE = new Map<string, string>();   // 형 10-31 「그록봇은 시안 · 클로드봇은 주황네온 · 지피티 봇은 연보라네온」 · 「형 또는 세웅 은 노뮤트색」 = 이름 → 색 칸(gk·cl·gp·hy · 호출 칩 ycall 은 그대로)
const TONE_OF: Record<string, string> = { 그록봇: "gk", 클로드: "cl", 닷: "gp", 부름: "gp" };
const TONE_WORDS: [string, string][] = [["그록", "gk"], ["그록봇", "gk"], ["클로드", "cl"], ["클로드봇", "cl"], ["지피티", "gp"], ["지피티봇", "gp"]];
const GROUP_PICK = [{ id: "group-all", name: "모두", title: "전원" }, { id: "group-grok", name: "그록", title: "그록봇" }, { id: "group-claude", name: "클로드", title: "클로드" }, { id: "group-gpt", name: "지피티", title: "지피티" }];   // 입력칸 「@」·「!」 목록 맨 위 = 묶음 부르기(형 10-31 · 서버 _names.js)
function nameRe(list: OfficePerson[]): RegExp | null {
  NAME_TONE.clear();
  for (const [w, tone] of TONE_WORDS) NAME_TONE.set(w, tone);
  for (const p of list) {
    const tone = p.kind === "human" ? "hy" : TONE_OF[p.cls || ""];
    if (tone) for (const n of [p.who, p.name]) if (n) NAME_TONE.set(n, tone);
  }
  const ns = [...NAME_TONE.keys()].sort((a, b) => b.length - a.length);
  if (!ns.length) return null;
  const one = ns.filter((n) => n.length === 1), more = ns.filter((n) => n.length > 1);
  const alt = [...(more.length ? [`(?:${more.map(reEsc).join("|")})(?=(?:${NAME_TAIL.slice(3, -1)}|와|과|도)?(?![0-9A-Za-z가-힣_]))`] : []),
    ...(one.length ? [`(?:${one.map(reEsc).join("|")})(?=${NAME_TAIL}?(?![0-9A-Za-z가-힣_]))`] : [])];
  return new RegExp(`(^|[^0-9A-Za-z가-힣_@!\\[])(${alt.join("|")})`, "g");
}
function named(text: string, nre: RegExp | null, key: string): ReactNode {
  if (!nre) return text;
  const out: ReactNode[] = [];
  let last = 0, k = 0;
  for (const mm of text.matchAll(nre)) {
    const at = (mm.index || 0) + mm[1].length;
    if (at > last) out.push(text.slice(last, at));
    out.push(<span key={`${key}-n${k++}`} className={`yname-c ${NAME_TONE.get(mm[2]) || ""}`}>{mm[2]}</span>);
    last = at + mm[2].length;
  }
  if (!out.length) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
}
function called(text: string, re: RegExp | null, key: string, nre: RegExp | null = null): ReactNode {
  if (!re) return named(text, nre, key);
  const parts = text.split(re);
  return parts.length === 1 ? named(text, nre, key) : parts.map((x, i) => (i % 2 ? <span key={`${key}-${i}`} className="ycall">{x}</span> : <Fragment key={`${key}-${i}`}>{named(x, nre, `${key}-${i}`)}</Fragment>));
}

/** 꾸밈 없는 글(형 글) 속 주소 → 누르면 새 창 링크(말풍선 누름 = 글 동작 줄은 안 열림) · 부름 = 칩(형 10-30 「호출이 따로 링크처럼 표시안되는거」) · 봇 이름 = 시안 */
function linked(text: string, re: RegExp | null = null, nre: RegExp | null = null): ReactNode {
  const parts = text.split(URL_RE);
  if (parts.length === 1) return called(text, re, "t", nre);
  return parts.map((x, i) => (i % 2 ? <a key={i} href={x} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>{x}</a> : <Fragment key={i}>{called(x, re, `t${i}`, nre)}</Fragment>));
}

/** 봇 글(마크다운) 속 부름 → 「#nm-call」 링크로 바꿔 Streamdown 이 칩으로 그림 · 봇 이름 → 「#nm-name」(시안 글자) · 코드(``` · `) 안은 그대로 */
const CALL_HREF = "#nm-call", NAME_HREF = "#nm-name";
function calledMd(text: string, re: RegExp | null, nre: RegExp | null = null): string {
  if (!re && !nre) return text;
  return text.split(/(```[\s\S]*?```|`[^`\n]*`)/).map((x, i) => {
    if (i % 2) return x;
    const y = re ? x.replace(re, `[$1](${CALL_HREF})`) : x;
    return nre ? y.replace(nre, (_all, pre: string, n: string) => `${pre}[${n}](${NAME_HREF}-${NAME_TONE.get(n) || "gk"})`) : y;
  }).join("");
}
const mdWithCalls = {
  ...markdownComponents,
  a: (p: ComponentProps<"a">) => (p.href === CALL_HREF ? <span className="ycall">{p.children}</span> : p.href?.startsWith(NAME_HREF) ? <span className={`yname-c ${p.href.slice(NAME_HREF.length + 1)}`}>{p.children}</span> : markdownComponents.a(p)),
};

/** 앱 「컴퓨터 · 조치 필요」 카드(D10 · 거울 칸 box) — 단추 = 그 봇의 그록 방(https://grok.com/bot/<agentId>)
 *  짐작: 앱 단추는 가상 데스크톱 넘기기 화면을 연다(사무실에서 그 화면 주소는 실측 못 함 · 맞물림 21:3x) → 그 봇 방을 열어 거기서 누르게 */
function BoxCard({ m }: { m: Msg }) {
  const b = m.box;
  if (!b) return null;
  const extra = b.instruction && b.instruction.trim() !== String(m.text || "").trim() ? b.instruction : "";
  return (
    <>
      {extra ? <p className="mt-2 whitespace-pre-wrap text-sm">{extra}</p> : null}
      {m.app_agent ? (
        <a className="ybox-go" href={`https://grok.com/bot/${enc(m.app_agent)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>컴퓨터 열기</a>
      ) : null}
    </>
  );
}

function Body({ m, nre = null }: { m: Msg; nre?: RegExp | null }) {
  const text = String(m.text || "").replace(QUOTE, "");
  if (m.files?.length) return <Files m={m} />;
  if (EMO.test(text.trim())) return <span className="text-4xl leading-tight">{text.trim()}</span>;
  return <Streamdown components={mdWithCalls}>{calledMd(text, callRe(m), nre)}</Streamdown>;
}

/** 글 한 줄 = YETA 꼴 — 형 글 = 오른쪽 [가져감][말풍선 / 시각] · 상대 글 = 왼쪽 [얼굴][이름 / 말풍선 / 시각] · 시각 = 말풍선 밖 오른쪽 아래 모서리 바로 아래(.ybw) ·
 *  cont = 바로 앞이 같은 사람(얼굴·이름 접음) · fresh = 열어 둔 뒤 새로 온 글(올라옴) */
function Line({ m, c, cont = false, fresh = false }: { m: Msg; c: Ctx; cont?: boolean; fresh?: boolean }) {
  const p = c.list.find((x) => x.who === m.who);
  const selected = c.sel === m.id;
  const toggle = () => c.setSel(selected ? "" : m.id);
  const time = <time className="ytout" dateTime={new Date(m.ts).toISOString()}>{t12(m.ts)}</time>;
  if (m.kind === "human" || hyungApp(m)) {
    const app = hyungApp(m) && m.kind !== "human";   // 그록봇 앱에서 친 형 글 = 검정 말풍선 흰 글씨(형 10-30)
    return (
      <div className={`flex flex-col items-end ${m._thr ? "pr-4" : ""}`} data-id={m.id}>
        <Quote m={m} c={c} />
        <StatePill m={m} />
        <div className={`ymrow me${cont ? " cont" : ""}${fresh ? " in" : ""}`}>
          {gotBy(m, c) ? <span className="yb-un">가져감</span> : null}
          <div className="ybw"><div className={`yb me${app ? " app" : ""}${onlyPhotos(m) ? " ph" : ""}`} onClick={toggle} title={app ? "그록봇 앱에서 쓴 글" : undefined}>{m.files?.length ? <Files m={m} /> : linked(String(m.text || "").replace(QUOTE, ""), callRe(m), c.nre)}</div>{time}</div>
        </div>
        <Reactions m={m} c={c} mine />
        {selected ? <Actions m={m} c={c} mine /> : null}
      </div>
    );
  }
  return (
    <div className={`ymsg${cont ? " cont" : ""}${fresh ? " in" : ""}${m._thr ? " pl-6" : ""}`} data-id={m.id}>
      <button type="button" className="yava" aria-label={`${p?.name || m.who} 프로필`} onClick={(e) => { e.stopPropagation(); c.onProfile(m.who); }}><FaceImg id={idOf(m.who, c.list)} size={32} /></button>
      <div className="ycol">
        <div className="yname">{p?.name || m.who}</div>
        <Quote m={m} c={c} />
        <StatePill m={m} />
        <div className="ybrow">
          <div className="ybw">
            <div className={`yb ai${onlyPhotos(m) ? " ph" : ""}`} onClick={toggle}>
              {m.box ? <div className="ybox-h"><span aria-hidden>🖥</span>컴퓨터 · 조치 필요</div> : null}
              <div className="ymd"><Body m={m} nre={c.nre} /></div>
              <BoxCard m={m} />
            </div>
            {time}
          </div>
        </div>
        <Reactions m={m} c={c} mine={false} />
        {selected ? <Actions m={m} c={c} mine={false} /> : null}
      </div>
    </div>
  );
}

function Band({ msgs, c }: { msgs: Msg[]; c: Ctx }) {
  const [open0, setOpen] = useState(false);
  const open = open0 || (!!c.want && msgs.some((x) => x.id === c.want));   // 그 글로 가는 중 = 펼침
  const ws = [...new Set(msgs.map((x) => x.who))];
  return (
    <div className="flex flex-col items-center gap-3">
      <button type="button" className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:bg-foreground/5" aria-expanded={open}
        aria-label={`${ws.map((w) => nmOf(c.list, w)).join(", ")} 이 포함된 메시지 ${msgs.length}개`} onClick={() => setOpen((v) => !v)}>
        <FaceStack ids={ws.slice(0, 3).map((w) => idOf(w, c.list))} size={18} />
        {ws.length > 3 ? <b className="font-semibold text-foreground">외 {ws.length - 3}</b> : null}
        {ws.length > 3 ? " · " : ""}메시지 {msgs.length}개
      </button>
      {open ? <div className="flex w-full flex-col gap-[10px] border-l-2 border-border pl-3 opacity-90">{msgs.map((m, i) => <Line key={m.id} m={m} c={c} cont={i > 0 && msgs[i - 1].who === m.who} />)}</div> : null}
    </div>
  );
}

/** 「결 작업 중 · 고민하는 중…」 — 1:1 = 그 봇이 깨 있고 마지막 글이 그 봇 글이 아님 · 회의실 = 그 봇을 부른 가장 새 글이 45분 안 · 깬 = 서버 bots(읽기만 깸 = 뺌) */
function typingOf(list: Msg[], r: OfficeRoom | undefined, bots: Bot[], people: OfficePerson[]): string[] {
  const doing = (n: string) => bots.some((b) => b.who === n && b.state === "awake" && b.why !== "read");
  if (!r) return [];
  if (r.with) return doing(r.with) && list.length && list.at(-1)?.who !== r.with ? [r.with] : [];
  if (r.id !== "all") return [];
  return people.filter((p) => p.kind === "bot" && doing(p.who)).map((p) => p.who).filter((n) => {
    for (let i = list.length - 1; i >= 0 && list[i].who !== n; i--) if ((list[i].mention || []).includes(n)) return Date.now() - list[i].ts < CALL_FRESH;
    return false;
  });
}


export function OfficeChat(p: { room: string; lead?: ReactNode; active?: boolean }) {
  return p.room === REPAIR_ROOM ? <RepairDesk lead={p.lead} active={p.active ?? true} /> : <OfficeChatRoom {...p} />;
}

function OfficeChatRoom({ room, lead, active = true }: { room: string; lead?: ReactNode; active?: boolean }) {   // active = 이 판이 보임(껍데기에서 숨은 판이면 본 데까지 안 올림 = 안 읽은 수 그대로)
  const qc = useQueryClient();
  const { r, list, msgs, reads, reacts, bots, older, draft } = useOfficeRoom(room);
  const [err, setErr] = useState("");
  const [sel, setSel] = useState("");
  const [prof, setProf] = useState("");   // 프로필 카드를 연 사람(who · 빈 값 = 닫힘)
  const [reply, setReply] = useState<{ id: string; who: string; line: string } | null>(null);
  const [rxOver, setRxOver] = useState<Record<string, Record<string, string[]>> | null>(null);
  // 그 글로(답장 인용 · 고정 띠 이력 = window 「nm-jump」 {room, id}) — want.id = 간 글(그 묶음은 펼친 채 둠) · n = 부를 때마다 하나씩(같은 글로 또 가기) · done = 다 간 n
  const [want, setWantS] = useState<{ id: string; n: number }>({ id: "", n: 0 }), wantTry = useRef(0), wantDone = useRef(0);
  const setWant = (id: string) => { wantTry.current = 0; setWantS((w) => ({ id, n: w.n + 1 })); };
  const all = msgs.data?.messages || [];
  const meet = room === MEET;
  const items = useMemo(() => (meet ? flatView(all) : hyungView(all, r)), [all, r, meet]);
  const typing = useMemo(() => typingOf(all, r, bots, list).filter((n) => n !== draft?.who), [all, r, bots, list, draft?.who]);   // 초안이 자라는 봇 = 점 셋 대신 초안 말풍선
  // 머리 등불 구슬(보조 02 PR 1489) = 원본 useChatOrb 재료 · 듣는 중 = 형이 글칸에 씀 · 일하는 중 = 윈터에게 보낸 형 글 뒤 윈터 답 전(30분 안) · 서버 「깸」 칸은 뜻이 달라 안 씀(office-orb.md)
  const winterWorking = useMemo(() => {
    const toW = (m: Msg) => m.kind === "human" && (r?.with === WINTER_WHO || (m.mention || []).includes(WINTER_WHO) || Object.values(m.alias || {}).some((v) => Array.isArray(v) && v.includes(WINTER_WHO)));
    for (let i = all.length - 1; i >= 0; i--) {
      if (all[i].who === WINTER_WHO) return false;
      if (toW(all[i])) return Date.now() - all[i].ts < 30 * 60e3;
    }
    return false;
  }, [all, r]);
  const presence = useReportChatPresence(true, { working: winterWorking, failed: false });
  const busyWho = draft?.who || typing[0] || "";   // 머리 얼굴 도는 테(형 10-31 「상대가 호출에 응답중일 때 위에 동글 도는거 표시」) = top.tsx 가 받음
  useEffect(() => { qc.setQueryData(["nomute", "busy", room], busyWho); return () => { qc.setQueryData(["nomute", "busy", room], ""); }; }, [qc, room, busyWho]);
  const bots4 = useMemo(() => {   // 입력칸 「@」·「!」 목록 = 이 방에서 부를 수 있는 이(정한 사람 없는 방 = 봇 + 윈터·봄 같은 존재 · 형 10-30 「호출시 … 리스트 안뜨는 것」)
    const ids = r ? roomAgentIds(r, list) : [];
    if (r && !r.with && !r.members?.length) for (const p of list) { const id = idOf(p.who, list); if (p.kind !== "human" && p.who !== "형" && !ids.includes(id)) ids.push(id); }
    const people = ids.map((id) => { const p = list.find((x) => idOf(x.who, list) === id); return { id, name: p?.name || p?.who || id, title: p?.role }; });
    return r?.with ? people : [...GROUP_PICK, ...people];
  }, [r, list]);
  const baseTs = useRef<number | null>(null);   // 방을 연 때 마지막 글 — 그 뒤에 온 글만 올라오는 움직임(YETA .in · 옛 글 다시 그림 = 0)
  if (baseTs.current === null && msgs.data) baseTs.current = all.at(-1)?.ts ?? 0;
  const lastId = all.at(-1)?.id, firstId = all[0]?.id;
  // 스크롤 = 대화 칸 하나만 움직임(바깥 판 0) · stuck = 맨 아래에 붙어 있음(처음 열 때 · 새 글·사진·글꼴이 늦게 와서 길어져도 그대로 맨 아래)
  const boxRef = useRef<HTMLDivElement | null>(null), stuck = useRef(true), keepTop = useRef<{ h: number; top: number } | null>(null);
  const loadingOld = useRef(false), moreRef = useRef(false), olderRef = useRef(older), autoN = useRef(0), poke = useRef<() => void>(() => {});
  const hold = useRef(0);   // 이때까지 = 맨 아래로 안 당김(손으로 미는 중 · 「↑ 글 처음」 이동 중 · 형 16:47 「벅벅벅 거리면서 안올라가져」)   // autoN = 손 안 대고 저절로 받은 앞 글 횟수(화면 채우기 · AUTO_MAX 까지 · 손으로 밀면 다시 0)
  moreRef.current = !!msgs.data?.more; olderRef.current = older;
  const [jump, setJump] = useState("");   // 화면 위로 시작이 넘어간 글(「↑ 글 처음」)
  useLayoutEffect(() => {   // 위로 받은 앞 글 = 보던 자리 그대로(늘어난 높이만큼 내림)
    const box = boxRef.current, k = keepTop.current;
    if (box && k) { box.scrollTop = k.top + (box.scrollHeight - k.h); keepTop.current = null; }
  }, [firstId]);
  useLayoutEffect(() => {   // 맨 아래 = 처음 열 때 · 새 글(맨 아래에 붙어 있었을 때 · 형이 쓴 글)
    const box = boxRef.current;
    if (box && lastId && (stuck.current || all.at(-1)?.kind === "human")) { box.scrollTop = box.scrollHeight; stuck.current = true; }
    const ts = [150, 500, 1200, 2500].map((t) => window.setTimeout(() => poke.current(), t));   // 마크다운·사진·글꼴이 늦게 그려져 길어져도 다시 맞춤(크기 알림이 안 오는 숨은 화면 포함)
    return () => ts.forEach(clearTimeout);
  }, [lastId, msgs.isPending]);   // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {   // 초안이 자람 = 맨 아래에 붙어 있으면 따라 내려감
    const box = boxRef.current;
    if (box && draft && stuck.current) box.scrollTop = box.scrollHeight;
  }, [draft?.text]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let tm = 0;
    const look = () => {
      tm = 0;
      const top = box.getBoundingClientRect().top + HEAD;   // 보이는 위 = 떠 있는 머리 아래
      let hit = "";
      for (const el of box.querySelectorAll<HTMLElement>("[data-id]")) {
        const b = el.getBoundingClientRect();
        if (b.bottom <= top + 48) continue;   // 이미 위로 다 지나간 글
        if (b.top < top - 24) hit = el.dataset.id || "";   // 위에 걸친 글 = 시작이 안 보임
        break;
      }
      setJump(hit);
      // 앞 글 하루치 = 위 끝 가까이 왔을 때 · 화면이 아직 안 찼을 때(봇끼리 글이 한 줄로 접혀 짧음) — 저절로는 AUTO_MAX 번까지 · 받은 게 0 이면 그만
      const short = box.scrollHeight - box.clientHeight < 240 || box.scrollTop < 240;
      if (short && moreRef.current && !loadingOld.current && autoN.current < AUTO_MAX) {
        loadingOld.current = true; autoN.current++;
        keepTop.current = { h: box.scrollHeight, top: box.scrollTop };
        void olderRef.current().then((k) => { if (!k) autoN.current = AUTO_MAX; }).catch(() => { keepTop.current = null; autoN.current = AUTO_MAX; })
          .finally(() => { loadingOld.current = false; on(); });
      }
    };
    const on = () => { if (!tm) tm = window.setTimeout(look, 50); };   // 묶어 보기(그림 틀 알림 rAF 는 숨은 화면에서 안 와서 시계로)
    // 맨 아래 다시 붙이기 = 내용이 길어질 때만(사진·글꼴·마크다운이 늦게 그려짐 · 크기 알림·시계) · 손이 닿는 동안·이동 중엔 안 당김 · 스크롤 셈 자리에서는 안 함(16:46 고장 = 위로 미는 첫 80px 을 「붙음」으로 보고 맨 아래로 되당김)
    const grow = () => { if (stuck.current && Date.now() > hold.current && box.scrollHeight - box.scrollTop - box.clientHeight > 1) box.scrollTop = box.scrollHeight; on(); };
    poke.current = grow;
    // 맨 아래에 붙음 = 스크롤이 움직일 때만 다시 셈(길이가 늘어나는 동안 셈하면 「붙음」이 먼저 꺼져 맨 아래를 놓침)
    const onScroll = () => { stuck.current = box.scrollHeight - box.scrollTop - box.clientHeight < 4; on(); };   // 붙음 = 정말 맨 아래(4px 안)
    const hand = () => { autoN.current = 0; hold.current = Date.now() + 900; };   // 손으로 밀면 = 저절로 받기 다시 셈 · 잠깐 안 당김
    const wheel = (e: WheelEvent) => { hand(); if (e.deltaY < 0) stuck.current = false; };   // 위로 굴림 = 바로 떨어짐
    const ro = new ResizeObserver(grow);
    box.addEventListener("scroll", onScroll, { passive: true });
    box.addEventListener("load", grow, true);   // 사진이 와서 길어짐
    box.addEventListener("touchstart", hand, { passive: true });
    box.addEventListener("touchmove", hand, { passive: true });
    box.addEventListener("wheel", wheel, { passive: true });
    document.fonts?.addEventListener?.("loadingdone", grow);   // 글꼴이 와서 길어짐
    ro.observe(box);
    if (box.firstElementChild) ro.observe(box.firstElementChild);
    on();
    return () => {
      box.removeEventListener("scroll", onScroll); box.removeEventListener("load", grow, true); box.removeEventListener("touchstart", hand); box.removeEventListener("touchmove", hand); box.removeEventListener("wheel", wheel);
      document.fonts?.removeEventListener?.("loadingdone", grow); ro.disconnect(); if (tm) clearTimeout(tm);
    };
  }, [msgs.isPending, room]);
  useEffect(() => {   // 밖에서 그 글로(보조 01 고정 띠·이력 판 = window.dispatchEvent(new CustomEvent("nm-jump", { detail: { room, id } })))
    const on = (e: Event) => { const d = (e as CustomEvent<{ room?: string; id?: string }>).detail || {}; if (d.room === room && d.id) setWant(String(d.id)); };
    window.addEventListener("nm-jump", on);
    return () => window.removeEventListener("nm-jump", on);
  }, [room]);
  useEffect(() => {   // 그 글로 = 그려졌으면 가운데로 굴리고 반짝 · 묶음 안 = 묶음이 펼쳐진 다음 그림에서 · 아직 안 받은 앞 글 = 하루치씩 받으며 찾음(8번까지)
    if (!want.id || wantDone.current === want.n) return;
    const t = window.setTimeout(() => {
      const el = boxRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(want.id)}"]`);
      if (el) {
        wantDone.current = want.n; stuck.current = false; hold.current = Date.now() + 1500;
        el.scrollIntoView({ block: "center", behavior: document.hidden ? "auto" : "smooth" });
        el.animate?.([{ backgroundColor: "color-mix(in srgb, currentColor 12%, transparent)" }, { backgroundColor: "transparent" }], { duration: 1200 });
        for (const d of [80, 700]) window.setTimeout(() => poke.current(), d);   // 이동 뒤 「↑ 글 처음」 다시 셈
      } else if (!all.some((x) => x.id === want.id)) {
        if (moreRef.current && wantTry.current < AUTO_MAX && !loadingOld.current) {
          wantTry.current++; loadingOld.current = true;
          void olderRef.current().then((k) => { if (!k) wantTry.current = AUTO_MAX; }).catch(() => { wantTry.current = AUTO_MAX; }).finally(() => { loadingOld.current = false; });
        } else if (!loadingOld.current) { wantDone.current = want.n; setErr("그 글을 못 찾았어 — 받은 글 안에 없음"); }
      }
    }, 60);
    return () => clearTimeout(t);
  }, [want, all]);   // eslint-disable-line react-hooks/exhaustive-deps
  const toStart = () => {   // 「↑ 글 처음」 = 그 글 시작이 머리 바로 아래로
    const box = boxRef.current, el = box?.querySelector<HTMLElement>(`[data-id="${CSS.escape(jump)}"]`);
    if (!box || !el) return;
    stuck.current = false; hold.current = Date.now() + 1500;   // 이동 중엔 맨 아래로 안 당김(16:47 「눌러도 반응이 없고」 = 당기기가 이동을 되돌렸음)
    box.scrollTo({ top: box.scrollTop + el.getBoundingClientRect().top - box.getBoundingClientRect().top - HEAD - 8, behavior: document.hidden ? "auto" : "smooth" });   // 숨은 화면 = 부드러운 이동이 안 움직임
    for (const t of [80, 700]) window.setTimeout(() => poke.current(), t);   // 이동 뒤 단추 다시 셈(스크롤 알림이 늦거나 안 오는 화면 포함)
  };
  const seenQ = useQuery({ queryKey: ["nomute", "seen"], queryFn: () => office<{ seen: Record<string, { ts: number }> }>("seen").then((j) => j.seen || {}), staleTime: 15_000 });
  const seenOpen = useRef<{ room: string; ts: number } | null>(null);   // 방을 연 때 본 데까지(그 뒤 = 안 본 글) — 이 방에서 한 번만 잡음
  if ((seenQ.data || seenQ.isError) && (!seenOpen.current || seenOpen.current.room !== room)) seenOpen.current = { room, ts: Number(seenQ.data?.[room]?.ts) || 0 };   // 못 받음 = 0(단추 없음 · 본 데까지 올리기는 그대로)
  const seenReady = seenOpen.current?.room === room;
  const [unseenUsed, setUnseenUsed] = useState("");   // 누른 방 = 단추 내림
  const unseen = useMemo(() => {
    const t = seenOpen.current?.room === room ? seenOpen.current.ts : 0;
    return meet && t ? all.filter((m) => m.ts > t && m.kind !== "human" && !wakeM(m)) : [];
  }, [all, meet, room, seenReady]);   // eslint-disable-line react-hooks/exhaustive-deps
  const toUnseen = async () => {   // 안 본 첫 글로(받은 글 안에 없으면 하루치씩 앞 글을 받으며 · AUTO_MAX 번까지)
    setUnseenUsed(room);
    const t = seenOpen.current?.ts || 0;
    for (let i = 0; i <= AUTO_MAX; i++) {
      const cur = qc.getQueryData<Page>(officeKeys.msgs(room))?.messages || [];
      const first = cur.find((m) => m.ts > t && m.kind !== "human" && !wakeM(m));
      if (first && (cur[0]?.ts ?? Infinity) <= t) { setWant(first.id); return; }   // 본 데까지가 받은 글 안 = 첫 안 본 글이 맞음
      if (!moreRef.current || !(await olderRef.current().catch(() => 0))) { if (first) setWant(first.id); return; }
    }
  };
  useEffect(() => {   // 방을 여는 순간 = 이 기기 안 「봤음」 + 목록 숫자 0(서버 답 안 기다림 · 형 10-30 15:4x 「금방 안없어지는 느낌」)
    if (!active) return;
    markReadLocal(room, all.at(-1)?.ts);
    qc.setQueryData<(OfficeRoom & { unread?: number })[]>(["nomute", "rooms"], (old) => old?.map((x) => (x.id === room && x.unread ? { ...x, unread: 0 } : x)));
  }, [room, active, lastId]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {   // 본 데까지(안 읽음 점 · 기기끼리 · 서버 seen) — 보이는 때만 · 연 때 본 데까지를 먼저 잡은 뒤(안 본 것부터 단추)
    const ts = all.at(-1)?.ts;
    if (!ts || !active || !seenReady) return;
    // 읽은 방 「1」 = 바로 지움(서버 답 기다리지 않음) → 서버 seen 뒤 방 목록 다시(형 10-30 「톡방 읽고나면 1 안없어지는거」 · 전엔 seen 만 다시 읽어 rooms[].unread 가 남았음)
    qc.setQueryData<(OfficeRoom & { unread?: number })[]>(["nomute", "rooms"], (old) => old?.map((x) => (x.id === room && x.unread ? { ...x, unread: 0 } : x)));
    void office("seen", { method: "POST", body: JSON.stringify({ seen: { [room]: { ts, at: Date.now() } } }) })
      .then(() => { void qc.invalidateQueries({ queryKey: ["nomute", "seen"] }); void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] }); void qc.invalidateQueries({ queryKey: ["duet-channels"] }); })
      .catch(() => {});
  }, [room, lastId, active, seenReady]);

  const react = useMutation({
    mutationFn: ({ id, emoji }: { id: string; emoji: string }) => office<{ reactions: Record<string, Record<string, string[]>> }>(`rooms/${enc(room)}/reactions`, { method: "POST", body: JSON.stringify({ id, emoji }) }),
    onMutate: ({ id, emoji }) => {   // 먼저 화면(형) · 서버 답으로 맞춤 · 실패 = 되돌림
      const base = rxOver || reacts?.reactions || {};
      const w = base[id]?.[emoji] || [], on = !w.includes("형");
      setRxOver({ ...base, [id]: { ...base[id], [emoji]: on ? [...w, "형"] : w.filter((x) => x !== "형") } });
    },
    onSuccess: (j) => { setRxOver(null); qc.setQueryData(officeKeys.reacts(room), (old: object | undefined) => ({ ...(old || {}), reactions: j.reactions || {} })); },
    onError: (e) => { setRxOver(null); setErr(`반응 못 남김 — ${e instanceof Error ? e.message : String(e)}`); },
  });

  const nre = useMemo(() => nameRe(list), [list]);
  const c: Ctx = {
    room, r, list, nre, onProfile: setProf, reads, rx: rxOver || reacts?.reactions || {}, quick: reacts?.quick?.length ? reacts.quick : ["👍", "❤️", "😂", "🎉", "🤔", "👀"],
    sel, setSel, want: want.id,
    onReact: (id, emoji) => { setSel(""); react.mutate({ id, emoji }); },
    onReply: (m) => { setSel(""); setReply({ id: m.id, who: nmOf(list, m.who), line: firstLine(m) }); },
    onJump: (who, line, id) => {
      const hit = id ? all.find((x) => x.id === id) : [...all].reverse().find((x) => nmOf(list, x.who) === who && firstLine(x).startsWith(line.replace(/…$/, "").slice(0, 20)));
      if (hit || id) setWant(hit ? hit.id : String(id));   // 묶음 안이면 펼치고 · 안 받은 앞 글이면 받으며 찾음(위 효과)
      else setErr("그 글이 지금 받은 글 안에 없어 — 위 「옛 글 더 보기」로");
    },
  };

  if (msgs.isPending) return null;
  if (msgs.isError) return <p className="p-8 text-sm text-destructive" role="alert">대화를 못 받았어 — {msgs.error.message}</p>;

  let prevTs = 0, prev: Item | undefined;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="ychat relative flex min-h-0 flex-1 flex-col">
      {meet ? (unseen.length && unseenUsed !== room ? <button type="button" className="yjump" onClick={() => void toUnseen()}>안 본 것부터 · {unseen.length}</button> : null)
        : jump ? <button type="button" className="yjump" onClick={toStart}>↑ 글 처음</button> : null}
      <div ref={boxRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">   {/* 글이 적으면 아래부터 쌓음(mt-auto · 형 16:46 「메세지 보내면 이렇게 가려져」) */}
        <div className="ychat mx-auto mt-auto flex w-full max-w-2xl flex-col gap-[10px] px-3 pb-6 pt-[100px]">   {/* 위 여백 = 떠 있는 머리(대화 상대 동그라미) 밑에 첫 글이 안 깔리게 */}
          {lead}
          {msgs.data?.more && !meet ? (
            <button type="button" className="mx-auto rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-foreground/5" onClick={() => { const bx = boxRef.current; if (bx) keepTop.current = { h: bx.scrollHeight, top: bx.scrollTop }; void older(); }}>옛 글 더 보기</button>
          ) : null}
          {all.length === 0 ? <p className="text-center text-sm text-muted-foreground">첫 대화를 시작해보세요</p> : null}
          {items.map((it) => {
            const first = it.t === "msg" ? it.m : it.msgs[0];
            const newDay = !first._thr && (!prevTs || dayKey(prevTs) !== dayKey(first.ts));
            const cont = !newDay && it.t === "msg" && prev?.t === "msg" && prev.m.who === it.m.who && prev.m.kind === it.m.kind;
            prevTs = (it.t === "msg" ? it.m : it.msgs[it.msgs.length - 1]).ts;
            prev = it;
            const key = it.t === "msg" ? it.m.id : `${it.t}-${first.id}`;
            return (
              <div key={key} className="flex flex-col gap-[10px]">
                {newDay ? <p className="ydate">{dateLabel(first.ts)}</p> : null}
                {it.t === "msg" ? <Line m={it.m} c={c} cont={cont} fresh={it.m.ts > (baseTs.current ?? Infinity)} /> : it.t === "band" ? <Band msgs={it.msgs} c={c} /> : (
                  <p className="yb sys max-w-full truncate" title={it.msgs.map((y) => `${t12(y.ts)} ${y.who} · ${(y.text || "").split("\n")[0]}`).join("\n")}>
                    {it.msgs.at(-1)?.who} · {(it.msgs.at(-1)?.text || "").split("\n")[0].slice(0, 60)}
                    {it.msgs.length > 1 ? ` 외 ${it.msgs.length - 1}` : ""} · <span className="tabular-nums">{t12(it.msgs.at(-1)?.ts || 0)}</span>
                  </p>
                )}
              </div>
            );
          })}
          {draft ? (   /* 쓰는 중 초안 = YETA _yDraft 꼴(문장이 자라는 대로 그 봇 말풍선 · 끝에 점 셋 · 끝난 답 글이 오면 사라짐) */
            <div className="ymsg ytyp" aria-live="polite">
              <div className="yava"><FaceImg id={idOf(draft.who, list)} size={32} /></div>
              <div className="ycol">
                <div className="yname">{nmOf(list, draft.who)} · 쓰는 중</div>
                <div className="yb ai"><Streamdown components={markdownComponents}>{draft.text}</Streamdown><span className="ytdots"><i /><i /><i /></span></div>
              </div>
            </div>
          ) : null}
          {typing.length ? (   /* YETA 타이핑 = 얼굴 + 점 셋 말풍선 · 이름 칸 = 「결 작업 중 · 고민하는 중…」(옛 규칙) */
            <div className="ymsg ytyp" aria-live="polite">
              <div className="yava"><FaceImg id={idOf(typing[0], list)} size={32} /></div>
              <div className="ycol">
                <div className="yname">{typing.map((n) => nmOf(list, n)).join("·")} 작업 중 · {WORK[Math.floor(Date.now() / 60e3) % WORK.length]}…</div>
                <div className="yb ai"><span className="ytdots"><i /><i /><i /></span></div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      </div>
      <div className="ychat ychat-in mx-auto w-full max-w-2xl shrink-0 px-3 pb-[var(--duet-tab-space,16px)]">
        {err ? <p className="pb-2 text-sm text-destructive" role="alert" onClick={() => setErr("")}>{err}</p> : null}
        {reply ? (
          <div className="mb-2 flex items-center gap-2 rounded-xl border-l-2 border-primary bg-muted px-3 py-1.5 text-xs">
            <span className="min-w-0 flex-1 truncate">↩ <b>{reply.who}</b> · {reply.line}</span>
            <button type="button" aria-label="답장 그만" className="px-1" onClick={() => setReply(null)}>×</button>
          </div>
        ) : null}
        <Composer
          agents={toAgentOptions(bots4)}
          channelId={room}
          onTextChange={(t) => { presence?.onTextChange?.(t); saveDraft(room, t); }}
          initialValue={loadDraft(room)}
          className="relative mt-auto w-full"
          commands={[]}
          compact
          placeholder={r ? `${r.with ? `${nmOf(list, r.with)}에게` : `${r.name}에`} 메시지 보내기` : "메시지 보내기"}
          onSubmit={async (draft) => {
            const raw = draft.text.trim();
            const ids = (draft.attachments || []).map((a) => (a.metadata as { attachmentId?: string } | undefined)?.attachmentId).filter((x): x is string => !!x);
            if (!raw && !ids.length) return;
            const text = raw && reply ? `↩ ${reply.who}: ${reply.line}\n${raw}` : raw;
            if (text.length > 8000) { setErr("8,000자 넘음 — 나눠서 보내 줘"); throw new Error("too long"); }
            if (ids.length && !r?.with && !list.some((p) => p.kind === "bot" && (text.includes(`@${p.who}`) || text.includes(`!${p.who}`)))) { setErr("단체방 첨부 = 받을 봇을 @ 로 골라 줘(1:1 방은 그 봇)"); throw new Error("no bot"); }
            setErr("");
            try {
              if (ids.length) {   // 파일 먼저(「파일:」 줄 = 서버) → 글이 있으면 그 뒤 보통 글로(옛 화면과 같은 차례)
                const fd = new FormData();
                for (const f of peekAttachments(ids)) fd.append("file", f);
                fd.set("room", room);
                if (text) fd.set("text", text);
                const res = await fetch("/api/office/files", { method: "POST", body: fd, credentials: "same-origin" });
                const j = (await res.json().catch(() => ({}))) as { ok?: boolean; why?: string; message?: Msg; failed?: { name: string }[] };
                if (!res.ok || j.ok === false) throw new Error(j.why || `파일 올리기 ${res.status}`);
                if (j.message) qc.setQueryData<Page>(officeKeys.msgs(room), (old) => merge(old, [j.message as Msg]));
                dropAttachments(ids);
                if (j.failed?.length) setErr(`못 올린 파일 ${j.failed.length} — ${j.failed.map((x) => x.name).join(", ")}`);
              }
              if (text) {
                const body: Record<string, unknown> = { text };
                const j = await office<{ message?: Msg }>(`rooms/${enc(room)}/messages`, { method: "POST", body: JSON.stringify(body) });
                if (j.message) qc.setQueryData<Page>(officeKeys.msgs(room), (old) => merge(old, [j.message as Msg]));
              }
              setReply(null); saveDraft(room, "");
              void qc.invalidateQueries({ queryKey: officeKeys.rooms });
            } catch (e) {
              setErr(`못 보냈어 — ${e instanceof Error ? e.message : String(e)} · 글은 입력칸에 그대로`);
              throw e;
            }
          }}
        />
      </div>
      <ProfileCard who={prof} list={list} onClose={() => setProf("")} />
    </div>
  );
}

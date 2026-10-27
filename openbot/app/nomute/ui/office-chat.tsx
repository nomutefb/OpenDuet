// 우리 대화창 — 원본 부품(말풍선·글 줄·입력칸·마크다운) 그대로 쓰고, 형 대화창 규칙·옛 화면 기능은 우리 것(옛 = viewer/office.html)
//   형 보기(형 10-27 16:33·21:16) = 형 글 + 형에게 온 글만 펼침 · 봇끼리·클로드 글 = 그 자리 한 줄 「(얼굴 셋) 외 N · 메시지 M개」(형 10-28 05:12)
//   말풍선 위 읽음 얼굴 0 · 형 글 시간 = 말풍선 아래 · 가져감 = 말풍선 아래 「가져감 결 04:42」(없으면 줄 0) · 러너 깸 줄 안 보임 · 시스템 일 = 가운데 흐린 한 줄
//   줄기 = ⏳·✅ 상태 답(reply_to)은 원 글 바로 아래 · 답장 = 글 첫 줄 「↩ 이름: 그 글 첫 줄」(서버 0 · 옛 화면과 같은 꼴) · 반응 · 체크(맡음) 줄 · 파일 · 긴 글 접기
//   동기화 = 열린 방은 기다리기(wait 25초 · 옛 화면과 같은 길) · 그 밖은 pulse(data/sync.ts)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { Composer, toAgentOptions } from "@/components/channels/composer";
import { useReportChatPresence } from "@/components/shell/chat-presence";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { MessageContent, MessageHeader, Message as MessageRow } from "@/components/ui/message";
import { markdownComponents } from "@/lib/markdown";
import { type OfficeMsg, type OfficePerson, type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { dropAttachments, peekAttachments } from "../shim/attachments";
import { FaceImg, FaceStack } from "./faces";

const enc = encodeURIComponent;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const SEP_MS = 30 * 60e3;
const CALL_FRESH = 45 * 60e3;   // 회의실 「작업 중」 = 부른 글이 45분 안일 때만(옛 화면 PR 1478 실측 · 답의 90% = 41분)
const QUOTE = /^↩ ([^:\n]{1,24}): ([^\n]*)(?:\n|$)/;
const EMO = /^\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier}|‍\p{Extended_Pictographic})*$/u;
const IMG_RE = /\.(png|jpe?g|gif|webp|avif)$/i;
const WINTER_WHO = "윈터 PM";
const WORK = ["고민하는 중", "정리하는 중", "처리하는 중"];

type Msg = OfficeMsg & { alias?: Record<string, string[]>; evidence?: { target?: string; result?: string; checked_at?: string }; proof?: boolean; file_meta?: { path: string; name?: string; bytes?: number }[]; _thr?: boolean };
type Page = { messages: Msg[]; more: boolean };
type Reads = { got?: Record<string, string[]>; got_at?: Record<string, Record<string, number>> };
type Look = { who: string; at: string | number; how: string };
type Bot = { who: string; state: string; why?: string };

export const officeKeys = {
  people: ["nomute", "people"] as const,
  rooms: ["nomute", "rooms"] as const,
  msgs: (room: string) => ["nomute", "msgs", room] as const,
  reads: (room: string) => ["nomute", "reads", room] as const,
  reacts: (room: string) => ["nomute", "reacts", room] as const,
  looks: (room: string) => ["nomute", "looks", room] as const,
  bots: ["nomute", "bots"] as const,
};

const merge = (old: Page | undefined, add: Msg[]): Page => {
  const m = new Map((old?.messages || []).map((x) => [x.id, x]));
  for (const x of add) m.set(x.id, x);
  return { messages: [...m.values()].sort((a, b) => a.ts - b.ts), more: old?.more ?? false };
};

const kst = (ts: number) => new Date(ts + 9 * 3600e3);
const hm = (ts: number) => kst(ts).toISOString().slice(11, 16);
const dayKey = (ts: number) => kst(ts).toISOString().slice(0, 10);
function sepLabel(ts: number) {
  const d = dayKey(ts), today = dayKey(Date.now()), yest = dayKey(Date.now() - 864e5);
  const h = kst(ts).getUTCHours(), mi = kst(ts).getUTCMinutes();
  const t = `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${String(mi).padStart(2, "0")}`;
  return d === today ? `오늘 ${t}` : d === yest ? `어제 ${t}` : `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일 ${t}`;
}
const fileName = (p: string) => String(p).split("/").pop()?.replace(/^\d{8}_\d{4}_/, "") || p;
const fileUrl = (p: string, dl = false) => `/api/office/file?${new URLSearchParams({ path: p, ...(dl ? { dl: "1" } : {}) })}`;
const size = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)}MB` : `${Math.max(1, Math.round(b / 1e3))}KB`);
const firstLine = (m: Msg) => {   // 답장 인용·복사 한 줄(인용 줄 빼고 · @·! 빼서 다시 부르지 않게 · 40자)
  const t = m.files?.length ? `파일 ${[...new Set(m.files.map(fileName))].join(", ")}` : String(m.text || "").replace(QUOTE, "");
  const l = (t.split("\n").find((x) => x.trim()) || "").replace(/[@!](?=\S)/g, "").replace(/\s+/g, " ").trim();
  return l.length > 40 ? `${l.slice(0, 40)}…` : l;
};
const afterTxt = (a: string | number, b: number) => {
  const at = typeof a === "string" ? Date.parse(a) : Number(a);
  if (!Number.isFinite(at)) return "";
  const n = Math.max(0, Math.round((at - b) / 60e3));
  return n < 1 ? "바로" : n < 60 ? `${n}분 후` : `${Math.floor(n / 60)}시간${n % 60 ? ` ${n % 60}분` : ""} 후`;
};

export function useOfficeRoom(room: string) {
  const qc = useQueryClient();
  const roomsQ = useQuery({ queryKey: officeKeys.rooms, queryFn: () => office<{ rooms: OfficeRoom[] }>("rooms").then((j) => j.rooms || []), staleTime: 15_000 });
  const peopleQ = useQuery({ queryKey: officeKeys.people, queryFn: () => people(), staleTime: 60_000 });
  const msgsQ = useQuery({
    queryKey: officeKeys.msgs(room),
    queryFn: async () => {   // 최근 100 · 「옛 글 더 보기」로 받아 둔 앞 글은 지킴
      const j = await office<Page>(`rooms/${enc(room)}/messages?n=100`);
      const old = qc.getQueryData<Page>(officeKeys.msgs(room)), fresh = j.messages || [];
      const keep = !!old?.messages.length && !!fresh.length && old.messages[0].ts < fresh[0].ts;
      return { messages: merge(keep ? old : undefined, fresh).messages, more: keep && old ? old.more : !!j.more };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const ids = (msgsQ.data?.messages || []).slice(-100).map((m) => m.id);
  const readsQ = useQuery({ queryKey: officeKeys.reads(room), queryFn: () => office<Reads>(`rooms/${enc(room)}/reads`), staleTime: 15_000, refetchInterval: 60_000 });
  const reactsQ = useQuery({ queryKey: officeKeys.reacts(room), queryFn: () => office<{ reactions: Record<string, Record<string, string[]>>; quick?: string[] }>(`rooms/${enc(room)}/reactions`), staleTime: 15_000, refetchInterval: 60_000 });
  const looksQ = useQuery({
    queryKey: [...officeKeys.looks(room), ids.at(-1) || ""],
    queryFn: () => office<{ looks: Record<string, Look[]> }>(`rooms/${enc(room)}/looks?${new URLSearchParams({ ids: ids.join(",") })}`),
    enabled: ids.length > 0, staleTime: 15_000, refetchInterval: 60_000,
  });
  const botsQ = useQuery({ queryKey: officeKeys.bots, queryFn: () => office<{ bots: Bot[] }>("bots").then((j) => j.bots || []), staleTime: 15_000, refetchInterval: 60_000 });

  useEffect(() => {   // 기다리기 고리 = 새 글이 오면 바로(옛 화면과 같은 길 · 탭이 숨으면 쉼)
    let stop = false;
    let ctl: AbortController | null = null;
    (async () => {
      while (!stop) {
        const cur = qc.getQueryData<Page>(officeKeys.msgs(room));
        if (document.hidden || !cur) { await sleep(1500); continue; }
        ctl = new AbortController();
        try {
          const j = await office<Page>(`rooms/${enc(room)}/wait?after=${cur.messages.at(-1)?.ts ?? 0}&max_s=25`, { signal: ctl.signal });
          if (stop) break;
          if (j.messages?.length) {
            qc.setQueryData<Page>(officeKeys.msgs(room), (old) => merge(old, j.messages));
            for (const k of [officeKeys.reads(room), officeKeys.looks(room), officeKeys.rooms, officeKeys.bots, ["channels"], ["duet-channels"]]) void qc.invalidateQueries({ queryKey: k });
          }
        } catch {
          if (!stop) await sleep(3000);
        }
      }
    })();
    return () => { stop = true; ctl?.abort(); };
  }, [room, qc]);

  const older = async () => {
    const cur = qc.getQueryData<Page>(officeKeys.msgs(room));
    const first = cur?.messages[0]?.ts;
    if (!first) return;
    const j = await office<Page>(`rooms/${enc(room)}/messages?n=100&before=${first}`);
    qc.setQueryData<Page>(officeKeys.msgs(room), (old) => ({ ...merge(old, j.messages || []), more: !!j.more }));
  };
  const r = roomsQ.data?.find((x) => x.id === room);
  return { r, list: peopleQ.data || [], msgs: msgsQ, reads: readsQ.data, reacts: reactsQ.data, looks: looksQ.data?.looks || {}, bots: botsQ.data || [], older };
}

type Item = { t: "msg"; m: Msg } | { t: "sys"; msgs: Msg[] } | { t: "band"; msgs: Msg[] };

/** 줄기(상태 답을 원 글 아래) + 형 보기 묶음(옛 office.html 23차 규칙 그대로) */
function hyungView(list: Msg[], r: OfficeRoom | undefined): Item[] {
  const ids = new Set(list.map((m) => m.id)), kids = new Map<string, Msg[]>();
  const hung = (m: Msg) => !!(m.reply_to && m.state && ids.has(m.reply_to));
  for (const m of list) if (hung(m)) kids.set(m.reply_to as string, [...(kids.get(m.reply_to as string) || []), m]);
  const all: Msg[] = [];
  for (const m of list) { if (hung(m)) continue; all.push(m); for (const k of kids.get(m.id) || []) all.push({ ...k, _thr: true }); }
  const meIds = new Set(all.filter((m) => m.kind === "human").map((m) => m.id));
  const toMe = (m: Msg) => meIds.has(m.reply_to || "") || meIds.has(m.origin || "") || (m.mention || []).includes("형");
  const showM = (m: Msg) => r?.id === "notice" || m.kind === "human" || toMe(m) || m.state === "decide" || (!!r?.with && m.who === r.with && !m.reply_to && !m.origin);
  const wakeM = (m: Msg) => m.kind === "system" && /러너/.test(m.who) && /^깸:/.test(m.text || "");
  const sysM = (m: Msg) => m.kind === "system";
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
  room: string; r?: OfficeRoom; list: OfficePerson[]; reads?: Reads; looks: Record<string, Look[]>; rx: Record<string, Record<string, string[]>>; quick: string[];
  sel: string; setSel: (id: string) => void; onReact: (id: string, e: string) => void; onReply: (m: Msg) => void; onJump: (who: string, line: string, id?: string) => void;
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
      {e ? <span className="text-xs text-muted-foreground">{[e.target, e.result, e.checked_at ? hm(Date.parse(e.checked_at)) : ""].filter(Boolean).join(" · ")}</span> : null}
    </span>
  );
}

function GotLine({ m, c }: { m: Msg; c: Ctx }) {
  const got = c.reads?.got || {}, at = c.reads?.got_at || {};
  const l = Object.keys(got).filter((n) => n !== m.who && (got[n] || []).includes(m.id)).map((n) => ({ who: n, at: at[n]?.[m.id] }));
  if (!l.length) return null;
  l.sort((a, b) => (a.at || Infinity) - (b.at || Infinity));
  return (
    <p className="mt-0.5 px-1 text-xs text-muted-foreground">
      가져감{" "}
      {l.map((x, i) => (
        <span key={x.who}>{i ? " · " : ""}<b className="font-medium text-foreground/80">{nmOf(c.list, x.who)}</b>{x.at ? <span className="tabular-nums"> {hm(x.at)}</span> : null}</span>
      ))}
    </p>
  );
}

function CheckLine({ m, c }: { m: Msg; c: Ctx }) {   // 형 21:19 = 말풍선 아래 「✓ (얼굴) 깃 3분 후」(체크 = 이 글을 맡아 책임짐)
  const l = (c.looks[m.id] || []).filter((x) => x && x.how === "check" && x.who !== m.who);
  if (!l.length) return null;
  return (
    <div className="mt-1 flex flex-col items-end gap-0.5">
      {l.map((x) => (
        <p key={x.who} className="inline-flex items-center gap-1 text-xs text-primary" title="체크 = 이 글을 맡아 책임짐">
          ✓ <FaceImg id={idOf(x.who, c.list)} size={16} /><b className="font-semibold">{nmOf(c.list, x.who)}</b><span className="tabular-nums text-muted-foreground">{afterTxt(x.at, m.ts)}</span>
        </p>
      ))}
    </div>
  );
}

function Reactions({ m, c, mine }: { m: Msg; c: Ctx; mine: boolean }) {
  const e = Object.entries(c.rx[m.id] || {}).filter(([, w]) => w && w.length);
  if (!e.length) return null;
  return (
    <div className={`mt-1 flex flex-wrap gap-1 ${mine ? "justify-end" : ""}`}>
      {e.map(([k, w]) => (
        <button key={k} type="button" title={w.map((x) => nmOf(c.list, x)).join(" · ")} onClick={() => c.onReact(m.id, k)}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${w.includes("형") ? "border-primary/50 bg-primary/10" : "border-border"}`}>
          {k}<span className="tabular-nums">{w.length}</span>
        </button>
      ))}
    </div>
  );
}

function Actions({ m, c, mine }: { m: Msg; c: Ctx; mine: boolean }) {   // 글 위 동작(마우스 올림 · 폰 = 글 누름) = 빠른 반응 · 답장 · 복사
  const [copied, setCopied] = useState(false);
  return (
    <div className={`mt-1 flex flex-wrap items-center gap-0.5 rounded-full border border-border bg-background/95 p-0.5 shadow-sm ${mine ? "self-end" : "self-start"}`} role="group" aria-label="글 동작">
      {c.quick.map((q) => (
        <button key={q} type="button" className="grid size-8 place-items-center rounded-full hover:bg-foreground/5" aria-label={`반응 ${q}`} onClick={() => c.onReact(m.id, q)}>{q}</button>
      ))}
      <button type="button" className="rounded-full px-2.5 py-1 text-xs hover:bg-foreground/5" onClick={() => c.onReply(m)}>답장</button>
      <button type="button" className="rounded-full px-2.5 py-1 text-xs hover:bg-foreground/5" onClick={() => { void navigator.clipboard?.writeText(String(m.text || "").replace(QUOTE, "")).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }); }}>{copied ? "복사함" : "복사"}</button>
    </div>
  );
}

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
            <a key={f.p} href={fileUrl(f.p)} target="_blank" rel="noopener" title={`${f.n} — 누르면 크게`} className="block overflow-hidden rounded-2xl border border-border">
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

/** 긴 글 접기 — 그려 보고 8줄 넘으면 접고 「더 보기」(ux 20:2x · 형 글·연 글 = 그대로) */
function Fold({ children, on }: { children: ReactNode; on: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [long, setLong] = useState(false), [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !on) return;
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 24;
    setLong(el.scrollHeight > lh * 8 + 4);
  }, [on, children]);
  return (
    <>
      <div ref={ref} className={long && !open ? "relative max-h-[12.5em] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]" : ""}>{children}</div>
      {long ? <button type="button" className="mt-1 self-start rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-foreground/5" onClick={() => setOpen((v) => !v)}>{open ? "접기" : "더 보기"}</button> : null}
    </>
  );
}

function Quote({ m, c }: { m: Msg; c: Ctx }) {
  const q = String(m.text || "").match(QUOTE);
  if (q) return <button type="button" className="mb-1 block max-w-full truncate rounded-md border-l-2 border-primary bg-muted px-2 py-1 text-left text-xs" title="그 글로" onClick={() => c.onJump(q[1], q[2])}><b>{q[1]}</b> · {q[2]}</button>;
  if (m.reply_to && !m._thr) return <button type="button" className="mb-1 block rounded-md border-l-2 border-primary bg-muted px-2 py-1 text-xs" onClick={() => c.onJump("", "", m.reply_to)}>↩ 원 글로</button>;
  return null;
}

function Body({ m }: { m: Msg }) {
  const text = String(m.text || "").replace(QUOTE, "");
  if (m.files?.length) return <Files m={m} />;
  if (EMO.test(text.trim())) return <span className="text-4xl leading-tight">{text.trim()}</span>;
  return <Streamdown components={markdownComponents}>{text}</Streamdown>;
}

function Line({ m, c }: { m: Msg; c: Ctx }) {
  const p = c.list.find((x) => x.who === m.who);
  const selected = c.sel === m.id;
  const toggle = () => c.setSel(selected ? "" : m.id);
  if (m.kind === "human") {
    const dmUnread = !!c.r?.with && !(c.looks[m.id] || []).some((x) => x.who === c.r?.with) && !(c.reads?.got?.[c.r.with] || []).includes(m.id);   // 형 23:39 = 개인방 형 글 카톡 「1」
    return (
      <MessageRow align="end" className={`group ${m._thr ? "pr-4" : ""}`} data-id={m.id}>
        <MessageContent className="items-end">
          <Quote m={m} c={c} />
          <StatePill m={m} />
          <div className="flex items-end gap-1.5">
            {dmUnread ? <b className="pb-1 text-xs font-semibold tabular-nums text-primary" aria-label={`${c.r?.with} 아직 안 읽음`}>1</b> : null}
            <Bubble align="end" variant="muted" onClick={toggle}>
              <BubbleContent>{m.files?.length ? <Files m={m} /> : <span className="whitespace-pre-wrap">{String(m.text || "").replace(QUOTE, "")}</span>}</BubbleContent>
            </Bubble>
          </div>
          <time className="px-1 text-xs tabular-nums text-muted-foreground" dateTime={new Date(m.ts).toISOString()}>{hm(m.ts)}</time>
          <GotLine m={m} c={c} />
          <Reactions m={m} c={c} mine />
          <CheckLine m={m} c={c} />
          {selected ? <Actions m={m} c={c} mine /> : null}
        </MessageContent>
      </MessageRow>
    );
  }
  return (
    <MessageRow align="start" className={`group ${m._thr ? "pl-6" : ""}`} data-id={m.id}>
      <div className="shrink-0 pt-0.5"><FaceImg id={idOf(m.who, c.list)} size={28} /></div>
      <MessageContent>
        <MessageHeader className="text-xs font-medium text-muted-foreground">
          {p?.name || m.who}
          {p?.role ? <span className="font-normal"> · {p.role}</span> : null}
          <span className="font-normal tabular-nums"> · {hm(m.ts)}</span>
        </MessageHeader>
        <Quote m={m} c={c} />
        <StatePill m={m} />
        <Bubble align="start" variant="ghost" className="w-full" onClick={toggle}>
          <BubbleContent className="flex w-full flex-col">
            <Fold on={!m.files?.length}><Body m={m} /></Fold>
          </BubbleContent>
        </Bubble>
        <GotLine m={m} c={c} />
        <Reactions m={m} c={c} mine={false} />
        <CheckLine m={m} c={c} />
        {selected ? <Actions m={m} c={c} mine={false} /> : null}
      </MessageContent>
    </MessageRow>
  );
}

function Band({ msgs, c }: { msgs: Msg[]; c: Ctx }) {
  const [open, setOpen] = useState(false);
  const ws = [...new Set(msgs.map((x) => x.who))];
  return (
    <div className="flex flex-col items-center gap-3">
      <button type="button" className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:bg-foreground/5" aria-expanded={open}
        aria-label={`${ws.map((w) => nmOf(c.list, w)).join(", ")} 이 포함된 메시지 ${msgs.length}개`} onClick={() => setOpen((v) => !v)}>
        <FaceStack ids={ws.slice(0, 3).map((w) => idOf(w, c.list))} size={18} />
        {ws.length > 3 ? <b className="font-semibold text-foreground">외 {ws.length - 3}</b> : null}
        {ws.length > 3 ? " · " : ""}메시지 {msgs.length}개
      </button>
      {open ? <div className="flex w-full flex-col gap-5 border-l-2 border-border pl-3 opacity-90">{msgs.map((m) => <Line key={m.id} m={m} c={c} />)}</div> : null}
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

const MODES: [string, string][] = [["", "보통"], ["suggest", "💡 제안"], ["decide", "⏳ 결정 필요"], ["verified", "✅ 검증"]];

export function OfficeChat({ room, lead }: { room: string; lead?: ReactNode }) {
  const qc = useQueryClient();
  const { r, list, msgs, reads, reacts, looks, bots, older } = useOfficeRoom(room);
  const [err, setErr] = useState("");
  const [sel, setSel] = useState("");
  const [reply, setReply] = useState<{ id: string; who: string; line: string } | null>(null);
  const [mode, setMode] = useState(""), [stOpen, setStOpen] = useState(false);   // 글 상태(💡·⏳·✅) = 평소엔 접힘(옛 화면 = 입력칸 옆 단추)
  const [evT, setEvT] = useState(""), [evR, setEvR] = useState("");
  const [rxOver, setRxOver] = useState<Record<string, Record<string, string[]>> | null>(null);
  const all = msgs.data?.messages || [];
  const items = useMemo(() => hyungView(all, r), [all, r]);
  const typing = useMemo(() => typingOf(all, r, bots, list), [all, r, bots, list]);
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
  const bots4 = useMemo(() => {
    const ids = r ? roomAgentIds(r, list) : [];
    return ids.map((id) => { const p = list.find((x) => idOf(x.who, list) === id); return { id, name: p?.name || p?.who || id, title: p?.role }; });
  }, [r, list]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const lastId = all.at(-1)?.id;
  useEffect(() => { if (lastId) endRef.current?.scrollIntoView({ block: "end" }); }, [lastId]);
  useEffect(() => {   // 본 데까지(안 읽음 점 · 기기끼리 · 서버 seen)
    const ts = all.at(-1)?.ts;
    if (ts) void office("seen", { method: "POST", body: JSON.stringify({ seen: { [room]: { ts, at: Date.now() } } }) }).then(() => qc.invalidateQueries({ queryKey: ["nomute", "seen"] })).catch(() => {});
  }, [room, lastId]);

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

  const c: Ctx = {
    room, r, list, reads, looks, rx: rxOver || reacts?.reactions || {}, quick: reacts?.quick?.length ? reacts.quick : ["👍", "❤️", "😂", "🎉", "🤔", "👀"],
    sel, setSel,
    onReact: (id, emoji) => { setSel(""); react.mutate({ id, emoji }); },
    onReply: (m) => { setSel(""); setReply({ id: m.id, who: nmOf(list, m.who), line: firstLine(m) }); },
    onJump: (who, line, id) => {
      const hit = id ? all.find((x) => x.id === id) : [...all].reverse().find((x) => nmOf(list, x.who) === who && firstLine(x).startsWith(line.replace(/…$/, "").slice(0, 20)));
      const el = hit && document.querySelector(`[data-id="${CSS.escape(hit.id)}"]`);
      if (el) { el.scrollIntoView({ block: "center", behavior: "smooth" }); (el as HTMLElement).animate?.([{ backgroundColor: "color-mix(in srgb, currentColor 12%, transparent)" }, { backgroundColor: "transparent" }], { duration: 1200 }); }
      else setErr("그 글이 지금 받은 글 안에 없어 — 위 「옛 글 더 보기」로");
    },
  };

  if (msgs.isPending) return null;
  if (msgs.isError) return <p className="p-8 text-sm text-destructive" role="alert">대화를 못 받았어 — {msgs.error.message}</p>;

  let prevTs = 0;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-3 py-6">
          {lead}
          {msgs.data?.more ? (
            <button type="button" className="mx-auto rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-foreground/5" onClick={() => void older()}>옛 글 더 보기</button>
          ) : null}
          {all.length === 0 ? <p className="text-center text-sm text-muted-foreground">아직 글 없음 — {r?.with ? `${nmOf(list, r.with)}에게 인사해 봐 · 보내면 예약(다음에 깰 때 봄) · !${nmOf(list, r.with)} = 바로 깨움` : "첫 글을 써 줘 · @이름 = 예약 · !이름 = 바로 깨움"}</p> : null}
          {items.map((it) => {
            const first = it.t === "msg" ? it.m : it.msgs[0];
            const sep = !first._thr && (!prevTs || dayKey(prevTs) !== dayKey(first.ts) || first.ts - prevTs >= SEP_MS);
            prevTs = (it.t === "msg" ? it.m : it.msgs[it.msgs.length - 1]).ts;
            const key = it.t === "msg" ? it.m.id : `${it.t}-${first.id}`;
            return (
              <div key={key} className="flex flex-col gap-5">
                {sep ? <p className="text-center text-xs font-medium text-muted-foreground">{sepLabel(first.ts)}</p> : null}
                {it.t === "msg" ? <Line m={it.m} c={c} /> : it.t === "band" ? <Band msgs={it.msgs} c={c} /> : (
                  <p className="text-center text-xs text-muted-foreground" title={it.msgs.map((y) => `${hm(y.ts)} ${y.who} · ${(y.text || "").split("\n")[0]}`).join("\n")}>
                    {it.msgs.at(-1)?.who} · {(it.msgs.at(-1)?.text || "").split("\n")[0].slice(0, 60)}
                    {it.msgs.length > 1 ? ` 외 ${it.msgs.length - 1}` : ""} · <span className="tabular-nums">{hm(it.msgs.at(-1)?.ts || 0)}</span>
                  </p>
                )}
              </div>
            );
          })}
          {typing.length ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
              <FaceImg id={idOf(typing[0], list)} size={24} />
              <span className="animate-pulse">{typing.map((n) => nmOf(list, n)).join("·")} 작업 중 · {WORK[Math.floor(Date.now() / 60e3) % WORK.length]}…</span>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
      </div>
      <div className="mx-auto w-full max-w-2xl shrink-0 px-3 pb-[var(--duet-tab-space,16px)]">
        {err ? <p className="pb-2 text-sm text-destructive" role="alert" onClick={() => setErr("")}>{err}</p> : null}
        {reply ? (
          <div className="mb-2 flex items-center gap-2 rounded-xl border-l-2 border-primary bg-muted px-3 py-1.5 text-xs">
            <span className="min-w-0 flex-1 truncate">↩ <b>{reply.who}</b> · {reply.line}</span>
            <button type="button" aria-label="답장 그만" className="px-1" onClick={() => setReply(null)}>×</button>
          </div>
        ) : null}
        {stOpen || mode ? (
          <div className="mb-2 flex flex-wrap items-center gap-1" role="radiogroup" aria-label="글 상태">
            {MODES.map(([v, label]) => (
              <button key={v || "plain"} type="button" role="radio" aria-checked={mode === v} onClick={() => { setMode(v); if (!v) setStOpen(false); }}
                className={`rounded-full border px-2.5 py-1 text-xs ${mode === v ? "border-primary bg-primary/10 font-semibold" : "border-border text-muted-foreground"}`}>{label}</button>
            ))}
          </div>
        ) : (
          <button type="button" className="mb-1 rounded-full px-2 py-0.5 text-xs text-muted-foreground hover:bg-foreground/5" onClick={() => setStOpen(true)}>글 상태 ▾</button>
        )}
        {mode === "verified" ? (
          <div className="mb-2 grid grid-cols-2 gap-2">
            <input className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm" placeholder="증거 대상(예: 라이브 회차)" value={evT} onChange={(e) => setEvT(e.target.value)} />
            <input className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm" placeholder="결과(예: 통과 · 2초)" value={evR} onChange={(e) => setEvR(e.target.value)} />
          </div>
        ) : null}
        <Composer
          agents={toAgentOptions(bots4)}
          channelId={room}
          onTextChange={presence?.onTextChange}
          className="mt-auto w-full"
          commands={[]}
          compact
          placeholder={r ? `${r.with ? `${nmOf(list, r.with)}에게` : `${r.name}에`} 메시지 보내기` : "메시지 보내기"}
          autoFocus
          onSubmit={async (draft) => {
            const raw = draft.text.trim();
            const ids = (draft.attachments || []).map((a) => (a.metadata as { attachmentId?: string } | undefined)?.attachmentId).filter((x): x is string => !!x);
            if (!raw && !ids.length) return;
            const text = raw && reply && !mode ? `↩ ${reply.who}: ${reply.line}\n${raw}` : raw;
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
                if (mode) { body.state = mode; if (reply?.id) body.reply_to = reply.id; if (mode === "verified" && (evT || evR)) body.evidence = { target: evT, result: evR, checked_at: new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 19) + "+09:00" }; }
                const j = await office<{ message?: Msg }>(`rooms/${enc(room)}/messages`, { method: "POST", body: JSON.stringify(body) });
                if (j.message) qc.setQueryData<Page>(officeKeys.msgs(room), (old) => merge(old, [j.message as Msg]));
              }
              setReply(null); setMode(""); setStOpen(false); setEvT(""); setEvR("");
              void qc.invalidateQueries({ queryKey: officeKeys.rooms });
            } catch (e) {
              setErr(`못 보냈어 — ${e instanceof Error ? e.message : String(e)} · 글은 입력칸에 그대로`);
              throw e;
            }
          }}
        />
      </div>
    </div>
  );
}

// 서랍 「알림메세지」 = 에디터 알림메세지 창(/?pop=msgs · viewer-src/27-demoStaleMsgs.part openMsgbox · renderMsgList · openMsgDetail)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   자료 = 원본 allMsgs 그대로: 서버 메시지 /messages.json(24시간 안 · 빌드가 messages/*.md 를 합친 것) + 화면 계산 넷(./msgs-draw = 원본 줄 그대로 · 수집 고장 · 인구통계 기준일 · 지진 · 화재)
//     · 계산 재료 = 원본이 읽는 그 파일들(트렌드 /api/trends → /sns_trends.json · 채널 /api/chan?f=ig|fb) · 차례 = 원본 unshift 차례(화재 → 지진 → 인구통계 → 수집 고장 → 서버 메시지)
//   줄 = 시간 | 구분(시스템 · 경고 · 알림) | 내용 60자 | ✓(시스템 = 확인) · 휴지통(지우기) · id 없는 상주 알림 = 못 지움 · 누르면 전문 + 조치 단추(있으면)
//   지움·읽음 = 원본과 같은 열쇠(이 기기 nomute_msg_dismissed · nomute_msg_read) ∪ 계정(/toast-seen.json md · mr 축 · 보냄 = POST /api/seen) = 폰·PC·에디터가 같이 씀 · 창을 열면 보이는 것 전부 읽음(원본 msgMarkAllRead)
//   조치 = 다시 받아오기(sns-recollect · /api/snsretry · 러너 1~2분) · 안전 탭 열기(quake-go → 앱 「SNS 전체」) · 다시 로그인(relogin = 새로 고침) · 그 밖(옛 화면 반영 · 데이터 재시도)은 에디터 화면 몫이라 단추 없음
//   뺀 것 = 맞춤법 검사기 상태(healthMsg · 에디터 교정기 전용) · 문제 HTML 받기(클로드 전달용 · 에디터에 그대로)
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getJson, useGo } from "./news-data";
import { sysMsgs } from "./msgs-draw";
import { Pane } from "./pane";
import { YICO } from "./yeta-icons";

type Msg = { id?: string; t?: number; ts?: string; text?: string; level?: string; action?: string; _sys?: boolean; _health?: boolean };
type Seen = { md?: string[]; mr?: string[] };

const KEY_DIS = "nomute_msg_dismissed", KEY_READ = "nomute_msg_read";   // 원본 MSG_DISMISS_KEY · MSG_READ_KEY
const lsSet = (k: string): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(k) || "[]") as string[]); } catch { return new Set(); } };
const lsPut = (k: string, s: Set<string>) => { try { localStorage.setItem(k, JSON.stringify([...s])); } catch { /* 사생활 창 */ } };
const postSeen = (axis: "md" | "mr", ids: string[]) => { if (ids.length) void fetch("/api/seen", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ [axis]: ids.slice(0, 50) }) }).catch(() => {}); };   // 원본 postSeenIds(50개씩)
async function firstJson<T>(urls: string[], ok: (v: T) => boolean): Promise<T | null> {
  for (const u of urls) { try { const v = await getJson<T>(u); if (v && ok(v)) return v; } catch { /* 다음 길 */ } }
  return null;
}
const ago = (m: Msg) => {   // 원본 msgAgo(qAgo · ts 문자열은 KST)
  let t = m.t || 0;
  if (!t && m.ts) { const s = String(m.ts).replace(" ", "T"), p = Date.parse(s + (/([+-]\d{2}:?\d{2}|Z)$/i.test(s) ? "" : "+09:00")); if (Number.isNaN(p)) return String(m.ts); t = p; }
  if (!t) return "";
  const mi = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mi < 1) return "방금"; if (mi < 60) return `${mi}분 전`;
  const h = mi / 60; if (h < 24) return `${Math.floor(h)}시간 전`;
  const d = Math.floor(h / 24); return d < 7 ? `${d}일 전` : `${Math.floor(d / 7)}주일 전`;
};
const kindOf = (m: Msg) => (m._health || m._sys ? { t: "시스템", c: "sys" } : m.level === "warn" || String(m.id || "").startsWith("fail-") ? { t: "경고", c: "warn" } : { t: "알림", c: "info" });   // 원본 msgKind

const msgsQuery = queryOptions({
  queryKey: ["nomute", "msgbox"], staleTime: 30_000, refetchInterval: 120_000,
  queryFn: async () => {
    const [raw, trends, ig, fb, seen] = await Promise.all([
      getJson<Msg[]>(`/messages.json?_=${Date.now()}`).catch(() => [] as Msg[]),
      firstJson<{ updated?: string }>([`/api/trends?_=${Date.now()}`, `/sns_trends.json?t=${Date.now()}`], (v) => !!v.updated),   // 원본 loadTrends 차례(updated 없으면 다음 길)
      firstJson<{ generated_kst?: string }>(["/api/chan?f=ig", `/insta_data.json?ts=${Date.now()}`], (v) => !!v.generated_kst),
      firstJson<{ generated_kst?: string }>(["/api/chan?f=fb", `/fb_data.json?ts=${Date.now()}`], (v) => !!v.generated_kst),
      getJson<Seen>(`/toast-seen.json?_=${Date.now()}`).catch(() => ({}) as Seen),
    ]);
    const cut = Date.now() - 24 * 36e5;   // 원본 loadMessages = 24시간 지난 것 숨김
    const msgs = (Array.isArray(raw) ? raw : []).filter((m) => m && (m.t == null || m.t >= cut));
    const g = sysMsgs(trends, ig, fb) as Record<"sys" | "demo" | "quake" | "fire", Msg[]>;
    const all = [...g.fire].reverse().concat([...g.quake].reverse(), [...g.demo].reverse(), [...g.sys].reverse(), msgs);   // 원본 allMsgs = 서버 목록 앞에 축마다 unshift(뒤에 넣은 축이 맨 위)
    return { all, md: seen.md || [], mr: seen.mr || [] };
  },
});

function Action({ m, go }: { m: Msg; go: (p: string) => void }) {
  const [st, setSt] = useState<"" | "busy" | "ok" | string>("");
  if (m.action === "sns-recollect") {   // 원본 snsRecollect
    const run = async () => {
      setSt("busy");
      try { const r = await fetch("/api/snsretry", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: "{}" }); const d = await r.json().catch(() => ({})) as { ok?: boolean; error?: string }; setSt(r.ok && d.ok ? "ok" : d.error || "요청 실패 — 잠시 뒤 다시"); }
      catch { setSt("네트워크 오류 — 다시"); }
    };
    return <button type="button" className={`ypc-go nm-msg-act${st === "ok" ? " ok" : ""}`} disabled={st === "busy" || st === "ok"} onClick={run}>{st === "busy" ? "요청 중…" : st === "ok" ? "요청됨 · 1~2분 뒤 갱신돼" : st || "다시 받아오기"}</button>;
  }
  if (m.action === "quake-go") return <button type="button" className="ypc-go nm-msg-act" onClick={() => go("/trend")}>안전 탭 열기</button>;   // 원본 goDisSec → 앱 「SNS 전체」(재난문자 칸)
  if (m.action === "relogin") return <button type="button" className="ypc-go nm-msg-act" onClick={() => location.reload()}>다시 로그인</button>;
  return null;
}

export function MsgsModal() {
  const go = useGo(), q = useQuery(msgsQuery);
  const [, bump] = useState(0), [open, setOpen] = useState<Msg | null>(null), [gone, setGone] = useState("");
  const dis = new Set([...lsSet(KEY_DIS), ...(q.data?.md || [])]), read = new Set([...lsSet(KEY_READ), ...(q.data?.mr || [])]);
  const list = (q.data?.all || []).filter((m) => !(m.id && dis.has(String(m.id))));
  useEffect(() => {   // 원본 msgMarkAllRead — 창을 열어 보이는 것 = 읽음(이 기기 + 계정)
    if (!q.data) return;
    const r = lsSet(KEY_READ), fresh: string[] = [];
    for (const m of list) if (m.id && !r.has(String(m.id))) { r.add(String(m.id)); if (!(q.data.mr || []).includes(String(m.id))) fresh.push(String(m.id)); }
    lsPut(KEY_READ, r); postSeen("mr", fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.data]);
  const remove = (m: Msg) => {   // 원본 msgDismiss + animateRowOut(.24s 접힘)
    const id = String(m.id); setGone(id);
    window.setTimeout(() => { const s = lsSet(KEY_DIS); s.add(id); lsPut(KEY_DIS, s); postSeen("md", [id]); setGone(""); bump((n) => n + 1); }, 260);
  };
  const Chev = () => <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} />;
  const unread = list.filter((m) => m.id && !read.has(String(m.id))).length;
  return (
    <Pane title="알림메세지">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-q nm-msg">
          <span className="ycd-nm yset-ttl">알림메세지</span>
          {open || unread ? <div className="nm-bar">{open ? <button type="button" className="nm-msg-back" onClick={() => setOpen(null)} aria-label="목록으로"><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} />목록</button> : <i className="nm-q-busy">새 {unread}</i>}</div> : null}   {/* 단추·새 수 = 카드 머리 밖(모달 안은 카드 머리 숨김 · yeta-settings.css) */}
          {open ? (
            <div className="nm-msg-detail">
              <div className="hd"><b className={`mk ${kindOf(open).c}`}>{kindOf(open).t}</b><span className="qt">{ago(open)}</span></div>
              <p className="bd">{open.text || "(내용 없음)"}</p>
              <Action m={open} go={go} />
            </div>
          ) : q.isLoading ? <p className="nm-chan-msg">알림 읽는 중…</p> : !list.length ? <p className="nm-chan-msg">새 메시지 없음</p> : (
            <div className="nm-q-list" role="list">
              {list.map((m, i) => {
                const k = kindOf(m), body = m.text || "", cp = [...body], short = cp.length > 60 ? cp.slice(0, 60).join("") + "…" : body, canDel = !!m.id && !m._health;
                return (
                  <div key={(m.id || "") + i} role="listitem" className={`nm-q-row nm-msg-row${m.level === "warn" || m._health ? " warn" : ""}${gone && gone === String(m.id) ? " out" : ""}`} onClick={() => setOpen(m)}>
                    <span className="qt">{ago(m)}</span>
                    <span className="qs"><b className={`mk ${k.c}`}>{k.t}</b></span>
                    <span className="qm" title={body}><i>{short}</i></span>
                    <span className="qa">{canDel
                      ? <button type="button" className={`go ${m._sys ? "ok" : "gray"}`} title={m._sys ? "확인" : "삭제"} aria-label={m._sys ? "확인" : "삭제"} onClick={(e) => { e.stopPropagation(); remove(m); }}>{m._sys ? "✓" : "지움"}</button>
                      : <button type="button" className="go gray" disabled title="상주 알림 — 해결되면 저절로 사라져요">—</button>}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="ypc-acts nm-chan-acts"><button type="button" className="ypc-go" onClick={() => go("/web?u=" + encodeURIComponent("/?pop=msgs&inapp=1"))}>에디터 알림함 <Chev /></button></div>
        </div>
      </div>
    </Pane>
  );
}

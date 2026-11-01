// 서랍 「구독 기기」 = 에디터 설정 ▸ 구독 기기 창(/?pop=push · viewer-src/43-memo.part openDevpop · renderDevList · nmDevName)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   같은 길 = POST /api/push {action: list | toggle | remove, endpoint: 주소 꼬리 24자} · 열쇠(keys)는 서버가 안 내려줌 = 화면은 꼬리 24자로만 기기를 지목
//   줄 = 등록일 | 기기(모델 · OS · 브라우저 = 등록 때 받아 둔 글에서만 뽑음 · 원본 nmDevName 그대로) · 어느 앱 · 이 기기 | 알림 중단·재개 | 지움(두 번) · 최근 등록이 위
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./push-devs.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pane } from "./pane";

type Dev = { id: string; ts?: number; ua?: string; hint?: { plat?: string; pv?: string; model?: string; br?: string } | null; off?: boolean; app?: string; host?: string };
const KEY = ["nomute", "push-devs"] as const;
const BR: [string, string][] = [["SamsungBrowser", "삼성 인터넷"], ["Samsung Internet", "삼성 인터넷"], ["Edg", "엣지"], ["Microsoft Edge", "엣지"], ["OPR", "오페라"], ["Opera", "오페라"], ["Whale", "웨일"], ["FxiOS", "파이어폭스"], ["Firefox", "파이어폭스"], ["CriOS", "크롬"], ["Google Chrome", "크롬"], ["Chrome", "크롬"], ["Chromium", "크로미엄"], ["Safari", "사파리"]];   // 순서가 계약 = 삼성·엣지 글은 크롬 글을 같이 담음(먼저 만나는 쪽이 답 · 원본 _DEV_BR)
const PLAT: [string, string][] = [["Android", "안드로이드"], ["iOS", "아이폰"], ["iPadOS", "아이패드"], ["Windows", "윈도우"], ["macOS", "맥"], ["Chrome OS", "크롬북"], ["Chromium OS", "크롬북"], ["Linux", "리눅스"]];
const HOST: Record<string, string> = { "fcm.googleapis.com": "크롬 계열", "android.googleapis.com": "크롬 계열", "web.push.apple.com": "사파리(애플)", "updates.push.services.mozilla.com": "파이어폭스" };
const ko = (tbl: [string, string][], v?: string) => { const t = String(v || ""); for (const [k, k2] of tbl) if (t.indexOf(k) >= 0) return k2; return ""; };
const major = (v?: string) => String(v || "").split(".")[0] || "";
function devName(it: Dev) {   // 원본 nmDevName 그대로 — 「SM-S928N · 안드로이드 14 · 크롬 126」 · 값은 다 등록 때 받아 둔 글에서(모델 사전 창작 0)
  const ua = String(it.ua || ""), hn = it.hint || null, out: string[] = [];
  let model = hn?.model || "", os = "", br = "";
  if (hn?.plat) os = ((ko(PLAT, hn.plat) || hn.plat) + " " + major(hn.pv)).trim();
  if (hn?.br) { const k = ko(BR, hn.br); br = k ? (k + " " + major((hn.br.match(/(\d[\d.]*)\s*$/) || [])[1])).trim() : hn.br; }
  if (!model) { const m = ua.match(/Android[^;)]*;\s*([^;)]+?)(?:\s+Build)?\)/); if (m && m[1] && m[1].trim() !== "wv") model = m[1].trim(); }
  if (!os) {
    let m: RegExpMatchArray | null;
    if ((m = ua.match(/Android\s+([\d.]+)/))) os = "안드로이드 " + major(m[1]);
    else if ((m = ua.match(/(iPhone|iPad);.*?OS\s+([\d_]+)/))) os = (m[1] === "iPad" ? "아이패드 " : "아이폰 ") + major(m[2].replace(/_/g, "."));
    else if (/Windows NT/.test(ua)) os = "윈도우";
    else if (/Mac OS X/.test(ua)) os = "맥";
    else if (/CrOS/.test(ua)) os = "크롬북";
    else if (/Linux/.test(ua)) os = "리눅스";
  }
  if (!br) for (const [k, k2] of BR) { const m = ua.match(new RegExp(k + "\\/(\\d+)")); if (m) { br = k2 + " " + m[1]; break; } if (ua.indexOf(k) >= 0) { br = k2; break; } }
  if (/^사파리/.test(br)) { const v = ua.match(/Version\/(\d+)/); br = "사파리" + (v ? " " + v[1] : ""); }   // 사파리만 Safari/604.1 = 엔진 번호 · 판은 Version/18.5 쪽(원본 실측)
  if (model) out.push(model);
  if (os) out.push(os);
  if (br) out.push(br);
  if (out.length) return out.join(" · ");
  const h = HOST[it.host || ""] || "";   // 값을 안 받아 둔 옛 기기 = 주소 계열까지가 한계
  return h ? "이름 미상 · " + h : "이름 미상";
}
const day = (ts?: number) => { const d = ts ? new Date(ts) : null; return d && !Number.isNaN(+d) ? `${d.getMonth() + 1}. ${d.getDate()}.` : "-"; };   // 원본 kwDate
const api = async (body: Record<string, string>) => {
  const r = await fetch("/api/push", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || "서버 응답 " + r.status);
  return j as { items?: Dev[]; ok?: boolean };
};

export function PushDevsModal() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, staleTime: 15_000, queryFn: async () => ((await api({ action: "list" })).items || []).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0)) });   // 최근 등록이 위
  const [me, setMe] = useState("");
  useEffect(() => { (async () => { try { const reg = await navigator.serviceWorker?.getRegistration(); const s = reg && (await reg.pushManager.getSubscription()); setMe(s ? String(s.endpoint).slice(-24) : ""); } catch { setMe(""); } })(); }, []);   // 이 기기 = 지금 구독 주소 꼬리
  const [busy, setBusy] = useState(""), [note, setNote] = useState(""), [arm, setArm] = useState("");
  const items = q.data || [];
  const act = async (action: "toggle" | "remove", it: Dev) => {
    setBusy(it.id); setNote("");
    try {
      await api({ action, endpoint: it.id });
      qc.setQueryData<Dev[]>(KEY, (a) => (a || []).flatMap((x) => (x.id !== it.id ? [x] : action === "remove" ? [] : [{ ...x, off: !x.off }])));
    } catch (e) { setNote((action === "remove" ? "지우지 못했어 — " : "바꾸지 못했어 — ") + ((e as Error).message || "연결 확인")); }
    finally { setBusy(""); }
  };
  const del = (it: Dev) => {   // 지움 = 두 번 누름(메모·센서와 같음 · 원본은 한 번) · 그 기기에서 다시 켜면 새로 등록됨
    if (arm !== it.id) { setArm(it.id); window.setTimeout(() => setArm((a) => (a === it.id ? "" : a)), 3000); return; }
    setArm(""); void act("remove", it);
  };
  return (
    <Pane title="구독 기기">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo nm-devs">
          <span className="ycd-nm yset-ttl">구독 기기</span>
          {note ? <p className="nm-chan-msg" role="status">{note}</p> : null}
          {q.isLoading ? <p className="nm-chan-msg">불러오는 중…</p> : q.isError ? <p className="nm-chan-msg" role="alert">목록을 못 불러왔어 — 잠시 뒤 다시 열어 줘</p> : !items.length ? <p className="nm-chan-msg">알림을 켠 기기 없음</p> : (
            <div className="nm-q-list" role="list">
              {items.map((it) => {
                const nm = devName(it), here = !!me && it.id === me;
                return (
                  <div key={it.id} role="listitem" className={`nm-q-row nm-memo-row nm-dev-row${it.off ? " off" : ""}`}>
                    <span className="qt">{day(it.ts)}</span>
                    <span className="qm" title={nm}><i>{nm}</i><small>{it.app === "office" ? "사무실 앱" : "에디터"}{here ? " · 이 기기" : ""}{it.off ? " · 알림 멈춤" : ""}</small></span>
                    <span className="qa"><button type="button" className={`go ${it.off ? "" : "gray"}`} aria-pressed={!!it.off} aria-label={it.off ? "알림 다시 켜기 — 이 기기에도 보냄" : "알림 멈추기 — 이 기기엔 안 보냄"} disabled={busy === it.id} onClick={() => void act("toggle", it)}>{it.off ? "켜기" : "멈춤"}</button></span>
                    <span className="qa"><button type="button" className={`go ${arm === it.id ? "arm" : "gray"}`} aria-label={arm === it.id ? "한 번 더 누르면 지움" : "구독 지우기"} disabled={busy === it.id} onClick={() => del(it)}>{arm === it.id ? "지울까?" : "지움"}</button></span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Pane>
  );
}

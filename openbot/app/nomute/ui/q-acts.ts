// 진행 카드 실패 「재시도」 · 「없애기」 — 옛 에디터 피드 맨 위 진행 카드(viewer qPrevHtml · qp-redo · qp-dismiss = qPrevRetry · qfMarkSeenOne)를 앱 「뉴스 요약」(./feed.tsx) 판 안에서 그 건만
//   (team-4 4′ 피드 목록 쓰기 · 형 11-10 12:40 「에디터도 정원에 완벽하게 녹여」 · 12:17 「기존 앱 화면으로 가서 받는게 아니라 자체로」)
//   재시도 = 요약요청 → api/askget 전문 복원 → 앱 「요약 요청」 미리 채움(보내기는 형 · retryOf = 다시 보내면 옛 실패 줄 지움 · ./queue.tsx 와 같은 길)
//          · 링크 = api/pick 다시 분석(옛 qPickRetry 와 같은 글 · 두 번 눌러야 나감 = TaskCard) · 보내면 옛 실패 카드는 확인 처리(옛과 같음 = 새 접수분이 이어받음)
//   없애기 = 확인한 실패 = 이 기기(nomute_qfail_seen · 옛 QF_SEEN_KEY · 300개 굴림) ∪ 계정(POST /api/seen qf) → pickQ 가 안 고름 = 판에서 빠짐
import type { QItem } from "./task-panel";

const QF_KEY = "nomute_qfail_seen";
export const qRetryUrl = (it: QItem) => (/^https?:\/\//i.test(String(it.key || it.alt1 || "")) ? String(it.key || it.alt1) : "");   // 옛 qPickRetry u = key 먼저
export const qCanRetry = (it: QItem) => it.via === "요약요청" || !!qRetryUrl(it);   // 옛 qpCanRetry

/** 실패 한 건 확인(옛 qfMarkSeenOne) — 이 기기 바로 · 계정은 보내 두고 안 기다림(옛 fail-soft) */
export function qfSeenOne(id?: string) {
  const s = String(id || "");
  if (!s) return;
  let a: string[] = [];
  try { const v = JSON.parse(localStorage.getItem(QF_KEY) || "[]"); if (Array.isArray(v)) a = v.map(String); } catch { /* 깨진 값 = 새로 */ }
  if (a.includes(s)) return;   // 옛 qfMarkSeenOne — 이미 확인한 건 다시 안 보냄
  a.push(s); try { localStorage.setItem(QF_KEY, JSON.stringify(a.slice(-300))); } catch { /* 사생활 창 */ }
  void fetch("/api/seen", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ qf: [s] }) }).catch(() => {});
}

/** 실패 한 건 다시(옛 qPrevRetry) — 빈 글 = 보냄(요약요청은 「요약 요청」 창으로 감) · 글 = 못 보낸 까닭 */
export async function qRetry(it: QItem, go: (p: string) => void): Promise<string> {
  if (it.via === "요약요청") {
    let text = "";
    try { const r = await fetch(`/api/askget?id=${encodeURIComponent(String(it.id || ""))}&_=${Date.now()}`, { credentials: "same-origin" }); if (r.ok) text = String(((await r.json()) as { text?: string }).text || ""); } catch { /* 복원 못 하면 빈 칸 */ }
    try { sessionStorage.setItem("nm_ask_prefill", JSON.stringify({ text, link: "", retryOf: String(it.id || "") })); } catch { /* 사생활 창 */ }
    qfSeenOne(it.id);
    go("/ask");
    return "";
  }
  const url = qRetryUrl(it);
  if (!url) return "원문 링크가 없어서 다시 분석을 못 해";
  try {
    const r = await fetch("/api/pick", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, title: it.title || "", alt: it.alt1 && it.alt1 !== url ? [it.alt1] : [] }) });
    const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!r.ok || !d.ok) return `다시 분석 못 보냄 — ${d.error || `서버 ${r.status}`}`;
  } catch (e) { return `다시 분석 못 보냄 — ${(e as Error).message || "연결 끊김"}`; }
  qfSeenOne(it.id);
  return "";
}

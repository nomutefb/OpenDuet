// 진행 카드 실패 「재시도」 · 「없애기」(ui/q-acts.ts · team-4 4′ 피드 목록 쓰기) — 옛 qpCanRetry · qPrevRetry · qfMarkSeenOne 과 같은 글이 나가는지
import test from "node:test";
import assert from "node:assert/strict";
import { brkNo, qCanRetry, qfSeenOne, qRetry } from "../ui/q-acts.ts";

type Call = { url: string; body?: unknown };
function rig(answer: (url: string) => { status?: number; json?: unknown }) {
  const calls: Call[] = [], store = new Map<string, string>(), sess = new Map<string, string>();
  const g = globalThis as unknown as Record<string, unknown>;
  g.localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
  g.sessionStorage = { getItem: (k: string) => sess.get(k) ?? null, setItem: (k: string, v: string) => void sess.set(k, v) };
  g.fetch = async (u: string, init?: { body?: string }) => {
    calls.push({ url: u, body: init?.body ? JSON.parse(init.body) : undefined });
    const a = answer(u), st = a.status ?? 200;
    return { ok: st >= 200 && st < 300, status: st, json: async () => a.json ?? {} };
  };
  return { calls, store, sess };
}

test("다시 할 수 있음 = 요약요청이거나 링크(key 먼저 · alt1) · 링크 없는 건 안 됨", () => {
  assert.equal(qCanRetry({ via: "요약요청" }), true);
  assert.equal(qCanRetry({ key: "https://a.kr/1" }), false);   // 링크 「다시 분석」(api/pick) = 걷음(형 11-18 「다 지움(의류수거함)」)
  assert.equal(qCanRetry({ alt1: "http://b.kr/2" }), false);
  assert.equal(qCanRetry({ key: "abc" }), false);
});

test("없애기 = 이 기기 nomute_qfail_seen 에 한 번만 + 계정 /api/seen qf", async () => {
  const { calls, store } = rig(() => ({ json: { ok: true } }));
  qfSeenOne("q1"); qfSeenOne("q1");
  assert.deepEqual(JSON.parse(store.get("nomute_qfail_seen") || "[]"), ["q1"]);
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(calls.filter((c) => c.url === "/api/seen").length, 1);   // 두 번째는 안 보냄(옛 qfMarkSeenOne)
  assert.deepEqual(calls[0].body, { qf: ["q1"] });
});

test("링크 재시도 = 걷음(api/pick 0) · 까닭 글 · 실패 카드는 남김", async () => {
  const { calls, store } = rig(() => ({ json: { ok: true } }));
  const why = await qRetry({ id: "p9", key: "https://a.kr/1", title: "제목" }, () => assert.fail("요약 요청 창으로 가면 안 됨"));
  assert.match(why, /요약 요청/);
  assert.equal(calls.filter((c) => c.url === "/api/pick").length, 0);
  assert.equal(store.get("nomute_qfail_seen"), undefined);
});

test("요약요청 재시도 = askget 전문 복원 → 「요약 요청」 미리 채움(retryOf) → /ask 로 감 · 보내기는 형", async () => {
  const { sess } = rig((u) => (u.startsWith("/api/askget") ? { json: { text: "원래 글" } } : { json: {} }));
  let went = "";
  const why = await qRetry({ id: "a7", via: "요약요청" }, (p) => { went = p; });
  assert.equal(why, "");
  assert.equal(went, "/ask");
  assert.deepEqual(JSON.parse(sess.get("nm_ask_prefill") || "{}"), { text: "원래 글", link: "", retryOf: "a7" });
});

test("긴급 아님 = api/rate reason brkno · id = url(기사엔 id 없음) · 제목 그대로(brk_misfire 가 제목으로 묶음) · 거절이면 까닭", async () => {
  const { calls } = rig((u) => (u === "/api/rate" ? { json: { ok: true } } : { json: {} }));
  assert.equal(await brkNo({ url: "https://a.kr/9", title: "[속보] 무슨 일" }), "");
  assert.deepEqual(calls[0].body, { id: "https://a.kr/9", url: "https://a.kr/9", title: "[속보] 무슨 일", score: 0, picked: false, dismissed: false, acked: false, action: "", reason: "brkno" });
  rig(() => ({ status: 401 }));
  assert.equal(await brkNo({ title: "제목만" }), "서버 401");
});

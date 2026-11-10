// 진행 카드 실패 「재시도」 · 「없애기」(ui/q-acts.ts · team-4 4′ 피드 목록 쓰기) — 옛 qpCanRetry · qPrevRetry · qfMarkSeenOne 과 같은 글이 나가는지
import test from "node:test";
import assert from "node:assert/strict";
import { qCanRetry, qfSeenOne, qRetry, qRetryUrl } from "../ui/q-acts.ts";

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
  assert.equal(qCanRetry({ key: "https://a.kr/1" }), true);
  assert.equal(qCanRetry({ alt1: "http://b.kr/2" }), true);
  assert.equal(qCanRetry({ key: "abc" }), false);
  assert.equal(qRetryUrl({ key: "https://a.kr/1", alt1: "https://b.kr/2" }), "https://a.kr/1");
});

test("없애기 = 이 기기 nomute_qfail_seen 에 한 번만 + 계정 /api/seen qf", async () => {
  const { calls, store } = rig(() => ({ json: { ok: true } }));
  qfSeenOne("q1"); qfSeenOne("q1");
  assert.deepEqual(JSON.parse(store.get("nomute_qfail_seen") || "[]"), ["q1"]);
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(calls.filter((c) => c.url === "/api/seen").length, 1);   // 두 번째는 안 보냄(옛 qfMarkSeenOne)
  assert.deepEqual(calls[0].body, { qf: ["q1"] });
});

test("링크 재시도 = api/pick 옛 글 그대로 · 보내지면 옛 실패는 확인 처리", async () => {
  const { calls, store } = rig((u) => (u === "/api/pick" ? { json: { ok: true } } : { json: {} }));
  const why = await qRetry({ id: "p9", key: "https://a.kr/1", alt1: "https://b.kr/2", title: "제목" }, () => assert.fail("요약 요청 창으로 가면 안 됨"));
  assert.equal(why, "");
  const pick = calls.find((c) => c.url === "/api/pick");
  assert.deepEqual(pick?.body, { url: "https://a.kr/1", title: "제목", alt: ["https://b.kr/2"] });
  assert.deepEqual(JSON.parse(store.get("nomute_qfail_seen") || "[]"), ["p9"]);
});

test("링크 재시도 거절 = 까닭 글 · 실패 카드는 남김", async () => {
  const { store } = rig(() => ({ status: 429, json: { ok: false, error: "잠시 뒤" } }));
  const why = await qRetry({ id: "p8", key: "https://a.kr/1" }, () => {});
  assert.match(why, /잠시 뒤/);
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

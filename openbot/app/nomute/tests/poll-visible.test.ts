// 47) 숨은 탭 조회 멈춤 · 다시 보이면 한 번(data/poll-visible.ts · 봄 11-09 10:59 · 깃)
import test from "node:test";
import assert from "node:assert/strict";
import { BACK_MS, pollVisible, polls } from "../data/poll-visible.ts";

function fakes() {
  let opts: Record<string, unknown> = { queries: { retry: 1, refetchOnWindowFocus: false } };
  const calls: unknown[] = [];
  const qc = { getDefaultOptions: () => opts, setDefaultOptions: (o: Record<string, unknown>) => { opts = o; }, refetchQueries: async (f: unknown) => { calls.push(f); } };
  const ls = new Set<() => void>();
  const doc = { hidden: false, addEventListener: (_: string, f: () => void) => ls.add(f), removeEventListener: (_: string, f: () => void) => ls.delete(f) };
  const flip = (h: boolean) => { doc.hidden = h; ls.forEach((f) => f()); };
  return { qc, doc, flip, calls, opts: () => opts };
}

test("기본값 = 숨은 탭 주기 조회 안 돎 · 원래 칸 그대로", () => {
  const f = fakes();
  pollVisible(f.qc as never, f.doc as never, () => 0);
  assert.deepEqual(f.opts().queries, { retry: 1, refetchOnWindowFocus: false, refetchIntervalInBackground: false });
});

test("30초 넘게 숨었다 보이면 한 번 새로 · 짧게 = 0", () => {
  const f = fakes();
  let t = 0;
  pollVisible(f.qc as never, f.doc as never, () => t);
  f.flip(true); t = BACK_MS - 1; f.flip(false);
  assert.equal(f.calls.length, 0);
  f.flip(true); t += BACK_MS; f.flip(false);
  assert.equal(f.calls.length, 1);
  assert.equal((f.calls[0] as { type: string }).type, "active");
});

test("새로 = 주기 조회 걸린 것만", () => {
  assert.equal(polls({ observers: [{ options: { refetchInterval: 60_000 } }] }), true);
  assert.equal(polls({ observers: [{ options: {} }] }), false);
  assert.equal(polls({}), false);
});

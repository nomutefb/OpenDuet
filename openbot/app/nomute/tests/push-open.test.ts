// 알림 눌러 열림 = 요약 대기열 · 기사 목록 바로 다시(번개 11-20 03:54 「알림 눌러 앱이 열릴 땐 /api/pending · /articles.json 을 기억(45 · 60초) 말고 바로 한 번 다시 받게」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PUSH_OPEN, pushOpened } from "../data/push-open";

test("nm-push-open = 대기열 둘 · 기사 목록 invalidate", () => {
  const got: unknown[] = [];
  pushOpened({ invalidateQueries: ((o: { queryKey: unknown }) => { got.push(o.queryKey); return Promise.resolve(); }) as never });
  assert.deepEqual(got, [["nomute", "split-pending"], ["nomute", "feed-pending"], ["nomute", "news-list"]]);
  assert.equal(PUSH_OPEN, "nm-push-open");
});

test("서비스 워커 = 떠 있던 창을 옮긴 뒤 그 창에 nm-push-open · 앱 = 받으면 pushOpened", () => {
  const sw = readFileSync(new URL("../sw.js", import.meta.url), "utf8"), main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
  assert.match(sw, /const c = \(await w\.navigate\(target\)\) \|\| w; try \{ c\.postMessage\(\{ type: "nm-push-open", kind: d0\.kind \|\| "" \}\); \}/);
  assert.match(main, /\?\.type === PUSH_OPEN\) \{ pushOpened\(queryClient\); return; \}/);
});

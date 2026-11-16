// 대화방 기다리기 고리 바닥(구름 11-17 · 형 「클라우드플레어 부하를 줄여야 좋음」) — 서버가 안 붙잡고 바로 빈 답을 주면 쉬지 않고 되묻던 것(흉내 서버 2분 45,688번)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const src = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
// 화면 파일은 통째로 못 싣는 시험 환경이라(그림 · CSS) 셈 줄만 떼어 돌림 = 소스와 같은 글
const line = src.match(/export const watchMoved = \(afterBefore: number, afterNow: number, deBefore: string, deNow: string\): boolean => (.+);/);
const watchMoved = new Function("afterBefore", "afterNow", "deBefore", "deNow", `return ${line?.[1]};`) as (a: number, b: number, c: string, d: string) => boolean;

test("나아감 = 마지막 글 시각이 자람 또는 초안 표식이 바뀜 · 그 밖 = 안 나아감", () => {
  assert.ok(line, "셈 줄이 소스에 있음");
  assert.equal(watchMoved(100, 200, "", ""), true, "새 글");
  assert.equal(watchMoved(100, 100, "", "abc"), true, "초안이 생김");
  assert.equal(watchMoved(100, 100, "abc", ""), true, "초안이 지워짐");
  assert.equal(watchMoved(100, 100, "abc", "abc"), false, "빈 답");
  assert.equal(watchMoved(100, 100, "", ""), false, "빈 답(초안 없음)");
  assert.equal(watchMoved(200, 100, "", ""), false, "목록이 줄어도 나아간 건 아님");
});

test("고리 = 빠른 빈 답이면 1초 쉼 · 새 글 · 초안은 그대로 바로 다시(느려지는 것 0)", () => {
  assert.match(src, /export const WATCH_FAST_MS = 800, WATCH_NAP_MS = 1000;/);
  assert.match(src, /const after = cur\.messages\.at\(-1\)\?\.ts \?\? 0, t0 = Date\.now\(\), de0 = de;/);
  assert.match(src, /if \(!stop && Date\.now\(\) - t0 < WATCH_FAST_MS && !watchMoved\(after, qc\.getQueryData<Page>\(officeKeys\.msgs\(room\)\)\?\.messages\.at\(-1\)\?\.ts \?\? 0, de0, de\)\) await sleep\(WATCH_NAP_MS\);/);
  const body = src.slice(src.indexOf("기다리기 고리 = YETA watch 꼴"), src.indexOf("담당 고르는 중(route pending)"));
  assert.ok(body.indexOf("await sleep(WATCH_NAP_MS)") > body.indexOf("qc.setQueryData<Page>(officeKeys.msgs(room)"), "글을 합친 뒤에 셈(after 가 자랐는지 본 다음)");
  assert.ok(body.indexOf("await sleep(WATCH_NAP_MS)") < body.indexOf("} catch (e) {"), "try 안 = 실패 쉼(3초)과 따로");
});

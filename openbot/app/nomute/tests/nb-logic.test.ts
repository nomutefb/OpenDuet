import assert from "node:assert/strict";
import { test } from "node:test";
import { nbBody, fresh, newsText, noteMd, trText, NB_EXT } from "../ui/nb-logic.ts";

// 정원 「미디어 요약」 판 1(team-4 · 깃 11-10) — 원본 viewer/nb.html · functions/api/nb.js 와 같은 값인지
test("보낼 몸통 = 주소 · 파일 · 글(40자 넘게) 중 하나", () => {
  assert.deepEqual(nbBody({ url: " https://youtu.be/x " }, "핵심만\n짧게").body, { url: "https://youtu.be/x", ask: "핵심만 짧게" });
  assert.ok(nbBody({ url: "youtu.be/x" }, "").error);
  assert.deepEqual(nbBody({ r2key: "up_src/261110235900-abc123.mp3", name: "a.mp3" }, "").body, { r2key: "up_src/261110235900-abc123.mp3", name: "a.mp3", ask: "" });
  assert.ok(nbBody({ text: "짧아" }, "").error); assert.ok(nbBody({}, "").error);
  const t = "첫 줄 제목\n" + "본문 ".repeat(20);
  assert.deepEqual(nbBody({ text: t }, "").body, { text: t.trim(), title: "첫 줄 제목", kind: "text", ask: "" });
  assert.ok(NB_EXT.test("a.m4a")); assert.ok(!NB_EXT.test("a.pdf"));
});

test("끝 = 이번 판 · 노트 = summary · 목록 = items", () => {
  const t0 = Date.parse("2026-11-10T23:50:00+09:00");
  assert.ok(fresh({ summary: "x", ts: "2026-11-10T23:55:00+09:00" }, "summary", t0 - 90e3));
  assert.equal(fresh({ summary: "x", ts: "2026-11-10T23:40:00+09:00" }, "summary", t0 - 90e3), null);
  assert.equal(fresh({ ts: "2026-11-10T23:55:00+09:00" }, "summary", t0 - 90e3), null);
  assert.ok(fresh({ items: [], ts: "2026-11-10T23:55:00+09:00" }, "items", t0 - 90e3));
});

test("뉴스 요약으로 보낼 글 · .md = 옛 화면 꼴 그대로", () => {
  const d = { id: "x", ts: "2026-11-10T23:55:00+09:00", tr_src: "subs-auto", kind: "인터뷰", src: { title: "T", channel: "C", url: "https://y/x", dur: 75 }, one: "한 줄", summary: "요약", points: [{ c: "논점", t: 12, g: "근거" }], quotes: [{ q: "말", w: "갑", t: 61 }], facts: [{ f: "10%", t: 3 }], transcript: [{ s: 1, t: "안녕" }] };
  const n = newsText(d);
  assert.ok(n.startsWith("[유튜브 영상 자료화 노트 — 아래 내용을 기사 다이제스트로 정리해줘. 노트의 사실·인용만 근거로(전사 기준 오인식 가능 표기는 유지).]\n제목: T\n매체: C (유튜브)\nURL: https://y/x"));
  assert.ok(n.includes('\n- "말" — 갑 [1:01]')); assert.ok(n.includes("- 논점 (근거: 근거)"));
  const md = noteMd(d);
  assert.ok(md.includes("- 채널: C · 1:15")); assert.ok(md.includes("(고유명사·수치 오인식 가능) · 생성: 2026-11-10 23:55"));
  assert.ok(md.endsWith("## 전체 전사\n\n[0:01] 안녕"));
  assert.equal(trText(d), "[0:01] 안녕");
  assert.ok(newsText({ tr_src: "text", src: { title: "글" } }).startsWith("[붙여넣은 텍스트 자료화 노트"));
});

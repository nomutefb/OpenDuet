// 봇 현황 「일감」 보드(형 11-16 03:0x 영상 「Agent inbox」) — 카드 셈 = 서버 도표 + 형 결정 · 지어낸 단계 0
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { colCount, inboxOf, spanKo } from "../ui/bot-inbox-logic.ts";

const NOW = 1_800_000_000_000, M = 60e3;
const rd = (f: string) => readFileSync(new URL(`../ui/${f}`, import.meta.url), "utf8");
const table = {
  codes: ["U", "R"],
  late: [{ no: "#-062", who: "번개", code: "R", min: 37 }],
  rows: [
    { who: "봄", lane: "work" as const, state: "일", why: "clock 턴", pm: true, last_at: NOW - 20e3, ctx_pct: 80, work_min: 12 },
    { who: "빠르", lane: "lost" as const, state: "멈춤", cause: "신호 끊김", why: "대기 신호 8분 전이 마지막", last_at: NOW - 15 * M, beat_at: NOW - 8 * M },
    { who: "시아", lane: "work" as const, state: "일", last_at: NOW - 40e3, brain: "Opus 5.5", jobs: [{ no: "#-071", title: "재확인 단추", code: "U", recv: NOW - 6 * M }, { no: "#-066", title: "윈터 카드", code: "U", recv: NOW - 95 * M, ride: NOW - 70 * M, sha: "91131ae9aaaa", done: NOW - 62 * M }] },
    { who: "번개", lane: "rest" as const, state: "쉼", jobs: [{ no: "#-062", title: "예약 메우기", code: "R", recv: NOW - 52 * M }] },
    { who: "깃", lane: "ready" as const, state: "쉼 · 받을 수 있음", jobs: [{ no: "#-070", title: "판독", code: "U", recv: NOW - 9 * M, ride: NOW - 4 * M, sha: "ab12cd34ef56" }] },
    { who: "뎅", lane: "ready" as const, state: "쉼 · 받을 수 있음" },
  ],
};
const decs = [{ id: "d1", room: "dm-bom", room_name: "봄", who: "봄", q: "막대 색?", choices: ["라임", "흰색"], ts: NOW - 14 * M }, { id: "d2", room: "all", who: "깃", q: "이미 고른 것", pick: { i: 0 } }];

test("세 칸 — 형 차례 = 멈춘 손 · 형 결정 · 늦은 오더 / 도는 중 = 안 끝낸 오더 · 오더 밖 일 / 끝남 = 오늘 끝낸 오더", () => {
  const cards = inboxOf(table, decs, NOW, { U: "화면", R: "러너" }), by = Object.fromEntries(cards.map((c) => [c.key, c]));
  assert.deepEqual(colCount(cards), { need: 3, run: 3, done: 1 });
  assert.deepEqual(cards.filter((c) => c.col === "need").map((c) => c.key), ["lost:빠르", "dec:d1", "job:번개:#-062"]);   // 멈춘 손 맨 위 · 형 결정 · 늦은 오더
  assert.equal(by["lost:빠르"].tone, "fail"); assert.equal(by["lost:빠르"].act, "room"); assert.match(by["lost:빠르"].desc, /신호 끊김 · 대기 신호 8분 전/);
  assert.equal(by["dec:d1"].tone, "wait"); assert.equal(by["dec:d1"].act, "decide"); assert.equal(by["dec:d2"], undefined);   // 이미 고른 결정 = 안 뜸
  assert.equal(by["job:번개:#-062"].label, "늦음 37분"); assert.equal(by["job:번개:#-062"].col, "need");
  assert.deepEqual(cards.filter((c) => c.col === "run").map((c) => c.key), ["job:깃:#-070", "job:시아:#-071", "work:봄"]);   // 오래 도는 일이 위 · 오더 밖 일은 맨 아래
  assert.equal(by["job:시아:#-071"].since, NOW - 6 * M); assert.match(by["job:시아:#-071"].desc, /시아 일하는 중 · 손 방금/);
  assert.match(by["job:깃:#-070"].desc, /만들기 끝 · 기차\(라이브\) 기다림/);   // 태움 뒤 = 손은 쉬어도 도는 중
  assert.equal(by["job:시아:#-066"].col, "done"); assert.equal(by["job:시아:#-066"].took, 33 * M);
  assert.equal(by["work:뎅"], undefined);   // 쉬는 손 · 맡은 일 0 = 카드 없음
});

test("단계 줄 = 서버가 아는 때만(받음 → 태움 sha → 끝 · 마지막 손 · 대기 신호) · 지어낸 단계 0", () => {
  const by = Object.fromEntries(inboxOf(table, decs, NOW).map((c) => [c.key, c]));
  assert.deepEqual(by["job:시아:#-066"].steps, [{ text: "시아 받음", at: NOW - 95 * M }, { text: "태움 91131ae — 만들기 끝 · 기차에 올림", at: NOW - 70 * M }, { text: "끝", at: NOW - 62 * M }]);
  assert.deepEqual(by["job:시아:#-071"].steps, [{ text: "시아 받음", at: NOW - 6 * M }, { text: "만드는 중", live: true }]);
  assert.deepEqual(by["lost:빠르"].steps.map((s) => s.text), ["마지막 손", "마지막 대기 신호", "신호 끊김 — 대기 신호 8분 전이 마지막"]);
  assert.equal(by["lost:빠르"].steps.at(-1)?.bad, true);
  assert.deepEqual(by["job:시아:#-071"].chips.map((c) => c.k), ["code"]);   // 값이 있는 것만(맥락 · 오늘 분 없음 = 칩 없음)
  assert.equal(by["job:시아:#-071"].chips[0].title, "분류 U");
  assert.deepEqual(inboxOf(undefined, [], NOW), []);
});

test("흐른 시간 글 = 초 → 분 초 → 시간 분", () => {
  assert.equal(spanKo(41e3), "41초"); assert.equal(spanKo(3 * M + 41e3), "3분 41초"); assert.equal(spanKo(72 * M + 5e3), "1시간 12분"); assert.equal(spanKo(-5), "0초");
});

test("화면 = 새로 받아오는 것 0 · 움직임은 transform · opacity · filter · 초 시계는 도는 카드가 있을 때만", () => {
  const ui = rd("bot-inbox.tsx"), flip = rd("flip.ts"), css = rd("bot-inbox.css"), desk = rd("bot-desk.tsx");
  assert.doesNotMatch(ui, /office</, "보드가 따로 부르는 서버 길 0(봇 현황 표 · 형 결정 목록 그대로)");
  assert.match(ui, /if \(!ticking\) return undefined;/);
  assert.match(ui, /if \(!document\.hidden\) setNow\(Date\.now\(\)\)/);
  assert.match(flip, /it\.animate\(\[\{ transform: `translate\(\$\{dx\}px, \$\{dy\}px\)` \}, \{ transform: "none" \}\]/);
  assert.match(flip, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css.replace(/grid-template-rows \.34s|padding-bottom \.34s/g, ""), /transition:[^;]*(height|width|top|left|margin)/, "배치를 세는 움직임 = 펼침 한 곳만");
  assert.match(desk, /\["board", "일감"\], \["flow", "흐름"\], \["turn", "차례"\], \["hands", "손 표"\]/);
  assert.match(desk, /tab === "board" \? \(live \? <BotInbox t=\{t\} skills=\{skills\} now=\{now\} \/>/);
});

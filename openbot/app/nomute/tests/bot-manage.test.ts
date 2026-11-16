// 애들 화면 얼굴 펼침 = 그 애 관리 칸(형 11-16 19:36 dm-bom 「거기서 일괄 관리 페이지가 되길 바라는거임」 · 19:35 「특정 봇에 개발을 임시로 언제까지 멈추게」) — 임시 멈춤 셈 + 배선
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { restBody, restKo, restOn, untilKo, untilOf } from "../ui/bot-manage-logic.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const kst = (s: string) => Date.parse(s + "+09:00");
const NOW = kst("2026-11-16T20:40:00");

test("기한 = 1시간 · 오늘 밤(자정) · 내일 아침(다음 날 09:00) · 풀 때까지(없음)", () => {
  assert.equal(untilOf("1h", NOW), NOW + 3600e3);
  assert.equal(untilOf("night", NOW), kst("2026-11-17T00:00:00"));
  assert.equal(untilOf("morning", NOW), kst("2026-11-17T09:00:00"));
  assert.equal(untilOf("morning", kst("2026-11-16T03:00:00")), kst("2026-11-17T09:00:00"));   // 새벽에 눌러도 「내일」 = 다음 날
  assert.equal(untilOf("open", NOW), undefined);
});

test("걸려 있나 = 칸이 있고 기한이 안 지남 · 기한 없는 칸 = 풀 때까지 걸림", () => {
  assert.equal(restOn(undefined, NOW), false);
  assert.equal(restOn({ at: NOW - 1 }, NOW), true);
  assert.equal(restOn({ until: NOW + 1 }, NOW), true);
  assert.equal(restOn({ until: NOW }, NOW), false);
});

test("글 = 「갈래 · 기한」 · 오늘이면 시각만 · 다른 날이면 날짜도 · 자정 = ~24:00", () => {
  const name = (c: string) => ({ D: "Dev.", S: "Fixer" })[c] || c;
  assert.equal(restKo({ codes: ["D"], until: kst("2026-11-16T21:40:00") }, NOW, name), "Dev. · ~21:40");
  assert.equal(restKo({ codes: ["D", "S"], until: kst("2026-11-17T09:00:00") }, NOW, name), "Dev. · Fixer · ~11-17 09:00");
  assert.equal(restKo({}, NOW, name), "전부 · 풀 때까지");
  assert.equal(untilKo(kst("2026-11-17T00:00:00"), NOW), "~24:00");
});

test("서버 몸 = 빠르 꼴 그대로 {who, on, codes?, until?} · 전부 · 풀 때까지면 그 칸을 안 보냄 · 풀기 = on:false 만", () => {
  assert.deepEqual(restBody("번개", true, ["D"], 123), { who: "번개", on: true, codes: ["D"], until: 123 });
  assert.deepEqual(restBody("번개", true, [], undefined), { who: "번개", on: true });
  assert.deepEqual(restBody("번개", false, ["D"], 123), { who: "번개", on: false });
});

test("배선 = 얼굴 펼침 안 · 서버 길은 이미 있는 것만(profile/nextwin · bots/rest) · PM 은 멈춤 줄 없음 · 움직임은 누름 · 색뿐", () => {
  const ui = rd("../ui/bot-manage.tsx"), desk = rd("../ui/bot-desk.tsx"), css = rd("../ui/bot-desk.css");
  assert.match(desk, /className="nm-bd-org-one"[\s\S]*<BotManage key=\{`m-\$\{picked\.who\}`\} r=\{picked\} skills=\{skills\} \/>/);
  assert.match(ui, /office<\{ nextwin\?: Record<string, NextWin> \}>\("profile\/nextwin", \{ method: "POST"/);
  assert.match(ui, /office<\{ ok\?: boolean; rest\?: RestMap \}>\("bots\/rest", \{ method: "POST", body: JSON\.stringify\(restBody\(/);
  assert.match(ui, /\{r\.brain === "클로드" \? <NextWinRow who=\{r\.who\} \/> : null\}/);
  assert.match(ui, /\{r\.pm \? null : <RestRow r=\{r\} skills=\{skills\} \/>\}/);
  assert.doesNotMatch(css.slice(css.indexOf("그 애 관리 칸")), /transition:[^;]*(height|width|top|left|margin)/);
});

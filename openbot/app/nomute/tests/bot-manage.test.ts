// 애들 화면 얼굴 펼침 = 그 애 관리 칸(형 11-16 19:36 dm-bom 「거기서 일괄 관리 페이지가 되길 바라는거임」 · 19:35 「특정 봇에 개발을 임시로 언제까지 멈추게」) — 임시 멈춤 셈 + 배선
//   꼴 = 옛 에디터 영상 편집 글자 줄 + 끄는 기간 막대(형 20:5x 구름 맥 창 「알약으로 선택하면 비효율 이니 그 영상에디터에 이미 css가 잇거든?」 · 「기간 설정은 이것도 참고해보고.」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { HOLD_MAX, durKo, endKo, minsAt, posOf, restBody, restKo, restOn, restPos, ticksOf, untilOf } from "../ui/bot-manage-logic.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const kst = (s: string) => Date.parse(s + "+09:00");
const NOW = kst("2026-11-16T20:40:00");

test("끄는 막대 = 길 24시간 · 30분 칸에 붙음 · 30분 ~ 24시간 · 0분 = 풀 때까지", () => {
  assert.equal(HOLD_MAX, 1440);
  assert.equal(minsAt(0), 30); assert.equal(minsAt(-1), 30); assert.equal(minsAt(2), 1440);
  assert.equal(minsAt(0.146), 210);   // 3시간 30분
  assert.equal(minsAt(60 / 1440 + 0.004), 60);
  assert.equal(posOf(720), 0.5); assert.equal(posOf(1440), 1);
  assert.equal(untilOf(210, NOW), NOW + 210 * 60e3);
  assert.equal(untilOf(0, NOW), undefined);
});

test("글 = 걸리는 시간 「3시간 30분」 · 끝나는 때 「21:40」 · 「내일 09:00」 · 그 뒤는 날짜", () => {
  assert.deepEqual([30, 60, 210, 1440].map(durKo), ["30분", "1시간", "3시간 30분", "24시간"]);
  assert.equal(endKo(kst("2026-11-16T21:40:00"), NOW), "21:40");
  assert.equal(endKo(kst("2026-11-17T09:00:00"), NOW), "내일 09:00");
  assert.equal(endKo(kst("2026-11-18T09:00:00"), NOW), "11-18 09:00");
  assert.equal(endKo(undefined, NOW), "풀 때까지");
});

test("눈금 = 지금부터 24시간 안의 6시간 금(00 · 06 · 12 · 18시) · 자리 0~1", () => {
  const t = ticksOf(NOW);
  assert.deepEqual(t.map((x) => x.label), ["00:00", "06:00", "12:00", "18:00"]);
  assert.ok(Math.abs(t[0].x - (3 * 60 + 20) / 1440) < 1e-9);   // 20:40 → 자정 = 3시간 20분 뒤
  assert.ok(t.every((x) => x.x > 0 && x.x <= 1));
});

test("걸려 있나 = 칸이 있고 기한이 안 지남 · 걸린 줄 글 · 길 위 자리", () => {
  const name = (c: string) => ({ D: "Dev.", S: "Fixer" })[c] || c;
  assert.equal(restOn(undefined, NOW), false);
  assert.equal(restOn({ at: NOW - 1 }, NOW), true);
  assert.equal(restOn({ until: NOW }, NOW), false);
  assert.equal(restKo({ codes: ["D"], until: kst("2026-11-16T21:40:00") }, NOW, name), "Dev. · 21:40 까지");
  assert.equal(restKo({ codes: ["D", "S"], until: kst("2026-11-17T09:00:00") }, NOW, name), "Dev. · Fixer · 내일 09:00 까지");
  assert.equal(restKo({}, NOW, name), "전부 · 풀 때까지");
  assert.equal(restPos({ until: NOW + 12 * 3600e3 }, NOW), 0.5);
  assert.equal(restPos({}, NOW), 1);
});

test("서버 몸 = 빠르 꼴 그대로 {who, on, codes?, until?} · 전부 · 풀 때까지면 그 칸을 안 보냄 · 풀기 = on:false 만", () => {
  assert.deepEqual(restBody("번개", true, ["D"], 123), { who: "번개", on: true, codes: ["D"], until: 123 });
  assert.deepEqual(restBody("번개", true, [], undefined), { who: "번개", on: true });
  assert.deepEqual(restBody("번개", false, ["D"], 123), { who: "번개", on: false });
});

test("배선 = 얼굴 펼침 안 · 서버 길은 이미 있는 것만 · 고르는 줄 = 영상 에디터 글자 줄(알약 0) · 막대는 끄는 동안 transform 만", () => {
  const ui = rd("../ui/bot-manage.tsx"), desk = rd("../ui/bot-desk.tsx"), css = rd("../ui/bot-desk.css"), mine = css.slice(css.indexOf("그 애 관리 칸"));
  assert.match(desk, /className="nm-bd-org-one"[\s\S]*<BotManage key=\{`m-\$\{picked\.who\}`\} r=\{picked\} skills=\{skills\} \/>/);
  assert.match(ui, /office<\{ nextwin\?: Record<string, NextWin> \}>\("profile\/nextwin", \{ method: "POST"/);
  assert.match(ui, /office<\{ ok\?: boolean; rest\?: RestMap \}>\("bots\/rest", \{ method: "POST", body: JSON\.stringify\(restBody\(/);
  assert.match(ui, /\{r\.brain === "클로드" \? <NextWinRows who=\{r\.who\} \/> : null\}/);
  assert.match(ui, /\{r\.pm \? <PmRow who=\{r\.who\} \/> : <RestRows r=\{r\} skills=\{skills\} \/>\}/);   // PM 줄 = PM 바꾸기 · 그 밖 = 임시 멈춤
  assert.match(ui, /\{r\.brain === "그록" \? <GrokRows \/> : null\}/);   // 그록 쪽 애만 호출 맥락 · 그록봇 지침
  // 설정에서 옮긴 것(형 11-16 19:36 「한쪽에 몰아버리고 싳은거임」 · 봄 21:30 「가」): 「모두」 일괄은 누르기 전 한 번 되물음 · 설정엔 가는 길 하나
  assert.match(ui, /export function BotManageAll\(\)/);
  assert.match(ui, /<MorphAsk key=\{id\} className="pc" disabled=\{off\} label=\{`모두 모델 \$\{ko\}`\} onYes=\{\(\) => save\.mutate\(\{ model: id \}\)\}>/);   // 그 자리 재확인(모달 0 · 형 21:4x 「항상 그냥 re 토글로만」)
  assert.doesNotMatch(ui, /AskYN|createPortal/);   // 되묻는 창(모달)은 안 씀
  assert.match(ui, /JSON\.stringify\(\{ all: true, \.\.\.v \}\)/);
  assert.match(desk, /\{sel === "\*" \? <div className="nm-bd-org-one" aria-label="모두 한 번에"><BotManageAll \/><\/div> : null\}/);
  const set = rd("../ui/yeta-settings.tsx");
  assert.match(set, /<Act ic="bot" t="애들 설정" v="애들에서" onClick=\{\(\) => \{ location\.hash = "#\/drawer"; \}\} \/>/);
  assert.doesNotMatch(set, /<PmSet \/>|<AcctPrio \/>|<WakeDepthRow \/>|<GrokNote \/>|<NomuteBots \/>/);
  assert.match(set, /<ModelSetRows bots=\{false\} \/>/);
  // 옛 에디터 줄 값 그대로: 낱말 = 상자 없음 6·7 · 13 · 700 / 고른 낱말 = 강조색 800 / 사이 | = .35
  assert.match(mine, /\.nm-bm \.srow \{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; padding:8px 0; \}/);
  assert.match(mine, /\.nm-bm \.pc \{ height:auto; padding:6px 7px; border:0; border-radius:0; background:none;/);
  assert.match(mine, /\.nm-bm \.pc\.on \{ color:var\(--accent, #CFFF40\); font-weight:800; \}/);
  assert.match(mine, /\.nm-bm \.ssep \{[^}]*opacity:\.35;/);
  // 막대: 끄는 동안 리액트 0(자리 = CSS 변수) · 움직이는 값 = transform 뿐 · 끄는 동안 전환 끔
  assert.match(ui, /el\.style\.setProperty\("--p", String\(x\)\)/);
  assert.match(mine, /\.nm-hs \.fill \{[^}]*transform:translateX\(calc\(\(var\(--p, 0\) - 1\) \* 100%\)\); \}/);
  assert.match(mine, /\.nm-hs \.track\[data-drag\] \.fill, [^{]*\{ transition:none;/);
  assert.doesNotMatch(mine, /transition:[^;]*(height|width|top|left|margin)/);
});

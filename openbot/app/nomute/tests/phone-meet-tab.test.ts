// 폰 위 탭 「사무실 | 팀즈 | 회의」 · 아래 네비 이름만 바뀜(형 11-13 22:05 · 22:14)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("판 셋 = office · teams · meet · 네비 이름 대화 · 팀즈 · 회의", () => {
  const t = rd("../ui/teams.tsx");
  assert.match(t, /MODE_LABEL: Record<OfficeMode, string> = \{ office: "대화", teams: "팀즈", meet: "회의" \}/);
  assert.match(t, /tab\("meet", <MeetIcon \/>, "회의"\)/);
  assert.match(t, /v === "teams" \|\| v === "meet" \? v : "office"/);   // 옛 기억 「office」 · 「teams」 그대로 읽힘
});
test("아래 네비 = 이름만 판 따라", () => {
  const n = rd("../swap/tab-bar.tsx");
  assert.match(n, /<span>\{label\}<\/span>/);
  assert.doesNotMatch(n, /<span>대화<\/span>/);
});
test("폰 회의 = 목록 자리에 화상회의 칸 · PC 반갈(bar) · 좁은 칸(slim)은 안 바뀜", () => {
  const r = rd("../ui/room-list.tsx");
  assert.match(r, /const meetOn = useOfficeMode\(\) === "meet" && !slim && !bar;/);
  assert.match(r, /<PhoneMeet onClose=/);
});
test("고른 탭만 이름 펼침(폴더 탭)", () => {
  const c = rd("../ui/teams.css");
  assert.match(c, /\.nm-tswitch\.fold \.nm-ftab\.on \.nm-ftab-nm \{ max-width:120px; opacity:1; transition:opacity \.12s ease \.2s; \}/);
  assert.doesNotMatch(c, /transition:max-width/);   // 형 ② = 글자가 폭과 같이 접히지 않음
});
import { openMeetOf, stillOpen } from "../ui/phone-meet-logic.ts";
test("폰 = 열린 화상회의 이어 받음 · 끝난 방 · 다른 임시방은 안 고름", () => {
  const now = 1_000_000_000_000, H = 3600_000;
  const rooms = [
    { id: "t-a", name: "화상회의 21:00", purpose: "화상회의 — 형이 …", exp: now + H * 0.5 },
    { id: "t-b", name: "화상회의 22:10", purpose: "화상회의 — 형이 …", exp: now + H * 1.9 },
    { id: "t-c", name: "봄볕", purpose: "뉴스 요약", exp: now + H * 3 },
    { id: "t-d", name: "화상회의 19:00", purpose: "화상회의 — 형이 …", exp: now - 1 },
  ];
  assert.deepEqual(openMeetOf(rooms, now), { id: "t-b", members: [], t0: now + H * 1.9 - 2 * H });
  assert.equal(openMeetOf(rooms.filter((r) => r.id === "t-c" || r.id === "t-d"), now), null);
  assert.equal(stillOpen({ id: "t-d", members: [], t0: 0 }, rooms, now), false);
  assert.equal(stillOpen({ id: "t-a", members: [], t0: 0 }, rooms, now), true);
});
test("폰 회의 판 = 화면 전체 · 16:9 폭 맞춤 · 명단 안 덮음 · 대화 = 남는 자리 · 「+」 숨김 · 네비 대화방 칸도 「회의」", () => {
  const c = rd("../ui/teams.css");
  assert.match(c, /\.nm-rooms-meet \{ position:fixed;/);
  assert.match(c, /\.nm-pmeet \.nm-co-frame \{ flex:none; width:100%; height:calc\(100vw \* 900 \/ 1440 \+ var\(--co-bar, 62px\)\); aspect-ratio:auto; \}/);
  assert.match(c, /\.nm-pmeet \.nm-meet-ppl \{ position:static;/);
  assert.match(c, /\.nm-pmeet \.nm-meet, \.nm-pmeet \.nm-co\.meet \.nm-meet\.open \{ flex:1 1 auto;/);
  assert.match(rd("../ui/shell.tsx"), /\{teamsOn \|\| meetOn \? null : <><RoomFab \/>/);
  assert.match(rd("../swap/tab-bar.tsx"), /tab\.id === "rooms" && mode !== "office" \? MODE_LABEL\[mode\] : tab\.label/);
});
test("팀즈 폰 목록 = 이름 굵기 한 단계 낮춤 · 홀 검정 옅게 · 짝 팀즈 보라 옅게(형 11-14 01:19)", () => {
  const c = rd("../ui/teams.css");
  assert.match(c, /\.nm-tlist li > button b \{ font-weight:600; \}/);
  assert.match(c, /\.nm-tlist li:nth-child\(odd\) > button \{ background:rgba\(0,0,0,\.22\); \}/);
  assert.match(c, /\.nm-tlist li:nth-child\(even\) > button \{ background:rgba\(91,95,199,\.13\); \}/);
});
test("폰 회의 몸통 = 설명 글 0 · 「새 회의」 단추만(형 11-14 01:41)", () => {
  const t = rd("../ui/phone-meet.tsx");
  assert.doesNotMatch(t, /회의 찾는 중|지금 열린 회의가 없어요/);
  assert.match(t, />새 회의</);
});
test("폰 명단 = 두 칸 · 초대 단추는 두 칸 다(형 11-14 01:44)", () => {
  const c = rd("../ui/teams.css");
  assert.match(c, /\.nm-pmeet \.nm-mp-l \{ display:grid; grid-template-columns:repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(c, /\.nm-pmeet \.nm-mp-l > \.nm-mp-inv[^{]*\{ grid-column:1 \/ -1; \}/);
});
test("폰 = 뜸 머리 줄 펜 · 커튼 · 손 34 · 알약 덮어쓰기 0(형 05:21)", () => {
  const c = rd("../ui/teams.css");
  assert.match(c, /\.nm-pmeet \.nm-sk-head button\.nm-sk-pen \{ width:34px; height:34px; \}/);
  assert.doesNotMatch(c, /\.nm-pmeet \.nm-sk-bar \{/);
});
test("영상 편집 기둥 키 = 안 잎 요소 아래끝(틀 키 · scrollHeight 는 끝없이 자람 · 형 11-14 05:23)", () => {
  const v = rd("../ui/video-editor.tsx");
  assert.match(v, /if \(c\.children\.length\) continue;/);
  assert.doesNotMatch(v, /rail\.offsetTop \+ rail\.offsetHeight/);
});
test("영상 편집 기둥 글자 단추 넷 = 그림 단추(형 11-14 05:41 「✓ ② 사진 에디터처럼 그림 단추로 바꿈」)", () => {
  const v = rd("../ui/video-editor.tsx");
  for (const k of ["res", "bgm", "anorm", "cutlv"]) assert.match(v, new RegExp(`\\b${k}: "<`));
  assert.match(v, /#editSpec \.gs-v\{font-size:0!important;/);
  assert.match(v, /SEE_CSS \+ RAIL_CSS \+ accentCss/);
  assert.match(v, /tip\.className = "nm-tip"/);
});

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
  assert.match(c, /\.nm-tswitch\.fold \.nm-ftab\.on \.nm-ftab-nm \{ max-width:120px; opacity:1; \}/);
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

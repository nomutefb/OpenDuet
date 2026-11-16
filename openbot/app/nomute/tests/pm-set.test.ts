// 설정 PM 고르기 — 명부 걸름 · 1:1 방 찾기(여울 방 이름 ≠ who) · 화면이 POST /pm 을 씀
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pmCandidates, pmRoomId } from "../ui/pm-set-logic.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("고를 수 있는 봇 = 명부에서 형 · 빈 자리 · 없어진 이 · 기계 알림 뺌", () => {
  const list = [
    { who: "형", kind: "human" },
    { who: "봄", kind: "being", name: "봄" },
    { who: "깃", kind: "being" },
    { who: "소나", kind: "bot" },
    { who: "윈터", kind: "winter", name: "여울" },
    { who: "별", kind: "bot", gone: true },
    { who: "자리1", kind: "being", empty: true },
    { who: "기차봇", kind: "being", empty: true, nocard: true },
  ];
  assert.deepEqual(pmCandidates(list).map((p) => p.who), ["봄", "깃", "소나", "윈터"]);
});

test("PM 1:1 방 = with 먼저 · 방 이름이 who 와 같을 때만 이름", () => {
  const rooms = [
    { id: "dm-winter", kind: "dm", name: "여울", with: "윈터" },
    { id: "dm-bom", kind: "dm", name: "봄", with: "봄" },
    { id: "all", kind: "group", name: "회의실", with: "" },
  ];
  assert.equal(pmRoomId("윈터", rooms), "dm-winter");
  assert.equal(pmRoomId("봄", rooms), "dm-bom");
  assert.equal(pmRoomId("깃", [{ id: "dm-gik", name: "깃" }]), "dm-gik");
  assert.equal(pmRoomId("", rooms), "");
  assert.equal(pmRoomId("없는애", rooms), "");
});

test("PM 고르기 = 애들 화면 PM 펼침으로 옮김(형 11-16 19:36 · 봄 21:30 「가」) · POST /pm 으로 씀 · 방 찾기는 같은 셈", () => {
  const set = rd("../ui/bot-manage.tsx");   // 앞 = 설정 화면(yeta-settings) <PmSet /> · 지금 = 관리 칸 PmRow(같은 서버 길 · 같은 후보 셈)
  const pm = rd("../ui/pm-set.tsx");
  assert.match(set, /function PmRow\(\{ who \}/); assert.match(set, /office<\{ who\?: string \}>\("pm", \{ method: "POST"/); assert.match(set, /pmCandidates\(list\)/);
  assert.match(pm, /method: "POST"/);
  assert.match(pm, /office<PmBody>\("pm"/);
  assert.match(rd("../ui/room-fab.tsx"), /pmRoomId\(pm, rooms\)/);
  assert.match(rd("../ui/pm-runner-mini.tsx"), /pmRoomId\(pm, rooms\)/);
  assert.match(rd("../ui/bot-desk.tsx"), /rows\.find\(\(r\) => r\.pm\)/);
});

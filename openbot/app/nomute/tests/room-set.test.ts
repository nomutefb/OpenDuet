// 임시방 「방 설정」 한 곳 모으기(형 11-17 00:46 ~ 00:49 dm-bom · 봄 옮김) — 셈 = ../ui/room-set-logic.ts · 화면 = ../ui/temp-room.tsx · 메뉴 = ../ui/room-menu.tsx
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { IDLE_DEFAULT, hasTask, idleKo, idleOpts, maxBlock, maxShow, maxStep, memberCand, setBody } from "../ui/room-set-logic";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("고르개 = 서버 후보 + 지금 멤버(후보에 없는 멤버도 칩으로 → 저장할 때 말없이 안 빠짐)", () => {
  assert.deepEqual(memberCand(["빠르", "봄"], ["빠르", "봄", "구름"]), ["빠르", "봄", "구름"]);   // 실물 = 봄바람(구름이 후보에 없어 저장과 함께 빠졌음)
  assert.deepEqual(memberCand(["빠르", "봄", "구름"], ["구름"]), ["빠르", "봄", "구름"]);
  assert.deepEqual(memberCand([], ["봄"]), ["봄"]);
});

test("최대 인원 = 화면은 형을 더한 숫자 · 서버 max 는 형을 안 셈 · 0 = 제한 없음", () => {
  assert.equal(maxShow(0), 0); assert.equal(maxShow(3), 4);
  assert.equal(maxStep(0, 1, 3), 3);     // 제한 없음에서 누르면 지금 멤버 수부터
  assert.equal(maxStep(0, -1, 0), 1);
  assert.equal(maxStep(3, 1, 3), 4); assert.equal(maxStep(3, -1, 3), 2);
  assert.equal(maxStep(1, -1, 3), 1); assert.equal(maxStep(50, 1, 3), 50);
  assert.equal(maxBlock(3, 0), ""); assert.equal(maxBlock(3, 3), "");
  assert.equal(maxBlock(4, 3), "최대 4명인데 지금 5명이야");   // 둘 다 형 포함(머리 숫자와 같은 셈)
});

test("머무는 시간 = 기본 60분 · 낱말 넷 + 그 밖 값은 끼워 넣음", () => {
  assert.equal(IDLE_DEFAULT, 60);
  assert.deepEqual(idleOpts(60).map(idleKo), ["30분", "1시간", "2시간", "3시간"]);
  assert.deepEqual(idleOpts(90).map(idleKo), ["30분", "1시간", "1시간 30분", "2시간", "3시간"]);
  assert.deepEqual(idleOpts(0), [30, 60, 120, 180]);
});

test("지금 일 줄 = 서버가 칸을 줄 때만 뜸", () => {
  assert.equal(hasTask({}), false); assert.equal(hasTask(undefined), false);
  assert.equal(hasTask({ task: "" }), true); assert.equal(hasTask({ task_idle_min: 60 }), true); assert.equal(hasTask({ task_exp: 1 }), true);
});

test("보낼 몸 = 이름 · 지침 · 멤버는 늘 · 기한은 골랐을 때만 · max · task · task_idle_min 은 바뀐 것만", () => {
  const base = { max: 0, task: "", idle: 60 }, v = { name: "봄바람", purpose: "일", members: ["봄"], hours: null as number | null, ...base };
  assert.deepEqual(setBody(v, base), { name: "봄바람", purpose: "일", members: ["봄"] });
  assert.deepEqual(setBody({ ...v, hours: 1, max: 4 }, base), { name: "봄바람", purpose: "일", members: ["봄"], hours: 1, max: 4 });
  assert.deepEqual(setBody({ ...v, max: 0 }, { ...base, max: 4 }), { name: "봄바람", purpose: "일", members: ["봄"], max: 0 });   // 풀기 = 0
  assert.deepEqual(setBody({ ...v, task: " 표 고치기 ", idle: 120 }, base), { name: "봄바람", purpose: "일", members: ["봄"], task: "표 고치기", task_idle_min: 120 });
  assert.deepEqual(setBody({ ...v, max: 4, task: "x" }, null), { name: "봄바람", purpose: "일", members: ["봄"] });   // 새 방 = 옛 꼴 그대로
});

test("방 설정 한 창 = 멤버 · 최대 인원 · 모두 내보내기 · 지금 일 · 머무는 시간 · 메뉴 줄은 하나", () => {
  const t = rd("../ui/temp-room.tsx"), m = rd("../ui/room-menu.tsx"), l = rd("../ui/room-list.tsx");
  assert.match(t, /const cand = memberCand\(candRaw, edit\?\.members \|\| \[\]\)/);
  assert.match(t, /\{edit \? `멤버 · \$\{picked\.length \+ 1\}명` : `초대할 사람 · \$\{picked\.length\}명`\}/);   // 고치기 = 형 포함 숫자(머리 숫자와 같음)
  assert.match(t, /aria-label="최대 인원"/); assert.match(t, /aria-label="머무는 시간"/);
  assert.match(t, /<MorphAsk className="nm-rs-kick" yesText="내보내기"/);
  assert.match(t, /\{why \|\| over \? <p role="alert"/);   // 최대 인원을 넘으면 까닭이 보임   // 재확인 = 그 자리 토글(모달 0)
  assert.match(t, /JSON\.stringify\(setBody\(\{ name, purpose, members: picked, hours, max, task, idle \}, edit \? set0 : null\)\)/);
  assert.doesNotMatch(t, /TempMembersDialog/);   // 멤버만 고치던 창 걷음
  assert.match(t, /return r\.temp \? <TempRoomDialog edit=\{r\} onClose=\{onClose\} \/>/);
  assert.match(t, /\{r\.task \? <p className="nm-temp-task">/);   // 방 머리 = 지금 일 한 줄
  assert.match(m, /\{!r\.with && r\.id !== MEET && r\.designated && !r\.temp \? <button type="button" role="menuitem" onClick=\{go\(\(\) => setCrew\(true\)\)\}>멤버 설정/);   // 임시방엔 「멤버 설정」 줄 없음
  assert.match(m, /\{canKickAll && !r\.temp \? <MorphAsk role="menuitem"/);
  assert.match(m, /kickAll=\{canKickAll \? \(\) => kickAllGo\(r\) : undefined\}/);
  assert.match(l, /const crewOk = r\.id !== "all" && !!r\.designated && !r\.temp;/);
});

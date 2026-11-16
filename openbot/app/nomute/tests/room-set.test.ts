// 임시방 「방 설정」 한 곳 모으기(형 11-17 00:46 ~ 00:49 dm-bom · 봄 옮김) — 셈 = ../ui/room-set-logic.ts · 화면 = ../ui/temp-room.tsx · 메뉴 = ../ui/room-menu.tsx
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { IDLE_DEFAULT, TASK_MAX, idleFor, idleKo, idleOpts, maxBlock, maxShow, maxStep, memberCand, setBody, stayNow, taskEndNote } from "../ui/room-set-logic";

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

test("머무는 시간 = 끔 + 낱말 넷 · 그 밖 값은 끼워 넣음 · 일을 적으면 꺼져 있던 값 = 서버 기본 3시간", () => {
  assert.equal(IDLE_DEFAULT, 180); assert.equal(TASK_MAX, 300);   // 서버 _temproom.js IDLE_DEF_MIN · TASK_MAX 와 같은 값
  assert.deepEqual(idleOpts(0).map(idleKo), ["끔", "30분", "1시간", "3시간", "6시간"]);
  assert.deepEqual(idleOpts(90).map(idleKo), ["끔", "30분", "1시간", "1시간 30분", "3시간", "6시간"]);
  assert.equal(idleFor("표 고치기", 0), 180); assert.equal(idleFor("표 고치기", 60), 60); assert.equal(idleFor("  ", 0), 0);
});

test("지금 일을 비우면 = 일이 끝나고 멤버가 비워짐 → 그때만 한 줄", () => {
  assert.equal(taskEndNote("표 고치기", " "), "비우면 일이 끝나고 멤버가 비워져");
  assert.equal(taskEndNote("표 고치기", "표"), ""); assert.equal(taskEndNote("", ""), "");
});

test("보낼 몸 = 이름 · 지침 · 멤버는 늘 · 기한은 골랐을 때만 · max · task · task_idle_min 은 바뀐 것만", () => {
  const base = { max: 0, task: "", idle: 0 }, v = { name: "봄바람", purpose: "일", members: ["봄"], hours: null as number | null, ...base };
  assert.deepEqual(setBody(v, base), { name: "봄바람", purpose: "일", members: ["봄"] });
  assert.deepEqual(setBody({ ...v, hours: 1, max: 4 }, base), { name: "봄바람", purpose: "일", members: ["봄"], hours: 1, max: 4 });
  assert.deepEqual(setBody({ ...v, max: 0 }, { ...base, max: 4 }), { name: "봄바람", purpose: "일", members: ["봄"], max: 0 });   // 풀기 = 0
  assert.deepEqual(setBody({ ...v, task: " 표 고치기 ", idle: 120 }, base), { name: "봄바람", purpose: "일", members: ["봄"], task: "표 고치기", task_idle_min: 120 });
  assert.deepEqual(setBody({ ...v, max: 4, task: "x" }, null), { name: "봄바람", purpose: "일", members: ["봄"] });   // 새 방 = 옛 꼴 그대로
});

test("방 설정 한 창 = 멤버 · 최대 인원 · 모두 내보내기 · 지금 일 · 머무는 시간 · 메뉴 줄은 하나", () => {
  const t = rd("../ui/temp-room.tsx"), m = rd("../ui/room-menu.tsx"), l = rd("../ui/room-list.tsx");
  assert.match(t, /const cand = memberCand\(candRaw, edit\?\.members \|\| \[\]\)/);
  assert.match(t, /cls\.includes\(who\(n\)\?\.shelf \|\| who\(n\)\?\.cls \|\| ""\)/);   // 묶음 칸 = 명부 shelf 먼저(구름 → 클로드 칸)
  assert.match(t, /<span className="nm-rs-nm">\{edit \? "멤버" : "초대할 사람"\}<em>\{edit \? picked\.length \+ 1 : picked\.length\}명<\/em><\/span>/);   // 고치기 = 형 포함 숫자(머리 숫자와 같음)
  assert.match(t, /aria-label="최대 인원"/); assert.match(t, /aria-label="머무는 시간"/);
  assert.match(t, /idle: edit\?\.idle_min && edit\.idle_min > 0 \? edit\.idle_min : 0/);   // 방 자료 칸 = idle_min(서버 tempRoomOf) · 보낼 칸 = task_idle_min
  assert.match(t, /<textarea value=\{task\} maxLength=\{TASK_MAX\}/);
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

test("유지 시간 = 지금 값인 칸에 라임(글자 「· 지금 영구」 대신) · 가운데면 막대가 그만큼", () => {
  const NOW = 1_794_846_000_000, H = 3600e3;
  assert.equal(stayNow(undefined, NOW), 0);                // 기한 없음 = 영구 칸
  assert.equal(stayNow(NOW + 40 * 60e3, NOW), 1); assert.equal(stayNow(NOW + 1.5 * H, NOW), 1);   // 1시간 칸
  assert.equal(stayNow(NOW + 5 * H, NOW), 24); assert.equal(stayNow(NOW + 49 * H, NOW), 72); assert.equal(stayNow(NOW + 400 * H, NOW), 168);   // 남은 날(올림 · 7일까지)
  const t = rd("../ui/temp-room.tsx"), d = rd("../ui/day-slide.tsx");
  assert.match(t, /<DaySlide hours=\{hours\} now=\{edit \? stayNow\(edit\.exp, Date\.now\(\)\) : undefined\} onChange=\{setHours\} \/>/);
  assert.doesNotMatch(t, /· 지금 \{edit\.exp/);
  assert.match(d, /const hours = picked \?\? now \?\? null;/);
});

test("줄 정렬 = 이름 기둥(• + 굵은 글) 한 벌 · 값은 오른쪽 한 선(형 11-17 01:44 「각 라인 정렬해서 좀만 보기 좋게 이미지 에디터 같은거 참고하면 될듯」)", () => {
  const t = rd("../ui/temp-room.tsx"), c = rd("../ui/temp-room.css");
  for (const nm of ["방 이름", "방 지침", "지금 일"]) assert.match(t, new RegExp(`<span className="nm-rs-nm">${nm}</span>`));
  for (const nm of ["방 사진", "머무는 시간", "최대 인원"]) assert.match(t, new RegExp(`<span className="lbl nm-rs-nm">${nm}</span>`));
  assert.match(t, /<legend className="nm-rs-nm">유지 시간<\/legend>/);
  assert.match(t, /<RoomArtRow id=\{edit\.id\} look=\{edit\.look\} line \/>/);
  assert.doesNotMatch(t.slice(t.indexOf("export function TempRoomDialog")), /className="text-muted-foreground">(방 이름|방 지침|지금 일)/);
  assert.match(c, /\.nm-rs-nm::before \{ content:"•"; color:rgb\(var\(--accent-rgb, 207,255,64\)\)/);
});

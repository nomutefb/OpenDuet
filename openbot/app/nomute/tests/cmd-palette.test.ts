// 명령 팔레트(형 11-17 「메뉴가 분산 … 좀 모아좌」 · 11-21 「바로 개선점을 적용해줄 수 있어?」) — 셈 = ../ui/cmd-core.ts · 화면 = ../ui/cmd-palette.tsx · 키 = ../ui/cmd-key.ts
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { type CmdItem, chosung, isOpenKey, pickItems, rank, roomTo } from "../ui/cmd-core.ts";

const S = (label: string, to: string): CmdItem => ({ id: "s:" + to, label, to, kind: "screen" });
const R = (label: string, id: string, ts: number): CmdItem => ({ id: "r:" + id, label, to: roomTo(id), kind: "room", ts });
const ITEMS = [S("홈", "/"), S("대화", "/rooms"), S("뉴스", "/newsed"), S("이미지 에디터", "/edtool"), S("애들", "/botdesk"), S("스케줄 배선", "/sched"), S("설정", "/settings"),
  R("밥상 🍚", "tmp-mw8seuv1", 300), R("봄", "dm-bom", 200), R("회의실", "all", 100), R("번개", "dm-light", 250), R("봄비", "tmp-mwa3bcnq", 50)];

test("첫소리 = 한글 글자마다 첫소리만 · 그 밖은 그대로(소문자)", () => {
  assert.equal(chosung("밥상 🍚"), "ㅂㅅ 🍚");
  assert.equal(chosung("Runner 현황"), "runner ㅎㅎ");
  assert.equal(chosung(""), "");
});

test("맞는 정도 = 앞 0 · 가운데 1 · 첫소리 앞 2 · 첫소리 가운데 3 · 안 맞음 -1 · 빈칸 · 대소문자 안 가림", () => {
  assert.equal(rank("밥상 🍚", "밥"), 0);
  assert.equal(rank("이미지 에디터", "에디"), 1);
  assert.equal(rank("이미지 에디터", "이미지에"), 0, "빈칸 안 가림");
  assert.equal(rank("밥상 🍚", "ㅂㅅ"), 2);
  assert.equal(rank("스케줄 배선", "ㅂㅅ"), 3);
  assert.equal(rank("Runner", "run"), 0);
  assert.equal(rank("밥상", "봄"), -1);
  assert.equal(rank("밥상", ""), 0);
  assert.equal(rank("밥상", "ㅂx"), -1, "첫소리 물음 = 첫소리 글자만일 때");
});

test("빈 물음 = 화면(메뉴 차례) 먼저 · 그다음 방(최근 말한 차례)", () => {
  const got = pickItems(ITEMS, "").map((x) => x.label);
  assert.deepEqual(got, ["홈", "대화", "뉴스", "이미지 에디터", "애들", "스케줄 배선", "설정", "밥상 🍚", "번개", "봄", "회의실", "봄비"]);
});

test("물음 = 맞는 정도 차례 · 같은 정도의 방은 최근 차례 · 많아야 max", () => {
  assert.deepEqual(pickItems(ITEMS, "봄").map((x) => x.label), ["봄", "봄비"]);
  assert.deepEqual(pickItems(ITEMS, "ㅂ").map((x) => x.label), ["밥상 🍚", "번개", "봄", "봄비", "스케줄 배선"], "첫소리 앞(방 = 최근 차례) → 첫소리 가운데");
  assert.deepEqual(pickItems(ITEMS, "에디터").map((x) => x.label), ["이미지 에디터"]);
  assert.equal(pickItems(ITEMS, "", 3).length, 3);
  assert.deepEqual(pickItems(ITEMS, "없는말"), []);
});

test("방 길 = 회의실만 #/group/all · 여는 키 = 맥 ⌘K · 그 밖 Ctrl+K · 한글 자판(code) · 다른 보조키 섞이면 아님", () => {
  assert.equal(roomTo("all"), "/group/all"); assert.equal(roomTo("dm-bom"), "/channels/dm-bom");
  const k = (o: Partial<{ key: string; code: string; metaKey: boolean; ctrlKey: boolean; altKey: boolean; shiftKey: boolean }>) => ({ key: "k", code: "KeyK", metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...o });
  assert.ok(isOpenKey(k({ metaKey: true }), true)); assert.ok(isOpenKey(k({ metaKey: true, key: "ㅏ" }), true), "한글 자판");
  assert.ok(!isOpenKey(k({ ctrlKey: true }), true), "맥 Ctrl+K = 글칸 줄 지우기 그대로");
  assert.ok(isOpenKey(k({ ctrlKey: true }), false)); assert.ok(!isOpenKey(k({ metaKey: true }), false));
  assert.ok(!isOpenKey(k({ metaKey: true, shiftKey: true }), true)); assert.ok(!isOpenKey(k({ metaKey: true, key: "j", code: "KeyJ" }), true));
});

test("화면 쪽 = 판은 처음 누를 때 받아 옴 · 목록은 메뉴 줄과 한 곳 · 설명글 0 · 옷 = 메뉴 판 값", () => {
  const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
  const key = rd("../ui/cmd-key.ts"), pal = rd("../ui/cmd-palette.tsx"), css = rd("../ui/cmd-palette.css"), main = rd("../main.tsx"), shell = rd("../ui/shell.tsx"), mb = rd("../ui/menu-bar.css");
  assert.match(main, /import "\.\/ui\/cmd-key";/); assert.ok(!/cmd-palette/.test(main), "판은 시작 묶음에 안 실림");
  assert.match(key, /import\("\.\/cmd-palette"\)\.then\(\(m\) => \(mod = m\)\)/); assert.match(key, /if \(mod\) mod\.togglePalette\(\);/, "받아 둔 뒤 = 그 키 안에서 바로");
  assert.match(key, /requestIdleCallback/, "판 묶음 = 한가할 때 미리"); assert.match(pal, /flushSync\(\(\) => setOpenRef/, "여닫기 = 그 자리에서 바로 그림");
  assert.match(shell, /export const menuOf = /); assert.match(pal, /import \{ menuOf \} from "\.\/shell";/);
  assert.ok(!/placeholder=/.test(pal) && !/결과 없음|검색어/.test(pal.replace(/^\/\/.*$/gm, "")), "안내 글 0");
  assert.match(pal, /isComposing \|\| e\.keyCode === 229/, "한글 조합 중 Enter = 글자 확정");
  for (const v of ["linear-gradient(180deg, rgba(20,21,23,.52), rgba(10,11,12,.60))", "blur(22px) saturate(1.25)", "0 10px 28px -16px rgba(0,0,0,.7)", "rgba(255,255,255,.055)"]) { assert.ok(css.includes(v), v); assert.ok(mb.includes(v), "메뉴 판에도 같은 값: " + v); }
  assert.match(css, /caret-color:var\(--accent, #CFFF40\)/);
  assert.match(css, /\.nm-cmd \{ --accent:#CFFF40; --accent-rgb:207,255,64;/, "body 에 붙는 판 = 라임 값을 제가 검");
  assert.ok(!/requestAnimationFrame/.test(pal), "입력칸 초점 = 프레임을 안 기다림");
});

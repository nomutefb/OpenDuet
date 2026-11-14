// 이미지 편집 최소화 — 접어도 살아 있음 · ▽ 로 하던 그대로(형 11-15 「이미지 생성기 만들다가 최소화가 가능하면 좋겠음 … 역삼각형으로 잠시 들어갓엇는데」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { edAlive, edChip, edKeptNext } from "../ui/ed-keep-logic.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("접어 둠 = 최소화만 켬 · 닫기 · 다시 열림은 끔", () => {
  assert.equal(edKeptNext(false, "min"), true);
  assert.equal(edKeptNext(true, "close"), false);
  assert.equal(edKeptNext(true, "open"), false);
});

test("살아 있음 = 열림 또는 접어 둠 · ▽ 단추 = 접어 뒀고 다른 화면일 때만", () => {
  assert.equal(edAlive("edtool", false), true);
  assert.equal(edAlive("drawer", true), true, "접은 채 서랍 = 살아 있음");
  assert.equal(edAlive(null, true), true, "접은 채 홈 · 대화 = 살아 있음");
  assert.equal(edAlive("drawer", false), false, "그냥 나감 = 전처럼 닫힘");
  assert.equal(edChip("nedit", true), true);
  assert.equal(edChip("edtool", true), false, "펼친 동안 단추 0");
  assert.equal(edChip(null, false), false);
});

test("껍데기 = 이미지 편집을 제 겹에서 그림(창 안에서 안 그림 = 주소를 벗어나도 안 사라짐)", () => {
  const sh = rd("../ui/shell.tsx"), ek = rd("../ui/ed-keep.tsx");
  assert.match(sh, /\{edAlive\(modal, edKept\) \? \(/);
  assert.match(sh, /<EdKeep open=\{modal === "edtool"\}/);
  assert.match(sh, /\{M && M\.id !== "edtool" \? \(/);
  assert.doesNotMatch(sh, /<ThumbMaker /, "껍데기 창 안엔 없음");
  assert.match(ek, /className=\{open \? "nm-modal see nm-edkeep" : "nm-modal see nm-edkeep min"\}/, "접힘 = 같은 자리 · 옷만 바뀜(다시 안 그림)");
  assert.match(ek, /inert=\{!open \|\| covered \|\| undefined\}/);
  assert.match(ek, /useModal<HTMLDivElement>\(onClose, open\)/, "접힌 동안 Esc · Tab 안 잡음");
});

test("최소화 단추 둘 = 머리 ▽ · 빠른 메뉴 위 #rfabMin(엔진 줄은 원본 그대로)", () => {
  const tm = rd("../ui/thumb-maker/index.tsx"), tail = rd("../ui/thumb-maker/engine/p14-tail.ts");
  assert.match(tm, /className="tm-min" aria-label="최소화"/);
  assert.match(tm, /querySelector<HTMLElement>\("#rfabMin"\)/);
  assert.match(tm, /rmin\.style\.display = ""; rmin\.addEventListener\("click", doMin\)/);
  assert.match(tail, /parent\.minimizeTool/, "원본 줄 안 건드림");
});

test("옷 = 접힘은 숨기기만(크기 그대로) · 움직임 한 번씩 · 도는 것 0 · 누르면 줄어듦", () => {
  const css = rd("../ui/ed-keep.css");
  assert.match(css, /\.nm-edkeep\.min \{[^}]*visibility:hidden/);
  assert.doesNotMatch(css, /display:none/, "크기를 없애면 엔진이 재는 폭이 0");
  assert.doesNotMatch(css, /infinite/);
  assert.match(css, /\.nm-edchip:active \{ transform:scale\(var\(--press-s/);
  assert.match(css, /\.nm-edchip \{[^}]*left:14px; bottom:calc\(var\(--duet-tab-space,86px\) \+ 8px\)/, "아래 막대 위 왼쪽(오른쪽 「+」 와 안 겹침)");
  assert.match(css, /prefers-reduced-motion:reduce/);
});

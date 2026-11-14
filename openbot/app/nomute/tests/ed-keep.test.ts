// 이미지 편집 · 영상 편집 = 접을 수 있는 창 · 단추 = 옛 에디터 것(형 11-15 「예전 에디터 처럼 최소화 가능한 창으로 … 닫기버튼 최소화 버튼 그대로 가져옴 … 대신 서랍에서는 없앰」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ED_TOOLS, edAlive, edChip, edKeptNext, isEdTool } from "../ui/ed-keep-logic.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("접어 둠 = 최소화만 넣음 · 닫기 · 다시 열림은 뺌 · 둘 따로", () => {
  assert.deepEqual(edKeptNext([], "edtool", "min"), ["edtool"]);
  assert.deepEqual(edKeptNext(["edtool"], "edvid", "min"), ["edtool", "edvid"], "접은 차례");
  assert.deepEqual(edKeptNext(["edtool", "edvid"], "edtool", "min"), ["edvid", "edtool"], "다시 접으면 맨 뒤");
  assert.deepEqual(edKeptNext(["edtool", "edvid"], "edtool", "close"), ["edvid"]);
  assert.deepEqual(edKeptNext(["edtool", "edvid"], "edvid", "open"), ["edtool"]);
  assert.deepEqual([...ED_TOOLS], ["edtool", "edvid"]);
  assert.ok(isEdTool("edvid") && !isEdTool("drawer") && !isEdTool(null));
});

test("살아 있음 = 열림 또는 접어 둠 · 복원 ▲ = 접어 뒀고 지금 안 열린 것들", () => {
  assert.equal(edAlive("edtool", [], "edtool"), true);
  assert.equal(edAlive("drawer", ["edvid"], "edvid"), true, "접은 채 서랍 = 살아 있음");
  assert.equal(edAlive(null, ["edtool"], "edvid"), false);
  assert.equal(edAlive("drawer", [], "edtool"), false, "그냥 나감 = 닫힘");
  assert.deepEqual(edChip("nedit", ["edtool", "edvid"]), ["edtool", "edvid"], "둘 = 고르는 판");
  assert.deepEqual(edChip("edtool", ["edtool", "edvid"]), ["edvid"], "펼친 것은 뺌");
  assert.deepEqual(edChip(null, []), []);
});

test("껍데기 = 두 창을 제 겹에서 그림(주소를 벗어나도 안 사라짐) · 영상 편집은 고르던 일을 붙듦", () => {
  const sh = rd("../ui/shell.tsx"), ek = rd("../ui/ed-keep.tsx"), ve = rd("../ui/video-editor.tsx");
  assert.match(sh, /\{ED_TOOLS\.map\(\(t\) => edAlive\(modal, edKept, t\) \? \(/);
  assert.match(sh, /\{M && !isEdTool\(M\.id\) \? \(/);
  assert.match(sh, /<ToolRestore items=\{edChip\(modal, edKept\)\} onRestore=\{\(t\) => void nav\(\{ to: edPath\.current\[t\] \}\)\} onCloseAll=\{\(\) => setEdKept\(\[\]\)\} \/>/);
  assert.match(sh, /edPath\.current\[modal\] = pathname/, "펼칠 때 = 고르던 주소(/edtrack …)로");
  assert.match(ek, /className=\{open \? "nm-modal see nm-edkeep" : "nm-modal see nm-edkeep min"\}/, "접힘 = 같은 자리 · 옷만 바뀜(다시 안 그림)");
  assert.match(ek, /inert=\{!open \|\| covered \|\| undefined\}/);
  assert.match(ek, /useModal<HTMLDivElement>\(onClose, open\)/, "접힌 동안 Esc · Tab 안 잡음");
  assert.match(ve, /if \(!hold\) held\.current = modeOfPath\(loc\.p\);/);
  assert.match(ve, /<ToolButtons onMin=\{onMin\} onClose=\{onBack\} \/>/);
});

test("단추 · 복원 ▲ = 옛 에디터 것 그대로(값 · 그림 · 손 셈)", () => {
  const v = rd("../vendor/editor/tool-win.css"), ek = rd("../ui/ed-keep.tsx");
  assert.match(v, /Vendored from the old editor \(nomutefb\/editor\) · viewer-src\/06-document\.part/);
  assert.match(v, /\.tool-x \{ width:30px; height:30px; flex:none; display:grid; place-items:center; background:rgba\(255,255,255,\.06\);/);
  assert.match(v, /\.tool-hbtns \{ display:flex; align-items:center; gap:8px; \}/);
  assert.match(v, /\.tool-min:active \{ transform:scale\(var\(--press-xs,\.8\)\); \}/, "최소화 누름 = 줄어듦");
  assert.match(v, /\.tool-x:active \{ transform:rotate\(180deg\) scale\(var\(--press-m,\.92\)\); color:var\(--accent\); \}/, "닫기 누름 = 돌며 줄어듦");
  assert.match(v, /\.tool-restore:active \{ transform:scale\(var\(--press-xs,\.82\)\); \}/);
  for (const d of ['d="M6 12h12"', 'd="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"', 'd="M6 6 18 18M18 6 6 18"', 'd="M12 8 20 18 4 18Z"']) assert.ok(ek.includes(d), `옛 그림 ${d}`);
  assert.match(ek, /window\.setTimeout\(doArm, 550\)/, "길게 = 550ms");
  assert.match(ek, /window\.setTimeout\(disarm, 4000\)/, "4초 뒤 저절로 취소");
  assert.match(ek, /if \(n > 1\) setPick\(\(v\) => !v\); else onRestore\(items\[0\]\);/, "하나 = 바로 · 둘 = 고르는 판");
});

test("옷 = 접힘은 숨기기만(크기 그대로) · 계속 도는 것 0 · 서랍에서 뺌", () => {
  const css = rd("../ui/ed-keep.css"), tm = rd("../ui/thumb-maker/index.tsx"), tail = rd("../ui/thumb-maker/engine/p14-tail.ts");
  assert.match(css, /\.nm-edkeep\.min \{[^}]*visibility:hidden/);
  assert.doesNotMatch(css, /display:none/, "크기를 없애면 엔진이 재는 폭이 0");
  assert.doesNotMatch(css, /infinite/);
  assert.match(css, /\.tool-restore\.pulsing svg \{ animation-delay:\.42s; animation-iteration-count:3; \}/, "▲ 빛 = 세 번만(옛 = 끝없이 돌다 6초 뒤 끔)");
  assert.match(css, /\.tool-restore \{ position:absolute; right:20px; bottom:calc\(var\(--duet-tab-space,86px\) \+ 66px\)/, "아래 막대 · 「+」 위");
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(tm, /querySelector<HTMLElement>\("#rfabMin"\)/);
  assert.match(tail, /parent\.minimizeTool/, "엔진 원본 줄 안 건드림");
  assert.doesNotMatch(rd("../ui/drawer-page.tsx"), /ids: \[[^\]]*"(ask|edtool|edvid)"/);   // 만들기 묶음 통째 뺌(요약 요청도 · 깃 #-036)
});

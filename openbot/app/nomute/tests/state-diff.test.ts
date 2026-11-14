// 값 바뀜(State Diff · 형 11-15) — 셈(언제 재생하나) + 소스 글자(어디에 끼웠나 · 움직임 = transform · opacity 만 · 한 번)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { SD_MS, SD_NEW, SD_OLD, SD_SHIFT, diffDone, diffInit, diffNext, isFresh, shouldPlay } from "../ui/state-diff-core.ts";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("본 값(kinetics state-diff): .42s · 8px · 새 값 .35 → 1 · 옛 값 끝만 .2 → .4(읽혀야 함)", () => {
  assert.deepEqual([SD_MS, SD_SHIFT, SD_OLD, SD_NEW], [420, 8, 0.4, 0.35]);
  const css = src("ui/state-diff.css");
  assert.match(css, /--sd-t:\.42s/);
  assert.match(css, /@keyframes nmSdOld \{ from \{ opacity:\.7; transform:none; \} to \{ opacity:\.4; transform:translateX\(-8px\); \} \}/);
  assert.match(css, /@keyframes nmSdNew \{ from \{ opacity:\.35; transform:translateX\(8px\); \} to \{ opacity:1; transform:none; \} \}/);
});

test("재생 = 값이 실제로 바뀔 때만(처음 뜸 · 읽는 중 · 같은 값 = 가만히)", () => {
  assert.equal(shouldPlay("밝게", "어둡게"), true);
  assert.equal(shouldPlay("밝게", "밝게"), false);
  assert.equal(shouldPlay("…", "20개"), false);
  assert.equal(shouldPlay("", "20개"), false);
  assert.equal(shouldPlay(undefined, "20개"), false);
  assert.equal(shouldPlay("20개", "–"), false);
  assert.equal(shouldPlay(12, 13), true);
  assert.equal(shouldPlay(" 켬 ", "켬"), false);
});

test("줄 안 값: 바뀌면 옛 값을 들고 있다가 끝나면 치움 · 연달아 바뀌면 열쇠가 올라감", () => {
  let s = diffInit("폰 따라");
  assert.deepEqual(s, { cur: "폰 따라", old: "", n: 0 });
  assert.equal(diffNext(s, "폰 따라"), s);
  s = diffNext(s, "밝게");
  assert.deepEqual(s, { cur: "밝게", old: "폰 따라", n: 1 });
  s = diffNext(s, "어둡게");
  assert.deepEqual(s, { cur: "어둡게", old: "밝게", n: 2 });
  s = diffDone(s);
  assert.deepEqual(s, { cur: "어둡게", old: "", n: 2 });
  assert.equal(diffDone(s), s);
  const w = diffNext(diffInit("…"), "20개");
  assert.equal(w.old, "");
});

test("최근 바뀜 줄 = 화면을 연 뒤에 생긴 줄만", () => {
  assert.equal(isFresh(2000, 1000), true);
  assert.equal(isFresh(1000, 1000), false);
  assert.equal(isFresh(undefined, 1000), false);
  assert.equal(isFresh(Number.NaN, 1000), false);
});

test("움직임 = transform · opacity 만 · 되풀이 0 · 움직임 줄이기 = 바로", () => {
  const css = src("ui/state-diff.css");
  assert.doesNotMatch(css, /infinite/);
  assert.doesNotMatch(css, /transition:/);
  for (const m of css.matchAll(/@keyframes \w+ \{(.*)\}\s*$/gm)) {
    const props = [...m[1].matchAll(/([a-z-]+):/g)].map((x) => x[1]);
    assert.deepEqual(props.filter((p) => p !== "opacity" && p !== "transform"), [], m[0]);
  }
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /backdrop-filter:blur/);                       // 유리
  assert.match(css, /color-mix\(in srgb, currentColor \d+%, transparent\)/);   // 톤온톤
  assert.match(css, /--sd-lime:#CFFF40/); assert.match(css, /--sd-lime:#4f7a00/);
});

test("끼운 자리", () => {
  assert.match(src("ui/settings-extra.tsx"), /nm-sd-band[^\n]*\n[^\n]*<StateDiff label=/);
  assert.equal(src("ui/sched-desk.tsx").split("<DiffPair ").length - 1, 2);
  assert.match(src("ui/sched-desk.tsx"), /play=\{isFresh\(c\.at, since\)\}/);
  assert.equal(src("ui/yeta-settings.tsx").split("<DiffValue value={v} />").length - 1, 3);
  for (const f of ["chat-font", "enter-key", "idle-blind", "live-shine", "wake-depth"]) assert.match(src(`ui/${f}.tsx`), /<DiffValue value=/, f);
  assert.equal(src("home/follow-pulse.tsx").split("<DiffValue ").length - 1, 3);
  assert.match(src("ui/go-button.tsx"), /GoButton/);   // 저장 단추는 그대로
});

test("60프레임: 그림자 · 배치를 되풀이해 움직이던 곳 = 투명도 · transform 으로", () => {
  for (const [f, k] of [["ui/ver-badge.css", "nmVerPulse"], ["ui/status-line.css", "nmSlVerPulse"], ["ui/status-board.css", "nsbGlow"], ["ui/yeta-chat.css", "nmKickArm"]] as const) {
    const line = src(f).split("\n").find((l) => l.includes(`@keyframes ${k}`)) || "";
    assert.ok(line, k); assert.doesNotMatch(line, /box-shadow/, k);
  }
  assert.doesNotMatch(src("home/send-button.css"), /transition:top/);
  assert.match(src("home/send-button.css"), /\.nm-send-dock\[data-fit\] \{ top:0;[^}]*transition:transform/);
  assert.doesNotMatch(src("ui/shell.css").split("\n").find((l) => l.startsWith(".nm-split-grip i")) || "x height", /height \.15s/);
});

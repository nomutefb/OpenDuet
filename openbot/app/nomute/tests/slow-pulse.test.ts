// 느린 깜빡임 한 박자(11-14 형 맥 뜨거움 · 클라우드 세션) — 불빛 숨쉬기 · 퍼지는 테 = 초당 12번 · PC 블랙 톤 = 3D 바탕 한 번만 · 눈에 차이 없는 유리 흐림 끔
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PULSE_MS, ledBeat, ledOpacity, ringT } from "../ui/slow-pulse.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
test("불빛 진하기 = 앞 판 꼴(1 ↔ .45) · 종류별 박자", () => {
  near(ledOpacity(0), 1); near(ledOpacity(1.6), 0.45); near(ledOpacity(3.2), 1);
  assert.deepEqual(ledBeat("nm-sl-led ok"), [3.2, 0]); assert.deepEqual(ledBeat("nm-sl-led warn"), [3.2, 0.8]); assert.deepEqual(ledBeat("nm-sl-led bad"), [2.4, 1.6]);
  near(ledOpacity(0, 3.2, 0.8), ledOpacity(0.8));   // warn = 0.8초 앞섬
  for (let t = 0; t < 4; t += PULSE_MS / 1000) assert.ok(Math.abs(ledOpacity(t + PULSE_MS / 1000) - ledOpacity(t)) < 0.05);   // 한 박자 진하기 차 = 눈에 안 띔
});
test("퍼지는 테 = 0 에서 1 로 · 처음이 빠름(ease-out) · 주기마다 다시", () => {
  near(ringT(0), 0); assert.ok(ringT(0.45) > 0.25 && ringT(0.45) < 0.5); assert.ok(ringT(1.79) > 0.99); near(ringT(1.8 + 0.3), ringT(0.3));
});
test("조약돌 = 다음 박자까지 잠(주사율마다 안 깸)", () => {
  const src = rd("../ui/bloub.tsx");   // .tsx 는 node 가 못 읽음 = 글자로 확인하고 같은 식을 여기서 셈(./bloub-cool.test.ts 와 같은 길)
  assert.match(src, /export const bloubWait = \(now: number, lastDraw: number, step = BLOUB_STEP_MS\) => Math\.max\(0, step - \(now - lastDraw\) - 4\);/);
  assert.match(src, /window\.setTimeout\(\(\) => \{ raf = requestAnimationFrame\(step\); \}, bloubWait\(/);
  const wait = (now: number, l: number, step = 50) => Math.max(0, step - (now - l) - 4);
  assert.equal(wait(1000, 1000), 46); assert.equal(wait(1030, 1000), 16); assert.equal(wait(1100, 1000), 0);
});
test("CSS · 진입점", () => {
  const led = rd("../ui/status-line.css"), list = rd("../home/news-list.css"), shell = rd("../ui/shell.css"), pc = rd("../ui/pc-light.css"), sw = rd("../ui/perf-switch.css");
  assert.match(led, /\.nm-sl-led \{[^}]*opacity: var\(--led-o, 1\)/); assert.doesNotMatch(led, /@keyframes nmSlLed/);
  assert.match(list, /\.live::after[^{]*\{[^}]*var\(--live-t, 0\)/); assert.match(list, /var\(--live-on, 0\)/); assert.doesNotMatch(list, /box-shadow:0 0 0 7px/);
  assert.match(shell, /\.nm-split-l \.nm-app-ambient \{ --motion:0; \}/);
  assert.match(pc, /html\.dark \.nm-yeta\.nm-split-root :is\(\.nm-strip, \.nm-sumc,/); assert.match(pc, /backdrop-filter: none/);
  assert.match(sw, /html\.perf-no-bg [^{]*\.nm-app-ambient canvas/);
  assert.match(rd("../home/home-scene.css"), /html\[data-home-wait\] \.nm-home-splash img \{ animation:nmSplashBreath/);
  const main = rd("../main.tsx"); assert.match(main, /import "\.\/ui\/slow-pulse";/); assert.match(main, /import "\.\/ui\/pc-light\.css";/);
});

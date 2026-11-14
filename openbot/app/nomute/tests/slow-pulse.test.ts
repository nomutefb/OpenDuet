// 느린 깜빡임 한 박자(11-14 형 맥 뜨거움 · 클라우드 세션) — 불빛 숨쉬기 · 퍼지는 테 = 초당 10번 · PC 블랙 톤 = 3D 바탕 한 번만 · 눈에 차이 없는 유리 흐림 끔
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PULSE_MS, ledBeat, ledOpacity, ringT } from "../ui/slow-pulse.ts";
import { BEAT_MS, beatWait } from "../ui/beat.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
test("불빛 진하기 = 앞 판 꼴(1 ↔ .45) · 종류별 박자", () => {
  near(ledOpacity(0), 1); near(ledOpacity(1.6), 0.45); near(ledOpacity(3.2), 1);
  assert.deepEqual(ledBeat("nm-sl-led ok"), [3.2, 0]); assert.deepEqual(ledBeat("nm-sl-led warn"), [3.2, 0.8]); assert.deepEqual(ledBeat("nm-sl-led bad"), [2.4, 1.6]);
  near(ledOpacity(0, 3.2, 0.8), ledOpacity(0.8));   // warn = 0.8초 앞섬
  for (let t = 0; t < 4; t += PULSE_MS / 1000) assert.ok(Math.abs(ledOpacity(t + PULSE_MS / 1000) - ledOpacity(t)) < 0.056);   // 한 박자 진하기 차 = 눈에 안 띔
});
test("퍼지는 테 = 0 에서 1 로 · 처음이 빠름(ease-out) · 주기마다 다시", () => {
  near(ringT(0), 0); assert.ok(ringT(0.45) > 0.25 && ringT(0.45) < 0.5); assert.ok(ringT(1.79) > 0.99); near(ringT(1.8 + 0.3), ringT(0.3));
});
test("조약돌 · 불빛 = 같은 격자에 깸(주사율마다 안 깸 · 바꾸는 순간을 합침)", () => {
  assert.equal(beatWait(1000), 50); assert.equal(beatWait(1010), 40); assert.equal(beatWait(1030), 70);   // 반 박자 안쪽 = 그다음 점
  assert.equal(beatWait(1000, 100), 100); assert.equal(beatWait(1049, 100), 51); assert.equal(beatWait(1060, 100), 140);
  for (let now = 0; now < 500; now += 7) assert.equal((now + beatWait(now, PULSE_MS)) % BEAT_MS, 0);   // 불빛이 깨는 점 = 얼굴 격자 위
  const src = rd("../ui/bloub.tsx");   // .tsx 는 node 가 못 읽음 = 글자로 확인(./bloub-cool.test.ts 와 같은 길)
  assert.match(src, /window\.setTimeout\(\(\) => \{ onBeat = true; raf = requestAnimationFrame\(step\); \}, beatWait\(performance\.now\(\), BLOUB_STEP_MS\)\)/);
  assert.match(rd("../ui/slow-pulse.ts"), /beatWait\(performance\.now\(\), PULSE_MS\)/);
});
test("CSS · 진입점", () => {
  const led = rd("../ui/status-line.css"), list = rd("../home/news-list.css"), shell = rd("../ui/shell.css"), pc = rd("../ui/pc-light.css"), sw = rd("../ui/perf-switch.css");
  assert.match(led, /\.nm-sl-led \{[^}]*opacity: var\(--led-o, 1\)/); assert.doesNotMatch(led, /@keyframes nmSlLed/);
  assert.match(list, /\.live::after[^{]*\{[^}]*var\(--live-t, 0\)/); assert.match(list, /var\(--live-on, 0\)/); assert.doesNotMatch(list, /box-shadow:0 0 0 7px/);
  assert.match(shell, /\.nm-split-l \.nm-app-ambient \{ --motion:0; \}/);
  assert.match(pc, /html\.dark \.nm-yeta\.nm-split-root :is\(\.nm-strip, \.nm-sumc,/); assert.match(pc, /backdrop-filter: none/); assert.match(pc, /html\.dark \.nm-yeta\.nm-split-root::before \{/);   // 맨 위 띠(가상 요소)
  assert.match(sw, /html\.perf-no-bg [^{]*\.nm-app-ambient canvas/);
  assert.match(rd("../home/home-scene.css"), /html\[data-home-wait\] \.nm-home-splash img \{ animation:nmSplashBreath/);
  const main = rd("../main.tsx"); assert.match(main, /import "\.\/ui\/slow-pulse";/); assert.match(main, /import "\.\/ui\/pc-light\.css";/);
});

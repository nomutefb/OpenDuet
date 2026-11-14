// 기간 막대 셈(형 11-15 영상 「스케줄 일정 조정을 기간을 이런식으로 조정 가응하게해줘」) — 끄는 중 자리 · 놓을 때 붙는 자리 · 글자 · 화면 물림
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dragTo, hmOf, snapTo, spanKo, wdKo } from "../ui/range-bar-core.ts";

const L = { lo: 0, hi: 23, min: 0, step: 1 };
test("몸통을 끌면 통째로 · 길이 그대로 · 눈금 밖으로 안 나감", () => {
  assert.deepEqual(dragTo("move", { a: 6, b: 9 }, 2.07, L), { a: 8.07, b: 11.07 });
  assert.deepEqual(dragTo("move", { a: 6, b: 9 }, -99, L), { a: 0, b: 3 });
  assert.deepEqual(dragTo("move", { a: 6, b: 9 }, 99, L), { a: 20, b: 23 });
});
test("손잡이를 끌면 그 끝만 · 서로 지나치지 않음", () => {
  assert.deepEqual(dragTo("b", { a: 8, b: 11 }, 5.53, L), { a: 8, b: 16.53 });
  assert.deepEqual(dragTo("b", { a: 8, b: 11 }, -99, L), { a: 8, b: 8 });
  assert.deepEqual(dragTo("a", { a: 8, b: 11 }, 99, L), { a: 11, b: 11 });
  assert.deepEqual(dragTo("b", { a: 8, b: 11 }, 99, L), { a: 8, b: 23 });
  assert.deepEqual(dragTo("a", { a: 8, b: 11 }, 1, { ...L, min: 1 }), { a: 9, b: 11 });
  assert.deepEqual(dragTo("a", { a: 8, b: 11 }, 9, { ...L, min: 1 }), { a: 10, b: 11 }, "가장 짧은 길이는 지킴");
});
test("놓으면 한 단위에 붙음(본 영상 = 07:59 → 08:00 · 16:32 → 16:30)", () => {
  assert.deepEqual(snapTo("move", { a: 7.98, b: 10.98 }, L), { a: 8, b: 11 });
  assert.deepEqual(snapTo("b", { a: 8, b: 16.53 }, { ...L, step: 0.5 }), { a: 8, b: 16.5 });
  assert.deepEqual(snapTo("b", { a: 8, b: 16.4 }, L), { a: 8, b: 16 });
  assert.deepEqual(snapTo("move", { a: 21.6, b: 23 }, L), { a: 22, b: 23 }, "끝에 닿아도 길이 그대로");
});
test("글자 = 시각 · 길이 · 요일 묶음", () => {
  assert.equal(hmOf(8), "08:00"); assert.equal(hmOf(16.53), "16:32"); assert.equal(hmOf(24), "24:00");
  assert.equal(spanKo(3), "3시간"); assert.equal(spanKo(8.5), "8시간 30분"); assert.equal(spanKo(0.75), "45분"); assert.equal(spanKo(0), "0분");
  assert.equal(wdKo([0, 1, 2, 3, 4, 5, 6]), "매일"); assert.equal(wdKo([5, 4, 3, 2, 1]), "평일"); assert.equal(wdKo([6, 0]), "주말"); assert.equal(wdKo([1, 3, 5]), "월·수·금");
});
test("화면 = 스케줄 「몇 시간마다」의 시작~끝 자리에 물림 · 계속 도는 움직임 0 · 끄는 중엔 자리 전환 끔", () => {
  const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
  const sd = rd("../ui/sched-desk.tsx"), css = rd("../ui/range-bar.css"), rb = rd("../ui/range-bar.tsx");
  assert.match(sd, /<RangeBar name=\{`\$\{r\.name\} 시간대`\} from=\{k\.from\} to=\{Math\.max\(k\.to, k\.from\)\} end=\{23\}/);
  assert.doesNotMatch(sd, /<Num label="시작 시"/, "숫자 칸 둘은 막대로 바뀜");
  assert.doesNotMatch(css, /infinite/, "한 번 재생하고 끝");
  assert.match(css, /\.nm-rb\[data-drag\] \.nm-rb-bar \{ transition:transform/);
  assert.match(css, /\.nm-rb-track \{[^}]*touch-action:none/);
  assert.match(rb, /if \(!d\.raf\) d\.raf = requestAnimationFrame\(/, "프레임마다 한 번만 그림");
});

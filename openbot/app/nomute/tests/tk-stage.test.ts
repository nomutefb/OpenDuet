// 요약 단계 가로 + 단계마다 걸린 시간(형 11-13 02:26 「각 단계에서 몇분인지 … 가로로 … > > 방향으로 시간은 뜨고」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { stageDur } from "../ui/task-state.ts";

test("단계 시간 = 본 때로만 · 못 본 앞 단계는 null(지어낸 분 0)", () => {
  const t = 1000, M = 60e3;
  assert.deepEqual(stageDur(t, { wait: t + 1e3 }, "wait", t + 2 * M), { wait: 2 * M, run: null, fed: null });
  assert.deepEqual(stageDur(t, { wait: t + 1e3, run: t + 3 * M }, "run", t + 5 * M), { wait: 3 * M, run: 2 * M, fed: null });
  assert.deepEqual(stageDur(t, { wait: t + 1e3, run: t + 3 * M, fed: t + 6 * M }, "fed", t + 7 * M), { wait: 3 * M, run: 3 * M, fed: M });
  assert.deepEqual(stageDur(t, { run: t + 9 * M }, "run", t + 10 * M), { wait: null, run: null, fed: null }, "요약 중에 처음 봄 = 차례 · 요약 시작 모름");
});

test("카드 = 가로 줄(ol.h) · 다음 단계도 흐리게 보임", () => {
  const tp = readFileSync(new URL("../ui/task-panel.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/task-panel.css", import.meta.url), "utf8");
  assert.match(tp, /<ol className="nm-tk2-log h">\{log\.map\(/);
  assert.match(css, /\.nm-tk2-log\.h \{ flex-direction:row;/);
  assert.match(css, /\.nm-tk2-log\.h li \+ li::before \{ content:"›";/);
});

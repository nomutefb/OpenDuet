import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// 앱 화면이 부르는 서버 길(ui 안 "/api/<이름>" 글자)이 shim 통과 목록에 다 있는지 — 없으면 앱 안에선 404 「이 화면엔 이 자료가 없어」로 막힘
//   (11-10 「요약 고치기」 revise 23분 사고 · 같은 밤 ys · upload · edit · framethumb 가 빠진 채 땅 됨 → 뎅이 한 시험으로 묶음)
const root = new URL("..", import.meta.url).pathname;
const shim = readFileSync(join(root, "shim/install.ts"), "utf8");
const pass = (() => { const m = /\/\^\\\/api\\\/\(([^)]*)\)/.exec(shim); assert.ok(m, "shim 통과 목록 정규식"); return new RegExp(`^/api/(${m[1]})(/|$|\\?)`); })();
const files = (d: string): string[] => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(n) ? [p] : []; });
const own = new Set(["office"]);   // /api/office/* = 우리 서버로 가는 길(shim 이 따로 받음)

test("ui 가 부르는 /api 길 = 다 shim 통과", () => {
  const miss: string[] = [];
  for (const f of files(join(root, "ui"))) {
    const code = readFileSync(f, "utf8").split("\n").map((l) => l.replace(/\/\/.*$/, "")).join("\n");   // 주석 속 길은 셈 안 함
    for (const m of code.matchAll(/["'`]\/api\/([a-z0-9-]+)/g)) {
      if (own.has(m[1]) || pass.test(`/api/${m[1]}`)) continue;
      miss.push(`${f.slice(root.length)} → /api/${m[1]}`);
    }
  }
  assert.deepEqual([...new Set(miss)], []);
});

// 뉴스 에디터 위 탭 셋 = 뉴스 · SNS · 채널(형 11-15 「2의 화면을 1의 화면처럼 탭으로」 · 「추가로 나올 내용은 서랍의 sns와 채널 / 그리고 서랍은 그 내용이 사라지면 댐 / 불러오는 개념이 아니라 저기 박혀야 하고 자연스러워야함」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { NED_TABS, nedTabOf } from "../ui/ned-tabs.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("길 → 탭 · 옛 「전체」 주소도 그 탭", () => {
  assert.deepEqual(NED_TABS.map((t) => [t.id, t.to, t.name]), [["news", "/newsed", "뉴스"], ["sns", "/sns", "SNS"], ["chan", "/chan", "채널"]]);
  for (const [p, t] of [["/newsed", "news"], ["/sns", "sns"], ["/sns/", "sns"], ["/trend", "sns"], ["/chan", "chan"], ["/chanfull", "chan"], ["/home", "news"], ["", "news"]]) assert.equal(nedTabOf(p), t, p);
  for (const t of NED_TABS) assert.equal(nedTabOf(t.to), t.id);
});

test("탭 줄 = 대화방 위 폴더 탭과 같은 옷 · 탭 바꿈은 기록을 안 쌓음", () => {
  const n = rd("../ui/news-editor.tsx");
  assert.match(n, /<div className="nm-tswitch fold nm-ned-tabs" role="tablist"/);
  assert.match(n, /className=\{`nm-ftab\$\{tab === t\.id \? " on" : ""\}`\}/);
  assert.match(n, /<span className="nm-ftab-nm">\{t\.name\}<\/span>/);
  assert.match(n, /router\.history\.replace\(/);
  assert.match(n, /import "\.\/teams\.css";/);
});

test("SNS · 채널 = 이 화면 안 판 · 한 번 연 탭은 살려 둠(숨기기만) · 폰 기사 한 장에선 탭 줄 없음", () => {
  const n = rd("../ui/news-editor.tsx"), c = rd("../ui/news-editor.css");
  assert.match(n, /alive\.current\.add\(tab\);/);
  assert.match(n, /alive\.current\.has\(k\) \? \(/);
  assert.match(n, /<div className="nm-ned" hidden=\{tab !== "news"\}>/);
  assert.match(n, /\{wide \|\| \(sel && tab === "news"\) \? null : <NedTabs tab=\{tab\} pick=\{pick\} \/>\}/);   // PC = 맨 위 메인 탭 줄(tests/area-tabs.test.ts)
  assert.match(c, /\.nm-ned\[hidden\], \.nm-ned-old\[hidden\] \{ display:none; \}/);
});

test("서랍엔 없음 · 껍데기는 그 길을 뉴스 에디터로", () => {
  const d = rd("../ui/drawer-page.tsx").replace(/\/\/.*$/gm, ""), s = rd("../ui/shell.tsx");
  assert.doesNotMatch(d, /"sns"|"chan"/);
  assert.match(s, /if \(nedTabOf\(p\) !== "news"\) return \{ modal: "nedit" \};/);
  assert.doesNotMatch(s, /\{ id: "(chan|sns)",/);
  for (const p of ["/chan", "/sns", "/trend", "/chanfull"]) assert.ok(rd("../router.tsx").includes(`"${p}"`), p);   // 길은 그대로 살아 있음
});

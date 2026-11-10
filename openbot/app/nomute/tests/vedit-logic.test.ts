import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { SELS, optsPick, buildOpts, hasAction, fileWhy, partsOf, landed, absUrl, dlHref, PART } from "../ui/vedit-logic.ts";

// 정원 「영상 편집」 판 1(team-4 · 깃 11-10) — 원본 edit.html buildOpts · functions/api/edit.js 와 같은 값인지
test("기본 = 자막 켬(번역 같이 · 문어 · 깔끔 · 군말 빼기) · 소리 고르기 켬 · 나머지 안 보냄", () => {
  const o = buildOpts(optsPick({}));
  assert.deepEqual(o, { burn: true, lang: "dual", tone: "lit", style: "clean", filler: true, shtype: "none", aud_norm: true });
  assert.ok(hasAction(o));
});

test("자르기 · 비율 · 해상도 · 자막 끔", () => {
  const o = buildOpts({ subs: "off", cut: "hard", take: "on", bgm: "on", vid_ar: "9:16", vid_fit: "blur", vid_res: "1080", aud_norm: "off" });
  assert.deepEqual(o, { cut: true, cutlv: "hard", take: true, bgm: true, vid_ar: "9:16", vid_fit: "blur", vid_res: "1080", aud_norm: false });
  assert.ok(!("burn" in o));
  assert.ok(!hasAction(buildOpts({ subs: "off", aud_norm: "off" })), "할 일 0 = 서버 400 앞에서 막음");
  assert.equal(buildOpts({ style: "box" }).shtype, "box");
});

test("고르는 값 = 서버 STR 표 안", () => {
  let src = "";
  try { src = readFileSync(new URL("../../../../../editor/functions/api/edit.js", import.meta.url), "utf8"); } catch { /* editor 저장소가 옆에 없으면 건너뜀 */ }
  if (!src) return;
  for (const k of ["lang", "tone", "style", "cutlv", "vid_ar", "vid_fit", "vid_res"]) {
    const m = src.match(new RegExp(`\\b${k}:\\s*\\[([^\\]]*)\\]`)); assert.ok(m, k);
    const allow = [...m![1].matchAll(/'([^']*)'/g)].map((x) => x[1]);
    const sel = SELS.find((s) => s.k === (k === "cutlv" ? "cut" : k))!;
    for (const [v] of sel.vals) if (!["src", "off"].includes(v) || allow.includes(v)) assert.ok(allow.includes(v), `${k}=${v}`);
  }
});

test("파일 거름 · 조각 · 끝 판정 · 주소", () => {
  assert.equal(fileWhy("a.mp4", 10), ""); assert.ok(fileWhy("a.png", 10)); assert.ok(fileWhy("a.mov", 3 * 1024 ** 3));
  assert.equal(partsOf(1), 1); assert.equal(partsOf(PART + 1), 2);
  const t0 = Date.now();
  assert.ok(!landed(null, t0)); assert.ok(!landed({ url: "x", xtr_wait: true }, t0));
  assert.ok(landed({ url: "x", ts: Math.floor(t0 / 1000) }, t0)); assert.ok(!landed({ url: "x", ts: Math.floor((t0 - 600e3) / 1000) }, t0), "앞 판 결과 = 아직");
  assert.ok(landed({ error: "boom" }, t0));
  assert.equal(absUrl("ly_out/a/subbed.mp4"), "/ly_out/a/subbed.mp4"); assert.equal(absUrl("https://r2/x.mp4"), "https://r2/x.mp4");
  assert.ok(dlHref("https://r2/x.mp4", "a.mp4").startsWith("/api/dl?u=https%3A%2F%2Fr2%2Fx.mp4&n=a.mp4"));
});

test("베스트컷 = 서버 framethumb 꼴(n 1~3 · scale 2 · ar 다섯) · 끝 판정", async () => {
  const { ftOpts, ftDone } = await import("../ui/vedit-logic.ts");
  assert.deepEqual(ftOpts(2, "4:5"), { n: 2, scale: 2, ar: "4:5" });
  assert.deepEqual(ftOpts(9, "x"), { n: 2, scale: 2, ar: "4:5" });
  assert.ok(ftDone({ state: "done" })); assert.ok(ftDone({ state: "failed" })); assert.ok(!ftDone({ state: "run" })); assert.ok(!ftDone(null));
});

test("자를 곳 먼저 보기 = 스캔 opts · 고른 뒤 cutref · cutoff", async () => {
  const { scanOpts, withCut, cutsDone, tc } = await import("../ui/vedit-logic.ts");
  assert.deepEqual(scanOpts({ cut: "hard", take: "on" }), { cutscan: true, cut: true, cutlv: "hard", take: true });
  assert.deepEqual(scanOpts({}), { cutscan: true, cut: true, cutlv: "std", take: false });
  const o = withCut({ burn: true, cut: true, cutlv: "std", take: true, aud_norm: true }, "261110183000-abc123", [3, 1, 3, -1]);
  assert.deepEqual(o, { burn: true, aud_norm: true, cutref: "261110183000-abc123", cutoff: "1,3" });
  assert.ok(!("cutoff" in withCut({}, "261110183000-abc123", [])));
  assert.ok(/^[0-9]{1,4}(,[0-9]{1,4}){0,199}$/.test(String(o.cutoff)), "서버 cutoff 정규식");
  assert.ok(cutsDone({ rm: [] })); assert.ok(!cutsDone({})); assert.equal(tc(75.25), "1:15.2");
});

test("자막 고쳐 다시 입히기 = subs.json 줄 · 고친 줄만 segs · 별표 키워드 지킴", async () => {
  const { subRows, effSegs, reburnBody, reburnOpts, canReburn } = await import("../ui/vedit-logic.ts");
  const j = { segs: [{ s: 0, e: 1.234, ko: "오늘 *속보* 입니다" }, { s: 1.2, e: 3, ko: "", src: "hello world" }, { s: 3, e: 3, ko: "빈 길이" }] };
  const rows = subRows(j);
  assert.equal(rows.length, 3); assert.equal(rows[0].t, "오늘 속보 입니다"); assert.equal(rows[1].f, "src");
  assert.deepEqual(effSegs(rows), [{ s: 0, e: 1.2, ko: "오늘 *속보* 입니다" }, { s: 1.2, e: 3, ko: "", src: "hello world" }]);   // 겹침 = 앞 끝을 1.2 로 · 길이 0 = 뺌
  const same = reburnBody("261110183000-abc123", rows, subRows(j), { lang: "dual", burn: true, aud_norm: true, vid_ar: "9:16" });
  assert.equal(same.edited, false); assert.deepEqual(same.body, { reburn: "261110183000-abc123", opts: { lang: "dual", burn: true } });
  const ed = rows.map((r, i) => (i === 0 ? { ...r, t: "오늘 속보 였습니다" } : r));
  const b = reburnBody("261110183000-abc123", ed, subRows(j));
  assert.equal(b.edited, true); assert.deepEqual((b.body!.segs as { ko: string }[])[0].ko, "오늘 *속보* 였습니다");
  assert.ok(reburnBody("261110183000-abc123", rows.map((r) => ({ ...r, t: " " })), subRows(j)).error);
  assert.deepEqual(reburnOpts({ cutref: "x", cutlv: "std" }), { cutlv: "std", cut: true, burn: true });
  assert.ok(canReburn("https://r2.example/ly_out/x/src.mp4")); assert.ok(!canReburn("")); assert.ok(!canReburn("ly_out/x/src.mp4"));
  const t = Date.UTC(2026, 10, 10, 14, 0, 0);   // 23:00 KST
  assert.ok(canReburn("https://r2.example/up_src/261110220000-ab.mp4", t)); assert.ok(!canReburn("https://r2.example/up_src/261108220000-ab.mp4", t));
});

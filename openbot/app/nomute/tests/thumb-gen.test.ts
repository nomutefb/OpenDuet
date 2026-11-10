import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_SEL, STYLES, SUBS, arVal, baseSid, buildOpts, cloneAspect, colorPreset, pickStyle, restoreSel, summary } from "../ui/thumb-gen-opts.ts";

// 서버 화이트리스트 = editor functions/api/genimg.js(같은 집합이어야 화면 값이 서버에서 안 버려짐)
const SRV = {
  STYLES: ["photo", "webtoon", "cartoon", "watercolor", "cinematic", "illust", "iso3d", "pictogram", "lego"],
  SUBS: ["auto", "film", "bw", "cinedoc", "newsreel", "noir", "gekiga", "hardboiled", "jidai", "sunjung", "chibi", "brush", "flat", "woodcut", "bleed", "fine", "sumuk", "gouache", "oil", "neon", "film35", "expressionism", "riso", "paper", "anime", "retro80", "clay", "lowpoly", "diorama", "line", "blueprint"],
};

test("화풍 · 세부 화풍 = 서버가 받는 값만", () => {
  assert.deepEqual(STYLES.map(([k]) => k).sort(), [...SRV.STYLES].sort());
  for (const list of Object.values(SUBS)) for (const [k] of list) assert.ok(SRV.SUBS.includes(k), k);
});

test("기본 opts = 옛 #geniGo 와 같은 꼴(극화 · 4:5 · FHD · 1개 · jpg · 무드 자동 · Gemini)", () => {
  const o = buildOpts({ ...DEFAULT_SEL, wish: "  비 오는\n광장  " }, null)!;
  assert.equal(o.style, "webtoon"); assert.equal(o.aspect, "4:5"); assert.equal(o.size, "FHD"); assert.equal(o.count, 1);
  assert.equal(o.fmt, "jpg"); assert.equal(o.mood, "auto"); assert.equal(o.engine, "gemini"); assert.equal(o.kweb, true);
  assert.equal(o.wish, "비 오는 광장");
  assert.equal("refB64" in o, false);   // 첨부 없음 = 필드 없음(옛 발사 그대로)
});

test("무드 직접인데 네 축이 다 0 = auto 로(옛 anyAx)", () => {
  assert.equal(buildOpts({ ...DEFAULT_SEL, mood: "axes" }, null)!.mood, "auto");
  assert.equal(buildOpts({ ...DEFAULT_SEL, mood: "axes", moodAx: { ct: 1, sh: 0, ew: 0, rr: 0 } }, null)!.mood, "axes");
});

test("직접 비율 = 1~99 · 1:4~4:1 · 못 쓰면 발사 못 함", () => {
  assert.equal(arVal("1", "1"), "1:1"); assert.equal(arVal("21", "9"), "21:9");
  assert.equal(arVal("5", "1"), null); assert.equal(arVal("0", "3"), null); assert.equal(arVal("", "3"), null);
  assert.equal(buildOpts({ ...DEFAULT_SEL, aspect: "custom", arW: "9", arH: "1" }, null), null);
});

test("참고 사진 = b64 + 모드 동봉 · GPT 복제 = 채도 -20 기본", () => {
  const ref = { b64: "QUJDREVGR0hJSktMTU5PUA==", w: 800, h: 1000, url: "" };
  const o = buildOpts({ ...DEFAULT_SEL, refMode: "clone" }, ref)!;
  assert.equal(o.refB64, ref.b64); assert.equal(o.refMode, "clone");
  assert.deepEqual(colorPreset({ engine: "gpt", refMode: "clone" }, true), { sat: -20, bri: 0 });
  assert.deepEqual(colorPreset({ engine: "gpt", refMode: "clone" }, false), { sat: 0, bri: 0 });
  assert.deepEqual(cloneAspect(800, 1000), { aspect: "4:5", arW: "", arH: "" });
  assert.deepEqual(cloneAspect(236, 512), { aspect: "custom", arW: "41", arH: "89" });   // 러너 Fraction.limit_denominator(99) 와 같은 값(옛 260905 실측)
});

test("레고 = GPT 기본(엔진 손댄 적 없을 때만) · 없는 세부 = 기본", () => {
  assert.equal(pickStyle(DEFAULT_SEL, "lego").engine, "gpt");
  assert.equal(pickStyle({ ...DEFAULT_SEL, engineTouched: true }, "lego").engine, "gemini");
  assert.equal(pickStyle({ ...DEFAULT_SEL, sub: "gekiga" }, "photo").sub, "auto");
});

test("저장 옵션 복원 = 모르는 값은 기본 · 주문은 안 살림", () => {
  const s = restoreSel({ style: "nope", size: "8K", count: "9", engine: "gpt", moodAx: { ct: 7 }, colorAx: { sat: -99 }, wish: "남은 글", shot: "S08" });
  assert.equal(s.style, "webtoon"); assert.equal(s.size, "FHD"); assert.equal(s.count, "1"); assert.equal(s.engine, "gpt");
  assert.equal(s.moodAx.ct, 2); assert.equal(s.colorAx.sat, -50); assert.equal(s.wish, ""); assert.equal(s.shot, "S08");
  assert.equal(summary(s), "극화 · 4:5 · FHD · 1개 · GPT");
});

test("수정본 sid → 기본 화풍(thumb_gen.py _base_sid)", () => {
  assert.equal(baseSid("photo_r3"), "photo"); assert.equal(baseSid("webtoon"), "webtoon");
});

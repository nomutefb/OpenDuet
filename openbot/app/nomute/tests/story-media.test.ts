// 밥상 이야기 = 붙은 음악도 틈(형 11-16 18:0x 구름 맥 창 「밥상에서 애들이 만든 영상이나 음악은 압축된채로 밥상이야기에서 볼 수 있게해줘」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const src = readFileSync(new URL("../ui/stories.tsx", import.meta.url), "utf8");
const AUD = /\.(mp3|m4a|aac|wav|ogg|oga|flac)$/i;
const mediaName = (p: string) => { let n = p.split("/").pop() || p; try { n = decodeURIComponent(n); } catch { /* 그대로 */ } return n.replace(/^\d{8}_\d{4}_/, ""); };

test("음악 꼴 = mp3 · m4a · wav … · 이름은 파일 이름만(앞 날짜 표 뺌) — 화면 파일과 같은 식", () => {
  assert.ok(src.includes("export const AUD = /\\.(mp3|m4a|aac|wav|ogg|oga|flac)$/i;"));
  assert.ok(src.includes('return n.replace(/^\\d{8}_\\d{4}_/, "");'));
  for (const p of ["a/b/노래.mp3", "x.M4A", "y.wav", "z.flac"]) assert.ok(AUD.test(p), p);
  for (const p of ["a.mp4", "b.png", "c.md"]) assert.ok(!AUD.test(p), p);
  assert.equal(mediaName("claude/뜸/spring-garden_files/20261116_1754_%EB%B0%A5%EC%83%81%20%EB%85%B8%EB%9E%98.mp3"), "밥상 노래.mp3");
});

test("그리기 = 영상 → 음악 → 사진 차례로 가림 · 음악은 누를 때 받음 · 받은 경로 그대로 틈", () => {
  assert.match(src, /: AUD\.test\(p\)\n\s+\? <figure key=\{p\} className="aud"><figcaption>\{mediaName\(p\)\}<\/figcaption><audio src=\{fileUrl\(p\)\} controls preload="none" \/><\/figure>/);
  assert.ok(src.indexOf("VID.test(p)") < src.indexOf("AUD.test(p)"));
});

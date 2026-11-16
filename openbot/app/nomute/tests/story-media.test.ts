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
  assert.match(src, /: x\.kind === "audio" \? <figure key=\{x\.key\} className="aud"><figcaption>\{x\.name\}<\/figcaption><audio src=\{x\.src\} controls preload="none" \/><\/figure>/);
  assert.match(src, /const k = kind === "video" \|\| VID\.test\(bare\) \? "video" : kind === "audio" \|\| AUD\.test\(bare\) \? "audio" :/);
});

// 지드라이브 링크로 틀기(형 11-16 18:25 「✓ ② 지드라이브로 바로 · 그 링크로 틀기」 · 실물 = 받기 주소는 video 로 못 틈 · 보기 틀은 뜸)
test("지드라이브 = 번호만 뽑아 「보기」 틀로 · 「링크로 열기」는 늘 같이 · https 아닌 주소는 안 그림", () => {
  const ID = "1ozLox_IH91sx9L9mW6kGetFgvx9rmPuJ";
  const driveId = (u: string) => { const m = /^https:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/([\w-]{10,})|(?:uc|open)\?(?:[^#\s]*&)?id=([\w-]{10,}))/.exec(u); return m ? m[1] || m[2] : ""; };
  assert.ok(src.includes('export const driveId = (u: string) => { const m = /^https:\\/\\/(?:drive|docs)\\.google\\.com\\/(?:file\\/d\\/([\\w-]{10,})|(?:uc|open)\\?(?:[^#\\s]*&)?id=([\\w-]{10,}))/.exec(u); return m ? m[1] || m[2] : ""; };'));   // 화면 파일과 같은 식
  for (const u of [`https://drive.google.com/file/d/${ID}/preview`, `https://drive.google.com/file/d/${ID}/view?usp=sharing`, `https://drive.google.com/uc?export=download&id=${ID}`, `https://drive.google.com/open?id=${ID}`]) assert.equal(driveId(u), ID, u);
  for (const u of ["https://evil.example.com/file/d/" + ID + "/preview", "http://drive.google.com/file/d/" + ID + "/preview", "https://drive.google.com/drive/folders/abc", "claude/뜸/x.mp4"]) assert.equal(driveId(u), "", u);
  assert.match(src, /kind: "drive", src: `https:\/\/drive\.google\.com\/file\/d\/\$\{id\}\/preview`, open: `https:\/\/drive\.google\.com\/file\/d\/\$\{id\}\/view`/);
  assert.match(src, /<iframe src=\{x\.src\} title=\{x\.name \|\| "지드라이브 파일"\} allow="autoplay; fullscreen" loading="lazy" \/>/);
  assert.match(src, /<a href=\{x\.open\} target="_blank" rel="noreferrer">링크로 열기<\/a>/);
  assert.match(src, /if \(abs && !\/\^https:\\\/\\\/\/i\.test\(raw\)\) return null;/);   // https 만
});

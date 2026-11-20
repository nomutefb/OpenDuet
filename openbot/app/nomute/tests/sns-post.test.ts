// 대화로 보내기 · SNS 글 카드(형 11-20 10:16 「미토스 보고 설계까지 진행하라고 시켜주셈 그냥 머지까지 끝내라고.」 · 미토스 5.2 ①②)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SHOT_RE, shotName, snsBlock, snsCaption, snsPostOf, snsSplit } from "../ui/sns-post";
import { pickPost, takeSnsBlocks } from "../ui/sns-share";

test("글 주소 꼴 = 인스타 p · reel · reels · tv · 스토리 / 스레드 post / X status · 꼬리 뗌", () => {
  assert.deepEqual(snsPostOf("https://www.instagram.com/p/DAbc_12-x/?igsh=MTZ3eWx4&utm_source=ig"), { site: "instagram", url: "https://www.instagram.com/p/DAbc_12-x/" });
  assert.deepEqual(snsPostOf("https://instagram.com/reels/C9zz/"), { site: "instagram", url: "https://www.instagram.com/reel/C9zz/" });
  assert.deepEqual(snsPostOf("https://www.instagram.com/nomute.kr/p/C1/"), { site: "instagram", url: "https://www.instagram.com/p/C1/", author: "nomute.kr" });
  assert.deepEqual(snsPostOf("https://www.instagram.com/stories/abc.def/3412345/?utm=1"), { site: "instagram", url: "https://www.instagram.com/stories/abc.def/3412345/", author: "abc.def", story: true });
  assert.deepEqual(snsPostOf("https://www.threads.net/@zuck/post/C8xY?xmt=AQG"), { site: "threads", url: "https://www.threads.com/@zuck/post/C8xY", author: "zuck" });
  assert.deepEqual(snsPostOf("https://twitter.com/elonmusk/status/1790000000000000000?s=20&t=abc"), { site: "x", url: "https://x.com/elonmusk/status/1790000000000000000", author: "elonmusk" });
  assert.deepEqual(snsPostOf("https://x.com/a_b/status/123/photo/1"), { site: "x", url: "https://x.com/a_b/status/123", author: "a_b" });
  assert.equal(snsPostOf("https://www.instagram.com/explore/p/xx/"), null);   // explore = 이름 아님
  assert.equal(snsPostOf("https://www.instagram.com/"), null);
  assert.equal(snsPostOf("https://x.com/home"), null);
  assert.equal(snsPostOf("https://evil.com/p/abc/"), null);
  assert.equal(snsPostOf("instagram.com/p/abc"), null);
});

test("싣는 두 줄 ↔ 읽기 = 같은 글 · 캡션 한 줄 · 「」 안 깨짐 · 500자", () => {
  const b = snsBlock({ site: "instagram", url: "https://www.instagram.com/p/C1/", author: "nomute.kr", text: "첫 줄\n둘째 「줄」  끝" });
  assert.equal(b, "https://www.instagram.com/p/C1/\n「Instagram @nomute.kr — 첫 줄 둘째 “줄” 끝」");
  const sp = snsSplit(`형 한마디\n${b}`)!;
  assert.equal(sp.rest, "형 한마디");
  assert.deepEqual(sp.post, { site: "instagram", url: "https://www.instagram.com/p/C1/", author: "nomute.kr", text: "첫 줄 둘째 “줄” 끝" });
  assert.equal(snsSplit(b)!.rest, "");   // 한마디 없음 = 말풍선 대신 카드만
  assert.equal(snsCaption("가".repeat(600)).length, 501);   // 500 + …
  assert.equal(snsBlock({ site: "x", url: "https://x.com/a/status/1", author: "bad name!" }), "https://x.com/a/status/1\n「X」");   // 이상한 이름 = 안 실음
});

test("붙여 넣은 링크(폰) = 줄 하나면 그 줄을 뺌 · 글 사이면 글 그대로 + 카드", () => {
  const a = snsSplit("https://www.threads.net/@zuck/post/C8xY?xmt=1")!;
  assert.equal(a.rest, ""); assert.equal(a.post.site, "threads"); assert.equal(a.post.author, "zuck");
  const b = snsSplit("이거 봐 https://x.com/a/status/9 ㅋㅋ")!;
  assert.equal(b.rest, "이거 봐 https://x.com/a/status/9 ㅋㅋ"); assert.equal(b.post.url, "https://x.com/a/status/9");
  assert.equal(snsSplit("그냥 글 https://news.naver.com/a"), null);
  assert.equal(snsSplit("https://www.instagram.com/p/C1/\n「X @a」")!.rest, "「X @a」");   // 곳이 다른 꼬리 줄 = 안 뺌
});

test("스냅샷 파일 이름 = nm-sns-<곳>- · 서버가 앞에 시각을 붙여도 알아봄", () => {
  const n = shotName("threads", 1795138743850);
  assert.match(n, /^nm-sns-threads-[0-9a-z]+\.jpg$/);
  assert.ok(SHOT_RE.test(`chatgpt/moru/spring-garden_files/20261120_1045_${n}`));
  assert.ok(SHOT_RE.test(n.replace(/\.jpg$/, ".webp")));   // 압축이 확장자를 바꿔도
  assert.ok(!SHOT_RE.test("20261120_1045_photo.jpg"));
});

test("껍데기 집기 → 글 · 보낼 때 꺼냄(한 번만)", () => {
  assert.deepEqual(pickPost({ state: "pick", id: "p1", ok: true, url: "https://www.instagram.com/p/C1/?igsh=x", author: "nomute.kr", text: "캡션" }, "instagram"), { site: "instagram", url: "https://www.instagram.com/p/C1/", author: "nomute.kr", text: "캡션" });
  assert.deepEqual(pickPost({ state: "pick", id: "p2", ok: true, url: "https://www.instagram.com/?x=1", text: "" }, "instagram"), { site: "instagram", url: "https://www.instagram.com/" });   // 글을 못 찾음 = 지금 주소(꼬리 뗌)
  assert.equal(pickPost({ state: "pick", id: "p3", ok: false }, "x"), null);
  assert.equal(pickPost({ state: "pick", id: "p4", ok: true, url: "javascript:alert(1)" }, "x"), null);
  assert.equal(takeSnsBlocks(["nm-sns-x-none.jpg"]), "");
});

test("pick.js = 껍데기가 「return (이 파일)(mode)」 로 부르는 꼴 · 주소 꼴에만 기댐", () => {
  const js = readFileSync(new URL("../public/sns-pick.js", import.meta.url), "utf8").trim();
  assert.match(js, /^\(function \(mode\) \{/);
  assert.match(js, /\}\)$/);
  const f = new Function(`return ${js}`)() as (mode: string) => unknown;
  assert.equal(typeof f, "function");
  assert.ok(!/className|querySelector\("\.[a-z]/.test(js));   // 클래스 이름으로 안 찾음
});

test("화면 = 단추(대화로 보내기) · 카드 · 보낼 때 두 줄(소스 꼴)", () => {
  const pane = readFileSync(new URL("../ui/sns-side-pane.tsx", import.meta.url), "utf8");
  assert.match(pane, /aria-label="대화로 보내기"/);
  assert.match(pane, /t: "nm-side-pick", id, js/);
  const chat = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  assert.match(chat, /takeSnsBlocks\(/);
  assert.match(chat, /snsBare\(m\) \? <SnsCard p=\{m\._sns!\} \/>/);
});

test("다리 없는 브라우저 = 맥 비춤 칸(⑤ B) · 이어지면 대화로 보내기 = mirror.pick · 곳 바꿈 = mirror.go", () => {
  const pane = readFileSync(new URL("../ui/sns-side-pane.tsx", import.meta.url), "utf8"), mir = readFileSync(new URL("../ui/sns-mirror.tsx", import.meta.url), "utf8");
  assert.match(pane, /: <SnsMirror fallback=\{cur\.url\} \/>/);
  assert.match(pane, /\{send \|\| mlive \? \(/);
  assert.match(pane, /void mirror\.pick\(id\)\.then\(\(d\) => \{ const p = pickPost\(d, s\); if \(p\) stageSns\(p, d\.img\); \}\)/);
  assert.match(pane, /mirror\.go\(goTo\.current \|\| SNS_SITES\.find/);
  assert.match(mir, /mirror\.touch\("start", p\.x, p\.y\)/);
  assert.match(mir, /useEffect\(\(\) => \(\) => \{ mirror\.close\("leave"\); \}, \[\]\);/);   // 칸 떠남 = 맥 놓아줌
});

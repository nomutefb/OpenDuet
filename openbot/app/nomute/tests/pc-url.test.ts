import assert from "node:assert/strict";
import { test } from "node:test";
import { tailnetUrl } from "../ui/pc-url.ts";

test("제어권 가져오기 주소 = 테일넷 안만(형 11-06 · 뜸 넘김)", () => {
  assert.equal(tailnetUrl("https://eyes.tail46034f.ts.net/vnc.html"), "https://eyes.tail46034f.ts.net/vnc.html");
  assert.equal(tailnetUrl("http://100.104.110.86:6080/vnc.html"), "http://100.104.110.86:6080/vnc.html");
  for (const bad of ["http://eyes.tail46034f.ts.net/", "https://evil.example.com/", "https://ts.net.evil.com/", "https://u:p@eyes.tail46034f.ts.net/", "http://100.63.0.1/", "http://192.168.0.5/", "javascript:alert(1)", "", null, undefined])
    assert.equal(tailnetUrl(bad), "", String(bad));
});

test("컴퓨터 · 조치 필요 글 → 대화창 카드(뜸 11-08 · 형 09:07 「채팅창에 너네 vm 띄우면 로그인 가능하게」)", async () => {
  const { pcOfText, screenUrl } = await import("../ui/pc-url.ts");
  const t = "[결정] 🖥 컴퓨터 · 조치 필요 — 클링에 로그인해 줘\n① 완료 ② 건너뛰기\n화면: https://eyes.tail46034f.ts.net/vnc.html?autoconnect=1&resize=scale";
  assert.deepEqual(pcOfText(t), { task: "클링에 로그인해 줘", url: "https://eyes.tail46034f.ts.net/vnc.html?autoconnect=1&resize=scale" });
  assert.equal(pcOfText("[결정] 🖥 컴퓨터 · 조치 필요 — 밖 주소\n화면: https://evil.example.com/"), null);   // 테일넷 밖 = 카드 아님(글 그대로)
  assert.equal(pcOfText("그냥 글 · 화면: https://eyes.tail46034f.ts.net/"), null);
  assert.equal(pcOfText(""), null);
  const u = new URL(screenUrl("https://eyes.tail46034f.ts.net/vnc.html?resize=remote"));
  assert.equal(u.searchParams.get("resize"), "remote");   // 몸 표 값은 그대로
  assert.equal(u.searchParams.get("autoconnect"), "1");
  assert.equal(u.searchParams.get("reconnect"), "1");
});

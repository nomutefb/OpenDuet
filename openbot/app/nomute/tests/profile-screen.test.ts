import assert from "node:assert/strict";
import { test } from "node:test";
import { screenUrl, tailnetUrl } from "../ui/pc-url.ts";

// profile-card.tsx 와 같은 꼴(한 줄) — 거르개 통과 = 화면 꼴 · 아니면 "" = 단추 안 그림
const profileScreen = (u: unknown) => (tailnetUrl(u) ? screenUrl(tailnetUrl(u)) : "");

test("프로필 「화면 보기」 = 명부 screen 이 테일넷 안일 때만(형 11-08 · 모루 #2968 검토)", () => {
  // 몸 표(beings/화면/*.json) 꼴 그대로 — 깃 8443 · 빚 10000 처럼 포트 붙은 ts.net 도 됨
  const gik = new URL(profileScreen("https://lxa.tail46034f.ts.net:8443/vnc.html?autoconnect=1&resize=scale"));
  assert.equal(gik.port, "8443");
  assert.equal(gik.searchParams.get("reconnect"), "1");
  assert.ok(profileScreen("https://sia.tail46034f.ts.net/vnc.html").startsWith("https://sia.tail46034f.ts.net/vnc.html?"));
  assert.ok(profileScreen("http://100.126.215.89:6080/vnc.html").startsWith("http://100.126.215.89:6080/"));
  // 값 없음 · 잘못된 값 · 밖 주소 = 단추 숨김("")
  for (const bad of [undefined, null, "", "http://sia.tail46034f.ts.net/", "https://evil.example.com/", "http://100.63.0.1/", "http://100.64.1.300/", "http://100.64.1.1:70000/", "javascript:alert(1)"])
    assert.equal(profileScreen(bad), "", String(bad));
});

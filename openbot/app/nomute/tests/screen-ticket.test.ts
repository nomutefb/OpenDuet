// 「화면 보기」(ui/screen-ticket.ts · 빠르 11-11 · 형 「vm 보는거 테일스케일 없어도 보는게 맞는거같아」 · 17:47 폰 「표 없음」 뒤 판)
import test from "node:test";
import assert from "node:assert/strict";
import { openScreenGo, screenGoUrl } from "../ui/screen-ticket.ts";

const U = "https://fast2.tail46034f.ts.net/vnc.html?autoconnect=1&resize=scale";

test("바로 보내기 주소 = 서버 문 + 몸 주소 통째(쿼리까지)", () => {
  const g = screenGoUrl(U);
  assert.ok(g.startsWith("/api/office/screen/go?url="));   // 사람 문(형 · Access) — m/ 는 봇 문
  assert.equal(new URL(g, "https://edit.nomute.kr").searchParams.get("url"), U);
});

test("누르면 새 창 하나로 바로(기다림 · fetch 0)", () => {
  const opens: unknown[] = [];
  openScreenGo(U, { open: (...a: unknown[]) => { opens.push(a); return null; } } as unknown as Pick<Window, "open">);
  assert.deepEqual(opens, [[screenGoUrl(U), "_blank", "noopener"]]);
});

test("앱 안 화면 표 = 사람 문 답의 https 주소 · 못 받으면 빈 값(→ 새 창 바로 보내기)", async () => {
  const { screenTicket } = await import("../ui/screen-ticket.ts");
  const seen: unknown[] = [];
  assert.equal(await screenTicket(U, async (b) => { seen.push(b); return { url: U + "&t=abc" }; }), U + "&t=abc");
  assert.deepEqual(seen, [{ url: U }]);
  assert.equal(await screenTicket(U, async () => { throw new Error("열쇠 없음"); }), "");
  assert.equal(await screenTicket(U, async () => ({ url: "javascript:x" })), "");
});

test("아래 단추 보낼 곳 = 화면 주소 origin(https 만 · 빠르 11-11)", async () => {
  const { momOrigin } = await import("../ui/screen-ticket.ts");
  assert.equal(momOrigin("https://fast2.tail46034f.ts.net/vnc.html?s=abc&path=websockify%3Fs%3Dabc"), "https://fast2.tail46034f.ts.net");
  assert.equal(momOrigin("https://lxa.tail46034f.ts.net:8443/vnc.html"), "https://lxa.tail46034f.ts.net:8443");
  for (const bad of ["", "http://100.84.18.19:6080/vnc.html", "javascript:alert(1)", "/vnc.html"]) assert.equal(momOrigin(bad), "", bad);
});

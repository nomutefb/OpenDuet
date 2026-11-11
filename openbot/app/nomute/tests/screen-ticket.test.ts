// 「화면 보기」 표(ui/screen-ticket.ts · 빠르 11-11 · 형 「vm 보는거 테일스케일 없어도 보는게 맞는거같아」)
import test from "node:test";
import assert from "node:assert/strict";
import { openScreenWithTicket, screenTicketUrl } from "../ui/screen-ticket.ts";

const U = "https://fast2.tail46034f.ts.net/vnc.html?autoconnect=1";
const fake = (status: number, body: unknown, seen?: unknown[]) => (async (url: string, init?: { body?: string }) => { seen?.push([url, JSON.parse(init?.body || "{}")]); return { ok: status < 300, status, json: async () => body }; }) as unknown as typeof fetch;

test("표 받으면 그 주소 · 서버에 몸 주소를 보냄", async () => {
  const seen: unknown[] = [];
  assert.equal(await screenTicketUrl(U, fake(200, { ok: true, url: U + "&t=abc" }, seen)), U + "&t=abc");
  assert.deepEqual(seen, [["/api/office/m/screen/ticket", { url: U }]]);
});

test("못 받으면 옛 주소 그대로(거절 · 이상한 답 · 끊김)", async () => {
  assert.equal(await screenTicketUrl(U, fake(403, { ok: false })), U);
  assert.equal(await screenTicketUrl(U, fake(200, { ok: true, url: "javascript:x" })), U);
  assert.equal(await screenTicketUrl(U, (async () => { throw new Error("off"); }) as unknown as typeof fetch), U);
});

test("누른 순간 빈 창 → 받은 뒤 그 창을 표 주소로", async () => {
  const win = { closed: false, opener: {} as unknown, location: { href: "" } };
  const opens: unknown[] = [];
  const w = { open: (...a: unknown[]) => { opens.push(a); return win; } } as unknown as Window;
  openScreenWithTicket(U, fake(200, { ok: true, url: U + "&t=zz" }), w);
  assert.deepEqual(opens, [["", "_blank"]]);
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(win.location.href, U + "&t=zz");
  assert.equal(win.opener, null);
});

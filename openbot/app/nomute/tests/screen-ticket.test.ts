// 「화면 보기」(ui/screen-ticket.ts · 빠르 11-11 · 형 「vm 보는거 테일스케일 없어도 보는게 맞는거같아」 · 17:47 폰 「표 없음」 뒤 판)
import test from "node:test";
import assert from "node:assert/strict";
import { openScreenGo, screenGoUrl } from "../ui/screen-ticket.ts";

const U = "https://fast2.tail46034f.ts.net/vnc.html?autoconnect=1&resize=scale";

test("바로 보내기 주소 = 서버 문 + 몸 주소 통째(쿼리까지)", () => {
  const g = screenGoUrl(U);
  assert.ok(g.startsWith("/api/office/m/screen/go?url="));
  assert.equal(new URL(g, "https://edit.nomute.kr").searchParams.get("url"), U);
});

test("누르면 새 창 하나로 바로(기다림 · fetch 0)", () => {
  const opens: unknown[] = [];
  openScreenGo(U, { open: (...a: unknown[]) => { opens.push(a); return null; } } as unknown as Pick<Window, "open">);
  assert.deepEqual(opens, [[screenGoUrl(U), "_blank", "noopener"]]);
});

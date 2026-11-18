// 알림에서 수집함으로 온 것(형 11-19 08:3x 「응 1합쳐」 = 에디터 알림을 정원 앱 알림으로)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { brkOfHash, findPushCand, pickReasonOf } from "../ui/scrap-push.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const norm = (u: string) => String(u || "").trim().replace(/\/+$/, ""), link = (c: { url?: string; breaking_pick?: { url?: string } }) => c.breaking_pick?.url || c.url || "";

test("알림 열쇠 → 후보 = 주소 하나 맞음 먼저 · 사건 열쇠 · 여럿이면 대표 원문으로 좁힘 · 그래도 여럿 = ambig", () => {
  const A = { url: "https://a.kr/1", event_key: "ev1" }, B = { url: "https://b.kr/2", event_key: "ev1", breaking_pick: { url: "https://major.kr/x" } }, C = { url: "https://c.kr/3/", event_key: "ev2" };
  assert.equal(findPushCand([A, B, C], "https://a.kr/1", "", norm, link), A);
  assert.equal(findPushCand([A, B, C], "https://c.kr/3", "", norm, link), C);   // 끝 슬래시만 다른 주소
  assert.equal(findPushCand([A, B, C], "ev2", "", norm, link), C);
  assert.equal(findPushCand([A, B, C], "ev1", "", norm, link), "ambig");   // 같은 사건 둘 · 좁힐 것 없음 = 안 보냄
  assert.equal(findPushCand([A, B, C], "ev1", "https://major.kr/x", norm, link), B);
  assert.equal(findPushCand([A, B, C], "없는것", "https://major.kr/x", norm, link), null);
});

test("주소 꼬리표 = brk · bl(http 만) · 사유 = 알림 종류", () => {
  assert.deepEqual(brkOfHash("#/legacy?brk=ev%201&bl=https%3A%2F%2Fm.kr%2Fa"), { key: "ev 1", bl: "https://m.kr/a" });
  assert.deepEqual(brkOfHash("#/legacy?brk=k&bl=javascript%3Aalert(1)"), { key: "k", bl: "" });
  assert.equal(brkOfHash("#/legacy"), null); assert.equal(brkOfHash("#/legacy?bl=https://m.kr"), null);
  assert.deepEqual([pickReasonOf("brk"), pickReasonOf("iss"), pickReasonOf("trend"), pickReasonOf(undefined)], ["속보/사건", "토픽/논란", "대세픽", "속보/사건"]);
});

test("배선 = 앱 서비스 워커가 에디터 알림을 받음 · PICK 은 맡아 둔 요청만 · 수집함이 가져감", () => {
  const sw = rd("../sw.js"), sc = rd("../ui/scrap.tsx");
  assert.match(sw, /const ED_KIND = \{ brk: "brk", iss: "iss", make: "make", sys: "sys", trend: "trend", kw: "kw" \};/);
  assert.match(sw, /if \(!ed && \(await appWins\(\)\)\.some\(/);   // 에디터 종류는 앱을 보고 있어도 띄움
  assert.match(sw, /a\.action === "pick"/); assert.match(sw, /d\.type === "nm-pickreq-take"/); assert.match(sw, /await savePickReq\(\{ brk: pt\.searchParams\.get\("brk"\)/);
  assert.match(sw, /if \(q\.get\("brk"\)\) return at\(`\/legacy\?brk=/);
  assert.match(sw, /if \(tu\.origin !== location\.origin\) return self\.clients\.openWindow\(target\);/);   // 구글 검색 알림이 앱 창을 갈아 끼우지 않게
  assert.match(sc, /sw\.postMessage\(\{ type: "nm-pickreq-take" \}, \[ch\.port2\]\)/);
  assert.match(sc, /applyTriage\("pick", c, pickReasonOf\(r\.kind\), "", redraw\)/);
  assert.doesNotMatch(sc, /searchParams\.get\("act"\)/);   // 주소만으로 PICK 을 보내는 길 없음
});

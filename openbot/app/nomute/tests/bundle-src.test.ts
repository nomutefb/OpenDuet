// 묶음 「공식 자료」 이어 글(깃 11-13 12:49 · 형 08:33 · 12:47 봄 옮김 「내가 촉한테 픽을 하면 틈이 찾아서 그 픽 요약에 틈이 자료를 붙이는 거로」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseSrc, srcOf } from "../ui/bundle-src.ts";

const T = "[자료 261113-1230-sec]\n주소: https://www.sec.gov/news/press-release/2026-120\n누가: 미 증권거래위원회(SEC) · 2026-11-12\n원문: The Commission today charged …\n  second line of quote\n한글: SEC 가 오늘 … 를 기소했다\n열어 봄: 됨";
test("자료 글 읽기 = stem · 주소 · 누가 · 원문(여러 줄) · 한글 · 열어 봄", () => {
  const s = parseSrc(T)!;
  assert.equal(s.stem, "261113-1230-sec");
  assert.equal(s.url, "https://www.sec.gov/news/press-release/2026-120");
  assert.equal(s.who, "미 증권거래위원회(SEC) · 2026-11-12");
  assert.equal(s.orig, "The Commission today charged …\nsecond line of quote");
  assert.equal(s.ko, "SEC 가 오늘 … 를 기소했다");
  assert.equal(s.opened, true);
  assert.equal(parseSrc(T.replace("열어 봄: 됨", "열어 봄: 못 열어 봄"))!.opened, false);
  assert.equal(parseSrc("[묶음 x]\n주소: https://a"), null);
  assert.equal(parseSrc("[자료 x]"), null, "빈 자료 = 알약 그대로");
});
test("러너 글만 · 대화창 = 묶음 있으면 숨기고 카드 안으로", () => {
  assert.ok(srcOf({ kind: "system", who: "러너", text: T, id: "a" }));
  assert.equal(srcOf({ kind: "bot", who: "틈", text: T }), null);
  const oc = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  assert.match(oc, /all\.filter\(\(m\) => \{ const x = srcOf\(m\); return \(!x \|\| !bundled\.has\(x\.stem\)\) && !\(hide && hide\(m as OfficeMsg\)\); \}\)\.map\(relayAs\)/);   // + 화상회의 hide(뜸 11-13)
  assert.match(oc, /srcs=\{c\.srcs\?\.get\(bundleOf\(m\)!\.stem\)\}/);
  const bc = readFileSync(new URL("../ui/bundle-card.tsx", import.meta.url), "utf8");
  assert.match(bc, /<b className="nm-bdl-src-h">공식 자료<\/b>/);
  assert.match(bc, /<details className="nm-bdl-src-o"><summary>원문<\/summary>/);
});

// 홈 키워드 순위판 계산 줄(형 11-14 「3분할해서 한 7위까지만」 · 「x급상승도 … 총 4개로」 · 「중복되는 키워드는 … 라임색으로」 · 「10초뒤에 … 1분마다 바뀌면」)
import assert from "node:assert/strict";
import test from "node:test";
import { KW_N, kwCols, kwHits, kwNorm, kwPhase, kwSame, xMove } from "../home/kw-board-core.ts";

const NOW = Date.parse("2026-11-14T21:40:00+09:00");
const TR = {
  updated: "2026-11-14T21:33:08+09:00", namu_updated: "2026-11-14T21:03:22+09:00",
  gtrends: [{ query: "문무", traffic: "500+" }, { query: "고경표", traffic: "200+", isNew: true }, { query: "" }, ...Array.from({ length: 9 }, (_, i) => ({ query: `구글${i}` }))],
  signal: [{ query: "박진영, 사이비 의혹 반박" }, { query: "고 경표" }],
  namu: [{ query: "조동욱", rank: 1 }, { query: "박재현", rank: 2 }, { query: "APBC", rank: 3 }],
};
const XT = { generated_at: "2026-11-14T21:31:13+09:00", items: [
  { keyword: "박재현 홈런", rank: 3, why_ko: "X 10위(1시간 전 6위, 4계단 하락", aliases: ["박재현 홈런"] },
  { keyword: "수상소감", rank: 1, why_ko: "X 2위(1시간 전 10위, 8계단 상승 · 머묾 2)" },
  { keyword: "배우 고경표", rank: 5, why_ko: "X 47위", aliases: ["배우 고경표", "음주운전"] },
  { keyword: "이로운 선수", rank: 4, why_ko: "X 8위로 새로 진입(머묾 1)" },
] };

test("네 줄기 · 줄기마다 7위까지 · 빈 말 뺌 · X = 순위 차례", () => {
  const c = kwCols(TR, XT, NOW);
  assert.deepEqual(c.map((x) => x.id), ["gt", "sig", "namu", "x"]);
  assert.equal(c[0].items.length, KW_N);
  assert.deepEqual(c[0].items.slice(0, 3).map((x) => x.q), ["문무", "고경표", "구글0"]);
  assert.equal(c[0].items[0].sub, "500+");
  assert.equal(c[0].items[1].fresh, true);
  assert.deepEqual(c[3].items.map((x) => x.q), ["수상소감", "박재현 홈런", "이로운 선수", "배우 고경표"]);
  assert.deepEqual(c[3].items.map((x) => x.sub), ["▲8", "▼4", "", ""]);
  assert.equal(c[3].items[2].fresh, true, "새로 진입 = NEW");
  assert.ok(c.every((x) => !x.stale));
  assert.match(c[2].items[0].href, /^https:\/\/namu\.wiki\/Search\?q=/);
});

test("겹침 = 띄어쓰기 · 대소문자 무시 · 긴 말이 3자 넘는 짧은 말을 품음 · 두 글자는 똑같을 때만", () => {
  assert.equal(kwNorm(" 제이슨  데이 #A_b"), "제이슨데이ab");
  assert.equal(kwSame("고경표", "고경표"), true);
  assert.equal(kwSame("박재현", "박재현홈런"), true);
  assert.equal(kwSame("이재", "이재명"), false);
  assert.equal(kwSame("", "이재명"), false);
  const c = kwCols(TR, XT, NOW), h = kwHits(c);
  assert.equal(h.get("gt:1"), 3, "고경표 = 구글 · 시그널(고 경표) · X(배우 고경표)");
  assert.equal(h.get("sig:1"), 3);
  assert.equal(h.get("x:3"), 3);
  assert.equal(h.get("namu:1"), 2, "박재현 = 나무위키 · X(박재현 홈런)");
  assert.equal(h.get("x:1"), 2);
  assert.equal(h.get("gt:0"), 1, "문무 = 한 줄기뿐");
});

test("낡은 줄기(180분 넘음) = 겹침 셈에서 빠짐 · 그 줄기 말은 0", () => {
  const c = kwCols({ ...TR, namu_updated: "2026-11-14T17:00:00+09:00" }, XT, NOW), h = kwHits(c);
  assert.equal(c[2].stale, true);
  assert.equal(h.get("namu:1"), 0);
  assert.equal(h.get("x:1"), 1, "박재현 홈런 = 낡은 나무위키와는 안 셈");
  const none = kwCols(null, null, NOW);
  assert.ok(none.every((x) => x.items.length === 0 && x.stale));
});

test("번갈아 = 처음 10초 Hot Issue · 그 뒤 1분마다", () => {
  assert.equal(kwPhase(0), "hot");
  assert.equal(kwPhase(9_999), "hot");
  assert.equal(kwPhase(10_000), "kw");
  assert.equal(kwPhase(69_999), "kw");
  assert.equal(kwPhase(70_000), "hot");
  assert.equal(kwPhase(130_000), "kw");
  assert.equal(xMove("21계단 하락 · 식음"), "▼21");
  assert.equal(xMove(""), "");
});

test("NEW 표 = 새 말이 절반 밑일 때만 · 화면 배선(PC Hot Issue 칸 · 폰 홈 · PC 반갈 왼쪽은 그대로)", async () => {
  const { kwShowNew } = await import("../home/kw-board-core.ts");
  const c = kwCols(TR, XT, NOW);
  assert.equal(kwShowNew(c[0]), true, "구글 7개 중 새 말 1");
  assert.equal(kwShowNew({ ...c[0], items: c[0].items.map((x) => ({ ...x, fresh: true })) }), false, "다 새 말 = 표 뺌");
  const { readFileSync } = await import("node:fs");
  const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
  assert.match(rd("../ui/shell.tsx"), /<HotSwap><NewsList \/><\/HotSwap>/);
  assert.match(rd("../home/home-screen.tsx"), /\{split \? <NewsFeed onShown=\{\(\) => shown\.current\(\)\} \/> : <div className="nm-home-swap"/);
  assert.match(rd("../home/kw-board.tsx"), /t = window\.setTimeout\(tick, KW_FIRST_MS\);/);
  assert.match(rd("../home/kw-board.tsx"), /if \(document\.hidden \|\| over\.current \|\| Date\.now\(\) < hold\.current\)/, "보는 중 · 숨은 탭 = 안 뺏음");
});

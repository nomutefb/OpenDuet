// 애들 × 연결 한 표의 셈(./ui/crew-table-logic.ts) — 형 11-19 「cli연결하고 애들 x연결하고 통합시켜줘. 하나로.」 · 「행 인덱싱이 반복되도되니까」 · 「그록봇까지 포함시켜」
import assert from "node:assert/strict";
import { test } from "node:test";
import { type SRow, bandCount, bandDiary, bandHands, bandLink, crewOrder, liftCommon } from "../ui/crew-table-logic.ts";

const bots: SRow[] = [
  { key: "sona", name: "소나", st: "ok", cells: { "깨우는 문": { st: "ok", note: "HTTP 200" } } },
  { key: "karina", name: "카리나", st: "ok" }, { key: "moru", name: "구름", st: "ok" },
  { key: "fast", name: "빠르", st: "ok", cells: { "깨우는 문": { st: "ok", note: "러너 박동 5초 전" } } },
  { key: "bom", name: "봄", st: "ok" }, { key: "winter", name: "윈터", st: "ok" },
];
const act: SRow[] = [["소나", "그록"], ["카리나", "지피티"], ["구름", "조수"], ["빠르", "클로드"], ["봄", "클로드"], ["윈터", "클로드"]].map(([name, brain]) => ({ key: `act:${name}`, name, st: "ok", brain }));
const kids = crewOrder(bots, act, ["윈터", "봄", "빠르"]);

test("줄 차례 = 클로드(몸 정본 차례) → 조수 → 지피티 → 그록 · 머리가 바뀌는 첫 줄에 sep", () => {
  assert.deepEqual(kids.map((k) => k.who), ["윈터", "봄", "빠르", "구름", "카리나", "소나"]);
  assert.deepEqual(kids.map((k) => !!k.sep), [false, false, false, true, true, true]);
  assert.deepEqual(kids.map((k) => k.fam), ["claude", "claude", "claude", "aide", "gpt", "grok"]);
});

test("띠 ① 계정 · 연결 — 제 몸 줄 = 클로드 칸들 · 몸 줄 없는 창 = 지금 창 계정 한 칸 · 그록 = 문만 · 같은 글은 칸 머리로", () => {
  const ok = (label: string) => ({ st: "ok" as const, label });
  const cli: SRow[] = [
    { key: "봄", name: "봄", st: "ok", cells: { c1: ok("C·M"), c2: ok("C·N"), gpt: ok("chatgpt"), r2: ok("nomutefb"), gh1: ok("nomutefb"), gh2: ok("muteno"), rclone: { st: "ok", label: "3", items: [{ name: "r2" }] } } },
    { key: "빠르", name: "빠르", st: "ok", cells: { c1: ok("C·M"), r2: ok("nomutefb"), gh1: ok("nomutefb"), gh2: { st: "unknown", label: "—" }, rclone: ok("1") } },
    { key: "윈터", name: "윈터", st: "unknown", cells: { gh1: ok("nomutefb"), r2: { st: "unknown", label: "Not checked" } } },
  ];
  const accts: SRow[] = [{ key: "claude:m", name: "ems1130m", value: "ems1130m@gmail.com", st: "ok", kind: "claude", names: ["윈터", "구름", "봄"] }, { key: "gpt", name: "gpt muteno", st: "ok", kind: "gpt", names: [] }];
  const b = bandLink(kids, cli, bots, accts), row = (w: string) => b.rows.find((r) => r.who === w)!;
  assert.equal(row("봄").cells.c1?.label, "C·M"); assert.equal(row("봄").cells.c3, undefined);   // 없는 칸 = 빈 칸
  assert.equal(row("봄").cells.gpt?.label, undefined);   // GPT = 점만
  assert.equal(row("윈터").cells.c1?.label, "C·M"); assert.match(row("윈터").cells.c1?.note || "", /지금 창 계정/);   // 몸 줄 없음 = 지금 창 계정
  assert.equal(row("구름").cells.c1?.label, "C·M");
  assert.deepEqual(Object.keys(row("소나").cells), ["door"]);   // 그록 = 문만
  assert.equal(row("빠르").cells.gh2, undefined);   // 둘째 계정 없음 = 빈 칸
  assert.equal(b.cols.find((c) => c.id === "gh1")?.common, "nomutefb"); assert.equal(row("봄").cells.gh1?.label, undefined);   // 같은 글 = 칸 머리로
  assert.equal(row("봄").cells.gh2?.label, "muteno");   // 혼자인 글은 그 줄에
  assert.equal(row("봄").cells.rclone?.label, "3");   // 수는 줄마다
});

test("liftCommon = 둘 넘게 · 반 넘게 같을 때만 머리로", () => {
  const rows = [{ who: "a", fam: "claude" as const, st: "ok" as const, cells: { x: { st: "ok" as const, label: "p" } } }, { who: "b", fam: "claude" as const, st: "ok" as const, cells: { x: { st: "ok" as const, label: "q" } } }];
  assert.equal(liftCommon(rows, "x"), ""); assert.equal(rows[0].cells.x.label, "p");
});

test("띠 ② 일기 · 교대 — 격자 줄 = 여덟 칸(빈 칸은 빨간 – = null) · 시각만 온 줄 = 한 칸 글 · 일기 줄 없는 애 = 빈 줄 · 셀프 – · 챙김", () => {
  const now = Date.parse("2026-11-19T08:00:00+09:00");
  const diary: SRow[] = [
    { key: "봄", name: "봄", st: "ok", cells: { raw: { st: "ok" }, check: { st: "ok" }, d40: { st: "ok" }, d75: { st: "miss", note: "토막 없음" }, sketch: { st: "ok" }, end: { st: "ok" }, inj2: { st: "ok" } } },
    { key: "교대·봄", name: "교대·봄", st: "ok", cells: { "넘김 일기": { st: "ok" }, 이어받음: { st: "late", note: "늦음" } } },
    { key: "소나", name: "소나", st: "ok", metrics: { diary_ms: now - 3 * 3600e3 } },
    { key: "구름", name: "구름", st: "unknown", cells: { raw: { st: "ok" }, d40: { st: "unknown", note: "해당 없음" } }, metrics: { diary_ms: now - 60e3 } },
  ];
  const b = bandDiary(kids, diary, { noSelf: { 구름: "혼자 못 넘어감" }, care: { 구름: "봄 · 깃" }, selfOk: ["윈터"] }, now), row = (w: string) => b.rows.find((r) => r.who === w)!;
  assert.deepEqual(b.cols.map((c) => c.name), ["뜨기", "대조", "40", "75", "습작", "넘김", "주입", "깸", "셀프", "챙김", "일기", "이음"]);   // 같은 낱말 두 번 없음(교대 쪽 넘김 일기 = 「일기」)
  assert.equal(row("봄").cells.wake, null); assert.equal(row("봄").cells.d75?.st, "miss"); assert.equal(row("봄").cells.self?.st, "ok");
  assert.equal(row("봄").cells["h:이어받음"]?.st, "late");
  assert.equal(row("소나").wide?.text, "일기 3시간 전"); assert.equal(row("소나").wide?.n, 8);   // 그록 = 시각만 와도 뜸
  assert.equal(row("구름").cells.d40?.st, "ok"); assert.equal(row("구름").cells.self?.kind, "dash"); assert.equal(row("구름").cells.care?.label, "봄·깃");
  assert.deepEqual(row("카리나").cells, {}); assert.equal(row("윈터").cells.self?.st, "ok");
  assert.deepEqual(bandCount([b]), { miss: 1 + 1 + 6, late: 1 });   // 봄 d75 ✕ · 봄 wake – · 구름 빈 일기 칸 여섯 – · 늦음 = 이음 하나(셀프 – 는 안 셈)
});

test("띠 ③ 손 = 서버가 봇마다 잰 칸이 올 때만(없으면 띠 0 — 지어내지 않음)", () => {
  assert.equal(bandHands(kids, [], undefined), null);
  const b = bandHands(kids, [{ key: "소나", name: "소나", st: "ok", cells: { file_out: { st: "ok", note: "11-18" } } }], [{ id: "file_out", name: "파일", grp: "보냄" }]);
  assert.equal(b?.rows.find((r) => r.who === "소나")?.cells.file_out?.st, "ok"); assert.deepEqual(b?.rows.find((r) => r.who === "봄")?.cells, {});
});

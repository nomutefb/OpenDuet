import { test } from "node:test";
import assert from "node:assert/strict";
import { GAP_Y, SIZE, edgePath, edgeWidth, fitOf, perDay, railPath, rawOf, treeOf, zoomAt } from "../ui/sched-tree-core.ts";

const job = (id: string, fork: string, extra = {}) => ({ id, name: id, file: `${id}.yml`, kind: "", fork, ...extra });
const map = {
  groups: [{ id: "g", name: "수집" }, { id: "h", name: "제작" }],
  forks: [{ id: "f1", name: "박자", group: "g" }, { id: "f2", name: "살피기", group: "g" }, { id: "f3", name: "다른 갈래", group: "h" }],
  jobs: [
    job("a", "f1", { cron_kst: ["0 7 * * *"] }),
    job("b", "f1", { in: { after: ["a"] } }),
    job("c", "f1", { cron_kst: ["0 6 * * *"], out: { calls: ["d.yml"] } }),
    job("d", "f1"),
    job("e", "f2", { in: { after: ["a"] } }),   // 다른 포크의 잡 뒤따름 = 나무로는 안 엮음
    job("x", "f3"),
  ],
} as never;

test("나무 = 갈래 → 포크 → 잡 · 같은 포크 안 뒤따름 · 부름은 잡 밑 잡", () => {
  const r = rawOf(map, "g");
  assert.equal(r.kind, "group"); assert.deepEqual(r.kids.map((k) => k.id), ["f1", "f2"]);
  const f1 = r.kids[0];
  assert.deepEqual(f1.kids.map((k) => k.id), ["c", "a"]);   // 첫 시각 이른 차례
  assert.deepEqual(f1.kids[0].kids.map((k) => [k.id, k.via]), [["d", "calls"]]);
  assert.deepEqual(f1.kids[1].kids.map((k) => [k.id, k.via]), [["b", "after"]]);
  assert.deepEqual(r.kids[1].kids.map((k) => k.id), ["e"]);
});

test("고리(a 뒤 b · b 뒤 a)는 한쪽만 엮음", () => {
  const m = { groups: [{ id: "g", name: "g" }], forks: [{ id: "f", name: "f", group: "g" }], jobs: [job("a", "f", { in: { after: ["b"] } }), job("b", "f", { in: { after: ["a"] } })] } as never;
  const f = rawOf(m, "g").kids[0];
  assert.equal(f.kids.length, 1); assert.equal(f.kids[0].kids.length, 1);
});

const ALL = { f1: true, f2: true, f3: true };
test("자리 = 깊이마다 오른쪽 · 잎은 위→아래 · 부모는 자식 가운데 · 안 겹침", () => {
  const t = treeOf(map, ALL);
  const by = Object.fromEntries(t.nodes.map((n) => [n.id, n]));
  assert.ok(by["g:g"].x > by.root.x && by.f1.x > by["g:g"].x && by.c.x > by.f1.x && by.d.x > by.c.x);
  assert.equal(by.c.y + by.c.h / 2, by.d.y + by.d.h / 2);   // 외자식 = 같은 높이
  const leaves = t.nodes.filter((n) => !n.open).sort((a, b) => a.y - b.y);
  for (let i = 1; i < leaves.length; i++) assert.ok(leaves[i].y >= leaves[i - 1].y + leaves[i - 1].h + GAP_Y - 0.01);
  assert.equal(t.edges.length, t.nodes.length - 1);
  assert.equal(t.edges.find((e) => e.to === "b")?.kind, "after");
  assert.ok(t.w > by.d.x + SIZE.job.w && t.h > 0);
});

test("처음 = 포크만 접힘 · 접은 포크 = 자식 안 그림 · 밑에 달린 잡 수는 남김", () => {
  const t = treeOf(map);
  assert.deepEqual(t.nodes.map((n) => n.id), ["root", "g:g", "f1", "f2", "g:h", "f3"]);
  assert.equal(t.nodes.find((n) => n.id === "f1")?.kids, 4);
  assert.equal(t.nodes.find((n) => n.id === "root")?.kids, 6);
  assert.equal(treeOf(map, { f1: true }).nodes.some((n) => n.id === "a"), true);
});

test("폰 = 위→아래 한 줄 쌓기 · 깊이만큼 들여쓰기 · 폭은 판 안", () => {
  const t = treeOf(map, ALL, 390);
  const by = Object.fromEntries(t.nodes.map((n) => [n.id, n]));
  assert.ok(by.f1.x > by["g:g"].x && by.c.x > by.f1.x);
  for (const n of t.nodes) assert.ok(n.x + n.w <= 390);
  const ys = t.nodes.map((n) => n.y);
  assert.deepEqual([...ys].sort((a, b) => a - b), ys);   // 그린 차례 = 위→아래
  assert.match(railPath(by.f1, by.c), /^M[\d.]+ [\d.]+ V[\d.]+ Q/);
});

test("선 = 가로 → 둥근 꺾임 → 세로 → 둥근 꺾임 → 가로 · 같은 높이면 곧은 선", () => {
  assert.equal(edgePath({ x: 0, y: 0, w: 100, h: 40 }, { x: 160, y: 0, h: 40 }), "M100 20 H160");
  const d = edgePath({ x: 0, y: 0, w: 100, h: 40 }, { x: 160, y: 100, h: 40 });
  assert.match(d, /^M100 20 H120 Q130 20 130 30 V110 Q130 120 140 120 H160$/);
});

test("처음 배율 = 넓으면 줄임(바닥 0.45) · 배율 바꿔도 손 밑 점은 제자리", () => {
  assert.deepEqual(fitOf({ w: 1000, h: 500 }, { w: 800, h: 600 }), { k: 0.8, x: 0, y: 0 });
  assert.equal(fitOf({ w: 9000, h: 500 }, { w: 800, h: 600 }).k, 0.45);
  const v = zoomAt({ k: 1, x: 10, y: 20 }, 2, 110, 120);
  assert.equal(v.k, 1.6); assert.equal((110 - v.x) / v.k, 100); assert.equal((120 - v.y) / v.k, 100);
});

test("하루 횟수 = cron(분 × 시) · 글 · 부를 때만 0 → 선 굵기는 그 로그", () => {
  assert.equal(perDay({ cron_kst: ["CRON_TZ=Asia/Seoul 0,30 7-23 * * *"] }), 34);
  assert.equal(perDay({ cron_kst: ["*/10 * * * *"] }), 144);
  assert.equal(perDay({ cron_kst: ["0 6 * * *", "0 18 * * *"] }), 2);
  assert.equal(perDay({ cron_kst: ["0 9 * * 1"] }), 0.14);   // 주 1회 = 하루 1/7
  assert.equal(perDay({ cron_kst: ["0 9 * * 1-5"] }), 0.71);
  assert.equal(perDay({ cron_kst: ["0 9 1 * *"] }), 0.03);   // 달 1회
  assert.equal(perDay({ when: "10분마다" }), 144);
  assert.equal(perDay({ when: "3시간마다" }), 8);
  assert.equal(perDay({ when: "매일 6:00" }), 1);
  assert.equal(perDay({ when: "부를 때만" }), 0);
  assert.equal(edgeWidth(0), 1);
  assert.ok(edgeWidth(1) < edgeWidth(24) && edgeWidth(24) < edgeWidth(144) && edgeWidth(100000) === 3.4);
});

test("봇 가지 = 러너 갈래와 같은 층 · 봇 → 포크 → 루틴 · 빈 포크는 안 그림 · 밑에 달린 수에 루틴도", () => {
  const bots = { forks: [{ id: "scout", name: "살피기" }, { id: "empty", name: "빈 포크" }], routines: [{ id: "chok.x", name: "X 급상승", who: "촉", bot: "chok", state: "live", fork: "scout" }, { id: "gyeol.b", name: "묶음", who: "결", bot: "gyeol", state: "off", fork: "scout" }] };
  const t = treeOf(map, { "bf:scout": true }, 0, bots);
  const by = Object.fromEntries(t.nodes.map((n) => [n.id, n]));
  assert.equal(by.root.name, "스케줄러");
  assert.equal(by["g:bot"].x, by["g:g"].x);   // 같은 층
  assert.deepEqual(t.nodes.filter((n) => n.parent === "g:bot").map((n) => n.id), ["bf:scout"]);
  assert.deepEqual(t.nodes.filter((n) => n.kind === "routine").map((n) => [n.id, n.parent]), [["r:chok.x", "bf:scout"], ["r:gyeol.b", "bf:scout"]]);
  assert.equal(by["g:bot"].kids, 2); assert.equal(by.root.kids, 8);
  assert.equal(treeOf(map, {}, 0).nodes.some((n) => n.id === "g:bot"), false);   // 봇 재료 없으면 러너만(뿌리 이름 「러너」)
});

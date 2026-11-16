import { test } from "node:test";
import assert from "node:assert/strict";
import { GAP_Y, SIZE, edgeMid, edgePath, edgeWidth, fitOf, perDay, railPath, rawOf, treeOf, zoomAt } from "../ui/sched-tree-core.ts";

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

test("러너 갈래 = 묶음 단계 없이 잡을 바로 · 같은 갈래 안 뒤따름 · 부름은 잡 밑 잡 · 고장 난 것 먼저", () => {
  const r = rawOf(map, "g");
  assert.equal(r.kind, "fork"); assert.equal(r.name, "수집");
  assert.deepEqual(r.kids.map((k) => k.id), ["c", "a"]);   // 첫 시각 이른 차례 · 다른 묶음(f2)의 e 도 같은 갈래라 a 밑으로
  assert.deepEqual(r.kids[0].kids.map((k) => [k.id, k.via]), [["d", "calls"]]);
  assert.deepEqual(r.kids[1].kids.map((k) => [k.id, k.via]), [["b", "after"], ["e", "after"]]);
  const m2 = { ...(map as object), jobs: [...(map as { jobs: object[] }).jobs, job("z", "f2", { health: { st: "miss" } })] } as never;
  assert.equal(rawOf(m2, "g").kids[0].id, "z");   // 놓침 = 맨 앞
});

test("고리(a 뒤 b · b 뒤 a)는 한쪽만 엮음", () => {
  const m = { groups: [{ id: "g", name: "g" }], forks: [{ id: "f", name: "f", group: "g" }], jobs: [job("a", "f", { in: { after: ["b"] } }), job("b", "f", { in: { after: ["a"] } })] } as never;
  const g = rawOf(m, "g");
  assert.equal(g.kids.length, 1); assert.equal(g.kids[0].kids.length, 1);
});

const ALL = { "g:run": true, "g:g": true, "g:h": true };
test("자리 = 깊이마다 오른쪽 · 잎은 위→아래 · 부모는 자식 가운데 · 안 겹침", () => {
  const t = treeOf(map, ALL);
  const by = Object.fromEntries(t.nodes.map((n) => [n.id, n]));
  assert.ok(by["g:run"].x > by.root.x && by["g:g"].x > by["g:run"].x && by.c.x > by["g:g"].x && by.d.x > by.c.x);
  assert.equal(by.c.y + by.c.h / 2, by.d.y + by.d.h / 2);   // 외자식 = 같은 높이
  const leaves = t.nodes.filter((n) => !n.open).sort((a, b) => a.y - b.y);
  for (let i = 1; i < leaves.length; i++) assert.ok(leaves[i].y >= leaves[i - 1].y + leaves[i - 1].h + GAP_Y - 0.01);
  assert.equal(t.edges.length, t.nodes.length - 1);
  assert.equal(t.edges.find((e) => e.to === "b")?.kind, "after");
  assert.ok(t.w > by.d.x + SIZE.job.w && t.h > 0);
});

test("처음 = 뿌리와 「자동으로 도는 일」 줄기만(접힘) · 펼치면 갈래 · 밑에 달린 잡 수는 남김", () => {
  const t = treeOf(map);
  assert.deepEqual(t.nodes.map((n) => n.id), ["root", "g:run"]);
  assert.equal(t.nodes.find((n) => n.id === "g:run")?.kids, 6);
  const t2 = treeOf(map, { "g:run": true });
  assert.deepEqual(t2.nodes.map((n) => n.id), ["root", "g:run", "g:g", "g:h"]);
  assert.equal(t2.nodes.find((n) => n.id === "g:g")?.kids, 5);
  assert.equal(treeOf(map, { "g:run": true, "g:g": true }).nodes.some((n) => n.id === "a"), true);
});

test("폰 = 위→아래 한 줄 쌓기 · 깊이만큼 들여쓰기 · 폭은 판 안 · 키 큰 노드", () => {
  const t = treeOf(map, ALL, 390);
  const by = Object.fromEntries(t.nodes.map((n) => [n.id, n]));
  assert.ok(by["g:g"].x > by["g:run"].x && by.c.x > by["g:g"].x);
  for (const n of t.nodes) assert.ok(n.x + n.w <= 390);
  assert.ok(by.c.h > SIZE.job.h && by.root.w < 200);
  const ys = t.nodes.map((n) => n.y);
  assert.deepEqual([...ys].sort((a, b) => a - b), ys);   // 그린 차례 = 위→아래
  assert.match(railPath(by["g:g"], by.c), /^M[\d.]+ [\d.]+ V[\d.]+ Q/);
});

test("선 = 부드러운 S 곡선(양 끝 손잡이 = 가운데 x) · 같은 높이면 곧은 선 · 한가운데 = 두 끝의 가운데", () => {
  assert.equal(edgePath({ x: 0, y: 0, w: 100, h: 40 }, { x: 160, y: 0, h: 40 }), "M100 20 H160");
  const d = edgePath({ x: 0, y: 0, w: 100, h: 40 }, { x: 160, y: 100, h: 40 });
  assert.equal(d, "M100 20 C130 20 130 120 160 120");
  assert.deepEqual(edgeMid({ x: 0, y: 0, w: 100, h: 40 }, { x: 160, y: 100, h: 40 }), { x: 130, y: 70 });
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

test("봇 줄기 = 봇에게 시킨 일 → 봇(일 있는 봇만) → 일 · 방 루틴 · 종은 「대화방 알림」 · 처음엔 봇까지만 보임", () => {
  const bots = { forks: [{ id: "scout", name: "살피기" }], routines: [
    { id: "chok.x", name: "X 급상승", who: "촉", bot: "chok", state: "live", fork: "scout" }, { id: "gyeol.b", name: "묶음", who: "결", bot: "gyeol", state: "off", fork: "scout" },
    { id: "chok.call", name: "호출", who: "촉", bot: "chok", state: "live", fork: "scout" }, { id: "room.a", name: "방 알림", who: "", bot: "", state: "live" }] };
  const t = treeOf(map, {}, 0, bots);
  assert.deepEqual(t.nodes.map((n) => [n.id, n.name]), [["root", "스케줄러"], ["g:bot", "봇에게 시킨 일"], ["bb:chok", "촉"], ["bb:gyeol", "결"], ["bb:~room", "대화방 알림"], ["g:run", "자동으로 도는 일"]]);
  const by = Object.fromEntries(t.nodes.map((n) => [n.id, n]));
  assert.equal(by["g:bot"].x, by["g:run"].x);   // 줄기 둘 = 같은 층
  assert.equal(by["bb:chok"].kids, 2); assert.equal(by["g:bot"].kids, 4); assert.equal(by.root.kids, 10);
  const t2 = treeOf(map, { "bb:chok": true }, 0, bots);
  assert.deepEqual(t2.nodes.filter((n) => n.kind === "routine").map((n) => [n.id, n.parent]), [["r:chok.x", "bb:chok"], ["r:chok.call", "bb:chok"]]);
});

// 폰에서 펼친 항목이 잘 나오게(형 11-16 19:1x 구름 맥 창 「스케줄 그 눌렀을때 쭉 나오는거 구거 제대로 항목들 모바일에서도 잘 나오는지 봐주라」)
test("폰 일 카드 키 = 셋째 줄(상태 · 켬끔)까지 들어감 · 가지 자리는 눌림에 안 흔들림", async () => {
  const { readFileSync } = await import("node:fs");
  const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
  const core = await import("../ui/sched-tree-core.ts");
  assert.ok(core.SIZE_DOWN.job >= 108 && core.SIZE_DOWN.routine >= 108);
  // 호출 열쇠 줄(형 11-16 22:0x 「호출이 있고 / 그 아래에 각각 호출 시크릿명칭 … 그 호출이 어디에 잇는건지도」) = 서버가 hook 을 줄 때만 · 그 카드만 한 줄만큼 큼 · 값은 안 다룸(이름 · 자리뿐)
  assert.ok(core.HOOK_ROW >= 26); assert.ok(core.HOOK_ROW_DOWN >= 32);   // 폰 줄은 더 큼(24 면 상태 줄이 잘림 · 실물)
  assert.match(rd("../ui/sched-tree-core.ts"), /s = r\.routine\?\.hook \? \{ w: s0\.w, h: s0\.h \+ \(down \? HOOK_ROW_DOWN : HOOK_ROW\) \* \(r\.routine\.hook_at \? 2 : 1\) \} : s0/);
  assert.match(rd("../ui/sched-tree.tsx"), /\{r\.hook \? <span className="nm-tree-l2 hook" data-miss=\{r\.hook_ok === false \|\| undefined\}><small>열쇠<\/small>/);   // hook_ok 거짓 = 「없음」 붉게(빠르 #4074 칸)   // 실물 = 줄 끝 101px(앞 96 = 잘림)
  const tsx = rd("../ui/sched-tree.tsx"), css = rd("../ui/sched-tree.css");
  assert.match(tsx, /const pos = \{ translate: `\$\{n\.x\}px \$\{n\.y\}px`, width: n\.w, height: n\.h,/);   // 자리 = translate 속성 → :active scale 이 자리를 안 줄임
  assert.doesNotMatch(tsx, /className=\{`nm-tree-node[^\n]*transform: `translate/);
  assert.match(css, /\.nm-tree-node \{[^}]*transition:translate \.26s var\(--e-out\);/);
  assert.match(css, /\.nm-tree-world \{[^}]*transition:transform \.26s var\(--e-out\); \}/);   // 판(끌기 · 배율)은 transform 그대로
});

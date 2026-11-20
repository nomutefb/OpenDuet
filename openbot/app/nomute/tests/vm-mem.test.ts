// 서랍 「VM 상태」(형 11-16 16:4x 「정원에 각 vm 쓰는 애들 한테 이 자료받아서 vm 상태 그리게 할거야 공간 하나 만들어줘」 · 「그거로 만들면돼.」 = lieflat-charts)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { dayStart, everyKo, gb, pctKo, textW, vmBusy, vmClean, vmDemo, vmFacts, vmGeom, vmLimit, vmMarks, vmPct, vmStats, vmWin } from "../ui/vm-mem-logic.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const T0 = 1794728400000;
const one = (o: Record<string, unknown> = {}) => ({ who: "깃", host: "Lx A", step_s: 300, t0: T0, used_gb: [1, 1.2, null, 1.7, 1.1], held_gb: [7.8, 3.8, null, 5.2, 3.8], min_gb: 4, max_gb: 10, ...o });

test("받은 자료 거르기 = 이름 · 칸 길이 · 값 하나 이상인 몸만 · 이상한 값은 빈 칸", () => {
  assert.deepEqual(vmClean(undefined), []); assert.deepEqual(vmClean({}), []);
  const v = vmClean([one(), { who: "", used_gb: [1] }, one({ who: "빈", used_gb: [null, null] }), one({ who: "값", used_gb: [1, "x", -3, Infinity, 2] }), one({ who: "칸없음", step_s: 0 })]);
  assert.deepEqual(v.map((x) => x.who), ["깃", "값"]);
  assert.deepEqual(v[1].used_gb, [1, null, null, null, 2]);
  assert.equal(v[0].min_gb, 4); assert.equal(v[0].max_gb, 10);
  assert.equal(vmClean([one({ held_gb: "없음" })])[0].held_gb, undefined);   // 쥔 램이 없어도 쓴 램만으로 그림
  const long = vmClean([one({ used_gb: Array.from({ length: 2020 }, () => 1) })])[0];
  assert.equal(long.used_gb.length, 2016); assert.equal(long.t0, T0 + 4 * 300_000);   // 너무 길면 뒤쪽만 · 시작 시각도 같이 밀림
});

test("셈 = 평균 · 최저 · 최고(칸) · 마지막 값 · 빈 칸은 안 셈", () => {
  const s = vmStats(vmClean([one()])[0]);
  assert.equal(s.n, 4); assert.equal(gb(s.avg), "1.3"); assert.equal(s.min, 1); assert.equal(s.max, 1.7); assert.equal(s.peak, 3);
  assert.equal(s.last, 1.1); assert.equal(s.heldLast, 3.8); assert.equal(s.t1, T0 + 4 * 300_000);
  assert.equal(everyKo(300), "5분마다"); assert.equal(everyKo(3600), "1시간마다");
});

test("다시 켜짐 = 서버가 준 표 먼저 · 없으면 값이 이어지다 비었다 다시 이어지는 자리만(듬성듬성한 구간은 끊김 아님)", () => {
  const cut = one({ used_gb: [1, 1, 1, null, 1.7, 1.1, 1.2], held_gb: undefined });
  assert.deepEqual(vmMarks(vmClean([cut])[0]), [{ t: T0 + 4 * 300_000, label: "다시 켜짐" }]);
  assert.deepEqual(vmMarks(vmClean([one({ marks: [{ t: T0 + 300_000, label: "다시 켜짐(스레드 10)" }, { t: "x" }] })])[0]), [{ t: T0 + 300_000, label: "다시 켜짐(스레드 10)" }]);
  assert.deepEqual(vmMarks(vmClean([one({ used_gb: [null, null, 1, 1, 1, 1] })])[0]), []);   // 처음부터 비어 있던 건 「다시」가 아님
  assert.deepEqual(vmMarks(vmClean([one({ used_gb: [1, null, 1, null, 1, null, 1, null, 1, 1, 1, 1, 1] })])[0]), []);   // 한 칸 건너 한 칸(옛 기록 구간) = 표 0 · 촘촘해지는 자리도 끊김 아님
  assert.deepEqual(vmMarks(vmClean([one({ used_gb: [1, null, 1, null, 1, 1, 1, 1, null, null, 1, 1, 1] })])[0]), [{ t: T0 + 10 * 300_000, label: "다시 켜짐" }]);
  assert.deepEqual(vmMarks(vmClean([one()])[0]), []);   // 앞뒤가 두 칸뿐 = 아직 모름
});

test("그림 자리 = 가는 선은 잰 값마다 하나(길 셋 + 최고 하나) · 윤곽은 빈 칸에서 끊김 · 쥔 램은 계단 · 끝 글", () => {
  const v = vmClean([one()])[0], g = vmGeom(v, 800, 280);
  const hairs = (g.hair.join("") + g.peakHair).match(/M/g)!.length;
  assert.equal(hairs, 4);   // 값 넷 = 선 넷(빈 칸은 선 없음)
  assert.equal(g.outline.match(/M/g)!.length, 2);   // 빈 칸에서 한 번 끊김
  assert.match(g.held, /^M[\d.]+ [\d.]+H[\d.]+V[\d.]+H/);   // 계단(가로 → 세로 → 가로)
  assert.equal(g.peak!.label.startsWith("최고 1.7GB · "), true);
  assert.deepEqual(g.refs.map((r) => r.label), ["VM 최소 4GB"]);   // VM 최대 = 맨 위 눈금(한도)이라 따로 안 그음
  assert.deepEqual(g.last, { used: 1.1, held: 3.8, busy: null });   // 지금 값 = 그림 밖 범례 줄(사용 · 할당 · 스레드) · 그림 안 끝 글은 걷음(형 11-19 「인덱싱 라벨들 글자 안겹치게」)
  assert.equal(vmGeom(v, 380, 250).r, g.r);   // 넓어도 오른쪽에 글 자리를 따로 안 둠
});

test("눈금 = 세로는 한도의 25 · 50 · 75 · 100% 네 지점 · 가로는 마지막으로 잰 때에서 거꾸로 24시간(0 · 6 · 12 · 18시 자리 + 끝 시각)", () => {
  // 형 11-17 07:55 「항상 자기 한도의 25 50 75 100 지점으로 라벨링을 하셈 차트는」 · 08:02 「항상 0 6 12 18 24 하면 돼. 어짜피 채워지니까」
  const v = vmClean([one()])[0], g = vmGeom(v, 400, 132);
  assert.equal(g.yMax, 10); assert.deepEqual(g.ticksY.map((t) => t.label), ["2.5", "5", "7.5", "10GB"]); assert.equal(g.ticksY.at(-1)!.y, g.top);
  assert.deepEqual(vmGeom(v, 400, 132, 64).ticksY.map((t) => t.label), ["16", "32", "48", "64GB"]);
  // 형 11-19 「그날그날 정보가 사라지는데, 가장 최근거가 맨 우측으로 되가지고 지금으로부터 24시간이 보이면된다는뜻이야」
  const noon = dayStart(T0) + 15 * 3_600_000, roll = vmClean([one({ t0: noon - 4 * 300_000 })])[0], gr = vmGeom(roll, 400, 132);   // 마지막 칸 = 15:00
  assert.deepEqual(gr.ticksX.filter((t) => !t.end).map((t) => t.label), ["18", "0", "6", "12"]); assert.equal(gr.ticksX.at(-1)!.x, gr.w - gr.r); assert.equal(gr.ticksX.at(-1)!.anchor, "end"); assert.equal(gr.t1, noon);
  const xs = gr.ticksX.map((t) => t.x); assert.ok(xs.every((x, i) => i === 0 || x - xs[i - 1] > 40));   // 가로 글끼리 안 붙음
  assert.deepEqual(vmWin(roll), { i0: 0, i1: 4, t0: noon - 86_400_000, t1: noon });
  const edge = vmGeom(vmClean([one({ t0: dayStart(T0) + 12 * 3_600_000 + 600_000 - 4 * 300_000 })])[0], 400, 132);   // 마지막 칸 = 12:10 → 12시 눈금은 끝 글과 붙어서 글을 뺌
  assert.deepEqual(edge.ticksX.filter((t) => !t.end).map((t) => t.label), ["18", "0", "6"]);
  assert.equal(vmLimit(vmClean([one({ max_gb: undefined })])[0], "16GB"), 16); assert.equal(vmLimit(vmClean([one({ max_gb: undefined, ram_max_gb: 12 })])[0], "16GB"), 12);
  assert.equal(vmLimit(vmClean([one({ max_gb: undefined })])[0]), 8);   // 아무 한도도 없으면 본 값에서 어림(7.8 → 8)
  // 창 = 거꾸로 24시간: 날이 바뀌어도 어제 칸이 남고(안 비워짐) · 24시간 넘은 칸만 빠짐
  const d0 = dayStart(T0 + 86_400_000), two = vmClean([one({ t0: d0 - 2 * 300_000, used_gb: [9, 9, 1, 2, 3], held_gb: undefined })])[0], g2 = vmGeom(two, 400, 132);
  assert.equal((g2.hair.join("") + g2.peakHair).match(/M/g)!.length, 5);   // 자정 앞 두 칸도 그림
  assert.equal(g2.peak!.label.startsWith("최고 9.0GB"), true);
  const old = vmClean([one({ step_s: 3600, t0: T0, used_gb: [9, ...Array(24).fill(1), 2], held_gb: undefined })])[0], go = vmGeom(old, 400, 132);   // 26칸 · 한 시간씩 = 맨 앞 한 칸(25시간 전)만 창 밖
  assert.equal((go.hair.join("") + go.peakHair).match(/M/g)!.length, 25); assert.equal(go.peak!.label.startsWith("최고 2.0GB"), true);
  const pad = vmClean([one({ t0: d0 - 86_400_000 + 20 * 3_600_000, used_gb: [1, 2, 3, ...Array(60).fill(null)], held_gb: undefined })])[0];   // 어제 20시에 셋 재고 그 뒤(오늘 새벽까지)는 빈 칸으로 채워져 옴
  assert.equal((vmGeom(pad, 400, 132).hair.join("") + vmGeom(pad, 400, 132).peakHair).match(/M/g)!.length, 3);   // 마지막으로 잰 칸이 오른쪽 끝 = 빈 판 아님
  assert.equal(vmGeom(pad, 400, 132).peak!.x <= 400 - 10, true); assert.equal(vmWin(pad).i1, 2);
});

test("숫자 줄 = RAM 평균 % / 평균 가용 % / 최대 %(한도 대비) · 스레드 선은 값이 올 때만", () => {
  // 형 11-17 07:59 「RAM 평균(%) / 평균 가용(%) / 최대(%) 이게 필요하거든%는 각 최대치에 대한 비율」 · 08:01 「우측엔 스레드 라벨로해서 그래프 라인이 2개로」
  const v = vmClean([one()])[0];
  assert.deepEqual(vmPct(v, 10), { avg: 13, avail: null, max: 17 }); assert.equal(pctKo(vmPct(v, 10)), "RAM 평균 13% / 평균 가용 – / 최대 17%");
  const nv = vmClean([one({ avail_gb: [8, 8, null, 6, 6], busy: [1, 2.5, null, 10, 4], threads: 10, ram_max_gb: 10, used_avg_pct: 14.2, avail_avg_pct: 70.4, used_max_pct: 18 })])[0];
  assert.equal(pctKo(vmPct(nv, vmLimit(nv))), "RAM 평균 14% / 평균 가용 70% / 최대 18%");   // 서버 요약이 있으면 그것
  assert.equal(vmPct(vmClean([one({ avail_gb: [8, 8, null, 6, 6] })])[0], 10).avail, 70);   // 없으면 받은 줄에서 셈
  const g = vmGeom(nv, 400, 132);
  assert.ok(g.busy.startsWith("M") && g.busy.match(/M/g)!.length === 2); assert.deepEqual(g.ticksR.map((t) => t.label), ["2.5", "5", "7.5", "10"]); assert.ok(g.r > vmGeom(v, 400, 132).r);
  assert.equal(vmGeom(v, 400, 132).busy, ""); assert.deepEqual(vmGeom(v, 400, 132).ticksR, []);   // 옛 몸 · 판 전 = 선 · 눈금 없음
  assert.equal(vmClean([one({ busy: [1, 2] })])[0].busy!.length, 5);   // 줄 길이는 쓴 램 줄에 맞춤(뒤쪽 정렬)
  // 형 11-19 「스레드 평균 몇인지, 쥔램 이런식으로 말고 좀 정확한 단어로 표기하고 잘보이게」
  assert.deepEqual(vmBusy(nv), { avg: 4.375, last: 4, threads: 10 }); assert.equal(vmBusy(v), null);
  assert.deepEqual(vmFacts(nv, 10), [{ k: "RAM 평균", v: "14%" }, { k: "평균 가용", v: "70%" }, { k: "최대", v: "18%" }, { k: "스레드 평균", v: "4.4 / 10" }]);
  assert.deepEqual(vmFacts(v, 10).map((f) => f.k), ["RAM 평균", "평균 가용", "최대"]);   // 스레드 값이 없는 몸 = 칸도 없음
  assert.equal(g.last.busy, 4);
});

test("최고 글 = 판 안 · 그 글 너비 안의 할당 계단 · VM 최소 선에 안 닿는 높이", () => {
  // 형 11-19 그림 = 최고 2.4GB 글이 바로 위 할당 선(3.8GB) · VM 최소 점선(4GB)에 얹혀 있었음
  const used = Array.from({ length: 72 }, (_, i) => (i === 12 ? 2.4 : 1.6)), heldL = Array.from({ length: 72 }, () => 3.8);
  const v = vmClean([one({ used_gb: used, held_gb: heldL, min_gb: 4, max_gb: 10 })])[0], g = vmGeom(v, 700, 132), p = g.peak!, half = textW(p.label, 10.5) / 2;
  const yHeld = g.base - (3.8 / 10) * (g.base - g.top), yMin = g.refs[0].y;
  for (const yy of [yHeld, yMin]) assert.ok(yy < p.ly - 11 || yy > p.ly + 5, `선 ${yy} 이 글(${p.ly}) 에 닿음`);
  assert.ok(p.ly < p.y - 11);   // 점 바로 위가 막혀서 더 올라감
  assert.ok(p.lx - half >= g.l && p.lx + half <= g.w - g.r);   // 왼쪽 끝 가까운 최고점도 글은 판 안
  const clear = vmGeom(vmClean([one({ used_gb: used, held_gb: undefined, min_gb: undefined })])[0], 700, 132).peak!;
  assert.equal(clear.ly, clear.y - 11);   // 막는 게 없으면 점 바로 위
});

test("24시간 · 5분 칸 = 그 창 것만 가는 선으로 · 다시 켜짐 표", () => {
  const v = vmDemo(dayStart(T0 + 86_400_000) + 86_400_000 - 300_000)[0], g = vmGeom(v, 1200, 280), filled = v.used_gb.filter((x) => x !== null).length;   // 자정 5분 전까지 = 하루가 꽉 참
  assert.equal(v.used_gb.length, 288);
  assert.equal((g.hair.join("") + g.peakHair).match(/M/g)!.length, filled);
  assert.ok(g.ticksX.length >= 4 && g.ticksX.at(-1)!.end);
  assert.equal(g.marks.length, 1); assert.match(g.marks[0].label, /^\d\d:\d\d 다시 켜짐$/);
});

test("배선 = 서랍 화면 · 길 #/vm · 자료 문 vm-mem · 그림 꼴 출처 적음", () => {
  const shell = rd("../ui/shell.tsx"), desk = rd("../ui/vm-desk.tsx"), router = rd("../router.tsx"), tabs = rd("../ui/drawer-tabs.ts");
  assert.match(shell, /\{ id: "vmstat", label: "몸 상태", icon: "box", to: "\/vm" \}/);   // 이름 = 몸 상태(형 11-16 17:5x 「하드웨어애들도 다 보이게할거니까 쭈르륵 애들 다 보이게해줘」 · 앞 = VM 상태)
  assert.match(router, /"\/vm"/); assert.ok(!tabs.includes('"vmstat"'));   // 따로 선 탭 아님 = 길 #/vm 은 5번 「애들」 화면으로(그래프는 애 카드 안 · 「몸」 탭은 걷음 · 형 11-17)
  assert.match(shell, /if \(p === "\/runner" \|\| p === "\/sched" \|\| p === "\/vm"\) return \{ modal: "botdesk" \};/);
  assert.match(rd("../ui/bot-desk.tsx"), /\["turn", "차례"\]\];/); assert.doesNotMatch(rd("../ui/bot-desk.tsx"), /"body"|<VmDesk/); assert.match(desk, /export function VmCard\(/);
  assert.match(desk, /\.\.\.vmMemOpts<VmMemRes>\(\)/); assert.match(rd("../data/crew-warm.ts"), /office<T>\("vm-mem"\)/);   // 자료 문 = vm-mem(읽는 꼴은 ../data/crew-warm.ts 한 벌)
  assert.match(rd("../ui/vm-mem-logic.ts"), /nomutefb\/lieflat-charts F3 Hairline Area/);
});

test("몸 칸 = 애마다 제 카드 안(사양 · 몸 비고 · 숫자 줄 · 하루 그래프) · 낮은 띠로 훑고 누르면 키움", async () => {
  const desk = rd("../ui/vm-desk.tsx"), bd = rd("../ui/bot-desk.tsx");
  assert.match(desk, /vmClean\(q\.data\?\.vms\)\.find\(\(x\) => x\.who === r\.who\)/);   // 램 기록은 이름으로 붙임
  assert.match(desk, /vmFacts\(v, limit\)\.map\(/); assert.match(desk, /vmLimit\(v, r\.hw\?\.ram\)/);
  assert.match(desk, /사용 <b>\{gb\(g\.last\.used\)\}GB<\/b>/); assert.match(desk, /할당 <b>\{gb\(g\.last\.held\)\}GB<\/b>/); assert.doesNotMatch(desk + rd("../ui/vm-mem-logic.ts").replace(/^\s*(\/\/|\*|\/\*).*$/gm, ""), /쥔 램 \$|쓴 램 \$/);   // 낱말 = 사용 · 할당
  assert.match(desk, /const \[ref, w\] = useWidth\(\), \[tall, setTall\] = useState\(false\);/);
  assert.match(desk, /h = tall \? 280 : 132/);
  assert.match(bd, /<VmCard key=\{`v-\$\{picked\.who\}`\} r=\{picked\} \/>/);
});

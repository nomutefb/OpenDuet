// 서랍 「VM 상태」(형 11-16 16:4x 「정원에 각 vm 쓰는 애들 한테 이 자료받아서 vm 상태 그리게 할거야 공간 하나 만들어줘」 · 「그거로 만들면돼.」 = lieflat-charts)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { everyKo, gb, vmClean, vmDemo, vmGeom, vmMarks, vmStats } from "../ui/vm-mem-logic.ts";
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

test("그림 자리 = 가는 선은 잰 값마다 하나(길 셋 + 최고 하나) · 윤곽은 빈 칸에서 끊김 · 쥔 램은 계단 · 눈금 · 끝 글", () => {
  const v = vmClean([one()])[0], g = vmGeom(v, 800, 280);
  assert.equal(g.yMax, 12); assert.equal(g.ticksY.at(-1)!.label, "12GB"); assert.equal(g.ticksY[0].y, g.base);
  const hairs = (g.hair.join("") + g.peakHair).match(/M/g)!.length;
  assert.equal(hairs, 4);   // 값 넷 = 선 넷(빈 칸은 선 없음)
  assert.equal(g.outline.match(/M/g)!.length, 2);   // 빈 칸에서 한 번 끊김
  assert.match(g.held, /^M[\d.]+ [\d.]+H[\d.]+V[\d.]+H/);   // 계단(가로 → 세로 → 가로)
  assert.equal(g.peak!.label.startsWith("최고 1.7GB · "), true);
  assert.deepEqual(g.refs.map((r) => r.label), ["VM 최소 4GB", "VM 최대 10GB"]);
  assert.equal(g.end.used!.label, "쓴 램 1.1GB"); assert.equal(g.end.held!.label, "쥔 램 3.8GB");
  const narrow = vmGeom(v, 380, 250);
  assert.equal(narrow.end.used, null); assert.ok(narrow.r < g.r);   // 좁은 판 = 끝 글 자리 없음(아래 범례가 말함)
  const close = vmGeom(vmClean([one({ used_gb: [3.7, 3.7], held_gb: [3.8, 3.8] })])[0], 800, 280);
  assert.ok(Math.abs(close.end.used!.y - close.end.held!.y) >= 13);   // 두 끝 글이 붙으면 벌림
});

test("24시간 · 5분 칸 = 가는 선 288개가 길 넷에 다 들어감 · 시각 눈금은 3시간마다(좁으면 6시간)", () => {
  const v = vmDemo(T0 + 86_400_000)[0], g = vmGeom(v, 1200, 280), filled = v.used_gb.filter((x) => x !== null).length;
  assert.equal(v.used_gb.length, 288);
  assert.equal((g.hair.join("") + g.peakHair).match(/M/g)!.length, filled);
  assert.ok(g.ticksX.length >= 7 && g.ticksX.length <= 9); assert.ok(g.ticksX.every((t) => /^\d\d시$/.test(t.label)));
  assert.ok(vmGeom(v, 380, 250).ticksX.length <= 5);
  assert.equal(g.marks.length, 1); assert.match(g.marks[0].label, /^\d\d:\d\d 다시 켜짐$/);
});

test("배선 = 서랍 화면 · 길 #/vm · 자료 문 vm-mem · 그림 꼴 출처 적음", () => {
  const shell = rd("../ui/shell.tsx"), desk = rd("../ui/vm-desk.tsx"), router = rd("../router.tsx"), tabs = rd("../ui/drawer-tabs.ts");
  assert.match(shell, /\{ id: "vmstat", label: "몸 상태", icon: "box", to: "\/vm" \}/);   // 이름 = 몸 상태(형 11-16 17:5x 「하드웨어애들도 다 보이게할거니까 쭈르륵 애들 다 보이게해줘」 · 앞 = VM 상태)
  assert.match(shell, /M\.id === "vmstat" \? <div className="nm-scroll"><VmDesk \/><\/div>/);
  assert.match(router, /"\/vm"/); assert.match(tabs, /"botdesk", "vmstat", "sched"/);
  assert.match(desk, /office<VmMemRes>\("vm-mem"\)/);
  assert.match(rd("../ui/vm-mem-logic.ts"), /nomutefb\/lieflat-charts F3 Hairline Area/);
});

test("몸 상태 = 애들 전부 한 줄씩(봇 현황 표 차례) · 램 기록은 이름으로 붙임 · 표에 없는 몸은 맨 아래", async () => {
  const desk = rd("../ui/vm-desk.tsx");
  assert.match(desk, /office<Sheet>\("status\/bots"\)/);   // 상태 · 특기 · 하드웨어 = 봇 현황 표
  assert.match(desk, /queryKey: \["nomute", "bots-sheet"\]/);   // 봇 현황 화면과 같은 열쇠(받아 둔 표를 같이 씀)
  assert.match(desk, /return \[\.\.\.rows\.map\(\(r\) => \(\{ who: r\.who, r, v: by\.get\(r\.who\) \}\)\), \.\.\.vms\.filter\(\(v\) => !seen\.has\(v\.who\)\)\.map\(\(v\) => \(\{ who: v\.who, v \}\)\)\];/);
  assert.match(desk, /: v \? null : <span>램 기록 아직 없음<\/span>/);   // 아직 안 재는 몸 = 한 마디(오면 저절로)
  assert.match(desk, /const \[ref, w\] = useWidth\(\), \[tall, setTall\] = useState\(false\);/);   // 낮은 띠로 훑고 누르면 그 줄만 키움
  assert.match(desk, /h = tall \? 280 : 132/);
});

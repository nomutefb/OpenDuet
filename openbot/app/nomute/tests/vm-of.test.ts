// 애 카드 램 기록 고르기(ui/vm-mem-logic.ts vmOf) — R0104 · 형 11-21 17:40 dm-gik 「깃 이거 싱크 안맞는 애들이 있어. 확인 좀 부탁해~!」 「윈타가 데비안 왔는데 윈도우 서버가 그러지는 등」
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { type VmMem, vmOf } from "../ui/vm-mem-logic.ts";

const vm = (who: string, host?: string): VmMem => ({ who, host, step_s: 300, t0: 1, used_gb: [1] });
const BODIES = [   // 11-21 17:4x 라이브 GET status bodies 그대로(줄임)
  { being: "시아", body: "Lx A", kind: "pc", on: true, hosts: ["lxa-sia"] },
  { being: "뎅", body: "Lx B", kind: "pc", on: true, hosts: ["deng", "nuri"] },
  { being: "윈터", body: "Lx B", kind: "pc", on: true, hosts: ["윈터몸", "winter"] },
  { being: "빠르", body: "VM 빠르", kind: "vm@윈A", on: true, hosts: ["fast"] },
];
const VMS = [vm("시아", "sia"), vm("뎅", "deng"), vm("빠르", "fast")];

test("제 이름 줄이 있으면 그 줄 그대로", () => {
  assert.equal(vmOf(VMS, "뎅", BODIES)?.who, "뎅");
  assert.equal(vmOf(VMS, "빠르", BODIES)?.who, "빠르");
});

test("제 줄 없음 = 같은 몸 줄(윈터 = Lx B → 뎅 deng) · 제 몸 host 로 온 줄이 먼저", () => {
  assert.equal(vmOf(VMS, "윈터", BODIES)?.host, "deng");
  assert.equal(vmOf([...VMS, vm("몸", "winter")], "윈터", BODIES)?.host, "winter", "제 몸 host 줄이 있으면 그것");
});

test("몸 표에 없거나 같은 몸 짝이 없으면 = 없음(남의 몸 줄을 빌리지 않음) · 꺼진 짝은 안 셈", () => {
  assert.equal(vmOf(VMS, "깃", BODIES), undefined);
  assert.equal(vmOf([vm("시아", "sia")], "윈터", BODIES), undefined);
  assert.equal(vmOf(VMS, "윈터", BODIES.map((b) => (b.being === "뎅" ? { ...b, on: false } : b))), undefined);
});

test("카드 = 같은 조회(status)의 몸 표로 vmOf", () => {
  const s = readFileSync(new URL("../ui/vm-desk.tsx", import.meta.url), "utf8");
  assert.match(s, /const v = useMemo\(\(\) => vmOf\(vmClean\(q\.data\?\.vms\), r\.who, bodiesOf\(st\)\), \[q\.data, r\.who, st\]\);/);
  assert.match(s, /const st = useQuery\(statusOpts\(\)\)\.data\?\.bodies;/);
});

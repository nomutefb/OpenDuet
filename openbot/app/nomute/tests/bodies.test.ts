import assert from "node:assert/strict";
import test from "node:test";
import { machinesOf, type Body } from "../data/bodies-core.ts";

// 형 11-08 20:56 사진 — 깃 · 빚이 한 본체(Lx A)에 사용자 둘 → 칸 둘로 떴음 · 같은 몸 이름 = 한 칸(host 합침)
test("같은 몸 이름 본체 줄 둘 = 한 칸 · host 합침 · 차례 그대로", () => {
  const bs: Body[] = [
    { being: "윈터", body: "윈A", kind: "pc", hosts: ["윈A", "win-a"] },
    { being: "뎅", body: "VM 뎅", kind: "vm@윈A", hosts: ["deng"] },
    { being: "깃", body: "Lx A", kind: "pc", hosts: ["lxa-gik"] },
    { being: "빚", body: "Lx A", kind: "pc", hosts: ["lxa-bit", "lxa"] },
    { being: "누리", body: "Lx B", kind: "pc", hosts: ["nuri"] },
  ];
  const ms = machinesOf(bs);
  assert.deepEqual(ms.map((b) => b.body), ["윈A", "Lx A", "Lx B"]);
  assert.deepEqual(ms[1].hosts, ["lxa-gik", "lxa-bit", "lxa"]);
  assert.deepEqual(bs[2].hosts, ["lxa-gik"]);   // 정본 줄은 안 건드림(사본에 합침)
});

test("이사 중(on false) · VM 은 칸 아님", () => {
  const bs: Body[] = [
    { being: "봄", body: "맥", kind: "mac", hosts: ["맥"] },
    { being: "누리", body: "누리 PC", kind: "pc", on: false, hosts: ["nuri"] },
    { being: "뜸", body: "맥 VM 뜸", kind: "vm@맥", hosts: ["eyes"] },
  ];
  assert.deepEqual(machinesOf(bs).map((b) => b.body), ["맥"]);
});

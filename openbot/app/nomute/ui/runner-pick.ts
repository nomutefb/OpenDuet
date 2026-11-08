// 러너 게이지 몸 줄 고르기 — ui/runner-gauges.tsx 에서 뗀 순수 함수(시험이 되게 · 모루 #2899·#2904 「합성 시험(온도만 신선 · CPU만 신선 · alias 다름)도 같이」 · 번개 11-08)
//   한 몸 = host 이름 여럿(시아 PC: hwang → sia 로 보고 이름이 바뀜) · 줄 둘 = hw(cpu·ram) + `<host>-temp`(온도)
//   고르기 = 점수(hw 신선 2 + 온도 신선 1) 높은 host · 같으면 마지막 보고가 최근인 host · 한 host 의 두 줄만 같이 씀(호스트가 섞이면 산 cpu 에 낡은 온도 꼴 · 모루 #2899)
//   옛 host 의 온도만 신선해도(점수 1) 새 host 의 CPU(점수 2)를 버리지 않음(모루 #2904)
export type HwRow = { key: string; stale?: boolean; reported_at?: number; metrics?: Record<string, number> };
export type Picked<R extends HwRow> = { a?: R; b?: R };

export function pickHost<R extends HwRow>(hw: R[], hosts: string[]): Picked<R> | undefined {
  const rs = hosts.map((h) => ({ a: hw.find((r) => r.key === h), b: hw.find((r) => r.key === `${h}-temp`) })).filter((x) => x.a || x.b);
  const last = (x: Picked<R>) => Math.max(x.a?.reported_at || 0, x.b?.reported_at || 0);
  const score = (x: Picked<R>) => (x.a && !x.a.stale ? 2 : 0) + (x.b && !x.b.stale ? 1 : 0);
  return rs.sort((x, y) => score(y) - score(x) || last(y) - last(x))[0];
}

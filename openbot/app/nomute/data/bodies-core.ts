// 몸 정본 순수 셈(시험 가능 · 외부 꾸러미 없음) — ./bodies.ts 가 이걸 다시 내보내고 useBodies 만 더함(봄 11-08 · node --test 가 react-query 없이 돌게)
/** being = 아이 · body = 몸 이름 · kind = pc | mac | vm@<몸> · on = 그 몸에 삶(false = 이사 중) · hosts = 몸 보고 host 이름(첫째 = 지금 이름) */
export type Body = { being: string; body: string; kind: string; on?: boolean; hosts: string[]; moving?: string };

/** 서버가 아직 bodies 를 안 줄 때만 쓰는 사본(정본 11-08 02:0x 판 그대로 · 서버 답이 오면 그쪽이 이김) */
export const BODIES_FALLBACK: Body[] = [   // 몸.json 11-09 판(형 09:48 「시아는 lx a에 있는게 아니라, 윈a vm이야」 · 「llx a 가 깃이랑 빚이야」 · 봄 9ffdf1d)
  { being: "윈터", body: "윈A", kind: "pc", on: true, hosts: ["윈A", "win-a", "wina"] },
  { being: "봄", body: "맥", kind: "mac", on: true, hosts: ["맥", "mac"] },
  { being: "시아", body: "VM 시아", kind: "vm@윈A", on: true, hosts: ["sia"] },
  { being: "누리", body: "Lx B", kind: "pc", on: true, hosts: ["nuri", "neo"] },
  { being: "뎅", body: "VM 뎅", kind: "vm@윈A", on: true, hosts: ["deng"] },
  { being: "빠르", body: "VM 빠르", kind: "vm@윈A", on: true, hosts: ["fast"] },
  { being: "번개", body: "VM 번개", kind: "vm@윈A", on: true, hosts: ["light"] },
  { being: "뜸", body: "맥 VM 뜸", kind: "vm@맥", on: true, hosts: ["eyes"] },
  { being: "깃", body: "Lx A", kind: "pc", on: true, hosts: ["lxa-gik"] },
  { being: "빚", body: "Lx A", kind: "pc", on: true, hosts: ["lxa-bit"] },
];

/** 순수 — 서버 bodies(없거나 비면 사본) */
export const bodiesOf = (x?: unknown): Body[] =>
  Array.isArray(x) && x.length ? (x as Body[]).filter((b) => b && b.being && b.body && Array.isArray(b.hosts)) : BODIES_FALLBACK;

/** 순수 — host 이름 → 그 몸(몸 보고 host · 작동 표 key 앞말) */
export const bodyByHost = (bs: Body[], host: string) => bs.find((b) => b.hosts.includes(host));

/** 순수 — 본체(pc · mac)인가(그 밖 = VM · kind vm@<몸>) */
export const isBox = (b: Body) => b.kind === "pc" || b.kind === "mac";

/** 순수 — 지금 서 있는 본체(게이지 · 몸 막대 칸) = 본체 중 이사 중 아닌 것 · 정본 차례 그대로
 *  같은 몸 이름 줄이 둘 이상이면 한 칸으로 묶음(host 는 차례대로 합침) — 한 본체에 사용자가 둘(Lx A = 깃 gik · 빚 bit · 형 11-08 20:56 사진 「LX A」 두 칸 · 봄) */
export const machinesOf = (bs: Body[]): Body[] => {
  const out: Body[] = [];
  for (const b of bs) {
    if (!isBox(b) || b.on === false) continue;
    const same = out.find((x) => x.body === b.body);
    if (same) { for (const h of b.hosts) if (!same.hosts.includes(h)) same.hosts.push(h); continue; }
    out.push({ ...b, hosts: [...b.hosts] });
  }
  return out;
};

/** 순수 — 그 아이가 지금 사는 본체 이름(VM = kind 의 @ 뒤 · 이사 중 = moving 괄호 「지금 vm@<몸>」 · 본체 = 제 몸) */
export const homeOf = (b: Body): string | null => {
  const vm = b.kind.match(/^vm@(.+)$/);
  if (vm) return vm[1];
  if (b.on === false) { const m = b.moving || ""; return m.match(/vm@([^)\s·]+)/)?.[1] ?? m.match(/\(([^\s()]+) VM\b/)?.[1] ?? null; }   // 「지금 vm@윈A」 · 「(윈A VM neo → …)」 둘 다(모루 #2871)
  return b.body;
};


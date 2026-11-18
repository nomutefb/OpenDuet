// 애 카드 몸 칸의 살아 있는 줄 — 옛 러너 층 「③ 몸 지도」(본체 × 하드웨어 · 온도 · 도커 · SSH · 백업 · VM · GitHub 러너)를 애마다 제 카드로
//   형 11-19 「몸 지도도, 각 애들 동그라미 누르면 나오는 지도에 포함되어잇는데 거기에 녹이면됨」 · 「설명글을 추가할필요는없고 거기서 디테일하면됨」
//   본체에 사는 애(윈터 = 윈A · 봄 = 맥 · 시아 = Lx A · 뎅 = Lx B) = 그 본체 줄 전부 · VM 에 사는 애 = 제 VM 줄 + 얹힌 본체 불 하나(본체 자세한 줄은 그 본체 애 카드에 = 되풀이 0)
//   자료 = GET status(./status-q.ts · 러너 층과 같은 답) · 가만한 줄(움직임 0) · 긴 글 = 마우스 올림
import { useQuery } from "@tanstack/react-query";
import { type Body, bodiesOf, homeOf, isBox } from "../data/bodies";
import { type HealthSt, HEALTH_KO, StatusDot } from "./sched-bits";
import { type StatusRow, catRows, pickRow, statusOpts } from "./status-q";

const RUN_ON: [string, string][] = [["nomute-win-", "윈A"], ["mac-", "맥"]];   // GitHub 러너 이름 앞말 → 그 러너가 도는 몸 host
const first = (s?: string) => String(s || "").split(" · ")[0];
const gone = (r?: StatusRow) => !!r && (!!r.stale || r.note === "보고 끊김");
const m = (r?: StatusRow) => (gone(r) ? {} : r?.metrics || {});
const pct = (r?: StatusRow) => { const x = m(r); return [x.cpu !== undefined ? `CPU ${Math.round(x.cpu)}%` : "", x.ram !== undefined ? `램 ${Math.round(x.ram)}%` : "", x.disk_free !== undefined ? `빔 ${Math.round(x.disk_free)}%` : ""].filter(Boolean).join(" · "); };
const temp = (r?: StatusRow) => { const x = m(r); return [x.cpu_temp !== undefined ? `CPU ${Math.round(x.cpu_temp)}°` : "", x.gpu_temp !== undefined ? `GPU ${Math.round(x.gpu_temp)}°` : ""].filter(Boolean).join(" · "); };
const tipOf = (r: StatusRow) => [r.name, r.value, r.note].filter(Boolean).join(" · ");
type Chip = { k: string; st: HealthSt; text: string; tip: string };
const worstOf = (sts: HealthSt[]): HealthSt => (sts.includes("miss") ? "miss" : sts.includes("late") ? "late" : sts.length && sts.every((x) => x === "ok" || x === "off") ? "ok" : "unknown");

/** 순수 — SSH 줄 → 됨 / 전체(칸이 있으면 칸 · 없으면 value 글 「맥 됨(hwang) · …」) */
export function sshCount(r?: { cells?: Record<string, { st: string }>; value?: string }): { ok: number; all: number } {
  const cs = Object.values(r?.cells || {});
  if (cs.length) return { ok: cs.filter((c) => c.st === "ok").length, all: cs.length };
  const ms = [...String(r?.value ?? "").matchAll(/([^·]+?)\s(됨|안 됨|꺼짐)(?:\([^)]*\))?\s*(?:·|$)/g)];
  return { ok: ms.filter((x) => x[2] === "됨").length, all: ms.length };
}

/** 본체 하나의 줄들(하드웨어 · 온도 · 도커·VM · SSH · 백업 · GitHub 러너) */
function boxChips(b: Body, hw: StatusRow[], dock: StatusRow[], ssh: StatusRow[], backup: StatusRow[]): Chip[] {
  const out: Chip[] = [], put = (k: string, r: StatusRow | undefined, text: string) => { if (r) out.push({ k, st: r.st, text: gone(r) ? "보고 끊김" : text || first(r.value) || HEALTH_KO[r.st], tip: tipOf(r) }); };
  const h = pickRow(hw, b.hosts), t = pickRow(hw, b.hosts, "-temp");
  put("hw", h, pct(h)); put("temp", t, temp(t));
  const d = dock.find((x) => b.hosts.includes(x.key)); put("dock", d, first(String(d?.value || "").replace(/\([^)]*\)/g, "")));   // 괄호 속 「 · 」에서 끊기지 않게
  const s = ssh.find((x) => b.hosts.includes(x.key)); if (s) { const n = sshCount(s); out.push({ k: "ssh", st: s.st, text: n.all ? `SSH ${n.ok}/${n.all}` : first(s.value) || "SSH", tip: [s.name, Object.entries(s.cells || {}).map(([k, c]) => `${k} ${c.note || HEALTH_KO[c.st]}`).join(" · ") || s.value, s.note].filter(Boolean).join(" · ") }); }
  for (const r of backup.filter((x) => b.hosts.includes(String(x.host || x.key.split("-")[0])))) out.push({ k: `bk:${r.key}`, st: r.st, text: r.name.replace(new RegExp(`^(${b.hosts.join("|")})\\s*`), "").replace(/\(.*\)$/, "").trim(), tip: tipOf(r) });
  const run = hw.find((r) => r.key === "러너"), cs = Object.entries(run?.cells || {}).filter(([n]) => RUN_ON.some(([p, host]) => n.startsWith(p) && b.hosts.includes(host)));
  if (cs.length) { const ok = cs.filter(([, c]) => c.st === "ok").length; out.push({ k: "run", st: worstOf(cs.map(([, c]) => c.st)), text: `러너 ${ok}/${cs.length}`, tip: cs.map(([n, c]) => `${n} ${c.note || HEALTH_KO[c.st]}`).join(" · ") }); }
  return out;
}

/** 그 애 몸의 살아 있는 줄 — 답이 없거나 그 애 줄이 없으면 아무것도 안 그림 */
export function BodyChips({ who }: { who: string }) {
  const q = useQuery(statusOpts()), d = q.data;
  if (!d) return null;
  const bs = bodiesOf(d.bodies), me = bs.find((b) => b.being === who && b.on !== false);
  const hw = catRows(d, "hw", bs), dock = catRows(d, "docker", bs), ssh = catRows(d, "ssh", bs), backup = catRows(d, "backup", bs);
  let chips: Chip[] = [];
  if (me && isBox(me)) chips = boxChips(me, hw, dock, ssh, backup);
  else {
    const v = hw.find((r) => r.key === `VM ${who}`);
    if (v) chips.push({ k: "vm", st: v.st, text: gone(v) ? "보고 끊김" : pct(v) || first(v.value), tip: tipOf(v) });
    const home = me ? homeOf(me) : null, box = home ? bs.find((b) => b.body === home && isBox(b)) : undefined;
    if (box) { const cs = boxChips(box, hw, dock, ssh, backup); if (cs.length) chips.push({ k: "box", st: worstOf(cs.map((c) => c.st)), text: box.body, tip: cs.map((c) => c.text).join(" · ") }); }
  }
  if (!chips.length) return null;
  return <p className="nm-vm-chips" aria-label={`${who} 몸 상태`}>{chips.map((c) => <span key={c.k} data-st={c.st} title={c.tip}><StatusDot st={c.st} />{c.text}</span>)}</p>;
}

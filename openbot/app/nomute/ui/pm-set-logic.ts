// 설정 「PM」 고르기 셈(화면 = ./pm-set.tsx · 서버 = editor functions/api/office/_pm.js pmRoster 와 같은 걸름)
export type PmPerson = { who: string; name?: string; kind?: string; gone?: boolean; empty?: boolean; nocard?: boolean; face?: string };
export type PmRoom = { id: string; kind?: string; name?: string; with?: string };

/** 고를 수 있는 봇 — 형 · 빈 자리 · 없어진 이 · 기계 알림 뺌. 차례 = 명부 그대로. */
export function pmCandidates<T extends PmPerson>(list: T[]): T[] {
  return (list || []).filter((p) => p && p.who && p.kind !== "human" && p.kind !== "system" && !p.gone && !p.empty && !p.nocard);
}

/** 지금 PM 의 1:1 방 — with(이름 id) 먼저 · 방 이름이 who 와 같으면 그것도(여울 방 이름 ≠ who 「윈터」). */
export function pmRoomId(pm: string, rooms: PmRoom[]): string {
  if (!pm) return "";
  const dm = (rooms || []).filter((r) => r && (r.kind === "dm" || String(r.id || "").startsWith("dm-")));
  return dm.find((r) => r.with === pm)?.id || dm.find((r) => r.name === pm)?.id || "";
}

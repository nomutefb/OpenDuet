// 촉 방 「요약」 단추를 달 글 고르기(순수 · 시험 tests/ask-pick.test.ts · 단추 = ./ask-pick.tsx)
const URL1 = /https?:\/\/[^\s<>"'「」()]+[^\s<>"'「」().,;:!?]/;
/** 단추를 달 글이면 {text, url} — 촉 방 · 첨부 없는 글 · 기사 주소가 있거나 「[촉]」으로 시작(러너 촉 판) */
export function askPickOf(room: string, m: { text?: string; files?: unknown[] }): { text: string; url: string } | null {
  if (room !== "dm-chok" || m.files?.length) return null;
  const t = String(m.text || "").trim(), u = URL1.exec(t)?.[0] || "";
  if (!u && !/^\[촉\]/.test(t)) return null;
  return { text: t.slice(0, 1500), url: u };
}


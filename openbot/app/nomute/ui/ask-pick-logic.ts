// 촉(지금 슈왕) 방 「요약」 단추를 달 글 고르기(순수 · 시험 tests/ask-pick.test.ts · 단추 = ./ask-pick.tsx)
/** 단추 다는 방 = 옛 촉 1:1 + 이름 바뀐 슈왕 1:1(형 11-17 00:38 dm-issueking 「예전에는 바로 요약으로 받을 수 있게 줬었는데」 · 방 이름이 dm-issueking 으로 바뀌며 단추가 빠졌음) */
const ROOMS = new Set(["dm-chok", "dm-issueking"]);
const URL1 = /https?:\/\/[^\s<>"'「」()]+[^\s<>"'「」().,;:!?]/;
/** 단추를 달 글이면 {text, url} — 촉 방 · 첨부 없는 글 · 기사 주소가 있거나 「[촉]」으로 시작(러너 촉 판) */
export function askPickOf(room: string, m: { text?: string; files?: unknown[] }): { text: string; url: string } | null {
  if (!ROOMS.has(room) || m.files?.length) return null;
  const t = String(m.text || "").trim(), u = URL1.exec(t)?.[0] || "";
  if (!u && !/^\**\s*\[촉보?\]/.test(t)) return null;   // 「[촉]」 · 「**[촉보] …**」(형 11-13 09:32 「속보 이제 촉보로 하자」)
  return { text: t.slice(0, 1500), url: u };
}


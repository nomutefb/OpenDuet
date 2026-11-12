// 움짤 스티커 순수 판(.ts · node 시험 길 · 뜸 11-12) — 그리는 쪽 = ./sticker.tsx
export type Item = { id: string; label: string };
export type Pack = { id: string; name: string; items: Item[] };
const MOODS: Item[] = [{ id: "joy", label: "좋아" }, { id: "thanks", label: "고마워" }, { id: "think", label: "생각중" }, { id: "surprise", label: "놀람" }, { id: "done", label: "해냈다" }];
export const PACKS: Pack[] = [
  { id: "fast", name: "빠르", items: MOODS },
  { id: "bom", name: "봄", items: MOODS },
  { id: "eyes", name: "뜸", items: [...MOODS, { id: "rise", label: "해뜸" }] },   // 해뜸 = 뜸 얼굴 해가 떠오르다 뽕 하고 밥알(형 11-12 12:39 「해가 뜨다가 갑자기 뜸이 뜨는것도 해줘」)
];
export const stickerUrl = (p: Pack, it: Item) => `/office/sticker/${p.id}/${it.id}.gif`;
export const stickerText = (p: Pack, it: Item) => `[스티커 ${p.name} ${it.label}]`;
const RE = /^\s*\[스티커\s+(\S+)\s+(\S+)\]\s*$/;
/** 순수 — 글 하나가 스티커 한 줄이면 {pack, item} */
export function stickerOf(text: unknown): { pack: Pack; item: Item } | null {
  const m = RE.exec(String(text || ""));
  if (!m) return null;
  const pack = PACKS.find((p) => p.name === m[1] || p.id === m[1]);
  const item = pack?.items.find((x) => x.label === m[2] || x.id === m[2]);
  return pack && item ? { pack, item } : null;
}

/** 보내는 중 글(이 탭에서만 · 서버 답이 오면 진짜 글로 갈음) */
export const STK_TMP = "stk-tmp-";
export const stickerMark = (id: unknown): "wait" | "sent" => (String(id || "").startsWith(STK_TMP) ? "wait" : "sent");


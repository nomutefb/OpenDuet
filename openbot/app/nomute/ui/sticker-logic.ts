// 움짤 스티커 순수 판(.ts · node 시험 길 · 뜸 11-12) — 그리는 쪽 = ./sticker.tsx
export type Item = { id: string; label: string };
export type Pack = { id: string; name: string; items: Item[] };
const MOODS: Item[] = [{ id: "joy", label: "좋아" }, { id: "thanks", label: "고마워" }, { id: "think", label: "생각중" }, { id: "surprise", label: "놀람" }, { id: "done", label: "해냈다" }];
export const PACKS: Pack[] = [
  { id: "fast", name: "빠르", items: MOODS },
  { id: "bom", name: "봄", items: MOODS },
  { id: "eyes", name: "뜸", items: [...MOODS, { id: "rise", label: "해뜸" }] },   // 해뜸 = 뜸 얼굴 해가 떠오르다 뽕 하고 밥알(형 11-12 12:39 「해가 뜨다가 갑자기 뜸이 뜨는것도 해줘」)
  // 형 11-12 17:28 「뜸 다른애들것두 만들어줄수잇엉? ㅋㅋ 빠르, 번개 시아, 깃. 챙」 · 17:29 「아 내껏도..」 · 17:35 「선글라스쓴 모습도 멋지게」 · 카리나 16:51 「수첩 위로 눈만 빼꼼 내밀었다가 살짝 웃으면 좋겠다」
  { id: "lightning", name: "번개", items: MOODS },
  { id: "sia", name: "시아", items: MOODS },
  { id: "git", name: "깃", items: MOODS },
  { id: "chaeng", name: "챙", items: MOODS },
  { id: "karina", name: "카리나", items: [...MOODS, { id: "peek", label: "빼꼼" }] },
  { id: "hyung", name: "형", items: [...MOODS, { id: "cool", label: "선글라스" }] },
  { id: "morning", name: "나팔꽃", items: [...MOODS, { id: "toot", label: "나팔" }] },   // 형 꽃(정원 한쪽 네온그린 · 둥근 안경 · 형 11-12 18:34 「나팔꽃해줄줄알앗더니」 · 18:35 「그럼 너무좋지,,」)
  { id: "on", name: "온", items: MOODS },
  { id: "yeoul", name: "여울", items: [{ id: "smile", label: "웃음" }, { id: "wink", label: "윙크" }, { id: "pout", label: "볼빵빵" }, { id: "surprise", label: "놀람" }] },   // 여울이 만든 제 얼굴 표정 넷(여울 11-12 18:41 · 18:46 「😊 판에 「여울」 탭으로도 넣어줘」)   // 형 11-12 18:39 「뜸아 온 이도 하나 만들어줘 고마웡~~ㅋ」
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

/** 순수 — 보내는 중 임시 움짤에 진짜 글(같은 글 · 사람 · 1분 안)이 들어오면 임시를 뺌(형 11-12 13:46 「근데 이거 전송하는 과정에서 2개로 순간적으로 보인다 ㅠㅠ」 · 서버 받기 고리가 POST 답보다 먼저 진짜 글을 붙임) */
export function dropStickerTwins<T extends { id: string; ts: number; text?: unknown; kind?: unknown }>(ms: T[]): T[] {
  if (!ms.some((m) => String(m.id).startsWith(STK_TMP))) return ms;
  const real = ms.filter((m) => !String(m.id).startsWith(STK_TMP) && m.kind === "human");
  return ms.filter((m) => !String(m.id).startsWith(STK_TMP) || !real.some((r) => r.text === m.text && Math.abs(r.ts - m.ts) < 60_000));
}

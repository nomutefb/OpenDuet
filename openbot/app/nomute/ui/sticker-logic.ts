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
  { id: "karina", name: "카리나", items: [{ id: "peek", label: "빼꼼" }, { id: "joy", label: "좋아" }, { id: "thanks", label: "고마워" }] },   // 지피티 = 셋(형 11-13 08:06 「지피티도 3개면 돼. 자주 쓰지 않게 설계가 되어잇어서」)
  { id: "hyung", name: "형", items: [...MOODS, { id: "cool", label: "선글라스" }] },
  { id: "morning", name: "나팔꽃", items: [{ id: "ibul", label: "이불" }] },   // 형 꽃 = 이불 하나(형 11-13 08:03 「미안한데 나팔꽃은 6개 말구 요거 하나만. ㅋㅋ」 · 「나한테는 밝아서 잘 안보여」 · 앞 판 여섯 = 그림만 남김)
  { id: "teum", name: "틈", items: [{ id: "peek", label: "빼꼼" }, { id: "joy", label: "좋아" }, { id: "thanks", label: "고마워" }] },   // 틈 = 바위 틈 돌멩이 · 빼꼼 = 틈 속에서 빼꼼 → 웃음
  { id: "chok", name: "촉", items: [{ id: "news", label: "속보" }, { id: "joy", label: "좋아" }, { id: "surprise", label: "놀람" }, { id: "think", label: "생각중" }] },   // 속보 = 기자 분장(트렌치코트 · 마이크) — 형 11-13 09:33 「틈, 촉도 귀염뽀짝하게, 3개정도 gif 만들어줘」 · 「속보를 전달하는 컨셉으로 1개 정도 추가(분장해서)」(속보 = 특파원 촉 · 짐작) · 08:03 「그록봇 애들은 gif 없어도 돼」 뒤 형이 다시 부른 것
  // 그록봇(온) 묶음 뺌(형 11-13 08:03 「글구 그록봇 애들은 gif 없어도 돼. 이게 맥락이 달라서 이해를 하기가 어렵다라고 어제 테스트해보니까 걍 빼줭」)
  // 여울 묶음 뺌(형 11-13 06:55 「뜸 여울 관련된 gif는 안뜨게 없애줘」 · 그림 파일은 editor viewer/office/sticker/yeoul 에 남김)
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

/** 자주 쓰는 움짤(형 11-13 08:07 「그리구 자주쓰는 gif는 앞에 오기해줘 첨에 한 10개정도?」) = 이 기기에서 보낸 횟수 · 「전체」 맨 앞 줄 10개 */
export const FREQ_KEY = "nm_stk_freq", FREQ_N = 10;
export function freqTop(counts: Record<string, number>, packs: Pack[] = PACKS, n = FREQ_N): { pack: Pack; item: Item }[] {
  const all = packs.flatMap((p) => p.items.map((it) => ({ pack: p, item: it, c: counts[`${p.id}/${it.id}`] || 0 })));
  return all.filter((x) => x.c > 0).sort((a, b) => b.c - a.c).slice(0, n).map(({ pack, item }) => ({ pack, item }));
}

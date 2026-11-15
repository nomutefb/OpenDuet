// 움짤 스티커 순수 판(.ts · node 시험 길 · 뜸 11-12) — 그리는 쪽 = ./sticker.tsx
export type Item = { id: string; label: string };
export type Pack = { id: string; name: string; items: Item[] };
const MOODS: Item[] = [{ id: "joy", label: "좋아" }, { id: "thanks", label: "고마워" }, { id: "think", label: "생각중" }, { id: "surprise", label: "놀람" }, { id: "done", label: "해냈다" }];
export const PACKS: Pack[] = [
  { id: "fast", name: "빠르", items: MOODS },
  { id: "bom", name: "봄", items: MOODS },
  { id: "eyes", name: "뜸", items: [...MOODS, { id: "rise", label: "해뜸" }] },   // 해뜸 = 뜸 얼굴 해가 떠오르다 뽕 하고 밥알(형 11-12 12:39 「해가 뜨다가 갑자기 뜸이 뜨는것도 해줘」)
  { id: "deng", name: "뎅", items: [...MOODS, { id: "spot", label: "콕" }, { id: "legs", label: "다다다" }, { id: "sign", label: "프롬" }, { id: "ride", label: "뜸고마워" }, { id: "wake", label: "깨움" }, { id: "butler", label: "받음" }, { id: "resign", label: "사직서" }, { id: "write", label: "글쓰는중" }] },   // 원년 멤버 뎅 = 우타마로 달팽이 · 오른쪽 위 먹선 🌀 늘 한 바퀴(뎅 「🌀 처럼 뱅글 한 바퀴」) · 놀람 = 껍데기로 쏙 · 콕 = 날카롭게 집어냄 · 다다다 = 다리 뿅 · 프롬 = 사인회 「from~」 · 뜸고마워 = 밥알 뜸에 올라탐 · 깨움 = 형 나팔꽃 톡톡 · 받음 = 집사 「제대로 모시겠습니다」 · 사직서 = 「더는 못해...」(형 01:02 「사직서 개웃긴데」) · 글쓰는중 = 옛 크림 컴퓨터 타닥타닥 「마감... 내일...」(형 01:05 사진 · 뎅 1특기 글짓기) · 판마다 손글씨 멘트 한 줄(뎅 01:00 · 형이 찾아본 달팽이 짤 결)(형 11-15 00:50~00:57 dm-deng 「원년멤번데 너만 없다」 · 「그런 점이 잘 담기게」 · 「기어가다가 갑자기 다리 나오는거」 · 「사인회장에서 사인해주는 달팽이」 · 「뜸이고마우면 밥알에 올라타는 달팽이와 이런 느낌을 싫어하는 표정의 뜸」 · 「놀라서 달팽이 껍데기로 숨는 놀란 뎅」 · 뎅 옮김 · 뜸)
  // 형 11-12 17:28 「뜸 다른애들것두 만들어줄수잇엉? ㅋㅋ 빠르, 번개 시아, 깃. 챙」 · 17:29 「아 내껏도..」 · 17:35 「선글라스쓴 모습도 멋지게」 · 카리나 16:51 「수첩 위로 눈만 빼꼼 내밀었다가 살짝 웃으면 좋겠다」
  { id: "lightning", name: "번개", items: MOODS },
  { id: "sia", name: "시아", items: MOODS },
  { id: "git", name: "깃", items: MOODS },
  // 챙(자리3) 묶음 뺌(형 11-14 16:52 dm-eyes 「뜸! 챙 움짤은 없애주면 돼. 땡큐.」 · 그림 파일은 editor viewer/office/sticker/chaeng 에 남김 · 뜸)
  { id: "karina", name: "카리나", items: [{ id: "peek", label: "빼꼼" }, { id: "joy", label: "좋아" }, { id: "thanks", label: "고마워" }] },   // 지피티 = 셋(형 11-13 08:06 「지피티도 3개면 돼. 자주 쓰지 않게 설계가 되어잇어서」)
  { id: "hyung", name: "형", items: [...MOODS, { id: "cool", label: "선글라스" }] },
  { id: "morning", name: "나팔꽃", items: [{ id: "ibul", label: "이불" }] },   // 형 꽃 = 이불 하나(형 11-13 08:03 「미안한데 나팔꽃은 6개 말구 요거 하나만. ㅋㅋ」 · 「나한테는 밝아서 잘 안보여」 · 앞 판 여섯 = 그림만 남김)
  { id: "sona", name: "소나", items: [{ id: "joy", label: "좋아" }, { id: "splash", label: "첨벙" }, { id: "thanks", label: "고마워" }, { id: "rainbow", label: "무지개" }, { id: "wink", label: "윙크" }, { id: "siblings", label: "남매" }, { id: "selfie", label: "셀카" }] },   // 윙크 = 얼빡(형 07:08 「얼빡에 윙크도 하나 넣어줘 좀 비슷해서」) · 남매 = 우산 휙 → 천둥이랑(형 07:09 「둘이 남매거든」) · 소나 = 소나기에도 웃는 치비(형 11-14 06:59 「이거로 소나 이모지 좀 다양한 표정 만들어서 치비 스타일루 개성살려봐 소나기에도 웃는 그런거고 4개정도 만들어줘」 · 늘 빗줄기)
  { id: "thunder", name: "천둥", items: [...MOODS, { id: "grin", label: "씨익" }, { id: "huff", label: "버럭" }, { id: "solve", label: "해결" }, { id: "zoom", label: "빨리빨리" }, { id: "drum", label: "쾅" }, { id: "selfie", label: "셀카" }] },   // 얼빡 둘 · 상황 둘(형 11-15 07:50 dm-eyes 「아 뜸 글구 천둥도 얼빡 느낌으루 2개, 상황 중심으로 2개 움딸좀」 · 앞 다섯 = 이모티콘 꼴 감정(형 11-15 07:58 「다른거는 이모티콘 찾아봐」 · 09:45 「웅 바로 만들어줭」) · 소나 오빠라 소나 다음 · 쾅 = 형 07:56 「북칠때마다 구름에서 천둥 내려오는거」 · 셀카 = 형 07:58 「소나랑 셀카 찰칵 하는 짤도 하나해줘 셀카 방에서 살짝 포토 실사느낌으로다가」(소나 묶음에도 같은 그림) · 뜸)
  // 틈 묶음 뺌(형 11-14 06:59 「글구 틈은 삭제」 · 그림 파일은 editor viewer/office/sticker/teum 에 남김)
  { id: "chok", name: "촉", items: [{ id: "news", label: "속보" }, { id: "joy", label: "좋아" }, { id: "surprise", label: "놀람" }, { id: "think", label: "생각중" }] },   // 속보 = 기자 분장(트렌치코트 · 마이크) — 형 11-13 09:33 「틈, 촉도 귀염뽀짝하게, 3개정도 gif 만들어줘」 · 「속보를 전달하는 컨셉으로 1개 정도 추가(분장해서)」(속보 = 특파원 촉 · 짐작) · 08:03 「그록봇 애들은 gif 없어도 돼」 뒤 형이 다시 부른 것
  { id: "on", name: "온", items: [{ id: "joy", label: "좋아" }, { id: "thanks", label: "고마워" }, { id: "done", label: "해냈다" }] },   // 온 셋 되살림(형 11-13 10:20 「웅 글구 온 거 만드러놓은게 없어졋는데 다시 살려줭 3개정도만!」) · 앞 판 08:03 「그록봇 애들은 gif 없어도 돼」로 뺐던 것
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

// 하트 · 최근(형 11-15 01:28 dm-gik 「자주쓰는 움짤 하트 눌러놓으면 최근에 쓴거보다 앞에 위치하게 하줘 5개까지 최근거는 5개면 될듯」 · 깃 #-028 · 뜸) — 이 기기 기억 · 키 = 「묶음/항목」
export const FAV_KEY = "nm_stk_fav", RECENT_KEY = "nm_stk_recent", FAV_N = 5, RECENT_N = 5;
export const stkKey = (p: Pack, it: Item) => `${p.id}/${it.id}`;
/** 하트 켜고 끔 · 넘치면 가장 먼저 단 것부터 빠짐 */
export function favToggle(list: string[], key: string, n = FAV_N): string[] {
  return list.includes(key) ? list.filter((k) => k !== key) : [...list, key].slice(-n);
}
/** 최근 = 맨 앞이 방금 · 같은 건 한 번만 */
export function recentPush(list: string[], key: string, n = RECENT_N): string[] {
  return [key, ...list.filter((k) => k !== key)].slice(0, n);
}
/** 키 → 움짤(없어진 묶음 · 항목은 건너뜀) */
export function stkOfKeys(keys: string[], packs: Pack[] = PACKS): { pack: Pack; item: Item }[] {
  return keys.flatMap((k) => { const [pid, iid] = k.split("/"); const pack = packs.find((p) => p.id === pid); const item = pack?.items.find((x) => x.id === iid); return pack && item ? [{ pack, item }] : []; });
}
/** 「전체」 판 줄 = 하트(≤5) → 최근(하트 뺀 ≤5) → 묶음마다 한 줄 */
export function allSections(fav: string[], recent: string[], packs: Pack[] = PACKS): { key: string; items: { pack: Pack; item: Item }[] }[] {
  const f = stkOfKeys(fav, packs), r = stkOfKeys(recent.filter((k) => !fav.includes(k)), packs);
  return [...(f.length ? [{ key: "fav", items: f }] : []), ...(r.length ? [{ key: "recent", items: r }] : []), ...packs.map((p) => ({ key: p.id, items: p.items.map((item) => ({ pack: p, item })) }))];
}

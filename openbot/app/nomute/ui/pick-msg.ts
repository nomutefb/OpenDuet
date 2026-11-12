/** 러너가 옮긴 픽 · 경보(틈 픽 · 촉 픽 · 촉 「곧 터질」) = 알약 대신 말풍선 + 링크 카드(대표 사진 · 제목 · 요약 = 기사 og · 형 11-11 08:43 「아예 요약본 하고 링크. 대표 사진 같이 줄순없나?」 · 「촉도 마찬가지로」 · 08:44 「섬넬 만들어달란건 아니고」 · 깃) */
export const pickM = (m: { kind?: string; who?: string; text?: string }) => m.kind === "system" && /러너/.test(m.who || "") && /https?:\/\//.test(m.text || "") && /^(틈 픽|촉 픽|🔴 곧 터질)/.test((m.text || "").trim());
/** 「일 판」 기계가 방마다 쓰는 일 습작 = 알약(머리 한 줄) 대신 말풍선(몸 = 일 줄 · 열린 것이 폰에서 읽히게 · 길면 「전체 보기」 · 형 11-11 13:25 「일 관련 습작 각 방 마다 들가게하면 되겠네」 · 번개) */
export const noteM = (m: { kind?: string; who?: string; text?: string }) => m.kind === "system" && m.who === "일 판" && /^일 습작/.test((m.text || "").trim());
/** 러너가 촉 1:1 에 옮긴 요약 묶음(첫 줄 `[묶음 <stem>]` · 깃 11-12 19:34) = 알약 대신 묶음 카드(./bundle-card.tsx · 「올림 · 넘김」 · 봄 19:22) */
export const bundleM = (m: { kind?: string; who?: string; text?: string }) => m.kind === "system" && /러너/.test(m.who || "") && /^\[묶음\s+[^\]\s]+\]/.test((m.text || "").trim());
/** 알약이 아니라 말풍선으로 그리는 기계 글 */
export const bubbleM = (m: { kind?: string; who?: string; text?: string }) => pickM(m) || noteM(m) || bundleM(m);

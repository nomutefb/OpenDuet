/** 러너가 옮긴 픽 · 경보(틈 픽 · 촉 픽 · 촉 「곧 터질」) = 알약 대신 말풍선 + 링크 카드(대표 사진 · 제목 · 요약 = 기사 og · 형 11-11 08:43 「아예 요약본 하고 링크. 대표 사진 같이 줄순없나?」 · 「촉도 마찬가지로」 · 08:44 「섬넬 만들어달란건 아니고」 · 깃) */
export const pickM = (m: { kind?: string; who?: string; text?: string }) => m.kind === "system" && /러너/.test(m.who || "") && /https?:\/\//.test(m.text || "") && /^(틈 픽|촉 픽|🔴 곧 터질)/.test((m.text || "").trim());

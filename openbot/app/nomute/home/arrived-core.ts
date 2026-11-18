// 「도착한 메시지」 = 애들이 보낸 것만(형 11-19 07:2x · 깃 → 빠르가 옮김 「그리고 메인 화면에, 내가 쓴 원문이 글로 보인다 (메인 피드에) 애들이 보낸것만 보여야되는데 확인해줘」)
//   형 글 = 앱에서 쓴 글(kind human) + 형이 바깥(그록봇 앱 · 클로드 창)에서 쳐서 방에 거울로 실린 글(who 「형(앱에서 씀)」 · 「형(창에서 씀)」 · kind system = ui/office-chat.tsx hyungApp 과 같은 가름)
//   방의 마지막 글이 형 글이면 그 방은 도착 칸에 안 뜸(서버 unread 가 남아 있어도 · 형이 마지막으로 말한 방 = 형이 본 방 · 미리보기에 형 원문이 뜨던 자리)
export type LastMsg = { who?: string; kind?: string } | null | undefined;
export const byHyung = (l: LastMsg): boolean => !!l && (l.kind === "human" || /^형(\(|$)/.test(String(l.who || "")) || l.who === "세웅");

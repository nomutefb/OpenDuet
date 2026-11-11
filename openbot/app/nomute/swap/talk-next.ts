// 「대화」 누름 한 곳 — tab-bar.tsx 가 폰 아래 막대 · PC 왼쪽 띠 둘 다 이것만 부름(순수 · 시험 tests/talk-next.test.ts)
/** 「대화」 누름 한 곳(폰 아래 막대 · PC 왼쪽 띠 둘 다 이것만 · 형 11-11 22:11 「2개 만들면 수정할때마다 두번수정해야되니까」)
 *  대화창에서 다시 누름 = 대화방 목록(형 11-12 07:54 「하단 대화 두번 누르먄 대화방 리스트 ( 메뉴2번) 으루 가게」) · 목록에서 = 마지막 대화창 · 꺼져 있으면 = offTo(폰 = 마지막 대화창 · PC = 목록) */
export const talkNext = (pane: string | null, modal: string | null, chatTo: string, offTo: string) => (modal ? offTo : pane === "chat" ? "/rooms" : pane === "rooms" ? chatTo : offTo);


// 이미지 편집 최소화 — 접어 둔 채 살려 두기(형 11-15 「이미지 생성기 만들다가 최소화가 가능하면 좋겠음 … 역삼각형으로 잠시 들어갓엇는데」)
//   kept = 접어 둠(「최소화」 누름) · 살아 있음 = 지금 열려 있거나 접어 둠 · ▽ 단추 = 접어 뒀고 지금 안 열려 있을 때만
//   ‹ 닫기 · Esc = 진짜 닫기(전과 같음 · 쓰던 것 비움) · 다시 열리면 kept 는 꺼짐(그 뒤 그냥 나가면 전처럼 닫힘)
export type EdEvent = "min" | "close" | "open";
export const edKeptNext = (kept: boolean, ev: EdEvent): boolean => (ev === "min" ? true : ev === "close" || ev === "open" ? false : kept);
export const edAlive = (modal: string | null, kept: boolean): boolean => modal === "edtool" || kept;
export const edChip = (modal: string | null, kept: boolean): boolean => kept && modal !== "edtool";

// 이미지 편집 · 영상 편집 = 접을 수 있는 창(형 11-15 「이미지 편집 비디오 편집 예전 에디터 처럼 최소화 가능한 창으로」 · 앞 판 = 이미지 편집만)
//   kept = 접어 둔 창들(접은 차례) · 살아 있음 = 지금 열려 있거나 접어 둠 · 복원 ▲ = 접어 뒀고 지금 안 열린 것들
//   × 닫기 · Esc = 진짜 닫기(쓰던 것 비움) · 다시 열리면 kept 에서 빠짐(그 뒤 그냥 나가면 닫힘) — 옛 에디터 MIN_REG(41-toolRfVis.part)와 같은 셈
export const ED_TOOLS = ["edtool", "edvid", "eddoc"] as const;   // eddoc = 문서 편집(형 11-17 「이거를 에디터 한쪽에 문서 편집기로해서」 · ../hwp/doc-editor.tsx) — 접어 둬도 쓰던 문서가 삶
export type EdTool = (typeof ED_TOOLS)[number];
export type EdEvent = "min" | "close" | "open";
export const ED_LABEL: Record<EdTool, string> = { edtool: "이미지 편집", edvid: "영상 편집", eddoc: "문서 편집" };
export const isEdTool = (m: string | null | undefined): m is EdTool => m === "edtool" || m === "edvid" || m === "eddoc";
export const edKeptNext = (kept: readonly EdTool[], tool: EdTool, ev: EdEvent): EdTool[] => {
  const rest = kept.filter((t) => t !== tool);
  return ev === "min" ? [...rest, tool] : rest;
};
export const edAlive = (modal: string | null, kept: readonly EdTool[], tool: EdTool): boolean => modal === tool || kept.includes(tool);
/** 복원 ▲ 가 가리키는 창들(1 = 누르면 바로 펼침 · 2 = 고르는 판) */
export const edChip = (modal: string | null, kept: readonly EdTool[]): EdTool[] => kept.filter((t) => t !== modal);

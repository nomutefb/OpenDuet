// 글 메뉴(말풍선 길게 누름 · 우클릭)의 셈(순수 · 시험 tests/msg-menu.test.ts) — 화면 = ./msg-menu.tsx
//   형 11-17 08:3x 구름 맥 창(영상 = 누른 말풍선 바로 위에 글 줄이 차례로 뜨고 나머지는 흐려짐 · 가운데 판 없음)
//   「요것두~~~ 모달 안뜨고 간단하게 하는 식으루 / 답장은 스와이프로 가능하고 / 피시에서는 안되구나 / 삭제는 필요없고 복사 / 수정은 필요없고 다른 방으로 있어야 하고 / 공지 / 확인 요청 / 이모지는 이미 말풍선 잇어서 다른 애들거엔 이제 없어도 될수도잇음 / 공유」
export type MenuKey = "save" | "reply" | "copy" | "move" | "pin" | "ask" | "share" | "shot";
export const MENU_KO: Record<MenuKey, string> = { save: "사진 저장", reply: "답장", copy: "복사", move: "다른 방으로", pin: "공지", ask: "확인 요청", share: "공유", shot: "캡처" };

/** 줄 차례 — 형이 부른 차례(복사 · 다른 방으로 · 공지 · 확인 요청 · 공유) · 사진 글은 맨 위 「사진 저장」 · 답장은 밀기가 안 되는 화면(마우스)에서만 · 삭제 · 수정은 없음.
 *  pics = 그 글의 사진 수 · fine = 마우스 화면(밀어서 답장이 안 됨) · canPin = 공지를 올릴 수 있는 문 · rooms = 넘길 수 있는 다른 방 수 */
export function menuItems(o: { pics: number; fine: boolean; canPin: boolean; rooms: number }): MenuKey[] {
  return [o.pics > 0 ? "save" : null, o.fine ? "reply" : null, "copy", o.rooms > 0 ? "move" : null, o.canPin ? "pin" : null, "ask", "share", "shot"].filter((k): k is MenuKey => !!k);
}
export const saveKo = (pics: number): string => (pics > 1 ? `사진 저장 ${pics}장` : "사진 저장");

export type Box = { top: number; bottom: number; left: number; right: number };
export type Place = { side: "above" | "below"; align: "left" | "right"; x: number; y: number; maxH: number; over: boolean };
export const ROW_H = 44, GAP = 10, EDGE = 12;
/** 줄 묶음 자리 — 말풍선 위가 먼저(영상) · 자리가 모자라면 아래 · 둘 다 모자라면(화면만큼 긴 글) 말풍선 위에 겹쳐 놓음(over = 구멍 없이 다 흐리게 · 줄이 다 보이게).
 *  mine = 내 글(오른쪽 맞춤 · 말풍선 오른쪽 끝) · 남의 글 = 왼쪽 맞춤(말풍선 왼쪽 끝) · top · bottom = 위 머리 줄 · 아래 입력 줄이 가리는 높이
 *  x = align 쪽 화면 끝에서의 거리 · y = side 가 above 면 화면 아래 끝에서(묶음의 아래 변) · below 면 화면 위 끝에서(묶음의 위 변) */
export function placeMenu(b: Box, vw: number, vh: number, rows: number, mine: boolean, top = 64, bottom = 96): Place {
  const need = rows * ROW_H, above = Math.max(0, Math.min(b.top, vh - bottom) - top - GAP), below = Math.max(0, vh - bottom - Math.max(b.bottom, top) - GAP);
  const x0 = mine ? Math.max(EDGE, vw - b.right) : Math.max(EDGE, b.left), x = Math.min(x0, Math.max(EDGE, vw - 200)), align = mine ? "right" as const : "left" as const;
  if (above >= need) return { side: "above", align, x, y: vh - Math.min(b.top, vh - bottom) + GAP, maxH: need, over: false };
  if (below >= need) return { side: "below", align, x, y: Math.max(b.bottom, top) + GAP, maxH: need, over: false };
  const room = vh - top - bottom, maxH = Math.max(ROW_H * 2, Math.min(need, room));   // 겹쳐 놓기: 누른 자리(말풍선 위쪽) 가까이 · 화면 안에 다 들어오게
  const y = Math.max(top, Math.min(Math.max(b.top, top) + GAP, vh - bottom - maxH));
  return { side: "below", align, x, y, maxH, over: true };
}
/** 말풍선의 보이는 부분 — 굴리는 칸(frame) 밖으로 나간 데는 잘라 냄(위 머리 띠 밑으로 들어간 긴 글의 구멍이 머리 띠를 드러내지 않게). 보이는 높이가 거의 없으면 null. */
export function clipBox(b: Box, frame: Box | null): Box | null {
  if (!frame) return b;
  const c = { top: Math.max(b.top, frame.top), bottom: Math.min(b.bottom, frame.bottom), left: Math.max(b.left, frame.left), right: Math.min(b.right, frame.right) };
  return c.bottom - c.top >= 20 && c.right - c.left >= 20 ? c : null;
}
/** 흐림 막의 구멍(누른 말풍선만 또렷) — 둥근 네모 한 장을 그 자리에 놓고 빼는 가림(mask) 글. r = 모서리 둥글기. */
export function holeMask(b: Box, r: number): { image: string; position: string; size: string } {
  const w = Math.max(1, Math.round(b.right - b.left)), h = Math.max(1, Math.round(b.bottom - b.top)), rr = Math.max(0, Math.min(r, w / 2, h / 2));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='${w}' height='${h}' rx='${rr}'/></svg>`;
  return { image: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, position: `${Math.round(b.left)}px ${Math.round(b.top)}px`, size: `${w}px ${h}px` };
}

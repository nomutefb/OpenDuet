// 글 메뉴(말풍선 길게 누름 · 우클릭)의 셈(순수 · 시험 tests/msg-menu.test.ts) — 화면 = ./msg-menu.tsx
//   형 11-17 08:3x 구름 맥 창(영상 = 누른 말풍선 바로 위에 글 줄이 차례로 뜨고 나머지는 흐려짐 · 가운데 판 없음)
//   「요것두~~~ 모달 안뜨고 간단하게 하는 식으루 / 답장은 스와이프로 가능하고 / 피시에서는 안되구나 / 삭제는 필요없고 복사 / 수정은 필요없고 다른 방으로 있어야 하고 / 공지 / 확인 요청 / 이모지는 이미 말풍선 잇어서 다른 애들거엔 이제 없어도 될수도잇음 / 공유」
import { type RestRoom, isGroup } from "./room-rest-order";   // 단톡 = 1:1 상대 없는 방(방 목록 차례와 같은 판정)
export type MenuKey = "save" | "reply" | "copy" | "move" | "pin" | "ask" | "share" | "shot" | "del";
export const MENU_KO: Record<MenuKey, string> = { save: "사진 저장", reply: "답장", copy: "복사", move: "다른 방으로", pin: "공지", ask: "확인 요청", share: "공유", shot: "캡처", del: "지우기" };

/** 줄 차례 — 형이 부른 차례(복사 · 다른 방으로 · 공지 · 확인 요청 · 공유) · 사진 글은 맨 위 「사진 저장」 · 답장은 밀기가 안 되는 화면(마우스)에서만 · 수정은 없음
 *  · 맨 끝 「지우기」 = 형 화면만(canDel · 서버도 형 · 봄만 받음) · 묻기 없이 아예 지움(형 11-17 18:21 dm-gik 「그냥 지우기 누르면 아예 바로 채팅 지워지기로, 다시 물음 할 필요는없어.」 · 앞 11-17 08:3x 「삭제는 필요없고」를 갈음 — 형 비번 한 줄이 올라간 뒤)
 *  pics = 그 글의 사진 수 · fine = 마우스 화면(밀어서 답장이 안 됨) · canPin = 공지를 올릴 수 있는 문 · rooms = 넘길 수 있는 다른 방 수 · canDel = 지울 수 있는 문(형) */
export function menuItems(o: { pics: number; fine: boolean; canPin: boolean; rooms: number; canDel?: boolean }): MenuKey[] {
  return [o.pics > 0 ? "save" : null, o.fine ? "reply" : null, "copy", o.rooms > 0 ? "move" : null, o.canPin ? "pin" : null, "ask", "share", "shot", o.canDel ? "del" : null].filter((k): k is MenuKey => !!k);
}
/** 순수 — 글 하나를 아예 뺀 판(이 탭 · 이 기기 저장 둘 다 이걸로) · 없는 id = 같은 판 */
export function dropMsg<P extends { messages: { id: string }[] }>(p: P | undefined, id: string): P | undefined {
  if (!p || !p.messages.some((x) => x.id === id)) return p;
  return { ...p, messages: p.messages.filter((x) => x.id !== id) };
}
/** 순수 — 최근 통째로 받은 칸(받은 글의 첫 ~ 끝 시각 · 방 전체면 처음부터)은 서버가 정본 → 그 칸 안에 있는데 받은 글엔 없는 id(다른 기기 · 다른 탭에서 지운 글) = 뺄 것
 *  받은 글이 비었으면 칸을 모르니 0(빈 답 하나로 다 지우지 않게) · 칸 밖(그 뒤 기다리기로 붙은 새 글 · 앞날 글)은 그대로 */
export function goneInWindow(old: { id: string; ts: number }[], got: { id: string; ts: number }[], whole: boolean): string[] {
  if (!got.length) return [];
  let lo = Infinity, hi = -Infinity; const ids = new Set<string>();
  for (const g of got) { ids.add(g.id); if (g.ts < lo) lo = g.ts; if (g.ts > hi) hi = g.ts; }
  if (whole) lo = -Infinity;
  return old.filter((x) => x.ts >= lo && x.ts <= hi && !ids.has(x.id)).map((x) => x.id);
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

/** 「보낼 방」 묶음(형 11-21 08:24 dm-sia 시아 옮김 「…분류를 PM·CR·SC DevOps UXD Fixer·Sec Teller 이렇게 구분선주고 시작점에 구분워딩 좀. 행 구분선은 연하게」 · 08:26 「!시아 ✓ ② DevOps 에 같이」 · 08:27 「아니 구분자 데브옵스 옃에」 「알앤디 널어달란ㅁ듯 미안」)
 *  = 맨 위 머리 없음(형 · 직무 모름 1:1) → PM·CR·SC → DevOps·R&D → UXD → Fixer·Sec → Teller → 단톡(회의실 · 밥상 · 임시방 = 1:1 상대 없는 방 · ./room-rest-order.ts isGroup) · 묶음 안 = 들어온 차례 그대로 · 순수
 *  단톡 맨 아래 따로 = 형 11-21 08:44 dm-sia 시아 옮김 「글구 단톡은 맨 아래로 따로」 */
export const MOVE_HEADS = ["PM·CR·SC", "DevOps·R&D", "UXD", "Fixer·Sec", "Teller"] as const;
const HEAD_OF: Record<string, (typeof MOVE_HEADS)[number]> = { PM: "PM·CR·SC", CREATOR: "PM·CR·SC", SCOOP: "PM·CR·SC", DEV: "DevOps·R&D", OPS: "DevOps·R&D", RND: "DevOps·R&D", MD: "DevOps·R&D", UXD: "UXD", FIXER: "Fixer·Sec", SEC: "Fixer·Sec", SECRETARY: "Fixer·Sec", TELLER: "Teller", STORY: "Teller", MUSIC: "Teller" };
export const GROUP_HEAD = "단톡";
export function moveGroups<T extends RestRoom>(rooms: T[], roleOf: (who: string) => string | undefined): { head: string; items: T[] }[] {
  const top: T[] = [], group: T[] = [], by = new Map<string, T[]>(MOVE_HEADS.map((h) => [h, []]));
  for (const r of rooms) { if (isGroup(r)) { group.push(r); continue; } const h = r.with ? HEAD_OF[roleOf(r.with) || ""] : undefined; (h ? by.get(h)! : top).push(r); }
  return [{ head: "", items: top }, ...MOVE_HEADS.map((h) => ({ head: h as string, items: by.get(h)! })), { head: GROUP_HEAD, items: group }].filter((g) => g.items.length);
}

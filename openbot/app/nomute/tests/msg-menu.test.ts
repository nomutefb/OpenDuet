// 글 메뉴 셈(ui/msg-menu-logic.ts) + 끼운 자리 — 형 11-17 「모달 안뜨고 간단하게 하는 식으루 …」
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MENU_KO, ROW_H, clipBox, dropMsg, goneInWindow, holeMask, menuItems, placeMenu, saveKo } from "../ui/msg-menu-logic";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("줄 차례 = 복사 · 다른 방으로 · 공지 · 확인 요청 · 공유 · 캡처 / 답장은 마우스 화면만 / 사진 글은 사진 저장 먼저 / 삭제 · 수정 없음", () => {
  assert.deepEqual(menuItems({ pics: 0, fine: false, canPin: true, rooms: 5 }).map((k) => MENU_KO[k]), ["복사", "다른 방으로", "공지", "확인 요청", "공유", "캡처"]);
  assert.deepEqual(menuItems({ pics: 2, fine: true, canPin: true, rooms: 5 }).map((k) => MENU_KO[k]), ["사진 저장", "답장", "복사", "다른 방으로", "공지", "확인 요청", "공유", "캡처"]);
  assert.deepEqual(menuItems({ pics: 0, fine: false, canPin: false, rooms: 0 }), ["copy", "ask", "share", "shot"]);   // 공지 못 올리는 문 · 넘길 방 없음
  assert.ok(!Object.values(MENU_KO).some((t) => /삭제|수정/.test(t)));
  assert.equal(saveKo(1), "사진 저장"); assert.equal(saveKo(3), "사진 저장 3장");
});
test("자리 = 말풍선 위가 먼저 · 모자라면 아래 · 내 글은 오른쪽 맞춤 · 남의 글은 왼쪽 맞춤", () => {
  const vw = 412, vh = 892;
  const a = placeMenu({ top: 600, bottom: 650, left: 200, right: 396 }, vw, vh, 6, true);
  assert.deepEqual([a.side, a.align, a.x, a.maxH], ["above", "right", 16, 6 * ROW_H]); assert.equal(a.y, vh - 600 + 10);   // 아래 변 = 말풍선 위 10px
  const b = placeMenu({ top: 90, bottom: 140, left: 56, right: 300 }, vw, vh, 6, false);
  assert.deepEqual([b.side, b.align, b.x, b.y], ["below", "left", 56, 150]);   // 위 자리(16px)가 모자람 → 아래
  const c = placeMenu({ top: 244, bottom: 707, left: 52, right: 338 }, vw, vh, 7, false);   // 위 · 아래 다 모자란 긴 글 = 말풍선 위에 겹쳐 놓고 줄은 다 보임
  assert.deepEqual([c.over, c.side, c.maxH, c.y], [true, "below", 7 * ROW_H, 254]);
  const d = placeMenu({ top: -300, bottom: 1500, left: 52, right: 338 }, vw, vh, 30, false);   // 줄이 화면보다 많으면 화면 안에서 굴림
  assert.ok(d.over && d.y === 64 && d.maxH === vh - 64 - 96);
  assert.equal(a.over, false); assert.equal(b.over, false);
});
test("구멍 = 그 말풍선 자리 · 둥글기는 반 높이를 안 넘김", () => {
  // 굴리는 칸 밖(위 머리 띠 밑)으로 들어간 데는 구멍에서 뺌 · 거의 안 보이면 구멍 없음
  assert.deepEqual(clipBox({ top: 181, bottom: 419, left: 116, right: 647 }, { top: 380, bottom: 820, left: 60, right: 700 }), { top: 380, bottom: 419, left: 116, right: 647 });
  assert.equal(clipBox({ top: 100, bottom: 390, left: 116, right: 647 }, { top: 380, bottom: 820, left: 60, right: 700 }), null);
  assert.deepEqual(clipBox({ top: 1, bottom: 2, left: 3, right: 4 }, null), { top: 1, bottom: 2, left: 3, right: 4 });
  const h = holeMask({ top: 100.4, bottom: 140.4, left: 20, right: 220 }, 99);
  assert.equal(h.position, "20px 100px"); assert.equal(h.size, "200px 40px"); assert.match(decodeURIComponent(h.image), /rx='20'/);
});
test("끼운 자리 = 가운데 판 · 되묻는 창 없음 · 누른 말풍선을 찾아 그 옆에 · 반응 줄은 내 글에만", () => {
  const ui = rd("../ui/msg-menu.tsx"), css = rd("../ui/msg-menu.css");
  assert.doesNotMatch(ui, /className="nm-msgm-p"|<p className="nm-msgm-ask"|role="alertdialog"|aria-modal/);
  assert.match(ui, /placeMenu\(/); assert.match(ui, /holeMask\(/); assert.match(ui, /\[data-id="\$\{CSS\.escape\(m\.id\)\}"\]/);
  assert.match(ui, /mine \? <div className="nm-mm-q"/);   // 남의 글엔 말풍선 모서리에 바로 다는 반응이 이미 있음
  assert.match(css, /backdrop-filter:blur\(/); assert.match(css, /mask-composite:exclude/); assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css.replace(/transition:opacity[^;]*;/g, ""), /transition:[^;]*(height|width|top|left|margin|filter)/);   // 움직이는 값 = 투명도 · 자리(transform)만
});

test("지우기 = 형 화면만 맨 끝 줄 · 묻기 없이(형 11-17 18:21 「그냥 지우기 누르면 아예 바로 채팅 지워지기로, 다시 물음 할 필요는없어.」)", () => {
  assert.deepEqual(menuItems({ pics: 0, fine: false, canPin: true, rooms: 2, canDel: true }).slice(-2), ["shot", "del"]);
  assert.equal(menuItems({ pics: 0, fine: false, canPin: false, rooms: 2 }).includes("del"), false);   // 형 아님 = 줄 없음
  assert.equal(MENU_KO.del, "지우기");
  const ui = readFileSync(new URL("../ui/msg-menu.tsx", import.meta.url), "utf8"), oc = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  assert.match(ui, /del: \(\) => \{ onUnsent\?\.\(m\.id\); onClose\(\); \}/);   // 되묻는 줄 · 창 0
  assert.match(oc, /qc\.setQueryData<Page>\(key, \(old\) => dropMsg\(old, id\)\);/);   // 말풍선 바로 빠짐(「삭제된 글」 자리 0)
  assert.match(oc, /if \(after\) void saveRoom\(room, after\);/);   // 이 기기 저장에서도 바로
  assert.match(oc, /office<[^>]*>\(`rooms\/\$\{enc\(room\)\}\/unsend`, \{ method: "POST", body: JSON\.stringify\(\{ id \}\) \}\)/);
});
test("지운 글 빼기 셈 — 한 글 빼기 · 최근 통째 받은 칸 안에서 서버에 없는 글(다른 기기에서 지움)만 뺌", () => {
  const p = { messages: [{ id: "a" }, { id: "b" }], more: false };
  assert.deepEqual(dropMsg(p, "a")?.messages, [{ id: "b" }]); assert.equal(dropMsg(p, "z"), p); assert.equal(dropMsg(undefined, "a"), undefined);
  const old = [{ id: "o1", ts: 100 }, { id: "o2", ts: 200 }, { id: "x", ts: 300 }, { id: "o3", ts: 400 }, { id: "new", ts: 900 }];
  const got = [{ id: "o2", ts: 200 }, { id: "o3", ts: 400 }];
  assert.deepEqual(goneInWindow(old, got, false), ["x"]);   // 칸 = 200 ~ 400 · 그 밖(100 · 900)은 그대로
  assert.deepEqual(goneInWindow(old, got, true), ["o1", "x"]);   // 방 전체를 받음 = 처음부터
  assert.deepEqual(goneInWindow(old, [], true), []);   // 빈 답 하나로 다 지우지 않음
});

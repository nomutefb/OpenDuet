// 예비 손님 불 = 쓰는 중일 때만 새싹 형광(형 11-20 13:07 dm-sia 시아 옮김 「예비 1,2,3 프로필 사진 누구아이디어야? 설마 활성화되면 불들어옴? 미쳤다」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("예비 얼굴 = 쓰는 중 그림 그대로 · 아니면 같은 그림 어둡게 · 카드 · 대화 얼굴 둘 다", () => {
  const faces = rd("../ui/faces.tsx"), card = rd("../ui/being-card.tsx"), css = rd("../ui/being-card.css");
  // 켜짐 잣대 = 방 목록(같은 캐시 열쇠 = 받아오기 0 더) guest 방 seen_ts · 10분 · 꺼질 때 한 번만 다시 그림(도는 시계 0)
  assert.match(faces, /queryKey: \["nomute", "rooms"\]/);
  assert.match(faces, /const SPARE_ON_MS = 600_000;/);
  assert.match(faces, /setTimeout\(\(\) => tick\(\(n\) => n \+ 1\), left \+ 50\)/);
  assert.doesNotMatch(faces, /setInterval/);
  // 대화 얼굴(FaceImg · 말풍선 구슬 · 부름 칩) = 예비만 SpareImg · 꺼짐 = filter 하나(그림 두 벌 0)
  assert.match(faces, /if \(src && isSpare\(p\?\.who\)\) return <SpareImg /);
  assert.match(faces, /filter: on === false \? SPARE_OFF : undefined/);
  // 카드 = .bc-off · 같은 값
  const off = faces.match(/export const SPARE_OFF = "([^"]+)"/)?.[1];
  assert.ok(off);
  assert.ok(css.includes(`.being-card.bc-off .profile-card__photo { filter: ${off}; }`));
  assert.match(card, /\$\{lit === false \? " bc-off" : ""\}/);
  for (const [id, seat] of [["spare01", "예비01"], ["spare02", "예비06"], ["spare03", "예비07"]]) assert.ok(card.includes(`{ id: "${id}", seat: "${seat}", tmpl: true,`), id);
});

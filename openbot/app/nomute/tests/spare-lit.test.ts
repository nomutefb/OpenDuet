// 예비 손님 불 = 형이 켠 예비만 새싹 형광(형 11-20 13:07 dm-sia 시아 옮김 「예비 1,2,3 프로필 사진 누구아이디어야? 설마 활성화되면 불들어옴? 미쳤다」 ·
//   13:23 「응 이꼴인데, 활성화되어있을때만 키면될듯. 그리고 혹시, 저거 활성화를 온오프가능하면 좋겠다. on 켜질때만 접속가능하게」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("예비 얼굴 = 켬 값이면 그림 그대로 · 아니면 같은 그림 어둡게 · 카드 · 대화 얼굴 둘 다", () => {
  const faces = rd("../ui/faces.tsx"), card = rd("../ui/being-card.tsx"), css = rd("../ui/being-card.css");
  // 켜짐 잣대 = 방 목록(같은 캐시 열쇠 = 받아오기 0 더) guest 방 on · 시계 0(앞 판 「쓰는 중 10분」 짐작 걷음)
  assert.match(faces, /queryKey: \["nomute", "rooms"\]/);
  assert.match(faces, /return r \? r\.on === true : undefined;/);
  assert.doesNotMatch(faces, /setInterval|SPARE_ON_MS|seen_ts/);
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

test("켜기 · 끄기 = 보안 서랍 예비 줄 맨 앞 스위치(형만) · 서버 seatvault/on · 얼굴 불도 같이", () => {
  const src = rd("../ui/settings-extra.tsx"), css = rd("../ui/yeta-settings.css");
  assert.match(src, /role="switch" aria-checked=\{s\.on\} aria-label=\{`\$\{nameOf\(s\.seat\)\} 켜기`\} className="nm-sw nm-mcp-on"/);
  assert.match(src, /office<\{ ok\?: boolean; on\?: boolean \}>\("seatvault\/on", \{ method: "POST", body: JSON\.stringify\(\{ seat, on \}\) \}\)/);
  assert.match(src, /void qc\.invalidateQueries\(\{ queryKey: \["nomute", "rooms"\] \}\)/);
  assert.match(src, /\{s\.on == null \? <span \/> :/, "서버 값 오기 전 = 빈 칸(격자 그대로)");
  assert.match(css, /\.nm-mcp-sp \{ display:grid; grid-template-columns:max-content max-content 7\.5rem /);
  // 폰 412 = 별 칸 3.75rem · 12px · 점은 잘라 냄 · 스위치 34×20 → 메모 80px(실측 · 스위치 넣고 54px 였음)
  assert.match(css, /\.yeta-set \.nm-mcp-sp \{ grid-template-columns:max-content max-content 3\.75rem minmax\(0,1fr\) max-content max-content; column-gap:4px; \}/);
  assert.match(css, /\.yeta-set \.nm-mcp-sp \.nm-mcp-sv \{ padding:0 6px; font-size:12px; text-overflow:clip; \}/);
  assert.match(css, /\.yeta-set \.nm-mcp-on \.si-sw \{ width:34px; height:20px; \}/);
});

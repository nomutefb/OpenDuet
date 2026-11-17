// 프로필 카드 안 글자만 Paperlogy(형 11-17 11:43 「이거 딱 프로필카드의 글자만 paperlogy로 가능한가?」) — 앱 전체 Pretendard(./font-all.css)가 카드까지 덮을 때만 · 굵기 둘
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("전체 Pretendard 일 때 프로필 창(.ypc) 안만 Paperlogy · 덮는 규칙보다 센 무게 · 굵기 = 이름 800 + 그 밖 600 둘만", () => {
  const css = rd("../ui/being-card.css"), all = rd("../ui/font-all.css"), yc = rd("../ui/yeta-chat.css");
  assert.match(all, /html\[data-font-all="pretendard"\] body \*:not\(code\):not\(pre\):not\(pre \*\):not\(kbd\):not\(samp\) \{ font-family:'Pretendard Variable'[^}]*!important; \}/);   // 덮는 쪽(클래스 0 · 속성 1)
  assert.match(css, /html\[data-font-all="pretendard"\] body \.ypc \*:not\(code\):not\(pre\):not\(pre \*\):not\(kbd\):not\(samp\) \{ font-family: 'Paperlogy', 'Pretendard Variable'[^}]*!important; \}/);   // 이기는 쪽(.ypc 클래스 하나 더)
  assert.match(css, /html\[data-font-all="pretendard"\] body \.ypc \.profile-card__name \{ font-weight: 800; \}/);
  assert.match(css, /html\[data-font-all="pretendard"\] body \.ypc \* \{ font-weight: 600; \}/);
  for (const w of [600, 800]) assert.match(yc, new RegExp(`@font-face\\{font-family:'Paperlogy';font-weight:${w};src:url\\('\\./fonts/Paperlogy-[^']+\\.woff2'\\) format\\('woff2'\\);font-display:swap`));   // 실려 있는 파일 그대로 · 쓸 때만 받음
  const mine = css.slice(css.indexOf("프로필 카드 안 글자만 Paperlogy"));
  assert.deepEqual([...mine.matchAll(/font-weight: (\d+)/g)].map((m) => m[1]).sort(), ["600", "800"]);   // 굵기 셋째를 더하면 430KB 가 더 내려옴
});

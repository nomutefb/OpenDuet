import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// 형 11-11 06:24 「웅 글구 가끔 플필이 이렇기.원에서 벗어날 때도 았어 참고행 ㅋㅋ」 — 썸네일 툴(옛 엔진) 이 문서 전체에 붙이는 로딩 점 CSS 가
// 이름이 같은 정원 「등불 테」 구슬(swap/mic-orb · 대화방 목록 프사)을 inline-block 으로 덮어 얼굴이 고리 위로 밀렸음(뜸 실물 · #/edtool 한 번 연 뒤부터)
test("썸네일 툴 로딩 점 CSS = 옛 점 구슬(data-orb)만 잡음 · 맨 .nm-orb 줄 0", () => {
  const src = readFileSync(new URL("../ui/thumb-maker/engine/libs.ts", import.meta.url), "latin1");
  const i = src.indexOf("getElementById('nm-orb-css')"), j = src.indexOf("st.id = 'nm-orb-css'", i);
  assert.ok(i > 0 && j > i);
  const css = src.slice(i, j);
  assert.equal((css.match(/\.nm-orb(?!\[data-orb\])(?![-\w])/g) || []).length, 0);
  assert.ok(/\.nm-orb\[data-orb\]\{display:inline-block/.test(css));
  assert.ok(/class="nm-orb" data-orb="/.test(src));   // 점 구슬 = data-orb 를 늘 붙임(좁힌 CSS 가 닿는 조건)
});

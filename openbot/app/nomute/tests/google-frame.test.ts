// 웹 탭 구글 = igu=1(구름 11-18 · 형 16:57 dm-gik 「깃 이거, 구글 연결되는 방법 찾아와줘.」 · 깃 실측 = igu=1 이면 X-Frame-Options 없음)
import assert from "node:assert/strict";
import { test } from "node:test";
import { frameUrl, googleFrame } from "../ui/inapp.ts";

test("구글 첫 화면 · 검색 = igu=1 붙여 품음 · 이미 있으면 한 번만", () => {
  assert.equal(googleFrame("https://google.com"), "https://www.google.com/webhp?igu=1");
  assert.equal(googleFrame("https://www.google.com/"), "https://www.google.com/webhp?igu=1");
  assert.equal(googleFrame("http://google.com/webhp?hl=ko"), "https://www.google.com/webhp?hl=ko&igu=1");
  assert.equal(googleFrame("https://www.google.com/search?q=%EB%B4%84"), "https://www.google.com/search?q=%EB%B4%84&igu=1");
  assert.equal(googleFrame("https://www.google.com/search?igu=1&q=a"), "https://www.google.com/search?igu=1&q=a");
  assert.equal(frameUrl("https://google.com"), "https://www.google.com/webhp?igu=1");
});

test("다른 구글(지메일 · 드라이브 · 지도) · 남의 사이트 = 그대로", () => {
  for (const u of ["https://mail.google.com/", "https://drive.google.com/drive/my-drive", "https://www.google.com/maps", "https://accounts.google.com/", "https://notgoogle.com/", "https://google.com.evil.kr/search?q=a", "낱말"]) {
    assert.equal(googleFrame(u), null);
  }
  assert.equal(frameUrl("https://example.com/a"), "https://example.com/a");
  assert.equal(frameUrl("https://youtu.be/abcdef12345"), "https://www.youtube.com/embed/abcdef12345");
});

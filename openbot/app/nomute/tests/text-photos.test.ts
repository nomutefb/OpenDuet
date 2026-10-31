import assert from "node:assert/strict";
import { test } from "node:test";

// office-chat.tsx 의 textPhotos 와 같은 잣대(그 파일은 화면 묶음이라 node 시험에서 못 불러옴 · 바꾸면 둘 다)
const URL_RE = /(https?:\/\/[^\s<>"'「」()]+[^\s<>"'「」().,;:!?])/g;
const IMG_RE = /\.(png|jpe?g|gif|webp|avif)$/i;
const PATH_IMG_RE = /(?:^|[\s(「])(\/(?:cards|office|viewer|api\/office)\/[^\s<>"'「」()]+\.(?:png|jpe?g|gif|webp|avif))(?=$|[\s)」.,])/gi;
const ORIGIN = "https://edit.nomute.kr";
function textPhotos(text: string): string[] {
  const out: string[] = [];
  for (const u of text.match(URL_RE) || []) { try { const x = new URL(u); if ((x.origin === ORIGIN || x.hostname === "edit.nomute.kr") && IMG_RE.test(x.pathname)) out.push(x.pathname + x.search); } catch { /* */ } }
  for (const mm of text.matchAll(PATH_IMG_RE)) out.push(mm[1]);
  return [...new Set(out)].slice(0, 4);
}

test("같은 출처 그림 주소만 사진으로(형 11-01 08:48)", () => {
  assert.deepEqual(textPhotos("썸네일 https://edit.nomute.kr/cards/a/_final.jpg 봐 줘"), ["/cards/a/_final.jpg"]);
  assert.deepEqual(textPhotos("비교(/cards/b/t1.png) 와 「/cards/b/t2.webp」"), ["/cards/b/t1.png", "/cards/b/t2.webp"]);
  assert.deepEqual(textPhotos("밖 그림 https://pbs.twimg.com/x.jpg 은 링크 그대로"), []);
  assert.deepEqual(textPhotos("그림 아닌 주소 https://edit.nomute.kr/office-app/"), []);
});

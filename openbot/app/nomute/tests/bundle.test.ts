// 촉 묶음 글 읽기(깃 11-12 19:34 꼴 · 봄 19:22 「올림 · 넘김」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isBundleText, parseBundle } from "../ui/bundle.ts";

const T = `[묶음 261112-1632-ask-202611120732gikre]
제목: 엔비디아는 해임 거론, 머스크는 젠슨 황 고용에 "영광일 것"
요약:
- 머스크가 "젠슨을 고용해 달라"는 SNS 요청에 "영광일 것"이라고 답했다.
- 젠슨 황은 이사회 독립 조사를 받고 있다.
- 엔비디아는 스페이스X 지분을 가진 주요 투자자다.
캡션:
첫 줄 캡션

둘째 문단 · 제목: 이란 말이 들어가도 캡션
주소: https://www.fnnews.com/news/202611121313265574
그림: https://image.fnnews.com/x.jpg
사진: 파이낸셜뉴스 · AP/뉴시스 · 보기용`;

test("묶음 글 = 줄 이름으로 갈라 읽음 · 캡션 = 「주소:」 앞까지 여러 줄", () => {
  assert.equal(isBundleText(T), true); assert.equal(isBundleText("그냥 글"), false);
  const b = parseBundle(T)!;
  assert.equal(b.stem, "261112-1632-ask-202611120732gikre");
  assert.match(b.title, /^엔비디아는 해임 거론/);
  assert.equal(b.sums.length, 3); assert.match(b.sums[0], /^머스크가/);
  assert.equal(b.caption, "첫 줄 캡션\n\n둘째 문단 · 제목: 이란 말이 들어가도 캡션");
  assert.equal(b.url, "https://www.fnnews.com/news/202611121313265574");
  assert.equal(b.img, "https://image.fnnews.com/x.jpg");
  assert.equal(b.credit, "파이낸셜뉴스 · AP/뉴시스 · 보기용");
  assert.equal(parseBundle(T.replace(/\n그림:.*$/m, ""))!.img, "", "그림 줄 없으면 빈 칸");
});

test("대화창 = 표지 글만 묶음 카드 · 형만 누름 길", () => {
  const oc = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8"), bc = readFileSync(new URL("../ui/bundle-card.tsx", import.meta.url), "utf8");
  assert.match(oc, /bundleOf\(m\) \? <BundleCard /);
  assert.match(bc, /office(<[^>]*>)?\("hyung-pick", \{ method: "POST"/);
  assert.match(bc, /queryKey: \["nomute", "hyung-pick"\]/);
});

test("러너 묶음 글 = 알약 말고 말풍선(카드) 자리", async () => {
  const { bubbleM } = await import("../ui/pick-msg.ts");
  assert.equal(bubbleM({ kind: "system", who: "러너", text: T }), true);
  assert.equal(bubbleM({ kind: "system", who: "러너", text: "깸: 아무개" }), false);
});

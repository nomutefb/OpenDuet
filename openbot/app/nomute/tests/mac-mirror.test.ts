// 맥 비춤 붙이개(⑤ B · 카리나 11-20 · 형 11-20 09:20 「SNS 탭을 누르면 대화는 유지되고, (좌측에) 우측에 인스타랑 그런거 뜨게해주라」)
import assert from "node:assert/strict";
import test from "node:test";
import { DEV_KEY, devId, pointOf, replyOf, touchMsg, VIEW_H, VIEW_W } from "../ui/mac-mirror";

test("누른 자리 → 390×844 점 · 위아래 띠(넓은 칸) · 양옆 띠(높은 칸) 빼고 · 밖 = null", () => {
  const wide = { left: 100, top: 50, width: 800, height: 844 };   // 그림 폭 390 · 양옆 205 띠
  assert.deepEqual(pointOf(wide, 780, 1688, 100 + 205, 50), { x: 0, y: 0 });
  assert.deepEqual(pointOf(wide, 780, 1688, 100 + 205 + 195, 50 + 422), { x: 195, y: 422 });
  assert.equal(pointOf(wide, 780, 1688, 100 + 100, 300), null, "왼쪽 띠");
  assert.deepEqual(pointOf(wide, 780, 1688, 100 + 100, 300, true), { x: 0, y: 250 }, "끌기 중 = 가장자리로");
  const tall = { left: 0, top: 0, width: 195, height: 1000 };   // 그림 높이 422 · 위아래 289 띠
  assert.deepEqual(pointOf(tall, 780, 1688, 97.5, 289 + 211), { x: 195, y: 422 });
  assert.equal(pointOf(tall, 780, 1688, 50, 100), null, "위 띠");
  assert.deepEqual(pointOf({ left: 0, top: 0, width: VIEW_W, height: VIEW_H }, 0, 0, 10, 20), { x: 10, y: 20 }, "영상 크기 모름 = 390×844");
  assert.equal(pointOf({ left: 0, top: 0, width: 0, height: 0 }, 780, 1688, 0, 0), null, "칸 없음");
  assert.equal(pointOf(wide, 780, 1688, Number.NaN, 0), null);
});

test("데이터 줄 글 = 중계기 inputOf 꼴(touch · pts · 떼기 = 빈 pts)", () => {
  assert.deepEqual(touchMsg("start", 10, 20), { t: "touch", type: "start", pts: [{ x: 10, y: 20 }] });
  assert.deepEqual(touchMsg("move", 11, 21), { t: "touch", type: "move", pts: [{ x: 11, y: 21 }] });
  assert.deepEqual(touchMsg("end", 11, 21), { t: "touch", type: "end", pts: [] });
  assert.deepEqual(touchMsg("cancel", 0, 0), { t: "touch", type: "cancel", pts: [] });
});

test("맥 집기 답 → SidePick(./sns-side 꼴 그대로 · t 뺌 · jpeg 사진만)", () => {
  const img = "data:image/jpeg;base64,AAAA";
  assert.deepEqual(replyOf(JSON.stringify({ t: "pick", state: "pick", id: "p1", ok: true, site: "instagram", url: "https://www.instagram.com/p/x/", author: "a", text: "b", img })),
    { state: "pick", id: "p1", ok: true, site: "instagram", url: "https://www.instagram.com/p/x/", author: "a", text: "b", img });
  assert.deepEqual(replyOf(JSON.stringify({ t: "pick", state: "pick", id: "p2", ok: false, why: "집기 못 함" })), { state: "pick", id: "p2", ok: false, why: "집기 못 함" });
  assert.equal(replyOf(JSON.stringify({ t: "pick", state: "pick", id: "p3", ok: true, img: "data:text/html,<b>" })).img, undefined, "jpeg 아님 = 뺌");
  assert.equal(replyOf(JSON.stringify({ t: "pong", at: 1 })), null);
  assert.equal(replyOf(JSON.stringify({ t: "pick", id: "p4" })), null, "state 없음");
  assert.equal(replyOf("not json"), null);
});

test("기기 id = 한 번 만들고 그대로 · 서버 꼴(8~64자 A-Z a-z 0-9 _ -)", () => {
  const m = new Map<string, string>(), s = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); } };
  const a = devId(s);
  assert.match(a, /^[A-Za-z0-9_-]{8,64}$/);
  assert.equal(devId(s), a);
  assert.equal(m.get(DEV_KEY), a);
  m.set(DEV_KEY, "bad id!"); assert.notEqual(devId(s), "bad id!");
  assert.match(devId(null), /^[A-Za-z0-9_-]{8,64}$/, "저장 못 함 = 이번만");
});

// PC 얼굴 띠 라임 테 · 채도 75%(형 11-12 16:23 봄 1:1 「애들 다 활성화되어잇는거맞아? 라인 프로필이 다 떠서」 · 「애들 채도를 75%로 할게. 지금 나랑 최근 1시간에 대화한 애들 아니면」 · 봄 16:28 고침 「가」)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sh = readFileSync(new URL("../ui/shell.tsx", import.meta.url), "utf8");
const src = sh.match(/export const ringOn = \(b: RingBot\) => ([^;]+);/);
const ringOn = new Function("b", "return " + (src ? src[1] : "false")) as (b: Record<string, string | undefined>) => boolean;

test("띠 라임 테 = 형 · 동료 말로 연 턴만 · 시계 알림 턴 · 깨움 표시 · 서버 잠 = 안 켜짐", () => {
  assert.ok(src, "ringOn 한 줄");
  assert.equal(ringOn({ state: "awake", why: "turn", by: "hyung" }), true);
  assert.equal(ringOn({ state: "awake", why: "turn", by: "peer" }), true);
  assert.equal(ringOn({ state: "awake", why: "roster" }), true);   // 그록 앱이 진짜 도는 중
  assert.equal(ringOn({ state: "awake", why: "turn", mark: "read" }), true);   // 부름 가져감 = 일하는 중
  assert.equal(ringOn({ state: "awake", why: "turn", by: "clock" }), false);   // 깨움 러너 알림이 연 턴
  assert.equal(ringOn({ state: "awake", why: "turn", mark: "woke" }), false);   // 서버가 깨움만 보냄
  assert.equal(ringOn({ state: "asleep", why: "roster", last_why: "wrote" }), false);
  assert.equal(ringOn({ state: "unknown", why: "roster" }), false);
  assert.match(sh, /const live = \(who\?: string\) => !!who && bots\.some\(\(b\) => b\.who === who && ringOn\(b\)\);/);   // 앞 판 「마지막 턴 10분 안이면 잠이어도」 걷음
});

test("형과 1시간 넘게 대화 없는 1:1 얼굴 = 채도 75% · 단톡 그림은 그대로", () => {
  assert.match(sh, /export const HYUNG_TALK_MS = 60 \* 60_000;/);
  assert.match(sh, /const far = \(r: \{ with\?: string; last_ts\?: number \}\) => !!r\.with && Date\.now\(\) - \(r\.last_ts \|\| 0\) > HYUNG_TALK_MS;/);
  assert.match(sh, /\$\{far\(r\) \? " far" : ""\}/);
  const css = readFileSync(new URL("../ui/shell.css", import.meta.url), "utf8");
  assert.match(css, /\.nm-face\.far > img, \.nm-face\.far > span \{ filter:saturate\(\.75\); \}/);
});

test("고정 표시 = 압정 그림 한 벌(PC 띠 · 폰 목록 · 봄 11-12 16:17 A)", () => {
  const rl = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8");
  assert.match(sh, /<PinMark className="nm-face-pin" label="고정됨" \/>/);
  assert.match(rl, /<PinMark className="nm-pin-mark" label="고정함" \/>/);
  assert.ok(!rl.includes("📌</span>"), "폰 목록 📌 글자 걷음");
  const pm = readFileSync(new URL("../ui/pin-mark.tsx", import.meta.url), "utf8");
  assert.match(pm, /export function PinMark/);
});

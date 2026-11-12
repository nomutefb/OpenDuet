// PC 얼굴 띠 라임 테 · 채도 50%(형 11-12 16:23 봄 1:1 「애들 다 활성화되어잇는거맞아? 라인 프로필이 다 떠서」 · 「애들 채도를 75%로 할게. 지금 나랑 최근 1시간에 대화한 애들 아니면」 · 봄 16:28 고침 「가」)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sh = readFileSync(new URL("../ui/shell.tsx", import.meta.url), "utf8");
const src = sh.match(/export const ringOn = \(b: RingBot\) => ([^;]+);/);
const ringOn = new Function("b", "return " + (src ? src[1] : "false")) as (b: Record<string, string | undefined>) => boolean;

test("띠 라임 테 = 턴이 실제로 도는 애만 · 그록 깨움 표시 · 서버 잠 = 안 켜짐", () => {
  assert.ok(src, "ringOn 한 줄");
  assert.equal(ringOn({ state: "awake", why: "turn", by: "hyung" }), true);
  assert.equal(ringOn({ state: "awake", why: "turn", by: "peer" }), true);
  assert.equal(ringOn({ state: "awake", why: "roster" }), true);   // 그록 앱이 진짜 도는 중
  assert.equal(ringOn({ state: "awake", why: "turn", mark: "read" }), true);   // 부름 가져감 = 일하는 중
  assert.equal(ringOn({ state: "awake", why: "turn", by: "clock" }), true);   // 형 · 동료 부름도 러너 알림(clock)으로 와서 셈 · 클로드 깸 = 턴 도는 동안만
  assert.equal(ringOn({ state: "awake", why: "turn", mark: "woke" }), false);   // 서버가 깨움만 보냄
  assert.equal(ringOn({ state: "asleep", why: "roster", last_why: "wrote" }), false);
  assert.equal(ringOn({ state: "unknown", why: "roster" }), false);
  assert.match(sh, /const live = \(who\?: string\) => !!who && bots\.some\(\(b\) => b\.who === who && ringOn\(b\)\);/);   // 앞 판 「마지막 턴 10분 안이면 잠이어도」 걷음
});

test("띠 얼굴 채도 = 형과 1:1 대화한 지 오래될수록 · 바닥 25% · 기준 = 서버 last_ts(형 11-12 17:02)", () => {
  const tbl = sh.match(/export const FACE_SAT: \[number, number\]\[\] = (\[[^;]+\]);/);
  assert.ok(tbl, "눈금 표");
  const FACE_SAT = new Function("return " + tbl![1])() as [number, number][];
  const faceSat = (ago: number) => { for (const [ms, v] of FACE_SAT) if (ago <= ms) return v; return 0.25; };
  const H = 3600_000;
  assert.equal(faceSat(5 * 60_000), 1);
  assert.equal(faceSat(2 * H), 0.75);
  assert.equal(faceSat(6 * H), 0.5);
  assert.equal(faceSat(48 * H), 0.25);
  assert.match(sh, /export const faceSat = \(ago: number\) => \{ for \(const \[ms, v\] of FACE_SAT\) if \(ago <= ms\) return v; return 0\.25; \};/);
  assert.match(sh, /const sat = \(r: \{ with\?: string; last_ts\?: number \}\) => \(r\.with \? faceSat\(Date\.now\(\) - \(r\.last_ts \|\| 0\)\) : 1\);/);
  const css = readFileSync(new URL("../ui/shell.css", import.meta.url), "utf8");
  assert.match(css, /\.nm-face > img, \.nm-face > span \{ filter:saturate\(var\(--face-sat, 1\)\); \}/);
  const rl = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8");
  assert.ok(!rl.includes("--face-sat"), "폰 목록은 안 입힘");
});

test("고정 표시 = 압정 그림 한 벌(PC 띠 · 폰 목록 · 봄 11-12 16:17 A)", () => {
  const rl = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8");
  assert.match(sh, /<PinMark className="nm-face-pin" label="고정됨" \/>/);
  assert.match(rl, /<PinMark className="nm-pin-mark" label="고정함" \/>/);
  assert.ok(!rl.includes("📌</span>"), "폰 목록 📌 글자 걷음");
  const pm = readFileSync(new URL("../ui/pin-mark.tsx", import.meta.url), "utf8");
  assert.match(pm, /export function PinMark/);
});

test("고정 압정 = 무지개 고리 · 안 읽음 점 위(형 11-12 16:44 「핀 묻힌ㄷ」)", () => {
  const css = readFileSync(new URL("../ui/shell.css", import.meta.url), "utf8");
  assert.match(css, /\.nm-face-pin \{[^}]*z-index:4;/);
  assert.match(css, /\.nm-face-pin ~ \.nm-udot \{ top:auto; bottom:1px; \}/);
  assert.ok(sh.indexOf('className="nm-face-pin"') < sh.indexOf('className="nm-udot"'), "압정이 점보다 앞 = ~ 가 먹음");
});

test("에디터 = 위 챠콜 머리 줄 뺌 · ‹ 는 판 머리 · 뒤 = 웹앱 배경(형 11-13 02:24 · 02:26)", () => {
  assert.match(sh, /const SEE = new Set\(\["settings", "drawer", "edtool"\]\)/);
  assert.match(sh, /\{M\.id === "edtool" \? null : \(/);
  assert.match(sh, /<ThumbMaker onBack=\{closeModal\} \/>/);
  const tm = readFileSync(new URL("../ui/thumb-maker/index.tsx", import.meta.url), "utf8");
  assert.match(tm, /\{onBack \? null : <SceneBg \/>\}/);
  assert.match(tm, /className="tm-back" aria-label="닫기" onClick=\{onBack\}/);
});

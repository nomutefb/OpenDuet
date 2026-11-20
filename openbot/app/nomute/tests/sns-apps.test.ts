// 폰 홈 SNS 아이콘 = 아이폰은 앱 주소로 바로(형 11-21 05:02 「이거 바로 열리게 해즈고」) · 그 밖 = https 그대로
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SNS_APP_URL, isIos } from "../home/sns-apps";

test("아이폰 · 아이패드만 앱 주소 · 앱 이름 셋", () => {
  assert.equal(isIos("Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15"), true);
  assert.equal(isIos("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel", 5), true);   // 아이패드 사파리
  assert.equal(isIos("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel", 0), false);   // 맥
  assert.equal(isIos("Mozilla/5.0 (Linux; Android 15; SM-S928N)", "Linux armv8l", 5), false);
  assert.deepEqual(SNS_APP_URL, { instagram: "instagram://app", threads: "barcelona://", x: "twitter://timeline" });
});

test("앱으로 넘어가면 끝 · 아무 일 없을 때만 웹 · href 는 https 그대로(길게 누름 · 다른 기기)", () => {
  const s = readFileSync(new URL("../home/sns-apps.tsx", import.meta.url), "utf8");
  assert.match(s, /if \(!gone && document\.visibilityState === "visible"\) window\.open\(web, "_blank", "noopener"\);/);
  assert.match(s, /window\.addEventListener\("blur", off\); window\.addEventListener\("pagehide", off\);/);
  assert.match(s, /href=\{s\.url\} target="_blank"/);
});

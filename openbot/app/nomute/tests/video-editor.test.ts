// 서랍 「영상 편집」 = 옛 비디오 에디터 화면 그대로(형 11-13 13:21 봄 옮김 「예전 비디오 에디터 화면을 그대로 계승할거거든? 지금 포토 에디터처럼」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("영상 편집 = 원본 edit.html 품음 · 포토와 같은 머리 · 챠콜 줄 0 · 웹앱 배경 · 카드 → 영상 넘김도 이 화면", () => {
  const sh = rd("../ui/shell.tsx"), ve = rd("../ui/video-editor.tsx"), sd = rd("../ui/studio-handoff.ts");
  assert.match(sh, /: M\.id === "edvid" \? <VideoEditor onBack=\{closeModal\} \/>/);
  assert.match(ve, /src=\{EDIT\}/);
  assert.match(sd, /export const EDIT = "\/edit\.html";/);   // /viewer/edit.html = 없는 파일 → 옛 첫 화면으로 떨어짐(라이브 실측)
  assert.match(sd, /const YS = "\/ys\.html";/);
  assert.match(sd, /\^\\\/\(viewer\\\/\)\?edit\(\\\.html\)\?\$/);
  assert.match(ve, /<span className="tm-menu">영상 편집<\/span>/);
  assert.match(ve, /\.nm-scene-canvas\{display:none!important\}/, "품은 문서 제 장면 끔 = 앱 배경 비침");
  assert.match(ve, /d\?\.nm === "nmToolTab"/, "옛 셸 탭 넘김 = 앱 안");
  assert.match(sd, /location\.hash = "#\/edvid";/);
});

test("시그니처 색 = 라임(형 11-13 14:06 「이미지 에디터처럼 시그니처 색이 좀 일치되어야 되구」) · 옛 청록 --accent 만 덮음 · 밝게/어둡게 따라감", () => {
  const ve = rd("../ui/video-editor.tsx");
  assert.match(ve, /--accent:\$\{dark \? "#CFFF40" : "#4f7a00"\}/);
  assert.match(ve, /--accent-rgb:\$\{dark \? "207,255,64" : "79,122,0"\}/);
  assert.match(ve, /new MutationObserver\(\(\) => see\(el\)\)/);
  const tone = rd("../ui/inapp.ts");
  assert.match(tone, /--modern-accent:\$\{dark \? "#CFFF40" : "#4f7a00"\}/, "앱 YETA 톤과 같은 값");
});

test("한 배경(형 11-13 14:08 「원톤으로 그냥 한 배경이 쭉」) = 도크 쉴 땐 투명 · 밑으로 들어갈 때만 유리", () => {
  const ve = rd("../ui/video-editor.tsx");
  assert.match(ve, /#topDock\{background:transparent!important/);
  assert.match(ve, /html\.nm-stuck #topDock\{background:rgba\(17,18,20,\.82\)!important/);
  assert.match(ve, /classList\.toggle\("nm-stuck"/);
});

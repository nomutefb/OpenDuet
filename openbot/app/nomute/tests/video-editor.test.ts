// 서랍 「영상 편집」 = 옛 비디오 에디터 화면 그대로(형 11-13 13:21 봄 옮김 「예전 비디오 에디터 화면을 그대로 계승할거거든? 지금 포토 에디터처럼」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("영상 편집 = 원본 edit.html 품음 · 포토와 같은 머리 · 챠콜 줄 0 · 웹앱 배경 · 카드 → 영상 넘김도 이 화면", () => {
  const sh = rd("../ui/shell.tsx"), ve = rd("../ui/video-editor.tsx"), sd = rd("../ui/studio-handoff.ts");
  assert.match(sh, /: M\.id === "edvid" \? <VideoEditor onBack=\{closeModal\} \/>/);
  assert.match(ve, /\{ k: "edit", t: "편집", [^}]*src: EDIT, path: "\/edvid" \}/);
  assert.match(sd, /export const EDIT = "\/edit\.html";/);   // /viewer/edit.html = 없는 파일 → 옛 첫 화면으로 떨어짐(라이브 실측)
  assert.match(sd, /\^\\\/\(viewer\\\/\)\?edit\(\\\.html\)\?\$/);
  assert.match(ve, /<b className="tm-title">\{SPARK\}<span>영상 편집<\/span><\/b>/);
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

test("영상 편집 하나 안에서 고름(형 11-14 「기본 영상 편집을 할건지, 트래킹을 할건지, 프롬프팅을 할건지 고르는거에 따라서 나오게 … 이미지 편집 1개, 영상 편집 1개」) = 옛 화면 그대로 · 옛 주소도 이 화면", () => {
  const sh = rd("../ui/shell.tsx"), ve = rd("../ui/video-editor.tsx"), dr = rd("../ui/drawer-page.tsx"), sd = rd("../ui/studio-handoff.ts");
  for (const [k, src, path] of [["track", "/track.html", "/edtrack"], ["k", "/k.html", "/edk"], ["sb", "/sb.html", "/edsb"], ["ys", "/ys.html", "/edys"], ["song", "/song.html", "/edsong"], ["vd", "/vd.html", "/edvd"], ["nb", "/nb.html", "/ednb"]])
    assert.ok(ve.includes(`{ k: "${k}", `) && ve.includes(`src: "${src}", path: "${path}" }`), `${k} = 옛 화면 ${src}`);
  assert.match(sh, /if \(\/\^\\\/\(edtrack\|edk\|edsb\|edys\|edsong\|edvd\|ednb\)\$\/\.test\(p\)\) return \{ modal: "edvid" \};/, "옛 서랍 칸 주소 = 영상 편집");
  assert.doesNotMatch(sh, /id: "edtrack"|id: "edk"|TrackModal|KPromptModal/, "따로 놀던 칸 0");
  assert.match(dr, /\{ name: "만들기", ids: \["ask", "edtool", "edvid"\] \}/, "서랍 만들기 = 요약 요청 · 이미지 편집 · 영상 편집");
  assert.match(ve, /if \(!k\) \{ openInApp\(src\); return; \}/, "모르는 넘김 주소 = 옛대로 한 겹");
  assert.match(ve, /className="ved-if" data-on=\{on \|\| undefined\}/, "안 고른 화면 = 살려 둠");
  assert.match(sd, /location\.hash = u \? `#\/edys\?u=\$\{encodeURIComponent\(u\)\}` : "#\/edys";/, "카드 제작 유튜브 링크 = 영상 편집 안 유튜브");
});

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
  assert.match(ve, /html\.nm-stuck #topDock\{background:rgba\(17,18,20,\.96\)!important\}/);   // 흐림 0 · 줄 아래 그라데이션(형 11-15 01:12 · 깃 #-025)
  assert.match(ve, /html\.nm-stuck #topDock::after\{content:'';[^}]*linear-gradient/);
  assert.ok(!/@media \(max-width:767px\)\{\.topdock:not\(\.fold\) #pvsec\{min-height:0/.test(ve), "폰도 칸 최소 높이 = 기둥(「생성」이 줄에 안 걸림)");
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
  // 형 11-14 「기존 시안 라인을 라임으로 덮어씌웟는데 기존 시안은 없애서 깔끔하고 빨리뜨게」 = 그려지기 전에 색을 넣음 · 옛 청록보다 셈 · 안 보이는 3D 바탕은 안 읽음
  assert.match(ve, /useEffect\(\(\) => \{ const el = ref\.current; return el \? seeEarly\(el\) : undefined; \}, \[src\]\)/, "주소가 바뀔 때마다 그려지기 전에 넣음");
  assert.match(ve, /--accent:\$\{dark \? "#CFFF40" : "#4f7a00"\}!important/, "라임 = 옛 화면 제 색보다 셈(먼저 넣어도 이김)");
  assert.match(ve, /if \(doc\.head\.lastElementChild !== s\) doc\.head\.appendChild\(s\)/, "다 읽은 때 다시 맨 끝으로");
  assert.match(ve, /data-nm-scene="off"/, "옛 화면 3D 바탕 안 읽음");
  assert.doesNotMatch(ve, /ved-mi-d/, "메뉴 = 기능 이름만(설명 줄 0 · 형 11-14 「영상 에디터에 설명글들 같은거 각 기능의 없어도 됨」)");
  assert.match(rd("../ui/news-detail.tsx"), /if \(h\[1\] === "##" && \/\^한\\s\*줄\\s\*요약\$\/\.test\(h\[2\]\.replace\(EMOJI0, ""\)\.trim\(\)\)\) continue;/, "기사 한 장 맨 위 「한줄 요약」 머리글 0(형 11-14 「뉴스 요약은 위에 요약이라는 헤더 안떠도됨」)");
  assert.match(sd, /location\.hash = u \? `#\/edys\?u=\$\{encodeURIComponent\(u\)\}` : "#\/edys";/, "카드 제작 유튜브 링크 = 영상 편집 안 유튜브");
});

test("옆 기둥 = 간격 다 같게(칸 36 · 사이 6) · 「음량」 뺌(형 11-15 「간격이 너무 좁아서 버튼 누르기가 힘든데 일정 간격 유지해 줘 볼륨은 … 없앰」)", () => {
  const ve = rd("../ui/video-editor.tsx");
  assert.match(ve, /#cpRailWrap \.cpv-tool,#editSpec \.gs-v\{margin:3px 0!important\}/);
  assert.match(ve, /#cpRailWrap \.cpv-tool\{height:36px!important/);
  assert.match(ve, /#editSpec \.gs-v\{font-size:0!important;width:36px!important;min-width:36px!important;height:36px!important;/);
  assert.match(ve, /#editSpec \.gs-v\[data-cyc=anorm\]\{display:none!important\}/);
  assert.doesNotMatch(ve, /data-nmv\]\{margin-bottom/, "값 글자 줄만 간격이 달라지던 덧 0");
});

test("「생성」 게이지 = 눈금 바탕 + 점점이 녹아드는 띠 · 한 번만(형 11-15 영상 「게이지 참고 60프레임」) · 이미지 · 영상 편집 같은 꼴", async () => {
  const { BAYER4, BAR, GAP, bandCells, ditherGaugeCss } = await import("../ui/dither-gauge.ts");
  assert.deepEqual(BAYER4, [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], "paper-shaders bayer4x4 그대로");
  assert.deepEqual([BAR, GAP], [3, 4], "bencho WakeSlider 눈금");
  const on = bandCells()[0].map((_, c) => bandCells().filter((r) => r[c]).length);
  assert.ok(on[0] >= 3, "채운 쪽 = 거의 꽉 참");
  assert.equal(on[on.length - 1], 0, "끝 = 빔");
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0), third = on.length / 3;
  assert.ok(sum(on.slice(0, third)) > sum(on.slice(third, 2 * third)) && sum(on.slice(third, 2 * third)) > sum(on.slice(2 * third)), "오른쪽으로 갈수록 성김");
  const css = ditherGaugeCss(".go.firing:not(.fy)", "#CFFF40");
  assert.match(css, /animation:nmDgFill \.72s [^;}]* forwards/);
  assert.doesNotMatch(css, /infinite/);
  assert.match(css, /to\{background-size:100% 100%,0px 12px,auto/, "다 차면 띠 0");
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(rd("../ui/thumb-maker/index.tsx"), /ditherGaugeCss\("\.nm-tm \.go\.firing:not\(\.fy\)", "#CFFF40", "html\.dark "\)/);
  assert.match(rd("../ui/video-editor.tsx"), /accentCss\(dark\) \+ ditherGaugeCss\("\.go\.firing:not\(\.fy\)"/);
});

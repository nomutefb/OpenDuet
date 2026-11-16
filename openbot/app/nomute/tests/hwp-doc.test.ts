// 4번 「에디터」 셋째 칸 「문서 에디터」 = 한글 없이 한글 문서(형 11-17 「이거를 에디터 한쪽에 문서 편집기로해서. 누르면 탭이 나오도록해서. 한글 파일을 구성을 할 수 있게 … 한글을 안키고도」 · 「그 부분으로해줘. 근데 아까 너가 찾은 부분 강점을 섞어도 좋지」)
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { CANT_READ, STUDIO_URL, checkLines, hdCrashed, maskedCount, saveName } from "../hwp/doc-logic.ts";
import { ED_LABEL, isEdTool } from "../ui/ed-keep-logic.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("받을 이름 = 연 파일 몸통 + 새 꼬리 · 이름 없으면 「문서-MMDD」 · 못 쓰는 글자 뺌", () => {
  assert.equal(saveName("보고서.hwp", "hwpx"), "보고서.hwpx");
  assert.equal(saveName("2025년 실적_양식.HWPX", "hwp"), "2025년 실적_양식.hwp");
  assert.equal(saveName("", "hwpx", new Date(2026, 10, 7)), "문서-1107.hwpx");
  assert.equal(saveName("가/나:다?.hwpx", "md"), "가 나 다.md");
});

test("개인정보 가리기 · 점검 결과 글 읽기 = hwpx-docs 가 내는 줄 그대로", () => {
  assert.equal(maskedCount("SECURE MASK OK /work/d.hwpx -> /work/m.hwpx (3 item(s) hidden)"), 3);
  assert.equal(maskedCount("SECURE MASK OK a -> b (0 item(s) hidden)"), 0);
  assert.equal(maskedCount("input not found"), null, "모르는 글 = 가린 셈으로 안 침");
  const ok = checkLines("READABILITY OK", "쪽 수 1  쪽별 채움: 98%\n점검 결과: 문제 0건, 확인 0건 (기준: 마지막 쪽 빼고 채움 85% 이상)");
  assert.equal(ok.bad, 0);
  assert.equal(ok.lines[0], "가독성 점검: 문제 없음");
  const bad = checkLines('RD08 p8: heading "□ 이용자 수" can end a page alone\nRD03 p2: word broken\nREADABILITY RD08x1', "쪽 수 2\n점검 결과: 문제 2건, 확인 1건");
  assert.equal(bad.bad, 4, "가독성 줄 2 + 쪽 문제 2");
});

test("점검 엔진이 못 읽은 문서 = 「문제 없음」으로 안 보임(실물 문서에서 hwpx-docs 읽기가 넘어짐 · 11-17)", () => {
  const de = rd("../hwp/doc-editor.tsx");
  assert.ok(hdCrashed('Traceback (most recent call last):\n  File "<exec>", line 16, in hd_run\nAttributeError: x'));
  assert.ok(!hdCrashed("READABILITY OK"));
  assert.match(CANT_READ, /못 읽는 꼴/);
  assert.match(de, /if \(hdCrashed\(a\.log\) \|\| hdCrashed\(f\.log\)\) throw new Error\(CANT_READ\);/);
  assert.match(de, /if \(!\/\^READABILITY \/m\.test\(a\.log\) \|\| !\/점검 결과:\/\.test\(f\.log\)\) throw new Error/, "결과 줄이 없으면 실패로");
  assert.ok(de.indexOf("hdCrashed(a.log)") < de.indexOf("const c = checkLines(a.log, f.log);"), "셈보다 먼저 거름");
});

test("메뉴 · 길 · 접는 창 = 이미지 · 비디오 에디터 옆 셋째 칸", () => {
  const sh = rd("../ui/shell.tsx"), ro = rd("../router.tsx");
  assert.match(sh, /\{ id: "eddoc", label: "문서 에디터", art: PLUS_ICON\["\/eddoc"\], to: "\/eddoc", desc: "한글 문서 만들기 · 고치기 · 저장" \}\], foot: \{ label: "에디터 열기", to: "\/edtool" \}/, "4번 「에디터」 판의 셋째 줄");
  assert.match(sh, /\{ id: "eddoc", label: "문서 편집", icon: "file", to: "\/eddoc",/);
  assert.match(sh, /modal === "edtool" \|\| modal === "edvid" \|\| modal === "eddoc" \? "editor"/, "메뉴 줄 불 = 에디터 칸");
  assert.match(sh, /const DocEditor = lazy\(\(\) => import\("\.\.\/hwp\/doc-editor"\)\);/, "눌러야 받음(첫 화면 무게 0)");
  assert.match(sh, /: t === "eddoc"\n\s+\? <DocEditor onBack=\{/);
  assert.match(sh, /edPath = useRef<Record<EdTool, string>>\(\{ edtool: "\/edtool", edvid: "\/edvid", eddoc: "\/eddoc" \}\)/);
  assert.match(ro, /"\/edvid", "\/eddoc", /);
  assert.match(sh, /const SPREAD = new Set<Modal>\(\[[^\]]*"eddoc"\]\);/, "PC = 좌우 다 씀(A4 한 장 + 도구 줄)");
  assert.match(rd("../hwp/doc-editor.css"), /\.tm-frame\.hw-frame \{ -webkit-mask-image:none; mask-image:none;/, "편집기 아래 상태 줄이 틀의 흐려짐에 안 가림");
  assert.ok(isEdTool("eddoc"));
  assert.equal(ED_LABEL.eddoc, "문서 편집");
});

test("두 재료 = rhwp 편집기(열기 · 고치기 · 저장) + hwpx-docs(만들기 · 점검) · 서버로 가는 것 0", () => {
  const de = rd("../hwp/doc-editor.tsx"), en = rd("../hwp/hd-engine.ts"), pk = JSON.parse(rd("../package.json"));
  assert.equal(pk.dependencies["@rhwp/editor"], "0.9.0", "판 고정");
  assert.equal(STUDIO_URL, "https://edwardkim.github.io/rhwp/");
  assert.match(de, /createEditor\(host\.current!, \{ studioUrl: STUDIO_URL \}\)/);
  assert.match(de, /await e\.exportHwp\(\) : await e\.exportHwpx\(\)/, "받기 = .hwp · .hwpx 둘");
  assert.match(de, /hd\(\["md", "\/work\/in\.md", "\/work\/out\.hwpx"\], \{ "in\.md": md \}, \["out\.hwpx"\]\)/, "글로 만들기 = hwpx-docs md");
  assert.match(de, /hd\(\["build", "\/hd\/templates\/gongmun\.json", "\/work\/out\.hwpx"\]/, "공문 틀");
  assert.match(de, /hd\(\["secure", "\/work\/d\.hwpx", "\/work\/m\.hwpx", "--mask-private"\]/);
  assert.match(de, /hd\(\["readability", "\/work\/d\.hwpx"\]/);
  assert.match(de, /hd\(\["pagefit", "check", "\/work\/d\.hwpx"\]/);
  assert.match(de, /setErr\(`\$\{label\} 실패 — /, "실패 = 빨강 한 줄(조용히 넘어가지 않음)");
  assert.match(de, /okToDrop\("닫을까\?"\)/, "고치던 문서 = 닫기 전에 물음");
  assert.match(en, /export const PYODIDE = "https:\/\/cdn\.jsdelivr\.net\/npm\/pyodide@314\.0\.8\/";/, "파이썬 판 고정");
  assert.match(en, /new Worker\(url, \{ type: "module" \}\)/, "일꾼 안에서 돎 = 화면 안 멈춤");
  assert.ok(!/fetch\(["'`]\/api\//.test(de + en), "우리 서버로 문서를 안 보냄");
  // 부하 줄이기(형 11-17 「한수는 진행 · 줄일수잇는 효용이 큰거는 고치장」) = 창 닫으면 일꾼 끔 · 3분 안 부르면 끔 · 묶음은 한 번 받으면 다시 안 물음
  assert.match(de, /ed\.current\?\.destroy\(\); ed\.current = null; stopHd\(\);/, "창 닫음 = 파이썬 일꾼도 내림");
  assert.match(en, /export const IDLE_MS = 180_000;/);
  assert.match(en, /if \(!waits\.size\) \{ clearTimeout\(idle\); idle = window\.setTimeout\(stopHd, IDLE_MS\); \}/);
  assert.match(en, /export function stopHd\(\) \{ if \(worker && !waits\.size\) drop\(/, "하던 일이 있으면 안 끔");
  assert.match(en, /fetch\(pack, \{ cache: "force-cache" \}\)/);
});

test("hwpx-docs 묶음 = 앱에 실림 · 작음(Pages 파일 한도 25MB 한참 아래) · 출처 · 라이선스 같이", () => {
  const p = new URL("../public/hwp/hwpx-docs-0.3.0.zip", import.meta.url);
  assert.ok(existsSync(p));
  const n = statSync(p).size;
  assert.ok(n > 300_000 && n < 2_000_000, `묶음 크기 ${n}`);
  const raw = readFileSync(p).toString("latin1");
  for (const f of ["lib/hd.py", "lib/hwpx_docs/core/build.py", "lib/hwpx_docs/core/template/Contents/content.hpf", "presets/report-gongmun.json", "templates/gongmun.json", "LICENSE", "NOTICE.txt"]) assert.ok(raw.includes(f), `묶음 안 ${f}`);
  assert.ok(!raw.includes("/fixtures/"), "시험 파일은 안 실음");
});

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

// 서랍 「에디터」 카드 제작 폰 맞춤(형 11-11 06:13 「이것만 아예 여기에 맞게 붙여줘 젤 많이 쓰는 지점이라」 · 06:15 「딱 저거를 그대로 가져오면 돼. 틀어짐 없이」 · 「폰트는 굵기를 얇게」)
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("판 폭 = 틀 그대로(같은 이름 .nm-tm 이 다른 화면에서 폭 · 정렬을 걸어도)", () => {
  assert.match(rd("../ui/thumb-maker/frame.css"), /\.tm-scroll > \.nm-tm \{ display:block; max-width:none;/);
  const teams = rd("../ui/teams.css");
  assert.ok(!/^\.nm-tm[ .{]/m.test(teams), "팀즈 말 줄 규칙이 맨 .nm-tm 으로 시작하면 카드 제작 판에 먹음");
  assert.ok(!/className=\{?[`"]nm-tm[\s"`$]/.test(rd("../ui/teams.tsx")), "팀즈 말 줄 = 우리 대화 말풍선 부품(.ymsg · .yb · 형 11-13 12:43 · 뎅) · .nm-tm 이름은 이제 카드 제작 판만");
});

test("아래 빈 띠 0(옛 index 아래 메뉴 자리 70 뺌)", () => {
  assert.match(rd("../ui/thumb-maker/frame.css"), /\.tm-stage \{[^}]*padding:12px 0 0;/);
});

test("글자 한 단 얇게 = thin.css 가 원본 판에서 다시 뗀 것과 같음 · 화면이 읽음", () => {
  const before = rd("../ui/thumb-maker/thin.css");
  execFileSync(process.execPath, [new URL("../ui/thumb-maker/tools/thin-css.mjs", import.meta.url).pathname]);
  assert.equal(rd("../ui/thumb-maker/thin.css"), before, "thin.css 를 손으로 고쳤거나 원본 판이 바뀜 → 도구로 다시 뗌");
  assert.match(before, /--fw-x: 700/); assert.match(before, /--fw-b: 600/);
  assert.ok(!/font-weight: (8|9)00\b[\s\S]*font-weight: 900/.test(before));
  assert.match(rd("../ui/thumb-maker/index.tsx"), /import "\.\/frame\.css";\nimport "\.\/thin\.css";/);
});

test("시그니처 팔레트 = 강조 · 포스트 · 장면 라임(형 11-11 12:51 「시그니처 팔레트만 그럼 여기에 맞춰줄수잇는지? 배경 이랑」)", () => {
  const f = rd("../ui/thumb-maker/frame.css");
  assert.match(f, /\.nm-tm \{ --modern-accent:#CFFF40; --modern-accent-rgb:207,255,64; --modern-bias-l1:#CFFF40; --modern-bias-l2:#5E8C00; --bias-l1:#CFFF40; \}/);
  assert.match(f, /--modern-bias-l1:#CFFF40; --modern-bias-l2:#5E8C00; --modern-space-hi-rgb:150,190,40;/);   // 장면 받침 = 홈과 같은 라임
  assert.ok(!/#41B6E7|#0762C8/.test(f.replace(/\/\*[\s\S]*?\*\//g, "")), "장면 파랑 0(주석 밖)");
});

// 직무 라벨 = 대화방 목록 이름 바로 뒤 그림(형 확정 11-20 13:25 · 루미 시안 · 13:28~13:29 「응 uxd들은 다 uxd고, 픽서들은 다 픽서야. (소나-이슬-루미 라인)」 「uxd 라인 > (구름-하늘)」 · 「dev랑 ops는 너가 배치해」)
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("라벨 = 이름 뒤 · 세로 가운데 · 넷 다 FIXER 와 눈에 같은 크기(폭 42~45) · 웹용 webp · 없는 애 = 옛 글 알약", () => {
  const lab = rd("../ui/job-label.tsx"), list = rd("../ui/room-list.tsx");
  const map = lab.slice(lab.indexOf("const JOB_OF"), lab.indexOf("};", lab.indexOf("const JOB_OF")));
  for (const [who, job] of [["구름", "UXD"], ["하늘", "UXD"], ["소나", "FIXER"], ["이슬", "FIXER"], ["루미", "FIXER"], ["천둥", "DEV"], ["빠르", "OPS"], ["번개", "OPS"],
    ["봄", "PM"], ["시아", "PM"], ["깃", "PM"], ["뜸", "CREATOR"], ["결", "STORY"], ["뎅", "STORY"], ["윈터", "STORY"], ["슈왕", "SCOOP"], ["온", "SEC"], ["카리나", "RND"], ["감", "RND"]]) assert.ok(map.includes(`${who}: "${job}"`), who);
  // 남은 일곱(형 16:48 「하늘이랑 구름이 할거야」) = 폭 ≈ 44(43~45) · 높이 20 안
  // PM = MD 결 스티커(형 18:51 「이 스타일이거든?」) · MD 와 같은 20px 높이
  assert.match(lab, /  PM: \{ src: "\/garden-app\/job-pm\.webp\?v=9", w: 63, h: 40 \}/);
  for (const k of ["STORY", "MUSIC", "CREATOR", "SEC", "SCOOP"]) {
    const m = lab.match(new RegExp(`  ${k}: \\{ src: "/garden-app/job-${k.toLowerCase()}\\.webp(?:\\?v=\\d+)?", w: (\\d+), h: (\\d+) \\}`));
    assert.ok(m, k); assert.ok(Math.abs(+m![1] / 2 - 44) <= 1.5 && +m![2] <= 40, `${k} ${m![1]}×${m![2]}`);
    assert.ok(statSync(new URL(`../public/job-${k.toLowerCase()}.webp`, import.meta.url)).size < 8_000, k);
  }
  // 그림 높이 = 화면의 2배 → 그려지는 높이 FIXER · MD 20 · DeV · OpS 16(형 14:13 「딱봐도 픽서빼고는 너무 큰데 사이즈좀맞춰줘」) · UXD 10.5 = 그 80%(형 16:47 「uxd는 아까 80%크기로 줄이라고했는데 안됫네」)
  for (const [k, h] of [["FIXER", 40], ["MD", 40], ["UXD", 21], ["DEV", 25], ["OPS", 46]] as const) assert.match(lab, new RegExp(`${k}: \\{ src: "/garden-app/job-${k.toLowerCase()}\\.webp(\\?v=\\d+)?", w: \\d+, h: ${h}(?:, dy: -?[\\d.]+)? \\}`), k);
  const uw = +(lab.match(/UXD: \{[^}]*w: (\d+)/)?.[1] || 0) / 2; assert.ok(Math.abs(uw - 43.5 * 0.8) <= 2, `UXD 폭 ${uw} = FIXER 의 80%`);
  // DEV 폭 = 형 20:38 「그대로 두고 지금의 90% 크기로」(43 → 38.5)
  { const w = +(lab.match(/DEV: \{[^}]*w: (\d+)/)?.[1] || 0) / 2; assert.ok(Math.abs(w - 43 * 0.9) <= 1, `DEV 폭 ${w}`); }
  // DeV · OpS = 하늘 그림(형 13:43~13:44 「저기에 보면 ba랑 y가 강하잖아. 그걸 활요해서 만들라고해.」) · 그림 바꾸면 ?v 올림(캐시)
  // DEV = 시아 글리치 그림(형 20:19 「DEV는 저대로 가자 …」 · 「데브 크기 65%로 줄여서 70%?」 · 시아 견줌 판 70% = 43×13px)
  assert.match(lab, /DEV: \{ src: "\/garden-app\/job-dev\.webp\?v=12", w: 77, h: 25, dy: -0\.25 \}/);
  // 수평 = 그림 속 글자 가운데가 쏠린 만큼 내림(형 20:28 「70% 로 수평 맞추면 될듯」 · 20:31 「데브 좀만 더 내려주면 댈듯」) · transform 하나(다시 칠하기 0)
  assert.match(lab, /style=\{g\.dy \? \{ transform: `translateY\(\$\{g\.dy\}px\)` \} : undefined\}/);
  // OPS = 시아 렌치 그림(형 20:34 「…왕관 대신 붙일수잇나? 심플하면서 명확한 픽토를」) · 글자 높이 = DEV 글자와 같게 · 렌치는 위로 · 2px 올려 DEV 와 수평
  assert.match(lab, /OPS: \{ src: "\/garden-app\/job-ops\.webp\?v=12", w: 67, h: 46, dy: -4 \}/);
  assert.match(lab, /width=\{g\.w \/ 2\} height=\{g\.h \/ 2\}/);
  for (const k of ["fixer", "md", "uxd", "dev", "ops"]) assert.ok(statSync(new URL(`../public/job-${k}.webp`, import.meta.url)).size < 8_000, k);
  // 자리 = 이름 바로 뒤(같은 줄 · items-center = 세로 가운데) · 라벨 있으면 글 알약 대신
  assert.match(list, /\{slim \? null : jobOf\(p\) \? <JobLabel job=\{jobOf\(p\)!\} who=\{p\?\.who\} \/>/);
  // 이름 글 끝 → 라벨 = 다 6px(형 19:39 dm-haneul 「혹시 좀 더 pm애들 라벨을 좌측으로 붙일수잇어? 살짝 좌측에 여백이 있는 것 같더라고.」 · 실측 = 한 글자 이름만 최소 폭 1.2em 탓 11px)
  assert.match(list, /className=\{`\$\{jobOf\(p\) \? "" : "min-w-\[1\.2em\] "\}shrink truncate text-\[15px\]/);
  // 지금 PM 만 무지개(형 19:18 dm-haneul 「현재 PM은 레인보우로 특별하게, 무지개 빛 할수있어?」) · 서버 pm 칸 · 우하단 PM 구슬과 같은 캐시 열쇠 · 정지 그림
  assert.match(lab, /if \(job === "PM" && who\) return <PmLabel who=\{who\} \/>;/);
  assert.match(lab, /queryKey: \["nomute", "pm"\], queryFn: \(\) => office<\{ who\?: string \}>\("pm"\), staleTime: 300_000, refetchInterval: 300_000/);
  assert.match(lab, /const g = now === who \? PM_NOW : IMG\.PM;/);
  assert.ok(statSync(new URL("../public/job-pm-now.webp", import.meta.url)).size < 8_000);
  assert.match(rd("../ui/room-fab.tsx"), /queryKey: \["nomute", "pm"\], queryFn: \(\) => office<\{ who\?: string \}>\("pm"\), staleTime: 300_000, refetchInterval: 300_000/, "같은 열쇠 · 같은 받기");
  assert.match(list, /: p\?\.role \? <span data-content/);
});

test("라벨 반짝임 = 그림 안에 그려 넣음(형 11-20 19:44 dm-haneul 「1 고고」 · 앞 물음 19:39 「애들 라벨에 살짝 반짝임? 그런 효과넣으면 과부하걸릴까?」 · 19:43 「아예 더 덜먹는방법은?」) · 움직임 0", () => {
  const lab = rd("../ui/job-label.tsx");
  for (const k of ["fixer", "md", "uxd", "pm", "pm-now", "story", "music", "creator", "sec", "scoop"]) assert.ok(lab.includes(`/garden-app/job-${k}.webp?v=9"`), k);
  assert.ok(lab.includes(`/garden-app/job-ops.webp?v=12"`), "ops = 시아 렌치 + 반짝임");
  assert.ok(lab.includes(`/garden-app/job-dev.webp?v=12"`), "dev = 시아 글리치 + 반짝임");
  assert.doesNotMatch(lab, /animation|@keyframes|setInterval|requestAnimationFrame/);
});

test("RND = 시아 홀로 비커 그림 · 85% 17px · 수평(형 11-20 20:34~20:37 dm-sia 시아 옮김 「여기 TEEL 저거로 그 비커 모형픽토까지 글자느낌 가능할까」 · 「크기 85% 로 수평 맞춰주면댐」)", () => {
  const lab = rd("../ui/job-label.tsx");
  assert.match(lab, /  RND: \{ src: "\/garden-app\/job-rnd\.webp\?v=11", w: 75, h: 34, dy: 1 \}/);
  assert.ok(statSync(new URL("../public/job-rnd.webp", import.meta.url)).size < 8_000);
});

// 애들 화면 얼굴 펼침 = 그 애 관리 칸(형 11-16 19:36 dm-bom 「거기서 일괄 관리 페이지가 되길 바라는거임」 · 19:35 「특정 봇에 개발을 임시로 언제까지 멈추게」) — 임시 멈춤 셈 + 배선
//   꼴 = 옛 에디터 영상 편집 글자 줄 + 끄는 기간 막대(형 20:5x 구름 맥 창 「알약으로 선택하면 비효율 이니 그 영상에디터에 이미 css가 잇거든?」 · 「기간 설정은 이것도 참고해보고.」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { HOLD_MAX, acctKo, bodyNote, durKo, endKo, minsAt, posOf, restBody, restKo, restOn, restPos, stepOf, ticksOf, untilOf } from "../ui/bot-manage-logic.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const kst = (s: string) => Date.parse(s + "+09:00");
const NOW = kst("2026-11-16T20:40:00");

test("끄는 막대 = 길 24시간 · 30분 칸에 붙음 · 30분 ~ 24시간 · 0분 = 풀 때까지", () => {
  assert.equal(HOLD_MAX, 1440);
  assert.equal(minsAt(0), 30); assert.equal(minsAt(-1), 30); assert.equal(minsAt(2), 1440);
  assert.equal(minsAt(0.146), 210);   // 3시간 30분
  assert.equal(minsAt(60 / 1440 + 0.004), 60);
  assert.equal(posOf(720), 0.5); assert.equal(posOf(1440), 1);
  assert.equal(untilOf(210, NOW), NOW + 210 * 60e3);
  assert.equal(untilOf(0, NOW), undefined);
});

test("글 = 걸리는 시간 「3시간 30분」 · 끝나는 때 「21:40」 · 「내일 09:00」 · 그 뒤는 날짜", () => {
  assert.deepEqual([30, 60, 210, 1440].map(durKo), ["30분", "1시간", "3시간 30분", "24시간"]);
  assert.equal(endKo(kst("2026-11-16T21:40:00"), NOW), "21:40");
  assert.equal(endKo(kst("2026-11-17T09:00:00"), NOW), "내일 09:00");
  assert.equal(endKo(kst("2026-11-18T09:00:00"), NOW), "11-18 09:00");
  assert.equal(endKo(undefined, NOW), "풀 때까지");
});

test("눈금 = 지금부터 24시간 안의 6시간 금(00 · 06 · 12 · 18시) · 자리 0~1", () => {
  const t = ticksOf(NOW);
  assert.deepEqual(t.map((x) => x.label), ["00:00", "06:00", "12:00", "18:00"]);
  assert.ok(Math.abs(t[0].x - (3 * 60 + 20) / 1440) < 1e-9);   // 20:40 → 자정 = 3시간 20분 뒤
  assert.ok(t.every((x) => x.x > 0 && x.x <= 1));
});

test("걸려 있나 = 칸이 있고 기한이 안 지남 · 걸린 줄 글 · 길 위 자리", () => {
  const name = (c: string) => ({ D: "Dev.", S: "Fixer" })[c] || c;
  assert.equal(restOn(undefined, NOW), false);
  assert.equal(restOn({ at: NOW - 1 }, NOW), true);
  assert.equal(restOn({ until: NOW }, NOW), false);
  assert.equal(restKo({ codes: ["D"], until: kst("2026-11-16T21:40:00") }, NOW, name), "Dev. · 21:40 까지");
  assert.equal(restKo({ codes: ["D", "S"], until: kst("2026-11-17T09:00:00") }, NOW, name), "Dev. · Fixer · 내일 09:00 까지");
  assert.equal(restKo({}, NOW, name), "전부 · 풀 때까지");
  assert.equal(restPos({ until: NOW + 12 * 3600e3 }, NOW), 0.5);
  assert.equal(restPos({}, NOW), 1);
});

test("서버 몸 = 빠르 꼴 그대로 {who, on, codes?, until?} · 전부 · 풀 때까지면 그 칸을 안 보냄 · 풀기 = on:false 만", () => {
  assert.deepEqual(restBody("번개", true, ["D"], 123), { who: "번개", on: true, codes: ["D"], until: 123 });
  assert.deepEqual(restBody("번개", true, [], undefined), { who: "번개", on: true });
  assert.deepEqual(restBody("번개", false, ["D"], 123), { who: "번개", on: false });
});

test("배선 = 얼굴 펼침 안 · 서버 길은 이미 있는 것만 · 고르는 줄 = 영상 에디터 글자 줄(알약 0) · 막대는 끄는 동안 transform 만", () => {
  const ui = rd("../ui/bot-manage.tsx"), desk = rd("../ui/bot-desk.tsx"), css = rd("../ui/bot-desk.css"), mine = css.slice(css.indexOf("그 애 관리 칸"));
  assert.match(desk, /className="nm-bd-org-one"[\s\S]*<BotManage key=\{`m-\$\{picked\.who\}`\} r=\{picked\} skills=\{skills\} \/>/);
  assert.match(ui, /office<\{ nextwin\?: Record<string, NextWin> \}>\("profile\/nextwin", \{ method: "POST"/);
  assert.match(ui, /office<\{ ok\?: boolean; rest\?: RestMap \}>\("bots\/rest", \{ method: "POST", body: JSON\.stringify\(restBody\(/);
  assert.match(ui, /\{r\.brain === "클로드" \|\| r\.who === "구름" \? <NextWinRows who=\{r\.who\} \/> : null\}/);   // 구름(자리 cloud · brain 칸 빔)도 다음 창 모델 · 노력도(시아 0e2dba4 · 형 11-17 09:49)
  assert.match(ui, /<AcctRestRow r=\{r\} skills=\{skills\} \/>/); assert.match(ui, /\{r\.pm \? <PmRow who=\{r\.who\} \/> : null\}/);   // 계정 줄 + 쉼 토글(형 11-17 07:53) · PM 줄 = PM 바꾸기
  assert.match(ui, /\{r\.brain === "그록" \? <GrokRows \/> : null\}/);   // 그록 쪽 애만 호출 맥락 · 그록봇 지침
  // 설정에서 옮긴 것(형 11-16 19:36 「한쪽에 몰아버리고 싳은거임」 · 봄 21:30 「가」): 「모두」 일괄은 누르기 전 한 번 되물음 · 설정엔 가는 길 하나
  assert.match(ui, /export function BotManageAll\(\)/);
  assert.match(ui, /<MorphAsk key=\{id\} className="pc" disabled=\{off\} label=\{`모두 모델 \$\{ko\}`\} onYes=\{\(\) => save\.mutate\(\{ model: id \}\)\}>/);   // 그 자리 재확인(모달 0 · 형 21:4x 「항상 그냥 re 토글로만」)
  assert.doesNotMatch(ui, /AskYN|createPortal/);   // 되묻는 창(모달)은 안 씀
  assert.match(ui, /JSON\.stringify\(\{ all: true, \.\.\.v \}\)/);
  assert.match(desk, /\{sel === "\*" \? <div className="nm-bd-org-one" aria-label="모두 한 번에"><BotManageAll \/><\/div> : null\}/);
  const set = rd("../ui/yeta-settings.tsx");
  assert.doesNotMatch(set, /애들 · 계기판</);   // 설정의 가는 길 둘 = 걷음(형 11-17 12:25 dm-bom 「중간에 계기판 하고 스케줄도!」 · 13:0x 구름 창 「설정에 있는 계기판 같은거는, 이미 다른 메뉴에 있는 내용이니까, 굳이 설정에 또 있을 필요없어」 · 시아 d36c846) — 가는 길 = 폰 네비 5번 · PC 위 메뉴 「애들」
  assert.doesNotMatch(set, /<PmSet \/>|<AcctPrio \/>|<WakeDepthRow \/>|<GrokNote \/>|<NomuteBots \/>/);
  assert.doesNotMatch(set, /ModelSetRows/);   // 일 모델 · 노력도(서브 LLM)도 설정에서 뺌 → 스케줄 화면(형 11-17 02:1x 「녹인뒤 픽스되면 설정에서 빼주셈」)
  assert.doesNotMatch(set, /스케줄 · 점검 · 일 모델</);   // 같은 때 걷음(위 줄과 한 쌍)
  assert.match(readFileSync(new URL("../ui/sched-desk.tsx", import.meta.url), "utf8"), /<ModelSetRows bots=\{false\} \/>/);   // 같은 부품이 스케줄 화면에
  // 옛 에디터 줄 값 그대로: 낱말 = 상자 없음 6·7 · 13 · 700 / 고른 낱말 = 강조색 800 / 사이 | = .35
  assert.match(mine, /\.nm-bm \.srow \{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; padding:8px 0; \}/);
  assert.match(mine, /\.nm-bm \.pc \{ height:auto; padding:6px 7px; border:0; border-radius:0; background:none;/);
  assert.match(mine, /\.nm-bm \.pc\.on \{ color:var\(--accent, #CFFF40\); font-weight:800; \}/);
  assert.match(mine, /\.nm-bm \.ssep \{[^}]*opacity:\.35;/);
  // 다시 짬(형 11-17 07:53 dm-bom): 노력도 = 좌우로 넘기는 낱말 하나 · 사양 줄 대신 그 애 몸 칸(그래프) · 기간 막대 · 「걸기」 줄은 걷음
  // 다시 짬(형 11-18 19:01 dm-gik 깃 옮김 「이 형탸로 아래 너희들 모델 선택 도 하네스가 맞아야함」 · 「눌럿을때 투박하게 고르지 않게해주고 높은거부터 나오게해줘 미토스 부터」): 그 애 「다음 창」 = 「일 모델」 판과 같은 줄(PickRow) · 고르기 = 앱 목록 · 「모두」 줄은 그대로 되물음(MorphAsk)
  assert.match(ui, /<PickRow label="다음 창" [^\n]*models=\{BOT_MODELS\} efforts=\{BOT_EFFORTS\}[^\n]*onPick=\{\(p\) => save\.mutate\(\{ \.\.\.cur, \.\.\.p \}\)\} \/>/);
  assert.doesNotMatch(ui, /<Step |function Step\(/);
  assert.match(ui, /role="switch" className="sw" aria-checked=\{shown\}/);
  assert.match(ui, /restBody\(r\.who, turnOn, \[\], undefined\)/);   // 토글 = 전부 · 풀 때까지
  assert.doesNotMatch(ui, /function HoldBar|function RestRows|걸기<\/button>/);
  assert.match(desk, /<VmCard key=\{`v-\$\{picked\.who\}`\} r=\{picked\} \/>/); assert.doesNotMatch(desk, /hwOf\(picked\)/);
  assert.match(css, /\.nm-bm \.sw\[aria-checked="true"\] > i \{ transform:translateX\(18px\);/);
  assert.doesNotMatch(mine, /transition:[^;]*(height|width|top|left|margin)/);
});

test("펼침 카드 셈 — 좌우 넘김 · 계정 줄 · 비고에서 몸 이야기만", () => {
  // 형 11-17 07:53 dm-bom(봄 옮김) 「첨부2에 노력도. 비디오 에디터 같은 곳에 좌우로 왓다갓다 토글 할 수 있게 변경」 · 「계정에 ems1130g (잔여 00%)」 · 「그래프에서 나오는 상세한 설명글 … 루틴에 대한 그거는 중첩된 내용이니 없어도 되고」
  const E = ["low", "medium", "high", "xhigh", "max"];
  assert.equal(stepOf(E, "high", 1), "xhigh"); assert.equal(stepOf(E, "max", 1), "low"); assert.equal(stepOf(E, "low", -1), "max"); assert.equal(stepOf(E, "모름", 1), "low");
  assert.deepEqual(acctKo("ems1130g", 82), { name: "ems1130g", left: "잔여 82%" }); assert.deepEqual(acctKo("naver", "남은 46"), { name: "naver", left: "잔여 46" }); assert.deepEqual(acctKo(undefined, null), { name: "", left: "" });
  assert.equal(bodyNote("윈A VM · 램 동적 4~10GB"), "윈A VM · 램 동적 4~10GB");
  assert.equal(bodyNote("화면을 빌드까지 해서 넘김"), "");
  assert.equal(bodyNote("개발 제외 · 맥 한 대를 같이 씀(CPU · GPU 공용 · 동적) · 특기만(형 11-16)"), "맥 한 대를 같이 씀(CPU · GPU 공용 · 동적)");   // 괄호 안은 안 나눔
  assert.equal(bodyNote("쉼 지정 · 바깥 마무리까지 · 그록 한 계정 공용 몸(상자 15GB · 빈 몫 약 11GB · 같이 돌면 나눠 씀)"), "그록 한 계정 공용 몸(상자 15GB · 빈 몫 약 11GB · 같이 돌면 나눠 씀)");
  assert.equal(bodyNote("Lx A 를 시아와 같이 씀 · 머리 = 코덱스 ↔ 클로드"), "Lx A 를 시아와 같이 씀 · 머리 = 코덱스 ↔ 클로드");
  assert.equal(bodyNote(undefined), "");
});


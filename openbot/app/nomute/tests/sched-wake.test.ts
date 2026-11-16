// 스케줄 배선 = 깨워지는 봇 밑으로 모으고, 누가 부르나 · 용건 · 언제를 따로(형 11-17 01:1x 구름 맥 창) — 셈 = ../ui/sched-wake.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { callerName, fromEvent, fromOf, hookPlace, jobCore, jobWakes, kindKo, modeKo, ownerOf, rowUnits, srcTag, wakeRows, wakeState, type WRoutine } from "../ui/sched-wake";
import { rawBots } from "../ui/sched-tree-core";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const BOTS = ["chok", "gyeol", "on", "sona"];
// 라이브 표(11-17 01:1x) 꼴 그대로
const X: WRoutine = { id: "x.collect", bot: "x", who: "x", name: "슈왕 [웹훅-x-01] 수집", when: ["매일 9~22시 매시 30분", "매일 10~23시 매시"], events: [{ kind: "breaking_alert", mode: "바로", via: "chok.alert" }, { kind: "trend_hit", mode: "묶음+따로", via: "chok.alert" }, { kind: "urgent_flag", mode: "바로", via: "chok.call" }] };
const CALL: WRoutine = { id: "chok.call", bot: "chok", who: "슈왕", name: "호출", fork: "call", when: [], events: [{ kind: "urgent_flag", mode: "바로" }, { kind: "data_changed", mode: "묶음+따로" }] };
const ALERT: WRoutine = { id: "chok.alert", bot: "chok", who: "슈왕", name: "러너 긴급·급상승·화재 알림", fork: "done", when: [], events: [{ kind: "breaking_alert", mode: "바로" }, { kind: "trend_hit", mode: "묶음+따로" }] };
const GY: WRoutine = { id: "gyeol.call", bot: "gyeol", who: "결", name: "호출", fork: "call", when: [], events: [{ kind: "video_done", mode: "묶음+따로" }] };
const SONA: WRoutine = { id: "sona.call", bot: "sona", who: "소나", name: "호출", fork: "call", when: [], events: [] };
const ALL = [X, CALL, ALERT, GY, SONA];

test("가지 주인 = 깨워지는 봇 — 봇 목록에 없는 x 로 적힌 수집은 그 일이 넘기는 호출의 주인(슈왕) 밑으로", () => {
  assert.equal(ownerOf(X, ALL, BOTS), "chok");
  assert.equal(ownerOf(CALL, ALL, BOTS), "chok"); assert.equal(ownerOf(GY, ALL, BOTS), "gyeol");
  assert.equal(ownerOf({ ...X, events: [] }, ALL, BOTS), "x");   // 넘기는 곳이 없으면 적힌 그대로
  const raw = rawBots({ forks: [], routines: ALL.map((r) => ({ ...r, state: "live" })), ids: BOTS });
  assert.deepEqual(raw.kids.map((k) => [k.id, k.name, k.kids.map((x) => x.id)]), [["bb:chok", "슈왕", ["r:x.collect", "r:chok.call", "r:chok.alert"]], ["bb:gyeol", "결", ["r:gyeol.call"]], ["bb:sona", "소나", ["r:sona.call"]]]);   // X 가지 따로 없음 · 가지 이름 = 봇 이름
});

test("부르는 쪽 이름 = 봇 이름 · [웹훅] 표를 뗀 알맹이 · 남의 이름으로 적힌 일은 그 이름을 앞에", () => {
  assert.equal(jobCore(X, ALL, BOTS), "수집"); assert.equal(callerName(X, ALL, BOTS), "X 수집");
  assert.equal(callerName(CALL, ALL, BOTS), "호출");
});

test("깨우는 길 = 용건 · 누가 · 언제 세 칸 — 누가 = 그 용건을 이 문으로 넘기는 일 · 표에 없으면 빈 글", () => {
  assert.deepEqual(wakeRows(CALL, ALL, BOTS), [{ k: "e:urgent_flag", what: "긴급 표시", when: "바로", by: "X 수집", src: "routine" }, { k: "e:data_changed", what: "자료 바뀜", when: "묶음 · 따로", by: "", src: "" }]);   // data_changed 는 넘기는 줄이 표에 없음 → 빈 글(화면 = 「모름」)
  assert.deepEqual(wakeRows(ALERT, ALL, BOTS).map((r) => [r.what, r.by, r.when]), [["속보", "X 수집", "바로"], ["트렌드 적중", "X 수집", "묶음 · 따로"]]);
  assert.deepEqual(wakeRows(X, ALL, BOTS), [{ k: "sched", what: "수집", by: "시계", when: "매일 9~22시 매시 30분 · 매일 10~23시 매시", sched: true, src: "clock" }]);   // 넘기는 용건(via 남의 문)은 받는 쪽 카드에만
  assert.deepEqual(wakeRows(SONA, ALL, BOTS), []);
  // 서버 from 글(빠르 #4084 꼴 그대로) — 러너 목록의 파일과 맞으면 그 일 이름 · 기존 / 안 맞으면 신규 · 「모름」 = 빈 글 · ko = 서버 한글 먼저
  const JOBS = [{ id: "wf.breaking-judge", name: "속보", file: "breaking-judge.yml" }, { id: "wf.card-make", name: "카드 뉴스(초안)", file: "card-make.yml" }, { id: "wf.edit-make", name: "영상 편집", file: "edit-make.yml" }];
  assert.deepEqual(fromOf("러너 breaking-judge(속보 판정)", JOBS), { by: "속보", src: "runner", note: "속보 판정" });
  assert.deepEqual(fromOf("러너 card-make · card-in(카드 초안 · 요청)", JOBS), { by: "카드 뉴스(초안) · card-in", src: "runner", note: "카드 초안 · 요청" });   // 여러 러너 = 아는 일은 이름 · 모르는 건 글자 그대로(카드 실패 · 라벨 마감 용건은 형 11-17 「이제 안하니」로 걷음)
  assert.deepEqual(fromOf("러너 video-in · *-make(영상 끝 · 요청한 봇)", JOBS), { by: "video-in · *-make", src: "runner", note: "영상 끝 · 요청한 봇" });   // *-make 가 목록의 card-make · edit-make 와 맞음 = 기존
  assert.deepEqual(fromOf("러너 song-seeds(곡 씨앗)", JOBS), { by: "song-seeds", src: "runner", fresh: true, note: "곡 씨앗" });   // 목록에 없는 러너 = 신규
  assert.deepEqual(fromOf("모름", JOBS), { by: "", src: "" }); assert.deepEqual(fromOf("사무실 「!이름」(형 · 봇)", JOBS), { by: "사무실 「!이름」", src: "human" });
  assert.deepEqual(fromOf("x.collect", JOBS, (id) => (id === "x.collect" ? "X 수집" : "")), { by: "X 수집", src: "routine" });
  assert.deepEqual(wakeRows({ ...GY, events: [{ kind: "video_done", mode: "묶음", from: "러너 edit-make(영상 끝)", ko: "영상 끝" }] }, ALL, BOTS, { jobs: JOBS })[0], { k: "e:video_done", what: "영상 끝", when: "묶음", by: "영상 편집", src: "runner", note: "영상 끝" });
  assert.deepEqual(wakeRows({ ...CALL, events: [{ kind: "urgent_flag", mode: "바로", from: "모름" }] }, ALL, BOTS)[0], { k: "e:urgent_flag", what: "긴급 표시", when: "바로", by: "", src: "" });   // 서버가 「모름」이라 하면 넘기는 줄로 어림하지 않음
  // 서버가 칸으로 쪼개 주면 그 칸이 먼저(빠르 #4088) — from_known 이 기존 · 신규를 정함
  assert.deepEqual(fromEvent({ kind: "breaking_alert", from: "러너 breaking-judge(속보 판정)", from_kind: "runner", from_files: ["breaking-judge"], from_jobs: ["wf.breaking-judge"], from_note: "속보 판정", from_known: true }, JOBS), { by: "속보", src: "runner", note: "속보 판정" });
  assert.deepEqual(fromEvent({ kind: "song_seeds", from_kind: "runner", from_files: ["song-seeds"], from_known: false }, JOBS), { by: "song-seeds", src: "runner", fresh: true });
  assert.deepEqual(fromEvent({ kind: "x", from_kind: "runner", from_files: ["card-make", "card-in"] }, JOBS), { by: "카드 뉴스(초안) · card-in", src: "runner" });   // from_known 칸이 없으면 러너 목록과 견줌
  assert.deepEqual(fromEvent({ kind: "teams_day", from: "모름", from_kind: "unknown" }, JOBS), { by: "", src: "" });
  assert.deepEqual(fromEvent({ kind: "x", from: "사무실 「!이름」(형 · 봇)", from_kind: "office", from_note: "형 · 봇" }, JOBS), { by: "사무실 「!이름」", src: "human", note: "형 · 봇" });
  assert.equal(fromEvent({ kind: "x" }, JOBS), null);
  assert.equal(rowUnits([]), 1); assert.equal(rowUnits(wakeRows(X, ALL, BOTS)), 2); assert.equal(rowUnits(wakeRows(CALL, ALL, BOTS)), 2);
});

test("러너 알림이 봇을 깨우면 그 봇 호출 카드에 한 줄(「결 알림」 → 결)", () => {
  const job = { id: "wf.winter-auto", name: "수리 러너", when: "", notify: ["결 알림", "이슈 글", "push_send(칸 모름)"] };
  assert.equal(jobWakes(job, "결"), true); assert.equal(jobWakes(job, "결🌿"), true); assert.equal(jobWakes(job, "감"), false);
  assert.equal(jobWakes({ ...job, notify: ["요약 알림"] }, "결"), false);
  assert.deepEqual(wakeRows(GY, ALL, BOTS, { jobs: [job] }).at(-1), { k: "j:wf.winter-auto", what: "수리 러너 알림", by: "수리 러너", when: "끝나면", src: "runner" });
  assert.equal(wakeRows(ALERT, ALL, BOTS, { jobs: [{ ...job, notify: ["슈왕 알림"] }] }).length, 2);   // 호출 문에만 붙음
});

test("말 — 용건 이름 · 시점 · 자리 한 번 · 상태", () => {
  assert.equal(kindKo("breaking_alert"), "속보"); assert.equal(kindKo("new_kind"), "new_kind"); assert.equal(kindKo("new_kind", { new_kind: "새 용건" }), "새 용건");
  assert.equal(modeKo("바로"), "바로"); assert.equal(modeKo(undefined), "생기면");
  assert.equal(hookPlace([{ hook: "A", hook_at: "깃허브 시크릿 → Pages 환경" }, { hook: "B", hook_at: "깃허브 시크릿 → Pages 환경" }, {}]), "깃허브 시크릿 → Pages 환경");
  assert.equal(hookPlace([{ hook: "A", hook_at: "가" }, { hook: "B", hook_at: "나" }]), ""); assert.equal(hookPlace([{}]), "");
  const KO = { ok: "정상", late: "지연", miss: "놓침", unknown: "확인 안 됨", off: "꺼짐" }, NOW = 1_794_845_000_000;
  assert.equal(wakeState("unknown", true, false, undefined, NOW, KO), "켜짐");   // 부를 때만 = 「확인 안 됨」 안 띄움
  assert.equal(wakeState("unknown", true, false, NOW - 42 * 60e3, NOW, KO), "켜짐 · 마지막 42분 전");
  assert.equal(wakeState("unknown", false, false, undefined, NOW, KO), "꺼짐");
  assert.equal(wakeState("unknown", true, true, undefined, NOW, KO), "확인 안 됨"); assert.equal(wakeState("miss", true, false, undefined, NOW, KO), "놓침");
});

test("화면 = 봇 일 카드는 세 칸 표 · 열쇠 한 줄 · 자리는 한 번만", () => {
  const t = rd("../ui/sched-tree.tsx"), c = rd("../ui/sched-tree-core.ts");
  assert.match(t, /className="nm-tree-wk"/); assert.match(t, /<small>용건<\/small><small>누가<\/small><small>언제<\/small>/);
  assert.doesNotMatch(t, /className="nm-tree-l2 hook at"/);   // 카드마다 되풀이되던 「자리」 줄 걷음
  assert.match(t, /className="nm-tree-place"/);
  assert.match(c, /ownerOf\(r, mine, ids\)/);
  assert.equal(srcTag({ src: "runner" }), "러너"); assert.equal(srcTag({ src: "runner", fresh: true }), "러너 · 신규"); assert.equal(srcTag({ src: "routine" }), "루틴"); assert.equal(srcTag({ src: "clock" }), "");
  assert.match(t, /<i className="to" title=\{`이 문이 깨우는 이 = \$\{toWho\}`\}>\{toWho\} 깨움<\/i>/);   // 누굴 깨우나 = 카드 머리
  assert.match(rd("../ui/sched-tree.css"), /\.nm-tree-wk \.r > \* \{[^}]*box-shadow:inset 0 1px 0 var\(--tree-edge\)/);   // 케이스마다 구분선
});

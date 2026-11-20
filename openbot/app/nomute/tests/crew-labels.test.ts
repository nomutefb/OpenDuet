// 「애들」 탭 얼굴 밑 직함 = 대화창 라벨 그림(형 11-21 05:43 dm-bom 봄 옮김 「여기도 대화창 라벨 다 붙여줘」) · 계정 칸 그록 = G·N · G·H(05:44 「그록 이슬 외 는 G 블릿 N 르미는 G 블릿 H」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { acctTag } from "../data/acct-time.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("손 판 · PM 줄 = 대화 목록과 같은 부품(JobLabel · jobOf · 지금 PM 무지개는 JobLabel 이 맡음) · 라벨 없는 손 = 옛 글 알약", () => {
  const h = rd("../ui/bot-desk-hands.tsx"), d = rd("../ui/bot-desk.tsx"), css = rd("../ui/bot-desk.css");
  assert.match(h, /import \{ JobLabel, jobOf \} from "\.\/job-label";/);
  assert.match(h, /const jb = jobOf\(people\.find\(\(x\) => x\.who === r\.who\) \|\| \{ who: r\.who \}\);/);
  assert.match(h, /\{jb \? <span className="sk-lab" title=\{sub \|\| undefined\}><JobLabel job=\{jb\} who=\{r\.who\} \/><\/span> : sub \? <small className="sk">\{sub\}<\/small> : null\}/);
  assert.match(d, /import \{ JobLabel, jobOf \} from "\.\/job-label";/);
  assert.match(d, /<JobLabel job=\{pmJob\} who=\{pm\.who\} \/>/);
  assert.ok(d.indexOf("pm = rows.find((r) => r.pm)") < d.indexOf("const pmJob ="), "pm 을 정한 뒤에 pmJob");
  assert.match(css, /\.nm-bd-ab \.cell > \.sk-lab, \.nm-bd-org-pm \.sk-lab \{ display:inline-flex;/);
});

test("계정 칸 그록 = 클로드와 같은 꼴", () => {
  assert.equal(acctTag("그록 이슬 외 5"), "G·N");
  assert.equal(acctTag("그록 루미"), "G·H");
  assert.equal(acctTag("naver"), "C·N");
});

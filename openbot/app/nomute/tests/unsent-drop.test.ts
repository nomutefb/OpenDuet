// 안 보내진 글 = ↻ 다시 보내기(75%) + 옆 X 지우기(형 11-20 14:00 dm-sia 시아 옮김 「그리고 이렇게 한번 뜨면 다시 보내기가 안되서 삭제를 해야되네, 옆에 x도 있어야할듯. 그리고 다시 보내기 크기 75%로 하고, 옆에 x도있어야할듯.」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fixture } from "./attachment-fixture.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const tick = () => new Promise((r) => setTimeout(r, 0));

test("실패한 글만 지워짐 · 지우면 줄에서 빠지고 다시 보내기도 0", async () => {
  const f = fixture([]);
  let fail = true, sent = 0;
  f.state.later("a", "/방제 이거는", async () => { sent++; if (fail) throw new Error("400"); });
  await tick(); await tick();
  const [w] = f.state.waitingFor("a");
  assert.equal(w.failed, true);
  f.state.dropText(w.id);
  assert.equal(f.state.waitingFor("a").length, 0);
  fail = false; f.state.retryText(w.id); await tick();
  assert.equal(sent, 1, "지운 글은 다시 안 감");
});

test("보내는 중인 글은 X 로 안 지워짐", async () => {
  const f = fixture([]);
  let open: () => void = () => {};
  f.state.later("a", "글", () => new Promise<void>((r) => { open = r; }));
  const [w] = f.state.waitingFor("a");
  f.state.dropText(w.id);
  assert.equal(f.state.waitingFor("a").length, 1);
  open(); await tick(); await tick();
});

test("화면 = ↻ 12px(16 의 75%) + X 옆 · 누르는 자리 넉넉히", () => {
  const ui = rd("../ui/attachment-recovery.tsx"), css = rd("../ui/attachment-up.css");
  assert.match(ui, /onDrop=\{\(\) => state\.dropText\(item\.id\)\}/);
  assert.match(ui, /className="nac-again nac-drop" onClick=\{onDrop\} aria-label="못 보낸 글 지우기"/);
  assert.match(css, /\.nac-again \.nac-redo \{ width:12px; height:12px; display:block; \}/);
  assert.match(css, /\.nac-fail \.nac-again \{ padding:8px; margin:-6px 0; \}/);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { linuxDesk, manualOnLinux } from "../data/poll-linux.ts";

const VM = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36";
const PHONE = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36";
const CROS = "Mozilla/5.0 (X11; CrOS x86_64 15000.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36";

test("리눅스 데스크톱만 수동(형 11-09 「보는 것도 리눅스면 그건 수동이여야하고」) · 안드로이드 폰 · 맥 · 크롬북 = 그대로", () => {
  assert.equal(linuxDesk(VM), true);
  assert.equal(linuxDesk(PHONE), false);
  assert.equal(linuxDesk(MAC), false);
  assert.equal(linuxDesk(CROS), false);
});

test("리눅스면 focusManager 를 「안 봄」으로 못 박음 · 아니면 손 0", () => {
  const calls: string[] = [];
  const fm = { setEventListener: () => { calls.push("listen"); }, setFocused: (v?: boolean) => { calls.push("focused:" + v); } };
  assert.equal(manualOnLinux(fm as never, VM), true);
  assert.deepEqual(calls, ["listen", "focused:false"]);
  calls.length = 0;
  assert.equal(manualOnLinux(fm as never, MAC), false);
  assert.deepEqual(calls, []);
});

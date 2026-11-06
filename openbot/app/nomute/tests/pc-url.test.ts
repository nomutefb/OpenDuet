import assert from "node:assert/strict";
import { test } from "node:test";
import { tailnetUrl } from "../ui/pc-url.ts";

test("제어권 가져오기 주소 = 테일넷 안만(형 11-06 · 뜸 넘김)", () => {
  assert.equal(tailnetUrl("https://eyes.tail46034f.ts.net/vnc.html"), "https://eyes.tail46034f.ts.net/vnc.html");
  assert.equal(tailnetUrl("http://100.104.110.86:6080/vnc.html"), "http://100.104.110.86:6080/vnc.html");
  for (const bad of ["http://eyes.tail46034f.ts.net/", "https://evil.example.com/", "https://ts.net.evil.com/", "https://u:p@eyes.tail46034f.ts.net/", "http://100.63.0.1/", "http://192.168.0.5/", "javascript:alert(1)", "", null, undefined])
    assert.equal(tailnetUrl(bad), "", String(bad));
});

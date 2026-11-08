// 링크 카드 거름(빠르 11-09 · 뎅 11-08 23:05 [찾음] ⑦ · 봄 배분 10)
import assert from "node:assert/strict";
import { test } from "node:test";
import { isTailnetHost } from "../ui/tailnet-host.ts";

test("isTailnetHost = *.ts.net(스킴·포트 무관) · 100.64/10 만 · 밖 주소·깨진 값 = 아님", () => {
  for (const u of ["https://lxa.tail46034f.ts.net:8443/vnc.html", "http://fast.tail46034f.ts.net/x", "http://100.104.248.46:6080/vnc.html", "https://100.127.255.255/"]) assert.ok(isTailnetHost(u), u);
  for (const u of ["https://n.news.naver.com/x", "https://ts.net.evil.com/", "http://100.128.0.1/", "http://100.63.0.1/", "", "not a url", null]) assert.ok(!isTailnetHost(u), String(u));
});

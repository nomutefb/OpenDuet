// 묶음 카드 「뜸 공유」(형 11-21 05:08 dm-sia 시아 옮김 「이 올림 버튼 / 뜸 공유 로 변경해주고 누르면 게이지차고 체크 후 뜸방으로 창이 이동되게해주라 채팅 전송완료와 함께」 · 「당연히 저 채팅 요약본하고 원문은 같이 공유되야함」)
//   + 넘침(형 05:07 「넘어가는 문제해결좀」 · 공식 자료 칸 긴 낱말)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseBundle, isBundleText } from "../ui/bundle.ts";
import { shareKey, shareText } from "../ui/bundle-share.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const RAW = ["[묶음 s1]", "제목: 수학자 주장", "개요:", "- 하나", "- 둘", "IG:", "```text", "캡션 몸", "```", "주소: https://example.com/a"].join("\n");

test("뜸 공유 글 = 요약본(묶음 몸 통째) + 원문(공식 자료 누가 · 주소 · 한글 · 원문) · 뜸 방에서 다시 카드로 안 그려짐", () => {
  const b = parseBundle(RAW)!;
  const t = shareText(b, RAW, [{ stem: "s1", url: "https://alpo.ge/lean.tar.gz.part01", who: "레반트 알푀게", orig: "Remark on the proof\nline two", ko: "증명에 대한 메모", opened: true }]);
  assert.ok(t.startsWith("[뜸 공유] 수학자 주장\n"));
  assert.ok(!isBundleText(t), "첫 줄이 [묶음 …] 이 아님");
  for (const s of ["제목: 수학자 주장", "- 하나", "캡션 몸", "주소: https://example.com/a", "누가: 레반트 알푀게", "주소: https://alpo.ge/lean.tar.gz.part01", "한글: 증명에 대한 메모", "원문:\nRemark on the proof\nline two"]) assert.ok(t.includes(s), s);
  assert.ok(!t.includes("[묶음 s1]"));
});

test("글 열쇠 = 카드마다 고정 24자(다시 눌러도 뜸 방엔 한 번)", () => {
  assert.equal(shareKey("1795204142426-43fdd7"), shareKey("1795204142426-43fdd7"));
  assert.equal(shareKey("1795204142426-43fdd7").length, 24);
  assert.notEqual(shareKey("1795204142426-43fdd7"), shareKey("1795204142427-43fdd7"));
});

test("단추 = 「뜸 공유」(올림 자리) · 게이지 → 뜸 1:1 에 보냄 → ✓ 뒤 뜸 방으로 · 넘침 = 카드 안에서 꺾임", () => {
  const c = rd("../ui/bundle-card.tsx"), css = rd("../ui/bundle-card.css"), chat = rd("../ui/office-chat.tsx");
  assert.match(c, /go=\{\(\) => press\("up"\)\} done=\{\(\) => pressed\("up"\)\}>뜸 공유<\/GoButton>/);
  assert.doesNotMatch(c, />올림</);
  assert.match(c, /office\(`rooms\/\$\{encodeURIComponent\(room\)\}\/messages`, \{ method: "POST", body: JSON\.stringify\(\{ text: shareText\(b, raw, srcs\), client_id: shareKey\(id\) \}\) \}\)/);
  assert.match(c, /if \(a === "up"\) void goDdeum\(\);/);
  assert.match(c, /pmRoomId\(DDEUM, /);
  assert.match(chat, /<BundleCard b=\{bundleOf\(m\)!\} id=\{m\.id\} srcs=\{c\.srcs\?\.get\(bundleOf\(m\)!\.stem\)\} raw=\{String\(m\.text \|\| ""\)\} \/>/);
  assert.match(css, /\.nm-bdl \{ min-width:0; overflow-wrap:anywhere; \}/);
});

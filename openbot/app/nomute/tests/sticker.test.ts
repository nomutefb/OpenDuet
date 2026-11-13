// 움짤 스티커 한 줄 표지(형 11-12 12:17 · 뜸)
import assert from "node:assert/strict";
import test from "node:test";
import { PACKS, STK_TMP, dropStickerTwins, stickerMark, stickerOf, stickerText, stickerUrl } from "../ui/sticker-logic.ts";
import { readFileSync } from "node:fs";

test("「[스티커 이름 상황]」 한 줄 = 움짤 · 그 밖 = 그냥 글", () => {
  const s = stickerOf("[스티커 빠르 좋아]");
  assert.equal(s && stickerUrl(s.pack, s.item), "/office/sticker/fast/joy.gif");
  assert.equal(stickerOf(" [스티커 봄 고마워] ")?.pack.id, "bom");
  assert.equal(stickerOf("[스티커 뜸 해냈다]")?.item.id, "done");
  assert.equal(stickerOf("[스티커 뜸 해뜸]")?.item.id, "rise");
  assert.equal(stickerOf("[스티커 빠르 좋아] 고마워"), null, "다른 글이 붙으면 그냥 글");
  assert.equal(stickerOf("[스티커 없는애 좋아]"), null);
  assert.equal(stickerText(PACKS[0], PACKS[0].items[1]), "[스티커 빠르 고마워]");
});

test("내 움짤 옆 표 — 보내는 중(이 탭 임시 글) = wait · 서버 글 = sent(라임 ✓ · 형 11-12 12:50)", () => {
  assert.equal(stickerMark(STK_TMP + "abc"), "wait");
  assert.equal(stickerMark("1794455394894-46a9df"), "sent");
  assert.equal(stickerMark(undefined), "sent");
});

test("보내는 중 움짤 + 진짜 글이 같이 있으면 하나만(형 11-12 13:46 「2개로 순간적으로 보인다」)", () => {
  const t = "[스티커 뜸 고마워]";
  const tmp = { id: STK_TMP + "x", ts: 1000, kind: "human", text: t };
  const real = { id: "1001-a", ts: 1500, kind: "human", text: t };
  assert.deepEqual(dropStickerTwins([tmp, real]).map((m) => m.id), ["1001-a"]);
  assert.deepEqual(dropStickerTwins([tmp]).map((m) => m.id), [tmp.id], "진짜 오기 전 = 임시 그대로");
  assert.deepEqual(dropStickerTwins([tmp, { ...real, text: "[스티커 뜸 좋아]" }]).length, 2, "다른 움짤 = 둘 다");
  assert.deepEqual(dropStickerTwins([tmp, { ...real, ts: 999_999 }]).length, 2, "1분 넘은 옛 같은 움짤 = 남의 것");
});

test("움짤 묶음 = 빠르 · 봄 · 뜸 + 번개 · 시아 · 깃 · 챙 · 카리나(빼꼼) · 형(선글라스) · 나팔꽃(나팔) · 온(형 11-12 17:28 · 17:29 · 17:35 · 18:34 · 18:39)", () => {
  assert.deepEqual(PACKS.map((p) => p.name), ["빠르", "봄", "뜸", "번개", "시아", "깃", "챙", "카리나", "형", "나팔꽃"]);
  const k = PACKS.find((p) => p.id === "karina")!, h = PACKS.find((p) => p.id === "hyung")!;
  assert.equal(stickerOf("[스티커 카리나 빼꼼]")?.item.id, "peek");
  assert.equal(stickerOf("[스티커 형 선글라스]")?.pack.id, "hyung");
  assert.equal(stickerUrl(k, k.items[0]), "/office/sticker/karina/peek.gif");   // 카리나 = 셋(빼꼼 맨 앞 · 형 11-13 08:06)
  assert.equal(stickerUrl(h, h.items[5]), "/office/sticker/hyung/cool.gif");
  assert.equal(stickerOf("[스티커 나팔꽃 이불]")?.item.id, "ibul");   // 형 11-13 08:03 나팔꽃 = 이불 하나
  assert.equal(stickerOf("[스티커 온 좋아]"), null);   // 형 11-13 08:03 그록봇 움짤 뺌
  assert.equal(stickerOf("[스티커 여울 윙크]"), null);   // 형 11-13 06:55 「여울 관련된 gif는 안뜨게 없애줘」
});

test("우상단 러너 숫자 = 흰색 · 문제(빨강) 칸만 라임(형 11-12 17:49)", () => {
  const css = readFileSync(new URL("../ui/status-line.css", import.meta.url), "utf8"), tsx = readFileSync(new URL("../ui/status-line.tsx", import.meta.url), "utf8");
  assert.match(css, /\.nm-sl-leds b \{ color: #FFFFFF; \}/); assert.match(css, /\.nm-sl-leds b\.bad \{ color: #CFFF40; \}/);
  assert.match(tsx, /<N v=\{l\.bad\} t="bad" \/>/);
});

test("움짤 판 연 채 뒤로 = 판만 닫힘 · 방 바뀌면 닫힘(형 11-12 21:31 「이모지 킨 채로 뒤로가면 이리됨」)", () => {
  const tsx = readFileSync(new URL("../ui/sticker.tsx", import.meta.url), "utf8");
  assert.match(tsx, /history\.pushState\(\{ \.\.\.\(history\.state \|\| \{\}\), nmStk: 1 \}, ""\)/);
  assert.match(tsx, /addEventListener\("popstate", off\); addEventListener\("hashchange", off\);/);
  assert.match(tsx, /const close = \(\) => \{ if \(\(history\.state as \{ nmStk\?: number \} \| null\)\?\.nmStk\) history\.back\(\); else setOpen\(false\); \};/);
  assert.match(readFileSync(new URL("../ui/shell.tsx", import.meta.url), "utf8"), /document\.querySelector\("\.nm-zoom, \.nm-stk"\)/);   // 형 11-13 02:24 「이모지를 … 올리면 대화창이 목록으로 나가져」
});

test("받기 단추 움직임 = 에디터 「⬇ 전체」 그대로(세기 1/N → 체크 팝 → 1.05초 뒤 원래 · 형 11-13 02:28 · 02:32)", () => {
  const ds = readFileSync(new URL("../ui/dl-seq.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/dl-seq.css", import.meta.url), "utf8");
  const pg = readFileSync(new URL("../ui/pic-grid.tsx", import.meta.url), "utf8"), oc = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  assert.match(ds, /const GAP = 280;/); assert.match(ds, /const BACK = 1050;/); assert.match(ds, /`\$\{st\.k\}\/\$\{n\}`/);
  assert.match(css, /@keyframes nm-dlChkPop \{ 0%\{transform:scale\(\.3\);opacity:0\} 58%\{transform:scale\(1\.3\);opacity:1\} 100%\{transform:scale\(1\);opacity:1\} \}/);
  assert.match(pg, /<DlSeqButton className="nm-zoom-act" hrefs=\{pics\.map\(\(p\) => dl\(p\.src, p\.name\)\)\}/);   // 사진 보기 우상단 = 묶음 다
  assert.match(oc, /<DlSeqButton className="nm-dl" hrefs=\{\[dlOf\(fileUrl\(p\), n\)\]\}/);   // 말풍선 저장
});

test("목록 미리보기 = 줄바꿈 넘어 한 줄로(칸 모자라면 「…」 = truncate · 형 11-13 02:48)", async () => {
  const { previewLine } = await import("../ui/room-list.tsx").catch(() => ({ previewLine: null as unknown as (t: string) => string }));
  const src = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8");
  assert.match(src, /split\("\\n"\)\.map\(\(x\) => x\.trim\(\)\)\.filter\(Boolean\)\.join\(" "\)/);
  if (previewLine) assert.equal(previewLine("응.\n촉은 물어오기만 하고"), "응. 촉은 물어오기만 하고");
});

test("단톡 표지 사진 = 방 꾸미기 「사진」 탭(회의실 · 지정방 · 임시방 다 · 형만 · 형 11-13 05:27)", () => {
  const rl = readFileSync(new URL("../ui/room-look.tsx", import.meta.url), "utf8"), tr = readFileSync(new URL("../ui/temp-room.tsx", import.meta.url), "utf8");
  assert.match(rl, /aria-selected=\{tab === "photo"\} onClick=\{\(\) => setTab\("photo"\)\}>사진<\/button>/);
  assert.match(rl, /<RoomArtRow id=\{r\.id\} look=\{r\.look\} \/>/);   // look = 사진 고르면 아이콘 비움(뎅 11-13 06:54 ⑤)
  assert.match(tr, /export function RoomArtRow\(/);
});

test("화상회의 = 수락 · 거절 표기 · 열림(다 답함 · 60초 · 오프라인 안 기다림 · 챙 셈 밖) · 서랍 「화상회의」(형 11-13 06:4x~06:5x · 명세)", async () => {
  const src = readFileSync(new URL("../ui/meet.tsx", import.meta.url), "utf8"), cp = readFileSync(new URL("../ui/cobrowse-pane.tsx", import.meta.url), "utf8"), sh = readFileSync(new URL("../ui/shell.tsx", import.meta.url), "utf8");
  assert.match(src, /export const SCRIBE = "챙";/); assert.match(src, /export const MEET_WAIT = 60_000;/);
  assert.match(src, /\/\^\\\[수락\\\]\//); assert.match(src, /\/\^\\\[거절\\\]\//);
  assert.match(cp, /<MeetDock meet=\{meet\}/); assert.match(cp, />회의 시작<\/button>/);
  const tb = readFileSync(new URL("../ui/tab-bar.tsx", import.meta.url), "utf8");   // 들머리 둘로(형 11-13 09:21 「그냥 웹 브라우저랑, 화상 채팅방이랑 구분해주라」) = 「브라우저」(회의 0) · 「화상회의」 고정 탭 + 제 아이콘
  assert.match(tb, /<MeetIcon \/><span className="nm-tab-nm">화상회의<\/span>/); assert.match(tb, /<CobrowsePane mode="browser"/); assert.match(tb, /<CobrowsePane mode="meet"/);
  assert.match(cp, /meet = isMeet \? meet0 : null/);
  assert.match(sh, /\{ id: "meetlog", label: "화상회의"/);
  assert.match(src, /office\(`meetlog\/\$\{encodeURIComponent\(meet\.id\)\}`, \{ method: "POST"/);
});

test("움짤 = 카리나 셋 · 자주 쓰는 10개 맨 앞 · 칸 작게(형 11-13 08:06 · 08:07)", async () => {
  const k = PACKS.find((p) => p.id === "karina")!;
  assert.deepEqual(k.items.map((x) => x.id), ["peek", "joy", "thanks"]);
  const { freqTop } = await import("../ui/sticker-logic.ts");
  const top = freqTop({ "fast/joy": 3, "bom/think": 5, "eyes/rise": 1 });
  assert.deepEqual(top.map((x) => `${x.pack.id}/${x.item.id}`), ["bom/think", "fast/joy", "eyes/rise"]);
  assert.match(readFileSync(new URL("../ui/sticker.css", import.meta.url), "utf8"), /minmax\(62px, 1fr\)/);
});

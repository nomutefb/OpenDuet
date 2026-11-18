// 방 사람 수 = 한 셈(멤버 + 형) — 방 안 머리 · 대화 목록 · 방 정보가 같은 숫자(형 11-16 19:42 dm-bom 「단톡방 안에서는 5라고 뜨는데 외부에선 4라고 떠.」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { type OfficePerson, type OfficeRoom, hyungLeft, roomHeadCount, roomLeftSet } from "../data/office.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const bots = ["봄", "시아", "구름", "빠르"].map((who) => ({ who, kind: "bot" }) as unknown as OfficePerson);
const room = (x: Partial<OfficeRoom>) => ({ id: "tmp-1", name: "봄 연구소", ...x }) as OfficeRoom;

test("셈 = 든 봇 + 형 1 · 1:1 · 접수처 · 메모 · 요약실 · 빈 방 = 0", () => {
  assert.equal(roomHeadCount(room({ members: ["봄", "시아", "구름", "빠르"] }), bots), 5);   // 형이 본 방: 멤버 넷 + 형 = 5(목록은 4 였음)
  assert.equal(roomHeadCount(room({ id: "all", members: ["봄"] }), bots), 2);
  assert.equal(roomHeadCount(room({ id: "all" }), bots), 5);   // 멤버 칸이 없는 옛 회의실 = 봇 전부 + 형
  assert.equal(roomHeadCount(room({ members: [] }), bots), 0);
  assert.equal(roomHeadCount(room({ with: "봄" }), bots), 0);
  for (const id of ["repair", "memo", "summary"]) assert.equal(roomHeadCount(room({ id, members: ["봄"] }), bots), 0);
});

// 남은 사람만 셈(형 11-18 20:12 dm-gik 「나 포함 남은 사람만 세야해. 예를들어, 봄, 깃, 나 이렇게 있는데, 깃이 나가면 2인거임.그다음에 봄 나가면 1, 나도 나가면 해체」)
//   서버(editor functions/api/office · 방 목록 답)가 count = 명단 − 나간 이 + 형 · left = 나간 이(형이 나갔으면 「형」도)를 줌 → 앱은 그 숫자를 그대로 · 안 주는 옛 서버 · 회의실 = 옛 셈
test("서버 count 가 오면 그 숫자 — 봄 · 깃 · 형 = 3 → 깃 나감 2 → 봄 나감 1 → 형도 나감 0 · 안 오면 옛 셈", () => {
  const two = ["봄", "깃"];
  assert.equal(roomHeadCount(room({ members: two, left: [], count: 3 }), bots), 3);
  assert.equal(roomHeadCount(room({ members: two, left: ["깃"], count: 2 }), bots), 2);   // 「깃이 나가면 2인거임」(명단은 그대로 둘)
  assert.equal(roomHeadCount(room({ members: two, left: ["깃", "봄"], count: 1 }), bots), 1);   // 「그다음에 봄 나가면 1」
  assert.equal(roomHeadCount(room({ members: two, left: ["깃", "봄", "형"], count: 0 }), bots), 0);   // 기한 없는 방 = 안 닫히고 숫자 없음
  assert.equal(roomHeadCount(room({ members: [], count: 1 }), bots), 1);   // 형만 있는 방 = 1(옛 셈은 0)
  assert.equal(roomHeadCount(room({ members: two, left: ["깃"] }), bots), 3);   // count 없는 옛 서버 = 옛 셈
  assert.equal(roomHeadCount(room({ with: "봄", count: 2 }), bots), 0);   // 1:1 은 그대로 수 없음
  assert.equal(roomHeadCount(room({ id: "memo", count: 4 }), bots), 0);
  assert.equal(roomHeadCount(room({ members: two, count: Number.NaN }), bots), 3);
  assert.deepEqual([...roomLeftSet(room({ left: ["깃", "형"] }))], ["깃", "형"]);
  assert.deepEqual([hyungLeft(room({ left: ["깃", "형"] })), hyungLeft(room({ left: ["깃"] })), hyungLeft(room({}))], [true, false, false]);
});

test("배선 = 방 머리 · 목록 · 방 정보가 따로 세지 않음", () => {
  const top = rd("../ui/top.tsx"), list = rd("../ui/room-list.tsx"), chat = rd("../ui/office-chat.tsx");
  assert.match(top, /<i>\{roomHeadCount\(r, list\)\}<\/i>/);
  assert.doesNotMatch(top, /ids\.length \+ 1/);
  assert.match(list, /tabular-nums text-muted-foreground">\{roomHeadCount\(r, list\)\}<\/span>/);
  assert.doesNotMatch(list, /crew\.length/);
  assert.match(list, /<b>사람 \{crew\}<\/b> · \{names\.join\(" · "\)\}/);   // 방 개요 = 같은 숫자 · 남은 사람 이름만(형 포함 · 나간 형은 빠짐)
  assert.match(list, /crew = roomHeadCount\(r, list\)/);
  assert.match(top, /const n = roomHeadCount\(r, list\), gone = roomLeftSet\(r\), hyOut = hyungLeft\(r\);/);
  assert.match(top, /\{n && !hyOut \? <span className="nm-top-one"><FaceImg id=\{HYUNG_ID\}/);   // 형이 나갔으면 명단에 형 줄 없음
  assert.match(top, /\{inIds\.map\(one\)\}\s*\{outIds\.length \? <span className="nm-top-sec">나감<\/span> : null\}/);   // 나간 이 = 「나감」 아래 따로(있던 칸 글씨 그대로)
  assert.match(chat, /if \(w !== "형" && !back\.has\(w\)\) on\.add\(m\.id\)/);   // 「형이 나갔습니다.」 줄엔 「채팅방으로 초대하기」 없음
});

test("문지기 안내 줄 = 가운데 줄 두 줄 그대로(서버가 줄바꿈으로 줌 · 형 11-18 「문지기를 만들고 나가주세요.」 「(현재 방 잔여 1명)」)", () => {
  const css = rd("../ui/yeta-chat.css"), chat = rd("../ui/office-chat.tsx");
  assert.match(css, /\.ychat \.yev \{[^}]*text-align:center/);   // 가운데 정렬 = 있던 가운데 줄 그대로
  assert.match(css, /\.ychat \.yev > span \{ white-space:pre-line; \}/);   // 줄바꿈이 한 칸으로 뭉개지지 않게
  assert.match(chat, /const evM = \(m: Msg\) => m\.kind === "system" && !!m\.event\?\.kind;/);   // event kind(keeper 포함)가 있는 사무실 줄 = 가운데 줄
  assert.match(chat, /it\.m\.event\?\.kind === "left" && inviteOn\.has\(it\.m\.id\)/);   // 초대 단추는 나감 줄에만(안내 줄엔 없음)
});

test("문지기 안내 첫 줄만 라임 · 괄호 줄은 그대로(형 11-18 「문지기를 < 이거에 라임색만 넣어줘」 「괄호는 라임색 필요없음」)", () => {
  const css = rd("../ui/yeta-chat.css"), chat = rd("../ui/office-chat.tsx");
  assert.match(css, /\.ychat \.yev \.yev-lime \{ font-style:normal; color:var\(--accent, #CFFF40\); \}/);   // 새 색 아님 = 있던 안내 라임
  assert.match(chat, /it\.m\.event\?\.kind === "keeper" \? keeperLine\(it\.m\.text \|\| ""\) : it\.m\.text \|\| ""/);   // 문지기 줄에만
  assert.match(chat, /const \[first, \.\.\.rest\] = text\.split\("\\n"\); return <><i className="yev-lime">\{first\}<\/i>/);   // 첫 줄만 감쌈 · 나머지(괄호 줄)는 맨글
});

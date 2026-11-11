import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// 4번 뉴스 에디터 = 옛 에디터 뉴스 요약 꼴 그대로(형 11-11 09:01 · 09:02 · 13:02 봄 1:1)
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const tsx = rd("../ui/news-editor.tsx"), css = rd("../ui/news-editor.css");

test("맨 위 「지금 뜨는 말」 줄 없음(형 09:02 「상단에 인기검색어 없어도 되고」)", () => {
  assert.ok(!/<Ticker\b/.test(tsx) && !/function Ticker\(/.test(tsx));
  assert.ok(!/nm-ned-tkr/.test(css));
});

test("카드 = 폰도 매체 · 편향 · 민감 줄 · 옛 값(Pretendard · 안쪽 18 · 머리 11 · 제목 15/700 · 막대 7)", () => {
  assert.match(tsx, /<SumCard a=\{a\} lean kind=/);   // 민감 칸 0(형 18:54 「민감 키워드는 없어도 됨 표기 안할게」)
  assert.ok(!/short=\{!wide\}/.test(tsx));
  assert.match(css, /\.nm-ned \.nm-sumc \{ gap:12px; padding:18px; font-family:'Pretendard Variable'/);
  assert.match(css, /\.nm-ned \.nm-sumc-t \{ font-size:15px; font-weight:700; line-height:1\.45; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; \}/);
  assert.match(css, /\.nm-ned \.nm-sumc-prog em \{ height:7px;/);
  assert.ok(!/\.nm-ned \.nm-sumc-prog em \{[^}]*background/.test(css), "막대 회색은 아직 칸만(끝남 라임을 덮지 않게)");
  assert.match(css, /span:not\(\.done\):not\(\.cur\):not\(\.fail\) em \{ background:rgba\(187,188,188,\.7\); \}/);
});

test("요약 요청 = 옛 꼴(글칸 한 장 안 붙여넣기 · 사진 · 링크 · 전송 · 칩 다섯 옛 이름 · 주요는 칩 없이 기본값)", () => {
  const ask = rd("../ui/ask.tsx"), acss = rd("../ui/ask.css");
  assert.match(ask, /className="nm-ask nm-ask-o/);
  assert.match(ask, /placeholder="내용을 입력해주세요"/);
  for (const o of ["24시간 내", "외신 기반", "원본 한정", "AI 미제작", "지식형"]) assert.ok(ask.includes(`o: "${o}"`), o);
  assert.match(ask, /CHIPS\.filter\(\(c\) => c\.k !== "mj"\)/);
  assert.match(ask, /const DEF: Preset = \{ h24: 1, fp: 0, mj: 1, og: 0, noai: 1, know: 0 \}/);   // 보내는 값 그대로
  assert.match(ask, /fetch\("\/api\/submit"/);
  assert.match(acss, /\.nm-ask-o \.nm-ask-box \{ position:relative; display:flex; flex-direction:column; border:1px solid rgba\(255,255,255,\.08\); border-radius:16px; background:rgba\(255,255,255,\.05\); \}/);
});

test("기사 한 장 = 옛 기사 창 글 꼴(소제목 줄임 · Pretendard · 대문자 0 · 링크 강조색)", () => {
  const src = rd("../ui/news-detail.tsx"), ncss = rd("../ui/news.css");
  const m = /export const headOf = (\(t: string\) => [^\n]+);\n/.exec(src);
  assert.ok(m, "headOf 한 줄");
  const headOf = new Function(`return ${m[1].replace(/: string/g, "")}`)() as (t: string) => string;   // tsx 는 node 가 못 읽어 줄째 꺼내 돌림
  assert.equal(headOf("FACT (확인된 사실)"), "Fact"); assert.equal(headOf("INFERENCE (추론·해석)"), "Inference"); assert.equal(headOf("다각도 해석"), "다각도 해석"); assert.equal(headOf("Fact (확인된 사실)"), "Fact"); assert.equal(headOf("Inference (추론·해석)"), "Inference"); assert.equal(headOf("활용 옵션 (콘텐츠화 후보)"), "활용 옵션 (콘텐츠화 후보)");
  assert.match(ncss, /\.nm-nd \.nm-nd-md :is\(p, li\) \{ font-size:14px; font-weight:400; line-height:1\.6; \}/);
  assert.match(ncss, /text-transform:none;/);
  assert.match(ncss, /\.nm-nd \.nm-nd-md ul \{ list-style-position:outside; padding-left:18px; \}/, "점 줄 = 옛 18 · 꺾인 줄 글자 밑으로");
  assert.match(ncss, /\.nm-nd \.nm-nd-md li \{ margin:0; padding:0; \}/, "점 줄 사이 = 옛처럼 붙음");
  assert.match(ncss, /\.nm-nd \.nm-nd-md li::marker \{ color:var\(--nm-nd-h/, "점 = 강조색");
});

test("뉴스 에디터 = 맨 위 넣는 줄 0 · 오른쪽 아래 「요약」 단추 → #/ask · 픽 일 = 요약 요청 「외신 기반」 저절로(형 11-11 14:36 「글 붙여넣기는 없어두대! 우하단에 버튼으로 요약만 잇으면 댐」)", () => {
  const ned = rd("../ui/news-editor.tsx"), ncss = rd("../ui/news-editor.css"), ask = rd("../ui/ask.tsx");
  assert.ok(!/function SendBar\(|<SendBar\b|submitText|링크 · 글 붙여 넣기/.test(ned), "넣는 줄 걷음");
  assert.match(ned, /const items: \[string, string\]\[\] = \[\["\/ask", "뉴스 요약"\], \["\/edtool", "이미지 에디터"\], \["\/edvid", "비디오 에디터"\]\];/, "「+」 펼침 셋(형 19:23)");
  assert.match(ned, /<PlusFan go=\{go\} \/>/);
  assert.match(ncss, /\.nm-ned-plus \{[^}]*position:absolute;[^}]*bottom:calc\(14px \+ env\(safe-area-inset-bottom\) \+ 54px \+ 12px\)/, "아래 막대 위");
  assert.match(ncss, /\.nm-ned-plus\.on \.nm-ned-plus-main svg \{ transform:rotate\(135deg\); \}/);
  assert.ok(!/nm-ned-send|nm-ned-btn/.test(ncss));
  assert.match(ask, /import \{ isForeignUrl \} from "\.\.\/home\/quick-send";/);
  assert.match(ask, /if \(fpHand\) return; const fp = isForeignUrl\(autoUrl\) \? 1 : 0;/);
  assert.match(ask, /if \(c\.k === "fp"\) setFpHand\(true\);/, "손으로 누르면 저절로 멈춤");
});

test("아래 막대 덜 비침 = 바탕 짙게 + 흐림 24(봄 14:52 · 형 「결정 너의 판단에 맡길게」)", () => {
  const nav = rd("../swap/ynav.css");
  assert.match(nav, /html\.dark \.ynav, html\.dark \.nm-split-l \.ynav \{ background:rgba\(19,20,19,\.99\);[^}]*blur\(24px\)/);
  assert.match(nav, /html:not\(\.dark\) \.ynav, html:not\(\.dark\) \.nm-split-l \.ynav \{ background:rgba\(250,250,248,\.98\);/);
});

test("홈 판(형 11-11 18:48~18:51) = 그림 세로 108 · 스레드 · 「N시간 전」 줄 안 · 카드 단추 자리 걷음 · 새 대화 = 머리 없이 보낸 이 옆 수", () => {
  const fp = rd("../home/follow-pulse.tsx"), fcss = rd("../home/follow-pulse.css"), nf = rd("../home/news-feed.tsx"), arr = rd("../home/arrived.tsx");
  assert.match(fp, /const PH = 108;/); assert.match(fp, /H = fill \? tall : PH/);
  assert.match(fp, /get\("th", "threads_data\.json"\)\]/, "스레드 폰에도 받음");
  assert.ok(!/\{fill \? <><i className="nm-pulse-sep"/.test(fp), "TH 칸 = 폰에도");
  assert.match(fp, /<span className="nm-pulse-at">\{ago\(ig\.generated_kst\)\.replace\(\/\^갱신 \/, ""\)\}<\/span>/);
  assert.match(fcss, /\.nm-pulse:not\(\.nm-pulse-fill\) \.nm-pulse-at \{ position:static; margin-left:auto;/);
  assert.ok(!/SEND_ROOM/.test(nf.replace(/\/\/.*$/gm, "")), "카드 아래 단추 자리 걷음");
  assert.ok(!/:not\(:has\(\.article-media\)\)\{height:auto/.test(nf), "사진 없는 카드도 칸 높이");
  const code = arr.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  assert.ok(!/도착한 메시지\{|>도착한 메시지</.test(code) && !/새로 온 글 없음/.test(code), "머리 · 없음 글 걷음");
  assert.match(arr, /className="nm-arr-n"/);
});

test("뉴스 에디터 목록 = 알약 줄 · 찾기 걷음 · 카드 lean(형 11-11 18:51~18:53)", () => {
  const ned = rd("../ui/news-editor.tsx"), sd = rd("../ui/summary-desk.tsx");
  assert.ok(!/nm-ned-chips|nm-ned-find|CATS/.test(ned));
  assert.match(sd, /\{dg \|\| lean \? null : "보도 "\}/);
  assert.match(sd, /\{scr && !lean \?/);
  assert.match(sd, /\{short \|\| lean \? null : <div className=\{`nm-sumc-kv/, "카드 세 줄 = 매체 · 편향 줄 0(형 19:22)");
  assert.match(sd, /lean && \(media \|\| bias\) \? <span className="r src">/);
  assert.match(sd, /kind && !\(lean && kind !== "brk"\)/);
});

test("요약 대기열 = 요청 → 요약 → 프롬프트 → 카드 가로 네 칸 · 요청한 차례대로 · 도는 칸 줄무늬(형 11-11 18:55 「… 순서대로 진행상황」)", () => {
  const tp = rd("../ui/task-panel.tsx"), tc = rd("../ui/task-panel.css"), sc = rd("../ui/summary-desk.css");
  assert.match(tp, /\[\["요청", "done", ""\], \["요약",/);
  assert.match(tp, /const rows = \[\.\.\.qs\]\.sort\(\(a, b\) => \(a\.it\.t \|\| 0\) - \(b\.it\.t \|\| 0\)\)/);
  assert.match(tp, /`\$\{pos\}번째`/);
  assert.match(tc, /\.nm-tk-prog \.run em \{ background:repeating-linear-gradient\(/);
  assert.match(sc, /\.nm-sumc-prog \.cur em \{ background:repeating-linear-gradient\(/);
});

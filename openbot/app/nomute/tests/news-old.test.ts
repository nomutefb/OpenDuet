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
  const sdc = rd("../ui/summary-desk.css");   // 카드 꼴 = 한 벌(PC DIGEST 같이 · 11-11 22:09)
  assert.match(rd("../home/news-summary.tsx"), /<SumCard a=\{a\} lean kind=/, "DIGEST = 같은 카드");
  assert.match(tsx, /<SumCard a=\{a\} lean kind=/);   // 민감 칸 0(형 18:54 「민감 키워드는 없어도 됨 표기 안할게」)
  assert.ok(!/short=\{!wide\}/.test(tsx));
  assert.match(sdc, /\.nm-sumc\.lean \{ gap:12px; padding:18px; font-family:'Pretendard Variable'/);
  assert.match(sdc, /\.nm-sumc\.lean \.nm-sumc-t \{ font-size:15px; font-weight:700; line-height:1\.45; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; \}/);
  assert.match(sdc, /\.nm-sumc\.lean \.nm-sumc-prog em \{ height:7px;/);
  assert.ok(!/\.nm-sumc\.lean \.nm-sumc-prog em \{[^}]*background/.test(sdc), "막대 회색은 아직 칸만(끝남 라임을 덮지 않게)");
  assert.match(sdc, /span:not\(\.done\):not\(\.cur\):not\(\.fail\) em \{ background:rgba\(187,188,188,\.7\); \}/);
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
  assert.match(ncss, /\.nm-ned-plus \{[^}]*position:absolute;[^}]*right:14px; bottom:calc\(var\(--duet-tab-space,86px\) \+ 8px\)/, "대화방 목록 「+」 자리 그대로");
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
  assert.match(fp, /<span className="nm-pulse-at">\{ago\(ig\.live_followers\?\.at \|\| ig\.generated_kst\)\.replace\(\/\^갱신 \/, ""\)\}<\/span>/);
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

test("요약 중 카드 = 검은 판 0 · 「요청」 단계 0 · 본보기 세로 진행 줄 · 차례대로 · 실패 「취소」(형 11-12 06:17 · 06:18 · 07:55 · 07:56)", () => {
  const tp = rd("../ui/task-panel.tsx"), tc = rd("../ui/task-panel.css"), sc = rd("../ui/summary-desk.css"), ne = rd("../ui/news-editor.tsx"), ns = rd("../home/news-summary.tsx");
  assert.ok(!/\["요청", "done"/.test(tp), "「요청」 단계 0");
  assert.match(tp, /const bars: \[string, string\]\[\] = \[\["요약",/);
  assert.match(tp, /const rows = \[\.\.\.qs\]\.sort\(\(a, b\) => \(a\.it\.t \|\| 0\) - \(b\.it\.t \|\| 0\)\)/);
  assert.match(tp, /replace\(\/https\?:/, "제목 주소 글자 0");
  assert.match(tp, />취소 하시겠습니까\?</);
  assert.ok(!/nm-tasks-head/.test(tp), "검은 판 머리 0");
  assert.match(tc, /\.nm-tk2-log li\.cur span \{ background:linear-gradient/);
  assert.match(sc, /\.nm-sumc-prog \.cur em \{ background:repeating-linear-gradient\(/);
  assert.match(ne, /onDismiss=\{qDrop\}/); assert.match(ns, /onDismiss=\{\(it\) => \{ qfSeenOne\(it\.id\)/);
});

test("홈 차트 = 보라 노출 선 폰에도 · 「N분 전」 숫자 줄 가운데(형 11-11 20:06)", () => {
  const fp = rd("../home/follow-pulse.tsx"), fcss = rd("../home/follow-pulse.css");
  assert.ok(!/\{fill && vv\.length \?/.test(fp)); assert.match(fp, /\{vv\.length \? \(\(\) => \{/);
  assert.match(fcss, /\.nm-pulse:not\(\.nm-pulse-fill\) \.nm-pulse-chart \.vw path \{ stroke:#AC5CFF;/);
  assert.match(fcss, /\.nm-pulse-at \{ position:static; margin-left:auto; align-self:center;/);
});

test("HOT ISSUE 「전송」 = 단추 안 차오름 → ✓ · 위 알약 0(형 11-12 06:15)", () => {
  const nl = rd("../home/news-list.tsx"), nc = rd("../home/news-list.css");
  assert.ok(!/nm-nlist-sent/.test(nl) && !/^\.nm-nlist-sent \{/m.test(nc), "위 알약 걷음");
  assert.match(nl, /x\?\.k === "ok" \? "✓" : x\?\.k === "bad" \? "다시" : "전송"/);
  assert.match(nc, /\.run::before \{ content:""; position:absolute; inset:0;/);
});

test("RUNNER 게이지 = 15% 크게 · 안 글자 25% 크게 · 글자 아래로(형 11-11 22:09 · 11-12 06:14)", () => {
  const tg = rd("../runner/tick-gauge.tsx"), rg = rd("../ui/runner-gauges.tsx"), rc = rd("../ui/runner-gauges.css");
  assert.match(tg, /scale\(\$\{textScale\}\)/); assert.match(rg, /dyText=\{9\} textScale=\{1\.25\}/);
  assert.match(rc, /\.nm-rgx-host \.nm-rg-gauge \{ max-height:122px; \}/);
});

test("홈 카드 ✓ = 폰도 카드 세로 가운데 · 오른쪽 선에 반쯤 걸침(형 11-12 07:47)", () => {
  const sc = rd("../home/send-button.css"), sb = rd("../home/send-button.tsx");
  assert.match(sc, /\.nm-send-dock\[data-fit\] \{ top:calc\(var\(--nm-card-y\) \+ var\(--nm-card-h\) \/ 2\); bottom:auto; right:max\(4px, calc\(var\(--nm-card-r\) - 22px\)\); transform:translateY\(-50%\);/);
  assert.match(sb, /--nm-card-y/);
});

test("무지개 단추 판 = 그 자리에서 · 「말풍선」 · R G B 작게(형 11-12 08:37) · 안 고른 기기 = 어두운 판(형 08:33)", () => {
  assert.match(rd("../ui/color-pick.tsx"), /<PickTop label="말풍선"/);
  assert.match(rd("../ui/being-card.css"), /\.ypc--being \.ypc-pop \{ position: absolute; top: 22px; right: 22px;/);
  assert.match(rd("../ui/yeta-chat.css"), /\.ncp-rgb \.ncp-f input \{ padding:6px 2px; font-size:13px; text-align:center;/);
  assert.match(rd("../index.html"), /choice === null \|\|/);
  assert.match(rd("../../src/lib/theme.ts"), /return "dark";/);
});

test("테일스케일 연결표 = 게이지 기기는 손 올림만 · 게이지 밖(회사 · 그록)만 한 줄(형 11-12)", () => {
  const rg = rd("../ui/runner-gauges.tsx"), tt = rd("../ui/tailnet-table.ts");
  assert.match(rg, /title=\{\(TAIL_OF_GAUGE\[h\.label\] \|\| \[\]\)\.map\(\(d\) => tailTitle\(d, tail\)\)/);   // 켜짐 = 서버 runners.tailnet(번개 11-12 17:00)
  assert.match(rg, /queryKey: \["nomute", "schedule"\]/);
  assert.match(tt, /on === true \? "● 켜짐" : on === false \? "○ 꺼짐" : ""/);
  assert.ok(!/className="nm-rgx-tail"/.test(rg), "러너 메인엔 테일넷 줄 0(형 11-12 16:20 「러너 메인에 테일스케일이 나올필요는없음」)");
  assert.match(tt, /100\.103\.55\.120/); assert.match(tt, /100\.93\.212\.35/);
  assert.ok(!/group: "(WIN|MAC|Lx)/.test(tt), "게이지 기기는 줄로 또 안 넣음");
});

test("러너 칸 간격 · 아래 막대 꺼진 픽토그램 흰색(형 11-12 16:34 · 16:41)", () => {
  const rg = rd("../ui/runner-gauges.tsx"), tg = rd("../runner/tick-gauge.tsx"), sh = rd("../ui/shell.css");
  assert.match(rg, /const PEB_LIFT = 6;/); assert.match(rg, /fb - PEB_LIFT - peb/);
  assert.match(rg, /textScale=\{1\.25\} spread=\{3\}/);
  assert.match(tg, /y=\{TY - 18\}/);   // G 줄은 그대로(위로 안 올림)
  assert.match(tg, /y=\{TY - 6 \+ S1\}/); assert.match(tg, /y=\{TY \+ 15\.5 \+ S2\}/);
  assert.match(sh, /\.nm-split-l \.ynav button \{ height:40px; padding:0 17px; font-size:var\(--fs-xs\); border-radius:var\(--r-pill\); color:#FFFFFF; \}/);
});

test("다음 창 모델 · 노력도 = 작동 표 몸 줄 끝 칸 둘 · 형만 고름 · 저장 m/profile/nextwin(형 11-12 16:17)", () => {
  const sb = rd("../ui/status-board.tsx"), nw = rd("../ui/next-win.tsx");
  assert.match(sb, /<span>다음 창<\/span>/);
  assert.match(sb, /\{b \? <NextWinCells who=\{r\.name\} \/> : <td colSpan=\{2\}/);
  assert.match(nw, /"profile\/nextwin"/); assert.ok(!/"m\/profile\/nextwin"/.test(nw), "형 브라우저 = 사람 문(m\/ = 봇 열쇠 401)");
  assert.match(nw, /me\?\.kind === "human"/);
  assert.match(nw, /who === "봄" \? \{ model: "claude-fable-5-2", effort: "medium" \}/);
});

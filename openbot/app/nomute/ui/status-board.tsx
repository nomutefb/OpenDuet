// 러너 층 = 계정 상태 + 애들 × 연결 한 표(옛 「작동 표」 · 메뉴 4번 · 형 11-05 「기능들이 정상 작동하는지 … 한눈에 볼 수 있는 표」)
//   형 11-19 다시 짬: 「cli연결하고 애들 x연결하고 통합시켜줘. 하나로.」 · 「러너길은, 이미 스케줄러에 포함되어야하는데 또 나올필요없고」 · 「몸 지도도, 각 애들 동그라미 누르면 나오는 지도에 … 거기에 녹이면됨」
//     「시간축 수집도 > 스케줄러에 귀속시키면됨」 · 「자세히 칸 목록안에잇는거 모든거를 그냥 다 위에 다 반복안되게 귀속시켜 일일이 말안해도」
//   그래서 여기 남는 것 = ① 계정 상태 ② 애들 × 연결(./crew-table.tsx · 계정 · 연결 / 일기 · 교대 / 손) 둘뿐
//     · 러너 길 · 수집 · 썸네일 기준 → 스케줄 배선(./sched-collect.tsx · 점검 카드 · 나무)  · 하드웨어 · 온도 · 도커 · SSH · 백업 · GitHub 러너 → 애 카드 몸 칸(./body-chips.tsx)
//     · 「봇 연결」 줄 → 맨 위 손 판(얼굴을 누르면 그 애 것)  · 「그록봇 토큰」 → 그록 애 카드(./bot-manage.tsx)  · 다음 창 모델 · 노력도 → 애 카드(같은 값 한 곳)
//   자료 = GET status 한 번(./status-q.ts · 60초 · 지난 값 먼저) · 없으면 GET bots 로 이름 줄만
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { useMemo, useState } from "react";
import { office } from "../data/office";
import { acctOrder, acctTag, leftKo, payEndAt, staleObs, weekCell, weekPace } from "../data/acct-time";
import { type Body, bodiesOf } from "../data/bodies";
import { type HealthSt, HEALTH_KO, StatusDot, agoKo } from "./sched-bits";
import { ACT_KO, actSum } from "./activity-sum";
import { ActivityBoard, ActivityDots } from "./activity-board";
import { CrewTable } from "./crew-table";
import { CliBind } from "./cli-bind";   // 애들 × 연결 아래 = R2 에 닿는 손 · 그록 계정 귀속(형 11-19 「러너에 들어가야하고 위 내용 들어가야함」 · 옛 「CLI 연결」 표 아래에 있던 것을 표와 같이 이 카드로)
import { type Band, type BotRoutine, type SRow, bandCount, bandDiary, bandHands, bandLink, cliNoteItems, crewOrder, grokDiaryRows } from "./crew-table-logic";
import { type Cell, type CliItem, type StatusData, type StatusRow, catRows, hostOf, statusOpts, worst } from "./status-q";
import "./sched-status.css";
import "./yeta-settings.css";
import "./drop-motion.css";
import "./status-board.css";
export { cliNoteItems, diaryCell } from "./crew-table-logic";
export type { StatusCat, StatusRow } from "./status-q";

const movingOf = (b: Body) => (/^이사/.test(b.moving || "") ? b.moving! : `이사 중${b.moving ? ` · ${b.moving}` : ""}`);
/** 칸 안 글도 영어(같은 말 「칸 안 「확인 안 됨」도 영어」) · 일부러 꺼 둔 칸 = Off */
const cliNone = (note?: string) => (/꺼 둠/.test(note || "") ? "Off" : "Not checked");
const msOf = (v: unknown) => (typeof v === "number" ? v : v ? Date.parse(String(v)) || 0 : 0);
/** 러너 화면에 줄을 세우는 아이 = 클로드 일곱(형 11-10 07:5x · 13:15 봄 1:1 「러너에 온도 대시보드 뜨는거 갱신해주고 러너 다 갱신」 · 조약돌 ./runner-gauges.tsx PEB 와 같은 일곱) */
const RUN_WHO = new Set(["봄", "시아", "뎅", "빠르", "번개", "뜸", "깃", "윈터"]);   // + 윈터(형 11-18 18:37 임시방 「그리고 윈터 초대도 안돼. 그렇다는거는 지금 설정값들 다 윈터를 못따라가고 있다는거야 (동기화랑 설정 적용도 안된다는 소리) 다 확인해」 · 깃 18:52 나눔 · 윈터 = 윈A 클로드 몸 · 깨움 러너 nomute-wake-winter · 앞 판 11-10 「지피티 봇은 넣을 필요는 없음」 때 윈터는 옛 지피티 자리였음)
/** 혼자 못 넘어가는 창(셀프 넘김 「–」) — 형 11-18 20:39 dm-cloud 「오케 그러면 클라우드세션은 셀프로 못넘어가는거를 러너에 표기하게 해놔야해. 이거를 보완을 해줘야된다는 뜻이거든.」 · 20:40 「셀프 넘김에 - 표기가 따로 있어야한다는거야. 중요해. 왜냐면 누군가 서브를 안해주면 꺼진다는뜻이니까」 · 구름 = 클라우드 세션 = 계정을 혼자 못 바꿈(봄 · 깃이 넘겨 줌) */
/** 교대 줄은 없지만 혼자 넘어가는 이(윈터 = 윈A 윈도우 갈래 · 깃 11-18 20:50 pair-cloud-gik 「윈터 = 점(혼자 넘어감 · 20:16 윈A 18번 윈도우 갈래로 g→m 실물 · 숨김 · 원격 붙음)」) */
const SELF_OK = ["윈터"];
/** 혼자 못 넘어가는 창을 챙기는 이(「챙김」 칸) — 형 11-19 01:09 밥상(깃이 옮김) 「자력으로 못깨니까 클라우드세션은」 「챙겨줘야하고 이거 러너에 반영하라고 21시 경에 얘기햇잖아」 「그래야 표시되서 안다고」 · 구름 = 봄이 맥 기본 칸 계정을 바꿔 새 창을 엶(형 00:32 dm-cloud 「앞으로 그거 봄이 자동 하게뜸」) · 구름 지킴의 [도움] 은 깃이 받음 */
export const CARE: Record<string, string> = { 구름: "봄 · 깃" };
export const NO_SELF: Record<string, string> = { 구름: "클라우드 세션 · 계정을 혼자 못 넘어감 · 누가 넘겨 줘야 함(안 해 주면 꺼짐)" };
type Bot = { who: string; state: string; why?: string; routines?: BotRoutine[] };   // routines = 그록 애 자동화(이름 · 계기 · 켜짐 · 마지막 실행 · 서버 _bots.js 가 bot_routines.json 그대로)
const botSt = (s: string): HealthSt => (s === "awake" || s === "asleep" ? "ok" : s === "dead" || s === "down" || s === "error" ? "miss" : "unknown");
const BOT_KO: Record<string, string> = { awake: "깨어 있음", asleep: "자는 중(부르면 깸)", unknown: "모름" };
/** 계정 짧은 이름(형 01:25 「2열 2행(ems1130g)」 · 「3영ㄹ 2행(muteno)」) · 네이버 = ems1130n(형 11-07 14:34 「윈터는 ems1130n이야」) */
const acctShort = (x?: unknown) => { const v = x === undefined || x === null ? "" : String(x); return !v ? "" : /@naver\.com$/i.test(v) ? `${v.split("@")[0]}n` : v.includes("@") ? v.split("@")[0] : v; };   // 서버는 숫자 value 도 받음(모루 #2852) → 글자로
const claudeDir = (r: StatusRow) => (r.name.match(/\.claude[\w-]*/) || r.key.match(/\.claude[\w-]*/) || [""])[0];
const dirRank = (d: string) => (d === ".claude" ? 0 : Number((d.match(/spare(\d+)/) || [0, 99])[1]));
const daysKo = (d?: number) => (d === undefined ? "" : d < 1 ? `${Math.max(0, Math.round(d * 24))}시간 남음` : `${Math.floor(d)}일 남음`);

/** GET bots 로 이름 줄만(작동 표 답이 아직 없을 때) */
const botsLocal = (bots?: Bot[]): StatusRow[] => (bots || []).map((b) => ({ key: b.who, name: b.who, st: botSt(b.state), value: BOT_KO[b.state] || b.state, note: b.why }));
/** 정본엔 없지만 제 host 로 몸 보고를 올리는 애(천둥 = thunder) — 서버 hosts 의 by · 그 host 가 계정 줄을 올릴 때만 */
function moreKids(d: StatusData | undefined, bs: Body[]): Body[] {
  const tok = new Set((d?.cats?.find((c) => c.id === "tok_claude")?.rows || []).map(hostOf));
  return (d?.hosts || []).filter((h) => h.by && tok.has(h.host) && !bs.some((b) => b.being === h.by || b.hosts.includes(h.host))).map((h) => ({ being: h.by!, body: h.host, kind: "vm", on: true, hosts: [h.host] }));
}

/** 계정 · 연결 칸 = 서버 tok_claude · tok_gpt · tok_cli 줄을 애마다 칸으로(줄 = 제 몸이 보고하는 애 · 클로드 1~4 = 그 몸 계정 폴더 차례 .claude → spare1 → …)
 *  kids = 몸 정본의 아이 + 정본엔 없지만 제 host 로 보고하는 애(천둥 = thunder · 서버 hosts 의 by) */
function cliRows(kids: Body[], d: StatusData | undefined, bs: Body[]): StatusRow[] {
  const claude = catRows(d, "tok_claude", bs), gpt = catRows(d, "tok_gpt", bs), more = catRows(d, "tok_cli", bs);
  return kids.filter((b) => b.being).map((b) => {
    const mine = (rs: StatusRow[]) => rs.filter((r) => b.hosts.includes(hostOf(r)));
    const cells: Record<string, Cell> = {};
    mine(claude).sort((x, y) => dirRank(claudeDir(x)) - dirRank(claudeDir(y))).slice(0, 4).forEach((r, i) => {
      cells[`c${i + 1}`] = { st: r.st, label: acctTag(r.value) || "—", note: [claudeDir(r), r.value, daysKo(r.left_days), r.st === "ok" ? "" : r.note].filter(Boolean).join(" · ") };
    });
    const g = mine(gpt)[0];
    if (g) cells.gpt = { st: g.st, label: acctShort(g.value) || "붙음", note: [g.value, g.note].filter(Boolean).join(" · ") };
    const moreOf = (id: string) => mine(more).find((x) => x.key.endsWith(`:${id}`)) as (StatusRow & { items?: CliItem[]; checked_at?: unknown; reported_at?: unknown }) | undefined;
    const names = (v?: unknown) => String(v ?? "").split(" · ").map((x) => x.trim()).filter(Boolean);
    const wait: Cell = { st: "unknown", label: "—", note: "재는 중(몸 보고 tok_cli · 뎅·봄)" };
    const r2 = moreOf("r2");
    cells.r2 = r2 ? { st: r2.st, label: acctShort(r2.value).replace(/(\d+)\s*개/, "$1").replace(/\s+\(/, " (").trim() || cliNone(r2.note), note: [r2.value, r2.note].filter(Boolean).join(" · ") } : wait;
    // GitHub = 계정 둘까지 칸 둘(서버 items[n · account · active] · 아직 없으면 value 「a · b」 차례)
    const gh = moreOf("gh"), ghs = gh ? (gh.items?.length ? [...gh.items].sort((x, y) => (x.n || 0) - (y.n || 0)).map((x) => ({ name: x.account || x.name || "", active: x.active })) : names(gh.value).map((name) => ({ name, active: undefined as boolean | undefined }))) : [];
    for (const k of [0, 1]) {
      const a = ghs[k];
      cells[`gh${k + 1}`] = !gh ? wait : a?.name ? { st: gh.st, label: a.name, note: [a.name, a.active ? "active" : "", gh.note].filter(Boolean).join(" · ") } : { st: "unknown", label: k === 0 ? cliNone(gh.note) : "—", note: k === 0 ? gh.note : "" };
    }
    // rclone = 붙은 것 수 · 누르면 줄줄이(이름 · 종류 · 계정 또는 도메인) + 잰 때(형 「0개 누르면 연결된게 촤르르 나오게 하면될듯. 근데 이게 갱신되어야함!」)
    //   새 몸 보고 = value 「N개」 + note 「이름(종류 · 계정 또는 도메인) · …」 · 옛 보고 = value 「이름 · 이름」 · items 가 오면 그것 먼저
    const rc = moreOf("rclone"), rcN = /^(\d+)\s*개/.exec(String(rc?.value ?? ""));
    const rcs: CliItem[] = rc ? (rc.items?.length ? rc.items : rcN ? cliNoteItems(rc.note) : names(rc.value).map((name) => ({ name }))) : [];
    cells.rclone = !rc ? wait : rc.st === "unknown" && !rcs.length ? { st: "unknown", label: cliNone(rc.note), note: rc.note } : { st: rc.st, label: String(rcN ? Number(rcN[1]) : rcs.length), items: rcs, at: msOf(rc.checked_at) || msOf(rc.reported_at), note: [rc.value, rc.note].filter(Boolean).join(" · ") };
    if (b.on === false && !cells.c1) cells.c1 = { st: "unknown", label: "—", note: movingOf(b) };   // 이사 중 몸 = 첫 칸에 알림 · 그 밖 없는 칸은 빈 칸(./crew-table-logic.ts)
    const sts = Object.values(cells).map((x) => x.st);
    const st: HealthSt = sts.includes("miss") ? "miss" : sts.includes("late") ? "late" : sts.some((x) => x === "ok") ? "ok" : "unknown";
    return { key: b.being, name: b.being, value: b.body, st, cells };
  });
}

/** 계정 상태 표(불 = 읽힘 여부만 · 한도 많고 적음 = 숫자 색만 · 형 11-07 15:40 「안뜨게 혀라.............」) · (형 11-07 14:35 「no, 계정, %, 이름, 주기(매주 0요일 00시), 요금제」 · 「이름에 여러칸으로 나뉘어서 들어가면될듯 (투명 획선)세로」)
 *  줄 = 서버 acct(클로드 계정 넷 + 지피티 한 줄) · 차례 = 결제 끝난 계정이 맨 아래(../data/acct-time acctOrder)
 *  칸 = 계정 · 남은 %(주간 · 막대) · 다시 참(남은 시간 + 요일 시각) · 쓰는 이(서버가 준 이름 그대로 = 창 계정 줄) · 요금제 — 그 밖(창마다 % · 하루 평균 · 요금 · 비고 · 받은 때)은 줄을 누르면 한 줄
 *  (형 11-18 18:41 dm-cloud 「muteno가 제일 아래로 빠지게해, 그리고 읽기 쉽게 좀 변경해줘 지금은 읽기 어려워 설명글은 빼고 필요한것만 명확하게. 언제 갱신되는지 등이랑」 · 「누가 묶여있느지도 상시 갱시노디어야해」) */
type AcctCell = { st: HealthSt; left_pct?: number; reset_at?: number; note?: string };
type AcctRow = Omit<StatusRow, "cells"> & { kind?: string; names?: string[]; plan?: string; pay_end?: string; price_krw?: number; memo?: string; left_pct?: number; was_pct?: number; week_reset?: string; reported_at?: number; cells?: Record<string, AcctCell> };
const p2 = (n: number) => String(n).padStart(2, "0");
const mdHm = (ts?: number) => { if (!ts) return ""; const d = new Date(ts); return `${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`; };
const tone = (p?: number) => (p === undefined ? "none" : p >= 30 ? "ok" : p >= 10 ? "low" : "out");
function AcctTable({ rows }: { rows: AcctRow[] }) {
  const [pick, setPick] = useState(""), [gone, setGone] = useState(false);   // gone = 결제 끝난 계정 줄 펼침(기본 접힘 · 형 11-19 「결제 해지가 지금 되어잇는거는 그냥 접히게해줘」)
  if (!rows.length) return <p className="nsb-empty">계정 표 보고 아직 안 옴(맥 몸 보고)</p>;
  const now = Date.now();   // 남은 시간 · 하루 평균 = 그릴 때 셈(표는 몸 보고 받을 때마다 다시 그려짐)
  const ended = (r: AcctRow) => { const t = payEndAt(r.pay_end); return !!t && t < now; };
  const all = acctOrder(rows, now), nGone = all.filter(ended).length;
  const got = Math.max(0, ...rows.filter((r) => r.kind !== "gpt").map((r) => r.reported_at || 0));   // 받은 때 = 클로드 줄 가운데 제일 늦은 것(지피티 = 코덱스를 마지막으로 쓴 때 값이라 뺌)
  return (
    <div className="nsb-acct" role="region" aria-label="계정 상태 표" tabIndex={0}>
      {got ? <p className="nsb-acct-at">{agoKo(got)} 갱신</p> : null}
      <table>
        <thead><tr><th>계정</th><th>남은 %</th><th>다시 참</th><th>쓰는 이</th><th>요금제</th></tr></thead>
        <tbody>{all.filter((r) => gone || !ended(r)).flatMap((r) => {
          const cells = Object.entries(r.cells || {}).filter(([, c]) => c.left_pct !== undefined);
          const wk = weekCell(r.cells), pct = wk?.left_pct ?? r.left_pct, short = cells.find(([, c]) => c !== wk && (c.left_pct ?? 100) < 100);   // 큰 숫자 = 주간 창 · 짧은 창(5시간)은 깎였을 때만 옆에
          const reset = wk?.reset_at ?? r.next_at, left = leftKo(reset, now);
          // 하루 평균·예측 = 그 값을 잰 때 기준(last_at → 없으면 몸 보고 받은 때) · 잰 지 1시간 넘으면 숨김(모루 17:36)
          const obsAt = r.last_at ?? r.reported_at, old = staleObs(obsAt, now);
          const pace = wk && !old ? weekPace(wk.left_pct, wk.reset_at, obsAt) : null, payAt = payEndAt(r.pay_end), payLeft = leftKo(payAt, now);
          const outIn = pct ? leftKo(pace?.outAt, now) : "";   // 이대로면 바닥나는 때까지(이미 0% · 지난 때 = 안 씀)
          const tr = (
            <tr key={r.key} data-st={r.st} aria-expanded={pick === r.key} onClick={() => setPick(pick === r.key ? "" : r.key)} title={r.value}>
              <th scope="row"><StatusDot st={r.st} />{acctTag(r.name, r.kind)}</th>
              <td className="pct"><span className="top"><b data-tone={tone(pct)}>{pct === undefined ? "—" : `${pct}%`}</b>{pct === undefined ? null : <i className="bar" data-tone={tone(pct)}><i style={{ transform: `scaleX(${Math.max(0, Math.min(100, pct)) / 100})` }} /></i>}</span>
                {short ? <small data-tone={tone(short[1].left_pct)}>{short[0]} {short[1].left_pct}%</small> : null}{r.kind === "gpt" && r.last_at && old ? <small>{agoKo(r.last_at)} 값</small> : null}
                {outIn ? <small className="out">{outIn} 뒤 바닥</small> : null}</td>
              <td className="reset">{left ? <b>{left} 뒤</b> : "—"}{r.week_reset && left ? <small>{r.week_reset}</small> : null}</td>
              <td className="names">{(r.names || []).map((n) => <span key={n}>{n}</span>)}</td>
              <td>{r.plan || ""}{r.pay_end ? <small>{payAt && payAt < now ? "결제 끝남" : "결제 끝"} {r.pay_end.slice(5).replace("-", "/")}</small> : null}</td>
            </tr>
          );
          if (pick !== r.key) return [tr];
          const why = [
            cells.length ? cells.map(([k, c]) => `${k} ${c.left_pct}%`).join(" · ") : "",
            r.was_pct !== undefined ? `앞 값 ${r.was_pct}% · 다시 참 지남` : "",
            pace ? `하루 평균 ${pace.perDay}% 씀` : wk && old && obsAt ? `잰 지 ${agoKo(obsAt)}` : "",
            outIn ? `이대로면 ${outIn} 뒤 바닥` : pace && !pace.outAt ? `다시 찰 때 ${pace.atReset}% 남음` : "",
            reset ? `다시 참 ${mdHm(reset)}` : "",
            [r.plan, r.price_krw ? `${r.price_krw.toLocaleString("ko-KR")}원` : ""].filter(Boolean).join(" · "), payLeft ? `결제 끝까지 ${payLeft}` : payAt ? "결제 끝남" : "",
            r.memo || "", cells.length ? "" : r.note || HEALTH_KO[r.st], obsAt ? `${agoKo(obsAt)} 받음` : "",   // note = 창마다 % 를 글로 푼 것이라 % 가 읽힌 줄엔 안 겹쳐 씀(못 읽은 줄 = 까닭)
          ].filter(Boolean);
          return [tr, <tr key={`${r.key}:why`} className="why"><td colSpan={5}>{why.map((w) => <span key={w}>{w}</span>)}</td></tr>];
        })}
        {nGone ? <tr className="fold" aria-expanded={gone} onClick={() => setGone(!gone)}><td colSpan={5}><button type="button" aria-expanded={gone} onClick={(e) => { e.stopPropagation(); setGone(!gone); }}>결제 끝남 {nGone}<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button></td></tr> : null}</tbody>
      </table>
    </div>
  );
}

/** 띠들 = 서버 답 → 애들 × 연결(./crew-table-logic.ts) */
function bandsOf(d: StatusData | undefined, bs: Body[], bots: StatusRow[], list?: Bot[]): Band[] {
  const act = catRows(d, "activity", bs), kids = crewOrder(bots as SRow[], act as SRow[], bs.map((b) => b.being).filter(Boolean));
  const cli = cliRows([...bs, ...moreKids(d, bs)], d, bs), hands = d?.cats?.find((c) => c.id === "hands");
  const diary = catRows(d, "diary", bs) as SRow[], routines = Object.fromEntries((list || []).filter((b) => b.routines).map((b) => [b.who, b.routines]));
  return [
    bandLink(kids, cli as SRow[], bots as SRow[], catRows(d, "acct", bs) as SRow[]),
    bandDiary(kids, [...diary, ...grokDiaryRows(kids, routines, diary)], { noSelf: NO_SELF, care: CARE, selfOk: SELF_OK }),   // 그록 애 = 하루 일기 자동화의 마지막 실행(형 11-19 「그록봇도 일기를쓰는거니까」)
    bandHands(kids, catRows(d, "hands", bs) as SRow[], hands?.cols),
  ].filter((b): b is Band => !!b);
}

/** bare = 5번 「애들」 화면의 러너 층으로 들어갈 때(형 11-16 17:4x 구름 맥 창 「이거 두개 봣을때 겹치는게좀 잇어 하나로 통일하고 봇 상태를 메인으로 하고싶어.」): 겹치는 「활동」 신호 판은 안 그림(맨 위 손 판이 같은 말) · 바깥 여백은 부른 쪽 것 */
export function StatusBoard({ bare = false }: { bare?: boolean } = {}) {
  const srv = useQuery(statusOpts());
  const local = useQuery({ queryKey: ["nomute", "bots"], queryFn: () => office<{ bots: Bot[] }>("bots").then((j) => j.bots || []), refetchInterval: 5 * 60_000, staleTime: 60_000 });   // 이름 줄 예비 + 그록 애 자동화(하루 일기 루틴 · 15분에 한 번 바뀌는 자료라 5분마다)
  const d = srv.data;
  const bs = useMemo(() => bodiesOf(d?.bodies).map((b) => (RUN_WHO.has(b.being) ? b : { ...b, being: "" })), [d]);   // 몸 = 서버 bodies(정본) · 아이 = 러너 줄을 세우는 이만
  const bots = useMemo(() => { const r = catRows(d, "bots", bs); return r.length ? r : botsLocal(local.data); }, [d, bs, local.data]);
  const bands = useMemo(() => bandsOf(d, bs, bots, local.data), [d, bs, bots, local.data]);
  const acct = useMemo(() => catRows(d, "acct", bs), [d, bs]), act = useMemo(() => catRows(d, "activity", bs), [d, bs]);
  const [open, setOpen] = useState<Record<string, boolean>>({}), [pick, setPick] = useState("");
  const n = bandCount(bands), w: HealthSt = n.miss ? "miss" : n.late ? "late" : bots.length ? "ok" : "unknown", as = actSum(act);
  const card = (id: string, name: string, head: React.ReactNode, cnt: React.ReactNode, st: HealthSt, body: React.ReactNode) => {
    const isOpen = open[id] ?? true;
    return (
      <section className="nsb-cat" data-st={st} data-cat={id}>
        <button type="button" className="nsb-ch" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [id]: !isOpen }))}>{head}<b>{name}</b><span className="nsb-cnt">{cnt}</span></button>
        {isOpen ? <div className="nm-dropin">{body}</div> : null}   {/* 펼침 움직임 한 벌(./drop-motion.css · 형 11-19 「모두 통일」) */}
      </section>
    );
  };
  return (
    <div className={bare ? "nsb mx-auto w-full max-w-6xl px-4 pb-12" : "nsb mx-auto w-full max-w-6xl px-4 pb-12 pt-3"}>
      {srv.isError && !d ? <p className="nsb-empty">작동 표를 못 읽었어 — {(srv.error as Error)?.message || "서버 답 없음"}</p> : null}
      {bare ? null : card("activity", "활동", <ActivityDots rows={act} />, <span className="nsb-ab-sum">{(["ready", "lost", "work"] as const).map((k) => <span key={k} data-act={k} data-zero={!as[k] || undefined}>{ACT_KO[k]} <b key={as[k]} className="nsb-ab-roll">{as[k]}</b></span>)}</span>, worst(act), <ActivityBoard rows={act} pick={pick} setPick={setPick} />)}
      {card("acct", "계정 상태", <StatusDot st={worst(acct)} />, <small>{acct.length}</small>, worst(acct), <><div className="nsb-links"><a className="nm-sched-chip" href="#/edacct">계정 전환</a><a className="nm-sched-chip" href="#/tokens">토큰</a></div><AcctTable rows={acct as unknown as AcctRow[]} /></>)}   {/* 계정 전환 · 토큰 = 서랍에서 여기로(형 11-14 「계정 전환 > 그 계정 봇이랑 묶여있는 그 페이지로」 · 「토큰 > 러너 쪽으로」) */}
      {card("crew", "애들 × 연결", <StatusDot st={w} />, <>{n.miss ? <em>✕ {n.miss}</em> : null}{n.late ? <i>▲ {n.late}</i> : null}<small>{d?.at ? agoKo(d.at) : ""}</small></>, w, bots.length ? <><CrewTable bands={bands} /><CliBind /></> : <p className="nsb-empty">{srv.isPending ? "읽는 중…" : "보고 아직 안 옴"}</p>)}
    </div>
  );
}

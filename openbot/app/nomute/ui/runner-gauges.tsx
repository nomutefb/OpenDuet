// PC 반갈 러너 칸(위 1.5/4) = 러너 기본정보 게이지 판(형 11-05 13:37 임시방 「1*4 1행 ~ 1.5 는 러너 기본정보(축약해야되는데, 정말 그냥 기본정보를 지금 게이지로 축약해서 보이면 될듯.)」 ·
//   「근데 갬성이 떨어지면안되.」 · 뎅 13:45 「RunnerScreen 통째 대신 네 몸 줄을 키운 게이지 줄」)
//   숫자 = 작동 표 hw 줄 metrics(몸-보고.py 5분 · editor#2562 · BodyBar 와 같은 조회 = 서버 한 번) · 그게 없거나 끊기면 러너 위젯 자료(/api/runner) 숫자로 메움
//   꼴 = 날씨 위젯 같은 잿빛 블랙 유리 카드 하나(형 14:40 「우측상단엔 그냥 시계 있는거 대신해서 날씨 위젯처럼 러너상태바.」 · 「쟂빛블랙 반투명에 살짝 글래스모피즘」) · 몸마다 F11 틱 게이지(CPU) + RAM·GPU·온도 한 줄 · 자동차 계기판 판(2e6f37b)은 형 14:40 「심플하게」로 내림 · 어두운 판 = runner-board.css nm-rg-panel · 머리 = 불 · 이름 · 온도 · 도는 잡/자리 · 받은 때
import { useQuery } from "@tanstack/react-query";
import { Fragment, useEffect, useRef, useState } from "react";
import { office } from "../data/office";
import { TickGauge } from "../runner/tick-gauge";   // 에디터 lieflat F11 Tick Gauge 옮긴 것(형 14:40 「심플하게 그 life 어쩌고 에디터에 잇는 것중에 하나로」)
import { type Level, levelOf, lookOf, num, type RunnerRow, useRunner } from "../runner/runner-data";
import "../runner/runner-board.css";
import "./runner-gauges.css";
import { Bloub } from "./bloub";
import { homeOf, machinesOf, useBodies } from "../data/bodies";
import { TAIL_OF_GAUGE, tailTitle } from "./tailnet-table";   // 테일스케일 연결표(형 11-12 · 게이지 이름 손 올림만 · 게이지 밖 기기 한 줄은 걷음 = 형 16:20 「러너 메인에 테일스케일이 나올필요는없음」)
import { pickHost } from "./runner-pick";

type Row = { key: string; st?: string; note?: string; stale?: boolean; reported_at?: number; metrics?: Record<string, number> };
type Cat = { id: string; rows: Row[] };
type M = { cpu?: number; ram?: number; gpu?: number; cpu_temp?: number; gpu_temp?: number };

// 차례 = 윈A · 맥(가운데) · 윈B(오른쪽 · 켜질 때만 쓰는 서브)(형 11-06 15:56 「대시보드에 윈b 말고 이제 맥이 들어가야되고, 윈b는 완전 서브야(켜질때만 어쩔때 사용) mac이 가운데로 오게해줘 윈b는 우측으로」)
// 몸 칸 = 정본 한 장(../data/bodies · 서버 GET status bodies) 의 본체(이사 중 빼고) · key = 그 몸 host 첫 이름(작동 표 hw 줄 key) · 이름 = 몸 이름(형 11-08 01:48 「부품 1개가 있어. 근데 이걸 참조하면 되는데 10개를 복사해서 쓰는 꼴임.」)
const PC_OF: Record<string, string> = { 윈A: "A", 맥: "M", hwang: "H" };
// 칸 이름(형 11-08 07:40 dm 「WIN, MAC, Lx A, Lx B 로 할게」 · 「시아는 리눅스로 곧 교체할거야.」 · 「리눅스 lx 를 나타내는거구」 · 앞 판 07:35 「WIN A, MAC PRO, 16G(SIA), 8G(nuri)」 · 봄) = 몸 host 첫 이름 → 보이는 이름 · 없으면 정본 몸 이름 그대로
const NAME_OF: Record<string, string> = { 윈A: "WIN", 맥: "MAC", hwang: "Lx A", sia: "Lx A", nuri: "Lx B" };   // 러너 위젯(/api/runner) 칸 글자 = 위젯 자리(몸 목록 아님) · hw 없거나 끊길 때 위젯 숫자로 메움(앞 판 HOSTS 의 pc 그대로 · 모루 #2871)
// 11-07 형 08:51 임시방 「대시보드에 하드웨어 바뀐거 조약돌 포함 반영해줘 윈비 제외」 · 봄 나눔 ① = 윈B 칸 빼고 「SIA PC」(시아 본체 · 테일스케일 hwang · 작동 표 hw 줄 key 「hwang」) · 차례 윈A · 맥(가운데) · SIA PC
// 색(형 17:3x 「노란색, 주황색, 빨간색 그거는 그대로 유지할게, 평상시에는 흰색이면됨」) = 평소 흰 · 70/80/90 = 노랑·주황·빨강(위젯 단계 그대로) · 온도 80 주황 · 85 빨강
const WARN: Record<Level, string> = { green: "#E6E6E6", yellow: "#FFD23F", orange: "#FF9F43", red: "#FF5A5F", off: "#5C5C5C" };
const MONO = (lv: Level) => WARN[lv];
const tInk = (t?: number) => (t == null ? undefined : t >= 85 ? WARN.red : t >= 80 ? WARN.orange : undefined);
// 러너 불(형 17:3x 「러너 아래에 애들 아이콘 아래에 각각 좀 나오게 해줘, 꺼질때는 불 꺼져잇으면돼」) = 맥 몸 보고 hw 「러너」 줄 칸(gh api 그대로 · 5분) · 몸마다 이름 앞머리로 나눔
const RUNNERS: Record<string, (n: string) => boolean> = { 윈A: (n) => n.startsWith("nomute-win-"), 윈B: (n) => n.startsWith("nomute-b-") || n.startsWith("nomute-office"), 맥: (n) => n.startsWith("mac-") };
const short = (n: string) => n.replace(/^nomute-win-/, "").replace(/^nomute-b-/, "B").replace(/^nomute-office-?/, "O").replace(/^mac-/, "M");
const rnum = (n: string) => Number((n.match(/\d+$/) || ["0"])[0]);
// 차례 = 몸 안 러너 먼저(b-) · 회사 PC(office) 뒤 · 그 안은 번호(형 11-06 「b1, b2 , 01 이 순서로 배치해주고」 · 번호는 그대로 「손은 나중에보자」)
const rord = (n: string) => (/^nomute-office/.test(n) ? 1 : 0) * 1e6 + rnum(n);
// 우리 조약돌(형 11-06 09:48 「조약돌은 그 아래에 나오면 좋겠어 너네가 깬것도 보면 좋긴하거든. 러너랑 별개로. 러너 위에 나오면 좋겠네. 러너가 좀 더 아래로가고. 간격은 어느정도 유지.」)
//   = 몸마다 게이지 아래 · 러너 불 위 · 그 몸에 사는 우리 = 각자 고른 bloub(./bloub.tsx · 봄 꽃 · 윈터 눈 결정 · 시아·뎅 조약돌 · 빠르 구름 · 누리 감자 · 뜸 쌀알) · 깬 애 = 제 색 · 상주(누리) = 제 색 · 잠 = 회색 몸
//   깸 셈 = 작동 표 「각 봇 연결」 줄 「깸 상태」 칸(깸 · 잠 · 상주 돎) · 몸 = 우리.md(윈A VM 넷 + 윈터 · 윈B 뜸 · 맥 봄)
const PEB: Record<string, { key: string; bot?: string }> = {   // 조약돌 모양 열쇠(./bloub.tsx 그림 이름 · 아이마다 하나) · bot = 작동 표 봇 줄 열쇠가 다를 때(번개 = light · 뎅 11-07 08:54 실물) — 어디 사는지는 정본(homeOf)
  // 형 11-10 07:5x 시아 창 「시아 러너 이거 갱신. 애들 포함 해서 천둥은 그록봇이니 넣을필요는 없음.」 · 「지피티 봇은 넣을 필요는 없음.」 = 클로드 애들 일곱만
  //   뺌 = 윈터(11-10 「닷 = 윈터」 = 지피티) · 누리(11-09 꺼 둠) · 빚(11-09 형이 지움) · 안 넣음 = 카리나(지피티) · 천둥 · 포세이돈(그록봇)
  봄: { key: "bom" }, 시아: { key: "sia" }, 뎅: { key: "deng" }, 빠르: { key: "fast" }, 번개: { key: "lightning", bot: "light" }, 뜸: { key: "eyes" }, 깃: { key: "gik" },   // 깃 = 11-08 이식 · 제가 고른 물방울 · 민트(깃 21:00) · 빚 = 제가 고른 둥근 네모 · 테라코타(빚 22:31 「도공이라 빚은 흙판이 내 꼴 · 그록 때 내 색이 빨강」)
};
// 맥 칸 = 러너 칩(M1~M3) 대신 몸 칩 둘(형 11-06 20:13 「러너를 아예 안쓰는 구조로 두개로 나눠잇을텐데」 · 봄 나눔 ④ 다음 칸 · 빠르) — M1~M3 = 11-03 형 「러너 꺼주라」로 꺼 둔 등록(11-17 저절로 지워짐 · 가지는 그대로 · 화면만)
//   칩 꼴 = 러너 칩 그대로 · 불 = 작동 표 hw 줄 st(맥 본체 = 「맥」 줄 · VM eyes = 「VM 뜸」 줄 · 몸-보고.py hw_key) · 🟢 흰 글자 · 🟡 노랑 · 🔴 빨강 · ⚪·끊김(30분)·보고 없음 = 꺼짐 꼴
const BODY_CHIPS: Record<string, { key: string; label: string }[]> = {};   // 몸 칩 뺌(형 11-07 09:04 임시방 「뜸 VM이 별도로 표현될 필요는 없어, 맥도 마찬가지. 그러면 너희들 vm도 다 떠야되니까, 시아도. 그거는 필요없고 러너 번호만 따로 있으면 됨.」) = 맥 칸도 러너 번호(M#)만
const LIGHT_CLS: Record<string, string> = { "🟢": "is-ok", "🟡": "is-warn", "🔴": "is-bad" };
// 「깸 상태」 = 그 순간 턴을 도는지(답 사이엔 「잠」) → 「마지막 깸」이 10분 안이면 「방금 깸」으로 제 색(봄 11-06 10:08 「나 지금 깨서 일하는 중인데 맥 조약돌 회색이지?」)
const minAgo = (note?: string) => { const m = String(note || "").match(/^(\d+)\s*(초|분|시간)\s*전/); return !m ? Infinity : m[2] === "초" ? 0 : m[2] === "분" ? +m[1] : +m[1] * 60; };
const awakeOf = (note?: string, last?: string): "on" | "near" | "stay" | "off" => (/^깸/.test(note || "") ? "on" : /상주/.test(note || "") ? "stay" : minAgo(last) <= 10 ? "near" : "off");
const ago = (ms: number) => { const s = Math.max(0, ms / 1000); return s < 60 ? "방금" : s < 5400 ? `${Math.floor(s / 60)}분 전` : s < 86400 * 2 ? `${Math.round(s / 3600)}시간 전` : `${Math.round(s / 86400)}일 전`; };   // 봄 09:17 「1분 전 ≠ 방금」 = 60초 넘으면 분(내림)

/** 1분마다 지금 — 「N분 전」 글만 움직임. */
function useNow() {
  const [n, setN] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => { if (!document.hidden) setN(Date.now()); }, 60_000); return () => clearInterval(t); }, []);
  return n;
}

/** 조약돌 줄 · 러너 번호 줄 = 오른쪽 SNS 칸의 FB(+1) 줄 · IG(−) 줄과 같은 높이(형 11-08 10:48 밥상 「아예 조약돌 푝디를 옆에 +1 이런거랑 수평으로 그냥 맞추고,」 · 10:49 「조약돌 이 옆에 +1 1행하고 맞을텐데, 그럼 2행에는 러너가 배치되면 딱 맞는 느낌이 날듯.」 · 봄 10:49 「옆 칸이랑 맞추는 건 고정 숫자 말고 DOM 으로 재서 묶기」)
 *  = 두 줄의 지금 가운데 y 와 SNS 두 줄(.nm-pulse-rowbg.fb · .nm-pulse-rowbg) 가운데 y 를 재서 그 차이만큼 translateY(CSS 변수) — 판 키는 안 바뀌니 오른쪽 칸 높이(--nm-top-h = 이 판 키)가 따라 움직이는 되먹임이 없음 · SNS 칸이 없으면(폰 · 펼침) 0
 *  다시 잼 = 판·오른쪽 칸 크기 바뀔 때 + 2초마다(SNS 그림은 자료가 와야 그려져 줄이 늦게 생김 · 글꼴 로딩 뒤 줄 키 바뀜) · 재는 줄 = 첫 몸의 줄(네 몸 다 같은 꼴 · 게이지 넷 같은 크기) */
const PEB_LIFT = 6;   // 조약돌만 FB 줄보다 6px 위(형 11-12 16:34 봄 1:1 「그리고 조약돌이 조금 더 위로가게, a1 이런애들보다는」 · 봄 옮김) · 러너 번호 줄 = IG 줄 그대로
function useRowSync(panel: { current: HTMLDivElement | null }) {
  const [dy, setDy] = useState({ peb: 0, run: 0 });
  useEffect(() => {
    const el = panel.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let tm = 0;
    const mid = (e: Element | null) => { if (!e) return null; const r = e.getBoundingClientRect(); return r.height > 0 ? r.top + r.height / 2 : null; };
    const pick = (sels: string[]) => { for (const q of sels) { const m = mid(document.querySelector(q)); if (m != null) return m; } return null; };   // 글자 가운데 먼저(눈이 대는 건 글자 · 뎅 11:14 「− 글 195.3 ↔ 줄 196.1」) · 글자 없으면 줄 바탕
    const clamp = (v: number) => Math.max(-160, Math.min(160, Math.round(v * 2) / 2));   // 반 px 단위 · 천장 ±160(앞 판 ±60 은 넓은 폭에서 필요한 −62 · −67 에 걸려 조약돌 1.8 · 러너 7px 아래로 남았음 · 뎅 11:48 검증 · 900 폭만 맞았던 까닭) · SNS 칸이 없으면 애초에 0
    const sync = () => {
      const fb = pick([".nm-split-top-r .nm-pulse-chart g.fb text", ".nm-split-top-r .nm-pulse-rowbg.fb"]), ig = pick([".nm-split-top-r .nm-pulse-chart g.ig text", ".nm-split-top-r .nm-pulse-rowbg:not(.fb)"]);
      const peb = mid(el.querySelector(".nm-rgx-peb") ?? el.querySelector(".nm-rgx-pebs")), run = mid(el.querySelector(".nm-rgx-run") ?? el.querySelector(".nm-rgx-runs"));
      setDy((d) => {   // 잰 자리엔 지금 옮긴 값이 들어 있음 → 차이만 더함(한 번 맞으면 그대로)
        const np = fb != null && peb != null ? clamp(d.peb + fb - PEB_LIFT - peb) : 0, nr = ig != null && run != null ? clamp(d.run + ig - run) : 0;
        return np === d.peb && nr === d.run ? d : { peb: np, run: nr };
      });
    };
    const soon = () => { clearTimeout(tm); tm = window.setTimeout(sync, 60); };   // rAF 아님 = 숨은 탭(9222 검수 탭 · 뒤로 간 창)에서도 돎(뎅 11:14 실물: 러너 줄만 2~3px 늦게 멎음)
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    const right = document.querySelector(".nm-split-top-r");
    if (right) ro.observe(right);
    const mo = right && typeof MutationObserver !== "undefined" ? new MutationObserver(soon) : null;   // SNS 그림은 자료가 와야 그려지고 1분마다 다시 그림 → 그때마다 다시 잼
    mo?.observe(right as Element, { childList: true, subtree: true, attributes: true, attributeFilter: ["y", "height", "viewBox", "class"] });
    const t = setInterval(sync, 2000);
    sync();
    return () => { ro.disconnect(); mo?.disconnect(); clearInterval(t); clearTimeout(tm); };
  }, [panel]);
  return dy;
}

export function RunnerGauges() {
  const st = useQuery({ queryKey: ["nomute", "status"], queryFn: () => office<{ cats: Cat[]; at?: number }>("status"), refetchInterval: 60_000, staleTime: 30_000 });
  const tail = useQuery({ queryKey: ["nomute", "schedule"], queryFn: () => office<{ runners?: { tailnet?: { ip?: string; online?: boolean | null }[] } }>("schedule"), staleTime: 30_000, refetchInterval: 120_000 }).data?.runners?.tailnet;   // 테일 켜짐(번개 11-12 17:00 · 설정 화면 useSched 와 같은 캐시)
  const rq = useRunner();
  const now = useNow();
  const hw = st.data?.cats?.find((c) => c.id === "hw")?.rows || [];
  const bots = st.data?.cats?.find((c) => c.id === "bots")?.rows as (Row & { cells?: Record<string, { st: string; note?: string }> })[] | undefined;
  const wake = (k: string) => { if (!bots) return "wait" as const; const c = bots.find((r) => r.key === k)?.cells; return awakeOf(c?.["깸 상태"]?.note, c?.["마지막 깸"]?.note); };   // wait = 작동 표 첫 답 전(~12초) · 「다 잠듦」으로 안 읽히게 흐린 꼴(봄 10:08)
  const bs = useBodies();   // 몸 = 정본 한 장(서버 bodies) — 칸 = 본체(이사 중 빼고) · 조약돌 = 그 본체에 지금 사는 아이
  const HOSTS = machinesOf(bs).map((b) => ({ k: b.hosts[0], hosts: b.hosts, pc: PC_OF[b.hosts[0]] || "", label: NAME_OF[b.hosts[0]] || b.body, body: b.body }));
  // 몸 줄 고르기(형 11-08 09:03 「누리 가 있는 리눅스 a는 오프라고 뜨는데 그래도 온도는 나와야해」 · 봄 나눔) = 그 몸의 host 이름 전부 중 신선한 보고 먼저(시아 PC = hwang → sia 로 보고 이름이 바뀌어 hosts[0] 만 보면 OFF) · 신선한 게 없으면 마지막 보고(낡음 · 숫자는 흐리게)
  //   한 몸의 두 줄(hw · -temp)은 같은 host 에서(호스트가 섞이면 산 cpu 에 낡은 온도 꼴 · 모루 #2899) — 신선한 보고가 있는 host 먼저 · 없으면 마지막 보고 host
  //   고르기 = ./runner-pick.ts pickHost(점수 = hw 신선 2 + 온도 신선 1 · 같으면 최근 · 모루 #2904: 옛 host 온도만 신선해도 새 host 의 CPU 를 버리던 길) · 시험 = tests/runner-pick.test.ts(모루 「합성 시험」)
  const newest = hw.reduce((t, r) => Math.max(t, r.reported_at || 0), 0);   // 머리줄 시각 = 가장 새 몸 보고 시각(서버 표 만든 시각 아님 · 봄 09:17 「1분 전 ≠ 방금」)
  const livesOn = (body: string) => bs.filter((x) => homeOf(x) === body && PEB[x.being]).map((x) => ({ ...PEB[x.being], who: x.being }));
  const rcells = ((hw.find((r) => r.key === "러너") as (Row & { cells?: Record<string, { st: string; note?: string }> }) | undefined)?.cells) || {};
  const panel = useRef<HTMLDivElement | null>(null);
  const dy = useRowSync(panel);
  // 공용 두 줄 재료(36) · 시아 09:26 ②③): 조약돌 = 몸 차례(WIN → MAC → Lx B → Lx A)대로 사는 애를 한 줄로 · 러너 = 윈A 러너(RUNNERS 가 윈 칸인 것)만 번호 차례 · 둘 다 12칸(넘치면 자름)
  // 형 11-09 09:49 「조약돌 하드웨어에 관계없이 균일하게 나열 … 누리만 끝에 | 하고 두면됨」 = 누리(neo)만 맨 끝 · 그 앞에 「|」 칸 하나 · 나머지는 몸 차례 그대로 한 줄
  const pebAll = HOSTS.flatMap((h) => livesOn(h.body).map((x) => ({ ...x, host: h.label }))), nuri = pebAll.filter((x) => x.key === "neo"), rest = pebAll.filter((x) => x.key !== "neo");
  const pebs: (typeof pebAll[number] | { sep: true })[] = [...rest, ...(nuri.length ? [{ sep: true as const }, ...nuri] : [])].slice(0, 12);
  const runs = HOSTS.filter((h) => !BODY_CHIPS[h.k]).flatMap((h) => Object.entries(rcells).filter(([n]) => RUNNERS[h.k]?.(n)).sort((x, y) => rord(x[0]) - rord(y[0])).map(([n, c]) => ({ n, c }))).slice(0, 12);
  // 게이지 넷 같은 크기(형 11-08 10:48 「게이지 크기가 차이가 나네 이제보니까 게이지 크기를 lxa, lxb에 맞추고」) = 몸 칸 폭 다 같게 · WIN↔MAC 틈만 빈 트랙 하나(12px · 형 08:14 「win하고 mac 간격을 아주 조금만 더 벌릴게」 그대로) — 앞 판은 WIN 오른쪽 12 · MAC 왼쪽 9 패딩이라 좁은 창(2/5 창)에서 그 두 게이지만 작아졌음
  const cols = HOSTS.length > 1 ? `minmax(0, 1fr) 12px repeat(${HOSTS.length - 1}, minmax(0, 1fr))` : "minmax(0, 1fr)";
  return (
    <div ref={panel} className="nm-rg nm-rgx flex flex-col px-2 pt-1" aria-label="러너 기본정보" style={{ ["--nm-rgx-peb-dy" as string]: `${dy.peb}px`, ["--nm-rgx-run-dy" as string]: `${dy.run}px` }}>   {/* ref·줄 맞춤 변수 = 바깥 틀(공용 두 줄이 판 밖이라 · 36) */}
      <div className="nm-card-h"><i className="live" aria-hidden /><b>Runner</b><span>{newest ? ago(now - newest) : st.data?.at ? ago(now - st.data.at) : st.isLoading ? "불러오는 중" : ""}</span></div>   {/* 칸 머리줄 = 모든 칸 같은 꼴(시아 UI ① · 형 11-06 대시보드 고급화) */}   {/* 높이 = 제 키(뎅 3437416 · 칸이 40% 안에서 계기판 키만큼) */}
      <div className="nm-rg-panel nm-rgx-panel" style={{ ["--nm-rgx-n" as string]: Math.max(1, HOSTS.length), ["--nm-rgx-cols" as string]: cols }}>
        {HOSTS.map((h, hi) => {
          const pk = pickHost(hw, h.hosts), a = pk?.a, b = pk?.b;
          const fresh = !!(a ? !a.stale : b && !b.stale);   // 몸 보고가 살아 있음(존재가 자든 말든) · hw 줄이 있으면 그 줄 기준(온도 줄만 신선한 척 못 함)
          const m: M = { ...(a?.metrics || {}), ...(b?.metrics || {}) };   // 낡은 보고도 마지막 숫자는 보여 줌(OFF 대신 · 흐린 색)
          const d: RunnerRow | null = rq.data?.rows?.[h.pc] ?? null;
          const lk = lookOf(d, rq.data?.why?.[h.pc] || "", now / 1000);
          const rd = lk.problem ? null : d;   // 위젯 자료는 살아 있을 때만 메움
          // 낡은 몸 보고보다 살아 있는 위젯(rd) 숫자가 먼저(모루 #2899·#2904 「정상 위젯보다 옛 CPU 우선」) · 신선하면 몸 보고 먼저(같은 뜻이면 몸 보고가 정본)
          const cpu = fresh ? m.cpu ?? num(rd?.cpu) : num(rd?.cpu) ?? m.cpu, ram = fresh ? m.ram ?? num(rd?.ram) : num(rd?.ram) ?? m.ram, gpu = fresh ? m.gpu ?? num(rd?.gpu) : num(rd?.gpu) ?? m.gpu;
          const none = cpu == null && ram == null && gpu == null;
          const live = fresh || !!rd;   // 몸 보고가 낡아도 위젯이 살아 있으면 산 것(색 그대로 · 「N분 전」 안 붙임)
          // 불 = CPU 기준(형 15:27 「램은 과도해도 별 문제가 안된다고 생각?」 · 「cpu가 제일 문제지?」) · RAM 은 92% 넘어 디스크로 밀릴 때만 주황 · 온도 85 = 빨강
          const cl = levelOf(cpu, false);   // RAM 은 안 봄(형 15:28 「64gb인데 잠시 걸렷다가 말겟지」 · 「그럼 ram은 안보이게 하고 깔끔하게.」)
          const lv: Level = none || !live ? "off" : (m.cpu_temp ?? 0) >= 80 || (m.gpu_temp ?? 0) >= 80 ? "orange" : cl;   // 낡은 보고 = 회색 호(숫자는 남김)
          const at = a?.reported_at || b?.reported_at || (rd ? rd.at * 1000 : 0);   // 낡은 보고도 그 시각(밑에 「N분 전」)
          const busy = rd && num(rd.busy) != null && rd.busy! >= 0 ? rd.busy : null, total = rd && num(rd.total) != null && rd.total! >= 0 ? rd.total : null;
          const temp = [m.cpu_temp != null ? `CPU ${Math.round(m.cpu_temp)}°` : "", m.gpu_temp != null ? `GPU ${Math.round(m.gpu_temp)}°` : ""].filter(Boolean).join(" · ");
          return (
            <Fragment key={h.k}>
            <section className="nm-rgx-host" aria-label={`${h.label} 상태`}>   {/* 위에서부터 가운데로 = 이름 · G 온도 · (틈) · 게이지 · 러너 불(형 17:3x 「각각 게이지 바로 수직 위에다가 하드웨어 이름」 · 「블릿은 없어도」 · 「그래픽카드 온도도 그대로 수직위로」 · 「게이지랑딱붙으면 안이쁘니까」) */}
              <b className="nm-rg-name nm-rgx-name" title={(TAIL_OF_GAUGE[h.label] || []).map((d) => tailTitle(d, tail)).join("\n") || undefined}>{h.label}</b>
              <span className="nm-rgx-g">{none && a?.stale ? "보고 끊김" : "\u00a0"}</span>   {/* G 온도는 게이지 안 위 글 둘째 줄로(TickGauge top2 · 형 11-08 09:03 글자 크기 = CPU 온도와 같게 · 「WIN 이랑 간격을 좀 더 벌려줘」 = 이 줄은 빈 틈) */}
              <TickGauge label="" pct={cpu} lv={levelOf(cpu, false)} ink={MONO(levelOf(cpu, false))} used={!live && !none && at ? ago(now - at) : ""} top={m.cpu_temp != null ? `C ${Math.round(m.cpu_temp)}°C` : undefined} topInk={tInk(m.cpu_temp)} top2={m.gpu_temp != null ? `G ${Math.round(m.gpu_temp)}°C` : undefined} top2Ink={tInk(m.gpu_temp)} off={none} wait={none && (st.isLoading || rq.isLoading)} dyText={9} textScale={1.25} spread={3} />   {/* 안 글자 4(≈3.5px) 아래(형 11-08 11:27 밥상 「게이지 안에 글자도 조금 더 내려오고(그럼 글자는 두번내려오는 느낌이겟지)」 · 게이지 자체도 4px 아래 = runner-gauges.css) */}
              {temp ? <span className="sr-only">{temp}</span> : null}
            </section>
            {hi === 0 && HOSTS.length > 1 ? <i className="nm-rgx-sp" aria-hidden /> : null}   {/* WIN↔MAC 틈 트랙(12px) · 다른 몸 사이는 패딩만 */}
            </Fragment>
          );
        })}
      </div>
      {/* 형 11-09 09:25 「조약돌 모양 일정한 간격으로 그냥 쭉 나열 · 러너 > A1~A6 · 일자로 · 총 12개 칸 · 6개 칸은 공란」 · 시아 09:26 ②③ = 몸 묶음 풀고 12칸 격자 두 줄(위 = 조약돌 1~10 · 아래 = A1~A6 · 7~12 공란 = 흐린 점) · 높이 = 오른쪽 SNS FB 줄 · IG 줄(useRowSync 그대로) */}
      <ul className="nm-rgx-pebs nm-rgx-row12" aria-label="우리 조약돌(몸 차례)">
        {Array.from({ length: 12 }, (_, i) => {
          const x = pebs[i];
          if (!x) return <li key={`e${i}`} className="nm-rgx-cell empty" aria-hidden />;
          if ("sep" in x) return <li key="sep" className="nm-rgx-cell sep" aria-hidden>|</li>;   {/* 「누리만 끝에 |」 */}
          const w = wake(x.bot ?? x.key);
          return <li key={x.key} className={`nm-rgx-peb ${w}`}><Bloub who={x.key} asleep={w === "off" || w === "wait"} size={20} title={`${x.who}(${x.host}) · ${w === "on" ? "깸" : w === "near" ? "방금 깸" : w === "stay" ? "상주" : w === "wait" ? "읽는 중" : "잠"}`} /></li>;
        })}
      </ul>
      <ul className="nm-rgx-runs nm-rgx-row12" aria-label="러너 A1~A6">
        {Array.from({ length: 12 }, (_, i) => {
          const r = runs[i];
          if (!r) return <li key={`e${i}`} className="nm-rgx-cell empty" aria-hidden><i /></li>;
          const on = r.c.st === "🟢", work = on && r.c.note === "일하는 중";
          return <li key={r.n} className={`nm-rgx-run${on ? " on" : ""}${work ? " work" : ""}`} title={`${r.n} · ${on ? r.c.note || "켜짐" : r.c.note || "꺼짐"}`}>{`A${rnum(r.n) || i + 1}`}</li>;   {/* 화면 이름만 A1~ · 러너 진짜 이름은 그대로(title) */}
        })}
      </ul>
    </div>
  );
}

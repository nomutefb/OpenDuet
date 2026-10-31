// 설정 = YETA 설정 화면(yShowSettings) 꼴 거의 그대로 — 글래스 카드 하나에 [기어]제목 · 섹션 라벨 · 행(act·info 꼴 그대로)
//   원본 = nomutefb/YETA viewer/index.html yShowSettings · YICO · CSS .ycd-card·.yset-*(SHA 5a25d87) · 형 10-28 10:19 「거의 코드 그대로」 · 10:22 「그 예타에도 설정이 있거든? 그쪽을 가져와서」
//   항목 = 지금 새 사무실 설정에 있던 것만(가짜 0): 화면(테마) · 글꼴(대화 · YETA 「글꼴」 칸 그대로 = ./chat-font.tsx · 형 10-28 15:36) · 상태(점검표·지금 봇·스케줄러 연결) · 사무실(스케줄러 바꾸기·지정방 멤버·공지 설정) · 기록(옛 그록 대화) · 정보(지금 판)
//   테마 = YETA 「화면 어둡기」 행처럼 누를 때마다 다음 값 · 나머지 행 = 누르면 그 칸(settings-extra·health 그대로)이 행 아래 펼쳐짐(한 번에 하나)
import "./yeta-settings.css";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Pane } from "./pane";
import { useTheme } from "@/components/theme-provider";
import type { ThemePreference } from "@/lib/theme";
import { office } from "../data/office";
import { usePeople } from "./faces";
import { NomuteHealth } from "./health";
import { ChatFontRows } from "./chat-font";
import { PushRow } from "../push/push-row";   // 알림 줄(보조 03 · 장부 office-chat-read.md 「바뀜」 17:02)
import { NomuteBots, NomuteLink, NomuteMeter, NomuteNotice, NomuteOld, NomuteRoomset, NomuteSchedule, useBuildLine } from "./settings-extra";
import { StandingInstructions } from "@/components/settings/standing-instructions";   // 원본 설정의 「공통 지시」(routes/_authed/settings/index.tsx) — 빠뜨리지 않기(윈터 10-31 「지금 SettingsIndex 항목을 그대로 옮겨 담기」)
import { formatHotkey, HOTKEYS } from "@/lib/hotkeys/hotkeys";   // 원본 「키보드 단축키」(PC 만)
import { YICO, type YIcon } from "./yeta-icons";

const Svg = ({ k, className }: { k: YIcon; className?: string }) => <span className={className} aria-hidden dangerouslySetInnerHTML={{ __html: YICO[k] }} />;
const THEME: { v: ThemePreference; t: string }[] = [{ v: "system", t: "폰 따라" }, { v: "light", t: "밝게" }, { v: "dark", t: "어둡게" }];

type Health = { counts: { ready: number; unchecked: number; fix: number } };

/** YETA act 행 — [픽토][제목·설명][값·꺾쇠] · 펼침 칸이 있으면 aria-expanded */
function Act({ ic, t, d, v, vt, mod, open, onClick }: { ic: YIcon; t: string; d?: string; v?: string; vt?: boolean; mod?: boolean; open?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="yset-item" aria-expanded={open} onClick={onClick}>
      <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO[ic] }} />
      <span className="si-lbl"><span className="si-t">{t}</span>{d ? <span className="si-d">{d}</span> : null}</span>
      <span className="si-v">{v ? (vt ? <span className={`si-vt${mod ? " mod" : ""}`}>{v}</span> : <i className="si-vv">{v}</i>) : null}<Svg k="chev" /></span>
    </button>
  );
}

/** YETA info 행(.ro) — 읽기만 */
function Info({ ic, t, d, v }: { ic: YIcon; t: string; d?: string; v?: string }) {
  return (
    <button type="button" className="yset-item ro" aria-disabled="true">
      <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO[ic] }} />
      <span className="si-lbl"><span className="si-t">{t}</span>{d ? <span className="si-d">{d}</span> : null}</span>
      <span className="si-v">{v ? <i className="si-vv">{v}</i> : null}</span>
    </button>
  );
}

export function YetaSettings() {
  const { preference, setPreference } = useTheme();
  const [open, setOpen] = useState("");
  const list = usePeople();
  const health = useQuery({ queryKey: ["nomute", "health"], queryFn: () => office<Health>("health"), refetchInterval: 60_000 }).data?.counts;
  const bots = useQuery({ queryKey: ["nomute", "bots"], queryFn: () => office<{ bots: { who: string; state: string }[] }>("bots").then((j) => j.bots || []), refetchInterval: 60_000 }).data;
  const build = useBuildLine();
  const theme = THEME.find((x) => x.v === preference) || THEME[0];
  const nBots = list.filter((p) => p.kind === "bot").length, awake = (bots || []).filter((b) => b.state === "awake").length;
  const row = (id: string, ic: YIcon, t: string, d: string, body: ReactNode, v?: string) => [
    <Act key={id} ic={ic} t={t} d={d} v={v} open={open === id} onClick={() => setOpen((o) => (o === id ? "" : id))} />,
    open === id ? <div key={id + ":open"} className="yset-open">{body}</div> : null,
  ];
  // 묶음 = YETA details.yset-grp(접힘/펼침 · index.html 1035줄 꼴 · 형 10-31 「스크롤 내리면서 하나씩 다 설정하는거. 펼치면서. 접힐건 접히고, 고정된거는 고정되어있고」) · 처음 = 화면·글꼴만 펼침 · 제목 줄은 스크롤에 붙음(.yset-pin)
  const grp = (id: string, name: string, body: ReactNode, open = false) => (
    <details key={id} className="yset-grp" open={open}><summary>{name}</summary>{body}</details>
  );
  return (
    <Pane title="설정">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left">
          <span className="ycd-nm yset-ttl yset-pin"><Svg k="gear" />설정</span>
          {grp("screen", "화면", <>
          <Act ic="screen" t="테마" d="탭 = 폰 따라 → 밝게 → 어둡게" v={theme.t} vt mod={theme.v !== "system"}
            onClick={() => setPreference(THEME[(THEME.indexOf(theme) + 1) % THEME.length].v)} />
          <PushRow />
          </>, true)}
          {grp("font", "글꼴", <ChatFontRows />, true)}
          {grp("status", "상태", <>
          {row("health", "data", "점검표", "서버 문·지킴이 연결·박동", <NomuteHealth />,
            health ? (health.fix ? `고칠 것 ${health.fix}` : health.unchecked ? `확인 안 됨 ${health.unchecked}` : "다 준비됨") : undefined)}
          {row("bots", "user", "지금 봇", "온라인 · 하는 일 · 다음 깸", <NomuteBots />, bots ? `온라인 ${awake}/${nBots}` : undefined)}
          {row("link", "radio", "스케줄러 연결", "일정 → 호출 → 깨움 · 오늘 깬 수", <NomuteLink />)}
          {row("meter", "data", "회의실 계기판", "헛깸 · 형 말 출처 · 바꿔 전하기 · 되묻기 · 하루 한 장", <NomuteMeter />)}
          </>)}
          {grp("office", "사무실", <>
          {row("sched", "gear", "스케줄러 바꾸기", "루틴 · 봇 하루 최대 · 사건 모아 깨우기", <NomuteSchedule />)}
          {row("roomset", "user", "지정방 멤버", "@모두 = 이 멤버만 받음", <NomuteRoomset />)}
          {row("notice", "bell", "공지 설정", "봇이 깰 때마다 보는 한 장", <NomuteNotice />)}
          {row("instr", "type", "공통 지시", "모든 봇이 따르는 글(원본 설정 Standing instructions)", <StandingInstructions />)}
          </>)}
          {grp("log", "기록", row("old", "chat", "옛 그록 대화", "그록 앱 시절 · 읽기만", <NomuteOld />))}
          {grp("info", "정보", <>
          <Info ic="info" t="지금 판" d={build.fresh ? `새 판 있음(${build.fresh}) — 곧 저절로 바뀜` : "새 판이 나오면 저절로 바뀜"} v={build.now} />
          {/* 원본 「키보드 단축키」 = 키보드 있는 화면(md~)만 · 읽기만(원본 그대로 · 바꿀 수 없음) */}
          <div className="hidden md:block">{HOTKEYS.map((h) => <Info key={h.id} ic="type" t={h.label} d={h.description} v={formatHotkey(h.combo).join(" ")} />)}</div>
          </>)}
        </div>
      </div>
    </Pane>
  );
}

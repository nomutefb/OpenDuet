// 설정 = YETA 설정 화면(yShowSettings) 꼴 거의 그대로 — 글래스 카드 하나에 [기어]제목 · 섹션 라벨 · 행(act·info 꼴 그대로)
//   원본 = nomutefb/YETA viewer/index.html yShowSettings · YICO · CSS .ycd-card·.yset-*(SHA 5a25d87) · 형 10-28 10:19 「거의 코드 그대로」 · 10:22 「그 예타에도 설정이 있거든? 그쪽을 가져와서」
//   항목 = 지금 새 사무실 설정에 있던 것만(가짜 0): 화면(테마) · 글꼴(대화 · YETA 「글꼴」 칸 그대로 = ./chat-font.tsx · 형 10-28 15:36) · 상태(점검표·지금 봇·스케줄러 연결) · 사무실(스케줄러 바꾸기·지정방 멤버·공지 설정) · 기록(옛 그록 대화) · 정보(지금 판)
//   테마 = YETA 「화면 어둡기」 행처럼 누를 때마다 다음 값 · 나머지 행 = 누르면 그 칸(settings-extra·health 그대로)이 행 아래 펼쳐짐(한 번에 하나)
//   11-01 00:10 형 「6 설정을 카테고라이징 적용하고 이를 5에도 적용 톤은 그대로 글래스모피즘」 · 「도형을 구분선으로 단축」 = 묶음마다 유리 카드 하나 + 행은 구분선(.yset-part · .yset-grp · 서랍 = ./drawer-page.tsx 같은 부품)
//   10-31 15:1x 형 「이거 설정 예전 예타 모습으롷 ㅏ고싶어」(사진 = 에디터 판의 YETA 카드: 섹션 라벨 + 행 평면) → dac3f2b 의 접힘 묶음(details.yset-grp)·고정 제목(yset-pin) 뺌 = 09:41 꼴로 되돌림 · 항목(공통 지시·단축키·정보)은 그대로
import "./yeta-settings.css";
import { BlindRows } from "./idle-blind";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, Suspense, lazy, useState } from "react";
const LockModal = lazy(() => import("./lock").then((m) => ({ default: m.LockModal })));   // 화면 잠금 · 구독 기기 = 서랍에서 설정으로(형 11-14 「화면 잠금 > 설정으로」 · 「구독 기기 > 설정으로」)
const PushDevsModal = lazy(() => import("./push-devs").then((m) => ({ default: m.PushDevsModal })));
const SnsAccModal = lazy(() => import("./snsacc").then((m) => ({ default: m.SnsAccModal })));   // 구독 채널 = 서랍 「뉴스」에서 설정 「알림 · 구독」으로(형 11-14 「구독채널은 설정으로 보내서 관련된거랑 가능하면 기능 합치고」 · 화면 = 그대로 ./snsacc)
const GenOptModal = lazy(() => import("./genopt").then((m) => ({ default: m.GenOptModal })));   // AI 썸네일 옵션 = 서랍 「AI 썸네일·이미지」를 간추려 여기로(형 11-14)
import { Pane } from "./pane";
import { DiffValue } from "./state-diff";   // 줄 값이 바뀌는 순간 옛 값이 물러나고 새 값이 들어옴(형 11-15 State Diff)
import { useTheme } from "@/components/theme-provider";
import type { ThemePreference } from "@/lib/theme";
import { office } from "../data/office";
import { NomuteHealth } from "./health";
import { ChatFontRows } from "./chat-font";
import { EnterKeyRow } from "./enter-key";
import { ThinkMarkRow } from "./live-shine";
import { ModelSetRows } from "./model-set";
// 그록봇 지침 메모(#-060)   // 모델 · 노력도(봇 상자 + 서버가 직접 부르는 일 · 일괄 · 형 11-15)
import { PushRow } from "../push/push-row";
import { type TeamsNotiKind, setTeamsNoti, useTeamsNoti } from "./teams";   // 알림 줄(보조 03 · 장부 office-chat-read.md 「바뀜」 17:02)
import { TeamsAccount, useTeamsName } from "./teams";   // 팀즈 로그아웃 = 여기(목록 머리 줄에서 옮김 · 형 11-13 10:23)
import { PinTintSetting, usePinAlpha } from "./pin-tint";
import { NomuteMeter, NomuteNotice, NomuteOld, NomuteSchedule, NomuteVault, useBuildLine } from "./settings-extra";
import { formatHotkey, HOTKEYS } from "@/lib/hotkeys/hotkeys";   // 원본 「키보드 단축키」(PC 만)
import { YICO, type YIcon } from "./yeta-icons";
import { setSkin, useSkin } from "./skin";   // 꾸밈 지금 / 정원(형 11-07 08:01 「지금테마랑 정원테마 고를 수 있게해줘」)

const Svg = ({ k, className }: { k: YIcon; className?: string }) => <span className={className} aria-hidden dangerouslySetInnerHTML={{ __html: YICO[k] }} />;
const THEME: { v: ThemePreference; t: string }[] = [{ v: "system", t: "폰 따라" }, { v: "light", t: "밝게" }, { v: "dark", t: "어둡게" }];

type Health = { counts: { ready: number; unchecked: number; fix: number } };

/** YETA act 행 — [픽토][제목·설명][값·꺾쇠] · 펼침 칸이 있으면 aria-expanded */
function Act({ ic, t, d, v, vt, mod, open, onClick }: { ic: YIcon; t: string; d?: ReactNode; v?: string; vt?: boolean; mod?: boolean; open?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="yset-item" aria-expanded={open} onClick={onClick}>
      <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO[ic] }} />
      <span className="si-lbl"><span className="si-t">{t}</span>{d ? <span className="si-d">{d}</span> : null}</span>
      <span className="si-v">{v ? (vt ? <span className={`si-vt${mod ? " mod" : ""}`}><DiffValue value={v} /></span> : <i className="si-vv"><DiffValue value={v} /></i>) : null}<Svg k="chev" /></span>
    </button>
  );
}

/** YETA info 행(.ro) — 읽기만 */
function Info({ ic, t, d, v }: { ic: YIcon; t: string; d?: string; v?: string }) {
  return (
    <button type="button" className="yset-item ro" aria-disabled="true">
      <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO[ic] }} />
      <span className="si-lbl"><span className="si-t">{t}</span>{d ? <span className="si-d">{d}</span> : null}</span>
      <span className="si-v">{v ? <i className="si-vv"><DiffValue value={v} /></i> : null}</span>
    </button>
  );
}

export function YetaSettings() {
  const { preference, setPreference } = useTheme();
  const skin = useSkin();
  const [open, setOpen] = useState("");
  const health = useQuery({ queryKey: ["nomute", "health"], queryFn: () => office<Health>("health"), refetchInterval: 60_000 }).data?.counts;
  const build = useBuildLine();
  const teamsName = useTeamsName();
  const theme = THEME.find((x) => x.v === preference) || THEME[0];
  const pinA = usePinAlpha();   // 고정 줄 색 진하기 = 줄 오른쪽 값(./pin-tint)
  const row = (id: string, ic: YIcon, t: string, body: ReactNode, v?: string) => [   // 줄 밑 설명 뺌(형 11-02 08:1x 「옆에 설명글은 빼줘」)
    <Act key={id} ic={ic} t={t} v={v} open={open === id} onClick={() => setOpen((o) => (o === id ? "" : id))} />,
    open === id ? <div key={id + ":open"} className="yset-open">{body}</div> : null,
  ];
  const [open2, setOpen2] = useState("");   // 묶음 안 펼침 줄(구독 기기 · 화면 잠금)
  const sub = (id: string, ic: YIcon, t: string, body: ReactNode) => [
    <Act key={id} ic={ic} t={t} open={open2 === id} onClick={() => setOpen2((o) => (o === id ? "" : id))} />,
    open2 === id ? <div key={id + ":open"} className="yset-open">{body}</div> : null,
  ];
  const group = (id: string, ic: YIcon, t: string, v: string | undefined, kids: ReactNode) => [   // 묶음 줄 = 누르면 그 아래 줄들이 펼쳐짐
    <Act key={id} ic={ic} t={t} v={open === id ? undefined : v} open={open === id} onClick={() => setOpen((o) => (o === id ? "" : id))} />,
    open === id ? <div key={id + ":open"} className="yset-open yset-kids">{kids}</div> : null,
  ];
  return (
    <Pane title="설정">
      <div className="yeta-set mt-2">
        <span className="ycd-nm yset-ttl"><Svg k="gear" />설정</span>
        <section className="yset-part" aria-label="화면·입력">
          <div className="yset-sec">화면·입력</div>
          <div className="yset-grp">
            {/* 비슷한 줄끼리 한 줄로 묶고 누르면 펼침(형 11-14 「설정같은거, 예를들어 폰트면 펼쳐서 한글, 영문 이런거 묶을수잇잖아」) — 14줄 → 6줄 · 펼침 꼴 = 원래 있던 .yset-open 그대로 */}
            {group("look", "contrast", "화면", `${theme.t} · ${skin === "garden" ? "정원" : "지금"}`, <>
              <Act ic="contrast" t="테마" v={theme.t} vt mod={theme.v !== "system"}
                onClick={() => setPreference(THEME[(THEME.indexOf(theme) + 1) % THEME.length].v)} />
              <Act ic="screen" t="꾸밈" v={skin === "garden" ? "정원" : "지금"} vt mod={skin === "garden"}
                onClick={() => {   // 정원 = 밝은 꾸밈이라 어둡게였으면 밝게로 같이(정원 CSS 는 :not(.dark) 에서만 먹음)
                  const next = skin === "garden" ? "now" : "garden";
                  if (next === "garden" && document.documentElement.classList.contains("dark")) setPreference("light");
                  setSkin(next);
                }} />
            </>)}
            {group("font", "type", "글꼴", undefined, <ChatFontRows />)}
            {group("input", "keys", "입력 · 표시", undefined, <><EnterKeyRow /><ThinkMarkRow /></>)}
            {group("alert", "bell", "알림 · 구독", undefined, <>   {/* 받는 것 한 묶음 = 알림 켜기 · 받는 기기 · 받아 오는 채널 · 받은 알림 */}
              <PushRow />
              <TeamsNotiRows />   {/* 팀즈 알림 폰 · PC 따로(깃 #-032 · 폰 기본 끔) */}
              {sub("pushdevs", "bell", "구독 기기", <Suspense fallback={null}><PushDevsModal /></Suspense>)}
              {sub("snsacc", "users", "구독 채널", <Suspense fallback={null}><SnsAccModal /></Suspense>)}
              <Act ic="bell" t="받은 알림 · 키워드" onClick={() => { location.hash = "#/edmsgs"; }} />   {/* 서랍 「알림」 → 설정(형 11-14 「알림 > 설정으로」) · 화면은 그대로(알림메세지 + 키워드 알림 탭 · ./msgs-kw.tsx) */}
            </>)}
            {group("hide", "screen", "가림 · 잠금", undefined, <>
              <BlindRows />   {/* 쉴 때 화면 가림 · 지금 가리기(형 11-06 17:31 · ./idle-blind.tsx) */}
              {sub("lock", "keys", "화면 잠금", <Suspense fallback={null}><LockModal /></Suspense>)}
            </>)}
            {row("genopt", "layers", "AI 썸네일 옵션", <Suspense fallback={null}><GenOptModal /></Suspense>)}
          </div>
        </section>
        <section className="yset-part" aria-label="봄의 정원">
          <div className="yset-sec">봄의 정원</div>
          <div className="yset-grp">
            {row("sched", "clock", "스케줄러 바꾸기", <NomuteSchedule />)}
            {/* 지정방 멤버 = 대화 목록 방 메뉴 「멤버」로 옮김(형 11-05 08:35 「그냥 톡 목록에서 설정하게 일원화해야람」 · 「따로노니까 문제」) */}
            {row("pintint", "layers", "고정 줄 색", <PinTintSetting />, `${pinA}%`)}   {/* 고정 줄 바탕 진하기(형 11-14 23:39 「설정에서 변경하게 만들어도 돼 값을 투명도」 · ./pin-tint · 뜸) */}
            {row("notice", "speaker", "공지 설정", <NomuteNotice />)}   {/* 원본 「공통 지시」(Standing instructions)는 원본 서버 길(/api/settings/instructions)을 불러 우리 사무실에선 늘 못 읽음 → 같은 일 = 공지 판이라 줄을 하나로(형 11-02 06:58 「설정에 이렇게 뜨는 부분들 홛인해주고」 · 빠르) */}
            {/* 봇 쪽 설정(PM · 봇 상자 모델 · 노력도 · 계정 우선순위 · 호출 맥락 · 그록봇 지침 · 지금 봇) = 애들 화면 한 곳으로 옮김 → 여긴 가는 길 하나(형 11-16 19:35 dm-bom 「거기에 봇 관련된 설정은 통합시키려고해」 · 19:36 「한쪽에 몰아버리고 싳은거임」 · 봄 21:30 「가」) */}
            <Act ic="bot" t="애들 설정" v="애들에서" onClick={() => { location.hash = "#/drawer"; }} />
            {row("models", "bot", "일 모델 · 노력도", <ModelSetRows bots={false} />)}   {/* 남긴 것 = 서버가 직접 부르는 일 · 파이프라인(봇이 아니라 일 쪽) */}
            {row("teams", "chat", "팀즈", <TeamsAccount />, teamsName)}
            {row("vault", "keys", "보안 서랍", <NomuteVault />)}
          </div>
        </section>
        <section className="yset-part" aria-label="살펴보기">
          <div className="yset-sec">살펴보기</div>
          <div className="yset-grp">
            {row("health", "check", "점검표", <NomuteHealth />,
              health ? (health.fix ? `고칠 것 ${health.fix}` : health.unchecked ? `확인 안 됨 ${health.unchecked}` : "다 준비됨") : undefined)}
            {row("meter", "gauge", "회의실 계기판", <NomuteMeter />)}
          </div>
        </section>
        <section className="yset-part" aria-label="기록·정보">
          <div className="yset-sec">기록·정보</div>
          <div className="yset-grp">
            {row("old", "chat", "옛 그록 대화", <NomuteOld />)}
            <Info ic="info" t="지금 판" d={build.fresh ? `새 판 있음(${build.fresh})` : undefined} v={build.now} />   {/* 설명 꼬리 뺌 · 판이 저절로 안 바뀜(새 판 알약 누름) — 새 판 때만 남김(형 11-02 08:1x 「옆에 설명글은 빼줘」) */}
            {/* 원본 「키보드 단축키」 = 키보드 있는 화면(md~)만 · 읽기만(원본 그대로 · 바꿀 수 없음) */}
            <div className="hidden md:block">{HOTKEYS.map((h) => <Info key={h.id} ic="keys" t={h.label} v={formatHotkey(h.combo).join(" ")} />)}</div>
          </div>
        </section>
      </div>
    </Pane>
  );
}

/** 팀즈 알림 두 줄(폰 · PC) — 형 11-15 05:20 「기본값이 모바일은 알람 안뜨기로 … pc랑 개별로 설정되서 토글되도록」 · 이 기기에 기억 */
function TeamsNotiRow({ k, t }: { k: TeamsNotiKind; t: string }) {
  const on = useTeamsNoti(k);
  return (
    <button type="button" className={`yset-item${on ? " on" : ""}`} aria-pressed={on} onClick={() => setTeamsNoti(k, !on)}>
      <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.bell }} />
      <span className="si-lbl"><span className="si-t">{t}</span></span>
      <span className="si-sw" aria-hidden />
    </button>
  );
}
function TeamsNotiRows() { return <><TeamsNotiRow k="phone" t="팀즈 알림 · 폰" /><TeamsNotiRow k="pc" t="팀즈 알림 · PC" /></>; }

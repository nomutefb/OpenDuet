// 새 사무실 껍데기 = YETA 껍데기 꼴(형 10-28 11:22 「네비는 늘 위 · 옮겨도 뒤 그대로」 · 11:26 「뼈대 그대로로 yeta로」 · 장부 office-yeta-chat.md 「껍데기 이음 꼴」)
//   로그인 뒤 공통 자리(원본 _authed 라우트 Outlet 둘레 · overrides.ts PATCH)에 한 번만 섬 → 어디로 가도 껍데기는 그대로
//   판(네비 칸 · 형 12:24 · 10-31 15:1x 「에디터랑 겹칠 필요는없는거같아」 · 「에디터는 그냥 서랍 누르면 뜨면 될듯.」 = 에디터 판 뺌) = 홈 · 대화방(목록) · 대화 — 처음 갈 때 한 번 그리고 계속 살려 둠(숨김만 = 스크롤·쓰던 글 그대로) · 들어오는 판 = YETA ypickIn(./shell.css)
//   모달(≡ 서랍 · 형 12:24~12:26 「덜 중요한걸 좀 더 세부로 모으려는 의도」) = 할 일 · 러너 · LEGACY · 뉴스 요약 · 채널 요약 · SNS · 요약 요청 · 에디터 · 결의 방 · 토큰 · 피드백 · 설정 — 판 위에 덮고 닫으면 아래 판 그대로
//     에디터 판(editor-menu 패널)에만 있던 LEGACY·에디터(카드 제작·영상·유튜브)는 서랍 칸으로 옮겨 잃지 않음(형 10-31 15:1x · 빠르 판) · 나머지 네 칸은 이미 서랍 것(겹침 = 에디터 판 쪽을 뺌)
//     결의 방·토큰·피드백 = 앱 안(./gyeol-room.tsx · tokens.tsx · feedback.tsx · 전엔 에디터 원본 화면 viewer/gyeol-room.html · tokens.html · feedback.html 을 품음) · 설정 = 원본 settings 화면(보조 03 YETA 설정)
//   그 밖 길(할 일 하나 보기 등) = 판 위에 덮는 쪽(원본 머리 = 뒤로) · PC(768px~) = 왼쪽 끝 얼굴 띠(형 11:21~11:26)
//   누르면 앱 밖으로 나가던 링크 = #/web 판(앞 판·앞 모달 위에 한 겹 · 「<」 = 그대로 돌아감 · ./inapp.ts · 형 15:32 「모두 누르면 앱 내에서 작동되게」) · 네비 = 모달 위(형 「네비게이션은 유지」)
import { Oops } from "./oops";   // 칸 깨짐 = 작은 에러 판(형 11-14 05:18)
import { MeetLogList } from "./meet";   // 서랍 「화상회의」(형 11-13)
import { PinMark } from "./pin-mark";
import { TodoBar } from "./todo-bar";
import { ChatHead } from "./chat-head";
import { RunnerGauges } from "./runner-gauges";   // PC 반갈 러너 칸(봄 11-05)
import { IgFbBand } from "./igfb-band";   // PC 오른쪽 위 = 인스타·페북 팔로워 띠(봄 11-08 · 형 dm 07:30~07:31)
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Component, type CSSProperties, type ReactNode, Suspense, lazy, useEffect, useRef, useState } from "react";
import { clampW, snapW } from "./split-snap";   // 경계 끌기 자석 · 눈금(형 11-14 05:07 · 05:15)
import { AttentionNotifier } from "@/components/bot-profile/attention";
import { DuetIcon } from "@/components/duet/icons";
import { useTabSpace } from "@/components/shell/app-shell";
import { ChatPresenceProvider, useChatServerBusy, useServerWork } from "@/components/shell/chat-presence";
import { FinishedForYou } from "@/components/shell/finished-for-you";
import { PageHeader, ShellHeader } from "@/components/shell/header";
import { PageChromeProvider } from "@/components/shell/page-chrome";
const TasksScreen = lazy(() => import("@/components/shell/tasks-screen").then((m) => ({ default: m.TasksScreen })));
import { useChannelEvents } from "@/lib/channels/use-channel-events";
import { Route as SettingsIndex } from "@/routes/_authed/settings/index";
import { HomeScreen } from "../home/home-screen";
import { NewsList } from "../home/news-list";
import { NewsSummary } from "../home/news-summary";   // PC 반갈 아래 칸 = 실시간 뉴스 제목 목록(형 11-05 14:39)
const SchedDesk = lazy(() => import("./sched-desk").then((m) => ({ default: m.SchedDesk })));
const StatusBoard = lazy(() => import("./status-board").then((m) => ({ default: m.StatusBoard })));
const NewsEditor = lazy(() => import("./news-editor").then((m) => ({ default: m.NewsEditor })));   // 네비 4번 「뉴스 에디터」(형 11-09 08:50 · 시아 08:54 안 · 봄 33)
import { StatusLights, SyncVersion } from "./status-line";
import { TabBar as TopTabBar } from "./tab-bar";   // 위쪽 탭 줄 · 이름 갈림(아래 ../swap/tab-bar 의 TabBar = 아래 네비 · 같은 이름 둘 = 빌드 막힘 · 모루 #3000 · 봄)(형 11-09 05:16 · 시아 05:23 자리 · 빠르)   // 맨 아래 상태 한 줄(④ · 빠르 11-06)
import { DrawerPage } from "./drawer-page";
import { WaveBg } from "./wave-bg";   // 설정·서랍 뒤 물결(형 11-01)
import { TabBar } from "../swap/tab-bar";
import { SceneBg } from "./thumb-maker/scene-bg";
import "../home/home-scene.css";
import "./fs-tokens.css";   // 글자 크기 기준값 한 곳(빠르 11-08 · 시아 02:14 표)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HYUNG_ID, idOf, office, roomAgentIds } from "../data/office";
import { enterRoom } from "../data/read-state";
import { FaceImg, FaceStack } from "./faces";
import { frameUrl, hookFrame, listenAppLinks, toneFrame } from "./inapp";
import { deliverStudio } from "./studio-handoff";   // 카드 제작 → 영상 편집 넘김(품은 edit.html 이 뜨면 영상 넣기 · 번개 11-08)
const WebPane = lazy(() => import("./web-pane").then((m) => ({ default: m.WebPane })));
import { ModalBox } from "./modal-box";   // 큰 창 넷 = Esc · Tab 가두기 · 포커스 돌려주기(빠르 11-08)
const IssueView = lazy(() => import("./issue").then((m) => ({ default: m.IssueView })));
import { PinBar } from "./pins";
import { OfficeChat, roomMsgsOptions } from "./office-chat";
import { isTeams, useOfficeMode, useTeamsMode } from "./teams";
import { IdleBlind, TopClock } from "./idle-blind";
import { AppIntro } from "../home/intro";
import { NewsModal, newsFileOf } from "./news";
const ThumbHist = lazy(() => import("./thumb-hist").then((m) => ({ default: m.ThumbHist })));   // 서랍 「썸네일 이력」(형 11-01 「그 내 뉴스 에디터에서 쓰는 썸네일 … 완전히 내재화 부탁해.」)
const FeedModal = lazy(() => import("./feed").then((m) => ({ default: m.FeedModal })));   // 서랍 「뉴스 전체」 = 에디터 피드 탭 네이티브(형 11-01 「그치 이거지. 이 느낌으로 살리면돼.」 · 「이런식으로 다 가져와주라」)
const ChanModal = lazy(() => import("./chan").then((m) => ({ default: m.ChanModal })));
const TrendModal = lazy(() => import("./trend").then((m) => ({ default: m.TrendModal })));   // 서랍 「SNS 전체」 = 에디터 트렌드 탭 네이티브(전엔 FRAME 으로 품음)
const ScrapModal = lazy(() => import("./scrap").then((m) => ({ default: m.ScrapModal })));   // 서랍 「LEGACY」 = 에디터 수집함 탭 네이티브(전엔 FRAME 으로 품음)
const TokensModal = lazy(() => import("./tokens").then((m) => ({ default: m.TokensModal })));   // 서랍 「토큰」·「결의 방」·「피드백」 = 에디터 페이지 네이티브(전엔 FRAME 으로 품음)
const GyeolModal = lazy(() => import("./gyeol-room").then((m) => ({ default: m.GyeolModal })));
const StoriesModal = lazy(() => import("./stories").then((m) => ({ default: m.StoriesModal })));   // 밥상 이야기(형 11-04 15:4x · 서랍 칸 · 밥상 방 오른쪽 위 그림은 ./room-search.tsx)
const FeedbackModal = lazy(() => import("./feedback").then((m) => ({ default: m.FeedbackModal })));
const QueueModal = lazy(() => import("./queue").then((m) => ({ default: m.QueueModal })));
const MsgsModal = lazy(() => import("./msgs").then((m) => ({ default: m.MsgsModal })));
const YsModal = lazy(() => import("./ys").then((m) => ({ default: m.YsModal })));
const SongModal = lazy(() => import("./song").then((m) => ({ default: m.SongModal })));
const KPromptModal = lazy(() => import("./kprompt").then((m) => ({ default: m.KPromptModal })));   // 서랍 「프롬프팅」 = 옛 에디터 영상 프롬프트 창(viewer/k.html) 앱 안(봄 11-10 23:09 · 번개)
const TrCardModal = lazy(() => import("./trcard").then((m) => ({ default: m.TrCardModal })));   // 서랍 「번역카드」 = 옛 에디터 번역 창(viewer/tr.html) 앱 안(봄 11-10 23:09 · 번개)
const VdModal = lazy(() => import("./vd").then((m) => ({ default: m.VdModal })));   // 서랍 「큐영상」 = 옛 에디터 큐 영상 창(viewer/vd.html) 앱 안(team-4 뎅 11-10)   // 서랍 「음원」 = 옛 에디터 음원 창(viewer/song.html) 앱 안(team-4 뎅 · 형 11-10 15:48 「응 에디터에 잇는거 다 정원으로 가져왕」)
const ConvModal = lazy(() => import("./conv").then((m) => ({ default: m.ConvModal })));   // 서랍 「변환」 = 옛 에디터 변환 창(viewer/conv.html) 앱 안(team-4 U3 뎅 · 형 11-10 14:23 「응 밖에잇는거 다 옮길거야」)   // 서랍 「유튜브」 = 옛 에디터 유튜브 탭 네이티브(team-4 · 형 11-10 14:23 「응 밖에잇는거 다 옮길거야」)
const VideoEditor = lazy(() => import("./video-editor"));   // 서랍 「영상 편집」 = 옛 비디오 에디터 화면 그대로(형 11-13 13:21 · 앞 판 = ./vedit.tsx 새 판 · 깃 11-10)
const SbModal = lazy(() => import("./sb").then((m) => ({ default: m.SbModal })));   // 서랍 「스토리보드」 = 옛 에디터 콘티 판 1(team-4 · 깃 11-11)
const NbModal = lazy(() => import("./nb").then((m) => ({ default: m.NbModal })));   // 서랍 「미디어 요약」 = 옛 에디터 미디어 요약 판 1(team-4 · 깃 11-10)
const TrackModal = lazy(() => import("./track").then((m) => ({ default: m.TrackModal })));   // 서랍 「트래킹」 = 옛 에디터 트래킹 판 1(team-4 · 깃 11-10)   // 서랍 「영상 편집」 = 옛 에디터 영상 편집 탭 네이티브 판 1(team-4 · 깃)
const AcctModal = lazy(() => import("./acct").then((m) => ({ default: m.AcctModal })));   // 서랍 「계정 전환」 = 에디터 설정 ▸ 계정 전환을 앱 안으로(봄 11-01)
const GenOptModal = lazy(() => import("./genopt").then((m) => ({ default: m.GenOptModal })));   // 서랍 「생성 옵션」 = 에디터 설정 ▸ 기본값 그림 줄을 앱 안으로(봄 11-01)
const LockModal = lazy(() => import("./lock").then((m) => ({ default: m.LockModal })));   // 서랍 「잠금」 = 에디터 설정 ▸ 자동 잠금을 앱 안으로(봄 11-01)
const KwModal = lazy(() => import("./kw").then((m) => ({ default: m.KwModal })));   // 서랍 「키워드 알림」 = 에디터 설정 ▸ 키워드 알림을 앱 안으로(봄 11-01)
const SnsAccModal = lazy(() => import("./snsacc").then((m) => ({ default: m.SnsAccModal })));   // 서랍 「구독 채널」 = 에디터 설정 ▸ 구독 채널을 앱 안으로(봄 11-01)
const DownloadModal = lazy(() => import("./dl").then((m) => ({ default: m.DownloadModal })));   // 서랍 「다운로드」 = 에디터 설정 ▸ 다운로드를 앱 안으로(봄 11-01)
const PushDevsModal = lazy(() => import("./push-devs").then((m) => ({ default: m.PushDevsModal })));   // 서랍 「구독 기기」 = 에디터 설정 ▸ 구독 기기를 앱 안으로(봄 11-01)
const SensorModal = lazy(() => import("./sensor").then((m) => ({ default: m.SensorModal })));   // 서랍 「센서」 = 에디터 설정 ▸ 센서를 앱 안으로(봄 11-01)
const MemoModal = lazy(() => import("./memo").then((m) => ({ default: m.MemoModal })));   // 서랍 「메모」 = 에디터 설정 ▸ 메모를 앱 안으로(봄 11-01)   // 서랍 「알림메세지」 = 에디터 알림함을 앱 안으로(봄 11-01)   // 서랍 「대기열」 = 에디터 대기열 창을 앱 안으로(봄 11-01)
const SnsModal = lazy(() => import("./sns").then((m) => ({ default: m.SnsModal })));
const ThumbMaker = lazy(() => import("./thumb-maker"));   // 서랍 「에디터」 = 썸네일 생성기 앱 안(형 11-02 09:28 「이거 아예 이 디자인하고 배경 살려서 인앱 안으로 넣어줘」 · 원본 엔진·CSS 가 커서 열 때만 받음)
const AskModal = lazy(() => import("./ask").then((m) => ({ default: m.AskModal })));   // 서랍 「요약 요청」(에디터 넷째 탭 기능 → 서랍 네이티브 · 형 10-31 「기능들이 다 서랍으로」)
import { RoomIcon, RoomList, useRoomOrder } from "./room-list";
import { RoomFab } from "./room-fab";   // 대화방 우하단 단추(형 11-01)
import { DecideFab } from "./decide-pop";   // 대화방 우하단 + 위 = 형 결정 노트 단추(형 11-01 08:36)
import { useSplit, useWide } from "./side";
import "./shell.css";
import "./theme-garden.css";   // 꾸밈 「정원」(html[data-theme=garden]:not(.dark) 에서만 · ./skin.ts · 뜸 11-07 시안)
import "./theme-light.css";   // 밝게(정원 아님) PC 대시보드 글자색(시아 11-08 · 다크·정원 손 0)
import { selfBackNow } from "./self-back";

export type Pane = "home" | "rooms" | "chat";
export type Modal = "tasks" | "runner" | "meetlog" | "legacy" | "ask" | "news" | "thumbhist" | "chan" | "sns" | "edtool" | "feed" | "trend" | "chanfull" | "askfull" | "edq" | "edsearch" | "eddl" | "edys" | "edconv" | "edsong" | "edk" | "edtr" | "edvd" | "edvid" | "edtrack" | "ednb" | "edsb" | "edmsgs" | "edmemo" | "edsensor" | "edkw" | "edsnsacc" | "edpush" | "edgenopt" | "edlock" | "edacct" | "gyeol" | "story" | "play" | "tokens" | "feedback" | "settings" | "sched" | "drawer" | "status" | "nedit";
/** 서랍 차례(형 12:25·12:26) — 이름 · 그림 · 길 */
export const MODALS: { id: Modal; label: string; icon: "tasks" | "activity" | "sparkle" | "bolt" | "reply" | "settings" | "chat" | "dashboard" | "globe" | "page" | "inbox" | "plus" | "menu" | "calendar" | "search" | "box" | "bell" | "file" | "phone" | "sort" | "lock" | "key" | "layout"; to: string; desc?: string }[] = [
  { id: "tasks", label: "할 일", icon: "tasks", to: "/tasks" },
  { id: "nedit", label: "뉴스 에디터", icon: "page", to: "/newsed" },   // 네비 4번 = 뉴스 에디터(형 11-09 08:50 「뉴스 에디터가 4번 메뉴에 보이게 해주고 / 요약된 내용이 여기에 일제히 나오게 해줘」 · ./news-editor.tsx · 서랍 목록엔 안 넣음)
  { id: "status", label: "작동", icon: "activity", to: "/status" },   // 네비 4번 = 작동 표(형 11-05 · ./status-board.tsx · 서랍 목록엔 안 넣음)
  { id: "sched", label: "스케줄", icon: "calendar", to: "/sched" },   // 서랍 「일」 칸(형 11-05 「스케줄러는 메뉴5번 서랍 안으로 넣을게」 · 옛 네비 4번)
  { id: "runner", label: "러너", icon: "activity", to: "/runner" },
  { id: "meetlog", label: "화상회의", icon: "chat", to: "/meetlog", desc: "끝난 회의 기록" },   // 화상회의 기록 서랍(형 11-13 06:5x 「대화가 끝나면 그 대화는 기록되어서 한 서랍에 들어가면돼」 · ./meet.tsx · 서버 meetlog)   // 서랍 「일」 칸 = 작동 표(러너 · 형 11-09 08:50 · 옛 RunnerScreen 은 뺌)
  { id: "legacy", label: "LEGACY", icon: "inbox", to: "/legacy", desc: "수집함 · 고르기·묶기·PICK" },   // 에디터 「LEGACY(레거시)」 = 수집함(옛 에디터 판 칸 → 서랍 · 형 10-31 15:1x) · 앱 안(./scrap.tsx · 전엔 /?tab=scrap 품음)
  { id: "ask", label: "요약 요청", icon: "chat", to: "/ask", desc: "글·링크·사진 · 링크 판별·초안 보존" },   // 에디터 ＋ 「요약 요청」 = 같은 api/submit · 서랍에서 바로
  { id: "thumbhist", label: "썸네일 이력", icon: "layout", to: "/thumbhist", desc: "만든 썸네일 보기·저장" },   // 에디터 썸네일 「이전 제작」(thumb-hist.json · ./thumb-hist.tsx)
  { id: "chan", label: "채널 요약", icon: "dashboard", to: "/chan", desc: "한눈" },   // 에디터 「채널 요약」 한눈(전체 보기 = #/web)
  { id: "sns", label: "SNS", icon: "globe", to: "/sns", desc: "한눈" },   // 에디터 「SNS」 한눈(전체 보기 = #/web)
  { id: "edtool", label: "에디터", icon: "plus", to: "/edtool", desc: "카드 제작·영상 편집·유튜브" },
  // 에디터 첫 화면 탭·도구를 서랍 칸마다 바로(형 11-01 「edit.nomute.kr에 있는 기능들 모두 매우 자연스럽게 메뉴 5번으로 완전히 녹여줘 / 지금 저 기능이 완전히 유지되어야해」 · 공통/문서/2026-11-01-서랍-에디터-이식/안.md)
  { id: "news", label: "뉴스 기사", icon: "page", to: "/news", desc: "최신 목록·기사 요약" },   // 에디터 「뉴스 요약」 목록(누르면 앱 안 기사 한 장 = #/news?a=<file> · 썸네일·본문·카드 · 고치기만 에디터)
  { id: "feed", label: "뉴스 요약", icon: "page", to: "/feed", desc: "요약한 기사 · 기사 한 장" },   // 용어 = 뉴스 요약(형 11-01 18:0x 「뉴스 요약 < 뉴스 전체는 용어 변경」) · 옛 「뉴스 요약」 짧은 목록 칸은 이 칸과 겹쳐 뺌(#/news 주소는 기사 한 장으로 그대로)   // 에디터 피드 탭(/?tab=feed)을 앱 네이티브로(./feed.tsx · 전엔 FRAME 으로 품음 · 쓰기만 에디터 한 겹)
  { id: "trend", label: "SNS 전체", icon: "globe", to: "/trend", desc: "섹션 전부·구독 채널" },   // 앱 안(./trend.tsx) · 새로 수집·커뮤니티 전송만 「에디터에서」
  { id: "chanfull", label: "채널 전체", icon: "dashboard", to: "/chanfull", desc: "차트·게시물·결의 보드" },
  // 에디터 설정 메뉴 안 칸들(전엔 러너 톱니로만 열림) = 에디터 /?pop=<이름> 딥링크(빠르 11-01 04:23 · 이름 = 봄 안 표)
  { id: "edq", label: "대기열", icon: "tasks", to: "/edq", desc: "재시도·취소" },
  { id: "edsearch", label: "검색", icon: "search", to: "/edsearch", desc: "뉴스 제목·요약에서 찾기" },
  { id: "eddl", label: "다운로드", icon: "box", to: "/eddl", desc: "주소 → 사진·영상·파일" },
  { id: "edys", label: "유튜브", icon: "sparkle", to: "/edys", desc: "영상 주소 → 짧은 인사이트 영상" },
  { id: "edsong", label: "음원", icon: "sparkle", to: "/edsong", desc: "이야기 → 곡 · Suno 프롬프트" },
  { id: "edk", label: "프롬프팅", icon: "sparkle", to: "/edk", desc: "장면 → 영상(Kling) 프롬프트" },   // 옛 에디터 프롬프팅(./kprompt.tsx · 번개 11-10)
  { id: "edtr", label: "번역카드", icon: "sparkle", to: "/edtr", desc: "외국어 문서 사진 → 강조 · 한글 칩" },   // 옛 에디터 번역(./trcard.tsx · 번개 11-10)
  { id: "edvd", label: "큐영상", icon: "layout", to: "/edvd", desc: "기사 골라 → 6초 세로 영상" },   // 옛 에디터 큐 영상(./vd.tsx · team-4 뎅 11-10)   // 옛 에디터 음원(./song.tsx · team-4 뎅 11-10)
  { id: "edconv", label: "변환", icon: "box", to: "/edconv", desc: "영상 비율 · 화질 · 구간 바꾸기" },   // 옛 에디터 변환(./conv.tsx · team-4 U3 뎅 11-10)   // 옛 에디터 ＋ 에디터 › 유튜브 탭(./ys.tsx · team-4 깃 11-10)
  { id: "edvid", label: "영상 편집", icon: "layout", to: "/edvid", desc: "자막 · 자르기 · 비율 · 소리" },   // 옛 에디터 ＋ 에디터 › 영상 편집 탭 판 1(./vedit.tsx · team-4 깃 11-10)
  { id: "edtrack", label: "트래킹", icon: "search", to: "/edtrack", desc: "얼굴 따라 모자이크 · 이름표 · 크로마키" },   // 옛 에디터 트래킹 판 1(./track.tsx · team-4 깃 11-10)
  { id: "ednb", label: "미디어 요약", icon: "file", to: "/ednb", desc: "영상 · 소리 · 글 → 자료 노트" },   // 옛 에디터 미디어 요약 판 1(./nb.tsx · team-4 깃 11-10)
  { id: "edsb", label: "스토리보드", icon: "page", to: "/edsb", desc: "이야기 → 글 콘티 · 시트 · 레퍼런스" },   // 옛 에디터 콘티 판 1(./sb.tsx · team-4 깃 11-11)
  { id: "edmsgs", label: "알림메세지", icon: "bell", to: "/edmsgs", desc: "24시간 알림·조치" },
  { id: "edmemo", label: "에디터 메모", icon: "file", to: "/edmemo", desc: "작업 기록" },
  { id: "edsensor", label: "센서", icon: "activity", to: "/edsensor", desc: "키워드 센서" },
  { id: "edkw", label: "키워드 알림", icon: "bell", to: "/edkw", desc: "키워드 켜기·목록" },
  { id: "edsnsacc", label: "구독 채널", icon: "globe", to: "/edsnsacc", desc: "X·틱톡·인스타·유튜브 계정" },
  { id: "edpush", label: "구독 기기", icon: "phone", to: "/edpush", desc: "알림 받는 기기" },
  { id: "edgenopt", label: "AI 썸네일·이미지", icon: "sparkle", to: "/edgenopt", desc: "엔진·모델·크기·화풍" },
  { id: "edlock", label: "화면 잠금", icon: "lock", to: "/edlock", desc: "잠금·PIN·자동 잠금" },
  { id: "edacct", label: "계정 전환", icon: "key", to: "/edacct", desc: "관리자 · 러너 Claude 계정" },   // 에디터 ＋ 「에디터(카드 제작·영상 편집·유튜브)」 = 도구 창(에디터 /?tool=thumb 그대로 품음 · 옛 에디터 판 칸 → 서랍)
  { id: "gyeol", label: "결의 방", icon: "sparkle", to: "/gyeol" },
  { id: "story", label: "밥상 이야기", icon: "file", to: "/story" },   // 종 틈에 지은 글 모음(형 11-04 15:4x · ./stories.tsx)
  { id: "play", label: "놀이터", icon: "sparkle", to: "/play" },   // 형 10-31 「놀이터를 … 서랍메뉴로 아예 빼줘」 · 주소 = viewer/play
  { id: "tokens", label: "토큰", icon: "bolt", to: "/tokens" },
  { id: "feedback", label: "피드백", icon: "reply", to: "/feedback" },
  { id: "settings", label: "설정", icon: "settings", to: "/settings" },
  { id: "drawer", label: "서랍", icon: "menu", to: "/drawer" },   // 네비 5번 = 한 화면(./drawer-page.tsx) · 설정 = 네비 6번
];
/** PC 반갈에서 좌우 통합(오른쪽 러너·뉴스 칸 접고 왼쪽을 다 씀) = 러너 · 서랍 · 설정(형 11-08 01:29 「러너 누르면 좌우 통합해서 화면쓸게. 서랍과 설정도 좌우 통합해서 표기하도록 할게 넓게 표현. 가능한 묶을 수있는 걸 더 카테고라이징 해서 표현」 · 윈터 넘김) · 오른쪽 칸은 숨김만(살려 둠 = 닫으면 다시 안 그림) */
const SPREAD = new Set<Modal>(["runner", "drawer", "settings", "nedit"]);   // nedit = 뉴스 에디터 두 칸(목록 · 기사 한 장)이 좌우 다 씀
const FRAME: Partial<Record<Modal, string>> = { play: "/play/" };   // 에디터 「에디터」(edtool) 는 이제 앱 안(./thumb-maker · 전엔 /?tool=thumb&inapp=1 품음)   // 에디터 원본 화면 그대로(같은 사이트 · 탭·도구 = editor-menu/read.ts linkOf 와 같은 딥링크 문법)

type Where = { pane: Pane } | { modal: Modal } | { web: true } | { issue: string } | { page: true } | { bare: true };
/** 길 → 판·모달 · page = 판 위에 덮는 원본 화면 · bare = 껍데기 없이(가입 안내 등) */
export function whereFor(pathname: string): Where {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/" || p === "/home") return { pane: "home" };   // 앱 열면 = 홈(형 12:21 「홈이 뜨는 지금이 맞고」 · PM 12:55)
  if (/^\/(channels|group)\/[^/]+$/.test(p)) return { pane: "chat" };   // 회의실 = #/group/all
  if (p === "/rooms") return { pane: "rooms" };
  if (p === "/editor") return { pane: "home" };
  if (p === "/askfull") return { modal: "ask" };   // 옛 「요약 요청 · 에디터 판」 주소 = 앱 요약 요청(빠르 11-01 · 합침)   // 옛 에디터 판 주소(즐겨찾기·옛 링크) = 홈으로(판 없음 · 칸은 서랍에)
  const m = MODALS.find((x) => x.to === p);
  if (m) return { modal: m.id };
  if (p === "/web") return { web: true };   // 앱 밖 주소 = 앱 안 한 겹(#/web?u=…)
  const iss = p.match(/^\/issue\/(\d+)$/);
  if (iss) return { issue: iss[1] };   // 우리 저장소 이슈 = 앱 안 「< 이슈 N」 한 겹(./issue.tsx)
  if (/^\/(onboarding|sign)/.test(p)) return { bare: true };
  return { page: true };
}
const roomOf = (pathname: string) => { const m = pathname.match(/^\/(?:channels|group)\/([^/]+)/); return m ? decodeURIComponent(m[1]) : "all"; };
export const chatHref = (room: string) => (room === "all" ? "/group/all" : `/channels/${encodeURIComponent(room)}`);
const paneHref = (pane: Pane, room: string) => (pane === "chat" ? chatHref(room) : `/${pane}`);

const SettingsPage = SettingsIndex.options.component as () => ReactNode;

export function NomuteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const nav = useNavigate();
  const where = whereFor(pathname);
  const wide = useWide();
  const split = useSplit();   // PC 반갈(오른쪽 반 = 위 러너 · 아래 뉴스 · ./side.tsx)
  const [room, setRoom] = useState(() => roomOf(pathname));
  const [base, setBase] = useState<Pane>(() => ("pane" in where ? where.pane : "chat"));   // 모달·덮는 쪽 아래에 깔린 판
  const [open, setOpen] = useState<Set<Pane>>(() => new Set(["pane" in where ? where.pane : "chat"]));
  const pane = "pane" in where ? where.pane : base;
  const web = "web" in where ? new URLSearchParams(searchStr).get("u") || "" : null;
  const [under, setUnder] = useState<Modal | null>(null);   // #/web 아래에 깔린 앞 모달(돌아오면 그대로)
  const issue = "issue" in where ? where.issue : null;
  const layer = web != null || issue != null;   // #/web · #/issue = 앞 모달 위 한 겹
  const modal = "modal" in where ? where.modal : layer ? under : null;
  useEffect(() => listenAppLinks(), []);
  useEffect(() => {
    if ("modal" in where) setUnder(where.modal);
    else if ("pane" in where) setUnder(null);
    if (!("pane" in where)) return;
    if (where.pane === "chat") {
      const nextRoom = roomOf(pathname);
      if (base !== "chat" || room !== nextRoom) enterRoom(nextRoom);
      setRoom(nextRoom);
    }
    setBase(where.pane);
    if (!open.has(where.pane)) setOpen((s) => new Set(s).add(where.pane));
  }, [pathname]);   // eslint-disable-line react-hooks/exhaustive-deps
  useChannelEvents();
  // 대화 판에서 뒤로가기 = 늘 대화방 목록으로(형 10-31 09:4x 「3번째 대화창에서 뒤로가기하면 바로 2번으로 가게해주고」 · 셋째 칸 대화 → 둘째 칸 대화방)
  //   해시 기록은 「바로 앞 주소」(앞 방·홈)로 돌아가므로, 대화 판이 맨 위에 있을 때 popstate 가 오면 그 자리를 /rooms 로 바꿔 끼움(replace · 기록 한 칸만 씀) · 모달·#/web·이슈 한 겹이 위에 있으면 그쪽 「<」 가 맡음
  useEffect(() => {
    if (pane !== "chat" || modal || layer || "page" in where) return;
    const onPop = (e: PopStateEvent) => {
      if (!e.state) return;   // location.hash = 로 옮길 때도 popstate 가 옴(state 없음 · 프로필 「대화」·앱 안 링크) = 뒤로가기 아님
      const w = window as Window & { nmEatPop?: number };
      if (w.nmEatPop && Date.now() - w.nmEatPop < 1500) { w.nmEatPop = 0; return; }   // 판이 스스로 닫히며 깐 칸을 걷는 뒤로(ui/call-sheet.tsx) = 진짜 뒤로 아님
      if ((e as PopStateEvent & { nmEaten?: boolean }).nmEaten || document.querySelector(".nm-zoom, .nm-stk, .ncs-veil")) return;   // 사진 크게 보기 · 움짤 판을 닫는 뒤로 = 대화 판 그대로(ui/office-chat.tsx zoomImage · ui/sticker.tsx · 형 11-13 02:24 「이모지를 지금 하나 인앱에서 올리면 대화창이 목록으로 나가져」) · 「@」 호출 명부(.ncs-veil · ui/call-sheet.tsx 가 한 칸 깖 · 형 11-13 22:13 「호출 하다가 뒤로가면 이 화면 데리고 가는거」 · 셀프 실물 23:10 = 명부는 닫혔는데 방도 목록으로 나감)
      if (selfBackNow()) return;   // 다른 판(움짤 · 결정 · 사진 · 공지 …)이 닫히며 걷은 칸(./self-back.ts) = 형 뒤로 아님(형 11-14 01:24 「폰에서 움짤쓰면 다시 밖으로 나가져 버리네」 · 뎅)
      const at = location.hash.replace(/^#/, "") || "/";
      if (at !== "/rooms") void nav({ to: "/rooms", replace: true });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [pane, modal, layer, where, nav]);
  const chat = useChatServerBusy(pane === "chat" && !modal);
  const serverWork = useServerWork(chat.busy, chat.threadId);
  const stage = useRef<HTMLDivElement>(null);
  useTabSpace(stage);
  if ("bare" in where) return <>{children}</>;

  const SEE = new Set(["settings", "drawer", "edtool", "edvid"]);   // 영상 편집도(형 11-13 13:21 「지금 포토 에디터처럼」)   // 에디터도(형 11-13 02:26 봄 1:1 「지금 수정한 에디터, 뒤에 지금 인앱 배경을 깔아버리면 될듯」)   // 바탕 비치는 판(5번 서랍 · 6번 설정)
  const show = (id: Pane, node: ReactNode) =>
    open.has(id) ? <section key={id} className={`nm-pane ${pane === id ? "on" : ""}`} aria-hidden={pane !== id} inert={pane !== id || undefined}>{node}</section> : null;
  const closeModal = () => {   // 서랍에서 연 칸의 「<」 = 서랍으로(봄 11-01 · 전엔 아래 판(홈·대화방)으로 갔음) · 표지 = drawer-page 가 누를 때 남김
    if (modal === "news" && newsFileOf(searchStr)) {   // 뉴스 기사 한 장의 「<」 = 목록으로(앞 길이 앱 안이면 뒤로 = 보던 자리 · 처음부터 한 장이면 목록 길로)
      if (((history.state as { __TSR_index?: number } | null)?.__TSR_index ?? 0) > 0) history.back();
      else void nav({ to: "/news", replace: true });
      return;
    }
    let back = false;
    try { back = !!modal && modal !== "drawer" && sessionStorage.getItem("nm-from-drawer") === modal; sessionStorage.removeItem("nm-from-drawer"); } catch { /* 저장 못 쓰면 옛 길 */ }
    void nav({ to: back ? "/drawer" : paneHref(base, room) });
  };
  const closeWeb = () => {   // 앞 길이 앱 안이면 뒤로(앞 판·모달 그대로) · 처음부터 #/web 이면 깔린 판으로
    if (((history.state as { __TSR_index?: number } | null)?.__TSR_index ?? 0) > 0) history.back();
    else void nav({ to: under ? MODALS.find((x) => x.id === under)!.to : paneHref(base, room) });
  };
  const M = modal ? MODALS.find((x) => x.id === modal) : undefined;
  return (
    <ChatPresenceProvider serverWork={serverWork}>
      <div className={`duet-touch nm-yeta flex h-svh overflow-hidden bg-duet-surface${split ? " nm-split-root" : ""}${split && modal && SPREAD.has(modal) ? " nm-split-spread" : ""}`}>
        <AttentionNotifier />
        <FinishedForYou />
        {split ? <IdleBlind /> : null}
        {split ? <TopTabBar room={room} pane={pane} /> : null}   {/* 윗줄 왼쪽 = 탭 줄(대시보드 · 방 · 몸 화면 · 「+」) */}
        {/* 윗줄 시계 = 잠시 뺌(형 11-09 09:30 회의실 「그리고 상단에 저 내용이 들어갔으니까, 이제 상단에 시각 표시는 잠시 없애보자」 · 봄 41) · 되살리면 이 줄에 <TopClock /> */}   {/* 윗줄 가운데 시계(형 11-08 09:49 밥상 「맨 위에는 시계가 나오면 될듯」 · 옛 = 위 왼쪽 11-06 20:05 · 가운데 방 이름은 대화창 머리줄로 ./chat-head.tsx) */}
        {split ? <StatusLights className="nm-top-lights" /> : null}   {/* 윗줄 오른쪽 = 정상·아닌 것(형 11-06 22:33 「시선이 분산되, 이거 상단으로 보내는게 맞는듯」 · 22:40 「스케줄러 관련된 내용은 우상단ㅇ으로」 · 부품 = 빠르 status-line.tsx) */}
        {split ? <SyncVersion className="nm-br-syncver" /> : null}   {/* 우하단 = 「동기화 00분 전 • 버전 0000000」(형 22:40 「웹앱 버전은 우하단에 위치시켜 . 동기화도 마찬가지.」) */}
        {/* 윗줄 가운데 = 시계(위 TopClock) · 옛 = 지금 페이지 이름(형 11-06 20:05) · 방 이름은 대화창 머리줄(./chat-head.tsx · 형 11-08 09:49 「그 대화창은 거기에 대화창 명칭이 뜨면 될거같아」) */}   {/* 방 = 이름 한 곳만 · 라임 · 인원 · 누르면 사람·방 메뉴(형 11-06 20:39 「방 위에는 잇을필요없어」 「중상단에 라임으로 잇으면 됨 … 방 인원은 잇어야해」) */}   {/* 위 가운데 = 지금 페이지(형 11-06 20:05) */}
        <AppIntro home={pane === "home"} />   {/* 앱 안 진입 화면(홈 말고 다른 화면으로 처음 열 때 · ../home/intro.tsx · 형 11-06 18:5x) */}   {/* 위 가운데 시계(형 11-06 18:4x) */}   {/* 쉴 때 화면 가림(PC · 형 11-06 17:31 · ./idle-blind.tsx) */}
        {wide ? <FaceStrip current={pane === "chat" ? room : ""} last={room} /> : null}
        <div ref={stage} className={`duet-face relative isolate min-w-0 flex-1 text-duet-ink [--duet-tab-space:86px]${M && SEE.has(M.id) ? " nm-see" : ""}${split ? " nm-split-l" : ""}`}>   {/* nm-see = 비운 판이 열린 동안 밑 화면(홈·대화방)은 숨김(판 너머로 안 비치게) */}
          <SceneBg className="nm-app-ambient" />
          {split ? <TopLeft /> : null}   {/* 왼쪽 위 = 러너 게이지(우리 쪽 · 형 11-08 07:31 dm 「오히려 게이지바가 좌측으로가고, 인스타그램이 우측으로 가서, 우측은 아예 뉴스 관련 내용, 좌측은 너네 관련으로」 · 판들은 그 키만큼 아래로 · shell.css .nm-split-l) */}   {/* 모든 화면 뒤 = 에디터 웹 메인 3D 장면 · 라임 · 옅은 막(형 11-03 14:5x 「여기에도 다 배경 깔아줘 단 너무 강조되면안돼. 글자가 잘보여야되니까」 · home/home-scene.css) */}
          {show("home", <HomeScreen />)}
          {show("rooms", <div className="nm-col"><RoomsPane /></div>)}
          {show("chat", (
            <div className="nm-col">
              {isTeams(room) ? null : <ShellHeader floating menuOpen={false} onMenu={() => {}} />}   {/* 팀즈 대화 = 우리 얼굴 머리 0(TeamsChat 이 제 머리를 그림) */}
              {wide ? null : <button type="button" className="nm-room-back" aria-label="대화방 목록으로" onClick={() => void nav({ to: "/rooms" })}><DuetIcon name="chevronLeft" size={20} /></button>}   {/* 형 10-31 「좌상단에 좌측 꺽쇠가 있어줘야 함」 · 뒤로 버튼 없는 폰 */}
              {isTeams(room) ? null : split ? <ChatHead room={room} key={"head:" + room} /> : <PinBar room={room} key={"pin:" + room}>{room === "guide" ? <TodoBar room={room} /> : null}</PinBar>}   {/* 폰 = 방마다 고정 띠(카톡 꼴 · 형 16:46 · ./pins.tsx) + 밥상 할 일 띠 · PC = 대화창 머리줄(HOT ISSUE 줄 · 방 이름 · 공지·할 일 접는 칸 · ./chat-head.tsx · 형 11-08 08:58 「이 라인에 맞게 대화창도 조정하고」 · 「공지나 할일은 우측에 밥상이야기 처럼 접히게 할게」) */}
              <main className="flex min-h-0 flex-1 flex-col"><OfficeChat room={room} key={room} active={pane === "chat" && roomOf(pathname) === room && !modal && !layer && !("page" in where)} /></main>
            </div>
          ))}
          {"page" in where ? (
            <section className="nm-pane nm-over on">
              <PageChromeProvider>
                <div className="nm-col [--duet-tab-space:max(env(safe-area-inset-bottom),12px)]">
                  <PageHeader />
                  <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
                </div>
              </PageChromeProvider>
            </section>
          ) : null}
          <TabBar pane={"pane" in where ? where.pane : null} modal={modal} chatTo={chatHref(room)} />
          {M ? (
            <ModalBox close={closeModal} className={SEE.has(M.id) ? "nm-modal see" : "nm-modal"} role="dialog" aria-modal="true" aria-label={M.label} inert={layer || undefined}>   {/* see = 5번 서랍·6번 설정 = 판을 비워 껍데기 라임 3D 바탕이 그대로 보임(형 11-03 15:07 「요거 5번 6번 메뉴에도 그대로 적용하자」 · 물결 받침 뺌) */}
              {M.id === "feed" || M.id === "trend" || M.id === "legacy" || M.id === "tokens" || M.id === "gyeol" || M.id === "feedback" ? <WaveBg /> : null}   {/* 뉴스 요약 뒤 물결 = 시범(형 11-01 18:0x 「시범적으로 기본에 웹에 있던 그런 배경하나 깔아봐도좋아」) */}
              {M.id === "edtool" || M.id === "edvid" ? null : (   /* 에디터 = 위 챠콜 머리 줄 통째로 뺌 · ‹ 는 판 머리 「✦ 에디터」 왼쪽(형 11-13 02:24 봄 1:1 「글자를 없애는거 말구, 그냥 위에 네비 챠콜색 저 라인을 다 없애면됨」 · 앞 판 = 글자만 뺌) */
                <div className={`nm-modal-h nm-mh-${M.id}`}>   {/* nm-mh-<id> = 판마다 폰에서 머리 줄 끄기(뉴스 에디터 · 형 11-14 06:58 봄 옮김 「상단 뉴스이디터 없어도 됨」 · shell.css) */}
                  <button type="button" className="nm-modal-back" aria-label="닫기" onClick={closeModal}><DuetIcon name="chevronLeft" size={20} /></button>
                  <b>{M.label}</b>
                </div>
              )}
              <div className={FRAME[M.id] ? "nm-modal-b frame" : M.id === "edtool" || M.id === "edvid" ? "nm-modal-b tm-host" : "nm-modal-b flush"}>   {/* flush = 판이 머리 알약 밑으로 지나감(윗여백 두 겹 0) */}
                <Suspense fallback={<LazyDots />}>   {/* 서랍 창 코드는 눌러야 받음(lazy · 첫 화면 무게 · 번개 11-08) · 받는 동안 점 셋 */}
                {FRAME[M.id] ? <FramePage title={M.label} src={FRAME[M.id]!} />
                  : M.id === "edtool" ? <Suspense fallback={null}><ThumbMaker onBack={closeModal} /></Suspense>   // 썸네일 생성기 = 원본 판·엔진·배경 그대로(./thumb-maker · 머리 「✧ 에디터 · 카드 제작」 = 옛 index 도구 창 꼴)
                  : M.id === "tasks" ? <div className="nm-col"><TasksScreen /></div>
                  : M.id === "meetlog" ? <div className="nm-scroll"><MeetLogList /></div>
                  : M.id === "runner" ? <div className="nm-scroll"><StatusBoard /></div>   /* 서랍 「러너」 = 작동 표(형 11-09 08:50 「러너는 5번 서랍 안으로 … 기존거는 없애면 됨 끌고오는거 아님」 · 옛 RunnerScreen 칸 뺌 · 네비 4번 「작동」 은 33) 뉴스 에디터 판에서 바꿈 · 봄 배분 32) */
                  : M.id === "sched" ? <div className="nm-scroll"><SchedDesk /></div>
                  : M.id === "status" ? <div className="nm-scroll"><StatusBoard /></div>
                  : M.id === "nedit" ? <div className="nm-ned-host"><NewsEditor /></div>
                  : M.id === "drawer" ? <div className="nm-scroll"><DrawerPage /></div>
                  : M.id === "ask" ? <div className="nm-scroll"><AskModal onClose={closeModal} /></div>
                  : M.id === "news" ? <div className="nm-scroll"><NewsModal /></div>
                  : M.id === "thumbhist" ? <div className="nm-scroll"><ThumbHist /></div>
                  : M.id === "feed" ? <div className="nm-scroll"><FeedModal /></div>
                  : M.id === "edsearch" ? <div className="nm-scroll"><FeedModal search /></div>   // 검색 = 뉴스 전체 검색 칸(에디터 검색 창은 피드 목록을 거르는 칸 · 봄 11-01)
                  : M.id === "edq" ? <div className="nm-scroll"><QueueModal /></div>
                  : M.id === "edmsgs" ? <div className="nm-scroll"><MsgsModal /></div>
                  : M.id === "edacct" ? <div className="nm-scroll"><AcctModal /></div>   // 계정 전환 = 앱 안(봄 11-01 · api/account · 20초 뒤 실제 값)
                  : M.id === "edgenopt" ? <div className="nm-scroll"><GenOptModal /></div>   // 생성 옵션 = 앱 안(봄 11-01 · imgProvider·imgOpt 바뀐 칸만 · AI 썸네일 켜기는 PIN 없을 때만)
                  : M.id === "edlock" ? <div className="nm-scroll"><LockModal /></div>   // 잠금 = 앱 안(봄 11-01 · 자동 잠금 분 · 켜기·PIN 은 에디터 설정 줄)
                  : M.id === "edkw" ? <div className="nm-scroll"><KwModal /></div>   // 키워드 알림 = 앱 안(봄 11-01 · 설정 한 장 kwItems·kwAlertOn · 발견 판정은 에디터·서버 그대로)
                  : M.id === "edsnsacc" ? <div className="nm-scroll"><SnsAccModal /></div>   // 구독 채널 = 앱 안(봄 11-01 · 같은 길 api/snsacc · 고친 플랫폼만 저장)
                  : M.id === "eddl" ? <div className="nm-scroll"><DownloadModal /></div>   // 다운로드 = 앱 안(봄 11-01 · 같은 길 vidpeek·vidl·vidlout·linkgrab · 같은 열쇠 = 이전 받기 공유)
                  : M.id === "edys" ? <div className="nm-scroll"><YsModal /></div>
                  : M.id === "edsong" ? <div className="nm-scroll"><SongModal /></div>
                  : M.id === "edk" ? <div className="nm-scroll"><KPromptModal /></div>   // 프롬프팅 = 앱 안(번개 11-10 · 같은 길 api/k · k_out)
                  : M.id === "edtr" ? <div className="nm-scroll"><TrCardModal /></div>   // 번역카드 = 앱 안(번개 11-10 · 같은 길 api/tr · trplan · tr_out)
                  : M.id === "edvd" ? <div className="nm-scroll"><VdModal /></div>   // 큐영상 = 앱 안(뎅 11-10 · 같은 길 api/vd · vd_out)   // 음원 = 앱 안(뎅 11-10 · 같은 길 api/song · song_out)
                  : M.id === "edconv" ? <div className="nm-scroll"><ConvModal /></div>   // 변환 = 앱 안(뎅 11-10 · 같은 길 api/conv · conv_out)   // 유튜브 = 앱 안(깃 11-10 · 같은 길 api/ys · ys_out)
                  : M.id === "edvid" ? <VideoEditor onBack={closeModal} />
                  : M.id === "edtrack" ? <div className="nm-scroll"><TrackModal /></div>
                  : M.id === "ednb" ? <div className="nm-scroll"><NbModal /></div>
                  : M.id === "edsb" ? <div className="nm-scroll"><SbModal /></div>   // 스토리보드 = 앱 안 판 1(깃 11-11 · 같은 길 api/sb · sb_out)   // 미디어 요약 = 앱 안 판 1(깃 11-10 · 같은 길 api/nb · nb_out · api/submit)   // 트래킹 = 앱 안 판 1(깃 11-10 · 같은 길 api/upload · api/track · track_out)   // 영상 편집 = 앱 안 판 1(깃 11-10 · 같은 길 api/upload · api/edit · ly_out)
                  : M.id === "edpush" ? <div className="nm-scroll"><PushDevsModal /></div>   // 구독 기기 = 앱 안(봄 11-01 · 같은 길 api/push list·toggle·remove)
                  : M.id === "edsensor" ? <div className="nm-scroll"><SensorModal /></div>   // 센서 = 앱 안(봄 11-01 · 같은 길 api/sensors · 형이 바꾸면 그 봇에게 알림)
                  : M.id === "edmemo" ? <div className="nm-scroll"><MemoModal /></div>   // 메모 = 앱 안(봄 11-01 · 서버 설정 한 장 = 에디터와 같은 메모)   // 알림메세지 = 앱 안(봄 11-01)   // 대기열 = 앱 안(봄 11-01 · 재시도만 에디터 한 겹)
                  : M.id === "chan" ? <div className="nm-scroll"><ChanModal /></div>
                  : M.id === "chanfull" ? <div className="nm-scroll"><ChanModal full /></div>   // 채널 전체 = 앱 안 조각(빠르 11-01 · 나머지 칸은 맨 아래 단추로 에디터)
                  : M.id === "sns" ? <div className="nm-scroll"><SnsModal /></div>
                  : M.id === "trend" ? <div className="nm-scroll"><TrendModal /></div>
                  : M.id === "legacy" ? <div className="nm-scroll"><ScrapModal /></div>
                  : M.id === "tokens" ? <div className="nm-scroll"><TokensModal /></div>
                  : M.id === "gyeol" ? <div className="nm-scroll"><GyeolModal /></div>
                  : M.id === "story" ? <div className="nm-scroll"><StoriesModal /></div>
                  : M.id === "feedback" ? <div className="nm-scroll"><FeedbackModal /></div>
                  : <div className="nm-scroll nm-settings-page"><Suspense fallback={null}><SettingsPage /></Suspense></div>}
                </Suspense>
              </div>
            </ModalBox>
          ) : null}
          {web != null ? <WebLayer u={web} onClose={closeWeb} /> : null}
          {issue != null ? (
            <ModalBox close={closeWeb} className="nm-modal nm-web" role="dialog" aria-modal="true" aria-label={`이슈 ${issue}`}>
              <div className="nm-modal-h">
                <button type="button" className="nm-modal-back" aria-label="닫기" onClick={closeWeb}><DuetIcon name="chevronLeft" size={20} /></button>
                <b>이슈 {issue}</b>
              </div>
              <div className="nm-modal-b flush"><div className="nm-scroll"><Suspense fallback={<LazyDots />}><IssueView key={issue} no={issue} /></Suspense></div></div>
            </ModalBox>
          ) : null}
        </div>
        {split ? <SplitSide /> : null}
      </div>
    </ChatPresenceProvider>
  );
}

/** PC 반갈 오른쪽 반(형 11-05 13:26 그림 · 13:36 「가로 16 이야. 그러면 8 8 구성」 · 「4*4로 나눈다고 가정」 · 「2*4는 (좌측) 은 다 대화고」 · 「1*4 1행 ~ 1.5 는 러너 기본정보(… 게이지로 축약해서)」 · 「근데 갬성이 떨어지면안되.」 · 「나머지 3~2.5 를 실시간 뉴스 카드로.」)
 *  위 1.5/4 = 2 러너(맨 위 몸 줄 + 러너 판 게이지) · 아래 2.5/4 = 3 실시간 뉴스 카드(홈 카드 덱 그대로 · 「전송」 = 그 기사 요약 요청 · 형 13:38 「전송하면 그 아래에 요약 대기열 … 근데 거기까지 안바래」)
 *  러너 위젯(PC 바탕화면)은 내림(형 13:23 「그럼냅다치우고」 · 윈A CPU 1등) — 여기 한 창에 대화 · 러너 · 뉴스가 같이 있어 창이 따로 놀지 않음(형 13:20 「근데 창이 다 따로놀아;;ㅠㅠ」) */
/** 눌러야 받는 칸(서랍 창 · 이슈 · 웹) 코드를 받는 동안 = 가운데 라임 점 셋(글자 0 · 형 11-07 17:20 「불러오는 중 일때 ...이 움직이거나 할수있나. 안그러면 멈춘거같아서.」 · 꼴 = ./shell.css .nm-lazy) */
function LazyDots() { return <div className="nm-lazy" role="status" aria-label="불러오는 중"><i /><i /><i /></div>; }

/** 반갈 칸 울타리 — 한 칸이 깨져도 앱 전체(「Something went wrong!」)로 번지지 않게 그 칸만 한 줄로(17:2x 뉴스 요약 칸이 앱을 통째로 깨뜨린 것 뒤) */
class PaneGuard extends Component<{ name: string; children: ReactNode }, { bad: boolean }> {
  state = { bad: false };
  static getDerivedStateFromError() { return { bad: true }; }
  componentDidCatch(e: unknown) { console.error("반갈 칸 깨짐:", this.props.name, e); (window as unknown as { __nmReportError?: (kind: string, err: unknown) => void }).__nmReportError?.("boundary:pane", e); }   // 서버로도 알림(번개 ui/err-catch.ts · 빠르 11-08)
  render() { return this.state.bad ? <Oops small title={`${this.props.name} 칸이 잠깐 엉켰어`} sub="같이 다시 가볼까?" retry={() => this.setState({ bad: false })} /> : this.props.children; }
}

/** 대화 | 오른쪽 경계 끌기(형 11-06 대시보드 고급화 UI ② · 시아 판) = 오른쪽 넓이 30~65% · 이 PC 에 기억(nm-split-w) · 두 번 누름 = 반반 */
const SPLIT_KEY = "nm-split-w";
// 16:9 화면 = 켤 때 늘 반반(8:9 + 8:9 · 형 11-08 07:24 dm 「16대9비율일 때는, 8:9로 항상 켜지게 하고싶어.」) · 기억한 넓이는 다른 비율 화면에서만 씀 · 켠 뒤 끌기는 그대로 됨
const is169 = () => { try { const w = window.screen.width, h = window.screen.height; return w > 0 && h > 0 && Math.abs(w / h - 16 / 9) < 0.04; } catch { return false; } };
let splitInit = false;   // 켤 때 한 번만(작은 창 왕복으로 칸이 다시 붙어도 그 사이 끈 넓이 그대로 · 모루 #2880 검토)
function useSplitW() {
  useEffect(() => { if (splitInit) return; splitInit = true; try { if (is169()) { document.documentElement.style.setProperty("--nm-split-w", "50%"); return; } const v = +(localStorage.getItem(SPLIT_KEY) || 0); if (v >= 30 && v <= 65) document.documentElement.style.setProperty("--nm-split-w", `${v}%`); } catch { /* 반반 */ } }, []);
}
function SplitGrip() {
  const set = (v: number) => { const c = clampW(v); document.documentElement.style.setProperty("--nm-split-w", `${c}%`); return c; };
  // 자석에 붙는 동안 = 손잡이 · 줄이 라임으로 착(형 11-14 05:15 「숫자만 빼고」 · 05:16 「차트도 나오게하자는건아님 저 느낌만」 = 눈금 띠 · 숫자 0)
  const [snap, setSnap] = useState(false);
  const down = (e: { currentTarget: HTMLElement; preventDefault: () => void; clientX: number }) => {
    e.preventDefault();
    const rootEl = (e.currentTarget.closest(".nm-split-root") as HTMLElement | null) || document.body, box = rootEl.getBoundingClientRect();
    let last = 50, was = false;
    const at = (cx: number) => { const s = snapW(((box.right - cx) / box.width) * 100); last = set(s.w); const on = s.hit >= 0; if (on !== was) { was = on; setSnap(on); } };
    const move = (ev: PointerEvent) => at(ev.clientX);
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); document.body.classList.remove("nm-dragging"); setSnap(false); try { localStorage.setItem(SPLIT_KEY, String(Math.round(last * 10) / 10)); } catch { /* 이번만 */ } };
    document.body.classList.add("nm-dragging");
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const reset = () => { set(50); try { localStorage.removeItem(SPLIT_KEY); } catch { /* 이번만 */ } };
  return (
    <div className={`nm-split-grip${snap ? " snap" : ""}`} role="separator" aria-orientation="vertical" aria-label="끌어서 칸 넓이 · 두 번 누르면 반반" title="끌어서 칸 넓이 · 두 번 누르면 반반" onPointerDown={down} onDoubleClick={reset}>
      <i />
      <b className="nm-split-knob" aria-hidden><svg viewBox="0 0 16 16" width="12" height="12"><path d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></b>
    </div>
  );
}

/** 왼쪽 위 러너 게이지 띠 — 제 키를 재서 --nm-top-h 로 알림(오른쪽 위 팔로워 띠 · 왼쪽 판들이 그 키를 씀 · 봄 11-08) */
function TopLeft() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const root = document.documentElement;
    // 바닥 140px = 몸 목록이 비어 게이지 띠가 작아도 오른쪽 SNS 띠가 안 잘리게(머리 36 + 틈 14 + 총수 줄 14 + 4 + 그림 64 = 132 · 모루 #2883 ② · #2886 「120px는 아직 부족해」) · --nm-top-off = 판·검색 단추가 내려갈 만큼(띠 + 위아래 틈 16 · 모루 ①)
    const ro = new ResizeObserver(() => { const h = Math.max(140, Math.round(el.getBoundingClientRect().height)); root.style.setProperty("--nm-top-h", `${h}px`); root.style.setProperty("--nm-top-off", `${h + 16}px`); });
    ro.observe(el);
    return () => { ro.disconnect(); root.style.removeProperty("--nm-top-h"); root.style.removeProperty("--nm-top-off"); };
  }, []);
  return <section ref={ref} className="nm-split-run nm-split-top-l" aria-label="러너"><PaneGuard name="러너"><RunnerGauges /></PaneGuard></section>;
}

function SplitSide() {
  useSplitW();
  return (
    <aside className="nm-split" aria-label="러너 · 뉴스">
      <SplitGrip />
      <section className="nm-split-run nm-split-top-r" aria-label="인스타 · 페북"><PaneGuard name="팔로워"><IgFbBand /></PaneGuard></section>   {/* 오른쪽 위 = 뉴스 쪽 · 높이 = 왼쪽 위 게이지 띠와 같게(--nm-top-h · 형 07:31 「기존처럼 3개 있을때의 높이」) · 러너 게이지는 왼쪽 위로(TopLeft) */}
      <section className="nm-split-news" aria-label="뉴스"><PaneGuard name="실시간 뉴스"><NewsList /></PaneGuard></section>
      <section className="nm-split-sum" aria-label="뉴스 요약"><PaneGuard name="뉴스 요약"><NewsSummary /></PaneGuard></section>   {/* 우하단 = 요약 대기열 + 다 된 요약(형 11-05 16:27 「어짜피 우하단에는 뉴스 요약 부분이 나올거라서」 · 13:38 「전송하면 그 아래에 요약 대기열 올라오고, 다되면, 모달로 뉴스 요약본」) */}   {/* PC = 그림 없는 제목 목록(형 11-05 14:39 「pc판은 아예 뉴스에 아예 그림안뜨게 컴팩트하게 타이틀만」) · 폰 홈은 카드 덱 그대로 */}
    </aside>
  );
}

/** 품은 원본 화면(같은 사이트 에디터 화면 · 남의 사이트) — 안 링크·새 창 = 앱 안(hookFrame) · 겉 = YETA 톤(toneFrame · --modern-* 쓰는 화면만) · 남의 사이트는 손 못 댐 = 그대로 */
function FramePage({ src, title, onTitle }: { src: string; title: string; onTitle?: (t: string) => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const el = ref.current;
    const offs = [hookFrame(el), toneFrame(el)];
    const name = () => { try { const t = el?.contentDocument?.title; if (t && onTitle) onTitle(t); } catch { /* 남의 사이트 = 못 읽음 */ } };
    const dv = () => deliverStudio(el);
    el?.addEventListener("load", name); el?.addEventListener("load", dv);
    return () => { offs.forEach((f) => f()); el?.removeEventListener("load", name); el?.removeEventListener("load", dv); };
  }, [src]);   // eslint-disable-line react-hooks/exhaustive-deps
  return <iframe ref={ref} title={title} src={src} className="nm-modal-frame" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" />;
}

/** #/web 한 겹 — 머리 = 「< 이름」(같은 사이트 = 그 화면 제목 · 남의 사이트 = 사이트 이름) · 남의 사이트가 품기를 막아 빈 화면이면 오른쪽 지구 단추 = 밖에서 열기(그때만 쓰는 비상구) */
//   남의 사이트·빈 주소 = 「웹」 칸(./web-pane.tsx · 빠르 부품 · 주소창 · 뒤로/앞으로 · 새로고침 · 품기 미리 재기 · 형 11-06 20:21 「대시보드 창 내부에서도 브라우저」 · 시아 11-07 끼움) · 같은 사이트 원본 화면 = 그대로 FramePage
function WebLayer({ u, onClose }: { u: string; onClose: () => void }) {
  const [title, setTitle] = useState<[string, string]>(["", ""]);
  const ext = /^https?:\/\//i.test(u);
  let host = "";
  try { host = ext ? new URL(u).hostname.replace(/^(www|m)\./, "") : ""; } catch { /* 이름 없음 */ }
  if (ext || !u) {
    return (
      <ModalBox close={onClose} className="nm-modal nm-web" role="dialog" aria-modal="true" aria-label={host || "웹"}>
        <div className="nm-modal-h">
          <button type="button" className="nm-modal-back" aria-label="닫기" onClick={onClose}><DuetIcon name="chevronLeft" size={20} /></button>
          <b className="min-w-0 flex-1 truncate">{host || "웹"}</b>
        </div>
        <div className="nm-modal-b frame"><Suspense fallback={<LazyDots />}><WebPane key={u} initial={u} /></Suspense></div>
      </ModalBox>
    );
  }
  const name = title[0] === u && title[1] ? title[1] : "에디터";
  return (
    <ModalBox close={onClose} className="nm-modal nm-web" role="dialog" aria-modal="true" aria-label={name}>
      <div className="nm-modal-h">
        <button type="button" className="nm-modal-back" aria-label="닫기" onClick={onClose}><DuetIcon name="chevronLeft" size={20} /></button>
        <b className="min-w-0 flex-1 truncate">{name}</b>
      </div>
      <div className="nm-modal-b frame"><FramePage key={u} src={frameUrl(u)} title={name} onTitle={(t) => setTitle([u, t])} /></div>
    </ModalBox>
  );
}

/** 목록 화면(카톡식 · 형 11:26 「대화랑 그냥 분리하자」) — 방 누르면 그 대화 판으로 */
function RoomsPane() {
  const teamsOn = useTeamsMode(), split = useSplit(), meetOn = useOfficeMode() === "meet";
  return (
    <>
      <div className="nm-rooms-pane min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-4 pb-[calc(var(--duet-tab-space,86px)+56px)]">   {/* 끝 줄이 우하단 단추에 안 가리게 */}
        <h1 className="sr-only">대화방</h1>   {/* 판 위 큰 제목 0(PM 13:04 · 형 「공간」 · 지금 판 = 네비 「대화방」 칸) */}
        <RoomList big bar={split} />
      </div>
      {teamsOn || meetOn ? null : <><RoomFab /><DecideFab /></>}   {/* 폰 회의 판도 0(형 11-14 00:09 사진 · 봄 「「+」 단추는 회의 탭에서 숨김」) */}   {/* 팀즈 모드 = 방 만들기·결정 동그라미 0 */}
      {/* 영상 해석 허가 동그라미 뺌(형 11-05 11:10 「그럼 이제 그 채팅창 우하단에 영상 신청 이거는 없어도되는거지? 판단해보고, 별 의미없는 코드니까. 기능을 없애고 디자인도 없애줘.」 · 올리는 순간 받아쓰기 상주가 대신함) */}
    </>
  );
}

/** PC 왼쪽 끝 얼굴 띠 — 얼굴만(글자 0) · 차례 = 안 읽은 방 → 고정 → 나머지(목록 화면과 같은 차례) · 위아래 스크롤 · 맨 위 ≡ · 맨 아래 「+」·형 얼굴 붙박이 */
// 띠 라임 테 = 진짜 일하는 애만(형 11-12 16:23 봄 1:1 「애들 다 활성화되어잇는거맞아? 라인 프로필이 다 떠서」 · 봄 16:28 고침 「가」) —
//   서버 「깸」 가운데 서버가 깨움만 보낸 표시(mark woke · 그록 · 답 안 해도 10분)는 뺌 · 서버 「잠」이면 안 켜짐(앞 판 = 마지막 턴 10분 안이면 잠이어도 켬)
//   클로드 턴은 by clock 이어도 켬 = 형 · 동료 부름도 깨움 러너 알림으로 와서 clock 으로 찍힘(ab24faf 판 = clock 빼니 일하는 셋까지 꺼져 0/24 · 시아 16:5x 실물) · 클로드 「깸」 = 턴이 실제로 도는 동안만
export type RingBot = { who: string; state: string; last_turn_ts?: number; why?: string; by?: string; mark?: string };
export const ringOn = (b: RingBot) => b.state === "awake" && b.mark !== "woke" && b.why !== "woke";
// 띠 얼굴 채도 눈금(형 11-12 17:02 「채도 25%까지 오래 대화 1:1 안나눳을수록 채도 낮아지게」) — 형과 1:1 마지막 대화에서 지난 시간 → 채도 · 1시간 안 100 · 3시간 안 75 · 12시간 안 50 · 그 뒤 25(바닥)
export const FACE_SAT: [number, number][] = [[60 * 60_000, 1], [3 * 60 * 60_000, 0.75], [12 * 60 * 60_000, 0.5]];
export const faceSat = (ago: number) => { for (const [ms, v] of FACE_SAT) if (ago <= ms) return v; return 0.25; };
function FaceStrip({ current }: { current: string; last: string }) {
  const nav = useNavigate();
  const { list, ordered, count, pins, setPins, pinned } = useRoomOrder();
  const go = (id: string) => { enterRoom(id); void nav({ to: chatHref(id) }); };
  // 우클릭 = 고정 · 고정 풀기(형 11-05 17:03 「그리고 우클릭하면 고정같은거 작용하게 해줘 좌측에 저 프로필 사진들도」) — 대화방 목록 「고정」과 같은 칸(nm-office-pins · 이 기기) · 고정 방 = 띠 위쪽
  const togglePin = (id: string) => { if (id === "all") return; const n = new Set(pins); if (n.has(id)) n.delete(id); else n.add(id); try { localStorage.setItem("nm-office-pins", JSON.stringify([...n])); } catch { /* 이 기기에만 · 못 쓰면 이번만 */ } setPins(n); };
  // 자는 애 = 얼굴 채도 15%(형 11-05 15:31 「잠자고 있으면 채도 15%만 들어가게 해줘. 프로필 테두리 라인은 검정 챠콜 베이스 반투명으로 들어가고.」) · 깸 표 = 대화 목록과 같은 bots 캐시(./room-list.tsx)
  const bots = useQuery({ queryKey: ["nomute", "bots"], queryFn: () => office<{ bots: RingBot[] }>("bots").then((j) => j.bots || []), staleTime: 15_000, refetchInterval: 60_000 }).data || [];
  // 라이브 = 지금 깸 · 또는 마지막 턴 10분 안(상태바 조약돌과 같은 셈 · 형 11-06 10:33 「좌측에 라이브하게 켜져있는 애들은 테두리에 라임 들어오게 할 수 있어?」) — 턴 사이 「잠」 깜빡임 없게
  const live = (who?: string) => !!who && bots.some((b) => b.who === who && ringOn(b));
  const asleep = (who?: string) => !!who && !live(who);
  // 얼굴 채도 = 형과 1:1 대화한 지 오래될수록 낮아짐 · 바닥 25%(형 11-12 16:23 「최근 1시간에 대화한 애들 아니면」 → 17:02 「채도 25%까지 오래 대화 1:1 안나눳을수록 채도 낮아지게」 · 「모바일과도 동기화되어야돼」)
  //   기준 = 그 1:1 방 last_ts(서버 값 · 형 낀 글 · 폰에서 방금 대화했으면 PC 띠도 방금) · 단톡 그림은 그대로 · 폰 목록은 안 입힘(형 「모바일에서도 이렇게 보일 필요는없음」)
  const sat = (r: { with?: string; last_ts?: number }) => (r.with ? faceSat(Date.now() - (r.last_ts || 0)) : 1);
  const stripOrder = ordered;   // 차례 = 폰 대화 목록과 한 벌(./room-list.tsx useRoomOrder · 고정 위 · 나머지 = 마지막 대화 · 형이 마지막으로 읽은 때 중 늦은 것 · 형 11-12 16:17 「하자」 · 앞 판 = 띠만 읽은 때를 셈 · 뎅)
  // 대화 미리 받기 = 띠 차례 위 넷(1.5초 뒤 하나씩) + 얼굴에 손 올림·누름·초점(대화 목록 ./room-list.tsx 와 같은 꼴 · 뎅 16:03 「화면 위 차례랑 「위 네 방」 차례가 다름」)
  const qc = useQueryClient(), pre = (id: string) => { if (id) void qc.prefetchQuery(roomMsgsOptions(qc, id)); };
  const topS = stripOrder.slice(0, 4).map((r) => r.id).join(",");
  useEffect(() => {
    if (!topS) return undefined;
    const ts: number[] = [];
    ts.push(window.setTimeout(() => topS.split(",").forEach((id, k) => ts.push(window.setTimeout(() => pre(id), k * 400))), 1500));
    return () => ts.forEach((t) => clearTimeout(t));
  }, [topS]);   // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <aside aria-label="방 얼굴 띠" className="nm-strip">
      <div className="nm-strip-faces">
        {stripOrder.map((r) => {
          const n = count(r), p = r.with ? list.find((x) => x.who === r.with) : undefined, ids = roomAgentIds(r, list), hy = Number((r as { pending_hyung?: number }).pending_hyung) || 0;
          return (
            <button key={r.id} type="button" className={`nm-face ${current === r.id ? "on" : ""}${asleep(r.with) ? " zz" : ""}${live(r.with) ? " live" : ""}`} style={sat(r) < 1 ? ({ "--face-sat": sat(r) } as CSSProperties) : undefined} title={p?.name || r.name} aria-label={`${p?.name || r.name}${n !== 0 ? " · 안 읽은 글 있음" : ""}${hy > 0 ? ` · 형 결정 기다리는 글 ${hy}개` : ""}`} onPointerEnter={() => pre(r.id)} onPointerDown={() => pre(r.id)} onFocus={() => pre(r.id)} onClick={() => go(r.id)} onContextMenu={(e) => { e.preventDefault(); togglePin(r.id); }}>
              {pins.has(r.id) ? <PinMark className="nm-face-pin" label="고정됨" /> : null}   {/* 고정 = 얼굴 왼쪽 위 작은 압정(봄 11-12 16:17 A · 형 14:06 「점으로 하지말고 좀 더 다른거로」) · 폰 목록과 한 벌 */}
              {r.with ? <FaceImg id={idOf(r.with, list)} size={40} /> : <RoomIcon r={r} size={40} />}   {/* 단톡방 = 픽토그램 선만(시그니처색 50% · 바탕 투명 · 형 11-06 20:15) */}
              {n !== 0 ? <i className="nm-udot" aria-hidden /> : null}   {/* 안 읽음 = 왼쪽 위 레몬 점 하나(숫자 없음 · 형 13:20 「노란색으로」 · 형 11-07 13:15 「안읽은 글 수는 애초에 안떠두됨」 · 「라임색 접 작게 잇으면됨」 · 「저 불이 좌측에 있으면 됨.」) */}
              {hy > 0 ? <b className="nm-badge nm-badge-hy" aria-label={`형 결정 기다리는 글 ${hy}개`}>{hy > 99 ? "99+" : hy}</b> : null}   {/* 오른쪽 걸친 숫자 = 호출 수(형 결정 대기 · 형 13:15 「숫자가 우측 프로필에 걸치는거 (기존 숫자) 그거는 호출.」 · 뜸 서버 pending_hyung) */}
            </button>
          );
        })}
      </div>
      {/* 맨 아래 셋(+ · 가장 최근 채팅 · 채팅 목록) 뺌 = 아래 알약 「대화」 하나로(형 11-09 09:31 회의실 「저 3개 없애고, 대화 목록으로 가는 메뉴 한개만 하단 메뉴 네비에 추가하면됨」 · ../swap/tab-bar.tsx) · 방 만들기 = 대화방 목록 안 「+」 그대로 */}
    </aside>
  );
}

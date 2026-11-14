// 우리 대화창 — 원본 부품(말풍선·글 줄·입력칸·마크다운) 그대로 쓰고, 형 대화창 규칙·옛 화면 기능은 우리 것(옛 = viewer/office.html)
//   형 보기(형 10-27 16:33·21:16) = 형 글 + 형에게 온 글만 펼침 · 봇끼리·클로드 글 = 그 자리 한 줄 「(얼굴 셋) 외 N · 메시지 M개」(형 10-28 05:12)
//   말풍선 = YETA 꼴(./yeta-chat.css · 형 10-28 10:19) · 말풍선 위 읽음 얼굴 0 · 러너 깸 줄 안 보임 · 시스템 일 = 가운데 흐린 알약
//   시간 = 말풍선 밖 오른쪽 아래 모서리 바로 아래 작게(형 10-28 15:36 「시간을 대화상자의 우하단으로 … 최대한 대화를 길게」 · 16:5x 「위치는 좋고, 바깥에 위치」 = 말풍선은 말만 감쌈 · 말풍선 폭 늘림)
//   가져감 = 카톡 「1」 자리에 「가져감」 글자 하나(1:1 방 형 글만 · 형 10:20) · 그 밖 이름 줄 0
//   이름 = 같은 사람 글이 이어지면 첫 글만(YETA .cont) · 날짜가 바뀌는 곳 = 가는 줄 + 「10/31(토)」(형 10:23 · 10-31 꼴)
//   시각 자리·간격(형 10-31 09:15 「자기글은 우측에서 시작해서 좌측 아래 시간이」 · 「상대 글은 좌측에서 시작해서 우측 아래 시간이」 · 「1분 안에 재 작성된 내용에 대해서는 시간이 재나열 될 필요없음.」 · 「상대 게시글과 내 게시글 간 간격 이 좀 더 벌어져야함.」) = 내 글 왼쪽 아래 · 상대 글 오른쪽 아래 · 같은 사람이 마지막 찍은 시각에서 1분 안에 이어 쓰면 안 찍음 · 내 글↔상대 글 사이 .yturn
//   줄기 = ⏳·✅ 상태 답(reply_to)은 원 글 바로 아래 · 답장 = 글 첫 줄 「↩ 이름: 그 글 첫 줄」(서버 0 · 옛 화면과 같은 꼴) · 반응 · 파일 · 긴 글 = 접기 0(형 15:33 「더보기 말고 줄글 풀로 다 나오게」)
//   열기(형 15:33 「대화창 열면 … 글쓰기로 되어서. 그러지 않게」 · 「가장 최근거부터 … 위에 토글 하나하면 올라갈 수 있게」 · 장부 office-chat-read.md) =
//     글칸 저절로 커서 0(자판 안 올라옴 · 누를 때만) · 맨 아래(가장 최근 글)에서 시작 · 화면 위로 시작이 넘어간 글이 있으면 위에 「↑ 글 처음」 단추 하나(누르면 그 글 시작)
//   빠르게 열기(형 15:34 「프사먼저 나오고 넘 늦게 대화가 나와」 · 15:38 「캐시화 하고 뒤늦게 받아오는거로 동기화를」) = 이 기기 저장(data/room-cache.ts)을 먼저 그림 →
//     since 로 새 글만 · 저장이 없으면 최근 한 화면치(FIRST_N) · 위로 올리면 하루치씩(서버 day=1 · 한 화면 이상)
//   동기화 = 열린 방은 기다리기(wait 25초 · 옛 화면과 같은 길) · 그 밖은 pulse(data/sync.ts)
import { DlSeqButton } from "./dl-seq";
import { mergeReact, type RoomReacts, swapLock, swapReact } from "../data/react-merge";
import { QrRadial, QuickReact } from "./quick-react";
import { CallSheet, appendToComposer } from "./call-sheet";
import { type QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { Component, type ComponentProps, type CSSProperties, Fragment, type PointerEvent as RPointerEvent, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { roomReadState } from "../data/read-state";
import { useRoomRead } from "../data/use-room-read";
import { Streamdown } from "streamdown";
import { type CommandOption, Composer, toAgentOptions } from "@/components/channels/composer";
// 「/」 = 우리 명령 둘(형 11-06 10:45 사진 = 「/초대」에 원본 스킬 메뉴 「No matching skills」가 떠서 엔터가 안 감 · 봄 서버 /초대·/방파기) — 고르면 그 글자가 입력칸에 들어가고 엔터 = 보내기
//   → 원본 「/」 목록은 이 앱에서 늘 비어 「No matching skills」만 띄우고 엔터를 먹음(11-06 9222 실물) = 목록 끔(commands [] · overrides.ts) · 대신 입력칸 위 안내 줄(SLASH_HELP)
const OFFICE_COMMANDS: CommandOption[] = [];
const SLASH_HELP: [string, string][] = [["/초대 이름", "하루 안 남은 임시방에 부르기"], ["/방파기", "목적 달성 · 다 같이 나가기"]];
import { useReportChatPresence } from "@/components/shell/chat-presence";
import { markdownComponents } from "@/lib/markdown";
import { type OfficeMsg, type OfficePerson, type OfficeRoom, idOf, office, people, peopleSync, roomAgentIds } from "../data/office";
import { markSent, typingPing } from "../data/typing";   // 형 치는 중(형 11-13 17:57 · 17:59 · 18:09 · 18:14)
import { listGet, listPut, loadRoom, saveRoom } from "../data/room-cache";
import { peekAttachments } from "../shim/attachments";
import { attachmentSender } from "../data/attachment-state";
import type { SendAttempt, WaitingText } from "../data/attachment-send";
import "./attachment-up.css";
import { AttachmentRecovery } from "./attachment-recovery";
import { TempRoomHead } from "./temp-room";
import { AV_MIN, type AvEvent, type AvState, avInit, avStep } from "./auto-video";   // 영상 자동 재생 결정(순수 · 모루 11-09 05:33 회귀 고침)
import { AttachSheet } from "./attach-sheet";
import { EncGauge, encRing, useEnc } from "./enc-gauge";
import { PicGrid } from "./pic-grid";   // 사진 2장 넘음 = 카톡 꼴 묶음 · 누르면 넘겨 보기(형 11-11 08:45 「2장 이상일땐 이런식으로 크키가 줄어서 나오게 할 수 있어? 누르면 커지고」 · 뎅)   // 미디어 게이지 · 라임 테두리(형 11-11 08:14 번개 1:1 「영상 00% / 파동 00% / 자막 00% / 다 공유되먼 완료」)
import { useCloseCallMenu } from "./call-face";
import { justHeld, MsgMenu, useLongPress } from "./msg-menu";
import { RoomSearch } from "./room-search";
import "./chat-font";   // 대화 글꼴(--app-font · YETA 설정 그대로 · 앱 열 때 한 번 적용)
import { FaceImg, FaceStack } from "./faces";
import { HyungPills, pendingOf } from "./hyung-pills";
import { CallPeek } from "./call-peek";
import { draftDrop, draftSet } from "./draft";   // 알약 누름 = 그 글 창 + 답칸(형 11-07 12:02~12:03 「그냥 확 창이 뜨고 깔끔하게 답변」)
import { useUnfold } from "./unfold";
import { SiteIcon } from "./site-icon";
import { BundleCard } from "./bundle-card";
import { srcOf, type Src } from "./bundle-src";   // 묶음 「공식 자료」 이어 글(깃 11-13 12:49)   // 촉 묶음 글 「올림 · 넘김」(봄 11-12 19:22 · 글 꼴 깃 · 시아)
import { parseBundle } from "./bundle";
import { AskPick, askPickOf } from "./ask-pick";   // 촉 방 촉 글 「요약」 = 형이 골라 바로 요약 접수(형 11-13 02:45 · 02:46 봄 1:1 · 뎅)
import { DecideInline } from "./decide-pop";   // 질문 글 아래 선택지(형 11-13 09:08)
import { PcCard } from "./pc-card";   // 대화창 컴퓨터 카드(뜸 11-08 · 형 09:07 「채팅창에 너네 vm 띄우면 로그인 가능하게」)
import { pcOfText } from "./pc-url";
import { dlHref } from "./news-data";
import { useSwipeReply } from "./swipe-reply";
import { MicOrb, ringOf } from "../swap/mic-orb";
import { NameLabel } from "./name-label";
import { inkOn } from "./color-pick";
import { QUOTE, ReplyStrip } from "./reply-strip";   // 답글 띠(말풍선 바로 위 · 형 11-11 20:08 ~ 20:13) · 답장 글 첫 줄 꼴
import { ProfileCard } from "./profile-card";   // 프사 누름 = 프로필 카드(형 10-30 19:4x)
import { useMe, usePinActions } from "./pins";
import { REPAIR_ROOM, RepairDesk } from "./repair-desk";   // 수리 접수 방 = 접수 창구(대화 말풍선 0 · 형 10-28 22:28)   // 글 동작 줄 「고정」(보조 01 · 장부 office-pin.md 「바뀜」 17:1x)
import { TEAMS_PREFIX, TeamsChat, isTeams } from "./teams";
import { BEING_INK } from "./bloub";
import { SUMMARY_ROOM, SummaryDesk } from "./summary-desk";   // 요약실 = 요약 카드 목록(형 11-04 09:28)
import { Folded } from "./fold";   // 긴 글 접기 · 전체 보기(형 11-02 07:19)
import { ScrollDate } from "./scroll-date";   // 글을 올려 볼 때 오른쪽 날짜(형 11-01)
import { t12 } from "./when";
import { RoomBoard } from "./room-board";   // 방 띠(칩·열린 제안) = 입력칸 바로 위(형 11-07 10:28 「채팅 바로 위에 쓰는곳 위에 올라와야하고, 얼굴로 있어야함」)
import { LiveShine, ThinkMark } from "./live-shine";   // 빛 글자 = libraries.dev/orbs 그대로(형 11-01 12:28) · 생각중 표시 = 점 셋 · 구슬(설정)
import { Chev } from "./chev";   // 꺽쇠 하나(형 11-01 「화살표 같은건 모두 꺽쇠 느낌으로」)
import { LinkCard } from "./link-card";
import { bubbleM, pickM, relayAs } from "./pick-msg";
import { asSent, mergeTs, pairOf } from "./pair-fold";   // 둘의 방 귀속(형 11-13 08:29)
import { Sticker, stickerMark, stickerOf } from "./sticker";
import { dropStickerTwins } from "./sticker-logic";   // 움짤 스티커 한 줄 = 말풍선 없이 움짤(형 11-12 12:17 · 뜸)
import { ThumbCard, thumbOf, type ThumbRef } from "./thumb-card";   // 별 「[요약 완료]」 글 바로 위 썸네일 초안 그림(형 11-02 11:44 「별 요약 과 함께 요약 바로 위에 오면 됨 이미지로」)   // 글 속 첫 주소 = 말풍선 아래 미리보기 카드(형 11-02 07:13 「채팅에는 일반적인 채팅 앱처럼 보이면 됨」)
import "./yeta-chat.css";
import { whoName } from "./who-name";

const enc = encodeURIComponent;
/** 쓰던 글 = 방마다 이 탭 안에 바로 적어 둠(sessionStorage) → 새 판으로 다시 읽혀도 글칸에 되살림(뒤에 숨어 얼어 있던 탭은 서비스 워커에 「글 있음」을 못 알려 · 10-28 11:21 실측) */
const DRAFT = (room: string) => `nm-draft:${room}`;
const floorGet = (room: string) => { try { return Number(localStorage.getItem(`nm-seen-floor:${room}`)) || 0; } catch { return 0; } };   // 나간 때 바닥(이 기기 · 형 13:17)
const floorSet = (room: string, ts: number) => { try { if (ts > floorGet(room)) localStorage.setItem(`nm-seen-floor:${room}`, String(ts)); } catch { /* 못 적으면 서버 값만 */ } };
const loadDraft = (room: string) => { try { return sessionStorage.getItem(DRAFT(room)) || ""; } catch { return ""; } };
const saveDraft = (room: string, t: string) => { try { if (t.trim()) sessionStorage.setItem(DRAFT(room), t); else sessionStorage.removeItem(DRAFT(room)); } catch { /* 이 탭만 · 못 쓰면 이번만 */ } };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const PICKUP_WAIT = 2 * 60e3;   // 점 셋 = 턴 신호가 오기 전 2분(감시 60초 + bots 조회 60초 · 형 「멍하고 기다리고」 자리)
const CALL_FRESH = 45 * 60e3;   // 회의실 「작업 중」 = 부른 글이 45분 안일 때만(옛 화면 PR 1478 실측 · 답의 90% = 41분)
const EMO = /^\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier}|‍\p{Extended_Pictographic})*$/u;
const IMG_RE = /\.(png|jpe?g|gif|webp|avif)$/i;
const VID_RE = /\.(mp4|webm|mov|m4v)$/i;   // 영상 첨부 = 대화창에서 바로 재생(시아 11-02 형 02:32 「여가에 영상도 올릴 수 있게 해줘」 · 서버 Range 206 = 아이폰 사파리)
const WINTER_WHO = "윈터 PM";
const URL_RE = /(https?:\/\/[^\s<>"'「」()]+[^\s<>"'「」().,;:!?])/g;   // 글 속 주소(형 글 = 꾸밈 없는 글 · 봇 글은 Streamdown 이 링크로)
const RECENT_N = 40;   // 다시 받기 = 최근 40 글을 통째로(거울이 반응·글을 같은 글에 고쳐 씀 = since 로는 못 받음 · 맞물림 21:3x)
const FIRST_N = 100, DAY_MIN = 15, AUTO_MAX = 8;
const OPEN_PIN_MS = 4000, OPEN_PIN_MAX = 15000, AWAY_PIN_MS = 20000;   // 방을 연 뒤 = 손이 안 닿으면 맨 아래에 붙잡음(글이 처음 오거나 바뀐 때부터 4초 · 연 뒤 15초까지 · 기기에 둔 옛 글 → 새 글 · 앞 글 자동 받기 · 사진·글꼴이 늦게 길어짐)
// 맨 아래 「가까이」 = 이 안이면 새 글을 따라 내려감 · 밖이면 「↓ 최근 글」 단추(형 11-03 10:05 「그리고 내가 채팅에 들어와있으면, 그 채팅이 알아서 계속 트래킹 (새로 들어온 채팅이) 되게 할 수 있나?」 — 4px 안에 딱 붙어 있을 때만 따라가서, 조금만 올라가 있어도 새 글이 아래로 쌓이기만 하고 단추도 320px 넘어야 떴음)
const nearPx = (box: HTMLElement) => Math.max(160, box.clientHeight / 4);   // 저장 없이 처음 = 최근 100(봇끼리 글은 한 줄로 접혀 40 이면 형 글이 안 들어와 위로 하루치를 한 번 더 기다렸음 · PM 17:20 · 서버 = 같은 한 장 한 번) · 위로 올림 = 하루치(그날 글이 적으면 이만큼 될 때까지 앞날도) · 화면 채우기 저절로 받기 상한
const HEAD = 92;   // 위에 떠 있는 머리(대화 상대 동그라미 + 이름 · ui/shell.css .nm-head) 높이 — 그 아래부터 「보이는 위」

const hyungApp = (m: { mirror_by?: string; who?: string }) => m.mirror_by === "형" || String(m.who || "").startsWith("형(앱");   // 형이 그록봇 앱에서 친 글(서버 mirror_by · 형 10-30 「검정 말풍선 흰 글씨」)
type Msg = OfficeMsg & { card?: ThumbRef; mirror_by?: string; alias?: Record<string, string[]>; evidence?: { target?: string; result?: string; checked_at?: string }; proof?: boolean; file_meta?: { path: string; name?: string; bytes?: number }[]; _thr?: boolean;
  //   거울 칸(보조 03 · mirror-all.md 맞물림 21:3x · 없으면 지금처럼): 그록 방 agentId · 앱 「컴퓨터 · 조치 필요」 카드 · 앱 반응(바뀌면 같은 글이 고쳐짐)
  app_agent?: string; box?: { request_id?: string; instruction?: string; spend_request_id?: string }; app_reactions?: { emoji: string; who: string }[] };
type Page = { messages: Msg[]; more: boolean; pending_ids?: string[] };   // pending_ids = 형 결정 대기 글(뜸 서버 · 오래된 것부터 · 없으면 화면에서 셈 = ./hyung-pills.tsx)
const withPend = (p: Page, src: { pending_ids?: unknown }): Page => ({ ...p, pending_ids: Array.isArray(src.pending_ids) ? src.pending_ids.map(String) : [] });   // 서버 읽기 = 정본 · 칸 없음 = 대기 0(다 답한 알약이 남던 것 · 뜸 11-07)
type Draft = { who: string; ts: number; text: string };   // 쓰는 중 초안(그 방에서 지금 자라는 답 · 서버 _watch.js · 거울 = 그록봇 앱 방 streaming 줄)
type Reads = { reads?: Record<string, number>; seen?: Record<string, string[]>; seen_ts?: Record<string, number>; got?: Record<string, string[]>; got_at?: Record<string, Record<string, number>> };
type Bot = { who: string; state: string; why?: string; last_turn_ts?: number };

export const officeKeys = {
  people: ["nomute", "people"] as const,
  rooms: ["nomute", "rooms"] as const,
  msgs: (room: string) => ["nomute", "msgs", room] as const,
  reads: (room: string) => ["nomute", "reads", room] as const,
  reacts: (room: string) => ["nomute", "reacts", room] as const,
  bots: ["nomute", "bots"] as const,
};

/** 알약 창 답이 보냄 줄에 든 동안의 원 글 id(이 탭 · 방을 옮겨도 남음) — 그새 글을 새로 받아 서버 대기(pending_ids)에 그 id 가 다시 와도 알약을 안 되살림 · 보내지면 뺌(모루 11-07 15:57 #2822 검토) */
const replying = new Set<string>();
/** 글 열쇠(client_id · 24자) — 보냄 줄이 다시 보내도 같은 값 · 서버 = 같은 열쇠면 앞 글 그대로(editor _post humanTwin) */
const sendKey = () => { try { return crypto.randomUUID().replace(/-/g, "").slice(0, 24); } catch { return `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`; } };
const merge = (old: Page | undefined, add: Msg[]): Page => {
  const m = new Map((old?.messages || []).map((x) => [x.id, x]));
  for (const x of add) m.set(x.id, x);
  return { messages: dropStickerTwins([...m.values()].sort((a, b) => a.ts - b.ts)), more: old?.more ?? false, ...(old?.pending_ids ? { pending_ids: old.pending_ids } : {}) };
};

const kst = (ts: number) => new Date(ts + 9 * 3600e3);
const dayKey = (ts: number) => kst(ts).toISOString().slice(0, 10);
const dateLabel = (ts: number) => `${dayKey(ts).slice(5).replace("-", "/")}(${"일월화수목금토"[kst(ts).getUTCDay()]})`;   // 「10/31(토)」(요일 = 실제 · 형 10-31 09:15)
const TIME_GAP = 60_000;   // 같은 사람의 다음 글이 이 안에 이어지면 이 글엔 시각 안 찍음 = 묶음 마지막 글에만(형 10-31 「1분 안에 … 시간이 재나열 될 필요없음.」)
const fileName = (p: string) => String(p).split("/").pop()?.replace(/^\d{8}_\d{4}_/, "") || p;
const fileUrl = (p: string, dl = false) => `/api/office/file?${new URLSearchParams({ path: p, ...(dl ? { dl: "1" } : {}) })}`;
const size = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)}MB` : `${Math.max(1, Math.round(b / 1e3))}KB`);
const firstLine = (m: Msg) => {   // 답장 인용·복사 한 줄(인용 줄 빼고 · @·! 빼서 다시 부르지 않게 · 40자)
  const t = m.files?.length ? `파일 ${[...new Set(m.files.map(fileName))].join(", ")}` : String(m.text || "").replace(QUOTE, "");
  const l = (t.split("\n").find((x) => x.trim()) || "").replace(/[@!](?=\S)/g, "").replace(/\s+/g, " ").trim();
  return l.length > 40 ? `${l.slice(0, 40)}…` : l;
};
/** 방 글 받기 꼴 하나 = 방 화면(useOfficeRoom)과 미리 받기(./room-list.tsx · 줄에 손 올림·누름 · 위 몇 방)가 같이 씀(윈터 11-07 15:50 넘김 · 형 「치면 바로 올라가기」 · staleTime 30초라 겹쳐 안 읽음) */
export const roomMsgsOptions = (qc: QueryClient, room: string) => ({
  queryKey: officeKeys.msgs(room),
  queryFn: async () => {   // 받아 둔 글(이 탭 → 이 기기 저장 · 먼저 그림) 뒤 새 글만(since) · 받아 둔 게 없거나 사이가 비면(since 가 100 넘음) 최근 한 화면치
    const key = officeKeys.msgs(room);
    let old = qc.getQueryData<Page>(key);
    if (!old?.messages.length) {
      const c = await loadRoom<Msg>(room);
      if (c?.messages.length && !qc.getQueryData<Page>(key)?.messages.length) { old = { messages: c.messages, more: c.more }; qc.setQueryData<Page>(key, old); }
    }
    const last = old?.messages.at(-1)?.ts;
    if (old && last) {
      const r = await office<Page>(`rooms/${enc(room)}/messages?n=${RECENT_N}`);   // 최근 40 통째 = 새 글 + 거울이 고친 글(반응·카드)을 같이
      if ((r.messages?.[0]?.ts ?? Infinity) <= last || !r.more) return withPend(merge(qc.getQueryData<Page>(key) || old, r.messages || []), r);   // 사이 빔 없음
      const j = await office<Page>(`rooms/${enc(room)}/messages?since=${last}&n=100`);
      if (!j.more) return withPend(merge(qc.getQueryData<Page>(key) || old, j.messages || []), r);   // 기다리기 고리가 그새 붙인 글도 지킴
    }
    const j = await office<Page>(`rooms/${enc(room)}/messages?n=${FIRST_N}`);
    return withPend({ messages: merge(undefined, j.messages || []).messages, more: !!j.more }, j);
  },
  staleTime: 30_000,
});
export function useOfficeRoom(room: string) {
  const qc = useQueryClient();
  // 방 목록·사람표 = 이 기기에 둔 것으로 먼저 채움(누구와의 방인지 바로 앎 · 다른 화면이 같은 것을 먼저 받기 시작했어도 · 낡음 = 바로 새로 받음) → 받을 때마다 둠
  useLayoutEffect(() => {
    for (const [k, key] of [["rooms", officeKeys.rooms], ["people", officeKeys.people]] as const) {
      if (qc.getQueryData(key) === undefined) { const v = listGet<unknown[]>(k); if (v?.length) qc.setQueryData(key, v, { updatedAt: 0 }); }
    }
  }, [qc]);
  const roomsQ = useQuery({ queryKey: officeKeys.rooms, queryFn: () => office<{ rooms: OfficeRoom[] }>("rooms").then((j) => j.rooms || []), staleTime: 15_000 });
  const peopleQ = useQuery({ queryKey: officeKeys.people, queryFn: () => people(), staleTime: 60_000 });
  useEffect(() => { if (roomsQ.data?.length) listPut("rooms", roomsQ.data); }, [roomsQ.data]);
  useEffect(() => { if (peopleQ.data?.length) listPut("people", peopleQ.data); }, [peopleQ.data]);
  const msgsQ = useQuery({ ...roomMsgsOptions(qc, room), refetchInterval: 60_000 });
  const hyLast = useRef(0);   // 이 방 형 마지막 글 때(읽음 표 빨리 받기 · 아래 readsQ)
  { const hm = (msgsQ.data?.messages || []).filter((x) => x.kind === "human"); if (hm.length) hyLast.current = Math.max(hyLast.current, hm[hm.length - 1].ts); }
  useEffect(() => {   // 받은 글 = 이 기기에 둠(다음에 열면 바로 그림 · 잦은 붙임은 묶어서)
    const d = msgsQ.data;
    if (!d?.messages.length) return;
    const t = setTimeout(() => void saveRoom(room, d), 400);
    return () => clearTimeout(t);
  }, [room, msgsQ.data]);
  const readsQ = useQuery({ queryKey: officeKeys.reads(room), queryFn: () => office<Reads>(`rooms/${enc(room)}/reads`), staleTime: 4_000, refetchInterval: () => (document.hidden ? false : Date.now() - hyLast.current < 180_000 ? 5_000 : 15_000) });   // 형 글이 막 간 3분 = 5초(봄이 9초 만에 봤는데 화면은 15초 뒤 지움 · 형 19:49 실물) · 그 밖 15초 · 보일 때만   // 안 본 수(「1」)가 봇 창에 찍힌 뒤 15초 안에 빠지게(형 11-13 「확인하는 즉시」 · 보일 때만 · 앞 판 60초)
  const reactsQ = useQuery({ queryKey: officeKeys.reacts(room), queryFn: () => office<{ reactions: Record<string, Record<string, string[]>>; quick?: string[] }>(`rooms/${enc(room)}/reactions`), staleTime: 15_000, refetchInterval: 60_000 });
  const botsQ = useQuery({ queryKey: officeKeys.bots, queryFn: () => office<{ bots: Bot[] }>("bots").then((j) => j.bots || []), staleTime: 10_000, refetchInterval: 15_000 });   // 15초 = 쉼 되면 「생각 중」이 빨리 꺼지게(형 11-06 12:48 「쉼이면!」)

  const [draft, setDraftS] = useState<Draft | null>(null), draftRef = useRef<Draft | null>(null);
  const setDraft = (d: Draft | null) => { draftRef.current = d; setDraftS(d); };
  useEffect(() => { setDraft(null); }, [room]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {   // 기다리기 고리 = YETA watch 꼴(형 10-28 17:34 「거기걸 가지고 와서 여기에」 · 서버 _watch.js = 1초마다 방 머리·초안 표식만 봄 → 새 글·쓰는 중 초안이 오면 바로) · 탭이 숨으면 쉼 · watch 가 없는 서버 = 옛 wait
    let stop = false, de = "", old = false;
    let ctl: AbortController | null = null;
    (async () => {
      while (!stop) {
        const cur = qc.getQueryData<Page>(officeKeys.msgs(room));
        if (document.hidden || !cur) { await sleep(1500); continue; }
        ctl = new AbortController();
        try {
          const after = cur.messages.at(-1)?.ts ?? 0;
          const j = await office<Page & { detag?: string; draft?: Draft | null }>(old ? `rooms/${enc(room)}/wait?after=${after}&max_s=25` : `rooms/${enc(room)}/watch?after=${after}&de=${encodeURIComponent(de)}&max_s=15`, { signal: ctl.signal });
          if (stop) break;
          if (typeof j.detag === "string") de = j.detag;
          if (j.draft !== undefined) setDraft(j.draft);
          if (j.messages?.length) {
            const d = draftRef.current;
            if (d && j.messages.some((m) => m.who === d.who && m.ts >= d.ts - 2000)) setDraft(null);   // 끝난 답이 올라옴 = 그 쓴 이의 초안 지움
            qc.setQueryData<Page>(officeKeys.msgs(room), (old) => merge(old, j.messages));
            for (const k of [officeKeys.reads(room), officeKeys.rooms, officeKeys.bots, ["channels"], ["duet-channels"]]) void qc.invalidateQueries({ queryKey: k }, { cancelRefetch: false });   // 받는 중이면 그 받기를 그대로 씀(새로 끊고 다시 X) — 글이 잇달아 오면 방 목록 부름이 끊겼다 다시 가며 쌓였음(뜸 11-07 13:1x 잼 = 형 앱 방 목록 1분 54번 · 한 번 2초)
            if (j.messages.some((m) => /!(형|세웅)/.test(String(m.text || "")) || m.reply_to)) void qc.invalidateQueries({ queryKey: officeKeys.msgs(room) });   // !형 글·형 답장 = 대기 알약 바로 다시 셈(형 11-07 10:57 「아직 내 채팅위에 이거 안올라와서 너네가 언급해도 안보임」)
          }
        } catch (e) {
          if (!stop && !old && e instanceof Error && e.message.includes("없는 길")) { old = true; continue; }   // 서버에 watch 가 아직 없음 = 옛 wait
          if (!stop) await sleep(3000);
        }
      }
    })();
    return () => { stop = true; ctl?.abort(); };
  }, [room, qc]);   // eslint-disable-line react-hooks/exhaustive-deps

  // 담당 고르는 중(route pending) 글 = 서버가 같은 글을 다시 써서 담당을 박음(뜸 11-04 16:55 · 밥상 고르기에 소넷 · 최대 ~10초) · watch 는 새 글만 줘서 고친 칸이 안 옴
  //   → pending 글이 있는 동안 4·9·15·24초에 최근 글을 한 번씩 다시 읽어 id 로 합침(「서버가 배분 중」 → 담당 칩 · 형 11-04 11:15) · 다 박히면 멈춤
  const pendingIds = (qc.getQueryData<Page>(officeKeys.msgs(room))?.messages || []).filter((m) => m.route?.state === "pending" && Date.now() - m.ts < 120_000).map((m) => m.id).join(",");
  useEffect(() => {
    if (!pendingIds) return undefined;
    let stop = false;
    const ts: number[] = [];
    for (const ms of [4000, 9000, 15000, 24000]) ts.push(window.setTimeout(async () => {
      if (stop) return;
      const cur = qc.getQueryData<Page>(officeKeys.msgs(room));
      if (!(cur?.messages || []).some((m) => m.route?.state === "pending")) return;
      try { const j = await office<Page>(`rooms/${enc(room)}/messages?n=${RECENT_N}`); if (!stop && j.messages?.length) qc.setQueryData<Page>(officeKeys.msgs(room), (old) => merge(old, j.messages)); } catch { /* 다음 차례 */ }
    }, ms));
    return () => { stop = true; ts.forEach((t) => clearTimeout(t)); };
  }, [pendingIds, room, qc]);

  const older = async () => {   // 앞 글 = 하루치(서버 day=1 · 그날이 비면 글 나올 때까지 앞날 · DAY_MIN 넘을 때까지)
    const cur = qc.getQueryData<Page>(officeKeys.msgs(room));
    const first = cur?.messages[0]?.ts;
    if (!first) return 0;
    const j = await office<Page>(`rooms/${enc(room)}/messages?before=${first}&day=1&n=${DAY_MIN}`);
    qc.setQueryData<Page>(officeKeys.msgs(room), (old) => ({ ...merge(old, j.messages || []), more: !!j.more }));
    return (j.messages || []).length;   // 받은 앞 글 수(0 = 저절로 받기 그만)
  };
  const r = roomsQ.data?.find((x) => x.id === room);
  const pairId = pairOf(r, roomsQ.data || []);   // 그 이가 낀 둘의 방 글 = 이 1:1 안에(./pair-fold.ts · 형 11-13 08:29 「둘 대화로 귀속」)
  const pairQ = useQuery({ ...roomMsgsOptions(qc, pairId || "-"), enabled: !!pairId, refetchInterval: 60_000 });
  const pairMsgs = pairId ? pairQ.data?.messages : undefined;
  const msgs = useMemo(() => (pairMsgs?.length && msgsQ.data ? { ...msgsQ, data: { ...msgsQ.data, messages: mergeTs(msgsQ.data.messages, pairMsgs.map((m) => asSent(m, pairId))) } } : msgsQ), [msgsQ, pairMsgs, pairId]);
  return { r, list: peopleQ.data || [], msgs, reads: readsQ.data, reacts: reactsQ.data, bots: botsQ.data || [], older, draft };
}

type Item = { t: "msg"; m: Msg } | { t: "sys"; msgs: Msg[] } | { t: "band"; msgs: Msg[] } | { t: "sent"; msgs: Msg[] } | { t: "ev"; m: Msg };   // sent = 봇 둘의 방으로 보낸 흔적(SentGroup 알약) · ev = 방 드나듦 줄(나감·다시 옴·초대·방 닫음)
/** 방 드나듦 줄(봄 서버 event · 형 11-06 「00가 나갔습니다는 뜨게해줘. … 이느낌으로 하되, 블록으로 감쌀필요는없어」) = 묶음·알약에 안 섞고 제자리 한 줄 */
const evM = (m: Msg) => m.kind === "system" && !!m.event?.kind;
const evWho = (m: Msg) => { const w = m.event?.who; return Array.isArray(w) ? w : w ? [w] : []; };
const mineOf = (m: Msg) => m.kind === "human" || hyungApp(m);
const sideOf = (x?: Item) => (!x || x.t === "sys" || x.t === "sent" || x.t === "ev" ? "" : x.t === "msg" && mineOf(x.m) ? "me" : "them");   // 간격 = 내 글 쪽 · 상대 글 쪽(묶음 포함) · 시스템 줄은 어느 쪽도 아님
const MEET = "all";   // 회의실(서버 ROOMS id · 형 10-28 22:02 「회의실은 대화가 안접혀도 될거같아 그냥 최신순으로 … 내가 안본거부터 위로 보기 그 버튼만」)
const wakeM = (m: Msg) => m.kind === "system" && /러너/.test(m.who) && /^깸:/.test(m.text || "");

/** 보낸 흔적 하나를 알약에 — 형이 말하기 전 = 지금 알약에 더함(사이에 다른 글이 끼어도) · 형이 말한 뒤 = 그 말 아래 새 알약(형 11-03 19:3x 「그 사이에 내 말이 들어가면 이제 말 다음에 알약이 끼는거고, 그전에는 저렇게 사이에 들어가는거야」) */
function sentInto(out: Item[], pill: { t: "sent"; msgs: Msg[] } | null, m: Msg) {
  if (pill) { pill.msgs.push(m); return pill; }
  const it = { t: "sent" as const, msgs: [m] };
  out.push(it);
  return it;
}

/** 회의실 보기 = 접기 0 · 묶음 0 · 줄기 0 — 받은 순서 그대로 한 줄씩(러너 깸 줄만 뺌 · 시스템 일 = 그 자리 흐린 알약 하나) */
function flatView(list: Msg[]): Item[] {
  const out: Item[] = [];
  let pill: { t: "sent"; msgs: Msg[] } | null = null;   // 형 말 사이 보낸 흔적 = 알약 하나(SentGroup · sentInto)
  for (const m of list) {
    if (wakeM(m)) continue;
    if (m.kind === "sent") { pill = sentInto(out, pill, m); continue; }
    if (mineOf(m)) pill = null;
    if (evM(m)) { out.push({ t: "ev", m }); continue; }
    out.push(m.kind === "system" && !hyungApp(m) && !bubbleM(m) ? { t: "sys", msgs: [m] } : { t: "msg", m });
  }
  return out;
}

/** 줄기(상태 답을 원 글 아래) + 형 보기 묶음(옛 office.html 23차 규칙 그대로) */
function hyungView(list: Msg[], r: OfficeRoom | undefined): Item[] {
  const ids = new Set(list.map((m) => m.id)), kids = new Map<string, Msg[]>();
  const hung = (m: Msg) => !!(m.reply_to && m.state && ids.has(m.reply_to));
  for (const m of list) if (hung(m)) kids.set(m.reply_to as string, [...(kids.get(m.reply_to as string) || []), m]);
  const all: Msg[] = [];
  for (const m of list) { if (hung(m)) continue; all.push(m); for (const k of kids.get(m.id) || []) all.push({ ...k, _thr: true }); }
  const meIds = new Set(all.filter((m) => m.kind === "human").map((m) => m.id));
  const toMe = (m: Msg) => meIds.has(m.reply_to || "") || meIds.has(m.origin || "") || (m.mention || []).includes("형");
  // 1:1 방 주인 글이라도 남만 부른 글(「@빚 …」)은 형 없는 대화 = 묶음으로(형 10-30 18:4x 「이렇게 내가 없는 대화 안보이면 댐」)
  const toOthers = (m: Msg) => { const n = [...(m.mention || []), ...(m.urgent || [])]; return n.length > 0 && !n.includes("형"); };
  // 1:1 방 주인이 형 아닌 이에게 한 답(답표 없음 · 바로 앞 다른 이 글이 형 아니고 30분 안) = 형이 안 낀 대화 → 양쪽 다 묶음
  //   (형 10-30 19:2x 「이렇게 내가 하는대화 아니면 가려지고 클릭 시 보이먄 돼」 · 솔 방: 봄 「!솔」 → 솔 답이 그대로 보였음)
  const answersOther = new Set<string>(), hyAnswer = new Set<string>();   // hyAnswer = 형 글 바로 뒤(30분 안) 주인 글 = 형한테 한 답 · 끝에 남 부름(「!봄 …」)이 섞여도 보임(형 11-01 「누리 대화가 계속 나랑 대화하는데 숨겨져 확인해주고」 · 서버 _unread.js hyAnswer 와 같은 술어)
  if (r?.with) {
    let prev: Msg | null = null;
    for (const m of all) {
      if (wakeM(m) || m.kind === "sent" || (m.kind === "system" && !hyungApp(m))) continue;
      if (m.who !== r.with) { prev = m; continue; }
      if (prev && prev.kind !== "human" && !hyungApp(prev) && m.ts - prev.ts < 30 * 60e3) answersOther.add(m.id);
      if (prev && (prev.kind === "human" || hyungApp(prev)) && m.ts - prev.ts < 30 * 60e3) hyAnswer.add(m.id);
    }
  }
  const showM = (m: Msg) => r?.id === "notice" || m.kind === "human" || hyungApp(m) || toMe(m) || m.state === "decide" || (!!r?.with && m.who === r.with && !m.reply_to && !m.origin && (!toOthers(m) || hyAnswer.has(m.id)) && !answersOther.has(m.id));
  const sysM = (m: Msg) => m.kind === "system" && !hyungApp(m) && !bubbleM(m);
  const out: Item[] = [];
  let pill: { t: "sent"; msgs: Msg[] } | null = null;
  for (let i = 0; i < all.length; i++) {
    const m = all[i];
    if (wakeM(m)) continue;
    if (m.kind === "sent") { pill = sentInto(out, pill, m); continue; }   // 봇끼리 보낸 흔적 = 묶음에 안 섞음 · 형 말 사이 것끼리 알약 하나(SentGroup)
    if (mineOf(m)) pill = null;
    if (evM(m)) { out.push({ t: "ev", m }); continue; }
    if (showM(m) || bubbleM(m)) { out.push({ t: "msg", m }); continue; }
    if (sysM(m)) { const l = [m]; while (i + 1 < all.length && !showM(all[i + 1]) && sysM(all[i + 1]) && !wakeM(all[i + 1]) && !evM(all[i + 1])) l.push(all[++i]); out.push({ t: "sys", msgs: l }); continue; }
    const b = [m];
    while (i + 1 < all.length && !showM(all[i + 1]) && !sysM(all[i + 1]) && !evM(all[i + 1])) b.push(all[++i]);
    out.push({ t: "band", msgs: b });
  }
  return out;
}

type Ctx = {
  room: string; r?: OfficeRoom; list: OfficePerson[]; reads?: Reads; rx: Record<string, Record<string, string[]>>; quick: string[];
  sel: string; setSel: (id: string) => void; onMenu: (m: Msg) => void; onReact: (id: string, e: string) => void; onSwap: (id: string, from: string, to: string, hasTo: boolean) => void; onReply: (m: Msg) => void; onJump: (who: string, line: string, id?: string) => void;
  nre: RegExp | null;   // 봇 이름(시안 · nameRe)
  unseen: (m: Msg) => number;   // 안 본 봇 수(형 글 · 말풍선마다 · unseenOf)
  loose: () => void;   // 맨 아래 붙음 풂(알약 펼칠 때 = 알약 자리 그대로 두고 아래로 펼침)
  onProfile: (who: string) => void;   // 프사 누름 = 프로필 카드
  want: string;   // 그 글로 가는 중인 글 id — 묶음(「메시지 N개」) 안이면 그 묶음을 펼침
  srcs?: Map<string, Src[]>;   // 묶음 stem → 「공식 자료」 이어 글(./bundle-src.ts)
};
const nmOf = (list: OfficePerson[], w: string) => list.find((x) => x.who === w)?.name || w;
/** 이어진 보낸 흔적 = 묶음 알약 하나(형 11-03 19:3x 그림 = 「외 1 · 메시지 13개」 꼴 · 「이런식으로 보이도록 수정해주라」) — 받은 이 얼굴 겹침 · 「보낸 메시지 N개」(하나면 「이름 · 메시지 보냄」)
 *  누르면 그 자리에서 펼침 = 그 둘의 방 대화를 받아 시간 순으로 이어 그림 · 날짜 바뀌는 곳에 날짜 줄 · 왼쪽 줄(묶음 펼침 Band 꼴)(형 11-04 08:04 「새 창에서 열리거나 요약되서 나오지 않고 그 옆에 라인 쭉 나오면서 인 라인으로 … 일자별로는 조금 구분 되게. 저거 누르면 그 대화방 안에서 확 펼쳐지면 좋겠어」) */
/** 알약을 펼칠 때 = 먼저 알약이 지금 화면 안에서 위 머리(떠 있는 네비) 쪽으로 스르륵 올라가고(아래 글이 모자라면 올라갈 수 있는 데까지만) → 그다음 아래로 펼쳐짐
 *  (형 11-04 10:51 「상단 네비 아래로 알약이 올라가면서 펼쳐져야되」 · 11:18 「이 화면 안에서만 위로 올라가고, 자연스럽게 내려가게 풀어질 수 있어?」 · 앞 판 = 올라감·펼침 동시 + 뒤늦은 한 번 더 굴림 = 글이 위로 솟는 듯 보였음)
 *  돌려주는 값 = 올라가는 데 걸릴 ms(그 뒤에 펼침) · 자리 = 얼굴 sticky 가 서는 줄(--ytop) */
function rise(pill: HTMLElement) {
  const box = pill.closest<HTMLElement>(".overflow-y-auto");
  if (!box) return 0;
  const top = (parseFloat(getComputedStyle(pill).getPropertyValue("--ytop")) || 84) + 4;
  const want = box.scrollTop + pill.getBoundingClientRect().top - box.getBoundingClientRect().top - top;
  const to = Math.max(0, Math.min(want, box.scrollHeight - box.clientHeight));
  if (Math.abs(to - box.scrollTop) < 8) return 0;
  box.scrollTo({ top: to, behavior: "smooth" });
  return 280;
}
function SentGroup({ msgs, c }: { msgs: Msg[]; c: Ctx }) {
  const list = c.list, [open, setOpen] = useState(false), [shown, setShown] = useState(false), [on, setOn] = useState(false), [all, setAll] = useState(false);
  const pill = useRef<HTMLButtonElement | null>(null);
  const tos = [...new Set(msgs.map((m) => m.to || "").filter(Boolean))];
  const pairs = [...new Set(msgs.map((m) => m.pair || "").filter(Boolean))];
  const talk = useQuery({
    queryKey: ["nomute", "pairtalk", ...pairs], enabled: open && pairs.length > 0, staleTime: 30_000,
    queryFn: () => Promise.all(pairs.map((p) => office<{ messages?: Msg[] }>(`rooms/${enc(p)}/messages?n=40`).then((j) => j.messages || []).catch(() => [] as Msg[]))).then((a) => a.flat().sort((x, y) => x.ts - y.ts)),
  });
  const faces = <FaceStack ids={tos.slice(0, 3).map((w) => idOf(w, list))} size={18} />;
  const one = msgs.length === 1 ? nmOf(list, msgs[0].to || "") : "";
  // 펼칠 대화 = 이 알약이 묶은 보낸 흔적 첫 시각(1분 앞)부터 · 없으면 받은 것 다 · 셋 넘으면 셋만 + 「전체 보기」(형 11-04 11:19 「만약에 이게 3번 대화 이상이면, 전체 보기로 줄여줄 수 있나? 그 인 라인으로 구분해놓은거 살리면서」)
  const from = Math.min(...msgs.map((m) => m.ts)) - 60_000, got = talk.data || [];
  const rows = got.some((m) => m.ts >= from) ? got.filter((m) => m.ts >= from) : got;
  const SHOW = 3, view = all ? rows : rows.slice(0, SHOW), more = rows.length - view.length;
  const ready = shown && rows.length > 0;
  // 펼침 = 알약이 화면 안에서 위 머리 쪽으로 올라가며 + 대화가 위에서 아래로 쭉 드러남(clip) · 접힘 = 높이 걷힘(형 11-04 09:42 「자연스럽게 아래로 모션」 · 10:51 「상단 네비 아래로 알약이 올라가면서」 · 11:18 「그렇게 하고 쭉 내려가게」)
  useEffect(() => {
    if (open) { setShown(true); return; }
    setOn(false); setAll(false); const t = window.setTimeout(() => setShown(false), 340); return () => window.clearTimeout(t);
  }, [open]);
  useEffect(() => {   // 대화가 그려진 다음 그림 = 키가 다 잡힌 뒤라 위로 올라갈 자리가 있음
    if (!open || !ready || on) return;
    const f = requestAnimationFrame(() => { setOn(true); if (pill.current) rise(pill.current); });
    return () => cancelAnimationFrame(f);
  }, [open, ready, on]);
  return (
    <div className="flex flex-col items-center gap-3">
      <button ref={pill} type="button" className="ygrp" aria-expanded={open} title={msgs.map((m) => `${t12(m.ts)} · ${nmOf(list, m.who)} → ${nmOf(list, m.to || "")}`).join("\n")}
        aria-label={`${tos.map((w) => nmOf(list, w)).join(", ")}에게 보낸 메시지 ${msgs.length}개 · 누르면 그 대화 펼침`} onClick={() => { c.loose(); setOpen((v) => !v); }}>
        {faces}{one ? <>{one} · 메시지 보냄</> : <>{tos.length > 3 ? <b>외 {tos.length - 3}</b> : null}{tos.length > 3 ? " · " : ""}보낸 메시지 {msgs.length}개</>}
      </button>
      {ready ? (
        <div className={`ysent-fold${on ? " on" : ""}${open ? "" : " shut"}`} inert={!open || undefined}>
          <div className="ysent-talk flex w-full flex-col gap-[10px] border-l-2 border-border pl-3">
            {view.map((m, i) => {
              const newDay = i === 0 || dayKey(view[i - 1].ts) !== dayKey(m.ts), cont = !newDay && view[i - 1].who === m.who;
              return <Fragment key={m.id}>{newDay ? <p className="ydate" data-ts={m.ts}>{dateLabel(m.ts)}</p> : null}<Line m={m} c={c} cont={cont} /></Fragment>;
            })}
            {more > 0 ? <button type="button" className="ysent-all" onClick={() => { c.loose(); setAll(true); }}><span>전체 보기 · {more}개 더</span><Chev dir="down" /></button> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
/** 둘의 방 id 조각(서버 _pairs.js = 자리 이름 · eyes·sia·gam …) → 사람 = 앱 id · 봇 이름 · 얼굴 파일 이름 중 맞는 것 */
const seatOf = (id: string, list: OfficePerson[]) => list.find((x) => idOf(x.who, list) === id || x.bot === id || x.slug === id || (x.face || "").replace(/^.*\//, "").replace(/\.[a-z]+$/, "") === id);
/** 둘의 방 머리 = 두 얼굴·이름 + 「둘의 방 · 읽기만」(형 1:1 「메시지 보냄」 줄에서 들어옴 · 방 id = pair-<자리>-<자리>) */
function PairHead({ room, list }: { room: string; list: OfficePerson[] }) {
  const ids = room.replace(/^pair-/, "").split("-");
  return (
    <div className="ypair-head">
      {ids.map((id) => { const p = seatOf(id, list); return <span key={id}><FaceImg id={p ? idOf(p.who, list) : id} size={22} /><b>{p?.name || p?.who || id}</b></span>; })}
      <i>둘의 방 · 읽기만</i>
    </div>
  );
}

const ST: Record<string, [string, string]> = {
  suggest: ["💡 제안", "bg-sky-500/15 text-sky-700 dark:text-sky-300"],
  decide: ["⏳ 형 결정 필요", "bg-amber-500/15 text-amber-700 dark:text-amber-300"],
  verified: ["✅ 검증 통과", "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"],
  talk: ["✓ 말로만", "bg-muted text-muted-foreground"],
};
function StatePill({ m }: { m: Msg }) {
  if (!m.state || !ST[m.state]) return null;
  const k = m.state === "verified" && !m.proof ? "talk" : m.state;   // ✅ 증거 셋이 없으면 「말로만」(서버 proof)
  const e = m.state === "verified" && m.evidence;
  return (
    <span className="mb-1 flex flex-wrap items-center gap-1.5">
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ST[k][1]}`}>{ST[k][0]}</span>
      {e ? <span className="text-xs text-muted-foreground">{[e.target, e.result, e.checked_at ? t12(Date.parse(e.checked_at)) : ""].filter(Boolean).join(" · ")}</span> : null}
    </span>
  );
}

/** 안 본 봇 수(카톡 「1」 · 형 11-13 17:38~17:56 봄 옮김 「만약에 상대가 확인을 못한거면 내가 그걸 알아야될거같은데」 · 「그냥 로그개념」 · 「예를들어 5명인데 2가 남아있으면 2명이 안읽은거지」 · 「모든 끊겨서 온 말풍선 마다 1이 있어야해 (사진 포함)」 · 뎅)
 *  봄 = 서버 가져감 표(reads.got) — 그 봇 창에 깨움 줄이 찍힌 순간 훅이 적음(POST m/got) + read·wait 로 받은 것 · 그 방에 그 뒤 그 봇 글이 있으면 = 본 것
 *  대상 = 1:1 = 그 봇 · 단톡 = 그 방 멤버 중 봇(형 빼고) · 멤버를 모르는 방(회의실 · 옛 방) = 숫자 0 · 하루 넘은 글 = 안 셈(옛 표는 200개만 남음) */
const UNSEEN_DAY = 24 * 3600e3;
function unseenOf(m: Msg, c: Ctx, all: Msg[]) {
  if (m.kind !== "human" || Date.now() - m.ts > UNSEEN_DAY) return 0;
  const bot = (n: string) => n !== "형" && c.list.find((p) => p.who === n)?.kind !== "human";
  const who = c.r?.with ? [c.r.with] : (c.r?.members || []).filter(bot);
  if (!who.length) return 0;
  const got = c.reads?.got || {}, saw = c.reads?.seen || {}, upto = (n: string) => Math.max(c.reads?.reads?.[n] || 0, c.reads?.seen_ts?.[n] || 0);   // 봄(seen · 창에 찍힘) ∪ 가져감(got · read·wait)   // upto = 그 봇이 본 가장 늦은 글 때 → 그 위 형 글은 다 본 것(형 18:11 「1은 당연히 한번 읽으면 위에건 다 사라지는 로직이고」)
  return who.filter((n) => upto(n) < m.ts && !(got[n] || []).includes(m.id) && !(saw[n] || []).includes(m.id) && !all.some((x) => x.who === n && x.ts > m.ts)).length;
}

function Reactions({ m, c, mine }: { m: Msg; c: Ctx; mine: boolean }) {
  const e = Object.entries(c.rx[m.id] || {}).filter(([, w]) => w && w.length);
  const app = new Map<string, string[]>();   // 그록 앱 반응(D14 · 거울 칸 app_reactions) = 같은 그림끼리 묶음
  for (const x of m.app_reactions || []) if (x?.emoji) app.set(x.emoji, [...(app.get(x.emoji) || []), x.who]);
  const [open, setOpen] = useState("");   // 누가 달았나 보기(형 11-02 12:00 「단체톡에서는 내 이모지 누르면 누가 달앗는지 알 수 있어야 함. 내가 너희들 말풍선에 달린 이모디 눌러도 누가 달앗는지 알아야함.」 · 11-14 06:17 「남이 달은거를 클릭 시 누가 달았는지 보는거는 기존과 동일해」)
  const [rad, setRad] = useState("");   // 내가 단 이모지 누름 = 그 자리 구슬(바꾸기 · 가운데 − 빼기 · 형 11-14 06:16 「이미 달은거를 다시 누르면 바꿀 수 있게 해줘 가운데 빼기가 나오면 되겠네」 · 앞 판 = 길게 눌러 바꾸기 줄 · 형 11-08 09:23)
  useEffect(() => {
    if (!open) return undefined;
    const off = (ev: PointerEvent) => { if (!(ev.target as Element | null)?.closest?.(".yrxs")) setOpen(""); };
    const esc = (ev: KeyboardEvent) => { if (ev.key === "Escape") setOpen(""); };
    document.addEventListener("pointerdown", off); window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", off); window.removeEventListener("keydown", esc); };
  }, [open]);
  if (!e.length && !app.size) return null;
  const shown = open ? (e.find(([k]) => k === open)?.[1] || app.get(open.replace(/^app:/, "")) || []) : [];
  const meFace = idOf(m.who, c.list);
  return (
    <div className="yrxs" onClick={(e) => e.stopPropagation()}>   {/* 말풍선 모서리에 겹침(형 10-31 「이모지는 칸을 아껴야되니까」) */}
      {open ? (
        <div className={`yrx-who${mine ? " me" : ""}`} role="dialog" aria-label="반응 단 이">   {/* 누가 달았나 = 이모지 + 얼굴 · 이름 한 줄 · 반응 줄 아래(말풍선 글 안 덮음 · 형 11-14 06:18 「글자가 못나게 보이지 않게 손봐주고」) */}
          <span className="yrx-who-e" aria-hidden>{open.replace(/^app:/, "")}</span>
          <span className="yrx-who-l">{shown.map((x) => <span key={x} className="yrx-who-p"><FaceImg id={idOf(x, c.list)} size={18} /><b>{nmOf(c.list, x)}</b></span>)}</span>
          {!open.startsWith("app:") && !shown.includes("형") ? <button type="button" onClick={() => { c.onReact(m.id, open); setOpen(""); }}>나도</button> : null}
        </div>
      ) : null}
      {[...app].map(([k, w]) => (
        <span key={`app-${k}`} title={`그록 앱 반응 · ${w.map((x) => nmOf(c.list, x)).join(" · ")}`} role="button" tabIndex={0} onClick={() => setOpen(open === `app:${k}` ? "" : `app:${k}`)}
          className="yrx">
          {k}{w.length > 1 ? <span className="tabular-nums">{w.length}</span> : null}
        </span>
      ))}
      {e.map(([k, w]) => {
        const me = w.includes("형");
        return (
          <span key={k} className="yrx-at">
            <button type="button" title={w.map((x) => nmOf(c.list, x)).join(" · ") + (me ? " · 누르면 바꾸기 · 빼기" : "")} aria-expanded={me ? rad === k : open === k}
              onClick={() => { if (me) { setOpen(""); setRad(rad === k ? "" : k); } else { setRad(""); setOpen(open === k ? "" : k); } }}   // 내 것 = 구슬 · 남의 것 = 단 이 보기
              className={`yrx${me ? " on" : ""}`}>
              {k}{w.length > 1 ? <span className="tabular-nums">{w.length}</span> : null}
            </button>
            {me && rad === k ? <QrRadial quick={c.quick} mine={[k]} faceId={meFace} onClose={() => setRad("")}
              onPick={(q) => { if (q !== k) c.onSwap(m.id, k, q, (c.rx[m.id]?.[q] || []).includes("형")); }} onRemove={() => c.onReact(m.id, k)} /> : null}
          </span>
        );
      })}
    </div>
  );
}

function Actions({ m, c, mine }: { m: Msg; c: Ctx; mine: boolean }) {   // 글 위 동작(마우스 올림 · 폰 = 글 누름) = 빠른 반응 · 답장 · 복사 · 고정(형 화면만 · ./pins.tsx)
  const [copied, setCopied] = useState(false);
  const pins = usePinActions(c.room);
  return (
    <div className={`mt-1 flex flex-wrap items-center gap-0.5 rounded-full border border-border bg-background/95 p-0.5 shadow-sm ${mine ? "self-end" : "self-start"}`} role="group" aria-label="글 동작">
      {c.quick.map((q) => (
        <button key={q} type="button" className="grid size-8 place-items-center rounded-full hover:bg-foreground/5" aria-label={`반응 ${q}`} onClick={() => c.onReact(m.id, q)}>{q}</button>
      ))}
      <button type="button" className="rounded-full px-2.5 py-1 text-xs hover:bg-foreground/5" onClick={() => c.onReply(m)}>답장</button>
      <button type="button" className="rounded-full px-2.5 py-1 text-xs hover:bg-foreground/5" onClick={() => { void navigator.clipboard?.writeText(String(m.text || "").replace(QUOTE, "")).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }); }}>{copied ? "복사함" : "복사"}</button>
      {pins.can ? <button type="button" className="rounded-full px-2.5 py-1 text-xs hover:bg-foreground/5" disabled={pins.busy} onClick={() => { pins.pin({ id: m.id, ts: m.ts }); c.setSel(""); }}>공지</button> : null}   {/* 낱말 = 「공지」(형 11-08 23:09 「이거 고정해도 공지가 안되네 용어 곤지로 바꾸고 확인」 · 뜸 1c8e96a 에서 빠진 한 자리 · 뎅 02:12 찾음 · 깃) */}
    </div>
  );
}

/** 사진 크게 보기(형 10-31 「누르면 확대할 수 있고」 · 「뒤로가기 버튼도 있어야 하고 보낸사람과 시각이 위에 떠야해」 · 「뒤로 가기 폰 자체의 버튼도 작동해야함」) · 입력칸 미리보기도 씀
 *  닫는 길 넷(아무 데나 누름 · 위 꺽쇠 · Esc · 폰 뒤로) = 하나 — 기록 한 칸을 얹어 두고 되돌림 · popstate 에서 닫힘 · ui/shell.tsx 는 .nm-zoom 이 있으면 판을 안 옮김 */
function zoomImage(src: string, alt = "", who = "", when = "") {
  const v = document.createElement("div"), bar = document.createElement("div"), back = document.createElement("button"), i = new Image();
  v.className = "nm-zoom"; bar.className = "nm-zoom-bar"; i.src = src; i.alt = alt;
  back.type = "button"; back.setAttribute("aria-label", "뒤로");
  back.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>';
  bar.append(back);
  if (who) { const b = document.createElement("b"); b.textContent = who; bar.append(b); }
  if (when) { const s = document.createElement("small"); s.textContent = when; bar.append(s); }
  const name = alt || src.split("/").pop()?.split("?")[0] || "photo.jpg";
  const sp = document.createElement("span"), dl = document.createElement("a");
  sp.className = "nm-zoom-sp"; dl.className = "nm-zoom-dl"; dl.href = dlOf(src, name); dl.download = name; dl.setAttribute("aria-label", "이 사진 저장"); dl.innerHTML = DOWN_SVG;
  bar.append(sp, dl);
  v.append(bar, i);
  // 길게 누름 = 아래 「사진 저장」 판(형 11-04 08:22 「이 두 화면에서 길게 누르면 사진을 다운로드」) · 그 손을 뗄 때 오는 누름은 닫기로 안 셈 · 판이 떠 있을 때 누름 = 판만 닫음
  let held = false, timer = 0, sheet: HTMLElement | null = null;
  const hush = () => { sheet?.remove(); sheet = null; };
  const said = (t: string) => { hush(); const n = document.createElement("p"); n.className = "nm-zoom-note"; n.textContent = t; v.append(n); window.setTimeout(() => n.remove(), 1400); };
  const ask = () => {
    if (sheet) return;
    held = true; navigator.vibrate?.(8);
    sheet = document.createElement("button"); sheet.type = "button"; sheet.className = "nm-zoom-save"; sheet.innerHTML = `${DOWN_SVG}<span>사진 저장</span>`;
    sheet.onclick = (e) => { e.stopPropagation(); savePic(src, name); said("저장했어"); };
    v.append(sheet);
  };
  dl.onclick = (e) => { e.stopPropagation(); said("저장했어"); };
  i.addEventListener("pointerdown", (e) => { if (e.button) return; window.clearTimeout(timer); timer = window.setTimeout(ask, 500); });
  for (const k of ["pointerup", "pointercancel", "pointerleave"]) i.addEventListener(k, () => window.clearTimeout(timer));
  i.addEventListener("pointermove", (e) => { if (Math.abs(e.movementX) + Math.abs(e.movementY) > 6) window.clearTimeout(timer); });
  i.addEventListener("contextmenu", (e) => { e.preventDefault(); window.clearTimeout(timer); ask(); });   // 안드로이드 길게 누름 · PC 오른쪽 누름 = 기본 메뉴 대신 같은 판
  let closing = false;
  const close = () => { if (held) { held = false; return; } if (sheet) { hush(); return; } if (closing) return; closing = true; history.back(); };
  const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
  const off = () => { window.setTimeout(() => v.remove(), 0); window.removeEventListener("popstate", off); window.removeEventListener("keydown", key); };   // 지우기는 한 박자 늦게 = shell.tsx 뒤로 처리기가 .nm-zoom 을 먼저 봄(듣는 차례가 바뀌어도 대화 판 그대로)
  v.onclick = close;
  window.addEventListener("popstate", off); window.addEventListener("keydown", key);
  history.pushState({ ...history.state, nmZoom: 1 }, "");
  document.body.append(v);
}
const DOWN_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>';
/** 사진 저장 = 내려받기(사무실 파일 = dl=1 · 다른 출처 = /api/dl 프록시 · ./news-data.ts dlHref) */
const dlOf = (src: string, name: string) => (src.startsWith("/api/office/file?") ? (src.includes("dl=1") ? src : `${src}&dl=1`) : dlHref(src, name));   // 사무실 파일 = 받기 표(dl=1 · 붙임 파일로)
function savePic(src: string, name: string) { const a = document.createElement("a"); a.href = dlOf(src, name); a.download = name; a.rel = "noopener"; document.body.append(a); a.click(); a.remove(); }
/** 글에 든 사진(올린 파일 · 글 속 같은 출처 그림) = 길게 누른 메뉴 「사진 저장」 */
const picsOf = (m: Msg) => {
  const meta = new Map((m.file_meta || []).filter((x) => x?.path).map((x) => [x.path, x]));
  const files = [...new Set((m.files || []).map(String))].filter((p) => IMG_RE.test(p)).map((p) => ({ src: fileUrl(p), name: meta.get(p)?.name || fileName(p) }));
  return files.length ? files : textPhotos(String(m.text || "")).map((u) => ({ src: u, name: u.split("/").pop()?.split("?")[0] || "photo.jpg" }));
};
const zoomWhen = (ts: number) => { const d = new Date(ts); return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
(window as unknown as { nmZoom?: typeof zoomImage }).nmZoom = zoomImage;
const onlyPhotos = (m: Msg) => !!m.files?.length && m.files.every((p) => IMG_RE.test(String(p)) || VID_RE.test(String(p)));   // 사진(·영상)만 든 글 = 말풍선 없이(형 10-31 「사진 주변 테두리 없애줘」)
/** 보낸 파일 머리표(형 11-05 09:13 「파일 올리면, 파일 용량이랑 0.4MB · 확장자 이렇게 나오게해주라」 · 「블릿 하나 똑같이 간격에 달아서, 애들이 확실히 읽어지면 읽음. 뜨게」)
 *  = 왼쪽 위 「0.4MB · PNG · 읽음」 · 읽음 = 서버 file_read[path](읽은 이 목록 · 기준은 깃·빠르 회의실 논의 뒤) 있을 때만 */
function FileTag({ f, m }: { f: { p: string; n: string; b: number; o?: boolean | number; ob?: number; d?: number }; m: Msg }) {
  const m1 = (x: number) => Math.max(0.1, Math.round((x / 1048576) * 10) / 10);
  // 크기 = 보낸 판 하나(압축되면 압축된 크기 · 형 11-05 10:47 「지금 원본파일의 크기 대신에 압축되면 압축된 크기가 보여야한다는의미엿음」)
  const mb = f.b ? `${m1(f.b)}MB` : "", ext = (/\.([A-Za-z0-9]{1,6})$/.exec(f.n || f.p)?.[1] || "").toUpperCase();
  const read = ((m as { file_read?: Record<string, string[]> }).file_read || {})[f.p] || [];
  // 「압축됨」/「원본」 둘 중 하나(형 11-05 09:39 「그 옆에 블릿 달아서 압축됨 원본 둘중 하나로만 뜨게해줄래? 원본이면 강조색으로」) · 서버 file_meta.original 있을 때만(없으면 모름 = 안 띄움)
  const kind = f.o === undefined ? "" : f.o ? "원본" : "압축됨";
  const len = f.d ? `${Math.floor(f.d / 60)}:${String(Math.round(f.d % 60)).padStart(2, "0")}` : "";   // 영상 길이 m:ss(형 10:44)
  const tag = [mb, ext, len, kind, read.length ? "읽음" : ""].filter(Boolean);
  return tag.length ? <span className="nm-ftag" title={read.length ? `읽은 이: ${read.join(" · ")}` : undefined}>{tag.map((t, i) => <span key={i} className={t === "읽음" ? "rd" : t === "원본" ? "og" : undefined}>{t}</span>)}</span> : null;
}
/** 링크 = 늘 새 창 · 그 기기 기본 브라우저(형 11-05 12:27 「링크같은거는 항상 클릭하면 새 창에서, 그 환경에 설정된 기본 브라우저로 열리게」)
 *  대화창 안 바깥 주소 <a> 누름을 한 곳에서 받아 window.open(_blank · noopener) — 설치 앱(PWA)에선 기기 기본 브라우저로 나감 · 같은 사이트 길(#/…·/api/office/file)은 그대로 */
if (typeof document !== "undefined") document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement | null)?.closest?.(".ychat a[href]") as HTMLAnchorElement | null;
  if (!a || e.defaultPrevented || e.button !== 0) return;
  let u: URL; try { u = new URL(a.href, location.href); } catch { return; }
  if (u.origin === location.origin || !/^https?:$/.test(u.protocol)) return;
  e.preventDefault(); window.open(u.href, "_blank", "noopener,noreferrer");
}, true);
/** 파일 칸 = 텔레그램 꼴(형 11-05 12:21~12:25 「파일을 붙이게 될 경우, 나에게 파일 형식에 맞게 파일명이 오고, 다운로드 가능하게만 나오면 돼」 · 「확장자도 당연히 있어야 겠지. … 이름은 좀 중간 축약되어도 돼.」 · 「텔레그램식으로 갈거면, 그 확장자에 따라서 상징되는 이미지가 달라져야돼」) */
const extOfName = (n: string) => (/\.([A-Za-z0-9]{1,6})$/.exec(n)?.[1] || "").toUpperCase();
/** 가운데 줄임 = 앞 14자 … 끝 6자 + 확장자(이름이 중요할 수 있어 앞뒤를 남김) */
const midName = (n: string) => { const m = /^(.*?)(\.[A-Za-z0-9]{1,6})?$/.exec(n) || ["", n, ""]; const stem = m[1] || "", ext = m[2] || ""; return [...stem].length > 24 ? `${[...stem].slice(0, 14).join("")}…${[...stem].slice(-6).join("")}${ext}` : n; };
const FILE_KIND: [RegExp, string, string][] = [
  [/^(pdf)$/, "PDF", "#E5484D"], [/^(docx?|hwpx?|rtf|odt|pages)$/, "DOC", "#3E7BFA"], [/^(xlsx?|csv|tsv|numbers|ods)$/, "XLS", "#30A46C"],
  [/^(pptx?|key|odp)$/, "PPT", "#F76B15"], [/^(zip|rar|7z|tar|gz|tgz|bz2|xz)$/, "ZIP", "#E9B500"], [/^(mp3|wav|m4a|aac|flac|ogg|opus)$/, "♪", "#FF8B3E"],
  [/^(js|ts|tsx|jsx|py|json|html|css|md|sh|yml|yaml|sql|go|rs|java|c|cpp)$/, "</>", "#8E4EC6"], [/^(txt|log|srt|vtt)$/, "TXT", "#8B8D98"],
  [/^(exe|msi|bat|cmd|ps1|vbs|dll|scr|com|jar|apk|dmg|iso|lnk)$/, "RUN", "#5B5E66"], [/^(psd|ai|fig|sketch|svg|eps)$/, "ART", "#D6409F"],
];
function FileIcon({ name }: { name: string }) {
  const e = extOfName(name).toLowerCase(), k = FILE_KIND.find(([re]) => re.test(e));
  return <span className="nm-fc-ic" style={{ background: k ? k[2] : "#6B6F76" }} aria-hidden>{k ? k[1] : e.slice(0, 4) || "FILE"}</span>;
}
/** 파일마다 다운로드 단추(형 11-05 11:35 「옆에 다운로드 버튼이 각각 나오게 할 수 있어?」) = 사무실 파일 받기 표(dl=1 · savePic 길) · 누르면 말풍선 누름으로 안 번짐 */
function DlBtn({ p, n }: { p: string; n: string }) {
  return (
    <DlSeqButton className="nm-dl" hrefs={[dlOf(fileUrl(p), n)]} ariaLabel={`${n} 내려받기`} size={15} />   // 누르면 라임 → 체크 팝 → 돌아옴(형 11-13 02:32 「색만 바뀌면 솔직히 잘 눌럿다는 공감이 안되거든 바꼇다가 다시 돌아와야해」 · ui/dl-seq.tsx)
  );
}
/** 영상 자막 알약(형 11-05 11:04 「채팅에 미리 떠있고, 그게 늦게 전달가도됨」 · 「자막이 좀 늦게 가도 괜찮아」)
 *  = 영상은 바로 뜨고 밑에 「자막 만드는 중…」 → 받아쓰기 오면 그 자리에서 「자막」 펼침(서버 file_meta.transcript · transcript_state 'wait'|'done'|'fail' · 빠르 상주) */
function Subs({ meta }: { meta?: { transcript?: string; transcript_state?: string } }) {
  const [open, setOpen] = useState(false);
  const st = meta?.transcript_state, tx = String(meta?.transcript || "").trim();
  if (!st && !tx) return null;
  if (st === "wait" && !tx) return <span className="nm-subs wait" role="status">자막 만드는 중…</span>;
  if (!tx) return st === "fail" ? <span className="nm-subs fail">자막 못 만듦</span> : null;
  return (
    <div className="nm-subs-box">
      <button type="button" className="nm-subs" aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen((x) => !x); }}>{open ? "자막 접기" : "자막"}</button>
      {open ? <p className="nm-subs-tx">{tx}</p> : null}
    </div>
  );
}
/** 못 그린 그림·영상 = 빈칸(0x0) 대신 이름 + 「못 불러왔어」 · 누르면 원본 주소(형 11-05 06:14 「애들이 보낸 영상 사진 안들어와」) */
function Broken({ f, kind }: { f: { p: string; n: string }; kind: string }) {
  return (
    <a href={fileUrl(f.p)} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2 hover:bg-foreground/5">
      <span aria-hidden className="text-lg">⚠️</span>
      <span className="min-w-0"><span className="block truncate text-sm font-medium">{f.n}</span><small className="text-xs text-muted-foreground">{kind}을 못 불러왔어</small></span>
    </a>
  );
}
function Files({ m }: { m: Msg }) {
  const qc = useQueryClient();
  const meta = new Map((m.file_meta || []).filter((x) => x?.path).map((x) => [x.path, x]));
  const ps = [...new Set((m.files || []).map(String))];
  const one = (p: string) => ({ p, n: meta.get(p)?.name || fileName(p), b: meta.get(p)?.bytes || 0, o: (meta.get(p) as { original?: boolean | number } | undefined)?.original, ob: (meta.get(p) as { orig_bytes?: number } | undefined)?.orig_bytes });   // o = 원본으로 보냄(서버 original=1 · 형 11-05 09:39)
  const GIF_RE = /\.gif$/i, gifs = ps.filter((p) => GIF_RE.test(p)).map(one);   // 움짤(형 11-05 12:10 「gif는, 움짤같은거로 쓰게 … 일렬로 최대 3개까지 … 지금 크기의 50%로」)
  const imgs = ps.filter((p) => IMG_RE.test(p) && !GIF_RE.test(p)).map(one), vids = ps.filter((p) => VID_RE.test(p)).map(one), rest = ps.filter((p) => !IMG_RE.test(p) && !VID_RE.test(p)).map(one);
  const [bad, setBad] = useState<Record<string, boolean>>({}), [dur, setDur] = useState<Record<string, number>>({});   // dur = 영상 길이(초 · 형 11-05 10:44 「비디오에 가져다되면 초도 나오게」)   // 못 그린 그림·영상(받은 몸이 그림이 아님 · 11-05 번개 url 길 = Access 로그인 HTML) = 빈칸 대신 「못 불러왔어」 칸
  const enc = useEnc(m);   // 봇에게 가는 정도(영상 · 파동 · 자막 · 사진) · 닿은 미디어 = 라임 테두리
  return (
    <div className="nm-encrow">   {/* 게이지 = 미디어 왼쪽 아주 작게(상대 글은 오른쪽) · 틀은 늘 같음(게이지가 뜨고 져도 영상이 다시 안 실림) */}
    <EncGauge e={enc} />
    <div className="yfiles flex flex-col gap-2">
      {gifs.length ? (
        <div className={`nm-gifs${gifs.length < 3 ? ` c${gifs.length}` : ""}`}>   {/* 움짤 = 머리표·다운로드 단추 0 · 한 줄 셋 · 반 크기 · 저장 = 꾹 눌러 「사진 저장」(MsgMenu picsOf) */}
          {gifs.map((f) => <img key={f.p} src={fileUrl(f.p)} alt={f.n} loading="lazy" className={`nm-gif${encRing(enc, f.p)}`} onError={() => setBad((b) => ({ ...b, [f.p]: true }))} />)}
        </div>
      ) : null}
      {imgs.filter((f) => !bad[f.p]).length > 1 ? (
        <>
          <PicGrid pics={imgs.filter((f) => !bad[f.p]).map((f) => ({ p: f.p, src: fileUrl(f.p), name: f.n }))} who={nmOf(qc.getQueryData<OfficePerson[]>(officeKeys.people) || [], m.who)} when={zoomWhen(m.ts)} ring={(p) => encRing(enc, p)} dl={dlOf} onBad={(p) => setBad((b) => ({ ...b, [p]: true }))} />
          {imgs.filter((f) => bad[f.p]).map((f) => <Broken key={f.p} f={f} kind="그림" />)}
        </>
      ) : imgs.length ? (
        <div className="yfiles flex flex-col items-start gap-2">   {/* 두 장 이상 = 세로(형 10-31 「그리고 2개 이상은 세로로.」) */}
          {imgs.map((f) => bad[f.p] ? <Broken key={f.p} f={f} kind="그림" /> : (
            <a key={f.p} href={fileUrl(f.p)} target="_blank" rel="noopener" title={`${f.n} — 누르면 크게`} className={`relative block overflow-hidden rounded-2xl${encRing(enc, f.p)}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (justHeld()) return; zoomImage(fileUrl(f.p), f.n, nmOf(qc.getQueryData<OfficePerson[]>(officeKeys.people) || [], m.who), zoomWhen(m.ts)); }}>
              <img src={fileUrl(f.p)} alt={f.n} loading="lazy" className="block max-h-60 max-w-[240px] object-cover" onError={() => setBad((b) => ({ ...b, [f.p]: true }))} />
              <FileTag f={f} m={m} />
              <DlBtn p={f.p} n={f.n} />
            </a>
          ))}
        </div>
      ) : null}
      {vids.map((f) => bad[f.p] ? <Broken key={f.p} f={f} kind="영상" /> : (
        <div key={f.p} className="relative"><span className={`nm-encv${encRing(enc, f.p)}`}><AutoVideo src={fileUrl(f.p)} label={f.n} onError={() => setBad((b) => ({ ...b, [f.p]: true }))} onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (Number.isFinite(d) && d > 0) setDur((x) => ({ ...x, [f.p]: d })); }} /></span><FileTag f={{ ...f, d: dur[f.p] }} m={m} /><DlBtn p={f.p} n={f.n} /><Subs meta={meta.get(f.p) as { transcript?: string; transcript_state?: string } | undefined} /></div>
      ))}
      {rest.map((f) => (
        <a key={f.p} href={fileUrl(f.p)} target="_blank" rel="noopener" className="nm-fcard" title={f.n} onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (justHeld()) return; savePic(fileUrl(f.p), f.n); }}>
          <FileIcon name={f.n} />
          <span className="nm-fc-t"><b>{midName(f.n)}</b><small>{[f.b ? size(f.b) : "", extOfName(f.n)].filter(Boolean).join(" · ")}</small></span>
          <span className="nm-fc-dl" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></svg></span>
        </a>
      ))}
    </div>
    </div>
  );
}

/** 영상 첨부 미리보기 = 화면에 보이면 저절로 돎(형 11-09 05:14 임시방 「그리거 대화창에서 영상 미리보기 자동으움직이먼 졸겠낸」 · 뜸 05:15 꼴) —
 *  소리 끔·반복 · 50% 넘게 보일 때만 재생 · 화면 밖·탭 숨김이면 멈춤 · controls 는 그대로(누르면 소리·전체 화면) · 「움직임 줄이기」면 안 돎(도중 바뀜도 따름) · 저장(preload)은 metadata 그대로(보이기 전엔 안 받음)
 *  사용자가 멈춘 영상은 사용자가 다시 누를 때까지 안 돌림(모루 11-09 05:33 · 앞 판은 100%→90% 스크롤에도 play 가 다시 걸렸음) · 결정은 ./auto-video.ts(순수 · 시험 tests/auto-video.test.ts) */
function AutoVideo({ src, label, onError, onLoadedMetadata }: { src: string; label: string; onError: () => void; onLoadedMetadata: (e: React.SyntheticEvent<HTMLVideoElement>) => void }) {
  const ref = useRef<HTMLVideoElement>(null), st = useRef<AvState>(avInit()), ours = useRef(false);   // ours = 지금 거는 pause 가 우리 것(사용자 멈춤과 가름)
  useEffect(() => {
    const v = ref.current;
    if (!v || typeof IntersectionObserver === "undefined") return;
    const mq = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    st.current = avInit(!!mq?.matches, document.visibilityState === "hidden");
    v.muted = true;   // React 가 muted 속성을 첫 그림에 안 박는 일이 있어 손으로(자동 재생은 소리 꺼야 됨)
    const run = (e: AvEvent) => {
      const r = avStep(st.current, e);
      st.current = r.s;
      if (r.act === "play") v.play().catch(() => {});
      else if (r.act === "pause" && !v.paused) { ours.current = true; v.pause(); }
    };
    const onPause = () => { const byUs = ours.current; ours.current = false; run({ t: "pause", byUs }); };
    const onPlay = () => run({ t: "play" });
    const onVis = () => run({ t: "hidden", v: document.visibilityState === "hidden" });
    const onMq = (ev: MediaQueryListEvent) => run({ t: "reduce", v: ev.matches });
    const io = new IntersectionObserver((es) => { const e = es[0]; if (e) run({ t: "ratio", r: e.intersectionRatio }); }, { threshold: [AV_MIN] });
    io.observe(v);
    v.addEventListener("pause", onPause); v.addEventListener("play", onPlay);
    document.addEventListener("visibilitychange", onVis); mq?.addEventListener("change", onMq);
    return () => { io.disconnect(); v.removeEventListener("pause", onPause); v.removeEventListener("play", onPlay); document.removeEventListener("visibilitychange", onVis); mq?.removeEventListener("change", onMq); v.pause(); };
  }, [src]);
  return <video ref={ref} src={src} controls playsInline muted loop preload="metadata" aria-label={label} className="yvid block max-h-72 max-w-[260px] rounded-2xl bg-black" onError={onError} onLoadedMetadata={onLoadedMetadata} />;
}

/** 글 속 부름(「@이름」·「!이름」) — 서버가 알아들은 이름만(mention · urgent · alias 칸 = 부름이 실제로 걸린 것만 칩) · 긴 이름 먼저(「@윈터」보다 「@윈터 PM」) */
const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function callRe(m: Msg): RegExp | null {
  const names = [...new Set([...(m.mention || []), ...(m.urgent || []), ...Object.keys(m.alias || {}).map((k) => k.replace(/^[@!]/, "")), ...(m.kind !== "human" ? ["형", "세웅"] : [])])].filter(Boolean);   // 형·세웅 = 늘 칩(형 11-07 11:40 「느낌표 해도, 내 얼굴이 나와야돼 … 골뱅이도 마찬가지」 · 서버 mention 에 형이 빠질 때도)
  return names.length ? new RegExp(`([@!](?:${names.sort((a, b) => b.length - a.length).map(reEsc).join("|")}))`, "g") : null;
}
/** 글 속 봇 이름(부름 아닌 그냥 이름 · 형 10-30 18:4x 「호출은 그대로 두고 그냥 명칭일라도 색을 다르게 … 시안색으로」) = 시안 글자 —
 *  앞 = 글 처음·한글/영문/숫자/@/! 아닌 자리 · 뒤 = 토씨 하나까지만 붙고 낱말 끝(「결과」·「온도」·「감사」 안의 한 글자는 안 칠함 · 한 글자 이름은 「과·와·도」 토씨 뺌) */
const NAME_TAIL = "(?:야|아|님|씨|에게|한테|께|이|가|은|는|을|를|랑|이랑|의|이야|이가|(?:에게|한테|께|이랑|랑)(?:도|는|은|만))";   // 토씨 둘 = 「빠르한테도」(형 10-31 「빠르게 채색이 안되네」 · 「빠르게」는 안 칠함)
const NAME_TONE = new Map<string, string>();   // 형 10-31 「그록봇은 시안 · 클로드봇은 주황네온 · 지피티 봇은 연보라네온」 · 「형 또는 세웅 은 노뮤트색」 = 이름 → 색 칸(gk·cl·gp·hy · 호출 칩 ycall 은 그대로)
/** 이름·낱말 색 칸 — 묶음 낱말(「클로드」 등)은 「w」를 더 붙여 이름과 갈림(형 11-06 15:56 「클로드 색이 무지개로 바꼇는데 이거 확인」 = 무지개가 우리 이름에도 번졌음) */
/** 우리 이름 = 각자 제 색(조약돌 BEING_INK 와 같음)(형 11-06 17:24 「애들 이름은 그냥 제대로 나오게해줘 붉은색 말고..」) · 묶음 낱말·그록봇·형 = 원래 칸 색 */
const WHO_KEY: Record<string, string> = { 봄: "bom", 윈터: "winter", 시아: "sia", 뎅: "deng", 빠르: "fast", 누리: "neo", 뜸: "eyes", 번개: "lightning", 챙: "chaeng" };
const inkOfName = (n: string): string | undefined => { const k = WHO_KEY[n]; return k ? (k === "deng" ? "#d9894a" : BEING_INK[k]) : undefined; };   // 뎅 갈색은 어두운 판에서 묻혀 한 단계 밝게
const toneOf = (n: string) => { const t = NAME_TONE.get(n) || ""; return t && TONE_WORDS.some(([w]) => w === n) ? `${t} w` : t; };
const TONE_OF: Record<string, string> = { 그록봇: "gk", 클로드: "cl", 닷: "gp", 부름: "gp" };
const TONE_WORDS: [string, string][] = [["그록", "gk"], ["그록봇", "gk"], ["클로드", "cl"], ["클로드봇", "cl"], ["지피티", "gp"], ["지피티봇", "gp"], ["세웅", "hy"]];   // 세웅 = 명부 이름이 「형」이라 따로(형 10-31 「세웅 키워드도 노뮤트색으로 형 키워드처럼」 · 호출 !세웅·@세웅 은 그대로)
const GROUP_PICK = [{ id: "group-all", name: "모두", title: "전원" }, { id: "group-grok", name: "그록", title: "그록봇" }, { id: "group-claude", name: "클로드", title: "클로드" }, { id: "group-gpt", name: "지피티", title: "지피티" }];   // 입력칸 「@」·「!」 목록 맨 위 = 묶음 부르기(형 10-31 · 서버 _names.js)
function nameRe(list: OfficePerson[]): RegExp | null {
  NAME_TONE.clear();
  for (const [w, tone] of TONE_WORDS) NAME_TONE.set(w, tone);   // 묶음 낱말(클로드·그록…) = toneOf 가 「w」를 더 붙임
  for (const p of list) {
    const tone = p.kind === "human" ? "hy" : TONE_OF[p.cls || ""];
    if (tone) for (const n of [p.who, p.name]) if (n) NAME_TONE.set(n, tone);
  }
  const ns = [...NAME_TONE.keys()].sort((a, b) => b.length - a.length);
  if (!ns.length) return null;
  const one = ns.filter((n) => n.length === 1), more = ns.filter((n) => n.length > 1);
  const alt = [...(more.length ? [`(?:${more.map(reEsc).join("|")})(?=(?:${NAME_TAIL.slice(3, -1)}|와|과|도)?(?![0-9A-Za-z가-힣_]))`] : []),
    ...(one.length ? [`(?:${one.map(reEsc).join("|")})(?=${NAME_TAIL}?(?![0-9A-Za-z가-힣_]))`] : [])];
  return new RegExp(`(^|[^0-9A-Za-z가-힣_@!\\[])(${alt.join("|")})`, "g");
}
function named(text: string, nre: RegExp | null, key: string): ReactNode {
  if (!nre) return tokened(text, key);
  const out: ReactNode[] = [];
  let last = 0, k = 0;
  for (const mm of text.matchAll(nre)) {
    const at = (mm.index || 0) + mm[1].length;
    if (at > last) out.push(tokened(text.slice(last, at), `${key}-s${k}`));
    out.push(<span key={`${key}-n${k++}`} className={`yname-c ${toneOf(mm[2])}`} style={inkOfName(mm[2]) ? { color: inkOfName(mm[2]) } : undefined}>{mm[2]}</span>);
    last = at + mm[2].length;
  }
  if (!out.length) return tokened(text, key);
  if (last < text.length) out.push(tokened(text.slice(last), `${key}-e`));
  return out;
}
/** 글 속 말 색(형 10-31 「노력이 들어가면안돼. 로직이여야해.」) — 파일 이름·커밋 번호 = 은회색(형 「파일명이 은색으로 보이는건 너무 좋은데」) · PR/#번호·시간(숫자 있는 꼴만 · 「2개」·「3→2」는 안 칠함) = 보라 → 규칙 하나로 글마다 저절로 · 코드·주소 안은 안 칠함 */
const TOK_B = "(?<![0-9A-Za-z_./#-])";
const TOK_RE = new RegExp([
  "(?<fl>(?<![\\w가-힣/.-])[\\w가-힣][\\w가-힣./\\[\\]-]*\\.(?:jsonl?|md|mjs|js|tsx?|py|ya?ml|sh|css|html?|csv|txt|png|jpe?g|webp|mp4|patch)(?![\\w가-힣]))",
  `(?<gh>${TOK_B}#\\d{2,}|(?<![0-9A-Za-z_])PR(?![0-9A-Za-z_]))`,
  `(?<hs>${TOK_B}(?=[0-9a-f]*[a-f])(?=[0-9a-f]*\\d)[0-9a-f]{7,40}(?![0-9A-Za-z_]))`,
  `(?<tm>${TOK_B}\\d{1,2}:\\d{2}(?::\\d{2})?(?:\\s?[AaPp][Mm])?|${TOK_B}\\d{4}-\\d{2}-\\d{2}|${TOK_B}(?:0?[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])(?![\\d-])|${TOK_B}\\d{1,2}월(?:\\s?\\d{1,2}일)?|${TOK_B}\\d{1,2}(?:[·,~-]\\d{1,2})*시(?!간)|${TOK_B}\\d+(?:시간|분|초|일|개월|년|주일)(?![0-9A-Za-z]))`,
].join("|"), "gu");
const tokOf = (m: RegExpMatchArray) => (m.groups?.fl || m.groups?.hs ? "fl" : m.groups?.gh ? "gh" : "tm");
function tokened(text: string, key: string): ReactNode {
  const out: ReactNode[] = [];
  let last = 0, k = 0;
  for (const mm of text.matchAll(TOK_RE)) {
    const at = mm.index || 0;
    if (at > last) out.push(text.slice(last, at));
    out.push(<span key={`${key}-k${k++}`} className={`ytok ${tokOf(mm)}`}>{mm[0]}</span>);
    last = at + mm[0].length;
  }
  if (!out.length) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
}
/** 부름 칩 = 작은 얼굴 + 이름 알약(형 11-04 17:15 dm-sia 「혹시 내가 골뱅이 하면, 이거 얼굴 조그마하게 해서, 이쁘게 호출모양이 들어가게 가능해?」 + 사진 = 「보낸 메시지」 알약 꼴 축약)
 *  · 「!」 = 이름 뒤 작은 라임 「!」(바로 깸) · 얼굴 없는 이름(모두·묶음) = 글자 그대로 */
function CallChip({ t }: { t: ReactNode }) {
  const s = typeof t === "string" ? t : Array.isArray(t) && t.every((x) => typeof x === "string") ? t.join("") : null;
  const m = s ? s.match(/^([@!])(.+)$/) : null;
  const who = m?.[2] || "", hy = who === "형" || who === "세웅", p = m ? peopleSync().find((x) => (hy ? x.who === "형" : x.who === who || x.name === who || (x.aka || []).includes(who))) : undefined;
  if (!m || !p?.face) return <span className="ycall">{t}</span>;
  // 형 부름 = 형 얼굴 칩 · 「!형」 = 파랑·라임 강조(형 11-07 11:40 「오히려 느낌표는 파랑 라임으로」 · 봄 나눔 = 「💡 제안」 표지 색 결)
  return <span className={`ycall yface${hy ? (m[1] === "!" ? " hy-bang" : " hy-at") : ""}`} title={`${m[1]}${who}`}><FaceImg id={idOf(p.who)} size={15} /><span>{hy ? "형" : p.name || who}</span></span>;   // 「!」 표지 뺌(형 11-04 17:36 「빠르는 왜 느낌표가 있어?」 · 「느낌표가 필요없음」)
}
function called(text: string, re: RegExp | null, key: string, nre: RegExp | null = null): ReactNode {
  if (!re) return named(text, nre, key);
  const parts = text.split(re);
  return parts.length === 1 ? named(text, nre, key) : parts.map((x, i) => (i % 2 ? <CallChip key={`${key}-${i}`} t={x} /> : <Fragment key={`${key}-${i}`}>{named(x, nre, `${key}-${i}`)}</Fragment>));
}

/** 꾸밈 없는 글(형 글) 속 주소 → 누르면 새 창 링크(말풍선 누름 = 글 동작 줄은 안 열림) · 부름 = 칩(형 10-30 「호출이 따로 링크처럼 표시안되는거」) · 봇 이름 = 시안 */
function linked(text: string, re: RegExp | null = null, nre: RegExp | null = null): ReactNode {
  const parts = text.split(URL_RE);
  if (parts.length === 1) return called(text, re, "t", nre);
  return parts.map((x, i) => (i % 2 ? <a key={i} href={x} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}><SiteIcon href={x} />{x}</a> : <Fragment key={i}>{called(x, re, `t${i}`, nre)}</Fragment>));
}

/** 봇 글(마크다운) 속 부름 → 「#nm-call」 링크로 바꿔 Streamdown 이 칩으로 그림 · 봇 이름 → 「#nm-name」(시안 글자) · 코드(``` · `) 안은 그대로 */
const CALL_HREF = "#nm-call", NAME_HREF = "#nm-name", TOK_HREF = "#nm-tok";
const MD_SKIP = /(\[[^\]\n]*\]\([^)\n]*\)|https?:\/\/[^\s<>]+)/;   // 마크다운 링크·주소 안은 안 칠함
const tokMd = (x: string) => x.split(MD_SKIP).map((s, i) => (i % 2 ? s : s.replace(TOK_RE, (...a) => {
  const g = a[a.length - 1] as Record<string, string | undefined>;
  return `[${a[0]}](${TOK_HREF}-${g.fl || g.hs ? "fl" : g.gh ? "gh" : "tm"})`;
}))).join("");
function calledMd(text: string, re: RegExp | null, nre: RegExp | null = null): string {
  return text.split(/(```[\s\S]*?```|`[^`\n]*`)/).map((x, i) => {
    if (i % 2) return x;
    const t0 = tokMd(x);
    const y = re ? t0.replace(re, `[$1](${CALL_HREF})`) : t0;
    return nre ? y.replace(nre, (_all, pre: string, n: string) => `${pre}[${n}](${NAME_HREF}-${(toneOf(n) || "gk").replace(" ", "-")})`) : y;
  }).join("");
}
const MD_BOX = { lineNumbers: false, controls: { code: { copy: true, download: false } } } as const;   // 복사 창 = 줄 번호·받기 뺌(형 11-01 「복사가능한 창이 이리나오는데」 · 그록 앱 꼴 · 모양 = yeta-chat.css)
const mdWithCalls = {
  ...markdownComponents,
  a: (p: ComponentProps<"a">) => (p.href === CALL_HREF ? <CallChip t={p.children} /> : p.href?.startsWith(TOK_HREF) ? <span className={`ytok ${p.href.slice(TOK_HREF.length + 1)}`}>{p.children}</span> : p.href?.startsWith(NAME_HREF) ? <span className={`yname-c ${p.href.slice(NAME_HREF.length + 1).replace("-", " ")}`} style={inkOfName(String(p.children)) ? { color: inkOfName(String(p.children)) } : undefined}>{p.children}</span> : markdownComponents.a({ ...p, children: <><SiteIcon href={p.href} />{p.children}</> })),   // GitHub·Cloudflare·Suno = 글자 앞 작은 아이콘(./site-icon.tsx)
};

/** 앱 「컴퓨터 · 조치 필요」 카드(D10 · 거울 칸 box) — 단추 = 그 봇의 그록 방(https://grok.com/bot/<agentId>)
 *  짐작: 앱 단추는 가상 데스크톱 넘기기 화면을 연다(사무실에서 그 화면 주소는 실측 못 함 · 맞물림 21:3x) → 그 봇 방을 열어 거기서 누르게 */
function BoxCard({ m }: { m: Msg }) {
  const b = m.box;
  if (!b) return null;
  const extra = b.instruction && b.instruction.trim() !== String(m.text || "").trim() ? b.instruction : "";
  return (
    <>
      {extra ? <p className="mt-2 whitespace-pre-wrap text-sm">{extra}</p> : null}
      {m.app_agent ? (
        <a className="ybox-go" href={`https://grok.com/bot/${enc(m.app_agent)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>컴퓨터 열기</a>
      ) : null}
    </>
  );
}

function Body({ m, nre = null }: { m: Msg; nre?: RegExp | null }) {
  return <Said m={m} nre={nre} />;   // 「… 안 닿음」 줄 = 애들 글 · 형 글 둘 다 뺌(형 11-11 06:43 dm-sia 「그리고 시아 안닿음 대화중에 나오는 이런것도 없애버려」 · 14:35 형 글 밑도 「아 ㅋㅋ 그거는 안떠도 돼.」 · 앞 판 = 10-31 「태그안된 @ 가 된줄알고 써버리지 않게 하자는거임」으로 형 글 밑만 남겼음)
}

/** 글 속 같은 출처 그림 주소(https://edit.nomute.kr/…png · /cards/…jpg) → 말풍선 위 사진(형 11-01 08:48 「뉴스 요약한게 섬네일같은거 여기 올리면 내가 사진을 못보더라」 ·
 *  「그게 나한테 그리고 너희끼리 잘 보이게」) · 다른 출처 = 링크 그대로(로그인·추적 0) · 누르면 크게(zoomImage) */
const PATH_IMG_RE = /(?:^|[\s(「])(\/(?:cards|office|viewer|api\/office)\/[^\s<>"'「」()]+\.(?:png|jpe?g|gif|webp|avif))(?=$|[\s)」.,])/gi;
function textPhotos(text: string): string[] {
  const out: string[] = [];
  for (const u of text.match(URL_RE) || []) {
    try { const x = new URL(u); if ((x.origin === location.origin || x.hostname === "edit.nomute.kr") && IMG_RE.test(x.pathname)) out.push(x.pathname + x.search); } catch { /* 주소 아님 */ }
  }
  for (const mm of text.matchAll(PATH_IMG_RE)) out.push(mm[1]);
  return [...new Set(out)].slice(0, 4);
}
function TextPhotos({ urls }: { urls: string[] }) {
  return (
    <div className="yfiles flex flex-col items-start gap-2">
      {urls.map((u) => (
        <a key={u} href={u} target="_blank" rel="noopener" title="누르면 크게" className="block overflow-hidden rounded-2xl" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (justHeld()) return; zoomImage(u, u.split("/").pop() || ""); }}>
          <img src={u} alt="" loading="lazy" className="block max-h-60 max-w-[240px] object-cover" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
        </a>
      ))}
    </div>
  );
}
/** 그록봇이 붙인 그림 = 사무실엔 「[user-attachment] ""」 글자만 옴(파일 0 · 빠르 11-01 08:5x 잼) → 빈 글 대신 「그림이 안 넘어옴」을 보여 형이 묻게 ·
 *  11-05 06:56~06:57 아이데이션 방 깃·빚·감·결 사진·영상 = 앞말 없이 「""」만 옴(형 06:58 「안보여」) → 그 꼴도 같이 · 파일이 붙은 글은 안 건드림(files 0 일 때만) */
const LOST_ATTACH_RE = /^\s*(?:\[user-attachment\]\s*(?:""|“”)?|""|“”)\s*$/;
/** 지운 글(서버 unsent · 형 · 봄만 지움 · 형 11-11 08:57 「1하고 봄」 · ./capture 옆 메뉴 「삭제」) = 글 · 첨부 대신 한 줄 */
const goneOf = (m: Msg) => (m as Msg & { unsent?: { by?: string; at?: number } }).unsent;
const Gone = () => <span className="nm-gone">삭제된 글이야</span>;

function Said({ m, nre = null }: { m: Msg; nre?: RegExp | null }) {
  const text = String(m.text || "").replace(QUOTE, "");
  if (goneOf(m)) return <Gone />;
  if (!m.files?.length && LOST_ATTACH_RE.test(text)) return <span className="text-muted-foreground text-sm">📎 사진·영상을 붙였는데 사무실로 안 넘어왔어</span>;
  const pics = m.files?.length ? [] : textPhotos(text);
  if (m.files?.length) return <><Files m={m} />{m.caption ? <div className="ycap-ai"><Streamdown {...MD_BOX} components={mdWithCalls}>{calledMd(m.caption, callRe(m), nre)}</Streamdown></div> : null}</>;   // 글 + 첨부 한 글(형 10-31 「말한거랑 한꺼번에 가자」)
  if (EMO.test(text.trim())) return <span className="text-4xl leading-tight">{text.trim()}</span>;
  const said = <Streamdown {...MD_BOX} components={mdWithCalls}>{calledMd(text, callRe(m), nre)}</Streamdown>;
  return pics.length ? <><TextPhotos urls={pics} />{said}</> : said;
}

/** 글 한 줄 = YETA 꼴 — 형 글 = 오른쪽 [가져감][말풍선 / 시각] · 상대 글 = 왼쪽 [얼굴][이름 / 말풍선 / 시각] · 시각 = 말풍선 밖 아래(.ybw · 형 글 왼쪽 · 상대 글 오른쪽) ·
 *  cont = 바로 앞이 같은 사람(얼굴·이름 접음) · fresh = 열어 둔 뒤 새로 온 글(올라옴) · noTime = 1분 안에 이어 쓴 글(시각 안 찍음) */
/** 글 한 줄이 못 그려져도 방은 열림 · 그 글만 글자 그대로(형 11-01 「봇듦기리 회의한다고 자체로 만든 방에는 내가 못들어가더라고」 · 「썸딩 뤙 이라고 뜸」) */
class LineGuard extends Component<{ m: Msg; children: ReactNode }, { bad: boolean }> {
  state = { bad: false };
  static getDerivedStateFromError() { return { bad: true }; }
  componentDidCatch(e: unknown) { console.error("글을 못 그림", this.props.m.id, e); (window as unknown as { __nmReportError?: (kind: string, err: unknown) => void }).__nmReportError?.("boundary:msg", e); }   // 서버로도 알림(번개 ui/err-catch.ts · 없으면 조용히 넘어감 · 빠르 11-08)
  render() { return this.state.bad ? <div className="ymsg" data-id={this.props.m.id}><div className="yb ai">{whoName(this.props.m.who)}: {String(this.props.m.text || "")}</div></div> : this.props.children; }
}
const quietRead = (m: string) => { if (m) console.warn("읽음 저장:", m); };   // 읽음 저장 실패 = 화면 0 · 기록만(형 11-03 12:11)
/** 형 글 아래 담당 줄 — 고르는 중 「서버가 배분 중입니다…」(빛 글자) → 고른 뒤 「담당 · 얼굴 · 이름」(복수 = 얼굴 겹침 · 이름 ·) · 칸 없으면 0(1:1 방·옛 글) */
function RouteLine({ m, c }: { m: Msg; c: Ctx }) {
  const r = m.route;
  if (!r?.state) return null;
  if (r.state === "pending") return <p className="yroute" aria-live="polite"><LiveShine text="서버가 배분 중입니다…" /></p>;
  const to = (r.to || []).filter(Boolean);
  if (!to.length) return null;
  return (
    <p className="yroute set" title={r.why ? `고른 까닭 · ${r.why}` : undefined}>
      <span>담당</span><FaceStack ids={to.slice(0, 3).map((w) => idOf(w, c.list))} size={16} /><b>{to.map((w) => nmOf(c.list, w)).join(" · ")}</b>
    </p>
  );
}
function Line(p: ComponentProps<typeof LineBody>) { return <LineGuard m={p.m}><LineBody {...p} /></LineGuard>; }
function LineBody({ m, c, cont = false, fresh = false, noTime = false }: { m: Msg; c: Ctx; cont?: boolean; fresh?: boolean; noTime?: boolean }) {
  const p = c.list.find((x) => x.who === m.who), ring = ringOf(p);   // ring = 이름표 바탕(테 색 · yeta-chat.css .yname.tab)
  const selected = c.sel === m.id;
  const press = useLongPress(() => c.onMenu(m));
  const toggle = () => { press.fired(); };   // PC 도 그냥 누름 = 아무 일 없음(형 11-04 17:52 「pc에서 눌렀을때 이모지가 나올필요는 없구, 우클릭했을때만 (대화를) 옵션이 나오면 됨」) · 우클릭·길게 = 글 메뉴(./msg-menu.tsx) · 폰 = 길게(형 10-31)   // 폰 = 그냥 누르면 아무 일 없음 · 길게 눌러야 메뉴(형 10-31 「터치만 해도 … 메뉴 … 생겨 적어도 0.5초」)
  const time = noTime ? null : <time className="ytout" dateTime={new Date(m.ts).toISOString()}>{t12(m.ts)}</time>;
  if (mineOf(m)) {
    const app = hyungApp(m) && m.kind !== "human";   // 그록봇 앱에서 친 형 글 = 검정 말풍선 흰 글씨(형 10-30)
    return (
      <div className={`flex flex-col items-end ${m._thr ? "pr-4" : ""}`} data-id={m.id}>
        <StatePill m={m} />
        <div className={`ymrow me${cont ? " cont" : ""}${fresh ? " in" : ""}`}>
          <div className="ybw"><ReplyStrip text={String(m.text || "")} list={c.list} onJump={c.onJump} /><div className="yb-line">{!goneOf(m) || c.unseen(m) ? <span className={`yb-st media${m.files?.length || stickerOf(m.text) ? "" : " txt"}`}>{!goneOf(m) ? <svg className="yb-ck" viewBox="0 0 16 16" aria-label="보냄"><path d="M3.2 8.6l3 3 6.6-7" /></svg> : null}{c.unseen(m) ? <b className="yb-un" title="아직 못 본 봇 수">{c.unseen(m)}</b> : null}</span> : null}<div {...press.bind} className={`yb me${app ? " app" : ""}${onlyPhotos(m) || stickerOf(m.text) ? " ph" : ""}`} onClick={toggle} title={app ? "그록봇 앱에서 쓴 글" : undefined}>{goneOf(m) ? <Gone /> : stickerOf(m.text) && !m.files?.length ? <Sticker text={m.text} mark={stickerMark(m.id)} /> : m.files?.length ? <>{onlyPhotos(m) && m.caption ? <div className="yb-phck"><Files m={m} /><svg className="yb-ck yb-ck-ph" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 8.6l3 3 6.6-7" /></svg></div> : <Files m={m} />}{m.caption ? <p className="ycap">{linked(m.caption, callRe(m), c.nre)}</p> : null}</> : <Folded text={String(m.text || "").replace(QUOTE, "")} who="나" when={zoomWhen(m.ts)}>{linked(String(m.text || "").replace(QUOTE, ""), callRe(m), c.nre)}</Folded>}<Reactions m={m} c={c} mine /></div></div><LinkCard m={m} />{time}</div>
        </div>
        <RouteLine m={m} c={c} />
        {selected ? <Actions m={m} c={c} mine /> : null}
      </div>
    );
  }
  return (
    <div className={`ymsg${cont ? " cont" : ""}${fresh ? " in" : ""}${m._thr ? " pl-6" : ""}`} data-id={m.id}>
      <button type="button" className="yava" aria-label={`${p?.name || m.who} 프로필`} onClick={(e) => { e.stopPropagation(); c.onProfile(m.who); }}><Ava who={m.who} list={c.list} /></button>
      <div className="ycol">
        <NameLabel tint={ring} text={p?.name || whoName(m.who)} mark={p?.mark} />
        <StatePill m={m} />
        {thumbOf(m) ? <ThumbCard card={thumbOf(m)!} /> : null}
        <div className="ybrow">
          <div className="ybw">
            {pickM(m) ? <div className="ypick-top"><LinkCard m={m} /></div> : null}
            <ReplyStrip text={String(m.text || "")} list={c.list} onJump={c.onJump} />
            {bundleOf(m) ? <BundleCard b={bundleOf(m)!} id={m.id} srcs={c.srcs?.get(bundleOf(m)!.stem)} /> : pcOf(m) ? <PcCard id={m.id} task={pcOf(m)!.task} url={pcOf(m)!.url} who={p?.name || whoName(m.who)} /> : <div {...press.bind} className={`yb ai${onlyPhotos(m) || stickerOf(m.text) ? " ph" : ""}`} data-ink={p?.bubble && !onlyPhotos(m) ? (inkOn(p.bubble) === "#161716" ? "dark" : "light") : undefined} onClick={toggle} style={p?.bubble && !onlyPhotos(m) ? { background: p.bubble, borderColor: p.bubble, color: inkOn(p.bubble) } : undefined}>
              {m.box ? <div className="ybox-h"><span aria-hidden>🖥</span>컴퓨터 · 조치 필요</div> : null}
              {stickerOf(m.text) && !m.files?.length ? <Sticker text={m.text} /> : m.files?.length ? <div className="ymd"><Body m={m} nre={c.nre} /></div> : <Folded md text={String(m.text || "").replace(QUOTE, "")} who={p?.name || whoName(m.who)} when={zoomWhen(m.ts)}><div className="ymd"><Body m={m} nre={c.nre} /></div></Folded>}
              <BoxCard m={m} />
              <DecideInline id={m.id} />   {/* 질문 글 바로 아래 선택지(형 11-13 09:08 · ./decide-pop.tsx) */}
              <Reactions m={m} c={c} mine={false} />
              <QuickReact id={m.id} quick={c.quick} faceId={idOf(m.who, c.list)} mine={Object.entries(c.rx[m.id] || {}).filter(([, w]) => (w || []).includes("형")).map(([k]) => k)} onReact={c.onReact} />   {/* 바로 다는 반응(오른쪽 위 모서리 · 형 11-14 05:56) */}
            </div>}
            {pickM(m) || bundleOf(m) ? null : <LinkCard m={m} />}   {/* 묶음 카드는 제 그림 · 제목이 있어 링크 카드 겹침 뺌(시아 11-12 20:2x 진짜 묶음 실물) */}
            {!bundleOf(m) && askPickOf(c.room, m) ? <AskPick id={m.id} {...askPickOf(c.room, m)!} /> : null}   {/* 촉 글 → 형이 「요약」(./ask-pick.tsx · 형 11-13 02:45) */}
            {time}
          </div>
        </div>
        {selected ? <Actions m={m} c={c} mine={false} /> : null}
      </div>
    </div>
  );
}

/** 봇 글이 「컴퓨터 · 조치 필요」 꼴이면 카드(그록 꼴 · 테일넷 안 화면 주소만) · 그록 거울 box · 첨부 글은 그대로 */
const bundleOf = (m: Msg) => (m.files?.length ? null : parseBundle(m.text));   // 첫 줄 `[묶음 <stem>]` = 러너가 dm-chok 에 보내는 요약 묶음(깃) · 표지 줄은 카드가 숨김
const pcOf = (m: Msg) => (m.box || m.files?.length ? null : pcOfText(m.text));

/** 말 옆 얼굴 = 등불 테 + 얼굴(형 10-31 「대화창 내부에도 있어야해」) · 40칸 = 얼굴 32 그대로(테는 .yava 밖으로) · 일하는 중 = 테 위 빛 호 */
function Ava({ who, list, work }: { who: string; list: OfficePerson[]; work?: boolean }) {
  return <MicOrb size={40} state={work ? "thinking" : "idle"} id={idOf(who, list)} tint={ringOf(list.find((x) => x.who === who))} />;
}

function Band({ msgs, c }: { msgs: Msg[]; c: Ctx }) {
  const [open0, setOpen] = useState(false);
  const open = open0 || (!!c.want && msgs.some((x) => x.id === c.want));   // 그 글로 가는 중 = 펼침
  const ws = [...new Set(msgs.map((x) => x.who))];
  return (
    <div className="flex flex-col items-center gap-3">
      {/* 묶음 칩 겉 = ./yeta-chat.css .ygrp(YETA 유리 알약 + 차콜 · 형 10-31 09:16) · 테일윈드 겉 뺌 */}
      <button type="button" className="ygrp" aria-expanded={open}
        aria-label={`${ws.map((w) => nmOf(c.list, w)).join(", ")} 이 포함된 메시지 ${msgs.length}개`} onClick={() => setOpen((v) => !v)}>
        <FaceStack ids={ws.slice(0, 3).map((w) => idOf(w, c.list))} size={18} />
        {ws.length > 3 ? <b>외 {ws.length - 3}</b> : null}
        {ws.length > 3 ? " · " : ""}메시지 {msgs.length}개
      </button>
      {open ? <div className="flex w-full flex-col gap-[10px] border-l-2 border-border pl-3 opacity-90">{msgs.map((m, i) => {
        const cont = i > 0 && msgs[i - 1].who === m.who, next = msgs[i + 1];
        const noTime = !!next && dayKey(next.ts) === dayKey(m.ts) && ((next.who === m.who && next.ts - m.ts < TIME_GAP) || t12(next.ts) === t12(m.ts));   // 시각 = 1분 안 이어 쓴 묶음의 **마지막** 글에 · 다른 사람도 같은 시각이면 맨 아래만(형 10-31 「대화자의 시간대가 같으면 맨 아랫사람만 시간이 나오게해줘」) · 같은 날만(뎅 11:4x · 자정 넘김 묶음에서 23:59 글 시각이 빠지던 것)(형 10-31 11:27 「최신 시각의 가장 마지막 대화에 이어져야된다는 거임 화자가 동일하자는 전제에는」 · 앞 판은 첫 글에 붙었음)
        return <Line key={m.id} m={m} c={c} cont={cont} noTime={noTime} />;
      })}</div> : null}
    </div>
  );
}

/** 「결 작업 중 · 고민하는 중…」 — 1:1 = 그 봇이 깨 있고 마지막 글이 그 봇 글이 아님 · 회의실 = 그 봇을 부른 가장 새 글이 45분 안 · 깬 = 서버 bots(읽기만 깸 = 뺌) */
/** 「작업 중」 점 셋(형 10-31 「너가 응답하면서 ... 이런게 움직이기라도 해야되는데」) — 형 글 뒤 그 이 답 전에 ① 서버가 깸이라 하거나(존재 = 턴 신호 · why turn · 서버 #1832) ② 쓴 지 2분 안(신호가 오기 전 공백) · 2분 뒤에도 안 깨면 멈춤 = 안 깬 이를 일하는 척 안 함 */
function typingOf(list: Msg[], r: OfficeRoom | undefined, bots: Bot[], people: OfficePerson[]): string[] {
  // 우리(클로드 · kind being·winter) = 다른 방 일로 늘 「깸」이라 깸 표를 안 봄 → 부른 뒤 2분(PICKUP_WAIT)만 점 셋 · 봇 = 깸이 곧 그 부름이라 그대로(형 11-06 11:35 「그리고이거 생각중 아직해결안됨. 색깔별로 해결하려고했다면 그거아님」 · 봄 짚음 = 45분 내내 떴음)
  //   → 11-06 12:48 형 「아직도 생각중 이라고 뜬다 글자가 꺼져야된다구!」 · 「쉼이면!」 = 우리도 깸 표(턴 도는 중)를 봄 · 쉼(asleep)이면 바로 끔 · 부른 뒤 아직 안 쓴 동안만(45분 안)
  const ours = (n: string) => { const k = people.find((p) => p.who === n)?.kind as string | undefined; return k === "being" || k === "winter"; };
  const awake = (n: string, since = 0) => bots.some((b) => b.who === n && b.state === "awake" && b.why === "turn" && (b.last_turn_ts ?? 0) >= since - 5_000);   // why turn = 훅이 찍은 「working」(턴 끝 = idle · 봄 12:51)   // since = 부른 글 때 · 그 뒤에 시작한 턴만(다른 방 일 턴 = 아님 · 봄 12:50)
  const doing = (n: string) => awake(n);
  const woke = (m: Msg, n: string) => (m.urgent || []).includes(n);   // 2분 = 바로 깨운 부름만 · 「@」 예약 = 다음 깸이라 점 안 돎(형 10-31 「@는 나중에 봐놔라.」)
  if (!r) return [];
  const now = Date.now();
  if (r.with) {
    const n = r.with, m = list.at(-1);
    if (!m || m.who === n || m.kind !== "human") return [];
    if (ours(n)) return awake(n, m.ts) && now - m.ts < CALL_FRESH ? [n] : [];   // 우리 = 쉼이면 끔(형 12:48 「쉼이면!」)
    return doing(n) || (woke(m, n) && now - m.ts < PICKUP_WAIT) ? [n] : [];
  }
  const inRoom = r.members?.length ? new Set(r.members) : null;   // 멤버를 정한 방 = 지금 멤버만(형 11-09 09:26 「모루 방 멤버에서 제외했는데, 아직 생각중으로 뜨네」 · 빠지기 전 글의 urgent 에 이름이 남아 45분 동안 그렸음)
  return people.map((p) => p.who).filter((n) => n !== "형" && (!inRoom || inRoom.has(n))).filter((n) => {
    for (let i = list.length - 1; i >= 0 && list[i].who !== n; i--) if ((list[i].mention || []).includes(n) || (list[i].urgent || []).includes(n)) return ours(n) ? awake(n, list[i].ts) && now - list[i].ts < CALL_FRESH : doing(n) ? now - list[i].ts < CALL_FRESH : woke(list[i], n) && now - list[i].ts < PICKUP_WAIT;   // urgent = 「!모두」·임시방 형 글(이름 없이 전원)도 작업 중으로
    return false;
  });
}


export function OfficeChat(p: { room: string; lead?: ReactNode; active?: boolean; hide?: (m: OfficeMsg) => boolean }) {   // hide = 이 칸에선 안 보일 글(화상회의 목적 말풍선 · 뜸 11-13)
  if (isTeams(p.room)) return <TeamsChat chat={p.room.slice(TEAMS_PREFIX.length)} />;   // 팀즈 대화(./teams.tsx · 형 11-06 「전송이랑 다 가능해야해 채팅」)
  if (p.room === SUMMARY_ROOM) return <SummaryDesk lead={p.lead} active={p.active ?? true} />;   // 요약실 = 요약 카드 목록(./summary-desk.tsx · 형 11-04 09:28)
  return p.room === REPAIR_ROOM ? <RepairDesk lead={p.lead} active={p.active ?? true} /> : <OfficeChatRoom {...p} />;
}

function OfficeChatRoom({ room, lead, active = true, hide }: { room: string; lead?: ReactNode; active?: boolean; hide?: (m: OfficeMsg) => boolean }) {   // active = 이 판이 보임(껍데기에서 숨은 판이면 본 데까지 안 올림 = 안 읽은 수 그대로)
  const qc = useQueryClient();
  const nav = useNavigate();
  const { r, list, msgs, reads, reacts, bots, older, draft } = useOfficeRoom(room);
  const [err, setErr] = useState(""), [dropping, setDropping] = useState(false);   // dropping = 대화창에 파일 끌고 있음(형 11-05 10:45)
  const [sel, setSel] = useState(""), [menuOf, setMenuOf] = useState<Msg | null>(null);   // 글 길게 누르기(./msg-menu.tsx)
  useMe();   // 메뉴 「고정」이 보는 나 = 방을 열 때 미리 받아 둠(첫 길게 누르기에 메뉴가 두 번 그려지던 것 · 형 11-03 10:49)
  const [prof, setProf] = useState("");   // 프로필 카드를 연 사람(who · 빈 값 = 닫힘)
  const [reply, setReply] = useState<{ id: string; who: string; line: string } | null>(null);
  const [peek, setPeek] = useState<Msg | null>(null);   // 형 결정 알약 누른 글 = 창(./call-peek.tsx)
  const [rxOver, setRxOver] = useState<Record<string, Record<string, string[]>> | null>(null);
  // 그 글로(답장 인용 · 고정 띠 이력 = window 「nm-jump」 {room, id}) — want.id = 간 글(그 묶음은 펼친 채 둠) · n = 부를 때마다 하나씩(같은 글로 또 가기) · done = 다 간 n
  const [want, setWantS] = useState<{ id: string; n: number }>({ id: "", n: 0 }), wantTry = useRef(0), wantDone = useRef(0);
  const setWant = (id: string) => { wantTry.current = 0; setWantS((w) => ({ id, n: w.n + 1 })); };
  const all = msgs.data?.messages || [];
  const landed = (a: SendAttempt) => {   // 보낸 사진·글이 방에 진짜로 떴나(내 글 · 시작 10초 앞부터 · 올린 이름 다 맞음 또는 같은 글) = 보내는 중 말풍선 숨김(형 11-02 09:22 「2개로 겹쳣다가 정상되는 이슈」)
    const since = (a.at ?? Number.MAX_SAFE_INTEGER) - 10_000, names = a.originals.map((o) => o.file?.name || "").filter(Boolean), text = (a.text || "").trim();
    return all.some((m) => mineOf(m) && m.ts >= since && (
      (names.length > 0 && !!m.files?.length && names.every((n) => (m as Msg).file_meta?.some((f) => f.name === n) || m.files!.some((p) => String(p).endsWith(n))))
      || (!!text && String(m.caption || "").trim() === text)));
  };
  const landedText = (w: WaitingText) => {   // 줄 선 글이 방에 진짜로 떴나(내 글 · 줄에 든 10초 앞부터 · 같은 글) = 보냄 대기 말풍선 숨김(형 11-02 11:58)
    const since = w.at - 10_000, text = w.text.trim();
    return !!text && all.some((m) => mineOf(m) && m.ts >= since && String(m.text || "").trim() === text);
  };
  const meet = room === MEET;
  // 형이 낀 단톡(임시방 · 지정방 · 회의실) = 다 보이게(형 10-31 「단톡은 전체메세지로 보여야되는데 왜 봄메세지는 저렇게보여」) · 접는 보기(hyungView)는 1:1 방만
  const unfold = useUnfold(room);   // 방 메뉴 「긴 글 다 펼쳐 보기」(./unfold.ts)
  const pairRoom = room.startsWith("pair-");   // 둘의 방 = 형은 읽기만(쓰기 칸 대신 한 줄 · 머리 = 두 얼굴 · 접기 0 = 둘이 한 말 다 보임)
  const flat = meet || pairRoom || room.startsWith("tmp-") || (!!r && !r.with);   // 임시방(tmp- · 화상회의 포함) = 늘 단톡 · 목록에 아직 없을 때(r 없음)도 접지 않음(화상회의 첫 시험 tmp-mwe78kqp 「외 1 · 메시지 6개」로 접힘)
  // 「[자료 <stem>]」 이어 글 = 같은 방 묶음 카드 안으로(카드 있으면 글 숨김 · 없으면 알약 그대로 · 깃 11-13 12:49)
  const srcs = useMemo(() => { const by = new Map<string, Src[]>(); for (const m of all) { const x = srcOf(m); if (x) by.set(x.stem, [...(by.get(x.stem) || []), x]); } return by; }, [all]);
  const bundled = useMemo(() => new Set(all.map((m) => bundleOf(m)?.stem).filter(Boolean) as string[]), [all]);
  const shownAll = useMemo(() => all.filter((m) => { const x = srcOf(m); return (!x || !bundled.has(x.stem)) && !(hide && hide(m as OfficeMsg)); }).map(relayAs), [all, bundled, hide]);   // 러너가 그록 친구 대신 쓴 글 = 그 친구 말풍선(./pick-msg.ts relayAs · 형 11-13 08:05) · hide = 화상회의 목적 말풍선(뜸 11-13 15:15)
  const items = useMemo(() => (flat ? flatView(shownAll) : hyungView(shownAll, r)), [shownAll, r, flat]);
  // 「채팅방으로 초대하기」 = 그 뒤로 그 애가 다시 안 온 「나갔습니다」 줄에만(다시 옴 = 다시 부름·초대 줄 · 그 애가 쓴 글)
  const inviteOn = useMemo(() => { const on = new Set<string>(), back = new Set<string>(); for (let i = all.length - 1; i >= 0; i--) { const m = all[i]; if (evM(m)) { const k = m.event?.kind; if (k === "left") { for (const w of evWho(m)) if (!back.has(w)) on.add(m.id); } else if (k === "back" || k === "invite") for (const w of evWho(m)) back.add(w); } else if (m.kind !== "system" && m.kind !== "sent" && m.kind !== "human") back.add(m.who); } return on; }, [all]);   // 그 애 글 = 다시 옴(우리 일곱 = kind "being" · 그록봇 = bot)
  const [cmdNote, setCmdNote] = useState("");
  useEffect(() => { if (!cmdNote) return undefined; const t = setTimeout(() => setCmdNote(""), 5_000); return () => clearTimeout(t); }, [cmdNote]);   // 「/초대」·「/방파기」 안 되는 방 안내(라임 · 누르면 닫힘)
  const [inviting, setInviting] = useState(""), [slash, setSlash] = useState<string | null>(null), [inviteQ, setInviteQ] = useState<string[] | null>(null);   // inviteQ = 「/초대 …」 뒤 이미 친 이름들   // slash = 입력칸이 「/…」 한 낱말일 때 그 뒤 글자
  const invite = async (m: Msg) => {   // 형 11-06 「내가 초대하기누르면다시들어올수잇어야함」 → POST rooms/<방>/invite(봄 서버) · 답 = 「다시 불렀습니다」 줄
    const who = evWho(m)[0]; if (!who || inviting) return;
    setInviting(m.id); setErr("");
    try {
      const j = await office<{ message?: Msg }>(`rooms/${enc(room)}/invite`, { method: "POST", body: JSON.stringify({ who }) });
      if (j.message) qc.setQueryData<Page>(officeKeys.msgs(room), (old) => merge(old, [j.message as Msg]));
      void qc.invalidateQueries({ queryKey: officeKeys.msgs(room) }); void qc.invalidateQueries({ queryKey: officeKeys.rooms });
    } catch (e) { setErr(`초대 못 했어 — ${e instanceof Error ? e.message : String(e)}`); }
    finally { setInviting(""); }
  };
  const [tick, setTick] = useState(0);   // 점 셋 멈춤(2분 · 45분)은 시각으로 정해져서 새 글이 없어도 다시 셈
  const typing = useMemo(() => typingOf(all, r, bots, list).filter((n) => n !== draft?.who), [all, r, bots, list, draft?.who, tick]);   // eslint-disable-line react-hooks/exhaustive-deps   // 초안이 자라는 봇 = 점 셋 대신 초안 말풍선
  const typRing = typing.length ? ringOf(list.find((x) => x.who === typing[0])) : undefined;   // 생각 중 줄 이름표도 얼굴(typing[0]) 테에서 이어진 탭(형 11-03 16:06 「틈이 같은 경우에 이거 안이어진다 프로필 라벨」)
  useEffect(() => { if (!typing.length) return; const t = setInterval(() => setTick((x) => x + 1), 20e3); return () => clearInterval(t); }, [typing.length]);
  // 머리 등불 구슬(보조 02 PR 1489) = 원본 useChatOrb 재료 · 듣는 중 = 형이 글칸에 씀 · 일하는 중 = 윈터에게 보낸 형 글 뒤 윈터 답 전(30분 안) · 서버 「깸」 칸은 뜻이 달라 안 씀(office-orb.md)
  const winterWorking = useMemo(() => {
    const toW = (m: Msg) => m.kind === "human" && (r?.with === WINTER_WHO || (m.mention || []).includes(WINTER_WHO) || Object.values(m.alias || {}).some((v) => Array.isArray(v) && v.includes(WINTER_WHO)));
    for (let i = all.length - 1; i >= 0; i--) {
      if (all[i].who === WINTER_WHO) return false;
      if (toW(all[i])) return Date.now() - all[i].ts < 30 * 60e3;
    }
    return false;
  }, [all, r]);
  const presence = useReportChatPresence(true, { working: winterWorking, failed: false });
  useCloseCallMenu();
  const bots4 = useMemo(() => {   // 입력칸 「@」·「!」 목록 = 이 방에서 부를 수 있는 이(정한 사람 없는 방 = 봇 + 윈터·봄 같은 존재 · 형 10-30 「호출시 … 리스트 안뜨는 것」)
    const ids = r ? roomAgentIds(r, list) : [];
    if (r && !r.with && (meet || !r.members?.length)) for (const p of list) { const id = idOf(p.who, list); if (p.kind !== "human" && p.who !== "형" && !ids.includes(id)) ids.push(id); }
    const people = ids.map((id) => { const p = list.find((x) => idOf(x.who, list) === id); return { id, name: p?.name || p?.who || id, title: p?.role }; });
    // 회의실 = 그때 멤버 먼저 + 나머지 전부(형 11-01 22:21 「회의실에는 아무나 호출 가능하게 해주라 봇이든 누구든 부르면 올 수 있게」 · 22:31 사진 = 결이 목록에 없음 · 서버는 이미 누구든 부름)
    return r?.with ? people : r?.members?.length ? [GROUP_PICK[0], ...people] : [...GROUP_PICK, ...people];   // 멤버를 정한 단톡 = 모두 + 멤버만(형 10-31 「그록 클로드 지피티 이거는 없어도 됨」)
  }, [r, list, meet]);
  const baseTs = useRef<number | null>(null);   // 방을 연 때 마지막 글 — 그 뒤에 온 글만 올라오는 움직임(YETA .in · 옛 글 다시 그림 = 0)
  if (baseTs.current === null && msgs.data) baseTs.current = all.at(-1)?.ts ?? 0;
  const lastId = all.at(-1)?.id, firstId = all[0]?.id, firstRef = useRef(firstId), lastIdRef = useRef(lastId);
  firstRef.current = firstId; lastIdRef.current = lastId;
  // 스크롤 = 대화 칸 하나만 움직임(바깥 판 0) · stuck = 맨 아래에 붙어 있음(처음 열 때 · 새 글·사진·글꼴이 늦게 와서 길어져도 그대로 맨 아래)
  const boxRef = useRef<HTMLDivElement | null>(null), stuck = useRef(true), near = useRef(true), keepTop = useRef<{ h: number; top: number; first?: string } | null>(null);   // near = 맨 아래 가까이(nearPx 안 · 스크롤이 움직일 때 셈)
  // 연 뒤 OPEN_PIN_MS 동안 손이 안 닿으면 = 맨 아래에 붙은 채(형 11-04 08:10 「채팅 들가면 가장 최근 채팅으로 들가져야되는데 올드채팅으로 들어가져」 · 기기에 둔 옛 글 → 새 글 통째 바꿔 끼움 · 앞 글 자동 받기가 그 사이 스크롤을 옮겨 붙음이 풀리던 것)
  const mountAt = useRef(Date.now()), pinFrom = useRef(0), touched = useRef(false);   // pinFrom = 글이 처음 오거나 바뀐 때(붙잡는 동안) · 연 뒤 OPEN_PIN_MAX 까지만
  const anchorT = useRef(0);   // 알약 펼치는 동안 스크롤 붙들기 끔(c.loose)
  const sentPin = useRef(0);   // 보낸 직후 이때까지 = 맨 아래 붙잡음(사진 고른 칸이 걷히며 입력칸이 100px 줄 때 대화가 그 키만큼 입력칸 뒤로 묻혔음 · 형 11-04 08:05 「대화가 묻혔다가 위로 올라가는데 … 채팅창에 걸쳣다 올라가는게 어색해」)
  const pinning = () => Date.now() < sentPin.current || !touched.current && pinFrom.current > 0 && Date.now() - pinFrom.current < OPEN_PIN_MS && Date.now() - mountAt.current < OPEN_PIN_MAX;
  if (msgs.data && !pinFrom.current) pinFrom.current = Date.now();
  // 내가 보낸 글·사진이 대화 줄 맨 아래 말풍선으로 새로 생기면 맨 아래로 붙임(형 11-02 12:02 「그냥 이 챗을 보내는 순간 채팅창으로 나가버리고」 · 보낸 이는 늘 제 글을 봐야 함)
  useSyncExternalStore(attachmentSender.subscribe, attachmentSender.getSnapshot, attachmentSender.getSnapshot);
  const pendN = attachmentSender.waitingFor(room).length + attachmentSender.forRoom(room).filter((a) => a.phase === "uploading").length, pendWas = useRef(pendN);
  useEffect(() => {
    const more = pendN > pendWas.current;
    pendWas.current = pendN;
    if (!more) return;
    sentPin.current = Date.now() + 1500; stuck.current = true; near.current = true; hold.current = 0;
    requestAnimationFrame(() => { const box = boxRef.current; if (box) { box.scrollTop = box.scrollHeight; stuck.current = true; } });
  }, [pendN]);
  const loadingOld = useRef(false), moreRef = useRef(false), olderRef = useRef(older), autoN = useRef(0), poke = useRef<() => void>(() => {});
  const hold = useRef(0);   // 이때까지 = 맨 아래로 안 당김(손으로 미는 중 · 「↑ 글 처음」 이동 중 · 형 16:47 「벅벅벅 거리면서 안올라가져」)   // autoN = 손 안 대고 저절로 받은 앞 글 횟수(화면 채우기 · AUTO_MAX 까지 · 손으로 밀면 다시 0)
  moreRef.current = !!msgs.data?.more; olderRef.current = older;
  const [jump, setJump] = useState("");   // 화면 위로 시작이 넘어간 글(「↑ 글 처음」)
  // 「↓ 최근 글」 = 맨 아래에서 한 화면쯤 떨어져 있으면 오른쪽 아래 단추 · 떨어진 뒤 새로 온 글 수(형 11-01 09:09 「그리구 채팅을 띄워놓고 자리를 비우면 채팅이 밀리는데 그럴경우 최근 채팅으로 가는 아래 버튼 같은게 있어야함」 · 「안그러면 죽죽죽 스크롤 내리거나 채팅을 쳐서 내려야되거듬」)
  const [far, setFar] = useState(false), seenEnd = useRef(0);
  const [atTop, setAtTop] = useState(true);   // 스크롤 칸이 맨 위(24px 안) = 글 칸 위 흐림 끔(./chat-head.css .nm-top0 · 모루 #2923 「맨 위에 도달해도 「옛 글 더 보기」 단추·포커스 표시가 흐린 구간에 남음」) · 글이 칸보다 짧아 스크롤 없는 방도 맨 위 = 흐릴 게 없음
  if (stuck.current || !far) seenEnd.current = all.length;
  const newBelow = far ? Math.max(0, all.length - seenEnd.current) : 0;
  const toEnd = () => { const box = boxRef.current; if (!box) return; hold.current = 0; stuck.current = true; near.current = true; box.scrollTo({ top: box.scrollHeight, behavior: "smooth" }); setFar(false); };
  useLayoutEffect(() => {   // 위로 받은 앞 글 = 보던 자리 그대로(늘어난 높이만큼 내림) · 목록이 통째로 바뀜(잡을 때 첫 글이 없음) · 연 직후 = 맞추지 않고 맨 아래
    const box = boxRef.current, k = keepTop.current;
    if (!box || !k) return;
    keepTop.current = null;
    if (pinning() || (k.first && !all.some((m) => m.id === k.first))) { box.scrollTop = box.scrollHeight; stuck.current = true; near.current = true; return; }
    box.scrollTop = k.top + (box.scrollHeight - k.h);
  }, [firstId]);   // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {   // 맨 아래 = 처음 열 때 · 새 글(맨 아래에 붙어 있었을 때 · 형이 쓴 글)
    const box = boxRef.current;
    if (pinning()) pinFrom.current = Date.now();   // 붙잡는 동안 글이 바뀜(기기 글 → 서버 새 글) = 그때부터 다시 4초
    if (box && lastId && (stuck.current || pinning() || (near.current && Date.now() > hold.current) || all.at(-1)?.kind === "human")) { box.scrollTop = box.scrollHeight; stuck.current = true; near.current = true; }   // 가까이 있었으면 새 글도 따라감(형 11-03 10:05)
    const ts = [150, 500, 1200, 2500].map((t) => window.setTimeout(() => poke.current(), t));   // 마크다운·사진·글꼴이 늦게 그려져 길어져도 다시 맞춤(크기 알림이 안 오는 숨은 화면 포함)
    return () => ts.forEach(clearTimeout);
  }, [lastId, msgs.isPending]);   // eslint-disable-line react-hooks/exhaustive-deps
  // 다른 화면 갔다 돌아옴(껍데기가 판을 지우지 않고 숨김 · 폰 앱이 뒤로 갔다 옴) = 다시 맨 아래로 붙잡음(형 11-04 08:19 「폰. 근데 음 맨 아래로 촥 안붙어 안드로이드 웹엡」 · 「다른 화면 갓다가 오면.」)
  //   단 떠날 때 맨 아래 가까이였거나 · 비운 사이 새 글이 왔거나 · AWAY_PIN_MS 넘게 비웠을 때만(프로필 창을 잠깐 열었다 닫음 = 보던 자리 그대로)
  const away = useRef<{ at: number; near: boolean; last?: string } | null>(null);
  useEffect(() => {
    const leave = () => { if (!away.current) away.current = { at: Date.now(), near: near.current || stuck.current, last: lastIdRef.current }; };
    const back = () => {
      const a = away.current;
      away.current = null;
      const box = boxRef.current;
      if (!a || !box || !(a.near || a.last !== lastIdRef.current || Date.now() - a.at > AWAY_PIN_MS)) return;
      touched.current = false; mountAt.current = Date.now(); pinFrom.current = Date.now(); hold.current = 0; stuck.current = true; near.current = true;
      box.scrollTop = box.scrollHeight;
      requestAnimationFrame(() => { const b = boxRef.current; if (b) b.scrollTop = b.scrollHeight; });   // 숨었다 보이는 첫 그림 뒤에 한 번 더(높이가 그때 잡힘)
      for (const t of [150, 500, 1200]) window.setTimeout(() => poke.current(), t);
    };
    if (!active) leave(); else back();
    const vis = () => { if (document.hidden) leave(); else if (active) back(); };
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, [active]);   // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {   // 초안이 자람 = 맨 아래에 붙어 있으면 따라 내려감
    const box = boxRef.current;
    if (box && draft && stuck.current) box.scrollTop = box.scrollHeight;
  }, [draft?.text]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let tm = 0;
    const top0 = () => setAtTop(box.scrollTop < 24);
    top0();
    const look = () => {
      tm = 0;
      top0();
      const top = box.getBoundingClientRect().top + HEAD;   // 보이는 위 = 떠 있는 머리 아래
      let hit = "";
      for (const el of box.querySelectorAll<HTMLElement>("[data-id]")) {
        const b = el.getBoundingClientRect();
        if (b.bottom <= top + 48) continue;   // 이미 위로 다 지나간 글
        if (b.top < top - 24) hit = el.dataset.id || "";   // 위에 걸친 글 = 시작이 안 보임
        break;
      }
      setJump(hit);
      setFar(box.scrollHeight - box.scrollTop - box.clientHeight > nearPx(box));   // 따라가지 않는 자리 = 단추(옛 문턱 320px · 화면 0.6 = 그 사이에선 따라가지도 단추도 없었음)
      // 앞 글 하루치 = 위 끝 가까이 왔을 때 · 화면이 아직 안 찼을 때(봇끼리 글이 한 줄로 접혀 짧음) — 저절로는 AUTO_MAX 번까지 · 받은 게 0 이면 그만
      const short = box.scrollHeight - box.clientHeight < 240 || box.scrollTop < 240;
      if (short && moreRef.current && !loadingOld.current && autoN.current < AUTO_MAX) {
        loadingOld.current = true; autoN.current++;
        keepTop.current = { h: box.scrollHeight, top: box.scrollTop, first: firstRef.current };
        void olderRef.current().then((k) => { if (!k) autoN.current = AUTO_MAX; }).catch(() => { keepTop.current = null; autoN.current = AUTO_MAX; })
          .finally(() => { loadingOld.current = false; on(); });
      }
    };
    const on = () => { if (!tm) tm = window.setTimeout(look, 50); };   // 묶어 보기(그림 틀 알림 rAF 는 숨은 화면에서 안 와서 시계로)
    // 맨 아래 다시 붙이기 = 내용이 길어질 때만(사진·글꼴·마크다운이 늦게 그려짐 · 크기 알림·시계) · 손이 닿는 동안·이동 중엔 안 당김 · 스크롤 셈 자리에서는 안 함(16:46 고장 = 위로 미는 첫 80px 을 「붙음」으로 보고 맨 아래로 되당김)
    const grow = () => {
      if (pinning()) { pinFrom.current = Date.now(); if (box.scrollHeight - box.scrollTop - box.clientHeight > 1) box.scrollTop = box.scrollHeight; on(); return; }   // 붙잡는 동안 키가 커짐(마지막 긴 글의 「전체 보기」 단추·사진이 늦게 붙음) = 맨 아래 + 다시 4초(형 11-04 08:20 「전체 보기 선을 기준으로 해야 마지막 채팅을 기준으로 내려온다고 느껴지는데」)
      if (stuck.current && Date.now() > hold.current && box.scrollHeight - box.scrollTop - box.clientHeight > 1) box.scrollTop = box.scrollHeight;
      on();
    };
    poke.current = grow;
    // 맨 아래에 붙음 = 스크롤이 움직일 때만 다시 셈(길이가 늘어나는 동안 셈하면 「붙음」이 먼저 꺼져 맨 아래를 놓침)
    const onScroll = () => {   // 붙음 = 정말 맨 아래(4px 안) · 가까이 = nearPx 안 · 연 직후 손 안 댐 = 붙음 그대로(내용이 늦게 길어지며 나는 스크롤 알림에 안 풀림)
      const gap = box.scrollHeight - box.scrollTop - box.clientHeight;
      if (pinning()) { stuck.current = true; near.current = true; if (gap > 1) box.scrollTop = box.scrollHeight; on(); return; }
      stuck.current = gap < 4; near.current = gap < nearPx(box); top0(); on();
    };
    const hand = () => { sentPin.current = 0; touched.current = true; autoN.current = 0; hold.current = Date.now() + 900; };   // 손으로 밀면 = 저절로 받기 다시 셈 · 잠깐 안 당김
    const wheel = (e: WheelEvent) => { hand(); if (e.deltaY < 0) stuck.current = false; };   // hand = 손 닿음(연 직후 붙잡기 끝)   // 가까이(near)는 스크롤이 멈춘 자리로 다시 셈   // 위로 굴림 = 바로 떨어짐
    const ro = new ResizeObserver(grow);
    const mo = new MutationObserver(grow);   // 대화 줄이 통째로 바뀌어도(첫 칸이 새 요소) 키 변화를 놓치지 않음 · 접기 단추가 나중에 붙음
    mo.observe(box, { childList: true, subtree: true });
    box.addEventListener("scroll", onScroll, { passive: true });
    box.addEventListener("load", grow, true);   // 사진이 와서 길어짐
    box.addEventListener("pointerdown", hand, { passive: true });   // 스크롤 막대를 잡아 끎 = 손 닿음
    box.addEventListener("touchstart", hand, { passive: true });
    box.addEventListener("touchmove", hand, { passive: true });
    box.addEventListener("wheel", wheel, { passive: true });
    document.fonts?.addEventListener?.("loadingdone", grow);   // 글꼴이 와서 길어짐
    ro.observe(box);
    if (box.firstElementChild) ro.observe(box.firstElementChild);
    on();
    return () => {
      box.removeEventListener("scroll", onScroll); box.removeEventListener("load", grow, true); box.removeEventListener("pointerdown", hand); box.removeEventListener("touchstart", hand); box.removeEventListener("touchmove", hand); box.removeEventListener("wheel", wheel);
      document.fonts?.removeEventListener?.("loadingdone", grow); ro.disconnect(); mo.disconnect(); if (tm) clearTimeout(tm);
    };
  }, [msgs.isPending, room]);
  useEffect(() => {   // 밖에서 그 글로(보조 01 고정 띠·이력 판 = window.dispatchEvent(new CustomEvent("nm-jump", { detail: { room, id } })))
    const on = (e: Event) => { const d = (e as CustomEvent<{ room?: string; id?: string }>).detail || {}; if (d.room === room && d.id) setWant(String(d.id)); };
    window.addEventListener("nm-jump", on);
    return () => window.removeEventListener("nm-jump", on);
  }, [room]);
  useEffect(() => {   // 그 글로 = 그려졌으면 가운데로 굴리고 반짝 · 묶음 안 = 묶음이 펼쳐진 다음 그림에서 · 아직 안 받은 앞 글 = 하루치씩 받으며 찾음(8번까지)
    if (!want.id || wantDone.current === want.n) return;
    const t = window.setTimeout(() => {
      const el = boxRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(want.id)}"]`);
      if (el) {
        wantDone.current = want.n; touched.current = true; stuck.current = false; near.current = false; hold.current = Date.now() + 1500;   // 그 글로 = 연 직후 붙잡기 끝
        el.scrollIntoView({ block: "center", behavior: document.hidden ? "auto" : "smooth" });
        el.animate?.([{ backgroundColor: "color-mix(in srgb, currentColor 12%, transparent)" }, { backgroundColor: "transparent" }], { duration: 1200 });
        for (const d of [80, 700]) window.setTimeout(() => poke.current(), d);   // 이동 뒤 「↑ 글 처음」 다시 셈
      } else if (!all.some((x) => x.id === want.id)) {
        if (moreRef.current && wantTry.current < AUTO_MAX && !loadingOld.current) {
          wantTry.current++; loadingOld.current = true;
          void olderRef.current().then((k) => { if (!k) wantTry.current = AUTO_MAX; }).catch(() => { wantTry.current = AUTO_MAX; }).finally(() => { loadingOld.current = false; });
        } else if (!loadingOld.current) { wantDone.current = want.n; setErr("그 글을 못 찾았어 — 받은 글 안에 없음"); }
      }
    }, 60);
    return () => clearTimeout(t);
  }, [want, all]);   // eslint-disable-line react-hooks/exhaustive-deps
  const toStart = () => {   // 「↑ 글 처음」 = 그 글 시작이 머리 바로 아래로
    const box = boxRef.current, el = box?.querySelector<HTMLElement>(`[data-id="${CSS.escape(jump)}"]`);
    if (!box || !el) return;
    touched.current = true; stuck.current = false; near.current = false; hold.current = Date.now() + 1500;   // 이동 중엔 맨 아래로 안 당김(16:47 「눌러도 반응이 없고」 = 당기기가 이동을 되돌렸음)
    box.scrollTo({ top: box.scrollTop + el.getBoundingClientRect().top - box.getBoundingClientRect().top - HEAD - 8, behavior: document.hidden ? "auto" : "smooth" });   // 숨은 화면 = 부드러운 이동이 안 움직임
    for (const t of [80, 700]) window.setTimeout(() => poke.current(), t);   // 이동 뒤 단추 다시 셈(스크롤 알림이 늦거나 안 오는 화면 포함)
  };
  const seenQ = useQuery({ queryKey: ["nomute", "seen"], queryFn: () => office<{ seen: Record<string, { ts: number }> }>("seen").then((j) => j.seen || {}), staleTime: 15_000 });
  const seenOpen = useRef<{ room: string; ts: number } | null>(null);   // 방을 연 때 본 데까지(그 뒤 = 안 본 글) — 이 방에서 한 번만 잡음
  // 나간 때 바닥(형 11-07 13:17 「그리고 안본 글은, 내가 만약에 들어가서 안본글을 클릭안하고 그 방을 나오면, 다음번엔 그 안본 글이 안떠야함.」 · 뜸)
  //   = 방을 나갈 때 그 방 마지막 글 시각을 이 기기에 적음 · 다음에 열 때 「본 데까지」 = 서버 값과 이 바닥 중 늦은 것 · 숨은 판도 나갈 때 잡은 값을 비움(돌아오면 다시 잡음)
  if ((seenQ.data || seenQ.isError) && (!seenOpen.current || seenOpen.current.room !== room)) seenOpen.current = { room, ts: Math.max(Number(seenQ.data?.[room]?.ts) || 0, floorGet(room)) };   // 못 받음 = 바닥만(없으면 0 = 단추 없음 · 본 데까지 올리기는 그대로)
  const seenReady = seenOpen.current?.room === room;
  const openTs = seenReady ? seenOpen.current?.ts || 0 : 0;
  const [unseenUsed, setUnseenUsed] = useState("");   // 누른 방 = 단추 내림
  useEffect(() => { if (!active) return; const t = setTimeout(() => setUnseenUsed(room), 10_000); return () => clearTimeout(t); }, [room, active]);   // 방 들어와 10초 안 누르면 「안 본 글」 단추 내림(형 11-06 20:40 「10초가 경과한 뒤에도 안누르잖아/ 그러면 그냥 없는거로해 … 최대한 단순화」)
  const lastTsRef = useRef(0);
  lastTsRef.current = all.at(-1)?.ts || 0;
  useEffect(() => {
    if (!active) return;
    return () => { floorSet(room, lastTsRef.current); seenOpen.current = null; setUnseenUsed(""); };   // 나감(방 바꿈 · 숨김 · 닫힘) = 바닥 적고 잡은 값 비움
  }, [room, active]);
  const unseen = useMemo(() => {
    const t = openTs;
    return flat && t ? all.filter((m) => m.ts > t && m.kind !== "human" && !wakeM(m)) : [];   // 「안 본 것부터」 = 평면 보기 방 전부(형 10-31 「내가 안읽은거가 위로 누르면 거기로 가게끔하고」)
  }, [all, flat, openTs]);
  const toUnseen = async () => {   // 안 본 첫 글로(받은 글 안에 없으면 하루치씩 앞 글을 받으며 · AUTO_MAX 번까지)
    setUnseenUsed(room);
    const t = seenOpen.current?.ts || 0;
    for (let i = 0; i <= AUTO_MAX; i++) {
      const cur = qc.getQueryData<Page>(officeKeys.msgs(room))?.messages || [];
      const first = cur.find((m) => m.ts > t && m.kind !== "human" && !wakeM(m));
      if (first && (cur[0]?.ts ?? Infinity) <= t) { setWant(first.id); return; }   // 본 데까지가 받은 글 안 = 첫 안 본 글이 맞음
      if (!moreRef.current || !(await olderRef.current().catch(() => 0))) { if (first) setWant(first.id); return; }
    }
  };
  useRoomRead(roomReadState, room, active, !!msgs.data && seenReady, msgs.isError, all.at(-1)?.ts || 0, quietRead);   // 읽음 저장 실패 = 입력칸 위에 안 띄움(형 11-03 12:11 「받아오지 못했어 멘트 뜨는거 안떠도 되니까, 안뜨게 해줘 채팅 창 위」 · 다음 글·다시 열기에 저절로 다시 저장 · 기록에만)

  const react = useMutation({
    mutationFn: ({ id, emoji }: { id: string; emoji: string }) => office<{ reactions?: Record<string, string[]>; on?: boolean }>(`rooms/${enc(room)}/reactions`, { method: "POST", body: JSON.stringify({ id, emoji }) }),
    onMutate: ({ id, emoji }) => {   // 먼저 화면(형) · 서버 답으로 맞춤 · 실패 = 되돌림
      const base = rxOver || reacts?.reactions || {};
      const w = base[id]?.[emoji] || [], on = !w.includes("형");
      setRxOver({ ...base, [id]: { ...base[id], [emoji]: on ? [...w, "형"] : w.filter((x) => x !== "형") } });
    },
    onSuccess: (j, v) => { setRxOver(null); qc.setQueryData(officeKeys.reacts(room), (old: { reactions?: RoomReacts } | undefined) => mergeReact(old, v.id, j.reactions)); },   // 그 글 칸만(수리 No.22 · data/react-merge.ts)
    onError: (e) => { setRxOver(null); setErr(`반응 못 남김 — ${e instanceof Error ? e.message : String(e)}`); },
  });

  const swapRx = useMutation({   // 내 반응 바꾸기(./office-chat Reactions 길게 누름 · 형 11-08 09:23) = 옛 것 빼고(토글) 새 것 담(이미 담았으면 빼기만) · 화면 먼저 한 번에
    mutationFn: async ({ id, from, to, hasTo }: { id: string; from: string; to: string; hasTo: boolean }) => {
      const post = (emoji: string) => office<{ reactions?: Record<string, string[]>; on?: boolean }>(`rooms/${enc(room)}/reactions`, { method: "POST", body: JSON.stringify({ id, emoji }) });
      return swapReact(post, (one) => qc.setQueryData(officeKeys.reacts(room), (old: { reactions?: RoomReacts } | undefined) => mergeReact(old, id, one)), { from, to, hasTo });   // 부름마다 답을 표에(둘째 실패 = 첫 답은 남음 · 모루 #2910 ①)
    },
    onMutate: ({ id, from, to }) => {
      const base = rxOver || reacts?.reactions || {}, row = { ...base[id] };
      row[from] = (row[from] || []).filter((x) => x !== "형");
      if (!(row[to] || []).includes("형")) row[to] = [...(row[to] || []), "형"];
      setRxOver({ ...base, [id]: row });
    },
    onSuccess: () => { setRxOver(null); },   // 표는 mutationFn 이 부름마다 맞춤
    onError: (e) => { setRxOver(null); void qc.invalidateQueries({ queryKey: officeKeys.reacts(room) }); setErr(`반응 못 바꿈 — ${e instanceof Error ? e.message : String(e)}`); },   // 실패 = 서버에서 다시 받음
  });
  const swapBusy = useRef(new Set<string>());   // 같은 글 바꾸기는 한 번에 하나(모루 #2910 ①)

  const nre = useMemo(() => nameRe(list), [list]);
  const c: Ctx = {
    srcs,
    unseen: (m) => unseenOf(m, c, all),
    room, r, list, nre, onProfile: setProf, reads, rx: rxOver || reacts?.reactions || {}, quick: reacts?.quick?.length ? reacts.quick : ["👍", "❤️", "😂", "🎉", "🤔", "👀"],
    loose: () => {   // 알약 펼침 = 알약 자리 그대로 · 아래 글이 밀려 내려감(브라우저 스크롤 붙들기가 아래 글을 붙잡아 알약을 위로 243px 밀었음 = 펼치는 동안만 끔)
      stuck.current = false; near.current = false; sentPin.current = 0; touched.current = true;
      const box = boxRef.current; if (!box) return;
      box.style.overflowAnchor = "none"; window.clearTimeout(anchorT.current); anchorT.current = window.setTimeout(() => { box.style.overflowAnchor = ""; }, 2000);
    },
    sel, setSel, want: want.id, onMenu: (m) => { setSel(""); setMenuOf(m); },
    onReact: (id, emoji) => { setSel(""); react.mutate({ id, emoji }); },
    onSwap: (id, from, to, hasTo) => { setSel(""); swapLock(swapBusy.current, id, () => swapRx.mutateAsync({ id, from, to, hasTo })); },
    onReply: (m) => { setSel(""); setReply({ id: m.id, who: nmOf(list, m.who), line: firstLine(m) }); requestAnimationFrame(() => document.querySelector<HTMLElement>(".ychat-in [contenteditable=\"true\"], .ychat-in textarea")?.focus()); },   // 답장 = 바로 쓰기 칸(폰 = 자판 올라옴 · 카톡 꼴)
    onJump: (who, line, id) => {
      const hit = id ? all.find((x) => x.id === id) : [...all].reverse().find((x) => nmOf(list, x.who) === who && firstLine(x).startsWith(line.replace(/…$/, "").slice(0, 20)));
      if (hit || id) setWant(hit ? hit.id : String(id));   // 묶음 안이면 펼치고 · 안 받은 앞 글이면 받으며 찾음(위 효과)
      else setErr("그 글이 지금 받은 글 안에 없어 — 위 「옛 글 더 보기」로");
    },
  };

  useSwipeReply(boxRef, (id) => { const m = all.find((x) => x.id === id); if (m) c.onReply(m); }, !msgs.isPending && !pairRoom && room);   // 줄 왼쪽으로 밀기 = 답장(./swipe-reply.ts)
  const hyServer = msgs.data?.pending_ids;
  const hyItems = useMemo(() => (pairRoom ? [] : pendingOf(all, hyServer?.filter((x) => !replying.has(x)), (m) => `${nmOf(list, m.who)}: ${firstLine(m)}`).map((m) => ({ id: m.id, who: m.who, face: idOf(m.who, list), name: nmOf(list, m.who), line: firstLine(m), ts: Number((m as { ts?: number }).ts) || 0, color: ringOf(list.find((x) => x.who === m.who)) }))), [all, hyServer, list, pairRoom]);   // ts·color = 형 10:28 「얼굴로 … 분은 필요」 · 「각자의 시그니처 색」(뜸)
  const dropHy = (ids: string[]) => {   // 알약 지움 = 바로 사라짐 + 서버 장부에서 뺌(형만 · editor#2774 POST rooms/<방>/hyungwait · 뜸 11-07)
    const drop = new Set(ids);
    qc.setQueryData<Page>(officeKeys.msgs(room), (old) => (old ? { ...old, pending_ids: (old.pending_ids || []).filter((x) => !drop.has(x)) } : old));
    void office(`rooms/${enc(room)}/hyungwait`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids }) }).catch(() => qc.invalidateQueries({ queryKey: officeKeys.msgs(room) }));
  };
  const pickHy = (id: string) => { const m = all.find((x) => x.id === id); if (m) setPeek(m); };   // 알약 = 화면 안 움직이고 그 글 창(형 12:03 「오히려 올라가는 액션이 정신 산만해서 그냥 확 창이 뜨고」)
  const peekSend = async (m: Msg, raw: string) => {   // 창 답 = ↩ 답글(reply_to) + 「!그 봇」 하나만 부름(형 12:02 「그 봇만 개별 호출이 강조호출」 · 글 메뉴 「확인 요청」과 같은 꼴) → 알약 빠짐(서버 = 형 글이면 그 방 대기 닫힘 · editor#2789)
    //   보내기 = 입력칸과 같은 보냄 줄(attachmentSender.later) → 내 말풍선이 대화 맨 아래 바로 뜨고 「전송 대기」 → 진짜 글이 되면 시각(형 13:19 「전송대기면 채팅에 뜬 다음에 전송 대기라고 나오면됨」 · 뎅 15:19 검수 · 윈터 15:50 짚음) · 실패 = 그 자리 「다시 보내기」
    const name = nmOf(list, m.who);
    const text = `↩ ${name}: ${firstLine(m)}\n!${name.replace(" PM", "")} ${raw}`;
    //   쓰던 답 = 보내질 때까지 이 기기에 둠(창은 닫히며 지움 → 여기서 다시 둠 · 실패 뒤 새로고침해도 알약 누르면 그대로 · 모루 15:57)
    draftSet(`peek:${m.id}`, raw);
    replying.add(m.id);
    qc.setQueryData<Page>(officeKeys.msgs(room), (old) => (old ? { ...old, pending_ids: (old.pending_ids || []).filter((x) => x !== m.id) } : old));   // 알약 = 보내는 순간 빠짐
    const ck = sendKey();   // 다시 보내기 = 같은 열쇠(서버가 하나로)
    attachmentSender.later(room, text, async () => {
      const j = await office<{ message?: Msg }>(`rooms/${enc(room)}/messages`, { method: "POST", body: JSON.stringify({ text, reply_to: m.id, client_id: ck }) });
      replying.delete(m.id);
      draftDrop(`peek:${m.id}`);
      qc.setQueryData<Page>(officeKeys.msgs(room), (old) => { if (!old) return old; const next = j.message ? merge(old, [j.message]) : old; return { ...next, pending_ids: (next.pending_ids || []).filter((x) => x !== m.id) }; });
      void qc.invalidateQueries({ queryKey: officeKeys.msgs(room) });
      void qc.invalidateQueries({ queryKey: officeKeys.rooms });
    });
  };

  if (msgs.isPending) return null;
  if (msgs.isError) return <p className="p-8 text-sm text-destructive" role="alert">대화를 못 받았어 — {msgs.error.message}</p>;

  let prevTs = 0, prev: Item | undefined, lastMsg: Msg | undefined;   // lastMsg = 바로 앞 글(가운데 알약 줄 = 종·시스템은 건너뜀 · 묶음 띠·날짜 줄에서 끊김)
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AttachSheet />
      {active ? <RoomSearch room={room} box={boxRef} /> : null}
      {menuOf ? <MsgMenu m={menuOf} onUnsent={(id) => {   // 「예」 = 창 바로 닫힘 · 글 바로 빠짐 · 서버는 뒤에서 · 「지웠어」 알림 0 · 실패 때만 되돌리고 한 문장(형 11-12 07:28 「삭제 예.누르면 지웠어. 안떠도 돼 … 누르면 닫히고 백단에서 처리하셈」 · 뎅)
        const key = officeKeys.msgs(room), prev = qc.getQueryData<Page>(key)?.messages.find((x) => x.id === id);
        const put = (fn: (x: Msg) => Msg) => qc.setQueryData<Page>(key, (old) => (old ? { ...old, messages: old.messages.map((x) => (x.id === id ? fn(x) : x)) } : old));
        put((x) => ({ ...x, text: "", files: [], file_meta: [], caption: "", mention: [], unsent: { by: "형", at: Date.now() } } as Msg));
        void office<{ ok?: boolean; unsent?: { by: string; at: number } }>(`rooms/${enc(room)}/unsend`, { method: "POST", body: JSON.stringify({ id }) })
          .then((j) => { if (j?.unsent) put((x) => ({ ...x, unsent: j.unsent } as Msg)); else throw new Error("no unsent"); })
          .catch(() => { if (prev) put(() => prev); setErr("메시지를 삭제하지 못했습니다. 다시 시도해 주세요."); });
      }} who={nmOf(list, menuOf.who)} text={String(menuOf.text || "").replace(QUOTE, "")} line={firstLine(menuOf)} room={room} r={r} list={list} quick={c.quick} onReact={(e) => c.onReact(menuOf.id, e)} onReply={() => c.onReply(menuOf)} pics={picsOf(menuOf).length} onSave={() => picsOf(menuOf).forEach((x, k) => window.setTimeout(() => savePic(x.src, x.name), k * 250))} onClose={() => setMenuOf(null)} /> : null}
      {/* 대화창 아무 데나 끌어다 놓기 = 입력칸에 넣은 것처럼(형 11-05 10:45 「대화창 이 입력하는 칸, 말고 대충 이 대화창 안에만 드래그앤 드롭해도 대화칸에 넣는것처럼 해주면 땡큐!!」) */}
      <div className={`ychat relative flex min-h-0 flex-1 flex-col${dropping ? " ydrop" : ""}`}
        onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; if (!dropping) setDropping(true); } }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropping(false); }}
        onDrop={(e) => {
          setDropping(false);
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          const inp = document.querySelector<HTMLInputElement>('.ychat-in input[type="file"]');
          if (!inp) return;
          const dt = new DataTransfer();
          for (const f of Array.from(e.dataTransfer.files)) dt.items.add(f);
          inp.files = dt.files;
          inp.dispatchEvent(new Event("change", { bubbles: true }));
        }}>
      {flat ? (unseen.length && unseenUsed !== room ? <button type="button" className="yjump" onClick={() => void toUnseen()} aria-label={`안 본 글 ${unseen.length}개로`}><Chev dir="up" size={13} /> 안 본 글</button> : null)
        : jump ? <button type="button" className="yjump" onClick={toStart}><Chev dir="up" size={13} /> 글 처음</button> : null}
      {far ? <button type="button" className="ydown" aria-label={newBelow ? `최근 글로 · 새 글 ${newBelow}개` : "최근 글로"} onClick={toEnd}><Chev dir="down" size={20} />{newBelow ? <b>{newBelow > 99 ? "99+" : newBelow}</b> : null}</button> : null}
      <ScrollDate box={boxRef} />
      <div ref={boxRef} className={`flex min-h-0 flex-1 flex-col overflow-y-auto${atTop ? " nm-top0" : ""}`}>   {/* 글이 적으면 아래부터 쌓음(mt-auto · 형 16:46 「메세지 보내면 이렇게 가려져」) */}
        <div className={`ychat mx-auto mt-auto flex w-full max-w-2xl flex-col gap-[10px] px-3 pb-6 pt-[48px]${unfold ? " unfold" : ""}`}>   {/* 위 여백 = 떠 있는 머리(대화 상대 동그라미) 밑에 첫 글이 안 깔리게 */}
          {r?.temp && !hide ? <TempRoomHead r={r} /> : null}   {/* 화상회의 칸(hide 줌) = 목적 카드 안 그림(형 11-13 15:15 「이거는 설명글은 필요없고」) */}
          {pairRoom ? <PairHead room={room} list={list} /> : null}
          {lead}
          {msgs.data?.more && !flat ? (
            <button type="button" className="mx-auto rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-foreground/5" onClick={() => { const bx = boxRef.current; if (bx) keepTop.current = { h: bx.scrollHeight, top: bx.scrollTop, first: firstRef.current }; void older(); }}>옛 글 더 보기</button>
          ) : null}
          {all.length === 0 ? <p className="text-center text-sm text-muted-foreground">첫 대화를 시작해보세요</p> : null}
          {items.map((it, idx) => {
            const first = it.t === "msg" || it.t === "ev" ? it.m : it.msgs[0];   // ev = 글 하나(msgs 없음 · 11-06 08:0x 이걸 빠뜨려 드나듦 줄 있는 방이 깨졌음)
            const newDay = !first._thr && (!prevTs || dayKey(prevTs) !== dayKey(first.ts));
            if (newDay || it.t === "band") lastMsg = undefined;
            // 같은 사람이 이어 쓰면 얼굴·이름 접음 — 사이에 종·시스템 알약 줄이 끼어도 그대로 이어짐(형 11-02 10:04 「좌상단 동일 인물 보일때는 또 노출 안되조 되뎃다 이거 확인 좀」 · 사진 = 시아 9:35 · 종 9:40 · 시아 9:40 에 얼굴 두 번)
            const cont = !newDay && it.t === "msg" && !!lastMsg && lastMsg.who === it.m.who && lastMsg.kind === it.m.kind;
            // 시각 = 같은 사람이 1분 안에 이어 쓴 묶음의 **마지막** 글 아래에(형 10-31 11:27 「항상 마지막 말에 최신 시각이 내려와서 붙어야해 … 최신 시각의 가장 마지막 대화에 이어져야된다는 거임 화자가 동일하자는 전제에는」)
            //   = 다음 글이 같은 사람·같은 종류·같은 날·1분 안이면 이 글은 시각 없음(앞 판 = 첫 글에 붙고 뒤 글 생략 → 뒤집음)
            const next = items[idx + 1];
            //   · 다른 사람도 같은 시각이면 맨 아래만(형 10-31 「대화자의 시간대가 같으면 맨 아랫사람만 시간이 나오게해줘」)
            const noTime = it.t === "msg" && !!next && next.t === "msg" && !next.m._thr && dayKey(next.m.ts) === dayKey(it.m.ts) && ((next.m.who === it.m.who && next.m.kind === it.m.kind && next.m.ts - it.m.ts < TIME_GAP) || t12(next.m.ts) === t12(it.m.ts));
            const turn = !newDay && !first._thr && !!sideOf(prev) && !!sideOf(it) && sideOf(prev) !== sideOf(it);
            prevTs = (it.t === "msg" || it.t === "ev" ? it.m : it.msgs[it.msgs.length - 1]).ts;
            prev = it;
            if (it.t === "msg") lastMsg = it.m;
            const key = it.t === "msg" ? it.m.id : `${it.t}-${first.id}`;
            return (
              <div key={key} className={`flex flex-col gap-[10px]${turn ? " yturn" : ""}`}>
                {newDay ? <p className="ydate" data-ts={first.ts}>{dateLabel(first.ts)}</p> : null}
                {it.t === "ev" ? (
                  <p className="yev" title={t12(it.m.ts)}>
                    <span>{it.m.text || ""}</span>
                    {it.m.event?.kind === "left" && inviteOn.has(it.m.id) ? <button type="button" className="yev-a" disabled={inviting === it.m.id} onClick={() => void invite(it.m)}>{inviting === it.m.id ? "초대하는 중…" : "채팅방으로 초대하기"}</button> : null}
                  </p>
                ) : it.t === "msg" ? <Line m={it.m} c={c} cont={cont} noTime={noTime} fresh={it.m.ts > (baseTs.current ?? Infinity)} /> : it.t === "sent" ? <SentGroup msgs={it.msgs} c={c} /> : it.t === "band" ? <Band msgs={it.msgs} c={c} /> : (
                  <p className="yb sys max-w-full truncate" title={it.msgs.map((y) => `${t12(y.ts)} ${whoName(y.who)} · ${(y.text || "").split("\n")[0]}`).join("\n")}>
                    {whoName(it.msgs.at(-1)?.who)} · {(it.msgs.at(-1)?.text || "").split("\n")[0].slice(0, 60)}
                    {it.msgs.length > 1 ? ` 외 ${it.msgs.length - 1}` : ""} · <span className="tabular-nums">{t12(it.msgs.at(-1)?.ts || 0)}</span>
                  </p>
                )}
              </div>
            );
          })}
          {draft ? (   /* 쓰는 중 초안 = YETA _yDraft 꼴(문장이 자라는 대로 그 봇 말풍선 · 끝에 점 셋 · 끝난 답 글이 오면 사라짐) */
            <div className="ymsg ytyp" aria-live="polite" role="button" tabIndex={0} aria-label={`${nmOf(list, draft.who)} 프로필`} style={{ cursor: "pointer" }} onClick={() => setProf(draft.who)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setProf(draft.who); } }}>   {/* 쓰는 중 줄도 같게 */}
              <div className="yava"><Ava who={draft.who} list={list} work /></div>
              <div className="ycol">
                <NameLabel tint={ringOf(list.find((x) => x.who === draft.who))} text={`${nmOf(list, draft.who)} · 쓰는 중`} />
                <div className="yb ai"><Streamdown {...MD_BOX} components={markdownComponents}>{draft.text}</Streamdown><span className="ytdots"><i /><i /><i /></span></div>
              </div>
            </div>
          ) : null}
          <AttachmentRecovery state={attachmentSender} room={room} landed={landed} landedText={landedText} part="pending" />   {/* 보내는 중·보냄 대기 = 대화 줄 맨 아래 내 말풍선 자리(형 11-02 12:02 · 전엔 입력칸 위 따로 된 칸) */}
          {typing.length ? (   /* YETA 타이핑 = 얼굴 + 점 셋 말풍선 · 이름 칸 = 「결 작업 중 · 고민하는 중…」(옛 규칙) */
            <div className="ymsg ytyp" aria-live="polite" role="button" tabIndex={0} aria-label={`${nmOf(list, typing[0])} 프로필`} style={{ cursor: "pointer" }} onClick={() => setProf(typing[0])} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setProf(typing[0]); } }}>   {/* 생각 중 줄(얼굴 · 이름 · 점 셋) 어디를 눌러도 프로필(형 11-14 05:49 「긍구 생각중 눌러도 프로필 나오게해줘」) */}
              <div className="yava"><Ava who={typing[0]} list={list} work /></div>
              <div className="ycol">
                <NameLabel tint={typRing} text={`${typing.slice(0, 3).map((n) => nmOf(list, n)).join("·")}${typing.length > 3 ? ` 외 ${typing.length - 3}` : ""} 생각 중…`} thinking />
                <div className="yb ai"><ThinkMark /></div>   {/* 점 셋(기본) · 구슬 = 설정 「생각중 표시」(형 11-01 12:5x 「내 취향따라 심심할때 바꾸게」) */}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      </div>
      <div className="ychat ychat-in mx-auto w-full max-w-2xl shrink-0 px-3 pb-[var(--duet-tab-space,16px)]">
        {err ? <p className="pb-2 text-sm text-destructive" role="alert" onClick={() => setErr("")}>{err}</p> : null}
        {cmdNote ? <p className="ycmdnote" role="status"><span>{cmdNote}</span><button type="button" aria-label="닫기" onClick={() => setCmdNote("")}>×</button></p> : null}   {/* 5초 뒤 저절로 · × = 바로(형 11-06 20:10 「한 5초뜨고 없어지면되는데 … 없앨수잇어야됨 x 버튼」) */}
        {inviteQ ? (() => {   /* 「/초대 」 뒤 = 이 방에 없는 애 얼굴 줄 · 누르면 이름이 입력칸 끝에 붙음(여럿) · 엔터 = 보내기(형 11-06 11:1x 「응 마찬가지로 되어야해」 · 봄 서버 이름 띄어 여럿) */
          const inRoom = new Set(r?.members || []), typed = new Set(inviteQ);
          const can = list.filter((x) => x.kind !== "human" && !x.gone && !inRoom.has(x.who) && !typed.has(x.who) && !typed.has(x.name || ""));
          return can.length ? <div className="yslash yinv" aria-label="부를 수 있는 이">{can.map((x) => <button key={x.who} type="button" title={x.name || x.who} onMouseDown={(e) => e.preventDefault()} onClick={() => { appendToComposer(`${/\s$/.test(loadDraft(room) || "") ? "" : " "}${x.name || x.who} `); }}><FaceImg id={idOf(x.who, list)} size={26} /><span>{x.name || x.who}</span></button>)}</div> : null;
        })() : slash != null && SLASH_HELP.some(([k]) => k.slice(1).startsWith(slash)) ? (   /* 「/」 안내 줄 = 치는 글자에 맞는 명령만 · 엔터는 그대로 보내기 */
          <div className="yslash" aria-live="polite">{SLASH_HELP.filter(([k]) => k.slice(1).startsWith(slash)).map(([k, d]) => <p key={k}><b>{k}</b><span>{d}</span></p>)}</div>
        ) : null}
        <AttachmentRecovery state={attachmentSender} room={room} landed={landed} landedText={landedText} part="records" />
        <CallSheet />   {/* 「@」·「!」 여러 명 고르기(./call-sheet.tsx · 형 11-02 11:34 · 11:37) */}
        <div className="nm-tray" onWheel={(e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY; }}>   {/* 알약 + 칩 = 한 줄(형 11-07 12:01 「이런식으루 나옴 2줄로」) · 일괄 × 하나 · 옆으로 밀기 */}
          <HyungPills items={hyItems} onPick={pickHy} onDrop={dropHy} active={peek?.id} />   {/* 형 결정 대기 알약 = 입력칸 바로 위(형 11-07 09:55~09:56) */}
          <RoomBoard room={room} />   {/* 입력칸 바로 위 한 줄 · 뜸 @형 알약 = 그 위 줄 · 칩도 제안도 없으면 줄 0 */}
        </div>
        {reply ? (
          <div className="mb-2 flex items-center gap-2 rounded-xl bg-muted px-3 py-1.5 text-xs">   {/* 카톡 꼴 = 「누구에게 답장」 + 그 글 한 줄 + ×(형 11-11 20:08 봄 1:1 = 봄이 옮김 · 왼쪽 강조 선 뺌) */}
            <span className="min-w-0 flex-1"><b className="block truncate">{reply.who}에게 답장</b><span className="block truncate opacity-70">{reply.line}</span></span>
            <button type="button" aria-label="답장 그만" className="px-1" onClick={() => setReply(null)}>×</button>
          </div>
        ) : null}
        {pairRoom ? <p className="ypair-ro">둘의 방 · 읽기만</p> : (<Composer
          agents={toAgentOptions(bots4)}
          commands={OFFICE_COMMANDS}
          channelId={room}
          onTextChange={(t) => { presence?.onTextChange?.(t); saveDraft(room, t); typingPing(room, t); setSlash(/^\/\S*$/.test(t.trim()) ? t.trim().slice(1) : null); setInviteQ(/^\/초대(\s|$)/.test(t.trimStart()) ? t.trimStart().slice(3).split(/\s+/).filter(Boolean) : null); }}
          initialValue={loadDraft(room)}
          className="relative mt-auto w-full"
          commands={[]}
          compact
          placeholder={r ? `${r.with ? `${nmOf(list, r.with)}에게` : `${r.name}에`} 메시지 보내기` : "메시지 보내기"}
          onSubmit={async (draft) => {
            const raw = draft.text.trim();
            const attached = draft.attachments || [];
            if (!raw && !attached.length) return;
            const submittedReply = reply;
            const text = raw && submittedReply ? `↩ ${submittedReply.who}: ${submittedReply.line}\n${raw}` : raw;
            if (text.length > 8000) { setErr("8,000자 넘음 — 나눠서 보내 줘"); throw new Error("too long"); }
            setErr("");
            try {
              if (attached.length) {
                const originals = attached.map((attachment) => {
                  const id = (attachment.metadata as { attachmentId?: string } | undefined)?.attachmentId;
                  const file = id ? peekAttachments([id])[0] : undefined;
                  if (!id || !file) throw new Error("첨부 원본을 찾지 못했어. 파일을 다시 골라 줘.");
                  return { id, file };
                });
                // 전송을 시작한 원본/본문은 기록이 맡는다. 일부 실패해도 새 입력과 섞지 않는다.
                attachmentSender.start({ room, text, originals });
              } else if (text) {
                const cmd = /^\/(?:초대|방파기)(?:\s|$)/.test(text);   // 형만 쓰는 명령(봄 서버 · 형 11-06 「/ < 명령어는 나만.」) — 안 되는 방이면 서버 why 를 그대로 보여 주고 「다시 보내기」로 안 남김
                const ck = sendKey();   // 글 열쇠 하나 = 다시 보내기도 같은 열쇠 → 서버가 하나로(봄 11-07 16:06 · 뎅 안 · 형 16:02·16:04 같은 답장 두 번)
                const post = async () => {
                  const body: Record<string, unknown> = { text, client_id: ck, ...(submittedReply ? { reply_to: submittedReply.id } : {}) };   // 답장 = 원 글 id 도 같이(뜸 서버 = 형 결정 대기에서 빼고 원 글 쓴 이를 바로 깨움 · 11-07)
                  let j: { message?: Msg; closed?: boolean };
                  markSent(room);   // 이 뒤 60초 = 「치는 중」 보낼 창(형 11-13 18:09 · ../data/typing.ts)
                  try { j = await office<{ message?: Msg; closed?: boolean }>(`rooms/${enc(room)}/messages`, { method: "POST", body: JSON.stringify(body) }); }
                  catch (e) {
                    if (!cmd) throw e;
                    // 명령 안 되는 방 = 짧은 안내(라임)로(형 11-06 17:21 사진 = 서버 설명이 형 인용까지 섞여 빨갛게 길게 떴음) · 그 밖 실패 = 서버 글 그대로
                    const why = e instanceof Error ? e.message : String(e);
                    // 글 = 형 11-06 17:21 원문 꼴 「임시로 개설된 채팅방이 아니라 초대가 불가합니다. (임시방 기준: n시간 미만)」 · n = 서버 글 속 시간(없으면 하루 = 24)
                    const hrs = (() => { const m = why.match(/(\d+)\s*시간/); return m ? +m[1] : /하루/.test(why) ? 24 : 24; })();
                    const what = /^\/방파기/.test(text) ? "방파기가" : "초대가";
                    setCmdNote(/임시방|하루|시간/.test(why) ? `임시로 개설된 채팅방이 아니라 ${what} 불가합니다.\n(임시방 기준: ${hrs}시간 미만)` : why);
                    return;
                  }
                  if (j.message) qc.setQueryData<Page>(officeKeys.msgs(room), (old) => merge(old, [j.message as Msg]));
                  if (j.closed || j.message?.closed) { void qc.invalidateQueries({ queryKey: officeKeys.rooms }); void nav({ to: "/rooms" }); }   // 「/방파기」 = 방 닫힘 → 목록으로(형 11-06 「목적 달성해서 나가게 되는거야」)
                };
                // 글도 방마다 하나인 보냄 줄로 = 기다리지 않고 바로 돌아옴 → 입력칸이 안 묶여 다음 글을 바로 씀 · 순서는 줄이 지킴 · 실패 = 그 자리 「다시 보내기」
                //   (형 11-02 11:17 「그리거 아직 전에 메세지 올리면 그 메세지 올라가는 도중이면 내 메세지 못올라가는 버그 안해결됨」 · 입력칸 부품은 onSubmit 이 끝날 때까지 다음 보내기를 거절함 = 앞 글 서버 답 1~2초 동안 막혔음)
                attachmentSender.later(room, text, post);
              }
              setReply((current) => current === submittedReply ? null : current);
              // Composer가 보낸 부분만 비우며 onTextChange로 저장한다. 기다리는 동안 쓴 새 글은 보존한다.
              void qc.invalidateQueries({ queryKey: officeKeys.rooms });
            } catch (e) {
              setErr(`못 보냈어 — ${e instanceof Error ? e.message : String(e)} · 글은 입력칸에 그대로`);
              throw e;
            }
          }}
        />)}
      </div>
      <ProfileCard who={prof} list={list} onClose={() => setProf("")} />
      {peek ? <CallPeek key={peek.id} p={{ id: peek.id, face: idOf(peek.who, list), name: nmOf(list, peek.who), ts: Number((peek as { ts?: number }).ts) || 0, body: <div className="ymd"><Body m={peek} nre={nre} /></div> }} onClose={() => setPeek(null)} onSend={(t) => { const m = peek; void peekSend(m, t).catch((e) => { draftSet(`peek:${m.id}`, t); setErr(`못 보냈어 — ${e instanceof Error ? e.message : String(e)} · 알약 다시 누르면 쓰던 답 그대로`); }); }} /> : null}   {/* 보내기 = 창 바로 닫힘 · 서버는 뒤에서(형 13:19 「순간 멎는 느낌」) */}
    </div>
  );
}

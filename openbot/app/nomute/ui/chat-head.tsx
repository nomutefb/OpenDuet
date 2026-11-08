// PC 대화창 머리줄(빠르 11-08) — 형 dm 08:58 「이 라인에 맞게 대화창도 조정하고」(그림 = 할 일 띠에 줄 · 대화창 위를 오른쪽 HOT ISSUE 줄에) · 「저 라인을 그대로 유지하는거구」
//   · 밥상 09:49 「핫이슈랑 같은 라인에 대화창 나오는것도」 · 「그 대화창은 거기에 대화창 명칭이 뜨면 될거같아 종류가 뜨는게 아니라」
//   = HOT ISSUE 머리줄과 같은 높이(36 · 아래 구분선) · 가운데 = 지금 방 이름(형 10:07 「블릿에 hot issue 이런거 대신해서 … 가운데 글자에 대화창 명칭」 · 꼴 = 옛 윗줄 가운데 이름)(누르면 사람·방 메뉴 = ./top.tsx NomuteName · 옛 윗줄 가운데 자리 → 윗줄 가운데는 시계)
//   공지·할 일 = 오른쪽 그림 하나 → 누르면 접힌 칸이 펼쳐짐(형 08:58 「공지나 할일은 우측에 밥상이야기 처럼 접히게 할게」 · 「다른방은 밥상이야기가 없고 저게 들어가면될듯」)
//   검색 · 밥상 이야기 그림은 body 에 그려짐(./room-search.tsx) → 이 줄 가운데 높이에 맞춤 · 이 줄 오른쪽은 그만큼 비워 둠(.story = 그림 둘)
import { useEffect, useRef, useState } from "react";
import { DuetIcon } from "@/components/duet/icons";
import { NomuteName } from "./top";
import { type Pin, PinHistory, firstLine, usePins, when } from "./pins";
import { TodoRows, useTodos } from "./todo-bar";
import { whoName } from "./who-name";
import { useModal } from "./use-modal";
import "./chat-head.css";

export function ChatHead({ room }: { room: string }) {
  const [hist, setHist] = useState(false);
  const head = useRef<HTMLDivElement>(null);
  const pins = usePins(room).data;
  const jump = (p: Pin) => { setHist(false); window.dispatchEvent(new CustomEvent("nm-jump", { detail: { room, id: p.id } })); };   // 대화창(office-chat.tsx)이 받아 그 글로
  return (
    <>
      <div ref={head} className={`nm-chat-h${room === "guide" ? " story" : ""}`}>
        <NomuteName room={room} />
        <NoticeFold room={room} onHist={() => setHist(true)} onJump={jump} onGone={() => head.current?.querySelector<HTMLElement>("button, [tabindex]")?.focus({ preventScroll: true })} />
      </div>
      {hist ? <PinHistory room={room} pins={pins || { cur: null, history: [] }} onClose={() => setHist(false)} onJump={jump} /> : null}   {/* 판 = 대화 칸(.nm-col) 전체를 덮음 */}
    </>
  );
}

/** 공지(고정 글) · 할 일 = 그림 하나 + 펼침 칸 · 둘 다 없으면 그림도 없음 */
function NoticeFold({ room, onHist, onJump, onGone }: { room: string; onHist: () => void; onJump: (p: Pin) => void; onGone: () => void }) {
  const cur = usePins(room).data?.cur || null;
  const t = useTodos(room);
  const [open, setOpen] = useState(false);
  const n = (cur ? 1 : 0) + t.items.length;
  const box = useModal<HTMLDivElement>(() => setOpen(false), foldLive(open, n));
  useEffect(() => {   // 펼친 채 마지막 할 일을 끝내 칸이 사라짐 = 창도 닫고(Tab 가두기 풀림) 포커스는 머리줄 이름으로(그림 단추도 사라져 돌아갈 자리 없음 · 모루 #2910 ②)
    if (!open || n) return;
    setOpen(false);
    const a = document.activeElement;
    if (!a || a === document.body) onGone();
  }, [open, n]);
  if (!n) return null;
  const jump = (p: Pin) => { setOpen(false); onJump(p); };
  const label = [cur ? "공지" : "", t.items.length ? `할 일 ${t.items.length}` : ""].filter(Boolean).join(" · ");
  return (
    <>
      <button type="button" className={`nm-chat-fold${open ? " on" : ""}`} aria-expanded={open} aria-haspopup="dialog" aria-label={`${label} ${open ? "접기" : "펼치기"}`} title={label} onClick={() => setOpen((v) => !v)}>
        <DuetIcon name="pin" size={18} />
        {t.items.length ? <i>{t.items.length}</i> : null}
      </button>
      {open ? (
        <>
          <div className="nm-chat-fold-scrim" aria-hidden onClick={() => setOpen(false)} />
          <div ref={box} className="nm-chat-fold-pop" role="dialog" aria-label={label}>
            {cur ? (
              <section>
                <h3>공지</h3>
                <button type="button" className="nm-chat-fold-pin" onClick={() => jump(cur)}>
                  <b>{firstLine(cur.text) || (cur.files ? `파일 ${cur.files}개` : "(빈 글)")}</b>
                  <small>{whoName(cur.who)} · {when(cur.at)} · {whoName(cur.by)} 공지</small>
                </button>
                <button type="button" className="nm-chat-fold-more" onClick={() => { setOpen(false); onHist(); }}>공지 이력</button>
              </section>
            ) : null}
            {t.items.length ? (
              <section>
                <h3>할 일 {t.items.length}</h3>
                <TodoRows t={t} />
              </section>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}

/** 접힌 칸 창이 살아 있나 = 펼침 + 보일 것 있음(없으면 그림도 칸도 안 그려지니 창 부품도 꺼야 Tab 이 안 갇힘) */
const foldLive = (open: boolean, n: number) => open && n > 0;

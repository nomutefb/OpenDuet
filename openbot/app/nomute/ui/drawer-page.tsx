// 서랍 = 한 화면(형 10-31 「5번 메뉴는 누르면 리스트로 버튼 위에 뜨는게 아니라 설정 을 누르면 스크롤 형태로 이어지는거처럼 쭉 화면에 구성될거야 한 화면 전체로」)
//   네비 4칸 · 설정은 네비에 있고 결의 방은 놀이터 안(형 「결의방은 놀이방에 넣으면 됨」) · 할 일 숫자 = 네비 서랍 칸과 같은 값
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { DuetIcon } from "@/components/duet/icons";
import { approvalInboxOptions } from "@/lib/approvals";
import { taskListQueryOptions } from "@/lib/tasks/queries";
import { needsInputCount } from "@/lib/tasks/groups";
import { enterRoom } from "../data/read-state";
import { useRoomOrder } from "./room-list";
import { MODALS, type Modal } from "./shell";
import { useBrief } from "./today";
import { YICO } from "./yeta-icons";
import "./yeta-settings.css";   // 설정과 같은 판(형 11-01 「톤이 맞아야되거든」 · .yset-part · .yset-grp · .yset-item)

// 묶음 = 에디터 독 차례(뉴스 → 모으기 → 만들기)를 서랍으로(형 11-01 「edit.nomute.kr에 있는 기능들 모두 매우 자연스럽게 메뉴 5번으로 완전히 녹여줘」 · 한눈 = 앱 네이티브 · 전체 = 에디터 화면 그대로라 기능이 안 빠짐)
const PARTS: { name: string; ids: Modal[] }[] = [
  { name: "일", ids: ["tasks", "runner"] },
  { name: "우리", ids: ["story"] },   // 밥상 이야기(형 11-04 15:4x 「5번 메뉴의 한 공간으로 밥상 이야기로」)
  { name: "뉴스", ids: ["feed", "thumbhist", "edq", "edsearch", "ask"] },   // 「요약 요청 · 에디터 판」 = 앱 「요약 요청」에 합침(빠르 11-01 · 링크 판별·초안 보존)
  { name: "모으기", ids: ["legacy", "sns", "trend", "chan", "chanfull"] },
  { name: "만들기", ids: ["edtool", "eddl"] },
  { name: "알림·기록", ids: ["edmsgs", "edkw", "edsensor", "edmemo"] },
  { name: "에디터 설정", ids: ["edsnsacc", "edpush", "edgenopt", "edlock", "edacct"] },
  { name: "놀기·살피기", ids: ["play", "tokens", "feedback"] },
];
const go = (id: Modal) => { try { sessionStorage.setItem("nm-from-drawer", id); } catch { /* 못 쓰면 「<」 = 옛 길 */ } };

export function DrawerPage() {
  const nav = useNavigate(), inbox = useQuery(approvalInboxOptions()), tasks = useQuery(taskListQueryOptions());
  const { rooms, count } = useRoomOrder(), mr = (rooms.data || []).find((x) => x.id === "memo"), memo = mr ? Math.max(0, count(mr)) : 0;   // 메모 = 사무실 방 하나(형 11-01 「해야할일 쌓아두는 서랍」 · 봇도 쌓음)
  const waiting = needsInputCount(tasks.data, inbox.data) + (useBrief().data?.cols.decide.filter((x) => !x.answer).length || 0);
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-12 pt-4"><div className="yeta-set yset-short mt-2">
      {PARTS.map((p) => (
        <section key={p.name} className="yset-part" aria-label={p.name}>
          <div className="yset-sec">{p.name}</div>
          <div className="yset-grp">
            {p.name === "일" ? (
              <button type="button" className="yset-item" onClick={() => { enterRoom("memo"); void nav({ to: "/channels/$channelId", params: { channelId: "memo" } }); }}>
                <span className="si-ic" aria-hidden><DuetIcon name="page" size={21} /></span>
                <span className="si-lbl"><span className="si-t">메모</span></span>
                <span className="si-v">
                  {memo > 0 ? <b className="nm-rcount">{memo > 99 ? "99+" : memo}</b> : null}
                  <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} />
                </span>
              </button>
            ) : null}
            {p.ids.map((id) => { const m = MODALS.find((x) => x.id === id)!; return (
              <button key={id} type="button" className="yset-item" onClick={() => { go(id); void nav({ to: m.to }); }}>
                <span className="si-ic" aria-hidden><DuetIcon name={m.icon} size={21} /></span>
                <span className="si-lbl"><span className="si-t">{m.label}</span></span>   {/* 부제(desc) 줄 뺌(형 11-02 08:1x 「옆에 설명글은 빼줘」 · 칸 값은 shell.tsx 에 남음) */}
                <span className="si-v">
                  {id === "tasks" && waiting > 0 ? <b className="nm-rcount">{waiting > 99 ? "99+" : waiting}</b> : null}
                  <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} />
                </span>
              </button>
            ); })}
          </div>
        </section>
      ))}
    </div></div>
  );
}

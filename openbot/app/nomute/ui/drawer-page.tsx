// 서랍 = 한 화면(형 10-31 「5번 메뉴는 누르면 리스트로 버튼 위에 뜨는게 아니라 설정 을 누르면 스크롤 형태로 이어지는거처럼 쭉 화면에 구성될거야 한 화면 전체로」)
//   네비 4칸 · 설정은 네비에 있고 결의 방은 놀이터 안(형 「결의방은 놀이방에 넣으면 됨」) · 할 일 숫자 = 네비 서랍 칸과 같은 값
import { useNavigate } from "@tanstack/react-router";
import { DuetIcon } from "@/components/duet/icons";
import { MODALS, type Modal } from "./shell";
import { YICO } from "./yeta-icons";
import "./yeta-settings.css";   // 설정과 같은 판(형 11-01 「톤이 맞아야되거든」 · .yset-part · .yset-grp · .yset-item)
import { useRepairWaiting } from "./repair-count";   // 수리 접수 숫자 = 형 결정 대기 + 접수 방 안 읽은 글(형 11-14)

// 묶음 = 에디터 독 차례(뉴스 → 모으기 → 만들기)를 서랍으로(형 11-01 「edit.nomute.kr에 있는 기능들 모두 매우 자연스럽게 메뉴 5번으로 완전히 녹여줘」 · 한눈 = 앱 네이티브 · 전체 = 에디터 화면 그대로라 기능이 안 빠짐)
// 서랍 정리(형 11-14 클라우드 세션 창 「서랍중에 보면 안쓰는것들 좀 많아 … 이기회에 없앨게」 — 줄마다 형이 정함):
//   요약 요청 → 만들기 맨 위 · AI 썸네일·이미지 → 만들기 / 피드백 → 일 · 토큰 → 러너(작동 표 계정 상태 칸) / 놀이터 → 밥상 이야기 옆
//   SNS + SNS 전체 = 「SNS」 한 줄(한눈 안 「전체 보기」) → 뉴스 / 채널 요약 + 채널 전체 = 「채널」 한 줄 → 알림·기록 / 키워드 알림 = 알림메세지 안 탭
//   화면 잠금 · 구독 기기 → 설정 / 계정 전환 → 작동 표 계정 상태 칸 / 메모 · 검색 · 에디터 메모 = 뺌 / 웹 = 숨김
//   LEGACY · 구독 채널 = 혼자 남는 묶음이라 「뉴스」로(형이 따로 안 말한 둘 · 묶음 하나에 줄 하나는 안 둠)
const PARTS: { name: string; ids: Modal[] }[] = [
  { name: "만들기", ids: ["ask", "edtool", "edvid"] },   // 이미지 편집 하나 · 영상 편집 하나(형 11-14 「이미지 편집 1개, 영상 편집 1개 이렇게만 잇엇거든」) — 트래킹 · 프롬프팅 · 스토리보드 · 유튜브 · 음원 · 큐영상 · 미디어 요약 = 영상 편집 안에서 고름(./video-editor.tsx MODES) · 번역카드 · 변환 · 다운로드 = 아예 지움 · AI 썸네일 = 설정 「AI 썸네일 옵션」
  { name: "일", ids: ["tasks", "sched", "runner", "meetlog", "feedback"] },   // tasks = 「수리 접수」(옛 할 일 자리 · ./repair-page.tsx)
  { name: "우리", ids: ["story", "play"] },
  { name: "뉴스", ids: ["sns", "chan", "edsnsacc", "edsensor"] },   // 썸네일 이력(이미지 편집 아래에 이미 있음) · 대기열 · LEGACY = 숨김(길은 그대로) · 알림 = 설정 「받은 알림」(형 11-14) → 남은 넷을 한 묶음으로
];
const LABEL: Partial<Record<Modal, string>> = { chan: "채널", edtool: "이미지 편집" };   // 서랍에서만 다른 이름(한눈 + 전체 = 「채널」 · 에디터 = 「이미지 편집」)
const go = (id: Modal) => { try { sessionStorage.setItem("nm-from-drawer", id); } catch { /* 못 쓰면 「<」 = 옛 길 */ } };

export function DrawerPage() {
  const nav = useNavigate(), waiting = useRepairWaiting();
  return (
    <div className="nm-drawer-page mx-auto flex w-full max-w-3xl flex-col px-4 pb-12 pt-4"><div className="yeta-set yset-short mt-2">
      {PARTS.map((p) => (
        <section key={p.name} className="yset-part" aria-label={p.name}>
          <div className="yset-sec">{p.name}</div>
          <div className="yset-grp">
            {p.ids.map((id) => { const m = MODALS.find((x) => x.id === id)!; return (
              <button key={id} type="button" className="yset-item" onClick={() => { go(id); void nav({ to: m.to }); }}>
                <span className="si-ic" aria-hidden><DuetIcon name={m.icon} size={21} /></span>
                <span className="si-lbl"><span className="si-t">{LABEL[id] || m.label}</span></span>   {/* 부제(desc) 줄 뺌(형 11-02 08:1x 「옆에 설명글은 빼줘」 · 칸 값은 shell.tsx 에 남음) */}
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

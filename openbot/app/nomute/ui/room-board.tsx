// 방 띠 = 작업 맡음 칩 + 열린 제안(형 11-07 09:10 「윈터랑 번개는 조율해서 반영해야될 부분 코드 수정 및 러너 반영 완료해줘!」 · 깃 회의실 1794010245399 ①② · 서버 editor#2744)
//   형 11-07 10:28 임시방 「이런거 채팅 바로 위에 쓰는곳 위에 올라와야하고, 얼굴로 있어야함. 내용은 업어도됨. 분은 필요. 그리고 내가 답장한거는 없어도되니, 내가 갱신 하자 한 시점부터 진행.내가 누른건 사라져야하고.
//   저거 전경색을 글래스모피즘은 적용하되 각자의 시그니처 색으로 적용하셈」 · 「프로필 색 박아놧으니까」
//   → 입력칸 바로 위 한 줄(뜸 @형 알약 = 그 위 줄 · 뜸 10:34) · 칩 = 얼굴 + 분(이름·내용 = 마우스 올리면) · 바탕 = 유리 + 각자 프로필 색(bubble · 없으면 조약돌 색)
//   · 누르면 사라짐(POST rooms/<방>/board dismiss · 형만 · editor#2758) · 기준 시각 앞 것·형이 답장한 것 = 서버가 뺌 · 둘 다 없으면 줄 0 · 셋 넘으면 「+N」
//   형 10:45~46 「아래에 뜬거 우클릭하면 없앨 수 있게 … 좌측에는 일괄 x 하나 … 튀어나오게가 채팅창 구역 안으로」 · 「심플하게 프로필 사진만 … 전경색 칠하는건 취소. 프로필 원만. 그리고 16분 이것만.」 · 「각각 항목 우클릭하면 바로 언급 지워지게」
//   → 칩 = 프로필 원 + 분(색 칠 0) · 우클릭(또는 누름) = 바로 지움 · 왼쪽 × = 일괄(reset · 형 갱신 시점 = 지금) · 마우스 올림 효과는 줄 안에서만
//   형 10:47 「그리고 옆으로 밀면 이거 밀려서 다음꺼 보여야해」 → 「+N」 접기 대신 가로로 밀기(손가락 · PC 휠도 가로로)
import "./room-board.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { idOf, office } from "../data/office";
import { FaceImg, usePeople } from "./faces";

type Hand = { id: string; who: string; what: string; at: number };
type Open = { id: string; who: string; text: string; pstat: "new" | "spec" | "hold"; ts: number };
type Board = { hands: Hand[]; open: Open[] };
const PSTAT: Record<Open["pstat"], string> = { new: "새", spec: "명세로 넘김", hold: "보류" };
const idTs = (id: string) => Number(String(id).split("-")[0]) || 0;
const took = (ms: number) => { const m = Math.max(0, Math.round(ms / 60_000)); return m < 60 ? `${m}분` : `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ""}`; };

export function RoomBoard({ room }: { room: string }) {
  const pair = room.startsWith("pair-");   // 둘의 방(읽기만) = 띠 0
  const key = ["nomute", "board", room];
  const qc = useQueryClient();
  const q = useQuery({ queryKey: key, queryFn: () => office<Board>(`rooms/${encodeURIComponent(room)}/board`), refetchInterval: 30_000, staleTime: 15_000, retry: false, enabled: !pair });
  const list = usePeople();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => { if (!document.hidden) setNow(Date.now()); }, 60_000); return () => clearInterval(t); }, []);
  const hands = q.data?.hands || [], sugs = q.data?.open || [];
  if (pair || (!hands.length && !sugs.length)) return null;
  const drop = (id: string) => {   // 누르면 바로 사라짐(서버 = 형만 · 아니면 다음 조회에 다시 뜸)
    qc.setQueryData<Board>(key, (b) => (b ? { hands: b.hands.filter((h) => h.id !== id), open: b.open.filter((o) => o.id !== id) } : b));
    void office(`rooms/${encodeURIComponent(room)}/board`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ act: "dismiss", id }) }).catch(() => qc.invalidateQueries({ queryKey: key }));
  };
  const clear = () => {   // 왼쪽 × = 일괄(형 10:45 「좌측에는 일괄 x 하나」) = 기준 시각 지금(그 앞 칩·제안 다 안 뜸 · 서버 = 형만)
    qc.setQueryData<Board>(key, (b) => (b ? { hands: [], open: [] } : b));
    void office(`rooms/${encodeURIComponent(room)}/board`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ act: "reset" }) }).catch(() => qc.invalidateQueries({ queryKey: key }));
  };
  const items = [
    ...hands.map((h) => (
      <button type="button" key={`h${h.id}`} className="bd-chip bd-hand" onClick={() => drop(h.id)} onContextMenu={(e) => { e.preventDefault(); drop(h.id); }}
        title={`${h.who} · ${h.what} · ${new Date(h.at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 시작 · 우클릭 = 지움`} aria-label={`${h.who} 맡음 ${h.what} · ${took(now - h.at)} · 누르면 사라짐`}>
        <FaceImg id={idOf(h.who, list)} size={20} /><i>{took(now - h.at)}</i>
      </button>
    )),
    ...sugs.map((s) => (
      <button type="button" key={`s${s.id}`} className={`bd-chip bd-sug${s.pstat !== "new" ? ` is-${s.pstat}` : ""}`} onClick={() => drop(s.id)} onContextMenu={(e) => { e.preventDefault(); drop(s.id); }}
        title={`[제안] ${s.text} · ${PSTAT[s.pstat]} · ${s.who} · 우클릭 = 지움`} aria-label={`${s.who} 제안 ${s.text} · ${PSTAT[s.pstat]} · 누르면 사라짐`}>
        <FaceImg id={idOf(s.who, list)} size={20} /><b aria-hidden>💡</b><i>{took(now - idTs(s.id))}</i>
      </button>
    )),
  ];
  return (
    <div className="nm-board" role="status" aria-label={`맡은 일 ${hands.length} · 열린 제안 ${sugs.length}`}>
      <button type="button" className="bd-clear" aria-label="다 지우기" title="다 지우기" onClick={clear} onContextMenu={(e) => { e.preventDefault(); clear(); }}>×</button>
      <div className="bd-rail" onWheel={(e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY; }}>{items}</div>   {/* 옆으로 밀기(형 10:47) · PC 휠 = 가로 */}
    </div>
  );
}

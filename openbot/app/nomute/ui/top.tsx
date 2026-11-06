// 맨 위 가운데 동그라미 = 지금 대화 상대(형 10-28 10:18 「지금 대화하는 상대가 맨 위에 지금 동그라미에 떠있으니까 저거로 대체하면 될 듯」 · 10:22 「맨 위는 가운데 동그라미만」)
//   1:1 방 = 그 봇 얼굴 · 단체방(회의실 포함) = 그 방 사람 얼굴 셋 · 윈터 1:1 방·방 밖(할 일 등) = 원래 구슬(등불 · swap/mic-orb.tsx 그대로 = 상태 움직임)
//   원본 header.tsx 의 구슬 자리에 PATCH 로 끼움(overrides.ts) · 누르면 첫 화면(회의실) = 원본 그대로
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { DuetIcon } from "@/components/duet/icons";
import { FaceImg } from "./faces";
import { RoomRoutineSheet, routineLabel, routineRoom, useRoomTimers } from "./room-routine";
import { useRoomMenu } from "./room-menu";
import { useQueryClient } from "@tanstack/react-query";

/** 지금 대화 판의 방(주소 #/channels/<방> · #/group/<방>) · 명부 */
function useTopRoom(given?: string) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const m = path.match(/^\/(?:channels|group)\/([^/]+)/);
  const room = given || (m ? decodeURIComponent(m[1]) : "");   // 첫 화면("/") = 홈 · 회의실 = #/group/all
  const rooms = useQuery({ queryKey: ["nomute", "rooms"], queryFn: () => office<{ rooms: OfficeRoom[] }>("rooms").then((j) => j.rooms || []), staleTime: 15_000 }).data || [];
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const r = rooms.find((x) => x.id === room) || (room.startsWith("pair-") ? pairRoomOf(room, list) : undefined);   // 둘의 방 = 형 목록엔 없음(뜸 #2329) → 머리는 방으로 셈(윈터 구슬 대신 · 이름 = 두 사람)
  return { r, list };
}
/** 둘의 방 id(pair-<자리>-<자리>) → 머리용 방 꼴 · 이름 = 두 사람 이름(자리 = 앱 id · 봇 이름 · 얼굴 파일 이름) · 인원 0 = 사람 목록 단추 없음 */
function pairRoomOf(room: string, list: Awaited<ReturnType<typeof people>>): OfficeRoom {
  const nm = (id: string) => { const p = list.find((x) => idOf(x.who, list) === id || x.bot === id || x.slug === id || (x.face || "").replace(/^.*\//, "").replace(/\.[a-z]+$/, "") === id); return p?.name || p?.who || id; };
  return { id: room, name: room.replace(/^pair-/, "").split("-").map(nm).join(" · "), kind: "group", members: [] };
}

/** 사진 밑 이름(형 10-28 22:04 「그 아래에 각자 이름 나오면 좋겠어」) — 1:1 = 상대 이름 · 단체방 = 방 이름 · 방 밖 = 없음
 *  누르면 목록 하나 = 사람 칸(멤버 · × 내보내기 · + 초대) + 방 칸(옛 우상단 ≡ 방 메뉴 것 · ./room-menu.tsx useRoomMenu) — 형 11-06 20:37~20:39 「두개로 메뉴 분리하느니 … 하나로」
 *  room = PC 반갈 윗줄 가운데가 넘겨 주는 지금 방(없으면 주소에서) */
export function NomuteName({ room }: { room?: string } = {}) {
  const { r, list } = useTopRoom(room);
  const [open, setOpen] = useState(false), [sheet, setSheet] = useState(false);
  const [inv, setInv] = useState(false), [pick, setPick] = useState<string[]>([]), [busy, setBusy] = useState(false), [why, setWhy] = useState("");
  const qc = useQueryClient();
  const timers = useRoomTimers(open).data;
  const menu = useRoomMenu(r?.id || "", open, () => setOpen(false));
  useEffect(() => { setOpen(false); setSheet(false); setInv(false); setPick([]); setWhy(""); }, [r?.id]);
  useEffect(() => {   // 목록 = 밖을 누르면 닫힘(형 10-31 「사진 위 클릭하고 다른 곳 누르면 닫혀야되는데 안닫혀」) · Esc 도
    if (!open) return undefined;
    const close = (e: PointerEvent) => { if (!(e.target as Element | null)?.closest?.(".nm-top-wrap")) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close); window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", close); window.removeEventListener("keydown", esc); };
  }, [open]);
  if (!r) return null;
  const p = r.with ? list.find((x) => x.who === r.with) : undefined;
  const name = r.with ? p?.name || r.with : r.name;
  const mark = p?.mark ? <span className="ymark" aria-hidden>{p.mark}</span> : null;   // 1:1 머리 = 이름 옆 표지(형 10-31 09:12)
  const ids = r.with || r.id === "repair" || r.id === "memo" || r.id === "summary" ? [] : roomAgentIds(r, list);   // 수리 접수 = 접수처라 인원 없음(형 10-31 「여기에 10명은 머야?」) · 요약실 = 요약 목록이라 인원 없음(형 11-04 09:28 「누구 담당자가 있는게 아니라」)
  const can = routineRoom(r);
  // 멤버 조정(임시방만 · 고정된 방(밥상 등) 말고 · 형 11-06 20:37 「고정된 방 말고 (밥상 등)」) = 그 자리에서 내보내기·초대 → POST temprooms/<방>
  const edit = !!r.temp && !r.with;
  const outside = list.filter((x) => x.kind !== "human" && x.who !== "별" && !(r.members || []).includes(x.who));   // 별 = 초대 명단에서 뺌(형 11-06 11:43 「별만 초대 모록에 없으면될듯」 · /초대 얼굴 줄과 같게)
  const saveMembers = async (members: string[]) => {
    setBusy(true); setWhy("");
    try { await office(`temprooms/${encodeURIComponent(r.id)}`, { method: "POST", body: JSON.stringify({ name: r.name, purpose: r.purpose || "", members }) }); await qc.invalidateQueries({ queryKey: ["nomute", "rooms"] }); }
    catch (e) { setWhy(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };
  if (!ids.length && !can && !menu.items) return <span className="nm-top-name">{name}{mark}</span>;   // 목록에 넣을 게 없는 방(둘의 방 등) = 이름만
  const crewSec = ids.length > 0 || edit || !!menu.crew;
  return (   // 단톡 = 이름 옆 인원 · 누르면 누구인지(형 10-31 「들가면 확인할 수 잇으면 됨 방 상단에서」) + 방 메뉴
    <span className="nm-top-wrap">
      <button type="button" className="nm-top-name nm-top-btn" style={r.color ? { color: r.color } : undefined} aria-haspopup="menu" aria-expanded={open} aria-label={ids.length ? `${name} 사람 ${ids.length}명 · 방 메뉴` : `${name} 방 메뉴`} onClick={() => setOpen((v) => !v)}>{name}{mark}{ids.length ? <> <i>{ids.length}</i></> : null}</button>
      {open ? (
        <span className="nm-top-crew nm-yeta">
          {crewSec ? <span className="nm-top-sec">사람</span> : null}
          {ids.map((id) => { const x = list.find((y) => idOf(y.who, list) === id); return <span key={id} className="nm-top-one"><FaceImg id={id} size={24} /><span className="nm-top-nm">{x?.name || x?.who || id}</span>{edit && x ? <button type="button" className="nm-top-kick" aria-label={`${x.name || x.who} 내보내기`} title="내보내기" disabled={busy} onClick={() => void saveMembers((r.members || []).filter((w) => w !== x.who))}><DuetIcon name="logout" size={15} /></button> : null}</span>; })}
          {edit ? (   /* 초대 = 그 자리에서 명단이 부드럽게 펼쳐짐 · 방에 없는 이만 · 체크해서 한 번에(형 11-06 20:37~20:38) · 내보내기 = 사람 오른쪽 문 + 화살표 픽토그램(형 「이미 방에 있는사람 우측에 픽토그램으로」 · 22:38 「그 문 내보내기 픽토그램 그거로해야지 x는 의미가 안어울려」) */
            <>
              <button type="button" className="nm-top-inv" aria-expanded={inv} onClick={() => setInv((v) => !v)}>{inv ? "접기" : "+ 초대"}</button>
              <span className={`nm-top-invlist${inv ? " on" : ""}`}>
                {outside.map((x) => <label key={x.who} className="nm-top-one"><input type="checkbox" checked={pick.includes(x.who)} onChange={() => setPick((p) => (p.includes(x.who) ? p.filter((w) => w !== x.who) : [...p, x.who]))} /><FaceImg id={idOf(x.who, list)} size={22} />{x.name || x.who}</label>)}
                {pick.length ? <button type="button" className="nm-top-invgo" disabled={busy} onClick={() => void saveMembers([...(r.members || []), ...pick]).then(() => { setPick([]); setInv(false); })}>{pick.length}명 넣기</button> : null}
              </span>
            </>
          ) : null}
          {menu.crew ? <span className="nm-top-menu" role="menu" aria-label={`${name} 사람`}>{menu.crew}</span> : null}
          {menu.items || can ? (
            <>
              <span className={`nm-top-sec${crewSec ? " cut" : ""}`}>방</span>
              <span className="nm-top-menu" role="menu" aria-label={`${name} 방 메뉴`}>
                {menu.items}
                {can ? <button type="button" role="menuitem" onClick={() => { setOpen(false); setSheet(true); }}>{routineLabel(timers?.[r.id])}</button> : null}
              </span>
            </>
          ) : null}
          {why || menu.err ? <span className="nm-top-why" role="alert">{why || menu.err}</span> : null}
        </span>
      ) : null}
      {!open && menu.err ? <span className="nm-top-crew nm-yeta" role="alert"><span className="nm-top-why">{menu.err}</span></span> : null}
      {menu.dialogs}
      {sheet ? <RoomRoutineSheet room={r} onClose={() => setSheet(false)} /> : null}
    </span>
  );
}

export function NomuteTop({ orb }: { size: number; orb: ReactNode }) {
  const { r } = useTopRoom();
  // 방 안 = 큰 원 없음(형 10-31 「위에를 전면 다 활용 가능하거든」) · 원은 안 움직임(형 10-31 「프로필 사진이 휙하고 내려가는데 그거 없어도 됨」) · 표식 = 머리 꼴을 CSS 가 바꾸는 자리(shell.css)
  return r ? <span aria-hidden className="nm-room-mark" /> : <>{orb}</>;
}

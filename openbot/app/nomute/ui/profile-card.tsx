// 프로필 카드(형 10-30 19:4x 「대화창에 각각 프사 나오잖아 그거누르면 프로필 나오고 대화 누르면 1대1 대화 이동 되고. 자기 소개 간단히 나오고. 프사 크게 나오고. 직무나오고」
//   · 「지금은 눌러도 액션이없어서」 · 「예타에 좋은 소스들 많으니 막 가져다써」)
//   꼴 = YETA 캐릭터 프로필 팝오버(nomutefb/YETA viewer/index.html #yetaProfPop · 운영자 260709 「프사 클릭 = 현재 생각·소개」) 그대로:
//   어두운 유리 카드(.yeta-pick 결) · 가운데 큰 프사 → 이름 → 직무(연두 .ycd-tag) → 소개(.ypp-desc) → 단추 · 바깥 누름·Esc = 닫기
//   「1:1 대화」 = 그 사람과 형의 1:1 방(rooms[].with)으로 · 없으면 단추 없음 · 소개 = 명부 intro(본인이 채움 · 비면 「아직」)
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { type OfficePerson, type OfficeRoom, idOf, office, people } from "../data/office";
import { ColorPick } from "./color-pick";
import { MicOrb, ringOf } from "../swap/mic-orb";

const ROOMS_KEY = ["nomute", "rooms"] as const;   // office-chat.tsx officeKeys.rooms 와 같은 열쇠(받아 둔 방 목록을 그대로 씀 · 읽기 0)

export function ProfileCard({ who, list, onClose }: { who: string; list: OfficePerson[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [pick, setPick] = useState(false);
  useEffect(() => { setPick(false); }, [who]);
  useEffect(() => {
    if (!who) return;
    const on = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [who, onClose]);
  if (!who) return null;
  const p = list.find((x) => x.who === who);
  const name = p?.name || who;
  const rooms = qc.getQueryData<OfficeRoom[]>(ROOMS_KEY) || [];
  const dm = rooms.find((r) => r.with === who);
  const save = async (color: string) => {   // 말풍선 색(형 10-31 · 서버 office/bubbles.json · 형만)
    await office("bubble", { method: "POST", body: JSON.stringify({ who, color }) });
    qc.setQueryData(["nomute", "people"], await people(true));
    setPick(false);
  };
  const go = () => { onClose(); if (dm) window.location.hash = `#/channels/${encodeURIComponent(dm.id)}`; };
  return (
    <div className="ypc-veil nm-yeta" role="presentation" onClick={onClose}>   {/* nm-yeta = 예타 토큰(--accent · --r-l …) 받는 자리(카드는 .ychat 밖에 뜸) */}
      <div className="ypc" role="dialog" aria-label={`${name} 프로필`} onClick={(e) => e.stopPropagation()}>
        <div className="ypc-ava"><MicOrb size={130} id={idOf(who, list)} tint={ringOf(p)} /><button type="button" className="ypc-orb" aria-label="말풍선 색 고르기" onClick={() => setPick((x) => !x)} /></div>
        {pick ? <ColorPick value={p?.bubble} onSave={save} onClose={() => setPick(false)} /> : null}
        <span className="ycd-nm">{name}{p?.mark ? <span className="ypc-mark" aria-hidden>{p.mark}</span> : null}</span>
        {p?.role ? <span className="ycd-tag">{p.role}</span> : null}
        {p?.intro ? <span className="ypp-desc">{p.intro}</span> : <span className="ycd-quote">자기소개는 아직이야</span>}
        <div className="ypc-acts">
          {dm ? <button type="button" className="ypc-go" onClick={go}>1:1 대화</button> : null}
          <button type="button" className="ypc-x" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

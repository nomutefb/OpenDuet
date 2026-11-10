// 프로필 카드(형 10-30 19:4x 「대화창에 각각 프사 나오잖아 그거누르면 프로필 나오고 대화 누르면 1대1 대화 이동 되고. 자기 소개 간단히 나오고. 프사 크게 나오고. 직무나오고」
//   · 「지금은 눌러도 액션이없어서」 · 「예타에 좋은 소스들 많으니 막 가져다써」)
//   꼴 = YETA 캐릭터 프로필 팝오버(nomutefb/YETA viewer/index.html #yetaProfPop · 운영자 260709 「프사 클릭 = 현재 생각·소개」) 그대로:
//   어두운 유리 카드(.yeta-pick 결) · 가운데 큰 프사 → 이름 → 직무(연두 .ycd-tag) → 소개(.ypp-desc) → 단추 · 바깥 누름·Esc = 닫기
//   「1:1 대화」 = 그 사람과 형의 1:1 방(rooms[].with)으로 · 없으면 단추 없음 · 소개 = 명부 intro(본인이 채움 · 비면 「아직」)
import { useQueryClient } from "@tanstack/react-query";
import { backdrop } from "./backdrop";   // 바탕 닫힘 = 누름·뗌 둘 다 바탕(형 11-07 10:52)
import { useEffect, useState } from "react";
import { draftDrop, draftGet, draftSet } from "./draft";   // 쓰던 소개 되살림(형 11-07 10:56 「휘발안되고」)
import { SaveAsk, useCloseGuard } from "./save-ask";   // 「저장하시겠습니까?」 [예] [아니오](형 10:59)
import { type OfficePerson, type OfficeRoom, idOf, office, people } from "../data/office";
import { ColorPick } from "./color-pick";
import { screenUrl, tailnetUrl } from "./pc-url";   // 「화면 보기」 주소 = 컴퓨터 카드와 같은 테일넷 거르개 · 앱 안 화면 꼴(모루 #2968 · 시험 tests/profile-screen.test.ts)
import { BeingCard, beingLook, warmFace } from "./being-card";   // 애들 카드(형 11-05 「시아 너꺼부터 하나 만들어보면될듯」) · 카드 있는 애만 · 나머지는 아래 예전 꼴 그대로
import { MicOrb, ringOf } from "../swap/mic-orb";
import "./profile-intro.css";

const ROOMS_KEY = ["nomute", "rooms"] as const;   // office-chat.tsx officeKeys.rooms 와 같은 열쇠(받아 둔 방 목록을 그대로 씀 · 읽기 0)

export function ProfileCard({ who, list, onClose }: { who: string; list: OfficePerson[]; onClose: () => void }) {
  const qc = useQueryClient();
  useEffect(() => { for (const x of list) if (x.kind !== "human" && x.face) warmFace(x.face); }, [list]);   // 카드 열기 전에 얼굴 미리 풀기(being-card warmFace · 한 번만)
  const [pick, setPick] = useState(false), [edit, setEdit] = useState(false), [draft, setDraft] = useState(""), [busy, setBusy] = useState(false), [note, setNote] = useState("");
  const [roleEdit, setRoleEdit] = useState(false), [roleDraft, setRoleDraft] = useState("");   // 직무 고치기(형 11-05 「내가 애들 직무도 변경할 수 있게해줘 프로필에서, 근데 그게 디비까지 반영되어야해」 · 서버 office/profile {who, role} · 형만)
  useEffect(() => { setPick(false); setEdit(false); setRoleEdit(false); setNote(""); }, [who]);
  const cur = who ? list.find((x) => x.who === who) : undefined;
  const introDirty = edit && draft !== (cur?.intro || ""), roleDirty = roleEdit && roleDraft.trim() !== (cur?.role || "");
  useEffect(() => { if (!who || !edit) return; if (introDirty) draftSet(`intro:${who}`, draft); else draftDrop(`intro:${who}`); }, [who, edit, draft, introDirty]);
  const g = useCloseGuard(introDirty || roleDirty, onClose, !!who);   // 고치던 소개·직무 있으면 닫기 대신 물음 · Esc 도 이 길(카드 떠 있을 때만)
  if (!who) return null;
  const p = list.find((x) => x.who === who);
  const name = p?.name || who;
  const rooms = qc.getQueryData<OfficeRoom[]>(ROOMS_KEY) || [];
  const dm = rooms.find((r) => r.with === who);
  const look = p?.kind === "human" ? null : beingLook(who, p?.name, p);   // 틀 카드 = 명부 한 줄로(LOOKS 없는 애 · 형 11-09 05:17 「시아 플필 기본 템플릿화해서 모두 게시」)
  const save = async (color: string) => {   // 말풍선 색(형 10-31 · 서버 office/bubbles.json · 형만)
    await office("bubble", { method: "POST", body: JSON.stringify({ who, color }) });
    qc.setQueryData(["nomute", "people"], await people(true));   // 창 닫기 = 저장 그림 ✓ 뒤(ColorPick onClose)
  };
  const saveIntro = async () => {   // 소개 고치기(형 11-01 「봇이 본인의 프로필 소개 변경을 본인이 할 수 있게해줘. 나랑.」 · 서버 office/profile · 빈 글 = 기본으로 · 봇은 MCP intro 도구로 자기 것)
    if (busy) return;
    setBusy(true); setNote("");
    try {
      const r = await office<{ ok?: boolean; error?: string }>("profile", { method: "POST", body: JSON.stringify({ who, intro: draft }) });
      if (r && r.ok === false) throw new Error(r.error || "저장 못 함");
      qc.setQueryData(["nomute", "people"], await people(true));
      setEdit(false); draftDrop(`intro:${who}`);
      return true;
    } catch (e) { setNote((e as Error)?.message || "저장 못 함 — 다시"); return false; }
    finally { setBusy(false); }
  };
  const saveRole = async () => {   // 빈 글 = 명부 기본 직무로 · 서버가 사람표·부를 말(직무 → 이름)까지 같이 바꿈
    if (busy) return;
    setBusy(true); setNote("");
    try {
      const r = await office<{ ok?: boolean; error?: string }>("profile", { method: "POST", body: JSON.stringify({ who, role: roleDraft.trim() }) });
      if (r && r.ok === false) throw new Error(r.error || "저장 못 함");
      qc.setQueryData(["nomute", "people"], await people(true));
      setRoleEdit(false);
      return true;
    } catch (e) { setNote((e as Error)?.message || "저장 못 함 — 다시"); return false; }
    finally { setBusy(false); }
  };
  const go = () => { onClose(); if (dm) window.location.hash = `#/channels/${encodeURIComponent(dm.id)}`; };
  const screen = tailnetUrl(p?.screen) ? screenUrl(tailnetUrl(p?.screen)) : "";   // 그 아이 몸 화면(형 11-08 빠르 창 「프로필 누르면 본인의 vm이 배선되도록」 · 주소 = 서버 명부 screen · 테일넷 안 주소만)
  const openScreen = () => { if (screen) window.open(screen, "_blank", "noopener"); };
  // 카드 있는 애 = 카드 한 장만(형 11-11 06:41 dm-sia 「여기 리인보우 카드 빼고 주변 다 날려도 될거같아」 · 「우상단에 색 고르는거는 카드 안에 우상단으로 넣어버리고. 딱 붙이진 말구.」 · 06:42 「화면보기 같은거는 @sia 이런 곳에 옮기자」 · 06:43 「그리고 설명 글을 이름이랑 직무 써진걸 좀 올리고 거기에 쓰면 될듯 . 좀 좁으려나? 그럼 세로를 늘리면 됑」 · 시아 「소개 글 · 직무 고치기도 같이 빼도 돼?」 → 형 「응응」)
  //   닫기 = 바깥 누름 · 뒤로 · Esc · 앞 판 = 둘레 유리 창 + 직무 · 소개 줄(연필) + 화면 보기 · 닫기 단추
  if (look) return (
    <div className="ypc-veil nm-yeta" role="presentation" {...backdrop(g.request)}>
      <div className="ypc ypc--being" role="dialog" aria-label={`${name} 프로필`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ypc-orb" aria-label="말풍선 색 고르기" onClick={() => setPick((x) => !x)} />
        <BeingCard who={who} name={name} role={p?.role} person={p} note={p?.intro || undefined} onScreen={screen ? openScreen : undefined} onDm={dm ? go : undefined} />
        {pick ? <div className="ypc-pop"><ColorPick value={p?.bubble} onSave={save} onClose={() => setPick(false)} /></div> : null}
      </div>
    </div>
  );
  return (
    <div className="ypc-veil nm-yeta" role="presentation" {...backdrop(g.request)}>   {/* nm-yeta = 예타 토큰(--accent · --r-l …) 받는 자리(카드는 .ychat 밖에 뜸) */}
      <div className={look ? "ypc ypc--being" : "ypc"} role="dialog" aria-label={`${name} 프로필`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ypc-orb" aria-label="말풍선 색 고르기" onClick={() => setPick((x) => !x)} />   {/* 프로필 창 우상단 모서리 · 마진 조금(형 11-01 14:02 「무지개색 프로필 원 저거 저 프로필 창의 우상단을 말하는 거임 우상단 모서리에 마진을 조금 둬서」) */}
        {look ? <BeingCard who={who} name={name} role={p?.role} person={p} /> : <div className="ypc-ava"><MicOrb size={130} id={idOf(who, list)} tint={ringOf(p)} /></div>}
        {pick ? <div className="ypc-pop"><ColorPick value={p?.bubble} onSave={save} onClose={() => setPick(false)} /></div> : null}   {/* 프사 위에 뜨는 판 = 이름이 안 밀림(형 11-01 10:5x 「애초에 모달느낌으로 프사 위에 뜨면되니까」) */}
        {look ? null : <span className="ycd-nm">{name}{p?.mark ? <span className="ypc-mark" aria-hidden>{p.mark}</span> : null}</span>}
        {roleEdit ? (
          <div className="ypc-role-edit">
            <input value={roleDraft} maxLength={20} autoFocus placeholder="직무 · 비우면 기본으로" aria-label={`${name} 직무`} onChange={(e) => setRoleDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); void saveRole(); } }} />
            <button type="button" className="ypc-x" disabled={busy} onClick={() => { setRoleEdit(false); setNote(""); }}>취소</button>
            <button type="button" className="ypc-go" disabled={busy} onClick={() => void saveRole()}>{busy ? "저장 중…" : "저장"}</button>
          </div>
        ) : p?.kind === "human" ? (p?.role ? <span className="ycd-tag">{p.role}</span> : null) : (
          <span className="ypc-role">
            {p?.role ? <span className="ycd-tag">{p.role}</span> : <span className="ycd-quote">직무 없음</span>}   {/* 카드 애도 진짜 직무(형 11-11 06:40 dm-sia 「그리구 직무가 이미 잇는데 직무가 없는거처럼 수정이 있어버림」 · 앞 판 = 카드 애는 회색 「직무」 글자만) */}
            <button type="button" className="ypc-pen" aria-label={`${name} 직무 고치기`} title="직무 고치기" onClick={() => { setRoleDraft(p?.role || ""); setRoleEdit(true); setEdit(false); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
            </button>
          </span>
        )}
        {edit ? (
          <div className="ypc-intro-edit">
            <textarea value={draft} maxLength={300} rows={4} autoFocus placeholder="소개 · 비우면 기본으로" aria-label={`${name} 소개`} onChange={(e) => setDraft(e.target.value)} />
            <div className="row"><small>{[...draft].length}/300</small><button type="button" className="ypc-x" disabled={busy} onClick={() => { setEdit(false); setNote(""); draftDrop(`intro:${who}`); }}>취소</button><button type="button" className="ypc-go" disabled={busy} onClick={() => void saveIntro()}>{busy ? "저장 중…" : "저장"}</button></div>
            {note ? <small className="err" role="alert">{note}</small> : null}
          </div>
        ) : (
          <span className="ypc-intro">
            {p?.intro ? <span className="ypp-desc">{p.intro}</span> : <span className="ycd-quote">자기소개는 아직이야</span>}
            <button type="button" className="ypc-pen" aria-label={`${name} 소개 고치기`} title="소개 고치기" onClick={() => { setDraft(draftGet<string>(`intro:${who}`) ?? (p?.intro || "")); setEdit(true); setRoleEdit(false); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
            </button>
          </span>
        )}
        <div className="ypc-acts">
          {screen ? <button type="button" className="ypc-go ypc-screen" onClick={openScreen} title={`${name} 몸 화면 열기`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>
            화면 보기
          </button> : null}
          {dm && !look ? <button type="button" className="ypc-go" onClick={go}>1:1 대화</button> : null}
          <button type="button" className="ypc-x" onClick={g.request}>닫기</button>
        </div>
      </div>
      {g.ask ? <SaveAsk saving={busy} onKeep={() => g.setAsk(false)} onDiscard={onClose} onSave={() => { g.setAsk(false); void (introDirty ? saveIntro() : saveRole()).then((ok) => { if (ok) onClose(); }); }} /> : null}
    </div>
  );
}

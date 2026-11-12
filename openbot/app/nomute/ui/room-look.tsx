// 방 꾸미기(형 11-06 19:59 「프로필 전경색은 내가 고를수있게, 단색 or 그라데이션 등」 · 20:00 「단톡방은 내가 아이콘도 고를수잇으면 좋긴할거같애」 · 20:33 「회의실도 가능해야해.」)
//   = 방 안 ≡ → 「방 꾸미기」 · 탭 둘(아이콘 · 색) · 저장 = 번개 서버 POST roomlook {room, icon, fg}(형만 · 기기 넘어가도 그대로 · GET rooms 줄 look)
//   그림 = ./room-glyph.tsx 와 같은 판(바탕 투명 · 선만 · 50%) · 그림 판 = 대시보드 고급화 방 「방-꾸미기-v1.png」
import { useQueryClient } from "@tanstack/react-query";
import { backdrop } from "./backdrop";   // 바탕 닫힘 = 누름·뗌 둘 다 바탕(형 11-07 10:52)
import { useState } from "react";
import { SaveAsk, useCloseGuard } from "./save-ask";   // 「저장하시겠습니까?」 [예] [아니오](형 11-07 10:59)
import { createPortal } from "react-dom";
import { type OfficeRoom, office } from "../data/office";
import { GLYPHS, RoomGlyph } from "./room-glyph";
import "./room-look.css";
import { RoomArtRow } from "./temp-room";   // 「사진」 탭 = 임시방 방 설정의 방 사진 칸 그대로(형 11-13 05:27 봄 1:1 「단톡 표지 사진 넣는거 챙겨주면 감사」 · 회의실 · 지정방에도)

const SOLID = ["#CFFF40", "#0FFD02", "#2f6bff", "#ff6fb5", "#ffb07c", "#ffd60a", "#22d3ee", "#C9A7FF", "#FF5A5F", "#dde3ea"];
const GRAD = ["#2f6bff,#CFFF40", "#ff6fb5,#ffb07c", "#22d3ee,#C9A7FF", "#0FFD02,#ffd60a", "#dde3ea,#4f86ff", "#ff6fb5,#4f86ff"];
const bg = (fg: string) => { const c = fg.split(","); return c.length > 1 ? `linear-gradient(90deg, ${c[0]}, ${c[1]})` : c[0]; };

export function RoomLookDialog({ r, onClose }: { r: OfficeRoom; onClose: () => void }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"icon" | "color" | "photo">("icon");
  const [icon, setIcon] = useState(r.look?.icon || ""), [fg, setFg] = useState(r.look?.fg || "");
  const [q, setQ] = useState(""), [a, setA] = useState("#2f6bff"), [b, setB] = useState("#CFFF40");
  const [busy, setBusy] = useState(false), [why, setWhy] = useState("");
  const dirty = icon !== (r.look?.icon || "") || fg !== (r.look?.fg || "");
  const g = useCloseGuard(dirty, onClose);
  const names = Object.keys(GLYPHS).filter((n) => !q.trim() || n.includes(q.trim().toLowerCase()));
  const save = async () => {
    setBusy(true); setWhy("");
    try {
      await office("roomlook", { method: "POST", body: JSON.stringify({ room: r.id, icon, fg }) });
      await qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
      onClose();
    } catch (e) { setWhy(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };
  return createPortal(
    <div className="nrl-veil" role="presentation" {...backdrop(g.request)}>
      <div className="nrl" role="dialog" aria-label={`${r.name} 방 꾸미기`} onClick={(e) => e.stopPropagation()}>
        <div className="nrl-h"><RoomGlyph id={r.id} look={{ icon, fg }} size={52} /><div><b>{r.name} · 방 꾸미기</b><small>형만 바꿈 · 기기 넘어가도 그대로</small></div></div>
        <div className="nrl-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "icon"} onClick={() => setTab("icon")}>아이콘</button>
          <button type="button" role="tab" aria-selected={tab === "color"} onClick={() => setTab("color")}>색</button>
          <button type="button" role="tab" aria-selected={tab === "photo"} onClick={() => setTab("photo")}>사진</button>
        </div>
        {tab === "photo" ? (
          <div className="nrl-sec"><RoomArtRow id={r.id} look={r.look} /></div>   {/* 설명글 뺌(형 11-13 06:54 「사진 설정 시 설명글은 필요없움」) */}
        ) : tab === "icon" ? (
          <div className="nrl-sec">
            <input className="nrl-q" value={q} placeholder="아이콘 찾기(영어 이름 · 예: trend, rocket)" onChange={(e) => setQ(e.target.value)} />
            <div className="nrl-grid">
              {names.map((n) => { const I = GLYPHS[n]; return <button key={n} type="button" title={n} aria-pressed={icon === n} onClick={() => setIcon(n)}><I size={20} /></button>; })}
            </div>
            <button type="button" className="nrl-reset" onClick={() => setIcon("")}>기본으로</button>
          </div>
        ) : (
          <div className="nrl-sec">
            <div className="nrl-lbl">단색</div>
            <div className="nrl-sw">{SOLID.map((c) => <button key={c} type="button" aria-pressed={fg === c} style={{ background: c }} onClick={() => setFg(c)} />)}</div>
            <div className="nrl-lbl">그라데이션</div>
            <div className="nrl-sw gr">{GRAD.map((c) => <button key={c} type="button" aria-pressed={fg === c} style={{ background: bg(c) }} onClick={() => setFg(c)} />)}</div>
            <div className="nrl-cus"><span>직접</span><input type="color" value={a} onChange={(e) => { setA(e.target.value); setFg(`${e.target.value},${b}`); }} /><span>→</span><input type="color" value={b} onChange={(e) => { setB(e.target.value); setFg(`${a},${e.target.value}`); }} /><button type="button" onClick={() => setFg(a)}>한 색만</button></div>
            <button type="button" className="nrl-reset" onClick={() => setFg("")}>기본으로(라임)</button>
          </div>
        )}
        {why ? <p className="nrl-why" role="alert">{why}</p> : null}
        <div className="nrl-ft"><button type="button" onClick={g.request}>닫기</button><button type="button" className="ok" disabled={busy} onClick={() => void save()}>{busy ? "저장 중…" : "저장"}</button></div>
      </div>
      {g.ask ? <SaveAsk saving={busy} onKeep={() => g.setAsk(false)} onDiscard={onClose} onSave={() => { g.setAsk(false); void save(); }} /> : null}
    </div>,
    document.body,
  );
}

// 움짤 스티커(형 11-12 12:17 dm-eyes 「애들한테 공유해서 자주쓰라고해. 글구 혹시 이거 내가 + 옆에 이모지 눌러서 애들마다 골라서 쓸수잇으면 좋겟다」
//   · 12:18 「이모지 눌러서 전체가 있고, 애들마다 이름 있고 그 안에 gif」 · 「모두가 등록될필요는없고 일단 잇는애들부터」 · 뜸)
//   보냄 = 글 한 줄 표지 「[스티커 <이름> <상황>]」(깃 커밋 0 · 봇도 같은 한 줄로 씀) → 말풍선 없이 움짤로 그림 · 몸 = editor viewer/office/sticker/<자리>/<상황>.gif
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { queryClient } from "@/query-client";
import { office } from "../data/office";
import "./sticker.css";

type Item = { id: string; label: string };
type Pack = { id: string; name: string; items: Item[] };
const MOODS: Item[] = [{ id: "joy", label: "좋아" }, { id: "thanks", label: "고마워" }, { id: "think", label: "생각중" }, { id: "surprise", label: "놀람" }, { id: "done", label: "해냈다" }];
export const PACKS: Pack[] = [
  { id: "fast", name: "빠르", items: MOODS },
  { id: "bom", name: "봄", items: MOODS },
  { id: "eyes", name: "뜸", items: MOODS },
];
export const stickerUrl = (p: Pack, it: Item) => `/office/sticker/${p.id}/${it.id}.gif`;
export const stickerText = (p: Pack, it: Item) => `[스티커 ${p.name} ${it.label}]`;
const RE = /^\s*\[스티커\s+(\S+)\s+(\S+)\]\s*$/;
/** 순수 — 글 하나가 스티커 한 줄이면 {pack, item} */
export function stickerOf(text: unknown): { pack: Pack; item: Item } | null {
  const m = RE.exec(String(text || ""));
  if (!m) return null;
  const pack = PACKS.find((p) => p.name === m[1] || p.id === m[1]);
  const item = pack?.items.find((x) => x.label === m[2] || x.id === m[2]);
  return pack && item ? { pack, item } : null;
}

export function Sticker({ text }: { text: unknown }) {
  const s = stickerOf(text);
  if (!s) return null;
  return <img className="nm-sticker" src={stickerUrl(s.pack, s.item)} alt={`${s.pack.name} ${s.item.label}`} loading="lazy" draggable={false} />;
}

const roomNow = () => /^#\/(?:channels|group)\/([^/?#]+)/.exec(location.hash)?.[1] || "";

export function StickerButton() {
  const [open, setOpen] = useState(false), [tab, setTab] = useState("all"), [busy, setBusy] = useState(false);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); }; addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [open]);
  const send = async (p: Pack, it: Item) => {
    const room = decodeURIComponent(roomNow());
    if (!room || busy) return;
    setBusy(true);
    try {
      await office(`rooms/${encodeURIComponent(room)}/messages`, { method: "POST", body: JSON.stringify({ text: stickerText(p, it) }) });
      void queryClient.invalidateQueries({ queryKey: ["nomute", "msgs", room] });
      setOpen(false);
    } catch { /* 못 보냄 = 판 그대로(다시 누름) */ } finally { setBusy(false); }
  };
  const shown = tab === "all" ? PACKS : PACKS.filter((p) => p.id === tab);
  return (
    <>
      <button type="button" className="nm-stk-btn" aria-label="움짤 고르기" title="움짤" onClick={() => setOpen((x) => !x)}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8" /><path d="M9 9.5h.01M15 9.5h.01" /></svg>
      </button>
      {open ? createPortal(
        <>
          <div className="nm-stk-back" aria-hidden onClick={() => setOpen(false)} />
          <div className="nm-stk" role="dialog" aria-label="움짤">
            <div className="nm-stk-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={tab === "all"} className={tab === "all" ? "on" : ""} onClick={() => setTab("all")}>전체</button>
              {PACKS.map((p) => <button key={p.id} type="button" role="tab" aria-selected={tab === p.id} className={tab === p.id ? "on" : ""} onClick={() => setTab(p.id)}>{p.name}</button>)}
            </div>
            <div className="nm-stk-grid">
              {shown.map((p) => p.items.map((it) => (
                <button key={p.id + it.id} type="button" disabled={busy} aria-label={`${p.name} ${it.label} 보내기`} title={`${p.name} · ${it.label}`} onClick={() => void send(p, it)}>
                  <img src={stickerUrl(p, it)} alt="" loading="lazy" draggable={false} />
                </button>
              )))}
            </div>
          </div>
        </>, document.body) : null}
    </>
  );
}

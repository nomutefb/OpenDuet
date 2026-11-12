// 움짤 스티커(형 11-12 12:17 dm-eyes 「애들한테 공유해서 자주쓰라고해. 글구 혹시 이거 내가 + 옆에 이모지 눌러서 애들마다 골라서 쓸수잇으면 좋겟다」
//   · 12:18 「이모지 눌러서 전체가 있고, 애들마다 이름 있고 그 안에 gif」 · 「모두가 등록될필요는없고 일단 잇는애들부터」 · 뜸)
//   보냄 = 글 한 줄 표지 「[스티커 <이름> <상황>]」(깃 커밋 0 · 봇도 같은 한 줄로 씀) → 말풍선 없이 움짤로 그림 · 몸 = editor viewer/office/sticker/<자리>/<상황>.gif
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { queryClient } from "@/query-client";
import { office } from "../data/office";
import "./sticker.css";

import { PACKS, STK_TMP, dropStickerTwins, stickerOf, stickerText, stickerUrl, type Item, type Pack } from "./sticker-logic";
export { PACKS, STK_TMP, stickerMark, stickerOf, stickerText, stickerUrl } from "./sticker-logic";

/** mark = 내가 보낸 움짤 옆 표(형 11-12 12:50 「움짤옆에는 항상 체크표시 라임색으로 보내진건지 확인해주게해」) · "wait" = 보내는 중(흐린 점) · "sent" = 서버에 앉음(라임 ✓) */
export function Sticker({ text, mark }: { text: unknown; mark?: "wait" | "sent" }) {
  const s = stickerOf(text);
  if (!s) return null;
  const img = <img className="nm-sticker" src={stickerUrl(s.pack, s.item)} alt={`${s.pack.name} ${s.item.label}`} loading="lazy" draggable={false} />;
  if (!mark) return img;
  return <span className={`nm-stk-sent ${mark}`}><span className="nm-stk-ok" role="img" aria-label={mark === "sent" ? "보냄" : "보내는 중"}>{mark === "sent" ? <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden><path d="M3.2 8.6l3 3 6.6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}</span>{img}</span>;
}
const roomNow = () => /^#\/(?:channels|group)\/([^/?#]+)/.exec(location.hash)?.[1] || "";

export function StickerButton() {
  const [open, setOpen] = useState(false), [tab, setTab] = useState("all"), [at, setAt] = useState<CSSProperties>({});
  const btn = useRef<HTMLButtonElement>(null);
  // 판 자리 = 누른 😊 바로 위(형 11-12 13:27 「이거 창이 이모지 누른 그 바로 그 부분에서 떠야해, 부드럽게. 지금은 멀찍이 떠버림.」 · 「모바일도 마찬가지야!」) · 화면 밖으로 안 나가게 12px 안쪽
  const place = () => { const r = btn.current?.getBoundingClientRect(); if (!r) return; const w = Math.min(420, innerWidth - 24); const left = Math.max(12, Math.min(r.left - 8, innerWidth - w - 12)); setAt({ left, bottom: innerHeight - r.top + 8, width: w, transformOrigin: `${Math.round(r.left + r.width / 2 - left)}px 100%` }); };
  useEffect(() => { if (!open) return; addEventListener("resize", place); return () => removeEventListener("resize", place); }, [open]);
  // 뒤로 = 판만 닫힘(형 11-12 21:31 봄 1:1 「이모지 킨 채로 뒤로가면 이리됨」 · 봄 옮김) — 열 때 주소 그대로 한 칸 쌓고, 뒤로(popstate)·방 바뀜(hashchange) = 닫힘 · 판을 다른 길로 닫으면 쌓은 칸을 걷음
  const close = () => { setOpen(false); if ((history.state as { nmStk?: number } | null)?.nmStk) history.back(); };
  useEffect(() => {
    if (!open) return;
    if (!(history.state as { nmStk?: number } | null)?.nmStk) history.pushState({ ...(history.state || {}), nmStk: 1 }, "");
    const off = () => setOpen(false);
    addEventListener("popstate", off); addEventListener("hashchange", off);
    return () => { removeEventListener("popstate", off); removeEventListener("hashchange", off); };
  }, [open]);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); }; addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [open]);
  // 누르면 판은 바로 닫고(형 11-12 12:50 「내가 이모지 클릭하면 바로 창 닫히면돼. ㅋㅋ 두개를 보내는 경우는 별로없거든」) 대화 줄에 「보내는 중」 움짤을 먼저 띄운 뒤 뒤에서 보냄 → 서버 답 = 진짜 글(라임 ✓)로 갈음 · 못 보냄 = 그 칸 걷힘(✓ 없음 = 안 감)
  const send = (p: Pack, it: Item) => {
    const room = decodeURIComponent(roomNow());
    close();
    if (!room) return;
    const key = ["nomute", "msgs", room], text = stickerText(p, it), tmp = STK_TMP + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    type M = { id: string; ts: number; [k: string]: unknown };
    type P = { messages: M[]; [k: string]: unknown };
    const put = (fn: (ms: M[]) => M[]) => queryClient.setQueryData<P>(key, (old) => (old ? { ...old, messages: dropStickerTwins(fn(old.messages || [])) } : old));
    put((ms) => [...ms, { id: tmp, room, ts: Date.now(), kind: "human", who: "형", text }]);
    void office<{ message?: M }>(`rooms/${encodeURIComponent(room)}/messages`, { method: "POST", body: JSON.stringify({ text }) })
      .then((j) => { put((ms) => { const rest = ms.filter((m) => m.id !== tmp); return j?.message && !rest.some((m) => m.id === j.message!.id) ? [...rest, j.message].sort((a, b) => a.ts - b.ts) : rest; }); })
      .catch(() => put((ms) => ms.filter((m) => m.id !== tmp)))
      .finally(() => void queryClient.invalidateQueries({ queryKey: key }));
  };
  const shown = tab === "all" ? PACKS : PACKS.filter((p) => p.id === tab);
  return (
    <>
      <button ref={btn} type="button" className="nm-stk-btn" aria-label="움짤 고르기" title="움짤" onClick={() => { if (open) close(); else { place(); setOpen(true); } }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8" /><path d="M9 9.5h.01M15 9.5h.01" /></svg>
      </button>
      {open ? createPortal(
        <>
          <div className="nm-stk-back" aria-hidden onClick={close} />
          <div className="nm-stk" role="dialog" aria-label="움짤" style={at}>
            <div className="nm-stk-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={tab === "all"} className={tab === "all" ? "on" : ""} onClick={() => setTab("all")}>전체</button>
              {PACKS.map((p) => <button key={p.id} type="button" role="tab" aria-selected={tab === p.id} className={tab === p.id ? "on" : ""} onClick={() => setTab(p.id)}>{p.name}</button>)}
            </div>
            <div className="nm-stk-grid">
              {shown.map((p) => p.items.map((it) => (
                <button key={p.id + it.id} type="button" aria-label={`${p.name} ${it.label} 보내기`} title={`${p.name} · ${it.label}`} onClick={() => send(p, it)}>
                  <img src={stickerUrl(p, it)} alt="" loading="lazy" draggable={false} />
                </button>
              )))}
            </div>
          </div>
        </>, document.body) : null}
    </>
  );
}

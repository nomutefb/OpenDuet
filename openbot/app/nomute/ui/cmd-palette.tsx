// 명령 팔레트 — ⌘K(맥) · Ctrl+K 로 뜨는 판 하나: 치면 화면 · 방이 걸러지고 ↑↓ · Enter 로 감(셈 = ./cmd-core.ts · 키 = ./cmd-key.ts)
//   형 11-17 「메뉴가 분산 … 좀 모아좌」 · 형 11-21 「바로 개선점을 적용해줄 수 있어?」
//   옷 = 메뉴 줄 판(./menu-bar.css .nm-mb-panel · 형 11-16 「글래스모피즘」 · 「좀 더 검정인 느낌」) 그대로: 검은 유리 · 가는 테 · 줄 위 밝은 판 하나가 미끄러짐 · 고른 줄 = 라임
//   화면에 설명글 0(형 11-20) — 안내 글 · 「결과 없음」 없음 · 입력칸 = 돋보기 + 라임 커서(형 「커서만 라임색」)
//   줄 = 화면(메뉴 줄과 같은 목록 = ./shell.tsx menuOf 한 곳) + 방(방 목록 캐시 ["nomute","rooms"] · 없으면 한 번 받음 · 최근 말한 차례)
//   서랍 표에 「치면 걸러지는 이동 판」은 없어서 새로 짬(아이콘 = DuetIcon · 이징 = --e-out · 밝은 판 = 메뉴 줄 .nm-mb-hl 값 그대로)
import "./cmd-palette.css";
import { type ReactNode, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { queryClient } from "@/query-client";
import { DuetIcon, type DuetIconName } from "@/components/duet/icons";
import { office, type OfficeRoom } from "../data/office";
import { type CmdItem, pickItems, roomTo } from "./cmd-core";
import { menuOf } from "./shell";

type Row = CmdItem & { art?: ReactNode };
const ROOMS = ["nomute", "rooms"] as const;

/** 화면 줄 = 메뉴 줄 그대로 펼침(묶음 이름 + 그 안 줄 · 같은 길은 한 번) */
function screens(): Row[] {
  const out: Row[] = [], seen = new Set<string>();
  const add = (r: Row) => { if (!r.to || seen.has(r.to)) return; seen.add(r.to); out.push(r); };
  for (const g of menuOf("/rooms")) {
    if (!g.items) { if (g.to) add({ id: "s:" + g.id, label: g.label, to: g.to, kind: "screen" }); continue; }
    for (const it of g.items) add({ id: "s:" + it.id, label: it.label, to: it.to, kind: "screen", icon: it.icon, art: it.art });
  }
  return out;
}
const roomRows = (rooms: OfficeRoom[] | undefined): Row[] =>
  (rooms || []).map((r) => ({ id: "r:" + r.id, label: r.name || r.id, to: roomTo(r.id), kind: "room" as const, ts: Math.max(r.heard_ts || 0, r.act_ts || 0, r.last_ts || 0) }));

let setOpenRef: ((f: (v: boolean) => boolean) => void) | null = null, root: Root | null = null;
/** 여닫기(./cmd-key.ts) — 처음 = 뿌리 하나를 body 끝에 만듦 */
export function togglePalette() {
  // 그 자리에서 바로 그림(flushSync) = ⌘K 다음에 곧바로 친 글자가 판이 뜨기 전에 다른 칸으로 새지 않게
  if (!root) { const host = document.createElement("div"); host.className = "nm-cmd-host"; document.body.appendChild(host); const r = root = createRoot(host); flushSync(() => r.render(<Palette first />)); return; }
  flushSync(() => setOpenRef?.((v) => !v));
}

function Palette({ first }: { first?: boolean }) {
  const [open, setOpen] = useState(!!first), [q, setQ] = useState(""), [idx, setIdx] = useState(0), [rooms, setRooms] = useState<OfficeRoom[] | undefined>(() => queryClient.getQueryData<OfficeRoom[]>(ROOMS));
  const input = useRef<HTMLInputElement>(null), list = useRef<HTMLDivElement>(null), back = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => { setOpenRef = setOpen; return () => { setOpenRef = null; }; }, []);
  useLayoutEffect(() => {   // (그리기와 같은 박자 = 뜨자마자 입력칸에 초점) 열 때마다 = 물음 비움 · 방 목록 새로 읽음(캐시 · 없으면 한 번 받음) · 닫을 때 = 치던 자리로 돌아감
    if (!open) { const b = back.current; back.current = null; if (b && document.contains(b)) b.focus?.(); return; }
    back.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQ(""); setIdx(0);
    const have = queryClient.getQueryData<OfficeRoom[]>(ROOMS);
    if (have) setRooms(have);
    else void queryClient.fetchQuery({ queryKey: ROOMS, queryFn: () => office<{ rooms: OfficeRoom[] }>("rooms").then((j) => j.rooms || []), staleTime: 15_000 }).then(setRooms).catch(() => { /* 방 줄 없이 화면 줄만 */ });
    input.current?.focus();   // 판과 같은 그리기에 이미 붙어 있음(다음 프레임을 안 기다림 = 뜨자마자 칠 수 있음)
  }, [open]);
  const all = useMemo<Row[]>(() => (open ? [...screens(), ...roomRows(rooms)] : []), [open, rooms]);
  const rows = useMemo(() => pickItems(all, q) as Row[], [all, q]);
  const at = Math.min(idx, Math.max(0, rows.length - 1));
  useLayoutEffect(() => {   // 밝은 판 = 고른 줄 자리로 미끄러짐(줄마다 바탕 없음 · 메뉴 줄과 같은 꼴) · 고른 줄이 가려지면 그만큼만 굴림
    const box = list.current, hl = box?.querySelector<HTMLElement>(".nm-cmd-hl"), row = box?.querySelector<HTMLElement>(`[data-i="${at}"]`);
    if (!box || !hl) return;
    if (!row) { hl.style.opacity = "0"; return; }
    hl.style.transform = `translate3d(0,${row.offsetTop}px,0)`; hl.style.height = `${row.offsetHeight}px`; hl.style.opacity = "1";
    if (row.offsetTop < box.scrollTop) box.scrollTop = row.offsetTop - 6;
    else if (row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = row.offsetTop + row.offsetHeight - box.clientHeight + 6;
  }, [at, rows, open]);
  if (!open) return null;
  const shut = () => setOpen(false);
  const go = (r: Row | undefined) => { if (!r) return; back.current = null; setOpen(false); window.location.hash = r.to; };
  const key = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;   // 한글 조합 중 Enter = 글자 확정
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (rows.length) setIdx((at + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length); }
    else if (e.key === "Enter") { e.preventDefault(); go(rows[at]); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); shut(); }
    else if (e.key === "Tab") e.preventDefault();
  };
  return (
    <div className="nm-cmd-veil" onPointerDown={(e) => { if (e.target === e.currentTarget) shut(); }}>
      <div className="nm-cmd" role="dialog" aria-modal="true" aria-label="이동" onKeyDown={key}>
        <label className="nm-cmd-in">
          <DuetIcon name="search" size={16} />
          <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }} role="combobox" aria-expanded="true" aria-controls="nm-cmd-list" aria-activedescendant={rows[at] ? `nm-cmd-${at}` : undefined} aria-label="이동" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} enterKeyHint="go" />
        </label>
        {rows.length ? <div ref={list} id="nm-cmd-list" className="nm-cmd-list" role="listbox" aria-label="이동">
          <i className="nm-cmd-hl" aria-hidden />
          {rows.map((r, i) => (
            <div key={r.id} id={`nm-cmd-${i}`} data-i={i} role="option" aria-selected={i === at} className={`nm-cmd-row${i === at ? " on" : ""}${r.kind === "room" && i > 0 && rows[i - 1]!.kind === "screen" ? " cut" : ""}`}
              onPointerMove={() => { if (i !== at) setIdx(i); }} onClick={() => go(r)}>
              {r.art ? <span className="nm-cmd-ico art" aria-hidden>{r.art}</span> : <DuetIcon name={(r.icon as DuetIconName) || (r.kind === "room" ? "chat" : "chevronRight")} size={16} className="nm-cmd-ico" />}
              <b>{r.label}</b>
            </div>
          ))}
        </div> : null}
      </div>
    </div>
  );
}

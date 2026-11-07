// 대화 검색(형 10-31 「우상단에 검색 버튼 만들어서 누르면 열리는 앧티브 모션」 · 「입력 전은 대화내용 검색」 · 「키워드 위아래로 탐방 가능하게」 · 「웹앱 캐시에 저장 시켜야됨 느려지니까」)
//   버튼 모션 = 형 저장소 react-useanimations icons/searchToX.json 을 SVG 로 옮김(의존성 0) · 열면 입력칸이 버튼에서 왼쪽으로 펼쳐짐
//   글 = 방마다 기기 IndexedDB 에 쌓음(rooms 칸) · 열 때 새 글만 이어 받고 앞 글을 뒤에서 채움 · 찾기는 이 기기 안에서만 · 지운 임시방 칸은 비움
//   칠하기 = CSS Custom Highlight(말풍선 DOM 손 0) · 탐방 = 대화창 nm-jump(안 받은 앞 글이면 받으며 찾음)
import { useQueryClient } from "@tanstack/react-query";
import { type RefObject, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { StoryButton } from "./stories";
import { type OfficeRoom, office } from "../data/office";

type Row = { id: string; ts: number; text: string };
type Stored = { rows: Row[]; done: boolean };
type Got = { messages?: { id: string; ts: number; text?: string; kind?: string; who?: string }[]; more?: boolean };

const DB = "nm-room-search", STORE = "rooms", N = 100, MAX_ROWS = 20000, JUMP_MS = 220;

function store<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  return new Promise((done) => {
    try {
      const o = indexedDB.open(DB, 1);
      o.onupgradeneeded = () => o.result.createObjectStore(STORE);
      o.onerror = () => done(undefined);
      o.onsuccess = () => {
        const q = run(o.result.transaction(STORE, mode).objectStore(STORE));
        q.onsuccess = () => { o.result.close(); done(q.result); };
        q.onerror = () => { o.result.close(); done(undefined); };
      };
    } catch { done(undefined); }   // 저장소가 막힌 창 = 캐시 없이 그때그때 받음
  });
}

export const dropSearchCache = (room: string) => store("readwrite", (s) => s.delete(room));

/** 없어진 임시방 칸 비우기(시간이 지나 파기된 방). */
async function pruneTemp(live: string[]) {
  const keys = (await store("readonly", (s) => s.getAllKeys())) || [];
  await Promise.all(keys.map(String).filter((k) => k.startsWith("tmp-") && !live.includes(k)).map(dropSearchCache));
}

const rowsOf = (j: Got): Row[] => (j.messages || []).filter((m) => !(m.kind === "system" && /^깸:/.test(m.text || ""))).map((m) => ({ id: m.id, ts: m.ts, text: String(m.text || "").replace(/^↩ [^\n]*\n/, "") }));

/** 캐시 → 새 글 → 앞 글 차례로 받으며 onRows 로 알림 · alive() 가 거짓이면 멈춤. */
async function syncRoom(room: string, onRows: (rows: Row[], done: boolean) => void, alive: () => boolean) {
  const path = `rooms/${encodeURIComponent(room)}/messages`, have = await store<Stored>("readonly", (s) => s.get(room));
  let rows = have?.rows || [], done = !!have?.done;
  const save = () => { onRows(rows, done); return store("readwrite", (s) => s.put({ rows, done }, room)); };
  onRows(rows, done);
  if (!rows.length) {
    const j = await office<Got>(`${path}?n=${N}`);
    rows = rowsOf(j); done = !j.more;
  } else {
    for (let more = true; more && alive();) {
      const last = rows[rows.length - 1].ts, got = rowsOf(await office<Got>(`${path}?since=${last}&n=${N}`)).filter((x) => x.ts > last);
      rows = [...rows, ...got]; more = got.length >= N;
    }
  }
  await save();
  while (!done && rows.length < MAX_ROWS && rows.length && alive()) {
    const j = await office<Got>(`${path}?before=${rows[0].ts}&day=1&n=${N}`), got = rowsOf(j);
    rows = [...got, ...rows]; done = !j.more || !(j.messages || []).length;
    await save();
  }
}

type HighlightApi = { new (...r: Range[]): unknown };
const marks = () => (globalThis.CSS as unknown as { highlights?: Map<string, unknown> } | undefined)?.highlights;

function paint(root: HTMLElement, key: string) {
  const reg = marks(), H = (globalThis as unknown as { Highlight?: HighlightApi }).Highlight;
  if (!reg || !H) return;
  const ranges: Range[] = [];
  if (key) for (const b of root.querySelectorAll(".yb")) {
    const w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const t = (n.nodeValue || "").toLowerCase();
      for (let i = t.indexOf(key); i >= 0; i = t.indexOf(key, i + key.length)) { const r = new Range(); r.setStart(n, i); r.setEnd(n, i + key.length); ranges.push(r); }
    }
  }
  reg.set("nm-find", new H(...ranges));
}

/** 키보드가 올라와도 아래 줄이 보이게 = 화면 아래 끝에서 뜬 높이. */
function useKeyboardGap() {
  const [gap, setGap] = useState(0);
  useEffect(() => {
    const v = window.visualViewport;
    if (!v) return;
    const fit = () => setGap(Math.max(0, window.innerHeight - v.height - v.offsetTop));
    fit(); v.addEventListener("resize", fit); v.addEventListener("scroll", fit);
    return () => { v.removeEventListener("resize", fit); v.removeEventListener("scroll", fit); };
  }, []);
  return gap;
}

function SearchToX({ on }: { on: boolean }) {
  return (
    <svg className={`nm-sx${on ? " on" : ""}`} viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">
      <circle className="c" cx="14" cy="14" r="7.5" />
      <path className="h" d="M19.4 19.4 24.6 24.6" />
      <path className="x" d="M10 10 22 22" />
      <path className="x" d="M22 10 10 22" />
    </svg>
  );
}

export function RoomSearch({ room, box }: { room: string; box: RefObject<HTMLElement | null> }) {
  const qc = useQueryClient(), input = useRef<HTMLInputElement>(null), gap = useKeyboardGap();
  const [open, setOpen] = useState(false), [q, setQ] = useState(""), [rows, setRows] = useState<Row[]>([]), [done, setDone] = useState(false), [idx, setIdx] = useState(0);
  const [pane, setPane] = useState({ left: 0, right: 0, width: 0 });
  // PC 공지 칸 아래로 단추 내림(형 11-07 09:57 밥상 「그 아래에 검색버튼이 위치하면 될 것 같아, 어느정도 간격을 두고」 · 뎅 10:31·11:05 「계산 top 76 그대로」 = 변수·신호가 늦게 닿아 0)
  //   → 공지 칸 아래 끝을 직접 재서 단추 top 을 inline !important 로(1초마다 · 창 크기 · nm-pin-h 신호) · 공지 없거나 PC 아니면 CSS 자리 그대로
  const find = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const fit = () => {
      const slot = document.querySelector<HTMLElement>(".nm-split-l .nm-col .nm-pin-slot:not(:empty)");
      const b = slot && document.querySelector(".nm-split-root") ? Math.round(slot.getBoundingClientRect().bottom) : 0;
      // 단추 transition(width·top·height .32s)이 76→공지 아래 전환을 도는 중이면 계산 top 이 76 으로 잡힘(뎅 11:48 getAnimations = CSSTransition:top) → top 은 전환 빼고 · 값이 바뀔 때만 박음
      const put = (el: HTMLElement | null, off: number) => {
        if (!el) return;
        const v = b > 0 ? `${b + off}px` : "";
        if (el.dataset.pinTop === v) return;
        el.dataset.pinTop = v;
        if (v) { el.style.setProperty("transition", "width .32s, height .32s", "important"); el.style.setProperty("top", v, "important"); }
        else { el.style.removeProperty("top"); el.style.removeProperty("transition"); }
      };
      put(find.current, 8); put(document.querySelector<HTMLElement>(".nm-story-btn"), 4);
    };
    fit();
    const t = window.setInterval(fit, 1000);
    window.addEventListener("resize", fit); window.addEventListener("nm-pin-h", fit);
    return () => { window.clearInterval(t); window.removeEventListener("resize", fit); window.removeEventListener("nm-pin-h", fit); };
  }, [room, open]);
  const key = useDeferredValue(q).trim().toLowerCase();
  const hits = useMemo(() => (key ? rows.filter((r) => r.text.toLowerCase().includes(key)).reverse() : []), [rows, key]);   // 최신 글이 1번 · 위로 = 앞 글
  const at = hits[Math.min(idx, hits.length - 1)];
  const close = () => { setOpen(false); setQ(""); };

  useEffect(() => {
    const fit = () => { const b = box.current?.getBoundingClientRect(); if (b) setPane({ left: b.left, right: window.innerWidth - b.right, width: b.width }); };
    fit(); window.addEventListener("resize", fit);
    const settle = window.setTimeout(fit, 450);   // 대화창이 미끄러져 들어온 뒤 자리
    // PC 가운데 손잡이를 끌면 창 크기는 그대로라 resize 가 안 옴 → 대화 칸 자체 크기를 지켜봄(모루 #2837 검토 「검색을 연 채 손잡이를 끌면 … 예전 값」 · 시아 11-07)
    const el = box.current, ro = el && typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    if (el && ro) ro.observe(el);
    return () => { window.clearTimeout(settle); window.removeEventListener("resize", fit); ro?.disconnect(); };
  }, [box, open]);
  useEffect(() => { setOpen(false); setQ(""); setRows([]); setDone(false); }, [room]);
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    let live = true;
    void pruneTemp((qc.getQueryData<OfficeRoom[]>(["nomute", "rooms"]) || []).map((r) => r.id));
    syncRoom(room, (r, d) => { if (live) { setRows(r); setDone(d); } }, () => live).catch(() => { if (live) setDone(true); });
    return () => { live = false; };
  }, [open, room, qc]);
  useEffect(() => { setIdx(0); }, [key]);
  useEffect(() => {
    if (!at) return;
    const t = window.setTimeout(() => window.dispatchEvent(new CustomEvent("nm-jump", { detail: { room, id: at.id } })), JUMP_MS);
    return () => window.clearTimeout(t);
  }, [at?.id, room]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const root = box.current;
    if (!root || !open || !key) { marks()?.delete("nm-find"); return; }
    let raf = 0;
    const again = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => paint(root, key)); };
    again();
    const seen = new MutationObserver(again);
    seen.observe(root, { childList: true, subtree: true, characterData: true });
    return () => { cancelAnimationFrame(raf); seen.disconnect(); marks()?.delete("nm-find"); };
  }, [box, open, key]);

  if (!pane.width) return null;
  const count = hits.length ? `${Math.min(idx, hits.length - 1) + 1}/${hits.length}` : done ? "찾는 글 없음" : "찾는 중";
  return createPortal(
    <>
      {room === "guide" && !open ? <StoryButton right={pane.right + 46} /> : null}   {/* 밥상만 = 검색 왼쪽 「밥상 이야기」 그림 → 바로 모달(형 11-04 15:4x 「밥상 대화는 우상단에 그거 픽토그램으로 하나 뜨게 해주라, 모달로 바로 뜨게. 밥상만」) */}
      <div ref={find} className={`nm-find${open ? " open" : ""}`} style={{ right: pane.right + 6, width: open ? Math.max(120, pane.width - 52) : 40 }}>   {/* 11-06 20:39 = 우상단 ≡ 뺌(방 메뉴 = 윗줄 가운데 이름 목록 · 형 「별도의 방 설정 메뉴가 따로 우상단에 있을필요없음」) → 돋보기가 맨 오른쪽 · 앞 줄: 닫힘 = 햄버거 왼쪽 그림 하나 · 열림 = 「<」 와 햄버거 사이(형 08:46 「범위 높이 등 만 조정」) */}
        {open ? <input ref={input} value={q} placeholder="대화내용 검색" aria-label="대화내용 검색" enterKeyHint="search" onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") close(); if (e.key === "Enter") setIdx((i) => Math.min(i + 1, Math.max(0, hits.length - 1))); }} /> : null}
        <button type="button" className="nm-find-btn" aria-label={open ? "검색 닫기" : "대화내용 검색"} aria-expanded={open} onClick={() => (open ? close() : setOpen(true))}><SearchToX on={open} /></button>
      </div>
      {open && key ? (
        <div className="nm-find-bar" role="status" style={{ left: pane.left + 12, width: pane.width - 24, bottom: gap + 12 }}>
          <span className="n">{count}</span>
          {done ? null : <small>앞 글 훑는 중 {rows.length}</small>}
          <button type="button" aria-label="앞 글로" disabled={idx >= hits.length - 1} onClick={() => setIdx((i) => i + 1)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 15l6-6 6 6" /></svg></button>
          <button type="button" aria-label="뒷 글로" disabled={idx <= 0} onClick={() => setIdx((i) => i - 1)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></button>
        </div>
      ) : null}
    </>,
    document.body,
  );
}

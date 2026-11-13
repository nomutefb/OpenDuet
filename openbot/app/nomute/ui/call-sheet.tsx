// 「@」·「!」 여러 명 고르기 시트(형 11-02 11:34 「기기왕 이렇게 된거 태그 골뱅이 해서 여러명 선택 가능하게 그 리스트업 팝업레서 선택 가능하게 변경할게」 · 11:37 「긴급도 골뱅이와 마찬가지로 한번에 선택. 단 모두를 선택하면 그게.풀려야 겟지」)
//   원본 부름 목록(prompt-area 드롭다운)은 하나 고르면 닫힘 → 「@」·「!」 를 치는 순간(launch · 글자는 안 들어감) 이 시트가 뜸 · 여럿 체크 → 「넣기」 = 입력칸 끝에 칩 여럿(insertChip 이 칩 뒤 띄움 하나씩 붙임)
//   「모두」 고르면 낱낱 고른 건 풀림 · 낱낱 하나라도 고르면 「모두」 풀림 · 묶음(그록·클로드·지피티)은 낱낱과 같이 고를 수 있음 · 서버는 한 글 여럿 부름 다 받음(_store.js calls)
//   입력칸 손잡이 = overrides.ts 가 composer.tsx 에서 registerComposer(promptAreaRef) · 열기 = triggers.ts onActivate → openCallSheet
//   PC(형 11-04 16:27 「피시 웹앱에서 골뱅이가 안먹힘」 · 16:28 「그냥 태그 하면 화면에 모달이 뜨는게 아니라 채팅에서 바로 … 이런식으로 떠서 깔끔하게」 + 사진 = 입력칸 바로 위 목록)
//     = 마우스 판(pointer:fine · 넓은 화면)은 어둡게 덮는 판 대신 입력칸 바로 위 목록 · 줄 누름 = 바로 넣고 닫힘(Ctrl·⌘·Shift 누름 = 여럿) · ↑↓ · Enter · Esc
//     · 한글 입력 중 「@」 = 키가 「Process」(229)로 와서 원본 launch 가 못 봄 → 글자가 들어온 뒤(input) 그 「@」 를 지우고 같은 목록을 엶(「!」 는 글 앞·띄움 뒤만 · 「고마워!」 는 그대로)
import { type RefObject, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { idOf, peopleSync } from "../data/office";
import { faceIcon, markLabel } from "./call-face";
import "./call-sheet.css";
import { filterAgents, onQuery } from "./call-query";

type Handle = { insertChip: (chip: { trigger: string; value: string; displayText: string }) => void; focus: () => void; setCursorToEnd: () => void; getPlainText: () => string; appendText: (t: string) => void };
type Agent = { id: string; name: string; description?: string };
type Open = { char: "@" | "!"; agents: readonly Agent[]; at: DOMRect | null; q: string } | null;   // q = 입력칸 「@」 뒤에 친 글(형 11-13 22:13 「유사한 단어 쓰면 … 호출자가 줄어들어야돼」)

let composer: RefObject<Handle | null> | null = null;
let open: Open = null;
const subs = new Set<() => void>();
const emit = () => { for (const f of subs) f(); };

/** 입력칸 손잡이(composer.tsx 의 promptAreaRef) · 마지막에 그려진 입력칸이 이김 */
export function registerComposer(ref: RefObject<Handle | null>) { composer = ref; }
/** 입력칸 끝에 글 붙이기(「/초대 」 얼굴 줄 · office-chat) — 손잡이 없으면 false */
export function appendToComposer(t: string) { const h = composer?.current; if (!h) return false; h.setCursorToEnd(); h.appendText(t); h.focus(); return true; }
/** 「@」·「!」 를 치면 부름(triggers.ts launch) */
let known: readonly Agent[] = [];
const anchor = () => { const a = document.activeElement as HTMLElement | null, ed = a?.closest?.('[contenteditable="true"]') as HTMLElement | null; return (ed?.closest("form") || ed?.parentElement || ed)?.getBoundingClientRect() || null; };
/** 1:1 방 = 부를 이가 정해져 있어 고르기 0(형 11-04 17:36 「개인방에서도 골뱅이가 필요없어 바로 깨우는거니까」) */
const inDm = () => /\/channels\/dm-/.test(location.hash || location.pathname);
export function openCallSheet(char: string, agents: readonly Agent[]) {
  known = agents;
  if (char === "!" || inDm()) { document.execCommand("insertText", false, char === "!" ? "!" : "@"); return; }   // 「!」 고르기 뺌(형 11-04 17:36 「나는 이제 느낌표가 필요없음」) · 1:1 = 그냥 글자
  document.execCommand("insertText", false, "@");   // 「@」 는 입력칸에 남김 = 그 뒤 친 글자로 좁힘(형 11-13 22:13)
  openNow(agents);
}
function openNow(agents: readonly Agent[]) { open = { char: "@", agents, at: anchor(), q: "" }; emit(); }
/** 커서 앞 글(입력칸 글 마디 안) */
function beforeCaret(ed: HTMLElement) {
  const sel = window.getSelection(), n = sel?.focusNode, off = sel?.focusOffset ?? 0;
  if (!sel || !n || n.nodeType !== Node.TEXT_NODE || !ed.contains(n)) return null;
  return (n.textContent || "").slice(0, off);
}
/** 커서 앞 n 글자 지우고 그 자리에 부름 칩(누름 · 띄어쓰기 확정) */
function confirmAgent(a: Agent, drop: number) {
  for (let i = 0; i < drop; i++) document.execCommand("delete");
  const h = composer?.current;
  const ed = (document.activeElement as HTMLElement | null)?.closest?.('[contenteditable="true"]') as HTMLElement | null, b = ed ? beforeCaret(ed) : "";
  if (b && !/\s$/.test(b)) document.execCommand("insertText", false, " ");   // 「봐」 뒤에 바로 붙으면 서버가 부름으로 못 읽음
  h?.insertChip({ trigger: "@", value: a.id, displayText: a.name });
  open = null; emit();
}
/** 명부가 떠 있는 동안 입력칸 글이 바뀔 때 = 좁힘 · 확정 · 닫힘 */
function onQueryInput(e: Event) {
  if (!open) return;
  const ed = ((e as InputEvent).target as HTMLElement | null)?.closest?.('[contenteditable="true"]') as HTMLElement | null;
  if (!ed) return;
  setTimeout(() => {
    if (!open) return;
    const b = beforeCaret(ed);
    if (b === null) { open = null; emit(); return; }
    const r = onQuery(open.agents, b);
    if (r.t === "close") { open = null; emit(); }
    else if (r.t === "confirm") confirmAgent(r.agent, r.drop);
    else if (r.q !== open.q) { open = { ...open, q: r.q }; emit(); }
  }, 0);
}
if (typeof document !== "undefined") document.addEventListener("input", onQueryInput, true);
/** 부름 목록(triggers.ts 가 그릴 때마다 넣음) = 한글 입력 길(아래)이 쓸 이름들 */
export function setCallAgents(agents: readonly Agent[]) { known = agents; }
const inline = () => true;   // 폰도 입력칸 바로 위 목록(형 11-05 「@ 는 되는데, 거기서 그록봇 내가 예전에 예시든ㄷ거처럼안돼」 = 11-04 16:28 그록봇 앱 사진 꼴 · 폰은 아래 시트로 떴음) · 전엔 마우스 판만(11-04 16:4x 폭 640 기준 뺌)
const touch = () => !window.matchMedia?.("(pointer: fine)").matches;   // 손가락 판 = 찾기 칸 자동 초점 0(입력칸 자판 유지) · 누름 = 바로 넣고 닫힘 · 「Ctrl」 안내 0
/** 한글 입력 중 들어온 「@」·「!」 — 커서 바로 앞 글자를 보고 지운 뒤 목록을 엶(원본 keydown 길이 이미 열었으면 글자가 안 들어와서 여기 안 옴) */
function onTyped(e: Event) {
  const ie = e as InputEvent, ed = (ie.target as HTMLElement | null)?.closest?.('[contenteditable="true"]') as HTMLElement | null;
  if (!ed || open || !known.length || !/^insert/.test(ie.inputType || "") || !/[@!]$/.test(ie.data || "")) return;
  const run = () => {
    const sel = window.getSelection(), n = sel?.focusNode, off = sel?.focusOffset ?? 0;
    if (!sel || !n || n.nodeType !== Node.TEXT_NODE || !ed.contains(n)) return;
    const before = (n.textContent || "").slice(0, off), ch = before.slice(-1);
    if (ch !== "@" || inDm()) return;   // 「!」 = 그냥 글(형 11-04 17:36) · 1:1 = 그냥 「@」
    openNow(known);   // 친 「@」 는 그대로 두고 명부만 엶(11-13 · 그 뒤 글자로 좁힘)
  };
  if (ie.isComposing) ed.addEventListener("compositionend", () => setTimeout(run, 0), { once: true });
  else setTimeout(run, 0);
}
if (typeof document !== "undefined") document.addEventListener("input", onTyped, true);
/** 입력칸 칩도 같은 알약(작은 얼굴 + 이름 · 형 11-04 17:15) — 칩은 입력칸 원본이 그려서 손대지 않고 얼굴 주소만 --face 로 걸어 둠(그림 = call-sheet.css ::before) */
function faceChips() {
  for (const el of document.querySelectorAll<HTMLElement>('[contenteditable="true"] .prompt-area-chip:not([data-faced])')) {
    const v = el.dataset.chipValue || "", list = peopleSync(), p = list.find((x) => x.who === v || x.name === v || idOf(x.who, list) === v);
    el.dataset.faced = p?.face ? "1" : "0";
    if (p?.face) el.style.setProperty("--face", `url("${p.face}")`);
  }
}
if (typeof document !== "undefined" && typeof MutationObserver !== "undefined") {
  let raf = 0;
  new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(faceChips); }).observe(document.documentElement, { childList: true, subtree: true });
}
const close = () => { open = null; emit(); const h = composer?.current; h?.focus(); h?.setCursorToEnd();   /* 칩은 글 끝에 붙음 → 커서도 끝으로(앞에 남으면 이어 친 글이 칩 앞에 붙어 「봐@시아」 = 서버가 부름으로 못 읽음 · 목 시험) */ };
const ALL = "group-all";
const isOpenOf = (o: Open) => !!o;

export function CallSheet() {
  const o = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => open, () => null);
  const [picked, setPicked] = useState<string[]>([]), [q, setQ] = useState(""), [hi, setHi] = useState(0);
  const find = useRef<HTMLInputElement>(null);
  useEffect(() => { setPicked([]); setQ(""); setHi(0); if (o && !inline() && window.matchMedia?.("(pointer: fine)").matches) setTimeout(() => find.current?.focus(), 30); }, [isOpenOf(o)]);
  useEffect(() => {
    if (!o) return undefined;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [o]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (o?.agents || []).filter((a) => !s || a.name.toLowerCase().includes(s) || (a.description || "").toLowerCase().includes(s));
  }, [o, q]);
  const shown = useMemo(() => filterAgents(o?.agents || [], o?.q || ""), [o]);
  useEffect(() => { setHi(0); }, [o?.q]);
  useEffect(() => {   // 입력칸 초점 그대로 · ↑↓ · Enter(보내기 대신 고르기) · Tab
    if (!o || !inline()) return undefined;
    const key = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if (e.key === "ArrowDown") { e.preventDefault(); e.stopPropagation(); setHi((v) => Math.min(v + 1, shown.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); e.stopPropagation(); setHi((v) => Math.max(v - 1, 0)); }
      else if ((e.key === "Enter" || e.key === "Tab") && shown.length) { e.preventDefault(); e.stopPropagation(); confirmAgent(shown[Math.min(hi, shown.length - 1)], o.q.length + 1); }
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [o, shown, hi]);
  const isOpen = !!o;
  useEffect(() => {   // 뒤로 = 명부 닫힘(형 11-13 22:13 「호출 하다가 뒤로가면 이 화면 데리고 가는거 안고쳐졌당」 · 뎅 공지 창 dfd5ff2 꼴 = 열 때 한 칸 깖 · 다른 길로 닫으면 걷음)
    if (!isOpen) return undefined;
    let byBack = false;
    history.pushState({ ...history.state, nmCall: 1 }, "");
    const pop = (e: PopStateEvent) => { (e as PopStateEvent & { nmEaten?: boolean }).nmEaten = true; byBack = true; if (open) { open = null; emit(); } };   // nmEaten = 이 뒤로는 명부가 먹음(ui/shell.tsx 「대화 판 뒤로 = 목록」이 먼저 닫힌 명부를 못 보고 방을 옮기던 것 · 뜸 23:1x 실물)
    window.addEventListener("popstate", pop);
    return () => { window.removeEventListener("popstate", pop); if (!byBack && history.state?.nmCall) { (window as Window & { nmEatPop?: number }).nmEatPop = Date.now(); history.back(); } };   // 누름 · 확정 · Esc 로 닫힐 때 깐 칸 걷는 뒤로 = ui/shell.tsx 가 진짜 뒤로로 읽고 방을 목록으로 옮기던 것(뜸 23:1x 실물 · 「@모두 」 확정 뒤 방 나감) → 다음 popstate 하나는 셸이 먹지 않음
  }, [isOpen]);
  if (!o) return null;
  const toggle = (id: string) => setPicked((p) => {
    if (p.includes(id)) return p.filter((x) => x !== id);
    if (id === ALL) return [ALL];   // 「모두」 = 낱낱 풀림
    return [...p.filter((x) => x !== ALL), id];   // 낱낱 = 「모두」 풀림
  });
  const put = (ids: string[] = picked) => {
    const h = composer?.current;
    const t = h?.getPlainText() || "";
    if (h && ids.length && t && !/\s$/.test(t)) h.appendText(" ");   // 「봐」 뒤에 바로 붙으면 서버가 부름으로 못 읽음(_store.js calls 앞 글자 규칙)
    for (const id of ids) { const a = o.agents.find((x) => x.id === id); if (a && h) h.insertChip({ trigger: o.char, value: a.id, displayText: a.name }); }
    close();
  };
  const urgent = o.char === "!";
  if (inline()) {   // 입력칸 바로 위 목록 · 찾기 칸 0 = 입력칸 「@」 뒤 글자로 좁힘 · 누름 · 딱 맞는 이름 + 띄어쓰기 = 확정 · ↑↓ · Enter · Esc · 뒤로 = 닫힘(형 11-13 22:13)
    const r = o.at, W = Math.min(460, r ? r.width : 460), left = r ? Math.max(8, Math.min(r.left, window.innerWidth - W - 8)) : 16, bottom = r ? Math.max(8, window.innerHeight - r.top + 8) : 96;
    const maxHeight = r ? Math.max(140, Math.min(460, r.top - 16)) : undefined, fing = touch();
    const cur = Math.min(hi, Math.max(0, shown.length - 1));
    return createPortal(
      <div className="ncs-veil pop" onClick={() => close()} role="presentation">
        <div className={`ncs ncs-pop${fing ? " touch" : ""}`} role="dialog" aria-label="부를 이 고르기" style={{ left, bottom, width: W, maxHeight }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.preventDefault()}>
          <ul className="ncs-list" role="listbox">
            {shown.map((a, i) => {
              const group = a.id.startsWith("group-");
              return (
                <li key={a.id} role="option" aria-selected={i === cur} className={`${group ? "group" : ""}${i === cur ? " hi" : ""}`} onMouseEnter={() => setHi(i)} onClick={() => confirmAgent(a, o.q.length + 1)}>
                  <span className="ncs-face">{group ? <i aria-hidden>{a.name.slice(0, 1)}</i> : faceIcon(a.id)}</span>
                  <span className="ncs-nm"><b>{group ? a.name : markLabel(a.id, a.name)}</b>{a.description ? <small>{a.description}</small> : null}</span>
                  <span className="ncs-ck" aria-hidden>{group ? "묶음" : ""}</span>
                </li>
              );
            })}
            {shown.length ? null : <li className="ncs-none">찾는 이름이 없어</li>}
          </ul>
          <div className="ncs-pop-f"><b>@</b><span className="ncs-q">{o.q || <small>이름을 치면 좁혀져 · 띄어쓰기 = 부르기</small>}</span></div>
        </div>
      </div>,
      document.body,
    );
  }
  return createPortal(
    <div className="ncs-veil" onClick={close} role="presentation">
      <div className="ncs" role="dialog" aria-modal="true" aria-label={urgent ? "바로 깨울 이 고르기" : "부를 이 고르기"} onClick={(e) => e.stopPropagation()}>
        <div className="ncs-h">
          <b>{urgent ? "! 바로 깨우기" : "@ 부르기"}</b>
          <span>{urgent ? "고른 이를 지금 깨움" : "고른 이를 바로 깨움"}</span>
          <button type="button" className="ncs-x" aria-label="닫기" onClick={close}>×</button>
        </div>
        <input ref={find} id="ncs-find" className="ncs-find" value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름 찾기" aria-label="이름 찾기"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); if (picked.length) put(); else if (list.length === 1) { setPicked([list[0].id]); } } }} />
        <ul className="ncs-list" role="listbox" aria-multiselectable="true">
          {list.map((a) => {
            const on = picked.includes(a.id), group = a.id.startsWith("group-");
            return (
              <li key={a.id} role="option" aria-selected={on} className={`${on ? "on" : ""}${group ? " group" : ""}`} onClick={() => toggle(a.id)}>
                <span className="ncs-face">{group ? <i aria-hidden>{a.name.slice(0, 1)}</i> : faceIcon(a.id)}</span>
                <span className="ncs-nm"><b>{group ? a.name : markLabel(a.id, a.name)}</b>{a.description ? <small>{a.description}</small> : null}</span>
                <span className="ncs-ck" aria-hidden>{on ? "✓" : ""}</span>
              </li>
            );
          })}
          {list.length ? null : <li className="ncs-none">찾는 이름이 없어</li>}
        </ul>
        <button type="button" className="ncs-go" disabled={!picked.length} onClick={() => put()}>{picked.length ? `넣기 (${picked.length})` : "고를 이를 눌러 줘"}</button>
      </div>
    </div>,
    document.body,
  );
}

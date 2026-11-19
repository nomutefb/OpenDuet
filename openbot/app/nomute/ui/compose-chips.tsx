// 입력칸 위 테두리 오른쪽 = 이미지 에디터 글칸 단추 셋(복사 · 붙여넣기 · 입력 지우기 → 되돌리기)이 그대로 달라붙음
//   (형 11-20 03:52 dm-gik 「글구 이 메세지 우상단 보내기 전 라인에 그 이미지 에디터에 보면 3버튼 있잖아. 그거 달라붙게 해주러」 · 깃 [도움])
//   원본 = 에디터 thumb-maker/engine/p04-media.ts attachCopyPaste · thumb-maker.css .iobtn-edge
//     = 26px 동그라미 · 위 테두리에 반 걸침 · 지우기 = 누르면 10초 되돌리기 · 복사 = ✓ 1.2초
//   빈 칸 = 붙여넣기 하나 · 글이 있으면 복사 · 지우기가 뜸 · 유리 흐림(형 11-20 07:17 dm-gik 깃 옮김 「그리고 입력창 위에는 붙여넣기만 있으면 됨 그리고 입력 된 것도 없는데 지우기가 잇을 필욘 없을듯 입력된게 잇으면 버튼 뜨게 해줘. 그리고 글라스 모피즘 적용해주고」 · 04:22 판 = 빈 칸에도 흐린 지우기)
//   단추를 눌러도 입력칸 초점이 안 빠짐(누름 시작 preventDefault = 폰 자판 안 내려감 · 붙여넣기 = 커서 자리에)
//   입력칸이 칠 때마다 이 부품만 「글 있음/없음」이 바뀔 때 다시 그림(office-chat 통째 다시 그리기 0)
import { type PointerEvent, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { composerHandle } from "./call-sheet";
import { CHECK_SVG, COPY_SVG, ERASE_SVG, PASTE_SVG, UNDO_SVG } from "./thumb-maker/engine/svg";
import "./compose-chips.css";

export const ERASE_UNDO_MS = 10_000, OK_MS = 1200;   // 에디터 p04-media ERASE_UNDO_MS · clipCopy 와 같은 값
let filled = false;
const subs = new Set<() => void>();
/** 입력칸 글이 바뀔 때(office-chat onTextChange) — 글 있음/없음이 바뀌면 단추만 다시 그림 */
export function chipText(t: string) { const f = t.trim().length > 0; if (f !== filled) { filled = f; for (const fn of subs) fn(); } }
const snap = () => filled;
const sub = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };

async function copyText(t: string) {
  try { await navigator.clipboard.writeText(t); return; } catch { /* 아래 옛 길 */ }
  const ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
  document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch { /* 못 함 */ } ta.remove();
}
const keep = (e: PointerEvent) => e.preventDefault();   // 입력칸 초점 그대로(자판 안 내려감)
const Svg = ({ s }: { s: string }) => <span aria-hidden dangerouslySetInnerHTML={{ __html: s }} />;   // 에디터 그림 글자 그대로(우리 코드 상수)

export function ComposeChips({ init = "" }: { init?: string }) {
  useLayoutEffect(() => { chipText(init); }, []);   // eslint-disable-line react-hooks/exhaustive-deps -- 방 바뀜 = key 로 새로(쓰던 글 = 그 방 초안)
  const has = useSyncExternalStore(sub, snap, () => false);
  const [ok, setOk] = useState(false), [undo, setUndo] = useState<string | null>(null);
  const timer = useRef(0);
  const exitUndo = () => { window.clearTimeout(timer.current); setUndo(null); };
  useEffect(() => { if (undo !== null && has) exitUndo(); }, [has, undo]);   // 지운 뒤 다시 쳐서 글이 생기면 되돌리기 끝(에디터 input → exitUndo · 비울 때 늦게 오는 「글 바뀜」은 빈 글이라 안 셈)
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const ed = () => { const a = document.activeElement as HTMLElement | null; return a?.isContentEditable && a.closest(".ychat-in") ? a : null; };
  const paste = async () => {
    const h = composerHandle(); if (!h) return;
    let t = ""; try { t = (await navigator.clipboard?.readText?.()) || ""; } catch { /* 권한 없음 = 입력칸만 열어 둠(길게 눌러 붙여넣기) */ }
    if (!t) { h.focus(); return; }
    if (ed()) document.execCommand("insertText", false, t); else { h.setCursorToEnd(); h.appendText(t); h.focus(); }
  };
  const copy = async () => { const t = composerHandle()?.getPlainText() || ""; if (!t) return; await copyText(t); setOk(true); window.setTimeout(() => setOk(false), OK_MS); };
  const erase = () => {
    const h = composerHandle(); if (!h) return;
    if (undo !== null) { const v = undo; exitUndo(); h.setText(v); chipText(v); h.setCursorToEnd(); h.focus(); return; }
    const t = h.getPlainText(); if (!t) return;
    h.clear(); chipText(""); h.focus(); setUndo(t);   // 「글 없음」 먼저(입력칸 「글 바뀜」은 늦게 옴 = 그 사이 되돌리기가 바로 끝나던 것)
    window.clearTimeout(timer.current); timer.current = window.setTimeout(exitUndo, ERASE_UNDO_MS);
  };
  return (
    <div className="nm-cchips" role="group" aria-label="입력칸 단추">
      {has ? <button type="button" tabIndex={-1} className={`nm-cchip${ok ? " ok" : ""}`} aria-label="복사" title="복사" onPointerDown={keep} onClick={() => void copy()}><Svg s={ok ? CHECK_SVG : COPY_SVG} /></button> : null}
      {has || undo !== null ? <button type="button" tabIndex={-1} className={`nm-cchip${undo !== null ? " undo" : ""}`} aria-label={undo !== null ? "되돌리기" : "입력 지우기"} title={undo !== null ? "되돌리기 (직전 입력 복원)" : "입력 지우기"} onPointerDown={keep} onClick={erase}><Svg s={undo !== null ? UNDO_SVG : ERASE_SVG} /></button> : null}
      <button type="button" tabIndex={-1} className="nm-cchip" aria-label="붙여넣기" title="붙여넣기" onPointerDown={keep} onClick={() => void paste()}><Svg s={PASTE_SVG} /></button>   {/* 붙여넣기 = 늘 맨 오른쪽(보내기 단추 바로 왼쪽 · 자리 고정 = 글 칠 때 안 튐) · 복사 · 지우기는 글 있을 때 그 왼쪽에(형 11-20 08:38) */}
    </div>
  );
}

// 「@」·「!」 여러 명 고르기 시트(형 11-02 11:34 「기기왕 이렇게 된거 태그 골뱅이 해서 여러명 선택 가능하게 그 리스트업 팝업레서 선택 가능하게 변경할게」 · 11:37 「긴급도 골뱅이와 마찬가지로 한번에 선택. 단 모두를 선택하면 그게.풀려야 겟지」)
//   원본 부름 목록(prompt-area 드롭다운)은 하나 고르면 닫힘 → 「@」·「!」 를 치는 순간(launch · 글자는 안 들어감) 이 시트가 뜸 · 여럿 체크 → 「넣기」 = 입력칸 끝에 칩 여럿(insertChip 이 칩 뒤 띄움 하나씩 붙임)
//   「모두」 고르면 낱낱 고른 건 풀림 · 낱낱 하나라도 고르면 「모두」 풀림 · 묶음(그록·클로드·지피티)은 낱낱과 같이 고를 수 있음 · 서버는 한 글 여럿 부름 다 받음(_store.js calls)
//   입력칸 손잡이 = overrides.ts 가 composer.tsx 에서 registerComposer(promptAreaRef) · 열기 = triggers.ts onActivate → openCallSheet
import { type RefObject, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { faceIcon, markLabel } from "./call-face";
import "./call-sheet.css";

type Handle = { insertChip: (chip: { trigger: string; value: string; displayText: string }) => void; focus: () => void; setCursorToEnd: () => void; getPlainText: () => string; appendText: (t: string) => void };
type Agent = { id: string; name: string; description?: string };
type Open = { char: "@" | "!"; agents: readonly Agent[] } | null;

let composer: RefObject<Handle | null> | null = null;
let open: Open = null;
const subs = new Set<() => void>();
const emit = () => { for (const f of subs) f(); };

/** 입력칸 손잡이(composer.tsx 의 promptAreaRef) · 마지막에 그려진 입력칸이 이김 */
export function registerComposer(ref: RefObject<Handle | null>) { composer = ref; }
/** 「@」·「!」 를 치면 부름(triggers.ts launch) */
export function openCallSheet(char: string, agents: readonly Agent[]) { open = { char: char === "!" ? "!" : "@", agents }; emit(); }
const close = () => { open = null; emit(); const h = composer?.current; h?.focus(); h?.setCursorToEnd();   /* 칩은 글 끝에 붙음 → 커서도 끝으로(앞에 남으면 이어 친 글이 칩 앞에 붙어 「봐@시아」 = 서버가 부름으로 못 읽음 · 목 시험) */ };
const ALL = "group-all";

export function CallSheet() {
  const o = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => open, () => null);
  const [picked, setPicked] = useState<string[]>([]), [q, setQ] = useState("");
  const find = useRef<HTMLInputElement>(null);
  useEffect(() => { setPicked([]); setQ(""); if (o && window.matchMedia?.("(pointer: fine)").matches) setTimeout(() => find.current?.focus(), 30); }, [o]);
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
  if (!o) return null;
  const toggle = (id: string) => setPicked((p) => {
    if (p.includes(id)) return p.filter((x) => x !== id);
    if (id === ALL) return [ALL];   // 「모두」 = 낱낱 풀림
    return [...p.filter((x) => x !== ALL), id];   // 낱낱 = 「모두」 풀림
  });
  const put = () => {
    const h = composer?.current;
    const t = h?.getPlainText() || "";
    if (h && picked.length && t && !/\s$/.test(t)) h.appendText(" ");   // 「봐」 뒤에 바로 붙으면 서버가 부름으로 못 읽음(_store.js calls 앞 글자 규칙)
    for (const id of picked) { const a = o.agents.find((x) => x.id === id); if (a && h) h.insertChip({ trigger: o.char, value: a.id, displayText: a.name }); }
    close();
  };
  const urgent = o.char === "!";
  return createPortal(
    <div className="ncs-veil" onClick={close} role="presentation">
      <div className="ncs" role="dialog" aria-modal="true" aria-label={urgent ? "바로 깨울 이 고르기" : "부를 이 고르기"} onClick={(e) => e.stopPropagation()}>
        <div className="ncs-h">
          <b>{urgent ? "! 바로 깨우기" : "@ 부르기"}</b>
          <span>{urgent ? "고른 이를 지금 깨움" : "고른 이가 다음에 깰 때 읽음"}</span>
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
        <button type="button" className="ncs-go" disabled={!picked.length} onClick={put}>{picked.length ? `넣기 (${picked.length})` : "고를 이를 눌러 줘"}</button>
      </div>
    </div>,
    document.body,
  );
}

// 말풍선 일부 복사(폰) — 길게 누름 → 글 메뉴 「복사」 → 그 말풍선에 드래그 영역(손잡이 둘) · 시작 = 길게 누른 자리 낱말
//   형 11-21 09:50~09:52 dm-sia(시아 옮김 · R0096) 「내가 그 말풍선 길게누르면 누른 부분 일부 복사할수잇게해줄래? 드래그 영역 생겨서」 · 「근디 이게 메뉴랑 겹치는 구나 잠시」 · 「그러면 그 길게 누르면 드래그 복사가 가능하게 나오게 해줘」 · 「내가 누른 지점에서」 · 「메뉴가 뜨고 복사를 누르면 드래그 복사」
//   폰 말풍선은 평소 글자 고르기 막힘(./yeta-chat.css @media (hover:none) .ychat .yb) → 고르는 동안만 data-pick 으로 풂 · 고름이 비거나 말풍선 밖으로 다 나가면 다시 막음
//   고르는 동안 = 그 말풍선 길게 누르기 · 밀기 안 먹음(./msg-menu.tsx useLongPress · ./swipe-reply.ts) → 손잡이 · 폰 글자 고르기가 다 맡음
//   전체 복사 = 말풍선 복사 단추(QuickCopy · 형 11-21 08:05) · PC(마우스) = 메뉴 「복사」 전체 그대로 · 끌어 고르기는 원래 됨

const W = /[\p{L}\p{N}\p{M}_]/u, SP = /\s/, HI = /[\uD800-\uDBFF]/, LO = /[\uDC00-\uDFFF]/;

/** 순수 — 글 한 줄(text)의 i 자리(커서 = i-1 과 i 사이)를 감싼 낱말 [시작, 끝).
 *  낱말 바로 뒤를 눌렀으면 그 낱말 · 빈칸이면 가까운 글자(뒤 먼저) · 기호 · 그림 글자 = 그 한 자 · 빈 글 · 빈칸뿐 = [0, 0] */
export function wordSpan(text: string, i: number): [number, number] {
  const n = text.length;
  if (!n) return [0, 0];
  let k = Math.max(0, Math.min(i, n - 1));
  if (!W.test(text[k]) && k > 0 && W.test(text[k - 1])) k--;
  if (SP.test(text[k])) {
    let f = k; while (f < n && SP.test(text[f])) f++;
    if (f < n) k = f;
    else { let b = k; while (b > 0 && SP.test(text[b])) b--; if (SP.test(text[b])) return [0, 0]; k = b; }
  }
  if (!W.test(text[k])) {
    if (LO.test(text[k]) && k > 0 && HI.test(text[k - 1])) return [k - 1, k + 1];
    return [k, HI.test(text[k]) && k + 1 < n ? k + 2 : k + 1];
  }
  let s = k, e = k + 1;
  while (s > 0 && W.test(text[s - 1])) s--;
  while (e < n && W.test(text[e])) e++;
  return [s, e];
}

type Pt = { x: number; y: number };
/** 그 자리 커서(글자 마디 + 몇째) — 표준(caretPositionFromPoint) 먼저 · 사파리 · 옛 크롬 = caretRangeFromPoint */
function caretAt(p: Pt): { node: Node; offset: number } | null {
  const d = document as Document & { caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null; caretRangeFromPoint?: (x: number, y: number) => Range | null };
  const c = d.caretPositionFromPoint?.(p.x, p.y);
  if (c) return { node: c.offsetNode, offset: c.offset };
  const r = d.caretRangeFromPoint?.(p.x, p.y);
  return r ? { node: r.startContainer, offset: r.startOffset } : null;
}

let off: (() => void) | null = null;
/** 고르던 말풍선을 다시 막음(새로 고르기 전 · 고름이 빌 때) */
export function endPick() { const f = off; off = null; f?.(); }

/** 말풍선 일부 고르기 시작 — id 글의 말풍선(.yb)을 고를 수 있게 풀고 at(길게 누른 자리) 낱말을 골라 둠(손잡이가 뜸)
 *  at 이 글자 위가 아니거나 모르면 = 말풍선 글 전체를 골라 둠(줄여서 씀) · 고를 글자가 없으면(사진 · 스티커만) false → 부른 쪽이 전체 복사
 *  부르기 전에 그 자리를 덮은 판(글 메뉴)은 숨겨 둬야 함(자리 찾기가 맨 위 것을 집음) */
export function startPick(id: string, at: Pt | null): boolean {
  const row = document.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`), yb = row?.querySelector<HTMLElement>(".yb");
  const body = yb?.querySelector<HTMLElement>(".ymd") || yb;
  const sel = window.getSelection();
  if (!yb || !body || !sel || !(body.textContent || "").trim()) return false;
  endPick();
  yb.setAttribute("data-pick", "");   // React 가 안 건드리는 칸(className 은 다시 그릴 때 덮일 수 있음)
  const range = document.createRange(), c = at ? caretAt(at) : null;
  const inText = !!c && c.node.nodeType === Node.TEXT_NODE && yb.contains(c.node) && !c.node.parentElement?.closest("button, .yrx, .yrxs");   // 반응 · 복사 단추 글자는 안 집음
  const [s, e] = inText ? wordSpan(c!.node.textContent || "", c!.offset) : [0, 0];
  if (e > s) { range.setStart(c!.node, s); range.setEnd(c!.node, e); } else range.selectNodeContents(body);
  sel.removeAllRanges(); sel.addRange(range);
  let t = 0;
  const check = () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => {
      const g = window.getSelection();
      if (!yb.isConnected || !g || g.isCollapsed || !g.rangeCount || !g.getRangeAt(0).intersectsNode(yb)) endPick();
    }, 120);   // 손잡이 끄는 동안 잠깐 비는 틈은 넘김
  };
  document.addEventListener("selectionchange", check);
  off = () => { window.clearTimeout(t); document.removeEventListener("selectionchange", check); yb.removeAttribute("data-pick"); };
  return true;
}

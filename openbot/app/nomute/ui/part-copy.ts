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
  const chip = inText ? c!.node.parentElement?.closest<HTMLElement>(CHIP) : null;   // 코드 칩 안 = 칩 통째(「B21B-540E」 가 「B21B」 만 잡히던 것 · R0107)
  const [s, e] = inText && !chip ? wordSpan(c!.node.textContent || "", c!.offset) : [0, 0];
  if (chip) range.selectNodeContents(chip);
  else if (e > s) { range.setStart(c!.node, s); range.setEnd(c!.node, e); } else range.selectNodeContents(body);
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

// ── 코드 칩 한 번 누름 = 칩 글자 통째 복사(형 11-21 21:49 dm-gik 「이거 복사인데 텍스트 선택이 안된다」 · 깃 PM R0107) ──
//   칩 = 봇 말풍선 마크다운 속 `…`(Streamdown 인라인 코드) · 형 말풍선은 칩을 안 그림
//   누르면 = 칩이 잠깐 라임 불 + 칩 위 작은 「복사됨」(화면에 붙은 한 조각 · 접힌 말풍선 틀에 안 잘림) · 1.2초 뒤 제자리
//   안 먹을 때 = 길게 눌러 메뉴가 뜬 뒤 손 뗌 · 그 칩 안에서 글자를 끌어 고르는 중(PC 마우스 끌기 · 폰 손잡이)
export const CHIP = 'code[data-streamdown="inline-code"]';
const HOLD = 1200;

/** 누른 곳이 말풍선 속 코드 칩이면 그 칩 · 아니면 null */
export function chipAt(t: EventTarget | null): HTMLElement | null {
  const el = t instanceof Element ? t.closest<HTMLElement>(CHIP) : null;
  return el?.closest(".yb") ? el : null;
}

/** 순수 — 칩 글자 → 복사할 글(앞뒤 빈칸 · 줄바꿈만 뺌 · 가운데는 그대로) */
export const chipText = (t: string | null | undefined) => String(t || "").replace(/^\s+|\s+$/g, "");

/** 그 칩 안을 끌어 고르는 중인가(고른 글자가 있고 한쪽 끝이 칩 안) */
function picking(chip: HTMLElement) {
  const g = window.getSelection();
  return !!g && !g.isCollapsed && !!g.toString() && (chip.contains(g.anchorNode) || chip.contains(g.focusNode));
}

async function write(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* http · 막힘 = 옛 길 */ }
  const ta = document.createElement("textarea");
  ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand("copy"); } catch { ok = false; }
  ta.remove();
  return ok;
}

let tag: HTMLElement | null = null, tagT = 0;
function flash(chip: HTMLElement) {
  chip.setAttribute("data-copied", "");
  window.setTimeout(() => chip.removeAttribute("data-copied"), HOLD);
  const r = chip.getBoundingClientRect();
  tag?.remove(); window.clearTimeout(tagT);
  tag = document.createElement("span");
  tag.className = "nm-chipok"; tag.setAttribute("role", "status"); tag.textContent = "복사됨";
  tag.style.left = `${Math.round(r.left + r.width / 2)}px`; tag.style.top = `${Math.round(r.top)}px`;
  document.body.appendChild(tag);
  tagT = window.setTimeout(() => { tag?.remove(); tag = null; }, HOLD);
}

/** 말풍선 누름(onClick) 앞에 둠 — 코드 칩이면 복사하고 true(부른 쪽은 거기서 멈춤) · 아니면 false */
export function chipCopy(e: { target: EventTarget | null; stopPropagation: () => void }): boolean {
  const chip = chipAt(e.target);
  if (!chip || picking(chip)) return false;
  const text = chipText(chip.textContent);
  if (!text) return false;
  e.stopPropagation();
  void write(text).then((ok) => { if (ok) flash(chip); });
  return true;
}

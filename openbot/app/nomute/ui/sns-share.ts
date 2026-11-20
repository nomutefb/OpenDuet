// 대화로 보내기 — 집은 SNS 글을 입력칸에 첨부 칩으로 붙임(바로 안 보냄 · 형이 한마디 얹어 보냄 · 미토스 ①)
//   스냅샷 = 입력칸 첨부(원래 붙여넣기 길 그대로 = 칩 · 미리보기 · 빼기 다 있음) · 주소 · @이름 · 캡션 = 이 모듈이 쥐고 있다가 보낼 때 글 끝에 두 줄(./sns-post.ts snsBlock)
//   스냅샷이 없으면(찍기 실패) 두 줄을 입력칸 글로 바로 넣음
import { composerHandle } from "./call-sheet";
import { type SnsPost, shotName, siteOfUrl, snsBlock, snsPostOf } from "./sns-post";
import type { SidePick, SnsSite } from "./sns-side";

const held = new Map<string, SnsPost>();   // 스냅샷 파일 이름(확장자 뺀 것) → 글
const stem = (name: string) => String(name || "").replace(/^.*[/\\]/, "").replace(/\.[^.]+$/, "");

/** 껍데기가 돌려준 집기 → 글(주소 꼬리 뗌 · 글 주소 꼴이 아니면 그 주소 그대로) */
export function pickPost(r: SidePick, site: SnsSite): SnsPost | null {
  if (!r.ok || !r.url) return null;
  const p = snsPostOf(r.url);
  const s = (p?.site || siteOfUrl(r.url) || site) as SnsSite;   // 글 주소가 아니어도 주소의 곳 먼저(맥 비춤 = 고른 곳과 맥 화면이 잠깐 다를 수 있음 · 13:0x 실물)
  let url = p?.url || "";
  if (!url) { try { const u = new URL(r.url); if (u.protocol !== "https:") return null; url = u.origin + u.pathname; } catch { return null; } }
  const author = p?.author || (r.author && /^[\w.]{1,40}$/.test(r.author) ? r.author : undefined);
  return { site: s, url, ...(author ? { author } : {}), ...(r.text && !p?.story ? { text: r.text } : {}), ...(p?.story ? { story: true } : {}) };
}

function dataFile(data: string, name: string): File | null {
  const m = /^data:(image\/[\w+.-]+);base64,(.+)$/.exec(data || "");
  if (!m) return null;
  try { const b = atob(m[2]), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return new File([a], name, { type: m[1] }); } catch { return null; }
}

/** 입력칸에 붙임 · 붙였으면 true */
export function stageSns(post: SnsPost, img?: string): boolean {
  const ed = document.querySelector<HTMLElement>(".nm-cmp-wrap [contenteditable='true']");
  const file = img ? dataFile(img, shotName(post.site)) : null;
  if (ed && file && typeof DataTransfer !== "undefined") {
    try {
      const dt = new DataTransfer();
      dt.items.add(file);
      held.set(stem(file.name), post);
      ed.focus();
      ed.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));   // 입력칸 붙여넣기 길(composer.tsx handlePaste = 그림 + 글 없음 → 첨부)
      return true;
    } catch { held.delete(stem(file.name)); }
  }
  const h = composerHandle();
  if (!h) return false;
  const now = h.getPlainText();
  h.appendText(`${now && !now.endsWith("\n") ? "\n" : ""}${snsBlock(post)}`);
  h.focus();
  return true;
}

/** 보낼 때 = 첨부 이름 중 쥐고 있던 스냅샷이 있으면 그 글들의 두 줄(없으면 "") · 꺼낸 건 놓음 */
export function takeSnsBlocks(names: string[]): string {
  const out: string[] = [];
  for (const n of names) { const k = stem(n), p = held.get(k); if (p) { out.push(snsBlock(p)); held.delete(k); } }
  return out.join("\n");
}
export const heldCount = () => held.size;   // 시험용

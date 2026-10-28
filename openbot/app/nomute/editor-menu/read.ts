// 에디터 메뉴 정본 읽기 — 에디터 첫 화면(edit.nomute.kr/ · nomutefb/editor viewer/index.html)의 아래 네비(#bnav)와 ＋ 제작 도구 펼침(#bpop) 마크업을 그대로 읽는다
//   (형 10-28 12:23 「할일에 에디터 메뉴를 넣어주라.」 → 12:24 네비 넷째 칸 「에디터」 판 · 이름·차례·아이콘·설명 = 그 마크업 그대로 = 에디터 메뉴가 바뀌면 같이 바뀜 · 새로 짜기 0)
//   받기 = 첫 화면을 흘려 받다가 메뉴 줄 끝(.rad-scrim)에서 끊음(파일 앞 약 1/3 · 2.9MB 통째로 안 받음) · 하루 한 번 · 그 사이 = 이 기기에 적어 둔 것.
export type EdItem = { kind: "tab" | "act"; key: string; label: string; desc: string; icon: string };
export type EdMenu = { tabs: EdItem[]; tools: EdItem[]; toolsLabel: string; at: number };

const CACHE = "nm_editor_menu", DAY = 864e5, END = 'class="rad-scrim"';

export function cachedMenu(): EdMenu | undefined {
  try { const j = JSON.parse(localStorage.getItem(CACHE) || "null"); return j && Array.isArray(j.tabs) && Array.isArray(j.tools) ? j : undefined; } catch { return undefined; }
}
export const menuFresh = (m?: EdMenu) => !!m && Date.now() - m.at < DAY;

export function parseMenu(html: string): EdMenu {
  const i = html.indexOf('<nav class="bnav"'), j = html.indexOf(END, i);
  if (i < 0 || j < 0) throw new Error("에디터 첫 화면에서 메뉴 줄을 못 찾음");
  const doc = new DOMParser().parseFromString(html.slice(i, j), "text/html");
  const text = (el: Element | null) => (el?.textContent || "").replace(/\s+/g, " ").trim();
  const tabs = [...doc.querySelectorAll("#bnav .bnav-i[data-tab]")].map((b): EdItem => {
    const vis = b.cloneNode(true) as Element;
    vis.querySelectorAll(".qbadge").forEach((x) => x.remove());   // 뉴스 요약 대기열 배지 = 메뉴 이름 아님
    const label = text(vis), aria = b.getAttribute("aria-label") || "";
    return { kind: "tab", key: b.getAttribute("data-tab") || "", label, desc: aria && aria !== label ? aria : "", icon: "" };
  });
  const tools = [...doc.querySelectorAll("#bpop .raditem[data-act]")].filter((b) => !b.hasAttribute("hidden")).map((b): EdItem => {
    const label = text(b.querySelector(".radlab")), aria = b.getAttribute("aria-label") || "";
    return { kind: "act", key: b.getAttribute("data-act") || "", label, desc: aria && aria !== label ? aria : "", icon: b.querySelector("svg")?.outerHTML || "" };
  });
  const toolsLabel = doc.querySelector("#bnav .bnav-fab")?.getAttribute("aria-label") || "";
  if (!tabs.length) throw new Error("에디터 메뉴 칸이 0개");
  return { tabs, tools, toolsLabel, at: Date.now() };
}

export async function readMenu(): Promise<EdMenu> {
  const r = await fetch("/", { credentials: "same-origin", cache: "no-cache", redirect: "manual" });
  if (r.type === "opaqueredirect" || r.status === 401 || r.status === 403) throw new Error("로그인이 끝났어 — 새로 고쳐 다시 로그인");
  if (!r.ok || !r.body) throw new Error(`에디터 첫 화면을 못 받음(HTTP ${r.status})`);
  const rd = r.body.getReader(), dec = new TextDecoder();
  let html = "";
  for (;;) {
    const { done, value } = await rd.read();
    if (value) html += dec.decode(value, { stream: true });
    if (done || html.indexOf(END, html.indexOf('<nav class="bnav"')) > 0) break;
  }
  void rd.cancel().catch(() => {});
  const m = parseMenu(html);
  try { localStorage.setItem(CACHE, JSON.stringify(m)); } catch { /* 적어 두기 못 해도 지금 판은 그림 */ }
  return m;
}

/** 누르면 갈 에디터 주소 — 네비 칸 = `/?tab=` 딥링크(에디터 정본 문법 · 마지막 탭 복원을 이김) · ＋ 칸 = `/?tool=<data-act>`(에디터 49 조각 · ?act= 는 알림 새 창 표식이라 못 씀) */
export const linkOf = (x: EdItem) => (x.kind === "tab" ? `/?tab=${encodeURIComponent(x.key)}` : `/?tool=${encodeURIComponent(x.key)}`);

// 우상단 판 번호(형 11-06 13:07 「새버전이잇어요 누르는데 이러네, 버전 번호가 항상 우상단에 뜨게해야겟다」 · 「그거로 싱크를 맞춰야될거같은데?」)
//   = 이 화면이 도는 판(커밋 짧은 번호 · 빌드 시각 KST) · 올라간 판(version.json)과 다르면 라임으로 「→ 새 판 번호」 · 누르면 「새 버전이 있어요」와 같은 길(쓰던 글·보내는 중 글 지킴)
import "./ver-badge.css";

let el: HTMLButtonElement | null = null;
let mine = { build: "", sha: "" };
let onStale: (() => void) | null = null;

const kst = (iso: string) => {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const d = new Date(t + 9 * 3600_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
};
const label = (b: { build?: string; sha?: string }) => [b.sha || "", kst(b.build || "")].filter(Boolean).join(" · ") || "판 번호 없음";

/** 처음 한 번 — 이 화면 판을 우상단에 */
export function verBadge(build: string, sha: string, onClick: () => void) {
  mine = { build, sha };
  onStale = onClick;
  if (el) return;
  el = document.createElement("button");
  el.type = "button";
  el.className = "nm-ver";
  el.textContent = label(mine);
  el.title = `지금 화면 판 = ${label(mine)}`;
  el.addEventListener("click", () => { if (el?.classList.contains("stale")) onStale?.(); });
  const put = () => document.body.appendChild(el as HTMLButtonElement);
  if (document.body) put(); else window.addEventListener("DOMContentLoaded", put, { once: true });
}

/** version.json 받을 때마다 — 다르면 라임 「지금 → 새」 */
export function markLive(live: { build?: string; sha?: string }) {
  if (!el || !live.build) return;
  const stale = live.build !== mine.build;
  el.classList.toggle("stale", stale);
  el.textContent = stale ? `${mine.sha || kst(mine.build)} → ${live.sha || kst(live.build)} 새 판` : label(mine);
  el.title = stale ? `이 화면 = ${label(mine)} · 올라간 판 = ${label(live)} · 누르면 새 판으로` : `지금 화면 판 = ${label(mine)} · 올라간 판과 같음`;
}

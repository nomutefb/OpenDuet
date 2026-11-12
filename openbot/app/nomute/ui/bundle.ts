// 촉 1:1 요약 묶음 글(러너 → dm-chok · 깃 11-12 19:34 꼴) 읽기 — 첫 줄 `[묶음 <요약 stem>]` · 줄 이름이 열쇠:
//   제목: … / 요약: + 「- 」 줄들 / 캡션:(여러 줄 · 다음 「주소:」 앞까지 = 복사 칸) / 주소: https… / 그림: https…(없으면 줄 0) / 사진: 매체 · 크레딧
//   단추 「올림 · 넘김」 = ./bundle-card.tsx · 누름 = POST /api/office/hyung-pick(형만 · 서버 _hyungpick.js · 봄 11-12 19:22)
export type Bundle = { stem: string; title: string; sums: string[]; caption: string; url: string; img: string; credit: string };
const HEAD = /^\s*\[묶음\s+([^\]\s]+)\]\s*$/;
export const isBundleText = (t: unknown) => HEAD.test(String(t || "").split("\n", 1)[0]);
export function parseBundle(t0: unknown): Bundle | null {
  const lines = String(t0 || "").replace(/\r/g, "").split("\n");
  const m = HEAD.exec(lines[0] || "");
  if (!m) return null;
  const b: Bundle = { stem: m[1], title: "", sums: [], caption: "", url: "", img: "", credit: "" };
  let at: "" | "sum" | "cap" = "";
  const cap: string[] = [];
  for (const ln of lines.slice(1)) {
    const k = /^(제목|요약|캡션|주소|그림|사진):\s?(.*)$/.exec(ln);
    if (k && !(at === "cap" && k[1] !== "주소" && k[1] !== "그림" && k[1] !== "사진")) {
      const v = k[2].trim();
      at = "";
      if (k[1] === "제목") b.title = v;
      else if (k[1] === "요약") { at = "sum"; if (v) b.sums.push(v.replace(/^-\s*/, "")); }
      else if (k[1] === "캡션") { at = "cap"; if (v) cap.push(k[2]); }
      else if (k[1] === "주소") b.url = /^https?:\/\//i.test(v) ? v : "";
      else if (k[1] === "그림") b.img = /^https:\/\//i.test(v) ? v : "";
      else if (k[1] === "사진") b.credit = v;
      continue;
    }
    if (at === "sum") { const v = ln.trim().replace(/^[-•·]\s*/, ""); if (v) b.sums.push(v); }
    else if (at === "cap") cap.push(ln);
  }
  b.caption = cap.join("\n").replace(/^\n+|\n+$/g, "");
  return b;
}

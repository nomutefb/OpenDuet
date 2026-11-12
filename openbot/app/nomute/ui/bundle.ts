// 촉 1:1 요약 묶음 글(러너 → dm-chok) 읽기 — 첫 줄 `[묶음 <요약 stem>]` · 줄 이름이 열쇠
//   새 꼴(깃 11-13 02:52 · 형 02:51 「개요 / 줄바꿈 / IG / MARKDOWN / TH / MARKDOWN / 썸네일 찾기 추천」):
//     제목: … / 개요: + 줄들(셋까지) / IG: + ```text 덩어리``` / TH: + ```text 덩어리``` / 썸네일 찾기: + 「- 검색어: 한글 · 영문」 「- 구글 이미지: 주소」 「- 그림: 주소」 「- 사진: 매체 · 크레딧」 / 주소: 원 기사
//   옛 꼴(11-12 19:34)도 읽음: 요약: + 「- 」 줄 · 캡션:(~주소: 앞) · 그림: · 사진:
//   단추 「올림 · 넘김」 = ./bundle-card.tsx · 누름 = POST /api/office/hyung-pick(형만 · 봄 11-12 19:22)
export type Bundle = { stem: string; title: string; sums: string[]; ig: string; th: string; caption: string; url: string; img: string; credit: string; terms: string[]; gimg: string };
const HEAD = /^\s*\[묶음\s+([^\]\s]+)\]\s*$/;
const KEY = /^(제목|요약|개요|캡션|IG|TH|썸네일 찾기|주소|그림|사진):\s?(.*)$/;
const SUB = /^\s*[-•·]\s*(검색어|구글 이미지|그림|사진):\s*(.*)$/;
export const isBundleText = (t: unknown) => HEAD.test(String(t || "").split("\n", 1)[0]);
const https = (v: string) => (/^https:\/\//i.test(v) ? v : "");
export function parseBundle(t0: unknown): Bundle | null {
  const lines = String(t0 || "").replace(/\r/g, "").split("\n");
  const m = HEAD.exec(lines[0] || "");
  if (!m) return null;
  const b: Bundle = { stem: m[1], title: "", sums: [], ig: "", th: "", caption: "", url: "", img: "", credit: "", terms: [], gimg: "" };
  let at: "" | "sum" | "cap" | "ig" | "th" | "thumb" = "", fence = false;
  const buf: Record<"cap" | "ig" | "th", string[]> = { cap: [], ig: [], th: [] };
  const sub = (k: string, v: string) => {
    if (k === "검색어") b.terms.push(...v.split(/\s*·\s*/).map((x) => x.trim()).filter(Boolean));
    else if (k === "구글 이미지") b.gimg = /^https?:\/\//i.test(v) ? v : "";
    else if (k === "그림") b.img = https(v);
    else if (k === "사진") b.credit = v;
  };
  for (const ln of lines.slice(1)) {
    if ((at === "ig" || at === "th") && /^\s*```/.test(ln)) { fence = !fence; continue; }
    if (fence && (at === "ig" || at === "th")) { buf[at].push(ln); continue; }
    const k = KEY.exec(ln);
    if (k && !(at === "cap" && !["주소", "그림", "사진", "IG", "TH", "썸네일 찾기"].includes(k[1]))) {
      const v = k[2].trim();
      at = "";
      if (k[1] === "제목") b.title = v;
      else if (k[1] === "요약" || k[1] === "개요") { at = "sum"; if (v) b.sums.push(v.replace(/^-\s*/, "")); }
      else if (k[1] === "캡션") { at = "cap"; if (v) buf.cap.push(k[2]); }
      else if (k[1] === "IG") { at = "ig"; if (v && !/^```/.test(v)) buf.ig.push(v); else if (/^```/.test(v)) fence = true; }
      else if (k[1] === "TH") { at = "th"; if (v && !/^```/.test(v)) buf.th.push(v); else if (/^```/.test(v)) fence = true; }
      else if (k[1] === "썸네일 찾기") at = "thumb";
      else if (k[1] === "주소") b.url = /^https?:\/\//i.test(v) ? v : "";
      else sub(k[1], v);
      continue;
    }
    if (at === "thumb") { const s = SUB.exec(ln); if (s) sub(s[1], s[2].trim()); continue; }
    if (at === "sum") { const v = ln.trim().replace(/^[-•·]\s*/, ""); if (v) b.sums.push(v); }
    else if (at === "cap" || at === "ig" || at === "th") buf[at].push(ln);
  }
  const trim = (a: string[]) => a.join("\n").replace(/^\n+|\n+$/g, "");
  b.caption = trim(buf.cap); b.ig = trim(buf.ig) || b.caption; b.th = trim(buf.th);
  b.sums = b.sums.slice(0, 3);
  return b;
}

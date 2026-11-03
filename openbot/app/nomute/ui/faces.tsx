// 우리 얼굴 — 명부(/api/office/people)의 얼굴 그림(/office/*.webp) · 없으면 이름 첫 글자 동그라미
// 원본의 구슬(mic-orb · OpenDuet 얼굴)은 화면에 0(형 10-28 05:04 「오픈 듀엣 구슬 얼굴등은 우리가 야무지게 만들면돼」 = 1단계 우리 얼굴 그림)
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HYUNG_ID, WINTER_ID, idOf, people } from "../data/office";

export function usePeople() {
  return useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
}

// 투명 배경 얼굴 = 뒤가 비침 → 얼굴 그림을 한 번 작게 그려 보고, 비침이 있으면 얼굴 색의 맞은편 색조를 낮은 채도·바탕 밝기로 깔아 줌(형 11-03 12:53 「프로필 배경이 투명할 경우, 뒤에가 보이는 이슈가 있는데 이럴경우, 메인 피사체와 구분되는 색으로 백그라운드가 자동으로 들어가게 해줘. 흰색 말고(배경이 튀면 또 안되니까)」)
const faceBg = new Map<string, string | null>();
function useFaceBg(src: string) {
  const dark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const key = src + (dark ? "|d" : "|l");
  const [bg, setBg] = useState<string | null | undefined>(() => faceBg.get(key));
  useEffect(() => {
    if (!src || faceBg.has(key)) { setBg(faceBg.get(key)); return; }
    const im = new Image();
    im.onload = () => {
      let out: string | null = null;
      try {
        const N = 24, c = document.createElement("canvas"); c.width = c.height = N;
        const g = c.getContext("2d", { willReadFrequently: true }); if (!g) return;
        g.drawImage(im, 0, 0, N, N);
        const d = g.getImageData(0, 0, N, N).data;
        let clear = 0, r = 0, gg = 0, b = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 200) clear++; else { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; } }
        if (clear / (N * N) > 0.03 && n) {   // 비침 3% 넘음 = 배경 깔기
          r /= n * 255; gg /= n * 255; b /= n * 255;
          const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
          let h = 0; if (mx !== mn) { const dd = mx - mn; h = mx === r ? ((gg - b) / dd) % 6 : mx === gg ? (b - r) / dd + 2 : (r - gg) / dd + 4; h *= 60; }
          const L = (mx + mn) / 2, bgL = dark ? (L < 0.45 ? 58 : 26) : (L < 0.6 ? 84 : 64);   // 밝기 = 얼굴 반대쪽(회색처럼 색조 없는 얼굴도 갈라짐 · 모루)
          out = `hsl(${Math.round((h + 180 + 360) % 360)} 22% ${bgL}%)`;   // 맞은편 색조 · 채도 낮게(튀지 않게 · 흰색 아님)
        }
      } catch { out = null; }
      faceBg.set(key, out); setBg(out);
    };
    im.onerror = () => { faceBg.set(key, null); setBg(null); };
    im.src = src;
  }, [src, key]);
  return bg || undefined;
}

export function FaceImg({ id, size = 32, className = "" }: { id: string; size?: number; className?: string }) {
  const list = usePeople();
  const p = id === HYUNG_ID ? list.find((x) => x.who === "형") : list.find((x) => idOf(x.who, list) === id || x.who === id);
  const name = p ? p.name || p.who : id;
  const src = p?.face || (id === WINTER_ID ? "/office/winter.jpg" : "");
  const bg = useFaceBg(src);
  return src ? (
    <img src={src} alt={name} width={size} height={size} draggable={false} className={`block shrink-0 rounded-full object-cover ${className}`} style={{ width: size, height: size, background: bg }} />
  ) : (
    <span role="img" aria-label={name} className={`grid shrink-0 place-items-center rounded-full bg-muted font-semibold text-muted-foreground ${className}`} style={{ width: size, height: size, fontSize: size * 0.45 }}>
      {[...name][0] || "?"}
    </span>
  );
}

/** 겹친 얼굴(접힌 줄 · 단체방) — 왼쪽부터 겹침 30% */
export function FaceStack({ ids, size = 18 }: { ids: string[]; size?: number }) {
  return (
    <span className="inline-flex items-center">
      {ids.map((id, i) => (
        <span key={id} className="rounded-full ring-2 ring-background" style={{ marginLeft: i ? -size * 0.3 : 0 }}>
          <FaceImg id={id} size={size} />
        </span>
      ))}
    </span>
  );
}

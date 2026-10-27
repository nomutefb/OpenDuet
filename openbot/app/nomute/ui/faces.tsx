// 우리 얼굴 — 명부(/api/office/people)의 얼굴 그림(/office/*.webp) · 없으면 이름 첫 글자 동그라미
// 원본의 구슬(mic-orb · OpenDuet 얼굴)은 화면에 0(형 10-28 05:04 「오픈 듀엣 구슬 얼굴등은 우리가 야무지게 만들면돼」 = 1단계 우리 얼굴 그림)
import { useQuery } from "@tanstack/react-query";
import { HYUNG_ID, WINTER_ID, idOf, people } from "../data/office";

export function usePeople() {
  return useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
}

export function FaceImg({ id, size = 32, className = "" }: { id: string; size?: number; className?: string }) {
  const list = usePeople();
  const p = id === HYUNG_ID ? list.find((x) => x.who === "형") : list.find((x) => idOf(x.who, list) === id || x.who === id);
  const name = p ? p.name || p.who : id;
  const src = p?.face || (id === WINTER_ID ? "/office/winter.jpg" : "");
  return src ? (
    <img src={src} alt={name} width={size} height={size} draggable={false} className={`block shrink-0 rounded-full object-cover ${className}`} style={{ width: size, height: size }} />
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

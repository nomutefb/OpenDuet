// 형 결정 대기 알약 줄 — 입력칸 바로 위(형 11-07 09:55 「채팅 바로 위에 … 나한테 호출한게 누적이 되면 좋을거같아」 · 09:56 「알약형태로 이렇게 누적이되가지고」)
//   알약 하나 = 형을 부른 글 하나(쓴 이 얼굴 · 이름 · 첫 줄) · 오래된 것부터 왼쪽 · 누르면 그 글로 부드럽게 올라가 반짝 + 답장 칸이 그 글로 열림(09:56 「내가 누르면 그 창으로 바로 이동하는데 이징」 · 봄 09:40 「그냥 내가 답장하면 그게 그 질의했던 사람에게 바로 가게끔」)
//   형이 그 글에 답장하면 알약이 빠짐 · 셈 = 서버 pending_ids(뜸 · 있으면 그대로) · 없으면 화면에서 직접(형 아닌 이 글의 부름에 형·세웅 · 형 답장 = reply_to 또는 「↩ 이름: 첫 줄」)
import { FaceImg } from "./faces";

export type HyungPill = { id: string; who: string; face: string; name: string; line: string };

type M = { id: string; who?: string; kind?: string; text?: string; reply_to?: string; mention?: string[]; urgent?: string[] };
const HY = new Set(["형", "세웅"]);
const calls = (m: M) => m.kind !== "human" && [...(m.mention || []), ...(m.urgent || [])].some((n) => HY.has(n));

/** 대기 글 id(오래된 것부터) — 서버 칸이 있으면 그것 · 없으면 받은 글 안에서 셈 */
export function pendingOf<T extends M>(all: T[], server: unknown, quoteOf: (m: T) => string): T[] {
  const byId = new Map(all.map((m) => [m.id, m] as const));
  if (Array.isArray(server)) return server.map((id) => byId.get(String(id))).filter((m): m is T => !!m);
  const answered = new Set<string>(), quotes = new Set<string>();
  for (const m of all) if (m.kind === "human") { if (m.reply_to) answered.add(m.reply_to); const q = /^↩ (.+)$/.exec(String(m.text || "").split("\n")[0]); if (q) quotes.add(q[1].trim()); }
  return all.filter((m) => calls(m) && !answered.has(m.id) && !quotes.has(quoteOf(m)));
}

export function HyungPills({ items, onPick, active }: { items: HyungPill[]; onPick: (id: string) => void; active?: string }) {
  if (!items.length) return null;
  return (
    <div className="yhy" role="list" aria-label={`형 결정 기다리는 글 ${items.length}개`}>
      {items.map((p) => (
        <button key={p.id} type="button" role="listitem" className={`yhy-p${active === p.id ? " on" : ""}`} title={`${p.name} · ${p.line}`}
          onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(p.id)}>
          <FaceImg id={p.face} size={20} />
          <b>{p.name}</b>
          <span>{p.line}</span>
        </button>
      ))}
    </div>
  );
}

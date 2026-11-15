// CLI 계정 우선순위 카드 다발의 셈(순수 · 화면 = ./acct-prio.tsx · 시험 = ../tests/acct-prio.test.ts)
//   형 11-16 03:0x 클라우드 세션(영상 962a3255 「Switching cards」): 「내 계정 cli 4개인가 3개 카드도 이런식으로 고프레임.유지해서 우선순위 설정하는 모듈」 · 「실제러 그렇게 반영되게」 · 「각각 카드에 기한 갱신일 한도 나오면 됨 요금제랑」
//   재료 = 작동 표 「계정 상태」 줄(GET status 의 cats acct · 정본 계정 표의 요금제 · 결제 끝 + 몸이 보고한 남은 % · 다시 차는 때 · 봄 03:01 「둘을 합쳐 보여 줘」)
//   차례 = 서버 profile/acctprio(앞 = 1순위) · 계정 교대 도구가 다음 계정을 고를 때 이 차례를 먼저 봄
import { leftKo, payEndAt } from "../data/acct-time.ts";

export type AcctRow = {
  key: string; name: string; value?: string; kind?: string; plan?: string; left_pct?: number; next_at?: number; week_reset?: string; pay_end?: string;
  names?: string[]; no?: number; note?: string; cells?: Record<string, { left_pct?: number; reset_at?: number } | undefined>;
};
export type PrioCard = {
  mail: string; name: string; no: number; plan: string;
  d7: number | null; h5: number | null;   // 한도 = 7일 · 5시간 남은 %(못 읽으면 null)
  resetAt: number; reset: string;   // 갱신일 = 7일 창이 다시 차는 때(ms) · 「목 18:59」
  payEnd: string; ended: boolean;   // 기한 = 결제 끝 날(없으면 "") · 지났나
  users: string[];   // 지금 이 계정으로 열려 있는 창
};

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** 「계정 상태」 줄 → 카드 재료(클로드 계정만 · 번호 차례). */
export function cardsOf(rows: AcctRow[], now = Date.now()): PrioCard[] {
  return rows
    .filter((r) => (r.kind || (r.key.startsWith("claude:") ? "claude" : "")) === "claude" && !!(r.value || r.key.slice(7)))
    .map((r) => {
      const mail = String(r.value || r.key.slice(7)).toLowerCase(), end = payEndAt(r.pay_end);
      const d7 = num(r.cells?.["7일"]?.left_pct) ?? num(r.left_pct), resetAt = num(r.cells?.["7일"]?.reset_at) ?? num(r.next_at) ?? 0;
      return { mail, name: r.name || mail.split("@")[0], no: num(r.no) ?? 99, plan: r.plan || "", d7, h5: num(r.cells?.["5시간"]?.left_pct), resetAt, reset: r.week_reset || "", payEnd: r.pay_end || "", ended: end !== undefined && end <= now, users: Array.isArray(r.names) ? r.names : [] };
    })
    .sort((a, b) => a.no - b.no || a.mail.localeCompare(b.mail));
}

/** 그릴 차례 = 고른 차례(표에 있는 계정만) 먼저 → 안 고른 계정은 번호 차례로 뒤에. */
export function orderOf(cards: PrioCard[], saved: string[]): string[] {
  const have = new Set(cards.map((c) => c.mail)), front = saved.map((m) => m.toLowerCase()).filter((m, i, a) => have.has(m) && a.indexOf(m) === i);
  return [...front, ...cards.map((c) => c.mail).filter((m) => !front.includes(m))];
}
/** 앞 카드를 맨 뒤로(끌어 넘김 · ›). */
export const toBack = (order: string[]): string[] => (order.length < 2 ? order : [...order.slice(1), order[0]]);
/** 맨 뒤 카드를 앞으로(‹). */
export const lastToFront = (order: string[]): string[] => (order.length < 2 ? order : [order[order.length - 1], ...order.slice(0, -1)]);
/** 그 카드를 맨 앞으로(뒤 카드 누름 = 1순위로) · 나머지 차례는 그대로. */
export const toFront = (order: string[], mail: string): string[] => (order.includes(mail) ? [mail, ...order.filter((m) => m !== mail)] : order);
export const sameOrder = (a: string[], b: string[]) => a.length === b.length && a.every((m, i) => m === b[i]);

/** 메일 가리기 = 앞 세 글자만(「ems•••@gmail.com」). */
export const maskMail = (m: string) => { const [u, d] = m.split("@"); return `${u.slice(0, 3)}•••@${d || ""}`; };
/** 기한 글 = 「11-10」 · 지났으면 「끝남」 · 없으면 「—」. */
export const payKo = (c: Pick<PrioCard, "payEnd" | "ended">) => (!c.payEnd ? "—" : c.ended ? "끝남" : c.payEnd.slice(5));
/** 갱신일 글 = 「목 18:59」(없으면 남은 시간 · 그것도 없으면 「—」). */
export const resetKo = (c: Pick<PrioCard, "reset" | "resetAt">, now = Date.now()) => c.reset || (leftKo(c.resetAt || undefined, now) ? `${leftKo(c.resetAt, now)} 뒤` : "—");
/** 한도 색 갈래 = 10% 밑 low · 30% 밑 mid(계정 전환 카드와 같은 문턱). */
export const tone = (v: number | null): "low" | "mid" | "ok" | "none" => (v === null ? "none" : v < 10 ? "low" : v < 30 ? "mid" : "ok");
/** 교대 도구가 고를 수 있는 계정인가(결제 끝 아님 · 7일 값 있음 · 5시간 20% 이상 — tools/몸이사/18-계정-교대.py pick 과 같은 조건). */
export const usable = (c: PrioCard) => !c.ended && c.d7 !== null && (c.h5 === null || c.h5 >= 20);

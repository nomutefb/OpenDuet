// 답글 띠 — 답글을 단 말풍선 바로 위에 맞닿는 띠 하나(너비 = 그 말풍선) · 띠 색 = 답한 상대의 말풍선 색 · 맨 앞 = 그 사람 얼굴 조각(부름 칩의 그 얼굴) · 기울인 작은 글 「답글 : 옮긴 한 줄 …」(번개 11-11)
//   형 11-11 20:08 ~ 20:13 봄 1:1(봄이 옮김 · 봄비 1794395523588 · 1794395613470 · 사진 claude/bom/office_files/20261111_2008_98046 · 2011_98050):
//   「답글로 빠르 이런식으로 갈때는 / 답글이 대화창 위에 붙게해주고 / 답한 상대 얼굴이 말풍선 가장 앞에 위치한 후에 글이 오게해줘」 · 「답글 : 으로 나오면 충분하고 / 누군지가 명확해냐되니까 단톡에서도」 ·
//   「답장한 상대의 시그니처 말풍선 색 나한테 보이는 색이 따라가게할게」 · 「말풍선 앞에 @ 해서 하면 나오는 그 얼굴 그게 보이게」 · 「그 안래는 이탤릭체로 조금 작게 답글 : 어쩌고 ...」 · 「이 답글 앞에 그 ( 로 강조 선 나오는건 없어도 돼」
//   형 사진(20:08)의 그 자리 = 「보냄 대기」 말풍선이 「↩ 빠르: …」 줄을 글 안에 그대로 보임(./attachment-recovery.tsx Waiting) → 거기도 같은 띠 · 글에선 그 줄을 뺌.
//   앞 판 = 말풍선 위 따로 뜬 칩(왼쪽 세로 강조 선 · 「이름 · 첫 줄」 · office-chat.tsx Quote). 누르면 그 글로(onJump 를 준 자리만).
import type { CSSProperties } from "react";
import { type OfficePerson, idOf, peopleSync } from "../data/office";
import { FaceImg } from "./faces";

/** 띠 글자색 = 배경 밝기로(./color-pick.tsx inkOn 과 같은 셈 — 그 파일은 색 고르기 판 부품을 끌고 와서 보냄 대기 말풍선 쪽 시험 묶음이 못 삼킴) */
const inkOn = (hex: string) => { const t = String(hex || ""); if (!/^#?[0-9a-f]{6}$/i.test(t)) return "#FFFFFF"; const c = [0, 2, 4].map((i) => parseInt(t.replace("#", "").slice(i, i + 2), 16)); return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] > 150 ? "#161716" : "#FFFFFF"; };

/** 답장 글 첫 줄 「↩ 이름: 그 글 첫 줄」(서버 0 · 옛 화면과 같은 꼴) */
export const QUOTE = /^↩ ([^:\n]{1,24}): ([^\n]*)(?:\n|$)/;

export function ReplyStrip({ text, list, onJump }: { text: string; list?: OfficePerson[]; onJump?: (who: string, line: string) => void }) {
  const q = String(text || "").match(QUOTE);
  if (!q) return null;
  const who = q[1].trim(), hy = who === "형" || who === "세웅";
  const p = (list || peopleSync()).find((x) => (hy ? x.who === "형" : x.who === who || x.name === who || (x.aka || []).includes(who)));
  const tone: CSSProperties | undefined = hy ? { background: "var(--bubble-me)", color: "var(--bg)" } : p?.bubble ? { background: p.bubble, color: inkOn(p.bubble) } : undefined;   // 색 칸 없는 이 = 기본 말풍선 색(.yrq)
  return (
    <button type="button" className="yrq" style={tone} title={onJump ? "그 글로" : undefined} onClick={onJump ? () => onJump(q[1], q[2]) : undefined}>
      {p?.face ? <FaceImg id={idOf(p.who)} size={16} /> : p?.mark ? <span aria-hidden>{p.mark}</span> : null}
      <i>답글 : {q[2]}</i>
    </button>
  );
}

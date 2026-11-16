// 촉 방 「요약」 단추 — 촉이 물어온 글(그록 촉 글 · 러너 「[촉] 속보」 글 · 기사 주소가 든 것)을 형이 그 자리에서 골라 바로 요약 접수(뎅 11-13)
import "./ask-pick.css";
//   형 11-13 02:45 봄 1:1(봄 옮김): 「그리고 아까 이거말한거는 물어온걸 내가 골라 선택하면 바로 요약도 되나싶어서」 · 「웅. 항상 이렇다는건 아닌데. 핵심은 1이야」(1 = 촉이 골라다 줌) · 「뒤에는 유동적」
//   · 02:46 「물고오면 그 자료를 러너가 찾기. 기존 에디터에 이미 배선되어잇어.」 = 옛 에디터 「요약 요청」 길 그대로(POST /api/submit {text, link?} → 러너 ask.sh 「자연어 text … 제일 메이저 기사를 WebSearch로 찾아(또는 본문 URL)」)
//   차례 = 촉이 물어옴 → 형이 「요약」 → 촉 글 통째(주소 있으면 link 로 같이 · 외신이면 fp 저절로 · ../home/quick-send.ts submitText) → 러너가 자료 찾아 요약 → 끝나면 지금처럼 묶음 카드(./bundle-card.tsx 「올림 · 넘김」 = 시아 · 겹침 0)
//   다는 글 = 촉 방 · 첨부 없음 · 기사 주소가 있거나 러너 「[촉]」 글(촉 잡담엔 안 닮)
//   두 번 눌러도 한 번 = 이 기기에 글 id 마다 접수 id 를 적어 둠(nm-chok-ask) · 다시 열어도 「접수됨」
//   단추 = 게이지 알약(./go-button.tsx GoButton · 옛 에디터 · 이미지 에디터 전송 단추 그대로) · 누름 → 게이지 차오름 → ✓ → 「✓ 접수됨」으로 남음 · 자리 = 말풍선 오른쪽 아래
//     형 11-17 01:20 dm-issueking(슈왕 옮김) 「요약 누르면 게이지 진행되거 체크 되고 접수됨으로 이미지 에디터에 잇는 버튼으로 대체시켜 달라구해. 그리구 말풍선 우하단에 잇는게 맞다구 해주고」
import { useState } from "react";
import { presetFor, submitText } from "../home/quick-send";
import { GoButton } from "./go-button";
export { askPickOf } from "./ask-pick-logic";

const KEY = "nm-chok-ask";
const load = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { return {}; } };
const save = (id: string, v: string) => { try { const m = load(); m[id] = v; const ks = Object.keys(m); for (const k of ks.slice(0, Math.max(0, ks.length - 300))) delete m[k]; localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* 못 적으면 이번 화면만 */ } };

export function AskPick({ id, text, url }: { id: string; text: string; url: string }) {
  const [ok, setOk] = useState(() => load()[id] !== undefined);
  if (ok) return <span className="nm-askpick ok" role="status" aria-label="요약 접수됨" title="요약 대기열에 들어갔어"><svg viewBox="0 0 16 16" aria-hidden><path d="M3.2 8.6l3 3 6.6-7" /></svg>접수됨</span>;
  return (
    <GoButton className="nm-askpick" go={async () => { const r = await submitText(text, url, presetFor(url)); save(id, r); return r; }} done={() => setOk(true)}
      busy="요약 거는 중" label="이 기사 요약 걸기" hint="이 기사로 바로 요약 요청">요약</GoButton>
  );
}

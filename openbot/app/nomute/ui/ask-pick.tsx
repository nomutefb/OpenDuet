// 촉 방 「요약」 단추 — 촉이 물어온 글(그록 촉 글 · 러너 「[촉] 속보」 글 · 기사 주소가 든 것)을 형이 그 자리에서 골라 바로 요약 접수(뎅 11-13)
import "./ask-pick.css";
//   형 11-13 02:45 봄 1:1(봄 옮김): 「그리고 아까 이거말한거는 물어온걸 내가 골라 선택하면 바로 요약도 되나싶어서」 · 「웅. 항상 이렇다는건 아닌데. 핵심은 1이야」(1 = 촉이 골라다 줌) · 「뒤에는 유동적」
//   · 02:46 「물고오면 그 자료를 러너가 찾기. 기존 에디터에 이미 배선되어잇어.」 = 옛 에디터 「요약 요청」 길 그대로(POST /api/submit {text, link?} → 러너 ask.sh 「자연어 text … 제일 메이저 기사를 WebSearch로 찾아(또는 본문 URL)」)
//   차례 = 촉이 물어옴 → 형이 「요약」 → 촉 글 통째(주소 있으면 link 로 같이 · 외신이면 fp 저절로 · ../home/quick-send.ts submitText) → 러너가 자료 찾아 요약 → 끝나면 지금처럼 묶음 카드(./bundle-card.tsx 「올림 · 넘김」 = 시아 · 겹침 0)
//   다는 글 = 촉 방 · 첨부 없음 · 기사 주소가 있거나 러너 「[촉]」 글(촉 잡담엔 안 닮)
//   두 번 눌러도 한 번 = 이 기기에 글 id 마다 접수 id 를 적어 둠(nm-chok-ask) · 다시 열어도 「접수됨」
import { useState } from "react";
import { presetFor, submitText } from "../home/quick-send";
export { askPickOf } from "./ask-pick-logic";

const KEY = "nm-chok-ask";
const load = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { return {}; } };
const save = (id: string, v: string) => { try { const m = load(); m[id] = v; const ks = Object.keys(m); for (const k of ks.slice(0, Math.max(0, ks.length - 300))) delete m[k]; localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* 못 적으면 이번 화면만 */ } };

export function AskPick({ id, text, url }: { id: string; text: string; url: string }) {
  const [st, setSt] = useState<"" | "run" | "ok" | "err">(() => (load()[id] !== undefined ? "ok" : ""));
  const [why, setWhy] = useState("");
  const go = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (st === "run" || st === "ok") return;
    setSt("run"); setWhy("");
    try { save(id, await submitText(text, url, presetFor(url))); setSt("ok"); }
    catch (err) { setSt("err"); setWhy(String((err as Error)?.message || err).slice(0, 60)); }
  };
  return (
    <button type="button" className={`nm-askpick${st ? " " + st : ""}`} onClick={(e) => void go(e)} disabled={st === "run" || st === "ok"}
      aria-label={st === "ok" ? "요약 접수됨" : "이 기사 요약 걸기"} title={st === "err" ? why : st === "ok" ? "요약 대기열에 들어갔어" : "이 기사로 바로 요약 요청"}>
      {st === "ok" ? <><svg viewBox="0 0 16 16" aria-hidden><path d="M3.2 8.6l3 3 6.6-7" /></svg>접수됨</> : st === "run" ? "보내는 중…" : st === "err" ? "다시 요약" : "요약"}
    </button>
  );
}

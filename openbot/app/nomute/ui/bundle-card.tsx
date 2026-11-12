// 촉 1:1 요약 묶음 카드 + 「올림 · 넘김」(봄 11-12 19:22 · 형 19:21 「봄이 결론 반영해 믿어볼게」 · 알고리즘 회의 결론 · 글 꼴 = 깃 · 이음 = 빠르)
//   올림 = 캡션 「복사」 + 사진 크게(길게 눌러 저장 · 새 탭) 펴 줌 — 인스타 올리기는 형 손(우리는 안 올림)
//   넘김 = 한 줄로 접힘(눌러 다시 펼침) · 누른 것 = POST /api/office/hyung-pick {stem, ev, ev_at, url, act, msg}(형만 · 서버 _hyungpick.js) → 빠르가 사건 이력에 이어 가중을 형 눈에 맞춤
//   다시 열어도 그대로 = GET hyung-pick(14일 · 글마다 마지막) · 폰 · PC 한 벌(같은 카드)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { office } from "../data/office";
import { eventKeysOfUrl, type NewsEvent } from "../home/event-score";
import type { Bundle } from "./bundle";
import "./bundle-card.css";

type Pick = { msg?: string; stem?: string; act: "up" | "skip"; at?: number };
type Act = "" | "up" | "skip";

export function usePicks() {
  return useQuery({ queryKey: ["nomute", "hyung-pick"], queryFn: () => office<{ picks?: Pick[] }>("hyung-pick").then((j) => j.picks || []), staleTime: 60_000 });
}

/** 기사 주소 → 사건 열쇠 · 그 묶음 회차 시각(빠르 11-12 19:34 「ev = 사건 이력 묶음 id」 · 못 맞추면 주소 첫 열쇠 · ev_at 0) */
async function evOf(url: string): Promise<{ ev: string; ev_at: number }> {
  const keys = eventKeysOfUrl(url);
  if (!keys.length) return { ev: "", ev_at: 0 };
  try {
    const j = (await (await fetch("/api/trends?f=event", { credentials: "include" })).json()) as { events?: NewsEvent[] };
    for (const e of j.events || []) {
      const k = keys.find((x) => (e.keys || []).includes(x));
      if (k) return { ev: k, ev_at: Date.parse(String(e.at || "")) || 0 };
    }
  } catch { /* 못 읽음 = 주소 열쇠만 */ }
  return { ev: keys[0], ev_at: 0 };
}

export function BundleCard({ b, id }: { b: Bundle; id: string }) {
  const qc = useQueryClient();
  const saved = (usePicks().data || []).filter((p) => p.msg === id || (!p.msg && p.stem === b.stem)).pop();
  const [act, setAct] = useState<Act>(""), [open, setOpen] = useState(false), [err, setErr] = useState(""), [copied, setCopied] = useState(false);
  const cur: Act = act || saved?.act || "";
  const press = async (a: "up" | "skip") => {
    setAct(a); setOpen(a === "up"); setErr("");
    try {
      const ev = b.url ? await evOf(b.url) : { ev: "", ev_at: 0 };
      await office("hyung-pick", { method: "POST", body: JSON.stringify({ act: a, stem: b.stem, msg: id, url: b.url, ...ev }) });
      void qc.invalidateQueries({ queryKey: ["nomute", "hyung-pick"] });
    } catch { setErr("기록 못 함 · 다시 눌러 줘"); }
  };
  const copy = () => { void navigator.clipboard?.writeText(b.caption).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }); };
  if (cur === "skip" && !open)
    return (
      <button type="button" className="nm-bdl nm-bdl-fold" onClick={() => setOpen(true)} aria-label={`넘김 · ${b.title} · 눌러 펼침`}>
        <span className="nm-bdl-tag">넘김</span><span className="nm-bdl-ft">{b.title || b.stem}</span>
      </button>
    );
  return (
    <div className={`nm-bdl${cur ? " " + cur : ""}`}>
      <div className="nm-bdl-hd"><span className="nm-bdl-tag">묶음</span>{cur === "up" ? <span className="nm-bdl-st">올림</span> : cur === "skip" ? <span className="nm-bdl-st">넘김</span> : null}</div>
      {b.img && !(cur === "up" && open) ? <img className="nm-bdl-img" src={b.img} alt="" loading="lazy" referrerPolicy="no-referrer" /> : null}
      <b className="nm-bdl-t">{b.title}</b>
      {b.sums.length ? <ul className="nm-bdl-sum">{b.sums.map((s, i) => <li key={i}>{s}</li>)}</ul> : null}
      {b.url ? <a className="nm-bdl-url" href={b.url} target="_blank" rel="noreferrer">{b.url.replace(/^https?:\/\/(www\.)?/, "")}</a> : null}
      {cur === "up" && open ? (
        <div className="nm-bdl-up">
          {b.img ? <a href={b.img} target="_blank" rel="noreferrer" className="nm-bdl-big" aria-label="사진 크게 · 길게 눌러 저장"><img src={b.img} alt="" referrerPolicy="no-referrer" /></a> : null}
          {b.credit ? <div className="nm-bdl-cr">사진 · {b.credit}</div> : null}
          <div className="nm-bdl-cap">{b.caption || "캡션 없음"}</div>
          <div className="nm-bdl-row">
            <button type="button" className="nm-bdl-btn on" onClick={copy} disabled={!b.caption}>{copied ? "복사했어" : "캡션 복사"}</button>
            {b.img ? <a className="nm-bdl-btn" href={b.img} target="_blank" rel="noreferrer">사진 열기</a> : null}
            <button type="button" className="nm-bdl-btn" onClick={() => setOpen(false)}>접기</button>
          </div>
        </div>
      ) : null}
      {err ? <div className="nm-bdl-err">{err}</div> : null}
      <div className="nm-bdl-row">
        <button type="button" className={`nm-bdl-btn${cur === "up" ? " on" : ""}`} onClick={() => (cur === "up" ? setOpen((v) => !v) : void press("up"))}>올림</button>
        <button type="button" className={`nm-bdl-btn${cur === "skip" ? " on" : ""}`} onClick={() => (cur === "skip" ? setOpen(false) : void press("skip"))}>넘김</button>
      </div>
    </div>
  );
}

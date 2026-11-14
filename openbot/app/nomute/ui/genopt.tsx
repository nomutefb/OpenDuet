// 서랍 「생성 옵션」 = 에디터 설정 ▸ 기본값의 그림 줄들(/?pop=genopt · viewer-src/41-toolRfVis.part paintGenImgRow·paintImgEngRow·paintImgOptRows · 30-settings.part IMG_OPT_*)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   저장 = 원본과 같은 서버 설정 한 장(api/settings) · 이미지 엔진 = imgProvider · 세부 = imgOpt 바뀐 칸만(서버 칸별 병합 = 다른 기기가 바꾼 칸 보존) · 실효값은 러너가 settings/app.json 에서 읽음
//   단추 = 원본 이름·설명 그대로 · 누른 칩이 곧 선택 · 같은 값 다시 누르면 저장 0 · 화풍만 여럿(마지막 하나는 못 끔 = 그릴 화풍 0 막기)
//   AI 썸네일 켜기·끄기 = 원본은 잠금 PIN 1회 확인(PIN 없으면 바로) → 여기서도 PIN 없을 때만 바로 · PIN 있으면 상태만(에디터 설정 줄에서)
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./genopt.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getJson } from "./news-data";

type ImgOpt = { gemModel: string; gemSize: string; layout: string; styles: string[]; grow: string; fallback: boolean };
type Settings = { genImgOn?: boolean; imgProvider?: string; imgOpt?: Partial<ImgOpt>; lockPinHash?: string; error?: string; code?: string; settings?: Settings };
const KEY = ["nomute", "settings"] as const;
const IMG_OPT_DEFAULTS: ImgOpt = { gemModel: "flash", gemSize: "auto", layout: "4", styles: ["watercolor", "webtoon", "photo"], grow: "used", fallback: true };   // 원본 IMG_OPT_DEFAULTS(서버 settings.js 미러)
const IMG_OPT_ENUM: Record<string, string[]> = { gemModel: ["flash", "pro"], gemSize: ["auto", "1K", "2K", "4K"], layout: ["4", "1"], grow: ["used", "all"] };
const IMG_STYLES = ["watercolor", "webtoon", "photo", "cartoon"];
const clean = (raw?: Partial<ImgOpt>): ImgOpt => {   // 원본 _imgOptClean(칸마다 무효값은 그 칸만 기본)
  const o: Partial<ImgOpt> = {};
  if (raw && typeof raw === "object") {
    for (const k of Object.keys(IMG_OPT_ENUM)) if (IMG_OPT_ENUM[k].includes((raw as Record<string, string>)[k])) (o as Record<string, string>)[k] = (raw as Record<string, string>)[k];
    if (Array.isArray(raw.styles)) { const s = IMG_STYLES.filter((x) => raw.styles!.includes(x)); if (s.length) o.styles = s; }
    if (typeof raw.fallback === "boolean") o.fallback = raw.fallback;
  }
  return { ...IMG_OPT_DEFAULTS, styles: [...IMG_OPT_DEFAULTS.styles], ...o };
};
type Opt = { v: string; lab: string; tip?: string };
const ROWS: { k: keyof ImgOpt | "provider"; lab: string; opts: Opt[] }[] = [   // 원본 #imgengrow · #imgGemModelRow · #imgGemSizeRow · #imgLayoutRow · #imgStylesRow · #imgGrowRow · #imgFbRow
  { k: "provider", lab: "이미지 엔진", opts: [{ v: "gemini", lab: "Gemini", tip: "Gemini API(종량)" }, { v: "gpt", lab: "GPT", tip: "ChatGPT 구독 · Codex 그림 도구 · 1024×1536 고정" }] },
  { k: "gemModel", lab: "Gemini 모델", opts: [{ v: "flash", lab: "Flash", tip: "gemini-3.1-flash-image" }, { v: "pro", lab: "Pro", tip: "gemini-3-pro-image" }] },
  { k: "gemSize", lab: "Gemini 크기", opts: [{ v: "auto", lab: "기본", tip: "부르는 곳 기본 — 썸네일 한 장·카드 1K · 4칸 판 4K" }, { v: "1K", lab: "1K" }, { v: "2K", lab: "2K" }, { v: "4K", lab: "4K" }] },
  { k: "layout", lab: "썸네일", opts: [{ v: "4", lab: "4칸", tip: "한 판에 네 칸을 그려 칸마다 자름(그림 1번)" }, { v: "1", lab: "한 장씩", tip: "화풍마다 한 장씩(그림 화풍 수만큼)" }] },
  { k: "styles", lab: "화풍", opts: [{ v: "watercolor", lab: "수채" }, { v: "webtoon", lab: "극화" }, { v: "photo", lab: "포토", tip: "포토에디토리얼" }, { v: "cartoon", lab: "만평", tip: "시사만평" }] },
  { k: "grow", lab: "칸 늘리기", opts: [{ v: "used", lab: "쓰는 칸만", tip: "생성 때는 판에서 자르기만 — 쓸 칸은 확정 때 크게" }, { v: "all", lab: "전부", tip: "네 칸 다 1080×1350 으로 늘림(Real-ESRGAN · 러너에 없으면 Lanczos)" }] },
  { k: "fallback", lab: "GPT 실패 → Gemini", opts: [{ v: "1", lab: "켬", tip: "GPT 그림이 실패·시간 초과면 Gemini 로 다시(종량)" }, { v: "0", lab: "끔", tip: "GPT 실패 = 그 그림 없음" }] },
];

/** 설정 「AI 썸네일 옵션」(형 11-14 클라우드 세션 창 「ai 썸네일 이미지는 옵션이네, 이거 간추려가지고 설정으로 넣어버려, ai 썸네일 옵션으로」) —
 *  늘 보이는 것 = 켬끔 · 이미지 엔진 · 화풍 / 「자세히」 = 엔진에 맞는 나머지(Gemini 모델 · 크기는 Gemini 일 때만 · GPT 실패 대체는 GPT 일 때만) */
const MAIN = new Set<string>(["provider", "styles"]);
export function GenOptModal() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, staleTime: 15_000, queryFn: () => getJson<Settings>(`/api/settings?_=${Date.now()}`) });
  const [busy, setBusy] = useState(""), [note, setNote] = useState("");
  const [more, setMore] = useState(false);
  const opt = clean(q.data?.imgOpt), prov = ["gemini", "gpt"].includes(q.data?.imgProvider || "") ? q.data!.imgProvider! : "gpt", gen = q.data?.genImgOn !== false, pin = !!q.data?.lockPinHash;   // 원본 imgProvider() · genImgOn()
  const save = async (tag: string, patch: Partial<Settings>) => {   // 원본 saveSettings — 하나짜리 값 = 빈 base · imgOpt = 바뀐 칸만
    setBusy(tag); setNote("");
    qc.setQueryData<Settings>(KEY, (d) => ({ ...(d || {}), ...patch, ...(patch.imgOpt ? { imgOpt: { ...(d?.imgOpt || {}), ...patch.imgOpt } } : {}) }));   // 원본처럼 칩 먼저 칠하고 서버 응답 뒤 한 번 더
    try {
      const r = await fetch("/api/settings", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ patch, base: {} }) });
      const j = (await r.json().catch(() => ({}))) as Settings;
      if (r.ok && j.settings) qc.setQueryData(KEY, j.settings);
      else { await qc.invalidateQueries({ queryKey: KEY }); setNote(j.error || "아직 저장 못 했어 — 잠시 뒤 다시"); }
    } catch { await qc.invalidateQueries({ queryKey: KEY }); setNote("네트워크 오류 — 다시"); }
    finally { setBusy(""); }
  };
  const isOn = (k: string, v: string) => k === "provider" ? prov === v : k === "styles" ? opt.styles.includes(v) : k === "fallback" ? opt.fallback === (v === "1") : (opt as unknown as Record<string, string>)[k] === v;
  const pick = (k: string, v: string) => {
    if (busy) return;
    if (k === "provider") { if (prov !== v) void save(k, { imgProvider: v }); return; }   // 같은 값 다시 = 저장 0
    if (k === "styles") {
      const has = opt.styles.includes(v);
      if (has && opt.styles.length === 1) { setNote("화풍은 하나는 남아야 해(그릴 화풍 0 = 썸네일 0)"); return; }
      void save(k, { imgOpt: { styles: IMG_STYLES.filter((x) => (x === v ? !has : opt.styles.includes(x))) } }); return;
    }
    const val = k === "fallback" ? v === "1" : v;
    if ((opt as unknown as Record<string, unknown>)[k] === val) return;
    void save(k, { imgOpt: { [k]: val } as Partial<ImgOpt> });
  };
  const rows = ROWS.filter((r) => MAIN.has(r.k) || (more && (r.k === "fallback" ? prov === "gpt" : String(r.k).startsWith("gem") ? prov === "gemini" : true)));
  return (
    <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo nm-gopt nm-gopt-in">
      {q.isLoading ? <p className="nm-chan-msg">읽는 중…</p> : q.isError ? <p className="nm-chan-msg" role="alert">설정을 못 읽었어 — 다시 열어 줘</p> : (
        <>
          <div className="row">
            <span className="lab">AI 썸네일</span>
            <span className="opts">
              <button type="button" className={`chip${gen ? " on" : ""}`} aria-pressed={gen} disabled={pin || !!busy} title={pin ? "켜고 끄기 = 잠금 PIN 확인이 필요 — 에디터 설정 줄에서" : "요약할 때 썸네일 그림을 만들지"} onClick={() => void save("gen", { genImgOn: !gen })}>{gen ? "ON" : "OFF"}</button>
            </span>
          </div>
          {rows.map((r) => (
            <div key={r.k} className="row">
              <span className="lab">{r.lab}</span>
              <span className="opts">{r.opts.map((o) => { const on = isOn(r.k, o.v); return <button key={o.v} type="button" className={`chip${on ? " on" : ""}`} aria-pressed={on} title={o.tip} disabled={!!busy} onClick={() => pick(r.k, o.v)}>{o.lab}</button>; })}</span>
            </div>
          ))}
          <div className="row"><span className="lab" /><span className="opts"><button type="button" className="chip" aria-expanded={more} onClick={() => setMore(!more)}>{more ? "접기" : "자세히"}</button></span></div>
          {note ? <p className="nm-chan-msg" role="status">{note}</p> : null}
        </>
      )}
    </div>
  );
}

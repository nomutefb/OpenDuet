// 서랍 「음원」 = 옛 에디터 음원 창(viewer/song.html · api/song → 러너 → song_out/<id>/…)을 앱 안으로
//   (형 11-10 15:48 봄 1:1 「응 에디터에 잇는거 다 정원으로 가져왕」 · team-4 뎅 · 봄 18:40 「음원 · 보이스(song)」)
//   같은 것 = 이야기(≤1500) · 장르 · 분위기 · 테마 · 표현방식(원본 레일 값 그대로 + 직접) · 세 단추(옵션 → 고르기 · Suno 프롬프트 · 완성곡 Lyria) · 서버 칸 이름 · 기다리는 길(song_out · error.log) · 진행 기억 nm_song_pend
//   다른 것(다음 판) = 보컬 · 실험성 · 장르 충실 게이지(중립 = 원본도 안 실음) · 마스터링 · 보이스 입히기(api/voice) · 캡션 이력
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./dl.css";
import "./ys.css";
import "./song.css";
import { useEffect, useRef, useState } from "react";
import { Pane } from "./pane";

type Mode = "options" | "suno" | "lyria";
const RAILS: { k: "genre" | "mood" | "theme" | "express"; lab: string; vals: string[] }[] = [   // 원본 genPop · moodPop · themePop · expPop
  { k: "genre", lab: "장르", vals: ["자동", "발라드", "힙합", "록", "R&B", "댄스·EDM", "트로트", "재즈", "어쿠스틱", "OST·시네마틱", "시티팝", "신스팝", "로파이", "인디 포크", "펑크·디스코", "국악 퓨전"] },
  { k: "mood", lab: "분위기", vals: ["자동", "신나는", "잔잔한", "웅장한", "몽환적", "어두운", "따뜻한", "쓸쓸한", "긴장감", "희망찬", "새벽 감성", "장난스러운"] },
  { k: "theme", lab: "테마", vals: ["자동", "사랑", "이별", "응원·위로", "추억·향수", "성장", "우정·가족", "사회 풍자", "계절", "여행", "성공·야망", "일상"] },
  { k: "express", lab: "표현방식", vals: ["자동", "감성 서정", "유머·풍자", "웅장·시네마틱", "담담한 내레이션", "신나는 훅", "몽환", "분노·비판"] },
];
const WL: Record<Mode, string> = { options: "옵션 만드는 중", suno: "프롬프트 만드는 중", lyria: "곡 만드는 중" };   // 원본 WL
const PEND = "nm_song_pend", POLL_MS = 6_000, BUDGET_MS = 1000_000;   // 원본 PEND_KEY · BUDGET 1000초
type Opt = { name?: string; why?: string; vocal?: string; [k: string]: unknown };
type Res = { title?: string; style?: string; lyrics?: string; sung?: string; exclude?: string; genre?: string; express?: string; target?: string; url?: string; engine?: string; model?: string; voice_name?: string; options?: Opt[] };
type Pend = { id: string; mode: Mode; t0: number; lbl: string };
const pendGet = (): Pend | null => { try { return JSON.parse(localStorage.getItem(PEND) || "null"); } catch { return null; } };
const pendSet = (p: Pend | null) => { try { if (p) localStorage.setItem(PEND, JSON.stringify(p)); else localStorage.removeItem(PEND); } catch { /* 이번만 */ } };
async function readOut(id: string, mode: Mode): Promise<{ d?: Res; err?: string } | null> {   // 원본 pollSong = error.log 먼저 · SPA HTML 은 끝으로 안 봄
  try {
    const e = await fetch(`/song_out/${id}/error.log?t=${Date.now()}`, { credentials: "same-origin" });
    if (e.ok) { const t = await e.text(); if (t.trim() && !/^\s*</.test(t)) return { err: t.trim().slice(0, 160) }; }
    const r = await fetch(`/song_out/${id}/${mode === "options" ? "options.json" : "song.json"}?t=${Date.now()}`, { credentials: "same-origin" });
    if (r.ok) { const t = await r.text(); if (t && !/^\s*</.test(t)) return { d: JSON.parse(t) as Res }; }
  } catch { /* 다음 회차 */ }
  return null;
}
async function copyText(t: string) { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } }

export function SongModal() {
  const [story, setStory] = useState(""), [sel, setSel] = useState<Record<string, string>>({ genre: "자동", mood: "자동", theme: "자동", express: "자동" }), [free, setFree] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Mode | "">(""), [msg, setMsg] = useState(""), [err, setErr] = useState(""), [opts, setOpts] = useState<Opt[]>([]), [pick, setPick] = useState<number>(-1), [res, setRes] = useState<{ mode: Mode; d: Res } | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const val = (k: string) => (sel[k] === "직접" ? (free[k] || "").trim() || "자동" : sel[k] || "자동");
  const poll = async (p: Pend) => {
    setBusy(p.mode); setMsg(`${WL[p.mode]}…`); setErr("");
    while (alive.current && Date.now() - p.t0 < BUDGET_MS) {
      const r = await readOut(p.id, p.mode);
      if (!alive.current) return;
      if (r?.err) { pendSet(null); setBusy(""); setMsg(""); setErr(r.err); return; }
      if (r?.d) {
        pendSet(null); setBusy("");
        const sec = Math.round((Date.now() - p.t0) / 1000);
        if (p.mode === "options") { setOpts(r.d.options || []); setPick(-1); setMsg(`옵션 ${(r.d.options || []).length}개 (${sec}초) — 골라서 아래 단추로`); }
        else { setRes({ mode: p.mode, d: r.d }); setMsg(`${p.mode === "suno" ? "완료" : "완성곡"} (${sec}초)`); }
        return;
      }
      await new Promise((ok) => setTimeout(ok, POLL_MS));
    }
    if (alive.current) { pendSet(null); setBusy(""); setMsg(""); setErr("시간 안에 결과가 안 왔어 — 다시 해 줘"); }
  };
  useEffect(() => { const p = pendGet(); if (p?.id) void poll(p); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const fire = async (mode: Mode) => {   // 원본 fire(mode)
    const s = story.trim();
    if (!s) { setErr("스토리(대사나 상황)를 적어줘"); return; }
    if (busy) return;
    const ln = (s.split("\n").find((x) => x.trim()) || "").replace(/\s+/g, " ").trim(), lbl = ln ? ln.slice(0, 16) + (ln.length > 16 ? "…" : "") : mode === "options" ? "음원 옵션" : "음원";
    const payload: Record<string, unknown> = { mode, genre: val("genre"), express: val("express"), mood: val("mood"), theme: val("theme"), story: s.slice(0, 1500), lbl };
    if (mode !== "options" && pick >= 0 && opts[pick]) payload.pick = opts[pick];
    setBusy(mode); setErr(""); if (mode !== "options") setRes(null);
    try {
      const r = await fetch("/api/song", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const j = (await r.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!r.ok || j.error || !j.id) throw new Error(j.error || `서버 오류 ${r.status} — 다시`);
      const p = { id: j.id, mode, t0: Date.now(), lbl }; pendSet(p); void poll(p);
    } catch (e) { setBusy(""); setErr(e instanceof Error ? e.message : String(e)); }
  };
  const d = res?.d;
  return (
    <Pane title="음원">
      <div className="yeta-set mt-2 nm-dl nm-ys">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
          <span className="ycd-nm yset-ttl">이야기</span>
          <textarea className="nm-ys-ask" rows={4} maxLength={1500} value={story} placeholder="대사나 상황 — 이걸로 곡을 만들어" aria-label="내용" onChange={(e) => { setStory(e.target.value); setErr(""); }} />
          {RAILS.map((r) => (
            <div key={r.k} className="nm-ys-opts" role="group" aria-label={r.lab}>
              <span className="nm-song-k">{r.lab}</span>
              {[...r.vals, "직접"].map((v) => <button key={v} type="button" className={`yset-chip${sel[r.k] === v ? " on" : ""}`} aria-pressed={sel[r.k] === v} onClick={() => setSel((m) => ({ ...m, [r.k]: v }))}>{v}</button>)}
              {sel[r.k] === "직접" ? <input className="nm-dl-q" value={free[r.k] || ""} placeholder={`${r.lab} 직접`} aria-label={`${r.lab} 직접`} onChange={(e) => setFree((m) => ({ ...m, [r.k]: e.target.value }))} /> : null}
            </div>
          ))}
          <div className="nm-ys-opts">
            <button type="button" className="yset-chip" disabled={!!busy} onClick={() => void fire("options")}>{busy === "options" ? "옵션 만드는 중…" : "옵션 보기"}</button>
            <button type="button" className="yset-chip" disabled={!!busy} onClick={() => void fire("suno")}>{busy === "suno" ? "만드는 중…" : "Suno 프롬프트"}</button>
            <button type="button" className="yset-chip on" disabled={!!busy} onClick={() => void fire("lyria")}>{busy === "lyria" ? "곡 만드는 중…" : "완성곡 만들기"}</button>
          </div>
          {msg ? <p className="nm-chan-msg" role="status">{msg}{busy ? " · 이 창을 닫아도 다시 열면 이어서 기다려" : ""}</p> : null}
          {err ? <p className="nm-chan-msg" role="alert">{err}</p> : null}
        </div>
        {opts.length ? (
          <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
            <span className="ycd-nm yset-ttl">옵션 {opts.length}개 · 하나 고르면 그 꼴로 만들어(다시 누르면 풀림)</span>
            {opts.map((o, i) => (
              <button key={i} type="button" className={`nm-song-opt${pick === i ? " on" : ""}`} aria-pressed={pick === i} onClick={() => setPick((v) => (v === i ? -1 : i))}>
                <b>{o.name || `옵션 ${i + 1}`}</b>{o.why ? <span>{o.why}</span> : null}{o.vocal ? <i>{o.vocal}</i> : null}
              </button>
            ))}
          </div>
        ) : null}
        {d && res?.mode === "suno" ? (
          <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
            <span className="ycd-nm yset-ttl">Suno 커스텀 모드에 칸별로 붙여넣기</span>
            {([["제목", d.title], ["스타일", d.style], ["가사", d.lyrics], ["빼기", d.exclude]] as [string, string | undefined][]).filter(([, t]) => t).map(([k, t]) => (
              <div key={k} className="nm-song-field"><span className="nm-song-k">{k}</span><pre>{t}</pre><button type="button" className="yset-chip" onClick={async () => setMsg((await copyText(String(t))) ? `${k} 복사했어` : "복사 못 했어")}>복사</button></div>
            ))}
            <p className="nm-chan-msg">{[d.genre || "자동", d.express || "자동", "목표 " + (d.target || "60초 미만")].join(" · ")}</p>
          </div>
        ) : null}
        {d && res?.mode === "lyria" ? (
          <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo">
            <span className="ycd-nm yset-ttl">{d.title || "완성곡"}</span>
            {d.url ? <audio src={d.url} controls preload="metadata" style={{ width: "100%" }} /> : null}
            <p className="nm-chan-msg">{d.engine === "rvc" ? "보이스 커버" + (d.voice_name ? " · " + d.voice_name : "") : "Lyria 3" + (d.model ? " · " + d.model : "")}{d.sung && d.lyrics && d.sung !== d.lyrics ? " · 실제 부른 가사 기준" : ""}</p>
            {d.sung || d.lyrics ? <pre className="nm-song-lyr">{d.sung || d.lyrics}</pre> : null}
            {d.url ? <div className="nm-ys-opts"><button type="button" className="yset-chip on" onClick={() => window.open(`/api/dl?u=${encodeURIComponent(String(d.url))}&n=${encodeURIComponent((d.title || "song").replace(/[\\/:*?"<>|]+/g, "").slice(0, 60) + ".mp3")}`, "_blank")}>받기</button></div> : null}
          </div>
        ) : null}
      </div>
    </Pane>
  );
}

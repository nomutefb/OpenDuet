// 서랍 「결의 방」(형 11-01 「이런식으로 다 가져와주라」) — 에디터 결의 방 화면(viewer/gyeol-room.html)을 앱 네이티브로 · 전엔 에디터 화면을 통째로 품었음(shell FRAME.gyeol)
//   데이터 = /api/chan?f=gyeol(viewer/gyeol_data.json · 저장소를 바로 읽음 = 페이지 배포를 안 기다림 · 러너 gyeol-fetch) · 열 때 한 번(원본과 같음)
//   규칙 = 원본 그대로: 올린 시각 최신 순 · 소리 나는 곡 12개씩 「더 보기」 · 가사만 곡(hypo) = 맨 아래 「가사만 N곡」 접은 칸 · 올림 꼴 틀린 것 8개까지 맨 위
//     곡 = 제목 · git/gl · 실험 · ★ · 올림·길이·Suno·id · 음원(R2) · 뮤비(git 먼저 · 못 받으면 alt · 포스터 없으면 첫 장면) · 만드는 중 · 실패 사유 · 가사(접힘)
//   원본과 다른 점: 곡 바로가기 = 주소 #<UUID> 대신 #/gyeol?s=<UUID>(앱 길이 해시를 씀) · 링크(Suno) = 앱 안 한 겹(./inapp.ts 가 받음)
import "./yeta-settings.css";
import "./chan.css";
import "./ed-pages.css";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pane } from "./pane";

type Mv = { url?: string; poster?: string; at?: string; status?: string; by?: string; alt?: { url?: string; poster?: string } | null };
type Song = { id: string; title?: string; at?: string; duration_s?: string | number; audio?: string; suno_url?: string; src?: string; hypo?: boolean; starred?: boolean; lyrics?: string; mv?: Mv[]; making?: { state?: string; at?: string } | null };
type Room = { songs?: Song[]; bad?: { path?: string; why?: string }[]; git?: { songs?: number } };
type Doc = { generated_kst?: string; room?: Room };

const PAGE = 12;
const hm = (iso?: string | null) => { if (!iso) return "—"; const m = String(iso).match(/(\d{2})-(\d{2})T(\d{2}):(\d{2})/); return m ? `${+m[1]}/${+m[2]} ${m[3]}:${m[4]}` : String(iso); };
// 시각을 말로(원본 rel · feedback 과 같은 꼴) — 1시간 안 = N분 전 · 6시간 안 = N시간 전 · 오늘·어제 = 오전/오후 h시 · 그 전 = M/D
const ampm = (d: Date) => (d.getUTCHours() < 12 ? "오전 " : "오후 ") + ((d.getUTCHours() % 12) || 12) + "시";
const rel = (iso?: string) => {
  const t = Date.parse(iso || ""); if (!Number.isFinite(t)) return "—";
  const min = Math.round((Date.now() - t) / 60000);
  if (min >= 0 && min < 60) return Math.max(1, min) + "분 전";
  if (min >= 60 && min < 360) return Math.round(min / 60) + "시간 전";
  const k = new Date(t + 9 * 3600e3), today = new Date(Date.now() + 9 * 3600e3);
  const day = (d: Date) => d.toISOString().slice(0, 10), yest = new Date(today.getTime() - 86400e3);
  if (day(k) === day(today)) return "오늘 " + ampm(k);
  if (day(k) === day(yest)) return "어제 " + ampm(k);
  return (k.getUTCMonth() + 1) + "/" + k.getUTCDate();
};
const dur = (s: unknown) => { const n = Math.round(Number(s)); if (!Number.isFinite(n) || n <= 0) return ""; return Math.floor(n / 60) + ":" + String(n % 60).padStart(2, "0"); };   // 초를 먼저 반올림(59.6초 = 1:00)

const gyQuery = queryOptions({
  queryKey: ["nomute", "gyeol-room"], staleTime: 0,
  queryFn: async () => {
    const r = await fetch("/api/chan?f=gyeol", { cache: "no-store", credentials: "same-origin" });
    if (!r.ok) throw new Error(`결의 방 자료를 못 불러옴(${r.status}) — 잠시 뒤 다시`);
    return (await r.json()) as Doc;
  },
});

export function GyeolModal() {
  const q = useQuery(gyQuery);
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const focus = new URLSearchParams(searchStr).get("s") || "";
  const [shown, setShown] = useState(PAGE), [fold, setFold] = useState(false), [hit, setHit] = useState("");
  const d = q.data, room: Room = d?.room || {};
  const all = (room.songs || []).slice().sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
  const songs = all.filter((s) => !s.hypo), hypo = all.filter((s) => s.hypo);   // songs = 소리 나는 곡(더 보기로 나눠 그림) · hypo = 가사만 곡(접은 칸에 다 그림)
  const n = Math.min(songs.length, shown);
  useEffect(() => {   // 곡 바로가기(원본 focusHash) — 그 곡까지 펼치고 테두리 · 맨 위로
    if (!d || !focus) return;
    const i = songs.findIndex((s) => s.id === focus);
    if (i >= 0) setShown((v) => { let x = v; while (x <= i) x += PAGE; return x; });
    else if (hypo.some((s) => s.id === focus)) setFold(true);
    else return;
    setHit(focus);
  }, [d, focus]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!hit) return;
    const el = document.getElementById("gy-s-" + hit);
    el?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }, [hit, shown, fold]);
  const mvn = all.filter((s) => (s.mv || []).some((m) => m.status === "done")).length;
  const bad = room.bad || [];
  return (
    <Pane title="결의 방">
      <div className="yeta-set mt-2 nm-ep nm-gy">
        {d ? <p className="ep-at num" aria-live="polite">기준 {hm(d.generated_kst)}</p> : null}
        {q.isPending ? <p className="gy-empty">불러오는 중</p> : q.isError ? <p className="gy-err">{String((q.error as Error)?.message || q.error)}</p> : (
          <>
            <div className="gy-sum"><span className="gy-big num">{songs.length}</span><small className="num">테이크 · 뮤비 {mvn} · git 곡 {room.git?.songs || 0} · 가사만 {hypo.length}{songs[0] ? " · 마지막 " + rel(songs[0].at) : ""}</small></div>
            {bad.length ? (
              <div className="gy-bad"><b>올림 꼴이 틀려 못 들인 것 {bad.length}</b> — 이름 <code>yyyymmdd_hhmm_제목_a.mp3</code> · song.json(title·created_at·duration_seconds)
                {bad.slice(0, 8).map((b, i) => <span key={i}><br /><code>{b.path}</code> {b.why}</span>)}
              </div>
            ) : null}
            <div className="gy-list" aria-live="polite">
              {!songs.length && !hypo.length ? <p className="gy-empty">아직 곡 없음 — 결이 grokbot/gyeol/songs/&lt;UUID&gt;/ 에 올리면 몇 분 안에 여기 떠</p>
                : !songs.length ? <p className="gy-empty">소리 나는 곡은 아직 없음 — 가사만 있는 곡은 아래 칸</p>
                : songs.slice(0, n).map((s) => <SongCard key={s.id} s={s} hit={hit === s.id} />)}
            </div>
            {n < songs.length ? <div className="gy-more"><button type="button" className="gy-btn" onClick={() => setShown(n + PAGE)}>더 보기</button></div> : null}
            {hypo.length ? (
              <details className="gy-fold" open={fold} onToggle={(e) => setFold(e.currentTarget.open)}>
                <summary className="gy-btn num">가사만 {hypo.length}곡</summary>
                <div className="gy-list">{hypo.map((s) => <SongCard key={s.id} s={s} hit={hit === s.id} />)}</div>
              </details>
            ) : null}
          </>
        )}
      </div>
    </Pane>
  );
}

function SongCard({ s, hit }: { s: Song; hit: boolean }) {
  const mv = (s.mv || []).find((m) => m.status === "done" && m.url);
  const fail = (s.mv || []).find((m) => /^fail/.test(m.status || ""));
  // 같은 영상 두 판(git R2 미러 · editor ys_res) = 한 줄 · git 먼저 재생, 못 받으면 alt(다음 source) · 포스터 없는 옛 결과 = 첫 장면(#t=0.1 · metadata 만 받음)
  const poster = (mv && (mv.poster || (mv.alt && mv.alt.poster))) || "";
  const src = (u: string) => (poster ? u : u + "#t=0.1");
  const len = dur(s.duration_s);
  return (
    <article id={"gy-s-" + s.id} className={"gy-card" + (s.hypo ? " hypo" : "") + (hit ? " hit" : "")}>
      <p className="gy-ttl"><span>{s.title || "(제목 없음)"}</span>{s.src === "git" ? <em className="gy-chip git num">git</em> : <em className="gy-chip num">gl</em>}{s.hypo ? <em className="gy-chip">실험</em> : null}{s.starred ? <em className="gy-chip">★</em> : null}</p>
      <div className="gy-meta num">
        <span><b>올림</b>{rel(s.at)}</span>
        {len ? <span><b>길이</b>{len}</span> : null}
        {s.suno_url ? <span><a href={s.suno_url} target="_blank" rel="noopener">Suno</a></span> : null}
        <span><b>id</b>{String(s.id).slice(0, 8)}</span>
      </div>
      {s.audio ? <audio className="gy-audio" controls preload="none" src={s.audio} /> : <p className="gy-state">음원 주소 없음(공개 https 아님)</p>}
      {mv && mv.url ? (
        <div className="gy-mv">
          <video controls preload={poster ? "none" : "metadata"} playsInline poster={poster || undefined}>
            <source src={src(mv.url)} type="video/mp4" />
            {mv.alt && mv.alt.url ? <source src={src(mv.alt.url)} type="video/mp4" /> : null}
          </video>
          <span className="gy-state num">뮤비 {rel(mv.at)}{mv.by === "git" ? " · git" : ""}</span>
        </div>
      ) : null}
      {s.making ? <p className="gy-state on num">{s.making.state} — 요청 {hm(s.making.at)}</p> : null}
      {fail && !mv ? <p className="gy-state fail num">뮤비 실패 — {String(fail.status).replace(/^fail:\s*/, "") || "사유 없음"} · {hm(fail.at)}</p> : null}
      {s.lyrics ? <details className="gy-lyr"><summary>가사</summary><pre>{s.lyrics}</pre></details> : null}
    </article>
  );
}

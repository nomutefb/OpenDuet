// 서랍 「센서」 = 에디터 설정 ▸ 센서 창(/?pop=sensor · viewer-src/43-memo.part openSensors · renderSensorList · snAdd)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   센서 = 봇이 건 키워드·속보 조건(러너가 5분마다 확인 → 걸리면 그 봇을 깨움) · 정본 = data/collect/config/sensors.json(GET /api/sensors = {bots, bot_names})
//   저장 = 원본과 같은 길(POST /api/sensors {bot, base: 내가 읽은 그 봇 칸, items}) · 서버가 id 별로 병합 · 형이 바꾸면 그 봇 웹훅으로 알림(j.woke) · 실패 = 사유 그대로 + 다시 읽음
//   줄 = 봇 | 「● (쉼) 이름 — 키워드」 · 「<봇>이 바꿈 · 만료 …」 | 고치기 | 지움 · 누르면 전문(「칸: 값」 줄) · ＋ = 입력칸(새 센서 틀 = 촉 · 만료 하루 뒤) · ●= 봇이 바꾼 걸 아직 안 봄(원본과 같은 열쇠 nm_sensor_seen)
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./sensor.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getJson } from "./news-data";
import { Pane } from "./pane";
import { YICO } from "./yeta-icons";

type Sensor = { id: string; name?: string; keywords?: string[]; similar?: string[]; exclude?: string[]; sources?: string[]; expires?: string; on?: boolean; note?: string; by?: string; updated_at?: string; created_at?: string };
type Data = { bots?: Record<string, Sensor[]>; bot_names?: Record<string, string>; error?: string };
type Res = { ok?: boolean; bots?: Record<string, Sensor[]>; changed?: boolean; woke?: boolean; error?: string; code?: string };
const KEY = ["nomute", "sensors"] as const;
const SEEN = "nm_sensor_seen";
const p2 = (n: number | string) => String(n).padStart(2, "0");
const when = (iso?: string) => { const t = Date.parse(iso || ""); if (Number.isNaN(t)) return String(iso || ""); const d = new Date(t); return `${d.getMonth() + 1}. ${d.getDate()}. ${p2(d.getHours())}:${p2(d.getMinutes())}`; };   // 원본 snWhen(mmWhen)
const kst = (iso?: string) => { const t = Date.parse(iso || ""); return Number.isNaN(t) ? String(iso || "") : new Date(t + 9 * 3600000).toISOString().slice(0, 16).replace("T", " "); };   // 원본 snKst = 입력 꼴과 같음
const readSeen = () => { try { return +(localStorage.getItem(SEEN) || 0) || 0; } catch { return 0; } };

export function SensorModal() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, staleTime: 15_000, queryFn: async () => { const j = await getJson<Data>(`/api/sensors?_=${Date.now()}`); if (j.error) throw new Error(j.error); return j; } });
  const names = q.data?.bot_names || { chok: "촉" };
  const bots = q.data?.bots || {};
  const rows = Object.keys(names).flatMap((b) => (bots[b] || []).map((s) => ({ bot: b, s })));   // 원본 snRows = 봇 차례 = 이름표 차례
  const [seen] = useState(readSeen);   // 연 때 기준 = 그 뒤 바뀐 것만 ●(원본 = 그리고 나서 지금 시각으로 적음)
  useEffect(() => { if (q.data) try { localStorage.setItem(SEEN, String(Date.now())); } catch { /* 덤 */ } }, [q.data]);
  const [box, setBox] = useState(false), [text, setText] = useState(""), [edit, setEdit] = useState<{ bot: string; id: string } | null>(null), [open, setOpen] = useState(-1), [busy, setBusy] = useState(false), [note, setNote] = useState(""), [arm, setArm] = useState(-1);
  const inp = useRef<HTMLTextAreaElement>(null);
  const nm = (b?: string) => (b && names[b]) || b || "";
  const asText = (bot: string, s: Partial<Sensor>) => {   // 원본 snText — 입력칸·전문 = 「칸: 값」 줄
    const L = (a?: string[]) => (a || []).join(", ");
    const src = s.sources && s.sources.length ? s.sources.map((x) => (x === "gnews" ? "구글뉴스" : "수집함")).join(", ") : "수집함, 구글뉴스";
    return ["봇: " + nm(bot), "이름: " + (s.name || ""), "키워드: " + L(s.keywords), "유사어: " + L(s.similar), "제외어: " + L(s.exclude), "만료: " + kst(s.expires), "출처: " + src, "켬: " + (s.on === false ? "아니오" : "예"), "메모: " + (s.note || "")].join("\n");
  };
  const template = () => asText("chok", { expires: new Date(Date.now() + 86400000).toISOString() });   // 원본 snTemplate = 촉 · 만료 하루 뒤
  const parse = (t: string): { bot: string; s: Omit<Sensor, "id"> } | string => {   // 원본 snParse 그대로
    const f: Record<string, string> = {};
    for (const line of String(t || "").split("\n")) { const m = line.match(/^\s*([^:：]+)[:：]\s*(.*)$/); if (m) f[m[1].trim()] = m[2].trim(); }
    const bot = Object.keys(names).find((k) => k === f["봇"] || names[k] === f["봇"]);
    if (!bot) return "봇 칸에 " + Object.values(names).join("·") + " 중 하나를 적어줘.";
    const list = (v?: string) => [...new Set(String(v || "").split(/[,，]/).map((x) => x.trim()).filter(Boolean))];
    const keywords = list(f["키워드"]); if (!keywords.length) return "키워드를 하나 이상 적어줘.";
    const m = String(f["만료"] || "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/);
    if (!m) return "만료는 2026-10-28 09:00 꼴로 적어줘.";
    const expires = m[1] + "-" + p2(m[2]) + "-" + p2(m[3]) + "T" + p2(m[4] || 0) + ":" + p2(m[5] || 0) + ":00+09:00";   // 한국 시각
    if (Number.isNaN(Date.parse(expires)) || Date.parse(expires) <= Date.now()) return "만료 시각이 이미 지났어.";
    const raw = list(f["출처"]), sources = [...(raw.some((x) => /수집/.test(x)) ? ["collect"] : []), ...(raw.some((x) => /구글|google/i.test(x)) ? ["gnews"] : [])];
    const s: Omit<Sensor, "id"> = { name: f["이름"] || keywords[0], keywords, similar: list(f["유사어"]), exclude: list(f["제외어"]), sources: sources.length ? sources : ["collect", "gnews"], expires, on: !/^(아니오|아니|끔|off|no)$/i.test(f["켬"] || "") };
    if (f["메모"]) s.note = f["메모"];
    return { bot, s };
  };
  const save = async (bot: string, items: Sensor[]) => {   // 원본 snSave — 한 봇 칸 = 읽은 기준값(base) + 바꾼 목록 → 서버 병합 · 실패 = 사유 그대로(덮지 않음)
    setBusy(true); setNote("");
    try {
      const r = await fetch("/api/sensors", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ bot, base: bots[bot] || [], items }) });
      const j = (await r.json().catch(() => ({}))) as Res;
      if (!r.ok || !j.ok) { setNote(j.error || "저장하지 못했어. 다시 열어서 확인해줘."); await qc.invalidateQueries({ queryKey: KEY }); return false; }
      qc.setQueryData<Data>(KEY, (d) => ({ ...(d || {}), bots: j.bots }));
      if (j.changed) setNote(j.woke ? nm(bot) + "에게 바뀐 센서를 알렸어." : "저장했어. 봇 알림은 못 보냈어 — 다음에 깰 때 파일로 봐.");
      return true;
    } catch { setNote("연결이 끊겨 저장하지 못했어. 입력은 그대로 뒀어."); return false; }
    finally { setBusy(false); }
  };
  const openBox = (v: boolean, t?: string) => { setBox(v); if (!v) { setText(""); setEdit(null); } else { setText(t ?? template()); window.setTimeout(() => inp.current?.focus(), 40); } };
  const submit = async () => {   // 원본 snAdd — 같은 봇 안 수정 = 그 자리(id·처음 만든 시각 유지) · 봇을 바꾼 수정 = 옛 칸에서 빼고 새 칸에 추가
    if (busy) return;
    const p = parse(text); if (typeof p === "string") { setNote(p); return; }
    const mine = (b: string) => rows.filter((x) => x.bot === b).map((x) => x.s);
    let items: Sensor[];
    if (edit && edit.bot === p.bot) items = mine(p.bot).map((x) => (x.id === edit.id ? JSON.parse(JSON.stringify({ ...x, ...p.s, id: x.id, ...(p.s.note ? {} : { note: undefined }) })) : x));
    else {
      items = [...mine(p.bot), { id: "sn-" + Date.now().toString(36), ...p.s }];
      if (edit && !(await save(edit.bot, mine(edit.bot).filter((x) => x.id !== edit.id)))) return;
    }
    if (await save(p.bot, items)) openBox(false);
  };
  const del = async (i: number) => {   // 지우기 = 두 번 누름(메모와 같음 · 원본은 한 번 = 폰 손가락이라 한 번 더 묻기)
    if (arm !== i) { setArm(i); window.setTimeout(() => setArm((a) => (a === i ? -1 : a)), 3000); return; }
    setArm(-1); const it = rows[i]; if (it) await save(it.bot, rows.filter((x) => x.bot === it.bot && x.s.id !== it.s.id).map((x) => x.s));
  };
  const Chev = () => <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} />;
  const cur = open >= 0 ? rows[open] : undefined;
  return (
    <Pane title="센서">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo nm-sensor">
          <span className="ycd-nm yset-ttl">센서</span>
          <div className="nm-bar">   {/* 단추 = 카드 머리 밖(모달 안은 카드 머리 숨김 · yeta-settings.css) */}
            {cur ? <button type="button" className="nm-msg-back" onClick={() => setOpen(-1)} aria-label="목록으로"><Chev />목록</button> : <p className="nm-sensor-help">봇이 건 키워드 · 5분마다 보고 걸리면 그 봇을 깨워</p>}
            {!cur ? <button type="button" className="nm-memo-plus" aria-expanded={box} aria-label={box ? "입력칸 접기" : "센서 추가"} onClick={() => openBox(!box)}>{box ? "닫기" : "＋ 추가"}</button> : null}
          </div>
          {box && !cur ? (
            <div className="nm-memo-add">
              <textarea ref={inp} value={text} rows={9} spellCheck={false} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void submit(); } }} />
              <button type="button" className="ypc-go" disabled={busy || !text.trim()} onClick={submit}>{busy ? "저장 중…" : edit ? "고치기" : "저장"}</button>
            </div>
          ) : null}
          {note ? <p className="nm-chan-msg" role="status">{note}</p> : null}
          {cur ? (
            <div className="nm-msg-detail"><div className="hd"><span className="qt">{(cur.s.by ? nm(cur.s.by) + " · " : "") + when(cur.s.updated_at || cur.s.created_at)}</span></div><p className="bd">{asText(cur.bot, cur.s)}</p></div>
          ) : q.isLoading ? <p className="nm-chan-msg">불러오는 중…</p> : q.isError ? <p className="nm-chan-msg" role="alert">센서를 못 불러왔어 — {(q.error as Error)?.message || "연결 확인"}</p> : !rows.length ? <p className="nm-chan-msg">걸린 센서 없음 — ＋ 로 추가</p> : (
            <div className="nm-q-list" role="list">
              {rows.map(({ bot, s }, i) => {
                const by = s.by && s.by !== "세웅" ? s.by : "", fresh = !!by && Date.parse(s.updated_at || "") > seen;   // 봇이 바꾼 걸 아직 안 봄 = 앞에 ●
                const one = (fresh ? "● " : "") + (s.on === false ? "(쉼) " : "") + (s.name || s.id) + " — " + (s.keywords || []).concat(s.similar || []).join(", ");
                const tail = (by ? nm(by) + "이 바꿈 · " : "") + "만료 " + when(s.expires);
                const cp = [...one], sh = cp.length > 60 ? cp.slice(0, 60).join("") + "…" : one;
                return (
                  <div key={bot + s.id} role="listitem" className={`nm-q-row nm-memo-row nm-sensor-row${s.on === false ? " off" : ""}`} onClick={() => setOpen(i)}>
                    <span className="qt">{nm(bot)}</span>
                    <span className="qm" title={one + " · " + tail}><i>{sh}</i><small>{tail}</small></span>
                    <span className="qa"><button type="button" className="go gray" aria-label="센서 고치기" onClick={(e) => { e.stopPropagation(); setEdit({ bot, id: s.id }); openBox(true, asText(bot, s)); }}>고치기</button></span>
                    <span className="qa"><button type="button" className={`go ${arm === i ? "arm" : "gray"}`} aria-label={arm === i ? "한 번 더 누르면 지움" : "센서 지우기"} disabled={busy} onClick={(e) => { e.stopPropagation(); void del(i); }}>{arm === i ? "지울까?" : "지움"}</button></span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Pane>
  );
}

// 형 결정 모달 — 형 11-01 08:34 「내가 결정할 일이 있을 때 / 여기서 물음을 선택하면 고를 수 있는 기능이 대화창 안에 있으면 좋겠는데」 ·
//   08:36 「대화 못록 우하단에 네비게이션 처럼 노트 픽토그램으로 버튼에 개수 적혀잇어서 내가 그거 누르면 그 버튼 방향으로 부터의 팝업 모달로 선택지가 뜨고
//   질문과 선택지를 고를 수 있게하고 항목별로 완료되면 내가 그 창을 이탈할때 당사자들에게 훅이 가면 될듯 단 완료되면.」 · 08:37 「완료 안되면 안가고 잔여로 남고.
//   pass. 또는 기타도 있어야 함」 · 「질문마다 발제자가 있어야겠지」
//   서버 = 봄 08:38(GET·POST /api/office/decisions) · 고를 때마다 send 없이 바로 적음 · 창을 떠날 때(✕ · 바깥 · 폰 뒤로가기 · 화면 숨김) 고른 것만 send:true 한 번 = 그 발제자만 깸
//   (시아 08:37 「폰에선 앱이 그냥 꺼지거나 다른 앱으로 넘어가는 이탈도 있어」 · 그것도 못 받으면 서버 받침 2분) · 서버 답이 없으면 단추 0
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { idOf, office, people } from "../data/office";
import { FaceImg } from "./faces";

type Pick = { i?: number; pass?: boolean; text?: string };
export type Decision = { id: string; room: string; room_name?: string; who: string; q: string; choices: string[]; ts?: number; pick?: Pick | null };
const KEY = ["nomute", "decisions"];
const NUM = ["①", "②", "③", "④", "⑤", "⑥"];
const done = (p?: Pick | null) => !!p && (typeof p.i === "number" || !!p.pass || !!p.text);
type Sent = { id: string; room: string } & Pick;
/** 화면 숨김 때 보내기 한 번 — sendBeacon 이 안 되면 보통 POST · 둘 다 못 하면 서버 받침(2분 · 봄) */
const beacon = (picks: Sent[]) => { const b = JSON.stringify({ picks, send: true }); try { if (navigator.sendBeacon?.("/api/office/decisions", new Blob([b], { type: "application/json" }))) return; } catch { /* 아래 길 */ } void office("decisions", { method: "POST", body: b }).catch(() => undefined); };

export function DecideFab() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, queryFn: () => office<{ items?: Decision[] }>("decisions").then((j) => j.items || []), refetchInterval: 60_000, retry: false });
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const [open, setOpen] = useState(false), [picks, setPicks] = useState<Record<string, Pick>>({}), [etc, setEtc] = useState(""), [err, setErr] = useState("");
  const dirty = useRef(false), closing = useRef(false);
  const items = q.data || [];
  const pickOf = (d: Decision) => picks[d.id] || d.pick || null;
  const ready = useRef<() => Sent[]>(() => []);
  ready.current = () => items.flatMap((d) => { const p = pickOf(d); return done(p) ? [{ id: d.id, room: d.room, ...p }] : []; });   // 다 고른 항목만(안 고른 건 남음)
  const left = items.filter((d) => !done(pickOf(d))).length;

  const shut = () => {   // 떠날 때 = 고른 게 있으면 그때만 깨움(안 고른 항목은 남음)
    setOpen(false); setEtc("");
    const out = ready.current();
    if (!dirty.current || !out.length) return;
    dirty.current = false;
    void office<{ items?: Decision[] }>("decisions", { method: "POST", body: JSON.stringify({ picks: out, send: true }) })
      .then((j) => { if (j.items) qc.setQueryData(KEY, j.items); })   // 보낸 뒤 남은 목록이 바로 옴 = 개수 바로 고침(봄 08:44)
      .catch(() => beacon(out)).finally(() => { setPicks({}); void qc.invalidateQueries({ queryKey: KEY }); });
  };
  const close = () => { if (closing.current) return; closing.current = true; history.back(); };   // 뒤로가기와 같은 길(폰 뒤로가기 = 닫기 · 형 10-31)
  useEffect(() => {
    if (!open) return undefined;
    closing.current = false;
    history.pushState({ ...history.state, nmDecide: 1 }, "");
    const pop = () => shut();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    const hide = () => { const out = ready.current(); if (document.visibilityState === "hidden" && dirty.current && out.length) { dirty.current = false; beacon(out); } };
    window.addEventListener("popstate", pop); window.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", hide); window.addEventListener("pagehide", hide);
    return () => { window.removeEventListener("popstate", pop); window.removeEventListener("keydown", key); document.removeEventListener("visibilitychange", hide); window.removeEventListener("pagehide", hide); };
  }, [open]);   // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (d: Decision, p: Pick) => {   // 고르면 바로 서버에 적음(send 없음 = 안 깨움) · 보내기는 떠날 때
    setPicks((m) => ({ ...m, [d.id]: p })); setEtc(""); setErr("");
    try {
      const j = await office<{ bad?: { id: string; why?: string }[] }>("decisions", { method: "POST", body: JSON.stringify({ picks: [{ id: d.id, room: d.room, ...p }] }) });
      const bad = (j.bad || []).find((x) => x.id === d.id);   // 봄 08:44 「둘 이상이거나 빈 기타·틀린 번호면 그 줄만 bad」 = 안 적힘
      if (bad) throw new Error(bad.why || "서버가 안 받았어");
      dirty.current = true;
    }
    catch (e) { setPicks((m) => { const n = { ...m }; delete n[d.id]; return n; }); setErr(`못 적었어 · ${(e as Error).message}`); }
  };
  const etcSubmit = (d: Decision) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = String(new FormData(e.currentTarget).get("t") || "").trim();
    if (t) void pick(d, { text: t });
  };

  if (q.isError || !items.length) return null;
  return (
    <>
      <button type="button" className={`nm-dec${open ? " on" : ""}`} aria-expanded={open} aria-label={`형 결정 ${left}개`} onClick={() => (open ? close() : setOpen(true))}>
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h6" /><path d="m8.5 14 2.2 2.2L15.5 11.5" /></svg>
        {left ? <b className="nm-rcount">{left > 99 ? "99+" : left}</b> : null}
      </button>
      {open ? (
        <>
          <div className="nm-dec-scrim" aria-hidden onClick={close} />
          <section role="dialog" aria-modal="true" aria-label="형 결정" className="nm-decpop">
            <header><b>형 결정</b><span>{left ? `남은 것 ${left}` : "다 골랐어"} · 닫으면 고른 것만 가</span><button type="button" aria-label="닫기" onClick={close}>✕</button></header>
            <ul>
              {items.map((d) => {
                const p = pickOf(d), name = list.find((x) => x.who === d.who)?.name || d.who;
                return (
                  <li key={d.id} className={done(p) ? "ok" : ""}>
                    <p className="nm-dec-who"><FaceImg id={idOf(d.who, list)} size={22} /><b>{name}</b><span>{d.room_name || d.room}</span></p>
                    <p className="nm-dec-q" data-content>{d.q}</p>
                    <div className="nm-dec-ch">
                      {d.choices.map((c, i) => <button key={i} type="button" aria-pressed={p?.i === i} onClick={() => void pick(d, { i })}>{NUM[i] || `${i + 1}.`} {c}</button>)}
                      <button type="button" aria-pressed={!!p?.pass} onClick={() => void pick(d, { pass: true })}>pass</button>
                      <button type="button" aria-pressed={!!p?.text} onClick={() => setEtc(etc === d.id ? "" : d.id)}>기타</button>
                    </div>
                    {etc === d.id ? (
                      <form className="nm-dec-etc" onSubmit={etcSubmit(d)}>
                        <input name="t" autoFocus defaultValue={p?.text || ""} placeholder="형 말로 한 줄" aria-label="기타 답" />
                        <button type="submit">확인</button>
                      </form>
                    ) : p?.text ? <p className="nm-dec-said">기타 · {p.text}</p> : null}
                  </li>
                );
              })}
            </ul>
            {err ? <p role="alert" className="nm-dec-err">{err}</p> : null}
          </section>
        </>
      ) : null}
    </>
  );
}

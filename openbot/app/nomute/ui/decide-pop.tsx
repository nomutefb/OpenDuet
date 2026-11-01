// 형 결정 모달 — 형 11-01 08:34 「내가 결정할 일이 있을 때 / 여기서 물음을 선택하면 고를 수 있는 기능이 대화창 안에 있으면 좋겠는데」 ·
//   08:36 「대화 못록 우하단에 네비게이션 처럼 노트 픽토그램으로 버튼에 개수 적혀잇어서 내가 그거 누르면 그 버튼 방향으로 부터의 팝업 모달로 선택지가 뜨고
//   질문과 선택지를 고를 수 있게하고 항목별로 완료되면 내가 그 창을 이탈할때 당사자들에게 훅이 가면 될듯 단 완료되면.」 · 08:37 「완료 안되면 안가고 잔여로 남고.
//   pass. 또는 기타도 있어야 함」 · 「질문마다 발제자가 있어야겠지」
//   서버 = 봄 08:38(GET·POST /api/office/decisions) · 고를 때마다 send 없이 바로 적음 · 창을 떠날 때(✕ · 바깥 · 폰 뒤로가기 · 화면 숨김) 고른 것만 send:true 한 번 = 그 발제자만 깸
//   (시아 08:37 「폰에선 앱이 그냥 꺼지거나 다른 앱으로 넘어가는 이탈도 있어」 · 그것도 못 받으면 서버 받침 2분) · 서버 답이 없으면 단추 0
//   ✓ 전송 단추는 뺌(형 09:13 「그리고 전송은 미안한데 없어도 되겟다 그냥 닫는게 더 편하네 단 너네한테 가고 동기화만 할일에 반영되면 될듯」) = 닫기가 곧 보내기
//   고르는 손맛(형 11-02 07:4x 시아 창 「그 결정창에서, 내용을 입력한 다음에 이제 확인을 눌러야되는데 확인이 비활성화된거같아서 누르면 또 결정이됫대. … 결정이 불이 들어와있어야되는데,
//   그래서 아예 그거를 전송버튼을 가져다가 쓰고, 전송대신 확인 으로 눌러서 게이지 차서 그냥 체크되게 하라는거지 후딱 안없어져도되니까 사용감이」 · 「그리고 창이 확 그 질문이 없어진다기보다는 자연스럽게 사라지는 느낌을 줘서」 ·
//   「응 전송버튼 edit.nomute.kr에 썸네일 만드는 부분보면, 사진 섬넹일 조건 다 통과하고 전송 누르면 가는거잇잖아? 그거 쓰면돼」 · 「그리고 대형 버튼 은, 그 뉴스 요약부에 프롬프트 생성 이런 버튼들 있어, 생성 안할때는 빛이 지나가는 광원효과도 넣었었는데 그거 그대로 가져다 쓰면되고,」)
//   = 고를 것 ①② = 뉴스 요약 .mkbtn(큰 유리 · 쉴 때 빛줄기 mkBeam) · 누름 = 썸네일 .go 차례(라임 게이지 0.9초 → ✓ 커졌다 작아짐 dlChkPop) → ✓ 1초 남김 → 그 질문이 접히며 사라짐(목록에서만 · 고른 건 닫을 때 감)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { idOf, office, people } from "../data/office";
import { FaceImg } from "./faces";

type Pick = { i?: number; pass?: boolean; text?: string };
export type Decision = { id: string; room: string; room_name?: string; who: string; q: string; choices: string[]; ts?: number; pick?: Pick | null };
const KEY = ["nomute", "decisions"];
const NUM = ["①", "②", "③", "④", "⑤", "⑥"];
const done = (p?: Pick | null) => !!p && (typeof p.i === "number" || !!p.pass || !!p.text);
type Fx = { k: string; st: "fill" | "ok" | "bye" | "err" };
const HOLD = 900, SHOW = 1000, FADE = 480, ERR = 1700;   // 게이지 = 옛 goFire 0.9초 · ✓ 1초 남김(「후딱 안없어져도되니까」) · 접힘 0.48초 · 실패 흔들림 뒤 원래대로
const later = (ms: number) => new Promise((r) => setTimeout(r, ms));
const Ck = () => <svg className="nm-dec-ck" viewBox="0 0 24 24" role="img" aria-label="골랐어"><path d="M5 13l4 4L19 7" /></svg>;
type Sent = { id: string; room: string } & Pick;
/** 화면 숨김 때 보내기 한 번 — sendBeacon 이 안 되면 보통 POST · 둘 다 못 하면 서버 받침(2분 · 봄) */
const beacon = (picks: Sent[]) => { const b = JSON.stringify({ picks, send: true }); try { if (navigator.sendBeacon?.("/api/office/decisions", new Blob([b], { type: "application/json" }))) return; } catch { /* 아래 길 */ } void office("decisions", { method: "POST", body: b }).catch(() => undefined); };

/** 홈 「할 일」 결정 카드가 같은 창을 연다(봄 11-01 09:04 나눔 · 형 09:04 「내가 답변햇는데 할일에 또 나오더라고 … 질문이 할일이 더 퀄리티가 떨어지거든? 내용이 달라」) */
export const DECIDE_OPEN = "nm-decide-open";
export const openDecide = (where: string) => window.dispatchEvent(new CustomEvent(DECIDE_OPEN, { detail: where }));
export const useDecisions = () => useQuery({ queryKey: KEY, queryFn: () => office<{ items?: Decision[] }>("decisions").then((j) => j.items || []), refetchInterval: 60_000, retry: false });

/** fab = 대화방 우하단 노트 단추 + 모달 · fab=false = 단추 없이 모달만(where 로 부르면 열림 · 홈) */
export function DecideFab({ fab = true, where = "rooms" }: { fab?: boolean; where?: string }) {
  const qc = useQueryClient();
  const q = useDecisions();
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const [open, setOpen] = useState(false), [picks, setPicks] = useState<Record<string, Pick>>({}), [etc, setEtc] = useState(""), [err, setErr] = useState("");
  const [fx, setFx] = useState<Record<string, Fx>>({}), [gone, setGone] = useState<Set<string>>(() => new Set());   // fx = 누른 단추 차례 · gone = 접혀 사라진 질문(이 창에서만)
  const dirty = useRef(false), closing = useRef(false);
  const items = q.data || [];
  const pickOf = (d: Decision) => picks[d.id] || d.pick || null;
  const ready = useRef<() => Sent[]>(() => []);
  // 한 결정은 한 번만 보냄(시아 11-01 10:55 「같은 답이 세 번 왔어」 · 10:54:53 1ms·444ms 차) = 보낸 id 기억 · 보내는 중 다시 안 쏨 · id 겹침 뺌 · 실패 뒤 다시 쏘기 0(받침 = 서버 2분)
  const sent = useRef(new Set<string>()), sending = useRef(false);
  ready.current = () => [...new Map(items.flatMap((d) => { const p = pickOf(d); return done(p) && !sent.current.has(d.id) ? [[d.id, { id: d.id, room: d.room, ...p }] as const] : []; })).values()];   // 다 고른 항목만(안 고른 건 남음)
  const left = items.filter((d) => !done(pickOf(d))).length;

  const shut = () => {   // 떠날 때 = 고른 게 있으면 그때만 깨움(안 고른 항목은 남음)
    setOpen(false); setEtc("");
    const out = ready.current();
    if (sending.current || !dirty.current || !out.length) return;
    dirty.current = false; sending.current = true; out.forEach((x) => sent.current.add(x.id));
    void office<{ items?: Decision[] }>("decisions", { method: "POST", body: JSON.stringify({ picks: out, send: true }) })
      .then((j) => { if (j.items) qc.setQueryData(KEY, j.items); })   // 보낸 뒤 남은 목록이 바로 옴 = 개수 바로 고침(봄 08:44)
      .catch(() => undefined).finally(() => { sending.current = false; setPicks({}); void qc.invalidateQueries({ queryKey: KEY }); });
  };
  const close = () => { if (closing.current) return; closing.current = true; history.back(); };   // 뒤로가기와 같은 길(폰 뒤로가기 = 닫기 · 형 10-31)
  useEffect(() => {   // 다른 화면(홈 할 일)이 부르면 이 자리 모달이 열림
    const on = (e: Event) => { if ((e as CustomEvent).detail === where) setOpen(true); };
    window.addEventListener(DECIDE_OPEN, on);
    return () => window.removeEventListener(DECIDE_OPEN, on);
  }, [where]);
  useEffect(() => {
    if (!open) return undefined;
    closing.current = false; setFx({}); setGone(new Set());
    history.pushState({ ...history.state, nmDecide: 1 }, "");
    const pop = () => shut();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    const hide = () => { if (sending.current) return; const out = ready.current(); if (document.visibilityState === "hidden" && dirty.current && out.length) { dirty.current = false; out.forEach((x) => sent.current.add(x.id)); beacon(out); } };
    window.addEventListener("popstate", pop); window.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", hide); window.addEventListener("pagehide", hide);
    return () => { window.removeEventListener("popstate", pop); window.removeEventListener("keydown", key); document.removeEventListener("visibilitychange", hide); window.removeEventListener("pagehide", hide); };
  }, [open]);   // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (d: Decision, p: Pick): Promise<boolean> => {   // 고르면 바로 서버에 적음(send 없음 = 안 깨움) · 보내기는 떠날 때
    setPicks((m) => ({ ...m, [d.id]: p })); setErr("");
    try {
      const j = await office<{ bad?: { id: string; why?: string }[] }>("decisions", { method: "POST", body: JSON.stringify({ picks: [{ id: d.id, room: d.room, ...p }] }) });
      const bad = (j.bad || []).find((x) => x.id === d.id);   // 봄 08:44 「둘 이상이거나 빈 기타·틀린 번호면 그 줄만 bad」 = 안 적힘
      if (bad) throw new Error(bad.why || "서버가 안 받았어");
      dirty.current = true;
      return true;
    }
    catch (e) { setPicks((m) => { const n = { ...m }; delete n[d.id]; return n; }); setErr(`못 적었어 · ${(e as Error).message}`); return false; }
  };
  const put = (id: string, f: Fx | null) => setFx((m) => { const n = { ...m }; if (f) n[id] = f; else delete n[id]; return n; });
  const choose = async (d: Decision, p: Pick, k: string) => {   // 누름 → 게이지(적는 동안 · 빨라도 0.9초) → ✓ 1초 → 접힘 → 목록에서 뺌
    if (fx[d.id] && fx[d.id].st !== "err") return;
    if (k !== "etc") setEtc("");
    put(d.id, { k, st: "fill" });
    const t0 = Date.now(), ok = await pick(d, p);
    await later(Math.max(0, HOLD - (Date.now() - t0)));
    if (!ok) { put(d.id, { k, st: "err" }); await later(ERR); setFx((m) => (m[d.id]?.st === "err" ? (({ [d.id]: _x, ...r }) => r)(m) : m)); return; }
    put(d.id, { k, st: "ok" });
    await later(SHOW);
    put(d.id, { k, st: "bye" });
    await later(FADE);
    setGone((g) => new Set(g).add(d.id));
    if (k === "etc") setEtc((e) => (e === d.id ? "" : e));
  };
  const stOf = (d: Decision, k: string) => (fx[d.id]?.k === k ? fx[d.id].st : "idle");
  const face = (st: string, label: ReactNode) => <><span className="t">{label}</span>{st === "ok" || st === "bye" ? <Ck /> : null}</>;
  const etcSubmit = (d: Decision) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = String(new FormData(e.currentTarget).get("t") || "").trim();
    if (t) void choose(d, { text: t }, "etc");
  };

  if (q.isError || !items.length) return null;
  return (
    <>
      {fab ? <button type="button" className={`nm-dec${open ? " on" : ""}`} aria-expanded={open} aria-label={`형 결정 ${left}개`} onClick={() => (open ? close() : setOpen(true))}>
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h6" /><path d="m8.5 14 2.2 2.2L15.5 11.5" /></svg>
        {left ? <b className="nm-rcount">{left > 99 ? "99+" : left}</b> : null}
      </button> : null}
      {open ? createPortal(   // body 로 뺌 = 유리 카드(backdrop-filter) 안에서 불러도 화면 기준 자리(홈 할 일 카드)
        <>
          <div className="nm-dec-scrim" aria-hidden onClick={close} />
          <section role="dialog" aria-modal="true" aria-label="형 결정" className="nm-decpop">
            <header><b>형 결정</b><span>{left ? `남은 것 ${left}` : "다 골랐어"} · 닫으면 고른 것만 가</span><button type="button" aria-label="닫기" onClick={close}>✕</button></header>
            <ul>
              {items.every((d) => gone.has(d.id)) ? <li className="nm-dec-all">다 골랐어 · 닫으면 고른 게 가</li> : null}
              {items.filter((d) => !gone.has(d.id)).map((d) => {
                const p = pickOf(d), name = list.find((x) => x.who === d.who)?.name || d.who;
                return (
                  <li key={d.id} className={`${done(p) ? "ok" : ""}${fx[d.id]?.st === "bye" ? " bye" : ""}`}><div className="nm-dec-in">
                    <p className="nm-dec-who"><FaceImg id={idOf(d.who, list)} size={22} /><b>{name}</b><span>{d.room_name || d.room}</span></p>
                    <p className="nm-dec-q" data-content>{d.q}</p>
                    <div className="nm-dec-ch">
                      {d.choices.map((c, i) => { const st = stOf(d, `c${i}`); return <button key={i} type="button" className="nm-dec-big" data-stage={st} aria-pressed={p?.i === i} onClick={() => void choose(d, { i }, `c${i}`)}>{face(st, `${NUM[i] || `${i + 1}.`} ${c}`)}</button>; })}
                    </div>
                    <div className="nm-dec-sub">
                      <button type="button" data-stage={stOf(d, "pass")} aria-pressed={!!p?.pass} onClick={() => void choose(d, { pass: true }, "pass")}>{face(stOf(d, "pass"), "pass")}</button>
                      <button type="button" data-stage="idle" aria-pressed={!!p?.text || etc === d.id} onClick={() => setEtc(etc === d.id ? "" : d.id)}>기타</button>
                    </div>
                    {etc === d.id ? (
                      <form className="nm-dec-etc" onSubmit={etcSubmit(d)}>
                        <input name="t" autoFocus defaultValue={p?.text || ""} placeholder="형 말로 한 줄" aria-label="기타 답" />
                        <button type="submit" className="nm-dec-go" data-stage={stOf(d, "etc")}>{face(stOf(d, "etc"), "확인")}</button>
                      </form>
                    ) : p?.text ? <p className="nm-dec-said">기타 · {p.text}</p> : null}
                  </div></li>
                );
              })}
            </ul>
            {err ? <p role="alert" className="nm-dec-err">{err}</p> : null}
          </section>
        </>, document.body,
      ) : null}
    </>
  );
}

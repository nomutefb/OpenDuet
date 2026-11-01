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
//   다듬음(형 11-02 08:1x 시아 창 「저 게이지 ㅊ ㅔ크 버튼은 근데 좀 과하긴해, 효과만 빼면 좋을거같애 저 둥그런거를 모서리둥근효과를 거의 없애서 끝에만 살짝 둥글게 하고, 좌측정렬로빼고, 내가 누르면 형광이 돌게해주고, 빛 지나가는건 없어도 돼, (저기서는)」 ·
//   「그리고 지금 배경보다 좀 더 패인느낌을 주려면 어떻게해야하지? 적당히해보고, ㅣ누르면 바로 반영되게, 그리고 저기에 애초에 기타를 넣어. 패스는 없어도 돼 기타로 갈음할거야. 그리고 질문시작점을 도형 변 시작점으로 해. … 질문 누르면 그냥 질문에 불이 들어온다음에 사라져도 돼. 기타를 누르면 대신 창이 흔들리지않고 입력칸이 뜨고」 ·
//   「형 결정 > 의사 결정」 · 「옆에 설명글은 빼줘」)
//   = 고를 줄 = 배경보다 패인 홈(안 그림자) · 모서리 살짝 · 왼쪽 정렬 · 누르면 바로 라임 형광 → 0.9초 뒤 그 질문 접혀 사라짐 · 게이지·✓·빛줄기 없음 · pass 뺌 · 기타 = 마지막 줄 · 누르면 그 줄이 같은 높이로 입력칸이 됨(창 높이 안 바뀜)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { idOf, office, people } from "../data/office";
import { FaceImg } from "./faces";

type Pick = { i?: number; pass?: boolean; text?: string };
export type Decision = { id: string; room: string; room_name?: string; who: string; q: string; choices: string[]; ts?: number; pick?: Pick | null };
const KEY = ["nomute", "decisions"];
const done = (p?: Pick | null) => !!p && (typeof p.i === "number" || !!p.pass || !!p.text);
type Fx = { k: string; st: "on" | "bye" };
const SHOW = 900, FADE = 480;   // 형광 0.9초 남김(「후딱 안없어져도되니까」) · 접힘 0.48초
const later = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** 기타 줄 = 같은 자리에서 입력칸으로(창 높이 안 바뀜) · 열면 바로 글자 칸에(화면 안 밀림) */
function EtcRow({ text, on, onSubmit }: { text: string; on: boolean; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  return (
    <form className="nm-dec-row nm-dec-etc" data-on={on || undefined} onSubmit={onSubmit}>
      <input ref={ref} name="t" defaultValue={text} placeholder="직접 입력" aria-label="기타 답" enterKeyHint="done" />
      <button type="submit" className="nm-dec-ok">확인</button>
    </form>
  );
}
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
  const [fx, setFx] = useState<Record<string, Fx>>({}), [gone, setGone] = useState<Set<string>>(() => new Set());   // fx = 불 들어온 줄 · gone = 접혀 사라진 질문(이 창에서만)
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
  const choose = async (d: Decision, p: Pick, k: string) => {   // 누름 = 바로 형광(「누르면 바로 반영되게」) · 적기는 뒤에서 · 0.9초 뒤 접힘 → 목록에서 뺌 · 못 적으면 불 끔
    if (fx[d.id]) return;
    if (k !== "etc") setEtc("");
    put(d.id, { k, st: "on" });
    const t0 = Date.now(), ok = await pick(d, p);
    if (!ok) { put(d.id, null); return; }
    await later(Math.max(0, SHOW - (Date.now() - t0)));
    put(d.id, { k, st: "bye" });
    await later(FADE);
    setGone((g) => new Set(g).add(d.id));
    if (k === "etc") setEtc((e) => (e === d.id ? "" : e));
  };
  const isOn = (d: Decision, k: string) => fx[d.id]?.k === k;
  const etcSubmit = (d: Decision) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = String(new FormData(e.currentTarget).get("t") || "").trim();
    if (t) void choose(d, { text: t }, "etc");
  };

  if (q.isError || !items.length) return null;
  return (
    <>
      {fab ? <button type="button" className={`nm-dec${open ? " on" : ""}`} aria-expanded={open} aria-label={`의사 결정 ${left}개`} onClick={() => (open ? close() : setOpen(true))}>
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h6" /><path d="m8.5 14 2.2 2.2L15.5 11.5" /></svg>
        {left ? <b className="nm-rcount">{left > 99 ? "99+" : left}</b> : null}
      </button> : null}
      {open ? createPortal(   // body 로 뺌 = 유리 카드(backdrop-filter) 안에서 불러도 화면 기준 자리(홈 할 일 카드)
        <>
          <div className="nm-dec-scrim" aria-hidden onClick={close} />
          <section role="dialog" aria-modal="true" aria-label="의사 결정" className="nm-decpop">
            <header><b>의사 결정</b><button type="button" aria-label="닫기" onClick={close}>✕</button></header>
            <ul>
              {items.every((d) => gone.has(d.id)) ? <li className="nm-dec-all">다 골랐어</li> : null}
              {items.filter((d) => !gone.has(d.id)).map((d) => {
                const p = pickOf(d), name = list.find((x) => x.who === d.who)?.name || d.who;
                return (
                  <li key={d.id} className={`${done(p) ? "ok" : ""}${fx[d.id]?.st === "bye" ? " bye" : ""}`}><div className="nm-dec-in">
                    <p className="nm-dec-who"><FaceImg id={idOf(d.who, list)} size={22} /><b>{name}</b><span>{d.room_name || d.room}</span></p>
                    <p className="nm-dec-q" data-content>{d.q}</p>
                    <div className="nm-dec-ch">
                      {d.choices.map((c, i) => <button key={i} type="button" className="nm-dec-row" data-on={isOn(d, `c${i}`) || undefined} aria-pressed={p?.i === i} onClick={() => void choose(d, { i }, `c${i}`)}>{c}</button>)}
                      {etc === d.id
                        ? <EtcRow text={p?.text || ""} on={isOn(d, "etc")} onSubmit={etcSubmit(d)} />
                        : <button type="button" className="nm-dec-row" aria-pressed={!!p?.text} onClick={() => setEtc(d.id)}>{p?.text ? `기타 · ${p.text}` : "기타"}</button>}
                    </div>
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

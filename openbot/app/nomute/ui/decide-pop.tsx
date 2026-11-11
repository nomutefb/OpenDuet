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
import { tailnetUrl } from "./pc-url";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { idOf, office, people } from "../data/office";
import { FaceImg } from "./faces";

type Pick = { i?: number; pass?: boolean; text?: string };
export type Decision = { id: string; room: string; room_name?: string; who: string; q: string; choices: string[]; ts?: number; pick?: Pick | null; kind?: string; pc?: { task?: string; url?: string }; _dups?: string[] };   // pc = 컴퓨터 · 조치 필요 카드(서버 _pcreq.js · 형 11-06 「본인이 권한이 필요하면ㅇ ㅣ렇게 요청을해.」 · 「그러면 내가 그걸 제어하는 방식이야.」)
// 영상 해석 허가 동그라미·진행 칸 없앰(형 11-05 11:10 「그럼 이제 그 채팅창 우하단에 영상 신청 이거는 없어도되는거지? 판단해보고, 별 의미없는 코드니까. 기능을 없애고 디자인도 없애줘.」 · 서버도 요청 = 바로 상주)
//   = 옛 영상 카드(서버 kind "videoreq" · 물음 머리 「영상 해석 허가?」)는 결정 창에 안 섞음
export const isVideoReq = (d: Decision) => d.kind === "videoreq" || /^\s*(\[결정\]\s*)?영상 해석 허가\?/.test(d.q || "");
type Kind = "dec" | "all";
const ofKind = (_k: Kind) => (d: Decision) => !isVideoReq(d);
// 같은 질문 또 뜸 막기(형 11-02 11:15 「의사결정 받는 판 같은 질문이면 같은 거 또 못올리게 해줘 왠진 모르겠는데 또 올라오네」)
//   = 묻는 이가 형인 것 뺌(형 글에 「결정」이 들어가 형한테 묻는 결정으로 잡힌 것 · 11-02 01:25 회의실 글 · 서버 막기는 봄) · 같은 방·같은 질문은 하나만(나머지 id 는 _dups = 고르면 같은 답을 같이 보냄 → 다시 안 떠오름)
const HYUNG = new Set(["형", "세웅"]);
const tidy = (list: Decision[]) => {
  const seen = new Map<string, Decision>();
  for (const d of list) {
    if (HYUNG.has(d.who)) continue;
    const k = `${d.room}|${String(d.q || "").replace(/\s+/g, " ").trim()}`, first = seen.get(k);
    if (first) first._dups = [...(first._dups || []), d.id];
    else seen.set(k, { ...d });
  }
  return [...seen.values()];
};
const withDups = (d: Decision, p: Pick) => [{ id: d.id, room: d.room, ...p }, ...(d._dups || []).map((id) => ({ id, room: d.room, ...p }))];
const KEY = ["nomute", "decisions"];
const done = (p?: Pick | null) => !!p && (typeof p.i === "number" || !!p.pass || !!p.text);
type Fx = { k: string; st: "on0" | "run" | "done" | "ck" | "bye" };
// 차오름 = 뉴스 요약 「프롬프트 생성」 .mkbtn.glive 그대로(editor viewer/index.html 3092~ · 답 기다리는 동안 0→90% 3.6초 gauge-ease · 답 오면 100% 0.3초 linear · ✓ = goTick .38s .04s ease)
//   (형 11-02 10:37 「누르면 차는 모션 그 프롬프트 생성 그거 가져와서 진하개는 말고 지금 톤 유지하면서 채워지고 체크뜨는거 그 코드의 이징 속도 그대로 적용 해주면 될듯. 완료된 내역은 안보여도돼.」)
const FULL = 300, TICK = 380 + 40, HOLD = 520, FADE = 480;   // 100% 마무리 · ✓ 그리기 · ✓ 남김 · 접힘
const Ck = () => <svg className="nm-dec-ck" viewBox="0 0 24 24" role="img" aria-label="골랐어"><path d="M5 13l4 4L19 7" /></svg>;
const drawn = (st?: Fx["st"]) => st === "ck" || st === "bye";
const later = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** 기타 줄 = 같은 자리에서 입력칸으로(창 높이 안 바뀜) · 열면 바로 글자 칸에(화면 안 밀림) */
function EtcRow({ text, on, fill, onSubmit }: { text: string; on: boolean; fill?: Fx["st"]; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  return (
    <form className="nm-dec-row nm-dec-etc" data-on={on || undefined} data-fill={fill} onSubmit={onSubmit}>
      <input ref={ref} name="t" defaultValue={text} placeholder="직접 입력" aria-label="기타 답" enterKeyHint="done" />
      <button type="submit" className="nm-dec-ok">{drawn(fill) ? <Ck /> : "확인"}</button>
    </form>
  );
}
type Sent = { id: string; room: string } & Pick;
/** 화면 숨김 때 보내기 한 번 — sendBeacon 이 안 되면 보통 POST · 둘 다 못 하면 서버 받침(2분 · 봄) */
const beacon = (picks: Sent[]) => { const b = JSON.stringify({ picks, send: true }); try { if (navigator.sendBeacon?.("/api/office/decisions", new Blob([b], { type: "application/json" }))) return; } catch { /* 아래 길 */ } void office("decisions", { method: "POST", body: b }).catch(() => undefined); };

/** 홈 「할 일」 결정 카드가 같은 창을 연다(봄 11-01 09:04 나눔 · 형 09:04 「내가 답변햇는데 할일에 또 나오더라고 … 질문이 할일이 더 퀄리티가 떨어지거든? 내용이 달라」) */
export const DECIDE_OPEN = "nm-decide-open";
export const openDecide = (where: string) => window.dispatchEvent(new CustomEvent(DECIDE_OPEN, { detail: where }));
export const useDecisions = () => useQuery({ queryKey: KEY, queryFn: () => office<{ items?: Decision[] }>("decisions").then((j) => tidy(j.items || [])), refetchInterval: 60_000, retry: false });

/** fab = 대화방 우하단 노트 단추 + 모달 · fab=false = 단추 없이 모달만(where 로 부르면 열림 · 홈) · kind = dec(결정) · all(홈) · 옛 영상 허가 카드는 둘 다 뺌 */
export function DecideFab({ fab = true, where = "rooms", kind = "dec" }: { fab?: boolean; where?: string; kind?: Kind }) {
  const qc = useQueryClient();
  const q = useDecisions();
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const [open, setOpen] = useState(false), [picks, setPicks] = useState<Record<string, Pick>>({}), [etc, setEtc] = useState(""), [err, setErr] = useState("");
  const [fx, setFx] = useState<Record<string, Fx>>({}), [gone, setGone] = useState<Set<string>>(() => new Set());   // fx = 불 들어온 줄 · gone = 접혀 사라진 질문(이 창에서만)
  const dirty = useRef(false), closing = useRef(false);
  const all = q.data || [], items = all.filter(ofKind(kind));
  const title = "의사 결정";
  const pickOf = (d: Decision) => picks[d.id] || d.pick || null;
  const ready = useRef<() => Sent[]>(() => []);
  // 한 결정은 한 번만 보냄(시아 11-01 10:55 「같은 답이 세 번 왔어」 · 10:54:53 1ms·444ms 차) = 보낸 id 기억 · 보내는 중 다시 안 쏨 · id 겹침 뺌 · 실패 뒤 다시 쏘기 0(받침 = 서버 2분)
  const sent = useRef(new Set<string>()), sending = useRef(false);
  ready.current = () => [...new Map(items.flatMap((d) => { const p = pickOf(d); return done(p) && !sent.current.has(d.id) ? withDups(d, p!).map((x) => [x.id, x] as const) : []; })).values()];   // 다 고른 항목만(안 고른 건 남음)
  const left = items.filter((d) => !done(pickOf(d))).length;

  const shut = () => {   // 떠날 때 = 고른 게 있으면 그때만 깨움(안 고른 항목은 남음)
    setOpen(false); setEtc("");
    const out = ready.current();
    if (sending.current || !dirty.current || !out.length) { void qc.invalidateQueries({ queryKey: KEY }); return; }   // 고를 때 이미 보냄 = 닫으면 개수만 새로
    dirty.current = false; sending.current = true; out.forEach((x) => sent.current.add(x.id));
    void office<{ items?: Decision[] }>("decisions", { method: "POST", body: JSON.stringify({ picks: out, send: true }) })
      .then((j) => { if (j.items) qc.setQueryData(KEY, tidy(j.items)); })   // 보낸 뒤 남은 목록이 바로 옴 = 개수 바로 고침(봄 08:44) · 같은 거르기
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
      const j = await office<{ bad?: { id: string; why?: string }[] }>("decisions", { method: "POST", body: JSON.stringify({ picks: withDups(d, p), send: true }) });   // 고르면 그 결정만 바로 보냄 = 따로 전송 0(형 11-11 19:45 봄 1:1 「글구 이거 그냥 결정하면 바로 넘어가면 될거같은데전송이 잇어어되나 싳음」 · 「내가 결정하면 그냥 창 닫히고 그 뒤에서 백단에서 처리하면 될듯」 · 뜸)
      const bad = (j.bad || []).find((x) => x.id === d.id);   // 봄 08:44 「둘 이상이거나 빈 기타·틀린 번호면 그 줄만 bad」 = 안 적힘
      if (bad) throw new Error(bad.why || "서버가 안 받았어");
      withDups(d, p).forEach((x) => sent.current.add(x.id));   // 보냄 = 닫을 때 다시 안 보냄
      return true;
    }
    catch (e) { setPicks((m) => { const n = { ...m }; delete n[d.id]; return n; }); setErr(`못 적었어 · ${(e as Error).message}`); return false; }
  };
  const put = (id: string, f: Fx | null) => setFx((m) => { const n = { ...m }; if (f) n[id] = f; else delete n[id]; return n; });
  const choose = async (d: Decision, p: Pick, k: string) => {   // 누름 = 바로 형광 + 차오름(적는 동안 90% 까지) → 답 오면 100% → ✓ → 접힘 → 목록에서 뺌 · 못 적으면 불 끔
    if (fx[d.id]) return;
    if (k !== "etc") setEtc("");
    put(d.id, { k, st: "on0" });
    await later(34);   // 0% 를 한 번 그린 뒤 90% 로 = 차오름이 보임(원본 rAF grun 자리)
    put(d.id, { k, st: "run" });
    const ok = await pick(d, p);
    if (!ok) { put(d.id, null); return; }
    put(d.id, { k, st: "done" });
    await later(FULL);
    put(d.id, { k, st: "ck" });
    await later(TICK + HOLD);
    put(d.id, { k, st: "bye" });
    await later(FADE);
    setGone((g) => new Set(g).add(d.id));
    if (k === "etc") setEtc((e) => (e === d.id ? "" : e));
  };
  const isOn = (d: Decision, k: string) => fx[d.id]?.k === k;
  const fillOf = (d: Decision, k: string) => (fx[d.id]?.k === k ? fx[d.id].st : undefined);
  useEffect(() => {   // 다 고르면 창이 저절로 닫힘(「완료된 내역은 안보여도돼」)
    if (open && items.length > 0 && items.every((d) => gone.has(d.id))) close();
  }, [gone]);   // eslint-disable-line react-hooks/exhaustive-deps
  const etcSubmit = (d: Decision) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = String(new FormData(e.currentTarget).get("t") || "").trim();
    if (t) void choose(d, { text: t }, "etc");
  };

  if (q.isError || !items.length) return null;
  return (
    <>
      {fab ? <button type="button" className={`nm-dec${open ? " on" : ""}`} aria-expanded={open} aria-label={`${title} ${left}개`} onClick={() => (open ? close() : setOpen(true))}>
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h6" /><path d="m8.5 14 2.2 2.2L15.5 11.5" /></svg>
        {left ? <b className="nm-rcount">{left > 99 ? "99+" : left}</b> : null}
      </button> : null}
      {open ? createPortal(   // body 로 뺌 = 유리 카드(backdrop-filter) 안에서 불러도 화면 기준 자리(홈 할 일 카드)
        <>
          <div className="nm-dec-scrim" aria-hidden onClick={close} />
          <section role="dialog" aria-modal="true" aria-label={title} className="nm-decpop">
            <header><b>{title}</b><button type="button" aria-label="닫기" onClick={close}>✕</button></header>
            <ul>
              {items.filter((d) => !gone.has(d.id)).map((d) => {
                const p = pickOf(d), name = list.find((x) => x.who === d.who)?.name || d.who;
                return (
                  <li key={d.id} className={`${done(p) ? "ok" : ""}${fx[d.id]?.st === "bye" ? " bye" : ""}`}><div className="nm-dec-in">
                    <p className="nm-dec-who"><FaceImg id={idOf(d.who, list)} size={22} /><b>{name}</b><span>{d.room_name || d.room}</span></p>
                    <p className="nm-dec-q" data-content>{d.q}</p>
                    <div className="nm-dec-ch">
                      {tailnetUrl(d.pc?.url) ? <a className="nm-dec-row nm-dec-pc" href={tailnetUrl(d.pc?.url)} target="_blank" rel="noopener noreferrer"><span className="t">제어권 가져오기</span></a> : null}   {/* 그 몸 화면(테일넷)을 새 창으로 · 미리보기 없음(형 「공간낭비고」) · 끝나면 아래 완료 */}
                      {d.choices.map((c, i) => <button key={i} type="button" className="nm-dec-row" data-on={isOn(d, `c${i}`) || undefined} data-fill={fillOf(d, `c${i}`)} aria-pressed={p?.i === i} onClick={() => void choose(d, { i }, `c${i}`)}><span className="nm-dec-no" aria-hidden>{i + 1}</span><span className="t">{c}</span>{drawn(fillOf(d, `c${i}`)) ? <Ck /> : null}</button>)}   {/* 보기 번호 1 · 2 · 3(형 11-11 19:45 「보기 중에 고르는 방식으로 / 1234 보기 주고. 3번까지 여도되고. 기타는 4번이니까.」) */}
                      {etc === d.id
                        ? <EtcRow text={p?.text || ""} on={isOn(d, "etc")} fill={fillOf(d, "etc")} onSubmit={etcSubmit(d)} />
                        : <button type="button" className="nm-dec-row" aria-pressed={!!p?.text} onClick={() => setEtc(d.id)}><span className="nm-dec-no" aria-hidden>{d.choices.length + 1}</span><span className="t">{p?.text ? `기타 · ${p.text}` : "기타"}</span></button>}
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

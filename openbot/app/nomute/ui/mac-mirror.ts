// 맥 비춤 붙이개(⑤ B · 카리나 11-20) — 형 브라우저 쪽 이음새 · 맥 크롬의 SNS 화면을 이 브라우저 <video> 로 받고 누름을 돌려보냄
//   (형 11-20 09:20 dm-bom 봄 옮김 「SNS 탭을 누르면 대화는 유지되고, (좌측에) 우측에 인스타랑 그런거 뜨게해주라」 · 소나 설계 ③ B · 봄 11:13 「그러니 지어」 · 12:04 「780×1688 24fps 로 가」)
//   화면(<video> 자리 · 누름 · 끌기 좌표) = 구름 · 맥 중계기 = claude-state tools/맥비춤/중계기.mjs · 서버 신호 우편함 = editor functions/api/office/_mirror.js(형만 · 한 기기 · 10분 끊김)
//   쓰는 법:
//     mirror.connect(videoEl[, { take: true }]) → 열기 · 맥 offer 기다림 · answer · 화면·소리 = videoEl(서버 안 지남 · WebRTC 바로)
//     mirror.touch("start" | "move" | "end" | "cancel", x, y) · mirror.tap(x, y) = 390×844 점(pointOf 로 바꿈)
//     mirror.pick(id) → SidePick(./sns-side.ts 그대로 · 맥 껍데기와 같은 꼴) + window 「nm-side」 이벤트 같은 답 · mirror.close()
//     mirror.on(f) = 상태 { st: idle | opening | waiting | live | busy | off, why? } · busy = 다른 기기가 보는 중(connect(v, { take: true }) = 넘겨받기)
//   가만히 둔 화면 = 0(이어진 뒤엔 서버 안 부름 · 끝 = 데이터 줄 닫힘 · 연결 끊김)
import { SIDE_EVENT, type SidePick } from "./sns-side";

export const MIRROR_API = "/api/office/mirror";
export const VIEW_W = 390, VIEW_H = 844;   // 맥 탭 화면 점(아이폰 390×844 · 영상 = 780×1688)
export const DEV_KEY = "nm-mirror-dev";   // 이 브라우저 id(서버 「한 기기」)
export const STUN = ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"];
export const PICK_MS = 10_000, GATHER_MS = 3000;
export type MirrorSt = "idle" | "opening" | "waiting" | "live" | "busy" | "off";
export type MirrorState = { st: MirrorSt; why?: string; sid?: string; muted?: boolean };
export type TouchType = "start" | "move" | "end" | "cancel";
export type Box = { left: number; top: number; width: number; height: number };
type Now = { v: number; st: string; sid: string; offer?: string; why?: string };

/** 순수 — 누른 자리(화면 점 · clientX/Y) → 390×844 점 · 그림 = object-fit contain(위아래 · 양옆 띠 뺌) · 밖 = null(clamp = 가장자리로 붙임 · 끌기 중) */
export function pointOf(box: Box, vw: number, vh: number, cx: number, cy: number, clamp = false): { x: number; y: number } | null {
  const w = vw > 0 ? vw : VIEW_W, h = vh > 0 ? vh : VIEW_H, s = Math.min(box.width / w, box.height / h);
  if (!(s > 0) || !Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  const dw = w * s, dh = h * s;
  let fx = (cx - box.left - (box.width - dw) / 2) / dw, fy = (cy - box.top - (box.height - dh) / 2) / dh;
  if (fx < 0 || fy < 0 || fx > 1 || fy > 1) {
    if (!clamp) return null;
    fx = Math.min(1, Math.max(0, fx)); fy = Math.min(1, Math.max(0, fy));
  }
  return { x: Math.round(fx * VIEW_W * 10) / 10, y: Math.round(fy * VIEW_H * 10) / 10 };
}

/** 순수 — 데이터 줄 글(중계기 inputOf 가 받는 꼴) */
export function touchMsg(type: TouchType, x: number, y: number) {
  return { t: "touch", type, pts: type === "end" || type === "cancel" ? [] : [{ x, y }] };
}

/** 순수 — live = 연결 connected + 데이터 줄 open 둘 다(구름 11-20 13:08 「connected 때 dc 가 아직 안 열려서 바로 보낸 go 가 send=false 로 버려졌어」) */
export function liveOf(pcSt: string | undefined, dcSt: string | undefined): boolean {
  return pcSt === "connected" && dcSt === "open";
}

/** 순수 — 맥 답 글 → 집기 답(SidePick) · 아니면 null */
export function replyOf(s: string): SidePick | null {
  let m: Record<string, unknown>;
  try { m = JSON.parse(s); } catch { return null; }
  if (!m || m.t !== "pick" || m.state !== "pick" || typeof m.id !== "string") return null;
  const d: SidePick = { state: "pick", id: m.id, ok: m.ok === true };
  for (const k of ["site", "url", "author", "text", "why"] as const) if (typeof m[k] === "string") d[k] = m[k] as string;
  if (typeof m.img === "string" && m.img.startsWith("data:image/jpeg;base64,")) d.img = m.img;
  return d;
}

/** 이 브라우저 id(한 번 만들고 그대로) */
export function devId(store: Pick<Storage, "getItem" | "setItem"> | null = typeof localStorage !== "undefined" ? localStorage : null): string {
  let d = "";
  try { d = store?.getItem(DEV_KEY) || ""; } catch { /* 이번만 */ }
  if (/^[A-Za-z0-9_-]{8,64}$/.test(d)) return d;
  const r = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "") : Math.random().toString(36).slice(2) + Date.now().toString(36);
  d = "b" + r.slice(0, 20);
  try { store?.setItem(DEV_KEY, d); } catch { /* 이번만 */ }
  return d;
}

let pickJs: { at: number; js: string } | null = null;
async function loadPick(): Promise<string> {   // 정원 서버 sns-pick.js(./sns-side-pane.tsx 와 같은 판 · 5분 안 = 그대로)
  if (pickJs && Date.now() - pickJs.at < 300_000) return pickJs.js;
  const r = await fetch(`${import.meta.env?.BASE_URL || "/garden-app/"}sns-pick.js`, { cache: "no-store" });
  if (!r.ok) throw new Error(`pick ${r.status}`);
  const js = (await r.text()).trim().replace(/;+\s*$/, "");
  if (!/^\(function\s*\(mode\)/.test(js)) throw new Error("pick 꼴");
  pickJs = { at: Date.now(), js };
  return js;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function api(p: string, body?: unknown, signal?: AbortSignal, keepalive = false): Promise<{ status: number; ok: boolean; now?: Now; error?: string }> {
  const r = await fetch(MIRROR_API + p, body === undefined ? { cache: "no-store", signal } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal, keepalive });
  let j: { ok?: boolean; now?: Now; error?: string } | null = null;
  try { j = await r.json(); } catch { /* 몸통 없음 */ }
  return { status: r.status, ok: !!j?.ok, now: j?.now, error: j?.error };
}
function gathered(pc: RTCPeerConnection, ms: number) {
  return new Promise<void>((done) => {
    if (pc.iceGatheringState === "complete") return done();
    const t = setTimeout(done, ms);
    pc.addEventListener("icegatheringstatechange", () => { if (pc.iceGatheringState === "complete") { clearTimeout(t); done(); } });
  });
}

type Run = { sid: string; dev: string; pc: RTCPeerConnection | null; dc: RTCDataChannel | null; video: HTMLVideoElement; stop: AbortController; ended: boolean };
let cur: Run | null = null;
let state: MirrorState = { st: "idle" };
const subs = new Set<(s: MirrorState) => void>();
const waiting = new Map<string, (d: SidePick) => void>();
function set(s: MirrorState) { state = s; for (const f of subs) { try { f(s); } catch { /* 듣는 쪽 탓 */ } } }
function answerPick(d: SidePick) {   // 집기 답 = 기다리는 쪽 + window 「nm-side」(지금 껍데기 듣는 길 · pickPost · stageSns 그대로)
  const f = waiting.get(d.id); waiting.delete(d.id); f?.(d);
  try { window.dispatchEvent(new CustomEvent(SIDE_EVENT, { detail: d })); } catch { /* 창 없음 */ }
}
function end(me: Run, why: string, tell: boolean): MirrorState {
  if (me.ended) return state;
  me.ended = true; me.stop.abort();
  try { me.dc?.close(); } catch { /* 이미 닫힘 */ }
  try { me.pc?.close(); } catch { /* 이미 닫힘 */ }
  if (me.video.srcObject) me.video.srcObject = null;
  for (const id of [...waiting.keys()]) answerPick({ state: "pick", id, ok: false, why: "끊김" });
  if (tell && me.sid) api("/close", { sid: me.sid, dev: me.dev, why }, undefined, true).catch(() => {});
  if (cur === me) { cur = null; set({ st: "off", why }); }
  return state;
}
function play(v: HTMLVideoElement, me: Run) {
  v.playsInline = true; v.autoplay = true;
  v.play().catch(() => {   // 소리 막힘(누름 없이 열림) = 소리 끄고 화면만 · mirror.unmute() 로 켬
    v.muted = true;
    v.play().catch(() => {});
    if (cur === me) set({ ...state, muted: true });
  });
}

/** 열기 → 맥 offer 기다림 → answer · 끝난 상태를 돌려줌(live 는 이어진 뒤 on 으로) */
async function connect(video: HTMLVideoElement, o: { take?: boolean } = {}): Promise<MirrorState> {
  if (cur) end(cur, "again", true);
  const me: Run = { sid: "", dev: devId(), pc: null, dc: null, video, stop: new AbortController(), ended: false };
  cur = me;
  set({ st: "opening" });
  try {
    const r = await api("/open", { dev: me.dev, ...(o.take ? { take: true } : {}) }, me.stop.signal);
    if (me.ended) return state;
    if (r.status === 409 && r.error === "busy") { me.ended = true; cur = null; set({ st: "busy" }); return state; }
    if (!r.ok || !r.now) return end(me, r.error || `http_${r.status}`, false);
    let n = r.now, fails = 0;
    me.sid = n.sid;
    set({ st: "waiting", sid: me.sid });
    while (!n.offer) {   // 맥 중계기가 크롬 띄우고 offer(1~2초) · 1분 안 오면 서버가 off(mac_silent)
      if (n.st === "off" || n.sid !== me.sid) return end(me, n.why || "off", false);
      const w = await api(`?wait=${n.v}&t=25&dev=${encodeURIComponent(me.dev)}`, undefined, me.stop.signal);
      if (me.ended) return state;
      if (!w.ok || !w.now) { if (++fails > 5) return end(me, "wait_fail", true); await sleep(2000); continue; }
      fails = 0; n = w.now;
    }
    const pc = new RTCPeerConnection({ iceServers: [{ urls: STUN }] });
    me.pc = pc;
    pc.ontrack = (e) => {
      const s = e.streams[0] || new MediaStream([e.track]);
      if (video.srcObject !== s) { video.srcObject = s; play(video, me); }
    };
    const ready = () => {   // live 를 데이터 줄 열린 뒤로 → live 받자마자 보낸 go · touch · pick 이 안 버려짐
      if (cur === me && !me.ended && state.st !== "live" && liveOf(pc.connectionState, me.dc?.readyState))
        set({ st: "live", sid: me.sid, ...(video.muted ? { muted: true } : {}) });
    };
    pc.ondatachannel = (e) => {
      me.dc = e.channel;
      e.channel.onmessage = (ev) => { const d = replyOf(String(ev.data)); if (d) answerPick(d); };
      e.channel.onopen = ready;
      e.channel.onclose = () => end(me, "dc_closed", true);   // 맥이 닫음 · 10분 · 다른 기기가 넘겨받음
      ready();   // 이미 열려 온 줄
    };
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === "connected") ready();
      else if (s === "failed" || s === "closed") end(me, `rtc_${s}`, true);
    };
    await pc.setRemoteDescription({ type: "offer", sdp: n.offer });
    await pc.setLocalDescription();
    await gathered(pc, GATHER_MS);
    if (me.ended) return state;
    const a = await api("/answer", { sid: me.sid, dev: me.dev, sdp: pc.localDescription?.sdp || "" }, me.stop.signal);
    if (!a.ok) return end(me, a.error || `answer_${a.status}`, true);
    return state;
  } catch {
    return end(me, me.stop.signal.aborted ? "closed" : "open_fail", true);
  }
}

/** 데이터 줄로 한 줄(이어졌을 때만 · 보냈으면 true) */
function send(o: unknown): boolean {
  const dc = cur?.dc;
  if (!dc || dc.readyState !== "open") return false;
  try { dc.send(JSON.stringify(o)); return true; } catch { return false; }
}

/** 집기 = 맥 탭에서 sns-pick.js → 집은 글 + 그 자리 사진 → 「flash」(맥 껍데기 sidePick 과 같은 차례) */
async function pick(id = `p${Date.now().toString(36)}`): Promise<SidePick> {
  const fail = (why: string): SidePick => { const d: SidePick = { state: "pick", id, ok: false, why }; answerPick(d); return d; };
  if (!cur?.dc || cur.dc.readyState !== "open") return fail("안 이어짐");
  let js: string;
  try { js = await loadPick(); } catch { return fail("집기 js 못 받음"); }
  return new Promise<SidePick>((res) => {
    const t = setTimeout(() => { if (waiting.has(id)) fail("답 없음"); }, PICK_MS);
    waiting.set(id, (d) => { clearTimeout(t); res(d); });
    if (!send({ t: "pick", id, js })) fail("안 이어짐");
  });
}

export const mirror = {
  connect,
  close: (why = "hyung"): MirrorState => (cur ? end(cur, why, true) : state),
  touch: (type: TouchType, x: number, y: number) => send(touchMsg(type, x, y)),
  tap: (x: number, y: number) => send({ t: "tap", x, y }),
  wheel: (dy: number, x?: number, y?: number) => send({ t: "wheel", dy, ...(x !== undefined && y !== undefined ? { x, y } : {}) }),
  key: (text: string) => send({ t: "key", text }),
  back: () => send({ t: "back" }),
  go: (url: string) => send({ t: "go", url }),   // https 만(중계기가 거름)
  pick,
  unmute: () => { const v = cur?.video; if (!v) return; v.muted = false; v.play().catch(() => {}); if (state.muted) set({ ...state, muted: false }); },
  on: (f: (s: MirrorState) => void) => { subs.add(f); f(state); return () => { subs.delete(f); }; },
  get state() { return state; },
};

if (typeof window !== "undefined") window.addEventListener("pagehide", () => { if (cur) end(cur, "pagehide", true); });   // 창 닫음 = 맥 크롬 바로 끔(keepalive)

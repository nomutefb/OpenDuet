// 느린 깜빡임 한 박자(11-14 형 맥 뜨거움 · 클라우드 세션) — 상태 띠 불빛 숨쉬기 · 「HOT ISSUE」 점의 퍼지는 테
//   형 잣대(11-14 09:13): 「30프레임하고 40프레임하고 똑같은데 40프레임으로 돌렷다 < 바보같은짓」 · 「보기에만 똑같으면 되는데」
//   까닭: CSS 애니메이션은 화면 주사율(60 · 120Hz)마다 창을 다시 합성하게 한다. 3.2초에 한 번 숨 쉬는 불빛은 초당 12번만 바꿔도 눈에 같다
//     (한 박자에 진하기 0.045 · 테 0.5px 안쪽). 잰 값(그래픽카드 없는 기계 · 960×540 · 그래픽 프로세스 CPU): CSS 로 돌림 29% → 여기 12% · 둘 다 끔 4%.
//   하는 일: 불빛(.nm-sl-led) 과 점(.live) 에 값(--led-o · --live-t · --live-on)만 적는다. 꼴은 CSS(./status-line.css · ../home/news-list.css)가 그 값으로 그린다.
//   쉼: 숨은 탭 · 움직임 줄이기 · 형 손 2분 없음(html.nm-calm · ./calm.ts) · 무게 재기 ?perf=leds → 값을 지움 = 불빛 늘 켬 · 테 안 보임. 대상이 화면에 없으면 2초에 한 번만 찾는다.
export const PULSE_MS = 83, PULSE_SEEK_MS = 2000;
/** 순수 — 불빛 진하기 1 ↔ .45(앞 판 nmSlLed 0% · 100% = 1 · 50% = .45 · ease-in-out) */
export const ledOpacity = (t: number, period = 3.2, phase = 0) => 0.725 + 0.275 * Math.cos((2 * Math.PI * (t + phase)) / period);
/** 순수 — 퍼지는 테 0 → 1(앞 판 nmLive 1.8초 ease-out) */
export const ringT = (t: number, period = 1.8) => { const u = (((t % period) + period) % period) / period; return 1 - Math.pow(1 - u, 1.9); };
/** 순수 — 불빛 종류별 박자(앞 판 = warn 0.8초 앞섬 · bad 1.6초 앞섬 · 2.4초 주기) */
export const ledBeat = (cls: string): [period: number, phase: number] => (/\bbad\b/.test(cls) ? [2.4, 1.6] : /\bwarn\b/.test(cls) ? [3.2, 0.8] : [3.2, 0]);
const LEDS = ".nm-sl-led:not(.off)", RINGS = ".nm-nlist-h .live, .nm-nsum-q li.run i";

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const root = document.documentElement, still = matchMedia("(prefers-reduced-motion: reduce)");
  const t0 = performance.now();
  let timer = 0, sought = -PULSE_SEEK_MS, leds: HTMLElement[] = [], rings: HTMLElement[] = [], wrote = new Set<HTMLElement>();
  const resting = () => document.hidden || still.matches || root.classList.contains("nm-calm") || root.classList.contains("perf-no-leds");
  const wipe = () => { for (const e of wrote) { e.style.removeProperty("--led-o"); e.style.removeProperty("--live-t"); e.style.removeProperty("--live-on"); } wrote.clear(); };
  const seek = (now: number) => {
    sought = now;
    leds = [...document.querySelectorAll<HTMLElement>(LEDS)]; rings = [...document.querySelectorAll<HTMLElement>(RINGS)];
    for (const e of wrote) if (!e.isConnected) wrote.delete(e);
  };
  const tick = () => {
    timer = 0;
    if (resting()) { wipe(); return; }   // 다시 깨우기 = 아래 arm()
    const now = performance.now();
    if (now - sought >= PULSE_SEEK_MS) seek(now);
    const t = (now - t0) / 1000;
    for (const e of leds) { const [p, ph] = ledBeat(e.className); e.style.setProperty("--led-o", ledOpacity(t, p, ph).toFixed(3)); wrote.add(e); }
    const k = ringT(t).toFixed(3);
    for (const e of rings) { e.style.setProperty("--live-t", k); if (!wrote.has(e)) e.style.setProperty("--live-on", "1"); wrote.add(e); }
    timer = window.setTimeout(tick, leds.length || rings.length ? PULSE_MS : PULSE_SEEK_MS);
  };
  const arm = () => { if (resting()) { window.clearTimeout(timer); timer = 0; wipe(); } else if (!timer) { sought = -PULSE_SEEK_MS; tick(); } };
  document.addEventListener("visibilitychange", arm);
  still.addEventListener("change", arm);
  new MutationObserver(arm).observe(root, { attributes: true, attributeFilter: ["class"] });   // nm-calm · perf-no-leds 켜짐 · 꺼짐
  arm();
}

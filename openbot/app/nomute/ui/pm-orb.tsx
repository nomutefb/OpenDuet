// PM 구슬 — 대화 목록 우하단 PM 단추(./room-fab.tsx PmFab)의 얼굴 자리에 뜨는 살아 있는 구슬
//   형 11-16 02:2x(영상 = 은빛 · 푸른빛 · 주황빛이 흐르는 진주 구슬) 「이걸 최대한 구현해서 우하단에 pm 쪽 잇지. 그 프로필을 이거로 대체해줘」
//   그림 = ./pm-orb-shader.ts 조각 셰이더 하나(WebGL1 · 받아오는 것 0 · 46px 단추라 점 수가 적음)
//   얼마를 먹나: 보일 때만 그림 — 화면 밖 · 숨은 탭 · 형 손이 2분 없음 = 그 자리에서 멈춤(조약돌 ./bloub.tsx 와 같은 잣대) · 「움직임 줄이기」 = 한 장만
//   못 그리는 기기(WebGL 없음 · 셰이더 실패 · 그림판 잃음) = onFail → 부른 쪽이 옛 얼굴 사진으로
import { useEffect, useRef } from "react";
import { PM_ORB_FRAG, PM_ORB_VERT } from "./pm-orb-shader";

const IDLE_MS = 120_000, DPR_MAX = 2;

export function PmOrb({ onFail }: { onFail: () => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null), fail = useRef(onFail);
  fail.current = onFail;
  useEffect(() => {
    const c = ref.current;
    if (!c) return undefined;
    let gl: WebGLRenderingContext | null = null;
    try { gl = c.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" }); } catch { gl = null; }
    if (!gl) { fail.current(); return undefined; }
    const g = gl;
    const shader = (type: number, src: string) => { const s = g.createShader(type); if (!s) return null; g.shaderSource(s, src); g.compileShader(s); return g.getShaderParameter(s, g.COMPILE_STATUS) ? s : null; };
    const vs = shader(g.VERTEX_SHADER, PM_ORB_VERT), fs = shader(g.FRAGMENT_SHADER, PM_ORB_FRAG), prog = g.createProgram();
    if (!vs || !fs || !prog) { fail.current(); return undefined; }
    g.attachShader(prog, vs); g.attachShader(prog, fs); g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) { fail.current(); return undefined; }
    g.useProgram(prog);
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);   // 화면을 덮는 세모 하나
    const loc = g.getAttribLocation(prog, "p");
    g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const uR = g.getUniformLocation(prog, "R"), uT = g.getUniformLocation(prog, "T");
    const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, live = true, seen = true, time = 0, last = 0, touched = Date.now();
    const fit = () => { const w = Math.max(1, Math.round(c.clientWidth * Math.min(DPR_MAX, window.devicePixelRatio || 1))); if (c.width !== w || c.height !== w) { c.width = w; c.height = w; } g.viewport(0, 0, w, w); g.uniform2f(uR, w, w); };
    const run = () => live && seen && !document.hidden && !still && Date.now() - touched < IDLE_MS;
    const draw = (now: number) => {
      raf = 0;
      if (!live) return;
      if (last) time += Math.min(0.1, (now - last) / 1000);   // 멈췄다 다시 돌 때 건너뛰지 않게
      last = now;
      fit(); g.uniform1f(uT, time); g.drawArrays(g.TRIANGLES, 0, 3);
      if (run()) raf = requestAnimationFrame(draw); else last = 0;
    };
    const kick = () => { if (!raf && run()) raf = requestAnimationFrame(draw); };
    const hand = () => { touched = Date.now(); kick(); };
    const lost = (e: Event) => { e.preventDefault(); live = false; fail.current(); };
    const io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((es) => { seen = es.some((e) => e.isIntersecting); kick(); }) : null;
    io?.observe(c);
    c.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("pointerdown", hand, { passive: true }); window.addEventListener("keydown", hand, { passive: true }); window.addEventListener("pointermove", hand, { passive: true });
    draw(performance.now());   // 첫 장은 늘(멈춘 조건이어도 빈 동그라미로 안 남게)
    return () => {
      live = false; cancelAnimationFrame(raf); io?.disconnect();
      c.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("pointerdown", hand); window.removeEventListener("keydown", hand); window.removeEventListener("pointermove", hand);
      g.getExtension("WEBGL_lose_context")?.loseContext();   // 그림판 바로 돌려줌(브라우저 한도 16개)
    };
  }, []);
  return <canvas ref={ref} className="nm-pmorb" aria-hidden />;
}

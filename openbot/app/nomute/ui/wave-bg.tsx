// 설정·서랍 뒤 배경 = 옛 에디터 웹 물결(형 11-01 「설정 뒤에 기존 에디터 웹 배경을 좀 깔아줘 시그니처 색 넣어서」 · 「이를 5에도 적용」)
//   원본 = editor viewer/nm-wave.js(셰이더·움직임 값 그대로 · 웹은 Three.js 로 그림 → 여기선 번들을 안 늘리려고 WebGL2 직접) · 바꾼 것 = 시안·파랑 자리에 시그니처 라임 · 바탕 = 앱 표면색
//   WebGL2 없음·컴파일 실패 = 조용히 숨김(모달 바탕 그대로) · 안 보일 때 멈춤 · 움직임 줄이기 = 한 장만
import { useEffect, useRef } from "react";

const MAX = 10, FRAME_MS = 8;
const VERT = `#version 300 es
in vec2 a_position; out vec2 v_objectUV; uniform float u_scale;
void main(){ gl_Position=vec4(a_position,0.,1.); vec2 uv=a_position*0.5; v_objectUV=uv/max(0.001,u_scale); }`;
const FRAG = `#version 300 es
precision mediump float;
uniform float u_time; uniform vec4 u_colors[${MAX}]; uniform float u_colorsCount;
uniform float u_distortion; uniform float u_swirl; uniform float u_grainMixer; uniform float u_grainOverlay; uniform vec3 u_floor;
in vec2 v_objectUV; out vec4 fragColor;
vec2 rotate(vec2 uv,float th){ return mat2(cos(th),sin(th),-sin(th),cos(th))*uv; }
float hash21(vec2 p){ p=fract(p*vec2(0.3183099,0.3678794))+0.1; p+=dot(p,p+19.19); return fract(p.x*p.y); }
float valueNoise(vec2 st){ vec2 i=floor(st),f=fract(st); float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1)); vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }
float noise(vec2 n,vec2 s){ return valueNoise(n+s); }
vec2 getPosition(int i,float t){ float a=float(i)*.37,b=.6+fract(float(i)/3.)*.9,c=.8+fract(float(i+1)/4.); float x=sin(t*b+a),y=cos(t*c+a*1.5); return .5+.5*vec2(x,y); }
void main(){ vec2 uv=v_objectUV; uv+=.5; vec2 grainUV=uv*1000.; float grain=noise(grainUV,vec2(0.)); float mixerGrain=.4*u_grainMixer*(grain-.5);
 float t=.5*(u_time+41.5); float radius=smoothstep(0.,1.,length(uv-.5)); float center=1.-radius;
 for(float i=1.;i<=2.;i++){ uv.x+=u_distortion*center/i*sin(t+i*.4*smoothstep(.0,1.,uv.y))*cos(.2*t+i*2.4*smoothstep(.0,1.,uv.y)); uv.y+=u_distortion*center/i*cos(t+i*2.*smoothstep(.0,1.,uv.x)); }
 vec2 uvR=uv-vec2(.5); uvR=rotate(uvR,-3.*u_swirl*radius); uvR+=vec2(.5);
 vec3 color=vec3(0.); float tw=0.;
 for(int i=0;i<${MAX};i++){ if(i>=int(u_colorsCount)) break; vec2 pos=getPosition(i,t)+mixerGrain; float dist=pow(length(uvR-pos),3.5); float w=1./(dist+1e-3); color+=u_colors[i].rgb*u_colors[i].a*w; tw+=w; }
 color/=max(1e-4,tw); color=max(color,u_floor);
 float go=valueNoise(rotate(grainUV,1.)+vec2(3.)); go=mix(go,valueNoise(rotate(grainUV,2.)+vec2(-1.)),.5); go=pow(go,1.3); float gV=go*2.-1.; float gS=pow(u_grainOverlay*abs(gV),.8); color=mix(color,vec3(step(0.,gV)),.35*gS);
 fragColor=vec4(color,1.0); }`;
const P = { dist: 0.53, swirl: 0.34, speed: 0.33, scale: 0.86, grain: 0.12 }, GRAIN_MIX = 0.15;
const LIME = [207 / 255, 1, 64 / 255], WHITE = [1, 1, 1];
const INT = 0.16;   // 라임 세기(옛 웹 0.13 · 0.3 은 화면 전체가 올리브로 뭉개짐 · 어두운 자리가 남아야 유리가 보임)

/** 앱 표면색을 숫자로(토큰이 oklch 라 2D 칠로 푼다) */
function surface(): number[] {
  const c = document.createElement("canvas").getContext("2d");
  if (!c) return [0.05, 0.05, 0.05];
  c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--duet-surface").trim() || "#0b0c0e";
  c.fillRect(0, 0, 1, 1);
  const d = c.getImageData(0, 0, 1, 1).data;
  return [d[0] / 255, d[1] / 255, d[2] / 255];
}
const mix = (base: number[], tint: number[], t: number) => base.map((b, i) => b + (tint[i] - b) * Math.min(1, t));

function program(gl: WebGL2RenderingContext) {
  const shader = (kind: number, src: string) => { const s = gl.createShader(kind)!; gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const v = shader(gl.VERTEX_SHADER, VERT), f = shader(gl.FRAGMENT_SHADER, FRAG), p = gl.createProgram();
  if (!v || !f || !p) return null;
  gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}

export function WaveBg() {
  const box = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = box.current, gl = cv?.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    const p = gl && program(gl);
    if (!cv || !gl || !p) { if (cv) cv.style.display = "none"; return; }
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const at = gl.getAttribLocation(p, "a_position");
    gl.enableVertexAttribArray(at);
    gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(p, n);
    gl.uniform1f(u("u_scale"), P.scale); gl.uniform1f(u("u_distortion"), P.dist); gl.uniform1f(u("u_swirl"), P.swirl);
    gl.uniform1f(u("u_grainMixer"), GRAIN_MIX); gl.uniform1f(u("u_grainOverlay"), P.grain); gl.uniform1f(u("u_colorsCount"), 5);
    const paint = () => {
      const bg = surface(), cols = [mix(bg, LIME, 0.55 * INT), mix(bg, LIME, 0.8 * INT), mix(bg, LIME, 1.1 * INT), mix(bg, LIME, 0.45 * INT), mix(bg, WHITE, 0.2 * INT)], flat = new Float32Array(MAX * 4);
      cols.forEach((c, i) => flat.set([...c, 1], i * 4));
      gl.uniform4fv(u("u_colors"), flat);
      gl.uniform3fv(u("u_floor"), mix(bg, LIME, 0.68 * INT));
    };
    paint();
    const uTime = u("u_time"), still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = (now: number) => {
      const w = Math.round(cv.clientWidth * Math.min(devicePixelRatio, 1.5)), h = Math.round(cv.clientHeight * Math.min(devicePixelRatio, 1.5));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform1f(uTime, (now / 1000) * P.speed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    let raf = 0, last = 0;
    const loop = (now: number) => { raf = requestAnimationFrame(loop); if (now - last < FRAME_MS) return; last = now; frame(now); };
    const run = () => { cancelAnimationFrame(raf); if (!document.hidden && !still) raf = requestAnimationFrame(loop); else frame(performance.now()); };
    const theme = new MutationObserver(() => { paint(); frame(performance.now()); });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    run();
    document.addEventListener("visibilitychange", run);
    return () => { cancelAnimationFrame(raf); theme.disconnect(); document.removeEventListener("visibilitychange", run); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  }, []);
  return <canvas ref={box} aria-hidden className="nm-wave" />;
}

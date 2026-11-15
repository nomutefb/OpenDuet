// PM 구슬 그림(./pm-orb.tsx) — 형 11-16 02:2x 영상(은빛 · 푸른빛 · 주황빛이 흐르는 진주 구슬 · 23초)
//   「이걸 최대한 구현해서 우하단에 pm 쪽 잇지. 그 프로필을 이거로 대체해줘」
//   꼴 = 액체 크롬 구슬: 구 겉면 법선을 흐르는 잡음으로 흔들고, 그 반사 방향으로 「하늘 → 흰 띠 → 주황 → 남색」 둘레 그림을 읽음
//        때에 따라 ① 잔잔한 은빛 ② 색이 도는 크롬 ③ 금 간 대리석(잡음이 잘게 · 세게) 사이를 천천히 오감 · 가장자리 = 진주빛 테
//   조각 셰이더 하나(WebGL1 · 텍스처 0 · 받아오는 것 0) · 시험 화면(시안)과 앱이 같은 글자를 씀
export const PM_ORB_VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

export const PM_ORB_FRAG = `
precision highp float;
uniform vec2 R;      // 그림 크기(px)
uniform float T;     // 초
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vn(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
float fb2(vec3 p){ return 0.62 * vn(p) + 0.38 * vn(p * 2.03 + vec3(1.7, 9.2, 3.1)); }   // 두 겹(잘게 깨지지 않게)
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }
// 둘레 그림: 위 = 하늘빛 · 가운데 = 흰 띠 · 아래 = 주황 → 갈색 → 남색 · 한쪽은 어두운 덩이
vec3 env(vec3 d, float sat){
  float y = d.y;
  vec3 sky = mix(vec3(0.93, 0.96, 1.0), vec3(0.16, 0.52, 0.95), smoothstep(0.02, 0.75, y));
  sky = mix(sky, vec3(0.55, 0.95, 1.0), smoothstep(0.55, 0.2, abs(y - 0.38)) * 0.45);
  vec3 gnd = mix(vec3(1.0, 0.64, 0.26), vec3(0.36, 0.15, 0.06), smoothstep(-0.04, -0.3, y));
  gnd = mix(gnd, vec3(0.03, 0.06, 0.17), smoothstep(-0.45, -0.92, y));
  vec3 c = mix(gnd, sky, smoothstep(-0.05, 0.05, y));
  c = mix(c, vec3(1.0), smoothstep(0.13, 0.015, abs(y)));                           // 흰 띠
  float blob = smoothstep(0.5, 0.74, d.x * 0.8 + d.z * 0.45 + 0.08);               // 어두운 덩이(가장자리 또렷)
  c = mix(c, vec3(0.04, 0.07, 0.14), blob * mix(0.78, 0.6, sat));
  float g = dot(c, vec3(0.3, 0.59, 0.11));
  vec3 silver = mix(vec3(0.07, 0.13, 0.14), vec3(1.0, 1.0, 1.0), smoothstep(0.0, 0.8, g));   // 은빛 = 어두운 데는 청록 기 · 밝은 데는 흰
  return mix(silver, c, sat);
}
void main(){
  vec2 uv = (gl_FragCoord.xy * 2.0 - R) / min(R.x, R.y);
  float r = length(uv), px = 2.0 / min(R.x, R.y);
  float a = 1.0 - smoothstep(0.985 - px * 1.5, 0.985, r);
  if (a <= 0.0) { gl_FragColor = vec4(0.0); return; }
  vec3 n = vec3(uv, sqrt(max(0.0, 1.0 - r * r)));
  float t = T * 0.2;
  float turb = smoothstep(0.62, 0.96, 0.5 + 0.5 * sin(T * 0.27 - 1.9));           // 금 간 대리석 때(23초 남짓에 한 번)
  float sat = smoothstep(0.25, 0.7, 0.5 + 0.5 * sin(T * 0.19 + 0.4)) * (1.0 - 0.75 * turb);   // 은빛 ↔ 색
  vec3 p = rotY(t * 0.9) * rotX(t * 0.55) * n;
  float fq = mix(1.15, 2.3, turb), am = mix(0.5, 1.05, turb);
  vec3 q = p * fq + vec3(0.0, 0.0, t * 1.3);
  vec3 w = vec3(fbm(q), fbm(q + vec3(5.2, 1.3, 2.8)), fbm(q + vec3(1.7, 9.2, 4.1))) - 0.5;
  w += (vec3(fb2(q * 1.9 + w * 2.0 + 3.0), fb2(q * 1.9 + w * 2.0 + 7.0), 0.5) - 0.5) * mix(0.3, 0.6, turb);   // 한 번 더 휘게(물결)
  vec3 nn = normalize(n + w * am);
  vec3 rd = reflect(vec3(0.0, 0.0, -1.0), nn);
  rd = rotZ(t * 0.7 + 0.6) * rotX(sin(t * 0.8) * 0.9 + 0.3) * rd;
  vec3 col = env(rd, sat);
  float crack = smoothstep(0.03, 0.008, abs(fb2(q * 0.85 + w * 1.6 + 11.0) - 0.5)) * smoothstep(0.42, 0.58, fb2(q * 0.55 + 3.0)) * turb;   // 대리석 금(잡음의 가운데 값 줄 = 이어진 금 · 몇 줄만)
  col = mix(col, vec3(0.06, 0.07, 0.11), crack * 0.8);
  float fr = pow(1.0 - n.z, 4.0);
  vec3 irid = 0.5 + 0.5 * cos(6.2832 * (fr * 0.9 + w.x * 0.8 + t * 0.2 + vec3(0.0, 0.33, 0.67)));
  col = mix(col, vec3(0.97, 0.96, 0.98), fr * 0.5);                                 // 진주빛 테(얇게)
  col += irid * fr * 0.2;
  vec3 l = normalize(vec3(-0.45, 0.6, 0.66));
  col += pow(max(dot(reflect(-l, nn), vec3(0.0, 0.0, 1.0)), 0.0), 26.0) * 0.38;     // 반짝임
  col = pow(clamp(col, 0.0, 1.0), vec3(0.88));
  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * a, a);
}`;

// @ts-nocheck
// 썸네일 생성기 뒤 장면 — 에디터 모던 화면의 3D 판(유리 판들 사이 홈에 시안·파랑 빛이 흐르는 「X」 이음) = 앱 「에디터」 칸이 보여 주던 그 배경(형 11-02 09:28 「이 디자인하고 배경 살려서」)
//   원본 = 에디터 viewer/modern-spatial.js(origin/main ee27c47b) 줄 그대로 · 주석만 뺌 · Three.js = 에디터와 같은 파일(/vendor/three/three.module.js)을 열 때 불러옴(앱 꾸러미 안 늘림)
//   바꾼 곳 = 받침(#ambient)·THREE 를 인자로 · 색 토큰·표식(dataset) = 받침 요소에서(앱 html 안 건드림) · 아래 메뉴 유리(#menu)·독 베일(#nmDockVeil) = index 전용이라 뺌 · window.__modernSpatial 대신 손잡이 돌려줌
//            DOM 지켜보기 = 이 화면 안만(scope) · 시작 = 부른 쪽(./scene-bg.tsx)이 쉴 틈에
/* eslint-disable */

/** host = 장면 받침(그 안에 canvas 를 붙임) · scope = dialog 열림을 지켜볼 범위 · 돌려줌 = { dispose, render } */
export function bootSpatialScene(THREE, host, scope) {


const TIERS = {
  low: { dpr: 1, pixels: .6e6, msaa: 0, hdr: false, bloomMips: 0, shadow: 0, dust: 0, aberration: false, frameCap: 33 },
  medium: { dpr: 1.25, pixels: 1.4e6, msaa: 4, hdr: true, bloomMips: 4, shadow: 1024, dust: 70, aberration: false, frameCap: 0 },
  high: { dpr: 1.25, pixels: 2.4e6, msaa: 4, hdr: true, bloomMips: 5, shadow: 2048, dust: 140, aberration: true, frameCap: 0 }
};
const TIER_ORDER = ['low', 'medium', 'high'];

const FIELD = { width: 8.1, depth: 7.8, gap: .7, half: 5, thickness: 2.4, top: .41, ground: .17, angle: -.08 };
FIELD.pitchX = FIELD.width + FIELD.gap;
FIELD.pitchZ = FIELD.depth + FIELD.gap;
FIELD.origin = new THREE.Vector2(-5.25, 3.5);

const HOME_FRAME = [0, 0, 0, 0, 1];
const FRAMES = { home: HOME_FRAME, feed: HOME_FRAME, ask: HOME_FRAME, thumb: HOME_FRAME, cap: HOME_FRAME, run: HOME_FRAME };

const SEAM_GLSL =  `
uniform float uSeamTime, uSeamIntro, uSeamGain, uSeamGround;
uniform vec2 uSeamFocus, uFieldOrigin, uFieldRot, uSeamPitch;
uniform vec3 uSeamCyan, uSeamBlue;
float seamHash(float n){ return fract(sin(n * 91.3458) * 47453.5453); }
vec2 seamToField(vec2 world){
  vec2 q = world - uFieldOrigin;
  return vec2(uFieldRot.x * q.x - uFieldRot.y * q.y, uFieldRot.y * q.x + uFieldRot.x * q.y);
}
// Light carried by the seam nearest to p (field space); d is the signed
// distance to that seam's centre line and node the crossing glow.
vec3 seamEnergy(vec2 p, out float d, out float node){
  vec2 g = p / uSeamPitch;
  vec2 k = floor(g + .5);
  vec2 off = (g - k) * uSeamPitch;
  bool alongZ = abs(off.x) < abs(off.y);
  float id = alongZ ? k.x : k.y + 37.0;
  d = alongZ ? off.x : off.y;
  float along = alongZ ? p.y : p.x;
  float h = seamHash(id);
  float dir = h > .62 ? -1.0 : 1.0;
  float s = fract(dir * along / 22.0 - uSeamTime * (.9 + .7 * h) / 22.0 + h * 3.7);
  float comet = pow(s, 9.0) * (1.0 - smoothstep(.972, 1.0, s)) * step(.28, h);
  vec3 tint = mix(uSeamCyan, uSeamBlue, smoothstep(.15, .85, seamHash(id + 11.0)));
  float r = length(p - uSeamFocus);
  float front = uSeamIntro * 72.0;
  float lit = smoothstep(front, front - 7.0, r);
  float wave = exp(-abs(r - front) * .75) * (1.0 - uSeamIntro) * step(.0005, uSeamIntro);
  float pulse = .5 + .5 * sin(uSeamTime * .7 + seamHash(k.x * 3.1 + k.y * 7.7) * 6.2832);
  node = exp(-dot(off, off) * 5.0) * (.18 + .32 * pulse) * lit;
  return tint * ((.032 + 2.6 * comet) * lit + 1.6 * wave);
}
`;

function bootSpatial() {
  const root = host;
  const css = getComputedStyle(root);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = THREE.MathUtils.clamp;
  const params = new URLSearchParams(location.search);
  const readAmount = (name, fallback) => {
    const value = parseFloat(css.getPropertyValue(name));
    return Number.isFinite(value) ? clamp(value, 0, 1) : fallback;
  };
  const settings = {
    depth: readAmount('--depth', .45),
    ambient: readAmount('--ambient', .30),
    motion: readAmount('--motion', .35)
  };

  const palette = (name, fallback) => new THREE.Color(
    css.getPropertyValue(name).trim() || css.getPropertyValue(fallback).trim() || '#000');
  const dark = palette('--modern-space-bg', '--space-bg');
  const cool = palette('--modern-bias-l1', '--bias-l1');
  const deep = palette('--modern-bias-l2', '--bias-l2');
  const light = palette('--modern-fg', '--fg');
  const slate = dark.clone().lerp(light, .10).lerp(cool, .035);
  const side = dark.clone().lerp(light, .045).lerp(cool, .065);
  const groundColor = dark.clone().lerp(light, .03);

  const canvas = document.createElement('canvas');
  canvas.dataset.nmSceneCanvas = '';
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, alpha: false, powerPreference: 'high-performance',
    stencil: false, depth: true
  });
  const gl = renderer.getContext();
  let shaderFailed = false;
  renderer.debug.onShaderError = (context, program, vertexShader, fragmentShader) => {
    shaderFailed = true;
    root.dataset.spatialReady = 'false';
    host.dataset.renderer = 'css-fallback';
    host.dataset.shaderError = (context.getShaderInfoLog(fragmentShader) || context.getShaderInfoLog(vertexShader) ||
      context.getProgramInfoLog(program) || 'Shader compilation failed').slice(0, 240);
    renderer.domElement.style.display = 'none';
    console.warn('Spatial shader failed; CSS fallback is active.', host.dataset.shaderError);
  };
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = .72;
  renderer.autoClear = false;
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;opacity:0';
  host.append(renderer.domElement);

  let veilTop = 0, veilFade = -1;
  function paintVeil() {}

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = String(debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) || '');
  const software = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpu);
  const phone = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820;
  const lowMemory = Number(navigator.deviceMemory) > 0 && Number(navigator.deviceMemory) < 4;
  const requested = params.get('scene-quality');
  let tierName = TIERS[requested] ? requested : software ? 'low' : (phone || lowMemory) ? 'medium' : 'high';
  let tier = TIERS[tierName];
  const physical = tierName !== 'low';

  function targetWorks(type, samples) {
    const probe = new THREE.WebGLRenderTarget(4, 4, { type, samples, depthBuffer: true });
    try {
      renderer.setRenderTarget(probe);
      return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    } catch (_) { return false; }
    finally { renderer.setRenderTarget(null); probe.dispose(); }
  }
  const hdrSupported = targetWorks(THREE.HalfFloatType, 0);
  const msaaHdr = hdrSupported && targetWorks(THREE.HalfFloatType, 4);
  const msaaLdr = targetWorks(THREE.UnsignedByteType, 4);
  function targetFormat(config) {
    const hdr = config.hdr && hdrSupported;
    const samples = config.msaa && (hdr ? msaaHdr : msaaLdr) ? config.msaa : 0;
    return { hdr, samples, type: hdr ? THREE.HalfFloatType : THREE.UnsignedByteType };
  }

  const scene = new THREE.Scene();
  scene.background = dark.clone().lerp(light, .025);
  const FOG_NEAR = 19, FOG_FAR = 43;
  scene.fog = new THREE.Fog(scene.background, FOG_NEAR, FOG_FAR);
  const camera = new THREE.OrthographicCamera(-8, 8, 6, -6, .1, 70);
  const lookBase = new THREE.Vector3(0, .2, 0);
  const cameraOffset = new THREE.Vector3(7, 8.2, 10);
  const cameraDistance = cameraOffset.length();
  const baseYaw = Math.atan2(cameraOffset.x, cameraOffset.z);
  const basePitch = Math.asin(cameraOffset.y / cameraDistance);

  const seamUniforms = {
    uSeamTime: { value: 0 }, uSeamIntro: { value: 1 }, uSeamGain: { value: 1 },
    uSeamGround: { value: FIELD.ground },
    uSeamFocus: { value: new THREE.Vector2() },
    uFieldOrigin: { value: FIELD.origin.clone() },
    uFieldRot: { value: new THREE.Vector2(Math.cos(FIELD.angle), Math.sin(FIELD.angle)) },
    uSeamPitch: { value: new THREE.Vector2(FIELD.pitchX, FIELD.pitchZ) },
    uSeamCyan: { value: cool.clone() }, uSeamBlue: { value: deep.clone() }
  };

  let envTarget = null;
  function buildEnvironment() {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new THREE.Scene();
    const disposables = [];
    const add = (geometry, material) => {
      disposables.push(geometry, material);
      const mesh = new THREE.Mesh(geometry, material);
      room.add(mesh);
      return mesh;
    };
    const box = add(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: dark.clone().lerp(light, .05), side: THREE.BackSide }));
    box.scale.set(34, 18, 34); box.position.y = 7;
    const panel = (color, intensity, width, height, position) => {
      const mesh = add(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(intensity), side: THREE.DoubleSide }));
      mesh.position.set(...position);
      mesh.lookAt(0, 0, 0);
    };
    panel(light, 5.5, 16, 7, [-5, 14, 4]);
    panel(cool, 3.4, 2.4, 12, [14, 4, -5]);
    panel(deep, 3, 13, 2.2, [-6, 3, -14]);
    panel(light, 1.2, 9, 3, [8, 6, 11]);
    const target = pmrem.fromScene(room, .035);
    disposables.forEach(resource => resource.dispose());
    pmrem.dispose();
    return target;
  }

  envTarget = physical ? buildEnvironment() : null;

  const hemisphere = new THREE.HemisphereLight(light, dark, .26);
  scene.add(hemisphere);

  const key = new THREE.SpotLight(light, 6.2, 0, .6, .92, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(tier.shadow || 1024, tier.shadow || 1024);
  renderer.shadowMap.enabled = tier.shadow > 0;
  key.shadow.camera.near = 2;
  key.shadow.camera.far = 60;
  key.shadow.normalBias = .03;
  key.shadow.bias = -.0002;
  key.shadow.radius = 4;
  scene.add(key, key.target);
  const keyOffset = new THREE.Vector3(-11.5, 11, 9);
  const keyAim = new THREE.Vector3(-1.4, 0, -1.2);
  const sky = new THREE.DirectionalLight(light, .42);
  sky.position.set(-7, 12, 6);
  const fill = new THREE.DirectionalLight(cool.clone().lerp(light, .65), .32);
  fill.position.set(5, 3, -7);
  const rim = new THREE.DirectionalLight(deep.clone().lerp(light, .3), .45);
  rim.position.set(2, 3.5, -10);
  scene.add(sky, fill, rim);

  function withSeams(material, part) {
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, seamUniforms);
      shader.vertexShader = 'varying vec3 vSeamWorld;\nvarying float vSeamUp;\n' + shader.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
        vec4 seamWorld = vec4( transformed, 1.0 );
        vec3 seamNormal = objectNormal;
        #ifdef USE_INSTANCING
          seamWorld = instanceMatrix * seamWorld;
          seamNormal = mat3( instanceMatrix ) * seamNormal;
        #endif
        seamWorld = modelMatrix * seamWorld;
        vSeamWorld = seamWorld.xyz;
        vSeamUp = normalize( mat3( modelMatrix ) * seamNormal ).y;`);
      shader.fragmentShader = SEAM_GLSL + 'varying vec3 vSeamWorld;\nvarying float vSeamUp;\n' + shader.fragmentShader
        .replace('#include <color_fragment>', part === 'ground' ? `#include <color_fragment>
          {
            float seamD; float seamNode;
            seamEnergy( seamToField( vSeamWorld.xz ), seamD, seamNode );
            float toWall = uSeamPitch.x * 0.0 + ( ${(FIELD.gap / 2).toFixed(3)} - abs( seamD ) );
            diffuseColor.rgb *= mix( .38, 1.0, smoothstep( 0.0, .3, toWall ) );
          }` : `#include <color_fragment>
          {
            float wall = 1.0 - abs( vSeamUp );
            float height = vSeamWorld.y - uSeamGround;
            diffuseColor.rgb *= mix( 1.0, mix( .5, 1.0, smoothstep( 0.0, .34, height ) ), wall );
          }`)
        .replace('#include <emissivemap_fragment>', part === 'ground' ? '#include <emissivemap_fragment>' : `#include <emissivemap_fragment>
          {
            float seamD; float seamNode;
            vec3 seamLight = seamEnergy( seamToField( vSeamWorld.xz ), seamD, seamNode );
            float wall = 1.0 - abs( vSeamUp );
            float height = max( vSeamWorld.y - uSeamGround, 0.0 );
            totalEmissiveRadiance += ( seamLight + seamNode * uSeamCyan ) * exp( - height * 3.8 ) * wall * .38 * uSeamGain;
          }`);
    };
    material.customProgramCacheKey = () => 'nm-seam-' + part;
    return material;
  }
  const surface = (color, roughness, coat) => physical
    ? new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0, clearcoat: coat, clearcoatRoughness: .44, envMap: envTarget?.texture ?? null, envMapIntensity: .55 })
    : new THREE.MeshStandardMaterial({ color, roughness: Math.min(1, roughness + .15), metalness: .02, envMap: envTarget?.texture ?? null, envMapIntensity: .35 });
  const topMaterial = withSeams(surface(slate, .56, .45), 'top');
  const sideMaterial = withSeams(surface(side, .7, .14), 'side');
  const groundMaterial = withSeams(new THREE.MeshStandardMaterial({
    color: groundColor, roughness: 1, metalness: 0, envMap: envTarget?.texture ?? null, envMapIntensity: .12
  }), 'ground');
  const materials = [topMaterial, sideMaterial, groundMaterial];

  const field = new THREE.Group();
  field.position.set(FIELD.origin.x, 0, FIELD.origin.y);
  field.rotation.y = FIELD.angle;
  scene.add(field);
  const groundGeometry = new THREE.PlaneGeometry(140, 140);
  groundGeometry.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.position.y = FIELD.ground;
  ground.receiveShadow = true;
  field.add(ground);

  function slabGeometry() {
    const bevel = .05, radius = .16;
    const w = FIELD.width - 2 * bevel, d = FIELD.depth - 2 * bevel;
    const x = -w / 2, y = -d / 2, r = Math.min(radius, w / 2, d / 2);
    const shape = new THREE.Shape();
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + d - r); shape.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    shape.lineTo(x + r, y + d); shape.quadraticCurveTo(x, y + d, x, y + d - r);
    shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: FIELD.thickness - 2 * bevel, bevelEnabled: true,
      bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 5
    });
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, -(FIELD.thickness - bevel), 0);
    return geometry;
  }
  const slabShape = slabGeometry();
  const hash2 = (i, j) => {
    const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const RAISES = [0, 0, 0, .2, .38, .62, .95, 1.35];
  const slabCells = [];
  for (let i = -FIELD.half; i < FIELD.half; i++) {
    for (let j = -FIELD.half; j < FIELD.half; j++) {
      const near = Math.abs(i + .5) < 1 && Math.abs(j + .5) < 1;
      const raise = near ? (i === 0 && j === -1 ? .36 : 0) : RAISES[Math.floor(hash2(i, j) * RAISES.length)];
      slabCells.push({
        x: (i + .5) * FIELD.pitchX, z: (j + .5) * FIELD.pitchZ, raise
      });
    }
  }
  const slabs = new THREE.InstancedMesh(slabShape, [topMaterial, sideMaterial], slabCells.length);
  slabs.castShadow = slabs.receiveShadow = true;
  slabs.frustumCulled = false;
  field.add(slabs);
  const slabMatrix = new THREE.Matrix4();

  function placeSlabs() {
    slabCells.forEach((cell, index) => {
      slabMatrix.makeTranslation(cell.x, FIELD.top + cell.raise, cell.z);
      slabs.setMatrixAt(index, slabMatrix);
    });
    slabs.instanceMatrix.needsUpdate = true;
  }
  placeSlabs();

  const fogUniforms = { uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR } };
  const seamGeometry = new THREE.PlaneGeometry(140, 140);
  seamGeometry.rotateX(-Math.PI / 2);
  const seamMaterial = new THREE.ShaderMaterial({
    uniforms: { ...seamUniforms, ...fogUniforms },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false,
    vertexShader:  `
      uniform vec2 uFieldOrigin, uFieldRot;
      varying vec2 vField; varying float vDepth;
      void main(){
        vField = position.xz;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: SEAM_GLSL +  `
      uniform float uFogNear, uFogFar;
      varying vec2 vField; varying float vDepth;
      void main(){
        float d; float node;
        vec3 energy = seamEnergy(vField, d, node);
        float core = exp(-d * d * 140.0);
        float halo = exp(-abs(d) * 6.0) * .26;
        vec3 color = energy * (core + halo) + mix(uSeamCyan, uSeamBlue, .5) * node;
        color *= 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
        gl_FragColor = vec4(color * uSeamGain, 1.0);
      }`
  });
  const seams = new THREE.Mesh(seamGeometry, seamMaterial);
  seams.position.y = FIELD.ground + .004;
  seams.renderOrder = 2;
  seams.frustumCulled = false;
  field.add(seams);

  const DUST_MAX = TIERS.high.dust;
  const dustGeometry = new THREE.BufferGeometry();
  const dustSeed = new Float32Array(DUST_MAX * 3), dustLook = new Float32Array(DUST_MAX * 3);
  for (let i = 0; i < DUST_MAX; i++) {
    dustSeed.set([hash2(i, 1.3) - .5, hash2(i, 7.1), hash2(i, 3.7) - .5], i * 3);
    dustLook.set([1 + hash2(i, 9.2) * 1.8, hash2(i, 4.4) * 6.2832, hash2(i, 5.9)], i * 3);
  }
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DUST_MAX * 3), 3));
  dustGeometry.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 3));
  dustGeometry.setAttribute('aLook', new THREE.BufferAttribute(dustLook, 3));
  dustGeometry.setDrawRange(0, tier.dust);
  const dustMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uCenter: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(30, 6.5, 30) },
      uPixel: { value: 1 }, uFocus: { value: cameraDistance }, uIntensity: { value: 0 },
      uWarm: { value: light.clone() }, uCool: { value: cool.clone() }, ...fogUniforms
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false,
    vertexShader:  `
      attribute vec3 aSeed, aLook;
      uniform float uTime, uPixel, uFocus, uFogNear, uFogFar;
      uniform vec3 uCenter, uBox;
      varying float vAlpha, vTint;
      void main(){
        vec3 p = aSeed * uBox;
        p += vec3(sin(uTime * .05 + aLook.y) * 1.3, uTime * .07 * (.5 + aLook.z), cos(uTime * .04 + aLook.y * 1.7) * 1.3);
        vec3 rel = mod(p - vec3(uCenter.x, 0.0, uCenter.z) + vec3(uBox.x, 0.0, uBox.z) * .5, uBox) - vec3(uBox.x, 0.0, uBox.z) * .5;
        vec3 world = vec3(uCenter.x + rel.x, -.2 + rel.y, uCenter.z + rel.z);
        vec4 mv = modelViewMatrix * vec4(world, 1.0);
        gl_Position = projectionMatrix * mv;
        float edge = max(abs(rel.x) / uBox.x, abs(rel.z) / uBox.z) * 2.0;
        float vertical = smoothstep(0.0, .6, rel.y) * (1.0 - smoothstep(uBox.y - 1.2, uBox.y, rel.y));
        float blur = clamp(abs(-mv.z - uFocus) * .11, 0.0, 1.0);
        gl_PointSize = (aLook.x + blur * 5.0) * uPixel;
        float twinkle = .62 + .38 * sin(uTime * (.5 + aLook.z * .6) + aLook.y * 3.0);
        vAlpha = (1.0 - smoothstep(.72, 1.0, edge)) * vertical * twinkle * mix(1.0, .22, blur)
          * (1.0 - smoothstep(uFogNear, uFogFar, -mv.z));
        vTint = step(.72, aLook.z);
      }`,
    fragmentShader:  `
      uniform float uIntensity;
      uniform vec3 uWarm, uCool;
      varying float vAlpha, vTint;
      void main(){
        float r = length(gl_PointCoord - .5) * 2.0;
        float a = 1.0 - smoothstep(0.0, 1.0, r);
        gl_FragColor = vec4(mix(uWarm, uCool, vTint) * a * a * vAlpha * uIntensity, 1.0);
      }`
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.frustumCulled = false;
  dust.renderOrder = 3;
  dust.visible = tier.dust > 0;
  scene.add(dust);

  let format = targetFormat(tier);
  let sceneTarget = makeSceneTarget(format);
  function makeSceneTarget(spec) {
    const target = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat, type: spec.type, samples: spec.samples,
      depthBuffer: true, stencilBuffer: false, resolveDepthBuffer: false
    });
    target.texture.colorSpace = THREE.LinearSRGBColorSpace;
    return target;
  }
  const quadGeometry = new THREE.BufferGeometry();
  quadGeometry.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  quadGeometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const quadCamera = new THREE.Camera();
  const QUAD_VERTEX = 'varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  function quadPass(material) {
    const pass = new THREE.Scene();
    const mesh = new THREE.Mesh(quadGeometry, material);
    mesh.frustumCulled = false;
    pass.add(mesh);
    return pass;
  }

  const bloomDown = new THREE.ShaderMaterial({
    uniforms: { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: .9 }, uKnee: { value: .55 }, uPrefilter: { value: 0 } },
    depthTest: false, depthWrite: false, toneMapped: false,
    vertexShader: QUAD_VERTEX,
    fragmentShader:  `
      uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThreshold, uKnee, uPrefilter;
      varying vec2 vUv;
      vec3 s(vec2 o){ return texture2D(tSrc, vUv + o * uTexel).rgb; }
      float karis(vec3 c){ return 1.0 / (1.0 + max(c.r, max(c.g, c.b))); }
      void main(){
        vec3 a = s(vec2(-2.0, 2.0)), b = s(vec2(0.0, 2.0)), c = s(vec2(2.0, 2.0));
        vec3 d = s(vec2(-2.0, 0.0)), e = s(vec2(0.0)), f = s(vec2(2.0, 0.0));
        vec3 g = s(vec2(-2.0, -2.0)), h = s(vec2(0.0, -2.0)), i = s(vec2(2.0, -2.0));
        vec3 j = s(vec2(-1.0, 1.0)), k = s(vec2(1.0, 1.0)), l = s(vec2(-1.0, -1.0)), m = s(vec2(1.0, -1.0));
        vec3 col;
        if (uPrefilter > .5) {
          // Karis average on the first mip keeps thin seams from flickering.
          vec3 g0 = (j + k + l + m) * .25, g1 = (a + b + d + e) * .25, g2 = (b + c + e + f) * .25;
          vec3 g3 = (d + e + g + h) * .25, g4 = (e + f + h + i) * .25;
          float w0 = karis(g0) * .5, w1 = karis(g1) * .125, w2 = karis(g2) * .125, w3 = karis(g3) * .125, w4 = karis(g4) * .125;
          col = (g0 * w0 + g1 * w1 + g2 * w2 + g3 * w3 + g4 * w4) / (w0 + w1 + w2 + w3 + w4);
        } else {
          col = e * .125 + (a + c + g + i) * .03125 + (b + d + f + h) * .0625 + (j + k + l + m) * .125;
        }
        if (uPrefilter > .5) {
          col = min(col, vec3(10.0));
          float bright = max(col.r, max(col.g, col.b));
          float soft = clamp(bright - uThreshold + uKnee, 0.0, 2.0 * uKnee);
          soft = soft * soft / (4.0 * uKnee + 1e-4);
          col *= max(soft, bright - uThreshold) / max(bright, 1e-4);
        }
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const bloomUp = new THREE.ShaderMaterial({
    uniforms: { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uRadius: { value: 1 } },
    depthTest: false, depthWrite: false, toneMapped: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation,
    vertexShader: QUAD_VERTEX,
    fragmentShader:  `
      uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uRadius;
      varying vec2 vUv;
      vec3 s(vec2 o){ return texture2D(tSrc, vUv + o * uTexel * uRadius).rgb; }
      void main(){
        vec3 col = s(vec2(0.0)) * 4.0
          + (s(vec2(0.0, 1.0)) + s(vec2(-1.0, 0.0)) + s(vec2(1.0, 0.0)) + s(vec2(0.0, -1.0))) * 2.0
          + s(vec2(-1.0, 1.0)) + s(vec2(1.0, 1.0)) + s(vec2(-1.0, -1.0)) + s(vec2(1.0, -1.0));
        gl_FragColor = vec4(col / 16.0, 1.0);
      }`
  });
  const bloomDownPass = quadPass(bloomDown), bloomUpPass = quadPass(bloomUp);
  let bloomTargets = [];
  function makeBloomTargets() {
    bloomTargets.forEach(target => target.dispose());
    bloomTargets = [];
    if (!format.hdr) return;
    for (let i = 0; i < tier.bloomMips; i++) {
      const target = new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false,
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter
      });
      target.texture.colorSpace = THREE.LinearSRGBColorSpace;
      bloomTargets.push(target);
    }
  }
  makeBloomTargets();
  const blackTexture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blackTexture.needsUpdate = true;

  const uniforms = {
    sceneTexture: { value: sceneTarget.texture },
    bloomTexture: { value: blackTexture },
    bloomStrength: { value: 0 },
    viewport: { value: new THREE.Vector2(1, 1) },
    menuRect: { value: new THREE.Vector4(-10000, -10000, 0, 0) },
    pillRect: { value: new THREE.Vector4(-10000, -10000, 0, 0) },
    menuRadius: { value: 32 },
    pillRadius: { value: 24 },
    glassVisible: { value: 0 },
    pillVisible: { value: 0 },
    ambientAmount: { value: settings.ambient },
    depthAmount: { value: settings.depth },
    aberration: { value: tier.aberration ? 1 : 0 },
    grainTime: { value: 0 },
    liftColor: { value: dark.clone().lerp(deep, .35).multiplyScalar(.55) },
    glint: { value: new THREE.Vector2(-.55, .85) }
  };
  const compositeMaterial = new THREE.ShaderMaterial({
    uniforms, depthWrite: false, depthTest: false, toneMapped: true,
    vertexShader: QUAD_VERTEX,
    fragmentShader:  `
      precision highp float;
      uniform sampler2D sceneTexture, bloomTexture;
      uniform vec2 viewport, glint;
      uniform vec4 menuRect, pillRect;
      uniform vec3 liftColor;
      uniform float menuRadius, pillRadius, glassVisible, pillVisible, ambientAmount, depthAmount;
      uniform float bloomStrength, aberration, grainTime;
      varying vec2 vUv;
      float roundedBox(vec2 p, vec2 b, float r){
        vec2 q = abs(p) - b + r;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
      }
      vec3 sampleScene(vec2 uv){ return texture2D(sceneTexture, clamp(uv, vec2(.001), vec2(.999))).rgb; }
      vec3 sampleBloom(vec2 uv){ return texture2D(bloomTexture, clamp(uv, vec2(.001), vec2(.999))).rgb * bloomStrength; }
      vec3 frost(vec2 uv, vec2 stepSize){
        vec3 c = sampleScene(uv) * .25;
        c += (sampleScene(uv + vec2(stepSize.x, 0.0)) + sampleScene(uv - vec2(stepSize.x, 0.0))) * .125;
        c += (sampleScene(uv + vec2(0.0, stepSize.y)) + sampleScene(uv - vec2(0.0, stepSize.y))) * .125;
        c += (sampleScene(uv + stepSize) + sampleScene(uv - stepSize)
           + sampleScene(uv + vec2(stepSize.x, -stepSize.y))
           + sampleScene(uv + vec2(-stepSize.x, stepSize.y))) * .0625;
        return c;
      }
      float hash12(vec2 p){
        vec3 p3 = fract(vec3(p.xyx) * .1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }
      vec2 boxNormal(vec2 p, vec2 halfSize, float radius){
        vec2 e = vec2(.8, 0.0);
        return normalize(vec2(
          roundedBox(p + e, halfSize, radius) - roundedBox(p - e, halfSize, radius),
          roundedBox(p + e.yx, halfSize, radius) - roundedBox(p - e.yx, halfSize, radius)
        ) + vec2(.00001));
      }
      void main(){
        vec3 base;
        if (aberration > .001) {
          // A real lens disperses only towards the frame edges, a little more
          // while the camera travels.
          vec2 dir = vUv - .5;
          vec2 shift = dir * dot(dir, dir) * .0042 * aberration;
          base = vec3(sampleScene(vUv + shift).r, sampleScene(vUv).g, sampleScene(vUv - shift).b);
        } else base = sampleScene(vUv);
        base += sampleBloom(vUv);
        float exposure = mix(.58, 1.12, ambientAmount);
        base *= exposure;
        // Gentle atmospheric falloff leaves the workspace readable.
        vec2 screen = (vUv - .5) * vec2(viewport.x / viewport.y, 1.0);
        base *= 1.0 - .16 * clamp(dot(screen, screen), 0.0, 1.0);
        if (glassVisible > .5 || pillVisible > .5) {
          vec2 halfSize = menuRect.zw * .5;
          vec2 p = vUv * viewport - menuRect.xy - halfSize;
          float radius = min(menuRadius, min(halfSize.x, halfSize.y));
          float menuSdf = glassVisible > .5 ? roundedBox(p, halfSize, radius) : 1e4;
          // The selected item is a thicker lens that magnifies what is behind
          // it; dock and lens form one glass shape, so a lifted lens still
          // refracts where it leaves the dock.
          vec2 pillHalf = pillRect.zw * .5;
          vec2 q = vUv * viewport - pillRect.xy - pillHalf;
          float pillR = min(pillRadius, min(pillHalf.x, pillHalf.y));
          float pillSdf = pillVisible > .5 ? roundedBox(q, pillHalf, pillR) : 1e4;
          float sdf = min(menuSdf, pillSdf);
          float mask = 1.0 - smoothstep(-.8, .8, sdf);
          // The menu is a thin glass surface; it casts no broad outer shadow.
          if (sdf < 1.0) {
            bool onDock = menuSdf <= pillSdf;
            vec2 normal = onDock ? boxNormal(p, halfSize, radius) : boxNormal(q, pillHalf, pillR);
            vec2 local = onDock ? p : q;
            vec2 localHalf = onDock ? halfSize : pillHalf;
            float edge = exp(-abs(sdf) / 3.5);
            vec2 interior = local / max(localHalf, vec2(1.0));
            // Convex edge normals bend the actual slab edges behind the menu.
            vec2 refraction = (normal * edge * (2.0 + depthAmount * 3.0) + interior * .6) / viewport;
            vec2 uv = vUv - refraction;
            float pillMask = 1.0 - smoothstep(-.8, .8, pillSdf);
            float pillRim = exp(-abs(pillSdf + .6) / .9) * pillMask;
            if (pillVisible > .5) {
              vec2 pillNormal = boxNormal(q, pillHalf, pillR);
              uv -= (pillNormal * exp(-abs(pillSdf) / 2.5) * 2.5 + q * .045) / viewport * pillMask;
            }
            vec3 frosted = (frost(uv, vec2(4.0 + depthAmount * 4.0) / viewport) + sampleBloom(uv) * .9) * exposure;
            float chroma = .32 * edge / viewport.x;
            frosted.r = mix(frosted.r, sampleScene(uv + vec2(chroma, 0.0)).r * exposure, .10);
            frosted.b = mix(frosted.b, sampleScene(uv - vec2(chroma, 0.0)).b * exposure, .10);
            vec3 glass = frosted * .56 + vec3(.006, .009, .012);
            // Broad reflection and narrow Fresnel rim; the reflection leans
            // with the camera so the dock catches light as the scene moves.
            float reflection = pow(clamp(.5 + .5 * dot(normal, normalize(glint)), 0.0, 1.0), 2.0);
            float rim = exp(-abs(sdf + .7) / .7);
            float bevel = exp(-abs(sdf + 1.8) / 1.8);
            glass += vec3(.045, .052, .06) * rim * (.22 + .78 * reflection);
            glass += vec3(.006, .008, .010) * bevel * reflection;
            glass += vec3(.012, .015, .018) * pillMask + vec3(.03, .036, .042) * pillRim;
            float wash = clamp(.5 + local.y / max(localHalf.y * 2.0, 1.0), 0.0, 1.0);
            glass += vec3(.003, .004, .005) * wash * wash;
            base = mix(base, glass, mask);
          }
        }
        // Lift the deepest shadows into the page's night blue instead of
        // crushing them to black, then add a fine film grain.
        float luma = dot(base, vec3(.2126, .7152, .0722));
        base += liftColor * (1.0 - smoothstep(0.0, .03, luma)) * .1;
        base *= 1.0 + (hash12(gl_FragCoord.xy + fract(grainTime) * vec2(311.0, 173.0)) - .5) * .05;
        gl_FragColor = vec4(max(base, vec3(0.0)), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        // Dither in display space removes banding in the dark gradients.
        gl_FragColor.rgb += (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(.06711056, .00583715)))) - .5) / 255.0;
      }`
  });
  const compositePass = quadPass(compositeMaterial);

  const RIG_OMEGA = 15;

  const RIG_REST = [2e-3, 2e-3, 1e-4, 1e-4, 1e-4];
  const RIG_SETTLED = [.06, .06, 2e-3, 2e-3, 2e-3];
  const rig = FRAMES.home.map(value => ({ goal: value, inner: value, innerV: 0, value, valueV: 0 }));
  let view = 'home';
  function frameFor(name) { return FRAMES[name] || FRAMES.home; }
  function setView(name, instant = false) {
    const frame = frameFor(name);
    view = FRAMES[name] ? name : 'home';
    host.dataset.view = view;
    rig.forEach((axis, index) => {
      axis.goal = frame[index];
      if (instant) { axis.inner = axis.value = axis.goal; axis.innerV = axis.valueV = 0; }
    });
    if (!instant) wakeRig();
    requestFrame();
  }

  function glideEnergy() {
    return clamp(Math.hypot(rig[0].valueV, rig[1].valueV) / 38, 0, 1);
  }
  function rigMoving() {
    return rig.some((axis, index) => Math.abs(axis.goal - axis.value) > RIG_SETTLED[index] ||
      Math.abs(axis.valueV) > RIG_SETTLED[index] * 5 || Math.abs(axis.innerV) > RIG_SETTLED[index] * 5);
  }
  function stepRig(dt) {
    if (reduced.matches || settings.motion === 0) {
      rig.forEach(axis => { axis.inner = axis.value = axis.goal; axis.innerV = axis.valueV = 0; });
      return false;
    }
    const steps = Math.max(1, Math.ceil(dt / .004)), h = dt / steps, w2 = RIG_OMEGA * RIG_OMEGA, c = 2 * RIG_OMEGA;
    rig.forEach((axis, index) => {
      for (let i = 0; i < steps; i++) {
        axis.innerV += ((axis.goal - axis.inner) * w2 - axis.innerV * c) * h;
        axis.inner += axis.innerV * h;
        axis.valueV += ((axis.inner - axis.value) * w2 - axis.valueV * c) * h;
        axis.value += axis.valueV * h;
      }
      const rest = RIG_REST[index];
      if (Math.abs(axis.goal - axis.value) < rest && Math.abs(axis.valueV) < rest * 5 && Math.abs(axis.innerV) < rest * 5) {
        axis.inner = axis.value = axis.goal; axis.innerV = axis.valueV = 0;
      }
    });
    return rigMoving();
  }

  let width = 0, height = 0, pixelRatio = 1;
  let raf = 0, lastTick = 0, lastDraw = 0, frames = 0, lost = false, disposed = false, ready = false;
  let menu = null, menuObserver = null;
  let targetX = 0, targetY = 0, offsetX = 0, offsetY = 0;
  let movingUntil = 0, dirty = true, menuDirty = true, shadowDirty = true;
  let ambientTime = 0, introTime = 0, introActive = false;
  let tierChangedAt = 0, slowWindows = 0, frameCap = tier.frameCap;
  const intervals = [];
  const renderTimes = [];
  const removers = [];
  const target = new THREE.Vector3();
  function listen(eventTarget, type, handler, options) {
    eventTarget.addEventListener(type, handler, options);
    removers.push(() => eventTarget.removeEventListener(type, handler, options));
  }
  function available() { return !disposed && !lost && !shaderFailed && ready && !document.hidden && width > 0 && height > 0; }
  function backgroundRunning() {

    return available() && !reduced.matches && settings.motion > 0 && !document.querySelector('dialog[open]') &&
      root.dataset.modernCardMotion !== 'true';
  }
  let menuShown = true, pillOpaque = true;
  function locateMenu() {
    const found = null;
    if (found === menu) return;
    menuObserver?.disconnect();
    menu = found;
    if (menu) {
      menuObserver = new ResizeObserver(() => requestFrame());
      menuObserver.observe(menu);
    }
  }
  function readMenu() {
    locateMenu();
    if (!menu) { uniforms.glassVisible.value = uniforms.pillVisible.value = 0; return; }
    const box = menu.getBoundingClientRect();
    veilTop = box.top;
    const pill = menu.querySelector('.menu-active-pill');
    const pillBox = pill?.getBoundingClientRect();

    {
      const style = getComputedStyle(menu);
      const pillStyle = pill && getComputedStyle(pill);
      menuShown = style.visibility !== 'hidden';
      pillOpaque = !!pillStyle && pillStyle.visibility !== 'hidden' && Number(pillStyle.opacity) > .05;
      uniforms.menuRadius.value = parseFloat(style.borderTopLeftRadius) || 32;
      uniforms.pillRadius.value = parseFloat(pillStyle?.borderTopLeftRadius) || 22;
    }
    uniforms.glassVisible.value = box.width > 0 && box.height > 0 && menuShown ? 1 : 0;
    uniforms.menuRect.value.set(box.left, height - box.bottom, box.width, box.height);

    const pillShown = !!pillBox && pillBox.width > 0 && pillBox.height > 0 && pillOpaque &&
      pillBox.bottom <= box.bottom + 16 && pillBox.top >= box.top - 16;
    uniforms.pillVisible.value = pillShown ? 1 : 0;
    if (pillShown) uniforms.pillRect.value.set(pillBox.left, height - pillBox.bottom, pillBox.width, pillBox.height);
  }
  function renderBloom() {
    if (!bloomTargets.length) { uniforms.bloomTexture.value = blackTexture; uniforms.bloomStrength.value = 0; return; }
    let source = sceneTarget.texture, sourceWidth = sceneTarget.width, sourceHeight = sceneTarget.height;
    bloomTargets.forEach((destination, index) => {
      bloomDown.uniforms.tSrc.value = source;
      bloomDown.uniforms.uTexel.value.set(1 / sourceWidth, 1 / sourceHeight);
      bloomDown.uniforms.uPrefilter.value = index === 0 ? 1 : 0;
      renderer.setRenderTarget(destination);
      renderer.render(bloomDownPass, quadCamera);
      source = destination.texture; sourceWidth = destination.width; sourceHeight = destination.height;
    });
    for (let index = bloomTargets.length - 1; index > 0; index--) {
      const from = bloomTargets[index];
      bloomUp.uniforms.tSrc.value = from.texture;
      bloomUp.uniforms.uTexel.value.set(1 / from.width, 1 / from.height);
      renderer.setRenderTarget(bloomTargets[index - 1]);
      renderer.render(bloomUpPass, quadCamera);
    }
    uniforms.bloomTexture.value = bloomTargets[0].texture;
    uniforms.bloomStrength.value = .62;
  }
  function placeCamera() {

    const [panX, panZ, yaw, pitch, zoom] = rig.map(axis => axis.value);
    target.copy(lookBase);
    target.x += panX;
    target.z += panZ;
    const azimuth = baseYaw + yaw;
    const elevation = basePitch + pitch;
    camera.position.set(
      target.x + cameraDistance * Math.cos(elevation) * Math.sin(azimuth) + offsetX,
      target.y + cameraDistance * Math.sin(elevation),
      target.z + cameraDistance * Math.cos(elevation) * Math.cos(azimuth) + offsetY
    );
    camera.lookAt(target);
    if (Math.abs(camera.zoom - zoom) > 1e-6) { camera.zoom = zoom; camera.updateProjectionMatrix(); }
    key.target.position.set(target.x + keyAim.x, FIELD.top, target.z + keyAim.z);
    key.position.copy(key.target.position).add(keyOffset);
    seamUniforms.uSeamFocus.value.set(
      Math.cos(FIELD.angle) * (target.x - FIELD.origin.x) - Math.sin(FIELD.angle) * (target.z - FIELD.origin.y),
      Math.sin(FIELD.angle) * (target.x - FIELD.origin.x) + Math.cos(FIELD.angle) * (target.z - FIELD.origin.y)
    );
    dustMaterial.uniforms.uCenter.value.copy(target);
    uniforms.glint.value.set(-.55 + offsetX * .8 + yaw * .9, .85);
  }
  function draw(now) {
    if (!available()) return;
    const started = performance.now();
    if (menuDirty) { readMenu(); menuDirty = false; }
    const time = ambientTime;
    seamUniforms.uSeamTime.value = time;
    seamUniforms.uSeamIntro.value = introActive ? easeIntro(introTime) : 1;

    const energy = glideEnergy();
    seamUniforms.uSeamGain.value = (format.hdr ? 1 : .42) * (1 + .7 * energy);
    uniforms.aberration.value = (tier.aberration ? 1 : 0) + 1.4 * energy;
    dustMaterial.uniforms.uTime.value = time;
    dustMaterial.uniforms.uIntensity.value = (introActive ? Math.min(1, introTime / 1.6) : 1) * .55;
    uniforms.grainTime.value = time * 1.37;
    placeCamera();

    if (shadowDirty) { renderer.shadowMap.needsUpdate = renderer.shadowMap.enabled; shadowDirty = false; }
    renderer.setRenderTarget(sceneTarget);
    renderer.clear();
    renderer.render(scene, camera);
    renderBloom();
    renderer.setRenderTarget(null);
    renderer.render(compositePass, quadCamera);
    if (shaderFailed) return;
    paintVeil();
    if (root.dataset.spatialReady !== 'true') {
      root.dataset.spatialReady = 'true';
      renderer.domElement.style.transition = reduced.matches ? '' : 'opacity .6s cubic-bezier(.22,1,.36,1)';
      renderer.domElement.style.opacity = '1';
    }
    if (!root.classList.contains('nm-scene-ready')) root.classList.add('nm-scene-ready');
    const elapsed = performance.now() - started;
    renderTimes.push(elapsed);
    if (renderTimes.length > 60) renderTimes.shift();
    if (lastDraw && now > lastDraw) {
      intervals.push(now - lastDraw);
      if (intervals.length > 90) intervals.shift();
    }
    lastDraw = now;
    host.dataset.frames = String(++frames);
    host.dataset.frameMs = elapsed.toFixed(2);
    host.dataset.frameMeanMs = (renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length).toFixed(2);
    if (intervals.length >= 12) {
      host.dataset.fps = (1000 * intervals.length / intervals.reduce((a, b) => a + b, 0)).toFixed(1);
    }
    dirty = false;
  }
  function easeIntro(t) {
    const x = clamp((t - .2) / 2.4, 0, 1);
    return 1 - Math.pow(1 - x, 3);
  }
  function stop() {
    cancelAnimationFrame(raf); raf = 0; lastTick = 0; lastDraw = 0;
    host.dataset.motion = 'still';
    root.dataset.nmScene = reduced.matches ? 'static' : 'paused';
  }

  function adapt(now) {
    if (intervals.length < 90 || now - tierChangedAt < 2500 || tierName === 'low' || TIERS[requested]) return;
    const sorted = intervals.slice().sort((a, b) => a - b);
    const refresh = Math.max(sorted[Math.floor(sorted.length * .1)], 4);
    const median = sorted[Math.floor(sorted.length / 2)];
    slowWindows = median > refresh * 1.45 && median > 9 ? slowWindows + 1 : 0;
    intervals.length = 0;
    if (slowWindows < 2) return;
    slowWindows = 0;

    if (!frameCap && tierName === 'medium') { frameCap = 16; tierChangedAt = now; }
    else applyTier(TIER_ORDER[TIER_ORDER.indexOf(tierName) - 1], now);
  }
  function applyTier(name, now = performance.now()) {
    if (!TIERS[name] || name === tierName) return;
    tierName = name; tier = TIERS[name]; tierChangedAt = now; frameCap = tier.frameCap;
    const next = targetFormat(tier);
    if (next.samples !== format.samples || next.type !== format.type) {
      format = next;
      sceneTarget.dispose();
      sceneTarget = makeSceneTarget(format);
      uniforms.sceneTexture.value = sceneTarget.texture;
    }
    makeBloomTargets();
    if (renderer.shadowMap.enabled !== tier.shadow > 0) {

      renderer.shadowMap.enabled = tier.shadow > 0;
      materials.forEach(material => { material.needsUpdate = true; });
    }
    if (tier.shadow && key.shadow.mapSize.x !== tier.shadow) {
      key.shadow.mapSize.set(tier.shadow, tier.shadow);
      key.shadow.map?.dispose(); key.shadow.map = null;
    }
    shadowDirty = true;
    dustGeometry.setDrawRange(0, tier.dust);
    dust.visible = tier.dust > 0;
    seamUniforms.uSeamGain.value = format.hdr ? 1 : .42;
    width = 0; resize();
    host.dataset.quality = tierName;
  }
  function tick(now) {
    raf = 0;
    if (!available()) { stop(); return; }
    const dt = lastTick ? Math.min((now - lastTick) / 1000, .05) : 1 / 60;
    lastTick = now;
    const backgroundActive = backgroundRunning();
    if (backgroundActive) ambientTime += dt * settings.motion / .35;
    const follow = 1 - Math.exp(-dt * 12);
    if (reduced.matches || settings.motion === 0) {
      targetX = targetY = offsetX = offsetY = 0;
    } else {
      offsetX += (targetX - offsetX) * follow;
      offsetY += (targetY - offsetY) * follow;
    }
    const gliding = stepRig(dt);
    if (introActive) {
      introTime += dt;
      if (introTime > 2.8 || reduced.matches) introActive = false;
    }
    const settling = Math.abs(targetX - offsetX) + Math.abs(targetY - offsetY) > .0002;
    const menuMoving = !reduced.matches && now < movingUntil;
    const urgent = dirty || settling || menuMoving || gliding || introActive;

    const due = urgent || !frameCap || !lastDraw || now - lastDraw >= frameCap - 1;
    if ((urgent || backgroundActive) && due) draw(now);
    if (backgroundActive && !urgent) adapt(now);
    if (settling || menuMoving || gliding || introActive || backgroundActive) {
      host.dataset.motion = backgroundActive ? 'ambient' : 'settling';
      root.dataset.nmScene = 'running';
      raf = requestAnimationFrame(tick);
    } else { stop(); }
  }
  function wakeRig() { if (available() && !raf) raf = requestAnimationFrame(tick); }
  function requestFrame(duration = 0) {
    dirty = true; menuDirty = true;
    if (duration && !reduced.matches) movingUntil = Math.max(movingUntil, performance.now() + duration);
    if (available() && !raf) raf = requestAnimationFrame(tick);
  }
  function resize() {
    if (disposed || lost) return;
    veilFade = -1;
    const box = host.getBoundingClientRect();
    const nextWidth = Math.round(box.width), nextHeight = Math.round(box.height);
    if (!nextWidth || !nextHeight) return;
    const budget = Math.sqrt(tier.pixels / (nextWidth * nextHeight));
    const nextRatio = Math.max(.5, Math.min(devicePixelRatio || 1, tier.dpr, budget));
    if (width !== nextWidth || height !== nextHeight || Math.abs(pixelRatio - nextRatio) > .001) {
      width = nextWidth; height = nextHeight; pixelRatio = nextRatio;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      const bufferWidth = Math.max(1, Math.round(width * pixelRatio)), bufferHeight = Math.max(1, Math.round(height * pixelRatio));
      sceneTarget.setSize(bufferWidth, bufferHeight);
      bloomTargets.forEach((bloomTarget, index) => {
        const scale = 2 ** (index + 1);
        bloomTarget.setSize(Math.max(1, Math.floor(bufferWidth / scale)), Math.max(1, Math.floor(bufferHeight / scale)));
      });
      uniforms.viewport.value.set(width, height);
      dustMaterial.uniforms.uPixel.value = pixelRatio;
      const visibleHeight = 10.8;
      camera.left = -visibleHeight * width / height / 2;
      camera.right = -camera.left;
      camera.top = visibleHeight / 2;
      camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
      host.dataset.pixelRatio = pixelRatio.toFixed(2);
    }
    requestFrame();
  }

  const appliedEvents = new WeakSet();
  function appearance(event) {
    if (appliedEvents.has(event)) return;
    appliedEvents.add(event);
    for (const name of ['depth', 'ambient', 'motion']) {
      const value = event.detail?.[name];
      if (Number.isFinite(value)) settings[name] = clamp(value / 100, 0, 1);
    }
    uniforms.depthAmount.value = settings.depth;
    uniforms.ambientAmount.value = settings.ambient;
    if (!settings.motion) targetX = targetY = 0;
    requestFrame();
  }

  listen(window, 'menu-frame', () => {
    if (!available()) return;
    readMenu(); dirty = true;
    if (!raf) raf = requestAnimationFrame(tick);
  });
  listen(window, 'menu-transition', () => requestFrame(700));

  let settleTimer = 0;
  function leaveFor(name) {
    setView(name);
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      const committed = root.dataset.modernView;
      const actual = FRAMES[committed] ? committed : 'home';
      if (committed && actual !== view) setView(actual);
    }, 1600);
  }
  listen(document, 'menu-tool', event => { if (FRAMES[event.detail?.name]) leaveFor(event.detail.name); });
  listen(document, 'menu-home', () => leaveFor('home'));
  listen(document, 'modern-appearance', appearance);
  listen(window, 'modern-appearance', appearance);
  listen(window, 'appearance', appearance);

  listen(window, 'scroll', () => { if (!document.querySelector('dialog[open]')) requestFrame(); }, { passive: true, capture: true });
  listen(window, 'resize', resize);
  listen(document, 'visibilitychange', () => {
    if (document.hidden) stop();
    else { lastDraw = 0; intervals.length = 0; tierChangedAt = performance.now(); resize(); }
  });
  listen(reduced, 'change', () => {
    stop(); targetX = targetY = offsetX = offsetY = 0;
    movingUntil = 0; introActive = false; setView(view, true);
  });
  listen(renderer.domElement, 'webglcontextlost', event => {
    event.preventDefault(); lost = true; stop();
    host.dataset.renderer = 'css-fallback';
    root.dataset.spatialReady = 'false';
    root.dataset.nmScene = 'context-lost';
  });
  listen(renderer.domElement, 'webglcontextrestored', () => {
    lost = false; shaderFailed = false;

    if (envTarget) {
      envTarget.dispose();
      envTarget = buildEnvironment();
      materials.forEach(material => { material.envMap = envTarget.texture; });
    }
    renderer.shadowMap.needsUpdate = true;
    renderer.domElement.style.display = 'block';
    host.dataset.renderer = 'three-spatial';
    root.dataset.spatialReady = 'false'; width = 0; resize();
  });
  const hostObserver = new ResizeObserver(resize);
  hostObserver.observe(host);
  const domObserver = new MutationObserver(records => {
    if (records.some(record => record.type === 'attributes' && record.target.matches('dialog'))) requestFrame();
  });
  domObserver.observe(scope || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
  const viewObserver = new MutationObserver(() => {
    const next = root.dataset.modernView;
    if (next && next !== view && (FRAMES[next] || next === 'legacy')) setView(next);
  });
  viewObserver.observe(root, { attributes: true, attributeFilter: ['data-modern-view'] });
  listen(window, 'pagehide', event => { stop(); if (!event.persisted) dispose(); });
  listen(window, 'pageshow', event => { if (event.persisted) resize(); });

  function dispose() {
    if (disposed) return;
    disposed = true; stop(); clearTimeout(settleTimer); hostObserver.disconnect(); domObserver.disconnect(); viewObserver.disconnect(); menuObserver?.disconnect();
    removers.forEach(remove => remove());
    [slabShape, groundGeometry, seamGeometry, dustGeometry, quadGeometry].forEach(resource => resource.dispose());
    [...materials, seamMaterial, dustMaterial, bloomDown, bloomUp, compositeMaterial].forEach(resource => resource.dispose());
    slabs.dispose(); blackTexture.dispose(); envTarget?.dispose();
    sceneTarget.dispose(); bloomTargets.forEach(bloomTarget => bloomTarget.dispose());
    key.shadow.map?.dispose(); renderer.dispose();
    renderer.domElement.remove();
    root.dataset.spatialReady = 'false';
  }
  seamUniforms.uSeamGain.value = format.hdr ? 1 : .42;
  host.dataset.renderer = 'three-spatial';
  host.dataset.version = THREE.REVISION;
  host.dataset.quality = tierName;
  host.dataset.frames = '0';
  root.dataset.spatialReady = 'false';

  const initialView = FRAMES[root.dataset.modernView] ? root.dataset.modernView : 'home';
  setView(initialView, true);
  if (!reduced.matches && settings.motion > 0) { introActive = true; introTime = 0; }
  resize();

  const warm = [compositePass, bloomDownPass, bloomUpPass];
  const compile = typeof renderer.compileAsync === 'function'
    ? renderer.compileAsync(scene, camera).then(() => Promise.all(warm.map(pass => renderer.compileAsync(pass, quadCamera))))
    : Promise.resolve();
  compile.catch(() => {}).then(() => {
    if (disposed) return;
    ready = true; tierChangedAt = performance.now();
    renderer.shadowMap.needsUpdate = true;
    resize();
  });
  return { dispose, render: () => requestFrame() };
}
  return bootSpatial();
}

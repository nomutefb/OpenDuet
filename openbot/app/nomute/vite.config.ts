// 우리 사무실 빌드(edit.nomute.kr/garden-app/) — 원본 = 이 저장소 openbot/app·openbot/shared 그대로(손대지 않음)
// 고친 곳은 이 폴더(openbot/app/nomute) 한 곳: 바꿔 끼우기 표·글자 고치기 표 = overrides.ts · 원본 새 판(Sync fork)을 받아도 겹침 0
// 빌드 = 이 폴더에서 `npm ci --ignore-scripts` → openbot/app/node_modules 를 이 폴더 node_modules 로 잇기(원본 파일이 의존 꾸러미를 찾는 자리) → `npx vite build` → dist/
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { DROP_ROUTES, nomuteOverrides } from "./overrides";
import { manualChunks } from "./chunks";   // 꾸러미 덩어리 가르기(판 바뀌어도 다시 안 받게 · 번개 11-08)
import { leanHasPlugin } from "./lean-has";   // :has() 무효화가 자손 전부로 번지던 group-has 꼴을 빌드 끝에 가벼운 꼴로(./lean-has.ts)

const here = (p: string) => path.resolve(__dirname, p);

/** 판 번호 = 빌드한 때(같은 커밋을 캐시로 다시 쓰면 같은 번호) · 화면 안 __NM_BUILD__ 와 /garden-app/version.json 이 같은 값 = 새 판 저절로 다시 읽기(main.tsx) */
const BUILD = process.env.NM_BUILD || new Date().toISOString();
/** 커밋 짧은 번호(우상단 판 번호 · 형 11-06 13:07 「그거로 싱크를 맞춰야될거같은데?」) — 빌드 자리가 git 이면 그 HEAD · 아니면 NM_SHA · 둘 다 없으면 빈 칸(시각만 보임) */
const SHA = (() => { if (process.env.NM_SHA) return process.env.NM_SHA.slice(0, 7); try { return execSync("git rev-parse --short=7 HEAD", { cwd: __dirname, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; } })();
/** 서비스 워커(sw.js)에도 같은 판 번호를 박음 = 판마다 파일 글자가 바뀌어 열린 화면이 새 서비스 워커를 받고, 그게 맡은 화면을 한 번 새로 읽게 함(sw.js 머리) */
const versionFile = (): Plugin => ({
  name: "nomute-version",
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ build: BUILD, sha: SHA }) });
    this.emitFile({ type: "asset", fileName: "sw.js", source: readFileSync(here("sw.js"), "utf8").replace("__NM_BUILD__", BUILD) });
  },
});

export default defineConfig({
  root: here("."),
  base: "/garden-app/",
  publicDir: here("public"),   // 앱 설명서·서비스 워커·아이콘(우리 것)
  define: { __NM_BUILD__: JSON.stringify(BUILD), __NM_SHA__: JSON.stringify(SHA) },
  plugins: [
    versionFile(),
    nomuteOverrides(here("../.."), here(".")),
    tanstackRouter({
      routesDirectory: here("../src/routes"),
      generatedRouteTree: here("gen/routeTree.gen.ts"),
      routeFileIgnorePattern: DROP_ROUTES,
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    leanHasPlugin(),
  ],
  resolve: {
    alias: [
      { find: /^@openbot\/shared\/(.*)$/, replacement: `${here("../../shared")}/$1` },
      { find: /^@nomute\//, replacement: `${here(".")}/` },   // 원본 글자 고치기(PATCH)가 우리 부품을 부를 때
      { find: /^@\//, replacement: `${here("../src")}/` },
    ],
  },
  // reportCompressedSize: false = 묶음마다 gzip 크기를 재서 찍는 단계를 뺌 — 기록에 찍는 숫자일 뿐인데 그 단계에서 배포 빌드가 메모리 한도(2GB)를 넘겨 죽었다(11-19 02:06 pages-direct 44354916032 「computing gzip size… heap out of memory」 · 앱은 지난 판 그대로 남음)
  build: { outDir: here("dist"), emptyOutDir: true, chunkSizeWarningLimit: 4000, reportCompressedSize: false, rollupOptions: { output: { manualChunks } } },
});

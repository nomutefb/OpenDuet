// 우리 사무실 빌드(edit.nomute.kr/office-app/) — 원본 = 이 저장소 openbot/app·openbot/shared 그대로(손대지 않음)
// 고친 곳은 이 폴더(openbot/app/nomute) 한 곳: 바꿔 끼우기 표·글자 고치기 표 = overrides.ts · 원본 새 판(Sync fork)을 받아도 겹침 0
// 빌드 = 이 폴더에서 `npm ci --ignore-scripts` → openbot/app/node_modules 를 이 폴더 node_modules 로 잇기(원본 파일이 의존 꾸러미를 찾는 자리) → `npx vite build` → dist/
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { DROP_ROUTES, nomuteOverrides } from "./overrides";

const here = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
  root: here("."),
  base: "/office-app/",
  publicDir: here("public"),   // 앱 설명서·서비스 워커·아이콘(우리 것)
  plugins: [
    nomuteOverrides(here("../.."), here(".")),
    tanstackRouter({
      routesDirectory: here("../src/routes"),
      generatedRouteTree: here("gen/routeTree.gen.ts"),
      routeFileIgnorePattern: DROP_ROUTES,
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      { find: /^@openbot\/shared\/(.*)$/, replacement: `${here("../../shared")}/$1` },
      { find: /^@nomute\//, replacement: `${here(".")}/` },   // 원본 글자 고치기(PATCH)가 우리 부품을 부를 때
      { find: /^@\//, replacement: `${here("../src")}/` },
    ],
  },
  build: { outDir: here("dist"), emptyOutDir: true, chunkSizeWarningLimit: 4000 },
});

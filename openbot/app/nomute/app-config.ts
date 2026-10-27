// 원본은 빌드 전에 scripts/generate-app-config.ts 가 만드는 파일(lib/generated/application-config.ts) — 우리 판은 손으로 한 장
export type AppConfig = { brand: { tenantId: string; productName: string } };
export const appConfig: AppConfig = { brand: { tenantId: "winter", productName: "우리 사무실" } };

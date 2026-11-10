// 서랍 「큐영상」 계산 줄(./vd.tsx · 시험 = tests/vd-logic.test.ts) — 원본 viewer/vd.html AXES · fire · poll 값 그대로
export const VD_MAX = 12;   // 한 잡 상한 = api/vd.js MAX_FILES
export type VdOpts = { format: string; res: string; fps: string; quality: string; pack: string };
export const VD_AXES: { k: keyof VdOpts; nm: string; d: string; vals: [string, string][] }[] = [   // 전부 hyperframes render CLI 로 실제 가는 값만(원본 주석)
  { k: "format", nm: "내보내기 형식", d: "mp4", vals: [["mp4", "MP4"], ["gif", "GIF"], ["mov", "투명 MOV"], ["webm", "WebM"]] },
  { k: "res", nm: "해상도", d: "portrait", vals: [["portrait", "1080×1920"], ["portrait-4k", "4K 세로"]] },
  { k: "fps", nm: "프레임", d: "30", vals: [["24", "24"], ["30", "30"], ["60", "60"]] },
  { k: "quality", nm: "화질", d: "standard", vals: [["draft", "초안"], ["standard", "표준"], ["high", "고화질"]] },
  { k: "pack", nm: "숏폼 팩", d: "off", vals: [["off", "안 함"], ["on", "동봉"]] },
];
export const VD_DEF = Object.fromEntries(VD_AXES.map((a) => [a.k, a.d])) as VdOpts;
export const vdBlocked = (o: VdOpts, k: string, v: string) => k === "res" && v === "portrait-4k" && o.format !== "mp4";   // 4K = MP4 에서만(CLI 가 알파 경로와 같이 못 씀 · 원본 실측 260802)
export function vdSet(o: VdOpts, k: keyof VdOpts, v: string): VdOpts {
  const n = { ...o, [k]: v };
  if (n.format !== "mp4" && n.res === "portrait-4k") n.res = "portrait";
  return n;
}
export const artKey = (file: string) => String(file).replace(/\.md$/, "");
export type VdJob = { id: string; out: string; n: number; status: "run" | "done" | "err"; files?: string[]; t0?: number };
export function vdDone(j: VdJob, d: { error?: string; files?: string[] }): VdJob {   // 원본 poll — error 면 실패 · 아니면 files(영상 + .md 팩)
  if (d.error) return { ...j, status: "err" };
  const files = d.files || [];
  return { ...j, status: "done", files, n: files.filter((u) => !/\.md$/i.test(u)).length };
}
export const vdVids = (files: string[] = []) => files.filter((u) => !/\.md$/i.test(u));
export const vdPacks = (files: string[] = []) => files.filter((u) => /\.md$/i.test(u));

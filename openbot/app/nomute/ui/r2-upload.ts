// 큰 파일 R2 올리기 공용(원본 viewer/upload.js 그대로 · 깃 11-10 vedit 에서 뺌 · 뎅 부탁 = conv 도 같은 길)
//   GET /api/upload(쓸 수 있나) → POST {action:create, name, size} → PUT ?key&uploadId&n(32MB 조각 · 하나씩 · 조각마다 한 번 더 · XHR 진행) → POST {action:complete} · 실패 = {action:abort}
//   돌려줌 = r2key(up_src/… · 그 key 를 api/edit · api/framethumb · api/conv 가 r2key 로 받음 · 쓰지 않은 key 는 서버가 24시간 뒤 지움)
import { PART, partsOf } from "./vedit-logic";
const post = async (u: string, body: unknown) => { const r = await fetch(u, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const d = await r.json().catch(() => ({})); return { r, d }; };
function putPart(url: string, blob: Blob, onProg: (n: number) => void): Promise<{ etag?: string }> {   // 원본 upload.js 43-57(XHR = 조각 진행이 보임 · 180초)
  return new Promise((ok, bad) => {
    const x = new XMLHttpRequest();
    x.open("PUT", url); x.timeout = 180e3; x.withCredentials = true;
    x.upload.onprogress = (e) => { if (e.lengthComputable) onProg(e.loaded); };
    x.onload = () => { try { if (x.status >= 200 && x.status < 300) ok(JSON.parse(x.responseText)); else bad(new Error("조각 HTTP " + x.status)); } catch (e) { bad(e); } };
    x.onerror = () => bad(new Error("조각 올리기 끊김")); x.ontimeout = () => bad(new Error("조각 올리기 시간 넘김"));
    x.send(blob);
  });
}

export async function r2Upload(f: File, onPct: (p: number) => void): Promise<string> {
  const chk = await fetch("/api/upload", { credentials: "same-origin", cache: "no-store" }).then((r) => r.json()).catch(() => null);
  if (!chk?.ok) throw new Error("올리기 길이 지금 닫혀 있어 — 영상 주소로 넣어 줘");
  const c = await post("/api/upload", { action: "create", name: f.name, size: f.size });
  if (!c.r.ok || !c.d?.key || !c.d?.uploadId) throw new Error(String(c.d?.error || "올리기 시작 실패 · HTTP " + c.r.status));
  const { key, uploadId } = c.d as { key: string; uploadId: string }, part = +c.d.part || PART, n = partsOf(f.size), parts: { n: number; etag: string }[] = [];
  try {
    for (let i = 1; i <= n; i++) {
      const blob = f.slice((i - 1) * part, Math.min(f.size, i * part)), u = "/api/upload?key=" + encodeURIComponent(key) + "&uploadId=" + encodeURIComponent(uploadId) + "&n=" + i;
      let res: { etag?: string } | null = null;
      for (let k = 0; k < 2 && !res; k++) { try { res = await putPart(u, blob, (b) => onPct(Math.round(((i - 1) * part + b) / f.size * 100))); } catch (e) { if (k) throw e; } }   // 조각마다 한 번 더
      if (!res?.etag) throw new Error(i + "번 조각 답에 etag 없음");
      parts.push({ n: i, etag: res.etag });
    }
    const d = await post("/api/upload", { action: "complete", key, uploadId, parts });
    if (!d.r.ok || !d.d?.ok) throw new Error(String(d.d?.error || "올리기 마무리 실패"));
    onPct(100);
    return key;
  } catch (e) { void post("/api/upload", { action: "abort", key, uploadId }).catch(() => {}); throw e; }
}


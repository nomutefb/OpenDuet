// 컴퓨터 · 조치 필요 카드의 화면 주소(순수 · 시험 tests/pc-url.test.ts) — 서버 _pcreq.js tailnetUrl 과 같은 규칙을 화면에서도 한 번 더 봄
//   = 테일넷 안 주소만 단추가 됨: https://<몸>.<테일넷>.ts.net/… 또는 http(s)://100.64.0.0/10:<포트>/…
export function tailnetUrl(u: unknown): string {
  let x: URL;
  try { x = new URL(String(u || "")); } catch { return ""; }
  if (x.username || x.password) return "";
  const h = x.hostname.toLowerCase();
  if (x.protocol === "https:" && /^[a-z0-9-]+\.[a-z0-9-]+\.ts\.net$/.test(h)) return x.href;
  const m = /^100\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (m && +m[1] >= 64 && +m[1] <= 127 && +m[2] <= 255 && +m[3] <= 255 && (x.protocol === "http:" || x.protocol === "https:")) return x.href;
  return "";
}

// 컴퓨터 · 조치 필요 글 → {task, url}(서버 _pcreq.js pcOf 와 같은 꼴 · 대화창 카드 · 뜸 11-08) — 화면 주소가 테일넷 밖이면 null(글 그대로 보임)
//   글 꼴 = beings/tools/컴퓨터-요청.py: 「[결정] 🖥 컴퓨터 · 조치 필요 — <할 일>」 · 「① 완료 ② 건너뛰기」 · 「화면: <주소>」
const PC_HEAD_RE = /^\s*(?:\[결정\]\s*)?(?:🖥\s*)?컴퓨터\s*·\s*조치 필요\s*(?:[—–\-:]\s*)?(.*)$/m;
const PC_URL_LINE = /^[ \t]*화면\s*[:=]\s*(\S+)\s*$/m;
export function pcOfText(text: unknown): { task: string; url: string } | null {
  const s = String(text || ""), h = PC_HEAD_RE.exec(s);
  if (!h) return null;
  const url = tailnetUrl((PC_URL_LINE.exec(s) || [])[1]);
  if (!url) return null;
  return { task: h[1].replace(/\s+/g, " ").trim().slice(0, 200), url };
}

// 앱 안 화면 주소 = 바로 이어지고(autoconnect) · 창에 맞게 줄이고(resize=scale) · 끊기면 다시(reconnect) — 몸 표(beings/화면.json)에 이미 있으면 그대로
export function screenUrl(u: string): string {
  let x: URL;
  try { x = new URL(u); } catch { return u; }
  for (const [k, v] of [["autoconnect", "1"], ["resize", "scale"], ["reconnect", "1"]] as const) if (!x.searchParams.has(k)) x.searchParams.set(k, v);
  return x.href;
}

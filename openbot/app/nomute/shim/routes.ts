// 원본 앱 요청 길 → 우리 /api/office 짝(정본 = claude-state assign/2026-10-28/office-app-contract.md · 보조 02)
// 짝이 없는 길(짝 표 「안 씀」) = 서버에 안 보내고 「없음」 꼴(빈 목록·끈 스위치)로 답함 · 쓰기는 짝 있는 것만
import { HYUNG_ID, type OfficeRoom, idOf, office, people, toAgent, toChannel } from "../data/office";
import { putAttachment } from "./attachments";

type Fetch = typeof fetch;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/** 우리에게 없는 기능 = 끔(원본이 이 스위치로 메뉴·단추를 숨김) */
const CAPS = { useBots: true, teamBots: false, cloudBrowser: false, cloudComputer: false, localComputer: false, passwordManager: false, slackTeams: false };

async function seenMap(): Promise<Record<string, number>> {
  try {
    const j = await office<{ seen?: Record<string, { ts?: number }> }>("seen");
    return Object.fromEntries(Object.entries(j.seen || {}).map(([k, v]) => [k, Number(v?.ts) || 0]));
  } catch { return {}; }
}

async function channels() {
  const [list, j, seen] = await Promise.all([people(), office<{ rooms: OfficeRoom[] }>("rooms"), seenMap()]);
  return (j.rooms || []).map((r) => toChannel(r, list, seen[r.id]));
}

/** 메뉴 방 목록(원본 DuetChannel 꼴) — 우리 메뉴(ui/menu.tsx)로 바꿔 끼웠지만 1:1 화면(channel-screen)이 같은 목록을 읽음
 *  everythingId = 없음: 원본은 그 방을 첫 화면("/")으로 돌리는데 첫 화면은 이제 대화 목록 → 회의실도 단체방 화면(/group/all)에서 엶 */
async function duetChannels() {
  const [list, j] = await Promise.all([people(), office<{ rooms: OfficeRoom[] }>("rooms")]);
  return {
    everythingId: null,
    channels: (j.rooms || []).filter((r) => r.id !== "all").map((r, i) => ({
      ...toChannel(r, list), purpose: null, icon: r.with ? "people" : "folder", colour: "sky", dressed: true, archivedAt: null, createdAt: new Date(i).toISOString(),
    })),
  };
}

export async function route(url: URL, init: RequestInit, _real: Fetch): Promise<Response> {
  const p = url.pathname, m = (init.method || "GET").toUpperCase();
  const seg = p.replace(/^\/api\//, "").split("/").map(decodeURIComponent);
  try {
    if (m === "GET") {
      if (p === "/api/me") {   // 짝 표: GET /api/office/me → {me: {who, name, kind, seat, face, can_write}}
        const j = await office<{ me: { who: string; name?: string; face?: string; kind: string } }>("me");
        return json({ user: { id: j.me.kind === "human" ? HYUNG_ID : j.me.who, email: "", name: j.me.name || j.me.who, image: j.me.face || (j.me.kind === "human" ? "/office/hyung.webp" : null), role: "admin", onboarding: null } });   // 얼굴 칸이 비면 형 그림
      }
      // localEvaluation = 앱 안 「나가기」 단추 숨김(로그인·로그아웃 = Cloudflare Access) · 음성·받아쓰기·생성 화면 = 없음
      if (p === "/api/capabilities") return json({ authProviders: [], ssoConfigured: false, ssoRequired: false, localEvaluation: true, generativeUi: false, selfHostBanner: false, transcription: false, voice: false });
      if (p === "/api/admin/enterprise/me") return json({ capabilities: CAPS, enforced: true });
      if (p === "/api/agents/capabilities") return json({ capabilities: { builtInAvailable: false } });
      if (p === "/api/agents") {
        const list = await people();
        return json({ agents: list.filter((x) => x.kind === "bot" || x.kind === "winter").map((x) => toAgent(x, list)) });
      }
      if (seg[0] === "agents" && seg.length === 2) {
        const list = await people();
        const x = list.find((y) => idOf(y.who, list) === seg[1]);
        return x ? json({ agent: toAgent(x, list) }) : json({ error: "그 봇은 명부에 없어" }, 404);
      }
      if (p === "/api/channels") return json({ channels: await channels(), nextCursor: null });
      if (seg[0] === "channels" && seg.length === 2) {
        const c = (await channels()).find((x) => x.id === seg[1]);
        return c ? json({ channel: c }) : json({ error: "그 방은 없어" }, 404);
      }
      if (p === "/api/openduet/channels") return json(await duetChannels());
      if (seg[0] === "groups" && seg.length === 2) {   // 단체방 머리(사람 단추)가 읽는 명단 · 대화록은 우리 대화창이 /api/office 로 바로 읽음
        const [list, j] = await Promise.all([people(), office<{ rooms: OfficeRoom[] }>("rooms")]);
        const r = (j.rooms || []).find((x) => x.id === seg[1]);
        if (!r) return json({ error: "그 방은 없어" }, 404);
        const bots = toChannel(r, list).agentIds.map((id) => { const x = list.find((y) => idOf(y.who, list) === id); return { id, name: x?.name || x?.who || id }; });
        return json({ bots, people: [{ userId: HYUNG_ID, email: "", name: "형", creator: true }], messages: [] });
      }
      // 결정 필요 = 할 일 맨 위 우리 결정 카드(ui/today.tsx · brief decide · 답 = brief/answer)가 정본 → 원본 승인 목록은 비움(두 곳 0)
      if (p === "/api/approvals") return json({ enabled: true, requests: [], rules: [], teamRules: [], questions: [] });
      if (p === "/api/openduet/tasks") return json({ tasks: [] });   // 수리 접수 = 할 일 맨 위 카드(ui/today.tsx)
      if (p === "/api/bots/attention") return json({ bots: [] });
      if (seg[0] === "bots" && seg[2] === "activity") return json({ activity: { inProgress: [], scheduled: [], completed: [] } });
      if (seg[0] === "bots" && seg[2] === "lifecycle") return json({ lifecycle: { agentId: seg[1], paused: false, pausedAt: null, notify: "all" } });
      if (p === "/api/settings/preferences") return json({ preferences: { selfHostBannerDismissed: true } });
      if (p === "/api/sandboxed/published") return json({ components: [] });
      if (p === "/api/copilotkit/info") return json({ version: "nomute", agents: {} });
    }
    if (m === "POST" && seg[0] === "channels" && seg[2] === "attachments") {   // 입력칸 첨부 = 보낼 때까지 화면이 들고 있음(보낼 때 POST /api/office/files)
      const f = (init.body as FormData | undefined)?.get?.("file");
      if (!(f instanceof File)) return json({ error: "파일이 없어" }, 400);
      return json(await putAttachment(f));
    }
    if (seg[0] === "channels" && seg[2] === "activity") return json({ ok: true });   // 본 데까지 = 대화창이 POST /api/office/seen 으로 보냄
    if (m === "PUT" && p === "/api/components/catalogue") return json({ ok: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 502);
  }
  console.warn("[shim] 짝 없음", m, p + url.search);
  return json({ error: "이 화면엔 이 자료가 없어", path: p }, 404);
}

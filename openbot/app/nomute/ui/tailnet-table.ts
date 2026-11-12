// 테일스케일 연결표(형 11-12 「테일 스케일 연결표도 러너에 붙여서 구체화해. 기존에 잇는걸 인덱싱을 또 넣을필요는없어.」 · 「제일 베스트의 세상에서 제일 베스트인 답을 찾아내」 · 「묻지말고」)
//   정본 = claude-state 공통/정본/하드웨어.md 「기기 이름 · 테일스케일 ssh 접속 경로」(11-12 · 빠르 옮김) — 이름은 형이 바꾸는 중이라 IP 가 열쇠
//   RUNNER 게이지에 이미 있는 몸(WIN · MAC · Lx A · Lx B) = 줄 더하지 않고 이름 위 손 올림(title)으로만 · 게이지에 없는 것(회사 PC · 그록 상자)만 한 줄(ui/runner-gauges.tsx)
export type TailDev = { name: string; short: string; ip: string; ssh?: string; what: string; off?: boolean };
/** 게이지 칸 글자(NAME_OF) → 그 본체와 안에 도는 VM */
export const TAIL_OF_GAUGE: Record<string, TailDev[]> = {
  WIN: [
    { name: "win-a", short: "WIN", ip: "100.94.20.122", ssh: "hwang", what: "윈A 본체" },
    { name: "fast2", short: "빠르", ip: "100.84.18.19", ssh: "fast", what: "윈A VM · 빠르" },
    { name: "light2", short: "번개", ip: "100.83.46.3", ssh: "light", what: "윈A VM · 번개" },
    { name: "gik", short: "깃", ip: "100.69.98.88", ssh: "gik", what: "윈A VM · 깃" },
  ],
  MAC: [
    { name: "mac", short: "MAC", ip: "100.67.194.114", ssh: "hwang", what: "맥 · 봄" },
    { name: "eyes", short: "뜸", ip: "100.104.110.86", ssh: "eyes", what: "맥 VM · 뜸" },
  ],
  "Lx A": [{ name: "lxa", short: "Lx A", ip: "100.78.128.50", ssh: "sia", what: "레노버 · 시아" }],
  "Lx B": [{ name: "deng", short: "Lx B", ip: "100.104.248.46", ssh: "deng", what: "씽크센터 · 뎅" }],
};
/** 게이지에 없는 기기만 — 회사 PC(표로만 우리 화면 문 · 11-12 문지기) · 그록 상자 */
export const TAIL_EXTRA: { group: string; devs: TailDev[] }[] = [
  { group: "회사", devs: [
    { name: "yeul-6f-main-hwang-none", short: "6F 메인", ip: "100.103.55.120", ssh: "nomute", what: "형 사무실 PC(옛 윈B)" },
    { name: "yeul-6f-ticket-yeul-none", short: "6F 중계", ip: "100.99.112.10", ssh: "Yeul", what: "중계" },
    { name: "yeul-4f-did01-admin-none", short: "4F DID", ip: "100.70.75.67", ssh: "admin", what: "4층 전광판" },
    { name: "yeul-6f-teamdid-yeulmaru-none", short: "6F 팀 DID", ip: "100.78.227.3", ssh: "yeulmaru", what: "6층 팀 DID" },
    { name: "yeul-jangdo-did01-none", short: "장도 DID", ip: "", what: "장도 DID", off: true },
  ] },
  { group: "그록", devs: [
    { name: "grokbot-box", short: "그록 상자", ip: "100.93.212.35", what: "그록봇 상자" },
    { name: "bungae-box-lightning", short: "번개 상자", ip: "100.105.202.34", what: "그록 번개 상자" },
  ] },
];
// 켜짐 = 윈A 몸 보고(5분마다 tailscale status --json)가 서버 schedule 답 runners.tailnet[] 에 실음(번개 11-12 17:00 · {host, ip, online, last_seen, dns, os} · 20분 넘게 묵으면 online null = 모름) · IP 로 맞춤
export type TailLive = { ip?: string; online?: boolean | null }[] | undefined;
export const onOf = (d: TailDev, live: TailLive) => { const t = d.ip ? (live || []).find((x) => x.ip === d.ip) : undefined; return t ? t.online ?? null : null; };
export const tailTitle = (d: TailDev, live?: TailLive) => { const on = onOf(d, live); return [on === true ? "● 켜짐" : on === false ? "○ 꺼짐" : "", d.name, d.ip || "IP 없음(꺼짐)", d.ssh ? `ssh ${d.ssh}@${d.ip}` : "", d.what].filter(Boolean).join(" · "); };

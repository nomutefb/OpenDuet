// @ts-nocheck
// 채널 전체 그림 둘(잘 되는 조건 · 시간대별 반응)의 그리는 몸 — 에디터 viewer-src 원본을 줄 그대로 옮김(빠르 11-01 18:04 · 형 「다른 애들 작업하고있는데 그거 좀 도와줘」)
//   원본 = 39-chLiftChart.part 2~227(chLiftChart) · 228~271(condCards·condDraw) · 38-openTref.part 514(chPath) · 724~736(SIG_ORD·SIG_CAP·SIG_GEN·CORE_TH) · 26-ovlGradient.part 306(esc)
//   바꾼 곳 = 전역 CHAN_SRC → 넷째 인자 · SIG_HIT[ax] → 돌려주는 hits · SIG_ARG(폰 재그림 재료) 뺌 · 반환 = {html, hits, w}(빈 축 = null) · COND_CARDS 전역 뺌 · 나머지 글자는 원본 그대로
//   다시 맞출 땐 원본 줄을 통째로 다시 떼어 같은 자리만 바꾼다(손으로 고친 줄 0)
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));   // String() = 비문자열(숫자·객체) 입력도 안전(api/candidates 직독 등 빌드 우회 대비) · ' 포함 = 홑따옴표 속성 컨텍스트 잠재 우회 봉합(평의회 260713 ⑥)
function chPath(pts, curve) {   // 직선 M/L · 곡선 = Catmull-Rom→베지어(시안 검증 로직 이식)
  if (!curve || pts.length < 3) return pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
  let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
    d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)
       + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)
       + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }
  return d;
}
export const SIG_ORD = { hour_band: ['새벽0-6', '오전6-11', '점심11-14', '오후14-18', '저녁18-22', '밤22-24'], dow: ['월', '화', '수', '목', '금', '토', '일'] };   // 자연순 정본 = insta_signals.py HOUR_BANDS·DOW 미러(그쪽 라벨 개편 시 동조)
const SIG_CAP = { hour_band: '시간대별 공유 수', dow: '요일별 공유 수' };   // 구 '시간대별/요일별 호응' → 공유 수(운영자 260723 리네임 · 요일별 = 형제 동조[4] · 섹션 대제목 '시간대별 반응'은 유지 = 운영자 "타이틀은 유지")
const SIG_CAP_FB = { hour_band: '시간대별 반응 강도', dow: '요일별 반응 강도' };   // FB 소스분기(운영자 260724 "인스타처럼 채워") — FB는 게시물별 조회(views)·공유율 per-mille 부재 → eng(반응+댓글+공유) 기반 상대 lift라 '공유 수' 오표기 방지(fb_fetch _sig_axis 산출과 짝)
// 일반 인스타 이용자 평균 이용 강도(운영자 260723 요청 오버레이 "일반적인 사용자들 기준으로 그 차트 위에 오버레이 · 어찌보면 이 평균이 더 중요") —
// 구독자 축(공유·저장 lift·접속 피크 = 내 팔로워 접속) 위에 '전체 IG 이용자' 평균 이용 시간대·요일을 레퍼런스 실루엣으로 병치 ·
// 상대 강도(피크=100 · online_hours_kst 저장문법 계승) · 자체 정규화 축(lift Y와 별개 = 볼륨 언더레이 문법 계승 · 창작 0 = 공개 벤치마크 상대형상, 측정치 아님 = 라벨 '앱 사용자'[구 '일반 평균' · 운영자 260723 리네임]로 명시) · ⚠260803 격하: 시간대 축은 실측(GEN_MEAS = vdoc online_curve_kst · 팔로워 접속)이 있으면 그쪽 우선 — 이 상수는 실측 부재 폴백 전용(요일 축도 260804 실측 승격 배선 — online_dow_kst 동봉 시 자동 전환·그전 폴백) ·
// 출처 = 시간대: 국내 이용시간(오픈애즈/소셜비즈 2025 3Q — 6~10시 상승·저녁 20~22시 큰 폭 피크·22~24시 여가·새벽 최저) · 요일: 이용시간 축 종합(와이즈앱/오픈애즈 국내 SNS 현황·App Ape HAU·글로벌 스크린타임 2025~26 — 주말 = 하루 종일 확산·소폭↑·토 부근 최고·일 낮 지속 후 저녁 하락)
// ※ 요일 260724 교체(운영자 "주말이 이용 훨 높은데 저 차트 맞아?" 검증 판정): 구 값(수·목 100/97·토 64·일 60)은 Buffer 9.6M·Sprout·Hootsuite·Later '게시물 반응률' 벤치마크 = 라벨(이용 강도)·시간대 축(이용시간)과 다른 지표 혼입 → 이용시간 축으로 통일(반응 축은 터콰이즈 채널 lift가 이미 담당 = 역할 분리)
const SIG_GEN = {
  hour_band: { '새벽0-6': 22, '오전6-11': 60, '점심11-14': 74, '오후14-18': 82, '저녁18-22': 100, '밤22-24': 78 },
  dow: { '월': 84, '화': 86, '수': 88, '목': 90, '금': 94, '토': 100, '일': 96 }
};
const CORE_TH = .85;   // 핵심 구간 폭 임계 = 도달 기대값 피크 대비 비율(운영자 260801 플레이그라운드 선택 ★ · 90% = 시간대 15:00~20:38 좁음 / 78% = 12:56~21:23 넓음 / 85% = 14:08~20:57) — '어디를' 고르는 건 데이터, 이 상수는 '얼마나 넓게'만 정한다

export function chLiftChart(buckets, ax, x2, CHAN_SRC) {   // x2 = 오버레이 재료(운영자 260719 "ㄱ 고도화 뭐든") — {peaks: 접속 피크 시각[], now: KST 시각, today: KST 요일} · 전부 선택(없으면 조용히 생략 = fail-soft)
  x2 = x2 || {};
  const ord = SIG_ORD[ax] || [];
  const bs = (buckets || []).slice().sort((a, b) => { const ia = ord.indexOf(a.bucket), ib = ord.indexOf(b.bucket); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
  if (bs.length < 2) return null;
  const val = (b, k) => (b.lift || {})[k] ?? null;
  const vals = [], valsAll = [];
  bs.forEach(b => { const s2 = val(b, 'share_pm'); if (s2 != null) { valsAll.push(s2); if (!b.low_sample) vals.push(s2); } });   // Y범위 = 공유 단독(운영자 260723 "저장 삭제·공유로 통일") — 저장 축 제거로 공유 곡선이 세로폭 최대 활용
  if (valsAll.length < 2) return null;
  if (vals.length < 2) vals.splice(0, vals.length, ...valsAll);   // ⚠ 표본부족 칸(low_sample · n<5)은 자를 안 잡는다(운영자 261025 「이상한 점은 판단」 — 90일 창 실측 = 밤22-24 n=4 ×3.08 한 칸이 자를 3배로 늘려 나머지 곡선을 납작하게 눌렀다) · 믿을 칸 둘 미만 = 종전(전부로)
  const W = x2.w || 600, H = 154, mL = 46, mR = 16, mT = 16, mB = 26, pw = W - mL - mR, ph = H - mT - mB;   // W = x2.w(폰 = 실폭 재렌더 · 좌표 1 = CSS 1px라 라벨 8~9·충돌 임계 70/10이 설계 그대로 실제 px — 운영자 261024 폰 4~5px 판독불가 수리 · 새 값 0) · 없으면 600 고정(PC 불변) · mB·H = 일일 추이(chChart) 단일줄 라벨 규격 계승 — n= 병기 줄 제거(운영자 260722)로 2줄 예약 해제 · 플롯 높이 ph=112 불변
  const cH = [];   // 버킷 중심 좌표(h 단위) — hour: "새벽0-6" 범위 파싱 중심시각 · dow: 요일 인덱스×24+12(주간 168h 타임라인 · 운영자 260724 "요일별 0-8/8-16/16-24 3개씩") · 실패 밴드 있으면 선형축·시각 오버레이 전체 스킵 = fail-soft·창작 0
  if (ax === 'hour_band') bs.forEach(b => { const m = /(\d+)\s*-\s*(\d+)/.exec(b.bucket); cH.push(m ? (+m[1] + +m[2]) / 2 : null); });
  if (ax === 'dow') bs.forEach(b => { const di = ord.indexOf(b.bucket); cH.push(di < 0 ? null : di * 24 + 12); });
  const SPAN = ax === 'dow' ? 168 : 24;   // 선형축 전장 = 하루 24h / 한 주 168h
  const hlin = cH.length === bs.length && cH.length > 1 && !cH.some(c => c == null);   // 선형 시간축(운영자 260723 "24분할 해서 숫자만" · 260724 요일 3분할 동조) — X = 실제 시각 비례 배치 = 눈금·핵심 구간 경계 세로변·지금/오늘 마커가 같은 자 위에 정렬
  const X = i => hlin ? mL + pw * cH[i] / SPAN : mL + pw * i / (bs.length - 1);   // Y·lo·hi = 아래 GEN_EFF 뒤로 이관(260809 6차 = 노란선이 같은 자를 쓰므로 Y범위 산출에 참여한다)
  // 실측 우선 게이트(운영자 260803 "내 팔로워 접속 실측이 있어? 그러면 그걸 붙이면 매우 좋을듯 · 그에 따라서 보라색 강조점도 맞춰") — x2.curve = online_curve_kst(내 팔로워 online_followers API 실측 · KST 24슬롯 · 피크=100 · insta_signals 산출). 시간대 축 한정: 24슬롯을 밴드 평균으로 내려 SIG_GEN(공개 벤치 실루엣) '값만' 대체 → 노란선·툴팁·핵심구간·접속피크가 한 실측 원천(시각 문법 전부 불변 = 260801 "표현방법은 기존과 동일" 동축). 6밴드 전원 산출일 때만 채택(부분 결측 = 벤치 폴백) · dow = 260804 실측 승격 배선(x2.curve = online_dow_kst 요일 7키 — 원장 7요일×24시 커버부터 산출기가 동봉 = 자동 전환 · 그전 = 종전 벤치) · FB = 종전 null 경로 · 곡선 부재 = 종전 100% 불변(fail-soft·창작 0)
  // ⚠ 260809 3차(운영자 "팔로워 접속이 아니구 · 팔로워 접속은 강조색1번이잖아 · 앱 사용자 접속인데") — 260803·260804 실측 승격 **철회**.
  //   이 노란선의 역할은 원래 「내 채널(터콰이즈 = 강조색1 = 팔로워) 위에 겹치는 **바깥 레퍼런스**」(운영자 260723 "일반적인 사용자들 기준으로 그 차트 위에 오버레이 · 어찌보면 이 평균이 더 중요")인데,
  //   그 자리를 내 팔로워 접속 실측(online_followers)이 덮으면서 두 선이 **둘 다 내 계정 축**이 됐다 = 비교 대상이 사라진다(라벨도 「팔로워」/「팔로워 접속」으로 이름이 겹쳤다).
  //   게다가 실측 = 요일 편차 2.7%p · 시간대 후반 고원 = 신호가 거의 없다(팔로워 풀 65,501에 피크대 47% 포화 = 구조적) → 레퍼런스로도 못 쓴다.
  //   벤치(SIG_GEN)는 **국내 기준**이고 편차 = 시간대 78%p · 요일 16%p로 실제로 크다(운영자 "전세계로 지정되어서 그런게 아닌지" 검증 결과 = 아니다).
  //   → 노란선 = 항상 SIG_GEN(앱 사용자 접속). 팔로워 접속 실측은 폐기하지 않고 **접속 피크 밴드**(아래 bandLabs = 내가 올릴 시각 결정)로 계속 산다 = 역할 분리.
  const GEN_MEAS = null;   // 승격 철회 = 항상 벤치 경로(아래 전 소비처가 이 값으로 분기 · 실측 재승격 시 여기만 되살린다)
  const GEN_EFF = CHAN_SRC === 'fb' ? null : (GEN_MEAS || SIG_GEN[ax] || null);   // 단일 유효 소스(아래 전 소비처 공용 — 실측 우선·벤치 폴백·FB null)
  // ⚠ 자 통일(운영자 260809 6차 "그렇게 아이디어 2) 보완해주고") — 두 곡선이 **서로 다른 자**를 쓰던 걸 하나로 합친다.
  //   구판 = 터콰이즈는 데이터 산포(lo~hi) 자동 스케일 / 노랑은 0~100을 ph×.82에 **고정 매핑** → 두 선의 상하 관계에 물리적
  //   의미가 없었다(260801 주석이 이미 인정한 사실 · 그래서 핵심 구간은 픽셀 교차를 버리고 곱셈[도달 기대값]으로 옮겼다).
  //   그런데 260809 4차 「보완 필요」는 다시 그 픽셀 관계를 쓴다 = 눈에 보이는 그림과는 맞지만 자가 둘인 채였다.
  //   → 노랑을 **자기 평균으로 나눠 ×배율**로 환산(시간대 22·60·74·82·100·78[평균 69.3] → ×0.32·0.87·1.07·1.18·1.44·1.13)하면
  //   공유 lift와 **같은 단위**가 되어 같은 Y축에서 읽힌다("저녁엔 사람이 ×1.44 몰리는데 내 공유는 ×1.05" = 숫자로 확정).
  //   새 상수·새 데이터 0 = 이미 그리는 값을 자기 평균으로 나누기 한 번. ⚠ 핵심 구간(sc = 공유 × gen/100)은 **완전 불변** —
  //   전 버킷에 같은 상수가 곱해지므로 피크·임계 T·교차 보간이 모두 같은 배수로 스케일돼 산술적으로 약분된다(gpts[2] = 원 0~100 유지).
  //   ⚠ 비용 = Y범위가 노랑 진폭까지 담아 넓어지므로 **터콰이즈 곡선이 그만큼 납작해진다**(시간대 실측 = 플롯 높이 점유 100%→38%).
  //   요일 축은 노랑 ×0.93~1.11이 공유 산포(0.75~1.20) 안쪽이라 범위·모양 **변화 0**.
  const genR = {};   // 버킷 → ×배율(gen ÷ 그 축 gen 평균)
  if (GEN_EFF) {
    const _gv = Object.values(GEN_EFF).filter(v => typeof v === 'number');
    const _gm = _gv.length ? _gv.reduce((a, c) => a + c, 0) / _gv.length : 0;
    if (_gm > 0) Object.keys(GEN_EFF).forEach(k => { if (typeof GEN_EFF[k] === 'number') genR[k] = GEN_EFF[k] / _gm; });
  }
  bs.forEach(b => { const r = genR[b.bucket]; if (r != null) vals.push(r); });   // Y범위 참여 = 같은 자 계약(구판은 공유 단독 · 노랑이 고정 매핑이라 범위 밖이었다)
  const lo = Math.max(0, Math.min(...vals, 1) - .1), hi = Math.max(...vals, 1) + .1;
  const Y = v => mT + ph * (1 - (v - lo) / (hi - lo));
  const Yc = v => Math.max(mT, Math.min(mT + ph, Y(v)));   // 자 밖 표본부족 칸 = 플롯 끝에 붙여 그린다(속빈 점 · 실제 값·n·「표본부족」 = 툴팁) · 자 안 값 = Y 그대로(전 기간 = 변화 0)
  const HIT = bs.map((b, i) => { const sv = val(b, 'share_pm'); return { x: X(i), y: sv != null ? Yc(sv) : Y(1), bucket: b.bucket, share: sv, n: b.n, low: !!b.low_sample, gm: GEN_MEAS ? 1 : 0, gen: genR[b.bucket] != null ? Math.round(genR[b.bucket] * 100) / 100 : null }; });   // gen = ×배율(구 0~100 % 표기 → 공유와 같은 자 · 툴팁 문법 동조)   // FB 소스분기(평의회 260724 must-fix) — GEN_EFF가 FB=null → 툴팁 % 자동 생략(곡선·범례 제거와 단일 정합) · gm = 실측 채택 플래그(툴팁 라벨 분기)
  let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`;
  for (let g = 0; g <= 3; g++) {   // hairline 격자 + ×배율 Y라벨(chChart 문법)
    const v = lo + (hi - lo) * g / 3, y = Y(v);
    s += `<line x1="${mL}" y1="${y.toFixed(1)}" x2="${W - mR}" y2="${y.toFixed(1)}" stroke="var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
    s += `<text x="${mL - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--mut)">×${v.toFixed(2)}</text>`;
  }
  s += `<line x1="${mL}" y1="${mT}" x2="${mL}" y2="${(H - mB).toFixed(1)}" stroke="var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>`;   // Y축 스파인(일일 추이 세로줄 계승)
  const hourX = hh => hlin && ax === 'hour_band' ? mL + pw * Math.max(0, Math.min(24, hh)) / 24 : null;   // 시각(0~24h) → x = 선형 시간축 그대로(hour 전용 — 접속 피크·지금 마커 · 파싱 실패 = null = 시각 오버레이 생략 fail-soft)
  // 표본 볼륨 언더레이(무채 저알파 바) — 게시 몰림 편향(스크래퍼 flags)을 숨기지 않고 시각화 · n 라벨과 동축(운영자 260719 고도화)
  const maxN = Math.max(...bs.map(b => b.n || 0), 1), bw = Math.min(26, pw / bs.length * .42);
  bs.forEach((b, i) => { const bh = (b.n || 0) / maxN * ph * .26; if (bh > 0) s += `<rect x="${(X(i) - bw / 2).toFixed(1)}" y="${(H - mB - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="1" fill="var(--mut)" opacity=".13"/>`; });
  // 일반 인스타 이용자 평균선(운영자 260723 요청 → 260723 교정: 노랑 실선·저장 삭제 후 공유와 2선 비교) — 전체 IG 이용자 평균 이용 강도(SIG_GEN · 자체 정규화 피크=100 → 플롯 .82 높이 · 상단 콜아웃 선반 여유) · 볼륨 뒤 배경층(공유 곡선은 위 = 채널 실데이터 우선) · 실선 노랑(--accent-4 · 팔레트 정본 · 운영자 "노란색·실선") · 점·area 없음 = 공유(터콰이즈 선+점+area)와 형태 분리 · 결측 버킷 = 조용히 생략(fail-soft·창작 0)
  const shoulder = pts => { if (!hlin) return pts; const a = pts[0], b = pts[pts.length - 1], dl = a[0] - mL, dr = W - mR - b[0], D = dl + dr, yW = D > 0 ? b[1] + (a[1] - b[1]) * dr / D : (a[1] + b[1]) / 2; return [[mL, yW], ...pts, [W - mR, yW]]; };   // 선형 시간축 벽 종점 = 주기(순환) 보간 한 값(운영자 260810 "아이디어 ㄱ") — 구 「첫/끝 밴드 값 수평 연장」은 좌·우 벽이 같은 순간(자정 24=24 · 일24시=월0시)인데 서로 다른 밴드 값을 그려 이음매 절벽(실측 = 시간대 터콰이즈 ×1.00↔×0.68 · 노랑 ×0.32↔×1.12) → 끝 밴드 중심↔(한 바퀴 너머) 첫 밴드 중심을 벽 시각에서 선형 보간 = 곡선이 밴드 사이를 잇는 기존 문법을 자정 이음매에 동일 적용(새 데이터·상수 0 · 보간값은 항상 두 밴드 사이 = Y범위 이탈 0) · 좌·우 벽 동일값 = 순환 폐합 · 곡선·area가 스파인·우변에 붙는 실루엣·교차 산출 원본 좌표 사용 = 불변
  const gen = GEN_EFF;   // 단일 유효 소스(260803 실측 GEN_MEAS 우선 · 벤치 SIG_GEN 폴백 · FB = null 종전 경로 — 위 실측 우선 게이트) → 곡선·핵심구간·범례 자동 제거(gen null = fail-soft 그대로)
  let gpts = null, gl = '';
  if (gen) {
    const _g = bs.map((b, i) => { const gv = gen[b.bucket], gr = genR[b.bucket]; return (gv == null || gr == null) ? null : [X(i), Y(gr), gv]; });   // y = 공유와 **같은 자**(Y · 260809 6차 자 통일) — 구 `(H-mB) − gv/100 × ph×.82` 고정 매핑 폐기 · [2] = 원 0~100 유지(핵심구간 sc 불변)
    if (_g.length >= 2 && _g.every(Boolean)) { gpts = _g; gl = chPath(shoulder(_g).map(p => [p[0], p[1]]), 1); }
  }
  const spts = []; bs.forEach((b, i) => { const v = val(b, 'share_pm'); if (v != null) spts.push([X(i), Yc(v), !!b.low_sample]); });   // 팔로워(공유) 곡선 좌표 = 핵심 구간 산출·시리즈 렌더 공용(단일 산출)
  const sx0 = spts.length && !hlin ? spts[0][0] : mL, sx1 = spts.length && !hlin ? spts[spts.length - 1][0] : W - mR;   // area 폐합 x = 숄더 반영 양끝(비선형축 = 기존 첫/끝 점 그대로)
  const sline = spts.length >= 2 ? chPath(shoulder(spts).map(p => [p[0], p[1]]), 1) : '';
  // 핵심 구간 = 팔로워 파도 아래 세로 커튼(운영자 260723 재개정: 음영 바닥 = X축 정지 — 눈금·요일 라벨 행 침범 금지 · 축 살짝 관통 = 양옆 세로변 선분만 · "인덱싱까지 이어짐"은 선분 +4 관통 + 해당 눈금 보라 틴트가 대체) — 팔로워 area(파도→X축)를 [x0,x1] 컬럼으로 하드 클립 · 세로 그라데이션(위 파도 .34 → 바닥 .06 잔광) · 색 = --cat-tech(팔레트 유일 형광 보라) · 불투명 금지(아래 무채 볼륨 바 비침). ⚠️ 표현 문법(음영·세로변·라벨·눈금 틴트) = 260723 확립본 그대로 — 아래는 *어디를 칠할지 고르는 산출식*만 교체(운영자 260801 "표현방법은 기존과 동일").
  // 코어 산출 = 도달 기대값(운영자 260801 판정 "동그라미 친 18~19시가 제일 핵심 아닌지 · 앱 사용자가 주로 쓰는 시간대로 늘려야 · 좌측 − 우측 +") — score = 공유 lift × 앱 사용자 이용 강도(반응률 × 볼 사람 수) · 피크 중심 연속 런 { score ≥ 피크 × CORE_TH }.
  //   구식(팔로워 곡선이 앱 사용자 곡선 '위'인 런) 폐기 사유 3점(실측 insta 1,005건): ① 단위 불일치 — 팔로워는 lift를 데이터 산포 lo~hi로 자동 스케일 / 앱 사용자는 0~100을 ph×.82로 고정 매핑 = 두 곡선의 픽셀 교차에 물리적 의미 없음(밤22-24 ×0.68 하나가 lo를 끌어내리면 코어가 통째로 이동). ② 상대 우위 판정이라 *앱 사용자가 적은 한산한 시간대*가 유리 — 오전6-11은 공유 ×0.93으로 통과(여유 +0.9px)·저녁18-22는 ×1.01인데 탈락(표본은 저녁이 최다 n=225). ③ 같은 차트의 접속 피크 1위 18시를 코어가 17:54에서 배제 = 두 오버레이가 반대를 지시.
  //   전후(현 데이터 실렌더 실측): 시간대 08:30~17:54 → 14:08~20:57(좌 −5.6h·우 +3.1h · 접속 피크 1·2위 15·18시 포섭 — 구식은 18시를 17:54로 잘랐다 · 3위 21시는 경계 3분 밖 = 저녁 밴드 대표값이 20시라 곱이 21시부터 꺾임 = 데이터 그대로) · 요일 목 → 금22시~일12시(주말 = 260724 "주말이 이용 훨 높은데" 판정과 동방향). 시안·전후 = docs/reports/260801_핵심구간_산출식_플레이그라운드.html
  const coreLabs = [];   // 코어 라벨 앵커(밴드마다 1개 · 복수 밴드 = 운영자 260801 "빨간색 덧칠한 부분도 핵심 구간이야 · 동일하게 표기")
  let coreXRs = [];      // 코어 x범위 목록(눈금 보라 틴트 판정 = 어느 밴드에든 들면 틴트)
  const fixLabs = [];    // 보완 필요 라벨 앵커(운영자 260805 첨부 판정 "이용자 핫한 시간대를 내가 못 따라감 = 보완 필요")
  let fixXRs = [];       // 보완 필요 x범위 목록(범례 칩 노출 판정)
  if (gpts && gpts.length === bs.length && spts.length === bs.length && sline) {
    const sc = spts.map((p, i) => (bs[i].low_sample ? 1 : val(bs[i], 'share_pm')) * (gpts[i][2] / 100));   // 표본부족 칸 = ×1.0(채널 중앙 = 결론 없음)로 셈 — n=4 한 칸이 핵심 구간을 독차지하지 않게(261025)   // 도달 기대값 = 공유 lift × 앱 사용자 지수/100(둘 다 이 차트가 이미 그리는 정본 — 새 데이터·새 상수 0)
    let pk = 0; sc.forEach((v, i) => { if (v > sc[pk]) pk = i; });   // 임계 기준점 = 도달 기대값 최대(구식 '팔로워 y 최소' = lift 최대와 다름 — 볼 사람 수를 곱한 뒤의 최대)
    if (sc[pk] > 0) {
      const T = sc[pk] * CORE_TH, aB = H - mB;   // aB = X축(하단 눈금선) = 음영 바닥(운영자 260723 "음영이 눈금/요일 라벨 영역 넘지 않게" — 구 +11 라벨행 연장 폐지 · 축 관통은 아래 세로변 선분만)
      const runs = [];   // 임계 이상인 *모든* 연속 런(구 단일 밴드 = 피크 런만 그려 2등 구간[요일 수~목 = 도달 .950·1.062]을 통째로 숨겼다 · 운영자 260801 실기 지적)
      for (let i = 0; i < sc.length; i++) { if (sc[i] >= T) { const r = runs[runs.length - 1]; if (r && r[1] === i - 1) r[1] = i; else runs.push([i, i]); } }
      const cross = (a, b) => { const t = (sc[a] - T) / (sc[a] - sc[b]); return { x: X(a) + (X(b) - X(a)) * t, y: spts[a][1] + (spts[b][1] - spts[a][1]) * t }; };   // 경계 = 임계 교차점 선형 보간(x·팔로워 파도 y) — 버킷 스냅 금지 = 구 edge() 문법 계승 · a는 항상 임계 이상·b는 미만이라 t∈(0,1) 보장(구식 '두 점 다 dfs≤0 음수 t' 오이동 구조적 소멸)
      const at = i => ({ x: X(i), y: spts[i][1] });   // 축 끝(확장 벽)에서 멈춤 = 그 버킷 중심(교차 아님 = 보간 불요)
      const yWave = xq => { const q = Math.max(spts[0][0], Math.min(spts[spts.length - 1][0], xq)); for (let i = 1; i < spts.length; i++) { if (spts[i][0] >= q) { const [xa, ya] = spts[i - 1], [xb, yb] = spts[i]; return xb === xa ? ya : ya + (yb - ya) * (q - xa) / (xb - xa); } } return spts[spts.length - 1][1]; };   // 음영 상단(팔로워 파도) y = 중앙 x에서 선형 보간(곡선 chPath와 미세차 있으나 라벨 배치용 = 육안 무차)
      s += `<defs><linearGradient id="sigCore-${ax}" gradientUnits="userSpaceOnUse" x1="0" y1="${mT}" x2="0" y2="${aB.toFixed(1)}"><stop offset="0" stop-color="var(--cat-tech)" stop-opacity=".34"/><stop offset="1" stop-color="var(--cat-tech)" stop-opacity=".06"/></linearGradient>${runs.map(([i0, i1], k) => { const a = i0 > 0 ? cross(i0, i0 - 1) : at(i0), b = i1 < sc.length - 1 ? cross(i1, i1 + 1) : at(i1); return `<clipPath id="sigCoreClip-${ax}-${k}"><rect x="${a.x.toFixed(1)}" y="${mT}" width="${(b.x - a.x).toFixed(1)}" height="${ph}"/></clipPath>`; }).join('')}</defs>`;   // 그라데이션 = 밴드 공용 1개(userSpaceOnUse 세로축 = 위치 무관) · 클립만 밴드별
      runs.forEach(([i0, i1], k) => {
        const e0 = i0 > 0 ? cross(i0, i0 - 1) : at(i0), e1 = i1 < sc.length - 1 ? cross(i1, i1 + 1) : at(i1);
        s += `<path d="${sline} L${sx1.toFixed(1)} ${aB.toFixed(1)} L${sx0.toFixed(1)} ${aB.toFixed(1)} Z" fill="url(#sigCore-${ax})" stroke="none" clip-path="url(#sigCoreClip-${ax}-${k})"/>`;   // 팔로워 area(파도→X축)를 코어 컬럼으로 하드 클립 = 세로 커튼(라벨 행 무접촉)
        [[e0.x, e0.y], [e1.x, e1.y]].forEach(([xe, ye]) => { s += `<line x1="${xe.toFixed(1)}" y1="${(aB + 4).toFixed(1)}" x2="${xe.toFixed(1)}" y2="${ye.toFixed(1)}" stroke="var(--cat-tech)" stroke-width="1.2" opacity=".72" vector-effect="non-scaling-stroke"/>`; });   // 양 옆 세로변(파도 곡선 y → X축 +4) = 선분만 아주 살짝 축 관통(운영자 260723 "선분 쫙 이어서 · 음영을 넘기란 게 아니야") — 아래 해당 눈금 숫자와 연결감
        coreXRs.push([e0.x, e1.x]);
        const cx = (e0.x + e1.x) / 2;
        if (e1.x - e0.x >= 46) coreLabs.push({ x: cx, y: (yWave(cx) + aB) / 2 });   // 라벨 = 음영 중앙 각인(운영자 260730) · 폭 46 미만 밴드는 라벨 생략(글리프가 음영 밖으로 삐져나가는 오표기 차단 — 라벨 실측 폭 41 + 여유 · 밴드 자체는 그대로 표기)
      });
      // 보완 필요 존 3차 확정(운영자 260805 3차 "앱 사용자의 이용 선은 높은데 팔로워의 이용선이 낮을 때 — 그때 게시물을 안 올리거나
      //   해서 제대로 활용을 못 하고 있다는 뜻 · 핵심 보라와는 거의 겹칠 일 없을 것[핵심 = 이미 공략 중 = 보완의 60~70% 반대 개념]") —
      //   판정 = 이용 강도 핫존(gen ≥ 피크 85 · CORE_TH 동값 재사용 = 새 상수 0) ∧ 내 공유 lift < 1.0(채널 중앙 기준선 = 화면의
      //   ×1.0 점선 아래 = "평소보다 약함"). 2차(파란선<노란선 픽셀 비교)는 벤치 노랑이 평평·상단이라 주중 대부분+핵심(토·일)까지
      //   물들어 폐기 — 운영자 재판정으로 "이용률 높은데 못 쓰는 자리"만 남김(실측 = 요일 화·금 / 시간대 밤22-24 = 운영자 동그라미
      //   [금 골짜기] 정합 · 핵심과는 구조상 거의 배타[핵심 = 고공유 = ×1.0 위]). 드문 동시 성립 시 렌더 순서상 빨강이 뒤 = 우위 레이어(2차 지시 유지).
      //   경계 = 공유↔×1.0 교차(= 터콰이즈가 점선을 뚫는 그 점 · y = 기준선) 또는 gen↔85 교차 선형 보간(버킷 스냅 금지) · 색·그라데 스톱 = 핵심 커튼 정본값.
      //   음영 기하 4차(운영자 260805 4차 "파란색 선 위 > 공간 < 노란색 선 아래 · 파란 아래에 이미 확보되는 점유율은 필요 없음") —
      //   칠하는 곳 = **터콰이즈 위 ~ 노랑 아래 밴드**(= 끌어올려야 할 여백) · 구현 = 마스크(노랑 아래 흰 − 터콰이즈 아래 검)
      //   = 화면에 실제 그려진 두 베지어 그대로의 사이 공간(다각형 근사 0) · 터콰이즈가 노랑 위로 솟은 곳은 마스크가 자연 소거.
      //   범위·톤 5차(운영자 260805 5차) = 기둥 클립·세로변 폐지 → 갭 주머니 전체 렌즈(아래 fruns 확장) + 불투명도 감쇠(.26/.05).
      const shv = bs.map(b => val(b, 'share_pm'));
      const dfs = spts.map((p, i) => p[1] - gpts[i][1]);   // 파란y − 노랑y(>0 = 파란이 노랑 아래 = 갭 열림) — 렌즈 범위·경계 축
      // 범위 5차(운영자 260805 5차 "이 부분 전체에 음영 · 꼭 기둥 모양일 필요 없음") — 트리거(위 3차 판정)가 든 **갭 주머니 전체**로
      // 확장: 트리거 런에서 양옆으로 dfs>0인 동안 넓혀 파란·노랑이 실제로 만나는 교차점(또는 안 닫히면 플롯 가장자리)까지.
      // 한 주머니에 트리거 2개 = 병합 1렌즈 · 트리거 없는 주머니(예: 오전~점심 = 이용 강도 낮음)는 종전대로 무음영.
      // ⚠ 판정 6차(운영자 260809 4차 첨부 «이렇게 앱 사용자 이용률이 더 높은 구간에는, 전에와 마찬가지로 보완 필요가 있어야함» = 밤22-24 동그라미) —
      //   구 게이트 `gpts[i][2] >= 85`(이용 강도 **절대** 임계) 폐기. 사유 = 그 85는 260805 3차 당시 노란선이 **실측**(GEN_MEAS = online_curve_kst)
      //   이던 시절의 값인데, 260809 3차에 노란선이 벤치(SIG_GEN)로 되돌아가면서 같은 밴드의 값이 통째로 내려앉아 게이트만 홀로 낡았다
      //   (실측 밴드평균 vs 벤치: 밤22-24 **95.0 → 78** · 점심 90.4→74 · 오후 93.3→82) → 밤22-24가 85에 잘려 **시간대 축 보완 필요가 0개**가 됐다
      //   = 운영자가 260805에 "여기"라고 지목했던 바로 그 자리가 조용히 사라진 것(전 축 실측 = 이 커밋 근거).
      //   → 판정을 화면에 **실제로 그려진 두 선의 관계**로 되돌린다 = 「노랑이 터콰이즈 위(dfs>0) ∧ 내 공유 < ×1.0」 = 운영자 문장 그대로
      //   (「앱 사용자 이용률이 더 높은 구간」 + 260805 3차 「팔로워의 이용선이 낮을 때」). 새 상수·새 데이터 0 — 오히려 낡을 수 있는 절대 상수 하나를 **제거**한다.
      //   ⚠ 260805 2차 폐기(픽셀 비교 → "주중 대부분+핵심[토·일]까지 물들어") 재발 없음 = 그때 없던 `shv < 1`(3차 신설)이 핵심을 구조적으로 배타한다
      //   — 현 데이터 실측으로 확인: 토(dfs +19.5)·일(+10.6)은 노랑이 위지만 공유 ×1.07·×1.10이라 **전건 배제**(핵심 보라와 겹침 0 유지).
      //   전후(현 데이터 실렌더) = 시간대 **0개 → 밤22-24 1개**(저녁18-22 교차점~우변 = 동그라미 정합) · 요일 = 화·금 → 월·화·금(월은 종전에도 화 렌즈 확장이 덮던 자리 = 화면 변화 실질 0).
      const trig = [];
      for (let i = 0; i < shv.length; i++) { if (shv[i] != null && shv[i] < 1 && dfs[i] > 0 && !bs[i].low_sample) { const r = trig[trig.length - 1]; if (r && r[1] === i - 1) r[1] = i; else trig.push([i, i]); } }
      let fruns = [];
      trig.forEach(([a, b]) => { while (a > 0 && dfs[a - 1] > 0) a--; while (b < dfs.length - 1 && dfs[b + 1] > 0) b++; const m = fruns[fruns.length - 1]; if (m && a <= m[1] + 1) m[1] = Math.max(m[1], b); else fruns.push([a, b]); });
      if (fruns.length) {
        const fedge = (a, b) => {   // a = 렌즈 안(dfs>0) · b = 밖(dfs≤0) = 두 선 교차점 보간 · b가 차트 밖 = 렌즈가 안 닫힘 = 숄더 끝(플롯 가장자리)까지 = "전체"
          if (b < 0) return { x: sx0, y: spts[a][1] };
          if (b >= dfs.length) return { x: sx1, y: spts[a][1] };
          const t = dfs[a] / (dfs[a] - dfs[b]); return { x: X(a) + (X(b) - X(a)) * t, y: spts[a][1] + (spts[b][1] - spts[a][1]) * t };
        };
        const yGen = xq => { const q = Math.max(gpts[0][0], Math.min(gpts[gpts.length - 1][0], xq)); for (let i = 1; i < gpts.length; i++) { if (gpts[i][0] >= q) { const [xa, ya] = gpts[i - 1], [xb, yb] = gpts[i]; return xb === xa ? ya : ya + (yb - ya) * (q - xa) / (xb - xa); } } return gpts[gpts.length - 1][1]; };   // 노랑 선 y 보간 = yWave 문법 미러(gpts 축) — 밴드 상단·세로변·라벨 배치용
        s += `<defs><mask id="sigFixM-${ax}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><path d="${gl} L${sx1.toFixed(1)} ${aB.toFixed(1)} L${sx0.toFixed(1)} ${aB.toFixed(1)} Z" fill="#fff"/><path d="${sline} L${sx1.toFixed(1)} ${aB.toFixed(1)} L${sx0.toFixed(1)} ${aB.toFixed(1)} Z" fill="#000"/></mask>${fruns.map(([i0, i1], k) => { const a = fedge(i0, i0 - 1), b = fedge(i1, i1 + 1); const g1 = Math.min(...gpts.slice(i0, i1 + 1).map(p => p[1])), g2 = Math.max(a.y, b.y, ...spts.slice(i0, i1 + 1).map(p => p[1])); return `<linearGradient id="sigFixG-${ax}-${k}" gradientUnits="userSpaceOnUse" x1="0" y1="${g1.toFixed(1)}" x2="0" y2="${(g2 > g1 ? g2 : aB).toFixed(1)}"><stop offset="0" stop-color="var(--danger)" stop-opacity=".26"/><stop offset="1" stop-color="var(--danger)" stop-opacity=".05"/></linearGradient><clipPath id="sigFixClip-${ax}-${k}"><rect x="${a.x.toFixed(1)}" y="${mT}" width="${(b.x - a.x).toFixed(1)}" height="${ph}"/></clipPath>`; }).join('')}</defs>`;   // 마스크 = 축당 1개(노랑 아래 − 터콰이즈 아래 = 두 선 사이 렌즈) · 그라데 y축 = 렌즈 실범위(상단 노랑 최고점 → 하단 터콰이즈 최저점 = 「위 진하고 아래 잔광」 정본 의도) · raw-ok: 스톱 .26/.05 = 핵심 정본 .34/.06의 감쇠 사본(운영자 260805 5차 "빨간색 불투명도 좀만 낮춰줘" — 색상 자체는 --danger 토큰 유지)
        fruns.forEach(([i0, i1], k) => {
          const e0 = fedge(i0, i0 - 1), e1 = fedge(i1, i1 + 1);
          s += `<path d="${gl} L${sx1.toFixed(1)} ${aB.toFixed(1)} L${sx0.toFixed(1)} ${aB.toFixed(1)} Z" fill="url(#sigFixG-${ax}-${k})" stroke="none" mask="url(#sigFixM-${ax})" clip-path="url(#sigFixClip-${ax}-${k})"/>`;   // 노랑 아래 area를 마스크로 깎아 = 터콰이즈 위~노랑 아래 렌즈만 잔존 · 세로변 없음(운영자 260805 5차 "꼭 기둥 모양일 필요 없음" — 렌즈 양끝 = 두 선의 실제 교차점이라 형상이 스스로 닫힌다 · 핵심 커튼 세로변 문법은 코어 전용 잔류)
          fixXRs.push([e0.x, e1.x]);
          let li = i0; for (let i2 = i0; i2 <= i1; i2++) { if (dfs[i2] > dfs[li]) li = i2; }   // 라벨 앵커 = 렌즈에서 갭이 가장 깊은 버킷(확장된 얇은 꼬리가 아니라 주머니 배에 각인)
          const fcx = Math.max(mL + 24, Math.min(W - mR - 24, X(li)));
          if (e1.x - e0.x >= 46) fixLabs.push({ x: fcx, y: (yGen(fcx) + yWave(fcx)) / 2 });   // 라벨 = 그 지점 밴드(노랑~터콰이즈) 정중앙 · 폭 게이트 46 = 핵심 정본 사본 · x 클램프 = 피크 콜아웃 lx 문법 사본
        });
      }
    }
  }
  if (gl) s += `<path d="${gl}" fill="none" stroke="var(--accent-4)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
  // 팔로워 접속 피크 밴드(운영자 260719 승인 한 수) — online_peak_kst 상위 3시각 · 연속 시각 = 한 밴드 병합 · 앰버 저알파 = 게시 예약 필과 동일 데이터 축
  const bandLabs = [];
  if (ax === 'hour_band' && Array.isArray(x2.peaks) && x2.peaks.length) {
    const phs = [...new Set(x2.peaks)].sort((a, b) => a - b), runs = [];
    phs.forEach(hh => { const r = runs[runs.length - 1]; if (r && hh - r[r.length - 1] <= 1) r.push(hh); else runs.push([hh]); });
    runs.forEach(r => {
      const x0 = hourX(r[0]), x1 = hourX(r[r.length - 1]);
      if (x0 == null || x1 == null) return;
      const top1 = r.indexOf(x2.peaks[0]) >= 0;   // 1위 시각 포함 런 = 진하게+라벨 · 나머지 = 은은
      s += `<rect x="${(x0 - 7).toFixed(1)}" y="${mT}" width="${(x1 - x0 + 14).toFixed(1)}" height="${ph}" rx="2" fill="var(--mut)" fill-opacity="${top1 ? '.14' : '.08'}"/>`;   // 무채 워시(운영자 260723 한 수) — 일반 평균 노랑선과 색 충돌 회피 · 색=데이터(공유·일반평균)/무채=맥락(접속피크·볼륨·마커) 위계
      if (top1) bandLabs.push({ x: (x0 + x1) / 2, txt: `접속 피크 ${r.length > 1 ? r[0] + '~' + r[r.length - 1] : r[0]}시` });
    });
  }
  let mkX = null, mkTxt = '';   // 지금(시간대)·오늘(요일) 마커 — 무채 은은 hairline(변곡 리더 톤 계승 · KST [12])
  if (ax === 'hour_band' && x2.now != null) { mkX = hourX(x2.now); mkTxt = '지금'; }
  if (ax === 'dow' && x2.today) { const ti = bs.findIndex(b => b.bucket === x2.today); if (ti >= 0) { mkX = X(ti); mkTxt = '오늘'; } }
  if (mkX != null) s += `<line x1="${mkX.toFixed(1)}" y1="${mT + 2}" x2="${mkX.toFixed(1)}" y2="${(H - mB).toFixed(1)}" stroke="var(--mut)" stroke-width="1" stroke-dasharray="2 3" opacity=".55" vector-effect="non-scaling-stroke"/>`;
  const bY = Y(1);   // ×1.0 = 채널 중앙값 기준선 — 위 = 평소보다 호응↑ · 아래 = ↓
  s += `<line x1="${mL}" y1="${bY.toFixed(1)}" x2="${W - mR}" y2="${bY.toFixed(1)}" stroke="var(--mut)" stroke-width="1" stroke-dasharray="4 3" opacity=".6" vector-effect="non-scaling-stroke"/>`;
  s += `<text x="${mL + 4}" y="${(bY - 4).toFixed(1)}" text-anchor="start" font-size="9" fill="var(--mut)">채널 중앙 ×1.0</text>`;
  if (sline) {   // 팔로워(구 라벨 '공유' · 운영자 260723 리네임) 단독(운영자 260723 "저장 삭제·공유로 통일") — area 글래스+선+점 · 저장(구 --accent-2 시리즈) 폐지 · 좌표 = 위 spts 단일 산출 재사용
    s += `<path d="${sline} L${sx1.toFixed(1)} ${H - mB} L${sx0.toFixed(1)} ${H - mB} Z" fill="rgba(var(--accent-rgb),.10)" stroke="none"/>`;
    s += `<path d="${sline}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
    spts.forEach(p => { s += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${p[2] ? 'var(--bg)' : 'var(--accent)'}" stroke="${p[2] ? 'var(--accent)' : 'var(--bg)'}" stroke-width="1.6"/>`; });   // low_sample = 속빈 점
  }
  const hs = HIT.filter(p => p.share != null && !p.low), topLabs = [];   // 피크·최저 콜아웃·캡션 피크 = 믿을 칸만(표본부족 = 결론 금지 플래그 · 261025)   // topLabs = 상단 선반 라벨 점유 기록(소프트 충돌 회피)
  let trLab = null;   // 최저 콜아웃 잉크 앵커 — 보완 라벨 충돌 회피 재료(보완 존은 정의상 공유 저점과 자주 겹친다 · 260805 실렌더 실측 = 화·밤 트로프 정면 충돌)
  if (hs.length >= 3) {   // 피크·최저 콜아웃(공유 기준 · chChart 극값 문법 계승)
    let pk = hs[0], tr = hs[0];
    hs.forEach(p => { if (p.share > pk.share) pk = p; if (p.share < tr.share) tr = p; });
    const lx = v => Math.max(mL + 24, Math.min(W - mR - 24, v));
    if (pk.share !== tr.share) {
      const pky = Math.max(mT + 9, pk.y - 8);
      s += `<circle cx="${pk.x.toFixed(1)}" cy="${pk.y.toFixed(1)}" r="4.2" fill="var(--accent-bright)" stroke="var(--bg)" stroke-width="2"/>`;
      s += `<text x="${lx(pk.x).toFixed(1)}" y="${pky.toFixed(1)}" text-anchor="middle" font-size="8.5" fill="var(--accent-bright)" font-weight="700">피크 ×${pk.share}</text>`;
      topLabs.push({ x: lx(pk.x), y: pky });
      s += `<circle cx="${tr.x.toFixed(1)}" cy="${tr.y.toFixed(1)}" r="4.5" fill="none" stroke="var(--mut)" stroke-width="1.5"/>`;   // 최저 = 속빈 무채 링(점 위 겹침 시인 위해 r 확대 · chChart 트로프 문법)
      trLab = { x: lx(tr.x), y: Math.min(H - mB - 4, tr.y + 13) };
      s += `<text x="${trLab.x.toFixed(1)}" y="${trLab.y.toFixed(1)}" text-anchor="middle" font-size="8" fill="var(--mut)">최저 ×${tr.share}</text>`;
    }
  }
  const putTop = (x, txt, fill) => {   // 상단 선반 라벨 배치(가로 70·세로 10px 근접 = 한 칸 아래 · 엣지 클램프) — 접속 피크·지금·오늘 공용
    const cx = Math.max(mL + 16, Math.min(W - mR - 16, x));
    let y = mT + 8;
    for (let t = 0; t < 3 && topLabs.some(l => Math.abs(l.x - cx) < 70 && Math.abs(l.y - y) < 10); t++) y += 10;
    topLabs.push({ x: cx, y });
    s += `<text x="${cx.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="8" fill="${fill}" font-weight="700">${txt}</text>`;
  };
  coreLabs.forEach(l => { s += `<text x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="8" fill="var(--cat-tech)" font-weight="700" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))">${ax === 'hour_band' ? '핵심 시간대' : '핵심 요일'}</text>`; });   // 핵심 구간 라벨 = 상단 선반(putTop) 이탈 → 음영 블록 정중앙 각인(운영자 260730 "양옆 중앙·위아래 중앙") · 색 = 음영 동색 네온바이올렛(260723 계승) · 그림자 = 레포 텍스트 가독 정본값 drop-shadow(0 1px 2px rgba(0,0,0,.45)) 계승(.ch-th .rl·.dlbtn) = 파도·볼륨바 위 판독
  fixLabs.forEach(l => { if ((trLab && Math.abs(trLab.x - l.x) < 60 && Math.abs(trLab.y - l.y) < 16) || coreLabs.some(c => Math.abs(c.x - l.x) < 60 && Math.abs(c.y - l.y) < 16)) { putTop(l.x, '보완 필요', 'var(--danger)'); return; } s += `<text x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="8" fill="var(--danger)" font-weight="700" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))">보완 필요</text>`; });   // 보완 필요 라벨 = 핵심 라벨 문법 100% 미러(중앙 각인·8px·그림자 동값) · 색 = 존 동색 --danger(운영자 260805 "빨간색으로 보완 필요 적어줘야"). 최저 콜아웃 충돌 = 상단 선반 putTop 이관 — 보완 존은 정의상 공유 저점과 상습 동거인데 트로프 커튼(파도~축 ~17px)엔 '한 칸 아래'가 물리적으로 없다(260805 실렌더 실측 = 화·밤 정면 충돌 · 바닥 클램프 무효). 창 60×16 = 라벨 실폭 41+여유·잉크 8px 스택 감안(10px 창은 화 케이스가 0.3px 차로 빠져나가는 걸 실측)
  bandLabs.forEach(l => putTop(l.x, esc(l.txt), 'var(--mut)'));   // 접속 피크 라벨 = 무채(운영자 260723 한 수 · 밴드 무채 워시와 동색 · 일반 평균 노랑과 분리)
  if (mkX != null) putTop(mkX, mkTxt, 'var(--mut)');
  const inCore = x => coreXRs.some(r => x >= r[0] - 1 && x <= r[1] + 1);   // 핵심 구간에 드는 눈금/라벨 = 음영 동색 보라 틴트(운영자 260723 "해당하는 숫자를 보라색 음영" · ±1px = 경계 부동소수 여유) — 구 경계시각 별도 라벨("9시/18시" 행) 대체
  const tick = x => { s += `<line x1="${x.toFixed(1)}" y1="${H - mB}" x2="${x.toFixed(1)}" y2="${(H - mB + 3).toFixed(1)}" stroke="var(--mut)" stroke-width="1" opacity=".55" vector-effect="non-scaling-stroke"/>`; };   // X축 미니 눈금선(운영자 260724 "보라 튀어나온 것처럼 각각 다 mut으로") — 문법 = 핵심 구간 세로변 축 관통 미러(관통 3 = 보라 4보다 반 계단 아래 위계) · 톤 = 지금/오늘 무채 마커(--mut·1px·op .55) 계승 · 전 인덱싱 위치(숫자 눈금 + 요일명 중심선)
  const DAY_MARKS = [6, 14, 22];   // 하루 3구간 표기 정본(운영자 260801 "6 14 22 이렇게 세구간을 하루에 표기") = 22–6 야간 / 6–14 오전 / 14–22 오후 8h 3분할 · 자정 표기는 0 금지 = 24로만(운영자 260801 "0을 24로 표기") — 시간대 축·요일 서브행 공용 SSOT(두 축 표기 문법 동조)
  if (hlin && ax === 'hour_band') {   // X축 = 시각 눈금(운영자 260723 "밴드명 말고 그냥 숫자만" → 260801 표기 솎음: 눈금선은 24분할 전량 유지[미세 자] · *숫자는* 3구간 마크 + 양끝 자정 24만) — 크기·굵기·베이스라인(9·700·H-7) = 구 버킷 라벨 규격 계승 · 밴드명은 호버 툴팁에 유지 = 정보 손실 0
    for (let hh = 0; hh <= 24; hh++) tick(mL + pw * hh / 24);   // 미세 자 = 전 시각 눈금선(보라 세로변이 임의 x에 서므로 위치 판독용 · 260724 톤 그대로)
    [0, ...DAY_MARKS, 24].forEach(hh => {
      const xh = mL + pw * hh / 24, lab = hh === 0 ? 24 : hh;   // 좌끝 0 = "24"(자정 = 전날 24시 · 우끝과 같은 순간이라 표기 통일)
      s += `<text x="${xh.toFixed(1)}" y="${H - 7}" text-anchor="middle" font-size="9" fill="${inCore(xh) ? 'var(--cat-tech)' : 'var(--mut)'}" font-weight="700">${lab}</text>`;
    });
  } else if (hlin) {   // 요일 = 주간 선형축 2단 눈금(운영자 260724 "요일별로 3개씩 — 지금 너무 모호" · 260801 위상 교체: 0·8·16 → 6·14·22 = 시간대 축과 동일 3구간) — 서브행 y = 구 경계시각 행 +1(눈금선 3px과 글리프 캡 간섭 회피) · font 8 = putTop 선반 티어 = 요일명 아래 위계 · 요일명 행 = H-7·9·700 계승 · 핵심 구간 = 두 행 다 보라 틴트 · 눈금선 = 요일 경계(자정) + 3구간 마크 + 요일 중심선
    for (let d = 0; d <= ord.length; d++) tick(mL + pw * (d * 24) / SPAN);   // 요일 경계(자정) 눈금선 = 숫자 없이 선만(0 표기 금지 · 날 구분은 위 요일명 행이 담당)
    ord.forEach((_, d) => DAY_MARKS.forEach(hh => {
      const xt = mL + pw * (d * 24 + hh) / SPAN;
      tick(xt);
      s += `<text class="sig-sub" x="${xt.toFixed(1)}" y="${(H - mB + 9).toFixed(1)}" text-anchor="middle" font-size="8" fill="${inCore(xt) ? 'var(--cat-tech)' : 'var(--mut)'}" font-weight="700">${hh}</text>`;   // +10 → +9(260801): 6·14·22 위상에선 14가 요일명 중심(12시)과 2h차 = x 잉크 1.98px 겹침 → 세로 여백 확보가 유일한 해(실측 = 눈금선 하단 131 ↔ 숫자 잉크 상단 132 · 숫자 잉크 하단 137 ↔ 요일명 잉크 상단 139 = 양쪽 1·2px 클린)
    }));
    bs.forEach((b, i) => { tick(X(i)); s += `<text x="${X(i).toFixed(1)}" y="${H - 7}" text-anchor="middle" font-size="9" fill="${inCore(X(i)) ? 'var(--cat-tech)' : 'var(--mut)'}" font-weight="700">${esc(b.bucket)}</text>`; });
  } else bs.forEach((b, i) => {   // 축 파싱 실패 폴백 = 구 버킷 라벨(첫/끝 = 엣지 앵커 = 삐침 방지 · y = 일일 추이 베이스라인 H-7 계승) · 핵심 구간 안 라벨 = 동일 보라 틴트(형제 동조[4]) · n 병기 줄 = 운영자 260722 제거(툴팁 n= 유지)
    const anc = i === 0 ? 'start' : i === bs.length - 1 ? 'end' : 'middle', xa = i === 0 ? mL : i === bs.length - 1 ? W - mR : X(i);
    tick(xa);
    s += `<text x="${xa.toFixed(1)}" y="${H - 7}" text-anchor="${anc}" font-size="9" fill="${inCore(xa) ? 'var(--cat-tech)' : 'var(--mut)'}" font-weight="700">${esc(b.bucket)}</text>`;
  });
  s += '</svg>';
  let pk2 = null; hs.forEach(p => { if (!pk2 || p.share > pk2.share) pk2 = p; });   // 캡션 우측 피크 요약(헤더 .ct-v 대값 문법의 축약 계승)
  const html = `<div class="sig-cap"${W !== 600 ? ` style="--sig-pl:${(mL / W * 100).toFixed(3)}%"` : ''}><span class="sig-t">${(CHAN_SRC === 'fb' ? SIG_CAP_FB : SIG_CAP)[ax] || esc(ax)}</span>${pk2 ? `<span class="sig-pk">피크 ${esc(pk2.bucket)} · ${CHAN_SRC === 'fb' ? '반응' : '공유'} ×${pk2.share}</span>` : ''}<span class="sig-lgd"><i class="lg-sh">팔로워</i>${GEN_MEAS ? `<i class="lg-gen" title="팔로워 접속 = 내 팔로워의 ${ax === 'dow' ? '요일별 접속 강도 — 하루 총량이 아니라 접속 피크대(위 차트 상위 3시각)만 집계한다. 총량은 팔로워 수와 거의 같아 요일차가 상쇄되지만, 피크대는 「올릴 시간에 그 요일 사람이 얼마나 붙어 있나」를 남긴다(260809)' : '시간대별 접속 강도'}(Meta online_followers API 실측 · 피크=100 상대 · 시간대 260803·요일 260804 실측 편입 — 구 벤치 실루엣 대체)">팔로워 접속</i>` :(CHAN_SRC !== 'fb' && SIG_GEN[ax]) ? '<i class="lg-gen" title="앱 사용자 이용 = 전체 인스타 이용자의 평균 이용 강도(원천 = 이용시간 통계 · 상대값 · 측정치 아님). ⚠ 「접속」과 다른 축이다 — 이 차트의 무채 밴드 「접속 피크」·하단 「접속 실측」은 내 팔로워가 실제로 앱을 켜고 있는 수(Meta online_followers 실측)이고, 이 노란선은 전체 이용자가 얼마나 오래 쓰는가(바깥 벤치 실루엣)다. 내 팔로워가 아니라 바깥 레퍼런스(내 채널 축 = 터콰이즈 「팔로워」) — 시간대: 국내 이용시간(오픈애즈·소셜비즈 2025 3Q) · 요일: 이용시간 종합(와이즈앱·App Ape·글로벌 스크린타임 2025~26 — 주말 확산·소폭↑)">앱 사용자 이용</i>' : ''}${coreXRs.length ? `<i class="lg-core" title="핵심 구간 = 도달 기대값(공유 lift × ${GEN_MEAS ? '팔로워 접속 강도' : '앱 사용자 이용 강도'})이 피크의 85% 이상인 구간 전부(복수 가능) — 반응률만이 아니라 볼 사람 수까지 곱한 값(운영자 260801)">핵심 구간</i>` : ''}${fixXRs.length ? '<i class="lg-fix" title="보완 필요 = 이용자 선(노랑)이 내 공유 선 위에 있는데 그 공유가 채널 중앙(×1.0 점선) 아래로 처진 자리 — 그때 안 올리거나 활용을 못 해 이용자 흐름을 놓치는 것(운영자 260805·260809). 음영 = 그 자리가 든 갭 주머니 전체(내 곡선 위~이용자 선 아래 = 끌어올릴 여백 · 파란 아래 확보 점유율 제외) · 핵심 구간과 반대 개념 · 게시 실험 우선 후보">보완 필요</i>' : ''}${bandLabs.length ? '<i class="lg-pk">접속 피크</i>' : ''}</span>${x2.curve && x2.led ? `<span class="sig-live" title="팔로워 접속 실측(Meta online_followers)을 워크플로가 상시 자동 수집 — 원장 ${x2.led.days || '?'}일 축적${x2.led.last ? ' · 마지막 적재 ' + esc(x2.led.last) : ''} · 3일 이상 끊기면 메시지함 경보(매월 말~초 지연 경향 = 운영자 260805 관측)">${x2.led.stall != null && x2.led.stall >= 3 ? '실측 수신 지연 ' + x2.led.stall + '일' : '접속 실측 수집 중' + (x2.led.days ? ' · ' + x2.led.days + '일' : '')}</span>` : ''}</div>` +
    `<div class="ch-chartwrap sig-chartwrap" data-ax="${esc(ax)}">${s}<div class="ch-tip"></div><div class="ch-dot"></div></div>`;
  return { html, hits: HIT, w: W };
}

// 잘 되는 조건(운영자 261024 「잘되는 조건 좋고 · 지금 넣기」) — lieflat F12 Dumbbell Queue 원본(에디터 사본 .claude/skills/lieflat-charts/templates/basics-gallery.html C8):
// 행마다 궤도 + 속 빈 점(기준) + 꽉 찬 점(비교) + 사이 구슬(차이 단위 1개 = 1알 · 셀 수 있게). 행 이름 = 궤도 위 왼쪽(L15 원본 배치 = 행끼리 위아래 덩어리).
// 원본과 다른 곳 = 글자 크기·색 = 노뮤트 토큰(폰 판독) · 행마다 제 자(0부터 · 작은 값끼리 점 겹침 방지) · 감소 = 네온 주황 · 노란 줄 = 결론 한 문장(설명 없음).
// 데이터 = insta_data.json timing·fmt·eras(수집기 insta_signals.py 가 매일 계산 · 새 수집 0) · 필드 없으면 그 카드만 조용히 빠진다.
export function condCards(d) {
  const out = [], r1 = (b, a) => Math.round(b / a * 10) / 10;
  const T = d.timing || {}, F = d.fmt || {}, E = d.eras || {}, fpe = T.follows_per_post_by_era || {};
  if (T.rest_day_med && T.post_day_med) { const r = r1(T.post_day_med, T.rest_day_med);
    out.push({ t: '올린 날 vs 쉰 날', a: '쉰 날', b: '올린 날', bead: 10, unit: '명', rows: [['새 팔로우/일', T.rest_day_med, T.post_day_med]],
      foot: r >= 1 ? `올린 날이 쉰 날보다 새 팔로우가 ${r}배 많아서, 쉬면 손해인 상황이다.` : `쉰 날이 올린 날보다 새 팔로우가 많아서, 올리는 효과가 안 보이는 상황이다.` }); }
  const fd = F['피드'], rl = F['릴스'];
  if (fd && rl && fd.share_pm_med && rl.share_pm_med) { const r = r1(rl.share_pm_med, fd.share_pm_med);
    out.push({ t: '피드 → 릴스', a: '피드', b: '릴스', bead: .5, unit: '‰', rows: [['공유', fd.share_pm_med, rl.share_pm_med], ['좋아요', fd.like_pm_med, rl.like_pm_med], ['저장', fd.save_pm_med, rl.save_pm_med], ['댓글', fd.cmt_pm_med, rl.cmt_pm_med]].filter(x => x[1] != null && x[2] != null),
      foot: r >= 1 ? `릴스가 공유를 피드의 ${r}배 받아서, 퍼지는 건 릴스인 상황이다.` : `피드가 공유를 릴스의 ${r1(fd.share_pm_med, rl.share_pm_med)}배 받아서, 퍼지는 건 피드인 상황이다.` }); }
  const ek = Object.keys(E), kb = ek.find(k => /부흥/.test(k)), ks = ek.find(k => /침체/.test(k)), kr = ek.find(k => /회복/.test(k)), nm = k => k.replace(/\(.*\)/, '');
  if (ks && kr && fpe[ks] && fpe[kr]) { const r = r1(fpe[kr], fpe[ks]);
    out.push({ t: `${nm(ks)} → ${nm(kr)}`, a: nm(ks), b: nm(kr), bead: null, rows: [['게시당 팔로우', fpe[ks], fpe[kr], kb ? fpe[kb] : null, '명'], ['공유', E[ks].share_pm_med, E[kr].share_pm_med, kb ? E[kb].share_pm_med : null, '‰']].filter(x => x[1] != null && x[2] != null),
      foot: r >= 1 ? `${nm(kr)} 게시물이 팔로우를 ${nm(ks)}의 ${r}배 데려와서, 침체를 벗어난 상황이다(게시물 ${E[kr].n}개).` : `${nm(kr)} 게시물이 팔로우를 ${nm(ks)}보다 적게 데려와서, 아직 침체인 상황이다(게시물 ${E[kr].n}개).` }); }
  return out;
}
export function condDraw(W, c) {
  const NS = 'http://www.w3.org/2000/svg', mk = (p, t, a) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); p.appendChild(n); return n; };
  const tx = (p, a, str) => { const n = mk(p, 'text', a); n.textContent = str; return n; }, tip = (n, str) => { mk(n, 'title', {}).textContent = str; };
  const rnd = (i, k) => Math.abs(((i * 73856093) ^ (k * 19349663)) % 1000) / 1000;   // 원본 결정적 흔들림(구슬 높낮이)
  const fm = v => v >= 100 ? Math.round(v) : Math.round(v * 100) / 100;
  const rowH = 62, top = 34, H = top + c.rows.length * rowH - 10, X0 = 14, X1 = W - 14;   // raw-ok: 시안 v2 승인 배치(운영자 261024) — 행 62 · 행 이름 자리 34 · 좌우 여백 14
  const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', `0 0 ${W} ${H}`); s.setAttribute('width', W); s.setAttribute('height', H);
  c.rows.forEach((r, i) => {
    const [name, a, b, ref, u] = r, y = top + i * rowH + 14, unit = u || c.unit, up = b >= a, col = up ? 'var(--accent)' : 'var(--modern-neon-orange)';
    const lo = Math.min(0, a, b, ref ?? a), hi = Math.max(a, b, ref ?? a) * 1.08, mx = v => X0 + (v - lo) / (hi - lo) * (X1 - X0), xa = mx(a), xb = mx(b);
    tx(s, { x: X0 - 6, y: y - 26, fill: 'var(--fg)', style: 'font-size:var(--fs-xs);font-weight:var(--fw-b)' }, name);
    mk(s, 'line', { x1: X0 - 6, y1: y, x2: X1 + 6, y2: y, stroke: 'var(--line)', 'stroke-width': .7 });
    if (ref != null) { const xr = mx(ref); mk(s, 'line', { x1: xr, y1: y - 7, x2: xr, y2: y + 7, stroke: 'var(--mut)', 'stroke-width': 1, opacity: .7 }); tip(mk(s, 'rect', { x: xr - 5, y: y - 9, width: 10, height: 18, fill: 'transparent' }), '기준(부흥기) ' + fm(ref) + unit); }
    if (c.bead) { const n = Math.round(Math.abs(b - a) / c.bead); for (let k = 0; k < n; k++) { const t = (k + .5) / n; mk(s, 'circle', { cx: xa + t * (xb - xa), cy: y + (rnd(k + 1, i + 3) - .5) * 2.6, r: 1.5 + rnd(k + 2, i + 4) * .9, fill: col, opacity: .55 }); } }
    else mk(s, 'line', { x1: xa, y1: y, x2: xb, y2: y, stroke: col, 'stroke-width': 2, opacity: .55 });
    mk(s, 'circle', { cx: xa, cy: y, r: 4.2, fill: 'var(--bg)', stroke: 'var(--fg)', 'stroke-width': 1.3 });
    tip(mk(s, 'circle', { cx: xb, cy: y, r: 4.6, fill: col }), `${name} — ${c.a} ${fm(a)} → ${c.b} ${fm(b)}${unit}`);
    tx(s, { x: xa, y: y + 18, 'text-anchor': 'middle', fill: 'var(--mut)', style: 'font-size:var(--fs-xs);font-variant-numeric:tabular-nums' }, fm(a));   // 기준 값 = 궤도 아래(흐림)
    const roomR = W - xb > 96, lt = tx(s, { x: roomR ? xb - 4 : xb + 4, y: y - 9, 'text-anchor': roomR ? 'start' : 'end', fill: col, style: 'font-size:var(--fs-sm);font-weight:var(--fw-x);font-variant-numeric:tabular-nums' }, fm(b) + unit);   // 비교 값 = 궤도 위(굵게) · 오른쪽 끝이면 점 왼쪽으로(잘림 0)
    const rt = mk(lt, 'tspan', { dx: 5, style: 'font-size:var(--fs-xs);font-weight:var(--fw-b);fill:var(--accent-4)' }); rt.textContent = '×' + (a ? (b / a).toFixed(1) : '—');   // 배율 = 한 단계 작게 + 골드레몬(운영자 261024)
  });
  return s;
}

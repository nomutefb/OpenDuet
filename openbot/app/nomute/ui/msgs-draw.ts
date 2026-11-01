// @ts-nocheck
// 알림메세지 계산 몸 — 에디터 viewer-src 원본 줄 그대로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   원본 = 26-ovlGradient.part 440~816(수집 고장 sysErrMsgs · 구독 회차 subRunState · 쿠키·폰 축 · DEMO 상수) · 27-demoStaleMsgs.part 1~112(인구통계 기준일 · 지진 · 화재)
//   바꾼 곳 = 화면 전역(TRENDS · CHAN · CHAN_FB · FWATCH)을 이 모듈 변수로 · 맨 아래 sysMsgs() 하나로 묶어 내보냄 · 나머지 글자는 원본 그대로(다시 맞출 땐 줄 통째로 다시 떼어 옴)
let TRENDS = null, CHAN = null, CHAN_FB = null;   // 원본 화면 전역 → 모듈 변수(sysMsgs 가 넣음)
const SYS_PLAT_KO = { x: 'X', tiktok: '틱톡', insta: '인스타그램', youtube: '유튜브', threads: '스레드' };
const SYS_PHONE_PLAT = { insta: 'INSTA_COOKIE', threads: 'THREADS_COOKIE' };   // 폰 전용 공급원 = 값은 그 플랫폼 세션쿠키 env 이름(폰 crontab 주입 · 레포 커밋 0)
// 쿠키 조치 알림 끔(운영자 261008 "스레드 어차피 참조하는 부분 없으니까 스레드 관련 쿠키 알림 안 뜨게") — 쿠키·UA를 갈라는 사유(stuck·alien·wall·401·403)는
//   발행하지 않는다. 폰 정지(dead)는 크론 축이라 그대로 알리되 쿠키 문단만 뺀다 · 수집·화면 칸은 종전 그대로.
const SYS_CK_QUIET = { threads: 1 };
const SYS_CK_CODES = /^(stuck|alien|wall|401|403)$/;
const _sysDurKo = (m) => { m = Math.max(0, Math.round(Number(m) || 0)); const h = Math.floor(m / 60), mm = m % 60; return h ? (h + '시간' + (mm ? ' ' + mm + '분' : '')) : (mm + '분'); };
// 구독 축 「이번 회차 조회 결과」(운영자 261020 "구독중인 틱톡 계정이 신규 게시물이 없다는 뜻이면, (토큰은 정상) 알림 안오게 해줄래? 이슈가 아니니까")
//   소스 = cover[plat].run_ok·run_fail(scraper/sns_trends.py _run_outcome = 이월분 무관 · 미시도 제외).
//   'quiet' = 조회 성공 ∧ 실패 0 = 새 글이 없을 뿐 = 정상 침묵(알림·경고 배지 없음) · 'fail' = 실제 조회 실패 기록 있음 · '' = 기록 없음(구데이터 = 종전 판정).
//   ⚠ got(성공 도장 ∪ 72h 이월분)만으로는 못 가른다 — 261013~261020 틱톡 실측 = 임베드 503 실패 회차가 이월분 덕에 got=1이 돼
//     사유가 사라지고 배지는 「새 글 0건」이라고 말했다(실패를 '새 글 없음'으로 오독하게 한 근원).
function subRunState(c) {
  c = c || {};
  if (typeof c.run_ok !== 'number') return '';
  const f = (c.run_fail && typeof c.run_fail === 'object') ? Object.keys(c.run_fail).length : 0;
  return f ? 'fail' : (c.run_ok > 0 ? 'quiet' : '');
}
// 조회 실패 사유 코드(_sfail 기록값) → {k: 갈래, t: 쉬운 말 한 줄} — 알림 본문·배지 title 공용. 모르는 코드 = null(호출부 종전 문구).
function subFailKo(plat, codes) {
  const P = SYS_PLAT_KO[plat] || plat, cs = (codes || []).map(String);
  const pick = f => cs.find(v => f(v, Number(v) || 0));
  let v;
  if ((v = pick((s, n) => n >= 500))) return { k: 'srv', t: P + ' 서버가 응답을 거절했어요(HTTP ' + v + ' — ' + P + ' 쪽 일시 장애)' };
  if (pick((s, n) => n === 429)) return { k: '429', t: '요청이 몰려 ' + P + '이(가) 잠시 막았어요(HTTP 429)' };
  if ((v = pick((s, n) => n === 401 || n === 403))) return { k: 'deny', t: P + '이(가) 수집 서버의 접근을 막았어요(HTTP ' + v + ')' };
  if (pick(s => s === 'err')) return { k: 'net', t: P + ' 응답을 못 받았어요(연결 오류·시간 초과)' };
  if (pick(s => s === 'gone')) return { k: 'gone', t: '등록한 계정이 ' + P + '에 없어요(삭제됐거나 아이디를 바꿨어요)' };
  if (pick(s => s === 'nolist')) return { k: 'nolist', t: '계정은 살아있는데 영상 목록이 0건으로 와요(영상을 가져오는 창구 문제)' };
  return null;
}
function sysErrMsgs() {
  const up = String((TRENDS && TRENDS.updated) || ''), day = up.slice(0, 10) || '';
  const hh = (TRENDS && TRENDS.health) || {};
  const st = (hh.subs || {}).stale || [];
  const ph = hh.phone || null, phDead = !!(ph && ph.ok === false);   // ok=false = 폰 파일이 90분 넘게 안 갱신됨(러너가 폰분 채택을 거른 상태)
  const cov = (hh.subs || {}).cover || {};
  // 전멸 알림 = **막혔을 때만** 띄운다(운영자 260729 "가져올게 없는거라면 그거는 알림 안오게 — 시스템 구조 문제가 아니니까").
  //   stale은 "이번 런 신선 수집 0건"이라 원인을 안 가린다(scraper/sns_trends.py L1942) → 종전엔 원인 불문 "메타 로그인월"로 단정했다.
  //   260729 판례: 스레드 등록 4계정 중 @aicoffeechat·@promppy_com은 302로 막혔지만, @choi.openai·@kopp는 **정상 응답인데
  //   24h 내 새 글이 없어** 0건이었다(수집기 fresh 필터 L1183 · 화면 잔여 9건 = 40~45h 전 승계분) = 사고가 아닌 정상 침묵인데
  //   "부계 쿠키를 갈아라"는 헛 조치를 시켰다.
  //   판정은 cover.got(수집 성공 계정 수) 하나로 갈린다 — got>0 = 최소 한 계정이 페이지를 정상으로 받았다 = 경로는 안 막혔다 = 침묵.
  //   막힌 계정이 섞여 있어도 은폐가 아니다: 그 계정은 **아래 cover 축이 계정별로 이미 보고**한다(중복 1건만 제거).
  //   got=0(전멸) = 진짜 차단이라 종전 문구 그대로 · cover가 아예 없으면(reg=0) 판단 근거가 없으니 종전대로 띄운다(무근거 침묵 금지).
  const out = (Array.isArray(st) ? st : []).filter(k => SYS_PLAT_KO[k]).filter(k => {
    const c = cov[k] || {}, _got = c.got | 0, _reg = c.reg | 0;
    return !(_reg && _got) && subRunState(c) !== 'quiet';   // quiet = 수집기가 「이번 회차 조회 성공 · 실패 0」이라고 기록 = 새 글만 없음(261020)
  }).map(k => {
    const head = SYS_PLAT_KO[k] + ' 구독이 안 걷히고 있어요 — ';
    let text, _c = 'srv';   // _c = 사유 갈래 태그(id에 물린다 · 260730 적대검증 C-D4) — 종전 id는 날짜만 물어, 아침에 '대기' 알림을 ✓ 처리한 뒤 낮에 폰이 죽어도 같은 id라 "폰 크론 살려라"가 하루 통째로 소실됐다(계정 축은 이미 사유를 id에 문다 = 두 축 규약 정합)
    // 대기 사유 판정(운영자 260730 "ip 제한 걸려있다가 자동으로 들어온다고했는데") — 종전 이 분기는 `why`를
    //   **한 번도 안 읽고** 폰 축이면 무조건 "메타 로그인월 = 쿠키 갈아라"로 단정했다. 실제 원인이 레이트리밋
    //   백오프(폰이 일부러 쉬는 중)여도 이미 넣어둔 쿠키를 또 넣으라는 헛 조치가 나갔다(260730 판례).
    //   원인별 문구는 아래 cover 축이 이미 정확히 가르는데, 그 축은 got=0(전멸)이면 통째로 억제돼(L7588)
    //   전멸일수록 틀린 문구만 남는 이중 사각이었다 → 여기서 같은 사유 코드를 읽어 대기/조치를 가른다.
    //   'cooldown'·'gap' = 폰이 스스로 쉬는 중(scripts/phone_subs.py _skip_stamp) · 429 = 플랫폼 레이트리밋.
    //   ⚠ 분모에서 '미시도'를 뺀다(260730 적대검증 C-D2) — rotate는 회전 구조상 **항상 15/20 = 75%**라
    //     그것만으로 과반이 확정돼, 실제로 시도된 5계정이 무슨 사유든(쿠키 만료 wall 포함) 대기 문구가 이겨
    //     "기다리면 됨"으로 덮였다 = 이 봉합이 고치려던 헛 조치의 정반대 재발. 판정은 **시도된 사유끼리** 한다.
    const _wv = Object.values((cov[k] || {}).why || {}).map(v => String(v));
    const _try = _wv.filter(v => v !== 'rotate' && v !== 'budget');   // 실제로 시도된 계정의 사유만
    const _wait = _try.filter(v => v === 'cooldown' || v === 'gap' || v === '429').length;
    // 승격 = 무소득 장기화(운영자 260730 "원론적으로 해결해서 다음에 안뜨게") — 아래 'wait' 문구는 "이틀 넘게 계속 뜨면
    //   그때 알려줘"라고 약속하는데 **이틀을 재는 축이 없어** 쿨다운이 상주하면 같은 대기 알림이 날마다 영구 재발했다
    //   (260730 실측: insta 20계정 전부 cooldown·got 0 · 조치 없음 = 아무도 안 고침). 수집기가 마지막 수확 시각을 재
    //   임계(INSTA_STUCK_H 기본 48h)를 넘으면 사유를 'stuck'으로 승격해 보낸다(scripts/phone_subs.py _tag) →
    //   여기서 대기(무조치)와 갈라 **운영자 조치 문구**로 바꾼다 = 알림이 조치로 소멸한다(무한 대기 종결).
    const _stk = _try.filter(v => v === 'stuck').length;
    // 세션 거절 = HTTP 401·403(260905 알림 리포트 실사고 봉합) — 인스타 웹 API는 스레드의 HTML 로그인월('wall')과 달리 **숫자 코드**로
    //   세션 거절을 말한다(scraper/sns_trends.py insta_subs `_sfail("insta", acc, e.code)` · 260727 판례 「쿠키 정상 = 401 아님」).
    //   ⚠ 종전엔 이 사다리에 401·403 자리가 없어 맨 아래 'nodes' 폴백("코드 축이야 · 쿠키는 건드리지 마")으로 떨어졌다 = 쿠키가 죽었는데
    //   쿠키를 건드리지 말라는 정반대 안내(실측 = 폰 자체 기록 260905 14:35 인스타 5계정 HTTP 401 · 회전 5계정씩 260904 07:10부터).
    const _sessN = _try.filter(v => v === '401' || v === '403').length, _wallN = _try.filter(v => v === 'wall').length;
    const _uaEnv = String(SYS_PHONE_PLAT[k] || '').replace(/_COOKIE$/, '_UA');   // 세션-UA 짝(260729 useragent mismatch · INSTA_UA / THREADS_UA)
    const _xa = String(((hh.subs || {}).xauth) || 'off');   // X 로그인 경로 상태(261001) — X 칸 빈 상태 문구(renderSnsTrends subEmptySec)와 같은 사유·같은 조치(C-D5 한 축)
    if (k === 'x' && (_xa === 'off' || _xa === 'fail')) {
      _c = 'xauth-' + _xa;
      text = head + (_xa === 'fail'
        ? '로그인 쿠키가 거절됐어요(만료·로그아웃·계정 제한).\n\n👉 네가 할 일: 가계정으로 x.com에 다시 로그인해서 쿠키 auth_token·ct0를 새로 뽑아 깃허브 저장소 시크릿 X_SUBS_AUTH_TOKEN·X_SUBS_CT0를 갈아 줘. 그래도 안 되면 그 가계정이 막힌 거라 새로 만들어야 해.\n\n'
        : '로그인 없이 걷고 있어서예요 — X가 비로그인엔 최신 글 대신 옛 인기글만 줘서 새 글이 0건이에요.\n\n👉 네가 할 일: 가계정(본계 말고 — 자동화 감지 밴)으로 x.com에 로그인한 브라우저 쿠키 auth_token·ct0 두 값을 깃허브 저장소 시크릿 X_SUBS_AUTH_TOKEN·X_SUBS_CT0에 넣어 줘. 넣으면 다음 수집부터 최신 글이 조회수 순으로 떠.\n\n')
        + '확인(✓)하면 오늘은 다시 안 떠요.';
    } else if (SYS_PHONE_PLAT[k] && !phDead && _stk * 2 > _try.length) {
      _c = 'stuck';
      text = head + '이틀 넘게 한 건도 못 걷었어요 — 쉬었다 다시 시도하는 자동 복구로는 안 풀리는 상태예요.\n\n'
        + '👉 네가 할 일: ' + SYS_PLAT_KO[k] + ' 부계정(본계 말고 — 자동화 감지 밴) 세션쿠키를 폰 크론 환경변수 ' + SYS_PHONE_PLAT[k] + '에 새로 뽑아 갈아 줘. '
        + '그래도 그대로면 그 부계정이 막힌 거라 계정을 새로 하나 만들어야 해. 쿠키를 갈았으면 폰에서 `rm ~/.nomute_insta_cooldown`으로 쉬는 시간을 지워 바로 재시도시킬 수 있어.\n\n'
        + '확인(✓)하면 오늘은 다시 안 떠요.';
    } else if (SYS_PHONE_PLAT[k] && !phDead && _wv.length && (_try.length ? _wait * 2 > _try.length : true)) {
      _c = 'wait';
      text = head + (_try.filter(v => v === 'gap').length * 2 > _try.length || !_try.length
        ? '폰이 다음 수집 차례를 기다리는 중이에요(계정 리밋을 피하려고 일부러 띄엄띄엄 걷어요).\n\n'
        : '요청이 몰려 잠시 막혀서, 폰이 일부러 쉬는 중이에요 — 계속 두드리면 오히려 더 늦게 풀려요.\n\n')
        + '👉 네가 할 일: 없어요. 쉬는 시간이 끝나면 자동으로 다시 걷혀요. 이틀 넘게 계속 뜨면 그때 알려줘.\n\n'
        + '확인(✓)하면 오늘은 다시 안 떠요.';
    } else if (SYS_PHONE_PLAT[k] && phDead) {
      _c = 'dead';
      // 폰이 죽기 **전부터** 비어 있던 축은 크론을 살려도 안 돌아온다(260905 알림 리포트 실사고 봉합) — 이 알림의 입구가 got=0
      //   (= 72h 창 안에 글 0건 · scraper/sns_trends.py `_cut`)이라, 폰이 멈춘 지 72h 미만인데 여기 왔다면 **멈추기 전 (72h − 정지시간) 동안
      //   이미 0건**이었다는 뜻이다(수학적으로 확정 · 새 데이터 0). 종전 문구는 「다시 돌면 30분 안에 채워져」라고 약속해 그 축을 가렸다
      //   (실측 260905 23:22 = 인스타 정지 7h51m·72h 창 글 0 = 멈추기 전 64h+ 0건 · 폰 자체 기록 14:35 = 5계정 HTTP 401).
      //   사유는 `since`가 폰 마지막 갱신보다 **앞선** 계정만 센다 = 폰이 살아 있을 때 폰이 직접 찍은 값(러너는 폰 신선 시 인스타 미시도 ·
      //   폰 스테일 뒤 러너 잔향은 since가 정지 이후라 자연 제외) · 3계정 이상 = 계정 사정이 아니라 세션 축(묶음 임계 관례).
      const _ageM = (ph.age_min === null || ph.age_min === undefined) ? NaN : Number(ph.age_min);
      const _phT = Date.parse(String(ph.updated || '').replace(/(\.\d{3})\d+/, '$1')) || 0;   // 마이크로초 6자리 = 사파리 Date.parse NaN → 밀리초로 절삭
      const _cv = cov[k] || {}, _snc = _cv.since || {}, _cwhy = _cv.why || {};
      const _pre = Object.keys(_snc).filter(a => (Date.parse(String(_snc[a] || '')) || Infinity) < _phT && /^(401|403|wall)$/.test(String(_cwhy[a])));
      const _preDead = !SYS_CK_QUIET[k] && !!(_cv.reg && !_cv.got && _ageM >= 0 && _ageM < 3 * 24 * 60);   // 쿠키 알림 끈 축 = 「멈추기 전부터 0건 → 쿠키 갈아라」 문단 생략
      const _sess = _preDead && _pre.length >= 3;
      text = head + '폰 수집기가 ' + _sysDurKo(ph.age_min) + '째 멈춰 있어서예요.\n\n'
        + '스레드·인스타는 폰에서만 걷혀요(메타가 서버 IP를 막아서 서버가 대신 못 해요).\n\n'
        + (_preDead ? ('⚠ 그런데 ' + SYS_PLAT_KO[k] + '은 폰이 멈추기 전부터 이미 ' + _sysDurKo(3 * 24 * 60 - _ageM) + ' 넘게 0건이었어'
            + (_sess ? (' — 폰이 살아 있을 때 ' + _pre.length + '계정이 세션 거절(HTTP 401·403)로 끝났어. 크론을 살려도 이 축은 안 돌아와.')
                     : ' — 사유 기록은 없어. 크론이 살아난 다음 회차 알림이 사유를 말해 줄 거야.') + '\n\n') : '')
        + '👉 네가 할 일: 폰에서 phone_subs 크론이 도는지 확인해 줘 — termux(또는 맥) 앱이 꺼졌거나 절전에 잠든 게 제일 흔한 원인이야. '
        + (_sess ? ('그리고 ' + SYS_PLAT_KO[k] + ' 부계정(본계 말고 — 자동화 감지 밴) 세션쿠키를 폰 크론 환경변수 ' + SYS_PHONE_PLAT[k] + '에 새로 뽑아 갈아 줘 — 발급 브라우저의 사용자 에이전트도 ' + _uaEnv + '에 짝으로(둘 중 하나만 갈면 또 어긋나). 크론만 살리면 ' + SYS_PLAT_KO[k] + '은 그대로 0건이야.')
                 : '다시 돌기 시작하면 30분 안에 저절로 채워져.') + '\n\n'
        + '확인(✓)하면 오늘은 다시 안 떠요.';
    } else if (SYS_PHONE_PLAT[k] && _try.filter(v => v === 'alien').length * 2 > _try.length) {
      // 쿠키 오염(260804 2차) — 수집기가 페이지를 **정상 수신**했는데 프로필 대신 추천 피드가 실려 본인 글이 0건.
      //   수집기는 이 회차에 이미 게스트로 1회 더 두드렸고(scraper/sns_trends.py threads_subs 게스트 폴백),
      //   그것마저 0건일 때만 여기까지 온다 → 조치는 "쿠키를 갈아라"가 아니라 **빼라**(게스트가 정상 경로).
      // 조치 = **세션-UA 짝**(260805 개정 · 운영자 "알림을 안뜨게할거면 애초에 앱을 삭제해버리지").
      //   ⚠ 구 문구 "환경변수를 지워 줘(쿠키 없이 걷는 게 정상 경로)"는 **로그인 수집 기능 자체를 포기하는 안내**였다.
      //     쿠키를 넣은 목적(로그인 상태로 더 정확히·더 많이 걷기)은 유효한데, 고장난 건 쿠키가 아니라
      //     UA 짝의 부재다 — 메타는 세션을 발급 브라우저 UA에 묶고(260729 인스타 실측 「useragent mismatch」),
      //     그 봉합이 스레드엔 이식되지 않아 쿠키가 매번 무소득이었다(260805 실측 = 등록 5계정 전건).
      //     빼면 기능 상실 · 갈아끼우면 같은 자리 재발("또 고치고 또 알림오고") → 짝을 맞추는 게 유일한 종결.
      //   문구는 서버 로그(scraper/sns_trends.py threads_subs `_fix`)와 **같은 말**이라야 한다 = 두 표면 동기.
      _c = 'alien';
      text = head + '로그인 상태 응답이 프로필 대신 추천 피드를 주고 있어요(막힌 게 아니라 엉뚱한 걸 받는 중).\n\n'
        + '세션 쿠키가 발급된 브라우저와 다른 신분증으로 두드려서 그래요 — 메타는 쿠키를 뽑은 그 브라우저에 세션을 묶어 둬요.\n\n'
        + '👉 네가 할 일: 쿠키를 뽑은 그 브라우저의 주소창에 chrome://version 을 치면 나오는 사용자 에이전트 한 줄을 통째로 복사해서, 폰 크론 환경변수 THREADS_UA 에 넣어 줘. '
        + SYS_PHONE_PLAT[k] + '(쿠키)와 THREADS_UA(신분증)는 **한 쌍**이라 둘 중 하나만 갈면 또 어긋나 — 다시 뽑을 땐 같은 브라우저에서 둘을 같이 뽑아 줘. '
        + '쿠키를 빼는 건 답이 아니야(로그인으로 걷는 기능을 통째로 버리는 거라).\n\n'
        + '확인(✓)하면 오늘은 다시 안 떠요.';
    } else if (SYS_PHONE_PLAT[k] && (_wallN + _sessN) * 2 > _try.length) {
      // 'wall'(스레드 HTML 로그인월) ∪ 401·403(인스타 API 세션 거절) = 같은 조치(쿠키+UA 짝) · 문구만 코드별로 가른다(위 _sessN 주석).
      _c = 'wall';
      text = head + '폰 수집기는 도는데 ' + (_sessN > _wallN ? ('메타가 세션 쿠키를 거절(HTTP ' + (_try.indexOf('401') >= 0 ? '401' : '403') + ')해서') : '메타 로그인월에 막혀') + ' 0건이에요.\n\n'
        + '👉 네가 할 일: ' + SYS_PLAT_KO[k] + ' 부계정(본계 말고 — 자동화 감지 밴) 세션쿠키를 폰 크론 환경변수 ' + SYS_PHONE_PLAT[k] + '에 넣어 줘. '
        + '전에 넣어둔 쿠키가 만료된 걸 수도 있어 — 그럼 새로 뽑아서 갈아 주고, 발급 브라우저의 사용자 에이전트도 ' + _uaEnv + '에 짝으로 넣어 줘(둘 중 하나만 갈면 또 어긋나).\n\n'
        + '확인(✓)하면 오늘은 다시 안 떠요.';
    } else if (SYS_PHONE_PLAT[k]) {
      // 로그인월도 추천 피드도 아님 = 페이지는 정상인데 **글 노드가 0**(레이아웃 개편·파서 노후·정상 침묵).
      //   ⚠ 종전엔 이 자리가 없어서 사유 불문 위 'wall' 문구가 나갔다 — 260804 실사고(why 전건 'empty')에
      //   "쿠키를 갈아 줘"라는 헛 조치를 시킨 근원. 원인이 코드 축이면 👉를 안 붙인다(알림 리포트가 '클로드가 볼 일'로 자동 분류).
      _c = 'nodes';
      text = head + '페이지는 정상으로 받아왔는데(로그인월 아님) 글 노드가 0건이에요 — 레이아웃 개편으로 파서가 낡았거나, 등록 계정이 24시간 안에 글을 안 썼을 때 이래요.\n\n'
        + '네가 할 일은 없어. 쿠키는 건드리지 마 — 이건 코드 축이야(scraper/sns_trends.py threads_subs 파서).\n\n'
        + '확인(✓)하면 오늘은 다시 안 떠요.';
    } else {
      // 러너 축(X·틱톡·유튜브) = 0건의 **실제 사유**를 말한다(운영자 261020). 새 글이 없을 뿐인 회차는 위 filter(quiet·got)에서
      //   이미 빠졌다 = 여기 온 건 조회 자체가 실패한 회차다. 종전 문구 「등록한 계정 글이 0건」은 실패를 '새 글 없음'처럼 읽게 해
      //   261013~261020 틱톡 임베드 503(표본 178회 중 95회)을 운영자가 「새 게시물이 없다는 뜻이면 알림 끄자」로 읽었다.
      //   사유 = 이번 회차 run_fail 우선(이월분 무관) → 없으면 why(구데이터) · 갈래 태그를 id에 문다(조치가 다른 사유끼리 ✓ 공유 금지 · C-D4) — 5xx = 종전 'srv' 그대로.
      const _c0 = cov[k] || {}, _rf = (_c0.run_fail && typeof _c0.run_fail === 'object') ? _c0.run_fail : {};
      const _fk = subFailKo(k, Object.values(Object.keys(_rf).length ? _rf : (_c0.why || {})));
      if (_fk) {
        _c = _fk.k;
        text = head + _fk.t + ' — 새 글이 없어서가 아니라 조회 자체가 실패한 거예요(화면에 남은 글은 이전 수집분).\n\n'
          + (_fk.k === 'gone' ? '👉 네가 할 일: 설정에서 이 계정을 지우거나 새 아이디로 고쳐 줘. 그대로 두면 계속 빈자리로 남아요.'
            : _fk.k === 'nolist' ? '👉 네가 할 일: 없어요. 계정을 지우지 마 — 계정은 멀쩡해. 이 알림 리포트를 클로드에게 넘겨 줘.'
            : '👉 네가 할 일: 없어요. 서버가 30분마다 알아서 다시 시도해요. 며칠째 계속 뜨면 그때 알려줘.') + '\n\n'
          + '확인(✓)하면 오늘은 다시 안 떠요.';
      } else {
        text = head + '등록한 계정 글이 이번 수집에서 0건이라 큐레이션이 비어요.\n\n'
          + '이건 서버가 30분마다 알아서 다시 시도해 — 네가 할 일은 없어. 며칠째 계속 뜨면 등록한 계정이 비공개·삭제됐는지만 확인해 줘.\n\n'
          + '확인(✓)하면 오늘은 다시 안 떠요.';
      }
    }
    if (SYS_CK_QUIET[k] && SYS_CK_CODES.test(_c)) return null;   // 쿠키 조치 알림 끈 축(SYS_CK_QUIET)
    return { id: 'sys:subs:' + k + ':' + _c + ':' + day, _sys: true, level: 'warn', t: Date.parse(up) || undefined, text };   // 시간 = epoch(t) 축 = shellUpdMsg 정본 계승 → qAgo 상대시간("5시간 전") · 구 ts 문자열 축은 msgAgo의 `/[+Z]$/` 판정이 "+09:00"의 끝문자 '0'에 걸려 파싱 실패 → 원문 ISO가 시간 칸을 넘쳐 옆 열을 덮던 원인(운영자 260725 스샷)
  }).filter(Boolean);
  // 레딧(운영자 260727 "이거 못받아올때, 메세지 오게 할 수있나? 지금 만들어진 틀 안에서") — 문법·id·✓축·구분·기어 극보수색 전부 위 계승, 다른 건 **판정 소스 하나**.
  //   ⚠ 레딧은 계정 축이 아니라 서브레딧 축이라 `health.subs.stale`에 영영 안 잡힌다. `health.reddit`도 못 쓴다 —
  //     러너는 레딧 게이트가 꺼져 있어(`off:true` 상주) 그 필드는 "러너가 안 함"만 뜻하고, 실제 공급은 폰이다(260727 실측).
  //   → **데이터 유무로 직접 판정** + 폰이 살아 있을 때만(폰이 죽었으면 폰 알림이 이미 원인을 말하므로 중복 고지 억제).
  // 부분 실패(운영자 260727 "재발 방지 대책") — 위 stale은 **전멸(0건)만** 잡는다. 등록 11계정 중 8개만 걷혀도
  //   조용하던 사각(260727 판례: 틱톡 403 3계정이 며칠째 누락인데 화면·알림 어디에도 흔적 0).
  //   소스 = `health.subs.cover` = [수집 성공 계정 수, 등록 계정 수](수집기가 세어 실어 보냄 = 새 콜 0).
  //   임계 = **등록의 80% 미만**. 계정 1~2개가 비공개·삭제되는 정상 이탈에는 안 울리고(11 중 10·9 = 91%·82% = 침묵),
  //   3개 이상 빠지면(73%) 잡힌다 = 260727 실제 사고를 재현 가능한 선. 전멸(got=0)은 stale이 담당하므로 제외(중복 억제).
  //   **건별 분해**(운영자 260727 "사고는 다 개별건 건별로 · 10개 터지면 10개 각각 사고임") — 한 줄로 뭉치면 ✓ 한 번에
  //   여러 계정이 같이 침묵한다. 계정마다 원인이 다를 수 있어(삭제 / 비공개 / 그 계정만 차단) **빠진 계정 하나 = 알림 하나**,
  //   id도 계정을 물어(`sys:acct:<플랫폼>:<계정>:<날짜>`) ✓·재고지가 계정별로 독립한다. 전멸은 원인이 공통이라 위 stale이 1건으로 담당.
  for (const k of Object.keys(cov)) {
    const c = cov[k] || {}, got = c.got | 0, reg = c.reg | 0, miss = Array.isArray(c.miss) ? c.miss : [];
    if (!SYS_PLAT_KO[k] || !reg || !got) continue;   // 전멸(got=0) = stale 담당(중복 억제)
    const why = (c.why && typeof c.why === 'object') ? c.why : {};
    // 자동복구 사유의 **경과 시간** 축(운영자 260803 "알림이 안와도 되는거면 안오게") — 소스 = cover.since
    //   (= 연속 실패 시작 KST · scraper/sns_trends.py가 streak와 같은 규약으로 실어 보냄 · 새 데이터 콜 0).
    //   구 데이터(since 없음) = 0 = 침묵 → 다음 런이 시계를 심는다(승격이 최대 한 번 늦어질 뿐, 사유가 살아 있으면 반드시 뜬다).
    const snc = (c.since && typeof c.since === 'object') ? c.since : {};
    const _elapH = a => { const t = Date.parse(String(snc[String(a)] || '')); return t ? Math.max(0, (Date.now() - t) / 3600e3) : 0; };
    const _dayKo = h => (h >= 48 ? Math.floor(h / 24) + '일' : Math.round(h) + '시간');
    const _AUTO_H = 48;   // 승격 임계(시간) — 폰 축 무소득 승격(scripts/phone_subs.py INSTA_STUCK_H 기본 48h)과 같은 값 = 두 축 규약 정합
    // 커버율 게이트 = 80% 이상이면 정상 이탈 범위 = 침묵. **단 장기 연속 실패(since ≥48h)는 예외로 통과**한다.
    //   ⚠ 260805 실사고 = 260727에 봉합한 그 사고가 **분모가 커져 되살아났다**. 그때 판례는 "틱톡 403 3계정이 며칠째
    //     누락인데 화면·알림 어디에도 흔적 0"이고 봉합은 비율 임계(80%)였다 — 등록 11개 중 3개 = 73% = 검출.
    //     260805 실측은 **같은 플랫폼·같은 사유·같은 3계정**(@g_i_dle·@kleague·@formula1 전건 403 · since 08-03 01:47 =
    //     64시간)인데 등록이 38개로 늘어 35/38 = 92.1% = 게이트가 통째로 삼켰다. 비율만 보는 축은 구독이 늘수록
    //     같은 크기의 사고가 조용해진다 = 봉합이 시간이 지나면 저절로 풀리는 구조였다.
    //   → 시간 축을 병렬 OR로 세운다. 아래 승격 로직이 이미 `since` 48h를 재고 있는데(_AUTO_H), 그 앞에 선 비율
    //     게이트가 도달 자체를 막아 **승격 축이 사문화**돼 있던 것을 잇는 것 = 새 임계 창작 0(같은 48h 재사용).
    //   은폐 아님 = 비율이 낮으면 종전대로 즉시 통과(이 줄은 침묵을 **풀기만** 한다) · 소음 0 = 48h 미만은 종전과 동일.
    if (got * 5 >= reg * 4 && !miss.some(a => _elapH(a) >= _AUTO_H)) continue;
    // 같은 사유끼리 묶는다(260728 판례 = 알림 42건 폭탄 · 유튜브 20계정 동시 404) — 한 플랫폼에서 **같은 코드가 3건 이상**이면
    //   계정마다 사정이 있는 게 아니라 **수집 경로가 통째로 막힌 것**이다(@CNN·@BBCNews·@MrBeast가 한날 같이 삭제될 수 없다).
    //   그런데 종전 문구는 404를 곧이곧대로 "삭제됐으니 설정에서 지워 줘"로 옮겨 **멀쩡한 구독 20개를 지우라고 시켰다** = 최악의 오지시.
    //   → 묶음 1건으로 바꾸고 조치도 "지우지 마"로 뒤집는다. 1~2건 = 종전대로 계정별(진짜 개별 이탈 = 지우는 게 맞다).
    // 사유 미기록(why 키 부재) = 실패 근거가 없는 것이라 **사고로 단정하지 않는다** — 종전 폴백 문구가
    //   "비공개·삭제됐거나 차단당한 거예요"라고 단정해 근거 없는 지목을 찍어내던 자리(260728 리포트 16건).
    const grp = {};
    for (const a of miss) { const g = (why[a] === undefined || why[a] === null || why[a] === '') ? '' : String(why[a]); (grp[g] || (grp[g] = [])).push(a); }
    if (SYS_CK_QUIET[k]) for (const g of Object.keys(grp)) if (SYS_CK_CODES.test(g)) delete grp[g];   // 쿠키 조치 알림 끈 축 = 계정별 쿠키·차단 사유도 침묵
    for (const g of Object.keys(grp)) {
      const accs = grp[g], w = why[accs[0]], wn = (typeof w === 'number') ? w : 0, many = accs.length >= 3;
      // 원인별 문구(운영자 260727 "계정때문에 안받아와지는거랑 원인에 따라 메세지를 달리 해줄수있어?") —
      //   조치 주체가 갈리는 게 핵심: **404·410 단건 = 네 계정 목록 문제**(지워야 함) / 대량·403·429·wall = 플랫폼 축(기다리면 됨).
      let cause, todo;
      if (!g) {
        if (!many) continue;   // 1~2개 = 정상 이탈 범위 = 침묵(종전 임계 정신 계승)
        cause = '왜 빠졌는지 기록이 없어요 — 수집은 됐는데 상위권에 못 들었거나, 이번 회차에 시도되지 않은 거예요.';
        todo = '👉 네가 할 일: 없어요. 계정이 잘못됐다는 뜻이 아니니 지우지 마. 며칠째 계속 뜨면 그때 알려줘.';
      } else if (w === 'gone' || w === 'nolist') {
        // 틱톡 임베드 [1차 실측] 2종(260806 봉합 · scraper/sns_trends.py tiktok_subs) — 종전엔 ①이 HTTP 200을
        //   받아도 무기록으로 ②(tikwm)로 흘렀고 ②는 260714부터 **전 계정 상시 403**이라 사유가 계정 불문 403으로
        //   덮였다 → 이 화면이 3일째 "틱톡이 막았다 · 기다리면 풀린다"고 말했는데 실측은 정반대였다.
        //   조치 주체가 정확히 갈린다: gone = 계정이 실제로 없음(운영자가 지우거나 고쳐야 함) /
        //   nolist = 계정은 살아있는데 임베드가 영상을 0건 준다(수집 경로 축 = 코드).
        cause = (w === 'gone')
          ? ('이 계정이 ' + SYS_PLAT_KO[k] + '에 없어요 — 삭제됐거나 아이디를 바꾼 거예요(프로필 자체가 안 열려요).')
          : ('계정은 살아있는데(프로필은 열려요) 영상 목록만 0건으로 와요 — 계정이 막힌 게 아니라 영상을 가져오는 창구가 안 주는 거예요.'
             + (many ? ' 계정 ' + accs.length + '개가 같은 상태예요.' : ''));
        todo = (w === 'gone')
          ? '👉 네가 할 일: 설정에서 이 계정을 지우거나 새 아이디로 고쳐 줘. 그대로 두면 계속 빈자리로 남아요.'
          : '👉 네가 할 일: 없어요. 계정을 지우지 마 — 계정은 멀쩡해. 이 알림 리포트를 클로드에게 넘겨 줘.';
      } else if (wn === 404 || wn === 410 || w === 'resolve') {
        cause = many
          ? (SYS_PLAT_KO[k] + '이(가) 등록 계정 ' + accs.length + '개를 한꺼번에 "없는 계정"이라고 답했어요. 계정이 한날 그렇게 많이 사라질 수는 없어요 — 계정 문제가 아니라 수집하는 서버 주소(IP)가 막힌 거예요.')
          : (w === 'resolve' ? '이 계정의 채널 주소를 못 읽었어요(프로필 페이지가 안 열렸어요).' : '이 계정이 없어졌어요 — 삭제됐거나 아이디를 바꾼 거예요.');
        todo = many
          ? '👉 네가 할 일: 없어요. 계정을 지우지 마 — 지우면 멀쩡한 구독이 통째로 날아가요. 며칠째 계속 뜨면 그때 알려줘.'   // ⚠ 마크다운 금지 — 상세는 textContent라 별표가 그대로 보인다(260727 판례 재발 방지)
          : (w === 'resolve' ? '👉 네가 할 일: 없어요. 다음 수집에 자동으로 다시 시도해요.'
                             : '👉 네가 할 일: 설정에서 이 계정을 지우거나 새 아이디로 고쳐 줘. 그대로 두면 계속 빈자리로 남아요.');
      } else if (wn === 401 || wn === 403 || w === 'wall') {
        cause = many
          ? (SYS_PLAT_KO[k] + '이(가) 계정 ' + accs.length + '개를 한꺼번에 막았어요 — 계정별 문제가 아니라 자동 수집 자체를 차단한 거예요.')
          : ('이 계정만 ' + SYS_PLAT_KO[k] + '이(가) 막고 있어요(비공개 전환이거나 자동 수집 차단).');
        todo = '👉 네가 할 일: 없어요. 차단은 풀리는 경우가 많아서 다음 수집에 자동으로 다시 시도해요. 며칠째면 그때 알려줘.';
      } else if (wn === 429) {
        cause = '요청이 몰려서 잠시 막혔어요(일시적).' + (many ? ' 계정 ' + accs.length + '개가 같이 막힌 걸 보니 주소(IP) 단위 제한이에요.' : '');
        todo = '👉 네가 할 일: 없어요. 잠시 뒤 자동으로 다시 걷혀요.';
      } else if (wn >= 500) {
        cause = SYS_PLAT_KO[k] + ' 쪽 서버가 오류를 냈어요(' + wn + ' — 그쪽 문제라 계정과 무관해요).';
        todo = '👉 네가 할 일: 없어요. 다음 수집에 자동으로 다시 시도해요.';
      } else if (w === 'budget' || w === 'rotate' || w === 'gap') {
        // 미시도 = 사고가 아니라 **이번 회차에 차례가 안 온 것** → 침묵(260730 적대검증 C-D3).
        //   종전엔 문구만 바꾸고 발행은 그대로여서, 회전이 정상으로 도는 런마다 miss 15건이 한 그룹으로 묶여
        //   "계정 15개가 한꺼번에 안 걷히고 있어요"(본문은 "아직 차례가 아니에요") = 자기모순 경고가 매일 1건 떴다.
        //   진짜 정체는 stale 축(got=0)과 cooldown·stuck 사유가 담당하므로 은폐 아님.
        // ⚠ 'gap' 편입(260801) — 260730에 rotate·budget만 침묵시키고 gap은 문구만 고쳐 **같은 자기모순이 그대로 남았다**
        //   (실측 리포트 260801_1639: "인스타 18개가 한꺼번에 안 걷히고 있어요" ↔ 본문 "아직 차례가 아니에요 · 할 일 없어요" · streak 전원 0).
        //   gap 도장 조건 = `last && (now-last) < _GAP`(phone_subs.py) = **90분 안에 이미 걷었다**는 뜻이라 정의상 실패가 아니다.
        //   회전이 5계정이라 20계정 중 15~18개는 항상 gap = 이 알림은 정상 동작마다 뜬다 = 순수 소음.
        continue;
      } else if (w === 'cooldown') {
        // 폰이 **일부러 쉰** 회차(scripts/phone_subs.py _skip_stamp · 260730) = 실패가 아니라 429 백오프 대기.
        //   도장이 없으면 이 자리가 러너(데센 IP) 429 잔향으로 채워져 원인이 뒤바뀐다 — 위 stale 분기와 같은 축.
        //   gap과 달리 **실제로 막혀서** 쉬는 것이라 유지한다(48h 넘기면 아래 stuck으로 승격 = 조치 고지).
        cause = '요청이 몰려 잠시 막혀서, 폰이 쉬는 중이라 이번엔 시도하지 않았어요.';
        todo = '👉 네가 할 일: 없어요. 차례가 오면 자동으로 다시 걷혀요.';
      } else if (w === 'stuck') {
        // 승격 코드(scripts/phone_subs.py · 무소득 임계 초과) = 위 stale 축과 **같은 사유**를 계정축에서 본 것.
        //   여기 오는 조건은 got>0(3일 이월이 아직 살아 있음)뿐이라 화면엔 옛 글이 남아 정상처럼 보인다 = 가장 조용한 구간 →
        //   폴백 문구("사유 코드 stuck")로 흘리지 않고 조치를 그대로 말한다(stale 축 문구와 한 축).
        cause = '이틀 넘게 한 건도 못 걷었어요 — 쉬었다 재시도하는 자동 복구로는 안 풀리는 상태예요(지금 보이는 글은 며칠 전 걷은 거예요).';
        todo = '👉 네가 할 일: ' + SYS_PLAT_KO[k] + ' 부계정 세션쿠키를 폰 크론 환경변수 ' + (SYS_PHONE_PLAT[k] || '<플랫폼>_COOKIE') + '에 새로 뽑아 갈아 줘. 자세한 조치는 위 「구독이 안 걷히고 있어요」 알림에 있어.';
      } else if (w === 'empty') {
        // 'empty' = 수집기가 페이지를 정상으로 받고 **글 노드가 없다고 판정**한 코드(sns_trends.py L1164) = 차단이 아니라 공급 공백.
        //   1~2건 = 그 계정에 새 글이 없을 뿐이라 알릴 게 없다 → 침묵(운영자 260729 · 위 무사유 `if (!many) continue` 문법 계승).
        //   3건 이상은 계정 사정이 아니라 파서가 늙은 신호라 유지한다(수집기 L1161 "data-sjs N개인데 포스트 0 = 파서 갱신 필요").
        if (!many) continue;
        cause = SYS_PLAT_KO[k] + ' 계정 ' + accs.length + '개가 한꺼번에 "글 없음"으로 나왔어요 — 계정마다 그럴 수는 없으니 읽는 방식이 낡았을 가능성이 커요.';
        todo = '👉 네가 할 일: 없어요. 계정을 지우지 마 — 며칠째 계속 뜨면 그때 알려줘.';
      } else {
        cause = '수집이 실패했어요(사유 코드 ' + g + ').';
        todo = '👉 네가 할 일: 급하지 않아요. 계속 뜨면 설정에서 이 계정이 살아있는지만 확인해 줘.';
      }
      const _tail = ' (' + SYS_PLAT_KO[k] + ' 등록 ' + reg + '개 중 ' + (reg - got) + '개 누락)';
      // ── 자동복구 사유(429·5xx·resolve) = **조치 없는 알림 = 알림 아님**(운영자 260803 "알림이 안와도 되는거면 안오게") ──
      //   위 분기가 이 사유들에 붙이는 조치문은 전부 "👉 네가 할 일: 없어요"다 = 받아도 운영자가 할 수 있는 게 0
      //   (리포트 v2도 같은 문구 규약으로 읽어 '자동 복구 대기'로 분류한다 = _rptWho).
      //   260801 봉합은 발행을 **미루기만** 했고(streak<5) 그래서 못 막았다 — 실측 260803_0038 리포트 1건 = X
      //   @economysniper0 429·streak 6(≈3시간짜리 순단)인데 "자동 복구 대기" 알림. X 신디케이션은 데센 IP 상시
      //   429 로터리라(작업이력 5116·7307) 스트릭은 시간이 흐르면 반드시 5를 넘는다 = **횟수 임계로는 영영 못 막는 축**.
      //   → 자동복구 구간엔 발행 0 · 자동복구가 **실패했다고 확정된 뒤에만**(since 48h 초과) 조치형 문구로 승격
      //     = 폰 축 'stuck' 승격(무소득 48h → 조치 고지) 정본과 같은 문법·같은 임계.
      //   은폐 아님 3중 근거: ⓐ 전멸(got=0)은 stale 축이 별도 1건으로 담당 ⓑ 48h 넘기면 여기서 반드시 뜬다(영구 묵음 0)
      //     ⓒ 404·410·403·wall·stuck 등 **조치가 있는 사유**는 이 게이트 밖 = 종전 그대로 즉시 고지.
      // 자동복구 = **무조치 축**(판정 기준 = 위 cause/todo 분기가 그 사유에 실제로 붙이는 조치문 · 260805 개정).
      //   ⚠ 401·403·wall 편입 = 주석 분류와 실제 문구의 어긋남 봉합 — 위 게이트 주석은 이 사유들을 "조치가 있는
      //     사유 = 게이트 밖 즉시 고지"로 분류했는데, 정작 그 분기가 내는 조치문은 「👉 네가 할 일: 없어요. 차단은
      //     풀리는 경우가 많아서 다음 수집에 자동으로 다시 시도해요. **며칠째면 그때 알려줘**」다 = 실질 무조치이고,
      //     '며칠'을 재는 축을 사람에게 떠넘긴 문구다(운영자 260803 "알림이 안와도 되는거면 안오게"의 정반대).
      //     → 429·5xx와 같은 축으로 넣어 시계를 코드가 잡는다: 48h 전 침묵(소음 감소) · 넘기면 승격 문구로 고지
      //     (「64시간째 안 풀렸어요 — 403 응답이 계속 와요 · 이 리포트를 클로드에게 넘겨 줘」) = 알림이 조치로 소멸.
      const _autoFix = (wn === 429 || wn === 401 || wn === 403 || wn >= 500 || w === 'resolve' || w === 'wall');
      //   ⚠ 승격문은 위 cause를 **재사용하지 않는다** — 429 cause가 "요청이 몰려서 잠시 막혔어요(일시적)"이라
      //     "2일째 안 풀렸어요"와 붙으면 한 문단 안에서 자기모순이다(실렌더 확인 260803).
      const _proWhy = (w === 'resolve') ? '프로필 페이지가 계속 안 열려요'
                    : (w === 'wall') ? '로그인월이 계속 걸려요'
                    : (wn + ' 응답이 계속 와요');   // ⚠ wall은 숫자 코드가 없다(wn=0) — 분기 없이 편입하면 "0 응답이 계속 와요" 오문구
      const _proCause = h => '자동 복구를 기다렸는데 ' + _dayKo(h) + '째 안 풀렸어요 — 잠깐 막힌 게 아니에요(' + _proWhy + ').';
      const _proTodo = many
        ? '👉 네가 할 일: 계정을 지우지 마 — 여러 개가 같이 막힌 건 계정이 아니라 수집 경로 문제야. 이 알림 리포트를 클로드에게 넘겨 줘.'
        : '👉 네가 할 일: 이 계정이 지금도 열리는지(비공개·삭제 아닌지) 한 번만 확인해 줘. 멀쩡하면 수집 경로가 막힌 거라 그대로 둬도 되고, 없어졌으면 설정에서 빼 줘.';
      if (many) {   // 묶음 1건 — id의 계정 자리에 `*사유` = ✓·재고지 축·출처 매핑(sys:acct:) 전부 종전 계승
        const _eh = accs.reduce((mx, a) => Math.max(mx, _elapH(a)), 0);   // 묶음 = 그룹 최댓값(한 계정이라도 48h 넘겼으면 그 경로는 이미 자동복구 실패)
        if (_autoFix && _eh < _AUTO_H) continue;   // 아직 자동 복구 구간 = 운영자가 할 일 0 = 발행 안 함
        out.push({ id: 'sys:acct:' + k + ':*' + (g || 'nowhy') + ':' + day, _sys: true, level: 'warn', t: Date.parse(up) || undefined,
          text: SYS_PLAT_KO[k] + ' 계정 ' + accs.length + '개가 ' + (_autoFix ? _dayKo(_eh) + '째 ' : '한꺼번에 ') + '안 걷히고 있어요.\n\n'
            + (_autoFix ? _proCause(_eh) : cause) + _tail + '\n\n안 걷힌 계정: ' + accs.map(a => '@' + a).join(', ') + '\n\n'
            + (_autoFix ? _proTodo : todo) + '\n\n확인(✓)하면 이 건은 오늘 다시 안 떠요.' });
      } else {
        // 유튜브 개별 계정 = 연속 5회 실패부터 고지(운영자 260731 "특정 유튜브 글 안 걷힘 알림은 안 오게, 5회 이상 안 걷힐 때 오게") —
        //   러너 IP 로터리 순단(500·404 한두 런 · 260731 판례 @bbcnews·@shortbox)이 날마다 개별 알림으로 새던 소음 차단.
        //   소스 = cover.streak(수집기가 런 연속 실패를 세어 실어 보냄 · 미시도는 동결이라 5 = 실제 5번 시도 5번 다 실패 ·
        //   30분 주기 기준 약 2시간 반). 진짜 삭제·개명 계정은 계속 실패해 다섯 런이면 그대로 다시 뜬다 = 지연이지 은폐 아님.
        //   묶음(같은 사유 3계정↑ = 경로 사고)·타 플랫폼 = 종전 즉시 고지 · streak 필드 없는 구 데이터 = 0 = 침묵(다음 런이 채움).
        // 플랫폼 하드코딩 해제 = **사유 기준으로 일반화**(운영자 260801 "조치할 게 없으면 그건 경고알림이 아닌데") —
        //   위 게이트가 `k === 'youtube'`로 묶여 있어, 같은 성격의 순단이 **X에서만 매 런 새 경고로 샜다**.
        //   260801 리포트 판례: X @economysniper0·@jajaja7878uu 429 · streak 2 = 한 시간짜리 순단인데 개별 경고 2건.
        //   X 신디케이션은 러너(데센 IP)가 **상시 429 로터리**라(작업이력 5116·7307 실측 "X 전 계정 429 → 런마다 확률 수집")
        //   1~2계정이 확률적으로 빠지는 게 기본값이다 = 260731이 유튜브에서 고친 그 사고와 같은 것, 플랫폼만 다르다.
        //   게이트 대상 = 조치문이 "네가 할 일: 없어요 · 자동으로 다시 시도해요"인 자동복구 사유(429 · 5xx · resolve)뿐.
        //   ⚠ cooldown·gap은 **제외** — 수집기가 미시도라 스트릭을 동결한다(sns_trends.py _NOTRY) → 넣으면 5에 영영 못 닿아
        //     영구 묵음 = 은폐. 종전대로 즉시 고지하고, 이틀 넘긴 건은 'stuck' 승격이 조치 문구로 받는다.
        //   ⚠ 404·410 단건(= 설정에서 지워라)·403·wall·stuck = 운영자 조치가 있는 사유라 지연 0으로 종전 유지.
        // ⚠ 260803 개정 — 자동복구 사유의 `streak<5` 지연 게이트는 위 시간 게이트(since 48h)로 **교체**됐다(무조치 알림 발행 0).
        //   유튜브 개별 5회 게이트(운영자 260731)는 조치가 있는 사유(404·410 등)에서만 종전대로 산다.
        //   계정별 판정 = `_eh`도 **계정마다** 잰다(묶음의 그룹 최댓값과 다른 축) — 한 그룹에 60시간짜리와 3시간짜리가
        //   섞였을 때 최댓값으로 뭉치면 3시간짜리에 "이틀째 안 풀렸어요"라는 거짓 문구가 붙는다.
        const _stk = (c.streak && typeof c.streak === 'object') ? c.streak : {};
        for (const a of accs) {
          const _n = _stk[String(a)] | 0, _eh = _elapH(a);
          if (_autoFix ? _eh < _AUTO_H : (k === 'youtube' && _n < 5)) continue;
          out.push({ id: 'sys:acct:' + k + ':' + String(a) + ':' + day, _sys: true, level: 'warn', t: Date.parse(up) || undefined,
            text: SYS_PLAT_KO[k] + ' @' + a + ' 글이 ' + (_autoFix ? _dayKo(_eh) + '째 ' : (k === 'youtube' ? _n + '회 연속 ' : '')) + '안 걷히고 있어요.\n\n'
              + (_autoFix ? _proCause(_eh) : cause) + _tail + '\n\n'
              + (k === 'youtube' ? '원래 나올 자리: 트렌드 → 큐레이션 게시물 → 「유튜브 - 구독」 카드(등록 계정 전체에서 조회수 상위 10개 안에 들 때 노출 · 지금은 이 계정 글만 빠진 채 랭킹돼요).\n\n' : '')
              + (_autoFix ? _proTodo : todo) + '\n\n확인(✓)하면 이 계정은 오늘 다시 안 떠요.' });
        }
      }
    }
  }
  const rddN = ((TRENDS && TRENDS.reddit) || []).length;
  if (!rddN && ph && ph.ok === true) {
    out.push({ id: 'sys:src:reddit:' + day, _sys: true, level: 'warn', t: Date.parse(up) || undefined,
      text: '레딧이 안 걷히고 있어요 — 폰은 도는데 레딧만 0건이에요.\n\n'
        + '레딧이 자동 수집을 막고 있을 때 이래요(403·429). 서브레딧 목록이나 계정 설정과는 무관해요.\n\n'
        + '👉 네가 할 일: 없어요. 서버가 다음 수집부터 다른 경로(RSS)로 다시 시도해요. 며칠째 계속 뜨면 그때 알려줘.\n\n'
        + '확인(✓)하면 오늘은 다시 안 떠요.' });
  }
  return out;
}
// 인구통계 기준일 밀림(운영자 260726 "채널이나 소셜 요약 위에 항상 동기화 시점이 있고, 그 시점을 못 따라가면 설정에서 경고 하게 되어있거든? 그거에 로직을 붙이면 됨") —
//   문법·id·✓축·구분 = 바로 위 sysErrMsgs() **그대로**(새 부품·새 데이터·새 UI 0). 다른 건 소스 하나 = 화면이 이미 읽는 audience_sample.as_of(기준일) vs 그 소스의 동기화 시점(generated_kst).
//   왜 = FB 성별·연령은 메타가 2025-11-15 지표를 폐지해 자동 수집이 죽었다(260726 라이브 실측 = 후보 4종 전부 "(#100) valid insights metric") → 화면 값이 수기 스냅샷이라 날이 갈수록 뒤처지는데,
//        화면만 보면 오늘 자동수집분(IG)과 같은 모양으로 나란히 떠서 둘 다 최신처럼 읽힌다. 딱지를 새로 다는 대신 이미 있는 경고 채널로 고지(운영자 지시).
//   id에 **기준일**을 물려 = ✓ 하면 그 기준값 동안 침묵 · 값이 갱신되면(as_of 변경) 다시 밀릴 때 새 id로 재고지(영구 묵음 = 은폐라 금지 · sysErrMsgs의 '수집일자' 문법을 이 축 성격[일 단위로 안 바뀌는 lifetime 스냅샷]에 맞춘 것).
//   ⚠ 고정 스냅샷 예외(운영자 260726 밤 개정) — "FB 연령 스샷 항상 못 줘 · 어제 준 게 처음이자 당분간 마지막 · 계속 요구하면 갱신 안 하는 거로 하고 알람도 그거 따라가라".
//     → audience_sample.pinned(fb_audience.json에서 계승) 또는 src=manual = **수기 고정 소스**엔 경고를 안 띄운다(고정값이 뒤처지는 건 정상이지 고장이 아니라 경보 = 오탐 · 계속 재고지 = 운영자가 못 줄 스샷을 조르는 꼴).
//     경고는 이제 '**자동** 수집이 뒤처짐'에만 발동(auto 소스 = src가 api(…) · IG가 대표) — 자동 탐침(_demo_probe)이 살아나 API값을 채택하면 src가 바뀌어 pinned 무관하게 최신화·재판정된다.
const DEMO_SRC_KO = { ig: '인스타그램', fb: '페이스북' };
const DEMO_STALE_D = 2;   // 기준일이 동기화 시점보다 2일 이상 뒤 = 경고(인구통계 = lifetime 축이라 하루 지연은 정상 · 자동 수집이 살아 있으면 lag 0이라 미발동)
function demoStaleMsgs() {
  const out = [];
  for (const pair of [['ig', CHAN], ['fb', CHAN_FB]]) {
    const k = pair[0], dd = pair[1] || null;
    const aud = (dd || {}).audience_sample || {};
    if (aud.pinned || /^manual/.test(String(aud.src || ''))) continue;   // 수기 고정 소스 = 경보 억제(운영자 260726 밤 · 위 ⚠) — 갱신 안 함이 의도라 '옛 기준' 경고는 오탐
    const as = String(aud.as_of || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(as)) continue;   // 기준일 없는 구 데이터 = 조용(판정 불가에 경보 = 오탐)
    const sync = Date.parse(dd.generated_kst || '') || Date.now();
    const lag = Math.floor((sync - Date.parse(as + 'T00:00:00+09:00')) / 86400000);
    if (!(lag >= DEMO_STALE_D)) continue;
    out.push({ id: 'sys:demo:' + k + ':' + as, _sys: true, level: 'warn', t: sync,   // 시간 = epoch(t) = shellUpdMsg 정본 계승(qAgo 상대시간)
      text: DEMO_SRC_KO[k] + ' 성별·연령이 옛 기준이에요 — 화면 값은 ' + as + ' 기준(' + lag + '일 전)이라 동기화 시점을 못 따라가요. 확인(✓)하면 기준이 바뀔 때까지 다시 안 떠요.' });
  }
  return out;
}
// ⑭ 지진 = 경고 알림(운영자 260802 "지진같은경우는 그 경고 알림처럼 웹앱 알림 뜨게 · 포그라운드 알림도 · 일반 긴급 뉴스랑 동급 · 누르면 안전 탭으로 이동").
//   문법·id·✓축·구분 = 바로 위 demoStaleMsgs() **그대로**(새 부품·새 데이터·새 UI 0) — 소스 = 화면이 이미 읽는 TRENDS.disaster.
//   발동 = kind '지진' 한정. 폭염·호우까지 기기 알림을 울리면 여름엔 매시간 울려 알림 자체가 무시된다(= "긴급 뉴스와 동급" 취지의 정반대).
//   ✓(md dismiss)로 그 지진 1건만 묵음 — id에 발령시각을 물려 **다음 지진은 새 id**라 영구 묵음이 안 된다(demoStaleMsgs 규약 계승).
const QUAKE_TTL_H = 12;   // 12시간 지난 지진 = 무발동(옛 스냅샷으로 부팅할 때 유령 경보 차단 · staleDataMsg와 같은 성격)
// 규모 문턱 = **국내·해외 분리**(운영자 260803 "해외건, 국내건 차이가 많이 나야해 · 해외 6 이상 · 국내 3.5 이상 · 3도 좀 애매해").
//   왜 갈랐나 = 같은 규모라도 체감·보도가치가 완전히 다르다. 국내 3.5는 사람이 느끼고 기사가 뜨지만, 해외 3.5는 뉴스조차 안 된다.
//   구 단일 3.0 = 국내 기준으로도 애매하고(운영자) 해외엔 터무니없이 낮아 알림이 소음이 되던 값.
//   해외 판정 = 수집기 intl 플래그(sns_trends.DIS_INTL_RE = 본문 국가·해역명 · 정본 1곳) · 구 데이터 폴백 = 아래 QUAKE_INTL_RE.
//   ⚠ 판정 실패 = 국내 취급 = **낮은 문턱** = 더 잘 울린다(안전 축은 놓침이 헛알림보다 비싸다 · fail-open 계승).
const QUAKE_MIN_KR = 3.5;    // 국내 문턱(운영자 260803 · 구 3.0)
const QUAKE_MIN_INTL = 6.0;  // 해외 문턱 — 이 아래는 국내에 아무 영향이 없어 '긴급 뉴스와 동급'이 성립하지 않는다
const QUAKE_INTL_RE = /일본|중국|대만|필리핀|인도네시아|러시아|미국|캐나다|멕시코|칠레|페루|튀르키예|터키|그리스|이탈리아|네팔|인도|파키스탄|이란|뉴질랜드|파푸아|바누아투|통가|알래스카|캄차카|쿠릴|오키나와|규슈|혼슈|홋카이도|국외|해외/;
const quakeMinMag = d => ((d && d.intl != null) ? !!d.intl : QUAKE_INTL_RE.test(String((d && d.text) || '') + ' ' + String((d && d.title) || ''))) ? QUAKE_MIN_INTL : QUAKE_MIN_KR;
function quakeMsgs() {
  const dl = (TRENDS && TRENDS.disaster) || [], now = Date.now(), out = [];
  for (const d of (Array.isArray(dl) ? dl : [])) {
    if (!d || d.kind !== '지진') continue;
    // 규모 = 라벨(「지진 (규모 3.4)」)·원문 어느 쪽에서든 첫 숫자. ⚠ 규모를 못 읽으면 **울린다**(fail-open) —
    //   안전 축은 헛알림보다 '놓침'이 훨씬 비싸다. 지진 재난문자는 관례상 규모를 싣지만 그걸 전제로 묵음하지 않는다.
    const mg = parseFloat((String(d.title || '') + ' ' + String(d.text || '')).match(/규모\s*([0-9]+\.?[0-9]*)/)?.[1]);
    if (Number.isFinite(mg) && mg < quakeMinMag(d)) continue;   // 국내 3.5 / 해외 6.0(운영자 260803) — 규모 미상은 종전대로 fail-open(울린다)
    const t = Date.parse(d.time || '') || 0;
    if (!t || now - t > QUAKE_TTL_H * 3600e3) continue;
    out.push({ id: 'sys:quake:' + (d.time || ''), _sys: true, level: 'warn', t, action: 'quake-go',
      // why = **발화를 가른 값**(리포트 «발화 근거» 행 · 260805 신설) — 세션이 코드를 거슬러 올라가지 않고 판정을 바로 읽게 한다.
      why: '규모 ' + (Number.isFinite(mg) ? mg : '미상(fail-open)') + ' ≥ 문턱 ' + quakeMinMag(d) + (d.intl ? '(해외)' : '(국내)'),
      text: (d.title || '지진') + ' — ' + (d.area || '') + (d.text ? '\n' + d.text : '') });
  }
  return out;
}
// ⑭-i 화재·지진 추적 상태(운영자 260803 6차 "추적기가 지금 무엇을 보고 있는지 화면에 · 기계가 이 건을 놓쳤나를 확인").
//   소스 = viewer/fire_watch.json(빌드가 push/fire_watch.json 원장에서 구운 표시용 사본 · messages.json 선례) — 새 수집 0.
//   매칭 = 사건키 재구현 대신 **원장이 실어준 t0·kind·area** 로 대조(광역 ∧ 유형 ∧ 45분 이내) = 서버 event_key 와 같은 규칙.
//     ⚠ 매칭 실패 = 칩 없음(조용한 공백) — '추적 중'을 추측으로 표시하면 화면이 거짓말을 한다.
let FWATCH = [];
const FW_GAP_MS = 45 * 60e3;   // scraper/fire_watch.EVENT_GAP_MIN 동값 — 같은 불의 인접 구 발령을 한 사건으로 보는 창
const fwWide = s => String(s || '').replace(/(특별자치도|특별자치시|특별시|광역시|자치도|자치시).*$/, '').split(/\s+/)[0] || '';
function fwOf(d) {   // 이 재난문자에 걸린 추적 항목(없으면 null)
  if (!d || !Array.isArray(FWATCH) || !FWATCH.length) return null;
  const t = Date.parse(d.time || '') || 0; if (!t) return null;
  const w = fwWide(d.area), k = d.kind || '';
  return FWATCH.find(f => f && f.kind === k && fwWide(f.area) === w && Math.abs((f.t0 || 0) * 1000 - t) <= FW_GAP_MS) || null;
}
// 상태 칩 = 「무엇을 보고 있나」 한 줄. 부품·값 = .tcard-ago(.fresh24) 정본 사본(pill·--sp-1·--r-pill·--accent-4 음영) = 새 색·새 도형 0.
function fwChip(d) {
  const f = fwOf(d); if (!f) return '';
  if (f.picked) return `<span class="fw-chip on">${esc(f.sig === 'scale' ? '대형화재 · 큐 넘김' : '사상자 확인 · 큐 넘김')}</span>`;
  const min = Math.max(0, Math.round((Date.now() - (f.t0 || 0) * 1000) / 60000));
  return `<span class="fw-chip">추적 중 ${min}분${f.grade === 'LO' ? '' : ''}</span>`;   // 등급은 창 길이일 뿐 = 화면 문구로 안 낸다(운영자가 읽을 정보는 '보고 있다'와 '넘겼다' 둘)
}
// ⑭-d 지진·화재급 판정(운영자 260803 "지진, 화재 급은 골드노랑") — 골드 표기·아래 fireMsgs 공용 단일 술어.
//   1순위 = 수집기 crit 플래그(sns_trends.DIS_CRIT_MIN 77 = 산불 이상 · 정본은 서버 1곳).
//   2·3순위 = **구 데이터 폴백**뿐 — 배포 직후 sns_trends.json엔 crit이 없고(다음 수집에 채워짐), 폰 축 구스키마는 sev도 없다.
//   ⚠ 아래 유형 목록은 서버 DIS_KIND_RANK≥77의 사본이 아니라 '폴백용 최소집합'이다(드리프트 나도 crit이 오면 그게 이긴다).
const DIS_CRIT_KIND = /지진|해일|화재|산불|폭발|붕괴|방사능|방사성|테러|민방공|화생방|공습|경계경보|핵/;
function disCrit(d) {
  if (!d) return false;
  if (d.crit != null) return !!d.crit;                                   // 신규 수집분 = 서버 판정 그대로
  const sev = Number(d.sev); if (Number.isFinite(sev) && sev > 0) return Math.floor((sev % 1000) / 10) >= 77;   // sev 역산(= level*1000 + rank*10 + gr)
  return DIS_CRIT_KIND.test(String(d.kind || '') + ' ' + String(d.title || ''));   // 라벨·유형 텍스트(구 폰 축 = title이 본문 원문)
}
// ⑭-e 랜드마크 화재 = 즉시 긴급알림(운영자 260803 "특정 유명건물, 문화유산, 고위공직처, 유명인, 지자체 대표 공공기관 등의 화재같은 경우에는 바로 긴급알림").
//   문법·id·✓축·구분·TTL = 바로 위 quakeMsgs() **그대로**(새 부품·새 데이터·새 UI 0) · 착지도 같은 action 'quake-go'(안전 탭).
//   왜 지진과 갈랐나 = 지진은 '규모'라는 세기 문턱으로 거르지만, 이 축은 **작아도 전국 뉴스가 되는 장소**라 세기 문턱이 없다(숭례문 = 안전안내 등급이어도 속보).
//   발동 = 지진·화재급(disCrit) ∧ 수집기 랜드마크 매치(lm). lm은 서버 판정(DIS_LANDMARK·DIS_GOV_RE) — 뷰어는 사전을 복제하지 않는다(정본 1곳).
//   ⚠ 구 데이터(lm 없음) = 미발동 = 종전 동작 그대로(경보를 '추정'으로 울리지 않는다 · 다음 수집이 채운다).
const FIRE_TTL_H = 12;   // quakeMsgs QUAKE_TTL_H 동값 — 옛 스냅샷 부팅 시 유령 경보 차단
// ⚠ 2층 검문 = 서버가 준 lm 이 **말미 발신 서명을 걷어낸 본문에 실제로 있는가**(260805 유령 경보 봉합).
//   왜 필요한가 = lm 은 **수집 시점에 항목에 박제**된다(sns_trends.py `"lm": disaster_landmark(msg)` · 생산자 2곳 = disaster()·disaster_km()).
//   그래서 서버 판정을 고쳐도 **이미 구워진 데이터**는 옛 판정을 그대로 들고 남고, fireMsgs 는 매 렌더 그 값을 다시 읽으므로
//   TTL 12h 동안 유령 경보가 계속 재점등된다 — 실측 260805 = 서명 오탐 봉합(10363a4)이 09:37 KST 에 main 에 착지했는데도
//   07:03 발사분이 sns_trends.json 에 lm="서해구청" 으로 살아남아 10:20 리포트에 그대로 재등장했다(코드 봉합 ≠ 라이브 봉합 = [7-2] 와 같은 축).
//   데이터를 손으로 씻는 건 기계산출물 손편집 금지라 불가 → **소비 지점에서 한 번 더 본다**가 유일한 즉시 해.
//   ⚠ 사전 복제 0 = 정본 1곳 계약 유지 — 랜드마크 목록·공공기관 정규식을 뷰어가 들지 않는다. 서버가 준 문자열이 본문에
//   실존하는지만 보는 **형태 규칙 1줄**(서버 DIS_SIGN_RE 동문법)이라 서버 사전이 자라도 뷰어는 무접촉.
//   ⚠ fail-open 2종 = text 결손(구 데이터·폰 구스키마 = title 이 본문) · 300자 컷 도달(`text: msg[:300]` 이라 서명이 잘렸을 수 있다)
//   → 검문 생략 = 종전 동작. 놓침을 늘리지 않는다(실측 라이브 재난 10건 본문 75~90자 = 컷과 무관).
const DIS_SIGN_TAIL = /\[[^\[\]]{1,30}\]\s*$/;
function disBody(s) { let t = String(s || '').trim(); for (let i = 0; i < 3; i++) { const n = t.replace(DIS_SIGN_TAIL, '').trim(); if (n === t) break; t = n; } return t; }
function fireMsgs() {
  const dl = (TRENDS && TRENDS.disaster) || [], now = Date.now(), out = [];
  for (const d of (Array.isArray(dl) ? dl : [])) {
    if (!d || d.kind === '지진' || !d.lm || !disCrit(d)) continue;   // 지진 = quakeMsgs 담당(같은 건이 두 번 울리지 않게)
    const tx = String(d.text || '');
    if (tx && tx.length < 300 && !disBody(tx).includes(d.lm)) continue;   // 2층 검문 = lm 이 서명 밖 본문에 없다 = 구판 판정 잔류 = 미발동
    const t = Date.parse(d.time || '') || 0;
    if (!t || now - t > FIRE_TTL_H * 3600e3) continue;
    out.push({ id: 'sys:fire:' + (d.time || '') + ':' + d.lm, _sys: true, level: 'warn', t, action: 'quake-go',
      // why = **발화를 가른 값**(리포트 «발화 근거» 행 · 260805 신설 — 서명 오탐 진단에 세션이 20분 쓴 축의 기계화).
      //   lm 원문을 그대로 실어야 「본문의 건물인가 / 말미 발신 서명인가」를 리포트만 보고 가를 수 있다.
      why: 'lm="' + d.lm + '" ∧ crit(' + (d.kind || '') + ') — 둘 다 참이어야 발동(∧ 12h 이내)',
      text: (d.title || '화재') + ' · ' + d.lm + ' — ' + (d.area || '') + (d.text ? '\n' + d.text : '') });
  }
  return out;
}

/** 화면이 이미 읽는 자료(트렌드 · 인스타 · 페북) → 원본 allMsgs 의 계산 몫 넷(축마다 따로 · 원본 unshift 차례를 부르는 쪽이 맞춤) · 한 축이 깨지면 그 축만 빈 칸 */
export function sysMsgs(trends, chan, chanFb) {
  TRENDS = trends || null; CHAN = chan || null; CHAN_FB = chanFb || null;
  const run = (f) => { try { return f() || []; } catch (e) { return []; } };
  return { sys: run(sysErrMsgs), demo: run(demoStaleMsgs), quake: run(quakeMsgs), fire: run(fireMsgs) };
}

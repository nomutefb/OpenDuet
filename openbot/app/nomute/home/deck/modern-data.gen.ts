// @ts-nocheck
/* 만든 파일 — 손으로 고치지 말 것(home/deck/tools/gen.mjs · 옛 에디터 viewer/modern-data.js 그대로 · 끝의 붙일 자리만 인자로) */
export function installModernData(root) {
/* The home view projects existing data. It never calculates the ranking score. */
(function (root) {
  'use strict';
  const text = value => typeof value === 'string' ? value.trim() : '';
  // One parse per link string. A PICK rebuilds the projection, which reads every
  // candidate link several times; new URL() for each read held the press frame.
  // Only strings are cached (other values keep the plain parse) and the oldest
  // entry leaves first, so the map stays near the size of the live candidate pool.
  const PARSED = new Map(), PARSED_MAX = 16384;
  function parse(value) {
    const cached = typeof value === 'string' ? PARSED.get(value) : undefined;
    if (cached !== undefined) return cached;
    let entry = null;
    try {
      const u = new URL(value);
      if (['http:', 'https:'].includes(u.protocol) && !u.username && !u.password) entry = {href: u.href, host: u.hostname.replace(/^www\./, '')};
    } catch { /* not a link: entry stays null */ }
    if (typeof value === 'string') {
      if (PARSED.size >= PARSED_MAX) PARSED.delete(PARSED.keys().next().value);
      PARSED.set(value, entry);
    }
    return entry;
  }
  const url = value => parse(value)?.href || '';
  const host = value => parse(value)?.host || '';
  const urls = values => [...new Set((Array.isArray(values) ? values : []).map(url).filter(Boolean))];
  // A search-trend-only cluster legitimately has no article URL. It cannot be
  // opened as a news card, so it is skipped instead of rejecting the ranking.
  function usableCluster(c) {
    return !!c && !!text(c.title) && Number.isFinite(c.score) && Number.isInteger(c.rank) && c.rank > 0 &&
      Array.isArray(c.urls) && c.urls.length > 0 && c.urls.every(v => !!url(v)) && Array.isArray(c.items) &&
      c.items.every(i => i && typeof i.title === 'string' && typeof i.src === 'string' && (i.url == null || i.url === '' || !!url(i.url)));
  }
  function validOverlap(value) {
    const date = input => typeof input === 'string' && Number.isFinite(Date.parse(input));
    return !!value && date(value.generated) && date(value.source_generated) && Array.isArray(value.clusters) &&
      value.clusters.every(c => c && typeof c === 'object') && (!value.clusters.length || value.clusters.some(usableCluster));
  }
  // Link lists kept per source object between projections. The editor replaces
  // candidate and article objects when it reloads them and never edits their
  // links in place, so a list stays valid while the fields it was read from are
  // the same. The caller's extra links can change with the clock, so they are
  // compared on every read. Readers copy a list before changing it.
  const LINKS = new WeakMap(), ARTICLE_LINKS = new WeakMap();
  const sameList = (a, b) => a.length === b.length && a.every((value, i) => value === b[i]);
  function candidateLinks(c, extra) {
    const keep = !!c && typeof c === 'object' && Array.isArray(extra);
    const members = c.cluster_members, size = Array.isArray(members) ? members.length : -1;
    const memo = keep ? LINKS.get(c) : undefined;
    if (memo && memo.url === c.url && memo.pick === c.breaking_pick?.url && memo.members === members && memo.size === size && sameList(memo.extra, extra)) return memo.list;
    const list = urls([c.url, c.breaking_pick?.url, ...(members || []), ...extra]);
    if (keep) LINKS.set(c, {url: c.url, pick: c.breaking_pick?.url, members, size, extra: extra.slice(), list});
    return list;
  }
  function articleLinks(a) {
    const keep = !!a && typeof a === 'object', size = Array.isArray(a?.sources) ? a.sources.length : -1;
    const memo = keep ? ARTICLE_LINKS.get(a) : undefined;
    if (memo && memo.url === a.url && memo.source === a.source_url && memo.sources === a.sources && memo.size === size) return memo.list;
    const list = urls([a.url, a.source_url, ...(Array.isArray(a.sources) ? a.sources : []).map(s => typeof s === 'string' ? s : s?.url)]);
    if (keep) ARTICLE_LINKS.set(a, {url: a.url, source: a.source_url, sources: a.sources, size, list});
    return list;
  }
  // ── Feed alpha ingredients (operator 10-22 «1·2·3만 해도 꽤 괜찮은 지표 · 저거 자체로 가치» · 신선도·다양성 뺌) ──
  // They decide WHICH feed news a raised alpha lays in between the bot's cards: ① how many outlets report it (the
  // candidate's cross), ② the operator's own record (feed_alpha.json `host`/`word`: PICK·★4+ against PASS·👎·★2-, the
  // labels of docs/curation-rubric.md), ③ what the channel's views favour (feed_alpha.json `chan`: the category's median
  // views). Each becomes a rank among the rows at hand and the ranks are averaged, so no scale outweighs another. The
  // bot's score is never read or written here. alphaWords is shared with build-viewer.mjs, which counts the record.
  const PARTICLE = /(에서|으로|까지|부터|은|는|이|가|을|를|의|에|도|로|와|과)$/;
  function alphaWords(title) {
    const words = text(title).replace(/\[[^\]]*\]|\([^)]*\)/g, ' ').split(/[^0-9A-Za-z가-힣]+/)
      .map(w => w.length > 2 ? w.replace(PARTICLE, '') : w).filter(w => w.length >= 2);
    return [...new Set(words)];
  }
  function alphaOrder(candidates, profile) {
    const p = profile && typeof profile === 'object' ? profile : {}, base = Number(p.base) || 0.5;
    // [plus, minus] → PICK rate, drawn toward the overall rate by 5 judgements: an outlet seen twice does not outrank one seen 100 times.
    const rate = s => Array.isArray(s) ? (s[0] + 5 * base) / (s[0] + s[1] + 5) : null;
    function pref(c) {
      const got = [rate(p.host?.[host(c.url)]), ...alphaWords(c.title).map(w => rate(p.word?.[w]))].filter(v => v != null);
      return got.length ? got.reduce((a, b) => a + b, 0) / got.length : null;
    }
    const sets = [candidates.map(c => Number(c.cross) || 0)];
    const prefs = candidates.map(pref), chan = candidates.map(c => Number(p.chan?.[text(c.cat)]));
    if (prefs.some(v => v != null)) sets.push(prefs.map(v => v == null ? base : v));
    if (chan.some(Number.isFinite)) sets.push(chan.map(v => Number.isFinite(v) ? v : 0));
    // Rank in 0..1 with ties sharing their mean place, then the plain average of the ingredients.
    const ranks = sets.map(values => {
      const place = new Map(), span = Math.max(1, values.length - 1);
      values.slice().sort((a, b) => a - b).forEach((v, i) => place.set(v, [place.get(v)?.[0] ?? i, i]));
      return values.map(v => (place.get(v)[0] + place.get(v)[1]) / 2 / span);
    });
    return candidates.map((_, i) => ranks.reduce((sum, r) => sum + r[i], 0) / ranks.length);
  }
  // Why it is news (operator 10-25 «왜 이슈인지 나오려면»): the candidate's own counted signals as they are
  // (docs/curation-algorithm.md §3 · scraper/live_signal.py tiers). Nothing is estimated or generated here;
  // a single family (lv.t 1) is left out because one source alone is mostly noise.
  function issueSignals(c) {
    const n = v => Math.floor(Number(v) || 0), lv = c && typeof c.lv === 'object' && c.lv ? c.lv : {}, out = [];
    if (!c) return out;
    if (n(c.cross) >= 2) out.push('매체 ' + n(c.cross));
    if (n(c.burst) >= 3) out.push('15분새 ' + n(c.burst) + '곳 동시');
    if (n(c.report_count) >= 3) out.push('연속보도 ' + n(c.report_count) + '회');
    if (n(lv.t) >= 2) out.push('확산 ' + (n(lv.t) >= 3 ? '강' : '중'));
    if (n(lv.t) >= 2 && n(lv.c) >= 3) out.push('커뮤니티 ' + n(lv.c) + '곳');
    return out;
  }
  // 카드 아래 사진(운영자 261022 «유관된 이미지를 불러오는 거까진 · 가능하면 바로 적용 · 러너를 통해서»).
  // ① 유튜브 링크 → 그 영상의 썸네일(youtu.be/<id> · youtube.com/watch?v=<id> · /shorts/<id> · /embed/<id> · /live/<id>).
  const YT_ID = /^[\w-]{11}$/;
  function youtubeId(value) {
    const name = host(value);
    if (name !== 'youtu.be' && !/^(?:m\.|music\.)?youtube(?:-nocookie)?\.com$/.test(name)) return '';
    const u = new URL(url(value));
    const id = name === 'youtu.be' ? u.pathname.split('/')[1] || '' : u.pathname === '/watch' ? u.searchParams.get('v') || '' :
      (/^\/(?:shorts|embed|live)\/([^/]+)/.exec(u.pathname) || [])[1] || '';
    return YT_ID.test(id) ? id : '';
  }
  // ② 수집 러너가 펼친 RSS 대표 이미지 지도(viewer/rss_images.json 의 images = {기사 주소: 이미지 주소}).
  //    키는 parse 와 같은 정규화(href)를 거쳐 카드 주소와 같은 꼴로 맞춘다 · 지도 객체가 같으면 다시 만들지 않는다.
  //    지도 주소 수천 개는 위 PARSED 캐시에 넣지 않는다(캐시는 후보 주소 몫 · 한 번 읽고 끝나는 값이 밀어내지 않게).
  const IMAGE_MAPS = new WeakMap();
  function onceUrl(value) {
    if (typeof value !== 'string') return '';
    try {
      const u = new URL(value);
      return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password ? u.href : '';
    } catch { return ''; }
  }
  function imageMap(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    let map = IMAGE_MAPS.get(raw);
    if (!map) {
      map = new Map();
      for (const [key, value] of Object.entries(raw)) { const k = onceUrl(key), v = onceUrl(value); if (k && v && !map.has(k)) map.set(k, v); }
      IMAGE_MAPS.set(raw, map);
    }
    return map;
  }
  // 검증된 원문 사진(thumb_search)이 없는 카드에만: RSS 대표 이미지 → 유튜브 썸네일 순 · 같은 그림 한 번 · 한 카드 최대 4장.
  // 화면 표시용일 뿐 점수·순위·PICK 대상은 바꾸지 않는다(overlap_latest.json 무접촉). 못 불러온 사진은 카드가 지운다(modern-card-content.js).
  const DERIVED_MAX = 4;
  // alt 는 비워 둔다 = 카드가 「제목 관련 사진 N」으로 읽는다(그림 내용은 모른다).
  function derivedImages(list, items, map) {
    const out = [], seen = new Set();
    const put = (img, sourceUrl) => { if (img && !seen.has(img) && out.length < DERIVED_MAX) { seen.add(img); out.push({url: img, sourceUrl, alt: ''}); } };
    if (map) for (const u of list) put(map.get(u), u);
    for (const u of [...new Set([...list, ...items.map(i => i.url).filter(Boolean)])]) {
      const id = youtubeId(u);
      if (id) put('https://i.ytimg.com/vi/' + id + '/hqdefault.jpg', u);
    }
    return out;
  }
  // ③ 사진 없는 카드 채우기(형 11-03 12:46 「그리고 메인에 사진 없는 이슈는 없게 하고픈데, 이거 때문에 러너 굴릴 일은 아닌거 같고 구글 클라우드 api 쓸것도 아닌거 같고. 방법을 찾아」)
  //    = 사무실 링크 카드(/api/office/linkcard · 기사 og:image · R2 7일 기억)로 읽은 사진을 ② 지도에 더함 · 여기는 순수 판정 둘만(부르는 손 = modern-workspace.js).
  //    imageAsks = 사진 없는 행마다 아직 안 물은 주소 하나(화면 차례 그대로 limit 개) · 유튜브는 썸네일이 이미 있어 안 물음 ·
  //    행마다 앞 IMAGE_ASK_PER_ROW 개까지 = 순위 묶음은 첫 매체가 로그인 벽이어도 다음 매체 주소로 한 번 더.
  const IMAGE_ASK_PER_ROW = 3;
  function imageAsks(rows, tried, limit = 40) {
    const out = [], seen = tried && typeof tried.has === 'function' ? tried : new Set();   // instanceof 아님 = 다른 realm(시험 vm · iframe)의 Set 도 받음 · seal-ok: typeof 판정 문자열(공유 문법 아님)
    for (const row of Array.isArray(rows) ? rows : []) {
      if (out.length >= limit) break;
      if (!row || (Array.isArray(row.meta?.images) && row.meta.images.length)) continue;
      const next = urls(row.urls).filter(u => !youtubeId(u)).slice(0, IMAGE_ASK_PER_ROW).find(u => !seen.has(u) && !out.includes(u));
      if (next) out.push(next);
    }
    return out;
  }
  // 지도 둘 → 새 객체(② imageMap 캐시가 객체 단위라 더할 때마다 새로) · 같은 주소면 RSS 지도가 이김.
  function mergeImages(base, extra) {
    const plain = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return Object.assign({}, plain(extra), plain(base));
  }
  function project(overlap, candidates, articles, stateOf, options = {}) {
    const visible = Array.isArray(options.visibleCandidates) ? options.visibleCandidates : candidates || [];
    const rows = [], lookup = new Map(), used = new Set(), byURL = new Map(), visibleByURL = new Map(), articleByURL = new Map();
    const links = c => candidateLinks(c, typeof options.urls === 'function' ? options.urls(c) : []);   // seal-ok: typeof 판정 문자열(공유 문법 아님)
    const images = imageMap(options.images);   // RSS 대표 이미지 지도(없으면 null = 유튜브 썸네일만 · 운영자 261022)
    for (const c of candidates || []) for (const u of links(c)) if (!byURL.has(u)) byURL.set(u, c);
    for (const c of visible) for (const u of links(c)) if (!visibleByURL.has(u)) visibleByURL.set(u, c);
    for (const a of articles || []) for (const u of articleLinks(a)) articleByURL.set(u, a);
    function add(cluster, candidate, pick) {   // pick = 틈·촉 픽(점수·자리·이름 · 아래 options.picks)
      const list = cluster ? urls([...cluster.urls, ...cluster.items.map(i => i.url)]) : links(candidate).slice();
      if (!list.length || used.has(list[0])) return;
      // A member with a PICK state (picking · failed · settled) speaks for the cluster, so the home card keeps
      // that PICK even when another visible member leads the ranked list (10-27 smoke: the failed 구룡마을 PICK
      // vanished from home once 연합 came first and took the row).
      const shown = list.map(u => visibleByURL.get(u)).filter(Boolean);
      const matched = candidate || (stateOf && shown.find(c => stateOf(c))) || shown[0];
      // A ranked item must not resurrect a source already dismissed, passed or
      // merged away by the original editor. New unmatched community items stay.
      if (!matched && list.some(u => byURL.has(u))) return;
      const c = matched || { id: list[0], url: list[0], title: cluster.title, cluster_members: list, media: text(cluster.items[0]?.src), event_key: '' };
      // A ranked member can resolve to an existing merged card. Keep its
      // canonical article and every grouped source together with the PICK target.
      if (matched) for (const u of links(matched)) if (!list.includes(u)) list.push(u);
      const supplied = matched && typeof options.metadata === 'function' ? options.metadata(c) || {} : {};
      const key = url(supplied.published?.sourceUrl) || url(c.url) || list[0];
      if (lookup.has(key)) return;
      list.forEach(u => used.add(u)); used.add(key);
      const a = list.map(u => articleByURL.get(u)).find(Boolean);
      const items = cluster ? cluster.items.map(i => ({ src: text(i.src), title: text(i.title), url: url(i.url) })) :
        list.map(u => ({ src: text(byURL.get(u)?.media) || host(u), title: text(byURL.get(u)?.title) || text(c.title), url: u }));
      if (cluster && matched) for (const u of list) if (!items.some(i => i.url === u)) items.push({
        src: text(byURL.get(u)?.media) || host(u),
        title: text(byURL.get(u)?.title) || text(c.title), url: u});
      const meta = {};
      // Only a candidate's own documented source timestamp is publication time.
      if (supplied.published && Number.isFinite(Date.parse(supplied.published.at)) && url(supplied.published.sourceUrl)) meta.published = {
        at: supplied.published.at, sourceUrl: url(supplied.published.sourceUrl), sourceName: text(supplied.published.sourceName)};
      else if (matched && !options.metadata && Number.isFinite(Date.parse(matched.published))) meta.published = {at: matched.published, sourceUrl: url(matched.url), sourceName: text(matched.media)};
      if (a && text(a.summary)) meta.description = text(a.summary);
      // Search suggestions and generated artwork are not article photos. Include
      // a search image only when its source link exactly matches this article.
      meta.images = (Array.isArray(a?.cards?.thumb_search) ? a.cards.thumb_search : [])
        .filter(image => image && list.includes(url(image.link)) && url(image.img) && !/유사|생성|AI/i.test(text(image.label)))
        .map(image => ({url: url(image.img), sourceUrl: url(image.link), alt: text(image.label) || text(c.title)}));
      if (!meta.images.length) meta.images = derivedImages(list, items, images);   // 운영자 261022
      const row = {key, title: text(supplied.title) || text(cluster?.title) || text(c.title), score: cluster ? cluster.score : pick ? pick.score : null,
        rank: cluster ? cluster.rank : pick ? pick.rank : null, type: cluster || pick ? 'ranked' : 'existing', urls: list, items,
        sites: [...new Set(items.map(i => i.src).filter(Boolean))], meta,
        x_why: text(cluster?.x_why), needs_cause_news: !!cluster?.needs_cause_news,
        surge: !!cluster?.surge, followup_dev: !!cluster?.followup_dev, already_sent: !!cluster?.already_sent,
        signals: issueSignals(matched),
        pickState: stateOf ? stateOf(c) : null, pick: pick ? pick.by : null};
      rows.push(row); lookup.set(key, c);
    }
    // 틈·촉 픽(형 11-03 09:57 「그 메인카드에 틈이나, 점수 반영된 이슈가 카드로 안뜨는거 같은데」) = 그 봇이 준 기사 주소로 「보이는 후보」 카드를 찾아
    // 순위 묶음보다 앞에 놓고 그 봇 점수를 단다(api/trends?f=picks 의 차례 그대로) · 넘긴(트리아지) 카드는 안 되살림 · 수집함에 없는 주소는 건너뜀.
    // 수집함에 아직 없는 기사(봇이 먼저 찾은 것 · 11-03 10:20 촉 첫 판 실측) = 픽 키워드를 제목으로 그 주소 카드를 세움 · 수집함에 있는데 안 보이는(넘긴) 주소면 건너뜀.
    // 둘 다 고른 기사(이슈 메이커 11-03 「둘 다 고르면 칩마다 자기 숫자 · 정렬은 높은 쪽」) = 한 카드 · row.picks 에 봇마다 {by, keyword, score} · row.pick·score = 먼저 온(높은) 쪽.
    const pickRow = new Map();
    for (const p of Array.isArray(options.picks) ? options.picks : []) {
      const list = urls(Array.isArray(p?.urls) ? p.urls : []);
      if (!list.length) continue;
      const pick = {by: {by: text(p.by), keyword: text(p.keyword), round_id: text(p.round_id)},
        score: Number.isFinite(p.score) ? p.score : null, rank: Number.isInteger(p.rank) ? p.rank : null};
      const same = list.map(u => pickRow.get(u)).find(Boolean);
      if (same) { if (!same.picks.some(x => x.by === pick.by.by)) same.picks.push({...pick.by, score: pick.score}); continue; }
      const before = rows.length;
      const c = list.map(u => visibleByURL.get(u)).find(Boolean);
      if (c) add(null, c, pick);
      else if ((text(p.title) || text(p.keyword)) && !list.some(u => byURL.has(u))) {   // 제목 = 봇이 준 기사 제목(있으면) · 없으면 키워드
        const title = text(p.title) || text(p.keyword);
        add({title, score: pick.score, rank: pick.rank, urls: list, items: list.map(u => ({src: host(u), title, url: u}))}, null, pick);
        if (Number.isFinite(Date.parse(p.at)) && rows.length && rows[rows.length - 1].urls[0] === list[0])
          rows[rows.length - 1].meta.published = {at: p.at, sourceUrl: list[0], sourceName: host(list[0])};
      }
      if (rows.length > before) { const row = rows[rows.length - 1]; row.picks = [{...pick.by, score: pick.score}]; row.urls.forEach(u => pickRow.set(u, row)); }
    }
    if (validOverlap(overlap)) for (const cluster of overlap.clusters.filter(usableCluster).sort((a,b) => b.score-a.score || a.rank-b.rank)) add(cluster);
    for (const candidate of visible) if (url(candidate.url) && !used.has(url(candidate.url))) add(null, candidate);
    // News mix (operator 10-22 «커뮤니티 것만 카드에 몰려 · rss 뉴스가 더 몰려야» · «섞는 방식을 토글로»): after every
    // `mixNews` ranked clusters one RSS candidate (an 'existing' row) is laid in, the best of the three alpha
    // ingredients first (alphaOrder above · without `alphaProfile` = most-reporting outlets only). Only the order on this
    // screen changes: the bot's score is not touched, nothing is dropped, and overlap_latest.json (what the bots read)
    // is untouched. 0 / absent = the ranked order as before.
    const every = Math.floor(Number(options.mixNews) || 0);
    if (every > 0) {
      const ranked = rows.filter(r => r.type === 'ranked'), news = rows.filter(r => r.type !== 'ranked');
      const alpha = alphaOrder(news.map(r => lookup.get(r.key) || {}), options.alphaProfile);
      const order = new Map(news.map((r, i) => [r, alpha[i]]));
      news.sort((a, b) => order.get(b) - order.get(a));   // stable sort = equal values keep the feed's order
      const mixed = [];
      ranked.forEach((r, i) => { mixed.push(r); if ((i + 1) % every === 0 && news.length) mixed.push(news.shift()); });
      rows.splice(0, rows.length, ...mixed, ...news);
    }
    return {rows, lookup};
  }

  // ── Workspace connectivity: pure decisions, the workspace supplies the state ──
  const VIEW_NAMES = new Set(['home', 'feed', 'ask', 'thumb', 'cap', 'run', 'office', 'legacy']);
  const HISTORY_KEY = 'nmView';
  // An entry pushed by the original editor (a dialog, the queue, merge mode...).
  function foreignState(state) {
    return state != null && (typeof state !== 'object' || Object.keys(state).some(key => key !== HISTORY_KEY && !!state[key]));
  }
  // The start view keeps the page's own entry. Any other base view adds exactly
  // one entry above it, so Back returns to the start view and one more Back
  // leaves the app. Entries of the original editor are never touched, except a
  // tool entry left behind by minimising: it no longer closes anything.
  function historyStep(state, {base, start, staleTool = false} = {}) {
    if (!VIEW_NAMES.has(start) || !VIEW_NAMES.has(base)) return null;
    if (state && typeof state === 'object' && state.tool) return staleTool ? 'back' : null;
    if (foreignState(state)) return null;
    const want = base !== start, mine = !!state && VIEW_NAMES.has(state[HISTORY_KEY]);
    if (want && !mine) return 'push';
    if (!want && mine) return 'back';
    return want && state[HISTORY_KEY] !== base ? 'replace' : null;
  }
  // The base view a Back or Forward landed on; null when another layer owns it.
  function historyTarget(state, start) {
    if (!VIEW_NAMES.has(start) || (state && typeof state === 'object' && state.tool) || foreignState(state)) return null;
    const own = state && typeof state === 'object' ? state[HISTORY_KEY] : undefined;
    return own === undefined ? start : VIEW_NAMES.has(own) ? own : null;
  }
  // Last sub-tab and scroll per tool for this browser session.
  const TOOL_NAMES = ['ask', 'thumb', 'cap', 'run', 'office'];
  const tabKey = value => typeof value === 'string' && /^[#/\w.?=&-]{1,80}$/.test(value) ? value : '';   // ?=& = 같은 화면의 모드 탭(/edit.html?mode=bestcut) — 빠지면 베스트컷 탭·스크롤을 못 기억했다
  const offset = value => Number.isFinite(value) && value > 0 ? Math.min(Math.round(value), 1e6) : 0;
  function toolMemory(raw) {
    let value = raw;
    if (typeof raw === 'string') { try { value = JSON.parse(raw); } catch { value = null; } }
    const memory = {};
    for (const tool of TOOL_NAMES) {
      const entry = value && typeof value === 'object' ? value[tool] : null;
      if (!entry || typeof entry !== 'object') continue;
      const scroll = {};
      if (entry.scroll && typeof entry.scroll === 'object') {
        for (const [key, y] of Object.entries(entry.scroll).slice(0, 16)) if (tabKey(key) && offset(y)) scroll[key] = offset(y);
      }
      const tab = tabKey(entry.tab);
      if (tab || Object.keys(scroll).length) memory[tool] = {tab, scroll};
    }
    return memory;
  }
  function rememberTool(memory, tool, {tab, scroll} = {}) {
    const next = toolMemory(memory);
    if (!TOOL_NAMES.includes(tool)) return next;
    const entry = next[tool] || {tab: '', scroll: {}};
    if (tabKey(tab)) entry.tab = tab;
    if (scroll && tabKey(scroll.tab)) {
      if (offset(scroll.y)) entry.scroll[scroll.tab] = offset(scroll.y); else delete entry.scroll[scroll.tab];
    }
    next[tool] = entry;
    return next;
  }
  // Keys the parent hands to the home card while nothing else holds focus.
  function homeKey(event) {
    if (!event || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return '';
    if (event.key === 'ArrowRight') return 'next';
    if (event.key === 'ArrowLeft') return 'previous';
    // Enter and Space stay with whatever holds focus: forwarded from an
    // unfocused page they could PICK a card the reader never chose.
    if (event.code === 'KeyP' || String(event.key).toLowerCase() === 'p') return 'pick';
    return '';
  }
  // Why the ranking is missing or old, said once: the home adds its own title
  // and retry button. kind tells an outside failure (server, network, an old
  // or missing file) from broken data (format, a request the server rejects).
  function responseKind(status) {
    return status >= 500 || [401, 403, 404, 408, 429].includes(status) ? 'external' : 'code';
  }
  function homeStatus({loading = false, issue = null, rows = 0} = {}) {
    if (loading) return {state: 'loading', kind: null, message: '실시간 순위와 수집 후보를 맞추는 중이야.'};
    // older = 실시간은 답했는데 지금 것보다 오래된 순위 → 지금 순위 유지가 정상 동작(실패 아님 · 261023 평의회 C4) = 배너 없음.
    if (issue && typeof issue === 'object' && issue.case === 'older') return homeStatus({rows});
    if (issue && typeof issue === 'object') {
      const kind = issue.kind === 'code' ? 'code' : 'external';
      const why = kind === 'code' ? '데이터 형식이 맞지 않아' : '서버가 응답하지 않아';
      const message = issue.case === 'static' ? '실시간 순위 ' + why + ' 저장된 순위를 보여주고 있어.' :
        issue.case === 'kept' ? '순위 ' + why + ' 마지막으로 받은 순위를 보여주고 있어.' :
        '순위 ' + why + (rows ? ' 점수 없이 수집 후보를 보여주고 있어.' : '.');
      return {state: rows ? 'stale' : 'error', kind, message};
    }
    return rows ? {state: 'ready', kind: null, message: ''} : {state: 'empty', kind: null, message: '수집 후보와 순위가 아직 비어 있어.'};
  }
  root.ModernData = Object.freeze({url, validOverlap, project, imageAsks, mergeImages, alphaWords, historyStep, historyTarget, toolMemory, rememberTool, homeKey, responseKind, homeStatus});
})(root);
  return root.ModernData;
}

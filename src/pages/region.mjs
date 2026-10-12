import { layout, node } from '../lib/html.mjs';
import { esc, hash, km, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock, longtail,
  shapeKin, spotIndex, myeonList, dongNameList, guIndex, touchList, telCta,
} from '../lib/blocks.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_A_EUP, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC, edgeWord, depthNote,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/** 넓이를 말로 — 숫자만 적으면 감이 안 온다. */
function walkWord(a) {
  if (a < 1) return '둘레를 따라 걸어도 금방 한 바퀴가 도는 크기입니다';
  if (a < 3) return '서두르지 않고 걸어서 건너편까지 갈 만한 크기입니다';
  if (a < 10) return '걸어 건너기에는 부담스러워 차를 타게 되는 크기입니다';
  if (a < 30) return '같은 이름 안에서도 차로 이동하게 되는 크기입니다';
  return '이쪽 끝에서 저쪽 끝으로 가는 것만 해도 일이 되는 크기입니다';
}

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 경계 자료를 계산해 나온 사실이다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses } = ctx;
  const ratio = s.area ? s.perim / s.area : 0;
  return {
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, kind: s.kind,
    area: km2(s.area), perim: km(s.perim), depth: km(s.depth),
    edge: edgeWord(s.round), depthNote: depthNote(s.depth), walk: walkWord(s.area),
    ratioWord: ratio > 6 ? '꽤 깁니다' : ratio > 3 ? '보통입니다' : '짧은 편입니다',
    gateWord: s.round < 0.4 ? '여러 갈래입니다' : '몇 갈래로 모입니다',
    depthCmp: s.depth * 1000 / Math.max(1, s.perim) > 120 ? '안쪽이 깊은 축입니다' : '납작하게 퍼진 축입니다',
    sizeWord: s.perimRank === 1 ? '테두리가 가장 긴 자리입니다'
      : s.perimRank === g.spotCount ? '테두리가 가장 짧은 자리입니다'
        : `테두리 길이로 ${s.perimRank}번째입니다`,
    guSpotCount: g.spotCount,
    place: `${g.name} ${s.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
  };
}

/* ── 동·읍 쪽 — 메인 네 시도에서만 낸다 ────────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const poolA = s.kind === '읍' ? SPOT_LEAD_A_EUP : SPOT_LEAD_A;
  const lead = `<div class="note">
  <p>${at(h, poolA, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const facts = node('fact', '실측', `${esc(s.name)} 재어 본 값`,
    factTable([
      ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['시군구', `<a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
      ['갈래', s.kind === '읍' ? '읍 — 군에서 사람과 가게가 가장 몰린 자리' : '행정동'],
      ['넓이', `${km2(s.area)} — ${esc(walkWord(s.area))}`],
      ['테두리 한 바퀴', `${km(s.perim)} · ${esc(g.name)} 안에서 ${s.perimRank}번째로 긺`],
      ['안쪽 깊이', `${km(s.depth)} — 경계에서 가장 멀리 들어간 지점까지`],
      ['모양', `${esc(edgeWord(s.round))} 편 (뭉침 ${s.round})`],
      ['접수', `${esc(cfg.hours)} · 값은 ${esc(cfg.pay)} · 문 앞까지 ${esc(cfg.arrive)}`],
    ]),
    at(h, SEC.factSub, 7), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) pool.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${g.name} ${s.name}`, seed),
    courseGrid(courses, seed, s.name, '01'),
    shapeKin(sd, g, s, seed, '02'),
    spotIndex(sd, g, seed, s.slug, '03'),
    stepList(seed, '04'),
    guIndex(sd, seed, g.slug, '05'),
    faqHtml,
    noticeBlock(seed, '07'),
    longtail(pool, seed, 24, '다른 지역', at(h, SEC.crossHead, 8), null, '08'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="ttl-s">${s.kind === '읍' ? '읍' : '동'}까지 내려 적은 출장마사지 홈타이</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시군구 쪽 ────────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  const c = {
    sido: sd.name, name: g.name, gu: g.name, mainSite: g.main,
    unitW: g.main ? '동·읍' : '행정동',
    unitN: g.main ? g.spotCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount, myeonCount: g.myeonCount,
    area: km2(g.area), touchAll: g.touchAll, touchCount: g.touchCount,
    deepest: g.deepest || '', deepestKm: g.deepestKm ? km(g.deepestKm) : '',
    shallowest: g.shallowest || '', longest: g.longest || '', longestKm: g.longestKm ? km(g.longestKm) : '',
    place: `${sd.name} ${g.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  // 같은 풀에서 둘을 뽑으므로 겹치지 않게 뒤 칸을 밀어 준다
  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const lead = `<div class="note">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const rows = [
    ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}곳`],
    g.main ? ['쪽을 둔 동·읍', `${g.spotCount}곳`] : ['쪽을 둔 깊이', '시군구까지 — 동 이름은 이 쪽 목록에'],
    ['면', g.myeonCount ? `${g.myeonCount}곳 — 이름만 적음` : '없음'],
    ['넓이', km2(g.area)],
    ['맞닿은 시군구', g.touchAll ? `모두 ${g.touchAll}곳${g.touchCount ? ` · ${g.touching.slice(0, 3).map((x) => esc(x.gu)).join(' · ')}` : ' · 쪽을 걸어 둔 곳은 없음'}` : '없음 — 다리로만 드나드는 섬'],
    ['접수', `${esc(cfg.hours)} · 값은 ${esc(cfg.pay)}`],
  ];
  if (g.main && g.deepest) {
    rows.splice(5, 0,
      ['테두리가 가장 긴 자리', `<a href="/${sd.slug}/${g.slug}/${g.longestSlug}/">${esc(g.longest)}</a> ${km(g.longestKm)}`],
      ['안쪽이 가장 깊은 자리', `<a href="/${sd.slug}/${g.slug}/${g.deepestSlug}/">${esc(g.deepest)}</a> ${km(g.deepestKm)}`]);
  }
  const facts = node('fact', '실측', `${esc(g.name)} 재어 본 값`, factTable(rows), at(h, SEC.factSub, 7), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '05');

  const pool = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${sd.name} ${g.name}`, seed),
    g.main ? spotIndex(sd, g, seed, null, '01') : dongNameList(g, seed, '01'),
    myeonList(g, seed, '02'),
    courseGrid(courses, seed, g.name, '03'),
    touchList(sd, g, seed, '04'),
    faqHtml,
    stepList(seed, '06'),
    noticeBlock(seed, '07'),
    guIndex(sd, seed, g.slug, '08'),
    longtail(pool, seed, 20, '옆 시군구', '옆 시군구에서 받는 자리', null, '09'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="ttl-s">출장마사지 홈타이 ${g.main ? `동·읍 ${g.spotCount}곳` : `행정동 ${g.dongCount}곳`}</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.main && g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동·읍`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : null,
        S.faqPage(url, qa),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 쪽 ──────────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byArea = sd.gu.slice().sort((a, b) => b.area - a.area);

  const c = {
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, myeonCount: sd.myeonCount,
    place: sd.name,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const lead = `<div class="note"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;

  const facts = node('fact', '실측', `${esc(sd.name)} 재어 본 값`,
    factTable([
      ['행정 명칭', esc(sd.full)],
      ['쪽을 둔 깊이', sd.main ? '시군구 → 동·읍' : '시군구까지'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}곳`],
      sd.main ? ['쪽을 둔 동·읍', `${sd.spotCount}곳`] : ['동 이름', '각 시군구 쪽에 목록으로'],
      ['면', sd.myeonCount ? `${sd.myeonCount}곳 — 시군구 쪽에 이름으로` : '없음'],
      ['받는 넓이', km2(sd.area)],
      ['가장 넓은 시군구', `<a href="/${sd.slug}/${byArea[0].slug}/">${esc(byArea[0].name)}</a> ${km2(byArea[0].area)}`],
      ['접수', `${esc(cfg.hours)} · 값은 ${esc(cfg.pay)}`],
    ]), at(h, SEC.factSub, 7), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '05');

  const csLinks = node('sidocourse', '코스', `${esc(sd.name)}에서 고를 수 있는 코스`,
    `<ul class="lnk">${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)} 출장마사지</a></li>`).join('\n')}</ul>`,
    `코스별로 손이 머무는 자리와 속도가 달라집니다. 값은 ${esc(sd.name)} 어디서나 한 가지입니다.`, '03');

  let pickBlock = '';
  if (sd.main) {
    const deep = [];
    for (const g of sd.gu) for (const s of g.spots) deep.push({ g, s });
    deep.sort((a, b) => b.s.depth - a.s.depth);
    pickBlock = node('deeppick', '깊은 자리', `${esc(sd.name)}에서 안쪽이 깊은 동·읍`,
      `<ul class="lnk">${deep.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)} 깊이 ${km(x.s.depth)}</a></li>`).join('\n')}</ul>`,
      `큰길에 닿고도 더 들어가야 하는 자리입니다. 시각을 말씀드릴 때 이 몫까지 얹어 셉니다. 나머지 ${sd.spotCount}곳은 시군구를 눌러 보십시오.`, '02');
  } else {
    const byDong = sd.gu.slice().sort((a, b) => b.dongCount - a.dongCount);
    pickBlock = node('gupick', '시군구', `${esc(sd.name)}에서 주소가 가장 촘촘한 곳`,
      `<ul class="lnk">${byDong.slice(0, 12).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} 행정동 ${g.dongCount}곳</a></li>`).join('\n')}</ul>`,
      '행정동 수가 많을수록 같은 넓이에 집이 더 빽빽하다는 뜻입니다.', '02');
  }

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, sd.name, seed),
    guIndex(sd, seed, null, '01'),
    pickBlock,
    csLinks,
    courseGrid(courses, seed, sd.name, '04'),
    faqHtml,
    stepList(seed, '06'),
    longtail(pool, seed, 20, '다른 시도', '다른 시도에서 받는 자리', null, '07'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="ttl-s">${sd.main ? `동·읍 ${sd.spotCount}곳` : `시군구 ${sd.gu.length}곳`} 출장마사지 홈타이</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}

import { layout, node, telBtn } from '../lib/html.mjs';
import { esc, hash, km, km2, won, shuffle } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock,
  longtail, telCta, siteLinks,
} from '../lib/blocks.mjs';
import { SEC } from '../content/copy.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: won(Math.min(...courses.map((c) => c.price))),
});

/* ── 대문 ─────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="hero" aria-label="처음 안내">
  <p class="hero-sl">${esc(cfg.brand.slogan)}</p>
  <p class="hero-p">가게 자리가 없습니다. 전화를 주시면 관리사가 그 주소로 움직입니다. 수도권과 부산은 동·읍 하나하나까지, 대전·대구·울산과 지정한 시·군은 시군구까지 적어 두었습니다.</p>
  ${telBtn(cfg, { size: 'l' })}
  <dl class="hero-f">
    <div><dt>${esc(cfg.hours)}</dt><dd>시각을 가리지 않고 받습니다</dd></div>
    <div><dt>${esc(cfg.pay)}</dt><dd>지갑은 마지막에 여십니다</dd></div>
    <div><dt>${esc(cfg.arrive)}</dt><dd>문 앞까지 대개 이만큼</dd></div>
    <div><dt>동·읍 ${counts.spot}곳</dt><dd>시군구 ${counts.gu}곳 안에</dd></div>
  </dl>
</section>`;

  const areaBlock = node('area', '받는 자리', '사시는 지역부터 짚어 주십시오',
    `<div class="lvl">
      <div class="lvl-b">
        <p class="lvl-h">동·읍까지 쪽이 있는 곳</p>
        <ul class="lvl-ul">${main.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><span>시군구 ${r.gu.length} · 동읍 ${r.spotCount}</span></a></li>`).join('\n')}</ul>
      </div>
      <div class="lvl-b lvl-s">
        <p class="lvl-h">시군구까지 쪽이 있는 곳</p>
        <ul class="lvl-ul">${sub.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><span>시군구 ${r.gu.length}</span></a></li>`).join('\n')}</ul>
      </div>
    </div>
    <p class="nd-tail">깊이가 달라도 거는 번호와 내는 값은 하나입니다. <a href="/area/">전체 목록</a>을 펼쳐 보셔도 됩니다.</p>`,
    '층을 둘로 나눈 건 적어 둔 깊이가 다를 뿐이고, 받는 지역을 가린 것이 아닙니다.', '01');

  const whyBlock = node('why', '쓰는 방식', '왜 둘레와 깊이를 먼저 보나요?',
    `<div class="note">
      <p>동 쪽에 들어가시면 그 자리의 <strong>테두리 한 바퀴 길이</strong>와 <strong>안쪽 깊이</strong>가 적혀 있습니다. 안쪽 깊이는 경계에서 가장 멀리 들어간 지점까지의 거리이고, 사실상 큰길에 닿은 뒤에도 남을 수 있는 거리입니다.</p>
      <p>넓이만 봐서는 같은 동 안에서 왜 도착이 5분과 15분으로 갈리는지 설명되지 않습니다. 넓어도 길을 따라 늘어선 자리는 어디든 금방이고, 좁아도 안으로 파고든 자리는 끝집까지 한참입니다. 그래서 저희는 넓이보다 이 두 숫자를 먼저 봅니다.</p>
      <p>모두 공개 경계 자료를 계산해 나온 값이고, 같은 자료로 다시 계산하면 같은 값이 나옵니다. 재는 방법은 <a href="/magazine/how-deep-is-the-inside/">기록장에 적어 두었습니다</a>.</p>
    </div>`, null, '02');

  const postBlock = node('note', '기록장', '부르기 전에 읽어 두면 좋은 글',
    `<ul class="pst">${latestPosts.map((p) => `<li><a href="${p.path}"><b>${esc(p.title)}</b><span>${esc(p.summary)}</span><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>
     <p class="nd-tail"><a href="/magazine/">기록장 전체 보기</a></p>`,
    '누가 받아 봤다는 글이 아닙니다. 부르기 전에 정해 두면 편한 것만 모았습니다.', '05');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 곳'), 6, '06');

  const pool = [];
  for (const r of regions) {
    if (r.main) for (const g of r.gu) for (const s of g.spots) pool.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
    else for (const g of r.gu) pool.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  }

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseGrid(courses, seed, '어느 자리에서든', '03'),
    stepList(seed, '04'),
    postBlock,
    faqHtml,
    noticeBlock(seed, '07'),
    longtail(pool, seed, 30, '바로 가기', '많이 찾으시는 자리', null, '08'),
    telCta(cfg, '지금 계신 곳', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="ttl-s">서울·인천·경기·부산 동읍 ${counts.spot}곳 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/`, qa),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const lead = `<div class="note">
  <p>쪽이 있는 자리를 한 장으로 묶었습니다. 시군구가 ${counts.gu}곳, 동·읍이 ${counts.spot}곳입니다. 면 ${counts.myeon}곳에는 쪽이 없지만 접수도 방문도 그대로 받습니다.</p>
  <p>수도권과 부산은 동·읍 하나하나를 눌러 보실 수 있고, 그 밖의 지역은 시군구 쪽 목록에 동 이름을 담아 두었습니다. 깊이를 다르게 둔 것은 찾는 분이 많은 쪽을 더 잘게 쪼갠 결과일 뿐입니다.</p>
</div>`;

  const blocks = regions.map((r, i) => node(`sd-${r.slug}`, r.main ? '동·읍까지' : '시군구까지', `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동·읍 ${r.spotCount}곳` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="idx">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/"><span class="idx-n">${esc(g.name)}</span><span class="idx-m">행정동 ${g.dongCount}${g.myeonCount ? ` · 면 ${g.myeonCount}` : ''}</span></a></li>`).join('\n')}</ul>`,
    r.main
      ? `${r.name}은 시군구를 짚으면 그 안의 동·읍이 펼쳐집니다. 행정동을 다 세면 ${r.dongCount}곳입니다.`
      : `${r.name}은 시군구에서 멈춥니다. 행정동 ${r.dongCount}곳의 이름은 시군구 쪽 목록에 들어 있습니다.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 동네'), 4, '98');

  const body = [lead, telCta(cfg, '사시는 곳', seed), blocks, faqHtml, stepList(seed, '99')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `받는 자리를 한 장에 <span class="ttl-s">시군구 ${counts.gu}곳 안의 동·읍 ${counts.spot}곳</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '받는 자리', url: `${siteUrl}/area/` }],
      jsonld: [
        S.itemList(`${siteUrl}/area/#list`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/area/`, qa),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const lead = `<div class="note">
  <p>모두 일곱 가지입니다. 따져 보실 것은 셋뿐입니다 — 얼마나 세게, 얼마나 길게, 오일을 쓸지 말지. 이 셋만 정해 주시면 나머지는 통화하면서 맞춥니다.</p>
  <p>제일 짧은 쪽이 ${sorted.slice().sort((a, b) => a.min - b.min)[0].ko}, 제일 긴 쪽이 ${sorted.slice().sort((a, b) => b.min - a.min)[0].ko}입니다. 시간이 길다고 세기가 센 것도 아니고 값이 높다고 더 나은 것도 아닙니다. 그날 몸이 무엇을 원하느냐가 다를 뿐입니다.</p>
</div>`;

  const table = node('all', '한눈에', '일곱 가지를 나란히',
    `<table class="cmp"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">금액</th><th scope="col">세기</th><th scope="col">속도</th><th scope="col">오일</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}</tbody></table>`,
    '싼 쪽부터 늘어놓았습니다. 부르시는 지역이 어디든 금액은 그대로입니다.', '01');

  const pickBy = node('bycase', '고르기', '이런 때는 어느 쪽인가요?',
    `<ul class="pick">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><span>${esc(c.for)}</span></a></li>`).join('\n')}</ul>`,
    '고른 뒤에 바꾸셔도 됩니다. 금액은 마지막에 정한 코스로 셉니다.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 곳'), 4, '03');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });

  const body = [lead, table, pickBy, telCta(cfg, '코스 상담', seed), faqHtml, longtail(pool, seed, 24, '지역별', '지역에서 코스 찾기', null, '04')].join('\n');

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`),
      desc: clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지를 세기·길이·오일 여부로 견주어 두었습니다. ${won(sorted[0].price)}원부터이고 지역을 타지 않습니다.`),
      h1: `코스 ${courses.length}가지 <span class="ttl-s">세기 · 길이 · 오일로 견주기</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 금액 ─────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const lead = `<div class="note">
  <p>아래가 전부입니다. 여기 없는 돈은 받지 않습니다.</p>
  <p>어디로 가든 숫자가 바뀌지 않습니다. 읍내든 도심 한복판이든 같은 코스면 같은 값입니다. 유난히 먼 날이 있어도 그 부담을 이용자께 떠넘기지 않기로 했습니다.</p>
</div>`;

  const table = node('tbl', '금액표', '코스별 기본 길이와 금액',
    `<table class="cmp"><thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">금액</th><th scope="col">1분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td><b>${won(c.price)}원</b></td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table>`,
    '1분당 값은 서로 견주시라고 덧붙인 것입니다. 실제로 분 단위로 끊어 받지는 않습니다.', '01');

  const noExtra = node('nox', '안 붙는 것', '여기에 더 붙지 않습니다',
    `<ul class="pt">
      <li>교통비 — 얼마나 멀든 따로 청구하지 않습니다.</li>
      <li>새벽 웃돈 — 해 뜨기 전에도 표의 숫자 그대로입니다.</li>
      <li>명절·공휴일 웃돈 — 날짜로 값을 올리지 않습니다.</li>
      <li>선금 — 예약금이든 보증금이든 받지 않습니다.</li>
      <li>취소 수수료 — 미루셔도 무르셔도 없습니다.</li>
      <li>주차 요금 — 저희 쪽에서 부담합니다.</li>
    </ul>`,
    '계좌부터 알려 달라는 연락이 오면 저희가 아닙니다.', '02');

  const pay = node('how', '계산', '어떻게 내면 되나요?',
    factTable([
      ['때', '마친 뒤 그 자리에서'],
      ['수단', '현금과 카드 — 무엇으로 내셔도 금액이 같습니다'],
      ['영수증', '말씀하시면 드립니다'],
      ['길게 받을 때', '통화에서 미리 정하시면 그만큼 더해서 셉니다'],
      ['두 분이 받을 때', '사람마다 따로 셈합니다. 묶음값을 두지 않습니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 자리'), 4, '04');

  const body = [lead, table, noExtra, pay, telCta(cfg, '금액 확인', seed), faqHtml, siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`금액표 ${won(sorted[0].price)}원부터`),
      desc: clampDesc(`코스별 기본 길이와 금액입니다. ${won(sorted[0].price)}원부터이고 길 값·심야 할증·예약금을 붙이지 않습니다. 마친 뒤 현금이나 카드로 받습니다.`),
      h1: `금액 <span class="ttl-s">${won(sorted[0].price)}원부터 시작하고 표 밖의 돈은 없습니다</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '금액', url: `${siteUrl}/price/` }],
      jsonld: [S.faqPage(`${siteUrl}/price/`, qa)],
    }),
  };
}

/* ── 이용안내 ─────────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const lead = `<div class="note">
  <p>처음 부르시는 분께 맞춰 썼습니다. 통화 한 번이면 끝나는 일이라 오래 읽으실 것이 없습니다.</p>
</div>`;

  const what = node('need', '준비', '집에 있어야 하는 것은?',
    `<ul class="pt">
      <li>몸을 누일 자리 — 방바닥도 좋고 침대도 좋습니다.</li>
      <li>수건 두 장 — 집에 있던 것이면 됩니다. 오일 없는 코스라면 한 장으로 끝납니다.</li>
      <li>문이 닫히는 방 하나 — 가족이 함께 계셔도 상관없습니다.</li>
    </ul>
    <p class="nd-tail">깔개와 오일, 접이식 베드는 관리사가 지고 갑니다. 사다 두실 물건이 없습니다.</p>`,
    null, '01');

  const timing = node('when', '시각', '언제 부를 수 있나요?',
    factTable([
      ['접수', `${esc(cfg.hours)} — 시각과 상관없이 같은 번호`],
      ['도착', `${esc(cfg.arrive)}이 보통. 안쪽으로 더 들어가야 하면 그만큼 붙습니다`],
      ['미루기', '언제 하셔도 됩니다. 따로 무는 돈이 없습니다'],
      ['무르기', '관리사가 문 앞에 닿은 뒤라면 그 사실만 알려 주십시오'],
      ['가장 붐비는 때', '주말 들어가는 금요일 밤과 토요일 밤'],
      ['가장 한가한 때', '평일 낮 — 이 시간대는 기다림이 거의 없습니다'],
    ]), null, '02');

  const refuse = node('no', '못 하는 때', '접수를 돌려 드리는 경우는?',
    `<ul class="pt">
      <li>성적인 요구가 섞여 나올 때 — 통화를 그 자리에서 끝냅니다.</li>
      <li>열이 오르거나 다친 데가 부어 있을 때 — 날을 미뤄 드립니다.</li>
      <li>갈 곳을 끝까지 안 알려 주실 때 — 누구를 어디로 보낼지 정할 수가 없습니다.</li>
      <li>관리사 개인 연락처를 달라고 하실 때.</li>
      <li>병원 쪽이 맞아 보일 때 — 그쪽을 먼저 권해 드립니다.</li>
      <li>만 19세가 안 되셨을 때 — 받지 않습니다.</li>
    </ul>`,
    '돌려 드리는 경우에도 받는 돈은 없습니다.', '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르시는 곳'), 6, '05');

  const body = [lead, what, timing, stepList(seed, '04'), refuse, telCta(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, '06'), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('이용안내 — 부르는 법과 내는 법'),
      desc: clampDesc('처음 부르실 때 필요한 것만 모았습니다. 준비물, 접수 가능한 시각, 돌려 드리는 경우, 계산 방법을 차례로 적었습니다.'),
      h1: `이용안내 <span class="ttl-s">통화 한 번으로 끝나는 순서</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용안내', url: `${siteUrl}/guide/` }],
      jsonld: [S.faqPage(`${siteUrl}/guide/`, qa)],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const seed = 'company';

  const lead = `<div class="note">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 매장 없이 방문만 하는 곳입니다. 여러 업소를 늘어놓는 목록 사이트가 아니라, 저희가 직접 받는 창구 하나로 운영합니다.</p>
  <p>이름은 몸의 활력(vital)과 수월함(ease)에서 땄습니다. 세게 눌러 고치는 쪽이 아니라 편하게 풀어 두는 쪽을 택했다는 뜻입니다.</p>
</div>`;

  const line = node('line', '지키는 선', '어디까지 하고 어디서 멈추나요?',
    `<ul class="pt">
      <li>여기까지 합니다 — 손으로 근육을 풀어 드리는 일.</li>
      <li>여기서 멈춥니다 — 성적인 서비스는 어떤 형태로도 하지 않습니다.</li>
      <li>여기서 멈춥니다 — 병을 고치는 의료 행위는 하지 않습니다.</li>
      <li>만 19세 미만은 받지 않습니다.</li>
      <li>화면에 없는 것 — 후기와 평점. 지어낸 글이 섞이기 너무 쉽습니다.</li>
      <li>화면에 없는 것 — 사람 사진. 실물과 다른 사진이 도는 일이 흔합니다.</li>
      <li>지갑에서 미리 나가는 돈 — 예약금도 보증금도 없습니다.</li>
    </ul>`, null, '01');

  const how = node('data', '자료', '이 숫자들은 어떻게 뽑았나요?',
    `<div class="note">
      <p>지역 쪽의 넓이·테두리 길이·안쪽 깊이는 모두 공개된 행정동 경계 자료를 계산해 뽑았습니다. 넓이는 경계 도형의 면적, 테두리는 그 도형을 한 바퀴 돈 길이입니다.</p>
      <p>안쪽 깊이는 테두리 안에 점을 촘촘히 찍고 점마다 경계까지의 거리를 재서, <strong>가장 멀리 들어간 점</strong>의 거리를 쓴 값입니다. 모양은 넓이와 테두리로 셈한 뭉침 정도(4πA/P²)이고, 1에 가까울수록 동그랗습니다.</p>
      <p>경계 자료가 새로 나오면 다시 셈해서 화면의 값도 같이 바뀝니다. 사람이 직접 타이핑해 넣은 칸은 한 곳도 없습니다.</p>
    </div>
    ${factTable([
      ['경계 자료', esc(data.source)],
      ['판 번호', esc(data.version)],
      ['커버리지 기준', esc(data.coverageFrom)],
      ['쪽을 둔 단위', `시도 ${counts.sido} · 시군구 ${counts.gu} · 동읍 ${counts.spot}`],
      ['쪽이 없는 단위', `면 ${counts.myeon}곳 — 이름만 적음`],
    ])}`, null, '02');

  const body = [lead, line, how, telCta(cfg, '문의', seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko}는 어떤 곳인가`),
      desc: clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 그리고 지역 쪽의 숫자를 어떤 자료로 어떻게 계산했는지 적었습니다.`),
      h1: `${esc(cfg.brand.ko)} 소개 <span class="ttl-s">지키는 선과 자료 출처</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (목적)', '이 약관은 바이탈리즈(이하 "회사")가 제공하는 출장 방문 관리 서비스의 이용 조건과 절차, 회사와 이용자의 권리·의무를 정하는 데 목적이 있습니다.'],
  ['제2조 (접수 경로)', '접수는 사이트에 적힌 번호로 거는 통화로만 받습니다. 이 번호는 안심번호여서 이용자의 전화번호가 관리사에게 그대로 넘어가지 않습니다. 메신저·게시판·전자우편으로는 접수하지 않습니다.'],
  ['제3조 (서비스의 범위)', '회사는 이용자가 정한 장소로 관리사를 보내 손으로 근육을 풀어 주는 일을 합니다. 질병을 진단하거나 치료하는 의료 행위는 하지 않고, 성적 서비스도 제공하지 않습니다.'],
  ['제4조 (이용 자격)', '만 19세 이상만 이용할 수 있습니다. 미성년자의 접수는 받지 않습니다.'],
  ['제5조 (지역 정보의 성격)', '사이트에 적힌 넓이·테두리 길이·안쪽 깊이는 공개된 행정동 경계 자료를 계산한 값입니다. 도로 사정이나 실제 이동 시간을 보장하는 값이 아니며 참고용입니다.'],
  ['제6조 (요금과 결제)', '요금은 금액표와 같고 지역에 따라 달라지지 않습니다. 관리를 마친 자리에서 현금이나 카드로 받으며, 예약금·보증금 같은 사전 입금은 어떤 이름으로도 받지 않습니다.'],
  ['제7조 (변경과 취소)', '방문 전이라면 이용자는 언제든 시각을 옮기거나 취소할 수 있고 위약금이 없습니다. 다만 관리사가 도착한 뒤에 취소하실 때에는 곧바로 알려 주셔야 합니다.'],
  ['제8조 (회사의 거절권)', '아래에 해당하면 회사는 접수를 돌려보내거나 하던 관리를 멈출 수 있습니다. 첫째, 성적인 서비스를 요구할 때. 둘째, 관리사에게 거친 말이나 물리력을 쓰거나 개인 연락처를 달라고 할 때. 셋째, 갈 곳을 끝까지 알려 주지 않을 때. 넷째, 열이 있거나 상처가 벌어진 상태처럼 관리가 적절하지 않을 때.'],
  ['제9조 (이용자의 협조)', '이용자는 누울 공간과 수건을 준비해 주시고, 관리에 영향을 줄 수 있는 몸 상태가 있으면 접수할 때 알려 주셔야 합니다.'],
  ['제10조 (후기와 평점)', '회사는 후기나 평점을 모으지도 올리지도 않습니다. 이 사이트의 어떤 문장도 특정한 이용자의 경험을 옮겨 적은 것이 아닙니다.'],
  ['제11조 (책임의 한계)', '관리하는 동안 회사의 잘못으로 생긴 손해는 회사가 책임집니다. 다만 미리 알려 주지 않으신 몸 상태에서 비롯된 일, 그리고 천재지변이나 통신이 끊겨 늦어진 일까지는 책임지지 못합니다.'],
  ['제12조 (약관의 변경)', '약관을 고치면 사이트에 먼저 올리고 올린 날부터 적용합니다. 고친 뒤에 접수를 주시면 새 약관을 받아들이신 것으로 봅니다.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="note"><p>${esc(cfg.brand.ko)}의 이용약관을 아래에 그대로 둡니다. 전화를 주시는 순간 이 내용을 받아들이신 것으로 봅니다.</p></div>`,
    node('terms', '약관', '전문', `<div class="doc">${TERMS.map(([t, d]) => `<section><h3>${esc(t)}</h3><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    telCta(cfg, '약관 문의', 'terms'),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관입니다. 접수 경로, 서비스 범위, 요금과 결제, 변경·취소, 거절 사유를 ${TERMS.length}개 조문으로 적었습니다.`),
      h1: `이용약관 <span class="ttl-s">${TERMS.length}개 조문</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['1. 받아 적는 것', '통화에서 받아 적는 항목은 넷입니다 — 가실 주소, 연락될 번호, 고르신 코스, 원하시는 시각. 성함이나 태어난 날, 주민등록번호를 여쭙지 않습니다.'],
  ['2. 쓰임새', '적어 둔 내용은 관리사를 보내고 출발·도착을 알리는 데에만 씁니다. 나중에 홍보 문자를 돌리거나 다시 전화를 걸지 않습니다.'],
  ['3. 번호에 대하여', '화면의 번호는 안심번호로 걸어 두었습니다. 그래서 걸어 주신 번호가 관리사 쪽으로 넘어가지 않습니다.'],
  ['4. 보관 기간', '방문이 탈 없이 끝나면 그날 안에 지웁니다. 말이 오간 건만 마무리될 때까지 따로 남겨 둡니다.'],
  ['5. 바깥으로 내보내지 않음', '어떤 업체에도 넘기거나 맡기지 않습니다. 법에 따른 수사기관의 정당한 요청이 있을 때만 예외로 둡니다.'],
  ['6. 저절로 쌓이는 것', '이 사이트는 미리 만들어 둔 파일만 내보냅니다. 로그인도 장바구니도 댓글도 없고, 광고 추적이나 방문 분석 스크립트를 달지 않았습니다. 쿠키도 심지 않습니다.'],
  ['7. 요구하실 수 있는 것', '무엇을 가지고 있는지 보여 달라거나 지워 달라고 하실 수 있습니다. 같은 번호로 걸어 주시면 그 통화 안에서 끝냅니다.'],
  ['8. 맡은 사람', '개인정보를 맡은 사람은 사업자 정보가 정해지는 대로 이 줄에 적습니다. 그때까지는 화면의 번호가 창구 노릇을 합니다.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="note"><p>길지 않습니다. 받아 적는 것 자체가 적기 때문입니다.</p></div>`,
    node('pp', '방침', '전문', `<div class="doc">${PRIVACY.map(([t, d]) => `<section><h3>${esc(t)}</h3><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    telCta(cfg, '개인정보 문의', 'privacy'),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 듣는 것과 쓰는 곳, 두는 기간을 적었습니다. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트입니다.'),
      h1: `개인정보처리방침 <span class="ttl-s">받아 적는 것이 넷뿐입니다</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 기록장 목록 ──────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="note"><p>부르기 전에 알아 두면 덜 헤매실 것만 적습니다. 누가 받아 봤다는 글은 올리지 않습니다.</p></div>`,
    node('list', '기록장', `모아 둔 글 ${list.length}편`,
      `<ul class="pst">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><span>${esc(p.summary)}</span><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`,
      '새 글이 올라오면 RSS 로도 나갑니다.', '01'),
    telCta(cfg, '접수', 'magazine'),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('방문 기록장'),
      desc: clampDesc(`받기 전에 정해 두시면 좋은 것들을 ${list.length}편으로 적었습니다. 후기·체험담은 싣지 않습니다.`),
      h1: `방문 기록장 <span class="ttl-s">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '기록장', url: `${siteUrl}/magazine/` }],
      jsonld: [S.itemList(`${siteUrl}/magazine/#list`, '방문 기록장', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` })))],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h3>${esc(b[1])}</h3>`;
    if (b[0] === 'ul') return `<ul class="pt">${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="pmeta"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 방문 기록장</p>`,
    `<article class="doc art">${html}</article>`,
    telCta(cfg, '접수', p.slug),
    node('more', '다른 글', '이어서 읽을 것',
      `<ul class="pst">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><b>${esc(x.title)}</b><span>${esc(x.summary)}</span><time datetime="${x.date}">${x.date}</time></a></li>`).join('\n')}</ul>`,
      null, '01'),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '기록장', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const body = [
    `<div class="note"><p>주소가 옮겨 갔거나 처음부터 없던 쪽입니다. 아래에서 다시 짚어 주십시오.</p></div>`,
    node('back', '돌아가기', '자주 찾는 쪽',
      `<ul class="lnk">
        <li><a href="/">처음</a></li>
        <li><a href="/area/">받는 자리 전체</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/price/">금액</a></li>
        <li><a href="/guide/">이용안내</a></li>
        ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      </ul>`, null, '01'),
    telCta(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('찾는 쪽이 없습니다'),
      desc: '주소가 바뀌었거나 처음부터 없던 쪽입니다.',
      h1: '찾는 쪽이 없습니다',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}

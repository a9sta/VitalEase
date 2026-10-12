import { esc } from './util.mjs';
import * as S from './schema.mjs';

export const ASSET_V = '1';

/**
 * 공통 레이아웃.
 *   head  — SEO·GEO 메타 + JSON-LD
 *   푸터  — 네이버 C랭크 4신호(출처·최신성·수집 경로·정보량) + AI 활용 고지
 *
 * ★전화번호는 **telBtn() 으로만** 찍는다. 번호만 덩그러니 적힌 자리가 생기면 안 된다.
 *   ★2026-10-12 지시: 버튼에 **'안심번호' 글자는 넣지 않는다** — '예약 문의'와 번호만.
 *     번호의 성격은 이용약관과 개인정보처리방침에 그대로 적어 둔다(고지는 지우지 않는다).
 *
 * ★골격을 앞서 만든 다섯 사이트와 겹치지 않게 짰다.
 *   루네사      : 둥근 점머리 · 알약 버튼 · 4열 푸터
 *   리바이브모션: 왼쪽 눈금 레일 + 모노 순번 · 각진 판 · 4열 푸터
 *   세린터치    : 대괄호 머리표 · 점선 가름 · 둥근 블록 · 3열 푸터
 *   벨벳럽      : 굵은 괘선(3px) + 큰 순번 숫자 · 2열 푸터
 *   마루온      : 모눈 바탕 + 네 모서리 꺾쇠 · 세로 머리표 · 가로 띠 3단 푸터
 *   바이탈리즈  : **본문 왼쪽을 세로축이 끝까지 관통하고 섹션마다 동그란 마디**가 걸린다 ·
 *                 제목 밑 이중 밑줄 · 버튼 왼쪽에 굵은 세로 막대 · **2×2 바둑판 푸터**
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, bodyClass = '', pageKind = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/vital.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body class="${bodyClass}" data-kind="${pageKind}">
<a class="jump" href="#main">본문으로 건너뛰기</a>
${header(ctx, path)}
${crumbs.length > 1 ? crumbHtml(crumbs) : ''}
<main id="main">
<h1 class="ttl">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${callbar(cfg)}
<script src="/assets/vital.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── 예약 문의 버튼 ────────────────────────────────────────────────
   겉모습은 버튼이지만 `<a href="tel:">` 로 둔다 — <button> 이면 스크립트 없이는
   아무 일도 안 일어나고, 누르는 즉시 통화로 넘어가야 하기 때문이다.
   ★'안심번호' 라는 말은 넣지 않는다(지시). 라벨은 '예약 문의' 하나뿐이다.
   size: s(머리띠) · m(본문) · l(대문·하단 바) */
export function telBtn(cfg, { size = 'm', block = false } = {}) {
  return `<a class="vb vb-${size}${block ? ' vb-w' : ''}" href="tel:${cfg.telRaw}">
  <span class="vb-bar" aria-hidden="true"></span>
  <span class="vb-tx"><span class="vb-lb">${esc(cfg.telLabel)}</span><span class="vb-nm">${esc(cfg.tel)}</span></span>
  <span class="vb-ic" aria-hidden="true">${phoneMark()}</span>
</a>`;
}

/** 머리띠 — 상호와 버튼을 한 줄에, 메뉴는 그 아래 밑줄 탭으로 */
function header(ctx, path) {
  const { cfg } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  return `<header class="top">
  <div class="top-in">
    <a class="sig" href="/" aria-label="${esc(cfg.brand.ko)} 처음으로">
      ${pulseMark()}<span class="sig-t"><b>${esc(cfg.brand.ko)}</b><i>${esc(cfg.brand.en)}</i></span>
    </a>
    <div class="top-r">
      <p class="top-run"><span>${esc(cfg.hours)}</span><span>${esc(cfg.pay)}</span></p>
      ${telBtn(cfg, { size: 's' })}
    </div>
  </div>
  <nav class="tabs" aria-label="주요 메뉴">
    <a href="/area/"${on('/area/')}>받는 자리</a>
    <a href="/course/"${on('/course/')}>코스</a>
    <a href="/price/"${on('/price/')}>금액</a>
    <a href="/guide/"${on('/guide/')}>이용안내</a>
    <a href="/magazine/"${on('/magazine/')}>기록장</a>
  </nav>
</header>`;
}

function crumbHtml(crumbs) {
  return `<nav class="path" aria-label="현재 위치"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 푸터 = 네이버 C랭크 4신호 + AI 고지. **2×2 바둑판**. */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business;
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 책임자 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  return `<footer class="foot">
  <div class="foot-g">
    <section class="fq fq-a">
      <p class="fq-nm">${esc(cfg.brand.ko)}</p>
      <p class="fq-say">가게를 두지 않습니다. 부르시면 관리사가 그 주소로 갑니다. 쪽을 둔 단위는 시군구 ${counts.gu}곳과 동·읍 ${counts.spot}곳이고, 받는 번호는 아래 하나입니다.</p>
      ${telBtn(cfg, { size: 'm' })}
      <p class="fq-run">${esc(cfg.hours)} · ${esc(cfg.pay)} · 미리 보내실 돈 없음</p>
    </section>
    <nav class="fq fq-b" aria-label="지역 바로가기">
      <p class="fq-h">동·읍까지</p>
      <ul class="fq-chip">${main.map((r) => `<li><a href="/${r.slug}/">${r.name}</a></li>`).join('')}</ul>
      <p class="fq-h">시군구까지</p>
      <ul class="fq-chip fq-thin">${sub.map((r) => `<li><a href="/${r.slug}/">${r.name}</a></li>`).join('')}</ul>
      <p class="fq-sm"><a href="/area/">받는 자리 전체</a> · 면 ${counts.myeon}곳은 이름만</p>
    </nav>
    <nav class="fq fq-c" aria-label="안내 문서">
      <p class="fq-h">문서</p>
      <ul class="fq-ul">
        <li><a href="/guide/">이용안내</a></li>
        <li><a href="/price/">금액</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/company/">소개</a></li>
        <li><a href="/terms/">이용약관</a></li>
        <li><a href="/privacy/">개인정보처리방침</a></li>
      </ul>
    </nav>
    <nav class="fq fq-d" aria-label="최근 글과 수집 경로">
      <p class="fq-h">최근 기록</p>
      <ul class="fq-ul fq-post">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
      <ul class="fq-feed">
        <li><a href="/rss.xml">RSS</a></li>
        <li><a href="/sitemap.xml">사이트맵</a></li>
        <li><a href="/llms.txt">llms.txt</a></li>
      </ul>
      <p class="fq-sm">마지막 갱신 <time datetime="@@LM@@">@@LM@@</time></p>
    </nav>
  </div>
  <div class="foot-end">
    ${biz ? `<p class="fq-biz">${biz}</p>` : '<p class="fq-biz fq-dim">사업자 정보는 확인되는 대로 이 줄에 적습니다.</p>'}
    <p class="fq-ai">지역 설명의 둘레 길이·모양·안쪽 깊이는 공개 경계 자료를 계산해 뽑았고, 문장은 <strong>AI 도구의 도움을 받아 쓴 뒤</strong> 사람이 다시 읽어 고쳤습니다. 후기·체험담·평점을 싣지 않고 사람 사진도 쓰지 않습니다. 경계 자료: ${esc(data.source)}</p>
    <p class="fq-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 질병을 다루는 의료 행위가 아니며, 성적 서비스를 제공하지 않습니다.</p>
  </div>
</footer>`;
}

/** 모바일 하단 고정 바 */
function callbar(cfg) {
  return `<div class="dock">
  ${telBtn(cfg, { size: 'l', block: true })}
  <span class="dock-s">문 앞까지 ${esc(cfg.arrive)}</span>
</div>`;
}

/** 로고 — 세로축 하나에 마디 셋. 달·호·문·결·마루널과 겹치지 않는 모양. */
export function pulseMark() {
  return `<svg class="pmk" viewBox="0 0 26 26" aria-hidden="true" focusable="false"><path d="M5 2v22" stroke-width="2.6" stroke-linecap="square"/><circle cx="13.5" cy="7" r="3.1" fill="none" stroke-width="2.2"/><circle cx="18" cy="14.5" r="3.1" fill="none" stroke-width="2.2"/><circle cx="11" cy="21" r="3.1" fill="none" stroke-width="2.2"/></svg>`;
}
function phoneMark() {
  return `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4.2 1.6 6 1.2l1.5 3.3-1.6 1.2c.6 1.7 2 3.1 3.7 3.7l1.2-1.6 3.3 1.5-.4 1.8c-.2.8-.9 1.3-1.7 1.2C7.6 11.8 4.1 8.3 3 3.3c-.1-.8.4-1.5 1.2-1.7Z"/></svg>`;
}

/**
 * 섹션 틀 — 왼쪽 세로축에 걸린 **동그란 마디** 하나가 이 사이트의 표시다.
 *   │
 *   ●── 라벨 03
 *   │   큰 제목
 *   │   ══════   (이중 밑줄)
 */
export function node(id, label, h2, inner, sub, n) {
  return `<section class="nd" id="${id}" aria-labelledby="${id}-h">
  <span class="nd-dot" aria-hidden="true"></span>
  <header class="nd-h">
    <p class="nd-lb" aria-hidden="true">${esc(label)}<em>${n || '··'}</em></p>
    <h2 id="${id}-h">${h2}</h2>
    ${sub ? `<p class="nd-sb">${sub}</p>` : ''}
  </header>
  <div class="nd-b">${inner}</div>
</section>`;
}

import { esc, hash, shuffle, km, km2, won, josa } from './util.mjs';
import { node, telBtn } from './html.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ── 예약 문의 띠 ─────────────────────────────────────────────────
   번호가 본문 어디에 나오든 '예약 문의'가 붙은 버튼으로만 나온다. */
export function telCta(cfg, place, seedKey) {
  const h = hash(seedKey, 'cta');
  const lines = [
    `${place} 번지까지 들으면 어느 길목으로 붙을지가 그 자리에서 정해집니다.`,
    `${place}까지 지금 움직일 수 있는 사람이 있는지 통화에서 바로 확인해 드립니다.`,
    `${place} 방문은 코스와 시각, 주소 셋만 정하시면 더 물을 것이 없습니다.`,
    `${place} 요청을 받는 창구는 이 번호 하나입니다. 다른 경로를 두지 않았습니다.`,
  ];
  return `<section class="ring" aria-label="${esc(place)} 예약 문의">
  <p class="ring-p">${esc(at(h, lines))}</p>
  ${telBtn(cfg, { size: 'l' })}
  <p class="ring-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 ─────────────────────────────────────────────────────── */
export function courseGrid(courses, seedKey, place, num = '01') {
  const h = hash(seedKey, 'cg');
  // 일곱 설명을 다 달면 어느 쪽이든 같은 일곱 문장이 깔린다. 둘만 시드로 골라 단다.
  const withText = new Set(shuffle(courses.map((c) => c.slug), h).slice(0, 2));
  const list = courses.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<li class="cw">
    <a class="cw-a" href="/course/${c.slug}/">
      <span class="cw-k">${esc(c.ko)}</span>
      <span class="cw-v"><b>${won(c.price)}</b><i>원 / ${c.min}분</i></span>
      <span class="cw-p">세기 ${esc(c.pressure)}${c.oil ? ' · 오일 씀' : ' · 오일 안 씀'}</span>
    </a>
    ${withText.has(c.slug) ? `<p class="cw-d">${esc(line)}</p>` : ''}
  </li>`;
  }).join('');
  return node('course', '코스', `${esc(place)}에서 고르실 수 있는 일곱 가지`,
    `<ul class="cw-ul">${list}</ul>
     <p class="nd-tail">${esc(at(h, SEC.courseTail, 2))} ${at(h, SEC.courseLink, 5)}</p>`,
    at(h, SEC.courseSub, 1), num);
}

/* ── 접수 흐름 ────────────────────────────────────────────────── */
export function stepList(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  return node('step', '순서', esc(at(h, SEC.stepTitle, 1)),
    `<ol class="rn-ol">${steps.map((s, i) => `<li class="rn"><span class="rn-n">${i + 1}</span><div class="rn-b"><h3 class="rn-t">${esc(s.t)}</h3><p class="rn-d">${esc(s.d)}</p></div></li>`).join('\n')}</ol>`,
    at(h, SEC.stepSub, 2), num);
}

/* ── 빠른 정보 표 ─────────────────────────────────────────────── */
export function factTable(rows) {
  return `<table class="dat"><tbody>${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td></tr>`).join('\n')}</tbody></table>`;
}

/* ── 자주 묻는 것 ────────────────────────────────────────────────
   ★질문은 **h3 소제목**으로 낸다. AI 가 답을 찾을 때 먼저 보는 자리라
     dl/dt 로 두면 소제목으로 세어지지 않는다. 순번은 h3 **밖에** 둔다 —
     안에 넣으면 제목 글자가 "01바닥과…" 가 되어 질문으로 읽히지 않는다. */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'faq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = node('faq', '물음', esc(at(h, SEC.faqTitle, 3)),
    `<div class="ask">${qa.map((x, i) => `<div class="ask-i"><span class="ask-n" aria-hidden="true">${i + 1}</span><h3 class="ask-q">${esc(x.q)}</h3><p class="ask-a">${esc(x.a)}</p></div>`).join('')}</div>`,
    at(h, SEC.faqSub, 4), num);
  return { html, qa };
}

/* ── 안내/주의 ────────────────────────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return node('notice', '유의', esc(at(h, SEC.noticeTitle, 5)),
    `<ul class="pt">${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}</ul>`, null, num);
}

/* ── 롱테일 링크 격자 ─────────────────────────────────────────── */
export function longtail(pool, seedKey, n, label, heading, sub, num) {
  const h = hash(seedKey, 'lt');
  const picked = shuffle(pool, h).slice(0, n);
  const items = picked.map((p) => {
    const tpl = ANCHOR[parseInt(hash(seedKey, p.label).substr(0, 3), 16) % ANCHOR.length];
    return `<li><a href="${p.href}">${esc(tpl(p.label))}</a></li>`;
  }).join('');
  return node('longtail', label, heading, `<ul class="lnk">${items}</ul>`, sub || at(h, SEC.ltSub, 6), num);
}

/* ── 모양이 다른 자리 ───────────────────────────────────────────
   ★이 사이트의 성격을 가장 잘 보여 주는 칸이다. 거리순 '가까운 동'이 아니라
     **테두리 길이와 안쪽 깊이가 양끝인 자리**를 건다. */
export function shapeKin(sd, g, s, seedKey, num) {
  const pool = g.spots.filter((x) => x.slug !== s.slug);
  if (!pool.length) return '';
  const byPerim = pool.slice().sort((a, b) => b.perim - a.perim);
  const byDepth = pool.slice().sort((a, b) => b.depth - a.depth);
  const near = pool.slice().sort((a, b) => Math.abs(a.perim - s.perim) - Math.abs(b.perim - s.perim));
  const pick = [];
  const seen = new Set();
  const add = (x, why) => { if (x && !seen.has(x.slug)) { seen.add(x.slug); pick.push({ x, why }); } };
  add(byPerim[0], `테두리 ${km(byPerim[0].perim)}`);
  add(byPerim[byPerim.length - 1], `테두리 ${km(byPerim[byPerim.length - 1].perim)}`);
  add(byDepth[0], `깊이 ${km(byDepth[0].depth)}`);
  add(byDepth[byDepth.length - 1], `깊이 ${km(byDepth[byDepth.length - 1].depth)}`);
  for (const x of near.slice(0, 4)) add(x, `테두리 ${km(x.perim)}`);
  return node('shape', '생김새', `${esc(g.name)} 안에서 모양이 다른 자리`,
    `<ul class="kin">${pick.slice(0, 8).map(({ x, why }) => `<li><a href="/${sd.slug}/${g.slug}/${x.slug}/"><span class="kin-n">${esc(x.name)}</span><span class="kin-m">${esc(why)}</span></a></li>`).join('\n')}</ul>`,
    at(hash(seedKey, 'kn'), SEC.shapeSub), num);
}

/* ── 구 안의 자리 목록 ──────────────────────────────────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const items = g.spots.map((s) => `<li${s.slug === currentSlug ? ' class="cur"' : ''}>
    <a href="/${sd.slug}/${g.slug}/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}>
      <span class="idx-n">${esc(s.name)}</span>
      <span class="idx-m">둘레 ${km(s.perim)} · 깊이 ${km(s.depth)}</span>
    </a></li>`).join('\n');
  return node('spotidx', '자리', `${esc(g.name)} 안에 적어 둔 자리 ${g.spotCount}곳`,
    `<ul class="idx">${items}</ul>`,
    at(hash(seedKey, 'sx'), SEC.spotIdxSub), num);
}

/* ── 시군구 안의 면 목록 ───────────────────────────────────────── */
export function myeonList(g, seedKey, num) {
  if (!g.myeonCount) return '';
  return node('myeon', '면', `${esc(g.name)}에 딸린 면 ${g.myeonCount}곳`,
    `<ul class="nmz">\n${g.myeon.map((m) => `<li>${esc(m)}</li>`).join('\n')}\n</ul>`,
    at(hash(seedKey, 'my'), SEC.myeonSub), num);
}

/* ── 서브 지역 시군구 안의 동 이름 ─────────────────────────────── */
export function dongNameList(g, seedKey, num) {
  if (!g.dongNames || !g.dongNames.length) return '';
  return node('dongidx', '행정동', `${esc(g.name)}에 속한 동 ${g.dongNames.length}곳`,
    `<ul class="nmz">\n${g.dongNames.map((d) => `<li>${esc(d)}</li>`).join('\n')}\n</ul>`,
    at(hash(seedKey, 'dn'), SEC.dongSub), num);
}

/* ── 시도 안의 시군구 목록 ────────────────────────────────────── */
export function guIndex(sd, seedKey, currentSlug, num) {
  const items = sd.gu.map((g) => `<li${g.slug === currentSlug ? ' class="cur"' : ''}>
    <a href="/${sd.slug}/${g.slug}/"${g.slug === currentSlug ? ' aria-current="page"' : ''}>
      <span class="idx-n">${esc(g.name)}</span>
      <span class="idx-m">행정동 ${g.dongCount}${g.myeonCount ? ` · 면 ${g.myeonCount}` : ''}</span>
    </a></li>`).join('\n');
  return node('guidx', '시군구', `${esc(sd.name)}을 이루는 시군구 ${sd.gu.length}곳`,
    `<ul class="idx">${items}</ul>`,
    at(hash(seedKey, 'gi'), SEC.guIdxSub), num);
}

/* ── 맞닿은 시군구 (길을 거는 용도) ──────────────────────────── */
export function touchList(sd, g, seedKey, num) {
  if (!g.touchCount) return '';
  const items = g.touching.map((t) => `<li><a href="/${t.sidoSlug}/${t.slug}/">${esc(t.gu)}<span>${t.same ? `같은 ${esc(sd.name)}` : esc(t.sido)}</span></a></li>`).join('\n');
  return node('touch', '이웃', `${esc(g.name)}${josa(g.name, '과/와')} 테두리를 맞댄 시군구 ${g.touchCount}곳`,
    `<ul class="nbr">${items}</ul>`,
    '가장자리 주소는 옆 시군구에서 넘어가는 쪽이 빠른 날도 있습니다.', num);
}

/* ── 아래쪽 안내 링크 (글·약관 등 얕은 쪽용) ─────────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return node('also', '더 보기', '이어서 볼 곳',
    `<ul class="lnk">
      <li><a href="/area/">받는 자리 전체</a></li>
      <li><a href="/guide/">이용안내</a></li>
      <li><a href="/price/">금액</a></li>
      <li><a href="/course/">코스</a></li>
      <li><a href="/magazine/">기록장</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('\n')}
    </ul>`,
    '쪽은 시도에서 시군구로, 수도권과 부산만 동·읍까지 내려갑니다. 그 아래 면과 서브 지역의 동은 목록에 이름으로만 올라 있습니다.');
}

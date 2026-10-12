/**
 * 타이틀·디스크립션 정본.
 *
 * ★토막 모양을 앞선 다섯 사이트와 전부 다르게 둔다. 같은 뼈대에 단어만 갈면 그것도 중복이다.
 *     루네사       `{동} 출장 {코스어} 마사지·홈타이 - 루네사 | {시도} {행동어}`
 *     리바이브모션 `{구} 출장마사지 {코스어} 홈타이 | {시도} {구} 방문 {행동어} - 리바이브모션`
 *     세린터치     `{동} 출장마사지 홈타이 {코스어} · {구} {동} 방문 {행동어} | 세린터치`
 *     벨벳럽       `{동} {코스어} 출장마사지 홈타이 — {구} {동} 방문 {행동어} · 벨벳럽`
 *     마루온       `{동} 출장마사지·홈타이 {코스어} | {구} {동} {행동어} — 마루온`
 *     바이탈리즈   `{동} 출장마사지 홈타이 ({구}) · {코스어} {행동어} | 바이탈리즈`
 *   ★**괄호**로 상위 지역을 묶는 모양은 여기서 처음 쓴다. 다섯 사이트 중 괄호를 쓰는 곳이 없다.
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 *
 * ★설명문은 **100자 안쪽**으로 둔다(80자 안팎이 가장 안전하다). 가운데 토막은
 *   그 자리에서만 나오는 실측값(둘레·안쪽 깊이·모양)으로 채워 전부 달라지게 한다.
 */
import { hash, km, km2, josa } from './util.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '바이탈리즈';
const KEY = '출장마사지 홈타이';

/** 제목에 끼우는 코스어 — 실제로 받는 일곱 가지에서만 돌린다. */
const COURSE_WORD = ['스웨디시', '아로마', '타이', '딥티슈', '림프', '스포츠', '건식'];
/** 제목 꼬리 행동어 */
const ACT = ['들어가는 길 보기', '도착까지 몇 분', '심야 접수', '지금 통화', '오늘 방문'];

/* ── 제목 ─────────────────────────────────────────────────────────── */
export const title = {
  home: () => `${BRAND} ${KEY} (서울·인천·경기·부산) · 동읍 방문 관리 24시 | 지금 통화`,
  areaHub: (c) => `${KEY} 받는 자리 동읍 ${c.spot}곳 (시군구 ${c.gu}곳) · 전체 목록 | ${BRAND}`,
  sido: (sd) => `${sd.name} ${KEY} (${sd.main ? `동읍 ${sd.spotCount}곳` : `시군구 ${sd.gu.length}곳`}) · 방문 ${at(hash(sd.name, 'sdt'), ACT)} | ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    return `${g.name} ${KEY} (${sd.name}) · ${g.main ? `동읍 ${g.spotCount}곳` : `행정동 ${g.dongCount}곳`} ${at(h, ACT, 0)} | ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${s.name} ${KEY} (${g.name}) · ${at(h, COURSE_WORD, 0)} ${at(h, ACT, 1)} | ${BRAND}`;
  },
  course: (c) => `${c.ko} ${KEY} (${c.min}분 ${c.price.toLocaleString('ko-KR')}원) · 세기 ${c.pressure} | ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} ${KEY} (${sd.name}) · 방문 ${at(hash(sd.name, c.slug), ACT)} | ${BRAND}`,
  page: (t) => `${t} | ${BRAND} ${KEY}`,
  post: (p) => `${p.title} | ${BRAND} 방문 기록장`,
};

/* ── 디스크립션 ───────────────────────────────────────────────────── */
/** 동 설명 가운데 토막 — 둘레·안쪽 깊이·모양으로만 짠다. */
function spotMiddle(sd, g, s, h) {
  const frames = [
    () => `둘레 ${km(s.perim)}에 넓이 ${km2(s.area)}, 안쪽 깊이 ${km(s.depth)}`,
    () => `테두리에서 가장 깊이 들어간 지점까지 ${km(s.depth)}`,
    () => `경계 한 바퀴가 ${km(s.perim)}이고 안은 ${km2(s.area)}`,
    () => `${s.kind === '읍' ? `${g.name}에서 길이 모이는 읍, 둘레 ${km(s.perim)}` : `둘레 ${km(s.perim)}·깊이 ${km(s.depth)}짜리 자리`}`,
    () => `넓이 ${km2(s.area)}에 안쪽 깊이 ${km(s.depth)}, 들어가는 길이 갈립니다`,
    () => `테두리 ${km(s.perim)}, 가장 안쪽까지 ${km(s.depth)}`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '마친 뒤에 계산합니다',
  '먼저 보내실 돈이 없습니다',
  '새벽에도 금액이 같습니다',
  '길 값을 붙이지 않습니다',
  '값은 끝나고 받습니다',
];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () =>
    '서울·인천·경기·부산은 동·읍까지, 그 밖 지정 지역은 시군구까지 적은 출장마사지 홈타이 방문 안내. 큰길에서 집까지 남은 거리를 먼저 봅니다.',
  areaHub: (c) =>
    `출장마사지 홈타이를 받는 동·읍 ${c.spot}곳과 시군구 ${c.gu}곳. 자리마다 둘레 길이와 안쪽 깊이를 적어 두었습니다.`,
  sido: (sd) =>
    sd.main
      ? `${sd.name} ${KEY} 방문 안내. 시군구 ${sd.gu.length}곳과 동·읍 ${sd.spotCount}곳에 쪽을 두었습니다. 후불이고 24시간 받습니다.`
      : `${sd.name} ${KEY} 방문 안내. 시군구 ${sd.gu.length}곳에 쪽을 두었고 동 이름은 그 안에 있습니다. 후불이고 24시간 받습니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const mid = g.main
      ? [
        `동·읍 ${g.spotCount}곳에 쪽을 두었고 넓이는 ${km2(g.area)}`,
        g.deepest ? `안쪽이 가장 깊은 자리는 ${g.deepest}, 테두리에서 ${km(g.deepestKm)}` : `넓이 ${km2(g.area)}`,
        g.longest ? `테두리가 가장 긴 자리는 ${g.longest}, 한 바퀴 ${km(g.longestKm)}` : `넓이 ${km2(g.area)}`,
        `${km2(g.area)} 안에 받는 자리 ${g.spotCount}곳`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : [
        `행정동 ${g.dongCount}곳이 들어 있고 넓이는 ${km2(g.area)}`,
        `맞닿은 시군구 ${g.touchAll}곳과 테두리를 나눠 가진 ${km2(g.area)}`,
        g.myeonCount ? `동 ${g.dongNames.length}곳과 면 ${g.myeonCount}곳 모두 받습니다` : `동 ${g.dongNames.length}곳 어디서나 같은 번호로 받습니다`,
      ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} ${KEY} 방문. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY} 방문. ${spotMiddle(sd, g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) =>
    `${c.ko} 출장 방문 안내. ${c.focus}${josa(c.focus, '을/를')} 보고 세기는 ${c.pressure}입니다. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원, 지역을 타지 않습니다.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} ${KEY} 방문. ${c.focus}에 시간을 쓰고 세기는 ${c.pressure}입니다. ${sd.name} 어디서나 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원.`,
  post: (p) => p.summary,
};

/** 설명이 예산을 넘기면 문장 단위로 자른다. */
export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}

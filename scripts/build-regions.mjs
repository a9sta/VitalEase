/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 커버리지는 두 층이다.
 *   **메인** 서울·인천·경기·부산 — 행정동(동·읍)마다 쪽을 낸다.
 *   **서브** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군 — 시군구까지만.
 *   ★면(面)은 어느 층에서도 쪽을 내지 않는다. 이름만 적고 접수는 받는다.
 *
 * ★★이 사이트가 쓰는 사실은 **경계선의 길이와 모양**이다.
 *   - 둘레(km) : 경계를 따라 한 바퀴 돈 길이
 *   - 뭉침 정도 : 4πA/P² — 1 에 가까울수록 동그랗고, 낮을수록 들쭉날쭉하다
 *   - 안쪽 깊이 : 동 안에서 **경계로부터 가장 멀리 들어간 지점까지의 거리**
 *   앞서 만든 다섯 사이트가 중심점 거리·방위·면적순위·끝과 끝 거리·맞닿음을 이미 썼다.
 *   둘레와 모양은 그 어느 쪽과도 겹치지 않는 축이다.
 *   ★맞닿음은 **길을 거는 데만** 쓰고 문장에서는 숫자로 내세우지 않는다(마루온이 그 축이다).
 *
 *   node scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
/* 경계 자료가 광주·전남을 `전남광주통합특별시` 한 덩어리로 묶어 두었다. 다섯 구가 광주다. */
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
/* ★메인 시도 안이라도 섬·산골만 있는 군은 뺀다. 옹진군은 전부 섬이고 군위군은 전부 읍·면이라
   방문이 성립하지 않는다 — 쪽을 내 봐야 비어 있는 쪽만 는다. */
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하 ─────────────────────────────────────────────────── */
const R = 6371.0088;
const rad = (d) => (d * Math.PI) / 180;
function haversine(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
function ringStats(ring, lat0) {
  const kx = Math.cos(rad(lat0)) * 111.32, ky = 110.574;
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    const x1 = ring[i][0] * kx, y1 = ring[i][1] * ky;
    const x2 = ring[i + 1][0] * kx, y2 = ring[i + 1][1] * ky;
    const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  a /= 2;
  if (!a) return { area: 0, cx: 0, cy: 0 };
  return { area: a, cx: cx / (6 * a), cy: cy / (6 * a), kx, ky };
}
function shapeStats(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const lat0 = polys[0][0][0][1];
  let A = 0, X = 0, Y = 0, kx = 0, ky = 0;
  let w = 180, e = -180, s = 90, n = -90;
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      if (idx === 0) for (const c of ring) {
        if (c[0] < w) w = c[0]; if (c[0] > e) e = c[0];
        if (c[1] < s) s = c[1]; if (c[1] > n) n = c[1];
      }
      const st = ringStats(ring, lat0);
      if (!st.area) return;
      kx = st.kx; ky = st.ky;
      const sign = (idx === 0 ? 1 : -1) * Math.abs(st.area);
      A += sign; X += st.cx * sign; Y += st.cy * sign;
    });
  }
  if (!A) return null;
  const mid = (s + n) / 2;
  return {
    area: Math.abs(A), lng: (X / A) / kx, lat: (Y / A) / ky,
    wide: haversine({ lat: mid, lng: w }, { lat: mid, lng: e }),
    tall: haversine({ lat: s, lng: (w + e) / 2 }, { lat: n, lng: (w + e) / 2 }),
  };
}
/** 경계 한 바퀴 길이(km) — 바깥 고리만 센다. */
function perimeterOf(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let p = 0;
  for (const poly of polys) {
    const ring = poly[0];
    for (let i = 0, n = ring.length - 1; i < n; i++) {
      p += haversine({ lat: ring[i][1], lng: ring[i][0] }, { lat: ring[i + 1][1], lng: ring[i + 1][0] });
    }
  }
  return p;
}
/** 점이 고리 안에 있는가(홀짝 규칙) */
function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
/** 점에서 선분까지의 거리(평면 근사·km) */
function segDist(px, py, ax, ay, bx, by, kx, ky) {
  const PX = px * kx, PY = py * ky, AX = ax * kx, AY = ay * ky, BX = bx * kx, BY = by * ky;
  const dx = BX - AX, dy = BY - AY;
  const L = dx * dx + dy * dy;
  let t = L ? ((PX - AX) * dx + (PY - AY) * dy) / L : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = AX + t * dx, cy = AY + t * dy;
  return Math.hypot(PX - cx, PY - cy);
}
/**
 * 안쪽 깊이 — 동 안에서 **경계로부터 가장 멀리 들어간 지점**까지의 거리(km).
 * 격자를 한 번 훑고 가장 깊은 칸 둘레를 다시 잘게 훑는다(2단).
 * 이 값이 크면 큰길에서 집까지 더 들어가야 한다는 뜻이고, 도착 시각 편차가 커진다.
 */
function innerDepth(geom, lat0) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  // 가장 넓은 바깥 고리 하나만 본다(섬이 딸린 동은 본섬 기준).
  let ring = null, best = -1;
  for (const poly of polys) {
    const r = poly[0];
    const s = Math.abs(ringStats(r, lat0).area || 0);
    if (s > best) { best = s; ring = r; }
  }
  if (!ring || ring.length < 4) return 0;
  const kx = Math.cos(rad(lat0)) * 111.32, ky = 110.574;
  let w = 180, e = -180, s0 = 90, n0 = -90;
  for (const c of ring) {
    if (c[0] < w) w = c[0]; if (c[0] > e) e = c[0];
    if (c[1] < s0) s0 = c[1]; if (c[1] > n0) n0 = c[1];
  }
  const segs = [];
  for (let i = 0, n = ring.length - 1; i < n; i++) segs.push([ring[i][0], ring[i][1], ring[i + 1][0], ring[i + 1][1]]);
  const probe = (x, y) => {
    if (!inRing(x, y, ring)) return -1;
    let m = Infinity;
    for (const g of segs) {
      const d = segDist(x, y, g[0], g[1], g[2], g[3], kx, ky);
      if (d < m) m = d;
    }
    return m;
  };
  let bx = (w + e) / 2, by = (s0 + n0) / 2, bd = -1;
  let gw = (e - w) / 22, gh = (n0 - s0) / 22;
  for (let i = 1; i < 22; i++) for (let j = 1; j < 22; j++) {
    const x = w + gw * i, y = s0 + gh * j;
    const d = probe(x, y);
    if (d > bd) { bd = d; bx = x; by = y; }
  }
  if (bd < 0) return 0;
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
    const x = bx + (gw / 4) * i, y = by + (gh / 4) * j;
    const d = probe(x, y);
    if (d > bd) { bd = d; }
  }
  return bd;
}
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
/** `포항시남구` → `포항시 남구` */
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* 꼭짓점 공유로 맞닿음을 판정한다. 전국 전체를 훑어야 커버리지 밖 이웃까지 **정직하게** 센다. */
const vkey = (c) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
const vertex = new Map();                   // 꼭짓점 → Set(행정동코드)
const byCode = new Map();                   // 행정동코드 → 레코드
const buckets = new Map();                  // '서울|강남구' → [레코드]

for (const ft of geo.features) {
  const p = ft.properties;
  const code = String(p.adm_cd2);
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const polys = ft.geometry.type === 'Polygon' ? [ft.geometry.coordinates] : ft.geometry.coordinates;
  const vs = new Set();
  for (const poly of polys) for (const ring of poly) for (const c of ring) vs.add(vkey(c));
  for (const k of vs) {
    if (!vertex.has(k)) vertex.set(k, new Set());
    vertex.get(k).add(code);
  }
  const [sidoKey, meta, isMain] = sidoOf(p);
  const st = shapeStats(ft.geometry);
  if (!st) continue;
  const rec = {
    code, name, kind: kindOf(name), sidoKey, isMain,
    sggnm: p.sggnm, sidonm: p.sidonm,
    lat: r6(st.lat), lng: r6(st.lng), area: r2(st.area),
    wide: r1(st.wide), tall: r1(st.tall),
  };
  if (sidoKey && isMain && rec.kind !== '면') {
    rec.perim = r1(perimeterOf(ft.geometry));
    rec.depth = Math.round(innerDepth(ft.geometry, st.lat) * 1000) / 1000;
    rec.round = rec.perim ? Math.round((4 * Math.PI * st.area / (rec.perim * rec.perim)) * 1000) / 1000 : 0;
  }
  byCode.set(code, rec);
  if (!sidoKey) continue;
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/* 꼭짓점 2개 이상을 나눠 가지면 경계를 맞댄 것으로 본다(1개는 모서리만 스친 것). */
const touch = new Map();                    // 코드 → Map(코드 → 공유 꼭짓점 수)
for (const set of vertex.values()) {
  if (set.size < 2) continue;
  const arr = [...set];
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++) {
      for (const [a, b] of [[arr[i], arr[j]], [arr[j], arr[i]]]) {
        if (!touch.has(a)) touch.set(a, new Map());
        touch.get(a).set(b, (touch.get(a).get(b) || 0) + 1);
      }
    }
}
const neighborsOf = (code) => {
  const m = touch.get(code);
  if (!m) return [];
  return [...m.entries()].filter(([, n]) => n >= 2).map(([c]) => c);
};

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  let A = 0, X = 0, Y = 0;
  for (const d of list) { A += d.area; X += d.lng * d.area; Y += d.lat * d.area; }
  const spots = list.filter((d) => d.kind !== '면');
  const myeon = list.filter((d) => d.kind === '면').map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko'));
  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name),
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: list.length, myeon, myeonCount: myeon.length,
    spots: [],
    /* 서브 지역은 동 쪽을 내지 않으므로 이름만 적어 둔다. */
    dongNames: isMain ? [] : list.filter((d) => d.kind !== '면').map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    codes: list.map((d) => d.code),
  };
  if (isMain) {
    const used = new Set();
    for (const d of spots) {
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      const s = {
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area, wide: d.wide, tall: d.tall,
        perim: d.perim || 0, depth: d.depth || 0, round: d.round || 0, guKey: k,
      };
      g.spots.push(s); spotAll.push(s);
    }
  }
  g.spotCount = g.spots.length;
  guAll.push(g);
}

/* ── 맞닿음을 쪽에서 쓸 모양으로 바꾼다 ───────────────────── */
const spotByCode = new Map(spotAll.map((s) => [s.code, s]));
const guByRaw = new Map(guAll.map((g) => [`${g.sidoKey}|${g.raw}`, g]));
for (const g of guAll) for (const s of g.spots) {
  s.gu = g.name; s.guSlug = g.slug; s.sido = g.sidoKey; s.sidoSlug = MAIN[g.sidoKey].slug;
}
for (const s of spotAll) {
  const g = guByRaw.get(`${s.sido}|${guAll.find((x) => x.slug === s.guSlug && x.sidoKey === s.sido).raw}`);
  const all = neighborsOf(s.code).map((c) => byCode.get(c)).filter(Boolean);
  s.adjCount = all.length;                                   // 맞닿은 행정동 전체(면·커버리지 밖 포함)
  const linked = [];
  for (const o of all) {
    const t = spotByCode.get(o.code);
    if (!t) continue;
    linked.push({
      name: t.name, slug: t.slug, gu: t.gu, guSlug: t.guSlug,
      sido: t.sido, sidoSlug: t.sidoSlug, sameGu: t.guSlug === s.guSlug && t.sido === s.sido,
      km: r1(haversine(s, t)),
    });
  }
  linked.sort((a, b) => (a.sameGu === b.sameGu ? a.km - b.km : a.sameGu ? -1 : 1));
  s.adj = linked;
  s.outCount = linked.filter((o) => !o.sameGu).length;       // 구 밖과 맞닿은 수
  s.ratio = s.tall ? r2(s.wide / s.tall) : 1;
  delete s.guKey;
}

/* 구끼리 맞닿음 — 동 맞닿음에서 끌어올린다(거리로 재지 않는다)
   ★전국 전체를 상대로 센다. 커버리지 안쪽만 세면 "맞닿은 시군구 0곳"처럼
     사실이 아닌 숫자가 나온다(당진·제천·강릉·정읍은 이웃이 커버리지 밖일 뿐이다). */
const codeGu = new Map();
for (const g of guAll) for (const c of g.codes) codeGu.set(c, g);
const codeSgg = new Map();                 // 전국 — 코드 → '시도|시군구'
for (const [code, r] of byCode) codeSgg.set(code, `${r.sidonm}|${r.sggnm}`);
for (const g of guAll) {
  const set = new Map();
  const all = new Set();
  const selfKey = codeSgg.get(g.codes[0]);
  for (const c of g.codes) for (const n of neighborsOf(c)) {
    const key = codeSgg.get(n);
    if (key && key !== selfKey) all.add(key);
    const o = codeGu.get(n);
    if (!o || o === g) continue;
    set.set(o, (set.get(o) || 0) + 1);
  }
  g.touching = [...set.entries()].sort((a, b) => b[1] - a[1])
    .map(([o]) => ({ sido: o.sidoKey, sidoSlug: (MAIN[o.sidoKey] || SUB[o.sidoKey]).slug, gu: o.name, slug: o.slug, same: o.sidoKey === g.sidoKey }));
  g.touchAll = all.size;                   // 전국 기준 — 정직한 수
  g.touchCount = g.touching.length;        // 이 사이트에 쪽이 있는 수
}

/* 시군구 안에서 모양이 극단인 자리 — 쪽에서 바로 쓰는 값이라 여기서 미리 뽑아 둔다. */
for (const g of guAll) {
  if (!g.spots.length) continue;
  const byDepth = g.spots.slice().sort((a, b) => b.depth - a.depth);
  const byPerim = g.spots.slice().sort((a, b) => b.perim - a.perim);
  const byRound = g.spots.slice().sort((a, b) => b.round - a.round);
  g.deepest = byDepth[0].name; g.deepestKm = byDepth[0].depth; g.deepestSlug = byDepth[0].slug;
  g.shallowest = byDepth[byDepth.length - 1].name; g.shallowestKm = byDepth[byDepth.length - 1].depth;
  g.longest = byPerim[0].name; g.longestKm = byPerim[0].perim; g.longestSlug = byPerim[0].slug;
  g.shortest = byPerim[byPerim.length - 1].name; g.shortestKm = byPerim[byPerim.length - 1].perim;
  g.roundest = byRound[0].name; g.roundestSlug = byRound[0].slug;
  g.jagged = byRound[byRound.length - 1].name; g.jaggedSlug = byRound[byRound.length - 1].slug;
  /* 자리마다 '이 구 안에서 몇 번째로 테두리가 긴가' */
  byPerim.forEach((s, i) => { s.perimRank = i + 1; });
  byDepth.forEach((s, i) => { s.depthRank = i + 1; });
}

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  let A = 0, X = 0, Y = 0;
  for (const g of gus) { A += g.area; X += g.lng * g.area; Y += g.lat * g.area; }
  const c = { lat: Y / A, lng: X / A };
  gus.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  for (const g of gus) {
    g.spots.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    delete g.sidoKey; delete g.codes;
  }
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: !!MAIN[key],
    lat: r6(c.lat), lng: r6(c.lng), area: r1(A),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    gu: gus,
  });
}

const out = {
  version: VERSION,
  source: 'admdongkor (https://github.com/vuski/admdongkor) · CC BY 4.0 · 원자료 국가공간정보포털 행정동 경계',
  built: new Date().toISOString().slice(0, 10),
  coverageFrom: '서울·인천·경기·부산은 동·읍마다 쪽을 내고, 대전·대구·울산 전역과 광주 광산구, 지정 시·군은 시군구까지만 낸다. 면은 어느 층에서도 쪽 없이 이름만 올린다.',
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    dong: spotAll.filter((s) => s.kind === '동').length,
    eup: spotAll.filter((s) => s.kind === '읍').length,
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
    adjPair: spotAll.reduce((s, x) => s + x.adj.length, 0) / 2,
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점 ${C.spot} = 동 ${C.dong} + 읍 ${C.eup} · 면 ${C.myeon} · 행정동 합 ${C.admin} · 맞닿은 쌍 ${C.adjPair}`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 거점 ${String(s.spotCount).padStart(4)} · 면 ${String(s.myeonCount).padStart(3)}`);
const lonely = spotAll.filter((s) => !s.adj.length);
if (lonely.length) console.log(`★맞닿은 이웃이 쪽으로 없는 거점 ${lonely.length}곳: ${lonely.slice(0, 12).map((s) => `${s.gu} ${s.name}`).join(', ')}`);
const noSpot = guAll.filter((g) => g.main && !g.spotCount);
if (noSpot.length) console.log(`★거점 없는 메인 시군구 ${noSpot.length}곳: ${noSpot.map((g) => g.name).join(', ')}`);

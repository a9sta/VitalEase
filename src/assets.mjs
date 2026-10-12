import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구를 쓰지 않는다.
 * ★무늬는 **본문을 관통하는 세로축 + 섹션마다 걸린 동그란 마디**다.
 *   앞선 다섯(둥근 점머리 / 눈금 레일 / 대괄호 머리표 / 굵은 괘선+큰 숫자 / 모눈+모서리 꺾쇠)과
 *   겹치지 않는 축을 하나 더 잡은 것이다.
 * ★스크립트에 무작위가 없다. 같은 주소면 늘 같은 화면이어야 한다.
 */
export const THEME = {
  paper: '#F7F5FA', card: '#FFFFFF', soft: '#EFEBF4',
  ink: '#241B2E', dim: '#5F5670',
  acc: '#6B2FA0', accDk: '#4E2178', accSoft: '#EDE4F7',
  line: '#D8D2E2', warn: '#A03030',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--card:${t.card};--soft:${t.soft};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accSoft:${t.accSoft};--line:${t.line};--warn:${t.warn};
  --axis:18px;--rad:10px;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);
  line-height:1.78;font-size:16px;letter-spacing:-.01em;padding-bottom:84px}
@media (min-width:860px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--accDk);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
.jump{position:absolute;left:-9999px}
.jump:focus{position:fixed;left:12px;top:12px;z-index:60;background:var(--ink);color:#fff;padding:10px 14px;border-radius:6px}

/* ── 머리띠 ───────────────────────────────────────── */
.top{background:var(--card);border-bottom:1px solid var(--line)}
.top-in{max-width:1060px;margin:0 auto;padding:15px 18px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.sig{display:inline-flex;align-items:center;gap:10px;color:var(--ink)}
.sig:hover{text-decoration:none}
.pmk{width:26px;height:26px;stroke:var(--acc);fill:none}
.sig-t b{display:block;font-size:19px;font-weight:800;letter-spacing:-.02em;line-height:1.15}
.sig-t i{display:block;font-style:normal;font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--dim)}
.top-r{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.top-run{margin:0;font-size:11px;color:var(--dim);text-align:right}
.top-run span{display:block}
.tabs{max-width:1060px;margin:0 auto;padding:0 18px;display:flex;gap:4px;overflow-x:auto}
.tabs a{padding:10px 14px 9px;font-size:14px;font-weight:700;color:var(--dim);white-space:nowrap;border-bottom:3px solid transparent}
.tabs a:hover{color:var(--accDk);text-decoration:none}
.tabs a[aria-current]{color:var(--accDk);border-bottom-color:var(--acc)}

/* ── 빵부스러기 ───────────────────────────────────── */
.path{max-width:1060px;margin:0 auto;padding:12px 18px 0}
.path ol{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;font-size:12px;color:var(--dim)}
.path li+li::before{content:"›";margin-right:6px;color:var(--line)}

/* ── 본문 — 왼쪽을 세로축이 관통한다 ──────────────── */
main{max-width:1060px;margin:0 auto;padding:18px 18px 56px;position:relative}
@media (min-width:720px){
  main{padding-left:46px}
  main::before{content:"";position:absolute;left:var(--axis);top:28px;bottom:56px;width:2px;background:var(--line)}
}
.ttl{font-size:25px;line-height:1.36;font-weight:800;letter-spacing:-.03em;margin:14px 0 22px;padding-bottom:12px;
  border-bottom:1px solid var(--line);box-shadow:0 3px 0 -2px var(--acc)}
@media (min-width:720px){.ttl{font-size:32px}}
.ttl-s{display:block;font-size:14px;font-weight:600;color:var(--dim);letter-spacing:-.01em;margin-top:6px}
.note p{margin:0 0 14px;font-size:15.5px}
.note{margin-bottom:24px}

/* ── 섹션: 마디 ───────────────────────────────────── */
.nd{position:relative;background:var(--card);border:1px solid var(--line);border-radius:var(--rad);
  padding:22px 20px;margin:0 0 20px}
.nd-dot{display:none}
@media (min-width:720px){
  .nd-dot{display:block;position:absolute;left:-34px;top:26px;width:14px;height:14px;border-radius:50%;
    background:var(--card);border:3px solid var(--acc)}
  .nd::before{content:"";position:absolute;left:-21px;top:32px;width:20px;height:2px;background:var(--line)}
}
.nd-h{margin-bottom:16px}
.nd-lb{margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:.16em;color:var(--acc);display:flex;align-items:center;gap:8px}
.nd-lb em{font-style:normal;font-family:var(--mono);font-size:10px;color:var(--dim);letter-spacing:.06em;
  background:var(--accSoft);padding:1px 6px;border-radius:999px}
.nd h2{margin:0;font-size:18.5px;font-weight:800;letter-spacing:-.025em;line-height:1.42}
.nd-sb{margin:7px 0 0;font-size:13.5px;color:var(--dim)}
.nd-tail{margin:14px 0 0;font-size:13px;color:var(--dim);border-top:1px solid var(--line);padding-top:11px}

/* ── 예약 문의 버튼 ───────────────────────────────── */
.vb{display:inline-flex;align-items:stretch;gap:0;background:var(--card);color:var(--ink);
  border:1.5px solid var(--ink);border-radius:8px;overflow:hidden;font-weight:700;line-height:1.2}
.vb:hover{text-decoration:none;background:var(--accSoft)}
.vb-bar{width:7px;background:var(--acc);flex:0 0 auto}
.vb-tx{display:flex;flex-direction:column;justify-content:center;padding:8px 12px}
.vb-lb{font-size:10.5px;letter-spacing:.12em;color:var(--accDk);font-weight:800}
.vb-nm{font-size:15px;font-weight:800;letter-spacing:.01em;font-family:var(--mono)}
.vb-ic{display:flex;align-items:center;padding:0 11px 0 2px}
.vb-ic svg{fill:var(--acc);width:14px;height:14px}
.vb-s .vb-nm{font-size:13.5px}.vb-s .vb-tx{padding:6px 10px}
.vb-l .vb-nm{font-size:19px}.vb-l .vb-tx{padding:11px 16px}.vb-l .vb-bar{width:9px}
.vb-w{display:flex;width:100%;justify-content:center}

/* ── 예약 띠 ──────────────────────────────────────── */
.ring{position:relative;background:var(--ink);color:#fff;border-radius:var(--rad);padding:22px 20px;margin:0 0 20px;text-align:center}
.ring-p{margin:0 0 14px;font-size:16px;font-weight:700;letter-spacing:-.02em}
.ring-s{margin:12px 0 0;font-size:12.5px;color:#C3B6D4;font-family:var(--mono)}
.ring .vb{background:#fff;border-color:#fff}
.ring .vb:hover{background:var(--accSoft)}

/* ── 코스 ─────────────────────────────────────────── */
.cw-ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}
@media (min-width:640px){.cw-ul{grid-template-columns:1fr 1fr}}
.cw{border:1px solid var(--line);border-radius:8px;padding:13px 14px;background:var(--paper)}
.cw-a{display:grid;gap:3px;color:var(--ink)}
.cw-a:hover{text-decoration:none}
.cw-a:hover .cw-k{color:var(--accDk);text-decoration:underline}
.cw-k{font-weight:800;font-size:16px}
.cw-v b{font-size:17px;font-weight:800;color:var(--accDk);font-family:var(--mono)}
.cw-v i{font-style:normal;font-size:12px;color:var(--dim);margin-left:4px}
.cw-p{font-size:12px;color:var(--dim)}
.cw-d{margin:9px 0 0;font-size:13px;color:var(--dim);border-top:1px solid var(--line);padding-top:8px}

/* ── 순서 ─────────────────────────────────────────── */
.rn-ol{list-style:none;margin:0;padding:0;display:grid;gap:14px}
.rn{display:flex;gap:13px;align-items:flex-start}
.rn-n{font-family:var(--mono);font-size:13px;font-weight:800;color:var(--accDk);background:var(--accSoft);
  width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.rn-t{margin:3px 0 0;font-size:15px;font-weight:800}
.rn-d{margin:3px 0 0;font-size:13.5px;color:var(--dim)}

/* ── 표 ───────────────────────────────────────────── */
.dat,.cmp{width:100%;border-collapse:collapse;font-size:14px}
.dat th,.dat td{border-bottom:1px solid var(--line);padding:10px 4px;text-align:left;vertical-align:top}
.dat th{width:34%;font-weight:700;color:var(--dim);font-size:13px}
.dat tr:last-child th,.dat tr:last-child td{border-bottom:0}
.cmp th,.cmp td{border:1px solid var(--line);padding:8px 10px;text-align:left}
.cmp thead th{background:var(--ink);color:#fff;font-size:12.5px;font-weight:700}
.cmp tbody th{background:var(--paper);font-weight:700}
.cmp tr.cur td,.cmp tr.cur th{background:var(--accSoft)}
@media (max-width:560px){.cmp{font-size:12.5px}.cmp th,.cmp td{padding:6px 7px}}

/* ── 물음 ─────────────────────────────────────────── */
.ask-i{display:grid;grid-template-columns:auto 1fr;column-gap:10px;padding:13px 0;border-top:1px solid var(--line)}
.ask-i:first-child{border-top:0;padding-top:0}
.ask-n{grid-column:1;grid-row:1;font-family:var(--mono);font-size:11px;font-weight:700;color:#fff;background:var(--acc);
  width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:3px}
.ask-q{grid-column:2;grid-row:1;margin:0;font-weight:800;font-size:15px}
.ask-a{grid-column:2;grid-row:2;margin:6px 0 0;font-size:14px;color:var(--dim)}

/* ── 목록들 ───────────────────────────────────────── */
.pt{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.pt li{position:relative;padding-left:16px;font-size:14px;color:var(--dim)}
.pt li::before{content:"";position:absolute;left:0;top:11px;width:6px;height:6px;border-radius:50%;background:var(--acc)}
.lnk{list-style:none;margin:0;padding:0;display:grid;gap:7px;grid-template-columns:1fr}
@media (min-width:560px){.lnk{grid-template-columns:1fr 1fr}}
@media (min-width:860px){.lnk{grid-template-columns:1fr 1fr 1fr}}
.lnk a{display:block;padding:9px 12px;border:1px solid var(--line);border-radius:7px;background:var(--paper);font-size:13.5px}
.lnk a:hover{background:var(--accSoft);text-decoration:none}
.idx{list-style:none;margin:0;padding:0;display:grid;gap:6px;grid-template-columns:1fr 1fr}
@media (min-width:640px){.idx{grid-template-columns:repeat(3,1fr)}}
@media (min-width:900px){.idx{grid-template-columns:repeat(4,1fr)}}
.idx a{display:grid;gap:1px;padding:9px 11px;border:1px solid var(--line);border-radius:7px;background:var(--paper)}
.idx a:hover{background:var(--accSoft);text-decoration:none}
.idx-n{font-weight:700;font-size:14px;color:var(--ink)}
.idx-m{font-size:11px;color:var(--dim);font-family:var(--mono)}
.idx li.cur a{background:var(--ink);border-color:var(--ink)}
.idx li.cur .idx-n{color:#fff}.idx li.cur .idx-m{color:#BCAAD2}
.kin{list-style:none;margin:0;padding:0;display:grid;gap:6px;grid-template-columns:1fr 1fr}
@media (min-width:640px){.kin{grid-template-columns:repeat(4,1fr)}}
.kin a{display:grid;gap:2px;padding:10px 11px;border:1px solid var(--line);border-radius:7px;background:var(--paper);text-align:center}
.kin a:hover{background:var(--accSoft);text-decoration:none}
.kin-n{font-weight:700;font-size:14px;color:var(--ink)}
.kin-m{font-size:11px;color:var(--dim);font-family:var(--mono)}
.nmz{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.nmz li{font-size:13px;color:var(--dim);background:var(--paper);border:1px solid var(--line);border-radius:999px;padding:4px 11px}
.nbr{list-style:none;margin:0;padding:0;display:grid;gap:6px;grid-template-columns:1fr 1fr}
@media (min-width:640px){.nbr{grid-template-columns:repeat(3,1fr)}}
.nbr a{display:flex;justify-content:space-between;gap:8px;padding:9px 12px;border:1px solid var(--line);border-radius:7px;background:var(--paper);font-size:13.5px;font-weight:700}
.nbr a span{font-weight:400;font-size:11px;color:var(--dim);font-family:var(--mono)}
.nbr a:hover{background:var(--accSoft);text-decoration:none}
.pst{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.pst a{display:grid;gap:3px;padding:13px 14px;border:1px solid var(--line);border-radius:8px;background:var(--paper)}
.pst a:hover{background:var(--accSoft);text-decoration:none}
.pst b{font-size:15px}
.pst span{font-size:13px;color:var(--dim)}
.pst time{font-family:var(--mono);font-size:11px;color:var(--dim)}
.pick{list-style:none;margin:0;padding:0;display:grid;gap:8px}
@media (min-width:720px){.pick{grid-template-columns:1fr 1fr}}
.pick a{display:grid;gap:2px;padding:12px 14px;border:1px solid var(--line);border-left:5px solid var(--acc);border-radius:7px;background:var(--paper)}
.pick a:hover{background:var(--accSoft);text-decoration:none}
.pick b{font-size:15px}.pick span{font-size:13px;color:var(--dim)}

/* ── 대문 ─────────────────────────────────────────── */
.hero{position:relative;background:var(--card);border:1px solid var(--line);border-radius:var(--rad);padding:28px 22px;margin:0 0 20px}
.hero-sl{margin:0 0 10px;font-size:22px;font-weight:800;letter-spacing:-.03em;line-height:1.4}
@media (min-width:720px){.hero-sl{font-size:28px}}
.hero-p{margin:0 0 18px;font-size:15px;color:var(--dim);max-width:62ch}
.hero-f{margin:22px 0 0;display:grid;gap:10px}
@media (min-width:600px){.hero-f{grid-template-columns:repeat(4,1fr)}}
.hero-f div{border-left:3px solid var(--acc);padding:2px 0 2px 11px}
.hero-f dt{font-size:14.5px;font-weight:800}
.hero-f dd{margin:0;font-size:11.5px;color:var(--dim)}
.lvl{display:grid;gap:16px}
@media (min-width:760px){.lvl{grid-template-columns:1.1fr 1fr}}
.lvl-h{margin:0 0 9px;font-size:12px;font-weight:800;letter-spacing:.1em;color:var(--accDk)}
.lvl-s .lvl-h{color:var(--dim)}
.lvl-ul{list-style:none;margin:0;padding:0;display:grid;gap:6px;grid-template-columns:1fr 1fr}
.lvl-ul a{display:grid;gap:1px;padding:11px 12px;border:1px solid var(--line);border-radius:7px;background:var(--paper)}
.lvl-ul a:hover{background:var(--accSoft);text-decoration:none}
.lvl-ul b{font-size:15px}
.lvl-ul span{font-size:11px;color:var(--dim);font-family:var(--mono)}
.lvl-s .lvl-ul{grid-template-columns:repeat(3,1fr)}

/* ── 문서·글 ──────────────────────────────────────── */
.doc section{padding:12px 0;border-top:1px solid var(--line)}
.doc section:first-child{border-top:0;padding-top:0}
.doc h3{margin:0 0 5px;font-size:15px;font-weight:800}
.doc p{margin:0;font-size:14px;color:var(--dim)}
.art{background:var(--card);border:1px solid var(--line);border-radius:var(--rad);padding:24px 20px;margin:0 0 20px}
.art p{margin:0 0 14px;font-size:15.5px;color:var(--ink)}
.art h3{margin:24px 0 9px;font-size:17px;font-weight:800;color:var(--accDk)}
.art .pt{margin:0 0 14px}
.pmeta{margin:0 0 12px;font-family:var(--mono);font-size:12px;color:var(--dim)}

/* ── 푸터 — 2×2 바둑판 ────────────────────────────── */
.foot{background:var(--ink);color:#C6BCD4;margin-top:36px}
.foot a{color:#E2D7F0}
.foot-g{max-width:1060px;margin:0 auto;padding:26px 18px 6px;display:grid;gap:22px}
@media (min-width:760px){.foot-g{grid-template-columns:1fr 1fr}}
.fq-nm{margin:0 0 7px;font-size:19px;font-weight:800;color:#fff}
.fq-say{margin:0 0 14px;font-size:13px;max-width:48ch}
.fq-run{margin:7px 0 0;font-size:11.5px;font-family:var(--mono);color:#9B8EAE}
.fq-h{margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:.14em;color:#A294B6}
.fq-chip{list-style:none;margin:0 0 14px;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.fq-chip a{display:inline-block;padding:4px 11px;border:1px solid #453755;border-radius:999px;font-size:13px;font-weight:700}
.fq-chip a:hover{background:#332742;text-decoration:none}
.fq-thin a{font-weight:400}
.fq-ul{list-style:none;margin:0;padding:0;display:grid;gap:5px;font-size:13px}
.fq-post li{display:grid}
.fq-post time{font-family:var(--mono);font-size:10.5px;color:#8B7C9E}
.fq-feed{list-style:none;margin:10px 0 0;padding:0;display:flex;gap:10px;font-size:11.5px;font-family:var(--mono)}
.fq-sm{margin:10px 0 0;font-size:11.5px;color:#A294B6}
.foot-end{max-width:1060px;margin:0 auto;padding:16px 18px 26px;border-top:1px solid #3A2D4A;font-size:11.5px;color:#A294B6}
.fq-biz{margin:0 0 9px}
.fq-dim{color:#7D6E92}
.fq-ai{margin:0 0 9px;line-height:1.75}
.fq-ai strong{color:#DCCFEC}
.fq-cr{margin:0}

/* ── 모바일 하단 바 ───────────────────────────────── */
.dock{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--card);
  border-top:1px solid var(--line);box-shadow:0 -4px 14px rgba(36,27,46,.09);
  padding:9px 12px calc(9px + env(safe-area-inset-bottom));display:grid;gap:4px;justify-items:center;
  transition:transform .22s ease}
.dock-s{font-size:11px;color:var(--dim);font-family:var(--mono)}
.dock.off{transform:translateY(130%)}
@media (min-width:860px){.dock{display:none}}
@media print{.dock,.tabs,.ring{display:none}}
`;

const JS = `(function(){
  /* 푸터가 보이면 하단 바를 내린다. 그것 말고는 아무 일도 하지 않는다 —
     화면을 흔드는 무작위를 넣지 않아야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.dock'),ft=document.querySelector('.foot');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('off',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(ft);
})();`;

const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${t.ink}"/><g stroke="${t.card}" stroke-width="2.6" fill="none"><path d="M7 4v24"/><circle cx="17" cy="9.5" r="3.6"/><circle cx="22" cy="18" r="3.6"/><circle cx="14" cy="25" r="3.2"/></g></svg>`;

const LOGO = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 48"><rect width="210" height="48" fill="${t.card}"/><g stroke="${t.acc}" stroke-width="2.6" fill="none"><path d="M10 9v30"/><circle cx="21" cy="16" r="4.4"/><circle cx="27" cy="26" r="4.4"/><circle cx="18" cy="35" r="4"/></g><text x="44" y="27" font-family="system-ui,sans-serif" font-size="19" font-weight="800" fill="${t.ink}">바이탈리즈</text><text x="44" y="39" font-family="ui-monospace,monospace" font-size="9" letter-spacing="3" fill="${t.dim}">VITALEASE</text></svg>`;

const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${t.paper}"/>
<rect x="60" y="60" width="1080" height="510" rx="20" fill="${t.card}" stroke="${t.line}"/>
<g stroke="${t.line}" stroke-width="3" fill="none"><path d="M140 120v390"/></g>
<g fill="${t.card}" stroke="${t.acc}" stroke-width="7"><circle cx="140" cy="196" r="17"/><circle cx="140" cy="316" r="17"/><circle cx="140" cy="436" r="17"/></g>
<text x="200" y="214" font-family="system-ui,sans-serif" font-size="58" font-weight="800" fill="${t.ink}">${cfg.brand.ko} 출장마사지 홈타이</text>
<text x="200" y="286" font-family="system-ui,sans-serif" font-size="32" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="200" y="336" font-family="ui-monospace,monospace" font-size="26" fill="${t.accDk}">서울 · 인천 · 경기 · 부산 동읍까지 · ${cfg.hours} · ${cfg.pay}</text>
<rect x="200" y="400" width="430" height="74" rx="10" fill="${t.card}" stroke="${t.ink}" stroke-width="3"/>
<rect x="200" y="400" width="14" height="74" rx="4" fill="${t.acc}"/>
<text x="236" y="430" font-family="ui-monospace,monospace" font-size="17" letter-spacing="3" fill="${t.accDk}">${cfg.telLabel}</text>
<text x="236" y="462" font-family="ui-monospace,monospace" font-size="29" font-weight="700" fill="${t.ink}">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'vital.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'vital.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}

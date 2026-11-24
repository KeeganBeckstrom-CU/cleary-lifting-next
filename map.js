/* ============ CU LIFTING · the Road to the Season map ============ */
"use strict";
const MAPW = 400;
const ZONES = [
  { ps: [0, 1], name: "Fall Ball", sky: ["#3B1D3F", "#7A3B2E", "#C9692E"], kind: "fall" },
  { ps: [2, 3], name: "Big Gain Season", sky: ["#0B1A3D", "#132B57", "#1E3F70"], kind: "winter" },
  { ps: [4, 5], name: "Winter Break · Pre-Season", sky: ["#120B2E", "#1D1446", "#0E2A44"], kind: "storm" },
  { ps: [6, 7, 8, 9], name: "In-Season", sky: ["#02060F", "#061230", "#0A1C44"], kind: "stadium" }];
function mapLayout() { return memo("maplay", () => { const pts = [], marks = []; let y = 0, i = 0;
  PH.forEach((Q, p) => { y += p ? 190 : 260; marks.push({ p, y: y - 95 }); Q.weeks.forEach((W, w) => { pts.push({ p, w, n: W.n, y, i }); y += 92; i++ }) });
  const H = y + 260; pts.forEach(q => { q.y = H - q.y; q.x = 200 + 118 * Math.sin(q.i * .78 + .4) }); marks.forEach(m => { m.y = H - m.y; m.x = 200 + 118 * Math.sin((pts.find(q => q.p === m.p).i - .5) * .78 + .4) });
  return { pts, marks, H } }) }
function cr(P) { if (P.length < 2) return ""; let d = `M${P[0].x.toFixed(1)},${P[0].y.toFixed(1)}`;
  for (let i = 0; i < P.length - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    d += ` C${(p1.x + (p2.x - p0.x) / 6).toFixed(1)},${(p1.y + (p2.y - p0.y) / 6).toFixed(1)} ${(p2.x - (p3.x - p1.x) / 6).toFixed(1)},${(p2.y - (p3.y - p1.y) / 6).toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}` } return d }
function zoneRange(z, L) { const ps = L.pts.filter(q => z.ps.includes(q.p)); const top = Math.min(...ps.map(q => q.y)) - 150, bot = Math.max(...ps.map(q => q.y)) + 160; return { top, bot } }
function R(seed) { return rng(seed) }
function decoFall(t, b, s) { const r = R(s); let o = "";
  o += `<path d="M0,${b - 40} Q100,${b - 120} 200,${b - 70} T400,${b - 90} V${b} H0Z" fill="#2A1430" opacity=".9"/>`;
  for (let i = 0; i < 26; i++) { const x = r() * 400, y = t + 60 + r() * (b - t - 80); if (Math.abs(x - 200) < 150 && r() < .7) continue; const h = 26 + r() * 26, c = ["#E0712B", "#C2452D", "#F3A33A", "#8E2E2A"][i % 4];
    o += `<g transform="translate(${x.toFixed(0)},${y.toFixed(0)})"><rect x="-2" y="0" width="4" height="${h * .5}" fill="#3a2016"/><ellipse cx="0" cy="${-h * .15}" rx="${h * .42}" ry="${h * .5}" fill="${c}"/><ellipse cx="${-h * .12}" cy="${-h * .28}" rx="${h * .18}" ry="${h * .2}" fill="#fff" opacity=".12"/></g>` }
  o += `<g class="leaves">`; for (let i = 0; i < 14; i++) o += `<ellipse class="leaf" style="--d:${(r() * 8).toFixed(1)}s;--x:${(r() * 400).toFixed(0)}px;--y0:${t}px;--y1:${b}px" rx="4" ry="2.2" fill="${["#E0712B", "#F3A33A", "#C2452D"][i % 3]}"/>`; o += `</g>`;
  o += `<circle cx="330" cy="${t + 90}" r="38" fill="#F7B267" opacity=".55"/><circle cx="330" cy="${t + 90}" r="70" fill="#F7B267" opacity=".12"/>`; return o }
function decoWinter(t, b, s) { const r = R(s); let o = "";
  const mtn = (base, hgt, sh, col) => { let d = `M0,${base}`; const n = 6; for (let i = 0; i <= n; i++) { const x = i * 400 / n, pk = base - hgt * (.55 + .45 * ((i * 37 + sh) % 7) / 7); d += ` L${x - 33},${base - hgt * .25} L${x},${pk}` } return `<path d="${d} L400,${base} V${base + 400} H0Z" fill="${col}"/>` };
  o += mtn(t + 340, 150, 3, "#132B57") + mtn(b - 40, 190, 5, "#0E2246");
  for (let i = 0; i <= 6; i++) { const x = i * 400 / 6, pk = (b - 40) - 190 * (.55 + .45 * ((i * 37 + 5) % 7) / 7); o += `<path d="M${x},${pk} l12,${(b - 40 - pk) * .22} h-24z" fill="#E8F0FF" opacity=".85"/>` }
  for (let i = 0; i < 22; i++) { const x = r() * 400, y = t + 140 + r() * (b - t - 160); if (Math.abs(x - 200) < 140 && r() < .75) continue; const h = 22 + r() * 22;
    o += `<g transform="translate(${x.toFixed(0)},${y.toFixed(0)})"><path d="M0,${-h} L${h * .42},0 L${-h * .42},0Z" fill="#123A3A"/><path d="M0,${-h} L${h * .2},${-h * .5} L${-h * .2},${-h * .5}Z" fill="#E8F0FF" opacity=".85"/></g>` }
  const cy = t + (b - t) * .55; o += `<g transform="translate(330,${cy})"><rect x="-34" y="-22" width="68" height="40" rx="3" fill="#2A1A14"/><path d="M-40,-22 L0,-48 L40,-22Z" fill="#E8F0FF"/><rect x="-24" y="-12" width="18" height="14" fill="#F7C35E" class="glowwin"/><rect x="6" y="-12" width="18" height="14" fill="#F7C35E" class="glowwin"/><text x="0" y="30" text-anchor="middle" class="mtxt sm">WEIGHT ROOM</text></g>`;
  o += `<g class="snow">`; for (let i = 0; i < 40; i++) o += `<circle class="flake" style="--d:${(r() * 9).toFixed(1)}s;--x:${(r() * 400).toFixed(0)}px;--y0:${t}px;--y1:${b}px;--dur:${(6 + r() * 6).toFixed(1)}s" r="${(1 + r() * 1.8).toFixed(1)}" fill="#fff"/>`; o += `</g>`; return o }
function decoStorm(t, b, s) { const r = R(s); let o = "";
  o += `<path class="aur a1" d="M-20,${t + 120} C80,${t + 40} 160,${t + 200} 260,${t + 100} S420,${t + 60} 440,${t + 140}" stroke="url(#aur)" stroke-width="60" fill="none" opacity=".35"/>`;
  o += `<path class="aur a2" d="M-20,${t + 260} C100,${t + 180} 200,${t + 320} 300,${t + 230} S420,${t + 200} 440,${t + 260}" stroke="url(#aur)" stroke-width="40" fill="none" opacity=".25"/>`;
  [[60, t + 330], [340, t + 520], [90, b - 260]].forEach(([x, y], i) => { o += `<path class="bolt b${i}" d="M${x},${y} l-14,46 h14 l-10,44 l34,-58 h-16 l12,-32z" fill="#FFE27A"/>` });
  o += `<rect class="flash" x="0" y="${t}" width="400" height="${b - t}" fill="#c9d6ff"/>`;
  for (let i = 0; i < 6; i++) { const x = r() * 400, y = t + 80 + r() * (b - t - 100); o += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${60 + r() * 50}" ry="${14 + r() * 10}" fill="#2B2350" opacity=".7"/>` } return o }
function decoStadium(t, b, s, L, curI) { let o = ""; const r = R(s);
  const dy = t + (b - t) * .5; o += `<g transform="translate(200,${dy})" opacity=".55"><path d="M0,-150 L150,0 L0,150 L-150,0Z" fill="#0E3B22"/><path d="M0,-110 L110,0 L0,110 L-110,0Z" fill="#7A4E2A" opacity=".55"/><path d="M0,-78 L78,0 L0,78 L-78,0Z" fill="#11502C"/><circle r="12" fill="#8B5A2B"/>${[[0, -110], [110, 0], [0, 110], [-110, 0]].map(([x, y]) => `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" fill="#fff" transform="rotate(45 ${x} ${y})"/>`).join("")}</g>`;
  const ps = L.pts.filter(q => q.p >= 6), lit = q => q.i <= curI;
  [[32, t + 220, 0], [368, t + 380, 1], [32, b - 420, 2], [368, b - 200, 3]].forEach(([x, y], k) => { const q = ps[Math.min(ps.length - 1, Math.floor((3 - k) / 4 * ps.length))]; const on = q && lit(q);
    o += `<g class="ltower ${on ? "on" : ""}" transform="translate(${x},${y})"><rect x="-3" y="0" width="6" height="120" fill="#1F2A44"/><rect x="-26" y="-34" width="52" height="34" rx="3" fill="#111A30"/>${[0, 1, 2].map(rw => [0, 1, 2, 3].map(c => `<circle cx="${-18 + c * 12}" cy="${-26 + rw * 10}" r="3.6" class="bulb" style="--k:${(rw * 4 + c) * .06}s"/>`).join("")).join("")}${on ? `<path d="M-26,0 L${x < 200 ? 260 : -260},230 L${x < 200 ? 120 : -120},260Z" fill="url(#beam)" opacity=".5"/>` : ""}</g>` });
  for (let i = 0; i < 5; i++) { const x = 40 + r() * 320, y = t + 30 + r() * 120; o += `<g class="fw" style="--d:${(i * 1.1).toFixed(1)}s" transform="translate(${x.toFixed(0)},${y.toFixed(0)})">${Array.from({ length: 12 }, (_, j) => { const a = j / 12 * Math.PI * 2; return `<line x2="${(Math.cos(a) * 22).toFixed(1)}" y2="${(Math.sin(a) * 22).toFixed(1)}" stroke="${["#F3C34A", "#E8274F", "#fff", "#5AA9FF"][i % 4]}" stroke-width="2.4" stroke-linecap="round"/>` }).join("")}</g>` } return o }

function mapHTML() { const L = mapLayout(), T = findToday(), curI = (L.pts.find(q => q.p === T.p && q.w === T.w) || L.pts[0]).i;
  const caps = new Set(unopened());
  let defs = `<defs><linearGradient id="aur" x1="0" x2="1"><stop offset="0" stop-color="#2FE0A0"/><stop offset=".5" stop-color="#5AA9FF"/><stop offset="1" stop-color="#B48CFF"/></linearGradient>
   <linearGradient id="beam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFF6D0" stop-opacity=".9"/><stop offset="1" stop-color="#FFF6D0" stop-opacity="0"/></linearGradient>
   <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
   ${crestDefs("mp")}<radialGradient id="medal" cx=".5" cy=".35"><stop offset="0" stop-color="#FFE9A8"/><stop offset=".6" stop-color="#E0A52E"/><stop offset="1" stop-color="#8A5A12"/></radialGradient>`;
  let bg = "", deco = "";
  ZONES.forEach((z, zi) => { const { top, bot } = zoneRange(z, L); const nz = ZONES[zi + 1]; defs += `<linearGradient id="z${zi}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${nz ? nz.sky[2] : z.sky[0]}"/><stop offset=".12" stop-color="${z.sky[0]}"/><stop offset=".55" stop-color="${z.sky[1]}"/><stop offset="1" stop-color="${z.sky[2]}"/></linearGradient>`;
    bg += `<rect x="0" y="${top - 60}" width="${MAPW}" height="${bot - top + 120}" fill="url(#z${zi})"/>`;
    const f = { fall: decoFall, winter: decoWinter, storm: decoStorm, stadium: decoStadium }[z.kind]; deco += `<g class="zone ${z.kind}">${f(top, bot, 99 + zi * 31, L, curI)}</g>`;
    deco += `<g transform="translate(16,${top + 40})"><text class="zlabel">${esc(z.name.toUpperCase())}</text></g>` });
  defs += `</defs>`;
  const r = rng(7); let stars = ""; for (let i = 0; i < 90; i++) stars += `<circle class="star" style="--d:${(r() * 4).toFixed(1)}s" cx="${(r() * MAPW).toFixed(0)}" cy="${(r() * L.H).toFixed(0)}" r="${(.5 + r() * 1.3).toFixed(1)}" fill="#fff"/>`;
  const all = cr(L.pts), litP = cr(L.pts.filter(q => q.i <= curI));
  let road = `<path d="${all}" class="road"/><path d="${all}" class="roadedge"/><path d="${all}" class="roadline"/>`;
  road += `<path d="${litP}" class="lit" id="litpath"/><path d="${litP}" class="litflow"/>`;
  let marks = L.marks.map(m => { const Q = PH[m.p], won = phaseWon(m.p), cur = m.p === T.p, fut = m.p > T.p, side = m.x > 200 ? -1 : 1, mx = clamp(m.x + side * 86, 50, 350);
    return `<g class="medal ${won ? "won" : ""} ${cur ? "cur" : ""} ${fut ? "fut" : ""}" data-mph="${m.p}" transform="translate(${mx.toFixed(0)},${m.y.toFixed(0)})">
      <circle r="40" class="mring"/><circle r="31" fill="${fut ? "#16213D" : "url(#medal)"}"/><text y="-2" text-anchor="middle" class="mnum">${fut ? "🔒" : won ? "🏆" : Q.n}</text>
      <text y="${fut ? 14 : 16}" text-anchor="middle" class="msub">PHASE ${Q.n}</text><text y="58" text-anchor="middle" class="mname">${esc(Q.short.toUpperCase())}</text></g>` }).join("");
  let pins = L.pts.map(q => { const s = weekState(q.p, q.w), done = s.full && s.real > 0, cur = q.i === curI, past = q.i < curI, key = PH[q.p].id + "-w" + (q.w + 1);
    const cls = done ? "done" : cur ? "cur" : past ? "miss" : "fut";
    return `<g class="pin ${cls}" data-wk="${q.p}.${q.w}" transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)})" style="--i:${q.i}">${cur ? `<circle r="26" class="halo"/>` : ""}<circle r="17" class="pc"/>
      ${s.tot && !done && s.done ? `<circle r="17" class="pprog" pathLength="100" stroke-dasharray="${Math.round(s.done / s.tot * 100)} 100"/>` : ""}
      <text y="5" text-anchor="middle" class="pn">${q.n}</text>${caps.has(key) ? `<g class="pcap" transform="translate(26,-20) scale(.8)" data-cap="${key}"><rect x="-8" y="-11" width="16" height="22" rx="8" fill="#8fd8ff"/><rect x="-8" y="0" width="16" height="11" rx="3" fill="#E0A52E"/></g>` : ""}</g>` }).join("");
  const me = L.pts[curI]; const num = (CFG.me && CFG.me.num) || "";
  const you = `<g class="you" transform="translate(${me.x.toFixed(1)},${(me.y - 46).toFixed(1)})"><g class="youbob"><circle r="15" fill="#fff"/><path d="M-9,-11 Q-3,0 -9,11 M9,-11 Q3,0 9,11" stroke="#B30838" stroke-width="2" fill="none"/><rect class="youtag" x="-17" y="-36" width="34" height="16" rx="8"/><text y="-24" text-anchor="middle" class="younum">YOU</text><path d="M0,15 L0,24" stroke="#fff" stroke-width="2"/></g></g>`;
  const finale = (() => { const q = L.pts[L.pts.length - 1]; return `<g class="finale">${crestSVG(q.x, q.y - 130, 52, "mp")}<text x="${q.x.toFixed(0)}" y="${(q.y - 60).toFixed(0)}" text-anchor="middle" class="mname">SEASON COMPLETE</text></g>` })();
  return `<svg class="map" viewBox="0 0 ${MAPW} ${L.H}" xmlns="http://www.w3.org/2000/svg">${defs}${bg}${stars}${deco}${road}${marks}${finale}${pins}${you}</svg>` }

function mapInit() { const lit = $("#litpath"); if (lit && !RM) { const len = lit.getTotalLength(); lit.style.strokeDasharray = len; lit.style.strokeDashoffset = len; lit.getBoundingClientRect(); lit.style.transition = "stroke-dashoffset 2.2s cubic-bezier(.3,.8,.3,1)"; lit.style.strokeDashoffset = 0 }
  const you = $(".map .you"), box = $("#mapscroll"); if (you && box) { const r = you.getBoundingClientRect(), b = box.getBoundingClientRect(); box.scrollTop += r.top - b.top - b.height * .55 } }

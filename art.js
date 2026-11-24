/* ============ CU LIFTING · cartoon art: the Cleary crest + night-game stadium ============ */
"use strict";
const AOL = "#0B1020";
const ao = w => `stroke="${AOL}" stroke-width="${w || 3}" stroke-linejoin="round" stroke-linecap="round"`;
let ART_N = 0;

/* The Cleary crest: gold-rimmed badge, logo in the middle, name around the ring. size = radius. */
function crestSVG(cx, cy, R, id) { const r2 = R * .86, r3 = R * .74;
  return `<g class="crest" transform="translate(${cx},${cy})">
   <g class="crays"><circle r="${R * 2.1}" fill="url(#rays${id})"/></g>
   <circle r="${R + 6}" fill="#000" opacity=".35" transform="translate(4,8)"/>
   <circle r="${R}" fill="url(#rim${id})" ${ao(5)}/>
   ${Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2; return `<circle cx="${(Math.cos(a) * (R - 5)).toFixed(1)}" cy="${(Math.sin(a) * (R - 5)).toFixed(1)}" r="1.6" fill="#7A4A12"/>` }).join("")}
   <circle r="${r2}" fill="url(#ring${id})" ${ao(4)}/>
   <path id="arcT${id}" d="M${-r2 * .8},0 A${r2 * .8},${r2 * .8} 0 0 1 ${r2 * .8},0" fill="none"/><path id="arcB${id}" d="M${-r2 * .82},0 A${r2 * .82},${r2 * .82} 0 0 0 ${r2 * .82},0" fill="none"/>
   <text class="crt" style="font-size:${(R * .13).toFixed(1)}px;letter-spacing:${(R * .032).toFixed(2)}px"><textPath href="#arcT${id}" startOffset="50%" text-anchor="middle">CLEARY UNIVERSITY</textPath></text>
   <text class="crt b" style="font-size:${(R * .125).toFixed(1)}px;letter-spacing:${(R * .032).toFixed(2)}px"><textPath href="#arcB${id}" startOffset="50%" text-anchor="middle">★ BASEBALL ★</textPath></text>
   <circle r="${r3 * .78}" fill="url(#core${id})" ${ao(4)}/>
   <image href="img/cu.png" x="${-r3 * .72}" y="${-r3 * .46}" width="${r3 * 1.44}" height="${r3 * .9}"/>
   <clipPath id="cclip${id}"><circle r="${R}"/></clipPath>
   <g clip-path="url(#cclip${id})"><rect class="cshine" x="${-R * 2.2}" y="${-R}" width="${R * .55}" height="${R * 2}" fill="#fff" opacity=".35" transform="skewX(-18)"/></g>
   <ellipse cx="${-R * .35}" cy="${-R * .55}" rx="${R * .38}" ry="${R * .14}" fill="#fff" opacity=".22" transform="rotate(-24)"/>
  </g>` }
function crestDefs(id) { return `<radialGradient id="rays${id}"><stop offset="0" stop-color="#FFE7A0" stop-opacity=".55"/><stop offset=".6" stop-color="#FFE7A0" stop-opacity=".08"/><stop offset="1" stop-color="#FFE7A0" stop-opacity="0"/></radialGradient>
  <linearGradient id="rim${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFF1BC"/><stop offset=".45" stop-color="#F7C948"/><stop offset="1" stop-color="#B9790D"/></linearGradient>
  <linearGradient id="ring${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F0335E"/><stop offset="1" stop-color="#9A0630"/></linearGradient>
  <radialGradient id="core${id}" cx=".45" cy=".35"><stop offset="0" stop-color="#F7F9FD"/><stop offset=".7" stop-color="#DCE4F2"/><stop offset="1" stop-color="#AEBBD6"/></radialGradient>` }

/* The hero: night game at Cleary, crest front and center. kind = season zone (fall|winter|storm|stadium) */
function heroSVG(kind, opts) { const id = "h" + (++ART_N), H = (opts && opts.h) || 580, cy = (opts && opts.cy) || 140, R = (opts && opts.r) || 84, wallY = H - 192;
  const r = rng(7 + H); let st = ""; for (let i = 0; i < 46; i++) st += `<circle class="star" style="--d:${(r() * 4).toFixed(1)}s" cx="${(r() * 400).toFixed(0)}" cy="${(r() * (wallY - 40)).toFixed(0)}" r="${(.6 + r() * 1.4).toFixed(1)}" fill="#fff"/>`;
  const sky = { fall: ["#1A0F33", "#4A1F3D", "#A8462E"], winter: ["#06102E", "#10265A", "#2A4F8E"], storm: ["#0A0820", "#1D1446", "#2C2A6E"], stadium: ["#040A1E", "#0B1C48", "#173A7A"] }[kind] || ["#040A1E", "#0B1C48", "#173A7A"];
  let s = `<defs><linearGradient id="sky${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".6" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient>
   <linearGradient id="beam${id}" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stop-color="#FFF6D0" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6D0" stop-opacity="0"/></linearGradient>
   <linearGradient id="grass${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#36C47E"/><stop offset="1" stop-color="#14713E"/></linearGradient>
   <linearGradient id="wall${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1D4A9A"/><stop offset="1" stop-color="#0E2A62"/></linearGradient>
   <radialGradient id="bulb${id}"><stop offset="0" stop-color="#FFF6D0"/><stop offset=".5" stop-color="#FFF6D0" stop-opacity=".5"/><stop offset="1" stop-color="#FFF6D0" stop-opacity="0"/></radialGradient>${crestDefs(id)}</defs>`;
  s += `<rect width="400" height="${H}" fill="url(#sky${id})"/>${st}`;
  /* moon */
  s += `<g transform="translate(340,58)"><circle r="20" fill="#FFF3C4" ${ao(3)}/><circle cx="9" cy="-6" r="18" fill="${sky[0]}"/><circle cx="-6" cy="6" r="3" fill="#E8D9A0"/></g>`;
  /* sweeping searchlights */
  s += `<g class="sweep s1" style="transform-origin:60px ${wallY}px"><path d="M50 ${wallY} L-10 -40 L110 -40 L70 ${wallY}Z" fill="url(#beam${id})"/></g><g class="sweep s2" style="transform-origin:340px ${wallY}px"><path d="M330 ${wallY} L290 -40 L410 -40 L350 ${wallY}Z" fill="url(#beam${id})"/></g>`;
  /* light towers with pennants */
  [[34, 1], [366, -1]].forEach(([x, d], k) => { const ty = wallY - 190;
    s += `<rect x="${x - 4}" y="${ty + 40}" width="8" height="${190}" fill="#1F2A44" ${ao(3)}/><g class="pennant" style="transform-origin:${x}px ${ty - 18}px"><path d="M${x} ${ty - 30} L${x + d * 34} ${ty - 20} L${x} ${ty - 8}Z" fill="#B30838" ${ao(3)}/><text x="${x + d * 12}" y="${ty - 16}" text-anchor="middle" class="pt">CU</text></g><path d="M${x} ${ty - 32} V${ty}" ${ao(3)}/>
     <rect x="${x - 26}" y="${ty}" width="52" height="40" rx="5" fill="#141C34" ${ao(4)}/>${[0, 1, 2].map(rw => [0, 1, 2, 3].map(c => `<circle class="bulb" style="--k:${((rw * 4 + c) * .13 + k * .4).toFixed(2)}s" cx="${x - 18 + c * 12}" cy="${ty + 9 + rw * 11}" r="4.2" fill="#FFF6D0"/>`).join("")).join("")}
     <circle cx="${x}" cy="${ty + 20}" r="46" fill="url(#bulb${id})" opacity=".55"/>` });
  /* the crest */
  s += crestSVG(200, cy, R, id);
  /* crowd peeking over the wall */
  const cr = rng(31); let crowd = ""; for (let i = 0; i < 22; i++) { const x = 8 + i * 18 + cr() * 6, c = ["#B30838", "#1D4A9A", "#F3C34A", "#E8EDF6", "#2A3556"][i % 5], hy = wallY - 6 - cr() * 8;
    crowd += `<g class="fan" style="--d:${(cr() * 1.6).toFixed(2)}s"><rect x="${x - 8}" y="${hy + 6}" width="16" height="20" rx="6" fill="${c}" ${ao(2)}/><circle cx="${x}" cy="${hy}" r="7" fill="#F2C9A0" ${ao(2)}/>${i % 4 === 0 ? `<path d="M${x + 6} ${hy + 8} L${x + 14} ${hy - 12}" ${ao(3)}/><path d="M${x + 14} ${hy - 12} l10 4 l-10 4z" fill="#B30838" ${ao(2)}/>` : i % 4 === 2 ? `<path d="M${x - 7} ${hy + 8} L${x - 13} ${hy - 6}" ${ao(3)}/>` : ""}</g>` }
  s += `<g>${crowd}</g>`;
  /* outfield wall */
  s += `<rect x="-6" y="${wallY}" width="412" height="44" fill="url(#wall${id})" ${ao(4)}/><rect x="-6" y="${wallY}" width="412" height="8" fill="#F3C34A" ${ao(3)}/>
   <text x="200" y="${wallY + 35}" text-anchor="middle" class="wallt">CLEARY  COUGARS</text>
   ${[26, 374].map(x => `<image href="img/cu.png" x="${x - 17}" y="${wallY + 14}" width="34" height="21"/>`).join("")}`;
  /* field */
  s += `<path d="M-10 ${wallY + 44} H410 V${H} H-10Z" fill="url(#grass${id})" ${ao(3)}/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${-10 + i * 80} ${wallY + 44} L${-60 + i * 90} ${H}" stroke="#fff" stroke-width="18" opacity=".05"/>`).join("")}
   <path d="M90 ${H} Q200 ${wallY + 70} 310 ${H}" fill="#C98B4E" ${ao(3)} opacity=".95"/><path d="M200 ${wallY + 92} l14 10 l-14 10 l-14 -10z" fill="#F4F1E8" ${ao(2)}/>`;
  /* a ball arcing across */
  s += `<g class="fly"><g class="ball" style="offset-path:path('M-30 ${cy + 60} Q200 ${cy - 150} 430 ${cy + 30}')"><circle r="7" fill="#fff" ${ao(2)}/><path d="M-4 -5 Q-1 0 -4 5 M4 -5 Q1 0 4 5" stroke="#B30838" stroke-width="1.4" fill="none"/></g></g>`;
  /* season weather */
  const w = rng(91); let fx = "";
  if (kind === "fall") for (let i = 0; i < 14; i++) fx += `<ellipse class="leaf" style="--d:${(w() * 8).toFixed(1)}s;--x:${(w() * 400).toFixed(0)}px;--y0:-20px;--y1:${H}px" rx="5" ry="2.6" fill="${["#E0712B", "#F3A33A", "#C2452D"][i % 3]}" ${ao(1)}/>`;
  if (kind === "winter") for (let i = 0; i < 34; i++) fx += `<circle class="flake" style="--d:${(w() * 9).toFixed(1)}s;--x:${(w() * 400).toFixed(0)}px;--y0:-10px;--y1:${H}px;--dur:${(6 + w() * 6).toFixed(1)}s" r="${(1.2 + w() * 2).toFixed(1)}" fill="#fff"/>`;
  if (kind === "storm") fx += `<path class="bolt" d="M70 40 l-16 52 h16 l-12 48 l38 -64 h-18 l14 -36z" fill="#FFE27A" ${ao(2)}/><path class="bolt b1" d="M320 70 l-12 40 h12 l-9 36 l28 -48 h-13 l10 -28z" fill="#FFE27A" ${ao(2)}/><rect class="flash" width="400" height="${H}" fill="#c9d6ff"/>`;
  if (kind === "stadium") for (let i = 0; i < 4; i++) { const x = 60 + w() * 280, y = 30 + w() * 90; fx += `<g class="fw" style="--d:${(i * 1.1).toFixed(1)}s" transform="translate(${x.toFixed(0)},${y.toFixed(0)})">${Array.from({ length: 12 }, (_, j) => { const a = j / 12 * Math.PI * 2; return `<line x2="${(Math.cos(a) * 20).toFixed(1)}" y2="${(Math.sin(a) * 20).toFixed(1)}" stroke="${["#F3C34A", "#E8274F", "#fff", "#5AA9FF"][i % 4]}" stroke-width="2.6" stroke-linecap="round"/>` }).join("")}</g>` }
  s += fx;
  return `<svg class="heroart" viewBox="0 0 400 ${H}" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">${s}</svg>` }

/* small crest for headers */
function miniCrest(size) { const id = "m" + (++ART_N); return `<svg class="minicrest" viewBox="-60 -60 120 120" width="${size}" height="${size}"><defs>${crestDefs(id)}</defs>${crestSVG(0, 0, 52, id).replace(/<g class="crays">[\s\S]*?<\/g>/, "")}</svg>` }

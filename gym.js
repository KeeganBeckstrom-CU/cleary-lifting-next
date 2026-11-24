/* ============ CU LIFTING · The Locker Room (first-person home screen) ============
   You stand in the middle of the Cleary locker room. Swipe to turn and look around 360°.
   Tap a spot: the camera walks you up to it, then that screen opens.
   Cartoon style: thick outlines, cel shading, glossy highlights. Live data is drawn into the room. */
"use strict";
const OL = "#0B1020", WALLS = ["platform", "lockers", "trophies", "tunnel"], WNAME = { platform: "The Platform", lockers: "Lockers", trophies: "Trophy Wall", tunnel: "The Tunnel" };
let GYM_INTRO = false, GYM_ANG = 0; /* GYM_ANG: which wall you face, in walls (0..4, fractional while turning) */
const o = (extra) => `stroke="${OL}" stroke-width="${extra || 3}" stroke-linejoin="round" stroke-linecap="round"`;
const shine = (x, y, w, h, op) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2}" fill="#fff" opacity="${op || .28}"/>`;

/* ---------- shared room shell: ceiling, wall, floor (perspective toward the wall you face) ---------- */
function shell(k, wallTop, wallBot) { let s = "";
  s += `<rect width="390" height="844" fill="#081022"/>`;
  s += `<rect width="390" height="${wallTop}" fill="url(#ceil)"/>${[40, 140, 250, 350].map(x => `<path d="M${x} 0 L${195 + (x - 195) * .55} ${wallTop}" stroke="#141E3A" stroke-width="6"/>`).join("")}`;
  s += `<rect y="${wallTop}" width="390" height="${wallBot - wallTop}" fill="url(#wall_${k})"/>`;
  s += `<rect y="${wallTop}" width="390" height="10" fill="#000" opacity=".25"/>`;
  s += `<rect y="${wallBot - 120}" width="390" height="14" fill="#B30838" ${o(2)}/><rect y="${wallBot - 106}" width="390" height="6" fill="#F3C34A" ${o(2)}/>`;
  s += `<rect y="${wallBot - 18}" width="390" height="18" fill="#1A2340" ${o(2)}/>`;
  s += `<rect y="${wallBot}" width="390" height="${844 - wallBot}" fill="url(#floor)"/>`;
  for (let i = -8; i <= 8; i++) s += `<path d="M${195 + i * 30} ${wallBot} L${195 + i * 150} 844" stroke="#0A1226" stroke-width="2" opacity=".8"/>`;
  [wallBot + 30, wallBot + 75, wallBot + 140, wallBot + 230].forEach(y => s += `<path d="M0 ${y}H390" stroke="#0A1226" stroke-width="2" opacity=".8"/>`);
  s += `<rect x="-14" y="${wallTop}" width="22" height="${844 - wallTop}" fill="#0A1226" opacity=".85"/><rect x="382" y="${wallTop}" width="22" height="${844 - wallTop}" fill="#0A1226" opacity=".85"/>`;
  return s }
function lamps(wallTop) { let s = ""; [[100, 0], [290, 1]].forEach(([x, k]) => {
  s += `<path d="M${x} 0 V${wallTop - 52}" stroke="#2A3556" stroke-width="3"/><path d="M${x - 30} ${wallTop - 24} Q${x} ${wallTop - 70} ${x + 30} ${wallTop - 24}Z" fill="#B30838" ${o(3)}/>${shine(x - 18, wallTop - 46, 14, 5, .35)}
   <ellipse cx="${x}" cy="${wallTop - 22}" rx="16" ry="6" fill="#FFF3C4" class="${k ? "flick" : ""}"/>
   <path d="M${x - 26} ${wallTop - 20} L${x - 150} 844 L${x + 150} 844 L${x + 26} ${wallTop - 20}Z" fill="url(#cone)" opacity=".32" class="${k ? "flick" : ""}"/>` }); return s }
function defs() { const wallc = { platform: ["#16306A", "#0D1F4A"], lockers: ["#132B5E", "#0B1B42"], trophies: ["#1B2A5C", "#0F1A40"], tunnel: ["#152D63", "#0C1C45"] };
  return `<defs>
  ${Object.entries(wallc).map(([k, [a, b]]) => `<linearGradient id="wall_${k}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join("")}
  <linearGradient id="ceil" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#03060F"/><stop offset="1" stop-color="#0B1430"/></linearGradient>
  <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1A2240"/><stop offset=".4" stop-color="#121A33"/><stop offset="1" stop-color="#070B18"/></linearGradient>
  <linearGradient id="cone" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFF3C4" stop-opacity=".9"/><stop offset="1" stop-color="#FFF3C4" stop-opacity="0"/></linearGradient>
  <linearGradient id="steel" x1="0" x2="1"><stop offset="0" stop-color="#5D6C8C"/><stop offset=".35" stop-color="#C9D3E6"/><stop offset=".6" stop-color="#8A98B6"/><stop offset="1" stop-color="#4A5776"/></linearGradient>
  <linearGradient id="wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#C98B4E"/><stop offset="1" stop-color="#8E5A2C"/></linearGradient>
  <linearGradient id="woodD" x1="0" x2="1"><stop offset="0" stop-color="#6B3F1E"/><stop offset=".5" stop-color="#8E5A2C"/><stop offset="1" stop-color="#6B3F1E"/></linearGradient>
  <linearGradient id="navyL" x1="0" x2="1"><stop offset="0" stop-color="#1D4A9A"/><stop offset=".5" stop-color="#2A60BE"/><stop offset="1" stop-color="#1D4A9A"/></linearGradient>
  <linearGradient id="gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFF0B3"/><stop offset=".45" stop-color="#F7C948"/><stop offset="1" stop-color="#C98A12"/></linearGradient>
  <linearGradient id="red" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F0335E"/><stop offset="1" stop-color="#A00632"/></linearGradient>
  <linearGradient id="blue" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4C8DF0"/><stop offset="1" stop-color="#1F55B8"/></linearGradient>
  <linearGradient id="field" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0A1A3A"/><stop offset=".55" stop-color="#2A5BA8"/><stop offset=".56" stop-color="#2FB873"/><stop offset="1" stop-color="#17703F"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#FFE7A0" stop-opacity=".85"/><stop offset="1" stop-color="#FFE7A0" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowB"><stop offset="0" stop-color="#8FD8FF" stop-opacity=".9"/><stop offset="1" stop-color="#8FD8FF" stop-opacity="0"/></radialGradient>
  <radialGradient id="pool"><stop offset="0" stop-color="#FFF3C4" stop-opacity=".22"/><stop offset="1" stop-color="#FFF3C4" stop-opacity="0"/></radialGradient></defs>` }

/* ---------- cartoon props ---------- */
function plate(x, cy, h, col) { const w = h * .3; return `<g><rect x="${x - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${w / 2.2}" fill="url(#${col})" ${o()}/><rect x="${x - w / 2 + 3}" y="${cy - h / 2 + 8}" width="4" height="${h - 16}" rx="2" fill="#fff" opacity=".35"/></g>` }
function trophy(x, y, sc, won, n) { return `<g transform="translate(${x},${y}) scale(${sc})">${won ? `<circle cy="-30" r="34" fill="url(#glow)"/>` : ""}
  <path d="M-16,-56 h32 v12 a16,18 0 0 1 -32,0z" fill="${won ? "url(#gold)" : "#3A4566"}" ${o()}/><path d="M-16,-50 h-9 a9,10 0 0 0 9,14 M16,-50 h9 a9,10 0 0 1 -9,14" fill="none" ${o()}/>
  <rect x="-5" y="-26" width="10" height="12" fill="${won ? "url(#gold)" : "#3A4566"}" ${o()}/><rect x="-14" y="-14" width="28" height="14" rx="3" fill="${won ? "#7A4A12" : "#262F4C"}" ${o()}/>
  ${won ? shine(-11, -52, 5, 14, .6) : ""}<text y="-3" text-anchor="middle" class="tn ${won ? "w" : ""}">${n}</text></g>` }
function spark(x, y, s) { return `<path class="sparkle" style="--d:${(x % 7) / 3}s" transform="translate(${x},${y}) scale(${s || 1})" d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2Z" fill="#FFF6D0"/>` }

/* ---------- WALL 1 · THE PLATFORM (today's lift) ---------- */
function wallPlatform(D) { const top = 170, bot = 560; let s = shell("platform", top, bot);
  s += `<g><path d="M60 196 H330 V320 L195 352 L60 320Z" fill="url(#red)" ${o(4)}/><path d="M72 208 H318 V312 L195 340 L72 312Z" fill="none" stroke="#F3C34A" stroke-width="3"/>
   <image href="img/cu.png" x="125" y="212" width="140" height="88"/><text x="195" y="327" text-anchor="middle" class="ban">BASEBALL</text></g>`;
  s += `<text x="195" y="392" text-anchor="middle" class="wtxt">EARN IT. EVERY REP.</text>`;
  const h = new Date(); s += `<g transform="translate(350,250)"><circle r="24" fill="#F4F1E8" ${o(4)}/><circle r="18" fill="none" stroke="#C9C3B2" stroke-width="2"/><path d="M0 0 L${(Math.sin(h.getHours() / 12 * 6.283) * 10).toFixed(1)} ${(-Math.cos(h.getHours() / 12 * 6.283) * 10).toFixed(1)} M0 0 L${(Math.sin(h.getMinutes() / 60 * 6.283) * 15).toFixed(1)} ${(-Math.cos(h.getMinutes() / 60 * 6.283) * 15).toFixed(1)}" ${o(3)}/><circle r="3" fill="#B30838"/></g>`;
  s += lamps(top);
  s += `<ellipse cx="195" cy="700" rx="200" ry="60" fill="url(#pool)"/><path d="M40 640 H350 L380 760 H10Z" fill="url(#wood)" ${o(4)}/><path d="M120 640 L100 760 M270 640 L290 760" stroke="#6B3F1E" stroke-width="3"/>
   <path d="M128 648 H262 L280 752 H110Z" fill="#B30838" opacity=".85" ${o(3)}/><image href="img/cu.png" x="150" y="672" width="90" height="56" opacity=".9"/>`;
  s += `<g class="rack">${[118, 258].map(x => `<rect x="${x}" y="410" width="16" height="250" rx="3" fill="url(#steel)" ${o(4)}/>${Array.from({ length: 10 }, (_, i) => `<circle cx="${x + 8}" cy="${432 + i * 22}" r="2.6" fill="${OL}"/>`).join("")}`).join("")}
   <rect x="108" y="398" width="174" height="18" rx="5" fill="url(#steel)" ${o(4)}/>${shine(116, 402, 150, 4, .4)}
   <g class="bar"><rect x="22" y="520" width="346" height="12" rx="6" fill="url(#steel)" ${o(3)}/>${shine(40, 522, 300, 3, .5)}
    ${plate(62, 526, 104, "red")}${plate(86, 526, 104, "red")}${plate(108, 526, 80, "blue")}${plate(328, 526, 104, "red")}${plate(304, 526, 104, "red")}${plate(282, 526, 80, "blue")}
    <rect x="16" y="514" width="14" height="24" rx="4" fill="url(#steel)" ${o(3)}/><rect x="360" y="514" width="14" height="24" rx="4" fill="url(#steel)" ${o(3)}/></g>
   <rect x="134" y="512" width="12" height="14" fill="#8A98B6" ${o(2)}/><rect x="244" y="512" width="12" height="14" fill="#8A98B6" ${o(2)}/></g>`;
  s += `<g transform="translate(36,612)"><path d="M-22 0 H22 L16 22 H-16Z" fill="#E8EDF6" ${o(3)}/><ellipse cy="0" rx="22" ry="6" fill="#fff" ${o(3)}/></g>`;
  [[340, 620, "red"], [372, 640, "blue"]].forEach(([x, y, c]) => s += `<g transform="translate(${x},${y})"><path d="M-10 -12 Q0 -30 10 -12" fill="none" ${o(6)}/><path d="M-10 -12 Q0 -30 10 -12" fill="none" stroke="#3A4566" stroke-width="3"/><circle r="17" fill="url(#${c})" ${o(3)}/>${shine(-10, -10, 5, 10, .45)}</g>`);
  if (D.done) s += `<g transform="translate(195,470)"><circle r="40" fill="url(#glow)"/><path d="M-16 0 L-4 12 L18 -12" fill="none" stroke="#2FB873" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  return s }

/* ---------- WALL 2 · LOCKERS (me, walk-up, capsule) ---------- */
function wallLockers(D) { const top = 150, bot = 600; let s = shell("lockers", top, bot); s += lamps(top);
  const LX = [20, 92, 164, 236, 308];
  LX.forEach((x, i) => { const mine = i === 2, w = 64;
    s += `<rect x="${x}" y="190" width="${w}" height="${bot - 18 - 190}" rx="4" fill="url(#navyL)" ${o(4)}/>${shine(x + 6, 198, 5, bot - 230, .18)}
     ${[0, 1, 2, 3].map(v => `<rect x="${x + 16}" y="${206 + v * 9}" width="32" height="4" rx="2" fill="${OL}" opacity=".7"/>`).join("")}${[0, 1, 2, 3].map(v => `<rect x="${x + 16}" y="${bot - 70 + v * 9}" width="32" height="4" rx="2" fill="${OL}" opacity=".7"/>`).join("")}
     <rect x="${x + 50}" y="360" width="6" height="30" rx="3" fill="#C9D3E6" ${o(2)}/>
     <rect x="${x + 12}" y="258" width="40" height="22" rx="4" fill="#F4F1E8" ${o(2)}/><text x="${x + 32}" y="274" text-anchor="middle" class="lk">${mine ? esc(D.num || "—") : ["7", "22", "", "31", "9"][i]}</text>` });
  const x = 164; s += `<rect x="${x + 4}" y="194" width="56" height="${bot - 26 - 194}" fill="#06102A" ${o(2)}/><rect x="${x + 4}" y="194" width="56" height="60" fill="url(#glow)" opacity=".5"/>
   <path d="M${x + 14} 300 L${x + 22} 288 H${x + 42} L${x + 50} 300 L${x + 46} 306 L${x + 44} 300 V380 H${x + 20} V300 L${x + 18} 306Z" fill="url(#red)" ${o(3)}/><text x="${x + 32}" y="345" text-anchor="middle" class="jn">${esc(D.num || "")}</text>
   <path d="M${x + 22} 288 Q${x + 32} 298 ${x + 42} 288" fill="none" ${o(2)}/>
   ${D.card ? `<g class="lcard"><rect x="${x + 16}" y="410" width="32" height="44" rx="4" fill="url(#gold)" ${o(3)}/><rect x="${x + 20}" y="414" width="24" height="18" rx="2" fill="#0F1E40"/><text x="${x + 32}" y="448" text-anchor="middle" class="cdo">${D.ovr || ""}</text>${spark(x + 50, 408, .9)}</g>` : `<rect x="${x + 18}" y="414" width="28" height="38" rx="3" fill="none" stroke="#3A4A70" stroke-width="2" stroke-dasharray="4 3"/>`}
   <path d="M${x + 60} 190 L${x + 96} 204 L${x + 96} ${bot - 30} L${x + 60} ${bot - 18}Z" fill="url(#navyL)" ${o(4)}/>${[0, 1, 2].map(v => `<path d="M${x + 70} ${214 + v * 9} L${x + 88} ${220 + v * 9}" ${o(3)}/>`).join("")}`;
  s += `<g transform="translate(${x + 32},${bot - 12})"><rect x="-44" y="-14" width="88" height="22" rx="4" fill="#F3C34A" ${o(3)}/><text y="2" text-anchor="middle" class="np">${esc((D.ln || "YOU").toUpperCase().slice(0, 11))}</text></g>`;
  s += `<g transform="translate(296,150)"><path d="M10 0 Q40 -26 70 0" fill="none" ${o(5)}/><path d="M10 0 Q40 -26 70 0" fill="none" stroke="#3A4566" stroke-width="3"/><rect x="0" y="0" width="80" height="40" rx="9" fill="url(#red)" ${o(4)}/>
   <circle cx="20" cy="22" r="12" fill="#0B1020" stroke="#F3C34A" stroke-width="3"/><circle cx="60" cy="22" r="12" fill="#0B1020" stroke="#F3C34A" stroke-width="3"/><circle cx="20" cy="22" r="5" fill="#3A4566" class="${D.walk ? "thump" : ""}"/><circle cx="60" cy="22" r="5" fill="#3A4566" class="${D.walk ? "thump" : ""}"/>${shine(6, 4, 30, 4, .35)}
   ${D.walk ? [0, 1, 2].map(i => `<text x="${30 + i * 14}" y="-10" class="note" style="--d:${i * .6}s">♪</text>`).join("") : ""}</g>`;
  s += `<ellipse cx="195" cy="790" rx="190" ry="34" fill="#000" opacity=".35"/><rect x="30" y="700" width="330" height="26" rx="10" fill="url(#red)" ${o(4)}/>${shine(44, 704, 290, 5, .3)}<rect x="30" y="722" width="330" height="12" fill="#7E0628" ${o(3)}/>
   ${[60, 320].map(px => `<rect x="${px}" y="734" width="14" height="60" rx="3" fill="url(#steel)" ${o(3)}/>`).join("")}`;
  s += `<g transform="translate(78,672)"><path d="M-40 28 Q-44 -4 -20 -8 H24 Q46 -4 42 28Z" fill="url(#blue)" ${o(4)}/><path d="M-14 -8 Q2 -30 18 -8" fill="none" ${o(4)}/><path d="M-30 6 H32" stroke="#F3C34A" stroke-width="4"/><image href="img/cu.png" x="-12" y="8" width="26" height="16"/></g>`;
  if (D.caps) s += `<g class="gcap" transform="translate(290,660)"><circle r="48" fill="url(#glowB)"/><rect x="-17" y="-30" width="34" height="60" rx="17" fill="#BFEAFF" ${o(4)}/><rect x="-17" y="0" width="34" height="30" rx="8" fill="url(#gold)" ${o(4)}/><rect x="-20" y="-4" width="40" height="8" rx="3" fill="#FFF0C0" ${o(3)}/>${shine(-10, -24, 6, 16, .6)}${spark(26, -30)}${spark(-28, -12, .7)}</g>`;
  return s }

/* ---------- WALL 3 · TROPHY WALL (trophies, hall of fame, coach) ---------- */
function wallTrophies(D) { const top = 150, bot = 600; let s = shell("trophies", top, bot); s += lamps(top);
  s += `<text x="132" y="200" text-anchor="middle" class="wtxt big">HALL OF CHAMPIONS</text>`;
  s += `<rect x="18" y="214" width="228" height="${bot - 18 - 214}" rx="6" fill="url(#woodD)" ${o(4)}/><rect x="30" y="226" width="204" height="${bot - 44 - 226}" rx="3" fill="#0A1838" ${o(3)}/><rect x="30" y="226" width="204" height="20" fill="url(#glow)" opacity=".7"/>`;
  [326, 432].forEach(y => s += `<rect x="30" y="${y}" width="204" height="8" fill="url(#wood)" ${o(2)}/>`);
  let n = 0; [326, 432].forEach(y => { for (let i = 0; i < 5; i++) { s += trophy(50 + i * 41, y, .62, D.won[n], n + 1); n++ } });
  s += `<path d="M42 232 L66 232 L46 ${bot - 50} L36 ${bot - 50}Z" fill="#fff" opacity=".08"/><path d="M90 232 L102 232 L82 ${bot - 50} L76 ${bot - 50}Z" fill="#fff" opacity=".05"/>`;
  s += `<rect x="40" y="${bot - 40}" width="184" height="16" rx="3" fill="url(#gold)" ${o(2)}/><text x="132" y="${bot - 28}" text-anchor="middle" class="np">PHASE TROPHIES · ${D.won.filter(Boolean).length}/10</text>`;
  s += `<rect x="262" y="214" width="112" height="${bot - 18 - 214}" rx="4" fill="url(#wood)" ${o(4)}/><rect x="276" y="230" width="84" height="80" rx="3" fill="#FFD98A" ${o(3)} class="offwin"/>${[0, 1, 2, 3, 4, 5].map(v => `<rect x="276" y="${236 + v * 12}" width="84" height="5" fill="#C98B4E" opacity=".75"/>`).join("")}
   <rect x="280" y="326" width="76" height="24" rx="4" fill="#F4F1E8" ${o(3)}/><text x="318" y="343" text-anchor="middle" class="np d">COACH</text><circle cx="360" cy="420" r="7" fill="url(#gold)" ${o(2)}/>
   <rect x="284" y="380" width="66" height="${bot - 18 - 400}" rx="3" fill="none" stroke="#8E5A2C" stroke-width="3"/>`;
  s += `<g transform="translate(318,470) rotate(-4)"><rect x="-20" y="-26" width="40" height="54" rx="4" fill="url(#wood)" ${o(3)}/><rect x="-15" y="-18" width="30" height="40" fill="#E8EDF6" ${o(2)}/><rect x="-8" y="-30" width="16" height="9" rx="2" fill="url(#steel)" ${o(2)}/>${[0, 1, 2, 3].map(v => `<path d="M-10 ${-10 + v * 8} H10" stroke="#3A4566" stroke-width="2"/>`).join("")}</g>`;
  s += `<ellipse cx="195" cy="800" rx="190" ry="30" fill="#000" opacity=".3"/>`;
  [[60, 720, "red", 30], [118, 738, "blue", 24], [330, 730, "red", 28]].forEach(([x, y, c, r]) => s += `<g transform="translate(${x},${y})"><circle r="${r}" fill="url(#${c})" ${o(4)}/><path d="M${-r} 0 Q0 ${r * .5} ${r} 0" fill="none" ${o(3)}/>${shine(-r * .55, -r * .6, r * .35, r * .5, .4)}</g>`);
  return s }

/* ---------- WALL 4 · THE TUNNEL (season map, team TV, this week) ---------- */
function wallTunnel(D) { const top = 150, bot = 600; let s = shell("tunnel", top, bot); s += lamps(top);
  s += `<rect x="100" y="166" width="190" height="34" rx="6" fill="url(#red)" ${o(4)}/><text x="195" y="190" text-anchor="middle" class="sign">ROAD TO THE SEASON</text>${[124, 266].map(x => `<path d="M${x} 150 V166" ${o(3)}/>`).join("")}`;
  s += `<path d="M120 ${bot - 18} V280 Q195 210 270 280 V${bot - 18}Z" fill="url(#field)" ${o(5)}/>
   <g class="tlights">${[[150, 290], [240, 290]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="34" fill="url(#glow)"/><rect x="${x - 12}" y="${y - 8}" width="24" height="14" rx="3" fill="#1F2A44" ${o(2)}/>${[0, 1, 2].map(c => `<circle cx="${x - 7 + c * 7}" cy="${y - 1}" r="2.6" fill="#FFF6D0"/>`).join("")}<rect x="${x - 1.5}" y="${y + 6}" width="3" height="60" fill="#1F2A44"/>`).join("")}</g>
   <path d="M150 ${bot - 18} L182 410 H208 L240 ${bot - 18}Z" fill="#B8743C" opacity=".75"/><path d="M182 430 L195 418 L208 430 L195 442Z" fill="#F4F1E8" ${o(2)}/>
   ${[[140, 250], [255, 245], [195, 232], [170, 262], [225, 266]].map(([x, y]) => `<circle class="twk" cx="${x}" cy="${y}" r="1.6" fill="#fff"/>`).join("")}`;
  s += `<path d="M112 ${bot - 18} V278 Q195 198 278 278 V${bot - 18}" fill="none" stroke="#2A3556" stroke-width="10"/><path d="M112 ${bot - 18} V278 Q195 198 278 278 V${bot - 18}" fill="none" ${o(3)}/>`;
  s += `<path d="M84 230 V${bot - 40} L60 ${bot - 52} V230Z" fill="url(#red)" ${o(3)}/><path d="M306 230 V${bot - 40} L330 ${bot - 52} V230Z" fill="url(#blue)" ${o(3)}/>`;
  s += `<g transform="translate(20,236)"><rect width="78" height="56" rx="6" fill="#0B1020" ${o(4)}/><rect x="6" y="6" width="66" height="40" rx="3" fill="#123170"/><text x="39" y="28" text-anchor="middle" class="tvb">${D.td}/${D.n}</text><text x="39" y="40" text-anchor="middle" class="tvs">LIFTED TODAY</text><rect x="30" y="56" width="18" height="10" fill="#2A3556" ${o(2)}/></g>`;
  s += `<g transform="translate(296,236)"><rect width="80" height="96" rx="5" fill="url(#wood)" ${o(4)}/><rect x="7" y="7" width="66" height="82" rx="2" fill="#173A2A"/>
   <text x="40" y="28" text-anchor="middle" class="ch">WK ${D.wk}</text><path d="M16 44 C26 38 32 52 42 46 S58 36 64 44" fill="none" stroke="#E8EFE6" stroke-width="2" stroke-dasharray="4 3"/>
   ${D.days.map((d, i) => `<g transform="translate(${18 + i * 22},70)"><rect x="-8" y="-10" width="16" height="16" rx="3" fill="none" stroke="#E8EFE6" stroke-width="2"/>${d ? `<path d="M-5 -2 L-1 2 L6 -6" fill="none" stroke="#7FE0A8" stroke-width="2.4" stroke-linecap="round"/>` : ""}</g>`).join("")}</g>`;
  s += `<ellipse cx="195" cy="800" rx="190" ry="30" fill="#000" opacity=".3"/>`;
  [[50, 740], [340, 744]].forEach(([x, y]) => s += `<g transform="translate(${x},${y})"><path d="M-16 20 L0 -26 L16 20Z" fill="#FF7A1A" ${o(3)}/><path d="M-10 4 H10" stroke="#fff" stroke-width="5"/><rect x="-22" y="18" width="44" height="8" rx="2" fill="#FF7A1A" ${o(3)}/></g>`);
  s += `<g transform="translate(110,720)"><path d="M-26 -14 H26 L20 34 H-20Z" fill="#E8EDF6" ${o(3)}/>${[[-12, -18], [2, -22], [14, -16], [-4, -12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#fff" ${o(2)}/>`).join("")}</g>`;
  return s }

/* ---------- live data for the room ---------- */
function roomData() { const T = findToday(), Q = PH[T.p], rows = teamRows(), M = CFG.me || {};
  return { done: isDone(T.p, T.w, T.d), num: M.num || "", ln: M.ln || "", card: CFG.card, ovr: CFG.card ? cardRatings().ovr : "", walk: !!CFG.walk, caps: unopened().length,
    won: PH.map((_, p) => phaseWon(p)), td: rows.filter(r => r.todayDone).length, n: rows.length, wk: Q.weeks[T.w].n, days: Q.days.filter(D => !skipMsg(T.p, T.w, D.k)).map(D => isDone(T.p, T.w, D.k)) } }
function wallSVG(k, D) { const f = { platform: wallPlatform, lockers: wallLockers, trophies: wallTrophies, tunnel: wallTunnel }[k];
  const r = rng(k.length * 13); let motes = ""; for (let i = 0; i < 14; i++) motes += `<circle class="mote" style="--d:${(r() * 9).toFixed(1)}s;--x:${(r() * 40 - 20).toFixed(0)}px" cx="${(40 + r() * 310).toFixed(0)}" cy="${(160 + r() * 520).toFixed(0)}" r="${(.8 + r() * 1.4).toFixed(1)}" fill="#FFE7B0"/>`;
  return `<svg class="wall" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${defs()}${f(D)}${motes}</svg>` }

/* hotspots per wall (x,y in % of the wall) */
function wallSpots(k, D) { const T = findToday(), pc = Math.round((dayPct(T.p, T.w, T.d) || 0) * 100), skip = skipMsg(T.p, T.w, T.d);
  return ({ platform: [{ x: 50, y: 49, go: "start", l: skip ? "Rest day" : D.done ? "Done ✓" : pc ? "Keep going" : "Today's lift", s: skip ? "See the week" : dayLabel(T.p, T.d) + (pc && !D.done ? " · " + pc + "%" : ""), big: 1 }],
    lockers: [{ x: 50, y: 29, go: "me", l: "My locker", s: CFG.card ? "Card · settings" : "Profile · settings" }, { x: 86, y: 21, go: "walk", l: "Walk-up song", s: CFG.walk ? "Change it" : "Pick yours" }].concat(D.caps ? [{ x: 74, y: 78, go: "cap", l: D.caps + " capsule" + (D.caps > 1 ? "s" : ""), s: "Tap to open", hot: 1 }] : []),
    trophies: [{ x: 34, y: 44, go: "trophies", l: "Trophy case", s: D.won.filter(Boolean).length + " of 10 · Hall of Fame" }].concat(isCoach() ? [{ x: 81.5, y: 48, go: "coach", l: "Coach's office", s: "Team numbers" }] : []),
    tunnel: [{ x: 50, y: 50, go: "season", l: "Road to the season", s: "Week " + D.wk + " of 35" }, { x: 15, y: 39, go: "team", l: "Team", s: D.td + " lifted today" }, { x: 85, y: 43, go: "today", l: "This week", s: "Plan · streak · XP" }] })[k] }

/* ---------- the view ---------- */
function gymHTML() { const T = findToday(), Q = PH[T.p], st = streakInfo(), xp = xpInfo(), D = roomData(); const intro = !GYM_INTRO; GYM_INTRO = true;
  const seq = WALLS.concat(WALLS[0]); /* the first wall repeats at the end so turning wraps all the way around */
  return `<div class="gym"><div class="pano" id="pano"><div class="strip" id="strip">${seq.map((k, i) => `<div class="wallbox" data-w="${k}">${wallSVG(k, D)}<div class="spots">${wallSpots(k, D).map(s => `<button class="spot ${s.big ? "big" : ""} ${s.hot ? "hot" : ""}" style="left:${s.x}%;top:${s.y}%" data-gym="${s.go}" data-wi="${i % 4}" aria-label="${esc(s.l)}"><span class="gdot"><i></i></span><span class="tape"><b>${esc(s.l)}</b><small>${esc(s.s)}</small></span></button>`).join("")}</div></div>`).join("")}</div></div>
   <div class="gvig"></div><div class="ghud"><div class="gcrest"><img src="img/cu.png" alt="CU"><div><small>Cleary locker room</small><em>Wk ${Q.weeks[T.w].n} · ${esc(Q.short)}</em></div></div><div class="ghr"><span class="chip fl">${I.flame}<b>${st.cur}</b></span><span class="chip lv">${esc(xp.name)}</span></div></div>
   <div class="compass"><button class="turn" data-turn="-1" aria-label="Turn left">${I.back}</button><div class="cwrap"><b id="wname">${WNAME[WALLS[0]]}</b><div class="cdots">${WALLS.map((k, i) => `<i data-cd="${i}"></i>`).join("")}</div></div><button class="turn" data-turn="1" aria-label="Turn right">${I.fwd}</button></div>
   ${intro ? `<div class="gintro"><h1>Welcome to the room.</h1><p>Swipe to look around · tap to walk up</p><div class="swipehint"><span>👆</span></div></div>` : ""}</div>` }

let PAN = null;
function gymInit() { const pano = $("#pano"), strip = $("#strip"); if (!pano) return; const W = () => pano.clientWidth;
  const wrap = a => ((a % 4) + 4) % 4;
  const apply = () => { strip.style.transform = `translateX(${(-GYM_ANG * W()).toFixed(1)}px)`; const near = Math.round(wrap(GYM_ANG)) % 4; const wn = $("#wname"); if (wn) wn.textContent = WNAME[WALLS[near]]; $$(".cdots i").forEach((d, i) => d.classList.toggle("on", i === near)) };
  const settle = (target, ms) => { const from = GYM_ANG, t0 = performance.now(), d = RM ? 1 : (ms || 420); cancelAnimationFrame(PAN.raf);
    const step = t => { const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); GYM_ANG = from + (target - from) * e; apply(); if (k < 1) PAN.raf = requestAnimationFrame(step); else { GYM_ANG = wrap(Math.round(GYM_ANG)); apply() } }; PAN.raf = requestAnimationFrame(step) };
  PAN = { settle, apply, raf: 0 }; apply();
  let sx = 0, sa = 0, lx = 0, lt = 0, vx = 0, drag = false, moved = 0;
  pano.onpointerdown = e => { if (e.target.closest(".spot")) return; drag = true; moved = 0; sx = lx = e.clientX; lt = performance.now(); sa = GYM_ANG; vx = 0; cancelAnimationFrame(PAN.raf); try { pano.setPointerCapture(e.pointerId) } catch (x) { } };
  pano.onpointermove = e => { if (!drag) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); let a = sa - dx / W(); while (a < 0) a += 4; while (a >= 4) a -= 4; GYM_ANG = a; const now = performance.now(); vx = (e.clientX - lx) / Math.max(1, now - lt); lx = e.clientX; lt = now; apply() };
  pano.onpointerup = pano.onpointercancel = () => { if (!drag) return; drag = false; let t = Math.round(GYM_ANG);
    if (Math.abs(vx) > .25) t = vx < 0 ? Math.floor(GYM_ANG) + 1 : Math.ceil(GYM_ANG) - 1;
    if (t < 0) { GYM_ANG += 4; t += 4 } settle(t); if (moved > 10) buzz(8) };
  if ($(".gintro") && !RM) { pano.classList.add("enter"); setTimeout(() => pano.classList.remove("enter"), 1900) } }
function gymTurn(dir) { if (!PAN) return; let t = Math.round(GYM_ANG) + dir; if (t < 0) { GYM_ANG += 4; t += 4 } PAN.settle(t); buzz(8) }
function gymGo(k, btn) { const wi = btn && btn.dataset.wi != null ? +btn.dataset.wi : null; if (btn) { btn.classList.add("tap"); buzz(12) }
  const act = () => { if (k === "start") { const T = findToday(); SEL = null; startWorkout(T.p, T.w, T.d) } else if (k === "walk") walkSetup(); else if (k === "cap") openCapsule(unopened()[0]); else go(k) };
  const pano = $("#pano"); if (!pano || RM || !btn || !PAN) { act(); return }
  const near = ((Math.round(GYM_ANG) % 4) + 4) % 4, turning = wi != null && wi !== near;
  if (turning) { let t = wi; if (wi === 0 && near === 3) t = 4; else if (wi === 3 && near === 0) { GYM_ANG += 4 } PAN.settle(t, 320) }
  setTimeout(() => { const r = btn.getBoundingClientRect(), pr = pano.getBoundingClientRect(); let cx = r.left + r.width / 2 - pr.left; cx = ((cx % pr.width) + pr.width) % pr.width;
    pano.style.transformOrigin = (cx / pr.width * 100).toFixed(1) + "% " + ((r.top + 10 - pr.top) / pr.height * 100).toFixed(1) + "%"; pano.classList.add("walk"); $$(".gym .ghud,.gym .compass").forEach(e => e.style.opacity = 0);
    setTimeout(act, 640) }, turning ? 360 : 0) }

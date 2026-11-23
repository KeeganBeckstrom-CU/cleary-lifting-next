/* ============ CU LIFTING · The Weight Room (home screen) ============
   Illustrated night-time Cleary weight room. Every area is a hotspot to a screen.
   Live details: your jersey # on your locker, trophies light up as you win phases,
   this week on the chalkboard, team count on the TV, a capsule on the bench when one's ready. */
"use strict";
let GYM_INTRO = false;
function gymSVG() { const T = findToday(), Q = PH[T.p], wk = Q.weeks[T.w].n, num = (CFG.me && CFG.me.num) || "", rows = teamRows(), td = rows.filter(r => r.todayDone).length, n = rows.length;
  const won = PH.map((_, p) => phaseWon(p)), caps = unopened().length, done = isDone(T.p, T.w, T.d);
  const brick = `<pattern id="brk" width="40" height="20" patternUnits="userSpaceOnUse"><rect width="40" height="20" fill="#0E1A36"/><path d="M0 .5H40M0 10.5H40M.5 0V10M20.5 10V20" stroke="#0A1430" stroke-width="1.4"/></pattern>`;
  const defs = `<defs>${brick}
   <linearGradient id="gwall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#050A18" stop-opacity=".85"/><stop offset=".5" stop-color="#0A1430" stop-opacity=".2"/><stop offset="1" stop-color="#03060F" stop-opacity=".75"/></linearGradient>
   <linearGradient id="gfloor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0B1222"/><stop offset="1" stop-color="#03060C"/></linearGradient>
   <linearGradient id="gcone" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFE7B0" stop-opacity=".55"/><stop offset="1" stop-color="#FFE7B0" stop-opacity="0"/></linearGradient>
   <linearGradient id="gsky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#02050E"/><stop offset=".7" stop-color="#0D2A5A"/><stop offset="1" stop-color="#1B4A3A"/></linearGradient>
   <linearGradient id="gwood" x1="0" x2="1"><stop offset="0" stop-color="#3B2414"/><stop offset=".5" stop-color="#5A3820"/><stop offset="1" stop-color="#3B2414"/></linearGradient>
   <linearGradient id="gsteel" x1="0" x2="1"><stop offset="0" stop-color="#2A3448"/><stop offset=".5" stop-color="#6B7A96"/><stop offset="1" stop-color="#2A3448"/></linearGradient>
   <linearGradient id="glock" x1="0" x2="1"><stop offset="0" stop-color="#0D2A57"/><stop offset=".5" stop-color="#17407E"/><stop offset="1" stop-color="#0D2A57"/></linearGradient>
   <radialGradient id="gglow"><stop offset="0" stop-color="#FFE7B0" stop-opacity=".5"/><stop offset="1" stop-color="#FFE7B0" stop-opacity="0"/></radialGradient>
   <radialGradient id="gfield"><stop offset="0" stop-color="#FFF6D0" stop-opacity=".9"/><stop offset="1" stop-color="#FFF6D0" stop-opacity="0"/></radialGradient>
   <radialGradient id="ggold" cx=".4" cy=".3"><stop offset="0" stop-color="#FFF1C2"/><stop offset=".6" stop-color="#F3C34A"/><stop offset="1" stop-color="#9A6A12"/></radialGradient>
   <filter id="gblur"><feGaussianBlur stdDeviation="6"/></filter><filter id="gsoft"><feGaussianBlur stdDeviation="2"/></filter></defs>`;
  let s = defs;
  /* ceiling + wall */
  s += `<rect width="390" height="844" fill="#04070F"/><rect y="96" width="390" height="470" fill="url(#brk)"/><rect y="96" width="390" height="470" fill="url(#gwall)"/>`;
  s += `<rect y="0" width="390" height="100" fill="#03060D"/><path d="M0 100H390" stroke="#1A2846" stroke-width="3"/>${[60, 150, 240, 330].map(x => `<rect x="${x - 3}" y="0" width="6" height="100" fill="#0A1222"/>`).join("")}`;
  s += `<rect y="512" width="390" height="10" fill="#B30838"/><rect y="522" width="390" height="3" fill="#7E0628"/>`;
  s += `<text x="16" y="128" class="gpaint">BUILT IN THE DARK</text>`;
  /* trophy case */
  s += `<g class="g-tro"><rect x="12" y="226" width="90" height="290" rx="4" fill="url(#gwood)"/><rect x="18" y="234" width="78" height="272" fill="#0A1530"/><rect x="18" y="234" width="78" height="272" fill="rgba(150,190,255,.06)"/>
   <rect x="18" y="234" width="78" height="14" fill="url(#gglow)" opacity=".9"/>`;
  const shelves = [[290, 3], [356, 3], [422, 2], [488, 2]]; let ti = 0;
  shelves.forEach(([y, k]) => { s += `<rect x="18" y="${y}" width="78" height="4" fill="#5A3820"/>`; for (let i = 0; i < k; i++) { const cx = 18 + 78 / (k + 1) * (i + 1), w = won[ti];
    s += `<g class="cup ${w ? "won" : ""}" transform="translate(${cx.toFixed(1)},${y})">${w ? `<circle cy="-18" r="16" fill="url(#gglow)"/>` : ""}<path d="M-8,-34 h16 v6 a8,8 0 0 1 -16,0z M-3,-20 h6 v8 h-6z M-7,-12 h14 v12 h-14z" fill="${w ? "url(#ggold)" : "#26324F"}"/><text y="-3" text-anchor="middle" class="cupn">${ti + 1}</text></g>`; ti++ } });
  s += `<path d="M24 240 L40 240 L28 500 L20 500Z" fill="#fff" opacity=".05"/></g>`;
  /* chalkboard */
  s += `<g class="g-board"><rect x="110" y="134" width="162" height="124" rx="4" fill="#4A3220"/><rect x="116" y="140" width="150" height="112" fill="#13241C"/>
   <path d="M128 236 C150 230 150 205 172 205 S200 225 214 196 S236 168 254 160" stroke="#E8EFE6" stroke-width="2.2" fill="none" stroke-dasharray="5 4" opacity=".85" class="chalk"/>
   ${[[128, 236], [172, 205], [214, 196], [254, 160]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 2 ? 5 : 3.5}" fill="${i < 2 ? "#E8EFE6" : i === 2 ? "#FF8AA0" : "none"}" stroke="#E8EFE6" stroke-width="1.6"/>`).join("")}
   <text x="124" y="160" class="chalkt">WK ${wk}</text><text x="262" y="246" text-anchor="end" class="chalkt sm">${esc(Q.short.toUpperCase())}</text>
   <rect x="120" y="250" width="40" height="5" rx="2" fill="#B9C4BA"/></g>`;
  /* lockers */
  s += `<g class="g-lock">`; [0, 1, 2].forEach(i => { const x = 110 + i * 30, mine = i === 1; s += `<rect x="${x}" y="282" width="28" height="234" fill="url(#glock)" stroke="#071A3A"/>
   ${[0, 1, 2, 3].map(v => `<rect x="${x + 7}" y="${294 + v * 6}" width="14" height="2" fill="#071A3A"/>`).join("")}${[0, 1, 2, 3].map(v => `<rect x="${x + 7}" y="${470 + v * 6}" width="14" height="2" fill="#071A3A"/>`).join("")}
   <rect x="${x + 21}" y="380" width="3" height="16" rx="1" fill="#8FA3C8"/>${mine ? `<rect x="${x + 4}" y="330" width="20" height="16" rx="2" fill="#E8EDF6"/><text x="${x + 14}" y="342" text-anchor="middle" class="lnum">${esc(num || "—")}</text>` : ""}` });
  s += `<rect x="139" y="282" width="28" height="234" fill="#FFE7B0" opacity="${CFG.card ? .12 : 0}" class="lglow"/></g>`;
  /* coach office door */
  s += `<g class="g-coach"><rect x="204" y="290" width="68" height="226" fill="url(#gwood)" stroke="#2A170C" stroke-width="2"/><rect x="214" y="302" width="48" height="56" fill="#FFD68A" opacity=".85" class="offwin"/>
   ${[0, 1, 2, 3, 4].map(v => `<rect x="214" y="${306 + v * 10}" width="48" height="3" fill="#7A5228" opacity=".7"/>`).join("")}<rect x="220" y="370" width="36" height="12" rx="2" fill="#E8EDF6"/><text x="238" y="379.5" text-anchor="middle" class="plate">COACH</text><circle cx="262" cy="430" r="3.5" fill="#D9B46A"/></g>`;
  /* TV */
  s += `<g class="g-tv"><rect x="292" y="112" width="88" height="56" rx="4" fill="#05070E" stroke="#2A3448" stroke-width="3"/><rect x="297" y="117" width="78" height="46" fill="#0B1E44"/>
   <text x="336" y="137" text-anchor="middle" class="tvbig">${td}/${n}</text><text x="336" y="152" text-anchor="middle" class="tvsm">LIFTED TODAY</text><svg x="297" y="156" width="78" height="7" overflow="hidden"><rect width="78" height="7" fill="#B30838"/><text x="3" y="5.5" class="tvtick">TEAM FEED · DAPS · SQUAD BATTLE · LEADERBOARDS · TEAM FEED · DAPS ·</text></svg><path d="M330 168 v10 M342 168 v10" stroke="#2A3448" stroke-width="3"/></g>`;
  /* doorway to the field */
  s += `<g class="g-door"><rect x="284" y="192" width="96" height="324" fill="#2A3448"/><rect x="290" y="198" width="84" height="318" fill="url(#gsky)"/>
   ${[[300, 214], [330, 230], [360, 208], [318, 250], [352, 262]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#fff" class="twk"/>`).join("")}
   <g class="flt"><rect x="352" y="268" width="3" height="120" fill="#1F2A44"/><rect x="340" y="256" width="28" height="14" rx="2" fill="#1F2A44"/>${[0, 1, 2, 3].map(c => `<circle cx="${344 + c * 7}" cy="263" r="2.4" fill="#FFF6D0"/>`).join("")}<circle cx="354" cy="263" r="30" fill="url(#gfield)"/></g>
   <path d="M290 430 L374 410 L374 516 L290 516Z" fill="#0E4A2A"/><path d="M332 470 l24 -10 l18 10 l-24 12z" fill="#7A4E2A" opacity=".6"/>
   <path d="M284 192 L262 186 L262 524 L284 516Z" fill="#3A4A66"/><path d="M380 192 L390 188 L390 522 L380 516Z" fill="#3A4A66"/><rect x="290" y="510" width="84" height="8" fill="#FFF6D0" opacity=".18" filter="url(#gsoft)"/></g>`;
  /* floor */
  s += `<rect y="525" width="390" height="319" fill="url(#gfloor)"/>`;
  for (let i = -6; i <= 6; i++) s += `<path d="M${195 + i * 22} 525 L${195 + i * 120} 844" stroke="#111A2E" stroke-width="1.5"/>`;
  [560, 610, 680, 770].forEach(y => s += `<path d="M0 ${y}H390" stroke="#111A2E" stroke-width="1.5"/>`);
  s += `<g transform="translate(195,780) scale(1,.34)" opacity=".35"><circle r="92" fill="none" stroke="#B30838" stroke-width="10"/><image href="img/cu.png" x="-80" y="-50" width="160" height="100"/></g>`;
  /* lamps + light */
  [[110, 0], [282, 1]].forEach(([x, k]) => { s += `<path d="M${x} 0 V58" stroke="#1F2A44" stroke-width="2"/><path d="M${x - 18} 72 L${x - 8} 56 H${x + 8} L${x + 18} 72Z" fill="#1A2236"/><ellipse cx="${x}" cy="73" rx="10" ry="3" fill="#FFF1C9" class="${k ? "flick" : ""}"/>
   <path d="M${x - 16} 74 L${x - 120} 844 L${x + 120} 844 L${x + 16} 74Z" fill="url(#gcone)" opacity=".26" class="${k ? "flick" : ""}"/>` });
  /* dumbbell rack + boombox (left front) */
  s += `<g class="g-db"><rect x="8" y="600" width="104" height="10" rx="3" fill="#1F2A44"/><rect x="8" y="640" width="104" height="10" rx="3" fill="#1F2A44"/><rect x="12" y="610" width="6" height="70" fill="#1F2A44"/><rect x="102" y="610" width="6" height="70" fill="#1F2A44"/>
   ${[0, 1, 2, 3].map(i => `<g transform="translate(${24 + i * 22},594)"><rect x="-6" y="-6" width="12" height="12" rx="3" fill="#2B3A5A"/><rect x="-2" y="-1" width="4" height="2" fill="#8FA3C8"/></g><g transform="translate(${24 + i * 22},634)"><rect x="-7" y="-7" width="14" height="14" rx="3" fill="#2B3A5A"/></g>`).join("")}</g>`;
  s += `<g class="g-boom"><rect x="18" y="716" width="76" height="40" rx="7" fill="#1A2236" stroke="#2F3D5C"/><path d="M30 716 q26 -16 52 0" stroke="#2F3D5C" stroke-width="3" fill="none"/><circle cx="36" cy="737" r="12" fill="#0A1020" stroke="#3B4A6C"/><circle cx="76" cy="737" r="12" fill="#0A1020" stroke="#3B4A6C"/>
   <circle cx="36" cy="737" r="5" fill="#26324F" class="${CFG.walk ? "thump" : ""}"/><circle cx="76" cy="737" r="5" fill="#26324F" class="${CFG.walk ? "thump" : ""}"/><rect x="52" y="726" width="8" height="4" rx="1" fill="${CFG.walk ? "#2FB873" : "#3B4A6C"}"/></g>`;
  /* bench + capsule (right front) */
  s += `<g class="g-bench"><rect x="276" y="716" width="104" height="14" rx="6" fill="#B30838"/><rect x="276" y="728" width="104" height="5" fill="#7E0628"/><rect x="290" y="733" width="8" height="34" fill="#1F2A44"/><rect x="358" y="733" width="8" height="34" fill="#1F2A44"/>
   ${caps ? `<g class="gcap" transform="translate(328,690)"><circle r="30" fill="url(#gfield)" opacity=".6"/><rect x="-11" y="-20" width="22" height="40" rx="11" fill="#8FD8FF" opacity=".85"/><rect x="-11" y="0" width="22" height="20" rx="5" fill="#E0A52E"/><rect x="-13" y="-2" width="26" height="5" rx="2" fill="#FFF0C0"/></g>` : ""}</g>`;
  /* squat rack (front, center) */
  s += `<g class="g-rack"><ellipse cx="195" cy="${done ? 770 : 768}" rx="120" ry="16" fill="#000" opacity=".5"/><rect x="116" y="452" width="12" height="318" fill="url(#gsteel)"/><rect x="262" y="452" width="12" height="318" fill="url(#gsteel)"/><rect x="110" y="446" width="170" height="12" rx="2" fill="url(#gsteel)"/>
   ${Array.from({ length: 14 }, (_, i) => `<circle cx="122" cy="${480 + i * 18}" r="1.6" fill="#0A1020"/><circle cx="268" cy="${480 + i * 18}" r="1.6" fill="#0A1020"/>`).join("")}<rect x="104" y="762" width="182" height="10" rx="3" fill="#1F2A44"/>
   <rect x="126" y="604" width="10" height="8" fill="#8FA3C8"/><rect x="254" y="604" width="10" height="8" fill="#8FA3C8"/>
   <g class="bar ${done ? "racked" : ""}"><rect x="40" y="596" width="310" height="6" rx="3" fill="#C9D2E2"/>
    ${[[52, 64, "#B30838"], [66, 72, "#B30838"], [80, 58, "#2F6FD0"], [322, 64, "#B30838"], [308, 72, "#B30838"], [296, 58, "#2F6FD0"]].map(([x, h, c]) => `<rect x="${x - 6}" y="${599 - h / 2}" width="12" height="${h}" rx="3" fill="${c}"/><rect x="${x - 6}" y="${599 - h / 2}" width="3" height="${h}" fill="#fff" opacity=".15"/>`).join("")}</g></g>`;
  /* haze + dust */
  s += `<g class="haze"><ellipse cx="120" cy="560" rx="200" ry="40" fill="#8FB8E6" opacity=".05" filter="url(#gblur)"/><ellipse cx="300" cy="640" rx="180" ry="36" fill="#8FB8E6" opacity=".04" filter="url(#gblur)"/></g>`;
  const r = rng(11); for (let i = 0; i < 26; i++) s += `<circle class="mote" style="--d:${(r() * 9).toFixed(1)}s;--x:${(r() * 40 - 20).toFixed(0)}px" cx="${(70 + r() * 260).toFixed(0)}" cy="${(120 + r() * 600).toFixed(0)}" r="${(.6 + r() * 1.2).toFixed(1)}" fill="#FFE7B0"/>`;
  return `<svg class="gymsvg" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">${s}</svg>` }

function gymSpots() { const T = findToday(), done = isDone(T.p, T.w, T.d), pc = Math.round((dayPct(T.p, T.w, T.d) || 0) * 100), caps = unopened().length, skip = skipMsg(T.p, T.w, T.d);
  const L = [
    { x: 49.5, y: 66, go: "start", l: skip ? "Rest day" : done ? "Done ✓" : pc ? "Keep going" : "Today's lift", s: skip ? "No lift today" : dayLabel(T.p, T.d) + (pc && !done ? " · " + pc + "%" : ""), big: 1 },
    { x: 49.5, y: 22.5, go: "today", l: "This week", s: "Plan, streak, XP" },
    { x: 85, y: 44, go: "season", l: "Road to the season", s: "Week " + PH[T.p].weeks[T.w].n + " of 35", up: 0 },
    { x: 86, y: 19.5, go: "team", l: "Team", s: "Feed & squad battle" },
    { x: 14.5, y: 39, go: "trophies", l: "Trophy case", s: PH.filter((_, p) => phaseWon(p)).length + " of 10 trophies" },
    { x: 38.5, y: 46, go: "me", l: "My locker", s: CFG.card ? "Card · settings" : "Profile · settings" },
    { x: 14.5, y: 82, go: "walk", l: "Walk-up song", s: CFG.walk ? "Change it" : "Pick yours" }];
  if (isCoach()) L.push({ x: 61, y: 39, go: "coach", l: "Coach's office", s: "Team numbers" });
  if (caps) L.push({ x: 84, y: 78, go: "cap", l: caps + " capsule" + (caps > 1 ? "s" : ""), s: "Tap to open", hot: 1 });
  return L }
function gymHTML() { const T = findToday(), Q = PH[T.p], st = streakInfo(), xp = xpInfo(), done = isDone(T.p, T.w, T.d), pc = Math.round((dayPct(T.p, T.w, T.d) || 0) * 100), skip = skipMsg(T.p, T.w, T.d);
  const intro = !GYM_INTRO; GYM_INTRO = true;
  const svg = gymSVG();
  return `<div class="gym"><div class="gymamb">${svg.replace("<svg class=\"gymsvg\"", "<svg class=\"gymsvg\" preserveAspectRatio=\"xMidYMid slice\"")}</div><div class="gymworld" id="gymworld">${svg}<div class="spots">${gymSpots().map(s => `<button class="spot ${s.big ? "big" : ""} ${s.hot ? "hot" : ""} ${s.dn ? "dn" : ""}" style="left:${s.x}%;top:${s.y}%" data-gym="${s.go}" aria-label="${esc(s.l)}"><span class="gdot"><i></i></span><span class="tape"><b>${esc(s.l)}</b><small>${esc(s.s)}</small></span></button>`).join("")}</div></div>
   <div class="gvig"></div><div class="ghud"><div class="gcrest"><img src="img/cu.png" alt="CU"><div><small>Cleary weight room</small><em>Wk ${Q.weeks[T.w].n} · ${esc(Q.short)}</em></div></div><div class="ghr"><span class="chip fl">${I.flame}<b>${st.cur}</b></span><span class="chip lv">${esc(xp.name)}</span></div></div>
   ${intro ? `<div class="gintro"><h1>The weight room's open.</h1><p>Tap anything to get around.</p></div>` : ""}</div>` }
function gymInit() { const w = $("#gymworld"); if (!w || RM) return; const g = $(".gym");
  const mv = (px, py) => { w.style.transform = `translate(calc(-50% + ${(px * -8).toFixed(1)}px), calc(-50% + ${(py * -5).toFixed(1)}px))` };
  g.onpointermove = e => mv(e.clientX / innerWidth - .5, e.clientY / innerHeight - .5);
  if (window.DeviceOrientationEvent && !gymInit.o) { gymInit.o = 1; addEventListener("deviceorientation", e => { if (view === "gym" && e.gamma != null) mv(clamp(e.gamma / 40, -.5, .5), clamp((e.beta - 45) / 60, -.5, .5)) }) } }
function gymGo(k, btn) { if (btn) { btn.classList.add("tap"); buzz(10) }
  setTimeout(() => { if (k === "start") { const T = findToday(); SEL = null; startWorkout(T.p, T.w, T.d) } else if (k === "walk") walkSetup(); else if (k === "cap") openCapsule(unopened()[0]); else go(k) }, 180) }

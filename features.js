/* ============ CU LIFTING · season timeline, levels, effort card, music, nutrition ============ */
"use strict";
CFG.card = true; /* the effort card is on for everyone */
const PCOL = ["#E0712B", "#F3A33A", "#3A78C2", "#6C7BF0", "#E8274F", "#B30838", "#2FB873", "#1FA0A0", "#9B7BFF", "#F3C34A"];
const SFILTERS = [["all", "Everything"], ["games", "Games"], ["lift", "Lifting"], ["team", "Team"]];
let SFILT = "all";

/* ---------- season timeline ---------- */
function oppBadge(name, sz) { const h = hashStr(name), cols = ["#B30838", "#1D4A9A", "#2FB873", "#E0712B", "#6C7BF0", "#1FA0A0", "#9B7BFF", "#C98A12"], c = cols[h % cols.length];
  const ini = name.replace(/\b(CC|U)\b/g, "").split(/\s+/).filter(Boolean).map(w => w[0]).join("").slice(0, 3).toUpperCase() || name.slice(0, 2).toUpperCase();
  return `<span class="opp" style="--c:${c};width:${sz || 40}px;height:${sz || 40}px"><b>${esc(ini)}</b></span>` }
function seasonItems() { const out = [];
  PH.forEach((Q, p) => { out.push({ dt: pd(Q.weeks[0].mon), k: "phase", p }); Q.weeks.forEach((W, w) => out.push({ dt: pd(W.mon), k: "week", p, w })) });
  (window.SCHED || []).forEach(e => out.push(Object.assign({}, e, { dt: pd(e.d), end: e.end ? pd(e.end) : null })));
  const order = { break: 0, milestone: 1, phase: 2, week: 3, event: 4, trip: 5, game: 6 };
  return out.sort((a, b) => a.dt - b.dt || order[a.k] - order[b.k]) }
function nextOf(f) { const t = today0(); return (window.SCHED || []).filter(e => pd(e.end || e.d) >= t && f(e)).sort((a, b) => a.d < b.d ? -1 : 1)[0] }
const daysTo = d => Math.round((pd(d) - today0()) / 864e5);
const inDays = n => n <= 0 ? "Today" : n === 1 ? "Tomorrow" : "in " + n + " days";
function seasonHTML() { const T = findToday(), t = today0(), items = seasonItems();
  const ng = nextOf(e => e.k === "game" || e.k === "trip"), np = nextOf(e => e.k === "milestone" && e.big && !e.tourney) || nextOf(e => e.k === "milestone"), nph = PH.findIndex((Q, p) => p > T.p);
  const start = pd("2026-08-24"), end = pd("2027-05-08"), span = end - start, pos = d => clamp((d - start) / span * 100, 0, 100);
  let h = topbar("Season", "Lifting + games, all in one place") + `<div class="body">`;
  /* coming up */
  h += `<div class="upnext">${ng ? `<div class="un game">${oppBadge(ng.opp, 46)}<div><small>Next game · ${inDays(daysTo(ng.d))}</small><b>${ng.ha === "away" ? "@ " : "vs "}${esc(ng.opp)}</b><span>${nice(pd(ng.d))}${ng.end ? "–" + pd(ng.end).getDate() : ""}${ng.time ? " · " + esc(ng.time) : ""}</span></div></div>` : ""}
   ${np ? `<div class="un ms"><i>⚾</i><div><small>${inDays(daysTo(np.d))}</small><b>${esc(np.t)}</b><span>${nice(pd(np.d))} · ${esc(np.s || "")}</span></div></div>` : ""}
   <div class="un ph" style="--c:${PCOL[T.p]}"><i>${PH[T.p].n}</i><div><small>Lifting now</small><b>${esc(PH[T.p].name)}</b><span>Week ${PH[T.p].weeks[T.w].n} of 35${nph > 0 ? " · next: " + esc(PH[nph].short) + " " + nice(pd(PH[nph].weeks[0].mon)) : ""}</span></div></div></div>`;
  /* season strip */
  h += `<div class="card strip2"><div class="sbar">${PH.map((Q, p) => { const a = pos(pd(Q.weeks[0].mon)), b = p < PH.length - 1 ? pos(pd(PH[p + 1].weeks[0].mon)) : pos(addD(pd(Q.weeks[Q.weeks.length - 1].mon), 7)); return `<i style="left:${a}%;width:${b - a}%;--c:${PCOL[p]}" title="${esc(Q.short)}"></i>` }).join("")}
    ${(window.SCHED || []).filter(e => e.k === "game" || e.k === "trip").map(e => `<em style="left:${pos(pd(e.d))}%" class="${pd(e.d) < t ? "past" : ""}"></em>`).join("")}
    <u style="left:${pos(t)}%"><span>Today</span></u></div>
   <div class="smon">${["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"].map(m => `<span>${m}</span>`).join("")}</div>
   <div class="skey"><span><i class="k1"></i>Lifting phases</span><span><i class="k2"></i>Games</span><span><i class="k3"></i>Today</span></div></div>`;
  h += `<div class="sfrow"><div class="seg sfilt">${SFILTERS.map(([k, l]) => `<button class="${SFILT === k ? "on" : ""}" data-sfilt="${k}">${l}</button>`).join("")}</div></div>`;
  /* timeline */
  const show = it => SFILT === "all" || (SFILT === "games" && (it.k === "game" || it.k === "trip" || it.tourney)) || (SFILT === "lift" && (it.k === "phase" || it.k === "week" || it.k === "break")) || (SFILT === "team" && (it.k === "event" || it.k === "milestone" || it.k === "break"));
  let mon = "", todayDone = false; h += `<div class="tl">`;
  items.filter(show).forEach(it => { const m = MON[it.dt.getMonth()] + " " + it.dt.getFullYear();
    if (!todayDone && it.dt > t) { todayDone = true; h += `<div class="tl-today" id="tltoday"><span>Today · ${DOW[t.getDay()].slice(0, 3)} ${nice(t)}</span></div>` }
    if (m !== mon) { mon = m; h += `<div class="tl-m">${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][it.dt.getMonth()]} <small>${it.dt.getFullYear()}</small></div>` }
    const past = (it.end || it.dt) < t, dd = `<div class="tl-d"><small>${DOW[it.dt.getDay()].slice(0, 3)}</small><b>${it.dt.getDate()}</b></div>`;
    if (it.k === "phase") { const Q = PH[it.p]; h += `<button class="tl-i phase ${past ? "past" : ""}" style="--c:${PCOL[it.p]}" data-mph="${it.p}">${dd}<div class="tl-c"><small>Phase ${Q.n} begins</small><b>${esc(Q.name)}</b><span>${esc((Q.purpose || "").split(/[.!]/)[0])}</span></div>${phaseWon(it.p) ? `<em class="won">🏆</em>` : ""}</button>` }
    else if (it.k === "week") { const s = weekState(it.p, it.w), cur = it.p === T.p && it.w === T.w, full = s.full && s.real > 0;
      h += `<button class="tl-i week ${past && !cur ? "past" : ""} ${cur ? "cur" : ""}" style="--c:${PCOL[it.p]}" data-wk="${it.p}.${it.w}">${dd}<div class="tl-c"><b>Lifting week ${PH[it.p].weeks[it.w].n}</b><span>${esc(PH[it.p].short)} · ${s.done}/${s.tot} workouts${cur ? " · this week" : ""}</span></div><div class="wkdots">${PH[it.p].days.filter(D => !skipMsg(it.p, it.w, D.k)).map(D => `<i class="${isDone(it.p, it.w, D.k) ? "on" : isExc(it.p, it.w, D.k) ? "ex" : ""}"></i>`).join("")}</div>${full ? `<em class="won">✓</em>` : ""}</button>` }
    else if (it.k === "game" || it.k === "trip") { const away = it.ha === "away";
      h += `<div class="tl-i game ${past ? "past" : ""} ${it.fall ? "fall" : ""}">${dd}${oppBadge(it.opp, 38)}<div class="tl-c"><b>${away ? "@ " : "vs "}${esc(it.opp)}</b><span>${it.fall ? "Fall game" : it.k === "trip" ? "Road trip" : "Spring game"}${it.n ? " · " + it.n + "-game series" : ""}${it.end ? " · thru " + nice(it.end) : ""}${it.time ? " · " + esc(it.time) : ""}</span></div><em class="ha ${away ? "a" : "h"}">${away ? "AWAY" : "HOME"}</em></div>` }
    else if (it.k === "break") h += `<div class="tl-i brk ${past ? "past" : ""}">${dd}<div class="tl-c"><b>${esc(it.t)}</b><span>${nice(it.dt)} – ${nice(it.end)} · ${esc(it.s)}</span></div></div>`;
    else h += `<div class="tl-i ${it.k} ${it.big ? "big" : ""} ${past ? "past" : ""}">${dd}<i class="tl-ic">${it.k === "milestone" ? (it.tourney ? "🏆" : "★") : "◆"}</i><div class="tl-c"><b>${esc(it.t)}</b><span>${esc(it.s || "")}</span></div></div>` });
  if (!todayDone) h += `<div class="tl-today" id="tltoday"><span>Today</span></div>`;
  return h + `</div><p class="fine">Games and team dates come from the Cleary Baseball 2026-27 calendar.</p></div><button class="gotoday" data-gotoday>${I.bolt}<span>Go to today</span></button>` }
function seasonInit() { scrollTo(0, 0) }
function goToday() { const e = $("#tltoday"); if (e) { const y = e.getBoundingClientRect().top + scrollY - 170; window.scrollTo({ top: Math.max(0, y), behavior: RM ? "auto" : "smooth" }) } }

/* ---------- levels ladder ---------- */
const TIERC = ["#9C6B3E", "#9DB0CC", "#F3C34A", "#5AD1E6", "#B48CFF", "#E8274F"];
const HOWXP = [["Finish a workout", "+60"], ["Finish every workout in a week", "+120"], ["Each set you log", "+5"], ["Check off your warm-up", "+10"], ["Every day of your best streak", "+15"], ["Set a PR", "+30"], ["Watch a demo video", "+5"]];
/* what a perfect season looks like, week by week: every workout, every set, every warm-up */
function xpPlan() { return memo("xpplan", () => { let cum = 0, ses = 0; const out = [];
  allWeeks().forEach(x => { const Q = PH[x.p]; let n = 0;
    Q.days.forEach(D => { if (skipMsg(x.p, x.w, D.k)) return; n++; ses++; let sets = 0;
      (Q.prog[D.k] || []).forEach(b => b.ex.forEach(e => { if (e.or) return; const W = Wk(e, x.w); if (W) sets += need(W) }));
      cum += 60 + 15 + sets * 5 + ((Q.warm[D.k] || []).length ? 10 : 0) });
    if (n) cum += 120; out.push({ p: x.p, w: x.w, n: x.n, mon: x.mon, cum, ses }) });
  return out }) }
function levelPace(need) { const P = xpPlan(), tot = P[P.length - 1]; if (!need) return null; const i = P.findIndex(q => q.cum >= need); if (i < 0) return { pct: 100, wk: tot, beyond: 1 };
  return { pct: Math.max(1, Math.round((i + 1) / P.length * 100)), wk: P[i] } }
function levelsSheet() { const x = xpInfo();
  sheet("Levels", `<div class="lvtop"><div class="lvbadge" style="--c:${TIERC[x.li]}">${x.li + 1}</div><div><small>You're a</small><b>${esc(x.name)}</b><span>${fmt(x.xp)} XP${x.next ? " · " + fmt(x.next - x.xp) + " to " + esc(x.nextName) : " · top level"}</span></div></div>
   <p class="fine lvhow">Under each level: how many workouts it takes if you finish <b>every</b> set and warm-up. PRs, demo videos and long streaks get you there faster.</p><div class="ladder">${LEVELS.slice().reverse().map(([n, need], ri) => { const i = LEVELS.length - 1 - ri, got = x.xp >= need, cur = i === x.li, nx = LEVELS[i + 1];
     const pct = cur && nx ? Math.round((x.xp - need) / (nx[1] - need) * 100) : got ? 100 : 0;
     return `<div class="rung ${got ? "got" : ""} ${cur ? "cur" : ""}" style="--c:${TIERC[i]}"><div class="rb">${got ? "★" : i + 1}</div><div class="rt"><b>${esc(n)}</b><small>${need ? fmt(need) + " XP" : "Start here"}${cur ? " · you are here" : ""}</small>${(() => { const L = levelPace(need); return L ? `<span class="pace2">${L.beyond ? "Takes every workout plus PRs" : `${L.wk.ses} workouts · reachable by ${nice(L.wk.mon)}`}</span>` : "" })()}${cur && nx ? `<div class="xpbar"><i style="width:${pct}%"></i></div>` : ""}</div>${got && !cur ? `<em>✓</em>` : ""}</div>` }).join("")}</div>
   <h4 class="kg">How to earn XP</h4><div class="howxp">${HOWXP.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join("")}</div>
   <p class="fine">Showing up is worth the most. Finishing workouts beats lifting heavy.</p>`, "tall") }

/* ---------- effort card labels + teammates ---------- */
const RORD = [["GRIND", "CON", "Consistency"], ["STR", "IMP", "Improvement"], ["PWR", "PWR", "Power work"], ["ENGINE", "CND", "Conditioning"], ["MOBILITY", "WRM", "Warm-ups"]];
function teamCard(id) { const r = teamRows().find(x => x.id === id); if (!r) return; if (r.me) { go("me"); return }
  const R0 = rng(hashStr(r.name)), R = { GRIND: clamp(Math.round(50 + 49 * r.comp), 50, 99), STR: clamp(Math.round(55 + r.gain * 1.1), 50, 99), PWR: clamp(Math.round(50 + 49 * r.comp * (.85 + R0() * .15)), 50, 99), ENGINE: clamp(Math.round(50 + 49 * r.comp * (.8 + R0() * .2)), 50, 99), MOBILITY: clamp(Math.round(50 + 49 * r.comp * (.75 + R0() * .25)), 50, 99) };
  const ovr = Math.round(Object.values(R).reduce((a, v) => a + v, 0) / 5), rar = ovr >= 90 ? ["Cougar Legend", "leg"] : ovr >= 80 ? ["Foil", "foil"] : ovr >= 70 ? ["Rare", "rare"] : ["Base", "base"];
  const d = { R, ovr, rar, name: r.name, sub: `${r.pos === "Pitcher" ? "Pitcher" : "Position"} · ${r.cls}`, ed: PH[findToday().p].short + " Edition", photo: "" };
  sheet(esc(r.name), `<div class="cprev">${cardHTML(d)}</div><div class="effnote">${I.flame}<span>Effort card · built from showing up, finishing the work and beating <b>their own</b> numbers. Total weight lifted never counts.</span></div><p class="fine sample">Sample teammate until accounts are connected.</p>`) }

/* ---------- music ---------- */
const svcOf = u => /spotify/i.test(u) ? ["Spotify", "#1DB954"] : /apple|music\.apple/i.test(u) ? ["Apple Music", "#FA2D48"] : /youtu/i.test(u) ? ["YouTube Music", "#FF0033"] : /soundcloud/i.test(u) ? ["SoundCloud", "#FF7700"] : /amazon/i.test(u) ? ["Amazon Music", "#25D1DA"] : ["Playlist", "#8FB8E6"];
function musicSheet() { const W = CFG.walk, P = CFG.playlist; const playing = WALK && !WALK.paused;
  const o = sheet("Music", `<div class="mtile walk"><div class="mic">${I.music}</div><div class="mt"><small>Walk-up song</small><b>${W ? (W.kind === "file" ? esc(W.name.replace(/\.[a-z0-9]+$/i, "")) : "Song link") : "Not set yet"}</b><span>${W ? (W.kind === "file" ? "Starts at " + Math.floor((W.start || 0) / 60) + ":" + String(Math.floor((W.start || 0) % 60)).padStart(2, "0") + " · plays " + (W.len || 25) + "s" : "Opens in its app") : "For your top sets and PR attempts"}</span></div></div>
   <div class="btn2">${W ? `<button class="pill gold" id="mwplay">${playing ? "■ Stop" : I.play + " Play it"}</button><button class="pill" id="mwedit">Edit</button>` : `<button class="pill gold" id="mwedit" style="grid-column:1/-1">Add your walk-up song</button>`}</div>
   <div class="mtile pl" style="--c:${P ? svcOf(P.url)[1] : "#8FB8E6"}"><div class="mic">🎧</div><div class="mt"><small>Workout playlist</small><b>${P ? esc(P.name || svcOf(P.url)[0]) : "Not set yet"}</b><span>${P ? svcOf(P.url)[0] + " · opens in that app" : "Spotify, Apple Music, YouTube Music, SoundCloud…"}</span></div></div>
   ${P ? `<div class="btn2"><a class="pill gold" href="${esc(P.url)}" target="_blank" rel="noopener" id="mpopen">Open playlist</a><button class="pill" id="mpedit">Change</button></div>` : ""}
   <div id="mpform" ${P ? "hidden" : ""}><input class="linkin" id="mpurl" placeholder="Paste your playlist link" value="${esc(P ? P.url : "")}"><input class="linkin" id="mpname" placeholder="Name it (optional) — e.g. Lift Day" value="${esc(P ? P.name || "" : "")}" style="margin-top:8px"><button class="pill gold wide" id="mpsave">Save playlist</button>${P ? `<button class="linkb sm danger" id="mpdel">Remove playlist</button>` : ""}</div>
   <p class="fine">Tip: start your playlist before you open the workout, then come back here to log sets. Your walk-up song fades in over it.</p>`, "music");
  const q = s => o.querySelector(s);
  if (q("#mwplay")) q("#mwplay").onclick = () => { playWalkup(); setTimeout(() => { const p = WALK && !WALK.paused; q("#mwplay").innerHTML = p ? "■ Stop" : I.play + " Play it" }, 300) };
  if (q("#mwedit")) q("#mwedit").onclick = () => { closeOv(o); setTimeout(walkSetup, 250) };
  if (q("#mpedit")) q("#mpedit").onclick = () => { q("#mpform").hidden = false; q("#mpurl").focus() };
  q("#mpsave").onclick = () => { const u = q("#mpurl").value.trim(); if (!/^https?:\/\//i.test(u)) { toast("Paste the full link (starts with https://)"); return } CFG.playlist = { url: u, name: q("#mpname").value.trim() }; saveNow(); closeOv(o); toast("Playlist saved"); render(); setTimeout(musicSheet, 300) };
  if (q("#mpdel")) q("#mpdel").onclick = () => { CFG.playlist = null; saveNow(); closeOv(o); render() } }

/* ---------- nutrition (same log format as the original app: LOG["nut-YYYY-MM"] = {t:{sw,gw}, d:{day:{c,f,p,w}}}) ---------- */
const NMON = (() => { const out = []; for (let y = 2026, m = 7; y < 2027 || m <= 4; m++) { if (m > 11) { m = 0; y++ } out.push({ y, m }) } return out })();
let NMI = null;
const nkey = x => "nut-" + x.y + "-" + String(x.m + 1).padStart(2, "0");
function nrec(x) { const k = nkey(x), r = LOG[k] = LOG[k] || {}; r.t = r.t || {}; r.d = r.d || {}; return r }
const ncal = v => (+v.p || 0) * 4 + (+v.f || 0) * 9 + (+v.c || 0) * 4;
const MFULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function nutWeighIns() { const out = []; Object.keys(LOG).filter(k => /^nut-\d{4}-\d{2}$/.test(k)).sort().forEach(k => { const d = LOG[k].d || {}; Object.keys(d).map(Number).sort((a, b) => a - b).forEach(x => { if (+d[x].w) out.push({ d: k.slice(4) + "-" + String(x).padStart(2, "0"), w: +d[x].w }) }) }); return out }
function nutritionHTML() { const t = new Date(); if (NMI == null) { NMI = NMON.findIndex(x => x.y === t.getFullYear() && x.m === t.getMonth()); if (NMI < 0) NMI = 0 }
  const M = NMON[NMI], r = nrec(M), days = new Date(M.y, M.m + 1, 0).getDate(), isCur = M.y === t.getFullYear() && M.m === t.getMonth(), td = isCur ? t.getDate() : null;
  const logged = Object.entries(r.d).filter(([, v]) => v.c || v.f || v.p), n = logged.length, avg = f => n ? Math.round(logged.reduce((a, [, v]) => a + (+v[f] || 0), 0) / n) : 0;
  const avgCal = n ? Math.round(logged.reduce((a, [, v]) => a + ncal(v), 0) / n) : 0, wi = nutWeighIns(), last = wi[wi.length - 1];
  let h = topbar("Nutrition", "Fuel the work") + `<div class="body"><div class="nbar"><button class="linkb back" data-nav="today">‹ Back to Today</button><button class="linkb back" data-nuthow>How it works ?</button></div>`;
  if (td) { const v = r.d[td] || {}, isWi = (td - 1) % 5 === 0, cal = ncal(v);
    h += `<div class="card ntoday"><div class="nth"><div><small>${DOW[t.getDay()]}</small><b>Today · ${nice(t)}</b></div>${isWi ? `<span class="wibadge">⚖️ Weigh-in day</span>` : ""}</div>
     <div class="ncal2"><b id="ncalt">${fmt(cal)}</b><small>calories</small></div>
     <div class="nin">${[["c", "Carbs", "#5AA9FF"], ["f", "Fat", "#F3C34A"], ["p", "Protein", "#E8274F"]].map(([f, l, c]) => `<label style="--c:${c}"><span>${l}</span><input inputmode="decimal" data-nd="${td}" data-nf="${f}" value="${esc(v[f] || "")}" placeholder="0"><em>g</em></label>`).join("")}
      <label class="w" style="--c:#2FB873"><span>Weight</span><input inputmode="decimal" data-nd="${td}" data-nf="w" value="${esc(v.w || "")}" placeholder="${isWi ? "lb" : "—"}"><em>lb</em></label></div>
     <p class="fine">Calories fill in for you: protein × 4 + fat × 9 + carbs × 4.${isWi ? " Weigh in when you wake up, after the bathroom, before breakfast." : ""}</p></div>` }
  h += `<div class="mrow2">${NMON.map((x, i) => `<button class="${i === NMI ? "on" : ""}" data-nmi="${i}">${MON[x.m]}<small>${String(x.y).slice(2)}</small></button>`).join("")}</div>`;
  h += nsumHTML(M, r);
  h += `<div class="sec-h"><h2>Daily log</h2><small>grams</small></div><div class="card nlog"><div class="nlh"><span>Day</span><span>Carbs</span><span>Fat</span><span>Protein</span><span>Weight</span><span>Cals</span></div>
   ${Array.from({ length: days }, (_, i) => { const dd = i + 1, v = r.d[dd] || {}, isWi = i % 5 === 0, cal = ncal(v); return `<div class="nlr ${isWi ? "wi" : ""} ${dd === td ? "td" : ""}"><span>${M.m + 1}/${dd}${isWi ? "<i>⚖️</i>" : ""}</span>${["c", "f", "p", "w"].map(f => `<input inputmode="decimal" data-nd="${dd}" data-nf="${f}" value="${esc(v[f] || "")}">`).join("")}<span class="nc" id="nc${dd}">${cal ? fmt(cal) : ""}</span></div>` }).join("")}</div>
   <div class="card nhow"><b>How to track</b><p>Log your carbs, fat and protein (grams) each day — calories add up on their own. A free app like <b>MyFitnessPal</b> makes it easy.</p><p>Weigh in every fifth day (marked ⚖️): first thing in the morning, after the bathroom, before breakfast.</p><p class="fine">Your weigh-ins are private — only coaches see them.</p></div></div>`;
  return h }
function nsumHTML(M, r) { const logged = Object.entries(r.d).filter(([, v]) => v.c || v.f || v.p), n = logged.length, avg = f => n ? Math.round(logged.reduce((a, [, v]) => a + (+v[f] || 0), 0) / n) : 0;
  const avgCal = n ? Math.round(logged.reduce((a, [, v]) => a + ncal(v), 0) / n) : 0, wi = nutWeighIns(), last = wi[wi.length - 1]; let h = "";
  h += `<div class="card nsum"><div class="nsh"><b>${MFULL[M.m]} ${M.y}</b><small>${n} day${n === 1 ? "" : "s"} logged</small></div>
   <div class="nstat"><div><b>${avgCal ? fmt(avgCal) : "—"}</b><small>avg calories</small></div><div><b>${avg("p") || "—"}<i>g</i></b><small>protein</small></div><div><b>${avg("c") || "—"}<i>g</i></b><small>carbs</small></div><div><b>${avg("f") || "—"}<i>g</i></b><small>fat</small></div></div>
   <div class="ngoal"><label>Starting weight<input inputmode="decimal" data-nt="sw" value="${esc(r.t.sw || "")}" placeholder="lb"></label><label>Goal weight<input inputmode="decimal" data-nt="gw" value="${esc(r.t.gw || "")}" placeholder="lb"></label><div><small>Latest</small><b>${last ? last.w + " lb" : "—"}</b></div></div>
   ${wi.length > 1 ? (() => { const v = wi.slice(-12).map(x => x.w), mx = Math.max(...v), mn = Math.min(...v); return `<svg class="nspark" viewBox="0 0 100 30" preserveAspectRatio="none" fill="none"><polyline points="${v.map((x, i) => `${(i / (v.length - 1) * 100).toFixed(1)},${(26 - (x - mn) / Math.max(1, mx - mn) * 22).toFixed(1)}`).join(" ")}"/></svg><p class="fine">Weigh-in trend · last ${v.length}</p>` })() : ""}</div>`;
  return h }
function nutInput(t) { const D = t.dataset; const M = NMON[NMI]; const r = nrec(M);
  if (D.nt) { r.t[D.nt] = t.value; save(); return }
  const d = r.d[D.nd] = r.d[D.nd] || {}; d[D.nf] = t.value.replace(/[^\d.]/g, ""); save();
  const c = ncal(d), a = $("#nc" + D.nd); if (a) a.textContent = c ? fmt(c) : ""; const b = $("#ncalt"); if (b && +D.nd === new Date().getDate()) b.textContent = fmt(c);
  $$(`[data-nd="${D.nd}"][data-nf="${D.nf}"]`).forEach(x => { if (x !== t) x.value = t.value });
  const ns = $(".nsum"); if (ns) { const tmp = document.createElement("div"); tmp.innerHTML = nsumHTML(M, r); ns.querySelector(".nstat").replaceWith(tmp.querySelector(".nstat")); ns.querySelector(".nsh small").textContent = tmp.querySelector(".nsh small").textContent; const lb = ns.querySelector(".ngoal div b"); if (lb) lb.textContent = tmp.querySelector(".ngoal div b").textContent } }
/* levels scaled to the real season: a player who finishes everything reaches Cougar Legend near the end, not by November */
(function () { const P = xpPlan(), tot = P[P.length - 1].cum, at = [0, .05, .15, .33, .55, .8];
  at.forEach((f, i) => { LEVELS[i][1] = Math.round(tot * f / 100) * 100 }); MEMO = {} })();

/* ---------- nutrition quick tutorial ---------- */
function nutTutorial() { CFG.nutSeen = 1; saveNow(); const steps = [
  ["🍳", "Eat, then log it", "Track what you eat in a free app like MyFitnessPal (or read the labels). At the end of the day, copy your carbs, fat and protein grams into the boxes at the top."],
  ["🔥", "Calories do themselves", "You never type calories. Protein × 4 + fat × 9 + carbs × 4 adds up for you."],
  ["⚖️", "Weigh in every 5th day", "Days with the scale (the 1st, 6th, 11th…) are weigh-in days. Step on first thing in the morning, after the bathroom, before you eat. Type it in the Weight box."],
  ["🎯", "Set your month", "Put your starting weight and goal weight for the month. Averages and your weigh-in trend fill in as you log."],
  ["🔒", "It's private", "Only you and the coaches see your nutrition and weigh-ins. Missed a day? Scroll to the daily log and fill it in."]];
  let i = 0; const o = sheet("Nutrition · how it works", `<div id="nt"></div>`, "nutt");
  const draw = () => { const [ic, t, b] = steps[i]; o.querySelector("#nt").innerHTML = `<div class="ntstep"><div class="ntic">${ic}</div><small>Step ${i + 1} of ${steps.length}</small><b>${t}</b><p>${b}</p></div>
    <div class="ntdots">${steps.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("")}</div>
    <div class="btn2">${i ? `<button class="pill" id="ntb">Back</button>` : `<button class="pill" data-close>Skip</button>`}<button class="pill gold" id="ntn">${i === steps.length - 1 ? "Start logging" : "Next"}</button></div>`;
    const bk = o.querySelector("#ntb"); if (bk) bk.onclick = () => { i--; draw() };
    o.querySelector("#ntn").onclick = () => { if (i === steps.length - 1) { closeOv(o); const x = $(".nin input"); if (x) x.focus() } else { i++; draw() } } };
  draw() }
/* ---------- back to top (any long screen) ---------- */
addEventListener("scroll", () => { let b = $("#totop"); const show = scrollY > 700 && !document.body.classList.contains("woopen") && !$(".ov");
  if (!b) { b = document.createElement("button"); b.id = "totop"; b.dataset.totop = ""; b.setAttribute("aria-label", "Back to top"); b.innerHTML = "↑"; document.body.appendChild(b) }
  b.classList.toggle("on", show); document.body.classList.toggle("scrolled", show) }, { passive: true });

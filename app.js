/* ============ CU LIFTING · screens ============ */
"use strict";
let view = "today", SEL = null, WO = null, BOARD = "streak", RT = null;
const I = {
  bolt: '<svg class="ico" viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>', map: '<svg class="ico" viewBox="0 0 24 24"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></svg>',
  team: '<svg class="ico" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.6"/><path d="M3 19c.8-3.4 3.2-5 6-5s5.2 1.6 6 5M14.5 14.6c2.8-.4 5.4 1 6.3 4.4"/></svg>',
  cup: '<svg class="ico" viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8"/></svg>',
  me: '<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.4 4.2-6.5 8-6.5s7 2.1 8 6.5"/></svg>',
  play: '<svg class="ico" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill="currentColor" stroke="none"/></svg>', music: '<svg class="ico" viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  snd: '<svg class="ico" viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>', mute: '<svg class="ico" viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
  clip: '<svg class="ico" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8.5 12h7M8.5 16h5"/></svg>',
  x: '<svg class="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>', list: '<svg class="ico" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  fwd: '<svg class="ico" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>', back: '<svg class="ico" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>', check: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  flame: '<svg class="ico" viewBox="0 0 24 24"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 1.5-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="currentColor" stroke="none"/></svg>', lock: '<svg class="ico" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>' };
const curT = () => SEL || findToday();

/* ===================== shell ===================== */
function render() { MEMO = {}; const m = $("#main"); if (!CFG.me && !isCoach()) { m.innerHTML = welcomeHTML(); $("#nav").hidden = true; return }
  const pv = isCoach() && CFG.pview; document.body.classList.toggle("pview", !!pv);
  if (!CFG.me && ["today", "trophies"].includes(view)) view = "coach";
  if (pv && view === "coach") view = "today";
  const tabs = isCoach() && !pv ? [["coach", "Coach", I.clip]].concat(CFG.me ? [["today", "Today", I.bolt]] : [], [["season", "Season", I.map], ["team", "Team", I.team], ["me", "Me", I.me]])
    : [["today", "Today", I.bolt], ["season", "Season", I.map], ["team", "Team", I.team], ["trophies", "Trophies", I.cup], ["me", "Me", I.me]];
  $("#nav").hidden = false; $("#nav").innerHTML = tabs.map(([k, l, ic]) =>
    `<button class="${view === k ? "on" : ""}" data-nav="${k}">${ic}<span>${l}</span>${k === "trophies" && unopened().length ? `<i class="dot">${unopened().length}</i>` : ""}</button>`).join("");
  $("#nav").style.gridTemplateColumns = `repeat(${tabs.length},1fr)`;
  m.innerHTML = ({ today: todayHTML, season: seasonHTML, team: teamHTML, trophies: trophiesHTML, me: meHTML, coach: coachHTML }[view] || todayHTML)();
  if (pv) m.innerHTML = `<div class="pvbar"><span>${I.me} Player view</span><button data-pvoff>Back to coach</button></div>` + m.innerHTML;
  m.className = "v-" + view; if (view === "season") requestAnimationFrame(mapInit); if (view === "coach") coachLoad(); bindCards() }
function go(v) { view = v; render(); scrollTo(0, 0) }

/* ===================== welcome / profile ===================== */
function welcomeHTML() { return `<div class="welcome"><div class="wscene">${sceneSVG("stadium")}</div><img class="wlogo" src="img/badge.png" alt="Cleary Cougars">
  <div class="wkick">Cleary Baseball · 2026-27</div><h1>Built in<br>the dark.</h1><p class="wp">Your lifts, your streak, your season — all in one place.</p>
  <form class="wform" data-profile><div class="frow"><label>First name<input name="fn" required autocomplete="given-name"></label><label>Last name<input name="ln" required autocomplete="family-name"></label></div>
  <div class="frow"><label>Jersey #<input name="num" inputmode="numeric" maxlength="2"></label><label>Class<select name="cls"><option>Fr</option><option>So</option><option>Jr</option><option>Sr</option><option>Grad</option></select></label></div>
  <div class="seg" data-seg="pos"><button type="button" class="on" data-v="Position">Position player</button><button type="button" data-v="Pitcher">Pitcher</button></div><input type="hidden" name="pos" value="Position">
  <button class="skew big">Let's lift</button></form><button class="linkb ctr" data-clogin>Coach? Sign in here →</button></div>` }
function saveProfile(f) { const d = Object.fromEntries(new FormData(f)); CFG.me = { fn: d.fn.trim(), ln: d.ln.trim(), num: d.num.trim(), cls: d.cls, pos: d.pos, u: nrm(d.fn + d.ln) }; saveNow();
  const o = overlay(`<div class="hello"><small>Welcome</small><b>${esc(CFG.me.fn)}<br>${esc(CFG.me.ln)}</b><span>#${esc(CFG.me.num || "—")} · ${esc(CFG.me.pos === "Pitcher" ? "Pitcher" : "Position player")}</span></div>`, "center hellov"); setTimeout(() => { closeOv(o); render() }, 1700) }

/* ===================== scenes (hero art reused from the map) ===================== */
function zoneOf(p) { return ZONES.find(z => z.ps.includes(p)) || ZONES[0] }
function sceneSVG(kind, p) { const z = ZONES.find(q => q.kind === kind) || ZONES[0], f = { fall: decoFall, winter: decoWinter, storm: decoStorm, stadium: decoStadium }[z.kind];
  let s = ""; const r = rng(3); for (let i = 0; i < 40; i++) s += `<circle class="star" style="--d:${(r() * 4).toFixed(1)}s" cx="${(r() * 400).toFixed(0)}" cy="${(r() * 300).toFixed(0)}" r="${(.4 + r() * 1.1).toFixed(1)}" fill="#fff"/>`;
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="hs${kind}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${z.sky[0]}"/><stop offset=".6" stop-color="${z.sky[1]}"/><stop offset="1" stop-color="${z.sky[2]}"/></linearGradient>
   <linearGradient id="aur" x1="0" x2="1"><stop offset="0" stop-color="#2FE0A0"/><stop offset=".5" stop-color="#5AA9FF"/><stop offset="1" stop-color="#B48CFF"/></linearGradient><linearGradient id="beam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFF6D0" stop-opacity=".9"/><stop offset="1" stop-color="#FFF6D0" stop-opacity="0"/></linearGradient></defs>
   <rect width="400" height="300" fill="url(#hs${kind})"/>${s}<g class="zone ${z.kind}">${f(-60, 330, 5, mapLayout(), 999).replace(/<text[^>]*>[^<]*<\/text>/g, "").replace(/<g class="sbd"[\s\S]*?<\/g>/, "")}</g></svg>` }

/* ===================== TODAY ===================== */
function todayHTML() { const T = curT(), Q = PH[T.p], pct = dayPct(T.p, T.w, T.d), done = isDone(T.p, T.w, T.d), exc = CFG.exc[K(T.p, T.w, T.d)], dt = dayDate(T.p, T.w, T.d);
  const st = streakInfo(), xp = xpInfo(), caps = unopened(), skip = skipMsg(T.p, T.w, T.d), started = pct > 0 && !done, lab = dayLabel(T.p, T.d);
  const btn = skip ? "" : done ? `<button class="skew white" data-start>✓ Done · view</button>` : exc ? `<button class="skew ghostb" data-unexc>Excused · ${esc(exc.why)} · undo</button>` : `<button class="skew white" data-start>${started ? "Keep going" : "Start workout"}</button>`;
  const ring = `<div class="ring" style="--p:${Math.round((pct || 0) * 100)}"><b>${Math.round((pct || 0) * 100)}%</b><small>done</small></div>`;
  let h = `<section class="hero"><div class="hscene">${sceneSVG(zoneOf(T.p).kind)}</div><div class="hshade"></div><div class="hin">
   <div class="trow"><img class="hlogo" src="img/cu.png" alt="CU"><div class="hchips"><span class="chip fl" title="Lift-day streak">${I.flame}<b>${st.cur}</b></span><span class="chip lv">${esc(xp.name)}</span></div></div>
   <div class="kick">Week ${Q.weeks[T.w].n} · Phase ${Q.n} · ${esc(Q.short)}</div><h1 class="${lab.length > 7 ? "long" : ""}">${esc(lab)}</h1>
   <div class="hsub">${dt ? (/^day/i.test(lab) ? DOW[dt.getDay()] + ", " : "") + nice(dt) : "This week · any day you choose"}${T.pre ? " · season hasn't started" : ""}</div>
   <div class="hgo">${btn}${skip ? "" : ring}</div></div></section><div class="body">`;
  h += weekChips(T);
  if (skip) h += `<div class="note warn"><b>No workout here</b>${esc(skip)}</div>`;
  if (Q.callout && T.w === 0) h += `<div class="note"><b>Coach note</b>${esc(Q.callout)}</div>`;
  if (!skip && !done && !exc) h += `<button class="linkb" data-excuse>Can't lift today? Game, travel, sick or hurt →</button>`;
  const xpPct = xp.next ? (xp.xp - xp.base) / (xp.next - xp.base) : 1;
  h += `<div class="tiles"><div class="tile flame"><span>${I.flame}</span><b>${st.cur}</b><small>lift-day streak · best ${st.best}</small></div>
    <div class="tile"><b class="sm">${esc(xp.name)}</b><div class="xpbar"><i style="width:${Math.round(xpPct * 100)}%"></i></div><small>${fmt(xp.xp)} XP${xp.next ? " · " + fmt(xp.next - xp.xp) + " to " + esc(xp.nextName) : ""}</small></div></div>`;
  if (caps.length) h += `<button class="capcall" data-opencap="${caps[0]}"><div class="mcap"></div><div><b>${caps.length} capsule${caps.length > 1 ? "s" : ""} ready</b><small>You finished a full week. Tap to open.</small></div>${I.fwd}</button>`;
  h += pulseCard(true);
  h += `<div class="card why"><b>Phase ${Q.n} · ${esc(Q.name)}</b><p>${esc(Q.purpose)}</p></div>`;
  h += installCard();
  h += `<div class="sec-h"><h2>Team feed</h2><button class="linkb sm" data-nav="team">All →</button></div>` + feedHTML(3);
  return h + `</div>` }
function weekChips(T) { const Q = PH[T.p]; return `<div class="wchips">${Q.days.map(D => { const sk = skipMsg(T.p, T.w, D.k), dn = isDone(T.p, T.w, D.k), ex = isExc(T.p, T.w, D.k), dt = dayDate(T.p, T.w, D.k), pc = dayPct(T.p, T.w, D.k);
  return `<button class="wchip ${D.k === T.d ? "on" : ""} ${dn ? "dn" : ""} ${ex ? "ex" : ""} ${sk ? "sk" : ""}" data-sel="${T.p}.${T.w}.${D.k}"><b>${esc(D.s)}</b><small>${sk ? "off" : dn ? "✓ done" : ex ? "excused" : pc ? Math.round(pc * 100) + "%" : dt ? (dt.getMonth() + 1) + "/" + dt.getDate() : "—"}</small></button>` }).join("")}</div>` }
function pulseCard(mini) { const rows = teamRows(), n = rows.length, td = rows.filter(r => r.todayDone).length, T = findToday(), need = PH[T.p].days.length;
  const sq = ["Pitcher", "Position"].map(pos => { const g = rows.filter(r => r.pos === pos); return { pos, pct: g.length ? g.reduce((a, r) => a + Math.min(1, r.wkDone / need), 0) / g.length : 0 } });
  const mine = (CFG.me && CFG.me.pos) || "Position", lead = sq[0].pct >= sq[1].pct ? sq[0] : sq[1];
  return `<div class="card pulse" ${mini ? 'data-nav="team"' : ""}><div class="pring" style="--p:${Math.round(td / n * 100)}"><b>${td}</b><small>of ${n}</small></div><div class="pt"><b>${td} of ${n} lifted today</b><small>Team pulse · updates as guys finish</small>
   <div class="squad">${sq.map(s => `<div class="sqr ${s.pos === mine ? "mine" : ""}"><span>${s.pos === "Pitcher" ? "Pitchers" : "Position"}</span><div class="sqb"><i style="width:${Math.round(s.pct * 100)}%"></i></div><em>${Math.round(s.pct * 100)}%</em></div>`).join("")}</div>
   <small class="sqn">${lead.pos === "Pitcher" ? "Pitchers" : "Position players"} lead this week's squad battle</small></div></div>` }
function feedHTML(n) { const F = feedItems().slice(0, n || 50); return `<div class="feed">${F.map(f => { const d = CFG.daps[f.id] || {}, base = (hashStr(f.id) % 6);
  return `<div class="fi ${f.kind} ${f.me ? "me" : ""}"><div class="fic">${{ pr: "PR", streak: "🔥", week: "◎", card: "★" }[f.kind]}</div><div class="fit"><b>${esc(f.who)}</b> ${esc(f.txt)}${f.big ? ` <em>${esc(f.big)}</em>` : ""}${f.up ? ` <span class="up">${esc(f.up)}</span>` : ""}<small>${ago(f.at)} ago</small></div>
   <div class="daps">${["🔥", "👊", "💪"].map(e => `<button class="${d[e] ? "on" : ""}" data-dap="${f.id}|${e}">${e}<i>${(e === "🔥" ? base : base % 3) + (d[e] ? 1 : 0) || ""}</i></button>`).join("")}</div></div>` }).join("")}</div>` }
function installCard() { const sa = matchMedia("(display-mode: standalone)").matches || navigator.standalone; if (sa || CFG.installNo) return "";
  return `<div class="card install"><img src="icons/icon-192.png" alt=""><div><b>Put CU Lifting on your Home Screen</b><small>Opens full screen, works with no signal in the weight room, and lets notifications through.</small></div><div class="ib"><button class="pill gold sm" data-install>How</button><button class="pill ghost sm" data-noinstall>Later</button></div></div>` }

/* ===================== WORKOUT (focus mode) ===================== */
function steps(p, w, d) { const Q = PH[p], out = []; if ((Q.warm[d] || []).length) out.push({ k: "warm" }); (Q.prog[d] || []).forEach((b, bi) => { if (b.ex.some(e => Wk(e, w))) out.push({ k: "blk", bi }) }); out.push({ k: "soft" }); out.push({ k: "fin" }); return out }
function startWorkout(p, w, d) { const go = () => { WO = { p, w, d, i: 0, list: CFG.mode === "list" }; const S = steps(p, w, d), r = peek(p, w, d);
    if (r) { const first = S.findIndex(s => s.k === "warm" ? !(r.u && Object.keys(r.u).length >= (PH[p].warm[d] || []).length) : s.k === "blk" ? !blockDone(p, w, d, s.bi) : false); WO.i = first < 0 ? S.length - 1 : first }
    CFG.seen.li = xpInfo().li; woOpen() };
  if (CFG.snd === null) { const o = sheet("Sounds during your lift?", `<p class="lead">Crowd roar on a PR, a clack when you check a set, a beep when rest is up.</p>
    <p class="lead dim">Listening to your own music? Keep sounds off. <b>Your walk-up song button always works</b>, either way.</p>
    <div class="btn2"><button class="pill gold" data-snd="1">${I.snd} Sounds on</button><button class="pill" data-snd="0">${I.music} Off — I've got music</button></div><p class="fine">Change it any time with the speaker button or in Me → Sounds.</p>`, "ask");
    o.addEventListener("click", e => { const b = e.target.closest("[data-snd]"); if (!b) return; CFG.snd = b.dataset.snd === "1"; saveNow(); if (CFG.snd) { ac(); sfx("pop") } closeOv(o); go() }); return }
  go() }
function woOpen() { let o = $("#wo"); if (!o) { o = document.createElement("div"); o.id = "wo"; document.body.appendChild(o) } o.hidden = false; document.body.classList.add("woopen"); woRender(); requestAnimationFrame(() => o.classList.add("on")) }
function woClose() { const o = $("#wo"); if (!o) return; o.classList.remove("on"); document.body.classList.remove("woopen"); stopRest(); setTimeout(() => { o.hidden = true; o.innerHTML = "" }, 250); WO = null; render() }
function ghost(p, w, d) { if (w === 0) return null; const g = sessionStats(p, w - 1, d); return g.lb > 0 ? g : null }
function woRender(keepScroll) { const { p, w, d } = WO, Q = PH[p], S = steps(p, w, d), o = $("#wo"), sc = o.querySelector(".wob"), y = sc ? sc.scrollTop : 0;
  const cur = sessionStats(p, w, d), gh = ghost(p, w, d), pct = dayPct(p, w, d) || 0;
  const seg = S.map((s, i) => { const dn = s.k === "warm" ? (peek(p, w, d) && Object.keys((peek(p, w, d) || {}).u || {}).length >= (Q.warm[d] || []).length) : s.k === "blk" ? blockDone(p, w, d, s.bi) : false;
    return `<button class="sg ${i === WO.i ? "on" : ""} ${dn ? "dn" : ""}" data-step="${i}" aria-label="Step ${i + 1}">${s.k === "blk" ? LET[s.bi] : s.k === "warm" ? "W" : s.k === "soft" ? "R" : "✓"}</button>` }).join("");
  const head = `<div class="woh"><button class="ib" data-woclose aria-label="Close">${I.x}</button><div class="wot"><small>Wk ${Q.weeks[w].n} · ${esc(Q.short)}</small><b>${esc(dayLabel(p, d))}</b></div>
   <button class="ib walkbtn ${WALK && !WALK.paused ? "on" : ""}" data-walk aria-label="Walk-up song">${I.music}</button><button class="ib" data-sndtog aria-label="Sounds">${CFG.snd ? I.snd : I.mute}</button><button class="ib ${WO.list ? "on" : ""}" data-wolist aria-label="Show all">${I.list}</button></div>
   <div class="segs">${seg}</div>${gh ? `<div class="ghost"><div class="gbar"><i style="width:${clamp(cur.lb / gh.lb * 100, 0, 100)}%"></i><span class="gm" style="left:100%"></span></div><small><b>${fmt(cur.lb)}</b> lb vs your ghost from last week <b>${fmt(gh.lb)}</b>${cur.lb > gh.lb ? " · <em>ahead</em>" : ""}</small></div>` : `<div class="ghost"><div class="gbar"><i style="width:${Math.round(pct * 100)}%"></i></div><small><b>${Math.round(pct * 100)}%</b> of today done</small></div>`}`;
  let body = WO.list ? S.map((s, i) => stepHTML(s, i)).join("") : stepHTML(S[WO.i], WO.i);
  const last = WO.i >= S.length - 1;
  const nav = WO.list ? "" : `<div class="wonav">${WO.i > 0 ? `<button class="pill ghost" data-step="${WO.i - 1}">${I.back} Back</button>` : "<span></span>"}${last ? "" : `<button class="pill gold" data-step="${WO.i + 1}">Next: ${esc(stepName(S[WO.i + 1]))} ${I.fwd}</button>`}</div>`;
  o.innerHTML = `<div class="wobg">${sceneSVG(zoneOf(p).kind)}</div>${head}<div class="wob">${body}${nav}<div style="height:140px"></div></div><div id="rest"></div>`;
  if (keepScroll) o.querySelector(".wob").scrollTop = y; if (RT) drawRest() }
function stepName(s) { if (!s) return ""; if (s.k === "warm") return "Warm-up"; if (s.k === "soft") return "Recovery"; if (s.k === "fin") return "Finish"; const b = PH[WO.p].prog[WO.d][s.bi]; return LET[s.bi] + (b.title ? " · " + b.title : "") }
function stepHTML(s, i) { const { p, w, d } = WO, Q = PH[p], r = peek(p, w, d) || {};
  if (s.k === "warm") { const L = Q.warm[d] || [], n = Object.keys(r.u || {}).length; return `<section class="stp" data-si="${i}"><div class="sth"><div class="let w">W</div><div><b>Warm-up</b><small>${n}/${L.length} · ${esc(Q.warmnote || "Get loose, get fast")}</small></div><button class="pill sm" data-wuall>${n >= L.length ? "Clear" : "Check all"}</button></div>
   <div class="wul">${L.map((x, k) => `<div class="wur ${r.u && r.u[k] ? "on" : ""}"><button class="cb" data-wu="${k}" aria-label="Done">${I.check}</button><div class="wn" data-wu="${k}"><b>${esc(x.n)}</b>${x.sub ? `<small>${esc(x.sub)}</small>` : ""}</div><span class="rx">${esc(x.rx || "")}</span>${x.v ? `<button class="vb" data-vid="${esc(x.v)}" data-vt="${esc(x.n)}">${I.play}</button>` : ""}</div>`).join("")}</div></section>` }
  if (s.k === "soft") { const own = Q.soft === "own"; return `<section class="stp" data-si="${i}"><div class="sth"><div class="let r">R</div><div><b>Recovery · soft tissue</b><small>${esc(Q.softnote || (own ? "Your own routine — take care of your body" : "x30-60 sec at each spot"))}</small></div></div>
   <div class="wul">${SOFT.map(x => `<div class="wur plain"><div class="wn"><b>${esc(x.n)}</b></div>${x.v ? `<button class="vb" data-vid="${esc(x.v)}" data-vt="${esc(x.n)}">${I.play}</button>` : ""}</div>`).join("")}</div><p class="fine">Optional — doesn't count against your workout.</p></section>` }
  if (s.k === "fin") { const pct = dayPct(p, w, d) || 0, st = sessionStats(p, w, d); return `<section class="stp fin" data-si="${i}"><div class="fin-big">${Math.round(pct * 100)}<small>%</small></div><p>${st.sets} sets · ${fmt(st.lb)} lb moved</p>
   ${pct >= .999 ? `<button class="skew red done" data-finish>Finish workout</button>` : `<p class="fine">Finish every set (or mark one "hurt — skipped") to light up the stadium.</p><button class="pill" data-woclose>Save &amp; close</button>`}</section>` }
  const b = Q.prog[d][s.bi], bd = blockDone(p, w, d, s.bi);
  let h = `<section class="stp blk ${bd ? "bdone" : ""}" data-si="${i}" data-bi="${s.bi}"><div class="sth"><div class="let">${LET[s.bi]}</div><div><b>${esc(b.title || "Block " + LET[s.bi])}</b><small>${esc(b.rest || "")}</small></div><button class="pill sm" data-rest="${restSecs(b)}">⏱ ${restSecs(b)}s</button></div>`;
  (b.note || []).forEach(n => h += `<div class="note">${esc(n)}</div>`);
  if (b.amrap) h += `<div class="amrap"><div><b>${b.amrap}-minute clock</b><small>One set of each → repeat. Count rounds.</small></div><button class="pill sm" data-clock="${b.amrap * 60}">Start clock</button><label>Rounds<input inputmode="numeric" data-rounds="${s.bi}" value="${esc((r.n && r.n["r" + s.bi]) || "")}"></label></div>`;
  else if (b.seq) h += `<div class="hint">Finish every set of ${LET[s.bi]}1 before moving to ${LET[s.bi]}2.</div>`;
  else if (b.ex.filter(e => Wk(e, w) && !e.or).length > 1) h += `<div class="hint">Superset: one set of each, back and forth, then repeat.</div>`;
  b.ex.forEach((e, ei) => { const W = Wk(e, w); if (W) h += exHTML(b, s.bi, e, ei, W, r) });
  return h + `</section>` }
function exHTML(b, bi, e, ei, W, r) { const { p, w, d } = WO, id = bi + "." + ei, ok = exDone(p, w, d, bi, ei), hurt = r.x && r.x["i" + id], vars = variantsOf(e), cv = (r.v && r.v[id]) || "";
  let h = `<div class="ex ${ok ? "exdone" : ""} ${e.or ? "orx" : ""}" data-ex="${id}">${e.or ? `<div class="orl">— or —</div>` : ""}<div class="exh"><span class="tag">${LET[bi]}${ei + 1}</span><div class="nm">${esc(e.name)}<small>${esc(setsPhrase(W, e))}</small></div>
   <div class="exb">${(e.vid || []).length ? `<button class="vb" data-vid="${esc(e.vid[0][1])}" data-vt="${esc(e.name)}" ${e.vid.length > 1 ? `data-vids="${esc(JSON.stringify(e.vid))}"` : ""}>${I.play}</button>` : ""}${e.photo ? `<a class="vb ph" href="${esc(e.photo)}" target="_blank" rel="noopener">📷</a>` : ""}${W.wt ? `<button class="vb" data-plates aria-label="Plate math">⚖</button>` : ""}</div></div>`;
  if (W.load) h += `<div class="ld"><b>Load:</b> ${esc(W.load)}</div>`; if (W.note) h += `<div class="wk">${esc(W.note)}</div>`;
  (e.cues || []).forEach(c => h += `<div class="cue">${esc(c)}</div>`); (e.opts || []).forEach(([a, t]) => h += `<div class="opt"><b>${esc(a)}</b> ${esc(t)}</div>`); if (e.alt && !e.or) h += `<div class="opt"><b>${esc(e.alt)}</b></div>`;
  if (W.pct) h += `<div class="ld"><b>Suggested:</b> ${W.pct.map(x => Math.round(x * 100) + "%").join(" / ")} of your bodyweight</div>`;
  if (vars) h += `<div class="vars"><small>What did you use?</small>${vars.map(v => `<button class="${v === cv ? "on" : ""}" data-var="${id}|${esc(v)}">${esc(v)}</button>`).join("")}</div>`;
  if (hurt) return h + `<div class="hurt">Skipped — hurt. Counts as done, your streak is safe. <button class="linkb sm" data-hurt="${id}">Undo</button></div></div>`;
  const R = rows(W); let nextIdx = R.findIndex((_, si) => !(r.s && r.s[id + "." + si] && r.s[id + "." + si].d));
  h += `<div class="sets">` + R.map((Rw, si) => { const k = id + "." + si, v = (r.s && r.s[k]) || {}, P = parseT(Rw.t, e), sg = W.wt ? suggest(p, w, d, bi, ei, si, Rw) : null, timed = P.secs || P.maxt;
    const repsPh = P.raw ? "reps" : P.maxt ? "sec" : P.secs ? P.big : P.big;
    return `<div class="srow ${v.d ? "done" : ""} ${Rw.warm ? "warm" : ""} ${Rw.opt ? "optset" : ""}" data-k="${k}"><div class="sl">${esc(Rw.warm ? "WU" : Rw.lab)}${Rw.opt ? "<i>optional</i>" : ""}</div>
     <div class="tg">${esc(P.big)}<small>${esc(P.small)}</small></div><div class="ins">${W.wt ? `<label class="f"><input inputmode="decimal" data-w="${k}" value="${esc(v.w || "")}" placeholder="${sg ? sg.next : "lb"}"><span>lb</span></label>` : ""}
     <label class="f reps"><input inputmode="numeric" data-r="${k}" value="${esc(v.r || "")}" placeholder="${esc(repsPh)}"></label>${timed ? `<button class="tbtn" data-hold="${P.secs || 0}|${k}">▶</button>` : ""}</div>
     <button class="ck" data-ck="${k}" aria-label="Done">${I.check}</button>
     ${sg && !v.d ? `<div class="sug">Last: <b>${esc(sg.last.w)}${sg.last.r ? "×" + esc(sg.last.r) : ""}</b> → try <button class="tryb" data-try="${k}|${sg.next}">${sg.next} lb</button></div>` : ""}
     ${si === nextIdx && si > 0 && !v.d && r.s && r.s[id + "." + (si - 1)] && (r.s[id + "." + (si - 1)].w || r.s[id + "." + (si - 1)].r) ? `<div class="sug"><button class="tryb ghost" data-same="${k}">Same as last set</button></div>` : ""}</div>` }).join("") + `</div>`;
  h += `<div class="exf"><input class="note-in" data-note="${id}" value="${esc((r.n && r.n[id]) || "")}" placeholder="Note for coach (optional)" maxlength="120"><button class="linkb sm" data-hurt="${id}">Hurt — skip</button></div>`;
  return h + `</div>` }

/* ---- logging actions ---- */
function setVal(k, f, val) { const { p, w, d } = WO, r = rec(p, w, d); const v = r.s[k] = r.s[k] || {}; v[f] = val; save() }
function check(k, btn) { const { p, w, d } = WO, r = rec(p, w, d), v = r.s[k] = r.s[k] || {}, [bi, ei] = k.split(".").map(Number), e = PH[p].prog[d][bi].ex[ei], W = Wk(e, w);
  const wasEx = exDone(p, w, d, bi, ei), wasLi = xpInfo().li, isWarm = (rows(W)[+k.split(".")[2]] || {}).warm;
  if (v.d) { delete v.d; save(); MEMO = {}; woRender(true); return }
  const inp = $(`[data-w="${k}"]`); if (W.wt && inp && !inp.value && inp.placeholder && /^\d/.test(inp.placeholder)) v.w = inp.placeholder;
  v.d = 1; v.t = ymd(new Date()); saveNow(); MEMO = {}; sfx("clack"); buzz(15); floatAt(btn, "+5 XP");
  /* PR? */
  if (W.wt && +v.w > 0 && !isWarm) { const o = ord(p, w, PH[p].days.findIndex(D => D.k === d)), prev = bestBefore(e.name, (r.v && r.v[bi + "." + ei]) || "", o); const ck = "pr|" + K(p, w, d) + "|" + bi + "." + ei + "|" + v.w;
    if (prev > 0 && +v.w > prev && !CFG.celebrated[ck]) { CFG.celebrated[ck] = 1; saveNow(); setTimeout(() => showPR(e.name, +v.w, prev), 250) } }
  const nowEx = exDone(p, w, d, bi, ei); woRender(true);
  if (!wasEx && nowEx) { const el = $(`[data-ex="${bi}.${ei}"]`); stamp(el); floatAt(el, "+15 XP", "gold") }
  const b = PH[p].prog[d][bi]; if (!blockDone(p, w, d, bi)) startRest(restSecs(b)); else if (!WO.list) { const S = steps(p, w, d), nx = S.findIndex((s, i) => i > WO.i && (s.k === "blk" ? !blockDone(p, w, d, s.bi) : s.k === "fin"));
    if (nx > 0) setTimeout(() => { if (WO) { WO.i = nx; woRender(); $(".wob").scrollTop = 0 } }, 1100) }
  lvCheck(wasLi) }
function lvCheck(was) { MEMO = {}; const x = xpInfo(); if (x.li > (CFG.seen.li ?? x.li) || (was != null && x.li > was)) { CFG.seen.li = x.li; saveNow(); setTimeout(() => levelUp(x.name), 900) } }

/* ---- rest timer (auto-starts when you check a set) ---- */
function startRest(sec, label) { RT = { end: Date.now() + sec * 1000, tot: sec, label: label || "Rest" }; drawRest(); clearInterval(RT.iv); RT.iv = setInterval(drawRest, 250) }
function stopRest() { if (RT) clearInterval(RT.iv); RT = null; const e = $("#rest"); if (e) e.innerHTML = "" }
function drawRest() { const e = $("#rest"); if (!RT || !e) return; const left = Math.max(0, Math.ceil((RT.end - Date.now()) / 1000)), k = left / RT.tot;
  if (left <= 0 && !RT.rang) { RT.rang = 1; sfx("beep"); buzz([120, 80, 120]) }
  e.innerHTML = `<div class="restbar ${left <= 0 ? "go" : ""}"><div class="rring" style="--p:${Math.round(k * 100)}"><b>${left <= 0 ? "GO" : Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0")}</b></div><div class="rl"><b>${left <= 0 ? "Time — next set" : esc(RT.label)}</b><small>${RT.tot}s</small></div>
   <button data-radd="-15">−15</button><button data-radd="15">+15</button><button data-rskip>${left <= 0 ? "Close" : "Skip"}</button></div>`;
  if (left <= -20) stopRest() }

/* ---- finishing ---- */
function finishWorkout() { const { p, w, d } = WO, k = K(p, w, d), st = sessionStats(p, w, d), gh = ghost(p, w, d), wasLi = CFG.seen.li;
  MEMO = {}; const prs = prEvents().filter(e => e.p === p && e.wk === w && e.d === d).length, xp = st.sets * 5 + 60 + prs * 30;
  const stats = { sets: st.sets, lb: st.lb, xp, prs, streak: streakInfo().cur, title: "Wk " + PH[p].weeks[w].n + " · " + dayLabel(p, d), beat: gh ? st.lb >= gh.lb : true, ghost: gh ? (st.lb >= gh.lb ? `Beat your ghost by ${fmt(st.lb - gh.lb)} lb` : `${fmt(gh.lb - st.lb)} lb short of last week's ghost`) : "" };
  const first = !CFG.celebrated["day|" + k]; CFG.celebrated["day|" + k] = 1; saveNow(); woClose();
  lightsOn(stats, () => { const ws = weekState(p, w), wk = PH[p].id + "-w" + (w + 1);
    if (ws.full && !CFG.celebrated["wk|" + wk]) { CFG.celebrated["wk|" + wk] = 1; saveNow(); setTimeout(() => toast(`<b>Full week!</b> Capsule earned — <u data-opencap="${wk}">open it</u>`, 4500), 400) }
    if (phaseWon(p) && !CFG.celebrated["ph|" + p]) { CFG.celebrated["ph|" + p] = 1; saveNow(); setTimeout(() => phaseCine(p), 900) }
    lvCheck(wasLi); render() }) }
function phaseCine(p) { const Q = PH[p], c = cardRatings(p); sfx("roar"); buzz([80, 60, 80, 60, 200]);
  const o = overlay(`<div class="cine"><div class="crays"></div><div class="ctro">${I.cup}</div><small>Phase ${Q.n} complete</small><h2>${esc(Q.name)}</h2><p>Every lift, every week. That's the Cleary Standard.</p>
   ${CFG.card ? `<div class="cedi">New card edition unlocked: <b>${esc(Q.short)} Edition</b> · OVR ${c.ovr}</div>` : ""}<button class="pill gold" data-close>Keep climbing</button></div>`, "center cineov"); confetti(140, o) }

/* ---- holds / clocks ---- */
function hold(sec, k) { let left = sec || 0, up = !sec; const t0 = Date.now(); const o = overlay(`<div class="hold"><div class="hring"><b id="hv">${up ? "0" : left}</b><small>${up ? "seconds · go max" : "seconds"}</small></div><button class="pill gold" id="hstop">${up ? "Stop & log" : "Done"}</button><button class="pill ghost" data-close>Cancel</button></div>`, "center");
  sfx("pop"); const iv = setInterval(() => { const el = Math.floor((Date.now() - t0) / 1000); const v = up ? el : Math.max(0, sec - el); const hv = o.querySelector("#hv"); if (hv) hv.textContent = v; if (!up && v <= 0) { clearInterval(iv); sfx("beep"); buzz([100, 60, 100]); fin(sec) } }, 200);
  function fin(v) { clearInterval(iv); if (up) setVal(k, "r", String(v)); closeOv(o); MEMO = {}; woRender(true); const b = $(`[data-ck="${k}"]`); if (b && !(rec(WO.p, WO.w, WO.d).s[k] || {}).d) check(k, b) }
  o.querySelector("#hstop").onclick = () => fin(up ? Math.floor((Date.now() - t0) / 1000) : sec); o.addEventListener("click", e => { if (e.target.closest("[data-close]")) clearInterval(iv) }) }

/* ===================== SEASON MAP ===================== */
function seasonHTML() { const T = findToday(), L = mapLayout(), tot = L.pts.length, cur = L.pts.findIndex(q => q.p === T.p && q.w === T.w), inS = pd(PH[6].weeks[0].mon), dleft = Math.ceil((inS - today0()) / 864e5);
  const doneW = L.pts.filter(q => { const s = weekState(q.p, q.w); return s.full && s.real > 0 }).length;
  return `<div class="maphud"><div><small>The road to the season</small><b>Week ${PH[T.p].weeks[T.w].n} of ${tot}</b></div><div class="mh2"><div class="mbar"><i style="width:${Math.round((cur + 1) / tot * 100)}%"></i></div>
   <small>${doneW} full weeks · ${dleft > 0 ? dleft + " days to In-Season (" + nice(inS) + ")" : "In-Season"}</small></div></div><div id="mapscroll">${mapHTML()}</div>` }
function weekSheet(p, w) { const Q = PH[p], W = Q.weeks[w], s = weekState(p, w), key = Q.id + "-w" + (w + 1);
  const body = `<p class="lead">Phase ${Q.n} · ${esc(Q.name)} · starts ${nice(pd(W.mon))}</p>${Q.days.map(D => { const sk = skipMsg(p, w, D.k), dn = isDone(p, w, D.k), ex = isExc(p, w, D.k), pc = dayPct(p, w, D.k);
    return `<button class="drow ${dn ? "dn" : ""}" data-sel="${p}.${w}.${D.k}" ${sk ? "disabled" : ""}><b>${esc(D.l)}</b><span>${sk ? "No workout" : dn ? "✓ Done" : ex ? "Excused" : pc ? Math.round(pc * 100) + "%" : "Not started"}</span>${I.fwd}</button>` }).join("")}
   ${s.full && s.real ? (CFG.caps[key] ? `<p class="fine">Capsule opened: ${esc((REWARDS.find(x => x.id === CFG.caps[key]) || {}).n || "")}</p>` : `<button class="pill gold" data-opencap="${key}">Open this week's capsule</button>`) : `<p class="fine">Finish every workout this week to earn its capsule.</p>`}`;
  sheet("Week " + W.n, body) }
function phaseSheet(p) { const Q = PH[p], s = phaseSessions(p), won = phaseWon(p), fut = p > findToday().p;
  sheet("Phase " + Q.n + " · " + esc(Q.short), `<div class="phs ${won ? "won" : ""}"><div class="phtro">${won ? I.cup : fut ? I.lock : Q.n}</div><div><b>${esc(Q.name)}</b><small>${esc(Q.season)} · ${Q.weeks.length} weeks · starts ${nice(pd(Q.weeks[0].mon))}</small></div></div>
   <p class="lead">${esc(Q.purpose)}</p><div class="xpbar big"><i style="width:${s.tot ? Math.round(s.done / s.tot * 100) : 0}%"></i></div><p class="fine">${s.done} of ${s.tot} workouts done${won ? " · trophy earned" : " · finish them all to light the trophy"}</p>`) }

/* ===================== CAPSULES ===================== */
function openCapsule(key) { if (CFG.caps[key]) return; const rw = rewardFor(key), wkn = (allWeeks().find(x => PH[x.p].id + "-w" + (x.w + 1) === key) || {}).n || "";
  const tier = { c: ["Common", "#5aa9ff"], r: ["Rare", "#b48cff"], l: ["Legendary", "#ffc94a"] }[rw.r];
  const o = overlay(`<div class="capstage" style="--gl:${tier[1]}"><div class="crays2"></div><div class="cglow"></div><div class="capsule"><div class="top"></div><div class="band"></div><div class="bot"><div class="odo">${String(wkn).padStart(2, "0").split("").map(c => `<span>${c}</span>`).join("")}</div></div></div>
   <div class="capcard"><div class="ccr" style="--rc:${tier[1]}"><small>${tier[0]}</small><div class="cci">${rw.k === "frame" ? "▣" : rw.k === "title" ? "❝" : "✦"}</div><b>${esc(rw.n)}</b><span>${rw.k === "frame" ? "Card frame" : rw.k === "title" ? "Title under your name" : "Profile badge"}</span></div></div>
   <div class="capban">WEEK ${esc(wkn)} CAPSULE</div><p class="capmsg">Tap to open</p><button class="pill gold capdone" data-close>Add to collection</button></div>`, "center capov");
  const stg = o.querySelector(".capstage"); let opened = false;
  stg.addEventListener("click", e => { if (opened || e.target.closest("[data-close]")) return; opened = true; o.querySelector(".capmsg").textContent = ""; stg.classList.add("shake"); sfx("pop"); buzz(30);
    setTimeout(() => { stg.classList.remove("shake"); stg.classList.add("open"); sfx("open"); buzz([30, 40, 90]); if (rw.r !== "c") confetti(rw.r === "l" ? 140 : 60, o) }, 1000);
    CFG.caps[key] = rw.id; if (!CFG.inv.includes(rw.id)) CFG.inv.push(rw.id); saveNow() });
  o.addEventListener("click", e => { if (e.target.closest("[data-close]")) render() }) }

/* ===================== TEAM ===================== */
function teamHTML() { const rows = teamRows(), goal = 25000000, vol = rows.reduce((a, r) => a + r.vol, 0);
  const B = { streak: ["Streak", r => r.streak, v => "🔥 " + v], comp: ["Completion", r => r.comp, v => Math.round(v * 100) + "%"], gain: ["Most improved", r => r.gain, v => "+" + v + "%"] }[BOARD];
  const list = rows.filter(r => !r.me || CFG.share.boards).sort((a, b) => B[1](b) - B[1](a)); const myI = list.findIndex(r => r.me);
  return topbar("Team", "Cleary Baseball · " + rows.length + " players") + `<div class="body">${pulseCard()}
   <div class="card goal"><div class="gh"><b>Team goal</b><small>25 million pounds as a team before the season ends</small></div><div class="gm"><div class="gfill" style="width:${clamp(vol / goal * 100, 0, 100).toFixed(1)}%"></div>${[.25, .5, .75].map(x => `<i style="left:${x * 100}%" class="${vol / goal >= x ? "hit" : ""}"></i>`).join("")}</div><div class="gn"><b>${fmt(vol)}</b> lb<span>${Math.round(vol / goal * 100)}%</span></div></div>
   <div class="sec-h"><h2>Leaderboards</h2></div><div class="seg">${[["streak", "Streak"], ["comp", "Completion"], ["gain", "Most improved"]].map(([k, l]) => `<button class="${BOARD === k ? "on" : ""}" data-board="${k}">${l}</button>`).join("")}</div>
   <div class="board">${list.slice(0, 10).map((r, i) => `<div class="br ${r.me ? "me" : ""}"><span class="bi">${i + 1}</span><b>${esc(r.name)}</b><small>${r.pos === "Pitcher" ? "P" : "POS"} · ${esc(r.cls)}</small><em>${B[2](B[1](r))}</em></div>`).join("")}
   ${myI >= 10 ? `<div class="br me"><span class="bi">${myI + 1}</span><b>${esc(myName())}</b><small>you</small><em>${B[2](B[1](list[myI]))}</em></div>` : ""}${!CFG.share.boards ? `<p class="fine">You're hidden from leaderboards (Me → Privacy).</p>` : ""}</div>
   <p class="fine">Most improved compares you to your own starting numbers, so everyone can win it.</p>
   <div class="sec-h"><h2>Feed</h2></div>${feedHTML(30)}<p class="fine sample">Sample team for now. Real teammates show up here once accounts are connected.</p></div>` }
function topbar(t, s) { return `<header class="tbar"><div class="tbs">${sceneSVG(zoneOf(findToday().p).kind)}</div><div class="tbi"><img src="img/cu.png" alt=""><div><b>${esc(t)}</b><small>${esc(s || "")}</small></div></div></header>` }

/* ===================== TROPHIES / HALL OF FAME ===================== */
function hofRecords() { const out = {}; const prs = prEvents(); MAIN.forEach(k => { let best = null; EXIDX[k].forEach(x => PH[x.p].weeks.forEach((_, w) => { const t = topSet(x.p, w, x.d, x.bi, x.ei); if (t && (!best || t > best.w)) best = { w: t, dt: sessDate(x.p, w, x.d), name: x.e.name, check: prs.some(e => nrm(e.name) === k && e.w === t && e.check) } }));
  out[k] = { name: EXIDX[k][0].e.name, best } }); return out }
function trophiesHTML() { const caps = unopened(), prs = prEvents(), H = hofRecords(), st = streakInfo(), xp = xpInfo(), owned = REWARDS.filter(x => CFG.inv.includes(x.id));
  const mil = [["First workout", SESS.some(S => isDone(S.p, S.w, S.d))], ["First PR", prs.length > 0], ["5-day streak", st.best >= 5], ["15-day streak", st.best >= 15], ["30-day streak", st.best >= 30], ["Perfect week", earnedCapsules().length > 0], ["10 PRs", prs.length >= 10], ["Starter", xp.li >= 2], ["All-Conference", xp.li >= 3], ["Phase trophy", PH.some((_, p) => phaseWon(p))]];
  return topbar("Trophy room", "Hall of Fame, capsules, collection") + `<div class="body">
   <div class="card vault"><div class="shelf">${caps.length ? caps.slice(0, 5).map((k, i) => `<button class="minicap" style="--i:${i}" data-opencap="${k}" aria-label="Open capsule"></button>`).join("") : `<div class="vempty">No capsules waiting</div>`}</div>
    <b>${caps.length} capsule${caps.length === 1 ? "" : "s"} ready</b><small>Finish every workout in a week to earn one. Rewards are cosmetic: frames, titles, badges.</small></div>
   ${owned.length ? `<div class="sec-h"><h2>Collection</h2><small>${owned.length}/${REWARDS.length}</small></div><div class="coll">${owned.map(x => `<button class="cl r-${x.r} ${CFG.frame === x.id || CFG.title === x.id || CFG.badge === x.id ? "eq" : ""}" data-equip="${x.id}"><i>${x.k === "frame" ? "▣" : x.k === "title" ? "❝" : "✦"}</i><b>${esc(x.n)}</b><small>${CFG.frame === x.id || CFG.title === x.id || CFG.badge === x.id ? "Equipped" : "Tap to equip"}</small></button>`).join("")}</div>` : ""}
   <div class="hof"><div class="dome"><div class="arch"></div><h2>Cleary Hall of Fame</h2><p>Weight room records · they carry over year to year</p></div>
    <div class="plaques">${Object.values(H).map(x => `<div class="plq ${x.best ? "" : "empty"}"><small>${esc(x.name)}</small>${x.best ? `<b>${x.best.w} <i>lb</i></b><span>${esc(myName())} · ${nice(x.best.dt)}</span>${x.best.check ? `<em>Pending coach check</em>` : ""}` : `<b class="q">—</b><span>Unclaimed · be the first</span>`}</div>`).join("")}</div>
    <p class="fine">Big jumps (20%+ over a previous best) show as "pending coach check" before they go on the wall.</p></div>
   <div class="sec-h"><h2>Phase trophies</h2><small>${PH.filter((_, p) => phaseWon(p)).length} of ${PH.length}</small></div><div class="shelf2">${PH.map((Q, p) => { const s = phaseSessions(p), won = phaseWon(p); return `<button class="tro ${won ? "won" : ""}" data-mph="${p}">${I.cup}<b>${Q.n}</b><i style="height:${s.tot ? s.done / s.tot * 100 : 0}%"></i></button>` }).join("")}</div>
   <div class="sec-h"><h2>Milestones</h2></div><div class="mils">${mil.map(([n, ok]) => `<div class="mil ${ok ? "ok" : ""}"><i>${ok ? "★" : "☆"}</i><span>${esc(n)}</span></div>`).join("")}</div>
   <div class="sec-h"><h2>PR list</h2><small>${prs.length}</small></div>${prs.length ? `<div class="prl">${prs.slice().reverse().slice(0, 12).map(e => `<div class="pri"><b>${esc(e.name)}</b><small>${nice(e.dt)} · Phase ${PH[e.p].n}, Wk ${PH[e.p].weeks[e.wk].n}</small><em>${e.w}<i>lb</i></em><span>+${e.w - e.prev}</span></div>`).join("")}</div>` : `<p class="fine">No PRs yet. Beat your heaviest set on any lift and it lands here.</p>`}</div>` }

/* ===================== ME ===================== */
function cardData(ed) { const c = cardRatings(ed), M = CFG.me || {}; return Object.assign(c, { name: (M.fn || "") + " " + (M.ln || ""), sub: `#${M.num || "—"} · ${M.pos === "Pitcher" ? "Pitcher" : "Position"} · ${M.cls || ""}`, photo: CFG.photo || "", ed: ed == null ? PH[findToday().p].short + " Edition" : PH[ed].short + " Edition", title: (REWARDS.find(x => x.id === CFG.title) || {}).n || "" }) }
function cardHTML(d, preview) { const fr = CFG.frame ? CFG.frame.replace("f-", "") : "";
  return `<div class="pcard r-${d.rar[1]} fr-${fr} ${preview ? "prev" : ""}" data-tilt><div class="pcin"><div class="pctop"><div class="ovr"><b>${d.ovr}</b><small>OVR</small></div><div class="rar">${esc(d.rar[0])}</div></div>
   <div class="pcph">${d.photo ? `<img src="${esc(d.photo)}" alt="">` : `<img class="lg" src="img/badge.png" alt="">`}</div><div class="pcn">${esc(d.name)}</div><div class="pcs">${esc(d.sub)}</div>${d.title ? `<div class="pct">${esc(d.title)}</div>` : ""}
   <div class="pcr">${Object.entries(d.R).map(([k, v]) => `<div><b>${v}</b><small>${k === "MOBILITY" ? "MOB" : k === "ENGINE" ? "ENG" : k}</small></div>`).join("")}</div><div class="pce">${esc(d.ed)}</div></div><div class="shine"></div><div class="glare"></div>${preview ? `<div class="pvw">PREVIEW</div>` : ""}</div>` }
const HOWCARD = [["STR · Strength", "Your best top set on each main lift (the ones with warm-up/build-up sets) compared to your first logged number. Grows as you get stronger than <b>you</b> were — not compared to anyone else, and bodyweight is never used."],
  ["PWR · Power", "How many of your jumps, sprints, throws and slams you've completed."], ["ENG · Engine", "Conditioning: bike, row, carries and the AMRAP clocks you've finished."],
  ["MOB · Mobility", "How much of each warm-up you check off."], ["GRIND · Consistency", "Workouts finished out of workouts due (excused days count), plus a streak bonus."]];
function cardPreview() { const d = cardData(); sheet("Player card", `<div class="cprev">${cardHTML(d, true)}</div>
   <p class="lead">This is what <b>your</b> card would show right now, built only from your own logs. It's off until you turn it on, and only you decide if it's shared.</p>
   <div class="how">${HOWCARD.map(([a, b]) => `<div><b>${a}</b><p>${b}</p></div>`).join("")}</div>
   <div class="how2"><b>How it tracks through the phases</b><p>Every rating is 50–99. Your OVR is the average. Rarity climbs with it: <b>Base</b> → <b>Rare</b> (70+) → <b>Foil</b> (80+) → <b>Cougar Legend</b> (90+).</p>
   <p>When you finish a phase, that card is saved as an <b>edition</b> (Fall Ball, Big Gain, Max Strength…) so you end up with a binder of your whole season.</p>
    <div class="binder">${PH.map((Q, p) => `<div class="bslot ${p < findToday().p ? "past" : p === findToday().p ? "cur" : ""}"><b>${Q.n}</b><small>${esc(Q.short)}</small></div>`).join("")}</div></div>
   <button class="skew red" data-cardon>${CFG.card ? "Card is on" : "Turn on my card"}</button>`, "tall") }
function editions() { const T = findToday(); sheet("Your editions", `<div class="eds">${PH.map((Q, p) => { const unlocked = phaseWon(p) || p < T.p, d = unlocked ? cardData(p) : null;
  return `<div class="ed ${unlocked ? "" : "lock"}">${unlocked ? cardHTML(d) : `<div class="edl">${I.lock}<b>${esc(Q.short)}</b><small>Phase ${Q.n}</small></div>`}</div>` }).join("")}</div><p class="fine">An edition locks in when its phase ends.</p>`, "tall") }
function meHTML() { if (!CFG.me) return topbar("Me", "Coach account") + `<div class="body">${coachMeCard()}<div class="card setc"><button class="setsw" data-mkplayer><span><b>Also lift with the team?</b><small>Set up a player profile on this phone</small></span>${I.fwd}</button><button class="setsw" data-key><span><b>Abbreviations &amp; RPE guide</b><small>What RFE, SA, ECC… mean</small></span>${I.fwd}</button></div></div>`;
  const M = CFG.me, xp = xpInfo(), st = streakInfo(), bw = latestBW();
  const sw = (k, on, t, s) => `<button class="setsw ${on ? "on" : ""}" data-sw="${k}"><span><b>${t}</b><small>${s}</small></span><i></i></button>`;
  let h = topbar("Me", M.fn + " " + M.ln) + `<div class="body"><div class="card prof"><div class="pnum">#${esc(M.num || "—")}</div><div><b>${esc(M.fn + " " + M.ln)}</b><small>${M.pos === "Pitcher" ? "Pitcher" : "Position player"} · ${esc(M.cls)}${CFG.title ? " · " + esc((REWARDS.find(x => x.id === CFG.title) || {}).n) : ""}</small></div><button class="pill sm" data-editprof>Edit</button></div>
   <div class="card lvl"><div class="lvh"><b>${esc(xp.name)}</b><span>${fmt(xp.xp)} XP</span></div><div class="xpbar big"><i style="width:${xp.next ? Math.round((xp.xp - xp.base) / (xp.next - xp.base) * 100) : 100}%"></i></div>
    <small>${xp.next ? fmt(xp.next - xp.xp) + " XP to " + esc(xp.nextName) : "Max level"} · streak ${st.cur} (best ${st.best})</small><details><summary>Where your XP comes from</summary>${xp.parts.map(([a, b]) => `<div class="xr"><span>${a}</span><b>${fmt(b)}</b></div>`).join("")}<p class="fine">Showing up is worth the most. Finishing workouts beats lifting heavy.</p></details></div>`;
  h += `<div class="sec-h"><h2>Player card</h2><small>${CFG.card ? "On" : "Off · optional"}</small></div>`;
  if (CFG.card) { const d = cardData(); h += `<div class="mycard">${cardHTML(d)}</div><div class="btn3"><button class="pill gold sm" data-sharecard>Share to story</button><button class="pill sm" data-editions>Editions</button><label class="pill sm">Photo<input type="file" accept="image/*" data-photo hidden></label></div><div class="cardlinks"><button class="linkb sm" data-cardhow>How it's tracked</button><button class="linkb sm" data-cardoff>Turn card off</button></div>` }
  else h += `<button class="card cardoff" data-cardhow><div class="cmini">${I.lock}</div><div><b>See what your card would show</b><small>2K-style ratings from your own lifts, a new edition every phase. Totally optional.</small></div>${I.fwd}</button>`;
  h += `<div class="sec-h"><h2>My lifts</h2></div><div class="lifts">${MAIN.slice(0, 40).map(k => { const tops = []; EXIDX[k].forEach(x => PH[x.p].weeks.forEach((_, w) => { const t = topSet(x.p, w, x.d, x.bi, x.ei); if (t) tops.push({ o: ord(x.p, w, x.di), t }) })); if (!tops.length) return "";
    tops.sort((a, b) => a.o - b.o); const mx = Math.max(...tops.map(q => q.t)), mn = Math.min(...tops.map(q => q.t)); const pts = tops.map((q, i) => `${(i / (Math.max(1, tops.length - 1)) * 100).toFixed(1)},${(26 - (q.t - mn) / Math.max(1, mx - mn) * 22).toFixed(1)}`).join(" ");
    return `<div class="lift"><b>${esc(EXIDX[k][0].e.name)}</b><svg viewBox="0 0 100 30" preserveAspectRatio="none" fill="none"><polyline points="${pts}"/></svg><em>${mx}<i>lb</i></em></div>` }).join("") || `<p class="fine">Log a weight on any main lift and it shows up here with a trend line.</p>`}</div>`;
  h += `<div class="sec-h"><h2>Settings</h2></div><div class="card setc">
   <button class="setsw" data-walksetup><span><b>Walk-up song</b><small>${CFG.walk ? (CFG.walk.kind === "file" ? "🎵 " + esc(CFG.walk.name) : "🔗 Link") : "Pick a song for your big sets — always available, even with sounds off"}</small></span>${I.fwd}</button>
   ${sw("snd", CFG.snd === true, "Sounds", "Crowd roar on PRs, set clacks, rest beep. Off if you're playing your own music.")}
   ${sw("notif", CFG.notif, "Notifications", "Squad updates, records, today's lift. Needs the Home Screen app on iPhone.")}
   ${sw("feed", CFG.share.feed, "Show my PRs in the team feed", "Teammates can dap them")}
   ${sw("boards", CFG.share.boards, "Show me on leaderboards", "Streak, completion and most improved only")}
   ${sw("rehab", CFG.rehab, "Rehab mode", "Hurt? Rehab days keep your streak and earn XP. Coaches see it.")}
   ${sw("mode", CFG.mode === "list", "Show whole workout on one screen", "Off = one block at a time (focus mode)")}
   <button class="setsw" data-install><span><b>Add to Home Screen</b><small>Full screen, offline, notifications</small></span>${I.fwd}</button>
   <button class="setsw" data-key><span><b>Abbreviations &amp; RPE guide</b><small>What RFE, SA, ECC… mean</small></span>${I.fwd}</button></div>
   <div class="sec-h"><h2>Bodyweight</h2><small>private · coaches only</small></div><div class="card bwc"><div><b>${bw ? bw + " lb" : "—"}</b><small>${CFG.bw.length ? "Last weigh-in " + nice(pd(CFG.bw.slice().sort((a, b) => a.d < b.d ? 1 : -1)[0].d)) : "Not logged"}</small></div><input inputmode="decimal" placeholder="Weigh-in (lb)" data-bwin><button class="pill sm" data-bwsave>Save</button></div>
   <p class="fine">Bodyweight never shows on your side of the app. Coaches use it for strength-to-bodyweight in their summary.</p>
   <div class="sec-h"><h2>Coach</h2></div>${coachMeCard()}
   <button class="linkb sm danger" data-reset>Reset my test data on this phone</button><p class="fine">Test build · saves on this phone only until accounts are connected.</p></div>`;
  return h }
function coachMeCard() { return isCoach() ? `<div class="card cme"><div><b>Signed in as coach</b><small>${esc(COACH.user.email || "")}</small></div><button class="pill gold sm" data-nav="coach">Coach view</button><button class="pill sm" data-pvon>Player view</button><button class="pill ghost sm" data-cout>Sign out</button></div>` : coachGate() }
function coachSummary() { const T = findToday(), need = PH[T.p].days.filter(D => !skipMsg(T.p, T.w, D.k)).length, rows = teamRows();
  const behind = rows.filter(r => r.wkDone < need).sort((a, b) => a.wkDone - b.wkDone), rel = rows.filter(r => r.bw && r.top).map(r => Object.assign({ rel: r.top / r.bw }, r)).sort((a, b) => b.rel - a.rel);
  const exc = Object.entries(CFG.exc), pend = prEvents().filter(e => e.check);
  return `<div class="card coach"><div class="cs3"><div><b>${Math.round(rows.reduce((a, r) => a + Math.min(1, r.wkDone / need), 0) / rows.length * 100)}%</b><small>team done this week</small></div><div><b>${rows.filter(r => r.todayDone).length}</b><small>lifted today</small></div><div><b>${behind.length}</b><small>behind this week</small></div></div>
   <h4>Behind this week</h4><div class="ctab">${behind.slice(0, 8).map(r => `<div><span>${esc(r.name)}</span><em>${r.wkDone}/${need}</em></div>`).join("")}</div>
   <h4>Strength to bodyweight <small>coach only</small></h4><div class="ctab">${rel.slice(0, 10).map(r => `<div><span>${esc(r.name)}</span><em>${r.rel.toFixed(2)}× <i>${r.top}/${r.bw}</i></em></div>`).join("")}</div>
   <h4>Excused days</h4>${exc.length ? `<div class="ctab">${exc.map(([k, v]) => `<div><span>${esc(myName())} · ${esc(k)}</span><em>${esc(v.why)}</em></div>`).join("")}</div>` : `<p class="fine">None</p>`}
   <h4>PRs waiting for a check</h4>${pend.length ? `<div class="ctab">${pend.map(e => `<div><span>${esc(myName())} · ${esc(e.name)}</span><em>${e.prev}→${e.w}</em></div>`).join("")}</div>` : `<p class="fine">None</p>`}
   <p class="fine sample">Sample team numbers until accounts are connected.</p></div>` }

/* ===================== sheets ===================== */
function openVideo(url, title, list) { const L = list || [["", url]]; let i = 0; CFG.vw++; save();
  const draw = () => { const v = L[i], id = ytId(v[1]), sh = /shorts\//.test(v[1]); return `${L.length > 1 ? `<div class="vtabs">${L.map((x, j) => `<button class="${j === i ? "on" : ""}" data-vi="${j}">${esc(x[0] || "Video " + (j + 1))}</button>`).join("")}</div>` : ""}
    ${id ? `<div class="vwrap ${sh ? "tall" : ""}"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&modestbranding=1" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>` : ""}
    <a class="pill ghost wide" href="${esc(v[1])}" target="_blank" rel="noopener">Open on YouTube</a>` };
  const o = sheet(esc(title), `<div id="vb">${draw()}</div>`, "vid"); o.addEventListener("click", e => { const b = e.target.closest("[data-vi]"); if (b) { i = +b.dataset.vi; o.querySelector("#vb").innerHTML = draw() } }) }
function excuseSheet() { const T = curT(); const o = sheet("Can't lift today?", `<p class="lead">Pick a reason. Your streak stays safe and your coach sees it.</p><div class="excs">${[["Game", "⚾"], ["Travel", "🚌"], ["Sick", "🤒"], ["Hurt · rehab day", "🩹"]].map(([n, e]) => `<button class="excb" data-why="${n}"><i>${e}</i>${n}</button>`).join("")}</div><p class="fine">Hurt? Turn on Rehab mode in Me so rehab days count too.</p>`);
  o.addEventListener("click", e => { const b = e.target.closest("[data-why]"); if (!b) return; CFG.exc[K(T.p, T.w, T.d)] = { why: b.dataset.why, at: ymd(new Date()) }; saveNow(); closeOv(o); toast("Excused — streak safe"); render() }) }
function plates() { const o = sheet("Plate math", `<p class="lead">Per side, on a 45 lb bar.</p><div class="pm"><input inputmode="decimal" placeholder="Total lb" id="pmw"><div id="pmo" class="pmo"></div></div>`);
  const inp = o.querySelector("#pmw"); inp.focus(); inp.oninput = () => { let left = (+inp.value - 45) / 2; const out = []; if (left < 0) { o.querySelector("#pmo").innerHTML = "Less than the bar"; return }
    [45, 35, 25, 10, 5, 2.5].forEach(p => { while (left >= p - 1e-9) { out.push(p); left -= p } }); o.querySelector("#pmo").innerHTML = out.length ? out.map(p => `<span class="plate p${String(p).replace(".", "_")}">${p}</span>`).join("") + (left > .01 ? `<small>+${left.toFixed(1)} won't load evenly</small>` : "") : "Just the bar" } }
function walkSetup() { const W = CFG.walk || {}; const o = sheet("Walk-up song", `<p class="lead">Your song for top sets and PR attempts. The 🎵 button is always in the workout screen, even with sounds off.</p>
  <label class="pill wide">Pick a song file from this phone<input type="file" accept="audio/*" data-walkfile hidden></label>${W.kind === "file" ? `<p class="fine">Current: ${esc(W.name)}</p>` : ""}
  <div class="frow"><label>Start at (sec)<input inputmode="numeric" id="wst" value="${esc(W.start || 0)}"></label><label>Play for (sec)<input inputmode="numeric" id="wln" value="${esc(W.len || 25)}"></label></div>
  <p class="or">or paste a Spotify / Apple Music / YouTube link</p><input class="linkin" id="wurl" placeholder="https://open.spotify.com/track/…" value="${esc(W.kind === "link" ? W.url : "")}">
  <div class="btn2"><button class="pill gold" id="wsave">Save</button><button class="pill" id="wtest">${I.play} Test</button></div>`);
  o.querySelector("[data-walkfile]").onchange = async e => { const f = e.target.files[0]; if (!f) return; await IDB.put("walk", f); CFG.walk = { kind: "file", name: f.name, start: +o.querySelector("#wst").value || 0, len: +o.querySelector("#wln").value || 25 }; saveNow(); toast("Song saved on this phone"); closeOv(o); render() };
  o.querySelector("#wsave").onclick = () => { const u = o.querySelector("#wurl").value.trim(); if (u) CFG.walk = { kind: "link", url: u }; else if (CFG.walk) Object.assign(CFG.walk, { start: +o.querySelector("#wst").value || 0, len: +o.querySelector("#wln").value || 25 }); saveNow(); closeOv(o); render() };
  o.querySelector("#wtest").onclick = () => playWalkup() }
const openWalkSetup = walkSetup;
function keySheet() { sheet("Abbreviations & RPE", ABBR.map(([g, l]) => `<h4 class="kg">${esc(g)}</h4><dl class="kdl">${l.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join("")}</dl>`).join("") + `<h4 class="kg">RPE scale</h4><dl class="kdl">${RPE.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("")}</dl>
  ${EXTRA.rpe ? `<button class="pill ghost wide" data-vid="${esc(EXTRA.rpe)}" data-vt="RPE explained">${I.play} RPE video</button>` : ""}${EXTRA.tempo ? `<button class="pill ghost wide" data-vid="${esc(EXTRA.tempo)}" data-vt="Tempo explained">${I.play} Tempo video</button>` : ""}`, "tall") }
let BIP = null; addEventListener("beforeinstallprompt", e => { e.preventDefault(); BIP = e });
function installSheet() { if (BIP) { BIP.prompt(); BIP = null; return } const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  sheet("Add to Home Screen", ios ? `<ol class="steps"><li>Tap the <b>Share</b> button <span class="kbd">⬆︎</span> at the bottom of Safari</li><li>Scroll and tap <b>Add to Home Screen</b></li><li>Tap <b>Add</b>. Open CU Lifting from your Home Screen from now on.</li></ol>`
    : `<ol class="steps"><li>Tap the <b>⋮</b> menu in Chrome</li><li>Tap <b>Add to Home screen</b> or <b>Install app</b></li><li>Open CU Lifting from your Home Screen.</li></ol>`) }
async function toggleNotif() { if (CFG.notif) { CFG.notif = false; saveNow(); render(); return }
  const sa = matchMedia("(display-mode: standalone)").matches || navigator.standalone, ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (ios && !sa) { toast("On iPhone, add the app to your Home Screen first, then turn this on there.", 4000); installSheet(); return }
  if (!("Notification" in window)) { toast("This browser can't do notifications"); return }
  const p = await Notification.requestPermission(); if (p === "granted") { CFG.notif = true; saveNow(); try { const reg = await navigator.serviceWorker.ready; reg.showNotification("CU Lifting", { body: "You're in. We'll ping you about your squad and records.", icon: "icons/icon-192.png" }) } catch (e) { } } else toast("Notifications blocked in your settings");
  render() }
function editProfile() { const M = CFG.me; const o = sheet("Edit profile", `<form class="wform" data-profile2><div class="frow"><label>First<input name="fn" value="${esc(M.fn)}"></label><label>Last<input name="ln" value="${esc(M.ln)}"></label></div>
  <div class="frow"><label>Jersey #<input name="num" value="${esc(M.num)}" inputmode="numeric"></label><label>Class<select name="cls">${["Fr", "So", "Jr", "Sr", "Grad"].map(c => `<option ${c === M.cls ? "selected" : ""}>${c}</option>`).join("")}</select></label></div>
  <label>Position<select name="pos"><option value="Position" ${M.pos !== "Pitcher" ? "selected" : ""}>Position player</option><option value="Pitcher" ${M.pos === "Pitcher" ? "selected" : ""}>Pitcher</option></select></label><button class="pill gold wide">Save</button></form>`);
  o.querySelector("form").onsubmit = e => { e.preventDefault(); Object.assign(CFG.me, Object.fromEntries(new FormData(e.target))); saveNow(); closeOv(o); render() } }

/* ===================== card tilt ===================== */
function bindCards() { $$("[data-tilt]").forEach(c => { if (c._t) return; c._t = 1; const mv = (x, y) => { const r = c.getBoundingClientRect(), px = (x - r.left) / r.width, py = (y - r.top) / r.height;
  c.style.setProperty("--rx", ((.5 - py) * 16).toFixed(1) + "deg"); c.style.setProperty("--ry", ((px - .5) * 18).toFixed(1) + "deg"); c.style.setProperty("--gx", (px * 100).toFixed(0) + "%"); c.style.setProperty("--gy", (py * 100).toFixed(0) + "%") };
  c.addEventListener("pointermove", e => mv(e.clientX, e.clientY)); c.addEventListener("pointerleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg") }) }) }

/* ===================== events ===================== */
document.addEventListener("submit", e => { if (e.target.matches("[data-profile]")) { e.preventDefault(); saveProfile(e.target) } });
document.addEventListener("click", e => { const t = e.target.closest("button,[data-nav],[data-wk],[data-mph],[data-cap],[data-opencap],a,label,u"); if (!t) return; const D = t.dataset;
  if (D.nav) { if (D.nav !== view || !t.closest("#nav")) go(D.nav); return }
  if ("pvon" in D) { CFG.pview = true; if (!CFG.me) CFG.me = { fn: "Player", ln: "Preview", num: "00", cls: "Fr", pos: "Position", u: "preview", preview: 1 }; saveNow(); $$(".ov").forEach(o => closeOv(o)); view = "today"; render(); scrollTo(0, 0); return }
  if ("pvoff" in D) { CFG.pview = false; if (CFG.me && CFG.me.preview) CFG.me = null; saveNow(); view = "coach"; render(); scrollTo(0, 0); return }
  if ("clogin" in D) { coachLoginSheet(); return } if ("cout" in D) { coachOut(); return } if ("creload" in D) { coachLoad(true); return }
  if (D.csort) { CSORT = D.csort; render(); return } if (D.cpos) { CPOS = D.cpos; render(); return } if (D.cp) { cPlayerSheet(D.cp); return }
  if ("mkplayer" in D) { const o = $("#main"); o.innerHTML = welcomeHTML(); $("#nav").hidden = true; return }
  if (t.closest("[data-seg]")) { const g = t.closest("[data-seg]"); g.querySelectorAll("button").forEach(b => b.classList.toggle("on", b === t)); const f = g.closest("form"); if (f) f.querySelector(`[name="${g.dataset.seg}"]`).value = D.v; return }
  if (D.cap || D.opencap) { e.stopPropagation(); $$(".ov").forEach(o => closeOv(o)); openCapsule(D.cap || D.opencap); return }
  if (D.wk) { const [p, w] = D.wk.split(".").map(Number); weekSheet(p, w); return } if (D.mph != null) { phaseSheet(+D.mph); return }
  if (D.sel) { const [p, w, d] = D.sel.split("."); SEL = { p: +p, w: +w, d }; $$(".ov").forEach(o => closeOv(o)); go("today"); return }
  if ("start" in D) { const T = curT(); startWorkout(T.p, T.w, T.d); return } if ("excuse" in D) { excuseSheet(); return }
  if ("unexc" in D) { const T = curT(); delete CFG.exc[K(T.p, T.w, T.d)]; saveNow(); render(); return }
  if ("install" in D) { installSheet(); return } if ("noinstall" in D) { CFG.installNo = true; saveNow(); render(); return }
  if (D.dap) { const [id, em] = D.dap.split("|"); const d = CFG.daps[id] = CFG.daps[id] || {}; d[em] = !d[em]; save(); if (d[em]) { buzz(10); floatAt(t, em) } t.classList.toggle("on", d[em]); const i = t.querySelector("i"); const n = (+i.textContent || 0) + (d[em] ? 1 : -1); i.textContent = n || ""; return }
  if (D.board) { BOARD = D.board; render(); return }
  if (D.vid) { openVideo(D.vid, D.vt || "Video", D.vids ? JSON.parse(D.vids) : null); return }
  if (D.equip) { const x = REWARDS.find(r => r.id === D.equip), slot = x.k === "frame" ? "frame" : x.k === "title" ? "title" : "badge"; CFG[slot] = CFG[slot] === x.id ? "" : x.id; saveNow(); render(); return }
  if ("cardhow" in D) { cardPreview(); return } if ("cardon" in D) { CFG.card = true; saveNow(); $$(".ov").forEach(o => closeOv(o)); render(); confetti(50); return } if ("cardoff" in D) { CFG.card = false; saveNow(); render(); return }
  if ("editions" in D) { editions(); return } if ("sharecard" in D) { shareImage("card", cardData()); return } if ("editprof" in D) { editProfile(); return }
  if ("walksetup" in D) { walkSetup(); return } if ("key" in D) { keySheet(); return }
  if (D.sw) { const k = D.sw; if (k === "snd") { CFG.snd = !(CFG.snd === true); if (CFG.snd) { ac(); sfx("pop") } } else if (k === "notif") { toggleNotif(); return } else if (k === "feed" || k === "boards") CFG.share[k] = !CFG.share[k]; else if (k === "mode") CFG.mode = CFG.mode === "list" ? "focus" : "list"; else CFG[k] = !CFG[k]; saveNow(); render(); return }
  if ("bwsave" in D) { const v = +$("[data-bwin]").value; if (v > 60 && v < 500) { CFG.bw.push({ d: ymd(new Date()), w: v }); saveNow(); toast("Weigh-in saved (coach only)"); render() } return }
  if ("reset" in D) { if (t.dataset.arm) { localStorage.removeItem(LS); localStorage.removeItem(LSC); location.reload() } else { t.dataset.arm = 1; t.textContent = "Tap again to erase everything on this phone" } return }
  /* workout */
  if (!WO) return;
  if ("woclose" in D) { woClose(); return } if (D.step) { WO.i = +D.step; WO.list = false; woRender(); $(".wob").scrollTop = 0; return }
  if ("wolist" in D) { WO.list = !WO.list; woRender(); return } if ("walk" in D) { playWalkup(t); return }
  if ("sndtog" in D) { CFG.snd = !(CFG.snd === true); saveNow(); if (CFG.snd) { ac(); sfx("pop") } toast(CFG.snd ? "Sounds on" : "Sounds off — walk-up song still works"); woRender(true); return }
  if (D.wu != null) { const r = rec(WO.p, WO.w, WO.d); if (r.u[D.wu]) delete r.u[D.wu]; else { r.u[D.wu] = 1; sfx("clack"); buzz(10) } save(); MEMO = {}; woRender(true); return }
  if ("wuall" in D) { const r = rec(WO.p, WO.w, WO.d), L = PH[WO.p].warm[WO.d] || []; if (Object.keys(r.u).length >= L.length) r.u = {}; else { L.forEach((_, k) => r.u[k] = 1); sfx("pop"); floatAt(t, "+10 XP") } save(); MEMO = {}; woRender(true); return }
  if (D.ck) { check(D.ck, t); return } if (D.try) { const [k, v] = D.try.split("|"); setVal(k, "w", v); woRender(true); return }
  if (D.same) { const k = D.same, [a, b, si] = k.split("."), pr = rec(WO.p, WO.w, WO.d).s[a + "." + b + "." + (si - 1)] || {}; if (pr.w) setVal(k, "w", pr.w); if (pr.r) setVal(k, "r", pr.r); woRender(true); return }
  if (D.var) { const [id, v] = D.var.split("|"); const r = rec(WO.p, WO.w, WO.d); r.v[id] = r.v[id] === v ? "" : v; save(); MEMO = {}; woRender(true); return }
  if (D.hurt) { const r = rec(WO.p, WO.w, WO.d), k = "i" + D.hurt; if (r.x[k]) delete r.x[k]; else r.x[k] = 1; save(); MEMO = {}; woRender(true); return }
  if (D.hold) { const [s, k] = D.hold.split("|"); hold(+s, k); return } if (D.rest) { startRest(+D.rest); return } if (D.clock) { startRest(+D.clock, "AMRAP clock"); return }
  if (D.radd) { if (RT) { RT.end += +D.radd * 1000; RT.tot = Math.max(RT.tot, Math.ceil((RT.end - Date.now()) / 1000)); RT.rang = 0; drawRest() } return } if ("rskip" in D) { stopRest(); return }
  if ("plates" in D) { plates(); return } if ("finish" in D) { finishWorkout(); return } });
document.addEventListener("input", e => { const t = e.target, D = t.dataset; if (!WO) return;
  if (D.w) setVal(D.w, "w", t.value.replace(/[^\d.]/g, "")); else if (D.r) setVal(D.r, "r", t.value); else if (D.note) { const r = rec(WO.p, WO.w, WO.d); r.n[D.note] = t.value; save() } else if (D.rounds) { const r = rec(WO.p, WO.w, WO.d); r.n["r" + D.rounds] = t.value; save() } });
document.addEventListener("change", async e => { const t = e.target; if (t.matches("[data-photo]")) { const f = t.files[0]; if (!f) return; const img = await loadImg(URL.createObjectURL(f)); const c = document.createElement("canvas"), s = 420 / Math.max(img.width, img.height); c.width = img.width * s; c.height = img.height * s; c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); CFG.photo = c.toDataURL("image/jpeg", .82); saveNow(); render() } });
addEventListener("visibilitychange", () => { if (!document.hidden && RT) drawRest() });

/* boot */
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => { });
render();

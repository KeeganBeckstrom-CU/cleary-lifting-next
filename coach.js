/* ============ CU LIFTING · coach sign-in + coach dashboard ============
   Uses the SAME Cleary accounts as the current app (Supabase). The server decides who is a coach (lift_is_coach).
   Read-only: the coach view never writes player data. */
"use strict";
const SUPA_URL = "https://bxnxbyulbjnlkydcmppn.supabase.co", SUPA_KEY = "sb_publishable_8H49HwXFPXTBM4KvjLSGGg_J0J2ZhGI";
const CK = "cln-coach-auth";
let COACH = null; /* {access_token, refresh_token, expires_at, user:{id,email}} */
try { COACH = JSON.parse(localStorage.getItem(CK) || "null") } catch (e) { COACH = null }
let CT = { loaded: false, busy: false, err: "", roster: {}, roles: {}, sums: {}, at: 0 }, CSORT = "att", CPOS = "all";
const isCoach = () => !!COACH;

async function sf(path, opt, tok) { let r; try { r = await fetch(SUPA_URL + path, { method: (opt && opt.method) || "GET", headers: Object.assign({ apikey: SUPA_KEY, "Content-Type": "application/json" }, tok ? { Authorization: "Bearer " + tok } : {}), body: opt && opt.body !== undefined ? JSON.stringify(opt.body) : undefined }) }
  catch (e) { throw { msg: "Can't reach the server. Check your connection." } }
  let j = null; try { const t = await r.text(); j = t ? JSON.parse(t) : null } catch (e) { }
  if (!r.ok) throw { status: r.status, msg: (j && (j.msg || j.error_description || j.message || j.error)) || ("Error " + r.status) }; return j }
function setCoach(j) { COACH = j && j.access_token ? { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_at || Math.floor(Date.now() / 1000) + (j.expires_in || 3600), user: { id: j.user.id, email: j.user.email || "" } } : null;
  try { COACH ? localStorage.setItem(CK, JSON.stringify(COACH)) : localStorage.removeItem(CK) } catch (e) { } }
async function ctok() { if (!COACH) return null; if (COACH.expires_at * 1000 - Date.now() < 60000) { try { const u = COACH.user, j = await sf("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: COACH.refresh_token } }); if (!j.user) j.user = u; setCoach(j) } catch (e) { if (!e.status) throw e; setCoach(null); return null } } return COACH.access_token }
const friendly = m => /invalid login/i.test(m) ? "That password doesn't match. Try again." : /not confirmed/i.test(m) ? "Confirm your email first (check your inbox), then sign in." : /rate limit|security purposes/i.test(m) ? "Too many tries. Wait a minute and try again." : m;

function coachLoginSheet() { const o = sheet("Coach sign in", `<p class="lead">Use your Cleary coach account — the same username or email and password as the current lifting app.</p>
  <form class="wform" id="cform"><label>Username or email<input name="id" autocomplete="username" autocapitalize="none" required></label><label>Password<input name="pw" type="password" autocomplete="current-password" required></label>
  <p class="cerr" id="cerr"></p><button class="pill gold wide" id="cgo">Sign in</button></form><button class="linkb sm" id="cforgot">Forgot password?</button>
  <p class="fine">Only accounts the server marks as coaches get in. The coach view is read-only — it can't change any player's data.</p>`);
  const f = o.querySelector("#cform"), err = t => { o.querySelector("#cerr").textContent = t; const b = o.querySelector("#cgo"); b.disabled = false; b.textContent = "Sign in" };
  f.onsubmit = async e => { e.preventDefault(); const d = Object.fromEntries(new FormData(f)); let id = d.id.trim(); const pw = d.pw; const b = o.querySelector("#cgo"); b.disabled = true; b.textContent = "Signing in…"; o.querySelector("#cerr").textContent = "";
    try { if (!id.includes("@")) { const em = await sf("/rest/v1/rpc/lift_email_for", { method: "POST", body: { uname: id.replace(/^@/, "") } }); if (!em) return err("No account with that username. Check the spelling or use your email."); id = em }
      const j = await sf("/auth/v1/token?grant_type=password", { method: "POST", body: { email: id.toLowerCase(), password: pw } });
      const ok = await sf("/rest/v1/rpc/lift_is_coach", { method: "POST", body: {} }, j.access_token).catch(() => false);
      if (!ok) { try { await sf("/auth/v1/logout", { method: "POST" }, j.access_token) } catch (x) { } return err("That account isn't set up as a coach. Ask the head coach to give you the coach role.") }
      setCoach(j); CT.loaded = false; closeOv(o); toast("Signed in as coach"); view = "coach"; render(); coachLoad() }
    catch (x) { err(friendly(x.msg || "Something went wrong")) } };
  o.querySelector("#cforgot").onclick = async () => { const id = f.querySelector("[name=id]").value.trim(); if (!/^\S+@\S+\.\S+$/.test(id)) return err("Type the email you signed up with above, then tap Forgot password.");
    try { await sf("/auth/v1/recover?redirect_to=" + encodeURIComponent("https://keeganbeckstrom-cu.github.io/cleary-lifting/"), { method: "POST", body: { email: id.toLowerCase() } }); o.querySelector("#cerr").textContent = "If that email has an account, a reset link is on its way." } catch (x) { err(friendly(x.msg)) } } }
async function coachOut() { CFG.pview = false; if (CFG.me && CFG.me.preview) CFG.me = null; saveNow(); try { await sf("/auth/v1/logout", { method: "POST" }, COACH && COACH.access_token) } catch (e) { } setCoach(null); CT = { loaded: false, roster: {}, roles: {}, sums: {} }; view = CFG.me ? "today" : "today"; render() }

async function coll(c, tok) { const rows = await sf("/rest/v1/lift_docs?select=id,data&coll=eq." + encodeURIComponent(c), null, tok); const o = {}; (rows || []).forEach(r => o[r.id] = r.data || {}); return o }
async function coachLoad(force) { if (!COACH || CT.busy) return; if (CT.loaded && !force && Date.now() - CT.at < 120000) return; CT.busy = true; CT.err = ""; if (view === "coach") render();
  try { const t = await ctok(); if (!t) { CT.busy = false; toast("Coach sign-in expired — sign in again"); render(); return }
    const [ro, rl, su] = await Promise.all([coll("roster", t), coll("roles", t), coll("summary", t)]);
    Object.assign(CT, { roster: ro, roles: Object.fromEntries(Object.entries(rl).map(([k, v]) => [k, v.role])), sums: su, loaded: true, at: Date.now() }) }
  catch (e) { CT.err = e.msg || "Couldn't load the team" } CT.busy = false; if (view === "coach") render() }

/* ---------- derive one player from their summary ---------- */
const isoD = s => s ? pd(String(s).slice(0, 10)) : null;
function cPlayers() { const T = findToday(), wkN = PH[T.p].weeks[T.w].n, now = today0(), out = [];
  Object.keys(CT.roster).forEach(id => { if (CT.roles[id] === "coach") return; const R = CT.roster[id] || {}, s = CT.sums[id] || {};
    const name = ((R.fn || "") + " " + (R.ln || "")).trim() || ("@" + (R.u || id.slice(0, 6))); const cur = s.wk === wkN;
    const wd = cur ? (s.wd || 0) : 0, wt = cur ? (s.wt || PH[T.p].days.length) : PH[T.p].days.length; const last = isoD(s.last), ds = last ? Math.round((now - last) / 864e5) : null;
    const bwv = parseFloat(Array.isArray(s.bwh) && s.bwh.length ? (s.bwh[s.bwh.length - 1][1] || s.bwh[s.bwh.length - 1].w || s.bw) : s.bw) || 0;
    let top = 0, topN = ""; (s.lifts || []).filter(L => L.m).forEach(L => (L.h || []).forEach(h => { if (+h[1] > top) { top = +h[1]; topN = L.n } }));
    const inj = Array.isArray(s.inj) ? s.inj.length : (s.inj ? 1 : 0);
    let att = 0; if (wd < wt && ds != null && ds >= 5) att += 2; if (ds == null) att += 3; if (inj) att += 1; if (cur && wd === 0) att += 1;
    out.push({ id, name, pos: R.pos || s.pos || "", wd, wt, ds, last, prs: s.prs || 0, prw: s.prw || 0, sessions: s.sessions || 0, bw: bwv, top, topN, inj, att, s, R }) });
  return out.filter(p => CPOS === "all" || p.pos === CPOS) }
function coachHTML() { if (!COACH) return `<div class="body pad-top">${coachGate()}</div>`;
  const T = findToday(), wkN = PH[T.p].weeks[T.w].n, PL = cPlayers(), n = PL.length, todayISO = ymd(today0());
  const head = topbar("Coach's view", "Week " + wkN + " · " + PH[T.p].short + " · " + (COACH.user.email || ""));
  if (!CT.loaded) return head + `<div class="body"><div class="card cload">${CT.err ? `<b>Couldn't load the team</b><p class="fine">${esc(CT.err)}</p><button class="pill" data-creload>Try again</button>` : `<div class="spin"></div><b>Loading the team…</b>`}</div></div>`;
  const done = PL.filter(p => p.wd >= p.wt).length, lifted = PL.filter(p => p.last && ymd(p.last) === todayISO).length, behind = PL.filter(p => p.wd < p.wt), look = PL.filter(p => p.att >= 2).sort((a, b) => b.att - a.att);
  const avg = n ? Math.round(PL.reduce((a, p) => a + Math.min(1, p.wd / (p.wt || 1)), 0) / n * 100) : 0;
  const S = { att: ["Needs a look", (a, b) => b.att - a.att || (b.ds ?? 99) - (a.ds ?? 99)], name: ["Name", (a, b) => a.name.localeCompare(b.name)], wk: ["This week", (a, b) => b.wd / b.wt - a.wd / a.wt], last: ["Last lift", (a, b) => (a.ds ?? 999) - (b.ds ?? 999)], prs: ["PRs", (a, b) => b.prs - a.prs] };
  const list = PL.slice().sort(S[CSORT][1]);
  const rel = PL.filter(p => p.bw > 60 && p.top > 0).map(p => Object.assign({ rel: p.top / p.bw }, p)).sort((a, b) => b.rel - a.rel);
  const prs = []; PL.forEach(p => (p.s.recent || []).forEach(r => prs.push({ who: p.name, n: r.n, w: r.w, p: r.p, d: r.d, iso: r.iso, check: r.p >= 45 && (r.w - r.p) / r.p > .2 }))); prs.sort((a, b) => (b.iso || "").localeCompare(a.iso || ""));
  let h = head + `<div class="body"><button class="pvcall" data-pvon>${I.me}<span><b>See the player view</b><small>Exactly what your players see — Today, the map, capsules, their card</small></span>${I.fwd}</button><div class="cs4"><div><b>${avg}%</b><small>team done this week</small></div><div><b>${done}<i>/${n}</i></b><small>finished the week</small></div><div><b>${lifted}</b><small>lifted today</small></div><div class="${behind.length ? "warn" : ""}"><b>${behind.length}</b><small>behind</small></div></div>
   <div class="seg">${[["all", "Everyone"], ["Pitcher", "Pitchers"], ["Position", "Position"]].map(([k, l]) => `<button class="${CPOS === k ? "on" : ""}" data-cpos="${k}">${l}</button>`).join("")}</div>`;
  h += `<div class="sec-h"><h2>Needs a look</h2><small>${look.length}</small></div>${look.length ? `<div class="clook">${look.slice(0, 8).map(p => `<button class="clk" data-cp="${esc(p.id)}"><b>${esc(p.name)}</b><span>${p.ds == null ? "Hasn't logged a lift" : p.ds >= 5 ? "No lift in " + p.ds + " days" : ""}${p.inj ? " · hurt/rehab" : ""}${p.wd < p.wt ? " · " + p.wd + "/" + p.wt + " this week" : ""}</span>${I.fwd}</button>`).join("")}</div>` : `<p class="fine">Nobody — everyone's on track.</p>`}`;
  h += `<div class="sec-h"><h2>Players</h2><small>${n}</small></div><div class="csort">${Object.entries(S).map(([k, v]) => `<button class="${CSORT === k ? "on" : ""}" data-csort="${k}">${v[0]}</button>`).join("")}</div>
   <div class="ctable">${list.map(p => `<button class="crow" data-cp="${esc(p.id)}"><span class="cn"><b>${esc(p.name)}</b><small>${p.pos === "Pitcher" ? "P" : p.pos ? "POS" : "—"}${p.inj ? " · 🩹" : ""}</small></span><span class="cw ${p.wd >= p.wt ? "ok" : p.wd ? "mid" : "no"}">${p.wd}/${p.wt}</span><span class="cl2">${p.ds == null ? "—" : p.ds === 0 ? "today" : p.ds + "d ago"}</span><span class="cp">${p.prs}</span></button>`).join("") || `<p class="fine">No players have signed in to the lifting app yet.</p>`}</div>`;
  h += `<div class="sec-h"><h2>Strength to bodyweight</h2><small>coach only</small></div>${rel.length ? `<div class="ctab card">${rel.slice(0, 15).map((p, i) => `<div><span>${i + 1}. ${esc(p.name)} <i>${esc(p.topN)}</i></span><em>${p.rel.toFixed(2)}× <i>${p.top}/${Math.round(p.bw)}</i></em></div>`).join("")}</div>` : `<p class="fine">Shows up once players log bodyweight and a main lift.</p>`}`;
  h += `<div class="sec-h"><h2>Recent PRs</h2><small>${prs.length}</small></div>${prs.length ? `<div class="ctab card">${prs.slice(0, 20).map(r => `<div><span>${esc(r.who)} · ${esc(r.n)} <i>${esc(r.d || "")}</i></span><em>${r.p}→${r.w}${r.check ? ` <b class="chk">check</b>` : ""}</em></div>`).join("")}</div><p class="fine">"Check" = a jump of 20%+ over their last best. Worth a look before it counts as a record.</p>` : `<p class="fine">No PRs logged yet.</p>`}`;
  h += `<div class="btn2"><button class="pill" data-creload>${CT.busy ? "Refreshing…" : "Refresh"}</button><button class="pill ghost" data-cout>Sign out</button></div>
   <p class="fine">Live numbers from players using the current lifting app. Read-only — nothing here changes a player's data.</p></div>`;
  return h }
function coachGate() { return `<div class="card cgate"><div class="cgi">${I.lock}</div><b>Coach sign in</b><p class="fine">Team numbers, who needs a look, strength-to-bodyweight and PR checks.</p><button class="pill gold wide" data-clogin>Sign in as coach</button></div>` }
function cPlayerSheet(id) { const p = cPlayers().find(x => x.id === id) || (() => { const keep = CPOS; CPOS = "all"; const r = cPlayers().find(x => x.id === id); CPOS = keep; return r })(); if (!p) return; const s = p.s;
  const wk = (s.wkh || []).slice(-10).map(x => { const d = Array.isArray(x) ? x[0] : 0; return `<i class="hc ${d >= 3 ? "g" : d ? "m" : "z"}" title="${d}">${d}</i>` }).join("");
  const lifts = (s.lifts || []).filter(L => L.m && (L.h || []).length).slice(0, 10).map(L => { const v = L.h.map(h => +h[1]), mx = Math.max(...v), mn = Math.min(...v);
    const pts = v.map((x, i) => `${(i / Math.max(1, v.length - 1) * 100).toFixed(1)},${(26 - (x - mn) / Math.max(1, mx - mn) * 22).toFixed(1)}`).join(" ");
    return `<div class="lift"><b>${esc(L.n)}</b><svg viewBox="0 0 100 30" preserveAspectRatio="none" fill="none"><polyline points="${pts}"/></svg><em>${mx}<i>lb</i></em></div>` }).join("");
  const sess = (s.sess || []).slice(0, 5).map(x => `<details class="csess"><summary><b>${esc(x.dl)} · Wk ${x.wk}</b><span>${esc(x.dt || "")} · ${x.sets} sets · ${fmt(x.lb || 0)} lb${x.inj ? " · hurt" : ""}</span></summary>${(x.ex || []).map(e => `<div class="cex"><b>${esc(e[0])}</b>${e[1] ? ` <i>${esc(e[1])}</i>` : ""}<span>${esc(e[2] || "")}</span>${e[3] ? `<em>“${esc(e[3])}”</em>` : ""}</div>`).join("")}</details>`).join("");
  sheet(esc(p.name), `<div class="cs4 sm"><div><b>${p.wd}/${p.wt}</b><small>this week</small></div><div><b>${p.ds == null ? "—" : p.ds === 0 ? "Today" : p.ds + "d"}</b><small>last lift</small></div><div><b>${p.sessions}</b><small>workouts</small></div><div><b>${p.prs}</b><small>PRs</small></div></div>
   ${p.bw ? `<p class="lead">Bodyweight <b>${Math.round(p.bw)} lb</b>${p.top ? ` · best main lift ${p.top} lb (${(p.top / p.bw).toFixed(2)}×)` : ""}</p>` : ""}
   ${wk ? `<h4 class="kg">Last 10 weeks · workouts done</h4><div class="heat">${wk}</div>` : ""}${lifts ? `<h4 class="kg">Main lifts</h4><div class="lifts">${lifts}</div>` : ""}
   ${sess ? `<h4 class="kg">Recent workouts</h4>${sess}` : `<p class="fine">No workouts logged yet.</p>`}`, "tall") }

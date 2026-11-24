/* ============ CU LIFTING · core: state, saving, program math ============
   Log format is IDENTICAL to the original app (keys like "p3-w2-d1", fields s/u/n/c/x/v)
   so player accounts can be connected later without moving anything. */
"use strict";
const PH = window.DATA.phases;
const SOFT = window.DATA.soft || [];
const EXTRA = window.DATA.extra || {};
const VAR_OVR = window.VAR_OVR || {};

/* While testing, this app uses its own storage names so it can't touch the live app's data. */
const LS = "cln-2627-v1", LSC = "cln-cfg-v1", LST = "cln-team-v1";
let LOG = {}, CFG = {};
try { LOG = JSON.parse(localStorage.getItem(LS) || "{}") } catch (e) { LOG = {} }
try { CFG = JSON.parse(localStorage.getItem(LSC) || "{}") } catch (e) { CFG = {} }
const CFG_DEF = { me: null, snd: null, walk: null, card: false, notif: false, rehab: false,
  share: { feed: true, boards: true }, exc: {}, caps: {}, inv: [], frame: "", bw: [], coach: false,
  mode: "focus", vw: 0, daps: {}, seen: {}, celebrated: {}, phaseSeen: {}, installNo: false, editions: {} };
for (const k in CFG_DEF) if (CFG[k] === undefined) CFG[k] = JSON.parse(JSON.stringify(CFG_DEF[k]));

let saveT = null;
function save() { clearTimeout(saveT); saveT = setTimeout(saveNow, 150) }
function saveNow() { try { localStorage.setItem(LS, JSON.stringify(LOG)); localStorage.setItem(LSC, JSON.stringify(CFG)) } catch (e) {} ; MEMO = {} }
addEventListener("pagehide", saveNow);

/* ---------- small helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nrm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const LET = "ABCDEFGHIJ";
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const pd = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d) };
const ymd = dt => dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
const nice = dt => MON[dt.getMonth()] + " " + dt.getDate();
const addD = (dt, n) => { const x = new Date(dt); x.setDate(x.getDate() + n); return x };
const today0 = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const fmt = n => Math.round(n).toLocaleString("en-US");
let MEMO = {};
const memo = (k, f) => (k in MEMO ? MEMO[k] : (MEMO[k] = f()));

/* ---------- program navigation ---------- */
const K = (p, w, d) => PH[p].id + "-w" + (w + 1) + "-" + d;
const peek = (p, w, d) => LOG[K(p, w, d)];
function rec(p, w, d) { const k = K(p, w, d); const r = LOG[k] = LOG[k] || {}; ["s", "u", "n", "c", "x", "v"].forEach(f => r[f] = r[f] || {}); return r }
const Wk = (e, w) => e.weeks[Math.min(w, e.weeks.length - 1)];
const skipMsg = (p, w, d) => (PH[p].skip || {})[w + "-" + d] || "";
const ord = (p, w, di) => p * 10000 + w * 10 + di;
function dayDate(p, w, dk) { const Q = PH[p], D = Q.days.find(x => x.k === dk); const ov = Q.dateov && Q.dateov[w + "-" + dk]; if (ov) return pd(ov); if (!D || D.off == null) return null; return addD(pd(Q.weeks[w].mon), D.off) }
const weekEnd = (p, w) => addD(pd(PH[p].weeks[w].mon), 6);
const dayLabel = (p, d) => (PH[p].days.find(D => D.k === d) || {}).l || d;
function rows(W) { if (!W) return []; const out = []; (W.wu || []).forEach(([t, lab]) => out.push({ t, lab, warm: 1 }));
  const solo = W.sets.length === 1 && !W.wu; W.sets.forEach((t, i) => out.push({ t, lab: solo ? "Done" : "Set " + (i + 1), opt: W.min && i >= W.min ? 1 : 0 })); return out }
const need = W => (W.wu || []).length + (W.min || W.sets.length);

/* exercise index across the whole season (same exercise name = same lift) */
const EXIDX = {};
PH.forEach((Q, p) => Q.days.forEach((D, di) => (Q.prog[D.k] || []).forEach((b, bi) => b.ex.forEach((e, ei) => {
  (EXIDX[nrm(e.name)] = EXIDX[nrm(e.name)] || []).push({ p, di, d: D.k, bi, ei, e }) }))));
/* "main" lifts = the ones with warm-up/build-up sets or flagged main (used for Hall of Fame + strength rating) */
const MAIN = Object.keys(EXIDX).filter(k => EXIDX[k].some(x => x.e.weeks.some(W => W && W.wt && (W.main || W.wu))));
const isPower = n => /jump|sprint|throw|slam|toss|skater|bound|hop|plyo|clean|snatch|med ball|mb |explosive|power|broad|vertical|scoop/i.test(n);
const isEngine = n => /bike|row machine|rower|cardio|treadmill|carry|sled|interval|conditioning|shuttle|tempo run|assault/i.test(n);

/* ---------- logging state ---------- */
function exGot(r, W, id) { if (r && r.x && (r.x.inj || r.x["i" + id])) return need(W); let n = 0; rows(W).forEach((_, si) => { const v = r && r.s && r.s[id + "." + si]; if (v && v.d) n++ }); return Math.min(n, need(W)) }
function dayPct(p, w, d) { if (skipMsg(p, w, d)) return null; const Q = PH[p], r = peek(p, w, d), wu = Q.warm[d] || []; let tot = 0, got = 0;
  if (wu.length) { tot++; if (r && r.x && r.x.inj) got += 1; else if (r && r.u) got += Math.min(1, Object.keys(r.u).length / wu.length) }
  (Q.prog[d] || []).forEach((b, bi) => { let pend = null; b.ex.forEach((e, ei) => { const W = Wk(e, w); if (!W) return; const id = bi + "." + ei, t = need(W), g = exGot(r, W, id);
    if (e.or && pend) { const best = Math.max(pend.g, Math.min(g, pend.t)); got += best - pend.g; pend.g = best; return }
    tot += t; got += g; pend = { t, g } }) });
  return tot ? Math.min(1, got / tot) : null }
const isDone = (p, w, d) => { const x = dayPct(p, w, d); return x != null && x >= .999 };
const isExc = (p, w, d) => !!CFG.exc[K(p, w, d)];
function exDone(p, w, d, bi, ei) { const e = PH[p].prog[d][bi].ex[ei], W = Wk(e, w); if (!W) return true; return exGot(peek(p, w, d), W, bi + "." + ei) >= need(W) }
function blockDone(p, w, d, bi) { const b = PH[p].prog[d][bi]; let pend = false, any = false;
  for (let ei = 0; ei < b.ex.length; ei++) { const e = b.ex[ei]; if (!Wk(e, w)) continue; const ok = exDone(p, w, d, bi, ei);
    if (e.or) { if (ok) pend = true; continue } if (ei + 1 < b.ex.length && b.ex[ei + 1].or) { pend = pend || ok; continue }
    if (pend) { pend = false; any = true; continue } if (!ok) return false; any = true } return true }

/* all sessions in order */
const SESS = []; PH.forEach((Q, p) => Q.weeks.forEach((W, w) => Q.days.forEach((D, di) => { if (skipMsg(p, w, D.k)) return;
  SESS.push({ p, w, d: D.k, di, o: ord(p, w, di), date: dayDate(p, w, D.k), due: dayDate(p, w, D.k) || weekEnd(p, w) }) })));

function findToday() { const t = today0(); let hit = null;
  PH.forEach((Q, p) => Q.weeks.forEach((W, w) => { const m = pd(W.mon); if (t >= m && t < addD(m, 7)) hit = { p, w } }));
  if (!hit) { if (t < pd(PH[0].weeks[0].mon)) hit = { p: 0, w: 0, pre: 1 }; else { const lp = PH.length - 1; hit = { p: lp, w: PH[lp].weeks.length - 1, post: 1 } } }
  const Q = PH[hit.p]; let d = null;
  Q.days.forEach(D => { if (d) return; if (skipMsg(hit.p, hit.w, D.k)) return; const dt = dayDate(hit.p, hit.w, D.k);
    if (dt) { if (dt >= t && !(isDone(hit.p, hit.w, D.k) && +dt !== +t)) d = D.k } else if (!isDone(hit.p, hit.w, D.k) && !isExc(hit.p, hit.w, D.k)) d = D.k });
  if (!d) { const ok = Q.days.filter(D => !skipMsg(hit.p, hit.w, D.k)); d = ok[ok.length - 1].k }
  return { p: hit.p, w: hit.w, d, pre: hit.pre, post: hit.post } }

/* ---------- numbers: volume, top sets, PRs ---------- */
function repsOf(R, v) { const n = parseInt(v.r) || String(R.t).replace(/^x/, "").split(/[-,+ ]/).map(x => parseInt(x)).filter(x => x > 0).slice(0, /,/.test(R.t) ? 9 : 1).reduce((a, x) => a + x, 0) || 1; return /sec/.test(R.t) ? 1 : n }
function sessionStats(p, w, d) { const r = peek(p, w, d) || {}; let sets = 0, lb = 0;
  (PH[p].prog[d] || []).forEach((b, bi) => b.ex.forEach((e, ei) => { const W = Wk(e, w); if (!W) return; rows(W).forEach((R, si) => { const v = r.s && r.s[bi + "." + ei + "." + si]; if (!v || !v.d) return; sets++; if (+v.w > 0) lb += +v.w * repsOf(R, v) }) }));
  return { sets, lb } }
function topSet(p, w, d, bi, ei) { const r = peek(p, w, d), e = PH[p].prog[d][bi].ex[ei], W = Wk(e, w); if (!r || !r.s || !W) return 0; let t = 0;
  rows(W).forEach((R, si) => { if (R.warm) return; const v = r.s[bi + "." + ei + "." + si]; if (v && v.d && +v.w > t) t = +v.w }); return t }
function varAt(p, w, d, bi, ei) { const r = peek(p, w, d); return (r && r.v && r.v[bi + "." + ei]) || "" }

/* chronological top sets for every lift → PR events */
function prEvents() { return memo("pr", () => { const best = {}, out = [];
  SESS.forEach(S => (PH[S.p].prog[S.d] || []).forEach((b, bi) => b.ex.forEach((e, ei) => { const W = Wk(e, S.w); if (!W || !W.wt) return;
    const t = topSet(S.p, S.w, S.d, bi, ei); if (!t) return; const key = nrm(e.name) + "|" + varAt(S.p, S.w, S.d, bi, ei), prev = best[key];
    if (prev != null && t > prev) { const jump = (t - prev) / prev; out.push({ name: e.name, w: t, prev, p: S.p, wk: S.w, d: S.d, bi, ei, o: S.o, check: jump > .2 && prev >= 45, dt: sessDate(S.p, S.w, S.d) }) }
    if (prev == null || t > prev) best[key] = t }))); return out }) }
function bestBefore(name, variant, o) { let b = 0; (EXIDX[nrm(name)] || []).forEach(x => PH[x.p].weeks.forEach((_, w) => { const oo = ord(x.p, w, x.di); if (oo >= o) return;
  if (variant && varAt(x.p, w, x.d, x.bi, x.ei) && varAt(x.p, w, x.d, x.bi, x.ei) !== variant) return; b = Math.max(b, topSet(x.p, w, x.d, x.bi, x.ei)) })); return b }
function sessDate(p, w, d) { const r = peek(p, w, d); let when = ""; Object.values((r && r.s) || {}).forEach(v => { if (v.d && v.t && (!when || v.t < when)) when = v.t }); return when ? pd(when) : (dayDate(p, w, d) || pd(PH[p].weeks[w].mon)) }
/* last time this exact lift (same slot of the program, earlier week) → for "try" suggestions */
function lastFor(p, w, d, bi, ei, si) { const e = PH[p].prog[d][bi].ex[ei], cv = varAt(p, w, d, bi, ei), o = ord(p, w, PH[p].days.findIndex(D => D.k === d)); let best = null;
  (EXIDX[nrm(e.name)] || []).forEach(x => PH[x.p].weeks.forEach((_, ww) => { const oo = ord(x.p, ww, x.di); if (oo >= o) return; const r = peek(x.p, ww, x.d); if (!r || !r.s) return;
    const vv = varAt(x.p, ww, x.d, x.bi, x.ei); if (cv && vv && cv !== vv) return;
    const v = r.s[x.bi + "." + x.ei + "." + si] || null; if (v && v.d && (v.w || v.r) && (!best || oo > best.o)) best = { o: oo, v } })); return best && best.v }
function suggest(p, w, d, bi, ei, si, R) { const L = lastFor(p, w, d, bi, ei, si); if (!L || !(+L.w > 0)) return null; const W = Wk(PH[p].prog[d][bi].ex[ei], w);
  const inc = +L.w >= 135 ? 10 : 5; const harder = W && /heavier|increase/i.test((W.note || "")); return { last: L, next: R.warm ? +L.w : +L.w + (harder ? inc : inc) } }

/* ---------- streaks (lift days, not calendar days; excused days never break it) ---------- */
function streakInfo() { return memo("streak", () => { const t = today0(); let cur = 0, best = 0, run = 0;
  for (const S of SESS) { const ok = isDone(S.p, S.w, S.d) || isExc(S.p, S.w, S.d); const past = S.due < t;
    if (ok) { run++; best = Math.max(best, run) } else if (past) run = 0; else break }
  cur = run; return { cur, best } }) }

/* ---------- weeks + capsules ---------- */
function weekState(p, w) { const ds = PH[p].days.filter(D => !skipMsg(p, w, D.k)); const done = ds.filter(D => isDone(p, w, D.k) || isExc(p, w, D.k)).length; return { done, tot: ds.length, full: done === ds.length, real: ds.filter(D => isDone(p, w, D.k)).length } }
function allWeeks() { const out = []; PH.forEach((Q, p) => Q.weeks.forEach((W, w) => out.push({ p, w, n: W.n, mon: pd(W.mon), rep: W.rep }))); return out }
function earnedCapsules() { return allWeeks().filter(x => { const s = weekState(x.p, x.w); return s.full && s.real > 0 }).map(x => PH[x.p].id + "-w" + (x.w + 1)) }
const unopened = () => earnedCapsules().filter(k => !CFG.caps[k]);
function phaseSessions(p) { let done = 0, tot = 0; PH[p].weeks.forEach((_, w) => PH[p].days.forEach(D => { const x = dayPct(p, w, D.k); if (x == null) return; tot++; if (x >= .999) done++ })); return { done, tot } }
const phaseWon = p => { const s = phaseSessions(p); return s.tot && s.done === s.tot };

/* ---------- XP + levels (consistency pays the most) ---------- */
const LEVELS = [["Walk-On", 0], ["Scout Team", 300], ["Starter", 900], ["All-Conference", 2000], ["All-American", 4000], ["Cougar Legend", 7000]];
function xpInfo() { return memo("xp", () => { let sets = 0, days = 0, warm = 0;
  SESS.forEach(S => { const r = peek(S.p, S.w, S.d); if (!r) return; sets += sessionStats(S.p, S.w, S.d).sets; if (isDone(S.p, S.w, S.d)) days++; if (r.u && Object.keys(r.u).length) warm++ });
  const prs = prEvents().length, weeks = earnedCapsules().length, st = streakInfo().best;
  const parts = [["Sets logged", sets * 5], ["Workouts finished", days * 60], ["Warm-ups done", warm * 10], ["Full weeks", weeks * 120], ["Streak bonus", st * 15], ["PRs", prs * 30], ["Demo videos watched", CFG.vw * 5]];
  const xp = parts.reduce((a, x) => a + x[1], 0); let li = 0; LEVELS.forEach((L, i) => { if (xp >= L[1]) li = i });
  const nx = LEVELS[li + 1]; return { xp, li, name: LEVELS[li][0], next: nx ? nx[1] : null, nextName: nx ? nx[0] : null, base: LEVELS[li][1], parts } }) }

/* ---------- player card ratings (all from YOUR OWN numbers; no bodyweight) ---------- */
function cardRatings(upto) { /* upto = last phase index included */
  const lim = upto == null ? 1e9 : upto; let mainG = [], pw = [0, 0], en = [0, 0], mob = [0, 0], all = [0, 0]; const t = today0();
  MAIN.forEach(k => { const tops = []; EXIDX[k].forEach(x => { if (x.p > lim) return; PH[x.p].weeks.forEach((_, w) => { const v = topSet(x.p, w, x.d, x.bi, x.ei); if (v) tops.push({ o: ord(x.p, w, x.di), v }) }) });
    if (tops.length > 1) { tops.sort((a, b) => a.o - b.o); const first = tops[0].v, best = Math.max(...tops.map(q => q.v)); if (first > 0) mainG.push((best - first) / first) } });
  SESS.forEach(S => { if (S.p > lim || S.due > addD(t, 0) && !peek(S.p, S.w, S.d)) return; const r = peek(S.p, S.w, S.d), Q = PH[S.p];
    all[1]++; if (isDone(S.p, S.w, S.d) || isExc(S.p, S.w, S.d)) all[0]++;
    const wu = Q.warm[S.d] || []; if (wu.length) { mob[1]++; if (r && r.u) mob[0] += Math.min(1, Object.keys(r.u).length / wu.length) }
    (Q.prog[S.d] || []).forEach((b, bi) => b.ex.forEach((e, ei) => { const W = Wk(e, S.w); if (!W) return; const got = exGot(r, W, bi + "." + ei) / need(W);
      if (isPower(e.name)) { pw[1]++; pw[0] += got } if (isEngine(e.name) || b.amrap) { en[1]++; en[0] += got } })) });
  const sc = (a, def) => a[1] ? Math.round(50 + 49 * a[0] / a[1]) : def;
  const gain = mainG.length ? mainG.reduce((a, x) => a + x, 0) / mainG.length : 0;
  const st = streakInfo().cur;
  const R = { STR: mainG.length ? clamp(Math.round(55 + gain * 110), 50, 99) : 50, PWR: sc(pw, 50), ENGINE: sc(en, 50), MOBILITY: sc(mob, 50), GRIND: clamp(sc(all, 50) + Math.min(6, Math.floor(st / 3)), 50, 99) };
  const ovr = Math.round(Object.values(R).reduce((a, x) => a + x, 0) / 5);
  const rar = ovr >= 90 ? ["Cougar Legend", "leg"] : ovr >= 80 ? ["Foil", "foil"] : ovr >= 70 ? ["Rare", "rare"] : ["Base", "base"];
  return { R, ovr, rar, gainPct: Math.round(gain * 100), n: { main: mainG.length, pw: pw[1], en: en[1] } } }

/* ---------- capsule rewards (cosmetic only; fixed per week, no re-rolls) ---------- */
const REWARDS = [
  { id: "f-navy", k: "frame", n: "Navy Steel frame", r: "c" }, { id: "f-crim", k: "frame", n: "Crimson frame", r: "c" }, { id: "f-night", k: "frame", n: "Night Game frame", r: "c" },
  { id: "f-ice", k: "frame", n: "Winter Iron frame", r: "c" }, { id: "f-gold", k: "frame", n: "Gold Rush frame", r: "r" }, { id: "f-claw", k: "frame", n: "Cougar Claw holo", r: "l" },
  { id: "t-iron", k: "title", n: "Iron Sharpens Iron", r: "c" }, { id: "t-early", k: "title", n: "First One In", r: "c" }, { id: "t-grind", k: "title", n: "Built in the Dark", r: "c" },
  { id: "t-quiet", k: "title", n: "Quiet Work", r: "c" }, { id: "t-dawg", k: "title", n: "Certified Dawg", r: "r" }, { id: "t-standard", k: "title", n: "The Cleary Standard", r: "r" },
  { id: "t-legend", k: "title", n: "Weight Room Legend", r: "l" }, { id: "b-lights", k: "badge", n: "Under the Lights badge", r: "r" }, { id: "b-claw", k: "badge", n: "Claw Mark badge", r: "c" },
  { id: "b-flame", k: "badge", n: "Eternal Flame badge", r: "l" }, { id: "b-anvil", k: "badge", n: "Anvil badge", r: "c" }, { id: "b-bolt", k: "badge", n: "Lightning badge", r: "r" }];
function hashStr(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
function rewardFor(key) { const h = hashStr(key + "|" + ((CFG.me && CFG.me.u) || "me")); const roll = h % 100; const tier = roll < 6 ? "l" : roll < 32 ? "r" : "c";
  const pool = REWARDS.filter(x => x.r === tier); let pick = pool[(h >>> 8) % pool.length];
  if (CFG.inv.includes(pick.id)) { const rest = REWARDS.filter(x => x.r === tier && !CFG.inv.includes(x.id)); if (rest.length) pick = rest[(h >>> 12) % rest.length] } return pick }

/* ---------- sample team (until real accounts connect) ---------- */
const TEAM_N = ["Mason R.", "Tyler B.", "Jake W.", "Caden M.", "Luke H.", "Ethan P.", "Brody K.", "Nolan S.", "Gavin T.", "Owen D.", "Carter L.", "Drew A.", "Ty F.", "Cole V.", "Hunter G.", "Logan J.", "Austin C.", "Blake N.", "Reid O.", "Jace E.", "Parker Z.", "Wyatt I.", "Sam Q.", "Eli U.", "Grant Y.", "Ryan X.", "Max B.", "Chase M.", "Dylan F.", "Trey K."];
function rng(seed) { let s = seed >>> 0; return () => { s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909); s ^= s >>> 16; return (s >>> 0) / 4294967296 } }
function sampleTeam() { return memo("team", () => { const T = findToday(), out = []; const curO = ord(T.p, T.w, 0);
  TEAM_N.forEach((name, i) => { const R = rng(1000 + i * 77), rel = .55 + R() * .45; const pos = i % 2 ? "Pitcher" : "Position";
    let done = 0, due = 0, st = 0, run = 0, vol = 0;
    SESS.forEach(S => { if (S.o >= curO) return; due++; if (R() < rel) { done++; run++; st = run; vol += 6000 + R() * 9000 } else run = 0 });
    const wkDone = Math.min(PH[T.p].days.length, Math.floor(R() * (PH[T.p].days.length + 1) * rel + .3));
    const bw = Math.round(170 + R() * 60), sq = Math.round(bw * (1.1 + R() * .9) / 5) * 5, gain = Math.round(4 + R() * 22 * rel);
    out.push({ id: "s" + i, name, pos, comp: due ? done / due : 0, streak: st, vol, wkDone, todayDone: R() < .55 * rel + .1, bw, top: sq, gain, cls: ["Fr", "So", "Jr", "Sr"][i % 4] }) });
  return out }) }
function myRow() { const T = findToday(), due = SESS.filter(S => S.due < today0()); const done = due.filter(S => isDone(S.p, S.w, S.d) || isExc(S.p, S.w, S.d)).length;
  let vol = 0; SESS.forEach(S => { vol += sessionStats(S.p, S.w, S.d).lb });
  const c = cardRatings(); const bw = latestBW();
  let top = 0; MAIN.forEach(k => EXIDX[k].forEach(x => PH[x.p].weeks.forEach((_, w) => { top = Math.max(top, topSet(x.p, w, x.d, x.bi, x.ei)) })));
  return { id: "me", me: 1, name: myName(), pos: (CFG.me && CFG.me.pos) || "Position", comp: due.length ? done / due.length : 1, streak: streakInfo().cur, vol, wkDone: weekState(T.p, T.w).done,
    todayDone: isDone(T.p, T.w, T.d), bw: bw || 0, top, gain: c.gainPct, cls: (CFG.me && CFG.me.cls) || "" } }
const myName = () => CFG.me ? (CFG.me.fn + " " + (CFG.me.ln || "").slice(0, 1) + ".").trim() : "You";
const latestBW = () => { const all = (CFG.bw || []).concat(typeof nutWeighIns === "function" ? nutWeighIns() : []); const b = all.slice().sort((a, b) => a.d < b.d ? 1 : -1)[0]; return b ? +b.w : 0 };
function teamRows() { const me = myRow(), T = sampleTeam().slice(); T.push(me); return T }
function feedItems() { return memo("feed", () => { const out = [], R = rng(4242), Tm = sampleTeam(); const now = Date.now();
  const lifts = ["Trap Bar Deadlift", "Front Squat", "DB Bench Press", "RFE Split Squat", "Chin-Ups", "Landmine Press", "Hex Bar Jump"];
  for (let i = 0; i < 9; i++) { const t = Tm[Math.floor(R() * Tm.length)], kind = R(); const ago = Math.floor(R() * 40 * 3600e3) + i * 1800e3;
    if (kind < .5) { const l = lifts[Math.floor(R() * lifts.length)], w = Math.round((135 + R() * 200) / 5) * 5; out.push({ id: "f" + i, who: t.name, kind: "pr", txt: `PR on ${l}`, big: w + " lb", up: "+" + (5 + Math.floor(R() * 4) * 5), at: now - ago }) }
    else if (kind < .75) out.push({ id: "f" + i, who: t.name, kind: "streak", txt: "hit a " + (5 + Math.floor(R() * 4) * 5) + "-workout streak", at: now - ago });
    else if (kind < .9) out.push({ id: "f" + i, who: t.name, kind: "week", txt: "finished the week — capsule earned", at: now - ago });
    else out.push({ id: "f" + i, who: t.name, kind: "card", txt: "card upgraded to Rare", at: now - ago }) }
  if (CFG.share.feed) prEvents().slice(-4).forEach(e => out.push({ id: "me-" + e.o + "-" + e.bi + e.ei, who: myName(), me: 1, kind: "pr", txt: "PR on " + e.name, big: e.w + " lb", up: "+" + (e.w - e.prev), at: e.dt.getTime() + 12 * 3600e3 }));
  return out.sort((a, b) => b.at - a.at) }) }
const ago = t => { const m = Math.max(1, Math.round((Date.now() - t) / 60000)); return m < 60 ? m + "m" : m < 1440 ? Math.round(m / 60) + "h" : Math.round(m / 1440) + "d" };

/* ---------- abbreviations / key (same as original app) ---------- */
const ABBR = [["In this program", [["x8", "8 reps (the number after x is reps)"], ["3 × 10", "3 sets of 10 reps"], ["ea. / e", "Each side (each leg, arm, side or direction)"], ["E/W/L", "Each way, each leg"], ["RM", "Rep Max — the weight you max out at for that number of reps (5RM = you couldn't do a 6th rep)"], ["3,3,3", "Cluster set — 3 reps, rest 10-15 sec, 3 reps, rest 10-15 sec, 3 reps. That's one set."], ["WU", "Warm-up set"], ["lb", "Pounds"], ["yd", "Yards"], ["sec / s", "Seconds"], ["RPE", "Rate of Perceived Exertion — how hard the set felt, 1-10 (see scale below)"], ["RFE", "Rear Foot Elevated"], ["SL", "Single Leg"], ["SA", "Single Arm"], ["DB", "Dumbbell"], ["BB", "Barbell"], ["MB", "Medicine Ball"], ["LM", "Landmine"], ["SB", "Stability Ball"], ["RDL", "Romanian Deadlift"], ["U.H.", "Underhand (palms facing you)"], ["OH", "Over head"], ["1/2 Kneel.", "Half-kneeling (one knee down)"], ["Stg.", "Staggered (stance)"], ["TRX", "Suspension trainer straps"], ["I-Y-T-L", "Arm positions shaped like those letters"], ["Rev.", "Reverse"], ["Supp.", "Supported"], ["Elev.", "Elevated"], ["fwd-bkwd", "Forward and backward"], ["L/R", "Left and right"], ["Superset", "2 exercises done back-to-back (B1 → B2), then repeat"], ["Circuit", "3+ exercises done back-to-back, then repeat"], ["Round", "One set of every exercise in the block"]]],
 ["Other terms on the coach's sheet", [["BW", "Bodyweight"], ["Alt", "Alternating"], ["FFE", "Front Foot Elevated"], ["Contralateral", "Opposite arm & leg (ex: L arm + R leg)"], ["AMRAP", "As Many Reps/Rounds As Possible"], ["EMOM", "Every Minute On the Minute"], ["ISO", "Isometric hold (HOLD THE POSITION)"], ["ECC", "Eccentric (SLOW INTO THE STRETCHED POSITION)"]]]];
const RPE = [["10", "All out, max effort. No reps left."], ["9", "Very hard. 1 rep left."], ["8", "Hard. 2 reps left. Get a spotter!"], ["7", "Moderate-hard. 3 reps left."]];

/* ---------- plain-language set text (ported) ---------- */
function parseT(t, e) { const s = String(t).trim().replace(/^x\s*/, ""); let m; const side = e && /sprint|shuffle|crawl|carry|hip flip/i.test(e.name) ? "way" : "side";
  if (m = /^(\d+(?:-\d+)?)\s*RM(\s*ea\.?)?$/i.exec(s)) return { big: m[1] + " RM", small: m[2] ? "each side" : "", rm: 1 };
  if (m = /^max time(\s*ea\.?)?$/i.exec(s)) return { big: "MAX", small: "time" + (m[1] ? " · each side" : ""), maxt: 1 };
  if (m = /^(\d+)\s*E\/W\/L$/i.exec(s)) return { big: m[1], small: "each way, each leg" };
  if (m = /^([\d\-]+)\s*sec(\s*ea\.?)?$/i.exec(s)) { const n = +m[1].split("-").pop(); return { big: m[1] + "s", small: m[2] ? "each side" : "", secs: n, sides: !!m[2] } }
  if (m = /^([\d\-]+)\s*yd(\s*ea\.?)?$/i.exec(s)) return { big: m[1] + " yd", small: m[2] ? "each way" : "" };
  if (m = /^(\d[\d\-+,]*)\s*(ea\.?|e)?\s*(leg|way|side)?\s*(\(.*\))?$/i.exec(s)) { const each = !!m[2];
    return { big: m[1], small: (each ? "each " + (m[3] || side).toLowerCase() : /,/.test(m[1]) ? "cluster" : m[1] === "1" ? "rep" : "reps") + (m[4] ? " " + m[4] : ""), each } }
  return { big: s, small: "", raw: 1 } }
const tail = p => p.small ? " " + (p.small === "cluster" ? "(cluster)" : p.small) : "";
function setsPhrase(W, e) { if (W.rx) return W.rx; const Q = W.sets.map(t => parseT(t, e)), n = W.sets.length, same = Q.every(q => q.big === Q[0].big && q.small === Q[0].small); const cnt = W.min ? W.min + "-" + n : n;
  if (n === 1 && Q[0].raw) return Q[0].big; if (n === 1) return Q[0].big + tail(Q[0]); if (same) return `${cnt} sets × ${Q[0].big}${tail(Q[0])}`;
  const es = Q.some(q => q.each || /each side/.test(q.small)); return `${cnt} sets: ${Q.map(q => q.big).join(", ")}${es ? " · each side" : ""}` }
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
function variantsOf(e) { if (e._vo !== undefined) return e._vo; let o = VAR_OVR[nrm(e.name)] || null;
  if (!o && e.opts) { const L = e.opts.filter(([a]) => /^\s*([A-D]\)|OPTION \d+:)\s*$/i.test(a)); if (L.length > 1) o = L.map(([, t]) => t.split(/\s+[—×]\s+/)[0].trim()) }
  if (!o && /\s\(or\)\s/i.test(e.name)) o = e.name.split(/\s+\(or\)\s+/i).map(s => s.trim());
  return e._vo = o && o.length > 1 ? o : null }
function restSecs(b) { if (b.rs) return b.rs; const m = /rest\s+(?:less than\s+)?(\d+)(?::(\d+))?(?:\s*-\s*(\d+)(?::(\d+))?)?\s*(sec|min)?/i.exec(b.rest || ""); if (!m) return 60;
  let a = m[2] != null ? (+m[1]) * 60 + (+m[2]) : +m[1]; if (/min/i.test(m[5] || "") && m[2] == null) a *= 60; return clamp(a, 15, 300) }
function ytId(url) { return (/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/.exec(url || "") || [])[1] }

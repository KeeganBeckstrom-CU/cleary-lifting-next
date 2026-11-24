/* ============ CU LIFTING · effects: sound, haptics, celebrations, walk-up song, share images ============ */
"use strict";
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- sound (synthesized, no files; only when the player said yes) ---------- */
let AC = null;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { } } if (AC && AC.state === "suspended") AC.resume(); return AC }
function tone(f, d, type, vol, when) { const a = ac(); if (!a) return; const t = a.currentTime + (when || 0), o = a.createOscillator(), g = a.createGain();
  o.type = type || "sine"; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .2, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .05) }
function noise(d, vol, f0, f1, attack) { const a = ac(); if (!a) return; const n = a.sampleRate * d, b = a.createBuffer(1, n, a.sampleRate), x = b.getChannelData(0);
  for (let i = 0; i < n; i++) x[i] = Math.random() * 2 - 1; const s = a.createBufferSource(); s.buffer = b; const fl = a.createBiquadFilter(); fl.type = "bandpass";
  fl.frequency.setValueAtTime(f0, a.currentTime); fl.frequency.linearRampToValueAtTime(f1 || f0, a.currentTime + d); fl.Q.value = .7; const g = a.createGain();
  g.gain.setValueAtTime(0, a.currentTime); g.gain.linearRampToValueAtTime(vol, a.currentTime + (attack || .01)); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + d);
  s.connect(fl).connect(g).connect(a.destination); s.start() }
const SFX = {
  clack() { noise(.07, .5, 2400); tone(160, .08, "square", .08) },
  pop() { tone(880, .09, "triangle", .12); tone(1320, .12, "triangle", .08, .05) },
  stamp() { noise(.18, .7, 300, 120); tone(90, .2, "sine", .3) },
  beep() { tone(1046, .14, "square", .1); tone(1046, .14, "square", .1, .22); tone(1568, .35, "square", .12, .44) },
  roar() { noise(2.6, .32, 600, 1400, .6); noise(2.2, .18, 2400, 3000, .4); [523, 659, 784].forEach((f, i) => tone(f, .5, "sawtooth", .05, .2 + i * .12)) },
  level() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .3, "triangle", .14, i * .1)) },
  lights() { [0, .25, .5, .75].forEach(t => noise(.12, .55, 900, 300)); tone(55, 1.4, "sine", .25, .1) },
  open() { noise(.9, .3, 300, 4000, .5); [784, 988, 1175, 1568].forEach((f, i) => tone(f, .4, "sine", .1, .6 + i * .09)) }
};
let DEMO_SND = true, IN_TOUR = false;
function sfx(name) { if ((CFG.snd === true || (IN_TOUR && DEMO_SND)) && SFX[name]) try { SFX[name]() } catch (e) { } }
function buzz(p) { if (CFG.snd !== false && navigator.vibrate) try { navigator.vibrate(p || 18) } catch (e) { } }

/* ---------- toasts + floating XP ---------- */
function toast(msg, ms) { const t = document.createElement("div"); t.className = "toast"; t.innerHTML = msg; document.body.appendChild(t); setTimeout(() => t.classList.add("out"), ms || 2200); setTimeout(() => t.remove(), (ms || 2200) + 400) }
function floatAt(el, txt, cls) { if (!el) return; const r = el.getBoundingClientRect(), f = document.createElement("div"); f.className = "fly " + (cls || ""); f.textContent = txt;
  f.style.left = (r.left + r.width / 2) + "px"; f.style.top = (r.top) + "px"; document.body.appendChild(f); setTimeout(() => f.remove(), 1300) }
function confetti(n, el) { if (RM) return; const box = el || document.body, c = document.createElement("div"); c.className = "conf"; const cols = ["#B30838", "#F3C34A", "#ffffff", "#3A78C2", "#E8274F"];
  for (let i = 0; i < (n || 80); i++) { const p = document.createElement("i"); p.style.left = Math.random() * 100 + "%"; p.style.background = cols[i % cols.length];
    p.style.animationDuration = (1.8 + Math.random() * 1.8) + "s"; p.style.animationDelay = (Math.random() * .5) + "s"; p.style.transform = `rotate(${Math.random() * 360}deg)`; c.appendChild(p) }
  box.appendChild(c); setTimeout(() => c.remove(), 4200) }

/* ---------- overlays ---------- */
function overlay(html, cls, onClose) { const o = document.createElement("div"); o.className = "ov " + (cls || ""); o.innerHTML = html; document.body.appendChild(o);
  requestAnimationFrame(() => o.classList.add("on")); o.addEventListener("click", e => { if (e.target === o || e.target.closest("[data-close]")) closeOv(o, onClose) }); return o }
function closeOv(o, cb) { if (!o || !o.parentNode) return; o.classList.remove("on"); setTimeout(() => o.remove(), 260); cb && cb() }
function sheet(title, body, cls) { return overlay(`<div class="sheet ${cls || ""}"><div class="sh"><b>${title}</b><button class="x" data-close aria-label="Close">✕</button></div><div class="sb">${body}</div></div>`, "bottom") }

/* PR moment */
function showPR(name, w, prev) { sfx("roar"); buzz([30, 60, 30, 60, 90]);
  const o = overlay(`<div class="prburst"><div class="prrays"></div><img src="img/cu.png" alt=""><div class="prtxt">PR</div><div class="prl">New personal record</div><div class="prn">${esc(name)}</div><div class="prw">${w} <small>lb</small></div><div class="pru">+${w - prev} lb over your best</div><button class="pill gold" data-sharepr>Share it</button><button class="pill ghost" data-close>Back to work</button></div>`, "center prov");
  confetti(70, o); o.querySelector("[data-sharepr]").onclick = () => shareImage("pr", { name, w, prev }); setTimeout(() => closeOv(o), 6500) }

/* exercise DONE stamp */
function stamp(el) { if (!el) return; sfx("stamp"); buzz(40); const s = document.createElement("div"); s.className = "bigstamp"; s.textContent = "DONE"; el.appendChild(s); setTimeout(() => s.classList.add("rest"), 700) }

/* day finish: stadium lights flicker on + scoreboard */
function lightsOn(stats, after) { sfx("lights"); buzz([60, 80, 60]); setTimeout(() => sfx("roar"), 1300);
  const towers = [0, 1, 2, 3].map(i => `<div class="tower t${i}"><div class="bank">${"<i></i>".repeat(12)}</div><div class="pole"></div></div>`).join("");
  const o = overlay(`<div class="stadium"><div class="beams"></div>${towers}<div class="sboard"><div class="sbcrest">${miniCrest(84)}</div><div class="sbh">CLEARY <span>·</span> FINAL</div>
    <div class="sbrow"><div><b data-count="${stats.sets}">0</b><span>Sets</span></div><div><b data-count="${Math.round(stats.lb)}">0</b><span>Pounds moved</span></div><div><b data-count="${stats.xp}">0</b><span>XP</span></div></div>
    <div class="sbrow two"><div><b>${stats.prs}</b><span>PRs</span></div><div><b>🔥 ${stats.streak}</b><span>Streak</span></div></div>
    ${stats.ghost ? `<div class="sbghost ${stats.beat ? "" : "short"}">${stats.ghost}</div>` : ""}
    <div class="sbbtns"><button class="pill gold" data-shareday>Share</button><button class="pill" data-close>Done</button></div></div></div>`, "center lights", after);
  setTimeout(() => { $$(".lights [data-count]").forEach(countUp); confetti(90, o) }, RM ? 0 : 1250);
  o.querySelector("[data-shareday]").onclick = () => shareImage("day", stats) }
function countUp(el) { const to = +el.dataset.count, t0 = performance.now(), d = RM ? 1 : 900; (function f(t) { const k = Math.min(1, (t - t0) / d); el.textContent = fmt(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f) })(t0) }

/* level up */
function levelUp(name) { sfx("level"); buzz([40, 40, 120]); const o = overlay(`<div class="lvup"><div class="lvring"></div><small>Level up</small><b>${esc(name)}</b><button class="pill gold" data-close>Let's go</button></div>`, "center"); confetti(60, o) }

/* ---------- walk-up song: a file saved on this phone (IndexedDB) or a link ---------- */
const IDB = { db: null, open() { return this.db ? Promise.resolve(this.db) : new Promise((res, rej) => { const r = indexedDB.open("cln-media", 1); r.onupgradeneeded = () => r.result.createObjectStore("f"); r.onsuccess = () => res(this.db = r.result); r.onerror = rej }) },
  async put(k, v) { const db = await this.open(); return new Promise(r => { const t = db.transaction("f", "readwrite"); t.objectStore("f").put(v, k); t.oncomplete = r }) },
  async get(k) { const db = await this.open(); return new Promise(r => { const q = db.transaction("f").objectStore("f").get(k); q.onsuccess = () => r(q.result); q.onerror = () => r(null) }) } };
let WALK = null;
async function playWalkup(btn) { const W = CFG.walk; if (!W) { openWalkSetup(); return }
  if (W.kind === "link") { window.open(W.url, "_blank", "noopener"); return }
  if (WALK && !WALK.paused) { fadeOut(WALK); return }
  const blob = await IDB.get("walk"); if (!blob) { openWalkSetup(); return }
  WALK = new Audio(URL.createObjectURL(blob)); WALK.currentTime = W.start || 0; WALK.volume = 0; WALK.play().catch(() => { });
  let v = 0; const up = setInterval(() => { v = Math.min(1, v + .1); WALK.volume = v; if (v >= 1) clearInterval(up) }, 60);
  if (btn) btn.classList.add("on"); const a = WALK; setTimeout(() => { if (a === WALK) fadeOut(a) }, ((W.len || 25) * 1000));
  a.onpause = a.onended = () => $$(".walkbtn").forEach(b => b.classList.remove("on")); $$(".walkbtn").forEach(b => b.classList.add("on")) }
function fadeOut(a) { let v = a.volume; const t = setInterval(() => { v = Math.max(0, v - .08); a.volume = v; if (v <= 0) { clearInterval(t); a.pause() } }, 60) }

/* ---------- share images (Instagram-story size) ---------- */
function rr(x, ctx, X, Y, W, H, R) { ctx.beginPath(); ctx.moveTo(X + R, Y); ctx.arcTo(X + W, Y, X + W, Y + H, R); ctx.arcTo(X + W, Y + H, X, Y + H, R); ctx.arcTo(X, Y + H, X, Y, R); ctx.arcTo(X, Y, X + W, Y, R); ctx.closePath() }
function loadImg(src) { return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src }) }
async function shareImage(kind, d) {
  const c = document.createElement("canvas"); c.width = 1080; c.height = 1920; const x = c.getContext("2d"); try { await Promise.all(["italic 800 100px 'Barlow Condensed'", "800 100px 'Barlow Condensed'", "700 40px 'Barlow Condensed'", "700 30px Barlow"].map(s => document.fonts.load(s))); await document.fonts.ready } catch (e) { }
  const M = CFG.me || {}, who = ((M.fn || "") + " " + (M.ln || "")).trim().toUpperCase(), tag = [M.num ? "#" + M.num : "", M.pos === "Pitcher" ? "PITCHER" : M.pos ? "POSITION PLAYER" : "", M.cls ? M.cls.toUpperCase() : ""].filter(Boolean).join("  ·  ");
  const T = findToday(), when = nice(new Date()).toUpperCase() + "  ·  PHASE " + PH[T.p].n + " · WEEK " + PH[T.p].weeks[T.w].n;
  /* night stadium backdrop */
  let g = x.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, "#040A1C"); g.addColorStop(.5, "#0A1A3D"); g.addColorStop(1, "#050B1C"); x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
  [[80, -40], [1000, -40]].forEach(([bx, by]) => { const b = x.createRadialGradient(bx, by, 10, bx, by, 1100); b.addColorStop(0, "rgba(255,246,208,.38)"); b.addColorStop(.35, "rgba(255,246,208,.10)"); b.addColorStop(1, "rgba(255,246,208,0)"); x.fillStyle = b; x.fillRect(0, 0, 1080, 1920) });
  for (let s = 0; s < 2; s++) { x.save(); x.globalAlpha = .05; x.fillStyle = "#FFF6D0"; x.beginPath(); const sx = s ? 1000 : 80; x.moveTo(sx, 0); x.lineTo(s ? 200 : 880, 1500); x.lineTo(s ? 520 : 560, 1500); x.closePath(); x.fill(); x.restore() }
  x.save(); x.translate(540, 1980); x.rotate(Math.PI / 4); const fg = x.createLinearGradient(-600, -600, 0, 0); fg.addColorStop(0, "#0F4A2A"); fg.addColorStop(1, "#08281A"); x.fillStyle = fg; x.fillRect(-620, -620, 1240, 1240); x.fillStyle = "rgba(122,78,42,.45)"; x.fillRect(-420, -420, 840, 840); x.fillStyle = "#0C3F24"; x.fillRect(-300, -300, 600, 600); x.restore();
  const vg = x.createRadialGradient(540, 900, 300, 540, 900, 1200); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.6)"); x.fillStyle = vg; x.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(255,255,255,${(Math.random() * .5 + .1).toFixed(2)})`; x.beginPath(); x.arc(Math.random() * 1080, Math.random() * 900, Math.random() * 2.2, 0, 7); x.fill() }
  const logo = await loadImg("img/cu.png"); if (logo) { x.save(); x.shadowColor = "rgba(232,39,79,.7)"; x.shadowBlur = 50; const w = 300, h = w * logo.height / logo.width; x.drawImage(logo, 540 - w / 2, 120, w, h); x.restore() }
  const ctr = (t, y, font, col, ls) => { x.font = font; x.fillStyle = col; if (ls) { x.letterSpacing = ls + "px" } x.textAlign = "center"; x.fillText(t, 540, y); x.letterSpacing = "0px" };
  ctr("CLEARY BASEBALL  ·  WEIGHT ROOM", 380, "700 34px 'Barlow Condensed', sans-serif", "#9DB0CC", 6);
  const pill = (t, y, bg, fg, font) => { x.font = font; const w = x.measureText(t).width + 80; x.fillStyle = bg; rr(0, x, 540 - w / 2, y - 58, w, 84, 42); x.fill(); x.fillStyle = fg; x.textAlign = "center"; x.fillText(t, 540, y) };
  if (kind === "pr") {
    x.save(); x.translate(540, 560); x.rotate(-.06); x.fillStyle = "#B30838"; x.fillRect(-380, -95, 760, 170); x.fillStyle = "#7E0628"; x.fillRect(-380, 75, 760, 16);
    x.font = "italic 800 190px 'Barlow Condensed', 'Arial Narrow', sans-serif"; x.textAlign = "center"; x.fillStyle = "#fff"; x.fillText("NEW PR", 0, 62); x.restore();
    ctr(d.name.toUpperCase(), 790, "800 64px 'Barlow Condensed', 'Arial Narrow', sans-serif", "#fff");
    x.save(); x.shadowColor = "rgba(243,195,74,.8)"; x.shadowBlur = 60; const gg = x.createLinearGradient(0, 860, 0, 1180); gg.addColorStop(0, "#FFE9A8"); gg.addColorStop(1, "#E0A52E"); x.fillStyle = gg; x.font = "italic 800 330px 'Barlow Condensed', 'Arial Narrow', sans-serif"; x.textAlign = "center"; x.fillText(String(d.w), 520, 1150); x.restore();
    ctr("POUNDS", 1225, "800 44px 'Barlow Condensed', 'Arial Narrow', sans-serif", "#F3C34A", 14);
    pill("+" + (d.w - d.prev) + " LB OVER MY BEST", 1350, "rgba(47,184,115,.22)", "#7FE0A8", "800 46px 'Barlow Condensed', 'Arial Narrow', sans-serif") }
  else if (kind === "day") {
    ctr("WORKOUT", 560, "italic 800 170px 'Barlow Condensed', 'Arial Narrow', sans-serif", "#fff"); ctr("COMPLETE", 720, "italic 800 170px 'Barlow Condensed', 'Arial Narrow', sans-serif", "#F3C34A");
    ctr((d.title || "").toUpperCase(), 800, "700 44px 'Barlow Condensed', 'Arial Narrow', sans-serif", "#C9D6EA", 4);
    x.fillStyle = "#0B1226"; rr(0, x, 110, 860, 860, 520, 36); x.fill(); x.lineWidth = 6; x.strokeStyle = "#26324F"; x.stroke();
    const st = [["SETS", fmt(d.sets)], ["LB MOVED", fmt(d.lb)], ["XP", "+" + fmt(d.xp)], ["STREAK", String(d.streak)]];
    st.forEach(([l, v], i) => { const X = 150 + (i % 2) * 400, Y = 900 + Math.floor(i / 2) * 230; x.fillStyle = "#050A18"; rr(0, x, X, Y, 380, 200, 22); x.fill();
      x.save(); x.shadowColor = "rgba(255,224,138,.7)"; x.shadowBlur = 24; x.fillStyle = "#FFE08A"; x.font = "800 104px 'Barlow Condensed', 'Arial Narrow', sans-serif"; x.textAlign = "center"; x.fillText(v, X + 190, Y + 120); x.restore();
      x.fillStyle = "#9DB0CC"; x.font = "700 32px Barlow, sans-serif"; x.textAlign = "center"; x.fillText(l, X + 190, Y + 172) });
    if (d.ghost) ctr(d.ghost.toUpperCase(), 1450, "800 42px 'Barlow Condensed', 'Arial Narrow', sans-serif", d.beat === false ? "#FF8AA0" : "#7FE0A8", 2) }
  else if (kind === "card") { ctr("MY PLAYER CARD", 470, "italic 800 80px 'Barlow Condensed', 'Arial Narrow', sans-serif", "#fff"); await drawCard(x, d, 190, 520, 700) }
  /* player line + footer */
  if (kind !== "card" && who) { ctr(who, 1600, "italic 800 78px 'Barlow Condensed', 'Arial Narrow', sans-serif", "#fff"); if (tag) ctr(tag, 1660, "700 34px 'Barlow Condensed', 'Arial Narrow', sans-serif", "#9DB0CC", 4) }
  ctr(when, 1745, "600 30px Barlow, sans-serif", "rgba(201,214,234,.7)", 2);
  x.fillStyle = "#B30838"; x.fillRect(0, 1860, 1080, 60); x.fillStyle = "#fff"; x.font = "800 34px 'Barlow Condensed', 'Arial Narrow', sans-serif"; x.textAlign = "left"; x.letterSpacing = "4px"; x.fillText("#CLEARYSTANDARD", 60, 1903); x.textAlign = "right"; x.fillText("CU LIFTING", 1020, 1903); x.letterSpacing = "0px"; x.textAlign = "left";
  c.toBlob(async b => { const fl = new File([b], "cleary-" + kind + ".png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [fl] })) { try { await navigator.share({ files: [fl], title: "Cleary Baseball" }); return } catch (e) { if (e.name === "AbortError") return } }
    const prevO = overlay(`<div class="shprev"><img src="${URL.createObjectURL(b)}" alt="Story image"><p class="fine">Press and hold the image to save it, then post it to your story.</p><a class="pill gold" download="${fl.name}" href="${URL.createObjectURL(b)}">Download</a><button class="pill ghost" data-close>Close</button></div>`, "center") }, "image/png") }
function wrap(x, t, X, Y, W, L) { const w = t.split(" "); let line = ""; for (const s of w) { const tt = line ? line + " " + s : s; if (x.measureText(tt).width > W && line) { x.fillText(line, X, Y); Y += L; line = s } else line = tt } x.fillText(line, X, Y) }
async function drawCard(x, d, X, Y, W) { x.textAlign = "left"; const H = W * 1.4; const col = { base: "#6A7FA3", rare: "#3A78C2", foil: "#F3C34A", leg: "#E8274F" }[d.rar[1]];
  x.save(); x.shadowColor = col; x.shadowBlur = 60; x.fillStyle = "#0F1E40"; rr(0, x, X, Y, W, H, 40); x.fill(); x.restore();
  x.lineWidth = 14; x.strokeStyle = col; rr(0, x, X, Y, W, H, 40); x.stroke();
  const ph = d.photo ? await loadImg(d.photo) : null; x.save(); rr(0, x, X + 40, Y + 40, W - 80, W * .78, 24); x.clip(); const gg = x.createLinearGradient(0, Y, 0, Y + W * .8); gg.addColorStop(0, "#1B315F"); gg.addColorStop(1, "#07122A"); x.fillStyle = gg; x.fillRect(X, Y, W, W);
  if (ph) { const s = Math.max((W - 80) / ph.width, W * .78 / ph.height); x.drawImage(ph, X + 40 + (W - 80 - ph.width * s) / 2, Y + 40 + (W * .78 - ph.height * s) / 2, ph.width * s, ph.height * s) } else { const lg = await loadImg("img/badge.png"); if (lg) x.drawImage(lg, X + W / 2 - 210, Y + 120, 420, 304) } x.restore();
  x.fillStyle = col; x.font = "italic 800 150px 'Barlow Condensed'"; x.fillText(String(d.ovr), X + 60, Y + 190); x.font = "700 40px Barlow"; x.fillText("OVR", X + 66, Y + 240);
  x.fillStyle = "#fff"; x.font = "italic 800 84px 'Barlow Condensed'"; x.fillText((d.name || "").toUpperCase(), X + 50, Y + W * .78 + 140);
  x.fillStyle = "#9DB0CC"; x.font = "600 38px Barlow"; x.fillText(d.sub || "", X + 52, Y + W * .78 + 192);
  Object.entries(d.R).forEach(([k, v], i) => { const cx = X + 50 + i * ((W - 100) / 5); x.fillStyle = "#fff"; x.font = "italic 800 66px 'Barlow Condensed'"; x.fillText(v, cx, Y + H - 110); x.fillStyle = "#9DB0CC"; x.font = "700 26px Barlow"; x.fillText(k === "MOBILITY" ? "MOB" : k === "ENGINE" ? "ENG" : k, cx, Y + H - 70) });
  x.fillStyle = col; x.font = "800 30px Barlow"; x.fillText((d.rar[0] + " · " + (d.ed || "")).toUpperCase(), X + 52, Y + H - 30) }

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
function sfx(name) { if (CFG.snd === true && SFX[name]) try { SFX[name]() } catch (e) { } }
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
  const o = overlay(`<div class="stadium"><div class="beams"></div>${towers}<div class="sboard"><div class="sbh">CLEARY <span>·</span> FINAL</div>
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
  const c = document.createElement("canvas"); c.width = 1080; c.height = 1920; const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, "#0A1A3D"); g.addColorStop(.55, "#07122A"); g.addColorStop(1, "#2A0716"); x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
  x.save(); x.globalAlpha = .07; x.fillStyle = "#fff"; for (let i = 0; i < 3; i++) { x.save(); x.translate(820 + i * 90, 300); x.transform(1, 0, -.32, 1, 0, 0); rr(0, x, 0, 0, 56, 900 - i * 120, 28); x.fill(); x.restore() } x.restore();
  const logo = await loadImg("img/cu.png"); if (logo) x.drawImage(logo, 90, 110, 208, 130);
  x.fillStyle = "#C9D6EA"; x.font = "700 40px 'Barlow Condensed', sans-serif"; x.fillText("CLEARY BASEBALL · LIFTING", 90, 320);
  x.fillStyle = "#fff"; const big = (t, y, s) => { x.font = `italic 800 ${s}px 'Barlow Condensed', sans-serif`; x.fillText(t, 90, y) };
  if (kind === "pr") { big("NEW PR", 560, 200); x.fillStyle = "#F3C34A"; big(d.w + " LB", 800, 230); x.fillStyle = "#fff"; x.font = "700 64px 'Barlow Condensed', sans-serif"; wrap(x, d.name.toUpperCase(), 90, 920, 900, 70);
    x.fillStyle = "#9DB0CC"; x.font = "600 46px Barlow, sans-serif"; x.fillText("+" + (d.w - d.prev) + " lb over my best", 90, 1110) }
  else if (kind === "day") { big("WORKOUT", 520, 170); big("DONE.", 690, 170); const st = [["SETS", d.sets], ["LB MOVED", fmt(d.lb)], ["XP", d.xp], ["STREAK", "🔥" + d.streak]];
    st.forEach(([l, v], i) => { const X = 90 + (i % 2) * 460, Y = 820 + Math.floor(i / 2) * 300; x.fillStyle = "rgba(255,255,255,.07)"; rr(0, x, X, Y, 420, 250, 30); x.fill(); x.fillStyle = "#F3C34A"; x.font = "italic 800 110px 'Barlow Condensed'"; x.fillText(String(v), X + 36, Y + 140); x.fillStyle = "#9DB0CC"; x.font = "700 38px Barlow"; x.fillText(l, X + 40, Y + 205) });
    x.fillStyle = "#fff"; x.font = "700 52px 'Barlow Condensed'"; x.fillText((d.title || "").toUpperCase(), 90, 1480) }
  else if (kind === "card") { await drawCard(x, d, 140, 380, 800) }
  x.fillStyle = "#B30838"; x.fillRect(0, 1880, 1080, 40); x.fillStyle = "rgba(255,255,255,.55)"; x.font = "600 34px Barlow"; x.fillText("#ClearyStandard", 90, 1820);
  c.toBlob(async b => { const f = new File([b], "cleary-" + kind + ".png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: "Cleary Baseball" }); return } catch (e) { if (e.name === "AbortError") return } }
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = f.name; a.click(); toast("Image saved — post it to your story") }, "image/png") }
function wrap(x, t, X, Y, W, L) { const w = t.split(" "); let line = ""; for (const s of w) { const tt = line ? line + " " + s : s; if (x.measureText(tt).width > W && line) { x.fillText(line, X, Y); Y += L; line = s } else line = tt } x.fillText(line, X, Y) }
async function drawCard(x, d, X, Y, W) { const H = W * 1.4; const col = { base: "#6A7FA3", rare: "#3A78C2", foil: "#F3C34A", leg: "#E8274F" }[d.rar[1]];
  x.save(); x.shadowColor = col; x.shadowBlur = 60; x.fillStyle = "#0F1E40"; rr(0, x, X, Y, W, H, 40); x.fill(); x.restore();
  x.lineWidth = 14; x.strokeStyle = col; rr(0, x, X, Y, W, H, 40); x.stroke();
  const ph = d.photo ? await loadImg(d.photo) : null; x.save(); rr(0, x, X + 40, Y + 40, W - 80, W * .78, 24); x.clip(); const gg = x.createLinearGradient(0, Y, 0, Y + W * .8); gg.addColorStop(0, "#1B315F"); gg.addColorStop(1, "#07122A"); x.fillStyle = gg; x.fillRect(X, Y, W, W);
  if (ph) { const s = Math.max((W - 80) / ph.width, W * .78 / ph.height); x.drawImage(ph, X + 40 + (W - 80 - ph.width * s) / 2, Y + 40 + (W * .78 - ph.height * s) / 2, ph.width * s, ph.height * s) } else { const lg = await loadImg("img/badge.png"); if (lg) x.drawImage(lg, X + W / 2 - 210, Y + 120, 420, 304) } x.restore();
  x.fillStyle = col; x.font = "italic 800 150px 'Barlow Condensed'"; x.fillText(String(d.ovr), X + 60, Y + 190); x.font = "700 40px Barlow"; x.fillText("OVR", X + 66, Y + 240);
  x.fillStyle = "#fff"; x.font = "italic 800 84px 'Barlow Condensed'"; x.fillText((d.name || "").toUpperCase(), X + 50, Y + W * .78 + 140);
  x.fillStyle = "#9DB0CC"; x.font = "600 38px Barlow"; x.fillText(d.sub || "", X + 52, Y + W * .78 + 192);
  Object.entries(d.R).forEach(([k, v], i) => { const cx = X + 50 + i * ((W - 100) / 5); x.fillStyle = "#fff"; x.font = "italic 800 66px 'Barlow Condensed'"; x.fillText(v, cx, Y + H - 110); x.fillStyle = "#9DB0CC"; x.font = "700 26px Barlow"; x.fillText(k === "MOBILITY" ? "MOB" : k === "ENGINE" ? "ENG" : k, cx, Y + H - 70) });
  x.fillStyle = col; x.font = "800 30px Barlow"; x.fillText((d.rar[0] + " · " + (d.ed || "")).toUpperCase(), X + 52, Y + H - 30) }

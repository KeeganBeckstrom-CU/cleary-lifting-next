/* CU Lifting service worker: works offline in the weight room + receives push notifications */
const V = "cln-v5";
const SHELL = ["./", "index.html", "style.css?v=5", "data.js?v=5", "core.js?v=5", "fx.js?v=5", "map.js?v=5", "coach.js?v=5", "app.js?v=5", "img/cu.png", "img/badge.png", "icons/icon-192.png", "manifest.webmanifest"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())) });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())) });
self.addEventListener("fetch", e => { const u = new URL(e.request.url); if (e.request.method !== "GET") return;
  if (u.origin === location.origin) { /* app files: network first so updates land, cache when offline */
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))); return }
  if (/fonts\.(googleapis|gstatic)\.com/.test(u.host)) e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(n => { const c = n.clone(); caches.open(V).then(x => x.put(e.request, c)); return n }))) });
self.addEventListener("push", e => { let d = {}; try { d = e.data.json() } catch (x) { d = { title: "CU Lifting", body: e.data ? e.data.text() : "" } }
  e.waitUntil(self.registration.showNotification(d.title || "CU Lifting", { body: d.body || "", icon: "icons/icon-192.png", badge: "icons/favicon-32.png", data: d.url || "./" })) });
self.addEventListener("notificationclick", e => { e.notification.close(); e.waitUntil(clients.openWindow(e.notification.data || "./")) });

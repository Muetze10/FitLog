// ============================================================
// sw.js – Service Worker: macht FitLog vollständig offline nutzbar.
// WICHTIG: Bei jeder Änderung an Dateien CACHE_VERSION erhöhen!
// ============================================================

const CACHE_VERSION = "fitlog-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.webmanifest",
  "./js/app.js",
  "./js/db.js",
  "./js/store.js",
  "./js/ui.js",
  "./js/actions.js",
  "./js/core/format.js",
  "./js/core/stats.js",
  "./js/core/workout.js",
  "./js/core/blocks.js",
  "./js/core/validation.js",
  "./js/data/exercises.js",
  "./js/data/plans.js",
  "./js/views/home.js",
  "./js/views/workout.js",
  "./js/views/plans.js",
  "./js/views/exercises.js",
  "./js/views/history.js",
  "./js/views/stats.js",
  "./js/views/settings.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match("./index.html"));

      return cached || network;
    })
  );
});

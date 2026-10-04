/// <reference lib="webworker" />

import { files, version } from '$service-worker';

const CACHE_PREFIX = 'eglise-shell-';
const CACHE = `${CACHE_PREFIX}${version}`;
const offlineDocument = '/offline.html';
const staticAssets = files.filter(
  (file) =>
    file === 'manifest.webmanifest' || file.startsWith('icons/') || file.startsWith('artwork/')
);
const cachedPaths = new Set(
  staticAssets.map((asset) => new URL(asset, self.location.origin).pathname)
);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([...staticAssets, offlineDocument]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    const requestUrl = new URL(event.request.url);

    if (requestUrl.pathname === offlineDocument) {
      event.respondWith(
        caches
          .match(offlineDocument)
          .then((cached) => cached ?? new Response('Offline page unavailable.', { status: 503 }))
      );

      return;
    }

    event.respondWith(
      fetch(event.request).catch(() =>
        Response.redirect(new URL(offlineDocument, self.location.origin).toString(), 302)
      )
    );

    return;
  }

  if (event.request.method !== 'GET' || !cachedPaths.has(new URL(event.request.url).pathname))
    return;

  event.respondWith(caches.match(event.request).then((cached) => cached ?? fetch(event.request)));
});

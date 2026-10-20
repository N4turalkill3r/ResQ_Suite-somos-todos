/**
 * sw.js — Service Worker de ResQ Suite
 *
 * Estrategia "red primero": siempre se intenta traer la versión más nueva
 * (así la suite se actualiza sola al abrirla) y, si no hay conexión, se
 * sirve la copia guardada.
 *
 * IMPORTANTE: si agregas o renombras archivos, actualiza APP_SHELL y sube
 * el número de CACHE_NAME para que los dispositivos descarguen todo de nuevo.
 */

const CACHE_NAME = 'resq-suite-v3';

const APP_SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',

  'css/variables.css',
  'css/base.css',
  'css/layout.css',
  'css/components.css',
  'css/overlays.css',
  'css/splash.css',

  'js/main.js',
  'js/config.js',
  'js/content.js',
  'js/services/storage.js',
  'js/services/github.js',
  'js/state/store.js',
  'js/ui/dom.js',
  'js/ui/header.js',
  'js/ui/grid.js',
  'js/ui/settings-dialog.js',
  'js/ui/support-dialog.js',
  'js/ui/splash.js',

  'assets/logo.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/favicon-32.png',
];

/* Instalación: guarda la "carcasa" de la app. */
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

/* Activación: borra cachés de versiones anteriores. */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

/* Peticiones: red primero, caché como respaldo. Solo archivos propios (no la API de GitHub). */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const sameOrigin = new URL(request.url).origin === self.location.origin;
  if (request.method !== 'GET' || !sameOrigin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('index.html'))),
  );
});

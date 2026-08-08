/* Service Worker для 5 Words a Day.
   Кэш с версией: после каждого изменения файлов увеличивайте CACHE_VERSION.
   Для обновления установленного приложения нужно опубликовать новую версию и перезапустить приложение. */
'use strict';

var CACHE_VERSION = '5words-v2';
var CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './auth.js',
  './words.js',
  './word-normalize.js',
  './firebase-config.js',
  './logo.png',
  './favicon.ico',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './manifest.webmanifest'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_VERSION; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  // Навигация: сначала сеть, при отсутствии связи — сохранённая главная страница
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function (cache) { cache.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html');
      })
    );
    return;
  }

  var url = new URL(req.url);

  // Сторонние ресурсы (firebase): сеть в приоритете, офлайн — из кэша
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req);
      })
    );
    return;
  }

  // Свои статические файлы: кэш в приоритете, в фоне обновляем
  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      });
      return cached || network;
    })
  );
});


importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
if (workbox) {
workbox.setConfig({
debug: false
});
workbox.core.skipWaiting();
workbox.core.clientsClaim();
workbox.core.setCacheNameDetails({
  prefix: 'thn-sw',
  suffix: 'v10',
  precache: 'install-time',
  runtime: 'run-time'
});

const FALLBACK_HTML_URL = 'https://bloginoobs.blogspot.com/p/error';
workbox.precaching.cleanupOutdatedCaches();
workbox.precaching.precacheAndRoute([FALLBACK_HTML_URL,'https://raw.githubusercontent.com/mhdfasilwyd/svg/master/manifest.json','https://bloginoobs.blogspot.com/favicon.ico']);
workbox.routing.registerRoute(
    new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
    workbox.strategies.cacheFirst({
        cacheName: 'google-fonts-live-' + workbox.core.cacheNames.suffix,
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 365 * 24 * 60 * 60,
                maxEntries:30,
                purgeOnQuotaError: true
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),'GET'
);

workbox.routing.registerRoute(
    new RegExp('https://thehackernews.com/fonts/(.*)'),
    workbox.strategies.cacheFirst({
        cacheName: 'google-fonts-hosted-' + workbox.core.cacheNames.suffix,
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 365 * 24 * 60 * 60,
                maxEntries:30,
                purgeOnQuotaError: true
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),'GET'
);

workbox.routing.registerRoute(
    new RegExp('https://(?:ajax.cloudflare|www.googletagservices|www.google-analytics|cdnjs.cloudflare).com/(.*)'),
    workbox.strategies.cacheFirst({
        cacheName: 'third-party-files-' + workbox.core.cacheNames.suffix,
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 10 * 24 * 60 * 60,
                maxEntries:100,
                purgeOnQuotaError: true
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),'GET'
);

workbox.routing.registerRoute(
    new RegExp('.(?:js|css|png|gif|jpg|svg)$'),
    workbox.strategies.cacheFirst({
        cacheName: 'images-js-css-' + workbox.core.cacheNames.suffix,
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 10 * 24 * 60 * 60,
                maxEntries:100,
                purgeOnQuotaError: true
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),'GET'
);

workbox.routing.setDefaultHandler(
    new workbox.strategies.StaleWhileRevalidate()
);

workbox.routing.setCatchHandler(({event}) => {
      switch (event.request.destination) {
        case 'document':
        return caches.match(FALLBACK_HTML_URL);
      break;
      default:
        return Response.error();
  }
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches
      .keys()
      .then(keys => keys.filter(key => !key.endsWith(workbox.core.cacheNames.suffix)))
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
  );
});

workbox.googleAnalytics.initialize();
}
else {
    console.log('Boo! Workbox didnt load ');
}

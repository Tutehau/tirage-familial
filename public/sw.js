/**
 * Service Worker — Tirage Familial (PWA)
 *
 * Stratégie :
 *   - Navigation (HTML) : réseau d'abord, secours sur le cache ("/" en dernier recours hors-ligne).
 *   - Images / icônes   : stale-while-revalidate (affichage instantané + mise à jour en fond).
 *   - Tout le reste (JS/CSS/API) : jamais intercepté, laissé au réseau + cache HTTP du navigateur.
 *
 * Incrémente CACHE_VERSION à chaque déploiement significatif pour purger l'ancien cache.
 */
const CACHE_VERSION = 'tirage-familial-cache-v1'
const CORE_PAGES = ['/', '/nouveau']

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then(cache => Promise.allSettled(CORE_PAGES.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

function isImage(pathname) {
  return /\.(png|jpe?g|webp|gif|svg|ico)$/i.test(pathname) || pathname.startsWith('/icons/')
}

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  const { pathname } = new URL(request.url)

  if (isImage(pathname)) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(cache =>
        cache.match(request).then(cached => {
          const network = fetch(request)
            .then(response => {
              if (response.ok) cache.put(request, response.clone())
              return response
            })
            .catch(() => cached)
          return cached || network
        })
      )
    )
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_VERSION).then(cache => cache.put(request, copy))
          }
          return response
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('/')))
    )
  }
})

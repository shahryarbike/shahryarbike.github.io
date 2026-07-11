const CACHE = 'sbike-pwa-v2'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(['/', '/manifest.json', '/icons/Icon-192.png', '/icons/Icon-512.png']),
    ),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  )
})

function shouldHandle(request) {
  if (request.method !== 'GET') return false

  let url
  try {
    url = new URL(request.url)
  }
  catch {
    return false
  }

  // Never intercept cross-origin (map tiles, APIs, CDNs).
  if (url.origin !== self.location.origin) return false

  // Skip non-http(s) schemes.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false

  return true
}

self.addEventListener('fetch', (event) => {
  if (!shouldHandle(event.request)) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(event.request, copy))
          }
          return response
        })
        .catch(() => cached)

      return cached || network
    }),
  )
})

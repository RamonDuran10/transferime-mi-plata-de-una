// Ojo: subir este número cada vez que se necesite invalidar a la fuerza el
// caché de un despliegue anterior (borra los caches viejos en 'activate').
const CACHE = 'pagame-v2';
const PRECACHE = [
  './', './index.html', './es.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'
];
// El "cascarón" de la app cambia seguido (todavía en desarrollo activo) —
// estos se piden siempre a la red primero, y el caché queda solo de
// respaldo para cuando no hay conexión. Si no, cada deploy nuevo quedaba
// escondido detrás de la versión vieja cacheada.
const NETWORK_FIRST_PATHS = ['/', '/index.html', '/es.js'];

self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(() => {}))); });
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Las rutas de la sesión en vivo nunca se cachean — siempre tienen que ir a la red.
  if (url.pathname.startsWith('/api/')) return;

  if (NETWORK_FIRST_PATHS.includes(url.pathname)) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match('./index.html'))));
});

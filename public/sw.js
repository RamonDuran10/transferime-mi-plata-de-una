// Ojo: subir este número cada vez que se necesite invalidar a la fuerza el
// caché de un despliegue anterior (borra los caches viejos en 'activate').
const CACHE = 'pagame-v4';

// Solo se precachean assets ESTABLES (nunca cambian de nombre entre
// builds). El JS/CSS que genera Vite lleva un hash en el nombre de archivo
// que cambia en cada build, así que no se puede precachear por lista fija —
// en vez de eso, se cachean "sobre la marcha" la primera vez que se piden
// (ver el fetch handler más abajo).
const PRECACHE = [
  './', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(() => {})));
});

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

  // Las rutas de la sesión en vivo nunca se cachean — siempre a la red.
  if (url.pathname.startsWith('/api/')) return;

  // El "cascarón" de la app (HTML/JS/CSS) cambia con cada deploy — se pide
  // siempre a la red primero, y el caché queda solo de respaldo para cuando
  // no hay conexión. Cubre tanto la navegación (documento) como los bundles
  // con hash que genera Vite (no hace falta saber sus nombres de antemano).
  const isAppShell = e.request.destination === 'document'
    || e.request.destination === 'script'
    || e.request.destination === 'style';

  if (isAppShell) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./')))
    );
    return;
  }

  // Todo lo demás (íconos, manifest, imágenes) — caché primero.
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match('./'))));
});

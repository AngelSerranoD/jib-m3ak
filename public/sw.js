/* Jib M3ak · service worker
   Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.

   Dos trabajos:
   1. Guardar la interfaz para que la app abra aunque no haya red (en muchos
      supermercados no hay cobertura).
   2. Guardar las fotos de los artículos, que son las que hacen entendible la
      lista para quien no lee español. Van en una caché aparte que sobrevive a
      las actualizaciones: cada foto lleva el uuid de su artículo y nunca cambia.
   __VERSION__ lo sustituye la build con la huella del index.html. */

const CACHE = 'jibm3ak-__VERSION__';
const FOTOS = 'jibm3ak-fotos';

const BASE = [
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/icon-32.png',
  '/icons/icon-152.png',
  '/icons/icon-167.png',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
];

const esFoto = (url) => url.hostname.endsWith('.supabase.co') && url.pathname.includes('/storage/v1/object/public/fotos/');

// `ignoreVary` NO es opcional: el servidor manda `Vary: Origin` y, sin esto,
// una copia guardada por el service worker no casa con la petición que hace el
// navegador para el <script> o el <link>. Resultado: la app cargaba en blanco
// sin conexión, con dos 503 y ninguna pista más.
const GUARDADA = { ignoreVary: true };

async function guardar(cache, url) {
  try {
    const res = await fetch(url, { cache: 'reload' });
    if (res.ok) await cache.put(url, res);
  } catch { /* se pedirá a la red la primera vez que haga falta */ }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Los nombres de JS y CSS llevan hash: se leen del propio index.html para
    // que la app quede completa desde la primera visita.
    try {
      const res = await fetch('/', { cache: 'reload' });
      if (res.ok) {
        await cache.put('/', res.clone());
        const html = await res.text();
        const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
        await Promise.all(assets.map((url) => guardar(cache, url)));
      }
    } catch { /* sin red en la instalación: se reintentará */ }
    await Promise.all(BASE.map((url) => guardar(cache, url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const claves = await caches.keys();
    await Promise.all(
      claves.filter((k) => k.startsWith('jibm3ak-') && k !== CACHE && k !== FOTOS).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

/** Red primero para la página, con límite: una red lenta no deja la app en blanco. */
async function pagina(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await Promise.race([
      fetch(request),
      new Promise((_, rechazar) => setTimeout(() => rechazar(new Error('lenta')), 3500)),
    ]);
    if (res.ok) cache.put('/', res.clone());
    return res;
  } catch {
    return (await cache.match('/', GUARDADA)) ?? new Response('Sin conexión', { status: 503 });
  }
}

/** Las fotos no cambian nunca: copia primero y, si no está, a la red. */
async function foto(request) {
  const cache = await caches.open(FOTOS);
  const guardada = await cache.match(request, GUARDADA);
  if (guardada) return guardada;
  const res = await fetch(request);
  // Las <img> piden con crossorigin="anonymous": la respuesta es legible y se
  // puede guardar. Una opaca ocuparía megas de cuota por cada foto.
  if (res.ok && res.type !== 'opaque') cache.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (esFoto(url)) {
    event.respondWith(foto(request).catch(() => new Response('Sin conexión', { status: 503 })));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(pagina(request));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const guardada = await cache.match(request, { ignoreSearch: true, ...GUARDADA });
    // /assets/ lleva hash y nunca cambia: con la copia basta.
    if (guardada && url.pathname.startsWith('/assets/')) return guardada;
    // El resto (iconos, manifest) se sirve de la copia y se refresca por detrás.
    const deRed = fetch(request)
      .then((res) => {
        if (res.ok && res.type === 'basic') cache.put(request, res.clone());
        return res;
      })
      .catch(() => null);
    return guardada ?? (await deRed) ?? new Response('Sin conexión', { status: 503 });
  })());
});

// La app avisa cuando se borra un artículo para no guardar su foto para siempre.
self.addEventListener('message', (event) => {
  if (event.data?.tipo !== 'olvidar-foto' || typeof event.data.url !== 'string') return;
  event.waitUntil(caches.open(FOTOS).then((cache) => cache.delete(event.data.url)).catch(() => {}));
});

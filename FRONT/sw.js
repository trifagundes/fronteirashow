const CACHE_NAME = 'fronteiraplus-cache-20260623-1725';

// Apenas recursos locais (sem restrição de CORS)
const URLS_TO_CACHE = [
    './',
    'index.html',
    'css/style.css',
    'js/netflix.js',
    'manifest.json',
];

// URLs de CDNs externas — cacheadas com mode: 'no-cors' (opaque responses)
const EXTERNAL_URLS_TO_CACHE = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://unpkg.com/@phosphor-icons/web',
    'https://cdn.tailwindcss.com',
];

// Evento de Instalação: abre o cache e adiciona os arquivos principais
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache aberto');

            // Cacheia arquivos locais normalmente
            const localCache = cache.addAll(URLS_TO_CACHE);

            // Cacheia CDNs externas com no-cors (não bloqueia a instalação se falhar)
            const externalCache = Promise.allSettled(
                EXTERNAL_URLS_TO_CACHE.map(url =>
                    fetch(new Request(url, { mode: 'no-cors' }))
                        .then(res => cache.put(url, res))
                        .catch(err => console.warn('[SW] Não foi possível cachear:', url, err))
                )
            );

            return Promise.all([localCache, externalCache]);
        })
    );
    // Força ativação imediata sem esperar abas fecharem
    self.skipWaiting();
});

// Evento de Fetch: serve os arquivos do cache se estiverem disponíveis
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se o recurso estiver no cache, retorna ele
                if (response) {
                    return response;
                }
                // Senão, busca na rede
                return fetch(event.request);
            })
    );
});

// Evento de Ativação: limpa caches antigos
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Responde à página com a versão atual do cache quando solicitado
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'GET_CACHE_VERSION') {
        event.source.postMessage({ type: 'CACHE_VERSION', version: CACHE_NAME });
    }
});

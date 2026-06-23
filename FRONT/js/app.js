/**
 * Main Application Module
 * Controlador central que inicializa e integra os outros módulos
 */
import { fetchEvents } from './api.js';
import { renderEvents, renderFeaturedEvents, openEventModal } from './ui.js';
import { createNativeAdCard, createUtilityCarousel } from './components.js';
import { initThemeToggle } from './theme.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializa controles de UI (Theme)
    initThemeToggle();

    // 2. Busca dados da API
    const events = await fetchEvents();

    // 3. Separa eventos em destaque dos normais
    const featuredEvents = events.filter(e => e.featured);
    const regularEvents = events.filter(e => !e.featured);

    // 4. Renderiza Destaques
    renderFeaturedEvents(featuredEvents, 'featured-events-container');

    // 5. Configuração da Rolagem Infinita Simulada
    const containerId = 'events-container';
    const sentinel = document.getElementById('scroll-sentinel');
    let currentPage = 1;
    const itemsPerPage = 4; // Mostra 4 por vez para forçar a rolagem logo no início
    let isLoading = false;

    const attachModalListeners = () => {
        const cards = document.querySelectorAll('article[data-event-id]');
        cards.forEach(card => {
            // Remove evento anterior se existir para não duplicar chamadas
            card.removeEventListener('click', handleCardClick);
            card.addEventListener('click', handleCardClick);
        });
    };

    const handleCardClick = (e) => {
        const card = e.currentTarget;
        const eventId = card.getAttribute('data-event-id');
        const eventData = events.find(ev => ev.id === eventId);
        if (eventData) openEventModal(eventData);
    };

    const renderPage = (page) => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageEvents = regularEvents.slice(startIndex, endIndex);
        
        if (pageEvents.length > 0) {
            renderEvents(pageEvents, containerId, page !== 1);
            
            // Injetar Anúncio Nativo após carregar a primeira página
            if (page === 1) {
                const mockAd = {
                    advertiser: 'Distribuidora Fronteira',
                    logo: 'https://ui-avatars.com/api/?name=DF&background=0ea5e9&color=fff&bold=true',
                    image: 'https://picsum.photos/seed/ad_bebida/600/300',
                    title: 'O seu Esquenta Garantido!',
                    description: 'Combo Gin + Energético com 20% OFF para quem for nas festas de hoje. Entregamos gelado em 15 minutos!',
                    cta: 'Pedir agora'
                };
                const container = document.getElementById(containerId);
                // Insere logo após o 3º item da lista
                if (container.children.length >= 3) {
                    container.children[2].insertAdjacentHTML('afterend', createNativeAdCard(mockAd));
                } else {
                    container.insertAdjacentHTML('beforeend', createNativeAdCard(mockAd));
                }
            }
            
            // Injetar Carrossel de Utilidades após carregar a segunda página
            if (page === 2) {
                const mockServices = [
                    { logo: 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://www.99app.com&size=128', title: '99 Táxi', description: 'Volte em segurança', bgClass: 'bg-white border border-slate-200 dark:border-slate-700/50' },
                    { logo: 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://www.ibis.com&size=128', title: 'Hotel Ibis', description: 'Desconto no pernoite', bgClass: 'bg-white border border-slate-200 dark:border-slate-700/50' },
                    { logo: 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://www.gillette.com&size=128', title: 'Gillette Barber', description: 'Corte de última hora', bgClass: 'bg-white border border-slate-200 dark:border-slate-700/50' },
                    { logo: 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://www.dominos.com.br&size=128', title: "Domino's Pizza", description: 'Bateu a fome pós festa', bgClass: 'bg-white border border-slate-200 dark:border-slate-700/50' }
                ];
                const container = document.getElementById(containerId);
                container.insertAdjacentHTML('beforeend', `<div class="-mx-4">${createUtilityCarousel(mockServices)}</div>`);
            }
            
            attachModalListeners();
        }
        
        // Esconde o spinner se chegamos no fim da lista
        if (endIndex >= regularEvents.length && sentinel) {
            sentinel.style.display = 'none';
        }
    };

    // Renderiza a página inicial (primeiros itens)
    renderPage(1);

    // Configura o Sensor de Rolagem (Intersection Observer)
    if (regularEvents.length > itemsPerPage && sentinel) {
        sentinel.classList.remove('hidden'); // Mostra o spinner no final da tela
        
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isLoading) {
                const startIndex = currentPage * itemsPerPage;
                if (startIndex < regularEvents.length) {
                    isLoading = true;
                    // Simula delay de rede para carregar a próxima "página"
                    setTimeout(() => {
                        currentPage++;
                        renderPage(currentPage);
                        isLoading = false;
                    }, 800); // 800ms de carregamento
                }
            }
        }, { rootMargin: '100px' }); // Dispara o gatilho 100px antes de chegar no spinner

        observer.observe(sentinel);
    }

    // 6. Configuração da Tarja Fixa Inteligente (Scroll Handler)
    const stickyAd = document.getElementById('smart-sticky-ad');
    let lastScrollY = window.scrollY;

    // 8. Lógica de Dismiss da Tarja Fixa e Botão Flutuante (FAB)
    const btnCloseAd = document.getElementById('close-sticky-ad');
    const fabTaxi = document.getElementById('fab-taxi');
    let isAdDismissed = false;

    if (stickyAd && btnCloseAd && fabTaxi) {
        // Quando o usuário fecha a tarja
        btnCloseAd.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita clicar no anúncio inteiro
            isAdDismissed = true;
            
            // Esconde a tarja (escorrega pra baixo e some)
            stickyAd.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
            stickyAd.classList.remove('translate-y-0', 'opacity-100');
            
            // Mostra o botão flutuante (sobe e aparece)
            fabTaxi.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
            fabTaxi.classList.add('translate-y-0', 'opacity-100');
        });

        // Quando o usuário clica no botão flutuante para recuperar
        fabTaxi.addEventListener('click', () => {
            isAdDismissed = false;
            
            // Esconde o FAB
            fabTaxi.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
            fabTaxi.classList.remove('translate-y-0', 'opacity-100');
            
            // Mostra a tarja novamente
            stickyAd.classList.remove('translate-y-20', 'translate-y-[150%]', 'opacity-0', 'pointer-events-none');
            stickyAd.classList.add('translate-y-0', 'opacity-100');
        });

        // Atualizando o Scroll Handler para não sobrescrever o Dismiss
        window.addEventListener('scroll', () => {
            if (isAdDismissed) return; // Se estiver fechado, não faz nada
            
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
                stickyAd.classList.add('translate-y-[150%]');
                stickyAd.classList.remove('translate-y-0');
            } else {
                stickyAd.classList.add('translate-y-0');
                stickyAd.classList.remove('translate-y-[150%]');
            }
            lastScrollY = currentScrollY;
        }, { passive: true });
    }
});

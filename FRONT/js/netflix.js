/**
 * Netflix Mode Module
 * Responsável por inicializar a página netflix.html
 */
import { fetchEvents, fetchAppData } from './api.js';
import { createNetflixRow, createNativeAdCard, createUtilityCarousel, createHeroCarousel, createCategoryPills, createExploreGrid, createPosterCard, createGridCard, createGridAdCard, createLandscapeRow, createListRow, createGridSection, createFeaturedSingle, createBentoSection, createHeroTicket, createSmallTicket, createProfileMenu, createProducerRow, createProducerAvatar, createVIPProducerCard, createPremiumProducerCard } from './components.js';
import { openEventModal, closeEventModal } from './ui.js';
import { initThemeToggle } from './theme.js';
import { toggleFavorite, getFavorites, toggleFollowProducer, isFollowingProducer } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializa controles de UI (Theme)
    initThemeToggle();

    // Atualiza o contador do badge de favoritos na navegação inicial
    updateFavoritesBadge();

    // 2. Busca e Carregamento de Dados
    const [events, appData] = await Promise.all([fetchEvents(), fetchAppData()]);

    // Carregamento do Ad Server (localStorage > appData)
    const fallbackAds = appData?.ads || {};
    let adsList = [];
    const localAds = localStorage.getItem('@EventApp:admin_ads');
    if (localAds) {
        adsList = JSON.parse(localAds);
    } else {
        adsList = Object.entries(fallbackAds).map(([key, val]) => ({ id: key, ...val }));
    }

    const getRandomAd = (zone) => {
        const activeAds = adsList.filter(ad => ad.status === 'active' && ad.zone === zone);
        if (activeAds.length === 0) return null;
        
        // Aplica a regra universal de pesos e embaralhamento e pega o vencedor (o primeiro da fila)
        const prioritizedAds = getWeightedRandomizedAds(activeAds);
        return prioritizedAds[0];
    };

    const getWeightedRandomizedAds = (ads) => {
        // Sistema de "Roleta Viciada" (Probabilístico)
        // Se o anúncio tem peso 10, ele ganha 10 "bilhetes" no sorteio.
        let tickets = [];
        ads.forEach(ad => {
            const w = parseInt(ad.weight) || 1;
            for(let i = 0; i < w; i++) tickets.push(ad);
        });

        // Embaralha todos os bilhetes
        for (let i = tickets.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tickets[i], tickets[j]] = [tickets[j], tickets[i]];
        }

        // Pega os anúncios na ordem em que seus bilhetes foram sorteados (ignorando bilhetes repetidos)
        const result = [];
        const seen = new Set();
        tickets.forEach(ad => {
            if (!seen.has(ad.id)) {
                seen.add(ad.id);
                result.push(ad);
            }
        });
        
        return result;
    };

    let mockServices = adsList.filter(ad => ad.status === 'active' && ad.zone === 'utility');
    mockServices = getWeightedRandomizedAds(mockServices);

    const mockCategories = appData?.mockCategories || [];
    const allCategoriesForGrid = appData?.allCategoriesForGrid || [];

    // Injetar dados do Sticky Ad Dinamicamente
    const stickyAdData = appData?.stickyAd;
    if (stickyAdData) {
        const stickyAdLogo = document.getElementById('sticky-ad-logo');
        const stickyAdTitle = document.getElementById('sticky-ad-title');
        const stickyAdDesc = document.getElementById('sticky-ad-desc');
        const stickyAdCta = document.getElementById('sticky-ad-cta');
        const fabTaxiLogo = document.getElementById('fab-taxi-logo');

        if (stickyAdLogo) stickyAdLogo.src = stickyAdData.logo;
        if (stickyAdTitle) stickyAdTitle.textContent = stickyAdData.advertiser;
        if (stickyAdDesc) stickyAdDesc.textContent = stickyAdData.description;
        if (stickyAdCta) {
            stickyAdCta.className = `${stickyAdData.ctaColor} text-white w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 shadow-md`;
            stickyAdCta.innerHTML = `<i class="ph-bold ${stickyAdData.ctaIcon}"></i>`;
        }
        if (fabTaxiLogo) fabTaxiLogo.src = stickyAdData.logo;
    }



    const container = document.getElementById('netflix-container');

    if (!events || events.length === 0) {
        container.innerHTML = '<p class="p-4 text-center text-slate-500">Nenhum evento encontrado.</p>';
        return;
    }

    // Guarda a lista global para a busca e produtores
    window.allEvents = events;
    window.producers = appData?.producers || [];

    // 3. Funções Utilitárias para Filtragem de Eventos
    // Função utilitária para filtrar eventos com base na configuração do servidor
    const getFilteredEvents = (filterStr) => {
        if (!filterStr) return events;
        if (filterStr === 'trending') return events.filter(e => e.featured || e.promotion);
        if (filterStr === 'free') return events.filter(e => {
            const p = (e.price || '').toLowerCase();
            return p.includes('free') || p.includes('grátis') || p.includes('gratuito') || p === 'r$ 0,00';
        });
        if (filterStr.startsWith('tags:')) {
            const tag = filterStr.split(':')[1];
            return events.filter(e => e.tags && e.tags.includes(tag));
        }
        if (filterStr === 'mixed') {
            return [...events].sort(() => 0.5 - Math.random());
        }
        return events;
    };

    // Destaque Master (Hero Carousel) - Será preenchido dinamicamente se a seção existir no admin
    // Mantemos uma inicialização vazia para não quebrar referências
    let heroEvents = [];

    // 5. Monta o HTML dinamicamente baseado no appData (Server-Driven UI)
    let html = '';

    // Injeção Dinâmica: Eventos de quem você segue
    const followingProducers = JSON.parse(localStorage.getItem('@EventApp:following')) || [];
    if (followingProducers.length > 0) {
        const followedEvents = events.filter(e => e.promoterId && followingProducers.includes(e.promoterId));
        if (followedEvents.length > 0) {
            html += createNetflixRow('De quem você segue', followedEvents.slice(0, 10), null, 10);
        }
    }

    let homeSections = appData?.homeSections || [];
    // Filter active and scheduled sections
    const now = new Date();
    homeSections = homeSections.filter(s => {
        if (s.isActive === false) return false;
        if (s.startDate && new Date(s.startDate) > now) return false;
        if (s.endDate && new Date(s.endDate) < now) return false;
        return true;
    });

    // Extrai a seção Hero (se houver) para renderizar no topo separadamente
    const heroSection = homeSections.find(s => s.type === 'hero_carousel');
    if (heroSection) {
        heroEvents = getFilteredEvents(heroSection.filter);
        if (heroSection.limit) {
            heroEvents = heroEvents.slice(0, heroSection.limit);
        } else {
            heroEvents = heroEvents.slice(0, 3); // Fallback limit
        }
        
        if (heroSection.insertAdAt !== undefined || heroSection.insertAdAt) {
            let injectedAd = null;
            if (heroSection.adZone) injectedAd = getRandomAd(heroSection.adZone);
            else if (heroSection.adId) injectedAd = adsList.find(a => a.id === heroSection.adId);
            
            if (injectedAd) {
                const adIndex = parseInt(heroSection.insertAdAt) || 1;
                injectedAd.isAd = true;
                injectedAd.type = 'ad';
                heroEvents.splice(Math.max(0, adIndex - 1), 0, injectedAd);
            }
        }
    }

    const feedSections = homeSections.filter(s => s.type !== 'hero_carousel');

    feedSections.forEach(section => {
        if (section.type === 'explore_pills') {
            html += createCategoryPills(mockCategories);
        } else if (section.type === 'native_ad') {
            const adData = section.adZone ? getRandomAd(section.adZone) : adsList.find(a => a.id === section.adId);
            if (adData) html += `<div class="px-4">${createNativeAdCard(adData)}</div>`;
        } else if (section.type === 'utility_carousel') {
            html += createUtilityCarousel(mockServices);
        } else if (section.type.startsWith('event_')) {
            let rowEvents = getFilteredEvents(section.filter);

            // Fallback para misto se não houver eventos suficientes na categoria
            if (rowEvents.length <= 2) {
                rowEvents = getFilteredEvents('mixed');
            }

            if (section.limit) {
                rowEvents = rowEvents.slice(0, section.limit);
            }

            let injectedAd = null;
            let adPos = undefined;
            
            // Tenta puxar o anúncio caso a seção possua zona ou ID de anúncio definido
            if (section.adZone) {
                injectedAd = getRandomAd(section.adZone);
            } else if (section.adId) {
                injectedAd = adsList.find(a => a.id === section.adId);
            }

            // Calcula a posição (index-based); vazio = aleatório
            if (section.insertAdAt !== undefined && section.insertAdAt !== '') {
                const rawPos = parseInt(section.insertAdAt);
                adPos = Math.max(0, rawPos - 1);
            } else if (injectedAd) {
                // Posição aleatória dentro do array de eventos
                adPos = Math.floor(Math.random() * Math.max(1, rowEvents.length));
            }

            if (section.type === 'event_row') {
                html += createNetflixRow(section.title, rowEvents, injectedAd, adPos !== undefined ? adPos : 2, section.icon, section.filter || null);
            } else if (section.type === 'event_landscape_row') {
                html += createLandscapeRow(section.title, rowEvents, injectedAd, adPos !== undefined ? adPos : 2, section.icon, section.filter || null);
            } else if (section.type === 'event_list') {
                html += createListRow(section.title, rowEvents, injectedAd, adPos !== undefined ? adPos : 2, section.icon, section.filter || null);
            } else if (section.type === 'event_grid') {
                html += createGridSection(section.title, rowEvents, injectedAd, adPos !== undefined ? adPos : 2, section.icon, section.filter || null);
            } else if (section.type === 'event_featured_single') {
                html += createFeaturedSingle(section, rowEvents);
            } else if (section.type === 'event_bento_box') {
                html += createBentoSection(section.title, rowEvents, injectedAd, adPos !== undefined ? adPos : 0, section.icon, section.bentoLayout || null, section.filter || null);
            }
        } else if (section.type === 'producer_row') {
            // Para producer row, usamos os produtores salvos na window
            let rowProducers = [...(window.producers || [])];

            // Ordenar por hype (followers) para destacar os mais influentes
            rowProducers.sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0));

            if (section.limit) {
                rowProducers = rowProducers.slice(0, section.limit);
            }
            html += createProducerRow(section.title || 'Produtores em Alta', rowProducers, section.icon);
        }
    });

    // Renderiza o Hero Carousel apenas se houver eventos (seção configurada)
    const heroContainer = document.getElementById('hero-banner-container');
    if (heroContainer) {
        if (heroEvents.length > 0) {
            heroContainer.innerHTML = createHeroCarousel(heroEvents);
        } else {
            heroContainer.innerHTML = '';
            // Ajusta o view-home para não ter margem negativa se não tiver hero
            document.getElementById('view-home').classList.remove('-mt-6');
        }

        // --- LOGICA DE AUTO-PLAY E DOTS DO CARROSSEL ---
        const carouselEl = document.getElementById('hero-carousel-container');
        const dots = document.querySelectorAll('.hero-dot');

        if (carouselEl && dots.length > 1) {
            let currentSlide = 0;
            let autoPlayInterval;
            let isUserInteracting = false;
            const totalSlides = dots.length;

            const updateDots = (index) => {
                dots.forEach((dot, i) => {
                    if (i === index) {
                        dot.className = 'hero-dot transition-colors duration-300 w-1.5 h-1.5 rounded-full bg-white';
                    } else {
                        dot.className = 'hero-dot transition-colors duration-300 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/30';
                    }
                });
            };

            let direction = 1;

            // Função customizada para um scroll absurdamente suave e lento (1.2 segundos)
            const slowSmoothScroll = (targetLeft, duration = 1200) => {
                const startLeft = carouselEl.scrollLeft;
                const distance = targetLeft - startLeft;
                let startTime = null;

                const easeInOutQuart = (time, start, change, duration) => {
                    time /= duration / 2;
                    if (time < 1) return change / 2 * time * time * time * time + start;
                    time -= 2;
                    return -change / 2 * (time * time * time * time - 2) + start;
                };

                const animation = (currentTime) => {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const nextLeft = easeInOutQuart(timeElapsed, startLeft, distance, duration);

                    carouselEl.scrollLeft = nextLeft;

                    if (timeElapsed < duration) {
                        requestAnimationFrame(animation);
                    } else {
                        carouselEl.scrollLeft = targetLeft;
                    }
                };
                requestAnimationFrame(animation);
            };

            const goToNextSlide = () => {
                if (isUserInteracting) return;

                // Lógica de Vai-e-Vem (Ping-Pong) para evitar o pulo violento de rebobinagem
                if (currentSlide === totalSlides - 1) {
                    direction = -1; // Volta
                } else if (currentSlide === 0) {
                    direction = 1; // Vai
                }

                currentSlide += direction;
                const slideWidth = carouselEl.clientWidth;

                // Em vez do behavior 'smooth' nativo rápido, usamos o nosso super suave
                slowSmoothScroll(slideWidth * currentSlide, 1500);
            };

            // Listener passivo para atualizar as bolinhas quando rola manualmente ou auto
            carouselEl.addEventListener('scroll', () => {
                const slideWidth = carouselEl.clientWidth;
                const scrollLeft = carouselEl.scrollLeft;
                const newIndex = Math.round(scrollLeft / slideWidth);
                if (newIndex !== currentSlide) {
                    currentSlide = newIndex;
                    updateDots(currentSlide);
                }
            }, { passive: true });

            // Inicia o autoplay a cada 8 segundos (Visão de Negócios)
            const startAutoPlay = () => {
                if (autoPlayInterval) clearInterval(autoPlayInterval);
                autoPlayInterval = setInterval(goToNextSlide, 8000);
            };

            // Pausa enquanto o usuário estiver tocando/olhando
            const pauseAutoPlay = () => {
                if (autoPlayInterval) clearInterval(autoPlayInterval);
            };

            // Retoma a rotação de patrocinadores quando o usuário soltar
            carouselEl.addEventListener('touchstart', pauseAutoPlay, { passive: true });
            carouselEl.addEventListener('touchend', startAutoPlay, { passive: true });
            carouselEl.addEventListener('mouseenter', pauseAutoPlay);
            carouselEl.addEventListener('mouseleave', startAutoPlay);

            startAutoPlay();
        }
    }

    container.innerHTML = html;

    // 6. Adiciona Listeners

    // Modal de Eventos (Event Delegation para suportar cartões dinâmicos da busca)
    document.addEventListener('click', (e) => {
        const card = e.target.closest('article[data-event-id]');
        if (card) {
            const eventId = card.dataset.eventId;
            const eventData = window.allEvents ? window.allEvents.find(ev => ev.id.toString() === eventId.toString()) : events.find(ev => ev.id.toString() === eventId.toString());
            if (eventData) {
                openEventModal(eventData);
            }
        }
    });

    // Modal do Hero Carousel (Multiplos botões agora)
    const heroInfoBtns = document.querySelectorAll('.js-hero-info-btn');
    heroInfoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            try {
                const eventData = JSON.parse(btn.dataset.heroEvent);
                openEventModal(eventData);
            } catch (error) {
                console.error("Erro ao abrir modal do Hero Carousel", error);
            }
        });
    });

    // 7. Configuração da Tarja Fixa Inteligente (Scroll Handler)
    const stickyAd = document.getElementById('smart-sticky-ad');
    let lastScrollY = window.scrollY;

    const btnCloseAd = document.getElementById('close-sticky-ad');
    const fabTaxi = document.getElementById('fab-taxi');
    let isAdDismissed = false;

    if (stickyAd && btnCloseAd && fabTaxi) {
        // Quando o usuário fecha a tarja
        btnCloseAd.addEventListener('click', (e) => {
            e.stopPropagation();
            isAdDismissed = true;

            stickyAd.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
            stickyAd.classList.remove('translate-y-0', 'opacity-100');

            fabTaxi.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
            fabTaxi.classList.add('translate-y-0', 'opacity-100');
        });

        // Quando o usuário clica no botão flutuante para recuperar
        fabTaxi.addEventListener('click', () => {
            isAdDismissed = false;

            fabTaxi.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
            fabTaxi.classList.remove('translate-y-0', 'opacity-100');

            stickyAd.classList.remove('translate-y-20', 'translate-y-[150%]', 'opacity-0', 'pointer-events-none');
            stickyAd.classList.add('translate-y-0', 'opacity-100');
        });

        window.addEventListener('scroll', () => {
            if (isAdDismissed) return;

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

    // ==========================================
    // SPA ROUTER LOGIC (Navegação Instantânea)
    // ==========================================

    // Renderiza o grid de busca
    const searchGridContainer = document.getElementById('explore-grid-container');
    if (searchGridContainer) {
        searchGridContainer.innerHTML = createExploreGrid(allCategoriesForGrid);
    }

    // Renderiza Trending Searches
    const trendingContainer = document.getElementById('trending-container');
    if (trendingContainer && appData.trendingSearches) {
        trendingContainer.innerHTML = appData.trendingSearches.map((term, index) => `
            <button data-search-trigger="keyword" data-search-value="${term}" class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-500 transition-colors shrink-0">
                <span class="text-xs font-bold text-slate-400">#${index + 1}</span>
                <span class="text-sm font-bold text-slate-800 dark:text-slate-200">${term}</span>
            </button>
        `).join('');
    }

    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.spa-view');

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetViewId = 'view-' + btn.dataset.navTarget;

            const currentActiveView = Array.from(views).find(v => !v.classList.contains('hidden'));

            // Se clicar no mesmo botão que já está ativo, rola para o topo suavemente (comportamento nativo de apps)
            if (currentActiveView && currentActiveView.id === targetViewId) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // Salva a posição de rolagem da view atual
            if (currentActiveView) {
                window.viewScrollPositions = window.viewScrollPositions || {};
                window.viewScrollPositions[currentActiveView.id] = window.scrollY;
            }

            // 1. Esconde todas as views e mostra a selecionada
            views.forEach(view => {
                if (view.id === targetViewId) {
                    view.classList.remove('hidden');
                    // Pequeno delay para a transição de opacidade funcionar
                    setTimeout(() => view.classList.remove('opacity-0'), 10);
                } else {
                    view.classList.add('hidden', 'opacity-0');
                }
            });

            // 2. Atualiza estado visual dos botões
            navButtons.forEach(nav => {
                nav.classList.remove('text-primary-500');
                nav.classList.add('text-slate-400', 'dark:text-slate-400');

                const icon = nav.querySelector('.nav-icon');
                if (icon) {
                    icon.classList.remove('ph-fill');
                    icon.classList.add('ph');
                }
            });

            // Ativa o botão clicado
            btn.classList.remove('text-slate-400', 'dark:text-slate-400');
            btn.classList.add('text-primary-500');
            const clickedIcon = btn.querySelector('.nav-icon');
            if (clickedIcon) {
                clickedIcon.classList.remove('ph');
                clickedIcon.classList.add('ph-fill');
            }

            // Lógica Específica da Tela Minha Lista
            if (btn.dataset.navTarget === 'favorites') {
                renderFavoritesView();
            } else if (btn.dataset.navTarget === 'profile') {
                renderProfileView();
            }

            // Restaura o scroll salvo da tela alvo ou vai pro topo
            const savedScroll = (window.viewScrollPositions && window.viewScrollPositions[targetViewId]) || 0;
            window.scrollTo({ top: savedScroll, behavior: 'auto' });
        });
    });

    // ==========================================
    // LÓGICA DE BUSCA PRINCIPAL (DISCOVER HUB)
    // ==========================================
    const mainSearchInput = document.getElementById('main-search-input');
    const exploreContent = document.getElementById('explore-content');
    const inlineSearchContent = document.getElementById('inline-search-content');
    const inlineSearchGrid = document.getElementById('inline-search-grid');
    const inlineNoResults = document.getElementById('inline-no-results');

    // Estado dos filtros rápidos da busca principal
    let mainSearchQuery = '';
    let mainSearchFilter = null; // 'nearest', 'free', 'promo'

    const renderMainSearch = () => {
        if (!mainSearchInput) return;

        mainSearchQuery = mainSearchInput.value.toLowerCase();

        // Se não tem texto E não tem filtro ativado, mostra o Discover
        if (mainSearchQuery.trim() === '' && !mainSearchFilter) {
            exploreContent.classList.remove('hidden');
            inlineSearchContent.classList.add('hidden');
            return;
        }

        // Caso contrário, mostra a área de resultados
        exploreContent.classList.add('hidden');
        inlineSearchContent.classList.remove('hidden');

        // Esconde o header de seção (se estava ativo) e mostra o label padrão
        const sectionHeaderWrapper = document.getElementById('inline-section-header-wrapper');
        const resultsLabel = document.getElementById('inline-results-label');
        if (sectionHeaderWrapper) sectionHeaderWrapper.classList.add('hidden');
        if (resultsLabel) resultsLabel.classList.remove('hidden');

        // Filtra os eventos
        let filtered = [...(window.allEvents || events)];

        // 1. Filtro por Texto (Título, Categoria ou Organizador)
        if (mainSearchQuery.trim() !== '') {
            filtered = filtered.filter(e =>
                (e.title && e.title.toLowerCase().includes(mainSearchQuery)) ||
                (e.category && e.category.toLowerCase().includes(mainSearchQuery)) ||
                (e.organizer && e.organizer.toLowerCase().includes(mainSearchQuery))
            );
        }

        // 2. Filtro por Pílulas Rápidas
        if (mainSearchFilter === 'free') {
            filtered = filtered.filter(e => e.price === 'Gratuitos' || e.price === 'Gratuito');
        } else if (mainSearchFilter === 'nearest') {
            // Apenas um mock visual para 'Próximos': ordena por data
            filtered = filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (mainSearchFilter === 'promo') {
            filtered = filtered.filter(e => e.promotion);
        }

        // Renderiza
        if (filtered.length > 0) {
            inlineSearchGrid.innerHTML = filtered.map(e => createGridCard(e)).join('');
            inlineSearchGrid.classList.remove('hidden');
            inlineNoResults.classList.add('hidden');
        } else {
            inlineSearchGrid.classList.add('hidden');
            inlineNoResults.classList.remove('hidden');
        }
    };

    const sectionModal = document.getElementById('section-view-modal');
    const sectionMain = document.getElementById('section-view-main');
    let sectionViewOpen = false;
    let sectionViewClosing = false;

    const populateSectionGrid = (filtered) => {
        const sectionGrid = document.getElementById('section-view-grid');
        const sectionNoResults = document.getElementById('section-view-no-results');
        if (!sectionGrid || !sectionNoResults) return;

        if (filtered.length > 0) {
            sectionGrid.innerHTML = filtered.map(e => createGridCard(e)).join('');
            sectionGrid.classList.remove('hidden');
            sectionNoResults.classList.add('hidden');
            sectionNoResults.classList.remove('flex');
        } else {
            sectionGrid.innerHTML = '';
            sectionGrid.classList.add('hidden');
            sectionNoResults.classList.remove('hidden');
            sectionNoResults.classList.add('flex');
        }
    };

    const clearSectionGrid = () => {
        const sectionGrid = document.getElementById('section-view-grid');
        const sectionNoResults = document.getElementById('section-view-no-results');
        if (sectionGrid) {
            sectionGrid.innerHTML = '';
            sectionGrid.classList.remove('hidden');
        }
        if (sectionNoResults) {
            sectionNoResults.classList.add('hidden');
            sectionNoResults.classList.remove('flex');
        }
    };

    const resetSectionViewContent = () => {
        const sectionGrid = document.getElementById('section-view-grid');
        const sectionNoResults = document.getElementById('section-view-no-results');
        if (sectionGrid) {
            sectionGrid.innerHTML = '';
            sectionGrid.classList.remove('hidden');
        }
        if (sectionNoResults) {
            sectionNoResults.classList.add('hidden');
            sectionNoResults.classList.remove('flex');
        }
        if (sectionMain) sectionMain.classList.remove('is-visible');
    };

    const hideSectionContent = () => {
        if (sectionMain) sectionMain.classList.remove('is-visible');
    };

    const revealSectionContent = () => {
        requestAnimationFrame(() => {
            if (sectionMain) sectionMain.classList.add('is-visible');
        });
    };

    const closeSectionView = () => {
        if (!sectionModal || !sectionViewOpen || sectionViewClosing) return;

        sectionViewClosing = true;
        sectionViewOpen = false;
        hideSectionContent();

        const slideOut = () => {
            sectionModal.classList.add('is-closing', 'translate-x-full');
            document.body.style.overflow = '';

            const finishClose = () => {
                if (!sectionViewClosing) return;
                sectionModal.classList.remove('is-closing');
                sectionViewClosing = false;
                resetSectionViewContent();
            };

            sectionModal.addEventListener('transitionend', function onCloseEnd(e) {
                if (e.target !== sectionModal || e.propertyName !== 'transform') return;
                sectionModal.removeEventListener('transitionend', onCloseEnd);
                finishClose();
            });

            setTimeout(finishClose, 350);
        };

        // Some o conteúdo primeiro; só depois desliza a tela para fora
        setTimeout(slideOut, 120);
    };

    // Renderiza resultados de uma seção em push de tela cheia (preserva contexto da home)
    const renderSectionFilterView = (sectionTitle, filterStr) => {
        const sectionTitleEl = document.getElementById('section-view-title');

        if (!sectionModal || sectionViewClosing) return;

        const filtered = getFilteredEvents(filterStr);
        if (sectionTitleEl) sectionTitleEl.textContent = sectionTitle || 'Resultados';

        if (sectionMain) sectionMain.scrollTop = 0;
        hideSectionContent();

        // Já aberto: só troca conteúdo com fade (sem novo slide)
        if (sectionViewOpen) {
            setTimeout(() => {
                populateSectionGrid(filtered);
                revealSectionContent();
            }, 130);
            return;
        }

        // Primeira abertura: slide só com header; grid entra depois que a tela assenta
        clearSectionGrid();

        sectionModal.classList.remove('is-closing');
        sectionModal.classList.add('translate-x-full');
        sectionModal.offsetHeight;

        sectionViewOpen = true;
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                sectionModal.classList.remove('translate-x-full');
            });
        });

        const onOpenEnd = (e) => {
            if (e.target !== sectionModal || e.propertyName !== 'transform') return;
            sectionModal.removeEventListener('transitionend', onOpenEnd);
            populateSectionGrid(filtered);
            revealSectionContent();
        };

        sectionModal.addEventListener('transitionend', onOpenEnd);
        setTimeout(() => {
            if (sectionViewOpen && sectionMain && !sectionMain.classList.contains('is-visible')) {
                populateSectionGrid(filtered);
                revealSectionContent();
            }
        }, 420);
    };

    const closeSectionBtn = document.getElementById('close-section-view-btn');
    if (closeSectionBtn) closeSectionBtn.addEventListener('click', closeSectionView);

    // Eventos do Input
    if (mainSearchInput) {
        mainSearchInput.addEventListener('input', renderMainSearch);

        // Limpar busca (opcional, se o usuário apagar tudo)
        mainSearchInput.addEventListener('search', () => {
            if (mainSearchInput.value === '') renderMainSearch();
        });
    }

    // Botões de Gatilho de Busca (Trending Topics e Categorias)
    document.addEventListener('click', (e) => {
        const triggerBtn = e.target.closest('[data-search-trigger]');
        if (triggerBtn && mainSearchInput) {
            const term = triggerBtn.getAttribute('data-search-value');
            const sectionFilter = triggerBtn.getAttribute('data-section-filter');
            const triggerType = triggerBtn.getAttribute('data-search-trigger');

            if (sectionFilter) {
                // Filtro de seção da home → modal overlay (não navegar para view-results)
                e.preventDefault();
                renderSectionFilterView(term, sectionFilter);
                return;
            }

            // Gatilhos "category" sem filtro de seção são tratados no handler de categorias abaixo
            if (triggerType === 'category') return;

            if (term) {
                // Trending / keyword na aba Buscar → busca inline
                mainSearchInput.value = term;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                renderMainSearch();
            }
        }

        // Botões de Filtros Rápidos
        const filterBtn = e.target.closest('.search-filter-btn');
        if (filterBtn && filterBtn.closest('#view-search')) {
            const filterType = filterBtn.getAttribute('data-filter');

            // Toggle visual e lógico
            if (mainSearchFilter === filterType) {
                mainSearchFilter = null; // Desativa
                filterBtn.classList.remove('bg-slate-800', 'dark:bg-slate-200', 'text-white', 'dark:text-slate-900', 'border-slate-800');
                filterBtn.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300', 'border-slate-300');
            } else {
                mainSearchFilter = filterType; // Ativa

                // Reseta visual de todos os outros
                document.querySelectorAll('#view-search .search-filter-btn').forEach(btn => {
                    btn.classList.remove('bg-slate-800', 'dark:bg-slate-200', 'text-white', 'dark:text-slate-900', 'border-slate-800');
                    btn.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300', 'border-slate-300');
                });

                // Ativa o clicado
                filterBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300', 'border-slate-300');
                filterBtn.classList.add('bg-slate-800', 'dark:bg-slate-200', 'text-white', 'dark:text-slate-900', 'border-slate-800');
            }

            renderMainSearch();
        }
    });

    // ==========================================
    // TELA: MINHA LISTA (FAVORITOS)
    // ==========================================
    let favSearchQuery = '';
    let favActiveCategory = null;
    let activeFavoritesTab = 'events'; // 'events' ou 'producers'

    const renderFavoritesView = () => {
        const favContainer = document.getElementById('favorites-grid');
        const emptyMsg = document.getElementById('favorites-empty-msg');
        const controlsDiv = document.getElementById('favorites-controls');
        const pillsContainer = document.getElementById('favorites-category-pills');

        const favIds = getFavorites();

        if (favIds.length === 0) {
            favContainer.innerHTML = '';
            controlsDiv.classList.add('hidden');
            controlsDiv.classList.remove('flex');
            emptyMsg.classList.remove('hidden');
            emptyMsg.classList.add('flex');
            if (document.getElementById('favorites-events-title')) document.getElementById('favorites-events-title').classList.add('hidden');

            // Zera filtros se escondido
            favSearchQuery = '';
            favActiveCategory = null;
            const favSearchInput = document.getElementById('favorites-search-input');
            if (favSearchInput) favSearchInput.value = '';
        } else {
            emptyMsg.classList.add('hidden');
            emptyMsg.classList.remove('flex');
            if (document.getElementById('favorites-events-title')) document.getElementById('favorites-events-title').classList.remove('hidden');

            // Verifica a configuração de threshold no appData (Admin Config)
            const minFavoritesToSearch = (appData && appData.settings && appData.settings.minFavoritesToSearch) ? appData.settings.minFavoritesToSearch : 5;

            if (favIds.length < minFavoritesToSearch) {
                controlsDiv.classList.add('hidden');
                controlsDiv.classList.remove('flex');
                // Zera filtros se escondido
                favSearchQuery = '';
                favActiveCategory = null;
                const favSearchInput = document.getElementById('favorites-search-input');
                if (favSearchInput) favSearchInput.value = '';
            } else {
                controlsDiv.classList.remove('hidden');
                controlsDiv.classList.add('flex');
            }

            const myFavEvents = (window.allEvents || events).filter(e => favIds.includes(e.id));

            // 1. Gera as categorias únicas para as pílulas
            const uniqueCategories = [...new Set(myFavEvents.map(e => e.category))].filter(Boolean);
            let pillsHtml = `<button class="fav-category-btn px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors border ${!favActiveCategory ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}" data-category="">Todos</button>`;

            uniqueCategories.forEach(cat => {
                const isActive = favActiveCategory === cat;
                pillsHtml += `<button class="fav-category-btn px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors border ${isActive ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}" data-category="${cat}">${cat}</button>`;
            });

            if (pillsContainer) pillsContainer.innerHTML = pillsHtml;

            // 2. Aplica filtros
            let filteredFavs = myFavEvents;

            if (favActiveCategory) {
                filteredFavs = filteredFavs.filter(e => e.category === favActiveCategory);
            }

            if (favSearchQuery.trim() !== '') {
                const term = favSearchQuery.toLowerCase();
                filteredFavs = filteredFavs.filter(e =>
                    (e.title && e.title.toLowerCase().includes(term)) ||
                    (e.organizer && e.organizer.toLowerCase().includes(term)) ||
                    (e.city && e.city.toLowerCase().includes(term)) ||
                    (e.category && e.category.toLowerCase().includes(term))
                );
            }

            // 3. Renderiza
            let htmlStr = '';
            if (filteredFavs.length > 0) {
                filteredFavs.forEach(e => {
                    htmlStr += createGridCard(e);
                });
            } else {
                htmlStr = `<div class="col-span-2 sm:col-span-3 text-center py-10 text-slate-500 text-sm">Nenhum favorito encontrado para esta busca.</div>`;
            }

            favContainer.innerHTML = htmlStr;
        }

        // ==========================================
        // Aba Produtores
        // ==========================================
        const prodContainer = document.getElementById('favorites-producers-grid');
        const prodEmptyMsg = document.getElementById('favorites-producers-empty-msg');

        const followingProducers = JSON.parse(localStorage.getItem('@EventApp:following')) || [];

        if (followingProducers.length === 0) {
            if (prodContainer) prodContainer.innerHTML = '';
            if (prodEmptyMsg) {
                prodEmptyMsg.classList.remove('hidden');
                prodEmptyMsg.classList.add('flex');
            }
            if (document.getElementById('favorites-producers-title')) document.getElementById('favorites-producers-title').classList.add('hidden');
        } else {
            if (prodEmptyMsg) {
                prodEmptyMsg.classList.add('hidden');
                prodEmptyMsg.classList.remove('flex');
            }
            if (document.getElementById('favorites-producers-title')) document.getElementById('favorites-producers-title').classList.remove('hidden');
            const myProducers = (window.producers || []).filter(p => followingProducers.includes(p.id));
            let prodHtml = '';
            myProducers.forEach(p => {
                prodHtml += createProducerAvatar(p);
            });
            if (prodContainer) prodContainer.innerHTML = prodHtml;
        }

        // Atualiza a visibilidade baseada na tab ativa
        const eventsContainerDiv = document.getElementById('favorites-events-container');
        const producersContainerDiv = document.getElementById('favorites-producers-container');

        if (activeFavoritesTab === 'events') {
            if (eventsContainerDiv) eventsContainerDiv.classList.remove('hidden');
            if (producersContainerDiv) producersContainerDiv.classList.add('hidden');
            if (favIds.length > 0 && favIds.length >= ((appData && appData.settings && appData.settings.minFavoritesToSearch) ? appData.settings.minFavoritesToSearch : 5)) {
                controlsDiv.classList.remove('hidden', 'opacity-0');
                controlsDiv.classList.add('flex');
            }
        } else {
            if (eventsContainerDiv) eventsContainerDiv.classList.add('hidden');
            if (producersContainerDiv) producersContainerDiv.classList.remove('hidden');
            controlsDiv.classList.add('hidden', 'opacity-0');
            controlsDiv.classList.remove('flex');
        }

        // Renderiza sugestões de Eventos e Produtores dinamicamente
        const eventsSuggestionsContainer = document.getElementById('favorites-events-suggestions');
        const eventsSuggestionsGrid = document.getElementById('favorites-events-suggestions-grid');
        const producersSuggestionsContainer = document.getElementById('favorites-producers-suggestions');
        const producersSuggestionsGrid = document.getElementById('favorites-producers-suggestions-grid');

        if (activeFavoritesTab === 'events') {
            if (producersSuggestionsContainer) producersSuggestionsContainer.classList.add('hidden');

            if (eventsSuggestionsContainer && eventsSuggestionsGrid) {
                let suggestions = [...(window.allEvents || events)]
                    .filter(e => !favIds.includes(e.id))
                    .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
                    .slice(0, 4);

                if (suggestions.length > 0) {
                    const favAdId = appData?.settings?.favoritesAdId;
                    const favAdPos = appData?.settings?.favoritesAdPosition !== undefined ? appData?.settings?.favoritesAdPosition : 1;
                    const adData = (favAdId && ads[favAdId]) ? ads[favAdId] : null;

                    let cardsArray = suggestions.map(e => createGridCard(e));

                    if (adData) {
                        cardsArray.splice(favAdPos, 0, createGridAdCard(adData));
                        if (cardsArray.length > 4) cardsArray.pop();
                    }

                    eventsSuggestionsGrid.innerHTML = cardsArray.join('');
                    eventsSuggestionsContainer.classList.remove('hidden');
                } else {
                    eventsSuggestionsContainer.classList.add('hidden');
                }
            }
        } else {
            if (eventsSuggestionsContainer) eventsSuggestionsContainer.classList.add('hidden');

            if (producersSuggestionsContainer && producersSuggestionsGrid) {
                let prodSuggestions = [...(window.producers || [])]
                    .filter(p => !followingProducers.includes(p.id))
                    .sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0))
                    .slice(0, 3); // Limita a 3 itens principais

                if (prodSuggestions.length > 0) {
                    let prodHtml = prodSuggestions.map(p => createProducerAvatar(p)).join('');

                    // Adiciona o botão de "Ver Todos" no final da grade
                    prodHtml += `
                    <div class="flex flex-col items-center cursor-pointer js-view-all-producers group h-full justify-start mt-1">
                        <div class="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-transparent group-hover:border-primary-500 transition-colors shadow-sm mb-2 shrink-0">
                            <i class="ph-bold ph-plus text-slate-500 dark:text-slate-400 group-hover:text-primary-500 text-xl transition-colors"></i>
                        </div>
                        <span class="text-slate-700 dark:text-slate-300 font-bold text-[10px] text-center w-full group-hover:text-primary-500 transition-colors line-clamp-2 leading-tight px-1">Ver Todos</span>
                    </div>
                    `;

                    producersSuggestionsGrid.innerHTML = prodHtml;
                    producersSuggestionsContainer.classList.remove('hidden');
                } else {
                    producersSuggestionsContainer.classList.add('hidden');
                }
            }
        }
    };

    const renderProfileView = () => {
        const profileContainer = document.getElementById('view-profile');
        if (!profileContainer) return;

        const profileData = appData?.userProfile;
        if (!profileData) {
            profileContainer.innerHTML = '<div class="p-6 text-center text-slate-500">Dados de perfil não encontrados.</div>';
            return;
        }

        // Header do Usuário
        let htmlStr = `
            <header class="px-6 py-6 mt-14 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-primary-500 to-amber-400 shadow-lg shrink-0">
                        <img src="${profileData.avatarUrl}" alt="${profileData.name}" class="w-full h-full rounded-full border-2 border-white dark:border-slate-900 object-cover bg-white">
                    </div>
                    <div>
                        <h2 class="text-xl font-black text-slate-800 dark:text-white leading-tight mb-0.5">${profileData.name}</h2>
                        <p class="text-xs font-medium text-slate-500 dark:text-slate-400">${profileData.email}</p>
                    </div>
                </div>
                <button class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
                    <i class="ph-bold ph-gear text-xl"></i>
                </button>
            </header>
            <main class="px-4 pb-10">
        `;

        // Processamento de Ingressos
        if (profileData.tickets && profileData.tickets.length > 0) {
            // Mapeia os tickets mockados para os eventos reais do window.allEvents
            const myTickets = profileData.tickets.map(t => {
                const eventInfo = (window.allEvents || events).find(e => e.id.toString() === t.eventId.toString());
                return { ...t, event: eventInfo };
            }).filter(t => t.event); // Remove os que não encontraram evento

            if (myTickets.length > 0) {
                // Ordena por data (mais próximo primeiro)
                myTickets.sort((a, b) => new Date(a.event.date) - new Date(b.event.date));

                const nextTicket = myTickets[0];
                const otherTickets = myTickets.slice(1);

                htmlStr += `
                    <div class="mb-8">
                        <div class="flex items-center gap-2 mb-4 px-2">
                            <i class="ph-fill ph-ticket text-primary-500 text-xl"></i>
                            <h3 class="text-base font-black text-slate-800 dark:text-white tracking-tight">Próximo Evento</h3>
                        </div>
                        ${createHeroTicket(nextTicket)}
                    </div>
                `;

                if (otherTickets.length > 0) {
                    htmlStr += `
                        <div class="mb-8">
                            <div class="flex items-center gap-2 mb-3 px-2">
                                <h3 class="text-sm font-bold text-slate-800 dark:text-white tracking-tight">Meus Ingressos</h3>
                                <span class="bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">${otherTickets.length}</span>
                            </div>
                            <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4 -mx-4 px-4">
                                ${otherTickets.map(t => createSmallTicket(t)).join('')}
                            </div>
                        </div>
                    `;
                }
            } else {
                htmlStr += `
                    <div class="mb-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center border border-dashed border-slate-300 dark:border-slate-700">
                        <i class="ph-fill ph-ticket text-4xl text-slate-300 dark:text-slate-600 mb-3"></i>
                        <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nenhum ingresso futuro</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">Você ainda não tem ingressos para os próximos eventos.</p>
                    </div>
                `;
            }
        } else {
            htmlStr += `
                <div class="mb-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center border border-dashed border-slate-300 dark:border-slate-700">
                    <i class="ph-fill ph-ticket text-4xl text-slate-300 dark:text-slate-600 mb-3"></i>
                    <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nenhum ingresso futuro</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Você ainda não comprou ingressos.</p>
                </div>
            `;
        }

        // Menu de Ações (createProfileMenu)
        htmlStr += `
            <div class="mb-8">
                <h3 class="text-sm font-black tracking-tight text-slate-800 dark:text-white mb-3 px-2">Sua Conta</h3>
                ${createProfileMenu()}
            </div>
            
            <button class="w-full flex items-center justify-center gap-2 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl font-bold transition-colors mb-8">
                <i class="ph-bold ph-sign-out text-lg"></i> Sair da conta
            </button>
        </main>`;

        profileContainer.innerHTML = htmlStr;
    };

    // Listener para o Input de Busca de Favoritos
    const favSearchInput = document.getElementById('favorites-search-input');
    if (favSearchInput) {
        favSearchInput.addEventListener('input', (e) => {
            favSearchQuery = e.target.value;
            renderFavoritesView();
        });
    }

    // Listener (Event Delegation) para os Botões de Categoria de Favoritos
    document.addEventListener('click', (e) => {
        const favBtn = e.target.closest('.fav-category-btn');
        if (favBtn) {
            e.preventDefault();
            favActiveCategory = favBtn.dataset.category || null;
            renderFavoritesView();
        }
    });

    // ==========================================
    // MOTOR DE BUSCA E FILTROS (Search Engine)
    // ==========================================
    let lastActiveViewId = 'view-home'; // Para o botão voltar saber pra onde ir

    // Estado dos subfiltros
    const activeFilters = {
        hot: false,
        nearest: false,
        free: false,
        promo: false
    };

    // Armazena os resultados crus da última busca para podermos re-filtrar
    let currentRawResults = [];

    // Aplica os subfiltros em cima do resultado atual e desenha na tela
    const applyFiltersAndRender = (targetContext = 'results') => {
        const resultsGrid = targetContext === 'inline'
            ? document.getElementById('inline-search-grid')
            : document.getElementById('results-grid');

        const noResultsMsg = targetContext === 'inline'
            ? document.getElementById('inline-no-results')
            : document.getElementById('no-results-msg');

        let finalResults = [...currentRawResults];

        // Filtro Grátis
        if (activeFilters.free) {
            finalResults = finalResults.filter(e => {
                const p = e.price.toLowerCase();
                return p.includes('free') || p.includes('grátis') || p.includes('gratuito') || p === 'r$ 0,00';
            });
        }

        // Filtro Benefícios (Promo)
        if (activeFilters.promo) {
            finalResults = finalResults.filter(e => !!e.promotion);
        }

        // Ordenar por Em Alta (Heat)
        if (activeFilters.hot) {
            finalResults.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        }

        // Ordenar por Mais Próximos (sobrescreve se ambos ativos)
        if (activeFilters.nearest) {
            finalResults.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        // ESTRATÉGIA 1: "Top of Search" Patrocinado
        // Localiza um evento promovido no banco de dados para ser nosso anúncio
        const sponsoredEvent = window.allEvents.find(e => e.featured || e.promotion);

        // Verifica se a busca ORGÂNICA encontrou alguma coisa
        const hasOrganicResults = finalResults.length > 0;

        if (sponsoredEvent && hasOrganicResults) {
            // Se achou coisas, injetamos o Ad no topo da lista orgânica (Top of Search)
            finalResults = finalResults.filter(e => e.id !== sponsoredEvent.id);
            finalResults.unshift({ ...sponsoredEvent, isSponsoredSearch: true });
        }

        // Renderiza Resultados com ESTRATÉGIA 5: Injeção de Anúncios Nativos no Grid
        if (finalResults.length > 0) {
            let htmlString = '';
            finalResults.forEach((e, index) => {
                htmlString += createGridCard(e, index);

                // A cada 6 cartões (ou seja, index 5, 11...), injeta um banner nativo que ocupa as 2 colunas
                if ((index + 1) % 6 === 0) {
                    // Tenta usar um anúncio do objeto local ads
                    const adData = Object.values(ads).find(a => a.format !== 'utility') || {
                        advertiser: "Patrocinador",
                        logo: "https://ui-avatars.com/api/?name=AD&background=e2e8f0&color=94a3b8",
                        image: "https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=600&h=300&fit=crop",
                        title: "Sugestão para você",
                        description: "Confira as melhores opções em nossa plataforma.",
                        cta: "Ver mais"
                    };
                    htmlString += `
                        <div class="col-span-2 w-full my-3 fade-in-up" style="animation-delay: ${index * 50}ms">
                            ${createNativeAdCard(adData)}
                        </div>
                    `;
                }
            });

            resultsGrid.innerHTML = htmlString;
            resultsGrid.classList.remove('hidden');
            noResultsMsg.classList.add('hidden');
        } else {
            // ESTRATÉGIA 2: Zero-State Ads
            // Se a busca orgânica falhou, mostramos a tela de erro com uma sugestão elegante
            let suggestedAdHtml = '';
            if (sponsoredEvent) {
                const dateObj = new Date(sponsoredEvent.date);
                const day = dateObj.getDate().toString().padStart(2, '0');
                const month = dateObj.toLocaleString('pt-BR', { month: 'short' }).substring(0, 3).toUpperCase();

                suggestedAdHtml = `
                    <div class="mt-8 w-full px-4 sm:px-8 max-w-md mx-auto animate-fade-in-up">
                        <div class="flex items-center justify-between mb-3 px-1">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sugestão Patrocinada</p>
                            <span class="text-[8px] font-black bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded shadow-sm border border-yellow-500/30 tracking-wider">AD</span>
                        </div>
                        
                        <article data-event-id="${sponsoredEvent.id}" class="relative w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden flex items-center p-2.5 gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors shadow-sm backdrop-blur-sm group">
                            <div class="w-16 h-20 rounded-lg overflow-hidden shrink-0 relative shadow-sm">
                                <img src="${sponsoredEvent.imageUrl || sponsoredEvent.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div class="absolute bottom-1 left-0 w-full text-center">
                                    <span class="text-[9px] font-bold text-white drop-shadow-md">${day} ${month}</span>
                                </div>
                            </div>
                            <div class="flex-1 min-w-0 flex flex-col justify-center py-1">
                                <h4 class="text-slate-800 dark:text-white font-bold text-sm leading-tight truncate mb-0.5">${sponsoredEvent.title}</h4>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2">${sponsoredEvent.city}</p>
                                <div class="flex items-center">
                                    <span class="text-[9px] font-bold bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded border border-primary-100 dark:border-primary-500/30 truncate max-w-[120px] shadow-sm">
                                        <i class="ph-bold ph-gift mr-1"></i>${sponsoredEvent.promotion ? sponsoredEvent.promotion.label : 'Destaque Exclusivo'}
                                    </span>
                                </div>
                            </div>
                            <div class="shrink-0 pr-2">
                                <div class="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 dark:text-white group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                    <i class="ph-bold ph-caret-right"></i>
                                </div>
                            </div>
                        </article>
                    </div>
                `;
            }

            resultsGrid.innerHTML = '';
            resultsGrid.classList.add('hidden');

            noResultsMsg.innerHTML = `
                <div class="flex flex-col items-center">
                    <i class="ph-bold ph-magnifying-glass text-4xl mb-2 opacity-50"></i>
                    <p class="text-sm font-medium">Nenhum evento encontrado.</p>
                </div>
                ${suggestedAdHtml}
            `;
            noResultsMsg.classList.remove('hidden');
        }
    };

    // Função principal do motor (Busca base)
    const renderSearchResults = (query, type) => {
        const resultsTitle = document.getElementById('results-title');

        let filteredEvents = [];
        const normalizedQuery = query.toLowerCase().trim();

        if (type === 'category') {
            resultsTitle.textContent = query;

            // Reseta e Espelha o estado dos filtros (Feedback visual)
            Object.keys(activeFilters).forEach(k => activeFilters[k] = false);

            // Mapeamento Inteligente: Identifica se a query é o título de uma prateleira da Home
            if (query === 'Em Alta na Fronteira') {
                activeFilters.hot = true;
                filteredEvents = window.allEvents.filter(e => e.featured || e.promotion);
            } else if (query === '100% Gratuito') {
                activeFilters.free = true;
                filteredEvents = window.allEvents.filter(e => {
                    const p = (e.price || '').toLowerCase();
                    return p.includes('free') || p.includes('grátis') || p.includes('gratuito') || p === 'r$ 0,00';
                });
            } else if (query === 'Para Curtir a Noite') {
                filteredEvents = window.allEvents.filter(e => e.category === 'Festa' || e.category === 'Música' || (e.tags && (e.tags.includes('Festa') || e.tags.includes('Balada') || e.tags.includes('Samba') || e.tags.includes('Eletrônica'))));
            } else if (query === 'Programação Cultural') {
                filteredEvents = window.allEvents.filter(e => e.category === 'Cultura' || e.category === 'Teatro' || e.category === 'Artes' || (e.tags && (e.tags.includes('Cultural') || e.tags.includes('Gastronomia') || e.tags.includes('Esporte'))));
            } else if (query === 'Especial de Inverno: Rota do Vinho 🍷') {
                filteredEvents = window.allEvents.filter(e => e.title.toLowerCase().includes('vinho') || (e.description && e.description.toLowerCase().includes('vinho')));
            } else {
                // Busca simplificada por categoria ou tag (Grid de Explorar)
                filteredEvents = window.allEvents.filter(e => {
                    const catMatch = e.category && e.category.toLowerCase().includes(normalizedQuery);
                    const tagMatch = e.tags && e.tags.some(t => t.toLowerCase().includes(normalizedQuery));
                    return catMatch || tagMatch;
                });

                // Mock Fallback: Se a categoria for fictícia e não tiver eventos, mostramos 4 aleatórios para não ficar vazio no teste
                if (filteredEvents.length === 0) {
                    filteredEvents = [...window.allEvents].sort(() => 0.5 - Math.random()).slice(0, 4);
                }
            }
        }

        // Salva resultado cru no estado global da view de busca e chama o renderizador final
        currentRawResults = filteredEvents;

        // Atualiza UI de todos os botões de filtro para refletir o novo estado
        document.querySelectorAll('.search-filter-btn').forEach(btn => {
            const fType = btn.dataset.filter;
            if (activeFilters[fType]) {
                btn.classList.remove('border-slate-300', 'dark:border-slate-600', 'bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
                btn.classList.add('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/30', 'text-primary-600', 'dark:text-primary-400');
            } else {
                btn.classList.add('border-slate-300', 'dark:border-slate-600', 'bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
                btn.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/30', 'text-primary-600', 'dark:text-primary-400');
            }
        });

        applyFiltersAndRender('results');

        // Salva de onde viemos antes de transitar
        const currentActiveView = Array.from(views).find(v => !v.classList.contains('hidden'));
        if (currentActiveView && currentActiveView.id !== 'view-results') {
            window.viewScrollPositions = window.viewScrollPositions || {};
            window.viewScrollPositions[currentActiveView.id] = window.scrollY;
            lastActiveViewId = currentActiveView.id;
        }

        // Força a transição para a view de resultados
        views.forEach(view => {
            if (view.id === 'view-results') {
                view.classList.remove('hidden');
                setTimeout(() => view.classList.remove('opacity-0'), 10);
            } else {
                view.classList.add('hidden', 'opacity-0');
            }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ==========================================
    // TELA: DIRETÓRIO DE PRODUTORES (VER TODOS)
    // ==========================================
    const renderProducersDirectory = (query = '') => {
        const directoryView = document.getElementById('view-producers-directory');
        if (!directoryView) return;

        let allProducers = window.producers || [];

        // Filtra por query se existir
        if (query) {
            const normalizedQuery = query.toLowerCase().trim();
            allProducers = allProducers.filter(p =>
                p.name.toLowerCase().includes(normalizedQuery) ||
                (p.bio && p.bio.toLowerCase().includes(normalizedQuery))
            );
        }

        const noResults = document.getElementById('producer-no-results');
        const contentArea = document.getElementById('producers-directory-content');

        if (allProducers.length === 0) {
            noResults.classList.remove('hidden');
            contentArea.classList.add('hidden');
        } else {
            noResults.classList.add('hidden');
            contentArea.classList.remove('hidden');
        }

        // Separa pelos Tiers
        const vipProducers = allProducers.filter(p => p.tier === 'vip');
        const premiumProducers = allProducers.filter(p => p.tier === 'premium');
        const standardProducers = allProducers.filter(p => p.tier !== 'vip' && p.tier !== 'premium');

        // Containers e Wrappers
        const vipContainer = document.getElementById('producers-directory-vip');
        const vipWrapper = document.getElementById('producers-directory-vip-wrapper');

        const premiumContainer = document.getElementById('producers-directory-premium');
        const premiumWrapper = document.getElementById('producers-directory-premium-wrapper');

        const standardContainer = document.getElementById('producers-directory-standard');
        const standardWrapper = document.getElementById('producers-directory-standard-wrapper');

        // Render VIP (Carrossel Horizontal)
        if (vipProducers.length > 0) {
            vipContainer.innerHTML = `
                <div class="flex overflow-x-auto snap-x hide-scrollbar">
                    ${vipProducers.map(p => createVIPProducerCard(p)).join('')}
                </div>
            `;
            vipWrapper.style.display = 'block';
        } else {
            vipWrapper.style.display = 'none';
        }

        // Render Premium
        if (premiumProducers.length > 0) {
            premiumContainer.innerHTML = premiumProducers.map(p => createPremiumProducerCard(p)).join('');
            premiumWrapper.style.display = 'block';
        } else {
            premiumWrapper.style.display = 'none';
        }

        // Render Standard
        if (standardProducers.length > 0) {
            // Ordena os normais por nome
            const sortedStandard = [...standardProducers].sort((a, b) => a.name.localeCompare(b.name));
            standardContainer.innerHTML = sortedStandard.map(p => createProducerAvatar(p)).join('');
            standardWrapper.style.display = 'block';
        } else {
            standardWrapper.style.display = 'none';
        }

        // Lógica de exibir/ocultar a view inteira apenas quando for a primeira chamada (sem query)
        if (query === '') {
            const views = document.querySelectorAll('.spa-view');
            const currentActiveView = Array.from(views).find(v => !v.classList.contains('hidden'));
            if (currentActiveView && currentActiveView.id !== 'view-producers-directory') {
                window.viewScrollPositions = window.viewScrollPositions || {};
                window.viewScrollPositions[currentActiveView.id] = window.scrollY;
                lastActiveViewId = currentActiveView.id;
            }

            views.forEach(v => {
                if (v.id === 'view-producers-directory') {
                    v.classList.remove('hidden');
                    setTimeout(() => v.classList.remove('opacity-0'), 10);
                } else {
                    v.classList.add('hidden', 'opacity-0');
                }
            });
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    };

    // Listener para a barra de busca de produtores
    const producerSearchInput = document.getElementById('producer-search-input');
    if (producerSearchInput) {
        let producerSearchTimer;
        producerSearchInput.addEventListener('input', (e) => {
            clearTimeout(producerSearchTimer);
            producerSearchTimer = setTimeout(() => {
                renderProducersDirectory(e.target.value);
            }, 300);
        });
    }

    // ==========================================
    // TELA: PERFIL DO PRODUTOR
    // ==========================================
    const renderProducerView = (producerId) => {
        const producer = window.producers?.find(p => p.id === producerId);
        if (!producer) return;

        const viewProducer = document.getElementById('view-producer');
        if (!viewProducer) return;

        // Preenche dados visuais
        const nameEls = viewProducer.querySelectorAll('.js-producer-name');
        nameEls.forEach(el => el.textContent = producer.name);

        const logoEl = document.getElementById('producer-logo');
        if (logoEl) logoEl.src = producer.logoUrl;

        const coverEl = document.getElementById('producer-cover');
        if (coverEl) coverEl.src = producer.coverUrl || producer.logoUrl;

        const verifiedEl = document.getElementById('producer-verified');
        if (verifiedEl) {
            if (producer.isVerified) verifiedEl.classList.remove('hidden');
            else verifiedEl.classList.add('hidden');
        }

        const bioEl = document.getElementById('producer-bio');
        if (bioEl) bioEl.textContent = producer.bio || 'Produtora oficial de eventos.';

        const followersEl = document.getElementById('producer-followers');
        if (followersEl) {
            const num = producer.followersCount || 0;
            followersEl.innerHTML = `<strong>${num > 999 ? (num / 1000).toFixed(1) + 'K' : num}</strong> seguidores`;
        }

        // Atualiza botão principal de seguir
        const mainFollowBtn = document.getElementById('producer-main-follow-btn');
        if (mainFollowBtn) {
            mainFollowBtn.dataset.producerId = producer.id;
            const isFollowing = isFollowingProducer(producer.id);
            if (isFollowing) {
                mainFollowBtn.classList.replace('bg-primary-500', 'bg-transparent');
                mainFollowBtn.classList.add('border-slate-300', 'dark:border-slate-600', 'text-slate-600', 'dark:text-slate-300');
                mainFollowBtn.classList.remove('text-white');
                mainFollowBtn.textContent = 'Seguindo';
            } else {
                mainFollowBtn.className = 'js-follow-btn flex-1 max-w-[200px] py-3 rounded-xl font-bold text-sm transition-colors border bg-primary-500 border-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/20';
                mainFollowBtn.textContent = 'Seguir';
            }
        }

        // Atualiza Redes Sociais
        const wppBtn = document.getElementById('producer-whatsapp');
        const instaBtn = document.getElementById('producer-instagram');

        if (wppBtn) {
            if (producer.socialLinks?.whatsapp) {
                wppBtn.href = producer.socialLinks.whatsapp;
                wppBtn.classList.remove('hidden');
            } else {
                wppBtn.classList.add('hidden');
            }
        }

        if (instaBtn) {
            if (producer.socialLinks?.instagram) {
                instaBtn.href = producer.socialLinks.instagram;
                instaBtn.classList.remove('hidden');
            } else {
                instaBtn.classList.add('hidden');
            }
        }

        // Puxa e renderiza os eventos desse produtor
        const gridContainer = document.getElementById('producer-events-grid');
        const emptyMsg = document.getElementById('producer-no-events');

        const producerEvents = (window.allEvents || []).filter(e => e.promoterId === producer.id);

        if (producerEvents.length > 0) {
            gridContainer.innerHTML = producerEvents.map(e => createGridCard(e)).join('');
            gridContainer.classList.remove('hidden');
            emptyMsg.classList.add('hidden');
        } else {
            gridContainer.classList.add('hidden');
            emptyMsg.classList.remove('hidden');
        }

        // Esconder outras views e mostrar essa
        const views = document.querySelectorAll('.spa-view');
        const currentActiveView = Array.from(views).find(v => !v.classList.contains('hidden'));
        if (currentActiveView && currentActiveView.id !== 'view-producer') {
            window.viewScrollPositions = window.viewScrollPositions || {};
            window.viewScrollPositions[currentActiveView.id] = window.scrollY;
            lastActiveViewId = currentActiveView.id;
        }

        views.forEach(v => {
            if (v.id === 'view-producer') {
                v.classList.remove('hidden');
                setTimeout(() => v.classList.remove('opacity-0'), 10);
            } else {
                v.classList.add('hidden', 'opacity-0');
            }
        });

        // Efeito do Scroll no Header
        window.scrollTo({ top: 0, behavior: 'auto' });
        const headerTitle = document.getElementById('producer-header-title');
        const headerBg = document.getElementById('producer-header');

        // Remove listener antigo pra evitar vazamento de memória (gambiarra rápida, ideal seria usar AbortController)
        window.onscroll = () => {
            const currentView = Array.from(document.querySelectorAll('.spa-view')).find(v => !v.classList.contains('hidden'));
            if (currentView?.id === 'view-producer') {
                const scrollY = window.scrollY;
                if (scrollY > 150) {
                    headerTitle.classList.remove('opacity-0');
                    headerBg.classList.add('border-slate-200', 'dark:border-slate-800');
                    headerBg.classList.remove('border-transparent');
                } else {
                    headerTitle.classList.add('opacity-0');
                    headerBg.classList.remove('border-slate-200', 'dark:border-slate-800');
                    headerBg.classList.add('border-transparent');
                }
            }
        };
    };

    // 1. Escutar cliques nas Categorias (Pílulas e Grid)
    document.addEventListener('click', (e) => {
        // Toggle de Favoritos (Minha Lista)
        const likeBtn = e.target.closest('.js-like-btn');
        if (likeBtn) {
            e.preventDefault();
            e.stopPropagation();
            const eventId = likeBtn.dataset.eventId;
            if (!eventId) return;

            const isLiked = toggleFavorite(eventId);
            const icon = likeBtn.querySelector('.ph-heart');
            if (icon) {
                if (isLiked) {
                    icon.classList.replace('ph', 'ph-fill');
                    icon.classList.replace('text-slate-400', 'text-red-500');
                    icon.classList.replace('text-white', 'text-red-500');
                    icon.classList.replace('text-white/90', 'text-red-500');

                    // Dispara Confete (se a bibloteca estiver carregada)
                    if (window.confetti) {
                        const rect = likeBtn.getBoundingClientRect();
                        // As coordenadas no confetti são relativas à tela (0 a 1)
                        const x = (rect.left + rect.width / 2) / window.innerWidth;
                        const y = (rect.top + rect.height / 2) / window.innerHeight;

                        window.confetti({
                            particleCount: 40,
                            spread: 60,
                            origin: { x, y },
                            colors: ['#ef4444', '#f87171', '#fecaca'], // Tons de vermelho/rosa
                            disableForReducedMotion: true,
                            zIndex: 1000
                        });
                    }

                    // Mostra Toast
                    if (window.showToast) {
                        window.showToast('Evento salvo na sua lista!', 'ph-heart');
                    }

                } else {
                    icon.classList.replace('ph-fill', 'ph');
                    icon.classList.replace('text-red-500', 'text-slate-400');
                    // Pode ser necessário tratar o text-white dependendo do componente, mas manteremos simples.
                    // Adiciona animação de "bump" no botão
                }

                // Animação CSS
                likeBtn.style.transform = 'scale(1.2)';
                setTimeout(() => likeBtn.style.transform = 'scale(1)', 150);
            }

            // Atualiza badge global
            updateFavoritesBadge();

            // Recalcula contador adjacente em todas as instâncias do evento no DOM
            const likesCountNodes = document.querySelectorAll(`.js-likes-count[data-event-id="${eventId}"]`);
            likesCountNodes.forEach(node => {
                const baseCount = parseInt(node.dataset.baseLikes || '124', 10);
                const format = node.dataset.format;
                const newCount = baseCount + (isLiked ? 1 : 0);

                if (format === 'interessados') {
                    node.innerHTML = `${newCount} interessados`;
                } else if (format === 'pessoas_vao') {
                    node.innerHTML = `${newCount} pessoas vão`;
                } else {
                    node.innerHTML = newCount;
                }
            });

            // Se estivermos na aba "Minha Lista" e o evento foi desfavoritado, 
            // opcionalmente remover o card ou apenas re-renderizar
            const currentActiveView = Array.from(document.querySelectorAll('.spa-view')).find(v => !v.classList.contains('hidden'));
            if (currentActiveView && currentActiveView.id === 'view-favorites') {
                renderFavoritesView();
            }

            return;
        }

        // Toggle de Share (Compartilhar)
        const shareIcon = e.target.closest('.ph-share-network');
        const shareBtn = e.target.closest('button[aria-label="Compartilhar evento"]') || (shareIcon && shareIcon.closest('button'));

        if (shareBtn) {
            e.preventDefault();
            e.stopPropagation();

            const shareData = {
                title: 'EventApp',
                text: 'Dá uma olhada nesse evento incrível que eu encontrei no EventApp!',
                url: window.location.href
            };

            if (navigator.share) {
                // Abre o menu nativo do sistema
                navigator.share(shareData).catch((error) => console.log('Erro ao compartilhar', error));
            } else {
                // Fallback para Desktop: copia link pra área de transferência
                navigator.clipboard.writeText(window.location.href).then(() => {
                    if (window.showToast) {
                        window.showToast('Link copiado para a área de transferência!', 'ph-link');
                    }
                }).catch(() => {
                    if (window.showToast) {
                        window.showToast('Erro ao copiar link', 'ph-warning');
                    }
                });
            }
            return;
        }

        // Toggle de Follow Producer (Seguir Produtor)
        const followBtn = e.target.closest('.js-follow-btn');
        if (followBtn) {
            e.preventDefault();
            e.stopPropagation();

            const producerId = followBtn.dataset.producerId;
            if (!producerId) return;

            const isFollowing = toggleFollowProducer(producerId);
            const variant = followBtn.dataset.variant || 'profile';

            // Atualiza visual do botão com base na variante
            if (isFollowing) {
                if (variant === 'vip') {
                    followBtn.className = 'js-follow-btn px-4 py-1.5 bg-transparent text-white border border-white/50 rounded-full text-[10px] font-bold tracking-wide transition-colors w-max';
                    followBtn.textContent = 'Seguindo';
                } else if (variant === 'premium') {
                    followBtn.className = 'js-follow-btn w-full py-1.5 bg-transparent text-slate-500 border border-slate-300 dark:border-slate-600 rounded-xl text-[10px] font-bold tracking-wide transition-colors';
                    followBtn.textContent = 'Seguindo';
                } else {
                    // Profile ou padrão
                    followBtn.className = 'js-follow-btn px-4 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 border bg-transparent border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300';
                    followBtn.textContent = 'Seguindo';
                }

                if (window.showToast) {
                    const prodName = window.producers?.find(p => p.id === producerId)?.name || 'Produtor';
                    window.showToast(`Você está seguindo ${prodName}`, 'ph-check-circle');
                }
            } else {
                if (variant === 'vip') {
                    followBtn.className = 'js-follow-btn px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-full text-[10px] font-bold tracking-wide transition-colors shadow-sm w-max border border-transparent';
                    followBtn.textContent = 'Seguir Produtor';
                } else if (variant === 'premium') {
                    followBtn.className = 'js-follow-btn w-full py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-transparent rounded-xl text-[10px] font-bold tracking-wide transition-colors';
                    followBtn.textContent = 'Seguir';
                } else {
                    // Profile ou padrão
                    followBtn.className = 'js-follow-btn px-4 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 border bg-primary-50 dark:bg-primary-900/30 border-transparent text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/50';
                    followBtn.textContent = 'Seguir';
                }
            }
            return;
        }

        // Navegar para Perfil do Produtor
        const producerLink = e.target.closest('.js-producer-link');
        if (producerLink) {
            e.preventDefault();
            const producerId = producerLink.dataset.producerId;
            if (producerId) {
                closeEventModal();
                renderProducerView(producerId);
            }
            return;
        }

        // Navegar para Diretório de Produtores
        const viewAllProducersBtn = e.target.closest('.js-view-all-producers');
        if (viewAllProducersBtn) {
            e.preventDefault();
            renderProducersDirectory();
            return;
        }

        const trigger = e.target.closest('[data-search-trigger="category"]');
        if (trigger) {
            // Seções da home com filtro admin usam o modal overlay — não duplicar em view-results
            if (trigger.dataset.sectionFilter) return;

            e.preventDefault();
            const categoryName = trigger.dataset.searchValue;
            renderSearchResults(categoryName, 'category');
            return;
        }

        // Troca de Tabs na aba Favoritos
        const favTabBtn = e.target.closest('.js-favorites-tab');
        if (favTabBtn) {
            e.preventDefault();
            const tabName = favTabBtn.dataset.tab;
            if (activeFavoritesTab !== tabName) {
                activeFavoritesTab = tabName;

                // Atualiza estilos dos botões e do indicador
                const tabBtns = document.querySelectorAll('.js-favorites-tab');
                const indicator = document.getElementById('favorites-tab-indicator');

                tabBtns.forEach(btn => {
                    if (btn.dataset.tab === tabName) {
                        btn.classList.replace('text-slate-500', 'text-slate-900');
                        btn.classList.replace('dark:text-slate-400', 'dark:text-white');
                    } else {
                        btn.classList.replace('text-slate-900', 'text-slate-500');
                        btn.classList.replace('dark:text-white', 'dark:text-slate-400');
                    }
                });

                if (indicator) {
                    if (tabName === 'events') {
                        indicator.style.transform = 'translateX(0)';
                    } else {
                        indicator.style.transform = 'translateX(100%)';
                    }
                }

                // Re-renderiza para refletir mudanças
                renderFavoritesView();
            }
            return;
        }
    });

    // 2. Escutar a Barra de Busca (Texto) - INLINE SEARCH
    const searchInput = document.querySelector('#view-search input');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.toLowerCase().trim();
            const exploreContent = document.getElementById('explore-content');
            const inlineSearchContent = document.getElementById('inline-search-content');
            const inlineSearchGrid = document.getElementById('inline-search-grid');
            const inlineNoResults = document.getElementById('inline-no-results');

            if (query.length === 0) {
                // Se apagar tudo, mostra categorias e esconde resultados
                exploreContent.classList.remove('hidden');
                inlineSearchContent.classList.add('hidden');
                return;
            }

            debounceTimer = setTimeout(() => {
                // Esconde as categorias e mostra a área de resultados in-place
                exploreContent.classList.add('hidden');
                inlineSearchContent.classList.remove('hidden');

                // Filtra pelo texto localmente (Mock) e salva
                currentRawResults = window.allEvents.filter(ev =>
                    (ev.title && ev.title.toLowerCase().includes(query)) ||
                    (ev.city && ev.city.toLowerCase().includes(query)) ||
                    (ev.description && ev.description.toLowerCase().includes(query))
                );

                // Chama o motor de renderização informando que o destino é o in-place grid
                applyFiltersAndRender('inline');
            }, 300); // 300ms delay para uma busca mais responsiva
        });
    }

    // 3. Botão Voltar da tela de Resultados
    const btnBackResults = document.getElementById('btn-back-results');
    if (btnBackResults) {
        btnBackResults.addEventListener('click', () => {
            views.forEach(view => {
                if (view.id === lastActiveViewId) {
                    view.classList.remove('hidden');
                    setTimeout(() => view.classList.remove('opacity-0'), 10);
                } else {
                    view.classList.add('hidden', 'opacity-0');
                }
            });

            // Limpa o input de busca se estiver voltando pro explorar e reseta a UI
            if (lastActiveViewId === 'view-search' && searchInput) {
                searchInput.value = '';
                const exploreContent = document.getElementById('explore-content');
                const inlineSearchContent = document.getElementById('inline-search-content');
                if (exploreContent && inlineSearchContent) {
                    exploreContent.classList.remove('hidden');
                    inlineSearchContent.classList.add('hidden');
                }
            }

            // Restaura o scroll salvo
            const savedScroll = (window.viewScrollPositions && window.viewScrollPositions[lastActiveViewId]) || 0;
            window.scrollTo({ top: savedScroll, behavior: 'auto' });
        });
    }

    // 3.1 Botão Voltar do Perfil do Produtor
    const btnBackProducer = document.getElementById('btn-back-producer');
    if (btnBackProducer) {
        btnBackProducer.addEventListener('click', () => {
            views.forEach(view => {
                if (view.id === lastActiveViewId) {
                    view.classList.remove('hidden');
                    setTimeout(() => view.classList.remove('opacity-0'), 10);
                } else {
                    view.classList.add('hidden', 'opacity-0');
                }
            });

            // Re-renderiza a tela anterior para refletir unfollows recentes
            if (lastActiveViewId === 'view-favorites') {
                renderFavoritesView();
            } else if (lastActiveViewId === 'view-producers-directory') {
                const query = document.getElementById('producers-search-input')?.value || '';
                renderProducersDirectory(query);
            }

            // Restaura o scroll salvo
            const savedScroll = (window.viewScrollPositions && window.viewScrollPositions[lastActiveViewId]) || 0;
            window.scrollTo({ top: savedScroll, behavior: 'auto' });
        });
    }

    // 3.2 Botão Voltar do Diretório de Produtores
    const btnBackDirectory = document.getElementById('btn-back-directory');
    if (btnBackDirectory) {
        btnBackDirectory.addEventListener('click', () => {
            views.forEach(view => {
                if (view.id === lastActiveViewId) {
                    view.classList.remove('hidden');
                    setTimeout(() => view.classList.remove('opacity-0'), 10);
                } else {
                    view.classList.add('hidden', 'opacity-0');
                }
            });

            // Re-renderiza Favorites caso estivesse lá, pois pode ter dado unfollow
            if (lastActiveViewId === 'view-favorites') {
                renderFavoritesView();
            }

            // Restaura o scroll salvo
            const savedScroll = (window.viewScrollPositions && window.viewScrollPositions[lastActiveViewId]) || 0;
            window.scrollTo({ top: savedScroll, behavior: 'auto' });
        });
    }

    // 4. Escutar Cliques nas Pílulas de Filtro Rápido
    const filterBtns = document.querySelectorAll('.search-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterType = btn.dataset.filter;

            // Lógica de Mutuamente Exclusivo para Ordenação
            if ((filterType === 'hot' || filterType === 'nearest') && !activeFilters[filterType]) {
                const otherSortType = filterType === 'hot' ? 'nearest' : 'hot';
                activeFilters[otherSortType] = false; // Desliga o outro

                // Desliga visualmente o outro botão em TODAS as barras
                const otherBtns = document.querySelectorAll(`.search-filter-btn[data-filter="${otherSortType}"]`);
                otherBtns.forEach(ob => {
                    ob.classList.add('border-slate-300', 'dark:border-slate-600', 'bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
                    ob.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/30', 'text-primary-600', 'dark:text-primary-400');
                });
            }

            // Toggle do estado
            activeFilters[filterType] = !activeFilters[filterType];

            // Toggle Visual do Botão Clicado (Sincroniza todas as barras de filtro)
            const allBtnsOfType = document.querySelectorAll(`.search-filter-btn[data-filter="${filterType}"]`);
            allBtnsOfType.forEach(b => {
                if (activeFilters[filterType]) {
                    // Ativo (Azul/Primário)
                    b.classList.remove('border-slate-300', 'dark:border-slate-600', 'bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
                    b.classList.add('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/30', 'text-primary-600', 'dark:text-primary-400');
                } else {
                    // Inativo (Padrão)
                    b.classList.add('border-slate-300', 'dark:border-slate-600', 'bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
                    b.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/30', 'text-primary-600', 'dark:text-primary-400');
                }
            });

            // Re-renderiza a lista com o filtro aplicado, dependendo de qual tela está ativa
            const currentActiveView = Array.from(views).find(v => !v.classList.contains('hidden'));
            if (currentActiveView && currentActiveView.id === 'view-search') {
                applyFiltersAndRender('inline');
            } else {
                applyFiltersAndRender('results');
            }
        });
    });

    // ==========================================
    // UTILITÁRIOS GLOBAIS DA PÁGINA
    // ==========================================
    function updateFavoritesBadge() {
        const favs = getFavorites();
        const badge = document.getElementById('favorites-badge');
        if (badge) {
            if (favs.length > 0) {
                badge.textContent = favs.length > 9 ? '9+' : favs.length;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

});

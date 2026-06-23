import { isFavorite, isFollowingProducer } from './storage.js';

// Helper para buscar os dados do produtor (Promoter) baseados no ID
const getProducer = (event) => {
    if (event.promoter) return event.promoter; // Fallback caso não esteja normalizado ainda
    if (!event.promoterId || !window.producers) return null;
    return window.producers.find(p => p.id === event.promoterId);
};
/**
 * Components Module
 * Responsável por gerar os templates HTML (DRY)
 */

export const createEventCard = (event) => {
    // Formatando a data
    const dateObj = new Date(event.date);
    const dateFormatted = new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', month: 'short' 
    }).format(dateObj).toUpperCase();
    
    const timeFormatted = new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit', minute: '2-digit'
    }).format(dateObj);

    return `
        <article data-event-id="${event.id}" class="cursor-pointer bg-surface-light dark:bg-surface-dark p-3 rounded-2xl border ${event.promotion ? 'border-amber-300 dark:border-orange-500/50 shadow-md shadow-orange-500/10' : 'border-slate-200 dark:border-slate-800 shadow-sm'} hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all animate-fade-in-up flex gap-3 items-stretch relative overflow-hidden">
            
            <!-- Efeito de Brilho Dinâmico (Shimmer) e Tag Top-Right -->
            ${event.promotion ? `
            <div class="absolute inset-0 pointer-events-none z-0">
                <div class="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer"></div>
            </div>
            
            <div class="absolute top-0 right-0 bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[9px] font-black px-3 py-1.5 rounded-bl-xl shadow-[-2px_2px_10px_rgba(245,158,11,0.3)] border-l border-b border-white/20 z-10 flex items-center justify-center gap-1.5">
                <span class="animate-bounce origin-bottom text-xs">🎁</span> 
                <span class="uppercase tracking-wider leading-tight">${event.promotion.label}</span>
            </div>
            ` : ''}

            <!-- Thumbnail Esquerda -->
            <div class="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src="${event.imageUrl || event.image}" alt="${event.title}" class="w-full h-full object-cover" loading="lazy">
                
                <!-- Badge Data Compacto -->
                <div class="absolute top-1.5 left-1.5 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm px-1.5 py-1 rounded-lg text-center shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                    <span class="block text-primary-500 font-bold text-sm leading-none">${dateObj.getDate()}</span>
                    <span class="block text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase mt-0.5">${dateObj.toLocaleString('pt-BR', { month: 'short' })}</span>
                </div>
            </div>
            
            <!-- Informações Direita -->
            <div class="flex-1 flex flex-col min-w-0 py-0.5 justify-between">
                <div>
                    <!-- Promotor Mini -->
                    ${getProducer(event) ? `
                    <div class="flex items-center gap-1.5 mb-1.5">
                        <img src="${getProducer(event).logoUrl}" alt="" class="w-4 h-4 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0">
                        <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">${getProducer(event).name}</span>
                    </div>
                    ` : ''}
                    
                    <!-- Título -->
                    <h2 class="text-sm font-bold leading-snug mb-1 line-clamp-2 text-slate-800 dark:text-slate-200">${event.title}</h2>
                    
                    <!-- Mini Hype -->
                    <div class="flex items-center text-[9px] text-orange-500 font-bold bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded w-max">
                        <i class="ph-fill ph-fire mr-1"></i> <span class="js-likes-count" data-event-id="${event.id}" data-base-likes="${event.likesCount || 124}" data-format="interessados">${(event.likesCount || 124) + (isFavorite(event.id) ? 1 : 0)} interessados</span>
                    </div>
                </div>

                <!-- Rodapé do Card (Cidade / Preço / Engajamento) -->
                <div class="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center uppercase tracking-wide">
                        <i class="ph-fill ph-map-pin mr-0.5 text-primary-500/70"></i> ${event.city}
                    </span>
                    <div class="flex items-center gap-2">
                        <button class="text-slate-400 hover:text-red-500 transition-colors js-like-btn" data-event-id="${event.id}" aria-label="Salvar evento" onclick="event.stopPropagation()">
        <i class="${isFavorite(event.id) ? 'ph-fill text-red-500' : 'ph text-slate-400'} ph-heart text-[13px] transition-colors pointer-events-none"></i>
    </button>
                        <button class="text-slate-400 hover:text-primary-500 transition-colors mr-0.5" aria-label="Compartilhar evento" onclick="event.stopPropagation()">
                            <i class="ph ph-share-network text-[13px]"></i>
                        </button>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${event.price === 'Gratuito' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'}">
                            ${event.price}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    `;
};

export const createFeaturedEventCard = (event) => {
    // Formatando a data
    const dateObj = new Date(event.date);
    const dateFormatted = new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', month: 'short' 
    }).format(dateObj).toUpperCase();

    return `
        <article data-event-id="${event.id}" class="snap-center shrink-0 w-72 h-48 relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow ${event.promotion ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark' : ''}">
            
            <!-- Efeito de Brilho Dinâmico (Shimmer) -->
            ${event.promotion ? `
            <div class="absolute inset-0 pointer-events-none z-20">
                <div class="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
            ` : ''}

            <img src="${event.imageUrl || event.image}" alt="${event.title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
            
            <!-- Overlay gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            
            <!-- Badge do Promotor (Top Left) -->
            ${getProducer(event) ? `
            <div class="absolute top-3 left-3 bg-black/40 backdrop-blur-md rounded-full flex items-center pr-2.5 p-0.5 gap-1.5 border border-white/10 shadow-sm">
                <img src="${getProducer(event).logoUrl}" class="w-5 h-5 rounded-full object-cover">
                <span class="text-white text-[9px] font-medium truncate max-w-[80px]">${getProducer(event).name}</span>
            </div>
            ` : ''}

            <!-- Badge de Data (Top Right) -->
            <div class="absolute top-3 right-3 bg-primary-500 text-white px-2 py-1 rounded-lg text-center shadow-md">
                <span class="block font-bold text-sm leading-tight">${dateObj.getDate()}</span>
                <span class="block text-[8px] font-bold uppercase">${dateObj.toLocaleString('pt-BR', { month: 'short' })}</span>
            </div>

            <!-- Conteúdo inferior -->
            <div class="absolute bottom-0 left-0 p-4 w-full">
                <div class="flex items-center gap-1.5 mb-1">
                    <span class="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Destaque
                    </span>
                    <span class="text-white/80 text-[10px]"><i class="ph ph-map-pin mr-0.5"></i>${event.city}</span>
                </div>
                
                <!-- Tag Promoção Destaque Animada -->
                ${event.promotion ? `
                <div class="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md mb-2 w-max shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300/50 flex items-center gap-1.5">
                    <span class="animate-bounce origin-bottom">🎁</span> <span class="uppercase tracking-wider">${event.promotion.label}</span>
                </div>
                ` : ''}
                
                <h2 class="text-white text-lg font-bold leading-tight line-clamp-2 pr-10 mb-1.5">${event.title}</h2>
                
                <!-- Hype Indicator Completo -->
                <div class="flex items-center gap-1.5">
                    <div class="flex -space-x-1.5">
                        <img class="w-4 h-4 rounded-full border border-white object-cover" src="https://ui-avatars.com/api/?name=A&background=random" alt="User">
                        <img class="w-4 h-4 rounded-full border border-white object-cover" src="https://ui-avatars.com/api/?name=M&background=random" alt="User">
                        <img class="w-4 h-4 rounded-full border border-white object-cover" src="https://ui-avatars.com/api/?name=C&background=random" alt="User">
                    </div>
                    <span class="text-[9px] text-white/90 font-medium"><span class="js-likes-count" data-event-id="${event.id}" data-base-likes="${event.likesCount || 124}" data-format="pessoas_vao">${(event.likesCount || 124) + (isFavorite(event.id) ? 1 : 0)} pessoas vão</span></span>
                </div>
            </div>
            
            <!-- Botões de Engajamento (Bottom Right) -->
            <div class="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                <button class="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 hover:text-primary-400 hover:bg-black/60 transition-colors shadow-sm border border-white/10" aria-label="Compartilhar evento" onclick="event.stopPropagation()">
                    <i class="ph ph-share-network text-sm"></i>
                </button>
                <button class="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 hover:text-red-500 hover:bg-black/60 transition-colors shadow-sm border border-white/10" aria-label="Salvar evento" onclick="event.stopPropagation()">
                    <i class="ph ph-heart text-sm"></i>
                </button>
            </div>
        </article>
    `;
};

export const createEventDetailsView = (event) => {
    // Formatando a data
    const dateObj = new Date(event.date);
    const dateFormattedLong = new Intl.DateTimeFormat('pt-BR', { 
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    }).format(dateObj);
    const timeFormatted = new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit', minute: '2-digit'
    }).format(dateObj);

    return `
        <!-- Drag Handle -->
        <div id="modal-drag-handle" class="absolute top-0 left-0 w-full flex justify-center pt-3 pb-4 z-40 pointer-events-auto touch-none">
            <div class="w-12 h-1.5 bg-white/40 dark:bg-slate-400/50 rounded-full backdrop-blur-md pointer-events-none"></div>
        </div>

        <!-- Botão Voltar Absoluto e Header Transparente -->
        <div class="absolute top-0 left-0 w-full z-20 flex justify-between items-center px-4 pt-8 pb-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
            <button id="close-modal-btn" class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors pointer-events-auto border border-white/10" aria-label="Voltar">
                <i class="ph-bold ph-caret-down text-xl"></i>
            </button>
            <div class="flex gap-2 pointer-events-auto">
                <button class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:text-red-500 hover:bg-white/30 transition-colors js-like-btn border border-white/10" data-event-id="${event.id}">
                    <i class="${isFavorite(event.id) ? 'ph-fill text-red-500' : 'ph-bold text-white'} ph-heart text-xl transition-colors pointer-events-none"></i>
                </button>
                <button class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:text-primary-500 hover:bg-white/30 transition-colors border border-white/10">
                    <i class="ph-bold ph-share-network text-xl"></i>
                </button>
            </div>
        </div>

        <!-- Corpo Rolável -->
        <div class="flex-1 overflow-y-auto hide-scrollbar relative flex flex-col bg-background-light dark:bg-background-dark">
            <!-- Hero Image (Parallax Fake) -->
            <div class="sticky top-0 w-full h-[35vh] min-h-[250px] shrink-0 -z-0">
                <img src="${event.imageUrl || event.image}" alt="${event.title}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-transparent"></div>
            </div>

            <!-- Conteúdo Principal -->
            <div class="px-5 -mt-6 relative z-10 flex-1 pb-28 bg-background-light dark:bg-background-dark rounded-t-3xl pt-6 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <!-- Categoria e Título -->
            <div class="mb-5">
                <span class="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                    ${event.category}
                </span>
                <h1 class="text-2xl font-bold leading-tight mb-2">${event.title}</h1>
                <p class="text-slate-500 dark:text-slate-400 text-sm font-medium capitalize mb-3">
                    ${dateFormattedLong} às ${timeFormatted}
                </p>
                
                <!-- Indicador de Hype / Prova Social Premium -->
                <div class="flex items-center gap-2 mt-3 p-2.5 rounded-2xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div class="flex -space-x-2 shrink-0">
                        <img class="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-sm" src="https://ui-avatars.com/api/?name=J&background=3b82f6&color=fff" alt="User">
                        <img class="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-sm" src="https://ui-avatars.com/api/?name=M&background=ec4899&color=fff" alt="User">
                        <div class="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center bg-primary-100 dark:bg-primary-900/50 text-[10px] font-black text-primary-600 dark:text-primary-400 shadow-sm z-10">+9</div>
                    </div>
                    <span class="text-xs font-medium text-slate-600 dark:text-slate-400 leading-tight">
                        <strong class="text-slate-900 dark:text-white text-sm js-likes-count" data-event-id="${event.id}" data-base-likes="${event.likesCount || event.likes || 124}" data-format="numero">${(event.likesCount || event.likes || 124) + (isFavorite(event.id) ? 1 : 0)}</strong><br>pessoas confirmadas 🔥
                    </span>
                </div>
            </div>

            <!-- Promotor do Evento -->
            ${getProducer(event) ? `
            <div class="flex items-center gap-3 mb-6 p-3 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm">
                <img src="${getProducer(event).logoUrl}" alt="${getProducer(event).name}" class="w-11 h-11 rounded-full shadow-sm object-cover bg-white shrink-0">
                <div class="flex-1 cursor-pointer js-producer-link" data-producer-id="${getProducer(event).id}">
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">Organizado por</p>
                    <p class="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">${getProducer(event).name}</p>
                </div>
                <button class="js-follow-btn px-4 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 border ${isFollowingProducer(getProducer(event).id) ? 'bg-transparent border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300' : 'bg-primary-50 dark:bg-primary-900/30 border-transparent text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/50'}" data-producer-id="${getProducer(event).id}">
                    ${isFollowingProducer(getProducer(event).id) ? 'Seguindo' : 'Seguir'}
                </button>
            </div>
            ` : ''}

            <!-- Preço e Local -->
            <div class="flex flex-col gap-3 py-4 border-y border-slate-200 dark:border-slate-800 mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-primary-500 shrink-0">
                        <i class="ph ph-ticket text-xl"></i>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Entrada</p>
                        <p class="text-sm font-bold ${event.price === 'Gratuito' ? 'text-green-500' : 'text-slate-800 dark:text-slate-200'}">${event.price}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-primary-500 shrink-0">
                        <i class="ph ph-map-pin text-xl"></i>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Localização</p>
                        <p class="text-sm font-bold text-slate-800 dark:text-slate-200">${event.location}</p>
                    </div>
                </div>
            </div>

            <!-- CUPOM PROMOCIONAL EXCLUSIVO -->
            ${event.promotion ? `
            <div class="mb-8 relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700/50 p-4 shadow-sm">
                <!-- Recortes laterais estilo ingresso -->
                <div class="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background-light dark:bg-background-dark rounded-full border-r-2 border-dashed border-amber-300 dark:border-amber-700/50"></div>
                <div class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background-light dark:bg-background-dark rounded-full border-l-2 border-dashed border-amber-300 dark:border-amber-700/50"></div>
                
                <div class="flex gap-4 items-center relative z-10 px-1">
                    <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl shadow-sm shrink-0 shadow-orange-500/30">
                        🎁
                    </div>
                    <div class="flex-1">
                        <span class="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-0.5 block">Recompensa Exclusiva</span>
                        <h3 class="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1">${event.promotion.label}</h3>
                        <p class="text-xs text-slate-600 dark:text-slate-400 leading-snug mb-3">${event.promotion.description}</p>
                        
                        <button class="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold py-2 rounded-xl hover:scale-[1.02] transition-transform active:scale-95 shadow-md flex justify-center items-center gap-1.5">
                            <i class="ph-fill ph-ticket"></i> Resgatar Agora
                        </button>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Descrição -->
            <div class="mb-8">
                <h3 class="text-lg font-bold mb-2">Sobre o Evento</h3>
                <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    ${event.description}
                </p>
            </div>

            <!-- ÁREA DE MONETIZAÇÃO 1: Serviços Recomendados (Patrocínio Local) -->
            <div class="mb-8 p-4 bg-primary-50 dark:bg-slate-800/50 rounded-2xl border border-primary-100 dark:border-slate-700">
                <div class="flex items-center gap-2 mb-3">
                    <i class="ph-fill ph-taxi text-primary-500 text-xl"></i>
                    <h3 class="text-sm font-bold">Vai precisar de Transporte?</h3>
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs text-slate-600 dark:text-slate-300 mb-1">Táxi do João - Ponto Central</p>
                        <p class="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Patrocinado</p>
                    </div>
                    <button class="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm shadow-green-500/30 transition-colors">
                        <i class="ph-fill ph-whatsapp-logo text-sm"></i> Chamar
                    </button>
                </div>
            </div>

            <!-- ÁREA DE MONETIZAÇÃO 2: Eventos Patrocinados (Cross-sell) -->
            <div class="mb-4">
                <h3 class="text-lg font-bold mb-3">Você também pode gostar</h3>
                <!-- Placeholder de Card Patrocinado -->
                <div class="flex gap-3 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm cursor-pointer hover:border-primary-500 transition-colors">
                    <img src="https://picsum.photos/seed/sponsor1/200/200" alt="Sponsor" class="w-16 h-16 rounded-lg object-cover shrink-0">
                    <div class="flex-1 flex flex-col justify-center">
                        <span class="text-[9px] text-primary-500 font-bold uppercase tracking-wider mb-0.5">Patrocinado</span>
                        <h4 class="text-sm font-bold leading-tight mb-1">Baile de Fronteira Especial</h4>
                        <p class="text-xs text-slate-500">12 de Agosto • Rivera</p>
                    </div>
                </div>
            </div>
            </div>
        </div>
        </div> <!-- Fecha Corpo Rolável -->

        <!-- Footer CTA (Floating) -->
        <div class="absolute bottom-0 left-0 w-full px-5 py-4 pb-safe bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/90 dark:via-background-dark/90 to-transparent pointer-events-none z-30 pt-12">
            <button class="w-full bg-primary-500 text-white font-black text-[15px] tracking-wide py-4 rounded-2xl shadow-xl shadow-primary-500/40 hover:bg-primary-600 transition-transform active:scale-95 flex justify-center items-center gap-2 pointer-events-auto border border-white/20">
                <i class="ph-bold ph-ticket text-xl"></i> Garantir Ingresso
            </button>
        </div>
    `;
};

export const createNativeAdCard = (ad) => {
    const isImageOnly = !ad.title && !ad.advertiser && !ad.cta;
    const articleClasses = isImageOnly 
        ? "w-full my-2 animate-fade-in-up overflow-hidden" 
        : "bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in-up my-2";

    return `
        <article class="${articleClasses}">
            ${isImageOnly ? `
            <div class="relative w-full cursor-pointer flex justify-center">
                <img src="${ad.image}" alt="Promoção" class="w-full h-auto max-h-[60vh] object-contain">
                <div class="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-slate-300 text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border border-white/10 z-10">Ad</div>
            </div>
            ` : `
            <!-- Header Anúncio -->
            ${ad.advertiser || ad.logo ? `
            <div class="p-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50">
                <div class="flex items-center gap-2">
                    ${ad.logo ? `<img src="${ad.logo}" alt="${ad.advertiser || 'Anunciante'}" class="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700">` : ''}
                    <div>
                        <h3 class="text-xs font-bold leading-none">${ad.advertiser || 'Patrocinado'}</h3>
                        <span class="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5 block">Patrocinado</span>
                    </div>
                </div>
                <i class="ph-fill ph-dots-three text-slate-400"></i>
            </div>
            ` : ''}
            
            <!-- Imagem e Conteúdo -->
            <div class="relative w-full h-40">
                <img src="${ad.image}" alt="Promoção" class="w-full h-full object-cover">
                ${ad.title || ad.description ? `
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div class="absolute bottom-0 left-0 w-full p-4 text-white">
                    ${ad.title ? `<h2 class="text-lg font-black leading-tight mb-1">${ad.title}</h2>` : ''}
                    ${ad.description ? `<p class="text-xs text-white/80 line-clamp-2">${ad.description}</p>` : ''}
                </div>
                ` : `
                <div class="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-slate-300 text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border border-white/10 z-10">Ad</div>
                `}
            </div>
            
            <!-- Footer CTA -->
            ${ad.cta ? `
            <div class="p-3 bg-surface-light dark:bg-surface-dark flex items-center justify-between">
                <span class="text-[10px] text-slate-500 font-medium">Válido apenas hoje</span>
                <button class="bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 shadow-md shadow-primary-500/20 transition-transform active:scale-95">
                    ${ad.cta} <i class="ph-bold ph-caret-right"></i>
                </button>
            </div>
            ` : ''}
            `}
        </article>
    `;
};

export const createUtilityCarousel = (services) => {
    const cardsHtml = services.map(service => `
        <div class="snap-center shrink-0 w-36 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm hover:border-primary-300 transition-colors cursor-pointer flex flex-col items-center text-center group">
            <div class="w-10 h-10 rounded-full ${service.bgClass || 'bg-white border border-slate-200'} flex items-center justify-center mb-2 transition-transform group-hover:scale-110 overflow-hidden border border-slate-200 dark:border-slate-700">
                ${service.logo 
                    ? `<img src="${service.logo}" alt="${service.title || service.advertiser}" class="w-full h-full object-cover">` 
                    : `<i class="ph-fill ${service.icon || 'ph-star'} text-xl"></i>`
                }
            </div>
            <h4 class="text-xs font-bold leading-tight mb-0.5 text-slate-800 dark:text-slate-200">${service.title || service.advertiser}</h4>
            <p class="text-[9px] text-slate-500 leading-snug">${service.description}</p>
        </div>
    `).join('');

    return `
        <div class="py-3 bg-slate-50 dark:bg-slate-900">
            <div class="flex items-center justify-between mb-3 px-4">
                <h3 class="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-1.5">
                    <i class="ph-fill ph-sparkle text-amber-500"></i> Para a sua noite
                </h3>
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">Utilidades</span>
            </div>
            <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-1 px-4">
                ${cardsHtml}
            </div>
        </div>
    `;
};

// ==========================================
// 5. HERO CAROUSEL (Estilo Netflix / Destaque Master)
// ==========================================
export const createHeroCarousel = (events) => {
    if (!events || events.length === 0) return '';

    const slidesHtml = events.map((event, index) => {
        if (event.isAd) {
            return `
                <div class="relative w-full h-full shrink-0 snap-center flex items-end justify-center pb-8 overflow-hidden cursor-pointer" onclick="window.open('${event.link || '#'}', '_blank')">
                    <img src="${event.image || event.imageUrl || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=1000'}" alt="${event.title || event.advertiser}" class="absolute inset-0 w-full h-full object-cover animate-ken-burns">
                    <div class="absolute inset-0 bg-gradient-to-t from-surface-light dark:from-surface-dark via-surface-light/40 dark:via-surface-dark/40 to-black/20 z-0"></div>
                    
                    <div class="absolute top-8 left-4 z-20">
                        <div class="bg-slate-900/80 text-yellow-400 border border-yellow-500/50 text-[10px] font-black px-2 py-1 rounded shadow-sm tracking-wider uppercase backdrop-blur-sm">
                            Patrocinado
                        </div>
                    </div>

                    <div class="relative z-10 w-full px-6 flex flex-col items-center text-center animate-fade-in-up" style="animation-delay: 0.3s; animation-fill-mode: both;">
                        ${event.logo ? `<img src="${event.logo}" alt="Logo" class="w-16 h-16 rounded-2xl mb-4 shadow-xl border-2 border-white/20 bg-white object-cover">` : ''}
                        
                        <h1 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2 leading-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" style="font-family: 'Outfit', sans-serif;">
                            ${event.title || event.advertiser}
                        </h1>
                        
                        <p class="text-slate-800 dark:text-white/90 text-sm font-bold mb-6 drop-shadow-md max-w-sm">
                            ${event.description || ''}
                        </p>

                        <button class="bg-yellow-500 hover:bg-yellow-600 text-slate-900 py-3 px-8 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                            ${event.ctaLabel || 'Saiba Mais'} <i class="ph-bold ph-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        // Generate genre tags string
        const genres = event.tags ? event.tags.slice(0, 3).join(' • ') : 'Evento Especial';
        
        // We stringify the event object to store in data attribute
        const eventJson = JSON.stringify(event).replace(/'/g, "&apos;").replace(/"/g, "&quot;");

        return `
            <div class="relative w-full h-full shrink-0 snap-center flex items-end justify-center pb-8 overflow-hidden">
                <!-- Background Image com Efeito Ken Burns -->
                <img src="${event.imageUrl || event.image}" alt="${event.title}" class="absolute inset-0 w-full h-full object-cover animate-ken-burns">
                
                <!-- Gradient Overlay (Fade to app background) -->
                <div class="absolute inset-0 bg-gradient-to-t from-surface-light dark:from-surface-dark via-surface-light/40 dark:via-surface-dark/40 to-black/20 z-0"></div>

                <!-- Content -->
                <div class="relative z-10 w-full px-6 flex flex-col items-center text-center animate-fade-in-up" style="animation-delay: 0.3s; animation-fill-mode: both;">
                    <!-- Highlight Badges -->
                    <div class="flex flex-col items-center gap-2 mb-3">
                        ${event.isPromoted ? `<div class="px-2.5 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-lg shadow-red-500/30">Nº 1 em ${event.city} Hoje</div>` : ''}
                        
                        ${event.promotion ? `
                        <div class="bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                            <span class="animate-bounce shrink-0 text-sm">🎁</span> 
                            <span class="truncate max-w-[200px]">${event.promotion.label || 'Promo'}</span>
                        </div>
                        ` : ''}
                    </div>
                    <!-- Title -->
                    <h1 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2 leading-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" style="font-family: 'Outfit', sans-serif;">
                        ${event.title}
                    </h1>
                    
                    <!-- Genres / Info -->
                    <p class="text-slate-800 dark:text-white/90 text-sm font-bold mb-6 flex items-center justify-center gap-2 drop-shadow-md">
                        <span class="text-green-600 dark:text-green-400">${event.price}</span>
                        <span class="w-1 h-1 rounded-full bg-slate-800/50 dark:bg-white/50"></span>
                        <span>${genres}</span>
                    </p>

                    <!-- Actions -->
                    <div class="flex items-center justify-center gap-4 w-full max-w-xs">
                        <button class="flex-1 bg-primary-500 hover:bg-primary-600 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg">
                            <i class="ph-fill ph-ticket text-xl"></i> Ingressos
                        </button>
                        <button class="js-hero-info-btn w-12 h-12 bg-white/20 hover:bg-white/40 dark:bg-slate-500/40 dark:hover:bg-slate-500/60 backdrop-blur-md border border-slate-900/10 dark:border-white/20 text-slate-900 dark:text-white rounded-xl flex items-center justify-center transition-colors shadow-lg" data-hero-event='${eventJson}'>
                            <i class="ph-bold ph-info text-xl"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const dotsHtml = events.map((_, i) => `
        <div class="hero-dot transition-colors duration-300 w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-slate-400 dark:bg-white/30'}"></div>
    `).join('');

    return `
        <div class="relative w-full h-[65vh] md:h-[70vh] mb-8 group">
            <div id="hero-carousel-container" class="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full h-full scroll-smooth">
                ${slidesHtml}
            </div>
            
            <!-- Indicadores (Dots) -->
            <div id="hero-carousel-dots" class="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                ${dotsHtml}
            </div>
        </div>
    `;
};

// ==========================================
// COMPONENTES MODO NETFLIX
// ==========================================

export const createGridCard = (event, index = 0) => {
    if (!event) return '';
    
    // Calcula o delay da animação para o efeito em cascata (máx 10 itens para não demorar)
    const delayMs = Math.min(index * 75, 750);
    
    const tagColor = event.price === 'Gratuito' ? 'bg-green-600' : 'bg-red-600';
    const tagText = event.price === 'Gratuito' ? 'FREE' : 'TOP';

    // Badge Ad (Top of Search)
    const adBadgeHtml = event.isSponsoredSearch ? `
        <div class="bg-slate-900/80 text-yellow-400 border border-yellow-500/50 text-[8px] font-black px-1.5 py-0.5 rounded-sm shadow-sm tracking-wider uppercase mb-1 flex items-center justify-center backdrop-blur-sm">
            Ad
        </div>
    ` : '';

    // Formatando Data
    const dateObj = new Date(event.date);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleString('pt-BR', { month: 'short' }).substring(0, 3).toUpperCase();

    return `
        <article data-event-id="${event.id}" 
                 class="w-full aspect-[3/4] relative rounded-lg overflow-hidden cursor-pointer shadow-md group opacity-0 animate-fade-in-up ${event.promotion ? 'border-[1.5px] border-amber-400 shadow-[0_4px_15px_rgba(251,191,36,0.3)]' : ''}"
                 style="animation-delay: ${delayMs}ms; animation-fill-mode: forwards;"
                 onclick="document.dispatchEvent(new CustomEvent('openModal', {detail: '${event.id}'}))">
            
            <img src="${event.imageUrl || event.image}" alt="${event.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out">
            
            <!-- Badge de Data Top-Left -->
            <div class="absolute top-2 left-2 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md px-1.5 py-1 rounded-md text-center shadow-md border border-white/20 dark:border-slate-700/50 z-20 flex flex-col items-center justify-center leading-none">
                <span class="text-primary-500 font-black text-[13px]">${day}</span>
                <span class="text-slate-500 dark:text-slate-400 text-[8px] font-bold uppercase mt-0.5">${month}</span>
            </div>

            <!-- Efeito de Brilho Dinâmico (Shimmer) -->
            ${event.promotion ? `
            <div class="absolute inset-0 pointer-events-none z-0">
                <div class="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent animate-shimmer"></div>
            </div>
            ` : ''}

            <!-- Gradiente de baixo pra cima -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none z-0"></div>
            
            <!-- Tags Superior Direita -->
            <div class="absolute top-2 right-2 flex flex-col items-end gap-1 z-10">
                <!-- Selo Patrocinado -->
                ${adBadgeHtml}
                
                <!-- Selo Base -->
                <div class="${tagColor} text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm tracking-wider">
                    ${tagText}
                </div>
                
                <!-- Selo de Brinde/Promoção -->
                ${event.promotion ? `
                <div class="bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-md flex items-center gap-1 uppercase tracking-wider">
                    <span class="animate-bounce">🎁</span> ${event.promotion.label}
                </div>
                ` : ''}
            </div>

            <!-- Infos Bottom -->
            <div class="absolute bottom-0 left-0 w-full p-2.5 z-20 flex flex-col justify-end">
                <h3 class="text-white font-bold text-xs leading-tight mb-1 line-clamp-2 drop-shadow-md">${event.title}</h3>
                <div class="flex justify-between items-center w-full">
                    <span class="text-slate-300 text-[9px] font-medium truncate pr-2">${event.city || event.location}</span>
                    <div class="flex items-center gap-0.5 shrink-0 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        <i class="ph-fill ph-fire text-orange-500 text-[10px]"></i>
                        <span class="text-orange-500 text-[9px] font-bold js-likes-count" data-event-id="${event.id}" data-base-likes="${event.likesCount || event.likes || 124}" data-format="numero">${(event.likesCount || event.likes || 124) + (isFavorite(event.id) ? 1 : 0)}</span>
                    </div>
                </div>
            </div>
        </article>
    `;
};

export const createPosterCard = (event) => {
    // Definindo "selo" da Netflix no canto
    const tagColor = event.price === 'Gratuito' ? 'bg-green-600' : 'bg-red-600';
    const tagText = event.price === 'Gratuito' ? 'FREE' : 'TOP';

    // Formatando Data
    const dateObj = new Date(event.date);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleString('pt-BR', { month: 'short' }).substring(0, 3).toUpperCase();

    return `
        <article data-event-id="${event.id}" class="snap-center shrink-0 w-32 h-48 sm:w-40 sm:h-60 relative rounded-md overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 shadow-md group ${event.promotion ? 'border-b-2 border-orange-500' : ''}">
            <img src="${event.imageUrl || event.image}" alt="${event.title}" class="w-full h-full object-cover">
            
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
            
            <!-- Shimmer Dinâmico se tiver Promoção -->
            ${event.promotion ? `
            <div class="absolute inset-0 pointer-events-none z-0">
                <div class="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
            ` : ''}

            <!-- Tags Superior Direita -->
            <div class="absolute top-2 right-2 flex flex-col items-end gap-1 z-10">
                <!-- Selo Base -->
                <div class="${tagColor} text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">
                    ${tagText}
                </div>
                
                <!-- Selo de Brinde -->
                ${event.promotion ? `
                <div class="bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-md flex items-center gap-1 uppercase tracking-wider max-w-[75px]">
                    <span class="animate-bounce shrink-0">🎁</span> 
                    <span class="truncate">${event.promotion.label}</span>
                </div>
                ` : ''}
            </div>

            <!-- Badge de Data Top-Left -->
            <div class="absolute top-2 left-2 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md px-1.5 py-1 rounded-md text-center shadow-md border border-white/20 dark:border-slate-700/50 z-20 flex flex-col items-center justify-center leading-none">
                <span class="text-primary-500 font-black text-xs">${day}</span>
                <span class="text-slate-500 dark:text-slate-400 text-[7px] font-bold uppercase mt-0.5">${month}</span>
            </div>

            <div class="absolute bottom-0 left-0 w-full p-2 z-10 flex flex-col">
                <h3 class="text-white text-xs font-bold leading-tight line-clamp-2 drop-shadow-md">${event.title}</h3>
                
                <div class="flex items-center justify-between mt-1.5">
                    <p class="text-[9px] text-slate-300 drop-shadow-md truncate">${event.city}</p>
                    <!-- Prova Social Compacta -->
                    <span class="text-[8px] text-orange-400 font-bold flex items-center gap-0.5 drop-shadow-md shrink-0">
                        <i class="ph-fill ph-fire"></i> <span class="js-likes-count" data-event-id="${event.id}" data-base-likes="${event.likesCount || 124}" data-format="numero">${(event.likesCount || 124) + (isFavorite(event.id) ? 1 : 0)}</span>
                    </span>
                </div>
            </div>
        </article>
    `;
};

export const createPosterAdCard = (ad) => {
    const isImageOnly = !ad.title && !ad.advertiser && !ad.cta;
    return `
        <article class="snap-center shrink-0 w-32 h-48 sm:w-40 sm:h-60 relative rounded-md overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 shadow-md border-b-2 border-primary-500 bg-slate-900 dark:bg-black flex flex-col group">
            <div class="${isImageOnly ? 'h-full w-full' : 'h-1/2 w-full'} relative shrink-0">
                <img src="${ad.image}" alt="${ad.advertiser || 'Promo'}" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity">
                ${isImageOnly ? '' : '<div class="absolute inset-0 bg-gradient-to-t from-slate-900 dark:from-black to-transparent"></div>'}
                <!-- Tag Patrocinado -->
                <div class="absolute top-0 right-0 bg-slate-900/80 backdrop-blur-md text-slate-300 text-[8px] font-bold uppercase tracking-widest px-2 py-1.5 rounded-bl-md border-l border-b border-white/10 z-10">
                    Ad
                </div>
            </div>
            
            ${isImageOnly ? '' : `
            <div class="flex-1 p-2 flex flex-col justify-end z-10 relative">
                ${ad.advertiser || ad.logo ? `
                <div class="flex items-center gap-1.5 mb-1.5">
                    ${ad.logo ? `<img src="${ad.logo}" class="w-4 h-4 rounded-full border border-white/20 shrink-0">` : ''}
                    ${ad.advertiser ? `<h3 class="text-white text-[9px] font-bold leading-tight truncate opacity-80">${ad.advertiser}</h3>` : ''}
                </div>
                ` : ''}
                ${ad.title ? `<p class="text-[10px] text-white font-black leading-tight line-clamp-2 drop-shadow-md mb-2">${ad.title}</p>` : ''}
                ${ad.cta ? `<button class="w-full py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded text-[9px] font-bold uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-1">
                    ${ad.cta} <i class="ph-bold ph-arrow-up-right"></i>
                </button>` : ''}
            </div>
            `}
        </article>
    `;
};

export const createNetflixRow = (title, events, injectedAd = null, insertIndex = 3, icon = null, sectionFilter = null) => {
    if (!events || events.length === 0) return '';
    
    let cardsArray = events.map(createPosterCard);
    
    // Se tivermos um anúncio, injeta na posição (se for maior que o array, ele vai pro final)
    if (injectedAd) {
        cardsArray.splice(insertIndex, 0, createPosterAdCard(injectedAd));
    }

    const cardsHtml = cardsArray.join('');
    const iconHtml = icon ? `<i class="ph-fill ${icon} text-primary-500 mr-1.5"></i>` : '';
    const filterAttr = sectionFilter ? `data-section-filter="${sectionFilter}"` : '';

    return `
        <section class="relative">
            <div class="flex items-center justify-between mb-2 px-4">
                <h2 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center">
                    ${iconHtml}${title}
                </h2>
                <button data-search-trigger="category" data-search-value="${title}" ${filterAttr} class="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity active:scale-95">
                    Ver tudo <i class="ph-bold ph-caret-right"></i>
                </button>
            </div>
            <!-- Container Horizontal com Snap -->
            <div class="flex gap-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-4 pb-4 pt-1">
                ${cardsHtml}
                
                <!-- Card Final (Seta de Ver Mais) -->
                <div class="shrink-0 w-20 flex flex-col items-center justify-center snap-center pr-4">
                    <button data-search-trigger="category" data-search-value="${title}" ${filterAttr} class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center shadow-sm text-slate-400 dark:text-slate-500 hover:text-primary-500 dark:hover:text-primary-400 hover:scale-110 transition-all active:scale-95">
                        <i class="ph-bold ph-arrow-right text-xl"></i>
                    </button>
                    <span class="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest text-center">Mais</span>
                </div>
            </div>
        </section>
    `;
};

// ==========================================
// 6. FILTROS E CATEGORIAS (Pílulas e Grid)
// ==========================================

export const createCategoryPills = (categories) => {
    if (!categories || categories.length === 0) return '';
    
    const pillsHtml = categories.map(cat => `
        <button data-search-trigger="category" data-search-value="${cat.name}" class="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 text-xs font-bold tracking-wide hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
            <span class="text-sm">${cat.emoji}</span>
            <span>${cat.name}</span>
        </button>
    `).join('');

    return `
        <div class="flex overflow-x-auto hide-scrollbar gap-2 px-4 pb-2 -mb-2 pt-1">
            ${pillsHtml}
        </div>
    `;
};

export const createExploreGrid = (categories) => {
    if (!categories || categories.length === 0) return '';
    
    const gridHtml = categories.map(cat => {
        const bgImage = cat.image || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop';
        const brandedBadge = cat.isBranded ? `
            <div class="absolute top-2 left-2 bg-yellow-400 text-slate-900 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm shadow-md z-20">
                Patrocinado
            </div>
        ` : '';
        
        return `
        <button data-search-trigger="category" data-search-value="${cat.name}" class="relative overflow-hidden rounded-xl h-28 flex flex-col justify-end group shadow-sm hover:shadow-md transition-shadow text-left border ${cat.isBranded ? 'border-yellow-400/50' : 'border-slate-200 dark:border-slate-800'}">
            ${brandedBadge}
            <img src="${bgImage}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="${cat.name}">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent transition-opacity group-hover:opacity-90"></div>
            <h3 class="text-white font-bold text-[14px] sm:text-[15px] drop-shadow-md z-10 p-3 leading-tight tracking-wide">${cat.name}</h3>
        </button>
        `;
    }).join('');

    return `
        <div class="grid grid-cols-2 gap-3 px-4 pb-24 pt-4">
            ${gridHtml}
        </div>
    `;
};

// ==========================================
// NOVOS LAYOUTS DE PRATELEIRA (UX/UI)
// ==========================================

export const createLandscapeCard = (event) => {
    const date = new Date(event.date);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    
    return `
        <article class="event-card snap-center shrink-0 w-64 h-36 relative rounded-md overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-md bg-slate-900 flex flex-col group" data-event-id="${event.id}">
            <img src="${event.imageUrl || event.image}" alt="${event.title}" class="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
            
            <div class="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-white font-bold text-[10px] border border-white/10 uppercase tracking-widest">
                ${day} ${month}
            </div>
            
            <div class="absolute top-2 right-2 z-10">
                ${event.promotion ? `
                <div class="bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-md flex items-center gap-1 uppercase tracking-wider">
                    <span class="animate-bounce shrink-0">🎁</span> 
                    <span class="truncate max-w-[80px]">${event.promotion.label || 'Promo'}</span>
                </div>
                ` : ''}
            </div>

            <div class="absolute bottom-0 left-0 w-full p-3 flex flex-col z-10">
                <h3 class="text-white text-sm font-bold leading-tight truncate drop-shadow-md mb-1">${event.title}</h3>
                <div class="flex items-center justify-between">
                    <p class="text-[10px] text-slate-300 truncate"><i class="ph-fill ph-map-pin mr-1"></i>${event.city}</p>
                    <span class="text-[9px] text-orange-400 font-bold flex items-center gap-0.5"><i class="ph-fill ph-fire"></i> <span class="js-likes-count" data-event-id="${event.id}" data-base-likes="${event.likesCount || 124}" data-format="numero">${(event.likesCount || 124) + (isFavorite(event.id) ? 1 : 0)}</span></span>
                </div>
            </div>
        </article>
    `;
};

export const createListCard = (event) => {
    const date = new Date(event.date);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    
    return `
        <article class="event-card w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group" data-event-id="${event.id}">
            <div class="w-16 h-16 rounded-md overflow-hidden shrink-0 relative shadow-sm">
                <img src="${event.imageUrl || event.image}" alt="${event.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                <div class="absolute inset-0 bg-black/10"></div>
            </div>
            
            <div class="flex-1 min-w-0 flex flex-col justify-center">
                <h3 class="text-slate-800 dark:text-white font-bold text-sm leading-tight truncate mb-0.5">${event.title}</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-1"><i class="ph-bold ph-calendar-blank mr-1"></i>${day} de ${month}</p>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium truncate max-w-[100px]">${event.tags?.[0] || 'Evento'}</span>
                    <span class="text-[10px] text-orange-500 font-bold flex items-center"><i class="ph-fill ph-fire mr-0.5"></i> ${(event.likesCount || 124) + (isFavorite(event.id) ? 1 : 0)}</span>
                    ${event.promotion ? `<span class="text-[10px] text-amber-500 font-bold flex items-center gap-0.5 bg-amber-500/10 px-1 rounded animate-pulse"><i class="ph-fill ph-gift"></i> Promo</span>` : ''}
                </div>
            </div>
            
            <div class="shrink-0 pl-2">
                <i class="ph-bold ph-caret-right text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors"></i>
            </div>
        </article>
    `;
};

export const createLandscapeAdCard = (ad) => {
    const isImageOnly = !ad.title && !ad.advertiser && !ad.cta;
    return `
        <article class="snap-center shrink-0 w-64 h-36 relative rounded-md overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-md bg-slate-900 border border-primary-500/50 flex flex-col group">
            <img src="${ad.image}" alt="${ad.advertiser || 'Ad'}" class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity">
            ${isImageOnly ? '' : '<div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>'}
            
            <div class="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-slate-300 text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border border-white/10 z-10">
                Ad
            </div>

            ${isImageOnly ? '' : `
            <div class="absolute bottom-0 left-0 w-full p-3 flex flex-col z-10">
                ${ad.advertiser || ad.logo ? `
                <div class="flex items-center gap-1.5 mb-1">
                    ${ad.logo ? `<img src="${ad.logo}" class="w-4 h-4 rounded-full border border-white/20 shrink-0">` : ''}
                    <h3 class="text-white text-[10px] font-bold leading-tight truncate opacity-80">${ad.advertiser}</h3>
                </div>
                ` : ''}
                ${ad.title ? `<p class="text-white text-sm font-black leading-tight truncate drop-shadow-md mb-2">${ad.title}</p>` : ''}
                ${ad.cta ? `<button class="w-max px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded text-[9px] font-bold uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-1">
                    ${ad.cta} <i class="ph-bold ph-arrow-right"></i>
                </button>` : ''}
            </div>
            `}
        </article>
    `;
};

export const createListAdCard = (ad) => {
    const isImageOnly = !ad.title && !ad.advertiser && !ad.cta;
    return `
        <article class="w-full ${isImageOnly ? 'h-24' : ''} flex items-center gap-3 p-2 rounded-lg bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors cursor-pointer group relative overflow-hidden">
            ${isImageOnly ? `
            <img src="${ad.image}" class="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
            <div class="absolute bottom-1 right-1 text-[8px] font-black text-white bg-black/60 px-1.5 py-0.5 rounded uppercase backdrop-blur-md">Ad</div>
            ` : `
            <div class="w-16 h-16 rounded-md overflow-hidden shrink-0 relative shadow-sm border border-primary-200 dark:border-primary-700">
                <img src="${ad.image}" alt="${ad.advertiser}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-90">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div class="absolute bottom-0.5 right-0.5 text-[6px] font-black text-white bg-black/60 px-1 rounded uppercase">Ad</div>
            </div>
            
            <div class="flex-1 min-w-0 flex flex-col justify-center">
                ${ad.advertiser || ad.logo ? `
                <div class="flex items-center gap-1 mb-0.5">
                    ${ad.logo ? `<img src="${ad.logo}" class="w-3 h-3 rounded-full">` : ''}
                    <span class="text-[9px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wide">${ad.advertiser}</span>
                </div>
                ` : ''}
                ${ad.title ? `<h3 class="text-slate-800 dark:text-white font-bold text-sm leading-tight truncate mb-1">${ad.title}</h3>` : ''}
                ${ad.description ? `<span class="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[90%]">${ad.description}</span>` : ''}
            </div>
            
            ${ad.cta ? `
            <div class="shrink-0 pl-2 z-10">
                <button class="bg-primary-500 text-white text-[9px] font-bold px-2 py-1.5 rounded flex items-center gap-1">
                    ${ad.cta}
                </button>
            </div>
            ` : ''}
            `}
        </article>
    `;
};

export const createGridAdCard = (ad) => {
    const isImageOnly = !ad.title && !ad.advertiser && !ad.cta;
    return `
        <article class="w-full aspect-[3/4] relative rounded-lg overflow-hidden cursor-pointer shadow-md border-[1.5px] border-primary-500/50 group bg-slate-900 animate-fade-in-up" style="animation-fill-mode: forwards;">
            <img src="${ad.image}" alt="${ad.advertiser || 'Ad'}" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-transform duration-700 ease-out group-hover:scale-105">
            ${isImageOnly ? '' : '<div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent pointer-events-none z-0"></div>'}
            
            <div class="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-slate-300 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm border border-white/10 z-10">
                Ad
            </div>

            ${isImageOnly ? '' : `
            <div class="absolute bottom-0 left-0 w-full p-2.5 z-20 flex flex-col justify-end">
                ${ad.advertiser || ad.logo ? `
                <div class="flex items-center gap-1 mb-1">
                    ${ad.logo ? `<img src="${ad.logo}" class="w-4 h-4 rounded-full border border-white/20">` : ''}
                    ${ad.advertiser ? `<h3 class="text-white font-bold text-[9px] uppercase tracking-wide opacity-80 truncate">${ad.advertiser}</h3>` : ''}
                </div>
                ` : ''}
                ${ad.title ? `<h4 class="text-white font-bold text-xs leading-tight mb-2 line-clamp-2 drop-shadow-md">${ad.title}</h4>` : ''}
                ${ad.cta ? `<button class="w-full py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded text-[9px] font-bold uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-1">
                    ${ad.cta}
                </button>` : ''}
            </div>
            `}
        </article>
    `;
};

export const createProducerAvatar = (producer) => {
    return `
        <div class="flex flex-col items-center gap-1.5 snap-center shrink-0 w-20 cursor-pointer js-producer-link group" data-producer-id="${producer.id}">
            <div class="w-16 h-16 rounded-full border-2 border-primary-100 dark:border-primary-900/50 p-0.5 relative transition-transform duration-300 group-hover:scale-105 group-active:scale-95 shadow-sm">
                <img src="${producer.logoUrl}" alt="${producer.name}" class="w-full h-full rounded-full object-cover bg-white shadow-inner">
                ${producer.isVerified ? `
                <div class="absolute bottom-0 -right-1 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center p-0.5 shadow-sm">
                    <i class="ph-fill ph-seal-check text-blue-500 text-[10px]"></i>
                </div>
                ` : ''}
            </div>
            <span class="text-[10px] font-bold text-slate-800 dark:text-slate-200 text-center leading-tight line-clamp-2 px-1">
                ${producer.name}
            </span>
        </div>
    `;
};

export const createProducerRow = (title, producers, icon = null) => {
    if (!producers || producers.length === 0) return '';
    const cardsHtml = producers.map(createProducerAvatar).join('');
    const iconHtml = icon ? `<i class="ph-fill ${icon} text-primary-500 mr-1.5"></i>` : '';
    
    return `
        <section class="relative">
            <div class="flex items-center justify-between px-4 mb-3">
                <h2 class="text-slate-800 dark:text-white font-bold text-[17px] tracking-tight flex items-center">${iconHtml}${title}</h2>
                <button class="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity active:scale-95 js-view-all-producers">
                    Ver tudo <i class="ph-bold ph-caret-right"></i>
                </button>
            </div>
            <div class="flex overflow-x-auto gap-4 px-4 pb-4 -mb-4 snap-x hide-scrollbar pt-1">
                ${cardsHtml}
            </div>
        </section>
    `;
};

export const createVIPProducerCard = (producer) => {
    return `
        <div class="flex-none w-[85%] snap-center cursor-pointer js-producer-link mr-4 first:ml-4" data-producer-id="${producer.id}">
            <div class="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-700/50 group">
                <img src="${producer.coverUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop'}" alt="Cover" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                
                <div class="absolute top-3 right-3 bg-primary-500/90 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-sm z-10 flex items-center gap-1">
                    <i class="ph-fill ph-crown text-yellow-300"></i> VIP
                </div>

                <div class="absolute bottom-0 left-0 w-full p-4 z-20 flex items-end gap-3">
                    <img src="${producer.logoUrl}" alt="${producer.name}" class="w-14 h-14 rounded-full border-2 border-white object-cover bg-white shrink-0 shadow-md">
                    <div class="flex-1 min-w-0 pb-1">
                        <h3 class="text-white font-bold text-sm truncate flex items-center gap-1 mb-0.5">
                            ${producer.name}
                            ${producer.isVerified ? `<i class="ph-fill ph-seal-check text-blue-400 text-xs shrink-0"></i>` : ''}
                        </h3>
                        <p class="text-slate-300 text-[10px] truncate mb-2">${(producer.followersCount || 0).toLocaleString()} seguidores</p>
                        ${isFollowingProducer(producer.id) ? `
                        <button class="js-follow-btn px-4 py-1.5 bg-transparent text-white border border-white/50 rounded-full text-[10px] font-bold tracking-wide transition-colors w-max" data-producer-id="${producer.id}" data-variant="vip">
                            Seguindo
                        </button>
                        ` : `
                        <button class="js-follow-btn px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white border border-transparent rounded-full text-[10px] font-bold tracking-wide transition-colors shadow-sm w-max" data-producer-id="${producer.id}" data-variant="vip">
                            Seguir Produtor
                        </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
};

export const createPremiumProducerCard = (producer) => {
    return `
        <div class="cursor-pointer js-producer-link flex flex-col bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group h-full overflow-hidden" data-producer-id="${producer.id}">
            
            <!-- Capa Superior -->
            <div class="h-16 w-full relative shrink-0">
                <img src="${producer.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'}" alt="Cover" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="absolute top-1.5 right-1.5 bg-slate-900/60 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm z-10">
                    Destaque
                </div>
            </div>

            <!-- Avatar Sobreposto & Info -->
            <div class="px-3 pb-3 flex-1 flex flex-col items-center -mt-8 relative z-20">
                <div class="relative mb-2">
                    <img src="${producer.logoUrl}" alt="${producer.name}" class="w-14 h-14 rounded-full border-2 border-white dark:border-slate-800 object-cover bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                    ${producer.isVerified ? `
                    <div class="absolute bottom-0 -right-0.5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center p-0.5 shadow-sm">
                        <i class="ph-fill ph-seal-check text-blue-500 text-[10px]"></i>
                    </div>
                    ` : ''}
                </div>
                
                <h3 class="text-slate-900 dark:text-white font-bold text-xs text-center line-clamp-1 mb-0.5">${producer.name}</h3>
                <p class="text-slate-500 dark:text-slate-400 text-[9px] text-center mb-2">${(producer.followersCount || 0).toLocaleString()} seguidores</p>
                <p class="text-slate-600 dark:text-slate-400 text-[9px] text-center line-clamp-2 mb-3 h-7 w-full leading-tight px-1">${producer.bio || 'Produtora oficial de eventos da região.'}</p>
                
                <div class="mt-auto w-full">
                    ${isFollowingProducer(producer.id) ? `
                    <button class="js-follow-btn w-full py-1.5 bg-transparent text-slate-500 border border-slate-300 dark:border-slate-600 rounded-xl text-[10px] font-bold tracking-wide transition-colors" data-producer-id="${producer.id}" data-variant="premium">
                        Seguindo
                    </button>
                    ` : `
                    <button class="js-follow-btn w-full py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-transparent rounded-xl text-[10px] font-bold tracking-wide transition-colors" data-producer-id="${producer.id}" data-variant="premium">
                        Seguir
                    </button>
                    `}
                </div>
            </div>
        </div>
    `;
};

export const createLandscapeRow = (title, events, injectedAd = null, insertIndex = 3, icon = null, sectionFilter = null) => {
    if (!events || events.length === 0) return '';
    let cardsArray = events.map(createLandscapeCard);
    
    if (injectedAd) {
        cardsArray.splice(insertIndex, 0, createLandscapeAdCard(injectedAd));
    }
    
    const cardsHtml = cardsArray.join('');
    const iconHtml = icon ? `<i class="ph-fill ${icon} text-primary-500 mr-1.5"></i>` : '';
    const filterAttr = sectionFilter ? `data-section-filter="${sectionFilter}"` : '';
    
    return `
        <section class="relative">
            <div class="flex items-center justify-between px-4 mb-3">
                <h2 class="text-slate-800 dark:text-white font-bold text-[17px] tracking-tight flex items-center">${iconHtml}${title}</h2>
                <button data-search-trigger="category" data-search-value="${title}" ${filterAttr} class="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity active:scale-95">
                    Ver tudo <i class="ph-bold ph-caret-right"></i>
                </button>
            </div>
            <div class="flex overflow-x-auto gap-3 px-4 pb-4 -mb-4 snap-x hide-scrollbar pt-1">
                ${cardsHtml}
            </div>
        </section>
    `;
};

export const createListRow = (title, events, injectedAd = null, insertIndex = 3, icon = null, sectionFilter = null) => {
    if (!events || events.length === 0) return '';
    let cardsArray = events.map(createListCard);
    
    if (injectedAd) {
        cardsArray.splice(insertIndex, 0, createListAdCard(injectedAd));
    }
    
    const cardsHtml = cardsArray.join('');
    const iconHtml = icon ? `<i class="ph-fill ${icon} text-primary-500 mr-1.5"></i>` : '';
    const filterAttr = sectionFilter ? `data-section-filter="${sectionFilter}"` : '';
    
    return `
        <section class="relative px-4">
            <div class="flex items-center justify-between mb-3">
                <h2 class="text-slate-800 dark:text-white font-bold text-[17px] tracking-tight flex items-center">${iconHtml}${title}</h2>
                <button data-search-trigger="category" data-search-value="${title}" ${filterAttr} class="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity active:scale-95">
                    Mais <i class="ph-bold ph-caret-right"></i>
                </button>
            </div>
            <div class="flex flex-col gap-1 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 p-2 rounded-xl shadow-sm">
                ${cardsHtml}
            </div>
        </section>
    `;
};

export const createGridSection = (title, events, injectedAd = null, insertIndex = 3, icon = null, sectionFilter = null) => {
    if (!events || events.length === 0) return '';
    let cardsArray = events.map(createGridCard);
    
    if (injectedAd) {
        cardsArray.splice(insertIndex, 0, createGridAdCard(injectedAd));
    }
    
    const cardsHtml = cardsArray.join('');
    const iconHtml = icon ? `<i class="ph-fill ${icon} text-primary-500 mr-1.5"></i>` : '';
    const filterAttr = sectionFilter ? `data-section-filter="${sectionFilter}"` : '';
    
    return `
        <section class="relative">
            <div class="flex items-center justify-between px-4 mb-3">
                <h2 class="text-slate-800 dark:text-white font-bold text-[17px] tracking-tight flex items-center">${iconHtml}${title}</h2>
                <button data-search-trigger="category" data-search-value="${title}" ${filterAttr} class="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity active:scale-95">
                    Ver tudo <i class="ph-bold ph-caret-right"></i>
                </button>
            </div>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 px-4 pt-1">
                ${cardsHtml}
            </div>
        </section>
    `;
};

export const createBentoSection = (title, events, injectedAd = null, insertIndex = 0, icon = null, bentoLayout = null, sectionFilter = null) => {
    let items = [...(events || [])];
    
    if (injectedAd) {
        items.splice(Math.max(0, insertIndex), 0, { ...injectedAd, isAd: true });
    }
    
    // Bloco inativo até que existam pelo menos 3 itens
    if (items.length < 3) return '';
    items = items.slice(0, 3);
    const count = items.length;

    const renderBentoCard = (e, shape) => {
        let spanClasses = '';
        if (shape === 'tall') spanClasses = 'col-span-1 row-span-2';
        else if (shape === 'wide') spanClasses = 'col-span-2 row-span-1';
        else if (shape === 'square') spanClasses = 'col-span-1 row-span-1';
        else if (shape === 'full') spanClasses = 'col-span-2 row-span-2';

        if (e.isAd) {
            const isImageOnly = !e.title && !e.advertiser && !e.cta;
            const showLogo = shape !== 'square' && e.logo;
            const titleClass = shape === 'square' ? 'text-[10px] line-clamp-1' : 'text-sm sm:text-base font-bold text-white line-clamp-2 mb-1';
            const descClass = shape === 'square' ? 'text-[8px] line-clamp-2' : 'text-[10px] sm:text-xs text-slate-300 line-clamp-2 mb-2';
            const bgGradient = shape === 'square' 
                ? '<div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none"></div>'
                : '<div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent pointer-events-none"></div>';

            return `
                <article class="event-card relative rounded-2xl overflow-hidden cursor-pointer shadow-md group h-full w-full flex flex-col bg-slate-900 border border-slate-200 dark:border-slate-800 ${spanClasses}" onclick="window.open('${e.url || '#'}', '_blank')">
                    <img src="${e.image}" alt="Ad" class="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 group-hover:opacity-100">
                    ${isImageOnly ? '' : bgGradient}
                    
                    <div class="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-slate-900 shadow-sm z-10">
                        Ad
                    </div>
                    
                    ${isImageOnly ? '' : `
                    <div class="absolute bottom-0 left-0 w-full p-2 sm:p-3 flex flex-col justify-end z-10">
                        ${showLogo ? `<img src="${e.logo}" class="w-8 h-8 rounded-full mb-2 bg-white object-cover border-2 border-white shadow-sm">` : ''}
                        ${e.title || e.advertiser ? `<h3 class="${titleClass} leading-tight drop-shadow-md pr-6 shadow-sm">${e.title || e.advertiser}</h3>` : ''}
                        ${e.description ? `<p class="${descClass} w-full leading-tight drop-shadow-md">${e.description}</p>` : ''}
                        ${e.cta ? `<button class="${shape === 'square' ? 'mt-0.5 text-[8px]' : 'mt-1 text-[10px]'} bg-primary-500 hover:bg-primary-600 text-white font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded shadow-md self-start flex items-center gap-1 transition-transform active:scale-95">${e.cta} ${shape !== 'square' ? '<i class="ph-bold ph-caret-right"></i>' : ''}</button>` : ''}
                    </div>
                    `}
                </article>
            `;
        }

        const date = new Date(e.date);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

        if (shape === 'square') {
            return `
                <article class="event-card relative rounded-2xl overflow-hidden cursor-pointer shadow-sm group h-full w-full flex flex-col bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 ${spanClasses}" data-event-id="${e.id}">
                    <div class="relative w-full h-[85px] shrink-0">
                        <img src="${e.imageUrl || e.image}" alt="${e.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                        <div class="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-md rounded flex flex-col items-center justify-center w-7 h-7 shadow-sm border border-white/10">
                            <span class="text-[7px] font-black text-primary-500 uppercase leading-none mb-0.5">${month}</span>
                            <span class="text-[10px] font-bold text-white leading-none">${day}</span>
                        </div>
                    </div>
                    <div class="p-2 flex-1 flex flex-col justify-between relative">
                        <h3 class="text-[10px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight mb-1 pr-5">${e.title}</h3>
                        <div class="flex items-center justify-between mt-auto">
                            <p class="text-[9px] text-slate-500 dark:text-slate-400 truncate w-full flex items-center gap-0.5"><i class="ph-fill ph-map-pin"></i> ${e.city}</p>
                        </div>
                        <button class="absolute top-2 right-1.5 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors z-20 js-like-btn" data-event-id="${e.id}">
                            <i class="${isFavorite(e.id) ? 'ph-fill text-red-500' : 'ph'} ph-heart text-[9px] pointer-events-none transition-colors"></i>
                        </button>
                    </div>
                </article>
            `;
        } else {
            return `
                <article class="event-card relative rounded-2xl overflow-hidden cursor-pointer shadow-md group h-full w-full border border-slate-200 dark:border-slate-800 ${spanClasses}" data-event-id="${e.id}">
                    <img src="${e.imageUrl || e.image}" alt="${e.title}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                    
                    <div class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md rounded-lg flex flex-col items-center justify-center w-11 h-11 shadow-sm border border-white/10 z-10">
                        <span class="text-[9px] font-black text-primary-500 uppercase leading-none mb-0.5">${month}</span>
                        <span class="text-[15px] font-bold text-white leading-none">${day}</span>
                    </div>
                    
                    <button class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:text-red-500 transition-colors z-20 js-like-btn shadow-sm" data-event-id="${e.id}">
                        <i class="${isFavorite(e.id) ? 'ph-fill text-red-500' : 'ph'} ph-heart text-sm pointer-events-none transition-colors"></i>
                    </button>
                    
                    <div class="absolute bottom-0 left-0 right-0 p-3 z-10">
                        <span class="inline-block bg-primary-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mb-1.5 shadow-sm">${e.category || 'Destaque'}</span>
                        <h3 class="text-sm font-bold text-white line-clamp-2 leading-tight mb-1 shadow-sm">${e.title}</h3>
                        <p class="text-[10px] text-slate-300 font-medium truncate flex items-center gap-1"><i class="ph-fill ph-map-pin"></i> ${e.city}</p>
                    </div>
                </article>
            `;
        }
    };

    // Hash the title to deterministically select layout variant
    const hashStr = title || 'bento';
    let hash = 0;
    for (let i = 0; i < hashStr.length; i++) {
        hash = hashStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);

    let cardsHtml = '';

    if (count === 1) {
        cardsHtml = renderBentoCard(items[0], 'full');
    } else if (count === 2) {
        const variant = absHash % 2 === 0 ? 'horizontal' : 'vertical';
        if (variant === 'horizontal') {
            cardsHtml = renderBentoCard(items[0], 'wide') + renderBentoCard(items[1], 'wide');
        } else {
            cardsHtml = renderBentoCard(items[0], 'tall') + renderBentoCard(items[1], 'tall');
        }
    } else if (count === 3) {
        // Usa layout fixo se definido, caso contrário usa hash determinístico
        let variant;
        if (bentoLayout && ['left', 'right', 'top', 'bottom'].includes(bentoLayout)) {
            variant = bentoLayout;
        } else {
            const variants = ['left', 'right', 'top', 'bottom'];
            variant = variants[absHash % 4];
        }

        if (variant === 'left') {
            cardsHtml = renderBentoCard(items[0], 'tall') +
                        renderBentoCard(items[1], 'square') +
                        renderBentoCard(items[2], 'square');
        } else if (variant === 'right') {
            cardsHtml = renderBentoCard(items[0], 'square') +
                        renderBentoCard(items[1], 'tall') +
                        renderBentoCard(items[2], 'square');
        } else if (variant === 'top') {
            cardsHtml = renderBentoCard(items[0], 'wide') +
                        renderBentoCard(items[1], 'square') +
                        renderBentoCard(items[2], 'square');
        } else if (variant === 'bottom') {
            cardsHtml = renderBentoCard(items[0], 'square') +
                        renderBentoCard(items[1], 'square') +
                        renderBentoCard(items[2], 'wide');
        }
    }

    const iconHtml = icon ? `<i class="ph-fill ${icon} text-primary-500 mr-1.5"></i>` : '';

    return `
        <section class="relative">
            <div class="flex items-center justify-between px-4 mb-3">
                <h2 class="text-slate-800 dark:text-white font-bold text-[17px] tracking-tight flex items-center gap-1.5">
                    ${iconHtml}${title}
                </h2>
                <button data-search-trigger="category" data-search-value="${title}" ${sectionFilter ? `data-section-filter="${sectionFilter}"` : ''} class="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity active:scale-95">
                    Ver tudo <i class="ph-bold ph-caret-right"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-2 grid-rows-2 gap-3 px-4 h-[300px]">
                ${cardsHtml}
            </div>
        </section>
    `;
};

export const createFeaturedSingle = (section, events) => {
    if (!events || events.length === 0) return '';
    const event = events[0]; // Pega apenas o primeiro
    const date = new Date(event.date);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    
    let titleHtml = '';
    if (section.title) {
        const iconHtml = section.icon ? `<i class="ph-fill ${section.icon} text-yellow-500"></i> ` : '';
        titleHtml = `
            <h2 class="text-slate-800 dark:text-white font-bold text-[17px] tracking-tight mb-3 flex items-center gap-1.5">
                ${iconHtml}${section.title}
            </h2>
        `;
    }

    const ctaText = section.ctaLabel || 'Garanta seu ingresso';

    return `
        <section class="relative px-4">
            ${titleHtml}
            <article class="event-card w-full aspect-square sm:aspect-video relative rounded-xl overflow-hidden cursor-pointer shadow-lg group" data-event-id="${event.id}">
                <img src="${event.imageUrl || event.image}" alt="${event.title}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                
                <div class="absolute top-3 right-3 flex flex-col items-end gap-2 z-10">
                    <div class="bg-red-600 text-white font-black text-[10px] uppercase px-2 py-1 rounded shadow-md animate-pulse">
                        Imperdível
                    </div>
                    ${event.promotion ? `
                    <div class="bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-md flex items-center gap-1.5 uppercase tracking-wider">
                        <span class="animate-bounce shrink-0">🎁</span> 
                        <span class="truncate max-w-[120px]">${event.promotion.label || 'Promo'}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="absolute bottom-0 left-0 w-full p-4 z-10 flex flex-col items-center text-center">
                    <span class="text-primary-400 font-black text-xs uppercase tracking-widest mb-1">${day} ${month}</span>
                    <h3 class="text-white text-2xl font-black leading-tight drop-shadow-lg mb-2">${event.title}</h3>
                    <p class="text-slate-300 text-xs mb-3 max-w-[80%] line-clamp-2">${event.description}</p>
                    <button class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-primary-500/30 transition-colors w-full sm:w-auto">
                        ${ctaText}
                    </button>
                </div>
            </article>
        </section>
    `;
};

// ==========================================
// 8. TELA DE PERFIL E INGRESSOS
// ==========================================

export const createHeroTicket = (ticket) => {
    const d = new Date(ticket.event.date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    const time = d.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return `
        <div class="relative w-full rounded-2xl overflow-hidden shadow-xl mb-6 flex flex-col bg-surface-light dark:bg-surface-dark border-x border-t border-slate-200 dark:border-slate-700 animate-fade-in-up">
            <!-- Imagem do Evento -->
            <div class="w-full h-40 relative shrink-0">
                <img src="${ticket.event.imageUrl || ticket.event.image}" alt="${ticket.event.title}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div class="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
                    ${ticket.quantity}x VIP
                </div>
            </div>

            <!-- Corpo do Ingresso -->
            <div class="p-5 flex-1 relative bg-white dark:bg-slate-900 border-b-2 border-dashed border-slate-300 dark:border-slate-700">
                <!-- Recortes (Cutouts) estilo Ticket -->
                <div class="absolute -bottom-3 -left-3 w-6 h-6 bg-background-light dark:bg-background-dark rounded-full shadow-inner border-t border-r border-slate-200 dark:border-slate-700 z-10"></div>
                <div class="absolute -bottom-3 -right-3 w-6 h-6 bg-background-light dark:bg-background-dark rounded-full shadow-inner border-t border-l border-slate-200 dark:border-slate-700 z-10"></div>

                <div class="flex gap-4">
                    <div class="flex flex-col items-center justify-center bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 p-3 rounded-xl border border-primary-100 dark:border-primary-800/30 shrink-0 min-w-[60px]">
                        <span class="text-xs font-bold uppercase mb-0.5">${month}</span>
                        <span class="text-2xl font-black leading-none">${day}</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight mb-1 line-clamp-2">${ticket.event.title}</h3>
                        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                            <i class="ph-bold ph-clock"></i> ${time}
                        </p>
                        <p class="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 truncate max-w-full">
                            <i class="ph-fill ph-map-pin"></i> ${ticket.event.city}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Rodapé / Botão de Ação -->
            <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-b-2xl border-x border-b border-slate-200 dark:border-slate-700 flex flex-col items-center">
                <p class="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-3">ID: #${ticket.orderId}</p>
                <button class="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-black text-sm uppercase tracking-wide transition-colors shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2">
                    <i class="ph-bold ph-qr-code text-xl"></i> Mostrar Ingresso
                </button>
            </div>
        </div>
    `;
};

export const createSmallTicket = (ticket) => {
    const d = new Date(ticket.event.date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    
    return `
        <div class="snap-center shrink-0 w-64 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex overflow-hidden cursor-pointer hover:border-primary-300 transition-colors">
            <!-- Data -->
            <div class="w-16 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center border-r border-dashed border-slate-300 dark:border-slate-700 shrink-0 relative">
                <div class="absolute -top-1 -right-1.5 w-3 h-3 bg-background-light dark:bg-background-dark rounded-full"></div>
                <div class="absolute -bottom-1 -right-1.5 w-3 h-3 bg-background-light dark:bg-background-dark rounded-full"></div>
                <span class="text-[9px] font-bold text-slate-500 uppercase">${month}</span>
                <span class="text-base font-black text-primary-500 leading-none">${day}</span>
            </div>
            <!-- Info -->
            <div class="flex-1 p-3 flex flex-col justify-center min-w-0">
                <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mb-1">${ticket.event.title}</h4>
                <div class="flex items-center justify-between">
                    <span class="text-[9px] text-slate-500 font-medium">${ticket.quantity}x VIP</span>
                    <span class="text-[9px] font-bold text-primary-500 uppercase">Ver</span>
                </div>
            </div>
        </div>
    `;
};

export const createProfileMenu = () => {
    const items = [
        { icon: 'ph-ticket', label: 'Histórico de Ingressos', badge: null },
        { icon: 'ph-credit-card', label: 'Métodos de Pagamento', badge: null },
        { icon: 'ph-heart', label: 'Eventos Favoritos', badge: null },
        { icon: 'ph-bell-ringing', label: 'Notificações', badge: '3' },
        { icon: 'ph-headset', label: 'Ajuda e Suporte', badge: null },
        { icon: 'ph-gear', label: 'Configurações da Conta', badge: null },
    ];

    return items.map(item => `
        <button class="w-full flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm mb-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-primary-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                    <i class="ph-fill ${item.icon} text-lg"></i>
                </div>
                <span class="text-sm font-bold text-slate-700 dark:text-slate-300">${item.label}</span>
            </div>
            <div class="flex items-center gap-2">
                ${item.badge ? `<span class="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">${item.badge}</span>` : ''}
                <i class="ph-bold ph-caret-right text-slate-300 dark:text-slate-600"></i>
            </div>
        </button>
    `).join('');
};

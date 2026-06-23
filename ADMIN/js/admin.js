import { fetchEvents, fetchAppData, DB_KEYS, initDB } from './api.js';

// Inicializa o banco (seeding) antes de montar o admin
await initDB();

// ==========================================
// RENDERIZAÇÃO
// ==========================================
function renderDashboardStats(db) {
    const statEvents = document.getElementById('stat-events');
    const statProducers = document.getElementById('stat-producers');
    const statAds = document.getElementById('stat-ads');
    const statAdvertisers = document.getElementById('stat-advertisers');
    
    if(statEvents) statEvents.textContent = db.events ? db.events.length : 0;
    if(statProducers) statProducers.textContent = db.producers ? db.producers.length : 0;
    if(statAds) statAds.textContent = db.ads ? db.ads.length : 0;
    if(statAdvertisers) statAdvertisers.textContent = db.advertisers ? db.advertisers.length : 0;
}

function renderEventsTable(db) {
    const tbody = document.getElementById('admin-events-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    db.events.forEach(event => {
        // Tenta pegar o nome do produtor se não tiver (provisório)
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group';
        
        tr.innerHTML = `
            <td class="px-4 sm:px-6 py-4 whitespace-normal max-w-0 w-full">
                <div class="flex items-center gap-3">
                    <img src="${event.imageUrl || event.image || 'https://ui-avatars.com/api/?name=Evento&background=cbd5e1&color=475569'}" alt="" class="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0">
                    <div class="min-w-0">
                        <p class="font-bold text-slate-900 dark:text-white truncate">${event.title || 'Evento sem título'}</p>
                        <p class="text-xs text-slate-500 truncate">${event.category || 'Sem categoria'}</p>
                    </div>
                </div>
            </td>
            <td class="hidden md:table-cell px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                ${event.date || 'Não definida'}
            </td>
            <td class="hidden sm:table-cell px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                ${event.location || 'Não definido'}
            </td>
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                ${event.price ? `R$ ${Number(event.price).toFixed(2)}` : '<span class="text-green-500">Grátis</span>'}
            </td>
            <td class="px-4 sm:px-6 py-4 text-right whitespace-nowrap w-24">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors btn-edit-event" data-id="${event.id}" title="Editar">
                        <i class="ph-bold ph-pencil-simple pointer-events-none"></i>
                    </button>
                    <button class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors btn-delete-event" data-id="${event.id}" title="Excluir">
                        <i class="ph-bold ph-trash pointer-events-none"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach listeners
    document.querySelectorAll('.btn-edit-event').forEach(btn => {
        btn.addEventListener('click', (e) => openModal(db, parseInt(e.target.dataset.id)));
    });
    
    document.querySelectorAll('.btn-delete-event').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(confirm('Tem certeza que deseja excluir este evento?')) {
                const id = parseInt(e.target.dataset.id);
                db.events = db.events.filter(ev => ev.id !== id);
                localStorage.setItem(ADMIN_EVENTS_KEY, JSON.stringify(db.events));
                renderEventsTable(db);
                renderDashboardStats(db);
            }
        });
    });
}

function renderProducersTable(db) {
    const tbody = document.getElementById('admin-producers-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    db.producers.forEach(producer => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group';
        
        tr.innerHTML = `
            <td class="px-4 sm:px-6 py-4 whitespace-normal max-w-0 w-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors rounded-l-xl btn-view-producer" data-id="${producer.id}" title="Ver detalhes">
                <div class="flex items-center gap-3">
                    <img src="${producer.avatar || 'https://ui-avatars.com/api/?name=Realizador&background=cbd5e1&color=475569'}" alt="" class="w-10 h-10 rounded-full object-cover bg-slate-200 shrink-0 border-2 border-white dark:border-slate-800 pointer-events-none">
                    <div class="min-w-0 pointer-events-none">
                        <p class="font-bold text-slate-900 dark:text-white truncate">${producer.name || 'Sem nome'}</p>
                        <p class="text-xs text-slate-500 truncate">ID: ${producer.id || 'N/A'}</p>
                    </div>
                </div>
            </td>
            <td class="hidden sm:table-cell px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                ${producer.role || 'Não definida'}
            </td>
            <td class="hidden md:table-cell px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                ${(producer.followersCount || 0).toLocaleString('pt-BR')}
            </td>
            <td class="px-4 sm:px-6 py-4 text-right whitespace-nowrap w-24">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors btn-edit-producer" data-id="${producer.id}" title="Editar">
                        <i class="ph-bold ph-pencil-simple pointer-events-none"></i>
                    </button>
                    <button class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors btn-delete-producer" data-id="${producer.id}" title="Excluir">
                        <i class="ph-bold ph-trash pointer-events-none"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach listeners
    document.querySelectorAll('.btn-edit-producer').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.currentTarget.dataset.id;
            openProducerModal(db, isNaN(id) ? id : parseInt(id));
        });
    });
    
    document.querySelectorAll('.btn-view-producer').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            openProducerDetails(db, isNaN(id) ? id : parseInt(id));
        });
    });
    
    document.querySelectorAll('.btn-delete-producer').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if(confirm('Tem certeza que deseja excluir este realizador?')) {
                const id = e.currentTarget.dataset.id;
                db.producers = db.producers.filter(p => String(p.id) !== String(id));
                localStorage.setItem('@EventApp:admin_producers', JSON.stringify(db.producers));
                renderProducersTable(db);
                renderDashboardStats(db);
            }
        });
    });
}

function renderAdsGrid(db) {
    const grid = document.getElementById('admin-ads-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    if (!db.ads || db.ads.length === 0) {
        grid.innerHTML = '<p class="text-slate-500 dark:text-slate-400 col-span-full">Nenhum anúncio encontrado.</p>';
        return;
    }

    db.ads.forEach((ad, index) => {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group';
        
        const isPaused = ad.status === 'paused';
        const statusClass = isPaused ? 'bg-slate-500/80 text-white' : 'bg-green-500/80 text-white';
        const statusText = isPaused ? 'Pausado' : 'Ativo';
        
        let zoneText = 'Feed Principal';
        if (ad.zone === 'utility') zoneText = 'Utilitário';
        if (ad.zone === 'sticky') zoneText = 'Pop-up/Fixo';
        if (!ad.zone) ad.zone = 'native_feed';

        card.innerHTML = `
            <div class="h-32 w-full relative">
                <img src="${ad.image || ad.imageUrl || ad.logo || 'https://via.placeholder.com/400x200?text=Sem+Imagem'}" alt="" class="w-full h-full object-cover ${isPaused ? 'grayscale opacity-70' : ''}">
                <div class="absolute top-2 left-2 flex gap-1">
                    <span class="px-2 py-1 rounded-md text-[10px] font-bold backdrop-blur-md ${statusClass}">${statusText}</span>
                    <span class="px-2 py-1 rounded-md text-[10px] font-bold bg-black/50 text-white backdrop-blur-md border border-white/10">${zoneText}</span>
                </div>
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button class="btn-edit-ad w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-colors" data-id="${ad.id}" title="Editar">
                        <i class="ph-bold ph-pencil-simple pointer-events-none"></i>
                    </button>
                    <button class="btn-delete-ad w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-md flex items-center justify-center transition-colors" data-id="${ad.id}" title="Excluir">
                        <i class="ph-bold ph-trash pointer-events-none"></i>
                    </button>
                </div>
            </div>
            <div class="p-5 ${isPaused ? 'opacity-70' : ''}">
                <h4 class="font-bold text-slate-900 dark:text-white mb-1 truncate">${ad.title || 'Sem título'}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 h-8">${ad.description || 'Sem descrição'}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md truncate max-w-[120px]">${ad.ctaText || ad.cta || 'Link'}</span>
                    <span class="text-[10px] text-slate-400">ID: ${ad.id || index}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Attach listeners
    document.querySelectorAll('.btn-edit-ad').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            openAdModal(db, isNaN(id) ? id : parseInt(id));
        });
    });
    
    document.querySelectorAll('.btn-delete-ad').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(confirm('Tem certeza que deseja excluir este anúncio?')) {
                const id = e.currentTarget.dataset.id;
                db.ads = db.ads.filter(a => String(a.id) !== String(id));
                localStorage.setItem('@EventApp:admin_ads', JSON.stringify(db.ads));
                renderAdsGrid(db);
                renderDashboardStats(db);
            }
        });
    });
}

function renderAdvertisersTable(db) {
    const tbody = document.getElementById('admin-advertisers-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    if (!db.advertisers) db.advertisers = [];
    
    db.advertisers.forEach(adv => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group';
        
        tr.innerHTML = `
            <td class="px-4 sm:px-6 py-4 whitespace-normal max-w-0 w-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors rounded-l-xl btn-view-advertiser" data-id="${adv.id}" title="Ver detalhes">
                <div class="flex items-center gap-3">
                    <img src="${adv.logo || 'https://ui-avatars.com/api/?name=A&background=cbd5e1&color=475569'}" alt="" class="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0 border border-slate-200 dark:border-slate-700">
                    <div class="min-w-0">
                        <p class="font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">${adv.name || 'Sem nome'}</p>
                        <p class="text-xs text-slate-500 truncate">${adv.email || 'Sem email'}</p>
                    </div>
                </div>
            </td>
            <td class="hidden sm:table-cell px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                ${adv.sector || 'Não definido'}
            </td>
            <td class="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-md ${adv.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}">
                    ${adv.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td class="px-4 sm:px-6 py-4 text-right whitespace-nowrap w-24">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors btn-edit-advertiser" data-id="${adv.id}" title="Editar">
                        <i class="ph-bold ph-pencil-simple pointer-events-none"></i>
                    </button>
                    <button class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors btn-delete-advertiser" data-id="${adv.id}" title="Excluir">
                        <i class="ph-bold ph-trash pointer-events-none"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-edit-advertiser').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.currentTarget.dataset.id;
            openAdvertiserModal(db, isNaN(id) ? id : parseInt(id));
        });
    });
    
    document.querySelectorAll('.btn-view-advertiser').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            openAdvertiserDetails(db, isNaN(id) ? id : parseInt(id));
        });
    });
    
    document.querySelectorAll('.btn-delete-advertiser').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(confirm('Tem certeza que deseja excluir este anunciante?')) {
                const id = e.currentTarget.dataset.id;
                db.advertisers = db.advertisers.filter(a => String(a.id) !== String(id));
                localStorage.setItem('@EventApp:admin_advertisers', JSON.stringify(db.advertisers));
                renderAdvertisersTable(db);
                renderDashboardStats(db);
            }
        });
    });
}

// ==========================================
// CONTROLE DE INTERFACE (SPA & UI)
// ==========================================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.admin-view');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = item.getAttribute('data-view');
            
            // Atualiza menu ativo
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Atualiza Título
            pageTitle.textContent = item.textContent.trim();

            // Esconde todas as views e mostra a selecionada
            views.forEach(view => {
                view.classList.add('hidden');
                view.classList.remove('block');
            });
            const viewEl = document.getElementById(`view-${targetView}`);
            if (viewEl) {
                viewEl.classList.remove('hidden');
                viewEl.classList.add('block');
            }

            // No mobile, fecha a sidebar ao clicar num item
            if (window.innerWidth < 768) {
                document.body.classList.remove('sidebar-open');
                document.getElementById('sidebar-overlay').classList.add('hidden');
            }
        });
    });
}

function setupMobileSidebar() {
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    const openSidebar = () => {
        document.body.classList.add('sidebar-open');
        overlay.classList.remove('hidden');
    };

    const closeSidebar = () => {
        document.body.classList.remove('sidebar-open');
        overlay.classList.add('hidden');
    };

    openBtn?.addEventListener('click', openSidebar);
    closeBtn?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);
}

function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Inicializa verificando classe na tag html ou localStorage
    if (localStorage.getItem('theme') === 'light') {
        html.classList.remove('dark');
    } else {
        html.classList.add('dark'); // Padrão dark para admin
    }

    toggleBtn?.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });
}

// ==========================================
// MODAL DE EVENTOS
// ==========================================
let currentDb = null;

function setupModal() {
    const overlay = document.getElementById('event-modal-overlay');
    const modal = document.getElementById('event-modal');
    const closeBtns = [document.getElementById('close-modal-btn'), document.getElementById('cancel-modal-btn')];
    
    // Abrir Modal Novo Evento (seletor mais específico para evitar conflito com novo produtor)
    const btnNewEvent = document.querySelector('#view-events .bg-primary-500');
    if (btnNewEvent) {
        btnNewEvent.addEventListener('click', () => {
            openModal(currentDb, null);
        });
    }

    const closeModal = () => {
        modal.classList.remove('scale-100', 'opacity-100');
        modal.classList.add('scale-95', 'opacity-0');
        overlay.classList.remove('opacity-100');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    };

    closeBtns.forEach(btn => btn?.addEventListener('click', closeModal));
    overlay.addEventListener('click', (e) => {
        if(e.target === overlay) closeModal();
    });

    // Handle Form Submit
    document.getElementById('event-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('event-id').value;
        const eventData = {
            id: id ? parseInt(id) : Date.now(), // Simples ID generator
            title: document.getElementById('event-title').value,
            category: document.getElementById('event-category').value,
            date: document.getElementById('event-date').value,
            price: parseFloat(document.getElementById('event-price').value),
            location: document.getElementById('event-location').value,
            imageUrl: document.getElementById('event-image').value,
            isFree: parseFloat(document.getElementById('event-price').value) === 0
        };

        if (id) {
            // Edit
            const index = currentDb.events.findIndex(ev => ev.id === parseInt(id));
            if (index !== -1) currentDb.events[index] = { ...currentDb.events[index], ...eventData };
        } else {
            // New
            currentDb.events.unshift(eventData);
        }

        // Save and re-render
        localStorage.setItem(DB_KEYS.EVENTS, JSON.stringify(currentDb.events));
        renderEventsTable(currentDb);
        renderDashboardStats(currentDb);
        closeModal();
    });
}

function openModal(db, eventId = null) {
    currentDb = db;
    const overlay = document.getElementById('event-modal-overlay');
    const modal = document.getElementById('event-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('event-form');

    form.reset();
    document.getElementById('event-id').value = '';

    if (eventId) {
        title.textContent = 'Editar Evento';
        const ev = db.events.find(e => e.id === eventId);
        if (ev) {
            document.getElementById('event-id').value = ev.id;
            document.getElementById('event-title').value = ev.title || '';
            document.getElementById('event-category').value = ev.category || '';
            document.getElementById('event-date').value = ev.date || '';
            document.getElementById('event-price').value = ev.price || 0;
            document.getElementById('event-location').value = ev.location || '';
            document.getElementById('event-image').value = ev.imageUrl || ev.image || '';
        }
    } else {
        title.textContent = 'Novo Evento';
    }

    overlay.classList.remove('hidden');
    // Força reflow
    void overlay.offsetWidth;
    overlay.classList.add('opacity-100');
    modal.classList.remove('scale-95', 'opacity-0');
    modal.classList.add('scale-100', 'opacity-100');
}

// ==========================================
// MODAL DE REALIZADORES
// ==========================================
function setupProducerModal() {
    const overlay = document.getElementById('producer-modal-overlay');
    const modal = document.getElementById('producer-modal');
    const closeBtns = [document.getElementById('close-producer-modal-btn'), document.getElementById('cancel-producer-modal-btn')];
    
    // Abrir Modal Novo Realizador
    const btnNewProducer = document.querySelector('.btn-new-producer');
    if (btnNewProducer) {
        btnNewProducer.addEventListener('click', () => {
            openProducerModal(currentDb, null);
        });
    }

    const closeProducerModal = () => {
        modal.classList.remove('scale-100', 'opacity-100');
        modal.classList.add('scale-95', 'opacity-0');
        overlay.classList.remove('opacity-100');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    };

    closeBtns.forEach(btn => btn?.addEventListener('click', closeProducerModal));
    overlay.addEventListener('click', (e) => {
        if(e.target === overlay) closeProducerModal();
    });

    // Handle Form Submit
    document.getElementById('producer-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('producer-id').value;
        const producerData = {
            id: id || Date.now(), // Simples ID generator, mantem string/int dinâmico
            name: document.getElementById('producer-name').value,
            role: document.getElementById('producer-role').value,
            followersCount: parseInt(document.getElementById('producer-followers').value) || 0,
            avatar: document.getElementById('producer-avatar').value,
            banner: document.getElementById('producer-banner').value,
            instagram: document.getElementById('producer-instagram') ? document.getElementById('producer-instagram').value : '',
            whatsapp: document.getElementById('producer-whatsapp') ? document.getElementById('producer-whatsapp').value : '',
            maps: document.getElementById('producer-maps') ? document.getElementById('producer-maps').value : ''
        };

        if (id) {
            // Edit
            const index = currentDb.producers.findIndex(p => String(p.id) === String(id));
            if (index !== -1) currentDb.producers[index] = { ...currentDb.producers[index], ...producerData };
        } else {
            // New
            currentDb.producers.unshift(producerData);
        }

        // Save and re-render
        localStorage.setItem(DB_KEYS.PRODUCERS, JSON.stringify(currentDb.producers));
        renderProducersTable(currentDb);
        renderDashboardStats(currentDb);
        renderEventsTable(currentDb);
        renderGlobalPromotionsTable(currentDb);
        closeProducerModal();

        // Refresh details view se estiver aberto
        const detailsView = document.getElementById('view-producer-details');
        if (id && detailsView && !detailsView.classList.contains('hidden')) {
            openProducerDetails(currentDb, id);
        }
    });
}

function openProducerModal(db, producerId = null) {
    currentDb = db;
    const overlay = document.getElementById('producer-modal-overlay');
    const modal = document.getElementById('producer-modal');
    const title = document.getElementById('producer-modal-title');
    const form = document.getElementById('producer-form');

    form.reset();
    document.getElementById('producer-id').value = '';

    if (producerId) {
        title.textContent = 'Editar Realizador';
        const p = db.producers.find(pr => String(pr.id) === String(producerId));
        if (p) {
            document.getElementById('producer-id').value = p.id;
            document.getElementById('producer-name').value = p.name || '';
            document.getElementById('producer-role').value = p.role || '';
            document.getElementById('producer-followers').value = p.followersCount || 0;
            document.getElementById('producer-avatar').value = p.avatar || '';
            document.getElementById('producer-banner').value = p.banner || '';
            if(document.getElementById('producer-instagram')) document.getElementById('producer-instagram').value = p.instagram || '';
            if(document.getElementById('producer-whatsapp')) document.getElementById('producer-whatsapp').value = p.whatsapp || '';
            if(document.getElementById('producer-maps')) document.getElementById('producer-maps').value = p.maps || '';
        }
    } else {
        title.textContent = 'Novo Realizador';
    }

    overlay.classList.remove('hidden');
    // Força reflow
    void overlay.offsetWidth;
    overlay.classList.add('opacity-100');
    modal.classList.remove('scale-95', 'opacity-0');
    modal.classList.add('scale-100', 'opacity-100');
}

// ==========================================
// MODAL DE ANÚNCIOS
// ==========================================
function setupAdModal() {
    const overlay = document.getElementById('ad-modal-overlay');
    const modal = document.getElementById('ad-modal');
    const closeBtns = [document.getElementById('close-ad-modal-btn'), document.getElementById('cancel-ad-modal-btn')];
    
    // Abrir Modal Novo Anúncio
    const btnNewAd = document.querySelector('.btn-new-ad');
    if (btnNewAd) {
        btnNewAd.addEventListener('click', () => {
            openAdModal(currentDb, null);
        });
    }

    const closeAdModal = () => {
        modal.classList.remove('scale-100', 'opacity-100');
        modal.classList.add('scale-95', 'opacity-0');
        overlay.classList.remove('opacity-100');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    };

    closeBtns.forEach(btn => btn?.addEventListener('click', closeAdModal));
    overlay.addEventListener('click', (e) => {
        if(e.target === overlay) closeAdModal();
    });

    // Handle Form Submit
    const adForm = document.getElementById('ad-form');
    if(adForm) {
        adForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('ad-id').value;
            const adData = {
                id: id || `ad-${Date.now()}`,
                status: document.getElementById('ad-status').value,
                zone: document.getElementById('ad-zone').value,
                title: document.getElementById('ad-title').value,
                description: document.getElementById('ad-description').value,
                cta: document.getElementById('ad-cta').value,
                link: document.getElementById('ad-link').value,
                image: document.getElementById('ad-image').value
            };

            if (id) {
                // Edit
                const index = currentDb.ads.findIndex(a => String(a.id) === String(id));
                if (index !== -1) currentDb.ads[index] = { ...currentDb.ads[index], ...adData };
            } else {
                // New
                if(!currentDb.ads) currentDb.ads = [];
                currentDb.ads.unshift(adData);
            }

            // Save and re-render
            localStorage.setItem(DB_KEYS.ADS, JSON.stringify(currentDb.ads));
            renderAdsGrid(currentDb);
            renderDashboardStats(currentDb);
            closeAdModal();
        });
    }
}

function openAdModal(db, adId = null) {
    currentDb = db;
    const overlay = document.getElementById('ad-modal-overlay');
    const modal = document.getElementById('ad-modal');
    const title = document.getElementById('ad-modal-title');
    const form = document.getElementById('ad-form');

    if(form) form.reset();
    if(document.getElementById('ad-id')) document.getElementById('ad-id').value = '';

    if (adId) {
        title.textContent = 'Editar Anúncio';
        const ad = db.ads.find(a => String(a.id) === String(adId));
        if (ad) {
            document.getElementById('ad-id').value = ad.id;
            document.getElementById('ad-status').value = ad.status || 'active';
            document.getElementById('ad-zone').value = ad.zone || 'native_feed';
            document.getElementById('ad-title').value = ad.title || '';
            document.getElementById('ad-description').value = ad.description || '';
            document.getElementById('ad-cta').value = ad.ctaText || ad.cta || '';
            document.getElementById('ad-link').value = ad.link || '';
            document.getElementById('ad-image').value = ad.image || ad.imageUrl || ad.logo || '';
        }
    } else {
        title.textContent = 'Novo Anúncio';
        document.getElementById('ad-status').value = 'active';
        document.getElementById('ad-zone').value = 'native_feed';
    }

    overlay.classList.remove('hidden');
    // Força reflow
    void overlay.offsetWidth;
    overlay.classList.add('opacity-100');
    modal.classList.remove('scale-95', 'opacity-0');
    modal.classList.add('scale-100', 'opacity-100');
}

// ==========================================
// MODAL DE ANUNCIANTES
// ==========================================
function setupAdvertiserModal() {
    const overlay = document.getElementById('advertiser-modal-overlay');
    const modal = document.getElementById('advertiser-modal');
    const closeBtns = [document.getElementById('close-advertiser-modal-btn'), document.getElementById('cancel-advertiser-modal-btn')];
    
    const btnNewAdvertiser = document.querySelector('.btn-new-advertiser');
    if (btnNewAdvertiser) {
        btnNewAdvertiser.addEventListener('click', () => {
            openAdvertiserModal(currentDb, null);
        });
    }

    const closeAdvertiserModal = () => {
        if(modal) {
            modal.classList.remove('scale-100', 'opacity-100');
            modal.classList.add('scale-95', 'opacity-0');
        }
        if(overlay) {
            overlay.classList.remove('opacity-100');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }
    };

    closeBtns.forEach(btn => btn?.addEventListener('click', closeAdvertiserModal));
    if(overlay) {
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) closeAdvertiserModal();
        });
    }

    const form = document.getElementById('advertiser-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('advertiser-id').value;
            const advData = {
                id: id || Date.now(),
                name: document.getElementById('advertiser-name').value,
                sector: document.getElementById('advertiser-sector').value,
                status: document.getElementById('advertiser-status').value,
                email: document.getElementById('advertiser-email').value,
                logo: document.getElementById('advertiser-logo').value,
                banner: document.getElementById('advertiser-banner') ? document.getElementById('advertiser-banner').value : ''
            };

            if (id) {
                const index = currentDb.advertisers.findIndex(a => String(a.id) === String(id));
                if (index !== -1) currentDb.advertisers[index] = { ...currentDb.advertisers[index], ...advData };
            } else {
                if(!currentDb.advertisers) currentDb.advertisers = [];
                currentDb.advertisers.unshift(advData);
            }

            localStorage.setItem(DB_KEYS.ADVERTISERS, JSON.stringify(currentDb.advertisers));
            renderAdvertisersTable(currentDb);
            renderDashboardStats(currentDb);
            closeAdvertiserModal();

            // Refresh details view if it's open and we just edited it
            const detailsView = document.getElementById('view-advertiser-details');
            if (id && detailsView && !detailsView.classList.contains('hidden')) {
                openAdvertiserDetails(currentDb, id);
            }
        });
    }
}

function openAdvertiserModal(db, advId = null) {
    currentDb = db;
    const overlay = document.getElementById('advertiser-modal-overlay');
    const modal = document.getElementById('advertiser-modal');
    const title = document.getElementById('advertiser-modal-title');
    const form = document.getElementById('advertiser-form');

    if(form) form.reset();
    if(document.getElementById('advertiser-id')) document.getElementById('advertiser-id').value = '';

    if (advId) {
        title.textContent = 'Editar Anunciante';
        const adv = db.advertisers.find(a => String(a.id) === String(advId));
        if (adv) {
            document.getElementById('advertiser-id').value = adv.id;
            document.getElementById('advertiser-name').value = adv.name || '';
            document.getElementById('advertiser-sector').value = adv.sector || '';
            document.getElementById('advertiser-status').value = adv.status || 'active';
            document.getElementById('advertiser-email').value = adv.email || '';
            document.getElementById('advertiser-logo').value = adv.logo || '';
            if(document.getElementById('advertiser-banner')) document.getElementById('advertiser-banner').value = adv.banner || '';
        }
    } else {
        title.textContent = 'Novo Anunciante';
        if(document.getElementById('advertiser-status')) document.getElementById('advertiser-status').value = 'active';
    }

    if(overlay && modal) {
        overlay.classList.remove('hidden');
        void overlay.offsetWidth;
        overlay.classList.add('opacity-100');
        modal.classList.remove('scale-95', 'opacity-0');
        modal.classList.add('scale-100', 'opacity-100');
    }
}

// ==========================================
// DETALHES DE ANUNCIANTES (TABS)
// ==========================================
function setupAdvertiserTabs() {
    const tabBtns = document.querySelectorAll('.adv-tab-btn');
    const tabContents = document.querySelectorAll('.adv-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active', 'border-primary-500', 'text-primary-500');
                b.classList.add('border-transparent', 'text-slate-500', 'dark:text-slate-400');
            });
            btn.classList.add('active', 'border-primary-500', 'text-primary-500');
            btn.classList.remove('border-transparent', 'text-slate-500', 'dark:text-slate-400');

            tabContents.forEach(c => {
                c.classList.add('hidden');
                c.classList.remove('block');
            });
            const target = document.getElementById(btn.getAttribute('data-target'));
            if(target) {
                target.classList.remove('hidden');
                target.classList.add('block');
            }
        });
    });
}

function openAdvertiserDetails(db, advId) {
    const adv = db.advertisers.find(a => String(a.id) === String(advId));
    if(!adv) return;

    // Populate data safely
    const nameEl = document.getElementById('adv-details-name');
    if(nameEl) nameEl.textContent = adv.name || 'Sem nome';
    
    const sectorEl = document.getElementById('adv-details-sector');
    if(sectorEl) sectorEl.innerHTML = `<i class="ph-bold ph-tag"></i> ${adv.sector || 'Sem setor'}`;
    
    const logoEl = document.getElementById('adv-details-logo');
    if(logoEl) logoEl.src = adv.logo || 'https://ui-avatars.com/api/?name=A&background=cbd5e1&color=475569';
    
    const infoSectorEl = document.getElementById('adv-info-sector');
    if(infoSectorEl) infoSectorEl.textContent = adv.sector || 'Sem setor';
    
    const infoEmailEl = document.getElementById('adv-info-email');
    if(infoEmailEl) infoEmailEl.textContent = adv.email || 'Sem email';

    const statusBadge = document.getElementById('adv-details-status');
    if(statusBadge) {
        if (adv.status === 'active') {
            statusBadge.textContent = 'Ativo';
            statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20';
        } else {
            statusBadge.textContent = 'Inativo';
            statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
        }
    }

    const bannerEl = document.getElementById('adv-details-banner');
    if(bannerEl) {
        if(adv.banner) {
            bannerEl.style.backgroundImage = `url('${adv.banner}')`;
        } else {
            bannerEl.style.backgroundImage = '';
        }
    }

    const editBtn = document.getElementById('adv-details-edit-btn');
    if(editBtn) editBtn.onclick = () => openAdvertiserModal(db, advId);

    // Switch view
    document.querySelectorAll('.admin-view').forEach(v => {
        v.classList.add('hidden');
        v.classList.remove('block');
    });
    
    // Update active nav state correctly
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    const advNav = document.querySelector('.nav-item[data-view="advertisers"]');
    if (advNav) advNav.classList.add('active');
    
    const detailsView = document.getElementById('view-advertiser-details');
    if(detailsView) {
        detailsView.classList.remove('hidden');
        detailsView.classList.add('block');
    }

    // Reset tabs to Overview
    const overviewTab = document.querySelector('.adv-tab-btn[data-target="tab-overview"]');
    if(overviewTab) overviewTab.click();
}

// ==========================================
// REALIZADOR DETAILS
// ==========================================
function setupProducerTabs() {
    const tabs = document.querySelectorAll('.prod-tab-btn');
    const contents = document.querySelectorAll('.prod-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active', 'border-primary-500', 'text-primary-500');
                t.classList.add('border-transparent', 'text-slate-500', 'dark:text-slate-400');
            });
            contents.forEach(c => {
                c.classList.remove('block');
                c.classList.add('hidden');
            });

            tab.classList.remove('border-transparent', 'text-slate-500', 'dark:text-slate-400');
            tab.classList.add('active', 'border-primary-500', 'text-primary-500');

            const targetId = tab.dataset.target;
            const targetContent = document.getElementById(targetId);
            if(targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('block');
            }
        });
    });

    const editBtn = document.getElementById('prod-details-edit-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (currentOpenProducerId) openProducerModal(currentDb, currentOpenProducerId);
        });
    }
}

let currentOpenProducerId = null;

function openProducerDetails(db, prodId) {
    currentOpenProducerId = prodId;
    const prod = db.producers.find(p => String(p.id) === String(prodId));
    if(!prod) return;

    // Populate data safely
    const nameEl = document.getElementById('prod-details-name');
    if(nameEl) nameEl.textContent = prod.name || 'Sem nome';
    
    const roleEl = document.getElementById('prod-details-role');
    if(roleEl) roleEl.textContent = prod.role || 'Não definida';
    
    const avatarEl = document.getElementById('prod-details-avatar');
    if(avatarEl) avatarEl.src = prod.avatar || 'https://ui-avatars.com/api/?name=Realizador&background=cbd5e1&color=475569';
    
    const followersEl = document.getElementById('prod-info-followers');
    if(followersEl) followersEl.textContent = (prod.followersCount || 0).toLocaleString('pt-BR');

    const bannerEl = document.getElementById('prod-details-banner');
    if(bannerEl) {
        if(prod.banner) {
            bannerEl.style.backgroundImage = `url('${prod.banner}')`;
        } else {
            bannerEl.style.backgroundImage = '';
        }
    }

    const socialContainer = document.getElementById('prod-details-social');
    if (socialContainer) {
        socialContainer.innerHTML = '';
        if (prod.instagram) {
            socialContainer.innerHTML += `<a href="${prod.instagram}" target="_blank" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-pink-600 flex items-center justify-center hover:scale-110 hover:bg-pink-100 dark:hover:bg-pink-500/20 transition-all shadow-sm"><i class="ph-bold ph-instagram-logo"></i></a>`;
        }
        if (prod.whatsapp) {
            const waNumber = prod.whatsapp.replace(/\D/g, '');
            const waLink = waNumber ? `https://wa.me/${waNumber}` : '#';
            socialContainer.innerHTML += `<a href="${waLink}" target="_blank" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-green-500 flex items-center justify-center hover:scale-110 hover:bg-green-100 dark:hover:bg-green-500/20 transition-all shadow-sm"><i class="ph-bold ph-whatsapp-logo"></i></a>`;
        }
        if (prod.maps) {
            socialContainer.innerHTML += `<a href="${prod.maps}" target="_blank" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-blue-500 flex items-center justify-center hover:scale-110 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all shadow-sm"><i class="ph-bold ph-map-pin"></i></a>`;
        }
    }

    // Switch view
    document.querySelectorAll('.admin-view').forEach(v => {
        v.classList.add('hidden');
        v.classList.remove('block');
    });
    
    // Update active nav state correctly
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    const prodNav = document.querySelector('.nav-item[data-view="producers"]');
    if (prodNav) prodNav.classList.add('active');
    
    const detailsView = document.getElementById('view-producer-details');
    if(detailsView) {
        detailsView.classList.remove('hidden');
        detailsView.classList.add('block');
    }

    // Reset tabs to Overview
    const overviewTab = document.querySelector('.prod-tab-btn[data-target="tab-prod-overview"]');
    if(overviewTab) overviewTab.click();

    // Render promotions
    renderPromotionsList(prodId);
}

// ==========================================
// PROMOÇÕES (REALIZADORES)
// ==========================================
function setupPromoModal() {
    const overlay = document.getElementById('promo-modal-overlay');
    const modal = document.getElementById('promo-modal');
    const closeBtns = [document.getElementById('close-promo-modal-btn'), document.getElementById('cancel-promo-modal-btn')];
    
    const btnNewPromo = document.getElementById('btn-new-promo');
    if (btnNewPromo) {
        btnNewPromo.addEventListener('click', () => {
            if(currentOpenProducerId) openPromoModal(currentDb, null, currentOpenProducerId);
        });
    }
    
    // Botão de Nova Promoção na tela Global
    const btnNewGlobalPromo = document.getElementById('btn-new-global-promo');
    if (btnNewGlobalPromo) {
        btnNewGlobalPromo.addEventListener('click', () => {
            openPromoModal(currentDb, null, null);
        });
    }

    const closePromoModal = () => {
        modal.classList.remove('scale-100', 'opacity-100');
        modal.classList.add('scale-95', 'opacity-0');
        overlay.classList.remove('opacity-100');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    };

    closeBtns.forEach(btn => btn?.addEventListener('click', closePromoModal));
    if(overlay) {
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) closePromoModal();
        });
    }

    const form = document.getElementById('promo-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('promo-id').value;
            const producerId = document.getElementById('promo-producer-select').value;
            
            const promoData = {
                id: id || Date.now(),
                producerId: producerId,
                title: document.getElementById('promo-title').value,
                type: document.getElementById('promo-type').value,
                status: document.getElementById('promo-status').value,
                desc: document.getElementById('promo-desc').value,
                starts: document.getElementById('promo-starts') ? document.getElementById('promo-starts').value : '',
                expires: document.getElementById('promo-expires').value,
                banner: document.getElementById('promo-banner') ? document.getElementById('promo-banner').value : '',
                limit: document.getElementById('promo-limit') ? (document.getElementById('promo-limit').value ? parseInt(document.getElementById('promo-limit').value) : null) : null,
                limitOrange: document.getElementById('promo-limit-orange') ? (document.getElementById('promo-limit-orange').value ? parseInt(document.getElementById('promo-limit-orange').value) : null) : null,
                limitRed: document.getElementById('promo-limit-red') ? (document.getElementById('promo-limit-red').value ? parseInt(document.getElementById('promo-limit-red').value) : null) : null,
                claimed: document.getElementById('promo-claimed') ? parseInt(document.getElementById('promo-claimed').value) || 0 : 0
            };

            if (id) {
                const index = currentDb.promotions.findIndex(p => String(p.id) === String(id));
                if (index !== -1) currentDb.promotions[index] = { ...currentDb.promotions[index], ...promoData };
            } else {
                currentDb.promotions.unshift(promoData);
            }

            localStorage.setItem(DB_KEYS.PROMOTIONS, JSON.stringify(currentDb.promotions));
            renderPromotionsList(producerId);
            closePromoModal();
        });
    }
}

function openPromoModal(db, promoId = null, producerId = null) {
    const overlay = document.getElementById('promo-modal-overlay');
    const modal = document.getElementById('promo-modal');
    const title = document.getElementById('promo-modal-title');
    const form = document.getElementById('promo-form');
    const producerSelect = document.getElementById('promo-producer-select');

    if(form) form.reset();
    
    // Popula o select de realizadores
    if (producerSelect && db.producers) {
        producerSelect.innerHTML = db.producers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    if(document.getElementById('promo-id')) document.getElementById('promo-id').value = '';
    if(document.getElementById('promo-banner')) document.getElementById('promo-banner').value = '';
    if(document.getElementById('promo-starts')) document.getElementById('promo-starts').value = '';
    if(document.getElementById('promo-limit')) document.getElementById('promo-limit').value = '';
    if(document.getElementById('promo-limit-orange')) document.getElementById('promo-limit-orange').value = '';
    if(document.getElementById('promo-limit-red')) document.getElementById('promo-limit-red').value = '';
    if(document.getElementById('promo-claimed')) document.getElementById('promo-claimed').value = '0';
    
    // Mostra/esconde a seleção de realizador e atualiza o avatar
    const producerContainer = document.getElementById('promo-producer-container');
    const producerAvatar = document.getElementById('promo-producer-avatar');
    
    const updateAvatar = () => {
        if(!producerSelect || !producerAvatar) return;
        const prodId = producerSelect.value;
        const prod = db.producers?.find(p => String(p.id) === String(prodId));
        if (prod) {
            producerAvatar.src = prod.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(prod.name)}&background=cbd5e1&color=475569`;
            producerAvatar.classList.remove('hidden');
        } else {
            producerAvatar.classList.add('hidden');
        }
    };
    
    if(producerSelect) {
        if(producerContainer) producerContainer.classList.remove('hidden'); // Sempre mostra
        
        if (producerId) {
            producerSelect.value = producerId;
            producerSelect.disabled = true; // Impede mudar o realizador se abriu pelo perfil
        } else {
            producerSelect.disabled = false; // Permite escolher se abriu pela tela global
            // O valor será setado abaixo se for edição, ou pega o primeiro da lista
        }
        
        // Listener para atualizar o avatar quando o select mudar
        producerSelect.removeEventListener('change', updateAvatar); // Remove se já tinha
        producerSelect.addEventListener('change', updateAvatar);
    }

    if (promoId) {
        title.textContent = 'Editar Promoção';
        const p = db.promotions.find(pr => String(pr.id) === String(promoId));
        if (p) {
            document.getElementById('promo-id').value = p.id;
            if(producerSelect) {
                producerSelect.value = p.producerId;
                // Se estamos editando algo global, impede a mudança de produtor ou permite? Vamos permitir se não veio producerId via arg
                if (!producerId) producerSelect.disabled = false;
            }
            document.getElementById('promo-title').value = p.title || '';
            document.getElementById('promo-type').value = p.type || 'discount';
            document.getElementById('promo-status').value = p.status || 'active';
            document.getElementById('promo-desc').value = p.desc || '';
            if(document.getElementById('promo-starts')) document.getElementById('promo-starts').value = p.starts || '';
            document.getElementById('promo-expires').value = p.expires || '';
            if(document.getElementById('promo-banner')) document.getElementById('promo-banner').value = p.banner || '';
            if(document.getElementById('promo-limit')) document.getElementById('promo-limit').value = p.limit || '';
            if(document.getElementById('promo-limit-orange')) document.getElementById('promo-limit-orange').value = p.limitOrange || '';
            if(document.getElementById('promo-limit-red')) document.getElementById('promo-limit-red').value = p.limitRed || '';
            if(document.getElementById('promo-claimed')) document.getElementById('promo-claimed').value = p.claimed || '0';
            
            if(producerSelect) updateAvatar(); // Atualiza o avatar após setar o valor
        }
    } else {
        title.textContent = 'Nova Promoção';
        if(document.getElementById('promo-status')) document.getElementById('promo-status').value = 'active';
        if(document.getElementById('promo-type')) document.getElementById('promo-type').value = 'discount';
        if(producerSelect) updateAvatar(); // Atualiza o avatar pro primeiro selecionado
    }

    if(overlay && modal) {
        overlay.classList.remove('hidden');
        void overlay.offsetWidth;
        overlay.classList.add('opacity-100');
        modal.classList.remove('scale-95', 'opacity-0');
        modal.classList.add('scale-100', 'opacity-100');
    }
}

function renderPromotionsList(producerId) {
    const container = document.getElementById('promos-list-container');
    const emptyState = document.getElementById('promos-empty-state');
    const countBadge = document.getElementById('prod-promos-count');
    if(!container || !currentDb) return;

    const promos = currentDb.promotions.filter(p => String(p.producerId) === String(producerId));
    
    if(countBadge) countBadge.textContent = promos.length;

    if (promos.length === 0) {
        container.innerHTML = '';
        if(emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if(emptyState) emptyState.classList.add('hidden');
    container.innerHTML = '';

    const typeConfig = {
        'discount': { icon: 'ph-tag', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' },
        'gift': { icon: 'ph-gift', color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-500/20' },
        'giveaway': { icon: 'ph-ticket', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' },
        'combo': { icon: 'ph-martini', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/20' }
    };

    promos.forEach(promo => {
        const conf = typeConfig[promo.type] || typeConfig['discount'];
        const isExpired = promo.status === 'expired' || (promo.expires && new Date(promo.expires) < new Date());
        
        const card = document.createElement('div');
        card.className = `p-4 sm:p-5 rounded-2xl border bg-white dark:bg-surface-dark shadow-sm relative group transition-all hover:shadow-md cursor-pointer promo-card-clickable ${isExpired ? 'border-red-200 dark:border-red-900/50 opacity-75' : 'border-slate-200 dark:border-slate-800'}`;
        card.dataset.id = promo.id;
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 rounded-xl ${conf.bg} ${conf.color} flex items-center justify-center text-xl shrink-0">
                    <i class="ph-duotone ${conf.icon}"></i>
                </div>
                <div class="flex flex-col items-end gap-1">
                    ${isExpired 
                        ? '<span class="px-2 py-0.5 rounded-md bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 text-[10px] font-bold uppercase tracking-wide">Encerrada</span>' 
                        : '<span class="px-2 py-0.5 rounded-md bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 text-[10px] font-bold uppercase tracking-wide">Ativa</span>'}
                    <button class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors btn-edit-promo" data-id="${promo.id}">
                        <i class="ph-bold ph-pencil-simple pointer-events-none"></i>
                    </button>
                </div>
            </div>
            <h4 class="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">${promo.title}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">${promo.desc || 'Sem regras definidas.'}</p>
            ${promo.expires ? `<div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-medium ${isExpired ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}"><i class="ph-bold ph-clock"></i> Válido até ${new Date(promo.expires).toLocaleDateString('pt-BR')}</div>` : ''}
        `;
        
        container.appendChild(card);
    });

    // Attach listeners
    document.querySelectorAll('.btn-edit-promo').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita abrir detalhes ao editar
            const id = e.currentTarget.dataset.id;
            openPromoModal(currentDb, id, producerId);
        });
    });
    
    document.querySelectorAll('.promo-card-clickable').forEach(card => {
        card.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            openPromoDetails(currentDb, id);
        });
    });
}

// ==========================================
// RENDERIZAÇÃO: PROMOÇÕES GLOBAIS
// ==========================================
function renderGlobalPromotionsTable(db) {
    const grid = document.getElementById('admin-promotions-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    if (!db.promotions || db.promotions.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800">
                <div class="flex flex-col items-center justify-center">
                    <i class="ph-duotone ph-ticket text-5xl mb-3 text-slate-300 dark:text-slate-600"></i>
                    <p class="font-medium text-lg">Nenhuma promoção cadastrada.</p>
                    <p class="text-sm mt-1">As promoções dos realizadores aparecerão aqui.</p>
                </div>
            </div>
        `;
        return;
    }

    const typeConfig = {
        'discount': { icon: 'ph-tag', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20', border: 'border-blue-200 dark:border-blue-900', label: 'Desconto' },
        'gift': { icon: 'ph-gift', color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-500/20', border: 'border-pink-200 dark:border-pink-900', label: 'Brinde' },
        'giveaway': { icon: 'ph-ticket', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20', border: 'border-purple-200 dark:border-purple-900', label: 'Sorteio' },
        'combo': { icon: 'ph-martini', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/20', border: 'border-orange-200 dark:border-orange-900', label: 'Combo' }
    };

    db.promotions.forEach(promo => {
        const prod = db.producers.find(p => String(p.id) === String(promo.producerId));
        const prodName = prod ? prod.name : 'Desconhecido';
        const prodAvatar = prod && prod.avatar ? prod.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(prodName)}&background=cbd5e1&color=475569`;
        
        const conf = typeConfig[promo.type] || typeConfig['discount'];
        let isExpired = promo.status === 'expired' || (promo.expires && new Date(promo.expires) < new Date());

        const card = document.createElement('div');
        card.className = `relative rounded-2xl overflow-hidden shadow-lg h-64 group cursor-pointer border border-transparent hover:border-slate-400 dark:hover:border-slate-500 transition-all promo-card-clickable`;
        card.dataset.id = promo.id;
        
        // Setup Banner or Gradient Background
        const bannerStyle = promo.banner 
            ? `background-image: url('${promo.banner}'); background-size: cover; background-position: center;` 
            : `background: linear-gradient(135deg, var(--tw-gradient-stops));`;
        const bannerClasses = promo.banner ? "" : `${conf.bg.split(' ')[0]} to-slate-200 dark:to-slate-800`;
        let urgencyHtml = '';
        if (!isExpired && promo.expires) {
            const today = new Date();
            today.setHours(0,0,0,0);
            
            // Adjust expires date string to ensure it's treated as local midnight to avoid timezone offset issues
            const [year, month, day] = promo.expires.split('-');
            const expDate = new Date(year, month - 1, day);
            expDate.setHours(0,0,0,0);
            
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                urgencyHtml = '<span class="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wide bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse flex items-center gap-1"><i class="ph-bold ph-fire"></i> Termina Hoje!</span>';
            } else if (diffDays > 0 && diffDays <= 5) {
                urgencyHtml = `<span class="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wide bg-orange-500 text-white shadow-lg shadow-orange-500/40 animate-pulse flex items-center gap-1"><i class="ph-bold ph-timer"></i> Faltam ${diffDays} dias</span>`;
            }
        }
        
        let scarcityHtml = '';
        if (!isExpired && promo.limit) {
            const claimed = promo.claimed || 0;
            const remaining = promo.limit - claimed;
            const limitRed = promo.limitRed || 5; // Default fallback to 5
            const limitOrange = promo.limitOrange || 20; // Default fallback to 20
            
            if (remaining <= 0) {
                urgencyHtml = '<span class="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wide bg-slate-800 text-white shadow-lg shadow-slate-800/40 flex items-center gap-1"><i class="ph-bold ph-x-circle"></i> Esgotado</span>';
                isExpired = true; // Força visual de encerrada se esgotou
            } else if (remaining <= limitRed) {
                scarcityHtml = `<div class="absolute top-10 right-3 z-10"><span class="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wide bg-red-600 text-white shadow-lg shadow-red-600/40 animate-bounce flex items-center gap-1"><i class="ph-bold ph-warning"></i> Restam só ${remaining}!</span></div>`;
            } else if (remaining <= limitOrange) {
                scarcityHtml = `<div class="absolute top-10 right-3 z-10"><span class="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wide bg-orange-500 text-white shadow-lg shadow-orange-500/40 flex items-center gap-1"><i class="ph-bold ph-trend-down"></i> Restam ${remaining}</span></div>`;
            }
        }
        
        card.innerHTML = `
            <!-- Background Layer -->
            <div class="absolute inset-0 ${bannerClasses} transition-transform duration-500 group-hover:scale-105" style="${bannerStyle}"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
            
            ${scarcityHtml}
            
            <!-- Top Elements -->
            <div class="absolute top-3 inset-x-3 flex justify-between items-start z-10">
                <!-- Type Icon -->
                <div class="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-sm shadow-sm">
                    <i class="ph-duotone ${conf.icon}"></i>
                </div>
                
                <!-- Status Badge -->
                <div>
                    ${isExpired 
                        ? '<span class="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wide bg-black/60 backdrop-blur-md text-white/70">Encerrada</span>' 
                        : (urgencyHtml ? urgencyHtml : '<span class="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wide bg-green-500 text-white shadow-lg shadow-green-500/30">Ativa</span>')}
                </div>
            </div>

            <!-- Bottom Content -->
            <div class="absolute inset-x-0 bottom-0 p-4 flex flex-col z-10">
                <span class="text-[9px] font-bold text-${conf.color.split('-')[1]}-300 uppercase tracking-wider mb-1">${conf.label}</span>
                <h3 class="font-bold text-base text-white leading-tight mb-1.5 line-clamp-2" title="${promo.title}">${promo.title}</h3>
                
                ${(promo.starts || promo.expires) ? `
                <div class="text-[9px] text-white/80 mb-3 flex items-center gap-1 font-medium">
                    <i class="ph-bold ph-calendar-blank"></i> 
                    ${promo.starts ? `De ${new Date(promo.starts).toLocaleDateString('pt-BR')} ` : ''}
                    ${promo.expires ? `${promo.starts ? 'até' : 'Até'} ${new Date(promo.expires).toLocaleDateString('pt-BR')}` : ''}
                </div>` : '<div class="mb-3"></div>'}
                
                <div class="flex items-center justify-between pt-3 border-t border-white/20">
                    <div class="flex items-center gap-2 max-w-[70%]">
                        <img src="${prodAvatar}" alt="${prodName}" class="w-6 h-6 rounded-full object-cover border border-white/20 shrink-0">
                        <span class="text-xs font-medium text-white/90 truncate" title="${prodName}">${prodName}</span>
                    </div>
                    <button class="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors btn-edit-global-promo shrink-0" data-id="${promo.id}" data-producer-id="${promo.producerId}" title="Editar">
                        <i class="ph-bold ph-pencil-simple text-sm"></i>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });


    document.querySelectorAll('.btn-edit-global-promo').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita clicar no card e abrir detalhes
            const promoId = e.currentTarget.dataset.id;
            const producerId = e.currentTarget.dataset.producerId;
            openPromoModal(currentDb, promoId, producerId);
        });
    });

    document.querySelectorAll('.promo-card-clickable').forEach(card => {
        card.addEventListener('click', (e) => {
            const promoId = e.currentTarget.dataset.id;
            openPromoDetails(currentDb, promoId);
        });
    });
}

function openPromoDetails(db, promoId) {
    const promo = db.promotions.find(p => String(p.id) === String(promoId));
    if(!promo) return;

    // Configuração do tipo (repetida da renderização por praticidade)
    const typeConfig = {
        discount: { icon: 'ph-tag', label: 'Desconto', color: 'bg-emerald-500' },
        giveaway: { icon: 'ph-gift', label: 'Sorteio', color: 'bg-purple-500' },
        combo: { icon: 'ph-martini', label: 'Combo', color: 'bg-orange-500' },
        vip: { icon: 'ph-star', label: 'VIP', color: 'bg-amber-500' }
    };
    const conf = typeConfig[promo.type] || typeConfig.discount;
    
    // Obter Realizador
    let prodName = 'Realizador Desconhecido';
    let prodAvatar = 'https://ui-avatars.com/api/?name=R&background=cbd5e1&color=475569';
    if(db.producers) {
        const prod = db.producers.find(pr => String(pr.id) === String(promo.producerId));
        if(prod) {
            prodName = prod.name;
            prodAvatar = prod.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(prod.name)}&background=cbd5e1&color=475569`;
        }
    }

    // Preenche a Banner
    const banner = document.getElementById('promo-details-banner');
    if(banner) banner.style.backgroundImage = `url('${promo.banner || ''}')`;
    
    document.getElementById('promo-details-title').textContent = promo.title;
    document.getElementById('promo-details-desc').textContent = promo.desc || 'Nenhuma descrição informada.';
    document.getElementById('promo-details-producer-name').textContent = prodName;
    document.getElementById('promo-details-producer-avatar').src = prodAvatar;
    document.getElementById('promo-details-icon').className = `ph-duotone ${conf.icon}`;
    document.getElementById('promo-details-label').textContent = conf.label;

    const isExpired = (promo.status === 'expired') || (promo.expires && new Date(promo.expires) < new Date());
    document.getElementById('promo-details-status').textContent = isExpired ? 'Encerrada' : 'Ativa';
    document.getElementById('promo-details-status').className = isExpired ? 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-600 text-white ml-2' : 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-green-500 text-white ml-2';

    // Datas
    const dateEl = document.getElementById('promo-details-date');
    if (promo.starts || promo.expires) {
        let text = '';
        if(promo.starts) text += `De ${new Date(promo.starts).toLocaleDateString('pt-BR')} `;
        if(promo.expires) text += `${promo.starts ? 'até' : 'Até'} ${new Date(promo.expires).toLocaleDateString('pt-BR')}`;
        dateEl.innerHTML = `<i class="ph-bold ph-calendar-blank"></i> ${text}`;
        dateEl.classList.remove('hidden');
    } else {
        dateEl.classList.add('hidden');
    }

    // Estatísticas Mockadas e Reais
    const claimed = promo.claimed || 0;
    const remaining = promo.limit ? promo.limit - claimed : '&infin;';
    document.getElementById('promo-details-claimed').textContent = claimed;
    document.getElementById('promo-details-remaining').innerHTML = remaining;

    // Botão Editar
    const editBtn = document.getElementById('promo-details-edit-btn');
    editBtn.onclick = () => openPromoModal(db, promoId, promo.producerId);

    // Ocultar outras views e mostrar essa
    document.querySelectorAll('.admin-view').forEach(v => {
        v.classList.remove('block', 'animate-fade-in-up');
        v.classList.add('hidden');
    });
    
    const detailsView = document.getElementById('view-promo-details');
    detailsView.classList.remove('hidden');
    detailsView.classList.add('block', 'animate-fade-in-up');
}

function closePromoDetails() {
    // Esconder detalhes e mostrar view-promotions
    const detailsView = document.getElementById('view-promo-details');
    detailsView.classList.remove('block', 'animate-fade-in-up');
    detailsView.classList.add('hidden');
    
    const promosView = document.getElementById('view-promotions');
    promosView.classList.remove('hidden');
    promosView.classList.add('block', 'animate-fade-in-up');
}
window.closePromoDetails = closePromoDetails;

// Ensure the render is called after saving a promo globally
const originalSetupPromoModal = setupPromoModal;
setupPromoModal = function() {
    originalSetupPromoModal();
    const form = document.getElementById('promo-form');
    if(form) {
        form.addEventListener('submit', () => {
            setTimeout(() => {
                renderGlobalPromotionsTable(currentDb);
            }, 100);
        });
    }
}

// ==========================================
// HOME LAYOUT MANAGER
// ==========================================
function setupHomeLayout() {
    const modal = document.getElementById('home-section-modal-overlay');
    const content = document.getElementById('home-section-modal');
    const btnNew = document.getElementById('btn-new-home-section');
    const btnClose = document.getElementById('close-home-section-modal-btn');
    const btnCancel = document.getElementById('cancel-home-section-modal-btn');
    const form = document.getElementById('home-section-form');

    const step1 = document.getElementById('hs-step-1');
    const step2 = document.getElementById('hs-step-2');
    const modalFooter = document.getElementById('hs-modal-footer');
    const backBtn = document.getElementById('hs-back-btn');
    const modalTitle = document.getElementById('home-section-modal-title');

    const hsTypeInput = document.getElementById('hs-type');
    const adSettingsContainer = document.getElementById('hs-ad-settings');

    // Setup search & filters
    const searchInput = document.getElementById('hs-search-input');
    const filterPills = document.querySelectorAll('.hs-filter-pill');

    // Setup Stats Toggle
    const btnToggleStats = document.getElementById('btn-toggle-hs-stats');
    const statsWrapper = document.getElementById('hs-stats-wrapper');
    if (btnToggleStats && statsWrapper) {
        let statsVisible = localStorage.getItem('hs-stats-visible') !== 'false';
        
        const updateStatsVisibility = () => {
            if (statsVisible) {
                statsWrapper.classList.remove('max-h-0', 'opacity-0', 'mb-0');
                statsWrapper.classList.add('max-h-[500px]', 'opacity-100');
                btnToggleStats.classList.add('text-primary-500', 'bg-primary-50', 'dark:bg-primary-900/30');
                btnToggleStats.classList.remove('text-slate-500', 'bg-slate-100', 'dark:bg-slate-800');
            } else {
                statsWrapper.classList.add('max-h-0', 'opacity-0', 'mb-0');
                statsWrapper.classList.remove('max-h-[500px]', 'opacity-100');
                btnToggleStats.classList.remove('text-primary-500', 'bg-primary-50', 'dark:bg-primary-900/30');
                btnToggleStats.classList.add('text-slate-500', 'bg-slate-100', 'dark:bg-slate-800');
            }
        };
        
        updateStatsVisibility();
        
        btnToggleStats.addEventListener('click', () => {
            statsVisible = !statsVisible;
            localStorage.setItem('hs-stats-visible', statsVisible);
            updateStatsVisibility();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => renderHomeLayoutSections(currentDb));
    }

    filterPills.forEach(btn => {
        btn.addEventListener('click', () => {
            filterPills.forEach(b => {
                b.classList.remove('bg-primary-500', 'text-white', 'shadow-md', 'shadow-primary-500/20');
                b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
            });
            btn.classList.add('bg-primary-500', 'text-white', 'shadow-md', 'shadow-primary-500/20');
            btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
            
            renderHomeLayoutSections(currentDb);
        });
    });

    const hasAdCheckbox = document.getElementById('hs-has-ad');

    if(!modal || !btnNew) return;

    function updateFormFieldsForType(type) {
        const titleContainer = document.getElementById('hs-title-container');
        const filterContainer = document.getElementById('hs-filter-container');
        const limitContainer = document.getElementById('hs-limit-container');
        const adContainer = document.getElementById('hs-ad-container');
        const iconContainer = document.getElementById('hs-icon-container');
        const ctaLabelContainer = document.getElementById('hs-cta-label-container');
        const bentoLayoutContainer = document.getElementById('hs-bento-layout-container');

        // Reset visibility
        titleContainer.classList.remove('hidden');
        filterContainer.classList.remove('hidden');
        limitContainer.classList.remove('hidden');
        adContainer.classList.remove('hidden');
        
        iconContainer.classList.remove('hidden');
        ctaLabelContainer.classList.add('hidden');
        bentoLayoutContainer.classList.add('hidden');

        if (type === 'event_featured_single') {
            ctaLabelContainer.classList.remove('hidden');
        }

        if (type === 'event_bento_box') {
            bentoLayoutContainer.classList.remove('hidden');
            limitContainer.classList.add('hidden');
            const bentoWarning = document.getElementById('bento-min-items-warning');
            if (bentoWarning) {
                bentoWarning.classList.remove('hidden');
                bentoWarning.classList.add('flex');
            }
        }

        if (type === 'explore_pills' || type === 'utility_carousel' || type === 'hero_carousel') {
            titleContainer.classList.add('hidden');
            if (type !== 'hero_carousel') {
                limitContainer.classList.add('hidden');
                adContainer.classList.add('hidden');
            }
            // Filter might be kept for explore_pills if we eventually allow filtering pills, but we hide for utility
            if(type === 'utility_carousel') filterContainer.classList.add('hidden');
        }
        
        if (type === 'native_ad') {
            titleContainer.classList.add('hidden');
            filterContainer.classList.add('hidden');
            limitContainer.classList.add('hidden');
            
            hasAdCheckbox.checked = true;
            adSettingsContainer.classList.remove('hidden');
            document.getElementById('hs-ad-index').parentElement.classList.add('hidden'); // Index is not needed for isolated ad
        } else {
            document.getElementById('hs-ad-index').parentElement.classList.remove('hidden');
        }
    }

    // ---- Bento Layout Picker interativo ----
    function initBentoLayoutPicker(selectedValue = '') {
        const options = document.querySelectorAll('#bento-layout-picker .bento-layout-option');
        options.forEach(label => {
            const radio = label.querySelector('input[type="radio"]');
            const thumb = label.querySelector('.bento-layout-thumb');
            const span = label.querySelector('span');
            const val = label.getAttribute('data-value');

            // Set initial selected state
            if (val === selectedValue) {
                radio.checked = true;
                thumb.classList.add('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/40', 'shadow-md', 'shadow-indigo-500/20');
                thumb.classList.remove('border-slate-200', 'dark:border-slate-700');
                span.classList.add('text-indigo-600');
                span.classList.remove('text-slate-500');
            } else {
                radio.checked = false;
                thumb.classList.remove('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/40', 'shadow-md', 'shadow-indigo-500/20');
                thumb.classList.add('border-slate-200', 'dark:border-slate-700');
                span.classList.remove('text-indigo-600');
                span.classList.add('text-slate-500');
            }

            // Click handler
            label.onclick = () => {
                options.forEach(lbl => {
                    const t = lbl.querySelector('.bento-layout-thumb');
                    const s = lbl.querySelector('span');
                    t.classList.remove('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/40', 'shadow-md', 'shadow-indigo-500/20');
                    t.classList.add('border-slate-200', 'dark:border-slate-700');
                    s.classList.remove('text-indigo-600');
                    s.classList.add('text-slate-500');
                });
                thumb.classList.add('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/40', 'shadow-md', 'shadow-indigo-500/20');
                thumb.classList.remove('border-slate-200', 'dark:border-slate-700');
                span.classList.add('text-indigo-600');
                span.classList.remove('text-slate-500');
                radio.checked = true;
            };
        });
    }
    initBentoLayoutPicker('');
    // ---- /Bento Layout Picker ----

    function goToStep2(type) {
        hsTypeInput.value = type;
        updateFormFieldsForType(type);
        
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        modalFooter.classList.remove('hidden');
        modalFooter.classList.add('flex');
        backBtn.classList.remove('hidden');
        modalTitle.textContent = 'Configurar Seção';
    }

    function goToStep1() {
        step1.classList.remove('hidden');
        step2.classList.add('hidden');
        modalFooter.classList.add('hidden');
        modalFooter.classList.remove('flex');
        backBtn.classList.add('hidden');
        modalTitle.textContent = 'Escolha o Bloco';
    }

    // Card click events
    document.querySelectorAll('.hs-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.getAttribute('data-type');
            if(type) goToStep2(type);
        });
    });

    backBtn.addEventListener('click', () => goToStep1());

    function openModal(id = null) {
        form.reset();
        document.getElementById('hs-id').value = id || '';
        
        // Verifica se já existe um Hero
        const hasHero = currentDb.homeSections && currentDb.homeSections.some(s => s.type === 'hero_carousel');
        const heroCard = document.querySelector('.hs-card[data-type="hero_carousel"]');
        if (heroCard) {
            if (!id && hasHero) {
                heroCard.classList.add('opacity-40', 'pointer-events-none', 'grayscale');
                heroCard.setAttribute('title', 'Apenas um Destaque Principal é permitido. Edite o existente na lista.');
            } else {
                heroCard.classList.remove('opacity-40', 'pointer-events-none', 'grayscale');
                heroCard.removeAttribute('title');
            }
        }
        
        if (id && currentDb.homeSections) {
            const section = currentDb.homeSections.find(s => String(s.id) === String(id));
            if (section) {
                document.getElementById('hs-internal-name').value = section.internalName || '';
                document.getElementById('hs-title').value = section.title || '';
                hsTypeInput.value = section.type || 'event_row';
                document.getElementById('hs-filter').value = section.filter || '';
                document.getElementById('hs-limit').value = section.limit || '';
                
                document.getElementById('hs-is-active').checked = section.isActive !== false;
                document.getElementById('hs-start-date').value = section.startDate || '';
                document.getElementById('hs-end-date').value = section.endDate || '';
                
                document.getElementById('hs-icon').value = section.icon || '';
                
                if (section.type === 'event_featured_single') {
                    document.getElementById('hs-cta-label').value = section.ctaLabel || '';
                } else {
                    document.getElementById('hs-cta-label').value = '';
                }

                // Bento Layout
                if (section.type === 'event_bento_box') {
                    initBentoLayoutPicker(section.bentoLayout || '');
                }
                
                const hasAd = !!section.adZone;
                hasAdCheckbox.checked = hasAd;
                if (hasAd) {
                    adSettingsContainer.classList.remove('hidden');
                    document.getElementById('hs-ad-zone').value = section.adZone || 'native_feed';
                    document.getElementById('hs-ad-index').value = section.insertAdAt !== undefined ? section.insertAdAt : '';
                } else {
                    adSettingsContainer.classList.add('hidden');
                    document.getElementById('hs-ad-zone').value = '';
                    document.getElementById('hs-ad-index').value = '';
                }
                
                goToStep2(section.type || 'event_row');
            }
        } else {
            hasAdCheckbox.checked = false;
            adSettingsContainer.classList.add('hidden');
            document.getElementById('hs-ad-zone').value = '';
            document.getElementById('hs-ad-index').value = '';
            document.getElementById('hs-is-active').checked = true;
            document.getElementById('hs-start-date').value = '';
            document.getElementById('hs-end-date').value = '';
            document.getElementById('hs-internal-name').value = '';
            goToStep1();
        }

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95', 'opacity-0');
        }, 10);
    }

    function closeModal() {
        modal.classList.add('opacity-0');
        content.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    btnNew.addEventListener('click', () => openModal());
    btnClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Toggle Ad Settings
    if (hasAdCheckbox) {
        hasAdCheckbox.addEventListener('change', () => {
            if (hasAdCheckbox.checked) {
                adSettingsContainer.classList.remove('hidden');
            } else {
                adSettingsContainer.classList.add('hidden');
            }
        });
    }

    // Save
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('hs-id').value;
        const type = hsTypeInput.value;
        
        const newSection = {
            id: id ? id : 'hs_' + Date.now(),
            type: type,
            order: id ? null : (currentDb.homeSections ? currentDb.homeSections.length + 1 : 1),
            isActive: document.getElementById('hs-is-active').checked
        };
        
        const startDate = document.getElementById('hs-start-date').value;
        if (startDate) newSection.startDate = startDate;
        const endDate = document.getElementById('hs-end-date').value;
        if (endDate) newSection.endDate = endDate;
        
        const internalVal = document.getElementById('hs-internal-name').value.trim();
        if (internalVal) newSection.internalName = internalVal;
        
        // Só pega os valores se eles forem relevantes para o tipo
        if(type !== 'explore_pills' && type !== 'utility_carousel' && type !== 'native_ad' && type !== 'hero_carousel') {
            const titleVal = document.getElementById('hs-title').value.trim();
            if (titleVal) newSection.title = titleVal;
        }

        const iconVal = document.getElementById('hs-icon').value.trim();
        if (iconVal && type !== 'explore_pills' && type !== 'utility_carousel' && type !== 'native_ad' && type !== 'hero_carousel') {
            newSection.icon = iconVal;
        }

        if (type === 'event_featured_single') {
            const ctaVal = document.getElementById('hs-cta-label').value.trim();
            if (ctaVal) newSection.ctaLabel = ctaVal;
        }

        // Bento layout
        if (type === 'event_bento_box') {
            const checkedRadio = document.querySelector('#bento-layout-picker input[name="bento-layout"]:checked');
            const layoutVal = checkedRadio ? checkedRadio.value : '';
            if (layoutVal) newSection.bentoLayout = layoutVal;
            // bentoLayout = '' means random (not stored)
        }
        
        if(type !== 'utility_carousel' && type !== 'native_ad') {
            const filterVal = document.getElementById('hs-filter').value.trim();
            if (filterVal) newSection.filter = filterVal;
        }
        
        if(type !== 'explore_pills' && type !== 'utility_carousel' && type !== 'native_ad') {
            const limitVal = document.getElementById('hs-limit').value;
            if (limitVal) newSection.limit = parseInt(limitVal, 10);
        }
        
        if (hasAdCheckbox.checked && type !== 'explore_pills' && type !== 'utility_carousel') {
            newSection.adZone = document.getElementById('hs-ad-zone').value.trim() || 'native_feed';
            if(type !== 'native_ad') {
                const indexVal = document.getElementById('hs-ad-index').value;
                if (indexVal !== '') {
                    newSection.insertAdAt = parseInt(indexVal, 10);
                } else {
                    newSection.insertAdAt = '';
                }
            }
        }

        let sections = currentDb.homeSections || [];
        if (id) {
            const index = sections.findIndex(s => String(s.id) === String(id));
            if(index > -1) {
                if (newSection.type !== 'hero_carousel') {
                    newSection.order = sections[index].order;
                }
                sections[index] = newSection;
            }
        } else {
            if (newSection.type !== 'hero_carousel') {
                newSection.order = sections.length ? Math.max(...sections.map(s => s.order || 0)) + 1 : 1;
            }
            sections.push(newSection);
        }

        // Força a seção Hero a estar sempre no topo
        sections.forEach(s => {
            if (s.type === 'hero_carousel') s.order = -1;
        });

        sections.sort((a, b) => a.order - b.order);
        
        // Renormaliza a ordem para garantir consistência
        sections.forEach((s, idx) => s.order = idx);

        localStorage.setItem(DB_KEYS.HOME_SECTIONS, JSON.stringify(sections));
        currentDb.homeSections = sections;

        renderHomeLayoutSections(currentDb, newSection.id);
        closeModal();
        
        // Trocar para o filtro 'Todos' para garantir que o item seja visto
        const allFilterBtn = document.querySelector('.hs-filter-pill[data-filter="all"]');
        if (allFilterBtn && !allFilterBtn.classList.contains('bg-primary-500')) {
            allFilterBtn.click();
        }
        
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up';
        toast.textContent = 'Seção salva com sucesso!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    });

    // Expose functions
    window.openHomeSectionModal = openModal;
    window.moveHomeSection = function(id, direction) {
        if(!currentDb.homeSections) return;
        let sections = currentDb.homeSections;
        const index = sections.findIndex(s => String(s.id) === String(id));
        if (index === -1) return;

        const isTargetActive = sections[index].isActive !== false;
        let targetSwapIndex = -1;

        if (direction === 'up') {
            for(let i = index - 1; i >= 0; i--) {
                if ((sections[i].isActive !== false) === isTargetActive) {
                    targetSwapIndex = i;
                    break;
                }
            }
        } else if (direction === 'down') {
            for(let i = index + 1; i < sections.length; i++) {
                if ((sections[i].isActive !== false) === isTargetActive) {
                    targetSwapIndex = i;
                    break;
                }
            }
        }

        if (targetSwapIndex !== -1) {
            let temp = sections[index].order;
            sections[index].order = sections[targetSwapIndex].order;
            sections[targetSwapIndex].order = temp;
            
            sections.sort((a, b) => a.order - b.order);
            localStorage.setItem(DB_KEYS.HOME_SECTIONS, JSON.stringify(sections));
            currentDb.homeSections = sections;
            renderHomeLayoutSections(currentDb, id);
        }
    };
    
    window.deleteHomeSection = function(id) {
        if(confirm("Remover esta seção da Home?")) {
            currentDb.homeSections = currentDb.homeSections.filter(s => String(s.id) !== String(id));
            currentDb.homeSections.forEach((s, idx) => s.order = idx + 1);
            localStorage.setItem(DB_KEYS.HOME_SECTIONS, JSON.stringify(currentDb.homeSections));
            renderHomeLayoutSections(currentDb);
        }
    };
}

function renderHomeLayoutSections(db, highlightId = null) {
    const listContainer = document.getElementById('home-sections-list');
    if (!listContainer) return;
    
    // ---- Auto-archive expired sections ----
    const now = new Date();
    let madeChanges = false;
    if (db.homeSections) {
        db.homeSections.forEach(s => {
            if (s.isActive !== false && s.endDate && new Date(s.endDate) < now) {
                s.isActive = false;
                madeChanges = true;
            }
        });
        if (madeChanges) {
            localStorage.setItem(DB_KEYS.HOME_SECTIONS, JSON.stringify(db.homeSections));
        }
    }
    // ---------------------------------------
    
    // Render Stats
    const statsContainer = document.getElementById('hs-stats-container');
    if (statsContainer && db.homeSections) {
        let total = db.homeSections.length;
        let ativas = 0;
        let inativas = 0;
        let programadas = 0;
        let expirando = 0;
        let monetizadas = 0;

        db.homeSections.forEach(sec => {
            const hasStarted = !sec.startDate || new Date(sec.startDate) <= now;
            const isProgramada = sec.isActive !== false && !hasStarted;
            
            let isExpirando = false;
            if (sec.isActive !== false && hasStarted && sec.endDate) {
                const end = new Date(sec.endDate);
                const diffHours = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
                if (diffHours > 0 && diffHours <= 72) isExpirando = true;
            }

            if (sec.isActive === false) inativas++;
            else if (isProgramada) programadas++;
            else {
                ativas++;
                if (isExpirando) expirando++;
            }
            
            if (sec.adZone || sec.type === 'native_ad') monetizadas++;
        });

        statsContainer.innerHTML = `
            <div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <span class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">Total de Blocos</span>
                <span class="text-2xl font-black text-slate-800 dark:text-slate-200 relative z-10">${total}</span>
            </div>
            <div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <span class="text-green-600 dark:text-green-500 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">Ativas Agora</span>
                <span class="text-2xl font-black text-green-600 dark:text-green-500 relative z-10">${ativas}</span>
                <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl pointer-events-none"></div>
            </div>
            <div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <span class="text-blue-600 dark:text-blue-500 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">Programadas</span>
                <span class="text-2xl font-black text-blue-600 dark:text-blue-500 relative z-10">${programadas}</span>
                <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
            </div>
            <div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <span class="text-amber-600 dark:text-amber-500 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">Monetizadas</span>
                <span class="text-2xl font-black text-amber-600 dark:text-amber-500 relative z-10">${monetizadas}</span>
                <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
            </div>
            <div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <span class="text-orange-500 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">Expirando</span>
                <span class="text-2xl font-black text-orange-500 relative z-10">${expirando}</span>
                <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>
            </div>
            <div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <span class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">Arquivadas</span>
                <span class="text-2xl font-black text-slate-400 dark:text-slate-500 relative z-10">${inativas}</span>
            </div>
        `;
    }
    
    listContainer.innerHTML = '';

    if (!db.homeSections || db.homeSections.length === 0) {
        listContainer.innerHTML = `<p class="text-slate-500 text-center py-6">Nenhuma seção configurada.</p>`;
        return;
    }

    const searchInput = document.getElementById('hs-search-input');
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    const activePill = document.querySelector('.hs-filter-pill.bg-primary-500');
    const filterState = activePill ? activePill.getAttribute('data-filter') : 'all';

    let filteredSections = db.homeSections.filter(sec => {
        if (searchQuery) {
            const title = (sec.title || '').toLowerCase();
            const internalName = (sec.internalName || '').toLowerCase();
            if (!title.includes(searchQuery) && !internalName.includes(searchQuery)) {
                return false;
            }
        }
        
        const hasStarted = !sec.startDate || new Date(sec.startDate) <= now;
        const isProgramada = sec.isActive !== false && !hasStarted;
        
        let isExpirando = false;
        if (sec.isActive !== false && hasStarted && sec.endDate) {
            const end = new Date(sec.endDate);
            const diffHours = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (diffHours > 0 && diffHours <= 72) {
                isExpirando = true;
            }
        }
        
        if (filterState === 'ativa') return sec.isActive !== false && hasStarted;
        if (filterState === 'inativa') return sec.isActive === false;
        if (filterState === 'programada') return isProgramada;
        if (filterState === 'expirando') return isExpirando;
        
        return true;
    });

    if (filteredSections.length === 0) {
        listContainer.innerHTML = `<p class="text-slate-500 text-center py-6">Nenhuma seção encontrada para a busca/filtro atual.</p>`;
        return;
    }

    const typeLabels = {
        'explore_pills': { label: 'Pílulas de Exploração', icon: 'ph-pills' },
        'event_bento_box': { label: 'Grade Bento', icon: 'ph-squares-four' },
        'event_featured_single': { label: 'Destaque Único', icon: 'ph-star' },
        'event_landscape_row': { label: 'Carrossel Largo', icon: 'ph-panorama' },
        'native_ad': { label: 'Anúncio Nativo', icon: 'ph-megaphone' },
        'event_row': { label: 'Carrossel Padrão', icon: 'ph-cards' },
        'utility_carousel': { label: 'Utilitários', icon: 'ph-wrench' },
        'producer_row': { label: 'Realizadores', icon: 'ph-users' },
        'event_list': { label: 'Lista de Eventos', icon: 'ph-list-dashes' },
        'event_grid': { label: 'Grade de Eventos', icon: 'ph-grid-four' }
    };

    const renderItem = (sec, isArchived, listLength, displayIndex) => {
        const tConf = typeLabels[sec.type] || { label: sec.type, icon: 'ph-cards' };
        
        const now = new Date();
        const hasStarted = !sec.startDate || new Date(sec.startDate) <= now;
        const isProgramada = sec.isActive !== false && !hasStarted;
        
        let isExpirando = false;
        if (sec.isActive !== false && hasStarted && sec.endDate) {
            const end = new Date(sec.endDate);
            const diffHours = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (diffHours > 0 && diffHours <= 72) {
                isExpirando = true;
            }
        }

        let statusTag = '';
        if (sec.isActive === false) {
            statusTag = `<span class="text-slate-500 font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[9px] uppercase tracking-wider">Inativo</span>`;
        } else if (isProgramada) {
            statusTag = `<span class="text-blue-500 font-bold px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/30 text-[9px] uppercase tracking-wider">Programada</span>`;
        } else if (isExpirando) {
            statusTag = `<span class="text-orange-500 font-bold px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800/50 bg-orange-50 dark:bg-orange-900/30 text-[9px] uppercase tracking-wider">Expirando</span>`;
        } else {
            statusTag = `<span class="text-green-500 font-bold px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/30 text-[9px] uppercase tracking-wider">Ativa</span>`;
        }
        
        const detailsHtml = `<span class="mx-1.5 opacity-30">•</span> <span class="font-normal flex items-center gap-1.5">${statusTag}</span>`;

        const item = document.createElement('div');
        
        let highlightClass = '';
        if (sec.id === highlightId) {
            highlightClass = 'ring-2 ring-primary-500 scale-[1.02] shadow-xl z-20 transition-all duration-1000';
            setTimeout(() => {
                if(item.parentElement) {
                    item.classList.remove('ring-2', 'ring-primary-500', 'scale-[1.02]', 'shadow-xl', 'z-20');
                }
            }, 800);
        }

        const baseCardClass = isProgramada 
            ? 'bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 opacity-80 hover:opacity-100 shadow-sm' 
            : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm';

        item.className = `home-section-item flex items-center gap-4 p-4 rounded-xl cursor-pointer select-none transition-all duration-300 relative group ${baseCardClass} ${highlightClass} ${sec.type === 'hero_carousel' ? 'hs-no-drag' : ''}`;
        item.setAttribute('data-id', sec.id);
        
        // Disable order moving for archived items entirely by hiding the arrows
        const upVisible = (!isArchived && displayIndex > 0) ? '' : 'invisible';
        const downVisible = (!isArchived && displayIndex < listLength - 1) ? '' : 'invisible';

        const arrowColor = 'text-slate-300 dark:text-slate-600 hover:text-primary-500';
        const iconContainerColor = isProgramada ? 'bg-slate-200/50 dark:bg-slate-800 text-slate-500' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500';
        const titleColor = 'text-slate-800 dark:text-slate-200';
        const descColor = 'text-slate-500 dark:text-slate-400';
        const actionBtnColor = 'text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10';
        const deleteBtnColor = 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10';

        let dragHandleHtml = '';
        if (filterState === 'all' && !searchQuery) {
            if (sec.type === 'hero_carousel') {
                dragHandleHtml = `
                <div class="flex items-center justify-center text-slate-300 dark:text-slate-600 shrink-0 w-8 h-8 -ml-2" title="Fixado no topo" onclick="event.stopPropagation()">
                    <i class="ph-bold ph-lock-key text-lg"></i>
                </div>`;
            } else {
                dragHandleHtml = `
                <div class="hs-drag-handle flex items-center justify-center cursor-move text-slate-300 hover:text-slate-500 transition-colors shrink-0 w-8 h-8 -ml-2" title="Arraste para reordenar" onclick="event.stopPropagation()">
                    <i class="ph-bold ph-dots-six-vertical text-xl"></i>
                </div>`;
            }
        }

        item.innerHTML = `
            ${dragHandleHtml}
            
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${iconContainerColor} ${isArchived ? 'opacity-50' : ''}">
                <i class="ph-duotone ${tConf.icon}"></i>
            </div>
            
            <div class="flex-1 min-w-0 pointer-events-none ${isArchived ? 'opacity-50' : ''}">
                <h4 class="font-bold text-sm truncate ${titleColor}">${sec.internalName || sec.title || '<span class="italic font-normal opacity-50">Sem título visível</span>'}</h4>
                <div class="flex items-center text-[11px] mt-0.5 ${descColor}">
                    <span class="truncate">${tConf.label}</span>
                    ${detailsHtml}
                </div>
            </div>
            
            <div class="action-buttons hidden items-center gap-1 shrink-0 animate-fade-in-up" onclick="event.stopPropagation()">
                <button onclick="openHomeSectionModal('${sec.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${actionBtnColor}" title="Editar">
                    <i class="ph-bold ph-pencil-simple"></i>
                </button>
                <button onclick="deleteHomeSection('${sec.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${deleteBtnColor}" title="Excluir">
                    <i class="ph-bold ph-trash"></i>
                </button>
            </div>
        `;
        
        item.addEventListener('click', () => {
            document.querySelectorAll('.home-section-item').forEach(el => {
                if (el !== item) {
                    const btnActions = el.querySelector('.action-buttons');
                    if(btnActions) {
                        btnActions.classList.add('hidden');
                        btnActions.classList.remove('flex');
                    }
                    el.classList.remove('active');
                }
            });
            
            const actions = item.querySelector('.action-buttons');
            if (actions.classList.contains('hidden')) {
                actions.classList.remove('hidden');
                actions.classList.add('flex');
                item.classList.add('active');
            } else {
                actions.classList.add('hidden');
                actions.classList.remove('flex');
                item.classList.remove('active');
            }
        });

        return item;
    };

    filteredSections.forEach((sec, idx) => {
        const isArchived = sec.isActive === false;
        listContainer.appendChild(renderItem(sec, isArchived, filteredSections.length, idx));
    });

    if (filterState === 'all' && !searchQuery) {
        if (window.hsSortable) window.hsSortable.destroy();
        window.hsSortable = new Sortable(listContainer, {
            animation: 150,
            handle: '.hs-drag-handle',
            filter: '.hs-no-drag',
            preventOnFilter: false, // Let clicks go through
            ghostClass: 'opacity-30',
            onChoose: function (evt) {
                evt.item.classList.add('ring-2', 'ring-primary-500', 'shadow-2xl', 'scale-[1.02]', 'z-50');
                evt.item.classList.remove('opacity-80'); // In case it's scheduled
            },
            onUnchoose: function (evt) {
                evt.item.classList.remove('ring-2', 'ring-primary-500', 'shadow-2xl', 'scale-[1.02]', 'z-50');
            },
            onEnd: function (evt) {
                if (evt.oldIndex === evt.newIndex) return;

                // Move element in array
                const movedItem = filteredSections.splice(evt.oldIndex, 1)[0];
                filteredSections.splice(evt.newIndex, 0, movedItem);
                
                // Atualiza a propriedade order para refletir o novo arranjo que o usuário fez
                filteredSections.forEach((s, i) => s.order = i);
                
                // Força o hero a ficar em -1 
                filteredSections.forEach(s => {
                    if (s.type === 'hero_carousel') s.order = -1;
                });
                
                // Re-ordena o array para que o hero pule para o topo (caso tenha se movido acidentalmente)
                filteredSections.sort((a, b) => (a.order || 0) - (b.order || 0));
                
                // Renormaliza e atualiza order finais
                filteredSections.forEach((s, i) => s.order = i);
                
                // Save and re-render
                db.homeSections = [...filteredSections];
                localStorage.setItem(DB_KEYS.HOME_SECTIONS, JSON.stringify(db.homeSections));
                renderHomeLayoutSections(db);
            }
        });
    } else {
        if (window.hsSortable) {
            window.hsSortable.destroy();
            window.hsSortable = null;
        }
    }
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();
    setupMobileSidebar();
    setupThemeToggle();
    setupModal();
    setupProducerModal();
    setupAdModal();
    setupAdvertiserModal();
    setupAdvertiserTabs();
    setupProducerTabs();
    setupPromoModal();

    setupHomeLayout();

    // Carrega dados e renderiza
    currentDb = {
        events: JSON.parse(localStorage.getItem(DB_KEYS.EVENTS) || '[]'),
        producers: JSON.parse(localStorage.getItem(DB_KEYS.PRODUCERS) || '[]'),
        ads: JSON.parse(localStorage.getItem(DB_KEYS.ADS) || '[]'),
        advertisers: JSON.parse(localStorage.getItem(DB_KEYS.ADVERTISERS) || '[]'),
        promotions: JSON.parse(localStorage.getItem(DB_KEYS.PROMOTIONS) || '[]'),
        homeSections: JSON.parse(localStorage.getItem(DB_KEYS.HOME_SECTIONS) || '[]')
    };

    renderDashboardStats(currentDb);
    renderEventsTable(currentDb);
    renderProducersTable(currentDb);
    renderAdsGrid(currentDb);
    renderAdvertisersTable(currentDb);
    renderGlobalPromotionsTable(currentDb);
    renderHomeLayoutSections(currentDb);
});

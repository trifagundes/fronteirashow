/**
 * API Module
 * Responsável por buscar os dados da aplicação usando o LocalStorage como Banco de Dados
 */

// Chaves unificadas para Front e Admin
export const DB_KEYS = {
    EVENTS: '@EventApp:events',
    PRODUCERS: '@EventApp:producers',
    HOME_SECTIONS: '@EventApp:home_sections',
    ADS: '@EventApp:ads',
    PROMOTIONS: '@EventApp:promotions',
    ADVERTISERS: '@EventApp:advertisers',
    SETTINGS: '@EventApp:settings',
    CATEGORIES: '@EventApp:categories'
};

/**
 * Verifica se o banco já foi populado. Se não, busca do mock_db (Seed)
 */
export const initDB = async () => {
    if (!localStorage.getItem(DB_KEYS.EVENTS)) {
        console.log("Inicializando Mock DB...");
        try {
            const [events, producers, homeSections, ads, promos, advs, settings, categories] = await Promise.all([
                fetch('../mock_db/events.json').then(r => r.json()),
                fetch('../mock_db/producers.json').then(r => r.json()),
                fetch('../mock_db/homeSections.json').then(r => r.json()),
                fetch('../mock_db/ads.json').then(r => r.json()),
                fetch('../mock_db/promotions.json').then(r => r.json()),
                fetch('../mock_db/advertisers.json').then(r => r.json()),
                fetch('../mock_db/settings.json').then(r => r.json()),
                fetch('../mock_db/categories.json').then(r => r.json())
            ]);

            localStorage.setItem(DB_KEYS.EVENTS, JSON.stringify(events));
            localStorage.setItem(DB_KEYS.PRODUCERS, JSON.stringify(producers));
            localStorage.setItem(DB_KEYS.HOME_SECTIONS, JSON.stringify(homeSections));
            localStorage.setItem(DB_KEYS.ADS, JSON.stringify(ads));
            localStorage.setItem(DB_KEYS.PROMOTIONS, JSON.stringify(promos));
            localStorage.setItem(DB_KEYS.ADVERTISERS, JSON.stringify(advs));
            localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
            localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(categories));
            
            console.log("Mock DB populado com sucesso!");
        } catch (error) {
            console.error("Erro ao popular Mock DB:", error);
        }
    }
};

export const fetchEvents = async () => {
    await initDB();
    const eventsStr = localStorage.getItem(DB_KEYS.EVENTS);
    return eventsStr ? JSON.parse(eventsStr) : [];
};

export const fetchAppData = async () => {
    await initDB();
    // Return dummy empty object just in case it's used inside old code, but admin.js won't need it much
    return {};
};

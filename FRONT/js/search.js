import { createExploreGrid } from './components.js';
import { initThemeToggle } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();

    // Mock das 50 categorias (renderizando um pedaço)
    const allCategories = [
        { name: 'Música Sertaneja', emoji: '🤠', color: '#f59e0b' },
        { name: 'Rock n\' Roll', emoji: '🎸', color: '#10b981' },
        { name: 'Balada Eletrônica', emoji: '🎧', color: '#3b82f6' },
        { name: 'Cinema & Artes', emoji: '🍿', color: '#eab308' },
        { name: 'Gastronomia', emoji: '🍔', color: '#ef4444' },
        { name: 'Vinhos & Queijos', emoji: '🍷', color: '#8b5cf6' },
        { name: 'Teatro', emoji: '🎭', color: '#ec4899' },
        { name: 'Ciclismo', emoji: '🚴', color: '#06b6d4' },
        { name: 'Ação Social', emoji: '🤝', color: '#14b8a6' },
        { name: 'Stand-up Comedy', emoji: '😂', color: '#f97316' },
        { name: 'Retrô Anos 80', emoji: '🪩', color: '#d946ef' },
        { name: 'Esportes Radicais', emoji: '🏂', color: '#3f62e2' },
        { name: 'Cultura Local', emoji: '🏛️', color: '#64748b' },
        { name: 'Festivais', emoji: '🎪', color: '#f43f5e' }
    ];

    const container = document.getElementById('explore-grid-container');
    if (container) {
        container.innerHTML = createExploreGrid(allCategories);
    }
});

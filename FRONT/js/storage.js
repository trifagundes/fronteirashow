/**
 * Storage Module
 * Responsável por gerenciar dados locais (localStorage) até termos um backend real.
 */

const FAVORITES_KEY = '@EventApp:favorites';

export const getFavorites = () => {
    try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Erro ao ler favoritos do localStorage', e);
        return [];
    }
};

export const toggleFavorite = (eventId) => {
    const favorites = getFavorites();
    const index = favorites.indexOf(eventId);
    
    let isAdded = false;
    if (index === -1) {
        favorites.push(eventId);
        isAdded = true;
    } else {
        favorites.splice(index, 1);
        isAdded = false;
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return isAdded;
};

export const isFavorite = (eventId) => {
    return getFavorites().includes(eventId);
};

// ==========================================
// SEGUIR PRODUTORES (FOLLOWING)
// ==========================================
const FOLLOWING_KEY = '@EventApp:following';

export const getFollowingProducers = () => {
    try {
        const stored = localStorage.getItem(FOLLOWING_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
};

export const toggleFollowProducer = (producerId) => {
    const following = getFollowingProducers();
    const index = following.indexOf(producerId);
    
    let isFollowing = false;
    if (index === -1) {
        following.push(producerId);
        isFollowing = true;
    } else {
        following.splice(index, 1);
        isFollowing = false;
    }
    
    localStorage.setItem(FOLLOWING_KEY, JSON.stringify(following));
    return isFollowing;
};

export const isFollowingProducer = (producerId) => {
    return getFollowingProducers().includes(producerId);
};

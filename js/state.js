import { storage } from './storage.js';

const state = {
    favorites: storage.get('fincalc_favorites', []),
    history: storage.get('fincalc_history', []),
    settings: storage.get('fincalc_settings', { animations: true })
};

export function getFavorites() { return state.favorites; }
export function toggleFavorite(calcId) {
    if (state.favorites.includes(calcId)) {
        state.favorites = state.favorites.filter(id => id !== calcId);
    } else {
        state.favorites.push(calcId);
    }
    storage.set('fincalc_favorites', state.favorites);
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
    return state.favorites;
}

export function getHistory(calcId) { return storage.get(`fincalc_history_${calcId}`, []); }
export function addHistory(calcId, calcName, inputs, result) {
    const hist = getHistory(calcId);
    hist.unshift({
        id: Date.now(),
        calcId,
        calcName,
        inputs,
        result,
        timestamp: new Date().toISOString()
    });
    // Limite de 10 itens
    if (hist.length > 10) hist.pop();
    storage.set(`fincalc_history_${calcId}`, hist);
    window.dispatchEvent(new CustomEvent(`historyChanged_${calcId}`));
}
export function clearHistory(calcId) {
    storage.set(`fincalc_history_${calcId}`, []);
    window.dispatchEvent(new CustomEvent(`historyChanged_${calcId}`));
}

export function getSettings() { return state.settings; }
export function saveSettings(newSettings) {
    state.settings = { ...state.settings, ...newSettings };
    storage.set('fincalc_settings', state.settings);
    window.dispatchEvent(new CustomEvent('settingsChanged'));
}

export function getOrder(defaultOrder) {
    const saved = storage.get('fincalc_order', null);
    if (!saved || saved.length !== defaultOrder.length) return defaultOrder;
    const valid = defaultOrder.every(k => saved.includes(k)) && saved.every(k => defaultOrder.includes(k));
    return valid ? saved : defaultOrder;
}

export function saveOrder(orderArr) {
    storage.set('fincalc_order', orderArr);
    window.dispatchEvent(new CustomEvent('orderChanged', { detail: orderArr }));
}

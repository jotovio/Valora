export const currencyLocaleMap = {
    USD: { locale: 'en-US', name: '🇺🇸 Dólar', symbol: '$' },
    EUR: { locale: 'de-DE', name: '🇪🇺 Euro', symbol: '€' },
    BRL: { locale: 'pt-BR', name: '🇧🇷 Real', symbol: 'R$' },
    GBP: { locale: 'en-GB', name: '🇬🇧 Libra', symbol: '£' },
    JPY: { locale: 'ja-JP', name: '🇯🇵 Iene', symbol: '¥' },
    CNY: { locale: 'zh-CN', name: '🇨🇳 Yuan', symbol: '¥' },
    INR: { locale: 'hi-IN', name: '🇮🇳 Rúpia', symbol: '₹' },
    CAD: { locale: 'en-CA', name: '🇨🇦 Dólar', symbol: 'C$' },
    AUD: { locale: 'en-AU', name: '🇦🇺 Dólar', symbol: 'A$' },
    CHF: { locale: 'de-CH', name: '🇨🇭 Franco', symbol: 'CHF' }
};

export function getCurrencyCode() {
    return localStorage.getItem('app_currency') || 'BRL';
}

export function setCurrencyCode(code) {
    if(currencyLocaleMap[code]) {
        localStorage.setItem('app_currency', code);
        window.dispatchEvent(new CustomEvent('currencyChange', { detail: code }));
    }
}

export function getCurrencySymbol() {
    const code = getCurrencyCode();
    return currencyLocaleMap[code] ? currencyLocaleMap[code].symbol : 'R$';
}

export function formatCurrency(value) {
    const code = getCurrencyCode();
    const locale = currencyLocaleMap[code] ? currencyLocaleMap[code].locale : 'pt-BR';
    
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code
    }).format(value);
}

// Utilidades de moneda — funciones puras, sin estado global. A diferencia de
// la versión vanilla (que leía `S.currency` directo), acá cada función
// recibe la moneda como parámetro explícito.

export const CURRENCIES = {
  CLP: { locale: 'es-CL', currency: 'CLP', decimals: 0 },
  USD: { locale: 'en-US', currency: 'USD', decimals: 2 },
  ARS: { locale: 'es-AR', currency: 'ARS', decimals: 0 },
  EUR: { locale: 'de-DE', currency: 'EUR', decimals: 2 }
};

export function detectCurrency() {
  const lang = (navigator.language || 'es-CL').toLowerCase();
  if (lang.startsWith('es-ar')) return 'ARS';
  if (lang.startsWith('en')) return 'USD';
  if (lang.startsWith('de') || lang.startsWith('fr') || lang.startsWith('it')) return 'EUR';
  return 'CLP';
}

export function currencySeparators(locale) {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
  return {
    group: (parts.find(p => p.type === 'group') || {}).value || ',',
    decimal: (parts.find(p => p.type === 'decimal') || {}).value || '.'
  };
}

export function fmt(n, currency) {
  const cfg = CURRENCIES[currency] || CURRENCIES.CLP;
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency', currency: cfg.currency,
      minimumFractionDigits: cfg.decimals, maximumFractionDigits: cfg.decimals
    }).format(n || 0);
  } catch {
    return '$' + Math.round(n || 0).toLocaleString('es-CL');
  }
}

export function parseAmount(str, currency) {
  if (str == null) return 0;
  let s = String(str).trim();
  if (!s) return 0;
  const cfg = CURRENCIES[currency] || CURRENCIES.CLP;
  const { group, decimal } = currencySeparators(cfg.locale);
  s = s.split(group).join('');
  if (decimal !== '.') s = s.split(decimal).join('.');
  s = s.replace(/[^\d.-]/g, '');
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

export function formatAmountInput(n, currency) {
  const num = typeof n === 'number' ? n : parseAmount(n, currency);
  if (!num && num !== 0) return '';
  const cfg = CURRENCIES[currency] || CURRENCIES.CLP;
  try {
    return new Intl.NumberFormat(cfg.locale, {
      minimumFractionDigits: cfg.decimals, maximumFractionDigits: cfg.decimals
    }).format(num);
  } catch {
    return String(num);
  }
}

export function reformatAmountValue(value, currency) {
  if (!value || !String(value).trim()) return value;
  return formatAmountInput(parseAmount(value, currency), currency);
}

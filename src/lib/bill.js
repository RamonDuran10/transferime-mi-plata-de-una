import { parseAmount } from './currency';
import { T } from '../i18n/es';

export function hasAnyAmount(state) {
  if (state.total && String(state.total).trim()) return true;
  if (state.shared.some(i => i.price && String(i.price).trim())) return true;
  if (state.personas.some(p => p.items.some(i => i.price && String(i.price).trim()))) return true;
  return false;
}

export function sharedTotalConPct(state) {
  const base = state.shared.reduce((s, i) => s + (parseAmount(i.price, state.currency) || 0), 0);
  const pct = parseFloat(state.pct) || 0;
  return base * (1 + pct / 100);
}

export function personaConPct(persona, state) {
  const base = persona.items.reduce((s, i) => s + (parseAmount(i.price, state.currency) || 0), 0);
  const pct = parseFloat(state.pct) || 0;
  return base * (1 + pct / 100);
}

export function computeResults(state, total, sharedPP) {
  if (state.personas.length === 0) return [];
  return state.personas.map((p, i) => ({
    id: p.id,
    name: p.name || T.persona.defaultNames[i % T.persona.defaultNames.length],
    amount: personaConPct(p, state) + sharedPP
  }));
}

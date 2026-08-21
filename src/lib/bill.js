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

// quién pide este ítem — vacío (nunca tocado) significa "todos los que hay ahora".
// Recibe la lista de ids (no los objetos persona completos): así el llamador
// puede memoizarla y no romper el aislamiento de re-render entre tarjetas
// cuando lo único que cambió fue lo que otra persona está tipeando.
export function sharedItemParticipants(item, personaIds) {
  if (item.participantIds && item.participantIds.length > 0) {
    const validIds = new Set(personaIds);
    return item.participantIds.filter(id => validIds.has(id));
  }
  return personaIds;
}

// cuánto le toca a cada persona de lo compartido — ya no es un solo número
// parejo para todos, cada ítem se reparte solo entre quienes lo pidieron
export function sharedContributionsByPersona(state) {
  const pct = parseFloat(state.pct) || 0;
  const personaIds = state.personas.map(p => p.id);
  const contributions = {};
  state.shared.forEach(item => {
    const price = parseAmount(item.price, state.currency) || 0;
    if (price <= 0) return;
    const participants = sharedItemParticipants(item, personaIds);
    if (participants.length === 0) return;
    const perPerson = (price * (1 + pct / 100)) / participants.length;
    participants.forEach(id => { contributions[id] = (contributions[id] || 0) + perPerson; });
  });
  return contributions;
}

export function personaConPct(persona, state) {
  const base = persona.items.reduce((s, i) => s + (parseAmount(i.price, state.currency) || 0), 0);
  const pct = parseFloat(state.pct) || 0;
  return base * (1 + pct / 100);
}

export function computeResults(state) {
  if (state.personas.length === 0) return [];
  const contributions = sharedContributionsByPersona(state);
  return state.personas.map((p, i) => ({
    id: p.id,
    name: p.name || T.persona.defaultNames[i % T.persona.defaultNames.length],
    amount: personaConPct(p, state) + (contributions[p.id] || 0)
  }));
}

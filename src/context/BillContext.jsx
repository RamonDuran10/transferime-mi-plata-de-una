import { createContext, useContext, useEffect, useReducer } from 'react';
import { uid } from '../lib/id';

export const LS_KEY = 'dcv4';
export const SESSION_LS_KEY = 'dcv4_session';

const initialState = {
  mode: 'solo', // 'solo' | 'host' | 'guest'
  liveSession: null, // { sessionId, role, myPersonaIds: [] }
  total: '',
  pct: '',
  currency: '',
  created: false,
  paidPersonaId: null, // quién pagó — es "meta" (como total/pct/currency): lo fija una sola
                        // vez quien crea la cuenta, así no hay que sincronizar el flag por
                        // persona (que rompería con el modelo de "cada quien es dueño de la suya")
  shared: [], // [{id, name, price, participantIds}] — participantIds vacío = todos
  personas: [] // [{id, name, emoji, items:[{id,name,price}]}]
};

function normalizeShared(list) {
  return (list || []).map(i => ({
    id: i.id, name: i.name || '', price: i.price || '',
    participantIds: Array.isArray(i.participantIds) ? i.participantIds : []
  }));
}

function normalizePersonas(list) {
  return (list || []).map(p => ({
    id: p.id, name: p.name || '', emoji: p.emoji || '',
    items: (p.items || []).map(i => ({ id: i.id, name: i.name || '', price: i.price || '' }))
  }));
}

function shallowItemsEqual(a, b) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((it, i) => it.id === b[i].id && it.name === b[i].name && it.price === b[i].price);
}

function arraysEqualUnordered(a, b) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every(v => setB.has(v));
}

function shallowSharedEqual(a, b) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((it, i) =>
    it.id === b[i].id && it.name === b[i].name && it.price === b[i].price &&
    arraysEqualUnordered(it.participantIds, b[i].participantIds));
}

function shallowPersonaEqual(a, b) {
  if (a === b) return true;
  return a.name === b.name && a.emoji === b.emoji && shallowItemsEqual(a.items, b.items);
}

function billReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      // arranque: carga lo que había en localStorage (si había), tal cual
      return { ...state, ...action.payload };
    }

    case 'SET_MODE_AND_SESSION': {
      // usado por goLive / bootstrapGuestFromHash / resume / clearSession
      const next = { ...state, mode: action.mode, liveSession: action.liveSession };
      if (action.bill) Object.assign(next, action.bill);
      return next;
    }

    case 'CREATE_ACCOUNT':
      return { ...state, created: true };

    case 'RESET_ALL':
      return {
        ...state,
        total: '', pct: '', currency: state.currency,
        created: false, paidPersonaId: null, shared: [], personas: []
      };

    case 'SET_CURRENCY_DETECTED':
      return state.currency ? state : { ...state, currency: action.currency };

    case 'SET_TOTAL':
      return { ...state, total: action.value };

    case 'SET_PCT':
      return { ...state, pct: action.value };

    case 'SET_CURRENCY':
      // limpia todos los montos — no se puede convertir "de mentira" entre monedas
      return {
        ...state,
        currency: action.currency,
        total: '',
        shared: state.shared.map(i => ({ ...i, price: '' })),
        personas: state.personas.map(p => ({ ...p, items: p.items.map(i => ({ ...i, price: '' })) }))
      };

    case 'ADD_SHARED_ITEM':
      // foto de quién ya está sumado en este momento — quien se sume después
      // no entra solo, hay que agregarlo a mano con los chips
      return {
        ...state,
        shared: [...state.shared, { id: uid(), name: '', price: '', participantIds: state.personas.map(p => p.id) }]
      };

    case 'DUP_SHARED_ITEM': {
      const idx = state.shared.findIndex(i => i.id === action.id);
      if (idx === -1) return state;
      const copy = { ...state.shared[idx], id: uid() };
      const shared = [...state.shared];
      shared.splice(idx + 1, 0, copy);
      return { ...state, shared };
    }

    case 'REMOVE_SHARED_ITEM':
      return { ...state, shared: state.shared.filter(i => i.id !== action.id) };

    case 'UPDATE_SHARED_ITEM':
      return {
        ...state,
        shared: state.shared.map(i => i.id === action.id ? { ...i, [action.field]: action.value } : i)
      };

    case 'TOGGLE_SHARED_PARTICIPANT': {
      return {
        ...state,
        shared: state.shared.map(i => {
          if (i.id !== action.itemId) return i;
          const participantIds = i.participantIds.includes(action.personaId)
            ? i.participantIds.filter(id => id !== action.personaId)
            : [...i.participantIds, action.personaId];
          return { ...i, participantIds };
        })
      };
    }

    case 'CHANGE_PERSONA_EMOJI':
      return { ...state, personas: state.personas.map(p => p.id === action.id ? { ...p, emoji: action.emoji } : p) };

    case 'REMOVE_PERSONA': {
      const personas = state.personas.filter(p => p.id !== action.id);
      const paidPersonaId = state.paidPersonaId === action.id ? null : state.paidPersonaId;
      if (!state.liveSession) return { ...state, personas, paidPersonaId };
      return {
        ...state, personas, paidPersonaId,
        liveSession: { ...state.liveSession, myPersonaIds: state.liveSession.myPersonaIds.filter(pid => pid !== action.id) }
      };
    }

    case 'UPDATE_PERSONA_NAME':
      return { ...state, personas: state.personas.map(p => p.id === action.id ? { ...p, name: action.value } : p) };

    case 'SET_PAGADOR':
      return { ...state, paidPersonaId: state.paidPersonaId === action.id ? null : action.id };

    case 'ADD_ITEM':
      return {
        ...state,
        personas: state.personas.map(p => p.id === action.personaId
          ? { ...p, items: [...p.items, { id: uid(), name: '', price: '' }] }
          : p)
      };

    case 'DUP_ITEM':
      return {
        ...state,
        personas: state.personas.map(p => {
          if (p.id !== action.personaId) return p;
          const idx = p.items.findIndex(i => i.id === action.itemId);
          if (idx === -1) return p;
          const items = [...p.items];
          items.splice(idx + 1, 0, { ...items[idx], id: uid() });
          return { ...p, items };
        })
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        personas: state.personas.map(p => p.id === action.personaId
          ? { ...p, items: p.items.filter(i => i.id !== action.itemId) }
          : p)
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        personas: state.personas.map(p => p.id === action.personaId
          ? { ...p, items: p.items.map(i => i.id === action.itemId ? { ...i, [action.field]: action.value } : i) }
          : p)
      };

    case 'ADD_PERSONA_DRAFT': {
      // cada participante (invitado u host) se suma una sola vez por dispositivo,
      // y queda 100% local hasta que toque "Guardar" — recién ahí se avisa al servidor
      if (!state.liveSession || state.liveSession.joined) return state;
      const draftId = -(Date.now() + Math.random());
      return {
        ...state,
        personas: [...state.personas, { id: draftId, name: '', emoji: action.emoji, items: [{ id: uid(), name: '', price: '' }] }],
        liveSession: { ...state.liveSession, myPersonaIds: [...state.liveSession.myPersonaIds, draftId], joined: true }
      };
    }

    case 'PROMOTE_DRAFT': {
      const { draftId, realId } = action;
      return {
        ...state,
        personas: state.personas.map(p => p.id === draftId ? { ...p, id: realId } : p),
        liveSession: {
          ...state.liveSession,
          myPersonaIds: state.liveSession.myPersonaIds.map(pid => pid === draftId ? realId : pid)
        }
      };
    }

    case 'MERGE_REMOTE': {
      const remote = action.remote;
      const myIds = new Set(state.liveSession ? state.liveSession.myPersonaIds : []);
      const iOwnMeta = state.mode === 'host';

      const remotePersonas = normalizePersonas(remote.personas);
      const byId = new Map(state.personas.map(p => [p.id, p]));

      const newPersonas = remotePersonas.map(rp => {
        if (myIds.has(rp.id)) return byId.get(rp.id) ?? rp; // la mía, nunca se toca
        const local = byId.get(rp.id);
        if (local && shallowPersonaEqual(local, rp)) return local; // sin cambios -> misma referencia
        return rp;
      });

      // borrador de invitado (id negativo) que el servidor todavía no conoce
      const remoteIds = new Set(remotePersonas.map(p => p.id));
      state.personas
        .filter(p => myIds.has(p.id) && !remoteIds.has(p.id))
        .forEach(draft => newPersonas.push(draft));

      const newShared = iOwnMeta ? state.shared : normalizeShared(remote.shared);
      const newTotal = iOwnMeta ? state.total : (remote.total || '');
      const newPct = iOwnMeta ? state.pct : (remote.pct || '');
      const newCurrency = iOwnMeta ? state.currency : (remote.currency || '');
      const newPaidPersonaId = iOwnMeta ? state.paidPersonaId : (remote.paidPersonaId ?? null);

      const personasChanged =
        newPersonas.length !== state.personas.length ||
        newPersonas.some((p, i) => p !== state.personas[i]);
      const sharedChanged = newShared !== state.shared &&
        (newShared.length !== state.shared.length || !shallowSharedEqual(newShared, state.shared));

      if (!personasChanged && !sharedChanged &&
          newTotal === state.total && newPct === state.pct && newCurrency === state.currency &&
          newPaidPersonaId === state.paidPersonaId) {
        return state; // nada relevante cambió -> misma referencia, cero re-render
      }

      return {
        ...state,
        created: true,
        total: newTotal, pct: newPct, currency: newCurrency, paidPersonaId: newPaidPersonaId,
        shared: sharedChanged ? newShared : state.shared,
        personas: newPersonas
      };
    }

    default:
      return state;
  }
}

const BillStateContext = createContext(null);
const BillDispatchContext = createContext(null);

export function BillProvider({ children }) {
  const [state, dispatch] = useReducer(billReducer, initialState);

  // Persistencia — misma clave/forma que la versión vanilla (dcv4). MODE y
  // liveSession se guardan aparte (dcv4_session), no acá.
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        total: state.total, pct: state.pct, currency: state.currency, created: state.created,
        paidPersonaId: state.paidPersonaId,
        shared: state.shared, personas: state.personas
      }));
    } catch { /* localStorage no disponible */ }
  }, [state.total, state.pct, state.currency, state.created, state.paidPersonaId, state.shared, state.personas]);

  useEffect(() => {
    try {
      if (state.liveSession) localStorage.setItem(SESSION_LS_KEY, JSON.stringify(state.liveSession));
      else localStorage.removeItem(SESSION_LS_KEY);
    } catch { /* localStorage no disponible */ }
  }, [state.liveSession]);

  return (
    <BillStateContext.Provider value={state}>
      <BillDispatchContext.Provider value={dispatch}>
        {children}
      </BillDispatchContext.Provider>
    </BillStateContext.Provider>
  );
}

export function useBillState() {
  const ctx = useContext(BillStateContext);
  if (!ctx) throw new Error('useBillState must be used within BillProvider');
  return ctx;
}

export function useBillDispatch() {
  const ctx = useContext(BillDispatchContext);
  if (!ctx) throw new Error('useBillDispatch must be used within BillProvider');
  return ctx;
}

export function loadBillFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.personas)) return null;
    if (typeof parsed.created !== 'boolean') parsed.created = parsed.personas.length > 0;
    return parsed;
  } catch {
    return null;
  }
}

export function loadSessionFromStorage() {
  try {
    const raw = localStorage.getItem(SESSION_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.sessionId) return parsed;
    return null;
  } catch {
    return null;
  }
}

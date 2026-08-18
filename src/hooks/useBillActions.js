import { useCallback, useMemo } from 'react';
import { useBillState, useBillDispatch } from '../context/BillContext';
import { useDialog } from '../context/DialogContext';
import { useToast } from '../context/ToastContext';
import { useLiveSyncContext } from '../context/LiveSyncContext';
import { apiCall } from '../lib/api';
import { randomAnimal } from '../lib/persona';
import { hasAnyAmount } from '../lib/bill';
import { T } from '../i18n/es';

export function focusPersonaNameInput(id) {
  const input = document.getElementById('pname-' + id);
  if (!input) return;
  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  input.focus();
}

export function useBillActions() {
  const state = useBillState();
  const dispatch = useBillDispatch();
  const { customConfirm, customAlert } = useDialog();
  const { showToast } = useToast();
  const { markPushedVersion } = useLiveSyncContext();

  const createAccount = useCallback(() => {
    dispatch({ type: 'CREATE_ACCOUNT' });
  }, [dispatch]);

  const resetAll = useCallback(async () => {
    if (!await customConfirm(T.topbar.confirmReset)) return;
    dispatch({ type: 'RESET_ALL' });
  }, [customConfirm, dispatch]);

  const setTotal = useCallback((value) => dispatch({ type: 'SET_TOTAL', value }), [dispatch]);
  const setPct = useCallback((value) => dispatch({ type: 'SET_PCT', value }), [dispatch]);

  const setCurrency = useCallback(async (cur) => {
    if (!cur || cur === state.currency) return;
    if (hasAnyAmount(state) && !await customConfirm(T.topbar.confirmCurrencyChange)) {
      return false; // el <select> debe revertirse a la moneda actual (lo hace el componente)
    }
    dispatch({ type: 'SET_CURRENCY', currency: cur });
    return true;
  }, [state, customConfirm, dispatch]);

  // ── Compartidos ──
  const addSharedItem = useCallback(() => dispatch({ type: 'ADD_SHARED_ITEM' }), [dispatch]);
  const dupSharedItem = useCallback((id) => dispatch({ type: 'DUP_SHARED_ITEM', id }), [dispatch]);
  const removeSharedItem = useCallback((id) => dispatch({ type: 'REMOVE_SHARED_ITEM', id }), [dispatch]);
  const updateSharedItem = useCallback((id, field, value) =>
    dispatch({ type: 'UPDATE_SHARED_ITEM', id, field, value }), [dispatch]);

  const changePersonaEmoji = useCallback((id) =>
    dispatch({ type: 'CHANGE_PERSONA_EMOJI', id, emoji: randomAnimal() }), [dispatch]);

  const removePersona = useCallback(async (id) => {
    // eliminar personas es un privilegio exclusivo de quien creó la cuenta
    if (state.mode === 'guest') return;

    const p = state.personas.find(p => p.id === id);
    const label = (p && p.name) ? p.name : T.persona.removeConfirmFallbackName;
    if (!await customConfirm(T.persona.confirmRemove(label))) return;

    dispatch({ type: 'REMOVE_PERSONA', id });

    if (state.liveSession) {
      // aviso explícito al servidor — puede ser la persona de otro dispositivo
      apiCall(state.liveSession.sessionId + '/persona/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleted: true })
      }).catch(() => {});
    }
  }, [state.mode, state.personas, state.liveSession, customConfirm, dispatch]);

  const updatePersonaName = useCallback((id, value) =>
    dispatch({ type: 'UPDATE_PERSONA_NAME', id, value }), [dispatch]);

  const setPagador = useCallback((id) => dispatch({ type: 'SET_PAGADOR', id }), [dispatch]);

  const addItem = useCallback((personaId) => dispatch({ type: 'ADD_ITEM', personaId }), [dispatch]);
  const dupItem = useCallback((personaId, itemId) => dispatch({ type: 'DUP_ITEM', personaId, itemId }), [dispatch]);
  const removeItem = useCallback((personaId, itemId) => dispatch({ type: 'REMOVE_ITEM', personaId, itemId }), [dispatch]);
  const updateItem = useCallback((personaId, itemId, field, value) =>
    dispatch({ type: 'UPDATE_ITEM', personaId, itemId, field, value }), [dispatch]);

  // ── Sesión en vivo ──
  const goLive = useCallback(async () => {
    try {
      const { ok, data } = await apiCall('create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total: state.total, pct: state.pct, currency: state.currency,
          shared: state.shared.map(i => ({ id: i.id, name: i.name, price: i.price }))
        })
      });
      if (!ok) throw new Error('create_failed');

      // el que crea la cuenta se suma como cualquier otro participante — cada
      // quien agrega lo suyo, sin arrastrar personas locales que el servidor
      // nunca llegó a conocer (evita el 404 al querer guardarlas después)
      const liveSession = { sessionId: data.sessionId, role: 'host', myPersonaIds: [], joined: false };
      history.replaceState(null, '', location.pathname + location.search + '#live=' + data.sessionId);
      dispatch({ type: 'SET_MODE_AND_SESSION', mode: 'host', liveSession, bill: { personas: [] } });
      return true;
    } catch {
      await customAlert(T.live.goLiveFailed);
      return false;
    }
  }, [state.total, state.pct, state.currency, state.shared, customAlert, dispatch]);

  const confirmCloseLive = useCallback(async () => {
    if (!state.liveSession) return false;
    if (!await customConfirm(T.live.confirmCloseSession)) return false;
    try { await apiCall(state.liveSession.sessionId + '/close', { method: 'POST' }); } catch { /* no bloquea */ }
    dispatch({ type: 'SET_MODE_AND_SESSION', mode: 'solo', liveSession: null });
    showToast(T.live.sessionClosed);
    return true;
  }, [state.liveSession, customConfirm, dispatch, showToast]);

  const confirmLeaveLive = useCallback(async () => {
    if (!await customConfirm(T.live.confirmLeaveSession)) return;
    dispatch({ type: 'SET_MODE_AND_SESSION', mode: 'solo', liveSession: null });
    history.replaceState(null, '', location.pathname + location.search);
  }, [customConfirm, dispatch]);

  const handleLiveIndicatorAction = useCallback(() => {
    if (state.mode === 'host') return confirmCloseLive();
    if (state.mode === 'guest') return confirmLeaveLive();
  }, [state.mode, confirmCloseLive, confirmLeaveLive]);

  // Cualquier participante en vivo (host o invitado) se suma 100% local —
  // sin avisar al servidor todavía. Recién se envía al tocar "Guardar" en su tarjeta.
  const addPersonaLiveDraft = useCallback(async () => {
    const unnamed = state.personas.find(p => state.liveSession.myPersonaIds.includes(p.id) && (!p.name || !p.name.trim()));
    if (unnamed) {
      await customAlert(T.persona.needNameBeforeAdding);
      focusPersonaNameInput(unnamed.id);
      return;
    }
    dispatch({ type: 'ADD_PERSONA_DRAFT', emoji: randomAnimal() });
  }, [state.personas, state.liveSession, customAlert, dispatch]);

  // Invitado: manda nombre + gastos de una sola vez (reemplaza el sync por-tecla)
  const guardarMisGastos = useCallback(async (id) => {
    const p = state.personas.find(p => p.id === id);
    if (!p || !state.liveSession) return;

    try {
      let realId = id;
      if (id < 0) {
        const { ok, data } = await apiCall(state.liveSession.sessionId + '/persona', { method: 'POST' });
        if (!ok) throw new Error('save_failed');
        realId = data.personaId;
        dispatch({ type: 'PROMOTE_DRAFT', draftId: id, realId });
      }

      const { ok: okPut } = await apiCall(state.liveSession.sessionId + '/persona/' + realId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: p.name, emoji: p.emoji, items: p.items })
      });
      if (!okPut) throw new Error('save_failed');

      const { ok: okGet, data: freshData } = await apiCall(state.liveSession.sessionId);
      if (okGet) markPushedVersion(freshData.version);

      showToast(T.live.savedToast);
    } catch {
      await customAlert(T.live.saveFailed);
    }
  }, [state.personas, state.liveSession, dispatch, markPushedVersion, showToast, customAlert]);

  // memoizado: cada función ya es estable (useCallback), pero el objeto que
  // las envuelve no lo sería sin esto — y PersonaCard/ItemRow dependen de que
  // esta referencia no cambie para que `memo` los proteja de verdad.
  return useMemo(() => ({
    createAccount, resetAll, setTotal, setPct, setCurrency,
    addSharedItem, dupSharedItem, removeSharedItem, updateSharedItem,
    changePersonaEmoji, removePersona, updatePersonaName, setPagador,
    addItem, dupItem, removeItem, updateItem,
    goLive, confirmCloseLive, confirmLeaveLive, handleLiveIndicatorAction,
    addPersonaLiveDraft, guardarMisGastos
  }), [
    createAccount, resetAll, setTotal, setPct, setCurrency,
    addSharedItem, dupSharedItem, removeSharedItem, updateSharedItem,
    changePersonaEmoji, removePersona, updatePersonaName, setPagador,
    addItem, dupItem, removeItem, updateItem,
    goLive, confirmCloseLive, confirmLeaveLive, handleLiveIndicatorAction,
    addPersonaLiveDraft, guardarMisGastos
  ]);
}

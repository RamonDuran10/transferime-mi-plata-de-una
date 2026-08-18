import { useCallback, useEffect, useRef, useState } from 'react';
import { useBillState, useBillDispatch } from '../context/BillContext';
import { useDialog } from '../context/DialogContext';
import { useModalOpen } from '../context/ModalOpenContext';
import { apiCall } from '../lib/api';
import { T } from '../i18n/es';

const PUSH_DEBOUNCE_MS = 400;
const POLL_INTERVAL_MS = 4000;

// Sincronización en vivo: polling (todos) + push debounced (solo host).
// lastSeenVersion/lastPushedVersion/pollFailCount viven en refs porque
// cambian cada pocos segundos y no necesitan disparar un re-render por sí
// solos (ver useBillState para lo que sí es estado "de verdad").
export function useLiveSync() {
  const state = useBillState();
  const dispatch = useBillDispatch();
  const { customAlert, isOpen: dialogOpen } = useDialog();
  const { shareModalOpen, infoModalOpen } = useModalOpen();

  const lastSeenVersion = useRef(0);
  const lastPushedVersion = useRef(0);
  const pollFailCount = useRef(0);
  const pushTimer = useRef(null);
  const [showConnectionBanner, setShowConnectionBanner] = useState(false);

  // espejo del estado más reciente, para leer dentro del intervalo sin
  // cerrarse sobre valores viejos (evita el clásico bug de closures stale
  // dentro de un setInterval) — se actualiza después de cada render, nunca
  // durante el render mismo.
  const latest = useRef({ state, shareModalOpen, infoModalOpen, dialogOpen });
  useEffect(() => {
    latest.current = { state, shareModalOpen, infoModalOpen, dialogOpen };
  });

  const markPushedVersion = useCallback((v) => {
    if (typeof v === 'number') lastPushedVersion.current = v;
  }, []);

  const bailToLocal = useCallback(() => {
    history.replaceState(null, '', location.pathname + location.search);
    dispatch({ type: 'SET_MODE_AND_SESSION', mode: 'solo', liveSession: null });
  }, [dispatch]);

  // ── Polling ──
  useEffect(() => {
    const sessionId = state.liveSession?.sessionId;
    if (!sessionId) return;

    async function pollTick() {
      const { state: s, shareModalOpen, infoModalOpen, dialogOpen } = latest.current;
      if (dialogOpen || shareModalOpen || infoModalOpen) return;
      try {
        const { ok, status, data } = await apiCall(sessionId);
        if (!ok) {
          if (status === 404) {
            await customAlert(T.live.sessionExpired);
            bailToLocal();
            return;
          }
          throw new Error('poll_failed');
        }
        pollFailCount.current = 0;
        setShowConnectionBanner(false);

        if (data.closed && s.mode === 'guest') {
          await customAlert(T.live.sessionClosed);
          bailToLocal();
          return;
        }

        if (data.version === lastSeenVersion.current || data.version <= lastPushedVersion.current) return;
        lastSeenVersion.current = data.version;
        dispatch({ type: 'MERGE_REMOTE', remote: data });
      } catch {
        pollFailCount.current += 1;
        if (pollFailCount.current >= 3) setShowConnectionBanner(true);
      }
    }

    function tick() {
      if (document.hidden) return;
      pollTick();
    }

    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [state.liveSession?.sessionId, dispatch, customAlert, bailToLocal]);

  // ── Push automático del host (debounced) ──
  // Solo lo que es "meta" (total/propina/moneda/compartidos) es del host y se
  // sincroniza solo. Sus propias personas ya NO se auto-empujan acá — el host
  // usa el mismo botón explícito "Guardar" que el invitado (ver
  // guardarMisGastos en useBillActions), para que una tarjeta a medio llenar
  // nunca se le aparezca de golpe al resto.
  useEffect(() => {
    if (state.mode !== 'host' || !state.liveSession) return;
    const sessionId = state.liveSession.sessionId;
    const total = state.total, pct = state.pct, currency = state.currency;
    const paidPersonaId = state.paidPersonaId;
    const shared = state.shared;

    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      try {
        await apiCall(sessionId + '/meta', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ total, pct, currency, paidPersonaId })
        });
        for (const item of shared) {
          await apiCall(sessionId + '/shared-item/' + item.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: item.name, price: item.price })
          });
        }
        const { ok, data } = await apiCall(sessionId);
        if (ok && typeof data.version === 'number') lastPushedVersion.current = data.version;
      } catch { /* el próximo poll reintenta la lectura */ }
    }, PUSH_DEBOUNCE_MS);

    return () => { if (pushTimer.current) clearTimeout(pushTimer.current); };
  }, [state.mode, state.liveSession, state.total, state.pct, state.currency, state.paidPersonaId, state.shared]);

  return { showConnectionBanner, markPushedVersion };
}

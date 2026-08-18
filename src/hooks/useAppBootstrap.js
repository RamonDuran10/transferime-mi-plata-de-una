import { useEffect, useRef, useState } from 'react';
import { useBillDispatch, loadBillFromStorage, loadSessionFromStorage } from '../context/BillContext';
import { useDialog } from '../context/DialogContext';
import { useToast } from '../context/ToastContext';
import { apiCall } from '../lib/api';
import { detectCurrency, formatAmountInput } from '../lib/currency';
import { T } from '../i18n/es';

function normalizeRemoteBill(data) {
  return {
    total: data.total ? formatAmountInput(data.total, data.currency) : '', pct: data.pct || '', currency: data.currency || '',
    created: true, personaCount: 0,
    shared: (data.shared || []).map(i => ({ id: i.id, name: i.name || '', price: i.price || '' })),
    personas: (data.personas || []).map(p => ({
      id: p.id, name: p.name || '', emoji: p.emoji || '',
      items: (p.items || []).map(i => ({ id: i.id, name: i.name || '', price: i.price || '' })),
      paid: !!p.paid
    }))
  };
}

// Equivalente de load() — corre una sola vez al montar la app. Devuelve
// `loading` para que el <PageLoader> bloquee hasta que termine.
export function useAppBootstrap() {
  const dispatch = useBillDispatch();
  const { customConfirm, customAlert } = useDialog();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    (async () => {
      try {
        const localBill = loadBillFromStorage();
        if (localBill) dispatch({ type: 'HYDRATE', payload: localBill });

        if (location.hash.startsWith('#live=')) {
          const sessionId = location.hash.slice(6);
          const existing = loadSessionFromStorage();
          const liveSession = (existing && existing.sessionId === sessionId)
            ? existing
            : { sessionId, role: 'guest', myPersonaIds: [] };

          const { ok, status, data } = await apiCall(sessionId);
          history.replaceState(null, '', location.pathname + location.search);
          if (!ok) {
            await customAlert(status === 404 ? T.live.sessionExpired : T.live.joinFailed);
            return;
          }

          dispatch({
            type: 'SET_MODE_AND_SESSION',
            mode: liveSession.role,
            liveSession,
            bill: normalizeRemoteBill(data)
          });
          return;
        }

        // ¿veníamos de una sesión en vivo (app abierta normal, sin link)?
        const existingSession = loadSessionFromStorage();
        if (existingSession) {
          const wantsResume = await customConfirm(T.live.resumePrompt, {
            okText: T.live.resumeContinue, cancelText: T.live.resumeNew
          });
          if (wantsResume) {
            const { ok, data } = await apiCall(existingSession.sessionId).catch(() => ({ ok: false }));
            if (ok && !data.closed) {
              dispatch({
                type: 'SET_MODE_AND_SESSION',
                mode: existingSession.role,
                liveSession: existingSession,
                bill: normalizeRemoteBill(data)
              });
            } else {
              dispatch({ type: 'SET_MODE_AND_SESSION', mode: 'solo', liveSession: null });
              showToast(T.live.sessionExpired);
            }
          } else {
            dispatch({ type: 'SET_MODE_AND_SESSION', mode: 'solo', liveSession: null });
            dispatch({ type: 'RESET_ALL' });
          }
        }
      } finally {
        dispatch({ type: 'SET_CURRENCY_DETECTED', currency: detectCurrency() });
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return loading;
}

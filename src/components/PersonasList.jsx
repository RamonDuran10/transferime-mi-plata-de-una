import { useMemo } from 'react';
import { useBillState } from '../context/BillContext';
import { useBillActions } from '../hooks/useBillActions';
import PersonaCard from './PersonaCard';
import { T } from '../i18n/es';

export default function PersonasList({ results }) {
  const state = useBillState();
  const actions = useBillActions();

  const isMineOf = (id) => state.mode === 'solo' || (state.liveSession && state.liveSession.myPersonaIds.includes(id));

  // sumarse solo existe una vez publicada la cuenta — antes de eso no hay
  // nadie a quien "agregar" (el creador solo define total/propina/compartido)
  const canJoin = !!state.liveSession && !state.liveSession.joined;

  // memoizado por el conjunto de ids (no por la referencia de state.personas,
  // que cambia con cada tecla que alguien escribe en su propia tarjeta) — así
  // esta lista de ids no rompe el aislamiento de re-render entre tarjetas
  const idsKey = state.personas.map(p => p.id).join(',');
  // a propósito: solo debe recalcularse si cambia el conjunto de ids, no la referencia completa
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const personaIds = useMemo(() => state.personas.map(p => p.id), [idsKey]);

  return (
    <>
      <div className="personas-list">
        {state.personas.map(p => {
          const r = results.find(r => r.id === p.id);
          return (
            <PersonaCard
              key={p.id}
              persona={p}
              isMine={isMineOf(p.id)}
              isPayer={state.paidPersonaId === p.id}
              mode={state.mode}
              shared={state.shared}
              personaIds={personaIds}
              pct={state.pct}
              currency={state.currency}
              amount={r ? r.amount : 0}
              actions={actions}
            />
          );
        })}
      </div>

      {canJoin && (
        <button className="btn-add-persona" onClick={actions.addPersonaLiveDraft} title={T.persona.addPersonaTitle}>
          {T.live.joinButton}
        </button>
      )}
    </>
  );
}

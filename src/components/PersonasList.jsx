import { useState } from 'react';
import { useBillState } from '../context/BillContext';
import { useBillActions } from '../hooks/useBillActions';
import PersonaCard from './PersonaCard';
import { T } from '../i18n/es';

export default function PersonasList({ results }) {
  const state = useBillState();
  const actions = useBillActions();
  const [joining, setJoining] = useState(false); // placeholder "uniéndote..." (solo host agregando gente)

  const isMineOf = (id) => state.mode === 'solo' || (state.liveSession && state.liveSession.myPersonaIds.includes(id));

  const onAddClick = async () => {
    if (state.mode === 'host') {
      setJoining(true);
      try { await actions.handleAddPersonaClick(); } finally { setJoining(false); }
    } else {
      actions.handleAddPersonaClick();
    }
  };

  const alreadyJoined = state.mode === 'guest' && state.liveSession && state.liveSession.myPersonaIds.length > 0;
  const addLabel = (state.mode === 'guest' || state.mode === 'host') ? T.live.joinButton : T.persona.addPersona;

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
              mode={state.mode}
              shared={state.shared}
              personasCount={state.personas.length}
              pct={state.pct}
              currency={state.currency}
              amount={r ? r.amount : 0}
              actions={actions}
            />
          );
        })}
        {joining && (
          <div className="persona-card pending">
            <div className="persona-header"><span>⏳ {T.live.joining}</span></div>
          </div>
        )}
      </div>

      {!alreadyJoined && (
        <button className="btn-add-persona" onClick={onAddClick} title={T.persona.addPersonaTitle}>
          {addLabel}
        </button>
      )}
    </>
  );
}

import { useBillState } from '../context/BillContext';
import { useBillActions } from '../hooks/useBillActions';
import PersonaCard from './PersonaCard';
import { T } from '../i18n/es';

export default function PersonasList({ results }) {
  const state = useBillState();
  const actions = useBillActions();

  const isMineOf = (id) => state.mode === 'solo' || (state.liveSession && state.liveSession.myPersonaIds.includes(id));

  const onAddClick = () => actions.handleAddPersonaClick();

  // cada dispositivo (host o invitado) se suma una sola vez por sesión en vivo
  const alreadyJoined = !!(state.liveSession && state.liveSession.joined);
  const addLabel = state.liveSession ? T.live.joinButton : T.persona.addPersona;

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
              personasCount={state.personas.length}
              pct={state.pct}
              currency={state.currency}
              amount={r ? r.amount : 0}
              actions={actions}
            />
          );
        })}
      </div>

      {!alreadyJoined && (
        <button className="btn-add-persona" onClick={onAddClick} title={T.persona.addPersonaTitle}>
          {addLabel}
        </button>
      )}
    </>
  );
}

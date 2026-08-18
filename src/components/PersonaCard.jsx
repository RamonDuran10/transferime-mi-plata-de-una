import { memo } from 'react';
import { fmt, formatAmountInput, parseAmount } from '../lib/currency';
import { T } from '../i18n/es';

const ItemRow = memo(function ItemRow({ item, personaId, currency, isMine, onUpdate, onDup, onRemove }) {
  return (
    <div className="item-row cols4">
      <input
        type="text" placeholder={T.persona.itemPlaceholder} value={item.name}
        readOnly={!isMine}
        onChange={e => onUpdate(personaId, item.id, 'name', e.target.value)}
      />
      <input
        type="text" inputMode="decimal" className="price" placeholder={T.persona.columnPrice}
        value={formatAmountInput(item.price, currency)}
        readOnly={!isMine}
        onChange={e => onUpdate(personaId, item.id, 'price', e.target.value)}
        onBlur={e => onUpdate(personaId, item.id, 'price', formatAmountInput(e.target.value, currency))}
      />
      <button className="btn-dup-item" onClick={() => onDup(personaId, item.id)} title={T.persona.dupTitle}>⧉</button>
      <button className="btn-remove-item" onClick={() => onRemove(personaId, item.id)} title={T.persona.removeItemTitle}>✕</button>
    </div>
  );
});

function PersonaCard({
  persona, isMine, mode, shared, personasCount, pct, currency, amount,
  actions
}) {
  const { changePersonaEmoji, updatePersonaName, setPagador, removePersona, addItem, dupItem, removeItem, updateItem, guardarMisGastos } = actions;

  const nickPhs = T.persona.nicknamePlaceholders;
  const ph = nickPhs[Math.abs(Math.floor(persona.id - 1)) % nickPhs.length];

  const sharedConValor = shared.filter(i => parseAmount(i.price, currency) > 0);
  const gPct = parseFloat(pct) || 0;

  return (
    <div className={'persona-card' + (persona.paid ? ' is-payer' : '') + (isMine ? '' : ' readonly-card')}>
      <div className="persona-header">
        <button
          className="btn-persona-emoji" onClick={() => changePersonaEmoji(persona.id)}
          title={T.persona.emojiTitle} disabled={!isMine}
        >
          {persona.emoji}
        </button>
        <input
          type="text" id={'pname-' + persona.id} placeholder={ph} value={persona.name}
          readOnly={!isMine}
          onChange={e => updatePersonaName(persona.id, e.target.value)}
        />
        {!isMine && <span className="readonly-badge" title={T.persona.readonlyTitle}>🔒</span>}
        <button
          className={'btn-persona-paid' + (persona.paid ? ' is-paid' : '')}
          onClick={() => setPagador(persona.id)}
          title={persona.paid ? T.persona.unmarkPaidTitle : T.persona.markPaidTitle}
        >
          👑
        </button>
        <button className="btn-remove-persona" onClick={() => removePersona(persona.id)} title={T.persona.removeTitle}>✕</button>
      </div>

      <div className="items-list">
        {persona.items.length > 0 && (
          <div className="items-header cols4">
            <span>{T.persona.columnWhat}</span><span>{T.persona.columnPrice}</span><span></span><span></span>
          </div>
        )}
        {persona.items.map(item => (
          <ItemRow
            key={item.id} item={item} personaId={persona.id} currency={currency} isMine={isMine}
            onUpdate={updateItem} onDup={dupItem} onRemove={removeItem}
          />
        ))}
      </div>

      {sharedConValor.length > 0 && personasCount > 0 && (
        <div className="shared-portion">
          {sharedConValor.map(item => {
            const pr = parseAmount(item.price, currency) || 0;
            const total = (pr + pr * gPct / 100) / personasCount;
            const label = T.persona.sharedPortion(item.name);
            return (
              <div className="shared-portion-row" key={item.id}>
                <span className="shared-portion-name">{label} (÷{personasCount})</span>
                <span className="shared-portion-amt">{fmt(total, currency)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="persona-footer">
        <button className="btn-add-item" onClick={() => addItem(persona.id)} title={T.persona.addItemTitle}>
          {T.persona.addItem}
        </button>
        {persona.paid && <span className="paid-badge">{T.persona.paidBadge}</span>}
        <div className="persona-total" id={'pt-' + persona.id}>{fmt(amount, currency)}</div>
      </div>

      {isMine && mode === 'guest' && (
        <div className="persona-save-row">
          <button className="btn-save-guest" onClick={() => guardarMisGastos(persona.id)}>
            {T.live.saveGuestButton}
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(PersonaCard);

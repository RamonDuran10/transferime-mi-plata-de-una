import { memo } from 'react';
import { useBillState } from '../context/BillContext';
import { useBillActions } from '../hooks/useBillActions';
import { sharedTotalConPct } from '../lib/bill';
import { fmt, formatAmountInput } from '../lib/currency';
import { T } from '../i18n/es';

const SharedItemRow = memo(function SharedItemRow({ item, currency, onUpdate, onDup, onRemove }) {
  return (
    <div className="item-row cols4s">
      <input
        type="text" placeholder={T.shared.namePlaceholder} value={item.name}
        onChange={e => onUpdate(item.id, 'name', e.target.value)}
      />
      <input
        type="text" inputMode="decimal" className="price" placeholder={T.shared.columnPrice}
        value={formatAmountInput(item.price, currency)}
        onChange={e => onUpdate(item.id, 'price', e.target.value)}
        onBlur={e => onUpdate(item.id, 'price', formatAmountInput(e.target.value, currency))}
      />
      <button className="btn-dup-item" onClick={() => onDup(item.id)} title={T.shared.dupTitle}>⧉</button>
      <button className="btn-remove-item" onClick={() => onRemove(item.id)} title={T.shared.removeTitle}>✕</button>
    </div>
  );
});

export default function SharedCard() {
  const state = useBillState();
  const { addSharedItem, dupSharedItem, removeSharedItem, updateSharedItem } = useBillActions();

  const n = state.personas.length;
  const sharedAmt = sharedTotalConPct(state);
  const sharedPP = n > 0 ? sharedAmt / n : 0;
  const badgeText = n > 0 && sharedAmt > 0
    ? `${fmt(sharedAmt, state.currency)} ÷ ${n} = ${fmt(sharedPP, state.currency)} ${T.shared.perUnit}`
    : `${fmt(sharedAmt, state.currency)} ${T.shared.badgeAll}`;

  return (
    <div className="shared-card">
      <div className="shared-header">
        <span className="title">{T.shared.title}</span>
        <span className="shared-total-badge">{badgeText}</span>
      </div>
      <div className="items-list">
        {state.shared.length > 0 && (
          <div className="items-header cols4s">
            <span>{T.shared.columnWhat}</span><span>{T.shared.columnPrice}</span><span></span><span></span>
          </div>
        )}
        {state.shared.map(item => (
          <SharedItemRow
            key={item.id} item={item} currency={state.currency}
            onUpdate={updateSharedItem} onDup={dupSharedItem} onRemove={removeSharedItem}
          />
        ))}
      </div>
      <div className="persona-footer">
        <button className="btn-add-item btn-add-shared" onClick={addSharedItem} title={T.shared.addTitle}>
          {T.shared.add}
        </button>
      </div>
    </div>
  );
}

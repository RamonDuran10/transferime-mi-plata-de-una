import { useBillState } from '../context/BillContext';
import { parseAmount, fmt } from '../lib/currency';
import { T } from '../i18n/es';

export default function Summary({ results, total, sharedPP, sharedAmt }) {
  const state = useBillState();
  const currency = state.currency;

  if (results.length === 0) {
    return (
      <div className="summary">
        <h2>{T.summary.title}</h2>
        <div className="summary-rows">
          <p style={{ color: '#a0aec0', fontSize: '.8rem', textAlign: 'center', padding: '8px 0' }}>{T.summary.empty}</p>
        </div>
      </div>
    );
  }

  const sum = results.reduce((s, r) => s + r.amount, 0);
  const maxAmt = Math.max(...results.map(r => r.amount));
  const richIdx = results.findIndex(r => r.amount === maxAmt);
  const hayDif = results.some(r => Math.abs(r.amount - maxAmt) > 1);

  const gPct = parseFloat(state.pct) || 0;
  let baseSinPropina = 0, propinaMonto = 0;
  if (gPct > 0) {
    baseSinPropina = results.reduce((s, r) => {
      const p = state.personas.find(px => px.id === r.id);
      const baseP = p ? p.items.reduce((a, i) => a + (parseAmount(i.price, currency) || 0), 0) : 0;
      return s + baseP;
    }, 0) + (state.shared.reduce((s, i) => s + (parseAmount(i.price, currency) || 0), 0) / (state.personas.length || 1)) * state.personas.length;
    propinaMonto = sum - baseSinPropina;
  }

  const diff = total > 0 ? Math.abs(sum - total) : null;
  const ok = diff !== null && diff < 1;
  const noTotal = total === 0;
  const cls = noTotal ? 'warning' : (ok ? 'ok' : 'error');
  const msg = noTotal ? T.summary.noTotal : (ok ? T.summary.ok : (sum > total ? T.summary.over : T.summary.under));
  const bCls = noTotal ? 'badge-warn' : (ok ? 'badge-ok' : 'badge-error');

  return (
    <div className="summary">
      <h2>{T.summary.title}</h2>
      <div className="summary-rows">
        {sharedAmt > 0 && state.personas.length > 0 && (
          <div className="summary-shared-row">
            <span>{T.summary.sharedLine(state.personas.length)}</span>
            <span style={{ fontWeight: 700 }}>{fmt(sharedPP, currency)} {T.summary.perUnit}</span>
          </div>
        )}

        {results.map((r, i) => {
          const isRico = i === richIdx && hayDif && results.length > 1;
          return (
            <div className={'summary-row' + (isRico ? ' summary-row-rico' : '')} key={r.id}>
              <span className="name">{r.name}{isRico ? ' 😂' : ''}</span>
              <span className="amount">{fmt(r.amount, currency)}</span>
            </div>
          );
        })}

        {gPct > 0 && (
          <>
            <div className="summary-row" style={{ background: '#f7fafc', fontSize: '.78rem' }}>
              <span className="name" style={{ color: '#718096' }}>{T.summary.subtotalNoTip}</span>
              <span className="amount" style={{ color: '#718096' }}>{fmt(baseSinPropina, currency)}</span>
            </div>
            <div className="summary-row" style={{ background: '#fef9ec', fontSize: '.78rem' }}>
              <span className="name" style={{ color: '#92400e' }}>{T.summary.tipLine(gPct)}</span>
              <span className="amount" style={{ color: '#92400e' }}>+{fmt(propinaMonto, currency)}</span>
            </div>
          </>
        )}

        <div className={`summary-total-row ${cls}`}>
          <span>{gPct > 0 ? T.summary.totalWithTip : T.summary.totalNoTip}: {fmt(sum, currency)}</span>
          <span className={`badge ${bCls}`}>{msg}</span>
        </div>

        {!noTotal && !ok && (
          <div style={{ fontSize: '.75rem', color: '#718096', textAlign: 'right', padding: '3px 9px 0' }}>
            {sum > total ? T.summary.exceededBy(fmt(sum - total, currency)) : T.summary.missingBy(fmt(total - sum, currency))}
          </div>
        )}
      </div>
    </div>
  );
}

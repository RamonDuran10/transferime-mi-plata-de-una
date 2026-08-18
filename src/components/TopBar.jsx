import { useBillState } from '../context/BillContext';
import { useBillActions } from '../hooks/useBillActions';
import { useModalOpen } from '../context/ModalOpenContext';
import { reformatAmountValue } from '../lib/currency';
import { T } from '../i18n/es';

export default function TopBar({ onShare }) {
  const state = useBillState();
  const { setTotal, setCurrency, setPct, resetAll } = useBillActions();
  const { setInfoModalOpen } = useModalOpen();

  // el total y la propina los fija el host una sola vez, antes de publicar —
  // una vez en vivo quedan de solo lectura para todos (host incluido)
  const metaLocked = !!state.liveSession;

  return (
    <div className="top-bar">
      <div className="top-bar-row top-bar-total">
        <label htmlFor="totalBill" title={T.topbar.totalTitle}>💰</label>
        <input
          type="text" inputMode="decimal" id="totalBill"
          placeholder={T.topbar.totalPlaceholder}
          title={metaLocked ? T.topbar.metaLockedTitle : T.topbar.totalTitle}
          value={state.total}
          readOnly={metaLocked}
          onChange={e => setTotal(e.target.value)}
          onBlur={e => setTotal(reformatAmountValue(e.target.value, state.currency))}
        />
      </div>
      <div className="top-bar-row top-bar-selects">
        <select
          className="currency-select" title={T.topbar.currencyTitle}
          value={state.currency || 'CLP'}
          disabled={metaLocked}
          onChange={async e => { await setCurrency(e.target.value); }}
        >
          {Object.entries(T.topbar.currencyOptions).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
        <select
          className="tip-select" title={metaLocked ? T.topbar.metaLockedTitle : T.topbar.tipLabel}
          value={String(parseFloat(state.pct) || 0)}
          disabled={metaLocked}
          onChange={e => setPct(parseInt(e.target.value, 10))}
        >
          {[0, 10, 15, 20].map(v => (
            <option key={v} value={v} title={T.topbar.tipOptionTitle(v)}>
              {v === 0 ? T.topbar.tipNone : `${v}%`}
            </option>
          ))}
        </select>
      </div>
      <div className="top-bar-row top-bar-actions">
        <button className="btn-share" onClick={onShare} title={T.topbar.shareTitle}>{T.topbar.share}</button>
        <button className="btn-info" onClick={() => setInfoModalOpen(true)} title={T.info.buttonTitle}>ⓘ</button>
        <button className="btn-reset" onClick={resetAll} title={T.topbar.resetTitle}>🗑️</button>
      </div>
    </div>
  );
}

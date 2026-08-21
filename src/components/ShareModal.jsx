import { useMemo, useState } from 'react';
import { useBillState } from '../context/BillContext';
import { useBillActions } from '../hooks/useBillActions';
import { useModalOpen } from '../context/ModalOpenContext';
import { useUsageCounter } from '../hooks/useUsageCounter';
import { computeResults, sharedItemParticipants, sharedContributionsByPersona } from '../lib/bill';
import { parseAmount, fmt } from '../lib/currency';
import { T } from '../i18n/es';

// Vista "facturita": solo nombre y monto, sin íconos — pensada para leer
// rápido al momento de pagar en caja.
function buildTotalsText(results, currency) {
  return results.map(r => `${r.name} — ${fmt(r.amount, currency)}`).join('\n');
}

function buildExportText(state, results, total, ok) {
  const currency = state.currency;
  const gPct = parseFloat(state.pct) || 0;
  const personaIds = state.personas.map(p => p.id);
  const nameById = new Map(state.personas.map(p => [p.id, p.name || T.persona.removeConfirmFallbackName]));
  const contributions = sharedContributionsByPersona(state);
  const sum = results.reduce((s, r) => s + r.amount, 0);

  let txt = T.export.header + '\n';
  txt += '─────────────────────\n';

  if (total > 0) {
    if (gPct > 0) {
      const baseTotal = total / (1 + gPct / 100);
      const propinaMonto = total - baseTotal;
      txt += T.export.subtotal(fmt(baseTotal, currency)) + '\n';
      txt += T.export.tip(gPct, fmt(propinaMonto, currency)) + '\n';
      txt += T.export.total(fmt(total, currency)) + '\n';
    } else {
      txt += T.export.totalNoTip(fmt(total, currency)) + '\n';
    }
  }

  const payer = state.personas.find(p => p.id === state.paidPersonaId);
  if (payer) txt += T.export.paidBy(payer.name || T.persona.removeConfirmFallbackName) + '\n';

  const sharedConValor = state.shared.filter(i => parseAmount(i.price, currency) > 0);
  if (sharedConValor.length > 0 && personaIds.length > 0) {
    txt += '\n' + T.export.sharedHeader + '\n';
    sharedConValor.forEach(i => {
      const pr = parseAmount(i.price, currency) || 0;
      const tot = pr * (1 + gPct / 100);
      const label = i.name || T.export.sharedItemDefault;
      const participants = sharedItemParticipants(i, personaIds);
      const names = participants.map(id => nameById.get(id)).join(', ');
      txt += T.export.sharedItemLine(label, fmt(tot, currency), fmt(tot / (participants.length || 1), currency), names) + '\n';
    });
  }

  txt += '\n' + T.export.perPersonHeader + '\n';
  results.forEach((r, idx) => {
    const p = state.personas[idx];
    const isRico = results.every((x, i) => i === idx || x.amount <= r.amount) && results.some(x => Math.abs(x.amount - r.amount) > 1);
    txt += '\n' + T.export.personLine(r.name, isRico, fmt(r.amount, currency)) + '\n';
    let basePersona = 0;
    if (p && p.items.length > 0) {
      p.items.forEach(item => {
        const pr = parseAmount(item.price, currency) || 0;
        if (pr > 0) {
          basePersona += pr;
          const label = item.name || T.export.itemDefault;
          txt += T.export.itemLine(label, fmt(pr, currency)) + '\n';
        }
      });
    }
    const mySharedPP = p ? (contributions[p.id] || 0) : 0;
    if (mySharedPP > 0) {
      const baseSharedPP = mySharedPP / (1 + gPct / 100);
      basePersona += baseSharedPP;
      txt += T.export.sharedPersonLine(fmt(baseSharedPP, currency)) + '\n';
    }
    if (gPct > 0 && basePersona > 0) {
      const propinaPers = r.amount - basePersona;
      txt += T.export.tipPersonLine(gPct, fmt(propinaPers, currency)) + '\n';
    }
  });

  txt += '\n─────────────────────\n';
  txt += ok ? T.export.matches : T.export.sum(fmt(sum, currency));
  return txt;
}

function LiveSessionPanel({ ok }) {
  const state = useBillState();
  const { goLive, confirmCloseLive } = useBillActions();
  const { bump } = useUsageCounter();
  const [going, setGoing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);

  const handleGoLive = async () => {
    setGoing(true);
    try { await goLive(); } finally { setGoing(false); }
  };

  if (state.mode === 'guest') {
    return ok ? (
      <div className="modal-done-card">
        <div className="modal-done-title">{T.modal.doneTitle}</div>
        <div className="modal-done-subtitle">{T.modal.doneSubtitle}</div>
      </div>
    ) : null;
  }

  if (state.mode !== 'host' || !state.liveSession) {
    if (ok) {
      return (
        <div className="modal-done-card">
          <div className="modal-done-title">{T.modal.doneTitle}</div>
          <div className="modal-done-subtitle">{T.modal.doneSubtitle}</div>
        </div>
      );
    }
    return (
      <div className="modal-live-section">
        <button className={'btn-go-live' + (going ? ' loading' : '')} disabled={going} onClick={handleGoLive}>
          {going ? T.live.goLiveLoading : T.live.goLiveButton}
        </button>
        <p className="modal-live-hint">{T.live.goLiveHint}</p>
      </div>
    );
  }

  const joinUrl = location.origin + location.pathname + '#live=' + state.liveSession.sessionId;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=1B1A2E&bgcolor=FFFDF7&data=${encodeURIComponent(joinUrl)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    bump();
  };

  return (
    <div className="modal-live-section">
      {!qrFailed && (
        <div className="qr-frame">
          <img className="modal-live-qr" alt={T.live.qrAlt} src={qrSrc} onError={() => setQrFailed(true)} />
        </div>
      )}
      <label>{T.live.linkLabel}</label>
      <div className="modal-relay-row">
        <input type="text" readOnly value={joinUrl} />
        <button className={'btn-copy-relay' + (copied ? ' copied' : '')} onClick={copyLink}>
          {copied ? T.live.copiedLink : T.live.copyLink}
        </button>
      </div>
      <p className="modal-live-participants">{T.live.participants(state.personas.length)}</p>
      {ok && <p className="modal-live-hint">{T.live.balancedNote}</p>}
      <button className="btn-close-live" onClick={confirmCloseLive}>{T.live.closeSessionButton}</button>
    </div>
  );
}

export default function ShareModal() {
  const state = useBillState();
  const { shareModalOpen, setShareModalOpen } = useModalOpen();
  const { bump } = useUsageCounter();
  const [copiedTotals, setCopiedTotals] = useState(false);
  const [copied, setCopied] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const total = parseAmount(state.total, state.currency) || 0;
  const results = useMemo(() => computeResults(state), [state]);
  const sum = results.reduce((s, r) => s + r.amount, 0);
  const ok = total > 0 && Math.abs(sum - total) < 1;

  const totalsText = useMemo(() => buildTotalsText(results, state.currency), [results, state.currency]);
  const text = useMemo(() => buildExportText(state, results, total, ok), [state, results, total, ok]);

  const copyTotals = () => {
    navigator.clipboard.writeText(totalsText).then(() => {
      setCopiedTotals(true);
      setTimeout(() => setCopiedTotals(false), 2000);
    });
    bump();
  };

  const copyDetail = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    bump();
  };

  return (
    <div className={'modal-overlay' + (shareModalOpen ? ' show' : '')} onClick={e => { if (e.target === e.currentTarget) setShareModalOpen(false); }}>
      <div className="modal">
        <div className="modal-handle"></div>
        <div className="modal-header">
          <h3>{T.modal.title}</h3>
          <button className="modal-close" onClick={() => setShareModalOpen(false)} title={T.modal.closeTitle}>✕</button>
        </div>

        <LiveSessionPanel ok={ok} />

        {results.length > 0 && (
          <div className="receipt-card">
            <div className="receipt-title">{T.modal.totalsTitle}</div>
            {results.map(r => (
              <div className="receipt-row" key={r.id}>
                <span className="receipt-name">{r.name}</span>
                <span className="receipt-fill"></span>
                <span className="receipt-amount">{fmt(r.amount, state.currency)}</span>
              </div>
            ))}
            <button className="btn-copy" onClick={copyTotals}>
              {copiedTotals ? T.modal.copied : T.modal.copy}
            </button>
          </div>
        )}

        <details className="modal-detail-toggle" open={detailOpen} onToggle={e => setDetailOpen(e.target.open)}>
          <summary>{T.modal.detailSummary}</summary>
          <textarea readOnly value={text} />
          <button className="btn-copy" onClick={copyDetail}>
            {copied ? T.modal.copied : T.modal.copy}
          </button>
        </details>
      </div>
    </div>
  );
}

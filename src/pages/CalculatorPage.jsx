import { useEffect, useMemo, useState } from 'react';
import { useBillState } from '../context/BillContext';
import { useModalOpen } from '../context/ModalOpenContext';
import { useAppBootstrap } from '../hooks/useAppBootstrap';
import { computeResults, sharedTotalConPct } from '../lib/bill';
import { parseAmount } from '../lib/currency';
import PageLoader from '../components/PageLoader';
import UsageRow from '../components/UsageRow';
import LiveIndicator from '../components/LiveIndicator';
import TopBar from '../components/TopBar';
import LockBanner from '../components/LockBanner';
import SharedCard from '../components/SharedCard';
import PersonasList from '../components/PersonasList';
import Summary from '../components/Summary';
import ShareModal from '../components/ShareModal';
import InfoModal from '../components/InfoModal';
import InstallBanner from '../components/InstallBanner';
import ConnectionBanner from '../components/ConnectionBanner';
import { T } from '../i18n/es';
import { useLiveSyncContext } from '../context/LiveSyncContext';

export default function CalculatorPage() {
  const loading = useAppBootstrap();
  const state = useBillState();
  const { setShareModalOpen } = useModalOpen();
  const { showConnectionBanner } = useLiveSyncContext();
  const [manualUnlocked, setManualUnlocked] = useState(false);
  const [prevOk, setPrevOk] = useState(false);

  useEffect(() => { document.title = T.pageTitle; }, []);

  const total = parseAmount(state.total, state.currency) || 0;
  const n = state.personas.length;
  const sharedAmt = sharedTotalConPct(state);
  const sharedPP = n > 0 ? sharedAmt / n : 0;
  const results = useMemo(() => computeResults(state, total, sharedPP), [state, total, sharedPP]);
  const sum = results.reduce((s, r) => s + r.amount, 0);
  const ok = total > 0 && Math.abs(sum - total) < 1;

  // si deja de cuadrar, se resetea el desbloqueo manual (ajustado durante el
  // render, no en un efecto, para no disparar una vuelta extra de renders)
  if (ok !== prevOk) {
    setPrevOk(ok);
    if (!ok) setManualUnlocked(false);
  }

  const locked = ok && !manualUnlocked;
  const notCreated = !state.created && state.mode === 'solo';

  const mainCardClass = [
    'main-card',
    locked ? 'locked' : '',
    state.mode === 'guest' ? 'guest-mode' : '',
    state.mode !== 'solo' ? 'live-mode' : '',
    notCreated ? 'not-created' : ''
  ].filter(Boolean).join(' ');

  return (
    <>
      <PageLoader hide={!loading} />

      <h1><span className="emoji">{T.header.emoji}</span> <span>{T.header.title}</span></h1>
      <UsageRow />

      <div className={mainCardClass}>
        <LiveIndicator />
        <TopBar onShare={() => setShareModalOpen(true)} />
        <LockBanner show={locked} onUnlock={() => setManualUnlocked(true)} />
        <SharedCard />
        <PersonasList results={results} />
        <Summary results={results} total={total} sharedPP={sharedPP} sharedAmt={sharedAmt} />
      </div>

      <ConnectionBanner show={showConnectionBanner} />
      <InstallBanner />
      <ShareModal />
      <InfoModal />
    </>
  );
}

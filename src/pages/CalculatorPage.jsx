import { useEffect, useMemo } from 'react';
import { useBillState } from '../context/BillContext';
import { useModalOpen } from '../context/ModalOpenContext';
import { useBillActions } from '../hooks/useBillActions';
import { useAppBootstrap } from '../hooks/useAppBootstrap';
import { computeResults } from '../lib/bill';
import { parseAmount } from '../lib/currency';
import PageLoader from '../components/PageLoader';
import UsageRow from '../components/UsageRow';
import LiveIndicator from '../components/LiveIndicator';
import TopBar from '../components/TopBar';
import SharedCard from '../components/SharedCard';
import PersonasList from '../components/PersonasList';
import Summary from '../components/Summary';
import ShareModal from '../components/ShareModal';
import InfoModal from '../components/InfoModal';
import InstallBanner from '../components/InstallBanner';
import ConnectionBanner from '../components/ConnectionBanner';
import Footer from '../components/Footer';
import { T } from '../i18n/es';
import { useLiveSyncContext } from '../context/LiveSyncContext';

export default function CalculatorPage() {
  const loading = useAppBootstrap();
  const state = useBillState();
  const { resetAll } = useBillActions();
  const { setShareModalOpen } = useModalOpen();
  const { showConnectionBanner } = useLiveSyncContext();

  useEffect(() => { document.title = T.pageTitle; }, []);

  const total = parseAmount(state.total, state.currency) || 0;
  const results = useMemo(() => computeResults(state), [state]);

  const notCreated = !state.created && state.mode === 'solo';

  const mainCardClass = [
    'main-card',
    state.mode === 'guest' ? 'guest-mode' : '',
    state.mode !== 'solo' ? 'live-mode' : '',
    notCreated ? 'not-created' : ''
  ].filter(Boolean).join(' ');

  const showClearAll = state.created && state.mode === 'solo';

  return (
    <>
      <PageLoader hide={!loading} />

      <h1><span className="emoji">{T.header.emoji}</span> <span>{T.header.title}</span></h1>
      <UsageRow />

      <div className={mainCardClass}>
        <LiveIndicator />
        <TopBar onShare={() => setShareModalOpen(true)} />
        <SharedCard />
        <PersonasList results={results} />
        <Summary results={results} total={total} />
      </div>

      {showClearAll && (
        <button className="btn-clear-all" onClick={resetAll} title={T.topbar.resetTitle}>
          {T.topbar.resetButton}
        </button>
      )}

      <Footer />

      <ConnectionBanner show={showConnectionBanner} />
      <InstallBanner />
      <ShareModal />
      <InfoModal />
    </>
  );
}

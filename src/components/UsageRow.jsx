import { Link } from 'react-router-dom';
import { useBillState } from '../context/BillContext';
import { useBillActions } from '../hooks/useBillActions';
import { useUsageCounter } from '../hooks/useUsageCounter';
import { useModalOpen } from '../context/ModalOpenContext';
import { useInfoHint } from '../hooks/useInfoHint';
import { T } from '../i18n/es';

export default function UsageRow() {
  const state = useBillState();
  const { createAccount } = useBillActions();
  const { text, show } = useUsageCounter();
  const { setInfoModalOpen } = useModalOpen();
  const { show: showInfoHint, dismiss: dismissInfoHint } = useInfoHint();

  const showCreateBtn = !state.created && state.mode === 'solo';

  const openInfo = () => {
    dismissInfoHint();
    setInfoModalOpen(true);
  };

  return (
    <div className="usage-row">
      <span className={'usage-badge' + (show ? ' show' : '')}>{text}</span>
      {showCreateBtn && (
        <button className="btn-crear-cuenta" onClick={createAccount} title={T.topbar.createAccountTitle}>
          {T.topbar.createAccount}
        </button>
      )}
      <Link className="btn-share-friends" to="/compartir" title={T.topbar.shareFriendsTitle}>
        {T.topbar.shareFriends}
      </Link>
      <button className="btn-info" onClick={openInfo} title={T.info.buttonTitle}>ⓘ</button>
      {showInfoHint && (
        <div className="info-hint-bubble" onClick={openInfo}>
          {T.info.hint}
          <button
            className="info-hint-dismiss"
            onClick={e => { e.stopPropagation(); dismissInfoHint(); }}
            title={T.modal.closeTitle}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

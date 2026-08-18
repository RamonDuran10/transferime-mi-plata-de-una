import { Link } from 'react-router-dom';
import { useBillState } from '../context/BillContext';
import { useBillActions } from '../hooks/useBillActions';
import { useUsageCounter } from '../hooks/useUsageCounter';
import { T } from '../i18n/es';

export default function UsageRow() {
  const state = useBillState();
  const { createAccount } = useBillActions();
  const { text, show } = useUsageCounter();

  const showCreateBtn = !state.created && state.mode === 'solo';

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
    </div>
  );
}

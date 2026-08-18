import { useInstallBanner } from '../hooks/useInstallBanner';
import { T } from '../i18n/es';

export default function InstallBanner() {
  const { visible, message, showAction, install, dismiss } = useInstallBanner();

  return (
    <div className={'install-banner' + (visible ? ' show' : '')}>
      <span>{message}</span>
      <div className="install-banner-actions">
        {showAction && (
          <button className="btn-install-action" onClick={install}>{T.install.androidButton}</button>
        )}
        <button className="btn-install-dismiss" onClick={dismiss} title={T.install.dismissTitle}>✕</button>
      </div>
    </div>
  );
}

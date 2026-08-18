import { T } from '../i18n/es';

export default function LockBanner({ show, onUnlock }) {
  if (!show) return null;
  return (
    <div className="lock-banner">
      <span>{T.lock.banner}</span>
      <button className="btn-unlock" onClick={onUnlock} title={T.lock.editTitle}>{T.lock.edit}</button>
    </div>
  );
}

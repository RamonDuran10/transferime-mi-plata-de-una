import { T } from '../i18n/es';

export default function ConnectionBanner({ show }) {
  return (
    <div className={'install-banner' + (show ? ' show' : '')}>
      <span>{T.live.offlineBanner}</span>
    </div>
  );
}

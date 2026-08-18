import { T } from '../i18n/es';

export default function PageLoader({ hide }) {
  return (
    <div className={'page-loader' + (hide ? ' hide' : '')}>
      <div className="page-loader-spinner"></div>
      <span>{T.pageLoader}</span>
    </div>
  );
}

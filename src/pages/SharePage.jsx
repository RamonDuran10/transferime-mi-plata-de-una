import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { T } from '../i18n/es';
import './SharePage.css';

export default function SharePage() {
  const [copied, setCopied] = useState(false);

  useEffect(() => { document.title = T.share.pageTitle; }, []);

  const copyLink = () => {
    const url = 'https://' + T.share.url + '/';
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="share-page">
      <div className="card-wrap">
        <div className="ribbon">{T.share.ribbon}</div>
        <div className="card">
          <h1>{T.share.title}</h1>
          <p className="subtitle">{T.share.subtitle}</p>

          <div className="qr-frame">
            <img src="/qr-share.png" alt={T.share.qrAlt} />
          </div>

          <div className="url-box">
            <span>{T.share.url}</span>
            <button className={'btn-copy-link' + (copied ? ' copied' : '')} onClick={copyLink} title={T.share.copyTitle}>
              {copied ? T.share.copied : T.share.copy}
            </button>
          </div>

          <hr className="divider" />

          <div className="pills">
            <span className="pill green">{T.share.pillFree}</span>
            <span className="pill blue">{T.share.pillNoAccount}</span>
            <span className="pill orange">{T.share.pillFast}</span>
          </div>

          <Link className="back" to="/" title={T.share.backTitle}>{T.share.back}</Link>
        </div>
      </div>

      <p className="tagline">{T.share.tagline}</p>
    </div>
  );
}

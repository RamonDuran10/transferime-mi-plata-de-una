import { T } from '../i18n/es';
import { version } from '../../package.json';

export default function Footer() {
  return (
    <footer className="app-footer">
      <img src="/mister-x-transparent.png" alt="" />
      <span>{T.footer.credit} <span className="app-footer-version">v{version}</span></span>
    </footer>
  );
}

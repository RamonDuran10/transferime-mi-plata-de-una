import { T } from '../i18n/es';

export default function Footer() {
  return (
    <footer className="app-footer">
      <img src="/mister-x-transparent.png" alt="" />
      <span>{T.footer.credit}</span>
    </footer>
  );
}

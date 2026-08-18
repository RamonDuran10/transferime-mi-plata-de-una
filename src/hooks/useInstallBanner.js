import { useEffect, useRef, useState } from 'react';
import { T } from '../i18n/es';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export function useInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [showAction, setShowAction] = useState(false);
  const deferredPrompt = useRef(null);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem('installBannerDismissed')) return;

    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    if (!isIOS && !isAndroid) return;

    let timer;
    if (isIOS) {
      timer = setTimeout(() => {
        if (isStandalone() || localStorage.getItem('installBannerDismissed')) return;
        setMessage(T.install.iosMessage);
        setShowAction(false);
        setVisible(true);
      }, 2000);
    } else if (isAndroid) {
      const handler = (e) => {
        e.preventDefault();
        deferredPrompt.current = e;
        if (localStorage.getItem('installBannerDismissed')) return;
        setMessage(T.install.androidMessage);
        setShowAction(true);
        setVisible(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, []);

  const install = () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    deferredPrompt.current.userChoice.finally(() => {
      deferredPrompt.current = null;
      dismiss();
    });
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('installBannerDismissed', '1');
  };

  return { visible, message, showAction, install, dismiss };
}

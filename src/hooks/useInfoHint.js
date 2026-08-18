import { useState } from 'react';

const KEY = 'infoHintDismissed';

// Globo "¡Así funciona!" junto al botón de info — se muestra una sola vez
// por dispositivo, hasta que se toca el botón o el globo mismo.
export function useInfoHint() {
  const [show, setShow] = useState(() => {
    try { return !localStorage.getItem(KEY); } catch { return true; }
  });

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(KEY, '1'); } catch { /* localStorage no disponible */ }
  };

  return { show, dismiss };
}

import { useCallback, useEffect, useState } from 'react';
import { T } from '../i18n/es';

const COUNTER_NS = 'transferime-mi-plata-de-una';
const COUNTER_KEY = 'cuentas-compartidas';

export function useUsageCounter() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    fetch(`https://abacus.jasoncameron.dev/get/${COUNTER_NS}/${COUNTER_KEY}`)
      .then(r => r.json())
      .then(d => setCount(d.value))
      .catch(() => {});
  }, []);

  const bump = useCallback(() => {
    fetch(`https://abacus.jasoncameron.dev/hit/${COUNTER_NS}/${COUNTER_KEY}`)
      .then(r => r.json())
      .then(d => setCount(d.value))
      .catch(() => {});
  }, []);

  const text = count === null ? `${T.usageCounter.emoji} ${T.usageCounter.suffix(0)}` : `${T.usageCounter.emoji} ${T.usageCounter.suffix(count)}`;
  return { text, show: count !== null, bump };
}

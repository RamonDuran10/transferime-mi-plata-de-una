import { createContext, useContext } from 'react';
import { useLiveSync } from '../hooks/useLiveSync';

const LiveSyncContext = createContext(null);

export function LiveSyncProvider({ children }) {
  const value = useLiveSync();
  return <LiveSyncContext.Provider value={value}>{children}</LiveSyncContext.Provider>;
}

export function useLiveSyncContext() {
  const ctx = useContext(LiveSyncContext);
  if (!ctx) throw new Error('useLiveSyncContext must be used within LiveSyncProvider');
  return ctx;
}

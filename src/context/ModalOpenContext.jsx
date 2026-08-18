import { createContext, useContext, useState } from 'react';

const ModalOpenContext = createContext(null);

export function ModalOpenProvider({ children }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  return (
    <ModalOpenContext.Provider value={{ shareModalOpen, setShareModalOpen, infoModalOpen, setInfoModalOpen }}>
      {children}
    </ModalOpenContext.Provider>
  );
}

export function useModalOpen() {
  const ctx = useContext(ModalOpenContext);
  if (!ctx) throw new Error('useModalOpen must be used within ModalOpenProvider');
  return ctx;
}

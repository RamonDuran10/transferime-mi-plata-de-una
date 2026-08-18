import { createContext, useCallback, useContext, useState } from 'react';
import { T } from '../i18n/es';

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialogState, setDialogState] = useState(null);
  // dialogState: { title, message, okText, cancelText, showCancel, resolve } | null

  const showDialog = useCallback(({ title, message, okText, cancelText, showCancel }) => {
    return new Promise(resolve => {
      setDialogState({ title, message, okText, cancelText, showCancel, resolve });
    });
  }, []);

  const customConfirm = useCallback((message, opts = {}) =>
    showDialog({ title: T.dialog.confirmTitle, message, showCancel: true, ...opts }), [showDialog]);

  const customAlert = useCallback((message, opts = {}) =>
    showDialog({ title: T.dialog.infoTitle, message, showCancel: false, ...opts }), [showDialog]);

  const resolveDialog = useCallback((result) => {
    setDialogState(current => { current?.resolve(result); return null; });
  }, []);

  const isOpen = dialogState !== null;

  return (
    <DialogContext.Provider value={{ customConfirm, customAlert, isOpen }}>
      {children}
      <div className={'modal-overlay' + (isOpen ? ' show' : '')} id="customDialogOverlay"
        onClick={e => { if (e.target === e.currentTarget) resolveDialog(false); }}>
        <div className="modal">
          <div className="modal-handle"></div>
          <h3 className="custom-dialog-title">{dialogState?.title}</h3>
          <p className="custom-dialog-message">{dialogState?.message}</p>
          <div className="custom-dialog-actions">
            <button
              className="btn-dialog-cancel"
              style={{ display: dialogState?.showCancel ? 'inline-flex' : 'none' }}
              onClick={() => resolveDialog(false)}
            >
              {dialogState?.cancelText || T.dialog.cancel}
            </button>
            <button className="btn-dialog-ok" onClick={() => resolveDialog(true)}>
              {dialogState?.okText || T.dialog.ok}
            </button>
          </div>
        </div>
      </div>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within DialogProvider');
  return ctx;
}

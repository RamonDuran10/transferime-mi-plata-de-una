import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DialogProvider } from './context/DialogContext';
import { ToastProvider } from './context/ToastContext';
import { ModalOpenProvider } from './context/ModalOpenContext';
import { BillProvider } from './context/BillContext';
import { LiveSyncProvider } from './context/LiveSyncContext';
import CalculatorPage from './pages/CalculatorPage';
import SharePage from './pages/SharePage';
import BackgroundFigures from './components/BackgroundFigures';

function AppProviders({ children }) {
  return (
    <DialogProvider>
      <ToastProvider>
        <BillProvider>
          <ModalOpenProvider>
            <LiveSyncProvider>
              {children}
            </LiveSyncProvider>
          </ModalOpenProvider>
        </BillProvider>
      </ToastProvider>
    </DialogProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <BackgroundFigures />
      <AppProviders>
        <Routes>
          <Route path="/" element={<CalculatorPage />} />
          <Route path="/compartir" element={<SharePage />} />
        </Routes>
      </AppProviders>
    </BrowserRouter>
  );
}

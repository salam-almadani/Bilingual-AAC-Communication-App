import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AppStoreProvider } from '@/state/app-store';
import { I18nProvider } from '@/i18n';
import { AppGate } from '@/components/app-gate';
import WelcomePage from '@/pages/welcome';
import BoardPage from '@/pages/board';
import CaregiverPage from '@/pages/caregiver';
import NotFound from '@/pages/not-found';

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return (
    <AppStoreProvider>
      <I18nProvider>
        <BrowserRouter basename={base || undefined}>
          <AppGate>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/board" element={<BoardPage />} />
              <Route path="/caregiver" element={<CaregiverPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppGate>
        </BrowserRouter>
        <Toaster />
      </I18nProvider>
    </AppStoreProvider>
  );
}

export default App;

import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { WatchlistProvider } from './state/watchlist';
import { AppShell } from './components/AppShell';
import { Leaderboard } from './pages/Leaderboard';
import { DirectorDetail } from './pages/DirectorDetail';
import { Watchlist } from './pages/Watchlist';
import { NotFound } from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <WatchlistProvider>
        <ScrollToTop />
        <AppShell>
          <Routes>
            <Route path="/" element={<Leaderboard />} />
            <Route path="/director/:id" element={<DirectorDetail />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell>
      </WatchlistProvider>
    </BrowserRouter>
  );
}

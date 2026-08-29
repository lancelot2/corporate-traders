import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

// Purely local "Watch" affordance. It's UI state, not a real feature: it lives
// in memory for the session and resets on refresh. No money, no persistence.
interface WatchlistValue {
  isWatched: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
}

const WatchlistContext = createContext<WatchlistValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watched, setWatched] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((id: string) => {
    setWatched((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const value = useMemo<WatchlistValue>(
    () => ({
      isWatched: (id) => watched.has(id),
      toggle,
      count: watched.size,
    }),
    [watched, toggle],
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist(): WatchlistValue {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within a WatchlistProvider');
  return ctx;
}

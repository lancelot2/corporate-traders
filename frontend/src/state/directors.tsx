import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchDirectors, type Director } from '../data/directors';

export type DirectorsState =
  | { status: 'loading' }
  | { status: 'error'; error: Error; refetch: () => void }
  | { status: 'ready'; directors: Director[] };

const DirectorsContext = createContext<DirectorsState | null>(null);

export function DirectorsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DirectorsState>({ status: 'loading' });
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => (prev.status === 'ready' ? prev : { status: 'loading' }));

    fetchDirectors()
      .then((directors) => {
        if (!cancelled) setState({ status: 'ready', directors });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            error: error instanceof Error ? error : new Error(String(error)),
            refetch,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken, refetch]);

  const value = useMemo(() => state, [state]);

  return <DirectorsContext.Provider value={value}>{children}</DirectorsContext.Provider>;
}

export function useDirectors(): DirectorsState {
  const ctx = useContext(DirectorsContext);
  if (!ctx) throw new Error('useDirectors must be used within a DirectorsProvider');
  return ctx;
}

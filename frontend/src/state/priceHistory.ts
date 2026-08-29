import { useEffect, useState } from 'react';
import { fetchPriceHistory, type PricePoint } from '../data/priceHistory';

export type PriceHistoryState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; prices: PricePoint[] };

// Scoped to a single organization (unlike useDirectors' app-wide fetch) since
// only the director detail page needs it. Errors collapse to the same
// no-chart outcome as an empty result — the price chart is a bonus on an
// otherwise-working profile page, not worth its own error UI.
// organizationId is undefined while the director itself is still loading —
// wait rather than firing a request with an empty id (Supabase 400s on that).
export function usePriceHistory(organizationId: string | undefined): PriceHistoryState {
  const [state, setState] = useState<PriceHistoryState>({ status: 'loading' });

  useEffect(() => {
    if (!organizationId) return;

    let cancelled = false;
    setState({ status: 'loading' });

    fetchPriceHistory(organizationId)
      .then((prices) => {
        if (!cancelled) setState({ status: 'ready', prices });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  return state;
}

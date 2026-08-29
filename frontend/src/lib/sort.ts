import type { Director } from '../data/directors';

// The three leaderboard modes. Each knows how to rank directors and how to
// render the dominant stat shown on every card for that mode.
export type SortMode = 'amount' | 'recent' | 'popularity';

export interface SortModeConfig {
  id: SortMode;
  label: string;
  blurb: string; // one-line description under the tabs
  value: (d: Director) => number | null; // ranking key, always sorted descending; null sorts last
}

export const SORT_MODES: SortModeConfig[] = [
  {
    id: 'amount',
    label: 'Amount',
    blurb: 'Ranked by total disclosed dollar value of tracked insider transactions.',
    value: (d) => d.totalTradeValueUsd,
  },
  {
    id: 'recent',
    label: 'Recent',
    blurb: 'Ranked by most recent disclosed trade.',
    value: (d) => new Date(d.lastTradeDate).getTime(),
  },
  {
    id: 'popularity',
    label: 'Popularity',
    blurb: 'Ranked by estimated watcher count.',
    value: (d) => d.watcherCount,
  },
];

export function getSortConfig(mode: SortMode): SortModeConfig {
  return SORT_MODES.find((m) => m.id === mode) ?? SORT_MODES[0];
}

export function rankDirectors(directors: Director[], mode: SortMode): Director[] {
  const cfg = getSortConfig(mode);
  return [...directors].sort((a, b) => {
    const va = cfg.value(a);
    const vb = cfg.value(b);
    // Undisclosed (null) values always sort last, regardless of direction —
    // "unknown" must never rank as if it were 0.
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return vb - va;
  });
}

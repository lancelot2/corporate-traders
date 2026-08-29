import type { Director } from '../data/mockDirectors';

// The three leaderboard modes. Each knows how to rank directors and how to
// render the dominant stat shown on every card for that mode.
export type SortMode = 'amount' | 'popularity' | 'performance';

export interface SortModeConfig {
  id: SortMode;
  label: string;
  blurb: string; // one-line description under the tabs
  value: (d: Director) => number; // ranking key, always sorted descending
}

export const SORT_MODES: SortModeConfig[] = [
  {
    id: 'performance',
    label: 'Performance',
    blurb: 'Ranked by raw return since each insider’s tracked trades were made.',
    value: (d) => d.absoluteReturnPct,
  },
  {
    id: 'amount',
    label: 'Amount',
    blurb: 'Ranked by total dollar value of tracked insider transactions.',
    value: (d) => d.totalTradeValueUsd,
  },
  {
    id: 'popularity',
    label: 'Popularity',
    blurb: 'Ranked by how many people are watching each insider.',
    value: (d) => d.watcherCount,
  },
];

export function getSortConfig(mode: SortMode): SortModeConfig {
  return SORT_MODES.find((m) => m.id === mode) ?? SORT_MODES[0];
}

export function rankDirectors(directors: Director[], mode: SortMode): Director[] {
  const cfg = getSortConfig(mode);
  return [...directors].sort((a, b) => cfg.value(b) - cfg.value(a));
}

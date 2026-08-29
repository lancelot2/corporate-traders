import { Link } from 'react-router-dom';
import type { Director } from '../data/mockDirectors';
import type { SortMode } from '../lib/sort';
import { formatCount, formatUsdCompact } from '../lib/format';
import { Avatar } from './Avatar';
import { ReturnValue } from './ReturnValue';

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-ink-faint" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M6 3.5L10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DominantStat({ director, mode }: { director: Director; mode: SortMode }) {
  if (mode === 'performance') {
    return <ReturnValue value={director.absoluteReturnPct} className="text-[0.95rem]" showCaret={false} />;
  }
  const value =
    mode === 'amount'
      ? formatUsdCompact(director.totalTradeValueUsd)
      : `${formatCount(director.watcherCount)} watching`;
  return <div className="tnum text-[0.95rem] font-semibold text-ink">{value}</div>;
}

// A clean, tappable list row in the app's style: rank, circular avatar,
// category label over a bold name, the active-mode stat, and a chevron.
export function DirectorRow({
  director,
  rank,
  mode,
}: {
  director: Director;
  rank: number;
  mode: SortMode;
}) {
  return (
    <Link
      to={`/director/${director.id}`}
      className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-surface-2/70 focus-visible:outline-none focus-visible:bg-surface-2"
    >
      <span className="tnum w-5 shrink-0 text-center text-[0.8rem] font-medium text-ink-faint">{rank}</span>
      <Avatar
        name={director.name}
        seed={director.id}
        size="sm"
        company={director.company}
        ticker={director.ticker}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[0.78rem] font-medium text-ink-soft">{director.title}</div>
        <div className="truncate text-[1.02rem] font-semibold leading-tight text-ink">
          {director.name}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <DominantStat director={director} mode={mode} />
      </div>
      <Chevron />
    </Link>
  );
}

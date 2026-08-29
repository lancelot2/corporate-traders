import { formatCount, formatInt } from '../lib/format';

// There is no real "watchers" data — this is a seeded-random estimate (see
// data/directors.ts). Always render through this component so the "Est."
// tag stays attached; never print watcherCount as a bare number.
export function WatcherCount({
  count,
  className = '',
  hideLabelOnMobile = false,
}: {
  count: number;
  className?: string;
  hideLabelOnMobile?: boolean;
}) {
  return (
    <span
      className={`tnum inline-flex items-baseline gap-1 ${className}`}
      title={`${formatInt(count)} estimated watchers — a simulated figure, not a measured count`}
    >
      <span className="font-semibold text-ink">{formatCount(count)}</span>
      <span className="rounded-sm bg-surface-2 px-1 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-ink-faint">
        Est.
      </span>
      <span className={hideLabelOnMobile ? 'hidden text-ink-soft sm:inline' : 'text-ink-soft'}>watching</span>
    </span>
  );
}

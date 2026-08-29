// Display formatting helpers. Every figure that lands in a list or table is
// rendered through these so signs, decimals, and separators stay consistent.

export function formatUsdCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}

// Trade values are frequently undisclosed in the source filings (missing
// price/total on a majority of real trades) — that must render distinctly
// from an actual $0, never coerced to it.
export function formatTradeValue(value: number | null): string {
  return value == null ? 'Not disclosed' : formatUsdCompact(value);
}

export function formatUsd(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${value}`;
}

export function formatInt(value: number): string {
  return value.toLocaleString('en-US');
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatMonthYear(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

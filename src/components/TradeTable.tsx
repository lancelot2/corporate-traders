import { useMemo, useState } from 'react';
import type { Trade } from '../data/mockDirectors';
import { formatDateShort, formatInt, formatUsd } from '../lib/format';
import { ReturnValue } from './ReturnValue';

function TypeBadge({ type }: { type: Trade['type'] }) {
  const isBuy = type === 'buy';
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[0.72rem] font-semibold ${
        isBuy ? 'bg-gain-tint text-gain' : 'bg-surface-2 text-ink-soft'
      }`}
    >
      {isBuy ? 'Buy' : 'Sell'}
    </span>
  );
}

export function TradeTable({ trades }: { trades: Trade[] }) {
  const [desc, setDesc] = useState(true);

  const sorted = useMemo(() => {
    const arr = [...trades].sort((a, b) => a.date.localeCompare(b.date));
    return desc ? arr.reverse() : arr;
  }, [trades, desc]);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[24.5rem] border-collapse text-[0.85rem]">
          <thead>
            <tr className="border-b border-line text-left text-[0.72rem] font-medium text-ink-faint">
              <th className="px-2.5 py-3">
                <button
                  type="button"
                  onClick={() => setDesc((d) => !d)}
                  className="inline-flex items-center gap-1 rounded transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
                  aria-label={`Sort by date, ${desc ? 'newest' : 'oldest'} first`}
                >
                  Date
                  <svg viewBox="0 0 10 12" className="h-3 w-2.5" fill="currentColor" aria-hidden>
                    {desc ? <path d="M5 12L1 7h8z" /> : <path d="M5 0l4 5H1z" />}
                  </svg>
                </button>
              </th>
              <th className="px-2.5 py-3">Type</th>
              <th className="px-2.5 py-3 text-right">Shares</th>
              <th className="px-2.5 py-3 text-right">Price</th>
              <th className="px-2.5 py-3 text-right">Return</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((trade, i) => (
              <tr key={`${trade.date}-${i}`} className="border-b border-line last:border-0">
                <td className="tnum whitespace-nowrap px-2.5 py-3 text-ink-soft">{formatDateShort(trade.date)}</td>
                <td className="px-2.5 py-3">
                  <TypeBadge type={trade.type} />
                </td>
                <td className="tnum px-2.5 py-3 text-right font-medium text-ink">{formatInt(trade.shares)}</td>
                <td className="tnum px-2.5 py-3 text-right font-medium text-ink">{formatUsd(trade.price)}</td>
                <td className="px-2.5 py-3 text-right">
                  <ReturnValue value={trade.returnPct} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

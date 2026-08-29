import type { Director } from '../data/directors';
import { formatDate, formatTradeValue } from './format';
import { firstNameOf } from './names';

// Net shares still held (buys − sells, floored at 0). No live price exists
// for these companies in this dataset, so this is a share count only — never
// a dollar value.
export function netSharesHeld(d: Director): number {
  const net = d.trades.reduce((sum, t) => sum + (t.type === 'buy' ? t.shares : -t.shares), 0);
  return Math.max(0, net);
}

// A short, factual "About" blurb built strictly from real, disclosed figures
// — no return/performance claims, since none exist for this data.
export function bioFor(d: Director): string {
  const first = firstNameOf(d.name);
  const valuePhrase =
    d.totalTradeValueUsd != null
      ? `a disclosed value of ${formatTradeValue(d.totalTradeValueUsd)}`
      : 'a value that was not disclosed in the underlying filings';

  return `This profile tracks ${d.tradeCount} disclosed trade${d.tradeCount === 1 ? '' : 's'} by ${first} as ${d.title} of ${d.company}, a ${d.sector} company, from ${formatDate(d.trackingSince)} to ${formatDate(d.lastTradeDate)} — ${d.buyCount} acquisition${d.buyCount === 1 ? '' : 's'} and ${d.sellCount} disposal${d.sellCount === 1 ? '' : 's'}, totaling ${valuePhrase}.`;
}

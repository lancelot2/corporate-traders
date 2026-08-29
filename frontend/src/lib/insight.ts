import type { Director } from '../data/mockDirectors';
import { formatPercent } from './format';

export interface Holdings {
  shares: number; // net shares still held (buys − sells, floored at 0)
  price: number; // current share price
  value: number; // market value of the current position
}

// Total current holdings: what the insider still owns, valued at today's price.
export function currentHoldings(d: Director): Holdings {
  const net = d.trades.reduce((sum, t) => sum + (t.type === 'buy' ? t.shares : -t.shares), 0);
  const shares = Math.max(0, net);
  const price = d.stockPriceHistory[d.stockPriceHistory.length - 1].price;
  return { shares, price, value: Math.round(shares * price) };
}

// A short, illustrative "About" blurb generated from the (fictional) figures —
// the copy analogue of the app's tracker descriptions.
export function bioFor(d: Director): string {
  const first = d.name.split(' ')[0];

  const outcome =
    d.absoluteReturnPct >= 60
      ? `outsized returns of ${formatPercent(d.absoluteReturnPct)}`
      : d.absoluteReturnPct >= 3
        ? `gains of ${formatPercent(d.absoluteReturnPct)}`
        : d.absoluteReturnPct > -3
          ? 'a roughly flat result'
          : `a drawdown of ${formatPercent(d.absoluteReturnPct)}`;

  const timing =
    d.selfRelativeReturnPct >= 6
      ? 'a sharp sense of timing — buying dips and trimming into strength'
      : d.selfRelativeReturnPct <= -6
        ? 'trades that lagged simply holding the stock they know best'
        : 'timing roughly in line with buying and holding the stock';

  return `This portfolio mirrors ${first}'s disclosed trades as ${d.title} of ${d.company}, a ${d.sector} company tracked since first filing. Over the window the trades have produced ${outcome}, with ${timing}.`;
}

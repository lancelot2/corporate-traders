import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PricePoint } from '../data/priceHistory';
import type { TradeType } from '../lib/classifyTransaction';
import { formatInt, formatMonthYear, formatUsd } from '../lib/format';

const BUY = 'var(--buy)';
const SELL = 'var(--sell)';

// A trade plotted on the price line: its y-value is the day's close price
// (from price_history), not the trade's own recorded price — most disclosed
// trades (grants/awards) have a null or $0 price_per_share, which would
// otherwise pin the dot to the bottom of the chart.
export interface TradeMarker {
  date: string; // ISO date, must have a matching PricePoint
  type: TradeType;
  shares: number;
  price: number;
}

function PriceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PricePoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 shadow-card">
      <div className="text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">
        {formatMonthYear(point.date)}
      </div>
      <div className="tnum font-mono text-base font-medium text-ink">{formatUsd(point.price)}</div>
    </div>
  );
}

// The company's share price over the window, with the insider's buys and sells
// plotted where they happened — so you can read timing at a glance: buys in the
// troughs and sells on the peaks means they timed it well.
export function StockTradeChart({
  data,
  trades,
}: {
  data: PricePoint[];
  trades: TradeMarker[];
}) {
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.12 || 1;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 24, right: 12, bottom: 0, left: -6 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--price-line)" stopOpacity={0.16} />
              <stop offset="100%" stopColor="var(--price-line)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid-line)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatMonthYear}
            tick={{ fill: 'var(--ink-faint)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--line)' }}
            minTickGap={52}
            dy={6}
          />
          <YAxis
            domain={[Math.max(0, min - pad), max + pad]}
            tickFormatter={(v: number) => `$${Math.round(v)}`}
            tick={{ fill: 'var(--ink-faint)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={54}
          />
          <Tooltip
            content={<PriceTooltip />}
            cursor={{ stroke: 'var(--ink-faint)', strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="var(--price-line)"
            strokeWidth={1.75}
            fill="url(#priceFill)"
            activeDot={{ r: 3.5, fill: 'var(--price-line)', stroke: 'var(--surface)', strokeWidth: 2 }}
          />
          {trades.map((trade, i) => {
            const isBuy = trade.type === 'buy';
            return (
              <ReferenceDot
                key={`${trade.date}-${i}`}
                x={trade.date}
                y={trade.price}
                r={5}
                fill={isBuy ? BUY : SELL}
                stroke="var(--surface)"
                strokeWidth={2}
                label={{
                  value: `${isBuy ? '+' : '-'}${formatInt(trade.shares)}`,
                  position: isBuy ? 'bottom' : 'top',
                  fill: isBuy ? BUY : SELL,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChartLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[0.8rem] text-ink-soft">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full ring-2 ring-inset" style={{ background: BUY, boxShadow: '0 0 0 2px var(--surface)' }} />
        Buy — shares acquired
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: SELL }} />
        Sell — shares sold
      </span>
      <span className="text-ink-faint">Labels show share count at each trade.</span>
    </div>
  );
}

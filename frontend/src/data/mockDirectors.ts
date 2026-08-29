// ---------------------------------------------------------------------------
// Mock data for the Insider Index leaderboard.
//
// Everything here is fictional. Names, companies, and every number are
// invented for layout purposes — no real executives, no real trades, no API.
//
// The 15 director *profiles* below are hand-authored so the headline stats are
// deliberately divergent: the leader by Amount, by Popularity, and by
// Performance are three different people, and every sort visibly reorders the
// board. Each profile is then expanded — deterministically, via a seeded RNG so
// the data is stable across refreshes — into a smooth performance curve and a
// plausible trade history whose values reconcile with the headline amount.
//
// Headline convention: the leaderboard "Performance" score is `absoluteReturnPct`.
// The detail page additionally breaks return down into market-relative and
// self-relative figures (see the interface docs).
// ---------------------------------------------------------------------------

export interface Trade {
  date: string; // ISO date
  type: 'buy' | 'sell';
  shares: number;
  price: number; // price per share at trade time
  returnPct: number; // this trade's own resulting return, can be negative
}

export interface PerformancePoint {
  date: string; // ISO date
  cumulativeReturnPct: number;
}

export interface PricePoint {
  date: string; // ISO date
  price: number; // company share price on that date
}

export interface Director {
  id: string;
  name: string;
  title: string;
  company: string;
  ticker: string; // fictional exchange ticker for the company
  sector: string; // specific sector (shown on the detail hero)
  sectorGroup: string; // broad group used by the sector filter
  trackingSince: string; // ISO date
  totalTradeValueUsd: number; // drives "Amount" sort
  watcherCount: number; // drives "Popularity" sort
  absoluteReturnPct: number; // raw return since trades were made — headline "Performance" score
  marketRelativeReturnPct: number; // return minus the S&P 500 over the same window
  selfRelativeReturnPct: number; // return minus simply holding their own company's stock
  performanceHistory: PerformancePoint[]; // cumulative return since first tracked trade (leaderboard sparkline)
  stockPriceHistory: PricePoint[]; // the company's share price over the window (detail chart)
  trades: Trade[]; // each sits on the price path — the detail chart's entry/exit markers
}

// ---------------------------------------------------------------------------
// Authored profiles
// ---------------------------------------------------------------------------

interface Profile {
  id: string;
  name: string;
  title: string;
  company: string;
  sector: string;
  trackingSince: string;
  totalTradeValueUsd: number;
  watcherCount: number;
  absoluteReturnPct: number;
  marketRelativeReturnPct: number;
  selfRelativeReturnPct: number;
  basePrice: number; // rough share price for the trade table
  tradeCount: number;
}

const profiles: Profile[] = [
  {
    id: 'elena-cho',
    name: 'Elena Cho',
    title: 'Chief Financial Officer',
    company: 'Meridian Semiconductor',
    sector: 'Semiconductors',
    trackingSince: '2022-03-15',
    totalTradeValueUsd: 4_800_000,
    watcherCount: 31_200,
    absoluteReturnPct: 142.4,
    marketRelativeReturnPct: 71.2,
    selfRelativeReturnPct: 18.6,
    basePrice: 96,
    tradeCount: 7,
  },
  {
    id: 'marcus-feldt',
    name: 'Marcus Feldt',
    title: 'Chief Executive Officer',
    company: 'Arlington Grid Systems',
    sector: 'Utilities',
    trackingSince: '2021-06-02',
    totalTradeValueUsd: 12_600_000,
    watcherCount: 18_700,
    absoluteReturnPct: 9.8,
    marketRelativeReturnPct: -22.4,
    selfRelativeReturnPct: -4.1,
    basePrice: 61,
    tradeCount: 8,
  },
  {
    id: 'priya-nadari',
    name: 'Priya Nadari',
    title: 'Board Director',
    company: 'Solene Bio',
    sector: 'Biotechnology',
    trackingSince: '2023-01-20',
    totalTradeValueUsd: 1_200_000,
    watcherCount: 9_400,
    absoluteReturnPct: 187.5,
    marketRelativeReturnPct: 120.3,
    selfRelativeReturnPct: 42.0,
    basePrice: 28,
    tradeCount: 6,
  },
  {
    id: 'devon-ashcroft',
    name: 'Devon Ashcroft',
    title: 'Chief Executive Officer',
    company: 'Nimbus Freight',
    sector: 'Logistics',
    trackingSince: '2020-11-10',
    totalTradeValueUsd: 6_300_000,
    watcherCount: 22_100,
    absoluteReturnPct: -31.2,
    marketRelativeReturnPct: -58.9,
    selfRelativeReturnPct: -12.4,
    basePrice: 74,
    tradeCount: 7,
  },
  {
    id: 'hana-voss',
    name: 'Hana Voss',
    title: 'Chief Financial Officer',
    company: 'Cobalt & Vane',
    sector: 'Consumer Retail',
    trackingSince: '2022-08-05',
    totalTradeValueUsd: 2_100_000,
    watcherCount: 6_100,
    absoluteReturnPct: 54.7,
    marketRelativeReturnPct: 12.1,
    selfRelativeReturnPct: 9.3,
    basePrice: 45,
    tradeCount: 6,
  },
  {
    id: 'theo-marchetti',
    name: 'Theo Marchetti',
    title: 'Chair of the Board',
    company: 'Halcyon Grid',
    sector: 'Energy',
    trackingSince: '2019-04-18',
    totalTradeValueUsd: 9_400_000,
    watcherCount: 40_300,
    absoluteReturnPct: 76.3,
    marketRelativeReturnPct: 8.4,
    selfRelativeReturnPct: -3.2,
    basePrice: 112,
    tradeCount: 9,
  },
  {
    id: 'sabine-okonkwo',
    name: 'Sabine Okonkwo',
    title: 'Chief Executive Officer',
    company: 'Lumen Diagnostics',
    sector: 'Healthcare',
    trackingSince: '2023-05-11',
    totalTradeValueUsd: 780_000,
    watcherCount: 4_200,
    absoluteReturnPct: 38.9,
    marketRelativeReturnPct: 15.6,
    selfRelativeReturnPct: 21.7,
    basePrice: 33,
    tradeCount: 5,
  },
  {
    id: 'grant-halloway',
    name: 'Grant Halloway',
    title: 'Board Director',
    company: 'Ironwood Capital',
    sector: 'Financials',
    trackingSince: '2021-09-30',
    totalTradeValueUsd: 3_700_000,
    watcherCount: 2_900,
    absoluteReturnPct: 2.3,
    marketRelativeReturnPct: -19.8,
    selfRelativeReturnPct: -1.1,
    basePrice: 88,
    tradeCount: 6,
  },
  {
    id: 'mira-solberg',
    name: 'Mira Solberg',
    title: 'Chief Financial Officer',
    company: 'Northwind Aerospace',
    sector: 'Aerospace',
    trackingSince: '2022-01-14',
    totalTradeValueUsd: 5_600_000,
    watcherCount: 15_200,
    absoluteReturnPct: 91.2,
    marketRelativeReturnPct: 33.5,
    selfRelativeReturnPct: 11.8,
    basePrice: 129,
    tradeCount: 7,
  },
  {
    id: 'julian-reyes',
    name: 'Julian Reyes',
    title: 'Chief Executive Officer',
    company: 'Vantage Robotics',
    sector: 'Industrial Robotics',
    trackingSince: '2020-07-22',
    totalTradeValueUsd: 7_900_000,
    watcherCount: 27_600,
    absoluteReturnPct: 118.6,
    marketRelativeReturnPct: 47.9,
    selfRelativeReturnPct: 6.4,
    basePrice: 154,
    tradeCount: 8,
  },
  {
    id: 'adaeze-bello',
    name: 'Adaeze Bello',
    title: 'Board Director',
    company: 'Saffron Payments',
    sector: 'Fintech',
    trackingSince: '2023-09-03',
    totalTradeValueUsd: 950_000,
    watcherCount: 3_350,
    absoluteReturnPct: -14.7,
    marketRelativeReturnPct: -29.1,
    selfRelativeReturnPct: -8.9,
    basePrice: 39,
    tradeCount: 5,
  },
  {
    id: 'roland-fitch',
    name: 'Roland Fitch',
    title: 'Chief Executive Officer',
    company: 'Granite Point Energy',
    sector: 'Oil & Gas',
    trackingSince: '2021-02-08',
    totalTradeValueUsd: 14_200_000,
    watcherCount: 11_800,
    absoluteReturnPct: 63.4,
    marketRelativeReturnPct: 5.2,
    selfRelativeReturnPct: -14.3,
    basePrice: 71,
    tradeCount: 9,
  },
  {
    id: 'naomi-sorensen',
    name: 'Naomi Sorensen',
    title: 'Chief Financial Officer',
    company: 'Halewood Materials',
    sector: 'Materials',
    trackingSince: '2022-11-19',
    totalTradeValueUsd: 1_800_000,
    watcherCount: 5_600,
    absoluteReturnPct: -6.8,
    marketRelativeReturnPct: -21.3,
    selfRelativeReturnPct: 4.6, // sold ahead of a company that fell further
    basePrice: 52,
    tradeCount: 6,
  },
  {
    id: 'caleb-whitfield',
    name: 'Caleb Whitfield',
    title: 'Chair of the Board',
    company: 'Pinnacle Media',
    sector: 'Media',
    trackingSince: '2020-03-05',
    totalTradeValueUsd: 4_100_000,
    watcherCount: 48_900,
    absoluteReturnPct: 27.1,
    marketRelativeReturnPct: -3.8,
    selfRelativeReturnPct: 2.9,
    basePrice: 64,
    tradeCount: 8,
  },
  {
    id: 'wren-delacroix',
    name: 'Wren Delacroix',
    title: 'Chief Executive Officer',
    company: 'Azure Loom Textiles',
    sector: 'Consumer Goods',
    trackingSince: '2021-12-01',
    totalTradeValueUsd: 2_900_000,
    watcherCount: 8_700,
    absoluteReturnPct: 45.9,
    marketRelativeReturnPct: -1.2,
    selfRelativeReturnPct: 7.4,
    basePrice: 41,
    tradeCount: 7,
  },
];

// ---------------------------------------------------------------------------
// Deterministic synthesis
// ---------------------------------------------------------------------------

const NOW = new Date('2026-08-27T00:00:00Z');

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;
const isoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);

function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

function buildHistory(p: Profile): PerformancePoint[] {
  const rng = mulberry32(hash(p.id + ':history'));
  const start = new Date(p.trackingSince);
  const months = Math.max(monthsBetween(start, NOW), 6);
  const n = Math.min(28, Math.max(12, Math.round(months / 2) + 1));
  const final = p.absoluteReturnPct;
  const amp = Math.abs(final) * 0.3 + 11;
  const waveFreq = 2 + rng() * 2.5;
  const wavePhase = rng() * Math.PI * 2;

  const points: PerformancePoint[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const dateMs = start.getTime() + (NOW.getTime() - start.getTime()) * t;
    // trend: slight ease so the run doesn't look perfectly linear
    const trend = final * Math.pow(t, 0.88);
    // envelope keeps both endpoints clean (0 at start, exact `final` at end)
    const envelope = Math.sin(Math.PI * t);
    const noise = (rng() * 2 - 1) * amp * envelope * 0.55;
    const wave = Math.sin(t * Math.PI * waveFreq + wavePhase) * amp * 0.5 * envelope;
    let value = trend + noise + wave;
    if (i === 0) value = 0;
    if (i === n - 1) value = final;
    points.push({ date: isoDate(dateMs), cumulativeReturnPct: round1(value) });
  }
  return points;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// The company's own share-price path over the tracking window. Its total move is
// the insider's return net of their timing edge: stock ≈ absolute − self-relative
// (self-relative is exactly "return beyond buy-and-holding the stock"). The walk
// is a re-centered sum of log-returns plus a low-frequency wave, so it wanders
// through peaks and troughs yet lands exactly on the implied end price.
function buildStockHistory(p: Profile): PricePoint[] {
  const rng = mulberry32(hash(p.id + ':price'));
  const start = new Date(p.trackingSince);
  const months = Math.max(monthsBetween(start, NOW), 6);
  const n = clamp(Math.round(months * 4.3), 40, 180); // ~weekly cadence

  const startPrice = p.basePrice;
  const stockReturn = (p.absoluteReturnPct - p.selfRelativeReturnPct) / 100;
  const endPrice = Math.max(3, startPrice * (1 + stockReturn));
  const targetLog = Math.log(endPrice / startPrice);

  const cycles = 1.3 + rng() * 1.8;
  const phase = rng() * Math.PI * 2;
  const vol = 0.05 + rng() * 0.03;
  const waveAmp = 0.02 + rng() * 0.025;

  const steps: number[] = [];
  for (let i = 1; i < n; i++) {
    const t = i / (n - 1);
    const noise = (rng() * 2 - 1) * vol;
    const wave = Math.sin(t * Math.PI * 2 * cycles + phase) * waveAmp;
    steps.push(noise + wave);
  }
  const drift = (targetLog - steps.reduce((s, x) => s + x, 0)) / steps.length;

  const history: PricePoint[] = [{ date: p.trackingSince, price: round2(startPrice) }];
  let logPrice = Math.log(startPrice);
  for (let i = 0; i < steps.length; i++) {
    logPrice += steps[i] + drift;
    const t = (i + 1) / (n - 1);
    const dateMs = start.getTime() + (NOW.getTime() - start.getTime()) * t;
    history.push({ date: isoDate(dateMs), price: round2(Math.exp(logPrice)) });
  }
  return history;
}

// Place each trade directly on the price path, snapped to a nearby local extreme.
// A skilled timer (positive self-relative) buys dips and sells peaks; a poor one
// does the opposite — which is exactly what the entry/exit chart should reveal.
function buildTrades(p: Profile, history: PricePoint[]): Trade[] {
  const rng = mulberry32(hash(p.id + ':trades'));
  const prices = history.map((h) => h.price);
  const n = prices.length;
  const endPrice = prices[n - 1];
  const goodTimer = p.selfRelativeReturnPct >= 0;

  const weights = Array.from({ length: p.tradeCount }, () => 0.4 + rng());
  const weightSum = weights.reduce((s, w) => s + w, 0);

  const lo = Math.floor(n * 0.05);
  const hi = Math.floor(n * 0.95);
  const span = hi - lo;
  const neighborhood = Math.max(2, Math.round(n * 0.04));

  const trades: Trade[] = [];
  for (let i = 0; i < p.tradeCount; i++) {
    // spread anchors across the timeline so markers span the whole chart
    const anchor = clamp(
      lo + Math.round((span * (i + 0.5)) / p.tradeCount + (rng() * 2 - 1) * span * 0.05),
      lo,
      hi,
    );
    const type: Trade['type'] = rng() < 0.6 ? 'buy' : 'sell';
    const wantLow = type === 'buy' ? goodTimer : !goodTimer;

    let idx = anchor;
    let best = prices[anchor];
    for (let j = Math.max(lo, anchor - neighborhood); j <= Math.min(hi, anchor + neighborhood); j++) {
      if (wantLow ? prices[j] < best : prices[j] > best) {
        best = prices[j];
        idx = j;
      }
    }

    const price = prices[idx];
    const value = p.totalTradeValueUsd * (weights[i] / weightSum);
    const shares = Math.max(50, Math.round(value / price));
    // Buy: how far the stock has run since. Sell: how far above today they sold.
    const returnPct =
      type === 'buy'
        ? round1((endPrice / price - 1) * 100)
        : round1((price / endPrice - 1) * 100);
    trades.push({ date: history[idx].date, type, shares, price, returnPct });
  }

  return trades.sort((a, b) => a.date.localeCompare(b.date));
}

// Fictional ticker + broad sector group per company. The 15 specific sectors are
// bucketed into 6 groups (2–3 insiders each) so the sector filter is meaningful.
interface Meta {
  ticker: string;
  sectorGroup: string;
}

const META: Record<string, Meta> = {
  'elena-cho': { ticker: 'MRDN', sectorGroup: 'Technology' },
  'marcus-feldt': { ticker: 'ARGS', sectorGroup: 'Energy & Utilities' },
  'priya-nadari': { ticker: 'SOLN', sectorGroup: 'Healthcare' },
  'devon-ashcroft': { ticker: 'NMBS', sectorGroup: 'Industrials' },
  'hana-voss': { ticker: 'CBLT', sectorGroup: 'Consumer & Media' },
  'theo-marchetti': { ticker: 'HLCN', sectorGroup: 'Energy & Utilities' },
  'sabine-okonkwo': { ticker: 'LUMD', sectorGroup: 'Healthcare' },
  'grant-halloway': { ticker: 'IRNW', sectorGroup: 'Financials' },
  'mira-solberg': { ticker: 'NWND', sectorGroup: 'Industrials' },
  'julian-reyes': { ticker: 'VNTG', sectorGroup: 'Technology' },
  'adaeze-bello': { ticker: 'SFRN', sectorGroup: 'Financials' },
  'roland-fitch': { ticker: 'GPNE', sectorGroup: 'Energy & Utilities' },
  'naomi-sorensen': { ticker: 'HLWD', sectorGroup: 'Industrials' },
  'caleb-whitfield': { ticker: 'PNCL', sectorGroup: 'Consumer & Media' },
  'wren-delacroix': { ticker: 'AZLM', sectorGroup: 'Consumer & Media' },
};

// Stable display order for the sector filter.
export const SECTOR_GROUPS = [
  'Technology',
  'Healthcare',
  'Energy & Utilities',
  'Industrials',
  'Consumer & Media',
  'Financials',
] as const;

export const directors: Director[] = profiles.map((p) => {
  const stockPriceHistory = buildStockHistory(p);
  return {
    id: p.id,
    name: p.name,
    title: p.title,
    company: p.company,
    ticker: META[p.id].ticker,
    sector: p.sector,
    sectorGroup: META[p.id].sectorGroup,
    trackingSince: p.trackingSince,
    totalTradeValueUsd: p.totalTradeValueUsd,
    watcherCount: p.watcherCount,
    absoluteReturnPct: p.absoluteReturnPct,
    marketRelativeReturnPct: p.marketRelativeReturnPct,
    selfRelativeReturnPct: p.selfRelativeReturnPct,
    performanceHistory: buildHistory(p),
    stockPriceHistory,
    trades: buildTrades(p, stockPriceHistory),
  };
});

export function getDirector(id: string): Director | undefined {
  return directors.find((d) => d.id === id);
}

import { supabase } from '../lib/supabase';
import { classifyTransactionType, type TradeType } from '../lib/classifyTransaction';
import { normalizeFullName } from '../lib/names';
import { hash, mulberry32 } from '../lib/random';

// Every insider gets this placeholder — no role/title data exists in the
// source tables (no populated `roles` table, no title column anywhere).
export const PLACEHOLDER_TITLE = 'Executive';

export interface Trade {
  date: string; // ISO date
  type: TradeType;
  shares: number;
  pricePerShare: number | null;
  value: number | null; // disclosed dollar value; null (never 0) when undisclosed
  rawTransactionType: string;
}

export interface Director {
  id: string;
  name: string;
  title: string;
  company: string;
  ticker: string;
  sector: string;
  sectorGroup: string;
  trackingSince: string; // earliest trade date
  lastTradeDate: string; // most recent trade date
  totalTradeValueUsd: number | null; // sum of disclosed-value trades; null if none disclosed
  tradeCount: number;
  buyCount: number;
  sellCount: number;
  watcherCount: number; // seeded synthetic — always render via <WatcherCount>
  headshotUrl: string | null;
  trades: Trade[];
}

// Matches the six real `organizations.sector_group` values, in a fixed
// display order (largest group first).
export const SECTOR_GROUPS = [
  'Technology',
  'Financials',
  'Consumer & Media',
  'Healthcare',
  'Energy & Utilities',
  'Industrials',
] as const;

interface OrgRow {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  sector_group: string;
}

interface InsiderRow {
  id: string;
  full_name: string;
  headshot_generated_url: string | null;
}

interface TradeRow {
  id: string;
  insider_id: string;
  organization_id: string;
  transaction_date: string;
  transaction_type: string | null;
  shares: number;
  price_per_share: number | null;
  total_value: number | null;
}

// Plausible skewed spread (~400–50K), matching the old mock's ~2.9K–48.9K
// headline range — there is no real "watchers" concept in the data.
function estimateWatcherCount(insiderId: string): number {
  const rng = mulberry32(hash(insiderId + ':watchers'));
  const skew = rng() * rng();
  return Math.round(400 + skew * 49600);
}

function tradeValueOf(row: TradeRow): number | null {
  if (row.total_value != null) return row.total_value;
  if (row.price_per_share != null) return row.price_per_share * row.shares;
  return null;
}

export async function fetchDirectors(): Promise<Director[]> {
  const [orgsRes, insidersRes, tradesRes] = await Promise.all([
    supabase.from('organizations').select('id, name, ticker, sector, sector_group'),
    supabase.from('insiders').select('id, full_name, headshot_generated_url'),
    supabase
      .from('trades')
      .select('id, insider_id, organization_id, transaction_date, transaction_type, shares, price_per_share, total_value')
      .order('transaction_date', { ascending: true }),
  ]);

  if (orgsRes.error) throw orgsRes.error;
  if (insidersRes.error) throw insidersRes.error;
  if (tradesRes.error) throw tradesRes.error;

  const orgs = orgsRes.data as OrgRow[];
  const insiders = insidersRes.data as InsiderRow[];
  const trades = tradesRes.data as TradeRow[];

  const orgsById = new Map(orgs.map((org) => [org.id, org]));

  // Global result is ordered by transaction_date ascending, so grouping by
  // insider preserves ascending order within each group too.
  const tradesByInsider = new Map<string, TradeRow[]>();
  for (const row of trades) {
    const list = tradesByInsider.get(row.insider_id);
    if (list) list.push(row);
    else tradesByInsider.set(row.insider_id, [row]);
  }

  const directors: Director[] = [];

  for (const insider of insiders) {
    const rows = tradesByInsider.get(insider.id);
    if (!rows || rows.length === 0) continue;

    const primaryOrg = orgsById.get(rows[rows.length - 1].organization_id);
    if (!primaryOrg) continue;

    let totalTradeValueUsd: number | null = null;
    let buyCount = 0;
    let sellCount = 0;
    const mappedTrades: Trade[] = rows.map((row) => {
      const type = classifyTransactionType(row.transaction_type);
      if (type === 'buy') buyCount++;
      else sellCount++;

      const value = tradeValueOf(row);
      if (value != null) totalTradeValueUsd = (totalTradeValueUsd ?? 0) + value;

      return {
        date: row.transaction_date,
        type,
        shares: row.shares,
        pricePerShare: row.price_per_share,
        value,
        rawTransactionType: row.transaction_type ?? 'Unknown',
      };
    });

    directors.push({
      id: insider.id,
      name: normalizeFullName(insider.full_name),
      title: PLACEHOLDER_TITLE,
      company: primaryOrg.name,
      ticker: primaryOrg.ticker,
      sector: primaryOrg.sector,
      sectorGroup: primaryOrg.sector_group,
      trackingSince: mappedTrades[0].date,
      lastTradeDate: mappedTrades[mappedTrades.length - 1].date,
      totalTradeValueUsd,
      tradeCount: mappedTrades.length,
      buyCount,
      sellCount,
      watcherCount: estimateWatcherCount(insider.id),
      headshotUrl: insider.headshot_generated_url,
      trades: mappedTrades,
    });
  }

  return directors;
}

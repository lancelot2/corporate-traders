import { supabase } from '../lib/supabase';

export interface PricePoint {
  date: string; // ISO date
  price: number; // daily close
}

interface PriceHistoryRow {
  date: string;
  close: number;
}

export async function fetchPriceHistory(organizationId: string): Promise<PricePoint[]> {
  const { data, error } = await supabase
    .from('price_history')
    .select('date, close')
    .eq('organization_id', organizationId)
    .order('date', { ascending: true });

  if (error) throw error;

  return (data as PriceHistoryRow[]).map((row) => ({ date: row.date, price: row.close }));
}

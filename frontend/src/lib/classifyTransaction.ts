// Form-4 transaction_type text is free-form (23+ raw variants seen in the
// data: grants, option awards, derivative exercises/conversions, gifts, tax
// withholding, plain sales/purchases, and compound strings). We only expose a
// binary buy/sell, so classify by keyword.
const SELL_PATTERN = /sale|sell|gift|tax/i;
const BUY_PATTERN = /purchase|award|grant|exercise|conversion|option/i;

export type TradeType = 'buy' | 'sell';

// Sell must be checked first: compound strings like "Option Exercise + Sale"
// or "Sale / Conversion of derivative security" match both patterns, and the
// final disposition (a sale) is what should win.
export function classifyTransactionType(raw: string | null): TradeType {
  if (raw && SELL_PATTERN.test(raw)) return 'sell';
  if (raw && BUY_PATTERN.test(raw)) return 'buy';
  return 'sell';
}

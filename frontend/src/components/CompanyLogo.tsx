// Synthetic company mark — a colored monogram tile standing in for a brand
// logo (no logo_url is populated in the data yet). Color is derived from the
// ticker so each company reads as a distinct little logo.
const LOGO_COLORS = [
  '#5b6472', // slate — visible on both light and dark
  '#e0563a',
  '#2f7cf0',
  '#00a15a',
  '#7b57d1',
  '#d99012',
  '#0f9b9b',
  '#d13d7a',
];

function pick(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return LOGO_COLORS[h % LOGO_COLORS.length];
}

export function CompanyLogo({
  company,
  ticker,
  className = '',
}: {
  company: string;
  ticker: string;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={`${company} (${ticker})`}
      title={`${company} · ${ticker}`}
      className={`grid place-items-center font-bold uppercase leading-none text-white ${className}`}
      style={{ backgroundColor: pick(ticker) }}
    >
      {company[0]}
    </span>
  );
}

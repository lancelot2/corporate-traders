import { useMemo, useState } from 'react';
import { directors } from '../data/mockDirectors';
import { rankDirectors, type SortMode } from '../lib/sort';
import { SortPills } from '../components/SortPills';
import { SearchField } from '../components/SearchField';
import { SectorFilter, type SectorValue } from '../components/SectorFilter';
import { DirectorRow } from '../components/DirectorRow';
import { BlueCheck } from '../components/BlueCheck';
import { BottomNav } from '../components/BottomNav';

function Logo() {
  return (
    <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-btn">
      <svg viewBox="0 0 32 32" className="h-9 w-9" aria-hidden>
        <rect x="6" y="18" width="4.5" height="8" rx="1.2" fill="var(--btn-fg)" />
        <rect x="13.75" y="12" width="4.5" height="14" rx="1.2" fill="var(--btn-fg)" />
        <rect x="21.5" y="6" width="4.5" height="20" rx="1.2" fill="var(--btn-fg)" />
      </svg>
    </div>
  );
}

function ControlLabel({ children }: { children: string }) {
  return (
    <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
      {children}
    </div>
  );
}

export function Leaderboard() {
  const [mode, setMode] = useState<SortMode>('performance');
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState<SectorValue>('all');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = directors.filter((d) => {
      const inSector = sector === 'all' || d.sectorGroup === sector;
      const inQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.ticker.toLowerCase().includes(q) ||
        d.company.toLowerCase().includes(q);
      return inSector && inQuery;
    });
    return rankDirectors(filtered, mode);
  }, [query, sector, mode]);

  const isFiltered = query.trim() !== '' || sector !== 'all';

  return (
    <>
      <main className="flex-1 px-5 pb-8">
        {/* brand header */}
        <header className="flex flex-col items-center pt-10 text-center">
          <Logo />
          <div className="mt-4 flex items-center gap-1.5">
            <h1 className="text-[1.55rem] font-bold tracking-tight text-ink">Insider Index</h1>
            <BlueCheck className="h-[1.15rem] w-[1.15rem]" />
          </div>
          <p className="mt-2 max-w-[19rem] text-[0.92rem] leading-snug text-ink-soft">
            Track and copy the disclosed trades of directors, CEOs, and CFOs — ranked
            like traders.
          </p>
          <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-blue/10 px-3 py-1.5 text-[0.8rem] font-medium text-blue">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.9 10.4H7.1V7h1.8v4.4zM8 5.7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            Illustrative mock data
          </span>
        </header>

        {/* controls */}
        <div className="mt-8 space-y-4">
          <SearchField value={query} onChange={setQuery} />
          <div>
            <ControlLabel>Rank by</ControlLabel>
            <div className="no-scrollbar -mx-5 overflow-x-auto px-5">
              <SortPills active={mode} onChange={setMode} />
            </div>
          </div>
          <div>
            <ControlLabel>Sector</ControlLabel>
            <div className="no-scrollbar -mx-5 overflow-x-auto px-5">
              <SectorFilter active={sector} onChange={setSector} />
            </div>
          </div>
        </div>

        {/* count */}
        <div className="mt-6 mb-1 text-[0.82rem] font-medium text-ink-faint">
          {results.length} {results.length === 1 ? 'insider' : 'insiders'}
          {isFiltered ? ` of ${directors.length}` : ''}
        </div>

        {/* list */}
        {results.length ? (
          <ol>
            {results.map((director, i) => (
              <li
                key={director.id}
                style={{
                  animation: 'fade-rise 0.4s cubic-bezier(0.22,1,0.36,1) both',
                  animationDelay: `${Math.min(i, 12) * 28}ms`,
                }}
              >
                <DirectorRow director={director} rank={i + 1} mode={mode} />
              </li>
            ))}
          </ol>
        ) : (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-surface-2">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink-faint" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <circle cx="11" cy="11" r="6.5" />
                <path d="M20 20l-3.6-3.6" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-4 max-w-[16rem] text-[0.95rem] text-ink-soft">
              No insiders match your search.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSector('all');
              }}
              className="mt-5 rounded-full bg-surface-2 px-4 py-2 text-[0.88rem] font-semibold text-ink"
            >
              Clear filters
            </button>
          </div>
        )}

        <p className="mt-7 text-center text-[0.72rem] leading-relaxed text-ink-faint">
          Numbers for illustrative purposes only. Not actual performance data,
          not investment advice, and not a trading product.
        </p>
      </main>

      <BottomNav />
    </>
  );
}

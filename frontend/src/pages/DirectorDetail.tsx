import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDirectors } from '../state/directors';
import { formatDate, formatInt, formatTradeValue, initials } from '../lib/format';
import { heroGradient } from '../lib/tint';
import { bioFor, netSharesHeld } from '../lib/insight';
import { firstNameOf } from '../lib/names';
import { useWatchlist } from '../state/watchlist';
import { BlueCheck } from '../components/BlueCheck';
import { WatcherCount } from '../components/WatcherCount';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { TradeTable } from '../components/TradeTable';
import { NotFound } from './NotFound';

function ActivityTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface px-3 py-3.5">
      <span className="text-[0.72rem] font-medium text-ink-soft">{label}</span>
      <span className="tnum text-[1.15rem] font-semibold text-ink">{formatInt(value)}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-[1.15rem] font-bold text-ink">{children}</h2>;
}

export function DirectorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const directorsState = useDirectors();
  const { isWatched, toggle } = useWatchlist();

  const director = useMemo(() => {
    if (directorsState.status !== 'ready' || !id) return undefined;
    return directorsState.directors.find((d) => d.id === id);
  }, [directorsState, id]);

  if (directorsState.status === 'loading') return <LoadingState label="Loading profile…" />;
  if (directorsState.status === 'error') {
    return <ErrorState onRetry={directorsState.refetch} message="Couldn't load insider data." />;
  }
  if (!director) return <NotFound />;

  const watched = isWatched(director.id);
  const netShares = netSharesHeld(director);

  return (
    <>
      <main className="flex-1 pb-28">
        {/* hero */}
        <div className="px-4 pt-4">
          <div
            className="relative flex h-60 items-end overflow-hidden rounded-[1.75rem]"
            style={{ backgroundImage: heroGradient(director.id) }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-4 -top-8 select-none text-[13rem] font-bold leading-none text-white/12"
            >
              {initials(director.name)}
            </span>
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/45"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d="M10 3.5L5.5 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="absolute right-4 top-4 rounded-full bg-black/25 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
              {director.sector}
            </span>
            <div className="relative p-5">
              <h1 className="text-[2rem] font-bold leading-none tracking-tight text-white drop-shadow-sm">
                {director.name}
              </h1>
            </div>
          </div>
        </div>

        <div className="px-5">
          {/* attribution */}
          <div className="mt-4 flex items-center gap-2 text-[0.9rem]">
            <span className="text-ink-soft">
              {director.title} · {director.company}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[0.85rem] text-ink-soft">
            <span>Tracked by Insider Index</span>
            <BlueCheck className="h-4 w-4" />
          </div>

          {/* activity tiles */}
          <section className="mt-7">
            <SectionTitle>Activity</SectionTitle>
            <div className="mb-2.5 flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5">
              <div>
                <div className="text-[0.72rem] font-medium text-ink-soft">Net shares held</div>
                <div className="tnum mt-0.5 text-[1.55rem] font-bold leading-none text-ink">
                  {netShares > 0 ? `${formatInt(netShares)} sh` : 'No net position'}
                </div>
              </div>
              <div className="tnum text-right text-[0.78rem] text-ink-faint">
                {netShares > 0 ? <div>{director.ticker}</div> : <div>Disposals ≥ acquisitions</div>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <ActivityTile label="Trades" value={director.tradeCount} />
              <ActivityTile label="Buys" value={director.buyCount} />
              <ActivityTile label="Sells" value={director.sellCount} />
            </div>
            <p className="tnum mt-3 flex flex-wrap items-center gap-x-1.5 text-[0.8rem] text-ink-faint">
              <span>
                Since {formatDate(director.trackingSince)} · {formatTradeValue(director.totalTradeValueUsd)} traded ·
              </span>
              <WatcherCount count={director.watcherCount} className="text-[0.8rem]" />
            </p>
          </section>

          {/* about */}
          <section className="mt-8">
            <SectionTitle>About</SectionTitle>
            <p className="text-[0.95rem] leading-relaxed text-ink-soft">{bioFor(director)}</p>
          </section>

          {/* trade history */}
          <section className="mt-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-[1.15rem] font-bold text-ink">Trade history</h2>
              <span className="tnum text-[0.82rem] text-ink-faint">{director.trades.length} trades</span>
            </div>
            <TradeTable trades={director.trades} />
          </section>

          <p className="mt-8 text-center text-[0.72rem] leading-relaxed text-ink-faint">
            Trades and companies are real, disclosed data. The watcher count above is a
            simulated estimate, not real activity. Title is shown as a general placeholder,
            and not every trade discloses a dollar value.
          </p>
        </div>
      </main>

      {/* watch CTA — styled like the app's primary button, but local-only:
          it toggles a session watch state, it does not move money. */}
      <div className="sticky bottom-0 z-30 border-t border-line bg-app/90 px-5 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => toggle(director.id)}
          aria-pressed={watched}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[1rem] font-semibold transition-colors ${
            watched ? 'bg-surface-2 text-ink' : 'bg-btn text-btn-fg'
          }`}
        >
          {watched ? (
            <>
              <svg viewBox="0 0 20 20" className="h-[1.1rem] w-[1.1rem]" fill="currentColor" aria-hidden>
                <path d="M10 1.8l2.5 5.1 5.6.8-4.05 4 .95 5.6L10 14.6l-5 2.7.95-5.6-4.05-4 5.6-.8z" />
              </svg>
              Watching {firstNameOf(director.name)}
            </>
          ) : (
            `Watch ${firstNameOf(director.name)}`
          )}
        </button>
      </div>
    </>
  );
}

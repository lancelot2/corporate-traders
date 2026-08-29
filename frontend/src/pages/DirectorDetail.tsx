import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDirectors } from '../state/directors';
import { usePriceHistory } from '../state/priceHistory';
import { formatDate, formatInt, formatTradeValue } from '../lib/format';
import { bioFor, netSharesHeld } from '../lib/insight';
import { firstNameOf } from '../lib/names';
import { useWatchlist } from '../state/watchlist';
import { Avatar } from '../components/Avatar';
import { BlueCheck } from '../components/BlueCheck';
import { WatcherCount } from '../components/WatcherCount';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { ChartLegend, StockTradeChart, type TradeMarker } from '../components/StockTradeChart';
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

  const priceHistoryState = usePriceHistory(director?.organizationId);

  const chartTrades = useMemo((): TradeMarker[] => {
    if (!director || priceHistoryState.status !== 'ready') return [];
    const priceByDate = new Map(priceHistoryState.prices.map((p) => [p.date, p.price]));
    return director.trades
      .filter((t) => t.organizationId === director.organizationId && priceByDate.has(t.date))
      .map((t) => ({
        date: t.date,
        type: t.type,
        shares: t.shares,
        price: priceByDate.get(t.date)!,
      }));
  }, [director, priceHistoryState]);

  if (directorsState.status === 'loading') return <LoadingState label="Loading profile…" />;
  if (directorsState.status === 'error') {
    return <ErrorState onRetry={directorsState.refetch} message="Couldn't load insider data." />;
  }
  if (!director) return <NotFound />;

  const watched = isWatched(director.id);
  const netShares = netSharesHeld(director);
  const showEntriesExits = priceHistoryState.status === 'ready' && chartTrades.length > 0;

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 pb-16 pt-7 md:px-10 lg:px-14 xl:px-16">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:bg-surface-2"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M10 3.5L5.5 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(21rem,0.48fr)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
        <div className="order-2 min-w-0">
          {/* stock price with entries and exits */}
          {showEntriesExits && priceHistoryState.status === 'ready' && (
            <section>
              <SectionTitle>Entries &amp; exits</SectionTitle>
              <p className="-mt-1 mb-4 text-[0.88rem] leading-relaxed text-ink-soft">
                Each trade plotted on {director.company}’s share price. Buys in the dips and
                sells on the peaks are the signature of good timing.
              </p>
              <div className="rounded-2xl border border-line bg-surface p-4">
                <StockTradeChart data={priceHistoryState.prices} trades={chartTrades} />
                <div className="mt-3 border-t border-line pt-3">
                  <ChartLegend />
                </div>
              </div>
            </section>
          )}

          {/* about */}
          <section className={showEntriesExits ? 'mt-10' : ''}>
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

        <aside className="order-1 self-start lg:sticky lg:top-24">
          <section className="border-b border-line pb-8">
            <div className="flex items-start gap-5">
              <Avatar
                name={director.name}
                seed={director.id}
                size="xl"
                company={director.company}
                ticker={director.ticker}
                photoUrl={director.headshotUrl}
              />
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-start gap-1.5">
                  <h1 className="text-[clamp(1.8rem,2.8vw,2.85rem)] font-bold leading-[0.98] tracking-tight text-ink">
                    {director.name}
                  </h1>
                  <BlueCheck className="mt-1 h-5 w-5 shrink-0" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-1.5 text-[0.88rem] leading-relaxed">
                  <span className="text-ink-soft">{director.title} · {director.company}</span>
                  <span className="tnum text-ink-faint">
                    · {formatInt(director.tradeCount)} trades · {formatTradeValue(director.totalTradeValueUsd)} traded
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
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
              <span>Since {formatDate(director.trackingSince)} · {formatTradeValue(director.totalTradeValueUsd)} traded ·</span>
              <WatcherCount count={director.watcherCount} className="text-[0.8rem]" />
            </p>
          </section>

          <button
            type="button"
            onClick={() => toggle(director.id)}
            aria-pressed={watched}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#FED90F] px-5 py-4 text-[1rem] font-semibold text-black shadow-[3px_3px_0_#07070a] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          >
            {watched ? (
              <>
                <svg viewBox="0 0 20 20" className="h-[1.1rem] w-[1.1rem]" fill="currentColor" aria-hidden>
                  <path d="M10 1.8l2.5 5.1 5.6.8-4.05 4 .95 5.6L10 14.6l-5 2.7.95-5.6-4.05-4 5.6-.8z" />
                </svg>
                Watching {firstNameOf(director.name)}
              </>
            ) : (`Watch ${firstNameOf(director.name)}`)}
          </button>
        </aside>
      </div>
    </main>
  );
}

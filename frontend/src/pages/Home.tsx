import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { BlueCheck } from '../components/BlueCheck';
import { BottomNav } from '../components/BottomNav';
import { WatcherCount } from '../components/WatcherCount';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useDirectors } from '../state/directors';
import type { Director } from '../data/directors';
import { formatTradeValue } from '../lib/format';
import { rankDirectors } from '../lib/sort';

function Mark() {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-btn shadow-card">
      <svg viewBox="0 0 32 32" className="h-[1.35rem] w-[1.35rem]" aria-hidden>
        <rect x="6" y="18" width="4.5" height="8" rx="1.2" fill="var(--btn-fg)" />
        <rect x="13.75" y="12" width="4.5" height="14" rx="1.2" fill="var(--btn-fg)" />
        <rect x="21.5" y="6" width="4.5" height="20" rx="1.2" fill="var(--btn-fg)" />
      </svg>
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" className="h-[1.05rem] w-[1.05rem]" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M4 10h11M11 5.5 15.5 10 11 14.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StackedProfiles({ profiles, total }: { profiles: Director[]; total: number }) {
  return (
    <div className="relative mx-auto h-[28rem] w-full max-w-[31rem] sm:h-[31rem]">
      {profiles.map((director, index) => (
        <Link
          key={director.id}
          to={`/director/${director.id}`}
          className={`absolute grid w-[88%] grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-4 text-ink shadow-[0_18px_45px_-26px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-1 ${
            index === 0 ? 'left-0 top-2 z-30' : index === 1 ? 'right-0 top-[8.2rem] z-20' : 'left-0 top-[14.4rem] z-10'
          }`}
          style={{ transform: `rotate(${index === 0 ? '-3.5deg' : index === 1 ? '3.5deg' : '-1.5deg'})` }}
        >
          <Avatar
            name={director.name}
            seed={director.id}
            size="sm"
            company={director.company}
            ticker={director.ticker}
            photoUrl={director.headshotUrl}
          />
          <div className="min-w-0">
            <p className="truncate text-[0.98rem] font-bold tracking-tight">{director.name}</p>
            <p className="truncate text-[0.73rem] text-ink-soft">{director.title} · {director.company}</p>
          </div>
          <span className="tnum text-[0.92rem] font-semibold text-ink">
            {formatTradeValue(director.totalTradeValueUsd)}
          </span>
        </Link>
      ))}
      <div className="absolute bottom-0 right-0 rounded-2xl bg-btn px-5 py-4 text-btn-fg shadow-card">
        <p className="text-[0.65rem] font-medium text-white/60">Watch the moves that matter</p>
        <p className="mt-1 text-[0.95rem] font-semibold">{total} tracked profiles</p>
      </div>
    </div>
  );
}

function FeatureCard({ director }: { director: Director }) {
  return (
    <Link to={`/director/${director.id}`} className="group flex min-h-[16rem] flex-col justify-between rounded-2xl bg-surface-2 p-5 transition-colors hover:bg-[#ececf0] md:p-6">
      <div className="flex items-start justify-between gap-4">
        <Avatar
          name={director.name}
          seed={director.id}
          size="lg"
          company={director.company}
          ticker={director.ticker}
          photoUrl={director.headshotUrl}
        />
        <span className="tnum text-[1.25rem] font-semibold text-ink">
          {formatTradeValue(director.totalTradeValueUsd)}
        </span>
      </div>
      <div className="mt-10">
        <p className="text-[0.76rem] font-medium text-ink-soft">{director.title}</p>
        <p className="mt-1 text-[1.28rem] font-bold tracking-tight text-ink">{director.name}</p>
        <div className="mt-3 flex items-center justify-between border-t border-line-strong pt-3 text-[0.78rem] text-ink-soft">
          <span>{director.company}</span><Arrow />
        </div>
      </div>
    </Link>
  );
}

function RankedList({ people, metric }: { people: Director[]; metric: 'amount' | 'watching' }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {people.map((director, index) => (
        <Link key={director.id} to={`/director/${director.id}`} className="grid grid-cols-[2rem_auto_minmax(0,1fr)_auto] items-center gap-3 py-3.5 transition-colors hover:bg-surface-2">
          <span className="tnum text-center text-[0.76rem] font-semibold text-ink-faint">{index + 1}</span>
          <Avatar
            name={director.name}
            seed={director.id}
            size="sm"
            company={director.company}
            ticker={director.ticker}
            photoUrl={director.headshotUrl}
          />
          <div className="min-w-0"><p className="truncate text-[0.96rem] font-semibold text-ink">{director.name}</p><p className="truncate text-[0.73rem] text-ink-soft">{director.title} · {director.company}</p></div>
          {metric === 'amount' ? (
            <span className="tnum text-[0.94rem] font-semibold text-ink">{formatTradeValue(director.totalTradeValueUsd)}</span>
          ) : (
            <WatcherCount count={director.watcherCount} className="text-[0.87rem]" hideLabelOnMobile />
          )}
        </Link>
      ))}
    </div>
  );
}

export function Home() {
  const directorsState = useDirectors();
  const directors = directorsState.status === 'ready' ? directorsState.directors : [];

  const topByAmount = useMemo(() => rankDirectors(directors, 'amount').slice(0, 6), [directors]);
  const mostWatched = useMemo(() => rankDirectors(directors, 'popularity').slice(0, 6), [directors]);
  // Featured = most active profiles (trade count), not by amount — the "Top
  // by amount" rail below already covers that axis.
  const featured = useMemo(
    () => [...directors].sort((a, b) => b.tradeCount - a.tradeCount).slice(0, 3),
    [directors],
  );
  const sectors = useMemo(() => [...new Set(directors.map((d) => d.sectorGroup))], [directors]);

  return (
    <>
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 pb-16 md:px-8 lg:px-10">
        <header className="flex items-center justify-between pt-6 md:hidden"><div className="flex items-center gap-2.5"><Mark /><span className="flex items-center gap-1 text-[1.08rem] font-bold tracking-tight text-ink">Insider Index <BlueCheck className="h-4 w-4" /></span></div><span className="rounded-full bg-blue/10 px-2.5 py-1 text-[0.67rem] font-semibold text-blue">BETA</span></header>

        <section className="grid items-center gap-12 pb-20 pt-16 md:pt-24 lg:min-h-[calc(100vh-4.5rem)] lg:grid-cols-[1fr_0.9fr] lg:gap-20 lg:py-16">
          <div className="max-w-[42rem]">
            <h1 className="text-[clamp(3rem,6.2vw,5.85rem)] font-bold leading-[0.91] tracking-[-0.04em] text-ink">Find the people moving their own companies.</h1>
            <p className="mt-7 max-w-[34rem] text-[1rem] leading-relaxed text-ink-soft md:text-[1.13rem]">Explore real, disclosed profiles of directors, CEOs, and CFOs through the trades they've filed.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/discover" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-btn px-5 text-[0.92rem] font-semibold text-btn-fg transition-transform hover:scale-[1.02] active:scale-[0.98]">Explore profiles <Arrow /></Link><a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line-strong px-5 text-[0.92rem] font-semibold text-ink transition-colors hover:bg-surface-2">How Insider Index works</a></div>
            <p className="mt-5 text-[0.71rem] leading-relaxed text-ink-faint">Trades, companies, and people are real, disclosed data. Watcher counts are simulated estimates. Titles are shown as a general placeholder.</p>
          </div>
          {directorsState.status === 'ready' && <StackedProfiles profiles={featured} total={directors.length} />}
        </section>

        {directorsState.status === 'loading' && <LoadingState label="Loading insiders…" />}
        {directorsState.status === 'error' && (
          <ErrorState onRetry={directorsState.refetch} message="Couldn't load insider data." />
        )}

        {directorsState.status === 'ready' && (
          <>
            <section className="border-t border-line py-16 md:py-24">
              <div className="flex items-end justify-between gap-4"><div><h2 className="text-[clamp(2rem,3.4vw,3.15rem)] font-bold tracking-[-0.035em] text-ink">Featured profiles</h2><p className="mt-2 text-[0.94rem] text-ink-soft">Start with the people whose decisions stand out.</p></div><Link to="/discover" className="hidden items-center gap-2 text-[0.84rem] font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink sm:inline-flex">See every profile <Arrow /></Link></div>
              <div className="mt-8 grid gap-3 md:grid-cols-3">{featured.map((director) => <FeatureCard key={director.id} director={director} />)}</div>
              <Link to="/discover" className="mt-5 inline-flex items-center gap-2 text-[0.84rem] font-semibold text-ink underline decoration-line-strong underline-offset-4 sm:hidden">See every profile <Arrow /></Link>
            </section>

            <section className="grid gap-16 border-t border-line py-16 md:py-24 lg:grid-cols-2 lg:gap-20">
              <div><h2 className="text-[clamp(2rem,3.4vw,3.15rem)] font-bold tracking-[-0.035em] text-ink">Top by amount</h2><p className="mt-2 max-w-[27rem] text-[0.94rem] text-ink-soft">Ranked by total disclosed dollar value of tracked trades.</p><div className="mt-7"><RankedList people={topByAmount} metric="amount" /></div><Link to="/discover" className="mt-5 inline-flex items-center gap-2 text-[0.84rem] font-semibold text-ink underline decoration-line-strong underline-offset-4">See full leaderboard <Arrow /></Link></div>
              <div><h2 className="text-[clamp(2rem,3.4vw,3.15rem)] font-bold tracking-[-0.035em] text-ink">Most watched</h2><p className="mt-2 max-w-[27rem] text-[0.94rem] text-ink-soft">The profiles the Insider Index community keeps close (estimated watcher counts).</p><div className="mt-7"><RankedList people={mostWatched} metric="watching" /></div><Link to="/discover" className="mt-5 inline-flex items-center gap-2 text-[0.84rem] font-semibold text-ink underline decoration-line-strong underline-offset-4">Explore the index <Arrow /></Link></div>
            </section>

            <section className="border-t border-line py-16 md:py-24"><div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"><div><h2 className="text-[clamp(2rem,3.4vw,3.15rem)] font-bold leading-[0.98] tracking-[-0.035em] text-ink">Explore the signal from every angle.</h2></div><div><p className="max-w-[40rem] text-[1.05rem] leading-relaxed text-ink-soft">Every Insider Index profile comes with company context, full trade history, net shares held, and a breakdown of disclosed acquisitions and disposals.</p><div className="mt-8 flex flex-wrap gap-2">{sectors.map((sector) => <Link key={sector} to="/discover" className="rounded-full border border-line-strong px-4 py-2 text-[0.8rem] font-semibold text-ink transition-colors hover:bg-surface-2">{sector}</Link>)}</div></div></div></section>
          </>
        )}

        <section id="how-it-works" className="border-t border-line py-16 md:py-24"><h2 className="text-[clamp(2rem,3.4vw,3.15rem)] font-bold tracking-[-0.035em] text-ink">How it works</h2><div className="mt-9 grid gap-10 md:grid-cols-3 md:gap-8"><div><p className="text-[1.15rem] font-bold text-ink">Find a profile</p><p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">Search the index by person, company, ticker, or sector.</p></div><div><p className="text-[1.15rem] font-bold text-ink">Read the context</p><p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">Look beyond the headline number with company context and every disclosed trade.</p></div><div><p className="text-[1.15rem] font-bold text-ink">Keep a watchlist</p><p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">Save the profiles you want to revisit. Everything stays local to this demo.</p></div></div></section>

        <footer className="border-t border-line pt-10 text-[0.74rem] leading-relaxed text-ink-faint md:flex md:items-end md:justify-between"><div><div className="flex items-center gap-2 text-ink"><Mark /><span className="flex items-center gap-1 font-bold">Insider Index <BlueCheck className="h-4 w-4" /></span></div><p className="mt-4 max-w-[35rem]">Trades, companies, and people reflect real, disclosed SEC filings. Watcher counts are simulated estimates, not real activity; titles are shown as a general placeholder; not every trade discloses a dollar value. This is not an investment product and does not place trades.</p></div><p className="mt-5 md:mt-0">© 2026 Insider Index</p></footer>
      </main>
      <BottomNav />
    </>
  );
}

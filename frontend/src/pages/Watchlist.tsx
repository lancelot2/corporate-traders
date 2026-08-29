import { Link } from 'react-router-dom';
import { useDirectors } from '../state/directors';
import { rankDirectors } from '../lib/sort';
import { useWatchlist } from '../state/watchlist';
import { DirectorRow } from '../components/DirectorRow';
import { BottomNav } from '../components/BottomNav';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export function Watchlist() {
  const directorsState = useDirectors();
  const { isWatched } = useWatchlist();
  const directors = directorsState.status === 'ready' ? directorsState.directors : [];
  const watched = rankDirectors(directors.filter((d) => isWatched(d.id)), 'amount');

  return (
    <>
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 pb-8 pt-12 md:px-8 md:pt-14 lg:px-10">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-ink">Watching</h1>
        <p className="mt-1 text-[0.92rem] text-ink-soft">
          {watched.length ? `${watched.length} insider${watched.length > 1 ? 's' : ''} on your list.` : 'Insiders you tap the star on show up here.'}
        </p>

        {directorsState.status === 'loading' && <LoadingState label="Loading insiders…" />}
        {directorsState.status === 'error' && (
          <ErrorState onRetry={directorsState.refetch} message="Couldn't load insider data." />
        )}

        {directorsState.status === 'ready' &&
          (watched.length ? (
            <ol className="mt-6">
              {watched.map((director, i) => (
                <li key={director.id}>
                  <DirectorRow director={director} rank={i + 1} mode="amount" />
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-16 flex flex-col items-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-surface-2">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-ink-faint" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                  <path d="M12 4l2.5 5.1 5.6.8-4.05 4 .95 5.6L12 18.9 6.95 19.5l.95-5.6-4.05-4 5.6-.8z" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="mt-4 max-w-[16rem] text-[0.95rem] text-ink-soft">
                Nothing here yet. Open any insider and tap the star to start watching.
              </p>
              <Link
                to="/discover"
                className="mt-6 rounded-full bg-btn px-5 py-3 text-[0.92rem] font-semibold text-btn-fg"
              >
                Discover insiders
              </Link>
            </div>
          ))}
      </main>

      <BottomNav />
    </>
  );
}

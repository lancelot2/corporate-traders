import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { BlueCheck } from './BlueCheck';
import { useWatchlist } from '../state/watchlist';

function Mark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-btn">
      <svg viewBox="0 0 32 32" className="h-[1.05rem] w-[1.05rem]" aria-hidden>
        <rect x="6" y="18" width="4.5" height="8" rx="1.2" fill="var(--btn-fg)" />
        <rect x="13.75" y="12" width="4.5" height="14" rx="1.2" fill="var(--btn-fg)" />
        <rect x="21.5" y="6" width="4.5" height="20" rx="1.2" fill="var(--btn-fg)" />
      </svg>
    </span>
  );
}

function NavItem({ to, children, badge }: { to: string; children: ReactNode; badge?: number }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `relative rounded-lg px-3 py-2 text-[0.86rem] font-semibold transition-colors ${
          isActive ? 'bg-surface-2 text-ink' : 'text-ink-soft hover:text-ink'
        }`
      }
    >
      {children}
      {badge ? (
        <span className="tnum ml-1.5 rounded-full bg-gain px-1.5 py-0.5 text-[0.62rem] font-bold text-white">{badge}</span>
      ) : null}
    </NavLink>
  );
}

export function DesktopNav() {
  const { count } = useWatchlist();
  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-app/95 backdrop-blur-md md:block">
      <div className="mx-auto flex h-[4.5rem] max-w-[1280px] items-center justify-between px-8 lg:px-10">
        <NavLink to="/" className="flex items-center gap-2.5" aria-label="Insider Index home">
          <Mark />
          <span className="flex items-center gap-1 text-[1rem] font-bold tracking-tight text-ink">
            Insider Index <BlueCheck className="h-4 w-4" />
          </span>
        </NavLink>
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/discover">Discover</NavItem>
          <NavItem to="/watchlist" badge={count}>Watching</NavItem>
        </nav>
        <NavLink to="/discover" className="rounded-xl bg-btn px-4 py-2.5 text-[0.82rem] font-semibold text-btn-fg transition-transform hover:scale-[1.02] active:scale-[0.98]">
          Explore insiders
        </NavLink>
      </div>
    </header>
  );
}

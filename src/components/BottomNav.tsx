import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useWatchlist } from '../state/watchlist';

function DiscoverIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.35rem] w-[1.35rem]" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden>
      <path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z" strokeLinejoin="round" />
    </svg>
  );
}

function WatchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.35rem] w-[1.35rem]" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path d="M12 4l2.5 5.1 5.6.8-4.05 4 .95 5.6L12 22" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M12 4L9.5 9.1l-5.6.8 4.05 4-.95 5.6L12 22" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Tab({
  to,
  label,
  icon,
  badge,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `relative flex flex-1 flex-col items-center gap-1 py-2 text-[0.62rem] font-medium transition-colors ${
          isActive ? 'text-ink' : 'text-ink-faint'
        }`
      }
    >
      <span className="relative">
        {icon}
        {badge ? (
          <span className="tnum absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gain px-1 text-[0.58rem] font-semibold text-white">
            {badge}
          </span>
        ) : null}
      </span>
      {label}
    </NavLink>
  );
}

export function BottomNav() {
  const { count } = useWatchlist();
  return (
    <nav className="sticky bottom-0 z-30 mt-auto border-t border-line bg-app/90 backdrop-blur-md">
      <div className="flex items-stretch px-8 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
        <Tab to="/" label="Discover" icon={<DiscoverIcon />} />
        <Tab to="/watchlist" label="Watching" icon={<WatchIcon />} badge={count} />
      </div>
    </nav>
  );
}

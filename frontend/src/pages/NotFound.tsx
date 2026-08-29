import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="text-[4.5rem] font-bold leading-none tracking-tight text-ink">404</div>
      <h1 className="mt-3 text-[1.3rem] font-bold text-ink">Off the board</h1>
      <p className="mt-2 max-w-[16rem] text-[0.95rem] text-ink-soft">
        There’s no listing at this address. It may have been delisted, or the link is
        simply wrong.
      </p>
      <Link
        to="/"
        className="mt-7 rounded-full bg-btn px-6 py-3 text-[0.92rem] font-semibold text-btn-fg"
      >
        Back to discover
      </Link>
    </main>
  );
}

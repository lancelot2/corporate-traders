export function ErrorState({
  message = "Couldn't load insider data.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-surface-2">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink-faint" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>
      <p className="mt-4 max-w-[18rem] text-[0.95rem] text-ink-soft">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full bg-surface-2 px-4 py-2 text-[0.88rem] font-semibold text-ink"
      >
        Try again
      </button>
    </div>
  );
}

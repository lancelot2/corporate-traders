export function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3.5 py-2.5">
      <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem] shrink-0 text-ink-faint" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M20 20l-3.6-3.6" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name or ticker"
        aria-label="Search insiders by name or ticker"
        className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-ink-faint"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink-faint/30 text-app"
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

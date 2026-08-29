export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-ink"
      />
      <p className="mt-4 text-[0.9rem] text-ink-soft">{label}</p>
    </div>
  );
}

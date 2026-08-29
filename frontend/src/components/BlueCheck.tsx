// The yellow verified badge used beside the product / author name.
export function BlueCheck({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="Verified" role="img">
      <path
        fill="#FED90F"
        d="M12 1.5l2.6 1.9 3.2-.2 1 3.05 2.6 1.9-1 3.05 1 3.05-2.6 1.9-1 3.05-3.2-.2L12 22.5l-2.6-1.9-3.2.2-1-3.05-2.6-1.9 1-3.05-1-3.05 2.6-1.9 1-3.05 3.2.2z"
      />
      <path
        fill="#000"
        d="M10.6 15.2l-2.9-2.9 1.2-1.2 1.7 1.7 4-4 1.2 1.2z"
      />
    </svg>
  );
}

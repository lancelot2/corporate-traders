import { formatPercent, toneOf, type Tone } from '../lib/format';

const TONE_TEXT: Record<Tone, string> = {
  gain: 'text-gain',
  loss: 'text-loss',
  flat: 'text-flat',
};

function Caret({ tone }: { tone: Tone }) {
  if (tone === 'flat') {
    return <span className="inline-block h-[2px] w-2 rounded-full bg-current opacity-70" />;
  }
  return (
    <svg viewBox="0 0 10 8" className="h-[0.5rem] w-[0.6rem]" fill="currentColor" aria-hidden>
      {tone === 'gain' ? <path d="M5 0l5 8H0z" /> : <path d="M5 8L0 0h10z" />}
    </svg>
  );
}

// A signed percentage in brokerage green / red, matching the app's gain-loss color.
export function ReturnValue({
  value,
  className = '',
  showCaret = false,
}: {
  value: number;
  className?: string;
  showCaret?: boolean;
}) {
  const tone = toneOf(value);
  return (
    <span
      className={`tnum inline-flex items-center gap-1 font-semibold ${TONE_TEXT[tone]} ${className}`}
    >
      {showCaret && <Caret tone={tone} />}
      {formatPercent(value)}
    </span>
  );
}

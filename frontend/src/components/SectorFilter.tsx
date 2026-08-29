import { SECTOR_GROUPS } from '../data/directors';

export type SectorValue = 'all' | (typeof SECTOR_GROUPS)[number];

// Outline chips (distinct from the filled sort pills) for narrowing by sector.
export function SectorFilter({
  active,
  onChange,
}: {
  active: SectorValue;
  onChange: (v: SectorValue) => void;
}) {
  const options: SectorValue[] = ['all', ...SECTOR_GROUPS];
  return (
    <div role="group" aria-label="Filter by sector" className="flex items-center gap-2">
      {options.map((opt) => {
        const isActive = opt === active;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[0.82rem] font-medium transition-colors ${
              isActive
                ? 'border-transparent bg-btn text-btn-fg'
                : 'border-line bg-transparent text-ink-soft hover:text-ink'
            }`}
          >
            {opt === 'all' ? 'All sectors' : opt}
          </button>
        );
      })}
    </div>
  );
}

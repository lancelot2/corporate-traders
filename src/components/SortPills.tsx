import { SORT_MODES, type SortMode } from '../lib/sort';

// Autopilot-style filter pills: the active mode is a solid black chip, the rest
// are light gray. This is the primary control on the discover screen.
export function SortPills({
  active,
  onChange,
}: {
  active: SortMode;
  onChange: (mode: SortMode) => void;
}) {
  return (
    <div role="tablist" aria-label="Sort insiders" className="flex items-center gap-2">
      {SORT_MODES.map((mode) => {
        const isActive = mode.id === active;
        return (
          <button
            key={mode.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(mode.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-[0.9rem] font-semibold transition-colors ${
              isActive
                ? 'bg-btn text-btn-fg'
                : 'bg-surface-2 text-ink-soft hover:text-ink'
            }`}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

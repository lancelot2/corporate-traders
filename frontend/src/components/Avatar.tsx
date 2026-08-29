import { useState } from 'react';
import { initials } from '../lib/format';
import { avatarTint } from '../lib/tint';
import { CompanyLogo } from './CompanyLogo';

// Photo-based when a headshot URL is available, otherwise an initials-based
// tinted circle. When a company is supplied, its mark is badged into the
// bottom-right corner.
const SIZES = {
  sm: 'h-11 w-11 text-[0.85rem]',
  md: 'h-9 w-9 text-[0.7rem]',
  lg: 'h-14 w-14 text-lg',
};

const BADGE = {
  sm: 'h-[1.15rem] w-[1.15rem] rounded-[0.4rem] text-[0.62rem] -bottom-0.5 -right-0.5',
  md: 'h-4 w-4 rounded-[0.35rem] text-[0.55rem] -bottom-0.5 -right-0.5',
  lg: 'h-6 w-6 rounded-lg text-[0.75rem] -bottom-1 -right-1',
};

export function Avatar({
  name,
  seed,
  size = 'sm',
  company,
  ticker,
  photoUrl,
}: {
  name: string;
  seed: string;
  size?: keyof typeof SIZES;
  company?: string;
  ticker?: string;
  photoUrl?: string | null;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const tint = avatarTint(seed);
  const circle =
    photoUrl && !photoFailed ? (
      <img
        src={photoUrl}
        alt=""
        aria-hidden
        onError={() => setPhotoFailed(true)}
        className={`rounded-full object-cover ring-1 ring-inset ring-black/5 ${SIZES[size]}`}
      />
    ) : (
      <div
        aria-hidden
        className={`grid place-items-center rounded-full font-semibold text-ink ring-1 ring-inset ring-black/5 ${SIZES[size]}`}
        style={{
          backgroundColor: 'var(--surface-2)',
          backgroundImage: `linear-gradient(0deg, ${tint}, ${tint})`,
        }}
      >
        {initials(name)}
      </div>
    );

  if (!company || !ticker) return <div className="shrink-0">{circle}</div>;

  return (
    <div className="relative shrink-0">
      {circle}
      <CompanyLogo
        company={company}
        ticker={ticker}
        className={`absolute ring-2 ring-app ${BADGE[size]}`}
      />
    </div>
  );
}

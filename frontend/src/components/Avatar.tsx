import { useState } from 'react';
import { initials } from '../lib/format';
import { avatarTint } from '../lib/tint';

// Photo-based when a headshot URL is available, otherwise an initials-based
// tinted square with rounded corners.
const SIZES = {
  sm: 'h-11 w-11 text-[0.85rem]',
  md: 'h-9 w-9 text-[0.7rem]',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-28 w-28 text-[2rem]',
  xxl: 'h-[9.45rem] w-[9.45rem] text-4xl',
};

export function Avatar({
  name,
  seed,
  size = 'sm',
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
  const avatar =
    photoUrl && !photoFailed ? (
      <img
        src={photoUrl}
        alt=""
        aria-hidden
        onError={() => setPhotoFailed(true)}
        className={`rounded-xl object-cover ring-1 ring-inset ring-black/5 ${SIZES[size]}`}
      />
    ) : (
      <div
        aria-hidden
        className={`grid place-items-center rounded-xl font-semibold text-ink ring-1 ring-inset ring-black/5 ${SIZES[size]}`}
        style={{
          backgroundColor: 'var(--surface-2)',
          backgroundImage: `linear-gradient(0deg, ${tint}, ${tint})`,
        }}
      >
        {initials(name)}
      </div>
    );

  return <div className="shrink-0">{avatar}</div>;
}

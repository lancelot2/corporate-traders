// Deterministic per-insider color. Used for the initials avatar and, at higher
// saturation, the full-bleed detail hero (in place of the app's photo heroes).
const HUES: [number, number, number][] = [
  [201, 74, 66], // red-clay
  [26, 96, 128], // deep teal
  [232, 108, 54], // orange
  [96, 118, 168], // indigo
  [150, 80, 128], // magenta
  [40, 130, 110], // green-teal
  [70, 96, 150], // blue
  [176, 96, 60], // terracotta
];

export function hueIndex(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % HUES.length;
}

export function avatarTint(seed: string): string {
  const [r, g, b] = HUES[hueIndex(seed)];
  return `rgba(${r}, ${g}, ${b}, 0.2)`;
}

// A rich two-stop gradient for the detail hero, evoking the app's editorial
// portrait blocks without any external image.
export function heroGradient(seed: string): string {
  const [r, g, b] = HUES[hueIndex(seed)];
  const dark = (c: number) => Math.round(c * 0.62);
  return `linear-gradient(150deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${dark(r)}, ${dark(g)}, ${dark(b)}) 100%)`;
}

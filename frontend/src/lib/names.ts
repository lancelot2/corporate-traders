// Source data mixes "First Last" and "Last, First" formats. Normalize once at
// fetch time so every downstream consumer sees "First Last".
const LAST_FIRST = /^([^,]+),\s*(.+)$/;

export function normalizeFullName(raw: string): string {
  const match = LAST_FIRST.exec(raw);
  return match ? `${match[2]} ${match[1]}` : raw;
}

export function firstNameOf(name: string): string {
  return name.split(' ')[0];
}

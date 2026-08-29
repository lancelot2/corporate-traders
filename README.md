# Insider Index

A leaderboard that ranks corporate insiders (directors, CEOs, CFOs) like a
roster of traders, styled after the **Autopilot** copy-trading app — clean white
iOS look, black CTAs, brokerage-green gains, verified-check branding, a mobile
app shell with a bottom tab bar. This is a **layout-and-interaction scaffold**:
everything is fictional mock data, hardcoded in the repo. No backend, no auth, no
persistence, no real API — and it is **not a trading product**. No orders are
placed anywhere.

Two adaptations from the reference app, both required by the brief:

- **Fictional insiders**, not real figures like Pelosi or Buffett — inventing
  performance numbers for real named people is out of scope.
- The primary CTA is a local-only **Watch** toggle, not "Select / Invest /
  Submit" — nothing implies moving money.

## Stack

Vite + React + TypeScript + Tailwind CSS v4, React Router for the two screens,
and Recharts for the performance chart.

## Run

```bash
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a static bundle.

## Screens

- **Discover (`/`)** — brand header, a search field (by name or ticker), filter
  pills for the three sort modes (Performance / Amount / Popularity) that visibly
  reorder the list, a sector filter, and clean tappable rows (rank, initials
  avatar with a company monogram badge, title, name, active-mode stat). Returns
  are color-coded (green gain / red loss); empty search/filter shows an empty state.
- **Insider detail (`/director/:id`)** — gradient hero with the name overlaid,
  a **total current holdings** stat (net shares still held × current price), a
  three-baseline performance row (All time, vs. Market, vs. Own stock), an
  About blurb, a **company share-price chart with the insider's buys and sells
  plotted on the price line** (buys in the dips and sells on the peaks = good
  timing), a sortable trade table, and a sticky black **Watch** button.
- **Watching (`/watchlist`)** — the insiders you've watched, with an empty state.

A bottom tab bar switches between Discover and Watching (with a live count
badge). Light and dark themes follow the system `prefers-color-scheme`. The
Watch toggle is local session-only UI state — it resets on refresh.

## Data

All data lives in [`src/data/mockDirectors.ts`](src/data/mockDirectors.ts),
fully typed. Fifteen hand-authored director profiles (fictional names, companies,
and figures) are expanded — deterministically, via a seeded RNG — into a
company share-price path and a trade history placed on it. The stock's total
move is derived to be internally consistent (`stock ≈ absolute − self-relative`),
and each trade snaps to a nearby local extreme: skilled timers (positive
self-relative) buy dips and sell peaks; poor timers do the opposite.

The leaderboard "Performance" score is `absoluteReturnPct`; the detail page
additionally breaks return into market-relative and self-relative figures.

## Next phase (not in this pass)

Wiring real data — including any Cala integration — is a separate, later step.
The mock-data module is the single seam where a real source would be swapped in;
nothing else in the UI assumes the data is mock.

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

## Generate image assets with fal

Install `@fal-ai/client`, then provide `FAL_KEY` in your terminal session or in
an untracked `frontend/.env.local` file. Never expose the key through a
`VITE_` environment variable because browser code would receive it.

```bash
export FAL_KEY="your-key"
npm run generate:image -- "A cinematic editorial photograph of a modern city skyline at sunrise" homepage-hero
```

Generated files are written to `public/generated/` and can be referenced in
the app as `/generated/homepage-hero.jpg`. Set `FAL_IMAGE_MODEL` to use a
different compatible fal image endpoint; the default is `fal-ai/fast-sdxl`.

Reusable prompt directions live in [`scripts/image-presets.mjs`](scripts/image-presets.mjs).
The `simpson-headshot` preset uses `bytedance/seedream/v5/lite/edit` and needs
a reference image:

```bash
npm run generate:image -- --preset simpson-headshot --input ./reference-photo.jpg --output elena-cho
```

The reference image is uploaded directly to fal for the generation request;
the resulting asset is saved as `public/generated/elena-cho.png` (or `.jpg`).

### Public-figure headshots

Use the Google Images finder before generating a public figure's headshot. It
uses SerpAPI and writes the direct image URL plus its originating-page URL to a
review file; review the result before selecting one.

```bash
cp headshots.people.example.json people.json
# Edit people.json with the public figures you want to process.
npm run find:headshots -- ./people.json
```

When a source is approved, pass its `sourceUrl` into the headshot preset:

```bash
npm run generate:image -- --preset simpson-headshot --input "https://example.com/source-image.jpg" --output person-name
```

Do not use this workflow to imply endorsement or to misrepresent a person. Keep
the generated-image file alongside the source record so attribution and origin
remain available.

### Supabase-backed discovery

For the production `public.insiders` table, first execute
[`scripts/sql/add-insider-headshot-columns.sql`](scripts/sql/add-insider-headshot-columns.sql)
in the Supabase SQL Editor. Then use the service-role credentials and SerpAPI
key in `frontend/.env.local` and run:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SERPAPI_KEY=your_serpapi_key
```

```bash
npm run supabase:find-headshots
```

The command reads `full_name` directly from five rows whose headshot status is
still unset (override this with `HEADSHOT_BATCH_SIZE`), selects the first
Google Images result through SerpAPI, and saves the source image URL and
originating-page URL back to the same insider row with a
`source_needs_review` status. It does not call fal or generate an image.

To discard all previous Wikimedia-derived source data and make those rows
eligible for SerpAPI discovery again:

```bash
npm run supabase:reset-wikimedia-headshots
```

After reviewing a source, change its `headshot_status` to `source_approved`.
Then generate and upload its Simpsons-style avatar to the public `avatars`
bucket with a `<full_name>.jpg` filename:

```bash
npm run supabase:generate-headshots
```

The command saves the public Storage URL to both `avatar_url` and
`headshot_generated_url`, then marks the row `generated`.

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

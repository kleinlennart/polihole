# Polihole

Two discussion-starter card games for politics nerds.

- **Polihole** — a political claim on every card
- **Politicize This** — one word, no prompt: _The politics of Tupperware._

No accounts, no backend, no scoring. Tap through, argue, move on.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000/polihole
```

The app is served from a sub-path (`basePath: '/polihole'`) because it deploys
to a GitHub Pages project page, so plain `localhost:3000` will 404. To run it at
the root instead:

```bash
BASE_PATH= npm run dev
```

## Build

```bash
npm run build   # next build (static export to out/) + scripts/generate-sw.mjs
```

`scripts/generate-sw.mjs` writes `out/sw.js` with a precache list of the whole
exported site, and drops `out/.nojekyll`. The list has to be generated because
Next hashes asset filenames on every build.

To preview the production build with its service worker, serve `out/` under a
`/polihole/` path:

```bash
mkdir -p /tmp/preview && ln -sfn "$PWD/out" /tmp/preview/polihole
python3 -m http.server 4521 --directory /tmp/preview   # http://localhost:4521/polihole/
```

## Deploy

`.github/workflows/deploy.yml` builds on every push to `main` and publishes
`out/` to GitHub Pages. Enable it once under **Settings → Pages → Source →
GitHub Actions**. Live at `https://kleinlennart.github.io/polihole/`.

## Content

Both decks are plain JSON in [`data/`](data/), imported at build time so they
ship inside the app bundle and work offline with no fetch.

`data/claims.json`:

```json
{
  "id": "c001",
  "text": "Front-line prompt",
  "followUp": "Optional deeper line, or null",
  "source": "Inspired by Left Values Survey",
  "axis": "revolution",
  "tags": ["revolution", "reform"]
}
```

`data/words.json` is a flat list of words:

```json
["Inheritance", "Tupperware", "Borders"]
```

v1 deals one shuffled deck with no filter UI, but claims carry `axis` and `tags`
so a filter can be added later without migrating the data.

## Structure

| Path                               | What's in it                                       |
| ---------------------------------- | -------------------------------------------------- |
| `app/page.tsx`                     | Home: the two decks as a two-option ballot         |
| `app/polihole/`, `app/politicize/` | One full-screen card view each                     |
| `components/card-shell.tsx`        | Shared chrome: counter, next, end-of-deck          |
| `lib/decks.ts`                     | Deck data, types, shuffle                          |
| `lib/use-deck.ts`                  | One shuffled pass, end screen, no-immediate-repeat |
| `app/manifest.ts`                  | Web app manifest (basePath-aware)                  |
| `scripts/generate-sw.mjs`          | Post-build service worker generation               |

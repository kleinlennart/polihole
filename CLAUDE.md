# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev     # BASE_PATH= next dev — serves at http://localhost:3000 (root, NOT /polihole)
npm run build   # next build (static export to out/) + node scripts/generate-sw.mjs
                # note: build does NOT override BASE_PATH, so it bakes in /polihole; dev does
npm run lint       # bare `eslint` (flat config, eslint-config-next core-web-vitals + typescript)
npm run typecheck  # tsc --noEmit
npm test           # node --test over tests/ — data invariants only, no deps, no UI tests
```

The only tests are data invariants in `tests/`, run by Node's built-in runner — no test framework is installed and nothing tests components or pages. A single file: `node --test tests/data.test.mjs`. Husky runs `npm test` on pre-commit (`.husky/pre-commit`); the hook checks the working tree, not just what is staged. `npm run dedupe:words` reports padded and repeated entries in `data/words.json` and `npm run dedupe:words -- --write` fixes them — it keeps the first spelling of a word, which renumbers every card after the one it drops.

To preview the production build the way it is actually deployed (under a `/polihole/` path, with the service worker):

```bash
mkdir -p /tmp/preview && ln -sfn "$PWD/out" /tmp/preview/polihole
python3 -c "from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler; import functools; \
ThreadingHTTPServer(('', 4521), functools.partial(SimpleHTTPRequestHandler, directory='/tmp/preview')).serve_forever()"
# http://localhost:4521/polihole/
```

It has to be the **threading** server, not plain `python3 -m http.server`: the worker's install fires one fetch per precached URL at once, and a single-threaded server drops enough of them that the install fails and the update never lands.

## What this is

A static, installable PWA with two discussion-starter card decks. No backend, no accounts, no scoring, no persistence beyond browser storage. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

Routes: `/` (home, two decks) · `/deck` (Polihole, claims) · `/politicize` (Politicize This, words) · `/about`.

## Architecture

### basePath is the thing most easily broken

The app is served from a sub-path on GitHub Pages. `next.config.ts` sets `basePath`/`assetPrefix` from `process.env.BASE_PATH ?? "/polihole"` **and** re-exports it as `NEXT_PUBLIC_BASE_PATH`, which `lib/base-path.ts` inlines at build time.

Next auto-prefixes what it controls — `next/link`, `next/image`, metadata routes. It does **not** prefix hand-written URL strings. Anything hand-written (service worker registration and scope, manifest `start_url`/`scope`/`icons`, files served from `public/`) must prepend `basePath` from `lib/base-path.ts` itself. See `app/manifest.ts` and `lib/use-app-update.ts` for the pattern.

`BASE_PATH=""` (an empty string, not unset) builds/serves at the root — that is what the `dev` script does.

### Static export

`output: "export"`. No API routes, no middleware, no server-side anything. Metadata routes are Route Handlers and must be pinned with `export const dynamic = "force-static"` (`app/manifest.ts`).

### Build is two halves

`next build` then `node scripts/generate-sw.mjs`. The script walks `out/`, writes `out/sw.js` with a precache list of the whole site plus a content-hash cache name, and drops `out/.nojekyll`. `out/sw.js` is generated — never edit it. The script reads `BASE_PATH` itself with the same `/polihole` default, so both halves of the build must see the same value; the CI workflow passes `BASE_PATH` explicitly from the Pages `base_path` output.

### Updating an installed app

The worker serves cache-first, so a deploy is invisible to an installed copy until the page is built again from the new cache. Three pieces make that happen, and they only work together:

- `scripts/generate-sw.mjs` **must not call `skipWaiting()` in `install`.** A worker that takes over mid-session leaves the open page rendering old HTML against a new cache. It installs, then waits for the message `"polihole:skip-waiting"`.
- `lib/use-app-update.ts` registers the worker, re-checks on `visibilitychange` (an installed app resumed from memory never navigates, so nothing else would ever look), and surfaces the waiting worker.
- `components/update-prompt.tsx` offers the swap. Accepting posts the message; the worker activates and claims the page, and `controllerchange` reloads it. `sessionStorage` puts the deck back on the same card.

Ignoring the offer is safe — the worker takes over on its own once every tab is closed, which for an installed app means fully swiped away.

Precaching uses `fetch(url, { cache: "reload" })` rather than `cache.addAll`: Pages serves with `max-age=600`, and a plain `addAll` can file a stale page under the new cache name for ten minutes after a deploy.

Note that Next stamps a random build ID into three `_next/static/<buildId>/` paths, so **every** build produces a new cache name and shows everyone the band — including a docs-only push, since `deploy.yml` has no path filter.

### All display copy lives in `content/en.json`

No component holds a literal user-facing string. `lib/content.ts` types the file as `Content = typeof en`, so a second locale that is missing or misspells a key is a build error. `fill()` substitutes `{name}` placeholders with values; `components/rich-text.tsx` substitutes them with React elements, so a sentence containing links stays one translatable sentence.

### Deck engine, three layers

1. `lib/decks.ts` — JSON imported at build time (so decks ship in the bundle and work offline with no fetch), types, `shuffle` (Fisher–Yates), `shuffleAvoiding`, `pickOne`.
2. `lib/use-deck.ts` — one shuffled pass then an explicit end screen, never a silent loop. The dealt order and index live in `sessionStorage` (reload restores the same card; closing the tab deals fresh); the last card seen lives in `localStorage` so the next shuffle doesn't open on it. A saved order whose ids no longer match the deck is discarded and re-dealt, so editing `data/*.json` is safe.
3. `components/card-shell.tsx` — shared chrome for both decks: header, counter, footer buttons, keyboard handling (arrows/space/enter), and the per-variant `skin` map that picks the colour scheme.

Card numbers are intrinsic to the card, not to its place in the shuffle: `claimNumber` strips the digits out of a claim's `id`, `wordNumber` is the word's 1-based index in `words.json`. **Reordering `data/words.json` renumbers every word card.**

### Hydration gate

`lib/use-hydrated.ts` returns false through the server render and hydration, true after. Anything random must wait on it — picking during the export would bake one fixed result into the static HTML, and picking during hydration would disagree with that HTML. Used by `useDeck` and `QuoteHeader`.

### Feature flags

`lib/flags.ts`. `pushFurther: false` currently hides the "Push further" button; the `followUp` lines stay in `data/claims.json` unrendered. Flip the flag and it's live.

### Styling

Tailwind v4, CSS-first — everything is in `app/globals.css`, there is no `tailwind.config`. Project colour tokens (`--color-ballot`, `--color-riso`, `--color-paper`, …) are declared in a `@theme` block and used as `bg-ballot` / `bg-riso`; animations are custom `@utility` rules (`deck-enter`, `deck-fade`, `flash-invert`).

Light-only by design: `@custom-variant dark (&:is(.dark *))` scopes `dark:` to a class nothing ever sets, so a stray `dark:` utility can't flip the app back to a dark theme. Don't reintroduce `prefers-color-scheme` theming.

shadcn is configured with the `base-nova` style on `@base-ui/react` (not Radix) — see `components.json`. `lib/utils.ts` re-exports `cn` from the `cn` package rather than defining the usual clsx + tailwind-merge helper. Most of the interface is hand-written utility classes rather than shadcn components.

## Data

`data/claims.json` — `{ id, text, followUp, source, axis, tags }`. `axis` and `tags` are carried for a future filter UI; nothing reads them yet.
`data/words.json` — a flat array of strings.
`data/quotes.json` — `{ include, short, long, author, context }`; `include: false` switches a quote off without deleting it, and only `short ?? long` plus `author` are shown.

`docs/PLAN.md` (gitignored) and `docs/TODO.md` hold the original design intent and the running task list.

## Rules

- don't use Browser Tools to look at the page unless asked to
- No need to ever run `format` yourself
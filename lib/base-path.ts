/**
 * Next rewrites the paths it controls (next/link, next/image, metadata routes)
 * but not strings we hand-write — service worker URLs, manifest fields, files
 * dropped in `public/`. Those get this prefix manually.
 *
 * Inlined at build time from next.config.ts.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

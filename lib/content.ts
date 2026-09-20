import en from "@/content/en.json";

/**
 * Every string the interface shows lives in `content/<locale>.json`, so copy
 * can be edited in one place without going through the components.
 *
 * To add a language: copy `content/en.json`, translate the values, and pick
 * between the two here. `Content` types the new file against the English one,
 * so a missing or misspelled key is a build error. Note that the decks
 * themselves (`data/claims.json`, `data/words.json`) are separate and would
 * need translating too.
 */
export type Content = typeof en;

export const content: Content = en;

/** Fills `{name}` placeholders: fill("{count} claims", { count: 67 }). */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

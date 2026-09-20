import claimsData from "@/data/claims.json";
import quotesData from "@/data/quotes.json";
import wordsData from "@/data/words.json";

export type Claim = {
  id: string;
  text: string;
  followUp: string | null;
  source: string;
  axis: string;
  tags: string[];
};

/** A word bank entry is just the word. */
export type Word = string;

/**
 * Drawn one at a time for the home screen header. `short` is what's shown;
 * `long` and `context` keep the full quote and its source on file without
 * being displayed. `include` switches a quote on and off without deleting it.
 */
export type Quote = {
  include: boolean;
  short: string | null;
  long: string;
  author: string;
  context: string | null;
};

export const claims = claimsData as Claim[];
export const quotes = (quotesData as Quote[]).filter((q) => q.include);
export const words = wordsData as Word[];

/** Stable per-card key. A word is its own id. */
export const wordId = (w: Word) => w;

/** One item at random. Lives here with the other draws, not in a component. */
export function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Fisher–Yates. Returns a new array; never mutates the source deck. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Shuffle, then make sure the deck doesn't open on the card it closed on last
 * time. Swaps the first card with a neighbour rather than reshuffling, so the
 * cost stays constant.
 */
export function shuffleAvoiding<T>(
  items: readonly T[],
  idOf: (item: T) => string,
  avoidId: string | null,
): T[] {
  const out = shuffle(items);
  if (avoidId && out.length > 1 && idOf(out[0]) === avoidId) {
    const swapWith = 1 + Math.floor(Math.random() * (out.length - 1));
    [out[0], out[swapWith]] = [out[swapWith], out[0]];
  }
  return out;
}

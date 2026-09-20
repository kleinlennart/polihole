import claimsData from "@/data/claims.json";
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

export const claims = claimsData as Claim[];
export const words = wordsData as Word[];

/** Stable per-card key. A word is its own id. */
export const wordId = (w: Word) => w;

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

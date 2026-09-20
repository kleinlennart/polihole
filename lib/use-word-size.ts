"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

/** How wide each word is in ems of its own font size — see `useWordSize`. */
const emWidths = new Map<string, number>();

/** Spaces break, so it's the widest word that has to fit on one line — and
 *  widest is not longest: "Lounges" outruns "Airport" at the same length. */
function widestWord(words: string[], measure: (word: string) => number) {
  return words.reduce((a, b) => (measure(b) > measure(a) ? b : a));
}

/**
 * A font size that sets `word` as large as the card is wide, up to a cap, so a
 * short word fills the screen instead of floating in the middle of it.
 *
 * The width of a word has to be measured rather than guessed from its length:
 * across this face "Museums" is half again as wide per letter as
 * "Handwriting", so no single ems-per-letter constant fits both. That ratio
 * doesn't change when the window does, though, so each word is measured once
 * and `100cqw` — the card's own width — does the responsive half with no
 * breakpoint. `fallback` covers the frames before a measurement exists.
 */
export function useWordSize(
  ref: RefObject<HTMLElement | null>,
  word: string,
  fallback: string,
) {
  const [em, setEm] = useState<number | null>(null);

  // Layout effect, not effect: this runs before the browser paints, so a card
  // is never shown at the fallback size and then resized under the reader.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !word) return;

    // A shallow clone keeps the class list, so the face, weight and tracking
    // that decide the width come along; the overrides strip the wrapping and
    // the entrance animation that would measure the wrong thing.
    const probe = el.cloneNode(false) as HTMLElement;
    probe.style.cssText =
      "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:pre;width:auto;max-width:none;font-size:100px;animation:none";
    el.parentElement?.appendChild(probe);

    const widthOf = (one: string) => {
      const cached = emWidths.get(one);
      if (cached !== undefined) return cached;
      probe.textContent = one;
      const em = probe.getBoundingClientRect().width / 100;
      emWidths.set(one, em);
      return em;
    };

    const width = widthOf(widestWord(word.split(" "), widthOf));
    probe.remove();
    setEm(width);
  }, [ref, word]);

  // Three ceilings, whichever bites first: the deck's own maximum, the height
  // of a short viewport (a phone on its side has width to spare and none to
  // give), and the width the word actually needs. Nothing is ever hyphenated
  // or broken to fit — a word too wide for the card shrinks the card's type
  // instead.
  return em === null
    ? fallback
    : `min(7.5rem, 14svh, calc(100cqw / ${em}))`;
}

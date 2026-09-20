"use client";

import { useState } from "react";
import { pickOne, quotes, type Quote } from "@/lib/decks";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * A quote drawn fresh on each visit. Picked after hydration, so the exported
 * HTML doesn't hand every visitor the same one; the space it will take is held
 * open until then.
 */
export function QuoteHeader() {
  const hydrated = useHydrated();
  const [quote, setQuote] = useState<Quote | null>(null);

  if (hydrated && quote === null && quotes.length > 0) {
    setQuote(pickOne(quotes));
  }

  return (
    <p className="min-h-[4rem] max-w-[24ch] text-[length:var(--quote-size)] leading-[var(--quote-leading)] font-extrabold tracking-[-0.02em] text-balance sm:min-h-[3.25rem] sm:max-w-[34ch]">
      {quote ? (
        <span className="deck-fade">
          &ldquo;{quote.short ?? quote.long}&rdquo;{" "}
          <span className="text-base font-normal whitespace-nowrap opacity-50">
            – {quote.author}
          </span>
        </span>
      ) : null}
    </p>
  );
}

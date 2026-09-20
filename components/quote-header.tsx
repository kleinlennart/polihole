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
    <p className="min-h-[4rem] max-w-[24ch] text-balance text-[length:var(--quote-size)] font-extrabold leading-[var(--quote-leading)] tracking-[-0.02em] sm:min-h-[3.25rem] sm:max-w-[34ch]">
      {quote ? (
        <span className="deck-fade">
          &ldquo;{quote.short ?? quote.long}&rdquo;{" "}
          <span className="whitespace-nowrap text-base font-normal opacity-50">
            – {quote.author}
          </span>
        </span>
      ) : null}
    </p>
  );
}

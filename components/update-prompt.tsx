"use client";

import { X } from "lucide-react";
import { content } from "@/lib/content";
import { useAppUpdate } from "@/lib/use-app-update";

const copy = content.update;

/**
 * A band across the top offering the newer version that's waiting.
 *
 * Every route floods the screen with one ink, so this can't borrow the
 * current one — it brings its own. Full bleed and square-cornered, pinned to
 * the edge rather than floating: an overprinted strip, not a card on top of a
 * card. It sits over the header, the one part of any route that isn't
 * load-bearing while it's up.
 */
export function UpdatePrompt() {
  const offer = useAppUpdate();

  // The live region stays mounted and is filled later; one that appears with
  // its text already in it is announced inconsistently.
  return (
    <div role="status" aria-live="polite">
      {offer ? (
        <div className="banner-enter fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 bg-ink px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 text-sm text-paper sm:px-8">
          <p className="leading-snug opacity-80">{copy.message}</p>
          <span className="flex shrink-0 items-center gap-4">
            <button
              type="button"
              onClick={offer.reload}
              className="text-sm font-semibold underline decoration-2 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              {copy.action}
            </button>
            <button
              type="button"
              onClick={offer.dismiss}
              aria-label={copy.dismissLabel}
              className="opacity-50 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              <X aria-hidden className="size-4" />
            </button>
          </span>
        </div>
      ) : null}
    </div>
  );
}

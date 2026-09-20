"use client";

import { Share, X } from "lucide-react";
import { content, fill } from "@/lib/content";
import { RichText } from "@/components/rich-text";
import { useInstallPrompt } from "@/lib/use-install-prompt";

const copy = content.install;

/**
 * A dismissible bar offering to add the app to the home screen. Only ever
 * renders on phones that can act on it — see `useInstallPrompt`.
 */
export function InstallPrompt() {
  const offer = useInstallPrompt();
  if (!offer) return null;

  return (
    <div className="deck-enter flex items-center justify-between gap-4 border-y border-current/15 px-5 py-3 text-sm sm:px-8">
      <p className="leading-snug opacity-75">
        {offer.platform === "ios" ? (
          <RichText
            template={copy.ios}
            parts={{
              name: content.app.name,
              share: (
                <Share
                  aria-hidden
                  className="-mt-0.5 inline size-4 align-middle"
                />
              ),
            }}
          />
        ) : (
          fill(copy.message, { name: content.app.name })
        )}
      </p>
      <span className="flex shrink-0 items-center gap-4">
        {offer.install ? (
          <button
            type="button"
            onClick={offer.install}
            className="text-sm font-semibold underline decoration-2 underline-offset-4"
          >
            {copy.action}
          </button>
        ) : null}
        <button
          type="button"
          onClick={offer.dismiss}
          aria-label={copy.dismissLabel}
          className="opacity-50 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <X aria-hidden className="size-4" />
        </button>
      </span>
    </div>
  );
}

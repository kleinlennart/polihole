"use client";

import { useCallback, useEffect, useState } from "react";
import { basePath } from "@/lib/base-path";

/** Floor between foreground update checks, so tab-switching can't hammer them. */
const UPDATE_INTERVAL_MS = 60_000;

/** Read by the message handler in `scripts/generate-sw.mjs`. */
const SKIP_WAITING = "polihole:skip-waiting";

/** Page-lifetime latches. A reload replaces the page, so neither is reset. */
let reloading = false;
let reloadRequested = false;

export type UpdateOffer = {
  /** Hands the page to the waiting worker, then reloads onto the new version. */
  reload: () => void;
  dismiss: () => void;
};

/**
 * Registers the offline worker, and reports when a newer one has installed
 * and is waiting to take over.
 *
 * The worker serves cache-first, so a deploy stays invisible until the page
 * is built again from the new cache. Rather than reload underneath a
 * conversation, the new worker is left waiting — see `generate-sw.mjs`, which
 * deliberately doesn't call skipWaiting() — and the reader is offered the
 * swap. Ignoring the offer is fine: the worker takes over on its own once
 * every tab is closed.
 */
export function useAppUpdate(): UpdateOffer | null {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  // The worker that was waved away — held by identity, so a *newer* one can
  // still speak up rather than inheriting the dismissal.
  const [dismissed, setDismissed] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const abort = new AbortController();
    const { signal } = abort;

    // A first install claims the page as well; reloading for that would be a
    // flash for no reason, since nothing was replaced.
    const hadController = Boolean(navigator.serviceWorker.controller);

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        if (reloading) return;
        if (!reloadRequested && !hadController) return;
        reloading = true;
        // The dealt order and index live in sessionStorage, so the deck comes
        // back up on the same card.
        window.location.reload();
      },
      { signal },
    );

    let registration: ServiceWorkerRegistration | undefined;
    let lastChecked = Date.now(); // register() below is itself a check.

    // An installed app resumed from memory never navigates, so registering
    // alone would never look for a new version — or find one to offer.
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState !== "visible") return;
        if (Date.now() - lastChecked < UPDATE_INTERVAL_MS) return;
        lastChecked = Date.now();
        registration?.update().catch(() => {});
      },
      { signal },
    );

    navigator.serviceWorker
      .register(`${basePath}/sw.js`, { scope: `${basePath}/` })
      .then((reg) => {
        if (signal.aborted) return;
        registration = reg;

        // A worker only waits when one is already in charge. The very first
        // activates straight through, with nothing to ask permission about.
        const offer = (worker: ServiceWorker) => {
          if (navigator.serviceWorker.controller) setWaiting(worker);
        };

        const track = (worker: ServiceWorker | null) => {
          if (!worker) return;
          if (worker.state === "installed") return offer(worker);
          worker.addEventListener(
            "statechange",
            () => {
              if (worker.state === "installed") offer(worker);
            },
            { signal },
          );
        };

        track(reg.waiting); // installed during an earlier page load
        track(reg.installing); // mid-install before this listener existed
        reg.addEventListener("updatefound", () => track(reg.installing), {
          signal,
        });
      })
      .catch(() => {
        // Offline support is a bonus; the app runs fine without it.
      });

    return () => abort.abort();
  }, []);

  const reload = useCallback(() => {
    // Set before the handover, because controllerchange has no other way to
    // tell an accepted update from the unsolicited first-install claim.
    reloadRequested = true;
    if (waiting) {
      waiting.postMessage(SKIP_WAITING);
      return; // controllerchange reloads once it has taken over
    }
    window.location.reload(); // activated on its own between render and tap
  }, [waiting]);

  const dismiss = useCallback(() => setDismissed(waiting), [waiting]);

  if (!waiting || waiting === dismissed) return null;
  return { reload, dismiss };
}

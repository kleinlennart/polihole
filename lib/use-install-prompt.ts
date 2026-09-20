"use client";

import { useCallback, useEffect, useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";

const dismissedKey = "polihole:install-dismissed";

/** Chrome/Android fire this before showing their own install UI; capturing
 * and suppressing it is what lets a page trigger the prompt on its own
 * button instead of waiting for the browser's. Safari never fires it. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallPlatform = "android" | "ios";

export type InstallOffer = {
  platform: InstallPlatform;
  /** Present only once Android's own prompt has been captured; null on iOS,
   * which has no programmatic install — the copy has to explain the gesture. */
  install: (() => void) | null;
  dismiss: () => void;
};

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(dismissedKey) === "1";
  } catch {
    return false; // private mode, blocked storage — just don't remember
  }
}

function writeDismissed() {
  try {
    window.localStorage.setItem(dismissedKey, "1");
  } catch {
    // ignore
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function detectMobilePlatform(): InstallPlatform | null {
  const ua = window.navigator.userAgent;
  // iPadOS 13+ identifies as desktop Safari; touch points are the tell.
  const isIpad =
    window.navigator.platform === "MacIntel" &&
    window.navigator.maxTouchPoints > 1;
  if (isIpad || /iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return null;
}

/**
 * Offers to add the app to the home screen, on phones only. Android gets a
 * real install button wired to the browser's captured `beforeinstallprompt`;
 * iOS Safari never fires that event, so it gets instructions instead.
 * Dismissing — or installing — is remembered so it doesn't come back.
 */
export function useInstallPrompt(): InstallOffer | null {
  const hydrated = useHydrated();
  const [checked, setChecked] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  // One-time read of platform/storage once we're safely on the client — set
  // during render, same as useDeck does, rather than in an effect.
  if (hydrated && !checked) {
    setChecked(true);
    if (!isStandalone()) {
      setDismissed(readDismissed());
      setPlatform(detectMobilePlatform());
    }
  }

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  const dismiss = useCallback(() => {
    writeDismissed();
    setDismissed(true);
  }, []);

  const install = useCallback(() => {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(() => {
      setDeferred(null);
      dismiss();
    });
  }, [deferred, dismiss]);

  if (dismissed || platform === null) return null;
  // No install() to offer yet, and nothing else to tell an Android user —
  // unlike iOS there's no manual gesture worth describing instead.
  if (platform === "android" && !deferred) return null;

  return { platform, install: platform === "android" ? install : null, dismiss };
}

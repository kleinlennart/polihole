"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * False while rendering on the server and through hydration, true afterwards.
 * Anything random has to wait for it: picking during the export would bake one
 * fixed result into the HTML, and picking during hydration would disagree
 * with it.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

"use client";

import { useEffect } from "react";
import { basePath } from "@/lib/base-path";

/**
 * Registers the offline worker. Scoped to the basePath because GitHub Pages
 * serves the app from a sub-path, and a worker may only control URLs at or
 * below its own scope.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register(`${basePath}/sw.js`, { scope: `${basePath}/` })
      .catch(() => {
        // Offline support is a bonus; the app runs fine without it.
      });
  }, []);

  return null;
}

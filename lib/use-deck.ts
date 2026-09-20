"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { shuffleAvoiding } from "@/lib/decks";

const storagePrefix = "polihole:last-seen:";

function readLastSeen(key: string): string | null {
  try {
    return window.localStorage.getItem(storagePrefix + key);
  } catch {
    return null; // private mode, blocked storage — the deck still works
  }
}

function writeLastSeen(key: string, id: string) {
  try {
    window.localStorage.setItem(storagePrefix + key, id);
  } catch {
    // ignore
  }
}

const noopSubscribe = () => () => {};

/**
 * False while rendering on the server and through hydration, true afterwards.
 * The deal has to wait for this: shuffling during the export would bake one
 * fixed order into the HTML, and shuffling during hydration would disagree
 * with it.
 */
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export type Deck<T> = {
  current: T | null;
  index: number;
  total: number;
  done: boolean;
  next: () => void;
  restart: () => void;
};

/**
 * One shuffled pass through a deck, then an explicit end screen — no silent
 * looping. The last card seen is remembered so the next shuffle doesn't open
 * on it.
 */
export function useDeck<T>(
  items: readonly T[],
  idOf: (item: T) => string,
  storageKey: string,
): Deck<T> {
  const hydrated = useHydrated();
  const [order, setOrder] = useState<T[] | null>(null);
  const [index, setIndex] = useState(0);

  // Deal on the first client render. Setting state during render of this same
  // component is React's supported way to do this; it re-renders immediately,
  // so nothing empty is ever committed.
  if (hydrated && order === null) {
    setOrder(shuffleAvoiding(items, idOf, readLastSeen(storageKey)));
  }

  const current = order && index < order.length ? order[index] : null;

  useEffect(() => {
    if (current) writeLastSeen(storageKey, idOf(current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, storageKey]);

  const next = useCallback(() => {
    setIndex((i) => (order ? Math.min(i + 1, order.length) : i));
  }, [order]);

  const restart = useCallback(() => {
    setOrder(shuffleAvoiding(items, idOf, readLastSeen(storageKey)));
    setIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return {
    current,
    index,
    total: order?.length ?? items.length,
    done: order !== null && index >= order.length,
    next,
    restart,
  };
}

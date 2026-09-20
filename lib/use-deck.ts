"use client";

import { useCallback, useEffect, useState } from "react";
import { shuffleAvoiding } from "@/lib/decks";
import { useHydrated } from "@/lib/use-hydrated";

const storagePrefix = "polihole:last-seen:";
const sessionPrefix = "polihole:session:";

type SavedSession = { order: string[]; index: number };

/**
 * The dealt order and your place in it, kept in sessionStorage so a reload —
 * or an accidental one — puts the same card back on screen. It lives and dies
 * with the tab: closing the app is what starts a new session.
 */
function readSession(key: string): SavedSession | null {
  try {
    const raw = window.sessionStorage.getItem(sessionPrefix + key);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedSession;
    if (!Array.isArray(saved?.order) || typeof saved?.index !== "number") {
      return null;
    }
    return saved;
  } catch {
    return null; // blocked storage, or something else wrote nonsense there
  }
}

function writeSession(key: string, saved: SavedSession) {
  try {
    window.sessionStorage.setItem(sessionPrefix + key, JSON.stringify(saved));
  } catch {
    // ignore
  }
}

/**
 * Rebuilds a saved order from ids. Returns null if the deck has been edited
 * since — a stale order would drop or duplicate cards, so it's better to deal
 * again than to restore something wrong.
 */
function restoreOrder<T>(
  items: readonly T[],
  idOf: (item: T) => string,
  saved: SavedSession | null,
): T[] | null {
  if (!saved || saved.order.length !== items.length) return null;
  const byId = new Map(items.map((item) => [idOf(item), item]));
  const order: T[] = [];
  for (const id of saved.order) {
    const item = byId.get(id);
    if (item === undefined) return null;
    order.push(item);
  }
  return order;
}

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

export type Deck<T> = {
  current: T | null;
  index: number;
  total: number;
  done: boolean;
  canGoBack: boolean;
  next: () => void;
  previous: () => void;
  restart: () => void;
};

/**
 * One shuffled pass through a deck, then an explicit end screen — no silent
 * looping. The order is random but fixed once dealt, which is what lets you
 * step back through cards you've already seen and guarantees none of them
 * comes round twice. The last card seen is remembered so the next shuffle
 * doesn't open on it.
 */
export function useDeck<T>(
  items: readonly T[],
  idOf: (item: T) => string,
  storageKey: string,
): Deck<T> {
  const hydrated = useHydrated();
  const [order, setOrder] = useState<T[] | null>(null);
  const [index, setIndex] = useState(0);

  // Pick up where this tab left off, or deal a fresh order. Setting state
  // during render of this same component is React's supported way to do this;
  // it re-renders immediately, so nothing empty is ever committed.
  if (hydrated && order === null) {
    const saved = readSession(storageKey);
    const restored = restoreOrder(items, idOf, saved);
    if (restored && saved) {
      setOrder(restored);
      setIndex(Math.min(Math.max(saved.index, 0), restored.length));
    } else {
      setOrder(shuffleAvoiding(items, idOf, readLastSeen(storageKey)));
    }
  }

  const current = order && index < order.length ? order[index] : null;

  useEffect(() => {
    if (current) writeLastSeen(storageKey, idOf(current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, storageKey]);

  useEffect(() => {
    if (order) writeSession(storageKey, { order: order.map(idOf), index });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, index, storageKey]);

  const next = useCallback(() => {
    setIndex((i) => (order ? Math.min(i + 1, order.length) : i));
  }, [order]);

  const previous = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

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
    canGoBack: index > 0,
    next,
    previous,
    restart,
  };
}

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { content, fill } from "@/lib/content";

export type Variant = "polihole" | "politicize";

const skin = {
  polihole: {
    field: "bg-ballot text-white",
    quiet: "text-white/55",
    hairline: "border-white/25",
    secondary: "border border-white/35 text-white hover:bg-white/10",
    primary: "bg-white text-ballot hover:bg-white/90",
    focus: "focus-visible:outline-white",
  },
  politicize: {
    field: "bg-riso text-black",
    quiet: "text-black/55",
    hairline: "border-black/25",
    secondary: "border border-black/35 text-black hover:bg-black/10",
    primary: "bg-black text-riso hover:bg-black/85",
    focus: "focus-visible:outline-black",
  },
} as const;

const button =
  "px-6 py-3 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-35";

export function CardShell({
  variant,
  title,
  cardNumber,
  done,
  flashing = false,
  canGoBack,
  onNext,
  onPrevious,
  onRestart,
  footer,
  children,
}: {
  variant: Variant;
  title: string;
  /** The card's own number, or null when there's no card to label. */
  cardNumber: number | null;
  done: boolean;
  /** Inverts the screen in bursts — the timer signalling that it's up. */
  flashing?: boolean;
  canGoBack: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onRestart: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const s = skin[variant];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Arrows steer the deck wherever focus happens to be — after a click it
      // sits on the button that was pressed.
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrevious();
        return;
      }
      if (done) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
        return;
      }
      // Space and Enter belong to whatever control is focused.
      if ((e.target as HTMLElement)?.closest("button, a")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, onNext, onPrevious]);

  return (
    <main
      className={`flex min-h-[100svh] flex-1 flex-col ${s.field} ${s.focus} ${
        flashing ? "flash-invert" : ""
      }`}
    >
      <header className="flex items-center justify-between px-7 pt-5 sm:px-8 sm:pt-7">
        <Link
          href="/"
          aria-label={`${content.deck.exit} ${title}`}
          className={`-ml-2 flex items-center gap-2 px-2 py-1 text-sm font-medium ${s.quiet} transition-colors hover:text-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
        >
          <ArrowLeft aria-hidden className="size-4" />
          {content.deck.exit}
        </Link>
        {cardNumber === null ? null : (
          <p className={`text-sm font-medium tabular-nums ${s.quiet}`}>
            {fill(content.deck.cardIndex, { index: cardNumber })}
          </p>
        )}
      </header>

      <section
        // Kindle-style: the left half of the card steps back, the right half
        // deals on. The end screen only goes back — reshuffling stays behind
        // its own button, so a stray tap can't throw away the pass.
        onClick={(e) => {
          const { left, width } = e.currentTarget.getBoundingClientRect();
          if (e.clientX - left < width / 2) onPrevious();
          else if (!done) onNext();
        }}
        // A phone on its side has no height to spare: the generous vertical
        // padding is the first thing to give, before the card's type is.
        className="flex flex-1 flex-col justify-center px-7 py-10 sm:px-8 [@media(max-height:520px)]:py-4"
      >
        {children}
      </section>

      <footer className="px-7 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div
          className={`flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3 ${s.hairline}`}
        >
          <div className="min-h-6">{footer}</div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!canGoBack}
              className={`${button} ${s.secondary}`}
            >
              {content.deck.back}
            </button>
            {done ? (
              <button
                type="button"
                onClick={onRestart}
                className={`${button} flex-1 ${s.primary}`}
              >
                {content.deck.restart}
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                className={`${button} flex-1 ${s.primary}`}
              >
                {content.deck.next}
              </button>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}

export function DeckFinished({ title, note }: { title: string; note: string }) {
  return (
    <div className="deck-enter mx-auto w-full max-w-[22ch]">
      <h2 className="text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
        {title}
      </h2>
      <p className="mt-5 max-w-[34ch] text-lg leading-snug opacity-70">
        {note}
      </p>
    </div>
  );
}

export const skins = skin;

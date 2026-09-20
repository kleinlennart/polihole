"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export type Variant = "polihole" | "politicize";

const skin = {
  polihole: {
    field: "bg-ballot text-white",
    quiet: "text-white/55",
    hairline: "border-white/25",
    control: "border-white/30 text-white hover:bg-white/10",
    primary: "bg-white text-ballot hover:bg-white/90",
    focus: "focus-visible:outline-white",
  },
  politicize: {
    field: "bg-riso text-black",
    quiet: "text-black/55",
    hairline: "border-black/25",
    control: "border-black/30 text-black hover:bg-black/10",
    primary: "bg-black text-riso hover:bg-black/85",
    focus: "focus-visible:outline-black",
  },
} as const;

export function CardShell({
  variant,
  title,
  index,
  total,
  done,
  onNext,
  onRestart,
  footer,
  children,
}: {
  variant: Variant;
  title: string;
  index: number;
  total: number;
  done: boolean;
  onNext: () => void;
  onRestart: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const s = skin[variant];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      // Let buttons handle their own Space/Enter.
      if ((e.target as HTMLElement)?.closest("button, a")) return;
      if (e.key === " " || e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        onNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, onNext]);

  return (
    <main
      className={`flex min-h-[100svh] flex-1 flex-col ${s.field} ${s.focus}`}
    >
      <header className="flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7">
        <Link
          href="/"
          className={`-ml-2 flex items-center gap-2 rounded-none px-2 py-1 text-sm font-medium ${s.quiet} transition-colors hover:text-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
        >
          <ArrowLeft aria-hidden className="size-4" />
          {title}
        </Link>
        <p className={`text-sm font-medium tabular-nums ${s.quiet}`}>
          {done ? total : Math.min(index + 1, total)}
          <span className="px-1">/</span>
          {total}
        </p>
      </header>

      <section
        onClick={done ? undefined : onNext}
        className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8"
      >
        {children}
      </section>

      <footer className="px-5 pb-5 sm:px-8 sm:pb-8">
        <div
          className={`flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between ${s.hairline}`}
        >
          <div className="order-2 min-h-6 sm:order-1">{footer}</div>
          {done ? (
            <button
              type="button"
              onClick={onRestart}
              className={`order-1 px-6 py-3 text-base font-semibold ${s.primary} transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:order-2`}
            >
              Shuffle and deal again
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className={`order-1 px-6 py-3 text-base font-semibold ${s.primary} transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:order-2`}
            >
              Next card
            </button>
          )}
        </div>
      </footer>
    </main>
  );
}

export function DeckFinished({ note }: { note: string }) {
  return (
    <div className="deck-enter mx-auto w-full max-w-[22ch]">
      <h2 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
        That&apos;s the whole deck.
      </h2>
      <p className="mt-5 max-w-[34ch] text-lg leading-snug opacity-70">
        {note}
      </p>
    </div>
  );
}

export const skins = skin;

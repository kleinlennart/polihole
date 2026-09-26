"use client";

import { useState } from "react";
import { CardShell, DeckFinished } from "@/components/card-shell";
import { content, fill } from "@/lib/content";
import { claimNumber, claims, type Claim } from "@/lib/decks";
import { flags } from "@/lib/flags";
import { useDeck } from "@/lib/use-deck";

const copy = content.polihole;

export default function PoliholePage() {
  const deck = useDeck<Claim>(claims, (c) => c.id, "polihole");
  const card = deck.current;

  return (
    <CardShell
      variant="polihole"
      title={copy.title}
      cardNumber={card ? claimNumber(card) : null}
      done={deck.done}
      canGoBack={deck.canGoBack}
      onNext={deck.next}
      onPrevious={deck.previous}
      onRestart={deck.restart}
      // Keyed by card, so both disclosures close themselves on the next card.
      footer={card ? <SourceNote key={card.id} source={card.source} /> : null}
    >
      {deck.done ? (
        <DeckFinished
          title={copy.finishedTitle}
          note={fill(copy.finishedNote, { count: deck.total })}
        />
      ) : card ? (
        <ClaimCard key={card.id} card={card} />
      ) : (
        <p className="sr-only">{content.deck.dealing}</p>
      )}
    </CardShell>
  );
}

function ClaimCard({ card }: { card: Claim }) {
  const [deeper, setDeeper] = useState(false);

  return (
    <div className="deck-enter mx-auto w-full max-w-4xl">
      {/* The svh ceiling only bites on a short viewport — a phone on its
          side, where a long claim would otherwise run off the bottom. */}
      <p className="text-[min(clamp(2.5rem,7vw,4.25rem),12svh)] leading-[1.04] font-extrabold tracking-[-0.02em] text-balance">
        {card.text}
      </p>

      {flags.pushFurther && card.followUp ? (
        deeper ? (
          <p className="deck-enter mt-7 max-w-[46ch] border-l-2 border-white/30 pl-4 text-[clamp(1.05rem,2.2vw,1.5rem)] leading-snug text-white/80">
            {card.followUp}
          </p>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeeper(true);
            }}
            className="mt-7 border border-white/30 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {copy.pushFurther}
          </button>
        )
      ) : null}

      {card.context ? <ContextNote context={card.context} /> : null}
    </div>
  );
}

function ContextNote({ context }: { context: string }) {
  const [shown, setShown] = useState(false);

  return (
    // Reading the note shouldn't turn the card: taps on it stay here instead
    // of reaching the tap halves. `w-fit` keeps the collapsed toggle from
    // swallowing taps across the whole row. The toggle waits three seconds
    // before it fades in, so the claim gets argued about before it gets
    // explained; the card's key restarts the wait on every card.
    <div
      onClick={(e) => e.stopPropagation()}
      className="delayed-reveal mt-7 w-fit max-w-[52ch]"
    >
      <button
        type="button"
        aria-expanded={shown}
        onClick={() => setShown((v) => !v)}
        className="text-sm font-medium text-white/55 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {copy.contextToggle}
      </button>
      {shown ? (
        <p className="deck-enter mt-3 border-l-2 border-white/30 pl-4 text-[clamp(1rem,1.8vw,1.2rem)] leading-snug text-white/80">
          {context}
        </p>
      ) : null}
    </div>
  );
}

function SourceNote({ source }: { source: string }) {
  const [shown, setShown] = useState(false);

  return (
    <p className="text-sm">
      <button
        type="button"
        aria-expanded={shown}
        onClick={() => setShown((v) => !v)}
        className="font-medium text-white/55 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {copy.sourceToggle}
      </button>
      {shown ? <span className="text-white/70"> {source}</span> : null}
    </p>
  );
}

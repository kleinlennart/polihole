"use client";

import { useState } from "react";
import { CardShell, DeckFinished } from "@/components/card-shell";
import { content, fill } from "@/lib/content";
import { claims, type Claim } from "@/lib/decks";
import { useDeck } from "@/lib/use-deck";

const copy = content.polihole;

export default function PoliholePage() {
  const deck = useDeck<Claim>(claims, (c) => c.id, "polihole");
  const card = deck.current;

  return (
    <CardShell
      variant="polihole"
      title={copy.title}
      index={deck.index}
      total={deck.total}
      done={deck.done}
      onNext={deck.next}
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
      <p className="text-balance text-[clamp(2rem,6.2vw,4.25rem)] font-extrabold leading-[1.04] tracking-[-0.02em]">
        {card.text}
      </p>

      {card.followUp ? (
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
    </div>
  );
}

function SourceNote({ source }: { source: string }) {
  const [shown, setShown] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        aria-expanded={shown}
        onClick={() => setShown((v) => !v)}
        className="self-start text-sm font-medium text-white/55 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {copy.sourceToggle}
      </button>
      {shown ? <p className="text-sm text-white/70">{source}</p> : null}
    </div>
  );
}

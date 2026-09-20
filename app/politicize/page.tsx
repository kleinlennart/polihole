"use client";

import { CardShell, DeckFinished } from "@/components/card-shell";
import { words, wordId, type Word } from "@/lib/decks";
import { useDeck } from "@/lib/use-deck";

export default function PoliticizePage() {
  const deck = useDeck<Word>(words, wordId, "politicize");
  const word = deck.current;

  return (
    <CardShell
      variant="politicize"
      title="Politicize This"
      index={deck.index}
      total={deck.total}
      done={deck.done}
      onNext={deck.next}
      onRestart={deck.restart}
      footer={
        word ? (
          <p className="text-sm text-black/55">No prompt. That&apos;s the game.</p>
        ) : null
      }
    >
      {deck.done ? (
        <DeckFinished note="Fifty-eight words, all of them political by the end. Shuffle for a new order." />
      ) : word ? (
        <div key={word} className="deck-enter mx-auto w-full max-w-4xl">
          <p className="text-[clamp(1rem,2.6vw,1.6rem)] font-medium leading-none text-black/60">
            The politics of
          </p>
          <p className="mt-2 text-balance text-[clamp(2.75rem,11vw,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">
            {word}
          </p>
        </div>
      ) : (
        <p className="sr-only">Dealing the deck</p>
      )}
    </CardShell>
  );
}

"use client";

import { CardShell, DeckFinished } from "@/components/card-shell";
import { content, fill } from "@/lib/content";
import { words, wordId, type Word } from "@/lib/decks";
import { useDeck } from "@/lib/use-deck";

const copy = content.politicize;

export default function PoliticizePage() {
  const deck = useDeck<Word>(words, wordId, "politicize");
  const word = deck.current;

  return (
    <CardShell
      variant="politicize"
      title={copy.title}
      index={deck.index}
      total={deck.total}
      done={deck.done}
      onNext={deck.next}
      onRestart={deck.restart}
      footer={
        word ? <p className="text-sm text-black/55">{copy.note}</p> : null
      }
    >
      {deck.done ? (
        <DeckFinished
          title={copy.finishedTitle}
          note={fill(copy.finishedNote, { count: deck.total })}
        />
      ) : word ? (
        <div key={word} className="deck-enter mx-auto w-full max-w-4xl">
          <p className="text-[clamp(1rem,2.6vw,1.6rem)] font-medium leading-none text-black/60">
            {copy.prefix}
          </p>
          <p className="mt-2 text-balance text-[clamp(2.75rem,11vw,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">
            {word}
          </p>
        </div>
      ) : (
        <p className="sr-only">{content.deck.dealing}</p>
      )}
    </CardShell>
  );
}

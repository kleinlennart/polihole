"use client";

import { useCallback } from "react";
import { CardShell, DeckFinished } from "@/components/card-shell";
import { content, fill } from "@/lib/content";
import { wordId, wordNumber, words, type Word } from "@/lib/decks";
import { useDeck } from "@/lib/use-deck";
import { formatTime, useTimer } from "@/lib/use-timer";

const copy = content.politicize;

const timerButton =
  "border border-black/35 px-5 py-2.5 text-base font-semibold transition-colors hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function PoliticizePage() {
  const deck = useDeck<Word>(words, wordId, "politicize");
  const timer = useTimer();
  const word = deck.current;

  // A new word is a new explanation, so any running countdown is cleared here
  // rather than in an effect — every route to another card comes through these.
  const { reset } = timer;
  const goNext = useCallback(() => {
    reset();
    deck.next();
  }, [reset, deck]);
  const goPrevious = useCallback(() => {
    reset();
    deck.previous();
  }, [reset, deck]);
  const restart = useCallback(() => {
    reset();
    deck.restart();
  }, [reset, deck]);

  return (
    <CardShell
      variant="politicize"
      title={copy.title}
      cardNumber={word ? wordNumber(word) : null}
      done={deck.done}
      flashing={timer.phase === "finished"}
      canGoBack={deck.canGoBack}
      onNext={goNext}
      onPrevious={goPrevious}
      onRestart={restart}
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
        <div className="mx-auto w-full max-w-4xl">
          {/* The prefix is outside the keyed element on purpose: it's the same
              on every card, so it shouldn't re-animate when the word changes. */}
          <p className="text-[clamp(1.375rem,3.4vw,2rem)] font-medium leading-none text-black/60">
            {copy.prefix}
          </p>
          <p
            key={word}
            className="deck-enter mt-3 text-balance text-[clamp(3.25rem,12vw,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]"
          >
            {word}
          </p>
          {/* Fixed height: the countdown replaces the buttons in place, so the
              word above it doesn't jump when the clock starts. Clicks here
              would otherwise reach the card and deal the next word. */}
          <div
            className="mt-8 flex h-[clamp(2.875rem,6vw,3.5rem)] items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {timer.remainingMs === null ? (
              copy.timerOptions.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => timer.start(seconds)}
                  className={timerButton}
                >
                  {fill(copy.timerStart, { seconds })}
                </button>
              ))
            ) : (
              <>
                <p
                  className={`text-[clamp(2.25rem,6vw,3.5rem)] font-extrabold leading-none tabular-nums tracking-[-0.02em] ${
                    timer.phase === "finished" ? "text-black" : "text-black/50"
                  }`}
                >
                  {formatTime(timer.remainingMs)}
                </p>
                {/* Nothing left to stop once it's up — the card returns by
                    itself when the flashing ends. */}
                {timer.phase === "running" ? (
                  <button
                    type="button"
                    onClick={timer.reset}
                    className={timerButton}
                  >
                    {copy.timerStop}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : (
        <p className="sr-only">{content.deck.dealing}</p>
      )}
    </CardShell>
  );
}

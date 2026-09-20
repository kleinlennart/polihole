// Data invariants for the decks. Run with `npm test` (node --test, no deps).
//
// The word bank is read off disk rather than through `lib/decks.ts` so the
// check stays a plain data test: no Next path aliases, no bundler, no build.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { normalizeWord } from "../scripts/dedupe-words.mjs";

const words = JSON.parse(
  readFileSync(new URL("../data/words.json", import.meta.url), "utf8"),
);

test("no duplicate words", () => {
  const firstSeenAt = new Map();
  const duplicates = [];

  words.forEach((word, index) => {
    const key = normalizeWord(word);
    const first = firstSeenAt.get(key);
    if (first === undefined) {
      firstSeenAt.set(key, index);
      return;
    }
    duplicates.push(
      `"${words[first]}" (#${first + 1}) and "${word}" (#${index + 1})`,
    );
  });

  assert.deepEqual(
    duplicates,
    [],
    `duplicate words in data/words.json: ${duplicates.join("; ")}`,
  );
});

test("no words padded with whitespace", () => {
  // A word card is keyed on its exact string (see wordNumber in lib/decks.ts),
  // so "Debt " is a second, identical-looking card rather than a duplicate.
  // `npm run dedupe:words -- --write` fixes both this and the check above.
  const padded = words.filter((word) => word !== word.trim());

  assert.deepEqual(
    padded,
    [],
    `words in data/words.json with leading or trailing whitespace: ${padded
      .map((word) => JSON.stringify(word))
      .join(", ")}`,
  );
});

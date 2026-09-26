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

const claims = JSON.parse(
  readFileSync(new URL("../data/claims.json", import.meta.url), "utf8"),
);

test("claim ids are unique and numbered", () => {
  // The card number is the digits in the id (claimNumber in lib/decks.ts), so
  // two ids with the same digits would print the same number.
  const seen = new Map();
  const clashes = [];

  for (const { id } of claims) {
    assert.match(id, /^c\d{3,}$/, `malformed claim id "${id}"`);
    const number = Number(id.slice(1));
    if (seen.has(number)) clashes.push(`${seen.get(number)} and ${id}`);
    else seen.set(number, id);
  }

  assert.deepEqual(clashes, [], `claim ids share a number: ${clashes.join("; ")}`);
});

test("claim context, where present, is non-empty text", () => {
  const bad = claims
    .filter((c) => "context" in c)
    .filter((c) => typeof c.context !== "string" || c.context.trim() === "")
    .map((c) => c.id);

  assert.deepEqual(bad, [], `claims with an empty context: ${bad.join(", ")}`);
});

test("claim tags are lists of words", () => {
  // A tag list written as a bare string would still be iterable, and quietly
  // become one tag per letter.
  const bad = claims
    .filter(
      (c) =>
        !Array.isArray(c.tags) ||
        !c.tags.every((t) => typeof t === "string" && /^[a-z][a-z-]+$/.test(t)),
    )
    .map((c) => c.id);

  assert.deepEqual(bad, [], `claims with malformed tags: ${bad.join(", ")}`);
});

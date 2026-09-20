// Fixes what tests/data.test.mjs complains about in data/words.json: trims
// padded entries and drops repeats, keeping the first spelling of each word.
//
// Dry run by default, because this edits card numbers: wordNumber() in
// lib/decks.ts is the word's place in the file, so removing #4 shifts every
// card after it down by one. Pass --write once the plan looks right.
//
// The duplicate rule lives here and the test imports it, so the fixer and the
// check can never disagree about what counts as the same word.

import { readFileSync, writeFileSync } from "node:fs";

const WORDS = new URL("../data/words.json", import.meta.url);

/** What two entries have to share to count as the same word. */
export const normalizeWord = (word) => word.trim().toLowerCase();

/**
 * What a fix would change, without changing it. `kept` is the deduped bank;
 * `trimmed` and `removed` carry enough to explain the edit on the way out.
 */
export function planDedupe(words) {
  const firstSeenAt = new Map();
  const kept = [];
  const trimmed = [];
  const removed = [];

  words.forEach((word, index) => {
    const key = normalizeWord(word);
    const first = firstSeenAt.get(key);

    if (first !== undefined) {
      removed.push({ word, index, keptWord: words[first], keptIndex: first });
      return;
    }

    firstSeenAt.set(key, index);
    if (word !== word.trim()) trimmed.push({ word, index });
    kept.push(word.trim());
  });

  return { kept, trimmed, removed };
}

if (import.meta.main) {
  const write = process.argv.includes("--write");
  const words = JSON.parse(readFileSync(WORDS, "utf8"));
  const { kept, trimmed, removed } = planDedupe(words);

  for (const { word, index } of trimmed) {
    console.log(`trim  #${index + 1} ${JSON.stringify(word)}`);
  }
  for (const { word, index, keptWord, keptIndex } of removed) {
    console.log(
      `drop  #${index + 1} "${word}" — already in the bank as "${keptWord}" (#${keptIndex + 1})`,
    );
  }

  if (!trimmed.length && !removed.length) {
    console.log(`words.json: ${words.length} words, nothing to fix`);
    process.exit(0);
  }

  if (!write) {
    console.log("\ndry run — re-run with --write to apply");
    process.exit(1);
  }

  writeFileSync(WORDS, JSON.stringify(kept, null, 2) + "\n");

  const firstDrop = removed[0];
  console.log(
    `\nwords.json: ${words.length} → ${kept.length} words` +
      (firstDrop ? `; cards after #${firstDrop.index + 1} are renumbered` : ""),
  );
}

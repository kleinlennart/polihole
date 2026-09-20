import Link from "next/link";
import { claims, words } from "@/lib/decks";

const decks = [
  {
    href: "/polihole",
    name: "Polihole",
    blurb: "A claim on every card. Agree, disagree, or stall convincingly.",
    count: `${claims.length} claims`,
    field: "bg-ballot text-white hover:bg-ballot-deep focus-visible:outline-ballot",
    quiet: "text-white/65",
  },
  {
    href: "/politicize",
    name: "Politicize This",
    blurb: "One word, no prompt. Make the case that it's political.",
    count: `${words.length} words`,
    field: "bg-riso text-black hover:bg-riso-deep focus-visible:outline-riso",
    quiet: "text-black/65",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-[100svh] flex-1 flex-col">
      <div className="px-5 py-7 sm:px-8 sm:py-9">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">Polihole</h1>
        <p className="mt-1 max-w-[42ch] text-base opacity-65">
          Two decks for starting arguments. Neither one settles anything.
        </p>
      </div>

      <div className="flex flex-1 flex-col sm:flex-row">
        {decks.map((deck) => (
          <Link
            key={deck.href}
            href={deck.href}
            className={`group flex flex-1 flex-col justify-end p-6 transition-colors sm:p-9 ${deck.field} focus-visible:outline focus-visible:-outline-offset-4 focus-visible:outline-2`}
          >
            <div>
              <p className={`mb-2 text-sm font-semibold tabular-nums ${deck.quiet}`}>
                {deck.count}
              </p>
              <h2 className="text-balance text-[clamp(2.25rem,7vw,4rem)] font-extrabold leading-[0.98] tracking-[-0.03em]">
                {deck.name}
              </h2>
              <p className={`mt-3 max-w-[30ch] text-lg leading-snug ${deck.quiet}`}>
                {deck.blurb}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

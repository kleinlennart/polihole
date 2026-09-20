import Link from "next/link";
import { GithubIcon } from "@/components/github-icon";
import { InstallPrompt } from "@/components/install-prompt";
import { QuoteHeader } from "@/components/quote-header";
import { content, fill } from "@/lib/content";
import { claims } from "@/lib/decks";

const { home, polihole, politicize } = content;

// The app and its first deck share a name, so the home screen shows the decks
// and nothing above them — the wordmark would read as a second Polihole.
const decks = [
  {
    href: "/deck",
    name: polihole.title,
    blurb: polihole.blurb,
    count: fill(polihole.count, { count: claims.length }),
    field: "bg-ballot text-white hover:bg-ballot-deep focus-visible:outline-ballot",
    quiet: "text-white/65",
  },
  {
    href: "/politicize",
    name: politicize.title,
    blurb: politicize.blurb,
    count: null,
    field: "bg-riso text-black hover:bg-riso-deep focus-visible:outline-riso",
    quiet: "text-black/65",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-[100svh] flex-1 flex-col">
      <header className="flex items-start justify-between gap-6 px-5 pt-6 pb-5 [--quote-leading:1.1] [--quote-size:clamp(1.4rem,3vw,2.1rem)] sm:px-8 sm:pt-8 sm:pb-6">
        <div>
          <QuoteHeader />
          <p className="mt-3 text-balance text-base leading-snug opacity-75 sm:text-lg">
            {home.tagline}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-4">
          <Link
            href="/about"
            className="text-sm font-semibold underline decoration-2 underline-offset-4 opacity-65 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-base"
          >
            {home.aboutLink}
          </Link>
          <a
            href={home.githubLink.url}
            target="_blank"
            rel="noreferrer"
            aria-label={home.githubLink.label}
            className="opacity-65 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <GithubIcon aria-hidden className="size-5" />
          </a>
        </span>
      </header>

      <InstallPrompt />

      <div className="flex flex-1 flex-col sm:flex-row">
        {decks.map((deck) => (
          <Link
            key={deck.href}
            href={deck.href}
            className={`group flex flex-1 flex-col justify-end p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-colors sm:p-9 sm:pb-[max(2.25rem,env(safe-area-inset-bottom))] ${deck.field} focus-visible:outline focus-visible:-outline-offset-4 focus-visible:outline-2`}
          >
            <div>
              {deck.count ? (
                <p className={`mb-2 text-sm font-semibold tabular-nums ${deck.quiet}`}>
                  {deck.count}
                </p>
              ) : null}
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

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { content } from "@/lib/content";
import { RichText } from "@/components/rich-text";

const copy = content.about;

export const metadata: Metadata = {
  title: `${copy.title} — ${content.app.name}`,
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[68ch] flex-1 px-5 py-6 sm:px-8 sm:py-8">
      <Link
        href="/"
        className="-ml-2 inline-flex items-center gap-2 px-2 py-1 text-sm font-medium opacity-60 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {copy.back}
      </Link>

      <h1 className="mt-10 text-[clamp(1.9rem,5vw,2.9rem)] leading-[1.1] font-extrabold tracking-[-0.025em] text-balance">
        {copy.intro}
      </h1>
      <p className="mt-4 text-xl leading-snug opacity-65">{copy.lead}</p>

      <div className="mt-12 flex flex-col gap-9">
        {copy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-extrabold tracking-[-0.01em]">
              {section.heading}
            </h2>
            <p className="mt-2 text-lg leading-relaxed opacity-75">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-14 border-t border-current/15 pt-6 text-base leading-relaxed opacity-70">
        <p>
          <RichText
            template={copy.credits}
            parts={Object.fromEntries(
              Object.entries(copy.links).map(([name, link]) => [
                name,
                <a
                  key={name}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[var(--link)] underline decoration-2 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {link.label}
                </a>,
              ]),
            )}
          />
        </p>
        <p className="mt-3">
          {copy.affiliation} {copy.disclaimer}
        </p>
      </div>
    </main>
  );
}

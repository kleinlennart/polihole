import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { content } from "@/lib/content";
import { RichText } from "@/components/rich-text";

const copy = content.about;

const linkClass =
  "font-semibold text-[var(--link)] underline decoration-2 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

/** Every link in `about.links`, ready to be dropped into a `{name}` slot. */
const linkParts = Object.fromEntries(
  Object.entries(copy.links).map(([name, link]) => [
    name,
    <a
      key={name}
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className={linkClass}
    >
      {link.label}
    </a>,
  ]),
);

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
      <p className="mt-3 text-xl leading-snug opacity-65">{copy.lead}</p>

      <div className="mt-12 flex flex-col gap-9">
        {copy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-extrabold tracking-[-0.01em]">
              {section.heading}
            </h2>
            <p className="mt-1 text-lg leading-relaxed opacity-75">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      {/* The two headings above name the decks; these describe the thing they
          come in. Same quiet label as Resources, so neither competes with a
          deck name. */}
      <section className="mt-12 border-t border-current/15 pt-7">
        <h2 className="text-sm font-semibold tracking-widest uppercase opacity-50">
          {copy.features.heading}
        </h2>
        <ul className="mt-4 flex flex-col gap-4">
          {copy.features.items.map((item) => (
            <li key={item.name} className="text-base leading-relaxed">
              <span className="font-semibold">{item.name}</span>
              <span className="opacity-70">
                {" — "}
                <RichText template={item.body} parts={linkParts} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Its own tier, not a fourth section: the headings above describe this
          app, these point away from it. The label is set quietly so the links
          themselves carry the block. */}
      <section className="mt-14 border-t border-current/15 pt-7">
        <h2 className="text-sm font-semibold tracking-widest uppercase opacity-50">
          {copy.resources.heading}
        </h2>
        <ul className="mt-3 flex flex-col gap-4">
          {copy.resources.items.map((item) => (
            <li key={item.url} className="text-lg leading-snug">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={linkClass}
              >
                {item.label}
              </a>
              <span className="mt-0.5 block text-base opacity-55">
                {item.note}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14 border-t border-current/15 pt-6 text-base leading-relaxed opacity-70">
        <p>
          <RichText template={copy.credits} parts={linkParts} />
        </p>
        <p className="mt-3">
          {copy.affiliation} {copy.disclaimer}
        </p>
      </div>
    </main>
  );
}

import { Fragment, type ReactNode } from "react";

/**
 * Renders a copy string with `{name}` placeholders swapped for real elements,
 * so a sentence with links in it stays one editable, translatable sentence in
 * `content/*.json` instead of being cut into fragments in the markup.
 */
export function RichText({
  template,
  parts,
}: {
  template: string;
  parts: Record<string, ReactNode>;
}) {
  return (
    <>
      {template.split(/(\{\w+\})/).map((chunk, i) => {
        const name = /^\{(\w+)\}$/.exec(chunk)?.[1];
        return name && name in parts ? (
          <Fragment key={i}>{parts[name]}</Fragment>
        ) : (
          chunk
        );
      })}
    </>
  );
}

import { Fragment } from "react";
import { highlightMatches } from "~/lib/highlight";

export function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query) return text;
  return highlightMatches(text, query).map((segment, index) =>
    segment.match ? (
      <mark key={index} className="bg-accent/25 text-inherit rounded-sm px-0.5">
        {segment.text}
      </mark>
    ) : (
      <Fragment key={index}>{segment.text}</Fragment>
    ),
  );
}

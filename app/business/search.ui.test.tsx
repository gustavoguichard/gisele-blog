import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { PostSearchResult } from "./search.ui";
import type { SearchResult } from "./search.server";

const result: SearchResult = {
  type: "post",
  id: "1",
  slug: "meditacao-vipassana",
  title: "Meditação Vipassana",
  featuredImage: null,
  publishedAt: new Date("2011-03-19T12:00:00Z"),
  snippet: "…a prática da meditação silenciosa…",
};

function renderResult(query: string) {
  const Stub = createRoutesStub([
    { path: "/", Component: () => <PostSearchResult result={result} query={query} /> },
  ]);
  return render(<Stub initialEntries={["/"]} />);
}

describe("PostSearchResult", () => {
  it("links to the post and shows the date and snippet", () => {
    renderResult("vipassana");
    expect(screen.getByRole("link")).toHaveAttribute("href", "/blog/meditacao-vipassana");
    expect(screen.getByText("19 de março de 2011")).toBeInTheDocument();
    expect(screen.getByText(/silenciosa/)).toBeInTheDocument();
  });

  it("highlights fuzzy matches in the title and snippet", () => {
    renderResult("medtação");
    const marks = screen.getAllByRole("mark").map((mark) => mark.textContent);
    expect(marks).toEqual(["Meditação", "meditação"]);
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { WorkCard } from "./works.ui";

const course = {
  slug: "taro-egipcio",
  title: "Tarô Egípcio",
  excerpt: "<p>Um sistema de conhecimento sobre o tarot.</p>",
  featuredImage: null,
};

function renderCard(query?: string) {
  const Stub = createRoutesStub([
    { path: "/", Component: () => <WorkCard course={course} query={query} /> },
  ]);
  return render(<Stub initialEntries={["/"]} />);
}

describe("WorkCard", () => {
  it("links to the work page", () => {
    renderCard();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/trabalhos/taro-egipcio");
    expect(screen.getByRole("heading", { name: "Tarô Egípcio" })).toBeInTheDocument();
    expect(screen.queryByRole("mark")).not.toBeInTheDocument();
  });

  it("highlights the query in the title and excerpt", () => {
    renderCard("taro");
    const marks = screen.getAllByRole("mark").map((mark) => mark.textContent);
    expect(marks).toEqual(["Tarô", "tarot"]);
  });
});

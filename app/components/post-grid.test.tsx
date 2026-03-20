import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { PostGrid } from "./post-grid";

function makePost(slug: string, title: string) {
  return {
    slug,
    title,
    excerpt: null,
    featuredImage: null,
    publishedAt: null,
  };
}

describe("PostGrid", () => {
  it("renders all posts", () => {
    render(
      <MemoryRouter>
        <PostGrid
          posts={[
            makePost("p1", "Post One"),
            makePost("p2", "Post Two"),
            makePost("p3", "Post Three"),
          ]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("Post One")).toBeInTheDocument();
    expect(screen.getByText("Post Two")).toBeInTheDocument();
    expect(screen.getByText("Post Three")).toBeInTheDocument();
  });

  it("renders correct number of post cards", () => {
    const { container } = render(
      <MemoryRouter>
        <PostGrid posts={[makePost("p1", "A"), makePost("p2", "B")]} />
      </MemoryRouter>,
    );
    const articles = container.querySelectorAll("article");
    expect(articles).toHaveLength(2);
  });

  it("renders empty grid for no posts", () => {
    const { container } = render(
      <MemoryRouter>
        <PostGrid posts={[]} />
      </MemoryRouter>,
    );
    const grid = container.querySelector(".grid");
    expect(grid?.children).toHaveLength(0);
  });
});

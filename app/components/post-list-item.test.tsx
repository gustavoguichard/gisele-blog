import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { PostListItem } from "./post-list-item";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("PostListItem", () => {
  const basePost = {
    slug: "test-post",
    title: "Test Post Title",
    excerpt: "<p>This is the excerpt</p>",
    featuredImage: "https://example.com/image.jpg",
    publishedAt: "2024-06-15T00:00:00Z",
  };

  it("renders the post title", () => {
    renderWithRouter(<PostListItem post={basePost} />);
    expect(screen.getByText("Test Post Title")).toBeInTheDocument();
  });

  it("links to the post slug under /blog by default", () => {
    renderWithRouter(<PostListItem post={basePost} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/blog/test-post");
  });

  it("links using custom basePath", () => {
    renderWithRouter(<PostListItem post={basePost} basePath="/cursos" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/cursos/test-post");
  });

  it("renders formatted date", () => {
    renderWithRouter(<PostListItem post={basePost} />);
    expect(screen.getByText(/junho/i)).toBeInTheDocument();
  });

  it("renders featured image", () => {
    renderWithRouter(<PostListItem post={basePost} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("renders placeholder when no featured image", () => {
    renderWithRouter(<PostListItem post={{ ...basePost, featuredImage: null }} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders stripped and truncated excerpt", () => {
    renderWithRouter(<PostListItem post={basePost} />);
    expect(screen.getByText("This is the excerpt")).toBeInTheDocument();
  });

  it("does not render excerpt when null", () => {
    renderWithRouter(<PostListItem post={{ ...basePost, excerpt: null }} />);
    expect(screen.queryByText("This is the excerpt")).not.toBeInTheDocument();
  });
});

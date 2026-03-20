import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { PostCard } from "./post-card";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("PostCard", () => {
  const basePost = {
    slug: "test-post",
    title: "Test Post Title",
    excerpt: "<p>This is the excerpt</p>",
    featuredImage: "https://example.com/image.jpg",
    publishedAt: "2024-06-15T00:00:00Z",
  };

  it("renders the post title", () => {
    renderWithRouter(<PostCard post={basePost} />);
    expect(screen.getByText("Test Post Title")).toBeInTheDocument();
  });

  it("links to the post slug", () => {
    renderWithRouter(<PostCard post={basePost} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/blog/test-post");
  });

  it("renders formatted date", () => {
    renderWithRouter(<PostCard post={basePost} />);
    expect(screen.getByText(/junho/i)).toBeInTheDocument();
  });

  it("renders stripped and truncated excerpt", () => {
    renderWithRouter(<PostCard post={basePost} />);
    expect(screen.getByText("This is the excerpt")).toBeInTheDocument();
  });

  it("renders featured image", () => {
    renderWithRouter(<PostCard post={basePost} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
    expect(img).toHaveAttribute("alt", "Test Post Title");
  });

  it("renders placeholder when no featured image", () => {
    renderWithRouter(<PostCard post={{ ...basePost, featuredImage: null }} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("does not render excerpt when null", () => {
    renderWithRouter(<PostCard post={{ ...basePost, excerpt: null }} />);
    expect(screen.queryByText("This is the excerpt")).not.toBeInTheDocument();
  });

  it("renders with null publishedAt", () => {
    renderWithRouter(<PostCard post={{ ...basePost, publishedAt: null }} />);
    expect(screen.getByText("Test Post Title")).toBeInTheDocument();
  });
});

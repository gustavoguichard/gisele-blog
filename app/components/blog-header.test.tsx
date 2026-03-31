import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { BlogHeader } from "./blog-header";

const tags = [
  { name: "Ayurveda", slug: "ayurveda", postCount: 10 },
  { name: "Saúde", slug: "saude", postCount: 5 },
];

function renderBlogHeader(props: Parameters<typeof BlogHeader>[0]) {
  return render(
    <MemoryRouter>
      <BlogHeader {...props} />
    </MemoryRouter>,
  );
}

describe("BlogHeader", () => {
  it("renders the title", () => {
    renderBlogHeader({ title: "Blog", tags: [] });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Blog");
  });

  it("renders subtitle when provided", () => {
    renderBlogHeader({ title: "Blog", subtitle: "Posts sobre Ayurveda", tags: [] });
    expect(screen.getByText("Posts sobre Ayurveda")).toBeInTheDocument();
  });

  it("does not render subtitle when omitted", () => {
    const { container } = renderBlogHeader({ title: "Blog", tags: [] });
    expect(container.querySelector("p.italic")).not.toBeInTheDocument();
  });

  it("always renders Todos link pointing to /blog", () => {
    renderBlogHeader({ title: "Blog", tags: [] });
    const link = screen.getByRole("link", { name: "Todos" });
    expect(link).toHaveAttribute("href", "/blog");
  });

  it("renders a nav link for each tag", () => {
    renderBlogHeader({ title: "Blog", tags });
    expect(screen.getByRole("link", { name: "Ayurveda" })).toHaveAttribute(
      "href",
      "/blog/tag/ayurveda",
    );
    expect(screen.getByRole("link", { name: "Saúde" })).toHaveAttribute("href", "/blog/tag/saude");
  });

  it("renders no tag links when tags array is empty", () => {
    renderBlogHeader({ title: "Blog", tags: [] });
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
  });
});

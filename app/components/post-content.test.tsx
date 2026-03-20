import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostContent } from "./post-content";

describe("PostContent", () => {
  it("renders HTML content", () => {
    render(<PostContent html="<p>Hello world</p>" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders nested HTML elements", () => {
    render(<PostContent html="<h2>Title</h2><p>Paragraph text</p>" />);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Paragraph text")).toBeInTheDocument();
  });

  it("applies prose styling classes", () => {
    const { container } = render(<PostContent html="<p>Test</p>" />);
    expect(container.firstChild).toHaveClass("prose");
    expect(container.firstChild).toHaveClass("prose-lg");
  });

  it("renders links within content", () => {
    render(<PostContent html='<a href="https://example.com">Click here</a>' />);
    const link = screen.getByText("Click here");
    expect(link.closest("a")).toHaveAttribute("href", "https://example.com");
  });
});

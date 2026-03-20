import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "./container";

describe("Container", () => {
  it("renders children", () => {
    render(<Container>Hello</Container>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders with default md size", () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild).toHaveClass("max-w-3xl");
  });

  it("renders with sm size", () => {
    const { container } = render(<Container size="sm">Content</Container>);
    expect(container.firstChild).toHaveClass("max-w-2xl");
  });

  it("renders with lg size", () => {
    const { container } = render(<Container size="lg">Content</Container>);
    expect(container.firstChild).toHaveClass("max-w-4xl");
  });

  it("renders with xl size", () => {
    const { container } = render(<Container size="xl">Content</Container>);
    expect(container.firstChild).toHaveClass("max-w-5xl");
  });

  it("renders as div by default", () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders with custom tag", () => {
    const { container } = render(<Container as="article">Content</Container>);
    expect(container.firstChild?.nodeName).toBe("ARTICLE");
  });

  it("renders as section", () => {
    const { container } = render(<Container as="section">Content</Container>);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  it("applies custom className", () => {
    const { container } = render(<Container className="py-12">Content</Container>);
    expect(container.firstChild).toHaveClass("py-12");
  });

  it("always includes base layout classes", () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild).toHaveClass("mx-auto");
    expect(container.firstChild).toHaveClass("px-4");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader, GoldBar, GoldDivider } from "./decorative";

describe("GoldBar", () => {
  it("renders with correct class", () => {
    const { container } = render(<GoldBar />);
    expect(container.firstChild).toHaveClass("gold-gradient-bar");
  });
});

describe("GoldDivider", () => {
  it("renders with correct class", () => {
    const { container } = render(<GoldDivider />);
    expect(container.firstChild).toHaveClass("gold-divider");
  });
});

describe("PageHeader", () => {
  it("renders title as h1 by default", () => {
    render(<PageHeader title="Blog" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Blog");
  });

  it("renders title as h2 when specified", () => {
    render(<PageHeader title="Blog" as="h2" />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<PageHeader title="Blog" label="Category" />);
    expect(screen.getByText(/Category/)).toBeInTheDocument();
  });

  it("does not render label when not provided", () => {
    const { container } = render(<PageHeader title="Blog" />);
    expect(container.querySelector(".section-label")).not.toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<PageHeader title="Blog" subtitle="All posts" />);
    expect(screen.getByText("All posts")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    render(<PageHeader title="Blog" />);
    expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();
  });

  it("applies correct heading size class for h1", () => {
    render(<PageHeader title="Blog" />);
    const heading = screen.getByRole("heading");
    expect(heading.className).toContain("text-3xl");
  });

  it("applies correct heading size class for h2", () => {
    render(<PageHeader title="Blog" as="h2" />);
    const heading = screen.getByRole("heading");
    expect(heading.className).toContain("text-2xl");
  });

  it("includes gold divider", () => {
    const { container } = render(<PageHeader title="Blog" />);
    expect(container.querySelector(".gold-divider")).toBeInTheDocument();
  });
});

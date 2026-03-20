import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tag, TagList } from "./tag";

describe("Tag", () => {
  it("renders children", () => {
    render(<Tag>Ayurveda</Tag>);
    expect(screen.getByText("Ayurveda")).toBeInTheDocument();
  });

  it("renders with styling", () => {
    const { container } = render(<Tag>Test</Tag>);
    expect(container.firstChild).toHaveClass("rounded");
  });
});

describe("TagList", () => {
  it("returns null for empty tags", () => {
    const { container } = render(<TagList tags={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders all tags", () => {
    const tags = [
      { id: "1", name: "Ayurveda" },
      { id: "2", name: "Saúde" },
      { id: "3", name: "Bem-estar" },
    ];
    render(<TagList tags={tags} />);
    expect(screen.getByText("Ayurveda")).toBeInTheDocument();
    expect(screen.getByText("Saúde")).toBeInTheDocument();
    expect(screen.getByText("Bem-estar")).toBeInTheDocument();
  });

  it("renders a single tag", () => {
    render(<TagList tags={[{ id: "1", name: "Solo" }]} />);
    expect(screen.getByText("Solo")).toBeInTheDocument();
  });
});
